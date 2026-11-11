/* Threshold and source registry (build list item 1, 2.0 Alpha build 3).
   One row for each limit, target, constant or formula used by the field calculators,
   the job's acceptance criteria and meter setup, the built-in local preset and the
   engine approximations. Example targets on older screens (Test → References) are
   not registered yet. Every row
   carries one label (spec, expert, company or unknown), its source, revision, page or
   table, units, conditions and the date it was checked. Company values stay where the
   technician entered them (the job profile, sweep setup, or the DOCSIS health card and Leakage
   screen, whose values are kept on this device only); blank stays unknown and is
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
  {id:'docsis.ds.scqam.range',label:'spec',name:'Downstream SC-QAM channel level at the cable modem',kind:'limit',units:'dBmV per 6 MHz channel',rangeText:'−15 to +15 dBmV per 6 MHz channel',
   source:'CableLabs CM-SP-PHYv3.0, DOCSIS 3.0 Physical Layer Specification, Downstream Electrical Input to CM; CM-SP-PHYv3.1 section 6.4.2 applies it to DOCSIS 3.1 modems',revision:'PHYv3.0 C01 (December 7, 2017); PHYv3.1 I20 (April 19, 2023)',locator:'PHYv3.0 C01 section 6.3.2, Table 6–22, row “Level Range (one DOCSIS channel)” (p. 100); PHYv3.1 I20 section 6.4.2 (p. 43)',
   conditions:'North American 6 MHz channels, 64-QAM and 256-QAM, at the modem F connector. A capability limit: the levels a modem must accept. It is not an operating target and says nothing about error rate. The EuroDOCSIS 8 MHz ranges are different and are not used here.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → DOCSIS health'},
  {id:'docsis.ds.ofdm.range',label:'spec',name:'Downstream OFDM level at the cable modem',kind:'limit',units:'dBmV per 24 MHz',rangeText:'−9 to +21 dBmV per 24 MHz (−15 to +15 dBmV per 6 MHz)',
   source:'CableLabs CM-SP-PHYv3.1, DOCSIS 3.1 Physical Layer Specification, Cable Modem Receiver Input Requirements',revision:'PHYv3.1 I20 (April 19, 2023)',locator:'Section 7.5.11, Table 45 “Electrical Input to CM”, row “Level Range (24 MHz min occupied BW)” (p. 146)',
   conditions:'For an OFDM channel occupying at least 24 MHz. The table gives the range as −9 to +21 dBmV per 24 MHz and says it is equivalent to the SC-QAM range of −15 to +15 dBmV per 6 MHz. Those two statements differ by 0.02 dB (10·log10 of 4 is 6.02 dB); the card uses each as printed. A capability limit, not an operating target; the specification notes that the level range implies nothing about error performance.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → DOCSIS health'},
  {id:'docsis.ds.ofdm.scaling',label:'expert',name:'OFDM level range for another occupied bandwidth',kind:'formula',units:'dBmV',formula:'low = −9 + 10·log10(B ÷ 24); high = +21 + 10·log10(B ÷ 24), in dBmV over B MHz',
   source:'Derived from the PHYv3.1 I20 Table 45 24 MHz row with the flat-power bandwidth relation also used by the OFDM power calculator (row calc.ofdm.bandwidth). The specification prints ranges only for 6 and 24 MHz',revision:'PHYv3.1 I20 (April 19, 2023); SCTE 258 2026 (September 2026)',locator:'PHYv3.1 I20 Table 45; SCTE 258 section 7.2',
   conditions:'B is the occupied bandwidth, a whole number of 6 MHz channels from 24 to 192 MHz, taper included. Assumes equal power density across the band, so it does not suit a tilted OFDM output. The specification does not print this relation for other widths, which is why the label is Expert.',date:CHECKED,scope:'all',verification:'derived',usedBy:'Test → DOCSIS health'},
  {id:'docsis.ds.total31.limit',label:'spec',name:'Total downstream input power, DOCSIS 3.1 modem',kind:'limit',units:'dBmV total',rangeText:'below 40 dBmV',
   source:'CableLabs CM-SP-PHYv3.1, DOCSIS 3.1 Physical Layer Specification, Cable Modem Receiver Input Requirements',revision:'PHYv3.1 I20 (April 19, 2023)',locator:'Section 7.5.11, Table 45 “Electrical Input to CM”, row “Total Input Power” (p. 146)',
   conditions:'Total power of all signals from 54 to 1794 MHz, assuming negligible power outside that range, at the modem input. Strictly below 40 dBmV. A DOCSIS 3.0-only modem has the lower limit in the next row. Open point: PHYv3.1 section 6.4.2 also points a 3.1 modem to the 3.0 SC-QAM input table, which carries the 33 dBmV total, and the 3.1 specification does not say which total governs when a 3.1 modem receives only SC-QAM channels. Treat a total between 33 and 40 dBmV on a 3.1 modem as a case to confirm with the CableLabs text or the modem vendor.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → DOCSIS health'},
  {id:'docsis.ds.total30.limit',label:'spec',name:'Total downstream input power, DOCSIS 3.0-only modem',kind:'limit',units:'dBmV total',rangeText:'below 33 dBmV',
   source:'CableLabs CM-SP-PHYv3.0, DOCSIS 3.0 Physical Layer Specification, Downstream Electrical Input to CM',revision:'PHYv3.0 C01 (December 7, 2017)',locator:'Section 6.3.2, Table 6–22, row “Total Input Power (40 MHz and above)” (p. 100)',
   conditions:'North American plant, total power of all signals from 40 MHz up, at the modem input. Strictly below 33 dBmV. Do not apply the 3.1 limit of 40 dBmV to a modem that is only DOCSIS 3.0.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → DOCSIS health'},
  {id:'docsis.us.pmax.capability',label:'spec',name:'Maximum total transmit power (Pmax) a DOCSIS 3.1 modem must support',kind:'limit',units:'dBmV total',rangeText:'at least 65 dBmV (the default and lowest allowed Pmax)',
   source:'CableLabs CM-SP-PHYv3.1, DOCSIS 3.1 Physical Layer Specification, Transmit Power Requirements',revision:'PHYv3.1 I20 (April 19, 2023); the same 65 dBmV statement appears in issue I08',locator:'Section 7.4.12.2 Transmit Power Requirements (p. 72) and 7.4.12.2.1 (p. 74, the 65 dBmV default when the CMTS returns no Pmax capability); section 7.4.12.3.1 (definition of Pmax, p. 76); item 1 under Table 5 (section 6.2.24, p. 41) and Table 16 (section 7.4.13, p. 85)',
   conditions:'A DOCSIS 3.1 modem working with a DOCSIS 3.1 CMTS. A minimum capability, not a limit on what the modem sends and not a target. A modem may support a higher Pmax and reports it in a capability message; the specification applies the 65 dBmV default when the CMTS does not return a Pmax capability. It applies to the total across the transmit channel set. A DOCSIS 3.0 modem, or a 3.1 modem on a 3.0 CMTS, follows the 3.0 per-channel limits (PHYv3.0 C01 section 6.2.24), which depend on channel type and count and are not used here. In 3.1 operation the specification reports per-channel power normalized to 1.6 MHz, so a 6.4 MHz SC-QAM channel’s actual power is about 6 dB above its reported value (I20 section 7.4.12.2.1); a modem page or meter may use a different convention.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → DOCSIS health'},
  {id:'company.docsis.scqam',label:'company',name:'Your window, downstream SC-QAM level',kind:'target',units:'dBmV',store:'docsis',field:'scqam',
   source:'Entered by you on the DOCSIS health card',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → DOCSIS health → Company window',
   conditions:'Your own limits for one 6 MHz SC-QAM channel at the modem input. Starts blank (unknown). Either side can stay blank.',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → DOCSIS health'},
  {id:'company.docsis.ofdm',label:'company',name:'Your window, downstream OFDM level',kind:'target',units:'dBmV per 6 MHz',store:'docsis',field:'ofdm',
   source:'Entered by you on the DOCSIS health card',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → DOCSIS health → Company window',
   conditions:'Your own limits for OFDM power restated per 6 MHz at the modem input. Starts blank (unknown). Either side can stay blank.',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → DOCSIS health'},
  {id:'company.docsis.total',label:'company',name:'Your window, total downstream input power',kind:'target',units:'dBmV',store:'docsis',field:'total',
   source:'Entered by you on the DOCSIS health card',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → DOCSIS health → Company window',
   conditions:'Your own limits for total power at the modem input. Starts blank (unknown). Either side can stay blank.',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → DOCSIS health'},
  {id:'company.docsis.upstream',label:'company',name:'Your window, total upstream transmit power',kind:'target',units:'dBmV',store:'docsis',field:'upstream',
   source:'Entered by you on the DOCSIS health card',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → DOCSIS health → Company window',
   conditions:'Your own limits for the modem’s total transmit power. Starts blank (unknown). Either side can stay blank.',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → DOCSIS health'},
  {id:'leak.fcc.analog.far',label:'spec',name:'Analog signal leakage limit, 54 MHz and below, and over 216 MHz',kind:'limit',units:'µV/m at 30 m',rangeText:'15 µV/m at 30 m',
   source:'47 CFR 76.605(c), Table 1 to paragraph (c), Technical standards (Federal Communications Commission)',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7627 (February 22, 2018)',locator:'§ 76.605(c), Table 1: row “Analog signals less than and including 54 MHz, and over 216 MHz”',
   conditions:'Leakage is measured by the procedures in § 76.609(h) and limited as the table shows, whatever signals the system carries. The table limits the field strength a cable system may produce. Separately, § 76.614 expects an operator carrying signals in the aeronautical bands to note and repair, within a reasonable period, any leak of 20 µV/m or more at 3 m there (see the aeronautical-band row). Your company’s own repair threshold is its own addition and starts unknown.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage'},
  {id:'leak.fcc.digital.far',label:'spec',name:'Digital signal leakage limit, 54 MHz and below, and over 216 MHz',kind:'limit',units:'µV/m at 30 m',rangeText:'13.1 µV/m at 30 m',
   source:'47 CFR 76.605(c), Table 1 to paragraph (c), Technical standards (Federal Communications Commission)',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7627 (February 22, 2018)',locator:'§ 76.605(c), Table 1: row “Digital signals less than and including 54 MHz, and over 216 MHz”',
   conditions:'Leakage is measured by the procedures in § 76.609(h) and limited as the table shows, whatever signals the system carries. The table limits the field strength a cable system may produce. Separately, § 76.614 expects an operator carrying signals in the aeronautical bands to note and repair, within a reasonable period, any leak of 20 µV/m or more at 3 m there (see the aeronautical-band row). Your company’s own repair threshold is its own addition and starts unknown.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage'},
  {id:'leak.fcc.analog.near',label:'spec',name:'Analog signal leakage limit, over 54 up to 216 MHz',kind:'limit',units:'µV/m at 3 m',rangeText:'20 µV/m at 3 m',
   source:'47 CFR 76.605(c), Table 1 to paragraph (c), Technical standards (Federal Communications Commission)',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7627 (February 22, 2018)',locator:'§ 76.605(c), Table 1: row “Analog signals over 54 MHz up to and including 216 MHz”',
   conditions:'Leakage is measured by the procedures in § 76.609(h) and limited as the table shows, whatever signals the system carries. The table limits the field strength a cable system may produce. Separately, § 76.614 expects an operator carrying signals in the aeronautical bands to note and repair, within a reasonable period, any leak of 20 µV/m or more at 3 m there (see the aeronautical-band row). Your company’s own repair threshold is its own addition and starts unknown.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage'},
  {id:'leak.fcc.digital.near',label:'spec',name:'Digital signal leakage limit, over 54 up to 216 MHz',kind:'limit',units:'µV/m at 3 m',rangeText:'17.4 µV/m at 3 m',
   source:'47 CFR 76.605(c), Table 1 to paragraph (c), Technical standards (Federal Communications Commission)',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7627 (February 22, 2018)',locator:'§ 76.605(c), Table 1: row “Digital signals over 54 MHz up to and including 216 MHz”',
   conditions:'Leakage is measured by the procedures in § 76.609(h) and limited as the table shows, whatever signals the system carries. The table limits the field strength a cable system may produce. Separately, § 76.614 expects an operator carrying signals in the aeronautical bands to note and repair, within a reasonable period, any leak of 20 µV/m or more at 3 m there (see the aeronautical-band row). Your company’s own repair threshold is its own addition and starts unknown.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage'},
  {id:'leak.fcc.aero.repair',label:'spec',name:'Aeronautical-band leak: note it and repair it',kind:'limit',units:'µV/m at 3 m',rangeText:'20 µV/m or more at 3 m in the aeronautical bands: note it and repair it within a reasonable period',
   source:'47 CFR 76.614, Cable television system regular monitoring; scope in § 76.610 (Federal Communications Commission)',revision:'Text read November 11, 2026 on the Cornell LII copy of the eCFR; § 76.614 added 65 FR 53616 (September 5, 2000); § 76.610 amended 83 FR 7629 (February 22, 2018)',locator:'§ 76.614, its first, third and fourth sentences; § 76.610',
   conditions:'Applies to an operator transmitting carriers in the 108–137 and 225–400 MHz bands (§ 76.610 sets the power level at which a system counts as transmitting them). It asks for regular monitoring that covers the plant every three months with equipment able to detect 20 µV/m at 3 m, and for any such leak in the aeronautical bands to be noted and repaired within a reasonable period. This card shows the figure and does nothing with it: it does not track coverage dates and does not decide whether a system is subject to the rule.',date:CHECKED,scope:'all',verification:'secondary',usedBy:'Test → Leakage'},
  {id:'leak.cli.formula',label:'spec',name:'Cumulative leakage index (CLI), I∞',kind:'formula',units:'µV²/m²',formula:'I∞ = (1 ÷ θ) × ΣEi², over leaks of 50 µV/m or more; index = 10·log10(I∞)',
   source:'47 CFR 76.611(a)(1), Cable television basic signal leakage performance criteria',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7629 (February 22, 2018)',locator:'§ 76.611(a)(1). The eCFR prints the equation as an image; the form above is the equation as set out in the text of the same section on the Cornell LII copy',
   conditions:'θ is the fraction of the system’s cable length actually examined (strand length tested ÷ total strand length). Ei is the field strength of leak i in µV/m measured 3 m from it under § 76.609(h). Only leaks of 50 µV/m or more are counted. The rule asks for the index at least once each calendar year, no more than 12 months apart, from a sample of at least 75% of the strand. The test signal should be in the 108–137 MHz band; strengths measured elsewhere must be correlated to that band, which the card does not do.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage: CLI estimate'},
  {id:'leak.cli.limit',label:'spec',name:'Cumulative leakage index limit',kind:'limit',units:'dB',rangeText:'10·log10(I∞) equal to or less than 64',
   source:'47 CFR 76.611(a)(1)',revision:'eCFR text read November 11, 2026; section last amended 83 FR 7629 (February 22, 2018)',locator:'§ 76.611(a)(1): “10 log I ∞ is equal to or less than 64”',
   conditions:'One of two ways the rule offers to show compliance before and during carriage in the aeronautical bands (108–137 and 225–400 MHz); the other is an airspace measurement. The card compares your own estimate with the printed value and says nothing about whether a system complies.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage: CLI estimate'},
  {id:'leak.log.fields',label:'spec',name:'Signal leakage log: what to record and how long to keep it',kind:'limit',units:'years',rangeText:'date and location found, date repaired, probable cause; keep 2 years (5 years for some small systems)',
   source:'47 CFR 76.1706, Signal leakage logs and repair records',revision:'eCFR text read November 11, 2026',locator:'§ 76.1706; § 76.601(d) for the five-year case',
   conditions:'The rule is on the cable operator. It names the date and location of each leakage source identified under § 76.614, the date it was repaired and its probable cause, and a two-year retention. Under § 76.601(d), a system with fewer than 1,000 subscribers that uses spectrum beyond over-the-air television and FM broadcast bands may meet its leakage-testing duty with the monitoring and log of § 76.614, and then keeps the log for five years. This app’s leak log is a personal notebook that follows those fields; it is not the operator’s log.',date:CHECKED,scope:'all',verification:'primary',usedBy:'Test → Leakage: leak log'},
  {id:'leak.normalize.distance',label:'expert',name:'Leakage field strength restated at another distance',kind:'formula',units:'µV/m',formula:'E at 3 m ≈ E measured × d ÷ 3 (d in metres); likewise E at 30 m = E × d ÷ 30',
   source:'Far-field relation: power density falls with the square of distance, so field strength falls in proportion to distance. SCTE 221 2020 (R2026), Field Strength Tutorial & Calculation of LTE User Equipment Field Strength, defines the far field and says leakage field-strength measurements are made there',revision:'SCTE 221 2020 (R2026): title page, number and year confirmed on the CableLabs library copy; its definitions and field-strength sections were read by an independent review agent, not re-read here. SCTE 293-12 2025, the series monograph on signal leakage field strength, was identified from its catalog summary only and its body was not read. Relation derived',locator:'SCTE 221 § 5.2 (definitions, far field) and § 6 (field strength), as read by the review agent; the one-line relation is derived, not quoted',
   conditions:'Valid in the far field. Close to the leak it does not hold, and how close depends on the frequency (a common rule of thumb puts the edge of the near field at the wavelength ÷ 2π: about 0.4 m at 121 MHz and 4.8 m at 10 MHz), so measure at the rule distance when you can. A reading restated this way is approximate. Table 1 states its limits at 3 m or at 30 m by band, and § 76.609(h) sets the 3 m dipole placement for the measurement procedure; restating a reading from one distance to the other is this app’s own approximation.',date:CHECKED,scope:'all',verification:'secondary',usedBy:'Test → Leakage: distance, limit check and leak log'},
  {id:'leak.detector.methods',label:'expert',name:'Leakage detector calibration checks',kind:'limit',units:'—',rangeText:'two methods: directly connected source; calibrated leak',
   source:'SCTE 289, Operational Practice for Building and Using Calibrated Leaks',revision:'SCTE 289 2024r1; only the SCTE catalog summary was read, not the practice itself',locator:'Catalog summary (calibration is mandatory on a regular basis; two techniques)',
   conditions:'The summary names a directly connected RF signal source, which sets general measurement accuracy, and a calibrated field strength (a calibrated leak), which shows the detector measuring a known field outdoors. How often, and how close the reading must be, are your company’s choices and start unknown.',date:CHECKED,scope:'all',verification:'secondary',usedBy:'Test → Leakage: detector check'},
  {id:'company.leak.repair',label:'company',name:'Your leak repair threshold',kind:'target',units:'µV/m at 3 m',store:'leakage',field:'repair',
   source:'Entered by you on the Leakage screen',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → Leakage → Company settings',
   conditions:'Open leaks in your log at or above this field strength, restated at 3 m, are flagged. Starts blank (unknown). It is your own threshold, separate from the FCC limits and from § 76.614.',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → Leakage: leak log'},
  {id:'company.leak.tolerance',label:'company',name:'Your detector check tolerance',kind:'target',units:'± dB',store:'leakage',field:'tolerance',
   source:'Entered by you on the Leakage screen',revision:'Saved on this device only; not part of a job or its backups',locator:'Test → Leakage → Company settings',
   conditions:'How far a detector reading may differ from its calibrated source before you treat the check as failed. Starts blank (unknown).',date:'Not recorded when entered',scope:'all',verification:'entered',usedBy:'Test → Leakage: detector check'},
  {id:'app.cable.temperatureCoefficient',label:'unknown',name:'Cable loss temperature correction',kind:'constant',value:0.1,units:'% per °F',formula:'loss × (1 + 0.001 × (T − 68 °F))',
   source:'CommScope Cable Technician Pocket Guide, document MX0398 (the repository’s cable audit records that this value matches it)',revision:'MX0398 Rev U (2021), read from an indexed copy; the live document was not reachable',locator:'Not recorded; see night-sweep/research/equipment-audit-build17/passives/README.md',
   conditions:'Applied to every catalog cable from −40 to 185 °F, referenced to 68 °F.',date:CHECKED,scope:'all',verification:'secondary',usedBy:'Route predictions, Predicted levels and Frequency',
   note:'A cable’s own datasheet may state a different temperature behavior. Prefer the manufacturer’s value when you have it.'},
  {id:'app.impairment.rippleSearchWidth',label:'expert',name:'Standing-wave candidate search width',kind:'constant',value:10,units:'± % of the distance',formula:'a pair of route points is a candidate when its cable distance is within ±10% of 492 × VP ÷ ripple spacing',
   source:'This app’s own choice for how wide to look; the distance formula is the ripple-to-distance relation of SCTE 280 2022 section 9.7',revision:'Not a published value; no source sets it',locator:'Test → Impairments → standing wave',
   conditions:'Reading peak spacing off a display is imprecise, so the search accepts a pair of points whose cable distance is within this percentage of the distance the ripple gives. The technician can change it for one search; it is not saved. A narrower width gives fewer, closer candidates and can miss the real pair.',date:CHECKED,scope:'all',verification:'unverified',usedBy:'Test → Impairments'},
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
  if(row.store&&!['profile','sweep','docsis','leakage'].includes(row.store))problems.push('unsupported store');
  return problems;
 }
 function selectedProfile(s=owner()){return s.project?.profiles?.find(p=>String(p.id)===String(s.project.selectedProfile))||null;}
 /* Resolve the value a row currently shows. A blank company entry is unknown (null), never 0. */
 function resolve(id,s=owner()){
  const row=get(id);if(!row)return null;
  if(row.store==='profile'){const p=selectedProfile(s);return {value:p?finite(p[row.field]):null,where:p?'Selected profile '+p.id:'No project profile selected'};}
  if(row.store==='sweep'){const v=s.sweepSetup?.profiles?.[row.split]?.[row.field];return {value:finite(v),where:'This job’s '+row.split+' MHz meter setup'};}
  if(row.store==='leakage')return typeof Leakage!=='undefined'?Leakage.registryValue(row.field):{value:null,text:'Unknown — not entered',where:'Saved on this device only'};
  if(row.store==='docsis')return typeof DocsisHealth!=='undefined'?DocsisHealth.registryValue(row.field):{value:null,text:'Unknown — not entered',where:'Saved on this device only'};
  if(row.preset){const preset=typeof FieldReference!=='undefined'?FieldReference.localNonHighSplitPreset:null;return {value:preset?finite(preset[row.preset]):null,where:'Built-in local preset'};}
  return {value:typeof row.value==='number'&&Number.isFinite(row.value)?row.value:null,where:row.kind==='formula'?'Formula':'Built in'};
 }
 function trim(value){const fixed=Math.abs(value)>=100?value.toFixed(1):Math.abs(value)>=1?value.toFixed(3):value.toPrecision(3);return String(Number(fixed));}
 function display(id,s=owner()){
  const row=get(id),r=resolve(id,s);if(!row||!r)return '—';
  if(row.kind==='formula')return row.formula||'Formula';
  if(row.rangeText)return row.rangeText;
  if(r.text)return r.text;
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
  const edit=row.store==='profile'?`<button type="button" data-task="records" data-source-close>Edit in Job → Acceptance</button>`:row.store==='sweep'?`<button type="button" data-task="sweepSetup" data-source-close>Edit in Test → Meter setup (choose 42/54)</button>`:row.preset?`<button type="button" data-task="references" data-source-close>Open Test → References</button>`:row.store==='docsis'?`<button type="button" data-task="docsisHealth" data-source-close>Edit in Test → DOCSIS health</button>`:row.store==='leakage'?`<button type="button" data-task="leakage" data-source-close>Edit in Test → Leakage</button>`:'';
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
 const groups=[['Field calculators',r=>r.id.startsWith('calc.')||r.id.startsWith('const.')],['Your local targets',r=>r.id.startsWith('company.local.')],['This job’s targets',r=>r.store==='profile'||r.store==='sweep'],['Built-in approximations',r=>r.id.startsWith('app.')],['DOCSIS modem requirements',r=>r.id.startsWith('docsis.')],['Your DOCSIS windows',r=>r.store==='docsis'],['Leakage rules and methods',r=>r.id.startsWith('leak.')],['Your leakage settings',r=>r.store==='leakage']];
 function renderLimits(){
  const host=document.getElementById('limitsList');if(!host)return;
  const shown=rows.filter(r=>filter==='all'||r.label===filter);
  document.querySelectorAll('[data-limits-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.limitsFilter===filter)));
  const count=document.getElementById('limitsCount');if(count)count.textContent=shown.length+' of '+rows.length+' entries';
  host.innerHTML=groups.map(([title,test])=>{const list=shown.filter(test);return list.length?`<h3>${escape(title)}</h3><ul class="limits-list">${list.map(r=>`<li><div><strong>${escape(r.name)}</strong><span class="limits-value${resolve(r.id)?.value===null&&r.kind!=='formula'&&!r.rangeText?' unknown':''}">${escape(display(r.id))}</span></div>${tag(r.id)}</li>`).join('')}</ul>`:'';}).join('')||'<p class="note">No entries have this label.</p>';
 }
 function setFilter(value){if(value!=='all'&&!LABELS.includes(value))return false;filter=value;renderLimits();return true;}
 let initialized=false;
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('limitsPanel');
  if(panel)panel.innerHTML=`<div class="sectionhead"><div><h2>Limits &amp; sources</h2><p class="note tight">Tap a tag for its source, revision, page, units, conditions and the date it was checked.</p></div></div><div class="limits-filters" role="group" aria-label="Show entries by label"><button type="button" data-limits-filter="all" aria-pressed="true">All</button>${LABELS.map(l=>`<button type="button" data-limits-filter="${l}" aria-pressed="false">${LABEL_INFO[l].text}</button>`).join('')}</div><p id="limitsCount" class="note" aria-live="polite"></p><dl class="limits-legend">${LABELS.map(l=>`<div><dt><span class="source-tag source-${l} static">${LABEL_INFO[l].text}</span></dt><dd>${escape(LABEL_INFO[l].help)}</dd></div>`).join('')}</dl><div id="limitsList"></div><p class="note">Company values come from this job’s project profile and meter setup, from your built-in local preset, or from the company windows on the DOCSIS health card and the repair threshold and detector tolerance on the Leakage screen, which are kept on this device for every job. A blank value is unknown, not zero. No value here is approved plant criteria. Example targets on older screens, such as Test → References, are not listed yet.</p>`;
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
