'use strict';
const assert=require('node:assert/strict'),HFC=require('../night-sweep/engine.js');
const catalog={devices:[{id:'amp',active:true,ports:[{id:'through'}]},{id:'none',ports:[{id:'through'}]}],cables:[]};
const row=(id,parent,length,device='amp')=>({id,parent,length,slack:0,device});
const route={rows:[row('r1','source',100),row('r2','r1::through',0),row('r3','r2::through',100,'none')]};
let checks=0;function check(name,f){f();checks++;console.log('PASS '+name);}
check('forward TDR cannot cross a different zero-span active at the origin coordinate',()=>{const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start:'r1',direction:'forward',distance:50});assert.equal(r.ok,false);assert.equal(r.barrier,'r2');assert.match(r.error,/active/i);});
check('reverse TDR cannot cross the earlier active sharing the origin coordinate',()=>{const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start:'r2',direction:'reverse',distance:50});assert.equal(r.ok,false);assert.equal(r.barrier,'r1');});
check('zero-span active directly after launch blocks a path beyond it',()=>{const s={rows:[row('r1','source',0),row('r2','r1::through',100,'none')]};const r=HFC.tdrLocate(s,catalog,{endpoint:'r2',distance:50});assert.equal(r.ok,false);assert.equal(r.barrier,'r1');});
check('starting after the final co-located active permits the downstream cable',()=>{const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start:'r2',distance:50});assert.equal(r.ok,true);assert.equal(r.spanId,'r3');assert.equal(r.routeDistance,150);});
check('starting at the earlier active permits its own incoming cable in reverse',()=>{const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start:'r1',direction:'reverse',distance:50});assert.equal(r.ok,true);assert.equal(r.spanId,'r1');assert.equal(r.routeDistance,50);});
check('zero travel remains an origin boundary without inventing a crossed active',()=>{for(const start of ['r1','r2'])for(const direction of ['forward','reverse']){const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start,direction,distance:25,lead:25});assert.equal(r.ok,true);assert.equal(r.routeDistance,100);assert.equal(r.boundary,true);}});
check('arriving exactly at an active input boundary remains permitted',()=>{const r=HFC.tdrLocate(route,catalog,{endpoint:'r3',start:'source',distance:100});assert.equal(r.ok,true);assert.equal(r.boundary,true);assert.deepEqual(r.boundaryIds,['r1','r2']);});
check('an unrelated co-located sibling active cannot block the selected path',()=>{const s={rows:[row('r1','source',100,'none'),row('r2','r1::through',0),row('r3','r1::through',100,'none')]};const r=HFC.tdrLocate(s,catalog,{endpoint:'r3',start:'r1',distance:50});assert.equal(r.ok,true);assert.equal(r.spanId,'r3');});
console.log(`Build2 TDR boundaries: ${checks} checks passed`);
