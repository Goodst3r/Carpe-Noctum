/* Actual-app intermittent-ingress contracts; all notes and evidence are synthetic. */
'use strict';
const assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
const h=bootApp(),{w,d,ev,json}=h;let checks=0;
const flush=()=>new Promise(r=>setImmediate(r));
async function check(name,fn){await fn();await flush();assert.deepEqual(h.errors,[]);checks++;console.log('PASS '+name);}
function input(selector,value,type='input'){const el=d.querySelector(selector);assert(el,selector);el.value=value;el.dispatchEvent(new w.Event(type,{bubbles:true}));return el;}
const fresh=()=>ev('loadState({version:1,example:true,setup:{},rows:[]});WorkflowUI.go("nightLog")');
function ingressDraft(values={}){input('[data-night-draft="type"]','intermittent-ingress','change');for(const[k,v]of Object.entries(values))input(`[data-night-ingress-draft="${k}"]`,v);}
const ingressBounds=[['conditions','nightLog.ingress.conditions.max',2000],['observedAt','nightLog.ingress.observedAt.max',200],['weather','nightLog.ingress.weather.max',500]];
function parseCsv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\r'&&text[i+1]==='\n'&&!quoted){row.push(cell);rows.push(row);row=[];cell='';i++;}else cell+=c;}row.push(cell);rows.push(row);return rows;}
(async()=>{
 await check('Ingress type alone or Unicode whitespace refuses before any state or autosave mutation',()=>{
  fresh();const before=json('state'),stored=ev('localStorage.getItem("hfc-route-v1")');
  for(const draft of [{type:'intermittent-ingress',ingress:{conditions:'',observedAt:'',weather:''}},{type:'intermittent-ingress',action:'\u00a0\t',ingress:{conditions:'\u00a0',observedAt:'\n ',weather:' '}}])assert.throws(()=>ev(`NightLog.addEntry(${JSON.stringify(draft)})`),/enter|blank|choose/i);
  assert.deepEqual(json('state'),before);assert.equal(ev('localStorage.getItem("hfc-route-v1")'),stored);
  ingressDraft();d.querySelector('[data-night-action="add"]').click();assert.deepEqual(json('state'),before);assert.match(d.querySelector('[data-night-status]').textContent,/enter|blank|choose/i);
 });
 await check('Real ingress controls store manual raw notes, reuse Actions and leave observed time Unknown',()=>{
  fresh();ingressDraft({conditions:'  Synthetic bursts Ω  ',weather:'Manual rain, "heavy"\nwind'});input('[data-night-draft="action"]','Observed only; no attempted work recorded');d.querySelector('[data-night-action="add"]').click();
  const e=json('state.nightLog.entries[0]');assert.equal(e.type,'intermittent-ingress');assert.deepEqual(e.ingress,{conditions:'  Synthetic bursts Ω  ',observedAt:'',weather:'Manual rain, "heavy"\nwind'});assert.equal(e.action,'Observed only; no attempted work recorded');assert.equal(e.station,null);assert.match(e.addedAt,/Z$/);assert.match(ev('NightLog.handoffText()'),/Technician-observed time: Unknown/);assert.match(ev('NightLog.handoffText()'),/Weather \(manual\): Manual rain/);assert.equal(d.querySelector('[data-night-draft="type"]').value,'general');
  ev('NightLog.addEntry({action:"Legacy-shaped general note"})');const general=json('state.nightLog.entries[1]');assert.equal(Object.hasOwn(general,'type'),false);assert.equal(Object.hasOwn(general,'ingress'),false);
  ev('NightLog.addEntry({type:"intermittent-ingress",action:"Only attempted work",ingress:{conditions:"",observedAt:"",weather:""}})');const rows=parseCsv(ev('NightLog.csvText()')),at=k=>rows[0].indexOf(k);for(const row of rows)assert.equal(row.length,rows[0].length);assert.equal(rows[2][at('entry_type')],'general');for(const key of ['ingress_conditions_status','technician_observed_time_status','weather_manual_status'])assert.equal(rows[3][at(key)],'Unknown');assert.equal(rows[3][at('technician_observed_time_raw')],'');
 });
 await check('Ingress Station snapshots stay frozen while TXT and rectangular CSV retain escaped manual text',async()=>{
  ev('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")');input('[data-station-target]','r1','change');input('[data-station-scope="forward"][data-station-field="measuredLow"]','31');ev('WorkflowUI.go("nightLog")');
  const raw='=SYNTH, "quoted"\r\nΩ <img src=x onerror="window.__ingressInjected=true">';
  ingressDraft({conditions:raw,observedAt:'2026-11-11 around 23:15, zone unknown',weather:' +manual\t drizzle'});input('[data-night-draft="action"]','Attempted synthetic comparison\nNo conclusion');input('[data-night-draft="stationIdentity"]',ev('StationView.records()[0].identity'),'change');d.querySelector('[data-night-action="add"]').click();
  const entry=json('state.nightLog.entries[0]'),snapshot=entry.station;assert(snapshot);ev('WorkflowUI.go("station")');input('[data-station-scope="forward"][data-station-field="measuredLow"]','99');ev('WorkflowUI.go("nightLog")');assert.deepEqual(json('state.nightLog.entries[0].station'),snapshot);assert.equal(d.querySelector('[data-night-ingress-entry="conditions"]').value,raw.replace(/\r\n/g,'\n'));assert.equal(w.__ingressInjected,undefined);assert.equal(d.querySelector('#nightLogPanel img'),null);
  const txt=ev('NightLog.handoffText()');assert(txt.includes(raw.replace(/\r\n/g,'\n')));assert.match(txt,/Attempted work: Attempted synthetic comparison/);assert.match(txt,/Technician-observed time: 2026-11-11 around 23:15, zone unknown/);
  const rows=parseCsv(ev('NightLog.csvText()')),header=rows[0],at=k=>header.indexOf(k);for(const row of rows)assert.equal(row.length,header.length);assert.equal(rows.length,3);assert.equal(rows[1][at('entry_type')],'intermittent-ingress');assert.equal(rows[1][at('ingress_conditions_raw')],"'"+raw.replace(/\r\n/g,'\n'));assert.equal(rows[1][at('technician_observed_time_raw')],entry.ingress.observedAt);assert.equal(rows[1][at('weather_manual_raw')],"' +manual\t drizzle");
  for(const type of ['txt','csv']){const start=h.downloads.length;await d.querySelector(`[data-night-action="${type}"]`).onclick();assert.equal(h.downloads.length,start+1);assert.equal(h.downloads.at(-1).text,ev(type==='txt'?'NightLog.handoffText()':'NightLog.csvText()'));}
 });
 await check('Malformed new entry payloads reject both direct and portable opens atomically',async()=>{
  const good=json('state'),before=json('state');
  for(const mutate of [e=>e.type='unknown',e=>delete e.type,e=>delete e.ingress,e=>e.ingress=null,e=>e.ingress=[],e=>e.ingress.extra='x',e=>delete e.ingress.weather,e=>e.ingress.conditions=0,e=>e.ingress.observedAt={time:'now'},e=>e.ingress.weather=false,e=>e.ingress.conditions='x'.repeat(2001),e=>e.ingress.observedAt='x'.repeat(201),e=>e.ingress.weather='x'.repeat(501)]){
   const bad=structuredClone(good);mutate(bad.nightLog.entries[0]);assert.throws(()=>ev(`loadState(${JSON.stringify(bad)})`),/night.log/i);assert.deepEqual(json('state'),before);await assert.rejects(()=>ev(`openProjectText(${JSON.stringify(JSON.stringify(bad))},true)`),/night.log/i);assert.deepEqual(json('state'),before);
  }
 });
 await check('Named save, duplicate, actual job switching and fresh app reload preserve legacy and ingress bytes',async()=>{
  fresh();ev('NightLog.addEntry({action:"Legacy raw Ω"});state.nightLog.entries[0].action="";state.legacyOpaque={safety:{untouched:"synthetic"}}');const legacy=ev('JSON.stringify(state.nightLog.entries[0])');
  ev('NightLog.addEntry({type:"intermittent-ingress",action:"  Tried synthetic observation  ",ingress:{conditions:"\u00a0raw Ω  ",observedAt:"2026-11-12 01:02 UTC",weather:""}});state.job={...(state.job||{}),name:"Ingress synthetic"};JobsUI.saveNamed()');const id=ev('state.job.id'),log=ev('JSON.stringify(state.nightLog)'),copy=ev('JobsUI.duplicate(state.job.id)');assert.equal(ev(`JSON.stringify(JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(copy)}).nightLog)`),log);
  ev('loadState({version:1,setup:{},rows:[]})');await ev(`JobsUI.open(${JSON.stringify(id)})`);assert.equal(ev('JSON.stringify(state.nightLog)'),log);assert.equal(ev('JSON.stringify(state.nightLog.entries[0])'),legacy);assert.deepEqual(json('state.legacyOpaque'),{safety:{untouched:'synthetic'}});ev('saveLocal()');const stored=ev('localStorage.getItem("hfc-route-v1")'),reload=bootApp({beforeParse(win){win.localStorage.setItem('hfc-route-v1',stored);}});
  try{assert.equal(reload.ev('JSON.stringify(state.nightLog)'),log);assert.deepEqual(reload.errors,[]);}finally{reload.close();}
 });
 await check('Actual evidence backup reopen re-export preserves every original byte and the optional ingress log',async()=>{
  await ev('TrainingJob.open("complete")');const originals=await w.evidenceExportProject(ev('state'));assert.equal(originals.evidenceFiles.length,6);
  ev('NightLog.addEntry({type:"intermittent-ingress",action:"  Synthetic trial Ω  ",ingress:{conditions:"=raw, quote \\\" and CRLF\\r\\nline",observedAt:"Technician notes: about 01:30; zone unknown",weather:""}})');const log=ev('JSON.stringify(state.nightLog)'),backup=await w.evidenceExportProject(ev('state'));await ev(`openProjectText(${JSON.stringify(JSON.stringify(backup))},true)`);const reopened=await w.evidenceExportProject(ev('state'));
  assert.equal(ev('JSON.stringify(state.nightLog)'),log);assert.equal(JSON.stringify(reopened.nightLog),log);assert.deepEqual(reopened.evidenceFiles.map(f=>f.base64),originals.evidenceFiles.map(f=>f.base64));assert.deepEqual(reopened.evidence.map(f=>f.sha256),originals.evidence.map(f=>f.sha256));assert.match(ev('NightLog.handoffText()'),/SYNTHETIC/);assert.match(ev('NightLog.csvText()'),/SYNTHETIC/);
 });
 await check('Ingress editing, Remove and Undo retain unadded manual draft notes through autosave failure',()=>{
  ev('WorkflowUI.go("nightLog")');const first=json('state.nightLog.entries[0]');input('[data-night-ingress-entry="weather"]','Edited manual weather Ω');assert.equal(ev('state.nightLog.entries[0].ingress.weather'),'Edited manual weather Ω');const original=json('state.nightLog.entries[0]');
  ingressDraft({conditions:'Unadded conditions',observedAt:'Unadded time',weather:'Unadded weather'});input('[data-night-draft="action"]','Unadded attempted work');const old=w.Storage.prototype.setItem;w.Storage.prototype.setItem=()=>{throw Error('quota')};
  try{d.querySelector('[data-night-remove]').click();d.querySelector('[data-night-action="undo"]').click();assert.deepEqual(json('state.nightLog.entries[0]'),original);for(const[k,v]of Object.entries({conditions:'Unadded conditions',observedAt:'Unadded time',weather:'Unadded weather'}))assert.equal(d.querySelector(`[data-night-ingress-draft="${k}"]`).value,v);assert.equal(d.querySelector('[data-night-draft="type"]').value,'intermittent-ingress');assert.equal(d.querySelector('[data-night-draft="action"]').value,'Unadded attempted work');assert.match(d.querySelector('[data-night-status]').textContent,/remain in memory.*Autosave failed/);}finally{w.Storage.prototype.setItem=old;}
  assert.deepEqual(json('state.nightLog.entries[0].station'),first.station);
 });
 await check('Detached ingress controls cannot modify a switched job with matching entry IDs',()=>{
  const previous=json('state'),oldEntry=d.querySelector('[data-night-ingress-entry="conditions"]'),staleAdd=d.querySelector('[data-night-action="add"]').onclick,staleRemove=d.querySelector('[data-night-remove]').onclick;ev('window.__previousIngressOwner=state');const old=json('state');previous.nightLog.entries[0].ingress.conditions='New owner history';
  ev(`loadState(${JSON.stringify(previous)});WorkflowUI.go("nightLog")`);const before=json('state'),stored=ev('localStorage.getItem("hfc-route-v1")');oldEntry.value='Stale detached input';oldEntry.dispatchEvent(new w.Event('input',{bubbles:true}));staleAdd();staleRemove();assert.deepEqual(json('state'),before);assert.deepEqual(json('window.__previousIngressOwner'),old);assert.equal(ev('localStorage.getItem("hfc-route-v1")'),stored);assert.equal(d.querySelector('[data-night-draft="type"]').value,'general');assert.equal(d.querySelector('[data-night-ingress-draft="conditions"]').value,'');delete w.__previousIngressOwner;
 });
 await check('Exact ingress text bounds accept raw strings and reject overflow without mutation',()=>{
  fresh();ev('NightLog.addEntry({type:"intermittent-ingress",ingress:{conditions:"x".repeat(2000),observedAt:"t".repeat(200),weather:"w".repeat(500)}})');const before=json('state');
  for(const [key,length]of [['conditions',2001],['observedAt',201],['weather',501]])assert.throws(()=>ev(`NightLog.addEntry({type:"intermittent-ingress",ingress:{conditions:"",observedAt:"",weather:"",${key}:"x".repeat(${length})}})`),/night.log/i);assert.deepEqual(json('state'),before);
  const unicode={conditions:'😀'.repeat(1000),observedAt:'😀'.repeat(100),weather:'😀'.repeat(250)};
  ev(`NightLog.addEntry(${JSON.stringify({type:'intermittent-ingress',ingress:unicode})})`);assert.deepEqual(json('state.nightLog.entries.at(-1).ingress'),unicode,'non-BMP text is retained at the UTF-16 code-unit boundary');const unicodeBefore=json('state');
  for(const field of ['conditions','observedAt','weather'])assert.throws(()=>ev(`NightLog.addEntry(${JSON.stringify({type:'intermittent-ingress',ingress:{...unicode,[field]:unicode[field]+'x'}})})`),/night.log/i);assert.deepEqual(json('state'),unicodeBefore,'one extra UTF-16 code unit refuses atomically');
 });
 await check('Ingress inputs expose their Unknown application bounds through real source details',async()=>{
  fresh();ingressDraft();
  for(const [field,id,limit]of ingressBounds){
   const row=json(`Thresholds.get(${JSON.stringify(id)})||null`);assert(row,'registered ingress bound '+id);assert.equal(row.label,'unknown');assert.equal(row.verification,'unverified');assert.equal(row.value,limit);assert.equal(ev(`Thresholds.matches(${JSON.stringify(id)})`),1);assert.deepEqual(json(`Thresholds.checkRow(Thresholds.get(${JSON.stringify(id)}))`),[]);
   assert.match(row.units,/UTF[- ]?16.*code units?/i);assert.match(row.source+' '+row.conditions,/software|application guard/i);assert.match(row.source+' '+row.conditions,/not.*(?:RF|equipment|manufacturer|company|acceptance)/i);
   const box=d.querySelector(`[data-night-ingress-draft="${field}"]`),tag=d.querySelector(`[data-night-ingress-fields] [data-threshold="${id}"]`);assert.equal(box.maxLength,limit);assert(tag,'source tag beside the manual ingress fields: '+id);assert.equal(tag.closest('label'),null);assert.equal(tag.tagName,'BUTTON');assert.equal(tag.type,'button');assert.equal(tag.textContent,'Unknown');assert.equal(tag.dataset.label,'unknown');assert.equal(tag.getAttribute('aria-haspopup'),'dialog');assert.match(tag.getAttribute('aria-label'),/Unknown source/i);
   tag.focus();tag.click();await flush();const sheet=d.querySelector('dialog#sourceSheet[open]');assert(sheet,'actual source dialog opens');assert.equal(sheet.dataset.sheetFor,id);assert.equal(d.activeElement.id,'sourceSheetTitle');
   const details=Object.fromEntries([...sheet.querySelectorAll('dt')].map(term=>[term.textContent,term.nextElementSibling?.textContent]));assert.match(details.Value.replaceAll(',',''),new RegExp('^'+limit+'\\b'));assert.match(details.Units,/UTF[- ]?16.*code units?/i);for(const [term,value]of [['Source',row.source],['Revision',row.revision],['Page, table or section',row.locator],['Applies when',row.conditions]])assert.equal(details[term],value,term+' details belong to '+field);
   sheet.querySelector('[data-source-close]').click();await flush();assert.equal(d.querySelector('#sourceSheet'),null);assert.equal(d.activeElement,tag,'focus returns to the bound tag');
  }
  assert.equal(d.querySelector('#nightLogPanel label [data-threshold]'),null,'source controls never become part of an input label');
 });
 await check('Opening ingress sources preserves unadded notes and rejected saved-entry text',async()=>{
  fresh();ev('NightLog.addEntry({type:"intermittent-ingress",action:"Saved synthetic work",ingress:{conditions:"Saved conditions",observedAt:"",weather:"Saved manual weather"}});NightLog.render(true)');
  const draft={conditions:'Unadded conditions Ω',observedAt:'About 01:30; zone unknown',weather:'   '};ingressDraft(draft);input('[data-night-draft="action"]','Unadded attempted work');
  const invalid='w'.repeat(501);input('[data-night-ingress-entry="weather"]',invalid);assert.equal(ev('state.nightLog.entries[0].ingress.weather'),'Saved manual weather');assert.match(d.querySelector('[data-night-status]').textContent,/not saved|remains visible|correct/i);
  const before=json('state'),stored=ev('localStorage.getItem("hfc-route-v1")');
  for(const [,id]of ingressBounds){
   const tag=d.querySelector(`[data-night-ingress-fields] [data-threshold="${id}"]`);assert(tag,id);tag.focus();tag.click();await flush();assert(d.querySelector('dialog#sourceSheet[open]'));ev('NightLog.render(true)');
   for(const [field,value]of Object.entries(draft))assert.equal(d.querySelector(`[data-night-ingress-draft="${field}"]`).value,value);assert.equal(d.querySelector('[data-night-draft="type"]').value,'intermittent-ingress');assert.equal(d.querySelector('[data-night-draft="action"]').value,'Unadded attempted work');assert.equal(d.querySelector('[data-night-ingress-entry="weather"]').value,invalid);assert.deepEqual(json('state'),before);assert.equal(ev('localStorage.getItem("hfc-route-v1")'),stored);
   d.querySelector('#sourceSheet [data-source-close]').click();await flush();assert.equal(d.activeElement,tag);assert.equal(d.querySelector('[data-night-ingress-entry="weather"]').value,invalid);assert.deepEqual(json('state'),before);assert.equal(ev('localStorage.getItem("hfc-route-v1")'),stored);
  }
  input('[data-night-ingress-entry="weather"]','Corrected manual weather');assert.equal(ev('state.nightLog.entries[0].ingress.weather'),'Corrected manual weather');
 });
 console.log(`Build3 night log ingress: ${checks} checks passed`);h.close();
})().catch(error=>{console.error(error);h.close();process.exitCode=1;});
