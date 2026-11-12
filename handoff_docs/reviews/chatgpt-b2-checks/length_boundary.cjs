'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(process.argv[2]||'.');
const {JSDOM,VirtualConsole}=require(root+'/qa/runtime/node_modules/jsdom');
const context={flatPSD:true,bandwidthUnits:'MHz',restatementOnly:true};
const declared={mode:'3.1',total:'60',pmax:'68',context:{actualSimultaneousTotal:true,measurementPlane:'cm-f-connector',comparableReference:true,mtcEnabled:true}};
const artifacts={source:null,standalone:'outputs/Night_Sweep.html',pwa:'dist/index.html'};
let count=0;const failed=[],rows=[];
function check(name,fn){count++;try{fn();rows.push({name,pass:true})}catch(e){failed.push(name+': '+e.message);rows.push({name,pass:false,error:e.message})}}
(async()=>{
for(const [artifact,file]of Object.entries(artifacts)){
 const src=file?fs.readFileSync(path.join(root,file),'utf8'):fs.readFileSync(path.join(root,'night-sweep/field-calcs.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'night-sweep/docsis-health.js'),'utf8');
 const a=src.indexOf('const FieldCalc=(()=>{'),b=src.indexOf('const FieldCalcs=(()=>{',a),c=src.indexOf('const DocsisHealth=(()=>{'),healthEnd=src.indexOf('const DocsisHealthUI=(()=>{',c),s={};
 vm.createContext(s);vm.runInContext(src.slice(a,b)+'\n'+src.slice(c,healthEnd)+'\nglobalThis.fc=FieldCalc;globalThis.dh=DocsisHealth;',s);
 const fc=s.fc,dh=s.dh,reference=JSON.stringify(fc.ofdmPower('48','1.6','6.4',context));
 for(const n of [50,51,128]){
  const p='0'.repeat(n-2)+'48',a='0'.repeat(n-3)+'1.6',b='0'.repeat(n-3)+'6.4';
  for(const [field,args]of [['level',[p,'1.6','6.4']],['basis',['48',a,'6.4']],['width',['48','1.6',b]]])check(artifact+' converter '+field+' length'+n,()=>assert.equal(JSON.stringify(fc.ofdmPower(...args,context)),reference));
 }
 for(const field of ['total','pmax']){
  const ending=field==='total'?'60':'68';
  check(artifact+' existing upstream '+field+' length50 accepts',()=>assert.equal(dh.upstream({...declared,[field]:'0'.repeat(48)+ending}).compositeMargin,8));
  check(artifact+' existing upstream '+field+' length51 refuses',()=>{const r=dh.upstream({...declared,[field]:'0'.repeat(49)+ending});assert.equal(r.ok,false);assert.equal(r.compositeMargin,undefined);assert.deepEqual(Object.keys(r).sort(),['error','ok']);});
 }
 for(const value of [true,'0x30','48abc','1e'])check(artifact+' malformed still refuses '+String(value),()=>assert.equal(fc.ofdmPower(value,'1.6','6.4',context).ok,false));
 for(const basis of ['1.6','6','6.4','24'])check(artifact+' absent context still refuses basis'+basis,()=>assert.equal(fc.ofdmPower('48',basis,'24').ok,false));
 for(const args of [['200.000001','24','24'],['-200.000001','1.6','1.6'],['48','1.6','2001'],['48','0','6.4']])check(artifact+' numeric envelope still refuses '+args.join('/'),()=>assert.equal(fc.ofdmPower(...args,context).ok,false));
 const html=file?src:require(root+'/qa/build2-source-harness.cjs').assembleHtml();
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://b2-length.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};}});
 await new Promise(r=>setImmediate(r));const w=dom.window,d=dom.window.document;
 check(artifact+' actual Unknown bound registration contains50',()=>{const r=JSON.parse(w.eval("JSON.stringify(Thresholds.get('docsis.us.softwareBounds'))"));assert.equal(r.label,'unknown');assert.match(r.conditions,/50 UTF-16 code units/)});
 w.eval("WorkflowUI.go('docsisHealth')");
 check(artifact+' real bound consumer opens50policy',()=>{const tag=d.querySelector('[data-health-card="upstream"] [data-threshold="docsis.us.softwareBounds"]');assert(tag);tag.click();assert(w.eval('Thresholds.isOpen()'));assert.match(d.querySelector('dialog.source-sheet').textContent,/50 UTF-16 code units/)});
 check(artifact+' no source dialog runtimeerrors',()=>assert.deepEqual(errors,[]));dom.window.close();
}
fs.writeFileSync(path.join(__dirname,'length-boundary-results.json'),JSON.stringify({checks:count,failures:failed,rows},null,2)+'\n');
for(const e of failed)console.log('FAIL '+e);
console.log(`B2 corrected length policy: ${count} checks; 3 artifacts; ${failed.length} failures`);process.exitCode=failed.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
