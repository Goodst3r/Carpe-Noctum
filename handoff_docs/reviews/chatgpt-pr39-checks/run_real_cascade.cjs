'use strict';
// Input forwarding and output-key aliases only. No formula/reference replacement.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]||'/workspace/Carpe-Noctum-pr39'),out=path.resolve(process.argv[3]||__dirname);
const {JSDOM,VirtualConsole}=require(path.join(root,'qa/runtime/node_modules/jsdom'));
const inputPath=path.join(__dirname,'cascade-raw-cases.json'),cases=JSON.parse(fs.readFileSync(inputPath,'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const head=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),statusBefore=cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});
const receipt=JSON.parse(fs.readFileSync(path.join(__dirname,'cascade-reference-receipt.json'),'utf8'));
const aliases={thermal_floor_dBmV:'thermal_noise_dBmV',single_CNR_dB:'single_CNR_dB',equal_contributions_CNR_dB:'equal_chain_CNR_dB',combined_CNR_dB:'combined_CNR_dB'};
const results={head_sha:head,reference_sha256:receipt.reference_sha256,artifacts:{},artifact_hashes:{},runtime_errors:{},status_before:statusBefore};
function collect(call){const rows={};for(const c of cases){const raw=call(c.inputs),r={ok:raw.ok,raw_result:raw};if(raw.ok){r.outputs={};for(const [a,b]of Object.entries(aliases))if(Object.hasOwn(raw,a))r.outputs[b]=raw[a];}else r.error=raw.error;rows[c.id]=r;}return rows;}
const sourcePath=path.join(root,'night-sweep/field-calcs.js'),source=fs.readFileSync(sourcePath,'utf8');
const split=source.indexOf('\nconst FieldCalcs=');if(split<0)throw Error('Cannot find actual FieldCalc/FieldCalcs source boundary');
const ctx=vm.createContext({});vm.runInContext(source.slice(0,split),ctx,{filename:sourcePath});
results.artifacts.source=collect(input=>JSON.parse(vm.runInContext('JSON.stringify(FieldCalc.cascade('+JSON.stringify(input)+'))',ctx)));
results.artifact_hashes.source=hash(sourcePath);results.runtime_errors.source=[];
for(const [kind,name]of [['standalone','outputs/Night_Sweep.html'],['pwa','dist/index.html']]){
 const file=path.join(root,name),errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e.message)));
 const dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;}});
 results.artifacts[kind]=collect(input=>JSON.parse(dom.window.eval('JSON.stringify(FieldCalc.cascade('+JSON.stringify(input)+'))')));
 results.artifact_hashes[kind]=hash(file);results.runtime_errors[kind]=errors;dom.window.close();
}
results.head_after=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();results.status_after=cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'actual-results-initial.json'),JSON.stringify(results,null,2)+'\n');
let checked=0;for(const [artifact,rows]of Object.entries(results.artifacts)){for(const [id,r]of Object.entries(rows)){const keys=Object.keys(r.raw_result).sort();if(r.ok!==true&&r.ok!==false)throw Error(artifact+' '+id+' missing boolean status');if(!r.ok&&keys.join(',')!=='error,ok')throw Error(artifact+' '+id+' refused raw object leaks output');checked++;}if(results.runtime_errors[artifact].length)throw Error(artifact+' runtime errors: '+results.runtime_errors[artifact]);}
if(results.head_after!==head||results.status_after!==statusBefore||statusBefore)throw Error('Pin/status changed or dirty');
console.log(`Actual cascade forwarding: ${checked} real calls across source/standalone/PWA; zero runtime errors; clean exact ${head}.`);
