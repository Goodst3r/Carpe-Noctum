'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{performance}=require('node:perf_hooks');
const H=require('../night-sweep/engine.js'),cat=require('../night-sweep/catalog.json');
const raw=require('../research/build2/power-wolfram.json');
const gold=JSON.parse(JSON.parse(raw.result.content.find(x=>x.type==='text').text.replace(/^Out\[1\]= /,'')));
const summary={groupedChecks:0,numericComparisons:0,constructedCircuits:0,constructedRows:0,manufacturerCases:[],timings:[]};
function check(label,fn){fn();summary.groupedChecks++;console.log('PASS '+label);}
function near(a,b,label='',tol=1e-6){assert(Number.isFinite(a),label+' unavailable');assert(Math.abs(a-b)<=tol,`${label}: ${a} != ${b}`);summary.numericComparisons++;}
const row=(id,load,patch={})=>({id,parent:'supply',cable:'custom',length:0,extraR:0,equipment:'custom',mode:'amps',load,pf:1,minV:'',...patch});
const plan=(rows,patch={})=>({supplyVoltage:90,supplyRating:15,temperatureF:68,resistanceAlpha:.004,rows,...patch});
function usable(p,catalog=cat){const out=H.powerRun(p,catalog);assert.equal(out.ok,true,out.error);return out;}
// Derive section currents by ancestry membership, independently of the engine's
// reverse-order accumulation, then derive voltages directly from complete paths.
function analytic(rows,supply){
 const byId=new Map(rows.map(r=>[r.id,r]));
 const ancestry=r=>{const path=[];for(let at=r;at;at=byId.get(at.parent))path.push(at.id);return path;};
 const paths=rows.map(ancestry),sections=rows.map(r=>rows.reduce((sum,d,j)=>sum+(paths[j].includes(r.id)?d.own:0),0));
 const volts=rows.map((r,i)=>supply-paths[i].reduce((sum,id)=>{const j=rows.findIndex(x=>x.id===id);return sum+sections[j]*rows[j].R;},0));
 return {sections,volts,supplyCurrent:rows.reduce((sum,r)=>sum+r.own,0),wireWatts:rows.reduce((sum,r,i)=>sum+sections[i]**2*r.R,0)};
}
function checkCircuit(rows,patch={}){
 const expected=analytic(rows,patch.supplyVoltage||90);
 const input=rows.map((r,i)=>{const pf=.5+(i%6)/10,mode=['amps','watts','va','curve'][i%4];return row(r.id,mode==='watts'?r.own*expected.volts[i]*pf:mode==='va'?r.own*expected.volts[i]:r.own,{parent:r.parent,extraR:r.R,mode,pf,equipment:mode==='curve'?'constructed-'+i:'custom'});});
 const catalog={...cat,powerEquipment:rows.map((r,i)=>({id:'constructed-'+i,points:[[40,r.own],[100,r.own]]}))};
 const start=performance.now(),out=usable(plan(input,patch),catalog);summary.timings.push({rows:rows.length,milliseconds:performance.now()-start});
 out.rows.forEach((r,i)=>{near(r.voltage,expected.volts[i],r.id+' voltage');near(r.deviceCurrent,rows[i].own,r.id+' own current');near(r.sectionCurrent,expected.sections[i],r.id+' section current');});
 near(out.supplyCurrent,expected.supplyCurrent,'supply current');near(out.wireWatts,expected.wireWatts,'wire heating');
 near(out.sourceVA,out.rows.reduce((s,r)=>s+r.voltage*r.deviceCurrent,0)+out.wireWatts,'scalar VA balance',1e-5);
 summary.constructedCircuits++;summary.constructedRows+=rows.length;return {out,input};
}
check('fresh Wolfram constant watts/PF high root and power balance',()=>{
 const out=usable(plan([row('p1',250,{mode:'watts',pf:.8,extraR:1.75})],{supplyVoltage:95}));
 near(out.minVoltage,gold.singleWattsPfVoltage);near(out.supplyCurrent,gold.singleWattsPfCurrent);near(out.wireWatts,gold.singleWattsPfWireWatts);near(out.sourceVA,gold.singleWattsPfSourceVA);
 near(out.sourceVA,250/.8+out.wireWatts,'scalar apparent energy balance');
});
check('fresh Wolfram mixed amps/VA/watts branched circuit',()=>{
 const out=usable(plan([row('p1',gold.constructedMixedBranchLoads[0],{extraR:.1}),row('p2',gold.constructedMixedBranchLoads[1],{parent:'p1',mode:'va',extraR:.2}),row('p3',gold.constructedMixedBranchLoads[2],{parent:'p1',mode:'watts',pf:.8,extraR:.3})]));
 out.rows.forEach((r,i)=>near(r.voltage,gold.constructedMixedBranchVoltages[i]));near(out.wireWatts,gold.constructedMixedWireWatts);near(out.supplyCurrent,.9);
});
check('100 deterministic mixed-mode radial circuits conserve ancestry currents and scalar energy',()=>{
 for(let k=1;k<=100;k++)checkCircuit(Array.from({length:25},(_,i)=>({id:'p'+(i+1),parent:i===0||i%7===0?'supply':'p'+(1+((i*11+k)%i)),own:((i*7+k)%7+1)/100,R:((i*3+k)%5+1)/100})));
});
check('200-point serial and balanced branched circuits retain finite correct results',()=>{
 for(const serial of [true,false])checkCircuit(Array.from({length:200},(_,i)=>({id:'p'+(i+1),parent:i===0?'supply':'p'+(serial?i:Math.floor((i-1)/2)+1),own:(i%5+1)/1000,R:(i%5+1)/1000})));
});
check('amps watts and VA agree at an independently selected operating voltage',()=>{
 for(const v of [45,60,90])for(const I of [0,.1,1,2])for(const pf of [.5,.75,1]){
  const supply=v+2*I;const answers=[row('p1',I,{extraR:2}),row('p1',v*I,{mode:'va',extraR:2}),row('p1',v*I*pf,{mode:'watts',pf,extraR:2})].map(r=>usable(plan([r],{supplyVoltage:supply})));
  answers.forEach(out=>{near(out.minVoltage,v);near(out.supplyCurrent,I);});
 }
});
check('all manufacturer curve segments solve at derived known operating voltages',()=>{
 for(const e of cat.powerEquipment.filter(e=>e.points))for(let j=1;j<e.points.length;j++)for(const fraction of [.1,.5,.9])for(const resistance of [0,.25,1,5]){
  const [v0,i0]=e.points[j-1],[v1,i1]=e.points[j],voltage=v0+fraction*(v1-v0),current=i0+fraction*(i1-i0),supply=voltage+resistance*current;
  const out=usable(plan([row('p1','',{mode:'curve',equipment:e.id,extraR:resistance})],{supplyVoltage:supply}));
  near(out.minVoltage,voltage,e.id+' operating voltage');near(out.supplyCurrent,current,e.id+' current');near(out.sourceVA,voltage*current+out.wireWatts,e.id+' scalar balance');
  summary.manufacturerCases.push({id:e.id,voltage,current,resistance,supply,actualVoltage:out.minVoltage,actualCurrent:out.supplyCurrent});
 }
});
check('Fahrenheit boundary correction and actual-temperature overrides remain distinct',()=>{
 const cable=cat.cables.find(c=>c.id==='p3_625');[-40,185].forEach((temperature,i)=>near(H.dcSegment(cable,{length:1000},temperature).resistance,gold.thermalBoundaryResistanceOhms[i]));
 for(const temperature of [-40,68,104,185]){near(H.dcSegment(cable,{length:1000,dcRate:1.5},temperature,.004).resistance,1.5);near(H.dcSegment(cable,{length:1000},temperature,0).resistance,1.1);}
 const out=usable(plan([row('p1',1,{cable:'p3_625',length:1000,slack:100,extraR:2})],{temperatureF:104}));near(out.rows[0].resistance,1.1*1.1*1.08+2,'slack and contact resistance');
});
check('missing readings invalid electrical values and nonfinite inputs never become zero',()=>{
 for(const patch of [{load:''},{load:' '},{load:null},{load:true},{load:NaN},{load:Infinity},{load:-1},{mode:'watts',pf:''},{mode:'watts',pf:0},{mode:'watts',pf:1.01},{mode:'nonsense'},{extraR:''},{extraR:-1},{length:-1},{length:10,dcRate:''},{length:10,dcRate:-1}])assert.equal(H.powerRun(plan([row('p1',1,patch)]),cat).ok,false,JSON.stringify(patch));
 for(const patch of [{supplyVoltage:''},{supplyVoltage:0},{supplyVoltage:Infinity},{supplyRating:0},{temperatureF:''},{temperatureF:-40.01},{temperatureF:185.01},{resistanceAlpha:''},{resistanceAlpha:-.001},{resistanceAlpha:.01001}])assert.equal(H.powerRun(plan([row('p1',1)],patch),cat).ok,false,JSON.stringify(patch));
 for(const temperature of ['',null,false,NaN,Infinity])assert.equal(H.dcSegment(null,{length:0},temperature).resistance,null);
});
check('invalid parent order cycles duplicates and point-count overflow are rejected',()=>{
 for(const rows of [[row('p1',1,{parent:'missing'})],[row('p1',1,{parent:'p1'})],[row('p1',1,{parent:'p2'}),row('p2',1,{parent:'p1'})],[row('p1',1),row('p1',1)],Array.from({length:201},(_,i)=>row('p'+i,0))])assert.equal(H.powerRun(plan(rows),cat).ok,false);
});
check('unsupported manual-only or malformed manufacturer curves stay unavailable',()=>{
 for(const e of cat.powerEquipment.filter(e=>!e.points))assert.equal(H.powerRun(plan([row('p1',1,{mode:'curve',equipment:e.id})]),cat).ok,false);
 for(const points of [[],[[45,1]],[[45,1],[45,2]],[[45,1],[90,-1]],[[45,1],[90,Infinity]],[[45,'1'],[90,1]]])assert.equal(H.powerRun(plan([row('p1',1,{mode:'curve',equipment:'bad'})]),{...cat,powerEquipment:[{id:'bad',points}]}).ok,false);
});
check('power collapse returns no false usable result while valid zero load stays zero',()=>{
 assert.equal(H.powerRun(plan([row('p1',2000,{mode:'watts',extraR:2})]),cat).ok,false);
 for(const mode of ['amps','watts','va']){const out=usable(plan([row('p1',0,{mode,extraR:10})]));near(out.supplyCurrent,0);near(out.minVoltage,90);near(out.wireWatts,0);}
});
check('missing ratings and voltage limits stay unknown while warnings retain signed headroom',()=>{
 const unknown=usable(plan([row('p1',1)],{supplyRating:''}));assert.equal(unknown.loading,null);assert.equal(unknown.headroom,null);
 const over=usable(plan([row('p1',2,{extraR:3,minV:85})],{supplyRating:1}));near(over.headroom,-1);assert(over.warnings.some(x=>/minimum/.test(x)));assert(over.warnings.some(x=>/rating/.test(x)));
});
check('legacy DC endpoint follows one selected cable ancestry and keeps sibling lengths separate',()=>{
 const catalog={cables:[],devices:[{id:'none',ports:[{id:'through'}]}]},state={setup:{dcEndpoint:'r2',dcCurrent:2,dcExtra:.5},rows:[{id:'r1',parent:'source',device:'none',length:100,slack:20,dcRate:2},{id:'r2',parent:'r1::through',device:'none',length:200,dcRate:3},{id:'r3',parent:'r1::through',device:'none',length:300,dcRate:4}]};
 for(const [endpoint,resistance]of [['r2',.84],['r3',1.44]]){state.setup.dcEndpoint=endpoint;const out=H.dcRoute(state,catalog);near(out.cableResistance,resistance);near(out.total,resistance+.5);near(out.drop,(resistance+.5)*2);near(out.watts,(resistance+.5)*4);}
 for(const parent of ['missing::through','r2::through','r1::no-port']){state.rows[1].parent=parent;state.setup.dcEndpoint='r2';const out=H.dcRoute(state,catalog);assert(out.error);assert.equal(out.total,null);assert.equal(out.drop,null);}
});
check('actual what-if helper recalculates a copy and preserves independent baseline values',()=>{
 const baseline=plan([row('p1',.2,{extraR:.1}),row('p2',.3,{parent:'p1',extraR:.2})]),ctx={HFC:H,catalog:cat,state:{power:baseline}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('night-sweep/field-report.js','utf8')+';this.trial=FieldReport.calculatePowerWhatIf;',ctx);
 const before=JSON.stringify(baseline),out=ctx.trial({parent:'p2',cable:'custom',dcRate:2,length:100,amps:.4,minV:85});assert(out.ok,out.error);assert.equal(JSON.stringify(baseline),before);near(out.supplyCurrent,.9);near(out.rows[0].voltage,89.91);near(out.rows[1].voltage,89.77);near(out.voltage,89.69);near(out.headroom,4.69);assert.equal(out.plan.rows.length,3);
 for(const patch of [{parent:'missing'},{length:''},{amps:''},{minV:-1},{dcRate:''}])assert.equal(ctx.trial({parent:'p2',cable:'custom',dcRate:2,length:100,amps:.4,minV:85,...patch}).ok,false);
});
check('trial at the 200-point limit is refused before adding a planning row',()=>{
 const ctx={HFC:H,catalog:cat,state:{power:plan(Array.from({length:200},(_,i)=>row('p'+i,0)))}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('night-sweep/field-report.js','utf8')+';this.trial=FieldReport.calculatePowerWhatIf;',ctx);const before=JSON.stringify(ctx.state.power),out=ctx.trial({parent:'supply',cable:'custom',dcRate:2,length:100,amps:1,minV:45});assert.equal(out.ok,false);assert.match(out.error,/200/);assert.equal(JSON.stringify(ctx.state.power),before);
});
const durations=summary.timings.map(x=>x.milliseconds).sort((a,b)=>a-b),result={generatedAt:new Date().toISOString(),status:'PASS',scope:'Deterministic synthetic scalar-RMS power backtests, table ranges and actual what-if helper. No physical-device, equipment-consumption, phasor or mains-power certification.',...summary,timingSummary:{circuits:durations.length,medianMilliseconds:durations[Math.floor(durations.length/2)],maxMilliseconds:durations.at(-1)},inputSha256:Object.fromEntries(['night-sweep/engine.js','night-sweep/field-report.js','night-sweep/catalog.json','qa/build2-power.test.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))};
fs.writeFileSync(require('./evidence-path.cjs').evidencePath('research/build2/power-backtest-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(`Build2 power backtest: ${summary.groupedChecks} checks passed (${summary.numericComparisons} numeric comparisons; ${summary.manufacturerCases.length} manufacturer cases).`);
