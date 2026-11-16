import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {indexedDB as fakeIndexedDB} from 'fake-indexeddb';
import {renderStationDesignReference,renderDesignSchedule,renderCableSchedule} from '../app/design-reference.mjs';
import {mountApp} from '../app/ui.mjs';
import {createJob,saveJob} from '../app/store.mjs';

const reference=()=>({basis:'design-schedule',sourceLabel:'Sheet <one>',printedModel:'MODEL & CO',design:{inputSamples:[[54,0],[750,12]],outputSamples:[[750,35]],forwardPadDb:0,forwardEqDb:null,returnPadDb:3,returnEqDb:null},actual:{inputSamples:null,outputSamples:null,forwardPadDb:null,forwardEqDb:null,returnPadDb:null,returnEqDb:null},notes:['note <script>alert(1)</script>']});

test('station reference escapes text and distinguishes zero design from unknown actual',()=>{
  const html=renderStationDesignReference(reference()),doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelector('script'),null);
  assert.match(doc.body.textContent,/Sheet <one>/);
  assert.match(doc.body.textContent,/MODEL & CO/);
  assert.match(doc.body.textContent,/54 MHz.*0 dBmV/);
  assert.match(doc.body.textContent,/Forward pad/);assert.match(doc.body.textContent,/0 dB/);
  assert.match(doc.body.textContent,/Actual.*Unknown/s);
  assert.match(doc.body.textContent,/Design schedule/);
});

test('global schedule includes unmatched rows, escapes text and never changes the job',()=>{
  const job={nodes:[{id:'node',settings:{},readings:{}}],portSweeps:{},designSchedule:{basis:'design-schedule',sourceLabel:'Plan <A>',stations:[{tag:'A9',name:'Unmatched <img src=x>',printedModel:'MODEL',design:reference().design}]}};
  const before=structuredClone(job),html=renderDesignSchedule(job.designSchedule),doc=new JSDOM(html).window.document;
  assert.ok(doc.querySelector('details table'));
  assert.equal(doc.querySelector('img'),null);
  assert.match(doc.body.textContent,/Unmatched <img src=x>/);
  assert.match(doc.body.textContent,/A9/);
  assert.deepEqual(job,before);
});

test('job UI shows global references and selected station reference without assigning data',async()=>{
  const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
  globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;
  try {
    const job=createJob('low');job.name='Synthetic job';job.nodes[0].designReference=reference();
    job.designSchedule={basis:'design-schedule',sourceLabel:'Synthetic plan',stations:[{tag:'A9',name:'Unmatched row',printedModel:'Candidate',design:reference().design}]};
    saveJob(job);const before=structuredClone(job),root=document.querySelector('#app');const app=mountApp(root);
    root.querySelector('[data-tab=route]').click();root.querySelector('.library summary').click();root.querySelector('[data-open]').click();await new Promise(resolve=>setTimeout(resolve,0));
    assert.match(root.textContent,/Unmatched row/);
    assert.match(root.textContent,/MODEL & CO/);
    assert.deepEqual(app.getJob(),before);
    assert.deepEqual(app.getJob().portSweeps,{});
    assert.equal(app.getJob().nodes[0].readings,undefined);
  } finally {delete globalThis.document;delete globalThis.window;delete globalThis.localStorage;}
});


test('cable references display field and design feet, unknown families, and escaped text',()=>{
 const schedule={basis:'walkout-field',sourceLabel:'Plan <X>',spans:[{id:'one',printedType:'.412 <b>',modelId:'mc2_500',designLengthFt:0,fieldLengthFt:null,status:'field & review',notes:['<script>bad</script>'],map:{page:2,x:.4,y:.6}},{id:'two',printedType:'Unknown type',modelId:null,designLengthFt:null,fieldLengthFt:25,status:'unverified',map:{page:0,x:1,y:0}}],typeLabels:[{id:'label',printedType:'Label only',modelId:null,status:'review',map:{page:1,x:.1,y:.2}}]};
 const before=structuredClone(schedule),doc=new JSDOM(renderCableSchedule(schedule)).window.document;
 assert.equal(doc.querySelector('script'),null);assert.equal(doc.querySelector('b'),null);
 assert.match(doc.body.textContent,/Plan <X>/);assert.match(doc.body.textContent,/\.412 <b>/);assert.match(doc.body.textContent,/0 ft/);assert.match(doc.body.textContent,/25 ft/);assert.match(doc.body.textContent,/MC2 \.500/);assert.match(doc.body.textContent,/Unknown/);assert.match(doc.body.textContent,/Label only/);assert.match(doc.body.textContent,/field & review/);
 assert.equal(doc.querySelectorAll('[data-cable-span]').length,2);assert.deepEqual(schedule,before);
});

test('locating cable references changes displayed map page without changing job or RF',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.localStorage=dom.window.localStorage;globalThis.indexedDB=fakeIndexedDB;
 try {const job=createJob('low');job.map={sha256:'0'.repeat(64),pages:[{pageNumber:1,width:100,height:100},{pageNumber:2,width:100,height:100}]};job.cableSchedule={sourceLabel:'Synthetic',basis:'walkout-field',spans:[{id:'span1',printedType:'example',modelId:'example-profile',designLengthFt:null,fieldLengthFt:0,status:'review',notes:[],map:{page:2,x:.4,y:.6}}]};
 saveJob(job);const root=document.querySelector('#app'),app=mountApp(root);root.querySelector('[data-tab=route]').click();root.querySelector('[data-open]').click();for(let i=0;i<50&&!app.getJob();i++)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(app.getJob());
 root.querySelector('[data-cable-span]').click();assert.match(root.textContent,/Page 2 \/ 2/);assert.deepEqual(app.getJob(),job);assert.deepEqual(app.getJob().portSweeps,{});assert.deepEqual(app.getJob().edges,[]);
 } finally {delete globalThis.document;delete globalThis.window;delete globalThis.localStorage;delete globalThis.indexedDB;}
});
