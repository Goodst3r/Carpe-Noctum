#!/usr/bin/env node
'use strict';
/** Navigation and legacy job preservation against the frozen standalone. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

if (process.env.NIGHTSWEEP_RELEASE_TEST !== '1') {
  console.error('FAIL: NIGHTSWEEP_RELEASE_TEST=1 is required. Refusing a source-assembly pass.');
  process.exit(1);
}

const {bootApp} = require('./build2-source-harness.cjs');
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks += 1; };
const ok = (value, message) => { assert.ok(value, message); checks += 1; };

function labels(app) {
  return [...app.d.querySelectorAll('[data-main-tab], #taskTabs [data-task]')].map(el => (el.textContent || '').replace(/\s+/g, ' ').trim());
}

async function main() {
  const app = bootApp();
  try {
    eq(app.ev('WorkflowUI.current()'), 'calculators', 'startup screen');
    eq(app.d.getElementById('calculatorPanel').hidden, false, 'calculator panel visible');
    eq(app.ev('state.job && state.job.id || null'), null, 'startup does not create a named job id');
    eq(app.w.localStorage.getItem('hfc-named-jobs-v1'), null, 'named-job store is empty at startup');
    ok(app.d.querySelector('[data-main-tab="plan"]'), 'Route & sweep control exists');
    eq(app.d.querySelector('[data-main-tab="field"]'), null, 'Field tab is absent');
    eq(app.ev('WorkflowUI.groups.field'), undefined, 'Field group is absent');
    const retired = labels(app).filter(text => /^(field|leakage|daily)$/i.test(text) || /\bdaily\b/i.test(text) || /\bleakage\b/i.test(text));
    eq(retired.length, 0, 'bottom navigation has no Field, Leakage or daily label');
    app.d.querySelector('[data-main-tab="plan"]').click();
    eq(app.ev('WorkflowUI.current()'), 'route', 'one Route & sweep tap opens the route');
    eq(app.d.querySelector('[data-main-tab="plan"]').getAttribute('aria-current'), 'page', 'Route & sweep is the current main tab');
    for (const tab of ['home', 'plan', 'tools', 'closeout']) {
      app.d.querySelector('[data-main-tab="' + tab + '"]').click();
      const found = labels(app).filter(text => /\b(field|leakage|daily)\b/i.test(text));
      eq(found.length, 0, tab + ' task list has no Field, Leakage or daily entry');
    }
    const ids = app.json('Object.keys(WorkflowUI.groups).concat(...Object.values(WorkflowUI.groups).map(g=>g.tabs.map(t=>t[0])))');
    ok(!ids.includes('field') && !ids.includes('leakage') && !ids.includes('daily'), 'retired screen ids are not navigation destinations');
    eq(app.ev("WorkflowUI.go('leakage')"), 'calculators', 'leakage shortcut does not open a leakage screen');
    eq(app.ev("WorkflowUI.go('field')"), 'route', 'old field shortcut stays on route and does not restore a Field tab');
    app.ev("WorkflowUI.go('powerPm')");
    const book = app.d.querySelector('#powerPmBookTitle');
    ok(book, 'voltage calculator still renders its title');
    ok(book.closest('[hidden]'), 'retired daily notebook stays hidden');
    eq(app.d.querySelector('[data-main-tab="tools"]').getAttribute('aria-current'), 'page', 'voltage drop remains under Tools');

    const legacyPath = path.join(__dirname, 'fixtures/legacy-0.1-project.json');
    const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
    app.w.__legacyText = JSON.stringify(legacy);
    const opened = await app.w.eval('openProjectText(__legacyText, true)');
    eq(opened, true, 'production open accepts the legacy project');
    eq(app.ev('state.project.meta.job'), legacy.project.meta.job, 'legacy job name loaded');
    eq(app.ev('state.setup.lowF'), legacy.setup.lowF, 'legacy low frequency loaded');
    eq(app.ev('state.setup.highF'), legacy.setup.highF, 'legacy high frequency loaded');
    eq(app.ev('state.setup.lowLevel'), legacy.setup.lowLevel, 'legacy low level loaded');
    eq(app.ev('state.rows.length'), legacy.rows.length, 'legacy row count loaded');
    eq(app.ev('state.rows[0].name'), legacy.rows[0].name, 'legacy first point loaded');
    eq(app.ev('state.rows[0].device'), legacy.rows[0].device, 'legacy device id loaded');
    eq(app.ev('state.rows[1].parent'), legacy.rows[1].parent, 'legacy parent port loaded');
    eq(app.ev('state.power.rows[0].equipment'), legacy.power.rows[0].equipment, 'legacy power equipment loaded');
    eq(app.ev('state.power.rows[0].length'), legacy.power.rows[0].length, 'legacy power length loaded');
    app.d.getElementById('save').click();
    await new Promise(resolve => setTimeout(resolve, 50));
    const download = app.downloads.at(-1);
    ok(download && download.name.endsWith('Project.json'), 'production export wrote a project file');
    const exported = JSON.parse(download.text);
    eq(exported.project.meta.job, legacy.project.meta.job, 'export keeps the legacy job name');
    eq(exported.setup.lowF, legacy.setup.lowF, 'export keeps the legacy low frequency');
    eq(exported.setup.highLevel, legacy.setup.highLevel, 'export keeps the legacy high level');
    eq(exported.rows.length, legacy.rows.length, 'export keeps every legacy row');
    eq(exported.rows[2].name, legacy.rows[2].name, 'export keeps the last legacy point');
    eq(exported.rows[2].length, legacy.rows[2].length, 'export keeps the last legacy length');
    eq(exported.rows[0].cable, legacy.rows[0].cable, 'export keeps the legacy cable');
    eq(exported.power.rows[0].name, legacy.power.rows[0].name, 'export keeps the legacy power point');
    eq(exported.power.supplyVoltage, legacy.power.supplyVoltage, 'export keeps the legacy supply voltage');
    app.w.__round = download.text;
    const reopened = await app.w.eval('openProjectText(__round, true)');
    eq(reopened, true, 'exported legacy project opens again');
    eq(app.ev('state.rows[1].length'), legacy.rows[1].length, 'reopened export keeps the middle span');
    eq(app.ev('state.project.meta.node'), legacy.project.meta.node, 'reopened export keeps the legacy node note');
    eq(app.errors.length, 0, 'navigation page reported no errors');
    console.log('Grok nav-legacy: ' + checks + ' checks');
  } finally {
    app.close();
  }
}

main().catch(error => {
  console.error('FAIL ' + (error && error.stack || error));
  process.exit(1);
});
