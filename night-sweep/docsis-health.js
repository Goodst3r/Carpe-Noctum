/* DOCSIS health card (build list item 5, 2.0 Alpha build 3). Compares a reading you already
   have, from a meter or a modem's status page, with the cable modem input and output
   requirements in the CableLabs DOCSIS physical-layer specifications. Offline and
   deterministic: nothing is read from a modem, CMTS or meter. Missing or invalid input gives
   no result and a reason; it is never shown as zero.

   Spec ranges are what a modem must be able to accept or transmit. They are capability
   limits, not operating targets, and say nothing about error rate. Company windows are your
   own targets; they start unknown and are saved on this device only. Wording is our own;
   the specification is cited by document number, issue, table and section. */
const DocsisHealth=(()=>{
 const EPS=1e-9;   // floating-point guard only: far below any meter's 0.1 dB, so a typed edge value such as 15 never lands outside by rounding noise
 const STORAGE_KEY='nightsweep-docsis-windows-v1';
 /* Requirements, all in dBmV. See the registry rows named in `rows` for sources. */
 const SCQAM_RANGE=Object.freeze({low:-15,high:15});     // one 6 MHz SC-QAM channel
 const OFDM_PER6=Object.freeze({low:-15,high:15});       // equivalent PSD per 6 MHz, stated in the OFDM row
 const OFDM_PER24=Object.freeze({low:-9,high:21});       // 24 MHz minimum occupied bandwidth
 const TOTAL_LIMIT=Object.freeze({'3.1':40,'3.0':33});   // total input power, strictly below
 const PMAX_MIN=65;                                       // lowest allowed maximum total transmit power
 const READING_BOUNDS=Object.freeze({min:-100,max:150});
 const MEASUREMENTS=Object.freeze(['scqam','ofdm','total','upstream']);
 /* Company windows are kept apart for the two plants: a window entered for the 42/54 MHz plant is
    never applied to the 204/258 MHz plant, and an untouched plant stays unknown. */
 const PLANTS=Object.freeze(['42','204']);
 const PLANT_NAMES=Object.freeze({'42':'42/54 MHz','204':'204/258 MHz'});
 const fail=error=>({ok:false,error});
 const DECIMAL=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
 const num=x=>{
  if(typeof x==='number')return Number.isFinite(x)?x:null;
  if(typeof x!=='string'||x.length>50||!DECIMAL.test(x.trim()))return null;
  const n=Number(x.trim());return Number.isFinite(n)?n:null;
 };
 const has=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
 function level(value,label){
  const v=num(value);
  if(v===null)return fail('Enter '+label+' in dBmV as a number.');
  if(v<READING_BOUNDS.min||v>READING_BOUNDS.max)return fail('Enter '+label+' between '+READING_BOUNDS.min+' and +'+READING_BOUNDS.max+' dBmV. If it is in dBµV, subtract 60.');
  return {ok:true,value:v};
 }
 /* Inclusive range check. margin is the distance to the nearest edge when inside and the
    distance outside the range otherwise; it is never negative. */
 function inRange(reading,low,high){
  if(reading<low-EPS)return {status:'below',margin:low-reading,edge:'low'};
  if(reading>high+EPS)return {status:'above',margin:reading-high,edge:'high'};
  const toLow=Math.max(0,reading-low),toHigh=Math.max(0,high-reading);
  return {status:'inside',margin:Math.min(toLow,toHigh),edge:toLow<=toHigh?'low':'high'};
 }
 /* Downstream SC-QAM: one 6 MHz channel at the modem input, -15 to +15 dBmV. */
 function scqam(input){
  const r=level(input?.level,'the channel level');if(!r.ok)return r;
  return {ok:true,id:'scqam',reading:r.value,low:SCQAM_RANGE.low,high:SCQAM_RANGE.high,units:'dBmV per 6 MHz channel',...inRange(r.value,SCQAM_RANGE.low,SCQAM_RANGE.high),compare:r.value};
 }
 /* Downstream OFDM. The stated range is -15 to +15 dBmV per 6 MHz and -9 to +21 dBmV per
    24 MHz. For another whole number of 6 MHz channels the 24 MHz row is moved by
    10·log10(occupied ÷ 24), the same flat-power relation the OFDM calculator uses. */
 function ofdmRange(basis,occupied){
  if(basis==='6')return {low:OFDM_PER6.low,high:OFDM_PER6.high,width:6,derived:false};
  if(basis==='24')return {low:OFDM_PER24.low,high:OFDM_PER24.high,width:24,derived:false};
  if(basis!=='other')return null;
  const b=num(occupied);
  if(b===null||!Number.isInteger(b)||b<24||b>192||b%6!==0)return fail('Enter the occupied bandwidth in MHz: a whole number of 6 MHz channels from 24 to 192.');
  if(b===24)return {low:OFDM_PER24.low,high:OFDM_PER24.high,width:24,derived:false};
  /* A derived figure is shown to 0.01 dB and rounded inward, so the range on screen is the range used. */
  const shift=10*Math.log10(b/24);
  const inward=(v,up)=>{const scaled=v*100,r=up?Math.ceil(scaled-1e-9):Math.floor(scaled+1e-9);return r/100;};
  return {low:inward(OFDM_PER24.low+shift,true),high:inward(OFDM_PER24.high+shift,false),width:b,derived:true};
 }
 function ofdm(input){
  const basis=String(input?.basis??'');
  const range=ofdmRange(basis,input?.occupied);
  if(range===null)return fail('Choose how the OFDM power was measured: per 6 MHz, per 24 MHz or over another occupied bandwidth.');
  if(range.ok===false)return range;
  const r=level(input?.power,'the OFDM power');if(!r.ok)return r;
  const per6=r.value-10*Math.log10(range.width/6);
  return {ok:true,id:'ofdm',reading:r.value,low:range.low,high:range.high,width:range.width,derived:range.derived,per6,units:'dBmV over '+range.width+' MHz',...inRange(r.value,range.low,range.high),compare:per6};
 }
 /* Total downstream input power: strictly below 40 dBmV for a DOCSIS 3.1 modem, 33 dBmV for a 3.0-only modem. */
 function total(input){
  const modem=String(input?.modem??'');
  if(!has(TOTAL_LIMIT,modem))return fail('Choose the modem generation first: DOCSIS 3.1 or 3.0 only. They have different limits.');
  const r=level(input?.total,'the total input power');if(!r.ok)return r;
  const limit=TOTAL_LIMIT[modem];
  const below=r.value<limit;
  return {ok:true,id:'total',reading:r.value,limit,modem,status:below?'below-limit':'at-or-over',margin:Math.abs(limit-r.value),units:'dBmV total',compare:r.value};
 }
 /* Upstream: headroom between the total transmit power and Pmax, the most total power the
    modem can transmit. For a DOCSIS 3.1 modem working with a 3.1 CMTS, 65 dBmV is the default
    and the lowest allowed Pmax. A DOCSIS 3.0 modem, or a 3.1 modem on a 3.0 CMTS, follows the
    3.0 per-channel limits instead; this card has no figure for those, so the modem's own
    maximum must be typed in. */
 function upstream(input){
  const mode=String(input?.mode??'');
  if(mode!=='3.1'&&mode!=='other')return fail('Choose how the modem is working first: a DOCSIS 3.1 modem on a 3.1 CMTS, or anything else. The 65 dBmV minimum applies only to the first.');
  const r=level(input?.total,'the total transmit power');if(!r.ok)return r;
  const blank=String(input?.pmax??'').trim()==='';
  let pmax=PMAX_MIN;
  if(!blank){
   const p=num(input.pmax);
   if(p===null)return fail('Enter the modem’s maximum total power in dBmV as a number'+(mode==='3.1'?', or leave it blank for the 65 dBmV minimum.':'.'));
   if(mode==='3.1'&&p<PMAX_MIN)return fail('For a DOCSIS 3.1 modem on a 3.1 CMTS, Pmax cannot be below 65 dBmV, the lowest value the specification allows.');
   if(p<=0||p>READING_BOUNDS.max)return fail('Enter a maximum total power from above 0 to '+READING_BOUNDS.max+' dBmV.');
   pmax=p;
  }else if(mode==='other'){
   return fail('Enter the modem’s maximum total transmit power from its documentation. This card has no figure for a DOCSIS 3.0 modem or a 3.1 modem on a 3.0 CMTS.');
  }
  const headroom=pmax-r.value;
  return {ok:true,id:'upstream',mode,specBasis:mode==='3.1',reading:r.value,pmax,defaultPmax:mode==='3.1'&&blank,headroom,status:headroom>=-EPS?'headroom':'over-pmax',margin:Math.abs(headroom),units:'dBmV total',compare:r.value};
 }
 const evaluators=Object.freeze({scqam,ofdm,total,upstream});
 function evaluate(id,input){return typeof id==='string'&&has(evaluators,id)?evaluators[id](input):fail('Unknown measurement.');}
 /* Company window: a minimum, a maximum or both, in the same units as `compare`. Blank is
    unknown, never zero. */
 function parseWindow(min,max){
  const parse=(value,label)=>{
   if(value===null||value===undefined||String(value).trim()==='')return {ok:true,value:null};
   const v=num(value);
   if(v===null)return fail('Enter the '+label+' as a number or leave it blank.');
   if(v<READING_BOUNDS.min||v>READING_BOUNDS.max)return fail('Enter the '+label+' between '+READING_BOUNDS.min+' and +'+READING_BOUNDS.max+' dBmV.');
   return {ok:true,value:v};
  };
  const lo=parse(min,'lowest allowed level');if(!lo.ok)return lo;
  const hi=parse(max,'highest allowed level');if(!hi.ok)return hi;
  if(lo.value!==null&&hi.value!==null&&lo.value>hi.value)return fail('The lowest level is above the highest. Swap them.');
  return {ok:true,min:lo.value,max:hi.value};
 }
 function againstWindow(reading,window){
  if(!window||(window.min===null&&window.max===null))return {status:'unknown'};
  const lo=window.min,hi=window.max;
  if(lo!==null&&reading<lo-EPS)return {status:'below',margin:lo-reading,min:lo,max:hi};
  if(hi!==null&&reading>hi+EPS)return {status:'above',margin:reading-hi,min:lo,max:hi};
  const toLo=lo===null?Infinity:Math.max(0,reading-lo),toHi=hi===null?Infinity:Math.max(0,hi-reading);
  return {status:'inside',margin:Math.min(toLo,toHi),min:lo,max:hi};
 }
 /* Windows are kept on this device only, in one versioned key, and never in a job or backup.
    Shape: {version:1,plants:{'42':{scqam:{min,max},…},'204':{…}}}. (Only development builds ever stored
    a single set for both plants; that shape is not read.) */
 const emptyPlant=()=>Object.fromEntries(MEASUREMENTS.map(id=>[id,{min:null,max:null}]));
 const emptyWindows=()=>Object.fromEntries(PLANTS.map(plant=>[plant,emptyPlant()]));
 let windows=emptyWindows(),loaded=false;
 /* Windows load from this device the first time they are needed. */
 function ensureLoaded(){
  if(loaded)return;loaded=true;
  try{windows=typeof localStorage!=='undefined'?readStored(localStorage):emptyWindows();}catch(_){windows=emptyWindows();}
 }
 function readStored(storage){
  const fresh=emptyWindows();
  try{
   const raw=storage?.getItem(STORAGE_KEY);if(!raw)return fresh;
   const saved=JSON.parse(raw);
   if(!saved||saved.version!==1||typeof saved.plants!=='object'||saved.plants===null)return fresh;
   for(const plant of PLANTS){
    const set=has(saved.plants,plant)?saved.plants[plant]:null;if(!set||typeof set!=='object')continue;
    for(const id of MEASUREMENTS){
     const w=has(set,id)?set[id]:null;if(!w||typeof w!=='object')continue;
     const parsed=parseWindow(w.min,w.max);
     if(parsed.ok)fresh[plant][id]={min:parsed.min,max:parsed.max};
    }
   }
  }catch(_){return emptyWindows();}
  return fresh;
 }
 function loadWindows(storage){loaded=true;windows=readStored(storage);return windows;}
 /* The plant is the job's plant: '42' (42/54 MHz) or '204' (204/258 MHz). Anything else, or no plant,
    has no window (unknown). */
 function getWindow(id,plant){ensureLoaded();return PLANTS.includes(plant)&&MEASUREMENTS.includes(id)?windows[plant][id]:{min:null,max:null};}
 /* Returns {ok,saved}: ok false means the entry was rejected; saved false means this
    browser would not store it, so it lasts until the page closes. */
 function setWindow(id,min,max,storage,plant){
  if(!MEASUREMENTS.includes(id))return fail('Unknown measurement.');
  if(!PLANTS.includes(plant))return fail('Choose the plant (42/54 MHz or 204/258 MHz) in Field → Meter setup first. Company windows are kept separately for each plant.');
  const parsed=parseWindow(min,max);if(!parsed.ok)return parsed;
  ensureLoaded();
  let base=windows;
  try{if(storage&&storage.getItem(STORAGE_KEY)!==null)base=readStored(storage);}catch(_){}
  windows={...base,[plant]:{...base[plant],[id]:{min:parsed.min,max:parsed.max}}};
  let saved=true;
  try{
   if(!storage)throw new Error('no storage');
   storage.setItem(STORAGE_KEY,JSON.stringify({version:1,plants:windows}));
  }catch(_){saved=false;}
  return {ok:true,saved,window:windows[plant][id]};
 }
 function clearWindows(storage){
  loaded=true;windows=emptyWindows();
  try{storage?.removeItem(STORAGE_KEY);}catch(_){return false;}
  return true;
 }
 /* Value text for the registry's company rows. */
 function windowText(id,plant){
  const w=getWindow(id,plant);
  if(w.min===null&&w.max===null)return 'Unknown — not entered';
  const bit=v=>{const n=Number(Math.abs(v).toFixed(2));return (v>0?'+':v<0&&n!==0?'−':'')+n;};
  const unit=id==='ofdm'?' dBmV per 6 MHz':' dBmV';
  return w.min!==null&&w.max!==null?bit(w.min)+' to '+bit(w.max)+unit:w.min!==null?'at least '+bit(w.min)+unit:'at most '+bit(w.max)+unit;
 }
 /* One entry for each plant, so the two are never shown as one value. */
 function registryValue(id){
  return {value:null,text:PLANTS.map(plant=>PLANT_NAMES[plant]+' plant: '+windowText(id,plant)).join(' · '),where:'Saved on this device only, separately for each plant'};
 }
 return {STORAGE_KEY,MEASUREMENTS,PLANTS,PLANT_NAMES,windowText,SCQAM_RANGE,OFDM_PER6,OFDM_PER24,TOTAL_LIMIT,PMAX_MIN,evaluate,scqam,ofdm,total,upstream,parseWindow,againstWindow,loadWindows,getWindow,setWindow,clearWindows,registryValue};
})();

const DocsisHealthUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const trim2=v=>{const s=Number(v.toFixed(2)).toString();return s==='-0'?'0':s;};
 const level=v=>(v>0?'+':v<0?'−':'')+trim2(Math.abs(v));
 const dB=v=>{const m=Math.abs(v);if(m>0&&m<0.005)return 'less than 0.01 dB';const one=m.toFixed(1);return (one==='0.0'&&m>0?m.toFixed(2):one)+' dB';};
 const CARDS=Object.freeze({
  scqam:{title:'Downstream SC-QAM channel',spec:'docsis.ds.scqam.range',company:'company.docsis.scqam',
   lead:'Level of one 6 MHz digital channel at the modem input, from your meter or the modem’s status page.',
   fields:()=>field('scqam','level','Channel level (dBmV)','e.g. 3.2'),
   conditions:'North American 6 MHz channels, 64-QAM and 256-QAM. A DOCSIS 3.1 modem takes its SC-QAM range from the 3.0 specification. Check each channel; one reading does not cover the others.'},
  ofdm:{title:'Downstream OFDM channel',spec:'docsis.ds.ofdm.range',company:'company.docsis.ofdm',
   lead:'Level of a DOCSIS 3.1 OFDM channel at the modem input. Choose what your meter or modem page says the power was measured over before you type it.',
   fields:()=>`<label>Measured over<select data-health="ofdm" data-field="basis"><option value="">Choose what it was measured over</option><option value="6">Each 6 MHz</option><option value="24">24 MHz</option><option value="other">Another occupied bandwidth</option></select></label><label data-health-other hidden>Occupied bandwidth (MHz)<input type="number" min="24" max="192" step="6" data-health="ofdm" data-field="occupied" placeholder="e.g. 96"></label>`+field('ofdm','power','OFDM power (dBmV)','e.g. -2.5'),
   conditions:'The stated range is for equal power across the band. The other-bandwidth range moves the 24 MHz row by 10·log10(occupied ÷ 24) and is derived, not printed in the specification. Occupied bandwidth is a whole number of 6 MHz channels, 24 to 192 MHz, edge taper included.'},
  total:{title:'Total downstream input power',spec:'docsis.ds.total31.limit',company:'company.docsis.total',
   lead:'Power of every downstream signal added together at the modem input, in dBmV.',
   fields:()=>field('total','total','Total input power (dBmV)','e.g. 28')+`<label>Modem<select data-health="total" data-field="modem"><option value="">Choose the modem</option><option value="3.1">DOCSIS 3.1 (limit 40)</option><option value="3.0">DOCSIS 3.0 only (limit 33)</option></select></label>`,
   conditions:'Use your meter’s total-power reading across the full downstream band. The 3.1 limit covers 54 to 1794 MHz; the 3.0-only limit covers 40 MHz and above. Do not apply 40 dBmV to a 3.0-only modem. On a 3.1 modem that receives only SC-QAM channels, the 3.1 specification also points to the 3.0 table, whose total is 33 dBmV, and does not say which governs: confirm a total between 33 and 40 dBmV.'},
  upstream:{title:'Upstream transmit headroom',spec:'docsis.us.pmax.capability',company:'company.docsis.upstream',
   lead:'How far the modem’s total transmit power sits below the most it can transmit (Pmax).',
   fields:()=>`<label class="calc-wide">How the modem is working<select data-health="upstream" data-field="mode"><option value="">Choose first</option><option value="3.1">DOCSIS 3.1 modem on a 3.1 CMTS</option><option value="other">DOCSIS 3.0 modem, or 3.1 modem on a 3.0 CMTS</option></select></label>`+field('upstream','total','Total transmit power (dBmV)','e.g. 48')+field('upstream','pmax','Modem maximum, Pmax (dBmV)','65 if blank (3.1 only)'),
   conditions:'Enter the total across all upstream channels, not one channel. In DOCSIS 3.1 operation the specification reports per-channel power normalized to 1.6 MHz, so a 6.4 MHz channel’s actual power is about 6 dB above the number reported; check which convention your tool uses. The 65 dBmV minimum applies to a 3.1 modem working with a 3.1 CMTS. A 3.0 modem has per-channel limits that depend on channel type and count, so type in its maximum from its documentation. Headroom is a margin, not a pass or fail.'}
 });
 function field(card,name,label,hint){return `<label>${label}<input type="number" step="any" data-health="${card}" data-field="${name}" placeholder="${hint}"></label>`;}
 function windowBox(id){
  const c=CARDS[id];
  const unit=id==='ofdm'?'dBmV per 6 MHz':'dBmV';
  return `<details class="health-window" data-health-window-box="${id}"><summary>Company window (your target) <span class="health-plant" data-health-plant></span></summary><p class="note tight">Your own limits for this reading, in ${unit}. Leave a box blank if you have no limit on that side; blank is unknown, not zero. Kept on this device for the plant shown above (each plant has its own), and not in job backups. ${tag(c.company,c.title+' company window')}</p><div class="calc-fields"><label>Lowest (${unit})<input type="number" step="any" data-health-window="${id}" data-field="min"></label><label>Highest (${unit})<input type="number" step="any" data-health-window="${id}" data-field="max"></label></div><p class="note" id="health-${id}-window-note" role="status" aria-live="polite"></p></details>`;
 }
 function card(id){
  const c=CARDS[id];
  return `<section class="calc-card health-card" data-health-card="${id}" aria-labelledby="health-${id}-title"><div class="calc-card-head"><h3 id="health-${id}-title">${c.title}</h3>${tag(c.spec,c.title+' spec')}</div><p class="note tight">${c.lead}</p><div class="calc-fields">${c.fields()}</div><div class="calc-result" id="health-${id}-result" role="status" aria-live="polite"></div>${windowBox(id)}<p class="note calc-conditions">${c.conditions}</p></section>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>DOCSIS health</h2><p class="note tight">Check a reading you already have against the DOCSIS modem requirements and your own window. Nothing is read from a modem or meter. The spec range is what a modem must accept, not a target: inside it does not mean the link is healthy, because error rate and MER are separate.</p></div><button type="button" id="healthClear">Clear company windows</button></div><p class="note" id="healthNote" role="status" aria-live="polite"></p><div class="calc-grid">${MEASUREMENTS_ORDER.map(card).join('')}</div>`;
 }
 const MEASUREMENTS_ORDER=['scqam','ofdm','total','upstream'];
 /* A number box whose text is not a number (a lone "-", "1e", "5.5.5") reports an empty value but
    is marked badInput. It must not read as a blank: a blank can mean "use the default" or "clear
    the setting". Such a box is passed on as text that is not a number, so the entry is refused with
    its reason and nothing saved is touched. */
 const NOT_A_NUMBER='not a number';
 const typed=el=>el.validity&&el.validity.badInput?NOT_A_NUMBER:el.value;
 function read(id){const v={};document.querySelectorAll(`[data-health="${id}"]`).forEach(el=>{v[el.dataset.field]=typed(el);});return v;}
 /* The plant comes from the job: Field → Meter setup keeps one choice, 42/54 or 204/258 MHz. */
 function plantNow(){
  try{const p=typeof SweepSetup!=='undefined'?SweepSetup.draft().selected:null;return DocsisHealth.PLANTS.includes(p)?p:null;}catch(_){return null;}
 }
 let shownPlant=null;
 function specRows(id,r){
  const c=CARDS[id];
  if(id==='scqam')return `<div class="health-row"><span>Spec range ${tag(c.spec,'SC-QAM spec range')}</span><strong>${level(r.low)} to ${level(r.high)} <small>dBmV per 6 MHz</small></strong></div>`;
  if(id==='ofdm'){
   if(r.derived)return `<div class="health-row"><span>Derived range, over ${r.width} MHz ${tag('docsis.ds.ofdm.scaling','OFDM derived range')}</span><strong>${level(r.low)} to ${level(r.high)} <small>dBmV</small></strong></div><p class="note tight">Not printed in the specification: the 24 MHz row moved for this width and rounded inward to 0.01 dB.</p>`;
   return `<div class="health-row"><span>Spec range, over ${r.width} MHz ${tag(c.spec,'OFDM spec range')}</span><strong>${level(r.low)} to ${level(r.high)} <small>dBmV</small></strong></div>`;
  }
  if(id==='total'){
   const specId=r.modem==='3.0'?'docsis.ds.total30.limit':'docsis.ds.total31.limit';
   return `<div class="health-row"><span>Spec limit, DOCSIS ${r.modem}${r.modem==='3.0'?' only':''} ${tag(specId,'total input power limit')}</span><strong>below ${r.limit} <small>dBmV</small></strong></div>`;
  }
  if(!r.specBasis)return `<div class="health-row"><span>Modem maximum (your entry; not from this specification)</span><strong>${trim2(r.pmax)} <small>dBmV</small></strong></div>`;
  return `<div class="health-row"><span>Maximum total power (Pmax), DOCSIS 3.1 on a 3.1 CMTS ${tag(c.spec,'Pmax')}</span><strong>${trim2(r.pmax)} <small>dBmV${r.defaultPmax?', the minimum':''}</small></strong></div>`;
 }
 function statusLine(id,r){
  const where=r.edge==='low'?'lower':'upper';
  if(id==='total'){
   return r.status==='below-limit'?`<p class="health-status ok">✓ ${dB(r.margin)} below the ${r.limit} dBmV limit.</p>`:`<p class="health-status warn">⚠ At or above the ${r.limit} dBmV limit${r.margin>0?` (${dB(r.margin)} over)`:''}.</p>`;
  }
  if(id==='upstream'){
   return r.status==='headroom'?`<p class="health-status neutral">• ${r.headroom<0.005?'No headroom: the reading is at Pmax.':dB(r.headroom)+' of headroom below Pmax.'} This is a margin, not a pass or fail.</p>`:`<p class="health-status warn">⚠ The reading is ${dB(r.margin)} above Pmax. Check the reading, or enter the Pmax the modem reports.</p>`;
  }
  const range=r.derived?'derived range':'spec range';
  if(r.status==='inside')return `<p class="health-status ok">✓ Inside the ${range}, ${dB(r.margin)} from the ${where} edge.</p>`;
  return `<p class="health-status warn">⚠ ${dB(r.margin)} ${r.status} the ${range}.</p>`;
 }
 function companyRows(id,r){
  const c=CARDS[id],w=DocsisHealth.getWindow(id,plantNow()),res=DocsisHealth.againstWindow(r.compare,w);
  const unit=id==='ofdm'?'dBmV per 6 MHz':'dBmV';
  const head=`<span>Company window ${tag(c.company,c.title+' company window')}</span>`;
  if(res.status==='unknown')return `<div class="health-row">${head}<strong>Unknown — not entered${plantNow()?' for the '+DocsisHealth.PLANT_NAMES[plantNow()]+' plant':''}</strong></div><p class="note tight">${plantNow()?'Enter your target in the company window box below to compare.':'Choose the plant in Field → Meter setup, then enter your target in the company window box below.'}</p>`;
  const range=res.min!==null&&res.max!==null?`${level(res.min)} to ${level(res.max)}`:res.min!==null?`at least ${level(res.min)}`:`at most ${level(res.max)}`;
  const line=res.status==='inside'?`<p class="health-status ok">✓ Inside your window${Number.isFinite(res.margin)?`, ${dB(res.margin)} from the nearest edge`:''}.</p>`:`<p class="health-status warn">⚠ ${dB(res.margin)} ${res.status} your window.</p>`;
  const extra=id==='ofdm'?` (reading restated: ${level(r.compare)} dBmV per 6 MHz)`:'';
  return `<div class="health-row">${head}<strong>${range} <small>${unit}</small></strong></div>${line}${extra?`<p class="note tight">${extra.trim()}</p>`:''}`;
 }
 function out(id,r){
  const el=document.getElementById('health-'+id+'-result');if(!el)return;
  el.classList.toggle('error',!!r&&!r.ok&&r.error!==null);
  if(!r||!r.ok){el.innerHTML=`<p class="note">${escape(r?.error??'Enter a reading to compare.')}</p>`;return;}
  el.innerHTML=`<div class="health-rows">${specRows(id,r)}${statusLine(id,r)}${companyRows(id,r)}</div>`;
 }
 function blank(v,keys){return keys.every(k=>String(v[k]??'').trim()==='');}
 function update(id){
  const v=read(id);
  const other=document.querySelector('[data-health-other]');
  if(id==='ofdm'&&other)other.hidden=v.basis!=='other';
  const primary={scqam:['level'],ofdm:['power'],total:['total'],upstream:['total']}[id];
  if(blank(v,primary))return out(id,{ok:false,error:null});
  out(id,DocsisHealth.evaluate(id,v));
 }
 function storage(){try{return window.localStorage;}catch(_){return null;}}
 function syncWindowFields(){
  shownPlant=plantNow();
  for(const id of DocsisHealth.MEASUREMENTS){
   const w=DocsisHealth.getWindow(id,shownPlant);
   document.querySelectorAll(`[data-health-window="${id}"]`).forEach(el=>{el.value=w[el.dataset.field]===null?'':String(w[el.dataset.field]);el.disabled=shownPlant===null;});
  }
  document.querySelectorAll('[data-health-plant]').forEach(el=>{el.textContent=shownPlant?'· '+DocsisHealth.PLANT_NAMES[shownPlant]+' plant':'· choose the plant first';});
 }
 /* The job's plant can change while this screen is closed (Field → Meter setup, a new or opened job). */
 function refresh(){
  if(!document.getElementById('docsisHealthPanel')?.firstChild)return;
  syncWindowFields();DocsisHealth.MEASUREMENTS.forEach(id=>{note(id,'',false);update(id);});
 }
 function note(id,text,error){const el=document.getElementById('health-'+id+'-window-note');if(el){el.textContent=text;el.classList.toggle('error',!!error);}}
 function commitWindow(id){
  const plant=plantNow();
  if(plant!==shownPlant){refresh();note(id,'The plant changed, so the windows were reloaded for the '+(plant?DocsisHealth.PLANT_NAMES[plant]+' plant':'job’s plant')+'. Enter it again.',true);return;}
  const box=field=>{const el=document.querySelector(`[data-health-window="${id}"][data-field="${field}"]`);return el?typed(el):'';};
  const res=DocsisHealth.setWindow(id,box('min'),box('max'),storage(),plant);
  if(!res.ok){
   const w=DocsisHealth.getWindow(id,plant),unit=id==='ofdm'?'dBmV per 6 MHz':'dBmV';
   const inUse=w.min===null&&w.max===null?'no window':(w.min!==null&&w.max!==null?`${level(w.min)} to ${level(w.max)}`:w.min!==null?`at least ${level(w.min)}`:`at most ${level(w.max)}`)+' '+unit;
   note(id,'Not saved. '+res.error+' Still using '+inUse+'.',true);
   /* A box holding text that is not a number looks empty. Put the saved value back, so what the box shows is what is in use. */
   for(const field of ['min','max']){const el=document.querySelector(`[data-health-window="${id}"][data-field="${field}"]`);if(el&&typed(el)===NOT_A_NUMBER)el.value=w[field]===null?'':String(w[field]);}
   return;
  }
  note(id,res.saved?'Saved on this device. It is not part of a job backup.':'This browser would not save it, so it lasts until you close the page.',!res.saved);
  update(id);
 }
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('docsisHealthPanel');if(!panel)return;
  DocsisHealth.loadWindows(storage());
  panel.innerHTML=markup();syncWindowFields();
  const onEdit=event=>{
   const t=event.target;if(!panel.contains(t))return;
   if(plantNow()!==shownPlant&&t.dataset.health)syncWindowFields();
   if(t.dataset.health)update(t.dataset.health);
   else if(t.dataset.healthWindow&&event.type==='change')commitWindow(t.dataset.healthWindow);
  };
  panel.addEventListener('input',onEdit);panel.addEventListener('change',onEdit);
  panel.addEventListener('click',event=>{
   if(event.target.id!=='healthClear')return;
   if(typeof confirm==='function'&&!confirm('Clear all company windows, for both plants, on this device?'))return;
   const cleared=DocsisHealth.clearWindows(storage());syncWindowFields();
   DocsisHealth.MEASUREMENTS.forEach(id=>{note(id,'',false);update(id);});
   const status=document.getElementById('healthNote');
   if(status){status.textContent=cleared?'Company windows cleared on this device.':'This browser would not remove the saved windows, so they may return when the page reloads.';status.classList.toggle('error',!cleared);}
  });
  DocsisHealth.MEASUREMENTS.forEach(update);
 }
 return {init,markup,update,refresh,CARDS};
})();
