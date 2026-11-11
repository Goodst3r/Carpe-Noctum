/* NightSweep node records: manufacturer capability is separate from installed operation. */
const NodeTools=(()=>{
 const defaults=()=>({model:'',band:'',asset:'',port:'',module:'',operatingUpper:'',notes:''});
 const number=x=>!['string','number'].includes(typeof x)||String(x).trim()===''?null:Number.isFinite(Number(x))?Number(x):null;
 function profile(n,cat){return (cat.nodeProfiles||[]).find(p=>p.id===n?.model)||null;}
 function band(n,cat){const p=profile(n,cat),i=number(n?.band);return p&&Number.isInteger(i)?p.bands[i]||null:null;}
 function issues(n,cat){
  const p=profile(n,cat),b=band(n,cat);if(!p)return ['Choose the installed node model.'];if(!b)return ['Choose the installed split / RF band.'];
  const upper=number(n.operatingUpper);if(upper===null)return ['Enter the operating upper frequency for this installation.'];
  const errors=[];if(upper<b.forwardFloor)errors.push('Operating upper frequency is below the forward passband.');if(upper>b.equipmentUpper)errors.push('Operating upper frequency exceeds this hardware profile.');
  return errors;
 }
 function choice(model,cat){const p=(cat.nodeProfiles||[]).find(x=>x.id===model);if(!p)return {model:'',band:'',operatingUpper:''};const i=model==='vecima-en9000'?p.bands.findIndex(x=>x.returnCeiling===204):0,b=p.bands[i];return {model,band:String(i),operatingUpper:model==='vecima-en9000'?1218:b.equipmentUpper};}
 function patch(n,cat){const b=band(n,cat);if(!b)throw Error('Choose a node model and split first.');return {equipmentUpper:b.equipmentUpper,forwardFloor:b.forwardFloor,returnCeiling:b.returnCeiling,approved:'No'};}
 return {defaults,number,profile,band,issues,choice,patch};
})();
function validateNode(n){
 if(n===undefined)return;
 if(!n||typeof n!=='object'||Array.isArray(n))throw Error('Invalid node record.');
 const allowed=Object.keys(NodeTools.defaults());
 if(Object.keys(n).some(k=>!allowed.includes(k)))throw Error('Unsupported node record field.');
 for(const [k,v] of Object.entries(n))if((typeof v!=='string'&&typeof v!=='number')||(typeof v==='number'&&!Number.isFinite(v))||String(v).length>(k==='notes'?10000:500))throw Error('Invalid node '+k+'.');
 if(n.model!==undefined&&n.model!==''&&!NodeTools.profile(n,catalog))throw Error('Unknown node model.');
 if(n.band!==undefined&&n.band!==''&&!NodeTools.band(n,catalog))throw Error('Invalid node split / RF band.');
 if(n.model&&!NodeTools.band(n,catalog))throw Error('Node model requires a valid split / RF band.');
 if(!n.model&&n.band!==undefined&&n.band!=='')throw Error('Node split requires a node model.');
 // Leave incomplete or out-of-band operating inputs visible for correction on reload.
}
function ensureNode(){if(!state.node)state.node=NodeTools.defaults();else state.node={...NodeTools.defaults(),...state.node};return state.node;}
function nodeField(key,label,type='text'){const n=ensureNode();return `<label${type==='textarea'?' style="grid-column:1/-1"':''}>${esc(label)}${type==='textarea'?`<textarea data-node-field="${key}" maxlength="10000">${esc(n[key])}</textarea>`:`<input data-node-field="${key}" type="${type}"${type==='number'?' min="5" max="1800" step="any"':' maxlength="500"'} value="${esc(n[key])}">`}</label>`;}
function renderNodeSummary(){
 const el=$('nodeReference');if(!el)return;const n=ensureNode(),p=NodeTools.profile(n,catalog),b=NodeTools.band(n,catalog),issues=NodeTools.issues(n,catalog);
 if(!p||!b){el.innerHTML='<p class="note">Select the installed model and split. Source ratings are references; enter the actual operating band and module details.</p>';return;}
 const upper=NodeTools.number(n.operatingUpper),source=p.source_url;
 el.innerHTML=`<div class="status${issues.length?' warning':''}" role="status">${issues.length?issues.map(esc).join(' '):`Operating upper ${esc(upper)} MHz is within the selected hardware band. Confirm live spectrum separately.`}</div><div class="tablewrap"><table class="small"><tbody><tr><th>Hardware forward band</th><td>${esc(b.forwardFloor)}–${esc(b.equipmentUpper)} MHz</td></tr><tr><th>Hardware return band</th><td>${esc(b.returnLow)}–${esc(b.returnCeiling)} MHz</td></tr><tr><th>Entered operating upper</th><td>${upper===null?'Not entered':esc(upper)+' MHz'}</td></tr><tr><th>RF test-point reference</th><td>−${esc(p.test_point_loss_db)} dB ±${esc(p.test_point_tolerance_db)} dB</td></tr></tbody></table></div><p class="note">Check the actual test port and meter compensation. This reference does not add correction to your measurements.</p><p class="note">${esc(p.notes||'')}</p><p class="note">${equipmentSourceLink(source,'Node reference'+(p.source_revision?' · '+p.source_revision:''))}</p><p class="note">Choose this node’s exact optical / RPD configuration in the Power tab. EN9000 requires an installed or measured load; maximum ratings are not a typical load.</p>`;
}
function renderNodes(){
 const panel=$('projectPanel');if(!panel)return;let el=$('nodePanel');if(!el){el=document.createElement('details');el.id='nodePanel';el.open=true;panel.prepend(el);}
 const n=ensureNode(),p=NodeTools.profile(n,catalog),selected=state.project?.selectedProfile||'';
 el.innerHTML=`<summary>Node equipment &amp; operating band</summary><p class="note">Record the installed node and RF modules for this job. Hardware capability, operating band and measured results remain distinct.</p><div class="fields"><label>Node model<select data-node-field="model">${option('','Choose installed node…',n.model)}${(catalog.nodeProfiles||[]).map(x=>option(x.id,x.label,n.model)).join('')}</select></label><label>Installed split / RF band<select data-node-field="band"${p?'':' disabled'}>${p?p.bands.map((b,i)=>option(i,b.label,n.band)).join(''):option('','Choose model first','')}</select></label>${nodeField('asset','Node asset / location ID')}${nodeField('port','RF port / leg')}${nodeField('module','Installed module / configuration')}${nodeField('operatingUpper','Operating upper MHz','number')}${nodeField('notes','Node notes','textarea')}</div><div id="nodeReference"></div><div class="toolbar"><button type="button" data-node-copy${p?'':' disabled'}>Copy hardware band limits to profile${selected?' '+esc(selected)+' MHz':''}</button></div><p class="note">Copy updates only equipment upper, forward floor and return ceiling in the selected project profile, then marks its criteria unapproved. Enter spectrum limits and acceptance criteria in that profile.</p><div id="nodeCopyStatus" class="note" role="status"></div>`;
 renderNodeSummary();
}
function copyNodeBand(){
 const n=ensureNode(),b=NodeTools.band(n,catalog);if(!b)return;
 const project=ensureProject(),id=project.selectedProfile,p=projectProfile(id),patch=NodeTools.patch(n,catalog);
 if(!confirm(`Update project profile ${id} MHz?\nEquipment upper: ${p.equipmentUpper??'blank'} → ${patch.equipmentUpper} MHz\nForward floor: ${p.forwardFloor??'blank'} → ${patch.forwardFloor} MHz\nReturn ceiling: ${p.returnCeiling??'blank'} → ${patch.returnCeiling} MHz\nCriteria approved: No\nOther profile values and measurements stay as entered.`))return;
 Object.assign(p,patch);renderProjects();renderNodes();saveLocal();
 const message=`Copied hardware limits to ${id} MHz profile: forward ${b.forwardFloor}–${b.equipmentUpper} MHz; return ceiling ${b.returnCeiling} MHz. Criteria are unapproved. Review operating and available spectrum limits.`;
 if($('nodeCopyStatus'))$('nodeCopyStatus').textContent=message;
 if($('message'))$('message').textContent=message;
}
function initNodes(){
 const panel=$('projectPanel');if(!panel||panel.dataset.nodesBound)return;panel.dataset.nodesBound='true';
 panel.addEventListener('input',e=>{const t=e.target,key=t.dataset.nodeField;if(!key||t.tagName==='SELECT')return;ensureNode()[key]=t.value;renderNodeSummary();saveLocal();});
 panel.addEventListener('change',e=>{const t=e.target,key=t.dataset.nodeField;if(!key||t.tagName!=='SELECT')return;const n=ensureNode();
  if(key==='model')Object.assign(n,NodeTools.choice(t.value,catalog));
  else if(key==='band'){n.band=t.value;const b=NodeTools.band(n,catalog);if(b){const upper=NodeTools.number(n.operatingUpper);if(upper===null||upper<b.forwardFloor||upper>b.equipmentUpper)n.operatingUpper=b.equipmentUpper;}}
  renderNodes();saveLocal();
 });
 panel.addEventListener('click',e=>{if(e.target.closest('[data-node-copy]'))copyNodeBand();});
}
