'use strict';
const {bootApp}=require('/workspace/Carpe-Noctum-pr40/qa/build2-source-harness.cjs');
const fs=require('node:fs');
const h=bootApp({html:fs.readFileSync('/workspace/Carpe-Noctum-pr40/outputs/Night_Sweep.html','utf8')});
const flush=()=>new Promise(r=>setImmediate(r));
const set=(id,value)=>{const e=h.d.getElementById(id);e.value=value;e.dispatchEvent(new h.w.Event('input',{bubbles:true}));};
(async()=>{await flush();set('powerPmName','Synthetic dedupe');set('powerPmDate','2026-11-12');set('powerPmOutput','89');h.d.getElementById('powerPmSave').click();let text;h.w.download=(name,t)=>text=t;h.d.getElementById('powerPmExport').click();const before=h.w.localStorage.getItem('nightsweep-power-pm-v1');const input=h.d.getElementById('powerPmImportFile');Object.defineProperty(input,'files',{configurable:true,value:[{size:Buffer.byteLength(text),text:async()=>text}]});input.dispatchEvent(new h.w.Event('change',{bubbles:true}));await flush();await flush();const after=h.w.localStorage.getItem('nightsweep-power-pm-v1');console.log(JSON.stringify({before:JSON.parse(before),after:JSON.parse(after),status:h.d.getElementById('powerPmStatus').textContent,errors:h.errors},null,2));h.close();})();
