/* Offline grading aid. Original-byte verification is owned by EvidenceUI; math by SweepGrading. */
const SweepGradingUI=(()=>{
 const fields=[['lowFrequencyMHz','Low measured marker','MHz'],['highFrequencyMHz','High measured marker','MHz'],['ptvLimitDb','Peak-to-valley limit','dB'],['lowTargetDbmv','Low level target','dBmV'],['highTargetDbmv','High level target','dBmV'],['maxLevelErrorDb','Maximum level error','dB'],['tiltTargetDb','Signed tilt target (high − low)','dB'],['maxTiltErrorDb','Maximum tilt error','dB']];
 const keys=['42-forward','42-reverse','204-forward','204-reverse'],magnitudes=['ptvLimitDb','maxLevelErrorDb','maxTiltErrorDb'];
 const clone=v=>JSON.parse(JSON.stringify(v));
 const unavailable=new Map(),unsaved=new Map();
 const parseSnapshot=parsed=>JSON.stringify({series:parsed?.series||null,native:parsed?.native||null});
 let observedContext='',revision=0,owner=null,digestCache=null,draft={},invalid={},pending=false,lastRecord=null,message='',initialized=false;
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 function shape(v,allowed,label){if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k)))throw Error('Invalid sweep grading '+label+'.');}
 function complete(v,allowed,label){shape(v,allowed,label);if(allowed.some(k=>!Object.prototype.hasOwnProperty.call(v,k)))throw Error('Incomplete sweep grading '+label+'.');}
 function text(v,max=200){if(typeof v!=='string'||v.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v))throw Error('Invalid sweep grading text.');}
 function number(v){if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>4000000)throw Error('Invalid sweep grading number.');}
 function profile(p){shape(p,fields.map(f=>f[0]),'criteria');for(const [k,v]of Object.entries(p)){if(v===null||typeof v==='string'&&v.trim()==='')continue;number(v);if(Math.abs(v)>1000000||magnitudes.includes(k)&&v<0||k.endsWith('FrequencyMHz')&&(v<5||v>1800))throw Error('Invalid sweep grading criterion.');}}
 function result(r){
  complete(r,['overall','reason','qualification','source','metrics','checks'],'result');if(!['pass','fail','unknown'].includes(r.overall))throw Error('Invalid sweep grading status.');text(r.reason,1000);text(r.qualification,2000);
  complete(r.metrics,['ptvDb','lowValue','highValue','measuredTiltDb','lowLevelErrorDb','highLevelErrorDb','tiltErrorDb'],'metrics');for(const v of Object.values(r.metrics))if(v!==null)number(v);
  complete(r.source,['qualification','unit','frequencyUnit','sampleCount','spanMHz','bandMHz','inBandSampleCount','inBandSpanMHz'],'result source');
  if(![null,'dBmV','dB'].includes(r.source.unit)||r.source.frequencyUnit!=='MHz')throw Error('Invalid sweep grading source units.');
  for(const [k,v]of Object.entries(r.source)){if(v===null)continue;if(['spanMHz','bandMHz','inBandSpanMHz'].includes(k)){if(!Array.isArray(v)||v.length!==2)throw Error('Invalid sweep grading span.');v.forEach(number);}else if(typeof v==='number')number(v);else text(v,1000);}
  complete(r.checks,['ptv','lowLevel','highLevel','tilt'],'checks');for(const k of ['ptv','lowLevel','highLevel','tilt']){const c=r.checks[k];complete(c,['status','value','limit','target','unit','targetUnit','reason'],'check');if(c.unit!=='dB'||![null,'dBmV','dB'].includes(c.targetUnit)||!['pass','fail','unknown'].includes(c.status))throw Error('Invalid sweep grading check.');for(const [name,v]of Object.entries(c)){if(v===null)continue;if(['value','limit','target'].includes(name))number(v);else text(v,1000);}}
 }
 function validate(data){
  shape(data,['profiles','records'],'data');shape(data.profiles,keys,'profiles');for(const key of keys){if(!object(data.profiles[key]))throw Error('Invalid sweep grading profile.');profile(data.profiles[key]);}
  if(!Array.isArray(data.records)||data.records.length>100)throw Error('Invalid sweep grading history (maximum 100).');const ids=new Set();
  for(const r of data.records){complete(r,['id','profileKey','criteria','source','context','measurementPlane','measuredAt','gradedAt','result'],'record');text(r.id);if(ids.has(r.id)||!keys.includes(r.profileKey))throw Error('Invalid sweep grading identity.');ids.add(r.id);profile(r.criteria);shape(r.source,['evidenceId','name','sha256','size','kind','stage','asset','native'],'source');for(const k of ['evidenceId','name','kind','stage','asset'])text(r.source[k],300);if(!/^[a-f0-9]{64}$/i.test(r.source.sha256))throw Error('Invalid sweep grading checksum.');if(r.source.kind!=='Sweep'||!['Before','After','Reference'].includes(r.source.stage))throw Error('Invalid sweep grading source classification.');number(r.source.size);if(!Number.isSafeInteger(r.source.size)||r.source.size<0||r.source.size>8388608)throw Error('Invalid sweep grading size.');if(r.source.native!==undefined){shape(r.source.native,['format','direction','referenceState','warnings'],'native');if(!['viavi-testgroup','viavi-cdm2'].includes(r.source.native.format)||!['unknown','forward','reverse'].includes(r.source.native.direction)||!['unknown','unreferenced','referenced'].includes(r.source.native.referenceState))throw Error('Invalid sweep grading native descriptor.');for(const [k,v]of Object.entries(r.source.native)){if(k==='warnings'){if(!Array.isArray(v)||v.length>20)throw Error('Invalid sweep grading warnings.');v.forEach(s=>text(s,500));}else text(v);}}
   complete(r.context,['jobId','jobName','nodeAsset','hardware','recordSnapshot'],'context');for(const [k,v]of Object.entries(r.context))text(v,k==='recordSnapshot'?16000:300);text(r.measurementPlane,500);if(r.measuredAt!==null){text(r.measuredAt,40);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(r.measuredAt)||!Number.isFinite(Date.parse(r.measuredAt)))throw Error('Invalid sweep grading measurement time.');}text(r.gradedAt,40);if(!Number.isFinite(Date.parse(r.gradedAt)))throw Error('Invalid sweep grading calculation time.');result(r.result);
  }return true;
 }
 function empty(){return {profiles:Object.fromEntries(keys.map(k=>[k,{}])),records:[]};}
 function sync(){if(owner!==state){revision++;unavailable.clear();unsaved.clear();digestCache=null;owner=state;draft={plant:'',direction:'',evidenceId:'',measurementPlane:'',measuredAt:''};invalid={};lastRecord=null;message='';observedContext=contextStamp();}}
 const key=()=>draft.plant&&draft.direction?draft.plant+'-'+draft.direction:'';
 const criteria=()=>clone(state.sweepGrading?.profiles?.[key()]||{});
 function data(){if(!state.sweepGrading)state.sweepGrading=empty();return state.sweepGrading;}
 // Keep exact canonical text in memory for synchronous change / away-and-back guards.
 // Only the saved history is compacted; originals still pass EvidenceUI's own SHA check.
 const canonical=value=>JSON.stringify(value,(_,v)=>object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 function context(){
  const s=state,bound=typeof StationView!=='undefined'?StationView.boundRecords(s):[];
  const recordSnapshot=canonical({source:{type:s.setup?.sourceType,model:s.setup?.sourceModel,asset:s.setup?.sourceAsset,port:s.setup?.sourcePort,stationIdentity:s.setup?.stationIdentity},node:s.node||null,rows:(s.rows||[]).map(r=>({id:r.id,device:r.device,parent:r.parent,name:r.name,meters:r.meters||null,stationIdentity:r.stationIdentity})),forward:s.project?.forward||[],returns:s.project?.returns||[],stationRecords:bound});
  return {jobId:String(s.job?.id||''),jobName:String(s.job?.name||s.project?.meta?.job||''),nodeAsset:String(s.job?.node||s.node?.asset||s.project?.meta?.node||''),hardware:String(s.node?.model||s.setup?.sourceModel||s.setup?.sourceType||''),recordSnapshot};
 }
 async function compactContext(ctx){
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ctx.recordSnapshot));
  const recordSnapshot=JSON.stringify({format:'bound-context-sha256-v1',sha256:Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')});
  return {...ctx,recordSnapshot};
 }
 const selected=()=>state.evidence?.find(m=>m.id===draft.evidenceId);
 function identity(m){return m?Object.fromEntries(['id','name','sha256','size','kind','stage','asset'].map(k=>[k,m[k]??''])):null;}
 function signature(){return JSON.stringify({revision,draft,criteria:criteria(),source:identity(selected()),context:context(),invalid});}
 function freshness(r){if(unavailable.has(r.source.evidenceId))return 'Source unavailable for grading: '+unavailable.get(r.source.evidenceId)+' Saved historical checks are unchanged.';const m=state.evidence?.find(e=>e.id===r.source.evidenceId);if(!m)return 'Original unavailable: attachment removed or foreign evidence identity.';if(m.sha256!==r.source.sha256||m.size!==r.source.size||m.kind!==r.source.kind||m.stage!==r.source.stage||m.asset!==r.source.asset)return 'Stale / unknown: source metadata changed.';const currentContext=context();
  // Never migrate an earlier raw snapshot or declare an unverified context current.
  if(!digestCache||digestCache.raw!==currentContext.recordSnapshot)return 'Stale / unknown: source context requires verification for this historical snapshot. Saved checks are unchanged.';
  currentContext.recordSnapshot=digestCache.compact;
  if(JSON.stringify(state.sweepGrading?.profiles?.[r.profileKey]||{})!==JSON.stringify(r.criteria)||JSON.stringify(currentContext)!==JSON.stringify(r.context))return 'Stale / unknown: criteria or source context changed.';return 'Historical snapshot; original availability and integrity require verification to grade again.';
 }
 async function grade(){
  sync();observeContext();if(pending)throw Error('Finish the current grading calculation.');if(!key())throw Error('Explicitly choose a plant and direction.');if(Object.keys(invalid).length)throw Error('Correct the criterion errors shown beside the fields before grading.');const m=selected();if(!m||m.kind!=='Sweep')throw Error('Select an attached Sweep file.');if(draft.measuredAt&&!Number.isFinite(Date.parse(draft.measuredAt)))throw Error('Enter a valid measurement time or leave it unknown.');
  const startOwner=state,startSignature=signature(),chosenKey=key(),entered=criteria(),source=identity(m),ctx=context(),plane=draft.measurementPlane,measuredAt=draft.measuredAt||null;
  if((state.sweepGrading?.records.length||0)>=100)throw Error('Grading history is full (100 records). Back up this job and start a new record job.');pending=true;message='Verifying original bytes and decoding the selected sweep…';render();
  try{
   const verified=await EvidenceUI.verifiedParse(m.id);
   if(state!==startOwner||signature()!==startSignature)throw Error('Job, profile, file or source context changed during verification. No grade saved.');
   const parsed=verified.parse;
   if(!parsed||parsed.status!=='parsed'||!parsed.series)throw Error(parsed?.message||'No eligible sweep trace; original remains attached.');
   if(JSON.stringify(identity(verified.metadata))!==JSON.stringify(source))throw Error('Evidence identity changed during verification. No grade saved.');
   if(parsed.native?.direction&&parsed.native.direction!=='unknown'&&parsed.native.direction!==draft.direction)throw Error('Selected direction conflicts with the native sweep direction.');
   const savedContext=await compactContext(ctx);
   if(state!==startOwner||signature()!==startSignature)throw Error('Job, profile, file or source context changed during verification. No grade saved.');
   const calculated=SweepGrading.evaluateSeries(parsed.series,entered);
   const record={id:'grade_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10),profileKey:chosenKey,criteria:entered,source:{evidenceId:source.id,name:source.name,sha256:source.sha256,size:source.size,kind:source.kind,stage:source.stage,asset:source.asset,...(parsed.native?{native:clone(parsed.native)}:{})},context:savedContext,measurementPlane:plane,measuredAt,gradedAt:new Date().toISOString(),result:calculated};
   validate({profiles:state.sweepGrading?.profiles||empty().profiles,records:[record]});data().records.push(clone(record));digestCache={raw:ctx.recordSnapshot,compact:savedContext.recordSnapshot};lastRecord={id:record.id,signature:startSignature,snapshot:JSON.stringify(record),sourceId:source.id,parsed:parseSnapshot(parsed)};message=saveLocal()===false?'Grade retained in this session; autosave failed. Back up project now.':'Grading snapshot saved. It does not record a balance, sweep date or official acceptance.';return clone(record);
  }catch(e){lastRecord=null;message=e.message;throw e;}finally{pending=false;render();}
 }
 function remapEvidence(candidate,mapping){if(!candidate.sweepGrading)return;validate(candidate.sweepGrading);for(const r of candidate.sweepGrading.records){const id=mapping.get(r.source.evidenceId);if(id)r.source.evidenceId=id;/* Removed originals remain historical and unavailable. */}}
 // Read-only presentation only: records, criteria and comparison operands remain exact.
 function shown(value,roundoffScale=null){
  if(typeof value!=='number'||!Number.isFinite(value))return 'unknown';
  if(value===0)return '0';
  if(roundoffScale!==null&&Math.abs(value)<=4*Number.EPSILON*Math.max(1,Math.abs(roundoffScale),Math.abs(value)))return '≈0';
  return String(Number(value.toPrecision(12)));
 }
 function checks(r){
  const metrics=r.result.metrics,scale=Math.max(1,Math.abs(metrics.lowValue||0),Math.abs(metrics.highValue||0));
  return `<p class="note">Raw low: ${esc(shown(metrics.lowValue))} ${esc(r.result.source.unit||'')} · raw high: ${esc(shown(metrics.highValue))} ${esc(r.result.source.unit||'')} · measured tilt: ${esc(shown(metrics.measuredTiltDb,scale))} dB</p><p class="note">Shown values are shortened for readability; ≈0 marks computed roundoff near zero. Saved numbers and entered limits remain exact.</p><div class="grading-checks">${Object.entries(r.result.checks).map(([k,c])=>{
   const operandScale=k==='lowLevel'?Math.max(1,Math.abs(metrics.lowValue||0),Math.abs(c.target||0)):k==='highLevel'?Math.max(1,Math.abs(metrics.highValue||0),Math.abs(c.target||0)):Math.max(scale,Math.abs(c.target||0));
   return `<div class="status ${c.status==='fail'?'error':c.status==='unknown'?'warning':''}"><strong>${esc({ptv:'Peak-to-valley',lowLevel:'Low level error',highLevel:'High level error',tilt:'Tilt error'}[k])}: ${esc(c.status)}</strong><p>${esc(shown(c.value,operandScale))} dB · limit ${esc(shown(c.limit))} dB${c.target!==null&&c.target!==undefined?' · target '+esc(shown(c.target))+' '+esc(c.targetUnit||''):''}</p><p>${esc(c.reason)}</p></div>`;
  }).join('')}</div>`;
 }
 function fieldError(field){const [,label,unit]=fields.find(f=>f[0]===field);return label+' must be '+(field.endsWith('FrequencyMHz')?'between 5 and 1800 MHz':magnitudes.includes(field)?'0 or more and no more than 1,000,000 '+unit:'between −1,000,000 and 1,000,000 '+unit)+'. Enter a complete finite number, or leave blank for unknown. Previous valid criterion retained.';}
 function showFieldError(el,field,error){
  const note=document.getElementById('grading-error-'+field);if(!note)return;
  const warning=unsaved.get(key()+'.'+field)||'';
  el.setAttribute('aria-invalid',error?'true':'false');el.dataset.gradingUnsaved=warning?'true':'false';
  if(error)el.setAttribute('aria-errormessage',note.id);else el.removeAttribute('aria-errormessage');
  note.textContent=error?'Error: '+error:warning;note.hidden=!note.textContent;
 }
 function savedAgain(){
  if(!unsaved.size)return;unsaved.clear();
  for(const [field]of fields){const input=document.getElementById('grading-'+field);if(input)showFieldError(input,field,invalid[field]||'');}
  if(/autosave failed/i.test(message)){message='Criteria saved on this device. Current grade is stale / unknown.';const status=document.getElementById('gradingStatus');if(status)status.textContent=message;}
 }
 function render(){
  if(typeof state==='undefined'||!state)return;sync();const parent=document.getElementById('evidencePanel');if(!parent)return;let el=document.getElementById('sweepGradingPanel');const open=el?.open??false;if(!el){el=document.createElement('details');el.id='sweepGradingPanel';parent.append(el);}el.open=open;
  // A normal panel rebuild restores the last valid in-session values and clears invalid text/flags together.
  if(Object.keys(invalid).length){invalid={};message=unsaved.size?'Criterion values restored from this session; autosave failed. Back up project now.':'Saved criteria restored after the panel refreshed. Current grade is unknown.';}
  const saveNote=fields.map(([field])=>unsaved.get(key()+'.'+field)).find(Boolean);if(saveNote&&!/autosave failed/i.test(message))message=saveNote;
  const parsedPreview=selected()?.parse,native=parsedPreview?.native,points=parsedPreview?.series?.points;
  const p=criteria(),records=state.sweepGrading?.records||[],disabled=pending?' disabled':'',eligible=(state.evidence||[]).filter(m=>m.kind==='Sweep');if(lastRecord&&JSON.stringify(records.find(r=>r.id===lastRecord.id))!==lastRecord.snapshot){lastRecord=null;message='Saved calculation changed. Current grade is stale / unknown.';}let live=false;try{live=!!lastRecord&&lastRecord.signature===signature();}catch(_){}
  el.innerHTML=`<summary>Grading aid · attached sweeps</summary><p class="note">Your technician grading aid, not official acceptance. Raw values only: no test-point / lead correction, reference subtraction, TPC, normalization or detrending. Compare targets only at the same verified measurement plane. Native file limits are not company criteria. An unreferenced dBmV trace does not establish a referenced response.</p><p class="note">${points?.length?esc(points.length)+' supplied samples · available span '+esc(shown(points[0][0]))+'–'+esc(shown(points[points.length-1][0]))+' MHz · '+esc(parsedPreview.series.unit)+'. Open the source preview to read exact measured frequencies.':'No readable selected trace yet. Verify saved files to rebuild previews.'}</p><p class="note">Native direction: ${esc(native?.direction||'unknown')} · native reference state: ${esc(native?.referenceState||'unknown')}. Your chosen direction is an explicit grading assertion; unknown metadata stays unknown.</p><div class="fields"><label>Attached Sweep<select id="gradingEvidence"${disabled}>${option('','Choose original',draft.evidenceId)}${eligible.map(m=>option(m.id,m.name+' · '+m.stage,draft.evidenceId)).join('')}</select></label><label>Plant<select id="gradingPlant">${option('','Choose plant',draft.plant)}${option('42','42 / 54 MHz',draft.plant)}${option('204','204 / 258 MHz',draft.plant)}</select></label><label>Direction<select id="gradingDirection">${option('','Choose direction',draft.direction)}${option('forward','Forward',draft.direction)}${option('reverse','Reverse',draft.direction)}</select></label><label>Verified measurement plane / reference note<input id="gradingPlane" maxlength="500" value="${esc(draft.measurementPlane)}"></label><label>Measurement time (optional; unknown if blank)<input id="gradingMeasuredAt" type="datetime-local" value="${esc(draft.measuredAt)}"></label></div><p class="note">Company entries start unknown for each plant and direction. Both band markers must be exact measured samples; no interpolation or extrapolation. Application guards: 5–1800 MHz, absolute entry magnitude ≤1,000,000; magnitude limits ≥0. These guards are not OEM specifications.</p><div class="fields">${fields.map(([k,label,unit])=>`<div class="grading-field"><div class="grading-heading"><label for="grading-${k}">${esc(label)} (${unit})</label><span data-grading-tag="${k}"></span></div><input id="grading-${k}" data-grading-field="${k}" type="number" step="any"${k.endsWith('FrequencyMHz')?' min="5" max="1800"':magnitudes.includes(k)?' min="0" max="1000000"':' min="-1000000" max="1000000"'} value="${esc(p[k]??'')}"${key()?'':' disabled'} aria-invalid="false" aria-describedby="grading-error-${k}"><p id="grading-error-${k}" class="grading-field-error" role="alert" hidden></p></div>`).join('')}</div><div class="toolbar"><button id="gradingRun" class="primary"${disabled}>Grade selected sweep</button></div><p id="gradingStatus" class="status" role="status">${esc(message||'Current grade: unknown. Choose an original, plant and direction, enter criteria and grade.')}${!live&&lastRecord?' Current grade is stale / unknown.':''}</p><div>${records.slice().reverse().map(r=>{const m=state.evidence?.find(e=>e.id===r.source.evidenceId),current=live&&lastRecord.id===r.id;return `<details class="rowcard" style="min-width:0;overflow-wrap:anywhere" data-grading-current="${current}"${current?' open':''}><summary>${current?'Current verified calculation':'Historical calculation'}: ${esc(r.result.overall)} · ${esc(r.profileKey)} · ${esc(r.gradedAt)}</summary><p class="note">${esc(current?'Verified for the captured selection and context.':freshness(r))}</p><p class="note">${esc(r.source.name)} · ${esc(r.source.stage)} · ${esc(r.source.asset)} · measured ${esc(r.measuredAt||'unknown')} · calculated ${esc(r.gradedAt)} · ${esc(r.measurementPlane||'measurement plane unknown')}</p><p class="note">${esc(r.result.reason)} Imported raw samples; no corrections applied here. This technician grading aid is not official acceptance.</p><p class="note">Native format: ${esc(r.source.native?.format||'interchange / unknown')} · direction ${esc(r.source.native?.direction||'unknown')} · reference ${esc(r.source.native?.referenceState||'unknown')}. Raw unreferenced PTV is not normalized ripple; no corrections or reference subtraction are applied.</p>${(r.source.native?.warnings||[]).map(t=>'<p class="note">'+esc(t)+'</p>').join('')}${checks(r)}${savedCriteria(r)}<p class="note" style="overflow-wrap:anywhere">Original SHA-256: ${esc(r.source.sha256)}</p>${m?`<button type="button" data-evidence-download="${esc(m.id)}">Save source original</button>`:'<p class="status warning">Original unavailable for this job.</p>'}</details>`;}).join('')||'<p class="note">No saved grading snapshots.</p>'}</div>`;
  if(typeof Thresholds!=='undefined')for(const t of el.querySelectorAll('[data-grading-tag]'))t.innerHTML=key()?Thresholds.tag('company.grading.'+key()+'.'+t.dataset.gradingTag):'<span class="source-tag source-company">Company</span>';
  for(const [field]of fields){const input=document.getElementById('grading-'+field);if(input)showFieldError(input,field,'');}
 }
 function markStale(){
  lastRecord=null;
  for(const card of document.querySelectorAll('[data-grading-current="true"]')){
   card.dataset.gradingCurrent='false';const summary=card.querySelector('summary'),note=card.querySelector('p');
   summary.textContent=summary.textContent.replace('Current verified calculation','Historical calculation');if(note)note.textContent='Stale / unknown: criteria or source context changed. Saved checks remain historical snapshots.';
  }
 }
 function observeOriginal(id,available,reason='Original unavailable.'){
  sync();if(available){const recovered=unavailable.delete(id);if(recovered&&draft.evidenceId===id){message='Original verified again. Current grade is unknown; grade the selected sweep to create a new calculation.';const status=document.getElementById('gradingStatus');if(status)status.textContent=message;}return;}
  unavailable.set(id,String(reason).slice(0,900));
  if(lastRecord?.sourceId===id){revision++;markStale();message='Current grade is stale / unknown: '+String(reason).slice(0,900);const status=document.getElementById('gradingStatus');if(status)status.textContent=message;}
 }
 function observeParse(id,parsed){
  if(parsed?.status!=='parsed'||!parsed.series){observeOriginal(id,false,parsed?.message||'No eligible sweep trace.');return;}
  observeOriginal(id,true);
  if(lastRecord?.sourceId===id&&lastRecord.parsed!==parseSnapshot(parsed)){revision++;markStale();message='Reparsed source changed. Current grade is stale / unknown.';}
 }
 function contextStamp(){try{return JSON.stringify(context());}catch(error){return 'Context unavailable: '+error.message;}}
 function observeContext(){
  sync();const next=contextStamp();if(next===observedContext)return;
  observedContext=next;revision++;markStale();message='Source context changed. Current grade is stale / unknown.';
  const status=document.getElementById('gradingStatus');if(status)status.textContent=message;
 }
 function savedCriteria(r){return '<p class="note">Saved company criteria:</p><ul class="note">'+fields.map(([field,label,unit])=>'<li>'+esc(label)+': <strong>'+esc(shown(r.criteria[field]))+' '+esc(unit)+'</strong></li>').join('')+'</ul>';}
 function init(){if(initialized)return;initialized=true;
  // Every existing route/record/source mutation persists through this boundary.
  // Compare meaningful grading context so unchanged autosaves remain harmless.
  const previousSaveLocal=saveLocal;saveLocal=function(...args){observeContext();const saved=previousSaveLocal(...args);if(saved!==false)savedAgain();return saved;};
  document.addEventListener('input',e=>{sync();const id=e.target.id,field=e.target.dataset.gradingField;if(field){if(!key())return;revision++;const el=e.target;/* Read browser validity before its sanitized blank value. */const raw=el.value,v=raw.trim()===''?null:Number(raw),bad=el.validity.badInput||!el.validity.valid||v!==null&&(!Number.isFinite(v)||Math.abs(v)>1000000||magnitudes.includes(field)&&v<0||field.endsWith('FrequencyMHz')&&(v<5||v>1800));if(bad){invalid[field]=fieldError(field);showFieldError(el,field,invalid[field]);message=invalid[field];}else{delete invalid[field];const p=data().profiles[key()];if(v===null)delete p[field];else p[field]=v;const saved=saveLocal()!==false;if(!saved)unsaved.set(key()+'.'+field,'Not saved: '+fields.find(f=>f[0]===field)[1]+' is retained in this session; autosave failed. Back up project now.');showFieldError(el,field,'');message=saved?'Criteria changed. Current grade is stale / unknown.':unsaved.get(key()+'.'+field);}markStale();const status=document.getElementById('gradingStatus');if(status)status.textContent=message;return;}
   if(id==='gradingPlane'||id==='gradingMeasuredAt'){revision++;draft[id==='gradingPlane'?'measurementPlane':'measuredAt']=e.target.value;markStale();message='Source context changed. Current grade is unknown.';const status=document.getElementById('gradingStatus');if(status)status.textContent=message;}
  });
  document.addEventListener('change',e=>{sync();const map={gradingPlant:'plant',gradingDirection:'direction',gradingEvidence:'evidenceId'};if(map[e.target.id]){revision++;draft[map[e.target.id]]=e.target.value;invalid={};lastRecord=null;message='Selection changed. Current grade is unknown.';render();}});
  document.addEventListener('click',e=>{const target=e.target.closest('[data-grading-profile]');if(target&&keys.includes(target.dataset.gradingProfile)){sync();revision++;[draft.plant,draft.direction]=target.dataset.gradingProfile.split('-');invalid={};lastRecord=null;render();document.getElementById('sweepGradingPanel').open=true;}if(e.target.closest('#gradingRun'))grade().catch(error=>{message=error.message;lastRecord=null;if(Object.keys(invalid).length){const status=document.getElementById('gradingStatus');if(status)status.textContent=message;}else render();});});
 }
 return {init,render,grade,validate,empty,remapEvidence,freshness,observeOriginal,observeParse};
})();
