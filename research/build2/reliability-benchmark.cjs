'use strict';
// Synthetic local CPU/DOM comparison, not a phone or storage-quota benchmark.
const fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const {bootApp}=require('../../qa/build2-source-harness.cjs');
const count=1000,repeat=3,key='hfc-named-jobs-v1';
const jobs=Array.from({length:count},(_,i)=>({id:'job_'+i,name:'Synthetic '+i,updatedAt:'2026-11-11T00:00:00Z',snapshot:{version:1,setup:{},rows:[],job:{name:'Synthetic '+i}}}));
const h=bootApp({beforeParse(w){w.localStorage.setItem(key,JSON.stringify({version:1,activeId:null,jobs}));}});
try{
 const descriptor=Object.getOwnPropertyDescriptor(h.w.Element.prototype,'innerHTML');let writes=0;
 Object.defineProperty(h.w.Element.prototype,'innerHTML',{...descriptor,set(value){if(this.id==='jobsPanel')writes++;return descriptor.set.call(this,value);}});
 const timings=[];for(let i=0;i<repeat;i++){const start=performance.now();h.ev('JobsUI.render()');timings.push(performance.now()-start);}
 const result={scope:'Synthetic JSDOM same-state render at accepted 1000 named-job capacity; no device speed claim',namedJobs:count,repeats:repeat,listDomReplacements:writes,elapsedMs:timings,totalMs:timings.reduce((a,b)=>a+b,0)};
 const target=path.resolve(process.argv[2]||'research/build2/reliability-benchmark.json');fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{h.close();}
