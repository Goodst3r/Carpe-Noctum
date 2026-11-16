import {EQUIPMENT} from './catalog.mjs';
import {portInfo} from './ports.mjs';

const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]+$/.test(x)&&!['__proto__','prototype','constructor'].includes(x);
const DIRECTIONS={'forward-sweep':'forward','reverse-relative':'reverse',onecheck:'mixed','channel-plan':'none'};
const MAX_REPORT_BYTES=2*1024*1024;

/** Typed diagnostics may never masquerade as an authoritative forward measurement. */
export function assertForwardSweep(sweep) {
  for(const item of [sweep,sweep?.metadata]) {
    if(!item)continue;
    for(const key of ['kind','measurementKind'])if(item[key]!=null&&item[key]!=='forward-sweep')throw new Error('Only forward absolute sweeps may drive forward RF');
    if(item.direction!=null&&item.direction!=='forward')throw new Error('Non-forward measurement direction cannot drive forward RF');
  }
}

/** Validate stored normalized evidence; plot/table data is never activated as RF. */
export function validateMeasurementReport(report) {
  if(!record(report)||!Object.hasOwn(DIRECTIONS,report.kind)||report.direction!==DIRECTIONS[report.kind])throw new Error('Invalid measurement report kind or direction');
  if(!record(report.metadata)||!Array.isArray(report.warnings)||report.warnings.some(x=>typeof x!=='string')||!Array.isArray(report.series)||report.series.length>512||!Array.isArray(report.tables)||report.tables.length>256)throw new Error('Invalid measurement report structure');
  const text=JSON.stringify(report);if(text.length>MAX_REPORT_BYTES)throw new Error('Measurement report exceeds the local evidence size limit');
  let pairs=0,cells=0;
  for(const series of report.series){
    if(!record(series)||typeof series.id!=='string'||typeof series.label!=='string'||typeof series.direction!=='string'||typeof series.frequencyUnit!=='string'||typeof series.levelUnit!=='string'||!Array.isArray(series.samples)||series.samples.length>10000)throw new Error('Invalid measurement report series');
    pairs+=series.samples.length;if(pairs>100000)throw new Error('Measurement report sample limit exceeded');
    for(const sample of series.samples)if(!Array.isArray(sample)||sample.length!==2||!sample.every(Number.isFinite))throw new Error('Invalid measurement report sample');
  }
  for(const table of report.tables){
    if(!record(table)||typeof table.id!=='string'||typeof table.label!=='string'||!Array.isArray(table.columns)||table.columns.length>256||table.columns.some(x=>typeof x!=='string')||!Array.isArray(table.rows)||table.rows.length>10000)throw new Error('Invalid measurement report table');
    for(const row of table.rows){
      if(!Array.isArray(row)||row.length>256)throw new Error('Invalid measurement report row');
      cells+=row.length;if(cells>100000)throw new Error('Measurement report cell limit exceeded');
      for(const cell of row)if(!record(cell)||!(cell.value===null||['string','boolean'].includes(typeof cell.value)||Number.isFinite(cell.value))||(cell.status!=null&&typeof cell.status!=='string'))throw new Error('Invalid measurement report cell');
    }
  }
  return report;
}

export function validateMeasurementRecords(node) {
  if(node.measurementReports==null)return;
  if(!Array.isArray(node.measurementReports)||node.measurementReports.length>100)throw new Error('Measurement report count limit exceeded');
  const ids=new Set(),known=EQUIPMENT[node.modelId]?portInfo(node).known:[];
  for(const entry of node.measurementReports){
    if(!record(entry)||!validId(entry.id)||ids.has(entry.id))throw new Error('Invalid or duplicate measurement report ID');
    ids.add(entry.id);
    if(!validId(entry.port)||!known.includes(entry.port))throw new Error('Unsupported measurement report physical port');
    if(entry.stage!=null&&!['before','after'].includes(entry.stage))throw new Error('Invalid measurement report stage');
    if(typeof entry.originalHash!=='string'||!/^[a-f0-9]{64}$/.test(entry.originalHash))throw new Error('Invalid measurement original hash');
    validateMeasurementReport(entry.report);
  }
}

export function saveMeasurementReport(job,nodeId,port,report,{id,stage,originalHash}={}) {
  const node=job?.nodes?.find(n=>n.id===nodeId);if(!node)throw new Error('Unknown measurement station');
  validateMeasurementReport(report);
  const copy=structuredClone(job),destination=copy.nodes.find(n=>n.id===nodeId);
  const records=destination.measurementReports??=[];
  const duplicate=records.findIndex(x=>x.port===port&&x.stage===stage&&x.originalHash===originalHash);
  const incoming={id:duplicate>=0?records[duplicate].id:id,port,...(stage?{stage}:{}),originalHash,report:structuredClone(report)};
  if(duplicate>=0)records[duplicate]=incoming;else records.push(incoming);
  validateMeasurementRecords(destination);
  return copy;
}
