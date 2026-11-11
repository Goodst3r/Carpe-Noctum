'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('night-sweep/projects.js','utf8')+';this.math=ProjectMath;',ctx);
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
const profile={approved:'Yes',plannedUpper:1200,available:993,equipmentUpper:1218,returnCeiling:204,forwardFloor:258,forwardLow:261,fLevelTol:1,fTiltTol:1,fRippleMax:2,minMer:35,rLevelTol:1,rTiltTol:1,rRippleMax:2,injectionLow:31,injectionHigh:31,injectionTol:.5};
const forward={basis:'Measured',stage:'After',station:'SYNTHETIC A1',plane:'Main output',trace:'synthetic.csv',traceSaved:'Yes',reviewer:'Training reviewer',lowMHz:261,highMHz:993,rawLow:14,rawHigh:26,addLow:20,addHigh:20,targetLow:34,targetHigh:46,ripple:1.5,mer:38};
const reverse={...forward,lowMHz:10,highMHz:204,rawLow:-8,rawHigh:-8,addLow:0,addHigh:0,targetLow:-8,targetHigh:-8,injectedLow:31,injectedHigh:31,existingPad:3,ingress:'Yes'};
check('consistent forward profile retains numeric comparison',()=>assert.equal(ctx.math.evaluate(forward,profile).within,true));
check('design exceeding hardware blocks numeric pass despite in-band markers',()=>{
 const result=ctx.math.evaluate(forward,{...profile,equipmentUpper:1002});
 assert.equal(result.within,false);assert.equal(result.status,'Band not verified');assert.match(result.detail,/planned|design|equipment/i);
});
check('stated live spectrum exceeding hardware blocks numeric pass',()=>{
 const result=ctx.math.evaluate(forward,{...profile,available:1500});
 assert.equal(result.within,false);assert.equal(result.status,'Band not verified');
});
check('forward profile limits outside supported frequency range block numeric pass',()=>{
 for(const change of [{forwardFloor:0},{equipmentUpper:2000},{plannedUpper:2000},{available:2000}]){
  const result=ctx.math.evaluate(forward,{...profile,...change});assert.equal(result.within,false,JSON.stringify(change));assert.equal(result.status,'Band not verified');
 }
});
check('valid forward profile edge at 1800 MHz remains usable',()=>{
 const result=ctx.math.evaluate({...forward,highMHz:1800},{...profile,id:'1800',plannedUpper:1800,available:1800,equipmentUpper:1800});assert.equal(result.within,true);
});
check('unsupported return passband and forward marker block numeric pass',()=>{
 for(const change of [{returnCeiling:2000,forwardLow:2200},{forwardLow:2000}]){
  const result=ctx.math.evaluate(reverse,{...profile,...change},'return');assert.equal(result.within,false,JSON.stringify(change));assert.equal(result.status,'Band not verified');
 }
});
check('valid conventional return boundary remains usable',()=>{
 const result=ctx.math.evaluate({...reverse,highMHz:42},{...profile,returnCeiling:42,forwardLow:54,forwardFloor:54},'return');assert.equal(result.within,true);
});
check('return ceiling cannot overlap an entered forward passband',()=>{
 const result=ctx.math.evaluate(reverse,{...profile,forwardFloor:54},'return');assert.equal(result.within,false);assert.equal(result.status,'Band not verified');
});
check('planning and missing profile criteria retain their established statuses',()=>{
 assert.equal(ctx.math.evaluate({...forward,basis:'Planning'},{...profile,equipmentUpper:1002}).status,'Planning / unverified');
 assert.equal(ctx.math.evaluate(forward,{...profile,fLevelTol:''}).status,'Incomplete');
 assert.equal(ctx.math.evaluate(forward,{...profile,equipmentUpper:''}).status,'Band not verified');
});
console.log(`Alpha18 math: ${checks} checks passed`);
