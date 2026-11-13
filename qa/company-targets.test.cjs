'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{test}=require('node:test');
const {bootApp}=require('./build2-source-harness.cjs');
const low='company-42-20261113',high='company-aoi-v15';
function api(){assert(fs.existsSync('night-sweep/company-targets.js'),'shared company target evaluator must exist');return require('../night-sweep/company-targets.js');}
const near=(got,want)=>assert(Math.abs(got-want)<=1e-9,`${got} != ${want}`);
test('ten independent Decimal references and exact endpoints retain domain and provenance',()=>{
 const c=api();for(const [id,f,value,display]of [[low,105,32.802575107296,'32.8'],[low,200,34.297567954220,'34.3'],[low,300,35.871244635193,'35.9'],[low,450,38.231759656652,'38.2'],[low,550,39.805436337625,'39.8'],[low,650,41.379113018598,'41.4'],[high,303,34.660377358491,'34.7'],[high,405,36.264150943396,'36.3'],[high,555,38.622641509434,'38.6'],[high,711,41.075471698113,'41.1']]){
  const r=c.targetAt(id,f);near(r.value,value);assert.equal(r.display,display);assert.equal(r.units,'dBmV');assert(r.source.label);assert(r.missingBasis.includes('fieldTolerance'));
 }
 for(const [id,f,value]of [[low,54,32],[low,753,43],[high,261,34],[high,1215,49]])assert.equal(c.targetAt(id,f).value,value);
 assert.equal(new Set(c.profiles.map(p=>p.id)).size,2);
});
test('out-of-domain, blank and nonfinite frequencies never produce a target or extrapolation',()=>{
 const c=api();for(const [id,f]of [[low,860],[high,258],[high,1218],[low,''],[low,' '],[low,null],[low,NaN],[low,Infinity],[low,'0x36'],['missing',54]])assert.equal(c.targetAt(id,f).value,null,String(f));
});
test('partial targets stay independent; invalid pairs and unknown comparison basis stay blank',()=>{
 const c=api(),args={lowMHz:54,highMHz:753,measuredLow:32,measuredHigh:43,split:'42',plane:'node-output',unit:'dBmV'};
 const full=c.compare(low,args);assert.equal(full.targetLow,32);assert.equal(full.targetHigh,43);assert.equal(full.targetTilt,11);assert.equal(full.errorLow,null);assert.equal(full.errorHigh,null);assert.equal(full.tiltError,null);assert.equal(full.acceptance,null);assert.match(full.reason,/bandwidth.*power.*tolerance/i);
 const partial=c.compare(low,{...args,highMHz:'',measuredHigh:''});assert.equal(partial.targetLow,32);assert.equal(partial.targetHigh,null);assert.equal(partial.targetTilt,null);assert.equal(partial.measuredTilt,null);
 assert.equal(c.compare(low,{...args,measuredLow:-1e308,measuredHigh:1e308}).measuredTilt,null,'overflow cannot become a raw tilt');
 for(const patch of [{lowMHz:753,highMHz:54},{highMHz:54},{split:'204'},{plane:'amplifier-output'},{unit:'dB'}]){const r=c.compare(low,{...args,...patch});assert.equal(r.errorLow,null);assert.equal(r.acceptance,null);assert.equal(r.applicable,false);}
});
test('AOI source metadata retains four markers, unresolved file provenance and TX38 distinction',()=>{
 const c=api(),p=c.profiles.find(p=>p.id===high);assert.deepEqual(p.markers.map(m=>m.frequencyMHz),[303,405,555,711]);assert.deepEqual(p.markers.filter(m=>m.main).map(m=>m.frequencyMHz),[303,711]);assert.deepEqual(p.backupPilots,[]);assert.equal(p.source.fileVerified,false);assert.equal(p.source.sha256,undefined);assert.equal(c.txReference.value,38);assert.deepEqual(c.txReference.companySpanMHz,[11,42]);
 assert(!c.referenceMarkup(high).includes('38 dBmV'),'42 MHz TX reference must not be presented as part of the high-split company profile');
});
function start(t){const a=bootApp();t.after(()=>{assert.deepEqual(a.errors,[]);a.close();});assert.equal(a.ev('typeof CompanyTargets'),'object');return a;}
test('explicit node preset applies linear design with no TP addback and leaves station targets intact',t=>{
 const a=start(t),{ev,d}=a;ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("setup")');
 const station=a.json('state.stationView||null'),rows=a.json('state.rows');ev('state.setup.launchTestPoint=true;state.setup.launchCoupling="20"');
 d.querySelector('#companyTargetProfile').value=low;d.querySelector('#applyCompanyTarget').click();
 assert.equal(ev('state.setup.companyTargetProfile'),low);assert.deepEqual(a.json('[state.setup.lowF,state.setup.highF,state.setup.lowLevel,state.setup.highLevel,state.setup.launchMode,state.setup.launchTestPoint]'),[54,753,32,43,'linear',false]);
 assert.equal(ev('effectiveLaunchSetup().lowLevel'),32);assert.deepEqual(a.json('state.stationView||null'),station);assert.deepEqual(a.json('state.rows'),rows);
 near(ev('HFC.launchAt(state.setup,200)'),34.297567954220);
 const before=a.json('state.setup');d.querySelector('#companyTargetProfile').value=high;d.querySelector('#applyCompanyTarget').click();assert.deepEqual(a.json('state.setup'),before);assert.match(d.querySelector('#companyTargetStatus').textContent,/split/i);
});
test('both legacy anchor pairs preserve calculations and ancillary fields through open and export',async t=>{
 const a=start(t);for(const variant of ['complete','aoi-six-active']){
  const anchors=variant==='complete'?{lowF:54,highF:860,lowLevel:31,highLevel:43}:{lowF:261,highF:993,lowLevel:34,highLevel:46};
  a.ev(`loadState(TrainingJob.makePractice(${JSON.stringify(variant)}));Object.assign(state.setup,${JSON.stringify(anchors)},{launchTestPoint:false});state.setup.ancillary="keep";state.vendorOpaque={future:'kept',partial:null}`);
  const before=a.json('state.setup'),value=a.ev('HFC.launchAt(state.setup,753)');assert.equal(before.companyTargetProfile,undefined);
  assert.deepEqual([before.lowF,before.highF,before.lowLevel,before.highLevel],variant==='complete'?[54,860,31,43]:[261,993,34,46]);
  const portable=await a.ev('evidenceExportProject(state)');await a.ev(`openProjectText(${JSON.stringify(JSON.stringify(portable))},true)`);
  assert.deepEqual(a.json('state.setup'),before);assert.equal(a.ev('HFC.launchAt(state.setup,753)'),value);assert.deepEqual(a.json('state.vendorOpaque'),{future:'kept',partial:null});assert.equal(a.ev('state.version'),1);
 }
});
test('company choice, partial readings and exact original evidence survive named jobs and portable import',async t=>{
 const a=start(t),{ev,d}=a;ev('loadState(TrainingJob.makePractice("aoi-six-active"));WorkflowUI.go("setup")');d.querySelector('#companyTargetProfile').value=high;d.querySelector('#applyCompanyTarget').click();
 ev('WorkflowUI.go("station")');for(const [key,value]of Object.entries({lowMHz:'261',highMHz:'1215',measuredLow:'34',plane:'node-output'})){const input=d.querySelector(`[data-station-scope="forward"][data-station-field="${key}"]`);input.value=value;input.dispatchEvent(new a.w.Event('input',{bubbles:true}));}
 const station=a.json('state.stationView');
 const csv='frequency_mhz,level_dbmv\r\n261,34\r\n1215,49\r\n',bytes=new TextEncoder().encode(csv);
 await ev('EvidenceUI').importFiles([{name:'synthetic-company.csv',size:bytes.length,type:'text/csv',arrayBuffer:async()=>bytes.slice().buffer}],{kind:'Sweep',stage:'Before'});
 const before=await ev('evidenceExportProject(state)'),id=ev('JobsUI.saveNamed()'),copy=ev(`JobsUI.duplicate(${JSON.stringify(id)})`);assert.equal(a.json(`JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(copy)}).setup`).companyTargetProfile,high);
 ev('WorkflowUI.go("evidence")');for(const [id,value]of Object.entries({gradingEvidence:ev('state.evidence[0].id'),gradingPlant:'204',gradingDirection:'forward','grading-lowFrequencyMHz':'261','grading-highFrequencyMHz':'1215','grading-ptvLimitDb':'20','grading-lowTargetDbmv':'34','grading-highTargetDbmv':'49','grading-maxLevelErrorDb':'1','grading-tiltTargetDb':'15','grading-maxTiltErrorDb':'1'})){const field=d.querySelector('#'+id);field.value=value;field.dispatchEvent(new a.w.Event(id.startsWith('grading-')?'input':'change',{bubbles:true}));}
 const grade=await ev('SweepGradingUI').grade();assert.equal(grade.result.metrics.ptvDb,15);assert.equal(grade.result.metrics.lowLevelErrorDb,0);assert.equal(grade.result.overall,'pass','Plan reference does not replace independently entered grading criteria');
 const historical=ev('SweepGradingUI').freshness(grade);ev('delete state.setup.companyTargetProfile;SweepGradingUI.render()');assert.equal(ev('SweepGradingUI').freshness(grade),historical,'unrelated Plan reference choice does not invalidate independent grading history');ev(`state.setup.companyTargetProfile=${JSON.stringify(high)}`);
 await ev(`JobsUI.open(${JSON.stringify(copy)})`);assert.deepEqual(a.json('state.stationView'),station);
 await ev(`openProjectText(${JSON.stringify(JSON.stringify(before))},true)`);const after=await ev('evidenceExportProject(state)');assert.equal(after.setup.companyTargetProfile,high);assert.equal(after.evidenceFiles[0].base64,before.evidenceFiles[0].base64);assert.deepEqual(JSON.parse(JSON.stringify(after.stationView)),station);
 ev('WorkflowUI.go("station")');assert.match(d.querySelector('[data-station-forward-result]').textContent,/company|basis/i);assert.equal(ev('StationView.results().forward.ok'),false);
});
test('legacy per-pilot comparison does not require the other pilot or a complete solver',t=>{
 const a=start(t);assert.equal(a.ev('StationMath.pilots({lowMHz:54,highMHz:753,measuredLow:33,targetLow:32}).errorLow'),1);assert.equal(a.ev('StationMath.pilots({lowMHz:54,highMHz:753,measuredLow:33,targetLow:32}).errorHigh'),null);
 assert.equal(a.ev('StationMath.pilots({lowMHz:54,highMHz:"",measuredLow:33,targetLow:32}).errorLow'),1);
 assert.equal(a.ev('StationMath.pilots({lowMHz:54,highMHz:54,measuredLow:33,targetLow:32}).errorLow'),null);
 assert.equal(a.ev('StationMath.pilots({lowMHz:54,highMHz:753,measuredLow:33,targetLow:32},{forwardBand:[258,1218]}).errorLow'),null);
});
test('company-selected meter predictions and explicitly tagged project criteria do not produce absolute comparisons',t=>{
 const a=start(t);a.ev(`loadState(TrainingJob.makePractice('complete'));state.setup.companyTargetProfile=${JSON.stringify(low)};state.rows[0].meters={through:{frequency:54,reading:30}}`);
 assert.equal(a.ev('meterComparison(state.rows[0],"through").error'),null);assert.equal(a.ev('meterComparison(state.rows[0],"through").inside'),true,'independent manual profile criteria remain available');
 const r=a.json(`ProjectMath.evaluate({lowMHz:54,highMHz:753,rawLow:32,rawHigh:43,addLow:0,addHigh:0,targetLow:32,targetHigh:43,basis:'Measured'},{companyTargetProfile:${JSON.stringify(low)}})`);assert.equal(r.errorLow,null);assert.equal(r.errorHigh,null);assert.equal(r.tiltError,null);assert.equal(r.within,false);assert.match(r.detail,/basis|bandwidth/i);
 a.ev('state.project.forward=[{profile:"1200",companyTargetProfile:"company-42-20261113",lowMHz:54,highMHz:753,rawLow:32,rawHigh:43,addLow:0,addHigh:0,targetLow:32,targetHigh:43,basis:"Measured"}];renderProjects()');
 assert.match(a.d.querySelector('#project-result-forward-0').textContent,/Company basis unconfirmed/,'actual project adapter must carry the selected company context');
 a.ev('projectCsv("forward")');assert.match(a.downloads.at(-1).text,/Company basis unconfirmed/,'project export keeps the company comparison unavailable');
});
test('invalid company profile metadata is rejected before replacing a working job',t=>{
 const a=start(t),before=a.json('state');
 for(const id of [null,true,[],{},'unknown-company-profile']){
  const bad=JSON.parse(JSON.stringify(before));bad.setup.companyTargetProfile=id;
  assert.throws(()=>a.ev(`loadState(${JSON.stringify(bad)})`),/company node target profile/);assert.deepEqual(a.json('state'),before);
 }
});
test('Plan selection preserves approved independent project records and meter criteria',t=>{
 const a=start(t),{ev,d}=a;ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("setup")');
 ev(`Object.assign(projectProfile('1200'),{approved:'Yes',plannedUpper:1200,available:993,equipmentUpper:1218,returnCeiling:204,forwardFloor:258,forwardLow:261,fLevelTol:1,fTiltTol:1,fRippleMax:2,minMer:35});state.project.forward=[{profile:'1200',basis:'Measured',stage:'After',station:'A1',plane:'Main output',trace:'synthetic-after.csv',traceSaved:'Yes',reviewer:'Synthetic reviewer',lowMHz:261,highMHz:993,rawLow:14,rawHigh:26,addLow:20,addHigh:20,targetLow:34,targetHigh:46,ripple:1.5,mer:38}];renderProjects()`);
 const before=a.json('ProjectMath.evaluate(state.project.forward[0],projectProfile(state.project.forward[0].profile),"forward")'),records=a.json('state.project.forward');assert.equal(before.within,true);
 // An explicit meter frequency and manual profile target are independent of the node design.
 ev('state.project.selectedProfile="750";Object.assign(projectProfile("750"),{forwardLow:54,launchLow:31,fLevelTol:1});state.rows[0].meters={through:{frequency:54,reading:30}}');
 const meter=a.json('meterComparison(state.rows[0],"through")');assert.equal(meter.inside,true);
 d.querySelector('#companyTargetProfile').value=low;d.querySelector('#applyCompanyTarget').click();
 assert.deepEqual(a.json('ProjectMath.evaluate(state.project.forward[0],projectProfile(state.project.forward[0].profile),"forward")'),before);assert.deepEqual(a.json('state.project.forward'),records);
 assert.match(d.querySelector('#project-result-forward-0').textContent,/Within entered limits/);
 assert.equal(ev('meterComparison(state.rows[0],"through").inside'),true);assert.equal(ev('meterComparison(state.rows[0],"through").target'),31);
 ev('projectCsv("forward")');assert.match(a.downloads.at(-1).text,new RegExp(before.status));
});
test('an explicit company record association remains unknown without changing independent criteria',t=>{
 const a=start(t);const r=a.json(`ProjectMath.evaluate({companyTargetProfile:${JSON.stringify(low)},lowMHz:54,highMHz:753,rawLow:32,rawHigh:43,addLow:0,addHigh:0,targetLow:32,targetHigh:43,basis:'Measured'},{})`);assert.equal(r.errorLow,null);assert.equal(r.errorHigh,null);assert.equal(r.within,false);assert.match(r.detail,/basis|bandwidth/i);
});
test('Plan selection preserves an independent node worksheet and shows company comparison separately',t=>{
 const a=start(t),{ev,d,w}=a;ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")');const select=d.querySelector('[data-station-target]');select.value='source';select.dispatchEvent(new w.Event('change',{bubbles:true}));
 for(const [key,value]of Object.entries({lowMHz:'54',highMHz:'860',measuredLow:'31',measuredHigh:'43',targetLow:'31',targetHigh:'43',plane:'node-output'})){const el=d.querySelector(`[data-station-scope="forward"][data-station-field="${key}"]`);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));}
 const before=a.json('StationView.results().forward'),records=a.json('state.stationView');assert.equal(before.ok,true);
 ev('WorkflowUI.go("setup")');d.querySelector('#companyTargetProfile').value=low;d.querySelector('#applyCompanyTarget').click();
 assert.deepEqual(a.json('StationView.results().forward'),before);assert.deepEqual(a.json('state.stationView'),records);
 assert.equal(ev('StationView.results().company.errorLow'),null);assert.equal(ev('StationView.results().company.targetLow'),32);assert.equal(ev('StationView.results().company.targetHigh'),null);
 ev('WorkflowUI.go("station")');assert.match(d.querySelector('[data-station-forward-result]').textContent,/independently entered worksheet|manual worksheet/i);assert.match(d.querySelector('[data-company-station-targets]').textContent,/acceptance: —/);
 const highInput=d.querySelector('[data-station-scope="forward"][data-station-field="measuredHigh"]');highInput.value='';highInput.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(d.querySelector('[data-station-forward-result]').textContent,/Independent low \/ high level error:/,'partial manual comparison remains visible beside the separate company reference');
});
test('company sweep grading preserves raw peak-to-valley and measured tilt without absolute grades',t=>{
 const a=start(t);const result=a.json(`SweepGrading.evaluateSeries({unit:'dBmV',points:[[54,32],[200,35],[753,43]]},{lowFrequencyMHz:54,highFrequencyMHz:753,ptvLimitDb:20,lowTargetDbmv:32,highTargetDbmv:43,maxLevelErrorDb:1,tiltTargetDb:11,maxTiltErrorDb:1},{companyTargetProfile:${JSON.stringify(low)}})`);
 assert.equal(result.metrics.ptvDb,11);assert.equal(result.metrics.measuredTiltDb,11);assert.equal(result.metrics.lowLevelErrorDb,null);assert.equal(result.metrics.highLevelErrorDb,null);assert.equal(result.metrics.tiltErrorDb,null);assert.equal(result.checks.lowLevel.status,'unknown');assert.equal(result.overall,'unknown');
});
test('explicit company profile meter criteria remain unknown while a legacy prediction and manual criteria stay independent',t=>{
 const a=start(t);a.ev('loadState(TrainingJob.makePractice("complete"));state.project.selectedProfile="750";Object.assign(projectProfile("750"),{forwardLow:54,launchLow:32,fLevelTol:1});state.rows[0].meters={through:{frequency:54,reading:32}};renderAll()');
 const before=a.json('meterComparison(state.rows[0],"through")');assert.equal(before.inside,true);
 a.ev('projectProfile("750").companyTargetProfile="company-42-20261113";renderAll()');
 const tagged=a.json('meterComparison(state.rows[0],"through")');assert.equal(tagged.inside,null);assert.equal(tagged.target,32);assert.equal(tagged.measurement,32);assert.equal(tagged.prediction,before.prediction);assert.equal(tagged.error,before.error,'independent legacy prediction error remains available');
 const text=a.d.querySelector('[data-row="r1"] [data-meter-port="through"] .meter-result').textContent;assert.match(text,/company.*comparison.*unavailable|basis.*unconfirmed/i);assert.doesNotMatch(text,/Inside profile|Outside profile/);
 a.ev('delete projectProfile("750").companyTargetProfile;renderAll()');assert.equal(a.ev('meterComparison(state.rows[0],"through").inside'),true);
});
test('company node apply leaves absent amp targets unknown in actual UI and direct engine, preserving explicit and legacy values',t=>{
 const a=start(t),{ev,d}=a;ev('loadState(TrainingJob.makePractice("complete"));state.rows.filter(r=>device(r.device)?.active).forEach(r=>{delete r.targetLow;delete r.targetHigh});renderAll();WorkflowUI.go("setup")');
 assert.equal(d.querySelector('[data-row="r1"] [data-field="targetLow"]').value,'31');const before=a.json('state.rows');
 d.querySelector('#companyTargetProfile').value=low;d.querySelector('#applyCompanyTarget').click();assert.deepEqual(a.json('state.rows'),before);
 for(const key of ['targetLow','targetHigh'])assert.equal(d.querySelector(`[data-row="r1"] [data-field="${key}"]`).value,'');
 const b=a.json('HFC.gainBudget(state,catalog,{rowId:"r1"})');assert.equal(b.low.target,null);assert.equal(b.high.target,null);assert.equal(b.low.requiredGain,null);assert.equal(b.high.margin,null);assert.equal(b.gainStatus,'missing');assert(Number.isFinite(b.low.input));assert(Number.isFinite(b.low.predictedOutput));assert.match(d.querySelector('#gain-budget-r1').textContent,/amplifier.*target|amp.*target/i);assert.equal(d.querySelector('#gain-budget-r1 .gain-ok'),null);
 ev('state.rows[0].targetLow=38;renderAll()');const partial=a.json('HFC.gainBudget(state,catalog,{rowId:"r1"})');assert.equal(partial.low.target,38);assert(Number.isFinite(partial.low.requiredGain));assert.equal(partial.high.target,null);assert.equal(partial.gainStatus,'missing');assert.equal(d.querySelector('#gain-budget-r1 .gain-ok'),null);
 ev('state.rows[0].targetHigh=49;renderAll()');assert.deepEqual(a.json('(()=>{const b=HFC.gainBudget(state,catalog,{rowId:"r1"});return [b.low.target,b.high.target]})()'),[38,49]);
 ev('delete state.setup.companyTargetProfile;delete state.rows[0].targetLow;delete state.rows[0].targetHigh;renderAll()');assert.equal(a.ev('HFC.gainBudget(state,catalog,{rowId:"r1"}).low.target'),32,'legacy fallback remains the entered launch value');
});
test('company per-pilot domain reasons survive comparison and Station display while the valid pilot remains visible',t=>{
 const c=api(),r=c.compare(low,{lowMHz:54,highMHz:860,split:'42',plane:'node-output',unit:'dBmV'});assert.equal(r.targetLow,32);assert.equal(r.targetHigh,null);assert.equal(r.applicable,false);assert.match(r.pilotReasons.high,/54–753.*no extrapolation/);assert.match(r.reason,/High pilot.*54–753/);
 const a=start(t);a.ev('loadState(TrainingJob.makePractice("complete"));state.setup.companyTargetProfile="company-42-20261113";WorkflowUI.go("station")');const select=a.d.querySelector('[data-station-target]');select.value='source';select.dispatchEvent(new a.w.Event('change',{bubbles:true}));
 for(const [key,value]of Object.entries({lowMHz:'54',highMHz:'860',plane:'node-output'})){const el=a.d.querySelector(`[data-station-scope="forward"][data-station-field="${key}"]`);el.value=value;el.dispatchEvent(new a.w.Event('input',{bubbles:true}));}
 assert.match(a.d.querySelector('[data-station-forward-result]').textContent,/High pilot.*54–753/);assert.match(a.d.querySelector('[data-company-station-targets]').textContent,/32\.0 \/ —/);
});
