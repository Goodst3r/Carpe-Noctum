import test from 'node:test';
import assert from 'node:assert/strict';
import {saveMeasurementReport,validateMeasurementReport} from '../app/measurements.mjs';
import {createJob,saveJob,loadJob,deleteJob,putOriginal,getOriginal,exportBackup,importBackup} from '../app/store.mjs';
import {indexedDB} from 'fake-indexeddb';
const hash='a'.repeat(64);
const report=(kind='reverse-relative')=>({kind,direction:kind==='reverse-relative'?'reverse':'mixed',metadata:{filename:'synthetic.cdm.json.gz',sourceFormat:'cdm',testTime:'2026-01-01T12:00:00Z'},series:[{id:'relative',label:'Referenced',direction:'reverse',frequencyUnit:'MHz',levelUnit:'dB',samples:[[15,0.2],[20,-0.3]]}],tables:[{id:'status',label:'Status',columns:['Name','Value'],rows:[[{value:'Connection'},{value:'Connected',status:'pass'}]]}],warnings:[]});

test('reverse and OneCheck reports autofill evidence without replacing forward RF or installed settings',()=>{
 for(const kind of ['reverse-relative','onecheck']){
  const job=createJob('low');job.portSweeps['node::1']={samples:[[57,31]]};job.nodes[0].readings={'1':{samples:[[57,31]]}};
  const prior=structuredClone(job);const changed=saveMeasurementReport(job,'node','1',report(kind),{id:'evidence-1',stage:'after',originalHash:hash});
  assert.deepEqual(job,prior);assert.deepEqual(changed.portSweeps,prior.portSweeps);assert.deepEqual(changed.nodes[0].readings,prior.nodes[0].readings);assert.deepEqual(changed.nodes[0].settings,prior.nodes[0].settings);
  assert.equal(changed.nodes[0].measurementReports[0].report.kind,kind);assert.equal(changed.nodes[0].measurementReports[0].originalHash,hash);
 }
});

test('evidence validates physical ports, bounded records and typed measurement data atomically',()=>{
 const job=createJob('low');
 for(const port of ['9','__proto__'])assert.throws(()=>saveMeasurementReport(job,'node',port,report(),{id:'e',originalHash:hash}),/port/i);
 for(const bad of [{...report(),kind:'made-up'},{...report(),direction:'forward'},{...report(),series:[{...report().series[0],samples:[[15,NaN]]}]},{...report(),tables:[{id:'bad',label:'Bad',columns:[],rows:[[{value:{html:'unsafe'}}]]}]}])assert.throws(()=>validateMeasurementReport(bad),/report|sample|direction|cell/i);
 const unknown=structuredClone(job);unknown.nodes[0].modelId='';assert.throws(()=>saveMeasurementReport(unknown,'node','arbitrary',report(),{id:'e',originalHash:hash}),/port|equipment/i);
 assert.equal(job.nodes[0].measurementReports,undefined);
 assert.throws(()=>saveMeasurementReport(job,'node','1',report(),{id:'e',originalHash:'bad'}),/hash/i);
});

test('repeated identical source at same port/stage updates evidence rather than duplicating it',()=>{
 let job=saveMeasurementReport(createJob('low'),'node','1',report(),{id:'first',stage:'before',originalHash:hash});
 job=saveMeasurementReport(job,'node','1',report(),{id:'second',stage:'before',originalHash:hash});
 assert.equal(job.nodes[0].measurementReports.length,1);assert.equal(job.nodes[0].measurementReports[0].id,'first');
 job=saveMeasurementReport(job,'node','2',report(),{id:'third',stage:'before',originalHash:hash});assert.equal(job.nodes[0].measurementReports.length,2);
});

test('separate measurement evidence and original bytes survive local save and backup restore',async()=>{
 globalThis.indexedDB=indexedDB;
 let job;
 try{
  const bytes=new Uint8Array([7,2,9,4]);const originalHash=await putOriginal(bytes);
  job=saveMeasurementReport(createJob('low'),'node','5',report('onecheck'),{id:'private-evidence',stage:'after',originalHash});saveJob(job);
  assert.deepEqual(loadJob(job.id).nodes[0].measurementReports,job.nodes[0].measurementReports);
  const backup=JSON.parse(await exportBackup());assert.ok(backup.originals[originalHash]);deleteJob(job.id);await importBackup(backup);
  assert.deepEqual(loadJob(job.id).nodes[0].measurementReports,job.nodes[0].measurementReports);assert.deepEqual(await getOriginal(originalHash),bytes);
 }finally{if(job)deleteJob(job.id);delete globalThis.indexedDB;}
});

test('backup cannot smuggle diagnostic reports into forward port readings',async()=>{
 const job=createJob('low');job.nodes[0].readings={'1':{kind:'reverse-relative',direction:'reverse',samples:[[15,.2]]}};
 await assert.rejects(importBackup({schema:1,jobs:[job]}),/forward|direction|kind/i);
 delete job.nodes[0].readings;job.portSweeps['node::1']={metadata:{kind:'onecheck'},samples:[[57,13]]};
 await assert.rejects(importBackup({schema:1,jobs:[job]}),/forward|direction|kind/i);
});
