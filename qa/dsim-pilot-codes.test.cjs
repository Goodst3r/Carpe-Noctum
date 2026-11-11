'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'../night-sweep/dsim-pilot-codes.js'),api=require(file),cases=[];
function check(label,fn){fn();cases.push(label);console.log('PASS '+label);}

check('Document source retains user-supplied revision and unverified hardware scope',()=>{
 assert.equal(api.source.revision,'Revision A');assert.match(api.source.providedBy,/User-supplied/);
 assert.deepEqual(api.source.pages,[2,3,4,5]);assert.equal(api.source.hardwareVerified,false);assert.match(api.source.scope,/firmware/);
});
check('Only photographed channels are present, with no generated 95–99 rows',()=>{
 assert.equal(api.rows.length,86);assert.equal(new Set(api.rows.map(x=>x.channel)).size,86);
 assert.deepEqual(api.rows.map(x=>x.channel),[...Array.from({length:43},(_,i)=>52+i),...Array.from({length:43},(_,i)=>100+i)]);
 assert.deepEqual([2,3,4,5].map(p=>api.rows.filter(r=>r.sourcePage===p).length),[22,22,22,20]);
});
check('Common field pilots preserve exact digital code punctuation',()=>{
 assert.equal(api.lookup(711,'QAM').code,'@@?<A');assert.equal(api.lookup(711,'QAM').channel,110);
 assert.equal(api.lookup(609,'QAM').code,'GG<A');assert.equal(api.lookup(465,'QAM').code,'EC<A');
});
check('IRC carrier and digital center resolve distinct photographed codes',()=>{
 assert.equal(api.lookup(709.25,'IRC').code,'@@?<@');assert.equal(api.lookup(709.25,'analog').channel,110);
 assert.equal(api.lookup(711,'IRC'),null);assert.equal(api.lookup(709.25,'QAM'),null);
 assert.equal(api.lookup(607.25,'IRC').code,'GG<@');
});
check('Punctuation transitions and page boundaries match independently reviewed rows',()=>{
 const samples=[
  [52,'DA<@','DA<A'],[59,'DH<@','DH<A'],[60,'E?<@','E?<A'],[61,'E@<@','E@<A'],
  [73,'FB<@','FB<A'],[74,'FC<@','FC<A'],[79,'FH<@','FH<A'],[80,'G?<@','G?<A'],
  [90,'H?<@','H?<A'],[94,'HC<@','HC<A'],[101,'@?@<@','@?@<A'],[109,'@?H<@','@?H<A'],
  [110,'@@?<@','@@?<A'],[111,'@@@<@','@@@<A'],[122,'@AA<@','@AA<A'],[123,'@AB<@','@AB<A'],
  [130,'@B?<@','@B?<A'],[139,'@BH<@','@BH<A'],[140,'@C?<@','@C?<A'],[142,'@CA<@','@CA<A']
 ];
 for(const [channel,irc,digital] of samples){const r=api.rows.find(x=>x.channel===channel);assert.equal(r.ircCode,irc,'IRC '+channel);assert.equal(r.digitalCode,digital,'Digital '+channel);}
});
check('Both photographed frequency endpoints resolve without extrapolation',()=>{
 assert.equal(api.lookup(391.25,'IRC').channel,52);assert.equal(api.lookup(393,'QAM').channel,52);
 assert.equal(api.lookup(901.25,'IRC').channel,142);assert.equal(api.lookup(903,'QAM').channel,142);
 for(const f of [385.25,387,907.25,909]){assert.equal(api.lookup(f,'IRC'),null);assert.equal(api.lookup(f,'QAM'),null);}
});
check('Channel 100 preserves the printed exception and blocks copy eligibility',()=>{
 const analog=api.lookup(649.25,'IRC'),digital=api.lookup(651,'QAM');
 assert.equal(analog.channel,100);assert.equal(analog.code,'HD<@');assert.equal(digital.code,'HD<A');
 assert.equal(analog.copyAllowed,false);assert.equal(digital.copyAllowed,false);assert.match(digital.warning,/Confirm with ACI/);
 assert.notEqual(digital.code,'@??<A');
});
check('Unsupported pilot types never return a QAM or IRC code',()=>{
 for(const t of ['OFDM PLC','CW','',null,undefined,'DIG','QAM256'])assert.equal(api.lookup(711,t),null);
 for(const f of [303,663.25,710.5]){assert.equal(api.lookup(f,'QAM'),null);assert.equal(api.lookup(f,'IRC'),null);}
});
check('Blank, nonfinite, structured and nondecimal frequency inputs reject',()=>{
 for(const f of ['', '   ',null,undefined,true,false,[],{},NaN,Infinity,-711,'711 MHz','0x2c7','7.11e2','711<script>'])assert.equal(api.lookup(f,'QAM'),null);
});
check('Decimal input formatting and signal aliases retain exact lookup identity',()=>{
 assert.equal(api.lookup('711.000',' qam ').code,'@@?<A');assert.equal(api.lookup(' 709.250 ',' analog ').code,'@@?<@');
 assert.equal(api.lookup('609','digital').signalType,'DIGITAL');assert.equal(api.lookup(607.25,'IRC').signalType,'IRC');
});
check('Every literal row resolves independently by both frequency planes',()=>{
 for(const row of api.rows){
  const a=api.lookup(row.ircMHz,'IRC'),d=api.lookup(row.digitalMHz,'QAM');
  assert.equal(a.channel,row.channel);assert.equal(a.code,row.ircCode);assert.equal(a.frequencyMHz,row.ircMHz);
  assert.equal(d.channel,row.channel);assert.equal(d.code,row.digitalCode);assert.equal(d.frequencyMHz,row.digitalMHz);
  assert.equal(row.digitalMHz-row.ircMHz,1.75);assert.equal(a.copyAllowed,row.channel!==100);assert.equal(d.copyAllowed,row.channel!==100);
 }
});
check('Shared lookup data and results cannot be silently mutated',()=>{
 assert(Object.isFrozen(api));assert(Object.isFrozen(api.source));assert(Object.isFrozen(api.source.pages));assert(Object.isFrozen(api.rows));
 assert(Object.isFrozen(api.rows[0]));assert(Object.isFrozen(api.lookup(711,'QAM')));
 assert.throws(()=>{api.rows[0].digitalCode='wrong';},TypeError);assert.throws(()=>{api.rows.push({});},TypeError);
 assert.equal(api.lookup(393,'QAM').code,'DA<A');
});
check('Module runs offline in a browser global without require or network',()=>{
 const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context);
 assert.equal(context.DsimPilotCodes.lookup(711,'QAM').code,'@@?<A');assert.equal(context.DsimPilotCodes.rows.length,86);
});
console.log('DSIM pilot codes: '+cases.length+' checks passed');
