/* Threshold and source registry (build list item 1, 2.0 Alpha build 3).
   One row for each limit, target, constant or formula used by the field calculators,
   the job's acceptance criteria and meter setup, the built-in local preset and the
   engine approximations. Example targets on older screens (Test → References) are
   not registered yet. Every row
   carries one label (spec, expert, company or unknown), its source, revision, page or
   table, units, conditions and the date it was checked. Company values stay where the
   technician entered them (the job profile or sweep setup); blank stays unknown and is
   never read as zero. Explanations are in our own words; SCTE and CableLabs text is
   cited by document number only. */
const Thresholds=(()=>{
 const LABELS=Object.freeze(['spec','expert','company','unknown']);
 const LABEL_INFO=Object.freeze({
  spec:Object.freeze({text:'Spec',help:'A published rule, standard or definition: FCC rule, CableLabs specification, SCTE standard or SI definition.'}),
  expert:Object.freeze({text:'Expert',help:'Published expert guidance. Good practice, but not a standard.'}),
  company:Object.freeze({text:'Company',help:'A local target entered by you or your company. It starts unknown until someone enters it.'}),
  unknown:Object.freeze({text:'Unknown',help:'The source is not verified. Treat this as unconfirmed guidance.'})
 });
 const VERIFICATION=Object.freeze({
  primary:'Checked against the primary source.',
  secondary:'Seen in a secondary source; the primary text was not checked.',
  derived:'Re-derived from first principles and checked with an independent calculation.',
  unverified:'Not verified. Check the source before relying on it.',
  entered:'Entered by a person. Confirm it with your supervisor or local procedure.'
 });
 const REQUIRED=Object.freeze(['id','label','name','kind','units','source','revision','locator','conditions','date','scope','verification','usedBy']);
 const KINDS=Object.freeze(['formula','constant','limit','target']);
 const SCOPES=Object.freeze(['all','42/54','204/258']);
 const CHECKED='2026-11-11',PRESET_DATE='Built-in preset; not independently checked';
 const profileRow=(field,name,units,conditions)=>({id:'company.profile.'+field,label:'company',name,kind:'target',units,store:'profile',field,
  source:'This job’s project profile: your entries, or labeled example values you have not replaced',revision:'Per job; saved with the job and its backups',locator:'Job → Acceptance → project profile',
  conditions,date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Job → Acceptance records and run sheet',
  note:'New jobs start with this blank, except the 750 MHz example profile, which carries labeled example launch levels (32 / 43 dBmV, “Original example; confirm”). Criteria stay unapproved until you mark them approved.'});
 const sweepRow=()=>({id:'company.sweep42.txReference',label:'company',name:'Operator return TX reference (42/54 workflow)',kind:'target',units:'dBmV',store:'sweep',split:'42',field:'txReference',
  source:'Entered by you in this job’s meter setup',revision:'Per job; saved with the job and its backups',locator:'Test → Meter setup → 42/54 MHz workflow',
  conditions:'Return transmitter output reference at the plane and frequencies you record in meter setup. Separate from sweep injection and receiver references. The 204/258 workflow has no TX reference; it uses XPERTrak return sweep.',
  date:'Not recorded when entered',scope:'42/54',verification:'entered',usedBy:'Test → Meter setup and its exported notes'});
 const rows=Object.freeze([
  {id:'const.speedOfLight',label:'spec',name:'Speed of light in a vacuum',kind:'constant',value:299792458/0.3048/1e6,units:'ft/µs',
   formula:'c = 299,792,458 m/s (exact) ÷ 0.3048 m/ft (exact) = 983.571 ft/µs',
   source:'SCTE 293-2, What is … Velocity of Propagation? (c₀ = 983,571,056.43 ft/s), from the exact SI value of c and the international foot',revision:'SCTE 293-2 2024',locator:'Section 4.1, Speed of Light',
   conditions:'Vacuum. A signal in cable travels at VP × c.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Calculators: ripple distance, pre-EQ tap distance, echo delay'},
  {id:'calc.db.dbuv',label:'spec',name:'dBmV to dBµV',kind:'formula',units:'dB',formula:'dBµV = dBmV + 60',
   source:'Decibel and SI unit definitions: 1 mV = 1,000 µV, so 20·log10(1000) = 60 dB. SCTE 270, Mathematics of Cable, is SCTE’s cable-math reference; its treatment of this identity was not checked',revision:'SCTE 270 2021r1 (title and revision confirmed)',locator:'Not checked; the identity is re-derived',
   conditions:'RMS voltage. Independent of impedance.',date:CHECKED,scope:'all',verification:'derived',usedBy:'Test → Calculators: dB converter'},
  {id:'calc.db.dbm',label:'spec',name:'dBmV to dBm',kind:'formula',units:'dB',formula:'dBm = dBmV − 10·log10(1000 × R): 48.75 dB at 75 Ω, 46.99 dB at 50 Ω',
   source:'Power and voltage decibel definitions (P = V² ÷ R). SCTE 270, Mathematics of Cable, is SCTE’s cable-math reference; its treatment of this identity was not checked',revision:'SCTE 270 2021r1 (title and revision confirmed)',locator:'Not checked; the identity is re-derived',
   conditions:'RMS voltage across a matched resistive load of the stated impedance. Cable meters read dBmV at 75 Ω.',date:CHECKED,scope:'all',verification:'derived',usedBy:'Test → Calculators: dB converter'},
  {id:'calc.ofdm.bandwidth',label:'spec',name:'OFDM power in a different bandwidth',kind:'formula',units:'dB',formula:'P(B) = P(A) + 10·log10(B ÷ A); total = power per 6 MHz + 10·log10(occupied MHz ÷ 6)',
   source:'CableLabs CM-SP-PHYv3.1, DOCSIS 3.1 Physical Layer Specification; SCTE 258, DOCSIS 3.1 Downstream OFDM Power Definition, Calculation, and Measurement Techniques',revision:'PHYv3.1 I20 (April 19, 2023); SCTE 258 2026 (September 2026)',locator:'PHYv3.1 I20 sections 7.5.9 and 7.5.9.1 (p. 136); SCTE 258 section 5.2, section 6.2.1 note 4 and section 7.2',
   conditions:'Assumes the same power in every 6 MHz of the occupied band. SCTE 258 2026 does not cover tilted outputs, which some DAA equipment supports; for a tilt, SCTE 270 2021r1 section 30.14 gives a total composite power method. Downstream OFDM occupied bandwidth is a whole number of 6 MHz channels, at least 24 MHz, and includes the edge taper. Per-24 and per-1.6 MHz values use the same flat-power arithmetic.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Calculators: OFDM power'},
  {id:'calc.preeq.tapDistance',label:'expert',name:'Upstream pre-EQ tap to mismatch spacing',kind:'formula',units:'ft',formula:'spacing ≈ (tap − main tap) × c × VP × symbol period ÷ 2; ±½ tap',
   source:'CableLabs CM-GL-PNMP-V03, PNM Best Practices: HFC Networks (main tap position; round trip halved for distance; spacing between mismatches), built on CableLabs CM-SP-PHYv3.0, DOCSIS 3.0 Physical Layer Specification (24-tap, symbol-spaced pre-equalizer)',revision:'PNMP-V03 (July 25, 2016); PHYv3.0 I04 (May 18, 2007), same section 6.2.16 text in I09 (October 8, 2010); final issue C01 not opened for this section',locator:'PNMP-V03 section 5.5 Table 1 (p. 37), section 6.6.2 (p. 64) and section 6.8.1.1 item 2 (p. 84); PHYv3.0 I04 section 6.2.16 (pp. 62–64) and section 6.2.11.1',
   conditions:'DOCSIS 2.0/3.0 single-carrier (SC-QAM) upstream in 24-tap mode at 1.28, 2.56 or 5.12 Msym/s. The result is the spacing between two impedance mismatches, not the distance from the modem or node. The CMTS sets the main tap; tap 8 is typical, not fixed, so use the numbering your tool shows. No document states this as one formula: it combines the specification’s symbol-spaced taps with the best-practice round-trip halving. DOCSIS 3.1 OFDMA uses one coefficient per subcarrier, so this tap method does not carry over (an inference; the specification does not say so directly).',date:CHECKED,scope:'all',verification:'derived',usedBy:'Test → Calculators: pre-EQ tap distance'},
  {id:'calc.ripple.distance',label:'expert',name:'Standing-wave ripple to distance',kind:'formula',units:'ft',formula:'D (ft) = (c ÷ 2) × VP ÷ ΔF ≈ 492 × VP ÷ ΔF (MHz)',
   source:'R. Hranac, “Linear Distortions, Part 2,” Communications Technology; the same relationship appears in SCTE 280, Understanding and Troubleshooting Cable RF Spectrum',revision:'Communications Technology, August 2005; SCTE 280 2022',locator:'Hranac: “Linear distortions in the real world” (Figure 3 discussion); SCTE 280 section 9.7, Standing Waves (p. 50)',
   conditions:'ΔF is the spacing between adjacent ripple peaks or valleys. The result is the echo path length between two mismatches; one may be the device at your test point. Use the VP of the cable between them.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Calculators: ripple to distance',
   note:'492 is half the free-space wavelength of 1 MHz in feet. The app uses the exact 491.79.'},
  {id:'calc.microreflection.delay',label:'expert',name:'Echo (micro-reflection) delay',kind:'formula',units:'ns',formula:'delay (ns) = 2 × length (ft) ÷ (VP × c) ≈ 2 × length × 1.0167 ÷ VP',
   source:'R. Hranac, “Broadband: What is a Micro-Reflection?,” Communications Technology; speed of light from SCTE 293-2, What is … Velocity of Propagation?',revision:'Communications Technology, November 2009; SCTE 293-2 2024',locator:'Hranac: “Definitions, examples” (taps 100 ft apart, about 234 ns); SCTE 293-2 section 4.1',
   conditions:'Length is the one-way cable distance between the two mismatches. The echo travels it twice.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Calculators: echo delay',
   note:'Hranac rounds to 1.17 ns per foot at 87% VP. The app uses 1.0167 ns per foot ÷ VP.'},
  {id:'calc.alignment.balance',label:'expert',name:'Two-pilot balance: input EQ for tilt, then input pad for level',kind:'formula',units:'dB',formula:'tilt = high − low; after(f) = reading(f) − ΔEQ loss(f) − Δpad; pick the EQ that brings tilt closest to target, then the pad that brings the high pilot closest to target',
   source:'R. Hranac, “Frequency Response Testing,” Broadband Library (balance on a low and a high signal sets pad, EQ, level and tilt, and does not replace sweep); the order follows the GainMaker manual procedure steps in this app’s setup references (input EQ for tilt, input pad at the highest design frequency)',revision:'Broadband Library, February 19, 2022; Cisco GainMaker guide OL-31156-01 (February 2014, third-party mirror)',locator:'Hranac: “Sweep or balance?”; GainMaker guide chapter 3 manual and thermal setup steps',
   conditions:'Readings and targets at the same two pilots and the same measurement plane. The station must be in the manual or backoff state its procedure requires, because an active AGC or ALSC loop can hide a pad or EQ change. Pads are treated as flat. Picks use only the model’s sourced pad and EQ values and only inside each EQ’s published frequencies. Re-measure after every change.',date:CHECKED,scope:'all',verification:'derived',usedBy:'Test → Calculators: pad / EQ balance',
   note:'Balancing on two pilots does not show the response between them; it does not replace a sweep.'},
  {id:'app.cable.temperatureCoefficient',label:'unknown',name:'Cable loss temperature correction',kind:'constant',value:0.1,units:'% per °F',formula:'loss × (1 + 0.001 × (T − 68 °F))',
   source:'CommScope Cable Technician Pocket Guide, document MX0398 (the repository’s cable audit records that this value matches it)',revision:'MX0398 Rev U (2021), read from an indexed copy; the live document was not reachable',locator:'Not recorded; see night-sweep/research/equipment-audit-build17/passives/README.md',
   conditions:'Applied to every catalog cable from −40 to 185 °F, referenced to 68 °F.',date:CHECKED,scope:'all',verification:'secondary',usedBy:'Route predictions, Predicted levels and Frequency',
   note:'A cable’s own datasheet may state a different temperature behavior. Prefer the manufacturer’s value when you have it.'},
  {id:'app.power.resistanceAlpha',label:'unknown',name:'Default power-cable resistance coefficient',kind:'constant',value:0.004,units:'per °C',formula:'R(T) = R(68 °F) × (1 + α × (T − 68 °F) × 5 ÷ 9)',
   source:'App default, described on screen as an engineering approximation; no published source is recorded',revision:'Carried forward from earlier NightSweep builds',locator:'Power → Load (resistance coefficient)',
   conditions:'Applied to built-in loop resistance referenced to 68 °F / 20 °C. Editable on the Power screen.',date:CHECKED,scope:'all',verification:'unverified',usedBy:'Power → Load and What-if',
   note:'Use a verified cable-specific value when you have one.'},
  {id:'company.local.forward54',label:'company',name:'Local forward design reference at 54 MHz',kind:'target',preset:'launchLow',units:'dBmV',
   source:'Owner-entered local non-high-split target built into this app',revision:'Local preset (since NightSweep 1.7)',locator:'Test → References → Your local non-high-split targets',
   conditions:'Forward design reference on 42/54 MHz plant at 54 MHz. Not a manufacturer capability, live carrier or measurement.',date:PRESET_DATE,scope:'42/54',verification:'entered',usedBy:'Test → References; applied to a job profile only when you confirm',
   note:'A built-in local preset, not approved plant criteria. Apply it to a job profile, then edit the profile values there if your plant differs.'},
  {id:'company.local.forward860',label:'company',name:'Local forward design reference at 860 MHz',kind:'target',preset:'launchHigh',units:'dBmV',
   source:'Owner-entered local non-high-split target built into this app',revision:'Local preset (since NightSweep 1.7)',locator:'Test → References → Your local non-high-split targets',
   conditions:'Forward design reference on 42/54 MHz plant at 860 MHz. Not a manufacturer capability, live carrier or measurement.',date:PRESET_DATE,scope:'42/54',verification:'entered',usedBy:'Test → References; applied to a job profile only when you confirm',
   note:'A built-in local preset, not approved plant criteria. Apply it to a job profile, then edit the profile values there if your plant differs.'},
  {id:'company.local.returnTx',label:'company',name:'Local return TX reference (42 MHz workflow)',kind:'target',preset:'txReference',units:'dBmV',
   source:'Owner-entered local non-high-split target built into this app',revision:'Local preset (since NightSweep 1.7)',locator:'Test → References → Your local non-high-split targets',
   conditions:'Return transmitter reference in the 42 MHz workflow. Separate from sweep injection and receiver references.',date:PRESET_DATE,scope:'42/54',verification:'entered',usedBy:'Test → References; copied to meter setup only when you confirm',
   note:'A built-in local preset, not approved plant criteria.'},
  profileRow('launchLow','Design launch at the low marker','dBmV','At the profile’s low marker frequency and measurement plane.'),
  profileRow('launchHigh','Design launch at the high marker','dBmV','At the profile’s high marker frequency and measurement plane.'),
  profileRow('fLevelTol','Forward level tolerance','± dB','Allowed difference from the design level at each forward marker.'),
  profileRow('fTiltTol','Forward tilt tolerance','± dB','Allowed difference from the design tilt between the forward markers.'),
  profileRow('fRippleMax','Forward ripple maximum','dB peak-to-peak','Largest forward peak-to-valley allowed across the profile’s band.'),
  profileRow('minMer','Minimum MER','dB','Lowest MER allowed for the profile’s forward checks.'),
  profileRow('receiverLow','Return receiver target, low marker','dBmV','At the return receiver for the profile’s low return marker.'),
  profileRow('receiverHigh','Return receiver target, high marker','dBmV','At the return receiver for the profile’s high return marker.'),
  profileRow('rLevelTol','Return level tolerance','± dB','Allowed difference from the return target at each marker.'),
  profileRow('rTiltTol','Return tilt tolerance','± dB','Allowed difference from the return design tilt.'),
  profileRow('rRippleMax','Return ripple maximum','dB peak-to-peak','Largest return peak-to-valley allowed across the profile’s band.'),
  profileRow('injectionLow','Network injection, low marker','dBmV','Return test-signal injection at the profile’s low marker. Not the TX reference.'),
  profileRow('injectionHigh','Network injection, high marker','dBmV','Return test-signal injection at the profile’s high marker. Not the TX reference.'),
  profileRow('injectionTol','Injection tolerance','± dB','Allowed difference from the injection targets.'),
  sweepRow()
 ].map(row=>Object.freeze(row)));
 const byId=new Map();for(const row of rows)byId.set(row.id,row);
 const owner=()=>typeof state!=='undefined'&&state?state:{};
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const finite=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 function get(id){return byId.get(id)||null;}
 function matches(id){return rows.filter(r=>r.id===id).length;}
 function checkRow(row){
  const problems=[];
  for(const key of REQUIRED)if(typeof row[key]!=='string'||!row[key].trim())problems.push('missing '+key);
  if(!LABELS.includes(row.label))problems.push('label must be spec, expert, company or unknown');
  if(!KINDS.includes(row.kind))problems.push('unsupported kind');
  if(!SCOPES.includes(row.scope))problems.push('unsupported plant scope');
  if(!VERIFICATION[row.verification])problems.push('unsupported verification');
  if(row.date!==undefined&&!/^\d{4}-\d{2}-\d{2}$/.test(row.date)&&!['Not recorded when entered',PRESET_DATE].includes(row.date))problems.push('date must be YYYY-MM-DD');
  if(row.label==='company'&&row.verification!=='entered')problems.push('company values are entered values');
  if(row.store&&!['profile','sweep'].includes(row.store))problems.push('unsupported store');
  return problems;
 }
 function selectedProfile(s=owner()){return s.project?.profiles?.find(p=>String(p.id)===String(s.project.selectedProfile))||null;}
 /* Resolve the value a row currently shows. A blank company entry is unknown (null), never 0. */
 function resolve(id,s=owner()){
  const row=get(id);if(!row)return null;
  if(row.store==='profile'){const p=selectedProfile(s);return {value:p?finite(p[row.field]):null,where:p?'Selected profile '+p.id:'No project profile selected'};}
  if(row.store==='sweep'){const v=s.sweepSetup?.profiles?.[row.split]?.[row.field];return {value:finite(v),where:'This job’s '+row.split+' MHz meter setup'};}
  if(row.preset){const preset=typeof FieldReference!=='undefined'?FieldReference.localNonHighSplitPreset:null;return {value:preset?finite(preset[row.preset]):null,where:'Built-in local preset'};}
  return {value:typeof row.value==='number'&&Number.isFinite(row.value)?row.value:null,where:row.kind==='formula'?'Formula':'Built in'};
 }
 function trim(value){const fixed=Math.abs(value)>=100?value.toFixed(1):Math.abs(value)>=1?value.toFixed(3):value.toPrecision(3);return String(Number(fixed));}
 function display(id,s=owner()){
  const row=get(id),r=resolve(id,s);if(!row||!r)return '—';
  if(row.kind==='formula')return row.formula||'Formula';
  if(r.value===null)return row.label==='company'?'Unknown — not entered':'—';
  return row.units.startsWith('± ')?'± '+trim(r.value)+' '+row.units.slice(2):trim(r.value)+' '+row.units;
 }
 function tag(id,context=''){
  const row=get(id);if(!row)throw Error('Unregistered threshold '+id);
  const info=LABEL_INFO[row.label];
  return `<button type="button" class="source-tag source-${row.label}" data-threshold="${escape(row.id)}" data-label="${row.label}" aria-haspopup="dialog" aria-label="${escape(info.text+' source for '+(context||row.name)+'. Open details.')}">${info.text}</button>`;
 }
 function detail(label,value){return value?`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`:'';}
 function sheetBody(row){
  const info=LABEL_INFO[row.label],r=resolve(row.id),value=display(row.id);
  const caution=['secondary','unverified'].includes(row.verification)?`<p class="status warning">${escape(VERIFICATION[row.verification])}</p>`:'';
  const edit=row.store==='profile'?`<button type="button" data-task="records" data-source-close>Edit in Job → Acceptance</button>`:row.store==='sweep'?`<button type="button" data-task="sweepSetup" data-source-close>Edit in Test → Meter setup (choose 42/54)</button>`:row.preset?`<button type="button" data-task="references" data-source-close>Open Test → References</button>`:'';
  return `<div class="source-sheet-head"><span class="source-tag source-${row.label} static" aria-hidden="true">${info.text}</span><h2 id="sourceSheetTitle" tabindex="-1">${escape(row.name)}</h2></div><p class="note">${escape(info.help)}</p>${caution}<dl class="source-details">${detail(row.kind==='formula'?'Formula':'Value',value)}${row.kind!=='formula'&&row.formula?detail('Formula',row.formula):''}${row.kind==='formula'?'':detail('Where the value comes from',r?.where)}${detail('Units',row.units)}${detail('Applies when',row.conditions)}${detail('Plant',row.scope==='all'?'Both plants (42/54 and 204/258)':row.scope+' MHz plant')}${detail('Source',row.source)}${detail('Revision',row.revision)}${detail('Page, table or section',row.locator)}${row.verification==='entered'?detail('Date',row.date):detail('Checked',row.date+' · '+VERIFICATION[row.verification])}${row.verification==='entered'?detail('Verification',VERIFICATION.entered):''}${detail('Used by',row.usedBy)}${detail('Note',row.note)}</dl><div class="toolbar">${edit}<button type="button" class="primary" data-source-close>Close</button></div>`;
 }
 let sheet=null,returnFocus=null;
 function close(){if(!sheet)return;const dlg=sheet;sheet=null;try{dlg.close();}catch(_){}dlg.remove();const back=returnFocus;returnFocus=null;if(back?.isConnected)back.focus({preventScroll:true});}
 function open(id,from=null){
  const row=get(id);if(!row)return false;close();
  const dlg=document.createElement('dialog');dlg.className='source-sheet';dlg.id='sourceSheet';dlg.setAttribute('aria-labelledby','sourceSheetTitle');dlg.dataset.sheetFor=row.id;dlg.innerHTML=sheetBody(row);
  dlg.addEventListener('cancel',event=>{event.preventDefault();close();});
  dlg.addEventListener('click',event=>{const b=event.target.closest('[data-source-close]');if(!b){if(event.target!==dlg)return;const r=dlg.getBoundingClientRect();if(event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom)return;}if(b?.dataset.task)returnFocus=null;queueMicrotask(close);});
  document.body.append(dlg);sheet=dlg;returnFocus=from;
  if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
  dlg.querySelector('#sourceSheetTitle')?.focus({preventScroll:true});return true;
 }
 let filter='all';
 const groups=[['Field calculators',r=>r.id.startsWith('calc.')||r.id.startsWith('const.')],['Your local targets',r=>r.id.startsWith('company.local.')],['This job’s targets',r=>r.store==='profile'||r.store==='sweep'],['Built-in approximations',r=>r.id.startsWith('app.')]];
 function renderLimits(){
  const host=document.getElementById('limitsList');if(!host)return;
  const shown=rows.filter(r=>filter==='all'||r.label===filter);
  document.querySelectorAll('[data-limits-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.limitsFilter===filter)));
  const count=document.getElementById('limitsCount');if(count)count.textContent=shown.length+' of '+rows.length+' entries';
  host.innerHTML=groups.map(([title,test])=>{const list=shown.filter(test);return list.length?`<h3>${escape(title)}</h3><ul class="limits-list">${list.map(r=>`<li><div><strong>${escape(r.name)}</strong><span class="limits-value${resolve(r.id)?.value===null&&r.kind!=='formula'?' unknown':''}">${escape(display(r.id))}</span></div>${tag(r.id)}</li>`).join('')}</ul>`:'';}).join('')||'<p class="note">No entries have this label.</p>';
 }
 function setFilter(value){if(value!=='all'&&!LABELS.includes(value))return false;filter=value;renderLimits();return true;}
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('limitsPanel');
  if(panel)panel.innerHTML=`<div class="sectionhead"><div><h2>Limits &amp; sources</h2><p class="note tight">Tap a tag for its source, revision, page, units, conditions and the date it was checked.</p></div></div><div class="limits-filters" role="group" aria-label="Show entries by label"><button type="button" data-limits-filter="all" aria-pressed="true">All</button>${LABELS.map(l=>`<button type="button" data-limits-filter="${l}" aria-pressed="false">${LABEL_INFO[l].text}</button>`).join('')}</div><p id="limitsCount" class="note" aria-live="polite"></p><dl class="limits-legend">${LABELS.map(l=>`<div><dt><span class="source-tag source-${l} static">${LABEL_INFO[l].text}</span></dt><dd>${escape(LABEL_INFO[l].help)}</dd></div>`).join('')}</dl><div id="limitsList"></div><p class="note">Company values come from this job’s project profile and meter setup, or from your built-in local preset. A blank value is unknown, not zero. No value here is approved plant criteria. Example targets on older screens, such as Test → References, are not listed yet.</p>`;
  document.addEventListener('click',event=>{
   const tagButton=event.target.closest('[data-threshold]');
   if(tagButton&&tagButton.tagName==='BUTTON'&&!tagButton.closest('dialog.source-sheet')){event.preventDefault();open(tagButton.dataset.threshold,tagButton);return;}
   const f=event.target.closest('[data-limits-filter]');if(f)setFilter(f.dataset.limitsFilter);
  });
  // Company values follow the working job: refresh when a render or project change happens while Limits is shown.
  const refreshShown=()=>{if(document.getElementById('limitsPanel')&&!document.getElementById('limitsPanel').hidden)renderLimits();};
  if(typeof renderAll==='function'){const old=renderAll;renderAll=function(...args){const r=old.apply(this,args);refreshShown();return r;};}
  if(typeof renderProjects==='function'){const old=renderProjects;renderProjects=function(...args){const r=old.apply(this,args);refreshShown();return r;};}
  renderLimits();
 }
 return {init,get,matches,resolve,display,tag,open,close,checkRow,renderLimits,setFilter,rows,LABELS,LABEL_INFO,VERIFICATION,REQUIRED,isOpen:()=>!!sheet};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Thresholds;
