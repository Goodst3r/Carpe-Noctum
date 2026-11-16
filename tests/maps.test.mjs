import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts, PDFName, PDFNumber, degrees } from 'pdf-lib';
import { DOMMatrix, ImageData, Path2D, createCanvas } from '@napi-rs/canvas';
Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
globalThis.PDFLib = await import('pdf-lib');
globalThis.pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
const { importMap, extractSchedules, renderPage, exportMap, layoutTombstones } = await import('../app/maps.mjs');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const word = (str,x,y,width=str.length*.008,height=.012) => ({str,x,y,width,height});
const page = (pageNumber,text) => ({pageNumber,width:1000,height:800,text});

// Changing extraction to column-order guesses or reading design values must fail this case.
test('schedule parsing bounds TAG, NAME, DLA and power independently, carries continuation and changes section mid-page', () => {
  const p1 = page(2,[word('ACTIVES - 1',.01,.03),word('TAG',.01,.09),word('NAME',.12,.09),word('MODEL',.3,.09),word('DLA',.72,.09),word('POWER SUPPLY',.8,.09),
    word('A1',.01,.14),word('ALPHA',.11,.14),word('DO_NOT_IMPORT',.3,.14),word('49',.55,.14),word('0',.72,.14),word('PS-A',.8,.14)]);
  const p2 = page(3,[word('A2',.01,.04),word('BETA',.11,.04),word('OLD_MODEL',.3,.04),word('125',.72,.04),word('PS-B',.8,.04),
    word('EOL - 1',.01,.3),word('TAG',.01,.36),word('D',.2,.36),word('A',.3,.36),word('E1',.01,.41),word('12.34',.2,.41),word('8.1',.3,.41)]);
  const p3 = page(4,[word('E2',.01,.03),word('99',.2,.03)]);
  const r=extractSchedules([p1,p2,p3]);
  assert.deepEqual(r.nodes.map(n=>[n.tag,n.name,n.kind]), [['A1','ALPHA','active'],['A2','BETA','active'],['E1','E1','eol'],['E2','E2','eol']]);
  assert.deepEqual(r.nodes[0].schedule,{page:2,dla:0,powerSupply:'PS-A'});
  assert.equal(r.nodes[1].schedule.dla,125);
  for(const n of r.nodes){assert.equal(n.modelId,'');assert.equal(n.readings,undefined);assert.deepEqual(n.settings,{});assert.equal('model' in n.schedule,false);}
  assert.equal(r.nodes[2].schedule.page,3);
});

async function synthetic() {
  const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica);
  const p=d.addPage([600,400]);
  p.drawText('A1',{x:60,y:300,size:10,font});p.drawText('E1',{x:360,y:300,size:10,font});
  p.drawLine({start:{x:72,y:295},end:{x:365,y:295},thickness:1});
  p.drawText('Original flattened field note',{x:40,y:350,size:10,font});
  const link=d.context.obj({Type:'Annot',Subtype:'Link',Rect:[40,340,180,360],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:globalThis.PDFLib.PDFString.of('https://example.org/')}});
  p.node.set(PDFName.of('Annots'),d.context.obj([d.context.register(link)]));
  const s=d.addPage([1000,800]);
  for(const [text,x,y] of [['ACTIVES - 1',10,760],['TAG',10,720],['NAME',120,720],['MODEL',300,720],['DLA',720,720],['POWER SUPPLY',800,720],['A1',10,680],['AMP_ALPHA',110,680],['WRONG_MODEL',300,680],['0',720,680],['PS-A',800,680],['EOL - 1',10,550],['TAG',10,510],['E1',10,470],['41',200,470]])s.drawText(text,{x,y,size:12,font});
  const rotated=d.addPage([500,700]);rotated.setCropBox(25,35,400,600);rotated.setRotation(degrees(90));rotated.node.set(PDFName.of('UserUnit'),PDFNumber.of(2));rotated.drawText('Rotated original',{x:50,y:500,size:12,font});
  return d.save();
}

test('native PDF import preserves per-page geometry and proposes unconfirmed identities without treating schedule levels as sweeps',async()=>{
  const bytes=await synthetic(),before=sha(bytes),r=await importMap(bytes);
  assert.equal(r.sha256,before);assert.equal(sha(bytes),before);assert.equal(r.pages.length,3);
  assert.deepEqual(r.pages.map(p=>[p.width,p.height]),[[600,400],[1000,800],[1200,800]]);
  assert.equal(r.pages[2].rotation,90);assert.equal(r.pages[2].userUnit,2);
  assert.ok(r.pages[0].vectors.length>0);assert.equal(r.pages[0].annotations.length,1);
  assert.equal(r.nodes.length,2);assert.equal(r.nodes[0].name,'AMP_ALPHA');assert.equal(r.nodes[0].map.page,1);assert.equal(r.nodes[0].map.confirmed,false);
  assert.ok(Math.abs(r.nodes[0].map.x-.11)<.03);assert.equal(r.nodes[0].readings,undefined);
  assert.ok(r.edges.length>=1);assert.ok(r.edges.every(e=>e.confirmed===false&&e.port===''));
});

test('renderPage uses the requested page viewport and retains the immutable source bytes',async()=>{
  const bytes=await synthetic(),before=sha(bytes),canvas=createCanvas(600,400);
  const result=await renderPage(bytes,3,canvas);
  assert.equal(result.pageNumber,3);assert.equal(result.rotation,90);assert.equal(sha(bytes),before);
  assert.ok(canvas.width>canvas.height);assert.ok(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.some(v=>v!==0));
});

test('PDF export verifies original hash, retains original contents and annotation, groups all output legs once and uses saved displayed placement',async()=>{
  const bytes=await synthetic(),r=await importMap(bytes),n={...r.nodes[0],id:'amp',modelId:'hgd',map:{...r.nodes[0].map,page:3,confirmed:true}};
  const job={schema:1,map:{sha256:r.sha256,pages:r.pages},nodes:[n],edges:[],placements:{amp:{page:3,x:.25,y:.2}}};
  const evaluation={frequencies:[57,753],stations:{amp:{input:[[57,10],[753,20]],outputs:{main:[[57,31],[753,43]],aux1:[[57,29],[753,41]],aux2:[[57,28],[753,40]]},targets:{main:[[57,31],[753,43]]},issues:[]}}};
  const out=await exportMap(bytes,job,evaluation),out2=await exportMap(bytes,job,evaluation),d=await PDFDocument.load(out);
  assert.equal(d.getPageCount(),4);assert.equal(d.getPage(0).node.Annots().size(),1);assert.equal(d.getPage(2).getRotation().angle,90);assert.deepEqual(d.getPage(2).getCropBox(),{x:25,y:35,width:400,height:600});assert.equal(d.getPage(2).node.get(PDFName.of('UserUnit')).asNumber(),2);
  const parsed=await importMap(out),text=parsed.pages.map(p=>p.text.map(t=>t.str).join(' '));
  assert.match(text[0],/Original flattened field note/);assert.equal(text.filter(t=>t.includes('Carpe Noctum | A1')).length,1);
  assert.match(text[2],/main/);assert.match(text[2],/aux1/);assert.match(text[2],/aux2/);
  const title=parsed.pages[2].text.find(t=>t.str.includes('Carpe Noctum | A1'));assert.ok(Math.abs(title.x-.25)<.03);assert.ok(Math.abs(title.y-.2)<.04);
  const p2=await importMap(out2);assert.equal(p2.pages.flatMap(p=>p.text).filter(t=>t.str.includes('Carpe Noctum | A1')).length,1);
  await assert.rejects(()=>exportMap(out,job,evaluation),/original|hash/i);
  await assert.rejects(()=>exportMap(bytes,{...job,placements:{amp:{page:1,x:.1,y:.1}}},evaluation),/same page/i);
  assert.equal(sha(bytes),r.sha256);
});

const privateFixtures=[
 [process.env.CARPE_UPDATED_PDF,76,84,4,true,'updated'],
 [process.env.CARPE_WALKOUT_PDF,50,78,3,false,'walkout']
];
for(const [path,activeCount,eolCount,eolStart,hasNativeLabels,label]of privateFixtures)test(`private local replay ${label} (opt-in)`,{skip:!path},async()=>{
  const bytes=new Uint8Array(await readFile(path)),r=await importMap(bytes);
  assert.equal(r.nodes.filter(n=>/^A\d+$/.test(n.tag)&&n.kind==='active').length,activeCount);
  assert.equal(r.nodes.filter(n=>/^E\d+$/.test(n.tag)&&n.kind==='eol').length,eolCount);
  assert.equal(r.nodes.find(n=>n.tag==='E1').schedule.page,eolStart);
  const actives=r.nodes.filter(n=>n.kind==='active');
  assert.ok(actives.every(n=>Number.isFinite(n.schedule.dla)));assert.ok(actives.every(n=>typeof n.schedule.powerSupply==='string'&&n.schedule.powerSupply.length>0));
  assert.equal(actives.filter(n=>n.schedule.dla===0).length,1);
  const labeled=r.nodes.filter(n=>/^[AE]\d+$/.test(n.tag));
  if(hasNativeLabels)assert.equal(labeled.filter(n=>n.map).length,activeCount+eolCount);
  else {assert.equal(labeled.filter(n=>n.map).length,0);assert.ok(r.issues.some(s=>/no native map symbol/.test(s)));}
  assert.ok(r.pages[0].vectors.length>100);assert.ok(r.nodes.every(n=>n.modelId===''&&!n.readings));
});

test('unconfirmed active and EOL symbol proposals do not produce certified export tombstones',async()=>{
  const bytes=await synthetic(),r=await importMap(bytes);
  const out=await exportMap(bytes,{map:{sha256:r.sha256},nodes:r.nodes,placements:{}},{stations:{}});
  const result=await importMap(out);
  assert.equal(result.pages.flatMap(p=>p.text).filter(t=>t.str.includes('Carpe Noctum |')).length,0);
});

test('optional local OCR reads a real raster-only PDF into unconfirmed normalized identity proposals and releases its worker',async()=>{
  const { createWorker }=await import('tesseract.js');
  const c=createCanvas(600,400),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,600,400);ctx.fillStyle='black';ctx.font='48px Arial';ctx.fillText('A24',55,120);ctx.fillText('E42',360,300);
  const d=await PDFDocument.create(),p=d.addPage([600,400]),image=await d.embedPng(c.toBuffer('image/png'));p.drawImage(image,{x:0,y:0,width:600,height:400});const bytes=await d.save();
  assert.equal((await importMap(bytes)).nodes.length,0);
  let terminated=false;
  const result=await importMap(bytes,{ocr:{createCanvas,scale:2,maxTiles:4,tileSize:512,minConfidence:40,createWorker:async()=>{
    const worker=await createWorker('eng',1,{langPath:new URL('../night-sweep/vendor/map/',import.meta.url).pathname,cacheMethod:'none',gzip:true});
    const terminate=worker.terminate.bind(worker);worker.terminate=async()=>{terminated=true;return terminate();};return worker;
  }}});
  assert.ok(result.nodes.some(n=>n.tag==='A24'));assert.ok(result.nodes.some(n=>n.tag==='E42'));
  assert.ok(result.pages[0].text.some(t=>t.source==='ocr'));assert.ok(result.pages[0].ocr.tiles>=1&&result.pages[0].ocr.tiles<=4);
  assert.ok(result.nodes.every(n=>n.map?.confirmed===false));assert.equal(terminated,true);
});

test('cancelled imports reject with AbortError before starting PDF or OCR work',async()=>{
  const c=new AbortController();c.abort();
  await assert.rejects(()=>importMap(new Uint8Array([0]),{signal:c.signal,ocr:true}),e=>e.name==='AbortError');
});

test('shared tombstone layout clamps saved rectangles and groups every leg with the same export font metrics',async()=>{
  const bytes=await synthetic(),r=await importMap(bytes),node={...r.nodes[0],map:{...r.nodes[0].map,confirmed:true}};
  const job={map:r,nodes:[node],placements:{[node.id]:{page:1,x:.99,y:.99,width:.2}}};
  const evaluation={stations:{[node.id]:{input:[[57,10]],outputs:{main:[[57,31]],aux1:[[57,29]],aux2:[[57,28]]}}}};
  const layout=layoutTombstones(job,evaluation);
  assert.equal(layout.length,1);assert.equal(layout[0].nodeId,node.id);
  assert.ok(layout[0].x+layout[0].width<=1.000001);assert.ok(layout[0].y+layout[0].height<=1.000001);
  assert.match(layout[0].lines.join(' '),/main.*aux1.*aux2/);
  const out=await exportMap(bytes,job,evaluation),parsed=await importMap(out),title=parsed.pages[0].text.find(t=>t.str.includes('Carpe Noctum | A1'));
  assert.ok(Math.abs(title.x-layout[0].x-layout[0].padding/r.pages[0].width)<.0001);
});

test('98-point HGD export keeps one compact grouped tombstone on its confirmed symbol page',async()=>{
  const {recommendParts}=await import('../app/rf.mjs');
  const bytes=await synthetic(),r=await importMap(bytes),node={...r.nodes[0],modelId:'gm-hgd-40',map:{...r.nodes[0].map,confirmed:true}};
  const samples=Array.from({length:98},(_,i)=>[57+i*696/97,31+12*i/97]),input=samples.map(([f,v])=>[f,v-30]);
  const recommendation=recommendParts(node.modelId,input,samples,{director:'splitter'});
  const evaluation={stations:{[node.id]:{input,outputs:recommendation.outputs,targets:recommendation.targets,gainStatus:recommendation.gainStatus,shortfall:recommendation.shortfall,recommendation,issues:recommendation.issues}}};
  const job={map:r,nodes:[node],placements:{[node.id]:{page:1,x:.25,y:.2}}},before=JSON.stringify(job);
  const [layout]=layoutTombstones(job,evaluation),result=await importMap(await exportMap(bytes,job,evaluation));
  const titles=result.pages.flatMap(p=>p.text.filter(t=>t.str.includes('Carpe Noctum | A1')).map(t=>({page:p.pageNumber,...t})));
  assert.equal(titles.length,1);assert.equal(titles[0].page,1);
  assert.ok(Math.abs(titles[0].x-layout.x-layout.padding/r.pages[0].width)<.0001);
  const text=result.pages[0].text.map(t=>t.str).join(' ');
  assert.match(text,/main.*aux1.*aux2/);assert.doesNotMatch(text,/Input pad/);const details=result.pages.slice(3).flatMap(p=>p.text.map(t=>t.str)).join(' ');assert.match(details,/Input pad/);assert.match(details,/98 pts/);
  assert.doesNotMatch(text,/\{"|"sources"|"residuals"/);
  assert.ok(layout.lines.length<=32);assert.equal(JSON.stringify(job),before);assert.equal(sha(bytes),r.sha256);
});

test('cancelling active local OCR releases the real worker and aborts the current render',async()=>{
  const {createWorker}=await import('tesseract.js'),c=createCanvas(200,200),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,200,200);ctx.fillStyle='black';ctx.font='32px Arial';ctx.fillText('E42',20,80);
  const d=await PDFDocument.create(),p=d.addPage([200,200]),image=await d.embedPng(c.toBuffer('image/png'));p.drawImage(image,{x:0,y:0,width:200,height:200});const bytes=await d.save(),controller=new AbortController();let terminated=false;
  await assert.rejects(()=>importMap(bytes,{signal:controller.signal,onProgress:p=>{if(p.phase==='ocr')controller.abort();},ocr:{createCanvas,createWorker:async()=>{
    const w=await createWorker('eng',1,{langPath:new URL('../night-sweep/vendor/map/',import.meta.url).pathname,cacheMethod:'none'}),terminate=w.terminate.bind(w);w.terminate=async()=>{terminated=true;return terminate();};return w;
  }}}),e=>e.name==='AbortError');
  assert.equal(terminated,true);
});

test('oversized sources and excessive page counts are rejected before analysis',async()=>{
  await assert.rejects(()=>importMap(new Uint8Array(20*1024*1024+1)),/20 MiB/);
  const d=await PDFDocument.create();for(let i=0;i<201;i++)d.addPage([100,100]);
  const bytes=await d.save();await assert.rejects(()=>importMap(bytes),/200 pages/);
});

test('explicit nearby cable labels and exact native passive parts remain evidence until confirmed',async()=>{
  const d=await PDFDocument.create(),p=d.addPage([600,400]),font=await d.embedFont(StandardFonts.Helvetica);
  for(const [str,x,y]of [['A1',40,300],['E1',500,300],["125 ft",220,302],['P3 .500',300,302],['XSC-2-08',190,100]])p.drawText(str,{x,y,size:10,font});
  p.drawLine({start:{x:45,y:295},end:{x:505,y:295},thickness:1});
  p.drawLine({start:{x:190,y:95},end:{x:250,y:95},thickness:1});
  const r=await importMap(await d.save()),edge=r.edges.find(e=>e.evidence.nearbyLabels?.length);
  assert.ok(edge);assert.equal(edge.lengthFt,null);assert.equal(edge.cableId,'');assert.equal(edge.evidence.direction,'unresolved');
  assert.ok(edge.evidence.nearbyLabels.some(e=>e.kind==='length'&&e.lengthFt===125));
  assert.ok(edge.evidence.nearbyLabels.some(e=>e.candidateCableIds?.includes('p3_500')));
  const passive=r.nodes.find(n=>n.kind==='passive');assert.ok(passive);assert.equal(passive.modelId,'');assert.equal(passive.map.confirmed,false);assert.ok(passive.evidence.candidateModelIds.length);
});
