/* Technician task/navigation tests against the built app DOM; no pixel-layout claim. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const cases=[],errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('outputs/Night_Sweep.html','utf8'),{url:'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};w.structuredClone=structuredClone;
 w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
 w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),json=s=>JSON.parse(ev('JSON.stringify('+s+')'));
const flush=()=>new Promise(r=>setImmediate(r));
async function check(name,fn){await fn();await flush();assert.deepEqual(errors,[],'runtime errors');cases.push(name);console.log('PASS '+name);}
function visible(e){if(!e)return false;for(let p=e;p&&p.nodeType===1;p=p.parentElement){if(p.hidden||w.getComputedStyle(p).display==='none')return false;if(p.tagName==='DETAILS'&&!p.open&&p!==e&&!p.querySelector(':scope > summary')?.contains(e))return false;}return true;}
function click(selector){const e=d.querySelector(selector);assert(e,selector);e.click();return e;}
function set(selector,value,event='input'){const e=d.querySelector(selector);assert(e,selector);if(e.type==='checkbox')e.checked=!!value;else e.value=value;e.dispatchEvent(new w.Event(event,{bubbles:true}));return e;}
function go(screen){ev('WorkflowUI.go('+JSON.stringify(screen)+')');assert.equal(ev('WorkflowUI.current()'),screen);}
function uniqueIds(){const ids=[...d.querySelectorAll('[id]')].map(e=>e.id),dups=ids.filter((id,i)=>ids.indexOf(id)!==i);assert.deepEqual(dups,[],'Duplicate DOM IDs');}
function shown(selector){assert(visible(d.querySelector(selector)),selector+' should be visible');}
function hidden(selector){assert(!visible(d.querySelector(selector)),selector+' should be hidden');}
const field=(id,key)=>`#route [data-row="${id}"] [data-field="${key}"]`;
const map={station:['stationPanel'],home:['homePanel'],sweepSetup:['sweepSetupPanel'],setup:['setup'],route:['routePanel'],gain:['routePanel'],parts:['catalogPanel'],tdr:['tdrPanel'],sweep:['sweepPanel','levelsPanel'],frequency:['frequencyPanel'],readings:['routePanel'],references:['fieldReferencePanel'],power:['powerPanel'],trial:['powerPanel'],projects:['jobsPanel','projectPanel'],evidence:['projectPanel'],checklists:['fieldWorkPanel'],records:['projectPanel'],runsheet:['runSheetPanel']};
(async()=>{
 await check('App starts at Home with five named primary tasks and no duplicated controls',()=>{
  assert.equal(d.title,'Carpe Noctum 2.0 Alpha build 3');assert.equal(ev('WorkflowUI.current()'),'home');shown('#homePanel');
  assert.deepEqual([...d.querySelectorAll('[data-main-tab]')].map(x=>x.dataset.mainTab),['home','plan','field','tools','closeout']);
  assert.equal(d.querySelectorAll('[data-main-tab][aria-current="page"]').length,1);uniqueIds();
 });
 await check('Every documented task is reachable and isolates its intended panels',()=>{
  const before=ev('JSON.stringify(state)');
  for(const [task,ids] of Object.entries(map)){go(task);const live=[...d.querySelectorAll('[data-screen]')].filter(e=>!e.hidden&&e.dataset.screen!=='help').map(e=>e.id).sort();assert.deepEqual(live,ids.slice().sort(),task);uniqueIds();}
  assert.equal(ev('JSON.stringify(state)'),before,'Navigation must not edit the working job');
 });
 await check('Home task shortcuts route directly to gain and TDR tools',()=>{
  go('home');shown('#homePanel [data-task="gain"]');click('#homePanel [data-task="gain"]');assert.equal(ev('WorkflowUI.current()'),'gain');
  go('home');shown('#homePanel [data-task="tdr"]');click('#homePanel [data-task="tdr"]');assert.equal(ev('WorkflowUI.current()'),'tdr');
 });
 await check('Subtabs support keyboard movement and identify real controlled content',()=>{
  go('setup');const a=d.querySelector('#taskTabs [data-task="setup"]');assert(a);a.focus();a.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(ev('WorkflowUI.current()'),'route');assert.equal(d.activeElement.dataset.task,'route');
  d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true}));assert.equal(ev('WorkflowUI.current()'),ev('WorkflowUI.groups.plan.tabs.at(-1)[0]'));
  d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true}));assert.equal(ev('WorkflowUI.current()'),'projects');
  assert.equal(d.querySelectorAll('#taskTabs [aria-selected="true"]').length,1);
  for(const b of d.querySelectorAll('#taskTabs [aria-controls]')){const targets=b.getAttribute('aria-controls').trim().split(/\s+/).map(id=>d.getElementById(id));assert(targets.length&&targets.every(Boolean));assert(targets.some(e=>e.children.length>0),'Tab controls must point at actual content');}
 });
 await check('Primary task buttons remember the last subtask within the session',()=>{
  go('frequency');click('[data-main-tab="home"]');click('[data-main-tab="tools"]');assert.equal(ev('WorkflowUI.current()'),'frequency');
  go('parts');click('[data-main-tab="closeout"]');click('[data-main-tab="tools"]');assert.equal(ev('WorkflowUI.current()'),'parts');
 });
 await check('Setup fields stay in Setup and update predictions without opening other tasks',()=>{
  go('setup');set('[data-setup="lowLevel"]','34');set('[data-setup="highLevel"]','46');set('[data-setup="temperature"]','68');assert.equal(ev('WorkflowUI.current()'),'setup');shown('#setup');hidden('#routePanel');hidden('#tdrPanel');
  assert.equal(ev('evaluate(993).source'),46);
 });
 await check('Cable route focuses one live point and Previous/Next edit the correct span',()=>{
  ev(`state.setup={...defaultSetup,lowLevel:20,highLevel:30};state.rows=[{id:'r1',name:'Pole A',parent:'source',length:132,slack:0,cable:'custom',customCable:'261,1\\n993,1',device:'none'},{id:'r2',name:'Pole B',parent:'r1::through',length:118,slack:0,cable:'custom',customCable:'261,1\\n993,1',device:'none'}];state.routeTools={frequency:993,endpoint:'r2',start:'source',direction:'forward',distance:'',lead:0,vfEnabled:false};state.example=false;serial=3;renderAll();`);
  go('route');set('#pointSelect','r2','change');assert.equal(d.querySelectorAll('#route>[data-row]:not([hidden])').length,1);assert.equal(d.querySelector('#route>[data-row]:not([hidden])').dataset.row,'r2');
  set(field('r2','length'),'100');set(field('r2','slack'),'18');assert.equal(ev('state.rows[1].length'),'100');assert.equal(ev('HFC.routeDistances(state,catalog).byId.get("r2").end'),250);
  click('#pointPrevious');assert.equal(d.querySelector('#pointSelect').value,'r1');click('#pointNext');assert.equal(d.querySelector('#pointSelect').value,'r2');hidden('#tdrPanel');hidden('#setup');
 });
 await check('TDR task retains the branch/origin and maps 180 ft to the second span',()=>{
  go('tdr');set('[data-route-tool="distance"]','180');assert.match(d.querySelector('#tdrResult').textContent,/48 ft into this span/);assert.match(d.querySelector('#tdrResult').textContent,/70 ft before Pole B/);hidden('#routePanel');
  go('route');go('tdr');assert.equal(d.querySelector('[data-route-tool="distance"]').value,'180');
 });
 await check('Adding a route point selects it and its active editor appears only in Amp gain',()=>{
  go('route');click('#add');const id=ev('state.rows.at(-1).id');assert.equal(d.querySelector('#pointSelect').value,id);set(field(id,'length'),'0');set(field(id,'passiveType'),'active','change');
  hidden('#route [data-row="'+id+'"] .active-editor');click('#route [data-row="'+id+'"] [data-point-task="gain"]');assert.equal(ev('WorkflowUI.current()'),'gain');assert.equal(d.querySelector('#pointSelect').value,id);shown('#route [data-row="'+id+'"] .active-editor');
  assert.equal(d.querySelectorAll('#pointSelect option').length,1);hidden('#route [data-row="'+id+'"] .routefields');
 });
 await check('Gain inputs and measured helper still change the selected active through retained event delegates',()=>{
  const id=ev('state.rows.at(-1).id');set(field(id,'gainLow'),'23');set(field(id,'gainHigh'),'30');set(field(id,'targetLow'),'36');set(field(id,'targetHigh'),'50');
  assert.match(d.getElementById('gain-budget-'+id).textContent,/covers this route with reserve/);assert.equal(ev('evaluate(993).results.at(-1).outputs[0].level'),57.5);
  set(field(id,'measureIn'),'10');set(field(id,'measureOut'),'20');set(field(id,'measureInTP'),'20');set(field(id,'measureOutTP'),'20');set(field(id,'measureF'),'993');click('#route [data-row="'+id+'"] [data-use-gain="high"]');
  assert.equal(ev('state.rows.at(-1).gainHigh'),10);assert.match(d.getElementById('gain-budget-'+id).textContent,/Not enough entered gain/);assert.equal(ev('WorkflowUI.current()'),'gain');uniqueIds();
 });
 await check('Readings tab reuses route meter controls and stores only the chosen point',()=>{
  go('readings');set('#pointSelect','r2','change');shown('#route [data-row="r2"] .point-meters');hidden('#route [data-row="r2"] .routefields');
  const f='#route [data-row="r2"] [data-meter-port="through"] ';set(f+'[data-meter-field="reading"]','10');set(f+'[data-meter-field="couplingChoice"]','20','change');
  assert.equal(ev('meterComparison(state.rows[1],"through").measurement'),30);assert.equal(ev('state.rows[0].meters'),undefined);assert.equal(ev('state.project.forward.length'),0);
  go('route');shown('#route [data-row="r2"] .routefields');hidden('#route [data-row="r2"] .point-meters');assert.equal(ev('state.rows[1].meters.through.reading'),'10');
 });
 await check('Optional point tools remain collapsed but live when opened',()=>{
  const extras=d.querySelector('#route [data-row="r2"] .point-extras');assert(extras);assert.equal(extras.open,false);extras.open=true;
  const note=extras.querySelector('.point-as-built');note.open=true;set(field('r2','asBuiltNote'),'Field map corrected 18 ft slack');assert.equal(ev('state.rows[1].asBuiltNote'),'Field map corrected 18 ft slack');
  go('tdr');go('route');assert.equal(ev('state.rows[1].asBuiltNote'),'Field map corrected 18 ft slack');uniqueIds();
 });
 await check('Job Details, ONX files and Records separate content without breaking node edits',()=>{
  go('projects');shown('#jobsPanel');shown('#nodePanel');hidden('#evidencePanel');set('[data-node-field="model"]','vecima-en9000','change');assert.equal(ev('state.node.model'),'vecima-en9000');
  go('evidence');shown('#evidencePanel');hidden('#nodePanel');hidden('#jobsPanel');shown('#evidenceFiles');
  go('records');hidden('#evidencePanel');hidden('#nodePanel');assert([...d.querySelector('#projectPanel').children].some(e=>!e.hidden));
 });
 await check('Checklists update job notes and run sheet without leaking into other tabs',()=>{
  go('checklists');shown('#fieldWorkPanel');const section=d.querySelector('[data-field-section="leakage"]');section.open=true;set('[data-leakage-check="connectors"]',true,'change');set('[data-leakage-notes]','Connector inspected in1.5');assert.equal(ev('state.fieldWork.leakage.checks.connectors'),true);
  go('runsheet');shown('#runSheetPanel');hidden('#fieldWorkPanel');assert.match(ev('FieldReport.sheetText()'),/Connector inspected in1\.5/);
 });
 await check('Power Load and What-if isolate controls and keep the trial noncommittal',()=>{
  go('power');shown('#powerRows');hidden('#powerWhatIf');set('[data-power-field="mode"]','amps','change');set('[data-power-field="load"]','0');const before=ev('state.power.rows.length');
  go('trial');shown('#powerWhatIf');hidden('#powerRows');set('[data-trial="length"]','100');set('[data-trial="amps"]','1');assert.equal(ev('state.power.rows.length'),before);
  click('#keepPowerTrial');assert.equal(ev('state.power.rows.length'),before+1);assert.equal(ev('WorkflowUI.current()'),'trial');go('power');shown('#powerRows');
 });
 await check('Exports and full rerenders preserve the selected task and no IDs duplicate',async()=>{
  go('readings');set('#pointSelect','r2','change');ev('renderAll()');assert.equal(ev('WorkflowUI.current()'),'readings');assert.equal(d.querySelector('#pointSelect').value,'r2');shown('#route [data-row="r2"] .point-meters');uniqueIds();
  await d.getElementById('save').onclick();const out=downloads.at(-1);assert.equal(out.name,'CarpeNoctum_2.0_Alpha_build_3_Project.json');const saved=JSON.parse(out.text);assert.equal(saved.rows[1].meters.through.reading,'10');assert.equal(saved.rows[1].asBuiltNote,'Field map corrected 18 ft slack');assert.equal(saved.routeTools.distance,'180');
 });
 await check('Removing the last active produces an actionable empty Gain task without stale values',()=>{
  const id=ev('state.rows.at(-1).id');go('route');ev('WorkflowUI.selectPoint('+JSON.stringify(id)+')');click('#route [data-row="'+id+'"] [data-delete]');go('gain');shown('#pointEmpty');assert.match(d.querySelector('#pointEmptyText').textContent,/Add an amplifier/);assert.equal(d.querySelector('#pointSelect').disabled,true);assert.equal([...d.querySelectorAll('#route>[data-row]')].filter(visible).length,0);uniqueIds();
 });
 await check('Clicked task tabs retain focus and Frequency opens its actual checker',()=>{
  go('calculators');const button=d.querySelector('#taskTabs [data-task="frequency"]');button.focus();button.click();assert.equal(ev('WorkflowUI.current()'),'frequency');assert.equal(d.activeElement.dataset.task,'frequency');assert.equal(d.querySelector('#frequencyPanel details').open,true);shown('[data-frequency="quickF"]');
 });
 await check('Tap reference shortcut selects and expands the intended existing route point',()=>{
  ev("state.rows[0].device=modelId('OTTZ-4-23');renderAll()");go('route');set('#pointSelect','r2','change');go('references');d.querySelector('[data-reference-section="root"]').open=true;d.querySelector('[data-reference-section="faces"]').open=true;set('[data-reference-tap]','r1','change');click('#openReferenceTap');
  assert.equal(ev('WorkflowUI.current()'),'route');assert.equal(d.querySelector('#pointSelect').value,'r1');assert.equal(d.querySelector('#route [data-row="r1"] .point-extras').open,true);shown('#route [data-row="r1"] [data-face-choice]');assert.equal(d.activeElement.hasAttribute('data-face-choice'),true);
 });
 await check('General report print exposes hidden task sections and restores the same working view',async()=>{
  go('trial');const children=[...d.querySelectorAll('#projectPanel > *,#powerPanel > *')],before=children.map(el=>el.hidden);assert(before.some(Boolean));const input=ev('JSON.stringify(state)');
  w.NightSweep.preparePrint();await flush();assert(children.every(el=>!el.hidden),'All project/power sections must be available to general printing');assert.equal(ev('WorkflowUI.current()'),'trial');
  w.NightSweep.restorePrint();await flush();assert.deepEqual(children.map(el=>el.hidden),before);assert.equal(ev('JSON.stringify(state)'),input);shown('#powerWhatIf');hidden('#powerRows');
 });
 await check('Run-sheet-only printing does not expand unrelated project and power sections',async()=>{
  go('runsheet');const children=[...d.querySelectorAll('#projectPanel > *,#powerPanel > *')],before=children.map(el=>el.hidden);click('#runSheetPrint');assert(d.body.classList.contains('print-runsheet'));w.NightSweep.preparePrint();await flush();assert.deepEqual(children.map(el=>el.hidden),before);w.NightSweep.restorePrint();await flush();assert(!d.body.classList.contains('print-runsheet'));assert.equal(ev('WorkflowUI.current()'),'runsheet');shown('#runSheetPanel');
 });
 await check('Help and Sun/Night remain accessible without changing calculations',()=>{
  const before=json('[evaluate(261).source,evaluate(993).source]');click('#helpButton');assert.equal(ev('WorkflowUI.current()'),'help');shown('#helpPanel');click('#themeToggle');go('home');assert.equal(d.documentElement.dataset.theme,'sun');assert.deepEqual(json('[evaluate(261).source,evaluate(993).source]'),before);assert.deepEqual(errors,[]);
 });
 fs.writeFileSync('qa/alpha15-ui-results.json',JSON.stringify({version:'2.0 Alpha build 3',count:cases.length,cases,errors,scope:'DOM task visibility, keyboard/navigation and live edit flows; no browser pixel or Android-device claim.'},null,2)+'\n');console.log('Alpha 1.5 workflow UI: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>dom.window.close());
