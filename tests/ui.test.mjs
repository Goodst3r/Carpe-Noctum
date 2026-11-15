import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountApp } from '../app/ui.mjs';

test('opens tools first and requires a split before creating a route', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.localStorage = dom.window.localStorage;
  const root = document.querySelector('#app');
  mountApp(root);
  assert.match(root.textContent, /Tools/);
  assert.match(root.textContent, /Cable loss/i);
  [...root.querySelectorAll('button')].find(b => b.textContent.includes('Route & Sweep')).click();
  assert.match(root.textContent, /Low split/i);
  assert.match(root.textContent, /High split/i);
});

test('calculates a specified cable loss without a job', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.localStorage = dom.window.localStorage;
  const root = document.querySelector('#app');
  mountApp(root);
  root.querySelector('[name=loss]').value = '2';
  root.querySelector('[name=length]').value = '250';
  root.querySelector('#calc').dispatchEvent(new dom.window.Event('submit', {bubbles:true,cancelable:true}));
  assert.match(root.querySelector('#result').textContent, /5\.0 dB loss/);
});

test('creates a blank measured node after split selection', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.localStorage = dom.window.localStorage;
  const root = document.querySelector('#app');
  const app=mountApp(root);
  root.querySelector('[data-tab=route]').click();
  root.querySelector('[data-split=low]').click();
  assert.equal(app.getJob().split,'low');
  assert.deepEqual(app.getJob().portSweeps,{});
  assert.match(root.textContent, /GS7K Node/);
});

test('station return alignment requires confirmed physical measurement planes', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document; globalThis.window = dom.window; globalThis.localStorage = dom.window.localStorage;
  const root = document.querySelector('#app'); mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  const answers=['Amplifier','active']; dom.window.prompt=()=>answers.shift(); root.querySelector('[data-action=add-node]').click();
  root.querySelector('#return-measurements summary').click();
  root.querySelector('[name=reversePad]').value='0';
  root.querySelector('[name=reverseInput]').value='5,10\n42,10';
  root.querySelector('[name=reverseTarget]').value='5,30\n42,30';
  root.querySelector('#reverse-form').dispatchEvent(new dom.window.Event('submit', {bubbles:true,cancelable:true}));
  assert.match(root.querySelector('#reverse-result').textContent, /Confirm the input and output planes/);
});

test('removing a station removes its readings, placements and connected edges', async () => {
  const {removeStation} = await import('../app/ui.mjs');
  const job={nodes:[{id:'node'},{id:'a'}],edges:[{id:'e',from:'node',to:'a'}],portSweeps:{'a::main':{samples:[[1,2]]},'node::1':{samples:[[1,3]]}},placements:{a:{page:1}},};
  removeStation(job,'a');
  assert.deepEqual(job.nodes,[{id:'node'}]);
  assert.deepEqual(job.edges,[]);
  assert.deepEqual(Object.keys(job.portSweeps),['node::1']);
  assert.deepEqual(job.placements,{});
});

test('new map clears old bindings and adds provisional remapped edges once', async () => {
  const {applyMapDraft} = await import('../app/ui.mjs');
  const job={nodes:[{id:'node',map:{page:1,x:0,y:0,confirmed:true}}],edges:[],placements:{node:{page:1}},map:{sha256:'old'}};
  const draft={sha256:'new',pages:[],nodes:[{id:'a',name:'A'},{id:'b',name:'B'}],edges:[{id:'e',from:'a',to:'b',port:'',confirmed:false}]};
  applyMapDraft(job,draft,true);
  assert.equal(job.nodes[0].map,undefined);
  assert.deepEqual(job.placements,{});
  assert.equal(job.edges.length,1);
  assert.equal(job.edges[0].confirmed,false);
  assert.ok(job.nodes.some(n=>n.id===job.edges[0].from));
  applyMapDraft(job,draft,true);
  assert.equal(job.nodes.length,3);
  assert.equal(job.edges.length,1);
});

test('blank calculator values do not produce a zero loss', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document; globalThis.window = dom.window; globalThis.localStorage = dom.window.localStorage;
  const root=document.querySelector('#app'); mountApp(root);
  root.querySelector('[name=loss]').value='';
  root.querySelector('#calc').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(root.querySelector('#result').textContent,/Check your inputs/);
});

test('cancelled cable length does not create a connection', async () => {
  const {CABLES}=await import('../app/catalog.mjs');
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'), app=mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  let replies=['A1','active']; dom.window.prompt=()=>replies.shift(); dom.window.confirm=()=>true;
  root.querySelector('[data-action=add-node]').click();
  replies=['GS7K Node','A1','1',Object.keys(CABLES)[0],null];
  root.querySelector('[data-action=connect]').click();
  assert.equal(app.getJob().edges.length,0);
});

test('active editor accepts measured gain and installed part details', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'), app=mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  const answers=['Amplifier','active']; dom.window.prompt=()=>answers.shift();
  root.querySelector('[data-action=add-node]').click();
  const form=root.querySelector('#station-form');
  assert.ok(form.querySelector('[name=gainSamples]'));
  assert.ok(form.querySelector('[name=inputPadDb]'));
  assert.ok(form.querySelector('[name=eqPartId]'));
  assert.ok(form.querySelector('[name=directorReversed]'));
  assert.ok([...form.querySelector('[name=eqFamily]').options].some(o=>o.value==='digicomm-inverse-1p2g'));
  form.querySelector('[name=gainSamples]').value='57, 34\n753, 42';
  form.querySelector('[name=inputPadDb]').value='3';
  form.querySelector('[name=directorReversed]').checked=true;
  form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  const settings=app.getJob().nodes.find(n=>n.name==='Amplifier').settings;
  assert.deepEqual(settings.gainSamples,[[57,34],[753,42]]);
  assert.equal(settings.inputPadDb,3);
  assert.equal(settings.directorReversed,true);
});

test('configured station keeps settings and manual readings collapsed', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'); mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  assert.equal(root.querySelector('#station-settings').open,false);
  assert.equal(root.querySelector('#manual-reading').open,false);
  assert.ok(root.querySelector('.port-grid'));
});

test('map routes retain export geometry without persisting bulk PDF analysis into job storage', async () => {
 const {applyMapDraft}=await import('../app/ui.mjs');
 const job={nodes:[{id:'node'}],edges:[],placements:{}};
 const frame={pageNumber:1,width:792,height:612,rotation:90,userUnit:2,viewBox:[0,0,792,612],viewportTransform:[0,2,2,0,0,0],symbols:[{id:'s1',labelBounds:{x:.1,y:.2,width:.01,height:.02}}],vectors:Array(5000).fill({points:[[0,0],[1,1]],evidence:'irrelevant stored analysis'.repeat(30)}),text:Array(5000).fill({str:'source words'})};
 applyMapDraft(job,{sha256:'a'.repeat(64),pages:[frame],nodes:[],edges:[]},true);
 assert.ok(JSON.stringify(job).length<5000,'page analysis must not exhaust localStorage for real plant PDFs');
 assert.deepEqual(job.map.pages[0].viewportTransform,frame.viewportTransform);
 assert.deepEqual(job.map.pages[0].symbols[0].labelBounds,frame.symbols[0].labelBounds);
});

test('map OCR defaults to traditional recognition with experimental Tiny as an option', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'); mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  const scan=root.querySelector('#scan-ocr'); scan.checked=true; scan.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  const choice=root.querySelector('#ocr-engine'); assert.equal(choice.value,'tesseract');
  assert.ok([...choice.options].some(o=>o.value==='tiny'));
});

test('manual sweep rejects empty levels but saves an explicit zero', async () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'), app=mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  root.querySelector('#manual-reading summary').click();
  let form=root.querySelector('#manual-sweep');form.querySelector('[name=samples]').value='57,\n753,43.3';
  form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(r=>setTimeout(r,0));
  assert.deepEqual(app.getJob().portSweeps,{});
  root.querySelector('#manual-reading summary').click();
  form=root.querySelector('#manual-sweep');form.querySelector('[name=samples]').value='57,0\n753,43.3';
  form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(r=>setTimeout(r,0));
  assert.deepEqual(app.getJob().portSweeps['node::1'].samples,[[57,0],[753,43.3]]);
});

test('sample parser requires exactly two finite cells and increasing positive frequencies', async () => {
  const {parseSamplePairs}=await import('../app/ui.mjs');
  for (const input of ['57,','57,,0','57,0,1','57,1e','0,1','57,1\n57,2','57,Infinity']) assert.throws(()=>parseSamplePairs(input), undefined, input);
  assert.deepEqual(parseSamplePairs('57,0\n753 -2.5'),[[57,0],[753,-2.5]]);
});
