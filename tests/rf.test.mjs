import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateRoute,recommendParts,recommendReverseParts,designLevel} from '../app/rf.mjs';
const samples=[[57,31.4],[405,36.2],[753,43.3]];
const source={id:'n',kind:'node',modelId:'gs7k',settings:{}};
const job=(nodes=[],edges=[],portSweeps={'n::1':{samples}})=>({schema:1,split:'low',nodes:[source,...nodes],edges,portSweeps});
const edge=(from,to,port='main',lengthFt=0)=>({id:from+to,from,to,port,cableId:'p3_500',lengthFt,confirmed:true});
const active={id:'a',kind:'active',modelId:'gm-hgd-40',settings:{director:'splitter'}};
test('design anchors and independently calculated midpoint',()=>{assert.equal(designLevel('low',405),37);assert.equal(designLevel('high',1028),41.5);assert.equal(designLevel('low',null),null);});
test('node starts blank; design is never substituted for a measurement',()=>{let x=evaluateRoute(job([],[],{}));assert.deepEqual(x.frequencies,[]);assert.deepEqual(x.stations.n.outputs['1'],[]);});
test('whole measured node sweep is target including non-linear midband',()=>{const x=evaluateRoute(job([active],[edge('n','a','1')]));assert.deepEqual(x.frequencies,[57,405,753]);assert.deepEqual(x.stations.a.targets.main,samples);});
test('node ports remain independent and absent port stays unknown',()=>{const x=evaluateRoute(job([active],[edge('n','a','2')]));assert.ok(x.stations.a.input.every(x=>x[1]===null));});
test('cable attenuation uses published per100ft data and explicit linear estimate',()=>{const x=evaluateRoute(job([{id:'e',kind:'eol',modelId:'eol'}],[edge('n','e','1',200)]));assert.ok(Math.abs(x.stations.e.input[0][1]-30.301333333333332)<1e-9);});
test('joint HGD recommendation uses one common input pad and EQ and aux director once',()=>{const x=recommendParts('gm-hgd-40',samples,samples,{director:'splitter'});assert.ok(x.shared);assert.ok(x.shared.inputPadDb>=0);for(let i=0;i<3;i++)assert.ok(Math.abs(x.outputs.main[i][1]-x.outputs.aux1[i][1]-3.5)<1e-9);assert.equal(x.shared.factoryEqDb,10.5);});
test('gain shortfall propagates actual supported output to downstream station',()=>{const low=samples.map(([f,v])=>[f,v-60]);const x=evaluateRoute(job([active,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1'),edge('a','e')],{'n::1':{samples:low}}));const r=recommendParts('gm-hgd-40',low,samples,{director:'splitter'});assert.equal(r.gainStatus,'insufficient');assert.ok(r.shortfall>10);assert.deepEqual(x.stations.e.input,x.stations.a.outputs.main);});
test('measurement overrides only selected output; downstream follows measured values',()=>{const a={...active,readings:{aux1:{samples:[[57,21],[405,22],[753,23]]}}};const x=evaluateRoute(job([a,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1'),edge('a','e','aux1')]));assert.equal(x.stations.a.outputs.aux1[0][1],21);assert.notEqual(x.stations.a.outputs.main[0][1],21);assert.deepEqual(x.stations.e.input,a.readings.aux1.samples);});
test('HGD and LE AGC pad reference is minus34 and minus29 at explicit pilot',()=>{for(const [id,n] of [['gm-hgd-40',9],['gm-le-agc',14]]){const r=recommendParts(id,[[753,10]],[[753,43]],{mode:'agc',pilotMHz:753});assert.equal(r.shared.agcPadDb,n);}});
test('no extrapolation beyond equipment bandwidth',()=>{const r=recommendParts('gm-hgd-40',[[1800,10]],[[1800,49]]);assert.equal(r.outputs.main[0][1],null);assert.equal(r.gainStatus,'unknown');});
test('missing cable length and unconfirmed edges never mean zero loss',()=>{for(const e of [{...edge('n','a','1'),lengthFt:null},{...edge('n','a','1'),confirmed:false}]){const x=evaluateRoute(job([active],[e]));assert.ok(x.stations.a.input.every(p=>p[1]===null));}});
test('cycle and multiple feeds terminate with unresolved null propagation',()=>{let x=evaluateRoute(job([active],[edge('n','a','1'),edge('a','a')]));assert.ok(x.issues.length);assert.ok(x.stations.a.input.every(p=>p[1]===null));});
test('one bad midband value stays missing and is not interpolated away',()=>{const x=evaluateRoute(job([active],[edge('n','a','1')],{'n::1':{samples:[[57,31],[405,null],[753,43]]}}));assert.equal(x.stations.a.input.find(p=>p[0]===405)[1],null);});
test('factory EQ cannot be changed by optimizer settings',()=>{const r=recommendParts('gm-hgd-40',samples,samples,{factoryEqDb:0});assert.equal(r.shared.factoryEqDb,10.5);});
test('aux targets subtract local frequency-dependent director exactly once; downstream main inherits original node target',()=>{const a={...active,settings:{directorLosses:{aux1:[[57,3],[405,3.5],[753,4]],aux2:8}}};const b={id:'b',kind:'active',modelId:'gm-le-agc',settings:{}};const x=evaluateRoute(job([a,b],[edge('n','a','1'),edge('a','b','aux1')]));assert.equal(x.stations.a.targets.aux1[0][1],28.4);assert.equal(x.stations.a.targets.aux1[2][1],39.3);assert.deepEqual(x.stations.b.targets.main,samples);assert.ok(Math.abs(x.stations.a.outputs.main[2][1]-x.stations.a.outputs.aux1[2][1]-4)<1e-9);});
test('staged active after measurement in portSweeps overrides selected physical port',()=>{const a={...active,readings:{main:{before:{samples:[[57,5],[753,10]]},after:{samples:[[57,15],[753,20]]}}}};const j=job([a,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1'),edge('a','e')]);j.portSweeps['a::main']=a.readings.main.after;const x=evaluateRoute(j);assert.equal(x.stations.e.input[0][1],15);assert.equal(x.stations.e.input.at(-1)[1],20);});
test('LE40/52 configuration is supported without reusing unverified42/54 gain',()=>{const r=recommendParts('gm-le-agc-40',[[52,10],[1002,10]],[[52,31],[1002,43]]);assert.equal(r.gainStatus,'unknown');const measured=recommendParts('gm-le-agc-40',[[52,10],[1002,10]],[[52,31],[1002,43]],{gainSamples:[[52,25],[1002,34]]});assert.ok(measured.outputs.main.every(p=>Number.isFinite(p[1])));});
test('independent source-cell synthesis recovers shared12dB EQ and4.5dB pad with measured gain',()=>{const target=[[52,31],[70,32],[550,39],[750,43],[870,44],[1002,46]],loss=[10.6,10.2,4.5,2.8,1.9,1];const input=target.map(([f,t],i)=>[f,t+4.5+loss[i]-40]);const r=recommendParts('gm-hgd-40',input,target,{gainSamples:[[52,40],[1002,40]],director:'dc8'});assert.equal(r.shared.eqPartId,'forward-cable-1g/12');assert.equal(r.shared.inputPadDb,4.5);assert.ok(r.rmseDb<1e-10);assert.deepEqual(r.outputs.main,target);assert.ok(Math.abs(r.outputs.aux2[3][1]-35)<1e-10);});
test('long-cable gain shortage cannot masquerade as restored target at downstream',()=>{const x=evaluateRoute(job([active,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1',4000),edge('a','e')]));assert.equal(x.stations.a.gainStatus,'insufficient');assert.ok(x.stations.a.shortfall>10);assert.ok(x.stations.e.input.at(-1)[1]<x.stations.a.targets.main.at(-1)[1]-10);});
test('AOI cannot predict out-of-band256/1800 design endpoints',()=>{const r=recommendParts('aoi-le',[[256,10],[258,10],[1794,10],[1800,10]],[[256,34],[258,34.1],[1794,48.9],[1800,49]]);assert.equal(r.outputs.main[0][1],null);assert.equal(r.outputs.main.at(-1)[1],null);assert.ok(Number.isFinite(r.outputs.main[1][1]));assert.ok(r.issues.some(s=>/coverage|bands/.test(s)));});
test('excess output beyond realizable pad range is adjustment-limited, not supported',()=>{const r=recommendParts('gm-hgd-40',[[1002,43]],[[1002,43]]);assert.equal(r.gainStatus,'adjustment-limited');assert.ok(r.overshoot>20);});
test('missing HGD director keeps aux targets and predictions unknown',()=>{const r=recommendParts('gm-hgd-40',[[750,10]],[[750,43]]);assert.equal(r.outputs.aux1[0][1],null);assert.equal(r.targets.aux2[0][1],null);});
test('node measurements on unequal port grids never invent union-frequency samples',()=>{const x=evaluateRoute(job([],[],{'n::1':{samples:[[57,31],[753,43]]},'n::2':{samples:[[100,32],[600,40]]}}));assert.equal(x.stations.n.outputs['1'].find(p=>p[0]===100)[1],null);assert.equal(x.stations.n.outputs['2'].find(p=>p[0]===57)[1],null);});
test('minimax pad differs from mean on asymmetric residuals',()=>{const r=recommendParts('gm-le-agc',[[1000,1],[1001,1],[1002,11]],[[1000,1],[1001,1],[1002,1]],{gainSamples:[[1000,0],[1002,0]],candidateEqIds:['forward-cable-1g/0']});assert.equal(r.shared.inputPadDb,5);});
test('any numerical shortfall is reported without invented1dB acceptance tolerance',()=>{const r=recommendParts('gm-le-agc',[[750,42.8]],[[750,43]],{gainSamples:[[750,0]],candidateEqIds:['forward-cable-1g/0']});assert.equal(r.gainStatus,'insufficient');assert.ok(Math.abs(r.shortfall-.2)<1e-9);assert.equal(r.maxOutputStatus,'unknown');});
test('reverse requires verified physical planes and explicit fixeddesign input pad',()=>{const r=recommendReverseParts('gm-hgd-40',[[5,10],[40,10]],[[5,20],[40,20]]);assert.equal(r.gainStatus,'unknown');assert.ok(r.outputs.main.every(p=>p[1]===null));});
test('reverse optimizer recovers sourcedEQ6 andoutputpad4 from measured input/output planes',()=>{const input=[[5,10],[10,10],[20,10],[30,10],[40,10]],loss=[4.9,4.1,2.8,1.8,1],target=input.map(([f,v],i)=>[f,v+20.5-loss[i]-4]);const r=recommendReverseParts('gm-hgd-40',input,target,{planesVerified:true,inputPlane:'reverse-input',targetPlane:'reverse-output',reverseInputPadDb:0});assert.equal(r.shared.reverseEqPartId,'standard-return-42/6');assert.equal(r.shared.reverseOutputPadDb,4);assert.ok(r.maxErrorDb<1e-9);assert.equal(r.shared.reverseInputPadDb,0);});
test('870forwardfamily works only within documented familyband and1.2requiresverifiedslot',()=>{const r=recommendParts('gm-le-agc',[[52,10],[750,10],[1002,10]],[[52,31],[750,43],[1002,45]],{eqFamily:'forward-cable-870'});assert.equal(r.outputs.main.at(-1)[1],null);const unsupported=recommendParts('gm-le-agc',[[750,10]],[[750,43]],{eqFamily:'forward-cable-1p2g'});assert.equal(unsupported.gainStatus,'unknown');assert.ok(unsupported.issues.some(s=>/compatib|slot/.test(s)));});
test('reverse55 measured-transfer baseline can retain documented zeroEQ jumper',()=>{const samples=[[5,10],[55,10]],r=recommendReverseParts('gm-le-agc-55',samples,[[5,30],[55,30]],{planesVerified:true,inputPlane:'reverse-input',targetPlane:'reverse-output',reverseInputPadDb:0,reverseGainSamples:[[5,20],[55,20]]});assert.equal(r.shared.reverseEqPartId,'standard-return-55/0');assert.equal(r.shared.reverseOutputPadDb,0);});
test('operator-confirmed1.2inputEQs are usable within deviceband with manufacturer-specific curves',()=>{const s={eqFamily:'digicomm-linear-1p2g',componentCompatibilityConfirmed:true,gainSamples:[[52,40],[1002,40]],candidateEqIds:['digicomm-linear-1p2g/12']};const target=[[52,31],[750,43],[1002,46]],input=[[52,8.5],[750,13.2],[1002,13.5]],r=recommendParts('gm-hgd-40',input,target,s);assert.equal(r.shared.eqPartId,'digicomm-linear-1p2g/12');assert.equal(r.shared.inputPadDb,4.5);assert.equal(r.compatibilityStatus,'operator-confirmed');assert.ok(r.maxErrorDb<1e-9);});
test('Digicomm inverse EQ can correct excess positive tilt using sourced losses',()=>{const target=[[52,31],[750,43],[1002,46]],input=[[52,-6],[750,12.9],[1002,17.6]],r=recommendParts('gm-hgd-40',input,target,{eqFamily:'digicomm-inverse-1p2g',componentCompatibilityConfirmed:true,gainSamples:[[52,40],[1002,40]],candidateEqIds:['digicomm-inverse-1p2g/12']});assert.equal(r.shared.eqPartId,'digicomm-inverse-1p2g/12');assert.equal(r.shared.inputPadDb,2);assert.ok(r.maxErrorDb<1e-9);});
test('Digicomm directors use actual unequal auxiliary loss curves',()=>{const r=recommendParts('gm-hgd-40',[[750,10]],[[750,43]],{director:'digicomm-splitter',componentCompatibilityConfirmed:true});assert.equal(r.targets.aux1[0][1],39.6);assert.equal(r.targets.aux2[0][1],39.8);assert.ok(Math.abs(r.outputs.main[0][1]-r.outputs.aux1[0][1]-3.4)<1e-9);});
test('equal minimax andSSE candidates retain installed parts deterministically',()=>{const r=recommendParts('gm-le-agc',[[750,0]],[[750,38.5]],{gainSamples:[[750,40]],candidateEqIds:['forward-cable-1g/0','forward-cable-1g/3'],inputPadDb:0,eqPartId:'forward-cable-1g/3'});assert.equal(r.shared.eqPartId,'forward-cable-1g/3');assert.equal(r.shared.inputPadDb,0);});
test('quarantinedDigicomm16.5 cannot enter optimizer even atother frequencies',()=>{const r=recommendParts('gm-hgd-40',[[750,10]],[[750,43]],{eqFamily:'digicomm-cable-1p2g',componentCompatibilityConfirmed:true,candidateEqIds:['digicomm-cable-1p2g/16.5']});assert.equal(r.gainStatus,'unknown');assert.equal(r.shared,null);});

test('latest reading samples win over archived after when portSweeps is absent',()=>{
 const latest=[[57,18],[405,19],[753,20]],prior=[[57,28],[405,29],[753,30]];
 const a={...active,readings:{main:{samples:latest,stage:'before',before:{samples:latest},after:{samples:prior}}}};
 const x=evaluateRoute(job([a,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1'),edge('a','e')]));
 assert.deepEqual(x.stations.e.input,latest);
});
test('latest source reading controls the target without archived after precedence',()=>{
 const latest=[[57,21],[405,22],[753,23]],j=job([active],[edge('n','a','1')],{});
 j.nodes[0]={...source,readings:{'1':{samples:latest,after:{samples}}}};
 const x=evaluateRoute(j);assert.deepEqual(x.stations.a.targets.main,latest);
});
test('explicit unknown LE mode remains unknown rather than using the model gain',()=>{
 for(const mode of ['automatic','',null,false]) {
  const result=recommendParts('gm-le-agc',[[753,10]],[[753,43]],{mode});
  assert.equal(result.gainStatus,'unknown');assert.equal(result.shared,null);
  assert.ok(result.outputs.main.every(p=>p[1]===null));assert.ok(result.issues.some(issue=>/mode/i.test(issue)));
 }
});
test('valid LE modes retain distinct gain and factory EQ references',()=>{
 const results=Object.fromEntries(['manual','thermal','agc'].map(mode=>[mode,recommendParts('gm-le-agc',[[1002,-20]],[[1002,50]],{mode,pilotMHz:1002,candidateEqIds:['forward-cable-1g/0']})]));
 assert.equal(results.manual.outputs.main[0][1],20.5);
 assert.equal(results.thermal.outputs.main[0][1],15);
 assert.equal(results.agc.outputs.main[0][1],14);
 assert.equal(results.thermal.shared.factoryEqDb,7.5);
 assert.equal(results.manual.shared.factoryEqDb,9);
 assert.equal(results.agc.shared.factoryEqDb,9);
});
test('latest reading gaps never borrow bins from the archived after measurement',()=>{
 const latest=[[57,18],[405,null],[753,20]],a={...active,readings:{main:{samples:latest,after:{samples}}}};
 const x=evaluateRoute(job([a,{id:'e',kind:'eol',modelId:'eol'}],[edge('n','a','1'),edge('a','e')]));
 assert.equal(x.stations.e.input[1][1],null);
});
test('aux director loss persists through a passive section; next active retains the source target',()=>{
 const a={...active,settings:{directorLosses:{aux1:6,aux2:8}}};
 const passive={id:'p',kind:'passive',modelId:'cable-only',settings:{}};
 const b={id:'b',kind:'active',modelId:'gm-le-agc',settings:{}};
 const x=evaluateRoute(job([a,passive,b],[edge('n','a','1'),edge('a','p','aux1'),edge('p','b')]));
 for(let i=0;i<samples.length;i++){
  assert.equal(x.stations.a.targets.aux1[i][1],samples[i][1]-6);
  assert.ok(Math.abs(x.stations.a.outputs.main[i][1]-x.stations.p.outputs.main[i][1]-6)<1e-9);
 }
 assert.deepEqual(x.stations.p.input,x.stations.a.outputs.aux1);
 assert.deepEqual(x.stations.b.input,x.stations.p.outputs.main);
 assert.deepEqual(x.stations.b.targets.main,samples);
});
