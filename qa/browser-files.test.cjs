/* Browser export lifecycle and real app dispatch; browser APIs are controlled doubles. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..'),cases=[];let instances=[];
function harness(full=false){
 const errors=[],shared=[],downloads=[],blobs=new Map(),control={active:true,canShare:true,shareError:null};
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const source=full?(process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST==='1'?require('./build2-source-harness.cjs').assembleHtml():fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8')):'<!doctype html><main><div id="message"></div></main><script>'+fs.readFileSync(path.join(root,'night-sweep/browser-files.js'),'utf8')+'</script>';
 const dom=new JSDOM(source,{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
  w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;w.Blob=Blob;w.File=File;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  Object.defineProperty(w.navigator,'userActivation',{configurable:true,value:{get isActive(){return control.active;}}});
  w.navigator.canShare=()=>{if(control.canShare instanceof Error)throw control.canShare;return control.canShare;};
  w.navigator.share=payload=>{shared.push(payload);if(control.shareError)return Promise.reject(control.shareError);return Promise.resolve();};
  w.URL.createObjectURL=blob=>{if(control.urlError)throw control.urlError;const url='blob:test/'+blobs.size;blobs.set(url,blob);return url;};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads.push({name:this.download,url:this.href,blob:blobs.get(this.href)});};
 }});instances.push(dom);const w=dom.window,d=w.document,ev=s=>w.eval(s);return {w,d,ev,errors,shared,downloads,control};
}
const flush=()=>new Promise(r=>setImmediate(r));
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
const error=(name,message)=>Object.assign(new Error(message),{name});
(async()=>{
 const h=harness(),{w,d,control,shared,downloads}=h;
 await check('Supported file share runs directly within the active gesture and preserves UTF-8/MIME',async()=>{
  const x=await w.BrowserFiles.prepare('job.json','{"label":"Pole × 2"}','application/json');assert.equal(x.status,'shared');assert.equal(shared.length,1);assert.equal(shared[0].files[0].name,'job.json');assert.equal(shared[0].files[0].type,'application/json');assert.equal(await shared[0].files[0].text(),'{"label":"Pole × 2"}');assert.equal(downloads.length,0);assert.match(d.getElementById('message').textContent,/Check Files/);
 });
 await check('Expired activation prepares an explicit Save/share file action without opening a sheet',async()=>{
  control.active=false;const count=shared.length;const x=await w.BrowserFiles.prepare('later.json','{}','application/json');assert.equal(x.status,'ready');assert.equal(shared.length,count);assert.equal(d.getElementById('browserFileExport').hidden,false);control.active=true;d.getElementById('browserShareFile').click();await flush();assert.equal(shared.length,count+1);
 });
 await check('Async preparation can require a fresh click even if activation appears available',async()=>{
  const count=shared.length;assert.equal((await w.BrowserFiles.prepare('original.bin',new Uint8Array([0,128,255]),'application/octet-stream',{forceReady:true})).status,'ready');assert.equal(shared.length,count);await w.BrowserFiles.share();assert.deepEqual([...new Uint8Array(await shared.at(-1).files[0].arrayBuffer())],[0,128,255]);
 });
 await check('Share cancellation keeps the file ready and never silently downloads or claims saved',async()=>{
  control.shareError=error('AbortError','Cancelled');const count=downloads.length;const x=await w.BrowserFiles.prepare('cancel.json','{}','application/json');assert.equal(x.status,'cancelled');assert.equal(downloads.length,count);assert.match(d.getElementById('message').textContent,/Sharing cancelled/);assert.doesNotMatch(d.getElementById('message').textContent,/File handed|saved successfully/);assert.equal(d.getElementById('browserShareFile').disabled,false);control.shareError=null;assert.equal((await w.BrowserFiles.share()).status,'shared');
 });
 await check('Share error offers an explicit byte-preserving download fallback',async()=>{
  control.shareError=error('NotAllowedError','Not allowed');const count=downloads.length;assert.equal((await w.BrowserFiles.prepare('retry.txt','same bytes','text/plain')).status,'error');assert.equal(downloads.length,count);assert.match(d.getElementById('message').textContent,/Retry/);control.shareError=null;const x=w.BrowserFiles.download();assert.equal(x.status,'download');assert.equal(await downloads.at(-1).blob.text(),'same bytes');assert.match(d.getElementById('message').textContent,/cannot confirm the save/);
 });
 await check('Unsupported file sharing uses a download without calling share',async()=>{
  control.canShare=false;const count=shared.length;assert.equal((await w.BrowserFiles.prepare('table.csv','a,b\n1,2','text/csv')).status,'download');assert.equal(shared.length,count);assert.equal(downloads.at(-1).blob.type,'text/csv');control.canShare=true;
 });
 await check('A throwing capability check safely falls back to download',async()=>{
  control.canShare=Error('Unsupported API');assert.equal((await w.BrowserFiles.prepare('table.csv','x','text/csv')).status,'download');control.canShare=true;
 });
 await check('Missing Web Share support retains browser download functionality',async()=>{
  const original=w.navigator.share;w.navigator.share=undefined;assert.equal((await w.BrowserFiles.prepare('project.json','{}','application/json')).status,'download');w.navigator.share=original;
 });
 await check('Download failure is reported without a success claim',async()=>{
  control.canShare=false;control.urlError=Error('Blob blocked');const x=await w.BrowserFiles.prepare('failure.json','{}','application/json');assert.equal(x.status,'error');assert.match(d.getElementById('message').textContent,/Could not start/);control.urlError=null;control.canShare=true;
 });
 await check('The 20 MiB bound rejects oversized exports before either OS handoff',async()=>{
  const shares=shared.length,files=downloads.length;const x=await w.BrowserFiles.prepare('big.bin',new Uint8Array(w.BrowserFiles.maxBytes+1),'application/octet-stream');assert.equal(x.status,'error');assert.equal(shared.length,shares);assert.equal(downloads.length,files);assert.match(d.getElementById('message').textContent,/20 MiB/);
 });
 await check('Exactly 20 MiB is accepted for explicit user export',async()=>assert.equal((await w.BrowserFiles.prepare('limit.bin',new Uint8Array(w.BrowserFiles.maxBytes),'application/octet-stream',{forceReady:true})).status,'ready'));
 await check('Filenames render as inert text and path separators are removed',async()=>{
  await w.BrowserFiles.prepare('../<img onerror=x>.json','{}','application/json',{forceReady:true});assert.equal(d.querySelectorAll('#browserFileExport img').length,0);assert.match(d.getElementById('browserFileName').textContent,/<img/);await w.BrowserFiles.share();assert(!shared.at(-1).files[0].name.includes('/'));
 });
 await check('An in-progress share blocks replacing its pending file',async()=>{
  const original=w.navigator.share;let finish;w.navigator.share=()=>new Promise(r=>{finish=r;});const first=w.BrowserFiles.prepare('first.txt','first','text/plain');assert.equal(d.getElementById('browserShareFile').disabled,true);assert.equal((await w.BrowserFiles.prepare('second.txt','second','text/plain')).status,'error');assert.match(d.getElementById('browserFileName').textContent,/first.txt/);finish();await first;w.navigator.share=original;
 });
 await check('Dismiss hides the prepared file and prevents subsequent accidental export',()=>{
  assert.equal(w.BrowserFiles.dismiss(),true);assert.equal(d.getElementById('browserFileExport').hidden,true);assert.equal(w.BrowserFiles.download().status,'empty');
 });
 await check('Browsers without the activation API get an explicit fresh-gesture button',async()=>{
  Object.defineProperty(w.navigator,'userActivation',{value:undefined});assert.equal((await w.BrowserFiles.prepare('unknown.json','{}','application/json')).status,'ready');
 });
 assert.deepEqual(h.errors,[]);h.w.close();
 const app=harness(true),a=app.w,doc=app.d,ev=app.ev;
 await check('Full app browser project export dispatches JSON through the helper',async()=>{
  await doc.getElementById('save').onclick();const file=app.shared.at(-1).files[0];assert.equal(file.name,'CarpeNoctum_2.0_Alpha_build_4_Project.json');const data=JSON.parse(await file.text());assert.equal(data.version,1);assert.equal(data.rows.length,ev('state.rows.length'));assert.match(doc.getElementById('message').textContent,/Check Files/);
 });
 const originalBytes=new Uint8Array([60,104,116,109,108,62,0,128,255]);
 await check('Async evidence-bearing project export requires a fresh click and embeds exact originals',async()=>{
  await ev('EvidenceUI').importFiles([{name:'original.html',type:'text/html',size:originalBytes.length,arrayBuffer:async()=>originalBytes.slice().buffer}],{kind:'Sweep',stage:'Before',asset:'TEST',notes:'Synthetic'});
  const count=app.shared.length;await doc.getElementById('save').onclick();assert.equal(app.shared.length,count);assert.match(doc.getElementById('message').textContent,/Nothing has been saved yet/);assert.equal(doc.getElementById('browserShareFile').hidden,false);await a.BrowserFiles.share();const data=JSON.parse(await app.shared.at(-1).files[0].text());assert.equal(data.evidenceFiles.length,1);assert.deepEqual([...a.EvidenceCore.base64ToBytes(data.evidenceFiles[0].base64)],[...originalBytes]);
 });
 await check('Save original verifies bytes then offers an inert file rather than opening content',async()=>{
  const count=app.shared.length;await ev('evidenceDownload(state.evidence[0].id)');assert.equal(app.shared.length,count);assert.match(doc.getElementById('browserFileName').textContent,/original.html/);await a.BrowserFiles.share();const file=app.shared.at(-1).files[0];assert.equal(file.type,'text/html');assert.deepEqual([...new Uint8Array(await file.arrayBuffer())],[...originalBytes]);assert.equal(doc.querySelectorAll('#browserFileExport iframe').length,0);
 });
 await check('Run-sheet text and CSV use real browser file exports',async()=>{
  await doc.getElementById('runSheetShare').onclick();let file=app.shared.at(-1).files[0];assert.equal(file.name,'CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.txt');assert.match(await file.text(),/Run sheet/);doc.getElementById('runSheetCsv').click();await flush();file=app.shared.at(-1).files[0];assert.match(file.name,/Run_Sheet.csv$/);assert.match(await file.text(),/Prediction frequency/);
 });
 await check('Cancelled real project sharing does not get overwritten by a prepared/saved success message',async()=>{
  await doc.getElementById('save').onclick();app.control.shareError=error('AbortError','Cancelled');await a.BrowserFiles.share();assert.match(doc.getElementById('message').textContent,/Sharing cancelled/);app.control.shareError=null;
 });
 await check('Android bridge paths remain direct and bypass browser sharing',async()=>{
  const native=[];a.NightSweepAndroid={saveFile:(...x)=>native.push(['text',...x]),saveBinary:(...x)=>native.push(['binary',...x]),shareText:(...x)=>native.push(['share',...x])};const count=app.shared.length;
  await doc.getElementById('save').onclick();await ev('evidenceDownload(state.evidence[0].id)');await doc.getElementById('runSheetShare').onclick();assert.deepEqual(native.map(x=>x[0]),['text','binary','share']);assert.equal(app.shared.length,count);
 });
 await check('Older partial Android bridge uses saveFile when shareText is unavailable',async()=>{
  const native=[];a.NightSweepAndroid={saveFile:(...x)=>native.push(x),saveBinary:()=>{},printReport:()=>{}};const count=app.shared.length;
  await doc.getElementById('runSheetShare').onclick();assert.equal(native.length,1);assert.equal(native[0][0],'CarpeNoctum_2.0_Alpha_build_4_Run_Sheet.txt');assert.equal(native[0][2],'text/plain');assert.match(native[0][1],/Run sheet/);assert.equal(app.shared.length,count);assert.match(doc.getElementById('message').textContent,/Complete the save dialog/);
 });
 await check('JSON import picker remains compatible with Files JSON selections',()=>assert.equal(doc.getElementById('load').getAttribute('accept'),'.json,application/json'));
 assert.deepEqual(app.errors,[]);
 const result={count:cases.length,cases,scope:'Synthetic DOM and browser API doubles; full app dispatch, no actual iOS share sheet or device validation.'};fs.writeFileSync(path.join(root,'qa/browser-files-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log('Browser files: '+cases.length+' checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>instances.forEach(x=>x.window.close()));
