/* 1.8 Alpha build 2 guided field setup. Measurements remain separate from calculations.
 * The 42 MHz method uses return sweepless sweep; it has no injected-return setup.
 * XPERTrak is operated separately. This module never connects to or controls plant. */
const SweepSetup=(()=>{
 const splits=['42','204'];
 const definitions={
  '42':{label:'42 / 54 MHz',ceiling:42,floor:54,forward:'Forward sweepless sweep',reverse:'Return sweepless sweep'},
  '204':{label:'204 / 258 MHz',ceiling:204,floor:258,forward:'Forward sweepless sweep',reverse:'Return sweep with XPERTrak'}
 };
 const fieldLabels={station:'Station / amplifier ID',leg:'Node / leg / port',equipment:'Installed equipment and revision',method:'Alignment procedure',procedure:'Approved procedure / design revision',plan:'ONX service / sweep plan ID',reference:'Saved reference trace ID',referenceDate:'Reference date',referenceSource:'Reference source / node / port',plane:'Measurement plane / displayed quantity',forwardUpper:'Installed downstream upper MHz',forwardAvailable:'Available downstream spectrum upper MHz',coverage:'Return spectrum covered / gaps',notes:'Setup / closeout notes',comparisonMode:'Comparison basis',lowMHz:'Return low marker MHz',highMHz:'Return high marker MHz',measuredLow:'Entered low reading',measuredHigh:'Entered high reading',addLow:'Remaining low receive addback dB',addHigh:'Remaining high receive addback dB',targetLow:'Approved low target',targetHigh:'Approved high target',desiredInjection:'Desired network-plane injection dBmV',injectionCoupling:'Total physical injection coupling loss dB',leadLoss:'Total physical test lead loss dB',generatorMaximum:'Maximum physical output for configured meter mode dBmV'};
 const methods={manual:'GainMaker manual balancing',aoi:'AOI Quantum18 SA auto alignment',installed:'Other installed-equipment procedure'};
 Object.assign(fieldLabels,{referencePlan:'Reference service / sweep plan ID',currentBandwidth:'Current return reference bandwidth',referenceBandwidth:'Saved return reference bandwidth',currentView:'Current return sweep view',referenceView:'Saved return sweep view'});
 const bandwidths={'modem':'Modem Default','1.6':'1.6 MHz','6.4':'6.4 MHz'},views={'detailed':'Detailed','1.6':'1.6 MHz'};
 Object.assign(fieldLabels,{txReference:'Operator return TX reference (dBmV)',txReferenceChannels:'Return TX frequencies / service plan'});
 const numerical=new Set(['txReference','forwardUpper','forwardAvailable','lowMHz','highMHz','measuredLow','measuredHigh','addLow','addHigh','targetLow','targetHigh','desiredInjection','injectionCoupling','leadLoss','generatorMaximum']);
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const text=x=>typeof x==='string'||typeof x==='number'&&Number.isFinite(x)?String(x):'';
 const number=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const ownState=()=>typeof state!=='undefined'&&state?state:{};
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=x=>x===null||!Number.isFinite(x)?'—':x.toFixed(2);
 let initialized=false,renderedOwner=null,renderedSplit='',exportStatus='';
 function profileDefaults(split){return {...Object.fromEntries(Object.keys(fieldLabels).map(k=>[k,''])),method:split==='42'?'manual':'installed',comparisonMode:'relative',step:'',steps:{}};}
 function defaults(){return {version:1,selected:'42',profiles:{'42':profileDefaults('42'),'204':profileDefaults('204')},history:[]};}
 function validate(value){
  if(value===undefined||value===null)return;
  if(!record(value)||Object.keys(value).some(k=>!['version','selected','profiles','history'].includes(k)))throw Error('Invalid sweep setup data.');
  if(value.version!==undefined&&value.version!==1)throw Error('Unsupported sweep setup version.');
  if(value.selected!==undefined&&!splits.includes(value.selected))throw Error('Invalid sweep setup split.');
  if(value.profiles!==undefined&&!record(value.profiles))throw Error('Invalid sweep setup profiles.');
  for(const [split,p] of Object.entries(value.profiles||{})){
   if(!splits.includes(split)||!record(p))throw Error('Invalid sweep setup profile.');
   for(const [key,v] of Object.entries(p)){
    if(key==='steps')continue;
    if(!Object.hasOwn(fieldLabels,key)&&key!=='step')throw Error('Unknown sweep setup field.');
    const limit=['notes','coverage'].includes(key)?8000:numerical.has(key)?100:1000;
    if((typeof v!=='string'&&typeof v!=='number')||(typeof v==='number'&&!Number.isFinite(v))||String(v).length>limit)throw Error('Invalid sweep setup '+key+'.');
   }
   if(p.txReference!==undefined&&text(p.txReference).trim()!==''&&number(p.txReference)===null)throw Error('Invalid return TX reference; enter a finite dBmV value or leave blank.');
   if(split!=='42'&&['txReference','txReferenceChannels'].some(key=>p[key]!==undefined&&text(p[key]).trim()!==''))throw Error('The operator return TX reference and frequencies belong only to the 42 MHz workflow.');
   if(p.method!==undefined&&!Object.hasOwn(methods,p.method))throw Error('Invalid sweep alignment method.');
   if(split==='42'&&p.method==='aoi')throw Error('AOI Quantum18 SA auto alignment is not a 42 MHz preset.');
   if(p.comparisonMode!==undefined&&!['relative','absolute'].includes(p.comparisonMode))throw Error('Invalid return comparison basis.');
   if(split==='42'&&p.comparisonMode==='absolute')throw Error('42 MHz return sweepless comparison must use the referenced response.');
   for(const key of ['currentBandwidth','referenceBandwidth'])if(p[key]!==undefined&&p[key]!==''&&!Object.hasOwn(bandwidths,p[key]))throw Error('Invalid return reference bandwidth.');
   for(const key of ['currentView','referenceView'])if(p[key]!==undefined&&p[key]!==''&&!Object.hasOwn(views,p[key]))throw Error('Invalid return sweep view.');
   if(p.steps!==undefined&&(!record(p.steps)||Object.keys(p.steps).length>80))throw Error('Invalid sweep setup checklist.');
   for(const [id,item] of Object.entries(p.steps||{})){
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||!record(item)||Object.keys(item).some(k=>!['done','notes'].includes(k)))throw Error('Invalid sweep setup step.');
    if(item.done!==undefined&&typeof item.done!=='boolean')throw Error('Sweep setup completion must be true or false.');
    if(item.notes!==undefined&&(typeof item.notes!=='string'||item.notes.length>8000))throw Error('Invalid sweep step notes.');
   }
  }
  if(value.history!==undefined&&(!Array.isArray(value.history)||value.history.length>100))throw Error('Sweep setup history is limited to 100 station snapshots.');
  for(const item of value.history||[]){
   if(!record(item)||Object.keys(item).some(k=>!['createdAt','split','profile','training'].includes(k))||!splits.includes(item.split)||!record(item.profile))throw Error('Invalid sweep station snapshot.');
   if(typeof item.createdAt!=='string'||item.createdAt.length>40||!/^\d{4}-\d{2}-\d{2}T/.test(item.createdAt)||!Number.isFinite(Date.parse(item.createdAt)))throw Error('Invalid sweep snapshot time.');
   if(item.training!==undefined&&typeof item.training!=='boolean')throw Error('Invalid sweep snapshot provenance.');
   validate({profiles:{[item.split]:item.profile}});
  }
 }
 function normalized(value){
  const raw=record(value)?value:{},p=record(raw.profiles)?raw.profiles:{};
  return {version:1,selected:splits.includes(raw.selected)?raw.selected:'42',history:Array.isArray(raw.history)?raw.history.map(item=>({...item,profile:JSON.parse(JSON.stringify(item.profile))})):[],profiles:Object.fromEntries(splits.map(split=>{
   const source=record(p[split])?p[split]:{},base=profileDefaults(split);
   for(const key of Object.keys(fieldLabels))if(source[key]!==undefined)base[key]=text(source[key]);
   base.step=text(source.step);base.steps=record(source.steps)?Object.fromEntries(Object.entries(source.steps).map(([id,item])=>[id,{done:item?.done===true,notes:text(item?.notes)}])):{};
   if(split==='42')base.comparisonMode='relative';
   return [split,base];
  }))};
 }
 function draft(){return normalized(ownState().sweepSetup);}
 function guide(split){const source=typeof SweepSetupGuide!=='undefined'?SweepSetupGuide.profiles?.[split]:null;return source||{title:definitions[split].label+' setup',summary:'Detailed guide unavailable in this build.',steps:[],sources:[]};}
 function activeStep(p,split){const steps=guide(split).steps||[];return steps.find(x=>x.id===p.step)||steps[0]||null;}
 function frequencyStatus(p,split){
  const low=number(p.lowMHz),high=number(p.highMHz),ceiling=definitions[split]?.ceiling;
  if(!ceiling)return {valid:false,detail:'Choose a supported return split.'};
  if(low===null||high===null)return {valid:false,detail:'Enter the two return marker frequencies.'};
  if(low<5||high<=low||high>ceiling)return {valid:false,detail:'Return markers must satisfy 5 MHz ≤ low < high ≤ '+ceiling+' MHz.'};
  return {valid:true,detail:'Markers are inside the nominal return band. Confirm both are covered by this test; two markers do not verify the whole band.'};
 }
 function comparison(p={},split='42'){
  const mode=split==='42'?'relative':p.comparisonMode==='absolute'?'absolute':'relative',frequency=frequencyStatus(p,split);
  const out={valid:false,mode,unit:mode==='absolute'?'dBmV':'dB',low:null,high:null,tilt:null,targetTilt:null,lowError:null,highError:null,tiltError:null,detail:frequency.detail};
  if(!frequency.valid)return out;
  if(split==='42'){
   if(!['currentBandwidth','referenceBandwidth','currentView','referenceView'].every(k=>p[k])){out.detail='Record current and saved reference bandwidths and sweep views before comparing return sweepless readings.';return out;}
   if(!Object.hasOwn(bandwidths,p.currentBandwidth)||!Object.hasOwn(bandwidths,p.referenceBandwidth)||!Object.hasOwn(views,p.currentView)||!Object.hasOwn(views,p.referenceView)){out.detail='Choose valid reference bandwidths and sweep views.';return out;}
   if(p.currentBandwidth!==p.referenceBandwidth||p.currentView!==p.referenceView){out.detail='Reference mismatch: bandwidth and sweep view must match the saved reference. Select a matching reference or establish a new approved reference.';return out;}
  }
  if(p.plan&&p.referencePlan&&text(p.plan).trim()!==text(p.referencePlan).trim()){out.detail='Reference mismatch: current and saved service / sweep plan IDs differ. Confirm a compatible reference before comparing.';return out;}
  const low=number(p.measuredLow),high=number(p.measuredHigh),tl=number(p.targetLow),th=number(p.targetHigh),al=mode==='absolute'?number(p.addLow):0,ah=mode==='absolute'?number(p.addHigh):0;
  if([low,high,tl,th,al,ah].some(x=>x===null)){out.detail=mode==='absolute'?'Enter both readings, both targets and remaining receive addbacks. Enter 0 only when no correction remains.':'Enter both referenced readings and both approved relative targets. Blank targets are not assumed to be zero.';return out;}
  if(al<0||ah<0){out.detail='Remaining receive addbacks must be nonnegative.';return out;}
  out.low=low+al;out.high=high+ah;out.tilt=out.high-out.low;out.targetTilt=th-tl;out.lowError=out.low-tl;out.highError=out.high-th;out.tiltError=out.tilt-out.targetTilt;
  if(![out.low,out.high,out.tilt,out.targetTilt,out.lowError,out.highError,out.tiltError].every(Number.isFinite)){out.detail='These values exceed the usable calculation range.';return {...out,low:null,high:null,tilt:null,targetTilt:null,lowError:null,highError:null,tiltError:null};}
  out.valid=true;out.detail=mode==='absolute'?'Arithmetic at the named receive plane only. No automatic pad/EQ change or acceptance decision.':'Difference from the saved reference only. No physical receive level, injection level or pad value is inferred.';
  return out;
 }
 function generator(p={},split='204'){
  if(split!=='204')return {valid:false,setting:null,withinCapability:null,detail:'Return sweepless sweep has no injected-return setting in this workflow.'};
  const desired=number(p.desiredInjection),coupling=number(p.injectionCoupling),lead=number(p.leadLoss),maximum=number(p.generatorMaximum);
  if([desired,coupling,lead].some(x=>x===null)||coupling<0||lead<0)return {valid:false,setting:null,withinCapability:null,detail:'Enter desired network-plane injection and total physical coupling / lead losses. Blank is unknown; losses must be nonnegative.'};
  const setting=desired+coupling+lead;if(!Number.isFinite(setting))return {valid:false,setting:null,withinCapability:null,detail:'These values exceed the usable calculation range.'};
  const withinCapability=maximum===null?null:setting<=maximum;
  return {valid:true,setting,withinCapability,detail:maximum===null?'Generator output estimate; capability unverified until the installed meter / mode limit is entered.':withinCapability?'At or below the entered output maximum. Frequency, mode and approved sweep configuration still require verification.':'Required output exceeds the entered maximum. Resolve the test setup before using this injection level.'};
 }
 function methodNote(p,split){
  if(p.method==='manual')return 'GainMaker manual balancing: establish the return link / reference, then work from the amplifier nearest the node outward through each branch. Follow the installed model for return EQ and output-pad changes; preserve design return input pads.';
  if(p.method==='aoi'&&split==='204')return 'AOI Quantum18 SA auto alignment: complete downstream setup for the cascade first. The SA procedure begins upstream alignment at the last amplifier and works toward the node. Save the successful alignment and verify with the approved return test. Confirm the installed model / revision uses this procedure.';
  return 'Record the exact installed-equipment procedure and its work order. The frequency split alone does not determine the alignment sequence.';
 }
 function persist(){saveLocal();refresh();}
 function storeProfile(patch){const data=draft();data.profiles[data.selected]={...data.profiles[data.selected],...patch};ownState().sweepSetup=data;persist();}
 function field(key,p,{type='text',label=fieldLabels[key],hint='',min='',max=''}={}){return `<label>${escape(label)}<input type="${type}" ${type==='number'?'step="any" inputmode="decimal"':''} ${min!==''?`min="${min}"`:''} ${max!==''?`max="${max}"`:''} data-sweep-field="${key}" value="${escape(p[key])}" maxlength="${numerical.has(key)?100:1000}" placeholder="Not recorded">${hint?'<span class="note">'+escape(hint)+'</span>':''}</label>`;}
 function area(key,p,label=fieldLabels[key]){return `<label>${escape(label)}<textarea data-sweep-field="${key}" maxlength="8000" placeholder="Record findings, covered spectrum, trace names or follow-up">${escape(p[key])}</textarea></label>`;}
 function selection(value,label,current){return `<option value="${escape(value)}"${value===current?' selected':''}>${escape(label)}</option>`;}
 function render(){
  if(typeof document==='undefined')return;
  let panel=document.getElementById('sweepSetupPanel');
  if(!panel){panel=document.createElement('section');panel.id='sweepSetupPanel';panel.className='panel sweep-setup-panel';panel.dataset.screen='sweepSetup';panel.hidden=true;document.querySelector('main')?.appendChild(panel);}
  const owner=ownState(),data=draft(),split=data.selected,p=data.profiles[split],g=guide(split),step=activeStep(p,split),steps=g.steps||[],index=steps.findIndex(x=>x.id===step?.id);
  const active=document.activeElement;
  if(renderedOwner===owner&&renderedSplit===split&&panel.contains(active)&&['INPUT','TEXTAREA'].includes(active.tagName)){refresh();return;}
  const open=renderedOwner===owner&&renderedSplit===split?new Set([...panel.querySelectorAll('details[open]')].map(x=>x.dataset.sweepSection)):new Set(['profile']);
  panel.innerHTML=`<div class="sectionhead"><div><h2>Sweep setup</h2><p class="note tight">Two field workflows. Each keeps its own settings and notes with this job.</p></div><button type="button" data-sweep-export>Export setup notes</button></div>
   ${owner.job?.training==='guided-1.5'?'<p class="status warning">SYNTHETIC TRAINING JOB: all readings, notes and snapshots are practice data, not field measurements or acceptance.</p>':''}
   <div class="sweep-split-switch" role="group" aria-label="Plant split">${splits.map(id=>`<button type="button" data-sweep-split="${id}" aria-pressed="${id===split}"><strong>${definitions[id].label}</strong><span>${escape(definitions[id].reverse)}</span></button>`).join('')}</div>
   <div class="sweep-method-summary"><span class="eyebrow">${escape(g.title||definitions[split].label)}</span><p>${escape(g.summary||'')}</p><p class="note">${escape(definitions[split].forward)} · ${escape(definitions[split].reverse)}</p></div>
   <details class="sweep-settings" data-sweep-section="profile"${open.has('profile')?' open':''}><summary>Plant, equipment and reference</summary><div class="sweep-fields">
    ${field('station',p)}${field('leg',p)}${field('equipment',p)}
    <label>Alignment procedure<select data-sweep-field="method">${Object.entries(methods).filter(([id])=>split==='204'||id!=='aoi').map(([id,label])=>selection(id,label,p.method)).join('')}</select></label>
    ${field('procedure',p)}${field('plan',p)}${field('forwardUpper',p,{type:'number',min:definitions[split].floor,max:1800})}${field('forwardAvailable',p,{type:'number',min:definitions[split].floor,max:1800})}
   </div><p class="note">Nominal return 5–${definitions[split].ceiling} MHz; forward starts at ${definitions[split].floor} MHz. Hardware limits, live spectrum and selected markers are separate.</p><div id="sweepMethodNote" class="status"></div><div id="sweepBandNote" class="note"></div><div class="sweep-fields">
    ${field('reference',p)}${field('referenceDate',p,{type:'date'})}${field('referenceSource',p)}${field('referencePlan',p)}${field('plane',p,{hint:split==='42'?'Name the referenced response / normalization shown by the ONX.':'Name the XPERTrak node / receiver plane and displayed quantity.'})}
   </div>${split==='42'?`<div class="sweep-fields">${field('txReference',p,{type:'number',hint:'Operator reference only. Verify the actual transmitter, service plan, frequency and reference plane before setting equipment; this is not a receiver target or injected-return setting.'})}${field('txReferenceChannels',p,{hint:'Record the approved transmitter frequencies or service plan. A dBmV value does not identify a frequency; no return frequencies are assumed.'})}</div><div class="sweep-fields">${['currentBandwidth','referenceBandwidth'].map(key=>`<label>${escape(fieldLabels[key])}<select data-sweep-field="${key}">${selection('','Not recorded',p[key])}${Object.entries(bandwidths).map(([value,label])=>selection(value,label,p[key])).join('')}</select></label>`).join('')}${['currentView','referenceView'].map(key=>`<label>${escape(fieldLabels[key])}<select data-sweep-field="${key}">${selection('','Not recorded',p[key])}${Object.entries(views).map(([value,label])=>selection(value,label,p[key])).join('')}</select></label>`).join('')}</div><p class="note">Reference bandwidth and sweep view are different ONX settings. Match both to the saved reference. Reverse sweepless absolute response is estimated from DOCSIS information; it is not a raw optical receiver reading.</p>`:''}${area('coverage',p)}</details>
   <section class="sweep-guide" aria-labelledby="sweepGuideHeading"><div class="sectionhead"><h3 id="sweepGuideHeading">Guided setup</h3><span id="sweepSetupProgress" class="pill"></span></div>
    ${step?`<label>Current step<select data-sweep-step-select>${steps.map((item,i)=>selection(item.id,(i+1)+'. '+item.title,step.id)).join('')}</select></label><article class="sweep-step"><span class="eyebrow">Step ${index+1} of ${steps.length}</span><h3 tabindex="-1" id="sweepCurrentStepHeading">${escape(step.title)}</h3><div class="sweep-step-body">${step.body||''}</div><label class="check sweep-step-check"><input type="checkbox" data-sweep-step-done="${escape(step.id)}"${p.steps[step.id]?.done?' checked':''}>I recorded this step</label><label>Step notes / evidence reference<textarea data-sweep-step-note="${escape(step.id)}" maxlength="8000" placeholder="Actual findings and trace filenames; leave unchecked if not performed">${escape(p.steps[step.id]?.notes||'')}</textarea></label></article><div class="sweep-step-nav"><button type="button" data-sweep-step-go="${escape(steps[index-1]?.id||'')}"${index<=0?' disabled':''}>Previous</button><span>${index+1} / ${steps.length}</span><button type="button" class="primary" data-sweep-step-go="${escape(steps[index+1]?.id||'')}"${index>=steps.length-1?' disabled':''}>Next step</button></div>`:'<p class="status warning">The setup guide is not included in this build.</p>'}
    <p class="note">Progress records technician actions. Checked steps do not establish RF acceptance.</p>
   </section>
   <details class="sweep-settings" data-sweep-section="measurements"${open.has('measurements')?' open':''}><summary>Compare return markers</summary><p class="note">Enter values from the actual test. Match the saved reference, port, plan, units and compensation before comparing.</p>
    ${split==='204'?`<label>Comparison basis<select data-sweep-field="comparisonMode">${selection('relative','Referenced response (dB)',p.comparisonMode)}${selection('absolute','Absolute receive level (dBmV)',p.comparisonMode)}</select></label>`:'<p class="status">42 MHz return sweepless: compare the referenced response in dB. No injection or physical receive level is inferred.</p>'}
    <div class="sweep-fields">${field('lowMHz',p,{type:'number',min:5,max:definitions[split].ceiling})}${field('highMHz',p,{type:'number',min:5,max:definitions[split].ceiling})}${field('measuredLow',p,{type:'number',label:'Entered low reading ('+(p.comparisonMode==='absolute'?'dBmV':'dB')+')'})}${field('measuredHigh',p,{type:'number',label:'Entered high reading ('+(p.comparisonMode==='absolute'?'dBmV':'dB')+')'})}${field('targetLow',p,{type:'number',label:'Approved low target ('+(p.comparisonMode==='absolute'?'dBmV':'dB')+')'})}${field('targetHigh',p,{type:'number',label:'Approved high target ('+(p.comparisonMode==='absolute'?'dBmV':'dB')+')'})}
    ${split==='204'&&p.comparisonMode==='absolute'?field('addLow',p,{type:'number',min:0})+field('addHigh',p,{type:'number',min:0}):''}</div>
    ${split==='204'&&p.comparisonMode==='absolute'?'<p class="note">Add only receive-path losses not already included in the displayed reading. Do not add injection coupling to a receive reading.</p>':''}<div id="sweepComparisonResult" role="status" aria-live="polite"></div>
   </details>
   ${split==='204'?`<details class="sweep-settings" data-sweep-section="injection"${open.has('injection')?' open':''}><summary>Return sweep injection budget</summary><p class="note">Use the approved XPERTrak / ONX sweep setup. This estimates physical generator output; it is not an instruction to enter that total into the ONX Injection field.</p><div class="sweep-fields">${['desiredInjection','injectionCoupling','leadLoss','generatorMaximum'].map(key=>field(key,p,{type:'number',min:['injectionCoupling','leadLoss'].includes(key)?0:''})).join('')}</div><p class="note">Physical connector output = desired network-plane injection + total physical injection coupling + total physical lead loss. Enter the full physical losses here, even when ONX compensation is enabled. Verify the applicable meter mode and physical output limit.</p><p class="status warning">Do not enter the summed physical-output estimate as ONX Reverse Sweep Injection while also entering the same TPC. The ONX network-plane injection field and its separate reverse TPC work together; follow the meter setup procedure for those controls.</p><div id="sweepGeneratorResult" role="status" aria-live="polite"></div></details>`:''}
   <details class="sweep-settings" data-sweep-section="closeout"${open.has('closeout')?' open':''}><summary>Closeout notes and sources</summary>${area('notes',p)}<p class="note">Keep original forward / return / ingress / OneCheck files in Job → ONX files. NightSweep does not operate the ONX or sign in to XPERTrak.</p><ul class="sweep-sources">${(g.sources||[]).filter(s=>/^https:\/\//.test(s.url||'')).map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a></li>`).join('')}</ul></details>
   <section class="sweep-history"><div class="sectionhead"><div><h3>Save this station</h3><p class="note tight">Preserve this station before editing the next one. Saves notes and readings, not an acceptance decision.</p></div><button type="button" data-sweep-snapshot>Save station snapshot</button></div><details data-sweep-section="history"${open.has('history')?' open':''}><summary>Saved station snapshots (${data.history.length} / 100)</summary>${data.history.length?'<ol class="sweep-history-list">'+data.history.map(item=>'<li><strong>'+escape(item.profile.station||'Unnamed station')+'</strong> · '+escape(definitions[item.split].label)+'<span>'+escape(item.createdAt)+(item.training?' · Synthetic training':'')+'</span><p>'+escape(item.profile.leg||'No leg recorded')+' · '+escape(item.profile.reference||'No reference recorded')+'</p></li>').join('')+'</ol>':'<p class="note">No station snapshots yet. Export includes all saved snapshots and both current profiles.</p>'}</details></section>
   <p id="sweepExportStatus" class="note" role="status">${escape(exportStatus)}</p>`;
  renderedOwner=owner;renderedSplit=split;refresh();
 }
 function refresh(){
  if(typeof document==='undefined')return;const data=draft(),split=data.selected,p=data.profiles[split],g=guide(split),result=comparison(p,split),inj=generator(p,split);
  const progress=document.getElementById('sweepSetupProgress');if(progress)progress.textContent=(g.steps||[]).filter(x=>p.steps[x.id]?.done===true).length+' / '+(g.steps||[]).length+' steps recorded';
  const method=document.getElementById('sweepMethodNote');if(method)method.textContent=methodNote(p,split);
  const band=document.getElementById('sweepBandNote');if(band){const upper=number(p.forwardUpper),live=number(p.forwardAvailable),floor=definitions[split].floor;band.textContent=upper===null||live===null?'Enter installed and live downstream upper limits before selecting a forward sweep span.':upper<floor||upper>1800||live<floor||live>upper?'Review downstream limits: available spectrum must fit within the entered installed passband.':'Entered downstream limits recorded. A sweepless trace verifies only spectrum actually measured.';}
  const comparisonEl=document.getElementById('sweepComparisonResult');if(comparisonEl)comparisonEl.innerHTML=`<p class="status${result.valid?'':' warning'}">${escape(result.detail)}</p>${result.valid?`<div class="sweep-result-grid"><div><span>${result.mode==='absolute'?'Corrected':'Referenced'} low / high (${result.unit})</span><strong>${fmt(result.low)} / ${fmt(result.high)}</strong></div><div><span>High minus low (dB)</span><strong>${fmt(result.tilt)}</strong></div><div><span>Low / high error (dB)</span><strong>${fmt(result.lowError)} / ${fmt(result.highError)}</strong></div><div><span>Tilt error (dB)</span><strong>${fmt(result.tiltError)}</strong></div></div><p class="note">Positive level error means above the entered target. Review the full trace and installed procedure before changing settings.</p>`:''}`;
  const generatorEl=document.getElementById('sweepGeneratorResult');if(generatorEl)generatorEl.innerHTML=`${inj.valid?'<div class="sweep-generator-number"><span>Estimated physical generator output</span><strong>'+fmt(inj.setting)+' <small>dBmV</small></strong></div>':''}<p class="status${inj.withinCapability===false?' error':inj.withinCapability===null?' warning':''}">${escape(inj.detail)}</p>`;
 }
 function changeStep(id){const data=draft(),g=guide(data.selected);if(!(g.steps||[]).some(x=>x.id===id))return;storeProfile({step:id});render();document.getElementById('sweepCurrentStepHeading')?.focus({preventScroll:true});}
 function edit(event){
  const t=event.target;if(!t.closest?.('#sweepSetupPanel'))return;const select=t.tagName==='SELECT',checkbox=t.type==='checkbox';
  if(event.type==='input'&&(select||checkbox)||event.type==='change'&&!select&&!checkbox)return;
  if(t.dataset.sweepField&&Object.hasOwn(fieldLabels,t.dataset.sweepField)){storeProfile({[t.dataset.sweepField]:t.value});if(select)render();}
  else if(t.hasAttribute('data-sweep-step-select'))changeStep(t.value);
  else{const id=t.dataset.sweepStepDone||t.dataset.sweepStepNote;if(!id)return;const data=draft(),p=data.profiles[data.selected];if(!(guide(data.selected).steps||[]).some(x=>x.id===id))return;storeProfile({steps:{...p.steps,[id]:{...(p.steps[id]||{done:false,notes:''}),[t.dataset.sweepStepDone?'done':'notes']:t.dataset.sweepStepDone?t.checked:t.value}}});}
 }
 function plain(html){
  if(typeof document!=='undefined'){const box=document.createElement('div');box.innerHTML=html;box.querySelectorAll('li,p,h3,h4,div').forEach(e=>e.append(document.createTextNode('\n')));return box.textContent.replace(/\n\s*\n/g,'\n').trim();}
  return String(html||'').replace(/<\/(?:p|li|div|h\d)>/g,'\n').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
 }
 function profileReport(p,id){
  const g=guide(id),c=comparison(p,id),inj=generator(p,id),skip=id==='42'?['desiredInjection','injectionCoupling','leadLoss','generatorMaximum','addLow','addHigh']:['currentBandwidth','referenceBandwidth','currentView','referenceView','txReference','txReferenceChannels'];
  return [definitions[id].label+' · '+definitions[id].forward+' / '+definitions[id].reverse,...Object.entries(fieldLabels).filter(([key])=>!skip.includes(key)&&text(p[key]).trim()!=='').map(([key,label])=>label+': '+(key==='method'?methods[p[key]]||p[key]:key.endsWith('Bandwidth')?bandwidths[p[key]]||p[key]:key.endsWith('View')?views[p[key]]||p[key]:p[key])),'',...Object.entries(p.steps||{}).filter(([,item])=>item.done||item.notes).flatMap(([key,item])=>[(g.steps||[]).find(step=>step.id===key)?.title||'Saved step '+key, '  '+(item.done?'Recorded':'Not recorded'),...(item.notes?['  Notes: '+item.notes]:[])]),...(id==='42'&&text(p.txReference).trim()!==''?['Return TX reference is operator-entered. Verify the transmitter, frequencies / service plan and reference plane; it is not a receive target or injected-return setting.']:[]),'Return marker comparison: '+c.detail,...(c.valid?['Low / high: '+fmt(c.low)+' / '+fmt(c.high)+' '+c.unit,'High minus low: '+fmt(c.tilt)+' dB','Low / high error: '+fmt(c.lowError)+' / '+fmt(c.highError)+' dB','Tilt error: '+fmt(c.tiltError)+' dB']:[]),...(id==='204'&&['desiredInjection','injectionCoupling','leadLoss','generatorMaximum'].some(key=>text(p[key]).trim())?['Physical generator-output budget: '+(inj.valid?fmt(inj.setting)+' dBmV. ':'')+inj.detail,'Total physical losses are included regardless of ONX compensation. Do not enter this total as the ONX Injection value alongside its TPC.']:[])];
 }
 function reportText(source=ownState()){
  if(!source.sweepSetup)return '';
  const data=normalized(source.sweepSetup),lines=['Sweep setup records','Checked steps record technician actions; they do not establish RF acceptance.'];
  if(source.job?.training==='guided-1.5')lines.push('SYNTHETIC TRAINING JOB: all readings and findings are practice data, not field measurements or acceptance.');
  for(const id of splits){const p=data.profiles[id],meaningful=Object.keys(fieldLabels).some(key=>!['method','comparisonMode'].includes(key)&&text(p[key]).trim())||Object.values(p.steps).some(x=>x.done||x.notes);if(meaningful)lines.push('','Current profile',...profileReport(p,id));}
  for(const item of data.history)lines.push('','Station snapshot · '+item.createdAt+(item.training?' · SYNTHETIC TRAINING':''),...profileReport(item.profile,item.split));
  return lines.join('\n');
 }
 function exportText(source=ownState(),split){
  const data=normalized(source.sweepSetup),id=splits.includes(split)?split:data.selected,p=data.profiles[id],g=guide(id);
  return ['NightSweep 1.8 Alpha build 2 · Sweep setup',...(source.job?.training==='guided-1.5'?['SYNTHETIC TRAINING JOB: all readings and findings are practice data, not field measurements or acceptance.']:[]),definitions[id].label,definitions[id].forward+' / '+definitions[id].reverse,'Technician-entered setup record. Checked steps are not RF acceptance.','',reportText(source),'','Selected procedure:',methodNote(p,id),'',...((g.steps||[]).flatMap((step,i)=>[(i+1)+'. '+step.title,plain(step.body),''])),'Sources:',...(g.sources||[]).map(s=>s.label+' — '+s.url),'','No ONX or XPERTrak connection is made by NightSweep. Preserve original meter files with the job.'].join('\n');
 }
 function saveSnapshot(){
  const data=draft(),p=data.profiles[data.selected];
  if(!p.station.trim()){exportStatus='Enter a station / amplifier ID before saving its snapshot.';}
  else if(data.history.length>=100){exportStatus='This job already has 100 station snapshots. Export / save the job and start another job before adding more.';}
  else{data.history.push({createdAt:new Date().toISOString(),split:data.selected,profile:JSON.parse(JSON.stringify(p)),training:ownState().job?.training==='guided-1.5'});ownState().sweepSetup=data;saveLocal();exportStatus='Saved station '+p.station+'. Later edits will not change this snapshot.';render();return true;}
  const status=document.getElementById('sweepExportStatus');if(status)status.textContent=exportStatus;return false;
 }
 async function exportNotes(){
  const data=draft(),filename='NightSweep_1.8_Alpha_build_2_'+data.selected+'MHz_Setup.txt',body=exportText();
  try{if(!window.NightSweepAndroid?.saveFile&&window.BrowserFiles)await window.BrowserFiles.prepare(filename,body,'text/plain');else download(filename,body,'text/plain');exportStatus='Setup notes prepared. Complete the save / download action.';}catch(e){exportStatus='Could not prepare setup notes: '+e.message;}
  const status=document.getElementById('sweepExportStatus');if(status)status.textContent=exportStatus;
 }
 function init(){
  if(initialized)return;initialized=true;
  if(typeof renderAll==='function'){const previous=renderAll;renderAll=function(...args){const result=previous(...args);render();return result;};}
  document.addEventListener('input',edit);document.addEventListener('change',edit);
  document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||!b.closest('#sweepSetupPanel'))return;
   if(b.dataset.sweepSplit&&splits.includes(b.dataset.sweepSplit)){const data=draft();data.selected=b.dataset.sweepSplit;ownState().sweepSetup=data;saveLocal();render();}
   if(b.dataset.sweepStepGo)changeStep(b.dataset.sweepStepGo);
   if(b.hasAttribute('data-sweep-export'))exportNotes();
   if(b.hasAttribute('data-sweep-snapshot'))saveSnapshot();
  });render();
 }
 return {defaults,profileDefaults,validate,normalized,draft,definitions,fieldLabels,methods,bandwidths,views,number,frequencyStatus,comparison,generator,methodNote,render,refresh,init,reportText,exportText,exportNotes,saveSnapshot};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SweepSetup;
