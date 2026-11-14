'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('all validated sweep points replace only the selected physical port atomically',()=>{
 assert.ok(fs.existsSync('night-sweep/port-sweeps.js'),'per-port sweep API exists');
 const api=require('../night-sweep/port-sweeps.js');
 const parsed={status:'parsed',series:{unit:'dBmV',points:[[54,32],[303,36],[711,42],[753,43]]}};
 const context={split:'42',direction:'forward',stage:'Before',plane:'port',basis:'sc-qam',bandwidthMHz:6,evidenceId:'synthetic-id',sha256:'a'.repeat(64)};
 const owner={portSweeps:{B:{legacy:true}}},before=JSON.stringify(owner);
 const ports=api.replace(owner,'A',parsed,context);
 assert.equal(JSON.stringify(owner),before);assert.deepEqual(ports.B,owner.portSweeps.B);assert.equal(ports.A.points.length,4);
 assert.equal(api.sample(ports.A,711).value,42);assert.equal(api.sample(ports.A,712).value,null);
 for(const bad of [{status:'attachment'}, {status:'parsed',series:{unit:'dBmV',points:[[54,32],[54,33]]}}, {status:'parsed',series:{unit:'dBmV',points:[[54,'']]}}]){
  assert.throws(()=>api.replace(owner,'A',bad,context));assert.equal(JSON.stringify(owner),before);
 }
 assert.throws(()=>api.replace(owner,'A',parsed,{...context,split:'204'}));
 assert.throws(()=>api.replace(owner,'__proto__',parsed,context));
 assert.throws(()=>api.replace(owner,'A',parsed,{...context,bandwidthMHz:0}));
 assert.equal(api.sample(api.replace(owner,'A',parsed,{...context,basis:'ofdm-plc',bandwidthMHz:''}).A,54).basis,'ofdm-plc');
 assert.deepEqual(api.validate({}),[]);
});
