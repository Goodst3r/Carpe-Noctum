'use strict';
const fs=require('fs'),assert=require('assert/strict');
const root=process.argv[2]||'/workspace/Carpe-Noctum-pr34';
const {JSDOM,VirtualConsole}=require(root+'/qa/runtime/node_modules/jsdom');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(root+'/outputs/Night_Sweep.html','utf8'),{url:'https://pr34.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name)}
check('all three new registry rows have complete metadata and expected labels',()=>{
 const rows=json('Thresholds.rows.filter(r=>r.id.startsWith("calc.power."))');assert.equal(rows.length,3);
 assert.deepEqual(rows.map(r=>[r.id,r.label]),[['calc.power.sum','expert'],['calc.power.minCount','unknown'],['calc.power.safeCount','unknown']]);
 for(const r of rows){assert.deepEqual(json('Thresholds.checkRow(Thresholds.get('+JSON.stringify(r.id)+'))'),[]);assert.equal(r.scope,'all');assert(!r.store)}
});
check('count bounds are registered as policies',()=>{assert.equal(ev('Thresholds.get("calc.power.minCount").value'),2);assert.equal(ev('Thresholds.get("calc.power.safeCount").value'),9007199254740991)});
check('new power card states its reference, correlation, no company limit and plants scope',()=>{ev("WorkflowUI.go('calculators')");const t=d.querySelector('[data-calc-card="power"]').textContent;for(const s of ['dBmV','uncorrelated','Same impedance','same measurement plane','compatible bandwidth','No company limit','42/54 or 204/258'])assert(t.includes(s));});
check('new power registry introduces no company value',()=>assert(json('Thresholds.rows.filter(r=>r.id.startsWith("calc.power."))').every(r=>r.label!=='company')));
const snapshot=()=>ev('JSON.stringify({state,storage:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),registry:Thresholds.rows})');
const before=snapshot();
function set(sel,value,event='input'){const el=d.querySelector(sel);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));}
check('power add at UI returns expected value',()=>{set('[data-power-level]','40');const l=d.querySelectorAll('[data-power-level]')[1];l.value='40';l.dispatchEvent(new w.Event('input',{bubbles:true}));assert(d.querySelector('#calc-power-result').textContent.includes('43.0103'))});
check('equal carriers at UI returns expected value',()=>{set('[data-calc="power"][data-field="operation"]','equal_carriers','change');set('[data-calc="power"][data-field="level"]','40');set('[data-calc="power"][data-field="count"]','8');assert(d.querySelector('#calc-power-result').textContent.includes('49.0309'))});
check('noise subtraction at UI returns expected signal and SNR units',()=>{set('[data-calc="power"][data-field="operation"]','subtract_noise','change');set('[data-calc="power"][data-field="total"]','10');set('[data-calc="power"][data-field="noise"]','0');const t=d.querySelector('#calc-power-result').textContent;assert(t.includes('9.54243'));assert(t.includes('dBmV'));assert(t.includes('Signal / noise'));assert(t.includes('dB'))});
check('all three power operations leave job, localStorage and registry byte-identical',()=>assert.equal(snapshot(),before));
const group=JSON.parse(fs.readFileSync(root+'/handoff_docs/reviews/chatgpt-calculator-test-vectors.json','utf8')).calculators.power_sum;
for(const c of [...group.worked_cases,...group.extra_edge_cases])check(c.id+' exact six-significant UI text including trailing zeroes',()=>{
 const input=c.inputs;set('[data-calc="power"][data-field="operation"]',input.operation,'change');
 if(input.operation==='power_add'){
  while(d.querySelectorAll('[data-power-level]').length<input.levels_dBmV.length)d.querySelector('[data-power-add]').click();
  for(const el of d.querySelectorAll('[data-power-level]'))el.value='';
  input.levels_dBmV.forEach((value,i)=>{const el=d.querySelectorAll('[data-power-level]')[i];el.value=value});
 }else if(input.operation==='equal_carriers'){
  set('[data-calc="power"][data-field="level"]',input.level_dBmV);set('[data-calc="power"][data-field="count"]',input.N);
 }else{
  set('[data-calc="power"][data-field="total"]',input.total_dBmV);set('[data-calc="power"][data-field="noise"]',input.noise_dBmV);
 }
 ev("FieldCalcs.update('power')");
 const printed=[...d.querySelectorAll('#calc-power-result .calc-stats strong')].map(el=>el.firstChild.nodeValue.trim());
 assert.deepEqual(printed,Object.values(c.expected_6sf));
});
check('source tag opens the registered power-sum details',()=>{d.querySelector('[data-calc-card="power"] [data-threshold]').click();assert(ev('Thresholds.isOpen()'));const t=d.querySelector('dialog.source-sheet').textContent;for(const s of ['NIST SP 811','SCTE 270','dBmV','Expert'])assert(t.includes(s));});
check('no jsdom runtime errors',()=>assert.deepEqual(errors,[]));
console.log('Independent scope: '+checks+' checks passed');dom.window.close();
