/* Build 2 frontend calculation batching and public import limits; current source in memory. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..'),src=path.join(root,'night-sweep'),errors=[],cases=[];
let html=fs.readFileSync(path.join(src,'shell.html'),'utf8');
for(const [,token,name] of fs.readFileSync(path.join(src,'build.py'),'utf8').matchAll(/\('([^']*<!--[^']*-->)', '([^']+)'\)/g)){
 let data=fs.readFileSync(path.join(src,name),'utf8');if(name==='catalog.json'){const c=JSON.parse(data);c.setupManuals=JSON.parse(fs.readFileSync(path.join(src,'setup-manuals.json'),'utf8'));data=JSON.stringify(c);}html=html.split(token).join(data);
}
html=html.replace('<!--DSIMPILOTCODES-->',fs.readFileSync(path.join(src,'dsim-pilot-codes.js'),'utf8'));
if(process.env.NIGHTSWEEP_RELEASE_TEST==='1')html=fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8');
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://build2-frontend.nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
 w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
}});const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')')),flush=()=>new Promise(r=>setImmediate(r));
const fresh=()=>ev('loadState(TrainingJob.makeState());WorkflowUI.go("route")');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
async function check(name,fn){await fn();await flush();cases.push(name);console.log('PASS '+name);}
(async()=>{
 await check('A hidden sweep chart does not recalculate its grid during a route edit',()=>{
  fresh();ev('drawChart();window.beforeGraph=graphCache;state.rows[0].length=801;refreshResults()');assert.equal(ev('graphCache===window.beforeGraph'),true);
 });
 await check('One refresh reuses each numeric frequency while preserving corrected source outputs',()=>{
  fresh();ev('window.runFrequencies=[];window.originalRun=HFC.run;HFC.run=function(s,c,f){window.runFrequencies.push(f);return window.originalRun(s,c,f)};refreshResults();HFC.run=window.originalRun');
  const f=json('window.runFrequencies');assert(f.length<=12,'Repeated route evaluations: '+f.length);assert.equal(f.filter(x=>x===54).length,1);assert.equal(f.filter(x=>x===860).length,1);
  near(ev('evaluate(54).source'),31);near(ev('evaluate(860).source'),43);
 });
 await check('An input edit starts a fresh calculation batch rather than keeping stale predictions',()=>{
  fresh();const before=ev('evaluate(54).results[0].outputs[0].level');const input=d.querySelector('[data-row="r1"] [data-field="gainLow"]');input.value=String(Number(input.value)+2);input.dispatchEvent(new w.Event('input',{bubbles:true}));near(ev('evaluate(54).results[0].outputs[0].level'),before+2);assert.match(d.getElementById('math-r1').textContent,/Signal calculation/);
 });
 await check('TP correction changes and project replacement do not inherit prior batch results',()=>{
  fresh();ev('state.setup.launchCoupling=0;refreshResults()');near(ev('evaluate(54).source'),11);
  ev('loadState(TrainingJob.makePractice("custom-curves"));refreshResults()');near(ev('evaluate(261).source'),34);assert.equal(ev('state.setup.launchMode'),'table');
 });
 await check('Opening Sweep and preparing print render the current chart after hidden edits',async()=>{
  fresh();ev('drawChart();window.beforeGraph=graphCache;state.setup.lowLevel=12;refreshResults();WorkflowUI.go("sweep")');await new Promise(r=>w.requestAnimationFrame(r));assert.equal(ev('graphCache===window.beforeGraph'),false);near(ev('graphCache.find(x=>x.f===54).result.source'),32);
  ev('WorkflowUI.go("route");state.setup.lowLevel=13;refreshResults();NightSweep.preparePrint()');near(ev('graphCache.find(x=>x.f===54).result.source'),33);ev('NightSweep.restorePrint()');
 });
 await check('An interrupted refresh releases its batch and later input changes remain fresh',()=>{
  fresh();ev('window.originalRun=HFC.run;HFC.run=()=>{throw Error("Synthetic interrupted calculation")};');assert.throws(()=>ev('refreshResults()'),/Synthetic interrupted/);ev('HFC.run=window.originalRun;state.setup.lowLevel=15;refreshResults()');near(ev('evaluate(54).source'),35);
 });
 await check('Disconnected feed checking respects earlier ports and leaves orphan branches disconnected',()=>{
  fresh();ev('state.rows=[{id:"r1",parent:"r2::through",device:"none",length:0,cable:"p3_625"},{id:"r2",parent:"source",device:"none",length:0,cable:"p3_625"},{id:"r3",parent:"r1::through",device:"none",length:0,cable:"p3_625"}];renderAll();WorkflowUI.go("route")');assert.match(d.getElementById('routeFeedWarning').textContent,/1 disconnected feed/);assert.equal(ev('evaluate(54).results[0].input.level'),null);assert.equal(ev('evaluate(54).results[2].input.level'),null);
 });
 await check('The public project text API enforces its 20 MiB UTF-8 limit before changing work',async()=>{
  fresh();const before=ev('JSON.stringify(state)'),stored=w.localStorage.getItem('hfc-route-v1'),named=w.localStorage.getItem('hfc-named-jobs-v1');
  const oversized=JSON.stringify({version:1,setup:{},rows:[],customJobMetadata:'é'.repeat(10*1024*1024)});assert(oversized.length<20*1024*1024);assert(Buffer.byteLength(oversized)>20*1024*1024);
  await assert.rejects(()=>w.NightSweep.openProject(oversized),/20 MiB/);assert.equal(ev('JSON.stringify(state)'),before);assert.equal(w.localStorage.getItem('hfc-route-v1'),stored);assert.equal(w.localStorage.getItem('hfc-named-jobs-v1'),named);
 });
 await check('Exactly 20 MiB of valid project text remains importable',async()=>{
  const prefix=JSON.stringify({version:1,setup:{},rows:[]}),text=prefix+' '.repeat(20*1024*1024-prefix.length);assert.equal(Buffer.byteLength(text),20*1024*1024);
  await w.NightSweep.openProject(text);assert.equal(ev('state.version'),1);assert.equal(ev('state.rows.length'),0);
 });
 await check('Non-text public imports reject before replacing the working job',async()=>{
  const before=ev('JSON.stringify(state)');await assert.rejects(()=>w.NightSweep.openProject({version:1,setup:{},rows:[]}),/JSON text/);assert.equal(ev('JSON.stringify(state)'),before);
 });
 assert.deepEqual(errors,[]);console.log('Build2 frontend: '+cases.length+' checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>dom.window.close());
