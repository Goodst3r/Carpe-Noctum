# Carpe Noctum baseline UI / fieldtask audit

**Audit time:** 2026-11-13 09:33 UTC (UTC clock).  
**Observed source:** `/workspace/carpe-routes-integration`, HEAD `4b5f31ccd3f33d1a163f68177984f0c049daa9a3` (the requested `0e66db1` candidate plus a docs-only role/baseline commit); source worktree clean when checked. The standalone under `outputs/Night_Sweep.html` had SHA-256 `0dab215949cad492db2df1d3b1ef7881f0892dcf88eba750415a3991a349a823`.  
**Rendered artifact:** served locally at `http://127.0.0.1:8765/outputs/Night_Sweep.html`, desktop Chromium (`/usr/bin/chromium`) with browser viewport emulation. This was browser QA, not a physical phone, native emulator, Safari, WebView or plant test.

## What was inspected

The app rendered at widths 320, 390, 430, and 1280 CSS px. At all four widths `document.documentElement.scrollWidth === innerWidth` (320, 390, 430, 1280 respectively). All five main navigation buttons and each section tab were opened. The 35 observed navigation/task states break down as Home (including Outage), Plan (10), Field (8), Tools (12), Closeout (2), and Files → Help & methods (1). That matches the 35-screen project count; the shell uses 11 broader `data-screen` category names, so those are different counting units.

The raw browser snapshot is `/tmp/carpe-inventory.json` (local raw snapshot), kept local for evidence review. The sanitized controls inventory is [`/tmp/carpe-luna-controls.json`](/tmp/carpe-luna-controls.json); it carries stable IDs/labels, fieldtask path and recommendation, with browser-rendered versus source-only status. The 35-state browser inventory aggregate is 666 button/link occurrences and 768 form-control occurrences across active panel snapshots; these are aggregate occurrences, not unique application controls. Reused panels appear again under their different task tabs. The snapshot includes controls inside active panels even when conditionally hidden, and summary labels for disclosures. It does not count the closed Files popover, dialog-only states or alternate calculator modes as rendered tab-panel controls; those are catalogued separately in the sanitized inventory with their evidence status. It is therefore a bounded UI inventory, not a claim that all 1,434 aggregate occurrences are unique controls or that every conditional state was executed.

## Fieldtask recommendations

| Current path | Fieldtask | Recommendation | Evidence / rationale |
|---|---|---|---|
| Home: current job, Continue / saved jobs, New blank job | Resume, select, or start a job | **Keep** | Core entry point; these are distinct job actions. |
| Home: practice library | Open synthetic training data | **Keep** | Supports practice and onboarding; not a duplicate job action. |
| Home: seven numbered task cards | Route, gain, meter setup, readings, TDR, load, run sheet | **Combine/remove duplicate entry links** | Each card jumps to existing task tabs and duplicates Plan/Field/Closeout navigation. Open the job to route work; leave distinct Load/TDR/Run sheet tasks in their task groups. |
| Home: Quick start steps | First-use navigation guidance | **Combine** | It repeats tab names and the seven task cards. Keep concise guidance in Help, not a second route chooser. |
| Home: Back up or move a job | Project backup/open | **Keep** | A distinct job-data action and part of field continuity. |
| Home: Outage | Outage-first response and notes | **Keep** | A distinct field scenario with its own fields/actions; not the RF route/gain workflow. |
| Plan → Details | Job identity and project records | **Keep** | Job metadata and project record are durable job tasks. |
| Plan → Setup | Launch source, spectrum and temperature | **Keep as route context** | Required input for expected levels; can be reachable from route context without a competing primary workflow. |
| Plan → Cable route | Build cable/passive/active topology | **Keep as main workbench** | Core route fieldtask. Retain branch/feed, cable/passive/model, route topology, path distance and source context. |
| Plan → Amp gain | Gain-budget calculation | **Combine into Cable route active row** | It reuses the route panel and route active model. The active leg needs an on-row gain result while working at that station; retain its calculation and result, remove the separate hop. |
| Field → Readings | Compare meter reading with prediction | **Combine into route row** | It reuses the route panel and duplicates route row “Enter meter reading.” Capture the Before/After readings, planes and corrections in the selected active row. Preserve existing records/data. |
| Route row → Enter meter reading | Start a reading entry | **Combine into the selected route row** | Existing actual action is a separate Readings task jump, not inline entry. Keep the action available in the row while making the editor inline. |
| Plan → Amp / node setup | Configure equipment/model | **Combine entry into route row; keep detailed setup accessible** | Installed model/configuration belongs to the station. Setup may need model-specific depth, but should be selected at the station instead of a separate navigation hop. |
| Plan → Predicted levels | Full sweep chart and level table | **Keep as secondary detail** | Route should show expected low/high levels at markers; detailed traces and frequency exploration are additional tasks, not redundant results. |
| Plan → Load and What-if | Supply/power budget and scenario | **Combine** | Both tabs render the same `powerPanel`; What-if is a scenario mode on the same fieldtask. Keep both real functions in the Load workflow. |
| Plan → Supply PM | Supply maintenance notebook | **Keep** | Separate maintenance record/task with its own fields and persistence/export concern. |
| Plan → Sweep due | Due intervals, grading and maintenance | **Keep** | Separate periodic maintenance task. |
| Field → Meter setup | Sweep procedure/configuration and return injection | **Keep secondary** | Supports distinct instrument/setup details, including the 42/54 and 204/258 workflows. Do not fold the full return setup into route editing. |
| Field → Station | Station record | **Keep** | Distinct station context. The route row can expose the relevant station identity without removing station records. |
| Field → TDR | Place measured distance on a route span | **Keep secondary** | Distinct measurement workflow. A short route entry may remain, but the TDR form is not gain/readings duplication. |
| Field → ONX files | Attach/inspect meter originals | **Keep** | Original evidence has separate storage/provenance duties. |
| Field → Leakage | Leakage measurements and checks | **Keep** | Distinct compliance/plant maintenance task. Includes calculator/reference cards. |
| Field → Checklists | Field checklist | **Keep** | Distinct task records, not duplicated by route calculations. |
| Field → Night log | Night work log | **Keep** | Distinct job record. |
| Tools → Calculators | General RF/math utilities | **Keep all calculator cards and their current entry point** | The tab currently shows dB converter, Ripple to distance, Pre-EQ tap to distance, OFDM power, Power sum, Thermal CNR, Pad / EQ balance and Echo delay. These are independently useful and explicitly required to remain reachable. All eight rendered with interactive fields. |
| Tools → Frequency | Frequency/channel reference | **Keep** | Distinct spectrum reference with selectable options. |
| Tools → Limits | Limits and sourced references | **Keep** | Reference and target information; retain its source/provenance path. |
| Tools → References | Field reference entries | **Keep** | Distinct documentation/lookup. |
| Tools → Catalog | Equipment/source catalog | **Keep** | Model verification/reference supports the station selector. |
| Tools → DOCSIS health | Modem/channel limits | **Keep all four calculation cards** | SC-QAM, OFDM, total downstream power, upstream composite margin. Separate from active gain budget. |
| Tools → Impairments | Impairment reference | **Keep** | Distinct troubleshooting guidance. |
| Tools → Fiber | Fiber color and link-loss utilities | **Keep both calculation cards** | Separate fiber work; do not combine with coax route. |
| Tools → High split | High-split/return-path references | **Keep** | Separate 204/258 and return-path workflow information. |
| Tools → Why cards | Context/explanatory cards | **Keep as secondary explanation** | Keep contextual reference available; avoid making it compete with route actions. |
| Tools → Proof of performance | FCC proof-of-performance guide | **Keep** | Distinct compliance task. |
| Tools → Study | Study mode | **Keep** | Distinct training/reference use. |
| Files → Help & methods | Navigation, calculations and methods | **Keep but streamline duplicate links** | Keep substantive calculation/method/safety wording; remove duplicate route chooser entries if the main route task navigation changes. |
| Closeout → Acceptance | Acceptance profile and saved records | **Keep secondary** | Saved acceptance records are distinct from live route readings and preserve legacy data/export. |
| Closeout → Run sheet | Review/share/print report | **Keep** | Distinct closeout/export action. |
| Files → Back up project / Open project / Export RF levels / Print report | Back up, import, export, print | **Keep** | Distinct data handling actions; verify round-trip with synthetic data. |
| Top-level Home / Plan / Field / Tools / Closeout navigation | Main task groups | **Keep** | Clear task grouping; no evidence supports a total navigation redesign. |

**Calculator reachability inventory:** all eight under Tools → Calculators were reachable; the browser DOM contained 28 calculator/utility cards across `calculatorPanel`, `docsisHealthPanel`, `leakagePanel`, `fiberPanel`, `highSplitPanel`, `popPanel`, and `powerPmPanel` (exact stable title/ID inventory is in the sanitized controls artifact). Route TDR and other detailed planning utilities remain separate. Recommendation: preserve all; only consolidate duplicate entry paths into a route workbench. The 28 count is card instances in the loaded app DOM, not a verified distinct-formula count.

## Executed browser workflows

- **Start job:** Home → New blank job → selected 42/54 MHz. The plant chooser appeared and kept the existing job available.
- **Save/reopen:** Plan → Details → named “Synthetic Luna Audit”; Save now reported “Named job saved on this device.” Reopened the named job, which showed the same name.
- **Export:** Home → Back up project produced `CarpeNoctum_2.0_Alpha_build_4_Project.json` (3,795 bytes). Parsed JSON successfully; top-level keys were `version`, `example`, `setup`, `rows`, `power`, `project`, `node`, `job`, `frequency`, `sweepSetup`. This checked a synthetic blank job only; not original attachments or multi-job backup/restore.
- **Calculators:** rendered inputs produced outputs without page errors: 10 dBmV → −38.75 dBm / 70 dBµV / 3.162 mV / 0.0001333 mW at 75 Ω; uncorrelated 40 + 37 dBmV → 41.7643 dBmV; thermal CNR example (6.4 MHz, 15 dBmV, NF 8 dB, 10 equal contributions) gave noise floor −57.1628 dBmV and N-equal CNR 54.1628 dB; 100 ft at VP 0.85 produced 239.2 ns round-trip delay.
- **Route:** opened existing synthetic three-tap sample. It showed 261/993 MHz predictions (e.g. equipment input 29.9/37.6 dBmV at Tap 1; port 6.4/14.1 dBmV), feed topology, span, and route math. Its active count was zero. The tap row’s “Enter meter reading” navigated to the separate Readings task. Thus baseline route calculations and navigation were rendered, but an active-leg gain/readings/pad workflow was not exercised on this no-active fixture.
- Browser page errors: none during the recorded save/export and calculator workflows. These were targeted UI checks, not the project's automated release gate.

## Additional menu, dialog and conditional-control paths

The top Files disclosure was opened in Chromium and showed: Back up project, Open project (.json), Export RF levels, Print report, Help & methods, and Run sheet. Back up export was exercised; opening the file chooser/import, CSV, print, and run-sheet actions were not.

The New blank job flow opened the plant chooser; both plant options and Cancel were rendered, with only 42/54 selected. The Details screen exposed named-job metadata and Save now; the synthetic job was saved and reopened. Duplicate and Delete actions are present in named-job rows. Delete is destructive, so it was not activated; duplicate was also not activated. Confirmation logic, replace/sample warnings and the other modal outcomes were source-only reviewed in `night-sweep/jobs.js`.

Field → ONX files exposes project-open, test type, stage, asset/station, notes, local file selection, verify-saved-files and guarded unused-file cleanup. File selection/import, evidence preview/download/remove, and cleanup were not exercised because no synthetic file fixture was needed for the requested baseline controls review. Their visible and source-conditional action groups are in the sanitized controls artifact. Evidence remove/cleanup are source-only and were not activated. Catalog search/category/family selectors were rendered but no filters were executed. Project-acceptance, work-order, evidence-card, focus, and hidden-content variants are bounded by the active state snapshot; unrendered/conditional controls are listed separately when source evidence identified them.

Calculator branches found in source: Power sum has uncorrelated-level add, equal-carrier, and signal-minus-noise modes; Thermal CNR has thermal-chain and combine-CNR modes; Pad/EQ balance populates model-specific pad/EQ selectors after selecting a model; DOCSIS OFDM adds an occupied-bandwidth input for its alternate measurement basis. Only the default power-sum add and thermal-chain modes, dB converter and Echo delay received live calculated inputs/outputs. Alternate paths are source-only in this phase; keep them all.

The report plus sanitized controls file serve different purposes: the control JSON contains ID/label/recommendation and evidence status without form values. The larger raw snapshot at `/tmp/carpe-inventory.json` is a local evidence scratch file, not the shareable inventory.

## Baseline gap and limits of this audit phase

At this head the requested new **job-open → route workbench** implementation was not yet present in source or the standalone: `rg` found no `routeworkbench`, `routeWorkbench`, or `newroute` implementation. The separate Amp gain and Field Readings tabs were still present. This is a baseline observation only; do the combined-route re-walk after the integration is ready. Expected levels were visible on the sample route, but it had no active row; inline Before/After values, corrected measurement planes, per-leg pads/EQs, expected gain result, the gain acceptance vectors, marked-map auto-route and legacy route backup of readings were not yet exercised in this baseline phase.

No source/generated file was edited; no dependencies installed or updated; no full QA suite, emulator, physical phone, Safari/WebView, real map, real meter export, plant data, APK or signing check was run. The workspace is shared; recheck HEAD and artifact hash before any follow-up. Do not treat this baseline as final combined-build acceptance.


The sanitized control inventory is committed as [routes-sweep-baseline-controls.json](routes-sweep-baseline-controls.json). It omits form values and saved job records. The combined-build walkthrough is a separate record.
