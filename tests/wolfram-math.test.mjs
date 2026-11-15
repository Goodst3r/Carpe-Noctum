import test from 'node:test';
import assert from 'node:assert/strict';
import {designLevel,recommendParts} from '../app/rf.mjs';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

// Expected values independently evaluated by the connected Wolfram Language kernel.
test('Wolfram reference: design midpoints, physical director loss and gain ceiling',()=>{
 near(designLevel('low',405),37);near(designLevel('high',1028),41.5);
 const r=recommendParts('gm-hgd-40',[[753,10]],[[753,43.3]],{availableGainDb:31,candidateEqIds:['forward-cable-1g/0'],director:'splitter'});
 near(r.outputs.main[0][1],41);near(r.shortfall,2.3);
 near(r.targets.aux1[0][1],39.8);near(r.outputs.aux1[0][1],37.5);
 assert.equal(r.gainStatus,'insufficient');
});
test('Wolfram reference: raw AGC formulas then realizable catalog pad rounding',()=>{
 for(const [model,raw,pad] of [['gm-hgd-40',9.3,9.5],['gm-le-agc',14.3,14.5]]){
  const r=recommendParts(model,[[753,10]],[[753,43.3]],{mode:'agc',pilotMHz:753,director:'splitter'});
  near(r.shared.agcPadRawDb,raw);near(r.shared.agcPadDb,pad);
 }
});
