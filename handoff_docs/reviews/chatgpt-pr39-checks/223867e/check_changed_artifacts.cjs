'use strict';
// Changed-artifact identity and actual source-sheet metadata capture only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root='/workspace/Carpe-Noctum-pr39',out='/workspace/scratch/pr39-223-recheck',old='59ddf48986f9498b574fc1cb67081f3eb0df7dee',pin='223867e3d495a1375c4374c4ba4b008c0ef29112';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
const prefix=s=>{const start=s.indexOf('const FieldCalc=(()=>{'),end=s.indexOf('\nconst FieldCalcs=',start);if(start<0||end<0)throw Error('Missing actual calculator prefix');return s.slice(start,end);};
const oldSource=git('show',old+':night-sweep/field-calcs.js'),newSource=fs.readFileSync(path.join(root,'night-sweep/field-calcs.js'),'utf8');
const r={head_before:git('rev-parse','HEAD').trim(),comparison_head:old,identity:[],artifacts:{},runtime_errors:{}};if(r.head_before!==pin)throw Error('Pin mismatch');
r.identity.push({name:'whole FieldCalc source unchanged59→223',pass:oldSource===newSource,old_sha256:hash(oldSource),new_sha256:hash(newSource)});
const oldPrefix=prefix(oldSource);r.identity.push({name:'source calculator prefix unchanged59→223',pass:prefix(newSource)===oldPrefix,sha256:hash(oldPrefix)});
const {JSDOM,VirtualConsole}=require(path.join(root,'qa/runtime/node_modules/jsdom'));
for(const [artifact,file]of [['standalone','outputs/Night_Sweep.html'],['pwa','dist/index.html']]){
 const html=fs.readFileSync(path.join(root,file),'utf8'),prior=git('show',old+':'+file),actualPrefix=prefix(html),priorPrefix=prefix(prior);
 r.identity.push({name:artifact+' rebuilt calculator prefix equals old embedded actual prefix',pass:actualPrefix===priorPrefix,old_sha256:hash(priorPrefix),new_sha256:hash(actualPrefix)});
 r.identity.push({name:artifact+' actual embedded prefix equals current source prefix',pass:actualPrefix===prefix(newSource),sha256:hash(actualPrefix)});
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;}});const w=dom.window;
 const rows=JSON.parse(w.eval("JSON.stringify(Thresholds.rows.filter(r=>r.id.startsWith('calc.cascade.')||r.id.startsWith('const.cascade.')))"));
 const specK=JSON.parse(w.eval("JSON.stringify(Thresholds.rows.filter(r=>r.label==='spec'&&r.value===1.380649e-23))"));
 const specT=JSON.parse(w.eval("JSON.stringify(Thresholds.rows.filter(r=>r.label==='spec'&&r.value===290))"));
 w.eval("Thresholds.open('calc.cascade.cnr')");const dialog=w.document.querySelector('dialog.source-sheet[open]');if(!dialog)throw Error('No actual open source sheet');
 const text=dialog.textContent,details=Object.fromEntries([...dialog.querySelectorAll('.source-details>div')].map(e=>[e.querySelector('dt').textContent,e.querySelector('dd').textContent]));
 r.artifacts[artifact]={html_sha256:hash(html),rows,specK,specT,actual_source_sheet_text:text,details,known_finding_presence:{units_only_dB:details.Units==='dB',floor_dBmV_absent:!text.includes('dBmV'),exact_k_absent:!(/1\.380649/.test(text)),spec_k_or_T0_rows_absent:specK.length===0&&specT.length===0}};
 r.runtime_errors[artifact]=errors;dom.window.close();
}
r.head_after=git('rev-parse','HEAD').trim();r.status_after=git('status','--porcelain');fs.writeFileSync(path.join(out,'changed-artifacts.json'),JSON.stringify(r,null,2)+'\n');
for(const x of r.identity)console.log((x.pass?'PASS ':'FAIL ')+x.name+' '+JSON.stringify(x));
for(const [artifact,x]of Object.entries(r.artifacts)){console.log(artifact+' actual rows: '+x.rows.map(y=>y.id+':'+y.label).join(','));console.log(artifact+' actual SourceSheet: '+JSON.stringify({units:x.details.Units,usedBy:x.details['Used by'],presence:x.known_finding_presence,specK:x.specK,specT:x.specT}));}
console.log('Actual source-sheet metadata diagnostic: defect content remains on both rebuilt artifacts; this is not an approval.');
if(r.identity.some(x=>!x.pass)||Object.values(r.runtime_errors).some(x=>x.length)||r.head_after!==pin||r.status_after)process.exitCode=1;
