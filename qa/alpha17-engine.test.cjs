'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const HFC=require('../night-sweep/engine.js');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../night-sweep/catalog.json'),'utf8'));
let passed=0,failed=0;
function test(label,fn){try{fn();passed++;console.log('PASS '+label);}catch(error){failed++;console.error('FAIL '+label+'\n'+error.stack);}}
const near=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const printed=catalog.devices.find(d=>d.id==='scientific-atlanta-multimedia-1ghz--sat-mm-2-11').ports.find(p=>p.id==='through').maximum;

test('SA printed integer band upper endpoints retain their published losses',()=>{
  for(const [frequency,expected] of [[5,1.9],[10,1.9],[11,1.8],[300,1.8],[301,2.5],[400,2.5],[450,2.5],[600,2.6],[750,2.8],[900,3.3],[1000,3.4]])near(HFC.curveValue(printed,frequency),expected);
});
test('shared endpoints use the next band, including a different loss',()=>{
  const curve={min:5,max:1000,bands:[[5,300,1.9],[300,600,2.5],[600,1000,2.1]]};
  near(HFC.curveValue(curve,299.999),1.9);near(HFC.curveValue(curve,300),2.5);near(HFC.curveValue(curve,600),2.1);near(HFC.curveValue(curve,1000),2.1);
});
test('fractional printed-band gaps use the larger adjacent maximum only with explicit policy',()=>{
  const curve={...printed,gapPolicy:'adjacent-maximum'};
  for(const [frequency,expected] of [[10.5,1.9],[300.5,2.5],[600.5,2.8],[900.5,3.4]])near(HFC.curveValue(curve,frequency),expected);
});
test('unqualified band gaps stay missing rather than inheriting a loss assumption',()=>{
  const curve={...printed};delete curve.gapPolicy;
  for(const frequency of [10.5,300.5,600.5,900.5])assert.equal(HFC.curveValue(curve,frequency),null);
  assert.equal(HFC.curveValue({...curve,gapPolicy:'unknown'},300.5),null);
});
test('gap policy does not extrapolate beyond the defined curve or outer bands',()=>{
  const curve={min:5,max:1000,bands:[[10,300,1.9],[301,900,2.5]],gapPolicy:'adjacent-maximum'};
  for(const frequency of [4.9,5,9.9,900.1,1000,1000.1,NaN,Infinity])assert.equal(HFC.curveValue(curve,frequency),null);
});

const setup={lowF:261,highF:993,lowLevel:34,highLevel:46,liveMax:993,launchMode:'linear',basis:'nominal',temperature:68,viewStart:261,viewEnd:1002,referenceF:261};
// Zero cable plus configured 20 dB gain gives literal outputs 54/66 dBmV.
const amp={id:'r1',parent:'source',length:0,cable:'p3_625',device:'active_gm_hgd',activeMode:'anchors',gainLowF:261,gainHighF:993,gainLow:20,gainHigh:20,outputLoss:0};
test('invalid hidden graph range cannot blank a valid RF route',()=>{
  const state={setup:{...setup,viewStart:1200,viewEnd:1002},rows:[amp]};
  near(HFC.run(state,catalog,261).source,34);near(HFC.run(state,catalog,261).byKey.get('r1::through').level,54);near(HFC.run(state,catalog,993).byKey.get('r1::through').level,66);
  assert.deepEqual(HFC.grid(state.setup.viewStart,state.setup.viewEnd),[]);
});
test('blank and malformed hidden graph controls cannot invalidate route or gain budget',()=>{
  for(const patch of [{viewStart:''},{viewEnd:'bad'},{referenceF:''},{referenceF:-1},{viewStart:1801,viewEnd:5}]){
    const state={setup:{...setup,...patch},rows:[amp]};
    near(HFC.run(state,catalog,261).byKey.get('r1::through').level,54);
    const budget=HFC.gainBudget(state,catalog,{rowId:'r1',targetLow:50,targetHigh:62,reserve:3});
    near(budget.low.requiredGain,16);near(budget.high.requiredGain,16);near(budget.minimumMargin,4);assert.equal(budget.gainStatus,'enough');
  }
});
test('invalid physical RF settings still leave source and outputs unavailable',()=>{
  for(const patch of [{lowF:993,highF:261},{liveMax:1801},{temperature:''},{basis:'unknown'}]){
    const state={setup:{...setup,...patch},rows:[amp]};
    assert.equal(HFC.run(state,catalog,261).source,null);assert.equal(HFC.run(state,catalog,261).byKey.get('r1::through').level,null);
  }
});
console.log(`\n${passed} Alpha flow engine checks passed; ${failed} failed.`);
if(failed)process.exitCode=1;
