/* Focused current-catalog runtime checks; no build or device-test claim. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const H = require(path.join(root, 'night-sweep/engine.js'));
const cat = JSON.parse(fs.readFileSync(path.join(root, 'night-sweep/catalog.json')));
const checks = {printedPointValues:0,printedBandEndpoints:0,printedBandGapMidpoints:0,outsideDomains:0,workedExamples:0};
const failures = [];
function equal(actual, expected, label) {
  if (expected === null ? actual !== null : actual === null || Math.abs(actual - expected) > 1e-9) failures.push({label,actual,expected});
}
const curves=[];
for (const d of cat.devices) for (const p of d.ports||[]) for (const k of ['nominal','maximum']) if(p[k])curves.push({id:d.id,path:p.id+'/'+k,curve:p[k]});
for (const c of cat.cables)curves.push({id:c.id,path:'cable',curve:c.curve});
for (const p of cat.powerEquipment)if(p.mode==='curve')curves.push({id:p.id,path:'current',curve:{min:p.min_voltage,max:p.max_voltage,points:p.points}});
for (const {id,path:label,curve:c} of curves) {
  if(c.points)for(const [f,value]of c.points){equal(H.curveValue(c,f),value,id+'/'+label+' @'+f);checks.printedPointValues++;}
  if(c.bands)for(let i=0;i<c.bands.length;i++){
    const [lo,hi,value]=c.bands[i],next=c.bands[i+1];
    equal(H.curveValue(c,lo),value,id+'/'+label+' lower @'+lo);
    equal(H.curveValue(c,hi),next?.[0]===hi?next[2]:value,id+'/'+label+' upper @'+hi);
    checks.printedBandEndpoints+=2;
    if(next&&next[0]>hi){const f=(hi+next[0])/2,expected=c.gapPolicy==='adjacent-maximum'?Math.max(value,next[2]):null;equal(H.curveValue(c,f),expected,id+'/'+label+' gap @'+f);checks.printedBandGapMidpoints++;}
  }
  const low=c.points?.[0][0]??c.bands[0][0],high=c.points?.at(-1)[0]??c.bands.at(-1)[1];
  equal(H.curveValue(c,low-.001),null,id+'/'+label+' below table');
  equal(H.curveValue(c,high+.001),null,id+'/'+label+' above table');
  checks.outsideDomains+=2;
}
// Independent arithmetic anchors: 400ft * 1.78dB/100ft * 1.018 = 7.24816dB.
const p625=cat.cables.find(x=>x.id==='p3_625');
equal(H.cableAt(p625,{cable:'p3_625',length:400},750,86),7.24816,'P3 .625 attenuation and 18F temperature rise');
// (0.84 + 0.26) ohm/kft * 2kft * (1 + .004/C * 10C) = 2.288ohm.
equal(H.dcSegment(p625,{length:2000},86).resistance,2.288,'P3 .625 loop, one-way length, 10C rise');
equal(H.dcSegment(p625,{length:2000,dcRate:1.1},86).resistance,2.2,'Entered actual-condition loop does not get temperature factor twice');
// sqrt(225)=15, exactly halfway between sqrt(100)=10 and sqrt(400)=20.
equal(H.cableAt(null,{cable:'custom',length:400,customCable:'100 1\n400 2'},225,86),6,'Custom square-root cable interpolation, actual condition');
equal(H.curveValue(null,100),null,'Missing curve stays unavailable');
equal(H.passiveAt(cat.devices.find(x=>x.id==='none'),{id:'through'},{},100,'nom'),0,'Explicit cable-only path is zero');
const custom=cat.devices.find(x=>x.id==='custom-passive');
equal(H.passiveAt(custom,{id:'through'},{customLoss:''},100,'nom'),null,'Missing custom passive table stays unavailable');
const active=cat.devices.find(x=>x.active);
equal(H.activeGainAt(active,{},750),null,'Published active scalar is not automatically flat route gain');
checks.workedExamples=8;
const result={generatedAt:new Date().toISOString(),scope:'Current engine against all current printed numerical table rows/endpoints, gaps, out-of-table bounds and eight independent worked/guardrail examples. Does not verify inherited source transcription, hardware or a release build.',catalogRevision:cat.revision,inputSha256:Object.fromEntries(['catalog.json','engine.js'].map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'night-sweep',n))).digest('hex')])),curveCount:curves.length,checks,failures,status:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(__dirname,'runtime-curve-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({curveCount:result.curveCount,checks,status:result.status,failures},null,2));
if(failures.length)process.exitCode=1;
