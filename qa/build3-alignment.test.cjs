/* Build 3 tilt / EQ / pad solver (build list item 2): engine logic, sourced profiles and the screen. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [], errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => true; w.print = () => {}; w.structuredClone = structuredClone;
  w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
} });
const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); assert.deepEqual(errors, [], 'runtime errors'); cases.push(name); console.log('PASS ' + name); }
const solve = (input, options) => json(`Alignment.solve(${JSON.stringify(input)},${JSON.stringify(options || {})})`);
const near = (a, b, label, tol = 1e-9) => assert(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
function words(el) { const out = [], walk = d.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
function set(selector, value, type = 'input') { const el = d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new w.Event(type, { bubbles: true })); return el; }

// TEST FIXTURE ONLY, not equipment data: an ideal square-root-frequency EQ family and 1 dB pads.
const sq = Math.sqrt, shape = f => 1 - (sq(f) - sq(54)) / (sq(1002) - sq(54));
const SYNTH = { id: 'test-fixture', title: 'Synthetic test fixture', equipmentIds: ['test-only'], source: 'test', revision: 'test', locator: 'test', sourceStatus: 'synthetic-test-fixture', reviewedAt: '2026-11-11',
  pads: { values: Array.from({ length: 21 }, (_, i) => i) },
  eqs: { axis: 'sqrt', items: [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12].map(v => ({ value: v, points: [54, 550, 1002].map(f => [f, Number((1 + v * shape(f)).toFixed(6))]) })) } };
const base = { lowMHz: 54, highMHz: 1002, targetLow: 35, targetHigh: 46 };

(async () => {
  await flush();
  await check('Readings are validated; missing or impossible input gives a reason, never numbers', () => {
    const bad = [[{ ...base, measuredLow: '', measuredHigh: 45 }, /readings at both pilots/], [{ ...base, lowMHz: 860, highMHz: 54, measuredLow: 30, measuredHigh: 40 }, /5 ≤ low < high/],
      [{ ...base, highMHz: 1900, measuredLow: 30, measuredHigh: 40 }, /1,800 MHz/], [{ ...base, targetHigh: '', measuredLow: 30, measuredHigh: 40 }, /targets at both pilots/],
      [{ ...base, measuredLow: 30, measuredHigh: 400 }, /±200 dBmV/], [{ lowMHz: '', highMHz: 860, measuredLow: 1, measuredHigh: 2, targetLow: 1, targetHigh: 2 }, /both pilot frequencies/]];
    for (const [input, pattern] of bad) { const r = solve(input); assert.equal(r.ok, false); assert.match(r.error, pattern); assert.deepEqual(Object.keys(r).sort(), ['error', 'ok']); }
  });

  await check('Errors and directions follow the manual: low tilt means a larger input EQ, a high level means more input pad', () => {
    const r = solve({ ...base, measuredLow: 38, measuredHigh: 45 });
    near(r.errorLow, 3, 'low error'); near(r.errorHigh, -1, 'high error'); near(r.tiltMeasured, 7, 'tilt'); near(r.tiltTarget, 11, 'target tilt'); near(r.tiltError, -4, 'tilt error');
    assert.match(r.guidance.eq, /4\.0 dB low: use a larger input EQ/); assert.match(r.guidance.pad, /1\.0 dB low: use about 1\.0 dB less input pad/);
    const h = solve({ ...base, measuredLow: 30, measuredHigh: 47.5 });
    assert.match(h.guidance.eq, /6\.5 dB high: use a smaller input EQ/); assert.match(h.guidance.pad, /1\.5 dB high: use about 1\.5 dB more input pad/);
    const ok = solve({ ...base, measuredLow: 35.02, measuredHigh: 46.03 });
    assert.match(ok.guidance.eq, /matches the target/); assert.match(ok.guidance.pad, /matches its target/);
    assert.equal(solve({ ...base, measuredLow: 35, measuredHigh: 46 }).catalog.ok, false, 'no profile, no part values');
  });

  await check('Synthetic fixture: flat, high-tilt and low-level cases pick EQ for tilt first, then the pad at the high pilot', () => {
    const flat = solve({ ...base, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog;
    assert.deepEqual([flat.eq.from, flat.eq.to, flat.pad.from, flat.pad.to], [4.5, 4.5, 3, 3]); near(flat.leftover.tilt, 0, 'flat'); near(flat.leftover.high, 0, 'flat high');
    const highTilt = solve({ ...base, measuredLow: 30, measuredHigh: 47.2 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog;
    assert.deepEqual([highTilt.eq.to, highTilt.pad.to], [0, 4]); near(highTilt.pad.ideal, 4.2, 'ideal pad');
    near(highTilt.after.low, 33.5, 'low after'); near(highTilt.after.high, 46.2, 'high after'); near(highTilt.after.tilt, 12.7, 'tilt after'); near(highTilt.leftover.tilt, 1.7, 'tilt left at the smallest EQ');
    assert(highTilt.notes.some(n => /smallest charted EQ is in and tilt is still 1\.7 dB high\.$/.test(n)), 'no uncharted-part sentence for a profile without one');
    const lowLevel = solve({ ...base, measuredLow: 31, measuredHigh: 42 }, { profile: SYNTH, pad: 6, eq: 4.5 }).catalog;
    assert.deepEqual([lowLevel.eq.to, lowLevel.pad.to], [4.5, 2]); near(lowLevel.after.low, 35, 'low after'); near(lowLevel.after.high, 46, 'high after');
    const starved = solve({ ...base, measuredLow: 30, measuredHigh: 40 }, { profile: SYNTH, pad: 0, eq: 4.5 }).catalog;
    assert.equal(starved.pad.to, 0); assert(starved.notes.some(n => /smallest value and the high pilot is still 6\.0 dB low/.test(n)));
  });

  await check('Ties prefer the EQ nearest the installed one and the larger pad; picks never leave the sourced lists', () => {
    const tie = solve({ ...base, measuredLow: 35, measuredHigh: 46.5 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog;
    assert.equal(tie.pad.to, 4, 'half-way pad takes the larger value'); near(tie.pad.ideal, 3.5, 'ideal pad');
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pads = SYNTH.pads.values, eqs = SYNTH.eqs.items.map(e => e.value);
    for (let i = 0; i < 300; i++) {
      const input = { lowMHz: 54, highMHz: [550, 1002][i % 2], measuredLow: 20 + rnd() * 30, measuredHigh: 20 + rnd() * 30, targetLow: 25 + rnd() * 15, targetHigh: 35 + rnd() * 15 };
      const c = solve(input, { profile: SYNTH, pad: pads[i % pads.length], eq: eqs[i % eqs.length] }).catalog;
      assert(c.ok && pads.includes(c.pad.to) && eqs.includes(c.eq.to), 'pick inside sourced lists');
      near(c.after.high - c.after.low - (input.targetHigh - input.targetLow), c.leftover.tilt, 'leftover tilt is consistent', 1e-9);
    }
  });

  await check('No pick outside published EQ frequencies, for an uninstalled value, or with interpolation hidden', () => {
    assert.match(solve({ ...base, highMHz: 1218, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog.error, /does not cover both pilots/);
    assert.match(solve({ ...base, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 2.5, eq: 4.5 }).catalog.error, /input pad that is installed/);
    assert.match(solve({ ...base, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 3, eq: 5 }).catalog.error, /input EQ that is installed/);
    assert.equal(solve({ ...base, highMHz: 860, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog.interpolated, true);
    assert.equal(solve({ ...base, highMHz: 550, measuredLow: 35, measuredHigh: 46 }, { profile: SYNTH, pad: 3, eq: 4.5 }).catalog.interpolated, false);
    assert.deepEqual(json(`Alignment.checkProfile(${JSON.stringify(SYNTH)})`), []);
    assert(json(`Alignment.checkProfile(${JSON.stringify({ ...SYNTH, pads: { values: [0, 2, 1] } })})`).includes('pads must be ascending nonnegative numbers'));
  });

  await check('Every sourced profile passes its structure check, names real non-retired actives and keeps its provenance', () => {
    const profiles = json('Alignment.PROFILES'), actives = json('catalog.devices.filter(d=>d.active).map(d=>[d.id,!!d.retired])');
    for (const p of profiles) {
      assert.deepEqual(json(`Alignment.checkProfile(Alignment.PROFILES.find(p=>p.id===${JSON.stringify(p.id)}))`), [], p.id);
      for (const id of p.equipmentIds) { const a = actives.find(x => x[0] === id); assert(a, p.id + ' names catalog active ' + id); assert.equal(a[1], false, id + ' is not retired'); }
      assert(/^(manufacturer-primary|manufacturer-mirror)$/.test(p.sourceStatus), p.id + ' source status');
    }
    const ids = profiles.flatMap(p => p.equipmentIds); assert.equal(new Set(ids).size, ids.length, 'one profile per model');
  });

  await check('GainMaker hand-worked cases match the LibreOffice-recalculated spreadsheet: balanced, high tilt and low level per family', () => {
    const sheet = JSON.parse(fs.readFileSync('research/build3/alignment-spreadsheet-results.json', 'utf8')).results;
    const handCases = JSON.parse(fs.readFileSync('research/build3/alignment-cases.json', 'utf8')).cases;
    const kinds = {};
    for (const c of handCases) {
      const s = sheet.find(x => x.id === c.id); assert(s, 'spreadsheet row ' + c.id);
      assert.equal(ev(`Alignment.profileFor(${JSON.stringify(c.model)})?.id`), c.profile, c.id + ' model uses its profile');
      const r = json(`Alignment.solve(${JSON.stringify(c)},{profile:Alignment.profileFor(${JSON.stringify(c.model)}),pad:${c.pad},eq:${c.eq}})`), k = r.catalog;
      assert(k.ok, c.id + ' picks');
      assert.equal(k.eq.to, s.eq, c.id + ' EQ pick'); assert.equal(k.pad.to, s.pad, c.id + ' pad pick');
      const pairs = [[r.tiltMeasured, s.tiltMeasured], [r.tiltTarget, s.tiltTarget], [-k.eq.changeLow, s.eqChangeLow], [-k.eq.changeHigh, s.eqChangeHigh], [k.pad.ideal, s.idealPad], [k.after.low, s.afterLow], [k.after.high, s.afterHigh], [k.after.tilt, s.afterTilt], [k.leftover.low, s.leftLow], [k.leftover.high, s.leftHigh], [k.leftover.tilt, s.leftTilt]];
      pairs.forEach(([app, cell], i) => near(app, cell, `${c.id} value ${i}`, 1e-9));
      (kinds[c.profile] = kinds[c.profile] || new Set()).add(c.kind);
    }
    for (const [profile, set] of Object.entries(kinds)) assert.deepEqual([...set].sort(), ['balanced', 'high tilt', 'low level'], profile + ' has the three build-list cases');
    assert.equal(Object.keys(kinds).length, 2, 'system amplifier and line extender families');
  });

  await check('GainMaker profiles keep the published table, refuse the 86–550 MHz gap and explain the uncharted 0 dB jumper', () => {
    const p = json("Alignment.profileFor('active_gm_hgd')");
    assert.equal(p.pads.values.length, 42); assert.equal(p.pads.values[0], 0); assert.equal(p.pads.values.at(-1), 20.5);
    assert.deepEqual(p.eqs.items.map(e => e.value), Array.from({ length: 20 }, (_, i) => (i + 1) * 1.5));
    for (const e of p.eqs.items) { const l = Object.fromEntries(e.points); near(l[52] - l[1000], e.value * 0.8, 'total tilt 52–1000 MHz is 0.8 × EQ value in the published chart', 1e-9); }
    assert.deepEqual(p.eqs.items.find(e => e.value === 9).points, [[52, 8.2], [70, 7.9], [86, 7.7], [550, 3.6], [600, 3.3], [650, 3], [750, 2.4], [870, 1.7], [1000, 1], [1002, 1]]);
    for (const e of p.eqs.items) assert.equal(e.points.at(-1)[1], e.points.at(-2)[1], 'the 1002 MHz point repeats the 1000 MHz column (716336 heads it 1002)');
    const gm = { lowMHz: 54, highMHz: 860, measuredLow: 39, measuredHigh: 49, targetLow: 39, targetHigh: 49 };
    assert.match(json(`Alignment.solve(${JSON.stringify({ ...gm, lowMHz: 300 })},{profile:Alignment.profileFor('active_gm_hgd'),pad:6,eq:9})`).catalog.error, /wide gap/);
    assert.equal(json(`Alignment.solve(${JSON.stringify({ ...gm, highMHz: 1002 })},{profile:Alignment.profileFor('active_gm_hgd'),pad:6,eq:9})`).catalog.ok, true, '1002 MHz is a published column');
    assert.match(json(`Alignment.solve(${JSON.stringify({ ...gm, highMHz: 1003 })},{profile:Alignment.profileFor('active_gm_hgd'),pad:6,eq:9})`).catalog.error, /does not cover both pilots/);
    assert.match(json(`Alignment.solve(${JSON.stringify(gm)},{profile:Alignment.profileFor('active_gm_lgd_65'),pad:6,eq:9,forwardBand:[86,1002]})`).error, /forward band, 86–1002 MHz/, 'no 54 MHz pilot on a 65/86 amplifier');
    const low = json(`Alignment.solve(${JSON.stringify({ ...gm, measuredLow: 37 })},{profile:Alignment.profileFor('active_gm_hgd'),pad:6,eq:1.5})`).catalog;
    assert(low.notes.some(n => /smallest charted EQ is in and tilt is still 2\.0 dB high\. The procedure’s next steps, the 0 dB jumper or a forward inverse EQ/.test(n)));
    assert.match(json(`Alignment.solve(${JSON.stringify(gm)},{profile:Alignment.profileFor('active_gm_le_agc'),pad:6,eq:0})`).catalog.error, /0 dB forward EQ jumper \(4007228\) has no published loss chart/);
    assert.equal(ev("Alignment.profileFor('active_gm_ubt_main')"), null, 'retired UBT gets no profile');
    assert(p.gaps.some(g => /inverse EQs/.test(g)) && p.gaps.some(g => /870 MHz forward EQs/.test(g)));
  });

  await check('Advice is worded from the pick: balanced cases keep their parts, and the pad advice follows the post-EQ level', () => {
    const solveCase = c => json(`Alignment.solve(${JSON.stringify(c)},{profile:Alignment.profileFor(${JSON.stringify(c.model)}),pad:${c.pad},eq:${c.eq}})`).catalog;
    const hand = JSON.parse(fs.readFileSync('research/build3/alignment-cases.json', 'utf8')).cases;
    for (const c of hand) {
      const k = solveCase(c);
      if (k.eq.to === k.eq.from) assert.match(k.advice.eq, /^Keep the installed .* input EQ/, c.id); else assert.match(k.advice.eq, /^Change the input EQ from/, c.id);
      if (k.pad.to === k.pad.from) assert.match(k.advice.pad, /keep the installed .* input pad\.$/, c.id); else assert.match(k.advice.pad, new RegExp(`change the input pad from ${k.pad.from} to ${k.pad.to} dB\\.$`), c.id);
      assert.equal(k.advice.inWindow, true, c.id + ' lands inside the ±0.5 dB procedure window');
    }
    const crossed = solveCase({ model: 'active_gm_hgd', lowMHz: 54, highMHz: 860, measuredLow: 45.4, measuredHigh: 49.4, targetLow: 39, targetHigh: 49, pad: 6, eq: 9 });
    assert.equal(crossed.eq.to, 18); assert.equal(crossed.pad.to, 5.5);
    assert.match(crossed.advice.pad, /After the EQ change the high pilot is predicted 0\.4 dB low: change the input pad from 6 to 5\.5 dB\./, 'pad advice and pick agree');
    assert.match(crossed.advice.windowSource, /OL-31156-01 pp\.54–55/);
  });

  await check('Every selectable model gets either sourced GainMaker values or an AOI method note, never both', () => {
    const ids = json('catalog.devices.filter(d=>d.active&&!d.retired).map(d=>d.id)');
    for (const id of ids) {
      const profile = ev(`!!Alignment.profileFor(${JSON.stringify(id)})`), note = ev(`!!Alignment.noteFor(${JSON.stringify(id)})`);
      assert.notEqual(profile, note, id + ' has exactly one of profile or note');
      if (/^active_aoi_/.test(id)) assert(note, id + ' Quantum18 uses a method note');
      if (/^active_gm_/.test(id)) assert(profile, id + ' GainMaker uses sourced values');
    }
  });

  await check('The balance card picks GainMaker parts with their source, and gives Quantum18 its alignment note instead of part values', () => {
    ev("WorkflowUI.go('calculators')");
    const tag = d.querySelector('[data-calc-card="balance"] .calc-card-head [data-threshold]');
    assert.equal(tag.dataset.threshold, 'calc.alignment.balance'); assert.equal(tag.dataset.label, 'expert');
    const options = [...d.querySelectorAll('[data-calc="balance"][data-field="model"] option')].map(o => o.value).filter(Boolean);
    assert.deepEqual(options, json('catalog.devices.filter(d=>d.active&&!d.retired).map(d=>d.id)'), 'retired UBT stays out of new selections');
    set('[data-calc="balance"][data-field="model"]', 'active_aoi_hgd', 'change');
    assert.equal(d.querySelector('[data-balance-installed]').hidden, true);
    for (const [k, v] of Object.entries({ lowMHz: 261, highMHz: 993, measuredLow: 38, measuredHigh: 45, targetLow: 31, targetHigh: 43 })) set(`[data-calc="balance"][data-field="${k}"]`, String(v));
    let text = words(d.getElementById('calc-balance-result'));
    set('[data-calc="balance"][data-field="model"]', '', 'change');
    assert.match(words(d.getElementById('calc-balance-result')), /Choose the installed amplifier model to see how to correct it/); assert(!/input EQ|input pad/i.test(words(d.getElementById('calc-balance-result'))), 'no advice before a model is chosen');
    set('[data-calc="balance"][data-field="model"]', 'active_aoi_hgd', 'change');
    text = words(d.getElementById('calc-balance-result'));
    assert.match(text, /Low pilot vs target \+7\.0 dB High pilot vs target \+2\.0 dB Tilt now \/ target 7\.0 \/ 12\.0 dB/);
    assert.match(text, /align electronically/); assert(!/input EQ|input pad/i.test(text), 'no pad or EQ advice for an electronically aligned amp');
    assert.match(d.querySelector('[data-balance-source]').textContent, /V02102025/);
    set('[data-calc="balance"][data-field="model"]', 'active_aoi_ba', 'change'); set('[data-calc="balance"][data-field="measuredHigh"]', '45');
    text = words(d.getElementById('calc-balance-result'));
    assert.match(text, /The high pilot is 2\.0 dB high: a larger gain-adjust pad lowers it \(pads 0, 2, 4, 6 dB\)\./, 'BA keeps the pad direction in its real steps');
    set('[data-calc="balance"][data-field="measuredHigh"]', '43.5');
    assert.match(words(d.getElementById('calc-balance-result')), /within half a pad step \(1 dB\) of its target/);
    set('[data-calc="balance"][data-field="measuredHigh"]', '40');
    assert.match(words(d.getElementById('calc-balance-result')), /smaller gain-adjust pad raises it\. With the 0 dB pad fitted, check the input level instead/);
    assert.match(text, /2, 4 and 6 dB pads are stored in the lid/); assert(!/input EQ/.test(text), 'no EQ advice for the BA');
    const c = JSON.parse(fs.readFileSync('research/build3/alignment-cases.json', 'utf8')).cases.find(x => x.id === 'sa-high-tilt');
    set('[data-calc="balance"][data-field="model"]', 'active_gm_hgd', 'change');
    assert.equal(d.querySelector('[data-balance-installed]').hidden, false);
    assert.equal(d.querySelectorAll('[data-calc="balance"][data-field="pad"] option').length, 43);
    assert.equal(d.querySelectorAll('[data-calc="balance"][data-field="eq"] option').length, 22, 'placeholder, uncharted jumper and 20 charted EQs');
    for (const k of ['lowMHz', 'highMHz', 'measuredLow', 'measuredHigh', 'targetLow', 'targetHigh']) set(`[data-calc="balance"][data-field="${k}"]`, String(c[k]));
    text = words(d.getElementById('calc-balance-result'));
    assert.match(text, /Choose the input pad that is installed now/, 'no pick before the installed parts are chosen');
    set('[data-calc="balance"][data-field="pad"]', '6', 'change'); set('[data-calc="balance"][data-field="eq"]', '9', 'change');
    text = words(d.getElementById('calc-balance-result'));
    assert.match(text, /Change the input EQ from 9 to 4\.5 dB: tilt goes from 3\.2 dB high to 0\.1 dB low\. After the EQ change the high pilot is predicted 0\.9 dB high: change the input pad from 6 to 7 dB\./);
    assert.match(text, /Predicted inside the procedure’s ±0\.5 dB window for tilt and level/);
    assert(!/use a smaller input EQ/.test(text), 'no generic sentence beside a pick');
    assert.match(text, /Input EQ 9\.0 → 4\.5 dB Input pad 6\.0 → 7\.0 dB/);
    assert.match(text, /Low pilot 39\.0 \(0\.0\) dBmV High pilot 48\.9 \(-0\.1\) dBmV Tilt 9\.9 \(-0\.1\) dB/);
    assert.match(text, /interpolated between published frequencies/);
    assert.match(d.querySelector('[data-balance-source]').textContent, /OL-31156-01 \(February 2014\)/);
    assert.equal(d.querySelector('[data-balance-gaps]').hidden, false);
    set('[data-calc="balance"][data-field="eq"]', '0', 'change');
    assert.match(words(d.getElementById('calc-balance-result')), /no published loss chart/);
  });

  await check('Balance inputs never change the job or its autosave', () => {
    const before = json('state'), saved = w.localStorage.getItem('hfc-route-v1');
    set('[data-calc="balance"][data-field="measuredHigh"]', '44');
    assert.deepEqual(json('state'), before); assert.equal(w.localStorage.getItem('hfc-route-v1'), saved);
  });

  fs.writeFileSync('qa/build3-alignment-results.json', JSON.stringify({ version: '2.0 Alpha build 4', count: cases.length, cases, scope: 'Solver logic with a synthetic test fixture, sourced-profile structure and the calculator card in JSDOM. Not a field alignment.' }, null, 2) + '\n');
  console.log(`Build3 alignment: ${cases.length} checks passed`);
})().catch(error => { console.error(error); process.exit(1); });
