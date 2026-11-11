# Carpe Noctum (formerly NightSweep) project status

## Current: 2.0 Alpha build 3 · in development · Android code 27 (no APK yet) · November 11, 2026 UTC

Build 3 starts the build list in `docs/BUILD_LIST.md` (open pull request #2 on GitHub, branch `claude/build-list`). Development happens on branch `ccr-7abea525-rljsni`. The released installer is still **2.0 Alpha build 2** (`apk/CarpeNoctum-2.0-build2-preview.apk`, code 26). No build 3 APK exists: it must be built and signed with the original key outside this repository, from a frozen `outputs/Night_Sweep.html` whose hash is pinned after the full QA run. `android-build/build-readiness.json` says so explicitly.

### Build list progress

| Build list item | Status in build 3 |
| --- | --- |
| 1. Threshold and source registry | **Done for the new tools and job criteria.** Test → Limits, plus a source tag on every calculator formula. Older screens' example targets still to register |
| 2. Tilt/EQ/pad solver | **Done.** Test → Calculators → Pad / EQ balance: GainMaker 1 GHz picks from Cisco's published pads and EQ loss chart; Quantum18 HGD/HGBT show their electronic alignment instead |
| 3. Station view and unity-gain worksheet | Not started; next in the build order. Sources researched with Firecrawl: `research/build3/STATION_VIEW_SOURCES.md` |
| 4. Calculator bundle | **Done.** Test → Calculators: dB converter, ripple to distance, pre-EQ tap distance, OFDM power, echo delay |
| 5. DOCSIS health card | **Done** (Lane B). Test → DOCSIS health: a reading against the CableLabs modem input and output requirements and a company window that starts unknown. Sources: `research/build3/DOCSIS_HEALTH_SOURCES.md` |
| 7. Leak log, FCC limits, distance, CLI, detector check | **Done** (Lane B). Test → Leakage: a personal notebook and calculator, not the company record. Sources: `research/build3/LEAKAGE_SOURCES.md`. The normalizer and detector-check methods are flagged secondary |
| 9. Pre-work safety card | **Done** (Lane B), supervisor review pending. Job → Safety: a reminder list that opens with "Follow company policy" and says it is not the company's procedure; editable, kept on this device. Sources and open questions: `research/build3/SAFETY_SOURCES.md` |
| 8. Outage first-response card | **Done** (Lane B), supervisor review required before coworkers use it. Job → Outage: prompts for scope, power, node, actives in order, who to tell and the times; plant places and roles only, never customer identifiers; not the company's procedure. Sources and open questions: `research/build3/OUTAGE_SOURCES.md` |
| 11. Impairment decision tree and signature cards | **Done** (Lane B stretch). Test → Impairments: ten cards from what the meter shows, five steps each, and a standing-wave search that lists candidate place pairs on the saved route. Sources: `research/build3/IMPAIRMENT_SOURCES.md`; tilt and flat loss carry a "body not read" warning |
| 6, 10, 12–20 | Not started (items 6, 10 and 13 are Lane A's; see `handoff_docs/PARALLEL_TASKS.md`). The source check for item 7 is in `research/build3/SOURCE_VERIFICATION.md` |

### What changed

- **Version:** labels, export filenames and PWA identity read 2.0 Alpha build 3; Android source identity is code 27. Package, provider/origin and storage keys are unchanged, so jobs and updates carry over.
- **Registry (`night-sweep/thresholds.js`):** 27 rows, each labeled spec, expert, company or unknown, with source, revision, page or section, units, conditions, plant and checked date. Tapping a tag opens a source sheet. Company values are read from where they already live (the job's project profile, the 42/54 meter-setup TX reference, or the built-in 31/43/38 local preset); blank is unknown and never zero. There is no new storage. Two existing app approximations are labeled Unknown: the 0.1 %/°F cable temperature correction (traced only to an indexed copy of CommScope MX0398) and the 0.004/°C resistance default (no recorded source). Example targets on older screens (Test → References workbook and sample targets, plant-picker starting levels) are not registered yet.
- **Calculators (`night-sweep/field-calcs.js`):** offline, deterministic, no job or storage writes. Invalid or missing input gives a reason, never a number. VP comes from catalog cables that list one (four today) or is typed in.
- **Tilt/EQ/pad solver (`night-sweep/alignment.js`):** level error at each pilot, tilt error and the direction to move each control for any model. For GainMaker 1 GHz system amplifiers and line extenders it picks the input EQ for tilt, then the input pad for level at the high pilot, from Cisco's published values (pads 0–20.5 dB in 0.5 dB steps; 1 GHz cable EQs 1.5–30 dB with their loss chart at 52–1000 MHz), and predicts the levels after the change. It never offers a value outside that list, never interpolates across the chart's 86–550 MHz gap, and leaves out the uncharted 0 dB jumper, inverse EQs and 870 MHz EQs. Quantum18 HGD and HGBT align electronically in AOI's QuantumLink Local app and the LE has no public procedure or pad/EQ list, so all three get a note instead of picks; the BA gives pad direction in its sourced 2 dB steps. Advice is worded from the pick, with the GainMaker procedure's ±0.5 dB window, and pilots must sit inside the model's forward band. Sources: `research/build3/PAD_EQ_SOURCES.md`.
- **Practice:** the custom-curves exercise gains two guide steps (ten in total) and the feature index gains entries 38 and 39, so every task screen still has a seeded exercise.
- **QA:** `qa/build2-layout.test.py` now honors `NIGHTSWEEP_CHROMIUM`. New suites: `build3-registry.test.cjs`, `build3-field-calcs.test.cjs` (app output against independent 50-digit decimal references in `research/build3/field-calcs-reference.json`) and `build3-layout.test.py` (rendered Chromium, run separately like `browser-smoke.py`).

- **DOCSIS health card (`night-sweep/docsis-health.js`, Test → DOCSIS health):** four cards compare a reading with what a cable modem must accept or transmit: downstream SC-QAM level (−15 to +15 dBmV per 6 MHz, PHYv3.0 C01 Table 6–22), downstream OFDM level (−15 to +15 per 6 MHz and −9 to +21 per 24 MHz as printed, PHYv3.1 I20 Table 45; other widths derived and tagged Expert), total input power (strictly below 40 dBmV for a 3.1 modem, 33 for a 3.0-only modem) and upstream headroom to Pmax (65 dBmV default, PHYv3.1 I20 7.4.12.2). These are capability limits, not targets. Company windows start unknown, blank is never zero, and they are kept on this device only under the new key `nightsweep-docsis-windows-v1`, separately for the 42/54 and 204/258 plants, outside the job and its backups. Ten registry rows. Not covered: MER and SNR, per-channel upstream power, the 10 dB channel-spread rule, DOCSIS 4.0, EuroDOCSIS.

- **Leakage tools (`night-sweep/leakage.js`, Test → Leakage):** the 47 CFR 76.605(c) limits and a reading check, a distance-to-3 m restatement (Expert, approximate), a CLI estimator (47 CFR 76.611(a)(1) and (b)(1); counts leaks of 50 µV/m or more measured at 3 m, and says a reading counts only on the 108–137 MHz basis since it does no frequency correlation), a detector check with a company tolerance that starts unknown (a saved check keeps the tolerance in force when it was saved), and a leak log with the 76.1706 fields, Reopen and a CSV export. The log, saved checks and the two company settings live on this device only under `nightsweep-leakage-v1`, outside the job and its backups; a change the browser would not store is kept and written later, unreadable data is copied aside and newer data is never overwritten. Twelve registry rows, including 47 CFR 76.614 (aeronautical-band leaks of 20 µV/m or more at 3 m to be noted and repaired). Not covered: the airspace alternative, frequency correlation, tracking of the quarterly monitoring, the dipole conversion, per-job logs.

- **Pre-work safety card (`night-sweep/safety.js`, Job → Safety) and the shared checklist engine (`night-sweep/checklist.js`):** thirty-three reminders in eight sections (before you leave, protective equipment, vehicle and traffic, ladders and climbing, electrical, digging and underground, fiber and laser, before you leave the site), opening with "Follow company policy". The wording is original, with no numbers, limits or copied NCTI or SCTE text, so it adds no registry row. The technician can reword, hide and add items, tick them, and type a role of who knows where they are, a check-in time and where the company keeps its safety policy. Everything is kept on this device only under `nightsweep-safety-v1`, outside the job and its backups. A browser that will not store a change keeps it for the page and writes it with the next change that saves; unreadable data is copied aside before it is replaced (and is left untouched, with the change held for the page, when the copy cannot be made), a half-filled check-in time is refused with the reason under the box instead of saving a blank, and data from a newer version is never overwritten. The engine is reused by the outage first-response card. A supervisor or safety officer has not reviewed the list.

- **Outage first-response card (`night-sweep/outage.js`, Job → Outage):** twenty-four prompts in eight sections on the shared checklist engine, opening with "Follow your company's outage procedure first". Original wording, no numbers or limits (no registry row), no customer names, addresses, phone numbers or account numbers, no photos or locations. Notes: a plant place, four times, what was found, who was told as a role, and three optional damage or theft notes. Kept on this device only under `nightsweep-outage-v1`, outside the job and its backups; Start a new call clears the ticks and notes. It points at SCTE's 2026 Critical Infrastructure Protection Subcommittee only to say its evidence-collection standard is not implemented. **A supervisor has not reviewed it against the local outage procedure; that review is the release condition.**

- **Impairment cards (`night-sweep/impairments.js`, Test → Impairments):** ten pictures lead to ten cards (standing wave, suckout, resonant peaking, roll-off, tilt, flat loss, ingress, LTE ingress, CPD, impulse), each with what it looks like, causes, look-alikes and the five-step workflow (analyze, localize, prioritize, repair, validate). Looks and causes follow SCTE 280 2022, paraphrased; the steps are general practice labeled Expert; tilt and flat loss say the source text was not read. The standing-wave card turns a ripple spacing and VP into a distance (the Calculators formula) and lists candidate pairs of points on the saved route within a ±10% search width (a registered Expert value). Nothing is read from a meter or stored; no job-format or storage-key change.

### Independent review

An adversarial review (four reviewers on math, provenance, UI and regressions, each checked by a skeptic) confirmed five defects in the first build 3 commit, all fixed: a registered 204/258 TX reference the app forbids; the 750 MHz example profile values described as entered by the user; the pre-EQ result not saying it is the spacing between two mismatches; the Limits list not refreshing after a job change; and the source sheet closing on a tap in its own padding. Lower-risk accuracy items were also applied: bounded calculator outputs, no "-0.00", calculators and registry left out of the printed report, the pre-EQ formula relabeled Expert (derived), and tighter citations. The build 2 and build 1 release records in `build-readiness.json` were restored.

### Current verification

All results below are from runs on November 11, 2026 in this cloud container, against standalone `outputs/Night_Sweep.html` SHA-256 `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`.

| Check | Command | Result |
| --- | --- | --- |
| Automated suites | `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium python3 qa/run-pwa.py` | **1,109 checks across 61 suites passed**; generated build unchanged during tests |
| New: registry | `node qa/build3-registry.test.cjs` (in the suite) | 13 checks |
| New: calculators | `node qa/build3-field-calcs.test.cjs` (in the suite) | 10 checks, 123 comparisons with the independent decimal references |
| New: tilt/EQ/pad solver | `node qa/build3-alignment.test.cjs` (in the suite) | 12 checks; picks and levels match the LibreOffice-recalculated spreadsheet `research/build3/alignment-spreadsheet.xlsx` for all six hand-worked cases |
| New: rendered layout | `python3 qa/build3-layout.test.py` | **141 rendered Chromium checks passed** (320–1280 px, both palettes, print media) |
| Existing rendered smoke | `python3 qa/browser-smoke.py` | **328 rendered Chromium checks passed** |

The baseline before any change was 1,013 checks across 55 passing suites; two suites could not run here (no Python Playwright, no Android build receipt) and now run. Rendered checks are desktop Chromium with phone viewports, not Safari, WebView or a physical phone. No APK was built and no device was tested.

### Outstanding checks

- Build and sign the build 3 Preview APK with the original key; verify package, code 27, label, certificate, v2/v3 signatures, alignment and embedded HTML.
- Physical Android and iPhone checks remain undone for every 2.0 build, including the new screens.
- Most hardline catalog cables (P3, QR, MC2 .500–.750) do not list a VP yet; add datasheet VP with provenance before relying on catalog VP for them.
- Quantum18 HGD, HGBT and LE pad and EQ values: none are public (AOI's English data sheets are behind a request form), so no values are offered. The BA's 0/2/4/6 dB pad list comes from a preliminary data sheet. If AOI supplies an accessory list, add it with provenance.
- The balance card works per calculation; the station view (item 3) will tie it to route actives, their targets and saved readings.
- Register the older screens' example targets (Test → References workbook 32/43 and sample 34/46 dBmV, anchor pairs, plant-picker starting levels) and add tags where they appear.
- Item 5 and 7 values are source-checked but not built. 47 CFR 76.611 (CLI) and 76.1706 were not checked yet.
- Pull request #1 (roadmap) and #2 (build list) are still open; this branch does not include their files.

---

# Previous baseline record (1.8 Alpha build 2)

**1.8 Alpha build 2 · Local release preparation · Android Preview code 24 · November 11, 2026 UTC**

Work is isolated in `/workspace/NightSweep_1.8_Alpha_build_2`; the previous 1.8 Alpha delivery remains frozen. Build 2 delivers one organized ZIP containing Android web, compatible Preview APK, iOS web, first-party source/tests, current guides, seven examples, public verification evidence and the requested text update log.

## Baseline and boundaries

The original handoff is 1.7 Alpha/build 22, Site commit `d4228cad024406b17feb5bde134f2c6f6a75d08e`. The preceding local 1.8 release's tests and browser receipts remain historical baseline evidence under `research/alpha18/` and `release/alpha18/`. Do not label those counts as current build 2 execution.

The known hosted site remains https://nightsweep-field.goodst3r.chatgpt.site. No public deployment, repository push, phone installation or RF acceptance is claimed. The existing Site repository remains canonical. The local package does not update that site by itself.

## Confirmed build 2 changes

- RF work is reused only inside one synchronous refresh; hidden Sweep charts defer expensive redraw until shown/printed. Full workflow refreshes are coalesced, preserving current calculations rather than caching across edits/imports.
- The compact route cascade scrolls in both directions and remains keyboard-accessible; the complete nine-point route remains reachable on phone-sized viewports.
- TDR barriers now follow parent-chain position when distinct zero-length active points share a coordinate. Another active cannot be bypassed forward or reverse; the chosen origin and valid exact-arrival/zero-travel cases remain supported.
- All JSON import routes apply the common 20 MiB UTF-8 text guard before parse or state replacement.
- Duplicating the active named job uses the latest working state and one atomic library write; failed writes cannot partially replace the saved original/copy. Unchanged job-list rendering preserves buttons/focus.
- Native export filenames obey UTF-8 byte limits; deferred print callbacks ignore stale callbacks after Activity/WebView teardown or replacement. Native source regressions and the real final build are recorded separately.
- DSIM setup review now rejects impossible imported calendar dates without normalizing the saved text into a complete result; valid leap/century dates and missing-as-incomplete behavior remain.
- Current labels/exports identify 1.8 Alpha build 2; Android version code 24 preserves Preview package/origin/provider identity. The original signer and official toolchain were used for the real final build. The owner's private signing backup is included only in top-level `PRIVATE_SIGNING/` in the master ZIP.
- Guides, all-functions/install references and training coverage are included as offline PWA pages. Main README now uses the actual Scientific Atlanta **SAT MM 4-23** model identity.

## Retained field/training requirements

Complete remains 21 steps: GS7K source, two GainMaker GaN HGD actives and Scientific Atlanta/GigaXtend/Technetix passives on 42/54. Forward design is 31 dBmV at 54 MHz / 43 dBmV at 860 MHz; return TX 38 remains a separate transmitter/plane reference. Node hardware 1218 MHz is distinct from entered path operating/planning 1000 and live 860 MHz.

The independent 13-step six-active Vecima/AOI run remains 204/258. Custom curves 8, OEM AGC 8, DSIM 9, manual/thermal 7 and conventional GS7K 10 retain separate guides. All 37 feature choices map to seeded exercises. Training/criteria stay synthetic/unapproved; existing saved jobs/copies are preserved.

## Current verification

The final frozen app passed **1,066 automated checks across 57 suites** and **322 rendered Chromium checks**, with unchanged generated bytes. The 54 grouped math checks include 72,001 numeric and 3,634 unavailable-result comparisons. Real Android compile, original signature, manifest, alignment and embedded-HTML checks passed; the Functions and installation PDFs contain 29 and 7 pages. Exact hashes, scopes and evidence paths are recorded in `release/build2/validation.json` and `research/build2/`.

The Android 15 software emulator accepted the compatible Build 22-to-24 update and retained a generic app-private fixture and UID. Both old and new builds then encountered the same stock WebView renderer SIGTRAP. Native screens, picker/save/share/print and actual job/original-evidence retention remain unverified; no physical Android or iPhone tests were performed. No cause in the app Java or JavaScript was established by this attempt.

The fresh math work retains established RF/power formulas and complete/trial answers; it adds topology regressions, RF/power properties, manufacturer-curve and seven-example replays. Local render benchmarks use synthetic plans and desktop Chromium/JSDOM; they are not physical-phone performance guarantees.

## Delivery and next checks

The release folder/ZIP is **NightSweep 1.8 Alpha build 2**. Read `README.md` for layout and `NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt` for the plain-text update record. Accepted APK: `Android/APK/NightSweep-1.8-build2-preview.apk`, with matching receipts. The owner explicitly requested the original key and password inside this private master ZIP; only `PRIVATE_SIGNING/` contains them. Source and both public web folders remain free of signing secrets. Downloaded toolchains/dependencies and historical binary archives are excluded.

Physical Android compatible-update retention, native save/share/print, Android/iOS touch/rotation and Safari/WebView offline cold starts/storage eviction remain device checks. Exact GaN/Quantum18 LE/BA/EN9000-RFAM-RPD/DSIM-A commissioning procedures remain documentation gaps. Native ONX proprietary decoding/OCR is not added. No full runtime branch/function coverage or plant certification is claimed.

Keep external full-project JSON backups before updates, rollback or transfers. APK/browser/Home Screen stores remain separate; no cloud sync or update-time wipe is added.


## Build 3 A1 — station worksheet (November 11, 2026)

A1 adds **Route → Station** for the installed launch node/active and route amplifiers. It distinguishes 42/54 MHz forward/return Sweepless Sweep from 204/258 MHz forward Sweepless Sweep / return XPERTrak. Other splits remain unconfigured. Independent Before/After stages save forward pilot targets/readings and actual Alignment solver results; Quantum18 shows its electronic method without plug-in part picks. All new station company targets and tolerances start unknown.

The return worksheet keeps the wanted reference-point level plus net insertion loss, required physical injection, actual injection and same-plane receiver reading/reference separate. Return EQ/tilt is a signed recorded setting, without a part-pick or capability claim; physical pad/loss stays nonnegative. Balanced and Swept have independent states/dates and never become automatic acceptance. Additive station identities and source asset/port/module bindings retain removed/replaced-station history and prevent transferred readings. Legacy UBT worksheets are read-only. Named-job switching, duplicates, autosave reload and full JSON backup/restore preserve results. Unsupported numeric text that a number input cannot display cannot calculate; imported raw text remains preserved.

The complete practice now has **22 steps** and the six-active Vecima/AOI practice **14 steps**, including their separate station exercises. The two main README copies remain byte-identical and their Station section is rendered into the offline guide. D4 still needs to reconcile older step counts and A1 coverage in the all-functions, installation and training-coverage guides; those unrelated editions were not rewritten here.

A1 correction source commit: `10b4105`; latest planning/paperwork merged at `51df6d4`. Focused verification of that correction: station Node suite **22 checks**, new rendered station suite **77 checks** at 320/360/390/430px, retained design **8**, navigation **22** and guided training **41**, all passed. Initial frozen f45ae53 full gate ran every suite: 60/63 suites and 1,105 counted checks, with unchanged generated bytes; only three stale navigation/step-count assertions failed and were corrected. Final refreshed source `3d610f413ca88522048c8481482a93bdd4c1b5ce` passed **65/65 suites and 1,221 checks**, with generated bytes unchanged; the separate existing layout suite passed **141** and browser smoke **331**. The new station suites included in the gate passed **22 Node checks and 77 rendered checks**. Standalone SHA-256: `8679c02aab1142890eb6fcc4eeab08cba5971983e3840d49e495717e69da69e5`. Independent review confirmed all four Important findings addressed in correction `10b4105`; see `handoff_docs/reviews/codex-station-view.md` and the exact receipt `handoff_docs/lanes/codex-a1-validation.json`. Draft PR #8 awaits Lane B review and merge. Sources, independent Decimal derivation and qualifications are in `research/build3/STATION_VIEW_CALCULATIONS.md` and `STATION_VIEW_SOURCES.md`.

These are synthetic and desktop Chromium checks only. No A1 native/emulator, Safari, physical phone, meter/hardware or field test is claimed. Three minor review items are deferred: source-sheet location text can follow the saved selection after a temporary picker change; the visible last-edit paragraph refreshes on station render while stored timestamps update on every edit; unusually long heavily escaped source labels can exceed the encoded-context guard. These are recorded in the review handoff. D1–D5 are not yet complete.
