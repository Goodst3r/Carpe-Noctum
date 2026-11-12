/* "Why" cards (build list item 18, 2.0 Alpha build 3): one short card for each of the fourteen "What is …?" monographs in
   SCTE's 293 series, in our own words, each saying why the topic matters in the field, linking to the screen in this app that
   uses it, and citing "SCTE 293-n year". The monographs are free to download from SCTE; this is a summary, not a copy, and
   it does not replace reading them. No input, nothing stored, nothing read from a meter. */
const WhyCards=(()=>{
 const SERIES='SCTE 293';
 /* Titles and years as the SCTE Standards Catalog prints them (read November 11, 2026). */
 const TOPICS=Object.freeze([
  {n:1,year:2024,title:'What is … the Decibel?',name:'The decibel',
   what:'The decibel compares two amounts of power on a logarithmic scale: ten times the base-10 logarithm of their ratio. Two voltages can be compared the same way, with twenty times the logarithm, as long as both are across the same impedance. A bare dB is only ever a ratio, such as the gain of an amplifier or the loss of a splitter. It is never a level.',
   why:'Gain and loss along a run simply add and subtract in dB, and a level needs a reference unit, such as dBmV, before it means anything. A reading in plain dB is a difference between two levels.',
   tools:[{task:'calculators',label:'Test → Calculators'}],tags:['calc.db.dbm']},
  {n:2,year:2024,title:'What is … Velocity of Propagation?',name:'Velocity of propagation',
   what:'Velocity of propagation (VoP) is how fast a signal travels in a particular cable, stated as a percentage of the speed of light in a vacuum. It follows from the cable’s insulation, it is published for each cable type, and water in the insulation changes it.',
   why:'A distance worked out from a ripple spacing or from a TDR echo time depends on it. The same measurement gives a different distance if the wrong VoP is used.',
   tools:[{task:'calculators',label:'Test → Calculators'},{task:'tdr',label:'Test → TDR'}],tags:['calc.ripple.distance','const.speedOfLight']},
  {n:3,year:2024,title:'What is…Return Loss?',name:'Return loss',
   what:'Return loss says how much of a signal is reflected at an impedance mismatch, in dB: the gap between the power sent toward the mismatch and the power that comes back. A bigger number means less reflected power and a better match. It has nothing to do with the loss of the return (upstream) path.',
   why:'Damaged cable, loose or wrong connectors, open ports and water all show up as poor return loss, and reflections bouncing between two mismatches are what draw a standing-wave ripple on a sweep.',
   tools:[{task:'impairments',label:'Test → Impairments'}],tags:[]},
  {n:4,year:2024,title:'What is…Loss (Attenuation)?',name:'Loss (attenuation)',
   what:'Loss is the drop in signal power through a cable or a part, stated in dB. Through a device it is called insertion loss and it is written as a positive number. Three kinds matter in a plant: flat loss (the same at every frequency), cable loss (more at the high end than the low end) and equalizer loss (made to be the opposite of cable’s tilt).',
   why:'Each span’s loss has to be made up by the amplifier after it. Loss that is not in the design, from damage, a wrong pad or equalizer, a filter that should have come out, or leakage, is a fault to find.',
   tools:[{task:'route',label:'Route → Cable route'},{task:'sweep',label:'Test → Predicted levels'}],tags:[]},
  {n:5,year:2024,title:'What is…Unity Gain?',name:'Unity gain',
   what:'Unity gain means each amplifier’s gain equals the loss of the span ahead of it at the same frequency, so signal levels repeat from one amplifier to the next. It applies to the forward path and to the reverse path.',
   why:'It gives the best noise and distortion performance. A wrong pad or equalizer shows up as a level that drifts along the cascade, which is what the station worksheet and the two-pilot balance are for.',
   tools:[{task:'gain',label:'Route → Amp gain'},{task:'station',label:'Route → Station'}],tags:['calc.alignment.balance']},
  {n:6,year:2024,title:'What is… Skin Effect and Skin Depth?',name:'Skin effect and skin depth',
   what:'At radio frequencies current runs in a thin layer at the surface of a conductor, and the layer gets thinner as the frequency rises. Skin depth is the measure of how deep the current reaches. The effect keeps RF signals inside intact cable and keeps unwanted outside signals out, and it is a main reason cable loss grows with frequency: the current has less metal to use.',
   why:'It explains why the high channels lose more than the low ones, and why tilt exists at all.',
   tools:[{task:'route',label:'Route → Cable route'}],tags:[]},
  {n:7,year:2025,title:'What is… Long Loop Automatic Level Control?',name:'Long loop automatic level control',
   what:'Long loop ALC is how a DOCSIS CMTS or CCAP keeps upstream signals arriving at the right level. It measures what it receives from each modem and tells the modem to raise or lower its transmit level.',
   why:'The upstream level at the CMTS input is a set point someone chose, so a return worksheet needs your company’s receiver reference entered, not assumed. After a return pad or reverse gain change the modems re-adjust on their own.',
   tools:[{task:'station',label:'Route → Station'}],tags:[]},
  {n:8,year:2025,title:'What is...S-Parameters?',name:'S-parameters',
   what:'S-parameters describe how a device with ports, such as a splitter, amplifier or filter, behaves when every port is terminated in its nominal impedance, usually measured with a vector network analyzer. They convert to the familiar gain, loss and return loss.',
   why:'Makers publish them for parts, and you meet them when a data file comes with a device. The app has no S-parameter screen.',
   tools:[],tags:[]},
  {n:9,year:2025,title:'What is … RF?',name:'RF',
   what:'RF is radio frequency: the part of the electromagnetic spectrum used for radio, from a few kilohertz up to just below infrared light. The word also names the signals that occupy that range and the rate of an oscillation in it. The coax in a cable plant carries several kinds of RF (telemetry, analog, SC-QAM, OFDM and OFDMA) alongside AC power for the actives.',
   why:'The same RF that belongs inside the cable is interference if it leaks out, and outside RF that gets in is ingress, which is why shielding and good connectors matter.',
   tools:[{task:'frequency',label:'Test → Frequency'},{task:'leakage',label:'Test → Leakage'}],tags:[]},
  {n:10,year:2025,title:'What Is...Signal Level?',name:'Signal level',
   what:'Signal level is the power of a signal, usually written in dBmV (decibels relative to 1 millivolt across 75 ohms), or in dBµV or dBm. What is measured depends on the signal: the peak envelope power of an analog TV visual carrier, the average power across an SC-QAM channel’s occupied bandwidth, the average power per 6 MHz for a downstream OFDM channel, and an average over a narrower bandwidth for upstream OFDMA.',
   why:'Level alone does not say a signal is good, because error rate and MER are separate checks, but a wrong level, or a reading taken on a different basis than the limit, is the first thing to rule out.',
   tools:[{task:'calculators',label:'Test → Calculators'},{task:'docsisHealth',label:'Test → DOCSIS health'}],tags:['calc.db.dbuv','calc.ofdm.bandwidth','const.coax.impedance']},
  {n:11,year:2025,title:'What Is...Noise Figure?',name:'Noise figure',
   what:'Noise figure says, in dB, how much a device degrades the carrier-to-noise ratio of a signal passing through it, measured with only thermal noise at the input at a standard noise temperature. A lower figure is better, and the devices in a cascade add their contributions.',
   why:'It is why an amplifier’s input level matters: if the input is too low, the amplifier’s own noise starts to dominate.',
   tools:[],tags:[]},
  {n:12,year:2025,title:'What is...Signal Leakage Field Strength?',name:'Signal leakage field strength',
   what:'Leakage is described by field strength: how strong a radio wave a leak produces at a stated distance, in volts per meter (microvolts per meter in practice). Rules give limits together with the distance each applies at, and a reading taken with a dipole in dBmV has to be converted to field strength for its frequency.',
   why:'A leakage reading means nothing without its distance and its frequency. The leakage screen restates a reading at 3 m and compares it with the FCC table.',
   tools:[{task:'leakage',label:'Test → Leakage'}],tags:['leak.normalize.distance']},
  {n:13,year:2026,title:'What is … Carrier-to-Noise Ratio?',name:'Carrier-to-noise ratio',
   what:'Carrier-to-noise ratio (CNR) compares a carrier’s power with the noise power in a stated bandwidth, in dB, as read on a spectrum analyzer. The noise reading can need a bandwidth correction, and the analyzer’s own noise floor has to sit below the plant’s.',
   why:'A low CNR points at noise, low levels or a noisy active device. It is a different check from MER and error counts, and a signal can have a fine level and a poor ratio.',
   tools:[],tags:[]},
  {n:14,year:2026,title:'What is …Impedance?',name:'Impedance',
   what:'Impedance is the opposition a circuit offers to alternating current, combining resistance and reactance. The coax in a cable plant is nominally 75 ohms. Wherever the impedance changes, because of damage, water, a loose connector or a wrong part, some of the signal is reflected.',
   why:'A mismatch is where return-loss problems and ripple begin, so 75 ohm parts have to be used all the way through.',
   tools:[{task:'impairments',label:'Test → Impairments'}],tags:['const.coax.impedance']}
 ].map(t=>Object.freeze({...t,tools:Object.freeze(t.tools.map(Object.freeze)),tags:Object.freeze(t.tags)})));
 const cite=t=>SERIES+'-'+t.n+' '+t.year;
 /* Problems with the table: a card must name its document, say what and why, and every tool must be a screen of this app. */
 function selfCheck(taskIds){
  const problems=[],seen=new Set();
  for(const t of TOPICS){
   if(seen.has(t.n))problems.push('duplicate n '+t.n);seen.add(t.n);
   if(!t.title||!t.year||!t.what||t.what.length<80||!t.why||t.why.length<40)problems.push('thin card '+t.n);
   for(const tool of t.tools)if(taskIds&&!taskIds.includes(tool.task))problems.push('card '+t.n+' links to an unknown screen '+tool.task);
  }
  if(TOPICS.length!==14)problems.push('expected 14 topics');
  return problems;
 }
 return {SERIES,TOPICS,cite,selfCheck};
})();

const WhyCardsUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 let initialized=false;
 function card(t){
  const tools=t.tools.length?`<p class="why-tools"><strong>In the app:</strong> ${t.tools.map(x=>`<button type="button" class="why-go" data-why-go="${escape(x.task)}">${escape(x.label)}</button>`).join(' ')}</p>`:'<p class="note tight why-tools">The app has no screen for this topic yet.</p>';
  return `<details class="why-card" data-why="${t.n}"><summary><span class="why-name">${escape(t.name)}</span> <span class="why-cite">${escape(WhyCards.cite(t))}</span></summary><div class="why-body"><p>${escape(t.what)}</p><p><strong>Why it matters in the field.</strong> ${escape(t.why)}</p>${tools}${t.tags.length?`<p class="why-tags">${t.tags.map(id=>tag(id,t.name)).join(' ')}</p>`:''}<p class="note tight why-source">Our own summary of ${escape(WhyCards.cite(t))}, “${escape(t.title)}”, one of SCTE’s free technical monographs. Read it for the full explanation.</p></div></details>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Why cards</h2><p class="note tight">Fourteen short cards on the basics behind the numbers in this app, one for each “What is …?” monograph in SCTE’s 293 series. Each is in our own words, says why the topic matters in the field and points at the screen that uses it. They are a summary, not a copy: SCTE’s monographs are free to download and are the place to read the full explanation. Nothing here is typed, stored or read from a meter.</p></div></div><div class="why-list">${WhyCards.TOPICS.map(card).join('')}</div>`;
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('whyPanel');if(!panel)return;
  panel.innerHTML=markup();
  panel.addEventListener('click',event=>{
   const b=event.target.closest('[data-why-go]');if(!b||!panel.contains(b))return;
   if(typeof WorkflowUI!=='undefined')WorkflowUI.go(b.dataset.whyGo);
  });
 }
 return {init,markup};
})();
