/* 0.12 field reports and temporary scalar-RMS power trials. No calculator formulas. */
const FieldReport=(()=>{
 let initialized=false,reportFrequency=null,reportOwner=null,lastTrial=null,printRequested=false;
 const n=HFC.number;
 const finite=x=>x!==null&&Number.isFinite(x);
 function trialSettings(){const last=state.power.rows.at(-1);return {parent:last?.id||'supply',cable:last?.cable||'p3_625',length:'',amps:'',minV:'',dcRate:last?.cable==='custom'?(last.dcRate??''):'',...(state.power.whatIf||{})};}
 function calculatePowerWhatIf(settings=trialSettings()){
  const length=n(settings.length),amps=n(settings.amps),minimum=n(settings.minV);
  if(length===null||length<0||amps===null||amps<0)return {ok:false,error:'Enter nonnegative extra feet and load amps.',voltage:null,headroom:null};
  if(String(settings.minV??'').trim()!==''&&(minimum===null||minimum<0))return {ok:false,error:'Minimum voltage must be nonnegative or blank.',voltage:null,headroom:null};
  if(state.power.rows.length>=200)return {ok:false,error:'The circuit already has 200 points. Remove one before adding a trial.',voltage:null,headroom:null};
  const usedIds=new Set(state.power.rows.flatMap(r=>[r.id,r.parent]));
  let nextId=Math.max(0,...state.power.rows.map(r=>Number(r.id.slice(1))||0))+1;
  if(!Number.isSafeInteger(nextId)){nextId=1;while(usedIds.has('p'+nextId))nextId++;}
  const id='p'+nextId;
  const row={id,name:'What-if load',parent:settings.parent||'supply',length:settings.length,cable:settings.cable,dcRate:settings.cable==='custom'?(settings.dcRate??''):'',extraR:0,equipment:'custom',mode:'amps',load:settings.amps,pf:1,minV:settings.minV??''};
  const plan={...state.power,rows:[...state.power.rows.map(r=>({...r})),row]};
  const result=HFC.powerRun(plan,catalog),end=result.rows.find(r=>r.id===id),voltage=end?.voltage??null;
  return {...result,voltage,headroom:voltage===null||minimum===null?null:voltage-minimum,trialRow:row,plan};
 }
 function renderTrialInputs(){
  const el=$('powerWhatIf');if(!el)return;const s=trialSettings();
  el.innerHTML=`<summary>Power what-if</summary><p class="note">Prediction: add cable and an amp load to a copy of this power circuit. Shared-trunk currents and equipment voltages are recalculated with the existing scalar RMS model. Keep adds the trial as a real planning row.</p><div class="whatif-fields"><label>Fed from<select data-trial="parent">${option('supply','Power supply',s.parent)}${state.power.rows.map((r,i)=>option(r.id,powerName(r,i),s.parent)).join('')}${s.parent!=='supply'&&!state.power.rows.some(r=>r.id===s.parent)?option(s.parent,'Missing power parent',s.parent):''}</select></label><label>Cable<select data-trial="cable">${catalog.cables.map(c=>option(c.id,c.label,s.cable)).join('')}${option('custom','Custom resistance',s.cable)}</select></label><label>More cable (ft)<input data-trial="length" type="number" min="0" step="any" value="${esc(s.length)}"></label><label>Added load (A)<input data-trial="amps" type="number" min="0" step="any" value="${esc(s.amps)}"></label><label>Minimum voltage (V)<input data-trial="minV" type="number" min="0" step="any" value="${esc(s.minV)}"></label><label id="trialCustomResistance"${s.cable==='custom'?'':' hidden'}>Loop Ω / 1,000 ft<input data-trial="dcRate" type="number" min="0" step="any" value="${esc(s.dcRate)}"><span class="note">At actual temperature; no temperature correction.</span></label></div><div class="trial-result" role="status"><div><span>Predicted end voltage</span><strong id="trialVoltage">— V</strong></div><div><span>Predicted voltage headroom</span><strong id="trialHeadroom">— V</strong></div></div><div id="trialStatus" class="note"></div><button type="button" id="keepPowerTrial">Keep in power circuit</button>`;
  refreshTrial();
 }
 function refreshTrial(){
  if(!$('powerWhatIf'))return;lastTrial=calculatePowerWhatIf();
  $('trialVoltage').textContent=fmt(lastTrial.voltage)+' V';$('trialHeadroom').textContent=fmt(lastTrial.headroom)+' V';
  $('trialHeadroom').classList.toggle('danger',finite(lastTrial.headroom)&&lastTrial.headroom<0);
  const status=$('trialStatus');status.textContent=lastTrial.ok?[(lastTrial.headroom===null?'Enter a minimum voltage to calculate headroom.':lastTrial.headroom<0?'Below the entered minimum voltage.':'At or above the entered minimum voltage.'),...(lastTrial.warnings||[])].join(' '):lastTrial.error;
  $('keepPowerTrial').disabled=!lastTrial.ok;
 }
 function keepTrial(){
  const result=calculatePowerWhatIf();if(!result.ok){$('message').textContent=result.error;return;}
  state.power.rows.push({...result.trialRow,name:'Added what-if load'});powerSerial=Math.max(powerSerial,Number(result.trialRow.id.slice(1))+1);
  delete state.power.whatIf;state.example=false;renderPower();refreshPower();saveLocal();$('message').textContent='Kept the trial as a power planning row.';
 }
 function syncReportOwner(){if(reportOwner!==state){reportOwner=state;reportFrequency=null;}}
 function sheetFrequency(){syncReportOwner();return reportFrequency===null?n(state.setup.lowF):n(reportFrequency);}
 function valueText(x){return finite(x)?x.toFixed(2):'—';}
 function workOrderData(){
  if(typeof JobsUI!=='undefined'&&typeof JobsUI.metadata==='function')return JobsUI.metadata(state);
  const j=state.job||{},meta=state.project?.meta||{};
  return {...j,workOrder:j.workOrder??meta.job??'',address:j.address??meta.address??'',symptom:j.symptom??meta.symptom??'',startTime:j.startTime??meta.startTime??'',endTime:j.endTime??meta.endTime??'',weather:j.weather??meta.weather??'',resolution:j.resolution??meta.resolution??'',partsUsed:j.partsUsed??meta.partsUsed??''};
 }
 function workOrderEntries(metadata=workOrderData()){
  const fallback=[['workOrder','Ticket / work-order number'],['address','Address / location note'],['symptom','Symptom / problem'],['startTime','Start time'],['endTime','End time'],['weather','Weather note'],['resolution','Resolution notes'],['partsUsed','Parts used']];
  const definitions=typeof JobsUI!=='undefined'&&Array.isArray(JobsUI.workOrderFields)?JobsUI.workOrderFields:fallback;
  return definitions.filter(([key])=>String(metadata[key]??'').trim()).map(([key,label])=>({key,label,value:String(metadata[key])}));
 }
 function fieldWorkSections(){return typeof FieldWork!=='undefined'&&typeof FieldWork.reportSections==='function'?FieldWork.reportSections(state):[];}
 function equipmentSections(){return state.equipmentSetup&&typeof EquipmentSetup!=='undefined'&&typeof EquipmentSetup.reportSections==='function'?EquipmentSetup.reportSections():[];}
 function keyAvailability(value){return ({'not-supplied':'Not supplied',supplied:'Supplied by supervisor',verified:'Verified against approved pilot'})[value]||'';}
 function controlText(section){
  const label=({'oem-agc':'OEM GainMaker AGC',dsim:'ACI DSIM','manual-thermal':'Manual / thermal control'})[section.gainControl];
  return label?['Installed gain-control path: '+label,...(typeof section.procedureMode==='string'&&section.procedureMode.trim()&&section.procedureMode.length<=100?['Selected setup method: '+section.procedureMode.replace(/-/g,' ')]:[])]:[];
 }
 function dsimEntries(section){
  return [['dsimModel','DSIM module',500],['firmware','Module / controller firmware',500],['pilot','Pilot center MHz',100],['pilotType','Pilot signal type',500]].flatMap(([key,label,max])=>{
   const value=section[key];if(!['string','number'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))return [];
   const text=String(value);return text.trim()&&text.length<=max?[{label,value:text}]:[];
  });
 }
 function dsimText(section){const fields=dsimEntries(section);return fields.length?['Recorded DSIM setup; alignment and RF acceptance remain unverified.',...fields.map(field=>field.label+': '+field.value)]:[];}
 function manualReviewText(manual){
  const kind=manual.kind==='manual'?'Setup manual':manual.kind==='datasheet'?'Datasheet reference; exact setup procedure unverified':'Manual required; procedure unverified';
  return `${manual.id||'Source ID unavailable'} · ${manual.revision||'Revision not recorded'} · ${kind} · ${manual.total>0?`${manual.reviewed} / ${manual.total} steps reviewed`:'No verified setup steps supplied'}`;
 }
 function equipmentText(sections){return sections.flatMap(section=>[
  'Equipment setup · '+section.label,'Equipment ID: '+(section.equipmentId||'Not available'),
  'Reviewed steps and key availability are records only; RF acceptance is separate.',
  ...(section.orphan?['Historical station unavailable in current route; retained notes do not establish current setup.']:[]),
  ...(section.manuals.length?section.manuals.map(manual=>'Manual source registry: '+manualReviewText(manual)):['Manual source registry: No verified current manual recorded.']),
  ...controlText(section),
  'Setup notes: '+(section.notes||'Not recorded'),
  ...dsimText(section),
  ...(keyAvailability(section.keyStatus)?['Supervisor pilot key availability (status only): '+keyAvailability(section.keyStatus)]:[])
 ]);}
 function equipmentMarkup(sections){return sections.map(section=>`<section class="sheet-work-section"><h3>Equipment setup · ${esc(section.label)}</h3><p class="note">Reviewed steps and key availability are records only; RF acceptance is separate.</p><p class="note">Equipment ID: ${esc(section.equipmentId||'Not available')}</p>${controlText(section).length?'<p class="sheet-text">'+controlText(section).map(esc).join('<br>')+'</p>':''}${section.orphan?'<p class="status warning">Historical station unavailable in current route; retained notes do not establish current setup.</p>':''}${section.manuals.length?'<ul>'+section.manuals.map(manual=>'<li>'+esc(manualReviewText(manual))+'</li>').join('')+'</ul>':'<p class="note">Manual source registry: No verified current manual recorded.</p>'}<p class="sheet-text"><b>Setup notes:</b> ${esc(section.notes||'Not recorded')}</p>${dsimText(section).length?'<p class="sheet-text">'+dsimText(section).map(esc).join('<br>')+'</p>':''}${keyAvailability(section.keyStatus)?'<p class="note">Supervisor pilot key availability (status only): '+esc(keyAvailability(section.keyStatus))+'</p>':''}</section>`).join('');}
 function equipmentCsvRows(sections){return sections.flatMap(section=>[
  ['Equipment setup',section.key,section.label,'Equipment ID',section.equipmentId||'Not available','Status',section.orphan?'Historical station unavailable':'Current equipment; reviewed steps are not RF acceptance'],
  ...(section.manuals.length?section.manuals.map(manual=>['Equipment manual source registry',section.key,manual.id||'',manual.revision||'',manual.kind||'',manualReviewText(manual)]):[['Equipment manual source registry',section.key,'No verified current manual recorded']]),
  ...controlText(section).map(text=>['Installed equipment control',section.key,text]),
  ['Equipment setup notes',section.key,section.notes||'Not recorded'],
  ...dsimEntries(section).map(field=>['Recorded DSIM setup',section.key,field.label,field.value,'Alignment and RF acceptance unverified']),
  ...(keyAvailability(section.keyStatus)?[['Supervisor pilot key availability (status only)',section.key,keyAvailability(section.keyStatus)]]:[])
 ]);}
 function workflowMarkup(sections){
  return sections.map(section=>`<section class="sheet-work-section"><h3>${esc(section.title)}</h3><p class="note">Technician checklist and notes; completion does not establish RF acceptance.</p>${section.items?.length?`<ul class="sheet-checks">${section.items.map(item=>`<li><span class="sheet-check-status">${item.done?'Complete':'Not recorded'}</span><div><b>${esc(item.label)}</b>${item.notes?`<p class="sheet-text">${esc(item.notes)}</p>`:''}</div></li>`).join('')}</ul>`:''}${section.notes?`<p class="sheet-text"><b>Notes:</b> ${esc(section.notes)}</p>`:''}${section.reference?`<p class="sheet-text note">${esc(section.reference)}</p>`:''}</section>`).join('');
 }
 function workflowText(sections){return sections.flatMap(section=>[section.title,'Technician checklist; no RF acceptance decision.',...(section.items||[]).map(item=>(item.done?'Complete':'Not recorded')+' · '+item.label+(item.notes?' · '+item.notes:'')),...(section.notes?['Notes: '+section.notes]:[]),...(section.reference?[section.reference]:[])]);}
 function workflowCsvRows(sections){return sections.flatMap(section=>[['Checklist',section.title,'Recorded technician work; no RF acceptance'],...(section.items||[]).map(item=>[section.title,item.label,item.done?'Complete':'Not recorded',item.notes||'']),...(section.notes?[[section.title,'Notes',section.notes]]:[]),...(section.reference?[[section.title,'Voltage reference calculation',section.reference]]:[])]);}
 function sheetData(){
  const frequency=sheetFrequency(),valid=frequency!==null&&frequency>=5&&frequency<=1800,result=valid?evaluate(frequency):null,rows=[];
  state.rows.forEach((r,i)=>{
   const d=device(r.device),c=catalog.cables.find(c=>c.id===r.cable),outputs=HFC.portsFor(d,r);
   (outputs.length?outputs:[{id:'',label:'No output',role:''}]).forEach((port,portIndex)=>{
    const prediction=result?val(result,r.id+'::'+port.id):null,meter=r.meters?.[port.id]&&typeof meterComparison==='function'?meterComparison(r,port.id):null;
    const matches=valid&&meter&&finite(meter.frequency)&&Math.abs(meter.frequency-frequency)<1e-6,measurement=matches?meter.measurement:null;
    const difference=measurement===null||prediction===null?null:measurement-prediction,error=Number.isFinite(difference)?difference:null;
    rows.push({point:name(r,i),parent:r.parent,cable:r.cable==='custom'?'Custom cable':c?.label||r.cable,feet:HFC.spanLength(r),part:d?.model||r.device,port:port.label,role:port.role,through:port.role==='through'?prediction:null,tap:port.role==='through'?null:prediction,measurement,error,warning:'',asBuiltNote:String(r.asBuiltNote??''),showAsBuilt:portIndex===0,converted:!!(matches&&meter.converted),meterOtherFrequency:meter&&finite(meter.measurement)&&!matches?meter.frequency:null});
   });
   if(r.drop&&typeof dropCalculation==='function'){
    const drop=dropCalculation(r,frequency),splitter=device(r.drop.splitter),outputs=drop?.outputs?.length?drop.outputs:[{label:'Ground block',level:null}];
    outputs.forEach(output=>rows.push({point:name(r,i)+' drop',parent:r.id+'::'+(r.drop.port||'tap'),cable:'RG-6 drop (explicit table)',feet:n(r.drop.length),part:r.drop.splitter==='custom'?'Custom splitter':splitter?.id==='none'?'Cable only':splitter?.model||'Cable only',port:output.label+' · DROP',role:'drop',through:null,tap:output.level,measurement:null,error:null,converted:false,meterOtherFrequency:null,asBuiltNote:'',showAsBuilt:false,warning:drop?.warning||'Drop only; not mainline or power-passing.'}));
   }
  });
  const node=state.node,p=NodeTools.profile(node,catalog),band=NodeTools.band(node,catalog),meta=state.project?.meta||{},job=workOrderData();
  return {frequency,rows,launchSource:typeof LaunchSource!=='undefined'?LaunchSource.label():'Launch / amp output',equipmentSetup:equipmentSections(),node:p?.label||'Not selected',split:band?.label||'Not selected',operatingUpper:n(node?.operatingUpper),available:n(state.setup.liveMax),job:job.name||meta.job||'Working job',asset:job.node||node?.asset||meta.node||'',date:state.job?.date??meta.date??'',lead:job.lead||meta.lead||'',sample:!!state.example,training:state.job?.training==='guided-1.5',workOrder:workOrderEntries(job),fieldWork:fieldWorkSections()};
 }
 function carrierTargetText(){
  const markers=state.fieldReferences?.localMarkers;if(!markers||![markers.low,markers.high].some(v=>v!==undefined&&String(v).trim()!==''))return [];
  if(typeof FieldReference==='undefined'||typeof FieldReference.setupTargets!=='function')return [];
  const result=FieldReference.setupTargets();
  return ['Available-carrier setup targets · calculated estimate','Local design reference: 31 dBmV at 54 MHz / 43 dBmV at 860 MHz',result.ok?'Curve: '+result.curveLabel:'Pending: '+result.error,...(result.ok?['Low setup carrier: '+result.lowMHz+' MHz → '+Number(result.low).toFixed(2)+' dBmV','High setup carrier: '+result.highMHz+' MHz → '+Number(result.high).toFixed(2)+' dBmV','High minus low: '+Number(result.tilt).toFixed(2)+' dB',result.limitsNote||'']:[]),'Model estimate only; confirm actual live channel centers, signal convention, measurement plane and approved equalizer curve. This is not a measurement or RF acceptance.'];
 }
 function renderSheet(){
  syncReportOwner();
  if(reportFrequency===null&&$('runSheetFrequency'))$('runSheetFrequency').value=state.setup.lowF??'';
  const body=$('runSheetBody');if(!body)return;const data=sheetData(),freq=data.frequency;
  $('runSheetSummary').innerHTML=`<h2>Carpe Noctum 2.0 Alpha build 4 · Run sheet</h2>${window.NightSweep.selfCheck?.ok===false?'<p class="status error">BUILD SELF-CHECK FAILED — Do not trust the results.</p>':'<p class="note">Reference cases '+(window.NightSweep.selfCheck?.ok?'match. They prove this build, not the plant.':'pending.')+'</p>'}<p><b>${esc(data.job)}</b>${data.asset?' · '+esc(data.asset):''}${data.date?' · '+esc(data.date):''}${data.lead?' · Lead: '+esc(data.lead):''}</p>${data.training?'<p class="status warning">SYNTHETIC TRAINING JOB: all readings and findings are practice data, not field measurements or acceptance.</p>':data.sample?'<p class="status warning">Sample route: three Technetix taps, not your plant.</p>':''}${data.workOrder.length?`<section class="sheet-work-order"><h3>Work order / ticket</h3><dl>${data.workOrder.map(item=>`<div class="sheet-work-field ${['resolution','partsUsed','symptom','address'].includes(item.key)?'sheet-work-wide':''}"><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl></section>`:''}<p class="note"><b>Launch source:</b> ${esc(data.launchSource)}</p><p class="note"><b>Node:</b> ${esc(data.node)} · <b>Split:</b> ${esc(data.split)} · <b>Entered operating upper:</b> ${data.operatingUpper===null?'—':esc(data.operatingUpper)+' MHz'}</p><p class="note">Predictions at ${freq===null?'—':esc(freq)} MHz. Hardware capability is separate from available spectrum (${data.available===null?'—':esc(data.available)} MHz). A 993 MHz marker does not certify 1.2 or 1.8 GHz. Meter readings are field comparisons; the job log remains the official record.</p>`;
  body.innerHTML=data.rows.map(r=>`<tr><td><b>${esc(r.point)}</b><small>${esc(r.port)}</small></td><td>${esc(r.cable)}</td><td class="num">${r.feet===null?'—':esc(r.feet)}</td><td>${esc(r.part)}${r.warning?'<small>'+esc(r.warning)+'</small>':''}</td><td class="num prediction">${valueText(r.through)}</td><td class="num prediction">${valueText(r.tap)}</td><td class="num measurement">${valueText(r.measurement)}${r.converted?'<small>Converted</small>':''}${r.meterOtherFrequency!==null?'<small>Meter at '+esc(r.meterOtherFrequency)+' MHz</small>':''}</td><td class="num measurement">${valueText(r.error)}</td></tr>${r.showAsBuilt&&r.asBuiltNote?`<tr class="sheet-as-built"><td colspan="8"><b>As-built / map variance · ${esc(r.point)}:</b> <span>${esc(r.asBuiltNote)}</span></td></tr>`:''}`).join('')||'<tr><td colspan="8">No route points.</td></tr>';
  const sweep=$('runSheetSweepSetup');if(sweep){const text=typeof SweepSetup!=='undefined'?SweepSetup.reportText(state):'';sweep.hidden=!text;sweep.innerHTML=text?'<h3>Sweep setup records</h3><pre class="sweep-sheet">'+esc(text)+'</pre>':'';}
  const carrier=$('runSheetCarrierTargets');if(carrier){const lines=carrierTargetText();carrier.hidden=!lines.length;carrier.innerHTML=lines.length?'<h3>Available-carrier setup targets</h3><pre class="sweep-sheet">'+esc(lines.join('\n'))+'</pre>':'';}
  const work=$('runSheetFieldWork');if(work){work.hidden=!data.fieldWork.length;work.innerHTML=workflowMarkup(data.fieldWork);}
  const equipment=$('runSheetEquipmentSetup');if(equipment){equipment.hidden=!data.equipmentSetup.length;equipment.innerHTML=equipmentMarkup(data.equipmentSetup);}
  $('runSheetNotice').textContent='Cable feet include entered slack/risers. All levels are dBmV; error = converted meter output − prediction at the same frequency. A dash means missing data or a meter at a different frequency. Predictions do not certify RF acceptance.';
 }
 function sheetText(){
  const d=sheetData(),show=x=>finite(x)?x.toFixed(2):'—';
  return ['Carpe Noctum 2.0 Alpha build 4 · Run sheet',window.NightSweep.selfCheck?.ok===false?'BUILD SELF-CHECK FAILED — Do not trust the results.':window.NightSweep.selfCheck?.ok?'Reference cases match. They prove this build, not the plant.':'Reference cases pending.',d.training?'SYNTHETIC TRAINING JOB: all readings and findings are practice data, not field measurements or acceptance.':d.sample?'SAMPLE: three Technetix taps, not your plant.':'',d.job+(d.asset?' · '+d.asset:''),'Date: '+(d.date||'—')+' · Lead: '+(d.lead||'—'),...d.workOrder.map(item=>item.label+': '+item.value),'Launch source: '+d.launchSource,'Node: '+d.node+' · Split: '+d.split+' · Operating upper: '+(d.operatingUpper??'—')+' MHz','Prediction frequency: '+(d.frequency??'—')+' MHz · Available spectrum: '+(d.available??'—')+' MHz','993 MHz does not certify 1.2 or 1.8 GHz. Hardware capability is not available spectrum.','Pole | Cable | Feet | Part | Output | Pred through | Pred tap/output | Meter output | Error (dBmV)',...d.rows.flatMap(r=>[[r.point,r.cable,r.feet??'—',r.part,r.port,show(r.through),show(r.tap),show(r.measurement)+(r.converted?' converted':''),show(r.error),r.warning||''].join(' | '),...(r.showAsBuilt&&r.asBuiltNote?['As-built / map variance · '+r.point+': '+r.asBuiltNote]:[])]),...workflowText(d.fieldWork),...equipmentText(d.equipmentSetup),...carrierTargetText(),...(typeof SweepSetup!=='undefined'&&state.sweepSetup?[SweepSetup.reportText(state)]:[]),'Meter comparisons are separate from official project records. Dash means unavailable or different measurement frequency.'].filter(Boolean).join('\n');
 }
 async function shareSheet(){
  const text=sheetText();
  if(window.NightSweepAndroid?.shareText){window.NightSweepAndroid.shareText('Carpe Noctum 2.0 Alpha build 4 · Run sheet',text);$('message').textContent='Choose an app to share the run sheet.';return;}
  if(window.NightSweepAndroid?.saveFile){download('CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.txt',text,'text/plain');$('message').textContent='Run sheet text prepared. Complete the save dialog to share the file.';return;}
  if(window.BrowserFiles){await window.BrowserFiles.prepare('CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.txt',text,'text/plain');return;}
  if(typeof navigator.share==='function'){
   try{await navigator.share({title:'Carpe Noctum 2.0 Alpha build 4 · Run sheet',text});$('message').textContent='Run sheet shared.';return;}catch(e){if(e.name==='AbortError'){$('message').textContent='Sharing cancelled. Nothing was sent.';return;}}
  }
  download('CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.txt',text,'text/plain');$('message').textContent='Run sheet text prepared. Complete the save dialog to share the file.';
 }
 function csvRows(){
  const d=sheetData();return [['Carpe Noctum 2.0 Alpha build 4 run sheet'],...(d.training?[['SYNTHETIC TRAINING JOB','All readings and findings are practice data, not field measurements or acceptance.']]:[]),['Job',d.job,'Asset',d.asset,'Date',d.date,'Lead',d.lead],...d.workOrder.map(item=>['Work order / ticket',item.label,item.value]),['Launch source',d.launchSource],['Node',d.node,'Split',d.split,'Operating upper MHz',d.operatingUpper],['Prediction frequency MHz',d.frequency,'Available spectrum MHz',d.available],['Scope','Predictions and field meter comparisons, not official acceptance. 993 MHz does not certify 1.2 or 1.8 GHz.'],['Pole / point','Cable','Feet','Part','Output','Predicted through dBmV','Predicted tap/output dBmV','Measured output dBmV','Meter minus prediction dB','Converted TP','Note','As-built / map variance'],...d.rows.map(r=>[r.point,r.cable,r.feet,r.part,r.port,r.through,r.tap,r.measurement,r.error,r.measurement===null?'':r.converted?'Yes':'No',r.warning||'',r.asBuiltNote||'']),...workflowCsvRows(d.fieldWork),...equipmentCsvRows(d.equipmentSetup),...carrierTargetText().map(line=>['Available-carrier setup estimate',line]),...(typeof SweepSetup!=='undefined'&&state.sweepSetup?SweepSetup.reportText(state).split('\n').map(line=>['Sweep setup',line]):[])];
 }
 function sheetCsv(){
  download('CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.csv',csvRows().map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv');
 }
 function printSheet(){
  renderSheet();printRequested=true;document.body.classList.add('print-runsheet');
  if(window.NightSweepAndroid?.printReport)window.NightSweepAndroid.printReport();else window.print();
 }
 function openSheet(){renderSheet();showTab('runsheet');}
 function init(){
  if(initialized)return;initialized=true;
  const trial=document.createElement('details');trial.id='powerWhatIf';trial.open=true;$('powerPanel').append(trial);renderTrialInputs();
  const panel=document.createElement('section');panel.id='runSheetPanel';panel.className='panel';panel.dataset.screen='runsheet';panel.hidden=true;
  panel.innerHTML='<div class="sectionhead runsheet-controls"><label>Report frequency (MHz)<input id="runSheetFrequency" type="number" min="5" max="1800" step="any"></label><div class="toolbar"><button id="runSheetPrint" type="button">Print run sheet</button><button id="runSheetShare" type="button">Share</button><button id="runSheetCsv" type="button">Export sheet CSV</button><button id="runSheetBack" type="button">Back to route</button></div></div><div id="runSheetSummary"></div><div class="tablewrap"><table class="runsheet-table"><thead><tr><th>Pole / point</th><th>Cable</th><th>Feet</th><th>Part</th><th>Predicted<br>through</th><th>Predicted<br>tap / output</th><th>Meter<br>output</th><th>Error<br>dB</th></tr></thead><tbody id="runSheetBody"></tbody></table></div><div id="runSheetFieldWork" hidden></div><div id="runSheetEquipmentSetup" hidden></div><div id="runSheetCarrierTargets" hidden></div><div id="runSheetSweepSetup" hidden></div><p id="runSheetNotice" class="note"></p>';
  document.querySelector('main').append(panel);$('runSheetFrequency').value=state.setup.lowF??'';
  screenCopy.runsheet=['FIELD RUN SHEET','Carry the route.','Predicted outputs beside your meter readings.'];
  for(const host of [document.querySelector('.filemenu .toolbar'),$('routePanel').querySelector('.sectionhead .actions')]){
   if(!host)continue;const button=document.createElement('button');button.type='button';button.textContent='Run sheet';button.dataset.runSheet='';host.append(button);
  }
  const oldPowerRender=renderPower;renderPower=function(){oldPowerRender();renderTrialInputs();};
  const oldPowerRefresh=refreshPower;refreshPower=function(){oldPowerRefresh();refreshTrial();};
  const oldRefresh=refreshResults;refreshResults=function(){oldRefresh();if(!$('runSheetPanel').hidden)renderSheet();};
  const oldShowTab=showTab;showTab=function(tab){if(tab==='runsheet'){const input=$('runSheetFrequency');if(reportFrequency===null)input.value=state.setup.lowF??'';renderSheet();}oldShowTab(tab);};
  window.NightSweep.showTab=showTab;
  const oldPrepare=window.NightSweep.preparePrint;window.NightSweep.preparePrint=()=>{renderSheet();oldPrepare?.();};
  window.addEventListener('beforeprint',renderSheet);
  const oldRestore=window.NightSweep.restorePrint;window.NightSweep.restorePrint=()=>{oldRestore?.();if(printRequested){printRequested=false;document.body.classList.remove('print-runsheet');}};
  window.addEventListener('afterprint',()=>{printRequested=false;document.body.classList.remove('print-runsheet');});
  document.addEventListener('input',e=>{
   const t=e.target;if(t.dataset.trial&&t.tagName!=='SELECT'){state.power.whatIf={...trialSettings(),[t.dataset.trial]:t.value};refreshTrial();saveLocal();}
   if(t.id==='runSheetFrequency'){syncReportOwner();reportFrequency=t.value;renderSheet();}
  });
  document.addEventListener('change',e=>{const t=e.target;if(t.dataset.trial&&t.tagName==='SELECT'){state.power.whatIf={...trialSettings(),[t.dataset.trial]:t.value};if($('trialCustomResistance'))$('trialCustomResistance').hidden=state.power.whatIf.cable!=='custom';refreshTrial();saveLocal();}});
  document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.hasAttribute('data-run-sheet'))openSheet();if(t.id==='keepPowerTrial')keepTrial();});
  $('runSheetPrint').onclick=printSheet;$('runSheetShare').onclick=shareSheet;$('runSheetCsv').onclick=sheetCsv;$('runSheetBack').onclick=()=>showTab('route');
  renderSheet();
 }
 return {init,calculatePowerWhatIf,refreshTrial,sheetData,sheetText,csvRows,sheetCsv,renderSheet,openSheet,printSheet};
})();
function initFieldReport(){FieldReport.init();}
function powerWhatIfCalculation(settings){return FieldReport.calculatePowerWhatIf(settings);}
