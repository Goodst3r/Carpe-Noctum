import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {renderStationDesignReference,renderDesignSchedule} from '../app/design-reference.mjs';
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
