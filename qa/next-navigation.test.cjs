'use strict';
const assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
const key='nightsweep-leakage-v1',legacy='{"version":1,"syntheticLegacy":{"blank":"","zero":0,"notes":"Keep exact Ω text"}}';
const writes=[];
const h=bootApp({beforeParse(w){
 w.localStorage.setItem(key,legacy);
 const set=w.Storage.prototype.setItem,remove=w.Storage.prototype.removeItem;
 w.Storage.prototype.setItem=function(k,v){if(k===key)writes.push(['set',v]);return set.call(this,k,v);};
 w.Storage.prototype.removeItem=function(k){if(k===key)writes.push(['remove']);return remove.call(this,k);};
}}),{w,d,ev,json}=h;
const flush=()=>new Promise(resolve=>setImmediate(resolve));
let count=0;
async function check(name,fn){await fn();await flush();assert.deepEqual(h.errors,[]);console.log('PASS '+name);count++;}
(async()=>{
 await flush();
 await check('Cold launch opens standalone calculators with no job creation required',()=>{
  assert.equal(ev('WorkflowUI.current()'),'calculators');
  assert.equal(d.getElementById('calculatorPanel').hidden,false);
  assert(d.querySelectorAll('#calculatorPanel .calc-card').length>=8);
  assert.equal(d.getElementById('contextStrip').hidden,true);
  assert.equal(d.querySelector('#taskTabs .task-picker').open,false,'the screen list starts collapsed so calculators are visible first');
 });
 await check('Route and sweep is one bottom-nav tap away, including after power work',()=>{
  const button=d.querySelector('[data-main-tab="plan"]');assert.match(button.textContent,/Route & sweep/);
  button.click();assert.equal(ev('WorkflowUI.current()'),'route');
  ev("WorkflowUI.go('power')");d.querySelector('[data-main-tab="tools"]').click();button.click();
  assert.equal(ev('WorkflowUI.current()'),'route');
 });
 await check('Field is consolidated and surviving meter/evidence/TDR/Station shortcuts remain reachable',()=>{
  assert.equal(d.querySelector('[data-main-tab="field"]'),null);
  assert.equal(ev('typeof WorkflowUI.groups.field'),'undefined');
  for(const id of ['sweepSetup','station','evidence','tdr']){
   ev(`WorkflowUI.go(${JSON.stringify(id)})`);assert.equal(ev('WorkflowUI.current()'),id);
   assert.equal(d.querySelector('#screenTitle .eyebrow').textContent,'Route & sweep');
  }
  ev("WorkflowUI.go('field')");assert.equal(ev('WorkflowUI.current()'),'sweepSetup','legacy group shortcut');
 });
 await check('Choosing a screen by touch closes the inventory and focuses the destination',()=>{
  ev("WorkflowUI.go('calculators')");d.querySelector('.task-picker').open=true;
  d.querySelector('[data-task="docsisHealth"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));
  assert.equal(ev('WorkflowUI.current()'),'docsisHealth');assert.equal(d.querySelector('.task-picker').open,false);
  assert.equal(d.activeElement,d.querySelector('#screenTitle h2'));
 });
 await check('Escape returns keyboard focus from the screen inventory to the active tool',()=>{
  const menu=d.querySelector('.task-picker');menu.open=true;
  const search=d.querySelector('[data-task-search]');search.focus();
  search.dispatchEvent(new w.KeyboardEvent('keydown',{bubbles:true,key:'Escape'}));
  assert.equal(menu.open,false);assert.equal(ev('WorkflowUI.current()'),'docsisHealth');
  assert.equal(d.activeElement,d.querySelector('#screenTitle h2'));
 });
 await check('Retired Leakage has no screen, controls, practice choice, Study task or loaded module',()=>{
  assert.equal(ev('typeof Leakage'),'undefined');assert.equal(d.getElementById('leakagePanel'),null);
  assert(!json('Object.keys(WorkflowUI.screens)').includes('leakage'));
  assert(!json('TrainingJob.features').some(x=>x.task==='leakage'));
  assert(!json('StudyMode.GENERATORS').some(x=>x.tool?.task==='leakage'));
  assert.equal(d.querySelector('[data-task="leakage"],[data-go="leakage"]'),null);
  ev("WorkflowUI.go('leakage')");assert.equal(ev('WorkflowUI.current()'),'calculators');
 });
 await check('Existing job fields and evidence backups preserve opaque retired data',async()=>{
  ev('loadState(TrainingJob.makePractice("complete"))');
  const snapshot=json('state');snapshot.leakage={notes:'Legacy synthetic value',future:{raw:'',number:0}};
  const before=json('HFC.run(state,catalog,54)');
  ev(`loadState(${JSON.stringify(snapshot)})`);
  const a=JSON.parse(JSON.stringify(await w.evidenceExportProject(ev('state'))));
  await ev(`openProjectText(${JSON.stringify(JSON.stringify(a))},true)`);
  const b=JSON.parse(JSON.stringify(await w.evidenceExportProject(ev('state'))));
  assert.deepEqual(b.leakage,snapshot.leakage);
  for(const field of ['setup','rows','power','fieldWork'])assert.deepEqual(b[field],a[field],field);
  assert.deepEqual(json('HFC.run(state,catalog,54)'),before);
 });
 await check('Navigation and backups never overwrite or remove the retired device notebook',()=>{
  assert.equal(w.localStorage.getItem(key),legacy);assert.deepEqual(writes,[]);
 });
 console.log('Next navigation: '+count+' checks passed');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>h.close());
