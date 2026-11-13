/* Route planning and station readings. All saved values are additive row data. */
const RouteWorkbench=(()=>{
 const n=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 function reason(state,row){
  let current=row,seen=new Set();
  while(current){
   if(seen.has(current.id))return 'Route connection contains a loop.';
   seen.add(current.id);const m=current.mapImport;
   if(m){if(m.status==='absent')return 'Equipment is marked absent.';if(m.status==='proposed')return 'Proposed equipment is not installed.';if(m.status==='draft'||m.connectionConfirmed!==true)return 'Map connection or span is unverified.';if(current===row&&m.modelConfirmed!==true)return 'Installed model is unverified.';if(m.reasons?.length&&!m.reviewResolved)return m.reasons.join(' ');}
   if(current.modelUnverified)return 'Installed model is unverified.';
   if(current.parent==='source'){if(state.mapLaunch&&state.mapLaunch.confirmed!==true)return 'Map launch and selected output port are unverified.';break;}
   const parent=String(current.parent||'').split('::')[0];current=state.rows.find(r=>r.id===parent);if(!current)return 'Upstream connection is missing.';
  }
  return '';
 }
 function assess(HFC,state,catalog,row,routeResults,targets={}){
  const why=reason(state,row);if(why)return {label:'Needs input',reason:why,budget:null};
  const b=HFC.gainBudget(state,catalog,{rowId:row.id,routeResults,...targets});
  if(b.error)return {label:'Needs input',reason:b.error,budget:b};
  if(b.gainStatus==='missing'){
   let missing=[];for(const [key,x] of [['Low',b.low],['High',b.high]]){if(x.input===null)missing.push(key+' route input unavailable: check the upstream path, cable and marker.');else if(x.target===null)missing.push(key+' target output is missing.');else if(x.availableGain===null)missing.push(key+' operating gain is unavailable at this marker.');}
   return {label:'Needs input',reason:(b.warnings||[]).find(x=>/model|map connection|map launch|equipment is|proposed equipment|upstream/i.test(x))||missing.join(' ')||'Enter verified gain at both markers.',budget:b};
  }
  const limiting=b.low.margin<=b.high.margin?b.low:b.high;
  return {label:b.gainStatus==='shortfall'?'Short on gain':b.outputStatus==='unknown'?'Gain available · output limit unknown':'Can make gain',reason:'',limiting,budget:b};
 }
 function correctedLevel(value,plane,correction){const level=n(value);if(level===null||!['port','tp'].includes(plane))return null;const add=plane==='tp'?n(correction):0;return add===null?null:level+add;}
 function measuredGain(reading,inputFrequency,outputFrequency){
  if(n(inputFrequency)===null||n(outputFrequency)===null||n(inputFrequency)!==n(outputFrequency))return null;
  const i=n(reading.input),o=n(reading.output);if(i===null||o===null||!['port','tp'].includes(reading.inputPlane)||!['port','tp'].includes(reading.outputPlane))return null;
  const ic=reading.inputPlane==='tp'?n(reading.inputCorrection):0,oc=reading.outputPlane==='tp'?n(reading.outputCorrection):0;
  return ic===null||oc===null?null:o+oc-i-ic;
 }
 return {assess,measuredGain,correctedLevel,reason};
})();
if(typeof module!=='undefined')module.exports=RouteWorkbench;

function workbenchMarkup(row,d){
 const w=row.workbench||{},leg=w.leg||'main',legs=row.device==='active_gm_hgd'?[['main','Main'],['aux','Auxiliary'],['third','Optional signal director output']]:row.device==='active_gm_hgbt'?[['main','Main'],['output2','Output 2'],['output3','Output 3']]:[['main','Selected output']],lg=w.legGain?.[leg]||{};
 const field=(key,label,value)=>`<label>${label}<input type="number" step="any" data-wb="${key}" value="${esc(value??'')}"></label>`;
 const stageMarkup=stage=>{const record=w.records?.[leg]?.[stage]||{},shared=w.shared?.[stage]||{},input=w.commonInput?shared:record;
  return `<fieldset><legend>${stage==='before'?'Before':'After'}</legend><div class="wb-grid">${['low','high'].map(band=>{const v=input[band]||{},o=record[band]||{};return `<div><strong>${band==='low'?'Low':'High'} · ${esc(state.setup[band+'F'])} MHz</strong>${field(stage+'.'+band+'.input','Input (dBmV)',v.input)}<label>Input plane<select data-wb="${stage}.${band}.inputPlane">${option('','Choose plane',v.inputPlane)}${option('port','Port',v.inputPlane)}${option('tp','Test point',v.inputPlane)}</select></label>${field(stage+'.'+band+'.inputCorrection','Add input TP correction (dB)',v.inputCorrection)}${field(stage+'.'+band+'.output','Output (dBmV)',o.output)}<label>Output plane<select data-wb="${stage}.${band}.outputPlane">${option('','Choose plane',o.outputPlane)}${option('port','Port',o.outputPlane)}${option('tp','Test point',o.outputPlane)}</select></label>${field(stage+'.'+band+'.outputCorrection','Add output TP correction (dB)',o.outputCorrection)}<p data-wb-measured="${stage}.${band}"></p></div>`}).join('')}</div></fieldset>`;};
 const slots=row.device==='active_gm_hgd'?['Forward input pad','Forward input EQ','Interstage pad','Interstage EQ','Main output pad','Aux output pad','Return input pad · Main','Return input pad · Aux','Return output pad','Return output EQ','AGC pad']:row.device==='active_gm_hgbt'?['Forward input pad','Forward input EQ']:row.device.startsWith('active_gm_le_')?['Forward input pad','Forward input EQ','Return input pad','Return output pad','Return output EQ','AGC pad']:[];
 return `<section class="route-workbench"><h3>Route &amp; sweep · ${esc(row.name||'Active')}</h3><label>Selected leg<select data-wb="leg">${legs.map(x=>option(x[0],x[1],leg)).join('')}</select></label><div data-wb-result aria-live="polite"></div>${leg!=='main'?`<div class="wb-grid">${field('legGain.low','Available gain at low marker (dB)',lg.low)}${field('legGain.high','Available gain at high marker (dB)',lg.high)}${field('legGain.loss','Additional output loss (dB)',lg.loss)}${field('legGain.limitLow','Low output limit (dBmV)',lg.limitLow)}${field('legGain.limitHigh','High output limit (dBmV)',lg.limitHigh)}</div><p class="note">Enter verified gain for this leg and configuration; no other output gain is assumed. Choose this output as the feed for any downstream branch.</p>`:''}<details><summary>Enter Before / After readings and pads &amp; EQs</summary><label class="check"><input type="checkbox" data-wb="commonInput"${w.commonInput?' checked':''}>Input shared by output legs</label><p class="note">Raw readings stay separate from corrected port levels. Enter a correction only for an uncompensated test point; use the same measurement bandwidth.</p>${stageMarkup('before')}${stageMarkup('after')}${slots.length?`<h4>Pads &amp; EQs · dB</h4><div class="wb-grid">${slots.map(slot=>`<div><strong>${esc(slot)}</strong>${field('pad.'+slot+'.installed','Installed',w.pads?.[slot]?.installed)}${field('pad.'+slot+'.changed','Changed to',w.pads?.[slot]?.changed)}</div>`).join('')}</div><p class="note">Record only positions fitted to this configuration; these values do not solve for parts.</p>`:'<p class="note">No verified plug-in slot list for this model; use the equipment manual.</p>'}</details></section>`;
}
function workbenchState(row){
 const w=row.workbench||{};if(!w.leg||w.leg==='main')return {...state,setup:gainBudgetSetup()};
 const lg=w.legGain?.[w.leg]||{},copy={...row,activeMode:'anchors',gainLowF:lg.lowF,gainHighF:lg.highF,gainLow:lg.low,gainHigh:lg.high,outputLoss:lg.loss??0,outputLimitLow:lg.limitLow,outputLimitHigh:lg.limitHigh};
 return {...state,setup:gainBudgetSetup(),rows:state.rows.map(r=>r===row?copy:r)};
}
function refreshWorkbench(){
 const setup=gainBudgetSetup(),context={...state,setup},routeResults={low:HFC.run(context,catalog,HFC.number(setup.lowF)),high:HFC.run(context,catalog,HFC.number(setup.highF))};
 for(const row of state.rows){const card=[...document.querySelectorAll('#route [data-row]')].find(x=>x.dataset.row===row.id),box=card?.querySelector('.route-workbench');if(!box)continue;
  const a=RouteWorkbench.assess(HFC,workbenchState(row),catalog,row,routeResults,{targetLow:gainBudgetTarget(row,'targetLow',setup),targetHigh:gainBudgetTarget(row,'targetHigh',setup)}),b=a.budget,lim=a.limiting;
  const result=box.querySelector('[data-wb-result]');result.innerHTML=`<div class="status ${a.label==='Short on gain'?'error':'warning'}"><strong>${esc(a.label)}</strong>${a.reason?`<p>${esc(a.reason)}</p>`:''}${lim?`<p>Limiting marker ${esc(lim.frequency)} MHz · margin ${fmt(lim.margin)} dB</p>`:''}</div>${b?`<div class="wb-levels">${[['Low',b.low],['High',b.high]].map(([label,x])=>`<div><strong>${label} · ${esc(x?.frequency??'—')} MHz</strong><p>Expected input ${fmt(x?.input??null)} → output ${fmt(x?.predictedOutput??null)} dBmV</p><p>Target ${fmt(x?.target??null)} dBmV · required ${fmt(x?.requiredGain??null)} / available ${fmt(x?.availableGain??null)} dB · margin ${fmt(x?.margin??null)} dB</p></div>`).join('')}</div><p class="note">Reserve: ${b.gainStatus==='marginal'?'low':'see margin'} · Output limit: ${b.outputStatus==='above_limit'?'exceeded':b.outputStatus==='within_limits'?'within entered limits':'unknown'}</p>`:''}`;
  const w=row.workbench||{},leg=w.leg||'main';for(const stage of ['before','after'])for(const band of ['low','high']){const rec=w.records?.[leg]?.[stage]?.[band]||{},input=w.commonInput?(w.shared?.[stage]?.[band]||{}):rec,reading={...rec,input:input.input,inputPlane:input.inputPlane,inputCorrection:input.inputCorrection},g=RouteWorkbench.measuredGain(reading,HFC.number(input.inputFrequency)===HFC.number(state.setup[band+'F'])?input.inputFrequency:null,HFC.number(rec.outputFrequency)===HFC.number(state.setup[band+'F'])?rec.outputFrequency:null);const el=box.querySelector(`[data-wb-measured="${stage}.${band}"]`);if(el){const ci=RouteWorkbench.correctedLevel(reading.input,reading.inputPlane,reading.inputCorrection),co=RouteWorkbench.correctedLevel(reading.output,reading.outputPlane,reading.outputCorrection);el.textContent='Corrected input '+fmt(ci)+' dBmV · corrected output '+fmt(co)+' dBmV · measured gain '+(g===null?'—':fmt(g)+' dB');}}
 }
}
function initRouteWorkbench(){
 $('route').addEventListener('input',edit);$('route').addEventListener('change',edit);
 function edit(e){const t=e.target,key=t.dataset.wb;if(!key)return;const row=state.rows.find(r=>r.id===t.closest('[data-row]')?.dataset.row);if(!row)return;const w=row.workbench||(row.workbench={}),value=t.type==='checkbox'?t.checked:t.value;
  if(key==='leg'||key==='commonInput'){w[key]=value;renderAll();return;}
  if(key.startsWith('pad.')){const [,slot,part]=key.split('.');w.pads??={};w.pads[slot]??={};w.pads[slot][part]=value;}
  else if(key.startsWith('legGain.')){const part=key.slice(8),leg=w.leg||'main';w.legGain??={};w.legGain[leg]??={};w.legGain[leg][part]=value;if(part==='low')w.legGain[leg].lowF=state.setup.lowF;if(part==='high')w.legGain[leg].highF=state.setup.highF;}
  else {const [stage,band,part]=key.split('.'),leg=w.leg||'main';w.records??={};w.records[leg]??={};w.records[leg][stage]??={};w.records[leg][stage][band]??={};let target=w.records[leg][stage][band];if(w.commonInput&&part.startsWith('input')){w.shared??={};w.shared[stage]??={};target=w.shared[stage][band]??={};}target[part]=value;if(part==='input')target.inputFrequency=state.setup[band+'F'];if(part==='output')target.outputFrequency=state.setup[band+'F'];}
  state.example=false;refreshWorkbench();saveLocal();
 }
}
function routePointSummary(row){
 const m=row.mapImport;
 return `<div class="wb-point-summary" data-wb-point></div>${m?`<details class="wb-map-review" open><summary>Map review · ${esc(m.tag||'no TAG')}</summary><p>${esc((m.reasons||[]).join(' ')||'Review the installed path and model against the map and field evidence.')}</p><label class="check"><input type="checkbox" data-map-confirm="connection"${m.connectionConfirmed?' checked':''}>Connection, cable construction and span confirmed</label><label class="check"><input type="checkbox" data-map-confirm="model"${m.modelConfirmed?' checked':''}>Installed model confirmed</label><label class="check"><input type="checkbox" data-map-confirm="installed"${m.status==='installed'?' checked':''}>Equipment installed and review items resolved</label></details>`:''}`;
}
function refreshRoutePointSummaries(){
 const launch=$('mapLaunchSummary');if(launch)launch.innerHTML=state.mapLaunch?`Map launch: ${esc(state.mapLaunch.name||'unnamed')} · selected port ${esc(state.mapLaunch.port||'unverified')} · original map not attached; keep source PDF/image separately.<label class="check"><input type="checkbox" data-map-launch-confirm${state.mapLaunch.confirmed?' checked':''}>Launch and selected output port confirmed</label>`:'';
 const setup=gainBudgetSetup(),context={...state,setup},runs={low:HFC.run(context,catalog,HFC.number(setup.lowF)),high:HFC.run(context,catalog,HFC.number(setup.highF))};for(const row of state.rows){const card=[...document.querySelectorAll('#route [data-row]')].find(x=>x.dataset.row===row.id),el=card?.querySelector('[data-wb-point]');if(!el)continue;
  const lines=['low','high'].map(k=>{const f=HFC.number(setup[k+'F']),v=f===null?null:runs[k].results.find(x=>x.id===row.id);return `${esc(f??'—')} MHz · expected input ${fmt(v?.input.level??null)} → ${esc(v?.outputs[0]?.label||'output')} ${fmt(v?.outputs[0]?.level??null)} dBmV${v?.blockedReason?' · '+esc(v.blockedReason):''}`;});el.innerHTML=lines.map(x=>`<p>${x}</p>`).join('');
 }
}
function initMapWorkbench(){
 const host=$('mapImportMount');if(host&&typeof NightSweepMapImport!=='undefined')NightSweepMapImport.mount(host,{onDraft:draft=>{if(state.rows.length&&!confirm('Replace the current route with this map draft? Save the job first if needed.'))return;state.rows=draft.rows;state.mapLaunch=draft.launch;state.mapImportSource=draft.source;state.example=false;renderAll();saveLocal();$('message').textContent='Map draft imported. The original map is not attached to this job; keep your original file separately.';},onError:error=>{$('message').textContent=String(error?.message||error);}});
 $('mapLaunchSummary')?.addEventListener('change',e=>{if(e.target.hasAttribute('data-map-launch-confirm')&&state.mapLaunch){state.mapLaunch.confirmed=e.target.checked;refreshResults();saveLocal();}});
 $('route').addEventListener('change',e=>{const t=e.target,k=t.dataset.mapConfirm;if(!k)return;const row=state.rows.find(r=>r.id===t.closest('[data-row]')?.dataset.row),m=row?.mapImport;if(!m)return;if(k==='connection')m.connectionConfirmed=t.checked;if(k==='model'){const d=device(row.device),valid=d&&d.id!=='none'&&(m.kind!=='active'||d.active)&&(m.kind!=='passive'||!d.active);m.modelConfirmed=!!(t.checked&&valid);if(t.checked&&!valid)$('message').textContent='Choose a matching installed equipment model before confirming it.';}if(k==='installed'){m.status=t.checked?'installed':'draft';m.reviewResolved=t.checked;}renderAll();});
}
