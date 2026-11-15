/* Same-origin local runtime. Input photos are never sent to a service. */
importScripts('./engine.js');
const engine=CarpeAI.createAIEngine({assetBase:new URL('./',self.location.href).href});
self.onmessage=async({data})=>{
 const{id,method,args,options}=data;let bitmap,canvas;
 try{
  if(!['modelStatus','clearModel','downloadModel','loadLocalModelBytes','runModel'].includes(method))throw Error('Unsupported AI action');
  const opts={...options,onProgress:progress=>self.postMessage({id,progress})};
  if(method==='runModel'){
   bitmap=await createImageBitmap(new Blob([args[1]]));
   if(bitmap.width*bitmap.height>16000000)throw Error('Image exceeds the 16-megapixel local AI limit. Crop it first.');
   canvas=new OffscreenCanvas(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,0,0);args[1]=canvas;
  }
  const result=await engine[method](...args,opts);self.postMessage({id,result});
 }catch(error){self.postMessage({id,error:{name:error.name,message:error.message}});}
 finally{bitmap?.close();if(canvas){canvas.width=1;canvas.height=1;}}
};
