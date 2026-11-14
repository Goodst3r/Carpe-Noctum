/* Loadable practice coverage, serial active topology and portable new exercises. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');
function boot(){
 let html=process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1'?require('./build2-source-harness.cjs').assembleHtml():fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8');
 if(process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST==='1'){
  const start=html.indexOf('/* Offline synthetic practice job.'),endMarker='function initTraining(){TrainingJob.init();}',end=html.indexOf(endMarker,start);
  assert(start>=0&&end>start);html=html.slice(0,start)+fs.readFileSync(path.join(root,'night-sweep/training.js'),'utf8')+html.slice(end+endMarker.length);
 }
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.structuredClone=structuredClone;w.confirm=()=>true;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
 }});
 return {dom,w:dom.window,d:dom.window.document,errors,ev:code=>dom.window.eval(code),json:code=>JSON.parse(dom.window.eval('JSON.stringify('+code+')'))};
}
async function settle(h){for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
async function withApp(fn){const h=boot();try{await settle(h);await fn(h);await settle(h);assert.deepEqual(h.errors,[]);}finally{h.dom.window.close();}}
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const destination=task=>({gain:'route',readings:'route',trial:'power'})[task]||task;
function shown(el,label){assert(el,label+' exists');for(let a=el;a;a=a.parentElement){assert.notEqual(a.hidden,true,label+' hidden');assert.notEqual(el.ownerDocument.defaultView.getComputedStyle(a).display,'none',label+' not displayed');if(a.tagName==='DETAILS')assert.equal(a.open,true,label+' collapsed');}}

test('Practice library exposes seven identifiable loadable exercises and preserves the four original paths',async()=>withApp(async h=>{
 const exercises=h.json('TrainingJob.exercises');assert.deepEqual(exercises.map(x=>x.id),['complete','aoi-six-active','custom-curves','gainmaker-oem','gainmaker-dsim','gainmaker-manual','gs7k-node']);
 for(const exercise of exercises){const button=h.d.getElementById(exercise.button);assert(button,exercise.id);assert.match(button.textContent,/Open/);assert(button.closest('.training-library-group'));}
 for(const id of ['openTrainingJob','openOemTrainingJob','openDsimTrainingJob','openGs7kTrainingJob'])assert(h.d.getElementById(id));
}));

test('Every task screen and important calculator subfeature has a seeded exercise and valid guide target',async()=>withApp(async h=>{
 const features=h.json('TrainingJob.features'),screenIds=h.json('Object.keys(WorkflowUI.screens)');
 for(const id of screenIds)assert(features.some(f=>f.id===id&&f.task===id),'Missing screen '+id);
 for(const id of ['six-active-cascade','gain-table','gain-test-points','tap-drop','map-arithmetic','custom-tables','launch-table','reverse-tdr','available-carriers','oem-agc','dsim-pilot','manual-thermal','db-units','return-injection','evidence-comparison','backup-roundtrip'])assert(features.some(f=>f.id===id),'Missing subfeature '+id);
 assert.equal(new Set(features.map(f=>f.id)).size,features.length);
 assert.equal(h.d.querySelectorAll('#trainingFeatureSelect option').length,features.length);
 for(const feature of features){
  const descriptor=h.json('TrainingJob.exercises.find(x=>x.id==='+JSON.stringify(feature.variant)+')');assert(descriptor,feature.id);assert(feature.control,feature.id+' target control');
  const candidate=h.json('TrainingJob.makePractice('+JSON.stringify(feature.variant)+')');assert(candidate.rows.length||feature.variant==='gs7k-node',feature.id+' seeded route');
  const list=h.json('TrainingJob.stepsFor('+JSON.stringify(feature.variant)+')');const step=list.find(s=>s[0]===feature.step);assert(step,feature.id+' guide');assert.equal(step[2],feature.task,feature.id+' task');
  if(step[3]&&step[3]!=='source')assert(candidate.rows.some(r=>r.id===step[3]),feature.id+' point');
 }
}));

test('Six-active exercise is a single six-amplifier serial path with exact restored endpoint levels',async()=>withApp(async h=>{
 await h.ev('TrainingJob.open("aoi-six-active")');await settle(h);
 assert.equal(h.ev('state.job.trainingVariant'),'aoi-six-active');assert.equal(h.ev('state.sweepSetup.selected'),'204');
 const rows=h.json('state.rows'),actives=rows.filter(r=>h.ev('!!device('+JSON.stringify(r.device)+')?.active'));assert.equal(actives.length,6);
 for(let i=0;i<6;i++){assert.equal(actives[i].id,'r'+(i+1));assert.equal(actives[i].parent,i?'r'+i+'::through':'source');assert.equal(actives[i].length,300);}
 assert.deepEqual(h.json('HFC.routeDistances(state,catalog).errors'),[]);
 for(const frequency of [261,993]){
  const result=h.json('evaluate('+frequency+').results');for(const active of actives){const value=result.find(r=>r.id===active.id);near(value.input.level,frequency===261?31:37);near(value.outputs.find(o=>o.id==='through').level,frequency===261?34:46);}
  near(h.ev('evaluate('+frequency+').byKey.get("r7::through").level'),frequency===261?31.5:38.5);
 }
 assert.equal(h.ev('state.power.rows.length'),7);assert.equal(h.ev('HFC.powerRun(state.power,catalog).ok'),true);
 assert(h.ev('HFC.powerRun(state.power,catalog).rows.every(r=>r.voltage>0&&Number.isFinite(r.voltage))'));
}));

test('Six-active TDR example begins after active six and blocks an attempt across the upstream active chain',async()=>withApp(async h=>{
 await h.ev('TrainingJob.open("aoi-six-active")');const result=h.json('HFC.tdrLocate(state,catalog,state.routeTools)');assert.equal(result.ok,true);assert.equal(result.spanId,'r7');near(result.routeDistance,1900);near(result.offsetFromStart,100);
 const blocked=h.json('HFC.tdrLocate(state,catalog,{...state.routeTools,start:"source",distance:1925})');assert.equal(blocked.ok,false);assert.match(blocked.error,/active/);
}));

test('Custom-curves exercise loads actual manual-source, cable and passive tables without duplicate temperature correction',async()=>withApp(async h=>{
 await h.ev('TrainingJob.open("custom-curves")');assert.equal(h.ev('state.setup.sourceType'),'manual');assert.equal(h.ev('state.setup.launchMode'),'table');assert.equal(h.ev('state.setup.launchTestPoint'),false);
 for(const [frequency,source,through,tap] of [[261,34,32,23],[993,46,41,32]]){
  near(h.ev('evaluate('+frequency+').source'),source);near(h.ev('evaluate('+frequency+').byKey.get("r1::through").level'),through);near(h.ev('evaluate('+frequency+').byKey.get("r1::tap").level'),tap);
 }
 assert.equal(h.ev('evaluate(1002).source'),null);assert.equal(h.ev('HFC.cableAt(null,state.rows[0],1002,86)'),null);
 const reverse=h.json('HFC.tdrLocate(state,catalog,state.routeTools)');assert.equal(reverse.ok,true);assert.equal(reverse.spanId,'r2');near(reverse.pathDistance,85);near(reverse.routeDistance,115);near(reverse.offsetFromStart,15);
 const frequency=h.json('frequencyCalculation().rows.find(r=>r.hz===261)');near(frequency.total,2);near(frequency.budget,32);
}));

test('Manual-thermal practice selects that installed control path without DSIM configuration or inferred switch values',async()=>withApp(async h=>{
 await h.ev('TrainingJob.open("gainmaker-manual")');assert.equal(h.ev('state.job.trainingVariant'),'gainmaker-manual');assert.equal(h.ev('state.sweepSetup.selected'),'42');assert.equal(h.ev('state.project.dsim.length'),0);
 for(const station of h.json('Object.values(state.equipmentSetup.stations)')){assert.equal(station.gainControl,'manual-thermal');assert.equal(station.dsimModel,'');assert.equal(station.pilot,'');assert.deepEqual(station.checks,{});}
 h.d.querySelector('[data-training-open="equipment"]').click();assert.equal(h.d.querySelector('[data-equipment-field="gainControl"]').value,'manual-thermal');
}));

test('Loading any feature opens its seeded exercise, the right guide step, and a visible intended control',async()=>withApp(async h=>{
 const features=h.json('TrainingJob.features');
 for(const feature of features){
  assert.equal(await h.ev('TrainingJob.openFeature('+JSON.stringify(feature.id)+')'),true,feature.id);await settle(h);
  assert.equal(h.ev('WorkflowUI.current()'),destination(feature.task),feature.id);
  assert.equal(h.ev('state.job.training'),'guided-1.5');assert.equal(h.ev('state.job.trainingVariant||"complete"'),feature.variant,feature.id);
  if(feature.control)shown(h.d.querySelector(feature.control),feature.id);
  assert.equal(h.d.getElementById('trainingBanner').hidden,false);
 }
}));

test('Feature selector loads the selected example and cancellation leaves current job and navigation unchanged',async()=>withApp(async h=>{
 const select=h.d.getElementById('trainingFeatureSelect');select.value='six-active-cascade';select.dispatchEvent(new h.w.Event('change',{bubbles:true}));assert.match(h.d.getElementById('trainingFeatureHint').textContent,/six|Six/);
 await h.d.getElementById('loadTrainingFeature').onclick();assert.equal(h.ev('state.job.trainingVariant'),'aoi-six-active');
 h.ev('WorkflowUI.go("home")');const before=h.ev('JSON.stringify(state)'),count=h.ev('JobsUI.snapshots().length');h.w.confirm=()=>false;
 assert.equal(await h.ev('TrainingJob.openFeature("custom-tables")'),false);assert.equal(h.ev('JSON.stringify(state)'),before);assert.equal(h.ev('JobsUI.snapshots().length'),count);assert.equal(h.ev('WorkflowUI.current()'),'home');
}));

test('All three new variants preserve current jobs, learning progress and original bytes through portable export/import',async()=>withApp(async h=>{
 h.ev('state.job={name:"Retain real working job"};state.example=false;saveLocal()');
 await h.ev('TrainingJob.open()');const original=await h.w.evidenceExportProject(h.ev('state'));
 for(const variant of ['aoi-six-active','custom-curves','gainmaker-manual']){
  await h.ev('TrainingJob.open('+JSON.stringify(variant)+')');const first=h.d.querySelector('[data-training-check]');first.checked=true;first.dispatchEvent(new h.w.Event('change',{bubbles:true}));
  const exported=await h.w.evidenceExportProject(h.ev('state'));assert.equal(exported.job.trainingVariant,variant);assert.match(exported.job.trainingSteps,new RegExp(first.dataset.trainingCheck));
  await h.w.NightSweep.openProject(JSON.stringify(exported));await settle(h);assert.equal(h.ev('state.job.trainingVariant'),variant);assert.equal(h.d.querySelector('[data-training-check="'+first.dataset.trainingCheck+'"]').checked,true);assert.equal(h.d.getElementById('trainingGuide').hidden,false);
 }
 const retained=h.json('JobsUI.snapshots()');assert(retained.some(j=>j.job.name==='Retain real working job'));const complete=retained.find(j=>j.evidence?.length===6);assert(complete);
 const portable=await h.w.evidenceExportProject(complete);assert.deepEqual(portable.evidence.map(x=>x.sha256),original.evidence.map(x=>x.sha256));assert.deepEqual(portable.evidenceFiles,original.evidenceFiles);
}));

test('Unknown requested variants/features reject before switching and retained future variants hide incompatible guidance',async()=>withApp(async h=>{
 const before=h.ev('JSON.stringify(state)'),count=h.ev('JobsUI.snapshots().length');for(const id of ['future-variant','toString','__proto__']){await assert.rejects(()=>h.ev('TrainingJob.open('+JSON.stringify(id)+')'),/Unknown practice/);assert.deepEqual(h.json('TrainingJob.stepsFor('+JSON.stringify(id)+')'),[]);}await assert.rejects(()=>h.ev('TrainingJob.openFeature("future-feature")'),/Unknown practice feature/);assert.equal(h.ev('JSON.stringify(state)'),before);assert.equal(h.ev('JobsUI.snapshots().length'),count);
 await h.ev('TrainingJob.open("aoi-six-active")');h.ev('state.job.trainingVariant="future-variant";state.job.trainingSteps="retain-me";renderAll()');const retained=h.ev('JSON.stringify(state)');assert.equal(h.d.getElementById('trainingGuide').hidden,true);assert.equal(h.d.getElementById('trainingCompatibility').hidden,false);assert.match(h.d.getElementById('trainingCompatibility').textContent,/unrecognized|newer/i);assert.equal(h.d.getElementById('trainingShowGuide').disabled,true);assert.equal(h.ev('JSON.stringify(state)'),retained);
}));

test('New guides reveal their configured route, gain, TDR and reference fields without altering practice data',async()=>withApp(async h=>{
 for(const variant of ['aoi-six-active','custom-curves','gainmaker-manual']){
  await h.ev('TrainingJob.open('+JSON.stringify(variant)+')');const list=h.json('TrainingJob.stepsFor('+JSON.stringify(variant)+')');
  for(const step of list){h.ev('WorkflowUI.go("home")');h.d.querySelectorAll('#route details,#projectPanel details,#fieldReferencePanel details').forEach(d=>d.open=false);const before=h.ev('JSON.stringify([state.rows,state.project,state.job])');h.d.querySelector('[data-training-open="'+step[0]+'"]').click();assert.equal(h.ev('WorkflowUI.current()'),destination(step[2]),variant+' '+step[0]);assert.equal(h.ev('JSON.stringify([state.rows,state.project,state.job])'),before);}
 }
}));
