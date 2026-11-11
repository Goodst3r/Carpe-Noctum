/* Named-job transactions, stable controls and bounded evidence replay. Synthetic only. */
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {bootApp,root}=require('./build2-source-harness.cjs');
const KEY='hfc-named-jobs-v1',copy=value=>JSON.parse(JSON.stringify(value));
async function settle(){for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));}
async function app(fn){const h=bootApp();try{await settle();await fn(h);assert.deepEqual(h.errors,[]);}finally{h.close();}}
function namedWorking(h){h.ev('state.example=false;state.job={name:"Synthetic original",resolution:"Saved notes"};state.rows[0].name="Saved route point";renderAll();saveLocal()');return h.ev('JobsUI.saveNamed()');}
const fields={kind:'Sweep',stage:'Reference',asset:'SYNTHETIC',notes:'Build 2 bounded original-byte replay'};
const file=(name,bytes)=>({name,size:bytes.length,type:'application/octet-stream',arrayBuffer:async()=>bytes.slice().buffer});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function originals(project){return Object.fromEntries(project.evidence.map(meta=>{const matching=project.evidenceFiles.filter(item=>item.id===meta.id);assert.equal(matching.length,1);return[meta.name,{sha256:meta.sha256,base64:matching[0].base64}];}));}

test('Duplicating an active job commits current edits and its copy in one storage write',async()=>app(async h=>{
 const id=namedWorking(h),writes=[],original=h.w.Storage.prototype.setItem;
 h.ev('state.job.resolution="Latest unsaved closeout";state.rows[0].name="Latest route point"');
 h.w.Storage.prototype.setItem=function(key,value){if(key===KEY)writes.push(value);return original.call(this,key,value);};
 let copied;try{copied=h.ev('JobsUI.duplicate('+JSON.stringify(id)+')');}finally{h.w.Storage.prototype.setItem=original;}
 const saved=JSON.parse(h.w.localStorage.getItem(KEY));assert.equal(writes.length,1,'One atomic library write must update the active snapshot and add the copy.');
 for(const key of [id,copied]){const snapshot=saved.jobs.find(job=>job.id===key).snapshot;assert.equal(snapshot.job.resolution,'Latest unsaved closeout');assert.equal(snapshot.rows[0].name,'Latest route point');}
 assert.notEqual(copied,id);assert.equal(h.ev('state.job.id'),id);
}));

test('A quota failure cannot silently duplicate the older saved snapshot while discarding current edits',async()=>app(async h=>{
 const id=namedWorking(h),before=h.w.localStorage.getItem(KEY),original=h.w.Storage.prototype.setItem;
 h.ev('state.job.resolution="CURRENT EDIT "+"x".repeat(7000)');const working=h.ev('JSON.stringify(state)');
 // The old small snapshot fits twice. The actual current edits do not fit.
 const limit=before.length*3;
 h.w.Storage.prototype.setItem=function(key,value){if(key===KEY&&value.length>limit)throw new h.w.DOMException('Synthetic quota limit','QuotaExceededError');return original.call(this,key,value);};
 try{assert.throws(()=>h.ev('JobsUI.duplicate('+JSON.stringify(id)+')'),/quota|storage|space/i);}finally{h.w.Storage.prototype.setItem=original;}
 assert.equal(h.w.localStorage.getItem(KEY),before,'Failed duplication must leave the library unchanged.');assert.equal(h.ev('JSON.stringify(state)'),working);
}));

test('A copy that exceeds storage capacity cannot partially rewrite its original first',async()=>app(async h=>{
 const id=namedWorking(h),before=h.w.localStorage.getItem(KEY),original=h.w.Storage.prototype.setItem;
 h.ev('state.job.resolution="Current edited note";state.rows[0].name="Current edited point"');const working=h.ev('JSON.stringify(state)');
 // Updating one record fits; adding another complete snapshot does not.
 const limit=before.length+1000;
 h.w.Storage.prototype.setItem=function(key,value){if(key===KEY&&value.length>limit)throw new h.w.DOMException('Synthetic quota limit','QuotaExceededError');return original.call(this,key,value);};
 try{assert.throws(()=>h.ev('JobsUI.duplicate('+JSON.stringify(id)+')'),/quota/i);}finally{h.w.Storage.prototype.setItem=original;}
 assert.equal(h.w.localStorage.getItem(KEY),before,'Atomic rejection must not update only the original snapshot.');assert.equal(h.ev('JSON.stringify(state)'),working);
}));

test('Unchanged named-job renders preserve keyboard focus and existing action controls',async()=>app(async h=>{
 namedWorking(h);h.ev('WorkflowUI.go("projects")');const button=h.d.querySelector('[data-job-duplicate]');assert(button);button.focus();
 for(let i=0;i<3;i++)h.ev('JobsUI.render()');
 assert.equal(h.d.querySelector('[data-job-duplicate]'),button,'Unchanged list controls must not be reconstructed.');assert.equal(h.d.activeElement,button);
 h.ev('state.job.name="Changed visible job";JobsUI.render()');assert.equal(h.d.querySelector('[data-job-field="name"]').value,'Changed visible job');
}));

test('Duplicate preserves an unsaved plant conversion separately from a retained sample',async()=>app(async h=>{
 const id=h.ev('JobsUI.saveNamed()'),before=h.ev('JSON.stringify(JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(id)+'))');
 h.ev('state.example=false;state.job.name="Working plant conversion"');const copied=h.ev('JobsUI.duplicate('+JSON.stringify(id)+')');
 const source=h.json('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(id)+')'),result=h.json('JobsUI.snapshots().find(s=>s.job.id==='+JSON.stringify(copied)+')');
 assert.equal(JSON.stringify(source),before);assert.equal(result.example,true);assert.equal(result.job.sample,true);assert.equal(h.ev('state.job.name'),'Working plant conversion');
}));

test('The exact 8 MiB file and 12 MiB project limits preserve original bytes through import, export and recovery',async()=>app(async h=>{
 const first=new Uint8Array(8*1048576),second=new Uint8Array(4*1048576);first[0]=128;first[first.length-1]=255;second[0]=33;second[second.length-1]=2;
 await h.ev('EvidenceUI').importFiles([file('SYNTHETIC-8MiB.bin',first),file('SYNTHETIC-4MiB.bin',second)],fields);
 const project=copy(await h.w.evidenceExportProject(h.ev('state')));assert.equal(project.evidence.reduce((sum,m)=>sum+m.size,0),12*1048576);
 assert.equal(project.evidence[0].sha256,hash(first));assert.equal(project.evidence[1].sha256,hash(second));assert.equal(new TextEncoder().encode(JSON.stringify(project)).length<20*1048576,true);
 await h.w.NightSweep.openProject(JSON.stringify(project));const restored=copy(await h.w.evidenceExportProject(h.ev('state')));assert.deepEqual(originals(restored),originals(project));
 for(const meta of restored.evidence){const original=restored.evidenceFiles.find(item=>item.id===meta.id);assert.equal(hash(h.w.EvidenceCore.base64ToBytes(original.base64)),meta.sha256);}
 const working=h.ev('JSON.stringify(state)');let reads=0;
 await assert.rejects(()=>h.ev('EvidenceUI').importFiles([{name:'one-byte-over-total.bin',size:1,type:'',arrayBuffer:async()=>{reads++;return new Uint8Array([1]).buffer;}}],fields),/12 MiB/);
 assert.equal(reads,0,'Aggregate-size rejection happens before reading selected files.');assert.equal(h.ev('JSON.stringify(state)'),working);
}));

test('Attachment count and per-file limits reject overflow before reading and accept all 30 zero-byte originals',async()=>app(async h=>{
 let reads=0;await assert.rejects(()=>h.ev('EvidenceUI').importFiles([{name:'oversize.bin',size:8*1048576+1,type:'',arrayBuffer:async()=>{reads++;return new ArrayBuffer(0);}}],fields),/8 MiB/);assert.equal(reads,0);
 await h.ev('EvidenceUI').importFiles(Array.from({length:30},(_,i)=>file('SYNTHETIC-empty-'+i+'.bin',new Uint8Array())),fields);
 const project=copy(await h.w.evidenceExportProject(h.ev('state')));assert.equal(project.evidence.length,30);assert(project.evidenceFiles.every(item=>item.base64===''));
 const before=h.ev('JSON.stringify(state)');await assert.rejects(()=>h.ev('EvidenceUI').importFiles([file('overflow.bin',new Uint8Array())],fields),/30 evidence/);assert.equal(h.ev('JSON.stringify(state)'),before);
}));

test('Every evidence operation and named-job switch rejects during an in-flight read, then recovers',async()=>app(async h=>{
 let release;const bytes=new Uint8Array([0,128,255]);
 const pending=h.ev('EvidenceUI').importFiles([{name:'SYNTHETIC-pending.bin',size:3,type:'application/octet-stream',arrayBuffer:()=>new Promise(resolve=>{release=()=>resolve(bytes.buffer);})}],fields);
 const before=h.ev('JSON.stringify(state)');
 for(const call of ['EvidenceUI.exportProject(state)','EvidenceUI.prepareImport({evidence:[]})','EvidenceUI.reloadPreviews()','EvidenceUI.downloadOriginal("missing")','EvidenceUI.cleanupUnused()','JobsUI.newJob()','TrainingJob.open("custom-curves")'])await assert.rejects(()=>h.ev(call),/operation|evidence/i,call);
 assert.throws(()=>h.ev('JobsUI.saveNamed()'),/evidence operation/);assert.equal(h.ev('JSON.stringify(state)'),before);
 release();await pending;const project=copy(await h.w.evidenceExportProject(h.ev('state')));assert.equal(project.evidenceFiles[0].base64,Buffer.from(bytes).toString('base64'));assert.equal(h.ev('EvidenceUI.isBusy()'),false);
}));

test('Malformed portable originals fail without mutating the working project, library or supplied candidate',async()=>app(async h=>{
 const bytes=new Uint8Array([1,2,3,255]);await h.ev('EvidenceUI').importFiles([file('SYNTHETIC-safe.bin',bytes)],fields);namedWorking(h);
 const valid=copy(await h.w.evidenceExportProject(h.ev('state'))),working=h.ev('JSON.stringify(state)'),library=h.w.localStorage.getItem(KEY);
 for(const damage of [p=>{p.evidenceFiles=[];},p=>{p.evidenceFiles[0].base64='AAAAAA==';},p=>{p.evidenceFiles[0].id='unmatched';},p=>{p.evidence[0].size=3;},p=>{p.evidence[0].sha256='0'.repeat(64);},p=>{p.evidence[0].parse={status:'parsed',message:'Forged',series:{unit:'dBmV',points:[[860,1],[54,2]]}};}]){
  const candidate=copy(valid);damage(candidate);const untouched=JSON.stringify(candidate);
  await assert.rejects(()=>h.w.NightSweep.openProject(JSON.stringify(candidate)),/original|checksum|evidence|sample/i);assert.equal(JSON.stringify(candidate),untouched);assert.equal(h.ev('JSON.stringify(state)'),working);assert.equal(h.w.localStorage.getItem(KEY),library);
 }
 assert.deepEqual(originals(copy(await h.w.evidenceExportProject(h.ev('state')))),originals(valid));
}));

test('Actual 1.6 and retained 1.7/prior-1.8 projects preserve route inputs and original bytes on current-source recovery',async()=>app(async h=>{
 const old=bootApp({html:fs.readFileSync(path.join(root,'qa/fixtures/alpha016.html'),'utf8')});let alpha16;try{await settle();alpha16=old.json('state');assert.deepEqual(old.errors,[]);}finally{old.close();}
 const candidates=[['1.6 actual HTML state',alpha16],...['training-complete-legacy17.json','training-complete-alpha18-v1.json'].map(name=>[name,JSON.parse(fs.readFileSync(path.join(root,'qa/fixtures',name),'utf8'))])];
 for(const [name,candidate]of candidates){
  const route=copy(candidate.rows).map(({id,parent,device,length,slack})=>({id,parent,device,length,slack})),anchors=['lowF','highF','lowLevel','highLevel'].map(key=>candidate.setup[key]);
  await h.w.NightSweep.openProject(JSON.stringify(candidate));assert.deepEqual(h.json('state.rows').map(({id,parent,device,length,slack})=>({id,parent,device,length,slack})),route,name);assert.deepEqual(h.json('[state.setup.lowF,state.setup.highF,state.setup.lowLevel,state.setup.highLevel]'),anchors,name);
  if(candidate.evidence?.length){const portable=copy(await h.w.evidenceExportProject(h.ev('state')));assert.deepEqual(originals(portable),originals(candidate),name);assert.equal(h.d.getElementById('trainingGuide').hidden,true,name+' retains its original mismatched guide safely');}
 }
}));
