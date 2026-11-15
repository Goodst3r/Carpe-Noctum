/** The UI only exchanges local bytes with an isolated, disposable inference worker. */
let shared;
export function createAIClient({workerFactory}={}) {
  if(!workerFactory && shared)return shared;
  let worker,serial=0;const pending=new Map();
  const abortError=()=>new DOMException('AI operation cancelled','AbortError');
  function dispose(reason=abortError()) {worker?.terminate();worker=null;for(const p of pending.values()){p.cleanup();p.reject(reason);}pending.clear();}
  function start(){
    if(worker)return worker;
    if(!workerFactory && (!globalThis.Worker || globalThis.location?.protocol==='file:'))throw new Error('AI tools require the installed web app or Android app. Core calculators remain available in standalone HTML.');
    worker=workerFactory?workerFactory():new Worker(new URL('ai/worker.js',document.baseURI).href,{name:'CarpeNoctumAI'});
    worker.addEventListener('message',({data})=>{const p=pending.get(data.id);if(!p)return;if(data.progress){p.onProgress?.(data.progress);return;}pending.delete(data.id);p.cleanup();if(data.error){const e=new Error(data.error.message);e.name=data.error.name||'Error';p.reject(e);}else p.resolve(data.result);});
    worker.addEventListener('error',e=>dispose(new Error(e.message||'Local AI worker failed.')));return worker;
  }
  async function call(method,args=[],options={}) {
    if(options.signal?.aborted)throw abortError();
    const current=start(),id=++serial;
    return new Promise((resolve,reject)=>{const cancel=()=>dispose();const cleanup=()=>options.signal?.removeEventListener('abort',cancel);pending.set(id,{resolve,reject,cleanup,onProgress:options.onProgress});options.signal?.addEventListener('abort',cancel,{once:true});const safe={...options};delete safe.signal;delete safe.onProgress;current.postMessage({id,method,args,options:safe});});
  }
  async function imageBytes(input) {
    if(input instanceof Uint8Array)return input;
    if(input instanceof ArrayBuffer)return new Uint8Array(input);
    if(input?.arrayBuffer)return new Uint8Array(await input.arrayBuffer());
    if(input?.convertToBlob)return new Uint8Array(await(await input.convertToBlob({type:'image/png'})).arrayBuffer());
    if(input?.toBlob){const b=await new Promise((resolve,reject)=>input.toBlob(v=>v?resolve(v):reject(Error('Image encoding failed.')),'image/png'));return new Uint8Array(await b.arrayBuffer());}
    throw new Error('Choose a local image or canvas.');
  }
  const api={
    downloadModel:(id,options)=>call('downloadModel',[id],options),
    modelStatus:id=>call('modelStatus',[id]),clearModel:id=>call('clearModel',[id]),
    async loadLocalModelBytes(id,files,options){const values={};for(const [name,value]of Object.entries(files)){values[name]=value?.arrayBuffer?await value.arrayBuffer():value;}return call('loadLocalModelBytes',[id,values],options);},
    async runModel(id,image,options){if(options?.signal?.aborted)throw abortError();return call('runModel',[id,await imageBytes(image)],options);},
    async createOCRWorker(options={}){
      const status=await api.modelStatus('pp-ocrv6-tiny');if(!status.installed)await api.downloadModel('pp-ocrv6-tiny',{...options,source:'bundled'});
      let ended=false;
      return {setParameters:async()=>{},terminate:async()=>{ended=true;dispose();},recognize:async image=>{if(ended)throw abortError();const r=await api.runModel('pp-ocrv6-tiny',image,options);return{data:{text:r.text||'',words:r.proposals.filter(p=>p.text&&p.bbox).map(p=>({text:p.text,confidence:(p.confidence??0)*100,bbox:p.bbox}))}};}};
    },dispose
  };
  if(!workerFactory)shared=api;return api;
}
