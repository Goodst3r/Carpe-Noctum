'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=process.argv[2]||'/workspace/Carpe-Noctum-pr38';
const text=fs.readFileSync(root+'/qa/ui-names.test.cjs','utf8');
const start=text.indexOf('function screenLists('),end=text.indexOf('\nfunction check(',start);
assert(start>=0&&end>start);
const c={norm:s=>String(s).replace(/\s+/g,' ').trim().toLowerCase()};vm.createContext(c);vm.runInContext(text.slice(start,end),c);
const info={subTabs:new Map([['tools',new Set(['calculators','fiber','why cards'])]])};
const receipt={head:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),probes:[]};
for(const cell of ['Nonexistent screen','Meter setup','Bogus','Why cards','Calculators; Nonexistent screen']){
 const failures=[];c.screenLists(info,'| Main work area | Task screens | Purpose |\n| --- | --- | --- |\n| Tools | '+cell+' | Synthetic |','probe',failures);
 receipt.probes.push({cell,failures});
}
console.log(JSON.stringify(receipt,null,2));
assert.equal(receipt.probes[0].failures.length,0,'reproduces invalid multiword bypass');
assert.equal(receipt.probes[1].failures.length,0,'reproduces wrong-group multiword bypass');
assert.equal(receipt.probes[2].failures.length,1,'single-word invalid still detected');
assert.equal(receipt.probes[3].failures.length,0,'valid multiword retained');
assert.equal(receipt.probes[4].failures.length,1,'semicolon invalid still detected');
console.log('Actual committed screenLists: 5 diagnostic assertions passed; two real detection gaps reproduced.');
