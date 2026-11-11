/* 0.12 field-flow checks. Synthetic DOM/IndexedDB; physical Android is not implied. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');process.chdir(root);
execFileSync('python3',['night-sweep/build.py']);
const errors=[],downloads=[],prompts=[],cases=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('outputs/Night_Sweep.html','utf8'),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};
 w.confirm=message=>{prompts.push(message);return true;};w.structuredClone=structuredClone;
 w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;
 Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
 w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
}});
const w=dom.window,d=w.document,ev=source=>w.eval(source),json=source=>JSON.parse(ev('JSON.stringify('+source+')'));
const fixture=JSON.parse(fs.readFileSync('qa/fixtures/alpha011-node-project.json','utf8'));
const copy=x=>JSON.parse(JSON.stringify(x));
function near(actual,expected,tol=1e-6){assert(Number.isFinite(actual),`Expected finite number, got ${actual}`);assert(Math.abs(actual-expected)<=tol,`${actual} != ${expected}`);}
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
function set(selector,value,event='input'){const el=d.querySelector(selector);assert(el,selector);if(el.type==='checkbox')el.checked=!!value;else el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));return el;}
function click(selector){const el=d.querySelector(selector);assert(el,selector);el.click();return el;}
function load(s=fixture){ev('loadState('+JSON.stringify(copy(s))+')');}
const file=(name,contents,type='application/octet-stream')=>{const bytes=typeof contents==='string'?new TextEncoder().encode(contents):contents;return {name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer};};
const meter=(port,field)=>`[data-row="r1"] [data-meter-port="${port}"] [data-meter-field="${field}"]`;
(async()=>{
 await check('0.12 boots with the node and ONX evidence panels intact',()=>{
  assert.deepEqual(errors,[]);assert(d.body.textContent.includes('Carpe Noctum 2.0 Alpha build 3'));
  assert(d.getElementById('nodePanel'));assert(d.getElementById('evidencePanel'));
  for(const id of ['sameSpanNext','cascadeStrip','themeToggle','jobsPanel'])assert(d.getElementById(id),id);
 });
 await check('Unreadable autosave produces a persistent recovery warning and restores the Sun preference',()=>{
  const localErrors=[],localVc=new VirtualConsole();localVc.on('jsdomError',e=>localErrors.push(e.message));
  const broken=new JSDOM(fs.readFileSync('outputs/Night_Sweep.html','utf8'),{url:'https://corrupt.nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:localVc,beforeParse(window){
   window.ResizeObserver=class{observe(){}};window.scrollTo=()=>{};window.confirm=()=>true;window.structuredClone=structuredClone;window.indexedDB=new FDB.IDBFactory();
   window.TextEncoder=TextEncoder;window.TextDecoder=TextDecoder;window.Uint8Array=Uint8Array;window.ArrayBuffer=ArrayBuffer;
   Object.defineProperty(window.crypto,'subtle',{value:webcrypto.subtle});
   window.localStorage.setItem('hfc-route-v1','{broken project');window.localStorage.setItem('nightsweep-theme-v1','sun');
  }});
  try{assert.deepEqual(localErrors,[]);assert.equal(broken.window.document.getElementById('storageWarning').hidden,false);assert.match(broken.window.document.getElementById('storageWarning').textContent,/could not be read/);assert.equal(broken.window.localStorage.getItem('hfc-route-v1-unreadable'),'{broken project');assert.equal(broken.window.document.documentElement.dataset.theme,'sun');}
  finally{broken.window.close();}
 });
 await check('0.11 version-one job opens without new optional field requirements',async()=>{
  assert.equal(fixture.version,1);assert(!fixture.rows.some(r=>r.meters||r.drop));
  await w.NightSweep.openProject(JSON.stringify(fixture));assert.deepEqual(json('state.node'),fixture.node);
  assert.equal(ev('state.rows.length'),3);assert.equal(ev('state.setup.liveMax'),993);
 });
 await check('0.1 version-one file still opens with original RF arithmetic',async()=>{
  const legacy=JSON.parse(fs.readFileSync('qa/fixtures/legacy-0.1-project.json','utf8'));
  await w.NightSweep.openProject(JSON.stringify(legacy));assert.equal(ev('state.project.meta.job'),'SYNTHETIC-UPGRADE-011');
  const predicted=ev('HFC.run(state,catalog,261).results[0].outputs.find(p=>p.role==="tap").level');assert(Number.isFinite(predicted));load();
 });
 await check('Sample cascade golden levels remain the published 0.11 values',()=>{
  const lo=json('evaluate(261).results'),hi=json('evaluate(993).results');
  near(lo[2].outputs.find(p=>p.role==='through').level,23.04,0.005);
  near(lo[2].outputs.find(p=>p.role==='tap').level,5.45,0.005);
  near(hi[2].outputs.find(p=>p.role==='through').level,24.71,0.005);
  near(hi[2].outputs.find(p=>p.role==='tap').level,7.90,0.005);
  near(lo[0].cableLoss,4.073,0.0005);near(hi[0].cableLoss,8.394,0.0005);
 });
 await check('Reference self-check proves the golden cases and exposes a failed-build trust banner',()=>{
  const result=ev('referenceCases(HFC,catalog,NodeTools)');assert.equal(result.ok,true);assert(result.cases.length>=7);
  assert.equal(w.NightSweep.selfCheck.ok,true);assert.equal(d.getElementById('selfCheckWarning').hidden,true);
  ev('globalThis.originalReferenceCases=referenceCases;referenceCases=()=>({ok:false,cases:[{label:"Synthetic failure",ok:false,error:"Injected test"}]});runBuildSelfCheck()');
  assert.equal(d.getElementById('selfCheckWarning').hidden,false);assert.match(d.getElementById('selfCheckWarning').textContent,/not.*trust|do not trust/i);
  ev('referenceCases=globalThis.originalReferenceCases;delete globalThis.originalReferenceCases;runBuildSelfCheck()');assert.equal(d.getElementById('selfCheckWarning').hidden,true);
 });
 await check('Meter boxes distinguish missing measurement, zero measurement and prediction',()=>{
  const before=json('state.project');assert.equal(ev('meterComparison(state.rows[0],"through").measurement'),null);
  assert.equal(ev('meterComparison(state.rows[0],"through").error'),null);
  set(meter('through','reading'),'0');const result=json('meterComparison(state.rows[0],"through")');
  assert.equal(result.measurement,0);near(result.error,-result.prediction);
  assert.deepEqual(json('state.project'),before);assert.equal(ev('state.evidence?.length||0'),0);
  set(meter('through','reading'),'');assert.equal(ev('meterComparison(state.rows[0],"through").measurement'),null);
 });
 await check('Meter error uses the converted reading and blank TP coupling adds nothing',()=>{
  set(meter('through','reading'),'10');set(meter('through','testPoint'),true,'change');
  let result=json('meterComparison(state.rows[0],"through")');assert.equal(result.measurement,10);assert.equal(result.converted,false);
  set(meter('through','coupling'),'20');result=json('meterComparison(state.rows[0],"through")');assert.equal(result.measurement,30);assert.equal(result.converted,true);near(result.error,30-result.prediction);
  set(meter('through','coupling'),'-1');assert.equal(ev('meterComparison(state.rows[0],"through").measurement'),null);
  set(meter('through','coupling'),'');assert.equal(ev('meterComparison(state.rows[0],"through").measurement'),10);
 });
 await check('Published node TP is scoped to launch; station coupling remains entered explicitly',()=>{
  assert.equal(ev('publishedNodeTestPoint().coupling'),20);assert.equal(ev('publishedNodeTestPoint().tolerance'),1);
  assert.equal(d.querySelector(meter('tap','couplingChoice')+' option[value="node"]'),null);
  set(meter('tap','reading'),'5');assert.equal(ev('meterComparison(state.rows[0],"tap").measurement'),5);
  set(meter('tap','couplingChoice'),'20','change');const m=json('state.rows[0].meters.tap');assert.equal(m.coupling,'20');assert.equal(m.tpReference,undefined);
  assert.equal(ev('meterComparison(state.rows[0],"tap").measurement'),25);
 });
 await check('Profile comparison requires exact marker targets and stays outside official acceptance',()=>{
  ev('Object.assign(projectProfile("1200"),{forwardLow:261,forwardHigh:993,launchLow:25,launchHigh:35,fLevelTol:1,approved:"No"});renderMeterResults()');
  assert.equal(ev('meterComparison(state.rows[0],"tap").inside'),true);
  set(meter('tap','reading'),'8');assert.equal(ev('meterComparison(state.rows[0],"tap").inside'),false);
  set(meter('tap','frequency'),'300');assert.equal(ev('meterComparison(state.rows[0],"tap").target'),null);
  assert.equal(ev('state.project.forward.length'),0);assert.equal(ev('projectProfile("1200").approved'),'No');
 });
 await check('Launch TP conversion changes predictions without changing raw anchors',()=>{
  load();const before=ev('evaluate(261).source');set('[data-launch-meter="launchTestPoint"]',true,'change');
  assert.equal(ev('evaluate(261).source'),before);
  set('[data-launch-meter="launchCouplingChoice"]','20','change');near(ev('evaluate(261).source'),before+20);assert.equal(ev('state.setup.lowLevel'),34);
  set('[data-launch-meter="launchCoupling"]','');near(ev('evaluate(261).source'),before);
  ev('state.setup.launchMode="table";state.setup.launchTable="261,14\\n993,26";state.setup.launchCoupling=20;renderAll()');near(ev('evaluate(261).source'),34);near(ev('evaluate(993).source'),46);load();
 });
 await check('Face picker offers only actual family/port-count catalog records',()=>{
  const choices=json('faceChoices(device(state.rows[0].device)).map(d=>({id:d.id,family:d.family,ports:d.tapPorts,face:faceValue(d)}))');
  assert(choices.length>=4);assert(choices.every(c=>c.family===ev('device(state.rows[0].device).family')&&c.ports===4));assert(choices.some(c=>c.face===20));
  const candidate=choices.find(c=>c.face===20),result=json('facePrediction(state.rows[0],'+JSON.stringify(candidate.id)+',261)');
  near(result.level,result.input-result.loss);click('[data-row="r1"] [data-face-choice="'+candidate.id+'"]');assert.equal(ev('state.rows[0].device'),candidate.id);
 });
 await check('Picker token-AND search widens a tap filter to find the LHI inserter',()=>{
  load();set('[data-part-search="r1"]','LHI');
  const row=d.querySelector('[data-row="r1"]');assert.match(row.querySelector('[data-picker-hint]').textContent,/widened.*whole catalog/i);
  const choice=[...row.querySelector('[data-field="device"]').options].find(o=>o.textContent.includes('LHI116'));assert(choice);
  assert.equal(ev('passiveType(device('+JSON.stringify(choice.value)+'))'),'inserter');
  assert.equal(ev('partSearchMatches(device('+JSON.stringify(choice.value)+'),"LHI116 nonexistenttoken")'),false);
  assert.equal(ev('partSearchMatches({model:"AAA",label:"BBB",family:"CCC",note:"inspecting cabinet",ports:[{label:"Return leg"}]},"cabinet return")'),true);
  set('[data-part-search="r1"]','');load();
 });
 await check('Same span chooses the next lower published face and last through',()=>{
  load();ev('state.rows=state.rows.slice(0,1);renderAll()');const row=json('sameSpanNextTap()');
  assert.equal(row.parent,'r1::through');assert.equal(row.length,400);assert.equal(row.cable,'p3_625');assert.equal(ev('faceValue(device(state.rows[1].device))'),20);
  const face=json('faceChoices(device(state.rows[1].device)).map(d=>d.id)');assert(face.includes(row.device));load();
 });
 await check('Apply following span lengths is explicit and can be cancelled',()=>{
  set('[data-row="r1"] [data-field="length"]','123');assert.equal(ev('state.rows[1].length'),250);
  w.confirm=()=>false;click('[data-row="r1"] [data-apply-length]');assert.equal(ev('state.rows[1].length'),250);
  w.confirm=message=>{prompts.push(message);return true;};click('[data-row="r1"] [data-apply-length]');assert.equal(ev('state.rows[1].length'),'123');assert.equal(ev('state.rows[2].length'),'123');load();
 });
 await check('Cascade marks bad parents without silently reconnecting the route',()=>{
  ev('state.rows[1].parent="r999::through";renderAll()');assert(d.querySelector('#cascadeStrip .cascade-bad'));assert.match(d.getElementById('cascadeStrip').textContent,/Bad parent/);
  assert.equal(ev('evaluate(261).results[1].input.level'),null);assert.equal(ev('state.rows[1].parent'),'r999::through');load();
 });
 await check('Point arithmetic exposes cable factors and each predicted output',()=>{
  assert.match(d.querySelector('[data-row="r1"] .arithmetic-results').textContent,/dB\/100 ft/);
  assert.match(d.querySelector('[data-row="r1"] .arithmetic-results').textContent,/Predicted equipment input/);
  assert.match(d.querySelector('[data-row="r1"] .arithmetic-results').textContent,/temperature factor/);
 });
 await check('Drop requires explicit RG-6 loss and uses only catalog splitter losses',()=>{
  click('[data-row="r1"] [data-drop-add]');ev('state.rows[0].drop.length=100;renderAll()');
  assert.equal(ev('dropCalculation(state.rows[0],261).outputs[0].level'),null);
  ev('state.rows[0].drop.customCable="261,2\\n993,4";renderAll()');let x=json('dropCalculation(state.rows[0],261)');near(x.outputs[0].level,x.input-2);
  const splitter=ev('dropSplitters().find(d=>d.model==="CMC5002H-A").id');
  ev('state.rows[0].drop.splitter='+JSON.stringify(splitter)+';renderAll()');x=json('dropCalculation(state.rows[0],261)');assert(x.outputs.length>0);assert.match(x.warning,/AC-blocking/);
  for(const output of x.outputs)near(output.level,x.input-x.cableLoss-output.loss);
  assert.equal(ev('dropCalculation(state.rows[0],1200).outputs[0].level'),null);
  assert.equal(ev('state.rows.length'),3);assert.equal(ev('state.power.rows.length'),1);
 });
 await check('Meter/drop optional fields survive version-one save/open',()=>{
  ev('state.rows[0].meters={tap:{frequency:261,reading:5,testPoint:true,coupling:20}}');const before=json('state.rows[0]');
  const saved=json('state');load(saved);assert.deepEqual(json('state.rows[0].drop'),before.drop);assert.deepEqual(json('state.rows[0].meters'),before.meters);assert.equal(ev('state.version'),1);load();
 });
 await check('Sun switch persists the device palette and switches back to Night',()=>{
  ev('JobsUI.theme("sun")');assert.equal(d.documentElement.dataset.theme,'sun');assert.equal(w.localStorage.getItem('nightsweep-theme-v1'),'sun');
  click('#themeToggle');assert.equal(d.documentElement.dataset.theme,'night');assert.equal(w.localStorage.getItem('nightsweep-theme-v1'),'night');
 });
 await check('Power what-if recalculates a copied circuit and keeps it only on request',()=>{
  load();ev('state.power.rows[0].mode="amps";state.power.rows[0].load=0;state.power.rows[0].length=0;renderPower();refreshPower()');
  const before=ev('JSON.stringify(state.power.rows)'),trial=json('powerWhatIfCalculation({parent:"supply",cable:"p3_625",length:1000,amps:2,minV:85})');
  assert.equal(trial.ok,true);near(trial.voltage,87.8);near(trial.headroom,2.8);assert.equal(ev('JSON.stringify(state.power.rows)'),before);
  set('[data-trial="parent"]','supply','change');set('[data-trial="length"]','1000');set('[data-trial="amps"]','2');set('[data-trial="minV"]','85');
  assert.equal(ev('state.power.rows.length'),1);assert.equal(d.getElementById('trialVoltage').textContent,'87.80 V');
  click('#keepPowerTrial');assert.equal(ev('state.power.rows.length'),2);assert.equal(ev('state.power.rows[1].load'),'2');assert(!ev('state.power.whatIf'));load();
 });
 await check('Run sheet separates predictions and measurements at the selected frequency',()=>{
  ev('state.rows[0].meters={tap:{frequency:261,reading:5,testPoint:true,coupling:20}};renderAll();FieldReport.openSheet()');
  const data=json('FieldReport.sheetData()'),tap=data.rows.find(r=>r.point==='Tap 1'&&r.role==='tap');
  assert.equal(data.frequency,261);assert.match(data.node,/EN9000/);assert.equal(data.operatingUpper,1218);assert.equal(tap.measurement,25);assert.equal(tap.converted,true);near(tap.error,25-tap.tap);
  set('#runSheetFrequency','993');const mismatch=json('FieldReport.sheetData().rows.find(r=>r.point==="Tap 1"&&r.role==="tap")');assert.equal(mismatch.measurement,null);assert.equal(mismatch.error,null);assert.equal(mismatch.meterOtherFrequency,261);
  set('#runSheetFrequency','261');click('#runSheetShare');assert.equal(downloads.at(-1).mime,'text/plain');assert.match(downloads.at(-1).text,/Node:.*EN9000/);
  click('#runSheetPrint');assert(d.body.classList.contains('print-runsheet'));w.NightSweep.restorePrint();assert(!d.body.classList.contains('print-runsheet'));
  ev('showTab("route")');load();
 });
 await check('Named job save warns for samples and preserves an existing real job',()=>{
  load();const initial=ev('JobsUI.snapshots().length');w.confirm=()=>false;assert.equal(ev('JobsUI.saveNamed()'),false);assert.equal(ev('JobsUI.snapshots().length'),initial);
  w.confirm=message=>{prompts.push(message);return true;};ev('state.example=false;state.job={name:"Pole 77",node:"N77",date:"2026-11-06",lead:"Field tech"}');
  const id=ev('JobsUI.saveNamed()');assert.match(id,/^job_/);assert.equal(json('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(id)+').job').name,'Pole 77');
  ev('example();renderAll()');assert.equal(ev('state.example'),true);assert.equal(ev('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(id)+').example'),false);
 });
 const csv='frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n',binary=new Uint8Array([80,75,3,4,0,128,255]);
 let jobId,duplicateId,attachedIds;
 await check('Named jobs retain original evidence through duplicate, new job and reopening',async()=>{
  load();ev('state.example=false;state.job={name:"Evidence job",node:"N11",date:"2026-11-06",lead:"Lead"}');
  await ev('EvidenceUI').importFiles([file('onx-sweep.csv',csv,'text/csv'),file('opaque-onx.zip',binary,'application/zip')],{kind:'Sweep',stage:'Before',asset:'N11',notes:'Synthetic evidence'});
  jobId=ev('JobsUI.saveNamed()');duplicateId=ev('JobsUI.duplicate('+JSON.stringify(jobId)+')');attachedIds=json('state.evidence.map(m=>m.id)');
  assert.equal(ev('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(duplicateId)+').evidence.length'),2);
  await ev('JobsUI.newJob()');assert.equal(ev('state.evidence?.length||0'),0);
  await ev('EvidenceUI.cleanupUnused()');
  await ev('JobsUI.open('+JSON.stringify(jobId)+')');assert.equal(ev('state.evidence.length'),2);
  const bundle=await w.evidenceExportProject(ev('state'));assert.equal(bundle.evidenceFiles.length,2);assert.deepEqual([...w.EvidenceCore.base64ToBytes(bundle.evidenceFiles[1].base64)],[...binary]);
  assert(attachedIds.every(id=>ev('JobsUI.referencedEvidenceIds().has('+JSON.stringify(id)+')')));
 });
 await check('Cancelled job switch keeps the entire evidence-owning working state',async()=>{
  const before=ev('JSON.stringify(state)');w.confirm=()=>false;
  assert.equal(await ev('JobsUI.open('+JSON.stringify(duplicateId)+')'),false);assert.equal(ev('JSON.stringify(state)'),before);
  w.confirm=message=>{prompts.push(message);return true;};
 });
 await check('Evidence operations block opening, deleting and duplicating named jobs',async()=>{
  let release;const pendingFile={name:'pending.csv',size:csv.length,type:'text/csv',arrayBuffer:()=>new Promise(resolve=>release=resolve)};
  const pending=ev('EvidenceUI').importFiles([pendingFile],{kind:'Sweep',stage:'Reference',asset:'N11'});assert(w.evidenceIsBusy());
  await assert.rejects(()=>ev('JobsUI.open('+JSON.stringify(duplicateId)+')'),/current evidence operation/);
  assert.throws(()=>ev('JobsUI.duplicate('+JSON.stringify(jobId)+')'),/current evidence operation/);
  assert.throws(()=>ev('JobsUI.remove('+JSON.stringify(duplicateId)+')'),/current evidence operation/);
  release(new TextEncoder().encode(csv).buffer);await pending;assert(!w.evidenceIsBusy());
 });
 await check('Named job deletion leaves separately referenced evidence available',async()=>{
  assert.equal(ev('JobsUI.remove('+JSON.stringify(duplicateId)+')'),true);assert(!ev('JobsUI.snapshots().some(s=>s.job.id==='+JSON.stringify(duplicateId)+')'));
  await ev('EvidenceUI.cleanupUnused()');assert.equal((await w.evidenceExportProject(ev('state'))).evidenceFiles.length,3);
 });
 await check('Project import cancellation preserves evidence and confirmed import archives current originals',async()=>{
  const before=ev('JSON.stringify(state)');w.confirm=()=>false;
  await w.NightSweep.openProject(JSON.stringify(fixture));assert.equal(ev('JSON.stringify(state)'),before);
  w.confirm=message=>{prompts.push(message);return true;};await w.NightSweep.openProject(JSON.stringify(fixture));
  assert.equal(ev('state.evidence?.length||0'),0);assert(ev('JobsUI.snapshots().some(s=>s.job.id==='+JSON.stringify(jobId)+'&&(s.evidence||[]).length===3)'));
  await ev('EvidenceUI.cleanupUnused()');await ev('JobsUI.open('+JSON.stringify(jobId)+')');assert.equal((await w.evidenceExportProject(ev('state'))).evidenceFiles.length,3);
 });
 await check('Importing an older backup with the same named-job ID cannot overwrite its newer evidence archive',async()=>{
  const incoming=await w.evidenceExportProject(ev('state'));incoming.evidence=incoming.evidence.slice(0,2);incoming.evidenceFiles=incoming.evidenceFiles.filter(f=>incoming.evidence.some(m=>m.id===f.id));
  assert.equal(incoming.job.id,jobId);await w.NightSweep.openProject(JSON.stringify(incoming));assert.equal(ev('state.evidence.length'),2);
  assert.equal(ev('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(jobId)+').evidence.length'),3);
  await ev('EvidenceUI.cleanupUnused()');await ev('JobsUI.open('+JSON.stringify(jobId)+')');assert.equal((await w.evidenceExportProject(ev('state'))).evidenceFiles.length,3);
 });
 await check('CSV exporters quote formula-like text and preserve negative numeric levels',()=>{
  ev('state.rows[0].name="=HYPERLINK(1)";state.power.rows[0].name="@SUM(1)";state.power.rows[0].mode="amps";state.power.rows[0].load=1;renderAll()');
  click('#csv');assert.match(downloads.at(-1).text,/"'=HYPERLINK\(1\)/);
  click('#powerCSV');assert.match(downloads.at(-1).text,/"'@SUM\(1\)/);
  assert.equal(ev('csvCell("-3.5")'),'"-3.5"');assert.equal(ev('csvCell("+2e3")'),'"+2e3"');assert.equal(ev('csvCell("-name")'),'"\'-name"');
 });
 await check('Spectrum and chart text distinguish hardware, live spectrum and stopped launch',()=>{
  assert.match(d.getElementById('chartNotes').textContent,/993/);
  assert.match(d.body.textContent,/993.*(?:certif|verif).*(?:1\.8|1800)|993.*(?:1\.8|1800).*(?:certif|verif)/i);
  assert.match(d.body.textContent,/hardware capability/i);
 });
 await check('All field-flow checks finish without script errors',()=>assert.deepEqual(errors,[]));
 const report={count:cases.length,cases,errors,scope:'Synthetic jsdom/fake-indexeddb checks; layout, physical Android and native ONX decoding are not validated.'};
 fs.writeFileSync('qa/alpha012-results.json',JSON.stringify(report,null,2)+'\n');
 console.log('Alpha 0.12 field checks passed: '+cases.length);dom.window.close();
})().catch(error=>{console.error(error);fs.writeFileSync('qa/alpha012-results.json',JSON.stringify({count:cases.length,cases,errors,failure:error.message},null,2)+'\n');dom.window.close();process.exitCode=1;});
