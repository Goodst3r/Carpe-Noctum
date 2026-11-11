'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const errors=[],cases=[],failures=[];
const vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
const dom=new JSDOM('<!doctype html><div id="message"></div><div id="projectPanel"></div>',{url:'https://nightsweep.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.indexedDB=new FDB.IDBFactory();w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;
  Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});w.confirm=()=>true;
}});
const w=dom.window,d=w.document;
w.state={version:1,node:{asset:'NODE-A'},job:{node:'JOB-A'},project:{meta:{node:'META-A'}}};
w.saveLocal=()=>true;
w.esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
w.option=(value,label,current)=>`<option value="${w.esc(value)}"${String(value)===String(current)?' selected':''}>${w.esc(label)}</option>`;
for(const filename of ['evidence.js','evidence-ui.js']){const script=d.createElement('script');script.textContent=fs.readFileSync('night-sweep/'+filename,'utf8');d.body.appendChild(script);}
const api=w.eval('EvidenceUI'),core=w.eval('EvidenceCore');
const csv='frequency_mhz,level_dbmv\n261,34\n993,46\n';
const file=name=>{const bytes=new TextEncoder().encode(csv);return {name,size:bytes.byteLength,type:'text/csv',arrayBuffer:async()=>bytes.slice().buffer};};
function set(id,value,event='input'){const field=d.getElementById(id);field.value=value;field.dispatchEvent(new w.Event(event,{bubbles:true}));}
function values(){return ['evidenceKind','evidenceStage','evidenceAsset','evidenceNotes'].map(id=>d.getElementById(id).value);}
async function check(label,fn){try{await fn();assert.deepEqual(errors,[]);cases.push(label);console.log('PASS '+label);}catch(error){failures.push(label);console.error('FAIL '+label+'\n'+error.stack);}}
(async()=>{
  await api.init();
  await check('first evidence draft identifies the current node asset',()=>assert.deepEqual(values(),['Sweep','Before','NODE-A','']));
  await check('same-owner renders preserve typed evidence context',()=>{
    set('evidenceKind','OneCheck','change');set('evidenceStage','After','change');set('evidenceAsset','AMP-A');set('evidenceNotes','A station notes');api.render();
    assert.deepEqual(values(),['OneCheck','After','AMP-A','A station notes']);
  });
  await check('new working owner resets stale type, stage, asset and notes',()=>{
    w.state={version:1,node:{asset:'NODE-B'},job:{node:'JOB-B'},project:{meta:{node:'META-B'}}};api.render();
    assert.deepEqual(values(),['Sweep','Before','NODE-B','']);
  });
  let backup;
  await check('default-context import uses the current owner and preserves original bytes',async()=>{
    await api.importFiles([file('B-sweep.csv')]);backup=await api.exportProject(w.state);
    assert.equal(backup.evidence[0].asset,'NODE-B');assert.equal(backup.evidence[0].stage,'Before');assert.equal(backup.evidence[0].notes,'');
    assert.equal(new TextDecoder().decode(core.base64ToBytes(backup.evidenceFiles[0].base64)),csv);
  });
  await check('failed imported-project preparation keeps the current draft and owner',async()=>{
    set('evidenceStage','After','change');set('evidenceAsset','AMP-B');set('evidenceNotes','Keep this unsent B note');
    const owner=w.state,bad=JSON.parse(JSON.stringify(backup));bad.evidenceFiles[0].base64=core.bytesToBase64(new TextEncoder().encode('tampered'));
    await assert.rejects(()=>api.prepareImport(bad),/checksum/i);assert.equal(w.state,owner);
    assert.deepEqual(values(),['Sweep','After','AMP-B','Keep this unsent B note']);
  });
  await check('successful imported owner resets draft without rewriting attached metadata or bytes',async()=>{
    const incoming=JSON.parse(JSON.stringify(backup));incoming.node={asset:'NODE-C'};w.state=await api.prepareImport(incoming);api.render();
    assert.deepEqual(values(),['Sweep','Before','NODE-C','']);
    assert.equal(w.state.evidence[0].asset,'NODE-B');
    const roundTrip=await api.exportProject(w.state);assert.equal(roundTrip.evidenceFiles[0].base64,backup.evidenceFiles[0].base64);
    await api.importFiles([file('C-sweep.csv')]);assert.equal(w.state.evidence[1].asset,'NODE-C');
  });
  await check('job metadata supplies the asset when no node equipment is selected',()=>{
    w.state={version:1,job:{node:'JOB-D'},project:{meta:{node:'META-D'}}};api.render();assert.deepEqual(values(),['Sweep','Before','JOB-D','']);
  });
  await check('legacy project metadata remains a supported asset fallback',()=>{
    w.state={version:1,project:{meta:{node:'META-E'}}};api.render();assert.deepEqual(values(),['Sweep','Before','META-E','']);
  });
  console.log(`\n${cases.length} evidence context checks passed; ${failures.length} failed.`);
  dom.window.close();if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});
