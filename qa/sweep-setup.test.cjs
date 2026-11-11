/* NightSweep1.6 guided setup, current/legacy job preservation, and calculation edge cases. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');process.chdir(root);const cases=[],instances=[];
function boot(file='outputs/Night_Sweep.html',options={}){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const db=options.db||new FDB.IDBFactory();
 const dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=db;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  for(const [key,value] of Object.entries(options.storage||{}))w.localStorage.setItem(key,value);
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});instances.push({dom,errors});const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
 return {w,d,ev,json,db,errors,downloads,storage:()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return[k,w.localStorage.getItem(k)];}))};
}
const flush=()=>new Promise(r=>setImmediate(r));
async function settle(h){for(let i=0;i<4;i++)await flush();const end=Date.now()+5000;while(h.w.evidenceIsBusy?.()&&Date.now()<end)await flush();assert(!h.w.evidenceIsBusy?.(),'evidence operation timeout');}
async function check(name,fn){await fn();for(const h of instances)assert.deepEqual(h.errors,[], 'No uncaught app errors');cases.push(name);console.log('PASS '+name);}
function set(h,selector,value,event='input'){const el=h.d.querySelector(selector);assert(el,selector);if(el.type==='checkbox')el.checked=!!value;else el.value=value;el.dispatchEvent(new h.w.Event(event,{bubbles:true}));return el;}
function click(h,selector){const el=h.d.querySelector(selector);assert(el,selector);el.click();return el;}
function visible(el){for(let p=el;p?.nodeType===1;p=p.parentElement){if(p.hidden||p.ownerDocument.defaultView.getComputedStyle(p).display==='none')return false;if(p.tagName==='DETAILS'&&!p.open&&p!==el&&!p.querySelector(':scope > summary')?.contains(el))return false;}return !!el;}
const evidenceFile=(name,bytes,type)=>({name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer});
function near(actual,expected){assert(Number.isFinite(actual));assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);}
const preservedKeys=['setup','rows','power','project','node','frequency','routeTools','fieldWork','fieldReferences','job','customJobMetadata'];
function assertPreserved(h,bundle){for(const key of preservedKeys)if(key!=='rows'&&bundle[key]!==undefined)assert.deepEqual(h.json('state['+JSON.stringify(key)+']'),bundle[key],key);const rows=h.json('state.rows');assert.equal(rows.length,bundle.rows.length);bundle.rows.forEach((row,i)=>{for(const [key,value] of Object.entries(row))assert.deepEqual(rows[i][key],value,'rows['+i+'].'+key);});}
const calc=`({low:evaluate(261).results.map(r=>r.outputs.map(p=>p.level)),high:evaluate(993).results.map(r=>r.outputs.map(p=>p.level)),route:HFC.routeDistances(state,catalog).rows.map(r=>[r.start,r.end])})`;
(async()=>{
 const old=boot('qa/fixtures/alpha015.html');await settle(old);let bundle,stored,numbers,savedId;
 const bytes=new Uint8Array([0,25,128,255,80,75]);
 await check('The actual1.5 app creates a field job, named copy and original attachment for migration',async()=>{
  assert.equal(old.d.title,'NightSweep 1.5 Alpha');
  old.ev(`state.example=false;state.job={name:'1.5 migration job',node:'NODE-42',workOrder:'QA-15-16',lead:'Synthetic technician'};state.rows[0].name='Keep original point';state.rows[0].asBuiltNote='Known field note';state.customJobMetadata={retained:[0,false,''],note:'Keep metadata'};renderAll();JobsUI.theme('sun');`);
  await old.ev('EvidenceUI').importFiles([evidenceFile('qa-original.onx',bytes,'application/octet-stream')],{kind:'Sweep',stage:'Before',asset:'NODE-42',notes:'Synthetic migration original'});
  savedId=old.ev('JobsUI.saveNamed()');assert(savedId);old.ev('saveLocal()');bundle=JSON.parse(JSON.stringify(await old.w.evidenceExportProject(old.ev('state'))));stored=old.storage();numbers=old.json(calc);assert.equal(bundle.evidenceFiles.length,1);
 });
 const upgraded=boot('outputs/Night_Sweep.html',{db:old.db,storage:stored});await settle(upgraded);
 await check('A1.5 autosave reopens in1.6 with named jobs, theme and existing engineering fields unchanged',()=>{
  assert.equal(upgraded.d.title,'Carpe Noctum 2.0 Alpha build 2');assertPreserved(upgraded,bundle);
  assert.equal(upgraded.d.documentElement.dataset.theme,'sun');assert(upgraded.json('JobsUI.snapshots()').some(x=>x.job.id===savedId));assert.deepEqual(upgraded.json(calc),numbers);
 });
 await check('Original attachment bytes remain intact after the1.5-to1.6 in-place restart',async()=>{
  const again=await upgraded.w.evidenceExportProject(upgraded.ev('state'));assert.equal(again.evidenceFiles.length,1);assert.deepEqual([...upgraded.w.EvidenceCore.base64ToBytes(again.evidenceFiles[0].base64)],[...bytes]);
 });
 const app=boot();await settle(app);
 await check('A portable1.5 project also opens in1.6 without creating a setup approval or altering the route',async()=>{
  await app.w.NightSweep.openProject(JSON.stringify(bundle));await settle(app);assertPreserved(app,bundle);assert.deepEqual(app.json(calc),numbers);assert.equal(app.ev('state.project.returns.length'),bundle.project.returns.length);
 });
 await check('The Home shortcut and Test tab reach one isolated guided setup panel',()=>{
  click(app,'#homePanel [data-task="sweepSetup"]');assert.equal(app.ev('WorkflowUI.current()'),'sweepSetup');assert(visible(app.d.getElementById('sweepSetupPanel')));
  const shown=[...app.d.querySelectorAll('[data-screen]')].filter(el=>!el.hidden&&el.dataset.screen!=='help').map(el=>el.id);assert.deepEqual(shown,['sweepSetupPanel']);
  assert(app.d.querySelector('#taskTabs [data-task="sweepSetup"][aria-selected="true"]'));
 });
 await check('Viewing all setup directions never mutates a migrated job or grants RF acceptance',()=>{
  const before=app.ev('JSON.stringify(state)');for(const tab of ['home','sweepSetup','records','sweepSetup','route','sweepSetup'])app.ev('WorkflowUI.go('+JSON.stringify(tab)+')');assert.equal(app.ev('JSON.stringify(state)'),before);assert.equal(app.ev('state.project.returns.length'),bundle.project.returns.length);
 });
 const base42={lowMHz:'10',highMHz:'40',measuredLow:'-2',measuredHigh:'1',targetLow:'0',targetHigh:'0',currentBandwidth:'6.4',referenceBandwidth:'6.4',currentView:'detailed',referenceView:'detailed',plan:'PL42',referencePlan:'PL42',reference:'REF42',referenceSource:'NODE-42 Port1',plane:'Referenced response'};
 await check('Empty inputs stay unknown; zero and negative referenced levels remain valid numeric values',()=>{
  for(const v of ['', ' ',null,undefined,false,{},'NaN','Infinity'])assert.equal(app.ev('SweepSetup').number(v),null);
  assert.equal(app.ev('SweepSetup').number('0'),0);assert.equal(app.ev('SweepSetup').number('-2.5'),-2.5);
  assert.equal(app.ev('SweepSetup').comparison({},'42').valid,false);assert.equal(app.ev('SweepSetup').generator({},'204').valid,false);
  assert.equal(app.ev('SweepSetup').comparison({...base42,targetLow:''},'42').valid,false);
 });
 await check('Referenced return errors preserve signed readings and never apply hidden receive addbacks',()=>{
  const r=app.ev('SweepSetup').comparison({...base42,addLow:'20',addHigh:'20'},'42');assert.equal(r.valid,true);assert.equal(r.unit,'dB');near(r.low,-2);near(r.high,1);near(r.tilt,3);near(r.lowError,-2);near(r.highError,1);near(r.tiltError,3);
  assert.equal('estimatedPad' in r,false);assert.equal('within' in r,false);assert.equal('pass' in r,false);
 });
 await check('Out-of-band or reversed return markers reject both split profiles',()=>{
  for(const [split,patch] of [['42',{lowMHz:4}],['42',{highMHz:43}],['42',{lowMHz:40,highMHz:40}],['204',{highMHz:205}],['204',{lowMHz:30,highMHz:10}]])assert.equal(app.ev('SweepSetup').comparison({...base42,...patch},split).valid,false);
  assert.equal(app.ev('SweepSetup').comparison({...base42,highMHz:42},'42').valid,true);assert.equal(app.ev('SweepSetup').comparison({...base42,highMHz:204},'204').valid,true);
 });
 await check('Return sweepless comparisons reject a different or missing bandwidth or sweep-view basis',()=>{
  const math=app.ev('SweepSetup');
  for(const patch of [{referenceBandwidth:'1.6'},{currentBandwidth:''},{referenceBandwidth:''},{referenceView:'1.6'},{currentView:''},{referenceView:''},{referencePlan:'DIFFERENT'}])assert.equal(math.comparison({...base42,...patch},'42').valid,false,JSON.stringify(patch));
 });
 await check('Absolute204MHz arithmetic requires explicit addbacks and keeps injection correction separate',()=>{
  const math=app.ev('SweepSetup'),v={...base42,comparisonMode:'absolute',measuredLow:'-28',measuredHigh:'-27',addLow:'20',addHigh:'20',targetLow:'-8',targetHigh:'-8',injectionCoupling:30};
  const r=math.comparison(v,'204');assert.equal(r.valid,true);assert.equal(r.unit,'dBmV');near(r.low,-8);near(r.high,-7);near(r.tiltError,1);
  assert.equal(math.comparison({...v,addLow:''},'204').valid,false);assert.equal(math.comparison({...v,addHigh:-1},'204').valid,false);
 });
 await check('The injection helper distinguishes physical output, unknown capability and an exceeded limit',()=>{
  const math=app.ev('SweepSetup'),v={desiredInjection:'31',injectionCoupling:'20',leadLoss:'1',generatorMaximum:''};
  const a=math.generator(v,'204');assert.equal(a.valid,true);near(a.setting,52);assert.equal(a.withinCapability,null);
  assert.equal(math.generator({...v,generatorMaximum:51},'204').withinCapability,false);assert.equal(math.generator({...v,generatorMaximum:52},'204').withinCapability,true);
  assert.equal(math.generator({...v,injectionCoupling:''},'204').valid,false);assert.equal(math.generator({...v,leadLoss:-1},'204').valid,false);assert.equal(math.generator(v,'42').valid,false);
 });
 await check('The actual chart declines an overflowing dynamic range without emitting invalid SVG coordinates',()=>{
  const h=boot();h.ev('state.setup={...defaultSetup,launchMode:"table",launchTable:"261,-1e308\\n993,1e308",graphMode:"absolute",viewStart:261,viewEnd:993};state.rows=[];selected=new Set(["source"]);drawChart();');
  assert.match(h.d.getElementById('plot').textContent,/supported chart range/);assert.equal(h.d.getElementById('plot').querySelector('path'),null);assert.doesNotMatch(h.d.getElementById('plot').innerHTML,/NaN|Infinity/);assert.equal(h.d.getElementById('plot').onpointermove,null);assert.match(h.d.getElementById('chartNotes').textContent,/No acceptance is inferred/);
 });
 await check('Run-sheet comparison overflow stays unknown while preserving finite original readings',()=>{
  const h=boot();h.ev('state.setup={...defaultSetup,lowF:261,highF:993,lowLevel:-1e308,highLevel:-1e308,launchMode:"linear"};state.rows=[{id:"r1",name:"Extreme signed inputs",parent:"source",length:0,cable:"p3_625",device:"none",meters:{through:{frequency:261,reading:"1e308",testPoint:false}}}];');
  const row=h.json('FieldReport.sheetData().rows[0]');assert.equal(row.through,-1e308);assert.equal(row.measurement,1e308);assert.equal(row.error,null);h.ev('FieldReport.sheetCsv()');assert.doesNotMatch(h.downloads.at(-1).text,/NaN|Infinity/);
 });
 await check('A42MHz job exposes return sweepless fields and omits injection and physical receive controls',()=>{
  click(app,'[data-sweep-split="42"]');assert.equal(app.ev('state.sweepSetup.selected'),'42');
  assert.equal(app.d.querySelector('[data-sweep-field="desiredInjection"]'),null);assert.equal(app.d.querySelector('[data-sweep-field="addLow"]'),null);assert.equal(app.d.querySelector('[data-sweep-field="comparisonMode"]'),null);
  for(const key of ['currentBandwidth','referenceBandwidth','currentView','referenceView'])assert(app.d.querySelector('[data-sweep-field="'+key+'"]'),key);
  assert.match(app.d.getElementById('sweepSetupPanel').textContent,/Return sweepless/);assert.doesNotMatch(app.d.getElementById('sweepSetupPanel').textContent,/RF passed|RF accepted|RF certified/i);
 });
 await check('Settings and step notes remain independent when switching42MHz and204MHz profiles',()=>{
  set(app,'[data-sweep-field="station"]','LEGACY-A1');set(app,'[data-sweep-field="plan"]','PL42');
  const first=app.ev('SweepSetupGuide.profiles["42"].steps[0].id');set(app,'[data-sweep-step-done="'+first+'"]',true,'change');set(app,'[data-sweep-step-note="'+first+'"]','Legacy reference recorded');
  const saved42=app.json('state.sweepSetup.profiles["42"]');click(app,'[data-sweep-split="204"]');set(app,'[data-sweep-field="station"]','HIGH-A2');set(app,'[data-sweep-field="plan"]','XP204');
  assert.equal(app.ev('state.sweepSetup.profiles["204"].station'),'HIGH-A2');assert.equal(app.ev('state.sweepSetup.profiles["204"].steps['+JSON.stringify(first)+']'),undefined);assert.deepEqual(app.json('state.sweepSetup.profiles["42"]'),saved42);
  click(app,'[data-sweep-split="42"]');assert.equal(app.d.querySelector('[data-sweep-field="station"]').value,'LEGACY-A1');assert.equal(app.d.querySelector('[data-sweep-step-done="'+first+'"]').checked,true);assert.equal(app.d.querySelector('[data-sweep-step-note="'+first+'"]').value,'Legacy reference recorded');
 });
 await check('The guided next/previous actions retain notes and progress without creating measurement records',()=>{
  const ids=app.json('SweepSetupGuide.profiles["42"].steps.map(s=>s.id)'),first=ids[0],second=ids[1],records=app.ev('JSON.stringify(state.project)');
  click(app,'[data-sweep-step-go="'+second+'"]');assert.equal(app.ev('state.sweepSetup.profiles["42"].step'),second);set(app,'[data-sweep-step-done="'+second+'"]',true,'change');
  assert.match(app.d.getElementById('sweepSetupProgress').textContent,/2 \/ \d+ steps recorded/);click(app,'[data-sweep-step-go="'+first+'"]');assert.equal(app.d.querySelector('[data-sweep-step-note="'+first+'"]').value,'Legacy reference recorded');assert.equal(app.ev('JSON.stringify(state.project)'),records);
 });
 await check('Changing equipment procedure updates the sequence guidance for the selected profile',()=>{
  click(app,'[data-sweep-split="204"]');set(app,'[data-sweep-field="method"]','aoi','change');assert.match(app.d.getElementById('sweepMethodNote').textContent,/last amplifier/);
  set(app,'[data-sweep-field="method"]','manual','change');assert.match(app.d.getElementById('sweepMethodNote').textContent,/nearest the node outward/);click(app,'[data-sweep-split="42"]');assert.equal(app.d.querySelector('[data-sweep-field="method"] option[value="aoi"]'),null);
 });
 await check('Untrusted station names and notes are displayed as text, not executable markup',()=>{
  const injected='<img src=x onerror="window.__sweepInjected=1">';set(app,'[data-sweep-field="station"]',injected);const first=app.ev('SweepSetupGuide.profiles["42"].steps[0].id');set(app,'[data-sweep-step-note="'+first+'"]',injected);
  click(app,'[data-sweep-split="204"]');click(app,'[data-sweep-split="42"]');assert.equal(app.d.querySelector('[data-sweep-field="station"]').value,injected);assert.equal(app.d.querySelector('[data-sweep-step-note="'+first+'"]').value,injected);assert.equal(app.d.querySelector('#sweepSetupPanel img[src="x"]'),null);assert.equal(app.w.__sweepInjected,undefined);
  set(app,'[data-sweep-field="station"]','LEGACY-A1');set(app,'[data-sweep-step-note="'+first+'"]','Legacy reference recorded');
 });
 await check('Station snapshots require an identity and preserve prior readings when the next station is edited',()=>{
  set(app,'[data-sweep-field="station"]','');assert.equal(app.ev('SweepSetup.saveSnapshot()'),false);assert.equal(app.ev('state.sweepSetup.history.length'),0);
  set(app,'[data-sweep-field="station"]','LEGACY-A1');set(app,'[data-sweep-field="measuredLow"]','-2');click(app,'[data-sweep-snapshot]');const original=app.json('state.sweepSetup.history[0]');assert.equal(original.profile.station,'LEGACY-A1');assert.equal(original.profile.measuredLow,'-2');assert.equal(original.training,false);assert(Number.isFinite(Date.parse(original.createdAt)));
  set(app,'[data-sweep-field="station"]','LEGACY-A2');set(app,'[data-sweep-field="measuredLow"]','1');assert.deepEqual(app.json('state.sweepSetup.history[0]'),original);assert.match(app.d.querySelector('[data-sweep-section="history"]').textContent,/LEGACY-A1/);
  set(app,'[data-sweep-field="station"]','LEGACY-A1');
 });
 await check('Snapshot text is escaped and history can retain both split workflows',()=>{
  const malicious='<img src=x onerror="window.__snapshotInjected=1">';set(app,'[data-sweep-field="station"]',malicious);click(app,'[data-sweep-snapshot]');assert.equal(app.d.querySelector('#sweepSetupPanel img[src="x"]'),null);assert.equal(app.w.__snapshotInjected,undefined);assert(app.d.querySelector('[data-sweep-section="history"]').textContent.includes(malicious));set(app,'[data-sweep-field="station"]','LEGACY-A1');
  click(app,'[data-sweep-split="204"]');set(app,'[data-sweep-field="desiredInjection"]','31');set(app,'[data-sweep-field="injectionCoupling"]','20');set(app,'[data-sweep-field="leadLoss"]','1');click(app,'[data-sweep-snapshot]');assert.equal(app.ev('state.sweepSetup.history[2].split'),'204');assert.equal(app.ev('state.sweepSetup.history[2].profile.station'),'HIGH-A2');click(app,'[data-sweep-split="42"]');
 });
 await check('Compact reports carry both current profiles and saved stations without inventing readings',()=>{
  const text=app.ev('SweepSetup.reportText()');assert.match(text,/LEGACY-A1/);assert.match(text,/HIGH-A2/);assert.match(text,/Station snapshot/);assert.match(text,/52.00 dBmV/);assert.match(text,/do not establish RF acceptance/);assert.equal(app.ev('SweepSetup').reportText({}), '');
 });
 let portable;
 await check('Project export and fresh import preserve both setups, progress and original evidence bytes',async()=>{
  await app.d.getElementById('save').onclick();const out=app.downloads.at(-1);assert.equal(out.name,'CarpeNoctum_2.0_Alpha_build_2_Project.json');portable=JSON.parse(out.text);assert.equal(portable.sweepSetup.profiles['42'].station,'LEGACY-A1');assert.equal(portable.sweepSetup.profiles['204'].station,'HIGH-A2');assert.equal(portable.sweepSetup.history.length,3);
  const fresh=boot();await settle(fresh);await fresh.w.NightSweep.openProject(JSON.stringify(portable));await settle(fresh);assert.deepEqual(fresh.json('state.sweepSetup'),portable.sweepSetup);const again=await fresh.w.evidenceExportProject(fresh.ev('state'));assert.equal(again.evidenceFiles.length,1);assert.deepEqual([...fresh.w.EvidenceCore.base64ToBytes(again.evidenceFiles[0].base64)],[...bytes]);
 });
 await check('An in-place1.6 restart restores the selected setup profile from autosave',async()=>{
  app.ev('saveLocal()');const restart=boot('outputs/Night_Sweep.html',{db:app.db,storage:app.storage()});await settle(restart);assert.deepEqual(restart.json('state.sweepSetup'),app.json('state.sweepSetup'));restart.ev('WorkflowUI.go("sweepSetup")');assert.equal(restart.d.querySelector('[data-sweep-field="station"]').value,'LEGACY-A1');
 });
 await check('Named-job switching retains independent setup profiles with their original job',async()=>{
  const id=app.ev('JobsUI.saveNamed()'),saved=app.json('state.sweepSetup');await app.ev('JobsUI.newJob()');await settle(app);assert.equal(app.ev('state.sweepSetup'),undefined);await app.ev('JobsUI.open('+JSON.stringify(id)+')');await settle(app);assert.deepEqual(app.json('state.sweepSetup'),saved);
 });
 await check('A workflow-only working job is retained when another project is opened',()=>{
  const h=boot();h.ev('state={version:1,example:false,setup:{...defaultSetup},rows:[],power:freshPower(),sweepSetup:SweepSetup.defaults()};state.sweepSetup.profiles["42"].station="WORKFLOW-ONLY";');
  const before=h.ev('JobsUI.snapshots().length');assert.equal(h.ev('JobsUI.beforeProjectOpen({confirmed:true})'),true);assert.equal(h.ev('JobsUI.snapshots().length'),before+1);assert(h.json('JobsUI.snapshots()').some(s=>s.sweepSetup?.profiles['42']?.station==='WORKFLOW-ONLY'));
 });
 await check('Malformed setup imports reject before replacing the working job',()=>{
  const before=app.ev('JSON.stringify(state)'),original=JSON.parse(before);
  const malformed=[{version:2},{selected:'85'},{profiles:[]},{profiles:{'42':{method:'aoi'}}},{profiles:{'42':{comparisonMode:'absolute'}}},{profiles:{'42':{station:{nested:'bad'}}}},{profiles:{'42':{steps:{abc:{done:'Yes'}}}}},{profiles:{'42':{steps:{abc:{notes:'x'.repeat(8001)}}}}},{profiles:{'204':{desiredInjection:true}}},{history:[{createdAt:'not-a-date',split:'42',profile:{}}]},{history:[{createdAt:new Date().toISOString(),split:'85',profile:{}}]},{history:[{createdAt:new Date().toISOString(),split:'42',profile:{},training:'true'}]},{history:Array.from({length:101},()=>({createdAt:new Date().toISOString(),split:'42',profile:{}}))}];
  for(const sweepSetup of malformed){const input={...original,sweepSetup};assert.throws(()=>app.ev('loadState('+JSON.stringify(input)+')'),/sweep|Sweep|42 MHz|AOI/);assert.equal(app.ev('JSON.stringify(state)'),before);}
 });
 await check('Setup export names the selected method, marks progress only and preserves both versions of guide coverage',async()=>{
  app.ev('WorkflowUI.go("sweepSetup")');click(app,'[data-sweep-split="42"]');await app.ev('SweepSetup.exportNotes()');let out=app.downloads.at(-1);assert.equal(out.name,'CarpeNoctum_2.0_Alpha_build_2_42MHz_Setup.txt');assert.match(out.text,/Return sweepless sweep/);assert.match(out.text,/Checked steps are not RF acceptance/);assert.match(out.text,/LEGACY-A1/);assert.match(out.text,/HIGH-A2/);assert.match(out.text,/Station snapshot/);
  click(app,'[data-sweep-split="204"]');await app.ev('SweepSetup.exportNotes()');out=app.downloads.at(-1);assert.equal(out.name,'CarpeNoctum_2.0_Alpha_build_2_204MHz_Setup.txt');assert.match(out.text,/Return sweep with XPERTrak/);assert.match(out.text,/Physical generator-output budget:/);assert.match(out.text,/HIGH-A2/);
 });
 await check('A guided training setup export stays explicitly synthetic after job names are changed',()=>{
  const training={...app.json('state'),job:{name:'Renamed practice',training:'guided-1.5'}};const text=app.ev('SweepSetup').exportText(training,'42');assert.match(text,/SYNTHETIC TRAINING JOB/);assert.match(text,/not field measurements|not field data/i);
 });
 await check('Training snapshots keep their provenance after copying into an ordinary named job',()=>{
  const h=boot();h.ev('state.sweepSetup=SweepSetup.defaults();state.job={name:"Practice",training:"guided-1.5"};state.sweepSetup.profiles["42"].station="TRAINING-STATION";');assert.equal(h.ev('SweepSetup.saveSnapshot()'),true);assert.equal(h.ev('state.sweepSetup.history[0].training'),true);h.ev('delete state.job.training;state.job.name="Renamed";');assert.match(h.ev('SweepSetup.reportText()'),/SYNTHETIC TRAINING/);
 });
 await check('The100-station limit rejects extra snapshots without changing the existing history',()=>{
  const h=boot();h.ev('state.sweepSetup=SweepSetup.defaults();state.sweepSetup.profiles["42"].station="LIMIT";state.sweepSetup.history=Array.from({length:100},(_,i)=>({createdAt:new Date().toISOString(),split:"42",profile:{station:"KEEP-"+i},training:false}));');const before=h.ev('JSON.stringify(state.sweepSetup.history)');assert.equal(h.ev('SweepSetup.saveSnapshot()'),false);assert.equal(h.ev('JSON.stringify(state.sweepSetup.history)'),before);assert.match(h.d.getElementById('sweepExportStatus').textContent,/100 station/);
 });
 await check('Repeated setup rendering leaves unique DOM identifiers and no runtime errors',()=>{
  for(let i=0;i<3;i++)app.ev('renderAll();WorkflowUI.go("sweepSetup")');for(const h of instances){const ids=[...h.dom.window.document.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length);}assert.deepEqual(app.errors,[]);
 });
 fs.writeFileSync('qa/sweep-setup-results.json',JSON.stringify({version:'2.0 Alpha build 2',count:cases.length,cases,legacySourceSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync('qa/fixtures/alpha015.html')).digest('hex'),scope:'Synthetic1.5 source migration with preserved original bytes, guided setup DOM flows, validation and arithmetic; no live meter/XPERTrak or physical Android claim.'},null,2)+'\n');
 console.log('Sweep setup 1.6: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{for(const h of instances){if(h.dom.window.document){const end=Date.now()+5000;while(h.dom.window.evidenceIsBusy?.()&&Date.now()<end)await flush();h.dom.window.close();}}});
