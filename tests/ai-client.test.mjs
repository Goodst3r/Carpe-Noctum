import test from 'node:test';import assert from 'node:assert/strict';
import {createAIClient} from '../app/ai-client.mjs';
class WorkerStub {listeners={};terminated=false;addEventListener(t,f){this.listeners[t]=f;}postMessage(m){if(m.type==='cancel')return;queueMicrotask(()=>this.listeners.message({data:{id:m.id,result:m.method==='modelStatus'?{installed:true,status:'installed'}:{ok:true,method:m.method}}}));}terminate(){this.terminated=true;}}
test('AI client starts lazily and routes calls through an isolated worker',async()=>{let starts=0;const c=createAIClient({workerFactory:()=>{starts++;return new WorkerStub();}});assert.equal(starts,0);const s=await c.modelStatus('pp-ocrv6-tiny');assert.equal(s.installed,true);assert.equal(starts,1);assert.equal((await c.clearModel('pp-ocrv6-tiny')).method,'clearModel');c.dispose();});
test('cancelled AI operations reject without starting inference',async()=>{let starts=0;const c=createAIClient({workerFactory:()=>{starts++;return new WorkerStub();}}),a=new AbortController();a.abort();await assert.rejects(c.downloadModel('pp-ocrv6-tiny',{signal:a.signal}),{name:'AbortError'});assert.equal(starts,0);c.dispose();});
test('map OCR termination stops an in-flight inference worker and releases its pending call',async()=>{
 let worker;const c=createAIClient({workerFactory:()=>worker=new WorkerStub()});
 const ocr=await c.createOCRWorker();worker.postMessage=()=>{};
 const pending=ocr.recognize(new Uint8Array([1]));await Promise.resolve();await Promise.resolve();
 const rejection=assert.rejects(pending,{name:'AbortError'});await ocr.terminate();await rejection;
 assert.equal(worker.terminated,true);await assert.rejects(ocr.recognize(new Uint8Array([1])),{name:'AbortError'});
});
