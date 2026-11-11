'use strict';
// Fresh independent references are the actual Wolfram response retained with this release.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const HFC=require('../night-sweep/engine.js'),catalog=require('../night-sweep/catalog.json'),SweepSetup=require('../night-sweep/sweep-setup.js');
const audit=require('../research/alpha18/math-wolfram.json');
const references=JSON.parse(JSON.parse(audit.result.content.find(x=>x.type==='text').text.replace(/^Out\[1\]= /,'')));
const comparisons=[];let checks=0;
function check(name,actual,tolerance=1e-8){const expected=references[name];assert(Number.isFinite(actual),name+' unavailable');assert(Math.abs(actual-expected)<=tolerance,`${name}: ${actual} != ${expected}`);comparisons.push({name,actual,expected,tolerance,difference:actual-expected});checks++;console.log('PASS '+name);}
const launch={lowF:54,highF:860,lowLevel:31,highLevel:43,launchMode:'sqrt'};
check('forwardSquareRoot57MHz',HFC.launchAt(launch,57));
check('forwardSquareRoot753MHz',HFC.launchAt(launch,753));
check('forwardLinear550MHz',HFC.launchAt({...launch,launchMode:'linear'},550));
const cable=catalog.cables.find(c=>c.id==='p3_625');
check('rfCableHotLossDb',HFC.cableAt(cable,{cable:'p3_625',length:400,slack:20},750,104));
check('dcCableHotLoopOhm',HFC.dcSegment(cable,{length:2000,slack:100},104).resistance);
const ctx={HFC,state:{setup:{launchTestPoint:true,launchCoupling:20,lowLevel:-4,highLevel:0}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('night-sweep/meter.js','utf8')+';this.converted=effectiveLaunchSetup();',ctx);
check('tpCorrectedOutputDbmv',ctx.converted.lowLevel);
check('injectionPhysicalOutputDbmv',SweepSetup.generator({desiredInjection:10,injectionCoupling:20,leadLoss:1.5,generatorMaximum:40},'204').setting);
const route={rows:[{id:'synthetic-end',parent:'source',device:'none',length:1000}]};
const tdr=HFC.tdrLocate(route,catalog,{endpoint:'synthetic-end',distance:500,setVF:.82,actualVF:.87,lead:25});assert.equal(tdr.ok,true,tdr.error);
check('tdrCorrectedFeet',tdr.pathDistance);
const power=HFC.powerRun({supplyVoltage:90,supplyRating:15,rows:[{id:'synthetic-load',parent:'supply',cable:'custom',length:0,extraR:2,equipment:'custom',mode:'watts',load:180,pf:1}]},catalog);assert.equal(power.ok,true,power.error);
check('constantPowerStableVoltage',power.minVoltage,1e-7);
check('constantPowerStableCurrent',power.supplyCurrent,1e-8);
const curves=[],counts={curves:0,numericRows:0,printedPoints:0,bandEndpoints:0,gapMidpoints:0,outsideDomains:0};
for(const [kind,rows]of [['devices',catalog.devices],['cables',catalog.cables],['powerEquipment',catalog.powerEquipment]])assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,kind+' unique identifiers');
for(const d of catalog.devices){assert.equal(new Set(d.ports.map(p=>p.id)).size,d.ports.length,d.id+' unique ports');for(const p of d.ports)for(const k of ['nominal','maximum'])if(p[k])curves.push({name:d.id+'/'+p.id+'/'+k,curve:p[k]});}
for(const c of catalog.cables)curves.push({name:c.id,curve:c.curve});
for(const e of catalog.powerEquipment)if(e.mode==='curve')curves.push({name:e.id,curve:{min:e.min_voltage,max:e.max_voltage,points:e.points}});
function value(actual,expected,label){assert.equal(actual,expected,label);}
for(const {name,curve:c}of curves){
 counts.curves++;assert(Number.isFinite(c.min)&&Number.isFinite(c.max)&&c.min<=c.max,name+' finite domain');
 const rows=c.points||c.bands;assert(rows.length,name+' nonempty');
 rows.forEach((r,i)=>{counts.numericRows++;assert(r.every(Number.isFinite),name+' finite row');assert(r.at(-1)>=0,name+' nonnegative loss/current');if(i)assert(r[0]>rows[i-1][0],name+' increasing frequencies/voltages');});
 if(c.points){for(const [f,v]of c.points){value(HFC.curveValue(c,f),v,name+' exact printed point');counts.printedPoints++;}}
 if(c.bands){for(let i=0;i<c.bands.length;i++){const [a,b,v]=c.bands[i],next=c.bands[i+1];assert(a<b&&a>=c.min&&b<=c.max,name+' band domain');if(next)assert(next[0]>=b,name+' no overlapping bands');value(HFC.curveValue(c,a),v,name+' lower endpoint');value(HFC.curveValue(c,b),next?.[0]===b?next[2]:v,name+' upper endpoint');counts.bandEndpoints+=2;if(next&&next[0]>b){value(HFC.curveValue(c,(b+next[0])/2),c.gapPolicy==='adjacent-maximum'?Math.max(v,next[2]):null,name+' printed gap');counts.gapMidpoints++;}}}
 const a=rows[0][0],b=c.points?rows.at(-1)[0]:rows.at(-1)[1];value(HFC.curveValue(c,a-.001),null,name+' below table');value(HFC.curveValue(c,b+.001),null,name+' above table');counts.outsideDomains+=2;
}
checks++;console.log('PASS current catalog integrity and runtime table endpoints');
const result={generatedAt:new Date().toISOString(),status:'PASS',scope:'Ten fresh synthetic Wolfram arithmetic comparisons plus current catalog structural/runtime checks. Does not independently retranscribe source manuals, establish field measurements, or certify physical equipment.',groupedChecks:checks,comparisons,catalog:{devices:catalog.devices.length,cables:catalog.cables.length,powerEquipment:catalog.powerEquipment.length,...counts},inputSha256:Object.fromEntries(['night-sweep/engine.js','night-sweep/catalog.json','night-sweep/projects.js','night-sweep/meter.js','night-sweep/sweep-setup.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))};
fs.writeFileSync('research/alpha18/math-data-audit.json',JSON.stringify(result,null,2)+'\n');
console.log(`Alpha18 numeric audit: ${checks} checks passed`);
