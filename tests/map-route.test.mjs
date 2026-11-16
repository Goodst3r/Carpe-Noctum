import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {indexedDB as fakeIndexedDB} from 'fake-indexeddb';
import {chromium} from 'playwright';
import {edgeOverlayMarkup} from '../app/map-display.mjs';
import {mountApp} from '../app/ui.mjs';
import {createJob,saveJob} from '../app/store.mjs';

const a={page:1,x:.1,y:.2},b={page:1,x:.8,y:.9};
const edge={id:'edge',confirmed:false,mapRoute:{page:1,points:[[.1,.2],[.1,.7],[.8,.9]]}};
const node=html=>new JSDOM(`<svg>${html}</svg>`).window.document.querySelector('svg').firstElementChild;

test('bent route renders its exact normalized points as a selectable traced polyline',()=>{
 const copy=structuredClone(edge),el=node(edgeOverlayMarkup(edge,a,b,1,true));
 assert.equal(el.tagName,'polyline');assert.equal(el.getAttribute('points'),'100,200 100,700 800,900');
 assert.equal(el.getAttribute('data-edge'),'edge');assert.equal(el.getAttribute('class'),'traced');assert.deepEqual(edge,copy);
});

test('route validates endpoints in either direction and enforces the point bound',()=>{
 const reversed={...edge,mapRoute:{page:1,points:[[.8,.9],[.4,.6],[.1,.2]]}};
 assert.equal(node(edgeOverlayMarkup(reversed,a,b,1)).tagName,'polyline');
 assert.equal(node(edgeOverlayMarkup(edge,{...a,x:a.x+0.00001},b,1)).tagName,'line');
 const max={...edge,mapRoute:{page:1,points:[[.1,.2],...Array.from({length:4998},()=>[.4,.6]),[.8,.9]]}};
 assert.equal(node(edgeOverlayMarkup(max,a,b,1)).tagName,'polyline');
 const escaped=node(edgeOverlayMarkup({...edge,id:'" onload="bad'},a,b,1));
 assert.equal(escaped.getAttribute('data-edge'),'" onload="bad');assert.equal(escaped.hasAttribute('onload'),false);
});

test('invalid routes use the prior straight line and cross-page endpoints stay hidden',()=>{
 for(const mapRoute of [null,{page:2,points:[[.1,.2],[.8,.9]]},{page:1,points:[[.1,.2],[NaN,.5]]},{page:1,points:[[.1,.2],[1.1,.2]]},{page:1,points:[[.1,.2]]},{page:1,points:Array.from({length:5001},()=>[.1,.2])},{page:1,points:[[.5,.5],[.6,.6]]}]) {
  const el=node(edgeOverlayMarkup({...edge,mapRoute},a,b,1,false));assert.equal(el.tagName,'line');
  assert.equal(el.getAttribute('x1'),'100');assert.equal(el.getAttribute('y2'),'900');
 }
 assert.equal(edgeOverlayMarkup(edge,a,{...b,page:2},1,false),'');
});

test('map workspace renders the supplied route without changing route data',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;globalThis.indexedDB=fakeIndexedDB;
 try {const job=createJob('low');job.nodes[0].map=a;job.nodes.push({id:'end',name:'End',tag:'E1',kind:'eol',modelId:'',settings:{},map:b});job.edges.push({...edge,from:'node',to:'end',port:'',cableId:'',lengthFt:null});job.map={sha256:'0'.repeat(64),pages:[{pageNumber:1,width:1000,height:1000}]};saveJob(job);const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-open]').click();for(let i=0;i<50&&!app.getJob();i++)await new Promise(resolve=>setTimeout(resolve,10));
 // Missing local original is acceptable for overlay rendering.
 assert.ok(root.querySelector('polyline[data-edge="edge"]'));assert.deepEqual(app.getJob().edges[0],job.edges[0]);
 } finally {delete globalThis.document;delete globalThis.window;delete globalThis.localStorage;delete globalThis.indexedDB;}
});

test('polyline strokes remain visible and narrow at 1x and 128x map zoom',{skip:!existsSync('/usr/bin/chromium')},async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:240,height:240}}),css=readFileSync(new URL('../app/style.css',import.meta.url),'utf8');const {createCanvas,loadImage}=await import('@napi-rs/canvas');
 for(const scale of [1,128]) {await page.setContent(`<style>${css}body{background:white}</style><div style="position:fixed;inset:0;background:white;--map-scale:${scale}"><div class="map-annotation-layer" style="width:200px;height:200px;transform:scale(${scale})"><svg class="edge-overlay" viewBox="0 0 200 200"><polyline points="0,1 200,1" style="stroke:red"/></svg></div></div>`);const img=await loadImage(await page.screenshot()),canvas=createCanvas(240,240),ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);assert.deepEqual(Array.from(ctx.getImageData(30,scale,1,1).data),[255,0,0,255]);assert.deepEqual(Array.from(ctx.getImageData(30,scale+10,1,1).data),[255,255,255,255]);}
 }finally{await browser.close();}
});
