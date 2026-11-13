/* Per-station field worksheet. Saved measurements are separate from route predictions.
   No new target is assumed; balance and sweep are independent technician records. */
const StationMath=(()=>{
 // Match HTML number inputs: no hex/binary, leading plus, whitespace or trailing
 // decimal point that the browser would erase while the worksheet calculated it.
 const number=x=>{if(typeof x==='number')return Number.isFinite(x)?x:null;if(typeof x!=='string'||x.trim()!==x||!/^\-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(x))return null;return Number.isFinite(Number(x))?Number(x):null;};
 const fail=error=>({ok:false,error});
 function level(value,label){const n=number(value);return n===null?fail(label+' unknown or invalid — enter a finite decimal level shown in the field.'):Math.abs(n)>200?fail(label+' must be within ±200 dBmV (worksheet range).'):{ok:true,value:n===0?0:n};}
 function loss(value,label='Insertion loss'){const n=number(value);return n===null?fail(label+' unknown or invalid — enter a finite decimal value shown in the field.'):n<0||n>200?fail(label+' must be nonnegative and no more than 200 dB (worksheet range).'):{ok:true,value:n===0?0:n};}
 function difference(a,b,label){if(!a.ok)return a;if(!b.ok)return b;const v=a.value-b.value;return Number.isFinite(v)?{ok:true,value:v===0?0:v}:fail(label+' is outside the worksheet range.');}
 function returnResults(input={}){
  const target=level(input.referencePointTarget,'Reference-point target'),insertion=loss(input.insertionLoss);
  let requiredInjection=!target.ok?target:!insertion.ok?insertion:level(target.value+insertion.value,'Required injection');
  const actual=level(input.actualInjection,'Actual injection'),reading=level(input.receiverReading,'Receiver reading'),reference=level(input.receiverReference,'Receiver reference');
  return {requiredInjection,injectionDelta:difference(actual,requiredInjection,'Injection delta'),receiverDelta:difference(reading,reference,'Receiver delta')};
 }
 function validDate(value){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));if(!m||Number(m[1])<1)return false;const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.getUTCFullYear()===Number(m[1])&&date.getUTCMonth()+1===Number(m[2])&&date.getUTCDate()===Number(m[3]);}
 function pilots(input={},equipment={}){
  const inside=f=>f!==null&&f>=5&&f<=1800&&(!Array.isArray(equipment.forwardBand)||f>=equipment.forwardBand[0]&&f<=equipment.forwardBand[1]);
  const lo=number(input.lowMHz),hi=number(input.highMHz),ordered=lo===null||hi===null||lo<hi,valid=inside(lo)&&inside(hi)&&ordered;
  const ml=level(input.measuredLow,'Low reading'),mh=level(input.measuredHigh,'High reading'),tl=level(input.targetLow,'Low target'),th=level(input.targetHigh,'High target');
  const value=x=>x.ok?x.value:null,errorLow=ordered&&inside(lo)&&ml.ok&&tl.ok?ml.value-tl.value:null,errorHigh=ordered&&inside(hi)&&mh.ok&&th.ok?mh.value-th.value:null;
  const tiltMeasured=valid&&ml.ok&&mh.ok?mh.value-ml.value:null,tiltTarget=valid&&tl.ok&&th.ok?th.value-tl.value:null;
  return {errorLow,errorHigh,tiltMeasured,tiltTarget,tiltError:tiltMeasured!==null&&tiltTarget!==null?tiltMeasured-tiltTarget:null,measuredLow:value(ml),measuredHigh:value(mh)};
 }
 function results(stage={},equipment={}){
  const input=stage.forward||{},names={lowMHz:'low pilot frequency',highMHz:'high pilot frequency',measuredLow:'low reading',measuredHigh:'high reading',targetLow:'low target',targetHigh:'high target',pad:'installed input pad',eq:'installed input EQ',levelTolerance:'level tolerance',tiltTolerance:'tilt tolerance'};
  const company=equipment.companyTargetProfile&&typeof CompanyTargets!=='undefined'?CompanyTargets.compare(equipment.companyTargetProfile,{...input,split:equipment.split,plane:input.plane,unit:'dBmV'}):null;
  const hidden=Object.keys(names).find(key=>input[key]!==undefined&&input[key]!==''&&number(input[key])===null);
  const forward=hidden?fail('Enter '+names[hidden]+' using finite decimal notation shown in the field.'):Alignment.solve(input,{forwardBand:equipment.forwardBand,profile:Alignment.profileFor(equipment.id),pad:input.pad,eq:input.eq});
  return {forward,pilots:pilots(input,equipment),returns:returnResults(stage.returns),...(company?{company}:{})};
 }
 return {number,level,loss,returnResults,validDate,pilots,results};
})();

const StationView=(()=>{
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x));
 const own=()=>typeof state!=='undefined'?state:{},cat=()=>typeof catalog!=='undefined'?catalog:{};
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const forwardFields=['lowMHz','highMHz','measuredLow','measuredHigh','targetLow','targetHigh','pad','eq','levelTolerance','tiltTolerance','plane'];
 const returnFields=['referencePointTarget','insertionLoss','actualInjection','receiverReading','receiverReference','pad','eq','tolerance','referencePoint','receiverPlane','referenceId'];
 const safeKey=x=>typeof x==='string'&&/^[a-zA-Z0-9_.:-]{1,100}$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
 const selections=new WeakMap();
 const drafts=new Map();
 let initialized=false,lastOwner=null,lastSignature='',message='',renderedContext=null,draftMessage=false;
 const blankStage=()=>({forward:Object.fromEntries(forwardFields.map(f=>[f,''])),returns:Object.fromEntries(returnFields.map(f=>[f,''])),updatedAt:''});
 const blankRecord=t=>({pointId:t?.key||'',equipmentId:t?.id||'',bindingVersion:2,equipmentContext:t?.context||'',stage:'before',stages:{before:blankStage(),after:blankStage()},balanced:{done:false,date:''},swept:{done:false,date:''}});
 function validate(value){
  if(value===undefined)return;
  const allowed=(v,keys,description)=>{if(!object(v)||Object.keys(v).some(k=>!keys.includes(k)))throw Error('Invalid station '+description+'.');};
  const text=(v,max=500)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid station text.');};
  allowed(value,['selected','stations'],'worksheet');if(value.selected!==undefined&&!safeKey(value.selected))throw Error('Invalid station selection.');
  if(value.stations!==undefined&&(!object(value.stations)||Object.keys(value.stations).length>1000))throw Error('Invalid station records (maximum 1,000).');
  for(const [id,r] of Object.entries(value.stations||{})){
   if(!safeKey(id))throw Error('Invalid station identity.');allowed(r,['pointId','equipmentId','bindingVersion','equipmentContext','stage','stages','balanced','swept'],'record');
   if(r.bindingVersion!==undefined&&r.bindingVersion!==2)throw Error('Unsupported station binding version.');
   for(const f of ['pointId','equipmentId','equipmentContext'])if(r[f]!==undefined)text(r[f],f==='equipmentContext'?2500:500);
   if(r.stage!==undefined&&!['before','after'].includes(r.stage))throw Error('Invalid station stage.');
   if(r.stages!==undefined){allowed(r.stages,['before','after'],'stages');for(const stage of Object.values(r.stages)){
    allowed(stage,['forward','returns','updatedAt'],'stage');if(stage.updatedAt!==undefined)text(stage.updatedAt,50);
    for(const [scope,keys] of [['forward',forwardFields],['returns',returnFields]])if(stage[scope]!==undefined){allowed(stage[scope],keys,scope);for(const v of Object.values(stage[scope]))text(v);}
   }}
   for(const f of ['balanced','swept'])if(r[f]!==undefined){allowed(r[f],['done','date'],f);if(r[f].done!==undefined&&typeof r[f].done!=='boolean')throw Error('Invalid station done state.');if(r[f].date!==undefined)text(r[f].date,40);}
  }
 }
 function targets(owner=own()){
  const c=cat(),devices=c.devices||[],list=[],type=owner.setup?.sourceType;
  // Keep the catalog's first match; rebuild locally so edits/imports cannot stale it.
  const byId=new Map();for(const d of devices)if(!byId.has(d.id))byId.set(d.id,d);
  if(type==='node'){
   const n=(c.nodeProfiles||[]).find(x=>x.id===owner.node?.model),bandIndex=String(owner.node?.band??'').trim()===''?null:Number(owner.node?.band),b=bandIndex!==null&&Number.isInteger(bandIndex)?n?.bands?.[bandIndex]:null;
   if(n)list.push({key:'source',id:n.id,label:'Launch node · '+n.label,forwardBand:b?[b.forwardFloor,b.equipmentUpper]:null,returnCeiling:b?.returnCeiling,readOnly:!!n.retired,holder:owner.setup});
  }else if(type==='active'){
   const d=byId.get(owner.setup?.sourceModel);if(d?.active)list.push({key:'source',id:d.id,label:'Launch active · '+d.label,forwardBand:d.publishedGain?.forwardBand,returnCeiling:d.publishedGain?.reverseBand?.[1],readOnly:!!d.retired,holder:owner.setup});
  }
  for(const [i,row] of (owner.rows||[]).entries()){
   const d=byId.get(row.device);if(d?.active)list.push({key:row.id,id:d.id,label:(row.name||'Point '+(i+1))+' · '+d.label,forwardBand:d.publishedGain?.forwardBand,returnCeiling:d.publishedGain?.reverseBand?.[1],readOnly:!!d.retired,holder:row});
  }
  return list.map(t=>{
   // Identity uses only saved job choices. Corrected catalog bands may change the
   // displayed capability / calculation guard, never the ownership of observations.
   const source=t.key==='source'?(type==='node'?['node',String(owner.node?.band??''),owner.node?.asset||'',owner.node?.port||'',owner.node?.module||'']:['active',owner.setup?.sourceAsset||'',owner.setup?.sourcePort||'']):['route'];
   return {...t,...(t.key==='source'&&type==='node'&&owner.setup?.companyTargetProfile?{companyTargetProfile:owner.setup.companyTargetProfile}:{}),split:t.returnCeiling===42&&t.forwardBand?.[0]===54?'42':t.returnCeiling===204&&t.forwardBand?.[0]===258?'204':'',context:JSON.stringify([t.id,...source])};
  });
 }
 function data(owner=own()){return object(owner.stationView)?owner.stationView:{selected:'',stations:{}};}
 function target(owner=own()){const list=targets(owner);return list.find(t=>t.key===(selections.get(owner)||data(owner).selected))||list[0]||null;}
 function stored(t,owner=own()){
  if(!t)return null;const id=t.holder?.stationIdentity,r=safeKey(id)?data(owner).stations?.[id]:null;
  return r&&r.pointId===t.key&&r.equipmentId===t.id&&(r.bindingVersion===undefined||r.equipmentContext===t.context)?r:null;
 }
 function legacy(t=target(),owner=own()){const r=stored(t,owner);return !!r&&r.bindingVersion===undefined;}
 function readOnly(t=target(),owner=own()){return !!t?.readOnly||legacy(t,owner);}
 function currentRecord(owner=own()){
  const t=target(owner),raw=stored(t,owner);if(!raw)return blankRecord(t);
  // Read defaults without rewriting imported optional fields or touching the job.
  return raw;
 }
 function normalized(r,t){const b=blankRecord(t),next={...b,...r,stages:Object.fromEntries(['before','after'].map(k=>[k,{...b.stages[k],...r.stages?.[k],forward:{...b.stages[k].forward,...r.stages?.[k]?.forward},returns:{...b.stages[k].returns,...r.stages?.[k]?.returns}}])),balanced:{...b.balanced,...r.balanced},swept:{...b.swept,...r.swept}};if(r.bindingVersion===undefined)delete next.bindingVersion;return next;}
 function currentStage(owner=own()){const t=target(owner),r=normalized(currentRecord(owner),t);return r.stages[r.stage];}
 function currentTarget(owner=own()){const t=target(owner);return t?{key:t.key,id:t.id,label:t.label}:null;}
 function results(owner=own()){return StationMath.results(currentStage(owner),target(owner)||{});}
 function renderSignature(owner,t,r){return JSON.stringify([data(owner).selected,t?.key,t?.context,t?.forwardBand,t?.returnCeiling,t?.companyTargetProfile,t?.holder?.stationIdentity,targets(owner).map(x=>[x.key,x.label]),r]);}
 function records(owner=own()){
  return targets(owner).flatMap(t=>{const raw=stored(t,owner);if(!raw)return [];const r=normalized(raw,t);return [{identity:t.holder.stationIdentity,pointId:t.key,equipmentId:t.id,label:t.label,split:t.split,readOnly:readOnly(t,owner),bindingStatus:legacy(t,owner)?'legacy-unconfirmed':'current',...clone(r),results:{before:StationMath.results(r.stages.before,t),after:StationMath.results(r.stages.after,t)}}];});
 }
 // Raw binding context is needed while autosave boots, before calculators load.
 // Share ownership checks with records(), without normalization or RF evaluation.
 function boundRecords(owner=own()){
  return targets(owner).flatMap(t=>{const raw=stored(t,owner);return raw?[{identity:t.holder.stationIdentity,bindingStatus:legacy(t,owner)?'legacy-unconfirmed':'current',readOnly:readOnly(t,owner),record:clone(raw)}]:[];});
 }
 function newIdentity(owner){let id;const used=new Set([...Object.keys(data(owner).stations||{}),...targets(owner).map(t=>t.holder.stationIdentity)]);do{id='station_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12);}while(used.has(id));return id;}
 function persist(scope,field,value){
  const owner=own(),t=target();if(!t||readOnly(t,owner))return false;
  const r=normalized(currentRecord(),t),stage=r.stages[r.stage];
  if(scope==='record'){if(field!=='stage'||!['before','after'].includes(value))return false;r.stage=value;}
  else if(['balanced','swept'].includes(scope)){if(!['done','date'].includes(field))return false;r[scope][field]=field==='done'?value===true:String(value).slice(0,40);}
  else{const keys=scope==='forward'?forwardFields:scope==='returns'?returnFields:[];if(!keys.includes(field))return false;stage[scope][field]=String(value).slice(0,500);stage.updatedAt=new Date().toISOString();}
  const existing=stored(t),id=existing?t.holder.stationIdentity:newIdentity(owner),next={...data(),selected:t.key,stations:{...data().stations,[id]:r}};
  validate(next);t.holder.stationIdentity=id;owner.stationView=next;
  draftMessage=false;const saved=typeof saveLocal==='function'&&saveLocal()!==false;message=saved?'Station worksheet saved on this device.':'Autosave failed. Export a project backup before closing.';
  return true;
 }
 function confirmBinding(){
  const owner=own(),t=target(),original=stored(t,owner);if(!t||t.readOnly||!legacy(t,owner)||!original)return false;
  const id=newIdentity(owner),r={...normalized(clone(original),t),bindingVersion:2,equipmentContext:t.context},next={...data(),selected:t.key,stations:{...data().stations,[id]:r}};
  draftMessage=false;try{validate(next);}catch(error){message=error.message;return false;}
  t.holder.stationIdentity=id;owner.stationView=next;
  message=typeof saveLocal==='function'&&saveLocal()!==false?'Saved confirmed binding. The original legacy worksheet remains in this job backup.':'Binding retained in memory; export a project backup before closing.';
  return true;
 }
 const tag=id=>typeof Thresholds!=='undefined'?Thresholds.tag(id):'';
 const signed=(x,d=2)=>Number.isFinite(x)?(x>0?'+':'')+(x===0?0:x).toFixed(d):'—';
 function field(scope,key,label,value,source='',type='text'){
  const id='station-'+scope+'-'+key,canBeNegative=scope==='forward'?['targetLow','targetHigh','measuredLow','measuredHigh'].includes(key):scope==='returns'&&['referencePointTarget','actualInjection','receiverReading','receiverReference','eq'].includes(key);
  const native=type==='number'||type==='date';
  return `<div class="station-field"><div class="station-field-heading"><label for="${id}">${label}</label>${source?tag(source):''}</div><input id="${id}" type="${type}"${type==='number'?' step="any"'+(canBeNegative?'':' inputmode="decimal"'):''} data-station-scope="${scope}" data-station-field="${key}" value="${escape(value)}"${type==='text'?' maxlength="500"':''}${type==='number'?' placeholder="Unknown"':''}${native?` aria-invalid="false" aria-describedby="${id}-feedback"`:''}>${native?`<p id="${id}-feedback" class="note station-input-feedback" data-station-input-feedback role="status" aria-live="polite" hidden></p>`:''}</div>`;
 }
 function forwardMarkup(t,r){
  const p=Alignment.profileFor(t.id),f=r.stages[r.stage].forward;
  const numeric=(k,label,source='')=>field('forward',k,label,f[k],source,'number');
  const choices=(key,label,items)=>`<label>${label}<select data-station-scope="forward" data-station-field="${key}"><option value="">Choose installed value</option>${items.map(x=>`<option value="${x.value}"${StationMath.number(f[key])!==null&&StationMath.number(f[key])===x.value?' selected':''}>${escape(x.label||x.value+' dB')}</option>`).join('')}</select></label>`;
  return `<section class="calc-card"><h3>Forward pilots</h3><p class="note">Record readings and targets at the same output plane and channel-power convention. Apply test-point correction once before entering readings. ${tag('calc.alignment.balance')}</p><div class="calc-fields">${numeric('lowMHz','Low pilot (MHz)')}${numeric('highMHz','High pilot (MHz)')}${numeric('targetLow','Low target (dBmV)','station.forward.targetLow')}${numeric('targetHigh','High target (dBmV)','station.forward.targetHigh')}${numeric('measuredLow','Low reading (dBmV)')}${numeric('measuredHigh','High reading (dBmV)')}${p?choices('pad','Installed input pad (dB)',p.pads.values.map(value=>({value})))+choices('eq','Installed input EQ (dB)',[...(p.eqs.unpublished||[]),...p.eqs.items]):''}${field('forward','plane','Output plane / port and power convention',f.plane)}</div><details><summary>Company comparison tolerances</summary><div class="calc-fields">${numeric('levelTolerance','Level tolerance (± dB)','station.forward.levelTolerance')}${numeric('tiltTolerance','Tilt tolerance (± dB)','station.forward.tiltTolerance')}</div></details><div data-station-forward-result role="status" aria-live="polite"></div></section>`;
 }
 function returnReferences(t){
  let plant='';
  if(t.split==='42'){
   const tx=StationMath.number(own().sweepSetup?.profiles?.['42']?.txReference);
   plant=`<p><strong>42/54 MHz</strong> · Operator return TX reference: ${tx===null?'Unknown — enter the approved value in Field → Meter setup (42/54)':escape(tx)+' dBmV, entered for this job'}. ${tag('company.sweep42.txReference')} This transmitter-plane entry remains editable and does not supply injection or receiver targets.</p>`;
  }else if(t.split==='204'){
   plant='<p><strong>204/258 MHz</strong> · Return XPERTrak. Enter the actual system receiver reference; a referenced dB response does not establish an absolute dBmV plane.</p>';
   if(t.id==='active_aoi_hgd')plant+=`<p>The preliminary Quantum18 HGD 204-split sheet recommends 9 dBmV per 6.4 MHz channel at its upstream input. ${tag('station.return.aoiHgdInput')} This exact-model input recommendation does not set injection or receiver targets.</p>`;
  }else plant='<p><strong>Split workflow unconfigured.</strong> Confirm the installed split and procedure; no other plant’s local reference is applied.</p>';
  return `<div class="note" data-station-return-reference>${plant}<details><summary>Receiver reference planes</summary><p>Only when an SCU-1800 is actually the receiver, its saved data-sheet reference recommends 0 dBmV input; the issued revision remains unverified. ${tag('station.return.scuInput')} It does not establish an XPERTrak RCI reference.</p><p>The CMTS receive set point defaults to 0 dBmV and is configurable. ${tag('station.return.cmtsSetPoint')} It belongs to DOCSIS long-loop ALC, not this station’s injection or receiver plane. None of these references fills worksheet fields.</p></details></div>`;
 }
 function returnMarkup(t,r){const f=r.stages[r.stage].returns,numeric=(k,label,source='')=>field('returns',k,label,f[k],source,'number');return `<section class="calc-card"><h3>Return unity-gain worksheet ${tag('station.return.injection')}</h3><p class="note">Required injection = reference-point target + net insertion loss to that point. Enter total applicable loss, including EQ and test point / lead losses once; do not add meter compensation twice. This is a physical source-level budget, not an automatic ONX setting. ${t.split==='42'?'For Return Sweepless Sweep, use only verified absolute same-plane readings; referenced dB response alone cannot fill dBmV receiver fields.':'Use only verified absolute same-plane receiver readings; referenced dB response alone cannot fill dBmV fields.'}</p><div class="calc-fields">${field('returns','referencePoint','Reference point / injection plane and convention',f.referencePoint)}${numeric('referencePointTarget','Reference-point target (dBmV)','station.return.referencePointTarget')}${numeric('insertionLoss','Net insertion loss (dB)')}${numeric('actualInjection','Actual injection (dBmV)')}${numeric('receiverReading','Receiver reading (dBmV)')}${numeric('receiverReference','Receiver reference (dBmV)','station.return.receiverReference')}${field('returns','receiverPlane','Receiver plane / power convention',f.receiverPlane)}${field('returns','referenceId','Saved receiver reference ID / source',f.referenceId)}${numeric('pad','Recorded return pad / attenuation (dB)')}${numeric('eq','Recorded return EQ / tilt (dB)')}</div><p class="note">Return pad and EQ record the installed setting; this worksheet does not choose return parts.${t.id.startsWith('active_aoi_')?' Quantum18 uses electronic adjustments under its exact installed-model procedure.':''}</p>${returnReferences(t)}<details><summary>Company return tolerance</summary><div class="calc-fields">${numeric('tolerance','Receiver tolerance (± dB)','station.return.tolerance')}</div><p class="note">No universal return tolerance was found. Leave unknown until your company supplies one.</p></details><div data-station-return-result role="status" aria-live="polite"></div></section>`;}
 function comparison(error,tolerance,label){const n=StationMath.number(tolerance);if(n===null)return label+' tolerance unknown.';if(n<0||n>200)return label+' tolerance must be nonnegative and no more than 200 dB.';return label+': '+(Math.abs(error)<=n+1e-9?'within':'outside')+' entered ±'+n+' dB company tolerance.';}
 function refreshResults(){
  const t=target(),raw=currentRecord(),r=normalized(raw,t),stage=r.stages[r.stage],res=StationMath.results(stage,t||{}),forward=document.querySelector('[data-station-forward-result]'),returns=document.querySelector('[data-station-return-result]'),done=document.querySelector('[data-station-done-result]');
  if(forward){const f=res.forward,p=Alignment.profileFor(t?.id),note=Alignment.noteFor(t?.id);let content='';
   if(!f.ok)content=`<p class="status warning">${escape(f.error)}</p>`;
   else{content=`<dl class="calc-stats"><div><dt>Low / high level error</dt><dd><strong>${signed(f.errorLow)} / ${signed(f.errorHigh)} dB</strong></dd></div><div><dt>Measured / target tilt</dt><dd><strong>${signed(f.tiltMeasured)} / ${signed(f.tiltTarget)} dB</strong></dd></div><div><dt>Tilt error</dt><dd><strong>${signed(f.tiltError)} dB</strong></dd></div></dl>`;
    if(p&&f.catalog?.ok){const c=f.catalog;content+=`<p>Input EQ ${c.eq.from.toFixed(1)} → ${c.eq.to.toFixed(1)} dB; input pad ${c.pad.from.toFixed(1)} → ${c.pad.to.toFixed(1)} dB.</p><p class="note">${escape(c.advice.eq)} ${escape(c.advice.pad)} Predicted remaining low / high / tilt error: ${signed(c.leftover.low)} / ${signed(c.leftover.high)} / ${signed(c.leftover.tilt)} dB. A prediction from published EQ losses${c.interpolated?', interpolated between published frequencies':''}; re-measure to confirm.</p>${c.advice.inWindow===null?'':`<p class="note">${c.advice.inWindow?'Predicted inside':'Predicted outside'} the procedure’s ±${c.advice.window} dB window for tilt and level (${escape(c.advice.windowSource)}). This manufacturer procedure window does not supply company acceptance criteria.</p>`}${c.notes.map(note=>`<p class="status warning">${escape(note)}</p>`).join('')}`;}
    else if(p)content+=`<p class="note">${escape(f.catalog.error)} ${escape(f.guidance.eq)} ${escape(f.guidance.pad)}</p>`;
    else if(!note)content+='<p class="note">No sourced plug-in pad/EQ profile for this equipment. Follow its installed-model procedure.</p>';
    content+=`<p class="note">${escape(comparison(Math.max(Math.abs(f.errorLow),Math.abs(f.errorHigh)),stage.forward.levelTolerance,'Forward level'))} ${escape(comparison(f.tiltError,stage.forward.tiltTolerance,'Forward tilt'))}</p>`;
   }
   if(!f.ok&&(res.pilots.errorLow!==null||res.pilots.errorHigh!==null))content+=`<p>Independent low / high level error: ${res.pilots.errorLow===null?'—':signed(res.pilots.errorLow)} / ${res.pilots.errorHigh===null?'—':signed(res.pilots.errorHigh)} dB. Complete both pilots for tilt and the solver.</p>`;
   if(t?.companyTargetProfile){const c=res.company;content='<p class="note"><strong>Independently entered worksheet criteria</strong> — the worksheet results below use your entered targets, not the company node reference.</p>'+content;content+=`<p data-company-station-targets><strong>Separate company node reference</strong> · Company node targets at the entered pilots: ${c.targetLow===null?'—':c.targetLow.toFixed(1)} / ${c.targetHigh===null?'—':c.targetHigh.toFixed(1)} dBmV. Company level errors, tilt error and acceptance: — (basis/tolerance unconfirmed).</p><p class="note">${escape(c.reason)}</p>`;}
   if(note)content+=`<p class="note">${escape(note.text)} Source: ${escape(note.source)}, ${escape(note.revision)}, ${escape(note.locator)}.</p>`;
   if(p)content+=`<p class="note">${escape(p.title)} · ${escape(p.revision)} · ${escape(p.locator)}. OEM AGC, ACI DSIM and manual/thermal setup remain separate procedures.</p>`;
   forward.innerHTML=content;
  }
  if(returns){const v=res.returns,metric=(k,label,unit)=>`<p><strong>${label}: ${v[k].ok?signed(v[k].value)+' '+unit:'Unknown'}</strong>${v[k].ok?'':' — '+escape(v[k].error)}</p>`;
   returns.innerHTML=metric('requiredInjection','Required injection','dBmV')+metric('injectionDelta','Actual minus required injection','dB')+metric('receiverDelta','Receiver minus saved reference','dB')+`<p class="note">${escape(v.receiverDelta.ok?comparison(v.receiverDelta.value,stage.returns.tolerance,'Receiver'):'Receiver tolerance unknown until comparable receiver levels are entered.')}</p>`;
   if(stage.returns.pad!==''&&!StationMath.loss(stage.returns.pad,'Recorded return pad / attenuation').ok)returns.innerHTML+=`<p class="status warning">${escape(StationMath.loss(stage.returns.pad,'Recorded return pad / attenuation').error)}</p>`;
   const eq=StationMath.number(stage.returns.eq);if(stage.returns.eq!==''&&(eq===null||Math.abs(eq)>200))returns.innerHTML+='<p class="status warning">Recorded return EQ / tilt must be finite and within ±200 dB (worksheet range).</p>';
  }
  if(done)done.innerHTML=['balanced','swept'].map(key=>{const status=r[key];return `<p>${key==='balanced'?'Balanced':'Swept'}: ${status.done?'recorded by technician':'not recorded'} · ${escape(status.date||'date unknown')}${status.date&&!StationMath.validDate(status.date)||status.done&&!StationMath.validDate(status.date)?' — enter a valid calendar date (YYYY-MM-DD).':''}</p>`;}).join('');
  const status=document.querySelector('[data-station-status]');if(status)status.textContent=message;
 }
 function render(force=false){
  // app.js restores autosave before the later calculator/registry scripts initialize.
  if(typeof Alignment==='undefined'||typeof Thresholds==='undefined')return;
  const panel=typeof document!=='undefined'?document.getElementById('stationPanel'):null;if(!panel)return;
  if(force)for(const input of [...drafts.keys()])reconcile(input);
  const owner=own(),t=target(),raw=currentRecord(),r=normalized(raw,t),locked=readOnly(t,owner),oldBinding=legacy(t,owner),signature=renderSignature(owner,t,r);
  if(lastOwner===owner&&lastSignature===signature)return;
  const nextContext=viewContext();if(draftMessage&&!sameContext(renderedContext,nextContext)){message='';draftMessage=false;}
  drafts.clear();renderedContext=nextContext;lastOwner=owner;lastSignature=signature;
  if(!t){panel.innerHTML='<h2>Station worksheet</h2><p class="status warning">Select a launch node / active or add an amplifier on Cable route to record a station.</p><button type="button" data-task="setup">Launch setup</button><button type="button" data-task="route">Cable route</button>';return;}
  const banner=t.split==='42'?'42/54 MHz · Forward Sweepless Sweep · Return Sweepless Sweep':t.split==='204'?'204/258 MHz · Forward Sweepless Sweep · Return XPERTrak':`Split ${t.returnCeiling??'unknown'}/${t.forwardBand?.[0]??'unknown'} MHz · workflow unconfigured; confirm the installed procedure`;
  panel.innerHTML=`<div class="sectionhead"><h2>Station worksheet</h2></div><label>Installed station<select data-station-target>${targets().map(x=>`<option value="${escape(x.key)}"${x.key===t.key?' selected':''}>${escape((x.readOnly?'Legacy · ':'')+x.label)}</option>`).join('')}</select></label><p class="status" data-station-split>${escape(banner)}</p>${t.readOnly?'<p class="status warning">Legacy UBT station — read-only. Its saved data remain in backups.</p>':''}${oldBinding?'<div class="status warning" data-station-binding-notice><strong>Legacy worksheet — station binding unconfirmed.</strong><p>Measurements and dates are preserved for review. The original binding used catalog bands and did not save every station choice. Confirm the selected model, installed split, asset, port and module before continuing. Confirmation makes a new bound copy and retains the original worksheet.</p>'+(!t.readOnly?'<button type="button" data-station-confirm-binding>Confirm saved worksheet belongs to this station</button>':'')+'</div>':''}${owner.job?.training?'<p class="status warning">Synthetic practice job. Entered examples and reviewed records are not field acceptance.</p>':''}<fieldset class="station-editor"${locked?' disabled':''}><legend>${escape(t.label)}</legend><label>Measurement stage<select data-station-scope="record" data-station-field="stage"><option value="before"${r.stage==='before'?' selected':''}>Before adjustments</option><option value="after"${r.stage==='after'?' selected':''}>After adjustments</option></select></label><p class="note">Each stage keeps its own targets, readings and last edit time. ${escape(r.stages[r.stage].updatedAt?'Last edited '+r.stages[r.stage].updatedAt:'No measurements recorded in this stage.')}</p><div class="station-grid">${forwardMarkup(t,r)}${returnMarkup(t,r)}</div><section class="calc-card"><h3>Done check ${tag('station.done.separate')}</h3><p class="note">Record actual work separately. Matching two pilots does not establish a sweep, and no result checks these boxes automatically.</p><div class="calc-fields">${['balanced','swept'].map(key=>`<div><label class="check"><input type="checkbox" data-station-scope="${key}" data-station-field="done"${r[key].done?' checked':''}> ${key==='balanced'?'Balanced':'Swept'} recorded</label>${field(key,'date',(key==='balanced'?'Balance':'Sweep')+' date',r[key].date,'','date')}</div>`).join('')}</div><div data-station-done-result role="status"></div></section></fieldset><p class="note" data-station-status role="status">${escape(message)}</p><p class="note">Worksheet entries and removed-station history stay in this job and its JSON backup. Targets start unknown. ${tag('station.input.range')}</p><div class="toolbar"><button type="button" data-task="equipmentSetup">Equipment procedure</button><button type="button" data-task="sweepSetup">Meter setup</button><button type="button" data-task="evidence">ONX files / backup</button></div>`;
  if(locked)panel.querySelectorAll('.station-editor input,.station-editor select,.station-editor textarea').forEach(el=>{el.disabled=true;});
  refreshResults();
 }
 function viewContext(){const owner=own(),t=target(owner),r=stored(t,owner);return {owner,target:t,key:t?.key,context:t?.context,identity:t?.holder?.stationIdentity,stage:r?.stage||'before',locked:readOnly(t,owner)};}
 const sameContext=(a,b)=>!!a&&!!b&&a.owner===b.owner&&a.key===b.key&&a.context===b.context&&a.identity===b.identity&&a.stage===b.stage&&a.locked===b.locked;
 const native=el=>el.tagName==='INPUT'&&(el.type==='number'||el.type==='date');
 function storedValue(context,el){const r=normalized(stored(context.target,context.owner)||blankRecord(context.target),context.target),scope=el.dataset.stationScope,field=el.dataset.stationField;return (scope==='balanced'||scope==='swept'?r[scope]?.[field]:r.stages[context.stage]?.[scope]?.[field])??'';}
 function feedback(el,invalid,text=''){
  if(!native(el))return;el.setAttribute('aria-invalid',String(invalid));const f=el.parentElement?.querySelector('[data-station-input-feedback]');
  if(f){f.textContent=text;f.hidden=!text;if(invalid)el.setAttribute('aria-errormessage',f.id);else el.removeAttribute('aria-errormessage');}
 }
 function reject(el,context){
  drafts.set(el,context);draftMessage=true;const name=el.labels?.[0]?.textContent.trim()||'Station entry';
  message=`Error: ${name} is incomplete and was not saved. ${el.type==='date'?'Finish a calendar date (YYYY-MM-DD)':'Finish a decimal number'}, or clear every part to leave it unknown. The recorded entry is unchanged.`;
  feedback(el,true,message);refreshResults();
 }
 function saveControl(el,context){
  const scope=el.dataset.stationScope,field=el.dataset.stationField;
  if(!persist(scope,field,el.type==='checkbox'?el.checked:el.value))return;
  drafts.delete(el);feedback(el,false);
  if(scope==='record'){lastSignature='';render();}else{renderedContext={...context,identity:context.target?.holder?.stationIdentity};lastSignature=renderSignature(own(),target(),normalized(currentRecord(),target()));refreshResults();}
 }
 function reconcile(el){
  const draft=drafts.get(el);if(!draft)return;drafts.delete(el);const current=viewContext();
  if(!el.isConnected||!sameContext(draft,current)||!sameContext(renderedContext,current)||current.locked||el.disabled){feedback(el,false);return;}
  const raw=storedValue(current,el);
  if(el.validity.badInput){
   el.value=raw;draftMessage=true;message=el.value===String(raw)?`Incomplete entry was not saved. Restored ${raw===''?'blank (unknown)':'the recorded value'}.`:'Incomplete entry was not saved. The recorded entry is retained but cannot be displayed by this control.';
   feedback(el,false,message);refreshResults();
  }else if(el.value!==String(raw))saveControl(el,current);
  else{feedback(el,false);if(draftMessage){message='';draftMessage=false;refreshResults();}}
 }
 function edit(event){const el=event.target;if(!el?.closest?.('#stationPanel'))return;
  if(el.hasAttribute('data-station-target')){if(event.type!=='change'||!targets().some(t=>t.key===el.value))return;selections.set(own(),el.value);lastSignature='';render();return;}
  const scope=el.dataset.stationScope,field=el.dataset.stationField;if(!scope||!field||el.disabled)return;
  const context=viewContext();if(context.locked)return;if(!sameContext(renderedContext,context)){lastSignature='';render();return;}
  if(native(el)){
   if(el.validity.badInput){reject(el,context);return;}
   // A date can clear all its native segments without another change event.
   if(el.type==='date'&&event.type==='input'){drafts.set(el,context);feedback(el,false);return;}
  }
  if((el.tagName==='SELECT'||el.type==='checkbox'||el.type==='date')&&event.type!=='change')return;
  saveControl(el,context);
 }
 function init(){if(typeof document==='undefined')return;if(!initialized){document.addEventListener('input',edit);document.addEventListener('change',edit);document.addEventListener('focusout',event=>{if(event.target?.closest?.('#stationPanel'))reconcile(event.target);});document.addEventListener('click',event=>{if(!event.target.closest?.('#stationPanel [data-station-confirm-binding]'))return;confirmBinding();lastSignature='';render();});initialized=true;}render();}
 return {init,render,validate,targets,currentTarget,currentRecord,currentStage,results,records,boundRecords};
})();
if(typeof module!=='undefined'&&module.exports)module.exports={StationMath,StationView};
