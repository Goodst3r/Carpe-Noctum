/* Read-only context strip. It displays the job, plant and point. It stores nothing. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom');
const errors = [], vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(fs.readFileSync('outputs/Night_Sweep.html', 'utf8'), { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {};
} });
const w = dom.window, d = w.document, ev = s => w.eval(s);
const strip = () => d.getElementById('contextStrip');
const part = name => strip().querySelector('[data-context="' + name + '"]').textContent;
let checks = 0;
function check(name, ok) { assert.equal(ok, true, name); checks++; }
(async () => {
  await new Promise(r => setImmediate(r));
  assert.deepEqual(errors, []);
  const keys = () => { const out = []; for (let i = 0; i < w.localStorage.length; i++) out.push(w.localStorage.key(i)); return out.sort(); };
  const keysBefore = keys();
  const jobBefore = ev('JSON.stringify(state.job||null)');
  ev("state.job=Object.assign({}, state.job, {name:'SYNTHETIC strip job'})");
  ev("WorkflowUI.go('home')");
  check('home shows the strip', strip().hidden === false);
  check('job name is the working job', part('job') === 'SYNTHETIC strip job');
  check('a missing plant stays unknown', part('plant') === 'Plant unknown');
  check('the strip is not an editor', strip().querySelector('input,select,textarea,button') === null);
  const point = ev('(state.rows[0]&&state.rows[0].name)||""');
  check('a route shows its selected point', point ? part('point') === point : part('point') === 'No point selected');
  ev("state.sweepSetup={version:1,selected:'204',profiles:{},history:[]}");
  ev("WorkflowUI.go('route')");
  check('204/258 stays the Vecima / AOI plant', part('plant') === '204/258 Vecima / AOI');
  check('the plane line is hidden off Station', strip().querySelector('[data-context="plane"]').hidden === true);
  ev("state.sweepSetup.selected='42'");
  ev("WorkflowUI.go('station')");
  check('42/54 stays the GS7K / GainMaker plant', part('plant') === '42/54 GS7K / GainMaker');
  check('a blank Station plane stays unknown', part('plane') === 'Measurement plane unknown');
  // The sample route is taps only, so the worksheet stays closed until an installed active exists.
  ev("state.rows[0].device='active_gm_gan_hgd'");
  ev("WorkflowUI.go('station')");
  const plane = d.querySelector('#stationPanel [data-station-scope="forward"][data-station-field="plane"]');
  assert.ok(plane, 'station plane field');
  plane.value = 'SYNTHETIC output test point';
  plane.dispatchEvent(new w.Event('input', { bubbles: true }));
  plane.dispatchEvent(new w.Event('change', { bubbles: true }));
  ev("WorkflowUI.go('station')");
  check('Station shows the plane already on the worksheet', part('plane') === 'Plane: SYNTHETIC output test point');
  ev("WorkflowUI.go('calculators')");
  check('Tools hides the strip', strip().hidden === true);
  ev("WorkflowUI.go('home')");
  check('leaving Tools shows the strip again', strip().hidden === false);
  const keysAfter = keys();
  check('no new storage key', keysBefore.join() === keysAfter.join());
  check('the job record did not gain a strip field', !Object.hasOwn(JSON.parse(ev('JSON.stringify(state.job)')), 'contextStrip'));
  assert.equal(jobBefore.includes('contextStrip'), false);
  assert.deepEqual(errors, []);
  console.log('Build3 context strip: ' + checks + ' checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
