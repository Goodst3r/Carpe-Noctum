'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),WB=require('../night-sweep/route-workbench.js');
test('gain requires equal known power basis and bandwidth; raw TP correction remains independent',()=>{
 const r={input:-5,output:10,inputPlane:'tp',outputPlane:'tp',inputCorrection:20,outputCorrection:20,inputBasis:'sc-qam',outputBasis:'sc-qam',inputBandwidthMHz:6,outputBandwidthMHz:6,inputImpedanceOhms:75,outputImpedanceOhms:75};
 assert.equal(WB.measuredGain(r,54,54),15);
 assert.equal(WB.measuredGain({...r,outputBasis:'ofdm-plc'},54,54),null);
 assert.equal(WB.measuredGain({...r,inputBandwidthMHz:''},54,54),null);
 assert.equal(WB.measuredGain({...r,outputBandwidthMHz:8},54,54),null);
 assert.equal(WB.measuredGain({...r,inputBasis:undefined,outputBasis:undefined},54,54),null);
 assert.equal(WB.measuredGain(r,54,55),null);
 assert.equal(WB.correctedLevel(-5,'tp',20),15);
});
test('physical leg targets and gains remain independent',()=>{
 const HFC=require('../night-sweep/engine.js'),catalog=require('../night-sweep/catalog.json');
 const state={setup:{lowF:54,highF:860,lowLevel:10,highLevel:10,launchMode:'linear',basis:'nominal',temperature:68},rows:[{id:'r1',parent:'source',length:0,cable:'p3_625',device:'active_gm_hgd',activeMode:'anchors',gainLowF:54,gainHighF:860,gainLow:31,gainHigh:31,targetLow:43,targetHigh:43,workbench:{legGain:{aux:{lowF:54,highF:860,low:20,high:20,targetLow:35,targetHigh:35,loss:1,limitLow:40,limitHigh:40}}}}]};
 const main=HFC.gainBudget(state,catalog,{rowId:'r1',legId:'main'}),aux=HFC.gainBudget(state,catalog,{rowId:'r1',legId:'aux'});
 assert.equal(main.low.predictedOutput,41);assert.equal(main.low.margin,-2);
 assert.equal(aux.low.predictedOutput,29);assert.equal(aux.low.target,35);assert.equal(aux.low.margin,-6);
 assert.equal(HFC.gainBudget(state,catalog,{rowId:'r1',legId:'third'}).low.margin,null);
 assert.equal(HFC.gainBudget(state,catalog,{rowId:'r1',legId:'missing'}).status,'invalid');
});
test('route pad/EQ advice uses the sourced model and comparable output readings',()=>{
 assert.equal(typeof WB.balance,'function');
 const HFC=require('../night-sweep/engine.js'),Alignment=require('../night-sweep/alignment.js'),catalog=require('../night-sweep/catalog.json');
 const reading=output=>({output,outputFrequency:54,outputPlane:'port',outputBasis:'sc-qam',outputBandwidthMHz:6,outputImpedanceOhms:75});
 const row={id:'r1',device:'active_gm_hgd',parent:'source',targetLow:39,targetHigh:49,workbench:{records:{main:{before:{low:reading(36.4),high:{...reading(49.6),outputFrequency:860}}}},pads:{'Forward input pad':{installed:6},'Forward input EQ':{installed:9}}}};
 const state={setup:{lowF:54,highF:860},rows:[row]};
 const a=WB.balance(HFC,Alignment,state,catalog,row,'before','main');assert.equal(a.catalog.eq.to,4.5);assert.equal(a.catalog.pad.to,7);
 row.workbench.records.main.before.high.outputBasis='ofdm-plc';assert.equal(WB.balance(HFC,Alignment,state,catalog,row,'before','main').ok,false);
});
