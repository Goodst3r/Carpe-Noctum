/* Build 3 DOCSIS health card (build list item 5): app output against independent 50-digit
   decimal references, then the rendered card, registry rows, device-local company windows and
   the saved-job format. Synthetic readings only. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const reference = JSON.parse(fs.readFileSync('research/build3/docsis-health-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const KEY = 'nightsweep-docsis-windows-v1';
const cases = [];
let comparisons = 0;

function boot({ seed = null, failWrites = false } = {}) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {}; w.structuredClone = structuredClone;
    w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
    w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
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
const call = (h, id, input) => h.json(`DocsisHealth.evaluate(${JSON.stringify(id)},${JSON.stringify(input)})`);
function set(h, selector, value, type = 'input') { const el = h.d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new h.w.Event(type, { bubbles: true })); return el; }
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const result = (h, id) => words(h.d.getElementById('health-' + id + '-result'));
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };

(async () => {
  const h = boot();
  await flush();

  await check('The requirements are the printed values: -15 to +15 SC-QAM, -9 to +21 per 24 MHz, below 40 and 33 total, Pmax 65', () => {
    assert.deepEqual(h.json('DocsisHealth.SCQAM_RANGE'), { low: -15, high: 15 });
    assert.deepEqual(h.json('DocsisHealth.OFDM_PER6'), { low: -15, high: 15 });
    assert.deepEqual(h.json('DocsisHealth.OFDM_PER24'), { low: -9, high: 21 });
    assert.deepEqual(h.json('DocsisHealth.TOTAL_LIMIT'), { '3.1': 40, '3.0': 33 });
    assert.equal(h.ev('DocsisHealth.PMAX_MIN'), 65);
    close(10 * Math.log10(4) - 6, reference.ofdm_per24_vs_per6_difference_dB, 'per-24 vs per-6 rounding difference (dB)');
  });

  await check('Downstream SC-QAM status and margin match the independent references, edges inclusive', () => {
    for (const c of reference.cases.scqam) {
      const r = call(h, 'scqam', c.input);
      assert.equal(r.ok, true); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      close(r.margin, c.expected.margin, 'scqam margin ' + c.input.level); close(r.low, c.expected.low, 'low'); close(r.high, c.expected.high, 'high');
    }
  });

  await check('OFDM range, status, margin and per-6 MHz restatement match the references for 6, 24 and other bandwidths', () => {
    for (const c of reference.cases.ofdm) {
      const r = call(h, 'ofdm', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      for (const k of ['margin', 'low', 'high', 'per6', 'compare']) close(r[k], c.expected[k], `ofdm ${JSON.stringify(c.input)} ${k}`);
      assert.equal(r.width, c.expected.width);
    }
  });

  await check('Derived OFDM edges for all 29 supported widths match the reference, rounded inward to 0.01 dB so the printed range is the range used', () => {
    for (const e of reference.cases.ofdm_edges) {
      const r = call(h, 'ofdm', { power: '0', basis: 'other', occupied: String(e.occupied) });
      assert.equal(r.ok, true, 'width ' + e.occupied);
      close(r.low, e.low, `low edge ${e.occupied} MHz`, 1e-12); close(r.high, e.high, `high edge ${e.occupied} MHz`, 1e-12);
      assert.equal(Number(r.low.toFixed(2)), r.low, 'shown to 0.01 dB'); assert.equal(Number(r.high.toFixed(2)), r.high);
    }
    const typedEdge = call(h, 'ofdm', { power: String(call(h, 'ofdm', { power: '0', basis: 'other', occupied: '96' }).low), basis: 'other', occupied: '96' });
    assert.equal(typedEdge.status, 'inside', 'typing the printed edge is inside');
  });

  await check('Total input power is strictly below 40 dBmV (3.1) or 33 dBmV (3.0 only); upstream headroom is Pmax minus the reading', () => {
    for (const c of reference.cases.total) {
      const r = call(h, 'total', c.input);
      assert.equal(r.ok, true); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      close(r.margin, c.expected.margin, 'total margin'); close(r.limit, c.expected.limit, 'limit');
    }
    for (const c of reference.cases.upstream) {
      const r = call(h, 'upstream', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      close(r.headroom, c.expected.headroom, 'headroom'); close(r.pmax, c.expected.pmax, 'pmax'); close(r.margin, c.expected.margin, 'upstream margin');
      assert.equal(r.specBasis, c.specBasis !== false, 'only a 3.1 modem on a 3.1 CMTS uses the specification Pmax');
    }
  });

  await check('Company windows: unknown when blank, one-sided and two-sided windows match the references', () => {
    for (const c of reference.cases.window) {
      const w = h.json(`DocsisHealth.parseWindow(${JSON.stringify(c.min)},${JSON.stringify(c.max)})`);
      assert.equal(w.ok, true);
      const r = h.json(`DocsisHealth.againstWindow(${Number(c.reading)},${JSON.stringify({ min: w.min, max: w.max })})`);
      assert.equal(r.status, c.expected.status, JSON.stringify(c));
      if (c.expected.margin !== undefined) close(r.margin, c.expected.margin, 'window margin');
    }
    assert.equal(h.json('DocsisHealth.parseWindow("5","1")').ok, false, 'minimum above maximum is refused');
    assert.equal(h.json('DocsisHealth.parseWindow("abc","")').ok, false);
    assert.equal(h.json('DocsisHealth.parseWindow("","999")').ok, false);
    assert.deepEqual(h.json('DocsisHealth.parseWindow("","")'), { ok: true, min: null, max: null });
    assert.equal(h.json('DocsisHealth.againstWindow(0,{min:null,max:null})').status, 'unknown', 'blank is unknown, never zero');
  });

  await check('Invalid or missing input gives a reason and no number', () => {
    for (const c of reference.cases.errors) {
      const r = call(h, c.id, c.input);
      assert.equal(r.ok, false, JSON.stringify(c)); assert(typeof r.error === 'string' && r.error.length > 10, JSON.stringify(c));
      for (const k of ['status', 'margin', 'headroom', 'low', 'high']) assert.equal(r[k], undefined, `${JSON.stringify(c)} must not return ${k}`);
    }
    assert.equal(call(h, 'nothing', {}).ok, false);
  });

  await check('The DOCSIS health tab sits under Test after Limits and its panel shows only there', async () => {
    await goto(h, 'projects');
    assert.equal(h.d.getElementById('docsisHealthPanel').hidden, true);
    await goto(h, 'docsisHealth');
    const tabs = [...h.d.querySelectorAll('#taskTabs button')].map(b => b.textContent.trim());
    assert.deepEqual(tabs.slice(-6, -3), ['Calculators', 'Limits', 'DOCSIS health']);
    assert.equal(h.d.getElementById('docsisHealthPanel').hidden, false);
    assert.equal(h.d.getElementById('calculatorPanel').hidden, true);
    assert.match(h.d.getElementById('screenTitle').textContent, /Check DOCSIS levels/);
    assert.equal(h.d.querySelectorAll('#docsisHealthPanel .health-card').length, 4);
    assert.equal(h.d.querySelectorAll('#docsisHealthPanel [inputmode]').length, 0, 'no decimal keypad: the iPhone one has no minus key and these levels are often negative');
  });

  await check('The card shows the spec range, a status in words, and an unknown company window until one is entered', async () => {
    set(h, '[data-health="scqam"][data-field="level"]', '16');
    let text = result(h, 'scqam');
    assert.match(text, /−15 to \+15 dBmV per 6 MHz/); assert.match(text, /1\.0 dB above the spec range/); assert.match(text, /Unknown — not entered/);
    set(h, '[data-health="scqam"][data-field="level"]', '3.2');
    text = result(h, 'scqam');
    assert.match(text, /Inside the spec range, 11\.8 dB from the upper edge/);
    set(h, '[data-health="ofdm"][data-field="power"]', '-8');
    assert.match(result(h, 'ofdm'), /Choose how the OFDM power was measured/, 'no silent default for what the OFDM power was measured over');
    set(h, '[data-health="ofdm"][data-field="basis"]', '24', 'change');
    assert.match(result(h, 'ofdm'), /over 24 MHz.*−9 to \+21 dBmV.*Inside the spec range, 1\.0 dB from the lower edge/);
    set(h, '[data-health="ofdm"][data-field="basis"]', 'other', 'change');
    assert.equal(h.d.querySelector('[data-health-other]').hidden, false, 'occupied bandwidth field appears');
    assert.match(result(h, 'ofdm'), /whole number of 6 MHz channels/);
    set(h, '[data-health="ofdm"][data-field="occupied"]', '96');
    assert.match(result(h, 'ofdm'), /Derived range, over 96 MHz.*−2\.97 to \+27\.02 dBmV.*below the derived range/);
    assert.equal(h.d.querySelector('#health-ofdm-result [data-threshold="docsis.ds.ofdm.range"]'), null, 'a derived range carries no Spec tag');
    assert.equal(h.d.querySelector('#health-ofdm-result [data-threshold="docsis.ds.ofdm.scaling"]').dataset.label, 'expert');
    set(h, '[data-health="ofdm"][data-field="basis"]', '6', 'change');
    assert.equal(h.d.querySelector('[data-health-other]').hidden, true);
    set(h, '[data-health="total"][data-field="total"]', '36');
    assert.match(result(h, 'total'), /Choose the modem generation first/, 'no silent default modem generation');
    set(h, '[data-health="total"][data-field="modem"]', '3.1', 'change');
    assert.match(result(h, 'total'), /DOCSIS 3\.1.*below 40.*4\.0 dB below the 40 dBmV limit/);
    set(h, '[data-health="total"][data-field="modem"]', '3.0', 'change');
    assert.match(result(h, 'total'), /DOCSIS 3\.0 only.*below 33.*At or above the 33 dBmV limit \(3\.0 dB over\)/);
    set(h, '[data-health="upstream"][data-field="total"]', '52');
    assert.match(result(h, 'upstream'), /Choose how the modem is working first/);
    set(h, '[data-health="upstream"][data-field="mode"]', '3.1', 'change');
    assert.match(result(h, 'upstream'), /DOCSIS 3\.1 on a 3\.1 CMTS.*65 dBmV, the minimum.*13\.0 dB of headroom below Pmax/);
    set(h, '[data-health="upstream"][data-field="pmax"]', '64');
    assert.match(result(h, 'upstream'), /cannot be below 65 dBmV/);
    set(h, '[data-health="upstream"][data-field="pmax"]', '68');
    assert.match(result(h, 'upstream'), /68 dBmV.*16\.0 dB of headroom/);
    assert.doesNotMatch(result(h, 'upstream'), /the minimum/);
    set(h, '[data-health="upstream"][data-field="mode"]', 'other', 'change'); set(h, '[data-health="upstream"][data-field="pmax"]', '57');
    assert.match(result(h, 'upstream'), /Modem maximum \(your entry; not from this specification\).*57 dBmV.*5\.0 dB of headroom/);
    assert.equal(h.d.querySelector('#health-upstream-result [data-threshold="docsis.us.pmax.capability"]'), null, 'no spec tag on a figure the specification does not give');
    set(h, '[data-health="upstream"][data-field="pmax"]', '');
    assert.match(result(h, 'upstream'), /no figure for a DOCSIS 3\.0 modem/);
    set(h, '[data-health="upstream"][data-field="mode"]', '3.1', 'change');
    assert.match(result(h, 'upstream'), /65 dBmV, the minimum/);
    set(h, '[data-health="scqam"][data-field="level"]', '15.004');
    assert.match(result(h, 'scqam'), /less than 0\.01 dB above the spec range/, 'a margin that rounds to zero is not shown as 0.00 dB');
    set(h, '[data-health="scqam"][data-field="level"]', '3.2');
  });

  await check('Window writes keep what another tab saved, and a failed clear is reported', async () => {
    const t = boot(); await flush(); await goto(t, 'docsisHealth');
    t.w.localStorage.setItem(KEY, JSON.stringify({ version: 1, windows: { scqam: { min: null, max: null }, ofdm: { min: -11, max: 11 }, total: { min: null, max: null }, upstream: { min: null, max: null } } }));
    set(t, '[data-health-window="scqam"][data-field="max"]', '8', 'change');
    const stored = JSON.parse(t.w.localStorage.getItem(KEY)).windows;
    assert.deepEqual(stored.ofdm, { min: -11, max: 11 }, 'the other window written meanwhile survives'); assert.deepEqual(stored.scqam, { min: null, max: 8 });
    const real = t.w.Storage.prototype.removeItem;
    t.w.Storage.prototype.removeItem = function () { throw new t.w.DOMException('blocked', 'SecurityError'); };
    t.d.getElementById('healthClear').click();
    assert.match(t.d.getElementById('healthNote').textContent, /would not remove the saved windows/);
    t.w.Storage.prototype.removeItem = real;
    t.d.getElementById('healthClear').click();
    assert.match(t.d.getElementById('healthNote').textContent, /cleared on this device/);
    assert.deepEqual(t.errors, []); t.close();
  });

  await check('Every spec figure carries a registry tag, the derived OFDM range is labeled Expert, and every tag resolves to one registry row', () => {
    const panel = h.d.getElementById('docsisHealthPanel');
    const tags = [...panel.querySelectorAll('[data-threshold]')];
    assert(tags.length >= 12, 'tags on the card: ' + tags.length);
    for (const t of tags) assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold);
    const ids = new Set(tags.map(t => t.dataset.threshold));
    for (const id of ['docsis.ds.scqam.range', 'docsis.ds.ofdm.range', 'docsis.ds.total30.limit', 'docsis.us.pmax.capability', 'company.docsis.scqam', 'company.docsis.ofdm', 'company.docsis.total', 'company.docsis.upstream']) assert(ids.has(id), 'tag for ' + id);
    set(h, '[data-health="ofdm"][data-field="basis"]', 'other', 'change'); set(h, '[data-health="ofdm"][data-field="occupied"]', '48');
    const scaling = panel.querySelector('[data-threshold="docsis.ds.ofdm.scaling"]');
    assert(scaling && scaling.dataset.label === 'expert', 'derived range tagged Expert');
    set(h, '[data-health="ofdm"][data-field="basis"]', '6', 'change');
  });

  await check('Registry rows: spec rows are primary-checked, company rows start unknown and are entered values, nothing is plant-specific', () => {
    const rows = h.json('Thresholds.rows');
    const mine = rows.filter(r => /^(docsis\.|company\.docsis\.)/.test(r.id));
    assert.equal(mine.length, 10);
    for (const r of mine) { assert.equal(r.scope, 'all', r.id); assert(r.usedBy.includes('DOCSIS health'), r.id); }
    for (const r of mine.filter(r => r.id.startsWith('docsis.') && r.label === 'spec')) assert.equal(r.verification, 'primary', r.id);
    assert.equal(mine.find(r => r.id === 'docsis.ds.ofdm.scaling').label, 'expert');
    assert.equal(mine.find(r => r.id === 'docsis.ds.ofdm.scaling').verification, 'derived');
    for (const r of mine.filter(r => r.label === 'company')) { assert.equal(r.verification, 'entered'); assert.equal(r.store, 'docsis'); assert.equal(r.value, undefined, 'no built-in company value'); }
    assert(mine.every(r => !/31 dBmV|43 dBmV|38 dBmV/.test(JSON.stringify(r))), 'the 31/43/38 company values are not used here');
    assert(h.json('Thresholds.resolve("company.docsis.total")').text === 'Unknown — not entered' || h.ev('Thresholds.display("company.docsis.total")') === 'Unknown — not entered');
  });

  await check('Company windows save on this device, show in the result and in Limits, and clear again', async () => {
    set(h, '[data-health-window="scqam"][data-field="min"]', '-7'); set(h, '[data-health-window="scqam"][data-field="max"]', '7', 'change');
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).windows.scqam, { min: -7, max: 7 });
    assert.match(h.d.getElementById('health-scqam-window-note').textContent, /Saved on this device/);
    set(h, '[data-health="scqam"][data-field="level"]', '3.2');
    assert.match(result(h, 'scqam'), /−7 to \+7 dBmV.*Inside your window, 3\.8 dB from the nearest edge/);
    set(h, '[data-health="scqam"][data-field="level"]', '9');
    assert.match(result(h, 'scqam'), /2\.0 dB above your window/);
    set(h, '[data-health-window="ofdm"][data-field="min"]', '-10', 'change');
    set(h, '[data-health="ofdm"][data-field="power"]', '-12');
    assert.match(result(h, 'ofdm'), /at least −10 dBmV per 6 MHz.*2\.0 dB below your window/);
    set(h, '[data-health-window="total"][data-field="min"]', '9', 'change'); set(h, '[data-health-window="total"][data-field="max"]', '3', 'change');
    assert.match(h.d.getElementById('health-total-window-note').textContent, /Not saved\. .*lowest level is above the highest.*Still using at least \+9 dBmV/);
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).windows.total, { min: 9, max: null }, 'a rejected window leaves the last saved one');
    await goto(h, 'limits');
    const list = words(h.d.getElementById('limitsList'));
    assert.match(list, /Your window, downstream SC-QAM level −7 to \+7 dBmV/);
    assert.match(list, /Your window, total downstream input power at least \+9 dBmV/);
    assert.match(list, /Your window, total upstream transmit power Unknown — not entered/);
    assert.match(list, /Your window, downstream OFDM level at least −10 dBmV per 6 MHz/, 'the OFDM window shows its unit');
    assert.match(list, /Maximum total transmit power \(Pmax\) a DOCSIS 3.1 modem must support at least 65 dBmV/);
    assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
    await goto(h, 'docsisHealth');
    h.d.getElementById('healthClear').click();
    assert.equal(h.w.localStorage.getItem(KEY), null);
    assert.match(result(h, 'scqam'), /Unknown — not entered/);
    assert.equal(h.d.querySelector('[data-health-window="scqam"][data-field="min"]').value, '');
  });

  await check('The card never touches the saved job: the exported project and the other storage keys are unchanged', async () => {
    const before = JSON.stringify(h.json('evidenceExportProject(state)'));
    const keysBefore = Object.keys(h.w.localStorage).filter(k => k !== KEY).sort();
    await goto(h, 'docsisHealth');
    set(h, '[data-health="scqam"][data-field="level"]', '1'); set(h, '[data-health="total"][data-field="total"]', '30');
    set(h, '[data-health-window="scqam"][data-field="min"]', '-3', 'change');
    const after = JSON.stringify(h.json('evidenceExportProject(state)'));
    assert.equal(after, before, 'job export identical');
    assert.deepEqual(Object.keys(h.w.localStorage).filter(k => k !== KEY).sort(), keysBefore, 'no other key changed');
    assert(Object.keys(h.w.localStorage).includes(KEY), 'only the new device-local key was added');
    assert(!('docsisHealth' in h.json('state')) && !('docsis' in h.json('state')), 'no new job field');
    h.d.getElementById('healthClear').click();
  });

  await check('Stored windows are read back, and corrupt or out-of-range stored data is ignored without an error', async () => {
    const good = boot({ seed: JSON.stringify({ version: 1, windows: { scqam: { min: -6, max: 6 }, ofdm: { min: null, max: 4 }, total: { min: 1, max: 99 }, upstream: { min: 'x', max: 50 }, bogus: { min: 1, max: 2 } } }) });
    await flush();
    assert.deepEqual(good.json('DocsisHealth.getWindow("scqam")'), { min: -6, max: 6 });
    assert.deepEqual(good.json('DocsisHealth.getWindow("ofdm")'), { min: null, max: 4 });
    assert.deepEqual(good.json('DocsisHealth.getWindow("total")'), { min: 1, max: 99 }, 'in range, kept');
    assert.deepEqual(good.json('DocsisHealth.getWindow("upstream")'), { min: null, max: null }, 'a non-number entry is dropped');
    assert.deepEqual(good.errors, []); good.close();
    for (const seed of ['{not json', JSON.stringify({ version: 2, windows: {} }), JSON.stringify({ version: 1, windows: null }), JSON.stringify([1, 2]), '""']) {
      const bad = boot({ seed }); await flush();
      assert.deepEqual(bad.json('DocsisHealth.getWindow("scqam")'), { min: null, max: null }, seed);
      await goto(bad, 'docsisHealth');
      assert.match(words(bad.d.getElementById('health-scqam-result')), /Enter a reading/, 'card still renders');
      assert.deepEqual(bad.errors, [], 'no script error for ' + seed); bad.close();
    }
  });

  await check('When the browser will not store the windows the card says so and keeps them for the session', async () => {
    const blocked = boot({ failWrites: true }); await flush(); await goto(blocked, 'docsisHealth');
    set(blocked, '[data-health-window="scqam"][data-field="min"]', '-5', 'change');
    assert.match(blocked.d.getElementById('health-scqam-window-note').textContent, /would not save it.*until you close the page/);
    set(blocked, '[data-health="scqam"][data-field="level"]', '-6');
    assert.match(result(blocked, 'scqam'), /1\.0 dB below your window/);
    assert.deepEqual(blocked.errors, []); blocked.close();
  });

  await check('A very long run of digits is refused quickly instead of being scanned many times (the number pattern reads each string one way)', () => {
    const started = Date.now();
    for (const text of ['1'.repeat(5000) + 'x', '1'.repeat(60), '-'.repeat(40) + '1', '1.' + '1'.repeat(70)]) {
      const r = h.json(`DocsisHealth.scqam({level:${JSON.stringify(text)}})`);
      assert.equal(r.ok, false, text.slice(0, 20)); assert(r.error);
    }
    assert(Date.now() - started < 250, 'refused quickly');
    assert.equal(h.json('DocsisHealth.scqam({level:"-7.3"})').ok, true);
  });

  await check('The module is bundled once, loads without script errors, and the built-in self-check still passes', () => {
    assert.equal(h.ev('typeof DocsisHealth'), 'object'); assert.equal(h.ev('typeof DocsisHealthUI'), 'object');
    assert.equal((html.match(/const DocsisHealth=\(\(\)=>/g) || []).length, 1);
    assert.equal(h.json('NightSweep.selfCheck.ok'), true, 'built-in reference cases pass in the bundle that contains the module');
    assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 DOCSIS health: ${cases.length} checks passed (${comparisons} comparisons with the independent references)`);
  fs.writeFileSync('qa/build3-docsis-health-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App output against the independent reference built by docsis-health-reference.py in research/build3 (Python decimal, 50 digits); JSDOM rendering, device-local windows and job format. Synthetic readings only.' }, null, 2) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
