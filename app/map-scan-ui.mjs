import {runDualScan,symbols} from './map-scan-core.mjs';

// Source PDF bytes and names never enter this module's transport interface.
export function prepareMaskedImage(source,masks,createCanvas=()=>document.createElement('canvas')) {
 if(!source||!Number.isFinite(source.width)||!Number.isFinite(source.height)||source.width<=0||source.height<=0)throw Error('No rendered map page available.');
 const scale=Math.min(1,2048/source.width,2048/source.height),canvas=createCanvas();
 canvas.width=Math.max(1,Math.floor(source.width*scale));canvas.height=Math.max(1,Math.floor(source.height*scale));
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
 ctx.fillStyle='#000';
 for(const r of masks){if(!r||![r.x,r.y,r.width,r.height].every(Number.isFinite)||r.width<=0||r.height<=0)throw Error('Invalid privacy mask.');
  const x=Math.floor((r.x-2)*scale),y=Math.floor((r.y-2)*scale),right=Math.ceil((r.x+r.width+2)*scale),bottom=Math.ceil((r.y+r.height+2)*scale);ctx.fillRect(x,y,right-x,bottom-y);
 }
 return {canvas,image:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height};
}

// Native WebView transport: only runDualScan's validated PNG protocol reaches the bridge.
export function nativeScanFetcher(host) {
 return (url,options)=>new Promise((resolve,reject)=>{
  if(options.signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}
  const id=host.crypto.randomUUID();
  const callbacks=host.MapNativeCallbacks||(host.MapNativeCallbacks=Object.create(null));
  let timer;
  const cleanup=()=>{delete callbacks[id];clearTimeout(timer);options.signal?.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(new DOMException('Cancelled','AbortError'));};
  callbacks[id]=(ok,responseText)=>{cleanup();if(!ok){reject(Error('Native scanner request failed.'));return;}try{const body=JSON.parse(responseText);resolve({ok:true,status:200,json:async()=>body});}catch{reject(Error('Invalid native scanner response.'));}};
  options.signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>{cleanup();reject(Error('Native scanner timed out.'));},180000);
  try{host.NightSweepAndroid.scanMap(id,new URL(url).origin,options.headers.Authorization.slice(7),options.body);}catch(error){cleanup();reject(error);}
 });
}

export function mountMapScan(root,{getContext,onSuggestions,onClose,scan=runDualScan}) {
 const doc=root.ownerDocument,initial=getContext();
 if(!initial?.canvas)throw Error('Render a map page before opening privacy review.');
 const revision=initial.revision,source=doc.createElement('canvas');source.width=initial.canvas.width;source.height=initial.canvas.height;source.getContext('2d').drawImage(initial.canvas,0,0);
 let masks=(initial.textBounds||[]).map(r=>({...r})),generation=0,controller=null,destroyed=false,invalid=false,preview=null,start=null;
 const panel=doc.createElement('section');panel.className='map-scan-panel';panel.setAttribute('aria-label','Private online map scan');
 panel.innerHTML=`<h3>Review a private map image</h3><p>Only the flattened PNG shown below goes to your configured service, OpenAI and Gemini. The original PDF stays on this device. All extracted text starts covered. Keep node names, equipment names, addresses and identifying details covered. You may uncover technical values only.</p><p data-role="coverage"></p><label>Mask tool <select name="mask-mode"><option value="draw">Draw opaque cover</option><option value="remove">Tap cover to remove (technical values only)</option></select></label><div data-role="preview"></div><p>Drag on the preview to cover an area. Black covers are baked into the sent image.</p><button type="button" data-action="reset">Restore all text covers</button> <a data-role="download" download="reviewed-map.png">Download this PNG</a><div><label>Scanner HTTPS origin <input name="endpoint" type="url" placeholder="https://scanner.example" autocomplete="off"></label><label>Device token <input name="token" type="password" autocomplete="off" spellcheck="false"></label></div><label data-role="manual"><input name="manual" type="checkbox">I have manually covered all names and identifying text.</label><label><input name="review" type="checkbox">I reviewed this exact PNG and confirm all identifying details remain hidden.</label><p><button type="button" data-action="review-send" disabled>Review send confirmation</button> <button type="button" data-action="close">Close</button></p><div data-role="confirmation" hidden><p>Send this reviewed PNG to the configured service for independent OpenAI and Gemini scans, followed by a mutual cross-check?</p><button type="button" data-action="confirm-send">Send reviewed PNG now</button> <button type="button" data-action="cancel-send">Cancel</button></div><p data-role="status" role="status" aria-live="polite"></p><div data-role="results"></div>`;
 root.append(panel);
 const q=s=>panel.querySelector(s),status=q('[data-role=status]'),review=q('[name=review]'),manual=q('[name=manual]'),send=q('[data-action=review-send]'),confirmation=q('[data-role=confirmation]'),results=q('[data-role=results]');
 const needsManual=initial.textAvailable!==true;
 q('[data-role=manual]').hidden=!needsManual;
 q('[data-role=coverage]').textContent=needsManual?'Text extraction is unavailable or incomplete. Names may still be visible: cover identifying areas manually before sending.':'All locally extracted text is covered by default. Inspect the whole page for image-based names that extraction may have missed.';
 function current(){return !destroyed&&!invalid&&getContext()?.revision===revision;}
 function invalidate(){invalid=true;generation++;controller?.abort();send.disabled=true;confirmation.hidden=true;results.replaceChildren();status.textContent='Map or job changed. Close and reopen privacy review before scanning.';}
 function allowed(){return current()&&review.checked&&(!needsManual||manual.checked);}
 function update(){send.disabled=!allowed();if(!allowed())confirmation.hidden=true;}
 function edited(){generation++;controller?.abort();review.checked=false;manual.checked=false;confirmation.hidden=true;results.replaceChildren();status.textContent='Review the updated PNG before sending.';paint();update();}
 const display=doc.createElement('canvas');display.style.cssText='display:block;max-width:100%;height:auto;touch-action:none;border:1px solid #888';display.setAttribute('aria-label','Exact masked PNG preview. Drag to add a cover.');q('[data-role=preview]').append(display);
 function paint(){preview=prepareMaskedImage(source,masks,()=>doc.createElement('canvas'));display.width=preview.width;display.height=preview.height;display.getContext('2d').drawImage(preview.canvas,0,0);q('[data-role=download]').href=preview.image;}
 function point(e){const b=display.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*source.width,y:(e.clientY-b.top)/b.height*source.height};}
 display.addEventListener('pointerdown',e=>{if(!current()){invalidate();return;}start=point(e);display.setPointerCapture?.(e.pointerId);});
 display.addEventListener('pointercancel',()=>{start=null;});
 display.addEventListener('pointerup',e=>{if(!start)return;const a=start,b=point(e);start=null;if(!current()){invalidate();return;}
  if(q('[name=mask-mode]').value==='remove'){const i=masks.findLastIndex(r=>b.x>=r.x&&b.x<=r.x+r.width&&b.y>=r.y&&b.y<=r.y+r.height);if(i<0)return;masks.splice(i,1);}
  else {const x=Math.max(0,Math.min(a.x,b.x)),y=Math.max(0,Math.min(a.y,b.y)),width=Math.min(source.width,Math.max(a.x,b.x))-x,height=Math.min(source.height,Math.max(a.y,b.y))-y;if(width<2||height<2)return;masks.push({x,y,width,height});}edited();
 });
 review.addEventListener('change',update);manual.addEventListener('change',update);
 for(const input of panel.querySelectorAll('[name=endpoint],[name=token]'))input.addEventListener('input',()=>{confirmation.hidden=true;review.checked=false;update();});
 q('[data-action=reset]').onclick=()=>{masks=(initial.textBounds||[]).map(r=>({...r}));edited();};
 q('[data-action=review-send]').onclick=()=>{if(!current()){invalidate();return;}if(allowed())confirmation.hidden=false;};
 q('[data-action=cancel-send]').onclick=()=>{confirmation.hidden=true;};
 q('[data-action=confirm-send]').onclick=async()=>{
  if(!current()){invalidate();return;}if(!allowed()||confirmation.hidden)return;
  confirmation.hidden=true;controller?.abort();controller=new AbortController();const serial=++generation;
  const payload={image:preview.image,width:preview.width,height:preview.height,revision:'scan_'+serial+'_'+Date.now(),endpoint:q('[name=endpoint]').value.trim(),token:q('[name=token]').value.trim(),signal:controller.signal,onStage:stage=>{if(current()&&generation===serial)status.textContent=stage==='initial'?'Running independent OpenAI and Gemini scans…':'Cross-checking both findings…';}};
  review.checked=false;update();results.replaceChildren();
  if(doc.defaultView?.NightSweepAndroid?.scanMap)payload.fetcher=nativeScanFetcher(doc.defaultView);
  try {const result=await scan(payload);if(!current()||generation!==serial){if(!destroyed&&!current())invalidate();return;}
   status.textContent='Review each suggestion. Agreement is not confirmation. Connections are never applied automatically.';
   if(!result.comparison.length)status.textContent+=' No symbol suggestions returned.';
   for(const item of result.comparison){const row=doc.createElement('div'),label=doc.createElement('p');label.textContent=item.status;row.append(label);
    const choices=item.status==='agreement'?[item.a||item.b]:[item.a,item.b].filter(Boolean);
    for(const [index,s] of choices.entries()){const button=doc.createElement('button');button.type='button';button.dataset.action='accept';button.textContent=`Accept ${symbols[s.kind]?.label||'symbol'}${s.value===null?'':` (${s.value})`} at ${Math.round(s.x*100)}%, ${Math.round(s.y*100)}%${choices.length>1?` — option ${index+1}`:''}`;
     button.onclick=()=>{if(!current()||generation!==serial){invalidate();return;}for(const b of row.querySelectorAll('button'))b.disabled=true;onSuggestions([{kind:s.kind,x:s.x,y:s.y,value:s.value}],revision);};row.append(button);
    }results.append(row);
   }
  }catch(error){if(!destroyed&&generation===serial){if(!current())invalidate();else status.textContent=error.name==='AbortError'?'Scan cancelled.':'Scan failed. Check your HTTPS service and device token, then review the image to retry.';}}
 };
 function destroy(){destroyed=true;generation++;controller?.abort();q('[name=token]').value='';panel.remove();}
 q('[data-action=close]').onclick=()=>{destroy();onClose?.();};
 paint();update();return {invalidate,destroy};
}
