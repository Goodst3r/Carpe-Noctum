/* Power-sum calculator: the built app's FieldCalc.powerSum against the shared vectors. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom');
const vectors = JSON.parse(fs.readFileSync('handoff_docs/reviews/chatgpt-calculator-test-vectors.json', 'utf8'));
const html = fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const errors = [], vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(win) {
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.scrollTo = () => {};
} });
const w = dom.window, d = w.document;
const call = input => JSON.parse(w.eval('JSON.stringify(FieldCalc.powerSum(' + JSON.stringify(input) + '))'));
function six(n) { return Number(n).toPrecision(6).replace(/e/g, 'E'); }
/* Unrounded app result versus the vector's decimal string, as a double.
   Bound: 1e-9 relative, or 1e-18 absolute when the reference is smaller than 1e-9.
   That bound is numerical, not an RF tolerance. Six-significant-figure text is checked separately. */
function near(actual, decimal, label) {
  const ref = Number(decimal);
  assert(Number.isFinite(actual) && Number.isFinite(ref), label + ' finite');
  const bound = Math.max(Math.abs(ref) * 1e-9, 1e-18);
  assert(Math.abs(actual - ref) <= bound, `${label}: app ${actual} vs ${decimal} (bound ${bound})`);
}
const groups = vectors.calculators.power_sum;
const cases = [...groups.worked_cases, ...groups.extra_edge_cases, ...groups.refusal_cases];
let checks = 0;
for (const c of cases) {
  const r = call(c.inputs);
  if (c.expected_6sf) {
    assert.equal(r.ok, true, c.id + ' ' + JSON.stringify(r));
    for (const [key, printed] of Object.entries(c.expected_6sf)) {
      near(r[key], c.decimal_reference[key], c.id + ' ' + key);
      assert.equal(six(r[key]), printed, c.id + ' ' + key + ' six figures');
      checks++;
    }
    assert.equal(r.error, undefined, c.id + ' success has no error');
  } else {
    assert.equal(r.ok, false, c.id + ' should refuse');
    assert.equal(r.error, c.expected_reason_text, c.id);
    assert.equal(Object.keys(r).sort().join(','), 'error,ok', c.id + ' no number on a refusal');
    checks++;
  }
}
assert.deepEqual(errors, [], 'no jsdom errors during the vector calls');
w.eval("WorkflowUI.go('calculators')");
const levels = [...d.querySelectorAll('[data-power-level]')];
assert.equal(levels.length, 2, 'two level boxes to start');
levels[0].value = '40'; levels[0].dispatchEvent(new w.Event('input', { bubbles: true }));
levels[1].value = '37'; levels[1].dispatchEvent(new w.Event('input', { bubbles: true }));
const third = d.createElement('input');
d.querySelector('[data-power-add]').dispatchEvent(new w.Event('click', { bubbles: true }));
assert.equal(d.querySelectorAll('[data-power-level]').length, 3, 'add another level');
const box = d.getElementById('calc-power-result').textContent.replace(/\s+/g, ' ');
assert.match(box, /41\.7643/, '40 and 37 dBmV, third box still empty');
d.querySelector('[data-calc="power"][data-field="operation"]').value = 'subtract_noise';
d.querySelector('[data-calc="power"][data-field="operation"]').dispatchEvent(new w.Event('change', { bubbles: true }));
d.querySelector('[data-calc="power"][data-field="total"]').value = '10';
d.querySelector('[data-calc="power"][data-field="noise"]').value = '10';
d.querySelector('[data-calc="power"][data-field="noise"]').dispatchEvent(new w.Event('input', { bubbles: true }));
assert.match(d.getElementById('calc-power-result').textContent, /Total must exceed noise/);
assert.equal(d.querySelector('[data-calc-card="power"] [data-threshold]').dataset.threshold, 'calc.power.sum');
checks += 5;
console.log(`Build3 power sum: ${checks} checks passed`);
