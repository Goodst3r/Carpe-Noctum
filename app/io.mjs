import { unzipSync, strFromU8 } from 'fflate';
import { EQUIPMENT } from './catalog.mjs';

const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const MAX_JSON_BYTES = 10 * 1024 * 1024;
const MAX_SAMPLES = 10000;

function validateSamples(samples) {
  if (!Array.isArray(samples) || !samples.length) throw new Error('Sweep needs measured samples');
  let previous = -Infinity;
  for (const sample of samples) {
    if (!Array.isArray(sample) || sample.length !== 2 ||
        !Number.isFinite(sample[0]) || sample[0] <= 0 || sample[0] > 3000 ||
        !Number.isFinite(sample[1]) || sample[1] < -150 || sample[1] > 150 ||
        sample[0] <= previous) throw new Error('Invalid sweep sample or frequency order');
    previous = sample[0];
  }
}

export async function parseONX(bytes, options = {}) {
  const { connection, testPointLoss = 20 } = options;
  if (!['tp', 'direct'].includes(connection)) throw new Error('Choose TP or direct connection');
  if (connection === 'tp' && (!Number.isFinite(testPointLoss) || testPointLoss < 0 || testPointLoss > 50)) {
    throw new Error('Test point loss must be between 0 and 50 dB');
  }
  const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (input.length > MAX_INPUT_BYTES) throw new Error('ONX input exceeds the 20 MiB size limit');
  let payload, filename;
  if (input[0] === 0x50 && input[1] === 0x4b) {
    let files, entries = 0;
    try {
      files = unzipSync(input, { filter: file => {
        if (++entries > 1) throw new Error('ONX ZIP must contain exactly one JSON result');
        if (!file.name.toLowerCase().endsWith('.json')) throw new Error('ONX ZIP entry must be JSON');
        if (file.originalSize > MAX_JSON_BYTES || file.size > MAX_INPUT_BYTES) throw new Error('ONX ZIP entry exceeds the size limit');
        return true;
      } });
    } catch (error) {
      if (error.message.startsWith('ONX')) throw error;
      throw new Error('ONX must be a valid ZIP archive');
    }
    const names = Object.keys(files);
    if (names.length !== 1 || entries !== 1) throw new Error('ONX ZIP must contain exactly one JSON result');
    filename = names[0];
    payload = files[filename];
  } else {
    if (input.length > MAX_JSON_BYTES) throw new Error('ONX JSON exceeds the size limit');
    filename = null;
    payload = input;
  }
  if (payload.length > MAX_JSON_BYTES) throw new Error('ONX JSON exceeds the size limit');
  let document;
  try { document = JSON.parse(strFromU8(payload)); }
  catch { throw new Error('ONX JSON result is invalid'); }
  const group = document?.testGroup;
  const tests = group?.tests;
  if (!Array.isArray(tests)) throw new Error('ONX testGroup.tests is missing');
  const matches = [];
  for (const measuredTest of tests) {
    for (const resultGroup of measuredTest.resultGroups ?? []) {
      for (const series of resultGroup.resultSeries ?? []) {
        const frequencies = series.independent;
        const absolute = series.dependent?.filter(item => item.label === 'Absolute' && item.units === 'dBmV') ?? [];
        if (frequencies?.label === 'Frequency' && frequencies.units === 'MHz' && absolute.length === 1) {
          matches.push({ measuredTest, resultGroup, series, frequencies, absolute: absolute[0] });
        }
      }
    }
  }
  if (matches.length !== 1) throw new Error('ONX needs one Frequency MHz / Absolute dBmV result series');
  const { measuredTest, resultGroup, series, frequencies, absolute } = matches[0];
  if (!Array.isArray(frequencies.values) || !Array.isArray(absolute.values) || frequencies.values.length !== absolute.values.length) {
    throw new Error('ONX frequency and absolute level samples do not align');
  }
  if (frequencies.values.length > MAX_SAMPLES) throw new Error('ONX sample count exceeds the limit');
  const tpcConfigs = (measuredTest.setupGroups ?? [])
    .filter(item => item.id === 'testPointTemplate')
    .flatMap(item => item.configs ?? [])
    .filter(item => item.id === 'forwardTestPointCompensation');
  if (tpcConfigs.length !== 1 || tpcConfigs[0].units !== 'dB' || !Number.isFinite(tpcConfigs[0].value)) {
    throw new Error('ONX forward test point compensation is missing or unknown');
  }
  const meterCompensationDb = tpcConfigs[0].value;
  if (meterCompensationDb !== 0) throw new Error('Nonzero meter test point compensation semantics need verification');
  const rawSamples = frequencies.values.map((frequency, index) => [frequency, absolute.values[index]]);
  validateSamples(rawSamples);
  const appliedDb = connection === 'tp' ? testPointLoss : 0;
  const samples = rawSamples.map(([frequency, level]) => [frequency, Math.round((level + appliedDb) * 1e6) / 1e6]);
  return {
    samples,
    rawSamples,
    metadata: {
      format: 'ONX', filename, testGroupId: group.id, testId: measuredTest.id,
      resultGroupId: resultGroup.id, seriesId: series.id, infoGroup: group.infoGroup ?? null,
      setupGroups: measuredTest.setupGroups ?? [], meterCompensationDb,
      frequencyUnit: frequencies.units, levelUnit: absolute.units, sampleCount: samples.length,
    },
    correction: { connection, testPointLossDb: appliedDb, meterCompensationDb, appliedDb,
      explanation: connection === 'tp' ? 'Physical test point loss added once; meter compensation is zero' : 'Direct reading; no physical test point loss added' },
  };
}

export function replaceSweep(job, nodeId, port, sweep) {
  if (!job || !Array.isArray(job.nodes) || !job.nodes.some(node => node.id === nodeId)) throw new Error(`Unknown node ${nodeId}`);
  if (typeof port !== 'string' || !/^[A-Za-z0-9_-]+$/.test(port) ||
      ['__proto__', 'constructor', 'prototype'].includes(port)) throw new Error('Invalid physical port');
  const modelPorts = EQUIPMENT[job.nodes.find(node => node.id === nodeId)?.modelId]?.ports;
  if (modelPorts && !modelPorts.includes(port)) throw new Error(`Unsupported physical port ${port} for node ${nodeId}`);
  validateSamples(sweep?.samples);
  const stage = sweep.stage;
  if (stage != null && !['before', 'after'].includes(stage)) throw new Error('Sweep stage must be before or after');
  const copy = structuredClone(job);
  const key = `${nodeId}::${port}`;
  const incoming = structuredClone(sweep);
  const node = copy.nodes.find(item => item.id === nodeId);
  if (stage) {
    node.readings ??= {};
    const prior = node.readings[port] ?? {};
    const stages = { before: prior.before, after: prior.after, [stage]: incoming };
    const active = stages.after ?? stages.before;
    node.readings[port] = { ...active, ...stages };
    copy.portSweeps = { ...(copy.portSweeps ?? {}), [key]: active };
  } else {
    node.readings ??= {};
    node.readings[port] = incoming;
    copy.portSweeps = { ...(copy.portSweeps ?? {}), [key]: incoming };
  }
  return copy;
}
