# Corrected complete GS7K / GainMaker GaN practice audit

This is the calculation audit for the corrected 1.8 complete example. The complete example uses a conventional GS7K source, two GainMaker HGD GaN actives, and Scientific-Atlanta, GigaXtend and Technetix mainline passives. The separate six-active Vecima / AOI exercise retains its independent 204/258 MHz scope.

## Equipment and frequency scope

| Selected item | Catalog identity | Qualification |
| --- | --- | --- |
| Conventional GS7K | `gs7000-12g`, band `0` | 42/54 MHz; manufacturer hardware upper 1218 MHz. Entered operating upper 1000 MHz. |
| Both GaN actives | `active_gm_gan_hgd` | HGD GaN 42/54; catalog forward domain 54–1002 MHz. Gains 9/18 and 8/15 dB at 54/860 MHz are synthetic entered values, not automatic manufacturer gain. |
| SA main/branch taps | `scientific-atlanta-multimedia-1ghz--sat-mm-4-23` | Through loss uses published band maxima: 0.9/1.7 dB at 54/860 MHz. Tap loss is a separate printed 23 dB value; not a measured typical curve. Ends at 1000 MHz. |
| GigaXtend splitter | `atx-gigaxtend-xs-2ghz--xsc-2-959` | Typical point interpolation. Main port `low-loss-output`; branch port `high-loss-outputs` (plural). |
| GigaXtend main tap | `atx-gigaxtend-sgt-1-25ghz--gtsg-tap-4-20-std` | Typical point interpolation for through loss; distinct 20 dB tap output at both exercise markers. |
| Technetix EOL tap | `technetix-ottz-1-8-ghz--ottz-4-17` | Typical point interpolation for through loss; typical band tap losses 18/18.5 dB at the exercise markers. |
| GaN power selector | `gm-hgd-gan-1g-thermal` | Manual-current-only preset. Its old curve was withdrawn; current is explicitly entered as synthetic 0.60/0.45 A. No substitute GaAs/AOI curve is used. |

The `1002` project profile is the existing profile container. Its entered equipment and planned upper limits are both **1000 MHz**, its live spectrum entry is **860 MHz**, and the exercise anchors are **54/860 MHz, 31/43 dBmV**. The complete path does not claim 1218 MHz coverage. The separate **38 dBmV operator return TX reference** is not a receiver target or sweep-injection setting. The selected 42 MHz workflow uses forward and Return Sweepless Sweep.

Sources remain the catalog's linked Cisco GS7000 standard-node datasheet, qualified archived GainMaker GaN reference, Scientific-Atlanta data book page 6-3, ATX GigaXtend product tables, and Technetix OTTZ-4-xx V3 datasheet page 2. This audit checked the actual current catalog/runtime values; it did not newly retrieve or retranscribe those manufacturer documents. Exact GaN module, installed control system and matched commissioning procedure remain unresolved as the app records.

## Independent arithmetic

The actual Wolfram response and exact derivation code are in [complete-workflow-wolfram.json](complete-workflow-wolfram.json). The reference uses literal published table inputs, synthetic route footage/gains/loads, square-root cable interpolation, linear point interpolation for the relevant passive references, and constant SA printed band limits.

| Output or summary | 54 MHz | 860 MHz |
| --- | ---: | ---: |
| Launch true output, dBmV | 31.000000 | 43.000000 |
| A1 GaN output, dBmV | 36.939765 | 47.605988 |
| A2 GaN output, dBmV | 40.545943 | 45.624060 |
| Main EOL Technetix tap output, dBmV | 14.011033 | 4.936926 |
| SA branch tap output, dBmV | 7.993653 | 6.726483 |
| Branch cable-only end, dBmV | 28.095150 | 21.693747 |
| 75 ft entered RG-6 loss, dB | 1.350000 | 4.650000 |
| Added custom drop-path loss, dB | 4.000000 | 4.000000 |
| Drop end, dBmV | 8.661033 | −3.713074 |

The custom drop losses are at actual temperature and receive no second temperature correction. The negative high-frequency drop result remains signed. Its 4 dB path is synthetic; it adds no fourth manufacturer to the requested complete example.

The TDR origin is on the cable side after A2 at 1700 ft. Displayed 295 ft minus the 25 ft lead equals 270 ft along that cable path, reaching route coordinate **1970 ft**, **160 ft into r5's incoming span**. The corresponding attempt from Launch crosses an active and is blocked.

| Power summary | Baseline | Add 300 ft P3 .625 / 0.75 A after A2 |
| --- | ---: | ---: |
| Supply current, A | 2.047440270964 | 2.797522071850 |
| Loading of 15 A supply, % | 13.649601806428 | 18.650147145664 |
| Minimum equipment voltage, V | 88.826710760491 | 87.367171527721 |
| Cable heating, W | 1.125112995665 | 3.979735048554 |

The power plan uses the separate 90 V circuit, synthetic GS7K 0.75 A and GaN 0.60/0.45 A loads, and a 20 W / PF 0.9 branch. Its independent scalar-RMS equations include shared-trunk current and temperature-adjusted cable loop resistance. The what-if recalculates every affected voltage without mutating the baseline. These are planning estimates; RF topology does not establish power passing.

## Executed checks and limits

`node qa/complete-workflow-math.test.cjs`, executed by the frozen release QA runner, passed **17 grouped checks / 82 numeric comparisons** against the final generated standalone. These cover all nine incoming cable losses, every modeled RF output at both anchors, five baseline and six trial voltages, power totals, TDR, exact frequency overrides, the custom drop, planning status and absence of script errors. [complete-workflow-application.json](complete-workflow-application.json) records the latest execution mode, values and source hashes.

The suite is registered in `qa/run-pwa.py` and passed in the final unmodified generated release. The application evidence record contains final artifact hashes and scope. The release-wide QA result (921 checks in 48 suites) includes these 17 grouped checks; the 82 numerical comparisons describe coverage rather than extra test cases.

No physical Android/iPhone, meter, installed GaN procedure or live-plant acceptance test is claimed. Independent arithmetic agreement does not establish equipment settings, trace validity, actual carrier presence, or field acceptance.
