/* Production training buttons and the controls reached by their guide steps. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');
function html(){
 if(process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1')return require('./build2-source-harness.cjs').assembleHtml();
 let source=fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8');
 if(process.env.NIGHTSWEEP_TRAINING_SOURCE_TEST!=='1')return source;
 for(const [file,startMarker,endMarker] of [['training.js','/* Offline synthetic practice job.','function initTraining(){TrainingJob.init();}'],['sweep-setup.js','/* 2.0 Alpha build 1 guided field setup.',"if(typeof module!=='undefined'&&module.exports)module.exports=SweepSetup;"]]){
  const start=source.indexOf(startMarker),end=source.indexOf(endMarker,start);assert(start>=0&&end>start,file);
  source=source.slice(0,start)+fs.readFileSync(path.join(root,'night-sweep',file),'utf8')+source.slice(end+endMarker.length);
 }
 return source;
}
function boot({secure=true}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
 const dom=new JSDOM(html(),{url:secure?'https://nightsweep.test/':'http://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;
  if(secure)Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  w.confirm=()=>true;
 }});
 return {dom,w:dom.window,d:dom.window.document,errors,ev:code=>dom.window.eval(code),json:code=>JSON.parse(dom.window.eval('JSON.stringify('+code+')'))};
}
async function settle(h){for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));const end=Date.now()+5000;while(h.w.evidenceIsBusy?.()&&Date.now()<end)await new Promise(resolve=>setImmediate(resolve));assert(!h.w.evidenceIsBusy?.(),'evidence operation did not settle');}
async function withApp(options,fn){const h=boot(options);try{await settle(h);await fn(h);assert.deepEqual(h.errors,[]);}finally{await settle(h);h.dom.window.close();}}
function assertControlShown(target,label){assert(target,label+' control exists');for(let ancestor=target.parentElement;ancestor;ancestor=ancestor.parentElement){if(ancestor.tagName==='DETAILS')assert.equal(ancestor.open,true,label+' control is collapsed');assert.equal(ancestor.hidden,false,label+' control is hidden');}}

test('Complete practice uses GS7K and two GainMaker GaN actives with all three requested passive families',async()=>withApp({},async h=>{
 await h.d.getElementById('openTrainingJob').onclick();await settle(h);
 assert.equal(h.ev('state.node.model'),'gs7000-12g');assert.equal(h.ev('state.node.operatingUpper'),1000);
 const band=h.json('NodeTools.band(state.node,catalog)');assert.equal(band.returnCeiling,42);assert.equal(band.forwardFloor,54);assert.equal(band.equipmentUpper,1218);
 assert.equal(h.ev('state.project.selectedProfile'),'1002');assert.equal(h.ev('projectProfile("1002").equipmentUpper'),1000);assert.equal(h.ev('projectProfile("1002").plannedUpper'),1000);assert.equal(h.ev('projectProfile("1002").available'),860);
 assert.deepEqual(h.json('projectProfile("1200")'),h.json('projectDefaults().profiles.find(p=>p.id==="1200")'),'Inactive high-split profile must be a clean default, not retained AOI exercise criteria.');
 assert.equal(h.ev('state.sweepSetup.selected'),'42');const sweep=h.json('state.sweepSetup.profiles["42"]');assert.equal(sweep.method,'installed');assert.match(sweep.equipment,/GS7K.*GainMaker.*GaN/);assert.equal(sweep.forwardUpper,'1000');assert.equal(sweep.forwardAvailable,'860');assert.equal(sweep.txReference,'38');
 assert.deepEqual(h.json('state.rows.filter(r=>device(r.device)?.active).map(r=>r.device)'),['active_gm_gan_hgd','active_gm_gan_hgd']);
 const families=h.json('state.rows.map(r=>device(r.device)?.family)');for(const brand of ['Scientific-Atlanta','GigaXtend','Technetix'])assert(families.some(f=>f.includes(brand)),brand);
 const loads=h.json('state.power.rows.filter(row=>["p2","p3","p4"].includes(row.id))');for(const load of loads){assert.equal(load.mode,'amps');assert.match(load.name,/SYNTHETIC/);assert.equal(load.minV,'');}assert.deepEqual(loads.map(x=>x.load),[0.75,0.6,0.45]);assert(loads.slice(1).every(x=>x.equipment==='gm-hgd-gan-1g-thermal'));
 assert.equal(h.ev('evaluate(54).source'),31);assert.equal(h.ev('evaluate(860).source'),43);assert.equal(h.ev('state.job.trainingRevision'),'gs7k-gan-alpha18-v1');
 assert.match(h.json('TrainingJob.steps').find(step=>step[0]==='power')[4],/synthetic|SYNTHETIC/);
 assert.match(h.d.querySelector('.training-card').textContent,/GS7K.*GainMaker.*GaN/);
}));

test('The previous AOI complete export keeps every original and row while its replaced guide stays hidden',async()=>withApp({},async h=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'qa/fixtures/training-complete-alpha18-v1.json'),'utf8'));fixture.job.trainingSteps='launch,tdr';
 await h.w.NightSweep.openProject(JSON.stringify(fixture));await settle(h);const before=h.json('state');assert.equal(before.node.model,'vecima-en9000');assert.equal(before.job.trainingSteps,'launch,tdr');assert.equal(before.evidence.length,6);
 assert.equal(h.d.getElementById('trainingGuide').hidden,true);assert.equal(h.d.getElementById('trainingShowGuide').disabled,true);assert.match(h.d.getElementById('trainingCompatibility').textContent,/retained|older/i);assert.deepEqual(h.json('state'),before);
 const portable=JSON.parse(JSON.stringify(await h.w.evidenceExportProject(h.ev('state'))));assert.deepEqual(portable.rows,fixture.rows);assert.deepEqual(portable.evidence.map(x=>x.sha256),fixture.evidence.map(x=>x.sha256));const originalsByName=project=>Object.fromEntries(project.evidence.map(meta=>{const matches=project.evidenceFiles.filter(file=>file.id===meta.id);assert.equal(matches.length,1,'Each exported evidence ID joins exactly one original.');return [meta.name,{sha256:meta.sha256,base64:matches[0].base64}];}));assert.deepEqual(originalsByName(portable),originalsByName(fixture));assert(portable.evidenceFiles.every(file=>portable.evidence.some(meta=>meta.id===file.id)),'Every exported original joins its metadata.');
 await h.d.getElementById('openTrainingJob').onclick();await settle(h);assert.equal(h.ev('state.node.model'),'gs7000-12g');assert(h.json('JobsUI.snapshots()').some(x=>x.node?.model==='vecima-en9000'&&x.job.trainingSteps==='launch,tdr'&&x.evidence.length===6));
}));

test('Every References Open step exposes its previously collapsed target controls',async()=>withApp({},async h=>{
 for(const [button,step] of [['openTrainingJob','reference'],['openOemTrainingJob','launch'],['openDsimTrainingJob','launch'],['openGs7kTrainingJob','levels']]){
  await h.d.getElementById(button).onclick();await settle(h);
  h.d.querySelectorAll('#fieldReferencePanel details').forEach(details=>{details.open=false;});
  const project=h.ev('JSON.stringify(state.project)');h.d.querySelector('[data-training-open="'+step+'"]').click();
  assert.equal(h.ev('WorkflowUI.current()'),'references');assert.equal(h.d.querySelector('#fieldReferencePanel [data-reference-section="root"]').open,true,button);
  const target=h.d.querySelector('[data-reference-local-marker="low"]');assert(target,button);for(let ancestor=target.parentElement;ancestor;ancestor=ancestor.parentElement){if(ancestor.tagName==='DETAILS')assert.equal(ancestor.open,true,button+' target is collapsed');assert.equal(ancestor.hidden,false,button+' target is hidden');}
  assert.equal(h.ev('JSON.stringify(state.project)'),project,'Guide navigation cannot alter job criteria.');
 }
}));

test('Every Records Open step exposes all record sections and their existing editable forms',async()=>withApp({},async h=>{
 for(const button of ['openTrainingJob','openOemTrainingJob','openDsimTrainingJob','openGs7kTrainingJob']){
  await h.d.getElementById(button).onclick();await settle(h);h.d.querySelectorAll('#projectPanel details').forEach(details=>{details.open=false;});
  const before=h.ev('JSON.stringify([state.project,state.rows,state.job])');h.d.querySelector('[data-training-open="records"]').click();assert.equal(h.ev('WorkflowUI.current()'),'records');
  for(const kind of ['forward','returns','punch','dsim']){assertControlShown(h.d.querySelector('[data-project-add="'+kind+'"]'),button+' '+kind);for(const control of h.d.querySelectorAll('[data-project-scope="'+kind+'"]'))assertControlShown(control,button+' '+kind+' form');}
  assert.equal(h.ev('JSON.stringify([state.project,state.rows,state.job])'),before,'Guide navigation cannot alter records or acceptance.');
 }
}));

test('The gain Open step exposes its test-point measurement inputs at the intended amplifier',async()=>withApp({},async h=>{
 await h.d.getElementById('openTrainingJob').onclick();await settle(h);h.d.querySelectorAll('#route details').forEach(details=>{details.open=false;});
 const before=h.ev('JSON.stringify([state.project,state.rows,state.job])');h.d.querySelector('[data-training-open="gain"]').click();assert.equal(h.ev('WorkflowUI.current()'),'gain');assert.equal(h.d.getElementById('pointSelect').value,'r1');
 for(const field of ['measureF','measureIn','measureInTP','measureOut','measureOutTP'])assertControlShown(h.d.querySelector('#route [data-row="r1"] [data-field="'+field+'"]'),'Gain '+field);
 assert.equal(h.ev('JSON.stringify([state.project,state.rows,state.job])'),before,'Revealing measurement inputs cannot change gain or acceptance.');
}));

test('Every Job details Open step reveals the work-order fields named by its teaching hint',async()=>withApp({},async h=>{
 for(const button of ['openTrainingJob','openOemTrainingJob','openDsimTrainingJob','openGs7kTrainingJob']){
  await h.d.getElementById(button).onclick();await settle(h);h.d.getElementById('jobWorkOrder').open=false;
  const before=h.ev('JSON.stringify([state.project,state.rows,state.job])');h.d.querySelector('[data-training-open="job"]').click();assert.equal(h.ev('WorkflowUI.current()'),'projects');
  for(const field of ['workOrder','symptom','resolution'])assertControlShown(h.d.querySelector('[data-job-field="'+field+'"]'),button+' '+field);
  assert.equal(h.ev('JSON.stringify([state.project,state.rows,state.job])'),before,'Revealing work-order fields cannot edit the job.');
 }
}));

test('A retained legacy complete export keeps its data and progress while hiding the incompatible guide until Reset',async()=>withApp({},async h=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(root,'qa/fixtures/training-complete-legacy17.json'),'utf8'));fixture.job.trainingSteps='launch,tdr';
 await h.w.NightSweep.openProject(JSON.stringify(fixture));await settle(h);const before=h.json('state');
 assert.equal(before.node.model,'gs7000-12g');assert.equal(before.node.band,'3');assert.equal(before.job.trainingSteps,'launch,tdr');assert.equal(before.evidence.length,6);
 const notice=h.d.getElementById('trainingCompatibility');assert(notice,'Retained legacy practice needs a compatibility notice.');assert.equal(notice.hidden,false);assert.match(notice.textContent,/retained|older/i);assert.match(notice.textContent,/Reset complete training/);assert.equal(h.d.getElementById('trainingGuide').hidden,true);assert.equal(h.d.getElementById('trainingShowGuide').disabled,true);
 const task=h.ev('WorkflowUI.current()');h.d.querySelector('[data-training-open="launch"]').click();assert.equal(h.ev('WorkflowUI.current()'),task,'Hidden incompatible steps cannot navigate.');assert.deepEqual(h.json('state'),before);
 await h.d.getElementById('openTrainingJob').onclick();await settle(h);assert.equal(h.ev('state.node.model'),'gs7000-12g');assert.equal(h.ev('state.job.trainingSteps'),'');assert.equal(h.d.getElementById('trainingCompatibility').hidden,true);assert.equal(h.d.getElementById('trainingGuide').hidden,false);assert.equal(h.d.getElementById('trainingShowGuide').disabled,false);
 const retained=h.json('JobsUI.snapshots()').find(job=>job.node?.model==='gs7000-12g'&&job.node.band==='3'&&job.job?.trainingSteps==='launch,tdr');assert(retained,'Reset must preserve the retained legacy copy.');for(const key of ['node','setup','rows','project'])assert.deepEqual(retained[key],before[key],key+' remains unchanged');assert.deepEqual(retained.evidence.map(file=>file.sha256),before.evidence.map(file=>file.sha256));
}));

test('Changing the complete practice to another GS7K split hides the 42/54 guide without rewriting data',async()=>withApp({},async h=>{
 await h.d.getElementById('openTrainingJob').onclick();await settle(h);h.ev('state.node.band="1";state.job.trainingSteps="launch";renderAll()');const before=h.json('state');
 assert.equal(h.d.getElementById('trainingGuide').hidden,true);assert.equal(h.d.getElementById('trainingCompatibility').hidden,false);h.d.querySelector('[data-training-open="launch"]').click();assert.deepEqual(h.json('state'),before);
 h.ev('state.node.band="0";renderAll()');assert.equal(h.d.getElementById('trainingGuide').hidden,false);assert.equal(h.d.getElementById('trainingCompatibility').hidden,true);assert.equal(h.ev('state.job.trainingSteps'),'launch');
}));

test('GS7K, OEM and DSIM practice teach only the deployed 42/54 split',async()=>withApp({},async h=>{
 for(const [button,list] of [['openOemTrainingJob','oemSteps'],['openDsimTrainingJob','dsimSteps'],['openGs7kTrainingJob','gs7kSteps']]){
  await h.d.getElementById(button).onclick();await settle(h);assert.equal(h.ev('state.sweepSetup.selected'),'42');
  const profile=h.json('projectProfile(state.project.selectedProfile)');assert.equal(profile.returnCeiling,42);assert.equal(profile.forwardFloor,54);
  const sweep=h.json('TrainingJob.'+list).find(step=>step[0]==='sweep');assert.match(sweep[4],/42 \/ 54/);assert.doesNotMatch(sweep[4],/If.*204|choose.*204/);
 }
}));

test('A failed complete-training button reports its error next to the buttons and permits retry',async()=>withApp({secure:false},async h=>{
 const before=h.ev('JSON.stringify(state)'),button=h.d.getElementById('openTrainingJob');await button.onclick();await settle(h);
 assert.equal(h.ev('JSON.stringify(state)'),before);const status=h.d.getElementById('trainingStatus');assert(status,'Training failures need a status beside the buttons.');assert.equal(status.hidden,false);assert.match(status.textContent,/Secure file verification/);assert.match(status.className,/error/);assert.equal(status.getAttribute('role'),'status');assert.equal(button.disabled,false);
 Object.defineProperty(h.w.crypto,'subtle',{value:webcrypto.subtle});await button.onclick();await settle(h);assert.equal(h.ev('state.job.training'),'guided-1.5');assert(!h.d.getElementById('trainingStatus').classList.contains('error'));assert.equal(button.disabled,false);
}));
