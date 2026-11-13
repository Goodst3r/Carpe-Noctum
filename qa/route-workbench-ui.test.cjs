'use strict';
const fs=require('node:fs'),baseAssert=require('node:assert/strict');let checks=0;const assert=new Proxy(baseAssert,{apply(o,t,a){checks++;return Reflect.apply(o,t,a)},get(o,k){const v=o[k];return typeof v==='function'?(...a)=>{checks++;return v(...a)}:v;}});const {bootApp}=require('./build2-source-harness.cjs');
let html=fs.readFileSync('night-sweep/shell.html','utf8');const builder=fs.readFileSync('night-sweep/build.py','utf8');
const entries=[...builder.matchAll(/\('(<!--[A-Z]+-->)',\s*'([^']+)'\)/g)].map(([,a,b])=>[a,b]);entries.push(['<!--ROUTEWORKBENCHCSS-->','route-workbench.css'],['<!--ROUTEWORKBENCH-->','route-workbench.js']);
for(const [token,file] of entries){let data=fs.readFileSync('night-sweep/'+file,'utf8');if(file==='catalog.json'){let c=JSON.parse(data);c.setupManuals=JSON.parse(fs.readFileSync('night-sweep/setup-manuals.json'));data=JSON.stringify(c);}html=html.replace(token,()=>data);}
html=html.replace('<!--DSIMPILOTCODES-->',()=>fs.readFileSync('night-sweep/dsim-pilot-codes.js','utf8')).replace('<!--MAPIMPORTCSS-->','').replace('<!--MAPIMPORT-->','').replace('<!--MAPIMPORTASSETS-->','{}');
const a=bootApp({html}),{w,d,ev,json}=a;
ev(`state.setup={...state.setup,lowF:54,highF:860,lowLevel:10,highLevel:10,launchMode:'sqrt'};state.rows=[{...freshRow('source','r1'),name:'Amp A',device:'active_gm_hgd',gainLowF:54,gainHighF:860,gainLow:31,gainHigh:31,targetLow:43,targetHigh:43}];renderAll();WorkflowUI.go('route')`);
assert.match(d.querySelector('.route-workbench').textContent,/Short on gain/);
const set=(key,value)=>{const el=d.querySelector(`[data-wb="${key}"]`);assert(el,key);el.value=value;el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};
set('before.low.input','10');set('before.low.inputPlane','tp');set('before.low.inputCorrection','20');set('before.low.output','40');set('before.low.outputPlane','port');
assert.match(d.querySelector('[data-wb-measured="before.low"]').textContent,/10\.00/);
set('pad.Forward input pad.installed','6');const saved=JSON.stringify(json('state'));ev(`loadState(${saved})`);
assert.equal(d.querySelector('[data-wb="before.low.input"]').value,'10');assert.equal(d.querySelector('[data-wb="pad.Forward input pad.installed"]').value,'6');
ev('state.setup.lowF=55;refreshResults()');assert.match(d.querySelector('[data-wb-measured="before.low"]').textContent,/—/);
const common=d.querySelector('[data-wb=commonInput]');common.checked=true;common.dispatchEvent(new w.Event('change',{bubbles:true}));set('before.low.input','11');set('leg','aux');assert.equal(d.querySelector('[data-wb=\"before.low.input\"]').value,'11');set('legGain.low','30');set('leg','main');assert.equal(d.querySelector('[data-wb=\"before.low.input\"]').value,'11');assert.equal(json('state.rows[0].workbench.legGain.aux.low'),'30');assert.deepEqual(a.errors,[]);
ev(`state.rows[0].device='active_gm_gan_hgd';state.power.rows[0].equipment='gm-hgd-gan-1g-thermal';renderAll()`);
(async()=>{const portable=await w.evidenceExportProject(ev('state'));assert.equal(portable.rows[0].device,'active_gm_gan_hgd');assert.equal(portable.power.rows[0].equipment,'gm-hgd-gan-1g-thermal');ev(`loadState(${JSON.stringify(portable)})`);assert.equal(ev('state.rows[0].device'),'active_gm_gan_hgd');assert.equal(ev('state.power.rows[0].equipment'),'gm-hgd-gan-1g-thermal');assert.deepEqual(a.errors,[]);a.close();console.log(`Route workbench UI: ${checks} checks passed`);})().catch(e=>{console.error(e);a.close();process.exitCode=1;});
