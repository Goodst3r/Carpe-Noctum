/* Synthetic end-to-end evidence storage tests; no native ONX schema fixture is claimed. */
const assert=require('node:assert/strict'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const FDB=require('./runtime/node_modules/fake-indexeddb');
const errors=[],saves=[],cases=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const core=fs.readFileSync('night-sweep/evidence.js','utf8'),ui=fs.readFileSync('night-sweep/evidence-ui.js','utf8');
const dom=new JSDOM('<!doctype html><div id="message"></div><div id="projectPanel"></div><script>var state={version:1,project:{meta:{node:"NODE-7"}}};function saveLocal(){localStorage.setItem("hfc-route-v1",JSON.stringify(state));}function esc(x){return String(x??"").replace(/[&<>"\x27]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","\x27":"&#39;"}[c]||"&#34;"));}function option(v,l,c){return "<option value=\\\""+esc(v)+"\\\""+(v===c?" selected":"")+">"+esc(l)+"</option>";}</script>',{url:'https://nightsweep.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.indexedDB=new FDB.IDBFactory();w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});w.confirm=()=>true;w.NightSweepAndroid={saveBinary:(name,base64,mime)=>saves.push({name,base64,mime})};}});
const w=dom.window;
for(const source of [core,ui]){const s=w.document.createElement('script');s.textContent=source;w.document.body.appendChild(s);}
const api=w.eval('EvidenceUI'),coreAPI=w.eval('EvidenceCore');
const file=(name,text,type='text/csv')=>{const bytes=typeof text==='string'?new TextEncoder().encode(text):text;return {name,size:bytes.byteLength,type,arrayBuffer:async()=>bytes.slice().buffer};};
async function check(name,fn){await fn();cases.push(name);}
async function reject(fn,pattern){await assert.rejects(fn,pattern);}
(async()=>{
  await check('UI initializes without errors',()=>{w.initEvidence();assert.deepEqual(errors,[]);assert(w.document.getElementById('evidenceFiles').multiple);});
  await check('Reference job shortcut uses the existing project picker',()=>{
    const picker=w.document.createElement('input');
    picker.id='load';
    picker.type='file';
    w.document.body.appendChild(picker);
    let opened=0;
    picker.addEventListener('click',()=>opened++);
    w.document.getElementById('evidenceOpenProject').click();
    assert.equal(opened,1);
  });
  await check('Channel readings are plotted as discrete samples',async()=>{
    const original=w.state;
    w.state={version:1};
    try{
      await api.importFiles([file('channels.csv','channel,frequency_mhz,level_dbmv,mer_db\nCH A,273,18.4,39.1\nCH B,519,21.7,41.2')],{kind:'OneCheck',stage:'Reference'});
      const chart=w.document.querySelector('svg[aria-label="Discrete CSV channel readings"]');
      assert(chart);
      const data=chart.querySelector('path[stroke="#85d9f6"]');
      assert.equal((data.getAttribute('d').match(/M/g)||[]).length,2);
      assert(!data.getAttribute('d').includes('L'));
    }finally{w.state=original;api.render();}
  });
  const csv='frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n';
  await check('CSV import commits originals and metadata together',async()=>{await api.importFiles([file('sweep.csv',csv)],{kind:'Sweep',stage:'Before',asset:'AMP-1',notes:'Synthetic fixture'});assert.equal(w.state.evidence.length,1);assert.equal(w.state.evidence[0].parse.status,'parsed');assert.equal(w.state.evidence[0].asset,'AMP-1');assert.equal(JSON.parse(w.localStorage.getItem('hfc-route-v1')).evidence.length,1);});
  await check('Portable export contains exact original bytes',async()=>{const out=await w.evidenceExportProject(w.state);assert.equal(new TextDecoder().decode(coreAPI.base64ToBytes(out.evidenceFiles[0].base64)),csv);assert(!w.state.evidenceFiles);});
  await check('Native JSON and ZIP remain opaque attachments',async()=>{await api.importFiles([file('onecheck.json','{"results":{"pass":true}}','application/json'),file('sweep.zip',new Uint8Array([80,75,3,4,0,255]),'application/zip')],{kind:'OneCheck',stage:'After',asset:'NODE-7',notes:''});assert(w.state.evidence.slice(1).every(m=>m.parse.status==='attachment'));});
  await check('Unsafe names and notes render as text',async()=>{await api.importFiles([file('<img src=x onerror=alert(1)>.csv',csv)],{kind:'Sweep',stage:'Reference',asset:'<svg onload=alert(1)>',notes:'<script>alert(1)</script>'});assert.equal(w.document.querySelectorAll('#evidencePanel img').length,0);assert.equal(w.document.querySelectorAll('#evidencePanel script').length,0);});
  await check('Raw export uses original binary data',async()=>{const m=w.state.evidence[2];await w.evidenceDownload(m.id);assert.deepEqual([...coreAPI.base64ToBytes(saves.at(-1).base64)],[80,75,3,4,0,255]);assert.equal(saves.at(-1).name,'sweep.zip');});
  let portable;
  await check('Reimport keeps evidence and creates collision-safe local IDs',async()=>{portable=await w.evidenceExportProject(w.state);const oldIds=portable.evidence.map(m=>m.id);const clean=await w.evidencePrepareImport(portable);assert(!clean.evidenceFiles);assert.equal(clean.evidence.length,4);assert(clean.evidence.every(m=>!oldIds.includes(m.id)));const copy=await w.evidenceExportProject(clean);assert.equal(copy.evidenceFiles[0].base64,portable.evidenceFiles[0].base64);});
  await check('Tampered original is rejected before storage commit',async()=>{const bad=JSON.parse(JSON.stringify(portable));bad.evidenceFiles[0].base64=coreAPI.bytesToBase64(new TextEncoder().encode(csv.replace('34','99')));await reject(()=>w.evidencePrepareImport(bad),/checksum/i);});
  await check('Missing original blocks project import',async()=>{const bad=JSON.parse(JSON.stringify(portable));bad.evidenceFiles.pop();await reject(()=>w.evidencePrepareImport(bad),/missing original/i);});
  await check('Duplicate bundle IDs are rejected',async()=>{const bad=JSON.parse(JSON.stringify(portable));bad.evidenceFiles[1]=bad.evidenceFiles[0];await reject(()=>w.evidencePrepareImport(bad),/duplicate/i);});
  await check('Unreferenced original is rejected',async()=>{const bad=JSON.parse(JSON.stringify(portable));bad.evidenceFiles[0].id='ev_unknown';await reject(()=>w.evidencePrepareImport(bad),/no matching/i);});
  await check('Legacy project imports without evidence',async()=>{const legacy=await w.evidencePrepareImport({version:1,rows:[]});assert.equal(legacy.version,1);assert(!legacy.evidenceFiles);});
  await check('Parser cache is rebuilt from original on import',async()=>{const changed=JSON.parse(JSON.stringify(portable));changed.evidence[0].parse={status:'parsed',message:'Cached',series:{unit:'dBmV',points:[[261,999],[993,46]],label:'Cached'}};const clean=await w.evidencePrepareImport(changed);assert.equal(clean.evidence[0].parse.series.points[0][1],34);});
  await check('Earlier project originals survive restoring a new project',async()=>{const before=await w.evidenceExportProject(w.state);await w.evidencePrepareImport(before);const after=await w.evidenceExportProject(w.state);assert.equal(after.evidenceFiles[0].base64,before.evidenceFiles[0].base64);});
  await check('Derived rows never inflate compact autosave or export metadata',()=>{const big=JSON.parse(JSON.stringify(w.state));big.evidence[0].parse={status:'parsed',message:'Synthetic large preview',rows:Array.from({length:10000},(_,i)=>({channel:'Synthetic '+i+'x'.repeat(100),frequencyMHz:261+i/100,levelDbmv:34,merDb:40}))};const compact=w.evidenceCompactState(big);assert(JSON.stringify(compact).length<20000);assert(!compact.evidence[0].parse.rows);assert.equal(big.evidence[0].parse.rows.length,10000);});
  await check('Compact reload restores preview from verified originals',async()=>{w.state=w.evidenceCompactState(w.state);assert.equal(w.state.evidence[0].parse.status,'attachment');await api.reloadPreviews();assert.equal(w.state.evidence[0].parse.status,'parsed');assert.equal(w.state.evidence[0].parse.series.points[0][1],34);});
  await check('Autosave failure is explicit while raw data remain exportable',async()=>{const previous=w.saveLocal;w.saveLocal=()=>false;await api.importFiles([file('autosave-fail.csv',csv)],{kind:'Sweep',stage:'Before'});assert.match(w.document.getElementById('evidenceStatus').textContent,/could not be autosaved/);assert((await w.evidenceExportProject(w.state)).evidenceFiles.length>0);w.saveLocal=previous;});
  await check('Oversize file leaves metadata untouched',async()=>{const old=w.state.evidence.length;await reject(()=>api.importFiles([{name:'too-large.zip',size:9*1048576}],{kind:'Sweep',stage:'Before'}),/8 MiB/);assert.equal(w.state.evidence.length,old);assert(!w.evidenceIsBusy());});
  await check('Total evidence size limit is checked before reading',async()=>{await reject(()=>api.importFiles([{name:'one.zip',size:7*1048576},{name:'two.zip',size:7*1048576}],{kind:'Sweep',stage:'Before'}),/12 MiB/);});
  await check('Count limit rejects batches before reading',async()=>{await reject(()=>api.importFiles(Array.from({length:31},(_,i)=>({name:i+'.csv',size:1})),{kind:'Sweep',stage:'Before'}),/30 evidence/);});
  await check('Changing project during file read does not attach to either project',async()=>{const owner=w.state,oldCount=owner.evidence.length;let release;const waiting={name:'wait.csv',size:new TextEncoder().encode(csv).length,type:'text/csv',arrayBuffer:()=>new Promise(r=>release=r)};const pending=api.importFiles([waiting],{kind:'Sweep',stage:'Before'});assert(w.evidenceIsBusy());await reject(()=>w.evidenceExportProject(owner),/current file operation/);w.state={version:1,project:{meta:{node:'NEW'}}};release(new TextEncoder().encode(csv).buffer);await reject(()=>pending,/project changed/);assert.equal(owner.evidence.length,oldCount);assert(!w.state.evidence);w.state=owner;api.render();});
  await check('Missing local bytes block portable export',async()=>{const ghost=JSON.parse(JSON.stringify(w.state));ghost.evidence[0].id='ev_missing';await reject(()=>w.evidenceExportProject(ghost),/Original file missing/);});
  await check('Remove from job preserves separately exported original',async()=>{const original=w.state.evidence[0],backup=await w.evidenceExportProject(w.state);w.document.querySelector('[data-evidence-remove="'+original.id+'"]').click();assert(!w.state.evidence.some(m=>m.id===original.id));const recovered=await w.evidencePrepareImport(backup);assert.equal(recovered.evidence[0].name,original.name);});
  await check('Unsupported UTF-8 CSV remains original attachment',async()=>{await api.importFiles([file('invalid.csv',new Uint8Array([255,254,1,2]))],{kind:'Ingress',stage:'Before'});assert.equal(w.state.evidence.at(-1).parse.status,'attachment');});
  await check('Explicit cleanup removes unused bytes and keeps current originals',async()=>{const backup=await w.evidenceExportProject(w.state),unused=await w.evidencePrepareImport(backup);assert(await api.cleanupUnused()>0);assert.equal((await w.evidenceExportProject(w.state)).evidenceFiles.length,backup.evidenceFiles.length);await reject(()=>w.evidenceExportProject(unused),/Original file missing/);});
  await check('UI ends without runtime errors',()=>assert.deepEqual(errors,[]));
  console.log('Evidence UI/storage checks passed:',cases.length);fs.writeFileSync('qa/evidence-ui-results.json',JSON.stringify({count:cases.length,cases,scope:'Synthetic CSV/binary data in jsdom and fake-indexeddb; physical Android and genuine ONX exports not exercised'},null,2));dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
