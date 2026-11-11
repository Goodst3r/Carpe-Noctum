/* High-split and 1.8 GHz reference, with what is publicly documented about Remote PHY bring-up (build list item 17,
   2.0 Alpha build 3). A reading aid, not a procedure: it holds no meter input, stores nothing and reads nothing from a
   node or a CCAP core. Every statement names the document and the issue it was read in, and where in it. Wording is our own.
   Nothing here is invented: where a maker's guide is not public (Vecima's are behind its customer portal) the screen
   says so instead of filling the gap. */
const HighSplit=(()=>{
 /* The documents read. `issue` is what the document itself prints. */
 const SOURCES=Object.freeze({
  phy40:{title:'CableLabs CM-SP-PHYv4.0, DOCSIS 4.0 Physical Layer Specification',issue:'I08, September 28, 2026 (ISSUED)'},
  phy31:{title:'CableLabs CM-SP-PHYv3.1, DOCSIS 3.1 Physical Layer Specification',issue:'I20, April 19, 2023 (ISSUED)'},
  scte300:{title:'SCTE 300 2024, Best Practices for Migrating to DOCSIS 4.0 (SCTE Operational Practice)',issue:'single release dated December 2, 2024'},
  scte294:{title:'SCTE 294 2024r1, Understanding and Troubleshooting Cable Upstream RF Spectrum',issue:'catalog page only; the document itself was not read'},
  scte2020:{title:'SCTE-ISBE EXPO 2020 paper, Leakage in a High Split World: Detecting and Measuring Upstream Leakage Levels in a One Gbps Symmetrical High Split HFC Network',issue:'copyright 2020; no revision number printed'},
  scte2021:{title:'SCTE paper, Leakage Detection in a High-Split World: Industry Progress Toward a Viable Solution',issue:'copyright 2021; no revision number printed'},
  viavi:{title:'VIAVI Solutions web page, What is High-Split Leakage?',issue:'undated page, read November 11, 2026 (a maker’s view, not a standard)'},
  ossi31:{title:'CableLabs CM-SP-CCAP-OSSIv3.1, CCAP Operations Support System Interface',issue:'I30, April 29, 2026 (contents list and revision history only)'},
  cfr610:{title:'47 CFR 76.610, Operation in the frequency bands 108–137 MHz and 225–400 MHz',issue:'text read November 11, 2026 (Cornell LII and govinfo copies; the eCFR page did not load)'},
  cfr611:{title:'47 CFR 76.611, Cable television basic signal leakage performance criteria',issue:'eCFR text read November 11, 2026'},
  cfr614:{title:'47 CFR 76.614, Cable television system regular monitoring',issue:'eCFR text read November 11, 2026'},
  cfr616:{title:'47 CFR 76.616, Operation near certain aeronautical and marine emergency radio frequencies',issue:'eCFR text read November 11, 2026'},
  rphy:{title:'CableLabs CM-SP-R-PHY, Remote PHY Specification',issue:'I22, August 19, 2026'},
  rdepi:{title:'CableLabs CM-SP-R-DEPI, Remote Downstream External PHY Interface',issue:'I18, August 26, 2026'},
  rdti:{title:'CableLabs CM-SP-R-DTI, Remote DOCSIS Timing Interface',issue:'I08, March 23, 2020'},
  roob:{title:'CableLabs CM-SP-R-OOB, Remote Out-of-Band',issue:'I15, August 26, 2026'},
  rossi:{title:'CableLabs CM-SP-R-OSSI, Remote PHY OSS Interface',issue:'I23, June 11, 2025'},
  vecimaSupport:{title:'Vecima Networks, Customer and Product Support page',issue:'undated page, read November 11, 2026'},
  vecimaBrief:{title:'Vecima Entra EN9000 Generic Access Platform product brief',issue:'publish date September 2026 (a product brief, not a procedure)'},
  ciscoLeds:{title:'Cisco, Monitoring the Cisco Remote-PHY Solution (RPD LEDs)',issue:'Updated August 13, 2018'},
  ciscoGs7000:{title:'Cisco 1.2 GHz GS7000 Remote PHY Module Compatible 2X2 Segmentable Node Installation and Configuration Guide',issue:'chapter prints no date; Cisco lists the book as September 28, 2018'},
  cisco2x2:{title:'Cisco 2x2 Remote-PHY Device Hardware Installation Guide',issue:'First Published February 28, 2019'},
  teleste:{title:'Teleste DAN3 User Manual',issue:'Revision 008, copyright 2023 (a distributor-hosted copy)'},
  harmonic:{title:'Harmonic CableOS Ripple-2 Node (COS-RPL2) Installation Guide',issue:'Cert. Revision A, marked DRAFT (a ManualsLib copy; only some pages read)'}
 });

 /* DOCSIS 4.0 FDD band edges, MHz. Each edge is one number or a [low, high] range as the table prints it. */
 const PLANS=Object.freeze([
  {id:'sub',name:'Sub-split and extended sub-split',upper:[42],dsLow:[50,54],dsHigh:[1584,1590],applies:'node only',src:'phy40',loc:'Section 7.3.2, Table 29'},
  {id:'mid',name:'Mid-split',upper:[85],dsLow:[108],dsHigh:[1644],applies:'node only',src:'phy40',loc:'Section 7.3.2, Table 29; Figure 29 (legacy transition band 85 to 108 MHz)'},
  {id:'high',name:'High-split',upper:[204],dsLow:[258],dsHigh:[1794],applies:'node and cable modem',src:'phy40',loc:'Section 7.3.2, Table 29; Figure 29 (HS transition band)'}
 ].map(Object.freeze));
 /* Ultra-high splits: upstream upper edge and the range the downstream lower edge may take. */
 const ULTRA=Object.freeze([
  {id:'uhs300',upper:300,dsLow:[300,372]},{id:'uhs396',upper:396,dsLow:[396,492]},{id:'uhs492',upper:492,dsLow:[492,606]},{id:'uhs684',upper:684,dsLow:[684,834]}
 ].map(Object.freeze));
 const ULTRA_TOP=1794;
 /* DOCSIS 3.1 cable modem requirements, MHz. */
 const D31=Object.freeze({upstreamEdges:Object.freeze([42,65,85,117,204]),downstreamLowMust:258,downstreamDemodulateTo:1218,downstreamOptionalTo:1794});

 /* Derived arithmetic (our own, shown as derived): the gap between the upstream and downstream edges of a split, and the
    downstream width where one edge is a single number. */
 function range(r){return r.length===1?String(r[0]):r[0]+' to '+r[1];}
 function gaps(){
  return PLANS.map(p=>({id:p.id,min:p.dsLow[0]-p.upper[0],max:p.dsLow[p.dsLow.length-1]-p.upper[0]}));
 }
 function widths(){
  return PLANS.filter(p=>p.dsLow.length===1&&p.dsHigh.length===1).map(p=>({id:p.id,width:p.dsHigh[0]-p.dsLow[0]}));
 }
 /* The aeronautical band (108 to 137 MHz): which direction it lies in for each plan. */
 const AERO_BAND=Object.freeze([108,137]);
 function aeroBandSide(plan){
  const lo=AERO_BAND[0],hi=AERO_BAND[1],up=plan.upper[0],dsLow=plan.dsLow[0];
  if(hi<=up)return 'upstream';
  if(lo>=plan.dsLow[plan.dsLow.length-1])return 'downstream';
  if(lo>=up&&hi<=dsLow)return 'in the gap between them';
  return 'split between the two';
 }

 const AERO=Object.freeze([
  {id:'inside',text:'On a 204/258 MHz plant the upstream reaches past the whole 108 to 137 MHz aeronautical band, so that band now carries subscribers’ cable-modem signals. They are strongest at the home and the drop and weakest at the node or headend, which is the reverse of the downstream case, so a downstream test tone no longer stands for what leaks in that band. On a 42/54 MHz plant the band is downstream; with a mid-split (85/108) it is downstream too.',src:'scte2020',loc:'Section 1 (Introduction, p. 4) and Section 6 (pp. 9 and 10)'},
  {id:'method',text:'The approach the industry papers settle on is a test signal the cable modems send on request: an OFDMA upstream data profile (OUDP) burst, scheduled by the CCAP or the node, in a test region the operator chooses in or near the aeronautical band. A field leakage detector is tuned to that region and looks for the known pattern. Expressed for a technician: the detector’s frequency and profile settings must match what operations configured on the CCAP. Those settings come from your company’s leakage group; this screen gives none.',src:'scte2021',loc:'Section 2 (p. 3) and Section 4.2 (p. 11)'},
  {id:'region',text:'The same paper advises putting the test region just above the aeronautical band, so the test itself does not put energy into the band.',src:'scte2021',loc:'Section 3.2 (p. 7)'},
  {id:'alt',text:'The 2020 paper also looked at dedicated test carriers sent by the modems and at a downstream tone. It says the first are outside DOCSIS 3.1 and today’s modems cannot make them without new firmware or hardware, and it found the downstream tone hard to tie to upstream levels. It names the OUDP burst as the ideal signal.',src:'scte2020',loc:'Section 7 (7.1 and 7.2) and the Conclusions'},
  {id:'maker',text:'One test-equipment maker lists four options for high-split leakage and favours OUDP bursts, and says it sees no sign the FCC will relax the aeronautical-band rules. That is a maker’s position, not a standard, and the screen offers it only as a pointer.',src:'viavi',loc:'Sections “High-Split Leakage”, “Monitoring” and “What is OUDP Leakage Detection”'},
  {id:'ossi',text:'CableLabs defines how a CCAP is told to run a leakage test session in its OSSI specification, section 9.4, Leakage Detection Test Interface. Only that heading and the revision history were read; the requirement text was not.',src:'ossi31',loc:'Contents list, section 9.4'},
  {id:'gap',text:'No document read tells a technician in so many words whether to inject a downstream leakage tag into 108 to 137 MHz on a node with a 204 MHz upstream. Ask your leakage group before putting any test signal in that band.',src:null,loc:'Searched; nothing found'}
 ]);

 /* The rules: stated in our words, with the section. The numbers shown are registered rows in Limits. */
 const RULES=Object.freeze([
  {id:'scope',text:'The aeronautical-band leakage rules apply to a cable operator that carries, anywhere in its distribution system and for any purpose, an analog carrier at 100 microwatts or more across 25 kHz in any 160 microseconds, or a digital carrier at 75.85 microwatts across 25 kHz in any 160 microseconds, in 108 to 137 MHz or 225 to 400 MHz.',src:'cfr610',loc:'Section 76.610',registry:'aero.fcc.76610.scope'},
  {id:'cli',text:'To operate in those bands the operator shows either a cumulative leakage index of 64 or less (at least 75% of the plant, tested at least once a year) or an airspace measurement not above 10 µV/m at 450 m altitude. The test signal is an unmodulated analog signal in 108 to 137 MHz, or one whose results correlate to it.',src:'cfr611',loc:'Section 76.611(a)(1), (a)(2) and (b)',registry:'leak.cli.limit'},
  {id:'monitor',text:'Regular monitoring must cover substantially all of the plant every three months, with equipment and procedures able to find a leak of 20 µV/m or more at 3 m, and such a leak in the aeronautical bands is to be noted and repaired in a reasonable time. Records follow section 76.1706.',src:'cfr614',loc:'Section 76.614 and Note 1',registry:'leak.fcc.aero.repair'},
  {id:'exclusion',text:'A carrier or signal component capable of 10 to the power of −5 watts peak or more may not be anywhere in the system within 100 kHz of 121.5 MHz, or within 50 kHz of 156.8 MHz or 243.0 MHz; section 76.616 also limits the 405.925 to 406.176 MHz range. 121.5 MHz lies inside the 108 to 137 MHz band.',src:'cfr616',loc:'Section 76.616(a) and (b)',registry:'aero.fcc.76616.exclusion'}
 ]);

 /* Remote PHY bring-up: what the specification says happens, in order. It is automatic; the screen says who does each step
    and what is not defined for a technician to read at the node. */
 const RPHY_STEPS=Object.freeze([
  {id:'local',who:'The RPD alone',text:'Starts up, records a reboot event as early as it can and, if it has saved settings, restores them. Some RF output (power and pilot tones are the spec’s examples) can therefore come back before any contact with a core. Then it waits for an Ethernet link on a core-facing interface; no link in time is an event and the RPD tries a soft reset.',src:'rphy',loc:'Sections 6.3, 6.3.1 and 6.13.1'},
  {id:'auth',who:'The RPD and the network’s authentication server',text:'Network authentication (802.1X) comes first when the network uses it, before link discovery and DHCP. An RPD that never gets a request from the network carries on as if the network were unauthenticated; a rejection is an event and it waits before trying again.',src:'rphy',loc:'Sections 6.4.4.5, 6.4.4.6, 6.4.4.8, 6.5.2, 6.13.2 and 6.13.3'},
  {id:'address',who:'The RPD and the network’s DHCP server',text:'Address assignment with DHCPv4, DHCPv6 or SLAAC. The answer lists the CCAP cores to contact, with the active principal core first, and the RPD builds its table of cores from the first list it receives after a reset.',src:'rphy',loc:'Sections 6.6, 6.6.1 and 6.6.1.1 (their text was read in the earlier issue I17; I22’s contents list has the same sections)'},
  {id:'time',who:'The RPD and a time server',text:'Time of day from a time server named in the DHCP answer. Until it has the time the RPD stamps events from 1 January 1970; when it first locks to PTP it also takes the time from PTP. Without the time it cannot check a core’s certificate dates.',src:'rphy',loc:'Sections 6.7.1 and 6.7.2 (their text was read in the earlier issue I18; I22’s contents list has the same sections)'},
  {id:'gcp',who:'The RPD, which starts the connection, and the principal core',text:'The control channel. The RPD works down its list of cores, runs mutual authentication where the configuration requires it, opens the control connection to the principal core and announces itself. The core answers and configures the RPD, and the RPD finishes its first configuration with the principal core before it takes any from an auxiliary core.',src:'rphy',loc:'Sections 6.8.2, 6.8.4, 6.8.7.1 and 6.13.4 to 6.13.8 (read in I17 and a later issue; not re-read in I22 itself)'},
  {id:'tunnels',who:'The CCAP core (it starts) and the RPD',text:'The L2TPv3 data tunnels. The core sets up a control connection after the control channel is up, then one session per channel; data starts to flow for a channel when its session setup completes. The RPD cannot start these itself.',src:'rdepi',loc:'Sections 7.1, 7.4.1.1 and 7.4.2.1'},
  {id:'timing',who:'The RPD and its timing source',text:'Timing. An RPD must be able to act as a node-side slave of a 1588 timing source. The Remote PHY OSS specification defines events for the clock reaching sync, losing it, running too long in holdover and failing to reach its master; how a node shows them is the maker’s choice.',src:'rdti',loc:'Section 7.2 (and R-OSSI I23, Table 312, for the events)'},
  {id:'operational',who:'The principal core',text:'The core tells the RPD to move to operational. RF activity is then controlled port by port and channel by channel by the core; the RPD must also generate downstream pilot tones under the core’s control, and they are meant to be present continuously unless an operator removes one for maintenance.',src:'rphy',loc:'Sections 6.10.1 to 6.10.3 (and R-OOB I15, section 9.1)'}
 ]);
 const RPHY_VISIBILITY=Object.freeze({
  text:'The RPD keeps a local event log that the principal core can read; the specification does not say how or whether a node shows its state on its own panel, so lights, status pages and commands are each maker’s own design.',
  src:'rossi',loc:'Section 9.2.2 and 9.2.2.1.1'
 });
 /* Public, node-side documents of other makers, listed so a technician knows what exists. Their lights and procedures do not carry over to another maker's node. */
 const OTHER_MAKERS=Object.freeze([
  {maker:'Cisco',src:'ciscoLeds',what:'a table of what the RPD’s lights show',scope:'Cisco RPD'},
  {maker:'Cisco',src:'ciscoGs7000',what:'a quick start for the GS7000 intelligent node: link, address, software download and level and tilt steps',scope:'Cisco GS7000 iNode'},
  {maker:'Cisco',src:'cisco2x2',what:'monitoring the 2x2 RPD, with its light tables',scope:'Cisco 2x2 RPD'},
  {maker:'Teleste',src:'teleste',what:'a section on the RPD diagnostic lights (1.3.3.14)',scope:'Teleste DAN3'},
  {maker:'Harmonic',src:'harmonic',what:'installation steps and light tables (chapter 7), draft copy',scope:'Harmonic Ripple-2'}
 ]);
 const VECIMA=Object.freeze({
  text:'Vecima says its installation and configuration guides, user manuals and release notes are in its Customer Portal, which needs a login. The public items found are product briefs. No Vecima commissioning procedure could be read, so this screen does not describe one, and it does not borrow another maker’s steps or lights for a Vecima node.',
  src:'vecimaSupport',loc:'“Product Documentation” block',
  briefSrc:'vecimaBrief'
 });

 /* Every source id used by a statement must be in SOURCES and every statement must carry a locator. */
 function selfCheck(){
  const problems=[];
  const used=[...AERO,...RULES,...RPHY_STEPS,RPHY_VISIBILITY,VECIMA,...PLANS,...OTHER_MAKERS];
  for(const item of used){
   if(item.src===null)continue;
   if(!Object.prototype.hasOwnProperty.call(SOURCES,item.src))problems.push('unknown source '+item.src);
   else if(!SOURCES[item.src].issue)problems.push('source without an issue '+item.src);
   if(item.loc===undefined&&!item.what)problems.push('statement without a locator: '+(item.id||item.maker));
  }
  return problems;
 }
 return {SOURCES,PLANS,ULTRA,ULTRA_TOP,D31,AERO,RULES,RPHY_STEPS,RPHY_VISIBILITY,OTHER_MAKERS,VECIMA,AERO_BAND,range,gaps,widths,aeroBandSide,selfCheck};
})();

const HighSplitUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const cite=(src,loc)=>{const s=HighSplit.SOURCES[src];return s?`<span class="hs-source">${escape(s.title)} — ${escape(s.issue)}${loc?'; '+escape(loc):''}</span>`:`<span class="hs-source">${escape(loc||'')}</span>`;};
 let initialized=false;
 function planRows(){
  return HighSplit.PLANS.map(p=>`<tr><th scope="row">${escape(p.name)}</th><td>5 to ${HighSplit.range(p.upper)}</td><td>${HighSplit.range(p.dsLow)}</td><td>${HighSplit.range(p.dsHigh)}</td><td>${escape(p.applies)}</td></tr>`).join('')
   +HighSplit.ULTRA.map(u=>`<tr><th scope="row">Ultra-high split, ${u.upper} MHz</th><td>5 to ${u.upper}</td><td>${HighSplit.range(u.dsLow)}</td><td>${HighSplit.ULTRA_TOP}</td><td>see Table 29</td></tr>`).join('');
 }
 function gapRows(){
  const names={sub:'Sub-split',mid:'Mid-split',high:'High-split'};
  return HighSplit.gaps().map(g=>`<tr><th scope="row">${names[g.id]}</th><td>${g.min===g.max?g.min:g.min+' to '+g.max} MHz</td></tr>`).join('');
 }
 function sideRows(){
  const names={sub:'42/54 MHz plant (sub-split)',mid:'85/108 MHz (mid-split)',high:'204/258 MHz plant (high-split)'};
  return HighSplit.PLANS.map(p=>`<tr><th scope="row">${names[p.id]}</th><td>${escape(HighSplit.aeroBandSide(p))}</td></tr>`).join('');
 }
 function markup(){
  const d=HighSplit.D31,w=HighSplit.widths();
  return `<div class="sectionhead"><div><h2>High split</h2><p class="note tight">A reading aid for the 204/258 MHz plant and for what is public about Remote PHY bring-up. It takes no input, reads nothing from a node, meter or core and stores nothing. Each statement names the document and the issue it was read in. It is not a procedure and does not replace your node maker’s guide or your company’s.</p></div></div>
<section class="calc-card hs-card" aria-labelledby="hsBandsTitle"><div class="calc-card-head"><h3 id="hsBandsTitle">Band plans</h3>${tag('band.docsis40.fdd','DOCSIS 4.0 band plans')}</div>
<p class="note tight">Where the upstream ends and the downstream begins, in MHz, as the DOCSIS 4.0 specification prints them for frequency-division duplex (FDD). The 42/54 MHz and 204/258 MHz plants are different plans and stay separate here, as in the rest of the app.</p>
<div class="table-scroll" tabindex="0" role="region" aria-label="DOCSIS 4.0 FDD band edges"><table class="hs-table"><thead><tr><th scope="col">Split</th><th scope="col">Upstream</th><th scope="col">Downstream starts</th><th scope="col">Downstream ends</th><th scope="col">Applies to</th></tr></thead><tbody>${planRows()}</tbody></table></div>
<p class="note tight">${cite('phy40','Section 7.3.2, Table 29 and Table 31')}</p>
<h4>The gap between the two directions ${tag('band.derived.gaps','derived gaps')}</h4>
<div class="table-scroll" tabindex="0" role="region" aria-label="Gap between upstream and downstream"><table class="hs-table"><thead><tr><th scope="col">Split</th><th scope="col">Downstream start minus upstream end</th></tr></thead><tbody>${gapRows()}</tbody></table></div>
<p class="note tight">Our own subtraction of the table’s edges. The specification calls these spans transition bands (it names the 85 to 108 MHz span the legacy transition band and 204 to 258 MHz the HS transition band), not guard bands. The mid-split and high-split downstream bands are ${[...new Set(w.map(x=>x.width))].join(' and ')} MHz wide${new Set(w.map(x=>x.width)).size===1?' in both cases':''} (top edge minus start); the sub-split edges are ranges, so no single width follows for it. No document read gives 102 MHz as a mid-split downstream edge: the specification says 108.</p>
<h4>What a DOCSIS 3.1 modem must support ${tag('band.docsis31.edges','DOCSIS 3.1 band edges')}</h4>
<ul class="hs-list"><li>Upstream upper edges: one or more of ${d.upstreamEdges.join(', ')} MHz, at least one of them 85 MHz or more.</li><li>Downstream: it must work with a lower edge of ${d.downstreamLowMust} MHz and demodulate to ${d.downstreamDemodulateTo} MHz. Reaching ${d.downstreamOptionalTo} MHz is optional in DOCSIS 3.1 and required of DOCSIS 4.0 FDD devices.</li></ul>
<p class="note tight">${cite('phy31','Sections 7.2.1, 7.2.3 and 7.2.4, and Table 4')}. Passing a sweep to 993 MHz does not certify a plant for 1.8 GHz.</p>
<p class="note tight">SCTE 300 2024 (Best Practices for Migrating to DOCSIS 4.0) covers readiness tests and measurements and says it does not define band edges; it reproduces tables from an older PHY issue (I06), so use the specification above for edges. SCTE 294 2024r1 (upstream spectrum troubleshooting) was found only as a catalog entry. ${cite('scte300','Cover, Scope and Document Release History')}</p></section>
<section class="calc-card hs-card" aria-labelledby="hsAeroTitle"><div class="calc-card-head"><h3 id="hsAeroTitle">The aeronautical band and leakage</h3>${tag('aero.band.side','aeronautical band by split')}</div>
<p class="note tight">The 108 to 137 MHz aeronautical band, and the plan edges above, put it in a different place on each plant:</p>
<div class="table-scroll" tabindex="0" role="region" aria-label="Where 108 to 137 MHz falls"><table class="hs-table"><thead><tr><th scope="col">Plan</th><th scope="col">108 to 137 MHz is</th></tr></thead><tbody>${sideRows()}</tbody></table></div>
<ul class="hs-list">${HighSplit.AERO.map(a=>`<li>${escape(a.text)} ${cite(a.src,a.loc)}</li>`).join('')}</ul>
<h4>The rules, in plain words</h4>
<ul class="hs-list">${HighSplit.RULES.map(r=>`<li>${escape(r.text)} ${tag(r.registry,r.loc)} ${cite(r.src,r.loc)}</li>`).join('')}</ul>
<p class="note tight">Official leakage results belong to your engineering group. The Leakage screen is a notebook and calculator, not a filing.</p></section>
<section class="calc-card hs-card" aria-labelledby="hsRphyTitle"><div class="calc-card-head"><h3 id="hsRphyTitle">Remote PHY bring-up</h3></div>
<p class="note tight">What the CableLabs specifications say an RPD does after power-up, in order. It is automatic. Most of it is done with the network and the CCAP core, and none of it is a check you can make with a meter at the node; use it to know what the core operator is waiting for.</p>
<ol class="hs-steps">${HighSplit.RPHY_STEPS.map(s=>`<li><strong>${escape(s.who)}.</strong> ${escape(s.text)} ${cite(s.src,s.loc)}</li>`).join('')}</ol>
<p class="note tight"><strong>What you can see at the node.</strong> ${escape(HighSplit.RPHY_VISIBILITY.text)} ${cite(HighSplit.RPHY_VISIBILITY.src,HighSplit.RPHY_VISIBILITY.loc)}</p>
<h4>Vecima nodes</h4>
<p class="status warning">${escape(HighSplit.VECIMA.text)} ${cite(HighSplit.VECIMA.src,HighSplit.VECIMA.loc)}</p>
<p class="note tight">When you have the Vecima guide your company holds, write its title and revision on your run sheet; any optics, timing, registration and RF checks come from that document.</p>
<h4>Other makers’ public guides</h4>
<p class="note tight">Listed so you know they exist. Their lights and steps are for their own hardware and do not carry over to another maker’s node.</p>
<ul class="hs-list">${HighSplit.OTHER_MAKERS.map(m=>`<li>${escape(m.maker)}, ${escape(m.scope)}: ${escape(m.what)}. ${cite(m.src,'')}</li>`).join('')}</ul></section>`;
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('highSplitPanel');if(!panel)return;
  panel.innerHTML=markup();
 }
 return {init,markup};
})();
