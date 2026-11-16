import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountApp } from '../app/ui.mjs';

test('opens map upload first and requires a split before creating a route', () => {
  const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.localStorage = dom.window.localStorage;
  const root = document.querySelector('#app');
  mountApp(root);
  assert.match(root.textContent, /Tools/);
  assert.ok(root.querySelector('[data-action=start-map]'));
  assert.equal(root.querySelector('#calc'),null);
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
  root.querySelector('[data-tab=tools]').click();
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
  root.querySelector('[data-tab=tools]').click();
  root.querySelector('[name=loss]').value='';
  root.querySelector('#calc').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(root.querySelector('#result').textContent,/Check your inputs/);
});

test('connection editor cancels without mutation and converts metres to feet', async () => {
  const {CABLES}=await import('../app/catalog.mjs');
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'), app=mountApp(root);
  root.querySelector('[data-tab=route]').click(); root.querySelector('[data-split=low]').click();
  const replies=['A1','active']; dom.window.prompt=()=>replies.shift();
  root.querySelector('[data-action=add-node]').click();
  root.querySelector('[data-action=connect]').click();
  assert.ok(root.querySelector('[role=dialog]'));
  root.querySelector('[data-action=cancel-edge]').click();
  assert.equal(app.getJob().edges.length,0);
  root.querySelector('[data-action=connect]').click();
  const form=root.querySelector('#edge-form');
  form.querySelector('[name=from]').value='node'; form.querySelector('[name=from]').dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  form.querySelector('[name=to]').value=app.getJob().nodes.find(n=>n.name==='A1').id;
  form.querySelector('[name=port]').value='1'; form.querySelector('[name=cableId]').value=Object.keys(CABLES)[0];
  form.querySelector('[name=length]').value='10';form.querySelector('[name=unit]').value='m';form.querySelector('[name=confirmed]').checked=true;
  form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(app.getJob().edges.length,1); assert.ok(Math.abs(app.getJob().edges[0].lengthFt-32.80839895)<1e-6);
  const before=structuredClone(app.getJob().edges[0]);root.querySelector('.edge-row').click();
  const edited=root.querySelector('#edge-form');edited.querySelector('[name=length]').value='500';root.querySelector('[data-action=cancel-edge]').click();
  assert.deepEqual(app.getJob().edges[0],before);
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

test('station mode choices follow equipment and start unknown', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document; globalThis.window=dom.window; globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'); mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-split=low]').click();
  const answers=['A1','active'];dom.window.prompt=()=>answers.shift();root.querySelector('[data-action=add-node]').click();
  const model=root.querySelector('#station-form [name=modelId]'); model.value='gm-hgd-42';model.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  const mode=root.querySelector('#station-form [name=mode]');assert.equal(mode.value,''); assert.deepEqual([...mode.options].map(o=>o.value),['','agc']);
});

test('selecting a map marker keeps a compact sheet and opens the editor on demand', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-split=low]').click();
  const job=app.getJob();job.map={pages:[]};job.nodes[0].map={page:1,x:.3,y:.4,confirmed:true};
  root.querySelector('[data-tab=route]').click();root.querySelector('.map-overlay .marker').click();
  assert.ok(root.querySelector('.map-focus .selected-sheet'));
  root.querySelector('[data-action=edit-selected]').click();
  assert.equal(root.querySelector('.map-focus'),null);
  assert.equal(root.querySelector('#station-settings').open,true);
});

test('ambiguous meter compensation asks for confirmation and cancel preserves the sweep', async () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'), app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-split=low]').click();
  dom.window.confirm=()=>true;dom.window.prompt=()=> '20';root.querySelector('[data-import-port="1"]').click();
  const input=root.querySelector('#file-picker');const doc={testGroup:{tests:[{setupGroups:[{id:'testPointTemplate',configs:[{id:'forwardTestPointCompensation',value:3,units:'dB'}]}],resultGroups:[{resultSeries:[{independent:{label:'Frequency',units:'MHz',values:[57]},dependent:[{label:'Absolute',units:'dBmV',values:[11.4]}]}]}]}]}};
  const bytes=new TextEncoder().encode(JSON.stringify(doc));Object.defineProperty(input,'files',{value:[{name:'meter.json',arrayBuffer:async()=>bytes.buffer}]});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  for(let i=0;i<20&&!root.querySelector('[data-action=comp-cancel]');i++) await new Promise(r=>setTimeout(r,5));
  assert.match(root.querySelector('[role=dialog]').textContent,/3 dB/);root.querySelector('[data-action=comp-cancel]').click();await new Promise(r=>setTimeout(r,0));
  assert.deepEqual(app.getJob().portSweeps,{});
});

test('unknown equipment test-point loss is blank and cancellation does not import', async () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-split=high]').click();
  let defaultLoss='unexpected';dom.window.confirm=()=>true;dom.window.prompt=(_message,value)=>{defaultLoss=value;return null;};
  root.querySelector('[data-import-port="1"]').click();const picker=root.querySelector('#file-picker');
  Object.defineProperty(picker,'files',{value:[{name:'sweep.json',arrayBuffer:async()=>new TextEncoder().encode('{}').buffer}]});picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,0));assert.equal(defaultLoss,'');assert.deepEqual(app.getJob().portSweeps,{});
});

 test('map edits undo and redo within the same job without restoring a different PDF',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
 const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob();job.map={sha256:'abc',pages:[]};root.querySelector('[data-tab=route]').click();
 job.nodes[0].name='Edited node';root.querySelector('[data-tab=route]').click();assert.equal(root.querySelector('[data-action=map-undo]').disabled,false);
 root.querySelector('[data-action=map-undo]').click();assert.equal(app.getJob().nodes[0].name,'GS7K Node');root.querySelector('[data-action=map-redo]').click();assert.equal(app.getJob().nodes[0].name,'Edited node');
 app.getJob().map.sha256='def';root.querySelector('[data-tab=route]').click();assert.equal(root.querySelector('[data-action=map-undo]').disabled,true);
 });

test('a slow earlier PDF selection cannot replace the latest selected map',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});dom.window.confirm=()=>true;
 const previous=globalThis.pdfjsLib;globalThis.pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:0,destroy:async()=>{}})})};
 try{
  const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();
  let release;const slow=new Promise(r=>release=r);const pick=buffer=>{root.querySelector('[data-action=map-import]').click();const input=root.querySelector('#file-picker');Object.defineProperty(input,'files',{value:[{arrayBuffer:()=>buffer}],configurable:true});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));};
  pick(slow);pick(Promise.resolve(new Uint8Array([2]).buffer));await new Promise(r=>setTimeout(r,35));const latest=app.getJob().map?.sha256;assert.ok(latest);
  release(new Uint8Array([1]).buffer);await new Promise(r=>setTimeout(r,35));assert.equal(app.getJob().map.sha256,latest);
 }finally{globalThis.pdfjsLib=previous;}
});

test('map-first staging keeps the latest PDF when file reads finish out of order',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});dom.window.confirm=()=>true;
 const previous=globalThis.pdfjsLib;globalThis.pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:0,destroy:async()=>{}})})};
 try{
  const root=document.querySelector('#app'),app=mountApp(root);let release;const slow=new Promise(r=>release=r);const pick=buffer=>{root.querySelector('[data-action=start-map]').click();const input=root.querySelector('#file-picker');Object.defineProperty(input,'files',{value:[{arrayBuffer:()=>buffer}],configurable:true});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));};
  pick(slow);pick(Promise.resolve(new Uint8Array([2]).buffer));await new Promise(r=>setTimeout(r,10));release(new Uint8Array([1]).buffer);await new Promise(r=>setTimeout(r,10));root.querySelector('[data-split=low]').click();await new Promise(r=>setTimeout(r,35));
  const hash=await crypto.subtle.digest('SHA-256',new Uint8Array([2]));const expected=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');assert.equal(app.getJob().map.sha256,expected);
 }finally{globalThis.pdfjsLib=previous;}
});

test('node map legs persist explicit physical port assignments and label route controls',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();for(const [leg,port]of [['A','4'],['B','3'],['C','2'],['D','1']]){const input=root.querySelector('[name=leg'+leg+']');assert.ok(input);input.value=port;}root.querySelector('#station-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));assert.deepEqual(app.getJob().nodes[0].settings.mapLegPorts,{A:'4',B:'3',C:'2',D:'1'});assert.match(root.querySelector('#source-port').textContent,/Leg A.*physical port 4/);});

test('using a map symbol as the source keeps physical source measurements and makes rewired ports provisional',async()=>{const {bindMapSource}=await import('../app/ui.mjs');const job={nodes:[{id:'node',kind:'node',modelId:'gs7k',name:'Measured source',tag:'',settings:{}},{id:'candidate',kind:'active',name:'Map node',tag:'A2',map:{page:1,x:.2,y:.3,confirmed:false},settings:{}},{id:'other',kind:'active'}],edges:[{id:'self',from:'node',to:'candidate',port:'1',confirmed:false},{id:'out',from:'candidate',to:'other',port:'main',confirmed:true}],portSweeps:{'node::4':{samples:[[57,31]]}},placements:{}};bindMapSource(job,'candidate');assert.equal(job.nodes.length,2);assert.equal(job.nodes[0].modelId,'gs7k');assert.equal(job.nodes[0].tag,'A2');assert.deepEqual(job.portSweeps['node::4'].samples,[[57,31]]);assert.deepEqual(job.edges,[{id:'out',from:'node',to:'other',port:'',confirmed:false}]);});

test('choosing an upstream node retains A-D aliases while option values remain physical ports',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();app.getJob().nodes[0].settings.mapLegPorts={A:'4',B:'3',C:'2',D:'1'};app.getJob().nodes.push({id:'a',name:'A1',tag:'A1',kind:'active',modelId:'',settings:{}});root.querySelector('[data-tab=route]').click();root.querySelector('[data-action=connect]').click();const from=root.querySelector('#edge-form [name=from]');from.value='node';from.dispatchEvent(new dom.window.Event('change',{bubbles:true}));const port=root.querySelector('#edge-form [name=port]');assert.match(port.textContent,/Leg A · physical port 4/);assert.deepEqual([...port.options].map(x=>x.value),['','1','2','3','4']);});
