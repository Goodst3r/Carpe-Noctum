/* Build 3 supply PM (build list item 14). Span drop is checked against an independent formula and against
   HFC.dcSegment. The notebook stays out of the job. No company minimum is invented. */
'use strict';
const assert = require('node:assert/strict');
const { bootApp } = require('./build2-source-harness.cjs');
const cases = [];
let comparisons = 0;
const boot = () => bootApp();
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const near = (a, b, label) => { assert(Math.abs(a - b) < 1e-9, label + ' ' + a + ' != ' + b); comparisons++; };
function independent(input) {
  const factor = 1 + input.alpha * (input.temp - 68) * 5 / 9;
  const spanFt = input.length + (input.slack || 0);
  const resistance = input.rate * spanFt / 1000 * factor;
  const drop = input.current * resistance;
  return { factor, resistance, drop, atActive: input.supply - drop };
}

(async () => {
  const h = boot();
  await flush();
  assert.deepEqual(h.json('PowerPM.selfCheck()'), [], 'module self-check');

  await check('The worked spans match an independent formula and the existing cable-resistance helper', () => {
    const samples = [
      { lengthFt: 1000, slackFt: 0, loopOhmPer1000ft: 1.1, temperatureF: 68, alphaPerC: 0.004, currentA: 5, supplyVolts: 90, length: 1000, slack: 0, rate: 1.1, temp: 68, alpha: 0.004, current: 5, supply: 90 },
      { lengthFt: 1000, slackFt: 0, loopOhmPer1000ft: 1.1, temperatureF: 104, alphaPerC: 0.004, currentA: 5, supplyVolts: 90, length: 1000, slack: 0, rate: 1.1, temp: 104, alpha: 0.004, current: 5, supply: 90 },
      { lengthFt: 500, slackFt: 25, loopOhmPer1000ft: 0.55, temperatureF: 32, alphaPerC: 0, currentA: 2, supplyVolts: 60, length: 500, slack: 25, rate: 0.55, temp: 32, alpha: 0, current: 2, supply: 60 },
      { lengthFt: 5000, slackFt: 0, loopOhmPer1000ft: 1.1, temperatureF: 68, alphaPerC: 0.004, currentA: 10, supplyVolts: 60, length: 5000, slack: 0, rate: 1.1, temp: 68, alpha: 0.004, current: 10, supply: 60 }
    ];
    for (const sample of samples) {
      const got = h.json('PowerPM.spanDrop(' + JSON.stringify(sample) + ')');
      const expect = independent(sample);
      assert.equal(got.ok, true, got.error);
      near(got.factor, expect.factor, 'factor');
      near(got.resistance, expect.resistance, 'resistance');
      near(got.drop, expect.drop, 'drop');
      near(got.atActive, expect.atActive, 'end');
      const engine = h.json(`HFC.dcSegment({dc:{loop_ohm_per_1000ft:${sample.rate}}}, {length:${sample.length}, slack:${sample.slack}}, ${sample.temp}, ${sample.alpha})`);
      near(got.resistance, engine.resistance, 'engine');
    }
    const walked = h.json('PowerPM.chain(90, [{lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:8},{lengthFt:500,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:3}])');
    assert.equal(walked.ok, true);
    near(walked.rows[0].drop, 8.8, 'span1');
    near(walked.rows[0].atActive, 81.2, 'span1 end');
    near(walked.rows[1].drop, 1.65, 'span2');
    near(walked.atActive, 79.55, 'span2 end');
    const low = h.json('PowerPM.spanDrop({lengthFt:5000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:10,supplyVolts:60})');
    assert.equal(h.ev('PowerPM.compareMin(' + low.atActive + ', 35).status'), 'below');
    assert.equal(h.ev('PowerPM.compareMin(84.5, null).status'), 'unknown');
  });

  await check('A blank coefficient, a missing loop and a bad date are refused instead of filled in', () => {
    const blank = h.json('PowerPM.spanDrop({lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:"",currentA:5,supplyVolts:90})');
    assert.equal(blank.ok, false);
    assert.match(blank.error, /0\.004/);
    const rg6 = h.json('PowerPM.cableLoop(catalog, "commscope_rg6")');
    assert.equal(rg6.rate, null);
    const missing = h.json('PowerPM.spanDrop({lengthFt:1000,loopOhmPer1000ft:null,temperatureF:68,alphaPerC:0.004,currentA:5,supplyVolts:90})');
    assert.equal(missing.ok, false);
    assert.match(missing.error, /no published loop/i);
    assert.equal(h.ev('PowerPM.validDate("2026-11-11")'), true);
    assert.equal(h.ev('PowerPM.validDate("2026-02-31")'), false);
    assert.equal(h.ev('PowerPM.validDate("")'), false);
    const le = h.json('PowerPM.activeMin(catalog, "gm-le-12-thermal")');
    assert.equal(le.min, 35);
    comparisons += 6;
  });

  await check('The screen uses the catalog numbers, and the notebook stays out of the job', async () => {
    const jobBefore = h.ev('localStorage.getItem("hfc-route-v1")');
    h.ev('WorkflowUI.go("powerPm")');
    const set = (id, value) => { const el = h.d.getElementById(id); el.value = value; el.dispatchEvent(new h.w.Event('input', { bubbles: true })); el.dispatchEvent(new h.w.Event('change', { bubbles: true })); };
    set('powerPmCable', 'p3_625');
    set('powerPmLength', '1000');
    set('powerPmCurrent', '5');
    set('powerPmSupply', '90');
    set('powerPmTemp', '68');
    set('powerPmAlpha', '0.004');
    set('powerPmActive', 'gm-le-12-thermal');
    const text = h.d.getElementById('powerPmResult').textContent;
    assert.match(text, /5\.5 V/);
    assert.match(text, /84\.5 V/);
    assert.match(text, /35 V/);
    assert.match(text, /at or above/);
    assert.match(text, /not a company limit/);
    h.d.getElementById('powerPmAddSpan').click();
    assert.match(h.d.getElementById('powerPmChain').textContent, /5\.5 V drop/);
    assert.equal(h.d.getElementById('powerPmSupply').value, '84.5');
    set('powerPmName', 'PRACTICE supply');
    set('powerPmDate', '2026-11-11');
    set('powerPmChemistry', 'vrla');
    set('powerPmOutput', '89');
    set('powerPmBatterySlot', 'String A');
    set('powerPmBatteryVolts', '13.2');
    h.d.getElementById('powerPmAddBattery').click();
    h.d.getElementById('powerPmSave').click();
    const stored = JSON.parse(h.w.localStorage.getItem('nightsweep-power-pm-v1'));
    assert.equal(stored.supplies.length, 1);
    assert.equal(stored.supplies[0].name, 'PRACTICE supply');
    assert.equal(stored.supplies[0].visits[0].date, '2026-11-11');
    assert.equal(stored.supplies[0].visits[0].chemistry, 'vrla');
    assert.equal(stored.supplies[0].visits[0].outputVolts, 89);
    assert.equal(stored.supplies[0].visits[0].batteries[0].volts, 13.2);
    assert.equal(stored.supplies[0].visits[0].spans.length, 1);
    assert.equal(h.ev('localStorage.getItem("hfc-route-v1")'), jobBefore);
    const exported = await h.w.evidenceExportProject(h.ev('state'));
    assert.equal(JSON.stringify(exported).includes('PRACTICE supply'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(exported, 'powerPm'), false);
    h.d.getElementById('powerPmDate').value = '2026-02-31';
    h.d.getElementById('powerPmDate').dispatchEvent(new h.w.Event('change', { bubbles: true }));
    h.d.getElementById('powerPmSave').click();
    assert.match(h.d.getElementById('powerPmStatus').textContent, /date/i);
    assert.equal(JSON.parse(h.w.localStorage.getItem('nightsweep-power-pm-v1')).supplies[0].visits.length, 1);
    const rows = h.json('Thresholds.rows.filter(r=>r.id.startsWith("power.pm.")||r.id.startsWith("power.span."))');
    assert.equal(rows.length, 5);
    for (const row of rows) assert.deepEqual(h.json('Thresholds.checkRow(Thresholds.get(' + JSON.stringify(row.id) + '))'), []);
    assert.equal(h.ev('Thresholds.get("power.span.drop").label'), 'unknown');
    comparisons += 8;
  });

  await check('A second date shows the battery change and does not invent a pass limit', () => {
    const set = (id, value) => { const el = h.d.getElementById(id); el.value = value; el.dispatchEvent(new h.w.Event('input', { bubbles: true })); el.dispatchEvent(new h.w.Event('change', { bubbles: true })); };
    set('powerPmDate', '2026-11-12');
    set('powerPmBatterySlot', 'String A');
    set('powerPmBatteryVolts', '12.9');
    h.d.getElementById('powerPmAddBattery').click();
    h.d.getElementById('powerPmSave').click();
    const table = h.d.getElementById('powerPmVisits').textContent;
    assert.match(table, /-0\.3 V/);
    assert.match(h.d.getElementById('powerPmChartNote').textContent, /no limit/i);
    comparisons += 2;
  });

  console.log('Build3 power PM: ' + cases.length + ' checks passed, ' + comparisons + ' comparisons');
})().catch(error => { console.error(error); process.exit(1); });
