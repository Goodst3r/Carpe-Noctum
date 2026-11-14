const {bootApp}=require('./build2-source-harness.cjs');
const {performance}=require('perf_hooks');
const h=bootApp(), ev=h.ev, d=h.d, w=h.w;
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{for(let i=0;i<60;i++)await flush();
ev(`state.evidence=Array.from({length:30},(_,i)=>({id:'bench'+i,name:'synthetic.csv',kind:'Sweep',stage:'Before',size:10,importedAt:'2026-01-01',sha256:'synthetic',parse:{status:'parsed',series:{unit:'dBmV',points:Array.from({length:10000},(_,n)=>[n/10,20+n%30])}}}));`);
let a=[];for(let i=0;i<10;i++){let t=performance.now();ev('EvidenceUI.render()');a.push(performance.now()-t);} console.log('evidence ms',a,'trace paths',d.querySelectorAll('#evidencePanel path[stroke="#85d9f6"]').length,'tables',d.querySelectorAll('#evidencePanel table').length);
ev(`window.__benchJobs=Array.from({length:200},(_,i)=>{let x=TrainingJob.makePractice('aoi-six-active');x.job.id='bench'+i;x.rows=Array.from({length:39},(_,n)=>({...x.rows[1],id:'b'+n}));return x});window.__originalSnapshots=JobsUI.snapshots;window.__calls=0;JobsUI.snapshots=()=>{window.__calls++;return window.__benchJobs};WorkflowUI.go('sweepDue');`);
console.log('fixture jobs',ev('window.__benchJobs.length'),'stations',ev('SweepDue.readView().counts.stations'));ev('window.__calls=0');let input=d.querySelector('#sweepDueInterval');let b=[];for(let i=0;i<10;i++){input.value=String(i+1);let t=performance.now();input.dispatchEvent(new w.Event('input',{bubbles:true}));b.push(performance.now()-t)}console.log('sweep input ms',b,'typing snapshot calls',ev('window.__calls'));let before=ev('window.__calls');input.dispatchEvent(new w.Event('change',{bubbles:true}));console.log('commit snapshot calls',ev('window.__calls')-before);h.close();})().catch(e=>{console.error(e);process.exitCode=1});
