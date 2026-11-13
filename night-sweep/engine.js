/* Pure calculation engine; all levels dBmV, loss dB, frequency MHz, length ft. */
const HFC = (() => {
 const number = x => (typeof x==='number'||typeof x==='string') && String(x).trim()!=='' && Number.isFinite(Number(x)) ? Number(x) : null;
 function curveValue(c,f,axis='linear') {
  if(!c||!Number.isFinite(f)||f<c.min||f>c.max)return null;
  if(c.bands){
   // Printed integer-MHz ranges include their upper endpoint. At a shared
   // endpoint the next band wins, preserving the established convention.
   const b=c.bands.find((b,i)=>f>=b[0]&&(f<b[1]||(f===b[1]&&c.bands[i+1]?.[0]!==f)));
   if(b)return b[2];
   // Only explicitly qualified curves may budget a fractional printed gap.
   // This is the larger adjacent bound, not interpolation or extrapolation.
   if(c.gapPolicy==='adjacent-maximum'){
    const i=c.bands.findIndex((b,i)=>f>b[1]&&i+1<c.bands.length&&f<c.bands[i+1][0]);
    if(i>=0)return Math.max(c.bands[i][2],c.bands[i+1][2]);
   }
   return null;
  }
  const p=c.points;if(!p?.length)return null;
  if(f<p[0][0]||f>p[p.length-1][0])return null;
  let i=0;while(i+1<p.length&&p[i+1][0]<=f)i++;
  if(f===p[i][0])return p[i][1];if(i+1===p.length)return null;
  const t=x=>axis==='sqrt'?Math.sqrt(x):x;
  return number(p[i][1]+(p[i+1][1]-p[i][1])*(t(f)-t(p[i][0]))/(t(p[i+1][0])-t(p[i][0])));
 }
 function parseTable(text,cols) {
  const rows=String(text||'').trim().split(/\n/).filter(x=>x.trim()).map(x=>x.trim().split(/[;,\s]+/).map(number));
  if(rows.length<2)return {error:'Enter at least two frequency rows.'};
  if(rows.some(r=>r.length!==cols||r.some(x=>x===null)||r[0]<=0||r.slice(1).some(x=>x<0)))return {error:`Use ${cols} numbers per row; frequency > 0 and losses ≥ 0.`};
  rows.sort((a,b)=>a[0]-b[0]);if(rows.some((r,i)=>i&&r[0]===rows[i-1][0]))return {error:'Duplicate frequencies are not allowed.'};
  return {rows};
 }
 function launchAt(s,f) {
  if(!s||!Number.isFinite(f)||f<5||f>1800)return null;
  if(!['sqrt','linear','table'].includes(s.launchMode))return null;
  if(s.launchMode==='table'){
   const r=String(s.launchTable||'').trim().split(/\n/).filter(x=>x.trim()).map(x=>x.trim().split(/[;,\s]+/).map(number)).sort((a,b)=>a[0]-b[0]);
   if(r.length<2||r.some((x,i)=>x.length!==2||x.some(v=>v===null)||x[0]<5||x[0]>1800||(i&&x[0]===r[i-1][0])))return null;
   return curveValue({min:r[0][0],max:r.at(-1)[0],points:r},f);
  }
  const [a,b,la,lb]=[s.lowF,s.highF,s.lowLevel,s.highLevel].map(number);
  if([a,b,la,lb].includes(null)||a<5||b>1800||b<=a)return null;
  if(!s.extendLaunch&&(f<a||f>b))return null;
  const t=x=>s.launchMode==='sqrt'?Math.sqrt(x):x;
  return number(la+(lb-la)*(t(f)-t(a))/(t(b)-t(a)));
 }
 function portsFor(device,row) {
  if(device?.custom)return row.terminal?[{id:'tap',label:'Each tap port',role:'tap'}]:[{id:'through',label:'OUT / through',role:'through'},{id:'tap',label:device.custom==='tap'?'Each tap port':'TAP / branch',role:device.custom==='tap'?'tap':'branch'}];
  if(device?.id==='active_gm_hgd')return [{id:'through',label:'Main',role:'through'},{id:'aux',label:'Auxiliary',role:'output'},{id:'third',label:'Optional signal director output',role:'output'}];
  if(device?.id==='active_gm_hgbt')return [{id:'through',label:'Main',role:'through'},{id:'output2',label:'Output 2',role:'output'},{id:'output3',label:'Output 3',role:'output'}];
  return device?.ports||[];
 }
 function selectedCurve(port,basis){return basis==='max'?port.maximum:(port.nominal||port.maximum);}
 function passiveAt(device,port,row,f,basis) {
  if(device.id==='none')return 0;
  if(device.custom){
   const t=parseTable(row.customLoss,row.terminal?2:3);if(t.error)return null;
   const col=row.terminal?1:port.id==='through'?1:2;
   return curveValue({min:t.rows[0][0],max:t.rows.at(-1)[0],points:t.rows.map(r=>[r[0],r[col]])},f);
  }
  return curveValue(selectedCurve(port,basis),f);
 }
 // Active reference specifications are deliberately not used as a flat RF response.
 // Enter a measured/configured net gain profile for the selected output and band.
 function activeGainAt(device,row,f) {
  if(!device?.active||!Number.isFinite(f)||f<5||f>1800)return null;
  const lower=number(device.activeMinF??device.publishedGain?.forwardBand?.[0]??device.publishedGain?.min),upper=number(device.activeMaxF??device.publishedGain?.forwardBand?.[1]??device.publishedGain?.max);
  if((lower!==null&&f<lower)||(upper!==null&&f>upper))return null;
  const mode=row.activeMode||'anchors';
  if(mode==='table'){
   const rows=String(row.activeGainTable||'').trim().split(/\n/).filter(x=>x.trim()).map(x=>x.trim().split(/[;,\s]+/).map(number)).sort((a,b)=>a[0]-b[0]);
   if(rows.length<2||rows.some((r,i)=>r.length!==2||r.some(v=>v===null)||r[0]<5||r[0]>1800||(i&&r[0]===rows[i-1][0])))return null;
   return curveValue({min:rows[0][0],max:rows.at(-1)[0],points:rows},f);
  }
  if(mode==='flat'){
   const [gain,min,max]=[row.activeGain,row.activeMinF,row.activeMaxF].map(number);
   return [gain,min,max].includes(null)||min<5||max>1800||max<=min||f<min||f>max?null:gain;
  }
  if(mode!=='anchors')return null;
  const [low,high,min,max]=[row.gainLow,row.gainHigh,row.gainLowF,row.gainHighF].map(number);
  if([low,high,min,max].includes(null)||min<5||max>1800||max<=min)return null;
  return curveValue({min,max,points:[[min,low],[max,high]]},f);
 }
 function spanLength(row) {
  const length=number(row.length),slack=number(row.slack??0);
  return length===null||length<0||slack===null||slack<0?null:number(length+slack);
 }
 // A point is at the END of its incoming cable. Parallel branches are never added.
 function routeDistances(state,catalog) {
  const rows=[],byId=new Map(),errors=[],sourceRows=Array.isArray(state?.rows)?state.rows:[];
  const counts=new Map();for(const row of sourceRows)counts.set(row?.id,(counts.get(row?.id)||0)+1);
  sourceRows.forEach((row,index)=>{
   const id=row?.id,length=number(row?.length),slack=number(row?.slack??0),span= row?spanLength(row):null;
   let error='',parentId=null,start=null;
   if(typeof id!=='string'||!id||counts.get(id)!==1)error='Route point IDs must be present and unique.';
   else if(span===null)error='Enter a nonnegative span length and slack.';
   if(row?.parent==='source')start=0;
   else{
    const parent=rows.find(p=>typeof row?.parent==='string'&&row.parent.startsWith(p.id+'::'));
    const parentDevice=parent&&catalog?.devices?.find(d=>d.id===parent.row.device);
    if(!parent||parent.error||!portsFor(parentDevice,parent.row).some(p=>row.parent===parent.id+'::'+p.id))error=error||'Choose a valid output on an earlier route point.';
    else {parentId=parent.id;start=parent.end;}
   }
   if(!error&&start!==null&&!Number.isFinite(start+span))error='Combined route distance exceeds the usable numeric range.';
   const result={id,row,index,parentId,length,slack,spanLength:span,start:error?null:start,end:error||start===null?null:start+span,error};
   rows.push(result);if(typeof id==='string')byId.set(id,result);if(error)errors.push({id,error});
  });
  return {rows,byId,errors};
 }
 // TDR distance is already one-way. Do not halve a displayed distance.
 // Optional VF correction applies once, then a known physical lead length is removed.
 function tdrLocate(state,catalog,options={}) {
  const fail=(error,extra={})=>({ok:false,error,...extra});
  const direction=options.direction??'forward';
  if(!['forward','reverse'].includes(direction))return fail('Choose forward or reverse TDR direction.');
  const distances=routeDistances(state,catalog),endpoint=options.endpoint??state?.rows?.at(-1)?.id,end=distances.byId.get(endpoint);
  if(!end||end.error)return fail(end?.error||'Choose a valid route endpoint.');
  const chain=[];let current=end;while(current){chain.unshift(current);current=current.parentId?distances.byId.get(current.parentId):null;}
  const start=options.start??(direction==='reverse'?endpoint:'source');
  const origin=start==='source'?null:chain.find(r=>r.id===start);
  if(start!=='source'&&!origin)return fail('The TDR origin must lie on the selected endpoint path.');
  const distance=number(options.distance),lead=number(options.lead??0);
  if(distance===null||distance<0||lead===null||lead<0)return fail('Enter nonnegative TDR distance and lead length.');
  const present=x=>x!==undefined&&x!==null&&String(x).trim()!=='';
  const hasSet=present(options.setVF),hasActual=present(options.actualVF);
  let factor=1;
  if(hasSet||hasActual){
   const setVF=number(options.setVF),actualVF=number(options.actualVF);
   if(!hasSet||!hasActual||setVF===null||actualVF===null||setVF<=0||setVF>1||actualVF<=0||actualVF>1)return fail('Enter both velocity factors as fractions above 0 and at most 1.');
   factor=actualVF/setVF;
  }
  const correctedDistance=distance*factor,pathDistance=correctedDistance-lead,originDistance=origin?.end??0,total=end.end;
  if(![factor,correctedDistance,pathDistance,originDistance,total].every(Number.isFinite))return fail('TDR correction exceeds the usable numeric range.');
  if(pathDistance< -1e-8)return fail('The TDR event is inside the entered test lead.',{correctedDistance,pathDistance});
  const target=originDistance+(direction==='forward'?1:-1)*Math.max(0,pathDistance);
  if(!Number.isFinite(target))return fail('TDR location exceeds the usable numeric range.');
  const base={correctedDistance,pathDistance:Math.max(0,pathDistance),originDistance,total,routeDistance:target,chain};
  if(target< -1e-8||target>total+1e-8)return fail('The TDR distance extends beyond the selected route.',base);
  // Endpoint devices have no modeled internal cable distance. Reconnect the TDR
  // on the relevant cable side of an active; do not infer continuity through it.
  // Chain order distinguishes a different zero-span active at the origin's
  // coordinate from the selected origin itself. Distance alone cannot do that.
  const originIndex=origin?chain.indexOf(origin):-1;
  const barrier=chain.find((r,i)=>catalog?.devices?.find(d=>d.id===r.row.device)?.active&&
   (direction==='forward'?i>originIndex&&r.end<target-1e-8:i<originIndex&&r.end>target+1e-8));
  if(barrier)return fail('An active lies between the TDR origin and event. Start a new cable section at that active.',{...base,barrier:barrier.id});
  // Reaching the source or an exact point is a boundary, not a made-up fault span.
  const at=Math.max(0,Math.min(total,target)),boundaryIds=chain.filter(r=>Math.abs(r.end-at)<1e-8).map(r=>r.id);
  if(Math.abs(at)<1e-8)boundaryIds.unshift('source');
  const possible=chain.filter(r=>r.spanLength>0&&at>=r.start-1e-8&&at<=r.end+1e-8);
  const hit=direction==='forward'?possible[0]:possible.at(-1);
  if(!hit)return {ok:true,error:'',...base,routeDistance:at,spanId:null,offsetFromStart:0,offsetFromEnd:0,boundary:true,boundaryIds};
  return {ok:true,error:'',...base,routeDistance:at,spanId:hit.id,offsetFromStart:Math.max(0,Math.min(hit.spanLength,at-hit.start)),offsetFromEnd:Math.max(0,Math.min(hit.spanLength,hit.end-at)),boundary:boundaryIds.length>0,boundaryIds};
 }
 function cableAt(cable,row,f,temperature=68){
  if(!Number.isFinite(f)||f<5||f>1800)return null;
  const checkedTemp=number(temperature);if(checkedTemp===null||checkedTemp< -40||checkedTemp>185)return null;
  const length=spanLength(row);if(length===null)return null;if(length===0)return 0;
  if(row.cable==='custom'){
   const t=parseTable(row.customCable,2);if(t.error)return null;
   const v=curveValue({min:t.rows[0][0],max:t.rows.at(-1)[0],points:t.rows},f,'sqrt');return v===null?null:number(v*length/100);
  }
  const temp=number(temperature);if(temp===null||temp< -40||temp>185)return null;
  const v=curveValue(cable?.curve,f,'sqrt');return v===null?null:number(v*length/100*(1+.001*(temp-68)));
 }
 function run(state,catalog,frequency) {
  const s=state.setup,temp=number(s.temperature??68),live=number(s.liveMax),lo=number(s.lowF),hi=number(s.highF);
  const sourceConfig=lo!==null&&hi!==null&&lo>=5&&hi<=1800&&hi>lo&&['sqrt','linear','table'].includes(s.launchMode)&&
   (s.launchMode==='table'?launchAt(s,number(String(s.launchTable||'').trim().split(/[;,\s]+/)[0]))!==null:number(s.lowLevel)!==null&&number(s.highLevel)!==null);
  const validSetup=sourceConfig&&temp!==null&&temp>=-40&&temp<=185&&['nominal','max'].includes(s.basis)
   && (s.liveMax===undefined||(live!==null&&live>=5&&live<=1800));
  const launchReason=state.mapLaunch&&state.mapLaunch.confirmed!==true?'Map launch and selected output port are unverified.':'',source=validSetup&&!launchReason?launchAt(s,frequency):null,results=[],byKey=new Map();
  const validLoss=validSetup&&Number.isFinite(frequency)&&frequency>=5&&frequency<=1800;
  byKey.set('source',{level:source,loss:validLoss&&!launchReason?0:null,blockedReason:launchReason});
  for(const row of state.rows){
   const d=catalog.devices.find(d=>d.id===row.device),c=catalog.cables.find(c=>c.id===row.cable),parent=byKey.get(row.parent);
   const m=row.mapImport, modelMismatch=m&&(!d||d.id==='none'||(m.kind==='active'&&!d.active)||(m.kind==='passive'&&d.active)), mapReason=m?(m.status==='absent'?'Equipment is marked absent.':m.status==='proposed'?'Proposed equipment is not installed.':modelMismatch?'Installed model is missing or does not match the map equipment type.':m.status==='draft'||m.connectionConfirmed!==true?'Map connection or span is unverified.':d?.active&&m.modelConfirmed!==true?'Installed model is unverified.':m.reasons?.length&&!m.reviewResolved?m.reasons.join(' '):''):(row.modelUnverified?'Installed model is unverified.':'');
   const blockedReason=mapReason||parent?.blockedReason||'';
   const cableLoss=cableAt(c,row,frequency,state.setup.temperature??68),valid=parent&&parent.level!==null&&cableLoss!==null&&!blockedReason;
   const input=valid?number(parent.level-cableLoss):null,inputLoss=!blockedReason&&parent&&parent.loss!==null&&cableLoss!==null?number(parent.loss+cableLoss):null;
   const gain=d?.active?activeGainAt(d,row,frequency):null,outputLoss=d?.active?number(row.outputLoss??0):null;
   const outputs=portsFor(d,row).map(p=>{const leg=p.id==='through'?null:row.workbench?.legGain?.[p.id],legRow=p.id==='through'?row:{...row,activeMode:'anchors',gainLowF:leg?.lowF,gainHighF:leg?.highF,gainLow:leg?.low,gainHigh:leg?.high},portGain=d?.active?activeGainAt(d,legRow,frequency):null,portLoss=d?.active?number(p.id==='through'?(row.outputLoss??0):(leg?.loss??0)):null;const pl=d?.active?(portGain===null||portLoss===null||portLoss<0?null:number(portLoss-portGain)):d?passiveAt(d,p,row,frequency,state.setup.basis):null;const level=input===null||pl===null?null:number(input-pl),loss=inputLoss===null||pl===null?null:number(inputLoss+pl);const portReason=blockedReason||(d?.active&&portGain===null?'Operating gain unavailable for '+p.label+' at '+frequency+' MHz.':'');const out={...p,key:row.id+'::'+p.id,level,loss,blockedReason:portReason,passiveLoss:d?.active?null:pl,activeGain:portGain,outputLoss:portLoss,netLoss:pl};byKey.set(out.key,out);return out;});
   const inputOut={key:row.id+'::input',label:d?.active?'Active input':'Passive input',role:'input',level:input,loss:inputLoss};
   results.push({id:row.id,input:inputOut,cableLoss,outputs,orphan:!parent,device:d,blockedReason});
  }
  return {source,results,byKey};
 }
 // Gain feasibility is independent of a manufacturer's distortion/output rating.
 // Configured gains establish gain headroom; a published scalar is screening only.
 function gainBudget(state,catalog,options={}) {
  const row=state?.rows?.find(r=>r.id===options.rowId),device=row&&catalog?.devices?.find(d=>d.id===row.device);
  const fail=error=>({status:'invalid',gainStatus:'invalid',assessmentStatus:'invalid',outputStatus:'unknown',error,low:null,high:null,publishedReference:null,referenceHighMargin:null});
  if(!row||!device?.active)return fail('Choose an active route point for the gain check.');
  const reserve=number(options.reserve??row.reserve??3),outputLoss=number(row.outputLoss??0);
  if(reserve===null||reserve<0)return fail('Enter a nonnegative gain reserve.');
  if(outputLoss===null||outputLoss<0)return fail('Enter a nonnegative selected-output loss.');
  const lowF=number(state.setup?.lowF),highF=number(state.setup?.highF);
  if(lowF===null||highF===null||lowF<5||highF>1800||highF<=lowF)return fail('Enter valid low and high route frequencies.');
  const warnings=[],bands={};
  const present=x=>x!==undefined&&x!==null&&String(x).trim()!=='';
  for(const [key,frequency,targetField,limitField,setupField] of [['low',lowF,'targetLow','outputLimitLow','lowLevel'],['high',highF,'targetHigh','outputLimitHigh','highLevel']]){
   const target=number(options[targetField]??row[targetField]??(state.setup.companyTargetProfile?null:state.setup[setupField])),limitRaw=options[limitField]??row[limitField],outputLimit=number(limitRaw);
   if(target===null&&state.setup.companyTargetProfile)warnings.push(`${key==='low'?'Low':'High'} amplifier target unknown. Enter the station's independent design target; the company node launch does not supply amplifier targets.`);
   if(present(limitRaw)&&outputLimit===null)return fail('Enter a numeric output limit or leave it blank.');
   const result=(options.routeResults?.[key]||run(state,catalog,frequency)).results.find(r=>r.id===row.id),input=result?.input.level??null,availableGain=activeGainAt(device,row,frequency);
   if(result?.blockedReason&&!warnings.includes(result.blockedReason))warnings.push(result.blockedReason);
   const requiredGain=input===null||target===null?null:number(target+outputLoss-input);
   const margin=requiredGain===null||availableGain===null?null:number(availableGain-requiredGain);
   const predictedOutput=input===null||availableGain===null?null:number(input+availableGain-outputLoss);
   bands[key]={frequency,input,target,outputLoss,requiredGain,availableGain,margin,predictedOutput,outputLimit,targetLimitMargin:outputLimit===null||target===null?null:number(outputLimit-target),predictedLimitMargin:outputLimit===null||predictedOutput===null?null:number(outputLimit-predictedOutput)};
   if(requiredGain!==null&&requiredGain<0)warnings.push(`${key==='low'?'Low':'High'} target is below the signal at the active input after output loss; attenuation or a lower gain setting is needed.`);
  }
  const margins=[bands.low.margin,bands.high.margin],complete=margins.every(Number.isFinite),minimumMargin=complete?Math.min(...margins):null;
  const gainStatus=!complete?'missing':minimumMargin< -1e-8?'shortfall':minimumMargin+1e-8<reserve?'marginal':'enough';
  const aboveTargetLimit=Object.values(bands).some(b=>b.targetLimitMargin!==null&&b.targetLimitMargin< -1e-8),aboveConfiguredLimit=Object.values(bands).some(b=>b.predictedLimitMargin!==null&&b.predictedLimitMargin< -1e-8);
  const limitsKnown=Object.values(bands).every(b=>b.outputLimit!==null&&b.target!==null&&b.predictedOutput!==null&&b.targetLimitMargin!==null&&b.predictedLimitMargin!==null);
  const outputStatus=aboveTargetLimit||aboveConfiguredLimit?'above_limit':limitsKnown?'within_limits':'unknown';
  const referenceGain=number(device.publishedGain?.forward),referenceFrequency=number(device.publishedGain?.referenceFrequencyMHz??device.publishedGain?.referenceFrequency);
  const hardwareMin=number(device.activeMinF??device.publishedGain?.forwardBand?.[0]),hardwareMax=number(device.activeMaxF??device.publishedGain?.forwardBand?.[1]);
  const inHardwareBand=f=>(hardwareMin===null||f>=hardwareMin)&&(hardwareMax===null||f<=hardwareMax);
  const hardwareBandMatches=inHardwareBand(highF);
  const referenceHighMargin=referenceGain===null||bands.high.requiredGain===null||!hardwareBandMatches?null:number(referenceGain-bands.high.requiredGain);
  const publishedReference=referenceGain===null?null:{gain:referenceGain,frequency:referenceFrequency,comparedFrequency:highF,requiredGain:bands.high.requiredGain,margin:referenceHighMargin,frequencyMatches:referenceFrequency!==null&&Math.abs(referenceFrequency-highF)<1e-8,screeningOnly:true,hardwareBandMatches,frequencyLabel:'Published operational reference; frequency-specific gain unverified',hardwareBand:device.publishedGain?.forwardBand||null,conditions:device.publishedGain?.conditions||'',source:device.publishedGain?.source||device.source||'',note:'Published operating gain is a configuration-specific reference. This screening comparison does not verify gain at the selected frequency or actual output capability.'};
  const assessmentStatus=outputStatus==='above_limit'?'output_limit':gainStatus==='enough'?(outputStatus==='within_limits'?'enough':'gain_only'):gainStatus;
  if(!inHardwareBand(lowF)||!hardwareBandMatches)warnings.push('A route frequency is outside this active profile’s forward band. Select matching equipment or revise the route frequencies; no gain is extrapolated.');
  if(outputStatus==='unknown')warnings.push('Output limits are not fully entered. Gain headroom alone does not establish output or distortion capability.');
  if(aboveTargetLimit)warnings.push('Desired output exceeds an entered output limit.');
  if(aboveConfiguredLimit)warnings.push('Output predicted from the entered gain exceeds an entered output limit; reduce the configured gain or output target.');
  if(!complete)warnings.push('Enter valid gain at both route frequencies to assess configured gain headroom. Published gain is reference screening only.');
  return {status:gainStatus,gainStatus,assessmentStatus,outputStatus,error:'',rowId:row.id,reserve,minimumMargin,low:bands.low,high:bands.high,publishedReference,referenceHighMargin,aboveTargetLimit,aboveConfiguredLimit,warnings};
 }
 function grid(start,end,extra=[]){const a=number(start),b=number(end);if(a===null||b===null||a<5||b<=a||b>1800)return[];return [...new Set([a,b,...Array.from({length:121},(_,i)=>a+(b-a)*i/120),...extra.map(number).filter(x=>x!==null&&x>=a&&x<=b)])].sort((a,b)=>a-b);}
 function dcSegment(cable,row,temperatureF=68,resistanceAlpha=0.004){
  const length=spanLength(row),override=row.dcRate!==undefined&&row.dcRate!==null&&String(row.dcRate).trim()!=='';
  const rate=number(override?row.dcRate:cable?.dc?.loop_ohm_per_1000ft);
  const temp=number(temperatureF),alpha=number(resistanceAlpha),valid=temp!==null&&temp>=-40&&temp<=185&&alpha!==null&&alpha>=0&&alpha<=0.01;
  const factor=override?1:valid?1+alpha*(temp-68)*5/9:null;
  const rawResistance=!valid?null:length===null||length<0?null:length===0?0:rate===null||rate<=0?null:rate*length/1000*factor;
  const resistance=Number.isFinite(rawResistance)?rawResistance:null;
  return {rate,resistance,temperatureFactor:factor,basis:override?'User-entered loop resistance at actual temperature':(cable?.dc?.basis||'No published DC value')+(temp!==68?' · temperature-adjusted engineering estimate':''),source:override?'':cable?.dc?.source_url||''};
 }
 function dcRoute(state,catalog){
  const endpoint=state.setup.dcEndpoint||'last',last=endpoint==='last'?state.rows.at(-1)?.id:endpoint;
  const chain=[],seen=new Set();let id=last,error='';
  if(!id)error='Add cable rows to calculate a loop.';
  while(id){
   const index=state.rows.findIndex(r=>r.id===id),row=state.rows[index];
   if(!row||seen.has(id)){error='DC route has a missing point or cycle.';break;}
   seen.add(id);chain.unshift(row);
   if(row.parent==='source')break;
   const parentIndex=state.rows.findIndex(r=>row.parent.startsWith(r.id+'::')),parent=state.rows[parentIndex];
   const d=parent&&catalog.devices.find(d=>d.id===parent.device);
   if(!parent||parentIndex>=index||!portsFor(d,parent).some(p=>row.parent===parent.id+'::'+p.id)){error='DC route has a missing or invalid upstream port.';break;}
   id=parent.id;
  }
  const segments=chain.map(row=>({row,...dcSegment(catalog.cables.find(c=>c.id===row.cable),row)}));
  const finite=x=>Number.isFinite(x)?x:null;
  const cableResistance=error||segments.some(s=>s.resistance===null)?null:finite(segments.reduce((a,s)=>a+s.resistance,0));
  const extra=number(state.setup.dcExtra??0),current=number(state.setup.dcCurrent),total=cableResistance===null||extra===null||extra<0?null:finite(cableResistance+extra);
  const drop=total===null||current===null||current<0?null:finite(total*current);
  return {segments,cableResistance,total,drop,watts:drop===null?null:finite(drop*current),error};
 }
 function powerRun(power,catalog){
  const fail=error=>({ok:false,error,rows:[],supplyCurrent:null,sourceVA:null,wireWatts:null,loading:null,headroom:null,minVoltage:null,warnings:[]});
  if(!power||!Array.isArray(power.rows)||!power.rows.length)return fail('Add equipment or a junction to the power circuit.');
  if(power.rows.length>200)return fail('Use at most 200 points in one power circuit.');
  const supply=number(power.supplyVoltage),rating=number(power.supplyRating),temperatureF=number(power.temperatureF??68),resistanceAlpha=number(power.resistanceAlpha??0.004);
  if(temperatureF===null||temperatureF< -40||temperatureF>185)return fail('Enter a power-cable temperature from −40 to 185°F.');
  if(resistanceAlpha===null||resistanceAlpha<0||resistanceAlpha>0.01)return fail('Enter a resistance temperature coefficient from 0 to 0.01 per °C.');
  if(supply===null||supply<=0)return fail('Enter a positive supply output voltage.');
  if(power.supplyRating!==''&&power.supplyRating!==undefined&&power.supplyRating!==null&&(rating===null||rating<=0))return fail('Enter a positive supply current rating, or leave it blank.');
  const nodes=[],ids=new Set();
  for(const row of power.rows){
   if(!row||typeof row.id!=='string'||!row.id||ids.has(row.id))return fail('Power circuit point IDs must be unique.');
   const parent=row.parent==='supply'?-1:nodes.findIndex(n=>n.row.id===row.parent);
   if(row.parent!=='supply'&&parent<0)return fail('Choose an earlier power point or the supply for every connection.');
   const cable=catalog.cables.find(c=>c.id===row.cable),segment=dcSegment(cable,row,temperatureF,resistanceAlpha),extra=number(row.extraR??0);
   if(segment.resistance===null||extra===null||extra<0)return fail((row.name||row.id)+': cable length or loop resistance is missing / invalid.');
   const preset=(catalog.powerEquipment||[]).find(e=>e.id===row.equipment),mode=row.mode,value=number(row.load),pf=number(row.pf);
   if(!['curve','watts','va','amps'].includes(mode))return fail((row.name||row.id)+': choose a supported load mode.');
   let curve=null;
   if(mode==='curve'){
    const points=preset?.points;
    if(!Array.isArray(points)||points.length<2||points.some((p,i)=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<=0||p[1]<0||(i&&p[0]<=points[i-1][0])))return fail((row.name||row.id)+': no valid manufacturer current table for this selection.');
    curve={min:points[0][0],max:points.at(-1)[0],points};
   }else if(value===null||value<0)return fail((row.name||row.id)+': enter a nonnegative equipment load.');
   if(mode==='watts'&&(pf===null||pf<=0||pf>1))return fail((row.name||row.id)+': input power factor must be above 0 and at most 1.');
   const minV=number(row.minV),hasMin=row.minV!==''&&row.minV!==undefined&&row.minV!==null;
   if(hasMin&&(minV===null||minV<0))return fail((row.name||row.id)+': minimum equipment voltage must be nonnegative or blank.');
   nodes.push({row,parent,resistance:segment.resistance+extra,mode,value,pf,curve,preset,minV:hasMin?minV:number(preset?.min_voltage),basis:segment.basis});ids.add(row.id);
  }
  // Seed each tabulated load inside its published range. Cable drop can bring
  // equipment within range even when the source itself exceeds the table maximum.
  // Every subsequent current lookup, including the final result, stays bounded.
  let voltage=nodes.map(n=>n.curve?Math.max(n.curve.min,Math.min(n.curve.max,supply)):supply),own=[],section=[],converged=false;
  function currents(v){
   const a=nodes.map((n,i)=>n.mode==='curve'?curveValue(n.curve,v[i]):n.mode==='amps'?n.value:n.value/(v[i]*(n.mode==='watts'?n.pf:1)));
   if(a.some(x=>x===null||!Number.isFinite(x)||x<0))return null;
   const b=[...a];for(let i=nodes.length-1;i>=0;i--)if(nodes[i].parent>=0)b[nodes[i].parent]+=b[i];
   return {own:a,section:b};
  }
  for(let iteration=0;iteration<1000;iteration++){
   const c=currents(voltage);if(!c)return fail('Equipment voltage is outside a published current table. Choose an applicable model/table or use a documented manual load; tables are not extrapolated.');
   own=c.own;section=c.section;const next=[];
   for(let i=0;i<nodes.length;i++){const n=nodes[i];next[i]=(n.parent<0?supply:next[n.parent])-section[i]*n.resistance;if(!Number.isFinite(next[i])||next[i]<=0)return fail('No usable voltage solution at this supply voltage, cable resistance and load. Check circuit inputs and reduce loading or resistance.');}
   const delta=Math.max(...next.map((v,i)=>Math.abs(v-voltage[i])));
   voltage=next.map((v,i)=>(v+voltage[i])/2);
   if(delta<1e-7){voltage=next;converged=true;break;}
  }
  if(!converged)return fail('Power calculation did not converge to a stable voltage. Check circuit inputs; this loading may exceed the route’s voltage capability.');
  const final=currents(voltage);if(!final)return fail('Final voltage falls outside an equipment current table.');own=final.own;section=final.section;
  const warnings=[],rows=nodes.map((n,i)=>{
   const warn=[];if(n.minV!==null&&voltage[i]<n.minV)warn.push('Below equipment minimum '+n.minV+' V');
   if(number(n.preset?.max_voltage)!==null&&voltage[i]>number(n.preset.max_voltage))warn.push('Above published equipment voltage range');
   if(warn.length)warnings.push((n.row.name||n.row.id)+': '+warn.join('; '));
   return {id:n.row.id,name:n.row.name||n.row.id,voltage:voltage[i],deviceCurrent:own[i],sectionCurrent:section[i],resistance:n.resistance,drop:section[i]*n.resistance,wireWatts:section[i]*section[i]*n.resistance,warning:warn.join('; '),basis:n.basis};
  });
  const supplyCurrent=nodes.reduce((s,n,i)=>s+(n.parent<0?section[i]:0),0),wireWatts=rows.reduce((a,r)=>a+r.wireWatts,0);
  const sourceVA=supply*supplyCurrent,loading=rating===null?null:100*supplyCurrent/rating,headroom=rating===null?null:rating-supplyCurrent;
  if(![supplyCurrent,wireWatts,sourceVA,...rows.flatMap(r=>[r.voltage,r.deviceCurrent,r.sectionCurrent,r.resistance,r.drop,r.wireWatts]),...(rating===null?[]:[loading,headroom])].every(Number.isFinite))return fail('Power calculation exceeded the numeric range. Check voltage, resistance and load inputs.');
  if(rating!==null&&supplyCurrent>rating)warnings.push('Estimated output current exceeds the supply rating.');
  return {ok:true,error:'',rows,supplyCurrent,sourceVA,wireWatts,loading,headroom,minVoltage:Math.min(...voltage),warnings};
 }
 return {number,curveValue,parseTable,launchAt,portsFor,selectedCurve,passiveAt,activeGainAt,spanLength,routeDistances,tdrLocate,cableAt,run,gainBudget,grid,dcSegment,dcRoute,powerRun};
})();
if(typeof module!=='undefined')module.exports=HFC;
