import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync, zipSync, strToU8 } from 'fflate';
import { inspectONX, correctONXSweep, replaceSweep } from '../app/io.mjs';
const json = x => strToU8(JSON.stringify(x));
const cdm = (type, data) => ({cdmVersion:'2.0',tests:[{type,label:type==='sweepmode_app'?'Sweep - Reverse Sweepless':type,results:{data},configuration:{networkConfig:{reverseTPC:{value:2,units:'dB'}}}}]});
test('reverse gzip remains relative evidence and cannot replace a sweep', async()=>{
 const report=await inspectONX(gzipSync(json(cdm('sweepmode_app',{'03_sweepChart':{Referenced:{units:['MHz','dB'],data:[[10,1],[20,2]]}},'00_table':{label:'Markers',tableColumnHeaders:[],tableData:[[{value:'ok',status:'PASS'}]]}}))));
 assert.equal(report.kind,'reverse-relative'); assert.deepEqual(report.series[0].samples,[[10,1],[20,2]]); assert.equal(report.tables[0].rows[0][0].status,'PASS');
 assert.throws(()=>correctONXSweep(report,{connection:'tp'}),/forward/i);
 assert.throws(()=>replaceSweep({nodes:[{id:'n'}]},'n','1',{...report,samples:[[10,1]]}),/forward/i);
});
test('OneCheck preserves diagnostic charts and tables',async()=>{
 const report=await inspectONX(gzipSync(json(cdm('onecheckexpert',{'05_chart':{Passed:{units:['MHz','dBmV'],data:[[100,3]]}},'06_table':{label:'Status',tableColumnHeaders:['State'],tableData:[[{value:'PASS'}]]}}))));
 assert.equal(report.kind,'onecheck'); assert.equal(report.series.length,1); assert.equal(report.tables.length,1);
});
test('HTML and nominal plan ZIP yields inert measured tables',async()=>{
 const html='<html><script>globalThis.unsafeExecuted=true</script><table><caption>Downstream Channels</caption><tr><th>Frequency</th><th>Level</th></tr><tr><td>100</td><td>4</td></tr></table></html>';
 const report=await inspectONX(zipSync({'report.html':strToU8(html),'channel_plan.json':json({version:1,name:'plan',channels:[{freqHz:100000000,digitalLevel01dBmV:90}]})}));
 assert.equal(report.kind,'onecheck'); assert.equal(report.tables.length,1); assert.equal(report.series.length,0); assert.equal(globalThis.unsafeExecuted,undefined);
});
test('rejects ambiguous and unsafe archives, malformed and oversized gzip',async()=>{
 const plan=json({channels:[]});
 await assert.rejects(inspectONX(zipSync({'a.json':plan,'b.json':plan})),/ambig|multiple/i);
 await assert.rejects(inspectONX(zipSync({'../a.json':plan})),/path|unsafe/i);
 await assert.rejects(inspectONX(gzipSync(new Uint8Array(11*1024*1024))),/limit|size/i);
 await assert.rejects(inspectONX(new Uint8Array([31,139,8])),/gzip|invalid|truncat/i);
});
test('configured compensation is metadata and requires an operator declaration',async()=>{
 const data={testGroup:{tests:[{setupGroups:[{id:'testPointTemplate',configs:[{id:'forwardTestPointCompensation',units:'dB',value:3}]}],resultGroups:[{resultSeries:[{independent:{label:'Frequency',units:'MHz',values:[100]},dependent:[{label:'Absolute',units:'dBmV',values:[5]}]}]}]}]}};
 const report=await inspectONX(json(data),{filename:'synthetic.json'});
 assert.equal(report.metadata.configuredCompensation.value,3);
 assert.deepEqual(report.series[0].samples,[[100,5]]);
 assert.throws(()=>correctONXSweep(report,{connection:'tp'}),e=>e.code==='ONX_COMPENSATION_CONFIRMATION_REQUIRED');
 assert.deepEqual(correctONXSweep(report,{connection:'tp',compensationApplied:true}).samples,[[100,22]]);
 await assert.rejects(inspectONX(zipSync({'a.json':json(data),'b.json':json(data)})),/ambig|multiple/i);
});
test('replacement rejects explicit non-forward metadata',()=>{
 const job={nodes:[{id:'n'}]};
 assert.throws(()=>replaceSweep(job,'n','1',{metadata:{measurementKind:'onecheck'},samples:[[100,2]]}),/forward/i);
});
test('native reference and scalar results remain diagnostic evidence',async()=>{
 const doc={testGroup:{tests:[{setupGroups:[{id:'testPointTemplate',configs:[{id:'forwardTestPointCompensation',units:'dB',value:0}]}],resultGroups:[{id:'sweep',results:[{id:'referenceTestName',value:'Reference A'},{id:'markerAPosition',units:'Hz',value:100000000,status:'PASS'},{id:'absoluteMinMaxDelta',units:'dB',value:3}],resultSeries:[{id:'Levels',independent:{label:'Frequency',units:'MHz',values:[100]},dependent:[{label:'Absolute',units:'dBmV',values:[5]},{label:'Referenced',units:'dB',values:[1]}]}]}]}]}};
 const report=await inspectONX(json(doc));
 assert.deepEqual(report.series.map(s=>s.label),['Absolute','Referenced']); assert.deepEqual(report.series[1].samples,[[100,1]]);
 assert.equal(report.metadata.reference,'Reference A'); assert.equal(report.metadata.scalarResults[1].units,'Hz'); assert.equal(report.metadata.scalarResults[1].status,'PASS');
 assert.deepEqual(correctONXSweep(report,{connection:'direct'}).samples,[[100,5]]);
});
test('HTML extracts static numeric chart literals and metadata without running scripts',async()=>{
 const html=`<h2>Test Report</h2><table><tr><th>Date</th><td>2026-11-16</td></tr><tr><th>Meter</th><td>ONX-580</td></tr><tr><th>Forward TPC</th><td>3 dB</td></tr></table><table><tr><th>Freq (MHz)</th><th>PLC Level (dBmV)</th></tr><tr><td>100</td><td>5</td></tr></table><script>channelData.units='dBmV'; channelData.freqLabel='MHz'; channelData.chartTitle='DOCSIS Upstream Channel Levels'; channelData.passingChannels=[[100,5]]; channelData.passingOfdmChannels=[[100,-150],[100,6],[101,6],[101,-150]]; globalThis.unsafeExecuted=true;</script>`;
 const report=await inspectONX(zipSync({'report.html':strToU8(html),'channel_plan.json':json({channels:[]})}));
 assert.equal(report.metadata.testTime,'2026-11-16'); assert.equal(report.metadata.meter.model,'ONX-580'); assert.equal(report.metadata.configuredCompensation.forward.value,3);
 assert.deepEqual(report.tables[1].columns,['Freq (MHz)','PLC Level (dBmV)']); assert.equal(report.tables[1].rows.length,1);
 assert.equal(report.series.length,2); assert.equal(report.series[0].direction,'reverse'); assert.equal(report.series[0].section,'DOCSIS Upstream Channel Levels'); assert.deepEqual(report.series[1].samples,[[100,-150],[100,6],[101,6],[101,-150]]);
 assert.deepEqual(report.series[1].plotClosureIndices,[0,3]); assert.match(report.warnings.join(' '),/plot closure/i);
 assert.equal(globalThis.unsafeExecuted,undefined); assert.throws(()=>correctONXSweep(report,{connection:'direct'}),/forward/i);
});
test('HTML rejects executable chart expressions and malformed literal data',async()=>{
 const html=`<table><tr><td>ok</td></tr></table><script>channelData.units='dB';channelData.freqLabel='MHz';channelData.passingChannels=[[1,2],(globalThis.unsafeExecuted=true)];</script>`;
 await assert.rejects(inspectONX(zipSync({'report.html':strToU8(html),'plan.json':json({channels:[]})})),/chart|literal|invalid/i);
 assert.equal(globalThis.unsafeExecuted,undefined);
});
