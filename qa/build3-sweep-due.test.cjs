/* Personal reminder contracts against actual Station/Jobs APIs and independent civil-date references. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const {bootApp}=require('./build2-source-harness.cjs');
const app=bootApp(),{w,d,ev,json}=app;let checks=0;
const flush=()=>new Promise(r=>setImmediate(r));
async function check(name,fn){await fn();await flush();assert.deepEqual(app.errors,[]);checks++;console.log('PASS '+name);}
const view=(working,snapshots=[],interval='18',today='2026-11-11')=>json(`SweepDue.collect(${JSON.stringify({working,snapshots,interval,today})})`);
function owner(id='job_synthetic',date='2025-11-11'){
 const value=json('TrainingJob.makePractice("aoi-six-active")');value.job.id=id;value.job.name='SYNTHETIC '+id;
 const targets=json(`StationView.targets(${JSON.stringify(value)}).map(t=>({key:t.key,id:t.id,context:t.context}))`);
 value.stationView={selected:'r1',stations:{}};
 for(const [i,t]of targets.entries()){const identity='synthetic_'+i;const holder=t.key==='source'?value.setup:value.rows.find(r=>r.id===t.key);holder.stationIdentity=identity;value.stationView.stations[identity]={pointId:t.key,equipmentId:t.id,bindingVersion:2,equipmentContext:t.context,balanced:{done:true,date:'2026-01-01'},swept:{done:true,date}};}
 return value;
}
const row=(v,point='r1',group=0)=>v.groups[group].rows.find(r=>r.pointId===point);
(async()=>{
 await check('Sweep due is a new Job tab with an unknown optional preference',()=>{
  assert.equal(ev('typeof SweepDue'),'object','Sweep-due module is available');ev('loadState(TrainingJob.makePractice("aoi-six-active"));delete state.sweepDue');const before=json('state');ev('WorkflowUI.go("sweepDue")');assert.equal(d.querySelector('#sweepDuePanel').hidden,false);assert(d.querySelector('#taskTabs [data-task="sweepDue"]'));assert.equal(d.querySelector('#sweepDueInterval').value,'');assert.deepEqual(json('state'),before);
 });
 await check('An empty tracker offers Station and job-management destinations without creating a preference',()=>{
  ev('loadState({version:1,setup:{...defaultSetup,sourceType:"manual"},rows:[]});WorkflowUI.go("sweepDue")');assert(d.querySelector('#sweepDueList [data-task="station"]'));assert(d.querySelector('#sweepDueList [data-task="projects"]'));assert.equal(ev('state.sweepDue'),undefined);assert.match(d.querySelector('#sweepDueList').textContent,/interval belongs to the open job/i);
 });
 await check('Fourteen independent Python reference cases match actual app output',()=>{
  const cases=JSON.parse(fs.readFileSync('research/build3/sweep-due-calendar-cases.json','utf8'));
  for(const c of cases){const v=json(`SweepDue.classify(${JSON.stringify(c.last)},${JSON.stringify(c.asOf)},${JSON.stringify(String(c.intervalMonths))})`);assert.equal(v.age,c.ageFullCalendarMonths,JSON.stringify(c));assert.equal(v.warning,c.warning);assert.equal(v.due,c.due);assert.equal(v.status,c.status);}
 });
 await check('Strict Gregorian dates reject normalized, padded, whitespace and datetime errors',()=>{
  for(const value of ['1900-02-29','2100-02-29','2025-02-29','2026-04-31','2026-00-01','2026-13-01','2026-01-00','2026-1-01',' 2026-01-01','2026-01-01T00:00Z','0000-01-01'])assert.equal(ev(`SweepDue.parseDate(${JSON.stringify(value)})`),null,value);
  for(const value of ['0001-01-01','2000-02-29','2024-02-29','9999-12-31'])assert(ev(`SweepDue.parseDate(${JSON.stringify(value)})`),value);
  assert.equal(ev('SweepDue.addMonthsClamped("0001-01-31",1)'),'0001-02-28');assert.equal(ev('SweepDue.addMonthsClamped("2025-01-31",2)'),'2025-03-31');
 });
 await check('Two-thirds warning rounds upward at distinguishing short-interval boundaries',()=>{
  for(const [asOf,interval,status,warning,due]of [['2026-02-28','2','green','2026-03-31','2026-03-31'],['2026-03-31','2','red','2026-03-31','2026-03-31'],['2026-04-30','5','green','2026-05-31','2026-06-30'],['2026-05-31','5','yellow','2026-05-31','2026-06-30']]){const r=json(`SweepDue.classify('2026-01-31',${JSON.stringify(asOf)},${JSON.stringify(interval)})`);assert.equal(r.status,status);assert.equal(r.warning,warning);assert.equal(r.due,due);}
 });
 await check('Year-9999 final valid anniversary is available and the next month overflows neutrally',()=>{
  assert.equal(ev('SweepDue.addMonthsClamped("9999-12-31",0)'),'9999-12-31');assert.equal(ev('SweepDue.addMonthsClamped("9999-12-31",1)'),null);
  const last=json('SweepDue.classify("9999-10-31","9999-12-31","2")');assert.equal(last.status,'red');assert.equal(last.warning,'9999-12-31');assert.equal(last.due,'9999-12-31');assert.equal(last.age,2);
  const beyond=json('SweepDue.classify("9999-10-31","9999-12-31","3")');assert.equal(beyond.status,'neutral');assert.equal(beyond.warning,null);assert.equal(beyond.due,null);assert.equal(beyond.age,2);assert.match(beyond.text,/beyond year 9999/);
 });
 await check('Interval is strict whole decimal months, starts unknown, preserves leading zeros',()=>{
  assert.equal(json('SweepDue.parseInterval("")').status,'unknown');for(const value of ['18x','1.5','-1','1e2',' ','0','1201',18,null,'9'.repeat(21)])assert.equal(json(`SweepDue.parseInterval(${JSON.stringify(value)})`).status,'invalid',String(value));assert.equal(json('SweepDue.parseInterval("0018")').value,18);
 });
 await check('Blank or invalid intervals preserve known ages but supply no due date/color',()=>{
  for(const interval of ['','18x']){const v=json(`SweepDue.classify("2025-11-11","2026-11-11",${JSON.stringify(interval)})`);assert.equal(v.age,12);assert.equal(v.status,'neutral');assert.equal(v.due,null);assert.match(v.text,/Interval (unknown|invalid)/);}
 });
 await check('Future, invalid event/today and derived-year overflow are neutral with reasons',()=>{
  for(const [last,today,interval,re]of [['2026-11-12','2026-11-11','18',/Future/],['2025-02-29','2026-11-11','18',/Invalid/],['2025-01-01','bad','18',/device date/i],['9999-12-01','9999-12-02','18',/9999/]]){const v=json(`SweepDue.classify(${JSON.stringify(last)},${JSON.stringify(today)},${JSON.stringify(interval)})`);assert.equal(v.status,'neutral');assert.equal(v.due,null);assert.match(v.text,re);}
 });
 await check('Explicit civil today is timezone and DST independent; actual device date is local',()=>{
  const module=fs.readFileSync('night-sweep/sweep-due.js','utf8');const outputs=[];
  for(const tz of ['UTC','Pacific/Kiritimati','America/Los_Angeles']){const script=module+'\nconsole.log(JSON.stringify([SweepDue.deviceToday(new Date("2026-11-11T00:30:00Z")),SweepDue.classify("2025-11-11","2026-11-11","18"),SweepDue.classify("2025-03-09","2026-03-09","18"),SweepDue.classify("2025-11-02","2026-11-02","18")]))';const r=spawnSync(process.execPath,['-e',script],{env:{...process.env,TZ:tz},encoding:'utf8'});assert.equal(r.status,0,r.stderr);outputs.push(JSON.parse(r.stdout));}
  assert.deepEqual(outputs.map(x=>x[0]),['2026-11-11','2026-11-11','2026-11-10']);assert.deepEqual(outputs[0].slice(1),outputs[1].slice(1));assert.deepEqual(outputs[0].slice(1),outputs[2].slice(1));assert.equal(json('SweepDue.classify("2025-11-11","2026-11-10","18")').status,'green');
 });
 await check('Collector reads source and route Station records without mutating either owners or selection',()=>{
  const a=owner(),b=owner('job_second','2025-04-11'),before=JSON.stringify([a,b]),v=view(a,[b]);assert.equal(v.groups.length,2);assert.equal(v.counts.stations,14);assert.equal(row(v).sweep.status,'yellow');assert.match(row(v,'source').label,/Launch node/);assert.equal(JSON.stringify([a,b]),before);assert.deepEqual(v.diagnostics,[]);
 });
 await check('Pure collection requires explicit civil today; an omitted date never reads a clock into reminders',()=>{
  const v=json('SweepDue.collect('+JSON.stringify({working:owner(),snapshots:[],interval:'18'})+')');assert.equal(v.today,'');assert.equal(row(v).sweep.status,'neutral');assert.equal(row(v).sweep.due,null);assert.match(row(v).sweep.text,/device date/i);
 });
 await check('Current overlay replaces only one uniquely matching saved job and uses latest unsaved dates',()=>{
  const saved=owner(),working=structuredClone(saved);working.stationView.stations.synthetic_1.swept.date='2026-11-11';const v=view(working,[saved]);assert.equal(v.groups.length,1);assert.equal(v.groups[0].current,true);assert.equal(row(v).sweep.status,'green');assert.match(v.groups[0].origin,/Current working/);
 });
 await check('Duplicate/missing snapshot job IDs remain distinct and diagnostics prevent arbitrary overlays',()=>{
  const a=owner(),b=owner(),missing=owner('');const v=view(a,[a,b,missing]);assert.equal(v.groups.length,4);assert.equal(new Set(v.groups.map(g=>g.key)).size,4);assert(v.groups.every(g=>g.diagnostics.length));const c=owner('job_copy');assert.equal(view(a,[a,c]).groups.length,2);assert.equal(row(view(a,[a,c]),'r1',1).sweep.status,'yellow');
 });
 await check('Same Station IDs in separate duplicate jobs never combine their dates',()=>{
  const a=owner('job_original'),b=owner('job_copy','2025-04-11'),v=view(a,[a,b]);assert.equal(row(v,'r1',0).sweep.status,'yellow');assert.equal(row(v,'r1',1).sweep.status,'red');assert.notEqual(v.groups[0].id,v.groups[1].id);
 });
 await check('Missing Station worksheets stay visible as unknown and metadata/project dates never supply events',()=>{
  const a=owner();delete a.stationView;a.job.date='2020-01-01';a.project.forward=[{date:'2020-01-01'}];const v=view(a);assert.equal(v.counts.stations,7);assert.equal(row(v).sweep.status,'neutral');assert.equal(row(v).sweep.date,'');assert.equal(row(v).balance.date,'');
 });
 await check('Replacements, copied point IDs, removed targets and source contexts cannot borrow dates',()=>{
  for(const mutate of [a=>a.rows.find(r=>r.id==='r1').device='active_aoi_le',a=>a.rows.push({...a.rows[0],id:'r99'}),a=>a.node.asset+=' changed',a=>a.node.port+=' changed',a=>a.node.module+=' changed']){const a=owner();mutate(a);const v=view(a);const point=a.rows.some(r=>r.id==='r99')?'r99':a.rows.find(r=>r.id==='r1').device==='active_aoi_le'?'r1':'source';assert.equal(row(v,point).sweep.status,'neutral',point);}
  const a=owner();a.rows=a.rows.filter(r=>r.id!=='r1');a.setup.sourceType='manual';const v=view(a);assert(!v.groups[0].rows.some(r=>['r1','source'].includes(r.pointId)));
 });
 await check('Legacy binding and retired read-only worksheets retain dates without current colors',()=>{
  const a=owner();delete a.stationView.stations.synthetic_1.bindingVersion;delete a.stationView.stations.synthetic_1.equipmentContext;let r=row(view(a));assert.equal(r.sweep.status,'neutral');assert.match(r.historical,/binding unconfirmed/);assert.equal(r.sweep.date,'2025-11-11');
  const b=owner();b.rows[0].device='active_gm_ubt_main';const t=json(`StationView.targets(${JSON.stringify(b)}).find(t=>t.key==='r1')`);Object.assign(b.stationView.stations.synthetic_1,{equipmentId:t.id,equipmentContext:t.context});r=row(view(b));assert.equal(r.sweep.status,'neutral');assert.match(r.historical,/Read-only historical/);delete b.stationView.stations.synthetic_1.bindingVersion;delete b.stationView.stations.synthetic_1.equipmentContext;assert.match(row(view(b)).historical,/Read-only historical/);
 });
 await check('Historical legacy and retired cards retain dates and ages without current-service wording',()=>{
  for(const mode of ['legacy','ubt'])for(const [date,age]of [['2024-01-01',34],['2025-11-11',12],['2026-08-01',3]]){
   const a=owner('job_historical_'+mode,date);if(mode==='legacy'){delete a.stationView.stations.synthetic_1.bindingVersion;delete a.stationView.stations.synthetic_1.equipmentContext;}else{a.rows[0].device='active_gm_ubt_main';const t=json(`StationView.targets(${JSON.stringify(a)}).find(t=>t.key==='r1')`);Object.assign(a.stationView.stations.synthetic_1,{equipmentId:t.id,equipmentContext:t.context});}
   a.sweepDue={intervalMonths:'18'};ev(`loadState(${JSON.stringify(a)})`);const before=json('state'),stores=[w.localStorage.getItem('hfc-route-v1'),w.localStorage.getItem('hfc-named-jobs-v1')];ev('WorkflowUI.go("sweepDue");SweepDue.render("2026-11-11")');const v=json('SweepDue.readView("2026-11-11")'),r=row(v),card=[...d.querySelectorAll('[data-sweep-due-row]')].find(e=>e.textContent.includes('Route point r1 ·'));
   assert.equal(r.sweep.status,'neutral');assert.equal(r.sweep.date,date);assert.equal(r.sweep.done,true);assert.equal(r.sweep.age,age);assert.equal(r.sweep.validity,'Valid civil date');assert.equal(r.sweep.due,null);assert.equal(r.sweep.warning,null);assert.match(r.historical,mode==='legacy'?/binding unconfirmed/:/Read-only historical/);assert.match(r.sweep.text,/Sweep recorded/);assert.match(card.textContent,new RegExp(date));assert.match(card.textContent,new RegExp(age+' completed calendar months old'));assert.match(card.textContent,/Reminder unavailable/);assert.doesNotMatch(card.textContent,/Due \/ overdue|Reminder window|Before reminder window/i);assert.deepEqual(json('state'),before);assert.deepEqual([w.localStorage.getItem('hfc-route-v1'),w.localStorage.getItem('hfc-named-jobs-v1')],stores);
  }
 });
 await check('Unchecked dates, blank recorded dates, invalid and future dates stay separate for both events',()=>{
  for(const key of ['swept','balanced'])for(const [event,re]of [[{done:false,date:'2025-11-11'},/Date entered; .* not recorded/],[{done:true,date:''},/recorded; date unknown/],[{done:true,date:'2025-02-29'},/Invalid/],[{done:true,date:'2026-11-12'},/Future/]]){const a=owner();a.stationView.stations.synthetic_1[key]=event;const r=row(view(a))[key==='swept'?'sweep':'balance'];assert.equal(r.status,'neutral');assert.match(r.text,re);assert.equal(r.date,event.date);}
 });
 await check('Balance never resets sweep and confirmed bindings use original event dates',()=>{
  const a=owner();a.stationView.stations.synthetic_1.balanced={done:true,date:'2026-11-11'};let r=row(view(a));assert.equal(r.sweep.age,12);assert.equal(r.balance.age,0);assert.equal(r.sweep.status,'yellow');
  delete a.stationView.stations.synthetic_1.bindingVersion;delete a.stationView.stations.synthetic_1.equipmentContext;ev(`loadState(${JSON.stringify(a)});WorkflowUI.go('station')`);d.querySelector('[data-station-confirm-binding]').click();assert.equal(json('StationView.records(state).find(r=>r.pointId==="r1")').bindingStatus,'current');r=row(json('SweepDue.readView("2026-11-11")'));assert.equal(r.sweep.date,'2025-11-11');assert.equal(r.sweep.status,'neutral','interval stays unknown');
 });
 await check('Synthetic and sample provenance is per owner and overdue counts are labeled separately',()=>{
  const a=owner('job_training','2025-04-11'),b=owner('job_sample','2025-04-11'),c=owner('job_real','2025-04-11');delete b.job.training;b.job.sample=true;delete c.job.training;delete c.job.sample;c.example=false;const v=view(a,[b,c]);assert.equal(v.groups[0].badge,'SYNTHETIC TRAINING');assert.equal(v.groups[1].badge,'SAMPLE');assert.equal(v.groups[2].badge,'');assert.equal(v.counts.practice.red,14);assert.equal(v.counts.work.red,7);
 });
 await check('Unreadable library and malformed owner preserve readable current rows with visible diagnostics',()=>{
  const a=owner();ev(`loadState(${JSON.stringify(a)});localStorage.setItem(JobsUI.storeKey,'{bad')`);const before=json('state'),v=json('SweepDue.readView("2026-11-11")');assert.match(v.diagnostics.join(' '),/Saved jobs unavailable/);assert.equal(v.groups.length,1);assert.deepEqual(json('state'),before);w.localStorage.removeItem('hfc-named-jobs-v1');const bad=owner('job_bad');bad.stationView.stations=[];const mixed=view(a,[bad]);assert.equal(mixed.groups.length,2);assert.match(mixed.groups[1].diagnostics.join(' '),/unavailable/i);assert.equal(mixed.groups[0].rows.length,7);
 });
 await check('Three actual named synthetic jobs demonstrate 0/12/19 months with entered 18',()=>{
  const jobs=['2026-11-11','2025-11-11','2025-04-11'].map((date,i)=>owner('job_due_'+i,date));const ids=jobs.map(s=>ev(`loadState(${JSON.stringify(s)});delete state.job.id;JobsUI.saveNamed()`));ev(`loadState(JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(ids[0])}));state.sweepDue={intervalMonths:'18'}`);const v=json('SweepDue.readView("2026-11-11")');assert.equal(v.groups.length,3);assert.deepEqual(v.groups.map(g=>g.rows[0].sweep.status),['green','yellow','red']);assert(v.groups.every(g=>g.badge==='SYNTHETIC TRAINING'));
 });
 await check('Actual readView leaves state, Station selection/records and both storage keys byte-identical',()=>{
  ev('WorkflowUI.go("station")');const stateBefore=json('state'),recordsBefore=json('StationView.records(state)'),recordBefore=json('StationView.currentRecord()'),library=w.localStorage.getItem('hfc-named-jobs-v1'),autosave=w.localStorage.getItem('hfc-route-v1');json('SweepDue.readView("2026-11-11")');ev('WorkflowUI.go("sweepDue")');assert.deepEqual(json('state'),stateBefore);assert.deepEqual(json('StationView.records(state)'),recordsBefore);assert.deepEqual(json('StationView.currentRecord()'),recordBefore);assert.equal(w.localStorage.getItem('hfc-named-jobs-v1'),library);assert.equal(w.localStorage.getItem('hfc-route-v1'),autosave);
 });
 await check('Visible-tab resume recomputes local today across midnight without editing any work date',()=>{
  ev('window.__dueRealDate=Date;window.__dueDay=10;Date=class extends window.__dueRealDate{constructor(...args){super(...(args.length?args:[2026,10,window.__dueDay,23,59]));}};WorkflowUI.go("sweepDue")');const before=json('state');assert.match(d.querySelector('#sweepDueAsOf').textContent,/2026-11-10/);ev('window.__dueDay=11;window.dispatchEvent(new Event("pageshow"))');assert.match(d.querySelector('#sweepDueAsOf').textContent,/2026-11-11/);assert.deepEqual(json('state'),before);ev('Date=window.__dueRealDate');
 });
 await check('Preference shape rejects invalid import before replacement; malformed raw text is retained',()=>{
  const before=json('state');for(const bad of [[],{unexpected:''},{intervalMonths:18},{intervalMonths:'x'.repeat(21)},null])assert.throws(()=>ev(`loadState({...state,sweepDue:${JSON.stringify(bad)}})`),/sweep.*due/i);assert.deepEqual(json('state'),before);for(const value of ['18x','1.5','-1','1e2',' ','0']){ev(`loadState({...state,sweepDue:{intervalMonths:${JSON.stringify(value)}}});WorkflowUI.go('sweepDue')`);assert.equal(d.querySelector('#sweepDueInterval').value,value);assert.equal(json('SweepDue.readView("2026-11-11")').counts.practice.green,0);}
 });
 await check('Actual input edit persists raw text without stealing focus and refresh uses real changed dates',()=>{
  ev('WorkflowUI.go("sweepDue")');const input=d.querySelector('#sweepDueInterval');input.focus();input.value='0018';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.activeElement,input);assert.equal(json('state.sweepDue').intervalMonths,'0018');assert.equal(JSON.parse(w.localStorage.getItem('hfc-route-v1')).sweepDue.intervalMonths,'0018');ev('state.stationView.stations.synthetic_1.swept.date="2020-01-01"');d.querySelector('#sweepDueRefresh').click();assert.match(d.querySelector('#sweepDueList').textContent,/2020-01-01/);
 });
 await check('Preference survives save/reload, named duplicate and full JSON backup while practice markers remain',async()=>{
  const id=ev('JobsUI.saveNamed()'),copy=ev(`JobsUI.duplicate(${JSON.stringify(id)})`),snapshot=json(`JobsUI.snapshots().find(s=>s.job.id===${JSON.stringify(copy)})`);assert.equal(snapshot.sweepDue.intervalMonths,'0018');assert.equal(snapshot.job.training,'guided-1.5');assert.equal(view(snapshot).groups[0].badge,'SYNTHETIC TRAINING');const raw=w.localStorage.getItem('hfc-route-v1'),reload=bootApp({beforeParse(b){b.localStorage.setItem('hfc-route-v1',raw);}});assert.equal(reload.json('state.sweepDue').intervalMonths,'0018');reload.close();const backup=JSON.stringify(await w.evidenceExportProject(ev('state')));assert.equal(JSON.parse(backup).sweepDue.intervalMonths,'0018');await ev(`openProjectText(${JSON.stringify(backup)},true)`);ev(`WorkflowUI.go('sweepDue')`);assert.equal(d.querySelector('#sweepDueInterval').value,'0018');
 });
 await check('Preference-only working content is kept before opening another project',()=>{
  ev('loadState({version:1,setup:{...defaultSetup,sourceType:"manual"},rows:[],sweepDue:{intervalMonths:"18"}});JobsUI.beforeProjectOpen({confirmed:true})');assert(json('JobsUI.snapshots()').some(s=>s.sweepDue?.intervalMonths==='18'&&!s.rows.length));
 });
 await check('Autosave quota failure retains edit and tells technician to export a backup',()=>{
  ev('WorkflowUI.go("sweepDue");window.__dueStorage=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error("Synthetic quota")}');const input=d.querySelector('#sweepDueInterval');input.value='24';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(json('state.sweepDue').intervalMonths,'24');assert.match(d.querySelector('#sweepDueSaveStatus').textContent,/Not saved.*Autosave failed.*Export.*backup/i);const status=d.querySelector('#sweepDueSaveStatus');assert.equal(input.nextElementSibling,status);assert.equal(status.closest('.sweep-due-setting'),input.closest('.sweep-due-setting'));assert(input.getAttribute('aria-describedby').split(/\s+/).includes(status.id));assert(status.classList.contains('warning'));ev('SweepDue.render()');assert.match(status.textContent,/Not saved/);ev('Storage.prototype.setItem=window.__dueStorage');
 });
 await check('Save feedback belongs to the actual interval owner and never follows a different job',()=>{
  const other=owner('job_other');other.sweepDue={intervalMonths:'24'};ev(`loadState(${JSON.stringify(other)});WorkflowUI.go('sweepDue')`);assert.equal(d.querySelector('#sweepDueSaveStatus').textContent,'');const input=d.querySelector('#sweepDueInterval');input.value='18';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(d.querySelector('#sweepDueSaveStatus').textContent,/saved on this device/);const next=owner('job_next');next.sweepDue={intervalMonths:'18'};ev(`loadState(${JSON.stringify(next)});WorkflowUI.go('sweepDue')`);assert.equal(d.querySelector('#sweepDueSaveStatus').textContent,'');
 });
 await check('Bounded page navigation shows complete counts and never silently drops a source',()=>{
  const jobs=Array.from({length:8},(_,i)=>owner('job_page_'+i));ev(`loadState(${JSON.stringify(owner('job_working'))});window.__dueFixture=${JSON.stringify(jobs)};window.__oldDueSnapshots=JobsUI.snapshots;JobsUI.snapshots=()=>window.__dueFixture;SweepDue.render('2026-11-11')`);assert.equal(d.querySelectorAll('[data-sweep-due-row]').length,25);assert.match(d.querySelector('#sweepDueSummary').textContent,/63 stations/);const before=d.querySelector('#sweepDueList').textContent;d.querySelector('[data-sweep-due-page="next"]').click();assert.notEqual(d.querySelector('#sweepDueList').textContent,before);assert.equal(d.querySelectorAll('[data-sweep-due-row]').length,25);ev('JobsUI.snapshots=window.__oldDueSnapshots');
 });
 await check('Sweep-due practice and guides include every runtime feature exactly once with measured counts',()=>{
  const feature=json('TrainingJob.features.find(f=>f.id==="sweepDue")||null');assert(feature,'Sweep due practice feature');assert.equal(feature.variant,'aoi-six-active');assert.equal(feature.control,'#sweepDueInterval');const steps=json('TrainingJob.stepsFor("aoi-six-active")');for(const exercise of json('TrainingJob.exercises'))assert.equal(Number(exercise.summary.match(/^([0-9]+) steps/)[1]),json('TrainingJob.stepsFor('+JSON.stringify(exercise.id)+')').length,exercise.id+' displayed step count');assert.equal(steps.find(s=>s[0]===feature.step)[2],'sweepDue');assert.match(steps.find(s=>s[0]===feature.step)[4],/18/);assert.match(steps.find(s=>s[0]===feature.step)[4],/clear/i);
  const features=json('TrainingJob.features'),screens=json('Object.keys(WorkflowUI.screens)'),guide=fs.readFileSync('docs/NightSweep_1.8_Alpha_Functions_README.md','utf8');for(const f of features)assert.equal(guide.split('<!-- feature:'+f.id+' -->').length-1,1,f.id);assert.match(guide,new RegExp(screens.length+' task screens'));assert.match(guide,new RegExp(features.length+' entries'));assert.match(guide,new RegExp('## '+features.length+'-feature coverage index'));assert.match(guide,/\[Sweep due\]\(#sweep-due\)/);assert.match(guide,new RegExp(steps.length+' steps'));
  assert.equal(fs.readFileSync('night-sweep/README.md','utf8'),fs.readFileSync('docs/NightSweep_1.8_Alpha_README.md','utf8'));
 });
 await check('Rendered guide contents cover every current section and marker; guide totals match runtime',()=>{
  const md=fs.readFileSync('docs/NightSweep_1.8_Alpha_Functions_README.md','utf8'),rendered=new w.DOMParser().parseFromString(fs.readFileSync('docs/NightSweep_1.8_Alpha_Functions_README.html','utf8'),'text/html'),toc=md.split('## Guide contents')[1].split('## Working rules')[0],features=json('TrainingJob.features'),screenCount=json('Object.keys(WorkflowUI.screens)').length;assert.deepEqual([...md.matchAll(/<!-- feature:([^ ]+) -->/g)].map(m=>m[1]).sort(),features.map(f=>f.id).sort());
  for(const h of rendered.querySelectorAll('h2[id]'))if(h.id!=='guide-contents')assert(toc.includes('(#'+h.id+')'),h.id+' missing from current contents');const ids=[...rendered.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);for(const link of rendered.querySelectorAll('a[href^="#"]'))assert(rendered.getElementById(link.getAttribute('href').slice(1)),'broken guide fragment '+link.getAttribute('href'));
  for(const file of ['night-sweep/README.md','docs/NightSweep_1.8_Training_Coverage.md']){const text=fs.readFileSync(file,'utf8');assert(text.includes('**'+screenCount+' task screens**'),file);assert(text.includes('**'+features.length+' feature choices**'),file);}
 });
 await check('Older 18-month guidance has an Unknown source tag and never sets the interval',()=>{
  const ref=json('Thresholds.get("app.sweepDue.olderIntervalReference")');assert(ref,'unverified guidance source is registered');assert.equal(ref.label,'unknown');assert.equal(ref.verification,'unverified');assert(d.querySelector('#sweepDuePanel [data-threshold="app.sweepDue.olderIntervalReference"]'));
 });
 await check('Registry fields, source labels and strict resolver describe reminder choices without cadence defaults',()=>{
  for(const id of ['company.sweepDue.intervalMonths','app.sweepDue.warningPolicy','app.sweepDue.intervalRange','app.sweepDue.calendarPolicy']){assert.deepEqual(json(`Thresholds.checkRow(Thresholds.get(${JSON.stringify(id)}))`),[]);assert.equal(ev(`Thresholds.matches(${JSON.stringify(id)})`),1);assert.equal(json(`Thresholds.get(${JSON.stringify(id)})`).label,id.startsWith('company')?'company':'unknown');}
  for(const value of ['','18x','0','1e2'])assert.equal(json(`Thresholds.resolve('company.sweepDue.intervalMonths',{sweepDue:{intervalMonths:${JSON.stringify(value)}}})`).value,null);assert.equal(json("Thresholds.resolve('company.sweepDue.intervalMonths',{sweepDue:{intervalMonths:'0018'}})").value,18);
 });
 console.log('Build3 sweep due: '+checks+' checks passed');app.close();
})().catch(e=>{console.error(e.stack);app.close();process.exitCode=1;});
