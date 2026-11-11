/* Browser-local named jobs. Evidence originals remain in the existing verified file store. */
const JobsUI=(()=>{
 const storeKey='hfc-named-jobs-v1',themeKey='nightsweep-theme-v1';
 const workOrderFields=[['workOrder','Ticket / work-order number','text',200],['address','Address / location note','textarea',1000],['symptom','Symptom / problem','textarea',2000],['startTime','Start time','datetime-local',40],['endTime','End time','datetime-local',40],['weather','Weather note','text',1000],['resolution','Resolution notes','textarea',8000],['partsUsed','Parts used','textarea',4000]];
 const linkedProjectFields={workOrder:'job',node:'node',lead:'lead'};
 const editableFields=new Set(['name','node','date','lead',...workOrderFields.map(x=>x[0])]);
 let initialized=false,library,libraryError='',changing=false,saving=false,lastStatus='',lastStatusError=false,lastRenderedOwner=null,lastRenderedSignature='';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const training=source=>source?.job?.training==='guided-1.5';
 const sample=source=>!!source?.example||training(source);
 const compact=x=>typeof evidenceCompactState==='function'?evidenceCompactState(x):clone(x);
 const isBusy=()=>changing||(typeof evidenceIsBusy==='function'&&evidenceIsBusy());
 const makeId=()=> 'job_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,11);
 function readLibrary(){
  const raw=localStorage.getItem(storeKey);if(!raw)return {version:1,activeId:null,jobs:[]};
  const saved=JSON.parse(raw);
  if(!saved||saved.version!==1||!Array.isArray(saved.jobs)||saved.jobs.length>1000)throw Error('Named jobs list could not be read. Export the working project before repairing browser storage.');
  const ids=new Set();
  for(const item of saved.jobs){
   if(!item||typeof item.id!=='string'||!/^job_[a-z0-9_]+$/.test(item.id)||ids.has(item.id)||typeof item.name!=='string'||!item.snapshot||item.snapshot.version!==1||!Array.isArray(item.snapshot.rows))throw Error('Named jobs list contains an invalid entry. Export the working project before repairing browser storage.');
   ids.add(item.id);
  }
  return saved;
 }
 function getLibrary(){if(libraryError)throw Error(libraryError);if(!library)library=readLibrary();return library;}
 function writeLibrary(next){if(next.jobs.length>1000)throw Error('Named jobs list is full. Export and delete an older named job before adding another.');localStorage.setItem(storeKey,JSON.stringify(next));library=next;}
 function metadata(source=state){
  const j=source.job||{},p=source.project?.meta||{};
  // Preserve optional scalar fields when making or opening a named snapshot.
  const result={...j,name:String(j.name??(p.job||(source.example?'Sample route':'Working job'))).slice(0,200),node:String(j.node??(source.node?.asset||p.node||'')).slice(0,200),date:String(j.date??new Date().toISOString().slice(0,10)).slice(0,30),lead:String(j.lead??p.lead??'').slice(0,200)};
  for(const [key,,,max] of workOrderFields){const value=key==='workOrder'?(j[key]??p.job):j[key];if(value!==undefined&&value!==null)result[key]=String(value).slice(0,max);}
  return result;
 }
 function workOrderWarnings(source=state){
  const m=metadata(source),start=m.startTime,end=m.endTime;
  if(!start||!end)return '';
  const valid=value=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)&&Number.isFinite(Date.parse(value));
  if(!valid(start)||!valid(end))return 'Check the entered start and end times. The original text is retained.';
  return Date.parse(end)<Date.parse(start)?'End time is before start time. Check the job times; calculations are unchanged.':'';
 }
 function refreshTimeWarning(){const el=$('jobTimeWarning');if(el){const warning=workOrderWarnings();el.hidden=!warning;el.textContent=warning;}}
 function refreshLinkedControls(){
  const m=metadata();
  for(const key of ['workOrder','node','lead']){
   const jobControl=document.querySelector('[data-job-field="'+key+'"]');if(jobControl&&jobControl!==document.activeElement)jobControl.value=m[key]??'';
   const projectControl=document.querySelector('[data-project-scope="meta"][data-project-field="'+linkedProjectFields[key]+'"]');if(projectControl&&projectControl!==document.activeElement)projectControl.value=m[key]??'';
  }
 }
 function setJobField(key,value){
  if(!editableFields.has(key))return false;
  const max=workOrderFields.find(x=>x[0]===key)?.[3]??(key==='date'?30:200),text=String(value??'').slice(0,max);
  state.job={...metadata(),...state.job,[key]:text};
  if(linkedProjectFields[key])ensureProject().meta[linkedProjectFields[key]]=text;
  refreshLinkedControls();refreshTimeWarning();return true;
 }
 function projectMetaChanged(key,value){
  const field=Object.keys(linkedProjectFields).find(k=>linkedProjectFields[k]===key);if(!field)return;
  setJobField(field,value);
 }
 function orderControls(m){return workOrderFields.map(([key,label,type,max])=>`<label${type==='textarea'?' class="job-note-field"':''}>${esc(label)}${type==='textarea'?`<textarea data-job-field="${key}" maxlength="${max}">${esc(m[key]??'')}</textarea>`:`<input data-job-field="${key}" type="${type}" maxlength="${max}" value="${esc(m[key]??'')}">`}</label>`).join('');}
 function record(source,id,overrides={}){const meta={...metadata(source),...overrides};const snapshot=compact(source);snapshot.job={...snapshot.job,...meta,id,sample:sample(source)};return {...meta,id,sample:sample(source),updatedAt:new Date().toISOString(),snapshot};}
 function status(text,error=false){lastStatus=text;lastStatusError=error;const el=$('jobsStatus');if(el){el.textContent=text;el.className='status'+(error?' error':'');}if(error&&$('message'))$('message').textContent=text;}
 function requireIdle(){if(isBusy())throw Error('Finish the current evidence operation before changing named jobs.');}
 function syncCurrent(){
  if(saving||changing||!library||libraryError)return;
  const item=library.jobs.find(j=>j.id===library.activeId);
  if(!item||state.job?.id!==item.id)return;
  if(item.sample&&!sample(state)){status('Sample changes are kept in the working autosave. Save named job confirms replacing the sample.');return;}
  saving=true;
  try{const next={...library,jobs:library.jobs.map(j=>j.id===item.id?record(state,j.id):j)};writeLibrary(next);}
  catch(e){status('Named job autosave failed. Use Files → Save project now. '+e.message,true);}
  finally{saving=false;}
 }
 function snapshots(){return readLibrary().jobs.map(j=>clone(j.snapshot));}
 function referencedEvidenceIds(){
  // A damaged reference must stop cleanup rather than make its original look unused.
  return new Set(snapshots().flatMap(s=>{const evidence=s.evidence===undefined?[]:s.evidence;EvidenceCore.validateEvidence(evidence);return evidence.map(e=>e.id);}));
 }
 function retainWorking(detach=false){
  const saved=getLibrary(),active=saved.jobs.find(j=>j.id===saved.activeId&&state.job?.id===j.id);
  const replace=active&&!(active.sample&&!sample(state)),id=replace?active.id:makeId(),next=record(state,id,active&&!replace?{name:metadata().name+' (working)'}:{});
  const jobs=replace?saved.jobs.map(j=>j.id===id?next:j):[...saved.jobs,next];
  writeLibrary({...saved,jobs,activeId:detach?null:id});state.job=clone(next.snapshot.job);
 }
 function confirmSwitch(action){
  const files=state.evidence?.length||0;
  return confirm(action+' The current working job will be kept in this browser.'+(files?' Its '+files+' evidence attachment'+(files===1?' stays':'s stay')+' with that job.':'')+' Export a project file for a separate backup.');
 }
 function hasWorkingContent(){
  return !!(state.sweepSetup||state.fieldWork||state.fieldReferences||state.rows?.length||state.evidence?.length||state.node?.model||state.job?.id||state.job?.name||workOrderFields.some(([key])=>String(state.job?.[key]??'').trim())||state.project?.meta?.job||state.project?.meta?.node||['forward','returns','punch','dsim'].some(k=>state.project?.[k]?.length)||state.power?.rows?.some(r=>HFC.number(r.load)!==null||HFC.number(r.length)>0));
 }
 function beforeProjectOpen({confirmed=false}={}){
  requireIdle();getLibrary();
  if(state.evidence?.length&&!confirmed&&!confirm('Open another project and replace the working job? The current job and its '+state.evidence.length+' evidence attachment'+(state.evidence.length===1?' will be kept':'s will be kept')+' in named jobs on this device. Save project for a separate backup.'))return false;
  if(hasWorkingContent())retainWorking(true);else if(library.activeId)writeLibrary({...library,activeId:null});
  return true;
 }
 function saveNamed(){
  requireIdle();const saved=getLibrary();
  if(sample(state)&&!confirm(training(state)?'This is a synthetic training job, not your plant. Save it as a clearly marked practice job?':'This is the three-Technetix-tap sample, not your plant. Save it as a clearly marked sample job?'))return false;
  const meta=metadata();if(!meta.name.trim())throw Error('Enter a job name.');
  const active=saved.jobs.find(j=>j.id===saved.activeId&&state.job?.id===j.id);
  if(active?.sample&&!sample(state)&&!confirm('This named job is a sample. Replace it with your current plant job? Duplicate the sample first if you want to keep both.'))return false;
  const id=active?.id||makeId(),item=record(state,id,{...meta,name:meta.name.trim()});
  writeLibrary({...saved,activeId:id,jobs:active?saved.jobs.map(j=>j.id===id?item:j):[...saved.jobs,item]});state.job=clone(item.snapshot.job);saveLocal();render();status('Named job saved on this device. Save project includes original evidence for a portable backup.');return id;
 }
 async function open(id){
  requireIdle();const saved=getLibrary(),target=saved.jobs.find(j=>j.id===id);if(!target)throw Error('Named job was not found.');
  if(saved.activeId===id&&state.job?.id===id){status('This job is already open.');return false;}
  if(!confirmSwitch('Open “'+target.name+'”?'))return false;
  loadState(clone(target.snapshot),false,true);
  retainWorking();changing=true;
  try{
   const snapshot=clone(target.snapshot);snapshot.job={...snapshot.job,...metadata(snapshot),id,sample:!!target.sample};
   writeLibrary({...library,activeId:id});loadState(snapshot);saveLocal();
   if(typeof EvidenceUI!=='undefined')await EvidenceUI.reloadPreviews();
   status('Opened '+target.name+'. Predictions and job records remain separate.');return true;
  }finally{changing=false;render();}
 }
 async function newJob(){
  requireIdle();getLibrary();if(!confirmSwitch('Start a new blank job?'))return false;
  retainWorking();changing=true;
  try{
   const source={version:1,example:false,setup:{...defaultSetup},rows:[],power:freshPower(),project:projectDefaults(),node:NodeTools.defaults(),job:{name:'New job',node:'',date:new Date().toISOString().slice(0,10),lead:''}};
   source.project.meta={lead:''};writeLibrary({...library,activeId:null});loadState(source);saveLocal();status('New blank job ready. Enter a name, node and lead, then save it in the list.');return true;
  }finally{changing=false;render();}
 }
 async function openTraining(candidate){
  requireIdle();getLibrary();loadState(candidate,false,true);
  if(candidate.job?.training!=='guided-1.5')throw Error('Invalid training job.');
  const samePractice=training(state)&&(state.job?.trainingVariant||'complete')===(candidate.job?.trainingVariant||'complete');
  if(!confirmSwitch(samePractice?'Reset this synthetic training exercise to its starting values?':'Open '+(candidate.job?.name||'the synthetic training job')+'?'))return false;
  changing=true;
  try{
   // Verify and store new originals before replacing anything. Failure keeps the
   // working job untouched; named-job persistence must succeed before loading.
   const clean=await evidencePrepareImport(candidate);loadState(clean,false,true);
   retainWorking(true);
   loadState(clean);saveLocal();
   status('Synthetic training job opened. Your previous working job is kept in named jobs. Export a separate project backup for durable storage.');
   return true;
  }finally{changing=false;render();}
 }
 function duplicate(id){
  requireIdle();const saved=getLibrary(),item=saved.jobs.find(j=>j.id===id);if(!item)throw Error('Named job was not found.');
  const updateCurrent=saved.activeId===id&&state.job?.id===id&&!(item.sample&&!sample(state));
  const source=updateCurrent?state:item.snapshot,copyId=makeId(),copy=record(source,copyId,{name:metadata(source).name+' (copy)'});
  // Update the active snapshot and add its copy in one atomic storage write.
  // A failed autosave must never cause a successful copy of stale saved data.
  const jobs=updateCurrent?saved.jobs.map(job=>job.id===id?record(state,id):job):saved.jobs;
  writeLibrary({...saved,jobs:[...jobs,copy]});render();status('Duplicated '+metadata(source).name+'. Original evidence files remain available to both jobs.');return copyId;
 }
 function remove(id){
  requireIdle();const saved=getLibrary(),item=saved.jobs.find(j=>j.id===id);if(!item)throw Error('Named job was not found.');
  if(!confirm('Delete “'+item.name+'” from the named jobs list?'+(saved.activeId===id?' The current working job stays open.':'')+' Original evidence bytes and exported backups are retained.'))return false;
  writeLibrary({...saved,jobs:saved.jobs.filter(j=>j.id!==id),activeId:saved.activeId===id?null:saved.activeId});
  if(state.job?.id===id){state.job={...state.job};delete state.job.id;saveLocal();}
  render();status('Named job removed from the list.');return true;
 }
 function theme(choice,persist=true){
  const value=choice==='sun'?'sun':'night';document.documentElement.dataset.theme=value;
  if(persist){try{localStorage.setItem(themeKey,value);}catch(e){status('Palette changed; this browser could not save the preference.',true);}}
  const button=$('themeToggle');if(button){button.textContent=value==='sun'?'Night':'Sun';button.setAttribute('aria-label',value==='sun'?'Switch to Night palette':'Switch to Sun palette');button.setAttribute('aria-pressed',String(value==='sun'));}
  if(typeof drawChart==='function')drawChart();return value;
 }
 function render(){
  const parent=$('projectPanel');if(!parent)return;let el=$('jobsPanel');
  if(!el){el=document.createElement('section');el.id='jobsPanel';el.className='panel';el.dataset.screen='projects';parent.before(el);}
  el.hidden=parent.hidden;const m=metadata(),saved=library||{jobs:[],activeId:null},disabled=isBusy()?' disabled':'';
  const workOrderOpen=$('jobWorkOrder')?.open;
  const focused=document.activeElement?.dataset.jobField;
  if(focused&&el.contains(document.activeElement)&&lastRenderedOwner===state)return;
  const signature=JSON.stringify([[m.name,m.node,m.date,m.lead,m.id,...workOrderFields.map(([key])=>m[key]??'')],sample(state),libraryError,disabled,saved.activeId,saved.jobs.map(j=>[j.id,j.name,j.node,j.date,j.lead,j.workOrder,j.sample,j.updatedAt,j.snapshot.rows.length,j.snapshot.evidence?.length||0])]);
  if(lastRenderedOwner===state&&lastRenderedSignature===signature)return;
  lastRenderedOwner=state;lastRenderedSignature=signature;
  el.innerHTML=`<div class="sectionhead"><div><h2>Named jobs on this device</h2><p class="note tight">One working job per node. No account or server.</p></div><button id="jobNew"${disabled}>+ New blank job</button></div>${sample(state)?'<div class="status warning">'+(training(state)?'SYNTHETIC training job: all readings and findings remain practice data, even after editing.':'Sample: three Technetix taps, not your plant. Saving this route requires a sample warning.')+'</div>':''}<div class="fields job-meta"><label>Job name<input data-job-field="name" maxlength="200" value="${esc(m.name)}"></label><label>Node / asset<input data-job-field="node" maxlength="200" value="${esc(m.node)}"></label><label>Date<input data-job-field="date" type="date" value="${esc(m.date)}"></label><label>Lead<input data-job-field="lead" maxlength="200" value="${esc(m.lead)}"></label></div><details id="jobWorkOrder" class="job-work-order"${workOrderOpen?' open':''}><summary>Work order and field closeout</summary><p class="note">Optional job records. These notes do not establish measured RF acceptance. Times are local to the technician's device; blanks stay blank.</p><div class="fields job-work-order-fields">${orderControls(m)}</div><p id="jobTimeWarning" class="status warning" role="status"${workOrderWarnings()?'':' hidden'}>${esc(workOrderWarnings())}</p></details><div class="toolbar job-actions"><button id="jobSave" class="primary"${disabled}>Save named job</button><span class="note">${saved.activeId&&state.job?.id===saved.activeId?'Changes autosave to this named job.':'Save to add this working job to the list.'}</span></div><div id="jobsStatus" class="status${libraryError||lastStatusError?' error':''}" role="status" aria-live="polite">${esc(libraryError||lastStatus||'Save project exports the current job with original evidence. Browser storage is local to this app or browser.')}</div><div class="job-list">${saved.jobs.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(j=>`<article class="named-job${j.id===saved.activeId&&state.job?.id===j.id?' current-job':''}"><div><strong>${esc(j.name)}${j.sample?' · SAMPLE':''}</strong><p class="note">${esc(j.node||'No node / asset')} · ${esc(j.date||'No date')} · ${esc(j.lead||'No lead')}${j.id===saved.activeId&&state.job?.id===j.id?' · Open':''}</p>${j.workOrder?'<p class="note">Ticket: '+esc(j.workOrder)+'</p>':''}<p class="note">${j.snapshot.rows.length} route points · ${(j.snapshot.evidence||[]).length} original evidence files</p></div><div class="toolbar"><button data-job-open="${esc(j.id)}"${disabled}>Open</button><button data-job-duplicate="${esc(j.id)}"${disabled}>Duplicate</button><button class="danger" data-job-delete="${esc(j.id)}"${disabled}>Delete</button></div></article>`).join('')||'<p class="note">No named jobs yet. Save this working job or start a blank one.</p>'}</div>`;
 }
 function init(){
  if(initialized)return;initialized=true;
  try{library=readLibrary();}catch(e){libraryError='Saved named jobs could not be read: '+e.message;library={version:1,activeId:null,jobs:[]};}
  const nativeSave=saveLocal;saveLocal=function(){const result=nativeSave();if(result!==false)syncCurrent();return result;};
  const nativeProjects=renderProjects;renderProjects=function(){nativeProjects();render();};
  const nativeLoad=loadState;loadState=function(...args){const result=nativeLoad(...args);if(!args[2]&&args[1]!==false)render();return result;};
  const nativeExample=example;example=function(){nativeExample();if(library&&!libraryError){library={...library,activeId:null};try{writeLibrary(library);}catch(e){status(e.message,true);}}render();};
  const button=document.createElement('button');button.id='themeToggle';button.className='theme-toggle';button.type='button';const menu=document.querySelector('.filemenu');menu.before(button);
  let selectedTheme='night';try{selectedTheme=localStorage.getItem(themeKey)||'night';}catch(e){}theme(selectedTheme,false);
  button.onclick=()=>theme(document.documentElement.dataset.theme==='sun'?'night':'sun');
  const editJobField=e=>{const key=e.target.dataset.jobField;if(!key||!setJobField(key,e.target.value))return;saveLocal();};
  document.addEventListener('input',editJobField);document.addEventListener('change',editJobField);
  document.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;let action;
   if(b.id==='jobSave')action=()=>saveNamed();if(b.id==='jobNew')action=()=>newJob();
   if(b.dataset.jobOpen)action=()=>open(b.dataset.jobOpen);if(b.dataset.jobDuplicate)action=()=>duplicate(b.dataset.jobDuplicate);if(b.dataset.jobDelete)action=()=>remove(b.dataset.jobDelete);
   if(action)Promise.resolve().then(action).catch(e=>status(e.message,true));
  });
  render();if(libraryError)status(libraryError,true);
 }
 return {init,render,open,newJob,openTraining,saveNamed,duplicate,remove,beforeProjectOpen,snapshots,referencedEvidenceIds,theme,isBusy,storeKey,metadata,workOrderFields,workOrderWarnings,setJobField,projectMetaChanged};
})();
function initJobs(){JobsUI.init();}
