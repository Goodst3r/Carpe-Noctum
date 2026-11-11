/* Guided example flows, job preservation, and portable synthetic evidence. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..'),cases=[],instances=[];
const practicePath=suffix=>path.join(root,process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1'?'research/build2':'release','NightSweep_1.8_Alpha_build_2_'+suffix);
function standaloneHtml(){
 if(process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1')return require('./build2-source-harness.cjs').assembleHtml();
 let html=fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8');
 if(process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST!=='1')return html;
 // Bounded source integration while the release owner freezes/builds the final
 // standalone. Default QA always tests the generated release HTML unchanged.
 for(const [file,startMarker,endMarker] of [['training.js','/* Offline synthetic practice job.','function initTraining(){TrainingJob.init();}'],['sweep-setup.js','/* 2.0 Alpha build 1 guided field setup.',"if(typeof module!=='undefined'&&module.exports)module.exports=SweepSetup;"]]){
  const start=html.indexOf(startMarker),end=html.indexOf(endMarker,start);
  assert(start>=0&&end>start,'Could not isolate '+file+' for source-only integration.');
  html=html.slice(0,start)+fs.readFileSync(path.join(root,'night-sweep',file),'utf8')+html.slice(end+endMarker.length);
 }
 return html;
}
function boot(){
 const errors=[],downloads=[],prompts=[],control={confirm:true},vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(standaloneHtml(),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  w.confirm=message=>{prompts.push(message);return control.confirm;};w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});instances.push(dom);const w=dom.window,d=w.document,ev=source=>w.eval(source),json=source=>JSON.parse(ev('JSON.stringify('+source+')'));
 return {w,d,ev,json,errors,downloads,prompts,control,storage:()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const key=w.localStorage.key(i);return[key,w.localStorage.getItem(key)];})),click:selector=>{const button=d.querySelector(selector);assert(button,selector);button.click();}};
}
async function settle(h){for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));const end=Date.now()+5000;while(h.w.evidenceIsBusy?.()&&Date.now()<end)await new Promise(r=>setImmediate(r));assert(!h.w.evidenceIsBusy?.(),'evidence operation did not settle');}
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
function near(actual,expected,tol=1e-8){assert(Number.isFinite(actual),String(actual));assert(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);}
function evidenceBytes(h,bundle){return Object.fromEntries(bundle.evidence.map(meta=>[meta.name,[...h.w.EvidenceCore.base64ToBytes(bundle.evidenceFiles.find(item=>item.id===meta.id).base64)]]));}
function assertNoEvidence(bundle){assert.deepEqual(bundle.evidence,[]);if(bundle.evidenceFiles!==undefined)assert.deepEqual(bundle.evidenceFiles,[]);}
function set(h,selector,value,event='input'){const e=h.d.querySelector(selector);assert(e,selector);if(e.type==='checkbox')e.checked=!!value;else e.value=value;e.dispatchEvent(new h.w.Event(event,{bubbles:true}));}
async function train(h){await h.ev('TrainingJob.open()');await settle(h);}

(async()=>{
 const existing=boot();await settle(existing);existing.ev("state.example=false;state.job={name:'Existing technician job',node:'KEEP-01',lead:'QA',notes:'Retain my job'};state.rows[0].name='Keep this route point';renderAll();saveLocal()");
 await check('Cancelling the guided example leaves the entire working job and stored library unchanged',async()=>{
  const before=existing.ev('JSON.stringify(state)'),stored=existing.storage();existing.control.confirm=false;await train(existing);assert.equal(existing.ev('JSON.stringify(state)'),before);assert.deepEqual(existing.storage(),stored);assert(existing.prompts.length>0);existing.control.confirm=true;
 });
 await check('A synthetic evidence storage failure cannot replace the working job',async()=>{
  const h=boot();await settle(h);h.ev("state.example=false;state.job={name:'Do not replace on evidence failure'};renderAll();saveLocal()");const before=h.ev('JSON.stringify(state)'),stored=h.storage(),put=FDB.IDBObjectStore.prototype.put;
  FDB.IDBObjectStore.prototype.put=function(){throw new Error('Injected IndexedDB write failure');};try{await assert.rejects(()=>train(h),/Injected IndexedDB write failure/);}finally{FDB.IDBObjectStore.prototype.put=put;}
  assert.equal(h.ev('JSON.stringify(state)'),before);assert.deepEqual(h.storage(),stored);assert.notEqual(h.ev('state.job?.training'),'guided-1.5');
 });
 await check('Named-job storage quota failure aborts example loading before the current job is replaced',async()=>{
  const h=boot();await settle(h);h.ev("state.example=false;state.job={name:'Do not replace on retention failure'};renderAll();saveLocal()");const before=h.ev('JSON.stringify(state)'),stored=h.storage(),original=h.w.Storage.prototype.setItem;
  h.w.Storage.prototype.setItem=function(key,value){if(key==='hfc-named-jobs-v1')throw new h.w.DOMException('Injected quota failure','QuotaExceededError');return original.call(this,key,value);};try{await assert.rejects(()=>train(h),/Injected quota failure/);}finally{h.w.Storage.prototype.setItem=original;}
  assert.equal(h.ev('JSON.stringify(state)'),before);assert.deepEqual(h.storage(),stored);assert.notEqual(h.ev('state.job?.training'),'guided-1.5');
 });
 await check('Double-starting the guided example retains the old job only once',async()=>{
  const h=boot();await settle(h);const before=h.ev('JobsUI.snapshots().length');await Promise.allSettled([h.ev('TrainingJob.open()'),h.ev('TrainingJob.open()')]);await settle(h);assert.equal(h.ev('state.job?.training'),'guided-1.5');assert.equal(h.ev('JobsUI.snapshots().length'),before+1);assert.equal(h.prompts.length,1);assert.deepEqual(h.errors,[]);
 });
 await check('An in-progress evidence upload blocks switching to the example and stays with its original job',async()=>{
  const h=boot();await settle(h);h.ev("state.example=false;state.job={name:'Upload in progress'};renderAll();saveLocal()");let finish;const bytes=new Uint8Array([10,20,30]);const pending=h.ev('EvidenceUI').importFiles([{name:'pending-original.bin',type:'application/octet-stream',size:bytes.length,arrayBuffer:()=>new Promise(resolve=>{finish=()=>resolve(bytes.buffer);})}],{kind:'Sweep',stage:'Before',asset:'UPLOAD',notes:'Synthetic test probe'});
  const before=h.ev('JSON.stringify(state)');await assert.rejects(()=>h.ev('TrainingJob.open()'),/current evidence|file operation/i);assert.equal(h.ev('JSON.stringify(state)'),before);assert.equal(h.prompts.length,0);finish();await pending;await settle(h);assert.equal(h.ev('state.job.name'),'Upload in progress');assert.equal(h.ev('state.evidence[0].name'),'pending-original.bin');
 });
 const originalBytes=new Uint8Array([0,2,128,255,10]);let retainedId,trainingBundle;
 await check('Loading the example preserves the existing job with its original evidence in named jobs',async()=>{
  await existing.ev('EvidenceUI').importFiles([{name:'CURRENT-JOB-original.bin',size:originalBytes.length,type:'application/octet-stream',arrayBuffer:async()=>originalBytes.slice().buffer}],{kind:'Sweep',stage:'Before',asset:'KEEP-01',notes:'QA preservation probe'});const before=existing.json('state');
  await train(existing);assert.equal(existing.ev('state.job.training'),'guided-1.5');const old=existing.json('JobsUI.snapshots()').find(job=>job.job.name==='Existing technician job');assert(old);retainedId=old.job.id;assert.deepEqual(old.rows,before.rows);assert.deepEqual(old.setup,before.setup);assert.equal(old.evidence.length,1);
  const exported=await existing.w.evidenceExportProject(old);assert.deepEqual(evidenceBytes(existing,exported)['CURRENT-JOB-original.bin'],[...originalBytes]);trainingBundle=await existing.w.evidenceExportProject(existing.ev('state'));
 });
 await check('The example uses valid node, branch, active, passive and power objects with real calculable outputs',()=>{
  assert.deepEqual(existing.json('NodeTools.issues(state.node,catalog)'),[]);const distances=existing.json('HFC.routeDistances(state,catalog)');assert.deepEqual(distances.errors,[]);const rows=existing.json('state.rows');assert(rows.length>=5);assert(existing.ev('state.rows.filter(r=>device(r.device)?.active).length')>=2);assert(rows.some(r=>r.drop));assert(rows.some(r=>String(r.asBuiltNote||'').trim()));assert(existing.ev('state.rows.some(r=>HFC.portsFor(device(r.device),r).length>1)'));
  assert.equal(existing.ev('state.node.model'),'gs7000-12g');assert.deepEqual(existing.json('NodeTools.band(state.node,catalog)'),{label:'42/54 MHz',returnLow:5,returnCeiling:42,forwardFloor:54,equipmentUpper:1218});assert.equal(existing.ev('state.node.operatingUpper'),1000);assert.equal(existing.ev('state.sweepSetup.selected'),'42');assert(existing.ev('state.rows.every(r=>device(r.device)&&catalog.cables.some(c=>c.id===r.cable))'));assert(existing.ev('state.power.rows.every(r=>r.equipment==="custom"||powerEquipment(r.equipment))'));assert(existing.ev('state.power.rows.every(r=>catalog.cables.some(c=>c.id===r.cable))'));
  for(const frequency of [54,860]){const results=existing.json('evaluate('+frequency+').results');assert.equal(results.length,rows.length);for(const row of results){assert(Number.isFinite(row.input.level),row.id+' input');assert(row.outputs.length);for(const output of row.outputs)assert(Number.isFinite(output.level),row.id+' '+output.id);}}
  const power=existing.json('HFC.powerRun(state.power,catalog)');assert.equal(power.ok,true);assert(power.supplyCurrent>0);assert(power.rows.length>=3);assert(power.rows.every(row=>Number.isFinite(row.voltage)&&row.voltage>0));
 });
 await check('Synthetic evidence includes readable Sweep, Ingress and OneCheck files with explicit provenance',()=>{
  const metadata=existing.json('state.evidence');for(const kind of ['Sweep','Ingress','OneCheck'])assert(metadata.some(meta=>meta.kind===kind),kind);for(const meta of metadata){assert.match(meta.name,/training|synthetic/i);assert.match(meta.notes,/synthetic|training/i);assert.equal(meta.parse.status,meta.name.endsWith('.csv')?'parsed':'attachment',meta.name);assert(meta.sha256.match(/^[a-f0-9]{64}$/));assert(meta.size>0);}assert.equal(metadata.filter(meta=>meta.name.endsWith('.csv')).length,5);assert.equal(metadata.length,6);assert.equal(trainingBundle.evidenceFiles.length,metadata.length);
 });
 await check('Populated planning logs and unapproved criteria never certify the synthetic field readings',()=>{
  const p=existing.json('state.project');for(const kind of ['forward','returns','punch','dsim'])assert(p[kind].length>0,kind);assert(p.profiles.every(profile=>profile.approved!=='Yes'));
  for(const kind of ['forward','returns']){for(const row of p[kind]){assert.equal(row.basis,'Planning');const result=existing.ev('ProjectMath.evaluate('+JSON.stringify(row)+',projectProfile('+JSON.stringify(row.profile)+'),'+JSON.stringify(kind==='returns'?'return':'forward')+')');assert.equal(result.status,'Planning / unverified');assert.equal(result.within,false);}}
  assert(p.dsim.every(row=>row.verified==='No'&&row.confirmed==='No'));assert(p.punch.some(row=>row.status==='Open'));
 });
 await check('Raw launch values and meter examples apply their explicit 20 dB coupling once',()=>{
  assert.equal(existing.ev('state.setup.lowLevel'),11);assert.equal(existing.ev('state.setup.highLevel'),23);near(existing.ev('evaluate(54).source'),31);near(existing.ev('evaluate(860).source'),43);
  const hgd=existing.json('meterComparison(state.rows.find(r=>r.id==="r1"),"through")'),tap=existing.json('meterComparison(state.rows.find(r=>r.id==="r6"),"tap")');near(hgd.raw,16.1);near(hgd.measurement,36.1);assert.equal(hgd.converted,true);near(hgd.error,hgd.measurement-hgd.prediction);near(tap.measurement,7.5);assert.equal(tap.converted,false);
 });
 await check('Main and branch cable distances stay separate and the TDR exercise reaches its stated span',()=>{
  const endpoints=existing.json('Object.fromEntries(HFC.routeDistances(state,catalog).rows.map(r=>[r.id,r.end]))');assert.equal(endpoints.r3,1700);assert.equal(endpoints.r6,2380);assert.equal(endpoints.r7,2020);assert.equal(endpoints.r9,2220);
  const hit=existing.json('HFC.tdrLocate(state,catalog,state.routeTools)');assert.equal(hit.ok,true);assert.equal(hit.spanId,'r5');near(hit.pathDistance,270);near(hit.routeDistance,1970);near(hit.offsetFromStart,160);near(hit.offsetFromEnd,150);
  const blocked=existing.json('HFC.tdrLocate(state,catalog,{...state.routeTools,start:"source",distance:1995})');assert.equal(blocked.ok,false);assert.equal(blocked.barrier,'r1');
 });
 await check('The exact-frequency teaching inputs produce the stated 5.8 dB loss and 37.2 dBmV receive level',()=>{
  const value=existing.json('frequencyCalculation().rows.find(r=>r.hz===860)');near(value.cableRate,2.2);near(value.cableLoss,4.4);near(value.passiveEach,1.4);near(value.total,5.8);near(value.launch,43);near(value.budget,37.2);assert.equal(existing.ev('state.setup.temperature'),86);
 });
 await check('The seeded drop uses explicit RG-6 and custom loss without inventing a fourth manufacturer',()=>{
  const drop=existing.json('dropCalculation(state.rows.find(r=>r.id==="r6"),54)');near(drop.cableLoss,1.35);assert.equal(drop.outputs.length,1);for(const output of drop.outputs){near(output.loss,4);near(output.level,drop.input-5.35);}assert.match(drop.warning,/not power-passing/);
 });
 await check('The independent power branch carries its own load and the trial changes only a copied circuit',()=>{
  const before=existing.ev('JSON.stringify(state.power.rows)'),power=existing.json('HFC.powerRun(state.power,catalog)'),by=Object.fromEntries(power.rows.map(row=>[row.id,row]));near(by.p1.sectionCurrent,power.supplyCurrent);near(by.p3.sectionCurrent,by.p3.deviceCurrent+by.p4.deviceCurrent,1e-6);near(by.p5.voltage*by.p5.deviceCurrent*0.9,20,1e-5);assert(power.supplyCurrent<15);assert(power.minVoltage>45);
  const trial=existing.json('powerWhatIfCalculation(state.power.whatIf)');assert.equal(trial.ok,true);assert(trial.supplyCurrent>power.supplyCurrent);assert(trial.voltage<by.p4.voltage);assert.equal(existing.ev('JSON.stringify(state.power.rows)'),before);
 });
 await check('Return injection and checklist examples show concrete arithmetic without creating acceptance',()=>{
  near(existing.ev('ProjectMath.generator(state.project.generator)'),61);assert.equal(existing.ev('state.fieldWork.leakage.conversion.value'),'72');assert.equal(existing.ev('state.fieldWork.leakage.conversion.from'),'dbuv');assert(existing.ev('FieldWork.reportSections(state).length')>=2);assert.equal(existing.ev('state.fieldReferences.tapPoint'),'r6');
 });
 await check('Both GaN HGDs use entered gain and reserve instead of inventing a flat manufacturer response',()=>{
  const budgets=existing.json('["r1","r3"].map(rowId=>HFC.gainBudget({...state,setup:effectiveLaunchSetup()},catalog,{rowId}))');for(const budget of budgets){assert(Number.isFinite(budget.minimumMargin));assert.equal(budget.publishedReference.screeningOnly,true);assert.notEqual(budget.low.availableGain,44);assert.notEqual(budget.high.availableGain,44);}near(budgets[0].low.availableGain,9);near(budgets[0].high.availableGain,18);near(budgets[1].low.availableGain,8);near(budgets[1].high.availableGain,15);
 });
 await check('Every guided action reaches its named task and the intended existing route point',()=>{
  const expected={job:['projects'],launch:['setup'],equipment:['equipmentSetup','source'],route:['route','r4'],drop:['route','r6'],gain:['gain','r1'],parts:['parts'],agc:['equipmentSetup','r1'],tdr:['tdr'],sweepSetup:['sweepSetup'],sweep:['sweep'],frequency:['frequency'],readings:['readings','r1'],reference:['references'],power:['power'],trial:['trial'],files:['evidence'],checks:['checklists'],records:['records'],report:['runsheet'],backup:['home']};assert.equal(existing.d.querySelectorAll('[data-training-open]').length,21);
  for(const [step,[task,point]] of Object.entries(expected)){existing.click('#trainingShowGuide');assert.equal(existing.ev('WorkflowUI.current()'),'home');assert.equal(existing.d.getElementById('trainingGuide').open,true);existing.click('[data-training-open="'+step+'"]');assert.equal(existing.ev('WorkflowUI.current()'),task,step);if(point)assert.equal(existing.d.querySelector(task==='equipmentSetup'?'#equipmentSetupPanel select[data-equipment-target]':'#pointSelect').value,point,step);if(task==='equipmentSetup')assert.equal(existing.ev('state.equipmentSetup.selected'),point,step+' saved selection');if(step==='drop')assert.equal(existing.d.querySelector('#route [data-row="r6"] .point-extras').open,true);}
 });
 await check('Reviewed steps persist as learning progress without marking real inspections or acceptance',()=>{
  const before=existing.ev('JSON.stringify([state.project,state.fieldWork])');set(existing,'[data-training-check="launch"]',true,'change');set(existing,'[data-training-check="tdr"]',true,'change');assert.match(existing.ev('state.job.trainingSteps'),/launch/);assert.match(existing.ev('state.job.trainingSteps'),/tdr/);assert.match(existing.d.getElementById('trainingProgress').textContent,/2 \/ 21/);assert.equal(existing.ev('JSON.stringify([state.project,state.fieldWork])'),before);
 });
 await check('Editing a real gain control changes its prediction while the persistent synthetic warning stays visible',()=>{
  existing.ev('WorkflowUI.selectPoint("r1");WorkflowUI.go("gain")');const before=existing.ev('evaluate(54).byKey.get("r1::through").level');set(existing,'#route [data-row="r1"] [data-field="gainLow"]','10');near(existing.ev('evaluate(54).byKey.get("r1::through").level'),before+1);assert.equal(existing.ev('state.example'),false);assert.equal(existing.ev('state.job.training'),'guided-1.5');assert.equal(existing.d.getElementById('trainingBanner').hidden,false);assert.match(existing.ev('FieldReport.sheetText()'),/SYNTHETIC TRAINING JOB/);
 });
 await check('All numeric and record exports retain an invariant synthetic marker after editable names and notes are cleared',async()=>{
  const saved=existing.json('state');existing.ev('state.job.name="Practice";state.project.meta={job:"Practice",notes:""};for(const kind of ["forward","returns","punch","dsim"])for(const row of state.project[kind])for(const key of Object.keys(row))if(typeof row[key]==="string"&&/synthetic|train/i.test(row[key]))row[key]="";renderAll()');
  const start=existing.downloads.length;for(const id of ['csv','frequencyCSV','powerCSV','runSheetCsv'])existing.click('#'+id);await existing.d.getElementById('runSheetShare').onclick();for(const kind of ['forward','returns','punch','dsim'])existing.click('[data-project-csv="'+kind+'"]');
  const exports=existing.downloads.slice(start);assert.equal(exports.length,9);for(const out of exports){assert.match(out.text,/SYNTHETIC TRAINING JOB/,out.name);assert.match(out.text,/not field measurements|not field data/i,out.name);}existing.ev('loadState('+JSON.stringify(saved)+')');
 });
 let exported,restored;
 await check('The actual Save project action exports all six originals and edited training progress',async()=>{
  await existing.d.getElementById('save').onclick();const out=existing.downloads.at(-1);assert.equal(out.mime,'application/json');exported=JSON.parse(out.text);assert.equal(exported.job.training,'guided-1.5');assert.equal(exported.rows.find(row=>row.id==='r1').gainLow,'10');assert.match(exported.job.trainingSteps,/tdr/);assert.equal(exported.evidenceFiles.length,6);assert.deepEqual(evidenceBytes(existing,exported),evidenceBytes(existing,trainingBundle));
 });
 await check('Opening that portable file on a fresh app restores calculations, training labels and original bytes',async()=>{
  restored=boot();await settle(restored);await restored.w.NightSweep.openProject(JSON.stringify(exported));await settle(restored);for(const key of ['setup','rows','node','power','project','frequency','routeTools','fieldWork','fieldReferences'])assert.deepEqual(restored.json('state['+JSON.stringify(key)+']'),exported[key],key);assert.equal(restored.ev('state.job.training'),'guided-1.5');assert.equal(restored.ev('state.job.trainingSteps'),exported.job.trainingSteps);assert.equal(restored.d.getElementById('trainingBanner').hidden,false);assert.equal(restored.d.querySelector('[data-training-check="tdr"]').checked,true);
  const again=await restored.w.evidenceExportProject(restored.ev('state'));assert.deepEqual(evidenceBytes(restored,again),evidenceBytes(existing,exported));assert.deepEqual(restored.json('[evaluate(54).results,evaluate(860).results]'),existing.json('[evaluate(54).results,evaluate(860).results]'));
 });
 await check('Corrupt training evidence is rejected before a restored working job or named library changes',async()=>{
  const broken=JSON.parse(JSON.stringify(exported));broken.evidenceFiles[0].base64='AA==';const before=restored.ev('JSON.stringify(state)'),stored=restored.storage();await assert.rejects(()=>restored.w.NightSweep.openProject(JSON.stringify(broken)),/checksum/i);assert.equal(restored.ev('JSON.stringify(state)'),before);assert.deepEqual(restored.storage(),stored);
 });
 await check('A named practice copy remains synthetic after opening another job and returning to it',async()=>{
  const id=existing.ev('JobsUI.saveNamed()');assert(existing.prompts.some(prompt=>/synthetic training job/i.test(prompt)));const named=existing.json('JobsUI.snapshots()').find(job=>job.job.id===id);assert.equal(named.job.sample,true);assert.equal(named.job.training,'guided-1.5');await existing.ev('JobsUI.open('+JSON.stringify(retainedId)+')');await settle(existing);assert.equal(existing.ev('state.job.name'),'Existing technician job');assert.equal(existing.ev('state.evidence.length'),1);const prior=await existing.w.evidenceExportProject(existing.ev('state'));assert.deepEqual(evidenceBytes(existing,prior)['CURRENT-JOB-original.bin'],[...originalBytes]);await existing.ev('JobsUI.open('+JSON.stringify(id)+')');await settle(existing);assert.equal(existing.ev('state.job.training'),'guided-1.5');assert.equal(existing.d.getElementById('trainingBanner').hidden,false);assert.match(existing.ev('FieldReport.sheetText()'),/SYNTHETIC TRAINING JOB/);
 });
 await check('Reset restores baseline values only after retaining the edited practice copy',async()=>{
  const before=existing.ev('JobsUI.snapshots().length');existing.ev('WorkflowUI.go("trial")');existing.click('#keepPowerTrial');assert.equal(existing.ev('state.power.rows.length'),6);await existing.d.getElementById('openTrainingJob').onclick();await settle(existing);assert.equal(existing.ev('state.rows[0].gainLow'),9);assert.equal(existing.ev('state.power.rows.length'),5);assert.equal(existing.ev('state.job.trainingSteps'),'');const prior=existing.json('JobsUI.snapshots()').find(job=>job.job.training==='guided-1.5'&&job.power.rows.length===6);assert(prior);assert.equal(prior.rows[0].gainLow,'10');assert(existing.ev('JobsUI.snapshots().length')>=before);assert.equal(existing.ev('state.evidence.length'),6);
 });
 await check('Starting a blank job exits training without erasing its retained example and attachments',async()=>{
  await existing.ev('JobsUI.newJob()');await settle(existing);assert.equal(existing.ev('state.job.training'),undefined);assert.equal(existing.ev('state.rows.length'),0);assert.equal(existing.d.getElementById('trainingBanner').hidden,true);assert(existing.json('JobsUI.snapshots()').some(job=>job.job.training==='guided-1.5'&&job.evidence.length===6));
 });
 const practice=boot();await settle(practice);
 await check('Home always offers complete, OEM AGC, DSIM and GS7K practice as distinct choices',()=>{
  for(const id of ['openTrainingJob','openOemTrainingJob','openDsimTrainingJob','openGs7kTrainingJob'])assert(practice.d.getElementById(id));
  assert.match(practice.d.querySelector('.training-card').textContent,/OEM AGC/);assert.match(practice.d.querySelector('.training-card').textContent,/ACI DSIM/);
  const definitions=practice.json('TrainingJob.steps');assert.equal(definitions.length,21);assert(definitions.find(s=>s[0]==='equipment'&&s[2]==='equipmentSetup'));
  const agc=definitions.find(s=>s[0]==='agc');assert.match(agc[4],/GaN.*unverified/i);assert.match(agc[4],/Do not apply an AOI/);assert.match(agc[4],/DSIM/);
  for(const [list,id] of [['TrainingJob.dsimSteps','launch'],['TrainingJob.oemSteps','launch'],['TrainingJob.gs7kSteps','levels']]){const step=practice.json(list).find(s=>s[0]===id);assert.equal(step[2],'references');assert.match(step[4],/57 \/ 753 MHz/);assert.match(step[4],/63 \/ 550 MHz/);assert.match(step[4],/31 dBmV at 54 MHz \/ 43 dBmV at 860 MHz/);assert.match(step[4],/square-root cable law or linear-MHz/);}
 });
 await train(practice);let fullOriginals;
 await check('Cancelling a separate practice choice preserves the complete GS7K / GaN job and all six original files',async()=>{
  const before=practice.ev('JSON.stringify(state)'),stored=practice.storage();fullOriginals=await practice.w.evidenceExportProject(practice.ev('state'));
  assert.equal(fullOriginals.evidenceFiles.length,6);practice.control.confirm=false;await practice.ev('TrainingJob.open("gainmaker-dsim")');await settle(practice);
  assert.equal(practice.ev('JSON.stringify(state)'),before);assert.deepEqual(practice.storage(),stored);practice.control.confirm=true;
  const after=await practice.w.evidenceExportProject(practice.ev('state'));assert.deepEqual(evidenceBytes(practice,after),evidenceBytes(practice,fullOriginals));
 });
 await check('Opening the separate DSIM job retains the GS7K / GaN example and supplies only compatible legacy practice equipment',async()=>{
  await practice.ev('TrainingJob.open("gainmaker-dsim")');await settle(practice);
  assert.equal(practice.ev('state.job.training'),'guided-1.5');assert.equal(practice.ev('state.job.trainingVariant'),'gainmaker-dsim');assert.equal(practice.ev('state.setup.sourceType'),'active');assert.equal(practice.ev('state.setup.sourceModel'),'active_gm_hgd');
  assert.equal(practice.ev('state.rows[0].device'),'active_gm_le_agc');assert(practice.ev('state.rows.every(r=>!r.device.startsWith("active_aoi_"))'));
  assert.equal(practice.ev('projectProfile("1002").returnCeiling'),42);assert.equal(practice.ev('projectProfile("1002").forwardFloor'),54);assert.equal(practice.ev('state.sweepSetup.selected'),'42');
  assert.equal(practice.ev('state.evidence.length'),0);await practice.d.getElementById('save').onclick();const exportedPractice=JSON.parse(practice.downloads.at(-1).text);assertNoEvidence(exportedPractice);assert.equal(exportedPractice.job.trainingVariant,'gainmaker-dsim');assert.equal(exportedPractice.equipmentSetup.selected,'source');fs.writeFileSync(practicePath('GainMaker_DSIM_Practice.json'),JSON.stringify(exportedPractice,null,2)+'\n');
  const savedComplete=practice.json('JobsUI.snapshots()').find(j=>j.job.training==='guided-1.5'&&!j.job.trainingVariant&&j.evidence.length===6);assert(savedComplete);
  const originals=await practice.w.evidenceExportProject(savedComplete);assert.deepEqual(evidenceBytes(practice,originals),evidenceBytes(practice,fullOriginals));
  assert.match(practice.d.getElementById('trainingGuideScope').textContent,/no meter captures/);
 });
 await check('DSIM practice displays a historical lookup while keeping settings, lock and physical acceptance unverified',()=>{
  const station=practice.json('state.equipmentSetup.stations.source'),record=practice.json('state.project.dsim[0]');
  assert.equal(station.gainControl,'dsim');assert.equal(station.pilot,'711');assert.equal(station.pilotType,'QAM');assert.equal(station.keyStatus,'not-supplied');assert.equal(station.firmware,'');assert.match(station.notes,/@@\?<A/);
  for(const field of ['s1','agcPad','backoffMHz','backoff','tgc'])assert.equal(record[field],'',field);for(const field of ['locked','verified','confirmed'])assert.equal(record[field],'No',field);
  assert(practice.json('state.project.profiles').every(p=>p.approved!=='Yes'));assert(practice.json('state.project.forward').every(r=>r.basis==='Planning'));assert.equal(practice.ev('DsimPilotCodes.lookup(711,"QAM").code'),'@@?<A');
  for(const frequency of [54,860])for(const row of practice.json('evaluate('+frequency+').results'))for(const out of row.outputs)assert(Number.isFinite(out.level));
  assert.equal(practice.ev('state.setup.lowF'),54);assert.equal(practice.ev('state.setup.highF'),860);assert.equal(practice.ev('state.setup.lowLevel'),11);assert.equal(practice.ev('state.setup.highLevel'),23);near(practice.ev('evaluate(54).source'),31);near(practice.ev('evaluate(860).source'),43);
  assert.deepEqual(practice.json('[state.project.forward[0].lowMHz,state.project.forward[0].highMHz,state.project.forward[0].rawLow,state.project.forward[0].rawHigh,state.project.forward[0].targetLow,state.project.forward[0].targetHigh]'),[54,860,11,23,31,43]);assert.equal(practice.ev('state.rows[0].gainLowF'),54);assert.equal(practice.ev('state.rows[0].gainHighF'),860);
  assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReference'),'38');assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReferenceChannels'),'');assert.equal(practice.ev('state.sweepSetup.profiles["42"].desiredInjection'),'');assert.equal(practice.ev('state.project.generator.desired'),'');
 });
 await check('Every DSIM practice handoff selects the exact source or LE and remains a learning-only checklist',()=>{
  const before=practice.ev('JSON.stringify([state.project,state.equipmentSetup])'),list=practice.json('TrainingJob.dsimSteps');assert.equal(list.length,9);assert.equal(practice.d.querySelectorAll('[data-training-open]').length,9);
  for(const [id,,task,point] of list){practice.click('[data-training-open="'+id+'"]');assert.equal(practice.ev('WorkflowUI.current()'),task,id);if(task==='equipmentSetup'){assert.equal(practice.d.querySelector('#equipmentSetupPanel select[data-equipment-target]').value,point,id);assert.equal(practice.ev('state.equipmentSetup.selected'),point,id+' saved selection');}}
  practice.click('#trainingShowGuide');set(practice,'[data-training-check="pilot"]',true,'change');assert.match(practice.d.getElementById('trainingProgress').textContent,/1 \/ 9/);
  assert.equal(practice.ev('JSON.stringify(state.project)'),JSON.stringify(JSON.parse(before)[0]));assert.equal(practice.ev('state.equipmentSetup.stations.source.keyStatus'),'not-supplied');
 });
 let dsimPortable;
 await check('The focused DSIM practice exports and restores its variant and learning progress without manufacturing evidence',async()=>{
  await practice.d.getElementById('save').onclick();dsimPortable=JSON.parse(practice.downloads.at(-1).text);assertNoEvidence(dsimPortable);assert.equal(dsimPortable.job.trainingVariant,'gainmaker-dsim');assert.match(dsimPortable.job.trainingSteps,/pilot/);
  const recovered=boot();await settle(recovered);await recovered.w.NightSweep.openProject(JSON.stringify(dsimPortable));await settle(recovered);assert.equal(recovered.ev('state.job.trainingVariant'),'gainmaker-dsim');assert.equal(recovered.d.querySelector('[data-training-check="pilot"]').checked,true);assert.equal(recovered.d.querySelectorAll('[data-training-open]').length,9);assert.match(recovered.ev('FieldReport.sheetText()'),/SYNTHETIC TRAINING JOB/);assert.deepEqual(recovered.errors,[]);
 });
 await check('OEM AGC practice has its own guide and leaves pilot compatibility unspecified instead of applying DSIM values',async()=>{
  await practice.d.getElementById('openOemTrainingJob').onclick();await settle(practice);assert.equal(practice.ev('state.job.trainingVariant'),'gainmaker-oem');assert.equal(practice.ev('state.project.dsim.length'),0);assert.equal(practice.ev('state.evidence.length'),0);
  for(const station of Object.values(practice.json('state.equipmentSetup.stations'))){assert.equal(station.gainControl,'oem-agc');for(const field of ['dsimModel','pilot','pilotType','keyStatus'])assert.equal(station[field],'',field);}
  assert.equal(practice.ev('state.setup.lowF'),54);assert.equal(practice.ev('state.setup.highF'),860);assert.equal(practice.ev('state.setup.lowLevel'),11);assert.equal(practice.ev('state.setup.highLevel'),23);near(practice.ev('evaluate(54).source'),31);near(practice.ev('evaluate(860).source'),43);assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReference'),'38');assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReferenceChannels'),'');assert.equal(practice.ev('state.sweepSetup.profiles["42"].desiredInjection'),'');
  await practice.d.getElementById('save').onclick();const exportedOem=JSON.parse(practice.downloads.at(-1).text);assertNoEvidence(exportedOem);assert.equal(exportedOem.job.trainingVariant,'gainmaker-oem');assert.equal(exportedOem.equipmentSetup.selected,'source');fs.writeFileSync(practicePath('GainMaker_OEM_AGC_Practice.json'),JSON.stringify(exportedOem,null,2)+'\n');
  const list=practice.json('TrainingJob.oemSteps');assert.equal(list.length,8);assert.equal(practice.d.querySelectorAll('[data-training-open]').length,8);assert.match(practice.d.getElementById('trainingGuideScope').textContent,/pilot module.*unverified/i);
  for(const [id,,task,point] of list){practice.click('[data-training-open="'+id+'"]');assert.equal(practice.ev('WorkflowUI.current()'),task,id);if(task==='equipmentSetup'){assert.equal(practice.d.querySelector('#equipmentSetupPanel select[data-equipment-target]').value,point,id);assert.equal(practice.ev('state.equipmentSetup.selected'),point,id+' saved selection');}}
  assert(practice.json('JobsUI.snapshots()').some(j=>j.job.trainingVariant==='gainmaker-dsim'&&j.job.trainingSteps.includes('pilot')));assert.match(practice.ev('FieldReport.sheetText()'),/SYNTHETIC TRAINING JOB/);
 });
 await check('Cancelling GS7K practice preserves the open OEM example and its stored job state',async()=>{
  const before=practice.ev('JSON.stringify(state)'),stored=practice.storage();practice.control.confirm=false;
  await practice.ev('TrainingJob.open("gs7k-node")');await settle(practice);assert.equal(practice.ev('JSON.stringify(state)'),before);assert.deepEqual(practice.storage(),stored);practice.control.confirm=true;
 });
 let gs7kPortable;
 await check('GS7K practice separates local design targets from blank actual readings and supplies no evidence',async()=>{
  await practice.d.getElementById('openGs7kTrainingJob').onclick();await settle(practice);assert.equal(practice.ev('state.job.trainingVariant'),'gs7k-node');assert.equal(practice.ev('state.job.training'),'guided-1.5');
  assert.equal(practice.ev('state.setup.sourceType'),'node');assert.equal(practice.ev('state.node.model'),'gs7000-12g');assert.equal(practice.ev('state.node.band'),'0');assert.equal(practice.ev('state.rows.length'),0);assert.equal(practice.ev('state.evidence.length'),0);assert.equal(practice.ev('state.sweepSetup.selected'),'42');
  for(const key of ['lowF','highF','lowLevel','highLevel','liveMax','launchTable','launchCoupling'])assert.equal(practice.ev('state.setup['+JSON.stringify(key)+']'),'',key);
  for(const key of ['lowF','highF','lowLevel','highLevel'])assert.equal(practice.d.querySelector('[data-setup="'+key+'"]').value,'',key+' displayed');
  assert.equal(practice.ev('effectiveLaunchSetup().lowLevel'),'');assert.equal(practice.ev('effectiveLaunchSetup().highLevel'),'');assert.equal(practice.ev('evaluate(54).source'),null);assert.equal(practice.ev('evaluate(860).source'),null);
  const profile=practice.json('projectProfile("1218")');assert.equal(profile.returnCeiling,42);assert.equal(profile.forwardFloor,54);assert.equal(profile.available,'');assert.deepEqual([profile.forwardLow,profile.forwardHigh,profile.launchLow,profile.launchHigh],[54,860,31,43]);assert.match(profile.markerBasis,/User local non-high-split/);
  assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReference'),'38');assert.equal(practice.ev('state.sweepSetup.profiles["42"].txReferenceChannels'),'');assert.equal(practice.ev('state.sweepSetup.profiles["42"].desiredInjection'),'');assert.equal(practice.ev('state.project.generator.desired'),'');
  assert.equal(practice.ev('state.project.dsim.length'),0);assert(practice.json('state.project.profiles').every(p=>p.approved!=='Yes'));assert.match(practice.d.getElementById('trainingGuideScope').textContent,/launch levels and measurement plane unverified/);
  await practice.d.getElementById('save').onclick();gs7kPortable=JSON.parse(practice.downloads.at(-1).text);assertNoEvidence(gs7kPortable);assert.equal(gs7kPortable.equipmentSetup.selected,'source');assert.equal(gs7kPortable.rows.length,0);fs.writeFileSync(practicePath('GS7K_Practice.json'),JSON.stringify(gs7kPortable,null,2)+'\n');
 });
 await check('All ten GS7K guide steps reach their controls and exact conventional-node setup manual',()=>{
  const list=practice.json('TrainingJob.gs7kSteps');assert.equal(list.length,10);assert.equal(practice.d.querySelectorAll('[data-training-open]').length,10);assert.equal(practice.d.getElementById('openGs7kTrainingJob').textContent,'Reset GS7K node practice');
  for(const [id,,task,point] of list){practice.click('[data-training-open="'+id+'"]');assert.equal(practice.ev('WorkflowUI.current()'),task,id);if(task==='equipmentSetup'){assert.equal(practice.d.querySelector('#equipmentSetupPanel select[data-equipment-target]').value,point,id);assert.equal(practice.ev('state.equipmentSetup.selected'),point,id+' saved selection');assert(practice.json('EquipmentSetup.reportSections().find(s=>s.key==="source").manuals').some(m=>m.id==='gs7000-12g-manual'));assert.equal(practice.d.getElementById('equipmentDsimHeading'),null);}}
  const discovery=list.find(s=>s[0]==='discovery')[4];assert.match(discovery,/discovers installed modules/);assert.match(discovery,/does not perform RF level or tilt alignment/);assert.match(discovery,/not a selectable conventional-node procedure/);
  assert.match(list.find(s=>s[0]==='reverse')[4],/analog optical transmitter, EDR or retrofit RPD/);assert.match(list.find(s=>s[0]==='sweep')[4],/Return Sweepless Sweep/);
 });
 await check('Switching the practice source between standard 1 GHz and 1.2 GHz changes only its applicable manual and identity',()=>{
  practice.click('[data-training-open="identity"]');set(practice,'[data-launch-node="model"]','gs7000-1g','change');practice.click('[data-training-open="equipment"]');assert.equal(practice.ev('state.node.model'),'gs7000-1g');
  let manuals=practice.json('EquipmentSetup.reportSections().find(s=>s.key==="source").manuals');assert(manuals.some(m=>m.id==='gs7000-1g-manual'));assert(!manuals.some(m=>m.id==='gs7000-12g-manual'));
  for(const key of ['lowF','highF','lowLevel','highLevel','launchCoupling'])assert.equal(practice.ev('state.setup['+JSON.stringify(key)+']'),'',key+' after 1 GHz choice');
  practice.click('[data-training-open="identity"]');set(practice,'[data-launch-node="model"]','gs7000-12g','change');practice.click('[data-training-open="equipment"]');manuals=practice.json('EquipmentSetup.reportSections().find(s=>s.key==="source").manuals');assert(manuals.some(m=>m.id==='gs7000-12g-manual'));
  for(const id of ['gs7000-12g-intelligent','gs7000-12g-fiberdeep'])assert.equal(practice.d.querySelector('[data-launch-node="model"] option[value="'+id+'"]'),null);
 });
 await check('GS7K portable recovery preserves blank actual readings, local design targets and learning-only progress',async()=>{
  practice.click('#trainingShowGuide');set(practice,'[data-training-check="reverse"]',true,'change');const before=practice.ev('JSON.stringify(state.project)');await practice.d.getElementById('save').onclick();const edited=JSON.parse(practice.downloads.at(-1).text);assertNoEvidence(edited);
  const recovered=boot();await settle(recovered);await recovered.w.NightSweep.openProject(JSON.stringify(edited));await settle(recovered);assert.equal(recovered.ev('state.job.trainingVariant'),'gs7k-node');assert.equal(recovered.d.querySelector('[data-training-check="reverse"]').checked,true);assert.match(recovered.d.getElementById('trainingProgress').textContent,/1 \/ 10/);
  for(const key of ['lowF','highF','lowLevel','highLevel','liveMax','launchTable','launchCoupling'])assert.equal(recovered.ev('state.setup['+JSON.stringify(key)+']'),'',key+' restored');for(const key of ['lowF','highF','lowLevel','highLevel'])assert.equal(recovered.d.querySelector('[data-setup="'+key+'"]').value,'',key+' restored display');
  assert.equal(recovered.ev('evaluate(54).source'),null);assert.equal(recovered.ev('state.rows.length'),0);assert.equal(recovered.ev('state.evidence.length'),0);assert.equal(recovered.ev('JSON.stringify(state.project)'),before);assert.deepEqual(recovered.json('[projectProfile("1218").forwardLow,projectProfile("1218").forwardHigh,projectProfile("1218").launchLow,projectProfile("1218").launchHigh]'),[54,860,31,43]);assert.equal(recovered.ev('state.sweepSetup.profiles["42"].txReference'),'38');assert.equal(recovered.ev('state.sweepSetup.profiles["42"].desiredInjection'),'');assert.match(recovered.d.getElementById('trainingGuideScope').textContent,/unverified/);assert.match(recovered.ev('FieldReport.sheetText()'),/SYNTHETIC TRAINING JOB/);assert.deepEqual(recovered.errors,[]);
 });
 await check('Each focused practice uses the same named-job preservation failure guard as the complete example',async()=>{
  for(const variant of ['gainmaker-dsim','gainmaker-oem','gs7k-node']){const h=boot();await settle(h);h.ev("state.example=false;state.job={name:'Keep before focused practice'};renderAll();saveLocal()");const before=h.ev('JSON.stringify(state)'),stored=h.storage(),original=h.w.Storage.prototype.setItem;
   h.w.Storage.prototype.setItem=function(key,value){if(key==='hfc-named-jobs-v1')throw new h.w.DOMException('Injected focused-practice quota failure','QuotaExceededError');return original.call(this,key,value);};try{await assert.rejects(()=>h.ev('TrainingJob.open('+JSON.stringify(variant)+')'),/focused-practice quota failure/);}finally{h.w.Storage.prototype.setItem=original;}
   assert.equal(h.ev('JSON.stringify(state)'),before);assert.deepEqual(h.storage(),stored);
  }
 });
 await check('Switching back to the full example preserves all three focused variants and restores all six originals',async()=>{
  await practice.d.getElementById('openTrainingJob').onclick();await settle(practice);assert.equal(practice.ev('state.job.trainingVariant'),undefined);assert.equal(practice.d.querySelectorAll('[data-training-open]').length,21);assert.equal(practice.ev('state.evidence.length'),6);
  const restoredComplete=await practice.w.evidenceExportProject(practice.ev('state'));assert.deepEqual(evidenceBytes(practice,restoredComplete),evidenceBytes(practice,fullOriginals));
  const saved=practice.json('JobsUI.snapshots()');for(const variant of ['gainmaker-dsim','gainmaker-oem','gs7k-node'])assert(saved.some(j=>j.job.trainingVariant===variant));assert.deepEqual(practice.errors,[]);
 });
 await check('All training flows complete without runtime errors or duplicated DOM controls',()=>{
  for(const dom of instances){const ids=[...dom.window.document.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length);}assert.deepEqual(existing.errors,[]);assert.deepEqual(restored.errors,[]);
 });
 fs.writeFileSync(path.join(root,'qa/training-job-results.json'),JSON.stringify({count:cases.length,cases,scope:'Synthetic guided job, DOM edits, named-job preservation and real IndexedDB/portable evidence roundtrip; no plant/device certification.',trainingModule:process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1'?'All current Build 2 modules assembled in memory; final generated-release verification still required.':process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST==='1'?'Current training and SweepSetup source modules substituted in memory; final release HTML build still required.':'Generated release standalone HTML.'},null,2)+'\n');console.log('Training job: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{for(const dom of instances){if(dom.window.document){const end=Date.now()+5000;while(dom.window.evidenceIsBusy?.()&&Date.now()<end)await new Promise(r=>setImmediate(r));dom.window.close();}}});
