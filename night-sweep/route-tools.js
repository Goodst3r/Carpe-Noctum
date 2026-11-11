/* Field route tools. Optional records stay separate from the RF engine and job acceptance. */
function faceValue(d){const m=String(d?.label||'').match(/(\d+(?:\.\d+)?)\s*dB face/i);return m?Number(m[1]):null;}
function faceChoices(d){
 if(!d||d.custom||!d.tapPorts||!d.ports?.some(p=>p.role==='tap'))return [];
 return catalog.devices.filter(x=>!x.custom&&x.family===d.family&&x.tapPorts===d.tapPorts&&faceValue(x)!==null&&x.ports.some(p=>p.role==='tap')).sort((a,b)=>faceValue(a)-faceValue(b)||a.model.localeCompare(b.model));
}
function facePrediction(row,deviceId,f){
 const candidate=device(deviceId),port=candidate?.ports?.find(p=>p.role==='tap'),input=evaluate(f).results.find(x=>x.id===row.id)?.input.level??null;
 const passive=port?HFC.passiveAt(candidate,port,{...row,device:deviceId,terminal:!!candidate.terminal},f,state.setup.basis):null;
 return {input,loss:passive,level:input===null||passive===null?null:HFC.number(input-passive)};
}
function nextTapChoice(row){
 const d=device(row?.device),face=faceValue(d);
 return face===null?null:faceChoices(d).filter(x=>faceValue(x)<face).sort((a,b)=>faceValue(b)-faceValue(a))[0]||null;
}
function sameSpanNextTap(){
 if(state.rows.length>=200){$('message').textContent='Maximum 200 route points.';return null;}
 const previous=state.rows.at(-1),through=previous&&HFC.portsFor(device(previous.device),previous).find(p=>p.role==='through'),next=nextTapChoice(previous);
 if(!previous||!through||!next){$('message').textContent='Choose a tap with a through output and a lower published face to use Same span, next tap.';return null;}
 const row=freshRow(previous.id+'::'+through.id);Object.assign(row,{cable:previous.cable,length:previous.length,slack:previous.slack??0,customCable:previous.customCable||'',device:next.id,family:next.family,passiveType:passiveType(next),terminal:!!next.terminal});
 state.rows.push(row);state.example=false;selected.add(row.id+'::tap');renderAll();return row;
}
function dropSplitters(){return catalog.devices.filter(d=>!d.custom&&['split2','split3b','split3u'].includes(passiveType(d))&&d.ports?.some(p=>p.role==='output'));}
function dropCalculation(row,f){
 const config=row?.drop;if(!config)return null;
 const fail=message=>({frequency:f,input:null,cableLoss:null,outputs:[],warning:message});
 const length=HFC.number(config.length);if(length===null||length<0)return fail('Enter nonnegative RG-6 feet.');
 const d=device(row.device),port=HFC.portsFor(d,row).find(p=>p.id===config.port&&p.role==='tap');if(!port)return fail('Choose an existing tap output.');
 const source=evaluate(f),input=source.byKey.get(row.id+'::'+port.id)?.level??null;
 const cableRow={cable:'custom',length:config.length,customCable:config.customCable||''},cableLoss=HFC.cableAt(null,cableRow,f,state.setup.temperature);
 const after=input===null||cableLoss===null?null:HFC.number(input-cableLoss);
 let outputs=[],warning='Drop only · not mainline · not power-passing.';
 if(!config.splitter||config.splitter==='none')outputs=[{id:'ground',label:'Ground block',loss:0,level:after}];
 else if(config.splitter==='custom'){
  const table=HFC.parseTable(config.customLoss,2),loss=table.error?null:HFC.curveValue({min:table.rows[0][0],max:table.rows.at(-1)[0],points:table.rows},f);
  outputs=[{id:'custom',label:'Custom path → ground block',loss,level:after===null||loss===null?null:HFC.number(after-loss)}];
  if(table.error)warning+=' Enter an explicit MHz, dB loss table for the custom path.';
 }else{
  const splitter=dropSplitters().find(x=>x.id===config.splitter);if(!splitter)return fail('Choose an available catalog 2-way or 3-way splitter.');
  outputs=splitter.ports.filter(p=>p.role==='output').map(p=>{const loss=HFC.passiveAt(splitter,p,{},f,state.setup.basis);return {id:p.id,label:p.label+' → ground block',loss,level:after===null||loss===null?null:HFC.number(after-loss)};});
  if(splitter.acPassing===false||/CMC|AC.block/i.test(splitter.model+' '+splitter.family+' '+splitter.note))warning+=' AC-blocking / premises part; never a power-passing mainline replacement.';
 }
 if(length>0&&HFC.parseTable(config.customCable,2).error)warning+=' No RG-6 curve is built in: enter your measured/manufacturer table at the actual temperature.';
 if(input===null||cableLoss===null||outputs.some(o=>o.loss===null))warning+=' Missing or unsupported input/loss data leaves a dash; no extrapolation.';
 return {frequency:f,input,cableLoss,outputs,warning};
}
function routeToolFrequency(row){const f=HFC.number(row.toolFrequency??state.setup.lowF);return f!==null&&f>=5&&f<=1800?f:null;}
function routeToolCard(row){return [...document.querySelectorAll('#route [data-row]')].find(el=>el.dataset.row===row.id);}
function routeToolMarkChanged(){state.example=false;$('exampleFlag')?.classList.add('hidden');}
function renderCascade(){
 const strip=$('cascadeStrip');if(!strip)return;
 const known=new Map([['source','Launch']]),valid=new Map(),positions=new Map(state.rows.map((r,i)=>[r.id,i]));
 state.rows.forEach((r,i)=>{const earlier=new Set(['source']);state.rows.slice(0,i).forEach(x=>HFC.portsFor(device(x.device),x).forEach(p=>earlier.add(x.id+'::'+p.id)));valid.set(r.id,earlier.has(r.parent));HFC.portsFor(device(r.device),r).forEach(p=>known.set(r.id+'::'+p.id,name(r,i)+' · '+p.label));});
 const visited=new Set(),children=key=>state.rows.filter(r=>r.parent===key&&valid.get(r.id));
 function chain(first){
  let row=first,markup='';while(row&&!visited.has(row.id)){
   visited.add(row.id);const i=positions.get(row.id),ports=HFC.portsFor(device(row.device),row),bad=!valid.get(row.id),through=ports.find(p=>p.role==='through'),continuations=through?children(row.id+'::'+through.id):[],next=continuations[0],branchPorts=ports.filter(p=>p!==through);
   const branches=branchPorts.map(p=>({p,rows:children(row.id+'::'+p.id)}));if(continuations.length>1)branches.push({p:through,rows:continuations.slice(1)});
   markup+=`<div class="cascade-node"><div class="cascade-point${bad?' cascade-bad':''}"><button type="button" data-cascade-open="${esc(row.id)}">${esc(name(row,i))}</button><span>${bad?'Bad parent: ':'Fed from '}${esc(known.get(row.parent)||row.parent)}</span><small>${esc(device(row.device)?.model||'Unavailable part')}</small></div>${branches.length?`<div class="cascade-branches">${branches.map(({p,rows})=>`<div class="cascade-branch"><span>↓ ${esc(p.label)}</span>${rows.length?rows.map(child=>`<div class="cascade-chain">${chain(child)}</div>`).join(''):'<small>Open output</small>'}${row.drop&&row.drop.port===p.id?'<small>↳ RG-6 drop → ground block</small>':''}</div>`).join('')}</div>`:''}</div>`;
   if(next)markup+=`<div class="cascade-connection" aria-hidden="true">→<small>${esc(through.label)}</small></div>`;row=next;
  }return markup;
 }
 const starts=children('source'),first=starts[0],launchBranches=starts.slice(1);
 let markup=`<div class="cascade-chain"><div class="cascade-node"><div class="cascade-point cascade-launch"><button type="button" data-cascade-open="source">Launch</button><span>Prediction source</span></div>${launchBranches.length?`<div class="cascade-branches">${launchBranches.map(row=>`<div class="cascade-branch"><span>↓ Separate launch feed</span><div class="cascade-chain">${chain(row)}</div></div>`).join('')}</div>`:''}</div>${first?'<div class="cascade-connection" aria-hidden="true">→</div>'+chain(first):''}</div>`;
 for(const row of state.rows)if(!visited.has(row.id))markup+=`<div class="cascade-disconnected"><span class="danger">Disconnected route / bad parent</span><div class="cascade-chain">${chain(row)}</div></div>`;
 strip.innerHTML=markup;
}
function renderRouteTools(){
 renderCascade();
 state.rows.forEach((r,i)=>{
  const card=routeToolCard(r);if(!card)return;const d=device(r.device),choices=faceChoices(d),tapPorts=HFC.portsFor(d,r).filter(p=>p.role==='tap'),f=routeToolFrequency(r);
  card.insertAdjacentHTML('beforeend',`<div class="route-toolbox"><label class="tool-frequency">Compare / arithmetic frequency (MHz)<input type="number" min="5" max="1800" step="any" data-tool-frequency value="${esc(r.toolFrequency??state.setup.lowF)}"></label>${choices.length?`<div class="face-picker"><h3>Published faces · ${esc(d.tapPorts)} ports</h3><p class="note tight">${esc(d.family)} · same published family and port count. Choosing a face swaps the catalog part.</p><p class="face-input note"></p><div class="face-choices">${choices.map(x=>`<button type="button" data-face-choice="${esc(x.id)}"${x.id===r.device?' aria-pressed="true"':' aria-pressed="false"'}><strong>${esc(faceValue(x))} dB${x.terminal?' · terminal':''}</strong><span data-face-result="${esc(x.id)}">—</span><small>${esc(x.model)}</small></button>`).join('')}</div></div>`:''}${i<state.rows.length-1?'<button type="button" class="apply-span-length" data-apply-length>Apply this length to following spans</button>':''}${tapPorts.length?`<details class="drop-tool"${r.drop?' open':''}><summary>RG-6 drop off a tap port</summary><p class="note">Drop only · not mainline · not power-passing. Ground-block levels are predictions.</p>${r.drop?`<div class="drop-fields"><label>Tap output<select data-drop-field="port">${tapPorts.map(p=>option(p.id,p.label,r.drop.port)).join('')}</select></label><label>RG-6 feet<input type="number" min="0" step="any" data-drop-field="length" value="${esc(r.drop.length)}"></label><label>Then splitter<select data-drop-field="splitter">${option('none','No splitter',r.drop.splitter)}${dropSplitters().map(x=>option(x.id,x.model,r.drop.splitter)).join('')}${option('custom','Custom loss table',r.drop.splitter)}</select></label><label class="drop-cable-table">RG-6: MHz, dB / 100 ft<textarea data-drop-field="customCable" placeholder="Enter verified RG-6 loss points">${esc(r.drop.customCable||'')}</textarea><span class="note">No RG-6 curve is in this catalog. Enter your measured or manufacturer values at the actual temperature. No second temperature correction.</span></label><label class="drop-custom-loss${r.drop.splitter==='custom'?'':' hidden'}">Custom path: MHz, loss dB<textarea data-drop-field="customLoss" placeholder="Enter two or more verified loss points">${esc(r.drop.customLoss||'')}</textarea></label></div><div class="drop-results" aria-live="polite"></div><button type="button" class="danger" data-drop-remove>Remove drop</button>`:'<button type="button" data-drop-add>+ Plan a drop</button>'}</details>`:''}<details class="point-as-built"${r.asBuiltNote?' open':''}><summary>As-built / map variance</summary><p class="note">Technician note for this point and its incoming span: map discrepancy, actual cable, face or length. This note is separate from RF predictions and measured acceptance.</p><label>As-built / map variance note<textarea data-field="asBuiltNote" maxlength="2000" placeholder="Record what differs from the map…">${esc(r.asBuiltNote??'')}</textarea></label></details><details class="point-arithmetic"><summary>Show the arithmetic</summary><div class="arithmetic-results"></div></details></div>`);
 });
 refreshRouteTools();
}
function arithmeticMarkup(row,f){
 if(f===null)return '<p class="note">Enter a frequency from 5 to 1800 MHz. A dash means missing.</p>';
 const result=evaluate(f),point=result.results.find(x=>x.id===row.id),cable=catalog.cables.find(c=>c.id===row.cable),parent=result.byKey.get(row.parent)?.level??null,length=HFC.spanLength(row),temp=HFC.number(state.setup.temperature),factor=row.cable==='custom'?1:temp===null?null:1+0.001*(temp-68);
 let rate=null;if(row.cable==='custom'){const t=HFC.parseTable(row.customCable,2);if(!t.error)rate=HFC.curveValue({min:t.rows[0][0],max:t.rows.at(-1)[0],points:t.rows},f,'sqrt');}else rate=HFC.curveValue(cable?.curve,f,'sqrt');
 const d=device(row.device),fixed=x=>x===null||!Number.isFinite(x)?'—':x.toFixed(4);
 return `<p class="note">Predictions at ${esc(f)} MHz · upstream ${esc(row.parent)} = <b>${fmt(parent)} dBmV</b></p><p class="arithmetic-line">Cable including slack: ${fixed(rate)} dB/100 ft × ${length===null?'—':esc(length)}/100 × ${fixed(factor)} = <b>${fmt(point?.cableLoss??null)} dB</b></p><p class="note">${row.cable==='custom'?'Custom cable table already at measured temperature; factor 1, no repeat correction.':`√frequency interpolation; temperature factor = 1 + 0.001 × (${temp===null?'—':esc(temp)}°F − 68).`}</p><p>Predicted equipment input: ${fmt(parent)} − ${fmt(point?.cableLoss??null)} = <b>${fmt(point?.input.level??null)} dBmV</b></p>${(point?.outputs||[]).map(o=>{const p=HFC.portsFor(d,row).find(p=>p.id===o.id),curve=p&&HFC.selectedCurve(p,state.setup.basis),fallback=state.setup.basis==='nominal'&&!p?.nominal&&!!p?.maximum;if(d?.active)return `<p class="arithmetic-line">Predicted ${esc(o.label)}: ${fmt(point.input.level)} + ${fmt(HFC.activeGainAt(d,row,f))} gain − ${fmt(HFC.number(row.outputLoss??0))} output loss = <b>${fmt(o.level)} dBmV</b><span class="note"> · Entered operating gain; output capability requires installed limits.</span></p>`;return `<p class="arithmetic-line">Predicted ${esc(o.label)}: ${fmt(point.input.level)} − ${fmt(o.passiveLoss)} = <b>${fmt(o.level)} dBmV</b><span class="note"> · ${d?.custom?'Explicit custom table':d?.id==='none'?'Cable only, zero passive loss':fallback?'Nominal unavailable: maximum fallback':esc(curve?.basis||'No published curve')}</span></p>`;}).join('')}${point?.orphan?'<p class="danger">Bad parent: select an existing earlier output.</p>':''}`;
}
function refreshRouteTools(){
 renderCascade();
 const previous=state.rows.at(-1),next=nextTapChoice(previous),same=$('sameSpanNext');if(same){same.disabled=!previous||!next||!HFC.portsFor(device(previous.device),previous).some(p=>p.role==='through')||state.rows.length>=200;same.title=next?'Same cable and feet; next face '+faceValue(next)+' dB':'A through output and lower published face are required.';}
 state.rows.forEach(row=>{
  const card=routeToolCard(row);if(!card)return;const f=routeToolFrequency(row),box=card.querySelector('.route-toolbox');if(!box)return;
  const input=box.querySelector('.face-input');if(input)input.textContent=`Predicted input ${f===null?'—':f} MHz: ${fmt(f===null?null:evaluate(f).results.find(x=>x.id===row.id)?.input.level??null)} dBmV`;
  box.querySelectorAll('[data-face-result]').forEach(el=>{const x=f===null?null:facePrediction(row,el.dataset.faceResult,f);el.textContent=`Predicted tap ${fmt(x?.level??null)} dBmV`;});
  const math=box.querySelector('.arithmetic-results');if(math)math.innerHTML=arithmeticMarkup(row,f);
  const drop=box.querySelector('.drop-results');if(drop){const x=f===null?null:dropCalculation(row,f);drop.innerHTML=x?`<p class="note">Predicted at ${esc(f)} MHz: tap ${fmt(x.input)} dBmV − RG-6 ${fmt(x.cableLoss)} dB</p>${x.outputs.map(o=>`<p>${esc(o.label)}: <strong class="drop-number">${fmt(o.level)} dBmV</strong> <span class="note">prediction · splitter loss ${fmt(o.loss)} dB</span></p>`).join('')}<p class="note${/AC.blocking/.test(x.warning)?' danger':''}">${esc(x.warning)}</p>`:'<p class="note">Enter a frequency from 5 to 1800 MHz.</p>';}
 });
}
let routeToolsInitialized=false;
function initRouteTools(){
 if(routeToolsInitialized)return;routeToolsInitialized=true;
 const routePanel=$('routePanel'),route=$('route');
 route.insertAdjacentHTML('beforebegin','<div class="cascade-heading"><h3>Route cascade</h3><p class="note tight">Route drawing · tap a point to open its card. Arrows list the actual feed; a bad parent stays disconnected.</p></div><div id="cascadeStrip" class="cascade-strip" aria-label="Route cascade"></div>');
 const add=$('add'),same=document.createElement('button');same.id='sameSpanNext';same.type='button';same.textContent='+ Append after last tap';same.onclick=sameSpanNextTap;add.insertAdjacentElement('afterend',same);
 const baseRender=renderRoute;renderRoute=function(){baseRender();renderRouteTools();};
 const baseRefresh=refreshResults;refreshResults=function(){baseRefresh();refreshRouteTools();};
 routePanel.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.cascadeOpen){const id=t.dataset.cascadeOpen;if(id==='source'){showTab('setup');$('setup').scrollIntoView?.({behavior:'smooth',block:'start'});}else{const row=state.rows.find(r=>r.id===id),card=row&&routeToolCard(row);card?.scrollIntoView?.({behavior:'smooth',block:'start'});card?.querySelector('input')?.focus({preventScroll:true});}return;}
  const card=t.closest('[data-row]'),row=card&&state.rows.find(r=>r.id===card.dataset.row);if(!row)return;
  if(t.dataset.faceChoice){const d=faceChoices(device(row.device)).find(x=>x.id===t.dataset.faceChoice);if(!d)return;row.device=d.id;row.family=d.family;row.passiveType=passiveType(d);row.terminal=!!d.terminal;routeToolMarkChanged();renderAll();}
  if(t.hasAttribute('data-apply-length')){const i=state.rows.indexOf(row),following=state.rows.slice(i+1),length=HFC.number(row.length);if(length===null||length<0){$('message').textContent='Enter nonnegative feet before applying this length.';return;}if(following.length&&confirm(`Apply ${length} ft to all ${following.length} following spans?`)){following.forEach(r=>r.length=row.length);routeToolMarkChanged();renderAll();}}
  if(t.hasAttribute('data-drop-add')){const port=HFC.portsFor(device(row.device),row).find(p=>p.role==='tap');if(!port)return;row.drop={port:port.id,length:'',customCable:'',splitter:'none',customLoss:''};routeToolMarkChanged();renderAll();}
  if(t.hasAttribute('data-drop-remove')){delete row.drop;routeToolMarkChanged();renderAll();}
 });
 function edited(e){const t=e.target,card=t.closest('[data-row]'),row=card&&state.rows.find(r=>r.id===card.dataset.row);if(!row)return;if(t.hasAttribute('data-tool-frequency')){row.toolFrequency=t.value;routeToolMarkChanged();refreshRouteTools();saveLocal();}if(t.dataset.dropField){if(!row.drop)return;row.drop[t.dataset.dropField]=t.value;routeToolMarkChanged();const loss=card.querySelector('.drop-custom-loss');if(loss)loss.classList.toggle('hidden',row.drop.splitter!=='custom');refreshRouteTools();saveLocal();}}
 route.addEventListener('input',e=>{if(e.target.tagName!=='SELECT')edited(e);});route.addEventListener('change',e=>{if(e.target.tagName==='SELECT')edited(e);});
}
