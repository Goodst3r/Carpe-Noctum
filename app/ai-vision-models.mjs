/** Optional, user-chosen vision packs. Importing this manifest loads no model or runtime. */
const PADDLE_REPO = 'snowfluke/ppu-paddle-ocr-models';
const PADDLE_REV = '3cbb26882389013ed863b66a78e52376b5ff0f0a';
const FLORENCE_REPO = 'onnx-community/Florence-2-base-ft';
const FLORENCE_REV = 'e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f';

function file(path, bytes, sha256, repo, revision) {
  return Object.freeze({name:path.split('/').at(-1), path, bytes, sha256, repo, revision,
    url:`https://huggingface.co/${repo}/resolve/${revision}/${path}`});
}
const paddle = (path, bytes, sha) => file(path, bytes, sha, PADDLE_REPO, PADDLE_REV);
const florence = (path, bytes, sha) => file(path, bytes, sha, FLORENCE_REPO, FLORENCE_REV);

const packs = [
  {
    id:'pp-doclayout-v3', label:'PP-DocLayoutV3', kind:'layout', license:'Apache-2.0', bundled:false,
    source:'https://huggingface.co/PaddlePaddle/PP-DocLayoutV3',
    description:'Suggest document regions and reading order. Requires 129.9 MB of optional model weights; cannot identify cable topology or RF readings.',
    files:[
      paddle('layout/PP-DocLayoutV3.onnx',129920689,'dc5670ebbb42e2ba4e41395fc55e8217b007134e8b9e35023d592a8fe040a288'),
      paddle('layout/PP-DocLayoutV3_labels.txt',265,'a04c55c3bb398fe7c5ece52d279eb26a905f9645cd58c0c812fb9de3c4790f46'),
    ],
  },
  {
    id:'florence2-base', label:'Florence-2 base fine-tuned', kind:'caption', license:'MIT', bundled:false,
    source:'https://huggingface.co/onnx-community/Florence-2-base-ft',
    description:'Suggest a caption for a selected plan crop. Experimental and fallible; cannot establish electrical connections or RF values.',
    files:[
      florence('onnx/vision_encoder_quantized.onnx',93746540,'3b79d54f23f666f731549db23cb070c35a979ce19cbd9720e90e67a78dc9768c'),
      florence('onnx/embed_tokens_quantized.onnx',39390433,'6b2258db1c8ee9b160576ccde3cd3814d83a2edaed0dd1c6ca9ff3c38fa62214'),
      florence('onnx/encoder_model_quantized.onnx',43651493,'f4ad7a68f1fb875d3bcf735ea14a7021b7ba7e83baf7cf10289881b4ed6d9b85'),
      florence('onnx/decoder_model_merged_quantized.onnx',98177697,'f22f52f980c33df0efa15932c2f3db6d9d3595ce6387eca938b8cfe23dc4c641'),
      florence('config.json',5432,'d90c22ed72eb55291f183fcd9b98ebd3bd3d92bfcffb6c7f6e1606085e793525'),
      florence('generation_config.json',292,'7b8eb17bbd6cf8a07f619ad83ae03881eff05b6b9237bab89005b40e77783c29'),
      florence('preprocessor_config.json',2673,'c892857e34a7082284983a7717717d39c9bf7e574f1f41d80d4c918c97502efa'),
      florence('special_tokens_map.json',146627,'72ff172dc769bc1551b1b4211628ce3271643bc60379e4da45d85a9be9332c39'),
      florence('tokenizer.json',2297961,'d69dcdb2323e124ac4f800cb9863ddccea0d7bb11e16125e8df3bd60f2f8aeac'),
      florence('tokenizer_config.json',197658,'d8e64607233cb53b619fb46664f6cad08176c26e0e8735b2d30d888364f19600'),
      florence('added_tokens.json',22410,'ba67457c577895525996e7a42d7da60a05856506ea4fd25ff9a023a64662f74b'),
      florence('merges.txt',456318,'1ce1664773c50f3e0cc8842619a93edc4624525b728b188a9e0be33b7726adc5'),
      florence('vocab.json',1099884,'394fdc63c71aabe0a9b97117f5d62fb5fcc4d59b2b3ea929a3929e6a53217b3c'),
    ],
  },
];

export const VISION_MODELS = Object.freeze(Object.fromEntries(packs.map(pack => [pack.id, Object.freeze({
  ...pack, files:Object.freeze(pack.files), bytes:pack.files.reduce((sum,f)=>sum+f.bytes,0), reviewRequired:true,
})])));
