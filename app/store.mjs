import { EQUIPMENT } from './catalog.mjs';

const JOBS_KEY = 'carpe-noctum:jobs:v1';
const ORIGINAL_DB = 'carpe-noctum:originals:v1';
const MAX_BACKUP_CHARS = 64 * 1024 * 1024;
let fallback = '{}';
const RESERVED_IDS = new Set(['__proto__', 'constructor', 'prototype']);
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value) && !RESERVED_IDS.has(value);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function assertSafeKeys(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  for (const key of Object.keys(value)) {
    if (RESERVED_IDS.has(key)) throw new Error(`Reserved property key ${key}`);
    assertSafeKeys(value[key], seen);
  }
}

function validatePosition(position, label) {
  if (!record(position) || !Number.isInteger(position.page) || position.page < 1 ||
      !Number.isFinite(position.x) || position.x < 0 || position.x > 1 ||
      !Number.isFinite(position.y) || position.y < 0 || position.y > 1 ||
      (position.confirmed != null && typeof position.confirmed !== 'boolean') ||
      (position.symbolId != null && typeof position.symbolId !== 'string')) {
    throw new Error(`Invalid map coordinate for ${label}`);
  }
}

function readJobs() {
  let raw;
  try { raw = globalThis.localStorage?.getItem(JOBS_KEY) ?? fallback; }
  catch (error) { throw new Error(`Job storage unavailable: ${error.message}`); }
  try {
    const jobs = JSON.parse(raw);
    if (!record(jobs)) throw new Error('Invalid job index');
    const safe = Object.assign(Object.create(null), jobs);
    for (const [key, job] of Object.entries(safe)) {
      validateJob(job);
      if (key !== job.id) throw new Error('Job index ID mismatch');
    }
    return safe;
  } catch { throw new Error('Stored Carpe Noctum jobs are corrupt'); }
}

function writeJobs(jobs) {
  const raw = JSON.stringify(jobs);
  if (globalThis.localStorage) globalThis.localStorage.setItem(JOBS_KEY, raw);
  else fallback = raw;
}

function validSamples(samples) {
  if (!Array.isArray(samples) || !samples.length) return false;
  let prev = -Infinity;
  for (const item of samples) {
    if (!Array.isArray(item) || item.length !== 2 || !Number.isFinite(item[0]) ||
        item[0] <= prev || item[0] <= 0 || item[0] > 3000 ||
        !Number.isFinite(item[1]) || item[1] < -150 || item[1] > 150) return false;
    prev = item[0];
  }
  return true;
}

function validateJob(job) {
  assertSafeKeys(job);
  if (!job || job.schema !== 1 || !validId(job.id) ||
      typeof job.name !== 'string' || !['low', 'high'].includes(job.split) ||
      !Array.isArray(job.nodes) || !Array.isArray(job.edges) ||
      !record(job.portSweeps) || (job.map != null && !record(job.map)) ||
      (job.placements != null && !record(job.placements))) {
    throw new Error('Invalid job schema');
  }
  const ids = new Set();
  const modelPorts = new Map();
  for (const node of job.nodes) {
    if (!record(node) || !validId(node.id) || ids.has(node.id)) throw new Error('Duplicate or invalid node ID');
    if (typeof node.name !== 'string' || typeof node.tag !== 'string' ||
        !['node', 'active', 'passive', 'eol'].includes(node.kind) ||
        typeof node.modelId !== 'string' || !record(node.settings)) {
      throw new Error(`Invalid node fields for ${node.id}`);
    }
    if (node.map != null) validatePosition(node.map, node.id);
    ids.add(node.id);
    modelPorts.set(node.id, EQUIPMENT[node.modelId]?.ports);
    if (node.readings != null) {
      if (!record(node.readings)) throw new Error('Invalid node readings');
      for (const [port, reading] of Object.entries(node.readings)) {
        if (!validId(port) || !reading || typeof reading !== 'object') throw new Error('Invalid port reading');
        if (modelPorts.get(node.id) && !modelPorts.get(node.id).includes(port)) throw new Error(`Unsupported physical port ${node.id}::${port}`);
        const sweeps = reading.before || reading.after ? [reading, reading.before, reading.after].filter(Boolean) : [reading];
        if (!sweeps.length || sweeps.some(sweep => !validSamples(sweep.samples))) throw new Error(`Invalid reading samples at ${node.id}::${port}`);
      }
    }
  }
  if (!ids.has('node')) throw new Error('Job source node is missing');
  for (const [id, placement] of Object.entries(job.placements ?? {})) {
    if (!ids.has(id)) throw new Error(`Invalid placement node ID ${id}`);
    validatePosition(placement, id);
  }
  const edgeIds = new Set();
  for (const edge of job.edges) {
    if (!record(edge) || !validId(edge.id) || edgeIds.has(edge.id) || !ids.has(edge.from) || !ids.has(edge.to)) {
      throw new Error('Invalid edge reference');
    }
    if (typeof edge.confirmed !== 'boolean' || typeof edge.port !== 'string' ||
        (edge.port && !validId(edge.port)) || typeof edge.cableId !== 'string') {
      throw new Error(`Invalid edge confirmation or port on ${edge.id}`);
    }
    if (edge.lengthFt !== null && (!Number.isFinite(edge.lengthFt) || edge.lengthFt < 0 || edge.lengthFt > 1e7)) {
      throw new Error(`Invalid edge length on ${edge.id}`);
    }
    if (edge.confirmed && (!edge.port || !edge.cableId || edge.lengthFt === null)) {
      throw new Error(`Confirmed edge ${edge.id} needs port, cable and length`);
    }
    if (edge.port && modelPorts.get(edge.from) && !modelPorts.get(edge.from).includes(edge.port)) throw new Error(`Unsupported physical port on edge ${edge.id}`);
    edgeIds.add(edge.id);
  }
  for (const [key, sweep] of Object.entries(job.portSweeps)) {
    const parts = key.split('::');
    if (parts.length !== 2 || !ids.has(parts[0]) || !validId(parts[1]) || !validSamples(sweep?.samples)) {
      throw new Error(`Invalid sweep reference or samples: ${key}`);
    }
    if (modelPorts.get(parts[0]) && !modelPorts.get(parts[0]).includes(parts[1])) throw new Error(`Unsupported physical port ${key}`);
  }
}

function id() {
  return globalThis.crypto?.randomUUID?.() ?? `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createJob(split) {
  if (!['low', 'high'].includes(split)) throw new Error('Split must be low or high');
  const job = {
    schema: 1, id: id(), name: split === 'low' ? 'New low split job' : 'New high split job', split,
    nodes: [{ id: 'node', name: split === 'low' ? 'GS7K Node' : 'Vecima Node', tag: 'NODE', kind: 'node',
      modelId: split === 'low' ? 'gs7k' : 'vecima', settings: { mode: 'manual', director: null } }],
    edges: [], portSweeps: {}, map: null, placements: {},
  };
  return job;
}

export function saveJob(job) {
  validateJob(job);
  const jobs = readJobs();
  jobs[job.id] = structuredClone(job);
  writeJobs(jobs);
  return job.id;
}

export function listJobs() {
  return Object.values(readJobs()).map(job => ({ id: job.id, name: job.name, split: job.split,
    nodeCount: job.nodes.length, sweepCount: Object.keys(job.portSweeps).length }));
}

export function loadJob(jobId) {
  const job = readJobs()[jobId];
  return job ? structuredClone(job) : null;
}

export function deleteJob(jobId) {
  const jobs = readJobs();
  delete jobs[jobId];
  writeJobs(jobs);
}

function openOriginalDB() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB original storage is unavailable'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ORIGINAL_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('bytes');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
}

function asBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  throw new Error('Original attachment must be bytes');
}

export async function putOriginal(input) {
  const bytes = asBytes(input);
  const hash = await sha256(bytes);
  const db = await openOriginalDB();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('bytes', 'readwrite');
      transaction.objectStore('bytes').put(bytes, hash);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { db.close(); }
  return hash;
}

export async function getOriginal(hash) {
  if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid original hash');
  const db = await openOriginalDB();
  let value;
  try {
    value = await new Promise((resolve, reject) => {
      const transaction = db.transaction('bytes', 'readonly');
      const request = transaction.objectStore('bytes').get(hash);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
  if (value == null) return null;
  const bytes = asBytes(value);
  if (await sha256(bytes) !== hash) throw new Error('Original attachment hash mismatch');
  return bytes;
}

function toBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

function fromBase64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error('Invalid original encoding');
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

function originalHashes(job) {
  const hashes = new Set();
  if (job.map?.sha256) hashes.add(job.map.sha256);
  function addSweep(sweep) {
    if (!sweep) return;
    if (sweep.metadata?.originalHash) hashes.add(sweep.metadata.originalHash);
    if (sweep.originalHash) hashes.add(sweep.originalHash);
  }
  for (const sweep of Object.values(job.portSweeps)) addSweep(sweep);
  for (const node of job.nodes) for (const reading of Object.values(node.readings ?? {})) {
    addSweep(reading);
    addSweep(reading.before);
    addSweep(reading.after);
  }
  return hashes;
}

export async function exportBackup() {
  const jobs = Object.values(readJobs());
  jobs.forEach(validateJob);
  const originals = {};
  const missingOriginals = [];
  const hashes = new Set(jobs.flatMap(job => [...originalHashes(job)]));
  for (const hash of hashes) {
    try {
      const bytes = await getOriginal(hash);
      if (bytes) originals[hash] = toBase64(bytes);
      else missingOriginals.push(hash);
    } catch (error) {
      if (error.message.includes('unavailable')) missingOriginals.push(hash);
      else throw error;
    }
  }
  const text = JSON.stringify({ schema: 1, format: 'carpe-noctum-backup', jobs, originals, missingOriginals });
  if (text.length > MAX_BACKUP_CHARS) throw new Error('Backup exceeds the size limit');
  return text;
}

export async function importBackup(input) {
  if (typeof input === 'string' && input.length > MAX_BACKUP_CHARS) throw new Error('Backup exceeds the size limit');
  let backup;
  try { backup = typeof input === 'string' ? JSON.parse(input) : input; }
  catch { throw new Error('Invalid backup JSON'); }
  if (backup?.schema !== 1 || !Array.isArray(backup.jobs)) throw new Error('Invalid backup schema');
  if (typeof input !== 'string' && JSON.stringify(backup).length > MAX_BACKUP_CHARS) throw new Error('Backup exceeds the size limit');
  backup.jobs.forEach(validateJob);
  const originals = [];
  for (const [hash, encoded] of Object.entries(backup.originals ?? {})) {
    const bytes = fromBase64(encoded);
    if (await sha256(bytes) !== hash) throw new Error(`Original attachment hash mismatch: ${hash}`);
    originals.push([hash, bytes]);
  }
  for (const [, bytes] of originals) await putOriginal(bytes);
  const jobs = readJobs();
  for (const job of backup.jobs) jobs[job.id] = structuredClone(job);
  writeJobs(jobs);
  return backup.jobs.length;
}
