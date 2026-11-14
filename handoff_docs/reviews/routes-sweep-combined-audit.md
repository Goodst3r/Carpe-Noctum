# Carpe Noctum combined route fieldtask audit

## Build and scope

- Generated app: `/workspace/carpe-routes-packaging/outputs/Night_Sweep.html`
- Final source HEAD: `931a01609ed00806dbc433ec3bf49d591a1d5478`
- Standalone HTML SHA-256: `539985c56ab4601fad60cd70c120dc91ea2183fb29bd490d2ba47c0ae7165990`
- Browser: bundled Chromium `chromium-1234`, headless, served locally at `http://127.0.0.1:8766/outputs/Night_Sweep.html`; no external transfer.
- Checked 2026-11-13 10:11–10:15 UTC. Viewports were emulated browser widths 320, 390, 430, and 1280 CSS px. No physical phone, emulator, or WebView tested.
- All synthetic map data and job content were invented acceptance fixtures. No private map or customer data used.

## Observed task inventory and recommendations

There are 35 `WorkflowUI.screens` IDs retained in source. Main task groups render 31 entries; Files → Help adds one separate path: Home 2, Plan 8, Field 7, Tools 12, Closeout 2. Gain, readings, and trial are retained IDs/aliases that route into the route workbench or existing workflows; they are not separate normal navigation entries. Recommendation: keep the 32 normal screen/task identities and retain the aliases for saved links/state compatibility. Keep the 8 calculators reachable as a dedicated calculator task; do not remove calculator cards.

| Group and visible task | Fieldtask | Recommendation |
|---|---|---|
| Home — Home | Start or resume a job | Keep as primary entry. |
| Home — Outage | Capture first-response prompts | Keep; distinct urgent field task. |
| Files — Help | Find task guidance and limitations | Keep as secondary reference. |
| Plan — Details | Job metadata, named jobs, open/new/duplicate/delete, work-order details | Keep; save/open is essential. Keep duplicate/delete scoped to explicit named-job actions. |
| Plan — Setup | Set launch frequencies, levels, source, cable temperature | Keep; required to calculate route. |
| Plan — Route & sweep | Build route, inspect expected levels, map-assisted route draft, station readings and gain review | Keep as normal job-open workbench; consolidate gain/readings page hops here. Keep map import and review gates. |
| Plan — Amp / node setup | Record installed equipment and exact manual/setup notes | Keep as a secondary detail task; distinct from route-level work. |
| Plan — Predicted levels | Review calculated route levels | Keep as a route result view; route workbench should remain the primary inline action surface. |
| Plan — Load & what-if | Estimate load and compare a temporary alternative | Keep; distinct planning task. |
| Plan — Supply PM | Record supply maintenance details | Keep; distinct operational task. |
| Plan — Sweep due | Review personal sweep reminders | Keep; distinct follow-up task. |
| Field — Meter setup | Record meter procedure/configuration | Keep; needed before measurements. |
| Field — Station records | Record per-station balance/sweep stages | Keep secondary access; inline route readings should cover ordinary station work. |
| Field — TDR | Locate cable distance on selected route span | Keep; distinct diagnostic. |
| Field — ONX files | Import/review ONX artifacts | Keep; distinct evidence workflow. |
| Field — Leakage | Capture leakage tests | Keep; distinct field record. |
| Field — Checklists | Track inspection/repair items | Keep; distinct checklist. |
| Field — Night log | Record shift handoff notes | Keep; distinct handoff. |
| Tools — Calculators | dB units, ripple, pre-EQ distance, OFDM power, echo delay and the remaining quick calculation cards | Keep all 8 cards reachable; verify runtime output below. |
| Tools — Frequency | Calculate a separate cable/passive path | Keep; separate from route state. |
| Tools — Limits | Look up editable frequency/target references | Keep. |
| Tools — References | Look up cable loss and tap faces | Keep. |
| Tools — Catalog | Search exact device models/part numbers | Keep; supports installed-model resolution. |
| Tools — DOCSIS health | Review health values | Keep. |
| Tools — Impairments | Review impairment cards and standing-wave search | Keep. |
| Tools — Fiber | Fiber color and link-loss budget | Keep; separate domain. |
| Tools — High split | Review band plans / high-split planning | Keep; separate planning task. |
| Tools — Why cards | Review SCTE concepts | Keep as reference. |
| Tools — Proof of performance | Review FCC limits and test rules | Keep as compliance/reference workflow. |
| Tools — Study | Practice questions | Keep as learning task. |
| Closeout — Acceptance | Record acceptance checks | Keep; distinct closeout. |
| Closeout — Run sheet | Review/print/export route and notes | Keep; distinct closeout. |

Collapsed details, map import, and file menus expose additional controls within those tasks. Source inventory also includes import dialogs, job dialogs, catalog filtering, and calculator-specific inputs. Destructive delete was not exercised. Controls outside the actual workflows above were audited source-side, not all dialogs opened in browser; do not treat this screen inventory as an assertion that every modal branch was executed.

## Executed route and import workflows

### PDF import and route draft

Loaded bundled synthetic marked PDF from the user-facing file picker at width 390. UI status: “5 map points recognized. Every imported connection needs review.” Extracted schedule preserved exact names and tags: North Launch / 01–N1, Oak Amp - A–A1, Branch Splitter–S1, South Amp / B–A2, Proposed Booster–B1. B1, marked absent, did not appear among route destinations. Chosen launch was North Launch / 01, port PORT 1, with Oak Amp - A, Branch Splitter, and South Amp / B selected.

The draft created three editable rows. `NAME`, `TAG`, and map model remained separate. HGD was auto-matched to a GainMaker HGD model; LE remained unresolved until explicit review. Before review, UI showed row-specific reasons (connection/span unverified, model mismatch/missing, cable, or output-port confirmation as applicable) and withheld expected results. The original map was explicitly not attached to the job; UI told operator to keep source file separately. Synthetic fixture was used to choose a specific 2-way splitter and a manual LE model; those are test selections, not plant facts.

After resolving connection/model/installed review and selecting route assumptions, expected values rendered: splitter each-output 26.47 dBmV at 54 MHz and 35.78 at 860 MHz; Oak Amp input 26.04 / 33.91 dBmV; South Amp input 26.20 / 34.62 dBmV. Entered synthetic 34 dB HGD and 28 dB LE gains. Result states showed gain available, output limit unknown, with 17.04 dB and 11.20 dB limiting margins at 54 MHz respectively.

### Raster import

Raster UI import recognized 5 points. OCR returned exact name “Oak Amp - A” while reading the tag as “Al” rather than “A1”. This is an observed row-local ambiguity and should remain visible for review; the name was retained verbatim. A separate cancellation issue was reported to lead: host preserves current rows after confirmation cancellation, but current build’s mount displayed success instead of cancellation outcome. That observation predates the final build; the final hash and successful cancellation recheck are recorded below.

### Readings, pads, legs, sticky context

Opened inline gain details and entered synthetic gain/targets for both active rows. On HGD, enabled shared input, filled Before and After low/high readings, selected TP/port planes, and entered corrections. UI displayed corrected values: input 10.00 dBmV, output 41.00 dBmV, measured gain 31.00 dB. Five pad/EQ controls accepted installed/change values and persisted in row state. Switched HGD to Auxiliary, entered leg-specific gain and After outputs, and confirmed the Main records remained present while Aux records were stored separately. Focused an inline Aux reading: sticky header showed “Station · Oak Amp - A”, Auxiliary selected, point selection remained Oak Amp - A.

A follow-up entered distinct stage values and verified they remain separate: Before outputs 39/41 dBmV and After outputs 45/46 dBmV. Corrected readings showed Before gain 31 dB and After gain 34 dB. No cross-stage coupling was observed.

### Save, reopen, export

Named synthetic job “Synthetic route integration audit” saved on-device. Started a second blank synthetic 42/54 job, opened the saved job by matching card, and confirmed the name, three route rows, route settings, map tags, branch parents, cables, separate Main Before/After readings, Aux After readings, leg selection, five pad/EQ installed/change pairs, and launch N1/PORT 1 restored. Exported the reopened job from Home as `CarpeNoctum_2.0_Alpha_build_4_Project.json` (9,280 bytes; SHA-256 `66f0fb638be8e367417f013008d60c050aadd21a3e54c8289efcb75910d0dcd1`). Export JSON retained all three rows, map tags, both Main and Aux record groups, pads/EQ, and launch data. Evidence count was zero, consistent with the importer warning that the source PDF is not attached.

## Responsive observations

With selected station Oak Amp - A, Auxiliary leg active, and an inline value focused, browser viewport widths 320, 390, 430, and 1280 all reported `documentElement.scrollWidth == innerWidth`. Selection remained on row r3 and leg remained Aux at every width. Screenshots: `/tmp/carpe-final-route-320.png`, `-390.png`, `-430.png`, `-1280.png`. These are desktop Chromium viewport emulations only.

## Runtime metadata and evidence limits

`WorkflowUI.screens` returned 35 IDs; visible group counts sum to 31 entries; Files → Help gives 32 normal paths. The three retained aliases are not separate normal navigation states. `TrainingJob.features.length` was 53. `Thresholds.rows.length` was 164; no full threshold validation result was collected. Opened Tools → Calculators and confirmed eight calculator groups by visible controls: dB/unit conversion, ripple, pre-EQ, OFDM, power, cascade, balance, echo. Their runtime IDs were `db`, `ripple`, `preeq`, `ofdm`, `power`, `cascade`, `balance`, and `echo`.

After lead supplied the final identity/context/cancellation build, repeated the targeted replacement-cancel workflow. Dismissed “Replace the current route with this map draft?”; mount displayed “Import cancelled; existing route unchanged.” Existing sample route names and IDs r1/r2/r3 were preserved, with no page errors. The browser fetched standalone SHA-256 `539985c56ab4601fad60cd70c120dc91ea2183fb29bd490d2ba47c0ae7165990`, matching the lead-provided final build. No source or generated application files were edited.
