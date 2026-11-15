import {EQUIPMENT,CABLES,PARTS,PADS,DIRECTORS,sampleAt,lookupPartLoss} from './catalog.mjs';
const finite=Number.isFinite;
const unknown=(fs)=>fs.map(f=>[f,null]);
const curve=value=>Array.isArray(value)?value:Array.isArray(value?.samples)?value.samples:[];
const frequenciesOf=s=>[...new Set(curve(s).filter(p=>Array.isArray(p)&&finite(p[0])&&p[0]>0).map(p=>p[0]))].sort((a,b)=>a-b);
const inBand=(m,f)=>m?.band&&f>=m.band[0]&&f<=m.band[1];
// Cache sorted interpolation indexes only for one evaluation, so edits cannot leave stale data.
function makeSampler(){
 const cache=new Map();
 return (samples,f)=>{
  if(!finite(f)||!Array.isArray(samples))return null;
  let p=cache.get(samples);
  if(!p){p=samples.filter(x=>Array.isArray(x)&&finite(x[0])).slice().sort((a,b)=>a[0]-b[0]);cache.set(samples,p);}
  let lo=0,hi=p.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(p[mid][0]<f)lo=mid+1;else hi=mid;}
  if(p[lo]?.[0]===f)return finite(p[lo][1])?p[lo][1]:null;
  if(lo===0||lo===p.length)return null;
  const a=p[lo-1],b=p[lo];return finite(a[1])&&finite(b[1])?a[1]+(b[1]-a[1])*(f-a[0])/(b[0]-a[0]):null;
 };
}
function makeExactSampler(){
 const cache=new Map();
 return (samples,f)=>{if(!Array.isArray(samples)||!finite(f))return null;let m=cache.get(samples);if(!m){m=new Map(samples.filter(p=>Array.isArray(p)&&finite(p[0])).map(p=>[p[0],finite(p[1])?p[1]:null]));cache.set(samples,m);}return m.get(f)??null;};
}
export function designLevel(split,f){
 if(!finite(f))return null;
 const [lo,hi,a,b]=split==='high'?[256,1800,34,49]:[57,753,31,43];
 return a+(b-a)*(f-lo)/(hi-lo);
}
function directorLoss(model,settings,port,f,sample=sampleAt){
 if(port==='main'||model.ports.length===1)return 0;
 // Numeric operator-entered losses take precedence over nominal director estimates.
 if(settings.directorLosses&&Object.hasOwn(settings.directorLosses,port))return finite(settings.directorLosses[port])?settings.directorLosses[port]:sample(curve(settings.directorLosses[port]),f);
 const d=DIRECTORS[settings.director];
 if(!d)return null;
 if(d.id.startsWith('digicomm-')&&settings.componentCompatibilityConfirmed!==true)return null;
 const key=settings.directorReversed?(port==='aux1'?'aux2':'aux1'):port;
 return d.lossCurves?.[key]?sample(d.lossCurves[key],f):d.losses[key]??null;
}
function gainAt(model,settings,f,sample=sampleAt){
 if(!inBand(model,f))return null;
 if(Array.isArray(settings.gainSamples))return sample(settings.gainSamples,f);
 if(finite(settings.availableGainDb))return settings.availableGainDb;
 if(!finite(model.gainDb))return null;
 // Datasheets give operational gain and internal tilt, not a measured transfer curve.
 // Linear frequency interpolation is an explicit planning estimate. Factory EQ stays fixed.
 const tilt=finite(model.internalTiltDb)?model.internalTiltDb:0;
 return model.gainDb-tilt*(model.band[1]-f)/(model.band[1]-model.band[0]);
}
function effectiveModel(model,settings){
 const mode=String(settings.mode||model?.mode||'').toLowerCase();
 const suffix=model?.id.match(/-(40|55|65|85)$/)?.[0]||'';
 if(model?.id.startsWith('gm-le-')&&EQUIPMENT['gm-le-'+mode+suffix])return EQUIPMENT['gm-le-'+mode+suffix];
 return model;
}
/** One common forward-input pad/EQ search across every physical output and sweep bin.
 * Published curve cells are exact table facts; gain shaping, interpolation, jumper
 * reference and nominal director losses are estimates. Inverse/reverse parts without
 * complete loss curves/procedures are references, never silently invented candidates.
 */
export function recommendParts(modelId,inputSamples,targetSamples,settings={}){
 const sampleAt=makeSampler(),exactAt=makeExactSampler();
 const model=effectiveModel(EQUIPMENT[modelId],settings),issues=[];
 const ports=model?.ports||['main'];
 const targetByPort=Object.fromEntries(ports.map(p=>[p,settings.targets?.[p]?curve(settings.targets[p]):curve(targetSamples).map(([f,v])=>{const loss=model?directorLoss(model,settings,p,f,sampleAt):null;return [f,finite(v)&&finite(loss)?v-loss:null];})]));
 const fs=[...new Set(ports.flatMap(p=>frequenciesOf(targetByPort[p])))].sort((a,b)=>a-b);
 const result={modelId,frequencies:fs,shared:null,outputs:Object.fromEntries(ports.map(p=>[p,unknown(fs)])),residuals:{},gainStatus:'unknown',shortfall:null,issues,targets:targetByPort,maxOutputStatus:'unknown',maxOutputDb:null,sourceStatus:'estimated',sources:model?.source?[model.source]:[]};
 if(!model||model.kind!=='active'){issues.push('Unknown or non-active equipment model.');return result;}
 const measured=Array.isArray(settings.gainSamples);
 issues.push('Maximum output capability is not established by the supplied gain reference; output headroom remains unknown.');
 if(model.family==='AOI')issues.push('Electronic adjustment range is unsupported; predicted values are an estimated gain ceiling, not a verified realizable gain setting.');
 if(!measured)issues.push(model.family==='AOI'?'Estimated flat operational gain ceiling; electronic alignment and actual frequency response require field verification.':'Estimated gain from published operational gain and fixed internal tilt; frequency-specific gain is not measured.');
 if(model.ports.length>1)issues.push('Auxiliary director attenuation uses nominal planning estimates unless measured director losses are supplied; applied once.');
 if(!fs.length){issues.push('No measured node-port target sweep.');return result;}
 const inputs=fs.map(f=>exactAt(curve(inputSamples),f));
 const gains=fs.map(f=>gainAt(model,settings,f,sampleAt));
 const losses=Object.fromEntries(ports.map(p=>[p,fs.map(f=>directorLoss(model,settings,p,f,sampleAt))]));
 const gm=model.family==='GainMaker';
 const family=settings.eqFamily||model.eqFamily;
 const declaredFamilies=['forward-cable-1p2g','digicomm-cable-1p2g','digicomm-linear-1p2g','digicomm-inverse-1p2g'];
 const operatorConfirmed=declaredFamilies.includes(family)&&settings.componentCompatibilityConfirmed===true;
 if(gm&&![model.eqFamily,'forward-cable-870'].includes(family)&&!operatorConfirmed){issues.push('Selected EQ family has no verified input-slot compatibility for this installed model; confirm the installed part/slot to use an operator-declared1.2GHz family.');return result;}
 result.compatibilityStatus=operatorConfirmed?'operator-confirmed':'manufacturer-procedure';
 if(operatorConfirmed)issues.push('1.2GHz part/slot compatibility is operator-confirmed, not established by the1GHz procedure; actual component insertion tables apply within the device band.');
 const padOptions=gm?PADS.map(p=>p.value):[0];
 const candidates=gm?Object.values(PARTS).filter(p=>p.familyId===family&&p.solverCandidate!==false&&(!Array.isArray(settings.candidateEqIds)||settings.candidateEqIds.includes(p.id))):[null];
 let best=null;
 for(const eq of candidates){
  // A 0 EQ is the published gain-reference installation, not an absolute zero-loss table.
  const eqLosses=fs.map(f=>!eq?0:f<eq.band[0]||f>eq.band[1]?null:eq.orderingValue===0?0:lookupPartLoss(eq.id,f).value);
  const common=fs.map((f,i)=>finite(inputs[i])&&finite(gains[i])&&finite(eqLosses[i])?inputs[i]+gains[i]+(gm&&!measured&&!finite(settings.availableGainDb)?model.referenceInputPadDb:0)-eqLosses[i]:null);
  const terms=[];
  for(const p of ports)for(let i=0;i<fs.length;i++){
   const t=exactAt(targetByPort[p],fs[i]);
   if(finite(common[i])&&finite(losses[p][i])&&finite(t))terms.push(common[i]-losses[p][i]-t);
  }
  if(!terms.length)continue;
  const min=Math.min(...terms),max=Math.max(...terms),sum=terms.reduce((a,b)=>a+b,0),sumSq=terms.reduce((a,b)=>a+b*b,0);
  for(const pad of padOptions){
   const worst=Math.max(Math.abs(min-pad),Math.abs(max-pad));
   const score=Math.max(0,(sumSq-2*pad*sum)/terms.length+pad*pad);
   const changes=(finite(settings.inputPadDb)&&settings.inputPadDb!==pad?1:0)+(settings.eqPartId&&settings.eqPartId!==eq?.id?1:0);
   if(!best||worst<best.worst-1e-9||Math.abs(worst-best.worst)<=1e-9&&(score<best.score-1e-9||Math.abs(score-best.score)<=1e-9&&changes<best.changes))best={eq,pad,worst,score,changes,common};
  }
 }
 if(!best){issues.push('Missing input, target, gain, equipment-band coverage or compatible component loss data.');return result;}
 const mode=String(settings.mode||model.mode||'').toLowerCase();
 let agcRaw=null,agcPad=null;
 if(mode==='agc'&&gm){
  const pilot=finite(settings.pilotMHz)?settings.pilotMHz:null;
  const level=pilot===null?null:exactAt(targetByPort.main,pilot);
  if(finite(level)){
   agcRaw=level-model.agcOffsetDb;
   if(agcRaw>=0&&agcRaw<=20.5)agcPad=PADS.reduce((a,b)=>Math.abs(b.value-agcRaw)<Math.abs(a.value-agcRaw)?b:a).value;
   else issues.push('AGC pilot pad requirement is outside the 0–20.5 dB parts range.');
  }else issues.push('Select an AGC pilot within the measured target sweep to calculate its pad.');
 }
 result.shared={eqFamily:family,componentCompatibilityConfirmed:operatorConfirmed,compatibilityStatus:result.compatibilityStatus,inputPadDb:best.pad,inputPadPartNumber:gm?PADS.find(p=>p.value===best.pad)?.partNumber:null,eqPartId:best.eq?.id||null,eqPartNumber:best.eq?.partNumber||null,eqNominalDb:best.eq?.nominalDb??null,factoryEqDb:model.factoryEqDb??null,agcPadDb:agcPad,agcPadRawDb:agcRaw,agcOffsetDb:model.agcOffsetDb??null,director:settings.director||null};
 let maxShortfall=0,maxOvershoot=0,valid=0,missing=0;
 for(const p of ports){
  result.outputs[p]=fs.map((f,i)=>[f,finite(best.common[i])&&finite(losses[p][i])?best.common[i]-best.pad-losses[p][i]:null]);
  result.residuals[p]=fs.map((f,i)=>{
   const t=exactAt(targetByPort[p],f),actual=result.outputs[p][i][1];
   if(!finite(t)||!finite(actual)){missing++;return [f,null];}
   valid++;maxShortfall=Math.max(maxShortfall,t-actual);maxOvershoot=Math.max(maxOvershoot,actual-t);return [f,actual-t];
  });
 }
 result.shortfall=valid?maxShortfall:null;
 result.rmseDb=Math.sqrt(best.score);
 result.maxErrorDb=best.worst;
 result.overshoot=valid?maxOvershoot:null;
 result.gainStatus=!valid?'unknown':maxShortfall>1e-6?'insufficient':maxOvershoot>1e-6?'adjustment-limited':missing?'partial':'supported';
 if(maxOvershoot>1e-6)issues.push(`Realizable parts leave up to ${maxOvershoot.toFixed(2)} dB excess output; this is not a matched unity setting.`);
 if(missing)issues.push('Some sweep bins or outputs remain unknown; no extrapolation beyond supported bands.');
 if(maxShortfall>1e-6)issues.push(`Best shared parts remain ${maxShortfall.toFixed(2)} dB below target at the worst output/bin; propagate this supported output.`);
 if(best.eq)result.sources.push(best.eq.source);
 result.assumptions=['Entered gainSamples are a measured reference transfer with input pad0 and EQ0; do not enter a transfer that already includes candidate pad/EQ losses.','Factory interstage EQ is fixed and already included in operational gain.','Common pad and EQ minimize worst absolute error, then squared error, then installed part changes; remaining ties use catalog order.','0 dB EQ uses the operational-gain reference installation; it is not a published absolute zero-loss curve.','Nonzero EQ loss is interpolated from actual published insertion-loss cells.','Legacy1GHz inverse parts have no loss curves; documentedDigicomm1.2 inverse curves can be used only after installed-slot confirmation.'];
 return result;
}
/** Forward cascade uses the full corrected sweep from each originating physical node port.
 * Measurements override only the specified port. Targets follow the source port through
 * the topology; active output always propagates the supported curve, never the target.
 */
export function evaluateRoute(job){
 const sampleAt=makeSampler(),exactAt=makeExactSampler();
 const nodes=Array.isArray(job?.nodes)?job.nodes:[],edges=Array.isArray(job?.edges)?job.edges:[];
 const issues=[],stations={},byId=new Map(nodes.map(n=>[n.id,n]));
 const sweepFor=(n,p)=>curve(job?.portSweeps?.[`${n.id}::${p}`]||n.readings?.[p]?.after||n.readings?.[p]?.before||n.readings?.[p]);
 const sourceNodes=nodes.filter(n=>n.kind==='node');
 const fs=[...new Set(sourceNodes.flatMap(n=>{
  const ports=new Set([...(EQUIPMENT[n.modelId]?.ports||[]),...Object.keys(n.readings||{}),...Object.keys(job?.portSweeps||{}).filter(k=>k.startsWith(`${n.id}::`)).map(k=>k.slice(n.id.length+2))]);
  return [...ports].flatMap(p=>frequenciesOf(sweepFor(n,p)));
 }))].sort((a,b)=>a-b);
 const pending=new Set(),finished=new Set(),baselines={};
 function visit(id){
  if(finished.has(id))return stations[id];
  const n=byId.get(id);if(!n)return null;
  const model=EQUIPMENT[n.modelId],ports=model?.ports||['main'];
  if(pending.has(id)){issues.push(`Cycle at ${id}; feed unresolved.`);return null;}
  pending.add(id);
  const s={input:unknown(fs),outputs:Object.fromEntries(ports.map(p=>[p,unknown(fs)])),targets:Object.fromEntries(ports.map(p=>[p,unknown(fs)])),gainStatus:'unknown',shortfall:null,recommendation:null,issues:[]};
  stations[id]=s;
  if(n.kind==='node'){
   for(const p of ports){
    const samples=sweepFor(n,p);
    s.outputs[p]=fs.map(f=>[f,exactAt(samples,f)]);
    s.targets[p]=s.outputs[p].map(p=>p.slice());
    baselines[`${id}::${p}`]=s.targets[p];
   }
   s.gainStatus=ports.some(p=>s.outputs[p].some(x=>finite(x[1])))?'measured':'unknown';
   if(s.gainStatus==='unknown')s.issues.push('Upload a corrected measured sweep for this node port.');
  }else{
   const feeds=edges.filter(e=>e.to===id);
   let inherited=unknown(fs);
   if(feeds.length!==1){s.issues.push(feeds.length?'Multiple upstream feeds; input unresolved.':'No upstream feed.');}
   else{
    const e=feeds[0],up=visit(e.from),cable=CABLES[e.cableId];
    if(e.confirmed===false)s.issues.push('Connection is unconfirmed.');
    else if(!up)s.issues.push('Upstream station unresolved.');
    else if(!finite(e.lengthFt)||e.lengthFt<0)s.issues.push('Cable length is missing or invalid.');
    else if(!cable&&e.lengthFt!==0)s.issues.push('Cable model is missing or unsupported.');
    else if(!up.outputs[e.port])s.issues.push('Upstream physical port does not exist.');
    else{
     inherited=baselines[`${e.from}::${e.port}`]||unknown(fs);
     s.input=fs.map(f=>{
      const v=sampleAt(up.outputs[e.port],f);
      const loss=e.lengthFt===0?0:inBand(cable,f)?sampleAt(cable.points,f):null;
      return [f,finite(v)&&finite(loss)?v-loss*e.lengthFt/100:null];
     });
     if(s.input.some(p=>p[1]===null))s.issues.push('Some input bins have no measured source or supported cable curve.');
    }
   }
   for(const p of ports){s.targets[p]=inherited.map(x=>x.slice());baselines[`${id}::${p}`]=inherited;}
   if(n.kind==='active'){
    const r=recommendParts(n.modelId,s.input,inherited,n.settings||{});
    s.recommendation=r;s.outputs=r.outputs;s.targets=r.targets;s.gainStatus=r.gainStatus;s.shortfall=r.shortfall;s.issues.push(...r.issues);
   }else{
    for(const p of ports)s.outputs[p]=fs.map(f=>{
     const v=sampleAt(s.input,f);
     const loss=n.kind==='eol'?0:sampleAt(model?.losses?.[p]?.points,f);
     return [f,finite(v)&&finite(loss)?v-loss:null];
    });
    s.gainStatus=s.outputs[ports[0]]?.some(x=>finite(x[1]))?'passive':'unknown';
   }
   // Reading is already at the physical output; never apply director or TP loss again.
   for(const p of ports){
    const measured=sweepFor(n,p);
    if(!measured.length)continue;
    s.outputs[p]=fs.map(f=>[f,exactAt(measured,f)]);
    s.issues.push(`${p}: measured physical output overrides prediction for this port only.`);
   }
  }
  if(!model)s.issues.push('Equipment model is missing or unknown.');
  pending.delete(id);finished.add(id);return s;
 }
 for(const n of nodes)visit(n.id);
 for(const [id,s] of Object.entries(stations))for(const issue of s.issues)issues.push(`${id}: ${issue}`);
 return {frequencies:fs,stations,issues};
}

/** Reverse alignment is deliberately separate from the forward node-target cascade.
 * Both physical measurement planes and the fixed design input pad must be explicit.
 * A transmitter level is not inferred. This is one verified reverse input path to
 * the combined reverse output, not an automatic multi-input return power combiner.
 */
export function recommendReverseParts(modelId,inputSamples,targetSamples,settings={}){
 const model=effectiveModel(EQUIPMENT[modelId],settings),fs=frequenciesOf(targetSamples),exactAt=makeExactSampler(),sampleAt=makeSampler();
 const issues=[],result={modelId,direction:'return',frequencies:fs,targets:{main:curve(targetSamples)},outputs:{main:unknown(fs)},residuals:{main:unknown(fs)},shared:null,gainStatus:'unknown',shortfall:null,overshoot:null,maxErrorDb:null,maxOutputStatus:'unknown',maxOutputDb:null,sourceStatus:'estimated',sources:model?.source?[model.source]:[],issues};
 if(!model||model.family!=='GainMaker'){issues.push('No verified reverse plug-in slot and adjustment procedure for this model.');return result;}
 if(settings.planesVerified!==true||settings.inputPlane!=='reverse-input'||settings.targetPlane!=='reverse-output'){
  issues.push('Confirm measured reverse physical input and combined reverse output planes; no transmitter target is inferred.');return result;
 }
 const inputPad=settings.reverseInputPadDb;
 if(!finite(inputPad)||!PADS.some(p=>p.value===inputPad)){issues.push('Enter the fixed design reverse input pad from the realizable 0–20.5 dB half-step parts.');return result;}
 const split=model.id==='gm-hgd-40'?40:Number(model.id.match(/-(40|55|65|85)$/)?.[1]||42);
 const family=split<=42?'standard-return-42':`standard-return-${split}`;
 const candidates=Object.values(PARTS).filter(p=>p.familyId===family);
 const referenceGain=['gm-hgd-40','gm-hgd-42','gm-le-manual','gm-le-thermal','gm-le-agc'].includes(model.id)?19.5:null;
 const gain=fs.map(f=>f<5||f>split?null:Array.isArray(settings.reverseGainSamples)?sampleAt(settings.reverseGainSamples,f):finite(referenceGain)?referenceGain+1-(settings.reverseSwitch===true?.5:0):null);
 const ins=fs.map(f=>exactAt(curve(inputSamples),f)),targets=fs.map(f=>exactAt(curve(targetSamples),f));
 let best=null;
 for(const eq of candidates){
  const base=fs.map((f,i)=>{const loss=eq.orderingValue===0?0:lookupPartLoss(eq.id,f).value;return finite(ins[i])&&finite(gain[i])&&finite(loss)?ins[i]+gain[i]-inputPad-loss:null;});
  const terms=base.map((v,i)=>finite(v)&&finite(targets[i])?v-targets[i]:null).filter(finite);
  if(!terms.length)continue;
  const min=Math.min(...terms),max=Math.max(...terms),sum=terms.reduce((a,b)=>a+b,0),sq=terms.reduce((a,b)=>a+b*b,0);
  for(const {value:pad} of PADS){
   const worst=Math.max(Math.abs(min-pad),Math.abs(max-pad)),score=Math.max(0,(sq-2*pad*sum)/terms.length+pad*pad);
   const changes=(finite(settings.reverseOutputPadDb)&&settings.reverseOutputPadDb!==pad?1:0)+(settings.reverseEqPartId&&settings.reverseEqPartId!==eq.id?1:0);
   if(!best||worst<best.worst-1e-9||Math.abs(worst-best.worst)<=1e-9&&(score<best.score-1e-9||Math.abs(score-best.score)<=1e-9&&changes<best.changes))best={eq,pad,worst,score,changes,base};
  }
 }
 if(!best){issues.push('Reverse gain or compatible insertion-loss curve is unavailable at the measured bins; do not substitute another split.');return result;}
 result.shared={reverseInputPadDb:inputPad,reverseOutputPadDb:best.pad,reverseOutputPadPartNumber:PADS.find(p=>p.value===best.pad).partNumber,reverseEqPartId:best.eq.id,reverseEqPartNumber:best.eq.partNumber,eqPartId:best.eq.id,eqPartNumber:best.eq.partNumber,eqNominalDb:best.eq.nominalDb,factoryEqDb:model.factoryEqDb};
 result.outputs.main=fs.map((f,i)=>[f,finite(best.base[i])?best.base[i]-best.pad:null]);
 result.residuals.main=fs.map((f,i)=>[f,finite(result.outputs.main[i][1])&&finite(targets[i])?result.outputs.main[i][1]-targets[i]:null]);
 const residuals=result.residuals.main.map(p=>p[1]).filter(finite);
 result.shortfall=Math.max(0,...residuals.map(v=>-v));result.overshoot=Math.max(0,...residuals);result.maxErrorDb=best.worst;result.rmseDb=Math.sqrt(best.score);
 result.gainStatus=result.shortfall>1e-6?'insufficient':result.overshoot>1e-6?'adjustment-limited':residuals.length<fs.length?'partial':'supported';
 issues.push('Reverse output capability remains unknown; operating gain is not a maximum-output specification.');
 issues.push('Reverse gain19.5 dB reference uses input pad0, output EQ0 and output pad1; gain is estimated across frequency unless measured transfer data is supplied.');
 result.sources.push(best.eq.source);
 result.assumptions=['Entered reverseGainSamples are a reference transfer with input pad0, output pad0 and output EQ0; retain factory configuration.','Fixed design input pad is preserved.','One reverse path to combined output; no multi-input power summation.','Shared output pad/EQ minimize worst absolute error, then squared error, then installed changes.','Reverse0 EQ is the gain-reference installation, not an absolute zero-loss table.'];
 return result;
}
