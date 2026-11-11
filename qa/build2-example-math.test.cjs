'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {bootApp}=require('./build2-source-harness.cjs');
const Sweep=require('../night-sweep/sweep-setup.js'),FieldWork=require('../night-sweep/field-work.js');
const app=bootApp(),engine=app.ev('HFC'),catalog=app.json('catalog');let checks=0,numericComparisons=0,unavailableComparisons=0;
function check(name,f){f();checks++;console.log('PASS '+name);}
function eq(a,b,label){if(b===null){assert.equal(a,null,label);unavailableComparisons++;}else{assert(Number.isFinite(a),label+' finite');assert(Math.abs(a-b)<1e-7,`${label}: ${a} != ${b}`);numericComparisons++;}}
const num=x=>(typeof x==='string'||typeof x==='number')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
function points(text){return String(text||'').trim().split(/\n/).filter(x=>x.trim()).map(x=>x.trim().split(/[;,\s]+/).map(num)).sort((a,b)=>a[0]-b[0]);}
function referenceCurve(c,f,sqrt=false){
 if(!c||!Number.isFinite(f)||f<c.min||f>c.max)return null;
 if(c.bands){const candidates=c.bands.filter(([a,b])=>f>=a&&f<=b);if(candidates.length)return candidates.at(-1)[2];if(c.gapPolicy==='adjacent-maximum'){for(let i=1;i<c.bands.length;i++)if(f>c.bands[i-1][1]&&f<c.bands[i][0])return Math.max(c.bands[i-1][2],c.bands[i][2]);}return null;}
 const p=c.points;if(!p?.length||f<p[0][0]||f>p.at(-1)[0])return null;const exact=p.find(([x])=>x===f);if(exact)return exact[1];
 for(let i=1;i<p.length;i++)if(f>p[i-1][0]&&f<p[i][0]){const x=sqrt?Math.sqrt(f):f,x0=sqrt?Math.sqrt(p[i-1][0]):p[i-1][0],x1=sqrt?Math.sqrt(p[i][0]):p[i][0];return (p[i-1][1]*(x1-x)+p[i][1]*(x-x0))/(x1-x0);}return null;
}
function tableCurve(text,column=1,sqrt=false){const p=points(text);if(p.length<2||p.some(x=>x.some(y=>y===null)))return ()=>null;return f=>referenceCurve({min:p[0][0],max:p.at(-1)[0],points:p.map(x=>[x[0],x[column]])},f,sqrt);}
function launch(s,f){
 if(!Number.isFinite(f)||f<5||f>1800)return null;const coupling=s.launchTestPoint&&num(s.launchCoupling)!==null?num(s.launchCoupling):0;
 if(s.launchMode==='table'){const value=tableCurve(s.launchTable)(f);return value===null?null:value+coupling;}
 const [a,b,lo,hi]=[s.lowF,s.highF,s.lowLevel,s.highLevel].map(num);if([a,b,lo,hi].includes(null)||a<5||b>1800||b<=a||!s.extendLaunch&&(f<a||f>b))return null;
 const x=s.launchMode==='sqrt'?Math.sqrt(f):f,x0=s.launchMode==='sqrt'?Math.sqrt(a):a,x1=s.launchMode==='sqrt'?Math.sqrt(b):b;return (lo*(x1-x)+hi*(x-x0))/(x1-x0)+coupling;
}
function refPorts(d,row){return d?.custom?row.terminal?[{id:'tap'}]:[{id:'through'},{id:'tap'}]:d?.ports||[];}
function reference(candidate,f){const s=candidate.setup,temp=num(s.temperature),lo=num(s.lowF),hi=num(s.highF),config=lo!==null&&hi!==null&&lo>=5&&hi<=1800&&hi>lo&&temp!==null&&temp>=-40&&temp<=185&&['nominal','max'].includes(s.basis)&&num(s.liveMax)!==null,validF=Number.isFinite(f)&&f>=5&&f<=1800;const src=config?launch(s,f):null,byKey=new Map([['source',{level:src,loss:config&&validF?0:null}]]),rows=[];
 for(const row of candidate.rows){const d=catalog.devices.find(x=>x.id===row.device),c=catalog.cables.find(x=>x.id===row.cable),parent=byKey.get(row.parent),length=num(row.length),slack=num(row.slack??0);let cable=null;
  if(validF&&temp!==null&&length!==null&&slack!==null&&length>=0&&slack>=0){if(length+slack===0)cable=0;else if(row.cable==='custom'){const rate=tableCurve(row.customCable,1,true)(f);cable=rate===null?null:rate*(length+slack)/100;}else{const rate=referenceCurve(c?.curve,f,true);cable=rate===null?null:rate*(length+slack)/100*(1+.001*(temp-68));}}
  const input=parent?.level!==null&&parent?.level!==undefined&&cable!==null?parent.level-cable:null,inputLoss=parent?.loss!==null&&parent?.loss!==undefined&&cable!==null?parent.loss+cable:null,outputs=[];
  for(const port of refPorts(d,row)){let net=null;if(d?.active){const lower=d.activeMinF??d.publishedGain?.forwardBand?.[0]??5,upper=d.activeMaxF??d.publishedGain?.forwardBand?.[1]??1800;let gain=null;if(validF&&f>=lower&&f<=upper){if(row.activeMode==='table')gain=tableCurve(row.activeGainTable)(f);else if(row.activeMode==='flat'){const g=num(row.activeGain),a=num(row.activeMinF),b=num(row.activeMaxF);if(g!==null&&a!==null&&b!==null&&f>=a&&f<=b)gain=g;}else gain=referenceCurve({min:num(row.gainLowF),max:num(row.gainHighF),points:[[num(row.gainLowF),num(row.gainLow)],[num(row.gainHighF),num(row.gainHigh)]]},f);}const pad=num(row.outputLoss??0);net=gain===null||pad===null?null:pad-gain;
   }else if(d?.id==='none')net=0;else if(d?.custom)net=tableCurve(row.customLoss,row.terminal?1:port.id==='through'?1:2)(f);else net=referenceCurve(s.basis==='max'?port.maximum:port.nominal||port.maximum,f);
   const out={key:row.id+'::'+port.id,level:input===null||net===null?null:input-net,loss:inputLoss===null||net===null?null:inputLoss+net};outputs.push(out);byKey.set(out.key,out);
  }rows.push({id:row.id,cable,input,outputs});
 }return {source:src,rows};
}
const fixed=[4,5,10,42,54,57,85,204,258,261,303,550,711,753,860,993,1000,1002,1218,1794,1800,1801],results=[];
try{
 for(const id of app.json('TrainingJob.exercises.map(x=>x.id)'))check('independent full-frequency replay of '+id,()=>{
  app.ev('state=TrainingJob.makePractice('+JSON.stringify(id)+')');const candidate=app.json('state'),correctedSetup=app.json('effectiveLaunchSetup()'),domains=new Set(fixed);for(const row of candidate.rows){const d=catalog.devices.find(x=>x.id===row.device);for(const p of d?.ports||[])for(const curve of [p.nominal,p.maximum])if(curve)for(const x of curve.points||curve.bands||[]){for(const frequency of [x[0]-.0001,x[0],x[0]+.0001,...(curve.bands?[x[1]-.0001,x[1],x[1]+.0001]:[])])if(frequency>=5&&frequency<=1800)domains.add(frequency);}}
  const frequencies=[...domains].sort((a,b)=>a-b);let frames=0;const beforeNumeric=numericComparisons,beforeUnavailable=unavailableComparisons;
  for(const f of frequencies){const actual=engine.run({...candidate,setup:correctedSetup},catalog,f),wanted=reference(candidate,f);eq(actual.source,wanted.source,id+' source@'+f);actual.results.forEach((row,i)=>{const target=wanted.rows[i];eq(row.cableLoss,target.cable,id+' '+row.id+' cable@'+f);eq(row.input.level,target.input,id+' '+row.id+' input@'+f);assert.equal(row.outputs.length,target.outputs.length);row.outputs.forEach((out,j)=>{assert.equal(out.key,target.outputs[j].key);eq(out.level,target.outputs[j].level,id+' '+out.key+' level@'+f);eq(out.loss,target.outputs[j].loss,id+' '+out.key+' path loss@'+f);});});frames++;}
  results.push({id,routeRows:candidate.rows.length,frequencies:frequencies.length,frames,numericComparisons:numericComparisons-beforeNumeric,unavailableComparisons:unavailableComparisons-beforeUnavailable,frequencyLimits:[Math.min(...frequencies),Math.max(...frequencies)]});
 });
 check('relative and absolute return helper arithmetic agree with independently entered planes',()=>{for(let i=0;i<40;i++){const rawLow=-10+i/10,rawHigh=-7+i/10,targetLow=-8,targetHigh=-8,p={lowMHz:10,highMHz:42,measuredLow:rawLow,measuredHigh:rawHigh,targetLow,targetHigh,addLow:20,addHigh:30,currentBandwidth:'1.6',referenceBandwidth:'1.6',currentView:'detailed',referenceView:'detailed'};const relative=Sweep.comparison(p,'42');assert.equal(relative.valid,true);eq(relative.low,rawLow,'relative low');eq(relative.tilt,3,'relative tilt');eq(relative.tiltError,3,'relative tilt error');const absolute=Sweep.comparison({...p,comparisonMode:'absolute',highMHz:204},'204');assert.equal(absolute.valid,true);eq(absolute.low,rawLow+20,'absolute low');eq(absolute.high,rawHigh+30,'absolute high');eq(absolute.tilt,13,'absolute tilt');assert.equal(Sweep.comparison({...p,currentBandwidth:'6.4'},'42').valid,false);}});
 check('same-plane logarithmic voltage unit conversions preserve round trips and signed values',()=>{for(let i=-100;i<=100;i++){eq(FieldWork.convert(i,'dbuv'),i-60,'dBuV to dBmV');eq(FieldWork.convert(i,'dbmv'),i+60,'dBmV to dBuV');eq(FieldWork.convert(FieldWork.convert(i,'dbuv'),'dbmv'),i,'round trip');}for(const x of ['',null,NaN,Infinity,{},true])assert.equal(FieldWork.convert(x,'dbuv'),null);});
 check('source replay has no script execution errors',()=>assert.deepEqual(app.errors,[]));
 const result={generatedAt:new Date().toISOString(),status:'PASS',scope:(process.env.NIGHTSWEEP_RELEASE_TEST==='1'?'Frozen generated standalone. ':'Current source assembly. ')+'Seven synthetic examples replayed with an independent table/route interpreter at standard frequencies and source-curve boundaries, plus return-plane and voltage-unit backtests. Does not establish full function/branch coverage or physical hardware acceptance.',groupedChecks:checks,numericComparisons,unavailableComparisons,examples:results,inputSha256:Object.fromEntries(['night-sweep/engine.js','night-sweep/projects.js','night-sweep/training.js','night-sweep/catalog.json'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))};fs.mkdirSync('research/build2',{recursive:true});fs.writeFileSync('research/build2/example-math-backtest.json',JSON.stringify(result,null,2)+'\n');console.log(`Build2 example math: ${checks} checks passed`);
}finally{app.close();}
