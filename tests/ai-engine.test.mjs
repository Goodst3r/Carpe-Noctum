import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_MODELS, getModel } from '../app/ai-models.mjs';
import { createAIEngine, decodeTableOutput } from '../app/ai-engine.mjs';

test('model packs pin exact bytes and immutable public URLs', () => {
  for (const pack of AI_MODELS) {
    assert.ok(pack.files.length);
    assert.equal(pack.bytes, pack.files.reduce((n,f) => n + f.bytes, 0));
    for (const f of pack.files) {
      assert.match(f.sha256, /^[0-9a-f]{64}$/);
      assert.match(f.url, /\/resolve\/[0-9a-f]{40}\//);
    }
  }
  assert.throws(() => getModel('unknown'), /Unknown model/);
});
test('missing model cannot trigger an inference download', async () => {
  let calls = 0;
  const engine = createAIEngine({ fetchImpl: () => {calls++;throw Error('network');}, indexedDB: null });
  await assert.rejects(engine.runModel('pp-ocrv6-tiny', {width: 100,height:100}), /Load.*model/i);
  assert.equal(calls, 0);
});
test('local imports reject truncated models atomically', async () => {
  const engine = createAIEngine({indexedDB:null});
  const files = Object.fromEntries(getModel('pp-ocrv6-tiny').files.map(f => [f.name,new Uint8Array([1,2,3])]));
  await assert.rejects(engine.loadLocalModelBytes('pp-ocrv6-tiny', files), /size/i);
  assert.equal(engine.listModels().find(x=>x.id==='pp-ocrv6-tiny').loaded,false);
});
test('cancelled loading performs no request', async () => {
  let calls=0;
  const engine=createAIEngine({indexedDB:null,fetchImpl:()=>{calls++;}});
  const controller=new AbortController(); controller.abort();
  await assert.rejects(engine.downloadModel('pp-ocrv6-tiny',{signal:controller.signal}),{name:'AbortError'});
  assert.equal(calls,0);
});
test('table output rejects background and returns normalized review boxes', () => {
  const result=decodeTableOutput({logits:{dims:[1,2,7],data:Float32Array.from([0,8,0,0,0,0,-4,0,0,0,0,0,0,8])},pred_boxes:{dims:[1,2,4],data:Float32Array.from([.5,.5,.4,.8,.5,.5,1,1])}},1000,500);
  assert.equal(result.length,1);
  assert.equal(result[0].label,'table column');
  assert.ok(Math.abs(result[0].bbox.x0-300)<.001);
  assert.equal(result[0].reviewRequired,true);
});
test('same-sized substituted weights fail SHA-256 verification', async () => {
  const engine=createAIEngine({indexedDB:null});
  const model=getModel('pp-lcnet-orientation'), file=model.files[0];
  await assert.rejects(engine.loadLocalModelBytes(model.id,{[file.name]:new Uint8Array(file.bytes)}),/checksum mismatch/);
  assert.deepEqual(await engine.modelStatus(model.id),{id:model.id,installed:false,loaded:false,status:'missing',bytes:model.bytes});
});
test('oversized download is cancelled before it can enter the model cache', async () => {
  let cancelled=false;
  const model=getModel('pp-lcnet-orientation'), file=model.files[0];
  const stream=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(file.bytes+1));},cancel(){cancelled=true;}});
  const engine=createAIEngine({indexedDB:null,fetchImpl:async()=>new Response(stream)});
  await assert.rejects(engine.downloadModel(model.id),/size mismatch/);
  assert.equal(cancelled,true);
  assert.equal((await engine.modelStatus(model.id)).installed,false);
});
test('bundled loading requests only local assets and never falls back to a CDN', async () => {
  const urls=[];
  const engine=createAIEngine({indexedDB:null,assetBase:'https://example.test/private-app/ai/',fetchImpl:async(url,options)=>{urls.push(url);assert.equal(options.credentials,'omit');return new Response('',{status:404});}});
  await assert.rejects(engine.downloadModel('pp-ocrv6-tiny'),/Could not load/);
  assert.deepEqual(urls,['https://example.test/private-app/ai/models/pp-ocrv6-tiny/PP-OCRv6_tiny_det.onnx']);
});

// Opt-in because weights are intentionally excluded from Git and the ordinary test install.
// CARPE_AI_MODEL_DIR=/absolute/path/to/verified/packs node --test tests/ai-engine.test.mjs
// Runs actual ONNX graphs in Chromium; all image fixtures below are synthetic.
test('real offline browser OCR, rotation, unwarp and table inference', {skip:!process.env.CARPE_AI_MODEL_DIR,timeout:120000}, async () => {
  const {mkdtemp,writeFile,copyFile,symlink,readFile,rm,mkdir}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');const {join,resolve,extname}=await import('node:path');
  const {createServer}=await import('node:http');const {existsSync}=await import('node:fs');
  const {build}=await import('esbuild');const {chromium}=await import('playwright');
  const directory=await mkdtemp(join(tmpdir(),'carpe-ai-test-'));let browser,server;
  try {
    await mkdir(join(directory,'ai'));await symlink(resolve(process.env.CARPE_AI_MODEL_DIR),join(directory,'ai/models'),'dir');
    await build({entryPoints:[new URL('../app/ai-engine.mjs',import.meta.url).pathname],bundle:true,format:'iife',globalName:'AI',platform:'browser',alias:{'onnxruntime-web':'onnxruntime-web/wasm','onnxruntime-web/webgpu':'onnxruntime-web/wasm'},outfile:join(directory,'engine.js'),logLevel:'silent'});
    for(const name of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs'])await copyFile(new URL('../node_modules/onnxruntime-web/dist/'+name,import.meta.url),join(directory,'ai',name));
    await writeFile(join(directory,'index.html'),'<!doctype html><script src="engine.js"></script><canvas width="1000" height="600"></canvas>');
    server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const file=join(directory,path==='/'?'index.html':path);if(!file.startsWith(directory+'/'))throw Error();const bytes=await readFile(file);const types={'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.wasm':'application/wasm'};res.setHeader('Content-Type',types[extname(file)] || 'application/octet-stream');res.end(bytes);}catch{res.statusCode=404;res.end();}});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin=`http://127.0.0.1:${server.address().port}`;
    browser=await chromium.launch({headless:true,...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const page=await browser.newPage();
    const external=[];await page.route('**/*',route=>{if(!route.request().url().startsWith(origin)){external.push(route.request().url());return route.abort();}return route.continue();});
    await page.goto(origin);
    const results=await page.evaluate(async()=>{
      const c=document.querySelector('canvas'),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1000,600);ctx.fillStyle='black';ctx.font='bold 42px Arial';ctx.fillText('CARPE NOCTUM',60,80);ctx.font='34px Arial';ctx.fillText('MAIN 250 FT',60,150);ctx.fillText('NODE A12',60,220);ctx.fillText('57 MHz 31 dBmV',60,290);
      const engine=AI.createAIEngine({assetBase:'./ai/'}),results={};
      for(const id of ['pp-ocrv6-tiny','pp-lcnet-orientation','uvdoc-unwarp','table-transformer'])await engine.downloadModel(id,{source:'bundled'});
      results.ocr=await engine.runModel('pp-ocrv6-tiny',c);results.orientations=[];
      for(const angle of [0,90,180,270]){const r=new OffscreenCanvas(angle%180?c.height:c.width,angle%180?c.width:c.height),rc=r.getContext('2d');rc.translate(r.width/2,r.height/2);rc.rotate(angle*Math.PI/180);rc.drawImage(c,-c.width/2,-c.height/2);results.orientations.push((await engine.runModel('pp-lcnet-orientation',r)).orientation);}
      const unwarp=await engine.runModel('uvdoc-unwarp',c);results.unwarp={status:unwarp.status,reason:unwarp.reason,bytes:unwarp.correctedImage.byteLength};
      ctx.fillStyle='white';ctx.fillRect(0,0,1000,600);ctx.strokeStyle='black';ctx.lineWidth=2;ctx.fillStyle='black';ctx.font='30px Arial';const values=[['NODE','CABLE','FEET'],['A12','500','250'],['B14','625','180'],['C16','750','300']];
      for(let row=0;row<4;row++)for(let col=0;col<3;col++){ctx.strokeRect(40+col*300,40+row*120,300,120);ctx.fillText(values[row][col],65+col*300,110+row*120);}
      results.table=(await engine.runModel('table-transformer',c)).proposals;
      await engine.unloadModel('pp-ocrv6-tiny');
      // A new manager must recover checksummed cached weights without invoking fetch.
      const offline=AI.createAIEngine({assetBase:'./ai/',fetchImpl:()=>{throw Error('Unexpected model network request');}});
      results.cachedStatus=await offline.modelStatus('pp-ocrv6-tiny');results.offline=await offline.runModel('pp-ocrv6-tiny',c);return results;
    });
    assert.match(results.ocr.text,/CARPE NOCTUM/);assert.match(results.ocr.text,/MAIN 250 FT/);assert.ok(results.ocr.proposals.length>=4);
    assert.deepEqual(results.orientations,[0,90,180,270]);
    assert.ok(['skipped','unwarped'].includes(results.unwarp.status));assert.ok(results.unwarp.bytes>100);
    assert.equal(results.table.filter(p=>p.label==='table column').length,3);assert.equal(results.table.filter(p=>p.label==='table row').length,4);
    assert.equal(results.cachedStatus.installed,true);assert.equal(results.cachedStatus.loaded,false);assert.match(results.offline.text,/CABLE/);assert.deepEqual(external,[]);
  } finally {await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});
