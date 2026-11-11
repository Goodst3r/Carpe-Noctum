'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=JSON.parse(read('night-sweep/catalog.json'));
const retiredRF=['active_gm_ubt_main','active_gm_ubt_aux'];
const retiredPower=['gm-ubt-1000-thermal','gm-ubt-1000-agc','gm-ubt-1000-agc-status'];
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
// Exercise current source against the packaged shell; the release runner rebuilds
// the same source first. Preserve build-added manual records in the test shell.
let html=read('outputs/Night_Sweep.html');
html=html.replace(/(<script id="catalogData"[^>]*>)([\s\S]*?)(<\/script>)/,(_,a,b,c)=>a+JSON.stringify({...JSON.parse(b),...data})+c);
html=html.replace(/<script>([\s\S]*?)<\/script>/g,(all,code)=>code.startsWith('const catalog=')?'<script>'+read('night-sweep/app.js')+'</script>':code.startsWith('/* Source identity is a reference plane;')?'<script>'+read('night-sweep/launch-source.js')+'</script>':all);
const dom=new JSDOM(html,{url:'https://nightsweep.test',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;}});
const w=dom.window,d=w.document,ev=code=>w.eval(code),json=code=>JSON.parse(ev('JSON.stringify('+code+')'));let checks=0;
function check(label,fn){fn();assert.deepEqual(errors,[]);checks++;console.log('PASS '+label);}
const parsedOptions=html=>{const select=d.createElement('select');select.innerHTML=html;return [...select.options];};
const ids=html=>parsedOptions(html).map(o=>o.value);
check('Only the two UBT RF configurations and three UBT power curves are retired',()=>{
 assert.deepEqual(data.devices.filter(x=>x.retired).map(x=>x.id).sort(),[...retiredRF].sort());assert.deepEqual(data.powerEquipment.filter(x=>x.retired).map(x=>x.id).sort(),[...retiredPower].sort());
 for(const record of [...data.devices,...data.powerEquipment].filter(x=>x.retired))assert.match(record.retirementReason,/previously saved jobs/);
 assert.equal(data.devices.find(x=>x.id==='active_gm_hgbt').retired,undefined);assert(data.devices.some(x=>!x.retired&&/unbalanced/i.test(x.label)&&!x.active));
});
check('New route choices and widened model search exclude retired UBT configurations',()=>{
 const options=ids(ev('deviceOptions("","","active")'));for(const id of retiredRF)assert(!options.includes(id));assert(options.includes('active_gm_hgbt'));
 const row={id:'r777',device:'active_gm_hgd'};ev('pickerQueries.set("r777","UBT")');const result=ev('routePicker('+JSON.stringify(row)+')');for(const id of retiredRF)assert(!ids(result.html).includes(id));
 for(const id of retiredRF)assert.equal(ev('partSearchMatches(device('+JSON.stringify(id)+'),"UBT")'),false);
});
check('Catalog browse and search contain no retired equipment while legacy data remains addressable',()=>{
 const entries=json('catalogEntries()');for(const id of [...retiredRF,...retiredPower])assert(!entries.some(x=>x.id===id));
 for(const id of retiredRF)assert.equal(ev('device('+JSON.stringify(id)+').id'),id);for(const id of retiredPower)assert.equal(ev('powerEquipment('+JSON.stringify(id)+').id'),id);
 assert(entries.some(x=>x.id==='active_gm_hgbt'));
});
check('New load and launch selectors exclude UBT but current legacy selections stay labeled',()=>{
 for(const id of retiredPower)assert(!ids(ev('equipmentOptions("custom")')).includes(id));
 for(const id of retiredPower){const options=parsedOptions(ev('equipmentOptions('+JSON.stringify(id)+')'));assert.match(options.find(x=>x.value===id).textContent,/^Legacy/);assert.equal(options.filter(x=>retiredPower.includes(x.value)).length,1);}
 ev('state.setup.sourceType="active";state.setup.sourceModel="active_gm_hgd";LaunchSource.render()');let select=d.querySelector('[data-launch-source="sourceModel"]');for(const id of retiredRF)assert(![...select.options].some(x=>x.value===id));
 ev('state.setup.sourceModel="active_gm_ubt_main";LaunchSource.render()');select=d.querySelector('[data-launch-source="sourceModel"]');assert.equal(select.value,'active_gm_ubt_main');assert.match(select.selectedOptions[0].textContent,/^Legacy/);assert.match(d.getElementById('launchSourceStatus').textContent,/Legacy saved equipment/);assert(![...select.options].some(x=>x.value==='active_gm_ubt_aux'));
});
check('Legacy route selection survives rendering and search with a clear label',()=>{
 ev('state.rows=[{id:"r1",parent:"source",name:"Legacy amp",device:"active_gm_ubt_aux",cable:"p3_625",length:0,gainLow:20,gainHigh:20,gainLowF:261,gainHighF:993}];renderRoute()');
 const select=d.querySelector('[data-row="r1"] [data-field="device"]');assert.equal(select.value,'active_gm_ubt_aux');assert.match(select.selectedOptions[0].textContent,/^Legacy/);assert.match(d.getElementById('route').textContent,/Legacy saved equipment/);
 const options=parsedOptions(ev('deviceOptions("active_gm_ubt_aux","","active")'));assert.match(options.find(x=>x.value==='active_gm_ubt_aux').textContent,/^Legacy/);assert(!options.some(x=>x.value==='active_gm_ubt_main'));
});
check('Legacy RF and power jobs retain their calculations and round-trip import identities',()=>{
 ev('state.setup.sourceType="active";state.setup.sourceModel="active_gm_ubt_main";state.setup.lowF=261;state.setup.highF=993;state.setup.lowLevel=34;state.setup.highLevel=46;state.setup.launchMode="sqrt";state.power={...freshPower(),supplyVoltage:70,rows:[{...freshPowerRow("p1"),equipment:"gm-ubt-1000-agc",mode:"curve",length:0}]}');
 const before=json('state'),rf=ev('HFC.run(state,catalog,261)'),power=ev('HFC.powerRun(state.power,catalog)');assert.equal(rf.error,undefined,rf.error);assert.equal(rf.results[0].outputs[0].level,54);assert.equal(power.ok,true,power.error);assert(Math.abs(power.supplyCurrent-.84)<1e-8);
 ev('loadState('+JSON.stringify(before)+',false)');assert.equal(ev('state.rows[0].device'),'active_gm_ubt_aux');assert.equal(ev('state.setup.sourceModel'),'active_gm_ubt_main');assert.equal(ev('state.power.rows[0].equipment'),'gm-ubt-1000-agc');assert.deepEqual(json('HFC.run(state,catalog,261)'),JSON.parse(JSON.stringify(rf)));assert.deepEqual(json('HFC.powerRun(state.power,catalog)'),JSON.parse(JSON.stringify(power)));
 ev('renderPower();saveLocal()');assert.equal(d.querySelector('[data-power-field="equipment"]').value,'gm-ubt-1000-agc');assert.match(d.getElementById('powerRows').textContent,/Legacy saved equipment/);const saved=JSON.parse(w.localStorage.getItem('hfc-route-v1'));assert.equal(saved.rows[0].device,'active_gm_ubt_aux');assert.equal(saved.power.rows[0].equipment,'gm-ubt-1000-agc');
});
check('Changing a route type or family chooses an available configuration',()=>{
 ev('state.rows=[{...freshRow(),id:"r1",device:"none"}];renderRoute()');const type=d.querySelector('[data-row="r1"] [data-field="passiveType"]');type.value='active';type.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(ev('device(state.rows[0].device).retired'),undefined);
 const family=d.querySelector('[data-row="r1"] [data-field="family"]');family.value='GainMaker 1 GHz';family.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(ev('device(state.rows[0].device).retired'),undefined);
});
console.log('Retired equipment: '+checks+' checks passed');dom.window.close();
