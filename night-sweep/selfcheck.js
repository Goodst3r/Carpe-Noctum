/* Reference cases prove this build, not the plant. No state or measurement edits. */
function referenceCases(engine,cat,nodes){
 const cases=[];
 const test=(label,fn)=>{try{fn();cases.push({label,ok:true});}catch(e){cases.push({label,ok:false,error:e.message});}};
 const near=(a,b,tolerance=1e-6)=>{if(a===null||!Number.isFinite(a)||Math.abs(a-b)>tolerance)throw Error(String(a)+' ≠ '+b);};
 const setup={lowF:55,highF:750,lowLevel:32,highLevel:43,launchMode:'sqrt',extendLaunch:false,temperature:68,basis:'nominal',liveMax:993};
 const manual=cat.devices.find(d=>d.custom),p3625=cat.cables.find(c=>c.id==='p3_625');
 test('Workbook legacy custom span: 26.9292 / 25.8956; tilt −1.0336 dB',()=>{
  if(!manual)throw Error('Custom passive missing');
  const route={setup,rows:[{id:'r1',parent:'source',length:798,cable:'custom',customCable:'55,0.46\n750,1.78',device:manual.id,customLoss:'55,0.7,0.7\n750,1.4,1.4'},{id:'r2',parent:'r1::through',length:0,cable:'p3_625',device:manual.id,customLoss:'55,0.7,0.7\n750,1.5,1.5'}]};
  const a=engine.run(route,cat,55).byKey.get('r2::through')?.level,b=engine.run(route,cat,750).byKey.get('r2::through')?.level;near(a,26.9292);near(b,25.8956);near(b-a,-1.0336);
 });
 test('√frequency launch: 576 MHz = 40 dBmV',()=>near(engine.launchAt({...setup,lowF:256,highF:1024,lowLevel:34,highLevel:46},576),40));
 const powerRow=(id,parent,resistance,load,mode='amps')=>({id,parent,length:1000,cable:'custom',dcRate:resistance,extraR:0,equipment:'custom',mode,load,pf:1,minV:''});
 test('Branched RMS: 87 / 85 / 81 V, 23 W, 3 A',()=>{
  const x=engine.powerRun({supplyVoltage:90,supplyRating:15,rows:[powerRow('p1','supply',1,0),powerRow('p2','p1',2,1),powerRow('p3','p1',3,2)]},cat);
  [87,85,81].forEach((v,i)=>near(x.rows[i]?.voltage,v));near(x.wireWatts,23);near(x.supplyCurrent,3);
 });
 test('180 W RMS: 85.80441152620634 V, 2.097794236896832 A',()=>{
  const x=engine.powerRun({supplyVoltage:90,supplyRating:15,rows:[powerRow('p1','supply',2,180,'watts')]},cat);near(x.rows[0]?.voltage,85.80441152620634);near(x.supplyCurrent,2.097794236896832);
 });
 test('P3.625 resistance: 1.10 Ω at 68°F; 1.188 Ω at 104°F',()=>{near(engine.dcSegment(p3625,{length:1000},68,.004).resistance,1.10);near(engine.dcSegment(p3625,{length:1000},104,.004).resistance,1.188);});
 test('Catalog P3.625 at 55 MHz: 0.45 dB/100 ft; 798 ft = 3.591 dB',()=>{near(engine.curveValue(p3625.curve,55,'sqrt'),.45);near(engine.cableAt(p3625,{length:798,cable:p3625.id},55,68),3.591);});
 test('Three Technetix sample taps: cascade through, tap and cable predictions',()=>{
  const rows=['OTTZ-4-23','OTTZ-4-20','OTTZ-4-17'].map((model,i)=>({id:'r'+(i+1),parent:i?'r'+i+'::through':'source',cable:p3625.id,length:[400,250,180][i],device:cat.devices.find(d=>d.model===model)?.id}));
  const route={setup:{...setup,lowF:261,highF:993,lowLevel:34,highLevel:46},rows};
  for(const [f,through,tap,cable] of [[261,23.04,5.45,4.073],[993,24.71,7.90,8.394]]){const x=engine.run(route,cat,f);near(x.byKey.get('r3::through')?.level,through,.005);near(x.byKey.get('r3::tap')?.level,tap,.005);near(x.results[0]?.cableLoss,cable,.0005);}
 });
 test('EN9000 band copy changes hardware fields only, approval No',()=>{
  if(!nodes)throw Error('NodeTools missing');const before={id:'1200',equipmentUpper:1218,forwardFloor:258,returnCeiling:204,available:993,plannedUpper:1200,launchLow:34,approved:'Yes'},measurements=[{rawLow:14,addLow:20}];
  const n={model:'vecima-en9000',band:String(cat.nodeProfiles.find(p=>p.id==='vecima-en9000').bands.findIndex(b=>b.returnCeiling===204))};
  const patch=nodes.patch(n,cat),keys=Object.keys(patch).sort();if(JSON.stringify(keys)!==JSON.stringify(['approved','equipmentUpper','forwardFloor','returnCeiling']))throw Error('Unexpected hardware patch fields');
  const after={...before,...patch};near(after.equipmentUpper,1794);near(after.forwardFloor,258);near(after.returnCeiling,204);if(after.approved!=='No')throw Error('Criteria still approved');
  for(const k of Object.keys(before))if(!keys.includes(k)&&before[k]!==after[k])throw Error('Other profile fields changed');if(measurements[0].rawLow!==14||measurements[0].addLow!==20)throw Error('Measurement changed');
 });
 return {ok:cases.every(x=>x.ok),cases};
}
function runBuildSelfCheck(){
 let result;try{result=referenceCases(HFC,catalog,NodeTools);}catch(e){result={ok:false,cases:[{label:'Reference runner',ok:false,error:e.message}]};}
 window.NightSweep.selfCheck=result;
 const banner=document.getElementById('selfCheckWarning'),footer=document.getElementById('selfCheckFooter');
 if(banner){banner.hidden=result.ok;banner.textContent=result.ok?'':'BUILD SELF-CHECK FAILED — Do not trust the results. '+result.cases.filter(x=>!x.ok).map(x=>x.label+': '+x.error).join(' · ');}
 if(footer)footer.textContent=result.ok?'Reference cases match ('+result.cases.length+'). They prove this build, not the plant.':'Reference cases FAIL. Do not trust the results.';
 return result;
}
if(typeof document!=='undefined'){const button=document.getElementById('runSelfCheck');if(button)button.onclick=runBuildSelfCheck;}
if(typeof module!=='undefined'&&module.exports){module.exports={referenceCases};if(require.main===module){const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),root=__dirname,engine=require('./engine.js'),cat=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8')),context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'nodes.js'),'utf8')+'\nthis.tools=NodeTools;',context);const result=referenceCases(engine,cat,context.tools);for(const c of result.cases)console.log((c.ok?'PASS ':'FAIL ')+c.label+(c.error?' — '+c.error:''));if(!result.ok)process.exitCode=1;}}
