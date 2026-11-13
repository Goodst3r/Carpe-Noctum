/* Technician-selected references only. No preset establishes live spectrum or approved plant criteria. */
const FieldReference=(()=>{
 const anchorPresets=[
  {id:'legacy750',label:'54 / 750 MHz',low:54,high:750},
  {id:'legacy870',label:'54 / 870 MHz',low:54,high:870},
  {id:'legacy1002',label:'54 / 1002 MHz',low:54,high:1002},
  {id:'sample993',label:'261 / 993 MHz',low:261,high:993}
 ];
 const localNonHighSplitPreset=Object.freeze({id:'local-non-high-split',label:'Local non-high-split: 31 @ 54 / 43 @ 860 · TX 38',forwardLow:54,forwardHigh:860,launchLow:31,launchHigh:43,txReference:38});
 let initialized=false,renderedOwner=null,lastStatus='',statusError=false;
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const number=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const text=x=>typeof x==='string'||typeof x==='number'&&Number.isFinite(x)?String(x):'';
 const current=()=>typeof state!=='undefined'&&state?state:{};
 const has=x=>x!==undefined&&x!==null&&String(x).trim()!=='';
 function validate(value){
  if(value===undefined||value===null)return;if(!record(value))throw Error('Invalid field reference drafts.');
  const scalar=(v,label)=>{if(v!==undefined&&v!==null&&((typeof v!=='string'&&typeof v!=='number')||(typeof v==='number'&&!Number.isFinite(v))||String(v).length>100))throw Error('Invalid '+label+'.');};
  for(const key of ['anchorPreset','tapPoint'])scalar(value[key],key);
  for(const key of ['targets','cable']){const v=value[key];if(v===undefined||v===null)continue;if(!record(v)||Object.keys(v).length>20)throw Error('Invalid '+key+' reference draft.');for(const [k,x] of Object.entries(v))scalar(x,key+' '+k);}
  if(value.localMarkers!==undefined){const m=value.localMarkers;if(!record(m)||Object.keys(m).some(k=>!['low','high','curve'].includes(k)))throw Error('Invalid local carrier draft.');for(const key of ['low','high'])scalar(m[key],'local carrier '+key);if(m.curve!==undefined&&!['sqrt','linear'].includes(m.curve))throw Error('Invalid local carrier curve.');}
 }
 function selectedProfile(){return current().project?.profiles?.find(p=>String(p.id)===String(current().project.selectedProfile))||null;}
 function draft(){
  const owner=current(),raw=record(owner.fieldReferences)?owner.fieldReferences:{},targets=record(raw.targets)?raw.targets:{},cable=record(raw.cable)?raw.cable:{},markers=record(raw.localMarkers)?raw.localMarkers:{},profile=selectedProfile();
  return {anchorPreset:text(raw.anchorPreset),tapPoint:text(raw.tapPoint),localMarkers:{low:text(markers.low),high:text(markers.high),curve:markers.curve===undefined?'sqrt':text(markers.curve)},targets:{lowMin:text(targets.lowMin),lowMax:text(targets.lowMax),highMin:text(targets.highMin),highMax:text(targets.highMax),tolerance:targets.tolerance===undefined?text(profile?.fLevelTol):text(targets.tolerance),reference:text(targets.reference)||'current'},cable:{id:text(cable.id)||(owner.rows||[]).find(r=>r.cable!=='custom')?.cable||'p3_625',frequency:cable.frequency===undefined?text(owner.setup?.lowF):text(cable.frequency)}};
 }
 function status(message,error=false){lastStatus=message;statusError=error;const el=document.getElementById('fieldReferenceStatus');if(el){el.textContent=message;el.className='status'+(error?' error':'');}}
 function saveDraft(patch){const owner=current(),old=record(owner.fieldReferences)?owner.fieldReferences:{};owner.fieldReferences={...old,...patch};saveLocal();}
 function applyAnchors(id){
  const preset=anchorPresets.find(p=>p.id===id),owner=current(),s=owner.setup;if(!preset||!s){status('Choose an available frequency reference.',true);return false;}
  if(s.launchMode==='table'){status('Launch table mode keeps its entered frequencies. Choose a two-anchor launch mode in Route before applying a frequency pair.',true);return false;}
  const message='Use '+preset.label+' as the launch anchors? Chart start and normalization reference will also use '+preset.low+' MHz. Launch levels and available spectrum stay as entered; node hardware and project criteria are unchanged.';
  if((has(s.lowF)||has(s.highF))&&!confirm(message))return false;
  s.lowF=preset.low;s.highF=preset.high;s.viewStart=preset.low;s.referenceF=preset.low;owner.example=false;
  saveDraft({anchorPreset:id});renderAll();status('Applied '+preset.label+' as editable launch anchors. These frequencies do not certify a band or set available spectrum.');return true;
 }
 function targetCenters(reference){
  if(reference==='workbook750')return {low:32,high:43,label:'Original workbook example 32 / 43 dBmV'};
  if(reference==='sample993')return {low:34,high:46,label:'Technetix sample launch 34 / 46 dBmV'};
  const p=selectedProfile();return {low:number(p?.launchLow),high:number(p?.launchHigh),label:'Selected profile target centers'};
 }
 function fillTargets(reference='current'){
  if(!['current','workbook750','sample993'].includes(reference)){status('Choose an available target reference.',true);return false;}
  const t=draft().targets,centers=targetCenters(reference),tolerance=number(t.tolerance);
  if(centers.low===null||centers.high===null){status('The selected profile has no target centers. Enter bounds or choose a clearly labeled example reference.',true);return false;}
  if(tolerance===null||tolerance<0){saveDraft({targets:{...t,reference}});refreshReadouts();status(centers.label+'. Enter a nonnegative ± tolerance, then choose the reference again to fill its ranges. No tolerance is assumed.',true);return false;}
  if(![centers.low-tolerance,centers.low+tolerance,centers.high-tolerance,centers.high+tolerance].every(Number.isFinite)){status('Enter finite target centers and a usable nonnegative tolerance.',true);return false;}
  if(['lowMin','lowMax','highMin','highMax'].some(k=>has(t[k]))&&!confirm('Replace the target range draft with '+centers.label+' using your entered ±'+tolerance+' dB tolerance? This only fills the editable draft.'))return false;
  saveDraft({targets:{...t,reference,lowMin:centers.low-tolerance,lowMax:centers.low+tolerance,highMin:centers.high-tolerance,highMax:centers.high+tolerance}});
  render();status('Filled editable draft ranges from '+centers.label+'. Review them before applying to the selected profile.');return true;
 }
 function targetCalculation(bounds=draft().targets){
  const lowMin=number(bounds.lowMin),lowMax=number(bounds.lowMax),highMin=number(bounds.highMin),highMax=number(bounds.highMax);
  if([lowMin,lowMax,highMin,highMax].some(v=>v===null)||lowMin>lowMax||highMin>highMax)return {ok:false,error:'Enter all four target bounds with each minimum at or below its maximum.'};
  const lowWidth=(lowMax-lowMin)/2,highWidth=(highMax-highMin)/2;
  if(![lowWidth,highWidth,(lowMin+lowMax)/2,(highMin+highMax)/2].every(Number.isFinite))return {ok:false,error:'Enter finite target bounds within a usable numeric range.'};
  if(Math.abs(lowWidth-highWidth)>1e-9)return {ok:false,error:'The selected profile uses one level tolerance. Use equal low/high range widths before applying; asymmetric drafts can remain as notes on this device.'};
  return {ok:true,low:(lowMin+lowMax)/2,high:(highMin+highMax)/2,tolerance:lowWidth};
 }
 function applyTargets(bounds=draft().targets){
  const profile=selectedProfile(),result=targetCalculation(bounds);if(!profile){status('Select a project profile before applying target ranges.',true);return false;}if(!result.ok){status(result.error,true);return false;}
  const message='Replace profile '+profile.id+' target centers with '+result.low.toFixed(2)+' / '+result.high.toFixed(2)+' dBmV and ±'+result.tolerance.toFixed(2)+' dB level tolerance? These are technician-entered planning criteria at that profile’s marker frequencies. Approval will be No. Measurements, spectrum and hardware limits stay as entered.';
  if((['launchLow','launchHigh','fLevelTol'].some(k=>has(profile[k]))||profile.approved==='Yes')&&!confirm(message))return false;
  profile.launchLow=result.low;profile.launchHigh=result.high;profile.fLevelTol=result.tolerance;profile.approved='No';
  saveDraft({targets:{...draft().targets,...bounds}});renderAll();status('Applied target centers and common level tolerance to profile '+profile.id+'. Criteria are unapproved; confirm the installed design and measurement plane.');return true;
 }
 function localProfileError(profile=selectedProfile()){
  if(!profile)return 'Select a project profile before using your local non-high-split targets.';
  const preset=localNonHighSplitPreset;
  const ceiling=number(profile.returnCeiling),floor=number(profile.forwardFloor),upper=number(profile.equipmentUpper);
  if(ceiling===null||ceiling<=0||ceiling>=204)return 'Local non-high-split targets require an explicitly recorded return ceiling below 204 MHz. High-split and missing split values are blocked.';
  if(floor!==null&&ceiling>=floor)return 'The recorded return ceiling must be below the forward floor. Overlapping or shared return/forward band limits cannot establish a valid local setup.';
  if(floor===null||floor<=0||floor>preset.forwardLow||upper===null||upper<preset.forwardHigh)return 'The selected profile must verify a forward passband covering 54–860 MHz. Confirm its forward floor and installed upper limit; no hardware limit is upgraded by this preset.';
  return '';
 }
 function setupTargets(markers=draft().localMarkers){
  const lowMHz=number(markers?.low),highMHz=number(markers?.high),curve=markers?.curve,curveLabel=curve==='sqrt'?'square-root frequency':curve==='linear'?'linear MHz':'unsupported curve',base=localNonHighSplitPreset;
  const result={ok:false,lowMHz,highMHz,low:null,high:null,tilt:null,curve,curveLabel,label:'Calculated estimate under selected curve',error:'',limitsNote:'',base};
  const invalid=error=>({...result,error});
  if(!['sqrt','linear'].includes(curve))return invalid('Choose square-root frequency or linear MHz interpolation under the applicable procedure.');
  if(lowMHz===null||highMHz===null)return invalid('Enter two confirmed available carrier centers. Blank does not establish live spectrum; example pairs only fill this draft.');
  if(lowMHz<base.forwardLow||highMHz>base.forwardHigh||highMHz<=lowMHz)return invalid('Use confirmed carrier centers with 54 ≤ low < high ≤ 860 MHz. No target is extrapolated beyond the base anchors.');
  const profileError=localProfileError();if(profileError)return invalid(profileError);
  const live=number(current().setup?.liveMax),upper=number(selectedProfile()?.equipmentUpper);
  if(highMHz>upper)return invalid('A selected carrier exceeds the profile’s entered installed hardware upper limit.');
  if(live!==null&&highMHz>live)return invalid('A selected carrier exceeds the current route’s entered available spectrum upper limit. Confirm the live spectrum before changing that limit.');
  const settings={launchMode:curve,lowF:base.forwardLow,highF:base.forwardHigh,lowLevel:base.launchLow,highLevel:base.launchHigh,extendLaunch:false};
  const low=typeof HFC!=='undefined'?HFC.launchAt(settings,lowMHz):null,high=typeof HFC!=='undefined'?HFC.launchAt(settings,highMHz):null;
  if(low===null||high===null||![low,high].every(Number.isFinite))return invalid('The target calculation is unavailable for these inputs.');
  return {...result,ok:true,low,high,tilt:high-low,limitsNote:live===null?'Available spectrum upper limit is unverified. Confirm both entered carrier centers and the measurement plane.':'Targets fit the entered hardware and available-spectrum upper limits. Confirm actual carrier presence and the measurement plane.'};
 }
 function saveLocalMarkers(patch){
  const owner=current(),old=record(owner.fieldReferences)?owner.fieldReferences:{};owner.fieldReferences={...old,localMarkers:{...draft().localMarkers,...patch}};
  let saved=false;try{saved=typeof saveLocal==='function'&&saveLocal()!==false;}catch(_){}
  refreshReadouts();status(saved?'Saved available-carrier draft only. Base profile anchors, route launch frequencies/readings and measurement records are unchanged.':'Autosave failed. Available-carrier draft remains in memory; export a project backup now before closing or reloading.',!saved);return saved;
 }
 function fillLocalMarkers(id){const pair=({'57-753':[57,753],'63-550':[63,550]})[id];if(!pair)return false;saveLocalMarkers({low:String(pair[0]),high:String(pair[1])});renderedOwner=null;render();return true;}
 function applyLocalNonHighSplit(){
  const owner=current(),profile=selectedProfile(),preset=localNonHighSplitPreset,error=localProfileError(profile);if(error){status(error,true);return false;}
  if(typeof SweepSetup==='undefined'){status('The separate return TX reference requires the Sweep setup module.',true);return false;}
  if(!confirm('Apply your local targets to profile '+profile.id+': 31 dBmV at 54 MHz and 43 dBmV at 860 MHz, plus a separate 38 dBmV operator return TX reference in the 42 MHz workflow? Approval will be No. Current route launch frequencies/readings, measurement records, tolerances, receive targets and injection settings stay unchanged. Confirm the transmitter, frequency/service plan and reference plane separately.'))return false;
  const old=record(owner.sweepSetup)?owner.sweepSetup:SweepSetup.defaults(),sweep={...old,profiles:{...old.profiles,'42':{...(old.profiles?.['42']||SweepSetup.profileDefaults('42')),txReference:String(preset.txReference)}}};
  try{SweepSetup.validate(sweep);}catch(error){status('Review the saved sweep setup before applying local targets: '+error.message,true);return false;}
  Object.assign(profile,{forwardLow:preset.forwardLow,forwardHigh:preset.forwardHigh,launchLow:preset.launchLow,launchHigh:preset.launchHigh,approved:'No'});owner.sweepSetup=sweep;
  let saved=false;try{saved=typeof saveLocal==='function'&&saveLocal()!==false;}catch(_){}
  renderAll();status(saved?'Applied local profile targets: 31 dBmV @ 54 MHz / 43 dBmV @ 860 MHz; criteria are unapproved. Return TX reference is 38 dBmV in the 42 MHz workflow. Current route launch frequencies and readings are unchanged; confirm their frequencies and measurement plane before use.':'Autosave failed. Local targets and TX reference remain in memory; export a project backup now before closing or reloading.',!saved);return true;
 }
 function cableLoss(cableId,frequency,temperature=current().setup?.temperature){
  const f=number(frequency),temp=number(temperature),cable=typeof catalog!=='undefined'?catalog.cables.find(c=>c.id===cableId):null;
  return f===null||f<5||f>1800||temp===null||temp< -40||temp>185||!cable?null:HFC.cableAt(cable,{cable:cableId,length:100},f,temp);
 }
 function tapRows(){return (current().rows||[]).filter(r=>typeof faceChoices==='function'&&faceChoices(device(r.device)).length);}
 function selectedTap(){const rows=tapRows(),id=draft().tapPoint;return rows.find(r=>r.id===id)||rows[0]||null;}
 function publishedFaces(row=selectedTap()){return row&&typeof faceChoices==='function'?faceChoices(device(row.device)):[];}
 function openTap(){const row=selectedTap();if(!row){status('Add or select a catalog tap on the route first.',true);return false;}showTab('route');if(typeof WorkflowUI!=='undefined')WorkflowUI.selectPoint(row.id);const card=document.querySelector('#route [data-row="'+row.id+'"]');const extras=card?.querySelector('.point-extras');if(extras)extras.open=true;card?.scrollIntoView?.({behavior:'smooth',block:'start'});card?.querySelector('[data-face-choice]')?.focus({preventScroll:true});return true;}
 function refreshReadouts(){
  const panel=document.getElementById('fieldReferencePanel');if(!panel)return;const d=draft(),profile=selectedProfile(),hint=document.getElementById('referenceProfileHint');
  if(hint)hint.textContent=profile?'Selected profile '+profile.id+' · markers '+(has(profile.forwardLow)?profile.forwardLow:'—')+' / '+(has(profile.forwardHigh)?profile.forwardHigh:'—')+' MHz. Targets and ranges are editable planning criteria, not approved Spectrum standards.':'Select a project profile to apply target ranges.';
  const localOutput=document.getElementById('localSetupTargets'),local=setupTargets(d.localMarkers);if(localOutput)localOutput.textContent=local.ok?local.label+' · '+local.curveLabel+': '+local.low.toFixed(2)+' dBmV @ '+local.lowMHz+' MHz / '+local.high.toFixed(2)+' dBmV @ '+local.highMHz+' MHz; high-minus-low tilt '+local.tilt.toFixed(2)+' dB. '+local.limitsNote:local.error;
  const center=document.getElementById('targetReferenceCenters'),centers=targetCenters(d.targets.reference);if(center)center.textContent=centers.label+': '+(centers.low===null?'—':centers.low.toFixed(2))+' / '+(centers.high===null?'—':centers.high.toFixed(2))+' dBmV. Example launch levels are not universal node output targets.';
  const output=document.getElementById('cableReferenceResult'),loss=cableLoss(d.cable.id,d.cable.frequency),temp=number(current().setup?.temperature);if(output)output.innerHTML='<span>Predicted cable loss per 100 ft</span><strong>'+(loss===null?'—':loss.toFixed(3))+' <small>dB</small></strong><p class="note">At '+esc(d.cable.frequency||'—')+' MHz and '+(temp===null?'—':esc(temp))+'°F using the existing cable interpolation and temperature factor. A dash means missing or unsupported input; no extrapolation.</p>';
  const face=document.getElementById('referenceTapFaces'),row=selectedTap(),faces=publishedFaces(row);if(face)face.innerHTML=row?'<p class="note">'+esc(device(row.device)?.family||'')+' · '+esc(device(row.device)?.tapPorts||'—')+' ports. Published faces from the existing catalog:</p><div class="reference-face-values">'+[...new Set(faces.map(d=>faceValue(d)))].map(value=>'<span>'+esc(value)+' dB</span>').join('')+'</div>':'<p class="note">No catalog tap is on the route. Add one to view its family’s published faces.</p>';
 }
 function render(){
  const setup=document.getElementById('setup');if(!setup)return;let panel=document.getElementById('fieldReferencePanel');if(!panel){panel=document.createElement('section');panel.id='fieldReferencePanel';panel.className='panel field-reference-panel';panel.dataset.screen='route';setup.after(panel);}panel.hidden=setup.hidden;
  const active=document.activeElement;if(renderedOwner===current()&&panel.contains(active)&&['INPUT','TEXTAREA','SELECT'].includes(active.tagName)){refreshReadouts();return;}
  const open=new Set([...panel.querySelectorAll('details[open]')].map(el=>el.dataset.referenceSection).filter(Boolean)),d=draft(),rows=tapRows(),tap=selectedTap();
  panel.innerHTML=`<details data-reference-section="root"${open.has('root')?' open':''}><summary>Field shortcuts / spectrum references</summary><p class="note">Optional field helpers. Your local targets are separate from manufacturer specifications and remain unapproved planning criteria. Applying a reference never establishes available spectrum, RF acceptance or node hardware capability.</p><details><summary>Company node-output target references</summary>${CompanyTargets.profiles.map(p=>CompanyTargets.referenceMarkup(p.id)).join('')}<button type="button" data-task="setup">Choose a reference in Plan launch</button></details><h3>Legacy local non-high-split targets</h3><button type="button" id="applyLocalNonHighSplit">${esc(localNonHighSplitPreset.label)}</button><p class="note">31 dBmV at 54 MHz / 43 dBmV at 860 MHz, plus a separate 38 dBmV return TX reference. Apply changes only the selected profile’s design frequencies/levels and the 42 MHz TX reference. Current route launch frequencies and readings stay as entered. Requires a recorded non-high-split profile with hardware covering both forward anchors; confirm transmitter, return frequencies/service plan and measurement plane separately in Sweep setup.</p><h3>Setup targets at available carriers</h3><p class="note">Base reference stays 31 dBmV @ 54 MHz / 43 dBmV @ 860 MHz. Enter actual carrier centers confirmed by your plan and meter; spectrum edges are not automatically usable carriers. The selected curve gives calculated estimates, not measured or approved settings. Confirm the curve with your local procedure.</p><div class="reference-cable-fields"><label>Available low carrier (MHz)<input type="number" step="any" min="54" max="860" data-reference-local-marker="low" value="${esc(d.localMarkers.low)}" placeholder="Confirm actual carrier"></label><label>Available high carrier (MHz)<input type="number" step="any" min="54" max="860" data-reference-local-marker="high" value="${esc(d.localMarkers.high)}" placeholder="Confirm actual carrier"></label><label>Target curve<select data-reference-local-marker="curve">${option('sqrt','Square-root frequency · cable law',d.localMarkers.curve)}${option('linear','Linear MHz',d.localMarkers.curve)}</select></label></div><div class="reference-target-buttons"><button type="button" data-reference-local-example="57-753">Fill example 57 / 753 MHz</button><button type="button" data-reference-local-example="63-550">Fill example 63 / 550 MHz</button></div><p class="note">Example buttons fill this draft only. They do not establish carrier presence or replace profile anchors, route launch inputs or measured records.</p><p id="localSetupTargets" class="status" role="status" aria-live="polite"></p><h3>Common launch anchor pairs</h3><div class="reference-anchor-buttons">${anchorPresets.map(p=>`<button type="button" data-reference-anchors="${p.id}">${esc(p.label)}</button>`).join('')}</div><p class="note">Applies low/high launch frequencies plus chart start and normalization reference at the low anchor. Levels, temperature, spectrum and hardware stay editable and are not changed. Table mode keeps its entered frequency table.</p><details class="reference-targets" data-reference-section="targets"${open.has('targets')?' open':''}><summary>Editable node / launch target ranges</summary><p id="referenceProfileHint" class="note"></p><label>Range half-width (±dB) for filling examples<input type="number" min="0" step="any" data-reference-target="tolerance" value="${esc(d.targets.tolerance)}" placeholder="Enter a verified tolerance"><span class="note">Starts from the selected profile’s entered level tolerance when one exists. Blank means no tolerance is assumed.</span></label><div class="reference-target-buttons"><button type="button" data-reference-fill="current">Use selected profile</button><button type="button" data-reference-fill="workbook750">Workbook 32 / 43</button><button type="button" data-reference-fill="sample993">Sample 34 / 46</button></div><p id="targetReferenceCenters" class="note"></p><div class="reference-target-fields">${[['lowMin','Low target minimum'],['lowMax','Low target maximum'],['highMin','High target minimum'],['highMax','High target maximum']].map(([key,label])=>`<label>${label} (dBmV)<input type="number" step="any" data-reference-target="${key}" value="${esc(d.targets[key])}" placeholder="No bound entered"></label>`).join('')}</div><p class="note">Apply uses the midpoint of each range and one common level tolerance; both ranges must have equal widths. It marks criteria unapproved and never changes a measurement. References are illustrative examples from this app, not operator specifications.</p><button type="button" id="applyReferenceTargets">Apply ranges to selected profile</button></details><details data-reference-section="faces"${open.has('faces')?' open':''}><summary>Published tap faces quick look</summary><label>Route tap<select data-reference-tap>${rows.map(row=>option(row.id,name(row,current().rows.indexOf(row))+' · '+(device(row.device)?.model||''),tap?.id)).join('')||option('','No catalog taps','')}</select></label><div id="referenceTapFaces"></div><button type="button" id="openReferenceTap">Open existing face picker</button><p class="note">The route picker shows each face’s prediction and swaps its actual catalog device. No face or housing curve is invented here.</p></details><details data-reference-section="cable"${open.has('cable')?' open':''}><summary>Cable loss quick look</summary><div class="reference-cable-fields"><label>Catalog cable<select data-reference-cable="id">${catalog.cables.map(c=>option(c.id,c.label,d.cable.id)).join('')}</select></label><label>Frequency (MHz)<input type="number" min="5" max="1800" step="any" data-reference-cable="frequency" value="${esc(d.cable.frequency)}"></label></div><div id="cableReferenceResult" class="reference-cable-number" role="status" aria-live="polite"></div></details><div id="fieldReferenceStatus" class="status${statusError?' error':''}" role="status">${esc(lastStatus||'Choose a helper only when it matches the installed plant. Existing data is kept until an apply action is confirmed.')}</div></details>`;
  renderedOwner=current();refreshReadouts();
 }
 function edit(event){
  const t=event.target,isSelect=t.tagName==='SELECT';if(event.type==='input'&&isSelect||event.type==='change'&&!isSelect)return;
  if(t.dataset.referenceLocalMarker&&['low','high','curve'].includes(t.dataset.referenceLocalMarker)){saveLocalMarkers({[t.dataset.referenceLocalMarker]:t.value});}
  else if(t.dataset.referenceTarget){saveDraft({targets:{...draft().targets,[t.dataset.referenceTarget]:t.value}});refreshReadouts();}
  else if(t.dataset.referenceCable){saveDraft({cable:{...draft().cable,[t.dataset.referenceCable]:t.value}});refreshReadouts();}
  else if(t.hasAttribute('data-reference-tap')){saveDraft({tapPoint:t.value});refreshReadouts();}
 }
 function init(){
  if(initialized)return;initialized=true;
  const oldSetup=renderSetup;renderSetup=function(){oldSetup();render();};
  const oldProjects=renderProjects;renderProjects=function(){oldProjects();render();};
  const oldRefresh=refreshResults;refreshResults=function(){oldRefresh();refreshReadouts();};
  document.addEventListener('input',edit);document.addEventListener('change',edit);
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.referenceAnchors)applyAnchors(button.dataset.referenceAnchors);if(button.dataset.referenceFill)fillTargets(button.dataset.referenceFill);if(button.dataset.referenceLocalExample)fillLocalMarkers(button.dataset.referenceLocalExample);if(button.id==='applyReferenceTargets')applyTargets();if(button.id==='applyLocalNonHighSplit')applyLocalNonHighSplit();if(button.id==='openReferenceTap')openTap();});render();
 }
 return {init,validate,applyAnchors,applyTargets,applyLocalNonHighSplit,localNonHighSplitPreset,setupTargets,fillLocalMarkers,fillTargets,targetCalculation,targetCenters,cableLoss,publishedFaces,openTap,draft,render,refreshReadouts,anchorPresets};
})();
function initFieldReference(){FieldReference.init();}
if(typeof module!=='undefined'&&module.exports)module.exports=FieldReference;
