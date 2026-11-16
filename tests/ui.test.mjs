import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountApp,applyMapDraft } from '../app/ui.mjs';

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
  root.querySelector('[data-tab=route]').click();root.querySelector('.screen-marker').click();
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
  for(let i=0;i<20&&!root.querySelector('#onx-compensation');i++) await new Promise(r=>setTimeout(r,5));
  assert.match(root.querySelector('[role=dialog]').textContent,/3 dB/);root.querySelector('[data-action=onx-cancel]').click();await new Promise(r=>setTimeout(r,0));
  assert.deepEqual(app.getJob().portSweeps,{});
});

test('unknown equipment test-point loss is blank and cancellation does not import', async () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
  const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-split=high]').click();
  const bytes=syntheticONX();root.querySelector('[data-import-port="1"]').click();const picker=root.querySelector('#file-picker');
  Object.defineProperty(picker,'files',{value:[{name:'sweep.json',arrayBuffer:async()=>bytes.buffer}]});picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  await untilONX(()=>root.querySelector('#onx-loss'));assert.equal(root.querySelector('#onx-loss').value,'');root.querySelector('[data-action=onx-cancel]').click();assert.deepEqual(app.getJob().portSweeps,{});
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
  pick(slow);pick(Promise.resolve(new Uint8Array([2]).buffer));await new Promise(r=>setTimeout(r,35));assert.ok(root.querySelector('[role=dialog]'));root.querySelector('[data-action=review-import]').click();await new Promise(r=>setTimeout(r,10));const latest=app.getJob().map?.sha256;assert.ok(latest);
  release(new Uint8Array([1]).buffer);await new Promise(r=>setTimeout(r,35));assert.equal(app.getJob().map.sha256,latest);
 }finally{globalThis.pdfjsLib=previous;}
});

test('map-first staging keeps the latest PDF when file reads finish out of order',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});dom.window.confirm=()=>true;
 const previous=globalThis.pdfjsLib;globalThis.pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:0,destroy:async()=>{}})})};
 try{
  const root=document.querySelector('#app'),app=mountApp(root);let release;const slow=new Promise(r=>release=r);const pick=buffer=>{root.querySelector('[data-action=start-map]').click();const input=root.querySelector('#file-picker');Object.defineProperty(input,'files',{value:[{arrayBuffer:()=>buffer}],configurable:true});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));};
  pick(slow);pick(Promise.resolve(new Uint8Array([2]).buffer));await new Promise(r=>setTimeout(r,10));release(new Uint8Array([1]).buffer);await new Promise(r=>setTimeout(r,10));root.querySelector('[data-split=low]').click();await new Promise(r=>setTimeout(r,35));
  root.querySelector('[data-action=review-import]').click();await new Promise(r=>setTimeout(r,10));const hash=await crypto.subtle.digest('SHA-256',new Uint8Array([2]));const expected=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');assert.equal(app.getJob().map.sha256,expected);
 }finally{globalThis.pdfjsLib=previous;}
});

test('node map legs persist explicit physical port assignments and label route controls',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();for(const [leg,port]of [['A','4'],['B','5'],['C','2'],['D','1']]){const input=root.querySelector('[name=leg'+leg+']');assert.ok(input);input.value=port;}root.querySelector('#station-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));assert.deepEqual(app.getJob().nodes[0].settings.mapLegPorts,{A:'4',B:'5',C:'2',D:'1'});assert.match(root.querySelector('#source-port').textContent,/Leg A.*physical port 4/);});

test('using a map symbol as the source keeps physical source measurements and makes rewired ports provisional',async()=>{const {bindMapSource}=await import('../app/ui.mjs');const job={nodes:[{id:'node',kind:'node',modelId:'gs7k',name:'Measured source',tag:'',settings:{}},{id:'candidate',kind:'active',name:'Map node',tag:'A2',map:{page:1,x:.2,y:.3,confirmed:false},settings:{}},{id:'other',kind:'active'}],edges:[{id:'self',from:'node',to:'candidate',port:'1',confirmed:false},{id:'out',from:'candidate',to:'other',port:'main',confirmed:true}],portSweeps:{'node::4':{samples:[[57,31]]}},placements:{}};bindMapSource(job,'candidate');assert.equal(job.nodes.length,2);assert.equal(job.nodes[0].modelId,'gs7k');assert.equal(job.nodes[0].tag,'A2');assert.deepEqual(job.portSweeps['node::4'].samples,[[57,31]]);assert.deepEqual(job.edges,[{id:'out',from:'node',to:'other',port:'',confirmed:false}]);});

test('choosing an upstream node retains A-D aliases while option values remain physical ports',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();app.getJob().nodes[0].settings.mapLegPorts={A:'4',B:'3',C:'2',D:'1'};app.getJob().nodes.push({id:'a',name:'A1',tag:'A1',kind:'active',modelId:'',settings:{}});root.querySelector('[data-tab=route]').click();root.querySelector('[data-action=connect]').click();const from=root.querySelector('#edge-form [name=from]');from.value='node';from.dispatchEvent(new dom.window.Event('change',{bubbles:true}));const port=root.querySelector('#edge-form [name=port]');assert.match(port.textContent,/Leg A · physical port 4/);assert.deepEqual([...port.options].map(x=>x.value),['','1','2','4','5']);});

test('legacy unverified port remains selected when station settings are saved',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});
 const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();
 const node=app.getJob().nodes[0];node.settings.mapLegPorts={A:'3'};node.readings={'3':{samples:[[57,31]]}};
 root.querySelector('[data-tab=route]').click();const select=root.querySelector('[name=legA]');assert.equal(select.value,'3');assert.match(select.selectedOptions[0].textContent,/unverified/);
 root.querySelector('#station-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));assert.equal(node.settings.mapLegPorts.A,'3');assert.deepEqual(node.readings['3'].samples,[[57,31]]);
});

test('cancelled map import cannot publish a review after pending text resolves',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});
 let release,started;const startedPromise=new Promise(r=>started=r),content=new Promise(r=>release=r);const previous=globalThis.pdfjsLib;
 globalThis.pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({view:[0,0,100,100],rotate:0,userUnit:1,getViewport:()=>({width:100,height:100,transform:[1,0,0,-1,0,100],scale:1}),getTextContent:()=>{started();return content},getOperatorList:async()=>({fnArray:[],argsArray:[]}),getAnnotations:async()=>[],cleanup(){}}),destroy:async()=>{}})})};
 try{const root=document.querySelector('#app');mountApp(root);root.querySelector('[data-split=low]').click();root.querySelector('[data-action=map-import]').click();const input=root.querySelector('#file-picker');Object.defineProperty(input,'files',{value:[{arrayBuffer:async()=>new Uint8Array([1]).buffer}],configurable:true});input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));await startedPromise;root.querySelector('[data-action=cancel-map]').click();release({items:[]});await new Promise(r=>setTimeout(r,30));assert.equal(root.querySelector('#map-review-title'),null);assert.equal(root.querySelector('[data-action=cancel-map]'),null);}finally{globalThis.pdfjsLib=previous;}
});

test('switching legacy unverified port stage updates only its physical sweep',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob(),n=job.nodes[0];
 const before={samples:[[57,31]],stage:'before'},after={samples:[[57,41]],stage:'after'};n.readings={'3':{...before,before,after}};job.portSweeps['node::3']=before;root.querySelector('[data-tab=route]').click();const port=root.querySelector('#port-select');port.value='3';port.dispatchEvent(new dom.window.Event('change',{bubbles:true}));const stage=root.querySelector('#reading-stage');stage.value='after';stage.dispatchEvent(new dom.window.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,20));assert.deepEqual(app.getJob().portSweeps['node::3'].samples,[[57,41]]);assert.equal(app.getJob().portSweeps['node::1'],undefined);
});

test('overlap chooser closes on selection, outside click, Escape and close button',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});
 const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob();job.map={pages:[]};job.nodes.push(...['A','B','C','D'].map((name,i)=>({id:name,name,kind:'passive',settings:{},map:{page:1,x:i<2?0:100,y:i<2?0:100}})));root.querySelector('[data-tab=route]').click();
 const cluster=()=>root.querySelector('[data-action=cluster]'),chooser=()=>root.querySelector('.marker-chooser');cluster().click();assert.ok(chooser());chooser().querySelector('[data-select]').click();assert.equal(chooser(),null);
 cluster().click();assert.ok(chooser());root.querySelector('.selected-sheet').click();assert.equal(chooser(),null);
 cluster().click();assert.ok(chooser());root.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(chooser(),null);
 cluster().click();assert.ok(chooser());chooser().querySelector('[data-action=close-cluster]').click();assert.equal(chooser(),null);
 cluster().click();assert.ok(chooser());const other=[...root.querySelectorAll('[data-action=cluster]')].find(x=>x.dataset.cluster!==cluster().dataset.cluster);other.dispatchEvent(new dom.window.MouseEvent('pointerdown',{bubbles:true,button:0}));assert.ok(other.isConnected);other.click();assert.equal(root.querySelectorAll('.marker-chooser').length,1);assert.ok(chooser().closest('.screen-marker-group').contains(root.querySelector(`[data-cluster="${other.dataset.cluster}"]`)));document.body.click();assert.equal(chooser(),null);
});

test('readable selected map card keeps the A identifier after its PDF label is replaced',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();app.getJob().map={sha256:'synthetic',pages:[]};app.getJob().nodes[0].tag='A73';root.querySelector('[data-tab=route]').click();assert.match(root.querySelector('.selected-sheet strong').textContent,/A73/);});

test('anonymous end assignment preserves named EOL data and remaps provisional edges',async()=>{
 const {assignEolCandidate}=await import('../app/ui.mjs');const target={id:'e1',kind:'eol',name:'E1',tag:'E1',settings:{note:'keep'},readings:{main:{samples:[[57,31]]}}};const candidate={id:'end',kind:'eol',tag:'',map:{page:1,x:.4,y:.5,symbolKind:'unknown-endpoint',confirmed:false},evidence:{type:'unlabeled-cable-end',upstreamCandidates:['a'],needsIdentity:true}};const job={nodes:[{id:'a'},target,candidate],edges:[{id:'edge',from:'a',to:'end',confirmed:true}],portSweeps:{'e1::main':{samples:[[57,31]]}},placements:{}};
 assignEolCandidate(job,'end','e1');assert.equal(job.nodes.includes(candidate),false);assert.equal(target.tag,'E1');assert.equal(target.settings.note,'keep');assert.deepEqual(target.readings.main.samples,[[57,31]]);assert.equal(target.map.confirmed,false);assert.deepEqual(job.edges,[{id:'edge',from:'a',to:'e1',confirmed:false}]);assert.deepEqual(job.portSweeps['e1::main'].samples,[[57,31]]);
});
test('anonymous assignment refuses to discard candidate readings or sweep data',async()=>{
 const {assignEolCandidate}=await import('../app/ui.mjs');const make=()=>({nodes:[{id:'target',kind:'eol'},{id:'end',kind:'eol',tag:'',map:{page:1,x:.1,y:.2,symbolKind:'unknown-endpoint'},evidence:{needsIdentity:true}}],edges:[],portSweeps:{}});for(const variant of ['readings','sweep']){const job=make();if(variant==='readings')job.nodes[1].readings={main:{samples:[[57,20]]}};else job.portSweeps['end::main']={samples:[[57,20]]};const before=structuredClone(job);assert.throws(()=>assignEolCandidate(job,'end','target'),/measurement|reading|sweep/i);assert.deepEqual(job,before);}
});
test('draft endpoint evidence follows generated node IDs and source binding',async()=>{
 const {applyMapDraft}=await import('../app/ui.mjs');const job={nodes:[{id:'node',kind:'node',settings:{}}],edges:[],portSweeps:{},placements:{}};const draft={sha256:'synthetic-endpoints',pages:[],nodes:[{id:'native-source',kind:'node',name:'Source',map:{page:1,x:.1,y:.1,symbolKind:'node'}},{id:'native-end',kind:'eol',name:'Unidentified end',map:{page:1,x:.2,y:.2,symbolKind:'unknown-endpoint'},evidence:{upstreamCandidates:['native-source'],needsIdentity:true}}],edges:[{from:'native-source',to:'native-end'}]};applyMapDraft(job,draft,true,'native-source');const end=job.nodes.find(n=>n.evidence?.needsIdentity);assert.deepEqual(end.evidence.upstreamCandidates,['node']);assert.equal(job.edges[0].from,'node');assert.equal(job.edges[0].to,end.id);
});
test('unplaced EOL queue assigns an anonymous marker and retains unknown branches',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob();job.map={sha256:'synthetic',pages:[]};job.nodes.push({id:'e1',name:'E1',tag:'E1',kind:'eol',settings:{},evidence:{upstreamCandidates:['unknown']}},{id:'end',name:'Unidentified end',tag:'',kind:'eol',settings:{},map:{page:1,x:.5,y:.5,symbolKind:'unknown-endpoint'},evidence:{needsIdentity:true,upstreamCandidates:['node']}});job.edges.push({id:'route',from:'node',to:'end',confirmed:false});root.querySelector('[data-tab=route]').click();assert.match(root.querySelector('.unplaced-queue').textContent,/unidentified ends/i);const filter=root.querySelector('#unplaced-branch');filter.value='node';filter.dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.equal(root.querySelector('[data-unplaced=e1]').hidden,false);assert.match(root.querySelector('[data-unplaced=e1]').textContent,/unknown branch/i);root.querySelector('[data-unplaced=e1]').click();root.querySelector('[data-select=end]').click();assert.equal(app.getJob().nodes.some(n=>n.id==='end'),false);assert.equal(app.getJob().nodes.find(n=>n.id==='e1').map.confirmed,false);assert.equal(app.getJob().edges[0].to,'e1');
});
test('selected passive displays printed loss without choosing RF equipment',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob();job.map={sha256:'synthetic',pages:[]};job.nodes.push({id:'tap',name:'Unidentified tap',kind:'passive',modelId:'',settings:{},evidence:{type:'native-passive-symbol',printedValue:23},map:{page:1,x:.4,y:.4,symbolKind:'tap2'}});root.querySelector('[data-tab=route]').click();root.querySelector('[data-select=tap]').click();assert.match(root.querySelector('.selected-sheet').textContent,/printed.*23/i);assert.equal(job.nodes.find(n=>n.id==='tap').modelId,'');
});

test('map export snapshot keeps job and evaluation consistent after edits',async()=>{
 const {snapshotMapExport}=await import('../app/ui.mjs');const {createJob}=await import('../app/store.mjs');const job=createJob('low');job.nodes[0].name='Original';job.portSweeps['node::1']={samples:[[57,31]],stage:'after'};const snapshot=snapshotMapExport(job),evaluation=structuredClone(snapshot.evaluation);job.nodes[0].name='Edited';job.portSweeps['node::1'].samples[0][1]=42;assert.equal(snapshot.job.nodes[0].name,'Original');assert.equal(snapshot.job.portSweeps['node::1'].samples[0][1],31);assert.deepEqual(snapshot.evaluation,evaluation);
});

test('selected unidentified end can be matched to an unplaced identity',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const job=app.getJob();job.map={sha256:'synthetic',pages:[]};job.nodes.push({id:'e1',name:'E1',tag:'E1',kind:'eol',settings:{}},{id:'end',name:'Unknown',tag:'',kind:'eol',settings:{},map:{page:1,x:.5,y:.5,symbolKind:'unknown-endpoint'},evidence:{needsIdentity:true}});root.querySelector('[data-tab=route]').click();root.querySelector('.unplaced-queue [data-select=end]').click();const select=root.querySelector('#eol-identity');assert.ok(select);select.value='e1';root.querySelector('[data-action=assign-eol-identity]').click();assert.equal(job.nodes.some(n=>n.id==='end'),false);assert.equal(job.nodes.find(n=>n.id==='e1').map.x,.5);
});

test('native importer terminal flags feed the review queue and preserve a named EOL identity on matching',()=>{const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-split=low]').click();const draft={sha256:'native-shape',pages:[],nodes:[{id:'up',name:'A1',tag:'A1',kind:'active',map:{page:1,x:.2,y:.3,confirmed:false}},{id:'end',name:'Unlabeled cable end',tag:'',kind:'eol',needsIdentity:true,evidence:{type:'unlabeled-cable-end',upstreamCandidates:['up']},map:{page:1,x:.4,y:.3,symbolKind:'unknown-endpoint',confirmed:false}},{id:'known',name:'E1',tag:'E1',kind:'eol'}],edges:[{id:'wire',from:'up',to:'end',confirmed:false}]};applyMapDraft(app.getJob(),draft,true);root.querySelector('[data-tab=route]').click();assert.match(root.querySelector('.unplaced-queue summary').textContent,/\(2\)/);root.querySelector('.unplaced-list [data-select]').click();const picker=root.querySelector('#eol-identity');picker.value=[...picker.options].find(x=>x.textContent.includes('E1')).value;root.querySelector('[data-action=assign-eol-identity]').click();assert.match(root.querySelector('.selected-sheet strong').textContent,/E1/);assert.equal(app.getJob().nodes.find(n=>n.tag==='E1').map.confirmed,false);assert.match(root.querySelector('.unplaced-queue summary').textContent,/\(0\)/);});

// All ONX fixtures below are synthetic; private originals never enter the test tree.
const syntheticONX = (kind='forward', compensation=0) => new TextEncoder().encode(JSON.stringify(kind==='forward'?{testGroup:{tests:[{setupGroups:[{id:'testPointTemplate',configs:[{id:'forwardTestPointCompensation',units:'dB',value:compensation}]}],resultGroups:[{resultSeries:[{independent:{label:'Frequency',units:'MHz',values:[57,753]},dependent:[{label:'Absolute',units:'dBmV',values:[11.4,23.3]}]}]}]}]}}:{cdmVersion:'2.0',tests:[{type:kind==='reverse'?'sweepmode_app':'onecheckexpert',label:kind==='reverse'?'Sweep - Reverse Sweepless':'OneCheck',results:{data:{chart:{Referenced:{units:['MHz',kind==='reverse'?'dB':'dBmV'],data:[[10,1],[20,2]]}},table:{label:'Diagnostic <img src=x onerror=alert(1)>',tableColumnHeaders:['State'],tableData:[[{value:'<script>bad()</script>',status:'PASS'}]]}}}}]}));
function onxApp(services={}) {
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});Object.assign(globalThis,{document:dom.window.document,window:dom.window,localStorage:dom.window.localStorage});
 const root=document.querySelector('#app'),app=mountApp(root,{onxServices:{putOriginal:async()=> 'a'.repeat(64),...services}});root.querySelector('[data-split=low]').click();return {dom,root,app};
}
function pickONX(ctx,bytes=syntheticONX(),extra={}) {
 ctx.root.querySelector('[data-import-port="1"]').click();const input=ctx.root.querySelector('#file-picker');Object.defineProperty(input,'files',{value:[{name:'advisory-c6.json',size:bytes.length,arrayBuffer:async()=>bytes.buffer,...extra}],configurable:true});input.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));
}
async function untilONX(predicate){for(let i=0;i<80;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}assert.ok(predicate(),'ONX operation did not reach expected state');}
function saveONX(ctx){ctx.root.querySelector('#onx-review-form').dispatchEvent(new ctx.dom.window.Event('submit',{bubbles:true,cancelable:true}));}
test('ONX review defaults to origin port, previews metadata and commits forward evidence with corrected RF atomically',async()=>{
 const ctx=onxApp();pickONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-review-title'));
 assert.match(ctx.root.querySelector('#file-picker').accept,/\.gz/);assert.equal(ctx.root.querySelector('#onx-station').value,'node');assert.equal(ctx.root.querySelector('#onx-port').value,'1');assert.match(ctx.root.querySelector('.onx-review').textContent,/advisory.*filename.*advisory|filename.*advisory/is);assert.equal(ctx.app.getJob().nodes[0].measurementReports,undefined);
 ctx.root.querySelector('#onx-connection').value='tp';ctx.root.querySelector('#onx-loss').value='20';saveONX(ctx);await untilONX(()=>ctx.app.getJob().nodes[0].measurementReports?.length===1);
 assert.deepEqual(ctx.app.getJob().portSweeps['node::1'].samples,[[57,31.4],[753,43.3]]);assert.equal(ctx.app.getJob().nodes[0].measurementReports[0].report.kind,'forward-sweep');assert.match(ctx.root.querySelector('.measurement-reports').textContent,/Absolute.*MHz.*dBmV/s);
 const savedId=ctx.app.getJob().id;ctx.root.querySelector(`[data-open="${savedId}"]`).click();await untilONX(()=>ctx.root.querySelector('.measurement-reports'));assert.match(ctx.root.querySelector('.measurement-reports').textContent,/advisory-c6/);
});
test('reverse and OneCheck ONX preserve RF and render diagnostic cells as inert text',async()=>{
 for(const kind of ['reverse','onecheck']){const ctx=onxApp();const initial=JSON.stringify(ctx.app.getJob().portSweeps);pickONX(ctx,syntheticONX(kind));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));assert.equal(ctx.root.querySelector('#onx-connection'),null);saveONX(ctx);await untilONX(()=>ctx.app.getJob().nodes[0].measurementReports?.length===1);assert.equal(JSON.stringify(ctx.app.getJob().portSweeps),initial);assert.equal(ctx.app.getJob().nodes[0].readings,undefined);const view=ctx.root.querySelector('.measurement-reports');assert.match(view.textContent,/<script>bad\(\)<\/script>/);assert.equal(view.querySelector('script,img'),null);assert.match(view.textContent,/Diagnostic/);}
});
test('ONX configured nonzero compensation requires explicit declaration',async()=>{
 const ctx=onxApp();pickONX(ctx,syntheticONX('forward',3));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.equal(ctx.app.getJob().nodes[0].measurementReports,undefined);ctx.root.querySelector('#onx-compensation').value='yes';saveONX(ctx);await untilONX(()=>ctx.app.getJob().nodes[0].measurementReports?.length);assert.deepEqual(ctx.app.getJob().portSweeps['node::1'].samples,[[57,8.4],[753,20.3]]);
});
test('ONX cancel, new route and superseding import stop pending byte reads',async()=>{
 for(const action of ['cancel','new','supersede']){const ctx=onxApp();let release;pickONX(ctx,syntheticONX(),{arrayBuffer:()=>new Promise(r=>release=r)});if(action==='cancel')ctx.root.querySelector('[data-action=onx-cancel]').click();if(action==='new'){ctx.dom.window.confirm=()=>true;ctx.root.querySelector('[data-action=new]').click();}if(action==='supersede'){pickONX(ctx,syntheticONX('reverse'));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));}release(syntheticONX().buffer);await new Promise(r=>setTimeout(r,30));assert.equal(ctx.app.getJob()?.nodes[0].measurementReports,undefined);if(action!=='supersede')assert.equal(ctx.root.querySelector('#onx-review-title'),null);else assert.match(ctx.root.querySelector('.onx-review').textContent,/reverse-relative/);}
});
test('ONX cancellation and station changes after original persistence cannot write a job',async()=>{
 for(const action of ['cancel','station','new-import']){let release,started=false;const ctx=onxApp({putOriginal:()=>{started=true;return new Promise(r=>release=r);}});pickONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-review-title'));ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>started);if(action==='cancel')ctx.root.querySelector('[data-action=onx-cancel]').click();if(action==='station')ctx.app.getJob().nodes[0].tag='operator edit';if(action==='new-import')pickONX(ctx,syntheticONX('reverse'));release('a'.repeat(64));await new Promise(r=>setTimeout(r,30));assert.equal(ctx.app.getJob().nodes[0].measurementReports,undefined);assert.deepEqual(ctx.app.getJob().portSweeps,{});assert.equal(localStorage.getItem('carpe-noctum:jobs:v1'),null);}
});
test('ONX snapshots every destination and rejects station edits made before selecting it',async()=>{
 const ctx=onxApp();ctx.app.getJob().nodes.push({id:'other',name:'Other',tag:'',kind:'active',modelId:'gm-hgd-42',settings:{}});pickONX(ctx,syntheticONX('reverse'));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));ctx.app.getJob().nodes[1].tag='changed';const select=ctx.root.querySelector('#onx-station');select.value='other';select.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.match(ctx.root.querySelector('#onx-error').textContent,/changed/i);assert.equal(ctx.app.getJob().nodes[1].measurementReports,undefined);
});
test('ONX rejects files above 20 MiB before reading bytes',async()=>{
 const ctx=onxApp();let read=false;pickONX(ctx,syntheticONX(),{size:20*1024*1024+1,arrayBuffer:async()=>{read=true;return new ArrayBuffer(0);}});await untilONX(()=>ctx.root.textContent.includes('20 MiB'));assert.equal(read,false);
});
test('ONX cancellation during asynchronous inspection suppresses late success and errors',async()=>{
 for(const fail of [false,true]){let resolve,reject,started=false;const ctx=onxApp({inspectONX:()=>{started=true;return new Promise((yes,no)=>{resolve=yes;reject=no;});}});pickONX(ctx);await untilONX(()=>started);ctx.root.querySelector('[data-action=onx-cancel]').click();if(fail)reject(new Error('late inspection'));else resolve({kind:'onecheck',direction:'mixed',metadata:{},series:[],tables:[],warnings:[]});await new Promise(r=>setTimeout(r,20));assert.equal(ctx.root.querySelector('#onx-review-title'),null);assert.match(ctx.root.querySelector('.notice').textContent,/cancelled/);assert.deepEqual(ctx.app.getJob().portSweeps,{});}
});
test('ONX destination and before stage are explicit; unknown equipment has no selectable physical port',async()=>{
 const ctx=onxApp();const job=ctx.app.getJob();job.nodes.push({id:'other',name:'Other',tag:'original',kind:'active',modelId:'gm-hgd-42',settings:{}},{id:'unknown',name:'Unknown',tag:'',kind:'passive',modelId:'',settings:{}});pickONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-review-title'));let station=ctx.root.querySelector('#onx-station');station.value='unknown';station.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));assert.deepEqual([...ctx.root.querySelector('#onx-port').options].map(x=>x.value),['']);saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.match(ctx.root.querySelector('#onx-error').textContent,/equipment/);station=ctx.root.querySelector('#onx-station');station.value='other';station.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));ctx.root.querySelector('#onx-port').value='aux2';ctx.root.querySelector('#onx-port').dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));ctx.root.querySelector('#onx-stage').value='before';ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>ctx.app.getJob().nodes[1].measurementReports?.length);assert.equal(ctx.app.getJob().nodes[1].tag,'original');assert.equal(ctx.app.getJob().nodes[1].modelId,'gm-hgd-42');assert.equal(ctx.app.getJob().nodes[1].measurementReports[0].stage,'before');assert.equal(ctx.app.getJob().portSweeps['other::aux2'].stage,'before');assert.equal(ctx.app.getJob().nodes[0].readings,undefined);
});
test('ONX report viewer identifies chart sections and plot boundary rows as exported geometry',async()=>{
 const {renderMeasurementReport}=await import('../app/onx-import-ui.mjs');const html=renderMeasurementReport({kind:'onecheck',direction:'mixed',metadata:{},warnings:[],tables:[],series:[{id:'chart',section:'DOCSIS downstream',label:'Passed OFDM',direction:'forward',frequencyUnit:'MHz',levelUnit:'dBmV',samples:[[100,-150],[100,5],[200,6],[200,-150]],plotClosureIndices:[0,3]}]});const doc=new JSDOM(html).window.document;assert.match(doc.querySelector('.report-series summary').textContent,/DOCSIS downstream/);assert.equal([...doc.querySelectorAll('tbody tr')].filter(x=>/Plot boundary \(not a measured level\)/.test(x.textContent)).length,2);
});
test('ONX original storage failure leaves evidence and active forward reading unchanged',async()=>{
 const ctx=onxApp({putOriginal:async()=>{throw new Error('local original storage unavailable');}});pickONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-review-title'));ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.match(ctx.root.querySelector('#onx-error').textContent,/storage unavailable/);assert.equal(ctx.app.getJob().nodes[0].measurementReports,undefined);assert.deepEqual(ctx.app.getJob().portSweeps,{});assert.equal(localStorage.getItem('carpe-noctum:jobs:v1'),null);
});
test('ONX station changes require an explicit physical port for forward sweeps and evidence',async()=>{
 for(const kind of ['forward','reverse','onecheck']) {
  const ctx=onxApp();ctx.app.getJob().nodes.push({id:'other',name:'Other',tag:'',kind:'active',modelId:'gm-hgd-42',settings:{}});pickONX(ctx,syntheticONX(kind));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));
  const station=ctx.root.querySelector('#onx-station');station.value='other';station.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));assert.equal(ctx.root.querySelector('#onx-port').value,'');assert.equal(ctx.root.querySelector('#onx-port').required,true);if(kind==='forward')ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.equal(ctx.app.getJob().nodes[1].measurementReports,undefined);assert.deepEqual(ctx.app.getJob().portSweeps,{});
  const port=ctx.root.querySelector('#onx-port');port.value='aux2';port.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));if(kind==='forward')ctx.root.querySelector('#onx-connection').value='direct';saveONX(ctx);await untilONX(()=>ctx.app.getJob().nodes[1].measurementReports?.length);assert.equal(ctx.app.getJob().nodes[1].measurementReports[0].port,'aux2');
 }
});
test('ONX station and physical-port changes clear inherited TP loss, connection and correction preview',async()=>{
 for(const change of ['station','port']) {
  const ctx=onxApp();ctx.app.getJob().nodes.push({id:'vecima-destination',name:'Vecima station',tag:'',kind:'node',modelId:'vecima',settings:{}});pickONX(ctx,syntheticONX('forward',3));await untilONX(()=>ctx.root.querySelector('#onx-review-title'));
  const set=(selector,value)=>{const control=ctx.root.querySelector(selector);control.value=value;control.dispatchEvent(new ctx.dom.window.Event('change',{bubbles:true}));};
  set('#onx-compensation','yes');set('#onx-connection','tp');assert.equal(ctx.root.querySelector('#onx-loss').value,'20');assert.match(ctx.root.querySelector('#onx-correction').textContent,/Net correction 17\.0 dB/);
  if(change==='station'){set('#onx-station','vecima-destination');assert.equal(ctx.root.querySelector('#onx-port').value,'');set('#onx-port','3');}else set('#onx-port','2');
  assert.equal(ctx.root.querySelector('#onx-loss').value,'');assert.equal(ctx.root.querySelector('#onx-connection').value,'');assert.doesNotMatch(ctx.root.querySelector('#onx-correction').textContent,/Net correction 17\.0 dB/);assert.equal(ctx.root.querySelector('#onx-compensation').value,'yes');
  set('#onx-connection','tp');saveONX(ctx);await untilONX(()=>ctx.root.querySelector('#onx-error').textContent);assert.match(ctx.root.querySelector('#onx-error').textContent,/verified physical test-point loss/);assert.deepEqual(ctx.app.getJob().portSweeps,{});
  const newLoss=change==='station'?17:7;set('#onx-loss',String(newLoss));saveONX(ctx);const target=change==='station'?'vecima-destination':'node',port=change==='station'?'3':'2';await untilONX(()=>ctx.app.getJob().portSweeps[`${target}::${port}`]);assert.deepEqual(ctx.app.getJob().portSweeps[`${target}::${port}`].samples,change==='station'?[[57,25.4],[753,37.3]]:[[57,15.4],[753,27.3]]);
 }
});
