/* Build 3 finishing: speed-ups that must not change what the user sees, and the Named jobs cold-start fix.
   Synthetic data only. Each speed-up check also proves the output is the same as an unguarded redraw. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootApp, root } = require('./build2-source-harness.cjs');
const FDB = require('./runtime/node_modules/fake-indexeddb');
const cases = [];
let comparisons = 0;
const flush = () => new Promise(r => setImmediate(r));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const settle = async (n = 40) => { for (let i = 0; i < n; i++) await flush(); };
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }

function bootWithObservers(extra) {
  const observers = [];
  const h = bootApp({ beforeParse(w) { w.ResizeObserver = class { constructor(cb) { observers.push(cb); } observe() {} }; extra?.(w); } });
  return { h, observers };
}
const plot = h => h.ev("document.getElementById('plot').innerHTML");
const freshDraw = h => { h.ev('drawChart()'); return plot(h); };
const countDraws = h => h.ev("window.__draws=0;{const original=drawChart;drawChart=function(...a){window.__draws++;return original(...a);};}");

(async () => {
  await check('After a cold start with attached evidence, the Named jobs buttons are usable', async () => {
    const idb = new FDB.IDBFactory();
    const first = bootApp({ beforeParse(w) { w.indexedDB = idb; } }); await settle();
    const bytes = new TextEncoder().encode('frequency_mhz,level_dbmv\n100,30\n200,31\n');
    await first.ev('EvidenceUI').importFiles([{ name: 'practice-sweep.csv', size: bytes.byteLength, type: 'text/csv', arrayBuffer: async () => bytes.slice().buffer }], { kind: 'Sweep', stage: 'Before', asset: 'AMP-1', notes: '' });
    await settle();
    first.ev('JobsUI.saveNamed()'); await settle();
    assert.equal(first.ev('state.evidence.length'), 1);
    const saved = {};
    for (let i = 0; i < first.w.localStorage.length; i++) { const k = first.w.localStorage.key(i); saved[k] = first.w.localStorage.getItem(k); }
    first.close();
    const second = bootApp({ beforeParse(w) { w.indexedDB = idb; for (const [k, v] of Object.entries(saved)) w.localStorage.setItem(k, v); } });
    await settle(200);
    assert.equal(second.ev('state.evidence.length'), 1, 'the evidence came back with the job');
    assert.equal(second.ev('EvidenceUI.isBusy()'), false, 'the startup evidence check finished');
    const buttons = [...second.d.querySelectorAll('#jobNew,#jobSave,[data-job-open],[data-job-duplicate],[data-job-delete]')];
    assert.ok(buttons.length >= 5, 'New, Save and the saved job row buttons are shown');
    assert.deepEqual(buttons.filter(b => b.disabled).map(b => b.id || b.textContent), [], 'no Named jobs button is left disabled');
    assert.deepEqual(second.errors, []);
    second.close();
    comparisons += 6;
  });

  await check('If the user is typing in a Named jobs field when the evidence check ends, the buttons still come back, and the typing is untouched', async () => {
    const h = bootApp(); await settle();
    const bytes = new TextEncoder().encode('frequency_mhz,level_dbmv\n100,30\n');
    await h.ev('EvidenceUI').importFiles([{ name: 'practice-sweep.csv', size: bytes.byteLength, type: 'text/csv', arrayBuffer: async () => bytes.slice().buffer }], { kind: 'Sweep', stage: 'Before', asset: 'AMP-1', notes: '' });
    await settle(); h.ev('JobsUI.saveNamed()'); await settle();
    const buttons = () => [...h.d.querySelectorAll('#jobNew,#jobSave,[data-job-open],[data-job-duplicate],[data-job-delete]')];
    const pending = h.ev('EvidenceUI.reloadPreviews()');
    h.ev('JobsUI.render()');
    assert.ok(buttons().every(b => b.disabled), 'buttons are disabled while the check runs');
    const name = h.d.querySelector('#jobsPanel [data-job-field="name"]');
    name.focus(); name.value = 'PRACTICE typing'; name.setSelectionRange(4, 4);
    await pending; await settle();
    assert.equal(h.d.activeElement, name, 'focus stays in the field');
    assert.equal(name.value, 'PRACTICE typing'); assert.equal(name.selectionStart, 4, 'the caret is not moved');
    assert.deepEqual(buttons().filter(b => b.disabled).length, 0, 'no button is left disabled');
    assert.deepEqual(h.errors, []);
    h.close();
    comparisons += 6;
  });

  await check('The hidden Sweep chart is drawn once at start and not redrawn while Sweep is hidden', async () => {
    const { h, observers } = bootWithObservers(); await settle(); await sleep(40);
    assert.equal(h.ev("document.getElementById('sweepPanel').hidden"), true, 'the app opens on another screen');
    assert.equal(h.ev("document.getElementById('plot').getAttribute('viewBox')"), '0 0 700 355', 'the start-up chart is still drawn');
    assert.ok(h.ev("document.getElementById('chartNotes').textContent.length") > 0, 'chart notes are filled at start-up');
    countDraws(h);
    const before = plot(h);
    observers.forEach(cb => cb([]));
    h.ev('refreshResults()');
    assert.equal(h.ev('window.__draws'), 0, 'no redraw while Sweep is hidden');
    assert.equal(plot(h), before, 'the hidden chart is untouched');
    assert.deepEqual(h.errors, []);
    h.close();
    comparisons += 5;
  });

  await check('Opening Sweep and printing draw the chart from the current route, the same as a direct redraw', async () => {
    const { h, observers } = bootWithObservers(); await settle(); await sleep(40);
    countDraws(h);
    const stale = plot(h);
    h.ev("state.rows[1].length=state.rows[1].length+400;refreshResults()");
    assert.equal(plot(h), stale, 'an edit made while Sweep is hidden does not draw yet');
    h.ev("(window.NightSweep.showTab)('sweep')"); await sleep(80); await settle();
    assert.equal(h.ev("document.getElementById('sweepPanel').hidden"), false);
    assert.ok(h.ev('window.__draws') >= 1, 'opening Sweep draws');
    const shown = plot(h);
    assert.notEqual(shown, stale, 'the chart reflects the edit');
    assert.equal(freshDraw(h), shown, 'the chart equals a direct redraw of the same route');
    h.ev('window.__draws=0'); observers.forEach(cb => cb([]));
    assert.ok(h.ev('window.__draws') >= 1, 'a resize while Sweep is shown still draws');
    h.ev("(window.NightSweep.showTab)('home')"); await sleep(80); await settle();
    h.ev("state.rows[1].length=state.rows[1].length+400;refreshResults()");
    const hiddenBeforePrint = plot(h);
    h.ev('window.NightSweep.preparePrint()');
    const printed = plot(h);
    assert.notEqual(printed, hiddenBeforePrint, 'printing draws the current route');
    assert.equal(freshDraw(h), printed, 'the printed chart equals a direct redraw');
    h.ev('window.NightSweep.restorePrint&&window.NightSweep.restorePrint()');
    assert.deepEqual(h.errors, []);
    h.close();
    comparisons += 9;
  });

  await check('Meter results reuse one calculation per render, with the same output as before', async () => {
    const { h } = bootWithObservers(); await settle(); await sleep(40);
    await h.d.getElementById('openTrainingJob').onclick(); await settle(60); await sleep(40);
    assert.equal(h.ev('state.rows.length'), 9, 'the synthetic training job is open');
    h.ev("window.__runs=0;{const original=HFC.run;HFC.run=function(...a){window.__runs++;return original.apply(this,a);};}");
    h.ev('renderMeterResults()');
    const runs = h.ev('window.__runs');
    assert.ok(runs <= 2, 'at most two route calculations per meter render, was ' + runs);
    const meters = () => h.ev("[...document.querySelectorAll('#route .meter-result')].map(e=>e.innerHTML).join('\\n')");
    const fromMeters = meters();
    h.ev('refreshResults()');
    assert.equal(meters(), fromMeters, 'meter results equal the full refresh');
    h.ev('window.__runs=0'); h.ev('renderMeterResults()');
    assert.equal(h.ev('window.__runs'), runs, 'the count does not grow between renders');
    assert.deepEqual(h.errors, []);
    h.close();
    comparisons += 5;
  });

  await check('The catalog device lookup returns exactly what a list search returns', async () => {
    const { h } = bootWithObservers(); await settle();
    const same = h.ev("(()=>{const ids=catalog.devices.map(d=>d.id).concat([undefined,null,'','no-such-device']);let n=0;for(const id of ids){if(device(id)!==catalog.devices.find(d=>d.id===id))throw Error('device('+String(id)+') differs');n++;}return n;})()");
    assert.equal(same, h.ev('catalog.devices.length') + 4);
    const source = fs.readFileSync(path.join(root, 'night-sweep/app.js'), 'utf8');
    assert.ok(source.startsWith('const catalog='), 'app.js still starts with the catalog line other checks rely on');
    assert.deepEqual(h.errors, []);
    h.close();
    comparisons += 3;
  });

  console.log(`Build3 perf guards: ${cases.length} checks passed, ${comparisons} comparisons`);
})().catch(e => { console.error(e); process.exit(1); });
