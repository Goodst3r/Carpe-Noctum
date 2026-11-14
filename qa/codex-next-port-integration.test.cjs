'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
const file=(name,text)=>{const bytes=new TextEncoder().encode(text);return {name,type:'text/csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(0)};};
test('verified originals and physical-port sweeps survive real job backup/restore; rejected replacements retain both ports',async()=>{
 const a=bootApp();try{
  const ui=a.ev('EvidenceUI'),ports=a.ev('PortSweeps'),owner=a.ev('state');
  const context={split:'42',direction:'forward',stage:'Before',plane:'port',basis:'sc-qam',bandwidthMHz:6};
  const add=async(port,text)=>{const [meta]=await ui.importFiles([file(port+'.csv',text)],{kind:'Sweep',stage:'Before',asset:port,notes:'Synthetic physical port'});const verified=await ui.verifiedParse(meta.id);owner.portSweeps=ports.replace(owner,port,verified.parse,{...context,evidenceId:meta.id,sha256:meta.sha256});return meta;};
  await add('A','frequency_mhz,level_dbmv\n54,32\n303,36\n711,42\n860,43\n');
  await add('B','frequency_mhz,level_dbmv\n54,30\n303,34\n711,40\n860,41\n');
  const beforeB=JSON.stringify(owner.portSweeps.B);
  await add('A','frequency_mhz,level_dbmv\n54,33\n303,37\n711,43\n860,44\n');
  assert.equal(JSON.stringify(owner.portSweeps.B),beforeB);assert.equal(owner.portSweeps.A.points.length,4);assert.equal(owner.portSweeps.A.points[0][1],33);
  const before=JSON.stringify(owner.portSweeps),[bad]=await ui.importFiles([file('bad.csv','frequency_mhz,level_dbmv\n54,\n')],{kind:'Sweep',stage:'Before',asset:'A',notes:'Synthetic invalid replacement'}),failed=await ui.verifiedParse(bad.id);
  assert.equal(failed.parse.status,'attachment');assert.throws(()=>ports.replace(owner,'A',failed.parse,{...context,evidenceId:bad.id,sha256:bad.sha256}));assert.equal(JSON.stringify(owner.portSweeps),before);
  owner.syntheticLegacyNotes={unknownField:'retained'};
  const backup=await ui.exportProject(owner),oldA=owner.portSweeps.A.evidenceId,restored=await ui.prepareImport(backup);a.ev('loadState')(restored);
  const current=a.ev('state');assert.notEqual(current.portSweeps.A.evidenceId,oldA);assert.deepEqual(JSON.parse(JSON.stringify(current.portSweeps.A.points)),[[54,33],[303,37],[711,43],[860,44]]);assert.equal(current.syntheticLegacyNotes.unknownField,'retained');
  await ui.downloadOriginal(current.portSweeps.B.evidenceId);assert.equal(Buffer.from(a.downloads.at(-1).base64,'base64').toString(),'frequency_mhz,level_dbmv\n54,30\n303,34\n711,40\n860,41\n');
  const corrupt=JSON.parse(JSON.stringify(backup));corrupt.portSweeps.A.points[0][1]=999;
  const intact=JSON.stringify(current.portSweeps);await assert.rejects(()=>ui.prepareImport(corrupt),/points do not match/);assert.equal(JSON.stringify(current.portSweeps),intact);assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
