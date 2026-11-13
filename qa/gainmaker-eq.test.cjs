'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{test}=require('node:test');
const facts=require('./fixtures/gainmaker-eq/source-facts.json'),legacy=require('./fixtures/gainmaker-eq/legacy-forward-items.json');
const {bootApp}=require('./build2-source-harness.cjs');
function api(){assert(fs.existsSync('night-sweep/gainmaker-eq.js'),'shared GainMaker EQ library must exist');return require('../night-sweep/gainmaker-eq.js');}
const near=(a,b)=>assert(Math.abs(a-b)<=1e-9,`${a} != ${b}`);
test('all four families carry every independently parsed source row, numeric cell and dash',()=>{
 const e=api(),sets=[['forward-cable-1g','forward1g'],['forward-cable-1p2g','forward12g'],['standard-return-42','return42'],['standard-return-204','return204']];let cells=0,dashes=0;
 assert.equal(e.parts.length,68);assert.equal(e.families.length,4);assert.equal(new Set(e.parts.map(p=>p.id)).size,68);
 for(const [id,key]of sets){const f=e.families.find(f=>f.id===id),raw=facts[key];assert(f);assert.deepEqual(f.frequenciesMHz,raw.frequencies);assert.equal(f.parts.length,raw.rows.length+(key.startsWith('return')?1:0));
  for(const p of f.parts){const r=raw.rows.find(r=>r.order===p.orderingValue);
   if(!p.orderingValue){assert.deepEqual(p.points.map(q=>q[0]),key==='return42'?raw.zeroDashFrequencies:raw.frequencies,'jumper rows contain only actually published dash cells');if(r?.partNumber)assert(p.identifiers.some(i=>i.partNumber===r.partNumber));for(const [,v]of p.points){assert.equal(v,null);dashes++;}assert.equal(p.solverCandidate,false);continue;}
   assert.equal(p.points.length,raw.frequencies.length);
   assert(r);if(r.partNumber)assert(p.identifiers.some(i=>i.partNumber===r.partNumber));if(r.nominal42)near(p.nominalLabels['42MHz'],Number(r.nominal42));
   p.points.forEach(([mhz,value],i)=>{assert.equal(mhz,raw.frequencies[i]);near(value,Number(r.losses[i]));cells++;});
   if(key==='return42'){near(e.compareLoss(p.id,5,42).tilt.value,Number(r.tilts[0]));near(e.compareLoss(p.id,5,40).tilt.value,Number(r.tilts[1]));const endpoints=raw.atxEndpoints.find(a=>a.order===p.orderingValue);near(e.lookupLoss(p.id,5).value,Number(endpoints.losses[0]));near(e.lookupLoss(p.id,42).value,Number(endpoints.losses[1]));near(p.nominalValueDb,Number(endpoints.nominal42));assert(p.identifiers.some(i=>i.partNumber===endpoints.partNumber));}
   for(const k of ['familyId','direction','manufacturer','partNumber'])assert(p[k]);assert.equal(p.units,'dB');assert.equal(p.sourceStatus,'published-typical');assert(p.sources.every(s=>s.revision&&s.locator&&s.conditions&&s.status));
  }
 }
 assert.equal(cells,592);assert.equal(dashes,28);
});
test('loss lookup keeps exact typical points, strict decimal/domain guards, and bounded linear estimates',()=>{
 const e=api(),id='GAGM-EQREV-42M-6';assert.equal(e.lookupLoss(id,10).status,'known');near(e.lookupLoss(id,11).value,3.96);assert.equal(e.lookupLoss(id,11).status,'estimated');assert.match(e.lookupLoss(id,11).reason,/linear.*MHz.*1\.5/i);
 for(const f of ['', ' ',null,undefined,true,[],{},NaN,Infinity,-1,'0x2a',0,4.99,42.001]){const r=e.lookupLoss(id,f);assert.equal(r.status,'unknown',String(f));assert.equal(r.value,null);assert(r.reason);}
 for(const f of [5.01,7,9.99])assert.equal(e.lookupLoss(id,f).value,null,'5–10 gap stays unknown');
 for(const f of [87,105,204,258,300,549])assert.equal(e.lookupLoss('GAGM-EQC-1G-12',f).value,null,'1GHz wide gap');
 for(const f of [106,150,203,259,400,549])assert.equal(e.lookupLoss('GAGM-EQC-1.2G-12',f).value,null,'1.2GHz wide gaps not licensed');
 near(e.lookupLoss('GAGM-EQC-1.2G-12',575).value,5.2);assert.equal(e.lookupLoss('GAGM-EQC-1G-12',1003).value,null);assert.equal(e.lookupLoss('GAGM-EQC-1.2G-12',1218.001).value,null);
});
test('204 endpoints and all parts remain available while every interior frequency and all zero curves stay unknown',()=>{
 const e=api();for(let v=1;v<=12;v++){const id='GAGM-EQREV-204M-'+v;assert.equal(e.lookupLoss(id,5).status,'known');assert.equal(e.lookupLoss(id,204).value,1);for(const f of [5.001,11,42,85,100,203.999])assert.equal(e.lookupLoss(id,f).status,'unknown');}
 for(const family of e.families){const p=family.parts[0];assert.equal(p.orderingValue,0);for(const f of family.frequenciesMHz)assert.equal(e.lookupLoss(p.id,f).value,null);}
 const r=e.compareLoss('GAGM-EQREV-204M-6',11,204);assert.equal(r.low.value,null);assert.equal(r.high.value,1);assert.equal(r.tilt.value,null);assert.equal(e.families.find(f=>f.id==='standard-return-204').parts.length,13);
});
test('independent F1–F3 and R1–R3 have the correct attenuation and output-change signs',()=>{
 const e=api();for(const [id,lo,hi,tilt,status]of [['GAGM-EQC-1G-12',52,1002,9.6,'known'],['GAGM-EQC-1.2G-12',52,1218,9.8,'known'],['GAGM-EQC-1.2G-12',258,1218,7,'known'],['GAGM-EQREV-42M-6',5,42,4,'known'],['GAGM-EQREV-42M-6',15,42,2.5,'known'],['GAGM-EQREV-42M-6',11,42,3.06,'estimated'],['GAGM-EQREV-204M-6',5,204,5.1,'known']]){const r=e.compareLoss(id,lo,hi);near(r.tilt.value,tilt);assert.equal(r.tilt.status,status);}
 const change=e.compareChange('GAGM-EQC-1.2G-6','GAGM-EQC-1.2G-12',258,1218);near(change.low.value,-3.5);assert.equal(change.high.value,0);near(change.tilt.value,3.5);
 assert.equal(e.compareLoss('GAGM-EQREV-42M-6',42,5).tilt.value,null);assert.equal(e.compareLoss('GAGM-EQREV-42M-6',42,42).tilt.value,null);
});
test('source-specific branding, aliases, nominal labels, zero anomaly and temperature do not drift',()=>{
 const e=api();assert.equal(e.partFor('GAGM-EQREV-42M-0'),null);assert.equal(e.partFor('GM-EQREV-204M-0='),null);assert.equal(e.partFor('GAGM-EQREV-204M-0').familyId,'standard-return-204');
 const zero=e.families.find(f=>f.id==='standard-return-42').parts[0];assert(zero.sourceAnomalies.some(a=>a.printedPartNumber==='GAGM-EQREV-204M-0'));assert(zero.identifiers.some(i=>i.partNumber==='712719'));
 const six=e.partFor('GM-EQREV-6-40M=');assert.equal(six.orderingValue,6);assert.equal(six.nominalLabels['40MHz'],6);assert.equal(six.nominalLabels['42MHz'],6.1);near(e.lookupLoss('589633',40).value,1);
 assert.equal(e.lookupLoss('4007236',1000).status,'known');assert.match(e.lookupLoss('4007236',1000).source.revision,/OL-31156/);assert.equal(e.lookupLoss('GAGM-EQC-1G-12',1000).status,'estimated');assert.equal(e.lookupLoss('4007236',1002).status,'known');assert.match(e.lookupLoss('4007236',1002).source.revision,/716336/);
 for(const id of ['GM-EQCBL-12-1G=','GM-EQC-1.2G-12=','GM-EQREV-204M-12='])assert(e.partFor(id),id);
 assert.equal(e.lookupLoss('GM-EQC-1.2G-12',1218).value,null,'trailing equals is part of Cisco identifier');assert.equal(e.lookupLoss('GM-EQC-1.2G-12=',1218).manufacturer,'Cisco');assert.equal(e.lookupLoss('GAGM-EQC-1.2G-12',1218).manufacturer,'ATX');
 assert.match(e.sources.D.conditions,/20/);assert.match(e.sources.A.conditions,/temperature.*not specified/i);assert.match(e.families.find(f=>f.id==='forward-cable-1p2g').notes,/1002.*conflict|conflict.*1002/i);
});
test('the unchanged 1GHz adapter preserves every legacy value, label and frequency exactly',()=>{
 const e=api();assert.deepEqual(e.legacyForwardItems(),legacy);const a=require('../night-sweep/alignment.js');for(const p of a.PROFILES){assert.deepEqual(p.eqs.items,legacy);assert.equal(p.eqs.maxGapRatio,1.5);assert.equal(a.eqLoss(p.eqs.items[7],300,'linear',1.5),null);}
});
test('physical invariants retain monotone attenuation and the old-minus-new output relation',()=>{
 const e=api();for(const p of e.parts.filter(p=>p.orderingValue)){assert(p.points.every(([,loss],i,pts)=>Number.isFinite(loss)&&loss>=0&&(!i||loss<=pts[i-1][1])));for(const [f,loss]of p.points){near(e.lookupLoss(p.id,f).value,loss);const same=e.compareChange(p.id,p.id,p.points[0][0],p.points.at(-1)[0]);assert.equal(same.low.value,0);assert.equal(same.high.value,0);assert.equal(same.tilt.value,0);}}
});
test('installed-model, split, direction and slot guards refuse unsupported families and procedures',()=>{
 const e=api(),ctx={equipmentId:'active_gm_hgd',direction:'forward',split:'42',slot:'forward-input-eq'};assert.equal(e.compatibility('4007236',ctx).ok,true);
 for(const [id,patch]of [['4007236',{direction:'return'}],['4007236',{slot:'forward-output-eq'}],['4007236',{equipmentId:'active_aoi_hgd'}],['4007236',{split:'204'}],['GAGM-EQC-1.2G-12',{}],['GAGM-EQREV-204M-6',{direction:'return'}]]){const r=e.compatibility(id,{...ctx,...patch});assert.equal(r.ok,false);assert(r.reason);}
 for(const id of ['GAGM-EQREV-42M-13','GAGM-EQL-1.2G-6','GAGM-EQIN-1G-6.5','748381','589260','made-up'])assert.equal(e.partFor(id),null,id);
 assert.equal(e.compareChange('4007236','GAGM-EQC-1.2G-12',52,1002).low.value,null);assert.equal(e.compareLoss('GAGM-EQREV-204M-6',5,204,{...ctx,direction:'return'}).high.value,null);
});
test('Tools references and Catalog expose parts, status, unknown reasons and F3 without changing saved work',t=>{
 const a=bootApp();t.after(()=>{assert.deepEqual(a.errors,[]);a.close();});const {ev,d,w}=a;ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("references")');const before=a.json('state');
 assert.equal(ev('catalogEntries()[0].id'),ev('catalog.devices.find(d=>d.id!=="none"&&!d.retired).id'),'new accessories preserve the existing catalog default ordering');
 const set=(key,value,event='change')=>{const el=d.querySelector(`[data-eq-reference="${key}"]`);assert(el,key);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));};
 set('family','standard-return-204');set('part','standard-return-204/6');set('low','11','input');assert.match(d.querySelector('#gainmakerEqResult').textContent,/Low.*unknown/i);assert.match(d.querySelector('#gainmakerEqResult').textContent,/High.*1\.0 dB.*known/i);assert.equal(d.querySelectorAll('[data-eq-reference="part"] option').length,13);
 set('family','standard-return-42');set('part','standard-return-42/6');set('low','11','input');assert.match(d.querySelector('#gainmakerEqResult').textContent,/4\.0 dB.*estimated/i);assert.match(d.querySelector('#gainmakerEqResult').textContent,/3\.1 dB.*estimated/i);
 set('family','forward-cable-1p2g');set('part','forward-cable-1p2g/6');set('change','forward-cable-1p2g/12');set('low','258','input');assert.match(d.querySelector('#gainmakerEqResult').textContent,/-3\.5.*0\.0.*\+3\.5/s);assert.match(d.querySelector('#gainmakerEqResult').textContent,/no.*installed.*procedure|procedure.*not.*sourced/i);
 ev('WorkflowUI.go("parts")');const search=d.querySelector('#catalogSearch');search.value='GM-EQREV-204M-6=';search.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(d.querySelector('#catalogItems').textContent,/GAGM-EQREV-204M-6/);const details=d.querySelector('#catalogItems details');details.open=true;details.dispatchEvent(new w.Event('toggle'));assert.match(details.textContent,/ANW1513.*02\/2021.*5/s);assert.match(details.textContent,/endpoint|intermediate/i);assert.equal(d.querySelector('[data-row="r1"] option[value="GAGM-EQREV-204M-6"]'),null,'references never become route/installed choices');
 assert.deepEqual(a.json('state'),before,'reference controls are transient and must not mutate any saved criteria or measurements');
});
test('Station retains an independent known high-pilot loss with an unsupported low pilot and keeps return selection manual',t=>{
 const a=bootApp();t.after(()=>{assert.deepEqual(a.errors,[]);a.close();});a.ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")');let select=a.d.querySelector('[data-station-target]');select.value='r1';select.dispatchEvent(new a.w.Event('change',{bubbles:true}));
 for(const [key,value]of Object.entries({lowMHz:'300',highMHz:'1002',eq:'12'})){const el=a.d.querySelector(`[data-station-scope="forward"][data-station-field="${key}"]`);el.value=value;el.dispatchEvent(new a.w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}
 const text=a.d.querySelector('[data-station-eq-loss]')?.textContent;assert(text,'Station shows installed EQ loss independently of the full both-reading solver');assert.match(text,/Low attenuation: — · unknown/);assert.match(text,/High attenuation: 1\.0 dB · known/);assert.match(a.d.querySelector('[data-station-return-reference]').textContent,/return.*catalog|catalog.*return/i);
 const details=a.d.querySelector('[data-station-eq-loss]');details.open=true;const high=a.d.querySelector('[data-station-scope="forward"][data-station-field="highMHz"]');high.value='1000';high.dispatchEvent(new a.w.Event('input',{bubbles:true}));assert.equal(a.d.querySelector('[data-station-eq-loss]'),details,'a pilot refresh must preserve the disclosure control');assert.equal(details.open,true);
 a.ev('WorkflowUI.go("sweepSetup")');assert.match(a.d.querySelector('[data-gainmaker-sweep-reference]').textContent,/204.*endpoint|endpoint.*204/i);
});
