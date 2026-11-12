'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(process.argv[2]||'.'),scratch=__dirname,cases=JSON.parse(fs.readFileSync(path.join(scratch,'raw-cases.json'),'utf8'));
const own=JSON.parse(fs.readFileSync(path.join(scratch,'own-cases.json'),'utf8'));
function bwContext(i){const c={restatementOnly:i.operation==='bandwidth'&&!i.instantaneous_OFDMA_total_requested};if(Object.hasOwn(i,'flat_PSD'))c.flatPSD=i.flat_PSD;if(Object.hasOwn(i,'from_MHz')&&Object.hasOwn(i,'to_MHz'))c.bandwidthUnits='MHz';else if(i.from_units||i.to_units)c.bandwidthUnits=i.from_units===i.to_units?i.from_units:i.from_units+'/'+i.to_units;return c;}
function marginInput(c){const i=c.inputs,context={};if(Object.hasOwn(i,'actual_simultaneous_total_confirmed'))context.actualSimultaneousTotal=i.actual_simultaneous_total_confirmed;
 // The written H comparison scope explicitly declares the CM F-connector. Use
 // that binding only when this case supplies its declared matched plane.
 if(c.context?.measurement_plane==='same_declared_matched_plane')context.measurementPlane='cm-f-connector';
 if(Object.hasOwn(i,'measurement_plane'))context.measurementPlane=i.measurement_plane;
 if(Object.hasOwn(i,'reference_provenance'))context.comparableReference=['hypothetical_independently_verified_applicable_capability','assumed_spec_minimum_not_reported_capability'].includes(i.reference_provenance);
 const mode=i.mode==='applicable_docsis_3_1_cm_cmts_transmit_mode'?'3.1':i.mode;if(mode==='3.1')context.mtcEnabled=true;
 return {mode,total:i.simultaneous_total_dBmV,pmax:Object.hasOwn(i,'entered_Pmax_dBmV')?i.entered_Pmax_dBmV:i.reference_Pmax_dBmV,basis:i.basis,context};}
const artifacts={source:null,standalone:'outputs/Night_Sweep.html',pwa:'dist/index.html'},out={};
for(const [artifact,file]of Object.entries(artifacts)){
 const src=file?fs.readFileSync(path.join(root,file),'utf8'):fs.readFileSync(path.join(root,'night-sweep/field-calcs.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'night-sweep/docsis-health.js'),'utf8');
 const a=src.indexOf('const FieldCalc=(()=>{'),b=src.indexOf('const FieldCalcs=(()=>{',a),c=src.indexOf('const DocsisHealth=(()=>{'),d=src.indexOf('const DocsisHealthUI=(()=>{',c);
 if([a,b,c,d].some(x=>x<0))throw Error('missing actual functions '+artifact);
 const s={};vm.createContext(s);vm.runInContext(src.slice(a,b)+'\n'+src.slice(c,d)+'\nglobalThis.fc=FieldCalc;globalThis.dh=DocsisHealth;',s);
 out[artifact]={};
 for(const ca of cases){const i=ca.inputs;let result;
  if(i.operation==='bandwidth')result=s.fc.ofdmPower(i.level_dBmV,i.from_MHz??i.from_value,i.to_MHz??i.to_value,bwContext(i));
  else if(i.operation==='company_ceiling_margin')result=Object.fromEntries(['42','204'].map(p=>[p,{result:s.dh.againstWindow(undefined,s.dh.getWindow('upstream',p)),text:s.dh.windowText('upstream',p)}]));
  else if(i.operation==='available_per_channel_headroom')result=s.dh.upstream({request:i.operation,total:i.composite_total_dBmV,pmax:i.Pmax_dBmV});
  else result=s.dh.upstream(marginInput(ca));out[artifact][ca.id]=result;
 }
 for(const ca of own)out[artifact][ca.id]=ca.api==='conversion'?s.fc.ofdmPower(...ca.args):s.dh.upstream(ca.input);
}
fs.writeFileSync(path.join(scratch,'actual-results.json'),JSON.stringify(out,null,2)+'\n');
console.log('Executed actual source, standalone and PWA FieldCalc.ofdmPower / DocsisHealth.upstream; raw results written.');
