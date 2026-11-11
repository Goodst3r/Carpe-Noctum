/* Leakage tools (build list item 7, 2.0 Alpha build 3): the FCC leakage limits, a distance
   normalizer, a cumulative leakage index (CLI) estimator, a detector check and a personal leak
   log. Offline and deterministic. This is a personal notebook and calculator, not the company's
   official leak record and not a filing: nothing here is sent anywhere, and the log is kept on
   this device only, outside jobs and their backups.

   FCC rules (47 CFR 76.605(c), 76.611, 76.1706) are cited by section; the one-line paraphrases
   are our own. Missing or invalid input gives no result and a reason; it is never shown as zero. */
const Leakage=(()=>{
 const STORAGE_KEY='nightsweep-leakage-v1';
 const FT_PER_M=1/0.3048;                // exact: 1 ft = 0.3048 m
 const CLI_LIMIT=64;                      // 10·log10(I∞) must be equal to or less than 64
 const CLI_MIN_LEAK=50;                   // µV/m at 3 m; only leaks at or above this are counted
 const CLI_SAMPLING=0.75;                 // share of the strand the rule asks to be examined
 const REFERENCE_M=3;
 const MAX_LEAKS=2000,MAX_LOG=500,MAX_CHECKS=200;
 /* 47 CFR 76.605(c), Table 1. */
 const LIMITS=Object.freeze({
  'analog-near':Object.freeze({id:'leak.fcc.analog.near',limit:20,distance:3,kind:'analog',band:'over 54 MHz up to and including 216 MHz'}),
  'digital-near':Object.freeze({id:'leak.fcc.digital.near',limit:17.4,distance:3,kind:'digital',band:'over 54 MHz up to and including 216 MHz'}),
  'analog-far':Object.freeze({id:'leak.fcc.analog.far',limit:15,distance:30,kind:'analog',band:'54 MHz and below, and over 216 MHz'}),
  'digital-far':Object.freeze({id:'leak.fcc.digital.far',limit:13.1,distance:30,kind:'digital',band:'54 MHz and below, and over 216 MHz'})
 });
 const DECIMAL=/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
 const has=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
 const fail=error=>({ok:false,error});
 const num=x=>{
  if(typeof x==='number')return Number.isFinite(x)?x:null;
  if(typeof x!=='string'||!DECIMAL.test(x.trim()))return null;
  const n=Number(x.trim());return Number.isFinite(n)?n:null;
 };
 const log10=Math.log10;
 /* Field strength in µV/m, above 0. */
 function field(value,label){
  const v=num(value);
  if(v===null)return fail('Enter '+label+' in µV/m as a number.');
  if(!(v>0))return fail('Enter '+label+' above 0 µV/m.');
  if(v>1e6)return fail('Enter '+label+' of 1,000,000 µV/m or less.');
  return {ok:true,value:v};
 }
 /* Distance in metres, from metres or feet. */
 function distance(value,unit){
  if(unit!=='m'&&unit!=='ft')return fail('Choose metres or feet for the distance.');
  const v=num(value);
  if(v===null)return fail('Enter the distance from the leak as a number.');
  if(!(v>0))return fail('Enter a distance above 0.');
  const m=unit==='ft'?v*0.3048:v;
  if(m>1000)return fail('Enter a distance of 1,000 m (about 3,281 ft) or less.');
  return {ok:true,metres:m};
 }
 /* Inverse-distance restatement: far from the source the field strength falls in proportion to distance. */
 function restate(eMicrovoltsPerMetre,fromM,toM){return eMicrovoltsPerMetre*fromM/toM;}
 /* Which row of Table 1 applies: signal kind and frequency. */
 function rule(frequency,kind){
  const f=num(frequency);
  if(f===null||!(f>0)||f>3000)return fail('Enter the test frequency in MHz, above 0 and up to 3,000.');
  if(kind!=='analog'&&kind!=='digital')return fail('Choose whether the leaking signal is analog or digital.');
  const near=f>54&&f<=216;
  return {ok:true,key:kind+(near?'-near':'-far'),...LIMITS[kind+(near?'-near':'-far')],frequency:f};
 }
 /* Check one reading against the FCC limit for its frequency band. A reading taken at another
    distance is restated to the rule's distance by the inverse-distance relation, which is
    approximate (Expert), and the result says so. */
 function checkLimit(input){
  const r=rule(input?.frequency,input?.kind);if(!r.ok)return r;
  const e=field(input?.field,'the field strength');if(!e.ok)return e;
  const d=distance(input?.distance,input?.unit);if(!d.ok)return d;
  const atRule=restate(e.value,d.metres,r.distance);
  const converted=Math.abs(d.metres-r.distance)>1e-9;
  const ratioDb=20*log10(atRule/r.limit);
  return {ok:true,rule:r,measured:e.value,metres:d.metres,atRule,converted,closer:d.metres<REFERENCE_M,limit:r.limit,ruleDistance:r.distance,
   status:atRule<=r.limit*(1+1e-12)?'within':'over',ratioDb,margin:Math.abs(atRule-r.limit),countsForCli:restate(e.value,d.metres,REFERENCE_M)>=CLI_MIN_LEAK};
 }
 /* Restate a reading at the 3 m reference (and at 30 m). */
 function normalize(input){
  const e=field(input?.field,'the field strength');if(!e.ok)return e;
  const d=distance(input?.distance,input?.unit);if(!d.ok)return d;
  return {ok:true,measured:e.value,metres:d.metres,feet:d.metres*FT_PER_M,at3:restate(e.value,d.metres,3),at30:restate(e.value,d.metres,30),closer:d.metres<REFERENCE_M,factor:d.metres/3};
 }
 /* Cumulative leakage index, 47 CFR 76.611(a)(1): 10·log10((1/θ)·ΣEi²) over leaks of 50 µV/m
    or more, Ei in µV/m at 3 m, θ the fraction of the plant examined. */
 function parseLeaks(text){
  if(Array.isArray(text))text=text.join(' ');
  const raw=String(text??'').split(/[\s,;]+/).filter(Boolean);
  if(!raw.length)return fail('Enter the field strength of each leak, in µV/m at 3 m, separated by commas or spaces.');
  if(raw.length>MAX_LEAKS)return fail('Enter '+MAX_LEAKS+' leaks or fewer.');
  const values=[];
  for(const token of raw){
   const v=num(token);
   if(v===null||!(v>0)||v>1e6)return fail('“'+token.slice(0,20)+'” is not a field strength. Use numbers above 0 µV/m, separated by commas or spaces.');
   values.push(v);
  }
  return {ok:true,values};
 }
 function fraction(input){
  const theta=String(input?.theta??'').trim();
  const tested=String(input?.tested??'').trim(),total=String(input?.total??'').trim();
  if(theta!==''){
   const t=num(theta);
   if(t===null||!(t>0)||t>1)return fail('Enter the fraction of the plant examined from above 0 up to 1, for example 0.8.');
   return {ok:true,theta:t};
  }
  if(tested===''&&total==='')return fail('Enter the fraction of the plant examined, or the strand miles tested and the total strand miles.');
  const a=num(tested),b=num(total);
  if(a===null||b===null||!(a>0)||!(b>0))return fail('Enter the strand miles tested and the total strand miles as numbers above 0.');
  if(a>b)return fail('The strand miles tested cannot be more than the total strand miles.');
  return {ok:true,theta:a/b};
 }
 function cli(input){
  const leaks=parseLeaks(input?.leaks);if(!leaks.ok)return leaks;
  const t=fraction(input);if(!t.ok)return t;
  const counted=leaks.values.filter(v=>v>=CLI_MIN_LEAK);
  const sumSquares=counted.reduce((s,v)=>s+v*v,0);
  const index=sumSquares/t.theta;
  const out={ok:true,theta:t.theta,entered:leaks.values.length,counted:counted.length,ignored:leaks.values.length-counted.length,sumSquares,index,samplingOk:t.theta>=CLI_SAMPLING-1e-12,limit:CLI_LIMIT};
  if(!counted.length)return {...out,cli:null,status:'none-counted',margin:null,strongest:null};
  const cliDb=10*log10(index);
  return {...out,cli:cliDb,status:cliDb<=CLI_LIMIT+1e-12?'at-or-below':'above',margin:Math.abs(CLI_LIMIT-cliDb),strongest:10*log10(Math.max(...counted)**2/t.theta)};
 }
 /* Detector check: what the detector read against what the calibrated source should give. */
 function detector(input){
  const method=String(input?.method??'');
  if(method!=='direct'&&method!=='dipole')return fail('Choose the check method: a directly connected source or a calibrated leak with a half-wave dipole.');
  const expected=field(input?.expected,'the expected reading');if(!expected.ok)return expected;
  const read=field(input?.read,'the reading');if(!read.ok)return read;
  const diffDb=20*log10(read.value/expected.value);
  return {ok:true,method,expected:expected.value,read:read.value,diffDb,percent:(read.value-expected.value)/expected.value*100};
 }
 function toleranceCheck(diffDb,tolerance){
  if(tolerance===null||tolerance===undefined||String(tolerance).trim()==='')return {status:'unknown'};
  const t=num(tolerance);
  if(t===null||!(t>=0)||t>40)return {status:'invalid',error:'Enter the tolerance in dB from 0 to 40, or leave it blank.'};
  const a=Math.abs(diffDb);
  return a<=t+1e-12?{status:'within',margin:t-a}:{status:'outside',margin:a-t};
 }

 /* ---- Personal notebook: device-local storage, one versioned key. ---- */
 const emptyStore=()=>({version:1,leaks:[],checks:[],company:{repair:null,tolerance:null}});
 function validDate(s){
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const [y,m,d]=s.split('-').map(Number);
  const t=new Date(Date.UTC(y,m-1,d));
  return t.getUTCFullYear()===y&&t.getUTCMonth()===m-1&&t.getUTCDate()===d&&y>=2000&&y<=2100;
 }
 const clean=(s,max)=>String(s??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
 const optionalNumber=(x,label,lo,hi)=>{
  if(x===null||x===undefined||String(x).trim()==='')return {ok:true,value:null};
  const v=num(x);
  if(v===null||v<lo||v>hi)return fail('Enter '+label+' as a number from '+lo+' to '+hi+', or leave it blank.');
  return {ok:true,value:v};
 };
 function validateLeak(input){
  const found=String(input?.found??'').trim();
  if(!validDate(found))return fail('Enter the date the leak was found.');
  const location=clean(input?.location,120);
  if(!location)return fail('Enter where the leak is: a pole, tap or cross street. Do not enter customer names or account numbers.');
  const repaired=String(input?.repaired??'').trim();
  if(repaired!==''&&!validDate(repaired))return fail('Enter the repair date, or leave it blank while the leak is open.');
  if(repaired!==''&&repaired<found)return fail('The repair date is before the date found.');
  const cause=clean(input?.cause,120);
  const strength=optionalNumber(input?.field,'the field strength',0.001,1e6);if(!strength.ok)return strength;
  const dist=optionalNumber(input?.distance,'the distance in metres',0.1,1000);if(!dist.ok)return dist;
  const freq=optionalNumber(input?.frequency,'the test frequency in MHz',0.1,3000);if(!freq.ok)return freq;
  const notes=clean(input?.notes,300);
  return {ok:true,record:{found,location,cause,repaired,field:strength.value,distance:dist.value,frequency:freq.value,notes}};
 }
 function sanitizeStore(saved){
  const out=emptyStore();
  if(!saved||typeof saved!=='object'||saved.version!==1)return out;
  const seen=new Set();
  for(const item of Array.isArray(saved.leaks)?saved.leaks.slice(0,MAX_LOG):[]){
   const v=validateLeak(item);
   const id=typeof item?.id==='string'&&/^[a-z0-9][a-z0-9_-]{0,39}$/i.test(item.id)&&!seen.has(item.id)?item.id:null;
   if(v.ok&&id){seen.add(id);out.leaks.push({id,...v.record});}
  }
  for(const item of Array.isArray(saved.checks)?saved.checks.slice(0,MAX_CHECKS):[]){
   const id=typeof item?.id==='string'&&/^[a-z0-9][a-z0-9_-]{0,39}$/i.test(item.id)&&!seen.has(item.id)?item.id:null;
   const r=detector({method:item?.method,expected:item?.expected,read:item?.read});
   if(id&&r.ok&&validDate(String(item?.date??''))){seen.add(id);out.checks.push({id,date:item.date,method:r.method,expected:r.expected,read:r.read});}
  }
  const rep=num(saved.company?.repair),tol=num(saved.company?.tolerance);
  out.company.repair=rep!==null&&rep>0&&rep<=1e6?rep:null;
  out.company.tolerance=tol!==null&&tol>=0&&tol<=40?tol:null;
  return out;
 }
 function readStore(storage){
  try{const raw=storage?.getItem(STORAGE_KEY);return raw?sanitizeStore(JSON.parse(raw)):emptyStore();}catch(_){return emptyStore();}
 }
 let store=emptyStore(),loaded=false;
 function ensureLoaded(){if(loaded)return;loaded=true;try{store=typeof localStorage!=='undefined'?readStore(localStorage):emptyStore();}catch(_){store=emptyStore();}}
 function load(storage){loaded=true;store=readStore(storage);return store;}
 function snapshot(){ensureLoaded();return JSON.parse(JSON.stringify(store));}
 let counter=0;
 const newId=prefix=>prefix+Date.now().toString(36)+(counter++).toString(36)+Math.floor(Math.random()*1e6).toString(36);
 /* Apply one change to what is stored now, then write it, so a second tab's entries are not erased.
    Returns {ok,saved}: saved false means this browser would not store it. */
 function mutate(storage,change){
  ensureLoaded();
  let base=store;
  try{if(storage&&storage.getItem(STORAGE_KEY)!==null)base=readStore(storage);}catch(_){}
  const next=JSON.parse(JSON.stringify(base));
  const outcome=change(next);
  if(outcome&&outcome.ok===false)return outcome;
  store=next;
  let saved=true;
  try{if(!storage)throw new Error('no storage');storage.setItem(STORAGE_KEY,JSON.stringify(store));}catch(_){saved=false;}
  return {ok:true,saved,...(outcome||{})};
 }
 function addLeak(input,storage){
  const v=validateLeak(input);if(!v.ok)return v;
  return mutate(storage,s=>{
   if(s.leaks.length>=MAX_LOG)return fail('The log holds '+MAX_LOG+' leaks. Export it, then delete the oldest repaired ones.');
   const id=newId('lk');s.leaks.push({id,...v.record});return {id};
  });
 }
 function markRepaired(id,date,storage){
  if(!validDate(String(date??'')))return fail('Enter the repair date.');
  return mutate(storage,s=>{
   const item=s.leaks.find(l=>l.id===id);if(!item)return fail('That leak is no longer in the log.');
   if(date<item.found)return fail('The repair date is before the date found.');
   item.repaired=date;
  });
 }
 function removeLeak(id,storage){
  return mutate(storage,s=>{const i=s.leaks.findIndex(l=>l.id===id);if(i<0)return fail('That leak is no longer in the log.');s.leaks.splice(i,1);});
 }
 function addCheck(input,storage){
  if(!validDate(String(input?.date??'')))return fail('Enter the date of the detector check.');
  const r=detector(input);if(!r.ok)return r;
  return mutate(storage,s=>{
   if(s.checks.length>=MAX_CHECKS)return fail('The check list holds '+MAX_CHECKS+' entries. Export or delete older ones.');
   s.checks.push({id:newId('dc'),date:input.date,method:r.method,expected:r.expected,read:r.read});
  });
 }
 function removeCheck(id,storage){
  return mutate(storage,s=>{const i=s.checks.findIndex(c=>c.id===id);if(i<0)return fail('That check is no longer listed.');s.checks.splice(i,1);});
 }
 /* Company settings: the repair threshold (µV/m at 3 m) and the detector tolerance (dB). Blank is unknown. */
 function setCompany(repair,tolerance,storage){
  const r=String(repair??'').trim()===''?null:num(repair),t=String(tolerance??'').trim()===''?null:num(tolerance);
  if(String(repair??'').trim()!==''&&(r===null||!(r>0)||r>1e6))return fail('Enter the repair threshold in µV/m above 0, or leave it blank.');
  if(String(tolerance??'').trim()!==''&&(t===null||!(t>=0)||t>40))return fail('Enter the detector tolerance in dB from 0 to 40, or leave it blank.');
  return mutate(storage,s=>{s.company={repair:r,tolerance:t};});
 }
 function clearAll(storage){
  loaded=true;store=emptyStore();
  try{storage?.removeItem(STORAGE_KEY);}catch(_){return false;}
  return true;
 }
 function registryValue(field){
  ensureLoaded();
  const v=store.company[field];
  if(v===null||v===undefined)return {value:null,text:'Unknown — not entered',where:'Saved on this device only'};
  return {value:v,text:String(Number(v.toFixed(3)))+(field==='tolerance'?' dB':' µV/m at 3 m'),where:'Saved on this device only'};
 }
 /* CSV for the leak log: the fields 47 CFR 76.1706 asks for, plus what was measured. Cells that a
    spreadsheet would read as a formula are prefixed with an apostrophe. */
 function csvCell(value){
  let s=value===null||value===undefined?'':String(value);
  if(/^[=+\-@\t\r]/.test(s))s="'"+s;
  return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
 }
 function leaksCsv(list){
  const rows=[['Date found','Location','Probable cause','Date repaired','Field strength (uV/m)','Distance (m)','Frequency (MHz)','At 3 m (uV/m)','Notes']];
  for(const l of list){
   const at3=l.field!==null&&l.distance!==null?restate(l.field,l.distance,3):null;
   rows.push([l.found,l.location,l.cause,l.repaired,l.field,l.distance,l.frequency,at3===null?'':Number(at3.toPrecision(5)),l.notes]);
  }
  return rows.map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';
 }
 return {STORAGE_KEY,LIMITS,CLI_LIMIT,CLI_MIN_LEAK,CLI_SAMPLING,MAX_LOG,MAX_CHECKS,FT_PER_M,rule,checkLimit,normalize,restate,parseLeaks,cli,detector,toleranceCheck,
  validateLeak,validDate,load,snapshot,addLeak,markRepaired,removeLeak,addCheck,removeCheck,setCompany,clearAll,registryValue,leaksCsv,csvCell,sanitizeStore};
})();

const LeakageUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const trim=(v,d=2)=>{const s=Number(v.toFixed(d)).toString();return s==='-0'?'0':s;};
 const grouped=v=>Number.isFinite(v)?Number(v.toPrecision(4)).toLocaleString('en-US',{maximumSignificantDigits:4}):'—';
 const dB=v=>{const m=Math.abs(v);if(m>0&&m<0.005)return 'less than 0.01 dB';return (m<0.1?m.toFixed(2):m.toFixed(1))+' dB';};
 const field=(card,name,label,hint,extra='')=>`<label>${label}<input type="number" step="any" data-leak="${card}" data-field="${name}" placeholder="${hint}"${extra}></label>`;
 const unitSelect=card=>`<label>Unit<select data-leak="${card}" data-field="unit"><option value="">Choose</option><option value="m">metres</option><option value="ft">feet</option></select></label>`;
 function limitsTable(){
  const L=Leakage.LIMITS;
  const row=key=>`<tr><th scope="row">${L[key].kind==='analog'?'Analog':'Digital'}</th><td>${L[key].band}</td><td>${L[key].limit} µV/m</td><td>${L[key].distance} m</td><td>${tag(L[key].id,(L[key].kind==='analog'?'Analog':'Digital')+' leakage limit')}</td></tr>`;
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="FCC leakage limits"><table class="leak-table"><thead><tr><th scope="col">Signals</th><th scope="col">Frequencies</th><th scope="col">Limit</th><th scope="col">At</th><th scope="col">Source</th></tr></thead><tbody>${['analog-far','digital-far','analog-near','digital-near'].map(row).join('')}</tbody></table></div>`;
 }
 const CARDS=Object.freeze({
  limit:{title:'FCC leakage limit check',ref:'leak.fcc.analog.near',context:'FCC leakage limits',
   lead:'Check one leak reading against the limit for its frequency band. The table lists the limits as the rule prints them.',
   fields:()=>field('limit','frequency','Test frequency (MHz)','e.g. 121.2625')+`<label>Leaking signal<select data-leak="limit" data-field="kind"><option value="">Choose</option><option value="analog">Analog</option><option value="digital">Digital</option></select></label>`+field('limit','field','Field strength (µV/m)','e.g. 25')+field('limit','distance','Distance from the leak','e.g. 3')+unitSelect('limit'),
   conditions:'A reading at another distance is restated to the rule distance by the inverse-distance relation, which is approximate and labeled Expert. The rule measures with the procedure in 47 CFR 76.609(h). This is your own check, not a compliance finding.'},
  normalize:{title:'Distance to 3 m',ref:'leak.normalize.distance',context:'distance normalizer',
   lead:'Restate a reading taken at another distance as if it were taken 3 m from the leak.',
   fields:()=>field('normalize','field','Field strength (µV/m)','e.g. 40')+field('normalize','distance','Distance from the leak','e.g. 10')+unitSelect('normalize'),
   conditions:'Field strength falls in proportion to distance in the far field, so E at 3 m ≈ E measured × distance ÷ 3 m. Close to the leak the relation does not hold; measure at 3 m when you can.'},
  cli:{title:'Cumulative leakage index (CLI)',ref:'leak.cli.formula',context:'cumulative leakage index',
   lead:'Your own estimate of the index from the leaks you found. It is not a filing.',
   fields:()=>`<label class="calc-wide">Leak field strengths at 3 m (µV/m), separated by commas or spaces<textarea data-leak="cli" data-field="leaks" rows="3" placeholder="e.g. 120, 85, 60, 250, 50"></textarea></label>`+field('cli','theta','Fraction of the plant examined','e.g. 0.8')+field('cli','tested','Or strand miles tested','e.g. 160')+field('cli','total','Total strand miles','e.g. 200'),
   conditions:'10·log10 of (1 ÷ fraction examined) × the sum of each leak’s field strength squared, counting only leaks of 50 µV/m or more at 3 m. The rule asks for at least 75% of the strand and a test every calendar year. Strengths must already be on the 108–137 MHz basis: this card does not do the FCC’s frequency correlation.'},
  detector:{title:'Detector check',ref:'leak.detector.methods',context:'detector check methods',
   lead:'Record what your leakage detector read against what a calibrated source should give.',
   fields:()=>`<label>Check method<select data-leak="detector" data-field="method"><option value="">Choose</option><option value="direct">Directly connected RF source</option><option value="dipole">Calibrated leak with a half-wave dipole</option></select></label>`+field('detector','expected','Expected reading (µV/m)','e.g. 20')+field('detector','read','Detector read (µV/m)','e.g. 22')+`<label>Date of the check<input type="date" data-leak="detector" data-field="date"></label>`,
   conditions:'The two methods are the ones SCTE 289 describes: a directly connected source sets general accuracy, and a calibrated leak shows the detector measuring a known field outdoors. Your company’s tolerance starts unknown. Detector checks are kept on this device only.'}
 });
 function companyBox(){
  return `<details class="health-window" id="leakCompany"><summary>Company settings (your targets)</summary><p class="note tight">Leave a box blank if your company has not set one: blank is unknown, not zero. Kept on this device for every job, not in job backups. ${tag('company.leak.repair','repair threshold')} ${tag('company.leak.tolerance','detector tolerance')}</p><div class="calc-fields"><label>Repair when at or above (µV/m at 3 m)<input type="number" step="any" data-leak-company="repair"></label><label>Detector tolerance (± dB)<input type="number" step="any" min="0" data-leak-company="tolerance"></label></div><p class="note" id="leak-company-note" role="status" aria-live="polite"></p></details>`;
 }
 function card(id){
  const c=CARDS[id];
  const extra=id==='limit'?limitsTable():'';
  const button=id==='detector'?`<div class="toolbar"><button type="button" id="leakCheckSave">Save this check</button></div>`:'';
  return `<section class="calc-card leak-card" data-leak-card="${id}" aria-labelledby="leak-${id}-title"><div class="calc-card-head"><h3 id="leak-${id}-title">${c.title}</h3>${tag(c.ref,c.context)}</div><p class="note tight">${c.lead}</p>${extra}<div class="calc-fields">${c.fields()}</div><div class="calc-result" id="leak-${id}-result" role="status" aria-live="polite"></div>${button}${id==='detector'?'<div id="leakChecks"></div>':''}<p class="note calc-conditions">${c.conditions}</p></section>`;
 }
 function logCard(){
  return `<section class="calc-card leak-card leak-log" data-leak-card="log" aria-labelledby="leak-log-title"><div class="calc-card-head"><h3 id="leak-log-title">Leak log</h3>${tag('leak.log.fields','leak log fields')}</div><p class="note tight">Your own notebook of leaks: where, when found, probable cause and when repaired, the fields 47 CFR 76.1706 asks an operator to keep. It is not the company’s official record. Describe the place by pole, tap or cross street; do not enter customer names, addresses or account numbers.</p><div class="calc-fields"><label>Date found<input type="date" data-leak="log" data-field="found"></label><label>Where (pole, tap or cross street)<input type="text" maxlength="120" data-leak="log" data-field="location"></label><label>Probable cause<input type="text" maxlength="120" data-leak="log" data-field="cause" placeholder="e.g. loose drop connector"></label><label>Date repaired (blank while open)<input type="date" data-leak="log" data-field="repaired"></label>${field('log','field','Field strength (µV/m)','optional')}${field('log','distance','Distance (m)','optional')}${field('log','frequency','Test frequency (MHz)','optional')}<label class="calc-wide">Notes<input type="text" maxlength="300" data-leak="log" data-field="notes"></label></div><div class="toolbar"><button type="button" id="leakAdd" class="primary">Add to log</button><button type="button" id="leakExport">Export log (CSV)</button><button type="button" id="leakClear">Clear log and checks</button></div><p class="note" id="leak-log-note" role="status" aria-live="polite"></p><div id="leakList"></div><p class="note calc-conditions">Kept in this browser on this device only, not in a job or its backups. Export a copy to keep one; the rule asks operators to keep their log for two years, and clearing browser data erases this one.</p></section>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Leakage</h2><p class="note tight">FCC limits, distance and CLI math, a detector check and a personal leak log. Offline; nothing is sent anywhere. This is your notebook and calculator, not the company’s official leak record, and results are not filings.</p></div></div><div class="calc-grid">${['limit','normalize','cli','detector'].map(card).join('')}${logCard()}</div>${companyBox()}`;
 }
 function read(id){const v={};document.querySelectorAll(`[data-leak="${id}"]`).forEach(el=>{v[el.dataset.field]=el.value;});return v;}
 const blank=(v,keys)=>keys.every(k=>String(v[k]??'').trim()==='');
 function out(id,r,html){
  const el=document.getElementById('leak-'+id+'-result');if(!el)return;
  el.classList.toggle('error',!!r&&!r.ok&&r.error!==null);
  el.innerHTML=r?.ok?html:`<p class="note">${escape(r?.error??'Enter values to compare.')}</p>`;
 }
 const row=(label,value)=>`<div class="health-row"><span>${label}</span><strong>${value}</strong></div>`;
 function updateLimit(){
  const v=read('limit');
  if(blank(v,['frequency','field','distance']))return out('limit',{ok:false,error:null});
  const r=Leakage.checkLimit({...v});
  if(!r.ok)return out('limit',r);
  out('limit',r,`${row('Limit that applies '+tag(r.rule.id,r.rule.kind+' leakage limit'),r.limit+' <small>µV/m at '+r.ruleDistance+' m</small>')}${row('Your reading at '+r.ruleDistance+' m'+(r.converted?' '+tag('leak.normalize.distance','distance restatement'):''),grouped(r.atRule)+' <small>µV/m</small>')}`+
   (r.status==='within'?`<p class="health-status ok">✓ At or below the limit (${dB(20*Math.log10(r.limit/r.atRule))} under).</p>`:`<p class="health-status warn">⚠ Over the limit by ${grouped(r.atRule-r.limit)} µV/m (${dB(r.ratioDb)} above).</p>`)+
   (r.converted?`<p class="note tight">Restated from ${trim(r.metres,2)} m by distance: approximate.${r.closer?' Closer than 3 m, where the relation may not hold: measure at 3 m if you can.':''}</p>`:'')+
   (r.countsForCli?`<p class="note tight">At 3 m this is ${CLI_NOTE}.</p>`:''));
 }
 const CLI_NOTE='50 µV/m or more, so it counts in the CLI';
 function updateNormalize(){
  const v=read('normalize');
  if(blank(v,['field','distance']))return out('normalize',{ok:false,error:null});
  const r=Leakage.normalize({...v});
  if(!r.ok)return out('normalize',r);
  out('normalize',r,`${row('At 3 m',grouped(r.at3)+' <small>µV/m</small>')}${row('At 30 m',grouped(r.at30)+' <small>µV/m</small>')}${row('Distance used',trim(r.metres,2)+' <small>m ('+trim(r.feet,1)+' ft)</small>')}`+(r.closer?'<p class="note tight">Closer than 3 m: the inverse-distance relation may not hold this near the leak. Measure at 3 m if you can.</p>':'')+(r.at3>=Leakage.CLI_MIN_LEAK?`<p class="note tight">At 3 m this is ${CLI_NOTE}.</p>`:''));
 }
 function updateCli(){
  const v=read('cli');
  if(blank(v,['leaks','theta','tested','total']))return out('cli',{ok:false,error:null});
  const r=Leakage.cli({...v});
  if(!r.ok)return out('cli',r);
  const rows=row('Leaks counted (50 µV/m or more)',r.counted+' <small>of '+r.entered+' entered</small>')+row('Sum of squares',grouped(r.sumSquares)+' <small>µV²/m²</small>')+row('Fraction examined '+tag('leak.cli.formula','CLI formula'),trim(r.theta,4));
  if(r.status==='none-counted')return out('cli',r,`${rows}<p class="health-status neutral">• No leak is at 50 µV/m or more, so nothing is counted and there is no index to compute.</p>${r.ignored?`<p class="note tight">${r.ignored} below 50 µV/m ${r.ignored===1?'was':'were'} not counted.</p>`:''}`);
  out('cli',r,`${rows}${row('Index, 10·log10(I) '+tag('leak.cli.limit','CLI limit'),trim(r.cli,2)+' <small>dB</small>')}`+
   (r.status==='at-or-below'?`<p class="health-status ok">✓ ${dB(r.margin)} at or below the printed value of ${r.limit}.</p>`:`<p class="health-status warn">⚠ ${dB(r.margin)} above the printed value of ${r.limit}.</p>`)+
   (r.ignored?`<p class="note tight">${r.ignored} below 50 µV/m ${r.ignored===1?'was':'were'} not counted.</p>`:'')+
   (r.samplingOk?'':'<p class="health-status warn">⚠ Less than 75% of the plant examined. The rule asks for at least 75% of the strand, so this is only an estimate.</p>'));
 }
 function currentCompany(){return Leakage.snapshot().company;}
 function updateDetector(){
  const v=read('detector');
  const r=Leakage.detector({method:v.method,expected:v.expected,read:v.read});
  if(blank(v,['method','expected','read']))return out('detector',{ok:false,error:null});
  if(!r.ok)return out('detector',r);
  const tol=Leakage.toleranceCheck(r.diffDb,currentCompany().tolerance);
  const comp=tol.status==='unknown'?`${row('Company tolerance '+tag('company.leak.tolerance','detector tolerance'),'Unknown — not entered')}`:`${row('Company tolerance '+tag('company.leak.tolerance','detector tolerance'),'± '+trim(currentCompany().tolerance,2)+' <small>dB</small>')}<p class="health-status ${tol.status==='within'?'ok':'warn'}">${tol.status==='within'?'✓':'⚠'} ${tol.status==='within'?'Within':dB(tol.margin)+' outside'} your tolerance.</p>`;
  out('detector',r,`${row('Difference',(r.diffDb>0?'+':r.diffDb<0?'−':'')+trim(Math.abs(r.diffDb),2)+' <small>dB ('+(r.percent>0?'+':r.percent<0?'−':'')+trim(Math.abs(r.percent),1)+'%)</small>')}${comp}`);
 }
 function dateText(s){return s?escape(s):'—';}
 function renderLists(){
  const snap=Leakage.snapshot(),rep=snap.company.repair;
  const list=document.getElementById('leakList');
  if(list){
   const rows=[...snap.leaks].sort((a,b)=>b.found.localeCompare(a.found)).map(l=>{
    const at3=l.field!==null&&l.distance!==null?Leakage.restate(l.field,l.distance,3):null;
    const open=l.repaired==='';
    const high=open&&rep!==null&&at3!==null&&at3>=rep;
    return `<li class="leak-item${open?' open':''}"><div><strong>${escape(l.location)}</strong><span class="note">Found ${dateText(l.found)} · ${open?'<b>Open</b>':'Repaired '+dateText(l.repaired)}${l.cause?' · '+escape(l.cause):''}</span>${l.field!==null?`<span class="note">${grouped(l.field)} µV/m${l.distance!==null?' at '+trim(l.distance,2)+' m → '+grouped(at3)+' µV/m at 3 m':''}${l.frequency!==null?' · '+trim(l.frequency,4)+' MHz':''}${at3!==null&&at3>=Leakage.CLI_MIN_LEAK?' · counts in the CLI':''}</span>`:''}${high?'<span class="health-status warn">⚠ At or above your repair threshold and still open.</span>':''}${l.notes?`<span class="note">${escape(l.notes)}</span>`:''}</div><div class="toolbar">${open?`<label class="leak-repair">Repaired on<input type="date" data-leak-repair="${escape(l.id)}"></label><button type="button" data-leak-mark="${escape(l.id)}">Mark repaired</button>`:''}<button type="button" class="danger" data-leak-delete="${escape(l.id)}">Delete</button></div></li>`;
   });
   list.innerHTML=snap.leaks.length?`<h4>${snap.leaks.length} in the log · ${snap.leaks.filter(l=>l.repaired==='').length} open</h4><ul class="limits-list leak-list">${rows.join('')}</ul>`:'<p class="note">No leaks logged on this device yet.</p>';
  }
  const checks=document.getElementById('leakChecks');
  if(checks){
   const tol=snap.company.tolerance;
   const items=[...snap.checks].sort((a,b)=>b.date.localeCompare(a.date)).map(c=>{
    const d=20*Math.log10(c.read/c.expected),t=Leakage.toleranceCheck(d,tol);
    return `<li class="leak-item"><div><strong>${escape(c.date)} · ${c.method==='direct'?'Directly connected source':'Calibrated leak, half-wave dipole'}</strong><span class="note">Expected ${grouped(c.expected)}, read ${grouped(c.read)} µV/m: ${d>0?'+':d<0?'−':''}${trim(Math.abs(d),2)} dB${t.status==='unknown'?' · tolerance unknown':t.status==='within'?' · within your tolerance':' · outside your tolerance'}</span></div><div class="toolbar"><button type="button" class="danger" data-leak-delete-check="${escape(c.id)}">Delete</button></div></li>`;
   });
   checks.innerHTML=snap.checks.length?`<h4>Saved checks</h4><ul class="limits-list leak-list">${items.join('')}</ul>`:'';
  }
 }
 function syncCompanyFields(){
  const c=currentCompany();
  document.querySelectorAll('[data-leak-company]').forEach(el=>{const v=c[el.dataset.leakCompany];el.value=v===null||v===undefined?'':String(v);});
 }
 function note(id,text,error){const el=document.getElementById(id);if(el){el.textContent=text;el.classList.toggle('error',!!error);}}
 function storage(){try{return window.localStorage;}catch(_){return null;}}
 const savedText=res=>res.saved?'Saved on this device. It is not part of a job backup.':'This browser would not save it, so it lasts until you close the page.';
 function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function refreshAll(){updateLimit();updateNormalize();updateCli();updateDetector();renderLists();}
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('leakagePanel');if(!panel)return;
  Leakage.load(storage());
  panel.innerHTML=markup();syncCompanyFields();
  const foundField=panel.querySelector('[data-leak="log"][data-field="found"]');if(foundField)foundField.value=today();
  const upd={limit:updateLimit,normalize:updateNormalize,cli:updateCli,detector:updateDetector};
  const onEdit=event=>{
   const t=event.target;if(!panel.contains(t))return;
   if(t.dataset.leak&&upd[t.dataset.leak])upd[t.dataset.leak]();
   else if(t.dataset.leakCompany&&event.type==='change'){
    const r=Leakage.setCompany(panel.querySelector('[data-leak-company="repair"]').value,panel.querySelector('[data-leak-company="tolerance"]').value,storage());
    if(!r.ok){const c=currentCompany();note('leak-company-note','Not saved. '+r.error+' Still using repair threshold '+(c.repair===null?'unknown':c.repair+' µV/m')+' and tolerance '+(c.tolerance===null?'unknown':c.tolerance+' dB')+'.',true);return;}
    note('leak-company-note',savedText(r),!r.saved);updateDetector();renderLists();
   }
  };
  panel.addEventListener('input',onEdit);panel.addEventListener('change',onEdit);
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b||!panel.contains(b))return;
   if(b.id==='leakAdd'){
    const v=read('log');
    const r=Leakage.addLeak({found:v.found,location:v.location,cause:v.cause,repaired:v.repaired,field:v.field,distance:v.distance,frequency:v.frequency,notes:v.notes},storage());
    if(!r.ok){note('leak-log-note',r.error,true);return;}
    note('leak-log-note','Added. '+savedText(r),!r.saved);
    panel.querySelectorAll('[data-leak="log"]').forEach(el=>{if(el.dataset.field!=='found')el.value='';});renderLists();
  }else if(b.id==='leakExport'){
    const snap=Leakage.snapshot();
    if(!snap.leaks.length){note('leak-log-note','The log is empty, so there is nothing to export.',true);return;}
    const csv=Leakage.leaksCsv([...snap.leaks].sort((a,b)=>a.found.localeCompare(b.found)));
    if(typeof download==='function')download('CarpeNoctum_2.0_Alpha_build_3_Leak_Log.csv',csv,'text/csv');
    note('leak-log-note','Leak log CSV prepared. Finish the save or share step on your device.',false);
   }else if(b.id==='leakClear'){
    if(typeof confirm==='function'&&!confirm('Clear the whole leak log, the saved detector checks and the company settings on this device? Export a copy first if you need one.'))return;
    const ok=Leakage.clearAll(storage());syncCompanyFields();renderLists();refreshAll();
    note('leak-log-note',ok?'Cleared on this device.':'This browser would not remove the saved data, so it may return when the page reloads.',!ok);
   }else if(b.id==='leakCheckSave'){
    const v=read('detector');
    const r=Leakage.addCheck({date:v.date||today(),method:v.method,expected:v.expected,read:v.read},storage());
    if(!r.ok){out('detector',r);return;}
    renderLists();updateDetector();
   }else if(b.dataset.leakMark){
    const input=[...panel.querySelectorAll('[data-leak-repair]')].find(el=>el.dataset.leakRepair===b.dataset.leakMark);
    const r=Leakage.markRepaired(b.dataset.leakMark,input?.value||today(),storage());
    if(!r.ok){note('leak-log-note',r.error,true);return;}
    note('leak-log-note','Marked repaired. '+savedText(r),!r.saved);renderLists();
   }else if(b.dataset.leakDelete){
    if(typeof confirm==='function'&&!confirm('Delete this leak from the log?'))return;
    const r=Leakage.removeLeak(b.dataset.leakDelete,storage());
    note('leak-log-note',r.ok?'Deleted. '+savedText(r):r.error,!r.ok||!r.saved);renderLists();
   }else if(b.dataset.leakDeleteCheck){
    const r=Leakage.removeCheck(b.dataset.leakDeleteCheck,storage());
    if(!r.ok)out('detector',r);renderLists();
   }
  });
  refreshAll();
 }
 return {init,markup,refreshAll,renderLists,CARDS};
})();
