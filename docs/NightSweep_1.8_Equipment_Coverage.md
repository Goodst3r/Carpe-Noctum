# NightSweep 1.8 Alpha build 2 — Equipment coverage

Spencer Williams · Updated November 11, 2026

The review covers every catalog entry's identity, numeric structure and stated source scope, with targeted comparisons to original manufacturer tables and applicable manuals. It does not establish that every inherited equipment table cell was freshly re-transcribed or physically measured.

## Catalog inventory and audit

| Inventory | Current selections | Retained including legacy |
| --- | ---: | ---: |
| All selection records | 556 | 561 |
| RF equipment selections | 514 | 516 |
| Active amplifier / LE configurations within RF | 23 | 25 |
| Nonactive selections within RF | 491 | 491 |
| Cable selections | 17 | 17 |
| Power-equipment selections | 22 | 25 |
| Node profiles | 3 | 3 |

Five UBT records are retired from current equipment/workflows: two RF outputs and three power presets. They remain only for old saved-job readback. HGBT and passive unbalanced three-way outputs are retained as current equipment. Selection records are not distinct physical units: RF and power profiles can describe the same hardware.

The all-entry inventory checks the full retained **1,324 loss/current curves / 14,126 table rows**, with eight companion watt tables (84 rows) checked separately. These are data counts, not automated test counts. The reproducible per-ID JSON/Markdown inventory, input hashes and runtime boundary checks are in `night-sweep/research/alpha17-equipment-refresh/`. Every current selection has source/configuration coverage; every current active, node and power selection maps to a manual, datasheet or explicit request/gap record. A datasheet/request is not an exact commissioning manual.

Structural checks found no duplicate collection IDs, duplicate normalized models within a family, duplicate output IDs, terminal taps with through paths, nonfinite/negative losses, unordered points, overlapping bands or common-point nominal values above maximum. Published cable inner-plus-outer resistance agrees with the stated loop values. This verifies structure and the numerical relationships checked, not every original source transcription.

The review found a calculation defect at nonshared upper endpoints in banded passive data. Published 5–10 and 11–300 MHz bands previously made 10 MHz unavailable. The correction includes that endpoint while retaining the next-band convention at genuinely shared boundaries. For the 21 explicitly identified Scientific-Atlanta Multimedia through-loss curves, the documented larger-adjacent-bound estimate is used across fractional printed gaps. Unmarked or arbitrary missing bands remain unavailable. This estimate is a calculation convention, not a new manufacturer measurement.

## User-local targets remain separate from manufacturer data

The user supplies **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz** as local non-high-split forward design anchors, plus a separate **38 dBmV return TX reference**. These are operator references, not manufacturer limits. Confirm actual downstream carriers/channel-power convention, the intended transmitter and measurement plane before application.

**38 dBmV is a level, not MHz.** Actual return TX channels/frequencies and the service/sweep plan remain unspecified and must be entered from the verified operator plan. The approved OEM/DSIM pilot is detector/module-specific; a manual-backoff test frequency comes from its exact model/revision chart. Neither is automatically selected by the 54/860 MHz design anchors, and 711 MHz is a historical DSIM lookup exercise only.

The source frequency matrix keeps OEM backoff columns **445.25/547.25/870/1000 MHz** separate from DSIM-SG Rev H’s **547/750/870 MHz** backoff references and the actual approved pilot. System-amplifier and LE backoff charts differ; **860 MHz is not a printed OEM backoff column**, and no automatic rounding/interpolation is supplied. Thermal OEM setup does not use that manual chart. **54 MHz is outside LGD 65/86 and every catalog Quantum18 forward band**; use approved in-band job markers. Quantum18 HGD/HGBT profile frequencies/power follow their exact DS Auto configuration; LE/BA setup-frequency procedures remain manual gaps.

In **Tools → References**, the optional **Local non-high-split: 31 @ 54 / 43 @ 860 · TX 38** button updates the selected eligible profile’s forward design anchors and the separate 42 MHz TX reference to 38 dBmV after confirmation. Measured Route Setup fields and existing records remain unchanged, and criteria remain unapproved. It is blocked for return ceilings of 204 MHz or above and for bands that exclude 54 MHz; do not treat all lower-split hardware as 54 MHz-capable. In **42/54 Sweep setup**, the fields are **Operator return TX reference (dBmV)** and **Return TX frequencies / service plan**. They stay separate from injection, generator and received/CMTS levels, and add no 42 MHz generator calculation. The read-only **Setup frequencies & job levels** card in Equipment setup displays these selected-job references, not measured levels or manufacturer ratings.

OEM/DSIM practice uses 54/860 design anchors and synthetic raw 11/23 dBmV + one 20 dB addback = 31/43 dBmV. GS7K practice carries those design references while actual markers/readings/coupling remain blank. The complete GS7K/GainMaker HGD 42/54 exercise uses 54/860 MHz at 31/43 dBmV, with six synthetic originals. No design reference is a measured reading or field acceptance.

### Available-carrier target conversion

Available ranges such as **57–753 MHz** or **63–550 MHz** do not redefine the base **31@54 / 43@860** local design anchors. Calculate an estimated target at each confirmed setup frequency using the selected **square-root-frequency cable-law** or **linear-MHz** curve. The initial square-root choice is a model, not an operator-approved tilt shape or a manufacturer guarantee.

| Confirmed setup-frequency example | Square-root estimate: low / high (dBmV) | Linear-MHz estimate: low / high (dBmV) |
| --- | ---: | ---: |
| 57 / 753 MHz | **31.11 / 41.97** | 31.04 / 41.41 |
| 63 / 550 MHz | **31.32 / 39.79** | 31.13 / 38.38 |

The original 54/860 MHz anchors remain 31/43 dBmV (12 dB rise). Fresh Wolfram evaluation in `night-sweep/research/alpha17-setup-frequency-wolfram.json` checks these explicit formulas/endpoints; it does not certify a manufacturer equalizer or operator-approved tilt shape.

Use **Tools → References → Setup targets at available carriers** with **Available low/high carrier (MHz)** and **Target curve**. Inputs start blank. It requires **54 ≤ low < high ≤ 860 MHz**, the compatible non-high-split profile and hardware support for both base anchors; no target is extrapolated. A known entered live-spectrum upper limit is enforced, while blank live coverage remains unverified.

Conversion drafts travel with full project backups. Equipment setup separates computed carrier targets from base profile anchors; Run-sheet HTML/text/CSV includes frequency, calculated level, curve and base-reference context without marking measurement or acceptance.

Example pairs populate conversion draft frequencies only; base design and measured records remain unchanged. Confirm actual carrier centers rather than assuming spectrum edges, channel-power convention, physical plane and approved local procedure. OEM/DSIM/GS7K practice includes this step without changing the base examples or recording a measurement.

## Node and active setup-manual coverage

| Equipment | Setup source | Applicability and remaining gap |
| --- | --- | --- |
| Cisco GS7000 standard 1 GHz | [Cisco installation and operation guide](https://www.cisco.com/c/dam/en/us/td/docs/video/access_edge/Nodes/GS7000/Cisco-GS7000-GainMaker-Scalable-4-Port-Node-Installation-and-Operation-Guide.pdf), OL-29643-02, Chapter 4 | Standard node only; confirm installed launch, receiver, transmitter and routing. The refreshed review retrieved the full original manual and checked its forward/reverse procedure. Receiver/FCM routing, OIB padding and output pads/EQs must match the installed segment. |
| Cisco GS7000 standard 1.2 GHz | [Cisco installation and operation guide](https://www.cisco.com/c/dam/en/us/td/docs/video/access_edge/Nodes/GS7000/Cisco-1_2-GHz-GS7000-Node-Installation-and-Operation-Guide.pdf), Chapter 4 | Standard segmentable node only. First published October 2015; current support listing November 2015. Use its receiver-specific level and EQ tables. SHO, Intelligent and RPD nodes need distinct applicable procedures. |
| GS7000 SHO / Fiber Deep and Intelligent power variants | [Cisco installation-guide index](https://www.cisco.com/c/en/us/support/video/gs7000-node/products-installation-guides-list.html); Intelligent hardware/software 2018 and Manager 24.1 (2024) | SHO common/left-right EQ arrangement differs from standard segmentable launch; its 21/22 dB factory-tilt descriptions conflict. Conventional LCM Auto Set-Up discovers modules; Intelligent LCS Auto Setup adjusts forward OIB drive after saved targets and enabled Port 1. It does not align return. No physical RF amplifier test points are present on the Intelligent node. |
| Vecima EN9000 / EN9000U | [Newest public family brief located: September 2026](https://vecima.com/wp-content/uploads/2026/09/Vecima-Product-Brief-EN9000-Sep2026.pdf); [documentation/support](https://vecima.com/company/product-support/) | Product brief is not a commissioning manual. The RF table is conditioned on ERM3; separate ERM3/ERM4 capabilities must match the installed RPD. The −20 ±1 dB test-point value remains sourced to May 2024, not repeated by the newer brief. Exact EN9000/RFAM/RPD/firmware commissioning manuals require customer access. |
| GainMaker 1 GHz GaAs HGD / HGBT / LGD system amplifiers | [Historical Cisco-authored system amplifier guide](https://manualzz.com/doc/59690642/cisco-870-mhz-gainmaker-amplifiers-guide), internal publication OL-31156-01, February 2014 | Mirror title says 870 MHz; the document itself identifies the 1 GHz platform. Exact current scopes are HGD/HGBT 42/54 and LGD 65/86. Separate OEM AGC manual-backoff/thermal branches and thermal-only methods are mapped. Historical copy is labeled; ACI DSIM is a separate fitted-control path. |
| GainMaker 1 GHz LE, manual / thermal / AGC | [Historical Cisco-authored LE guide](https://studylib.net/doc/18909323/1-ghz-gainmaker-broadband-amplifier-platform-line), OL-31155-01, 2014, Chapter 3 | Apply the chapter for the installed control mode. Do not substitute conventional AGC pad/backoff for ACI DSIM. Original manufacturer PDF is unavailable through the reviewed access route. |
| GainMaker GaN HGD 1 GHz 42/54 | [Manufacturer documentation request/reference](https://www.cisco.com/c/en/us/products/video/gainmaker-amplifiers/index.html) | Exact installed GaN I&O/control procedure remains unresolved. The historical generic system-amplifier guide does not establish it. No automatic pad/backoff instructions are assigned. |
| AOI Quantum18 HGD / HGBT, five catalog splits | [Historical manufacturer-authored SA I&O mirror](https://www.manualslib.com/manual/3696193/Aoi-Quantum18.html), V02102025, pp38–50 | Original AOI PDF returned HTTP 404 during fresh review. The mirror is explicitly historical; manufacturer request access must confirm latest-issued applicability. Save downstream profile → DS Auto → optional DS Manual → upstream from last amplifier → ALSC after both paths. This does not establish LE/BA directions. |
| AOI Quantum18 LE | [Manufacturer product and document request](https://ao-inc.com/products/hfc-networking/hfc-amplifiers/) | Exact public LE I&O guide was not located. Quantum12 LE or Quantum18 HGD/HGBT instructions are not substitutes. |
| AOI Quantum18 BA | [Manufacturer product and document request](https://ao-inc.com/products/hfc-networking/hfc-amplifiers/) | Exact BA I&O guide was not located. No HGD/LE alignment sequence is presented as BA setup. |
| ACI DSIM-SG | [ACI technical manual](https://acicomms.com/wp-content/uploads/2021/04/04.-DSIM-SG-TechManual-Rev-H-210408b.pdf), Rev H, April 8, 2021 | Confirm exact DSIM/RF-module compatibility and approved pilot. Supply-voltage figures conflict with later DSIM datasheet Rev AB; verify installed module before applying thresholds. |
| ACI DSIM app | [ACI app guide](https://acicomms.com/wp-content/uploads/2021/03/11.-DSIM-App-Manual-Rev-B-210324.pdf), Rev B, March 24, 2021, p11 | The app guide describes supervisor-supplied pilot-channel keys. The separately user-supplied Rev A pilot-code table is included separately with exact-match lookup; it is not a universal password or proof of firmware compatibility. |
| ACI DSIM-A | [ACI variant datasheet](https://acicomms.com/wp-content/uploads/2022/08/10.-DSIM-Data-sheet-Rev-AB-220817.pdf), Rev AB, August 17, 2022 | Distinct from DSIM-SG. The historical Rev T guide is linked separately; it does not establish applicability to the later 1218 MHz DSIM-A-MDL-1201 variant. SG settings are not borrowed. |

### Where to find GS7K setup

In the app, use **Route & sweep → Setup → Node output**, select the exact standard **GS7000 1 GHz** or **1.2 GHz** model and installed split/port, then choose **Source setup & manual**. **Route & sweep → Amp / node setup** also opens the launch source’s applicable guide. Standard-node setup covers optical receiver/routing identification, model-specific receiver attenuation, OIB receiver padding, shared-port output pads, path EQs and separate return setup. Enter approved job targets; manual examples and published composite ratings do not populate launch levels.

Current launch Equipment setup selectors cover **standard GS7000 1 GHz and standard 1.2 GHz** only. SHO/Fiber Deep, Intelligent and retrofit-RPD documents remain exact-variant source references, not additional selectable launch/setup profiles. Conventional LCM module discovery is separate from RF balancing. Intelligent-node forward Auto Setup has its own software/manual conditions; it does not align return.

**Home → Open GS7K node practice** is a separate ten-step standard GS7000 1.2 GHz / 42/54 starter. It covers identity, model/manual selection, receiver/routing, standard forward setup, return handoff, sweep workflow, records and backup. Launch/TP correction remains unverified; no RF route rows, evidence files or captured traces are supplied. It sits alongside the complete 21-step GS7K/GainMaker HGD workflow and focused OEM AGC/DSIM paths. A separate 13-step Vecima/AOI example covers six serial actives at 204/258 MHz. The portable file is **NightSweep_1.8_GS7K_Practice.json**. None of these practice jobs establishes hardware alignment or acceptance.

### Installed gain control and complete method

Equipment setup distinguishes **OEM GainMaker AGC**, **ACI DSIM** and **Manual / thermal control**, then offers the exact model's **Documented setup method**. OEM **Manual backoff → OEM AGC** and **Thermal setup → OEM AGC** are alternatives. S1 = 2 and the station's exact temperature/frequency chart prepare the first branch before pad/EQ adjustment; S1 = 1 prepares the thermal branch without that manual chart. Both follow their documented transition to S1 = 3, AGC GAIN matching and output verification after settling. No universal OEM settling timer is supplied.

The cited conventional 1 GHz **GaAs HGD/HGBT/LGD** relationships use corrected **MAIN-output pilot dBmV − 34 dB**; applicable **1 GHz AGC LE** uses corrected **output-pilot dBmV − 29 dB**. These do not apply to DSIM or unresolved GaN instructions. The OEM manuals describe analog video pilots; an exact OEM QAM detector-offset bulletin was not recovered. The −6 dB distortion-loading relationship is not an AGC correction.

Thermal-only procedures distinguish amplifier-only (S1 = 1) from amplifier-plus-coax (S1 = 3); the warm/cold procedure and exact equipment must match. A manual LE has no Bode and S1 has no operating-mode effect. Checkmarks and notes are bound to model/manual/band/control-method context; changing context requires new review, while old job information remains preserved.

### Supplied pilot-code guide and historical setup revisions

The lookup adds the **user-supplied ACI iPhone/iPad Pilot Channel Code Guide, Rev A, pp 2–5**. Its **86 literal rows** cover channels **52–94 and 100–142**. Users match channel, Analog/Digital type and source-listed MHz, then copy the exact eligible code. No formula generates additional entries. There is no supplied row for channels 95–99 or 303 MHz. The guide photographs are the source for this table; no public download URL is asserted.

| Digital channel | Source frequency | Exact table code |
| ---: | ---: | --- |
| 110 | 711 MHz | `@@?<A` |
| 88 | 609 MHz | `GG<A` |
| 64 | 465 MHz | `EC<A` |

Channel 100 is an unresolved source exception: the row prints analog **649.25 MHz / `HD<@`** and digital **651 MHz / `HD<A`**. Lookup flags this row and blocks copying while unresolved. No inferred frequency or replacement code is used. Historical table transcription is not hardware, firmware, ACI-app compatibility, alignment or acceptance validation.

[DSIM-SG Rev E](https://thomasonbbs.com/store/pc/catalog/DSIM-SG%20TechManual%20Rev%20E%20151003.pdf), October 3, 2015, pp 2 and 10, calls for **10 dB AGC pad on LE** and **6 dB on the applicable HGD**; Rev H calls for **0 dB**. These procedures must be matched to the installed module and applicable revision, rather than combined. The [historical DSIM-A Rev T guide](https://acicomms.com/wp-content/uploads/PDF/01.-DSIM-A-TechManual-Rev-T-171214.pdf), December 14, 2017, is available as a reference; it must not be assigned automatically to the later **1218 MHz DSIM-A-MDL-1201** variant.

The SG Rev G/H physical-controller workflow has eight ordered steps and its own temperature-preparation/fallback guidance. The separate ACI app Rev B guidance uses AGC Prep attenuation controls; raw position counts are not dB. Reviewed control/method selections are included in job records and report exports, and do not mark pilot lock or acceptance.

Manufacturer-authored historical copies are permissible evidence but remain labeled by host, revision and applicable scope. Opening source links requires a connection. Reviewed setup summaries and local notes remain available offline; original full manuals are not silently bundled or claimed to be cached.

## Passive family coverage

All 34 nonactive families are inventoried below. “Primary reviewed” means selected exact-model tables, scope or paths were checked in this review; it does not mean every family cell was independently re-transcribed. “Retained” means the previous table/provenance remains with its qualification. Custom selections have no manufacturer values until the technician supplies applicable data.

| Family | Selections | Review scope |
| --- | ---: | --- |
| ATX GigaXtend SGP 1.2GHz AC continuity | 8 | Primary reviewed: ANW1524 / current ATX product table |
| ATX GigaXtend SGP 1.2GHz standard | 7 | Primary reviewed: ANW1480 / current ATX product table |
| ATX GigaXtend SGT 1.25GHz | 18 | Primary reviewed: ANW1479 / current ATX product table |
| ATX GigaXtend XS 2GHz | 7 | Primary reviewed: ANW1402 / current ATX product table |
| ATX GigaXtend XS 2GHz flat taps | 23 | Retained with prior source qualification; not freshly cell-verified |
| ATX GigaXtend XS 2GHz slope taps — manual data | 11 | User data required |
| Antronix CMC5000 DROP / premises / AC-blocking | 3 | Retained with prior source qualification; not freshly cell-verified |
| Cable-only | 1 | Cable segment; no equipment loss |
| Cisco Surge-Gap 1.25GHz | 7 | Retained with prior source qualification; not freshly cell-verified |
| Manual / unidentified legacy | 4 | User data required |
| Milenium 1.2 GHz E-option coupler | 1 | Retained with prior source qualification; not freshly cell-verified |
| Milenium 1.2 GHz G2 line passives | 7 | Retained with prior source qualification; not freshly cell-verified |
| Milenium 1.2 GHz G2 taps | 28 | Retained with prior source qualification; not freshly cell-verified |
| Milenium 1.2 GHz continuous RF/AC line passives | 7 | Retained with prior source qualification; not freshly cell-verified |
| Milenium 1.8 GHz upgrade faceplate | 25 | Retained with prior source qualification; not freshly cell-verified |
| Milenium NXT 2.0 GHz line passives | 7 | Retained with prior source qualification; not freshly cell-verified |
| Milenium NXT 2.0 GHz taps | 24 | Retained with prior source qualification; not freshly cell-verified |
| PPC 1.8 GHz mainline | 31 | Primary reviewed: Line Passives r3_06282024 pp2–3; Line Taps pp2–4 |
| Regal RL12 1.2 GHz passives | 7 | Primary reviewed: CommScope copyright2022, p2 |
| Regal RMT10 original 1 GHz | 30 | Retained with prior source qualification; not freshly cell-verified |
| Regal RMT2000 1 GHz narrow body | 19 | Retained with prior source qualification; not freshly cell-verified |
| Regal RMT2000 1 GHz wide body | 27 | Retained with prior source qualification; not freshly cell-verified |
| Regal RMT212 1.2 GHz narrow body | 17 | Primary reviewed: CommScope copyright2021, p2 |
| Regal RMT212 1.2 GHz wide body | 24 | Primary reviewed: CommScope copyright2021, p3 |
| Scientific-Atlanta Multimedia 1GHz | 24 | Retained with prior source qualification; not freshly cell-verified |
| Scientific-Atlanta Multimedia Stretch 1GHz Rev.A | 24 | Retained with prior source qualification; not freshly cell-verified |
| Scientific-Atlanta Multimedia mainline 1GHz | 7 | Fresh archived original: 714414 Rev A, September 1999 p2; all 72 maximum-loss cells and three nominal coupling values matched |
| Scientific-Atlanta Surge-Gap 1GHz | 7 | Retained with prior source qualification; not freshly cell-verified |
| Technetix LH100 1.2 GHz mainline | 7 | Primary reviewed: 12/2023 EN/V1, pp1–2 |
| Technetix LH100 1.8 GHz mainline | 6 | Primary reviewed: 05/2024 EN/V3, pp1–2 |
| Technetix OTTZ 1.8 GHz | 24 | Retained with prior source qualification; not freshly cell-verified |
| Technetix XFO Regal Narrow 1.8 GHz upgrade | 17 | Primary reviewed: 06/2026 AE/V8, pp3–5 |
| Technetix XFO Regal Wide 1.8 GHz upgrade | 24 | Primary reviewed: 06/2026 AE/V8, pp3–6 |
| Technetix XG 1.8 GHz mainline | 8 | Primary reviewed: 05/2025 EN/V14, pp2–3 |

## Cable and power limits

All 17 cable tables received ordering, finite-value, source and domain checks. P3 .625's current manufacturer page confirms the DC resistance basis: 0.84 Ω/kft inner plus 0.26 Ω/kft outer equals 1.10 Ω/kft loop at 20°C. Its retained attenuation values were corroborated in cached manufacturer-authored specifications returned through independent search, but the old live PDF link was unavailable and no new physical attenuation measurements were performed. Other inherited cable cells remain qualified historical/source data; no loss is extrapolated beyond their recorded endpoints.

Power data must match the complete installed station, supply waveform, modules and operating voltage. Node review compared the six GS7000 current/watt tables with their original configuration-specific sources. Their 45–90 VAC table domain remains distinct from a 33 VAC undervoltage cutoff. The EN9000 still requires actual measured/configuration load: the September 2026 brief’s 180 W PSU output and 200 W thermal dissipation are distinct quantities; neither defines typical AC input consumption. DSIM, unverified GaN HGD and AOI HGBT/BA configurations remain measured-load selections rather than borrowed HGD/LE curves.

Passive temperature deviations remain source notes. The cable-temperature factor does not automatically model temperature-dependent passive changes. A maximum table, typical curve, local target, technician value and measured reading retain separate meanings. Missing values stay unavailable.

## Verification limits

The all-entry catalog audit and targeted source review are engineering checks, not a certification of the installed plant or proof of field acceptance. Original field photographs cannot establish amplifier gain without paired input/output readings and their reference planes. SC-QAM and OFDM PLC/block metrics remain separate. Physical Android/iPhone installation, offline cold starts, picker behavior, saved evidence retention and field operation require their own device records.

The historical **1.7 Wolfram review** returned 15 named synthetic reference results; 18 current-app numerical/rejection comparisons passed within the recorded tolerance. Evidence is in `night-sweep/research/alpha17-numerical-audit.md` and its returned-reference/comparison files. This verifies those arithmetic cases, not manufacturer specifications or field assumptions. The 1.6 math audit remains historical supporting evidence.

Context7/MDN clipboard and storage documentation was reviewed: copying requires a supported user action and retains manual-copy fallback; quota/eviction failures require an external project backup. This review does not establish physical Safari/WebView behavior. Final integrated application, browser, APK and packaging results are recorded in the actual release-validation record; no current release-wide pass count is inferred from earlier builds.

## 1.8 audit update

The 1.8 local audit retains the equipment inventory and exact-model source qualifications. Current runtime/catalog structural results and representative independent arithmetic are recorded in `research/alpha18/`; the previous 1.7 review described above remains historical. The complete workflow uses GS7K/GainMaker HGD 42/54, mixed Scientific Atlanta/GigaXtend/Technetix passives and 54/860 MHz anchors. The separate six-active synthetic AOI cascade stays 204/258; custom curves and manual/thermal starters complete the seven-exercise library. See `NightSweep_1.8_Training_Coverage.md` for the feature-to-example map. Current verification does not retranscribe every manufacturer table cell or establish physical commissioning.

## Build 2 validation

Build 2 retains the catalog and exact-model source qualifications, including the actual Scientific Atlanta **SAT MM 4-23** identity in the complete guide. Current RF/power property and manufacturer-operating-case replays are recorded in `research/build2/MATH_BACKTEST.md`; earlier table/source reviews remain historical supporting evidence. No fresh retranscription of every manufacturer cell or field acceptance is implied.


## GainMaker cable EQ references added for the next build

The shared accessory library separates forward cable 1 GHz / 1002 MHz (blue), forward cable 1.2 GHz / 1218 MHz (green), standard return 42 MHz and standard return 204 MHz. In **Tools → Catalog** and **Tools → References**, all 68 nominal choices are shown with branded part identifiers, source/revision/page, typical insertion-loss cells and estimate/unknown status. Source facts: [ATX ANW1513 Rev.02/2021](https://digicomm.com/wp-content/uploads/2021/07/ANW1513_GigaXtend_GMC_Amp_Accessories.pdf) pp.2/4/5; Cisco OL-31156-01 p.98 standard 42 intermediates; Scientific Atlanta 716336 Rev D pp.2/6; Cisco C78-736684-02 Table 8 and C78-736468-03 pp.10–11 accessory names only. Retired source access and source-specific conditions are shown; ATX temperature/tolerance is unspecified, while 716336 typical references are 20°C.

No new installed amp model or automatic reverse solver is added. Existing 1 GHz input-EQ/input-pad profiles, model bands and procedure order stay unchanged. Cisco's 1.2 GHz LE uses input AND output EQs; a loss table alone does not source that module's procedure. Standard 204 loss is known only at 5/204 MHz; unknown intermediates never hide the documented endpoint or part list. Standard 42 has 5/10/15/20/25/30/35/40/42 MHz source points, with only bounded, labelled application estimates between sufficiently close points. Zero jumper dashes remain unknown. Nominal/order labels are separate from actual attenuation and tilt; the ATX 42 zero part-number anomaly stays explicit. These passive accessory facts do not upgrade a 42-only module, establish stock/installed slots or authorize AOI electronic-control plug-ins. Thermal, linear, inverse, interstage and 870 MHz families remain separate.
