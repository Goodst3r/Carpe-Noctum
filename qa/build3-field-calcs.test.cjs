/* Build 3 field calculators (build list item 4): app output against independent decimal references and the DOM. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const reference = JSON.parse(fs.readFileSync('research/build3/field-calcs-reference.json', 'utf8'));
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
const call = (fn, args) => json(`FieldCalc.${fn}(${args.map(a => JSON.stringify(a)).join(',')})`);
function close(actual, expected, label, rel = 1e-12) {
  const e = Number(expected);
  assert(Number.isFinite(actual), label + ' is finite');
  assert(Math.abs(actual - e) <= Math.max(1e-12, Math.abs(e) * rel), `${label}: app ${actual} vs reference ${expected}`);
}
function set(selector, value, type = 'input') { const el = d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new w.Event(type, { bubbles: true })); return el; }
function words(el) { const out = [], walk = d.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const result = id => words(d.getElementById('calc-' + id + '-result'));
const conversionContext = { flatPSD: true, bandwidthUnits: 'MHz', restatementOnly: true };
let comparisons = 0;

(async () => {
  await flush();
  await check('Speed-of-light constant matches the independent 50-digit value and SCTE 293-2 ft/s figure', () => {
    close(ev('FieldCalc.C_FT_PER_US'), reference.constants.c_ft_per_us, 'c ft/us', 1e-15);
    close(ev('FieldCalc.C_FT_PER_NS') * 1e9, 983571056.43, 'c ft/s (SCTE 293-2 2024 section 4.1)', 1e-11);
    close(1 / ev('FieldCalc.C_FT_PER_NS'), reference.constants.ns_per_ft_vacuum, 'ns per ft', 1e-15);
    comparisons += 3;
  });

  await check('dB converter matches independent decimal references at 75 Ω and 50 Ω', () => {
    for (const c of reference.cases.level) {
      const r = call('convertLevel', c.input);
      assert.equal(r.ok, true, JSON.stringify(c.input));
      for (const key of ['dBmV', 'dBm', 'dBuV', 'mV', 'mW', 'offset']) { close(r[key], c.expected[key], `${c.input.join(' ')} ${key}`, 1e-11); comparisons++; }
    }
  });

  await check('Ripple, pre-EQ tap, OFDM power and echo delay match independent decimal references', () => {
    for (const c of reference.cases.ripple) { const r = call('rippleDistance', c.input); assert(r.ok); close(r.feet, c.expected.feet, 'ripple ' + c.input); comparisons++; }
    for (const c of reference.cases.preeq) { const r = call('preEqDistance', c.input); assert(r.ok, JSON.stringify(c.input)); for (const k of ['perTap', 'feet', 'low', 'high']) { close(r[k], c.expected[k], 'preeq ' + c.input + ' ' + k); comparisons++; } }
    for (const c of reference.cases.ofdm) { const r = call('ofdmPower', [...c.input, conversionContext]); assert(r.ok); for (const k of ['total', 'per6', 'per24', 'per1_6']) { close(r[k], c.expected[k], 'ofdm ' + c.input + ' ' + k, 1e-13); comparisons++; } }
    for (const c of reference.cases.echo) { const r = call('echoDelay', c.input); assert(r.ok); close(r.ns, c.expected.ns, 'echo ' + c.input); comparisons++; }
  });

  await check('Published worked numbers reproduce at their stated rounding', () => {
    const fns = { ripple: 'rippleDistance', preeq: 'preEqDistance', ofdm: 'ofdmPower', echo: 'echoDelay', level: 'convertLevel' };
    for (const p of reference.published) {
      const r = call(fns[p.calc], p.calc === 'ofdm' ? [...p.input, conversionContext] : p.input);
      assert.equal(Number(r[p.field].toFixed(p.digits)), p.value, `${p.source}: ${p.calc} ${p.input} → ${r[p.field]}`);
      comparisons++;
    }
  });

  await check('Invalid or missing inputs give a reason and no number; nothing defaults to zero', () => {
    const bad = [
      ['convertLevel', ['', 'dBmV', 75], /Enter a level/], ['convertLevel', [0, 'mV', 75], /above 0 mV/], ['convertLevel', [-1, 'mW', 75], /above 0 mW/],
      ['convertLevel', [10, 'dBmV', 60], /75 Ω or 50 Ω/], ['convertLevel', [10, 'volts', 75], /Choose a unit/], ['convertLevel', [999, 'dBmV', 75], /±200 dBmV/],
      ['rippleDistance', [0, 0.87], /above 0/], ['rippleDistance', [6, 87], /not a percent/], ['rippleDistance', [6, 0.3], /0\.50 to 1\.00/], ['rippleDistance', [6, ''], /velocity of propagation/],
      ['preEqDistance', [8, 8, 5.12, 0.87], /after the main tap/], ['preEqDistance', [3, 8, 5.12, 0.87], /after the main tap/], ['preEqDistance', [25, 8, 5.12, 0.87], /1 to 24/],
      ['preEqDistance', [9.5, 8, 5.12, 0.87], /whole number/], ['preEqDistance', [9, 0, 5.12, 0.87], /main tap/], ['preEqDistance', [9, 8, 0.64, 0.87], /symbol rate/], ['preEqDistance', [9, 8, 5.12, ''], /velocity/],
      ['ofdmPower', ['', 6, 192], /measured power/], ['ofdmPower', [42, 0, 192], /measured in/], ['ofdmPower', [42, 6, -1], /occupied bandwidth/], ['ofdmPower', [42, 6, 5000], /2,000 MHz/],
      ['rippleDistance', ['1e-320', 0.87], /more than 100,000 ft/], ['rippleDistance', ['0.0001', 0.87], /more than 100,000 ft/],
      ['ofdmPower', [42, 6, '5e-324'], /outside ±200 dBmV/], ['ofdmPower', [42, 6, '1e-300'], /outside ±200 dBmV/],
      ['echoDelay', [0, 0.87], /above 0/], ['echoDelay', [100, 1.2], /0\.50 to 1\.00/], ['echoDelay', ['abc', 0.87], /length/],
    ];
    for (const [fn, args, pattern] of bad) {
      const r = call(fn, fn === 'ofdmPower' ? [...args, conversionContext] : args);
      assert.equal(r.ok, false, `${fn}(${args}) should fail`);
      assert.match(r.error, pattern, `${fn}(${args})`);
      assert.deepEqual(Object.keys(r).sort(), ['error', 'ok'], 'no partial numbers');
    }
    assert.deepEqual(json('FieldCalc.SYMBOL_RATES'), [5.12, 2.56, 1.28], 'only the verified DOCSIS 3.0 CM upstream rates');
  });

  await check('Calculators live under Test, each card carries a resolving source tag, and the panel starts with prompts', () => {
    ev("WorkflowUI.go('calculators')");
    const tabs = [...d.querySelectorAll('#taskTabs button')].map(b => b.textContent);
    assert.equal(tabs[tabs.indexOf('Calculators') + 1], 'Frequency', 'Calculators and Frequency are neighbours in Tools');
    assert.equal(d.querySelector('#taskTabs [aria-selected="true"]').textContent, 'Calculators');
    assert.equal(d.querySelector('#screenTitle .eyebrow').textContent, 'Tools');
    assert.equal(d.getElementById('calculatorPanel').hidden, false);
    const cards = [...d.querySelectorAll('[data-calc-card]')].map(c => c.dataset.calcCard);
    assert.deepEqual(cards, ['db', 'ripple', 'preeq', 'ofdm', 'power', 'cascade', 'balance', 'echo']);
    const expected = { db: 'calc.db.dbm', ripple: 'calc.ripple.distance', preeq: 'calc.preeq.tapDistance', ofdm: 'calc.ofdm.bandwidth', power: 'calc.power.sum', cascade: 'calc.cascade.cnr', balance: 'calc.alignment.balance', echo: 'calc.microreflection.delay' };
    for (const [id, threshold] of Object.entries(expected)) {
      const tag = d.querySelector(`[data-calc-card="${id}"] .calc-card-head [data-threshold]`);
      assert.equal(tag.dataset.threshold, threshold, id + ' tag');
      assert.equal(tag.dataset.label, json(`Thresholds.get('${threshold}').label`));
      assert.match(result(id), /Enter values to calculate/, id + ' prompt');
      assert.equal(d.getElementById('calc-' + id + '-result').getAttribute('role'), 'status');
    }
  });

  await check('Typing values shows the same numbers the engine computes, with the arithmetic', () => {
    set('[data-calc="db"][data-field="value"]', '10');
    assert.match(result('db'), /dBmV 10\.00 dBm -38\.75 dBµV 70\.00 mV 3\.162 mW 0\.0001333/);
    set('[data-calc="db"][data-field="value"]', '48.75');
    assert.match(result('db'), /dBm 0\.00 /, 'no negative zero at the 48.75 dB identity');
    assert(!/-0\.00/.test(result('db')));
    set('[data-calc="db"][data-field="value"]', '10');
    set('[data-calc="db"][data-field="ohms"]', '50', 'change');
    assert.match(result('db'), /dBm -36\.99/);
    assert.match(result('db'), /At 50 Ω, dBm = dBmV − 46\.99 dB/);
    set('[data-calc="db"][data-field="unit"]', 'dBm', 'change');
    assert.match(result('db'), /dBmV 56\.99/);
    set('[data-calc="ripple"][data-field="spacing"]', '6'); set('[data-calc="ripple"][data-field="vp"]', '0.87');
    assert.match(result('ripple'), /Distance between mismatches 71\.3 ft/);
    assert.match(result('ripple'), /491\.8 × 0\.87 ÷ 6 MHz = 71\.3 ft/);
    set('[data-calc="preeq"][data-field="tap"]', '10'); set('[data-calc="preeq"][data-field="vp"]', '0.87');
    assert.match(result('preeq'), /Spacing between mismatches 167\.1 ft Range \(±½ tap\) 125\.3–208\.9 ft Per tap 83\.6 ft/);
    assert.match(result('preeq'), /2 taps after the main tap/);
    set('[data-calc="preeq"][data-field="rate"]', '2.56', 'change');
    assert.match(result('preeq'), /Per tap 167\.1 ft/);
    set('[data-calc="ofdm"][data-field="context"]', 'confirmed', 'change'); set('[data-calc="ofdm"][data-field="power"]', '42'); set('[data-calc="ofdm"][data-field="occupied"]', '192');
    assert.match(result('ofdm'), /Restated over 192 MHz 57\.0515 dBmV Per 6 MHz 42\.00 dBmV Per 24 MHz 48\.02 dBmV Per 1\.6 MHz 36\.26 dBmV/);
    set('[data-calc="ofdm"][data-field="basis"]', '24', 'change');
    assert.match(result('ofdm'), /Per 6 MHz 35\.98 dBmV/);
    set('[data-calc="echo"][data-field="length"]', '100'); set('[data-calc="echo"][data-field="vp"]', '0.87');
    assert.match(result('echo'), /Round-trip delay 233\.7 ns/);
  });

  await check('Bad input in the screen shows a reason, not a zero, and clearing returns to the prompt', () => {
    set('[data-calc="ripple"][data-field="vp"]', '87');
    assert.match(result('ripple'), /not a percent/);
    assert(!/\d+\.\d ft/.test(result('ripple')), 'no distance shown');
    assert(d.getElementById('calc-ripple-result').classList.contains('error'));
    set('[data-calc="preeq"][data-field="tap"]', '7');
    assert.match(result('preeq'), /after the main tap/);
    set('[data-calc="db"][data-field="unit"]', 'mV', 'change'); set('[data-calc="db"][data-field="value"]', '0');
    assert.match(result('db'), /above 0 mV/);
    set('[data-calc="db"][data-field="value"]', '');
    assert.match(result('db'), /Enter values to calculate/);
    assert(!d.getElementById('calc-db-result').classList.contains('error'));
  });

  await check('Catalog cables with a published VP fill the VP field and say where it came from; a manual edit says so', () => {
    const cables = json('catalog.cables.filter(c=>Number(c.nvpPercent)>0).map(c=>[c.id,c.nvpPercent])');
    assert(cables.length >= 1, 'catalog VP entries');
    const select = d.querySelector('[data-calc-vp-source="echo"]');
    assert.deepEqual([...select.options].slice(1).map(o => o.value), cables.map(c => c[0]), 'only cables that list a VP');
    set('[data-calc-vp-source="echo"]', 'commscope_rg6', 'change');
    assert.equal(d.querySelector('[data-calc="echo"][data-field="vp"]').value, '0.85');
    assert.match(d.querySelector('[data-calc-vp-note="echo"]').textContent, /Catalog VP for CommScope Series 6 drop \/ RG6: nominal 85%/);
    assert.match(result('echo'), /Round-trip delay 239\.2 ns/);
    set('[data-calc="echo"][data-field="vp"]', '0.82');
    assert.equal(select.value, '', 'manual VP clears the catalog choice');
    assert.equal(d.querySelector('[data-calc-vp-note="echo"]').textContent, 'Entered VP.');
  });

  await check('Calculators never change the job, its autosave or the registry', () => {
    const before = json('state'), saved = w.localStorage.getItem('hfc-route-v1'), keys = Object.keys(w.localStorage).sort(), rows = json('Thresholds.rows');
    set('[data-calc="ofdm"][data-field="occupied"]', '96'); set('[data-calc="echo"][data-field="length"]', '250');
    set('[data-calc-vp-source="ripple"]', 'mc2_440', 'change');
    assert.deepEqual(json('state'), before);
    assert.equal(w.localStorage.getItem('hfc-route-v1'), saved);
    assert.deepEqual(Object.keys(w.localStorage).sort(), keys);
    assert.deepEqual(json('Thresholds.rows'), rows);
  });

  fs.writeFileSync('qa/build3-field-calcs-results.json', JSON.stringify({ version: '2.0 Alpha build 4', count: cases.length, referenceComparisons: comparisons, cases, scope: 'App FieldCalc output against independent 50-digit decimal references and published worked numbers; JSDOM screen behavior. Arithmetic only; no field acceptance, meter or modem data.' }, null, 2) + '\n');
  console.log(`Build3 field calculators: ${cases.length} checks passed (${comparisons} reference comparisons)`);
})().catch(error => { console.error(error); process.exit(1); });
