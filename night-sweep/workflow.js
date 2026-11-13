/* 1.5 task navigation. Reuses live controls and schema-one data; no calculation changes. */
const WorkflowUI=(()=>{
 const groups={
  home:{label:'Home',tabs:[['home','Home'],['outage','Outage']]},
  plan:{label:'Plan',list:true,sections:[{title:'Plan',items:[['projects','Details'],['setup','Setup'],['route','Route & sweep'],['equipmentSetup','Amp / node setup'],['sweep','Predicted levels'],['power','Load'],['trial','What-if'],['powerPm','Supply PM'],['sweepDue','Sweep due']]}]},
  field:{label:'Field',list:true,sections:[{title:'Field',items:[['sweepSetup','Meter setup'],['station','Station records'],['tdr','TDR'],['evidence','ONX files'],['leakage','Leakage'],['checklists','Checklists'],['nightLog','Night log']]}]},
  tools:{label:'Tools',list:true,sections:[
   {title:'Calculators',items:[['calculators','Calculators'],['frequency','Frequency']]},
   {title:'Limits and sources',items:[['limits','Limits'],['references','References'],['parts','Catalog']]},
   {title:'Cards',items:[['docsisHealth','DOCSIS health'],['impairments','Impairments'],['fiber','Fiber'],['highSplit','High split'],['why','Why cards'],['pop','Proof of performance']]},
   {title:'Learn',items:[['study','Study']]}
  ]},
  closeout:{label:'Closeout',tabs:[['records','Acceptance'],['runsheet','Run sheet']]}
 };
 for(const spec of Object.values(groups))if(!spec.tabs)spec.tabs=spec.sections.flatMap(section=>section.items);
 const screens={
  nightLog:['field','Night log and shift handoff','Keep personal window notes and explicitly capture both saved Station stages for the next shift.'],
  sweepDue:['plan','Review personal sweep reminders','Read saved Station sweep and balance dates across this device’s jobs. Enter your own reminder interval.'],
  station:['field','Record station balance and sweep','Choose an installed node or amplifier. Save forward and return measurements, then record balance and sweep separately.'],
  home:['home','Choose your task','Start with a field task, or continue the working job below.'],
  setup:['plan','Set the starting signal','Enter launch frequencies, levels and cable temperature before building your route.'],
  route:['plan','Route & sweep','Follow the launch and branches, then record readings at each station.'],
  gain:['plan','Check amplifier gain','Choose an active on your route, enter its gain, then review both frequency margins.'],
  equipmentSetup:['plan','Set up the installed equipment','Choose the launch or a route active, review its exact manual and save setup notes.'],
  parts:['tools','Equipment catalog','Search by model or part number, then review its published gain or loss data.'],
  tdr:['field','Locate a TDR distance','Use the route you built to place a one-way meter distance on the correct span.'],
  sweepSetup:['field','Set up the meter','Follow your 42/54 or 204/258 MHz procedure, save settings and record each step.'],
  sweep:['plan','View predicted levels','Expected levels along the route. Calculated from your inputs, not a meter trace.'],
  frequency:['tools','Check one cable / passive path','Calculate a separate path at a chosen frequency. This does not add points to the RF route.'],
  readings:['field','Compare meter readings','Choose a route point, enter your measurement and compare it with the predicted output.'],
  references:['tools','Use a field reference','Look up cable loss and tap faces, or apply an editable frequency / target reference.'],
  calculators:['tools','Run a quick calculation','dB units, ripple and pre-EQ distance, OFDM power and echo delay. Each formula shows its source.'],
  fiber:['tools','Fiber color code and loss budget','Find a fiber by number, tube and color, and estimate a link\'s loss from length, connectors and splices. Nothing is read from a meter.'],
  study:['tools','Study mode: practice questions','Original practice questions made from this app\'s calculators and reference screens, grouped by four SCTE BDS domains, with working shown. Practice only: a score is kept for this visit and nothing is saved.'],
  pop:['tools','FCC proof of performance','The FCC technical limits and test rules an operator\'s proof-of-performance tests are measured against, with their rule sections. A reference only: official results belong to engineering. Nothing is typed, stored or read from a meter.'],
  why:['tools','Why cards: the basics in plain words','Fourteen short cards on the basics behind the numbers in this app, one for each SCTE 293 "What is …?" monograph, each linking to the screen that uses it. A summary, not a copy. Nothing is typed, stored or read from a meter.'],
  highSplit:['tools','High split and Remote PHY','Band plans for the 204/258 MHz plant, where the aeronautical band falls, and what is public about Remote PHY bring-up. Each statement names its document and issue. A reading aid: nothing is read from a node or stored.'],
  impairments:['tools','Find the impairment','Pick what the meter shows and read its card: what it looks like, what usually causes it and five steps. Your own aid, not your company\'s procedure.'],
  leakage:['field','Check and log signal leakage','FCC limits, distance and CLI math, a detector check and your own leak log. A personal notebook, not the company record.'],
  docsisHealth:['tools','Check DOCSIS levels','Compare a modem or meter reading with the DOCSIS requirements and your own window. Nothing is read from a modem.'],
  limits:['tools','Check a limit or its source','Limits, targets and formulas behind the field tools and job criteria, labeled spec, expert, company or unknown.'],
  power:['plan','Check the power load','Build the actual power circuit and review supply draw and equipment voltage.'],
  powerPm:['plan','Record a supply PM check','Record what you saw at a standby supply and estimate span voltage drop from the cable catalog. A notebook on this device, not the company record and not part of the job.'],
  trial:['plan','Try an added power load','Test extra cable and current before adding it to the power circuit.'],
  projects:['plan','Manage this job','Name the job and record its node. It saves to the job list on this device as you work.'],
  evidence:['field','Attach meter files','Keep original meter files and grade eligible sweeps against explicitly entered company criteria.'],
  outage:['home','Respond to an outage','First-response prompts: scope, power, node, actives in order, who to tell and the times. Not your company’s procedure; follow it first.'],
  checklists:['field','Record field work','Track inspections and repair notes. Checkmarks do not establish RF acceptance.'],
  records:['closeout','Measurements and acceptance','Advanced job records: enter actual measurements and verified plant criteria.'],
  runsheet:['closeout','Review and share the run sheet','Review predictions, measurements and field notes before printing or exporting.'],
  help:['home','Quick help','Pick a common task, learn the terms and review calculation limits.']
 };
 const pointDetailState=new Map();
 let printVisibility=null;
 let ready=false,current='home',point='',activePoint='',lastGroup={plan:'route',field:'sweepSetup',tools:'calculators',closeout:'records'},applying=false,queued=false,rendering=0,refreshing=0,calculationCache=null;
 function calculationBatch(action){
  if(calculationCache)return action();
  calculationCache=new Map();
  try{return action();}finally{calculationCache=null;}
 }
 const hidden=(el,value)=>{if(el&&el.hidden!==value)el.hidden=value;};
 const text=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};
 const all=selector=>[...document.querySelectorAll(selector)];
 const visibleIds={sweepDue:['sweepDuePanel'],nightLog:['nightLogPanel'],station:['stationPanel'],equipmentSetup:['equipmentSetupPanel'],sweepSetup:['sweepSetupPanel'],home:['homePanel'],setup:['setup'],route:['setup','routePanel'],gain:['routePanel'],parts:['catalogPanel'],tdr:['tdrPanel'],sweep:['sweepPanel','levelsPanel'],frequency:['frequencyPanel'],readings:['routePanel'],references:['fieldReferencePanel'],calculators:['calculatorPanel'],limits:['limitsPanel'],docsisHealth:['docsisHealthPanel'],leakage:['leakagePanel'],impairments:['impairmentsPanel'],fiber:['fiberPanel'],highSplit:['highSplitPanel'],why:['whyPanel'],pop:['popPanel'],study:['studyPanel'],powerPm:['powerPmPanel'],power:['powerPanel'],trial:['powerPanel'],projects:['jobsPanel','projectPanel'],evidence:['projectPanel'],checklists:['fieldWorkPanel'],outage:['outagePanel'],records:['projectPanel'],runsheet:['runSheetPanel']};
 function selectedRows(){return current==='gain'?state.rows.filter(r=>device(r.device)?.active):state.rows;}
 function chosen(){const rows=selectedRows(),wanted=current==='gain'?activePoint:point;return rows.find(r=>r.id===wanted)||rows[0]||null;}
 function setPoint(id){if(!state.rows.some(r=>r.id===id))return false;point=id;if(device(state.rows.find(r=>r.id===id).device)?.active)activePoint=id;apply();return true;}
 function tabButton([id,label]){return `<button type="button" role="tab" id="task-tab-${id}" data-task="${id}" aria-selected="${id===current}" tabindex="${id===current?'0':'-1'}" aria-controls="${(visibleIds[id]||[]).join(' ')||'helpPanel'}">${label}</button>`;}
 function syncListEntry(){
  // One visible result stays in the tab order when the selected screen is filtered out.
  const buttons=all('#taskTabs [data-task]'),visible=buttons.filter(el=>!el.hidden),entry=visible.find(el=>el.dataset.task===current)||visible[0]||null;
  buttons.forEach(el=>{el.tabIndex=el===entry?0:-1;});
 }
 function renderNav(){
  const group=screens[current][0],spec=groups[group],host=$('taskTabs');
  hidden(host,current==='help'||!spec.tabs.length);
  host.classList.toggle('is-list',!!spec.list);
  if(spec.list)host.innerHTML=`<label class="task-search">Search screens<input type="search" data-task-search placeholder="Type a screen name" aria-label="Search ${spec.label} screens"></label>`+spec.sections.map(section=>`<section class="task-list-section"><h3>${section.title}</h3>${section.items.map(tabButton).join('')}</section>`).join('')+'<p class="note task-search-empty" hidden>No matching screen.</p>';
  else host.innerHTML=spec.tabs.map(tabButton).join('');
  syncListEntry();
  all('[data-main-tab]').forEach(b=>{const active=b.dataset.mainTab===group;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('screenTitle').innerHTML=`<span class="eyebrow">${spec.label}</span><h2 tabindex="-1">${screens[current][1]}</h2><p>${screens[current][2]}</p>`;
  document.body.dataset.task=current;
 }
 function go(tab,options={}){
  const aliases={job:'projects',test:'sweepSetup',equipment:'parts',help:'help'};
  if(groups[tab]&&!screens[tab])tab=lastGroup[tab]||groups[tab].tabs[0][0];
  tab=aliases[tab]||tab;
  if(!screens[tab])tab='home';current=tab;const group=screens[tab][0];if(group!=='home')lastGroup[group]=tab;
  if(tab==='setup')renderSetup();
  if(tab==='nightLog'&&typeof NightLog!=='undefined')NightLog.render(true);
  if(tab==='sweepDue'&&typeof SweepDue!=='undefined')SweepDue.render();
  if(tab==='station'&&typeof StationView!=='undefined')StationView.render(true);
  if(tab==='equipmentSetup'&&typeof EquipmentSetup!=='undefined')EquipmentSetup.render();
  if(tab==='runsheet'&&typeof FieldReport!=='undefined')FieldReport.renderSheet();
  if(tab==='limits'&&typeof Thresholds!=='undefined')Thresholds.renderLimits();
  if(tab==='docsisHealth'&&typeof DocsisHealthUI!=='undefined')DocsisHealthUI.refresh();
  if(tab==='impairments'&&typeof ImpairmentsUI!=='undefined')ImpairmentsUI.updateRipple();
  if(tab==='frequency'&&typeof renderFrequency==='function'){renderFrequency();const main=$('frequencyPanel')?.querySelector('details');if(main)main.open=true;}
  renderNav();apply();
  document.querySelector('.filemenu').open=false;
  if(options.scroll!==false)window.scrollTo({top:0,behavior:'instant'});
  if(tab==='sweep')requestAnimationFrame(drawChart);
  return tab;
 }
 function capturePointDetails(){all('#route > [data-row]').forEach(card=>{pointDetailState.set(card.dataset.row,[...card.querySelectorAll('details')].map(d=>[d.querySelector(':scope > summary')?.textContent?.trim()||'',d.open]));});}
 function structural(){
  // Optional tools remain under the original route event-delegation ancestor.
  all('#route [data-row]').forEach(card=>{
   const box=card.querySelector('.route-toolbox');
   if(box&&!box.parentElement.classList.contains('point-extras')){
    const details=document.createElement('details');details.className='point-extras';details.innerHTML='<summary>More at this point <span>Tap faces · drop · map note · arithmetic</span></summary>';
    box.before(details);details.append(box);
   }
   const active=card.querySelector('.active-editor');
   if(active&&!active.querySelector('.published-gain-details')){
    const start=active.querySelector('.gain-reference');
    if(start){const details=document.createElement('details');details.className='published-gain-details';details.innerHTML='<summary>Published gain reference and conditions</summary>';start.before(details);let node=start;while(node&&!node.classList.contains('active-fields')){const next=node.nextElementSibling;details.append(node);node=next;}}
   }
   const saved=new Map(pointDetailState.get(card.dataset.row)||[]);card.querySelectorAll('details').forEach(d=>{if(d.dataset.workflowRestored)return;d.dataset.workflowRestored='true';const key=d.querySelector(':scope > summary')?.textContent?.trim()||'';if(saved.has(key))d.open=saved.get(key);});
   if(!card.querySelector('.point-task-links')){
    const div=document.createElement('div');div.className='point-task-links';div.innerHTML=`${active?`<button type="button" data-equipment-target="${card.dataset.row}">Setup &amp; manual</button>`:''}`;card.querySelector('.route-math')?.after(div);
   }
  });
 }
 function updatePointControls(){
  const picker=$('pointSelect'),rows=selectedRows(),row=chosen();
  if(row){if(current==='gain')activePoint=row.id;else point=row.id;}
  const signature=JSON.stringify([current,rows.map(r=>[r.id,r.name,r.device]),row?.id]);
  if(picker.dataset.signature!==signature){picker.dataset.signature=signature;picker.innerHTML=rows.map(r=>option(r.id,`${state.rows.indexOf(r)+1}. ${name(r,state.rows.indexOf(r))} · ${device(r.device)?.active?'Active':partTypeLabel(device(r.device))}`,row?.id)).join('')||option('',current==='gain'?'No active equipment on this route':'No route points yet','');}
  picker.disabled=!rows.length;const index=rows.indexOf(row);$('pointPrevious').disabled=index<=0;$('pointNext').disabled=index<0||index>=rows.length-1;
  text($('pointCount'),rows.length?`${index+1} of ${rows.length}${current==='gain'?' active points':' points'}`:'');
  hidden($('pointPicker'),!state.rows.length&&current!=='gain');
  all('#route > [data-row]').forEach(card=>hidden(card,current!=='route'&&card.dataset.row!==row?.id));
  hidden($('pointEmpty'),!!rows.length);text($('pointEmptyText'),current==='gain'?'Add an amplifier to the cable route, then select it here to check the gain budget.':'Add your first cable span and equipment point to get started.');
  text($('routePanelTitle'),current==='gain'?'Selected amplifier':current==='readings'?'Selected measurement point':'Cable route');
  const feeds=new Set(['source']),broken=[];
  for(const row of state.rows){if(!feeds.has(row.parent))broken.push(row);for(const port of HFC.portsFor(device(row.device),row))feeds.add(row.id+'::'+port.id);}
  const warning=$('routeFeedWarning');if(warning){hidden(warning,!broken.length);const html=broken.length?`<strong>${broken.length} disconnected feed${broken.length===1?'':'s'}</strong><p>Removing equipment or changing its output keeps downstream points for review. Choose the actual upstream port for ${broken.map((r,i)=>esc(name(r,state.rows.indexOf(r)))).join(', ')}.</p><button type="button" data-point-task="route" data-point="${esc(broken[0].id)}">Review first disconnected feed</button>`:'';if(warning.dataset.signature!==html){warning.dataset.signature=html;warning.innerHTML=html;}}
  text($('routePanelHint'),current==='gain'?'Enter gain and output targets for this installed configuration.':current==='readings'?'Record the reading at the selected output port.':'Choose a point above to edit its incoming cable, feed and equipment.');
  if(row&&current==='readings'){const meter=$('route').querySelector(`[data-row="${row.id}"] .point-meters`);if(meter)meter.open=true;}
 }
 function updateJobViews(){
  const panel=$('projectPanel');if(!panel)return;
  [...panel.children].forEach(child=>{
   let show=false;
   if(current==='projects')show=child.id==='nodePanel';
   if(current==='evidence')show=child.id==='evidencePanel';
   if(current==='records')show=child.id!=='nodePanel'&&child.id!=='evidencePanel';
   hidden(child,!show);
  });
  if(current==='evidence'&&$('evidencePanel'))$('evidencePanel').open=true;
  if(current==='projects'&&$('nodePanel'))$('nodePanel').open=true;
 }
 function updateHome(){
  const m=typeof JobsUI!=='undefined'?JobsUI.metadata():{},d=HFC.routeDistances(state,catalog),values=d.rows.map(r=>r.end).filter(Number.isFinite),distance=values.length?Math.max(...values):0;
  text($('workingJobName'),m.name||'Unnamed working job');
  text($('workingJobMeta'),`${m.node||'No node / asset'} · ${state.rows.length} route points · ${(state.evidence||[]).length} files`);
  text($('homeRouteDistance'),d.errors.length?'—':ft(distance)+' ft');
  hidden($('homeRouteWarning'),!d.errors.length);text($('homeRouteWarning'),d.errors.length?`${d.errors.length} route point(s) have missing length or feed data. Open Cable route to correct them before using distance results.`:'');
  text($('homeActiveCount'),String(state.rows.filter(r=>device(r.device)?.active).length));
  hidden($('workingSample'),!state.example);
  hidden($('homeGainTip'),state.rows.some(r=>device(r.device)?.active));
 }
 function updateContextStrip(){
  const strip=$('contextStrip');if(!strip)return;
  const tools=screens[current]?.[0]==='tools';
  hidden(strip,tools);
  if(tools)return;
  const name=typeof JobsUI!=='undefined'?JobsUI.metadata().name:'';
  text(strip.querySelector('[data-context="job"]'),name||'Unnamed working job');
  const plant=state.sweepSetup&&state.sweepSetup.selected;
  text(strip.querySelector('[data-context="plant"]'),plant==='42'?'42/54 GS7K / GainMaker':plant==='204'?'204/258 Vecima / AOI':'Plant unknown');
  const pointEl=strip.querySelector('[data-context="point"]');
  const planeEl=strip.querySelector('[data-context="plane"]');
  if(current==='station'&&typeof StationView!=='undefined'&&typeof StationView.currentTarget==='function'){
   let label='',plane='';
   try{
    label=String(StationView.currentTarget(state)?.label||'').trim();
    plane=String(StationView.currentStage(state)?.forward?.plane||'').trim();
   }catch(e){label='';plane='';}
   text(pointEl,label||'No station selected');
   text(planeEl,plane?('Plane: '+plane):'Measurement plane unknown');
   hidden(planeEl,false);
  }else{
   const row=chosen();
   text(pointEl,row?(row.name||'Unnamed point'):'No point selected');
   text(planeEl,'');hidden(planeEl,true);
  }
 }
 function apply(){
  if(!ready||applying||rendering||printVisibility||typeof document==='undefined'||!document?.documentElement)return;applying=true;
  try{
   structural();const ids=new Set(visibleIds[current]||[]);
   all('[data-screen]').forEach(el=>hidden(el,current==='help'?el.dataset.screen!=='help':!ids.has(el.id)));
   // Renderers preserve their original parent; subtask visibility is reapplied after each edit.
   if(['route','gain','readings'].includes(current))updatePointControls();
   updateJobViews();
   const power=$('powerPanel');if(power){[...power.children].forEach(child=>hidden(child,current==='trial'?child.id!=='powerWhatIf':child.id==='powerWhatIf'));if(current==='trial'&&$('powerWhatIf'))$('powerWhatIf').open=true;}
   updateHome();
   updateContextStrip();
  }finally{applying=false;}
 }
 function queue(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply();});}
 function prepareVisibilityForPrint(){if(printVisibility||document.body.classList.contains('print-runsheet'))return;printVisibility=all('#projectPanel > *,#powerPanel > *').map(el=>({el,hidden:el.hidden}));printVisibility.forEach(x=>hidden(x.el,false));}
 function restoreVisibilityAfterPrint(){if(!printVisibility)return;const saved=printVisibility;printVisibility=null;saved.forEach(x=>hidden(x.el,x.hidden));apply();}
 function init(){
  if(ready)return;ready=true;
  // Preserve every existing calculation and event binding; only navigation and control density change.
  // Cache only during one synchronous render/refresh. Input changes, imports and
  // failed renders always begin with fresh values, including meter TP correction.
  const originalEvaluate=evaluate;evaluate=function(frequency){
   if(!calculationCache)return originalEvaluate(frequency);
   let values=calculationCache.get(state);if(!values){values=new Map();calculationCache.set(state,values);}
   if(!values.has(frequency))values.set(frequency,originalEvaluate(frequency));return values.get(frequency);
  };
  const originalDraw=drawChart;drawChart=function(...args){
   // The hidden sweep has no visible output to repaint while another task edits
   // the route. Navigation and print call drawChart directly with current data.
   if(refreshing&&$('sweepPanel')?.hidden)return;
   return calculationBatch(()=>originalDraw(...args));
  };
  const originalRender=renderAll;renderAll=function(...args){return calculationBatch(()=>{
   capturePointDetails();rendering++;let completed=false;
   try{const r=originalRender(...args);completed=true;return r;}finally{rendering--;if(completed)apply();}
  });};
  const originalRefresh=refreshResults;refreshResults=function(...args){return calculationBatch(()=>{
   refreshing++;try{const r=originalRefresh(...args);apply();return r;}finally{refreshing--;}
  });};
  const originalProject=renderProjects;renderProjects=function(...args){const r=originalProject(...args);apply();return r;};
  const originalMeters=renderMeters;renderMeters=function(...args){const r=originalMeters(...args);apply();return r;};
  const originalMeterResults=renderMeterResults;renderMeterResults=function(...args){return calculationBatch(()=>originalMeterResults(...args));};
  const originalPower=renderPower;renderPower=function(...args){const r=originalPower(...args);apply();return r;};
  showTab=go;window.NightSweep.showTab=go;
  const oldPrepare=window.NightSweep.preparePrint,oldRestore=window.NightSweep.restorePrint;window.NightSweep.preparePrint=()=>{oldPrepare?.();prepareVisibilityForPrint();};window.NightSweep.restorePrint=()=>{oldRestore?.();restoreVisibilityAfterPrint();};window.addEventListener('beforeprint',prepareVisibilityForPrint);window.addEventListener('afterprint',restoreVisibilityAfterPrint);
  all('[data-main-tab]').forEach(b=>b.onclick=()=>go(b.dataset.mainTab==='home'?'home':lastGroup[b.dataset.mainTab]));
  $('helpButton').onclick=()=>go('help');
  const add=$('add'),oldAdd=add.onclick;add.onclick=()=>{const before=state.rows.length;oldAdd();if(state.rows.length>before)point=state.rows.at(-1).id;go('route',{scroll:false});};
  const same=$('sameSpanNext'),oldSame=same?.onclick;if(same)same.onclick=()=>{const before=state.rows.length;oldSame();if(state.rows.length>before)point=state.rows.at(-1).id;go('route',{scroll:false});};
  const routePanel=$('routePanel');
  const cascade=$('cascadeStrip');if(cascade){cascade.tabIndex=0;cascade.setAttribute('role','region');cascade.setAttribute('aria-label','Route cascade. Scroll sideways or down to view branches.');}
  const cascadeHint=document.querySelector('.cascade-heading p');if(cascadeHint)cascadeHint.textContent='Scroll sideways or down to view branches. Tap a point to open its card. Arrows show the actual feed; a bad parent stays disconnected.';
  const feedWarning=document.createElement('div');feedWarning.id='routeFeedWarning';feedWarning.className='status warning';feedWarning.hidden=true;$('pointPicker').before(feedWarning);
  const next=document.createElement('div');next.className='workflow-next toolbar';next.innerHTML='<button type="button" data-task="equipmentSetup">Next: equipment setup →</button><button type="button" data-task="sweepSetup">Forward / return setup</button><button type="button" data-task="evidence">Attach meter files</button>';routePanel.append(next);routePanel.addEventListener('click',event=>{const b=event.target.closest('[data-cascade-open]');if(!b)return;if(b.dataset.cascadeOpen==='source')go('setup');else setPoint(b.dataset.cascadeOpen);},true);
  document.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b)return;
   if(b.dataset.task){const fromTab=b.getAttribute('role')==='tab',id=b.dataset.task;go(id);if(fromTab)$('task-tab-'+id)?.focus();}
   if(b.dataset.pointTask){setPoint(b.dataset.point);go(b.dataset.pointTask);}
   if(b.id==='pointPrevious'||b.id==='pointNext'){const rows=selectedRows(),index=rows.indexOf(chosen());const row=rows[index+(b.id==='pointNext'?1:-1)];if(row)setPoint(row.id);}
   if(b.id==='homeNewJob')Promise.resolve(JobsUI.newJob()).then(changed=>{if(changed)go('projects');}).catch(e=>{$('message').textContent=e.message;});
   if(b.id==='homeBackup'||b.id==='jobExportShortcut')$('save').click();
   if(b.id==='homeOpenJob'||b.id==='jobImportShortcut')$('load').click();
   queue();
  });
  $('pointSelect').addEventListener('change',event=>setPoint(event.target.value));
  $('taskTabs').addEventListener('keydown',event=>{
   const box=event.target.closest('[data-task-search]');
   if(box){
    if(!['ArrowDown','ArrowUp','Enter'].includes(event.key))return;
    const visible=all('#taskTabs [data-task]').filter(el=>!el.hidden);if(!visible.length)return;
    event.preventDefault();
    (event.key==='ArrowUp'?visible.at(-1):visible.find(el=>el.tabIndex===0)||visible[0]).focus();
    return;
   }
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=all('#taskTabs [data-task]').filter(el=>!el.hidden),index=tabs.indexOf(document.activeElement);if(index<0)return;event.preventDefault();const at=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;const id=tabs[at].dataset.task;go(id,{scroll:false});$('task-tab-'+id)?.focus();
  });
  $('taskTabs').addEventListener('input',event=>{
   const box=event.target.closest('[data-task-search]');if(!box)return;
   const q=box.value.trim().toLowerCase();
   all('#taskTabs [data-task]').forEach(button=>hidden(button,!!q&&!button.textContent.toLowerCase().includes(q)));
   all('#taskTabs .task-list-section').forEach(section=>hidden(section,![...section.querySelectorAll('[data-task]')].some(button=>!button.hidden)));
   const empty=$('taskTabs').querySelector('.task-search-empty');hidden(empty,!q||all('#taskTabs [data-task]').some(button=>!button.hidden));
   syncListEntry();
  });
  document.addEventListener('input',queue);document.addEventListener('change',queue);
  if(typeof MutationObserver!=='undefined')new MutationObserver(queue).observe(document.querySelector('main'),{childList:true,subtree:true});
  go('home',{scroll:false});
 }
 return {init,go,current:()=>current,selectPoint:setPoint,apply,groups,screens};
})();
function initWorkflow(){WorkflowUI.init();}
