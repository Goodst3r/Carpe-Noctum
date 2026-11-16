import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';
import { parseONX, replaceSweep } from '../app/io.mjs';

const fixture = (tpc = 0) => zipSync({ 'reading.json': strToU8(JSON.stringify({ testGroup: { id: 'Sweep - Sweepless Unreferenced', tests: [{
  id: 'sweeplessSweep',
  setupGroups: [{ id: 'testPointTemplate', configs: [{ id: 'forwardTestPointCompensation', value: tpc, units: 'dB' }] }],
  resultGroups: [{ id: 'sweep', resultSeries: [{ id: 'Levels', independent: { units: 'MHz', label: 'Frequency', values: [57, 753] }, dependent: [{ units: 'dBmV', label: 'Absolute', values: [11.4, 23.3] }] }] }],
}] } })) });

const nativeJSON = () => strToU8(JSON.stringify({ testGroup: { tests: [{ setupGroups: [{ id: 'testPointTemplate', configs: [{ id: 'forwardTestPointCompensation', value: 0, units: 'dB' }] }], resultGroups: [{ resultSeries: [{ independent: { label: 'Frequency', units: 'MHz', values: [57] }, dependent: [{ label: 'Absolute', units: 'dBmV', values: [11.4] }] }] }] }] } }));

test('ONX TP import adds physical loss once to absolute dBmV values', async () => {
  const result = await parseONX(fixture(), { connection: 'tp', testPointLoss: 20 });
  assert.deepEqual(result.rawSamples, [[57, 11.4], [753, 23.3]]);
  assert.deepEqual(result.samples, [[57, 31.4], [753, 43.3]]);
  assert.equal(result.correction.appliedDb, 20);
});

test('direct import preserves raw levels', async () => {
  const result = await parseONX(fixture(), { connection: 'direct' });
  assert.deepEqual(result.samples, [[57, 11.4], [753, 23.3]]);
});

test('native ONX JSON import is bounded and uses the same measurement semantics', async () => {
  const parsed = await parseONX(nativeJSON(), { connection: 'tp', testPointLoss: 20 });
  assert.deepEqual(parsed.samples, [[57, 31.4]]);
});

test('malformed and oversized compressed ONX inputs fail before measurement parsing', async () => {
  await assert.rejects(parseONX(new Uint8Array([80, 75, 3, 4]), { connection: 'direct' }), /ZIP/i);
  const bomb = zipSync({ 'reading.json': new Uint8Array(11 * 1024 * 1024) });
  await assert.rejects(parseONX(bomb, { connection: 'direct' }), /size|large|limit/i);
  await assert.rejects(parseONX(new Uint8Array(20 * 1024 * 1024 + 1), { connection: 'direct' }), /size|large|limit/i);
});

test('ONX rejects unbounded carrier counts', async () => {
  const frequencies = Array.from({ length: 10001 }, (_, i) => i + 1);
  const levels = frequencies.map(() => 0);
  const document = { testGroup: { tests: [{ setupGroups: [{ id: 'testPointTemplate', configs: [{ id: 'forwardTestPointCompensation', value: 0, units: 'dB' }] }], resultGroups: [{ resultSeries: [{ independent: { label: 'Frequency', units: 'MHz', values: frequencies }, dependent: [{ label: 'Absolute', units: 'dBmV', values: levels }] }] }] }] } };
  await assert.rejects(parseONX(strToU8(JSON.stringify(document)), { connection: 'direct' }), /sample|carrier|limit/i);
});

test('unknown nonzero meter compensation blocks ambiguous correction', async () => {
  await assert.rejects(parseONX(fixture(3), { connection: 'tp', testPointLoss: 20 }), /compensation/i);
});

test('port sweep replacement is atomic and leaves other ports intact', () => {
  const original = { nodes: [{ id: 'node' }], portSweeps: { 'node::1': { samples: [[57, 4]] }, 'node::2': { samples: [[57, 9]] } } };
  const updated = replaceSweep(original, 'node', '1', { samples: [[57, 31.4]] });
  assert.deepEqual(updated.portSweeps['node::1'].samples, [[57, 31.4]]);
  assert.deepEqual(updated.portSweeps['node::2'].samples, [[57, 9]]);
  assert.deepEqual(original.portSweeps['node::1'].samples, [[57, 4]]);
  assert.throws(() => replaceSweep(original, 'node', '1', { samples: [[57, NaN]] }), /sample/i);
});

test('newest before upload drives the active port while after remains a comparison', () => {
  const job = { nodes: [{ id: 'node' }], portSweeps: {} };
  const after = replaceSweep(job, 'node', '1', { stage: 'after', samples: [[57, 31.4]] });
  const both = replaceSweep(after, 'node', '1', { stage: 'before', samples: [[57, 28.2]] });
  assert.deepEqual(both.nodes[0].readings['1'].before.samples, [[57, 28.2]]);
  assert.deepEqual(both.nodes[0].readings['1'].after.samples, [[57, 31.4]]);
  assert.deepEqual(both.nodes[0].readings['1'].samples, [[57, 28.2]]);
  assert.deepEqual(both.portSweeps['node::1'].samples, [[57, 28.2]]);
});

test('missing measured samples cannot become a zero level', () => {
  assert.throws(() => replaceSweep({ nodes: [{ id: 'node' }], portSweeps: {} }, 'node', '1', { samples: [] }), /sample/i);
});

test('sweep replacement requires a physical port supported by its known model', () => {
  const job = { nodes: [{ id: 'node', modelId: 'gs7k' }], portSweeps: {} };
  assert.throws(() => replaceSweep(job, 'node', '9', { samples: [[57, 31]] }), /port/i);
});

test('sweep replacement refuses prototype property names as physical ports', () => {
  const job = { nodes: [{ id: 'draft', modelId: '' }], portSweeps: {} };
  assert.throws(() => replaceSweep(job, 'draft', '__proto__', { samples: [[57, 31]] }), /port/i);
});


test('nonzero compensation requests a structured declaration before correction', async () => {
  await assert.rejects(parseONX(fixture(3),{connection:'tp'}),error=>error.code==='ONX_COMPENSATION_CONFIRMATION_REQUIRED' && error.meterCompensationDb===3);
});
test('explicit export compensation declarations preserve raw levels and correct TP/direct planes', async () => {
  for(const connection of ['tp','direct']) for(const compensationApplied of [true,false]) {
    const result=await parseONX(fixture(3),{connection,testPointLoss:20,compensationApplied});
    const physical=connection==='tp'?20:0, meter=compensationApplied?3:0;
    assert.deepEqual(result.rawSamples,[[57,11.4],[753,23.3]]);
    assert.deepEqual(result.samples,[[57,11.4+physical-meter],[753,23.3+physical-meter]]);
    assert.equal(result.metadata.meterCompensationDb,3);
    assert.equal(result.metadata.setupGroups[0].configs[0].value,3);
    assert.equal(result.correction.testPointLossDb,physical);
    assert.equal(result.correction.meterAppliedDb,meter);
    assert.equal(result.correction.appliedDb,physical-meter);
    assert.equal(result.correction.compensationApplied,compensationApplied);
    assert.equal(result.correction.compensationSource,'operator-declared');
  }
});
test('nonboolean compensation declaration never implies a meter correction', async () => {
  for(const compensationApplied of ['true','false',null,0,1])await assert.rejects(parseONX(fixture(3),{connection:'tp',compensationApplied}),/boolean/i);
});
test('zero meter compensation needs no declaration and remains zero-setting evidence', async () => {
  const result=await parseONX(fixture(),{connection:'tp'});
  assert.equal(result.correction.appliedDb,20);
  assert.equal(result.correction.meterAppliedDb,0);
  assert.equal(result.correction.compensationSource,'zero-setting');
});
test('unstaged newest sweep remains active without discarding stage comparisons', () => {
  let job={nodes:[{id:'node'}],portSweeps:{}};
  job=replaceSweep(job,'node','1',{stage:'before',samples:[[57,10]]});
  job=replaceSweep(job,'node','1',{stage:'after',samples:[[57,20]]});
  job=replaceSweep(job,'node','1',{samples:[[57,30]]});
  assert.deepEqual(job.portSweeps['node::1'].samples,[[57,30]]);
  assert.deepEqual(job.nodes[0].readings['1'].samples,[[57,30]]);
  assert.deepEqual(job.nodes[0].readings['1'].before.samples,[[57,10]]);
  assert.deepEqual(job.nodes[0].readings['1'].after.samples,[[57,20]]);
});
test('latest before upload survives storage with both stage comparisons', async () => {
  const {createJob,saveJob,loadJob,deleteJob}=await import('../app/store.mjs');
  let job=createJob('low');
  job=replaceSweep(job,'node','1',{stage:'after',samples:[[57,31]]});
  job=replaceSweep(job,'node','1',{stage:'before',samples:[[57,28]]});
  try {
    saveJob(job);const stored=loadJob(job.id);
    assert.deepEqual(stored.portSweeps['node::1'].samples,[[57,28]]);
    assert.deepEqual(stored.nodes[0].readings['1'].samples,[[57,28]]);
    assert.deepEqual(stored.nodes[0].readings['1'].after.samples,[[57,31]]);
  } finally {deleteJob(job.id);}
});
test('declared signed meter compensation is removed algebraically and invalid corrected levels fail',async()=>{
  const result=await parseONX(fixture(-3),{connection:'tp',compensationApplied:true});
  assert.deepEqual(result.samples,[[57,34.4],[753,46.3]]);
  assert.equal(result.correction.meterAppliedDb,-3);
  await assert.rejects(parseONX(fixture(1000),{connection:'direct',compensationApplied:true}),/sample/i);
});
