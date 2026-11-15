const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/ai');fs.mkdirSync(out,{recursive:true});
const ort=path.join(root,'node_modules/onnxruntime-web/dist/ort.wasm.min.mjs');
const florenceEntry=path.join(__dirname,'ai-transformers.mjs');
(async()=>{ await esbuild.build({entryPoints:[path.join(__dirname,'ai-entry.mjs')],outfile:path.join(out,'engine.js'),bundle:true,format:'iife',globalName:'CarpeAI',platform:'browser',target:'es2022',conditions:['browser','onnxruntime-web-use-extern-wasm'],minifyIdentifiers:true,minifySyntax:true,minifyWhitespace:false,legalComments:'eof',plugins:[{name:'single-local-cpu-runtime',setup(build){
build.onResolve({filter:/^onnxruntime-web(?:\/(?:wasm|webgpu|all))?$/},()=>({path:ort}));
build.onResolve({filter:/^@huggingface\/transformers$/},()=>({path:florenceEntry}));
// Pinned source includes Node adapters that are unreachable in this browser worker.
build.onResolve({filter:/^node:/},args=>({path:args.path,namespace:'browser-node-stub'}));
build.onLoad({filter:/.*/,namespace:'browser-node-stub'},()=>({contents:'export default {}; export const Readable = {}; export const pipeline = undefined; export const createRequire = undefined;'}));
build.onResolve({filter:/^sharp$/},()=>({path:'sharp',namespace:'browser-sharp-stub'}));
build.onLoad({filter:/.*/,namespace:'browser-sharp-stub'},()=>({contents:'export default undefined;'}));
build.onResolve({filter:/^\.\/onnx-node\.js$/},args=>args.resolveDir.endsWith('/backends')?{path:'onnx-node',namespace:'browser-onnx-stub'}:null);
build.onLoad({filter:/.*/,namespace:'browser-onnx-stub'},()=>({contents:'export default {};'}));
}}]});
for(const name of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs'])fs.copyFileSync(path.join(root,'node_modules/onnxruntime-web/dist',name),path.join(out,name));
fs.copyFileSync(path.join(__dirname,'ai-worker.js'),path.join(out,'worker.js'));
fs.cpSync(path.join(__dirname,'licenses'),path.join(out,'licenses'),{recursive:true});
fs.copyFileSync(path.join(__dirname,'AI-NOTICES.md'),path.join(out,'NOTICES.md'));
console.log('Built isolated local AI runtime:',out);

})().catch(e=>{console.error(e);process.exitCode=1;});
