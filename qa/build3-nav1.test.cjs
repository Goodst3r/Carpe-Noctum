/* Build 3 NAV-1 regroup. Screen ids stay. Safety is not a screen. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom');
const cases = [], errors = [], vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(fs.readFileSync('outputs/Night_Sweep.html', 'utf8'), { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {};
} });
const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); assert.deepEqual(errors, [], 'runtime errors'); cases.push(name); console.log('PASS ' + name); }
const buttons = () => [...d.querySelectorAll('#taskTabs button')].map(b => b.textContent);
const expected = {
  home: ['Home', 'Outage'],
  plan: ['Details', 'Setup', 'Route & sweep', 'Amp / node setup', 'Predicted levels', 'Load & what-if', 'Supply PM', 'Sweep due'],
  field: ['Meter setup', 'Station records', 'TDR', 'ONX files', 'Leakage', 'Checklists', 'Night log'],
  tools: ['Calculators', 'Frequency', 'Limits', 'References', 'Catalog', 'DOCSIS health', 'Impairments', 'Fiber', 'High split', 'Why cards', 'Proof of performance', 'Study'],
  closeout: ['Acceptance', 'Run sheet']
};
(async () => {
  await check('Bottom navigation is Home, Plan, Field, Tools and Closeout, and Safety is gone', () => {
    assert.deepEqual([...d.querySelectorAll('.bottom-nav [data-main-tab] span')].map(s => s.textContent), ['Home', 'Plan', 'Field', 'Tools', 'Closeout']);
    assert.equal(ev('String(WorkflowUI.screens.safety)'), 'undefined');
    assert.equal(d.getElementById('safetyPanel'), null);
    assert.equal(json('Object.keys(WorkflowUI.groups).sort()').join(), 'closeout,field,home,plan,tools');
  });
  await check('Each group lists only its screens, and screen ids are unchanged', () => {
    const ids = json('Object.keys(WorkflowUI.screens).sort()');
    assert.deepEqual(ids, ['calculators','checklists','docsisHealth','equipmentSetup','evidence','fiber','frequency','gain','help','highSplit','home','impairments','leakage','limits','nightLog','outage','parts','pop','power','powerPm','projects','readings','records','references','route','runsheet','setup','station','study','sweep','sweepDue','sweepSetup','tdr','trial','why']);
    ev("WorkflowUI.go('route')"); assert.deepEqual(buttons(), expected.plan); assert.equal(d.querySelector('#screenTitle .eyebrow').textContent, 'Plan');
    ev("WorkflowUI.go('sweepSetup')"); assert.deepEqual(buttons(), expected.field); assert.equal(d.querySelector('#screenTitle .eyebrow').textContent, 'Field');
    ev("WorkflowUI.go('calculators')"); assert.deepEqual(buttons(), expected.tools); assert.equal(d.querySelector('#screenTitle .eyebrow').textContent, 'Tools'); assert.equal(d.querySelector('#taskTabs').classList.contains('is-list'), true);
    ev("WorkflowUI.go('records')"); assert.deepEqual(buttons(), expected.closeout); assert.equal(d.querySelector('#taskTabs').classList.contains('is-list'), false);
    ev("WorkflowUI.go('outage')"); assert.deepEqual(buttons(), expected.home); assert.equal(d.getElementById('outagePanel').hidden, false);
  });
  await check('Tools search filters the list and does not navigate or store a screen id', () => {
    ev("WorkflowUI.go('calculators')");
    const box = d.querySelector('[data-task-search]');
    assert.equal(box.tagName, 'INPUT');
    box.value = 'fiber'; box.dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.deepEqual([...d.querySelectorAll('#taskTabs button')].filter(b => !b.hidden).map(b => b.textContent), ['Fiber']);
    assert.equal(ev('WorkflowUI.current()'), 'calculators');
    const state = json('state');
    assert.equal(state.screen, undefined);
    assert.equal(state.task, undefined);
    box.value = ''; box.dispatchEvent(new w.Event('input', { bubbles: true }));
    assert.deepEqual(buttons(), expected.tools);
  });
  await check('A filtered list result is reachable from the search box without changing the screen', () => {
    const probe = (start, query, id, label) => {
      ev("WorkflowUI.go(" + JSON.stringify(start) + ")");
      const box = d.querySelector('[data-task-search]');
      box.value = query; box.dispatchEvent(new w.Event('input', { bubbles: true }));
      assert.equal(ev('WorkflowUI.current()'), start);
      const visible = [...d.querySelectorAll('#taskTabs button')].filter(b => !b.hidden);
      assert.deepEqual(visible.map(b => b.textContent), [label]);
      assert.equal(visible[0].tabIndex, 0);
      assert.equal(d.getElementById('task-tab-' + start).tabIndex, -1);
      box.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      assert.equal(ev('WorkflowUI.current()'), start);
      assert.equal(d.activeElement, visible[0]);
      box.focus();
      box.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      assert.equal(d.activeElement, visible[0]);
      visible[0].click();
      assert.equal(ev('WorkflowUI.current()'), id);
    };
    probe('projects', 'what-if', 'power', 'Load & what-if');
    probe('sweepSetup', 'night log', 'nightLog', 'Night log');
    probe('calculators', 'fiber', 'fiber', 'Fiber');
  });
  await check('Legacy station and power entry IDs open the consolidated tasks', () => {
    for (const id of ['gain', 'readings']) { ev(`WorkflowUI.go('${id}')`); assert.equal(ev('WorkflowUI.current()'), 'route'); assert.equal(d.getElementById('routePanel').hidden, false); }
    ev("WorkflowUI.go('trial')"); assert.equal(ev('WorkflowUI.current()'), 'power'); assert.equal(d.getElementById('powerPanel').hidden, false); assert.equal(d.getElementById('powerWhatIf').hidden, false); assert.equal(d.getElementById('powerWhatIf').open, true);
  });
  await check('A bottom tab returns to the last screen in that group', () => {
    ev("WorkflowUI.go('powerPm')");
    d.querySelector('[data-main-tab="home"]').click();
    assert.equal(ev('WorkflowUI.current()'), 'home');
    d.querySelector('[data-main-tab="plan"]').click();
    assert.equal(ev('WorkflowUI.current()'), 'powerPm');
  });
  console.log('Build3 navigation regroup: ' + cases.length + ' checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
