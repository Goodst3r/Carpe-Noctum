/* Imported ID boundaries. Synthetic DOM application; no physical device claims. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const root=path.resolve(__dirname,'..'),source=path.join(root,'night-sweep'),cases=[],errors=[];
let html=fs.readFileSync(path.join(source,'shell.html'),'utf8');
for(const [,token,file] of fs.readFileSync(path.join(source,'build.py'),'utf8').matchAll(/\('([^']*<!--[^']*-->)', '([^']+)'\)/g)){
 let data=fs.readFileSync(path.join(source,file),'utf8');
 if(file==='catalog.json'){const cat=JSON.parse(data);cat.setupManuals=JSON.parse(fs.readFileSync(path.join(source,'setup-manuals.json'),'utf8'));data=JSON.stringify(cat);}
 html=html.split(token).join(data);
}
html=html.replace('<!--DSIMPILOTCODES-->',fs.readFileSync(path.join(source,'dsim-pilot-codes.js'),'utf8'));
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://import-ids.nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.print=()=>{};}});
const w=dom.window,ev=s=>w.eval(s),MAX=Number.MAX_SAFE_INTEGER,clone=x=>JSON.parse(JSON.stringify(x));
const route=(id,parent='source')=>({id,parent,device:'none',cable:'p3_625',length:0});
const power=(id,parent='supply')=>({id,parent,cable:'custom',dcRate:0,extraR:0,equipment:'custom',mode:'amps',load:0,pf:1,minV:''});
const project=()=>({version:1,setup:{},rows:[],power:{supplyVoltage:90,supplyRating:15,rows:[]},job:{name:'Synthetic ID boundary'}});
const load=p=>ev('loadState('+JSON.stringify(p)+',false)');
const roundtrip=()=>ev('loadState(JSON.parse(JSON.stringify(state)),false,true)');
function check(name,fn){fn();cases.push(name);console.log('PASS '+name);}
try{
 check('Unsafe imported route IDs are rejected without replacing current work',()=>{
  for(const suffix of [String(MAX+1),'9'.repeat(310)]){
   const before=ev('JSON.stringify(state)'),p=project();p.rows=[route('r'+suffix)];
   assert.throws(()=>load(p),/Invalid route rows/);assert.equal(ev('JSON.stringify(state)'),before);
  }
 });
 check('Unsafe imported power IDs are rejected without replacing current work',()=>{
  for(const suffix of [String(MAX+1),'9'.repeat(310)]){
   const before=ev('JSON.stringify(state)'),p=project();p.power.rows=[power('p'+suffix)];
   assert.throws(()=>load(p),/Invalid power rows/);assert.equal(ev('JSON.stringify(state)'),before);
  }
 });
 check('Safe-integer route boundary adds unique reimportable IDs and does not reconnect orphan feeds',()=>{
  const p=project();p.rows=[route('r'+MAX),route('r4','r1::through')];load(p);
  ev('state.rows.push(freshRow());state.rows.push(freshRow())');
  const ids=ev('state.rows.map(r=>r.id)');assert.equal(new Set(ids).size,4);assert(!ids.includes('r1'),'An orphan feed remains disconnected');
  assert(ev('state.rows.slice(2).every(r=>Number.isSafeInteger(Number(r.id.slice(1))))'));roundtrip();
 });
 check('Safe-integer power boundary adds unique reimportable IDs and preserves missing parents',()=>{
  const p=project();p.power.rows=[power('p'+MAX),power('p4','p1')];load(p);
  ev('state.power.rows.push(freshPowerRow());state.power.rows.push(freshPowerRow())');
  const ids=ev('state.power.rows.map(r=>r.id)');assert.equal(new Set(ids).size,4);assert(!ids.includes('p1'));roundtrip();
 });
 check('Power what-if keeps a safe unique ID at the imported numeric boundary',()=>{
  const p=project();p.power.rows=[power('p'+MAX),power('p4','p1')];load(p);
  const trial=ev('FieldReport.calculatePowerWhatIf({parent:"supply",cable:"custom",dcRate:0,length:0,amps:0,minV:0})');
  assert(/^p\d+$/.test(trial.trialRow.id));assert(Number.isSafeInteger(Number(trial.trialRow.id.slice(1))));assert(!['p1','p4','p'+MAX].includes(trial.trialRow.id));
  ev('state.power.rows.push('+JSON.stringify(clone(trial.trialRow))+')');roundtrip();
 });
 check('Resetting the three-tap sample retains its established IDs',()=>{ev('example()');assert.equal(ev('state.rows.map(r=>r.id).join(",")'),'r1,r2,r3');});
 assert.deepEqual(errors,[]);console.log('Import ID boundaries: '+cases.length+' checks passed');
}finally{dom.window.close();}
