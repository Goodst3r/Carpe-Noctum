// Private integration probe: controlled test connections, never plant-topology certification.
import {readFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
if(!process.env.CARPE_UPDATED_PDF||!process.env.CARPE_ONX)throw new Error('Set CARPE_UPDATED_PDF and CARPE_ONX to private local originals.');
const canvas=await import('@napi-rs/canvas');Object.assign(globalThis,{DOMMatrix:canvas.DOMMatrix,ImageData:canvas.ImageData,Path2D:canvas.Path2D});
globalThis.PDFLib=await import('pdf-lib');
globalThis.pdfjsLib=await import('pdfjs-dist/legacy/build/pdf.mjs');
const {importMap,layoutTombstones,exportMap}=await import(root+'/app/maps.mjs');const{parseONX,replaceSweep}=await import(root+'/app/io.mjs');const{evaluateRoute}=await import(root+'/app/rf.mjs');
const bytes=new Uint8Array(await readFile(process.env.CARPE_UPDATED_PDF)),sweep=await parseONX(new Uint8Array(await readFile(process.env.CARPE_ONX)),{connection:'tp',testPointLoss:20});
assert.equal(sweep.samples.length,98);assert.deepEqual([sweep.samples[0],sweep.samples.at(-1)],[[57,31.4],[753,43.3]]);
const map=await importMap(bytes);const a=map.nodes.find(n=>n.kind==='active'&&n.map),e=map.nodes.find(n=>n.kind==='eol'&&n.map);assert.ok(a&&e);
const amp={...a,id:'a',modelId:'gm-hgd-40',settings:{director:'dc8'},map:{...a.map,confirmed:true}};const eol={...e,id:'e',modelId:'eol',map:{...e.map,confirmed:true}};
let job={schema:1,split:'low',id:'probe',name:'Controlled calculation test',map:{sha256:map.sha256,pages:map.pages},nodes:[{id:'n',name:'HA0005',kind:'node',modelId:'gs7k'},amp,eol],edges:[{id:'na',from:'n',to:'a',port:'4',cableId:'p3_500',lengthFt:100,confirmed:true},{id:'ae',from:'a',to:'e',port:'aux1',cableId:'p3_500',lengthFt:100,confirmed:true}],portSweeps:{},placements:{}};
job=replaceSweep(job,'n','4',sweep);const calc=evaluateRoute(job);assert.equal(calc.frequencies.length,98);
const start=performance.now(),layout=layoutTombstones(job,calc),layoutMs=performance.now()-start;assert.equal(layout.length,2);assert.ok(layout.every(b=>b.lines.length<=32));assert.ok(layoutMs<2000);
const exportStart=performance.now();const first=await exportMap(bytes,job,calc),second=await exportMap(bytes,job,calc);const exportMs=performance.now()-exportStart;
for(const out of [first,second]){const doc=await globalThis.pdfjsLib.getDocument({data:new Uint8Array(out),verbosity:0,useSystemFonts:true}).promise;let count=0;for(let i=1;i<=doc.numPages;i++){const p=await doc.getPage(i),text=await p.getTextContent();count+=text.items.filter(t=>t.str.includes('Carpe Noctum |')).length;}assert.equal(count,2);await doc.destroy();}
assert.equal(createHash('sha256').update(bytes).digest('hex'),map.sha256);
console.log(JSON.stringify({controlledTestTopology:true,samples:98,activeIdentities:map.nodes.filter(n=>n.kind==='active').length,eolIdentities:map.nodes.filter(n=>n.kind==='eol').length,tombstones:layout.length,maxLines:Math.max(...layout.map(x=>x.lines.length)),layoutMs:Number(layoutMs.toFixed(2)),twoExportsMs:Number(exportMs.toFixed(2)),duplicateFree:true,sourceUnchanged:true}));
