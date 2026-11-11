'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../night-sweep/research/wolfram-records-1.6.json').expected;
const c={console};vm.createContext(c);for(const file of ['projects.js','sweep-setup.js','field-work.js'])vm.runInContext(fs.readFileSync('night-sweep/'+file,'utf8'),c);
const P=vm.runInContext('ProjectMath',c),S=vm.runInContext('SweepSetup',c),F=vm.runInContext('FieldWork',c);
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}function near(a,b){assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-9,a+' != '+b)}
const p={comparisonMode:'absolute',lowMHz:10,highMHz:200,measuredLow:-28,measuredHigh:-27,addLow:20,addHigh:20,targetLow:-8,targetHigh:-8};
test('Wolfram absolute receive correction, tilt and target errors',()=>{const x=S.comparison(p,'204');assert.equal(x.valid,true);[x.low,x.high,x.tilt,x.lowError,x.highError].forEach((v,i)=>near(v,E.returnAbsolute[i]));});
test('Wolfram referenced response does not add physical receive corrections',()=>{const x=S.comparison({...p,highMHz:40,measuredLow:-1,measuredHigh:2,targetLow:0,targetHigh:0,currentBandwidth:'6.4',referenceBandwidth:'6.4',currentView:'detailed',referenceView:'detailed'},'42');assert.equal(x.valid,true);[x.low,x.high,x.tilt,x.lowError,x.highError].forEach((v,i)=>near(v,E.returnRelative[i]));});
test('Wolfram physical generator budget and configured mode capability',()=>{const x=S.generator({desiredInjection:31,injectionCoupling:20,leadLoss:1,generatorMaximum:51},'204');near(x.setting,E.physicalInjection);assert.equal(x.withinCapability,false);});
test('Wolfram legacy manual budget retains saved remaining-loss semantics',()=>near(P.generator({desired:31,coupling:20,lead:1}),E.physicalInjection));
test('Wolfram same-plane voltage unit conversion',()=>{near(F.convert(0,'dbmv'),E.voltageUnits);near(F.convert(60,'dbuv'),0);assert.equal(F.convert('','dbuv'),null);});
const record={basis:'Measured',stage:'After',station:'S1',plane:'receiver',trace:'trace.csv',reviewer:'Test',traceSaved:'Yes',lowMHz:10,highMHz:200,rawLow:-28,rawHigh:-27,addLow:20,addHigh:20,targetLow:-8,targetHigh:-8,ripple:0,injectedLow:31,injectedHigh:31,existingPad:3,ingress:'Yes'};
const profile={approved:'Yes',returnCeiling:204,forwardLow:258,rLevelTol:1,rTiltTol:1,rRippleMax:1,injectionLow:31,injectionHigh:31,injectionTol:1};
test('Record arithmetic agrees with sweep helper and pad direction',()=>{const x=P.evaluate(record,profile,'return');[x.correctedLow,x.correctedHigh,x.tilt,x.errorLow,x.errorHigh].forEach((v,i)=>near(v,E.returnAbsolute[i]));near(x.estimatedPad,4);assert.equal(x.within,true);});
test('Overflow cannot produce record acceptance',()=>{const x=P.evaluate({...record,rawLow:1e308,rawHigh:1e308,addLow:1e308,addHigh:1e308,targetLow:1e308,targetHigh:1e308},profile,'return');assert.equal(x.within,false);assert.equal(x.status,'Invalid inputs');for(const k of ['correctedLow','correctedHigh','tilt','errorLow','errorHigh','tiltError','estimatedPad'])assert.equal(x[k],null);});
test('Sweep overflow and unknown correction remain unavailable',()=>{assert.equal(S.comparison({...p,measuredLow:1e308,addLow:1e308},'204').valid,false);assert.equal(S.generator({desiredInjection:1e308,injectionCoupling:1e308,leadLoss:0},'204').valid,false);assert.equal(S.comparison({...p,addLow:''},'204').valid,false);});
test('Documented bandwidth offset is not silently applied to incompatible references',()=>{near(10*Math.log10(6.4/1.6),E.referenceBandwidth);const x=S.comparison({...p,highMHz:40,currentBandwidth:'6.4',referenceBandwidth:'1.6',currentView:'detailed',referenceView:'detailed'},'42');assert.equal(x.valid,false);assert.match(x.detail,/mismatch/);});
console.log('Wolfram records: '+count+' checks passed.');
