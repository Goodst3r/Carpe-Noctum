/* Actual 1.6 migration preservation plus the current 1.8 portable training example. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');process.chdir(root);const cases=[],instances=[];
function applicationHtml(file){
 let html=fs.readFileSync(file,'utf8');
 if(process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST!=='1'||path.resolve(file)!==path.join(root,'outputs/Night_Sweep.html'))return html;
 // Preserve historical release fixtures byte-for-byte. A source-only run overlays
 // the changed current modules in memory and never rewrites release artifacts.
 for(const [name,startMarker,endMarker] of [['training.js','/* Offline synthetic practice job.','function initTraining(){TrainingJob.init();}'],['sweep-setup.js','/* 2.0 Alpha build 3 guided field setup.',"if(typeof module!=='undefined'&&module.exports)module.exports=SweepSetup;"]]){
  const start=html.indexOf(startMarker),end=html.indexOf(endMarker,start);assert(start>=0&&end>start,'Could not isolate '+name+' for source-only integration.');
  html=html.slice(0,start)+fs.readFileSync(path.join(root,'night-sweep',name),'utf8')+html.slice(end+endMarker.length);
 }
 return html;
}
function boot(file='outputs/Night_Sweep.html',options={}){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const db=options.db||new FDB.IDBFactory();
 const dom=new JSDOM(applicationHtml(file),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=db;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  for(const [key,value] of Object.entries(options.storage||{}))w.localStorage.setItem(key,value);
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});instances.push({dom,errors});const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
 return {w,d,ev,json,db,errors,downloads,storage:()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return[k,w.localStorage.getItem(k)];}))};
}
const flush=()=>new Promise(r=>setImmediate(r));
async function settle(h){for(let i=0;i<4;i++)await flush();const end=Date.now()+5000;while(h.w.evidenceIsBusy?.()&&Date.now()<end)await flush();assert(!h.w.evidenceIsBusy?.(),'evidence operation timeout');}
async function check(name,fn){await fn();for(const h of instances)assert.deepEqual(h.errors,[], 'No uncaught app errors');cases.push(name);console.log('PASS '+name);}
function set(h,selector,value,event='input'){const el=h.d.querySelector(selector);assert(el,selector);if(el.type==='checkbox')el.checked=!!value;else el.value=value;el.dispatchEvent(new h.w.Event(event,{bubbles:true}));return el;}
function click(h,selector){const el=h.d.querySelector(selector);assert(el,selector);el.click();return el;}
function visible(el){for(let p=el;p?.nodeType===1;p=p.parentElement){if(p.hidden||p.ownerDocument.defaultView.getComputedStyle(p).display==='none')return false;if(p.tagName==='DETAILS'&&!p.open&&p!==el&&!p.querySelector(':scope > summary')?.contains(el))return false;}return !!el;}
const evidenceFile=(name,bytes,type)=>({name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer});
function near(actual,expected){assert(Number.isFinite(actual));assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);}
const preservedKeys=['setup','rows','power','project','node','frequency','routeTools','fieldWork','fieldReferences','job','customJobMetadata'];
function assertPreserved(h,bundle){for(const key of preservedKeys)if(key!=='rows'&&bundle[key]!==undefined)assert.deepEqual(h.json('state['+JSON.stringify(key)+']'),bundle[key],key);const rows=h.json('state.rows');assert.equal(rows.length,bundle.rows.length);bundle.rows.forEach((row,i)=>{for(const [key,value] of Object.entries(row))assert.deepEqual(rows[i][key],value,'rows['+i+'].'+key);});}
const calc=`({low:evaluate(261).results.map(r=>r.outputs.map(p=>p.level)),high:evaluate(993).results.map(r=>r.outputs.map(p=>p.level)),route:HFC.routeDistances(state,catalog).rows.map(r=>[r.start,r.end])})`;
(async()=>{
const old=boot('qa/fixtures/alpha016.html');await settle(old);let bundle,stored,numbers,updated;
await check('The actual1.6 release creates a complete synthetic job and six original attachments',async()=>{await old.ev('TrainingJob.open()');await settle(old);old.ev('JobsUI.saveNamed();saveLocal()');bundle=JSON.parse(JSON.stringify(await old.w.evidenceExportProject(old.ev('state'))));stored=old.storage();numbers=old.json(calc);assert.equal(bundle.evidence.length,6);assert.equal(bundle.evidenceFiles.length,6);assert.equal(bundle.setup.sourceType,undefined);});
await check('1.6 in-place autosave and named jobs reopen without altering RF or evidence metadata',async()=>{updated=boot('outputs/Night_Sweep.html',{db:old.db,storage:stored});await settle(updated);assert.equal(updated.d.title,'Carpe Noctum 2.0 Alpha build 3');assertPreserved(updated,bundle);assert(updated.ev('JobsUI.snapshots().length')>=1);});
await check('1.6 RF levels and route distances remain numerically identical',()=>assert.deepEqual(updated.json(calc),numbers));
await check('Selecting the node launch preserves old values and exact original attachment bytes',async()=>{set(updated,'[data-launch-source="sourceType"]','node','change');assert.equal(updated.ev('state.setup.sourceType'),'node');assert.deepEqual(updated.json(calc),numbers);const saved=JSON.parse(JSON.stringify(await updated.w.evidenceExportProject(updated.ev('state'))));assert.deepEqual(saved.evidenceFiles.map(x=>x.base64),bundle.evidenceFiles.map(x=>x.base64));const reopened=boot();await reopened.ev('openProjectText('+JSON.stringify(JSON.stringify(saved))+',true)');await settle(reopened);assert.equal(reopened.ev('state.setup.sourceType'),'node');assert.deepEqual(JSON.parse(JSON.stringify(await reopened.w.evidenceExportProject(reopened.ev('state')))).evidenceFiles.map(x=>x.base64),bundle.evidenceFiles.map(x=>x.base64));});
await check('Malformed1.7 setup data cannot replace a1.6 migrated working job',async()=>{const bad={...bundle,equipmentSetup:{selected:'source',stations:{source:{supervisorKey:'invalid-secret-field'}}}};const before=updated.ev('JSON.stringify(state)');await assert.rejects(()=>updated.ev('openProjectText('+JSON.stringify(JSON.stringify(bad))+',true)'),/setup|station/i);assert.equal(updated.ev('JSON.stringify(state)'),before);});
await check('A new1.8 synthetic export uses GS7K, GainMaker GaN and the 42/54 workflow with six originals',async()=>{
 const h=boot();await settle(h);await h.ev('TrainingJob.open()');await settle(h);const example=JSON.parse(JSON.stringify(await h.w.evidenceExportProject(h.ev('state'))));
 assert.equal(example.setup.sourceType,'node');assert.equal(example.equipmentSetup.selected,'source');assert.equal(example.evidenceFiles.length,6);assert.equal(example.job.training,'guided-1.5');
 assert.equal(example.node.model,'gs7000-12g');assert.equal(example.job.trainingRevision,'gs7k-gan-alpha18-v1');assert.equal(example.sweepSetup.selected,'42');assert.equal(example.sweepSetup.profiles['42'].method,'installed');
 assert.deepEqual(h.json('state.rows.filter(row=>device(row.device)?.active).map(row=>row.device)'),['active_gm_gan_hgd','active_gm_gan_hgd']);
 const profile=example.project.profiles.find(p=>p.id===example.project.selectedProfile);assert.equal(profile.returnCeiling,42);assert.equal(profile.forwardFloor,54);assert.equal(profile.forwardLow,54);assert.equal(profile.forwardHigh,860);
 const families=h.json('state.rows.map(row=>device(row.device)?.family)');for(const name of ['Scientific-Atlanta','GigaXtend','Technetix'])assert(families.some(f=>f.includes(name)),name+' passive family');
 if(process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST!=='1')fs.writeFileSync('release/NightSweep_1.8_Alpha_build_2_Training_Job.json',JSON.stringify(example,null,2)+'\n');
});
console.log(`1.6 to 1.7 migration: ${cases.length} checks passed`);for(const h of instances)h.dom.window.close();
})().catch(e=>{console.error(e);for(const h of instances)h.dom.window.close();process.exitCode=1;});
