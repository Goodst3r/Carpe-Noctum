/* 0.13 APK -> 1.4 project migration, with original source producing the fixture. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');process.chdir(root);
const cases=[],instances=[];
function boot(html,label){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://'+label+'.nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});
 instances.push(dom);const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
 const set=(selector,value,event='input')=>{const e=d.querySelector(selector);assert(e,selector);if(e.type==='checkbox')e.checked=!!value;else e.value=value;e.dispatchEvent(new w.Event(event,{bubbles:true}));};
 return {w,d,ev,json,set,errors,downloads};
}
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
const clone=x=>JSON.parse(JSON.stringify(x));
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const file=(name,contents,type='text/csv')=>{const bytes=typeof contents==='string'?new TextEncoder().encode(contents):contents;return {name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer};};
(async()=>{
 const old=boot(fs.readFileSync(path.join(__dirname,'fixtures/alpha013-apk.html'),'utf8'),'old013');
 const csv='frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n';
 const opaque=new Uint8Array([80,75,3,4,0,255,23,68]);let bundle,oldLevels;
 await check('Supplied 0.13 APK app starts and produces a real schema-one fixture',async()=>{
  assert.deepEqual(old.errors,[]);assert.match(old.d.title,/0\.13/);
  old.ev('state.example=false;state.job={name:"0.13 upgrade job",node:"HA0005",date:"2026-11-10",lead:"Synthetic QA"};renderAll()');
  for(const [k,v] of Object.entries({node:'HA0005',lead:'Synthetic QA',workOrder:'WO-013-14',address:'Pole 77 / Span A',symptom:'High-end roll-off',startTime:'2026-11-10T01:00',endTime:'2026-11-10T02:30',weather:'44 F, dry',resolution:'Connectors replaced; cable replacement pending',partsUsed:'Two connectors'}))old.set('[data-job-field="'+k+'"]',v);
  old.set('[data-leakage-check="connectors"]',true,'change');old.set('[data-leakage-check="shielding"]',true,'change');old.set('[data-leakage-notes]','Rodent damage on spans 132 ft and 118 ft.');
  old.set('[data-leakage-value]','83.1');old.set('[data-maintenance-check="amplifierUnity"]',true,'change');old.set('[data-maintenance-notes="amplifierUnity"]','Input/output reference recorded separately.');
  old.set('[data-reference-target="tolerance"]','1.5');assert.equal(old.ev('FieldReference.fillTargets("sample993")'),true);
  old.set('[data-reference-cable="frequency"]','993');old.set('[data-reference-tap]','r2','change');
  old.ev('state.rows[0].asBuiltNote="Span measured 132 ft; map says 120 ft";state.rows[0].meters={tap:{frequency:261,reading:5,testPoint:true,coupling:20}};state.rows[0].drop={port:"tap",length:100,customCable:"261,2\\n993,4",splitter:"none"};renderAll()');
  await old.ev('EvidenceUI').importFiles([file('sweep-original.csv',csv),file('opaque-onx.zip',opaque,'application/zip')],{kind:'Sweep',stage:'Before',asset:'HA0005',notes:'Synthetic migration fixture'});
  old.ev('JobsUI.saveNamed()');bundle=await old.w.evidenceExportProject(old.ev('state'));
  oldLevels=old.json('[evaluate(261),evaluate(993)].map(x=>x.results.map(r=>r.outputs.map(p=>p.level)))');
  assert.equal(bundle.version,1);assert(bundle.fieldWork&&bundle.fieldReferences&&bundle.evidenceFiles.length===2);
 });
 const app=boot(fs.readFileSync('outputs/Night_Sweep.html','utf8'),'new15'),{w,d,ev,json,set}=app;
 await check('1.4 boots with all recovered 0.13 panels and golden self-check',()=>{
  assert.deepEqual(app.errors,[]);assert.match(d.title,/1\.8/);
  for(const id of ['fieldWorkPanel','fieldReferencePanel','jobsPanel','evidencePanel','launchTestPoint','runSheetPanel'])assert(d.getElementById(id),id);
  assert.equal(w.NightSweep.selfCheck.ok,true);
 });
 await check('0.13 portable backup imports into 1.4 with workflow, references and work order intact',async()=>{
  await w.NightSweep.openProject(JSON.stringify(bundle));
  for(const key of ['fieldWork','fieldReferences','job'])assert.deepEqual(json('state.'+key),clone(bundle[key]),key);
  for(const key of ['asBuiltNote','meters','drop'])assert.deepEqual(json('state.rows[0].'+key),clone(bundle.rows[0][key]),key);
  assert.equal(ev('state.project.meta.job'),'WO-013-14');assert.equal(ev('state.project.meta.node'),'HA0005');
 });
 await check('Original 0.13 RF predictions stay numerically unchanged after import',()=>assert.deepEqual(json('[evaluate(261),evaluate(993)].map(x=>x.results.map(r=>r.outputs.map(p=>p.level)))'),oldLevels));
 await check('Original meter conversion and drop arithmetic survive, without entering official acceptance',()=>{
  const meter=json('meterComparison(state.rows[0],"tap")');near(meter.measurement,25);near(meter.error,25-meter.prediction);
  const drop=json('dropCalculation(state.rows[0],261)');near(drop.outputs[0].level,drop.input-2);assert.equal(ev('state.project.forward.length'),0);
 });
 await check('Original ONX attachment bytes and CSV preview survive cross-version export/import',async()=>{
  const out=await w.evidenceExportProject(ev('state'));assert.equal(out.evidenceFiles.length,2);
  for(const meta of out.evidence){const part=out.evidenceFiles.find(x=>x.id===meta.id),bytes=w.EvidenceCore.base64ToBytes(part.base64);if(meta.name.endsWith('.csv'))assert.equal(new TextDecoder().decode(bytes),csv);else assert.deepEqual([...bytes],[...opaque]);}
  assert.equal(ev('state.evidence.find(x=>x.name.endsWith(".csv")).parse.status'),'parsed');assert.equal(ev('state.evidence.find(x=>x.name.endsWith(".zip")).parse.status'),'attachment');
 });
 await check('Recovered field-work converter retains same-plane 60 dB arithmetic and notes',()=>{
  near(ev('FieldWork.convert(state.fieldWork.leakage.conversion.value,"dbuv")'),23.1);
  assert.match(d.getElementById('leakageConversionResult').textContent,/23\.10/);
  assert.equal(d.querySelector('[data-leakage-check="connectors"]').checked,true);
  assert.match(d.querySelector('[data-maintenance-notes="amplifierUnity"]').value,/Input\/output/);
 });
 await check('Recovered target drafts require explicit application and retain approval separation',()=>{
  const before=json('state.project.profiles');assert.equal(ev('FieldReference.targetCalculation().ok'),true);
  assert.deepEqual(json('state.project.profiles'),before);
  assert.equal(ev('FieldReference.applyTargets()'),true);
  const p=json('FieldReference.draft().targets');assert.equal(Number(p.lowMin),32.5);assert.equal(Number(p.highMax),47.5);
  assert.equal(ev('projectProfile(state.project.selectedProfile).approved'),'No');assert.equal(ev('state.project.forward.length'),0);
 });
 await check('Run sheet includes the recovered work-order, as-built and workflow notes',()=>{
  ev('FieldReport.openSheet()');const text=ev('FieldReport.sheetText()');
  for(const value of ['WO-013-14','Pole 77 / Span A','High-end roll-off','Connectors replaced','Span measured 132 ft','Rodent damage','Input/output reference'])assert(text.includes(value),value);
  assert.match(d.getElementById('runSheetFieldWork').textContent,/Rodent damage/);
 });
 await check('RF, power and run-sheet CSVs retain 0.13 work-order and field-work context',()=>{
  for(const id of ['csv','powerCSV','runSheetCsv']){d.getElementById(id).click();const out=app.downloads.at(-1);assert.match(out.name,/1\.8/);assert.match(out.text,/WO-013-14/);assert.match(out.text,/Rodent damage/);}
 });
 let savedId,duplicateId;
 await check('Named-job duplicate/new/open retains recovered 0.13 records and original evidence',async()=>{
  savedId=ev('JobsUI.saveNamed()');duplicateId=ev('JobsUI.duplicate('+JSON.stringify(savedId)+')');
  assert.deepEqual(json('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(duplicateId)+').fieldWork'),clone(bundle.fieldWork));
  await ev('JobsUI.newJob()');assert.equal(ev('state.rows.length'),0);assert.equal(ev('state.fieldWork'),undefined);
  await ev('JobsUI.open('+JSON.stringify(savedId)+')');assert.deepEqual(json('state.fieldWork'),clone(bundle.fieldWork));
  await ev('EvidenceUI.cleanupUnused()');assert.equal((await w.evidenceExportProject(ev('state'))).evidenceFiles.length,2);
 });
 await check('1.4 active gain and TDR data coexist with 0.13 work-order and note metadata',()=>{
  ev('state.rows.push({id:"r90",name:"Candidate LE",parent:"r3::through",length:0,cable:"p3_625",device:"active_aoi_le",activeMode:"anchors",gainLow:20,gainHigh:30,gainLowF:261,gainHighF:993,targetLow:34,targetHigh:46});state.routeTools={frequency:993,endpoint:"r2",start:"source",direction:"forward",distance:450,lead:0,vfEnabled:false};renderAll()');
  const out=json('state'),needed=json('HFC.gainBudget(state,catalog)');assert(needed);assert.match(d.getElementById('tdrResult').textContent,/Estimated fault position/);
  ev('loadState('+JSON.stringify(out)+')');assert.deepEqual(json('state.fieldWork'),clone(bundle.fieldWork));assert.equal(ev('state.rows.at(-1).gainHigh'),30);assert.equal(ev('state.routeTools.distance'),450);assert.equal(ev('state.job.workOrder'),'WO-013-14');
 });
 await check('Invalid recovered 0.13 fields reject atomically without losing current 1.4 state',()=>{
  const before=ev('JSON.stringify(state)');
  const changes=[{fieldWork:{leakage:{checks:{connectors:'yes'}}}},{fieldReferences:{targets:{lowMin:{bad:true}}}},{job:{name:'Bad',resolution:'x'.repeat(8001)}}];
  for(const change of changes){const bad={...JSON.parse(before),...change};assert.throws(()=>ev('loadState('+JSON.stringify(bad)+')'));assert.equal(ev('JSON.stringify(state)'),before);}
 });
 await check('Recovered 0.13 notes remain escaped in run sheet and context CSV export',()=>{
  ev('state.fieldWork.leakage.notes="<img src=x onerror=alert(1)>";state.job.resolution="=HYPERLINK(1)";renderAll();FieldReport.openSheet()');
  assert.equal(d.querySelectorAll('#runSheetFieldWork img').length,0);assert.match(d.getElementById('runSheetFieldWork').textContent,/<img/);
  d.getElementById('runSheetCsv').click();assert.match(app.downloads.at(-1).text,/"'=HYPERLINK\(1\)/);
 });
 await check('Both original and rebuilt apps complete integration without DOM runtime errors',()=>{assert.deepEqual(old.errors,[]);assert.deepEqual(app.errors,[]);});
 fs.writeFileSync('qa/upgrade01314-results.json',JSON.stringify({version:'1.8 Alpha build 2',source:'Supplied 0.13 APK assets/index.html generated the test backup at runtime',count:cases.length,cases,errors:app.errors,scope:'Synthetic DOM/IndexedDB migration tests; no physical Android or browser layout claim'},null,2)+'\n');
 console.log('0.13 to 1.5 upgrade: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>instances.forEach(x=>x.window.close()));
