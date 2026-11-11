'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));let observerCalls=0,renderCalls=0;
const dom=new JSDOM(fs.readFileSync('outputs/Night_Sweep.html','utf8'),{url:'https://nightsweep.test',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.confirm=()=>true;const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(cb){super((...args)=>{observerCalls++;if(observerCalls>100){this.disconnect();errors.push('Mutation render did not settle');return;}cb(...args);});}};}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),flush=()=>new Promise(r=>setImmediate(r));let count=0;
async function test(n,f){await f();await flush();assert.deepEqual(errors,[]);count++;console.log('PASS '+n)}
(async()=>{
await test('Opening equipment setup settles without an observer-render loop',async()=>{ev('window.setupRenders=0;const priorEquipmentRender=EquipmentSetup.render;EquipmentSetup.render=function(){window.setupRenders++;return priorEquipmentRender()};WorkflowUI.go("equipmentSetup")');await flush();assert.equal(w.setupRenders,1);const prior=observerCalls;await flush();assert.equal(observerCalls,prior);});
await test('Disconnected feed warning settles and keeps its repair action',async()=>{ev('state.rows=[{id:"r2",parent:"r1::through",length:100,cable:"p3_625",device:"none"}];renderAll();WorkflowUI.go("route")');await flush();assert.match(d.getElementById('routeFeedWarning').textContent,/disconnected feed/);const prior=observerCalls;await flush();assert.equal(observerCalls,prior);assert(d.querySelector('#routeFeedWarning button'));});
await test('Repeated navigation preserves the working state without duplicate panels',async()=>{const before=ev('JSON.stringify(state)');for(const s of ['equipmentSetup','setup','route','equipmentSetup'])ev('WorkflowUI.go('+JSON.stringify(s)+')');await flush();assert.equal(ev('JSON.stringify(state)'),before);assert.equal(d.querySelectorAll('#equipmentSetupPanel').length,1);});
console.log(`Render stability 1.7: ${count} checks passed`);dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
