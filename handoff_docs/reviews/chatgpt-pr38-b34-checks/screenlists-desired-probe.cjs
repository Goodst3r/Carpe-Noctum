'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
if (!process.argv[2]) throw new Error('Usage: node screenlists-desired-probe.cjs <app-root> [receipt.json]');
const root=require('node:path').resolve(process.argv[2]);
const receiptPath=process.argv[3];
const pin='b34b1db60571e758947ca5b592e14aeaf7f38d73';
const head=()=>cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const before=head();assert.equal(before,pin);
const source=fs.readFileSync(root+'/qa/ui-names.test.cjs','utf8');
const start=source.indexOf('function screenLists('),end=source.indexOf('\nfunction check(',start);
assert(start>=0&&end>start);
const context={norm:s=>String(s).replace(/\s+/g,' ').trim().toLowerCase()};vm.createContext(context);vm.runInContext(source.slice(start,end),context);
const info={subTabs:new Map([
 ['home',new Set(['home','outage'])],
 ['plan',new Set(['details','setup','cable route','amp gain','amp / node setup','predicted levels','load','what-if','supply pm','sweep due'])],
 ['field',new Set(['meter setup','station','readings','tdr','onx files','leakage','checklists','night log'])],
 ['tools',new Set(['calculators','frequency','limits','references','catalog','docsis health','impairments','fiber','high split','why cards','proof of performance','study'])],
 ['closeout',new Set(['acceptance','run sheet'])]
])};
const header='| Main work area | Task screens | Purpose |\n| --- | --- | --- |\n';
const probes=[
 ['reject missing multiword screen',info,header+'| Tools | Nonexistent screen | Synthetic |',1],
 ['reject real multiword screen under wrong group',info,header+'| Tools | Meter setup | Synthetic |',1],
 ['reject missing one-word screen',info,header+'| Tools | Bogus | Synthetic |',1],
 ['accept valid multiword screen',info,header+'| Tools | Why cards | Synthetic |',0],
 ['reject invalid member of a semicolon list',info,header+'| Tools | Calculators; Nonexistent screen | Synthetic |',1],
 ['diagnose missing group inventory', {subTabs:new Map()},header+'| Tools | Calculators | Synthetic |',1],
 ['ignore actual prose Field table header',info,'| Field | What to enter |\n| --- | --- |\n| Source type | Actual source |',0],
 ['accept exact five-group independent inventory',info,header+[...info.subTabs].map(([group,tabs])=>'| '+group[0].toUpperCase()+group.slice(1)+' | '+[...tabs].join('; ')+' | Synthetic |').join('\n'),0],
 ['ignore standalone prose row outside inventory',info,'| Tools | Nonexistent screen | Synthetic prose |',0],
 ['end inventory at prose before unrelated table',info,header+'| Tools | Fiber | Synthetic |\n\nOther table:\n| Field | What to enter |\n| --- | --- |',0]
];
const receipt={headBefore:before,source:'qa/ui-names.test.cjs actual screenLists()',checks:[]};
for(const [name,inventory,text,expected] of probes){const failures=[];context.screenLists(inventory,text,'probe',failures);assert.equal(failures.length,expected,name+': '+failures.join('; '));receipt.checks.push({name,expected,failures});console.log('PASS '+name);}
receipt.headAfter=head();assert.equal(receipt.headAfter,pin);receipt.statusAfter=cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'});assert.equal(receipt.statusAfter,'');
if (receiptPath) fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log('Actual b34 screenLists desired behavior: '+receipt.checks.length+' checks passed.');
