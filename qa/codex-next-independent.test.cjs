'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),HFC=require('../night-sweep/engine.js'),WB=require('../night-sweep/route-workbench.js'),catalog=require('../night-sweep/catalog.json'),ref=require('../research/next-build/2026-11-14-independent-rf.json');
test('real route engine agrees with separately executed Wolfram RF vector and suppresses an unknown target',()=>{
 const custom=catalog.devices.find(d=>d.custom&&d.custom==='tap');assert.ok(custom);
 const state={setup:{lowF:54,highF:860,lowLevel:32,highLevel:43,launchMode:'linear',basis:'nominal',temperature:68},rows:[{id:'r1',device:custom.id,parent:'source',length:100,cable:'custom',customCable:'54,2\n860,7',customLoss:'54,3.5,3.5\n860,4,4'},{id:'r2',device:'active_gm_hgd',parent:'r1::through',length:0,cable:'custom',activeMode:'anchors',gainLowF:54,gainHighF:860,gainLow:20,gainHigh:25,outputLoss:1,targetLow:43,targetHigh:50,outputLimitLow:50,outputLimitHigh:55}]};
 const budget=HFC.gainBudget(state,catalog,{rowId:'r2',legId:'main'}),e=ref.expected,low=budget.low,high=budget.high;
 for(const [field,name] of [['input','input'],['predictedOutput','output'],['requiredGain','requiredGain'],['margin','gainMargin']])assert.deepEqual([low[field],high[field]],e[name]);
 assert.equal(high.input-low.input,e.inputTilt);assert.equal(high.predictedOutput-low.predictedOutput,e.outputTilt);assert.equal(high.predictedOutput-high.outputLimit,e.highOutputExcess);assert.equal(WB.assess(HFC,state,catalog,state.rows[1]).label,'Output limit exceeded');
 state.rows[1].targetHigh='';const unknown=HFC.gainBudget(state,catalog,{rowId:'r2'});assert.equal(unknown.high.target,null);assert.equal(unknown.high.requiredGain,null);assert.equal(unknown.high.margin,null);assert.equal(unknown.gainStatus,'missing');
});
