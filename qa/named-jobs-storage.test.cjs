/* Browser-local job corruption/capacity regressions. Synthetic DOM/IndexedDB only. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const source=path.resolve(__dirname,'../night-sweep'),instances=[],cases=[];
// Assemble current source in memory: running this suite never changes release builds.
let html=fs.readFileSync(path.join(source,'shell.html'),'utf8');
for(const [,token,file] of fs.readFileSync(path.join(source,'build.py'),'utf8').matchAll(/\('([^']*<!--[^']*-->)', '([^']+)'\)/g)){
 let data=fs.readFileSync(path.join(source,file),'utf8');
 if(file==='catalog.json'){const cat=JSON.parse(data);cat.setupManuals=JSON.parse(fs.readFileSync(path.join(source,'setup-manuals.json'),'utf8'));data=JSON.stringify(cat);}
 html=html.split(token).join(data);
}
html=html.replace('<!--DSIMPILOTCODES-->',fs.readFileSync(path.join(source,'dsim-pilot-codes.js'),'utf8'));
const key='hfc-named-jobs-v1',copy=x=>JSON.parse(JSON.stringify(x));
const snapshot=(name='Synthetic working job')=>({version:1,example:false,setup:{},rows:[],job:{name}});
const entry=i=>({id:'job_'+i,name:'Synthetic job '+i,snapshot:snapshot('Synthetic job '+i)});
const library=n=>({version:1,activeId:null,jobs:Array.from({length:n},(_,i)=>entry(i))});
function boot(saved,working=snapshot()){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const raw=typeof saved==='string'?saved:JSON.stringify(saved);
 const dom=new JSDOM(html,{url:'https://named-jobs.nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};w.confirm=()=>true;w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  if(saved!==undefined)w.localStorage.setItem(key,raw);w.localStorage.setItem('hfc-route-v1',JSON.stringify(working));
 }});instances.push(dom);const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
 return {w,d,ev,json,errors,raw,stored:()=>w.localStorage.getItem(key)};
}
async function check(label,fn){await fn();cases.push(label);console.log('PASS '+label);}
(async()=>{
 await check('Unreadable JSON, duplicate IDs and oversized lists stay intact and block named-job changes',async()=>{
  const duplicate=library(2);duplicate.jobs[1].id=duplicate.jobs[0].id;
  for(const value of ['{broken named jobs',duplicate,library(1001)]){
   const h=boot(value),before=h.ev('JSON.stringify(state)');
   assert.match(h.d.getElementById('jobsStatus').textContent,/could not be read/i);
   assert.throws(()=>h.ev('JobsUI.saveNamed()'),/could not be read|invalid entry/);
   await assert.rejects(h.ev('JobsUI.newJob()'),/could not be read|invalid entry/);
   assert.equal(h.stored(),h.raw);assert.equal(h.ev('JSON.stringify(state)'),before);assert.deepEqual(h.errors,[]);h.w.close();
  }
 });
 await check('Invalid nested snapshots cannot replace current work or rewrite the stored list',async()=>{
  for(const change of [s=>{s.rows=[null];},s=>{s.evidence=[{}];}]){
   const saved=library(1);change(saved.jobs[0].snapshot);const h=boot(saved),before=h.ev('JSON.stringify(state)');
   await assert.rejects(h.ev('JobsUI.open("job_0")'),/Invalid/);
   assert.equal(h.stored(),h.raw);assert.equal(h.ev('JSON.stringify(state)'),before);assert.deepEqual(h.errors,[]);h.w.close();
  }
 });
 await check('Corrupt saved-job evidence stops cleanup before any original bytes are deleted',async()=>{
  const h=boot(library(0));h.ev('state.job={name:"Synthetic original"};state.example=false');
  const bytes=new Uint8Array([80,75,3,4,0,128,255]),file={name:'synthetic-original.zip',size:bytes.length,type:'application/zip',arrayBuffer:async()=>bytes.slice().buffer};
  await h.ev('EvidenceUI').importFiles([file],{kind:'Sweep',stage:'Reference',asset:'Synthetic',notes:''});h.ev('JobsUI.saveNamed()');
  const saved=JSON.parse(h.stored()),original=copy(saved.jobs[0].snapshot);h.ev('loadState('+JSON.stringify(snapshot('Other synthetic work'))+')');
  assert.equal(await h.ev('EvidenceUI.cleanupUnused()'),0,'Valid named-job references retain originals even while another job is open');
  for(const damage of [s=>{delete s.evidence[0].id;},s=>{s.evidence=null;},s=>{s.evidence=false;}]){
   const broken=copy(saved);damage(broken.jobs[0].snapshot);const corrupt=JSON.stringify(broken);h.w.localStorage.setItem(key,corrupt);
   const before=h.ev('JSON.stringify(state)');await assert.rejects(h.ev('EvidenceUI.cleanupUnused()'),/evidence/i);
   assert.equal(h.stored(),corrupt);assert.equal(h.ev('JSON.stringify(state)'),before);assert.equal(h.ev('EvidenceUI.isBusy()'),false);
   const restored=await h.w.evidenceExportProject(original);assert.deepEqual([...h.w.EvidenceCore.base64ToBytes(restored.evidenceFiles[0].base64)],[...bytes]);
  }
  assert.deepEqual(h.errors,[]);h.w.close();
 });
 await check('The 1,000th job is accepted and existing named jobs can still update and open at capacity',async()=>{
  const h=boot(library(999)),id=h.ev('JobsUI.saveNamed()');assert.equal(JSON.parse(h.stored()).jobs.length,1000);
  h.ev('state.job.name="Updated at capacity";saveLocal()');assert.equal(JSON.parse(h.stored()).jobs.find(j=>j.id===id).name,'Updated at capacity');
  await h.ev('JobsUI.open("job_0")');assert.equal(h.ev('state.job.id'),'job_0');assert.equal(JSON.parse(h.stored()).jobs.length,1000);
  h.ev('state.job.name="Saved at capacity";JobsUI.saveNamed()');assert.equal(JSON.parse(h.stored()).jobs[0].name,'Saved at capacity');
  assert.deepEqual(h.errors,[]);h.w.close();
 });
 await check('Full lists reject additions and switches needing an archive slot without replacing working or saved jobs',async()=>{
  const h=boot(library(1000)),before=h.ev('JSON.stringify(state)'),raw=h.stored();
  assert.throws(()=>h.ev('JobsUI.saveNamed()'),/list is full/);assert.throws(()=>h.ev('JobsUI.duplicate("job_0")'),/list is full/);
  await assert.rejects(h.ev('JobsUI.newJob()'),/list is full/);await assert.rejects(h.ev('JobsUI.open("job_0")'),/list is full/);
  await assert.rejects(h.w.NightSweep.openProject(JSON.stringify(snapshot('Imported synthetic job'))),/list is full/);
  assert.equal(h.ev('JSON.stringify(state)'),before);assert.equal(h.stored(),raw);assert.deepEqual(h.errors,[]);h.w.close();
 });
 console.log('Named jobs storage: '+cases.length+' checks passed');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{for(const dom of instances)dom.window.close();});
