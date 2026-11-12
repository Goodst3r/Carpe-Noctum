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
      'oversized': ' '.repeat(2 * 1024 * 1024 + 1)
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

  await check('The new limit is registered and the screen says to export before uninstalling', async () => {
    const h = bootApp(); await flush();
    assert.deepEqual(h.json('Thresholds.checkRow(Thresholds.get("power.pm.file.max"))'), []);
    assert.equal(h.ev('Thresholds.get("power.pm.file.max").label'), 'unknown');
    assert.match(h.d.getElementById('powerPmPanel').textContent, /Export the whole notebook to a file before you uninstall/);
    comparisons += 3;
  });

  console.log('Build3 power PM export: ' + cases.length + ' checks passed, ' + comparisons + ' comparisons');
})().catch(error => { console.error(error); process.exit(1); });
