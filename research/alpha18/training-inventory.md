# NightSweep 1.8 Alpha training inventory

Audited the exposed task navigation and calculator helpers against loadable synthetic data. The 1.7 complete example had two serial actives. The 1.8 library has seven exercises, 37 explicit feature choices and coverage for all 20 navigation screens (including Home and Help). The feature loader creates a seeded practice job through the existing preserving import path, then opens its guided step and intended field.

## Exercises

| Exercise ID | Steps | Scope |
| --- | ---: | --- |
| `complete` | 21 | 21 steps · GS7K / GainMaker GaN · mixed Scientific-Atlanta / GigaXtend / Technetix passives · six originals |
| `aoi-six-active` | 13 | 13 steps · A1 → A2 → A3 → A4 → A5 → A6 · synthetic marker arithmetic |
| `custom-curves` | 8 | 8 steps · manual launch table · custom cable / passive · reverse TDR and VF |
| `gainmaker-oem` | 8 | 8 steps · 42 / 54 MHz · exact OEM procedure and pilot module review |
| `gainmaker-dsim` | 9 | 9 steps · 42 / 54 MHz · historical pilot lookup and separate DSIM path |
| `gainmaker-manual` | 7 | 7 steps · 42 / 54 MHz · installed manual / thermal control path |
| `gs7k-node` | 10 | 10 steps · 42 / 54 MHz · conventional node hardware and reference review |

## Feature → loadable example

Use Home → Practice library → Load an example for any feature. Each choice loads actual synthetic values, tables, records or originals and opens its guided field. Physical procedure exercises deliberately leave unverified settings blank.

| Feature | Exercise | Guided step | Seeded example / task |
| --- | --- | --- | --- |
| Home, practice and backup | `complete` | `backup` | Seeded complete job, named-job preservation and portable backup. |
| Help, methods and build self-check | `custom-curves` | `help` | Entered tables and TDR settings make the documented calculation methods inspectable. |
| Launch, source, correction and temperature | `complete` | `launch` | 11 / 23 dBmV test points plus 20 dB, 86°F cable and identified GS7K source. |
| Route, branches and distances | `complete` | `route` | Nine populated points, real splitter output choices and separate branch distances. |
| Amplifier gain and reserve | `complete` | `gain` | Entered GaN HGD gain, reserve, output limits and matching input/output test-point example. |
| Installed equipment and exact manuals | `complete` | `equipment` | Conventional GS7K source plus two GainMaker HGD GaN station review drafts. |
| Equipment catalog and source references | `complete` | `parts` | Populated equipment route provides actual selected model names to look up. |
| Forward and return setup | `complete` | `sweepSetup` | Selected 42 / 54 profile with separate 38 dBmV return TX and independent injection / receiver fields. |
| Forward TDR and active boundaries | `complete` | `tdr` | Cable-side origin, 295 ft one-way distance and 25 ft lead give a known span hit. |
| Absolute, normalized and loss charts | `complete` | `sweep` | Populated mixed-brand branch traces and 54 MHz normalization reference. |
| Single-path frequency calculator | `complete` | `frequency` | 860 MHz exact cable / passive / launch overrides produce a 37.2 dBmV budget. |
| Meter readings and prediction error | `complete` | `readings` | Corrected GaN HGD test-point reading plus intentional tap mismatches. |
| Cable, tap and target references | `complete` | `reference` | 54 / 860 local design anchors, alternate available-carrier draft, selected cable, tap and unapproved target ranges. |
| Power load, voltage and branches | `complete` | `power` | 90 V / 15 A supply, junction, synthetic entered node / GaN amps and custom watts / PF. |
| Power what-if and Keep | `complete` | `trial` | Additional 300 ft and 0.75 A trial with a chosen parent and cable. |
| Named jobs and work-order details | `complete` | `job` | Synthetic ticket, node, times, symptom and resolution fields; previous work retained. |
| Original files and supported CSV | `complete` | `files` | Five readable synthetic CSV originals plus one original-only SVG attachment. |
| Leakage, maintenance and conversion | `complete` | `checks` | Partly reviewed inspection notes and 72 dBµV input. |
| Forward, return, punch and review | `complete` | `records` | Planning before/after rows, explicit unapproved criteria, injection and open punch item. |
| Run sheet, share, print and CSV exports | `complete` | `report` | Populated route predictions, meter readings, work notes and synthetic provenance. |
| Six serial active devices | `aoi-six-active` | `route` | Six AOI devices in one path; every marker output restores 34 / 46 dBmV. |
| Entered amplifier gain table | `aoi-six-active` | `gainTable` | A2 has three actual editable frequency/gain rows. |
| Derive gain from two corrected readings | `complete` | `gain` | 7.1 and 16.1 dBmV with equal 20 dB addbacks give 9 dB gain. |
| Tap faces and RG-6 drop splitter | `complete` | `drop` | Technetix Tap C has a 75 ft synthetic RG-6 table and explicit custom 4 dB drop-path loss. |
| Map note and step-by-step arithmetic | `custom-curves` | `arithmetic` | Custom loss tables and a populated note with inspectable exact arithmetic. |
| Custom cable and passive loss tables | `custom-curves` | `custom` | Actual three-row custom cable and through/branch loss tables. |
| Manual source and launch table | `custom-curves` | `launch` | Table mode is selected, three launch rows loaded and duplicate TP correction off. |
| Reverse TDR and velocity correction | `custom-curves` | `tdr` | 100 × 0.88 / 0.80 − 25 = 85 ft toward source; route hit at 115 ft. |
| Available carriers and local targets | `gainmaker-dsim` | `launch` | 57 / 753 MHz draft seeded under separate 54 / 860 local design anchors. |
| OEM AGC installed control path | `gainmaker-oem` | `agc` | OEM AGC selected; DSIM settings and unverified physical values remain blank. |
| DSIM and historical pilot-code lookup | `gainmaker-dsim` | `pilot` | DSIM-SG and 711 MHz QAM lookup example; compatibility and pilot lock unverified. |
| Manual / thermal installed control path | `gainmaker-manual` | `equipment` | Manual / thermal selected with no inferred DSIM or OEM control values. |
| Conventional GS7K procedure | `gs7k-node` | `equipment` | Conventional 1.2 GHz / 42 / 54 hardware identity; unknown physical readings blank. |
| dBµV ↔ dBmV conversion | `complete` | `checks` | 72 dBµV gives 12 dBmV; reverse conversion is editable. |
| Return injection and receiver records | `complete` | `records` | 40 + 20 + 1 = 61 dBmV budget; distinct receiver-plane planning record. |
| Before / after evidence comparison | `complete` | `files` | Sweep and Ingress before/after CSV pairs contain different synthetic responses. |
| Portable backup and recovery | `complete` | `backup` | Project export includes all six originals, practice provenance and reviewed steps. |

## Corrected complete field workflow

The complete 21-step exercise now follows a conventional GS7000 / GS7K 1.2 GHz node on 42/54 MHz, two GainMaker HGD GaN 42/54 actives and mixed Scientific-Atlanta, GigaXtend and Technetix passives. Both actives use catalog ID `active_gm_gan_hgd`; no unsupported GaN LE is invented. The exact path is:

| Point | Model / identity | Parent | Incoming cable |
| --- | --- | --- | --- |
| Source | `gs7000-12g`, 42/54 MHz | — | — |
| r1 | GainMaker HGD GaN A1 | Source | 800 + 20 ft P3 .750 |
| r2 | Scientific-Atlanta SAT MM 4-23 | r1 through | 250 + 10 ft P3 .625 |
| r3 | GainMaker HGD GaN A2 | r2 through | 600 + 20 ft QR .715 |
| r4 | GigaXtend XSC-2-959 | r3 through | 100 + 10 ft P3 .625 |
| r5 | GigaXtend GTSG-TAP-4-20-STD | r4 low-loss-output | 300 + 10 ft P3 .500 |
| r6 | Technetix OTTZ-4-17 | r5 through | 250 + 10 ft P3 .500 |
| r7 | Scientific-Atlanta SAT MM 4-23 | r4 high-loss-outputs | 200 + 10 ft P3 .625 |
| r8 | Explicit custom inline loss | r7 through | 100 ft P3 .625 |
| r9 | Cable-only endpoint | r8 through | 100 ft P3 .500 |

Source hardware capability is 1218 MHz; entered node operating and route upper are 1000 MHz because the Scientific-Atlanta passive reference stops there. The selected profile ID `1002` is a container, with entered equipment/planned upper 1000 MHz and available spectrum 860 MHz. Synthetic source test-point readings 11 / 23 plus one 20 dB correction give local design anchors 31 / 43 dBmV at 54 / 860 MHz. A1 uses entered 9 / 18 dB gains; A2 uses an entered 54,8 / 550,12 / 860,15 gain table. No archived scalar manufacturer gain is substituted as flat response.

The node and two GaN loads are explicitly synthetic entered 0.75 / 0.60 / 0.45 A. Exact GaN current curves and commissioning procedures remain unverified. The separate operator return TX reference is 38 dBmV; the independent generator budget 40 + 20 + 1 = 61 dBmV and receiver references remain distinct. Sweep and OneCheck originals use 54–860 MHz; ingress originals stay within 5–42 MHz; the TDR diagram identifies GaN HGD A2. The RG-6 drop uses synthetic 1.8 / 5.4 / 6.2 dB per 100 ft at 54 / 550 / 860 MHz and an explicit synthetic 4 dB custom drop-path loss, avoiding an unsupported fourth manufacturer claim. At 54 MHz total drop-path loss is 1.35 + 4 = 5.35 dB.

TDR geometry is unchanged: A2 is at 1700 route ft, and 295 − 25 = 270 ft reaches coordinate 1970 ft, 160 ft into the r5 span. The exact one-path frequency checker at 860 MHz has 5.8 dB loss and 37.2 dBmV receive budget. See `complete-workflow-wolfram.json` and the independent numerical audit for fresh reference values and application comparison.

## Six-active reference cases

The single RF path is source → A1 HGD → A2 LE → A3 HGD → A4 LE → A5 HGD → A6 LE → 250 ft cable-only end. Each active has its own 300 ft incoming synthetic custom-cable span. The Vecima launch node is excluded from the six-active count.

- At 261 MHz each stage loses 3 dB in cable and adds 3 dB entered gain: 34 → 31 → 34 dBmV.
- At 993 MHz each stage loses 9 dB and adds 9 dB entered gain: 46 → 37 → 46 dBmV.
- The final 250 ft cable-only endpoint is 31.5 / 38.5 dBmV at the two markers. The 3 dB requested gain reserve is intentionally unmet.
- TDR starts after A6 at 1800 route ft: 125 − 25 = 100 ft into the final cable, at route coordinate 1900 ft. The same event measured from Launch crosses actives and is blocked.
- The separately entered power circuit uses six synthetic 0.50 A active loads and a synthetic 0.75 A node load. RF custom tables do not define DC resistance. These are teaching loads, not manufacturer consumption specifications.

## Custom-data reference cases

At 261 MHz the first 100 ft span loses 1 dB. The entered passive loses 1 dB through or 10 dB on its branch: source 34 produces 32 dBmV through and 23 dBmV branch. At 993 MHz source 46 loses 3 dB cable and 2 / 11 dB passive: 41 through and 32 branch. Custom cable data are already at temperature. Reverse TDR is 100 × 0.88 / 0.80 − 25 = 85 ft from the 200 ft origin, giving route coordinate 115 ft.

## Compatibility and data preservation

The complete guide is updated to GS7K/GaN while retaining 21 step IDs; focused OEM/DSIM/GS7K guides retain their original 8/9/10 steps. The corrected complete exercise carries scalar `trainingRevision: gs7k-gan-alpha18-v1`; the other new variants retain `alpha18-v1`. All retain project schema 1 and training marker `guided-1.5`. The six-active AOI and custom-data factories explicitly share an unchanged high-split seed, so correcting the complete exercise does not change their RF, power or band semantics. Older complete exports, including the preceding 1.8 Vecima/AOI version, retain data/progress/original bytes and hide the incompatible guide until an explicit reset archives that copy. Prior jobs are preserved before switching; six original complete-exercise attachments retain their hashes/bytes through portable backup. Unknown requested exercise IDs reject before switching. Retained unknown or newer variants retain data and display an incompatibility notice instead of a mismatched guide.

## Interface reference and verification scope

Read-only Figma session `bfd4ce1d-5bd8-4c3a-b95b-d460fb49f997` inspected the existing [Launch](https://www.figma.com/design/C1zOM5qj4LF3YOd5NMCN8G?node-id=4-2410) and [Equipment setup](https://www.figma.com/design/C1zOM5qj4LF3YOd5NMCN8G?node-id=4-2572) reference frames: both 390 logical units wide, 222 descendants total and 32 action/input instances; all action/input bounds are at least 44 units in both dimensions. Current library controls preserve that hierarchy and use 48 px action targets. No Figma design was changed. The screenshot endpoint returned metadata, but downloading its temporary image returned HTTP 403, so no screenshot inspection is claimed. This prior concept does not establish current-app correctness. Root release verification records the actual browser/runtime checks.

New `qa/training-library.test.cjs` exercises feature loaders, topology, golden marker/TDR cases, control visibility, cancellation, future variants, named-job preservation, reviewed progress and portable original bytes. The initial run failed all 11 checks before implementation; current results belong in the release validation report.
