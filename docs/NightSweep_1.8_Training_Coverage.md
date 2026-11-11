# NightSweep 1.8 Alpha build 2 — Training coverage

Open **Home → Practice library**. Choose an exercise to open its seeded job, or select a feature to load the matching example and reveal its guide step. The library is bundled for offline use after the installed browser app reports **Ready for offline use**. The standalone app includes the same training.

All example values and findings remain synthetic. Opening/resetting an example first preserves the current working job locally; export an external project backup for important work. Reviewed checkboxes describe learning progress and do not establish measurements, physical setup or acceptance.

## Loadable exercises

| Exercise | Purpose | Supplied evidence |
| --- | --- | --- |
| Complete Cedar Lane | GS7K/GainMaker GaN 42/54 route, Scientific Atlanta/GigaXtend/Technetix passives, branch/drop, gain, TDR, sweep, readings, power, records and backup; 22 steps | Five synthetic interchange CSVs and one original-only SVG diagram |
| GainMaker OEM AGC | Separate 42/54 OEM detector/pilot and exact-manual path; eight steps | None |
| GainMaker / DSIM | Separate 42/54 ACI DSIM lookup/manual/record path; nine steps | None |
| GainMaker manual / thermal | Separate 42/54 manual/thermal installed-control path; seven steps | None |
| GS7K node | Conventional standard GS7000 identity and manual setup path; ten steps | None; launch inputs remain unverified |
| Six-active AOI cascade | Vecima source with six serial AOI amplifiers, cumulative gain/loss, reserve and TDR boundaries; 14 steps | Synthetic entered teaching data |
| Custom curves | Manual launch and cable/passive table inputs, interpolation and missing ranges; field calculators, limit sources, the DOCSIS health card, the leakage tools, the pre-work safety reminders, the outage first-response prompts and the impairment cards (added in 2.0 Alpha build 3); fifteen steps | Synthetic entered teaching tables and calculator inputs |

The source node is not an amplifier in the six-active count. Each of the six route actives must feed the next along a single path. Sibling branches cannot satisfy this requirement.

## Every task has an example

| Application feature | Loadable exercise | What to inspect |
| --- | --- | --- |
| Home and task navigation | Complete | Guide, current-job summary, theme and Help |
| Route → Setup | Complete, GS7K, custom curves | Source model/port, launch markers/levels, remaining TP compensation, temperature |
| Route → Cable route | Complete, six-active | Feed parents, cable/slack, splitter branches, through/tap paths |
| Route → Amp gain | Complete and six-active | Gain anchors/table, required gain, reserve and output limits |
| Route → Amp / node setup | Complete, OEM AGC, DSIM, GS7K | Exact source/active model, manual provenance, reviewed procedure steps |
| Route → Catalog | Complete | Cable/passive/active/node/power references; published capability versus entered gain |
| Test → Meter setup | Complete, six-active, OEM AGC, DSIM, GS7K | Separate 204/258 and 42/54 workflows, instrument/reference checks and saved setup |
| Test → TDR | Complete, six-active | Cable-side origin, lead correction, velocity factor and active-boundary rejection |
| Test → Predicted levels | Complete, six-active | Absolute/normalized predictions and selected route outputs |
| Test → Frequency | Complete, custom curves | Exact-frequency loss budget, table interpolation and unavailable ranges |
| Test → Readings | Complete, six-active | Corrected measurement minus prediction, intentional mismatch and TP compensation |
| Test → References | Complete, OEM AGC, DSIM | Anchor presets, cable loss, tap faces, draft targets and available-carrier target estimates |
| Test → Calculators | Custom curves | dB units, ripple and pre-EQ tap distance, OFDM power and echo delay, each with its source tag (2.0 Alpha build 3) |
| Test → Limits | Custom curves | Spec, expert, company and unknown labels; company criteria unknown until entered (2.0 Alpha build 3) |
| Test → DOCSIS health | Custom curves | Synthetic downstream and upstream readings against the modem requirements, with a company window that starts unknown (2.0 Alpha build 3) |
| Test → Leakage | Custom curves | Synthetic leaks against the FCC 3 m limits, the CLI worked example, the 3 m distance restatement and a leak log kept on this device (2.0 Alpha build 3) |
| Test → Impairments | Custom curves | A synthetic 4.3 MHz ripple that lands on the two 100 ft spans of the practice route, and a suckout card read through its five steps; nothing is read from a meter or stored (2.0 Alpha build 3) |
| Job → Safety | Custom curves | Synthetic practice of the pre-work reminder list: ticks, a role and check-in time, and rewording, hiding and adding items; kept on this device and not in the job backup (2.0 Alpha build 3) |
| Job → Outage | Custom curves | Synthetic practice of the outage prompts: ticks for scope, power and the node, a plant place and times, a new call; kept on this device with no customer identifiers (2.0 Alpha build 3) |
| Power → Load | Complete | Independent power parents, explicitly synthetic entered node/GaN loads, voltage/current and supply headroom |
| Power → What-if | Complete | Extra cable/load trial, keep/reset and changed shared current |
| Job → Details | Complete | Work order, named save/open, duplicate and new blank job |
| Job → ONX files | Complete | Sweep/Ingress/OneCheck CSV previews and preserved original bytes |
| Job → Checklists | Complete | Inspection notes, maintenance tasks and dBµV/dBmV conversion |
| Job → Acceptance | Complete, OEM AGC, DSIM | Planning forward/return rows, unapproved criteria, punch list, injection arithmetic and separate DSIM forms |
| Job → Run sheet | Complete | Predictions, actual input context, warnings, as-built notes and synthetic export labels |
| Help & methods / build self-check | Complete | Calculation assumptions, limits and independent reference checks |

## Additional tools within those tasks

| Tool | Example and location |
| --- | --- |
| Tap-face comparison, drop cable/splitter and map note | Complete → Tap faces, drop and map note |
| Detailed RF arithmetic | Complete → Cable route/drop; custom curves → table exercises |
| Gain from input/output test points | Complete → GainMaker GaN gain; equal +20 dB addbacks produce 9 dB gain from 7.1/16.1 readings |
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
| Named-job retention and reset | Open a different exercise or reset the current one, then Job → Details |

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


## Build 3 station practice

**Route → Station** adds a step to the complete GS7K/GainMaker exercise (**22 steps**) and to the six-active Vecima/AOI exercise (**14 steps**). The complete step practices sourced forward pad/EQ advice and a synthetic return budget; the six-active step shows electronic alignment without plug-in parts. Before/After worksheets, separate balance/sweep dates and JSON backup/restore remain distinct from field acceptance. The current build 3 feature library has **40 choices**, including Station, Calculators and Limits.
