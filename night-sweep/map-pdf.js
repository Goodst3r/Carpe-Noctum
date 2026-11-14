/* Offline PDF overlays. Originals are immutable and reselected/verified for each session. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.NightSweepMapPDF=api;})(typeof globalThis!=='undefined'?globalThis:this,root=>{
 'use strict';
 const n=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const value=x=>n(x)===null?'Unknown':Number(x).toFixed(1);
 const wrap=text=>{const out=[];let rest=String(text);while(rest.length>44){let at=rest.lastIndexOf(' ',44);if(at<8)at=44;out.push(rest.slice(0,at));rest=rest.slice(at).trimStart();}out.push(rest);return out;};
 function geometry(source,page){
  const found=source.pages?.find(p=>p.number===page),g=found?.pdf,m=g?.viewportTransform;
  if(!g||!Array.isArray(m)||m.length!==6||m.some(x=>typeof x!=='number'||!Number.isFinite(x))||Math.abs(m[0]*m[3]-m[1]*m[2])<1e-9||!(g.width>0&&g.height>0)||g.width*g.height>16000000)throw Error('PDF page geometry is unavailable or invalid. Reimport the original map.');
  return g;
 }
 function validate(owner){
  const problems=[],placements=owner?.mapTombstones;if(placements===undefined)return problems;
  if(!placements||typeof placements!=='object'||Array.isArray(placements)||Object.keys(placements).length>201)return ['Invalid PDF tombstone placements.'];
  for(const p of Object.values(placements))if(!p||!/^[a-f0-9]{64}$/i.test(p.sourceId)||n(p.x)===null||n(p.y)===null||p.x<0||p.x>1||p.y<0||p.y>1)problems.push('PDF tombstone positions must be finite fractions of their original page.');
  return problems;
 }
 function linesFor(row){
  const w=row.workbench||{},lines=['NAME: '+(row.mapImport?.exactName||row.name||'Unknown'),'TAG: '+(row.mapImport?.tag||'Unknown'),row.terminal||row.mapImport?.kind==='terminal'?'End of line':'Active station'];
  const legs=Array.from(new Set(['main',...Object.keys(w.records||{}),...Object.keys(w.legGain||{})]));
  for(const leg of legs){const target=leg==='main'?row:w.legGain?.[leg]||{};lines.push(leg+' target L/H: '+value(target.targetLow)+' / '+value(target.targetHigh)+' dBmV');
   for(const stage of ['before','after']){const r=w.records?.[leg]?.[stage]||{},lo=r.low||{},hi=r.high||{},il=w.commonInput?w.shared?.[stage]?.low||{}:lo,ih=w.commonInput?w.shared?.[stage]?.high||{}:hi;lines.push(leg+' '+stage+' raw IN '+value(il.input)+'/'+value(ih.input)+' OUT '+value(lo.output)+'/'+value(hi.output)+' dBmV');}
  }
  for(const [slot,p] of Object.entries(w.pads||{}))if(n(p.installed)!==null||n(p.changed)!==null)lines.push(slot+': '+value(p.installed)+' -> '+value(p.changed)+' dB');
  lines.push('Raw readings; no RF acceptance.');return lines.flatMap(wrap);
 }
 function plan(owner){
  const source=owner?.mapImportSource;
  if(!source||source.type!=='application/pdf'||!/^[a-f0-9]{64}$/i.test(source.id))throw Error('Update PDF map requires an imported PDF original. Images remain route-draft inputs only.');
  const problems=validate(owner);if(problems.length)throw Error(problems.join(' '));
  const tombstones=[],skipped=[],seen=new Set(),add=(row,m,launch=false)=>{
   const eligible=m&&m.sourceId===source.id&&m.positionConfirmed===true&&!['absent','proposed'].includes(m.status)&&(launch?m.confirmed===true:m.status==='installed'&&(m.kind==='terminal'||row.terminal===true||m.modelConfirmed===true));
   if(!eligible||!launch&&m.kind!=='active'&&m.kind!=='terminal'&&!row.terminal){skipped.push({rowId:row.id||'source',reason:'Symbol, installed model or source is unconfirmed.'});return;}
   const page=Number(m.page),symbol=String(m.symbolId||'');if(!Number.isInteger(page)||page<1||page>8||!symbol||symbol.length>200||n(m.position?.x)===null||n(m.position?.y)===null){skipped.push({rowId:row.id||'source',reason:'Confirmed diagram position is missing.'});return;}
   const key=source.id+':'+page+':'+symbol;if(seen.has(key))throw Error('Two route points refer to the same physical map symbol. Resolve the duplicate before export.');seen.add(key);
   const g=geometry(source,page),scale=Math.hypot(g.viewportTransform[0],g.viewportTransform[1]),lines=linesFor(row),width=210*scale,lineHeight=8.5*scale,height=(lines.length*8.5+16)*scale;
   if(width>g.width-12*scale||height>g.height-12*scale)throw Error('This grouped tombstone does not fit on its diagram page. Reduce the grouped record or use a larger source page.');
   const saved=owner.mapTombstones?.[key],defaultX=m.position.x+width+18*scale<=g.width?m.position.x+12*scale:m.position.x-width-12*scale;
   const x=saved?.sourceId===source.id?saved.x*g.width:Math.max(6*scale,Math.min(g.width-width-6*scale,defaultX)),y=saved?.sourceId===source.id?saved.y*g.height:Math.max(6*scale,Math.min(g.height-height-6*scale,m.position.y-height/2));
   if(x<0||y<0||x+width>g.width||y+height>g.height)throw Error('A tombstone position extends beyond its diagram page. Reposition it before export.');
   tombstones.push({key,page,symbolId:symbol,name:m.exactName||row.name||'',x,y,width,height,lineHeight,fontSize:6.5*scale,lines,anchor:{x:m.position.x,y:m.position.y},geometry:g});
  };
  if(owner.mapLaunch)add({id:'source',name:owner.mapLaunch.name,mapImport:owner.mapLaunch,workbench:{}},owner.mapLaunch,true);
  for(const row of owner.rows||[])if(row.mapImport)add(row,row.mapImport);
  return {sourceId:source.id,tombstones,skipped};
 }
 async function verifyOriginal(input,owner){
  const source=owner?.mapImportSource,bytes=new Uint8Array(input);
  if(!source||source.type!=='application/pdf'||bytes.length!==source.bytes||bytes.length>20*1048576)throw Error('Choose the same PDF original recorded with this job.');
  const digest=await root.crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==source.id)throw Error('Original PDF checksum does not match this job. Re-select the verified original; source and records were retained.');return bytes;
 }
 let writerPromise;
 async function writer(){
  if(typeof module==='object'&&module.exports)return require('./vendor/map/pdf-lib.js');
  if(root.PDFLib)return root.PDFLib;
  if(!writerPromise)writerPromise=new Promise((resolve,reject)=>{try{const packed=JSON.parse(document.getElementById('map-import-assets').textContent)['pdf-lib.js'];if(!packed)throw Error('Offline PDF writer is missing.');const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'})),script=document.createElement('script');script.src=url;script.onload=()=>{URL.revokeObjectURL(url);resolve(root.PDFLib);};script.onerror=()=>{URL.revokeObjectURL(url);writerPromise=null;reject(Error('Offline PDF writer could not load.'));};document.head.append(script);}catch(e){writerPromise=null;reject(e);}});
  return writerPromise;
 }
 async function exportPDF(input,owner,options={}){
  const snapshot=JSON.parse(JSON.stringify(owner)),check=()=>{if(options.isCurrent&&!options.isCurrent())throw Error('Job changed during PDF update. Select the original in the intended job.');};check();
  const original=await verifyOriginal(input,snapshot);check();const overlay=plan(snapshot);if(!overlay.tombstones.length)throw Error('Confirm at least one installed active or end-of-line symbol on the PDF diagram.');
  const lib=await writer();check();const pdf=await lib.PDFDocument.load(original,{updateMetadata:false,throwOnInvalidObject:true});check();
  const font=await pdf.embedFont(lib.StandardFonts.Helvetica);check();
  for(const t of overlay.tombstones){
   const page=pdf.getPage(t.page-1);if(!page)throw Error('Diagram page does not exist in the verified original.');
   const [a,b,c,d,e,f]=t.geometry.viewportTransform,det=a*d-b*c,ia=d/det,ib=-b/det,ic=-c/det,id=a/det,ie=(c*f-d*e)/det,iff=(b*e-a*f)/det,H=t.geometry.height;
   // PDF.js viewport includes CropBox, rotation, scale and UserUnit. Invert it
   // and use an upright bottom-left display system for the overlay only.
   page.pushOperators(lib.pushGraphicsState(),lib.concatTransformationMatrix(ia,ib,-ic,-id,ic*H+ie,id*H+iff));
   const bottom=H-t.y-t.height;
   page.drawLine({start:{x:t.anchor.x,y:H-t.anchor.y},end:{x:t.x+t.width/2,y:bottom+t.height/2},thickness:0.65*Math.hypot(a,b),color:lib.rgb(0.1,0.15,0.2)});
   page.drawRectangle({x:t.x,y:bottom,width:t.width,height:t.height,color:lib.rgb(1,1,1),borderColor:lib.rgb(0.1,0.15,0.2),borderWidth:0.7*Math.hypot(a,b),opacity:0.94});
   try{t.lines.forEach((line,i)=>page.drawText(line,{x:t.x+5*Math.hypot(a,b),y:H-t.y-(i+1)*t.lineHeight-3*Math.hypot(a,b),size:t.fontSize,font,color:lib.rgb(0,0,0)}));}catch(e){throw Error('A map name or note contains text unsupported by the bundled PDF font. The original and job are unchanged.');}
   page.pushOperators(lib.popGraphicsState());
  }
  const output=await pdf.save({updateFieldAppearances:false});check();return output;
 }
 return Object.freeze({plan,exportPDF,verifyOriginal,validate});
});

function initMapPDF(){
 const host=document.createElement('details');host.id='mapPdfPanel';host.innerHTML='<summary>Update PDF map</summary><p class="note">Create one grouped tombstone beside each confirmed active and end-of-line symbol, on its diagram page. Keep the original separately. Re-select the same original after reopening a job. Images cannot be exported as updated maps.</p><label class="filelabel">Select verified original PDF<input type="file" accept=".pdf,application/pdf" data-map-pdf-original></label><div class="toolbar"><button type="button" data-map-pdf-refresh>Refresh tombstones</button><button type="button" data-map-pdf-export>Update PDF map</button></div><p data-map-pdf-status role="status" aria-live="polite"></p><div data-map-pdf-positions></div>';
 $('mapImportMount').closest('details').after(host);let selected=null;
 const current=()=>selected?.owner===state&&selected.sourceId===state.mapImportSource?.id;
 host.addEventListener('change',async e=>{if(!e.target.hasAttribute('data-map-pdf-original'))return;const file=e.target.files?.[0],owner=state;if(!file)return;selected=null;try{const bytes=new Uint8Array(await file.arrayBuffer());await NightSweepMapPDF.verifyOriginal(bytes,owner);if(owner!==state)throw Error('Job changed; select its original again.');selected={owner,sourceId:owner.mapImportSource.id,bytes};host.querySelector('[data-map-pdf-status]').textContent='Original PDF verified. Review symbol confirmations and tombstone positions before export.';renderMapPDF();}catch(err){host.querySelector('[data-map-pdf-status]').textContent=err.message;}});
 host.addEventListener('click',async e=>{if(!e.target.hasAttribute('data-map-pdf-refresh')&&!e.target.hasAttribute('data-map-pdf-export'))return;const status=host.querySelector('[data-map-pdf-status]');try{if(!current())throw Error('Select the verified original PDF for this job first.');const owner=state;await NightSweepMapPDF.verifyOriginal(selected.bytes,owner);if(!current())throw Error('Job changed during PDF verification.');if(e.target.hasAttribute('data-map-pdf-refresh')){renderMapPDF();status.textContent='Tombstones refreshed from the verified original and current records. RF data retained.';return;}const bytes=await NightSweepMapPDF.exportPDF(selected.bytes,owner,{isCurrent:()=>state===owner&&current()});if(!current())throw Error('Job changed during PDF update.');const name=owner.mapImportSource.name.replace(/\.pdf$/i,'')+'-updated.pdf';if(window.NightSweepAndroid?.saveBinary)window.NightSweepAndroid.saveBinary(name,EvidenceCore.bytesToBase64(bytes),'application/pdf');else await BrowserFiles.prepare(name,bytes,'application/pdf',{forceReady:true});status.textContent='Updated PDF prepared. Original PDF and job records retained.';}catch(err){status.textContent=err.message;}});
 host.addEventListener('change',e=>{const t=e.target,key=t.dataset.tombstone;if(!key)return;const row=t.closest('[data-tombstone-key]'),id=row?.dataset.tombstoneKey,n=Number(t.value);if(!t.value.trim()||!Number.isFinite(n)||n<0||n>100){host.querySelector('[data-map-pdf-status]').textContent='Enter a complete position from 0 to 100 percent.';return;}try{const plan=NightSweepMapPDF.plan(state),box=plan.tombstones.find(x=>x.key===id);if(!box)return;state.mapTombstones??={};const previous=state.mapTombstones[id];state.mapTombstones[id]={sourceId:plan.sourceId,x:box.x/box.geometry.width,y:box.y/box.geometry.height,[key]:n/100};try{NightSweepMapPDF.plan(state);}catch(err){if(previous)state.mapTombstones[id]=previous;else delete state.mapTombstones[id];throw err;}saveLocal();renderMapPDF();}catch(err){host.querySelector('[data-map-pdf-status]').textContent=err.message;}});
}
function renderMapPDF(){
 const el=$('mapPdfPanel')?.querySelector('[data-map-pdf-positions]');if(!el||!state)return;
 try{const p=NightSweepMapPDF.plan(state);el.innerHTML=p.tombstones.map(t=>`<div data-tombstone-key="${esc(t.key)}"><strong>${esc(t.name)} · diagram page ${t.page}</strong><div class="fields"><label>Across page (%)<input type="number" step="any" min="0" max="100" data-tombstone="x" value="${(100*t.x/t.geometry.width).toFixed(2)}"></label><label>Down page (%)<input type="number" step="any" min="0" max="100" data-tombstone="y" value="${(100*t.y/t.geometry.height).toFixed(2)}"></label></div><details><summary>Grouped tombstone text</summary><pre>${esc(t.lines.join('\n'))}</pre></details></div>`).join('')+`<p class="note">${p.tombstones.length} confirmed symbols · ${p.skipped.length} unconfirmed or ineligible points omitted. Reposition to avoid existing markup, then inspect the exported PDF.</p>`;}catch(err){el.textContent=err.message;}
}
