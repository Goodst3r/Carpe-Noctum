import { EQUIPMENT } from './catalog.mjs';
import {portInfo} from './ports.mjs';
import {assertForwardSweep} from './measurements.mjs';

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

export { inspectONX } from './onx-report.mjs';
import { inspectONX } from './onx-report.mjs';

export async function parseONX(bytes, options = {}) {
  return correctONXSweep(await inspectONX(bytes, { filename: options.filename }), options);
}

export function correctONXSweep(report, options = {}) {
  const { connection, testPointLoss = 20, compensationApplied } = options;
  if (report?.kind !== 'forward-sweep' || report.direction !== 'forward') throw new Error('Only a forward sweep can be corrected');
  const matches = report.series?.filter(s => s.direction === 'forward' && s.label === 'Absolute' && s.frequencyUnit === 'MHz' && s.levelUnit === 'dBmV') ?? [];
  if (matches.length !== 1) throw new Error('ONX needs one Frequency MHz / Absolute dBmV result series');
  const source = matches[0];
  if (compensationApplied !== undefined && typeof compensationApplied !== 'boolean') throw new Error('compensationApplied must be an explicit boolean declaration');
  if (!['tp', 'direct'].includes(connection)) throw new Error('Choose TP or direct connection');
  if (connection === 'tp' && (!Number.isFinite(testPointLoss) || testPointLoss < 0 || testPointLoss > 50)) throw new Error('Test point loss must be between 0 and 50 dB');
  const tpcConfigs = (report.metadata.setupGroups ?? [])
    .filter(item => item.id === 'testPointTemplate')
    .flatMap(item => item.configs ?? [])
    .filter(item => item.id === 'forwardTestPointCompensation');
  if (tpcConfigs.length !== 1 || tpcConfigs[0].units !== 'dB' || !Number.isFinite(tpcConfigs[0].value)) {
    throw new Error('ONX forward test point compensation is missing or unknown');
  }
  const meterCompensationDb = tpcConfigs[0].value;
  // This setup value records the configured compensation, not whether the exported
  // Absolute values include it. Never infer that export behavior from the setting.
  if (meterCompensationDb !== 0 && compensationApplied === undefined) {
    const error = new Error('Confirm whether exported levels already include the configured meter test point compensation');
    error.code = 'ONX_COMPENSATION_CONFIRMATION_REQUIRED';
    error.meterCompensationDb = meterCompensationDb;
    throw error;
  }
  const rawSamples = source.samples.map(sample => [...sample]);
  validateSamples(rawSamples);
  const physicalLossDb = connection === 'tp' ? testPointLoss : 0;
  const meterAppliedDb = compensationApplied === true ? meterCompensationDb : 0;
  const appliedDb = physicalLossDb - meterAppliedDb;
  const samples = rawSamples.map(([frequency, level]) => [frequency, Math.round((level + appliedDb) * 1e6) / 1e6]);
  validateSamples(samples);
  return {
    samples,
    rawSamples,
    metadata: {
      ...report.metadata, format: 'ONX', filename: report.metadata.memberName ?? null, testGroupId: report.metadata.testGroupId, testId: report.metadata.testId,
      resultGroupId: report.metadata.resultGroupId, seriesId: report.metadata.seriesId, infoGroup: report.metadata.infoGroup ?? null,
      setupGroups: report.metadata.setupGroups ?? [], meterCompensationDb,
      frequencyUnit: source.frequencyUnit, levelUnit: source.levelUnit, sampleCount: samples.length,
    },
    correction: {
      connection, testPointLossDb: physicalLossDb, meterCompensationDb, meterAppliedDb, appliedDb,
      compensationApplied: meterCompensationDb === 0 ? false : compensationApplied,
      compensationSource: meterCompensationDb === 0 ? 'zero-setting' : 'operator-declared',
      explanation: meterCompensationDb === 0
        ? connection === 'tp' ? 'Physical test point loss added once; meter compensation is zero' : 'Direct reading; no physical test point loss added'
        : `${compensationApplied ? 'Operator declared that exported levels include meter compensation; remove that offset' : 'Operator declared that exported levels do not include meter compensation; keep exported levels'}; ${connection === 'tp' ? 'add physical test point loss once' : 'direct connection adds no physical test point loss'}`,
    },
  };
}

export function replaceSweep(job, nodeId, port, sweep) {
  if (!job || !Array.isArray(job.nodes) || !job.nodes.some(node => node.id === nodeId)) throw new Error(`Unknown node ${nodeId}`);
  if (typeof port !== 'string' || !/^[A-Za-z0-9_-]+$/.test(port) ||
      ['__proto__', 'constructor', 'prototype'].includes(port)) throw new Error('Invalid physical port');
  const destination=job.nodes.find(node=>node.id===nodeId);
  const modelPorts=EQUIPMENT[destination?.modelId]?portInfo(destination).known:undefined;
  if (modelPorts && !modelPorts.includes(port)) throw new Error(`Unsupported physical port ${port} for node ${nodeId}`);
  assertForwardSweep(sweep);
  validateSamples(sweep?.samples);
  const stage = sweep.stage;
  if (stage != null && !['before', 'after'].includes(stage)) throw new Error('Sweep stage must be before or after');
  const copy = structuredClone(job);
  const key = `${nodeId}::${port}`;
  const incoming = structuredClone(sweep);
  const node = copy.nodes.find(item => item.id === nodeId);
  node.readings ??= {};
  const prior = node.readings[port] ?? {};
  const stages = {};
  if (prior.before) stages.before = prior.before;
  if (prior.after) stages.after = prior.after;
  if (stage) stages[stage] = incoming;
  // Stage names are comparison labels, not precedence. The last valid upload is
  // authoritative both for propagation and for the top-level reading fallback.
  node.readings[port] = { ...incoming, ...stages };
  copy.portSweeps = { ...(copy.portSweeps ?? {}), [key]: incoming };
  return copy;
}
