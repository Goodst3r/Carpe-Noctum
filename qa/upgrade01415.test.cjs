/* Verify migration from the actual 1.4 web application, including an in-place storage restart. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto'),{JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');process.chdir(root);const instances=[],cases=[];
function boot(html,options={}){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const db=options.db||new FDB.IDBFactory();
 const dom=new JSDOM(html,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=db;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  for(const [key,value] of Object.entries(options.storage||{}))w.localStorage.setItem(key,value);
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});instances.push(dom);const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));return {w,d,ev,json,db,errors,downloads};
}
async function idle(app){const end=Date.now()+5000;while(app.ev('evidenceIsBusy()')){if(Date.now()>end)throw Error('Evidence restore did not become idle');await new Promise(r=>setImmediate(r));}}
const copy=x=>JSON.parse(JSON.stringify(x)),file=(name,bytes,type)=>({name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer});
const projectFields=['setup','rows','routeTools','power','node','fieldWork','fieldReferences','job','project','futureFieldNotes'];
const calculations=`({low:evaluate(261).results.map(r=>r.outputs.map(p=>p.level)),high:evaluate(993).results.map(r=>r.outputs.map(p=>p.level)),distance:HFC.routeDistances(state,catalog).rows.map(r=>[r.start,r.end]),tdr:HFC.tdrLocate(state,catalog,{endpoint:'r2',start:'source',direction:'forward',distance:180,lead:0}),gain:HFC.gainBudget({...state,setup:effectiveLaunchSetup()},catalog,{rowId:'r3'})})`;
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
(async()=>{
 const old=boot(fs.readFileSync('qa/fixtures/alpha014.html','utf8'));let bundle,stored,oldNumbers,savedId;
 const csv=new TextEncoder().encode('frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n'),opaque=new Uint8Array([0,255,80,75,3,4,33]);
 await check('Actual 1.4 code creates active, branch, slack and TDR records with original evidence',async()=>{
  assert.match(old.d.title,/1\.4/);assert.deepEqual(old.errors,[]);
  old.ev(`state.example=false;state.setup={...defaultSetup,lowLevel:14,highLevel:26,launchTestPoint:true,launchCoupling:20};
   state.rows=[{id:'r1',name:'Pole A',parent:'source',length:120,slack:12,cable:'custom',customCable:'261,1\\n993,2',device:'none',asBuiltNote:'132 ft including riser',meters:{through:{frequency:261,reading:12.5,testPoint:true,coupling:20}}},
   {id:'r2',name:'Pole B',parent:'r1::through',length:118,slack:0,cable:'custom',customCable:'261,1\\n993,2',device:'none'},
   {id:'r3',name:'LE at pole B',parent:'r2::through',length:0,slack:0,cable:'custom',customCable:'261,1\\n993,2',device:'active_aoi_le',activeMode:'anchors',gainLowF:261,gainHighF:993,gainLow:20,gainHigh:30,targetLow:48,targetHigh:68,reserve:3,outputLoss:0,outputLimitLow:60,outputLimitHigh:75,measureIn:10,measureOut:20,measureInTP:20,measureOutTP:20,measureF:993},
   {id:'r4',name:'Branch',parent:'r1::through',length:30,slack:5,cable:'custom',customCable:'261,1\\n993,2',device:'none'}];
   state.routeTools={frequency:993,endpoint:'r2',start:'source',direction:'forward',distance:180,lead:0,vfEnabled:false,setVF:'0.87',actualVF:'0.87'};
   state.job={name:'1.4 field job',node:'HA0005',date:'2026-11-10',lead:'Synthetic QA',workOrder:'WO-14-15',resolution:'Verified cable spans',weather:'44 F'};
   state.fieldWork={leakage:{checks:{connectors:true},notes:'Two damaged spans',conversion:{value:'83.1',from:'dbuv'}},maintenance:{checks:{amplifierUnity:{done:true,notes:'Paired readings retained'}}}};
   state.futureFieldNotes={technicianComment:'Retain unknown metadata',values:[0,false,'']};loadState(state);JobsUI.theme('sun');`);
  await old.ev('EvidenceUI').importFiles([file('field-trace.csv',csv,'text/csv'),file('opaque.onx',opaque,'application/octet-stream')],{kind:'Sweep',stage:'Before',asset:'HA0005',notes:'Synthetic originals'});
  savedId=old.ev('JobsUI.saveNamed()');assert(savedId);old.ev('saveLocal()');
  bundle=await old.w.evidenceExportProject(old.ev('state'));oldNumbers=old.json(calculations);
  stored=Object.fromEntries(Array.from({length:old.w.localStorage.length},(_,i)=>{const k=old.w.localStorage.key(i);return[k,old.w.localStorage.getItem(k)];}));
  assert.equal(bundle.evidenceFiles.length,2);assert.equal(oldNumbers.tdr.offsetFromStart,48);assert.equal(oldNumbers.gain.status,'enough');
 });
 const updated=boot(fs.readFileSync('outputs/Night_Sweep.html','utf8'),{db:old.db,storage:stored});
 await check('1.4 autosave and named jobs load in 1.6 without exporting or clearing storage',async()=>{
  assert.match(updated.d.title,/2\.0/);assert.deepEqual(updated.errors,[]);
  for(const key of projectFields){if(bundle[key]!==undefined)assert.deepEqual(updated.json('state['+JSON.stringify(key)+']'),copy(bundle[key]),key);}
  assert.equal(updated.ev('JobsUI.snapshots().some(s=>s.job.id==='+JSON.stringify(savedId)+')'),true);
  assert.equal(updated.d.documentElement.dataset.theme,'sun');
 });
 await check('Stored 1.4 originals remain byte-for-byte exportable after restart',async()=>{
  await idle(updated);const out=await updated.w.evidenceExportProject(updated.ev('state'));assert.equal(out.evidenceFiles.length,2);
  for(const meta of out.evidence){const bytes=updated.w.EvidenceCore.base64ToBytes(out.evidenceFiles.find(x=>x.id===meta.id).base64);assert.deepEqual([...bytes],[...(meta.name.endsWith('.csv')?csv:opaque)]);}
 });
 const app=boot(fs.readFileSync('outputs/Night_Sweep.html','utf8'));
 await check('Portable 1.4 backup imports all gain, branch, distance and job fields',async()=>{
  await app.w.NightSweep.openProject(JSON.stringify(bundle));
  for(const key of projectFields){if(bundle[key]!==undefined)assert.deepEqual(app.json('state['+JSON.stringify(key)+']'),copy(bundle[key]),key);}
  assert.equal(app.ev('state.rows[2].gainHigh'),30);assert.equal(app.ev('state.rows[0].slack'),12);assert.equal(app.ev('state.routeTools.distance'),180);
 });
 await check('Corrected RF levels, gain budgets and branch/TDR calculations are unchanged',()=>{
  const current=app.json(calculations),previous=copy(oldNumbers);
  assert.equal(current.gain.publishedReference.source,'https://ao-inc.com/assets/resources-element-files/Spanish/QB18-LE-Datasheet_ES.pdf');
  assert.match(current.gain.publishedReference.conditions,/minimum operational gain/);
  // Audited document URLs and source conditions may change; every engineering result must remain identical.
  for(const data of [current,previous]){delete data.gain.publishedReference.source;delete data.gain.publishedReference.conditions;}
  assert.deepEqual(current,previous);
 });
 await check('Navigation through new task tabs changes no saved engineering inputs',()=>{
  const before=app.json('state');for(const tab of ['setup','route','gain','tdr','sweep','frequency','readings','references','power','trial','projects','evidence','checklists','records','runsheet','home'])app.ev('WorkflowUI.go('+JSON.stringify(tab)+')');
  for(const key of projectFields){if(before[key]!==undefined)assert.deepEqual(app.json('state['+JSON.stringify(key)+']'),before[key],key);}
 });
 await check('New named-job switch restores original active settings, slack and evidence',async()=>{
  const id=app.ev('JobsUI.saveNamed()');await app.ev('JobsUI.newJob()');assert.equal(app.ev('state.rows.length'),0);
  await app.ev('JobsUI.open('+JSON.stringify(id)+')');assert.equal(app.ev('state.rows[2].gainHigh'),30);assert.equal(app.ev('state.rows[0].slack'),12);assert.equal(app.ev('state.routeTools.distance'),180);
  const out=await app.w.evidenceExportProject(app.ev('state'));assert.equal(out.evidenceFiles.length,2);for(const meta of out.evidence){const bytes=app.w.EvidenceCore.base64ToBytes(out.evidenceFiles.find(x=>x.id===meta.id).base64);assert.deepEqual([...bytes],[...(meta.name.endsWith('.csv')?csv:opaque)]);}
 });
 await check('Current export names use 1.6 and preserve unknown metadata and signed negative levels',async()=>{
  await app.d.getElementById('save').onclick();const download=app.downloads.at(-1);assert.equal(download.name,'CarpeNoctum_2.0_Alpha_build_4_Project.json');
  const restored=JSON.parse(download.text);assert.deepEqual(restored.futureFieldNotes,copy(bundle.futureFieldNotes));assert.deepEqual(restored.rows,copy(bundle.rows));assert.equal(restored.evidenceFiles.length,2);
 });
 await check('Invalid gain/TDR payloads reject without overwriting the migrated working job',()=>{
  const before=app.ev('JSON.stringify(state)');for(const change of [{routeTools:{direction:'sideways'}},{rows:[{...bundle.rows[0],gainLow:{bad:true}}]}]){
   const bad={...JSON.parse(before),...change};assert.throws(()=>app.ev('loadState('+JSON.stringify(bad)+')'));assert.equal(app.ev('JSON.stringify(state)'),before);
  }
 });
 await check('Original and both new app instances complete migration without script errors',()=>{for(const x of [old,updated,app])assert.deepEqual(x.errors,[]);});
 fs.writeFileSync('qa/upgrade01415-results.json',JSON.stringify({version:'2.0 Alpha build 4',count:cases.length,cases,sourceSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync('qa/fixtures/alpha014.html')).digest('hex'),scope:'Actual 1.4 web code produces synthetic portable backups and stored autosave/named-job/IndexedDB evidence; no physical Android upgrade claim.'},null,2)+'\n');
 console.log('1.4 to 1.5 upgrade: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{for(const dom of instances){if(dom.window.document){const end=Date.now()+5000;while(dom.window.evidenceIsBusy?.()&&Date.now()<end)await new Promise(r=>setImmediate(r));dom.window.close();}}});
