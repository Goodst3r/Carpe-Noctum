/* Build 3 supply PM notebook export and import. The notebook lives only on the device, and the new-key APK
   needs an uninstall, so it must leave and return intact. Import is all-or-nothing. */
'use strict';
const assert = require('node:assert/strict');
const { bootApp } = require('./build2-source-harness.cjs');
const cases = [];
let comparisons = 0;
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const KEY = 'nightsweep-power-pm-v1';

function ui(h) {
  const set = (id, value) => { const el = h.d.getElementById(id); el.value = value; el.dispatchEvent(new h.w.Event('input', { bubbles: true })); el.dispatchEvent(new h.w.Event('change', { bubbles: true })); };
  const click = id => h.d.getElementById(id).click();
  const status = () => h.d.getElementById('powerPmStatus').textContent;
  const importText = async text => {
    const input = h.d.getElementById('powerPmImportFile');
    Object.defineProperty(input, 'files', { configurable: true, value: [{ size: text.length, text: async () => text }] });
    input.dispatchEvent(new h.w.Event('change', { bubbles: true }));
    await flush(); await flush();
  };
  const saveVisit = (name, date, volts) => {
    set('powerPmName', name); set('powerPmDate', date); set('powerPmChemistry', 'vrla'); set('powerPmOutput', '89');
    set('powerPmBatterySlot', 'String A'); set('powerPmBatteryVolts', volts); click('powerPmAddBattery'); click('powerPmSave');
  };
  return { set, click, status, importText, saveVisit };
}
const stored = h => h.w.localStorage.getItem(KEY);
const goodFile = supplies => JSON.stringify({ kind: 'carpe-noctum-supply-pm-notebook', version: 1, supplies });
const visit = (over = {}) => ({ date: '2026-11-11', chemistry: 'vrla', inverter: '', alarms: '', inputVolts: '', outputVolts: 89, loadAmps: '', batteries: [{ slot: 'String A', volts: 13.2 }], spans: [], ...over });

(async () => {
  await check('A saved notebook exports and comes back unchanged with fresh ids', async () => {
    const h = bootApp(); await flush();
    const u = ui(h);
    let exported = null;
    h.w.download = (name, text, type) => { exported = { name, text, type }; };
    u.click('powerPmExport');
    assert.match(u.status(), /nothing to export/i);
    assert.equal(exported, null);
    u.saveVisit('PRACTICE supply', '2026-11-11', '13.2');
    u.saveVisit('PRACTICE supply', '2026-11-12', '12.9');
    const before = JSON.parse(stored(h));
    assert.equal(before.supplies.length, 1); assert.equal(before.supplies[0].visits.length, 2);
    const jobBefore = h.ev('localStorage.getItem("hfc-route-v1")');
    u.click('powerPmExport');
    assert.ok(exported, 'a file was offered');
    assert.equal(exported.type, 'application/json'); assert.match(exported.name, /Supply_PM_notebook\.json$/);
    const file = JSON.parse(exported.text);
    assert.equal(file.kind, 'carpe-noctum-supply-pm-notebook'); assert.equal(file.version, 1);
    assert.equal(file.supplies[0].visits.length, 2);
    h.w.localStorage.removeItem(KEY);
    await u.importText(exported.text);
    assert.match(u.status(), /Imported 1 supply/);
    const after = JSON.parse(stored(h));
    const strip = s => s.map(x => ({ name: x.name, visits: x.visits.map(({ id, ...rest }) => rest) }));
    assert.deepEqual(strip(after.supplies), strip(before.supplies)); comparisons++;
    assert.notEqual(after.supplies[0].id, before.supplies[0].id);
    assert.equal(h.ev('localStorage.getItem("hfc-route-v1")'), jobBefore, 'the job is untouched');
    comparisons += 5;
  });

  await check('Importing the same file again adds nothing', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    const text = goodFile([{ name: 'PRACTICE A', visits: [visit()] }]);
    await u.importText(text);
    const once = stored(h);
    await u.importText(text);
    assert.match(u.status(), /Nothing new to import/);
    assert.equal(stored(h), once);
    comparisons += 2;
  });

  await check('Imported supplies are added beside the ones already on the device', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    u.saveVisit('PRACTICE local', '2026-11-10', '13.0');
    await u.importText(goodFile([{ name: 'PRACTICE other', visits: [visit()] }, { name: 'PRACTICE local', visits: [visit({ date: '2026-01-01' })] }]));
    const names = JSON.parse(stored(h)).supplies.map(s => s.name);
    assert.deepEqual(names, ['PRACTICE local', 'PRACTICE other', 'PRACTICE local']);
    const ids = JSON.parse(stored(h)).supplies.map(s => s.id);
    assert.equal(new Set(ids).size, ids.length, 'supply ids are unique');
    comparisons += 2;
  });

  await check('A bad file is refused whole and leaves the notebook byte for byte', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    u.saveVisit('PRACTICE supply', '2026-11-11', '13.2');
    const before = stored(h);
    const many = Array.from({ length: 41 }, (_, i) => ({ name: 'S' + i, visits: [] }));
    const bad = {
      'not json': '{nope',
      'wrong kind': JSON.stringify({ kind: 'something-else', version: 1, supplies: [] }),
      'wrong version': JSON.stringify({ kind: 'carpe-noctum-supply-pm-notebook', version: 2, supplies: [] }),
      'no supplies list': JSON.stringify({ kind: 'carpe-noctum-supply-pm-notebook', version: 1 }),
      'too many supplies': goodFile(many),
      'blank name': goodFile([{ name: '  ', visits: [] }]),
      'long name': goodFile([{ name: 'x'.repeat(81), visits: [] }]),
      'bad date': goodFile([{ name: 'A', visits: [visit({ date: '2026-02-31' })] }]),
      'unknown chemistry': goodFile([{ name: 'A', visits: [visit({ chemistry: 'nuclear' })] }]),
      'negative battery volts': goodFile([{ name: 'A', visits: [visit({ batteries: [{ slot: 'String A', volts: -1 }] })] }]),
      'nine batteries': goodFile([{ name: 'A', visits: [visit({ batteries: Array.from({ length: 9 }, (_, i) => ({ slot: 'S' + i, volts: 12 })) })] }]),
      'too many visits': goodFile([{ name: 'A', visits: Array.from({ length: 81 }, () => visit()) }]),
      'nested span value': goodFile([{ name: 'A', visits: [visit({ spans: [{ drop: { x: 1 } }] })] }]),
      'proto span key': '{"kind":"carpe-noctum-supply-pm-notebook","version":1,"supplies":[{"name":"A","visits":[{"date":"2026-11-11","spans":[{"__proto__":1}]}]}]}',
      'text instead of number': goodFile([{ name: 'A', visits: [visit({ outputVolts: 'lots' })] }]),
      'oversized': ' '.repeat(10 * 1024 * 1024 + 1)
    };
    for (const [name, text] of Object.entries(bad)) {
      await u.importText(text);
      assert.match(u.status(), /Nothing was imported/, name);
      assert.equal(stored(h), before, name + ' changed the notebook');
      comparisons += 2;
    }
  });

  await check('Ids do not repeat between page loads, so a new supply cannot collide with an older one', async () => {
    const seen = new Set();
    for (let i = 0; i < 4; i++) {
      const h = bootApp(); await flush(); const u = ui(h);
      u.saveVisit('PRACTICE supply ' + i, '2026-11-1' + i, '13.2');
      const supplies = JSON.parse(stored(h)).supplies;
      seen.add(supplies[0].id); seen.add(supplies[0].visits[0].id);
    }
    assert.equal(seen.size, 8); comparisons++;
  });

  await check('Importing the notebook the screen just saved adds nothing (key order does not matter)', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    let exported = null; h.w.download = (name, text) => { exported = text; };
    u.saveVisit('PRACTICE supply', '2026-11-11', '13.2');
    u.click('powerPmExport'); await flush();
    const before = stored(h);
    await u.importText(exported);
    assert.match(u.status(), /Nothing new to import/);
    assert.equal(stored(h), before);
    comparisons += 2;
  });

  await check('Imported text stays text: a markup-looking battery name or supply name creates no element and runs nothing', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    const evil = '<img src=x onerror=window.p=1>';
    await u.importText(goodFile([{ name: evil, visits: [visit({ batteries: [{ slot: evil, volts: 13 }] })] }]));
    const pick = h.d.getElementById('powerPmSupplyPick');
    assert.equal(pick.querySelectorAll('img').length, 0);
    pick.value = pick.options[1].value; pick.dispatchEvent(new h.w.Event('change', { bubbles: true })); await flush();
    assert.equal(h.d.getElementById('powerPmVisits').querySelectorAll('img').length, 0);
    assert.equal(h.d.getElementById('powerPmPanel').querySelectorAll('img').length, 0);
    assert.equal(h.w.p, undefined);
    assert.ok(h.d.getElementById('powerPmVisits').textContent.includes(evil), 'the literal text is shown');
    assert.ok(pick.options[1].textContent.includes(evil));
    assert.equal(JSON.parse(stored(h)).supplies[0].visits[0].batteries[0].slot, evil, 'the saved value is unchanged');
    comparisons += 7;
  });

  await check('A notebook the screen could save, including 41 spans in one visit and over 2 MiB in all, exports and restores whole', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    const span = i => ({ cableId: 'commscope_rg6', cableLabel: 'RG6 PRACTICE ' + i, lengthFt: 1000 + i, currentA: 5, temperatureF: 68, alphaPerC: 0.004, supplyVolts: 90, drop: 5.5, atActive: 84.5, minText: 'x'.repeat(120) });
    const spans41 = Array.from({ length: 41 }, (_, i) => span(i));
    const many = Array.from({ length: 2 }, (_, s) => ({ id: 'pmS' + s, name: 'PRACTICE big ' + s, visits: Array.from({ length: 80 }, (_, v) => ({ id: 'v' + s + '_' + v, date: '2026-01-' + String((v % 28) + 1).padStart(2, '0'), chemistry: 'vrla', inputVolts: 120, outputVolts: 89, loadAmps: 4, inverter: 'ran', alarms: '', batteries: [{ slot: 'String A', volts: 13.1 + v / 1000 }], spans: Array.from({ length: 41 }, (_, i) => span(i)) })) }));
    h.w.localStorage.setItem(KEY, JSON.stringify({ version: 1, supplies: many }));
    let exported = null; h.w.download = (name, text) => { exported = text; };
    u.click('powerPmExport'); await flush();
    assert.ok(exported && exported.length > 2 * 1024 * 1024, 'the exported file is larger than 2 MiB: ' + (exported && exported.length));
    const original = JSON.parse(stored(h)).supplies;
    h.w.localStorage.removeItem(KEY);
    await u.importText(exported);
    assert.match(u.status(), /Imported 2 supplies/);
    const restored = JSON.parse(stored(h)).supplies;
    const strip = ss => ss.map(x => ({ name: x.name, visits: x.visits.map(({ id, ...r }) => r) }));
    assert.deepEqual(strip(restored), strip(original)); assert.equal(restored[0].visits[0].spans.length, 41);
    comparisons += 5;
  });

  await check('A visit with 1,001 spans (the screen never capped them) exports and restores whole', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    const spans = Array.from({ length: 1001 }, (_, i) => ({ cableId: 'commscope_rg6', cableLabel: 'RG6 PRACTICE', lengthFt: 0, currentA: 0, temperatureF: 68, alphaPerC: 0, supplyVolts: 90, drop: 0, atActive: 90, n: i }));
    h.w.localStorage.setItem(KEY, JSON.stringify({ version: 1, supplies: [{ id: 'pmS1', name: 'PRACTICE many spans', visits: [{ id: 'v1', date: '2026-01-02', chemistry: 'vrla', inputVolts: 120, outputVolts: 90, loadAmps: 5, inverter: 'ran', alarms: '', batteries: [{ slot: 'String A', volts: 13.1 }], spans }] }] }));
    let exported = null; h.w.download = (name, text) => { exported = text; };
    u.click('powerPmExport'); await flush();
    assert.ok(exported, 'export produced a file');
    h.w.localStorage.removeItem(KEY);
    await u.importText(exported);
    assert.match(u.status(), /Imported 1 supply/);
    const restored = JSON.parse(stored(h)).supplies[0].visits[0].spans;
    assert.equal(restored.length, 1001); assert.deepEqual(restored.map(x => x.n), spans.map(x => x.n));
    comparisons += 4;
  });

  await check('The export message says a file was handed over and does not claim it is safe; a refused or failed hand-off says nothing was exported', async () => {
    const h = bootApp(); await flush(); const u = ui(h);
    u.saveVisit('PRACTICE supply', '2026-11-11', '13.2');
    h.w.download = () => Promise.resolve({ status: 'ready', name: 'x', size: 1 });
    u.click('powerPmExport'); await flush(); await flush();
    assert.match(u.status(), /handed to your browser or device/); assert.match(u.status(), /check that it is there before you uninstall/i); assert.doesNotMatch(u.status(), /^Exported/);
    h.w.download = () => Promise.resolve({ status: 'error', error: 'blob_denied' });
    u.click('powerPmExport'); await flush(); await flush();
    assert.match(u.status(), /not saved/i); assert.match(u.status(), /Nothing was exported/);
    h.w.download = () => { throw new Error('disk full'); };
    u.click('powerPmExport'); await flush(); await flush();
    assert.match(u.status(), /Could not export: disk full/);
    comparisons += 6;
  });

  await check('The new limit is registered and the screen says to export before uninstalling', async () => {
    const h = bootApp(); await flush();
    assert.deepEqual(h.json('Thresholds.checkRow(Thresholds.get("power.pm.file.max"))'), []);
    assert.equal(h.ev('Thresholds.get("power.pm.file.max").label'), 'unknown');
    assert.match(h.d.getElementById('powerPmPanel').textContent, /Export the whole notebook to a file before you uninstall/); assert.equal(h.json('Thresholds.get("power.pm.file.max").value'), 10485760);
    comparisons += 3;
  });

  console.log('Build3 power PM export: ' + cases.length + ' checks passed, ' + comparisons + ' comparisons');
})().catch(error => { console.error(error); process.exit(1); });
