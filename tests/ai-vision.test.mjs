import test from 'node:test';
import assert from 'node:assert/strict';
import { VISION_MODELS } from '../app/ai-vision-models.mjs';
import { prepareDocLayoutInput, decodeDocLayoutOutput, runVisionModel } from '../app/ai-vision.mjs';

test('optional vision packs pin complete local files', () => {
  for (const pack of Object.values(VISION_MODELS)) {
    assert.equal(pack.bundled, false);
    assert.ok(pack.files.length);
    assert.equal(pack.bytes, pack.files.reduce((sum, f) => sum + f.bytes, 0));
    for (const f of pack.files) {
      assert.match(f.sha256, /^[a-f0-9]{64}$/);
      assert.match(f.url, /\/resolve\/[a-f0-9]{40}\//);
      assert.ok(f.bytes > 0);
    }
  }
});

test('DocLayout preprocessing follows 800 square RGB 0..1, CHW and original scale', () => {
  const canvas = {width: 2, height: 1, getContext: () => ({
    getImageData: () => ({data: Uint8ClampedArray.from([255, 0, 0, 255, 0, 128, 255, 255])}),
  })};
  const input = prepareDocLayoutInput(canvas);
  assert.deepEqual(input.dims, [1, 3, 800, 800]);
  assert.deepEqual(input.imShape, [800, 800]);
  assert.deepEqual(input.scaleFactor, [800, 400]);
  assert.equal(input.data[0], 1);
  assert.equal(input.data[800 * 800], 0);
  assert.equal(input.data[2 * 800 * 800], 0);
  assert.ok(input.data[799] < .01);
  assert.ok(input.data[800 * 800 + 799] > .49);
});

test('DocLayout graph output produces review regions and reading order, never RF values', () => {
  const output = {
    fetch_name_0: {dims:[2,7], data:Float32Array.from([22,.9,20,10,100,50,1, 21,.7,0,0,40,20,0])},
    fetch_name_1: {dims:[1], data:Int32Array.from([2])},
    fetch_name_2: {dims:[1,200,200], data:new Int32Array(40000)},
  };
  const result = decodeDocLayoutOutput(output, 200, 100);
  assert.equal(result.length, 2);
  assert.equal(result[0].label, 'text');
  assert.equal(result[0].reviewRequired, true);
  assert.equal(result[0].readingOrder, 1);
  assert.deepEqual(result[0].bbox, {x0:20,y0:10,x1:100,y1:50});
  assert.ok(result.every(p => p.kind === 'region' && !('rf' in p)));
});

test('missing Florence components fail before the runtime or network can start', async () => {
  let calls = 0;
  const priorFetch = globalThis.fetch;
  globalThis.fetch = () => { calls++; throw Error('network'); };
  try {
    await assert.rejects(runVisionModel('florence2-base', {width:100,height:100}, {files:{}}), /Missing verified local model file/);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = priorFetch; }
});

test('minimal Florence registry resolves only its four pinned q8 model sessions', async () => {
  const {Florence2ForConditionalGeneration} = await import('../app/ai-transformers.mjs');
  const {get_model_files} = await import('../node_modules/@huggingface/transformers/src/utils/model_registry/get_model_files.js');
  assert.equal(typeof Florence2ForConditionalGeneration.from_pretrained,'function');
  const selected = await get_model_files('onnx-community/Florence-2-base-ft',{
    config:{model_type:'florence2',architectures:['Florence2ForConditionalGeneration'],
      is_encoder_decoder:true,text_config:{model_type:'bart'}}, dtype:'q8',device:'wasm',
  });
  assert.deepEqual(selected.filter(path => path.endsWith('.onnx')).sort(), [
    'onnx/decoder_model_merged_quantized.onnx',
    'onnx/embed_tokens_quantized.onnx',
    'onnx/encoder_model_quantized.onnx',
    'onnx/vision_encoder_quantized.onnx',
  ]);
});
