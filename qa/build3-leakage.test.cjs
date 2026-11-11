/* Build 3 leakage tools (build list item 7): app output against independent 50-digit decimal
   references, then the rendered screen, registry rows, the device-local notebook and the saved-job
   format. Synthetic readings only; no real leak, plant or customer data. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const reference = JSON.parse(fs.readFileSync('research/build3/leakage-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const KEY = 'nightsweep-leakage-v1';
const cases = [];
let comparisons = 0, downloads = [];

function boot({ seed = null, failWrites = false } = {}) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {}; w.structuredClone = structuredClone;
    w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
    w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
    w.NightSweepAndroid = { saveFile: (name, text, mime) => downloads.push({ name, text, mime }), saveBinary() {}, printReport() {} };
    if (seed !== null) w.localStorage.setItem(KEY, seed);
    if (failWrites) {
      const real = w.Storage.prototype.setItem;
      w.Storage.prototype.setItem = function (k, v) { if (k === KEY) throw new w.DOMException('quota', 'QuotaExceededError'); return real.call(this, k, v); };
    }
  } });
  const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
  return { dom, w, d, ev, json, errors, close: () => w.close() };
}
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
function close(actual, expected, label, tol = 1e-11) {
  const e = Number(expected);
  assert(Number.isFinite(actual), label + ' is finite: ' + actual);
  assert(Math.abs(actual - e) <= Math.max(tol, Math.abs(e) * tol), `${label}: app ${actual} vs reference ${expected}`);
  comparisons++;
}
const call = (h, fn, input) => h.json(`Leakage.${fn}(${JSON.stringify(input)})`);
function set(h, selector, value, type = 'input') { const el = h.d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new h.w.Event(type, { bubbles: true })); return el; }
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const result = (h, id) => words(h.d.getElementById('leak-' + id + '-result'));
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
const click = (h, selector) => { const el = h.d.querySelector(selector); assert(el, selector); el.click(); };

(async () => {
  const h = boot();
  await flush();

  await check('The printed rules are the values in the code: Table 1 limits and distances, CLI limit 64, 50 µV/m, 75%', () => {
    const L = h.json('Leakage.LIMITS');
    assert.deepEqual([L['analog-near'].limit, L['analog-near'].distance, L['digital-near'].limit, L['digital-near'].distance], [20, 3, 17.4, 3]);
    assert.deepEqual([L['analog-far'].limit, L['analog-far'].distance, L['digital-far'].limit, L['digital-far'].distance], [15, 30, 13.1, 30]);
    assert.equal(h.ev('Leakage.CLI_LIMIT'), 64); assert.equal(h.ev('Leakage.CLI_MIN_LEAK'), 50); assert.equal(h.ev('Leakage.CLI_SAMPLING'), 0.75);
    assert.equal(reference.rules.cli_limit, 64);
  });

  await check('The frequency band picks the right Table 1 row: over 54 up to and including 216 MHz is 3 m, everything else 30 m', () => {
    for (const c of reference.cases.rule) {
      const r = h.json(`Leakage.rule(${JSON.stringify(c.input.frequency)},${JSON.stringify(c.input.kind)})`);
      assert.equal(r.ok, true, JSON.stringify(c.input)); close(r.limit, c.expected.limit, 'limit ' + JSON.stringify(c.input)); close(r.distance, c.expected.distance, 'distance');
    }
  });

  await check('Limit check: restated level, status at the limit itself, dB over, and the CLI flag match the references', () => {
    for (const c of reference.cases.limit) {
      const r = call(h, 'checkLimit', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      for (const k of ['limit', 'ruleDistance', 'atRule', 'ratioDb', 'metres']) close(r[k], c.expected[k], `limit ${JSON.stringify(c.input)} ${k}`);
      assert.equal(r.converted, c.expected.converted, 'converted ' + JSON.stringify(c.input)); assert.equal(r.countsForCli, c.expected.countsForCli, 'CLI flag ' + JSON.stringify(c.input));
    }
  });

  await check('Distance normalizer matches the references in metres and feet, and warns when closer than 3 m', () => {
    for (const c of reference.cases.normalize) {
      const r = call(h, 'normalize', c.input);
      assert.equal(r.ok, true); for (const k of ['at3', 'at30', 'metres', 'feet']) close(r[k], c.expected[k], `normalize ${JSON.stringify(c.input)} ${k}`);
      assert.equal(r.closer, Number(c.expected.metres) < 3);
    }
  });

  await check('CLI matches the references, counts only 50 µV/m and up, and reproduces the worked examples', () => {
    for (const c of reference.cases.cli) {
      const r = call(h, 'cli', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      assert.equal(r.counted, c.expected.counted); assert.equal(r.ignored, c.expected.ignored);
      for (const k of ['theta', 'sumSquares', 'index']) close(r[k], c.expected[k], `cli ${k} ${JSON.stringify(c.input)}`);
      if (c.expected.cli === null) { assert.equal(r.cli, null, 'no counted leaks gives no index, not zero'); continue; }
      close(r.cli, c.expected.cli, 'cli index'); close(r.margin, c.expected.margin, 'cli margin'); close(r.strongest, c.expected.strongest, 'strongest alone');
    }
    const worked = call(h, 'cli', { leaks: '100 60 50', theta: '0.8' });
    assert.equal(worked.sumSquares, 16100); assert.equal(worked.index, 20125); assert.equal(Number(worked.cli.toFixed(1)), 43.0);
    assert.equal(call(h, 'cli', { leaks: '120, 85, 60, 250, 50', theta: '0.8' }).cli.toFixed(2), '50.52');
    assert.equal(call(h, 'cli', { leaks: '100', theta: '0.5' }).samplingOk, false, 'under 75% is flagged');
    assert.equal(call(h, 'cli', { leaks: '100', theta: '0.75' }).samplingOk, true, '75% is enough');
    assert.equal(call(h, 'cli', { leaks: '50', theta: '1' }).counted, 1, 'exactly 50 counts');
    assert.equal(call(h, 'cli', { leaks: '49.999', theta: '1' }).counted, 0, 'below 50 does not');
  });

  await check('Detector check difference and tolerance status match the references; a blank tolerance is unknown, never zero', () => {
    for (const c of reference.cases.detector) {
      const r = call(h, 'detector', c.input);
      assert.equal(r.ok, true); close(r.diffDb, c.expected.diffDb, 'diff dB'); close(r.percent, c.expected.percent, 'percent');
    }
    for (const c of reference.cases.tolerance) {
      const r = h.json(`Leakage.toleranceCheck(${Number(c.diffDb)},${JSON.stringify(c.tolerance)})`);
      assert.equal(r.status, c.expected.status, JSON.stringify(c));
      if (c.expected.margin !== null) close(r.margin, c.expected.margin, 'tolerance margin');
    }
    assert.equal(h.json('Leakage.toleranceCheck(1,"abc")').status, 'invalid');
  });

  await check('Invalid or missing input gives a reason and no number; nothing defaults', () => {
    for (const c of reference.cases.errors) {
      const r = call(h, c.fn, c.input);
      assert.equal(r.ok, false, JSON.stringify(c)); assert(typeof r.error === 'string' && r.error.length > 10, JSON.stringify(c));
      for (const k of ['status', 'margin', 'cli', 'atRule', 'at3', 'diffDb']) assert.equal(r[k], undefined, `${JSON.stringify(c)} must not return ${k}`);
    }
  });

  await check('The Leakage tab sits under Test after DOCSIS health; its panel shows only there and the page has the five cards', async () => {
    await goto(h, 'projects');
    assert.equal(h.d.getElementById('leakagePanel').hidden, true);
    await goto(h, 'leakage');
    const tabs = [...h.d.querySelectorAll('#taskTabs button')].map(b => b.textContent.trim());
    assert.deepEqual(tabs.slice(-3), ['Limits', 'DOCSIS health', 'Leakage']);
    assert.equal(h.d.getElementById('leakagePanel').hidden, false); assert.equal(h.d.getElementById('docsisHealthPanel').hidden, true);
    assert.match(h.d.getElementById('screenTitle').textContent, /Check and log signal leakage/);
    assert.equal(h.d.querySelectorAll('#leakagePanel .leak-card').length, 5);
    assert.equal(h.d.querySelectorAll('#leakagePanel .leak-table tbody tr').length, 4, 'the four Table 1 rows');
    assert.equal(h.d.querySelectorAll('#leakagePanel [inputmode]').length, 0, 'no decimal keypad: the iPhone one has no minus key');
    assert.match(words(h.d.getElementById('leakagePanel')), /not the company’s official leak record/);
  });

  await check('The limit check states the applicable limit, the restated level and the verdict in words, and says when it is approximate', async () => {
    set(h, '[data-leak="limit"][data-field="frequency"]', '121.2625'); set(h, '[data-leak="limit"][data-field="kind"]', 'analog', 'change');
    set(h, '[data-leak="limit"][data-field="field"]', '25'); set(h, '[data-leak="limit"][data-field="distance"]', '3'); set(h, '[data-leak="limit"][data-field="unit"]', 'm', 'change');
    let text = result(h, 'limit');
    assert.match(text, /Limit that applies.*20 µV\/m at 3 m/); assert.match(text, /Over the limit by 5 µV\/m/); assert.doesNotMatch(text, /counts in the CLI/, '25 µV\/m is under the 50 that the CLI counts');
    set(h, '[data-leak="limit"][data-field="field"]', '20');
    assert.match(result(h, 'limit'), /At or below the limit/, 'a reading exactly at the limit is within it');
    set(h, '[data-leak="limit"][data-field="distance"]', '10'); set(h, '[data-leak="limit"][data-field="unit"]', 'ft', 'change');
    assert.match(result(h, 'limit'), /Restated from 3\.05 m by distance: approximate/);
    set(h, '[data-leak="limit"][data-field="frequency"]', '750'); set(h, '[data-leak="limit"][data-field="kind"]', 'digital', 'change');
    set(h, '[data-leak="limit"][data-field="distance"]', '30'); set(h, '[data-leak="limit"][data-field="unit"]', 'm', 'change'); set(h, '[data-leak="limit"][data-field="field"]', '13.1');
    text = result(h, 'limit');
    assert.match(text, /13\.1 µV\/m at 30 m/); assert.match(text, /At or below the limit/);
    set(h, '[data-leak="limit"][data-field="kind"]', '', 'change');
    assert.match(result(h, 'limit'), /Choose whether the leaking signal is analog or digital/, 'no default signal kind');
    set(h, '[data-leak="limit"][data-field="distance"]', '30'); set(h, '[data-leak="limit"][data-field="unit"]', '', 'change');
    assert.doesNotMatch(result(h, 'limit'), /At or below|Over the limit/);
  });

  await check('Normalizer, CLI and detector cards show their results; the CLI says nothing is counted instead of showing zero', async () => {
    set(h, '[data-leak="normalize"][data-field="field"]', '40'); set(h, '[data-leak="normalize"][data-field="distance"]', '10'); set(h, '[data-leak="normalize"][data-field="unit"]', 'm', 'change');
    assert.match(result(h, 'normalize'), /At 3 m 133\.3 µV\/m/); assert.match(result(h, 'normalize'), /counts in the CLI/);
    set(h, '[data-leak="normalize"][data-field="distance"]', '1');
    assert.match(result(h, 'normalize'), /Closer than 3 m/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '100, 60, 50'); set(h, '[data-leak="cli"][data-field="theta"]', '0.8');
    let text = result(h, 'cli');
    assert.match(text, /Leaks counted \(50 µV\/m or more\) 3 of 3 entered/); assert.match(text, /Index, 10·log10\(I\).*43\.04 dB/); assert.match(text, /21\.0 dB at or below the printed value of 64/);
    set(h, '[data-leak="cli"][data-field="theta"]', '0.5');
    assert.match(result(h, 'cli'), /Less than 75% of the plant examined/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '10, 20, 49'); set(h, '[data-leak="cli"][data-field="theta"]', '0.8');
    text = result(h, 'cli');
    assert.match(text, /No leak is at 50 µV\/m or more.*no index to compute/); assert.doesNotMatch(text, /0 dB/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '100, abc');
    assert.match(result(h, 'cli'), /“abc” is not a field strength/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '120 85 60 250 50'); set(h, '[data-leak="cli"][data-field="theta"]', ''); set(h, '[data-leak="cli"][data-field="tested"]', '160'); set(h, '[data-leak="cli"][data-field="total"]', '200');
    assert.match(result(h, 'cli'), /50\.52 dB/);
    set(h, '[data-leak="detector"][data-field="method"]', 'direct', 'change'); set(h, '[data-leak="detector"][data-field="expected"]', '20'); set(h, '[data-leak="detector"][data-field="read"]', '22');
    text = result(h, 'detector');
    assert.match(text, /Difference \+0\.83 dB \(\+10%\)/); assert.match(text, /Company tolerance.*Unknown — not entered/);
  });

  await check('Every figure on the screen carries a registry tag that resolves to one row; rules are Spec and primary, the normalizer and methods are labeled and flagged secondary', () => {
    const panel = h.d.getElementById('leakagePanel');
    const tags = [...panel.querySelectorAll('[data-threshold]')];
    assert(tags.length >= 12, 'tags: ' + tags.length);
    for (const t of tags) assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold);
    const rows = h.json('Thresholds.rows').filter(r => /^(leak\.|company\.leak\.)/.test(r.id));
    assert.equal(rows.length, 11);
    for (const r of rows) { assert.equal(r.scope, 'all', r.id); assert(r.usedBy.includes('Leakage'), r.id); }
    for (const id of ['leak.fcc.analog.near', 'leak.fcc.digital.near', 'leak.fcc.analog.far', 'leak.fcc.digital.far', 'leak.cli.formula', 'leak.cli.limit', 'leak.log.fields']) {
      const r = rows.find(x => x.id === id); assert.equal(r.label, 'spec', id); assert.equal(r.verification, 'primary', id);
    }
    assert.equal(rows.find(r => r.id === 'leak.normalize.distance').label, 'expert'); assert.equal(rows.find(r => r.id === 'leak.normalize.distance').verification, 'secondary');
    assert.equal(rows.find(r => r.id === 'leak.detector.methods').verification, 'secondary');
    for (const r of rows.filter(r => r.label === 'company')) { assert.equal(r.verification, 'entered'); assert.equal(r.store, 'leakage'); assert.equal(r.value, undefined); }
    assert.equal(rows.find(r => r.id === 'leak.fcc.analog.near').rangeText, '20 µV/m at 3 m');
    assert(rows.every(r => !/31 dBmV|43 dBmV|38 dBmV/.test(JSON.stringify(r))), 'the 31/43/38 company values are not used here');
  });

  await check('Leak log: add, list, mark repaired, delete; the fields are the ones 47 CFR 76.1706 names; entries are validated', async () => {
    const add = (o) => { for (const [k, v] of Object.entries(o)) set(h, `[data-leak="log"][data-field="${k}"]`, v); click(h, '#leakAdd'); };
    add({ found: '2026-11-10', location: '', cause: '' });
    assert.match(h.d.getElementById('leak-log-note').textContent, /Enter where the leak is/);
    add({ found: '2026-11-10', location: 'Pole 14 at Elm and 3rd', cause: 'Loose drop connector', field: '80', distance: '10', frequency: '121.2625', notes: 'Synthetic practice entry' });
    assert.match(h.d.getElementById('leak-log-note').textContent, /Added\. Saved on this device/);
    assert.match(words(h.d.getElementById('leakList')), /1 in the log · 1 open/); assert.match(words(h.d.getElementById('leakList')), /Pole 14 at Elm and 3rd.*Found 2026-11-10.*Open.*Loose drop connector.*80 µV\/m at 10 m → 266\.7 µV\/m at 3 m · 121\.2625 MHz.*counts in the CLI/);
    set(h, '[data-leak="log"][data-field="found"]', '2026-11-09'); set(h, '[data-leak="log"][data-field="location"]', 'Tap 7, Oak Street'); set(h, '[data-leak="log"][data-field="repaired"]', '2026-11-08'); click(h, '#leakAdd');
    assert.match(h.d.getElementById('leak-log-note').textContent, /repair date is before the date found/);
    const stored = JSON.parse(h.w.localStorage.getItem(KEY));
    assert.equal(stored.version, 1); assert.equal(stored.leaks.length, 1);
    assert.deepEqual(Object.keys(stored.leaks[0]).sort(), ['cause', 'distance', 'field', 'found', 'frequency', 'id', 'location', 'notes', 'repaired']);
    const id = stored.leaks[0].id;
    set(h, `[data-leak-repair="${id}"]`, '2026-11-12'); click(h, `[data-leak-mark="${id}"]`);
    assert.match(words(h.d.getElementById('leakList')), /Repaired 2026-11-12/); assert.match(words(h.d.getElementById('leakList')), /1 in the log · 0 open/);
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).leaks[0].repaired, '2026-11-12');
    // validation through the API
    for (const bad of [{ found: '2026-02-30', location: 'x' }, { found: 'yesterday', location: 'x' }, { found: '2026-11-10', location: 'x', field: '-4' }, { found: '2026-11-10', location: 'x', distance: '0' }, { found: '2026-11-10', location: 'x', frequency: '99999' }, { found: '1999-01-01', location: 'x' }]) {
      assert.equal(h.json(`Leakage.validateLeak(${JSON.stringify(bad)})`).ok, false, JSON.stringify(bad));
    }
    assert.equal(h.json('Leakage.validateLeak({found:"2026-11-10",location:"  Pole\\u0007 9  \\n at   Elm "})').record.location, 'Pole 9 at Elm', 'control characters and runs of spaces are cleaned');
    click(h, `[data-leak-delete="${id}"]`);
    assert.match(words(h.d.getElementById('leakList')), /No leaks logged on this device yet/);
  });

  await check('The repair threshold flags only open leaks at or above it, and starts unknown', async () => {
    assert.equal(h.json('Leakage.registryValue("repair")').text, 'Unknown — not entered');
    set(h, '[data-leak="log"][data-field="repaired"]', '');
    set(h, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(h, '[data-leak="log"][data-field="location"]', 'Pole 22'); set(h, '[data-leak="log"][data-field="field"]', '30'); set(h, '[data-leak="log"][data-field="distance"]', '3'); click(h, '#leakAdd');
    assert.doesNotMatch(words(h.d.getElementById('leakList')), /repair threshold/, 'no flag while the threshold is unknown');
    set(h, '[data-leak-company="repair"]', '25', 'change');
    assert.match(words(h.d.getElementById('leakList')), /At or above your repair threshold and still open/);
    set(h, '[data-leak-company="repair"]', '31', 'change');
    assert.doesNotMatch(words(h.d.getElementById('leakList')), /repair threshold and still open/);
    set(h, '[data-leak-company="tolerance"]', '1', 'change');
    assert.match(result(h, 'detector'), /± 1 dB.*Within your tolerance|Company tolerance.*± 1/);
    set(h, '[data-leak-company="tolerance"]', '-3', 'change');
    assert.match(h.d.getElementById('leak-company-note').textContent, /Not saved\./);
    await goto(h, 'limits');
    const list = words(h.d.getElementById('limitsList'));
    assert.match(list, /Your leak repair threshold 31 µV\/m at 3 m/); assert.match(list, /Your detector check tolerance 1 dB/);
    assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
    await goto(h, 'leakage');
  });

  await check('Detector checks can be saved, listed against the tolerance, and deleted', () => {
    set(h, '[data-leak="detector"][data-field="date"]', '2026-11-11'); click(h, '#leakCheckSave');
    const text = words(h.d.getElementById('leakChecks'));
    assert.match(text, /2026-11-11 · Directly connected source.*Expected 20, read 22 µV\/m: \+0\.83 dB · within your tolerance/);
    const id = JSON.parse(h.w.localStorage.getItem(KEY)).checks[0].id;
    click(h, `[data-leak-delete-check="${id}"]`);
    assert.equal(h.d.getElementById('leakChecks').children.length, 0);
  });

  await check('CSV export carries the 76.1706 fields, guards against spreadsheet formulas and quotes commas', async () => {
    const csv = h.ev(`Leakage.leaksCsv(${JSON.stringify([{ id: 'a', found: '2026-11-10', location: '=HYPERLINK("x")', cause: 'loose, corroded', repaired: '', field: 80, distance: 10, frequency: 121.2625, notes: '@note' }])})`);
    const lines = csv.trim().split('\r\n');
    assert.equal(lines[0], 'Date found,Location,Probable cause,Date repaired,Field strength (uV/m),Distance (m),Frequency (MHz),At 3 m (uV/m),Notes');
    assert.equal(lines[1], '2026-11-10,"\'=HYPERLINK(""x"")","loose, corroded",,80,10,121.2625,266.67,\'@note');
    downloads = [];
    set(h, '[data-leak="log"][data-field="location"]', 'Pole 31'); set(h, '[data-leak="log"][data-field="found"]', '2026-11-10'); click(h, '#leakAdd');
    click(h, '#leakExport');
    assert.equal(downloads.length, 1); assert.equal(downloads[0].name, 'CarpeNoctum_2.0_Alpha_build_3_Leak_Log.csv'); assert.match(downloads[0].text, /Pole 31/);
    h.d.getElementById('leakClear').click();
    assert.match(h.d.getElementById('leak-log-note').textContent, /Cleared on this device/);
    assert.equal(h.w.localStorage.getItem(KEY), null);
    click(h, '#leakExport');
    assert.match(h.d.getElementById('leak-log-note').textContent, /nothing to export/);
  });

  await check('The notebook never touches the saved job: the exported project and the other storage keys are unchanged', async () => {
    const before = JSON.stringify(h.json('evidenceExportProject(state)'));
    const keysBefore = Object.keys(h.w.localStorage).filter(k => k !== KEY).sort();
    set(h, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(h, '[data-leak="log"][data-field="location"]', 'Pole 5'); click(h, '#leakAdd');
    set(h, '[data-leak="cli"][data-field="leaks"]', '100'); set(h, '[data-leak="cli"][data-field="theta"]', '1');
    assert.equal(JSON.stringify(h.json('evidenceExportProject(state)')), before, 'job export identical');
    assert.deepEqual(Object.keys(h.w.localStorage).filter(k => k !== KEY).sort(), keysBefore, 'no other key changed');
    assert(!('leakage' in h.json('state')) && !('leakLog' in h.json('state')), 'no new job field');
    h.d.getElementById('leakClear').click();
  });

  await check('Stored data is read back; corrupt, oversized or hostile stored data is dropped without an error; writes keep what another tab saved', async () => {
    const good = boot({ seed: JSON.stringify({ version: 1, leaks: [{ id: 'k1', found: '2026-11-01', location: 'Tap 3', cause: 'x', repaired: '', field: 60, distance: 3, frequency: null, notes: '' }, { id: 'k1', found: '2026-11-02', location: 'dup id' }, { id: 'k2', found: 'nope', location: 'bad date' }, { id: '__proto__', found: '2026-11-03', location: 'bad id' }], checks: [{ id: 'c1', date: '2026-11-04', method: 'direct', expected: 20, read: 21 }, { id: 'c2', date: '2026-11-04', method: 'constructor', expected: 20, read: 21 }], company: { repair: 25, tolerance: 99 } }) });
    await flush();
    const snap = good.json('Leakage.snapshot()');
    assert.deepEqual(snap.leaks.map(l => l.id), ['k1']); assert.deepEqual(snap.checks.map(c => c.id), ['c1']);
    assert.equal(snap.company.repair, 25); assert.equal(snap.company.tolerance, null, 'out-of-range tolerance dropped');
    assert.deepEqual(good.errors, []); good.close();
    for (const seed of ['{not json', JSON.stringify({ version: 2, leaks: [] }), JSON.stringify([1]), '""', JSON.stringify({ version: 1, leaks: 'x', checks: {}, company: null })]) {
      const bad = boot({ seed }); await flush(); await goto(bad, 'leakage');
      assert.deepEqual(bad.json('Leakage.snapshot()').leaks, [], seed); assert.match(words(bad.d.getElementById('leakList')), /No leaks logged/);
      assert.deepEqual(bad.errors, [], 'no script error for ' + seed); bad.close();
    }
    const t = boot(); await flush(); await goto(t, 'leakage');
    t.w.localStorage.setItem(KEY, JSON.stringify({ version: 1, leaks: [{ id: 'other', found: '2026-11-05', location: 'Written by another tab', cause: '', repaired: '', field: null, distance: null, frequency: null, notes: '' }], checks: [], company: { repair: null, tolerance: null } }));
    set(t, '[data-leak="log"][data-field="found"]', '2026-11-06'); set(t, '[data-leak="log"][data-field="location"]', 'Mine'); click(t, '#leakAdd');
    assert.deepEqual(JSON.parse(t.w.localStorage.getItem(KEY)).leaks.map(l => l.location).sort(), ['Mine', 'Written by another tab'], 'the other tab’s entry survives');
    assert.deepEqual(t.errors, []); t.close();
  });

  await check('When the browser will not store the notebook the screen says so and keeps entries for the session; a failed clear is reported', async () => {
    const blocked = boot({ failWrites: true }); await flush(); await goto(blocked, 'leakage');
    set(blocked, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(blocked, '[data-leak="log"][data-field="location"]', 'Pole 1'); click(blocked, '#leakAdd');
    assert.match(blocked.d.getElementById('leak-log-note').textContent, /would not save it.*until you close the page/);
    assert.match(words(blocked.d.getElementById('leakList')), /Pole 1/);
    const real = blocked.w.Storage.prototype.removeItem;
    blocked.w.Storage.prototype.removeItem = function () { throw new blocked.w.DOMException('blocked', 'SecurityError'); };
    blocked.d.getElementById('leakClear').click();
    assert.match(blocked.d.getElementById('leak-log-note').textContent, /would not remove the saved data/);
    blocked.w.Storage.prototype.removeItem = real;
    assert.deepEqual(blocked.errors, []); blocked.close();
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal(h.ev('typeof Leakage'), 'object'); assert.equal(h.ev('typeof LeakageUI'), 'object');
    assert.equal((html.match(/const Leakage=\(\(\)=>/g) || []).length, 1);
    assert.equal(h.json('NightSweep.selfCheck.ok'), true);
    assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 leakage: ${cases.length} checks passed (${comparisons} comparisons with the independent references)`);
  fs.writeFileSync('qa/build3-leakage-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App output against research/build3/leakage-reference.json (Python decimal, 50 digits); JSDOM rendering, device-local notebook and job format. Synthetic readings only.' }, null, 2) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
