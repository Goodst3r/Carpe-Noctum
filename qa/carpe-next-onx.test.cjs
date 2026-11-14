#!/usr/bin/env node
'use strict';
/** Parser checks plus production port replacement, originals and reload. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {implForWrapper} = require('./runtime/node_modules/jsdom/lib/jsdom/living/generated/utils');

if (process.env.NIGHTSWEEP_RELEASE_TEST !== '1') {
  console.error('FAIL: NIGHTSWEEP_RELEASE_TEST=1 is required. Refusing a source-assembly pass.');
  process.exit(1);
}

const {bootApp} = require('./build2-source-harness.cjs');
const FIX = path.join(__dirname, 'fixtures/carpe-next');
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks += 1; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks += 1; };
const ok = (value, message) => { assert.ok(value, message); checks += 1; };

function file(app, name, type) {
  const bytes = fs.readFileSync(path.join(FIX, name));
  const data = new app.w.Uint8Array(bytes);
  return new app.w.File([data], name, {type});
}

async function main() {
  const app = bootApp();
  app.w.Blob.prototype.arrayBuffer = function() {
    const buffer = implForWrapper(this)._buffer;
    return Promise.resolve(Uint8Array.from(buffer).buffer);
  };
  try {
    app.w.__sweep = file(app, 'onx-valid-sweep-port1.json', 'application/json');
    app.w.__csv = file(app, 'onx-valid-csv-port2.csv', 'text/csv');
    app.w.__bad = file(app, 'onx-invalid-malformed.json', 'application/json');
    app.w.__kinds = file(app, 'onx-scqam-ofdm-distinction.csv', 'text/csv');
    const result = JSON.parse(JSON.stringify(await app.w.eval(`(async () => {
      const parsed = EvidenceCore.parseText(await __kinds.text ? await __kinds.text() : new TextDecoder().decode(new Uint8Array(await __kinds.arrayBuffer())), 'onx-scqam-ofdm-distinction.csv', 'OneCheck');
      if (parsed.status !== 'parsed' || parsed.rows.length !== 3) throw new Error('OneCheck parser did not return three channel rows.');
      const byName = Object.fromEntries(parsed.rows.map(row => [row.channel, row]));
      const distinct = byName['SC-QAM-CH1'].levelDbmv !== byName['OFDM-PLC'].levelDbmv && byName['OFDM-PLC'].levelDbmv !== byName['OFDM-BLOCK'].levelDbmv && byName['SC-QAM-CH1'].frequencyMHz !== byName['OFDM-PLC'].frequencyMHz;
      const sweep = await EvidenceUI.importFiles([__sweep], {kind:'Sweep', stage:'Before', asset:'PORT-A', notes:'synthetic port A'});
      const verifiedA = await EvidenceUI.verifiedParse(sweep[0].id);
      const context = {split:'42', direction:'forward', stage:'Before', plane:'port', basis:'sc-qam', bandwidthMHz:6, evidenceId:sweep[0].id, sha256:sweep[0].sha256, stationIdentity:PortSweeps.sourceIdentity(state)};
      const ownerBefore = JSON.stringify(state.portSweeps || null);
      state.portSweeps = PortSweeps.replace(state, 'PORT-A', verifiedA.parse, context);
      const portA = state.portSweeps['PORT-A'];
      const csv = await EvidenceUI.importFiles([__csv], {kind:'Sweep', stage:'Before', asset:'PORT-B', notes:'synthetic port B'});
      const verifiedB = await EvidenceUI.verifiedParse(csv[0].id);
      state.portSweeps = PortSweeps.replace(state, 'PORT-B', verifiedB.parse, {...context, evidenceId:csv[0].id, sha256:csv[0].sha256});
      const other = JSON.stringify(state.portSweeps['PORT-B']);
      const replacementText = new TextDecoder().decode(new Uint8Array(await __sweep.arrayBuffer())).replace('35.2', '36.0');
      const replacement = new File([replacementText], 'port1-replaced.json', {type:'application/json'});
      const replaced = await EvidenceUI.importFiles([replacement], {kind:'Sweep', stage:'Before', asset:'PORT-A', notes:'replacement'});
      const verifiedReplacement = await EvidenceUI.verifiedParse(replaced[0].id);
      state.portSweeps = PortSweeps.replace(state, 'PORT-A', verifiedReplacement.parse, {...context, evidenceId:replaced[0].id, sha256:replaced[0].sha256});
      const afterReplace = {a:state.portSweeps['PORT-A'].points[0][1], bSame:JSON.stringify(state.portSweeps['PORT-B']) === other, aPoints:state.portSweeps['PORT-A'].points.length, bPoints:state.portSweeps['PORT-B'].points.length};
      const prior = JSON.stringify(state.portSweeps);
      const failed = await EvidenceUI.importFiles([__bad], {kind:'Sweep', stage:'Before', asset:'PORT-A', notes:'malformed'});
      const failedParse = await EvidenceUI.verifiedParse(failed[0].id);
      let failedMessage = '';
      try { PortSweeps.replace(state, 'PORT-A', failedParse.parse, {...context, evidenceId:failed[0].id, sha256:failed[0].sha256}); }
      catch (error) { failedMessage = error.message; }
      const preserved = JSON.stringify(state.portSweeps) === prior;
      let blankMessage = '';
      const blankPrior = JSON.stringify(state);
      try { PortSweeps.replace(state, 'PORT-A', {status:'parsed', series:{unit:'dBmV', points:[[54, '']]}}, context); }
      catch (error) { blankMessage = error.message; }
      const blankPreserved = JSON.stringify(state) === blankPrior;
      const kinds = await EvidenceUI.importFiles([__kinds], {kind:'OneCheck', stage:'Before', asset:'NODE-1', notes:'channel kinds'});
      const kindParse = kinds[0].parse;
      const plc = PortSweeps.replace(state, 'PLC', verifiedA.parse, {...context, basis:'ofdm-plc', bandwidthMHz:'', evidenceId:sweep[0].id, sha256:sweep[0].sha256});
      let blockRejected = '';
      try { PortSweeps.replace(state, 'BLOCK', verifiedA.parse, {...context, basis:'ofdm-block'}); }
      catch (error) { blockRejected = error.message; }
      if (saveLocal() !== true) throw new Error('Production autosave failed.');
      const saved = JSON.parse(localStorage.getItem('hfc-route-v1'));
      loadState(saved);
      const reloadedA = state.portSweeps['PORT-A'].points;
      const reloadedB = state.portSweeps['PORT-B'].points;
      const reparsed = await EvidenceUI.verifiedParse(kinds[0].id);
      const exported = await EvidenceUI.exportProject(state);
      const restored = await EvidenceUI.prepareImport(exported);
      loadState(restored);
      const roundA = state.portSweeps['PORT-A'];
      const roundB = state.portSweeps['PORT-B'];
      const roundVerified = await EvidenceUI.verifiedParse(state.evidence.find(item => item.kind === 'OneCheck').id);
      return {
        parser: {status:parsed.status, distinct, rows:byName, frequencies:[byName['SC-QAM-CH1'].frequencyMHz, byName['OFDM-PLC'].frequencyMHz, byName['OFDM-BLOCK'].frequencyMHz]},
        firstPoints: portA.points.length,
        firstSample: PortSweeps.sample(portA, 54).value,
        ownerUntouched: ownerBefore === 'null',
        afterReplace,
        failedStatus: failed[0].parse.status,
        failedParseMessage: failed[0].parse.message,
        failedMessage,
        failedVerified: failedParse.parse.status,
        preserved,
        blankMessage,
        blankPreserved,
        kindRows: kindParse.rows.map(row => [row.channel, row.levelDbmv, row.frequencyMHz]),
        plcBasis: plc.PLC.basis,
        qamBasis: state.portSweeps['PORT-A'].basis,
        blockRejected,
        savedPoints: [saved.portSweeps['PORT-A'].points.length, saved.portSweeps['PORT-B'].points.length],
        reloadedA, reloadedB,
        reparsed: reparsed.parse.rows.map(row => [row.channel, row.levelDbmv]),
        stripped: saved.evidence.find(item => item.kind === 'OneCheck').parse.status,
        roundPoints: [roundA.points, roundB.points],
        roundSha: roundVerified.metadata.sha256 === state.evidence.find(item => item.kind === 'OneCheck').sha256,
        roundRows: roundVerified.parse.rows.map(row => [row.channel, row.levelDbmv, row.frequencyMHz])
      };
    })()`)));

    eq(result.parser.status, 'parsed', 'OneCheck parser status');
    eq(result.parser.distinct, true, 'parser keeps SC-QAM, OFDM PLC and OFDM block distinct');
    eq(result.parser.rows['SC-QAM-CH1'].levelDbmv, 35.5, 'SC-QAM channel power');
    eq(result.parser.rows['OFDM-PLC'].levelDbmv, 32.1, 'OFDM PLC level');
    eq(result.parser.rows['OFDM-BLOCK'].levelDbmv, 30.8, 'OFDM block statistic');
    deep(result.parser.frequencies, [57, 601.5, 650], 'channel frequencies stay distinct');
    eq(result.firstPoints, 4, 'production replace keeps every decoded point');
    eq(result.firstSample, 35.2, 'production sample returns the stored point');
    eq(result.ownerUntouched, true, 'replace does not require a pre-existing collection');
    eq(result.afterReplace.a, 36, 'same-port replacement updates that port');
    eq(result.afterReplace.bSame, true, 'same-port replacement leaves the other port intact');
    eq(result.afterReplace.aPoints, 4, 'replacement keeps the full point array');
    eq(result.afterReplace.bPoints, 4, 'other port keeps its full point array');
    eq(result.failedStatus, 'attachment', 'malformed import stays an attachment');
    ok(/malformed|JSON/i.test(result.failedParseMessage), 'malformed file is reported as an attachment, not a sweep');
    ok(result.failedMessage.length > 0, 'production replace refuses the failed parse');
    eq(result.failedVerified, 'attachment', 'reverified failed original is still not a sweep');
    eq(result.preserved, true, 'failed import leaves prior port records in place');
    ok(/blank is not zero/i.test(result.blankMessage), 'a blank sweep sample is not stored as zero');
    eq(result.blankPreserved, true, 'rejected blank sample does not change the job');
    deep(result.kindRows, [['SC-QAM-CH1', 35.5, 57], ['OFDM-PLC', 32.1, 601.5], ['OFDM-BLOCK', 30.8, 650]], 'imported channel rows stay distinct');
    eq(result.qamBasis, 'sc-qam', 'SC-QAM port basis remains SC-QAM');
    eq(result.plcBasis, 'ofdm-plc', 'OFDM PLC basis remains OFDM PLC');
    ok(result.blockRejected.length > 0, 'OFDM block statistic is not accepted as a sweep basis');
    deep(result.savedPoints, [4, 4], 'autosave keeps both ports');
    eq(result.reloadedA.length, 4, 'reload keeps port A points');
    eq(result.reloadedB[0][1], 34, 'reload keeps port B first level');
    eq(result.stripped, 'attachment', 'autosave does not trust a cached channel preview');
    deep(result.reparsed, [['SC-QAM-CH1', 35.5], ['OFDM-PLC', 32.1], ['OFDM-BLOCK', 30.8]], 'verified original rebuilds the three channel statistics');
    deep(result.roundPoints[0].map(point => point[1]), [36, 36.1, 40.5, 42], 'portable import keeps every replaced point');
    deep(result.roundPoints[1].map(point => point[0]), [54, 100, 550, 860], 'portable import keeps the other port frequencies');
    eq(result.roundSha, true, 'reloaded original checksum matches the evidence record');
    deep(result.roundRows, [['SC-QAM-CH1', 35.5, 57], ['OFDM-PLC', 32.1, 601.5], ['OFDM-BLOCK', 30.8, 650]], 'portable reload keeps channel power, PLC and block distinct');
    eq(app.errors.length, 0, 'ONX page reported no errors');
    console.log('Lucas ONX suite: ' + checks + ' checks');
  } finally {
    app.close();
  }
}

main().catch(error => {
  console.error('FAIL ' + (error && error.stack || error));
  process.exit(1);
});
