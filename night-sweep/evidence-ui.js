/* Original meter evidence is stored offline in IndexedDB, separate from small job autosaves. */
const EvidenceUI = (() => {
  let dbPromise, busy = false, initialized = false, lastMessage = '', messageError = false;
  const draft = {kind:'Sweep',stage:'Before',asset:'',notes:''};
  let draftOwner = null;
  const $e = id => document.getElementById(id);
  const current = () => state;
  const list = owner => Array.isArray(owner.evidence) ? owner.evidence : [];
  const mib = n => (n / 1048576).toFixed(2) + ' MiB';
  function compactState(source){
    const compact={...source};delete compact.evidenceFiles;
    if(Array.isArray(source.evidence))compact.evidence=source.evidence.map(meta=>({...meta,parse:{status:'attachment',message:'Original preserved. Readable measurement previews are rebuilt from verified saved bytes.'}}));
    return JSON.parse(JSON.stringify(compact));
  }
  function report(text, error=false) {
    lastMessage = text; messageError = error;
    const el=$e('evidenceStatus');
    if(el){el.textContent=text;el.className='status'+(error?' error':'');}
    const main=$e('message');if(main)main.textContent=text;
  }
  function requireCrypto(){
    if(!globalThis.crypto?.subtle)throw Error('Secure file verification is unavailable here. Open the installed Carpe Noctum app or a secure browser origin.');
  }
  async function digest(bytes){requireCrypto();const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
  function openDB(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!globalThis.indexedDB){reject(Error('Offline file storage is unavailable in this browser.'));return;}
      const req=indexedDB.open('nightsweep-evidence-v1',1);let blocked=false;
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files',{keyPath:'id'});};
      req.onerror=()=>reject(Error('Could not open offline file storage: '+(req.error?.message||'storage error')));
      req.onblocked=()=>{blocked=true;reject(Error('Close other Carpe Noctum windows and retry file storage.'));};
      // Rejecting a blocked request does not cancel its eventual connection.
      req.onsuccess=()=>{
        const db=req.result;if(blocked){db.close();return;}
        const connectionPromise=dbPromise;
        const invalidate=()=>{if(dbPromise===connectionPromise)dbPromise=undefined;};
        db.onclose=invalidate;
        db.onversionchange=()=>{db.close();invalidate();};
        resolve(db);
      };
    }).catch(e=>{dbPromise=undefined;throw e;});return dbPromise;
  }
  async function putFiles(records){
    if(!records.length)return;
    const db=await openDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('files','readwrite');
      tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error('The files could not be saved. Free device storage and retry. '+(tx.error?.message||'')));tx.onerror=()=>{};
      try{const store=tx.objectStore('files');for(const record of records)store.put(record);}catch(e){tx.abort();reject(e);}
    });
  }
  async function getFile(id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      let record;
      const tx=db.transaction('files','readonly'),req=tx.objectStore('files').get(id);
      req.onsuccess=()=>{record=req.result;};
      tx.oncomplete=()=>resolve(record);
      tx.onabort=()=>reject(Error('Could not read the saved evidence file.'));tx.onerror=()=>{};
    });
  }
  function newId(){return 'ev_'+Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');}
  async function safeParse(bytes,filename,kind){
    if(typeof EvidenceArchive!=='undefined')return await EvidenceArchive.parseBytes(bytes,filename,kind);
    if(bytes.byteLength>EvidenceCore.limits.textBytes)return {status:'attachment',message:'Original file preserved. This file exceeds the 2 MiB text-reading limit.'};
    if(!/\.csv$/i.test(filename))return {status:'attachment',message:'Original file preserved. No supported decoder is available for this file.'};
    try{return EvidenceCore.parseText(new TextDecoder('utf-8',{fatal:true}).decode(bytes),filename,kind);}
    catch(e){return {status:'attachment',message:'Original file preserved. CSV could not be read: '+String(e.message||e).slice(0,500)};}
  }
  function ensureOwner(owner){if(current()!==owner)throw Error('The working project changed. The upload was not attached; select the files again in the intended project.');}
  async function importFiles(files, fields=draft){
    if(busy)throw Error('Finish the current file operation first.');
    const selected=Array.from(files||[]);if(!selected.length)return;
    busy=true;render();report('Reading and verifying selected files…');
    const owner=current(),original=list(owner),chosen={...fields};
    try{
      requireCrypto();
      if(original.length+selected.length>EvidenceCore.limits.count)throw Error('Each project can contain at most 30 evidence files.');
      let total=original.reduce((n,r)=>n+r.size,0);
      for(const f of selected){if(f.size>EvidenceCore.limits.fileBytes)throw Error(f.name+' exceeds the 8 MiB per-file limit.');total+=f.size;}
      if(total>EvidenceCore.limits.totalBytes)throw Error('These files exceed the 12 MiB total evidence limit for one project.');
      const metadata=[],records=[];
      for(const file of selected){
        const bytes=new Uint8Array(await file.arrayBuffer());ensureOwner(owner);
        if(bytes.byteLength!==file.size)throw Error('Could not read all of '+file.name+'.');
        const id=newId(),sha256=await digest(bytes);ensureOwner(owner);
        metadata.push({id,name:file.name,size:file.size,type:file.type||'',kind:chosen.kind,stage:chosen.stage,asset:chosen.asset||owner.project?.meta?.node||'',notes:chosen.notes||'',importedAt:new Date().toISOString(),sha256,parse:await safeParse(bytes,file.name,chosen.kind)});
        ensureOwner(owner);records.push({id,bytes:bytes.buffer});
      }
      EvidenceCore.validateEvidence([...original,...metadata]);ensureOwner(owner);
      await putFiles(records);ensureOwner(owner);
      owner.evidence=[...original,...metadata];
      const autosaved=saveLocal();
      if(autosaved===false)report('Original files are stored, but the job could not be autosaved. Use Back up project now before closing Carpe Noctum.',true);
      else report(metadata.length+' original file'+(metadata.length===1?'':'s')+' saved with this job. Export the project to create a portable backup.');
      return metadata;
    }catch(e){report('Upload failed: '+e.message,true);throw e;}
    finally{busy=false;render();}
  }
  async function bytesFor(meta){
    const saved=await getFile(meta.id);
    if(!saved?.bytes)throw Error('Original file missing: '+meta.name+'. Reattach it before exporting this project.');
    const bytes=new Uint8Array(saved.bytes);
    if(bytes.byteLength!==meta.size || await digest(bytes)!==meta.sha256.toLowerCase())throw Error('Original file verification failed: '+meta.name+'. Reattach the file.');
    return bytes;
  }
  async function verifiedParse(id){
    if(busy)throw Error('Finish the current file operation first.');
    const owner=current(),found=list(owner).find(m=>m.id===id);if(!found)throw Error('Evidence record was not found.');
    const metadata=JSON.parse(JSON.stringify(found)),identity=JSON.stringify(metadata);
    busy=true;render();
    try{
      const bytes=await bytesFor(metadata);ensureOwner(owner);
      const parse=await safeParse(bytes,metadata.name,metadata.kind);ensureOwner(owner);
      if(JSON.stringify(list(owner).find(m=>m.id===id))!==identity)throw Error('Evidence metadata changed during verification.');
      return {parse,metadata};
    }finally{busy=false;render();}
  }
  async function exportProject(source){
    if(busy)throw Error('Finish the current file operation before saving the project.');
    busy=true;render();
    try{
      const snapshot=compactState(source);
      const metadata=list(snapshot);EvidenceCore.validateEvidence(metadata);
      if(metadata.length){
        const bundled=[];
        for(const meta of metadata)bundled.push({id:meta.id,base64:EvidenceCore.bytesToBase64(await bytesFor(meta))});
        snapshot.evidenceFiles=bundled;
      }
      if(new TextEncoder().encode(JSON.stringify(snapshot)).length>20*1048576)throw Error('The project exceeds the 20 MiB export limit. Remove some attachments after saving their originals.');
      return snapshot;
    }finally{busy=false;render();}
  }
  async function prepareImport(candidate){
    if(busy)throw Error('Finish the current file operation before opening another project.');
    const owner=current();busy=true;render();
    try{
      const clean=JSON.parse(JSON.stringify(candidate)),metadata=list(clean);
      if(clean.evidence!==undefined&&!Array.isArray(clean.evidence))throw Error('Invalid evidence list.');
      EvidenceCore.validateEvidence(metadata);
      const bundle=clean.evidenceFiles===undefined?[]:clean.evidenceFiles;
      if(!Array.isArray(bundle)||bundle.length!==metadata.length)throw Error('Project backup is missing original evidence files. Export it from the original device using Back up project.');
      const records=[],ids=new Set(),mapping=new Map();
      if(clean.sweepGrading!==undefined){if(typeof SweepGradingUI==='undefined')throw Error('Sweep grading module unavailable.');SweepGradingUI.validate(clean.sweepGrading);}
      for(const item of bundle){
        if(!item||typeof item!=='object'||typeof item.id!=='string'||typeof item.base64!=='string'||ids.has(item.id))throw Error('Invalid or duplicate evidence file in this project.');
        ids.add(item.id);const meta=metadata.find(m=>m.id===item.id);
        if(!meta)throw Error('An original file has no matching evidence record.');
        const bytes=EvidenceCore.base64ToBytes(item.base64,EvidenceCore.limits.fileBytes);
        if(bytes.byteLength!==meta.size||await digest(bytes)!==meta.sha256.toLowerCase())throw Error('Evidence checksum does not match: '+meta.name+'.');
        // Rebuild derived previews from the original, not untrusted cached parser output.
        meta.parse=await safeParse(bytes,meta.name,meta.kind);ensureOwner(owner);
        // A foreign project must not overwrite originals still used by another local job.
        const oldId=meta.id;meta.id=newId();mapping.set(oldId,meta.id);
        records.push({id:meta.id,bytes:bytes.buffer});
      }
      if(typeof SweepGradingUI!=='undefined')SweepGradingUI.remapEvidence(clean,mapping);
      delete clean.evidenceFiles;ensureOwner(owner);await putFiles(records);ensureOwner(owner);return clean;
    }finally{busy=false;render();}
  }
  async function downloadOriginal(id){
    if(busy)throw Error('Finish the current file operation first.');
    const meta=list(current()).find(m=>m.id===id);if(!meta)throw Error('Evidence record was not found.');
    busy=true;render();
    try{
      const bytes=await bytesFor(meta),mime=meta.type||'application/octet-stream';
      if(window.NightSweepAndroid?.saveBinary)window.NightSweepAndroid.saveBinary(meta.name,EvidenceCore.bytesToBase64(bytes),mime);
      else if(window.BrowserFiles){await window.BrowserFiles.prepare(meta.name,bytes,mime,{forceReady:true});return;}
      else {
        const url=URL.createObjectURL(new Blob([bytes],{type:mime})),a=document.createElement('a');a.href=url;a.download=meta.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
      }
      report('Original file prepared for saving: '+meta.name+'.');
    }catch(e){report(e.message,true);throw e;}
    finally{busy=false;render();}
  }
  async function reloadPreviews(){
    if(busy)throw Error('Finish the current file operation first.');
    const owner=current(),metadata=list(owner);if(!metadata.length)return;
    busy=true;render();report('Verifying saved originals and rebuilding measurement previews…');
    let failed=0;
    try{
      for(const meta of metadata){
        let parsed;
        try{parsed=await safeParse(await bytesFor(meta),meta.name,meta.kind);}
        catch(e){failed++;parsed={status:'attachment',message:String(e.message).slice(0,900)};}
        ensureOwner(owner);meta.parse=parsed;
      }
      report(failed?failed+' original file'+(failed===1?' is':'s are')+' unavailable or failed verification. Reattach those files before exporting.':'Saved originals verified. Readable measurement previews are ready.',failed>0);
    }catch(e){report(e.message,true);throw e;}
    finally{busy=false;render();}
  }
  async function cleanupUnused(){
    if(busy)throw Error('Finish the current file operation first.');
    if(!confirm('Clear stored files that are not attached to the current or named jobs? Close other Carpe Noctum windows first. Exported project backups are unchanged.'))return;
    const owner=current(),keep=new Set(list(owner).map(m=>m.id));if(typeof JobsUI!=='undefined')for(const id of JobsUI.referencedEvidenceIds())keep.add(id);busy=true;render();
    try{
      const db=await openDB();ensureOwner(owner);
      const removed=await new Promise((resolve,reject)=>{
        let count=0,reason;
        const tx=db.transaction('files','readwrite'),store=tx.objectStore('files'),cursor=store.openKeyCursor();
        tx.oncomplete=()=>resolve(count);tx.onabort=()=>reject(reason||Error('Unused file cleanup could not complete.'));tx.onerror=()=>{};
        cursor.onsuccess=()=>{
          try{ensureOwner(owner);const item=cursor.result;if(!item)return;if(!keep.has(item.primaryKey)){store.delete(item.primaryKey);count++;}item.continue();}
          catch(e){reason=e;tx.abort();}
        };
      });
      report('Cleared '+removed+' unused stored file'+(removed===1?'':'s')+'. Current and named job originals were retained.');return removed;
    }catch(e){report(e.message,true);throw e;}
    finally{busy=false;render();}
  }
  function chart(series,discrete){
    const points=series.points;if(!points?.length)return '';
    const lowX=points[0][0],highX=points[points.length-1][0];
    let lo=Infinity,hi=-Infinity;for(const p of points){lo=Math.min(lo,p[1]);hi=Math.max(hi,p[1]);}
    if(lo===hi){lo-=1;hi+=1;}else{const pad=(hi-lo)*0.08;lo-=pad;hi+=pad;}
    const x=v=>48+((v-lowX)/(highX-lowX||1))*492,y=v=>170-((v-lo)/(hi-lo))*140;
    const path=points.map(([frequency,level],i)=>
      (discrete||!i?'M':'L')+x(frequency).toFixed(2)+','+y(level).toFixed(2)+(discrete?'h0.01':'')
    ).join(' ');
    return `<svg viewBox="0 0 560 210" role="img" aria-label="${discrete?'Discrete CSV channel readings':'Uploaded measurement trace'}" style="display:block;width:100%;max-height:320px;background:#10232c;border-radius:8px;margin-top:12px"><path d="M48 25V170H540" fill="none" stroke="#839da9"/><path d="${path}" fill="none" stroke="#85d9f6" stroke-width="${discrete?5:2}"${discrete?' stroke-linecap="round"':''}/><text x="48" y="195" fill="#adc0d0" font-size="12">${lowX.toFixed(2)} MHz</text><text x="540" y="195" text-anchor="end" fill="#adc0d0" font-size="12">${highX.toFixed(2)} MHz</text><text x="48" y="18" fill="#adc0d0" font-size="12">${esc(series.unit)} · measured supplied values</text><text x="42" y="38" text-anchor="end" fill="#adc0d0" font-size="11">${hi.toFixed(1)}</text><text x="42" y="170" text-anchor="end" fill="#adc0d0" font-size="11">${lo.toFixed(1)}</text></svg>`;
  }
  function preview(meta){
    const p=meta.parse;if(p?.status!=='parsed')return '';
    const records=p.rows,series=p.series;
    let table='';
    if(records?.length)table=`<thead><tr><th>Channel</th><th>MHz</th><th>dBmV</th><th>MER dB</th></tr></thead><tbody>${records.slice(0,200).map(r=>`<tr><td>${esc(r.channel)}</td><td>${r.frequencyMHz}</td><td>${r.levelDbmv}</td><td>${r.merDb}</td></tr>`).join('')}</tbody>`;
    else if(series?.points?.length)table=`<thead><tr><th>MHz</th><th>${esc(series.unit)}</th></tr></thead><tbody>${series.points.slice(0,200).map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td></tr>`).join('')}</tbody>`;
    const count=records?.length||series?.points?.length||0;
    return `<details><summary>View decoded measurements (${count})</summary><p class="note">Values are preserved as supplied. No test-point correction, sweep reference adjustment or acceptance decision is applied.</p>${records?.length?'<p class="note">Each dot is one supplied channel reading. Gaps have no channel reading in this file.</p>':''}${series?chart(series,Boolean(records?.length)):''}<div class="tablewrap"><table>${table}</table></div>${count>200?'<p class="note">Table shows the first 200 rows. Save the original to inspect every row.</p>':''}</details>`;
  }
  function render(){
    const parent=$e('projectPanel');if(!parent||!current())return;
    const owner=current();
    // An unsent attachment description belongs to one working job. A project
    // change must never carry its station, stage or notes into another job.
    if(draftOwner!==owner){
      Object.assign(draft,{kind:'Sweep',stage:'Before',asset:String(owner.node?.asset||owner.job?.node||owner.project?.meta?.node||'').slice(0,200),notes:''});
      draftOwner=owner;
    }
    let el=$e('evidencePanel');
    const gradingOpen=$e('sweepGradingPanel')?.open;
    const wasOpen=el?el.open:true,expanded=el?[...el.querySelectorAll('[data-evidence-card][open]')].map(n=>n.dataset.evidenceCard):[];
    if(!el){el=document.createElement('details');el.id='evidencePanel';el.dataset.projectSection='evidence';parent.appendChild(el);}
    el.open=wasOpen;
    const metadata=list(current()),total=metadata.reduce((n,m)=>n+m.size,0),disabled=busy?' disabled':'';
    el.innerHTML=`<summary>ONX-630 evidence <span class="pill" style="margin-left:8px">${metadata.length} files</span></summary><p class="note">Attach meter exports or screen photos to this job. Back up project includes the original files. Supported native JSON, gzip, single-JSON ZIP and interchange CSV files also show a measurement preview.</p><div class="toolbar"><button type="button" id="evidenceOpenProject"${disabled}>Open project backup</button></div><p class="note">Use this for a Carpe Noctum project JSON. Use Add meter files or photos below to attach evidence to the current job.</p><div class="fields"><label>Test type<select id="evidenceKind"${disabled}>${['Sweep','Ingress','OneCheck'].map(v=>option(v,v,draft.kind)).join('')}</select></label><label>Stage<select id="evidenceStage"${disabled}>${['Before','After','Reference'].map(v=>option(v,v,draft.stage)).join('')}</select></label><label>Asset / station ID<input id="evidenceAsset" value="${esc(draft.asset)}" maxlength="200" placeholder="${esc(current().project?.meta?.node||'Node, amp or pole ID')}"${disabled}></label><label>Attachment notes<input id="evidenceNotes" value="${esc(draft.notes)}" maxlength="2000"${disabled}></label></div><div class="toolbar" style="margin-top:14px"><label class="filelabel" style="display:flex">Add meter files or photos<input id="evidenceFiles" type="file" multiple style="position:absolute;width:1px;height:1px;opacity:0;min-height:0;padding:0"${disabled}></label><button id="evidenceReload"${disabled}>Verify saved files</button><button id="evidenceCleanup"${disabled}>Clear unused stored files</button><span class="note">${mib(total)} / 12 MiB · 8 MiB per file · 30 files per job</span></div><div id="evidenceStatus" class="status${messageError?' error':''}" role="status" aria-live="polite">${esc(lastMessage||'Choose the test type and stage, then select files from your phone or connected storage.')}</div><details><summary>Readable CSV columns</summary><p class="note">Sweep or ingress: frequency_mhz,level_dbmv. Relative sweep: frequency_mhz,response_db. OneCheck table: channel,frequency_mhz,level_dbmv,mer_db. Explicit units are required. These are supported interchange columns, not a promise that every native ONX CSV uses this layout. Supported VIAVI TestGroup and CDM2 JSON can be decoded directly or from gzip / a single-JSON ZIP. Unsupported, ambiguous or multi-trace files stay attached with a reason. PDF/XML/images are retained intact.</p></details><div>${metadata.map(m=>`<details class="rowcard" data-evidence-card="${esc(m.id)}"${expanded.includes(m.id)?' open':''}><summary style="overflow-wrap:anywhere">${esc(m.name)} · ${esc(m.kind)} · ${esc(m.stage)}</summary><p class="note">${esc(m.asset||'No asset ID')} · ${mib(m.size)} · added ${esc(m.importedAt)}${m.notes?' · '+esc(m.notes):''}</p><div class="status${m.parse?.status==='parsed'?'':' warning'}"><strong>${m.parse?.status==='parsed'?'Measurements decoded':'Original attached'}</strong><p>${esc(m.parse?.message||'Original file preserved.')}</p></div>${preview(m)}<div class="toolbar"><button data-evidence-download="${esc(m.id)}"${disabled}>Save original</button><button class="danger" data-evidence-remove="${esc(m.id)}"${disabled}>Remove from job</button></div><p class="note" style="overflow-wrap:anywhere">SHA-256: ${esc(m.sha256)}</p></details>`).join('')||'<p class="note">No meter files attached yet.</p>'}</div><p class="note">An attached file does not mark a test passed. Keep the meter settings and measurement plane with the field record. Clearing app data or uninstalling removes local evidence; export the project first.</p>`;
    if(typeof SweepGradingUI!=='undefined'){SweepGradingUI.render();if(gradingOpen!==undefined)$e('sweepGradingPanel').open=gradingOpen;}
  }
  function init(){
    if(initialized){render();return;}initialized=true;
    if(typeof SweepGradingUI!=='undefined')SweepGradingUI.init();
    document.addEventListener('input',e=>{const keys={evidenceKind:'kind',evidenceStage:'stage',evidenceAsset:'asset',evidenceNotes:'notes'},key=keys[e.target.id];if(key)draft[key]=e.target.value;});
    document.addEventListener('change',e=>{
      const keys={evidenceKind:'kind',evidenceStage:'stage'},key=keys[e.target.id];if(key)draft[key]=e.target.value;
      if(e.target.id==='evidenceFiles'){const files=Array.from(e.target.files||[]);e.target.value='';importFiles(files).catch(()=>{});}
    });
    document.addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      if(t.id==='evidenceOpenProject'&&!busy)$e('load')?.click();
      if(t.id==='evidenceReload')reloadPreviews().catch(err=>report(err.message,true));
      if(t.id==='evidenceCleanup')cleanupUnused().catch(err=>report(err.message,true));
      if(t.dataset.evidenceDownload)downloadOriginal(t.dataset.evidenceDownload).catch(err=>report(err.message,true));
      if(t.dataset.evidenceRemove){
        if(busy){report('Finish the current file operation first.',true);return;}
        const owner=current(),meta=list(owner).find(m=>m.id===t.dataset.evidenceRemove);if(!meta)return;
        if(!confirm('Remove '+meta.name+' from this job? Previously exported project backups are unchanged.'))return;
        owner.evidence=list(owner).filter(m=>m.id!==meta.id);saveLocal();report('Removed from this job.');render();
      }
    });render();return reloadPreviews().catch(err=>report(err.message,true));
  }
  return {init,render,verifiedParse,importFiles,exportProject,prepareImport,downloadOriginal,reloadPreviews,compactState,cleanupUnused,isBusy:()=>busy};
})();
function initEvidence(){return EvidenceUI.init();}
function renderEvidence(){EvidenceUI.render();}
function evidenceIsBusy(){return EvidenceUI.isBusy();}
function evidenceCompactState(project){return EvidenceUI.compactState(project);}
function evidenceExportProject(project){return EvidenceUI.exportProject(project);}
function evidencePrepareImport(candidate){return EvidenceUI.prepareImport(candidate);}
function evidenceDownload(id){return EvidenceUI.downloadOriginal(id);}
