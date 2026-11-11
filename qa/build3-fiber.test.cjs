/* Build 3 fiber tools (build list item 15, first part): the TIA-598 color finder and the simple link loss budget,
   compared with an independent 50-digit decimal reference, then the rendered screen, the registry rows and the saved
   job format. Synthetic numbers only; nothing is read from a meter and nothing is stored. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const reference = JSON.parse(fs.readFileSync('research/build3/fiber-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [];
let comparisons = 0;
const boot = () => require('./build2-source-harness.cjs').bootApp({ html });
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
function close(actual, expected, label, tol = 1e-12) {
  const e = Number(expected);
  assert(Number.isFinite(actual), label + ' is finite: ' + actual);
  assert(Math.abs(actual - e) <= Math.max(tol, Math.abs(e) * tol), `${label}: app ${actual} vs reference ${expected}`);
  comparisons++;
}
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const set = (h, selector, value) => { const el = h.d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new h.w.Event('input', { bubbles: true })); };
const f = (card, name) => `[data-fiber="${card}"][data-field="${name}"]`;
const result = (h, id) => words(h.d.getElementById('fiber-' + id + '-result'));
const call = (h, fn, input) => h.json(`FiberTools.${fn}(${JSON.stringify(input)})`);

(async () => {
  const h = boot();
  await flush();

  await check('The color finder matches the reference for 45 fibers across all 24 tubes: color, tube, position, tube color and the stripe note past tube 12', () => {
    assert.deepEqual(h.json('FiberTools.COLORS'), reference.colors);
    for (const c of reference.cases.locate) {
      const r = h.json(`FiberTools.locate(${c.input.fiber})`);
      assert.equal(r.ok, true, 'fiber ' + c.input.fiber);
      assert.deepEqual([r.tube, r.position, r.fiberColor, r.tubeColor, r.tubeMarking.marked], [c.expected.tube, c.expected.position, c.expected.fiberColor, c.expected.tubeColor, c.expected.marked], 'fiber ' + c.input.fiber); comparisons++;
    }
    for (const c of reference.cases.fromTube) {
      const r = h.json(`FiberTools.fromTube(${c.input.tube},${c.input.position})`);
      assert.equal(r.ok, true); assert.deepEqual([r.fiber, r.tube, r.position, r.fiberColor, r.tubeColor], [c.expected.fiber, c.expected.tube, c.expected.position, c.expected.fiberColor, c.expected.tubeColor]); comparisons++;
    }
    assert.match(h.json('FiberTools.locate(20*12)').tubeMarking.text || '', /tube 20 is the black position.*makers mark the repeat differently/, 'tube 20: no single stripe is claimed');
    assert.match(h.json('FiberTools.locate(13*12)').tubeMarking.text, /repeats with a stripe or dashes/); assert.equal(h.json('FiberTools.locate(12)').tubeMarking.marked, false);
  });

  await check('The loss budget matches the reference in every part (fiber, connectors, splices, other, estimate, required, optics budget and headroom); a count of 0 needs no loss', () => {
    for (const c of reference.cases.budget) {
      const r = call(h, 'budget', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input));
      close(r.fiber, c.expected.fiber, 'fiber'); close(r.connectors.total, c.expected.connectors, 'connectors'); close(r.splices.total, c.expected.splices, 'splices'); close(r.other, c.expected.other, 'other');
      close(r.estimated, c.expected.estimated, 'estimated'); close(r.required, c.expected.required, 'required');
      if (c.expected.available === undefined) assert.equal(r.optics, null, 'no optics numbers, no verdict');
      else { close(r.optics.available, c.expected.available, 'available'); close(r.optics.headroom, c.expected.headroom, 'headroom'); assert.equal(r.optics.status, c.expected.status, JSON.stringify(c.input)); }
    }
  });

  await check('Missing or invalid input gives a reason and no number: nothing is read as zero, a count above 0 needs its loss, and the optics numbers come as a pair', () => {
    for (const c of reference.cases.errors) {
      const input = c.fn === 'budget' ? c.input : c.input;
      const r = c.fn === 'budget' ? call(h, 'budget', input) : c.fn === 'locate' ? h.json(`FiberTools.locate(${JSON.stringify(input.fiber)})`) : h.json(`FiberTools.fromTube(${JSON.stringify(input.tube)},${JSON.stringify(input.position)})`);
      assert.equal(r.ok, false, JSON.stringify(c)); assert(typeof r.error === 'string' && r.error.length > 15, JSON.stringify(c));
      for (const k of ['estimated', 'required', 'fiber', 'tube', 'fiberColor', 'optics']) assert.equal(r[k], undefined, `${JSON.stringify(c)} must not return ${k}`);
    }
    const started = Date.now(); assert.equal(call(h, 'budget', { length: '1'.repeat(5000) + 'x' }).ok, false); assert(Date.now() - started < 250);
  });

  await check('The screen is Test → Fiber after Impairments, shows only there, and stores nothing: the saved job and every storage key are unchanged', async () => {
    const x = boot(); await flush();
    const before = JSON.stringify(x.json('evidenceExportProject(state)')), keys = JSON.stringify(Object.keys(x.w.localStorage).sort()), values = JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => x.w.localStorage.getItem(k)));
    await goto(x, 'projects'); assert.equal(x.d.getElementById('fiberPanel').hidden, true);
    await goto(x, 'fiber');
    const tabs = [...x.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(-5, -2), ['Leakage', 'Impairments', 'Fiber']);
    assert.equal(x.d.getElementById('fiberPanel').hidden, false); assert.match(x.d.getElementById('screenTitle').textContent, /Fiber color code and loss budget/);
    set(x, f('finder', 'fiber'), '30'); set(x, f('budget', 'length'), '12.4'); set(x, f('budget', 'attenuation'), '0.35'); set(x, f('budget', 'connectors'), '4'); set(x, f('budget', 'connectorLoss'), '0.3');
    assert.equal(JSON.stringify(x.json('evidenceExportProject(state)')), before); assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort()), keys); assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => x.w.localStorage.getItem(k))), values);
    assert.equal(x.d.querySelectorAll('#fiberPanel [inputmode]').length, 0, 'no decimal keypad: the iPhone one has no minus key and the receiver sensitivity is negative');
    x.close();
  });

  await check('The finder states the fiber, its color, tube and position in words, accepts a tube and position, and warns that marking past 12 differs between makers', async () => {
    await goto(h, 'fiber');
    assert.equal(h.d.querySelectorAll('#fiberPanel .fiber-swatch').length >= 12, true); assert.match(words(h.d.getElementById('fiberPanel')), /Position Color Position Color 1 .*Blue 7 .*Red/);
    set(h, f('finder', 'fiber'), '30');
    assert.match(result(h, 'finder'), /Fiber 30 .*White \(position 6\) In tube 3 .*Green/); assert.match(result(h, 'finder'), /Fibers and tubes both use the same twelve colors/);
    set(h, f('finder', 'fiber'), '240'); assert.match(result(h, 'finder'), /Fiber 240 .*Aqua \(position 12\) In tube 20 .*Black/); assert.match(result(h, 'finder'), /Tube 20 is past 12: .*yellow stripe.*check the cable print legend/);
    set(h, f('finder', 'fiber'), '300'); assert(h.d.getElementById('fiber-finder-result').classList.contains('error')); assert.match(result(h, 'finder'), /up to 288 .*construction sheet/);
    set(h, f('finder', 'fiber'), ''); set(h, f('finder', 'tube'), '3'); set(h, f('finder', 'position'), '6'); assert.match(result(h, 'finder'), /Fiber 30 .*White \(position 6\) In tube 3/);
    set(h, f('finder', 'tube'), ''); set(h, f('finder', 'position'), ''); assert.match(result(h, 'finder'), /Enter values/);
  });

  await check('The budget card lists each part, the estimate and the margin; says there is no pass or fail without optics numbers; shows headroom or the shortfall with them; refuses a blank as zero', async () => {
    const vals = { length: '12.4', attenuation: '0.35', connectors: '4', connectorLoss: '0.3', splices: '6', spliceLoss: '0.1', other: '3.5', margin: '3' };
    for (const [k, v] of Object.entries(vals)) set(h, f('budget', k), v);
    let text = result(h, 'budget');
    assert.match(text, /Fiber, 12.4 km × 0.35 dB\/km 4.34 dB/); assert.match(text, /Connectors, 4 × 0.3 1.2 dB/); assert.match(text, /Splices, 6 × 0.1 0.6 dB/); assert.match(text, /Other loss 3.5 dB/);
    assert.match(text, /Estimated link loss 9.64 dB/); assert.match(text, /With the safety margin of 3 dB 12.64 dB/); assert.match(text, /No optics numbers were entered, so this is the loss to expect, not a pass or fail/);
    set(h, f('budget', 'tx'), '3'); assert(h.d.getElementById('fiber-budget-result').classList.contains('error')); assert.match(result(h, 'budget'), /both the transmitter output power and the receiver sensitivity/);
    set(h, f('budget', 'rx'), '-24'); text = result(h, 'budget'); assert.match(text, /Optics budget .* 27 dB/); assert.match(text, /✓ 14.36 dB of the optics budget is left/); assert(h.d.querySelector('#fiber-budget-result .health-status.ok'));
    set(h, f('budget', 'rx'), '-8'); text = result(h, 'budget'); assert.match(text, /⚠ Short by 1.64 dB/); assert(h.d.querySelector('#fiber-budget-result .health-status.warn'));
    set(h, f('budget', 'rx'), '-24'); set(h, f('budget', 'splices'), ''); assert.match(result(h, 'budget'), /Enter the number of splices, or 0 if there are none/);
    set(h, f('budget', 'splices'), '0'); set(h, f('budget', 'spliceLoss'), ''); assert.match(result(h, 'budget'), /Splices, 0 0 dB/); set(h, f('budget', 'splices'), '2'); assert.match(result(h, 'budget'), /loss of each splice/);
  });

  await check('The standard allowances are shown with source tags and copied into the fields only when the technician asks; the copied values are the registry values', async () => {
    const x = boot(); await flush(); await goto(x, 'fiber');
    for (const k of ['attenuation', 'connectorLoss', 'spliceLoss']) assert.equal(x.d.querySelector(f('budget', k)).value, '', k + ' starts blank: no silent default');
    x.d.querySelector('[data-fiber-fill="osp"]').click();
    assert.deepEqual(['attenuation', 'connectorLoss', 'spliceLoss'].map(k => x.d.querySelector(f('budget', k)).value), ['0.5', '0.75', '0.3']);
    x.d.querySelector('[data-fiber-fill="isp"]').click(); assert.equal(x.d.querySelector(f('budget', 'attenuation')).value, '1');
    for (const id of ['fiber.tia.connector', 'fiber.tia.splice', 'fiber.tia.sm.osp', 'fiber.tia.sm.isp']) { assert(x.json('Thresholds.rows').find(r => r.id === id).value > 0, id); assert(x.d.querySelector(`#fiberPanel [data-threshold="${id}"]`), id + ' has a tag'); }
    x.close();
  });

  await check('Six registry rows: the color code and the link budget formula, and four TIA-568.3-D allowances; all labeled with their source and flagged secondary, none a company value', async () => {
    const rows = h.json('Thresholds.rows').filter(r => /^fiber\./.test(r.id));
    assert.deepEqual(rows.map(r => r.id).sort(), ['fiber.budget.formula', 'fiber.tia.connector', 'fiber.tia.sm.isp', 'fiber.tia.sm.osp', 'fiber.tia.splice', 'fiber.tia598.colors']);
    for (const r of rows) { assert.equal(r.verification, 'secondary', r.id); assert(['spec', 'expert'].includes(r.label), r.id); assert.equal(r.scope, 'all'); assert(r.usedBy.includes('Fiber'), r.id); assert.notEqual(r.label, 'company'); }
    const byId = id => rows.find(r => r.id === id);
    assert.deepEqual(['fiber.tia.connector', 'fiber.tia.splice', 'fiber.tia.sm.osp', 'fiber.tia.sm.isp'].map(id => byId(id).value), [0.75, 0.3, 0.5, 1]);
    assert.match(byId('fiber.tia.connector').revision, /568\.3-E \(2022\)[^.]*not checked/); assert.match(byId('fiber.budget.formula').conditions, /does not judge a link against your company/);
    for (const t of h.d.querySelectorAll('#fiberPanel [data-threshold]')) assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold);
    await goto(h, 'limits'); assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const FiberTools=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 fiber: ${cases.length} checks passed (${comparisons} comparisons with the independent reference)`);
  fs.writeFileSync('qa/build3-fiber-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App output against the independent reference built by fiber-reference.py in research/build3 (Python decimal, 50 digits); JSDOM rendering. Synthetic numbers only; nothing read from a meter.' }, null, 2) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
