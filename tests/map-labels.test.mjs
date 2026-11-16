import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {PDFDocument,PDFName,PDFString,StandardFonts,rgb} from 'pdf-lib';
import {DOMMatrix,ImageData,Path2D,createCanvas} from '@napi-rs/canvas';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
globalThis.pdfjsLib=await import('pdfjs-dist/legacy/build/pdf.mjs');
globalThis.PDFLib=await import('pdf-lib');
const {renderPage,prepareMapPreview,exportMap,importMap}=await import('../app/maps.mjs');
const sha=x=>createHash('sha256').update(x).digest('hex');
test('hiding a synthetic annotation reveals original geometry without modifying source',async()=>{
 const doc=await PDFDocument.create(),page=doc.addPage([200,200]),font=await doc.embedFont(StandardFonts.Helvetica);
 page.drawRectangle({x:80,y:80,width:40,height:40,color:rgb(0,0,0)});
 page.drawText('Native field text',{x:10,y:180,size:8,font});
 const appearance=doc.context.flateStream('q 1 1 0 rg 0 0 60 60 re f Q',{Type:'XObject',Subtype:'Form',BBox:[0,0,60,60],Resources:{}});
 const annotation=doc.context.obj({Type:'Annot',Subtype:'FreeText',Rect:[70,70,130,130],Contents:PDFString.of('A1'),DA:PDFString.of('/Helv 12 Tf 0 g'),AP:{N:doc.context.register(appearance)}});
 page.node.set(PDFName.of('Annots'),doc.context.obj([doc.context.register(annotation)]));
 const bytes=await doc.save(),before=sha(bytes),shown=createCanvas(200,200),hidden=createCanvas(200,200);
 const normal=await renderPage(bytes,1,shown),clean=await renderPage(bytes,1,hidden,{hideAnnotations:true});
 assert.equal(sha(bytes),before);assert.equal(normal.annotationLabels[0].text,'A1');
 assert.deepEqual(clean.annotationLabels[0].rect,[.35,.35,.3,.3]);
 const pixel=canvas=>Array.from(canvas.getContext('2d').getImageData(100,100,1,1).data);
 assert.deepEqual(pixel(hidden),[0,0,0,255]);assert.notDeepEqual(pixel(shown),pixel(hidden));
 assert.equal(clean.width,normal.width);assert.equal(clean.height,normal.height);
 assert.ok(normal.textBounds.some(r=>r.x===70&&r.y===70&&r.width===60&&r.height===60));
 assert.ok(!clean.textBounds.some(r=>r.x===70&&r.y===70&&r.width===60&&r.height===60));
 assert.ok(clean.textBounds.length>0,'native text remains covered');
 assert.equal(normal.textBounds.length,clean.textBounds.length+1);
 assert.equal(normal.textAvailable,true);assert.equal(clean.textAvailable,true);
});
test('visible annotation appearances are masked without Contents and truncated annotation bounds disable extraction assurance',async()=>{
 for(const count of [1,501]){
  const doc=await PDFDocument.create(),page=doc.addPage([200,200]);
  const appearance=doc.context.register(doc.context.flateStream('q 1 1 0 rg 0 0 20 20 re f Q',{Type:'XObject',Subtype:'Form',BBox:[0,0,20,20],Resources:{}}));
  const refs=Array.from({length:count},()=>doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Stamp',Rect:[70,70,90,90],AP:{N:appearance}})));
  page.node.set(PDFName.of('Annots'),doc.context.obj(refs));
  const bytes=await doc.save(),canvas=createCanvas(200,200),result=await renderPage(bytes,1,canvas);
  assert.equal(result.annotationLabels.length,0,'empty Contents never invents an overlay label');
  assert.equal(result.textBounds.length,Math.min(count,500));
  assert.equal(result.textAvailable,count<=500);
  const hidden=await renderPage(bytes,1,canvas,{hideAnnotations:true});
  assert.equal(hidden.textBounds.length,0,'hidden appearances contribute no mask rectangles');
  assert.equal(hidden.textAvailable,false,'no native text means manual privacy inspection');
 }
});
test('tombstones remove only their confirmed active annotation in preview and export copies',async()=>{
 const doc=await PDFDocument.create(),page=doc.addPage([200,200]);
 page.drawRectangle({x:80,y:80,width:40,height:40,color:rgb(0,0,0)});
 const refs=[];
 for(const [text,rect] of [['A1',[70,70,130,130]],['A2',[10,10,30,30]],['Local note',[10,150,60,170]],['A1',[150,150,170,170]]]){
  const ap=doc.context.register(doc.context.flateStream(`q 1 1 0 rg 0 0 ${rect[2]-rect[0]} ${rect[3]-rect[1]} re f Q`,{Type:'XObject',Subtype:'Form',BBox:[0,0,rect[2]-rect[0],rect[3]-rect[1]],Resources:{}}));
  refs.push(doc.context.register(doc.context.obj({Type:'Annot',Subtype:'FreeText',Rect:rect,Contents:PDFString.of(text),DA:PDFString.of('/Helv 12 Tf 0 g'),AP:{N:ap}})));
 }
 page.node.set(PDFName.of('Annots'),doc.context.obj(refs));
 const bytes=await doc.save(),before=sha(bytes);
 const imported=await importMap(bytes);
 assert.equal(imported.nodes.find(n=>n.tag==='A1').map.confirmed,false);
 assert.equal(imported.nodes.find(n=>n.tag==='A1').map.source,'annotation');
 assert.ok(imported.nodes.find(n=>n.tag==='A1').map.annotationId);
 const job={map:{sha256:before,pages:[{pageNumber:1,width:200,height:200,symbols:[{id:'first',labelBounds:{x:.35,y:.35,width:.3,height:.3}}]}]},nodes:[
  {id:'a',tag:'A1',kind:'active',map:{page:1,x:.5,y:.5,symbolId:'first',confirmed:true}},
  {id:'b',tag:'A2',kind:'active',map:{page:1,x:.1,y:.9,confirmed:false}}],placements:{a:{page:1,x:.65,y:0,width:.3}}};
 const preview=await prepareMapPreview(bytes,job,{}),canvas=createCanvas(200,200);
 const shown=await renderPage(preview,1,canvas);
 assert.deepEqual(shown.annotationLabels.map(a=>a.text).sort(),['A1','A2','Local note']);
 assert.deepEqual(Array.from(canvas.getContext('2d').getImageData(100,100,1,1).data),[0,0,0,255]);
 const exported=await exportMap(bytes,job,{}),read=await pdfjsLib.getDocument({data:new Uint8Array(exported),verbosity:0,useSystemFonts:true}).promise;
 const resultPage=await read.getPage(1),annotations=await resultPage.getAnnotations();
 assert.deepEqual(annotations.filter(a=>a.subtype==='FreeText').map(a=>a.contentsObj.str).sort(),['A1','A2','Local note']);
 assert.match((await resultPage.getTextContent()).items.map(t=>t.str).join('').replace(/\s+/g,''),/CarpeNoctum\|A1/);
 await read.destroy();assert.equal(sha(bytes),before);
 const unconfirmed={...job,nodes:job.nodes.map(n=>({...n,map:{...n.map,confirmed:false}}))};
 assert.equal((await renderPage(await prepareMapPreview(bytes,unconfirmed,{}),1,canvas)).annotationLabels.length,4);
});
