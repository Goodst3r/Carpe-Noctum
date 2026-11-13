/* Field comparisons only. Meter entries never become ProjectMath records or evidence. */
function publishedNodeTestPoint(){
 const p=typeof NodeTools!=='undefined'?NodeTools.profile(state?.node,catalog):null;
 const coupling=HFC.number(p?.test_point_loss_db),tolerance=HFC.number(p?.test_point_tolerance_db);
 return p&&coupling!==null&&coupling>=0?{model:p.id,label:p.label,coupling,tolerance}:null;
}
function meterCoupling(enabled,value){
 if(!enabled||value===undefined||value===null||String(value).trim()==='')return {value:0,converted:false,valid:true};
 const n=HFC.number(value);return {value:n,converted:n!==null&&n>=0,valid:n!==null&&n>=0};
}
function effectiveLaunchSetup(setup=state.setup){
 const c=meterCoupling(setup.launchTestPoint,setup.launchCoupling);
 if(!setup.launchTestPoint||!c.converted&&c.valid)return setup;
 const out={...setup};
 if(!c.valid){out.lowLevel='';out.highLevel='';out.launchTable='';return out;}
 for(const key of ['lowLevel','highLevel']){const raw=HFC.number(setup[key]);out[key]=raw===null?'':HFC.number(raw+c.value)??'';}
 if(setup.launchMode==='table'){
  const rows=String(setup.launchTable||'').trim().split(/\n/).filter(x=>x.trim()).map(x=>x.trim().split(/[;,\s]+/));
  out.launchTable=rows.every(r=>r.length===2&&r.every(x=>HFC.number(x)!==null))?rows.map(r=>r[0]+', '+(HFC.number(Number(r[1])+c.value)??'')).join('\n'):'';
 }
 return out;
}
function meterProfileTarget(frequency){
 const p=state.project?.profiles?.find(p=>String(p.id)===String(state.project.selectedProfile));
 if(!p||frequency===null)return {target:null,tolerance:null,profile:null};
 const low=HFC.number(p.forwardLow),high=HFC.number(p.forwardHigh),tolerance=HFC.number(p.fLevelTol);
 const target=low!==null&&Math.abs(frequency-low)<1e-9?HFC.number(p.launchLow):high!==null&&Math.abs(frequency-high)<1e-9?HFC.number(p.launchHigh):null;
 return {target,tolerance:tolerance!==null&&tolerance>=0?tolerance:null,profile:p.id};
}
function meterComparison(row,portId){
 const m=row?.meters?.[portId]||{},frequency=HFC.number(m.frequency===undefined?state.setup.lowF:m.frequency),raw=HFC.number(m.reading),c=meterCoupling(m.testPoint,m.coupling);
 const measurement=raw!==null&&c.valid?HFC.number(raw+c.value):null;
 const prediction=frequency!==null&&frequency>=5&&frequency<=1800?val(evaluate(frequency),row.id+'::'+portId):null;
 const profile=meterProfileTarget(frequency),error=measurement===null||prediction===null?null:HFC.number(measurement-prediction);
 return {frequency,raw,coupling:c.valid?c.value:null,converted:c.converted,measurement,prediction,error,...profile,inside:measurement===null||profile.target===null||profile.tolerance===null?null:Math.abs(measurement-profile.target)<=profile.tolerance+1e-9,reference:m.tpReference||'',validCoupling:c.valid,...(state.setup.companyTargetProfile?{error:null,companyReason:'Meter minus company-derived prediction is unavailable until bandwidth, power convention, plane agreement, impedance and field tolerance are confirmed. Independently entered profile criteria are retained.'}:{})};
}
function testPointChoices(choice,attrs,launch=false){
 const p=launch&&(state.setup.sourceType===undefined||state.setup.sourceType==='node')?publishedNodeTestPoint():null;
 return `<select ${attrs}>${option('','True output / custom',choice)}${option('20','20 dB coupling',choice)}${option('30','30 dB coupling',choice)}${option('custom','Typed coupling',choice)}${p?option('node',`Node TP ${p.coupling} dB ±${p.tolerance===null?'—':p.tolerance}`,choice):choice==='node'?option('node','Previously chosen node TP',choice):''}</select>`;
}
function launchMeterSignature(){const s=state.setup;return JSON.stringify([s.launchTestPoint,s.launchCoupling,s.launchCouplingChoice,s.launchTpReference,s.launchTpTolerance,s.sourceType,publishedNodeTestPoint()]);}
function renderLaunchTestPoint(){
 let panel=$('launchTestPoint');if(!panel){panel=document.createElement('details');panel.id='launchTestPoint';panel.className='launch-meter';$('setup').appendChild(panel);}
 const s=state.setup,p=(s.sourceType===undefined||s.sourceType==='node')?publishedNodeTestPoint():null,wasOpen=panel.open;
 const signature=launchMeterSignature();
 // Anchor blur calls renderSetup. Preserve this control when its own values did not
 // change, so a technician's first tap/keystroke is not lost as focus moves here.
 if(panel.dataset.meterSignature===signature){renderLaunchConversionStatus();return;}
 panel.dataset.meterSignature=signature;
 panel.innerHTML=`<summary>Launch test-point conversion</summary><label class="check"><input type="checkbox" data-launch-meter="launchTestPoint"${s.launchTestPoint?' checked':''}>Launch values are test-point readings</label><div class="meter-fields"><label>Coupling choice${testPointChoices(s.launchCouplingChoice||'','data-launch-meter="launchCouplingChoice"',true)}</label><label>Remaining coupling (dB)<input data-launch-meter="launchCoupling" type="number" min="0" step="any" value="${esc(s.launchCoupling??'')}" placeholder="Blank = true output"></label></div><p class="note">Applies to both launch anchors or every launch-table reading. Output = entered reading + remaining coupling. Blank coupling means true output; 20 dB is never assumed.</p>${p?`<p class="note">Published ${esc(p.label)} TP: −${esc(p.coupling)} dB${p.tolerance===null?'':` ±${esc(p.tolerance)} dB`}. Choose “Node TP” to apply this reference; check meter compensation.</p>`:'<p class="note">Choose Node output in Plan → Setup to offer its published test-point reference.</p>'}<div id="launchConversionStatus" class="note" role="status"></div>`;
 panel.open=wasOpen||!!s.launchTestPoint;renderLaunchConversionStatus();
}
function renderLaunchConversionStatus(){
 const el=$('launchConversionStatus');if(!el)return;const s=state.setup,c=meterCoupling(s.launchTestPoint,s.launchCoupling),eff=effectiveLaunchSetup(),lo=HFC.number(eff.lowLevel),hi=HFC.number(eff.highLevel);
 el.className='note'+(!c.valid?' danger':'');
 if(!c.valid){el.textContent='Enter nonnegative coupling or leave it blank for true output. Launch prediction is unavailable.';return;}
 el.textContent=c.converted?`Converted launch output${s.launchMode==='table'?' table':`: ${fmt(lo)} / ${fmt(hi)} dBmV`} (+${c.value} dB).${s.launchTpReference?' Reference: '+s.launchTpReference+(HFC.number(s.launchTpTolerance)===null?'':' ±'+s.launchTpTolerance+' dB')+'.':''}`:'Launch entered as true output; no test-point addback.';
}
function meterBox(row,port){
 const m=row.meters?.[port.id]||{},frequency=m.frequency===undefined?state.setup.lowF:m.frequency;
 return `<div class="meter-box" data-meter-port="${esc(port.id)}"><div class="meter-heading"><h3>Meter · ${esc(port.label)}</h3><span class="pill">Field comparison</span></div><div class="meter-fields"><label>Measurement frequency (MHz)<input data-meter-field="frequency" type="number" min="5" max="1800" step="any" value="${esc(frequency)}"></label><label>Meter measurement (dBmV)<input data-meter-field="reading" type="number" step="any" value="${esc(m.reading??'')}" placeholder="No measurement"></label></div><label class="check"><input type="checkbox" data-meter-field="testPoint"${m.testPoint?' checked':''}>This is a test-point reading</label><div class="meter-fields"><label>Coupling choice${testPointChoices(m.couplingChoice||'','data-meter-field="couplingChoice"')}</label><label>Remaining coupling (dB)<input data-meter-field="coupling" type="number" min="0" step="any" value="${esc(m.coupling??'')}" placeholder="Blank = true output"></label></div><p class="note">Blank coupling = true output. Check meter compensation before adding coupling.</p><div class="meter-result" aria-live="polite"></div></div>`;
}
function renderMeters(){
 state.rows.forEach(r=>{const card=$('route').querySelector(`[data-row="${r.id}"]`);if(!card)return;card.querySelector('.point-meters')?.remove();const container=document.createElement('details');container.className='point-meters';container.open=!!r.meters&&Object.keys(r.meters).length>0;container.innerHTML=`<summary>Meter on this point <span class="note">· measurements stay separate</span></summary><div class="meter-grid">${HFC.portsFor(device(r.device),r).map(p=>meterBox(r,p)).join('')}</div><p class="note">Field comparisons do not establish acceptance. Closeout → Acceptance is the official record. Nothing here is copied into records or ONX evidence.</p>`;card.appendChild(container);});
 renderMeterResults();
}
function renderMeterResults(){
 state.rows.forEach(r=>{const card=$('route').querySelector(`[data-row="${r.id}"]`);if(!card)return;
  HFC.portsFor(device(r.device),r).forEach(p=>{const box=[...card.querySelectorAll('[data-meter-port]')].find(el=>el.dataset.meterPort===p.id),el=box?.querySelector('.meter-result');if(!el)return;const x=meterComparison(r,p.id),saved=r.meters?.[p.id];
   const profile=x.target===null?x.profile?'No profile target entered at this frequency.':'No plant profile target selected.':x.inside===null?`Profile ${x.profile} target ${fmt(x.target)} dBmV; enter a nonnegative level tolerance to compare.`:`${x.inside?'Inside':'Outside'} profile ${x.profile} target ${fmt(x.target)} ±${fmt(x.tolerance)} dBmV.`;
   el.innerHTML=`<div class="meter-numbers"><div><span>Prediction</span><strong>${fmt(x.prediction)} <small>dBmV</small></strong></div><div><span>Measurement${x.converted?' · converted':''}</span><strong>${fmt(x.measurement)} <small>dBmV</small></strong></div><div><span>Error · meter − prediction</span><strong>${fmt(x.error)} <small>dB</small></strong></div></div>${!x.validCoupling?'<p class="note danger">Coupling must be nonnegative. Blank means true output.</p>':''}${x.converted?`<p class="note">Converted: ${fmt(x.raw)} + ${fmt(x.coupling)} = ${fmt(x.measurement)} dBmV.${x.reference?' Reference: '+esc(x.reference)+(HFC.number(saved?.tpTolerance)===null?'':' ±'+esc(saved.tpTolerance)+' dB')+'.':''}</p>`:''}<p class="note">${esc(profile)} ${x.companyReason?esc(x.companyReason):''} Targets are the selected profile’s design launch levels at its exact low/high markers; confirm the measurement plane. This comparison is not official acceptance.</p>`;
  });
 });renderLaunchConversionStatus();
}
function applyTestPointChoice(target,key,choice,launch=false){
 const fields=launch?{coupling:'launchCoupling',enabled:'launchTestPoint',reference:'launchTpReference',tolerance:'launchTpTolerance'}:{coupling:'coupling',enabled:'testPoint',reference:'tpReference',tolerance:'tpTolerance'};
 target[key]=choice;
 if(choice==='20'||choice==='30'){target[fields.coupling]=choice;target[fields.enabled]=true;delete target[fields.reference];delete target[fields.tolerance];}
 else if(choice==='node'){const p=launch?publishedNodeTestPoint():null;if(p){target[fields.coupling]=p.coupling;target[fields.enabled]=true;target[fields.reference]=p.label;target[fields.tolerance]=p.tolerance;}}
 else if(choice==='custom'){target[fields.enabled]=true;delete target[fields.reference];delete target[fields.tolerance];}
 else if(choice===''){target[fields.coupling]='';delete target[fields.reference];delete target[fields.tolerance];}
}
function initMeters(){
 if(initMeters.ready)return;initMeters.ready=true;
 const priorEvaluate=evaluate;evaluate=function(frequency){const setup=effectiveLaunchSetup();if(setup===state.setup)return priorEvaluate(frequency);const r=HFC.run({...state,setup},catalog,frequency);r.results.forEach(x=>r.byKey.set(x.input.key,x.input));return r;};
 const priorRoute=renderRoute;renderRoute=function(){priorRoute();renderMeters();};
 const priorSetup=renderSetup;renderSetup=function(){priorSetup();renderLaunchTestPoint();};
 const priorRefresh=refreshResults;refreshResults=function(){priorRefresh();renderMeterResults();};
 function edited(e){
  const t=e.target,launch=t.dataset.launchMeter,field=t.dataset.meterField;
  if(launch){if(e.type==='input'&&(t.tagName==='SELECT'||t.type==='checkbox'))return;if(e.type==='change'&&t.tagName!=='SELECT'&&t.type!=='checkbox')return;
   if(launch==='launchCouplingChoice')applyTestPointChoice(state.setup,launch,t.value,true);
   else {state.setup[launch]=t.type==='checkbox'?t.checked:t.value;if(launch==='launchCoupling'){state.setup.launchCouplingChoice='custom';delete state.setup.launchTpReference;delete state.setup.launchTpTolerance;const choice=$('launchTestPoint')?.querySelector('[data-launch-meter="launchCouplingChoice"]');if(choice)choice.value='custom';$('launchTestPoint').dataset.meterSignature=launchMeterSignature();}}
   state.example=false;$('exampleFlag').classList.add('hidden');if(e.type==='change')renderLaunchTestPoint();refreshResults();return;
  }
  if(field){if(e.type==='input'&&(t.tagName==='SELECT'||t.type==='checkbox'))return;if(e.type==='change'&&t.tagName!=='SELECT'&&t.type!=='checkbox')return;
   const card=t.closest('[data-row]'),row=state.rows.find(r=>r.id===card?.dataset.row),port=t.closest('[data-meter-port]')?.dataset.meterPort;if(!row||!port)return;
   row.meters=row.meters||{};const m=row.meters[port]=row.meters[port]||{};if(m.frequency===undefined)m.frequency=state.setup.lowF;
   if(field==='couplingChoice')applyTestPointChoice(m,field,t.value);
   else {m[field]=t.type==='checkbox'?t.checked:t.value;if(field==='coupling'){m.couplingChoice='custom';delete m.tpReference;delete m.tpTolerance;const choice=t.closest('[data-meter-port]')?.querySelector('[data-meter-field="couplingChoice"]');if(choice)choice.value='custom';}}
   state.example=false;$('exampleFlag').classList.add('hidden');if(e.type==='change'){const open=card.querySelector('.point-meters')?.open;renderMeters();const replacement=$('route').querySelector(`[data-row="${row.id}"] .point-meters`);if(replacement)replacement.open=open;}
   renderMeterResults();saveLocal();return;
  }
  if(t.dataset.nodeField!==undefined&&e.type==='change'){renderLaunchTestPoint();renderMeters();}
  if(t.dataset.projectProfile!==undefined||t.dataset.projectField!==undefined)renderMeterResults();
 }
 document.addEventListener('input',edited);document.addEventListener('change',edited);
 renderLaunchTestPoint();renderMeters();
}
