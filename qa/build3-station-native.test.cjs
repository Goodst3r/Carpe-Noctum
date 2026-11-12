'use strict';
// jsdom cannot produce partial native number/date editing. These tests supply
// only that platform validity bit; paired Chromium tests exercise real keys.
const assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
const app=bootApp(),{w,d,ev,json}=app;
let checks=0;
const el=(scope,key)=>d.querySelector(`[data-station-scope="${scope}"][data-station-field="${key}"]`);
const fire=(input,type='input')=>input.dispatchEvent(new w.Event(type,{bubbles:true}));
const value=(scope,key,text,type='input')=>{const input=el(scope,key);input.value=text;delete input.validity;fire(input,type);return input;};
const validity=(input,badInput)=>Object.defineProperty(input,'validity',{configurable:true,value:{badInput}});
const leave=input=>input.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true,relatedTarget:d.body}));
function open(point='r1'){
 ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")');
 const picker=d.querySelector('[data-station-target]');picker.value=point;fire(picker,'change');
}
function seed(){
 open();
 for(const [key,text]of Object.entries({lowMHz:'54',highMHz:'860',targetLow:'39',targetHigh:'49',measuredLow:'36.4',measuredHigh:'49.6'}))value('forward',key,text);
 value('balanced','date','2026-11-10','change');value('swept','date','2026-11-11','change');
 for(const scope of ['balanced','swept']){const input=el(scope,'done');input.checked=true;fire(input,'change');}
}
async function check(name,fn){await fn();assert.deepEqual(app.errors,[]);checks++;console.log('PASS '+name);}
const snapshot=()=>({state:json('state'),store:w.localStorage.getItem('hfc-route-v1')});
const same=before=>{assert.deepEqual(json('state'),before.state);assert.equal(w.localStorage.getItem('hfc-route-v1'),before.store);};
function partial(scope,key){const input=el(scope,key);input.value='';validity(input,true);fire(input);return input;}

(async()=>{
 try{
  await check('Native badInput never replaces a recorded reading, timestamp, autosave or export',async()=>{
   seed();const before=snapshot(),results=json('StationView.results()');const input=partial('forward','measuredLow');
   same(before);assert.deepEqual(json('StationView.results()'),results);
   const exported=await ev('evidenceExportProject(state)');assert.deepEqual(JSON.parse(JSON.stringify(exported.stationView)),before.state.stationView);
   assert.equal(input.getAttribute('aria-invalid'),'true');const feedback=d.getElementById(input.getAttribute('aria-describedby'));assert(feedback);assert.match(feedback.textContent,/Low reading.*not saved|not saved.*Low reading/i);
   leave(input);assert.equal(input.value,'36.4');assert.notEqual(input.getAttribute('aria-invalid'),'true');same(before);
  });
  await check('Native partial dates preserve independent work facts until a complete intentional edit',()=>{
   seed();const before=snapshot();const input=partial('balanced','date');fire(input,'change');same(before);
   assert.equal(input.getAttribute('aria-invalid'),'true');leave(input);assert.equal(input.value,'2026-11-10');same(before);
   const sweep=partial('swept','date');fire(sweep,'change');same(before);validity(sweep,false);
   // Native segmented dates can finish clearing without another input/change.
   leave(sweep);assert.equal(json('StationView.currentRecord().swept.date'),'');assert.equal(json('StationView.currentRecord().balanced.date'),'2026-11-10');assert.equal(json('StationView.currentRecord().balanced.done'),true);assert.equal(json('StationView.currentRecord().swept.done'),true);
  });
  await check('An invalid first entry creates no worksheet or new autosave',()=>{
   open();const before=snapshot();const input=partial('forward','measuredLow');same(before);leave(input);same(before);assert.equal(input.value,'');
  });
  await check('Valid corrections and intentional complete numeric clears keep live-edit behavior',()=>{
   seed();let input=partial('returns','receiverReading');validity(input,false);input.value='-1.25';fire(input);
   assert.equal(json('StationView.currentStage().returns.receiverReading'),'-1.25');assert.notEqual(input.getAttribute('aria-invalid'),'true');
   input=el('forward','measuredLow');input.value='';fire(input);assert.equal(json('StationView.currentStage().forward.measuredLow'),'');
  });
  await check('A recorded zero and the latest valid intermediate value survive a later bad draft',()=>{
   seed();value('forward','measuredLow','0');const zero=snapshot(),input=partial('forward','measuredLow');same(zero);leave(input);assert.equal(input.value,'0');
   value('forward','measuredLow','1');const intermediate=snapshot(),exponent=partial('forward','measuredLow');same(intermediate);leave(exponent);assert.equal(exponent.value,'1');
  });
  await check('Explicit Station navigation restores invalid drafts before the cached render return',()=>{
   seed();const before=snapshot(),input=partial('forward','measuredLow');ev('WorkflowUI.go("home");WorkflowUI.go("station")');
   assert.equal(el('forward','measuredLow'),input);assert.equal(input.value,'36.4');assert.notEqual(input.getAttribute('aria-invalid'),'true');same(before);
  });
  await check('Untouched hidden invalid imported text is never normalized by native focus or blur',()=>{
   seed();ev('StationView.currentRecord().stages.before.forward.measuredLow="+19";StationView.currentRecord().balanced.date="2026-02-30";loadState(JSON.parse(JSON.stringify(state)));WorkflowUI.go("station")');
   const before=snapshot();for(const input of [el('forward','measuredLow'),el('balanced','date')]){assert.equal(input.value,'');input.focus();input.blur();leave(input);}same(before);
   ev('WorkflowUI.go("home");WorkflowUI.go("station")');same(before);
  });
  await check('Switching stage discards the old draft without changing either stage or dates',()=>{
   seed();partial('forward','measuredLow');value('record','stage','after','change');
   assert.equal(json('StationView.currentRecord().stages.before.forward.measuredLow'),'36.4');assert.equal(json('StationView.currentStage().forward.measuredLow'),'');
   assert.equal(json('StationView.currentRecord().balanced.date'),'2026-11-10');assert.notEqual(el('forward','measuredLow').getAttribute('aria-invalid'),'true');
  });
  await check('A stale owner field cannot save or restore into a different working job',()=>{
   seed();const input=partial('forward','measuredLow');ev('state=JSON.parse(JSON.stringify(state))');const before=snapshot();
   leave(input);same(before);assert.equal(json('StationView.currentStage().forward.measuredLow'),'36.4');
   ev('StationView.render()');assert.equal(el('forward','measuredLow').value,'36.4');assert.doesNotMatch(d.querySelector('[data-station-status]').textContent,/Error:|Incomplete entry/);
  });
  await check('Changing target drops the old draft while retaining the original station record',()=>{
   seed();const before=snapshot(),input=partial('forward','measuredLow'),picker=d.querySelector('[data-station-target]');picker.value='source';fire(picker,'change');leave(input);
   same(before);assert.equal(el('forward','measuredLow').value,'');assert.notEqual(el('forward','measuredLow').getAttribute('aria-invalid'),'true');assert.doesNotMatch(d.querySelector('[data-station-status]').textContent,/Error:|Incomplete entry/);
  });
  await check('Changing source binding cannot reconcile an old draft into the replacement station',()=>{
   open('source');value('forward','measuredLow','36.4');const identity=ev('state.setup.stationIdentity'),record=json('StationView.currentRecord()'),input=partial('forward','measuredLow');
   ev('state.node.asset="SYNTHETIC REPLACEMENT"');const before=snapshot();leave(input);same(before);assert.deepEqual(json(`state.stationView.stations[${JSON.stringify(identity)}]`),record);
   ev('StationView.render()');assert.equal(el('forward','measuredLow').value,'');assert.equal(json('StationView.currentRecord().balanced.done'),false);assert.doesNotMatch(d.querySelector('[data-station-status]').textContent,/Error:|Incomplete entry/);
  });
  await check('Syntactically valid range errors retain existing raw storage and math reasons',()=>{
   seed();value('returns','insertionLoss','-1');assert.equal(json('StationView.currentStage().returns.insertionLoss'),'-1');assert.equal(json('StationView.results().returns.requiredInjection.ok'),false);
   value('forward','lowMHz','0');assert.equal(json('StationView.currentStage().forward.lowMHz'),'0');assert.equal(json('StationView.results().forward.ok'),false);
  });
  await check('Legacy UBT disabled and forged native events preserve the complete job',()=>{
   seed();ev('state.rows[0].device="active_gm_ubt_main";StationView.render()');const before=snapshot(),input=el('forward','measuredLow');assert(input.disabled);
   input.value='';validity(input,true);fire(input);leave(input);same(before);
  });
  console.log(`Build3 station native inputs: ${checks} checks passed`);
 }finally{app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
