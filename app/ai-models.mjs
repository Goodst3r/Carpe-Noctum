import { VISION_MODELS } from './ai-vision-models.mjs';
/** Public, pinned model metadata. Importing this file never loads a runtime or weights. */
const PADDLE = 'snowfluke/ppu-paddle-ocr-models';
const REVISION = '3cbb26882389013ed863b66a78e52376b5ff0f0a';
function file(name, path, bytes, sha256, repo=PADDLE, revision=REVISION) {
  return Object.freeze({name,path,bytes,sha256,repo,revision,url:`https://huggingface.co/${repo}/resolve/${revision}/${path}`});
}
const packs = [
  { id:'pp-ocrv6-tiny', label:'PP-OCRv6 Tiny', kind:'ocr', license:'Apache-2.0', bundled:true,
    description:'Read text and propose text boxes. Does not infer electrical connections.',
    files:[
      file('PP-OCRv6_tiny_det.onnx','detection/PP-OCRv6_tiny_det.onnx',1780590,'193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8'),
      file('PP-OCRv6_tiny_rec.onnx','recognition/PP-OCRv6_tiny_rec.onnx',4462639,'9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6'),
      file('ppocrv6_tiny_dict.txt','recognition/ppocrv6_tiny_dict.txt',27157,'2f3717bbd530b681b6db3be35cc485e8a41a932b9558b833986bf0894eb21f2d') ] },
  { id:'pp-lcnet-orientation', label:'PP-LCNet page orientation', kind:'orientation', license:'Apache-2.0', bundled:false,
    description:'Suggest a quarter-turn correction for a document photo.',
    files:[file('PP-LCNet_x1_0_doc_ori.onnx','correction/PP-LCNet_x1_0_doc_ori.onnx',6715311,'d85b3185075afca1a83157f73eac2e52b598d72e9d47dd19cc4a2f3605e23e3f')] },
  { id:'uvdoc-unwarp', label:'UVDoc page unwarping', kind:'unwarp', license:'Apache-2.0', bundled:false, dependencies:['pp-ocrv6-tiny'],
    description:'Preview a flattened photographed page. The correction can crop edges; review before use.',
    files:[file('UVDoc_grid.onnx','correction/UVDoc_grid.onnx',31587333,'5f7c399b3ecd8c9ba965cfa0a8ec5f5dd6e3ca6deef7b61a47b1b10dea54f168')] },
  { id:'table-transformer', label:'Table Transformer', kind:'table', license:'MIT', bundled:false,
    description:'Propose rows, columns and spanning regions in a selected table crop. Does not read cell text.',
    files:[file('model_quantized.onnx','onnx/model_quantized.onnx',30178496,'83841e84bedb3af591a07888cf518333c88055ae0ab7bbd936c9289c5d8da82b','Xenova/table-transformer-structure-recognition-v1.1-all','76c3afa174a0f36bafa9438934f57dcdb6e486a5')] }
];
export const AI_MODELS = Object.freeze([...packs,...Object.values(VISION_MODELS)].map(p => Object.freeze({...p, files:Object.freeze(p.files), bytes:p.files.reduce((n,f)=>n+f.bytes,0), source:`https://huggingface.co/${p.files[0].repo}`, reviewRequired:true})));
export const MODEL_MANIFEST = AI_MODELS;
export function getModel(id) { const model=AI_MODELS.find(p=>p.id===id); if(!model) throw new Error(`Unknown model: ${id}`); return model; }
export function listModels() { return AI_MODELS.map(p=>({...p})); }
