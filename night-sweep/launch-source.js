/* Source identity is a reference plane; it never inserts gain or changes readings. */
const LaunchSource=(()=>{
 let initialized=false;
 const type=()=>state.setup.sourceType||'manual';
 function model(){return type()==='node'?state.node?.model||'':type()==='active'?state.setup.sourceModel||'':'';}
 function label(){
  const s=state.setup,n=state.node||{},p=type()==='node'?NodeTools.profile(n,catalog):type()==='active'?device(s.sourceModel):null;
  const base=type()==='node'?'Node':type()==='active'?'Amplifier / LE':'Manual launch';
  return [base,p?.label||p?.model,type()==='node'?n.asset:s.sourceAsset,type()==='node'?n.port:s.sourcePort].filter(Boolean).join(' · ');
 }
 function validate(s){
  if(s.companyTargetProfile!==undefined&&(typeof s.companyTargetProfile!=='string'||s.companyTargetProfile!==''&&!CompanyTargets.profile(s.companyTargetProfile)))throw Error('Invalid company node target profile.');
  if(s.sourceType!==undefined&&!['manual','node','active'].includes(s.sourceType))throw Error('Invalid launch source type.');
  for(const k of ['sourceModel','sourceAsset','sourcePort'])if(s[k]!==undefined&&(typeof s[k]!=='string'||s[k].length>500))throw Error('Invalid launch '+k+'.');
  if(s.sourceModel&&!catalog.devices.some(d=>d.id===s.sourceModel&&d.active))throw Error('Launch amplifier model must be an active configuration.');
 }
 function issues(){
  const s=state.setup,w=[];
  if(type()==='node'){
   const n=state.node||{},b=NodeTools.band(n,catalog);w.push(...NodeTools.issues(n,catalog));
   if(b){for(const k of ['lowF','highF']){const f=HFC.number(s[k]);if(f!==null&&(f<b.forwardFloor||f>b.equipmentUpper))w.push(`${k==='lowF'?'Low':'High'} marker is outside the selected node hardware forward band.`);}const live=HFC.number(s.liveMax),upper=NodeTools.number(n.operatingUpper);if(live!==null&&upper!==null&&live>upper)w.push('Available spectrum exceeds the entered node operating upper. Review the source band.');}
  }else if(type()==='active'){
   const d=device(s.sourceModel);if(!d?.active)w.push('Choose the installed launch amplifier / LE configuration.');if(d?.retired)w.push('Legacy saved equipment: '+(d.retirementReason||'This model is no longer offered for new jobs.'));
   const b=d?.publishedGain?.forwardBand;if(b)for(const k of ['lowF','highF']){const f=HFC.number(s[k]);if(f!==null&&(f<b[0]||f>b[1]))w.push('A launch marker is outside this amplifier’s published forward band.');}
  }
  if(s.launchTpReference&&type()!=='node')w.push('A saved node test-point reference belongs to an earlier source. Review the remaining coupling before using these launch readings.');
  return [...new Set(w)];
 }
 function status(){const el=$('launchSourceStatus');if(!el)return;const warnings=issues();el.className='status'+(warnings.length?' warning':'');el.textContent=warnings.length?warnings.join(' '):`${label()}. Enter the measured or job-design launch below; equipment ratings do not set its levels.`;}
 function render(){
  const setup=$('setup');if(!setup)return;let el=$('launchSource');if(!el){el=document.createElement('div');el.id='launchSource';el.className='launch-source';setup.querySelector('.sectionhead').after(el);}
  const s=state.setup,n=state.node||NodeTools.defaults(),p=NodeTools.profile(n,catalog),b=NodeTools.band(n,catalog);
  el.innerHTML=`<h3>1 · Choose the launch source</h3><p class="note">Start at a node, amplifier / LE output, or another measured source. The first cable span connects directly to this output.</p><div class="fields"><label>Source type<select data-launch-source="sourceType">${option('manual','Manual / other output',type())}${option('node','Node output',type())}${option('active','Amplifier / LE output',type())}</select></label>${type()==='node'?`<label>Installed node<select data-launch-node="model">${option('','Choose node…',n.model)}${catalog.nodeProfiles.map(x=>option(x.id,x.label,n.model)).join('')}</select></label><label>Installed split / hardware band<select data-launch-node="band"${p?'':' disabled'}>${p?p.bands.map((x,i)=>option(i,x.label,n.band)).join(''):option('','Choose node first','')}</select></label><label>Node asset / location<input data-launch-node="asset" maxlength="500" value="${esc(n.asset)}" placeholder="Node ID"></label><label>RF port / leg<input data-launch-node="port" maxlength="500" value="${esc(n.port)}" placeholder="RF1 / leg"></label><label>Installed RF / RPD module<input data-launch-node="module" maxlength="500" value="${esc(n.module)}" placeholder="Exact module / configuration"></label><label>Operating upper (MHz)<input data-launch-node="operatingUpper" type="number" min="5" max="1800" step="any" value="${esc(n.operatingUpper)}"></label>`:`${type()==='active'?`<label>Installed amplifier / LE<select data-launch-source="sourceModel">${option('','Choose exact active…',s.sourceModel)}${catalog.devices.filter(d=>d.active&&(!d.retired||d.id===s.sourceModel)).map(d=>option(d.id,(d.retired?'Legacy — ':'')+d.label,s.sourceModel)).join('')}</select></label>`:''}<label>Source asset / location<input data-launch-source="sourceAsset" maxlength="500" value="${esc(s.sourceAsset||'')}" placeholder="Launch station ID"></label><label>Output port / leg<input data-launch-source="sourcePort" maxlength="500" value="${esc(s.sourcePort||'')}" placeholder="Main / aux / leg"></label>`}</div>${type()==='node'&&b?`<p class="note">Hardware forward ${esc(b.forwardFloor)}–${esc(b.equipmentUpper)} MHz · return ${esc(b.returnLow)}–${esc(b.returnCeiling)} MHz. Confirm the installed split. This selection adds no RF gain and applies no automatic test-point correction.</p>`:''}<div id="launchSourceStatus" role="status"></div><div class="toolbar"><button type="button" data-equipment-target="source">Source setup &amp; manual</button>${type()==='node'?'<button type="button" data-launch-copy-job>Use job node ID</button>':''}</div><h3>2 · Enter the launch readings</h3>`;
  let company=document.getElementById('companyLaunchReference');if(!company){company=document.createElement('div');company.id='companyLaunchReference';el.append(company);}
  const chosen=CompanyTargets.selected(state);
  company.innerHTML=`<details><summary>Company node-output design reference</summary><label for="companyTargetProfile">Company reference preset</label><select id="companyTargetProfile">${option('','Legacy / manually entered launch',chosen?.id||'')}${CompanyTargets.profiles.map(p=>option(p.id,p.label,chosen?.id||'')).join('')}</select><button type="button" id="applyCompanyTarget">Apply company node design to this job</button><p class="note">Apply replaces only launch design frequencies/levels and uses linear MHz interpolation at node output. Station readings, amplifier targets, available spectrum and hardware stay as entered. Test-point addback is disabled for these output design values. Selecting Legacy keeps entered launch values.</p><p id="companyTargetStatus" class="status" role="status"></p>${chosen?Thresholds.tag(chosen.registryId):''}${CompanyTargets.referenceMarkup(chosen?.id)}</details>`;
  status();
  if(!$('launchNext')){const next=document.createElement('div');next.id='launchNext';next.className='workflow-next toolbar';next.innerHTML='<button class="primary" type="button" data-task="route">Next: cable route →</button><button type="button" data-task="equipmentSetup">Equipment setup</button>';setup.append(next);}
 }
 function changed(e){
  const t=e.target,k=t.dataset.launchSource,nk=t.dataset.launchNode;if(!k&&!nk)return;
  if(e.type==='input'&&t.tagName==='SELECT'||e.type==='change'&&t.tagName!=='SELECT')return;
  if(k)state.setup[k]=t.value;
  if(nk){const n=ensureNode();if(nk==='model')Object.assign(n,NodeTools.choice(t.value,catalog));else n[nk]=t.value;}
  state.example=false;$('exampleFlag')?.classList.add('hidden');
  if(t.tagName==='SELECT')render();else status();
  renderTraceChoices();renderDistanceTools();
  state.rows.forEach((row,i)=>{const select=$('route')?.querySelector(`[data-row="${row.id}"] [data-field="parent"]`);if(select)select.innerHTML=parents(i,row.parent);});
  if(typeof renderLaunchTestPoint==='function')renderLaunchTestPoint();
  if(typeof renderNodes==='function')renderNodes();
  refreshResults();
  if(typeof EquipmentSetup!=='undefined')EquipmentSetup.render();
 }
 function init(){
  if(initialized)return;initialized=true;
  const oldSetup=renderSetup;renderSetup=function(){oldSetup();render();};
  document.addEventListener('input',changed);document.addEventListener('change',changed);
  document.addEventListener('click',e=>{
   if(e.target.closest('#applyCompanyTarget')){
    const id=document.getElementById('companyTargetProfile').value,p=CompanyTargets.profile(id),notice=document.getElementById('companyTargetStatus');
    if(!id){delete state.setup.companyTargetProfile;saveLocal();renderAll();return;}
    const b=type()==='node'?NodeTools.band(state.node||{},catalog):null;
    if(!p||type()!=='node'||Number(b?.returnCeiling)!==Number(p.split)||!b||b.forwardFloor>p.domain[0]||b.equipmentUpper<p.domain[1]){notice.textContent='Choose a node with the matching installed split and hardware covering this company reference. No data changed.';return;}
    if(!confirm('Apply '+p.label+' as intended company node-output launch design? This replaces the launch anchors and levels, selects linear MHz interpolation, disables extrapolation and test-point addback. Stored Station readings and amplifier targets are kept. This does not confirm measurement basis or field acceptance.'))return;
    Object.assign(state.setup,{companyTargetProfile:id,lowF:p.anchors[0][0],lowLevel:p.anchors[0][1],highF:p.anchors[1][0],highLevel:p.anchors[1][1],launchMode:'linear',extendLaunch:false,launchTestPoint:false,viewStart:p.domain[0],viewEnd:p.domain[1],referenceF:p.domain[0]});state.example=false;renderAll();return;
   }
   const button=e.target.closest('button[data-equipment-target]');if(button&&typeof EquipmentSetup!=='undefined'){
    state.equipmentSetup=state.equipmentSetup||{selected:'source',stations:{}};state.equipmentSetup.selected=button.dataset.equipmentTarget;EquipmentSetup.render();WorkflowUI.go('equipmentSetup');saveLocal();
   }
   if(e.target.closest('[data-launch-copy-job]')){const id=typeof JobsUI!=='undefined'?JobsUI.metadata().node:state.project?.meta?.node;if(id){ensureNode().asset=id;render();renderTraceChoices();saveLocal();}else $('message').textContent='No job node ID entered yet.';}
  });
  render();
 }
 return {init,render,status,validate,type,model,label,issues};
})();
