import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountAITools} from '../app/ai-ui.mjs';

test('model download is explicit and its progress remains visible after reattachment', async()=>{
  const dom=new JSDOM('<div id="a"></div><div id="b"></div>',{url:'https://example.test'});
  let release; const downloads=[];
  const client={modelStatus:async()=>({installed:false}),downloadModel:async(id,opts)=>{downloads.push([id,opts.source]); opts.onProgress({progress:.5}); await new Promise(r=>release=r);},clearModel:async()=>{}};
  const view=mountAITools(dom.window.document.querySelector('#a'),null,{client});
  assert.equal(downloads.length,0);
  dom.window.document.querySelector('[data-ai=download]').click();
  await new Promise(r=>setTimeout(r,0));
  view.attach(dom.window.document.querySelector('#b'));
  assert.match(dom.window.document.querySelector('#b').textContent,/50%/);
  assert.equal(downloads[0][0],'pp-ocrv6-tiny');
  release(); await new Promise(r=>setTimeout(r,0));
  view.dispose();
});

test('local model import passes file bytes by name for verification', async()=>{
  const dom=new JSDOM('<div id="a"></div>',{url:'https://example.test'}); let received;
  const client={modelStatus:async()=>({installed:false}),loadLocalModelBytes:async(id,files)=>{received={id,files};}};
  const host=dom.window.document.querySelector('#a'); const view=mountAITools(host,null,{client});
  const input=host.querySelector('[data-ai-files]');
  Object.defineProperty(input,'files',{value:[{name:'model.onnx',size:2,arrayBuffer:async()=>new Uint8Array([1,2]).buffer}]});
  input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,0));
  assert.equal(received.id,'pp-ocrv6-tiny');
  assert.deepEqual([...received.files['model.onnx']],[1,2]);
  view.dispose();
});

test('image analysis shows returned suggestions for review', async()=>{
  const dom=new JSDOM('<div id="a"></div>',{url:'https://example.test'}); let imageSeen;
  const originalCreate=URL.createObjectURL, originalRevoke=URL.revokeObjectURL;
  URL.createObjectURL=()=> 'blob:preview'; URL.revokeObjectURL=()=>{};
  try {
    const client={modelStatus:async()=>({installed:true}),runModel:async(id,image)=>{imageSeen=image;return {kind:'ocr',text:'A1',reviewRequired:true};}};
    const host=dom.window.document.querySelector('#a');const view=mountAITools(host,null,{client});
    const image={name:'local.png',size:8};const input=host.querySelector('[data-ai-image]');Object.defineProperty(input,'files',{value:[image]});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    host.querySelector('[data-ai=run]').click();await new Promise(r=>setTimeout(r,0));
    assert.equal(imageSeen,image);assert.match(host.textContent,/A1/);assert.match(host.textContent,/review/i);view.dispose();
  } finally { URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke; }
});
