/* Format-independent grading only. These are synthetic normalized series, not native VIAVI exports. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const modulePath = path.join(__dirname, '../night-sweep/sweep-grading.js');
const SweepGrading = require(modulePath);
const fullProfile = {
  lowFrequencyMHz:54, highFrequencyMHz:860, ptvLimitDb:12,
  lowTargetDbmv:31, highTargetDbmv:43, maxLevelErrorDb:3,
  tiltTargetDb:12, maxTiltErrorDb:1
};
const absolute = {unit:'dBmV', points:[[54,34],[400,39],[860,45]]};
const evaluate = (series, profile) => {
  assert.equal(typeof SweepGrading.evaluateSeries, 'function', 'evaluateSeries must grade normalized measurements');
  return SweepGrading.evaluateSeries(series, profile);
};
const close = (actual, expected, representationScale=1) => {
  assert.equal(typeof actual, 'number');
  assert.ok(Number.isFinite(actual));
  const allowance=Math.max(1e-12*Math.max(1,Math.abs(Number(expected))),4*Number.EPSILON*representationScale);
  assert.ok(Math.abs(actual - Number(expected)) <= allowance, `${actual} != ${expected}`);
};
const allUnknown = result => {
  assert.equal(result.overall, 'unknown');
  for (const check of Object.values(result.checks)) {
    assert.equal(check.status, 'unknown');
    assert.ok(check.reason.length > 0);
  }
  for (const value of Object.values(result.metrics)) assert.equal(value, null);
};

for (const fixture of [
  {values:[0,1,0.5], ptv:1, status:'pass', overall:'unknown'},
  {values:[0,2.5,1.25], ptv:2.5, status:'pass', overall:'unknown'},
  {values:[0,4,2], ptv:4, status:'fail', overall:'fail'},
  {values:[0,3,1.5], ptv:3, status:'pass', overall:'unknown'}
]) test(`raw PTV ${fixture.ptv} dB compares inclusively to the entered 3 dB limit`, () => {
  const r = evaluate({unit:'dB', points:[[54,fixture.values[0]],[400,fixture.values[1]],[860,fixture.values[2]]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:3});
  assert.equal(r.metrics.ptvDb, fixture.ptv);
  assert.equal(r.checks.ptv.status, fixture.status);
  assert.equal(r.overall, fixture.overall);
  assert.equal(r.checks.lowLevel.status, 'unknown');
  assert.equal(r.checks.highLevel.status, 'unknown');
});

test('signed level and tilt errors use measured minus explicitly entered target', () => {
  const r = evaluate(absolute, fullProfile);
  assert.deepEqual(r.metrics, {ptvDb:11,lowValue:34,highValue:45,measuredTiltDb:11,lowLevelErrorDb:3,highLevelErrorDb:2,tiltErrorDb:-1});
  assert.equal(r.overall, 'pass');
  for (const c of Object.values(r.checks)) assert.equal(c.status, 'pass');
  assert.equal(r.checks.tilt.value, -1);
  assert.equal(r.checks.tilt.target, 12);
  assert.equal(r.checks.tilt.targetUnit, 'dB');
  assert.equal(r.checks.lowLevel.targetUnit, 'dBmV');
  assert.equal(r.checks.highLevel.targetUnit, 'dBmV');
  assert.equal(r.checks.ptv.targetUnit, null);
  assert.equal(r.checks.lowLevel.limit, 3);
});

test('negative readings and literal zero targets or tolerances remain usable measurements', () => {
  const r = evaluate({unit:'dBmV',points:[[54,-4],[400,-2],[860,0]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:4,lowTargetDbmv:-4,highTargetDbmv:0,maxLevelErrorDb:0,tiltTargetDb:4,maxTiltErrorDb:0});
  assert.equal(r.metrics.highValue, 0);
  assert.equal(r.metrics.lowLevelErrorDb, 0);
  assert.equal(r.metrics.highLevelErrorDb, 0);
  assert.equal(r.overall, 'pass');
});

test('descending measured tilt and signed target are preserved', () => {
  const r = evaluate({unit:'dBmV',points:[[54,0],[400,-1],[860,-3]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:3,lowTargetDbmv:0,highTargetDbmv:-3,maxLevelErrorDb:0,tiltTargetDb:-3,maxTiltErrorDb:0});
  assert.equal(r.metrics.measuredTiltDb, -3);
  assert.equal(r.metrics.tiltErrorDb, 0);
  assert.equal(r.overall, 'pass');
});

test('raw PTV includes the sloping response without detrending, reference subtraction, or correction', () => {
  const r = evaluate({unit:'dBmV',points:[[54,31],[457,37],[860,43]]},
    {...fullProfile,ptvLimitDb:3,lowTargetDbmv:31,highTargetDbmv:43,maxLevelErrorDb:0});
  assert.equal(r.metrics.ptvDb, 12);
  assert.equal(r.checks.ptv.status, 'fail');
  assert.equal(r.metrics.tiltErrorDb, 0);
  assert.equal(r.overall, 'fail');
});

test('only samples in the entered inclusive band contribute and raw source span/count remain explicit', () => {
  const r = evaluate({unit:'dBmV',label:'Absolute level',points:[[1800,100],[400,15],[5,-100],[860,12],[54,10]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:5,lowTargetDbmv:10,highTargetDbmv:12,maxLevelErrorDb:0,tiltTargetDb:2,maxTiltErrorDb:0});
  assert.equal(r.metrics.ptvDb, 5);
  assert.deepEqual(r.source.spanMHz, [5,1800]);
  assert.equal(r.source.sampleCount, 5);
  assert.equal(r.source.inBandSampleCount, 3);
  assert.deepEqual(r.source.bandMHz, [54,860]);
  assert.deepEqual(r.source.inBandSpanMHz, [54,860]);
  assert.equal(r.source.unit, 'dBmV');
  assert.equal(r.source.frequencyUnit, 'MHz');
  assert.match(r.source.qualification, /caller|supplied|normalized/i);
  assert.match(r.qualification, /aid/i);
  assert.match(r.qualification, /not.*official/i);
  assert.equal(r.overall, 'pass');
});

test('sorting a copy preserves frozen source points and profile', () => {
  const series = Object.freeze({unit:'dBmV',points:Object.freeze([Object.freeze([860,45]),Object.freeze([54,34]),Object.freeze([400,39])])});
  const profile = Object.freeze({...fullProfile});
  const before = JSON.stringify({series,profile});
  assert.equal(evaluate(series,profile).metrics.measuredTiltDb, 11);
  assert.equal(JSON.stringify({series,profile}), before);
});

test('relative dB supports PTV and tilt but never compares absolute dBmV targets', () => {
  const r = evaluate({unit:'dB',points:[[54,34],[400,39],[860,45]]},fullProfile);
  assert.equal(r.checks.ptv.status, 'pass');
  assert.equal(r.checks.tilt.status, 'pass');
  for (const key of ['lowLevel','highLevel']) {
    assert.equal(r.checks[key].status, 'unknown');
    assert.match(r.checks[key].reason, /relative|absolute|dBmV/i);
    assert.equal(r.checks[key].value, null);
  }
  assert.equal(r.metrics.lowLevelErrorDb, null);
  assert.equal(r.metrics.highLevelErrorDb, null);
  assert.equal(r.overall, 'unknown');
});

for (const field of ['ptvLimitDb','lowTargetDbmv','highTargetDbmv','maxLevelErrorDb','tiltTargetDb','maxTiltErrorDb']) {
  for (const blank of [undefined,null,'','  ']) test(`${field} ${JSON.stringify(blank)} remains unknown without a default`, () => {
    const r = evaluate(absolute,{...fullProfile,[field]:blank});
    const keys = field === 'maxLevelErrorDb' ? ['lowLevel','highLevel'] :
      [field === 'ptvLimitDb' ? 'ptv' : field === 'lowTargetDbmv' ? 'lowLevel' : field === 'highTargetDbmv' ? 'highLevel' : 'tilt'];
    for (const key of keys) assert.equal(r.checks[key].status,'unknown');
    assert.equal(r.overall,'unknown');
    assert.equal(r.metrics.ptvDb,11);
  });
}

test('tilt target is not inferred from low and high level targets', () => {
  const profile = {...fullProfile}; delete profile.tiltTargetDb;
  const r = evaluate(absolute,profile);
  assert.equal(r.metrics.measuredTiltDb,11);
  assert.equal(r.metrics.tiltErrorDb,null);
  assert.equal(r.checks.tilt.status,'unknown');
  assert.equal(r.overall,'unknown');
});

test('an established failure dominates missing criteria while other available metrics remain numeric', () => {
  const r = evaluate(absolute,{lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:3});
  assert.equal(r.checks.ptv.status,'fail');
  assert.equal(r.checks.tilt.status,'unknown');
  assert.equal(r.overall,'fail');
  assert.equal(r.metrics.measuredTiltDb,11);
});

test('a signed negative error outside its magnitude limit fails', () => {
  const r = evaluate(absolute,{...fullProfile,lowTargetDbmv:38,tiltTargetDb:15});
  assert.equal(r.metrics.lowLevelErrorDb,-4);
  assert.equal(r.metrics.tiltErrorDb,-4);
  assert.equal(r.checks.lowLevel.status,'fail');
  assert.equal(r.checks.tilt.status,'fail');
  assert.equal(r.overall,'fail');
});

test('decimal subtraction at an inclusive limit passes without rounding numeric results', () => {
  const r = evaluate({unit:'dBmV',points:[[54,0.1],[400,0.3],[860,0.4]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:0.3,lowTargetDbmv:0.1,highTargetDbmv:0.3,maxLevelErrorDb:0.1,tiltTargetDb:0.2,maxTiltErrorDb:0.1});
  close(r.metrics.ptvDb,0.3);
  close(r.metrics.tiltErrorDb,0.1);
  assert.equal(r.overall,'pass');
});

for(const [low,high,lowTarget,highTarget] of [[0.3,0.4,0.2,0.3],[999999.2,999999.3,999999.1,999999.2]]){
  test(`decimal equality at ${low}/${high} preserves raw math while passing entered 0.1 dB limits`, () => {
    const r=evaluate({unit:'dBmV',points:[[54,low],[860,high]]},
      {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:0.1,lowTargetDbmv:lowTarget,highTargetDbmv:highTarget,maxLevelErrorDb:0.1,tiltTargetDb:0.2,maxTiltErrorDb:0.1});
    assert.ok(r.metrics.ptvDb>0.1,'binary subtraction remains unrounded');
    assert.equal(r.metrics.lowValue,low);
    assert.equal(r.metrics.highValue,high);
    for(const check of Object.values(r.checks))assert.equal(check.status,'pass');
    assert.equal(r.overall,'pass');
  });
}

test('a difference beyond representation roundoff fails near the existing scalar envelope', () => {
  const r=evaluate({unit:'dBmV',points:[[54,999999.3],[860,999999.40000001]]},
    {lowFrequencyMHz:54,highFrequencyMHz:860,ptvLimitDb:0.1,lowTargetDbmv:999999.3,highTargetDbmv:999999.3,maxLevelErrorDb:0.1,tiltTargetDb:0,maxTiltErrorDb:0.1});
  assert.equal(r.checks.ptv.status,'fail');
  assert.equal(r.checks.highLevel.status,'fail');
  assert.equal(r.checks.tilt.status,'fail');
  assert.equal(r.overall,'fail');
});

test('a meaningful amount over a limit fails even when a rounded display could look equal', () => {
  const r = evaluate({unit:'dBmV',points:[[54,0],[400,1],[860,3.00000001]]},
    {...fullProfile,ptvLimitDb:3,lowTargetDbmv:0,highTargetDbmv:3,maxLevelErrorDb:0,tiltTargetDb:3,maxTiltErrorDb:0});
  assert.equal(r.checks.ptv.status,'fail');
  assert.equal(r.checks.highLevel.status,'fail');
  assert.equal(r.checks.tilt.status,'fail');
});

for (const points of [[],[[54,31]],[[54,31],[54,32],[860,43]],[[54,31],[54.0,31],[860,43]],
  [[54,31],[400,37]],[[400,37],[860,43]],[[53,31],[861,43]],[[54,31],[860.0000001,43]]]) {
  test(`incomplete or duplicate coverage gives no grade: ${JSON.stringify(points)}`, () => {
    allUnknown(evaluate({unit:'dBmV',points},fullProfile));
  });
}

for (const profile of [{},null,undefined,{...fullProfile,lowFrequencyMHz:null},{...fullProfile,highFrequencyMHz:''},
  {...fullProfile,lowFrequencyMHz:860},{...fullProfile,lowFrequencyMHz:900},
  {...fullProfile,lowFrequencyMHz:4.9999},{...fullProfile,highFrequencyMHz:1800.00001}]) {
  test(`missing, reversed, or out-of-range markers give no interpolated grade: ${JSON.stringify(profile)}`, () => {
    allUnknown(evaluate(absolute,profile));
  });
}

for (const unit of [undefined,null,'','db','dBm','dBuV','dB/dBmV']) test(`unit ${JSON.stringify(unit)} is not inferred`, () => {
  allUnknown(evaluate({unit,points:[[54,31],[860,43]]},fullProfile));
});

for (const points of [null,{},[[54,null],[860,43]],[[54,''],[860,43]],[[54,'31'],[860,43]],[[54,true],[860,43]],
  [[54,NaN],[860,43]],[[54,Infinity],[860,43]],[[54,1e6+0.1],[860,43]],[[54,-1e6-0.1],[860,43]],
  [[4.999,31],[860,43]],[[54,31],[1800.001,43]],[[null,31],[860,43]],[[NaN,31],[860,43]],
  [['54',31],[860,43]],[[54,31,7],[860,43]],[, [860,43]],[[54,31],null]]) {
  test(`malformed sample is rejected without coercion: ${String(points)}`, () => {
    allUnknown(evaluate({unit:'dBmV',points},fullProfile));
  });
}

test('series above the existing EvidenceCore sample count cannot be graded', () => {
  const points = Array.from({length:10001},(_,i) => [5+i*0.1,31]);
  allUnknown(evaluate({unit:'dBmV',points},fullProfile));
});

test('exactly 10,000 unique points remain usable at inclusive parser bounds', () => {
  const points=Array.from({length:10000},(_,i)=>[5+i*1795/9999,0]);
  const r=evaluate({unit:'dBmV',points},
    {lowFrequencyMHz:5,highFrequencyMHz:1800,ptvLimitDb:0,lowTargetDbmv:0,highTargetDbmv:0,maxLevelErrorDb:0,tiltTargetDb:0,maxTiltErrorDb:0});
  assert.equal(r.source.sampleCount,10000);
  assert.equal(r.source.inBandSampleCount,10000);
  assert.equal(r.metrics.ptvDb,0);
  assert.equal(r.overall,'pass');
});

test('existing EvidenceCore inclusive numeric bounds remain usable', () => {
  const r = evaluate({unit:'dBmV',points:[[5,-1000000],[1800,1000000]]},
    {lowFrequencyMHz:5,highFrequencyMHz:1800,ptvLimitDb:1000000,lowTargetDbmv:-1000000,highTargetDbmv:1000000,maxLevelErrorDb:0,tiltTargetDb:1000000,maxTiltErrorDb:1000000});
  assert.equal(r.metrics.ptvDb,2000000);
  assert.equal(r.metrics.measuredTiltDb,2000000);
  assert.equal(r.checks.ptv.status,'fail');
  assert.equal(r.checks.tilt.status,'pass');
});

test('invalid criterion types and bounds never become permissive defaults', () => {
  for (const bad of [false,true,NaN,Infinity,{},[], '3',1000000.1]) {
    const r=evaluate(absolute,{...fullProfile,ptvLimitDb:bad});
    assert.equal(r.checks.ptv.status,'unknown');
    assert.equal(r.overall,'unknown');
  }
  for (const field of ['ptvLimitDb','maxLevelErrorDb','maxTiltErrorDb']) {
    const r=evaluate(absolute,{...fullProfile,[field]:-1});
    assert.equal(r.overall,'unknown');
  }
});

test('unsupported series or profile fields are rejected rather than silently applying guessed semantics', () => {
  for (const series of [null,[],42,{...absolute,frequencyUnit:'Hz'},{...absolute,pointsUnit:'mV'},{...absolute,label:42}])
    allUnknown(evaluate(series,fullProfile));
  for (const profile of [[],42,{...fullProfile,levelCorrectionDb:20}]) allUnknown(evaluate(absolute,profile));
});

test('the existing parser normalized series is accepted without a second decoder', () => {
  const EvidenceCore=require('../night-sweep/evidence.js');
  const parsed=EvidenceCore.parseText('frequency_mhz,level_dbmv\n860,45\n54,34\n400,39\n','synthetic-interchange.csv','Sweep');
  assert.equal(parsed.status,'parsed');
  EvidenceCore.validateParse(parsed);
  assert.equal(evaluate(parsed.series,fullProfile).overall,'pass');
});

test('browser UMD exposes the same pure computation without CommonJS', () => {
  assert.ok(fs.existsSync(modulePath),'grading module required');
  const sandbox={}; vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(modulePath,'utf8'),sandbox);
  assert.equal(typeof sandbox.SweepGrading.evaluateSeries,'function');
  assert.equal(sandbox.SweepGrading.evaluateSeries(absolute,fullProfile).metrics.tiltErrorDb,-1);
});

test('real module outputs match independent Python Decimal reference cases', () => {
  const reference=JSON.parse(fs.readFileSync(path.join(__dirname,'../research/build3/sweep-grading-reference.json'),'utf8'));
  for(const fixture of reference.cases){
    const r=evaluate(fixture.series,fixture.profile);
    const representationScale=Math.max(1,...fixture.series.points.map(point=>Math.abs(point[1])),
      ...['lowTargetDbmv','highTargetDbmv','tiltTargetDb'].map(key=>typeof fixture.profile[key]==='number'?Math.abs(fixture.profile[key]):1));
    for(const [key,value] of Object.entries(fixture.expected.metrics)) value===null ? assert.equal(r.metrics[key],null) : close(r.metrics[key],value,representationScale);
    for(const [key,status] of Object.entries(fixture.expected.checks)) assert.equal(r.checks[key].status,status,fixture.id+' '+key);
    assert.equal(r.overall,fixture.expected.overall,fixture.id);
  }
});
