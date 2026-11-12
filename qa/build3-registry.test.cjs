/* Build 3 threshold and source registry (build list item 1), against the built standalone app DOM. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [], errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {}; w.structuredClone = structuredClone;
  w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
  // JSDOM has no modal dialogs; this stand-in opens and closes the source sheet.
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
} });
const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); assert.deepEqual(errors, [], 'runtime errors'); cases.push(name); console.log('PASS ' + name); }
const rows = () => json('Thresholds.rows');
const sheet = () => d.querySelector('dialog.source-sheet');
function tagsIn(root) { return [...root.querySelectorAll('[data-threshold]')]; }
function assertResolves(tags) {
  const registry = rows();
  for (const t of tags) {
    const id = t.dataset.threshold, hits = registry.filter(r => r.id === id);
    assert.equal(hits.length, 1, 'tag resolves to exactly one registry row: ' + id);
    assert.equal(t.dataset.label, hits[0].label, 'tag label matches registry: ' + id);
    assert.equal(t.tagName, 'BUTTON', 'tag is a button: ' + id);
    assert.equal(t.textContent, json('Thresholds.LABEL_INFO')[hits[0].label].text, 'visible tag text: ' + id);
  }
}

(async () => {
  await flush();
  ev("var __selected=()=>state.project.profiles.find(p=>String(p.id)===String(state.project.selectedProfile))");
  await check('Every registry row has its required provenance fields and one of the four labels', () => {
    const registry = rows(), required = json('Thresholds.REQUIRED');
    assert(registry.length >= 25, 'registry rows: ' + registry.length);
    assert.deepEqual(json('Thresholds.LABELS'), ['spec', 'expert', 'company', 'unknown']);
    for (const r of registry) {
      for (const key of required) assert(typeof r[key] === 'string' && r[key].trim(), r.id + ' has ' + key);
      assert(['spec', 'expert', 'company', 'unknown'].includes(r.label), r.id + ' label');
      assert.deepEqual(json(`Thresholds.checkRow(Thresholds.get(${JSON.stringify(r.id)}))`), [], r.id + ' row check');
    }
    assert.equal(new Set(registry.map(r => r.id)).size, registry.length, 'unique ids');
    assert(ev('Object.isFrozen(Thresholds.rows)&&Thresholds.rows.every(Object.isFrozen)'), 'registry is read-only at runtime');
  });

  await check('Row checks reject a missing source, a fifth label and a company value that is not an entered value', () => {
    const problems = json(`Thresholds.checkRow({...Thresholds.get('calc.ofdm.bandwidth'),source:'',label:'vendor'})`);
    assert(problems.includes('missing source') && problems.some(p => /label must be/.test(p)), problems.join('; '));
    assert(json(`Thresholds.checkRow({...Thresholds.get('company.profile.fLevelTol'),verification:'primary'})`).includes('company values are entered values'));
    assert.throws(() => ev("Thresholds.tag('no.such.row')"), /Unregistered threshold/);
  });

  await check('Labels follow the build list: spec, expert, company and unknown rows sit where expected', () => {
    const label = id => json(`Thresholds.get(${JSON.stringify(id)}).label`);
    for (const id of ['calc.db.dbm', 'calc.db.dbuv', 'const.speedOfLight']) assert.equal(label(id), 'spec', id);
    for (const id of ['calc.ofdm.bandwidth', 'calc.ripple.distance', 'calc.microreflection.delay', 'calc.preeq.tapDistance']) assert.equal(label(id), 'expert', id);
    assert.equal(json("Thresholds.get('calc.ofdm.bandwidth').verification"), 'derived', 'flat-PSD restatement is a derived relation, with its assumptions declared');
    assert.equal(json("Thresholds.get('calc.preeq.tapDistance').verification"), 'derived', 'pre-EQ formula combines spec tap spacing with best-practice halving');
    assert.match(json("Thresholds.get('calc.preeq.tapDistance').conditions"), /spacing between two impedance mismatches, not the distance from the modem or node/);
    for (const id of ['app.cable.temperatureCoefficient', 'app.power.resistanceAlpha']) assert.equal(label(id), 'unknown', id);
    assert(rows().filter(r => r.label === 'company').every(r => r.verification === 'entered'), 'company rows are entered values');
  });

  await check('Local non-high-split rows show the built-in 31 / 43 dBmV forward references and the separate 38 dBmV TX reference', () => {
    const preset = json('FieldReference.localNonHighSplitPreset');
    assert.deepEqual([preset.launchLow, preset.launchHigh, preset.txReference], [31, 43, 38]);
    assert.equal(json("Thresholds.resolve('company.local.forward54').value"), 31);
    assert.equal(json("Thresholds.resolve('company.local.forward860').value"), 43);
    assert.equal(json("Thresholds.resolve('company.local.returnTx').value"), 38);
    for (const id of ['company.local.forward54', 'company.local.forward860', 'company.local.returnTx']) assert.equal(json(`Thresholds.get('${id}').scope`), '42/54', id + ' scope');
    assert.match(json("Thresholds.get('company.local.returnTx').conditions"), /Separate from sweep injection and receiver references/);
    for (const id of ['company.local.forward54', 'company.local.forward860', 'company.local.returnTx']) { assert.doesNotMatch(json(`Thresholds.get('${id}').date`), /^\d{4}-/, id + ' is not shown as checked'); assert.match(json(`Thresholds.get('${id}').note`), /not approved plant criteria/); }
  });

  await check('Job-profile company targets start unknown, are never read as zero, and follow the selected profile', () => {
    const fields = json('projectProfileFields.map(f=>f[0])');
    const profileRows = rows().filter(r => r.store === 'profile');
    assert(profileRows.length >= 14, 'profile rows');
    for (const r of profileRows) assert(fields.includes(r.field), r.id + ' maps to an existing profile field');
    ev("state.project=projectDefaults()");
    assert.equal(json("Thresholds.resolve('company.profile.fLevelTol').value"), null, 'blank is unknown');
    assert.equal(ev("Thresholds.display('company.profile.fLevelTol')"), 'Unknown — not entered');
    ev("__selected().fLevelTol='0'");
    assert.equal(json("Thresholds.resolve('company.profile.fLevelTol').value"), 0, 'an entered zero stays zero');
    ev("__selected().fLevelTol='1.5'");
    assert.equal(ev("Thresholds.display('company.profile.fLevelTol')"), '± 1.5 dB');
    ev("__selected().fLevelTol='abc'");
    assert.equal(json("Thresholds.resolve('company.profile.fLevelTol').value"), null, 'unreadable text is unknown');
    ev("state.project.selectedProfile='750'");
    assert.equal(json("Thresholds.resolve('company.profile.launchLow').value"), 32, 'follows the selected profile');
    assert.match(json("Thresholds.resolve('company.profile.launchLow').where"), /Selected profile 750/);
    ev("state.project.selectedProfile='none-such'");
    assert.equal(json("Thresholds.resolve('company.profile.launchLow').value"), null, 'no selected profile is unknown');
  });

  await check('The meter-setup TX reference belongs to the 42/54 workflow only and stays unknown until entered', () => {
    ev("state.sweepSetup=SweepSetup.defaults()");
    assert.equal(json("Thresholds.resolve('company.sweep42.txReference').value"), null);
    ev("state.sweepSetup.profiles['42'].txReference='38'");
    assert.equal(json("Thresholds.resolve('company.sweep42.txReference').value"), 38);
    assert.equal(json("Thresholds.get('company.sweep42.txReference').scope"), '42/54');
    assert.equal(ev("Thresholds.get('company.sweep204.txReference')"), null, 'no TX reference row for 204/258: SweepSetup forbids one');
    assert(rows().filter(r => r.scope === '204/258').every(r => !/TX reference/.test(r.name)), 'no 204/258 TX target');
    assert.throws(() => ev("SweepSetup.validate({...SweepSetup.defaults(),profiles:{...SweepSetup.defaults().profiles,'204':{...SweepSetup.profileDefaults('204'),txReference:'38'}}})"), /42 MHz workflow/);
  });

  await check('The Limits tab lists every registry row with a tag, and the label filter narrows the list', () => {
    ev("WorkflowUI.go('limits')");
    assert.equal(d.getElementById('limitsPanel').hidden, false, 'limits panel shown');
    assert.equal(d.getElementById('calculatorPanel').hidden, true, 'calculators hidden');
    const listTags = tagsIn(d.getElementById('limitsList'));
    assert.equal(listTags.length, rows().length, 'one tag per registry row');
    assert.deepEqual(new Set(listTags.map(t => t.dataset.threshold)), new Set(rows().map(r => r.id)));
    assertResolves(listTags);
    d.querySelector('[data-limits-filter="company"]').click();
    const companyTags = tagsIn(d.getElementById('limitsList'));
    assert(companyTags.length > 0 && companyTags.every(t => t.dataset.label === 'company'), 'company filter');
    assert.equal(d.querySelector('[data-limits-filter="company"]').getAttribute('aria-pressed'), 'true');
    assert.equal(d.querySelector('[data-limits-filter="all"]').getAttribute('aria-pressed'), 'false');
    assert.match(d.getElementById('limitsCount').textContent, new RegExp(companyTags.length + ' of ' + rows().length));
    d.querySelector('[data-limits-filter="unknown"]').click();
    assert(tagsIn(d.getElementById('limitsList')).every(t => t.dataset.label === 'unknown'));
    d.querySelector('[data-limits-filter="all"]').click();
    assert.equal(tagsIn(d.getElementById('limitsList')).length, rows().length);
    assert.equal(ev("Thresholds.setFilter('vendor')"), false, 'no fifth label filter');
  });

  await check('Every tag the app renders on any screen resolves to exactly one registry row with the same label', () => {
    for (const tab of Object.keys(json('WorkflowUI.screens'))) ev(`WorkflowUI.go(${JSON.stringify(tab)})`);
    const all = tagsIn(d);
    assert(all.length >= rows().length + 7, 'tags rendered across limits and calculators: ' + all.length);
    assertResolves(all);
    assertResolves(tagsIn(d.getElementById('calculatorPanel')));
    assert(tagsIn(d.getElementById('calculatorPanel')).length >= 7, 'calculator tags');
  });

  await check('Tapping a tag opens a source sheet with label, source, revision, page, units, conditions and date', async () => {
    ev("WorkflowUI.go('calculators')");
    const tag = d.querySelector('#calculatorPanel [data-threshold="calc.ofdm.bandwidth"]');
    tag.click(); await flush();
    const s = sheet();
    assert(s && s.hasAttribute('open'), 'sheet open');
    assert.equal(s.dataset.sheetFor, 'calc.ofdm.bandwidth');
    assert.equal(s.getAttribute('aria-labelledby'), 'sourceSheetTitle');
    assert.equal(d.activeElement.id, 'sourceSheetTitle', 'focus moves into the sheet');
    const terms = [...s.querySelectorAll('dt')].map(x => x.textContent);
    for (const term of ['Formula', 'Units', 'Applies when', 'Plant', 'Source', 'Revision', 'Page, table or section', 'Checked', 'Used by']) assert(terms.includes(term), 'sheet shows ' + term);
    const row = json("Thresholds.get('calc.ofdm.bandwidth')");
    for (const value of [row.source, row.revision, row.locator, row.conditions]) assert(s.textContent.includes(value), 'sheet text includes ' + value.slice(0, 40));
    assert(s.textContent.includes(json('Thresholds.LABEL_INFO').expert.help), 'derived restatement label explanation');
    s.querySelector('button.primary[data-source-close]').click(); await flush();
    assert.equal(sheet(), null, 'closed');
    assert.equal(d.activeElement, tag, 'focus returns to the tag');
  });

  await check('Escape closes the sheet, a second tag replaces the first, and unverified rows carry a caution', async () => {
    ev("WorkflowUI.go('limits')");
    d.querySelector('#limitsList [data-threshold="app.power.resistanceAlpha"]').click(); await flush();
    assert.match(sheet().querySelector('.status.warning').textContent, /Not verified/);
    ev('Thresholds.close()'); await flush();
    d.querySelector('#limitsList [data-threshold="app.cable.temperatureCoefficient"]').click(); await flush();
    assert.match(sheet().querySelector('.status.warning').textContent, /secondary source/, 'pocket-guide trace is secondary');
    assert.match(sheet().textContent, /MX0398 Rev U \(2021\), read from an indexed copy/);
    assert(sheet().textContent.includes('0.1 % per °F'), 'value with units');
    ev("Thresholds.open('calc.ripple.distance')"); await flush();
    assert.equal(d.querySelectorAll('dialog.source-sheet').length, 1, 'one sheet at a time');
    assert.equal(sheet().dataset.sheetFor, 'calc.ripple.distance');
    sheet().dispatchEvent(new w.Event('cancel', { cancelable: true })); await flush();
    assert.equal(sheet(), null, 'Escape (cancel) closes the sheet');
  });

  await check('A company tag shows Unknown until entered and links to the screen where it is edited', async () => {
    ev("state.project=projectDefaults();WorkflowUI.go('limits')");
    d.querySelector('#limitsList [data-threshold="company.profile.fTiltTol"]').click(); await flush();
    assert(sheet().textContent.includes('Unknown — not entered'));
    assert.match(sheet().textContent, /Entered by a person/);
    const edit = sheet().querySelector('[data-task="records"]');
    assert(edit, 'edit link');
    edit.click(); await flush(); await flush();
    assert.equal(sheet(), null, 'sheet closes on navigation');
    assert.equal(ev('WorkflowUI.current()'), 'records', 'opens Job → Acceptance');
  });

  await check('The open Limits list follows a replaced job, and the sheet closes from the backdrop but not from its own padding', async () => {
    ev("state.project=projectDefaults();__selected().fLevelTol='2';WorkflowUI.go('limits')");
    const shown = () => d.querySelector('#limitsList [data-threshold="company.profile.fLevelTol"]').closest('li').querySelector('.limits-value').textContent;
    assert.equal(shown(), '± 2 dB');
    const next = json('state'); next.project = json('projectDefaults()'); next.project.profiles.find(p => p.id === next.project.selectedProfile).fLevelTol = '0.75';
    ev('loadState(' + JSON.stringify(next) + ')'); await flush();
    assert.equal(ev('WorkflowUI.current()'), 'limits');
    assert.equal(shown(), '± 0.75 dB', 'Limits re-renders after the job is replaced');
    ev("Thresholds.open('calc.ofdm.bandwidth')"); await flush();
    const dlg = sheet(); dlg.getBoundingClientRect = () => ({ left: 10, top: 10, right: 300, bottom: 400, width: 290, height: 390 });
    dlg.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 })); await flush();
    assert(sheet(), 'a tap on the sheet padding keeps it open');
    dlg.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 330, clientY: 500 })); await flush();
    assert.equal(sheet(), null, 'a tap on the backdrop closes it');
  });

  await check('Night-log entry cap is an Unknown application guard with a separate source button and unchanged boundary', async () => {
    const row=json("Thresholds.get('nightLog.entries.max')");assert(row,'night-log cap has a registry row');
    assert.equal(row.label,'unknown');assert.equal(row.kind,'limit');assert.equal(row.value,200);assert.equal(row.units,'entries/job');assert.equal(row.verification,'unverified');
    assert.match(row.source,/night-log\.js.*application guard/i);assert.match(row.locator,/validate.*addEntry/);assert.match(row.conditions,/not.*RF.*company/i);assert.match(row.revision,/build 3/i);assert.match(row.date,/^\d{4}-\d{2}-\d{2}$/);
    const before=json('state'),saved=w.localStorage.getItem('hfc-route-v1');ev("WorkflowUI.go('nightLog')");
    const source=d.querySelector('#nightLogPanel [data-threshold="nightLog.entries.max"]');assert(source);assert.equal(source.textContent,'Unknown');assert.equal(source.closest('label'),null);assert.equal(d.querySelectorAll('#nightLogPanel label [data-threshold]').length,0);
    assert.equal(w.getComputedStyle(source).minHeight,'44px');source.click();await flush();assert.equal(sheet().dataset.sheetFor,row.id);assert.match(sheet().textContent,/200 entries\/job/);assert.match(sheet().textContent,/application guard/);ev('Thresholds.close()');
    ev("WorkflowUI.go('limits');Thresholds.setFilter('unknown')");assert([...d.querySelectorAll('#limitsList h3')].some(el=>el.textContent==='Night log application guards'));assert(d.querySelector('#limitsList [data-threshold="nightLog.entries.max"]'));ev("Thresholds.setFilter('all')");
    const boundary=json(`(()=>{const owner={setup:{},rows:[]};for(let i=0;i<200;i++)NightLog.addEntry({action:'SYNTH '+i},owner);NightLog.validate(owner.nightLog);const original=JSON.stringify(owner);let error='',importError='';try{NightLog.addEntry({action:'extra'},owner);}catch(e){error=e.message;}const incoming=JSON.parse(JSON.stringify(owner.nightLog));incoming.entries.push({...incoming.entries[0],id:'log_extra'});try{NightLog.validate(incoming);}catch(e){importError=e.message;}return {count:owner.nightLog.entries.length,unchanged:JSON.stringify(owner)===original,error,importError};})()`);
    assert.equal(boundary.count,row.value);assert.equal(boundary.unchanged,true);assert.match(boundary.error,/maximum is 200 entries/);assert.match(boundary.importError,/maximum 200/);assert.deepEqual(json('state'),before);assert.equal(w.localStorage.getItem('hfc-route-v1'),saved);
  });

  await check('Opening the registry and its sheets does not change the job or write storage', async () => {
    const before = json('state'), saved = w.localStorage.getItem('hfc-route-v1'), keys = Object.keys(w.localStorage).sort();
    ev("WorkflowUI.go('limits')");
    for (const t of tagsIn(d.getElementById('limitsList')).slice(0, 8)) { t.click(); await flush(); ev('Thresholds.close()'); }
    d.querySelector('[data-limits-filter="spec"]').click();
    assert.deepEqual(json('state'), before, 'job state unchanged');
    assert.equal(w.localStorage.getItem('hfc-route-v1'), saved, 'autosave untouched');
    assert.deepEqual(Object.keys(w.localStorage).sort(), keys, 'no new storage keys');
  });

  fs.writeFileSync('qa/build3-registry-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, rows: rows().length, cases, scope: 'JSDOM registry structure, tag resolution across rendered screens, source sheet and company-value resolution. No browser pixel or device claim.' }, null, 2) + '\n');
  console.log(`Build3 registry: ${cases.length} checks passed`);
})().catch(error => { console.error(error); process.exit(1); });
