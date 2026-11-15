import fs from 'node:fs/promises';import path from 'node:path';import{createHash}from'node:crypto';import{AI_MODELS}from'../app/ai-models.mjs';
const cache=process.env.CARPE_AI_MODEL_DIR||path.resolve('.cache/ai-models');
for(const pack of AI_MODELS.filter(p=>p.bundled))for(const file of pack.files){
 const target=path.join(cache,pack.id,file.name);let bytes;
 try{bytes=await fs.readFile(target);}catch{const r=await fetch(file.url);if(!r.ok)throw Error(`Model download failed: ${file.name} (${r.status})`);bytes=Buffer.from(await r.arrayBuffer());await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);}
 if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error(`AI asset checksum failed: ${file.name}`);
 const out=path.resolve('artifacts/ai/models',pack.id,file.name);await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,bytes);
}
await fs.writeFile('artifacts/ai/model-manifest.json',JSON.stringify(AI_MODELS,null,2)+'\n');
console.log('Verified bundled Tiny AI model files. Other packs are optional.');
