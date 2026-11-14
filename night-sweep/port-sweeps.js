/* Complete raw ONX sweeps, bound to an explicitly named physical node port. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PortSweeps=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const limits=Object.freeze({ports:32,samples:10000});
 const n=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const port=x=>typeof x==='string'&&x.trim()===x&&x.length>0&&x.length<=64&&!/[\u0000-\u001f\u007f]/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
 function prepare(parsed,context={}){
  if(parsed?.status!=='parsed'||!['dBmV','dB'].includes(parsed.series?.unit))throw Error('Choose one decoded sweep with explicit dBmV or dB units. Previous port sweep retained.');
  const {split,direction,stage,plane,basis}=context;
  if(!['42','204'].includes(split)||!['forward','reverse'].includes(direction)||!['Before','After','Reference'].includes(stage))throw Error('Choose the split, direction and stage for this physical port.');
  if(!['unknown','port','tp'].includes(plane)||!['unknown','sc-qam','ofdm-plc','relative'].includes(basis))throw Error('Choose the measurement plane and power basis, or Unknown.');
  if(parsed.series.unit==='dB'&&!['relative','unknown'].includes(basis)||parsed.series.unit==='dBmV'&&basis==='relative')throw Error('Sweep units do not match the declared power basis.');
  const bw=n(context.bandwidthMHz);if(context.bandwidthMHz!==undefined&&context.bandwidthMHz!==null&&String(context.bandwidthMHz).trim()!==''&&(bw===null||bw<=0||bw>1800))throw Error('Bandwidth must be positive MHz or blank for Unknown.');
  if(typeof context.evidenceId!=='string'||!context.evidenceId||context.evidenceId.length>200||typeof context.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(context.sha256))throw Error('A verified original evidence ID and SHA-256 are required.');
  const supplied=parsed.series.points;
  if(!Array.isArray(supplied)||!supplied.length||supplied.length>limits.samples)throw Error('Sweep must contain 1–10,000 complete points.');
  const seen=new Set(),points=supplied.map(p=>{
   if(!Array.isArray(p)||p.length!==2||typeof p[0]!=='number'||typeof p[1]!=='number'||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[1])>1000000)throw Error('Every sweep point must have a finite frequency and reading; blank is not zero.');
   const [f,v]=p,min=direction==='forward'?(split==='42'?54:258):5,max=direction==='forward'?1800:Number(split);
   if(f<min||f>max||seen.has(f))throw Error('Sweep has a duplicate frequency or a point outside the selected split and direction.');
   seen.add(f);return [f,v];
  }).sort((a,b)=>a[0]-b[0]);
  return {schema:1,stationIdentity:String(context.stationIdentity||'source').slice(0,200),split,direction,stage,plane,basis,bandwidthMHz:bw,unit:parsed.series.unit,points,evidenceId:context.evidenceId,sha256:context.sha256.toLowerCase()};
 }
 function replace(owner,portId,parsed,context){
  if(!port(portId))throw Error('Enter the exact physical port ID (1–64 characters).');
  const record=prepare(parsed,context),previous=owner?.portSweeps||{};
  if(!plain(previous))throw Error('Invalid saved port sweep collection.');
  if(!Object.hasOwn(previous,portId)&&Object.keys(previous).length>=limits.ports)throw Error('This job already contains 32 physical port records.');
  return {...previous,[portId]:record};
 }
 function validate(owner){
  const errors=[],ports=owner?.portSweeps;if(ports===undefined)return errors;
  if(!plain(ports)||Object.keys(ports).length>limits.ports)return ['Invalid port sweep collection.'];
  for(const [id,r] of Object.entries(ports))try{if(!port(id)||!plain(r)||r.schema!==1)throw Error('Invalid physical port record.');prepare({status:'parsed',series:{unit:r.unit,points:r.points}},r);}catch(e){errors.push(id+': '+e.message);}
  return errors;
 }
 function sample(record,frequency){const f=n(frequency),point=f===null?null:record?.points?.find(p=>p[0]===f);return {value:point?.[1]??null,unit:record?.unit||null,basis:record?.basis||'unknown',bandwidthMHz:record?.bandwidthMHz??null,plane:record?.plane||'unknown'};}
 return Object.freeze({limits,prepare,replace,validate,sample});
});

function initPortSweeps(){
 const host=document.createElement('details');host.id='portSweepsPanel';host.innerHTML='<summary>ONX sweep by physical node port</summary><p class="note">Retain every decoded point and its verified original. A valid replacement updates only the named port. Observed levels are measurements; they do not set company targets.</p><div class="fields"><label>Exact physical node port<input data-port="id" maxlength="64" placeholder="Port label on installed node"></label><label>Split<select data-port="split"><option value="">Choose split</option><option value="42">42/54 MHz</option><option value="204">204/258 MHz</option></select></label><label>Direction<select data-port="direction"><option value="forward">Forward</option><option value="reverse">Return</option></select></label><label>Stage<select data-port="stage"><option>Before</option><option>After</option><option>Reference</option></select></label><label>Reading plane<select data-port="plane"><option value="unknown">Unknown</option><option value="port">Port</option><option value="tp">Raw test point</option></select></label><label>Power basis<select data-port="basis"><option value="unknown">Unknown</option><option value="sc-qam">SC-QAM channel power</option><option value="ofdm-plc">OFDM PLC</option><option value="relative">Relative response</option></select></label><label>Measurement bandwidth (MHz)<input type="number" step="any" min="0" data-port="bandwidthMHz" placeholder="Unknown"></label></div><label class="filelabel">Import sweep for this port<input type="file" data-port-file accept=".json,.csv,.gz,.zip"></label><p data-port-status role="status" aria-live="polite"></p><div data-port-records></div>';
 $('mapLaunchSummary').after(host);
 const identity=()=>JSON.stringify([state.setup?.stationIdentity||'',state.setup?.sourceModel||'',state.setup?.sourceAsset||'',state.node?.asset||'']);
 host.addEventListener('change',async e=>{
  if(!e.target.hasAttribute('data-port-file'))return;const file=e.target.files?.[0];if(!file)return;
  const owner=state,source=identity(),values=Object.fromEntries([...host.querySelectorAll('[data-port]')].map(el=>[el.dataset.port,el.value])),status=host.querySelector('[data-port-status]');e.target.disabled=true;
  try{
   if(!values.id||!values.split)throw Error('Enter a physical node port and choose its split first.');
   const files=await EvidenceUI.importFiles([file],{kind:'Sweep',stage:values.stage,asset:values.id,notes:'Physical node port sweep'});
   if(owner!==state||identity()!==source)throw Error('Job or node changed during import; previous port data retained.');
   const meta=files[0],verified=await EvidenceUI.verifiedParse(meta.id);
   if(owner!==state||identity()!==source)throw Error('Job or node changed during verification; previous port data retained.');
   owner.portSweeps=PortSweeps.replace(owner,values.id,verified.parse,{...values,evidenceId:meta.id,sha256:meta.sha256,stationIdentity:source});saveLocal();refreshPortSweeps();status.textContent='Saved '+owner.portSweeps[values.id].points.length+' points for port '+values.id+'. Other ports retained.';
  }catch(error){status.textContent=error.message;}finally{e.target.disabled=false;e.target.value='';}
 });
 refreshPortSweeps();
}
function refreshPortSweeps(){
 if(!state)return;
 const el=$('portSweepsPanel')?.querySelector('[data-port-records]');if(!el)return;
 el.innerHTML=Object.entries(state.portSweeps||{}).map(([port,r])=>`<details><summary>Port ${esc(port)} · ${r.points?.length||0} points · ${esc(r.stage)} · ${esc(r.split)}/${r.split==='42'?'54':'258'} MHz</summary><p>${esc(r.direction)} · ${esc(r.unit)} · ${esc(r.basis)} · bandwidth ${esc(r.bandwidthMHz??'Unknown')} MHz · plane ${esc(r.plane)}</p><p class="note">All points are retained. Raw levels have no correction or company acceptance applied. ${r.stationIdentity!==JSON.stringify([state.setup?.stationIdentity||'',state.setup?.sourceModel||'',state.setup?.sourceAsset||'',state.node?.asset||''])?'Historical node identity; verify before comparison.':''}</p><button type="button" data-port-original="${esc(r.evidenceId)}">Save original</button></details>`).join('')||'<p class="note">No port sweeps saved.</p>';
 el.onclick=e=>{const id=e.target.dataset.portOriginal;if(id)EvidenceUI.downloadOriginal(id).catch(err=>{$('message').textContent=err.message;});};
}
