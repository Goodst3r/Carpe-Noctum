# NightSweep 1.8 Alpha build 2 — Training coverage

Current source: **Carpe Noctum 2.0 Alpha build 4**. This guide keeps its 1.8 filename and historical title for existing links; dated build 3 references below identify when those features were introduced. Candidate signing, physical acceptance and web deployment remain pending.

Open **Home → Practice library**. Choose an exercise to open its seeded job, or select a feature to load the matching example and reveal its guide step. The library is bundled for offline use after the installed browser app reports **Ready for offline use**. The standalone app includes the same training.

All example values and findings remain synthetic. Opening/resetting an example first preserves the current working job locally; export an external project backup for important work. Reviewed checkboxes describe learning progress and do not establish measurements, physical setup or acceptance.

## Loadable exercises

The current source offers 26 navigation destinations and 48 practice feature choices. Exercise steps: complete 21, six-active 14, custom curves 22, OEM AGC 8, DSIM 9, manual/thermal 7 and GS7K 10.

| Exercise | Purpose | Supplied evidence |
| --- | --- | --- |
| Complete Cedar Lane | GS7K/GainMaker HGD 42/54 route, Scientific Atlanta/GigaXtend/Technetix passives, branch/drop, gain, TDR, sweep, readings, power, records and backup; 21 steps | Five synthetic interchange CSVs and one original-only SVG diagram |
| GainMaker OEM AGC | Separate 42/54 OEM detector/pilot and exact-manual path; eight steps | None |
| GainMaker / DSIM | Separate 42/54 ACI DSIM lookup/manual/record path; nine steps | None |
| GainMaker manual / thermal | Separate 42/54 manual/thermal installed-control path; seven steps | None |
| GS7K node | Conventional standard GS7000 identity and manual setup path; ten steps | None; launch inputs remain unverified |
| Six-active AOI cascade | Vecima source with six serial AOI amplifiers, cumulative gain/loss, reserve and TDR boundaries; 14 steps | Synthetic entered teaching data |
| Custom curves | Tables, calculators, compatible per-leg readings, port sweeps and synthetic PDF maps; 22 steps | Synthetic teaching data |

The source node is not an amplifier in the six-active count. Each of the six route actives must feed the next along a single path. Sibling branches cannot satisfy this requirement.

## Every task has an example

| Application feature | Loadable exercise | What to inspect |
| --- | --- | --- |
| Home and task navigation | Complete | Guide, current-job summary, theme and Help |
| Route & sweep → Setup | Complete, GS7K, custom curves | Source model/port, launch markers/levels, remaining TP compensation, temperature |
| Route & sweep → Route & sweep | Complete, six-active | Feed parents, cable/slack, splitter branches, through/tap paths |
| Route & sweep → Station records | Complete, six-active | Independent Before/After worksheets, balance/sweep records, binding and actual dates |
| Route & sweep → Route & sweep | Complete and six-active | Gain anchors/table, required gain, reserve and output limits |
| Route & sweep → Amp / node setup | Complete, OEM AGC, DSIM, GS7K | Exact source/active model, manual provenance, reviewed procedure steps |
| Tools → Catalog | Complete | Cable/passive/active/node/power references; published capability versus entered gain |
| Route & sweep → Meter setup | Complete, six-active, OEM AGC, DSIM, GS7K | Separate 204/258 and 42/54 workflows, instrument/reference checks and saved setup |
| Tools → TDR | Complete, six-active | Cable-side origin, lead correction, velocity factor and active-boundary rejection |
| Route & sweep → Predicted levels | Complete, six-active | Absolute/normalized predictions and selected route outputs |
| Tools → Frequency | Complete, custom curves | Exact-frequency loss budget, table interpolation and unavailable ranges |
| Route & sweep → Route & sweep | Complete, six-active | Corrected measurement minus prediction, intentional mismatch and TP compensation |
| Tools → References | Complete, OEM AGC, DSIM | Anchor presets, cable loss, tap faces, draft targets and available-carrier target estimates |
| Tools → Calculators | Custom curves | dB units, ripple and pre-EQ tap distance, confirmed flat-PSD bandwidth restatement (including 1.6/6.4 MHz), power sum, thermal CNR and echo delay, each with its source tag (2.0 Alpha build 3) |
| Route & sweep → ONX files → Grading aid | Custom curves | Attach the invented three-point interchange trace, explicitly enter practice criteria, inspect unknown checks and preserve the original |
| Tools → Limits | Custom curves | Spec, expert, company and unknown labels; company criteria unknown until entered (2.0 Alpha build 3) |
| Tools → DOCSIS health | Custom curves | Synthetic downstream capability comparisons and upstream composite margin to a declared comparable total reference; company windows start Unknown (2.0 Alpha build 3) |
| Tools → Impairments | Custom curves | A synthetic 4.3 MHz ripple that lands on the two 100 ft spans of the practice route, and a suckout card read through its five steps; nothing is read from a meter or stored (2.0 Alpha build 3) |
| Tools → Fiber | Custom curves | Fiber 30 found by tube and position, and a synthetic 12.4 km link budgeted at 9.64 dB with the standard allowances shown but never filled in silently; nothing is read from a meter or stored (2.0 Alpha build 3) |
| Tools → High split | Custom curves | The 204/258 high-split row and gap read from the band table, the side of 108 to 137 MHz on each plant, and the eight Remote PHY steps with their sources; nothing is typed, read from a node or stored (2.0 Alpha build 3) |
| Tools → Why cards | Custom curves | The decibel card read for what a bare dB is, and a link from the unity gain card to the station worksheet; nothing is typed or stored (2.0 Alpha build 3) |
| Tools → Proof of performance | Custom curves | The 43 dB carrier-to-noise limit, the test frequency and the number of test points read with their rule sections; nothing is typed, read from a meter or stored (2.0 Alpha build 3) |
| Tools → Study | Custom curves | A level-conversion question answered and checked, with its working and a link to the calculator; nothing is stored and a score is kept for the visit only (2.0 Alpha build 3) |
| Route & sweep → Load & what-if | Complete | Independent power parents, explicitly synthetic entered node/HGD loads, voltage/current and supply headroom |
| Route & sweep → Load & what-if | Complete | Extra cable/load trial, keep/reset and changed shared current |
| Route & sweep → Details | Complete | Work order, named save/open, duplicate and new blank job |
| Route & sweep → ONX files | Complete | Sweep/Ingress/OneCheck CSV previews and preserved original bytes |
| Closeout → Acceptance | Complete, OEM AGC, DSIM | Planning forward/return rows, unapproved criteria, punch list, injection arithmetic and separate DSIM forms |
| Closeout → Run sheet | Complete | Predictions, actual input context, warnings, as-built notes and synthetic export labels |
| Help & methods / build self-check | Complete | Calculation assumptions, limits and independent reference checks |

## Additional tools within those tasks

| Tool | Example and location |
| --- | --- |
| Tap-face comparison, drop cable/splitter and map note | Complete → Tap faces, drop and map note |
| Detailed RF arithmetic | Complete → Cable route/drop; custom curves → table exercises |
| Gain from input/output test points | Complete → GainMaker HGD gain; equal +20 dB addbacks produce 9 dB gain from 7.1/16.1 readings |
| Custom inline loss and cable-only point | Complete → branch; custom curves → custom path |
| Custom launch, cable and passive tables | Custom curves → matching guide steps |
| Active gain table | Six-active AOI → Gain-table example at A2 |
| Available-carrier square-root and linear targets | OEM AGC or DSIM → Available carriers and launch targets |
| OEM, manual/thermal and DSIM control paths | OEM AGC, manual/thermal and DSIM → exact-manual steps, kept separate |
| Historical DSIM code lookup | DSIM → approved pilot code; channel 110 digital, 711 MHz, `@@?<A`; lookup does not verify pilot lock |
| Both sweep workflows | Complete and focused GainMaker/GS7K → 42/54; separate six-active Vecima/AOI → 204/258 |
| Return injection budget | Complete → Records: 40 + 20 + 1 = 61 dBmV; this is arithmetic, not an instrument setting |
| Power watts and power factor, custom/current-curve loads | Complete → Power circuit and What-if |
| Sweep/Ingress before-and-after comparison and OneCheck | Complete → Synthetic meter files |
| Original-only unsupported attachment handling | Complete → synthetic SVG diagram |
| RF/frequency/power/run-sheet exports, print/share | Complete → Run sheet and exports; complete matching task for individual CSV buttons |
| Full project/evidence backup and recovery | Complete → Backup and return to work; Files → Back up project/Open project |
| Named-job retention and reset | Open a different exercise or reset the current one, then Route & sweep → Details |

## Verification and boundaries

The QA suite checks topology, example numeric outputs, guide destinations, persistence and supported backup round trips. Current executed counts and browser evidence belong to the 1.8 validation record. Physical Android/iPhone behavior and installed-equipment procedures require separate testing. External manufacturer manuals need a connection; practice data cannot establish RF acceptance.

## Portable example filenames

The 1.8 example exports use these filenames. Open them with **Files → Open project** and confirm the training label.

| Exercise | JSON backup |
| --- | --- |
| Complete | `NightSweep_1.8_Alpha_build_2_Training_Job.json` |
| Six active devices in series | `NightSweep_1.8_Alpha_build_2_Six_Active_Practice.json` |
| Custom curves and reverse TDR | `NightSweep_1.8_Alpha_build_2_Custom_Curves_Practice.json` |
| GainMaker OEM AGC | `NightSweep_1.8_Alpha_build_2_GainMaker_OEM_AGC_Practice.json` |
| GainMaker / DSIM | `NightSweep_1.8_Alpha_build_2_GainMaker_DSIM_Practice.json` |
| GainMaker manual / thermal | `NightSweep_1.8_Alpha_build_2_GainMaker_Manual_Thermal_Practice.json` |
| GS7K | `NightSweep_1.8_GS7K_Practice.json` |

## Build 2 checks and delivery

The seven examples and 37 feature mappings remain. Build 2 checks the complete point/branch structure, co-located TDR barriers, forward/reverse distance behavior, preserved originals, latest-state duplication, common project-import limits and same-refresh numerical consistency. The current source replay also probes all seven example states over frequency frames and checks unavailable results explicitly. Read final build 2 receipts for actual commands, counts and hashes.

All seven JSONs are organized under **Examples/** in the one **NightSweep 1.8 Alpha build 2.zip** delivery. Android/Web and iOS/Web use the same frozen shared application. The separate Android Preview installer has its own build/signature receipts; no physical-device or plant acceptance is inferred from these checks.



## Current synthetic route, sweep and PDF practice

The Custom curves exercise covers per-leg matching readings and sourced pad/EQ advice. In the per-port sweep step, replace one synthetic port, try a malformed replacement, and confirm the other port and original evidence remain. Choose **Save synthetic map PDF** in **Update PDF map**, import that file, confirm exact NAME/TAG and installed symbols, reselect the same original for Update PDF map, then inspect and reposition the grouped tombstones. Preserve the original separately. Company node references are labeled as such; unconfirmed measurement basis, tolerance and pilot codes remain Unknown.
