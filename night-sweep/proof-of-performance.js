/* FCC proof-of-performance reference card (build list item 20, 2.0 Alpha build 3). A reading aid for the technical
   requirements and testing rules of 47 CFR Part 76 that an operator's proof-of-performance tests are measured against:
   how often and where to test, what the analog-channel limits are, how the main measurements are made and how long the
   records are kept. Reference only: it takes no input, stores nothing, and official results belong to engineering. The rule
   text was read on the eCFR on November 11, 2026; wording here is our own. */
const ProofOfPerformance=(()=>{
 const RULES=Object.freeze({
  s601:'47 CFR 76.601, Performance tests',
  s605:'47 CFR 76.605, Technical standards',
  s609:'47 CFR 76.609, Measurements',
  s1704:'47 CFR 76.1704, Proof-of-performance test data'
 });
 /* One row per requirement. `limit` is how the screen states it; `registry` is the Limits row that carries the source, and
    `rule` is the section. The numbers in `limit` are checked against the rule text by qa/build3-pop.test.cjs. */
 const GROUPS=Object.freeze([
  {id:'when',title:'How often, where and on what',items:Object.freeze([
   {id:'frequency',what:'How often',limit:'At least twice each calendar year, at intervals of no more than seven months',rule:'s601',loc:'76.601(b)',registry:'fcc.pop.frequency'},
   {id:'points',what:'How many test points',limit:'Six widely separated points for a system of 1,000 to 12,500 subscribers, and one more for every further 12,500 subscribers or fraction of that; at least one third of the points are the terminals farthest from the system input',rule:'s601',loc:'76.601(b)(1)',registry:'fcc.pop.points'},
   {id:'channels',what:'How many channels',limit:'Five channels where the activated capacity is under 550 MHz, ten at 550 MHz or more, chosen to represent the whole system; the visual level, its variation and the aural level are measured on every analog channel',rule:'s601',loc:'76.601(b)(2)',registry:'fcc.pop.channels'},
   {id:'small',what:'Small systems',limit:'Under 1,000 subscribers the performance-test paragraphs do not apply, but a system that uses spectrum beyond over-the-air TV and FM must still do the signal-leakage tests and monitoring, and its leakage log is kept five years',rule:'s601',loc:'76.601(d)',registry:'fcc.pop.records'}
  ])},
  {id:'limits',title:'The analog-channel limits (measured at a subscriber terminal unless noted)',items:Object.freeze([
   {id:'level',what:'Visual signal level',limit:'Not less than 0 dBmV (1 millivolt across 75 ohms) at the terminal, and not less than +3 dBmV at the end of a 100 ft (30 m) drop',rule:'s605',loc:'76.605(b)(3)',registry:'fcc.pop.level'},
   {id:'variation',what:'Level variation',limit:'Measured at the end of a 30 m drop: no more than 8 dB over any six months (four tests in six-hour steps over 24 hours in July or August and again in January or February); within 3 dB of any carrier within 6 MHz, and within 10 dB of any other channel on a system whose upper frequency limit is up to 300 MHz, plus 1 dB for each further 100 MHz of upper limit',rule:'s605',loc:'76.605(b)(4)',registry:'fcc.pop.variation'},
   {id:'aural',what:'Aural carrier',limit:'4.5 MHz ± 5 kHz above the visual carrier, and 10 to 17 dB below the visual level',rule:'s605',loc:'76.605(b)(2) and (5)',registry:'fcc.pop.aural'},
   {id:'response',what:'Frequency response',limit:'Within ± 2 dB from 0.75 to 5.0 MHz above the lower channel edge',rule:'s605',loc:'76.605(b)(6)',registry:'fcc.pop.response'},
   {id:'cnr',what:'Carrier-to-noise',limit:'Visual carrier to system noise not less than 43 dB',rule:'s605',loc:'76.605(b)(7)',registry:'fcc.pop.cnr'},
   {id:'coherent',what:'Coherent disturbances',limit:'Visual level to intermodulation, distortion products and discrete interference not less than 51 dB (47 dB for those on the visual carrier in a coherent system), measured with modulated carriers',rule:'s605',loc:'76.605(b)(8)',registry:'fcc.pop.coherent'},
   {id:'isolation',what:'Terminal isolation',limit:'Not less than 18 dB, and enough to keep reflections from an open or shorted terminal from causing a visible picture impairment at any other terminal. Terminal-isolation measurements are not required when the maker’s specifications, based on a representative sample of at least 500 subscriber taps, or laboratory tests by or for the operator on a representative sample of at least 50 taps, show the 18 dB standard is met; that evidence is attached to each proof-of-performance record (76.609(g), which still refers to the standard as 76.605(a)(9))',rule:'s605',loc:'76.605(b)(9) and 76.609(g)',registry:'fcc.pop.isolation'},
   {id:'hum',what:'Hum and low-frequency disturbance',limit:'Peak-to-peak variation of the visual level no more than 3 percent',rule:'s605',loc:'76.605(b)(10)',registry:'fcc.pop.hum'},
   {id:'headend',what:'At the headend (every third year)',limit:'Chroma delay within 170 ns, differential gain within ± 20 percent, differential phase within ± 10 degrees',rule:'s605',loc:'76.605(b)(11) and 76.601(b)(2)(ii)',registry:'fcc.pop.headend'}
  ])},
  {id:'digital',title:'Digital channels and leakage',items:Object.freeze([
   {id:'qam',what:'QAM channels',limit:'A system that carries video on QAM channels follows ANSI/SCTE 40 2016. Its requirements are not listed here',rule:'s605',loc:'76.605(a)',registry:null},
   {id:'leakage',what:'Signal leakage',limit:'Measured with a half-wave dipole 3 m from the leak and limited by the table in 76.605(c); see Field → Leakage',rule:'s605',loc:'76.605(c) and 76.609(h)',registry:'leak.fcc.analog.near'}
  ])},
  {id:'how',title:'How it is measured and kept',items:Object.freeze([
   {id:'noise',what:'Noise',limit:'Measured with a calibrated field-strength meter on a matched termination in successive steps over a 4 MHz band centered in the channel. One reading corrected by the ratio of 4 MHz to the meter’s noise bandwidth may be used only if it has been established that the noise level is constant within that band',rule:'s609',loc:'76.609(e)',registry:'fcc.pop.noise'},
   {id:'conditions',what:'Test conditions',limit:'Amplifiers at normal gain, pilot tones and other signals at normal levels, other channels left on while one channel’s signal is replaced by a termination; the procedures in the rule are examples, not mandatory',rule:'s609',loc:'76.609(a) and (b)',registry:null},
   {id:'record',what:'Test report',limit:'Includes the instruments with make, model and latest calibration date, the procedure used and the qualifications of the person testing',rule:'s601',loc:'76.601(b)(1)',registry:null},
   {id:'retention',what:'How long it is kept',limit:'At the local business office for at least five years, available to the Commission or the franchising authority on request',rule:'s1704',loc:'76.1704(a)',registry:'fcc.pop.records'}
  ])}
 ]);
 /* Problems with the table: every item names a rule section and a locator, every registry id is distinct per limit. */
 function selfCheck(){
  const problems=[],seen=new Set();
  for(const g of GROUPS)for(const i of g.items){
   if(!Object.prototype.hasOwnProperty.call(RULES,i.rule))problems.push('unknown rule '+i.rule);
   if(!i.loc||!/^76\./.test(i.loc))problems.push('locator '+i.id);
   if(!i.what||!i.limit)problems.push('thin item '+i.id);
   if(seen.has(i.id))problems.push('duplicate '+i.id);seen.add(i.id);
  }
  return problems;
 }
 return {RULES,GROUPS,selfCheck};
})();

const ProofOfPerformanceUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 let initialized=false;
 function group(g){
  return `<section class="calc-card pop-card" aria-labelledby="pop-${g.id}"><div class="calc-card-head"><h3 id="pop-${g.id}">${escape(g.title)}</h3></div><div class="table-scroll" tabindex="0" role="region" aria-label="${escape(g.title)}"><table class="hs-table pop-table" role="table"><thead><tr role="row"><th scope="col" role="columnheader">What</th><th scope="col" role="columnheader">The rule</th><th scope="col" role="columnheader">Where</th></tr></thead><tbody>${g.items.map(i=>`<tr role="row"><th scope="row" role="rowheader">${escape(i.what)}</th><td role="cell">${escape(i.limit)} ${i.registry?tag(i.registry,i.what):''}</td><td role="cell">${escape(ProofOfPerformance.RULES[i.rule])}, ${escape(i.loc)}</td></tr>`).join('')}</tbody></table></div></section>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>FCC proof of performance</h2><p class="note tight">A reference for the technical requirements the FCC’s cable rules (47 CFR Part 76) set and how an operator’s proof-of-performance tests are measured against them. It takes no input and stores nothing. <strong>Official results belong to your engineering group</strong>; this card does not make or record a test and is not a filing. The limits are those for analog (NTSC or similar) channels and are in the rule text as read on the eCFR on November 11, 2026; ask engineering what applies to your system and your franchise. SCTE 204 2025, <em>FCC Proof-of-Performance Checklist for Analog and Digital Signals</em>, is the industry’s checklist for this and is the place to read how to carry out the tests (it was found in the SCTE catalog and not read).</p></div></div>${ProofOfPerformance.GROUPS.map(group).join('')}`;
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('popPanel');if(!panel)return;
  panel.innerHTML=markup();
 }
 return {init,markup};
})();
