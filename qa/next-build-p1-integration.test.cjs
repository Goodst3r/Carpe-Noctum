'use strict';
// Full source startup and public job/print paths; synthetic data only.
const assert=require('node:assert/strict'),{test}=require('node:test');
const {bootApp}=require('./build2-source-harness.cjs');
function fixture(app,id,interval,short=false){
 const owner=app.json('TrainingJob.makePractice("aoi-six-active")');
 owner.job.id=id;owner.job.name='SYNTHETIC '+id;owner.sweepDue={intervalMonths:interval};
 if(short)owner.rows=[];
 return owner;
}
function start(t){
 const app=bootApp();t.after(()=>{assert.deepEqual(app.errors,[]);app.close();});return app;
}
test('visible Sweep Due follows a project import and its retained previous job without navigation',async t=>{
 const app=start(t),{d,ev}=app;
 ev(`loadState(${JSON.stringify(fixture(app,'job_import_old','18'))});WorkflowUI.go('sweepDue')`);
 assert.match(d.querySelector('#sweepDueSummary').textContent,/1 job sources · 7 stations/);
 await ev(`openProjectText(${JSON.stringify(JSON.stringify(fixture(app,'job_import_new','30',true)))},true)`);
 assert.equal(d.querySelector('#sweepDueInterval').value,'30');
 assert.match(d.querySelector('#sweepDueSummary').textContent,/2 job sources · 8 stations/);
 assert.doesNotMatch(d.querySelector('#sweepDueSummary').textContent,/stale/);
 assert.match(d.querySelector('#sweepDueList').textContent,/job_import_new/);
 assert.match(d.querySelector('#sweepDueList').textContent,/job_import_old/);
});
test('visible Sweep Due refreshes saved-library additions and removals without navigation',t=>{
 const app=start(t),{d,ev}=app;
 ev(`loadState(${JSON.stringify(fixture(app,'job_library','18'))});WorkflowUI.go('sweepDue')`);
 const id=ev('JobsUI.saveNamed()');
 assert.match(d.querySelector('#sweepDueSummary').textContent,/1 job sources · 7 stations/);
 const copy=ev(`JobsUI.duplicate(${JSON.stringify(id)})`);
 assert.match(d.querySelector('#sweepDueSummary').textContent,/2 job sources · 14 stations/);
 ev(`JobsUI.remove(${JSON.stringify(copy)})`);
 assert.match(d.querySelector('#sweepDueSummary').textContent,/1 job sources · 7 stations/);
 assert.doesNotMatch(d.querySelector('#sweepDueList').textContent,/\(copy\)/);
});
test('a focused pending interval stays stale on redraw and is replaced on a working-owner switch',t=>{
 const app=start(t),{w,d,ev}=app;
 ev(`loadState(${JSON.stringify(fixture(app,'job_draft_owner','18'))});WorkflowUI.go('sweepDue')`);
 const input=d.querySelector('#sweepDueInterval');input.focus();input.value='30';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 ev('renderAll()');
 assert.equal(d.activeElement,input);assert.equal(input.value,'30');
 assert.match(d.querySelector('#sweepDueSummary').textContent,/stale/);
 assert.equal(d.querySelectorAll('[data-sweep-due-row]').length,0);
 ev(`loadState(${JSON.stringify(fixture(app,'job_switched_owner','6',true))})`);
 assert.equal(d.activeElement,input);assert.equal(input.value,'6');
 assert.match(d.querySelector('#sweepDueSummary').textContent,/1 job sources · 1 stations/);
 assert.doesNotMatch(d.querySelector('#sweepDueList').textContent,/job_draft_owner/);
 // A queued change from the previously focused control cannot restore its draft.
 input.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(ev('state.sweepDue.intervalMonths'),'6');
 w.dispatchEvent(new w.Event('pageshow'));
 assert.equal(input.value,'6');assert.equal(ev('state.sweepDue.intervalMonths'),'6');
});
test('full-app direct print preparation synchronously materializes evidence and restores disclosures',async t=>{
 const app=start(t),{d,ev}=app;
 const csv='frequency_mhz,level_dbmv\r\n261,34\r\n993,46\r\n';
 const bytes=new TextEncoder().encode(csv);
 await ev('EvidenceUI').importFiles([{name:'synthetic-print.csv',size:bytes.byteLength,type:'text/csv',arrayBuffer:async()=>bytes.slice().buffer}],{kind:'Sweep',stage:'Before'});
 const preview=d.querySelector('[data-evidence-preview]');
 assert.equal(preview.open,false);assert.equal(preview.querySelector('svg'),null);
 const before=JSON.stringify(app.json('state.evidence'));
 ev('NightSweep.preparePrint()');
 // Do not dispatch beforeprint/toggle or yield: the native bridge calls this synchronously.
 assert.equal(preview.open,true);assert.equal(preview.querySelectorAll('svg').length,1);
 assert.equal(preview.querySelectorAll('tbody tr').length,2);
 assert.equal(preview.querySelector('path[stroke="#85d9f6"]').getAttribute('d'),'M48.00,160.34 L540.00,39.66');
 ev('NightSweep.preparePrint();NightSweep.restorePrint()');
 assert.equal(preview.open,false);assert.equal(JSON.stringify(app.json('state.evidence')),before);
 const exported=await ev('evidenceExportProject(state)');
 assert.equal(new TextDecoder().decode(ev('EvidenceCore').base64ToBytes(exported.evidenceFiles[0].base64)),csv);
 ev('EvidenceUI.render()');assert.equal(d.querySelector('#evidencePanel svg'),null);
});
