/* Offline equipment setup references. Reviewed directions are not RF acceptance.
 * DSIM is configured in ACI's controller/app; Carpe Noctum never connects to plant.
 * Historical published pilot codes are references, not hardware verification. */
const EquipmentSetup=(()=>{
 const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const own=()=>typeof state!=='undefined'&&record(state)?state:{};
 const cat=()=>typeof catalog!=='undefined'&&record(catalog)?catalog:{};
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const choice=(value,label,current)=>`<option value="${escape(value)}"${String(value)===String(current)?' selected':''}>${escape(label)}</option>`;
 const safeKey=key=>typeof key==='string'&&key.length>0&&key.length<=100&&!['__proto__','constructor','prototype'].includes(key)&&/^[A-Za-z0-9_.:-]+$/.test(key);
 const stationFields=['checks','notes','dsimModel','firmware','pilot','pilotType','keyStatus','dsimContext','gainControl','procedureMode'];
 const controlTypes=['','oem-agc','dsim','manual-thermal'];
 const models=['','DSIM-SG','DSIM-A','other'],pilotTypes=['','QAM','analog','CW','OFDM PLC'],keyStatuses=['','not-supplied','supplied','verified'];
 const links={sg:'https://acicomms.com/wp-content/uploads/2021/04/04.-DSIM-SG-TechManual-Rev-H-210408b.pdf',sgE:'https://thomasonbbs.com/store/pc/catalog/DSIM-SG%20TechManual%20Rev%20E%20151003.pdf',app:'https://acicomms.com/wp-content/uploads/2021/03/11.-DSIM-App-Manual-Rev-B-210324.pdf',data:'https://acicomms.com/wp-content/uploads/2022/08/10.-DSIM-Data-sheet-Rev-AB-220817.pdf'};
 let initialized=false,lastOwner=null,lastTarget='',lastContext='',message='';
 function validate(value){
  if(value===undefined)return;
  if(!record(value)||Object.keys(value).some(k=>!['selected','stations'].includes(k)))throw Error('Invalid equipment setup data.');
  if(value.selected!==undefined&&!safeKey(value.selected))throw Error('Invalid equipment setup selection.');
  if(value.stations!==undefined&&(!record(value.stations)||Object.keys(value.stations).length>250))throw Error('Equipment setup is limited to 250 station drafts.');
  for(const [key,item] of Object.entries(value.stations||{})){
   if(!safeKey(key)||!record(item)||Object.keys(item).some(k=>!stationFields.includes(k)))throw Error('Invalid equipment setup station.');
   for(const [field,v] of Object.entries(item)){
    if(field==='checks')continue;
    if(typeof v!=='string'||v.length>(field==='notes'?8000:field==='dsimContext'?1500:field==='pilot'?100:500))throw Error('Invalid equipment setup '+field+'.');
   }
   if(item.gainControl!==undefined&&!controlTypes.includes(item.gainControl))throw Error('Invalid installed gain-control path.');
   if(item.procedureMode!==undefined&&item.procedureMode!==''&&!safeKey(item.procedureMode))throw Error('Invalid equipment procedure mode.');
   if(item.dsimModel!==undefined&&!models.includes(item.dsimModel))throw Error('Invalid DSIM model.');
   if(item.pilotType!==undefined&&!pilotTypes.includes(item.pilotType))throw Error('Invalid DSIM pilot type.');
   if(item.keyStatus!==undefined&&!keyStatuses.includes(item.keyStatus))throw Error('Invalid pilot-code verification status.');
   if(item.checks!==undefined&&(!record(item.checks)||Object.keys(item.checks).length>1500))throw Error('Invalid equipment setup checklist.');
   for(const [id,done] of Object.entries(item.checks||{}))if(!id||id.length>1500||['__proto__','constructor','prototype'].includes(id)||typeof done!=='boolean')throw Error('Invalid reviewed setup step.');
  }
 }
 function draft(){const raw=record(own().equipmentSetup)?own().equipmentSetup:{};return {...raw,selected:typeof raw.selected==='string'&&raw.selected?raw.selected:'source',stations:record(raw.stations)?raw.stations:{}};}
 function station(data=draft()){const raw=record(data.stations[data.selected])?data.stations[data.selected]:{};return {checks:{},notes:'',dsimModel:'',firmware:'',pilot:'',pilotType:'',keyStatus:'',dsimContext:'',gainControl:typeof raw.gainControl==='string'?raw.gainControl:raw.dsimModel?'dsim':'',procedureMode:'',...raw};}
 function findDevice(id){return (cat().devices||[]).find(d=>d.id===id)||null;}
 function manualFor(equipmentId){return (cat().setupManuals?.records||[]).filter(m=>Array.isArray(m.equipmentIds)&&m.equipmentIds.includes(equipmentId));}
 function controlFor(p){return controlTypes.includes(p.gainControl)?p.gainControl:p.dsimModel?'dsim':'';}
 function applicableManuals(t,p){return manualFor(t.id).filter(m=>!m.controlType||m.controlType===controlFor(p)).map(m=>{
  if(!Array.isArray(m.procedureModes))return m;
  const mode=m.procedureModes.find(x=>x.id===p.procedureMode);
  return {...m,steps:mode?.steps||[],procedureMode:mode?.id||'',procedureLabel:mode?.label||'',needsProcedure:!mode};
 });}
 function gainControlPanel(t,p){
  if(!t.gainMaker)return '';
  const current=controlFor(p),methods=manualFor(t.id).filter(m=>m.controlType===current).flatMap(m=>Array.isArray(m.procedureModes)?m.procedureModes:[]),unique=[...new Map(methods.map(m=>[m.id,m])).values()];
  return `<section class="rowcard"><h3>Installed gain control</h3><p class="note">Choose the control fitted in this station. OEM AGC, ACI DSIM and manual/thermal control have different setup instructions and pad rules.</p><label>Gain-control path<select data-equipment-field="gainControl">${choice('','Choose installed control',current)}${choice('oem-agc','OEM GainMaker AGC',current)}${choice('dsim','ACI DSIM',current)}${choice('manual-thermal','Manual / thermal control',current)}</select></label>${unique.length?`<label>Documented setup method<select data-equipment-field="procedureMode">${choice('','Choose applicable method',p.procedureMode)}${unique.map(m=>choice(m.id,m.label,p.procedureMode)).join('')}</select></label><p class="note">Match the method to the installed station, compensator and applicable manual before following its steps.</p>`:''}${!current?'<p class="status warning">Identify the installed control before using equipment-specific adjustments.</p>':''}</section>`;
 }
 function setupFrequencyPanel(t,p){
  const owner=own(),profile=(owner.project?.profiles||[]).find(x=>String(x.id)===String(owner.project?.selectedProfile)),tx=Number(profile?.returnCeiling)===42?owner.sweepSetup?.profiles?.['42']:null;
  const value=(x,unit)=>x!==null&&x!==undefined&&String(x).trim()!==''&&Number.isFinite(Number(x))?escape(x)+' '+unit:'Not set';
  const pilot=t.gainMaker&&controlFor(p)==='dsim'&&boundDsim(t,p)?value(p.pilot,'MHz'):'Confirm installed control / pilot';
  const calculated=typeof FieldReference!=='undefined'&&typeof FieldReference.setupTargets==='function'?FieldReference.setupTargets():null;
  const available=calculated?.ok?`<h4>Calculated targets at available carriers</h4><p><strong>${value(calculated.lowMHz,'MHz')} → ${Number(calculated.low).toFixed(2)} dBmV<br>${value(calculated.highMHz,'MHz')} → ${Number(calculated.high).toFixed(2)} dBmV</strong></p><p class="note">Estimate from the local 31 dBmV at 54 MHz / 43 dBmV at 860 MHz reference using ${escape(calculated.curveLabel)}. This does not move the design anchors or certify the installed equalizer curve. ${escape(calculated.limitsNote||'')}</p>`:`<p class="note">Available carrier targets: ${escape(calculated?.error||'Enter actual low/high channel centers and select the calculation curve in Field target presets. Design anchors are not automatically live carriers.')}</p>`;
  return `<section class="rowcard" data-equipment-frequency-guide><h3>Setup frequencies &amp; job levels</h3><p class="note">Selected job design profile${profile?' · '+escape(profile.id):' not selected'}. Confirm that these entered targets apply to this station, output port, split and signal convention. They are not meter readings or manufacturer output ratings.</p><div class="tablewrap"><table><thead><tr><th>Purpose</th><th>Frequency / plan</th><th>Entered job reference</th></tr></thead><tbody><tr><td>Forward low</td><td>${value(profile?.forwardLow,'MHz')}</td><td>${value(profile?.launchLow,'dBmV')}</td></tr><tr><td>Forward high</td><td>${value(profile?.forwardHigh,'MHz')}</td><td>${value(profile?.launchHigh,'dBmV')}</td></tr><tr><td>Return TX · 42 MHz workflow</td><td>${escape(tx?.txReferenceChannels||'Enter the return frequencies / service plan')}</td><td>${value(tx?.txReference,'dBmV')}</td></tr><tr><td>AGC pilot</td><td>${pilot}</td><td>Use the installed module and approved pilot</td></tr></tbody></table></div>${available}<p class="note">Level markers, AGC pilot and manual-backoff test frequencies serve different purposes. Use the exact procedure below for its backoff test frequency. A TX reference is separate from node receive level and sweep-generator injection. Test-point correction is applied once at the identified measurement plane.</p><div class="toolbar"><button type="button" data-task="references">Field target presets</button><button type="button" data-task="records">Edit job targets</button><button type="button" data-task="sweepSetup">Return TX / service plan</button></div></section>`;
 }
 function bandText(d){const g=d?.publishedGain||{},forward=g.forwardBand,reverse=g.reverseBand;return [Array.isArray(reverse)?reverse.join('–')+' MHz return':'return band unverified',Array.isArray(forward)?forward.join('–')+' MHz forward':'forward band unverified'].join(' / ');}
 function targets(){
  const owner=own(),type=owner.setup?.sourceType||'manual',node=(cat().nodeProfiles||[]).find(n=>n.id===owner.node?.model);
  let source={key:'source',id:'',label:'Launch / manually recorded source',band:'Not selected',gainMaker:false};
  if(type==='node'){
   const selectedBand=owner.node?.band,bandIndex=String(selectedBand??'').trim()===''?null:Number(selectedBand),b=Number.isInteger(bandIndex)?node?.bands?.[bandIndex]:null;source={...source,id:owner.node?.model||'',label:'Launch node · '+(node?.label||'Choose installed node'),band:b?b.label||`${b.returnCeiling}/${b.forwardFloor} MHz; ${b.equipmentUpper} MHz upper`:'Node split not selected'};
  }else if(type==='active'){
   const id=owner.setup?.sourceModel||'',d=findDevice(id);source={...source,id,label:'Launch active · '+(d?.label||'Choose installed amp / LE'),band:bandText(d),gainMaker:!!d?.active&&id.startsWith('active_gm_')};
  }
  const result=[source];
  for(const [index,row] of (owner.rows||[]).entries()){
   const d=findDevice(row.device);if(!d?.active)continue;
   result.push({key:row.id,id:row.device,label:(row.name||'Point '+(index+1))+' · '+(d.label||d.model||row.device),band:bandText(d),gainMaker:row.device.startsWith('active_gm_')});
  }
  return result;
 }
 function target(data=draft()){return targets().find(t=>t.key===data.selected)||{key:data.selected,id:'',label:'Saved station unavailable',band:'Historical record; current equipment unavailable',gainMaker:false,orphan:true};}
 function bindingContext(t){const s=own().setup||{};return JSON.stringify([t.key,t.id,t.band,...(t.key==='source'?[s.sourceAsset||'',s.sourcePort||'']:[])]);}
 function hasDsim(p){return ['dsimModel','firmware','pilot','pilotType','keyStatus'].some(key=>typeof p[key]==='string'&&p[key].trim());}
 function boundDsim(t,p){return t.gainMaker===true&&controlFor(p)==='dsim'&&p.dsimContext===bindingContext(t);}
 function visibleKeyStatus(t,p){return hasDsim(p)&&!boundDsim(t,p)&&p.keyStatus==='verified'?'not-supplied':p.keyStatus;}
 function context(t,m){const stored=draft().stations[t.key]||{};return JSON.stringify([String(m.id||''),String(m.revision||''),t.id,t.band,String(own().project?.selectedProfile||''),m.dsim||'',m.controlType?controlFor(stored):'',m.procedureMode||'',...(m.dsim?[stored.firmware||'',stored.pilot||'',stored.pilotType||'',stored.dsimContext||'']:[])]);}
 function checkId(t,m,index){return context(t,m)+'::'+index;}
 function safeUrl(value){try{const u=new URL(String(value));return u.protocol==='https:'?u.href:'';}catch(_){return '';}}
 function reportSections(){
  const data=draft(),currentTargets=targets(),currentKeys=new Set(currentTargets.map(t=>t.key));
  const allTargets=[...currentTargets,...Object.keys(data.stations).filter(key=>!currentKeys.has(key)).map(key=>({key,id:'',label:'Saved station unavailable · '+key,band:'Historical record; current equipment unavailable',orphan:true}))];
  return allTargets.map(t=>{
   const stored=record(data.stations[t.key])?data.stations[t.key]:{},checks=record(stored.checks)?stored.checks:{};
   const historicalDsim=!t.orphan&&hasDsim(stored)&&!boundDsim(t,stored);
   const applicable=historicalDsim?{}:stored,notes=typeof stored.notes==='string'?stored.notes:'';
   return {key:t.key,label:t.label,equipmentId:t.id,manuals:reviewManuals(t,stored).map(m=>{const steps=Array.isArray(m.steps)?m.steps:[];return {id:String(m.id||''),revision:String(m.revision||''),kind:['manual','datasheet','request'].includes(m.kind)?m.kind:'request',reviewed:m.dsim&&!boundDsim(t,stored)?0:steps.filter((_,i)=>checks[checkId(t,m,i)]===true).length,total:steps.length};}),notes:historicalDsim?'Historical DSIM settings belong to an earlier equipment selection. Review retained station notes against the current equipment.'+(notes?' '+notes:''):notes,keyStatus:keyStatuses.includes(applicable.keyStatus)?applicable.keyStatus:'',dsimModel:models.includes(applicable.dsimModel)?applicable.dsimModel:'',firmware:typeof applicable.firmware==='string'?applicable.firmware:'',pilot:typeof applicable.pilot==='string'?applicable.pilot:'',pilotType:pilotTypes.includes(applicable.pilotType)?applicable.pilotType:'',orphan:t.orphan===true,gainControl:t.gainMaker?controlFor(stored):'',procedureMode:t.gainMaker&&typeof stored.procedureMode==='string'?stored.procedureMode:''};
  });
 }
 function link(url,label){const safe=safeUrl(url);return safe?`<a href="${escape(safe)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`:'<span class="note">Source link unavailable — confirm with the manufacturer.</span>';}
 function manualCard(m,t,stored){
  const steps=Array.isArray(m.steps)?m.steps:[],gaps=Array.isArray(m.gaps)?m.gaps:[],kind=m.kind==='manual'?'Setup manual':m.kind==='datasheet'?'Datasheet reference — not a setup manual':'Manual required — unverified procedure';
  return `<article class="rowcard"><div class="sectionhead"><h3>${escape(m.title||'Equipment reference')}</h3><span class="pill">${escape(kind)}</span></div><p class="note">${escape(m.revision||'Revision not recorded')}${m.sections?' · '+escape(Array.isArray(m.sections)?m.sections.join('; '):m.sections):''}</p>${m.procedureLabel?'<p><strong>'+escape(m.procedureLabel)+'</strong></p>':''}${m.scope?'<p>'+escape(m.scope)+'</p>':''}${m.url?'<p>'+link(m.url,'Open original source')+'</p>':''}${gaps.length?'<div class="status warning"><strong>Verify before setup</strong><ul>'+gaps.map(g=>'<li>'+escape(g)+'</li>').join('')+'</ul></div>':''}${steps.length?'<ol>'+steps.map((step,i)=>{const id=checkId(t,m,i);return `<li><label class="check"><input type="checkbox" data-equipment-check="${escape(id)}" data-equipment-manual-id="${escape(m.id)}" data-equipment-step-index="${i}"${m.dsim&&!boundDsim(t,stored)?' disabled':''}${stored.checks?.[id]===true?' checked':''}>${escape(step)}</label></li>`;}).join('')+'</ol>':m.needsProcedure?'<p class="note">Choose the applicable setup method above to view its sourced steps.</p>':'<p class="note">No verified setup steps are supplied for this exact configuration.</p>'}</article>`;
 }
 function field(key,label,value){return `<label>${escape(label)}<input data-equipment-field="${key}" ${key==='pilot'?'type="number" step="any" inputmode="decimal"':'type="text"'} maxlength="${key==='pilot'?100:500}" value="${escape(value)}" placeholder="Not recorded"></label>`;}
 function pilotCodes(){return typeof DsimPilotCodes!=='undefined'&&Array.isArray(DsimPilotCodes.rows)&&typeof DsimPilotCodes.lookup==='function'?DsimPilotCodes:null;}
 function pilotMatch(p){return p.dsimModel==='DSIM-SG'?pilotCodes()?.lookup(p.pilot,p.pilotType)||null:null;}
 function pilotNote(p){
  if(p.dsimModel!=='DSIM-SG')return '';
  if(p.pilotType==='OFDM PLC')return 'OFDM PLC pilot support is not verified for DSIM-SG. A PLC reading does not establish compatibility with its QAM detector.';
  const f=String(p.pilot).trim()===''?null:Number(p.pilot),match=pilotMatch(p);
  if(match)return `${match.frequencyMHz} MHz corresponds to channel ${match.channel} ${match.signalType==='DIGITAL'?'digital':'IRC'} in the supplied historical guide. Confirm the live carrier and installed app/firmware compatibility; this is not an acceptance result.`;
  if(!['QAM','analog'].includes(p.pilotType))return 'Choose digital QAM or analog IRC to look up a listed pilot code. CW and OFDM PLC codes are not supplied by this table.';
  if(f===null)return 'Choose a listed channel or enter the approved pilot frequency in MHz.';
  if(p.pilotType==='QAM'&&(!Number.isFinite(f)||f<393||f>903))return `${p.pilot} MHz is outside the DSIM-SG guide’s documented digital centers, 393–903 MHz (channels 52–142). 303 MHz is unsupported by this table.`;
  return 'No exact pilot-frequency and signal-type match is supplied by this table. No code is generated for missing channels or unsupported frequencies.';
 }
 function pilotResult(p){
  const match=pilotMatch(p);
  if(!match)return '<p class="note">No matching code selected. The supplied pages list channels 52–94 and 100–142; channels 95–99 are absent.</p>';
  return `<p><strong>CH ${escape(match.channel)} · ${escape(match.frequencyMHz)} MHz · ${escape(match.signalType)}</strong></p><label>Historical pilot code<input type="text" data-equipment-pilot-code readonly value="${escape(match.code)}" aria-label="Historical pilot code" spellcheck="false" autocapitalize="off" autocomplete="off"></label><button type="button" data-equipment-copy-code${match.copyAllowed===false?' disabled':''}>Copy pilot code</button><p class="note">User-provided ACI iPhone / iPad Pilot Channel Code Guide · Revision A · page ${escape(match.sourcePage)} of 6. Compatibility with the installed module, app and firmware has not been tested.</p>${match.warning?'<p class="status warning">'+escape(match.warning)+'</p>':''}<p class="note" data-equipment-copy-status role="status"></p>`;
 }
 function pilotLookup(p){
  if(p.dsimModel!=='DSIM-SG')return '';
  const codes=pilotCodes(),match=pilotMatch(p),irc=p.pilotType==='analog';
  if(!codes)return '<p class="status warning">Pilot-code reference is unavailable in this build. Use the applicable original guide.</p>';
  return `<section aria-labelledby="equipmentPilotLookupHeading"><h4 id="equipmentPilotLookupHeading">Pilot code lookup</h4><p class="note">Select a channel or enter its exact frequency above. Use the code in ACI’s app only after confirming the intended pilot and compatibility.</p><label>Listed pilot channel<select data-equipment-pilot-channel>${choice('','Choose listed channel',match?.channel??'')}${codes.rows.map(row=>choice(row.channel,'CH '+row.channel+' · '+Number(irc?row.ircMHz:row.digitalMHz).toFixed(2)+' MHz '+(irc?'IRC':'digital')+(row.copyAllowed===false?' · confirm printed row':''),match?.channel??'')).join('')}</select></label><div data-equipment-code-result>${pilotResult(p)}</div></section>`;
 }
 function refreshPilotLookup(p){
  const result=document.querySelector('[data-equipment-code-result]');if(result)result.innerHTML=pilotResult(p);
  const selected=document.querySelector('[data-equipment-pilot-channel]');if(selected)selected.value=String(pilotMatch(p)?.channel??'');
 }
 async function copyPilot(event){
  const button=event.target?.closest?.('[data-equipment-copy-code]');if(!button||!button.closest('#equipmentSetupPanel')||button.disabled)return;
  const owner=own(),data=draft(),p=station(data),match=pilotMatch(p);if(!match||match.copyAllowed===false)return;
  const current=()=>own()===owner&&draft().selected===data.selected&&pilotMatch(station())?.code===match.code;
  const status=text=>{if(!current())return;const el=document.querySelector('[data-equipment-copy-status]');if(el)el.textContent=text;};
  try{
   if(typeof navigator==='undefined'||typeof navigator.clipboard?.writeText!=='function')throw Error('Clipboard unavailable');
   await navigator.clipboard.writeText(match.code);status('Pilot code copied exactly as printed.');
  }catch(_){
   if(!current())return;
   const input=document.querySelector('[data-equipment-pilot-code]');if(input){input.focus();input.select();}
   status('Copy is unavailable in this browser. The code is selected; use your device’s Copy command.');
  }
 }
 function sgManual(){return {"id":"aci-dsim-sg-H-workflow21","revision":"Rev H · 04-08-2021 · pp2, 5–11","dsim":"DSIM-SG","kind":"manual","title":"DSIM-SG · physical-controller setup","url":"https://acicomms.com/wp-content/uploads/2021/04/04.-DSIM-SG-TechManual-Rev-H-210408b.pdf","scope":"Use this Rev G/H physical-controller procedure only after matching the installed RF module, DSIM-SG and applicable procedure. Use approved job levels at identified frequencies and measurement planes.","steps":["Identify the RF module, DSIM-SG, firmware and physical controller. Record approved input/output levels, slope, pilot frequency/type and meter test-point compensation. A housing or maximum output rating does not establish the operating target.","Set S1 to manual position 2. From maximum gain, use the backoff at the documented test frequency: 3.2 dB at 547 MHz, 4.1 dB at 750 MHz or 4.6 dB at 870 MHz. These are the DSIM-SG procedure values, not OEM GainMaker backoff tables.","Select S1 position 3 and the documented 0 dB AGC pad. Establish design input/output levels and slope using the applicable station procedure.","Connect cable 240330-01 and the controller. Allow synchronization and confirm solid-blue MGC before further level adjustment.","Check full-guide temperature preparation on pp10–11. Outside the stated 40–80°F interval, record the highest-frequency output, apply the physical-controller adjustment in the table below, then restore the recorded output with the input pad. Confirm exact shared-boundary handling under the applicable procedure.","Choose the applicable 9, 18 or 27 dB upfront cable factor for thermal fallback and verify its indication using the guide. The guide cautions against thermal control for pedestal/underground stations.","Return to confirmed solid-blue MGC and verify design level/slope. Press Mode once; wait approximately 45 seconds. Confirm blinking-blue AGC and the intended pilot. Resolve an unsuccessful alignment before closeout.","Record actual mode, pilot/type, firmware and pad/EQ values. Remeasure final output and slope against approved job requirements, save meter/DSIM evidence, and complete the applicable station closure/recheck procedure. Reviewed boxes are not RF acceptance."],"gaps":["Historical Rev E pp2/10 specifies a 10 dB AGC pad for LE and 6 dB for HGD, with a different temperature preparation interval. Rev G/H specifies 0 dB. Match the installed procedure; do not combine these recipes.","Voltage conflict: the SG guide p9 gives 24 V / 21.5–26.5 V, while the DSIM data sheet Rev AB p9 gives 15 V / 14–16 V. Verify the installed module or ACI guidance before using a threshold.","The physical controller adjusts RF output; the mobile app AGC Prep changes attenuation. The mobile guide supplies no universal raw-count-to-dB recipe.","The guide failure paragraph says reduce an AGC pad by 3 dB, but the initial G/H pad is 0 dB. Do not invent a negative pad; verify the actual installed pad and pilot path with the applicable procedure."]};}
 function reviewManuals(t,p){return [...applicableManuals(t,p),...(t.gainMaker&&controlFor(p)==='dsim'&&p.dsimModel==='DSIM-SG'?[sgManual()]:[])];}
 function dsimInterfaceGuide(){return `<details><summary>Physical-controller temperature preparation · Rev G/H</summary><p class="note">Source: SG guide pp10–11. These are physical-controller RF output adjustments at the highest operating frequency, followed by input-pad restoration of the recorded output.</p><div class="tablewrap"><table><thead><tr><th>Temperature</th><th>Controller RF output change</th></tr></thead><tbody><tr><td>Below 20°F</td><td>−2 dB</td></tr><tr><td>20–40°F</td><td>−1 dB</td></tr><tr><td>40–80°F</td><td>0 dB</td></tr><tr><td>80–100°F</td><td>+1 dB</td></tr><tr><td>Above 100°F</td><td>+2 dB</td></tr></tbody></table></div><p class="note">The printed ranges share endpoints. Confirm exactly 20, 40, 80 and 100°F with the applicable procedure; no automatic boundary choice is made. One printed Celsius label is wrong: 40°F is +4.4°C.</p><p class="note">Confirm mode by indication: MGC solid blue → Mode once → alignment/AGC if successful; AGC blinking blue → Mode once → TGC; TGC → Mode once → MGC. Use the exact guide for the full LED pattern.</p></details><details><summary>Using the ACI mobile app instead</summary><p>${link(links.app,'ACI mobile app setup guide · Rev B · March 2021 · pp3, 6–7, 10–14')}</p><ol><li>Use the specified DSIM-DONGLE-02 interface and confirm the intended local module. Check installed app and module firmware.</li><li>Record serial/firmware and attenuation minimum, center, maximum and current position. Raw position values are not dB.</li><li>Use Working Mode MGC for setup. AGC Prep also returns another active mode to MGC.</li><li>AGC Prep minus decreases attenuation for cold preparation; plus increases attenuation for hot preparation. Zero returns center; MAX/MIN find the range only. The guide gives no universal number of clicks or raw-count conversion. Verify the applicable station procedure and measured effect.</li><li>Confirm the approved pilot/type/code, select AGC and wait until the process completes before closing the app. Save relevant logs and final measured levels with the job.</li></ol><p class="note">The manufacturer's linked mobile guide is from 2021. Compatibility with the installed app and module firmware remains a separate check. Do not apply the physical-controller numeric recipe directly to raw app values.</p></details>`;}
 function dsimPanel(t,p){
  if(!t.gainMaker)return '';
  return `<section class="rowcard" data-equipment-dsim-panel${controlFor(p)==='dsim'?'':' hidden'} aria-labelledby="equipmentDsimHeading"><h3 id="equipmentDsimHeading">ACI DSIM setup</h3>${hasDsim(p)&&!boundDsim(t,p)?'<p class="status warning">Retained DSIM settings are from an earlier or unbound equipment selection. Confirm the module, firmware and pilot for this equipment by editing its DSIM settings before recording reviewed steps or verification. Original data remain preserved.</p>':''}<p class="note">GainMaker housing alone does not identify the controller. Stock compatible GainMaker and ASEM 1.0 GHz can use DSIM-SG; ASEM 1.2 GHz uses DSIM-A. Check the installed RF module and part number.</p><div class="fields"><label>Installed DSIM module<select data-equipment-field="dsimModel">${choice('','Choose exact module',p.dsimModel)}${models.filter(Boolean).map(v=>choice(v,v==='other'?'Other / not identified':v,p.dsimModel)).join('')}</select></label>${field('firmware','Installed module / controller firmware',p.firmware)}<label>Pilot signal type<select data-equipment-field="pilotType">${choice('','Not recorded',p.pilotType)}${pilotTypes.filter(Boolean).map(v=>choice(v,v==='OFDM PLC'?'OFDM PLC — support unverified':v==='analog'?'Analog IRC':v,p.pilotType)).join('')}</select></label>${field('pilot','Approved pilot center (MHz)',p.pilot)}</div><p class="status warning" data-equipment-pilot-note>${escape(pilotNote(p))}</p>${pilotLookup(p)}<details><summary>Code verification and supervisor guidance</summary><p>The supplied historical pilot-code guide provides the reference values shown above. The ACI app guide p11 directs technicians to obtain the approved pilot-channel key from their manager/supervisor. Confirm the guide applies to the installed app, module and firmware before programming.</p><label>Code verification — status only<select data-equipment-field="keyStatus">${choice('','Not recorded',visibleKeyStatus(t,p))}${choice('not-supplied','Not confirmed',visibleKeyStatus(t,p))}${choice('supplied','Reference / approved code available',visibleKeyStatus(t,p))}${choice('verified','Verified against approved pilot',visibleKeyStatus(t,p))}</select></label><p class="note">Carpe Noctum includes the supplied reference table and does not request a separate private key. Displaying or copying a code does not mark it verified or establish alignment, carrier compatibility or RF acceptance.</p><p>${link(links.app,'ACI DSIM app guide · Rev B · 03-24-2021 · p11')}</p></details>${p.dsimModel==='DSIM-SG'?manualCard(sgManual(),t,p)+dsimInterfaceGuide():p.dsimModel==='DSIM-A'?'<div class="status warning">DSIM-A is a distinct module. Its exact installed setup procedure is not verified in this workflow; do not use the DSIM-SG switch or backoff directions.</div>':p.dsimModel==='other'?'<p class="status warning">Identify the exact module and obtain its applicable setup manual before making adjustments.</p>':'<p class="note">Choose the installed DSIM variant to reveal applicable setup guidance.</p>'}<p>${link(links.sg,'DSIM-SG installation guide · Rev H · 04-08-2021')}<br>${link(links.sgE,'Historical DSIM-SG guide · Rev E · pad settings differ')}<br>${link(links.data,'DSIM variant specifications · Rev AB · 08-17-2022 · pp9, 16, 19')}</p><p class="note">These are offline reference notes. Carpe Noctum does not connect to DSIM hardware. Open original online manuals when connected and confirm firmware and local procedure.</p></section>`;
 }
 function render(){
  if(typeof document==='undefined')return;
  let panel=document.getElementById('equipmentSetupPanel');
  if(!panel){const main=document.querySelector('main');if(!main)return;panel=document.createElement('section');panel.id='equipmentSetupPanel';panel.className='panel';panel.dataset.screen='equipmentSetup';panel.hidden=true;main.appendChild(panel);}
  const owner=own(),data=draft(),t=target(data),p=station(data),active=document.activeElement,renderContext=JSON.stringify([t.id,t.band,own().project?.selectedProfile||'',p.dsimModel,p.firmware,p.pilot,p.pilotType,p.dsimContext,p.gainControl,p.procedureMode,...manualFor(t.id).map(m=>[m.id,m.revision])]);
  if(lastOwner===owner&&lastTarget===data.selected&&lastContext===renderContext&&panel.contains(active)&&['INPUT','TEXTAREA'].includes(active.tagName)){
   const note=panel.querySelector('[data-equipment-pilot-note]');if(note)note.textContent=pilotNote(p);return;
  }
  const available=targets(),manuals=applicableManuals(t,p),checked=reviewManuals(t,p).filter(m=>!m.dsim||boundDsim(t,p)).flatMap(m=>(Array.isArray(m.steps)?m.steps:[]).map((_,i)=>checkId(t,m,i))).filter(id=>p.checks?.[id]===true).length;
  panel.innerHTML=`<div class="sectionhead"><div><h2>Equipment setup</h2><p class="note tight">Select the launch node, launch active or a route amplifier. Read the applicable manual before moving to sweep and measurements.</p></div></div><label>Equipment to set up<select data-equipment-target>${available.map(x=>choice(x.key,x.label,data.selected)).join('')}${t.orphan?choice(t.key,'Saved station unavailable · '+t.key,data.selected):''}</select></label><p><strong>${escape(t.label)}</strong><br><span class="note">${escape(t.band)}</span></p><p class="status warning">Reviewed steps record your actions; they are not RF acceptance. <span data-equipment-reviewed-count>${checked}</span> equipment-manual steps reviewed for this exact model, manual and band. Manufacturer limits, approved job targets and measured readings remain separate.</p>${owner.job?.training?'<p class="status warning">Training job — these notes and checks are practice records.</p>':''}${t.orphan?'<p class="status warning">This saved station is unavailable in the current route. Its existing notes and checks are retained; select current equipment to continue.</p>':''}${setupFrequencyPanel(t,p)}${gainControlPanel(t,p)}${manuals.length?(()=>{const primary=manuals.find(m=>m.kind==='manual')||manuals.find(m=>m.kind==='request')||manuals[0],extra=manuals.filter(m=>m!==primary);return manualCard(primary,t,p)+(extra.length?'<details class="extra-equipment-references"><summary>Specifications &amp; additional references ('+extra.length+')</summary>'+extra.map(m=>manualCard(m,t,p)).join('')+'</details>':'');})():'<div class="status warning"><strong>No verified setup manual for this exact equipment.</strong><p>Confirm model, variant, installed RF modules, split, firmware and local procedure. A family name or datasheet is not a substitute for an applicable setup manual.</p></div>'}${dsimPanel(t,p)}<label>Station setup notes / evidence reference<textarea data-equipment-field="notes" maxlength="8000" placeholder="Installed part number, procedure revision, actual findings and trace names. Do not enter private credentials here.">${escape(p.notes)}</textarea></label><p class="note">Notes and reviewed steps stay with this job. Removed station drafts remain in project backups. Opening original source links requires a connection.</p><p id="equipmentSetupStatus" class="note" role="status">${escape(message)}</p><div class="toolbar"><button type="button" data-task="setup">Launch settings</button><button type="button" data-task="route">Cable route</button><button type="button" class="primary" data-task="sweepSetup">Forward / return sweep</button><button type="button" data-task="readings">Record readings</button><button type="button" data-task="evidence">Attach evidence / backup</button></div>`;
  lastOwner=owner;lastTarget=data.selected;lastContext=renderContext;
 }
 function persist(data){
  try{validate(data);}catch(error){message=error.message;const el=typeof document!=='undefined'?document.getElementById('equipmentSetupStatus'):null;if(el)el.textContent=message;return false;}
  own().equipmentSetup=data;
  let saved=false;try{saved=typeof saveLocal==='function'&&saveLocal()!==false;}catch(_){}
  message=saved?'Saved setup notes on this device. Reviewed steps are not acceptance.':'Autosave failed. Changes remain in memory; export a project backup now before closing or reloading.';
  return true;
 }
 function refreshReviews(t,p){
  const manuals=reviewManuals(t,p);
  document.querySelectorAll('#equipmentSetupPanel [data-equipment-check]').forEach(el=>{const m=manuals.find(x=>x.id===el.dataset.equipmentManualId),i=Number(el.dataset.equipmentStepIndex);if(!m||!Number.isInteger(i))return;const id=checkId(t,m,i);el.dataset.equipmentCheck=id;el.checked=p.checks?.[id]===true;el.disabled=!!(m.dsim&&!boundDsim(t,p));});
  const count=document.querySelector('[data-equipment-reviewed-count]');if(count)count.textContent=manuals.filter(m=>!m.dsim||boundDsim(t,p)).flatMap(m=>(m.steps||[]).map((_,i)=>checkId(t,m,i))).filter(id=>p.checks?.[id]===true).length;
  const key=document.querySelector('[data-equipment-field="keyStatus"]');if(key)key.value=visibleKeyStatus(t,p);
 }

 function edit(event){
  const el=event.target;if(!el?.closest?.('#equipmentSetupPanel'))return;
  const data=draft();
  if(el.hasAttribute('data-equipment-pilot-channel')){
   if(event.type!=='change')return;
   const row=pilotCodes()?.rows.find(row=>String(row.channel)===el.value),p=station(data);if((!row&&el.value!=='')||p.dsimModel!=='DSIM-SG')return;
   const pilotType=row?(p.pilotType==='analog'?'analog':'QAM'):p.pilotType,pilot=row?String(pilotType==='analog'?row.ircMHz:row.digitalMHz):'',next={...p,pilot,pilotType,dsimContext:bindingContext(target(data))};
   if((pilot!==p.pilot||pilotType!==p.pilotType||!boundDsim(target(data),p))&&p.keyStatus)next.keyStatus='not-supplied';
   if(persist({...data,stations:{...data.stations,[data.selected]:next}})){lastTarget='';render();}return;
  }
  if(el.hasAttribute('data-equipment-target')){
   if(event.type!=='change'||!targets().some(t=>t.key===el.value))return;
   if(persist({...data,selected:el.value})){lastTarget='';render();}return;
  }
  const key=el.dataset.equipmentField,id=el.dataset.equipmentCheck;
  if(!key&&!id)return;
  if(el.tagName==='SELECT'&&event.type!=='change'||el.type==='checkbox'&&event.type!=='change')return;
  if(key&&!stationFields.includes(key))return;
  const selected=data.selected,p=station(data),next=key?{...p,[key]:el.value}:{...p,checks:{...p.checks,[id]:el.checked===true}};
  if(key==='gainControl'&&next.gainControl!==p.gainControl){next.procedureMode='';if(p.keyStatus)next.keyStatus='not-supplied';}
  if(key==='dsimModel'&&!p.gainControl)next.gainControl='dsim';
  if(['dsimModel','firmware','pilot','pilotType','keyStatus'].includes(key)){const t=target(data);next.dsimContext=bindingContext(t);if(key!=='keyStatus'&&(next[key]!==p[key]||!boundDsim(t,p))&&p.keyStatus)next.keyStatus='not-supplied';}
  if(persist({...data,stations:{...data.stations,[selected]:next}})){
   if(el.tagName==='SELECT'||el.type==='checkbox'){lastTarget='';render();}
   else{refreshReviews(target(data),next);refreshPilotLookup(next);const guide=document.querySelector('[data-equipment-frequency-guide]');if(guide)guide.outerHTML=setupFrequencyPanel(target(data),next);const note=document.querySelector('[data-equipment-pilot-note]');if(note)note.textContent=pilotNote(next);const status=document.getElementById('equipmentSetupStatus');if(status)status.textContent=message;}
  }
 }
 function init(){if(typeof document==='undefined')return;if(!initialized){document.addEventListener('input',edit);document.addEventListener('change',edit);document.addEventListener('click',copyPilot);initialized=true;}render();}
 return {init,render,validate,manualFor,reportSections};
})();
if(typeof globalThis!=='undefined')globalThis.EquipmentSetup=EquipmentSetup;
if(typeof module!=='undefined'&&module.exports)module.exports=EquipmentSetup;
