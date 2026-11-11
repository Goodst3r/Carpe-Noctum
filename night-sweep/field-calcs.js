/* Field calculators (build list item 4, 2.0 Alpha build 3). Offline, deterministic and
   labeled from the threshold registry. Missing or invalid input gives no result and a
   reason; it is never shown as zero. No live modem, CMTS or meter data is read. */
const FieldCalc=(()=>{
 const C_FT_PER_US=299792458/0.3048/1e6;
 const C_FT_PER_NS=C_FT_PER_US/1000;
 const UNITS=Object.freeze(['dBmV','dBm','dBuV','mV','mW']);
 const IMPEDANCES=Object.freeze([75,50]);
 const SYMBOL_RATES=Object.freeze([5.12,2.56,1.28]);
 const fail=error=>({ok:false,error});
 const num=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const whole=x=>{const n=num(x);return n!==null&&Number.isInteger(n)?n:null;};
 function velocity(value){
  const v=num(value);
  if(v===null)return fail('Enter the cable’s velocity of propagation (VP) as a fraction, for example 0.87.');
  if(v>=50&&v<=100)return fail('Enter VP as a fraction (0.87), not a percent (87).');
  if(v<0.5||v>1)return fail('Enter a VP from 0.50 to 1.00.');
  return {ok:true,value:v};
 }
 /* dBmV, dBm, dBµV, mV and mW at 75 or 50 Ω. RMS voltage across a matched load. */
 function convertLevel(value,unit,ohms=75){
  const x=num(value),R=num(ohms);
  if(!UNITS.includes(unit))return fail('Choose a unit.');
  if(!IMPEDANCES.includes(R))return fail('Choose 75 Ω or 50 Ω.');
  if(x===null)return fail('Enter a level to convert.');
  const offset=10*Math.log10(1000*R);let dBmV;
  if(unit==='dBmV')dBmV=x;else if(unit==='dBuV')dBmV=x-60;else if(unit==='dBm')dBmV=x+offset;
  else if(unit==='mV'){if(!(x>0))return fail('Enter a voltage above 0 mV.');dBmV=20*Math.log10(x);}
  else{if(!(x>0))return fail('Enter a power above 0 mW.');dBmV=10*Math.log10(x)+offset;}
  if(!Number.isFinite(dBmV)||Math.abs(dBmV)>200)return fail('That level is outside the supported range of ±200 dBmV.');
  const dBm=dBmV-offset;
  return {ok:true,ohms:R,offset,dBmV,dBm,dBuV:dBmV+60,mV:10**(dBmV/20),mW:10**(dBm/10)};
 }
 /* One-way distance between two mismatches from the ripple spacing on a sweep. */
 function rippleDistance(spacingMHz,vpValue){
  const df=num(spacingMHz);
  if(df===null||!(df>0))return fail('Enter the spacing between ripple peaks in MHz, above 0.');
  if(df>1800)return fail('Enter a ripple spacing of 1,800 MHz or less.');
  const v=velocity(vpValue);if(!v.ok)return v;
  const feet=C_FT_PER_US/2*v.value/df;
  if(!Number.isFinite(feet)||feet>100000)return fail('That spacing gives more than 100,000 ft. Check the ripple spacing in MHz.');
  return {ok:true,feet,meters:feet*0.3048,constant:C_FT_PER_US/2,vp:v.value,spacing:df};
 }
 /* DOCSIS 2.0/3.0 SC-QAM upstream pre-equalizer: symbol-spaced taps. */
 function preEqDistance(tap,mainTap=8,symbolRate=5.12,vpValue){
  const t=whole(tap),m=whole(mainTap),rate=num(symbolRate);
  if(m===null||m<1||m>24)return fail('Enter the main tap as a whole number from 1 to 24.');
  if(t===null||t<1||t>24)return fail('Enter the echo tap as a whole number from 1 to 24.');
  if(t<=m)return fail('Choose a tap after the main tap. This calculator does not turn taps at or before the main tap into a distance.');
  if(!SYMBOL_RATES.includes(rate))return fail('Choose a DOCSIS 2.0/3.0 upstream symbol rate.');
  const v=velocity(vpValue);if(!v.ok)return v;
  const periodUs=1/rate,perTap=C_FT_PER_US*v.value*periodUs/2,offset=t-m;
  return {ok:true,offset,periodUs,perTap,feet:offset*perTap,low:(offset-0.5)*perTap,high:(offset+0.5)*perTap,vp:v.value};
 }
 /* Same power density over a different bandwidth. Flat across the band only. */
 function ofdmPower(power,basisMHz,occupiedMHz){
  const p=num(power),a=num(basisMHz),b=num(occupiedMHz);
  if(p===null)return fail('Enter the measured power in dBmV.');
  if(Math.abs(p)>200)return fail('Enter a power within ±200 dBmV.');
  if(a===null||!(a>0)||a>2000)return fail('Enter the bandwidth that power was measured in, from above 0 to 2,000 MHz.');
  if(b===null||!(b>0)||b>2000)return fail('Enter the occupied bandwidth, from above 0 to 2,000 MHz.');
  const at=mhz=>p+10*Math.log10(mhz/a);
  const result={ok:true,total:at(b),per6:at(6),per24:at(24),per1_6:at(1.6),delta:10*Math.log10(b/a),basis:a,occupied:b};
  if(![result.total,result.per6,result.per24,result.per1_6].every(v=>Number.isFinite(v)&&Math.abs(v)<=200))return fail('That bandwidth gives a level outside ±200 dBmV. Check the bandwidths in MHz.');
  return result;
 }
 /* Round-trip delay of an echo between two mismatches a known cable length apart. */
 function echoDelay(lengthFt,vpValue){
  const L=num(lengthFt);
  if(L===null||!(L>0))return fail('Enter the cable length between the mismatches in feet, above 0.');
  if(L>100000)return fail('Enter a length of 100,000 ft or less.');
  const v=velocity(vpValue);if(!v.ok)return v;
  const ns=2*L/(C_FT_PER_NS*v.value);
  return {ok:true,ns,us:ns/1000,symbols512:ns/(1000/5.12),nsPerFoot:1/C_FT_PER_NS,vp:v.value};
 }
 return {C_FT_PER_US,C_FT_PER_NS,UNITS,IMPEDANCES,SYMBOL_RATES,velocity,convertLevel,rippleDistance,preEqDistance,ofdmPower,echoDelay};
})();

const FieldCalcs=(()=>{
 const unitLabels={dBmV:'dBmV',dBm:'dBm',dBuV:'dBµV',mV:'mV',mW:'mW'};
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const fixed=(v,d)=>{if(!Number.isFinite(v))return '—';const s=v.toFixed(d);return /^-0\.?0*$/.test(s)?s.slice(1):s;};
 const sig=v=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumSignificantDigits:4}):'—';
 const grouped=v=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:1,minimumFractionDigits:1}):'—';
 function vpCables(){return typeof catalog!=='undefined'?catalog.cables.filter(c=>Number.isFinite(Number(c.nvpPercent))&&Number(c.nvpPercent)>0&&Number(c.nvpPercent)<=100):[];}
 function vpField(id){
  const cables=vpCables();
  return `<label>Cable VP<select data-calc-vp-source="${id}"><option value="">Enter VP</option>${cables.map(c=>`<option value="${escape(c.id)}">${escape(c.label)} · ${escape((Number(c.nvpPercent)/100).toFixed(2))} catalog</option>`).join('')}</select></label><label>Velocity of propagation (0.50–1.00)<input type="number" min="0.5" max="1" step="any" inputmode="decimal" data-calc="${id}" data-field="vp" placeholder="e.g. 0.87"><span class="note" data-calc-vp-note="${id}">Use the VP from your cable’s datasheet, or pick a catalog cable that lists one.</span></label>`;
 }
 const signed=(v,d=1)=>Number.isFinite(v)?(Number(v.toFixed(d))>0?'+':'')+fixed(v,d):'—';
 const hasAlignment=()=>typeof Alignment!=='undefined';
 function actives(){return typeof catalog!=='undefined'?catalog.devices.filter(d=>d.active&&!d.retired):[];}
 function balanceFields(){
  const list=actives().map(d=>{const sourced=hasAlignment()&&Alignment.profileFor(d.id);return `<option value="${escape(d.id)}">${escape(d.label)}${sourced?' · sourced pad/EQ':''}</option>`;}).join('');
  const level=(field,label,hint)=>`<label>${label}<input type="number" step="any" inputmode="decimal" data-calc="balance" data-field="${field}" placeholder="${hint}"></label>`;
  return `<label class="calc-wide">Amplifier model<select data-calc="balance" data-field="model"><option value="">Choose the installed model</option>${list}</select></label>${level('lowMHz','Low pilot (MHz)','e.g. 54')}${level('highMHz','High pilot (MHz)','e.g. 860')}${level('measuredLow','Reading at low pilot (dBmV)','meter')}${level('measuredHigh','Reading at high pilot (dBmV)','meter')}${level('targetLow','Target at low pilot (dBmV)','design')}${level('targetHigh','Target at high pilot (dBmV)','design')}<div class="calc-wide calc-fields" data-balance-installed hidden><label>Installed input pad (dB)<select data-calc="balance" data-field="pad"></select></label><label>Installed input EQ (dB)<select data-calc="balance" data-field="eq"></select></label></div><p class="note calc-wide" data-balance-source>Choose a model. Only values sourced for that exact model are offered.</p><details class="calc-wide note" data-balance-gaps hidden></details>`;
 }
 function refreshInstalled(){
  const model=document.querySelector('[data-calc="balance"][data-field="model"]')?.value||'',profile=hasAlignment()&&model?Alignment.profileFor(model):null;
  const wrap=document.querySelector('[data-balance-installed]'),source=document.querySelector('[data-balance-source]'),pad=document.querySelector('[data-calc="balance"][data-field="pad"]'),eq=document.querySelector('[data-calc="balance"][data-field="eq"]');
  if(!wrap||!pad||!eq)return;
  wrap.hidden=!profile;
  pad.innerHTML='<option value="">Choose the installed pad</option>'+(profile?profile.pads.values.map(v=>`<option value="${v}">${v} dB</option>`).join(''):'');
  eq.innerHTML='<option value="">Choose the installed EQ</option>'+(profile?[...(profile.eqs.unpublished||[]),...profile.eqs.items].map(e=>`<option value="${e.value}">${escape(e.label||e.value+' dB')}</option>`).join(''):'');
  const method=hasAlignment()&&model&&!profile?Alignment.noteFor(model):null;
  const gaps=document.querySelector('[data-balance-gaps]');if(gaps){gaps.hidden=!profile?.gaps?.length;gaps.innerHTML=profile?.gaps?.length?`<summary>What this list leaves out</summary><ul>${profile.gaps.map(g=>`<li>${escape(g)}</li>`).join('')}</ul>`:'';}
  if(source)source.textContent=!model?'Choose a model. Only values sourced for that exact model are offered.':profile?`Pad and EQ values: ${profile.title} · ${profile.revision} · ${profile.locator}.`:method?`${method.text} Source: ${method.source}, ${method.revision}, ${method.locator}.`:'No sourced pad and EQ values for this model yet, so no part values are offered. The errors and the direction to move each control still apply.';
 }
 function card(id,title,lead,fields,ref,refContext,conditions){
  return `<section class="calc-card" data-calc-card="${id}" aria-labelledby="calc-${id}-title"><div class="calc-card-head"><h3 id="calc-${id}-title">${title}</h3>${tag(ref,refContext)}</div><p class="note tight">${lead}</p><div class="calc-fields">${fields}</div><div class="calc-result" id="calc-${id}-result" role="status" aria-live="polite"></div><p class="note calc-conditions">${conditions}</p></section>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Field calculators</h2><p class="note tight">Quick math for the night. Each formula carries a source tag; tap it for the source and limits. Results are calculations, not measurements.</p></div></div>
<div class="calc-grid">
${card('db','dB converter','dBmV, dBm, dBµV, mV and mW at 75 Ω or 50 Ω.',`<label>Level<input type="number" step="any" inputmode="decimal" data-calc="db" data-field="value" placeholder="e.g. 10"></label><label>Unit<select data-calc="db" data-field="unit">${FieldCalc.UNITS.map(u=>`<option value="${u}">${unitLabels[u]}</option>`).join('')}</select></label><label>Impedance<select data-calc="db" data-field="ohms"><option value="75">75 Ω (cable)</option><option value="50">50 Ω (test gear)</option></select></label>`,'calc.db.dbm','dB converter','RMS voltage across a matched load of the chosen impedance. dBµV = dBmV + 60 at any impedance '+tag('calc.db.dbuv','dBµV conversion')+'.')}
${card('ripple','Ripple to distance','Spacing between ripple peaks on a sweep gives the distance between two mismatches.',`<label>Ripple spacing, peak to peak (MHz)<input type="number" min="0" step="any" inputmode="decimal" data-calc="ripple" data-field="spacing" placeholder="e.g. 6"><span class="note">Measure across several ripples and divide by the count for a steadier spacing.</span></label>${vpField('ripple')}`,'calc.ripple.distance','ripple to distance','Echo path length between two mismatches, through cable of this VP; one mismatch may be the device you are testing at. A mix of cable types needs separate checks. Speed of light '+tag('const.speedOfLight','speed of light')+'.')}
${card('preeq','Pre-EQ tap to distance','Spacing between two mismatches from a post-main tap in an upstream pre-equalizer reading you already have. Nothing is read from a modem.',`<label>Echo tap (1–24)<input type="number" min="1" max="24" step="1" inputmode="numeric" data-calc="preeq" data-field="tap" placeholder="e.g. 10"></label><label>Main tap<input type="number" min="1" max="24" step="1" inputmode="numeric" data-calc="preeq" data-field="main" value="8"><span class="note">Tap 8 of 24 is typical, but the CMTS sets it. Use the numbering your tool shows.</span></label><label>Upstream symbol rate<select data-calc="preeq" data-field="rate">${FieldCalc.SYMBOL_RATES.map(r=>`<option value="${r}">${r} Msym/s</option>`).join('')}</select></label>${vpField('preeq')}`,'calc.preeq.tapDistance','pre-EQ tap distance','The result is the spacing between two impedance mismatches, not the distance from the modem or node. DOCSIS 2.0/3.0 single-carrier upstream only, not DOCSIS 3.1 OFDMA. The ±½ tap range is shown because a tap covers one symbol period.')}
${card('ofdm','OFDM power','Power in one bandwidth, restated per 6, 24 or 1.6 MHz and over the occupied band.',`<label>Measured power (dBmV)<input type="number" step="any" inputmode="decimal" data-calc="ofdm" data-field="power" placeholder="e.g. 42"></label><label>Measured in (MHz)<select data-calc="ofdm" data-field="basis"><option value="6">6 MHz</option><option value="24">24 MHz</option><option value="1.6">1.6 MHz</option></select></label><label>Occupied bandwidth (MHz)<input type="number" min="0" step="any" inputmode="decimal" data-calc="ofdm" data-field="occupied" placeholder="e.g. 192"></label>`,'calc.ofdm.bandwidth','OFDM power','Assumes flat power across the occupied band. A tilted output needs a total composite power method instead (SCTE 270 section 30.14). For DOCSIS 3.1 downstream, occupied bandwidth is a whole number of 6 MHz channels (24 MHz minimum) and includes the edge taper.')}
${card('balance','Pad / EQ balance','Two pilot readings and the station’s targets give the level and tilt errors, then the input EQ and pad to change.',balanceFields(),'calc.alignment.balance','pad / EQ balance','Readings and targets at the same pilots and measurement plane. Put the station in the manual or backoff state its procedure requires first; an active AGC or ALSC loop can hide the change. Re-measure after each change. Balancing on two pilots does not replace a sweep.')}
${card('echo','Echo delay','Round-trip delay of an echo between two mismatches a known cable length apart.',`<label>Cable length between mismatches (ft)<input type="number" min="0" step="any" inputmode="decimal" data-calc="echo" data-field="length" placeholder="e.g. 100"></label>${vpField('echo')}`,'calc.microreflection.delay','echo delay','The echo travels the length twice. Speed of light '+tag('const.speedOfLight','speed of light')+'.')}
</div>`;
 }
 function read(id){const values={};document.querySelectorAll(`[data-calc="${id}"]`).forEach(el=>{values[el.dataset.field]=el.value;});return values;}
 function out(id,result,html){const el=document.getElementById('calc-'+id+'-result');if(!el)return;el.classList.toggle('error',!!result&&!result.ok&&result.error!==null);el.innerHTML=result?.ok?html:`<p class="note">${escape(result?.error||'Enter values to calculate.')}</p>`;}
 const stat=(label,value,unit)=>`<div><span>${escape(label)}</span><strong>${escape(value)}${unit?` <small>${escape(unit)}</small>`:''}</strong></div>`;
 function blank(values,keys){return keys.every(k=>String(values[k]??'').trim()==='');}
 function update(id){
  const v=read(id);
  if(id==='db'){if(blank(v,['value']))return out(id,{ok:false,error:null});const r=FieldCalc.convertLevel(v.value,v.unit,v.ohms);out(id,r,`<div class="calc-stats">${stat('dBmV',fixed(r.dBmV,2))}${stat('dBm',fixed(r.dBm,2))}${stat('dBµV',fixed(r.dBuV,2))}${stat('mV',sig(r.mV))}${stat('mW',sig(r.mW))}</div><p class="note">At ${r.ohms} Ω, dBm = dBmV − ${fixed(r.offset,2)} dB.</p>`);}
  if(id==='ripple'){if(blank(v,['spacing','vp']))return out(id,{ok:false,error:null});const r=FieldCalc.rippleDistance(v.spacing,v.vp);out(id,r,`<div class="calc-stats">${stat('Distance between mismatches',grouped(r.feet),'ft')}${stat('Metres',fixed(r.meters,1),'m')}</div><p class="note">${fixed(r.constant,1)} × ${r.vp} ÷ ${r.spacing} MHz = ${grouped(r.feet)} ft.</p>`);}
  if(id==='preeq'){if(blank(v,['tap','vp']))return out(id,{ok:false,error:null});const r=FieldCalc.preEqDistance(v.tap,v.main,v.rate,v.vp);out(id,r,`<div class="calc-stats">${stat('Spacing between mismatches',grouped(r.feet),'ft')}${stat('Range (±½ tap)',grouped(r.low)+'–'+grouped(r.high),'ft')}${stat('Per tap',grouped(r.perTap),'ft')}</div><p class="note">${r.offset} tap${r.offset===1?'':'s'} after the main tap × ${grouped(r.perTap)} ft (symbol period ${fixed(r.periodUs*1000,1)} ns, VP ${r.vp}).</p>`);}
  if(id==='ofdm'){if(blank(v,['power','occupied']))return out(id,{ok:false,error:null});const r=FieldCalc.ofdmPower(v.power,v.basis,v.occupied);out(id,r,`<div class="calc-stats">${stat('Total over '+r.occupied+' MHz',fixed(r.total,2),'dBmV')}${stat('Per 6 MHz',fixed(r.per6,2),'dBmV')}${stat('Per 24 MHz',fixed(r.per24,2),'dBmV')}${stat('Per 1.6 MHz',fixed(r.per1_6,2),'dBmV')}</div><p class="note">10·log10(${r.occupied} ÷ ${r.basis}) = ${r.delta>=0?'+':''}${fixed(r.delta,2)} dB.</p>`);}
  if(id==='balance'){
   if(blank(v,['lowMHz','highMHz','measuredLow','measuredHigh','targetLow','targetHigh']))return out(id,{ok:false,error:null});
   if(!hasAlignment())return out(id,{ok:false,error:'The balance engine is unavailable in this build.'});
   const device=v.model&&typeof catalog!=='undefined'?catalog.devices.find(d=>d.id===v.model):null,band=device?.publishedGain?.forwardBand;
   const profile=v.model?Alignment.profileFor(v.model):null,r=Alignment.solve(v,{profile,pad:v.pad,eq:v.eq,forwardBand:Array.isArray(band)?band:undefined});
   if(!r.ok)return out(id,r);
   const c=r.catalog;
   const advice=c?.ok?`<p class="note">${escape(c.advice.eq)} ${escape(c.advice.pad)}</p>${c.advice.inWindow===null?'':`<p class="note">${c.advice.inWindow?'Predicted inside':'Predicted outside'} the procedure’s ±${c.advice.window} dB window for tilt and level (${escape(c.advice.windowSource)}).${c.advice.inWindow?'':' Re-measure after the change and follow the procedure.'}</p>`}`:'';
   const picks=c?.ok?`<h4>Change</h4><div class="calc-stats">${stat('Input EQ',fixed(c.eq.from,1)+' → '+fixed(c.eq.to,1),'dB')}${stat('Input pad',fixed(c.pad.from,1)+' → '+fixed(c.pad.to,1),'dB')}</div><h4>Predicted after the change</h4><div class="calc-stats">${stat('Low pilot',fixed(c.after.low,1)+' ('+signed(c.leftover.low)+')','dBmV')}${stat('High pilot',fixed(c.after.high,1)+' ('+signed(c.leftover.high)+')','dBmV')}${stat('Tilt',fixed(c.after.tilt,1)+' ('+signed(c.leftover.tilt)+')','dB')}</div><p class="note">In brackets: what is left over against the target. A prediction from the published EQ losses${c.interpolated?', interpolated between published frequencies':''}; re-measure to confirm.</p>${c.notes.map(n=>`<p class="status warning">${escape(n)}</p>`).join('')}`:`<p class="note">${escape(c?.error||'')}</p>`;
   const method=!profile&&v.model?Alignment.noteFor(v.model):null;
   const baPad=()=>{const e=r.errorHigh,step=method.padValues[1]-method.padValues[0];return Math.abs(e)<step/2?`The high pilot is within half a pad step (${step/2} dB) of its target.`:e>0?`The high pilot is ${e.toFixed(1)} dB high: a larger gain-adjust pad lowers it (pads ${method.padValues.join(', ')} dB).`:`The high pilot is ${Math.abs(e).toFixed(1)} dB low: a smaller gain-adjust pad raises it. With the 0 dB pad fitted, check the input level instead.`;};
   const head=`<div class="calc-stats">${stat('Low pilot vs target',signed(r.errorLow),'dB')}${stat('High pilot vs target',signed(r.errorHigh),'dB')}${stat('Tilt now / target',fixed(r.tiltMeasured,1)+' / '+fixed(r.tiltTarget,1),'dB')}</div>`;
   out(id,r,head+(!v.model?'<p class="note">Choose the installed amplifier model to see how to correct it.</p>':method?`${method.padAdvice?`<p class="note">${escape(baPad())}</p>`:''}<p class="note">${escape(method.text)}</p>`:profile?advice+picks:`<p class="note">${escape(r.guidance.eq)} ${escape(r.guidance.pad)}</p>${picks}`));
  }
  if(id==='echo'){if(blank(v,['length','vp']))return out(id,{ok:false,error:null});const r=FieldCalc.echoDelay(v.length,v.vp);out(id,r,`<div class="calc-stats">${stat('Round-trip delay',fixed(r.ns,1),'ns')}${stat('Microseconds',fixed(r.us,4),'µs')}${stat('At 5.12 Msym/s',fixed(r.symbols512,2),'symbol periods')}</div><p class="note">2 × length × ${fixed(r.nsPerFoot,4)} ns/ft ÷ ${r.vp}.</p>`);}
 }
 function chooseCable(id,cableId){
  const input=document.querySelector(`[data-calc="${id}"][data-field="vp"]`),note=document.querySelector(`[data-calc-vp-note="${id}"]`),cable=vpCables().find(c=>c.id===cableId);
  if(!input)return;
  if(cable){input.value=String(Number(cable.nvpPercent)/100);if(note)note.textContent=`Catalog VP for ${cable.label}: nominal ${cable.nvpPercent}%. Calibrate against the installed cable when you can.`;}
  else if(note)note.textContent='Use the VP from your cable’s datasheet, or pick a catalog cable that lists one.';
  update(id);
 }
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('calculatorPanel');if(!panel)return;panel.innerHTML=markup();
  const onEdit=event=>{const t=event.target;if(!panel.contains(t))return;
   if(t.dataset.calcVpSource!==undefined){if(event.type==='change')chooseCable(t.dataset.calcVpSource,t.value);return;}
   if(t.dataset.calc==='balance'&&t.dataset.field==='model'&&event.type==='change')refreshInstalled();
   if(t.dataset.calc){if(t.dataset.field==='vp'&&event.type==='input'){const source=panel.querySelector(`[data-calc-vp-source="${t.dataset.calc}"]`),cable=vpCables().find(c=>c.id===source?.value);if(cable&&Number(t.value)!==Number(cable.nvpPercent)/100){source.value='';const note=panel.querySelector(`[data-calc-vp-note="${t.dataset.calc}"]`);if(note)note.textContent='Entered VP.';}}update(t.dataset.calc);}
  };
  panel.addEventListener('input',onEdit);panel.addEventListener('change',onEdit);
  refreshInstalled();
  ['db','ripple','preeq','ofdm','balance','echo'].forEach(update);
 }
 return {init,update,markup};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=FieldCalc;
