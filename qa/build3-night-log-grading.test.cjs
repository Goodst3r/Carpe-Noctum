/* Combined Night log/grading contracts in a fresh Node process.
   Keeping this integration fixture out of the long grading UI sequence avoids
   optimization-sensitive cross-context jsdom rendering; real Chromium checks the UI. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
const file=(name,text)=>{const bytes=new TextEncoder().encode(text);return {name,size:bytes.length,type:'text/csv',arrayBuffer:async()=>bytes.slice().buffer};};
let count=0;async function check(name,fn){await fn();count++;console.log('PASS '+name);}
(async()=>{
// The optional saved histories share App/Jobs boundaries but keep independent semantics.
const paired=bootApp();
try{
 const {w:pw,d:pd,ev:pe,json:pj}=paired;
 const edit=(selector,value,type='input')=>{const el=pd.querySelector(selector);assert(el,selector);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new pw.Event(type,{bubbles:true}));};
 const go=task=>pe(`WorkflowUI.go(${JSON.stringify(task)})`);
 let pairedLog,pairedGrades,pairedStation;
 await check('Night log captures both stages and independent dates while grading and later log updates preserve each other',async()=>{
  const five=pe('('+fs.readFileSync('qa/night-log-fixture.js','utf8')+')()');assert.equal(five.entries,5);
  go('station');edit('[data-station-target]','r1','change');
  for(const [scope,done,date]of [['balanced',true,'2026-11-10'],['swept',false,'2026-11-11']]){edit(`[data-station-scope="${scope}"][data-station-field="done"]`,done,'change');edit(`[data-station-scope="${scope}"][data-station-field="date"]`,date,'change');}
  const live=pj('StationView.records().find(r=>r.pointId==="r1")');go('nightLog');edit('[data-night-draft="stationIdentity"]',live.identity,'change');edit('[data-night-draft="asset"]','SYNTHETIC A1 dated capture');edit('[data-night-draft="action"]','Capture both stages and separate work facts');pd.querySelector('[data-night-action="add"]').click();assert.equal(pe('NightLog.entries().length'),6);
  const captured=pj('NightLog.entries().at(-1).station');for(const stage of ['before','after'])for(const scope of ['forward','returns'])for(const [key,value]of Object.entries(captured.stages[stage][scope]))assert.equal(value,live.stages[stage][scope][key]??'',stage+'/'+scope+'/'+key);
  for(const stage of ['before','after']){for(const [key,value]of Object.entries(captured.results[stage].forward))assert.deepEqual(value,live.results[stage].forward[key],stage+'/forward/'+key);for(const [kind,result]of Object.entries(captured.results[stage].returns))for(const [key,value]of Object.entries(result))assert.deepEqual(value,live.results[stage].returns[kind][key],stage+'/returns/'+kind+'/'+key);}assert.deepEqual(captured.balanced,{done:true,date:'2026-11-10'});assert.deepEqual(captured.swept,{done:false,date:'2026-11-11'});const logBefore=pj('state.nightLog');
  go('evidence');await pe('EvidenceUI').importFiles([file('SYNTHETIC night handoff grading.csv','frequency_mhz,level_dbmv\n261,0\n627,2.5\n993,0')],{kind:'Sweep',stage:'Before'});
  for(const [id,value]of Object.entries({gradingEvidence:pe('state.evidence.at(-1).id'),gradingPlant:'204',gradingDirection:'forward','grading-lowFrequencyMHz':'261','grading-highFrequencyMHz':'993','grading-ptvLimitDb':'3'}))edit('#'+id,value,id.startsWith('grading-')?'input':'change');
  const grade=await pe('SweepGradingUI').grade();assert.equal(grade.result.metrics.ptvDb,2.5);assert.equal(grade.result.checks.ptv.status,'pass');assert.equal(grade.result.overall,'unknown');assert.deepEqual(pj('state.nightLog'),logBefore);const gradesBefore=pj('state.sweepGrading');
  go('nightLog');edit('[data-night-draft="stationIdentity"]','','change');edit('[data-night-draft="action"]','General update after explicit grade');pd.querySelector('[data-night-action="add"]').click();assert.equal(pe('NightLog.entries().length'),7);assert.deepEqual(pj('state.sweepGrading'),gradesBefore);assert.deepEqual(pj('NightLog.entries()[5].station'),captured);assert.deepEqual(paired.errors,[]);
  pairedLog=pj('state.nightLog');pairedGrades=pj('state.sweepGrading');pairedStation=pj('state.stationView');
 });
 await check('Both histories survive warm500 autosave reload, named duplication and original-byte portable remapping',async()=>{
  const saved=pw.localStorage.getItem('hfc-route-v1'),records=pj('StationView.records()');for(let i=0;i<500;i++)pe('StationView.results()');
  const html=process.env.NIGHTSWEEP_RELEASE_TEST==='1'?fs.readFileSync('outputs/Night_Sweep.html','utf8'):require('./build2-source-harness.cjs').assembleHtml();
  const marker='<script>const catalog=',probe='<script>window.__pairedEarlyMath=0;window.__pairedMath=StationMath.results;StationMath.results=function(...a){if(typeof Alignment==="undefined")window.__pairedEarlyMath++;return window.__pairedMath(...a);};window.__pairedInit=EvidenceUI.init;EvidenceUI.init=function(...a){const pending=window.__pairedInit.apply(this,a);window.__pairedReady=Promise.resolve(pending);return pending;};</script>';assert(html.includes(marker));
  const cold=bootApp({html:html.replace(marker,probe+marker),beforeParse(w){w.indexedDB=pw.indexedDB;w.localStorage.setItem('hfc-route-v1',saved);}});
  try{await cold.ev('__pairedReady');assert.equal(cold.ev('__pairedEarlyMath'),0);assert.deepEqual(cold.json('state.nightLog'),pairedLog);assert.deepEqual(cold.json('state.sweepGrading'),pairedGrades);assert.deepEqual(cold.json('state.stationView'),pairedStation);assert.deepEqual(cold.json('StationView.records()'),records);assert(!cold.w.localStorage.getItem('hfc-route-v1-unreadable'));assert.deepEqual(cold.errors,[]);}finally{cold.close();}
  pe('JobsUI.saveNamed()');const id=pe('state.job.id'),duplicate=pe('JobsUI.duplicate(state.job.id)'),copy=pj(`JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(duplicate)})`);assert.deepEqual(copy.nightLog,pairedLog);assert.deepEqual(copy.sweepGrading,pairedGrades);assert.deepEqual(copy.stationView,pairedStation);
  const portable=await pw.evidenceExportProject(pe('state')),restored=await pw.evidencePrepareImport(portable),mapped=restored.evidence[0].id;assert.deepEqual(plain(portable.nightLog),pairedLog);assert.deepEqual(plain(restored.nightLog),pairedLog);assert.notEqual(mapped,portable.evidence[0].id);const expected=plain(pairedGrades);for(const record of expected.records)record.source.evidenceId=mapped;assert.deepEqual(plain(restored.sweepGrading),expected);assert.equal((await pw.evidenceExportProject(restored)).evidenceFiles[0].base64,portable.evidenceFiles[0].base64);
  pw.__pairedRestore=restored;pe('loadState(__pairedRestore)');assert.deepEqual(pj('state.nightLog'),pairedLog);assert.deepEqual(pj('StationView.records()'),records);assert.equal(pe('state.sweepGrading.records.length'),1);assert.deepEqual(paired.errors,[]);
  const stable=pj('state');for(const section of ['nightLog','sweepGrading']){const invalid=plain(stable);if(section==='nightLog')invalid.nightLog.entries[0].addedAt='invalid';else invalid.sweepGrading.records[0].result.metrics.ptvDb='invalid';assert.throws(()=>pe('loadState')(invalid),section==='nightLog'?/night-log/:/grading/);assert.deepEqual(pj('state'),stable,section+' invalid import is atomic');}
 });
 await check('Actual Route example retains both optional sections and prior keepers, while old jobs invent neither section',()=>{
  const candidate=pj('state');candidate.rows=[];pw.__pairedEmpty=candidate;pe('loadState(__pairedEmpty)');const keep=['power','project','frequency','node','evidence','job','fieldWork','fieldReferences','sweepSetup','nightLog','sweepGrading'];const before=pj('state');let confirms=0;const oldConfirm=pw.confirm;pw.confirm=()=>{confirms++;return true;};
  try{pd.getElementById('example').click();assert.equal(confirms,0);assert.equal(pe('state.rows.length'),3);for(const key of keep)if(Object.hasOwn(before,key))assert.deepEqual(pj('state['+JSON.stringify(key)+']'),before[key],key);const stored=JSON.parse(pw.localStorage.getItem('hfc-route-v1'));assert.deepEqual(stored.nightLog,before.nightLog);assert.deepEqual(stored.sweepGrading,before.sweepGrading);
   pe('loadState({version:1,setup:{},rows:[]})');pd.getElementById('example').click();for(const key of ['nightLog','sweepGrading'])assert.equal(pe('Object.hasOwn(state,'+JSON.stringify(key)+')'),false,key);assert.deepEqual(paired.errors,[]);
  }finally{pw.confirm=oldConfirm;}
 });
}finally{paired.close();}
console.log('Build3 night-log grading integration: '+count+' checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
