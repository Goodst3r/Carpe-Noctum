'use strict';
// Synthetic storage faults exercise the real evidence UI with fake-indexeddb.
// These checks do not represent a browser quota test or a physical-device test.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {test}=require('node:test'),{webcrypto,createHash}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const FDB=require('./runtime/node_modules/fake-indexeddb');
const DB_NAME='nightsweep-evidence-v1';
const CSV='frequency_mhz,level_dbmv\n261,34\n993,46\n';
const bytes=new TextEncoder().encode(CSV);
const fields={kind:'Sweep',stage:'Before',asset:'NODE-SYNTHETIC',notes:''};
const file=name=>({name,size:bytes.length,type:'text/csv',arrayBuffer:async()=>bytes.slice().buffer});
const portable=()=>({version:1,evidence:[{id:'ev_backup',name:'backup.csv',size:bytes.length,type:'text/csv',...fields,importedAt:'2026-11-11T00:00:00.000Z',sha256:createHash('sha256').update(bytes).digest('hex'),parse:{status:'attachment',message:'Synthetic backup'}}],evidenceFiles:[{id:'ev_backup',base64:Buffer.from(bytes).toString('base64')}]});
function requestResult(request){return new Promise((resolve,reject)=>{request.addEventListener('success',()=>resolve(request.result));request.addEventListener('error',()=>reject(request.error));});}
async function seed(factory,version){const request=factory.open(DB_NAME,version);request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});return requestResult(request);}
function harness(t){
  const factory=new FDB.IDBFactory(),errors=[],connections=[],requests=[],saves=[];
  const controls={factory,requests,saves,openVersion:1,onTransaction:null,openError:null};
  const indexedDB={open(name,version){
    if(controls.openError){const error=controls.openError;controls.openError=null;throw error;}
    assert.equal(name,DB_NAME);assert.equal(version,1);
    // Raising the factory version simulates a real blocked schema open; it
    // leaves IndexedDB's blocking, late success and transaction behavior intact.
    const request=factory.open(name,controls.openVersion);requests.push(request);
    request.addEventListener('success',()=>{
      const db=request.result,transaction=db.transaction.bind(db);connections.push(db);
      db.transaction=(...args)=>{const tx=transaction(...args);if(controls.onTransaction)controls.onTransaction(tx,args[1]||'readonly');return tx;};
    });
    return request;
  }};
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM('<!doctype html><div id="message"></div><div id="projectPanel"></div>',{url:'https://nightsweep.test/',runScripts:'dangerously',virtualConsole,beforeParse(w){
    w.indexedDB=indexedDB;w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;
    Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});w.confirm=()=>true;
  }});
  const w=dom.window;w.state={version:1,project:{meta:{node:'NODE-SYNTHETIC'}}};
  w.saveLocal=()=>{saves.push(JSON.parse(JSON.stringify(w.state)));w.localStorage.setItem('hfc-route-v1',JSON.stringify(w.state));return true;};
  w.esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  w.option=(value,label,current)=>`<option value="${w.esc(value)}"${value===current?' selected':''}>${w.esc(label)}</option>`;
  for(const name of ['evidence.js','evidence-ui.js']){const script=w.document.createElement('script');script.textContent=fs.readFileSync('night-sweep/'+name,'utf8');w.document.body.appendChild(script);}
  controls.w=w;controls.api=w.eval('EvidenceUI');controls.indexedDB=indexedDB;
  t.after(()=>{for(const db of connections)db.close();dom.window.close();assert.deepEqual(errors,[]);});
  return controls;
}
async function records(h){
  const request=h.factory.open(DB_NAME,h.openVersion),db=await requestResult(request);
  try{return await new Promise((resolve,reject)=>{let result;const tx=db.transaction('files'),get=tx.objectStore('files').getAll();get.onsuccess=()=>{result=get.result;};tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
function assertUnattached(h,owner,saved){assert.equal(h.w.state,owner);assert.equal(owner.evidence,undefined);assert.equal(h.w.localStorage.getItem('hfc-route-v1'),saved);assert.equal(h.saves.length,0);assert.equal(h.api.isBusy(),false);}
function abortAfterFirstPut(h){
  h.onTransaction=(tx,mode)=>{
    if(mode!=='readwrite')return;
    const store=tx.objectStore('files'),put=store.put.bind(store);let first=true;
    store.put=(...args)=>{const request=put(...args);if(first){first=false;request.addEventListener('success',()=>tx.abort());}return request;};
  };
}

test('unavailable IndexedDB reports failure without attachment metadata and can be retried',async t=>{
  const h=harness(t),owner=h.w.state;h.w.indexedDB=undefined;
  await assert.rejects(()=>h.api.importFiles([file('unavailable.csv')],fields),/storage is unavailable/i);
  assertUnattached(h,owner,null);assert.match(h.w.document.getElementById('evidenceStatus').textContent,/upload failed/i);
  h.w.indexedDB=h.indexedDB;await h.api.importFiles([file('retry.csv')],fields);
  assert.equal(owner.evidence.length,1);assert.equal((await records(h)).length,1);
});

test('synchronous storage-open exception releases busy state and permits retry',async t=>{
  const h=harness(t),owner=h.w.state;h.openError=new DOMException('Storage access denied','SecurityError');
  await assert.rejects(()=>h.api.importFiles([file('denied.csv')],fields),/Storage access denied/);
  assertUnattached(h,owner,null);await h.api.importFiles([file('retry.csv')],fields);assert.equal(owner.evidence.length,1);
});

test('asynchronous storage-open error preserves the job and permits a successful retry',async t=>{
  const h=harness(t),owner=h.w.state,existing=await seed(h.factory,2);existing.close();
  await assert.rejects(()=>h.api.importFiles([file('failed-open.csv')],fields),/Could not open offline file storage/);
  assertUnattached(h,owner,null);h.openVersion=2;await h.api.importFiles([file('retry.csv')],fields);assert.equal(owner.evidence.length,1);
});

test('blocked open rejects, closes a late successful connection, and can be retried',async t=>{
  const h=harness(t),owner=h.w.state,blocker=await seed(h.factory,1);h.openVersion=2;
  try{
    await assert.rejects(()=>h.api.importFiles([file('blocked.csv')],fields),/Close other Carpe Noctum windows/);
    assertUnattached(h,owner,null);
    const late=requestResult(h.requests[0]);blocker.close();const abandoned=await late;
    assert.throws(()=>abandoned.transaction('files'),{name:'InvalidStateError'},'A rejected open must not leave a live connection behind');
    await h.api.importFiles([file('retry.csv')],fields);assert.equal(owner.evidence.length,1);
    assert.equal((await records(h)).length,1);
  }finally{blocker.close();}
});

test('unexpected database close permits import and export retries while preserving original bytes',async t=>{
  const h=harness(t);await h.api.importFiles([file('existing.csv')],fields);
  async function closeCurrent(){const db=h.requests.at(-1).result,closed=new Promise(resolve=>db.addEventListener('close',resolve));FDB.forceCloseDatabase(db);await closed;}
  await closeCurrent();await h.api.importFiles([file('after-close.csv')],fields);
  assert.equal(h.w.state.evidence.length,2);assert.equal(h.api.isBusy(),false);
  await closeCurrent();const backup=await h.api.exportProject(h.w.state);
  assert.deepEqual(Array.from(backup.evidenceFiles,item=>item.base64),[Buffer.from(bytes).toString('base64'),Buffer.from(bytes).toString('base64')]);
  assert.equal((await records(h)).length,2);assert.equal(h.api.isBusy(),false);
});

test('metadata and autosave become visible only after original-byte transaction commits',async t=>{
  const h=harness(t),owner=h.w.state,events=[];let completed=false;
  h.onTransaction=(tx,mode)=>{
    if(mode!=='readwrite')return;
    const store=tx.objectStore('files'),put=store.put.bind(store);
    store.put=(...args)=>{const request=put(...args);request.addEventListener('success',()=>{events.push('put');assert.equal(owner.evidence,undefined);assert.equal(h.saves.length,0);});return request;};
    tx.addEventListener('complete',()=>{completed=true;events.push('commit');});
  };
  const save=h.w.saveLocal;h.w.saveLocal=()=>{assert.equal(completed,true,'Request success alone must not publish metadata');events.push('autosave');return save();};
  await h.api.importFiles([file('committed.csv')],fields);
  assert.deepEqual(events,['put','commit','autosave']);
  assert.equal(new TextDecoder().decode((await records(h))[0].bytes),CSV);
  assert.equal(JSON.parse(h.w.localStorage.getItem('hfc-route-v1')).evidence[0].name,'committed.csv');
});

test('transaction abort after request success rolls back the whole attachment batch and permits retry',async t=>{
  const h=harness(t),owner=h.w.state;abortAfterFirstPut(h);
  await assert.rejects(()=>h.api.importFiles([file('first.csv'),file('second.csv')],fields),/files could not be saved/i);
  assertUnattached(h,owner,null);assert.equal((await records(h)).length,0);
  h.onTransaction=null;await h.api.importFiles([file('retry.csv')],fields);assert.equal(owner.evidence.length,1);
  assert.equal(new TextDecoder().decode((await records(h))[0].bytes),CSV);
});

test('a failed batch retains existing attachment metadata, autosave and exact original bytes',async t=>{
  const h=harness(t);await h.api.importFiles([file('existing.csv')],fields);
  const before=JSON.stringify(h.w.state),saved=h.w.localStorage.getItem('hfc-route-v1');abortAfterFirstPut(h);
  await assert.rejects(()=>h.api.importFiles([file('aborted.csv')],fields),/files could not be saved/i);
  assert.equal(JSON.stringify(h.w.state),before);assert.equal(h.w.localStorage.getItem('hfc-route-v1'),saved);assert.equal(h.saves.length,1);
  const original=await records(h);assert.equal(original.length,1);assert.equal(new TextDecoder().decode(original[0].bytes),CSV);
  assert.equal((await h.api.exportProject(h.w.state)).evidenceFiles[0].base64,Buffer.from(bytes).toString('base64'));
});

test('synchronous put failure aborts earlier writes instead of publishing a partial batch',async t=>{
  const h=harness(t),owner=h.w.state;
  h.onTransaction=(tx,mode)=>{if(mode!=='readwrite')return;const store=tx.objectStore('files'),put=store.put.bind(store);let count=0;store.put=(...args)=>{if(++count===2)throw new DOMException('Synthetic clone failure','DataCloneError');return put(...args);};};
  await assert.rejects(()=>h.api.importFiles([file('first.csv'),file('unclonable.csv')],fields),/Synthetic clone failure/);
  assertUnattached(h,owner,null);assert.equal((await records(h)).length,0);
});

test('asynchronous request failure aborts the transaction without publishing attachment metadata',async t=>{
  const h=harness(t),owner=h.w.state;
  h.onTransaction=(tx,mode)=>{
    if(mode!=='readwrite')return;
    const store=tx.objectStore('files'),put=store.put.bind(store);let first=true;
    // A duplicate key creates a genuine asynchronous request error and default
    // transaction abort. fake-indexeddb cannot reproduce a device quota limit.
    store.put=(record)=>{const request=put(record);if(first){first=false;request.addEventListener('success',()=>store.add(record));}return request;};
  };
  await assert.rejects(()=>h.api.importFiles([file('request-error.csv')],fields),/files could not be saved/i);
  assertUnattached(h,owner,null);assert.equal((await records(h)).length,0);
  h.onTransaction=null;await h.api.importFiles([file('retry.csv')],fields);assert.equal(owner.evidence.length,1);
});

test('read transaction abort after request success blocks export and permits a lossless retry',async t=>{
  const h=harness(t);await h.api.importFiles([file('existing.csv')],fields);
  const before=JSON.stringify(h.w.state),saved=h.w.localStorage.getItem('hfc-route-v1');
  h.onTransaction=(tx,mode)=>{
    if(mode!=='readonly')return;
    const store=tx.objectStore('files'),get=store.get.bind(store);
    store.get=(...args)=>{const request=get(...args);request.addEventListener('success',()=>tx.abort());return request;};
  };
  await assert.rejects(()=>h.api.exportProject(h.w.state),/Could not read the saved evidence file/);
  assert.equal(h.api.isBusy(),false);assert.equal(JSON.stringify(h.w.state),before);assert.equal(h.w.localStorage.getItem('hfc-route-v1'),saved);
  h.onTransaction=null;const backup=await h.api.exportProject(h.w.state);assert.equal(backup.evidenceFiles[0].base64,Buffer.from(bytes).toString('base64'));
});

test('backup restoration abort leaves the current job and candidate untouched with no partial originals',async t=>{
  const h=harness(t),owner=h.w.state,candidate=portable(),before=JSON.stringify(candidate);abortAfterFirstPut(h);
  await assert.rejects(()=>h.api.prepareImport(candidate),/files could not be saved/i);
  assertUnattached(h,owner,null);assert.equal(JSON.stringify(candidate),before);assert.equal((await records(h)).length,0);
  h.onTransaction=null;const restored=await h.api.prepareImport(candidate);assert.equal(h.w.state,owner);assert.equal(restored.evidence.length,1);
  assert.equal((await h.api.exportProject(restored)).evidenceFiles[0].base64,Buffer.from(bytes).toString('base64'));
});

test('backup restoration returns metadata only after original-byte transaction commits',async t=>{
  const h=harness(t);let completed=false;
  h.onTransaction=(tx,mode)=>{if(mode==='readwrite')tx.addEventListener('complete',()=>{completed=true;});};
  const restored=await h.api.prepareImport(portable());assert.equal(completed,true);assert.equal(restored.evidence.length,1);
  assert.equal(new TextDecoder().decode((await records(h))[0].bytes),CSV);assert.equal(h.api.isBusy(),false);
});
