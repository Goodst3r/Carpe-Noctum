'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
const waitFor=async predicate=>{for(let i=0;i<300;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('Port import did not finish');};
test('file picker intent rejects job, node and port changes before selection returns',async()=>{
 const a=bootApp();try{
  const {d,w,ev}=a,ui=ev('EvidenceUI');await waitFor(()=>!ui.isBusy());
  ev("state.example=false;state.job={name:'Picker job A'};state.node={...NodeTools.defaults(),asset:'Node A',port:'A'};renderAll()");
  const field=(key,value)=>{d.querySelector('[data-port="'+key+'"]').value=value;},input=d.querySelector('[data-port-file]'),status=()=>d.querySelector('[data-port-status]').textContent;
  field('id','PORT-A');field('split','42');
  const bytes=new TextEncoder().encode('frequency_mhz,level_dbmv\n54,32\n753,43\n');let reads=0;
  const file={name:'synthetic-picker.csv',type:'text/csv',size:bytes.length,arrayBuffer:async()=>{reads++;return bytes.buffer.slice(0);}};
  const choose=async files=>{Object.defineProperty(input,'files',{configurable:true,value:files});input.dispatchEvent(new w.Event('change',{bubbles:true}));await waitFor(()=>!input.disabled);};
  await choose([file]);assert.equal(ev("state.portSweeps['PORT-A'].points.length"),2);
  for(const mutation of [()=>ev("loadState({...JSON.parse(JSON.stringify(state)),job:{name:'Picker job B'}})"),()=>ev("state.node.asset='Node B'"),()=>field('id','PORT-B')]){
   const originalOwner=ev('state'),beforePorts=JSON.stringify(originalOwner.portSweeps),beforeFiles=JSON.stringify(originalOwner.evidence),beforeReads=reads;
   input.dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:0}));mutation();await choose([file]);
   assert.match(status(),/changed.*picker/i);assert.equal(reads,beforeReads,'stale selection must be refused before reading or attaching bytes');assert.equal(JSON.stringify(ev('state.portSweeps')),beforePorts);assert.equal(JSON.stringify(ev('state.evidence')),beforeFiles);assert.equal(JSON.stringify(originalOwner.portSweeps),beforePorts);field('id','PORT-A');
  }
  // Rejected and canceled selections release their captured intent. A new click
  // and an unchanged physical context remain valid even if the job is named.
  input.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ev('JobsUI.saveNamed()');await choose([file]);assert.match(status(),/^Saved 2 points/);
  input.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));input.dispatchEvent(new w.Event('cancel',{bubbles:true}));ev("state.node.asset='Node C'");await choose([file]);assert.match(status(),/^Saved 2 points/);
  input.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await choose([]);ev("state.node.asset='Node D'");await choose([file]);assert.match(status(),/^Saved 2 points/);assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
test('port UI rejects node/context changes, rolls back failed saves, and protects restorable originals',async()=>{
 const a=bootApp();try{
  const {d,w,ev}=a,ui=ev('EvidenceUI');await waitFor(()=>!ui.isBusy());
  ev("state.node={model:'synthetic-A',asset:'Synthetic node',band:0,port:'A',module:'M1'};refreshPortSweeps()");
  const field=(key,value)=>{d.querySelector('[data-port="'+key+'"]').value=value;};
  field('id','A');field('split','42');field('basis','sc-qam');field('bandwidthMHz','6');
  const input=d.querySelector('[data-port-file]'),status=()=>d.querySelector('[data-port-status]').textContent;
  const bytes=new TextEncoder().encode('frequency_mhz,level_dbmv\n54,32\n303,36\n753,43\n');
  const start=hold=>{let release;const file={name:'synthetic.csv',type:'text/csv',size:bytes.length,arrayBuffer:()=>hold?new Promise(r=>{release=()=>r(bytes.buffer.slice(0));}):Promise.resolve(bytes.buffer.slice(0))};Object.defineProperty(input,'files',{configurable:true,value:[file]});input.dispatchEvent(new w.Event('change',{bubbles:true}));return ()=>release();};
  let release=start(true);ev("state.node.model='synthetic-B'");release();await waitFor(()=>!input.disabled);
  assert.equal(ev('state.portSweeps'),undefined);assert.match(status(),/changed/);
  release=start(true);field('id','B');release();await waitFor(()=>!input.disabled);assert.equal(ev('state.portSweeps'),undefined);assert.match(status(),/changed/);field('id','A');
  release=start(true);ev('state={...state}');release();await waitFor(()=>!input.disabled);assert.equal(ev('state.portSweeps'),undefined);assert.match(status(),/changed/);
  start(false);await waitFor(()=>!input.disabled);assert.equal(ev('state.portSweeps.A.points.length'),3);
  const before=ev('JSON.stringify(state.portSweeps)'),save=ev('saveLocal');w.__rfRealSave=save;ev('saveLocal=()=>false');
  start(false);await waitFor(()=>!input.disabled);assert.equal(ev('JSON.stringify(state.portSweeps)'),before);assert.match(status(),/could not be saved/);ev('saveLocal=window.__rfRealSave');
  const id=ev('state.portSweeps.A.evidenceId');d.querySelector('[data-evidence-remove="'+id+'"]').click();assert.equal(ev('state.evidence.some(m=>m.id==='+JSON.stringify(id)+')'),true);assert.match(d.getElementById('evidenceStatus').textContent,/belongs to a physical port/);
  const backup=await ui.exportProject(ev('state')),restored=await ui.prepareImport(backup);assert.notEqual(restored.portSweeps.A.evidenceId,id);assert.equal(restored.portSweeps.A.points.length,3);
  const missing=JSON.parse(JSON.stringify(backup));missing.evidence=missing.evidence.filter(m=>m.id!==id);await assert.rejects(()=>ui.exportProject(missing),/missing its matching original/);
  assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
test('naming, duplicating and reopening a job preserve the physical port sweep identity and original',async()=>{
 const a=bootApp();try{
  const {d,ev}=a,ui=ev('EvidenceUI'),ports=ev('PortSweeps'),jobs=ev('JobsUI');await waitFor(()=>!ui.isBusy());
  ev("state.example=false;state.job={name:'Synthetic port identity job'};state.node={...NodeTools.defaults(),...NodeTools.choice(catalog.nodeProfiles.find(p=>p.bands.some(b=>b.returnCeiling===42)).id,catalog),asset:'Synthetic node',port:'A',module:'Synthetic module'};renderAll()");
  const owner=ev('state'),csv='frequency_mhz,level_dbmv\n54,32\n303,36\n753,43\n',bytes=new TextEncoder().encode(csv);
  const [meta]=await ui.importFiles([{name:'synthetic-named-port.csv',type:'text/csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(0)}],{kind:'Sweep',stage:'Before',asset:'A',notes:'Synthetic'}),verified=await ui.verifiedParse(meta.id);
  owner.portSweeps=ports.replace(owner,'A',verified.parse,{split:'42',direction:'forward',stage:'Before',plane:'port',basis:'sc-qam',bandwidthMHz:6,evidenceId:meta.id,sha256:meta.sha256,stationIdentity:ports.sourceIdentity(owner)});
  const identity=owner.portSweeps.A.stationIdentity,node=JSON.stringify(owner.node),record=JSON.stringify(owner.portSweeps.A);
  const checkCurrent=()=>{const current=ev('state');assert.equal(ports.sourceIdentity(current),identity);assert.equal(JSON.stringify(current.node),node);assert.equal(JSON.stringify(current.portSweeps.A),record);ev('refreshPortSweeps()');assert.doesNotMatch(d.querySelector('[data-port-records]').textContent,/Historical node identity/);};
  assert.equal(owner.job.id,undefined);checkCurrent();const originalId=jobs.saveNamed();assert.equal(ev('state.job.id'),originalId);checkCurrent();
  const copyId=jobs.duplicate(originalId);assert.notEqual(copyId,originalId);assert.equal(await jobs.open(copyId),true);assert.equal(ev('state.job.id'),copyId);checkCurrent();
  assert.equal(await jobs.open(originalId),true);checkCurrent();await ui.downloadOriginal(ev('state.portSweeps.A.evidenceId'));assert.equal(Buffer.from(a.downloads.at(-1).base64,'base64').toString(),csv);
  const current=ev('state');current.portSweeps.A.stationIdentity=JSON.stringify([copyId,...JSON.parse(identity)]);ev('refreshPortSweeps()');assert.doesNotMatch(d.querySelector('[data-port-records]').textContent,/Historical node identity/);
  current.node.module='Different installed module';ev('refreshPortSweeps()');assert.match(d.querySelector('[data-port-records]').textContent,/Historical node identity/);assert.equal(current.portSweeps.A.points.length,3);assert.equal(current.portSweeps.A.evidenceId,meta.id);assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
