/* Cascade thermal/CNR: the built app's FieldCalc.cascade against the shared vectors. */
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
const call = input => JSON.parse(w.eval('JSON.stringify(FieldCalc.cascade(' + JSON.stringify(input) + '))'));
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
const groups = vectors.calculators.cascade;
const cases = [...groups.worked_cases, ...groups.extra_edge_cases, ...groups.refusal_cases];
let checks = 0;
for (const c of cases) {
  const r = call(c.inputs);
  if (c.expected_6sf) {
    assert.equal(r.ok, true, c.id + ' ' + JSON.stringify(r));
    assert.equal(r.operation, c.inputs.operation, c.id + ' operation');
    assert.deepEqual(Object.keys(r).sort(), ['ok', 'operation', ...Object.keys(c.expected_6sf)].sort(), c.id + ' keys');
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
assert.equal(d.querySelector('[data-cascade-body]').dataset.cascadeOp, 'thermal_chain');
assert.equal(d.querySelectorAll('[data-cascade-cnr]').length, 0, 'combine fields stay out of the DOM until selected');
const set = (field, value) => {
  const el = d.querySelector(`[data-calc="cascade"][data-field="${field}"]`);
  el.value = value;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
};
set('bandwidth', '6400000'); set('input', '15'); set('nf', '8'); set('count', '10'); set('optical', '45');
const shown = d.getElementById('calc-cascade-result').textContent.replace(/\s+/g, ' ');
assert.match(shown, /-57\.1628/);
assert.match(shown, /64\.1628/);
assert.match(shown, /54\.1628/);
assert.match(shown, /44\.5029/);
const op = d.querySelector('[data-calc="cascade"][data-field="operation"]');
op.value = 'combine_cnr';
op.dispatchEvent(new w.Event('change', { bubbles: true }));
assert.equal(d.querySelectorAll('[data-calc="cascade"][data-field="bandwidth"]').length, 0, 'thermal fields leave the DOM');
const cnrs = [...d.querySelectorAll('[data-cascade-cnr]')];
assert.equal(cnrs.length, 2, 'two CNR boxes to start');
cnrs[0].value = '40'; cnrs[0].dispatchEvent(new w.Event('input', { bubbles: true }));
cnrs[1].value = '40'; cnrs[1].dispatchEvent(new w.Event('input', { bubbles: true }));
assert.match(d.getElementById('calc-cascade-result').textContent, /36\.9897/);
assert.equal(d.querySelector('[data-calc-card="cascade"] [data-threshold]').dataset.threshold, 'calc.cascade.cnr');
checks += 4;
console.log(`Build3 cascade: ${checks} checks passed`);
