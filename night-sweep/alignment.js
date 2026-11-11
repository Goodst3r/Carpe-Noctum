/* Tilt / EQ / pad solver (build list item 2, 2.0 Alpha build 3).
   Pure engine. Two readings plus the station's targets at the same two pilots give the
   level error at each pilot and the tilt error. When the exact model has sourced forward
   input pad and EQ values, the solver also picks the catalog values in the manufacturer's
   order (input EQ for tilt, then input pad for level at the high pilot) and reports the
   error left over. It never offers a value missing from that model's sourced list.
   Balancing on two pilots does not replace a sweep. */
const Alignment=(()=>{
 /* Sourced forward input pad and EQ data, one profile per model group. Each profile keeps
    its manufacturer source, revision, page and status. Empty until a value is verified. */
 const GM_PADS=Object.freeze([0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20,20.5]);
 /* Cisco 1 GHz forward cable equalizers 4007229–4007248: insertion loss (dB) at 52–1000 MHz, transcribed from
    OL-31156-01 Appendix A p.96 and checked equal to S-A data sheet 716336 Rev D p.2 and the LE guide OL-31155-01. The guide heads
    the top column 1000 MHz and the data sheet heads the same values 1002 MHz, so both points carry them. */
 const GM_EQS=Object.freeze([
   {value:1.5,label:'1.5 dB · 4007229',points:[[52,2.2],[70,2.2],[86,2.1],[550,1.4],[600,1.4],[650,1.3],[750,1.2],[870,1.1],[1000,1.0],[1002,1.0]]},
   {value:3,label:'3 dB · 4007230',points:[[52,3.4],[70,3.3],[86,3.2],[550,1.9],[600,1.8],[650,1.7],[750,1.5],[870,1.2],[1000,1.0],[1002,1.0]]},
   {value:4.5,label:'4.5 dB · 4007231',points:[[52,4.6],[70,4.4],[86,4.3],[550,2.3],[600,2.1],[650,2.0],[750,1.7],[870,1.4],[1000,1.0],[1002,1.0]]},
   {value:6,label:'6 dB · 4007232',points:[[52,5.8],[70,5.6],[86,5.4],[550,2.7],[600,2.5],[650,2.3],[750,1.9],[870,1.5],[1000,1.0],[1002,1.0]]},
   {value:7.5,label:'7.5 dB · 4007233',points:[[52,7.0],[70,6.7],[86,6.5],[550,3.2],[600,2.9],[650,2.6],[750,2.1],[870,1.6],[1000,1.0],[1002,1.0]]},
   {value:9,label:'9 dB · 4007234',points:[[52,8.2],[70,7.9],[86,7.7],[550,3.6],[600,3.3],[650,3.0],[750,2.4],[870,1.7],[1000,1.0],[1002,1.0]]},
   {value:10.5,label:'10.5 dB · 4007235',points:[[52,9.4],[70,9.0],[86,8.8],[550,4.0],[600,3.7],[650,3.3],[750,2.6],[870,1.8],[1000,1.0],[1002,1.0]]},
   {value:12,label:'12 dB · 4007236',points:[[52,10.6],[70,10.2],[86,9.9],[550,4.5],[600,4.0],[650,3.6],[750,2.8],[870,1.9],[1000,1.0],[1002,1.0]]},
   {value:13.5,label:'13.5 dB · 4007237',points:[[52,11.8],[70,11.3],[86,11.0],[550,4.9],[600,4.4],[650,3.9],[750,3.1],[870,2.0],[1000,1.0],[1002,1.0]]},
   {value:15,label:'15 dB · 4007238',points:[[52,13.0],[70,12.5],[86,12.1],[550,5.3],[600,4.8],[650,4.3],[750,3.3],[870,2.2],[1000,1.0],[1002,1.0]]},
   {value:16.5,label:'16.5 dB · 4007239',points:[[52,14.2],[70,13.6],[86,13.2],[550,5.8],[600,5.2],[650,4.6],[750,3.5],[870,2.3],[1000,1.0],[1002,1.0]]},
   {value:18,label:'18 dB · 4007240',points:[[52,15.4],[70,14.8],[86,14.3],[550,6.2],[600,5.5],[650,4.9],[750,3.7],[870,2.4],[1000,1.0],[1002,1.0]]},
   {value:19.5,label:'19.5 dB · 4007241',points:[[52,16.6],[70,15.9],[86,15.4],[550,6.6],[600,5.9],[650,5.3],[750,4.0],[870,2.5],[1000,1.0],[1002,1.0]]},
   {value:21,label:'21 dB · 4007242',points:[[52,17.8],[70,17.1],[86,16.5],[550,7.1],[600,6.3],[650,5.6],[750,4.2],[870,2.6],[1000,1.0],[1002,1.0]]},
   {value:22.5,label:'22.5 dB · 4007243',points:[[52,19.5],[70,18.7],[86,18.1],[550,8.0],[600,7.2],[650,6.4],[750,4.9],[870,3.2],[1000,1.5],[1002,1.5]]},
   {value:24,label:'24 dB · 4007244',points:[[52,20.7],[70,19.9],[86,19.2],[550,8.4],[600,7.6],[650,6.7],[750,5.2],[870,3.4],[1000,1.5],[1002,1.5]]},
   {value:25.5,label:'25.5 dB · 4007245',points:[[52,21.9],[70,21.0],[86,20.3],[550,8.8],[600,7.9],[650,7.1],[750,5.4],[870,3.5],[1000,1.5],[1002,1.5]]},
   {value:27,label:'27 dB · 4007246',points:[[52,23.1],[70,22.2],[86,21.5],[550,9.3],[600,8.4],[650,7.4],[750,5.6],[870,3.6],[1000,1.5],[1002,1.5]]},
   {value:28.5,label:'28.5 dB · 4007247',points:[[52,24.3],[70,23.3],[86,22.6],[550,9.7],[600,8.7],[650,7.7],[750,5.8],[870,3.7],[1000,1.5],[1002,1.5]]},
   {value:30,label:'30 dB · 4007248',points:[[52,25.5],[70,24.5],[86,23.7],[550,10.1],[600,9.1],[650,8.0],[750,6.1],[870,3.8],[1000,1.5],[1002,1.5]]}
 ].map(Object.freeze));
 const GM_UNPUBLISHED=Object.freeze([Object.freeze({value:0,label:'0 dB jumper · 4007228 (no loss chart)',reason:'The 0 dB forward EQ jumper (4007228) has no published loss chart, so no pick can be computed from it. Set tilt by the procedure, or fit a charted EQ and re-measure.'})]);
 const gmGaps=['The 0 dB forward EQ jumper (4007228) has no published loss chart, so it is not offered and cannot be the installed EQ in a pick.','Forward inverse EQs (4007486–4007495) are left out: the two published loss charts disagree below 550 MHz.','870 MHz forward EQs (589260–589278) are for 870 MHz designs only and are left out.','Interstage EQs and interstage or output pads are factory parts and are not field adjustments.'];
 const PROFILES=Object.freeze([
  {id:'gainmaker-1g-system-amplifier',equipmentIds:['active_gm_hgd','active_gm_gan_hgd','active_gm_hgbt','active_gm_lgd_65'],
   title:'GainMaker 1 GHz system amplifier forward input pads and 1 GHz forward cable EQs',
   source:'Cisco, 1 GHz GainMaker Broadband Amplifier Platform System Amplifier Modules and Housings Installation and Operation Guide; Scientific-Atlanta, GainMaker Amplifier Accessories data sheet; value ranges also on the live cisco.com HGD, HGBT and LGD data sheets',
   revision:'OL-31156-01 (February 2014); 716336 Rev D (October 2005); data sheets 7006586 Rev D, 7006942 Rev C, 7006941 Rev A, 7006949 Rev A',
   locator:'OL-31156-01 p.7 accessories, pp.54–55 tilt then level, Appendix A p.96 EQ loss chart and pp.102–104 part numbers; 716336 pp.2 and 9',
   sourceStatus:'manufacturer-mirror',reviewedAt:'2026-11-11',
   pads:{values:GM_PADS,note:'0 to 20.5 dB in 0.5 dB steps (589693–589734). The accessories data sheet states that pad loss is flat across frequency.'},
   eqs:{axis:'linear',maxGapRatio:1.5,items:GM_EQS,unpublished:GM_UNPUBLISHED,note:'EQ value is the cable-equivalent loss at the top frequency; loss between published frequencies is interpolated linearly in MHz, never across the 86–550 MHz gap. The top column is headed 1000 MHz in the guide and 1002 MHz in data sheet 716336.'},
   procedure:{window:0.5,source:'GainMaker guide OL-31156-01 pp.54–55: move on when tilt and level are within ±0.5 dB of design'},
   gaps:[...gmGaps,'On a 65/86 LGD the chart’s only forward low point is 86 MHz, so a low pilot between 86 and 550 MHz gets no pick.','The guide’s live Cisco link now redirects; its text was read from a cached copy and agrees with two mirrors. No model-specific GaN 42/54 data sheet was found; the guide’s accessories table covers all amplifier types it lists, including GaN.']},
  {id:'gainmaker-1g-line-extender',equipmentIds:['active_gm_le_manual','active_gm_le_thermal','active_gm_le_agc'],
   title:'GainMaker 1 GHz line extender forward input pads and 1 GHz forward cable EQs',
   source:'Cisco, 1 GHz GainMaker Broadband Amplifier Platform Line Extender Modules and Housings Installation and Operation Guide; Scientific-Atlanta, GainMaker Amplifier Accessories data sheet; value ranges also on the live cisco.com line extender data sheet',
   revision:'OL-31155-01 (May 2014); 716336 Rev D (October 2005); data sheet 7006590 Rev D',
   locator:'OL-31155-01 p.6 accessories and the forward balancing sections, technical information p.98 EQ loss chart (table-of-contents pages); 716336 pp.2 and 9',
   sourceStatus:'manufacturer-mirror',reviewedAt:'2026-11-11',
   pads:{values:GM_PADS,note:'0 to 20.5 dB in 0.5 dB steps (589693–589734). The accessories data sheet states that pad loss is flat across frequency.'},
   eqs:{axis:'linear',maxGapRatio:1.5,items:GM_EQS,unpublished:GM_UNPUBLISHED,note:'Same 1 GHz forward cable EQs and loss chart as the system amplifier guide.'},
   procedure:{window:0.5,source:'GainMaker line extender guide OL-31155-01, forward balancing sections: move on when tilt and level are within ±0.5 dB of design'},
   gaps:[...gmGaps,'The line extender guide was read from a third-party mirror; its page numbers come from its table of contents.']}
 ].map(Object.freeze));
 /* Models whose forward alignment is not done with sourced plug-in pad and EQ values.
    The card shows this instead of offering part values. */
 const aoi=split=>['active_aoi_hgd','active_aoi_hgbt','active_aoi_le'].map(id=>split?id+'_'+split:id);
 const NOTES=Object.freeze([
  {id:'aoi-quantum18-sa-electronic',equipmentIds:[...aoi(''),...aoi('85'),...aoi('396'),...aoi('492'),...aoi('684')].filter(id=>!/_le/.test(id)),
   text:'Quantum18 HGD and HGBT amplifiers align electronically. The QuantumLink Local app loads the amplifier’s downstream profile and runs a pilot-based auto-alignment; a manual alignment, if needed, changes the pilot levels in the app. No public AOI document lists plug-in forward pad or EQ values, so none are offered here.',
   source:'AOI, Quantum18 1.8GHz System Amplifier Installation and Operation Guide',revision:'V02102025, read from a ManualsLib mirror of AOI’s guide',locator:'Section 3, Balancing and Setup, printed pages 37–49',sourceStatus:'manufacturer-mirror',reviewedAt:'2026-11-11'},
  {id:'aoi-quantum18-le',equipmentIds:aoi('').concat(aoi('85'),aoi('396'),aoi('492'),aoi('684')).filter(id=>/_le/.test(id)),
   text:'The Quantum18 LE datasheet describes onboard electronic control through the wireless module. No public LE installation guide or forward pad and EQ value list was found, so none are offered here. Follow AOI’s procedure for the installed LE.',
   source:'AOI, Datasheet Quantum18 LE 1.8GHz Line Extender (Spanish edition)',revision:'v09052024',locator:'Page 1, advanced electronic control and monitoring',sourceStatus:'manufacturer-primary',reviewedAt:'2026-11-11'},
  {id:'aoi-quantum18-ba',equipmentIds:['active_aoi_ba'],padAdvice:true,padValues:Object.freeze([0,2,4,6]),
   text:'The Quantum18 BA ships with a 0 dB pad installed, and 2, 4 and 6 dB pads are stored in the lid for gain adjustment. No EQ values were found, so tilt is not adjusted with a plug-in EQ here and no part pick is offered. Change the pad in its 2 dB steps and re-measure.',
   source:'AOI, Datasheet Quantum18 BA 1.8GHz Booster Amplifier (English edition, Internet Archive copy of AOI’s file; the live Spanish edition omits the pad list)',revision:'v08302024 (preliminary)',locator:'Page 2, forward path performance table, notes beside minimum gain',sourceStatus:'manufacturer-mirror',reviewedAt:'2026-11-11'}
 ].map(Object.freeze));
 function noteFor(equipmentId){return NOTES.find(n=>n.equipmentIds.includes(equipmentId))||null;}
 const EPS=1e-9;
 const num=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const fail=error=>({ok:false,error});
 const z=v=>v===0?0:v;
 function profileFor(equipmentId){return PROFILES.find(p=>p.equipmentIds.includes(equipmentId))||null;}
 /* Loss of one EQ at one frequency, only inside its published points. */
 function eqLoss(eq,f,axis,maxGapRatio=Infinity){
  const p=eq?.points;if(!Array.isArray(p)||!p.length||!Number.isFinite(f))return null;
  if(f<p[0][0]-EPS||f>p[p.length-1][0]+EPS)return null;
  let i=0;while(i+1<p.length&&p[i+1][0]<=f+EPS)i++;
  if(Math.abs(f-p[i][0])<=EPS)return p[i][1];if(i+1===p.length)return null;
  if(p[i+1][0]/p[i][0]>maxGapRatio+EPS)return null;
  const t=x=>axis==='sqrt'?Math.sqrt(x):x;
  return p[i][1]+(p[i+1][1]-p[i][1])*(t(f)-t(p[i][0]))/(t(p[i+1][0])-t(p[i][0]));
 }
 function readings(input,band){
  const lowMHz=num(input.lowMHz),highMHz=num(input.highMHz),measuredLow=num(input.measuredLow),measuredHigh=num(input.measuredHigh),targetLow=num(input.targetLow),targetHigh=num(input.targetHigh);
  if(lowMHz===null||highMHz===null)return fail('Enter both pilot frequencies in MHz.');
  if(lowMHz<5||highMHz>1800||highMHz<=lowMHz)return fail('Use pilots with 5 ≤ low < high ≤ 1,800 MHz.');
  if(Array.isArray(band)&&band.length===2&&(lowMHz<band[0]||highMHz>band[1]))return fail(`Use pilots inside this model’s forward band, ${band[0]}–${band[1]} MHz.`);
  if(measuredLow===null||measuredHigh===null)return fail('Enter your readings at both pilots.');
  if(targetLow===null||targetHigh===null)return fail('Enter the station’s targets at both pilots.');
  if([measuredLow,measuredHigh,targetLow,targetHigh].some(v=>Math.abs(v)>200))return fail('Enter levels within ±200 dBmV.');
  const tiltMeasured=measuredHigh-measuredLow,tiltTarget=targetHigh-targetLow;
  return {ok:true,lowMHz,highMHz,measuredLow,measuredHigh,targetLow,targetHigh,errorLow:measuredLow-targetLow,errorHigh:measuredHigh-targetHigh,tiltMeasured,tiltTarget,tiltError:tiltMeasured-tiltTarget};
 }
 /* Direction a technician should move each control. Below 0.05 dB reads as on target at 0.1 dB resolution. */
 function guidance(r){
  const eq=Math.abs(r.tiltError)<0.05?'Tilt matches the target.':r.tiltError<0?`Tilt is ${Math.abs(r.tiltError).toFixed(1)} dB low: use a larger input EQ.`:`Tilt is ${r.tiltError.toFixed(1)} dB high: use a smaller input EQ.`;
  const pad=Math.abs(r.errorHigh)<0.05?'The high pilot matches its target.':r.errorHigh>0?`The high pilot is ${r.errorHigh.toFixed(1)} dB high: use about ${r.errorHigh.toFixed(1)} dB more input pad.`:`The high pilot is ${Math.abs(r.errorHigh).toFixed(1)} dB low: use about ${Math.abs(r.errorHigh).toFixed(1)} dB less input pad.`;
  return {eq,pad};
 }
 function pick(list,score,prefer){
  let best=null;
  for(const item of list){const s=score(item);if(s===null)continue;if(!best||s<best.s-EPS||(Math.abs(s-best.s)<=EPS&&prefer(item,best.item)))best={item,s};}
  return best?.item??null;
 }
 /* Full solve. options: {profile, pad, eq} with the installed pad and EQ values. */
 function solve(input,options={}){
  const r=readings(input,options.forwardBand);if(!r.ok)return r;
  const result={...r,guidance:guidance(r),catalog:null};
  const profile=options.profile;
  if(!profile){result.catalog={ok:false,error:'No sourced pad and EQ values for this model yet. Use the direction above, then re-measure.'};return result;}
  const pads=profile.pads.values,eqs=profile.eqs.items,axis=profile.eqs.axis,gap=profile.eqs.maxGapRatio??Infinity,loss=(e,f)=>eqLoss(e,f,axis,gap);
  const padNow=num(options.pad),eqNow=eqs.find(e=>num(options.eq)!==null&&Math.abs(e.value-num(options.eq))<=EPS);
  if(padNow===null||!pads.some(v=>Math.abs(v-padNow)<=EPS)){result.catalog={ok:false,error:'Choose the input pad that is installed now.'};return result;}
  const unpublished=(profile.eqs.unpublished||[]).find(u=>num(options.eq)!==null&&Math.abs(u.value-num(options.eq))<=EPS);
  if(unpublished){result.catalog={ok:false,error:unpublished.reason};return result;}
  if(!eqNow){result.catalog={ok:false,error:'Choose the input EQ that is installed now.'};return result;}
  const nowLow=loss(eqNow,r.lowMHz),nowHigh=loss(eqNow,r.highMHz);
  if(nowLow===null||nowHigh===null){result.catalog={ok:false,error:'The installed EQ’s published loss does not cover both pilots closely enough. No pick is offered outside the published frequencies or across a wide gap in them.'};return result;}
  // Step 1, manufacturer order: input EQ for tilt.
  const tiltAfter=e=>{const lo=loss(e,r.lowMHz),hi=loss(e,r.highMHz);return lo===null||hi===null?null:r.tiltMeasured-((hi-nowHigh)-(lo-nowLow));};
  const eq=pick(eqs,e=>{const t=tiltAfter(e);return t===null?null:Math.abs(t-r.tiltTarget);},(a,b)=>Math.abs(a.value-eqNow.value)<Math.abs(b.value-eqNow.value)-EPS||(Math.abs(Math.abs(a.value-eqNow.value)-Math.abs(b.value-eqNow.value))<=EPS&&a.value<b.value));
  const dLow=loss(eq,r.lowMHz)-nowLow,dHigh=loss(eq,r.highMHz)-nowHigh;
  // Step 2: input pad for level at the high pilot. A tie takes the larger pad (lower output).
  const idealPad=padNow+(r.measuredHigh-dHigh)-r.targetHigh;
  const pad=pick(pads,v=>Math.abs(v-idealPad),(a,b)=>a>b);
  const dPad=pad-padNow,afterLow=r.measuredLow-dLow-dPad,afterHigh=r.measuredHigh-dHigh-dPad;
  const notes=[];
  if(idealPad<Math.min(...pads)-0.05)notes.push(`The pad is at its smallest value and the high pilot is still ${(r.targetHigh-afterHigh).toFixed(1)} dB low. Check the input level and the station before going further.`);
  if(idealPad>Math.max(...pads)+0.05)notes.push(`The pad is at its largest value and the high pilot is still ${(afterHigh-r.targetHigh).toFixed(1)} dB high.`);
  const tiltLeft=(afterHigh-afterLow)-r.tiltTarget,edgeEq=eqs.indexOf(eq);
  if(Math.abs(tiltLeft)>=0.05&&tiltLeft<0&&edgeEq===eqs.length-1)notes.push(`The largest charted EQ is in and tilt is still ${Math.abs(tiltLeft).toFixed(1)} dB low.`);
  if(Math.abs(tiltLeft)>=0.05&&tiltLeft>0&&edgeEq===0)notes.push(`The smallest charted EQ is in and tilt is still ${tiltLeft.toFixed(1)} dB high.${profile.eqs.unpublished?.length?' The procedure’s next steps, the 0 dB jumper or a forward inverse EQ, have no usable loss chart here: fit one by the procedure and re-measure.':''}`);
  const win=profile.procedure?.window,postEqHigh=r.measuredHigh-dHigh-r.targetHigh,f1=v=>Math.abs(v).toFixed(1),dir=v=>v>0?'high':'low';
  const tiltNow=r.tiltMeasured-r.tiltTarget;
  const eqAdvice=eq.value===eqNow.value?`Keep the installed ${eqNow.value} dB input EQ: tilt is ${Math.abs(tiltNow)<0.05?'on target':f1(tiltNow)+' dB '+dir(tiltNow)}, and no charted EQ brings it closer.`:`Change the input EQ from ${eqNow.value} to ${eq.value} dB: tilt goes from ${f1(tiltNow)} dB ${dir(tiltNow)} to ${Math.abs(tiltLeft)<0.05?'on target':f1(tiltLeft)+' dB '+dir(tiltLeft)}.`;
  const padAdvice=(eq.value===eqNow.value?'The high pilot is ':'After the EQ change the high pilot is predicted ')+(Math.abs(postEqHigh)<0.05?'on target':f1(postEqHigh)+' dB '+dir(postEqHigh))+(pad===padNow?`: keep the installed ${padNow} dB input pad.`:`: change the input pad from ${padNow} to ${pad} dB.`);
  const inWindow=Number.isFinite(win)?Math.abs(tiltLeft)<=win+EPS&&Math.abs(afterHigh-r.targetHigh)<=win+EPS:null;
  result.catalog={ok:true,profileId:profile.id,advice:{eq:eqAdvice,pad:padAdvice,window:win??null,inWindow,windowSource:profile.procedure?.source||''},eq:{from:eqNow.value,to:eq.value,changeLow:z(-dLow),changeHigh:z(-dHigh)},pad:{from:padNow,to:pad,ideal:idealPad},after:{low:afterLow,high:afterHigh,tilt:afterHigh-afterLow},leftover:{low:afterLow-r.targetLow,high:afterHigh-r.targetHigh,tilt:tiltLeft},interpolated:[r.lowMHz,r.highMHz].some(f=>!eq.points.some(p=>Math.abs(p[0]-f)<=EPS)),notes};
  return result;
 }
 /* Structural check for a sourced profile; returns a list of problems. */
 function checkProfile(p){
  const problems=[];
  for(const k of ['id','title','source','revision','locator','sourceStatus','reviewedAt'])if(typeof p?.[k]!=='string'||!p[k].trim())problems.push('missing '+k);
  if(!Array.isArray(p?.equipmentIds)||!p.equipmentIds.length)problems.push('missing equipmentIds');
  const pads=p?.pads?.values;if(!Array.isArray(pads)||!pads.length||pads.some(v=>!Number.isFinite(v)||v<0)||pads.some((v,i)=>i&&v<=pads[i-1]))problems.push('pads must be ascending nonnegative numbers');
  const eqs=p?.eqs?.items;if(!['linear','sqrt'].includes(p?.eqs?.axis))problems.push('EQ interpolation axis must be linear or sqrt');
  if(p?.eqs?.maxGapRatio!==undefined&&!(p.eqs.maxGapRatio>1))problems.push('maxGapRatio must be above 1');
  if(!Array.isArray(eqs)||!eqs.length)problems.push('missing EQ values');
  else{if(eqs.some((e,i)=>!Number.isFinite(e.value)||(i&&e.value<=eqs[i-1].value)))problems.push('EQ values must ascend');for(const e of eqs){const pts=e.points;if(!Array.isArray(pts)||pts.length<2||pts.some((q,i)=>!Number.isFinite(q[0])||!Number.isFinite(q[1])||(i&&q[0]<=pts[i-1][0])))problems.push('EQ '+e.value+' needs ascending frequency/loss points');}}
  return problems;
 }
 return {PROFILES,NOTES,profileFor,noteFor,eqLoss,readings,guidance,solve,checkProfile};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Alignment;
