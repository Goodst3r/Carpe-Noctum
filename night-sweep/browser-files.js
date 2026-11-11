/* Browser-only file exports. Files stay in memory until the user chooses an OS destination. */
(function(global){
 'use strict';
 const MAX_BYTES=20*1024*1024;
 let pending=null,busy=false,panel=null,status=null,shareButton=null,downloadButton=null,dismissButton=null;
 function message(text,error=false){
  ensurePanel();status.textContent=text;status.setAttribute('role',error?'alert':'status');
  const main=document.getElementById('message');if(main)main.textContent=text;
 }
 function ensurePanel(){
  if(panel?.isConnected)return;
  if(!document.getElementById('browserFilePrintStyle')){const style=document.createElement('style');style.id='browserFilePrintStyle';style.textContent='@media print{#browserFileExport{display:none!important}}';document.head.appendChild(style);}
  panel=document.createElement('section');panel.id='browserFileExport';panel.className='panel browser-file-export';panel.setAttribute('aria-label','Prepared file');panel.hidden=true;
  const heading=document.createElement('h2');heading.textContent='Your file is ready';panel.appendChild(heading);
  const name=document.createElement('p');name.id='browserFileName';name.style.overflowWrap='anywhere';panel.appendChild(name);
  status=document.createElement('p');status.id='browserFileStatus';status.setAttribute('aria-live','polite');panel.appendChild(status);
  const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:10px';
  shareButton=document.createElement('button');shareButton.type='button';shareButton.id='browserShareFile';shareButton.className='primary';shareButton.textContent='Save/share file';shareButton.onclick=()=>share();
  downloadButton=document.createElement('button');downloadButton.type='button';downloadButton.id='browserDownloadFile';downloadButton.textContent='Download file';downloadButton.onclick=()=>download();
  dismissButton=document.createElement('button');dismissButton.type='button';dismissButton.id='browserDismissFile';dismissButton.textContent='Dismiss';dismissButton.onclick=()=>dismiss();
  for(const button of [shareButton,downloadButton,dismissButton]){button.style.minHeight='48px';actions.appendChild(button);}
  panel.appendChild(actions);const host=document.querySelector('main')||document.body,notice=document.getElementById('message');if(notice?.parentNode===host)notice.insertAdjacentElement('afterend',panel);else host.prepend(panel);
 }
 function sync(){
  ensurePanel();panel.hidden=!pending;
  if(!pending)return;
  document.getElementById('browserFileName').textContent=pending.name+' · '+(pending.blob.size/1024).toFixed(1)+' KiB';
  shareButton.hidden=!pending.canShare;shareButton.disabled=busy;downloadButton.disabled=busy;dismissButton.disabled=busy;
 }
 function shareSupported(file){
  if(!file||typeof navigator.share!=='function'||typeof navigator.canShare!=='function')return false;
  try{return navigator.canShare({files:[file]})===true;}catch(_){return false;}
 }
 function activeGesture(){return navigator.userActivation?.isActive===true;}
 function makeFile(name,data,mime){
  const safeName=String(name||'CarpeNoctum_export').replace(/[\u0000-\u001f\u007f/\\]/g,'_').slice(0,240)||'CarpeNoctum_export';
  const blob=new Blob([data],{type:mime||'application/octet-stream'});
  if(blob.size>MAX_BYTES)throw Error('File export exceeds 20 MiB. Split the evidence into separate projects.');
  let file=null;if(typeof File==='function')file=new File([blob],safeName,{type:blob.type});
  return {name:safeName,blob,file,canShare:shareSupported(file)};
 }
 function prepare(name,data,mime,options={}){
  if(busy){message('Finish the current share before preparing another file.',true);return Promise.resolve({status:'error',error:'share_busy'});}
  try{pending=makeFile(name,data,mime);sync();}
  catch(error){message('Could not prepare file: '+error.message,true);return Promise.resolve({status:'error',error:error.message});}
  if(options.forceReady || (pending.canShare&&!activeGesture())){
   message(pending.canShare?'Tap Save/share file, then choose Save to Files or a sharing destination. Nothing has been saved yet.':'Tap Download file, then check your browser downloads or Files. Nothing has been saved yet.');
   panel.scrollIntoView?.({block:'nearest',behavior:'smooth'});
   return Promise.resolve({status:'ready',name:pending.name,size:pending.blob.size});
  }
  return pending.canShare?share():Promise.resolve(download());
 }
 async function share(){
  if(!pending||busy)return {status:busy?'busy':'empty'};
  if(!pending.canShare)return download();
  const current=pending;busy=true;sync();
  try{
   // Call the native share sheet before awaiting anything to retain this click's activation.
   await navigator.share({files:[current.file],title:current.name});
   message('File handed to the selected destination. Check Files or that app to confirm it is saved.');
   return {status:'shared',name:current.name};
  }catch(error){
   if(error?.name==='AbortError'){message('Sharing cancelled. Your file is still ready; choose Save/share file or Download file.');return {status:'cancelled',name:current.name};}
   message('Could not open file sharing. Retry Save/share file or choose Download file.',true);
   return {status:'error',name:current.name,error:error?.message||'Sharing failed'};
  }finally{busy=false;sync();}
 }
 function download(){
  if(!pending||busy)return {status:busy?'busy':'empty'};
  let url,anchor;
  try{
   url=URL.createObjectURL(pending.blob);anchor=document.createElement('a');anchor.href=url;anchor.download=pending.name;anchor.hidden=true;document.body.appendChild(anchor);anchor.click();anchor.remove();
   const keep=url;setTimeout(()=>URL.revokeObjectURL(keep),60000);
   message('Download requested. Check your browser downloads or Files; Carpe Noctum cannot confirm the save.');
   return {status:'download',name:pending.name};
  }catch(error){
   anchor?.remove();if(url)URL.revokeObjectURL(url);
   message('Could not start the download. Retry or choose Save/share file if available.',true);
   return {status:'error',error:error.message};
  }
 }
 function dismiss(){if(busy)return false;pending=null;sync();return true;}
 global.BrowserFiles=Object.freeze({prepare,share,download,dismiss,maxBytes:MAX_BYTES});
})(window);
