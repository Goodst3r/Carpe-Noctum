import test from 'node:test';
import assert from 'node:assert/strict';
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { replaceSweep } from '../app/io.mjs';
import { createJob, saveJob, loadJob, listJobs, deleteJob, exportBackup, importBackup, putOriginal, getOriginal } from '../app/store.mjs';

test('new jobs start blank with split source model and no imported readings', () => {
  const low = createJob('low');
  const high = createJob('high');
  assert.equal(low.nodes[0].id, 'node');
  assert.equal(low.nodes[0].modelId, 'gs7k');
  assert.equal(high.nodes[0].modelId, 'vecima');
  assert.deepEqual(low.portSweeps, {});
  assert.deepEqual(high.portSweeps, {});
  assert.throws(() => createJob('mid'), /split/i);
});

test('saving, loading, listing and deleting jobs use the new namespace', () => {
  const job = createJob('low');
  saveJob(job);
  assert.equal(loadJob(job.id).id, job.id);
  assert.ok(listJobs().some(item => item.id === job.id));
  deleteJob(job.id);
  assert.equal(loadJob(job.id), null);
});

test('backup restore rejects sweeps whose node no longer exists', async () => {
  const job = createJob('low');
  job.portSweeps['ghost::1'] = { samples: [[57, 31]] };
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /sweep|node/i);
});

test('backup restore rejects sweeps on nonexistent physical model ports', async () => {
  const job = createJob('low');
  job.portSweeps['node::9'] = { samples: [[57, 31]] };
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /port/i);
});

test('backup restore rejects edges leaving nonexistent physical model ports', async () => {
  const job = createJob('low');
  job.nodes.push({ id: 'end', name: 'End', tag: 'EOL', kind: 'eol', modelId: 'eol', settings: {} });
  job.edges.push({ id: 'wire', from: 'node', port: '9', to: 'end' });
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /port/i);
});

test('backup restore rejects staged readings on unknown node or invalid port sample', async () => {
  const job = createJob('low');
  job.nodes[0].readings = { '1': { before: { samples: [[57, null]] } } };
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /reading|sample/i);
});

test('backup restore rejects corrupt active reading even when history is valid', async () => {
  const job = createJob('low');
  job.nodes[0].readings = { '1': { samples: [[57, null]], before: { samples: [[57, 31]] } } };
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /reading|sample/i);
});

test('backup roundtrip preserves corrected measurements', async () => {
  const job = createJob('low');
  job.portSweeps['node::1'] = { samples: [[57, 31.4]] };
  saveJob(job);
  const backup = await exportBackup();
  deleteJob(job.id);
  await importBackup(backup);
  assert.deepEqual(loadJob(job.id).portSweeps['node::1'].samples, [[57, 31.4]]);
  deleteJob(job.id);
});

test('original evidence roundtrips by verified hash inside backup', async () => {
  globalThis.indexedDB = fakeIndexedDB;
  const original = new Uint8Array([1, 2, 3, 4]);
  const hash = await putOriginal(original);
  const job = createJob('low');
  job.map = { sha256: hash, pages: [] };
  saveJob(job);
  const backup = JSON.parse(await exportBackup());
  assert.ok(backup.originals[hash]);
  assert.deepEqual(await getOriginal(hash), original);
  backup.originals[hash] = 'AAAA';
  await assert.rejects(importBackup(JSON.stringify(backup)), /hash mismatch/i);
  deleteJob(job.id);
  delete globalThis.indexedDB;
});

test('oversized backup is rejected before JSON parsing', async () => {
  await assert.rejects(importBackup(' '.repeat(64 * 1024 * 1024 + 1)), /size|large|limit/i);
});

test('a storage quota failure keeps the previously saved job intact', async () => {
  const values = new Map();
  let quotaExceeded = false;
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (quotaExceeded) throw new Error('QuotaExceededError'); values.set(key, value); },
  };
  try {
    const job = createJob('low');
    saveJob(job);
    quotaExceeded = true;
    const replacement = structuredClone(job);
    replacement.name = 'Unsaved replacement';
    await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [replacement] })), /QuotaExceededError/);
    assert.equal(loadJob(job.id).name, job.name);
  } finally { delete globalThis.localStorage; }
});

test('backup rejects an active station with a null name before it reaches the UI', async () => {
  const job = createJob('low');
  job.nodes.push({ id: 'amp', name: null, tag: 'A1', kind: 'active', modelId: 'gm-le-agc', settings: {} });
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /node|name/i);
});

test('reserved job and node IDs cannot mutate storage object prototypes', async () => {
  const job = createJob('low');
  job.id = '__proto__';
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /id/i);
  job.id = 'safe-job';
  job.nodes.push({ id: 'constructor', name: 'Bad', tag: 'B', kind: 'active', modelId: '', settings: {} });
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /id/i);
  assert.equal(loadJob('__proto__'), null);
});

test('backup rejects reserved property names inside editable settings', async () => {
  const job = createJob('low');
  job.nodes[0].settings = JSON.parse('{"__proto__":{"polluted":true}}');
  await assert.rejects(importBackup({ schema: 1, jobs: [job] }), /reserved|property|key/i);
});

test('unconfirmed map edges may be saved before port and cable binding', () => {
  const job = createJob('low');
  job.nodes.push({ id: 'amp', name: 'Amp', tag: 'A1', kind: 'active', modelId: '', settings: {} });
  job.edges.push({ id: 'map-edge', from: 'node', to: 'amp', port: '', cableId: '', lengthFt: null, confirmed: false });
  saveJob(job);
  assert.equal(loadJob(job.id).edges[0].confirmed, false);
  deleteJob(job.id);
});

test('confirmed map edge requires bound physical port and finite cable length', async () => {
  const job = createJob('low');
  job.nodes.push({ id: 'amp', name: 'Amp', tag: 'A1', kind: 'active', modelId: '', settings: {} });
  job.edges.push({ id: 'map-edge', from: 'node', to: 'amp', port: '', cableId: '', lengthFt: null, confirmed: true });
  await assert.rejects(importBackup(JSON.stringify({ schema: 1, jobs: [job] })), /edge|port|cable/i);
  job.edges[0].port = '1'; job.edges[0].cableId = 'coax'; job.edges[0].lengthFt = Infinity;
  await assert.rejects(importBackup({ schema: 1, jobs: [job] }), /length/i);
});

test('invalid saved map coordinates and null station fields are rejected', async () => {
  const job = createJob('low');
  job.nodes[0].map = { page: 1, x: NaN, y: 0.5, confirmed: false };
  await assert.rejects(importBackup({ schema: 1, jobs: [job] }), /map|coordinate/i);
  delete job.nodes[0].map;
  job.nodes[0].settings = null;
  await assert.rejects(importBackup({ schema: 1, jobs: [job] }), /settings|node/i);
});

test('backup includes originals for both staged readings on one physical port', async () => {
  globalThis.indexedDB = fakeIndexedDB;
  try {
    const beforeBytes = new Uint8Array([9, 8, 7]);
    const afterBytes = new Uint8Array([6, 5, 4]);
    const beforeHash = await putOriginal(beforeBytes);
    const afterHash = await putOriginal(afterBytes);
    let job = createJob('low');
    job = replaceSweep(job, 'node', '1', { stage: 'before', samples: [[57, 28]], metadata: { originalHash: beforeHash } });
    job = replaceSweep(job, 'node', '1', { stage: 'after', samples: [[57, 31]], metadata: { originalHash: afterHash } });
    saveJob(job);
    const backup = JSON.parse(await exportBackup());
    assert.ok(backup.originals[beforeHash]);
    assert.ok(backup.originals[afterHash]);
    deleteJob(job.id);
    await importBackup(backup);
    assert.deepEqual(await getOriginal(beforeHash), beforeBytes);
    assert.deepEqual(await getOriginal(afterHash), afterBytes);
    deleteJob(job.id);
  } finally { delete globalThis.indexedDB; }
});

test('large original restores from backup without overflowing validation', async () => {
  globalThis.indexedDB = fakeIndexedDB;
  const job = createJob('low');
  try {
    const original = new Uint8Array(6_852_960);
    for (let i = 0; i < original.length; i++) original[i] = i % 251;
    const hash = await putOriginal(original);
    job.map = { sha256: hash, pages: [] };
    saveJob(job);
    const backup = await exportBackup();
    deleteJob(job.id);
    assert.equal(await importBackup(backup), 1);
    assert.deepEqual(await getOriginal(hash), original);
    assert.equal(loadJob(job.id).map.sha256, hash);
  } finally { deleteJob(job.id); delete globalThis.indexedDB; }
});

test('backup rejects malformed and noncanonical base64 originals', async () => {
  const hash = '0'.repeat(64);
  for (const encoded of ['A', 'AAA', 'AAAA=', '=AAA', 'AA=A', 'AA==AAAA', 'AAAA\n', 'AA-_', 'AB==', 'AAB=']) {
    await assert.rejects(importBackup({ schema: 1, jobs: [], originals: { [hash]: encoded } }), /Invalid original encoding/, encoded);
  }
});
