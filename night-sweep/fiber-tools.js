/* Build 3 fiber tools (build list item 15, first part): the TIA-598 color code finder and a simple link loss budget.
   Offline and deterministic. Nothing is read from a meter and nothing is stored. A blank entry is never read as zero:
   a count of 0 contributes nothing, but a blank count or a blank loss for a counted item gives a reason and no number.
   The standard's allowances are shown, with a source tag, as a reference the technician may copy into the fields on
   purpose; they are never filled in silently, and a company's own targets are not known to the app. */
const FiberTools=(()=>{
 const COLORS=Object.freeze(['Blue','Orange','Green','Brown','Slate','White','Red','Black','Yellow','Violet','Rose','Aqua']);
 const PER_TUBE=12,MAX_TUBE=24,MAX_FIBER=PER_TUBE*MAX_TUBE;
 const DECIMAL=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
 const fail=error=>({ok:false,error});
 const num=x=>{
  if(typeof x==='number')return Number.isFinite(x)?x:null;
  if(typeof x!=='string'||x.length>40||!DECIMAL.test(x.trim()))return null;
  const n=Number(x.trim());return Number.isFinite(n)?n:null;
 };
 const whole=x=>{const n=num(x);return n!==null&&Number.isInteger(n)?n:null;};
 const blank=x=>x===null||x===undefined||String(x).trim()==='';

 /* ---- TIA-598 color code: twelve colors for fibers and for buffer tubes, in this order ---- */
 function tubeMarking(tube){
  if(tube<=PER_TUBE)return {marked:false,text:'plain color'};
  return {marked:true,text:tube===20?'the color sequence repeats with a stripe or dashes; tube 20 is the black position, and makers mark the repeat differently (a white tracer in one maker\'s note, a yellow stripe in another\'s)':'the color sequence repeats with a stripe or dashes'};
 }
 /* Where is fiber n, counting from 1 across the whole cable with 12 fibers in each tube? */
 function locate(fiber){
  const n=whole(fiber);
  if(n===null)return fail('Enter the fiber number as a whole number.');
  if(n<1)return fail('Enter a fiber number of 1 or more.');
  if(n>MAX_FIBER)return fail('Enter a fiber number up to '+MAX_FIBER+' (24 tubes of 12). Past that, read the cable maker\'s construction sheet.');
  const tube=Math.ceil(n/PER_TUBE),position=((n-1)%PER_TUBE)+1;
  return {ok:true,fiber:n,tube,position,tubeColor:COLORS[(tube-1)%PER_TUBE],fiberColor:COLORS[position-1],tubeMarking:tubeMarking(tube)};
 }
 /* Which fiber is it, given the tube number and the fiber's position (1 to 12) inside the tube? */
 function fromTube(tube,position){
  const t=whole(tube),p=whole(position);
  if(t===null||t<1||t>MAX_TUBE)return fail('Enter the tube number from 1 to '+MAX_TUBE+'.');
  if(p===null||p<1||p>PER_TUBE)return fail('Enter the position inside the tube from 1 to '+PER_TUBE+'.');
  return locate((t-1)*PER_TUBE+p);
 }

 /* ---- Simple link loss budget ---- */
 const LIMITS=Object.freeze({length:[0,500],attenuation:[0,5],count:[0,500],each:[0,5],other:[0,50],margin:[0,30],tx:[-40,40],rx:[-80,20]});
 function required(value,label,[lo,hi],unit){
  if(blank(value))return fail('Enter '+label+'.');
  const v=num(value);
  if(v===null||v<lo||v>hi)return fail('Enter '+label+' as a number from '+lo+' to '+hi+(unit?' '+unit:'')+'.');
  return {ok:true,value:v};
 }
 /* Count of items and the loss of each: a count of 0 needs no loss, a count above 0 needs one. */
 function counted(count,each,names){
  if(blank(count))return fail('Enter the number of '+names.plural+', or 0 if there are none.');
  const c=whole(count);
  if(c===null||c<LIMITS.count[0]||c>LIMITS.count[1])return fail('Enter the number of '+names.plural+' as a whole number from 0 to '+LIMITS.count[1]+'.');
  if(c===0)return {ok:true,count:0,each:null,total:0};
  const e=required(each,'the loss of each '+names.single+' in dB',LIMITS.each,'dB');if(!e.ok)return e;
  return {ok:true,count:c,each:e.value,total:c*e.value};
 }
 function budget(input){
  const length=required(input?.length,'the link length in km',LIMITS.length,'km');if(!length.ok)return length;
  const attenuation=required(input?.attenuation,'the fiber attenuation in dB per km',LIMITS.attenuation,'dB/km');if(!attenuation.ok)return attenuation;
  const connectors=counted(input?.connectors,input?.connectorLoss,{plural:'mated connector pairs',single:'mated pair'});if(!connectors.ok)return connectors;
  const splices=counted(input?.splices,input?.spliceLoss,{plural:'splices',single:'splice'});if(!splices.ok)return splices;
  const other=blank(input?.other)?{ok:true,value:0,entered:false}:{...required(input?.other,'the other loss in dB',LIMITS.other,'dB'),entered:true};if(!other.ok)return other;
  const margin=required(input?.margin,'the safety margin in dB (0 for none)',LIMITS.margin,'dB');if(!margin.ok)return margin;
  const fiber=length.value*attenuation.value;
  const total=fiber+connectors.total+splices.total+other.value;
  const out={ok:true,length:length.value,attenuation:attenuation.value,fiber,connectors,splices,other:other.value,otherEntered:other.entered,margin:margin.value,estimated:total,required:total+margin.value,optics:null};
  const hasTx=!blank(input?.tx),hasRx=!blank(input?.rx);
  if(hasTx!==hasRx)return fail('Enter both the transmitter output power and the receiver sensitivity in dBm, or leave both blank.');
  if(hasTx){
   const tx=required(input.tx,'the transmitter output power in dBm',LIMITS.tx,'dBm');if(!tx.ok)return tx;
   const rx=required(input.rx,'the receiver sensitivity (the weakest signal it accepts) in dBm',LIMITS.rx,'dBm');if(!rx.ok)return rx;
   if(!(tx.value>rx.value))return fail('The transmitter power must be higher than the receiver sensitivity, both in dBm.');
   const available=tx.value-rx.value,headroom=available-out.required;
   out.optics={tx:tx.value,rx:rx.value,available,headroom,status:headroom>=-1e-12?'within':'short'};
  }
  return out;
 }
 return {COLORS,PER_TUBE,MAX_TUBE,MAX_FIBER,LIMITS,locate,fromTube,budget,tubeMarking};
})();

const FiberToolsUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const trim=(v,d=2)=>{const s=Number(v.toFixed(d)).toString();return s==='-0'?'0':s;};
 const row=(label,value)=>`<div class="health-row"><span>${label}</span><strong>${value}</strong></div>`;
 const swatch=name=>`<span class="fiber-swatch fiber-${name.toLowerCase()}" aria-hidden="true"></span>`;
 const field=(card,name,label,hint,extra='')=>`<label>${label}<input type="number" step="any" data-fiber="${card}" data-field="${name}" placeholder="${hint}"${extra}></label>`;
 /* A native number box holding only a minus sign reads as "" but is not blank (validity.badInput is true). It must not be
    dropped, or replaced by the other way of entering the same thing, so it is reported and the calculation waits. */
 function boxName(el){const label=el.closest('label'),text=label?(label.firstChild&&label.firstChild.textContent||label.textContent):'';return String(text).replace(/\s*\(.*$/,'').trim()||'number';}
 function read(card){
  const v={},bad=[];
  document.querySelectorAll(`[data-fiber="${card}"]`).forEach(el=>{
   v[el.dataset.field]=el.value;
   if(el.validity&&el.validity.badInput===true){bad.push(boxName(el));el.setAttribute('aria-invalid','true');}else el.removeAttribute('aria-invalid');
  });
  Object.defineProperty(v,'__bad',{value:bad,enumerable:false});
  return v;
 }
 const unfinished=bad=>({ok:false,error:'Not calculated. The '+bad.join(' and the ')+' box'+(bad.length>1?'es hold':' holds')+' an unfinished entry (for example just a minus sign). Finish the number, or clear the box.'});
 function out(id,r,html){
  const el=document.getElementById('fiber-'+id+'-result');if(!el)return;
  el.classList.toggle('error',!!r&&!r.ok&&r.error!==null);
  el.innerHTML=r?.ok?html:`<p class="note"${r&&!r.ok&&r.error&&/^Not calculated/.test(r.error)?' role="alert"':''}>${escape(r?.error??'Enter values to see the result.')}</p>`;
 }
 function colorTable(){
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="TIA-598 colors"><table class="leak-table"><thead><tr><th scope="col">Position</th><th scope="col">Color</th><th scope="col">Position</th><th scope="col">Color</th></tr></thead><tbody>${[0,1,2,3,4,5].map(i=>`<tr><td>${i+1}</td><td>${swatch(FiberTools.COLORS[i])}${FiberTools.COLORS[i]}</td><td>${i+7}</td><td>${swatch(FiberTools.COLORS[i+6])}${FiberTools.COLORS[i+6]}</td></tr>`).join('')}</tbody></table></div>`;
 }
 function updateFinder(){
  const v=read('finder');
  if(v.__bad.length)return out('finder',unfinished(v.__bad));
  if(String(v.fiber??'').trim()===''&&String(v.tube??'').trim()===''&&String(v.position??'').trim()==='')return out('finder',{ok:false,error:null});
  const byTube=String(v.fiber??'').trim()==='';
  const r=byTube?FiberTools.fromTube(v.tube,v.position):FiberTools.locate(v.fiber);
  if(!r.ok)return out('finder',r);
  out('finder',r,`${row('Fiber '+r.fiber,swatch(r.fiberColor)+r.fiberColor+' <small>(position '+r.position+')</small>')}${row('In tube '+r.tube,swatch(r.tubeColor)+r.tubeColor)}<p class="note tight">${r.tubeMarking.marked?'Tube '+r.tube+' is past 12: '+escape(r.tubeMarking.text)+'. Marking past 12 differs between makers, so check the cable print legend before you splice.':'Fibers and tubes both use the same twelve colors in the same order.'}</p>`);
 }
 const STANDARD=Object.freeze({connector:'fiber.tia.connector',splice:'fiber.tia.splice',osp:'fiber.tia.sm.osp',isp:'fiber.tia.sm.isp'});
 function updateBudget(){
  const v=read('budget');
  if(v.__bad.length)return out('budget',unfinished(v.__bad));
  if(Object.values(v).every(x=>String(x??'').trim()===''))return out('budget',{ok:false,error:null});
  const r=FiberTools.budget(v);
  if(!r.ok)return out('budget',r);
  const part=(label,value)=>row(label,trim(value)+' <small>dB</small>');
  let html=part('Fiber, '+trim(r.length,3)+' km × '+trim(r.attenuation,3)+' dB/km',r.fiber)+part('Connectors, '+r.connectors.count+(r.connectors.count?' × '+trim(r.connectors.each):''),r.connectors.total)+part('Splices, '+r.splices.count+(r.splices.count?' × '+trim(r.splices.each):''),r.splices.total)+(r.otherEntered?part('Other loss',r.other):'')+row('Estimated link loss',trim(r.estimated)+' <small>dB</small>')+row('With the safety margin of '+trim(r.margin)+' dB',trim(r.required)+' <small>dB</small>');
  if(r.optics)html+=row('Optics budget (transmit power − receiver sensitivity)',trim(r.optics.available)+' <small>dB</small>')+(r.optics.status==='within'?`<p class="health-status ok">✓ ${trim(r.optics.headroom)} dB of the optics budget is left after the loss and the margin.</p>`:`<p class="health-status warn">⚠ Short by ${trim(-r.optics.headroom)} dB: the loss and margin exceed the optics budget.</p>`);
  else html+='<p class="health-status neutral">• No optics numbers were entered, so this is the loss to expect, not a pass or fail.</p>';
  out('budget',r,html);
 }
 function referenceBox(){
  return `<div class="fiber-reference"><h4>Standard allowances (worst-case design values) ${tag('fiber.tia.connector','TIA connector allowance')}</h4><div class="table-scroll" tabindex="0" role="region" aria-label="TIA-568.3-D allowances"><table class="leak-table"><thead><tr><th scope="col">Item</th><th scope="col">Allowance</th><th scope="col">Source</th></tr></thead><tbody><tr><th scope="row">Mated connector pair</th><td>0.75 dB</td><td>${tag('fiber.tia.connector','connector allowance')}</td></tr><tr><th scope="row">Splice</th><td>0.3 dB</td><td>${tag('fiber.tia.splice','splice allowance')}</td></tr><tr><th scope="row">Single-mode, outside plant</th><td>0.5 dB/km</td><td>${tag('fiber.tia.sm.osp','outside plant attenuation allowance')}</td></tr><tr><th scope="row">Single-mode, inside plant</th><td>1.0 dB/km</td><td>${tag('fiber.tia.sm.isp','inside plant attenuation allowance')}</td></tr></tbody></table></div><div class="toolbar"><button type="button" data-fiber-fill="osp">Copy the outside-plant allowances into the fields</button><button type="button" data-fiber-fill="isp">Copy the inside-plant allowances into the fields</button></div><p class="note">Real glass and good connectors measure better than these allowances, and your company's own limits may be tighter; the app does not know them. Copying the allowances is your choice, never a default.</p></div>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Fiber</h2><p class="note tight">The TIA-598 color code and a simple link loss budget. Offline; nothing is read from a meter and nothing is stored. A blank entry is never read as zero.</p></div></div><div class="calc-grid"><section class="calc-card" aria-labelledby="fiber-finder-title"><div class="calc-card-head"><h3 id="fiber-finder-title">Fiber color finder</h3>${tag('fiber.tia598.colors','TIA-598 color code')}</div><p class="note tight">Counting from 1 across the cable with 12 fibers in each tube. Enter a fiber number, or a tube and a position inside it.</p>${colorTable()}<div class="calc-fields">${field('finder','fiber','Fiber number (1 to '+FiberTools.MAX_FIBER+')','e.g. 30')}${field('finder','tube','Or tube number (1 to '+FiberTools.MAX_TUBE+')','e.g. 3')}${field('finder','position','Position inside the tube (1 to 12)','e.g. 6')}</div><div class="calc-result" id="fiber-finder-result" role="status" aria-live="polite"></div><p class="note calc-conditions">Twelve colors in this order for fibers and for buffer tubes: blue, orange, green, brown, slate, white, red, black, yellow, violet, rose, aqua. Past 12 the colors repeat with a stripe, dashes or rings, and makers differ (fiber 20 is often clear or yellow-striped), so the cable print legend and the construction sheet decide. Cables with 24 fibers in a tube, ribbons and other color schemes are not covered.</p></section><section class="calc-card" aria-labelledby="fiber-budget-title"><div class="calc-card-head"><h3 id="fiber-budget-title">Link loss budget</h3>${tag('fiber.budget.formula','link loss budget formula')}</div><p class="note tight">Estimated loss = length × attenuation + connector pairs × loss + splices × loss + other loss. A count of 0 needs no loss; a blank is not zero.</p>${referenceBox()}<div class="calc-fields">${field('budget','length','Link length (km)','e.g. 12.4')}${field('budget','attenuation','Fiber attenuation (dB/km)','e.g. 0.35')}${field('budget','connectors','Mated connector pairs (count)','e.g. 4')}${field('budget','connectorLoss','Loss of each pair (dB)','e.g. 0.3')}${field('budget','splices','Splices (count)','e.g. 6')}${field('budget','spliceLoss','Loss of each splice (dB)','e.g. 0.1')}${field('budget','other','Other loss, such as a splitter (dB, optional)','e.g. 3.5')}${field('budget','margin','Safety margin (dB, 0 for none)','e.g. 3')}${field('budget','tx','Transmitter output power (dBm, optional)','e.g. 3')}${field('budget','rx','Receiver sensitivity (dBm, with the transmitter power)','e.g. -24')}</div><div class="calc-result" id="fiber-budget-result" role="status" aria-live="polite"></div><p class="note calc-conditions">A loss budget is an estimate to compare with a measured insertion loss; it does not include measurement uncertainty and does not judge a link against your company's pass limit. The optics budget needs the maker's transmit power and receiver sensitivity at the wavelength you use. Enter splitter or WDM loss from its data sheet under other loss.</p></section></div>`;
 }
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('fiberPanel');if(!panel)return;
  panel.innerHTML=markup();
  const upd={finder:updateFinder,budget:updateBudget};
  const onEdit=event=>{const t=event.target;if(panel.contains(t)&&t.dataset.fiber&&upd[t.dataset.fiber])upd[t.dataset.fiber]();};
  panel.addEventListener('input',onEdit);panel.addEventListener('change',onEdit);panel.addEventListener('focusout',onEdit);   /* leaving a half-filled box from empty sends no change */
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button[data-fiber-fill]');if(!b||!panel.contains(b))return;
   const value=id=>typeof Thresholds!=='undefined'?Thresholds.get(id)?.value:undefined;
   const set=(name,v)=>{const el=panel.querySelector(`[data-fiber="budget"][data-field="${name}"]`);if(el&&Number.isFinite(v))el.value=String(v);};
   set('connectorLoss',value(STANDARD.connector));set('spliceLoss',value(STANDARD.splice));set('attenuation',value(STANDARD[b.dataset.fiberFill]));
   updateBudget();
  });
 }
 return {init,updateFinder,updateBudget,STANDARD};
})();
