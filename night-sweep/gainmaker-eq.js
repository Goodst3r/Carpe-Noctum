/* GainMaker cable-EQ facts. Numeric rows are shared by references and the existing
   1 GHz alignment adapter. Typical insertion loss is not nominal EQ or field acceptance. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GainMakerEQ=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const freeze=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const sources=freeze({
  A:{manufacturer:'ATX',title:'GigaXtend GMC Amplifier Accessories',revision:'ANW1513 Rev.02/2021',url:'https://digicomm.com/wp-content/uploads/2021/07/ANW1513_GigaXtend_GMC_Amp_Accessories.pdf',sha256:'75b37fb522d73829d149e245028d2fe199c80eb163ed522aa5e904fe4e8e1d14',status:'manufacturer-pdf-distributor-hosted',conditions:'Typical passive insertion loss across the EQ. Temperature not specified in this source; no tolerance supplied. 75 ohm HFC application; bandwidth and per-channel/total-power basis not applicable to loss ratios.'},
  B:{manufacturer:'Cisco',title:'1 GHz GainMaker System Amplifier Modules and Housings Installation and Operation Guide',revision:'OL-31156-01, February 2014',url:'https://manuals.plus/m/d2eb08707208f268def0b7521da0a8ff03c6fe6269ae602aeb025a42cc436bf7',status:'manufacturer-manual-indexed-mirror',conditions:'Typical passive insertion loss across the EQ; indexed manufacturer text, not a newly visually checked PDF. No manufacturing tolerance supplied. Standard return, separate from thermal parts.'},
  C:{manufacturer:'Cisco',title:'1 GHz GainMaker Line Extender Modules and Housings Installation and Operation Guide',revision:'OL-31155-01, May 2014',url:'https://studylib.net/doc/18909323/1-ghz-gainmaker-broadband-amplifier-platform-line',status:'manufacturer-manual-mirror-prior-crosscheck',conditions:'Prior source-register textual cross-check of standard 42 p.100; current retrieval exposed viewer only. No new visual/table verification claimed.'},
  D:{manufacturer:'Scientific Atlanta',title:'GainMaker Amplifier Accessories',revision:'716336 Rev D, October 2005',url:'https://www.edge-bbs.com/wp-content/uploads/2014/05/Scientific-Atlanta-Gainmaker-Amp-Access.pdf',status:'manufacturer-pdf-indexed-mirror',conditions:'Typical performance referenced to 68°F (20°C), unless otherwise noted. No supplied manufacturing tolerance. Thermal reverse parts have separate conditions and are excluded.'},
  E:{manufacturer:'Cisco',title:'GainMaker 1.2 GHz LE / HGD data sheets',revision:'C78-736684-02, April 2019; C78-736468-03, June 2019',url:'https://www.cisco.com/c/en/us/products/collateral/video/gainmaker-amplifiers/datasheet-c78-736684.pdf',status:'manufacturer-indexed-parts-prior-review',conditions:'Orderable part identifiers and accessory compatibility only, per reviewed Table 8 / HGD pp.10–11. Retired live URL redirects. LE has input AND output forward EQs; this does not source a 1.2 GHz balancing procedure.'}
 });
 const at=(key,locator)=>({...sources[key],key,locator});
 const f1=[52,70,86,550,600,650,750,870,1002],f12=[52,70,86,105,204,258,550,600,650,750,870,1002,1100,1218],r42=[5,10,15,20,25,30,35,40,42];
 /* [ordering/cable-equivalent nominal, ...published typical losses]. Zero dashes
    are constructed as null, never a numeric curve. */
 const forward1g=[
  [1.5,2.2,2.2,2.1,1.4,1.4,1.3,1.2,1.1,1.0],
  [3,3.4,3.3,3.2,1.9,1.8,1.7,1.5,1.2,1.0],
  [4.5,4.6,4.4,4.3,2.3,2.1,2.0,1.7,1.4,1.0],
  [6,5.8,5.6,5.4,2.7,2.5,2.3,1.9,1.5,1.0],
  [7.5,7.0,6.7,6.5,3.2,2.9,2.6,2.1,1.6,1.0],
  [9,8.2,7.9,7.7,3.6,3.3,3.0,2.4,1.7,1.0],
  [10.5,9.4,9.0,8.8,4.0,3.7,3.3,2.6,1.8,1.0],
  [12,10.6,10.2,9.9,4.5,4.0,3.6,2.8,1.9,1.0],
  [13.5,11.8,11.3,11.0,4.9,4.4,3.9,3.1,2.0,1.0],
  [15,13.0,12.5,12.1,5.3,4.8,4.3,3.3,2.2,1.0],
  [16.5,14.2,13.6,13.2,5.8,5.2,4.6,3.5,2.3,1.0],
  [18,15.4,14.8,14.3,6.2,5.5,4.9,3.7,2.4,1.0],
  [19.5,16.6,15.9,15.4,6.6,5.9,5.3,4.0,2.5,1.0],
  [21,17.8,17.1,16.5,7.1,6.3,5.6,4.2,2.6,1.0],
  [22.5,19.5,18.7,18.1,8.0,7.2,6.4,4.9,3.2,1.5],
  [24,20.7,19.9,19.2,8.4,7.6,6.7,5.2,3.4,1.5],
  [25.5,21.9,21.0,20.3,8.8,7.9,7.1,5.4,3.5,1.5],
  [27,23.1,22.2,21.5,9.3,8.4,7.4,5.6,3.6,1.5],
  [28.5,24.3,23.3,22.6,9.7,8.7,7.7,5.8,3.7,1.5],
  [30,25.5,24.5,23.7,10.1,9.1,8.0,6.1,3.8,1.5]
 ];
 const forward12g=[
  [1.5,2.23,2.19,2.15,2.11,1.95,1.87,1.55,1.50,1.45,1.37,1.27,1.16,1.09,1.00],
  [3,3.5,3.4,3.3,3.2,2.9,2.7,2.1,2.0,1.9,1.7,1.5,1.3,1.2,1.0],
  [4.5,4.7,4.6,4.4,4.3,3.8,3.6,2.6,2.5,2.4,2.1,1.8,1.5,1.3,1.0],
  [6,5.9,5.7,5.6,5.4,4.8,4.5,3.2,3.0,2.8,2.5,2.1,1.6,1.3,1.0],
  [7.5,7.2,6.9,6.7,6.6,5.7,5.4,3.7,3.5,3.2,2.8,2.3,1.8,1.4,1.0],
  [9,8.4,8.1,7.9,7.7,6.7,6.2,4.3,4.0,3.7,3.2,2.6,2.0,1.5,1.0],
  [10.5,9.6,9.3,9.0,8.8,7.6,7.1,4.8,4.5,4.2,3.6,2.9,2.1,1.6,1.0],
  [12,10.8,10.5,10.2,9.9,8.6,8.0,5.4,5.0,4.6,3.9,3.1,2.3,1.7,1.0],
  [13.5,12.1,11.7,11.3,11.0,9.5,8.9,5.9,5.5,5.1,4.3,3.4,2.4,1.8,1.0],
  [15,13.3,12.9,12.5,12.1,10.5,9.7,6.5,6.0,5.5,4.6,3.6,2.6,1.9,1.0],
  [16.5,14.5,14.0,13.7,13.2,11.4,10.6,7.0,6.5,6.0,5.0,3.9,2.8,1.9,1.0],
  [18,15.8,15.2,14.8,14.3,12.4,11.5,7.6,7.0,6.4,5.4,4.2,2.9,2.0,1.0],
  [19.5,17.0,16.4,16.0,15.4,13.3,12.3,8.1,7.5,6.9,5.7,4.4,3.1,2.1,1.0],
  [21,18.2,17.6,17.1,16.6,14.3,13.2,8.7,8.0,7.3,6.1,4.7,3.2,2.2,1.0],
  [22.5,20.0,19.3,18.8,18.2,15.2,14.1,9.7,9.0,8.3,7.0,5.5,3.9,2.8,1.0],
  [24,21.2,20.5,19.9,19.3,16.2,15.0,10.3,9.5,8.8,7.3,5.7,4.1,2.9,1.0],
  [25.5,22.4,21.7,21.1,20.4,17.1,15.8,10.8,10.0,9.2,7.7,6.0,4.2,3.0,1.0],
  [27,23.6,22.8,22.2,21.5,18.1,16.7,11.3,10.5,9.7,8.1,6.3,4.4,3.0,1.0],
  [28.5,24.9,24.0,23.4,22.6,19.0,17.6,11.9,11.0,10.1,8.4,6.5,4.5,3.1,1.5],
  [30,26.1,25.2,24.5,23.7,20.0,18.4,12.5,11.5,10.6,8.8,6.8,4.7,3.2,1.5]
 ];
 /* [40MHz ordering label,42MHz nominal label,...5/10/15/20/25/30/35/40/42MHz]. */
 const return42=[
  [1,1,1.7,1.5,1.4,1.3,1.2,1.1,1.1,1.0,1.0],
  [2,2,2.3,2.0,1.8,1.6,1.4,1.3,1.1,1.0,1.0],
  [3,3.1,3.0,2.5,2.2,1.9,1.6,1.4,1.2,1.0,0.9],
  [4,4.1,3.6,3.0,2.6,2.2,1.9,1.6,1.3,1.0,0.9],
  [5,5.1,4.3,3.5,3.0,2.5,2.1,1.7,1.3,1.0,0.9],
  [6,6.1,4.9,4.1,3.4,2.8,2.3,1.8,1.4,1.0,0.9],
  [7,7.2,5.6,4.6,3.8,3.1,2.5,2.0,1.5,1.0,0.8],
  [8,8.2,6.2,5.1,4.2,3.4,2.7,2.1,1.5,1.0,0.8],
  [9,9.2,6.9,5.6,4.6,3.7,2.9,2.2,1.6,1.0,0.8],
  [10,10.2,7.5,6.1,5.0,4.0,3.2,2.4,1.7,1.0,0.8],
  [11,11.3,8.2,6.6,5.4,4.3,3.4,2.5,1.7,1.0,0.7],
  [12,12.3,8.9,7.1,5.8,4.6,3.6,2.7,1.8,1.0,0.7]
 ];
 const return204=[[1,1.9,1.0],[2,2.7,1.0],[3,3.6,1.0],[4,4.4,1.0],[5,5.3,1.0],[6,6.1,1.0],[7,7.0,1.0],[8,7.8,1.0],[9,8.7,1.0],[10,9.5,1.0],[11,10.4,1.0],[12,11.2,1.0]];
 const families=[
  {id:'forward-cable-1g',title:'Forward cable · 1 GHz / 1002 MHz · blue',direction:'forward',ratedBandMHz:[52,1002],frequenciesMHz:f1,source:at('A','p.2, 1002 MHz blue forward cable EQ table'),notes:'Cable-equivalent nominal, not actual tilt. Cisco B p.96 heads the top column 1000 MHz; ATX A and Scientific Atlanta D p.2 head it 1002 MHz. The existing alignment adapter retains both source-specific points. Never bridge 86–550 MHz.'},
  {id:'forward-cable-1p2g',title:'Forward cable · 1.2 GHz / 1218 MHz · green',direction:'forward',ratedBandMHz:[52,1218],frequenciesMHz:f12,source:at('A','p.2, 1218 MHz green forward cable EQ table'),notes:'Cable-equivalent nominal at 1218 MHz per ATX. Cisco E Table 8 phrase 1002 MHz conflicts with the ATX loss table; ATX 1218 MHz data controls. No matching installed 1.2 GHz module balancing procedure/pad/slot map is sourced here. Wide 105–204 and 258–550 MHz gaps stay unknown.'},
  {id:'standard-return-42',title:'Standard return · 42 MHz (40/42 labels)',direction:'return',ratedBandMHz:[5,42],frequenciesMHz:r42,source:at('B','p.98, standard 42/40 MHz reverse cable EQ chart'),notes:'Ordering label is at 40 MHz; printed 42 MHz nominal differs. Source A p.4 endpoints and D p.6 5/40/42 MHz agree with B. Standard return only; thermal response is separate. Between 5 and 10 MHz is an unlicensed wide gap; 11 MHz is a labelled linear estimate.'},
  {id:'standard-return-204',title:'Standard return · 204 MHz',direction:'return',ratedBandMHz:[5,204],frequenciesMHz:[5,204],source:at('A','p.5, standard 204 MHz reverse EQ table'),notes:'Only 5 and 204 MHz endpoints published here. Every intermediate loss is unknown; no fitted full curve. Aftermarket Digicomm curves disagree and are excluded. No automatic return pad/EQ recommendation: installed procedure and injection/receiver planes are not established.'}
 ];
 const ident=(manufacturer,partNumber,key,locator)=>({manufacturer,partNumber,source:at(key,locator)});
 function make(family,row){
  const v=row[0],ret=family.id==='standard-return-42',nominal=ret?(row[1]??0):v,losses=row.slice(ret?2:1),identifiers=[];
  if(family.id==='forward-cable-1g')identifiers.push(ident('ATX','GAGM-EQC-1G-'+v,'A','p.2'),ident('Cisco',String(4007228+v/1.5),'B','pp.96,104; legacy part number'),ident('Cisco','GM-EQCBL-'+v+'-1G=','B','p.104; orderable identifier'));
  if(family.id==='forward-cable-1p2g')identifiers.push(ident('ATX','GAGM-EQC-1.2G-'+v,'A','p.2'),ident('Cisco','GM-EQC-1.2G-'+v+'=','E','LE Table 8; HGD pp.10–11'));
  if(ret){if(v)identifiers.push(ident('ATX','GAGM-EQREV-42M-'+v,'A','p.4'));identifiers.push(ident('Cisco',v?'GM-EQREV-'+v+'-40M=':'GM-EQREV-0=','B','p.106'),ident('Cisco',String(v?589627+v:712719),'B','p.106; legacy part number'));}
  if(family.id==='standard-return-204'){identifiers.push(ident('ATX','GAGM-EQREV-204M-'+v,'A','p.5'));if(v)identifiers.push(ident('Cisco','GM-EQREV-204M-'+v+'=','E','LE Table 8; HGD pp.10–11'));}
  return {id:family.id+'/'+v,familyId:family.id,manufacturer:identifiers[0].manufacturer,partNumber:identifiers[0].partNumber,identifiers,direction:family.direction,ratedBandMHz:family.ratedBandMHz,orderingValue:v,nominalValueDb:nominal,nominalLabels:ret?{'40MHz':v,'42MHz':nominal}:{[family.ratedBandMHz[1]+'MHz']:nominal},units:'dB',sourceStatus:'published-typical',sources:ret?(v?[family.source,at('A','p.4, 5/42 MHz'),at('D','p.6, 5/40/42 MHz')]:[at('D','p.6, zero jumper dashes at 5/40/42 MHz'),at('A','p.4, anomalous zero row'),at('B','p.106, zero jumper identifiers')]):family.id==='forward-cable-1g'?[family.source,at('B','pp.96,104;1000 MHz column and identifiers'),at('D','p.2;1002 MHz column')]:[family.source,at('E','LE Table 8; HGD pp.10–11; identifiers/compatibility only')],sourceAnomalies:ret&&!v?[{printedPartNumber:'GAGM-EQREV-204M-0',source:at('A','p.4, 42 MHz zero row'),reason:'Printed 204M identifier in 42 MHz table; retained as a source anomaly, not a 42M-0 part or compatible 204 curve.'}]:[],solverCandidate:family.id==='forward-cable-1g'&&v>0,points:(!v&&ret?[5,40,42]:family.frequenciesMHz).map((f,i)=>[f,v?losses[i]:null])};
 }
 const data=[forward1g,forward12g,return42,return204];families.forEach((f,i)=>{f.parts=[[0,...(i===2?[0]:[])],...data[i]].map(row=>make(f,row));});
 const parts=families.flatMap(f=>f.parts),partIndex=new Map(),identifierIndex=new Map();
 for(const p of parts){partIndex.set(p.id,p);for(const id of p.identifiers)identifierIndex.set(id.partNumber,{part:p,identifier:id});}
 freeze(families);freeze(parts);
 const number=x=>typeof x==='number'?Number.isFinite(x)?x:null:typeof x==='string'&&/^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(x)&&Number.isFinite(Number(x))?Number(x):null;
 const resolve=id=>typeof id==='string'?(identifierIndex.get(id)|| (partIndex.has(id)?{part:partIndex.get(id),identifier:partIndex.get(id).identifiers[0]}:null)):null;
 function partFor(id){return resolve(id)?.part||null;}
 const unknown=reason=>({status:'unknown',value:null,units:'dB',reason});
 function lookupLoss(partId,frequencyMHz){
  const found=resolve(partId),f=number(frequencyMHz),p=found?.part,id=found?.identifier;
  const base={partId:p?.id||null,frequencyMHz:f,units:'dB',manufacturer:id?.manufacturer||null,partNumber:id?.partNumber||null,familyId:p?.familyId||null,direction:p?.direction||null,ratedBandMHz:p?.ratedBandMHz||null,source:p?.sources[0]||null};
  const fail=reason=>({...base,...unknown(reason)});
  if(!p)return fail('Unknown part or unsupported EQ family. Match the complete manufacturer identifier.');
  if(f===null||f<0)return fail('Enter a finite nonnegative decimal frequency in MHz; blank is unknown.');
  if(f<p.ratedBandMHz[0]||f>p.ratedBandMHz[1])return fail('Frequency is outside '+p.ratedBandMHz.join('–')+'MHz; no extrapolation.');
  if(!p.orderingValue)return fail('Known 0 jumper part; published insertion-loss cells are dashes. No zero-loss curve or solver candidate.');
  let points=p.points,source=p.sources[0];
  if(p.familyId==='forward-cable-1g'&&id.manufacturer==='Cisco'){
   points=[...p.points.slice(0,-1),[1000,p.points.at(-1)[1]],p.points.at(-1)];source=f===1002?at('D','p.2, 1002 MHz column'):at('B','p.96, 1000 MHz column');
  }else if(p.familyId==='standard-return-42')source=id.manufacturer==='ATX'&&[5,42].includes(f)?at('A','p.4, 5/42 MHz'):at('B','p.98, standard 42/40 MHz family chart; endpoints cross-checked A/D');
  const exact=points.find(q=>q[0]===f);if(exact)return {...base,status:'known',value:exact[1],source,reason:'Published table point; typical insertion loss, not a measured value or manufacturing tolerance.'};
  if(p.familyId==='standard-return-204')return fail('Only 5 and 204 MHz endpoints are published. Intermediate loss is unknown; no full curve or endpoint interpolation.');
  const high=points.findIndex(q=>q[0]>f),lo=points[high-1],hi=points[high];
  if(!lo||!hi||hi[0]/lo[0]>1.5)return fail('Published frequency gap is wider than the application max ratio 1.5; no estimate across '+(lo&&hi?lo[0]+'–'+hi[0]+'MHz':'this gap')+'.');
  return {...base,status:'estimated',value:lo[1]+(hi[1]-lo[1])*(f-lo[0])/(hi[0]-lo[0]),source,bracketMHz:[lo[0],hi[0]],reason:'Application piecewise-linear estimate in MHz between published points, max frequency ratio 1.5. This interpolation policy is not a manufacturer specification.'};
 }
 const models42=['active_gm_hgd','active_gm_gan_hgd','active_gm_hgbt','active_gm_le_manual','active_gm_le_thermal','active_gm_le_agc'];
 const forwardModels=[...models42,'active_gm_lgd_65'];
 function compatibility(partId,context={}){
  const p=partFor(partId),fail=reason=>({ok:false,reason});if(!p)return fail('Unknown or unsupported part/family.');
  if(context.direction!==p.direction)return fail('Part direction does not match the selected forward/return path.');
  if(!forwardModels.includes(context.equipmentId))return fail('No sourced installed GainMaker module compatibility/procedure; AOI electronic alignment is not a GainMaker plug-in.');
  const split=context.equipmentId==='active_gm_lgd_65'?'65':'42';if(String(context.split)!==split)return fail('Installed module split does not match the selected split.');
  if(p.direction==='return'){
   if(String(context.split)!==String(p.ratedBandMHz[1]))return fail('Return EQ rated split does not match this installed module; no 204 capability is added to a 42-only module.');
   return fail('Return attenuation is a catalog reference. No complete installed return slot/pad/procedure and injection/receiver planes are sourced for automatic part selection.');
  }
  if(p.familyId!=='forward-cable-1g')return fail('No matching installed 1.2 GHz module procedure/pads/slot map. Table 8 LE uses input AND output EQs; the 1 GHz input-only solver cannot be reused.');
  if(context.slot!=='forward-input-eq')return fail('This procedure sources the forward input EQ slot only, not output or interstage EQ.');
  if(!p.orderingValue)return fail('The known jumper has no published numeric loss curve and cannot be a solver candidate.');
  return {ok:true,reason:'Sourced 1 GHz installed-model forward input cable-EQ procedure; pads remain model-profile data.'};
 }
 const pairValue=(a,b,operation,reason)=>a.value===null||b.value===null?unknown(reason):{status:a.status==='estimated'||b.status==='estimated'?'estimated':'known',value:operation(a.value,b.value)===0?0:operation(a.value,b.value),units:'dB',reason,sources:[a.source,b.source].filter(Boolean)};
 function compareLoss(partId,lowMHz,highMHz,context){
  const p=partFor(partId),lo=number(lowMHz),hi=number(highMHz),match=context?compatibility(partId,context):null;
  const low=match&&!match.ok?unknown(match.reason):lookupLoss(partId,lowMHz),high=match&&!match.ok?unknown(match.reason):lookupLoss(partId,highMHz);
  const tilt=lo===null||hi===null||lo>=hi?unknown('Use low < high frequencies for high-minus-low output tilt.'):pairValue(low,high,(a,b)=>a-b,'Flat-input high-minus-low output tilt = loss(low) − loss(high). Both losses must be available.');
  return {part:p,low,high,tilt,compatibility:match};
 }
 function compareChange(oldId,newId,lowMHz,highMHz,context){
  const a=partFor(oldId),b=partFor(newId);if(!a||!b||a.familyId!==b.familyId)return {low:unknown('Old and new parts must belong to the same cable-EQ family.'),high:unknown('Old and new parts must belong to the same cable-EQ family.'),tilt:unknown('Different families are not interchangeable.')};
  const old=compareLoss(oldId,lowMHz,highMHz,context),next=compareLoss(newId,lowMHz,highMHz,context),low=pairValue(old.low,next.low,(x,y)=>x-y,'Output change = old loss − new loss; EQ-only comparison, no automatic installed part recommendation.'),high=pairValue(old.high,next.high,(x,y)=>x-y,'Output change = old loss − new loss; EQ-only comparison, no automatic installed part recommendation.');
  const lo=number(lowMHz),hi=number(highMHz),tilt=lo===null||hi===null||lo>=hi?unknown('Use low < high frequencies.'):pairValue(high,low,(x,y)=>x-y,'Change in high-minus-low output tilt = high output change − low output change.');return {old,next,low,high,tilt};
 }
 const legacyItems=freeze(families[0].parts.filter(p=>p.orderingValue).map(p=>({value:p.orderingValue,label:p.orderingValue+' dB · '+(4007228+p.orderingValue/1.5),points:[...p.points.slice(0,-1),[1000,p.points.at(-1)[1]],p.points.at(-1)]})));
 function legacyForwardItems(){return legacyItems;}
 return freeze({families,parts,sources,partFor,lookupLoss,compareLoss,compareChange,compatibility,legacyForwardItems});
});
