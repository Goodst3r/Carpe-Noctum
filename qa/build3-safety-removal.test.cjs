/* B1: actual app reachability and opaque legacy data retention after removing Safety. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const html=process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1'?require('./build2-source-harness.cjs').assembleHtml():fs.readFileSync('outputs/Night_Sweep.html','utf8');
const key='nightsweep-safety-v1',legacy='{"version":1,"checked":["brief-job"],"fields":{"who":"Synthetic crew role"}}',writes=[],errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
 w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const set=w.Storage.prototype.setItem,remove=w.Storage.prototype.removeItem;
 set.call(w.localStorage,key,legacy);
 w.Storage.prototype.setItem=function(k,v){if(k===key)writes.push(['set',v]);return set.call(this,k,v);};
 w.Storage.prototype.removeItem=function(k){if(k===key)writes.push(['remove']);return remove.call(this,k);};
}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
let checks=0;async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
(async()=>{await new Promise(r=>setImmediate(r));
 await check('Safety has no module, screen, panel, navigation target or practice feature',()=>{
  assert.equal(fs.existsSync('night-sweep/safety.js'),false);
  assert.equal(ev('typeof Safety'),'undefined');assert.equal(d.getElementById('safetyPanel'),null);
  assert.equal(json('Object.keys(WorkflowUI.screens)').includes('safety'),false);
  assert.equal(d.querySelector('[data-task="safety"], [data-go="safety"], [data-training-feature="safety"]'),null);
  assert(!html.includes('<!--SAFETY-->'));assert(!/Job\s*→\s*Safety/.test(html));
 });
 await check('Study retains Outage under a remaining domain without Safety or invented replacement questions',()=>{
  assert(!json('StudyMode.DOMAINS').some(x=>x.id==='safety'));
  const generators=json('StudyMode.GENERATORS');assert(!generators.some(x=>x.id==='safetysection'));
  const outage=generators.find(x=>x.id==='outagesection');assert(outage);assert(json('StudyMode.DOMAINS').some(x=>x.id===outage.domain));
  assert.equal(generators.length,18);
 });
 await check('Outage keeps the shared checklist and removes the arrival Safety group',()=>{
  assert.equal(ev('typeof Checklist.create'),'function');assert.equal(ev('typeof Outage.init'),'function');
  assert(!json('Outage.ITEMS').some(x=>x.group==='Safety on arrival'||/Job\s*→\s*Safety/.test(x.text)));
  ev('WorkflowUI.go("outage")');assert.equal(d.getElementById('outagePanel').hidden,false);
 });
 await check('Old jobs and real backup exports preserve opaque safety fields with identical retained values',async()=>{
  ev('loadState(TrainingJob.makePractice("complete"))');
  const beforeOpaqueRF=json('HFC.run(state,catalog,54)');
  const original=json('state'),opaque={version:1,checked:['legacy-synthetic'],notes:'Unknown Ω; exact\r\ntext',extra:{blank:'',zero:0}};
  original.safety=opaque;original.legacySafety=[{raw:'Synthetic legacy value',done:false}];
  ev(`loadState(${JSON.stringify(original)})`);
  const rf=json('HFC.run(state,catalog,54)');
  assert.deepEqual(rf,beforeOpaqueRF,'opaque legacy Safety fields do not change RF results');
  const first=await w.evidenceExportProject(ev('state')); 
  assert.deepEqual(JSON.parse(JSON.stringify(first.safety)),opaque);
  await ev(`openProjectText(${JSON.stringify(JSON.stringify(first))},true)`);
  const second=await w.evidenceExportProject(ev('state'));
  assert.deepEqual(json('HFC.run(state,catalog,54)'),rf,'RF results unchanged by opaque legacy fields and backup round trip');
  for(const k of ['setup','rows','power','safety','legacySafety'])assert.deepEqual(JSON.parse(JSON.stringify(second[k])),JSON.parse(JSON.stringify(first[k])),k);
  ev('state.job.name="Synthetic legacy Safety retention";JobsUI.saveNamed()');
  const copy=ev('JobsUI.duplicate(state.job.id)');
  assert.deepEqual(json(`JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(copy)}).safety`),opaque);
 });
 await check('Retired device data remains byte-identical and is never written or removed',()=>{
  assert.equal(w.localStorage.getItem(key),legacy);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 });
 console.log('Build3 Safety removal: '+checks+' checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>w.close());
