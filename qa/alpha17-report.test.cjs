'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const errors=[],cases=[],failures=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
const dom=new JSDOM('<!doctype html><main><div id="message"></div><div class="filemenu"><div class="toolbar"></div></div><section id="powerPanel"></section><section id="routePanel"><div class="sectionhead"><div class="actions"></div></div></section></main>',{url:'https://nightsweep.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window,d=w.document;
const catalog={devices:[{id:'none',label:'Cable only',ports:[{id:'through',label:'OUT',role:'through'}]},{id:'active_gm_hgd',label:'GainMaker HGD 42/54',model:'HGD 42/54',active:true,publishedGain:{forwardBand:[54,1002],reverseBand:[5,42]},ports:[{id:'through',label:'Selected RF output',role:'through'}]}],cables:[],nodeProfiles:[{id:'node1',label:'Test GS7000 node',bands:[{label:'42 / 54 MHz',returnLow:5,returnCeiling:42,forwardFloor:54,equipmentUpper:1002}]}],setupManuals:{records:[{id:'node-manual-A',equipmentIds:['node1'],title:'Node installation',kind:'manual',revision:'Rev A',url:'https://manufacturer.test/node.pdf',steps:['Identify node','Record levels'],gaps:[]},{id:'gm-data-B',equipmentIds:['active_gm_hgd'],title:'GainMaker reference',kind:'datasheet',revision:'Rev B',url:'https://manufacturer.test/gm.pdf',steps:[],gaps:['Exact setup manual unavailable']}]} };
function state(lowF=261){return {version:1,setup:{lowF,highF:993,lowLevel:34,highLevel:46,liveMax:993,launchMode:'linear',basis:'nominal',temperature:68,sourceType:'node'},rows:[],node:{model:'node1',band:'0',asset:'NODE-1',port:'RF-A',operatingUpper:1002},job:{name:'Fixture job',node:'JOB-ASSET',date:'2026-11-10',lead:'Tech'},project:{selectedProfile:'1002',meta:{}},power:{rows:[],supplyVoltage:90,supplyRating:15}};}
w.eval('var state='+JSON.stringify(state())+';var catalog='+JSON.stringify(catalog)+';var screenCopy={};var powerSerial=1;');
w.$=id=>d.getElementById(id);w.esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
w.option=(value,label,current)=>`<option value="${w.esc(value)}"${String(value)===String(current)?' selected':''}>${w.esc(label)}</option>`;
w.device=id=>catalog.devices.find(device=>device.id===id);w.name=(row,i)=>row.name||'Point '+(i+1);w.powerName=(row,i)=>row.name||'Load '+(i+1);
w.fmt=value=>Number.isFinite(value)?value.toFixed(2):'—';w.csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';w.download=()=>{};w.saveLocal=()=>true;
// These unrelated shell actions are not exercised by this report test.
w.renderPower=()=>{};w.refreshPower=()=>{};w.refreshResults=()=>{};w.showTab=()=>{};w.print=()=>{};
w.NightSweep={selfCheck:{ok:true}};
w.eval(['engine.js','nodes.js','launch-source.js','equipment-setup.js','field-report.js'].map(filename=>fs.readFileSync('night-sweep/'+filename,'utf8')).join('\n')+'\nglobalThis.reportAPI=FieldReport;globalThis.reportEngine=HFC;');
w.evaluate=frequency=>w.reportEngine.run(w.state,catalog,frequency);w.val=(result,key)=>key==='source'?result.source:result.byKey.get(key)?.level??null;
const api=w.reportAPI;api.init();
const data=()=>JSON.parse(JSON.stringify(api.sheetData()));
function chooseFrequency(value){const input=d.getElementById('runSheetFrequency');input.value=value;input.dispatchEvent(new w.Event('input',{bubbles:true}));}
function newState(lowF=55){w.state=state(lowF);}
async function check(label,fn){try{await fn();assert.deepEqual(errors,[]);cases.push(label);console.log('PASS '+label);}catch(error){failures.push(label);console.error('FAIL '+label+'\n'+error.stack);}}
(async()=>{
 await check('report uses the current job default marker and preserves its explicit frequency',()=>{
   assert.equal(data().frequency,261);chooseFrequency('711');api.renderSheet();assert.equal(data().frequency,711);assert.equal(d.getElementById('runSheetFrequency').value,'711');
   w.state.setup.lowF=303;api.renderSheet();assert.equal(data().frequency,711);
 });
 await check('new owner resets report frequency to that job marker in data, UI and exports',()=>{
   newState(55);assert.equal(data().frequency,55);api.renderSheet();assert.equal(d.getElementById('runSheetFrequency').value,'55');assert.match(api.sheetText(),/Prediction frequency: 55 MHz/);
   assert.equal(api.csvRows().find(row=>row[0]==='Prediction frequency MHz')[1],55);
 });
 await check('launch node identity includes model, asset and output without replacing job metadata',()=>{
   const result=data();assert.equal(result.launchSource,'Node · Test GS7000 node · NODE-1 · RF-A');assert.equal(result.asset,'JOB-ASSET');assert.equal(result.node,'Test GS7000 node');
   api.renderSheet();assert.match(d.getElementById('runSheetSummary').textContent,/Launch source: Node · Test GS7000 node · NODE-1 · RF-A/);
   assert.match(api.sheetText(),/Launch source: Node · Test GS7000 node · NODE-1 · RF-A/);assert.equal(api.csvRows().find(row=>row[0]==='Launch source')[1],result.launchSource);
 });
 await check('launch active identity is distinct from the retained job node record',()=>{
   Object.assign(w.state.setup,{sourceType:'active',sourceModel:'active_gm_hgd',sourceAsset:'AMP-7',sourcePort:'AUX'});
   assert.equal(data().launchSource,'Amplifier / LE · GainMaker HGD 42/54 · AMP-7 · AUX');assert.equal(data().node,'Test GS7000 node');
 });
 await check('equipment notes and exact current reviewed source count reach all report formats',()=>{
   w.state.setup.sourceType='node';w.state.equipmentSetup={selected:'source',stations:{source:{notes:'Verify output then attach TRACE-17.csv',checks:{}}}};
   w.EquipmentSetup.init();const box=d.querySelector('#equipmentSetupPanel [data-equipment-check]');box.checked=true;box.dispatchEvent(new w.Event('change',{bubbles:true}));
   api.renderSheet();const text=api.sheetText();assert.match(text,/node-manual-A/);assert.match(text,/Rev A/);assert.match(text,/1\s*\/\s*2.*reviewed|reviewed[^\n]*1\s*\/\s*2/i);assert.match(text,/TRACE-17\.csv/);assert.match(text,/not.*RF acceptance|RF acceptance.*separate/i);
   assert(api.csvRows().some(row=>row.includes('node-manual-A')));assert.match(d.getElementById('runSheetEquipmentSetup').textContent,/TRACE-17\.csv/);
 });
 await check('changed manual revision never inherits prior reviewed completion',()=>{
   w.eval('catalog.setupManuals.records[0].revision="Rev C"');api.renderSheet();const text=api.sheetText();assert.match(text,/Rev C/);assert.match(text,/0\s*\/\s*2.*reviewed|reviewed[^\n]*0\s*\/\s*2/i);assert.match(text,/TRACE-17\.csv/);
 });
 await check('unavailable station notes remain explicitly historical in reports',()=>{
   w.state.equipmentSetup.stations.r99={notes:'Retain removed station finding',checks:{old:true}};api.renderSheet();const text=api.sheetText();assert.match(text,/Retain removed station finding/);assert.match(text,/unavailable|historical/i);
 });
 await check('only approved key availability labels export, with no secret field serialization',()=>{
   Object.assign(w.state.setup,{sourceType:'active',sourceModel:'active_gm_hgd'});
   w.EquipmentSetup.init();const control=d.querySelector('[data-equipment-field="gainControl"]');control.value='dsim';control.dispatchEvent(new w.Event('change',{bubbles:true}));const status=d.querySelector('[data-equipment-field="keyStatus"]');status.value='verified';status.dispatchEvent(new w.Event('change',{bubbles:true}));w.state.equipmentSetup.stations.source.key='NEVER-EXPORT-THIS';
   const text=api.sheetText();assert.match(text,/Verified against approved pilot/i);assert.doesNotMatch(text,/NEVER-EXPORT-THIS/);assert(!JSON.stringify(api.csvRows()).includes('NEVER-EXPORT-THIS'));
   delete w.state.equipmentSetup.stations.source.key;
 });
 await check('source identity and setup notes are escaped in rendered report',()=>{
   w.state.setup.sourceType='node';
   w.state.node.asset='<img src=x onerror=evil()>';w.state.equipmentSetup.stations.source.notes='</p><script>evil()</script> & retained';api.renderSheet();
   assert.equal(d.querySelector('#runSheetPanel img'),null);assert.equal(d.querySelector('#runSheetPanel script'),null);assert.match(d.getElementById('runSheetSummary').textContent,/<img/);assert.match(d.getElementById('runSheetEquipmentSetup').textContent,/<script>/);
 });
 await check('recorded DSIM module, firmware and pilot export as setup evidence without acceptance',()=>{
   Object.assign(w.state.setup,{sourceType:'active',sourceModel:'active_gm_hgd'});
   Object.assign(w.state.equipmentSetup.stations.source,{dsimModel:'DSIM-SG',firmware:'QA-FW-2.3',pilot:'711',pilotType:'QAM'});
   api.renderSheet();const text=api.sheetText(),markup=d.getElementById('runSheetEquipmentSetup').textContent,csv=JSON.stringify(api.csvRows());
   for(const value of ['DSIM-SG','QA-FW-2.3','711','QAM']){assert(text.includes(value));assert(markup.includes(value));assert(csv.includes(value));}
   assert.match(text,/Installed gain-control path: ACI DSIM/i);assert(csv.includes('Installed equipment control'));assert.match(text,/Recorded DSIM setup/i);assert.match(text,/alignment.*unverified|does not establish alignment/i);assert.doesNotMatch(text,/NEVER-EXPORT-THIS/);
   w.state.equipmentSetup.stations.source.firmware={secret:'DO-NOT-SERIALIZE'};w.state.equipmentSetup.stations.source.pilot='9'.repeat(101);
   assert(!api.sheetText().includes('DO-NOT-SERIALIZE'));assert(!api.sheetText().includes('9'.repeat(101)));
 });
 await check('legacy job without equipment setup remains reportable without invented reviewed steps',()=>{
   newState(54);delete w.state.equipmentSetup;api.renderSheet();assert.equal(data().frequency,54);assert.equal(d.getElementById('runSheetEquipmentSetup').hidden,true);assert.doesNotMatch(api.sheetText(),/\d+\s*\/\s*\d+\s+.*reviewed/i);
 });
 console.log(`\n${cases.length} report flow checks passed; ${failures.length} failed.`);dom.window.close();if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});
