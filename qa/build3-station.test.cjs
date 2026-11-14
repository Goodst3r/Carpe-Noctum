/* Station worksheet contracts: literal decimal references, actual UI, job storage. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {bootApp}=require('./build2-source-harness.cjs');
const app=bootApp(),{w,d,ev,json}=app;
const flush=()=>new Promise(r=>setImmediate(r));
let checks=0;
async function check(name,fn){await fn();await flush();assert.deepEqual(app.errors,[]);checks++;console.log('PASS '+name);}
const words=sel=>d.querySelector(sel).textContent.replace(/\s+/g,' ').trim();
function set(scope,field,value,type='input'){const el=d.querySelector(`[data-station-scope="${scope}"][data-station-field="${field}"]`);assert(el,scope+'.'+field);el.value=value;el.dispatchEvent(new w.Event(type,{bubbles:true}));return el;}
function select(point){const el=d.querySelector('[data-station-target]');el.value=point;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
const fixture=()=>ev(`loadState(TrainingJob.makePractice('complete'));WorkflowUI.go('station')`);
const current=()=>json('StationView.currentRecord()');
(async()=>{
 await check('Station opens a job worksheet through the existing navigation',()=>{
  assert.equal(ev('typeof StationView'),'object','station worksheet is available');
  fixture();assert.equal(d.getElementById('stationPanel').hidden,false);assert(d.querySelector('#taskTabs [data-task="station"]'));
 });
 await check('Fresh station targets and tolerances stay unknown without mutating an old job',()=>{
  const before=json('state');select('r1');
  for(const [scope,fields] of Object.entries({forward:['targetLow','targetHigh','levelTolerance','tiltTolerance'],returns:['referencePointTarget','receiverReference','tolerance']}))for(const f of fields)assert.equal(d.querySelector(`[data-station-scope="${scope}"][data-station-field="${f}"]`).value,'');
  assert.deepEqual(json('state'),before);assert.match(words('[data-station-forward-result]'),/Enter/);assert.match(words('[data-station-return-result]'),/unknown/i);
 });
 await check('Independent decimal cases preserve injection and receiver signs including entered zero',()=>{
  const fixtures=JSON.parse(fs.readFileSync('research/build3/station-cases.json','utf8')).cases;
  for(const c of fixtures){const r=json(`StationMath.returnResults(${JSON.stringify(c.input)})`);for(const [k,v] of Object.entries(c.expected))assert.equal(r[k].value,v,c.id+' '+k);}
 });
 await check('Blank, malformed, overflow and negative loss never become an injection or receiver delta',()=>{
  for(const v of ['',null,true,'bad','Infinity','1e309',201]){const r=json(`StationMath.returnResults(${JSON.stringify({referencePointTarget:v,insertionLoss:'20',receiverReading:v,receiverReference:0})})`);assert.equal(r.requiredInjection.ok,false);assert.equal(r.receiverDelta.ok,false);assert.equal(r.requiredInjection.value,undefined);}
  for(const loss of [-1,'1e309',201])assert.equal(json(`StationMath.returnResults({referencePointTarget:0,insertionLoss:${JSON.stringify(loss)}})`).requiredInjection.ok,false);
  assert.equal(json('StationMath.returnResults({referencePointTarget:200,insertionLoss:1})').requiredInjection.ok,false);
 });
 await check('Forward uses the real sourced solver and saves readings without altering route calculations',()=>{
  const before=json('HFC.run(state,catalog,54)');
  for(const [k,v] of Object.entries({lowMHz:'54',highMHz:'860',measuredLow:'36.4',measuredHigh:'49.6',targetLow:'39',targetHigh:'49',pad:'6',eq:'9'}))set('forward',k,v,['pad','eq'].includes(k)?'change':'input');
  const r=json('StationView.results().forward'),direct=json('Alignment.solve(StationView.currentStage().forward,{forwardBand:device("active_gm_hgd").publishedGain.forwardBand,profile:Alignment.profileFor("active_gm_hgd"),pad:6,eq:9})');
  assert.deepEqual(r,direct);assert.equal(r.catalog.eq.to,4.5);assert.equal(r.catalog.pad.to,7);assert.match(words('[data-station-forward-result]'),/4.5/);assert.match(words('[data-station-forward-result]'),/7.0/);assert.deepEqual(json('HFC.run(state,catalog,54)'),before);
  assert.equal(current().equipmentId,'active_gm_hgd');assert(current().stages.before.updatedAt);
 });
 await check('Forward invalid pilots and signed zero levels are evaluated by Alignment',()=>{
  set('forward','lowMHz','0');assert.equal(json('StationView.results().forward').ok,false);
  set('forward','lowMHz','54');for(const key of ['measuredLow','measuredHigh','targetLow','targetHigh'])set('forward',key,'0');
  assert.equal(json('StationView.results().forward').errorHigh,0);set('forward','measuredHigh','1e309');assert.equal(json('StationView.results().forward').ok,false);
 });
 await check('Return worksheet keeps target, actual injection and same-plane receiver reference distinct',()=>{
  for(const [k,v] of Object.entries({referencePointTarget:'19',insertionLoss:'20',actualInjection:'39',receiverReading:'-1.25',receiverReference:'-3.5',pad:'0',eq:'0',referencePoint:'Diplex common input',receiverPlane:'Node optical receiver TP',referenceId:'SYNTH-REF'}))set('returns',k,v);
  assert.equal(json('StationView.results().returns').receiverDelta.value,2.25);assert.match(words('[data-station-return-result]'),/39.00/);assert.match(words('[data-station-return-result]'),/\+2.25/);assert.match(words('[data-station-return-result]'),/tolerance unknown/i);
  set('returns','tolerance','0');assert.match(words('[data-station-return-result]'),/outside/i);set('returns','tolerance','');
 });
 await check('Recorded electronic EQ or tilt can be signed while physical insertion loss and pad stay nonnegative',()=>{
  set('returns','eq','-2.5');assert.equal(current().stages.before.returns.eq,'-2.5');assert(!/nonnegative/.test(words('[data-station-return-result]')),'a signed electronic setting is retained without a physical-loss error');
  set('returns','pad','-1');assert.match(words('[data-station-return-result]'),/nonnegative/);set('returns','pad','0');
 });
 await check('Before and after snapshots keep separate readings and timestamps',()=>{
  const before=current().stages.before;set('record','stage','after','change');assert.equal(d.querySelector('[data-station-scope="returns"][data-station-field="actualInjection"]').value,'');set('returns','actualInjection','40');
  assert.deepEqual(current().stages.before,before);assert.equal(current().stages.after.returns.actualInjection,'40');assert(current().stages.after.updatedAt);set('record','stage','before','change');
 });
 await check('Balanced and swept dates remain independent, with calendar validation and no auto acceptance',()=>{
  set('balanced','date','2024-02-29','change');const balanced=d.querySelector('[data-station-scope="balanced"][data-station-field="done"]');balanced.checked=true;balanced.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.deepEqual(current().balanced,{done:true,date:'2024-02-29'});assert.equal(current().swept.done,false);assert.equal(current().swept.date,'');
  assert.equal(ev('StationMath.validDate("2025-02-29")'),false);assert.equal(ev('StationMath.validDate("2024-02-29")'),true);
  assert.equal(ev('StationMath.validDate("2024-13-01")'),false);assert.equal(ev('StationMath.validDate("")'),false);
 });
 await check('Station identity survives reordering and never transfers to a replacement with reused route ID',()=>{
  const identity=ev('state.rows.find(r=>r.id==="r1").stationIdentity'),saved=current();ev('state.rows.reverse();StationView.render()');assert.equal(current().equipmentId,saved.equipmentId);
  ev('state.rows=state.rows.filter(r=>r.id!=="r1");state.rows.push({...freshRow(),id:"r1",device:"active_gm_hgbt"});StationView.render()');
  assert.equal(current().stages.before.forward.targetLow,'');set('forward','targetLow','12');assert.notEqual(ev('state.rows.find(r=>r.id==="r1").stationIdentity'),identity);assert.equal(json(`state.stationView.stations[${JSON.stringify(identity)}]`).stages.before.forward.targetLow,saved.stages.before.forward.targetLow);
 });
 await check('Copied route identities cannot share readings and changed equipment starts a blank record',()=>{
  ev('state.rows.push({...state.rows.find(r=>r.id==="r1"),id:"r99"});StationView.render()');select('r99');assert.equal(current().stages.before.forward.targetLow,'');set('forward','targetLow','22');
  assert.notEqual(ev('state.rows.find(r=>r.id==="r1").stationIdentity'),ev('state.rows.find(r=>r.id==="r99").stationIdentity'));
  ev('state.rows.find(r=>r.id==="r99").device="active_aoi_hgd";StationView.render()');assert.equal(current().stages.before.forward.targetLow,'');
 });
 await check('42/54 and 204/258 methods stay explicit and Quantum18 offers electronic adjustment only',()=>{
  assert.match(words('[data-station-split]'),/204\/258/);assert.match(words('[data-station-split]'),/XPERTrak/);assert.equal(d.querySelectorAll('[data-station-scope="forward"][data-station-field="pad"]').length,0);
  for(const [k,v] of Object.entries({lowMHz:'261',highMHz:'993',measuredLow:'38',measuredHigh:'45',targetLow:'31',targetHigh:'43'}))set('forward',k,v);
  assert.match(words('[data-station-forward-result]'),/electronic/i);assert(!/use a larger input EQ|input pad from/.test(words('[data-station-forward-result]')));
  select('source');assert.match(words('[data-station-split]'),/42\/54/);assert.match(words('[data-station-split]'),/Return Sweepless Sweep/);
 });
 await check('Legacy UBT records open read-only and cannot receive synthetic input events',()=>{
  select('r1');ev('state.rows.find(r=>r.id==="r1").device="active_gm_ubt_main";StationView.render()');const before=json('state');assert.match(words('#stationPanel'),/Legacy.*read.only/i);
  const controls=[...d.querySelectorAll('#stationPanel input,#stationPanel textarea,#stationPanel select')].filter(x=>!x.hasAttribute('data-station-target'));assert(controls.length);assert(controls.every(x=>x.disabled));
  set('forward','targetLow','99');assert.deepEqual(json('state'),before);assert(![...d.querySelectorAll('[data-station-target] option')].some(o=>/active_gm_ubt_aux/.test(o.value)));
 });
 await check('Job library switching and JSON backup restore preserve identical station outputs and independent dates',async()=>{
  fixture();select('r1');
  for(const [k,v] of Object.entries({lowMHz:'54',highMHz:'860',measuredLow:'36.4',measuredHigh:'49.6',targetLow:'39',targetHigh:'49',pad:'6',eq:'9'}))set('forward',k,v,['pad','eq'].includes(k)?'change':'input');
  for(const [k,v] of Object.entries({referencePointTarget:'19',insertionLoss:'20',actualInjection:'39',receiverReading:'-1.25',receiverReference:'-3.5'}))set('returns',k,v);
  set('balanced','date','2026-11-10','change');set('swept','date','2026-11-11','change');
  assert.equal(json('StationView.results().forward').catalog.pad.to,7);assert.equal(json('StationView.results().returns').receiverDelta.value,2.25);
  ev('state.job.name="STATION SYNTH A";JobsUI.saveNamed()');const id=ev('state.job.id'),before=json('StationView.results()'),records=json('StationView.records(state)');
  const copyId=ev(`JobsUI.duplicate(${JSON.stringify(id)})`);assert.deepEqual(json(`StationView.records(JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(copyId)}))`),records);
  const backup=ev('JSON.stringify(state)');ev('loadState(TrainingJob.makePractice("aoi-six-active"));state.job.name="STATION SYNTH B";JobsUI.saveNamed()');select('r1');assert.equal(current().stages.before.forward.targetLow,'');await ev(`JobsUI.open(${JSON.stringify(id)})`);
  ev('WorkflowUI.go("station")');assert.deepEqual(json('StationView.results()'),before);assert.deepEqual(json('StationView.records(JobsUI.snapshots().find(s=>s.job.id===state.job.id))'),records);
  ev(`openProjectText(${JSON.stringify(backup)},true)`);await flush();ev('WorkflowUI.go("station")');assert.deepEqual(json('StationView.results()'),before);assert.deepEqual(json('StationView.records(state)'),records);
 });
 await check('Malformed station data is rejected before replacing the working job; invalid dates stay visible',()=>{
  const before=json('state');for(const bad of [{selected:'__proto__',stations:{}},{stations:[]},{stations:{s1:{stages:{before:{forward:{targetLow:{}}}}}}}])assert.throws(()=>ev(`loadState({...state,stationView:${JSON.stringify(bad)}})`),/station/i);assert.deepEqual(json('state'),before);
  ev('StationView.currentRecord().balanced.date="2025-02-29"');ev('StationView.render()');assert.match(words('[data-station-done-result]'),/valid.*date/i);
 });
 await check('Company tags resolve the selected job station values, including entered zero',()=>{
  set('forward','levelTolerance','0');assert.equal(json('Thresholds.resolve("station.forward.levelTolerance",state)').value,0);set('forward','levelTolerance','');assert.equal(json('Thresholds.resolve("station.forward.levelTolerance",state)').value,null);
  for(const id of ['station.forward.targetLow','station.forward.targetHigh','station.return.referencePointTarget','station.return.receiverReference','station.return.tolerance'])assert.equal(json(`Thresholds.get(${JSON.stringify(id)})`).label,'company');
 });
 await check('A browser reload restores a worksheet autosave instead of quarantining it as unreadable',async()=>{
  ev('saveLocal()');const saved=w.localStorage.getItem('hfc-route-v1'),before=json('StationView.results()');
  const reloaded=bootApp({beforeParse(browser){browser.localStorage.setItem('hfc-route-v1',saved);}});await flush();
  assert.equal(reloaded.w.localStorage.getItem('hfc-route-v1-unreadable'),null);assert.deepEqual(reloaded.json('StationView.results()'),before);assert.deepEqual(reloaded.errors,[]);reloaded.close();
 });
 await check('A source-only station worksheet is retained when opening another project',()=>{
  ev('loadState({version:1,setup:{...defaultSetup,sourceType:"active",sourceModel:"active_gm_hgd"},rows:[]});WorkflowUI.go("station")');set('returns','referencePointTarget','19');
  const identity=ev('state.setup.stationIdentity');ev('JobsUI.beforeProjectOpen({confirmed:true})');
  assert(json('JobsUI.snapshots()').some(s=>s.setup.stationIdentity===identity&&s.stationView),'source-only worksheet retained in named jobs');
 });
 await check('Changing a launch node asset, port or module archives its readings and done records',()=>{
  fixture();select('source');
  for(const field of ['asset','port','module']){
   set('returns','referencePointTarget','19');set('returns','insertionLoss','20');set('balanced','date','2026-11-10','change');const done=d.querySelector('[data-station-scope="balanced"][data-station-field="done"]');done.checked=true;done.dispatchEvent(new w.Event('change',{bubbles:true}));
   const identity=ev('state.setup.stationIdentity');ev('WorkflowUI.go("setup")');const control=d.querySelector(`[data-launch-node="${field}"]`);control.value='SYNTHETIC changed '+field;control.dispatchEvent(new w.Event('input',{bubbles:true}));ev('WorkflowUI.go("station")');
   assert.equal(json('StationView.results().returns.requiredInjection').ok,false,field+' does not inherit injection');assert.equal(current().balanced.done,false);assert.equal(current().balanced.date,'');assert.equal(json(`state.stationView.stations[${JSON.stringify(identity)}]`).balanced.done,true,'old source retained');
  }
 });
 await check('Changing an active launch asset or output port cannot inherit a same-model worksheet',()=>{
  ev('loadState({version:1,setup:{...defaultSetup,sourceType:"active",sourceModel:"active_gm_hgd",sourceAsset:"SYNTH A",sourcePort:"main"},rows:[]});WorkflowUI.go("station")');
  for(const field of ['sourceAsset','sourcePort']){
   set('returns','referencePointTarget','19');set('returns','insertionLoss','20');ev('WorkflowUI.go("setup")');const control=d.querySelector(`[data-launch-source="${field}"]`);control.value='SYNTH changed '+field;control.dispatchEvent(new w.Event('input',{bubbles:true}));ev('WorkflowUI.go("station")');assert.equal(json('StationView.results().returns.requiredInjection').ok,false,field);
  }
 });
 await check('Imported operands hidden by number inputs never calculate; accepted decimal selects stay visible',()=>{
  fixture();select('r1');
  for(const [k,v] of Object.entries({lowMHz:'54',highMHz:'860',measuredLow:'36.4',measuredHigh:'49.6',targetLow:'39',targetHigh:'49',pad:'6',eq:'9'}))set('forward',k,v,['pad','eq'].includes(k)?'change':'input');set('returns','insertionLoss','20');
  const baseline=json('state'),identity=ev('state.rows[0].stationIdentity');
  for(const value of ['+19',' 19 ','0x10','0b10','19.','1e309']){
   const imported=structuredClone(baseline),r=imported.stationView.stations[identity];r.stages.before.returns.referencePointTarget=value;r.stages.before.forward.targetLow=value;
   ev(`loadState(${JSON.stringify(imported)});WorkflowUI.go('station')`);const before=json('state');
   assert.equal(d.querySelector('[data-station-scope="returns"][data-station-field="referencePointTarget"]').value,'');assert.equal(json('StationView.results().returns.requiredInjection').ok,false,value);assert.equal(json('StationView.results().forward').ok,false,value);ev('StationView.render()');assert.deepEqual(json('state'),before,'raw import retained without calculation');
  }
  const accepted=structuredClone(baseline),r=accepted.stationView.stations[identity];r.stages.before.forward.pad='6.0';r.stages.before.forward.eq='9e0';r.stages.before.returns.referencePointTarget='1.9e1';ev(`loadState(${JSON.stringify(accepted)});WorkflowUI.go('station')`);
  assert.equal(d.querySelector('[data-station-scope="forward"][data-station-field="pad"]').value,'6');assert.equal(d.querySelector('[data-station-scope="forward"][data-station-field="eq"]').value,'9');assert.equal(json('StationView.results().returns.requiredInjection').value,39);
 });
 console.log('Build3 station: '+checks+' checks passed');app.close();
})().catch(e=>{console.error(e);app.close();process.exitCode=1;});
