/** Optional, local-only OCR. One worker and one bounded raster tile are live at
 * once. PDF rasterization retains the displayed crop/rotation coordinate frame. */
const abortError=()=>new DOMException('Map import cancelled.','AbortError');
const check=signal=>{if(signal?.aborted)throw abortError();};
const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const tag=s=>/^[AE]\s*[-:]?\s*\d+$/i.test(String(s).trim());
function assetWorker(onProgress) {
  const T=globalThis.Tesseract,element=globalThis.document?.getElementById('map-import-assets');
  if(!T?.createWorker||!element)throw new Error('Offline OCR assets are unavailable.');
  const assets=JSON.parse(element.textContent),language=assets['eng.traineddata.gz'],script=assets['ocr-worker.js'];
  if(!language||!script)throw new Error('Offline OCR worker or English language data is missing.');
  // The worker bundle already contains its WASM core. Only the embedded English
  // language request is accepted; no source PDF or raster can leave this worker.
  const bootstrap=`const startupTimer=setTimeout(()=>self.close(),35000);const send=self.postMessage.bind(self);self.postMessage=function(m,t){if(m.action==='initialize'&&m.status==='resolve')clearTimeout(startupTimer);send(m,t);if(m.status==='reject')self.close();};self.fetch=async function(u){if(String(u)!=='blob:carpe-local-ocr/eng.traineddata.gz')throw Error('Network disabled in local map OCR');return new Response(Uint8Array.from(atob(${JSON.stringify(language)}),c=>c.charCodeAt(0)));};\n`;
  const url=URL.createObjectURL(new Blob([bootstrap,from64(script)],{type:'text/javascript'}));
  let rejectInitialization;
  const failed=new Promise((_,reject)=>{rejectInitialization=reject;});
  const creating=T.createWorker('eng',1,{workerPath:url,workerBlobURL:false,corePath:'offline-core.js',langPath:'blob:carpe-local-ocr',cacheMethod:'none',gzip:true,
    errorHandler:()=>rejectInitialization(new Error('Offline OCR worker failed.')),
    logger:m=>onProgress?.({phase:'ocr-engine',status:m.status,progress:m.progress||0})});
  return {promise:Promise.race([creating,failed]),late:creating,dispose:()=>URL.revokeObjectURL(url)};
}
function bounded(promise,{signal,milliseconds=30000,onCancel}={}) {
  return new Promise((resolve,reject)=>{
    let timer;
    const done=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);};
    const cancel=()=>{done();onCancel?.();reject(abortError());};
    promise.then(v=>{done();resolve(v);},e=>{done();reject(e);});
    signal?.addEventListener('abort',cancel,{once:true});
    if(signal?.aborted){cancel();return;}
    timer=setTimeout(()=>{done();onCancel?.();reject(new Error('Local OCR exceeded its time bound; retry a smaller page region.'));},milliseconds);
  });
}
function wordsOf(data) {
  if(Array.isArray(data?.words))return data.words;
  const words=[];
  for(const block of data?.blocks||[])for(const paragraph of block.paragraphs||[])for(const line of paragraph.lines||[])for(const word of line.words||[])words.push(word);
  return words;
}
function canvasFactory(width,height) {
  if(globalThis.OffscreenCanvas)return new OffscreenCanvas(width,height);
  const canvas=globalThis.document?.createElement('canvas');
  if(!canvas)throw new Error('A local canvas is required for map OCR.');
  canvas.width=width;canvas.height=height;return canvas;
}
async function imageFor(canvas) {
  if(typeof canvas.toBuffer==='function')return canvas.toBuffer('image/png');
  if(typeof canvas.toDataURL==='function')return canvas.toDataURL('image/png');
  return new Uint8Array(await(await canvas.convertToBlob({type:'image/png'})).arrayBuffer());
}
/** createWorker/createCanvas allow a host to supply its own local OCR runtime;
 * the shipped browser path always uses the embedded, network-locked worker. */
export async function recognizePdfPages(pdf,pages,{pages:selection=[],onProgress,signal,scale=3,maxTiles=16,tileSize=1600,minConfidence=60,createWorker,createCanvas=canvasFactory}={}) {
  if(!selection.length)return {issues:[]};
  check(signal);const issues=[];let worker,resource,cancelled=false;
  const requested=new Set(selection.map(Number)),selected=pages.filter(p=>requested.has(p.pageNumber));
  const limit=Math.max(1,Math.min(36,Math.floor(maxTiles))),side=Math.max(512,Math.min(2048,Math.floor(tileSize))),overlap=48,stride=side-overlap;
  try{
    resource=createWorker?{promise:Promise.resolve(createWorker()),dispose:()=>{}}:assetWorker(onProgress);
    (resource.late||resource.promise).then(w=>{if(cancelled)w.terminate().catch(()=>{});}).catch(()=>{});
    worker=await bounded(resource.promise,{signal,onCancel:()=>{cancelled=true;}});
    await bounded(worker.setParameters({tessedit_pageseg_mode:'11',user_defined_dpi:'300'}),{signal,onCancel:()=>worker.terminate()});
    for(const info of selected){
      check(signal);const page=await pdf.getPage(info.pageNumber),base=page.getViewport({scale:1});
      let rasterScale=Math.max(.25,Math.min(6,Number(scale)||3)),viewport=page.getViewport({scale:rasterScale});
      while(Math.ceil(viewport.width/stride)*Math.ceil(viewport.height/stride)>limit&&rasterScale>.1){rasterScale*=.9;viewport=page.getViewport({scale:rasterScale});}
      const columns=Math.ceil(viewport.width/stride),rows=Math.ceil(viewport.height/stride),native=info.text.length>0;let found=0,tile=0;
      for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
        check(signal);const left=col*stride,top=row*stride,width=Math.min(side,Math.ceil(viewport.width-left)),height=Math.min(side,Math.ceil(viewport.height-top));
        const canvas=createCanvas(width,height);canvas.width=width;canvas.height=height;
        try{
          tile++;onProgress?.({phase:'ocr',page:info.pageNumber,tile,total:columns*rows});
          const task=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[1,0,0,1,-left,-top],background:'rgb(255,255,255)'});
          await bounded(task.promise,{signal,onCancel:()=>task.cancel()});
          const result=await bounded(worker.recognize(await imageFor(canvas),{},{blocks:true,text:true}),{signal,onCancel:()=>worker.terminate()});
          for(const word of wordsOf(result.data)){
            const str=String(word.text||'').trim(),bbox=word.bbox,confidence=Number(word.confidence)||0;
            if(!str||!bbox||confidence<minConfidence||(native&&!tag(str)))continue;
            const candidate={str,x:(left+bbox.x0)/viewport.width,y:(top+bbox.y0)/viewport.height,width:(bbox.x1-bbox.x0)/viewport.width,height:(bbox.y1-bbox.y0)/viewport.height,source:'ocr',confidence};
            const duplicate=info.text.some(t=>t.str===str&&Math.abs(t.x-candidate.x)<Math.max(t.width,candidate.width,.002)&&Math.abs(t.y-candidate.y)<Math.max(t.height,candidate.height,.002));
            if(!duplicate){info.text.push(candidate);found++;}
          }
        }finally{canvas.width=1;canvas.height=1;}
      }
      info.ocr={tiles:tile,scale:rasterScale,minConfidence,candidates:found,confirmed:false};
      issues.push(`Page ${info.pageNumber}: local OCR proposed ${found} text candidates; verify every identity and symbol against the original.`);
      page.cleanup();
    }
    return {issues};
  }finally{cancelled=true;if(worker)await worker.terminate();resource?.dispose();}
}
