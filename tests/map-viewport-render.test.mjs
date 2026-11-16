import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,rgb} from 'pdf-lib';
import {DOMMatrix,ImageData,Path2D,createCanvas} from '@napi-rs/canvas';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});globalThis.pdfjsLib=await import('pdfjs-dist/legacy/build/pdf.mjs');
const {renderMapViewport}=await import('../app/maps.mjs');
test('detail render clips the original PDF at the actual viewport resolution',async()=>{const pdf=await PDFDocument.create(),page=pdf.addPage([1000,1000]);page.drawRectangle({x:490,y:490,width:20,height:20,color:rgb(0,0,0)});const bytes=await pdf.save(),canvas=createCanvas(1,1);const result=await renderMapViewport(bytes,1,canvas,{view:{x:-900,y:-900,scale:10,mapWidth:200,mapHeight:200,width:200,height:200}});assert.equal(canvas.width,200);assert.equal(canvas.height,200);assert.deepEqual(Array.from(canvas.getContext('2d').getImageData(100,100,1,1).data),[0,0,0,255]);assert.deepEqual(Array.from(canvas.getContext('2d').getImageData(10,10,1,1).data),[255,255,255,255]);assert.equal(result.width,200);});
test('viewport render rejects stale requests and invalid viewport geometry',async()=>{const controller=new AbortController();controller.abort();await assert.rejects(()=>renderMapViewport(new Uint8Array(),1,createCanvas(1,1),{view:{},signal:controller.signal}),{name:'AbortError'});await assert.rejects(()=>renderMapViewport(new Uint8Array(),1,createCanvas(1,1),{view:{x:0,y:0,scale:NaN}}),/viewport/i);});
