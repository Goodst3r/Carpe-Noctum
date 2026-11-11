/* Offline field checklists and voltage reference math. These are job notes, not RF acceptance. */
const FieldWork=(()=>{
 const leakageItems=[
  ['connectors','Check loose or corroded fittings'],
  ['shielding','Inspect damaged cable, shielding and housings'],
  ['unusedPorts','Check unused ports and approved terminations'],
  ['dropPremises','Check the affected drop and premises wiring'],
  ['retest','Retest the repair and record evidence']
 ];
 const maintenanceItems=[
  ['powerSupply','Power supply inspection','Condition, alarms, cabinet and observed supply readings.'],
  ['bonding','Grounding / bonding check','Condition and discrepancies against the approved local procedure.'],
  ['endOfLine','End-of-line test points','Location, test frequencies and measured levels or saved trace.'],
  ['amplifierUnity','Amplifier levels / unity gain','Input/output measurement planes, pads/EQs and unity-gain notes.'],
  ['leakagePatrol','Leakage patrol','Area checked, findings, repairs and follow-up.']
 ];
 let initialized=false,renderedOwner=null;
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const text=x=>typeof x==='string'?x:typeof x==='number'&&Number.isFinite(x)?String(x):'';
 const ownState=()=>typeof state!=='undefined'&&state?state:{};
 function numeric(value){return (typeof value==='string'||typeof value==='number')&&String(value).trim()!==''&&Number.isFinite(Number(value))?Number(value):null;}
 function convert(value,from='dbuv'){
  const n=numeric(value);if(n===null||!['dbuv','dbmv'].includes(from))return null;
  const out=from==='dbuv'?n-60:n+60;return Number.isFinite(out)?out:null;
 }
 function normalize(value){
  const source=record(value)?value:{},leakage=record(source.leakage)?source.leakage:{},maintenance=record(source.maintenance)?source.maintenance:{},conversion=record(leakage.conversion)?leakage.conversion:{};
  const lc=record(leakage.checks)?leakage.checks:{},mc=record(maintenance.checks)?maintenance.checks:{};
  return {leakage:{checks:Object.fromEntries(leakageItems.map(([key])=>[key,lc[key]===true])),notes:text(leakage.notes),conversion:{value:text(conversion.value),from:conversion.from==='dbmv'?'dbmv':'dbuv'}},maintenance:{checks:Object.fromEntries(maintenanceItems.map(([key])=>{const item=mc[key];return [key,{done:item===true||record(item)&&item.done===true,notes:record(item)?text(item.notes):''}];}))}};
 }
 function validate(value){
  if(value===undefined||value===null)return;
  if(!record(value))throw Error('Invalid field-work notes.');
  const optionalRecord=(v,label)=>{if(v!==undefined&&v!==null&&!record(v))throw Error('Invalid '+label+'.');};
  const checkedText=(v,label,max)=>{if(v!==undefined&&v!==null&&((typeof v!=='string'&&typeof v!=='number')||(typeof v==='number'&&!Number.isFinite(v))||String(v).length>max))throw Error('Invalid '+label+' (maximum '+max+' characters).');};
  for(const key of ['leakage','maintenance'])optionalRecord(value[key],key+' checklist');
  const leakage=value.leakage||{},maintenance=value.maintenance||{};
  optionalRecord(leakage.checks,'leakage checks');optionalRecord(maintenance.checks,'maintenance checks');
  for(const checks of [leakage.checks,maintenance.checks])if(checks&&Object.keys(checks).length>50)throw Error('Too many field checklist items.');
  for(const item of Object.values(leakage.checks||{}))if(item!==undefined&&typeof item!=='boolean')throw Error('Leakage check state must be true or false.');
  checkedText(leakage.notes,'leakage notes',4000);optionalRecord(leakage.conversion,'leakage converter');
  if(leakage.conversion){checkedText(leakage.conversion.value,'voltage reference input',100);const from=leakage.conversion.from;if(from!==undefined&&from!==null&&!['dbuv','dbmv'].includes(from))throw Error('Invalid voltage reference unit.');}
  for(const item of Object.values(maintenance.checks||{})){
   if(typeof item==='boolean')continue;optionalRecord(item,'maintenance item');if(!item)continue;
   if(item.done!==undefined&&typeof item.done!=='boolean')throw Error('Maintenance check state must be true or false.');
   checkedText(item.notes,'maintenance item notes',1000);
  }
 }
 const units=from=>from==='dbmv'?{input:'dBmV',output:'dBµV'}:{input:'dBµV',output:'dBmV'};
 const formatted=n=>n===null?'—':n.toFixed(2);
 function referenceText(conversion){const value=numeric(conversion.value),result=convert(conversion.value,conversion.from);if(value===null||result===null)return '';const u=units(conversion.from);return 'Voltage reference: '+formatted(value)+' '+u.input+' = '+formatted(result)+' '+u.output+'. Same reference plane; no test-point correction.';}
 function reportSections(source=ownState()){
  const raw=record(source.fieldWork)?source.fieldWork:{},data=normalize(raw),sections=[];
  if(record(raw.leakage))sections.push({title:'Leakage & ingress',items:leakageItems.map(([key,label])=>({key,label,done:data.leakage.checks[key],notes:''})),notes:data.leakage.notes,reference:referenceText(data.leakage.conversion)});
  if(record(raw.maintenance))sections.push({title:'Preventive maintenance / end of line',items:maintenanceItems.map(([key,label])=>({key,label,...data.maintenance.checks[key]})),notes:''});
  return sections;
 }
 function reportRows(source=ownState()){
  return reportSections(source).flatMap(section=>[
   ...section.items.map(item=>[section.title,item.label,item.done?'Complete':'Not checked',item.notes||'']),
   ...(section.notes?[[section.title,'Field notes','',section.notes]]:[]),
   ...(section.reference?[[section.title,'Voltage reference calculation','Reference only',section.reference]]:[])
  ]);
 }
 function render(){
  const parent=document.getElementById('projectPanel');if(!parent)return;
  let panel=document.getElementById('fieldWorkPanel');if(!panel){panel=document.createElement('section');panel.id='fieldWorkPanel';panel.className='panel field-work-panel';panel.dataset.screen='projects';parent.before(panel);}
  panel.hidden=parent.hidden;
  const owner=ownState();if(renderedOwner===owner&&panel.contains(document.activeElement))return;
  const open=new Set([...panel.querySelectorAll('details[open]')].map(el=>el.dataset.fieldSection));
  const data=normalize(owner.fieldWork),leakage=data.leakage,maintenance=data.maintenance;
  panel.innerHTML=`<div class="sectionhead"><div><h2>Field workflow</h2><p class="note tight">Saved with this job. Checked means the technician marked the task complete; it does not certify RF acceptance.</p></div></div><details class="field-work-section" data-field-section="leakage"${open.has('leakage')?' open':''}><summary>Leakage &amp; ingress <span id="leakageChecklistCount" class="note"></span></summary><details class="field-reference"><summary>Quick reference</summary><p class="note"><b>Leakage:</b> RF escaping through a shielding defect. <b>Ingress:</b> outside RF entering the coax network. A defect can do both.</p><ul class="field-reference-list"><li>Loose, corroded or damaged connectors and fittings can break shield continuity.</li><li>Cracked jackets, damaged braid/foil, loose housing covers and damaged seizure points deserve inspection.</li><li>Unused or improperly terminated ports can be entry/exit points; verify the approved part and configuration.</li><li>Damaged drops, premises splitters, loose outlets and customer wiring can feed ingress back into the network.</li><li>Localize the issue and record before/after evidence using the approved procedure. A checklist is not a leakage threshold or a pass/fail measurement.</li></ul></details><div class="field-voltage-reference"><h3>Voltage unit reference</h3><div class="field-voltage-inputs"><label>Entered level<input type="number" step="any" inputmode="decimal" data-leakage-value value="${esc(leakage.conversion.value)}" placeholder="Blank = no value"></label><label>Entered unit<select data-leakage-from>${option('dbuv','dBµV',leakage.conversion.from)}${option('dbmv','dBmV',leakage.conversion.from)}</select></label></div><div class="field-converted-number" id="leakageConversionResult" role="status" aria-live="polite"></div><p class="note">dBmV = dBµV − 60; dBµV = dBmV + 60. Same voltage reference plane only. This is a unit conversion, not a prediction, field-strength (µV/m) conversion, measurement correction or test-point addback.</p></div><h3>Leakage repair checklist</h3><div class="field-checklist">${leakageItems.map(([key,label])=>`<label class="check field-work-check"><input type="checkbox" data-leakage-check="${key}"${leakage.checks[key]?' checked':''}>${esc(label)}</label>`).join('')}</div><label>Leakage / ingress notes<textarea data-leakage-notes maxlength="4000" placeholder="Location, findings, repair, retest and trace reference">${esc(leakage.notes)}</textarea></label></details><details class="field-work-section" data-field-section="maintenance"${open.has('maintenance')?' open':''}><summary>Preventive maintenance / end of line <span id="maintenanceChecklistCount" class="note"></span></summary><p class="note">Record the work actually performed. Measurement values and trace references belong in the notes or official job log; no route prediction is copied here.</p><div class="field-maintenance-list">${maintenanceItems.map(([key,label,hint])=>`<div class="field-maintenance-item"><label class="check field-work-check"><input type="checkbox" data-maintenance-check="${key}"${maintenance.checks[key].done?' checked':''}>${esc(label)}</label><label>Notes<input type="text" data-maintenance-notes="${key}" maxlength="1000" value="${esc(maintenance.checks[key].notes)}" placeholder="Short finding / trace reference"><span class="note">${esc(hint)}</span></label></div>`).join('')}</div></details>`;
  renderedOwner=owner;refresh();
 }
 function refresh(){
  const panel=document.getElementById('fieldWorkPanel');if(!panel)return;const data=normalize(ownState().fieldWork),c=data.leakage.conversion,u=units(c.from),result=convert(c.value,c.from),output=document.getElementById('leakageConversionResult');
  if(output)output.innerHTML='<span>Converted voltage reference</span><strong>'+formatted(result)+' <small>'+u.output+'</small></strong>';
  const leakageCount=document.getElementById('leakageChecklistCount'),maintenanceCount=document.getElementById('maintenanceChecklistCount');
  if(leakageCount)leakageCount.textContent='· '+Object.values(data.leakage.checks).filter(Boolean).length+'/'+leakageItems.length+' marked';
  if(maintenanceCount)maintenanceCount.textContent='· '+Object.values(data.maintenance.checks).filter(item=>item.done).length+'/'+maintenanceItems.length+' marked';
 }
 function persist(){
  saveLocal();refresh();
  if(typeof FieldReport!=='undefined'&&document.getElementById('runSheetPanel')?.hidden===false)FieldReport.renderSheet();
 }
 function edit(event){
  const t=event.target,owner=ownState(),raw=record(owner.fieldWork)?owner.fieldWork:{};
  const isSelect=t.tagName==='SELECT',isCheck=t.type==='checkbox';
  if(event.type==='input'&&(isSelect||isCheck)||event.type==='change'&&!isSelect&&!isCheck)return;
  if(t.hasAttribute('data-leakage-value')||t.hasAttribute('data-leakage-from')){
   const leakage=record(raw.leakage)?raw.leakage:{},normalized=normalize(raw).leakage.conversion,key=t.hasAttribute('data-leakage-value')?'value':'from';
   owner.fieldWork={...raw,leakage:{...leakage,conversion:{...normalized,[key]:t.value}}};persist();
  }else if(t.hasAttribute('data-leakage-notes')){
   owner.fieldWork={...raw,leakage:{...(record(raw.leakage)?raw.leakage:{}),notes:t.value}};persist();
  }else if(t.dataset.leakageCheck&&leakageItems.some(([key])=>key===t.dataset.leakageCheck)){
   const leakage=record(raw.leakage)?raw.leakage:{};
   owner.fieldWork={...raw,leakage:{...leakage,checks:{...(record(leakage.checks)?leakage.checks:{}),[t.dataset.leakageCheck]:t.checked}}};persist();
  }else{
   const key=t.dataset.maintenanceCheck||t.dataset.maintenanceNotes;if(!key||!maintenanceItems.some(([k])=>k===key))return;
   const maintenance=record(raw.maintenance)?raw.maintenance:{},checks=record(maintenance.checks)?maintenance.checks:{},saved=checks[key],item=record(saved)?saved:{done:saved===true};
   owner.fieldWork={...raw,maintenance:{...maintenance,checks:{...checks,[key]:{...item,[t.dataset.maintenanceCheck?'done':'notes']:t.dataset.maintenanceCheck?t.checked:t.value}}}};persist();
  }
 }
 function init(){
  if(initialized)return;initialized=true;
  const previousRender=renderProjects;renderProjects=function(){previousRender();render();};
  document.addEventListener('input',edit);document.addEventListener('change',edit);render();
 }
 return {init,render,refresh,validate,normalize,convert,reportSections,reportRows,leakageItems,maintenanceItems};
})();
function initFieldWork(){FieldWork.init();}
function validateFieldWork(value){return FieldWork.validate(value);}
if(typeof module!=='undefined'&&module.exports)module.exports=FieldWork;
