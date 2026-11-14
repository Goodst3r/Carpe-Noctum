'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
const waitFor=async predicate=>{for(let i=0;i<300;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('Port import did not finish');};
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
