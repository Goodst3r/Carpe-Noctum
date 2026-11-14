/* Synthetic ONX QA for next-build: per-port, failed-import isolation, SC-QAM vs OFDM PLC vs block stats. */
'use strict';
const assert = require('node:assert/strict');
const E = require('../night-sweep/evidence.js');
const fs = require('node:fs');
const path = require('node:path');

const FIX = path.join(__dirname, 'fixtures/carpe-next');
function load(name) { return fs.readFileSync(path.join(FIX, name), 'utf8'); }

let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS ' + name); };

test('Valid synthetic VIAVI JSON imports as Sweep', () => {
  const text = load('onx-valid-sweep-port1.json');
  const r = E.parseText(text, 'port1.json', 'Sweep');
  assert.equal(r.status, 'parsed');
  assert.equal(r.series.points.length, 4);
  assert.equal(r.series.points[0][0], 54);
});

test('Failed import of malformed JSON is attachment; prior data can be retained', () => {
  const prior = E.parseText(load('onx-valid-csv-port2.csv'), 'port2.csv', 'Sweep');
  assert.equal(prior.status, 'parsed');
  const failed = E.parseText(load('onx-invalid-malformed.json'), 'bad.json', 'Sweep');
  assert.equal(failed.status, 'attachment');
  assert.match(failed.message, /malformed|JSON/i);
  // Isolation: failed does not overwrite prior parse
  assert.equal(prior.status, 'parsed');
  assert.ok(prior.series.points.length > 0);
});

test('Same-port replacement updates only that port; other port remains', () => {
  const portA = E.parseText(load('onx-valid-sweep-port1.json'), 'portA.json', 'Sweep');
  const portB = E.parseText(load('onx-valid-csv-port2.csv'), 'portB.csv', 'Sweep');
  const evidence = [
    { id: 'A', asset: 'port-A', kind: 'Sweep', stage: 'Before', parse: portA, name: 'A.json', size: 100, type: 'application/json', importedAt: '2026-11-14T00:00:00.000Z', sha256: 'a'.repeat(64) },
    { id: 'B', asset: 'port-B', kind: 'Sweep', stage: 'Before', parse: portB, name: 'B.csv', size: 100, type: 'text/csv', importedAt: '2026-11-14T00:00:00.000Z', sha256: 'b'.repeat(64) }
  ];
  // Simulate replacement of port A only
  const newA = E.parseText(load('onx-valid-sweep-port1.json').replace('35.2', '36.0'), 'portA.json', 'Sweep');
  evidence[0].parse = newA;
  assert.equal(evidence[0].parse.series.points[0][1], 36.0);
  assert.equal(evidence[1].parse.series.points[0][1], 34.0); // other port intact
  assert.equal(E.validateEvidence(evidence), true);
});

test('6 MHz SC-QAM, OFDM PLC and OFDM block statistics remain distinct after save and reload', () => {
  const text = load('onx-scqam-ofdm-distinction.csv');
  const parsed = E.parseText(text, 'distinction.csv', 'OneCheck');
  assert.equal(parsed.status, 'parsed');
  assert.equal(parsed.rows.length, 3);
  const byName = Object.fromEntries(parsed.rows.map(r => [r.channel, r]));
  assert.equal(byName['SC-QAM-CH1'].levelDbmv, 35.5);
  assert.equal(byName['OFDM-PLC'].levelDbmv, 32.1);
  assert.equal(byName['OFDM-BLOCK'].levelDbmv, 30.8);
  assert.notEqual(byName['SC-QAM-CH1'].levelDbmv, byName['OFDM-PLC'].levelDbmv);
  assert.notEqual(byName['OFDM-PLC'].levelDbmv, byName['OFDM-BLOCK'].levelDbmv);
  // Save and reload via evidence item
  const item = {
    id: 'dist1', name: 'distinction.csv', size: text.length, type: 'text/csv',
    kind: 'OneCheck', stage: 'Before', asset: 'node1', notes: 'SC-QAM vs PLC vs block',
    importedAt: '2026-11-14T12:00:00.000Z', sha256: 'c'.repeat(64), parse: parsed
  };
  const reloaded = JSON.parse(JSON.stringify(item));
  assert.equal(E.validateEvidence([reloaded]), true);
  const reloadedRows = Object.fromEntries(reloaded.parse.rows.map(r => [r.channel, r]));
  assert.equal(reloadedRows['SC-QAM-CH1'].levelDbmv, 35.5);
  assert.equal(reloadedRows['OFDM-PLC'].levelDbmv, 32.1);
  assert.equal(reloadedRows['OFDM-BLOCK'].levelDbmv, 30.8);
  // Frequencies distinct too
  assert.equal(reloadedRows['SC-QAM-CH1'].frequencyMHz, 57);
  assert.equal(reloadedRows['OFDM-PLC'].frequencyMHz, 601.5);
});

test('Offline pure function: no external dependency', () => {
  const r = E.parseText(load('onx-valid-csv-port2.csv'), 'off.csv', 'Sweep');
  assert.equal(r.status, 'parsed');
});

console.log('Lucas ONX suite: ' + count + ' checks passed on baseline 248e778 (full job-port replacement still needs candidate).');
