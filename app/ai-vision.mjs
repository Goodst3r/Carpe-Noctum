import { VISION_MODELS } from './ai-vision-models.mjs';
import {env,Florence2Processor,Florence2ForConditionalGeneration,RawImage} from '@huggingface/transformers';

export { VISION_MODELS };

const DOC_SIZE = 800;
const DOC_LABELS = 'abstract algorithm aside_text chart content display_formula doc_title figure_title footer footer_image footnote formula_number header header_image image inline_formula number paragraph_title reference reference_content seal table text vertical_text vision_footnote'.split(' ');

function abortIfNeeded(signal) {
  if (signal?.aborted) throw new DOMException('Model run cancelled', 'AbortError');
}

function checkCanvas(canvas) {
  if (!Number.isSafeInteger(canvas?.width) || !Number.isSafeInteger(canvas?.height) || canvas.width <= 0 || canvas.height <= 0) {
    throw new Error('Vision model needs a nonempty canvas');
  }
  if (typeof canvas.getContext !== 'function') throw new Error('Vision model needs a readable canvas');
}

function cubicWeight(distance) {
  const x = Math.abs(distance), a = -.75; // OpenCV INTER_CUBIC coefficient.
  if (x <= 1) return (a + 2) * x ** 3 - (a + 3) * x ** 2 + 1;
  if (x < 2) return a * x ** 3 - 5 * a * x ** 2 + 8 * a * x - 4 * a;
  return 0;
}

function cubicAxis(sourceSize) {
  return Array.from({length:DOC_SIZE}, (_,at) => {
    const pos = (at + .5) * sourceSize / DOC_SIZE - .5;
    const start = Math.floor(pos) - 1;
    return Array.from({length:4},(_,offset) => ({
      index:clamp(start + offset,0,sourceSize - 1),
      weight:cubicWeight(pos - start - offset),
    }));
  });
}

/** Mirrors the official inference.yml: 800x800 cubic resize, RGB / 255, CHW. */
export function prepareDocLayoutInput(canvas) {
  checkCanvas(canvas);
  const {width, height} = canvas;
  const rgba = canvas.getContext('2d', {willReadFrequently:true})?.getImageData(0, 0, width, height)?.data;
  if (!rgba || rgba.length !== width * height * 4) throw new Error('Cannot read canvas pixels for DocLayout');
  const plane = DOC_SIZE * DOC_SIZE;
  const data = new Float32Array(plane * 3);
  const xs = cubicAxis(width), ys = cubicAxis(height);
  for (let y = 0; y < DOC_SIZE; y++) {
    for (let x = 0; x < DOC_SIZE; x++) {
      const out = y * DOC_SIZE + x;
      for (let channel = 0; channel < 3; channel++) {
        let value = 0;
        for (const yy of ys[y]) for (const xx of xs[x]) {
          value += rgba[4 * (yy.index * width + xx.index) + channel] * yy.weight * xx.weight;
        }
        data[channel * plane + out] = clamp(Math.round(value),0,255) / 255;
      }
    }
  }
  return {data, dims:[1,3,DOC_SIZE,DOC_SIZE], imShape:[DOC_SIZE,DOC_SIZE],
    scaleFactor:[DOC_SIZE / height,DOC_SIZE / width]};
}

function clamp(value, lo, hi) { return Math.max(lo, Math.min(hi, value)); }

/** The mirrored ONNX graph returns fetch_name_0 [N,7], fetch_name_1 [1], fetch_name_2 [1,200,200]. */
export function decodeDocLayoutOutput(output, width, height) {
  const boxes = output?.fetch_name_0;
  const count = output?.fetch_name_1;
  const orderMatrix = output?.fetch_name_2;
  if (!boxes || !count || !orderMatrix || boxes.dims?.at(-1) !== 7 || count.dims?.length !== 1 || orderMatrix.dims?.at(-1) !== 200) {
    throw new Error('Unsupported PP-DocLayoutV3 ONNX output signature');
  }
  const n = Number(count.data?.[0]);
  if (!Number.isInteger(n) || n < 0 || n > boxes.data.length / 7) throw new Error('Invalid PP-DocLayoutV3 box count');
  const proposals = [];
  for (let i = 0; i < n; i++) {
    const [labelId, confidence, ax, ay, bx, by, rawOrder] = boxes.data.subarray(i*7, i*7+7);
    if (!Number.isInteger(labelId) || !DOC_LABELS[labelId] || !Number.isFinite(confidence) || confidence < .5) continue;
    if (![ax,ay,bx,by].every(Number.isFinite)) continue;
    const x0 = clamp(Math.min(ax,bx),0,width), x1 = clamp(Math.max(ax,bx),0,width);
    const y0 = clamp(Math.min(ay,by),0,height), y1 = clamp(Math.max(ay,by),0,height);
    if (x1 <= x0 || y1 <= y0) continue;
    const proposal = {kind:'region', label:DOC_LABELS[labelId], confidence:clamp(confidence,0,1),
      bbox:{x0,y0,x1,y1}, reviewRequired:true};
    // The seventh field is the model's candidate reading-order rank.
    if (Number.isInteger(rawOrder) && rawOrder >= 0) proposal.readingOrder = rawOrder;
    proposals.push(proposal);
  }
  return proposals;
}

function requireFiles(pack, files) {
  if (!files || typeof files !== 'object') throw new Error('Missing verified local model files');
  for (const spec of pack.files) {
    const bytes = files[spec.name];
    const size = bytes?.byteLength;
    if (!size) throw new Error(`Missing verified local model file: ${spec.name}`);
    if (size !== spec.bytes) throw new Error(`Local model file size mismatch: ${spec.name}`);
  }
}

function bytesOf(file) {
  if (file instanceof Uint8Array) return file;
  if (file instanceof ArrayBuffer) return new Uint8Array(file);
  throw new Error('Vision model files must be verified ArrayBuffers or Uint8Arrays');
}

async function runDocLayout(canvas, options) {
  const {files, signal, onProgress, assetBase} = options;
  if (typeof WebAssembly === 'undefined') throw new Error('PP-DocLayoutV3 needs WebAssembly in this browser');
  abortIfNeeded(signal);
  onProgress?.({stage:'preprocessing',modelId:'pp-doclayout-v3'});
  const input = prepareDocLayoutInput(canvas);
  abortIfNeeded(signal);
  const ort = await import('onnxruntime-web');
  ort.env.wasm.wasmPaths = new URL(assetBase, globalThis.document?.baseURI ?? globalThis.location?.href ?? 'http://localhost/').href;
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  let session;
  try {
    session = await ort.InferenceSession.create(bytesOf(files['PP-DocLayoutV3.onnx']), {executionProviders:['wasm']});
    const names = [...session.inputNames].sort().join(',');
    if (names !== 'im_shape,image,scale_factor') throw new Error(`Unsupported PP-DocLayoutV3 ONNX input signature: ${names}`);
    abortIfNeeded(signal);
    onProgress?.({stage:'inferencing',modelId:'pp-doclayout-v3'});
    const output = await session.run({
      image:new ort.Tensor('float32',input.data,input.dims),
      im_shape:new ort.Tensor('float32',Float32Array.from(input.imShape),[1,2]),
      scale_factor:new ort.Tensor('float32',Float32Array.from(input.scaleFactor),[1,2]),
    });
    abortIfNeeded(signal);
    const proposals = decodeDocLayoutOutput(output,canvas.width,canvas.height);
    return {modelId:'pp-doclayout-v3',kind:'layout',width:canvas.width,height:canvas.height,
      proposals,reviewRequired:true};
  } finally { await session?.release(); }
}

async function runFlorence(canvas, options) {
  const {files, signal, onProgress, assetBase} = options;
  if (typeof WebAssembly === 'undefined') throw new Error('Florence-2 needs WebAssembly in this browser');
  abortIfNeeded(signal);
  const pack = VISION_MODELS['florence2-base'];
  const byPath = new Map(pack.files.map(spec => [spec.path, bytesOf(files[spec.name])]));
  const revision = pack.files[0].revision;
  const repo = pack.files[0].repo;
  const urlPrefix = `https://huggingface.co/${repo}/resolve/${revision}/`;
  const cache = {
    async match(request) {
      const key = String(request);
      let path = key.startsWith(urlPrefix) ? key.slice(urlPrefix.length) : null;
      if (path === null) {
        const localPrefix = `${env.localModelPath}${repo}/`;
        if (key.startsWith(localPrefix)) path = key.slice(localPrefix.length);
      }
      const bytes = byPath.get(path);
      return bytes ? new Response(bytes.slice(), {headers:{'content-length':String(bytes.byteLength)}}) : undefined;
    },
    async put() { throw new Error('Florence model cache is read only'); },
  };
  const prior = {allowRemoteModels:env.allowRemoteModels, allowLocalModels:env.allowLocalModels,
    useCustomCache:env.useCustomCache, customCache:env.customCache, useBrowserCache:env.useBrowserCache,
    useFSCache:env.useFSCache, wasmPaths:env.backends.onnx?.wasm?.wasmPaths};
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.useCustomCache = true;
  env.customCache = cache;
  env.useBrowserCache = false;
  env.useFSCache = false;
  env.backends.onnx.wasm.wasmPaths = new URL(assetBase, globalThis.document?.baseURI ?? globalThis.location?.href ?? 'http://localhost/').href;
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;
  let model;
  try {
    const common = {revision,local_files_only:true};
    onProgress?.({stage:'loading',modelId:'florence2-base'});
    const processor = await Florence2Processor.from_pretrained(repo,common);
    abortIfNeeded(signal);
    model = await Florence2ForConditionalGeneration.from_pretrained(repo,{...common,dtype:'q8',device:'wasm'});
    abortIfNeeded(signal);
    const image = await RawImage.read(canvas);
    const task = '<MORE_DETAILED_CAPTION>';
    const inputs = await processor(image,processor.construct_prompts(task));
    onProgress?.({stage:'inferencing',modelId:'florence2-base'});
    const ids = await model.generate({...inputs,max_new_tokens:100});
    abortIfNeeded(signal);
    const decoded = processor.batch_decode(ids,{skip_special_tokens:false})[0];
    const parsed = processor.post_process_generation(decoded,task,image.size);
    const text = String(parsed[task] ?? '').trim();
    return {modelId:'florence2-base',kind:'caption',width:canvas.width,height:canvas.height,
      proposals:text ? [{kind:'text',text,confidence:null,bbox:null,reviewRequired:true}] : [],
      text,reviewRequired:true};
  } finally {
    await model?.dispose();
    Object.assign(env, {allowRemoteModels:prior.allowRemoteModels,allowLocalModels:prior.allowLocalModels,
      useCustomCache:prior.useCustomCache,customCache:prior.customCache,
      useBrowserCache:prior.useBrowserCache,useFSCache:prior.useFSCache});
    if (prior.wasmPaths !== undefined) env.backends.onnx.wasm.wasmPaths = prior.wasmPaths;
  }
}

/** Runs only already verified user-selected local weights. No model download path exists here. */
export async function runVisionModel(id, canvas, {files,signal,onProgress,assetBase='./ai/'} = {}) {
  const pack = VISION_MODELS[id];
  if (!pack) throw new Error(`Unknown vision model: ${id}`);
  abortIfNeeded(signal);
  requireFiles(pack,files);
  checkCanvas(canvas);
  return id === 'pp-doclayout-v3'
    ? runDocLayout(canvas,{files,signal,onProgress,assetBase})
    : runFlorence(canvas,{files,signal,onProgress,assetBase});
}
