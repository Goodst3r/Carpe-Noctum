/* B2 upstream only. All approved composite H/HX/HR cases call production functions.
   Unrounded error bound: max(1e-11 dB absolute, |reference| * 1e-12 relative).
   Six-significant printed results are separately checked in the actual source UI.
   Converter cases remain in the later converter suite; no values/vectors change. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
const vectors=JSON.parse(fs.readFileSync('handoff_docs/reviews/chatgpt-calculator-test-vectors.json','utf8')).calculators.headroom;
const sandbox=vm.createContext({});
vm.runInContext(fs.readFileSync('night-sweep/docsis-health.js','utf8')+'\nthis.health=DocsisHealth;',sandbox);
const health=sandbox.health,has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const declared={actualSimultaneousTotal:true,measurementPlane:'cm-f-connector',comparableReference:true,mtcEnabled:true};
let count=0,comparisons=0;
async function check(name,fn){await fn();count++;console.log('PASS '+name);}
function noNumber(r,reason,label){assert.equal(r.ok,false,label);assert.match(r.error,reason,label);for(const key of ['pmax','reading','headroom','compositeMargin','margin','compare'])assert.equal(r[key],undefined,label+' no '+key);}
function vectorInput(c){
 const i=c.inputs,context={};
 if(has(i,'actual_simultaneous_total_confirmed'))context.actualSimultaneousTotal=i.actual_simultaneous_total_confirmed;
 // The written H comparison cases declare their actual modem total and common
 // measurement/reference plane. This maps that supplied case context, not a
 // validator or a blanket assumption for the partial refusal records.
 if(c.context?.measurement_plane==='same_declared_matched_plane')context.measurementPlane='cm-f-connector';
 if(has(i,'measurement_plane'))context.measurementPlane=i.measurement_plane;
 if(has(i,'reference_provenance'))context.comparableReference=['hypothetical_independently_verified_applicable_capability','assumed_spec_minimum_not_reported_capability'].includes(i.reference_provenance);
 const applicable=i.mode==='applicable_docsis_3_1_cm_cmts_transmit_mode';
 if(applicable)context.mtcEnabled=true;
 return {mode:applicable?'3.1':i.mode,total:i.simultaneous_total_dBmV,pmax:has(i,'entered_Pmax_dBmV')?i.entered_Pmax_dBmV:i.reference_Pmax_dBmV,basis:i.basis,context};
}
function numeric(actual,decimal,label){const reference=Number(decimal);assert(Number.isFinite(actual));assert(Math.abs(actual-reference)<=Math.max(1e-11,Math.abs(reference)*1e-12),`${label}: ${actual} vs ${decimal}`);comparisons++;}
const upstreamCases=[...vectors.worked_cases,...vectors.extra_edge_cases].filter(c=>c.inputs.operation==='composite_margin');
const refusals=vectors.refusal_cases.filter(c=>c.inputs.operation!=='bandwidth');
const reasons={HR07:/blank Pmax.*(?:no|unsupported)|no supported.*reference|no figure.*3\.0/i,HR08:/below 65/i,HR09:/normalized|per.channel|simultaneous composite/i,HR10:/modem.*working|mode/i,HR11:/CM F.connector|comparable.*plane/i,HR14:/composite.*(?:per.channel|DRW)/i,HR16:/Pmax.*number|maximum total power.*number/i,HR17:/finite.*Pmax|Pmax.*finite|Pmax.*number|maximum total power.*number/i};
function set(h,field,value,type='input'){const el=h.d.querySelector(`[data-health="upstream"][data-field="${field}"]`);assert(el,'upstream '+field);el.value=value;el.dispatchEvent(new h.w.Event(type,{bubbles:true}));return el;}
const text=h=>h.d.getElementById('health-upstream-result').textContent.replace(/\s+/g,' ').trim();
const printed=h=>h.d.querySelector('[data-composite-margin]')?.textContent.replace(/\s+/g,' ').trim();
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 for(const c of upstreamCases)await check(c.id+' unrounded real upstream comparison',()=>{
  const r=health.upstream(vectorInput(c));assert.equal(r.ok,true,r.error);numeric(r.compositeMargin,c.decimal_reference.margin_dB,c.id);assert.equal(r.headroom,r.compositeMargin,'legacy unrounded alias');assert.equal(r.margin,Math.abs(r.compositeMargin));assert.equal(r.defaultPmax,c.id==='H4');
  assert.equal(r.status,Number(c.decimal_reference.margin_dB)<0?'over-pmax':Number(c.decimal_reference.margin_dB)===0?'at-pmax':'headroom');
 });
 for(const c of refusals)await check(c.id+' real unavailable reason: '+c.expected_reason_text,()=>{
  const i=c.inputs;
  if(c.id==='HR15'){
   for(const plant of ['42','204']){const r=health.againstWindow(undefined,health.getWindow('upstream',plant));assert.equal(r.status,'unknown');assert.equal(r.margin,undefined);assert.match(health.windowText('upstream',plant),/Unknown.*not entered/);}return;
  }
  const input=c.id==='HR14'?{request:i.operation,total:i.composite_total_dBmV,pmax:i.Pmax_dBmV}:vectorInput(c);
  noNumber(health.upstream(input),reasons[c.id],c.id);
 });
 const valid={mode:'3.1',total:'60',pmax:'68',context:declared};
 for(const [field,pattern,invalid] of [
  ['actualSimultaneousTotal',/simultaneous.*total|normalized|per.channel/i,false],
  ['measurementPlane',/CM F.connector|plane/i,'unknown'],
  ['comparableReference',/reference.*(?:provenance|comparable|confirm)|confirm.*reference/i,false],
  ['mtcEnabled',/MTC|transmit mode/i,false]
 ])for(const variant of ['missing','invalid'])await check(`${field} ${variant} independently refuses with its reason`,()=>{
  const context={...declared};if(variant==='missing')delete context[field];else context[field]=invalid;
  noNumber(health.upstream({...valid,context}),pattern,field+' '+variant);
 });
 await check('Absent physical context, unsupported operation and unknown reference cannot default to confirmed',()=>{
  noNumber(health.upstream({...valid,context:undefined}),/confirm|simultaneous|context/i,'no context');
  noNumber(health.upstream({...valid,request:'channel_capacity'}),/unsupported|only.*composite|unknown request/i,'unknown request');
  noNumber(health.upstream({...valid,context:{...declared,comparableReference:'unknown'}}),/reference/i,'unknown provenance');
 });
 await check('Blank65 requires declared applicable MTC and remains an assumption',()=>{
  const r=health.upstream({...valid,pmax:''});assert.equal(r.ok,true);assert.equal(r.defaultPmax,true);assert.equal(r.pmax,65);numeric(r.compositeMargin,'5','assumed');
  noNumber(health.upstream({...valid,pmax:'',context:{...declared,mtcEnabled:false}}),/MTC|transmit mode/i,'MTC disabled');
  noNumber(health.upstream({...valid,pmax:'',mode:'other'}),/blank Pmax|no supported|no figure.*3\.0/i,'blank other');
 });
 await check('Compatibility entry is a generic comparable total subtraction with old fields retained',()=>{
  const r=health.evaluate('upstream',{...valid,mode:'other',total:'52',pmax:'57',context:{...declared,mtcEnabled:false}});assert.equal(r.ok,true);assert.equal(r.specBasis,false);numeric(r.compositeMargin,'5','generic');assert.equal(r.compare,52);assert.equal(r.headroom,5);
 });
 await check('Every negative/positive sign is retained; only exact zero is at reference',()=>{
  for(const [total,status] of [['64.9999999999','headroom'],['65','at-pmax'],['65.0000000001','over-pmax']]){const r=health.upstream({...valid,total,pmax:'65'});assert.equal(r.ok,true);assert.equal(r.status,status);assert.equal(Math.sign(r.compositeMargin),status==='headroom'?1:status==='over-pmax'?-1:0);}
 });
 await check('Existing numeric input/Pmax software bounds and malformed values still refuse',()=>{
  for(const [patch,pattern] of [[{total:''},/total transmit power.*number|simultaneous total.*number/i],[{total:'Infinity'},/number|finite/i],[{total:'-101'},/between -100 and \+150/i],[{total:'151'},/between -100 and \+150/i],[{pmax:'-'},/Pmax.*number|maximum total power.*number/i],[{pmax:'NaN'},/Pmax.*number|maximum total power.*number|finite/i],[{mode:'other',pmax:'0'},/above 0/i],[{pmax:'151'},/150/]])noNumber(health.upstream({...valid,...patch}),pattern,JSON.stringify(patch));
 });
 const h=bootApp();await flush();h.ev("WorkflowUI.go('docsisHealth')");await flush();
 try{
  await check('Source UI asks for mode and explicit physical basis; no stale comparison before confirmation',()=>{
   assert.match(h.d.getElementById('health-upstream-title').textContent,/Upstream composite margin to Pmax/);
   assert.match(h.d.querySelector('[data-health="upstream"][data-field="mode"] option[value="3.1"]').textContent,/MTC enabled/);
   assert.equal(h.d.querySelector('[data-health="upstream"][data-field="basis"]').value,'');
   set(h,'total','60');set(h,'mode','3.1','change');assert.match(text(h),/confirm|simultaneous|basis/i);assert.equal(printed(h),undefined);
   set(h,'basis','confirmed','change');assert.equal(printed(h),'+5.00000 dB');assert.match(text(h),/assumed.*Spec minimum\/default/i);assert.match(text(h),/actual.*capability.*Unknown|not.*capability report/i);
   const formula=h.d.querySelector('#health-upstream-result [data-threshold="docsis.us.compositeMargin"]');assert(formula,'composite formula has its own source tag');assert.equal(formula.dataset.label,'expert');
  });
  for(const c of upstreamCases)await check(c.id+' six-significant result uses the real UI',()=>{
   const i=c.inputs;set(h,'mode','3.1','change');set(h,'basis','confirmed','change');set(h,'pmax',i.entered_Pmax_dBmV??'');set(h,'total',i.simultaneous_total_dBmV);
   const expected=c.id==='HX09'?'−1.00000e-6':(Number(c.expected_6sf.margin_dB)>0?'+':Number(c.expected_6sf.margin_dB)<0?'−':'')+c.expected_6sf.margin_dB.replace(/^-/,'');
   assert.equal(printed(h),expected+' dB',c.id+' rendered');
   assert.match(text(h),/Available per.channel\/DRW headroom.*Unknown/i);assert.match(text(h),/channel count.*width.*Unknown|Unknown.*channel count.*width/i);
   if(c.id==='H4')assert.match(text(h),/assumed.*Spec minimum\/default/i);else assert.match(text(h),/Entered comparable total Pmax reference/);
   if(c.id==='HX08')assert.match(text(h),/At the reference/);else assert.match(text(h),Number(c.expected_6sf.margin_dB)<0?/Over the reference/:/Below the reference/);
  });
  await check('UI removes numeric result for unconfirmed context and never silently restores it',()=>{
   set(h,'basis','','change');assert.equal(printed(h),undefined);assert.match(text(h),/confirm|simultaneous|basis/i);set(h,'total','52');assert.equal(printed(h),undefined);set(h,'basis','confirmed','change');assert(printed(h));
  });
  await check('Other mode UI keeps generic entered reference and compatibility caveat; no Spec tag on entry',()=>{
   set(h,'mode','other','change');assert.equal(printed(h),undefined);set(h,'basis','confirmed','change');set(h,'pmax','57');set(h,'total','52');assert.equal(printed(h),'+5.00000 dB');assert.match(text(h),/generic|entered reference/i);assert.match(text(h),/does not certify.*3\.0.*per.channel/i);
   assert.equal(h.d.querySelector('#health-upstream-result [data-threshold="docsis.us.pmax.capability"]'),null);
   set(h,'pmax','');assert.equal(printed(h),undefined);assert.match(text(h),/blank Pmax|no supported|no figure.*3\.0/i);
  });
  assert.deepEqual(h.errors,[]);
 }finally{h.close();}
 console.log(`Build3 composite upstream: ${count} checks passed (${comparisons} independent numeric comparisons)`);
})().catch(e=>{console.error(e);process.exitCode=1;});
