'use strict';
// Development may assemble source; release QA uses the exact frozen standalone.
const fs=require('node:fs'),path=require('node:path'),{webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('./runtime/node_modules/jsdom'),FDB=require('./runtime/node_modules/fake-indexeddb');
const root=path.resolve(__dirname,'..');
function assembleHtml(){
 const src=path.join(root,'night-sweep');let html=fs.readFileSync(path.join(src,'shell.html'),'utf8');
 const builder=fs.readFileSync(path.join(src,'build.py'),'utf8');
 const entries=[...builder.matchAll(/\('(<!--[A-Z]+-->)',\s*'([^']+)'\)/g)];
 if(entries.length<20)throw Error('Source builder token list unavailable.');
 for(const [,token,file]of entries){if(!html.includes(token))throw Error('Missing source token '+token);let data=fs.readFileSync(path.join(src,file),'utf8');if(file==='catalog.json'){const catalog=JSON.parse(data);catalog.setupManuals=JSON.parse(fs.readFileSync(path.join(src,'setup-manuals.json'),'utf8'));data=JSON.stringify(catalog);}html=html.replace(token,()=>data);}
 html=html.replace('<!--DSIMPILOTCODES-->',()=>fs.readFileSync(path.join(src,'dsim-pilot-codes.js'),'utf8'));
 if(/<!--[A-Z]+-->/.test(html))throw Error('Unresolved source build token.');return html;
}
function bootApp(options={}){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const html=options.html||(process.env.NIGHTSWEEP_RELEASE_TEST==='1'?fs.readFileSync(path.join(root,'outputs/Night_Sweep.html'),'utf8'):assembleHtml());
 const dom=new JSDOM(html,{url:options.url||'https://nightsweep.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.ResizeObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};w.alert=()=>{};w.structuredClone=structuredClone;w.confirm=()=>true;w.indexedDB=new FDB.IDBFactory();w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;w.ArrayBuffer=ArrayBuffer;Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
  w.NightSweepAndroid={saveFile:(name,text,mime)=>downloads.push({name,text,mime}),saveBinary:(name,base64,mime)=>downloads.push({name,base64,mime}),printReport:()=>{}};
  options.beforeParse?.(w);
 }});
 const w=dom.window,ev=code=>w.eval(code),json=code=>JSON.parse(ev('JSON.stringify('+code+')'));
 return {dom,w,d:w.document,ev,json,errors,downloads,close:()=>w.close()};
}
module.exports={assembleHtml,bootApp,root};
