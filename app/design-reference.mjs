// Schedule values are display-only. They never populate equipment or measurement fields.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
const db = value => number(value) === null ? 'Unknown' : `${esc(number(value))} dB`;
function samples(value) {
  if (!Array.isArray(value) || !value.length) return 'Unknown';
  const lines = value.map(pair => Array.isArray(pair) && number(pair[0]) !== null && number(pair[1]) !== null
    ? `${esc(number(pair[0]))} MHz · ${esc(number(pair[1]))} dBmV` : 'Unknown');
  return lines.join('<br>');
}
const fields = [
  ['Input', 'inputSamples', samples], ['Output', 'outputSamples', samples],
  ['Forward pad', 'forwardPadDb', db], ['Forward EQ', 'forwardEqDb', db],
  ['Return pad', 'returnPadDb', db], ['Return EQ', 'returnEqDb', db],
];
function tableValues(data) { return fields.map(([,key,format]) => `<td>${format(data?.[key])}</td>`).join(''); }
const header = () => fields.map(([label]) => `<th scope="col">${label}</th>`).join('');

export function renderStationDesignReference(reference) {
  if (!reference || reference.basis !== 'design-schedule') return '';
  const notes = Array.isArray(reference.notes) ? reference.notes : [];
  return `<section class="panel measurement-report" data-design-reference><h3>Design schedule reference</h3><p>Read-only printed design; verify installed equipment and actual measurements separately.</p><p>Source: ${esc(reference.sourceLabel || 'Unknown')} · Printed equipment: ${esc(reference.printedModel || 'Unknown')}</p><div class="report-table-scroll"><table><thead><tr><th scope="col">Values</th>${header()}</tr></thead><tbody><tr><th scope="row">Design</th>${tableValues(reference.design)}</tr><tr><th scope="row">Actual</th>${tableValues(reference.actual)}</tr></tbody></table></div>${notes.map(note=>`<p>${esc(note)}</p>`).join('')}</section>`;
}

export function renderDesignSchedule(schedule) {
  if (!schedule || schedule.basis !== 'design-schedule' || !Array.isArray(schedule.stations)) return '';
  return `<details class="panel disclosure measurement-report" data-design-schedule><summary>Design schedule reference (${schedule.stations.length})</summary><p>Source: ${esc(schedule.sourceLabel || 'Unknown')}. Printed design values are for reference and do not assign equipment or measurements.</p><div class="report-table-scroll"><table><thead><tr><th scope="col">Tag</th><th scope="col">Name</th><th scope="col">Printed equipment</th>${header()}</tr></thead><tbody>${schedule.stations.map(station=>`<tr><td>${esc(station?.tag || 'Unknown')}</td><td>${esc(station?.name || 'Unknown')}</td><td>${esc(station?.printedModel || 'Unknown')}</td>${tableValues(station?.design)}</tr>`).join('')}</tbody></table></div></details>`;
}
