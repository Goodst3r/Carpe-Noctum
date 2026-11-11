/* Synthetic upgrade and integrated file-flow tests. DOM/IndexedDB simulation only. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{webcrypto,createHash}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..'),fixturePath=path.join(__dirname,'fixtures/legacy-0.1-project.json');
process.chdir(root);
execFileSync('python3',['night-sweep/build.py']);
function harness(html){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;
  Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
 }});
 const w=dom.window,ev=source=>w.eval(source),json=source=>JSON.parse(ev('JSON.stringify('+source+')'));
 return {dom,w,ev,json,errors,downloads,d:w.document};
}
const oldHtml=fs.readFileSync('qa/fixtures/NightSweep_0.1_published.html','utf8');
const old=harness(oldHtml);
const current=harness(fs.readFileSync('outputs/Night_Sweep.html','utf8'));
const {w,d,ev,json,downloads}=current,cases=[];
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
const copy=x=>JSON.parse(JSON.stringify(x));
const file=(name,contents,type='application/octet-stream')=>{const bytes=typeof contents==='string'?new TextEncoder().encode(contents):contents;return {name,size:bytes.length,type,arrayBuffer:async()=>bytes.slice().buffer};};
function stateString(){return ev('JSON.stringify(state)');}
function set(selector,value,event='input'){const element=d.querySelector(selector);assert(element,selector);element.value=value;element.dispatchEvent(new w.Event(event,{bubbles:true}));}
function calculations(h){return h.json(`({
 rf:[261,303,711,993].map(f=>{const x=HFC.run(state,catalog,f);return {f,source:x.source,rows:x.results.map(r=>({input:r.input.level,outputs:r.outputs.map(p=>({key:p.key,level:p.level,loss:p.loss}))}))};}),
 power:(()=>{const x=HFC.powerRun(state.power,catalog);return {supplyCurrent:x.supplyCurrent,minVoltage:x.minVoltage,loading:x.loading,wireWatts:x.wireWatts,rows:x.rows.map(r=>({id:r.id,voltage:r.voltage,deviceCurrent:r.deviceCurrent,sectionCurrent:r.sectionCurrent,drop:r.drop,wireWatts:r.wireWatts}))};})(),
 frequency:frequencyCalculation(),
 record:ProjectMath.evaluate(state.project.forward[0],projectProfile('1200'))
})`);}
if(process.argv.includes('--capture-legacy')){
 old.ev(`
 state.example=false;state.setup.temperature=92;state.setup.lowLevel=34;state.setup.highLevel=46;
 state.rows[0].name='Synthetic A1';state.rows[0].length=798;state.rows[1].name='Synthetic T2';state.rows[1].length=260;
 state.power.rows[0].name='Synthetic HGD';state.power.rows[0].equipment='aoi_quantum18_hgd_v09052024';applyEquipment(state.power.rows[0]);state.power.rows[0].length=900;state.power.temperatureF=92;
 state.project=projectDefaults();state.project.meta.job='SYNTHETIC-UPGRADE-011';state.project.meta.node='TEST-NODE';state.project.meta.lead='Fixture technician';
 state.project.generator={desired:31,coupling:20,lead:1};
 Object.assign(projectProfile('1200'),{approved:'Yes',plannedUpper:1200,available:993,equipmentUpper:1218,returnCeiling:204,forwardFloor:258,forwardLow:261,fLevelTol:1,fTiltTol:1,fRippleMax:2,minMer:35});
 state.project.forward=[{basis:'Measured',stage:'After',station:'Synthetic A1',plane:'Main output',trace:'synthetic-sweep.csv',traceSaved:'Yes',reviewer:'Fixture reviewer',profile:'1200',lowMHz:261,highMHz:993,rawLow:14,rawHigh:26,addLow:20,addHigh:20,targetLow:34,targetHigh:46,ripple:1.5,mer:38}];
 state.project.punch=[{item:'Synthetic repair',station:'Synthetic A1',status:'Open',finding:'Synthetic test record only'}];
 state.frequency={...freshFrequency(),length:798,quickF:981,equipmentUpper:1218,points:{'981':{cable:'1.5',passive:'4',launch:'40'}}};
 loadState(JSON.parse(JSON.stringify(state)));
 `);
 fs.mkdirSync(path.dirname(fixturePath),{recursive:true});fs.writeFileSync(fixturePath,old.ev('JSON.stringify(state,null,2)')+'\n');
}
(async()=>{
 const legacy=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
 await check('Published 0.1 and integrated 0.11 boot without script errors',()=>{assert.deepEqual(old.errors,[]);assert.deepEqual(current.errors,[]);assert(old.d.body.textContent.includes('0.1 Alpha'));assert(d.body.textContent.includes('2.0 Alpha build 3'));});
 await check('Synthetic fixture is a native legacy project without new node/evidence fields',()=>{assert.equal(legacy.version,1);assert.equal(legacy.project.meta.job,'SYNTHETIC-UPGRADE-011');assert(!legacy.node);assert(!legacy.evidence);old.ev('loadState('+JSON.stringify(legacy)+')');});
 const oldNumbers=calculations(old);
 await check('0.1 project opens through the new public async project API',async()=>{await w.NightSweep.openProject(JSON.stringify(legacy));assert.equal(json('state.project.meta').job,'SYNTHETIC-UPGRADE-011');});
 await check('Legacy route, power, records and frequency settings remain intact',()=>{for(const key of ['setup','rows','power','project','frequency'])assert.deepEqual(json('state.'+key),legacy[key],key);});
 await check('Legacy RF, power, frequency and record calculations exactly match 0.1',()=>assert.deepEqual(calculations(current),oldNumbers));
 await check('New node profiles round-trip without changing legacy calculations',()=>{
  const profiles=json('catalog.nodeProfiles');assert(profiles.some(p=>p.id==='vecima-en9000'));assert(profiles.some(p=>/1 GHz/.test(p.label)));assert(profiles.some(p=>/1.2 GHz/.test(p.label)));
  for(const p of profiles){ev('state.node={...NodeTools.defaults(),...NodeTools.choice('+JSON.stringify(p.id)+',catalog),asset:"SYNTHETIC-NODE",port:"1",module:"Fixture module"};');const node=json('state.node');ev('loadState('+stateString()+')');assert.deepEqual(json('state.node'),node);}
  assert.deepEqual(calculations(current),oldNumbers);
 });
 await check('Node selector UI records model and operating band',()=>{set('[data-node-field="model"]','vecima-en9000','change');set('[data-node-field="asset"]','TEST-EN9000');assert.equal(json('state.node').asset,'TEST-EN9000');assert.equal(json('state.node').operatingUpper,1218);});
 await check('Full loadState dry run returns normalized candidate without changing live state',()=>{const before=stateString(),candidate=copy(JSON.parse(before));candidate.rows[0].name='Dry run only';candidate.project.meta.job='DO-NOT-COMMIT';const counters=ev('JSON.stringify({serial,powerSerial,selected:[...selected]})');const result=ev('loadState('+JSON.stringify(candidate)+',false,true)');assert.equal(result.rows[0].name,'Dry run only');assert.equal(stateString(),before);assert.equal(ev('JSON.stringify({serial,powerSerial,selected:[...selected]})'),counters);});
 const csv='frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n',binary=new Uint8Array([80,75,3,4,0,1,127,128,255]);
 await check('Integrated upload stores sweep and original binary evidence on the current job',async()=>{await ev('EvidenceUI').importFiles([file('synthetic-sweep.csv',csv,'text/csv')],{kind:'Sweep',stage:'Before',asset:'TEST-EN9000',notes:'Synthetic integration fixture'});await ev('EvidenceUI').importFiles([file('synthetic-onecheck.zip',binary,'application/zip')],{kind:'OneCheck',stage:'After',asset:'TEST-EN9000',notes:'Opaque synthetic ZIP-like bytes'});assert.equal(json('state.evidence').length,2);assert.equal(json('state.evidence')[0].parse.status,'parsed');assert.equal(json('state.evidence')[1].parse.status,'attachment');});
 await check('Node and evidence survive loading the RF example',()=>{const node=json('state.node'),evidence=json('state.evidence');d.getElementById('example').click();assert.deepEqual(json('state.node'),node);assert.deepEqual(json('state.evidence'),evidence);assert.equal(json('state.rows').length,3);});
 await check('Clearing RF route preserves node and evidence files',()=>{const node=json('state.node'),evidence=json('state.evidence');d.getElementById('clear').click();assert.equal(json('state.rows').length,0);assert.deepEqual(json('state.node'),node);assert.deepEqual(json('state.evidence'),evidence);});
 let portable;
 await check('Root Save project embeds original bytes and uses the 0.11 filename',async()=>{await d.getElementById('save').onclick();const download=downloads.at(-1);assert.equal(download.name,'CarpeNoctum_2.0_Alpha_build_3_Project.json');assert.equal(download.mime,'application/json');portable=JSON.parse(download.text);assert.equal(portable.evidenceFiles.length,2);assert.deepEqual([...w.EvidenceCore.base64ToBytes(portable.evidenceFiles[1].base64)],[...binary]);assert.equal(new TextDecoder().decode(w.EvidenceCore.base64ToBytes(portable.evidenceFiles[0].base64)),csv);assert(!ev('state.evidenceFiles'));});
 await check('Invalid route in evidence bundle is rejected before evidence import or state mutation',async()=>{const bad=copy(portable);bad.rows=[{id:'bad-id',device:'none',parent:'source'}];const before=stateString();const original=w.evidencePrepareImport;let calls=0;w.evidencePrepareImport=async c=>{calls++;return original(c);};try{await assert.rejects(()=>w.NightSweep.openProject(JSON.stringify(bad)),/Invalid route rows/);assert.equal(calls,0);assert.equal(stateString(),before);}finally{w.evidencePrepareImport=original;}});
 await check('Invalid evidence metadata rejects an otherwise valid candidate atomically',async()=>{const bad=copy(portable);bad.evidence[0].size=-1;const before=stateString();await assert.rejects(()=>w.NightSweep.openProject(JSON.stringify(bad)),/8 MiB/);assert.equal(stateString(),before);});
 await check('Tampered original blocks root project import and keeps current job intact',async()=>{const bad=copy(portable);bad.evidenceFiles[1].base64=w.EvidenceCore.bytesToBase64(new Uint8Array([80,75,3,4,0,1,127,128,254]));const before=stateString();await assert.rejects(()=>w.NightSweep.openProject(JSON.stringify(bad)),/checksum/);assert.equal(stateString(),before);});
 await check('Root open/import verifies originals, assigns fresh IDs and rebuilds CSV preview',async()=>{const ids=portable.evidence.map(x=>x.id);await w.NightSweep.openProject(JSON.stringify(portable));const evidence=json('state.evidence');assert(evidence.every(x=>!ids.includes(x.id)));assert.equal(evidence[0].parse.status,'parsed');assert.deepEqual(evidence[0].parse.series.points,[[261,34],[993,46]]);assert.deepEqual(json('state.node'),portable.node);assert.equal(json('state.project.meta').job,portable.project.meta.job);});
 await check('Original binary can be exported unchanged after complete project round trip',async()=>{const metadata=json('state.evidence')[1];await w.evidenceDownload(metadata.id);const raw=downloads.at(-1);assert.equal(raw.name,'synthetic-onecheck.zip');assert.deepEqual([...w.EvidenceCore.base64ToBytes(raw.base64)],[...binary]);});
 await check('Root project file input runs the same verified import flow',async()=>{const input=d.getElementById('load'),text=JSON.stringify(portable);Object.defineProperty(input,'files',{configurable:true,value:[{name:'portable.json',size:new TextEncoder().encode(text).length,text:async()=>text}]});await input.onchange({target:input});assert.match(d.getElementById('message').textContent,/Project opened: portable.json/);assert.equal(json('state.evidence').length,2);assert.equal(input.value,'');});
 await check('Autosave stores compact evidence metadata without binary or stale decoded caches',()=>{const saved=JSON.parse(w.localStorage.getItem('hfc-route-v1'));assert.equal(saved.evidence.length,2);assert(!saved.evidenceFiles);assert(saved.evidence.every(m=>m.parse.status==='attachment'&&!m.parse.series));assert.equal(saved.node.model,'vecima-en9000');});
 await check('Exact 12 MiB evidence boundary round-trips 8 MiB plus 4 MiB originals below 20 MiB JSON',async()=>{
  await w.NightSweep.openProject(JSON.stringify(legacy));
  const originals=[new Uint8Array(8*1048576),new Uint8Array(4*1048576)];
  originals.forEach((bytes,index)=>{for(let i=0;i<bytes.length;i++)bytes[i]=(i*31+index*17)%256;});
  await ev('EvidenceUI').importFiles(originals.map((bytes,i)=>file('boundary-'+i+'.bin',bytes)),{kind:'Ingress',stage:'Reference',asset:'SYNTHETIC-BOUNDARY',notes:'Synthetic boundary test only'});
  assert.equal(json('state.evidence').reduce((n,x)=>n+x.size,0),12*1048576);
  const first=await w.evidenceExportProject(ev('state')),text=JSON.stringify(first);
  assert(new TextEncoder().encode(text).length<20*1048576);
  assert(first.evidence.every(m=>!m.parse.series));
  await w.NightSweep.openProject(text);
  const second=await w.evidenceExportProject(ev('state'));
  for(let i=0;i<originals.length;i++){
   assert.equal(second.evidenceFiles[i].base64,first.evidenceFiles[i].base64);
   assert.equal(Buffer.compare(Buffer.from(w.EvidenceCore.base64ToBytes(second.evidenceFiles[i].base64)),Buffer.from(originals[i])),0);
  }
 });
 await check('Integrated UI finishes without runtime errors',()=>assert.deepEqual(current.errors,[]));
 console.log('Alpha 0.11 integration: '+cases.length+' checks passed. Synthetic legacy fixture and fake IndexedDB; no physical Android or native ONX schema validation.');
 fs.writeFileSync('qa/alpha011-integration-results.json',JSON.stringify({count:cases.length,cases,legacyHtmlSha256:createHash('sha256').update(oldHtml).digest('hex'),scope:'Synthetic legacy project using published 0.1 HTML, complete 0.11 DOM, fake IndexedDB and exact 12 MiB binary evidence boundary. Physical Android and native ONX schemas were not tested.'},null,2)+'\n');
 old.dom.window.close();current.dom.window.close();
})().catch(e=>{console.error(e);old.dom.window.close();current.dom.window.close();process.exitCode=1;});
