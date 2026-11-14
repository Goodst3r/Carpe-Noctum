'use strict';
// A1 field-review regressions: actual rendered controls and saved-job behavior.
const test=require('node:test'),assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
function withApp(fn){return async()=>{const h=bootApp();try{await fn(h);assert.deepEqual(h.errors,[]);}finally{h.close();}};}
function open(h,point='r1'){h.ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")');select(h,point);}
function select(h,point){const el=h.d.querySelector('[data-station-target]');el.value=point;el.dispatchEvent(new h.w.Event('change',{bubbles:true}));}
function control(h,scope,key){return h.d.querySelector(`[data-station-scope="${scope}"][data-station-field="${key}"]`);}
function set(h,scope,key,value,type='input'){const el=control(h,scope,key);assert(el,scope+'.'+key);el.value=value;el.dispatchEvent(new h.w.Event(type,{bubbles:true}));}
function returns(h){set(h,'returns','referencePointTarget','19');set(h,'returns','insertionLoss','20');}
function forward(h,overrides={}){for(const [key,value]of Object.entries({lowMHz:'54',highMHz:'860',measuredLow:'50',measuredHigh:'60',targetLow:'30',targetHigh:'40',pad:'20.5',eq:'9',...overrides}))set(h,'forward',key,value,['pad','eq'].includes(key)?'change':'input');}
const words=(h,selector)=>{const el=h.d.querySelector(selector);assert(el,selector+' exists');return el.textContent.replace(/\s+/g,' ').trim();};

test('Signed level and EQ fields do not request the iPhone decimal-only keypad',withApp(h=>{
 open(h);for(const [scope,keys]of Object.entries({forward:['targetLow','targetHigh','measuredLow','measuredHigh'],returns:['referencePointTarget','actualInjection','receiverReading','receiverReference','eq']}))for(const key of keys){const el=control(h,scope,key);assert.equal(el.getAttribute('inputmode'),null,scope+'.'+key);el.value='-1.25';el.dispatchEvent(new h.w.Event('input',{bubbles:true}));assert.equal(h.json('StationView.currentStage()')[scope][key],'-1.25');}
}));

test('Target labels name only their input and source controls remain separate',withApp(h=>{
 open(h);for(const [scope,key,label]of [['forward','targetLow','Low target (dBmV)'],['forward','targetHigh','High target (dBmV)'],['returns','referencePointTarget','Reference-point target (dBmV)'],['returns','receiverReference','Receiver reference (dBmV)']]){const el=control(h,scope,key);assert.equal(el.labels.length,1,label+' accessible name');assert.equal(el.labels[0].textContent.trim(),label);assert.equal(el.labels[0].querySelector('[data-threshold]'),null);}
 assert.equal(h.d.querySelectorAll('#stationPanel label [data-threshold]').length,0);
}));

test('Forward clamp results show solver limit notes, sourced procedure window and interpolation warning',withApp(h=>{
 open(h);forward(h);const r=h.json('StationView.results().forward');assert.equal(r.catalog.advice.inWindow,false);assert(r.catalog.notes.length);const text=words(h,'[data-station-forward-result]');for(const note of r.catalog.notes)assert(text.includes(note),note);assert.match(text,/Predicted outside.*0\.5 dB.*window/i);assert.match(text,/interpolated between published frequencies/i);assert.match(text,/predicted.*remaining|remaining.*predicted/i);assert.match(text,/re-measure to confirm/i);
}));

test('Catalog-only band corrections cannot hide a saved station or its sweep date',withApp(h=>{
 open(h);returns(h);set(h,'swept','date','2026-11-10','change');const done=control(h,'swept','done');done.checked=true;done.dispatchEvent(new h.w.Event('change',{bubbles:true}));const before=h.json('state'),identity=h.ev('state.rows[0].stationIdentity');
 h.ev('device("active_gm_hgd").publishedGain.forwardBand[0]=55;device("active_gm_hgd").publishedGain.reverseBand[1]=41;StationView.render()');assert.match(words(h,'[data-station-split]'),/41\/55/,'catalog correction refreshes informational banner');h.ev(`loadState(${JSON.stringify(before)});WorkflowUI.go('station')`);
 assert.equal(h.ev('StationView.records(state).length'),1);assert.equal(h.ev('StationView.currentRecord().swept.done'),true);assert.equal(h.ev('StationView.currentRecord().swept.date'),'2026-11-10');assert.equal(control(h,'returns','referencePointTarget').value,'19');assert.deepEqual(h.json(`state.stationView.stations[${JSON.stringify(identity)}]`),before.stationView.stations[identity]);
}));

test('A saved node band selection remains part of the source binding when catalog numbers are informational',withApp(h=>{
 open(h,'source');returns(h);const saved=h.json('state');h.ev('catalog.nodeProfiles.find(n=>n.id===state.node.model).bands[0].forwardFloor=55');h.ev(`loadState(${JSON.stringify(saved)});WorkflowUI.go('station')`);assert.equal(h.json('StationView.results().returns.requiredInjection').value,39);
 h.ev('WorkflowUI.go("setup")');const el=h.d.querySelector('[data-launch-node="band"]');el.value='1';el.dispatchEvent(new h.w.Event('change',{bubbles:true}));h.ev('WorkflowUI.go("station")');assert.equal(h.json('StationView.results().returns.requiredInjection').ok,false);
}));

test('Legacy worksheet backups stay visible and read-only until explicit binding confirmation archives the original',withApp(h=>{
 open(h,'source');returns(h);const old=h.json('state'),identity=old.setup.stationIdentity,record=old.stationView.stations[identity];delete record.bindingVersion;record.equipmentContext=JSON.stringify([old.node.model,42,[54,1218],'node',old.node.asset,old.node.port,old.node.module]);
 h.ev(`loadState(${JSON.stringify(old)});WorkflowUI.go('station')`);const before=h.json('state');assert.equal(control(h,'returns','referencePointTarget').value,'19');assert.equal(control(h,'returns','referencePointTarget').disabled,true);assert.match(words(h,'#stationPanel'),/legacy.*binding|binding.*legacy/i);assert.deepEqual(h.json('state'),before,'opening does not migrate raw data');const view=h.json('StationView.records(state)')[0];assert.equal(view.bindingStatus,'legacy-unconfirmed');assert.equal(view.bindingVersion,undefined,'read API must not invent a stable version');
 h.ev('loadState(JSON.parse(JSON.stringify(state)));WorkflowUI.go("station")');assert.equal(control(h,'returns','referencePointTarget').disabled,true);assert.equal(h.json('StationView.results().returns.requiredInjection').value,39);
 const confirm=h.d.querySelector('[data-station-confirm-binding]');assert(confirm);confirm.click();assert.equal(control(h,'returns','referencePointTarget').disabled,false);assert.notEqual(h.ev('state.setup.stationIdentity'),identity);assert.deepEqual(h.json(`state.stationView.stations[${JSON.stringify(identity)}]`),record);assert.equal(h.json('StationView.results().returns.requiredInjection').value,39);
}));

test('Each return-reference row has its own source and the editable TX entry starts unknown',withApp(h=>{
 for(const [id,scope,source,revision]of [['station.return.scuInput','all',/VIAVI/,/not.*established|not.*shown|not.*recorded/i],['station.return.cmtsSetPoint','all',/SCTE 293-7/,/2025/],['station.return.aoiHgdInput','204\/258',/QB18-HGD-SA/,/preliminary.*revision.*not|revision.*not.*preliminary/i]]){const row=h.json(`Thresholds.get(${JSON.stringify(id)})`);assert(row,id);assert.equal(row.scope,scope);assert.match(row.source,source);assert.match(row.revision,revision);}
 const tx=h.json('Thresholds.get("company.sweep42.txReference")');assert.equal(tx.label,'company');assert.equal(h.json('Thresholds.resolve("company.sweep42.txReference",{sweepSetup:SweepSetup.defaults()})').value,null);assert.equal(h.ev('Thresholds.get("station.return.planes")'),null,'mixed source row removed');
}));

test('Return reminders show only the applicable plant and exact equipment recommendation',withApp(h=>{
 const region='#stationPanel .station-grid > section:last-child';open(h);let text=words(h,region);assert.match(text,/42\/54/);assert(!/Quantum18|9 dBmV/.test(text));assert(h.d.querySelector('#stationPanel [data-threshold="company.sweep42.txReference"]'));
 h.ev('state.rows[0].device="active_aoi_hgd";StationView.render()');text=words(h,region);assert.match(text,/204\/258/);assert.match(text,/9 dBmV.*6\.4 MHz/);assert(!/38 dBmV|return TX reference/i.test(text));assert.equal(h.d.querySelector('#stationPanel [data-threshold="company.sweep42.txReference"]'),null);
 h.ev('state.rows[0].device="active_aoi_le";StationView.render()');assert(!/9 dBmV/.test(words(h,region)),'HGD recommendation does not become an LE target');
}));

test('Station target catalog work stays bounded for 100 and 200 valid route rows',withApp(h=>{
 const measurements=h.json(`(()=>{
  const original=catalog.devices,owners=[100,200].map(count=>loadState({version:1,setup:{...defaultSetup,sourceType:'active',sourceModel:'active_gm_gan_hgd'},rows:Array.from({length:count},(_,i)=>({id:'r'+(i+1),name:'SYNTH '+(i+1),parent:'source',device:'active_gm_gan_hgd'}))},false,true));
  let reads=0;
  try{
   catalog.devices=original.map(d=>({...d,get id(){reads++;return d.id;}}));
   return owners.map(owner=>{reads=0;const targets=StationView.targets(owner);return {rows:owner.rows.length,catalogSize:original.length,reads,keys:targets.map(t=>t.key),ids:targets.map(t=>t.id)};});
  }finally{catalog.devices=original;}
 })()`);
 for(const m of measurements)console.log(`Station catalog work: ${m.rows} rows, ${m.reads} ID reads, budget ${4*(m.catalogSize+m.rows+1)}`);
 for(const m of measurements){
  assert.deepEqual(m.keys,['source',...Array.from({length:m.rows},(_,i)=>'r'+(i+1))]);
  assert(m.ids.every(id=>id==='active_gm_gan_hgd'),'every source and route target keeps its model');
  const budget=4*(m.catalogSize+m.rows+1);
  assert(m.reads<=budget,`${m.rows} rows read ${m.reads} catalog IDs; budget ${budget} bounds work by catalog plus route size`);
 }
}));

test('Station targets retain first catalog matches, unknown-model omission and exact source/route context',withApp(h=>{
 const actual=h.json(`(()=>{
  const original=catalog.devices,owner={setup:{sourceType:'active',sourceModel:'active_gm_gan_hgd',sourceAsset:'SYNTH SOURCE',sourcePort:'main'},rows:[{id:'r1',name:'SYNTH ACTIVE',device:'active_gm_gan_hgd'},{id:'r2',device:'synth_passive'},{id:'r3',device:'synth_absent'},{id:'r4',device:'synth_retired'}]};
  try{
   catalog.devices=[{id:'active_gm_gan_hgd',label:'SYNTH FIRST',active:true,publishedGain:{forwardBand:[54,1002],reverseBand:[5,42]}},{id:'active_gm_gan_hgd',label:'SYNTH LATER',active:true,retired:true,publishedGain:{forwardBand:[258,1794],reverseBand:[5,204]}},{id:'synth_passive',label:'SYNTH PASSIVE',active:false},{id:'synth_retired',label:'SYNTH RETIRED',active:true,retired:true,publishedGain:{forwardBand:[258,1794],reverseBand:[5,204]}}];
   const summarize=()=>StationView.targets(owner).map(({holder,...t})=>({...t,holderMatches:holder===(t.key==='source'?owner.setup:owner.rows.find(r=>r.id===t.key))}));
   const first=summarize();catalog.devices[0].active=false;const inactiveFirst=summarize();catalog.devices[0].active=true;catalog.devices[0].retired=true;const retiredFirst=summarize();
   owner.setup.sourceModel='synth_absent';const absentSource=summarize();return {first,inactiveFirst,retiredFirst,absentSource};
  }finally{catalog.devices=original;}
 })()`);
 const source={key:'source',id:'active_gm_gan_hgd',label:'Launch active · SYNTH FIRST',forwardBand:[54,1002],returnCeiling:42,readOnly:false,split:'42',context:'["active_gm_gan_hgd","active","SYNTH SOURCE","main"]',holderMatches:true};
 const route={key:'r1',id:'active_gm_gan_hgd',label:'SYNTH ACTIVE · SYNTH FIRST',forwardBand:[54,1002],returnCeiling:42,readOnly:false,split:'42',context:'["active_gm_gan_hgd","route"]',holderMatches:true};
 const retired={key:'r4',id:'synth_retired',label:'Point 4 · SYNTH RETIRED',forwardBand:[258,1794],returnCeiling:204,readOnly:true,split:'204',context:'["synth_retired","route"]',holderMatches:true};
 assert.deepEqual(actual.first,[source,route,retired]);
 assert.deepEqual(actual.inactiveFirst,[retired],'a later active duplicate cannot replace an inactive first match');
 assert.deepEqual(actual.retiredFirst,[{...source,readOnly:true},{...route,readOnly:true},retired]);
 assert.deepEqual(actual.absentSource,[{...route,readOnly:true},retired]);
}));

test('Station target lookup reads current catalog objects and owners without changing saved results',withApp(h=>{
 open(h);forward(h,{measuredLow:'36.4',measuredHigh:'49.6',targetLow:'39',targetHigh:'49',pad:'6'});returns(h);
 const original=h.json('({record:StationView.currentRecord(),results:StationView.results(),records:StationView.records(state)})');
 h.ev(`(()=>{const d=device('active_gm_hgd');catalog.devices=[...catalog.devices,{...d,label:'SYNTH LATER DUPLICATE',retired:true,publishedGain:{...d.publishedGain,forwardBand:[258,1794],reverseBand:[5,204]}}];})()`);
 assert.deepEqual(h.json('({record:StationView.currentRecord(),results:StationView.results(),records:StationView.records(state)})'),original,'a later duplicate leaves saved outputs and binding unchanged');
 assert.equal(original.results.forward.catalog.eq.to,4.5);assert.equal(original.results.forward.catalog.pad.to,7);assert.equal(original.results.returns.requiredInjection.value,39);
 h.ev(`device('active_gm_hgd').label='SYNTH IN-PLACE';device('active_gm_hgd').publishedGain.forwardBand=[55,999]`);
 let target=h.json('StationView.targets().find(t=>t.key==="r1")');assert.match(target.label,/SYNTH IN-PLACE/);assert.deepEqual(target.forwardBand,[55,999]);
 h.ev(`catalog.devices=catalog.devices.map(d=>d.id==='active_gm_hgd'?{...d,label:'SYNTH REPLACEMENT',publishedGain:{...d.publishedGain,forwardBand:[54,1002]}}:d)`);
 target=h.json('StationView.targets().find(t=>t.key==="r1")');assert.match(target.label,/SYNTH REPLACEMENT/);assert.deepEqual(target.forwardBand,[54,1002]);
 assert.deepEqual(h.json('StationView.results()'),original.results,'replacement catalog values restore identical math');
 const other=h.json(`(()=>{const owner=loadState({version:1,setup:{...defaultSetup,sourceType:'active',sourceModel:'active_aoi_hgd',sourceAsset:'SYNTH OTHER'},rows:[{id:'r1',name:'SYNTH OTHER ROUTE',parent:'source',device:'active_aoi_le'}]},false,true);return {targets:StationView.targets(owner).map(({holder,...t})=>t),record:StationView.currentRecord(owner)};})()`);
 assert.deepEqual(other.targets.map(t=>[t.key,t.id,t.split]),[['source','active_aoi_hgd','204'],['r1','active_aoi_le','204']]);
 assert.equal(other.targets[0].context,'["active_aoi_hgd","active","SYNTH OTHER",""]');assert.match(other.targets[1].label,/SYNTH OTHER ROUTE/);
 assert.equal(other.record.stages.before.forward.targetLow,'');assert.equal(other.record.stages.before.returns.referencePointTarget,'');
 assert.deepEqual(h.json('StationView.currentRecord()'),original.record,'reading another owner leaves current saved worksheet unchanged');
}));
