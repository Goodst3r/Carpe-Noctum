const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('./runtime/node_modules/jsdom');
const HFC=require('../night-sweep/engine.js');
const catalog=JSON.parse(fs.readFileSync('night-sweep/catalog.json','utf8'));
const ctx={catalog};vm.createContext(ctx);vm.runInContext(fs.readFileSync('night-sweep/nodes.js','utf8')+';this.nt=NodeTools;this.validate=validateNode;',ctx);
let count=0;function test(label,f){f();count++;console.log('PASS '+label)};
const fixtures={
 'gs7000-1g-1rx-1tx':[2.2,2,1.8,1.7,1.6,1.5,1.5,1.4,1.4,1.4],
 'gs7000-1g-4rx-4tx':[2.8,2.5,2.3,2.1,2,1.9,1.8,1.7,1.7,1.7],
 'gs7000-12g-1rx-1tx':[2.4,2.2,2,1.8,1.7,1.6,1.5,1.5,1.6,1.5],
 'gs7000-12g-4rx-4tx':[3,2.8,2.4,2.3,2.1,2,1.9,1.8,1.8,1.8],
 'gs7000-12g-fiberdeep':[2.8,2.5,2.3,2.1,2,1.8,1.8,1.7,1.7,1.7],
 'gs7000-12g-intelligent':[4.23,3.75,3.36,3.05,2.8,2.61,2.44,2.28,2.16,2.16]
};
function circuit(id,voltage,extra={}){const e=catalog.powerEquipment.find(x=>x.id===id);return HFC.powerRun({supplyVoltage:voltage,supplyRating:15,temperatureF:68,resistanceAlpha:0.004,rows:[{id:'n1',name:'Node',parent:'supply',length:0,cable:'p3_625',dcRate:'',extraR:0,equipment:id,mode:e.mode,load:'',pf:1,minV:'',...extra}]},catalog);}
for(const [id,expected] of Object.entries(fixtures)){
 test(id+' published current backtest at all ten voltages',()=>{const e=catalog.powerEquipment.find(x=>x.id===id);assert.equal(e.min_voltage,45);assert.equal(e.max_voltage,90);for(let i=0;i<10;i++){const r=circuit(id,45+i*5);assert.equal(r.ok,true,r.error);assert.equal(r.supplyCurrent,expected[i]);}});
 test(id+' midpoint interpolation and no extrapolation',()=>{assert(Math.abs(circuit(id,62.5).supplyCurrent-(expected[3]+expected[4])/2)<1e-10);for(const v of [44.99,33,90.01])assert.equal(circuit(id,v).ok,false);});
}
test('EN9000 blank configuration load remains unavailable',()=>{const e=catalog.powerEquipment.find(x=>x.id==='vecima-en9000-manual');assert.equal(e.manual,true);assert.equal(e.watts,null);const r=circuit(e.id,90);assert.equal(r.ok,false);assert.equal(r.supplyCurrent,null);assert.match(r.error,/enter.*load/)});
test('EN9000 manual measured current uses the entered value',()=>assert.equal(circuit('vecima-en9000-manual',75,{mode:'amps',load:2.3}).supplyCurrent,2.3));
test('Default node does not assume installed equipment',()=>{const n=ctx.nt.defaults();assert.equal(n.model,'');assert.equal(n.operatingUpper,'');ctx.validate(n);ctx.validate(undefined)});
test('Explicit EN9000 choice defaults highsplit with 1218 operating upper',()=>{const n=ctx.nt.choice('vecima-en9000',catalog),b=ctx.nt.band(n,catalog);assert.equal(b.forwardFloor,258);assert.equal(b.returnCeiling,204);assert.equal(b.equipmentUpper,1794);assert.equal(n.operatingUpper,1218);ctx.validate(n)});
test('GS7000 profiles distinguish 1002 and 1218 MHz',()=>{for(const [id,upper] of [['gs7000-1g',1002],['gs7000-12g',1218]]){const n=ctx.nt.choice(id,catalog);assert.equal(ctx.nt.band(n,catalog).equipmentUpper,upper);assert.equal(n.operatingUpper,upper)}});
test('GS7000 mid-split starts performance at 105 MHz',()=>{for(const id of ['gs7000-1g','gs7000-12g']){const b=catalog.nodeProfiles.find(x=>x.id===id).bands.find(x=>x.returnCeiling===85);assert.equal(b.forwardFloor,105);assert.equal(b.diplex_forward_mhz,102)}});
test('Invalid or missing operating band never appears verified',()=>{const n=ctx.nt.choice('gs7000-1g',catalog);for(const v of ['',null,true,'bad',5,1200])assert(ctx.nt.issues({...n,operatingUpper:v},catalog).length);assert.equal(ctx.nt.issues(n,catalog).length,0)});
test('Node import validation rejects malformed and unknown model/band data',()=>{for(const n of [null,[],true,{model:'missing'},{model:'gs7000-1g',band:2},{model:'gs7000-1g',band:-1},{model:'gs7000-1g',band:0.5},{band:0},{model:'gs7000-1g',band:false},{notes:{}},{notes:'x'.repeat(10001)},{operatingUpper:Infinity},{unexpected:'x'}])assert.throws(()=>ctx.validate(n));});
test('Band-copy patch only changes three band limits plus approval',()=>{const patch=ctx.nt.patch(ctx.nt.choice('vecima-en9000',catalog),catalog);assert.deepEqual(JSON.parse(JSON.stringify(patch)),{equipmentUpper:1794,forwardFloor:258,returnCeiling:204,approved:'No'});});
const dom=new JSDOM('<main></main><div id="message"></div>',{runScripts:'outside-only',url:'https://nightsweep.test'}),w=dom.window,d=w.document;
w.eval(`var catalog=${JSON.stringify(catalog)};var state={};var saved=0;var $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function option(v,label,current){return '<option value="'+esc(v)+'"'+(String(v)===String(current)?' selected':'')+'>'+esc(label)+'</option>'}function saveLocal(){saved++}`);
// Load the real shared link helper for this otherwise isolated node UI fixture.
const appSource=fs.readFileSync('night-sweep/app.js','utf8');
w.eval(appSource.slice(appSource.indexOf('function equipmentSourceLink('),appSource.indexOf('function catalogEntries(')));
w.eval(fs.readFileSync('night-sweep/projects.js','utf8'));w.eval(fs.readFileSync('night-sweep/nodes.js','utf8'));w.eval('initProjects();renderProjects();initNodes();initNodes();renderNodes()');
function set(key,value,event='change'){const el=d.querySelector('[data-node-field="'+key+'"]');assert(el,key);el.value=value;el.dispatchEvent(new w.Event(event,{bubbles:true}));}
test('Node controls mount at project top with no model assumed',()=>{assert.equal(d.getElementById('projectPanel').firstElementChild.id,'nodePanel');assert.equal(d.querySelector('[data-node-field="model"]').value,'');});
test('Model selection shows source and separates hardware and operating upper',()=>{set('model','vecima-en9000');assert.equal(w.eval('state.node.operatingUpper'),1218);assert.match(d.getElementById('nodeReference').textContent,/258–1794 MHz/);assert.match(d.getElementById('nodeReference').textContent,/1218 MHz/);assert.match(d.getElementById('nodeReference').textContent,/does not add correction/);assert(d.querySelector('#nodeReference a[href^="https://vecima.com/"]'));});
test('Node field edits save once despite repeated init',()=>{const before=w.eval('saved');set('asset','N101','input');assert.equal(w.eval('state.node.asset'),'N101');assert.equal(w.eval('saved'),before+1);});
test('Node notes escape markup',()=>{set('notes','<img src=x onerror=alert(1)>','input');w.eval('renderNodes()');assert.equal(d.querySelectorAll('#nodePanel img').length,0);assert.equal(d.querySelector('[data-node-field="notes"]').value,'<img src=x onerror=alert(1)>');});
test('Out-of-band operating input remains visible with warning',()=>{set('operatingUpper','1800','input');assert.match(d.getElementById('nodeReference').textContent,/exceeds this hardware/);assert.equal(w.eval('state.node.operatingUpper'),'1800');set('operatingUpper','1218','input')});
test('Cancel band copy preserves entire project',()=>{const before=w.eval('JSON.stringify(state.project)');w.confirm=()=>false;d.querySelector('[data-node-copy]').click();assert.equal(w.eval('JSON.stringify(state.project)'),before);});
test('Confirmed copy changes only declared band fields and approval',()=>{w.eval("Object.assign(projectProfile('1200'),{approved:'Yes',launchLow:34,launchHigh:46,available:993,plannedUpper:1200,forwardLow:261,forwardHigh:993});state.project.forward=[{rawLow:14,addLow:20}]");const before=JSON.parse(w.eval("JSON.stringify(projectProfile('1200'))"));let prompts=0;w.confirm=m=>{prompts++;assert.match(m,/Equipment upper/);return true};d.querySelector('[data-node-copy]').click();const after=JSON.parse(w.eval("JSON.stringify(projectProfile('1200'))"));assert.deepEqual(after,{...before,equipmentUpper:1794,forwardFloor:258,returnCeiling:204,approved:'No'});assert.equal(w.eval('state.project.forward[0].addLow'),20);assert.equal(w.eval('state.project.forward[0].rawLow'),14);assert.equal(prompts,1);assert.match(d.getElementById('nodeCopyStatus').textContent,/Copied hardware limits/);});
test('Node state survives project re-render and explicit node remount',()=>{w.eval('renderProjects();renderNodes()');assert.equal(d.querySelector('[data-node-field="asset"]').value,'N101');assert.equal(d.querySelectorAll('#nodePanel').length,1);});
console.log(`Node QA: ${count} tests passed.`);dom.window.close();
