import { AI_MODELS, getModel } from './ai-models.mjs';

const abort = signal => { if (signal?.aborted) throw new DOMException('AI operation cancelled','AbortError'); };
const progress = (callback, stage, detail={}) => callback?.({stage,...detail});
const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
function softmax(values) { const max=Math.max(...values); const exps=Array.from(values,v=>Math.exp(v-max)); const sum=exps.reduce((a,b)=>a+b,0); return exps.map(v=>v/sum); }
async function bufferOf(value) {
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (ArrayBuffer.isView(value)) return value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength);
  if (value?.arrayBuffer) return value.arrayBuffer();
  throw new TypeError('Provide model files as ArrayBuffer, typed array, or File.');
}
async function verified(file, value) {
  const bytes=await bufferOf(value);
  if(bytes.byteLength!==file.bytes) throw new Error(`Model size mismatch: ${file.name}; expected ${file.bytes} bytes.`);
  if(!globalThis.crypto?.subtle) throw new Error('Model verification requires a secure context (HTTPS or localhost).');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
  if(hash!==file.sha256) throw new Error(`Model checksum mismatch: ${file.name}.`);
  return bytes;
}
function canvasOf(width,height) {
  if(typeof OffscreenCanvas!=='undefined') return new OffscreenCanvas(width,height);
  if(typeof document==='undefined') throw new Error('AI image processing requires browser canvas support.');
  const c=document.createElement('canvas'); c.width=width; c.height=height; return c;
}
function normalizedPixels(canvas,width,height,sourceRect) {
  const scaled=canvasOf(width,height), ctx=scaled.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
  if(sourceRect) ctx.drawImage(canvas,...sourceRect,0,0,width,height); else ctx.drawImage(canvas,0,0,width,height);
  const rgba=ctx.getImageData(0,0,width,height).data, data=new Float32Array(3*width*height);
  const mean=[.485,.456,.406], std=[.229,.224,.225];
  for(let p=0;p<width*height;p++) for(let c=0;c<3;c++) data[c*width*height+p]=(rgba[4*p+c]/255-mean[c])/std[c];
  return data;
}
export function decodeTableOutput(outputs,width,height,threshold=.5) {
  const logits=outputs.logits, boxes=outputs.pred_boxes;
  if(!logits || !boxes || logits.dims.at(-1)!==7 || boxes.dims.at(-1)!==4) throw new Error('Unexpected Table Transformer output schema.');
  const labels=['table','table column','table row','table column header','table projected row header','table spanning cell'], proposals=[];
  for(let i=0;i<logits.data.length/7;i++) {
    const scores=softmax(logits.data.slice(i*7,(i+1)*7)), label=scores.indexOf(Math.max(...scores));
    if(label===6 || scores[label]<threshold) continue;
    const [cx,cy,w,h]=boxes.data.slice(i*4,(i+1)*4);
    const bbox={x0:clamp((cx-w/2)*width,0,width),y0:clamp((cy-h/2)*height,0,height),x1:clamp((cx+w/2)*width,0,width),y1:clamp((cy+h/2)*height,0,height)};
    if(bbox.x1>bbox.x0 && bbox.y1>bbox.y0) proposals.push({kind:'region',label:labels[label],confidence:scores[label],bbox,reviewRequired:true});
  }
  return proposals;
}

/** An isolated model manager. It never receives or mutates job/RF state. */
export function createAIEngine({assetBase='./ai/',fetchImpl=globalThis.fetch?.bind(globalThis),indexedDB=globalThis.indexedDB}={}) {
  const loaded=new Map(), sessions=new Map(); let runtimePromise, dbPromise, running=false;
  const absoluteBase=()=>new URL(assetBase,globalThis.document?.baseURI || globalThis.location?.href || 'http://localhost/').href;
  async function database() {
    if(!indexedDB) return null;
    if(!dbPromise) dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('carpe-noctum-ai-models-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('packs');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    return dbPromise;
  }
  async function cached(id,value) {
    const db=await database();if(!db)return null;
    return new Promise((resolve,reject)=>{const tx=db.transaction('packs',value===undefined?'readonly':'readwrite');const store=tx.objectStore('packs');const req=value===undefined?store.get(id):value===null?store.delete(id):store.put(value,id);let result;req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || new Error('Model cache transaction aborted.'));});
  }
  async function runtime() {
    if(!runtimePromise) runtimePromise=(async()=>{
      const ort=await import('onnxruntime-web');
      ort.env.wasm.wasmPaths=absoluteBase();ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
      return ort;
    })();
    return runtimePromise;
  }
  function requireFiles(id) { const files=loaded.get(id);if(!files)throw new Error(`Load the ${getModel(id).label} model pack before running it.`);return files; }
  async function disposeSession(id) { const s=sessions.get(id);sessions.delete(id);if(s){const resolved=await s;await (resolved.destroy?.() ?? resolved.release?.());} }
  async function loadLocalModelBytes(id, input, {signal,onProgress,persist=true}={}) {
    const model=getModel(id);abort(signal);if(running)throw new Error('Wait for the AI operation to finish before replacing a model.');
    const entries=Array.isArray(input) || (typeof FileList!=='undefined' && input instanceof FileList) ? Object.fromEntries(Array.from(input,f=>[f.name,f])) : input;
    const files={};
    for(const file of model.files) {abort(signal);if(!entries?.[file.name])throw new Error(`Missing model file: ${file.name}`);progress(onProgress,'verifying',{file:file.name});files[file.name]=await verified(file,entries[file.name]);}
    abort(signal);await disposeSession(id);
    let cacheWarning=null;
    if(persist) {try {await cached(id,files);}catch {cacheWarning='Model loaded for this session; persistent storage was unavailable.';}}
    loaded.set(id,files);progress(onProgress,'ready',{modelId:id});return {...model,loaded:true,cacheWarning};
  }
  async function restoreModel(id,options={}) {getModel(id);abort(options.signal);const files=await cached(id);if(!files)return false;await loadLocalModelBytes(id,files,{...options,persist:false});return true;}
  async function downloadModel(id,{signal,onProgress,source}={}) {
    const model=getModel(id);abort(signal);const origin=source || (model.bundled?'bundled':'remote');
    if(!['bundled','remote'].includes(origin))throw new Error('Unknown model download source.');
    const files={};let completed=0;
    for(const file of model.files) {
      abort(signal); const url=origin==='bundled'?new URL(`models/${id}/${file.name}`,absoluteBase()).href:file.url;
      progress(onProgress,'downloading',{file:file.name,loaded:completed,total:model.bytes});
      const response=await fetchImpl(url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response?.ok)throw new Error(`Could not load ${file.name} (${response?.status ?? 'no response'}).`);
      if(response.body?.getReader) {
        const reader=response.body.getReader(), chunks=[];let count=0;
        try {while(true){abort(signal);const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>file.bytes)throw new Error(`Model size mismatch: ${file.name}.`);chunks.push(value);progress(onProgress,'downloading',{file:file.name,loaded:completed+count,total:model.bytes});}}
        catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
        const bytes=new Uint8Array(count);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}files[file.name]=bytes.buffer;
      } else files[file.name]=await response.arrayBuffer();
      completed+=files[file.name].byteLength;
    }
    return loadLocalModelBytes(id,files,{signal,onProgress});
  }
  async function session(id) {
    if(sessions.has(id))return sessions.get(id);
    const files=requireFiles(id);
    const promise=(async()=>{
      const ort=await runtime();
      if(id==='pp-ocrv6-tiny' || id==='uvdoc-unwarp') {
        const ocr=requireFiles('pp-ocrv6-tiny');
        const {PaddleOcrService}=await import('ppu-paddle-ocr/web');
        const model={detection:ocr['PP-OCRv6_tiny_det.onnx'],recognition:ocr['PP-OCRv6_tiny_rec.onnx'],charactersDictionary:ocr['ppocrv6_tiny_dict.txt']};
        if(id==='uvdoc-unwarp')model.unwarping=files['UVDoc_grid.onnx'];
        const service=new PaddleOcrService({model,session:{executionProviders:['wasm'],graphOptimizationLevel:'all'},processing:{engine:'canvas-native'},unwarping:{enabled:id==='uvdoc-unwarp'},detection:{maxSideLength:1536},recognition:{minimumConfidence:.35},debugging:{debug:false,verbose:false}});
        try {await service.initialize();return service;}catch(error){await service.destroy().catch(()=>{});throw error;}
      }
      return ort.InferenceSession.create(files[getModel(id).files[0].name],{executionProviders:['wasm'],graphOptimizationLevel:'all'});
    })();sessions.set(id,promise);
    try{return await promise;}catch(error){sessions.delete(id);throw error;}
  }
  async function runModel(id,canvas,{signal,onProgress,threshold=.5}={}) {
    const model=getModel(id);abort(signal);
    for(const required of [id,...(model.dependencies || [])]) {if(!loaded.has(required))await restoreModel(required,{signal,onProgress});requireFiles(required);}
    if(running)throw new Error('Another AI operation is running. Wait for it to finish.');
    if(!canvas || !Number.isFinite(canvas.width) || !Number.isFinite(canvas.height) || canvas.width<1 || canvas.height<1)throw new Error('Choose a valid page or image crop.');
    if(canvas.width*canvas.height>24000000)throw new Error('Choose a smaller crop (maximum 24 megapixels).');
    running=true;
    try {
      const base={modelId:id,kind:model.kind,width:canvas.width,height:canvas.height,reviewRequired:true};
      let result;
      if(id==='pp-doclayout-v3' || id==='florence2-base') {
        const {runVisionModel}=await import('./ai-vision.mjs');
        result=await runVisionModel(id,canvas,{files:requireFiles(id),signal,onProgress,assetBase:absoluteBase()});
      } else {
      progress(onProgress,'initializing',{modelId:id});const s=await session(id);abort(signal);progress(onProgress,'running',{modelId:id});
      if(id==='pp-ocrv6-tiny') {
        const raw=await s.recognize(canvas,{flatten:true,noCache:true});
        result={...base,text:raw.text,confidence:raw.confidence,proposals:raw.results.map(r=>({kind:'text',text:r.text,confidence:r.confidence,bbox:{x0:r.box.x,y0:r.box.y,x1:r.box.x+r.box.width,y1:r.box.y+r.box.height},reviewRequired:true}))};
      } else if(id==='uvdoc-unwarp') {
        const raw=await s.unwarp(canvas);
        const blob=raw.canvas.convertToBlob ? await raw.canvas.convertToBlob({type:'image/png'}) : await new Promise(resolve=>raw.canvas.toBlob(resolve,'image/png'));
        if(!blob)throw new Error('Could not encode corrected image.');
        result={...base,status:raw.status,reason:raw.reason,correctedImage:new Uint8Array(await blob.arrayBuffer()),correctedWidth:raw.canvas.width,correctedHeight:raw.canvas.height,proposals:raw.status==='unwarped'?[{kind:'image-correction',label:'Flattened page preview',reviewRequired:true}]:[]};
      } else {
        const ort=await runtime();let feeds;
        if(id==='pp-lcnet-orientation') {
          // Paddle's published inference.yml: resize short side to 256, center crop 224.
          const cropSize=224*Math.min(canvas.width,canvas.height)/256;
          const data=normalizedPixels(canvas,224,224,[(canvas.width-cropSize)/2,(canvas.height-cropSize)/2,cropSize,cropSize]);
          feeds={[s.inputNames[0]]:new ort.Tensor('float32',data,[1,3,224,224])};
        } else {
          const scale=800/Math.max(canvas.width,canvas.height),w=Math.max(1,Math.round(canvas.width*scale)),h=Math.max(1,Math.round(canvas.height*scale));
          feeds={pixel_values:new ort.Tensor('float32',normalizedPixels(canvas,w,h),[1,3,h,w])};
          if(s.inputNames.includes('pixel_mask'))feeds.pixel_mask=new ort.Tensor('int64',new BigInt64Array(w*h).fill(1n),[1,h,w]);
        }
        let outputs;
        try {
          outputs=await s.run(feeds);
          if(id==='pp-lcnet-orientation') {
            const values=Array.from(outputs[s.outputNames[0]].data);if(values.length!==4)throw new Error('Unexpected orientation output schema.');
            const sum=values.reduce((a,b)=>a+b,0),scores=values.every(v=>v>=0&&v<=1)&&Math.abs(sum-1)<.001?values:softmax(values);
            const index=scores.indexOf(Math.max(...scores)),orientation=index*90;
            result={...base,orientation,scores,proposals:[{kind:'rotation',orientation,rotateDegrees:(360-orientation)%360,confidence:scores[index],reviewRequired:true}]};
          } else result={...base,proposals:decodeTableOutput(outputs,canvas.width,canvas.height,threshold)};
        } finally {Object.values(feeds).forEach(t=>t.dispose?.());if(outputs)Object.values(outputs).forEach(t=>t.dispose?.());}
      }
      }
      for(const p of result.proposals || []) {p.type=p.kind;if(p.bbox)p.bounds={x:p.bbox.x0/canvas.width,y:p.bbox.y0/canvas.height,width:(p.bbox.x1-p.bbox.x0)/canvas.width,height:(p.bbox.y1-p.bbox.y0)/canvas.height};}
      abort(signal);progress(onProgress,'complete',{modelId:id});return result;
    } finally {running=false;}
  }
  async function unloadModel(id,{removeCached=false}={}) {getModel(id);if(running)throw new Error('Wait for the AI operation to finish.');await disposeSession(id);if(id==='pp-ocrv6-tiny')await disposeSession('uvdoc-unwarp');loaded.delete(id);if(removeCached)await cached(id,null);}
  async function createOCRWorker({signal,onProgress}={}) {
    if(!loaded.has('pp-ocrv6-tiny')) {if(!await restoreModel('pp-ocrv6-tiny',{signal,onProgress}))await downloadModel('pp-ocrv6-tiny',{signal,onProgress,source:'bundled'});}
    return {setParameters:async()=>{},recognize:async(image,options={})=>{
      let canvas=image;
      if(typeof image==='string' || image instanceof Blob) {
        if(typeof image==='string' && !image.startsWith('data:') && !image.startsWith('blob:'))throw new Error('OCR accepts local image data only.');
        const blob=typeof image==='string'?await (await fetchImpl(image)).blob():image,bitmap=await createImageBitmap(blob);canvas=canvasOf(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
      }
      const result=await runModel('pp-ocrv6-tiny',canvas,{signal:options.signal || signal,onProgress});
      return {data:{text:result.text,confidence:result.confidence*100,words:result.proposals.map(p=>({text:p.text,confidence:p.confidence*100,bbox:p.bbox}))}};
    },terminate:async()=>{await unloadModel('pp-ocrv6-tiny');}};
  }
  async function modelStatus(id) {const model=getModel(id);const inMemory=loaded.has(id);let installed=inMemory;if(!installed){try{const db=await database();if(db)installed=await new Promise((resolve,reject)=>{const req=db.transaction('packs','readonly').objectStore('packs').getKey(id);req.onsuccess=()=>resolve(req.result!==undefined);req.onerror=()=>reject(req.error);});}catch{installed=false;}}return {id,installed,loaded:inMemory,status:inMemory?'ready':installed?'installed':'missing',bytes:model.bytes};}
  const clearModel=id=>unloadModel(id,{removeCached:true});
  return {modelStatus,clearModel,listModels:()=>AI_MODELS.map(p=>({...p,loaded:loaded.has(p.id)})),loadLocalModelBytes,downloadModel,restoreModel,runModel,unloadModel,createOCRWorker};
}
const defaultEngine=createAIEngine();
export const listModels=(...args)=>defaultEngine.listModels(...args);
export const loadLocalModelBytes=(...args)=>defaultEngine.loadLocalModelBytes(...args);
export const downloadModel=(...args)=>defaultEngine.downloadModel(...args);
export const restoreModel=(...args)=>defaultEngine.restoreModel(...args);
export const runModel=(...args)=>defaultEngine.runModel(...args);
export const unloadModel=(...args)=>defaultEngine.unloadModel(...args);
export const createOCRWorker=(...args)=>defaultEngine.createOCRWorker(...args);

export const modelStatus=(...args)=>defaultEngine.modelStatus(...args);
export const clearModel=(...args)=>defaultEngine.clearModel(...args);
