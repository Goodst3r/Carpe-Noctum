/* 2.0 Alpha build 3 design changes, checked against the built standalone app DOM. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const cases = [], errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(fs.readFileSync('outputs/Night_Sweep.html', 'utf8'), { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {}; w.structuredClone = structuredClone;
  w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; w.Uint8Array = Uint8Array; w.ArrayBuffer = ArrayBuffer; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
  w.NightSweepAndroid = { saveFile: () => {}, saveBinary: () => {}, printReport: () => {} };
  // JSDOM has no modal dialogs; this stand-in lets the plant picker path run.
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
} });
const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); assert.deepEqual(errors, [], 'runtime errors'); cases.push(name); console.log('PASS ' + name); }
function set(el, value, event = 'input') { el.value = value; el.dispatchEvent(new w.Event(event, { bubbles: true })); return el; }
const round1 = v => Math.round(v * 10) / 10;
async function newJobWith(choice) {
  const pending = ev('JobsUI.newJob()');
  await flush();
  const button = d.querySelector(`dialog.plant-picker [data-plant="${choice}"]`);
  assert(button, 'plant picker button ' + choice);
  button.click();
  return pending;
}

(async () => {
  await check('Home puts the working job and seven task buttons before the practice library', () => {
    const home = d.getElementById('homePanel'), order = [...home.children].map(c => c.className.split(' ')[0] || c.tagName);
    assert(order.indexOf('task-grid') > order.indexOf('home-current'));
    assert(order.indexOf('training-card') > order.indexOf('task-grid'), 'practice library after tasks: ' + order.join(','));
    const labels = [...d.querySelectorAll('.task-grid button strong')].map(x => x.textContent);
    assert.deepEqual(labels, ['Build a cable route', 'Check an amp or LE', 'Set up the meter', 'Compare a meter reading', 'Find a TDR location', 'Check power loading', 'Review or share the job']);
    assert.equal([...d.querySelectorAll('.training-library-group')].filter(x => x.open).length, 0, 'practice groups start closed');
  });

  await check('Renamed tabs, version-free screen headers and an icon theme toggle', () => {
    ev("WorkflowUI.go('route')");
    assert.deepEqual([...d.querySelectorAll('#taskTabs button')].map(b => b.textContent), ['Setup', 'Cable route', 'Amp gain', 'Amp / node setup', 'Catalog']);
    assert.equal(d.querySelector('#screenTitle .eyebrow').textContent, 'Route');
    ev("WorkflowUI.go('sweepSetup')");
    assert.deepEqual([...d.querySelectorAll('#taskTabs button')].map(b => b.textContent), ['Meter setup', 'TDR', 'Predicted levels', 'Frequency', 'Readings', 'References', 'Calculators', 'Limits', 'DOCSIS health', 'Leakage', 'Impairments']);
    ev("WorkflowUI.go('projects')");
    assert([...d.querySelectorAll('#taskTabs button')].some(b => b.textContent === 'Acceptance'));
    const toggle = d.getElementById('themeToggle');
    assert(toggle.querySelector('svg'), 'theme icon');
    assert.match(toggle.getAttribute('aria-label'), /Switch to (Sun|Night) palette/);
    assert.equal(d.querySelector('header .sub').textContent, 'HFC field tools');
    assert(d.querySelector('.footer').textContent.includes('Carpe Noctum 2.0 Alpha build 3'), 'version kept in Help footer');
  });

  await check('New job on 42/54 starts at 31/43 dBmV at 54/860 MHz, picks the 42 MHz meter workflow and joins the job list', async () => {
    assert.equal(await newJobWith('42'), true);
    const s = json('state.setup');
    assert.deepEqual([s.lowF, s.highF, s.lowLevel, s.highLevel, s.liveMax], [54, 860, 31, 43, 860]);
    assert.equal(json('state.sweepSetup.selected'), '42');
    const lib = JSON.parse(w.localStorage.getItem('hfc-named-jobs-v1'));
    assert.equal(lib.activeId, json('state.job.id'), 'new job is the active listed job');
    assert(lib.jobs.some(j => j.id === lib.activeId), 'new job is in the list');
    assert.equal(d.querySelector('dialog.plant-picker'), null, 'picker removed');
    // A later edit saves into the listed job without pressing Save.
    const name = d.querySelector('[data-job-field="name"]'); set(name, 'Node 4417 overnight');
    const after = JSON.parse(w.localStorage.getItem('hfc-named-jobs-v1'));
    assert.equal(after.jobs.find(j => j.id === after.activeId).name, 'Node 4417 overnight');
  });

  await check('New job on 204/258 keeps the high-split anchors and Cancel changes nothing', async () => {
    assert.equal(await newJobWith('204'), true);
    const s = json('state.setup');
    assert.deepEqual([s.lowF, s.highF, s.lowLevel, s.highLevel], [261, 993, 34, 46]);
    assert.equal(json('state.sweepSetup.selected'), '204');
    const before = ev('JSON.stringify(state)'), lib = w.localStorage.getItem('hfc-named-jobs-v1');
    assert.equal(await newJobWith('cancel'), false);
    assert.equal(ev('JSON.stringify(state)'), before); assert.equal(w.localStorage.getItem('hfc-named-jobs-v1'), lib);
  });

  await check('A new route point copies the previous span cable; a faceplate part number picks the exact part', async () => {
    ev("WorkflowUI.go('route')");
    d.getElementById('add').click(); await flush();
    const first = json('state.rows[0].id');
    set(d.querySelector(`#route [data-row="${first}"] [data-field="cable"]`), 'qr_715', 'change'); await flush();
    d.getElementById('add').click(); await flush();
    assert.equal(json('state.rows[1].cable'), 'qr_715');
    const second = json('state.rows[1].id'), search = () => d.querySelector(`#route [data-row="${second}"] input[data-part-search]`);
    set(search(), 'OTTZ'); await flush();
    assert.equal(json('state.rows[1].device'), 'none', 'a family word alone does not pick a part');
    set(search(), 'ottz 4 17'); await flush();
    assert.equal(json('state.rows[1].device'), 'technetix-ottz-1-8-ghz--ottz-4-17');
    assert.equal(json('state.rows[1].family'), 'Technetix OTTZ 1.8 GHz');
    assert.match(d.querySelector(`#route [data-row="${second}"] [data-picker-hint]`).textContent, /Matched OTTZ-4-17/);
  });

  await check('Each point shows both launch frequencies and the tap-port tilt from the same calculation', async () => {
    ev('example();renderAll()'); await flush(); ev("WorkflowUI.go('route')"); await flush();
    const lo = json('state.setup.lowF'), hi = json('state.setup.highF');
    const want = json(`(()=>{const a=evaluate(${lo}).results[0],b=evaluate(${hi}).results[0],t=o=>o.outputs.find(x=>x.role==='tap');return {inLo:a.input.level,inHi:b.input.level,tapLo:t(a).level,tapHi:t(b).level};})()`);
    const card = d.querySelector('#route [data-row] [data-point-summary]');
    assert(card, 'summary present');
    const cells = [...card.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent));
    assert.deepEqual(cells[0], [round1(want.inLo).toFixed(1), round1(want.inHi).toFixed(1)]);
    assert.deepEqual(cells.at(-1), [round1(want.tapLo).toFixed(1), round1(want.tapHi).toFixed(1)]);
    assert.equal(card.querySelector('.tilt span:last-child').textContent, round1(want.tapHi - want.tapLo).toFixed(1) + ' dB');
    assert.equal(card.querySelector('.badge').textContent, 'Predicted');
  });

  await check('Start from route builds one power load per route active with upstream feeds, span feet and cable', async () => {
    const training = JSON.parse(fs.readFileSync('release/NightSweep_1.8_Alpha_build_2_Training_Job.json', 'utf8'));
    ev('loadState(' + JSON.stringify(training) + ')'); await flush();
    ev("WorkflowUI.go('power')");
    d.getElementById('powerFromRoute').click(); await flush();
    const expected = json(`(()=>{const x=HFC.routeDistances(state,catalog);return state.rows.filter(r=>device(r.device)?.active).map(r=>({end:x.byId.get(r.id).end,cable:r.cable}));})()`);
    const rows = json('state.power.rows');
    assert.equal(rows.length, expected.length);
    assert.equal(rows[0].parent, 'supply'); assert.equal(rows[0].length, expected[0].end); assert.equal(rows[0].cable, expected[0].cable);
    for (let i = 1; i < rows.length; i++) { assert.equal(rows[i].parent, rows[i - 1].id); assert.equal(rows[i].length, round1(expected[i].end - expected[i - 1].end)); assert.equal(rows[i].cable, expected[i].cable); }
    assert(rows.every(r => r.equipment === 'custom' && r.load === ''), 'loads left for the technician');
    assert.match(d.getElementById('message').textContent, /assumes the supply feeds at the route start/);
  });

  await check('Sweep shows the chart before its settings and keeps the caveats in one info panel', () => {
    const panel = d.getElementById('sweepPanel'), kids = [...panel.children].map(c => c.className || c.id);
    assert(kids.indexOf('resultsgrid') < kids.findIndex(k => /chart-settings/.test(k)), kids.join(','));
    assert(d.getElementById('chartNotes').closest('details.info-panel'), 'chart notes live in the info panel');
    assert(!panel.querySelector('.sectionhead').textContent.includes('certify'), 'no repeated caveat in the heading');
  });

  fs.writeFileSync('qa/v20-design-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, cases }, null, 2) + '\n');
  console.log('2.0 design: ' + cases.length + ' checks passed');
})().catch(e => { console.error(e); process.exit(1); });
