'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
test('route UI binds marker edits, displays all physical legs, and invalidates edited map identities',()=>{
 const a=bootApp();try{
  const {d,w,ev}=a,set=(selector,value,event='input')=>{const el=d.querySelector(selector);assert(el,selector);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));};
  ev("state.setup={...state.setup,lowF:54,highF:860,lowLevel:10,highLevel:10,launchMode:'linear'};state.rows=[{...freshRow('source','r1'),name:'AMP',device:'active_gm_hgd',gainLowF:54,gainHighF:860,gainLow:31,gainHigh:35,targetLow:39,targetHigh:49,workbench:{legGain:{aux:{lowF:54,highF:860,low:20,high:25,loss:1,targetLow:35,targetHigh:40}}}}];renderAll()");
  const summary=d.querySelector('[data-wb-point]').textContent;
  assert.match(summary,/Main.*41\.00 \/ 45\.00 dBmV · tilt 4\.00/);assert.match(summary,/Auxiliary.*29\.00 \/ 34\.00 dBmV · tilt 5\.00/);assert.match(summary,/Optional signal director output.*— \/ —/);assert.match(summary,/incoming cable loss 0\.00/);
  ev('window.__rfRuns=[];window.__rfRun=HFC.run;HFC.run=(s,c,f)=>{window.__rfRuns.push(f);return window.__rfRun(s,c,f)};refreshResults();HFC.run=window.__rfRun');assert.equal(ev('__rfRuns.filter(f=>f===54).length'),1);assert.equal(ev('__rfRuns.filter(f=>f===860).length'),1);
  set('[data-field="targetLow"]','39');set('[data-field="outputLimitLow"]','50');assert.equal(ev('state.rows[0].targetLowF'),54);assert.equal(ev('state.rows[0].outputLimitLowF'),54);
  ev('state.setup.lowF=55;refreshResults()');assert.equal(ev('HFC.gainBudget(state,catalog,{rowId:"r1"}).low.target'),null);assert.equal(ev('HFC.gainBudget(state,catalog,{rowId:"r1"}).low.outputLimit'),null);assert.equal(ev('state.rows[0].targetLow'),'39');
  set('[data-wb="leg"]','aux','change');set('[data-wb="legGain.targetLow"]','36');set('[data-wb="legGain.limitLow"]','44');assert.equal(ev('state.rows[0].workbench.legGain.aux.targetLowF'),55);assert.equal(ev('state.rows[0].workbench.legGain.aux.limitLowF'),55);
  ev('state.setup.lowF=54;refreshResults()');assert.equal(ev('HFC.gainBudget(state,catalog,{rowId:"r1",legId:"aux"}).low.target'),null);assert.equal(ev('HFC.gainBudget(state,catalog,{rowId:"r1",legId:"aux"}).low.outputLimit'),null);
  ev("state.rows[0].mapImport={kind:'active',status:'installed',connectionConfirmed:true,modelConfirmed:true,positionConfirmed:true,positionReadable:true,exactName:'ORIGINAL',tag:'T1',page:1};renderAll()");
  set('[data-field="name"]','display rename');assert.equal(ev('state.rows[0].mapImport.positionConfirmed'),false);assert.equal(ev('state.rows[0].mapImport.exactName'),'ORIGINAL');assert.equal(ev('state.rows[0].mapImport.sourceName'),'ORIGINAL');assert.equal(ev('state.rows[0].mapImport.sourceTag'),'T1');
  set('[data-map-identity="exactName"]','CONFIRMED NAME','change');set('[data-map-identity="tag"]','T2','change');assert.equal(ev('state.rows[0].mapImport.sourceName'),'ORIGINAL');assert.equal(ev('state.rows[0].mapImport.sourceTag'),'T1');assert.equal(ev('state.rows[0].name'),'CONFIRMED NAME');assert.equal(ev('state.rows[0].mapImport.positionConfirmed'),false);
  ev("state.rows[0].device='none';state.rows[0].terminal=true;state.rows[0].mapImport={kind:'terminal',status:'installed',connectionConfirmed:true,modelConfirmed:false,positionReadable:false,exactName:'EOL',tag:'E1',page:1};renderAll()");
  assert.equal(d.querySelector('[data-map-confirm="model"]'),null);assert.equal(d.querySelector('[data-map-confirm="position"]').disabled,true);assert.equal(ev('HFC.run(state,catalog,54).results[0].input.level'),10);
  assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
test('compatible pad/EQ advice renders and legacy raw readings survive unknown context',()=>{
 const a=bootApp();try{
  const {d,ev}=a;ev("state.setup={...state.setup,lowF:54,highF:860,lowLevel:10,highLevel:10};state.rows=[{...freshRow('source','r1'),name:'AMP',device:'active_gm_hgd',targetLow:39,targetHigh:49,workbench:{records:{main:{before:{low:{input:10,inputPlane:'port',inputFrequency:54,output:36.4,outputPlane:'port',outputFrequency:54,outputBasis:'sc-qam',outputBandwidthMHz:6,outputImpedanceOhms:75},high:{output:49.6,outputPlane:'port',outputFrequency:860,outputBasis:'sc-qam',outputBandwidthMHz:6,outputImpedanceOhms:75}}}},pads:{'Forward input pad':{installed:6},'Forward input EQ':{installed:9}}}}];renderAll()");
  assert.match(d.querySelector('[data-wb-balance]').textContent,/EQ 9 → 4.5 dB; pad 6 → 7 dB/);assert.match(d.querySelector('[data-wb-measured="before.low"]').textContent,/Corrected input 10\.00.*measured gain —/);
  assert.equal(ev('state.rows[0].workbench.records.main.before.low.input'),10);assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
