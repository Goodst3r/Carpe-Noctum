import {EQUIPMENT} from './catalog.mjs';
import {portInfo} from './ports.mjs';

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=x=>x==null||x===''?'unknown':typeof x==='object'?JSON.stringify(x):String(x);
const label=x=>x.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
const options=(rows,selected)=>rows.map(([id,text])=>`<option value="${esc(id)}" ${String(id)===String(selected)?'selected':''}>${esc(text)}</option>`).join('');
const kindLabels={'forward-sweep':'Forward absolute sweep','reverse-relative':'Reverse relative sweep',onecheck:'OneCheck diagnostics','channel-plan':'Channel plan'};
const kindLabel=report=>`${kindLabels[report.kind]||report.kind} (${report.kind})`;
export const reportPorts=node=>EQUIPMENT[node?.modelId]?portInfo(node).known:[];
export function reportCompensation(report) {
  return report.metadata.meterCompensationDb??report.metadata.configuredCompensation?.value??report.metadata.setupGroups?.find(x=>x.id==='testPointTemplate')?.configs?.find(x=>x.id==='forwardTestPointCompensation')?.value;
}
function meterLabel(meter) {
  if(!meter || typeof meter!=='object') return value(meter);
  const model=meter.model??meter.modelName??meter.productName??meter.name;
  const serial=meter.serialNumber??meter.serial??meter.serialNo;
  return [model,serial?`Serial ${serial}`:null].filter(Boolean).map(value).join(' · ')||'unknown';
}
const metadataList=entries=>`<dl class="report-metadata">${Object.entries(entries).map(([key,item])=>`<div><dt>${esc(key)}</dt><dd>${esc(value(item))}</dd></div>`).join('')}</dl>`;
function reportSummary(report) {
  const meta=report.metadata;
  return `<p><strong>${esc(kindLabel(report))}</strong> · Direction: ${esc(report.direction)}</p>${metadataList({Filename:meta.filename,'Source format':meta.sourceFormat,'Test time':meta.testTime,Meter:meterLabel(meta.meter),'Configured TPC':meta.configuredCompensation??reportCompensation(report)})}`;
}
function sampleRange(series) {
  if(!series.samples.length) return 'No samples';
  const frequencies=series.samples.map(x=>x[0]);
  return `${series.samples.length} samples · ${Math.min(...frequencies)}–${Math.max(...frequencies)} ${series.frequencyUnit||'unknown'} · ${series.levelUnit||'unknown'}`;
}
/** Only escaped text from normalized records reaches the document. Source markup is never inserted. */
export function renderMeasurementReport(report) {
  const meta=report.metadata;
  return `<div class="measurement-report">${reportSummary(report)}
    ${metadataList({'Archive member':meta.memberName,'Test name':meta.testName,Status:meta.status,'Test point':meta.testPoint,Reference:meta.reference,'Work order':meta.workOrder})}
    <details><summary>Technical metadata</summary>${metadataList(Object.fromEntries(Object.entries(meta).map(([key,item])=>[label(key),item])))}</details>
    ${report.warnings.map(w=>`<p class="warning">${esc(w)}</p>`).join('')}
    <h4>Available series (${report.series.length})</h4>
    ${report.series.map(series=>`<details class="report-series"><summary>${esc(series.section?series.section+' · ':'')}${esc(series.label)} · ${esc(sampleRange(series))}</summary>
      <p>Context: ${esc(series.section||'unknown')}. Direction: ${esc(series.direction)}. Source units: ${esc(series.frequencyUnit||'unknown')} / ${esc(series.levelUnit||'unknown')}.</p>
      <div class="report-table-scroll"><table><thead><tr><th>Frequency (${esc(series.frequencyUnit||'unknown')})</th><th>${esc(series.label)} (${esc(series.levelUnit||'unknown')})</th></tr></thead><tbody>
      ${series.samples.map((pair,index)=>`<tr><td>${esc(pair[0])}</td><td>${esc(pair[1])}${series.plotClosureIndices?.includes(index)?' <small>Plot boundary (not a measured level)</small>':''}</td></tr>`).join('')}
      </tbody></table></div></details>`).join('')}
    <h4>Available tables (${report.tables.length})</h4>
    ${report.tables.map(table=>`<details class="report-table"><summary>${esc(table.label)} · ${table.rows.length} rows</summary><div class="report-table-scroll"><table><thead><tr>${table.columns.map(c=>`<th>${esc(c||'unknown')}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(cell=>`<td>${esc(value(cell.value))}${cell.status?` <small>(${esc(cell.status)})</small>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`).join('')}
  </div>`;
}
export function renderStationReports(node) {
  if(!node.measurementReports?.length) return '';
  return `<section class="measurement-reports"><h3>Imported measurement reports</h3><p>Source series and diagnostic tables are separate from the active forward RF trace.</p>${node.measurementReports.map(entry=>`<details class="imported-report"><summary>${esc(entry.report.metadata.testName||kindLabel(entry.report))} · physical port ${esc(entry.port)} · ${esc(entry.stage||'unknown stage')}</summary>${renderMeasurementReport(entry.report)}</details>`).join('')}</section>`;
}
export function renderONXReview(pending,job) {
  if(!pending) return '';
  const cancel='<button type="button" class="secondary" data-action="onx-cancel">Cancel import</button>';
  if(!pending.report) return `<div class="dialog-backdrop"><section class="edge-dialog onx-review" role="dialog" aria-modal="true" aria-labelledby="onx-opening-title"><h2 id="onx-opening-title">Opening measurement</h2><p>Inspecting this file on your device…</p>${cancel}</section></div>`;
  const report=pending.report,node=job.nodes.find(n=>n.id===pending.nodeId),ports=reportPorts(node),forward=report.kind==='forward-sweep',compensation=reportCompensation(report);
  return `<div class="dialog-backdrop"><section class="edge-dialog onx-review" role="dialog" aria-modal="true" aria-labelledby="onx-review-title">
    <h2 id="onx-review-title">Review measurement import</h2><p>Filename is advisory only. Confirm the station and physical port; meter identity does not identify plant equipment.</p>
    ${reportSummary(report)}
    <p>${report.series.length} series · ${report.tables.length} tables${report.series[0]?` · ${esc(sampleRange(report.series[0]))}`:''}. Source details below.</p>
    ${report.warnings.map(w=>`<p class="warning">${esc(w)}</p>`).join('')}
    <form id="onx-review-form" class="form-grid">
      <label>Destination station<select id="onx-station" name="station">${options(job.nodes.map(n=>[n.id,n.name]),pending.nodeId)}</select></label>
      <label>Physical port<select id="onx-port" name="port" required>${options([['',ports.length?'Choose physical port':'Choose equipment for this station first'],...ports.map(p=>[p,'Physical port '+p])],pending.port)}</select></label>
      <label>Measurement stage<select id="onx-stage" name="stage">${options([['before','Before'],['after','After']],pending.stage)}</select></label>
      ${forward?`<label>Physical connection<select id="onx-connection" name="connection" required>${options([['','Choose connection'],['direct','Direct physical port'],['tp','Test point (verified loss)']],pending.connection)}</select></label>
        <label>Verified physical test-point loss (dB)<input id="onx-loss" name="loss" type="number" min="0" max="50" step="any" value="${esc(pending.loss)}"><small>Used only for a test-point connection; added exactly once.</small></label>
        ${compensation!==0?`<label>Do exported levels already include configured meter compensation (${esc(value(compensation))} dB)?<select id="onx-compensation" name="compensation" required>${options([['','Declare export behavior'],['yes','Yes, already included'],['no','No, not included']],pending.compensation)}</select></label>`:''}
        <p id="onx-correction" class="full-width">${esc(pending.correctionText||'Choose the physical connection to preview correction.')}</p>
        <p class="full-width">Saving activates this corrected forward sweep for the selected stage and stores its source report together.</p>`:
        '<p class="full-width">Save as station evidence only. Relative curves, channel plans and OneCheck diagnostics do not change forward readings or RF targets. No physical-loss offset is applied.</p>'}
      <p id="onx-error" class="full-width warning" role="alert">${esc(pending.error||'')}</p>
      <div class="actions full-width"><button class="primary" type="submit" ${pending.saving?'disabled':''}>${pending.saving?'Saving…':forward?'Save report and activate sweep':'Save report evidence'}</button>${cancel}</div>
    </form>
    <details class="onx-source-details"><summary>Inspect metadata, ${report.series.length} series and ${report.tables.length} tables</summary>${renderMeasurementReport(report)}</details>
  </section></div>`;
}
