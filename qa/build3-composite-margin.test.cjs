/* B2 real-function references. Numeric error bound: max(1e-11 dB absolute,
   1e-12 × |reference| relative). This accommodates IEEE-754 log10/subtraction,
   including cancellation near Pmax, independently of displayed rounding.
   Every numeric accepted reference is also compared at six significant figures.
   HX07 must refuse: its mathematical answer exceeds the existing ±200 dBmV
   output envelope. No test implements a physical-context validator. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
const vectors=JSON.parse(fs.readFileSync('handoff_docs/reviews/chatgpt-calculator-test-vectors.json','utf8')).calculators.headroom;
const sandbox=vm.createContext({});
vm.runInContext(fs.readFileSync('night-sweep/field-calcs.js','utf8')+'\n'+fs.readFileSync('night-sweep/docsis-health.js','utf8')+'\nthis.calcs=FieldCalc;this.health=DocsisHealth;',sandbox);
const fc=sandbox.calcs,dh=sandbox.health;
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const conversion={flatPSD:true,bandwidthUnits:'MHz',restatementOnly:true};
function conversionContext(i){
 const context={restatementOnly:i.operation==='bandwidth'&&!i.instantaneous_OFDMA_total_requested};
 if(has(i,'flat_PSD'))context.flatPSD=i.flat_PSD;
 if(has(i,'from_MHz')&&has(i,'to_MHz'))context.bandwidthUnits='MHz';
 else if(i.from_units||i.to_units)context.bandwidthUnits=i.from_units===i.to_units?i.from_units:i.from_units+'/'+i.to_units;
 return context;
}
function compositeInput(c){
 const i=c.inputs,context={};
 if(has(i,'actual_simultaneous_total_confirmed'))context.actualSimultaneousTotal=i.actual_simultaneous_total_confirmed;
 // The written check's Headroom comparison fixtures specify the modem output
 // F-connector plane; the generic shared JSON plane is interpreted in that scope.
 if(c.context?.measurement_plane==='same_declared_matched_plane')context.measurementPlane='cm-f-connector';
 if(has(i,'measurement_plane'))context.measurementPlane=i.measurement_plane;
 if(has(i,'reference_provenance'))context.comparableReference=['hypothetical_independently_verified_applicable_capability','assumed_spec_minimum_not_reported_capability'].includes(i.reference_provenance);
 const applicable=i.mode==='applicable_docsis_3_1_cm_cmts_transmit_mode';
 if(applicable)context.mtcEnabled=true;
 return {mode:applicable?'3.1':i.mode,total:i.simultaneous_total_dBmV,pmax:has(i,'entered_Pmax_dBmV')?i.entered_Pmax_dBmV:i.reference_Pmax_dBmV,basis:i.basis,context};
}
const six=value=>Number(value).toPrecision(6).replace(/e([+-]?)0*(\d+)/i,(_,s,n)=>'e'+(s==='-'?'-':'+')+n).toLowerCase();
let checks=0,comparisons=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function numeric(actual,decimal,printed,id){
 const reference=Number(decimal);assert(Number.isFinite(actual),id+' finite');
 assert(Math.abs(actual-reference)<=Math.max(1e-11,Math.abs(reference)*1e-12),`${id}: ${actual} vs ${decimal}`);
 // Format both the independent decimal reference and app result through the same
 // six-significant output convention; numeric equality also permits E notation.
 assert.equal(six(actual),six(printed),id+' six significant figures');comparisons++;
}
for(const c of [...vectors.worked_cases,...vectors.extra_edge_cases])check(c.id+' production '+c.inputs.operation,()=>{
 const i=c.inputs;
 if(i.operation==='bandwidth'){
  const r=fc.ofdmPower(i.level_dBmV,i.from_MHz,i.to_MHz,conversionContext(i));
  if(c.id==='HX07'){assert.equal(r.ok,false);assert.match(r.error,/outside ±200 dBmV/);for(const k of ['total','delta','per6','per24','per1_6'])assert.equal(r[k],undefined);return;}
  assert.equal(r.ok,true,r.error);numeric(r.total,c.decimal_reference.level_dBmV,c.expected_6sf.level_dBmV,c.id+' level');numeric(r.delta,c.decimal_reference.delta_dB,c.expected_6sf.delta_dB,c.id+' delta');
 }else{
  const r=dh.upstream(compositeInput(c));assert.equal(r.ok,true,r.error);numeric(r.compositeMargin,c.decimal_reference.margin_dB,c.expected_6sf.margin_dB,c.id+' margin');assert.equal(r.headroom,r.compositeMargin,'legacy unrounded field preserved');
  assert.equal(r.defaultPmax,c.id==='H4');assert.equal(r.status,Number(c.decimal_reference.margin_dB)<0?'over-pmax':Number(c.decimal_reference.margin_dB)===0?'at-pmax':'headroom');
 }
});
const reasons={
 HR01:/measured power|measured level/i,HR02:/measured power|numeric level/i,HR03:/finite|measured power/i,
 HR04:/bandwidth.*above 0|bandwidth.*greater than zero/i,HR05:/bandwidth.*above 0|bandwidth.*greater than zero/i,HR06:/bandwidth.*measured in|bandwidth.*required/i,
 HR07:/blank Pmax|no figure.*3\.0|no supported reference/i,HR08:/below 65/i,HR09:/normalized|per.channel|simultaneous/i,HR10:/mode|modem.*working/i,HR11:/F.connector|plane/i,
 HR12:/flat.*PSD|flat power/i,HR13:/normaliz.*(?:units|bandwidth)|same.*units|both.*MHz|incompatible.*units/i,HR14:/per.channel|DRW/i,HR15:/Unknown|unknown/i,HR16:/Pmax.*number|maximum total power.*number/i,HR17:/finite|Pmax.*number|maximum total power.*number/i,
 HR18:/2,000 MHz|2000 MHz/i,HR19:/instantaneous.*OFDMA|OFDMA.*instantaneous/i
};
for(const c of vectors.refusal_cases)check(c.id+' production refuses: '+c.expected_reason_text,()=>{
 const i=c.inputs;let r;
 if(i.operation==='bandwidth'){
  r=fc.ofdmPower(i.level_dBmV,i.from_MHz??i.from_value,i.to_MHz??i.to_value,conversionContext(i));
 }else if(i.operation==='available_per_channel_headroom')r=dh.upstream({total:i.composite_total_dBmV,pmax:i.Pmax_dBmV,request:i.operation});
 else if(i.operation==='company_ceiling_margin'){
  for(const plant of ['42','204']){const unknown=dh.againstWindow(undefined,dh.getWindow('upstream',plant));assert.equal(unknown.status,'unknown');assert.match(dh.windowText('upstream',plant),/Unknown.*not entered/);assert.equal(unknown.margin,undefined);}return;
 }else r=dh.upstream(compositeInput(c));
 assert.equal(r.ok,false,c.id+' must refuse');assert.match(r.error,reasons[c.id],c.expected_reason_text);
 for(const k of ['headroom','compositeMargin','margin','total','delta'])assert.equal(r[k],undefined,c.id+' no '+k);
});
// Isolated valid fixture tests complement the untouched, deliberately partial
// refusal vectors; no missing fact is manufactured by the vector adapter.
for(const [field,invalid,reason] of [['flatPSD',false,/flat.*PSD|flat power/i],['bandwidthUnits','mixed',/normaliz.*units|both.*MHz/i],['restatementOnly',false,/instantaneous.*OFDMA/i]]){
 for(const variant of ['omitted','invalid'])check(field+' '+variant+' independently prevents a conversion',()=>{
  const context={...conversion};if(variant==='omitted')delete context[field];else context[field]=invalid;
  const r=fc.ofdmPower('48','1.6','6.4',context);assert.equal(r.ok,false);assert.match(r.error,reason);assert.equal(r.total,undefined);
 });
}
check('No context is not a confirmation at any supported basis',()=>{
 for(const basis of ['1.6','6','6.4','24']){const r=fc.ofdmPower('48',basis,'24');assert.equal(r.ok,false);assert.match(r.error,/flat|confirm/i);}
});
check('An in-range mixed-unit declaration refuses for normalization rather than width bounds',()=>{
 const r=fc.ofdmPower('48','1.6','6.4',{...conversion,bandwidthUnits:'MHz/Hz'});assert.equal(r.ok,false);assert.match(r.error,/normaliz.*units|both.*MHz/i);assert.doesNotMatch(r.error,/2,000/);
});
check('Narrow converter parsing refuses booleans, hex and partial decimal text',()=>{
 for(const value of [true,'0x30','48abc','1e']){const r=fc.ofdmPower(value,'1.6','6.4',conversion);assert.equal(r.ok,false);assert.match(r.error,/measured power|decimal|finite/i);}
});
check('Converter preserves legacy valid long decimals; upstream retains its existing text bound',()=>{
 const reference=fc.ofdmPower('48','1.6','6.4',conversion);
 for(const length of [50,51,128]){
  const level='0'.repeat(length-2)+'48',basis='0'.repeat(length-3)+'1.6',width='0'.repeat(length-3)+'6.4';
  for(const args of [[level,'1.6','6.4'],['48',basis,'6.4'],['48','1.6',width]])assert.deepEqual(fc.ofdmPower(...args,conversion),reference,'supported decimal length '+length);
 }
 const declared=compositeInput(vectors.worked_cases.find(c=>c.id==='H3'));
 assert.equal(dh.upstream({...declared,total:'0'.repeat(48)+'60'}).compositeMargin,8);
 const refused=dh.upstream({...declared,total:'0'.repeat(49)+'60'});assert.equal(refused.ok,false);assert.equal(refused.compositeMargin,undefined);assert.match(refused.error,/number/i);
});
(async()=>{
 const h=bootApp();await new Promise(r=>setImmediate(r));h.ev("WorkflowUI.go('calculators')");
 const set=(field,value,type='input')=>{const el=h.d.querySelector(`[data-calc="ofdm"][data-field="${field}"]`);assert(el,field);el.value=value;el.dispatchEvent(new h.w.Event(type,{bubbles:true}));return el;};
 const text=()=>h.d.getElementById('calc-ofdm-result').textContent.replace(/\s+/g,' ').trim();
 const first=()=>h.d.querySelector('#calc-ofdm-result .calc-stats strong')?.textContent.replace(/\s+/g,' ').trim();
 try{
  check('The existing upstream numeric-text bound is registered as Unknown software policy',()=>{
   const row=h.json("Thresholds.get('docsis.us.softwareBounds')");assert.equal(row.label,'unknown');assert.match(row.conditions,/50 UTF-16 code units/);assert.match(row.source,/application validation/i);
  });
  check('Existing converter waits for explicit flat-PSD/MHz/restatement confirmation',()=>{
   assert.equal(h.d.querySelector('[data-calc="ofdm"][data-field="context"]').value,'');
   set('power','48');set('basis','1.6','change');set('occupied','6.4');assert.equal(first(),undefined);assert.match(text(),/flat.*PSD|confirm/i);
  });
  check('H1/H2 displayed total and delta use six significant figures in the existing converter',()=>{
   set('context','confirmed','change');assert.equal(first(),'54.0206 dBmV');assert.match(text(),/\+6\.02060 dB/);
   set('basis','6.4','change');set('power','54');set('occupied','1.6');assert.equal(first(),'47.9794 dBmV');assert.match(text(),/[−-]6\.02060 dB/);
   assert.match(text(),/instantaneous OFDMA.*(?:Unknown|not)|does not determine.*instantaneous OFDMA/i);assert.match(text(),/headroom.*Unknown|does not determine.*headroom/i);
  });
  check('Clearing conversion confirmation removes stale numeric output',()=>{set('context','','change');assert.equal(first(),undefined);assert.match(text(),/flat.*PSD|confirm/i);});
  check('A browser badInput value cannot become a blank converter level or width',()=>{
   set('context','confirmed','change');
   for(const field of ['power','occupied']){const el=set(field,'');Object.defineProperty(el,'validity',{value:{badInput:true},configurable:true});el.dispatchEvent(new h.w.Event('input',{bubbles:true}));assert.equal(first(),undefined);assert.match(text(),/half-typed/i);Object.defineProperty(el,'validity',{value:{badInput:false},configurable:true});set(field,field==='power'?'48':'6.4');}
  });
  assert.deepEqual(h.errors,[]);
 }finally{h.close();}
 console.log(`Build3 composite margin: ${checks} checks passed (${comparisons} independent numeric comparisons)`);
})().catch(error=>{console.error(error);process.exitCode=1;});
