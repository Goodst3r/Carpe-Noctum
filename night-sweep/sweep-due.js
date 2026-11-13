/* Personal sweep reminders. Civil dates and read-only Station APIs; no work-date writes. */
const SweepDue=(()=>{
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pad=(x,n=2)=>String(x).padStart(n,'0');
 const days=(y,m)=>[31,y%4===0&&(y%100!==0||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
 function parseDate(value){
  if(typeof value!=='string')return null;const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);if(!m)return null;
  const y=Number(m[1]),month=Number(m[2]),day=Number(m[3]);return y>=1&&y<=9999&&month>=1&&month<=12&&day>=1&&day<=days(y,month)?{year:y,month,day}:null;
 }
 function addMonthsClamped(original,n){
  const d=parseDate(original);if(!d||!Number.isInteger(n)||n<0)return null;const months=(d.year-1)*12+d.month-1+n,year=Math.floor(months/12)+1,month=months%12+1;
  return year<=9999?pad(year,4)+'-'+pad(month)+'-'+pad(Math.min(d.day,days(year,month))):null;
 }
 function parseInterval(raw){
  if(raw==='')return {status:'unknown',value:null};
  if(typeof raw!=='string'||raw.length>20||!/^\d+$/.test(raw))return {status:'invalid',value:null};
  const value=Number(raw);return Number.isInteger(value)&&value>=1&&value<=1200?{status:'valid',value}:{status:'invalid',value:null};
 }
 function validate(value){
  if(value===undefined)return;
  if(!object(value)||Object.keys(value).some(k=>k!=='intervalMonths')||(value.intervalMonths!==undefined&&(typeof value.intervalMonths!=='string'||value.intervalMonths.length>20)))throw Error('Invalid sweep-due reminder preference.');
 }
 function deviceToday(now=new Date()){return pad(now.getFullYear(),4)+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());}
 function classify(last,today,interval){
  const out={status:'neutral',text:'Sweep date unknown',age:null,warning:null,due:null},event=parseDate(last),asOf=parseDate(today);
  if(!last)return out;if(!event)return {...out,text:'Invalid date — check this record'};if(!asOf)return {...out,text:'Invalid device date — classification unavailable'};
  if(last>today)return {...out,text:'Future date — check this record'};
  let age=(asOf.year-event.year)*12+asOf.month-event.month;if(today<addMonthsClamped(last,age))age--;out.age=age;
  const parsed=parseInterval(interval);if(parsed.status!=='valid')return {...out,text:'Interval '+parsed.status};
  const warning=addMonthsClamped(last,Math.ceil(2*parsed.value/3)),due=addMonthsClamped(last,parsed.value);
  if(!warning||!due)return {...out,text:'Derived date beyond year 9999 — reminder unavailable'};
  return {...out,warning,due,...(today>=due?{status:'red',text:'Due / overdue'}:today>=warning?{status:'yellow',text:'Reminder window'}:{status:'green',text:'Before reminder window'})};
 }
 function event(record,kind,today,interval,historical){
  const title=kind==='sweep'?'Sweep':'Balance',source=record?.[kind==='sweep'?'swept':'balanced']||{},date=typeof source.date==='string'?source.date:'',done=source.done===true;
  const validity=!date?'Date unknown':!parseDate(date)?'Invalid date — check this record':!parseDate(today)?'Device date unavailable':date>today?'Future date — check this record':'Valid civil date';
  let result={date,done,validity,status:'neutral',text:date?'Date entered; '+title.toLowerCase()+' not recorded':title+' not recorded; date unknown',age:null,warning:null,due:null};
  if(done){
   result={...result,...classify(date,today,interval),date,done};
   if(!date)result.text=title+' recorded; date unknown';
   else if(parseDate(date)&&parseDate(today)&&date<=today&&kind==='balance')result={...result,status:'neutral',text:'Balance recorded',warning:null,due:null};
  }
  // Preserve dates and validity text for historical worksheets; never suggest current service.
  if(historical)result={...result,status:'neutral',warning:null,due:null,text:historical+' · '+title+(done?' recorded':' not recorded')+(!date?'; date unknown':'')};
  return result;
 }
 const jobId=owner=>typeof owner?.job?.id==='string'&&owner.job.id.trim()?owner.job.id:'';
 function collect({working,snapshots=[],today='',interval=''}={}){
  const diagnostics=[],groups=[],counts={jobs:0,stations:0,work:{green:0,yellow:0,red:0,neutral:0},practice:{green:0,yellow:0,red:0,neutral:0}},list=Array.isArray(snapshots)?snapshots:[];
  if(!Array.isArray(snapshots))diagnostics.push('Saved jobs unavailable — invalid snapshot list.');
  const ids=new Map();for(const owner of list){const id=jobId(owner);if(id)ids.set(id,(ids.get(id)||0)+1);}
  const currentId=jobId(working),overlay=currentId&&ids.get(currentId)===1;const sources=list.map((owner,index)=>({owner:overlay&&jobId(owner)===currentId?working:owner,key:'saved-'+index,current:!!(overlay&&jobId(owner)===currentId)}));
  if(working&&!overlay)sources.unshift({owner:working,key:'working',current:true});
  for(const source of sources){
   const {owner,key,current}=source,id=jobId(owner),notes=[],badge=owner?.job?.training==='guided-1.5'?'SYNTHETIC TRAINING':owner?.example||owner?.job?.sample?'SAMPLE':'';
   const ambiguous=!id||ids.get(id)>1;
   if(ambiguous)notes.push(!id?'Job identity missing — kept as a separate source.':'Ambiguous job identity — repeated saved ID; current work is kept separately.');
   let name='Unnamed job',node='';try{const meta=JobsUI.metadata(owner);name=meta.name||name;node=meta.node||'';}catch(error){notes.push('Job metadata unavailable — '+error.message);}
   const group={key,id,name,node,current,badge,origin:current?'Current working job'+(overlay?' · overlays saved snapshot':''):'Saved job',diagnostics:notes,rows:[]};groups.push(group);
   try{
    if(!object(owner)||!Array.isArray(owner.rows))throw Error('Invalid route rows.');
    StationView.validate(owner.stationView);
    const targets=StationView.targets(owner),records=StationView.records(owner);
    for(const t of targets){
     const identity=typeof t.holder?.stationIdentity==='string'?t.holder.stationIdentity:'';
     const record=records.find(r=>identity&&r.identity===identity&&r.pointId===t.key&&r.equipmentId===t.id&&(r.bindingStatus==='legacy-unconfirmed'||r.equipmentContext===t.context));
     const historical=t.readOnly?'Read-only historical worksheet':record?.bindingStatus==='legacy-unconfirmed'?'Historical worksheet — binding unconfirmed':record?.readOnly?'Read-only historical worksheet':'';
     const eligible=record?.bindingStatus==='current'&&record?.readOnly===false&&!t.readOnly;
     const sweep=event(record,'sweep',today,interval,historical),balance=event(record,'balance',today,interval,historical);
     if(!eligible){sweep.status='neutral';sweep.warning=null;sweep.due=null;}
     group.rows.push({key:JSON.stringify([key,t.key,t.id,t.context,identity]),identity,pointId:t.key,equipmentId:t.id,label:t.label,split:t.split,historical,sweep,balance});
     counts.stations++;counts[badge?'practice':'work'][sweep.status]++;
    }
   }catch(error){notes.push('Station records unavailable — '+error.message);}
  }
  counts.jobs=groups.length;return {today,interval,groups,diagnostics,counts};
 }
 function readView(today=deviceToday()){
  let snapshots=[],reason='';try{snapshots=JobsUI.snapshots();}catch(error){reason='Saved jobs unavailable — '+error.message;}
  const view=collect({working:state,snapshots,today,interval:state.sweepDue?.intervalMonths??''});if(reason)view.diagnostics.unshift(reason);return view;
 }
 let initialized=false,model=null,page=0,saveResult=null,draftPending=false;const pageSize=25;
 const tag=id=>typeof Thresholds!=='undefined'?Thresholds.tag(id):'';
 function structure(){
  const panel=document.getElementById('sweepDuePanel');if(!panel)return null;if(panel.querySelector('#sweepDueInterval'))return panel;
  panel.innerHTML=`<div class="sectionhead"><h2>Sweep due</h2><button id="sweepDueRefresh" type="button">Refresh list</button></div><p>Personal sweep reminders from this device's jobs. Dates record technician work; colors are reminders, not RF acceptance.</p><p id="sweepDueAsOf" class="note"></p><div class="sweep-due-setting"><label for="sweepDueInterval">Sweep reminder interval (whole calendar months)</label>${tag('company.sweepDue.intervalMonths')}<input id="sweepDueInterval" type="text" inputmode="numeric" maxlength="20" placeholder="Unknown — enter approved interval" aria-describedby="sweepDuePreference sweepDueIntervalStatus sweepDueSaveStatus"><p id="sweepDueSaveStatus" class="status" role="status" aria-live="polite"></p><p id="sweepDueIntervalStatus" class="note" role="status"></p></div><p id="sweepDuePreference" class="note">Saved with the current working job; used for this view of all jobs.</p><p class="note">Yellow begins at two-thirds of your entered interval, rounded up to a whole calendar month. This is an unverified app reminder policy. ${tag('app.sweepDue.warningPolicy')}</p><p class="note">An older plan mentions 18 months; its attribution to Hranac is unverified. Confirm your company's interval. ${tag('app.sweepDue.olderIntervalReference')}</p><details><summary>Calendar and input policy</summary><p class="note">Whole calendar months from the original work date, clamped to the target month's last day; dates use years 0001–9999. ${tag('app.sweepDue.calendarPolicy')} Enter 1–1200 months; this is an app input guard. ${tag('app.sweepDue.intervalRange')} Balance is displayed independently and never resets sweep age. At very short intervals the reminder window can coincide with due; Due / overdue wins.</p></details><div id="sweepDueDiagnostics" role="status"></div><p id="sweepDueSummary" class="note" aria-live="polite"></p><h3 id="sweepDuePageSummary" tabindex="-1" hidden></h3><div id="sweepDueList"></div><div id="sweepDuePagination" class="toolbar sweep-due-pages"></div>`;
  return panel;
 }
 function eventMarkup(title,value){return `<div class="sweep-due-event"><h4>Last recorded ${title.toLowerCase()}</h4><p class="sweep-due-date">${escape(value.date||'Unknown — no date')}</p><p>${escape(value.text)}</p><p class="note">${escape(value.validity)}</p>${value.age!==null?`<p class="note">${value.age} completed calendar month${value.age===1?'':'s'} old</p>`:''}</div>`;}
 function renderList(){
  if(!model)return;const panel=structure();if(!panel)return;
  const entries=model.groups.flatMap(g=>g.rows.length?g.rows.map(r=>({g,r})):[{g,r:null}]),pages=Math.max(1,Math.ceil(entries.length/pageSize));page=Math.min(page,pages-1);
  const start=page*pageSize,shown=entries.slice(start,start+pageSize),container=document.getElementById('sweepDueList');
  let last='';container.innerHTML=shown.map(({g,r})=>{const header=g.key!==last;last=g.key;return `${header?`<div class="sweep-due-job"><h3>${escape(g.name)}</h3><p>${escape(g.origin)}${g.badge?' · <strong>'+g.badge+'</strong>':''}</p><p class="note">Job ID: ${escape(g.id||'Unknown')} · ${escape(g.node||'No node / asset')}</p>${g.diagnostics.map(s=>'<p class="status warning">'+escape(s)+'</p>').join('')}</div>`:''}${r?`<article class="sweep-due-row" data-sweep-due-row><h4>${escape(r.label)}</h4><p class="note">${r.pointId==='source'?'Launch station':'Route point '+escape(r.pointId)} · ${escape(r.equipmentId)}${r.split?' · '+r.split+'/'+(r.split==='42'?'54':'258')+' MHz':''}</p>${r.historical?'<p class="status warning">'+escape(r.historical)+'</p>':''}<p class="sweep-due-badge sweep-due-${r.sweep.status}">${r.sweep.status==='green'?'● ':r.sweep.status==='yellow'?'▲ ':r.sweep.status==='red'?'! ':''}${escape(r.sweep.status==='neutral'?'Reminder unavailable':r.sweep.text)}</p><div class="sweep-due-events">${eventMarkup('Sweep',r.sweep)}${eventMarkup('Balance',r.balance)}</div><p class="note">Chosen sweep due date: <strong>${escape(r.sweep.due||'Unavailable')}</strong>${r.sweep.warning?' · Reminder begins '+escape(r.sweep.warning):''}</p></article>`:'<p class="note">No installed launch node / active or route amplifiers readable in this source.</p>'}`;}).join('')||'<p>No saved stations yet.</p><div class="toolbar"><button type="button" data-task="station">Open Field → Station</button><button type="button" data-task="projects">Open Plan → Details</button></div>';
  if(!model.counts.stations)container.insertAdjacentHTML('beforeend','<p class="note">The interval belongs to the open job. Opening another job can show a different interval or Unknown.</p><div class="toolbar"><button type="button" data-task="station">Open Field → Station</button><button type="button" data-task="projects">Open Plan → Details</button></div>');
  const summary=document.getElementById('sweepDuePageSummary');summary.hidden=entries.length<=pageSize;summary.textContent=`Page ${page+1} of ${pages} · entries ${start+1}–${start+shown.length} of ${entries.length}`;
  document.getElementById('sweepDuePagination').innerHTML=entries.length>pageSize?`<button type="button" data-sweep-due-page="previous"${page===0?' disabled':''}>← Previous</button><span>Page ${page+1} of ${pages} · entries ${start+1}–${start+shown.length} of ${entries.length}</span><button type="button" data-sweep-due-page="next"${page===pages-1?' disabled':''}>Next →</button>`:'';
 }
 function showDraft(){
  const interval=state.sweepDue?.intervalMonths??'',parsed=parseInterval(interval);
  document.getElementById('sweepDueIntervalStatus').textContent=parsed.status==='valid'?'Entered interval: '+parsed.value+' whole calendar months.':'Interval '+parsed.status+(parsed.status==='invalid'?' — enter digits only, from 1 to 1200.':'.');
  const notice=document.getElementById('sweepDueSaveStatus');notice.textContent=saveResult?(saveResult.saved?'Reminder preference saved on this device.':'Not saved. Autosave failed. Export a project backup before closing.'):'';notice.classList.toggle('warning',saveResult?.saved===false);
  document.getElementById('sweepDueSummary').textContent='Results are stale. Commit the interval or refresh the list to update reminders.';
  document.getElementById('sweepDueList').innerHTML='';document.getElementById('sweepDuePagination').innerHTML='';document.getElementById('sweepDueDiagnostics').innerHTML='';document.getElementById('sweepDuePageSummary').hidden=true;
 }
 function render(today=deviceToday()){
  const panel=structure();if(!panel)return;model=readView(today);page=0;draftPending=false;
  const input=document.getElementById('sweepDueInterval');if(document.activeElement!==input)input.value=model.interval;
  document.getElementById('sweepDueAsOf').textContent='As of '+model.today+' (device date)';const parsed=parseInterval(model.interval);
  document.getElementById('sweepDueIntervalStatus').textContent=parsed.status==='valid'?'Entered interval: '+parsed.value+' whole calendar months.':'Interval '+parsed.status+(parsed.status==='invalid'?' — enter digits only, from 1 to 1200.':'.');
  if(saveResult&&(saveResult.owner!==state||saveResult.interval!==model.interval))saveResult=null;
  const notice=document.getElementById('sweepDueSaveStatus');notice.textContent=saveResult?(saveResult.saved?'Reminder preference saved on this device.':'Not saved. Autosave failed. Export a project backup before closing.'):'';notice.classList.toggle('warning',saveResult?.saved===false);
  document.getElementById('sweepDueDiagnostics').innerHTML=model.diagnostics.map(s=>'<p class="status warning">'+escape(s)+'</p>').join('');
  const c=model.counts;document.getElementById('sweepDueSummary').textContent=c.jobs+' job sources · '+c.stations+' stations. Work reminders: '+c.work.green+' before window, '+c.work.yellow+' in window, '+c.work.red+' due / overdue, '+c.work.neutral+' unavailable. Practice / sample reminders: '+c.practice.green+' before window, '+c.practice.yellow+' in window, '+c.practice.red+' due / overdue, '+c.practice.neutral+' unavailable. Synthetic and sample data remain practice after editing, duplication and restore.';
  renderList();
 }
 function init(){
  if(initialized)return;initialized=true;
  document.addEventListener('input',e=>{if(e.target.id!=='sweepDueInterval')return;state.sweepDue={intervalMonths:e.target.value.slice(0,20)};const saved=typeof saveLocal==='function'&&saveLocal()!==false;saveResult={owner:state,interval:state.sweepDue.intervalMonths,saved};draftPending=true;showDraft();});
  document.addEventListener('change',e=>{if(e.target.id==='sweepDueInterval'&&draftPending)render();});
  document.addEventListener('keydown',e=>{if(e.target.id==='sweepDueInterval'&&e.key==='Enter'){e.preventDefault();render();}});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='sweepDueRefresh')render();if(b.dataset.sweepDuePage){page+=b.dataset.sweepDuePage==='next'?1:-1;renderList();const summary=document.getElementById('sweepDuePageSummary');summary?.focus({preventScroll:true});summary?.scrollIntoView({block:'start'});}});
  const resume=()=>{if(!document.getElementById('sweepDuePanel')?.hidden&&document.visibilityState!=='hidden')render();};window.addEventListener('pageshow',resume);window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);
 }
 return {parseDate,addMonthsClamped,parseInterval,validate,deviceToday,classify,collect,readView,render,init};
})();
