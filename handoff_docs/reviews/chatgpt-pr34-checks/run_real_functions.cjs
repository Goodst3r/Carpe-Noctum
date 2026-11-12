'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const [root,casesFile]=process.argv.slice(2),cases=JSON.parse(fs.readFileSync(casesFile,'utf8'));
const artifacts={source:'night-sweep/field-calcs.js',standalone:'outputs/Night_Sweep.html',pwa:'dist/index.html'},output={};
for(const [name,file] of Object.entries(artifacts)){
 const raw=fs.readFileSync(path.join(root,file),'utf8');
 const start=raw.indexOf('const FieldCalc=(()=>{');
 const end=raw.indexOf('const FieldCalcs=(()=>{',start);
 if(start<0||end<0)throw Error('FieldCalc missing in '+file);
 const context={}; vm.createContext(context);
 vm.runInContext(raw.slice(start,end)+'\nglobalThis.realFieldCalc=FieldCalc;',context,{filename:file});
 output[name]=Object.fromEntries(cases.map(c=>[c.id,context.realFieldCalc.powerSum(c.inputs)]));
}
process.stdout.write(JSON.stringify(output));
