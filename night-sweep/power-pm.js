/* Power supply PM notebook and span voltage drop (build list item 14, 2.0 Alpha build 3).
   A personal notebook on this device. It is not the company power record and it is not stored in the job.
   Span drop uses the cable catalog's published loop resistance and each active's published minimum
   input. No company undervoltage, battery window or inverter pass limit is filled in.
   SCTE 238 and the 2025/2026 SCTE powering projects named in the build list were not read. */
const PowerPM=(()=>{
 const KEY='nightsweep-power-pm-v1';
 const SIDE=KEY+'-unreadable';
 const LIMITS=Object.freeze({supplies:40,visits:80,batteries:8,name:80,alarms:160,slot:40});
 const CHEM=Object.freeze({'':'Not recorded',vrla:'VRLA',lithium:'Lithium',other:'Other'});
 const INVERTER=Object.freeze({'':'Not recorded',ran:'Ran', 'did-not-run':'Did not run','not-tested':'Not tested'});
 const number=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 function fail(error){return {ok:false,error};}
 /* Same product as HFC.dcSegment: loop ohms at 68 °F, times (1 + α·Δ°C), times feet/1000.
    α is whatever the technician types. This function does not fill in 0.004. */
 function spanDrop(input){
  const length=number(input.lengthFt),slack=input.slackFt===undefined||input.slackFt===null||String(input.slackFt).trim()===''?0:number(input.slackFt);
  const rate=number(input.loopOhmPer1000ft),temp=number(input.temperatureF),alpha=number(input.alphaPerC);
  const current=number(input.currentA),supply=number(input.supplyVolts);
  if(length===null||length<0)return fail('Enter a cable length of 0 or more feet.');
  if(slack===null||slack<0)return fail('Enter slack of 0 or more feet, or leave it blank.');
  if(rate===null||rate<=0)return fail('This cable has no published loop resistance, so the drop is not calculated.');
  if(temp===null||temp<-40||temp>185)return fail('Enter a cable temperature from −40 to 185 °F.');
  if(alpha===null||alpha<0||alpha>0.01)return fail('Enter a resistance coefficient from 0 to 0.01 per °C. 0.004 is the engineering approximation already used on Plan → Load; type it only if you mean to use it.');
  if(current===null||current<0)return fail('Enter a span current of 0 or more amps.');
  if(supply===null||supply<=0)return fail('Enter a positive voltage at the start of this span.');
  const spanFt=length+slack,factor=1+alpha*(temp-68)*5/9,resistance=rate*spanFt/1000*factor,drop=current*resistance,atActive=supply-drop;
  if(![factor,resistance,drop,atActive].every(Number.isFinite)||atActive<=0)return fail('No usable voltage at this length, resistance and current.');
  return {ok:true,error:'',spanFt,factor,resistance,drop,atActive,rate,temperatureF:temp,alphaPerC:alpha,currentA:current,supplyVolts:supply};
 }
 function chain(startVolts,spans){
  const rows=[];let volts=number(startVolts);
  if(volts===null||volts<=0)return fail('Enter a positive voltage at the supply end of the first span.');
  if(!Array.isArray(spans)||!spans.length)return fail('Add at least one span.');
  if(spans.length>40)return fail('One visit keeps at most 40 spans.');
  for(const span of spans){
   const step=spanDrop({...span,supplyVolts:volts});
   if(!step.ok)return step;
   rows.push(step);volts=step.atActive;
  }
  return {ok:true,error:'',rows,atActive:volts};
 }
 function compareMin(atActive,minVoltage){
  if(minVoltage===undefined||minVoltage===null||String(minVoltage).trim()==='')return {status:'unknown',margin:null,text:'No published minimum input is on file for this active. The catalog number is used only when you pick an active that has one. A company minimum is not filled in.'};
  const min=number(minVoltage);
  if(min===null||min<0)return {status:'unknown',margin:null,text:'The published minimum on this active could not be read. Nothing was assumed.'};
  const margin=atActive-min;
  if(atActive<min)return {status:'below',margin,text:'Calculated voltage is below that model’s published minimum input. This is not a company limit.'};
  return {status:'at-or-above',margin,text:'Calculated voltage is at or above that model’s published minimum input. This is not a company limit.'};
 }
 function cableLoop(catalog,cableId){
  const cable=catalog?.cables?.find(c=>c.id===cableId);
  const rate=number(cable?.dc?.loop_ohm_per_1000ft);
  return {cable,rate,basis:cable?.dc?.basis||'',source:cable?.dc?.source_url||'',unit:cable?.dc?.unit||'ohms/1000 ft'};
 }
 function activeMin(catalog,equipmentId){
  const equipment=catalog?.powerEquipment?.find(e=>e.id===equipmentId);
  return {equipment,min:equipment&&equipment.min_voltage!==undefined&&equipment.min_voltage!==null?number(equipment.min_voltage):null,max:equipment?number(equipment.max_voltage):null,label:equipment?.label||'',source:equipment?.source_url||''};
 }
 function validDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;
  const [y,m,d]=String(value).split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));
  return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d&&y>=1&&y<=9999;
 }
 function selfCheck(){
  const problems=[];
  const a=spanDrop({lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:5,supplyVolts:90});
  if(!a.ok||Math.abs(a.drop-5.5)>1e-9||Math.abs(a.atActive-84.5)>1e-9)problems.push('1000 ft worked example');
  const hot=spanDrop({lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:104,alphaPerC:0.004,currentA:5,supplyVolts:90});
  if(!hot.ok||Math.abs(hot.factor-1.08)>1e-12||Math.abs(hot.resistance-1.188)>1e-9)problems.push('104 °F factor');
  if(spanDrop({lengthFt:1000,loopOhmPer1000ft:'',temperatureF:68,alphaPerC:0.004,currentA:5,supplyVolts:90}).ok)problems.push('missing rate calculated');
  if(spanDrop({lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:'',currentA:5,supplyVolts:90}).ok)problems.push('blank coefficient filled in');
  const walked=chain(90,[{lengthFt:1000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:8},{lengthFt:500,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:3}]);
  if(!walked.ok||Math.abs(walked.rows[0].atActive-81.2)>1e-9||Math.abs(walked.rows[1].drop-1.65)>1e-9||Math.abs(walked.atActive-79.55)>1e-9)problems.push('two-span walk');
  const low=spanDrop({lengthFt:5000,loopOhmPer1000ft:1.1,temperatureF:68,alphaPerC:0.004,currentA:10,supplyVolts:60});
  if(!low.ok||compareMin(low.atActive,35).status!=='below')problems.push('below published minimum');
  if(compareMin(84.5,null).status!=='unknown')problems.push('unknown minimum invented');
  return problems;
 }

 /* Export and import of the device-only notebook (so it survives the uninstall that a new-key APK needs).
    Import is all-or-nothing: one bad field refuses the whole file and nothing on the device changes. */
 const FILE_KIND='carpe-noctum-supply-pm-notebook';
 const MAX_FILE_BYTES=10*1024*1024;
 /* The screen has never capped spans per visit, so a saved notebook can hold any number. Import takes back anything the app could save; the file-size bound is what limits it. */
 const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 function optNum(value,label){
  if(value===''||value===undefined||value===null)return {ok:true,value:''};
  const n=number(value);
  if(n===null||n<0)return {ok:false,error:label+' is not a blank or a number of 0 or more.'};
  return {ok:true,value:n};
 }
 function cleanSpan(span,where){
  if(!isObj(span))return fail(where+': a span is not an object.');
  const keys=Object.keys(span);
  if(keys.length>24)return fail(where+': a span has too many fields.');
  const out={};
  for(const key of keys){
   const v=span[key];
   if(key.length>40||key==='__proto__'||key==='constructor'||key==='prototype')return fail(where+': a span field name is not allowed.');
   if(typeof v==='number'){if(!Number.isFinite(v))return fail(where+': a span number is not finite.');out[key]=v;}
   else if(typeof v==='string'){if(v.length>400)return fail(where+': a span text is too long.');out[key]=v;}
   else if(typeof v==='boolean'||v===null)out[key]=v;
   else return fail(where+': a span field holds something other than text, a number or yes/no.');
  }
  return {ok:true,value:out};
 }
 function cleanVisit(v,where,newId){
  if(!isObj(v))return fail(where+': a visit is not an object.');
  if(!validDate(v.date))return fail(where+': a visit date is not a real calendar date.');
  const chem=v.chemistry===undefined?'':v.chemistry,inv=v.inverter===undefined?'':v.inverter;
  if(typeof chem!=='string'||!Object.prototype.hasOwnProperty.call(CHEM,chem))return fail(where+': a chemistry value is not recognized.');
  if(typeof inv!=='string'||!Object.prototype.hasOwnProperty.call(INVERTER,inv))return fail(where+': an inverter value is not recognized.');
  const alarms=v.alarms===undefined?'':v.alarms;
  if(typeof alarms!=='string'||alarms.length>LIMITS.alarms)return fail(where+': the alarms text is missing or too long.');
  const out={id:newId('v'),date:v.date,chemistry:chem,inverter:inv,alarms};
  for(const [key,label] of [['inputVolts','Input volts'],['outputVolts','Output volts'],['loadAmps','Load amps']]){
   const r=optNum(v[key],where+': '+label);if(!r.ok)return fail(r.error);out[key]=r.value;
  }
  const batteries=v.batteries===undefined?[]:v.batteries;
  if(!Array.isArray(batteries)||batteries.length>LIMITS.batteries)return fail(where+': too many battery readings.');
  out.batteries=[];
  for(const b of batteries){
   if(!isObj(b)||typeof b.slot!=='string'||!b.slot.trim()||b.slot.length>LIMITS.slot)return fail(where+': a battery string name is missing or too long.');
   const volts=number(b.volts);
   if(volts===null||volts<0)return fail(where+': a battery volts value is not a number of 0 or more.');
   out.batteries.push({slot:b.slot,volts});
  }
  const spans=v.spans===undefined?[]:v.spans;
  if(!Array.isArray(spans))return fail(where+': spans must be a list.');
  out.spans=[];
  for(const span of spans){const r=cleanSpan(span,where);if(!r.ok)return r;out.spans.push(r.value);}
  return {ok:true,value:out};
 }
 /* Turns file text into clean supplies with fresh ids, or says why not. */
 function parseExport(text,newId){
  if(typeof text!=='string'||!text.trim())return fail('The file is empty.');
  if(text.length>MAX_FILE_BYTES)return fail('The file is larger than 10 MiB, so it is not a Supply PM notebook from this app.');
  let data;try{data=JSON.parse(text);}catch(_){return fail('The file is not readable as a Supply PM notebook.');}
  if(!isObj(data)||data.kind!==FILE_KIND)return fail('This file is not a Supply PM notebook exported from this app.');
  if(data.version!==1)return fail('This notebook file has a version this app does not know.');
  if(!Array.isArray(data.supplies))return fail('The notebook file has no list of supplies.');
  if(data.supplies.length>LIMITS.supplies)return fail('The notebook file holds more than '+LIMITS.supplies+' supplies.');
  const supplies=[];
  for(const [i,supply] of data.supplies.entries()){
   const where='Supply '+(i+1);
   if(!isObj(supply)||typeof supply.name!=='string'||!supply.name.trim()||supply.name.length>LIMITS.name)return fail(where+': the name is missing or too long.');
   if(!Array.isArray(supply.visits)||supply.visits.length>LIMITS.visits)return fail(where+': the visits are missing or there are too many.');
   const visits=[];
   for(const visit of supply.visits){const r=cleanVisit(visit,where,newId);if(!r.ok)return r;visits.push(r.value);}
   supplies.push({id:newId('pm'),name:supply.name,visits});
  }
  return {ok:true,error:'',supplies};
 }
 function exportText(supplies){
  return JSON.stringify({kind:FILE_KIND,version:1,note:'Personal Supply PM notebook from one device. It is not a company power record.',supplies:supplies.map(s=>({name:s.name,visits:s.visits}))},null,1);
 }
 /* Compare what was recorded, not how the object keys happen to be ordered. Visit order and reading order still matter. */
 const canon=v=>Array.isArray(v)?v.map(canon):(v!==null&&typeof v==='object')?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
 const stripIds=visits=>visits.map(({id,...rest})=>rest);
 const sameContent=(a,b)=>a.name===b.name&&JSON.stringify(canon(stripIds(a.visits)))===JSON.stringify(canon(stripIds(b.visits)));
 /* Adds imported supplies the device does not already have. A copy that matches by name and content is skipped. */
 function mergeImport(existing,incoming){
  const out=existing.slice();let added=0,skipped=0;
  for(const s of incoming){
   if(existing.some(e=>sameContent(e,s))){skipped+=1;continue;}
   out.push(s);added+=1;
  }
  if(out.length>LIMITS.supplies)return fail('Importing would put more than '+LIMITS.supplies+' supplies on this device. Delete one first. Nothing was imported.');
  return {ok:true,error:'',supplies:out,added,skipped};
 }
 return {KEY,SIDE,LIMITS,CHEM,INVERTER,FILE_KIND,MAX_FILE_BYTES,spanDrop,chain,compareMin,cableLoop,activeMin,validDate,parseExport,exportText,mergeImport,selfCheck};
})();

const PowerPMUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const fmt=n=>{if(!Number.isFinite(n))return '';const r=Math.round(n*1000)/1000;return String(r);};
 const tag=id=>typeof Thresholds!=='undefined'?Thresholds.tag(id,'Span voltage drop'):'';
 let initialized=false,seq=1,draft=blank(),statusText='';
 function blank(){return {supplyId:'',name:'',date:'',chemistry:'',inputVolts:'',outputVolts:'',loadAmps:'',inverter:'',alarms:'',batteries:[],spans:[],calc:{cableId:'',lengthFt:'',slackFt:'',currentA:'',supplyVolts:'',temperatureF:'',alphaPerC:'',equipmentId:''}};}
 function storage(){try{return window.localStorage;}catch(_){return null;}}
 function read(){
  const store=storage();if(!store)return {version:1,supplies:[],blocked:true};
  let raw;try{raw=store.getItem(PowerPM.KEY);}catch(_){return {version:1,supplies:[],blocked:true};}
  if(!raw)return {version:1,supplies:[]};
  try{
   const data=JSON.parse(raw);
   if(!data||data.version!==1||!Array.isArray(data.supplies))throw Error('shape');
   return data;
  }catch(_){
   try{store.setItem(PowerPM.SIDE,raw);}catch(__){}
   return {version:1,supplies:[],unreadable:true};
  }
 }
 function write(data){
  const store=storage();if(!store)return false;
  try{store.setItem(PowerPM.KEY,JSON.stringify({version:1,supplies:data.supplies}));return true;}catch(_){return false;}
 }
 /* Ids must not repeat between page loads or devices, or a new supply can collide with an older one. */
 function nid(prefix){seq+=1;return prefix+Date.now().toString(36)+seq.toString(36)+Math.floor(Math.random()*1679616).toString(36);}
 function cables(){return typeof catalog!=='undefined'&&Array.isArray(catalog.cables)?catalog.cables:[];}
 function actives(){return typeof catalog!=='undefined'&&Array.isArray(catalog.powerEquipment)?catalog.powerEquipment.filter(e=>!e.retired):[];}
 function currentCalc(){
  const c=draft.calc,loop=PowerPM.cableLoop(typeof catalog!=='undefined'?catalog:null,c.cableId);
  const step=PowerPM.spanDrop({lengthFt:c.lengthFt,slackFt:c.slackFt,loopOhmPer1000ft:loop.rate,temperatureF:c.temperatureF,alphaPerC:c.alphaPerC,currentA:c.currentA,supplyVolts:c.supplyVolts});
  const min=PowerPM.activeMin(typeof catalog!=='undefined'?catalog:null,c.equipmentId);
  return {loop,step,min};
 }
 function resultText(){
  const {loop,step,min}=currentCalc();
  if(!draft.calc.cableId)return 'Pick a cable from the catalog. The drop uses that cable’s published loop resistance and nothing else.';
  if(!step.ok)return step.error;
  const cmp=PowerPM.compareMin(step.atActive,min.min);
  const cable=loop.cable?loop.cable.label:draft.calc.cableId;
  const who=min.equipment?min.label:'No active picked';
  const minWords=cmp.status==='unknown'?cmp.text:(cmp.status==='below'
    ?`Calculated ${fmt(step.atActive)} V is below the published minimum input of ${fmt(min.min)} V (${fmt(-cmp.margin)} V under). ${cmp.text}`
    :`Calculated ${fmt(step.atActive)} V is at or above the published minimum input of ${fmt(min.min)} V (${fmt(cmp.margin)} V over). ${cmp.text}`);
  return `${cable}: published loop ${fmt(step.rate)} Ω per 1,000 ft. Temperature factor ${fmt(step.factor)} at ${fmt(step.temperatureF)} °F with coefficient ${fmt(step.alphaPerC)} per °C. Loop resistance ${fmt(step.resistance)} Ω over ${fmt(step.spanFt)} ft. Drop ${fmt(step.drop)} V at ${fmt(step.currentA)} A. Voltage at the end of this span ${fmt(step.atActive)} V, from ${fmt(step.supplyVolts)} V at the start. ${who}. ${minWords}${min.source?' Published source (not stored in this app): '+min.source+'.':''}`;
 }
 function trendRows(visits){
  const ordered=[...visits].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.id).localeCompare(String(b.id)));
  const prev=new Map();
  return ordered.map(v=>{
   const cells=(v.batteries||[]).map(b=>{
    const key=String(b.slot||'').trim();
    const n=typeof b.volts==='number'?b.volts:Number(b.volts);
    const finite=Number.isFinite(n);
    const before=prev.get(key);
    const change=finite&&before!==undefined?n-before:null;
    if(finite&&key)prev.set(key,n);
    return {slot:key||'String',volts:finite?n:null,change};
   });
   return {date:v.date,cells};
  });
 }
 function markup(){
  const cableOpts=['<option value="">Choose a cable</option>'].concat(cables().map(c=>`<option value="${escape(c.id)}">${escape(c.label)}${c.dc&&Number.isFinite(Number(c.dc.loop_ohm_per_1000ft))?'':' (no published loop resistance)'}</option>`)).join('');
  const activeOpts=['<option value="">No active picked</option>'].concat(actives().map(e=>`<option value="${escape(e.id)}">${escape(e.label)}</option>`)).join('');
  return `<div class="sectionhead"><div><h2>Supply PM</h2><p class="note tight">A personal notebook of what you saw at a standby supply, plus a span-by-span voltage drop. It is not the company power record. Battery volts, inverter and alarms are what you type; this screen does not decide pass or fail. The drop is span current times the cable catalog’s published loop resistance. The comparison uses that active’s published minimum input and no company minimum. Nothing here is saved in the job.</p></div></div>
<section class="calc-card" aria-labelledby="powerPmSpanTitle"><div class="calc-card-head"><h3 id="powerPmSpanTitle">Span voltage drop</h3>${tag('power.span.drop')}</div>
<div class="pm-fields"><label>Cable<select id="powerPmCable">${cableOpts}</select></label>
<label>Length (ft)<input id="powerPmLength" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Slack (ft)<input id="powerPmSlack" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Span current (A)<input id="powerPmCurrent" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Volts at the start of this span<input id="powerPmSupply" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Cable temperature (°F)<input id="powerPmTemp" type="number" min="-40" max="185" step="any" inputmode="decimal"></label>
<label>Resistance coefficient (per °C)<input id="powerPmAlpha" type="number" min="0" max="0.01" step="any" inputmode="decimal" placeholder="Type 0.004 only to use the approximation"></label>
<label>Active at the end of this span<select id="powerPmActive">${activeOpts}</select></label></div>
<p class="note" id="powerPmResult" aria-live="polite"></p>
<div class="toolbar"><button type="button" id="powerPmAddSpan">Add this span</button><button type="button" id="powerPmClearSpans">Clear spans</button></div>
<div class="table-scroll" tabindex="0" role="region" aria-label="Spans added for this visit"><table class="hs-table"><thead><tr><th scope="col">Span</th><th scope="col">Drop and voltage</th><th scope="col">Published minimum</th></tr></thead><tbody id="powerPmChain"></tbody></table></div>
</section>
<section class="calc-card" aria-labelledby="powerPmBookTitle"><div class="calc-card-head"><h3 id="powerPmBookTitle">Supply notebook</h3></div>
<div class="pm-fields"><label>Supply on this device<select id="powerPmSupplyPick"></select></label>
<label>Name<input id="powerPmName" type="text" maxlength="80" autocomplete="off"></label>
<label>Date<input id="powerPmDate" type="date"></label>
<label>Chemistry<select id="powerPmChemistry"><option value="">Not recorded</option><option value="vrla">VRLA</option><option value="lithium">Lithium</option><option value="other">Other</option></select></label>
<label>Input volts<input id="powerPmInput" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Output volts<input id="powerPmOutput" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Load (A)<input id="powerPmLoad" type="number" min="0" step="any" inputmode="decimal"></label>
<label>Inverter test<select id="powerPmInverter"><option value="">Not recorded</option><option value="ran">Ran</option><option value="did-not-run">Did not run</option><option value="not-tested">Not tested</option></select></label>
<label>Battery string name<input id="powerPmBatterySlot" type="text" maxlength="40" autocomplete="off"></label>
<label>Battery volts<input id="powerPmBatteryVolts" type="number" min="0" step="any" inputmode="decimal"></label></div>
<label>Alarms, as shown on the supply<textarea id="powerPmAlarms" maxlength="160" rows="2"></textarea></label>
<div class="toolbar"><button type="button" id="powerPmAddBattery">Add battery reading</button><button type="button" class="primary" id="powerPmSave">Save this visit</button><button type="button" id="powerPmDelete">Delete this supply</button></div>
<div class="toolbar"><button type="button" id="powerPmExport">Export notebook</button><button type="button" id="powerPmImport">Import notebook</button><input type="file" id="powerPmImportFile" accept=".json,application/json" hidden></div>
<p class="note tight">Export the whole notebook to a file before you uninstall the app or clear its data. The notebook lives only on this device, so an uninstall erases it. Import adds supplies from an exported file and skips copies you already have.</p>
<p class="note" id="powerPmBatteries"></p>
<p class="note" id="powerPmStatus" aria-live="polite"></p>
<div class="table-scroll" tabindex="0" role="region" aria-label="Saved visits and battery trend"><table class="hs-table"><thead><tr><th scope="col">Date</th><th scope="col">What was recorded</th><th scope="col">Battery change from the previous date</th></tr></thead><tbody id="powerPmVisits"></tbody></table></div>
<p class="note tight" id="powerPmChartNote"></p>
</section>`;
 }
 function paint(){
  const panel=document.getElementById('powerPmPanel');if(!panel)return;
  const set=(id,value)=>{const el=panel.querySelector('#'+id);if(el&&el.value!==value)el.value=value==null?'':String(value);};
  set('powerPmCable',draft.calc.cableId);set('powerPmLength',draft.calc.lengthFt);set('powerPmSlack',draft.calc.slackFt);set('powerPmCurrent',draft.calc.currentA);set('powerPmSupply',draft.calc.supplyVolts);set('powerPmTemp',draft.calc.temperatureF);set('powerPmAlpha',draft.calc.alphaPerC);set('powerPmActive',draft.calc.equipmentId);
  set('powerPmName',draft.name);set('powerPmDate',draft.date);set('powerPmChemistry',draft.chemistry);set('powerPmInput',draft.inputVolts);set('powerPmOutput',draft.outputVolts);set('powerPmLoad',draft.loadAmps);set('powerPmInverter',draft.inverter);set('powerPmAlarms',draft.alarms);
  const result=panel.querySelector('#powerPmResult');if(result)result.textContent=resultText();
  const chainBody=panel.querySelector('#powerPmChain');
  if(chainBody)chainBody.innerHTML=draft.spans.length?draft.spans.map((s,i)=>`<tr><th scope="row">${i+1}. ${escape(s.cableLabel)}</th><td>${escape(fmt(s.drop))} V drop, ${escape(fmt(s.atActive))} V at the end, from ${escape(fmt(s.supplyVolts))} V</td><td>${escape(s.minText)}</td></tr>`).join(''):'<tr><td colspan="3">No span added yet. The reading above is only the span in the boxes.</td></tr>';
  const data=read();
  const pick=panel.querySelector('#powerPmSupplyPick');
  if(pick){
   const opts=['<option value="">New supply</option>'].concat(data.supplies.map(s=>`<option value="${escape(s.id)}">${escape(s.name)}</option>`)).join('');
   if(pick.innerHTML!==opts)pick.innerHTML=opts;
   pick.value=draft.supplyId&&data.supplies.some(s=>s.id===draft.supplyId)?draft.supplyId:'';
  }
  const bat=panel.querySelector('#powerPmBatteries');
  if(bat)bat.textContent=draft.batteries.length?('Battery readings for this visit: '+draft.batteries.map(b=>b.slot+' '+fmt(b.volts)+' V').join('; ')+'.'):'No battery reading added for this visit yet.';
  const status=panel.querySelector('#powerPmStatus');
  if(status)status.textContent=(data.unreadable?'The saved notebook on this device could not be read. A copy was kept and this screen started empty. ':'')+(data.blocked?'This browser would not open its storage. Nothing can be saved. ':'')+statusText;
  const body=panel.querySelector('#powerPmVisits');
  const supply=data.supplies.find(s=>s.id===draft.supplyId);
  const visits=supply?supply.visits:[];
  const trend=trendRows(visits);
  if(body)body.innerHTML=trend.length?trend.map(row=>{
   const words=row.cells.map(c=>c.volts===null?c.slot+' not a number':c.slot+' '+fmt(c.volts)+' V').join('; ')||'No battery volts';
   const changes=row.cells.filter(c=>c.change!==null).map(c=>c.slot+' '+(c.change>=0?'+':'')+fmt(c.change)+' V');
   return `<tr><th scope="row">${escape(row.date)}</th><td>${escape(words)}</td><td>${escape(changes.length?changes.join('; '):'No earlier reading of the same string.')}</td></tr>`;
  }).join(''):'<tr><td colspan="3">No visit saved for this supply. A trend needs two dates.</td></tr>';
  const note=panel.querySelector('#powerPmChartNote');
  if(note){
   const series=trend.flatMap(row=>row.cells.filter(c=>c.volts!==null).map(c=>({date:row.date,slot:c.slot,volts:c.volts})));
   const slot=series.map(p=>p.slot).find(name=>series.filter(p=>p.slot===name).length>=2);
   if(!slot)note.textContent='Not enough dates to draw a trend. The table is the record.';
   else{
    const points=series.filter(p=>p.slot===slot);
    const min=Math.min(...points.map(p=>p.volts)),max=Math.max(...points.map(p=>p.volts)),span=max-min||1;
    const xy=points.map((p,i)=>{const x=points.length===1?140:10+i*(260/(points.length-1));const y=70-(p.volts-min)/span*60;return x.toFixed(1)+','+y.toFixed(1);});
    note.innerHTML=`Drawing of ${escape(slot)} volts by date, from ${escape(fmt(min))} V to ${escape(fmt(max))} V. Read the numbers in the table; the drawing adds no limit.<svg class="pm-chart" viewBox="0 0 280 80" role="img" aria-label="Drawing of battery volts by date"><polyline fill="none" stroke="currentColor" stroke-width="2" points="${xy.join(' ')}"/></svg>`;
   }
  }
 }
 function take(id){const el=document.getElementById(id);return el?el.value:'';}
 function syncFromDom(){
  draft.calc.cableId=take('powerPmCable');draft.calc.lengthFt=take('powerPmLength');draft.calc.slackFt=take('powerPmSlack');draft.calc.currentA=take('powerPmCurrent');draft.calc.supplyVolts=take('powerPmSupply');draft.calc.temperatureF=take('powerPmTemp');draft.calc.alphaPerC=take('powerPmAlpha');draft.calc.equipmentId=take('powerPmActive');
  draft.name=take('powerPmName');draft.date=take('powerPmDate');draft.chemistry=take('powerPmChemistry');draft.inputVolts=take('powerPmInput');draft.outputVolts=take('powerPmOutput');draft.loadAmps=take('powerPmLoad');draft.inverter=take('powerPmInverter');draft.alarms=take('powerPmAlarms');
 }
 function optionalNumber(value,label){
  if(String(value).trim()==='')return {ok:true,value:''};
  const n=number(value);
  if(n===null||n<0)return {ok:false,error:label+' must be a blank or a number of 0 or more. Nothing was saved.'};
  return {ok:true,value:n};
 }
 function addSpan(){
  syncFromDom();
  const {loop,step,min}=currentCalc();
  if(!step.ok){statusText=step.error;paint();return;}
  const cmp=PowerPM.compareMin(step.atActive,min.min);
  const minText=cmp.status==='unknown'?cmp.text:(cmp.status==='below'?fmt(step.atActive)+' V is below the published minimum '+fmt(min.min)+' V':fmt(step.atActive)+' V is at or above the published minimum '+fmt(min.min)+' V');
  draft.spans.push({cableId:draft.calc.cableId,cableLabel:loop.cable?loop.cable.label:draft.calc.cableId,lengthFt:step.spanFt,currentA:step.currentA,temperatureF:step.temperatureF,alphaPerC:step.alphaPerC,supplyVolts:step.supplyVolts,drop:step.drop,atActive:step.atActive,resistance:step.resistance,equipmentId:draft.calc.equipmentId,minVoltage:min.min,minText});
  draft.calc.supplyVolts=fmt(step.atActive);
  statusText='Span '+(draft.spans.length)+' added. The start voltage is now the end of that span, so the next span continues from it. Change it if the next span is fed somewhere else.';
  paint();
 }
 function addBattery(){
  syncFromDom();
  const slot=take('powerPmBatterySlot').trim(),volts=number(take('powerPmBatteryVolts'));
  if(!slot){statusText='Type a name for the battery string. Nothing was added.';paint();return;}
  if(slot.length>PowerPM.LIMITS.slot){statusText='A battery string name is limited to '+PowerPM.LIMITS.slot+' characters. Nothing was added.';paint();return;}
  if(volts===null||volts<0){statusText='Type the battery volts as a number of 0 or more. Nothing was added.';paint();return;}
  if(draft.batteries.length>=PowerPM.LIMITS.batteries){statusText='One visit keeps at most '+PowerPM.LIMITS.batteries+' battery readings. Nothing was added.';paint();return;}
  draft.batteries.push({slot,volts});
  const slotEl=document.getElementById('powerPmBatterySlot'),voltEl=document.getElementById('powerPmBatteryVolts');
  if(slotEl)slotEl.value='';if(voltEl)voltEl.value='';
  statusText='Battery reading added for this visit. It is not saved until you tap Save this visit.';
  paint();
 }
 function saveVisit(){
  syncFromDom();
  const name=draft.name.trim();
  if(!name){statusText='Type a name for the supply. Nothing was saved.';paint();return;}
  if(name.length>PowerPM.LIMITS.name){statusText='The name is limited to '+PowerPM.LIMITS.name+' characters. Nothing was saved.';paint();return;}
  if(!PowerPM.validDate(draft.date)){statusText='Enter the date as a real calendar date. Nothing was saved.';paint();return;}
  if(draft.alarms.length>PowerPM.LIMITS.alarms){statusText='Alarms are limited to '+PowerPM.LIMITS.alarms+' characters. Nothing was saved.';paint();return;}
  if(!Object.prototype.hasOwnProperty.call(PowerPM.CHEM,draft.chemistry)||!Object.prototype.hasOwnProperty.call(PowerPM.INVERTER,draft.inverter)){statusText='Chemistry or the inverter test is not one of the listed choices. Nothing was saved.';paint();return;}
  for(const [field,label] of [['inputVolts','Input volts'],['outputVolts','Output volts'],['loadAmps','Load']]){
   const parsed=optionalNumber(draft[field],label);
   if(!parsed.ok){statusText=parsed.error;paint();return;}
   draft[field]=parsed.value;
  }
  const data=read();
  if(data.blocked){statusText='This browser would not open its storage. Nothing was saved.';paint();return;}
  let supply=data.supplies.find(s=>s.id===draft.supplyId);
  if(!supply){
   if(data.supplies.length>=PowerPM.LIMITS.supplies){statusText='This device already has '+PowerPM.LIMITS.supplies+' supplies. Delete one before adding another. Nothing was saved.';paint();return;}
   supply={id:nid('pm'),name,visits:[]};data.supplies.push(supply);draft.supplyId=supply.id;
  }
  supply.name=name;
  if(supply.visits.length>=PowerPM.LIMITS.visits){statusText='This supply already has '+PowerPM.LIMITS.visits+' visits. Delete the supply’s notebook before adding another. Nothing new was saved.';paint();return;}
  supply.visits.push({id:nid('v'),date:draft.date,chemistry:draft.chemistry,inputVolts:draft.inputVolts,outputVolts:draft.outputVolts,loadAmps:draft.loadAmps,inverter:draft.inverter,alarms:draft.alarms,batteries:draft.batteries.map(b=>({slot:b.slot,volts:b.volts})),spans:draft.spans.map(s=>({...s}))});
  if(!write(data)){statusText='Not saved: this device could not store the supply notebook. The job was not changed.';paint();return;}
  draft.batteries=[];draft.spans=[];draft.alarms='';
  statusText='Saved on this device only. It is not in the job and not in a project backup. Use Export notebook before you uninstall.';
  paint();
 }
 function deleteSupply(){
  syncFromDom();
  const data=read();
  if(!draft.supplyId){statusText='This supply is not saved yet, so there is nothing to delete.';paint();return;}
  data.supplies=data.supplies.filter(s=>s.id!==draft.supplyId);
  if(!write(data)){statusText='Not deleted: this device could not change the supply notebook.';paint();return;}
  const keepName=draft.name;draft=blank();draft.name=keepName;
  statusText='Deleted the supply notebook on this device. The job was not changed.';
  paint();
 }
 async function exportNotebook(){
  const data=read();
  if(data.blocked){statusText='This browser would not open its storage. Nothing was exported.';paint();return;}
  if(!data.supplies.length){statusText='There is no saved supply on this device, so there is nothing to export.';paint();return;}
  const text=PowerPM.exportText(data.supplies),name='CarpeNoctum_Supply_PM_notebook.json',count=data.supplies.length;
  if(text.length>PowerPM.MAX_FILE_BYTES){statusText='This notebook is larger than the 10 MiB this app can restore, so it was not exported. Nothing was changed.';paint();return;}
  let result;
  try{
   if(typeof download==='function')result=await download(name,text,'application/json');
   else if(window.BrowserFiles)result=await window.BrowserFiles.prepare(name,text,'application/json');
   else{statusText='This browser cannot save a file here. Nothing was exported.';paint();return;}
  }catch(err){statusText='Could not export: '+(err&&err.message?err.message:'unknown error')+'. Nothing was changed.';paint();return;}
  const state=result&&typeof result==='object'?result.status:'';
  if(state==='error'||state==='busy'||state==='empty'||state==='aborted'||state==='cancelled'){statusText='The file was not saved ('+(result.error||state)+'). Nothing was exported. Your notebook on this device is unchanged.';paint();return;}
  statusText='A file with '+count+(count===1?' supply':' supplies')+' was handed to your browser or device. Open your downloads or Files and check that it is there before you uninstall. This is your own notebook, not a company record.';
  paint();
 }
 async function importNotebook(file){
  if(!file)return;
  if(file.size>PowerPM.MAX_FILE_BYTES){statusText='That file is larger than 10 MiB, so it is not a Supply PM notebook from this app. Nothing was imported.';paint();return;}
  let text;try{text=await file.text();}catch(_){statusText='That file could not be read. Nothing was imported.';paint();return;}
  const parsed=PowerPM.parseExport(text,nid);
  if(!parsed.ok){statusText=parsed.error+' Nothing was imported.';paint();return;}
  const data=read();
  if(data.blocked){statusText='This browser would not open its storage. Nothing was imported.';paint();return;}
  const merged=PowerPM.mergeImport(data.supplies,parsed.supplies);
  if(!merged.ok){statusText=merged.error;paint();return;}
  if(!merged.added){statusText='Nothing new to import: this device already has every supply in that file.';paint();return;}
  data.supplies=merged.supplies;
  if(!write(data)){statusText='Not imported: this device could not store the notebook. Nothing was changed.';paint();return;}
  statusText='Imported '+merged.added+(merged.added===1?' supply':' supplies')+(merged.skipped?' and skipped '+merged.skipped+' you already had':'')+'. Pick one from the list to see its visits.';
  paint();
 }
 function loadSupply(id){
  const data=read();const supply=data.supplies.find(s=>s.id===id);
  draft=blank();
  if(!supply){statusText='New supply. Nothing is saved until you tap Save this visit.';paint();return;}
  draft.supplyId=supply.id;draft.name=supply.name;
  statusText=supply.visits.length+' saved visit'+(supply.visits.length===1?'':'s')+' on this device.';
  paint();
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('powerPmPanel');if(!panel)return;
  panel.innerHTML=markup();
  panel.addEventListener('input',()=>{syncFromDom();const result=panel.querySelector('#powerPmResult');if(result)result.textContent=resultText();});
  panel.addEventListener('change',event=>{
   if(event.target.id==='powerPmImportFile'){const f=event.target.files&&event.target.files[0];event.target.value='';importNotebook(f);return;}
   if(event.target.id==='powerPmSupplyPick'){loadSupply(event.target.value);return;}
   syncFromDom();paint();
  });
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b||!panel.contains(b))return;
   if(b.id==='powerPmAddSpan')addSpan();
   else if(b.id==='powerPmClearSpans'){syncFromDom();draft.spans=[];statusText='Spans cleared. Saved visits were not changed.';paint();}
   else if(b.id==='powerPmAddBattery')addBattery();
   else if(b.id==='powerPmSave')saveVisit();
   else if(b.id==='powerPmDelete')deleteSupply();
   else if(b.id==='powerPmExport')exportNotebook();
   else if(b.id==='powerPmImport'){const input=panel.querySelector('#powerPmImportFile');if(input)input.click();}
  });
  paint();
 }
 return {init,paint,read,draft:()=>draft,resultText};
})();
