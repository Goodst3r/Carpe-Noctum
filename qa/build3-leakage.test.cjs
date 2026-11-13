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
let comparisons = 0, downloads = [], confirmAnswer = true;

function boot({ seed = null, failWrites = false } = {}) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => confirmAnswer; w.print = () => {}; w.structuredClone = structuredClone;
    w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
    w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
    w.NightSweepAndroid = { saveFile: (name, text, mime) => downloads.push({ name, text, mime }), saveBinary() {}, printReport() {} };
    if (seed !== null) w.localStorage.setItem(KEY, seed);
    if (failWrites) {
      w.__failWrites = true;
      const real = w.Storage.prototype.setItem;
      w.Storage.prototype.setItem = function (k, v) { if (k === KEY && w.__failWrites) throw new w.DOMException('quota', 'QuotaExceededError'); return real.call(this, k, v); };
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

  await check('Limit check: restated level, status at the limit itself, dB over, the CLI status (3 m, 108–137 MHz band) and the near-field edge match the references', () => {
    for (const c of reference.cases.limit) {
      const r = call(h, 'checkLimit', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.status, c.expected.status, JSON.stringify(c.input));
      for (const k of ['limit', 'ruleDistance', 'atRule', 'ratioDb', 'metres']) close(r[k], c.expected[k], `limit ${JSON.stringify(c.input)} ${k}`);
      assert.equal(r.converted, c.expected.converted, 'converted ' + JSON.stringify(c.input));
      assert.equal(r.cliStatus, c.expected.cliStatus, 'CLI status ' + JSON.stringify(c.input)); assert.equal(r.inNearField, c.expected.inNearField, 'near field ' + JSON.stringify(c.input));
      close(r.at3, c.expected.at3, 'at 3 m ' + JSON.stringify(c.input)); close(r.nearFieldM, c.expected.nearFieldM, 'near-field edge ' + JSON.stringify(c.input));
    }
    for (const c of reference.cases.cliStatus) {
      const s = h.ev(`Leakage.cliStatus(${JSON.stringify({ frequency: c.input.frequency === null ? null : Number(c.input.frequency), field: c.input.field === null ? null : Number(c.input.field), distance: c.input.distance === null ? null : Number(c.input.distance) })})`);
      assert.equal(s, c.expected, JSON.stringify(c.input)); comparisons++;
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

  await check('The Leakage screen sits in Field; its panel shows only there and the page has the five cards', async () => {
    await goto(h, 'projects');
    assert.equal(h.d.getElementById('leakagePanel').hidden, true);
    await goto(h, 'leakage');
    const tabs = [...h.d.querySelectorAll('#taskTabs button')].map(b => b.textContent.trim());
    assert.deepEqual(tabs, ['Meter setup', 'Station', 'Readings', 'TDR', 'ONX files', 'Leakage', 'Checklists', 'Night log']);
    assert.equal(h.d.querySelector('#screenTitle .eyebrow').textContent, 'Field');
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
    assert.match(result(h, 'limit'), /Over the limit/, '20 µV/m at 10 ft is 20.32 µV/m at 3 m');
    set(h, '[data-leak="limit"][data-field="field"]', '19');
    assert.match(result(h, 'limit'), /At or below the limit after restating by distance \(approximate\)/);
    assert(h.d.querySelector('#leak-limit-result .health-status').classList.contains('neutral') && !h.d.querySelector('#leak-limit-result .health-status.ok'), 'a restated reading gets no green check');
    set(h, '[data-leak="limit"][data-field="distance"]', '3'); set(h, '[data-leak="limit"][data-field="unit"]', 'm', 'change');
    assert(h.d.querySelector('#leak-limit-result .health-status').classList.contains('ok'), 'a reading taken at the rule distance gets the check mark');
    set(h, '[data-leak="limit"][data-field="field"]', '80');
    assert.match(result(h, 'limit'), /This leak is 50 µV\/m or more at 3 m on the 108–137 MHz basis, so it counts in the CLI/);
    set(h, '[data-leak="limit"][data-field="distance"]', '10');
    assert.match(result(h, 'limit'), /It would count in the CLI if it were measured 3 m from the leak on the 108–137 MHz basis/);
    set(h, '[data-leak="limit"][data-field="frequency"]', '750'); set(h, '[data-leak="limit"][data-field="distance"]', '3');
    assert.match(result(h, 'limit'), /CLI uses readings in the 108–137 MHz band, or corrected to it.*do not add it to the CLI card as it is/); assert.doesNotMatch(result(h, 'limit'), /so it counts in the CLI/);
    set(h, '[data-leak="limit"][data-field="frequency"]', '10'); set(h, '[data-leak="limit"][data-field="distance"]', '3'); set(h, '[data-leak="limit"][data-field="field"]', '10');
    assert.match(result(h, 'limit'), /At 10 MHz the near field reaches about 4\.8 m from the leak/);
    set(h, '[data-leak="limit"][data-field="frequency"]', '121.2625'); set(h, '[data-leak="limit"][data-field="field"]', '20'); set(h, '[data-leak="limit"][data-field="distance"]', '10'); set(h, '[data-leak="limit"][data-field="unit"]', 'ft', 'change');
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
    assert.match(result(h, 'normalize'), /At 3 m 133\.3 µV\/m/); assert.match(result(h, 'normalize'), /counts in the CLI only if it was measured in the 108–137 MHz band, or corrected to it/);
    set(h, '[data-leak="normalize"][data-field="distance"]', '1');
    assert.match(result(h, 'normalize'), /Closer than 3 m/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '100, 60, 50'); set(h, '[data-leak="cli"][data-field="theta"]', '0.8');
    let text = result(h, 'cli');
    assert.match(text, /Leaks counted \(50 µV\/m or more\) 3 of 3 entered/); assert.match(text, /Index, 10·log10\(I\).*43\.04 dB/); assert.match(text, /21\.0 dB at or below the printed value of 64/);
    set(h, '[data-leak="cli"][data-field="theta"]', '0.5');
    assert.match(result(h, 'cli'), /Estimate only: less than 75% of the plant examined/);
    assert(h.d.querySelector('#leak-cli-result .health-status').classList.contains('neutral') && !h.d.querySelector('#leak-cli-result .health-status.ok'), 'an estimate from under 75% gets no green check');
    set(h, '[data-leak="cli"][data-field="theta"]', '0.74995');
    assert.match(result(h, 'cli'), /Fraction examined (?:Spec )?0\.74995/, 'the fraction is not rounded up to 0.75 beside the warning');
    set(h, '[data-leak="cli"][data-field="theta"]', '0.0005');
    assert.match(result(h, 'cli'), /from 0\.001 up to 1/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '100,60,50'); set(h, '[data-leak="cli"][data-field="theta"]', '0.8');
    assert.match(result(h, 'cli'), /“100,60,50” has a comma with no space after it/);
    set(h, '[data-leak="cli"][data-field="leaks"]', '100, 60, 50');
    set(h, '[data-leak="cli"][data-field="tested"]', '8'); set(h, '[data-leak="cli"][data-field="total"]', '10');
    assert.match(result(h, 'cli'), /not both/);
    set(h, '[data-leak="cli"][data-field="tested"]', ''); set(h, '[data-leak="cli"][data-field="total"]', '');
    set(h, '[data-leak="cli"][data-field="leaks"]', '100, 60, 50');
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
    assert.equal(rows.length, 12);
    for (const r of rows) { assert.equal(r.scope, 'all', r.id); assert(r.usedBy.includes('Leakage'), r.id); }
    for (const id of ['leak.fcc.analog.near', 'leak.fcc.digital.near', 'leak.fcc.analog.far', 'leak.fcc.digital.far', 'leak.cli.formula', 'leak.cli.limit', 'leak.log.fields']) {
      const r = rows.find(x => x.id === id); assert.equal(r.label, 'spec', id); assert.equal(r.verification, 'primary', id);
    }
    assert.equal(rows.find(r => r.id === 'leak.normalize.distance').label, 'expert'); assert.equal(rows.find(r => r.id === 'leak.normalize.distance').verification, 'secondary');
    assert.equal(rows.find(r => r.id === 'leak.detector.methods').verification, 'secondary');
    const aero = rows.find(r => r.id === 'leak.fcc.aero.repair');
    assert.equal(aero.label, 'spec'); assert.equal(aero.verification, 'secondary', 'read on the Cornell copy of the eCFR');
    assert.match(aero.rangeText, /20 µV\/m or more at 3 m/); assert.match(aero.source, /76\.614/); assert.match(aero.conditions, /every three months/); assert.match(aero.conditions, /does nothing with it/);
    for (const id of ['leak.fcc.analog.near', 'leak.fcc.digital.near', 'leak.fcc.analog.far', 'leak.fcc.digital.far', 'company.leak.repair']) assert.doesNotMatch(JSON.stringify(rows.find(r => r.id === id)), /many operators repair sooner|ceiling, not a repair target/, id + ' carries no unsourced claim');
    for (const id of ['leak.fcc.analog.near', 'leak.fcc.digital.near', 'leak.fcc.analog.far', 'leak.fcc.digital.far']) assert.match(rows.find(r => r.id === id).conditions, /§ 76\.614/, id);
    const norm = rows.find(r => r.id === 'leak.normalize.distance');
    assert.match(norm.source, /SCTE 221 2020 \(R2026\)/); assert.match(norm.revision, /SCTE 293-12 2025.*catalog summary only/); assert.doesNotMatch(norm.source, /293-12/, 'the far-field statement is not credited to a document that was not read');
    assert.doesNotMatch(norm.conditions, /30 m in the lower and upper bands\) under § 76\.609\(h\)/, '30 m is not credited to § 76.609(h)');
    assert.match(norm.conditions, /about 0\.4 m at 121 MHz and 4\.8 m at 10 MHz/);
    const logRow = rows.find(r => r.id === 'leak.log.fields');
    assert.match(logRow.rangeText, /5 years for some small systems/); assert.match(logRow.conditions, /§ 76\.601\(d\).*five years/);
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
    assert.match(words(h.d.getElementById('leakList')), /1 in the log · 1 open/); assert.match(words(h.d.getElementById('leakList')), /Pole 14 at Elm and 3rd.*Found 2026-11-10.*Open.*Loose drop connector.*80 µV\/m at 10 m → 266\.7 µV\/m at 3 m · 121\.2625 MHz · restated to 3 m it is 50 µV\/m or more; it would count in the CLI on the 108–137 MHz basis/);
    set(h, '[data-leak="log"][data-field="found"]', '2026-11-09'); set(h, '[data-leak="log"][data-field="location"]', 'Tap 7, Oak Street'); set(h, '[data-leak="log"][data-field="repaired"]', '2026-11-08'); click(h, '#leakAdd');
    assert.match(h.d.getElementById('leak-log-note').textContent, /repair date is before the date found/);
    const stored = JSON.parse(h.w.localStorage.getItem(KEY));
    assert.equal(stored.version, 1); assert.equal(stored.leaks.length, 1);
    assert.deepEqual(Object.keys(stored.leaks[0]).sort(), ['cause', 'distance', 'field', 'found', 'frequency', 'id', 'location', 'notes', 'repaired']);
    const id = stored.leaks[0].id;
    set(h, `[data-leak-repair="${id}"]`, '2026-11-12'); click(h, `[data-leak-mark="${id}"]`);
    assert.match(words(h.d.getElementById('leakList')), /Repaired 2026-11-12/); assert.match(words(h.d.getElementById('leakList')), /1 in the log · 0 open/);
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).leaks[0].repaired, '2026-11-12');
    click(h, `[data-leak-reopen="${id}"]`);
    assert.match(words(h.d.getElementById('leakList')), /1 in the log · 1 open/); assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).leaks[0].repaired, '', 'a mistaken Mark repaired can be undone');
    for (const sel of [`[data-leak-repair="${id}"]`, `[data-leak-mark="${id}"]`, `[data-leak-delete="${id}"]`]) assert.match(h.d.querySelector(sel).getAttribute('aria-label'), /Pole 14 at Elm and 3rd/, sel + ' names its leak');
    assert.match(h.d.querySelector(`[data-leak-repair="${id}"]`).value, /^\d{4}-\d{2}-\d{2}$/, 'the repair date is prefilled, not applied silently');
    set(h, `[data-leak-repair="${id}"]`, '2026-11-12'); click(h, `[data-leak-mark="${id}"]`);
    // validation through the API
    for (const bad of [{ found: '2026-02-30', location: 'x' }, { found: 'yesterday', location: 'x' }, { found: '2026-11-10', location: 'x', field: '-4' }, { found: '2026-11-10', location: 'x', distance: '0' }, { found: '2026-11-10', location: 'x', frequency: '99999' }, { found: '1999-01-01', location: 'x' }]) {
      assert.equal(h.json(`Leakage.validateLeak(${JSON.stringify(bad)})`).ok, false, JSON.stringify(bad));
    }
    assert.equal(h.json('Leakage.validateLeak({found:"2026-11-10",location:"  Pole\\u0007 9  \\n at   Elm "})').record.location, 'Pole 9 at Elm', 'control characters and runs of spaces are cleaned');
    confirmAnswer = false; click(h, `[data-leak-delete="${id}"]`); confirmAnswer = true;
    assert.match(words(h.d.getElementById('leakList')), /1 in the log/, 'a cancelled delete keeps the leak');
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
    assert.match(text, /2026-11-11 · Directly connected source.*Expected 20, read 22 µV\/m: \+0\.83 dB · within the ± 1 dB tolerance you had set then/);
    assert.match(h.d.getElementById('leak-detector-note').textContent, /Check saved\. Saved on this device/);
    const stored = JSON.parse(h.w.localStorage.getItem(KEY)); assert.equal(stored.checks[0].tolerance, 1, 'the tolerance in force is kept with the check');
    set(h, '[data-leak-company="tolerance"]', '0.1', 'change');
    assert.match(words(h.d.getElementById('leakChecks')), /within the ± 1 dB tolerance you had set then/, 'changing the tolerance later does not change an old record');
    assert.match(result(h, 'detector'), /dB outside your tolerance/, 'the live card uses the current tolerance');
    const id = stored.checks[0].id;
    confirmAnswer = false; click(h, `[data-leak-delete-check="${id}"]`); confirmAnswer = true;
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).checks.length, 1, 'a cancelled delete keeps the check');
    assert.match(h.d.querySelector(`[data-leak-delete-check="${id}"]`).getAttribute('aria-label'), /2026-11-11/);
    click(h, `[data-leak-delete-check="${id}"]`);
    assert.equal(h.d.getElementById('leakChecks').children.length, 0);
    assert.match(h.d.getElementById('leak-detector-note').textContent, /Check deleted/);
  });

  await check('CSV export carries the 76.1706 fields, guards against spreadsheet formulas and quotes commas', async () => {
    const csv = h.ev(`Leakage.leaksCsv(${JSON.stringify([{ id: 'a', found: '2026-11-10', location: '=HYPERLINK("x")', cause: 'loose, corroded', repaired: '', field: 80, distance: 10, frequency: 121.2625, notes: '@note' }])})`);
    const lines = csv.trim().split('\r\n');
    assert.equal(lines[0], 'Date found,Location,Probable cause,Date repaired,Field strength (uV/m),Distance (m),Frequency (MHz),At 3 m (uV/m),Notes');
    assert.equal(lines[1], '2026-11-10,"\'=HYPERLINK(""x"")","loose, corroded",,80,10,121.2625,266.67,\'@note');
    downloads = [];
    set(h, '[data-leak="log"][data-field="location"]', 'Pole 31'); set(h, '[data-leak="log"][data-field="found"]', '2026-11-10'); click(h, '#leakAdd');
    click(h, '#leakExport');
    assert.equal(downloads.length, 1); assert.equal(downloads[0].name, 'CarpeNoctum_2.0_Alpha_build_4_Leak_Log.csv'); assert.match(downloads[0].text, /Pole 31/);
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

  /* ---- Notebook storage rules, with a Storage that can fail, hold unreadable text or be shared by two tabs ---- */
  const plain = x => JSON.parse(JSON.stringify(x));
  function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return { data, failWrites: false, failReads: false, failRemoves: false,
      getItem(k) { if (this.failReads) throw new Error('blocked'); return data.has(k) ? data.get(k) : null; },
      setItem(k, v) { if (this.failWrites) throw new Error('quota'); data.set(k, String(v)); },
      removeItem(k) { if (this.failRemoves) throw new Error('blocked'); data.delete(k); } };
  }
  const L = h.ev('Leakage'), stored = st => JSON.parse(st.getItem(KEY));
  const leak = (location, extra = {}) => ({ found: '2026-11-10', location, ...extra });

  await check('A change this browser could not store is kept and written with the next change that saves; nothing silently disappears', () => {
    const st = fakeStorage(); L.load(st);
    assert.equal(plain(L.addLeak(leak('one'), st)).saved, true);
    st.failWrites = true;
    const two = plain(L.addLeak(leak('two'), st)), three = plain(L.addLeak(leak('three'), st)), mark = plain(L.setCompany('30', undefined, st));
    assert.deepEqual([two.saved, three.saved, mark.saved], [false, false, false]);
    assert.deepEqual(plain(L.snapshot()).leaks.map(l => l.location), ['one', 'two', 'three']); assert.equal(L.snapshot().company.repair, 30);
    assert.deepEqual(stored(st).leaks.map(l => l.location), ['one'], 'nothing new reached storage');
    st.failWrites = false;
    assert.equal(plain(L.addLeak(leak('four'), st)).saved, true);
    const s = stored(st); assert.deepEqual(s.leaks.map(l => l.location), ['one', 'two', 'three', 'four']); assert.equal(s.company.repair, 30);
  });

  await check('Unreadable stored data is copied aside before the first change replaces it, once; data from a newer version is never overwritten', () => {
    for (const raw of ['{not json', '"text"', '[1]', 'null', JSON.stringify({ version: 'one' }), JSON.stringify({ version: 0, leaks: [] }), JSON.stringify({})]) {
      const st = fakeStorage({ [KEY]: raw });
      assert.equal(L.load(st), 'unreadable', raw); assert.equal(L.status(), 'unreadable');
      const r = plain(L.addLeak(leak('after'), st)); assert.equal(r.ok, true); assert.equal(r.unreadableKept, true);
      assert.equal(st.getItem(L.SIDE_KEY), raw); assert.deepEqual(stored(st).leaks.map(l => l.location), ['after']);
      st.setItem(KEY, raw); L.addLeak(leak('again'), st); assert.equal(st.getItem(L.SIDE_KEY), raw, 'the first copy is never replaced');
    }
    const newer = JSON.stringify({ version: 2, leaks: [{ id: 'z' }], future: true }), st = fakeStorage({ [KEY]: newer });
    assert.equal(L.load(st), 'newer');
    for (const op of [() => L.addLeak(leak('x'), st), () => L.setCompany('5', undefined, st), () => L.addCheck({ date: '2026-11-11', method: 'direct', expected: '20', read: '21' }, st), () => L.removeLeak('z', st)]) {
      const r = plain(op()); assert.equal(r.ok, false); assert.equal(r.error, L.NEWER);
    }
    assert.equal(st.getItem(KEY), newer); assert.equal(st.getItem(L.SIDE_KEY), null);
    assert.equal(L.clearAll(st), true); assert.equal(st.getItem(KEY), null);
  });

  await check('Editing one company setting never changes the other, even when another tab changed it; a blank clears only its own box', () => {
    const st = fakeStorage(); L.load(st);
    L.setCompany('100', '2', st);
    const other = JSON.parse(st.getItem(KEY)); other.company.tolerance = 3; st.setItem(KEY, JSON.stringify(other)); // another tab
    assert.equal(plain(L.setCompany('40', undefined, st)).ok, true);
    assert.deepEqual(plain(stored(st).company), { repair: 40, tolerance: 3 }, 'the tolerance the other tab saved survives');
    L.setCompany(undefined, '', st); assert.deepEqual(plain(stored(st).company), { repair: 40, tolerance: null }, 'blank is unknown, not zero');
    L.setCompany('', undefined, st); assert.deepEqual(plain(stored(st).company), { repair: null, tolerance: null });
    for (const bad of ['0', '-3', '0.001', 'abc', '1e9', '0x10']) assert.equal(plain(L.setCompany(bad, undefined, st)).ok, false, 'repair ' + bad);
    for (const bad of ['-1', '41', 'abc']) assert.equal(plain(L.setCompany(undefined, bad, st)).ok, false, 'tolerance ' + bad);
    assert.equal(plain(L.setCompany('0.01', undefined, st)).ok, true); assert.equal(L.registryValue('repair').text, '0.01 µV/m at 3 m', 'a small value is shown, never as 0');
    L.setCompany('0.5', '0.25', st); assert.equal(L.registryValue('tolerance').text, '0.25 dB');
  });

  await check('Clearing: memory changes only when the browser removed the data, the side copy goes too, and a clear in another tab is respected', () => {
    const st = fakeStorage({ [L.SIDE_KEY]: 'old' }); L.load(st); L.addLeak(leak('x'), st);
    st.failRemoves = true; assert.equal(L.clearAll(st), false); assert.equal(L.snapshot().leaks.length, 1, 'memory unchanged when the removal failed');
    st.failRemoves = false; assert.equal(L.clearAll(st), true); assert.equal(L.snapshot().leaks.length, 0); assert.equal(st.getItem(KEY), null); assert.equal(st.getItem(L.SIDE_KEY), null);
    L.load(st); L.addLeak(leak('before'), st); st.removeItem(KEY); // another tab cleared the notebook
    L.addLeak(leak('after'), st);
    assert.deepEqual(stored(st).leaks.map(l => l.location), ['after'], 'the cleared leak does not come back');
  });

  await check('Stored data is checked entry by entry up to the limits: junk before valid entries does not hide them, and oversized, hostile or odd entries are cut or dropped', () => {
    const junk = Array.from({ length: 700 }, (_, i) => ({ id: 'j' + i, found: 'bad', location: 'x' }));
    const valid = Array.from({ length: 600 }, (_, i) => ({ id: 'v' + i, found: '2026-11-01', location: 'Pole ' + i }));
    const st = fakeStorage({ [KEY]: JSON.stringify({ version: 1, leaks: [...junk, ...valid, { id: '__proto__', found: '2026-11-01', location: 'p' }],
      checks: [{ id: 'c1', date: '2026-11-04', method: 'direct', expected: 20, read: 21, tolerance: 1.5 }, { id: 'c2', date: '2026-11-04', method: 'direct', expected: 20, read: 21, tolerance: 99 }, { id: 'c3', date: '2026-11-04', method: 'direct', expected: 20, read: 21 }],
      company: { repair: 0.001, tolerance: 2 } }) });
    L.load(st); const s = plain(L.snapshot());
    assert.equal(s.leaks.length, 500, 'capped at the log limit, counting only valid entries'); assert.equal(s.leaks[0].id, 'v0');
    assert.deepEqual(s.checks.map(c => [c.id, c.tolerance]), [['c1', 1.5], ['c2', null], ['c3', null]], 'a stored tolerance is kept only when it is in range');
    assert.deepEqual(s.company, { repair: null, tolerance: 2 }, 'a repair threshold under the minimum is dropped');
    const long = plain(L.validateLeak({ found: '2026-11-10', location: 'L'.repeat(900), cause: '😀'.repeat(200), notes: 'n'.repeat(900) })).record;
    assert.deepEqual([long.location.length, Array.from(long.cause).length, long.notes.length], [120, 120, 300]);
  });

  await check('Text cleaning: zero-width, bidi-override and C1 characters are removed, a place made only of them is refused, and CSV cells with a carriage return are quoted', () => {
    for (const empty of ['​', '​​ ', '‮', '\u0085', '­﻿']) assert.equal(plain(L.validateLeak({ found: '2026-11-10', location: empty })).ok, false, JSON.stringify(empty));
    assert.equal(plain(L.validateLeak({ found: '2026-11-10', location: 'Pole​ 9 ‮evil\u0085 end' })).record.location, 'Pole 9 evil end');
    assert.equal(L.csvCell('a\rb'), '"a\rb"'); assert.equal(L.csvCell('a,b'), '"a,b"'); assert.equal(L.csvCell('=1+1'), "'=1+1"); assert.equal(L.csvCell('plain'), 'plain'); assert.equal(L.csvCell(null), '');
  });

  await check('Leak lists: spaces, new lines, semicolons and a comma followed by a space all separate leaks; a bare comma is refused, long input is bounded and fast', () => {
    for (const ok of ['100 60 50', '100, 60, 50', '100\n60\n50', '100;60;50', '100; 60 ;50', '100, 60, 50,', ' 100 ,60 , 50 ']) {
      const r = plain(L.parseLeaks(ok)); if (ok === ' 100 ,60 , 50 ') { assert.equal(r.ok, false, JSON.stringify(ok)); continue; }
      assert.deepEqual(r.values, [100, 60, 50], JSON.stringify(ok));
    }
    for (const bad of ['100,60,50', '1,500', '120,5', '1,5,0']) { const r = plain(L.parseLeaks(bad)); assert.equal(r.ok, false, bad); assert.match(r.error, /comma with no space after it/); }
    const started = Date.now();
    assert.equal(plain(L.parseLeaks('1'.repeat(5000) + 'x')).ok, false); assert.equal(plain(L.parseLeaks('1'.repeat(30))).ok, false); assert.equal(plain(L.parseLeaks('1 '.repeat(10001))).ok, false);
    assert(Date.now() - started < 250, 'long input is refused quickly');
    assert.match(plain(L.cli({ leaks: '100', theta: '0.5', tested: '9', total: '10' })).error, /not both/);
    assert.match(plain(L.cli({ leaks: '100', theta: '0.0009' })).error, /0\.001/); assert.equal(plain(L.cli({ leaks: '100', theta: '0.001' })).ok, true);
    assert.equal(plain(L.normalize({ field: '10', distance: '3280', unit: 'ft' })).ok, true); const far = plain(L.normalize({ field: '10', distance: '3281', unit: 'ft' }));
    assert.equal(far.ok, false); assert.match(far.error, /1,000 m \(3,280 ft\)/);
  });

  await check('Stored markup is shown as text and never run; an oversized or odd store loads without a script error', async () => {
    const bad = '<img src=x onerror=window.pwned=1>';
    const x = boot({ seed: JSON.stringify({ version: 1, leaks: [{ id: 'm1', found: '2026-11-01', location: bad, cause: '<b>bold</b>', repaired: '', field: 60, distance: 3, frequency: 121.2625, notes: '"><script>window.pwned=2</script>' }],
      checks: [], company: { repair: null, tolerance: null } }) });
    await flush(); await goto(x, 'leakage');
    assert.equal(x.d.querySelectorAll('#leakagePanel img, #leakagePanel script, #leakagePanel b').length, 1, 'only the app’s own <b>Open</b>');
    assert.match(words(x.d.getElementById('leakList')), /<img src=x onerror=window\.pwned=1>.*<b>bold<\/b>.*<script>window\.pwned=2<\/script>/);
    assert.equal(x.w.pwned, undefined); assert.deepEqual(x.errors, []); x.close();
  });

  await check('A browser that stops storing partway keeps every entry for the page, says so, and writes them all when storing works again', async () => {
    const b = boot({ failWrites: true }); await flush(); await goto(b, 'leakage');
    const add = o => { for (const [k, v] of Object.entries(o)) set(b, `[data-leak="log"][data-field="${k}"]`, v); click(b, '#leakAdd'); };
    add({ found: '2026-11-10', location: 'Pole 1' }); add({ found: '2026-11-10', location: 'Pole 2' });
    assert.match(b.d.getElementById('leak-log-note').textContent, /would not save it/); assert.match(words(b.d.getElementById('leakList')), /2 in the log.*Pole 1.*Pole 2|2 in the log.*Pole 2.*Pole 1/);
    b.w.__failWrites = false; add({ found: '2026-11-10', location: 'Pole 3' });
    assert.deepEqual(JSON.parse(b.w.localStorage.getItem(KEY)).leaks.map(l => l.location).sort(), ['Pole 1', 'Pole 2', 'Pole 3']); assert.match(b.d.getElementById('leak-log-note').textContent, /Added\. Saved on this device/);
    // a detector check that is not stored says so, as the log does
    b.w.__failWrites = true;
    set(b, '[data-leak="detector"][data-field="method"]', 'direct', 'change'); set(b, '[data-leak="detector"][data-field="expected"]', '20'); set(b, '[data-leak="detector"][data-field="read"]', '21'); click(b, '#leakCheckSave');
    assert.match(b.d.getElementById('leak-detector-note').textContent, /would not save it, so it lasts until you close the page/); assert(b.d.getElementById('leak-detector-note').classList.contains('error'));
    assert.deepEqual(b.errors, []); b.close();
  });

  await check('Unreadable or newer stored data shows a plain warning on the screen; the newer data is not overwritten and says why', async () => {
    const u = boot({ seed: '{broken' }); await flush(); await goto(u, 'leakage');
    assert.equal(u.d.getElementById('leak-store-note').hidden, false); assert.match(u.d.getElementById('leak-store-note').textContent, /could not be read, so it starts empty/);
    set(u, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(u, '[data-leak="log"][data-field="location"]', 'Pole 1'); click(u, '#leakAdd');
    assert.equal(u.w.localStorage.getItem(KEY + '-unreadable'), '{broken'); assert.equal(u.d.getElementById('leak-store-note').hidden, true, 'the warning goes once the notebook is replaced'); u.close();
    const raw = JSON.stringify({ version: 5, leaks: [] }), n = boot({ seed: raw }); await flush(); await goto(n, 'leakage');
    assert.match(n.d.getElementById('leak-store-note').textContent, /newer version of the app saved the leak notebook/);
    set(n, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(n, '[data-leak="log"][data-field="location"]', 'Pole 1'); click(n, '#leakAdd');
    assert.match(n.d.getElementById('leak-log-note').textContent, /will not overwrite it/); assert.equal(n.w.localStorage.getItem(KEY), raw); n.close();
  });

  await check('Log rows say what could not be compared: no distance, an out-of-band or unknown frequency, and a threshold that needs a distance; Clear everything is a danger button and asks first', async () => {
    const x = boot(); await flush(); await goto(x, 'leakage');
    const add = o => { for (const [k, v] of Object.entries(o)) set(x, `[data-leak="log"][data-field="${k}"]`, v); click(x, '#leakAdd'); };
    set(x, '[data-leak-company="repair"]', '25', 'change');
    add({ found: '2026-11-10', location: 'Pole A', field: '900' });
    add({ found: '2026-11-10', location: 'Pole B', field: '200', distance: '3', frequency: '750' });
    add({ found: '2026-11-10', location: 'Pole C', field: '200', distance: '3' });
    add({ found: '2026-11-10', location: 'Pole D', field: '200', distance: '3', frequency: '121.2625' });
    const list = words(x.d.getElementById('leakList'));
    assert.match(list, /Pole A.*No distance was entered, so this is not restated to 3 m, compared with your repair threshold or checked for the CLI/);
    assert.match(list, /Pole B.*750 MHz · 50 µV\/m or more at 3 m, but not on the 108–137 MHz basis, so correct it before using it in the CLI/);
    assert.match(list, /Pole C.*50 µV\/m or more at 3 m; counts in the CLI only if measured in the 108–137 MHz band/);
    assert.match(list, /Pole D.*121\.2625 MHz · counts in the CLI/);
    const clear = x.d.getElementById('leakClear'); assert.equal(clear.textContent, 'Clear everything on this device'); assert(clear.classList.contains('danger'));
    confirmAnswer = false; clear.click(); confirmAnswer = true; assert(x.w.localStorage.getItem(KEY), 'a cancelled clear keeps everything');
    // editing one company box leaves the other alone, even after another tab changed it
    set(x, '[data-leak-company="tolerance"]', '1', 'change');
    const s = JSON.parse(x.w.localStorage.getItem(KEY)); s.company.tolerance = 3; x.w.localStorage.setItem(KEY, JSON.stringify(s));
    set(x, '[data-leak-company="repair"]', '40', 'change');
    assert.deepEqual(JSON.parse(x.w.localStorage.getItem(KEY)).company, { repair: 40, tolerance: 3 });
    set(x, '[data-leak-company="repair"]', '0.001', 'change');
    assert.match(x.d.getElementById('leak-company-note').textContent, /Not saved\. Enter the repair threshold in µV\/m from 0\.01 up to 1,000,000.*Still using repair threshold 40 µV\/m/);
    assert.equal(x.d.querySelector('[data-leak-company="repair"]').value, '40', 'the box goes back to the value still in use');
    assert.deepEqual(x.errors, []); x.close();
  });

  await check('A blank or invalid date is refused and the record is left as it was: no check or repair date is made up, the date boxes start as today', async () => {
    const t = boot(); await flush(); await goto(t, 'leakage');
    const today = t.ev('(()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");})()');
    assert.equal(t.d.querySelector('[data-leak="detector"][data-field="date"]').value, today, 'the check date is visibly prefilled');
    set(t, '[data-leak="detector"][data-field="method"]', 'direct', 'change'); set(t, '[data-leak="detector"][data-field="expected"]', '20'); set(t, '[data-leak="detector"][data-field="read"]', '22');
    set(t, '[data-leak="detector"][data-field="date"]', '');
    click(t, '#leakCheckSave');
    assert.match(words(t.d.getElementById('leak-detector-result')), /Enter the date of the detector check/, 'a blank check date is refused with its reason');
    assert.equal(t.json('Leakage.snapshot().checks.length'), 0, 'no check was appended');
    assert.equal(t.w.localStorage.getItem(KEY), null, 'nothing was stored');
    set(t, '[data-leak="detector"][data-field="date"]', '2026-11-09'); click(t, '#leakCheckSave');
    assert.notEqual(today, '2026-11-09', 'the chosen date differs from today, so a fallback to today would show');
    assert.equal(t.json('Leakage.snapshot().checks[0].date'), '2026-11-09', 'the date that was chosen is the date kept');
    assert.equal(t.d.querySelector('[data-leak="detector"][data-field="date"]').value, today, 'after saving, the date box is prefilled again');
    // Mark repaired with the prefilled date cleared
    set(t, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(t, '[data-leak="log"][data-field="location"]', 'Pole 14 at Elm and 3rd'); click(t, '#leakAdd');
    const id = JSON.parse(t.w.localStorage.getItem(KEY)).leaks[0].id;
    set(t, `[data-leak-repair="${id}"]`, ''); click(t, `[data-leak-mark="${id}"]`);
    assert.match(t.d.getElementById('leak-log-note').textContent, /Enter the repair date/);
    assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).leaks[0].repaired, '', 'the leak stays open');
    assert.match(words(t.d.getElementById('leakList')), /1 in the log · 1 open/);
    assert.deepEqual(t.errors, []); t.close();
  });

  await check('A number box that holds text which is not a number is refused, never read as a blank: a saved company setting stays, and an optional log field is not read as not given', async () => {
    const t = boot(); await flush(); await goto(t, 'leakage');
    // jsdom cannot type into a number box, so the state a lone minus sign produces (empty value, badInput) is stated directly; qa/build3-layout.test.py types it in real Chromium.
    const bad = sel => { const el = t.d.querySelector(sel); Object.defineProperty(el, 'validity', { value: { badInput: true }, configurable: true }); el.value = ''; return el; };
    set(t, '[data-leak-company="repair"]', '25', 'change'); set(t, '[data-leak-company="tolerance"]', '1', 'change');
    const box = bad('[data-leak-company="repair"]'); box.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    assert.match(t.d.getElementById('leak-company-note').textContent, /Not saved\. .*Still using repair threshold 25 µV\/m and tolerance 1 dB/);
    assert.deepEqual(JSON.parse(t.w.localStorage.getItem(KEY)).company, { repair: 25, tolerance: 1 }, 'the saved settings are kept');
    assert.equal(box.value, '25', 'the box shows the value still in use');
    const tol = bad('[data-leak-company="tolerance"]'); tol.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).company.tolerance, 1, 'the tolerance is kept as well');
    Object.defineProperty(tol, 'validity', { value: { badInput: false }, configurable: true });
    tol.value = ''; tol.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).company.tolerance, null, 'a genuinely empty box still clears one setting');
    assert.equal(JSON.parse(t.w.localStorage.getItem(KEY)).company.repair, 25, 'and leaves the other alone');
    // an optional log field: a malformed distance is not "no distance"
    set(t, '[data-leak="log"][data-field="found"]', '2026-11-10'); set(t, '[data-leak="log"][data-field="location"]', 'Tap 9'); set(t, '[data-leak="log"][data-field="field"]', '40');
    bad('[data-leak="log"][data-field="distance"]'); click(t, '#leakAdd');
    assert.match(t.d.getElementById('leak-log-note').textContent, /distance/i, 'the malformed distance is refused with a reason');
    assert.equal(t.json('Leakage.snapshot().leaks.length'), 0, 'nothing was added');
    // the limit card: a malformed frequency is not "frequency not given"
    set(t, '[data-leak="limit"][data-field="field"]', '10'); set(t, '[data-leak="limit"][data-field="distance"]', '30');
    bad('[data-leak="limit"][data-field="frequency"]').dispatchEvent(new t.w.Event('input', { bubbles: true }));
    assert.doesNotMatch(result(t, 'limit'), /within|over/, 'no verdict from a malformed frequency');
    assert.deepEqual(t.errors, []); t.close();
  });

  await check('The screen names one leak detector, the Arcom Digital QS-NAVPLUS-OUDP, and no other make', () => {
    assert.deepEqual(h.json('Leakage.DETECTOR'), { maker: 'Arcom Digital', model: 'QS-NAVPLUS-OUDP' });
    const text = words(h.d.getElementById('leakagePanel'));
    assert.match(words(h.d.getElementById('leakDetectorModel')), /Leak detector: Arcom Digital QS-NAVPLUS-OUDP ?\./);
    assert.match(words(h.d.querySelector('[data-leak-card="detector"]')), /your Arcom Digital QS-NAVPLUS-OUDP read/);
    assert.equal(/seeker|trilithic|comsonics|effigis|cpat|sniffer|viavi|veex/i.test(text), false, 'no other leak detector make on the Leakage screen');
    assert.equal(/seeker|trilithic|comsonics|effigis|cpat flex|sniffer/i.test(html), false, 'no other leak detector make anywhere in the built app');
    assert.equal(/014645/.test(html), false, 'the unit serial number is not in the app');
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal(h.ev('typeof Leakage'), 'object'); assert.equal(h.ev('typeof LeakageUI'), 'object');
    assert.equal((html.match(/const Leakage=\(\(\)=>/g) || []).length, 1);
    assert.equal(h.json('NightSweep.selfCheck.ok'), true);
    assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 leakage: ${cases.length} checks passed (${comparisons} comparisons with the independent references)`);
  fs.writeFileSync('qa/build3-leakage-results.json', JSON.stringify({ version: '2.0 Alpha build 4', count: cases.length, comparisons, cases, scope: 'App output against the independent reference built by leakage-reference.py in research/build3 (Python decimal, 50 digits); JSDOM rendering, device-local notebook and job format. Synthetic readings only.' }, null, 2) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
