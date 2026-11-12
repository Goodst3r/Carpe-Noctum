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
| 6, 10–20 | Not started (items 6, 10 and 13 are Lane A's; see `handoff_docs/PARALLEL_TASKS.md`). The source check for item 7 is in `research/build3/SOURCE_VERIFICATION.md` |

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

## Build 3 A1 — merged Station worksheet (November 11, 2026)

Lane B reviewed and merged PR #8 at `21ed711cacbc03359e1418f79b9af6f76888ede5`. Route → Station preserves independent Before/After forward and return worksheets, separate balanced/swept records, company targets that start unknown, exact equipment/source bindings, and read-only legacy/UBT history. It reuses the existing Alignment solver and sourced plant/model guidance. The seven Lane B review corrections and local first-match catalog lookup optimization are retained; RF math and storage identities are unchanged.

Lane A freshly reproduced the merged baseline at 21ed711: both builders, **66 suites / 1,276 checks** (405.0 seconds), separate rendered layout **141** and smoke **331**, all exit 0. All 537 tracked hashes, generated output, Git index/tree, guide copies and QA lock remained unchanged; the worktree stayed clean without restoring evidence. Standalone SHA-256: `28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15`. This is a new merged-baseline run; prior source-phase receipts remain historical in `handoff_docs/lanes/codex-a1-validation.json` and the PR #8 review handoff.

## A4 imported sweep grading — reviewed Sweep Due integration and render-context follow-up

Frozen61c4d4add20b47cd8fb96e9a9fafc392e10c9ffe ordinarily merges production41 with reviewed394179c7ac15ad57d19b654a4427e3b9fa2f54c0. Source, independent delta and fresh whole gate are accepted:80/2072,679.0s +layout554/smoke352. This ordinary metadata publication preserves all tested product bytes and is ready for LaneB same-published-head gate/review/merge. Priorpublicf6d/testedfe74/1701,526.6s +554/346 on3cf is historical. D1 done; A2/A3 mergedf50/394, leaving D2item13 andD3–D5 open.

Explicit offline nativeJSON/gzip/singleJSONZIP/syntheticCSV grading retains originals/SHA/samples, immutable criteria/results/log history, independent balance/sweep facts and four initially-Unknown42/54 or204/258 profiles. No automatic grade/date/done, interpolation/reference correction/company acceptance or new formula/limit/default/key/schema/version. SampledPTV is not normalized continuous-band ripple. Sources remain authorizedA4plan/BUILD_LIST, native-format/core research and reviewed editor/calendar contracts.

CURRENT measured source/frozen/guides:29screens/47features and22/16/15/8/9/7/10. All46 base feature tuples and72 registry rows remain ordered prefixes;42A4 rows total114;38base+3A4 splice entries;21practice cells/47feature markers/20assets/9Jobtabs.80registered suites is static, not a full outcome. Both savedNightLog/savedGrading Example keepers, all3 optional validators/content terms and reviewed interval-drop policy survive. Station exact41; relative394 only existing pure boundRecords helper/export differs. A1 native-input follow-up is not imported.

Author61:19focused commands pass grading56/56, Due37/37, Log23/23, old/newinterop3/3 each, correct-mode Checklist37/37/registry14/14/names6; native69/core93 single module invocations; rendered88/189 and separate actualbrowser27;680strict clean. Independent61 own56/56/triple3/3/audits6+6/MCP38/680strict accepted. Separate targetedMCP14(7eachwidth) proves saved/autosaved/readView24→due2027-11-11, explicit restore18→2027-05-11, then date edit→2028-05-11. Original38 raw preserved; corrected report sequence/oracle gap, no production defect/change or single52 campaign.

Historical-warning optimization retains UI4886: lazy synchronous render-local context, shallow copy per row; public freshness one-argument/direct and signature/owner checks separate. Grade/signature/observer/save/init/export/SHA/archive/math exact60d retained61; freshness intentionally uses a helper, with equivalent warnings/state/API rather than whole-function byte identity to470. No persistent context/grade/verification cache. Steady100history operations100→1, first-owner101→2; scratch Node medians215.296→5.753/870.146→14.493ms exclude DOM/phone; one-history0.642→0.740ms no gain. No timing assertion/universal one-call claim.

Historical41/f50 full sealed77/1843,610.6s +554/349,5zero/fresh/raw-equal commands;653tracked/630source/23generated, semantic staged/tree/README/lock/40deps clean,12manifest verified without restoration. Production41 independent56/56+11real-app/MCP23 is separate.60d55/55+3/3/MCP22, characterization63/22 and scratchindependent17 retain attribution. Current61 full prefix/tmp/carpe-a4-sweepdue-full-* sealed80/2072,679.0s +554/352 at01:15:59–01:27:49UTC, all5commands0/fresh/raw-source-equal.680tracked/657source/23generated, semantic staged/tree/README/lock/40deps unchanged/clean without restoration;12manifest SHA/size/mtime entries verified andbase394unchanged start/end/fetch. Rawindexcache diagnostic only. Current receipt preserves complete raw and5FULLcommands including nanoseconds losslessly, with exact root/final artifact checks and separate targeted14 raw/proof; historical41 raw/commands remain separately attributed. App8caf8ff1e9ccccc701a3f8e27e88c46f8331bdf9747946ccc97d1e05bdc9cb24/PWAb354fda83dc6f8c89109.

Failed533 staysFAILED71/72,1566 counted;60d default-second-context/jitless diagnosis retains unprovenVM mechanism, all55cases/3fresh-processinterop without skips/JIT flags/production workaround. NamingRED, public100-vs1RED and new-test cleanup failure remain separate exact reports. Ten prior required fixes/startup boundary retained; focus/internal-ID/long-context/parser/resource/history/eager-preview deferrals remain KnownGaps. Private-owner-original replay last9cad historical only. No fresh actualowner/device/emulator/Safari/WebView/mobile keyboard/touch/provider/RF/field/DOM-phone-performance/APK/signing/deployment claim. Root read/sealed current full and authorized ordinary metadata publication; LaneB same-published-head gate/review/merge required, no self-merge. Every surrounding A2/A3 prefix/suffix stays immutable61 bytes.

Current compact receipt: handoff_docs/lanes/codex-a4-validation.json; final author/delta/full reports: handoff_docs/reviews/codex-sweep-grading-sweepdue-{integration,review,full-gate}.md. ProofSHA973204faf6550338459adf754e23086bf2b7e69206bee585c626765b2a0c5d09; rawSHA93e1b5a2ee9ff408dcd1dbc72ce39e20e2d2f480889f7e4ca9d676a34cdebd25; manifestSHAbd1509779db8a1754d93aa6fd1aaa8f47f49be835ecc7424487bb7c216e95ad4.

### A2 Night log and shift handoff — current reviewed Outage base

Job → Night log keeps personal ticket/window, node/amp actions, ROC/dispatch, fuel/mileage units, as-built and next-shift notes. Explicit Add freezes both saved Station stages, raw values/results and independent balance/sweep facts; later edits never recalculate that capture. Unknown remains unknown. Customer identifiers and legacy address/lead fields are excluded; TXT and safe rectangular per-stage CSV use existing offline file preparation, and full project JSON retains exact raw/capture/original data. No new key/schema/version/package, RF formula, company default or runtime dependency. Existing200-entry guard remains Unknown. Route example preserves optional nightLog; deliberate blank windows remain unknown, partial text does not replace saved values, blur/return restores last saved text, and validated edits invalidate stale preview.

Current source2690a46e51b8e20cd9841d11a1850a8de92c170c starts from public9b77213/source35f and ordinarily integrates reviewed Safetyccf and Outage3cf. Product NightLog/App/jobs/fixture/QA stays exact35f; reviewed Safety/Outage/checklist/Station stays exact3cf. All44 base feature tuples/rows survive, with Safety43/Outage44/Night log45. CURRENT runtime/guides: **28screens,45features**, complete22/six-active15/custom14/OEM8/DSIM9/manual7/GS7K10. Final guide-only corrections fixed two Coverage43→45 claims and two mirrored main Custom12→14 cells; product/QA/standalone stayed exact. Earlier guide audits did not check every table value; final2690 independently checks every current table and20 PWA hashes.

Current own exact2690 verification: `python3 night-sweep/build.py`; `python3 build-pwa.py`; `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py`; separate build3-layout and browser-smoke with the same Chromium/GIT_OPTIONAL_LOCKS. Actual **72/1534,524.9s +layout554/smoke346**, all5commands0/fresh/raw-source-equal,23:11:46–23:21:01UTC. All593 tracked/570source/23generated hashes, semantic staged/tree, README/lock and40dependencies unchanged/clean without restoration;12sealedmanifest hashes verified. Raw index cache bytes diagnostic only. App899e6da766e0a315aff97ecb8e1d24183b031452ba68b9b840fe6dea4f326883; PWA7ec73c8a1fa09c798d4d. ProofSHA6b562cd16ec11260cbf55a848434d4de95ef6dfa33a3be8b82dae277f1d12ad5; manifestSHA3b5ff246bb38d282298a5be8d67d6ba45f6bfcc4cd72aaf6805c7c435fde0468. Current receipt: handoff_docs/lanes/codex-a2-validation.json; exact author Safety/Outage integration, final independent delta and current gate reports are preserved under handoff_docs/reviews/codex-night-log-*.

Scoped author0c23/23, checklist37/37, registry14/14, names6/6, training11 and actual native38/107/45 remain separate from independent0c23/23+37/14, f6 audit16/MCP33 and final2690 doc audit6. Existing partial-time/preview/capture/Route-example/portable regressions remain. No counts are transferred between0c/f6/2690 merely because product bytes match. Sources: authorized A2 plan/BUILD_LIST and research/build3/NIGHT_LOG_SOURCES.md, existing Station/Jobs/App/export contracts, exact reviewed Safety/Outage source and their existing source notes; no new RF derivation or source-limit claim.

Historical A2 results (superseded; not current-base totals):

| Exact source/checkpoint | Historical result |
| --- | --- |
| d6f8bb6, code57bea9d/guide3372403, basebc69 |69/1377,473.4s +255/337|
| b0d1643, base5588, guard provenance |70/1410,509.1s +374/340|
| cd79a846, base5588, time/preview correction |70/1444,468.0s +374/340|
| 3af0134 CI-only merge, base14bf |No new A2 full gate at that checkpoint; oldcd79 result retained|
| 35f25f0, base14bf, required addendum/Route-example fix |70/1459,489.9s +374/340|

Historical35f receipt and older chain are immutable at https://github.com/Goodst3r/Carpe-Noctum/blob/9b77213fe332186a142e8af2d147b6f4dccf1cfa/handoff_docs/lanes/codex-a2-validation.json . The previous receipt-path preflight refusal belongs only to the historicalcd79 phase; no current2690 collision/failure is implied. Old screen/feature/step snapshots in previous receipts are historical and do not replace CURRENT28/45/22-15-14.

Known Gaps is unchanged: no Remove/Undo, blank Add consumes a slot, no implemented new-window action, existing sample/provenance classification and multiline TXT indentation remain explicit. Stored log/raw/results/dates remain exact; derived current-context TXT/CSV headers/warnings can change after Route example. The separate A1 native-input fix is PR23, not silently imported in A2. Safety/Outage still need supervisor review before coworker release. No emulator, physical phone/Safari/WebView/screen reader/native provider dialog/RF hardware/field/APK/signing/deployment result. Lane B must review/gate the final published PR17 head and merge; Lane A cannot self-merge. D1 complete; D2–D5 open.


## A3 — current sweep-reminder integration (November12,2026)

Exactsource `072eb0ec193e7cd621e9f76c4024ecd02de1288d` ordinarily integrates reviewed Night Log base `f50a7445a8c5254b0db4db5d9e4309569345c12c`. Current source/frozen runtime and all current guides: **29screens/46features; steps22/16/14/8/9/7/10**. All45 base feature objects remain prefix, SweepDue46 appends; exact nine Job tabs retain NightLog eighth/SweepDue ninth in both Checklist and naming QA. Both optional import/content terms and the NightLog example keeper remain; both implementation modules preserve reviewed bytes. Route example retains NightLog and keeps the existing interval-drop behavior. No A1 native-input/A4 parser code is silently imported.

Historical rows now show only recorded facts and historical/read-only reasons; they never display current-service classifier phrases. Balance/sweep dates remain independent; unknown cadence, invalid/future/unchecked/unconfirmed/retired records stay neutral. The interval belongs to the open job, starts unknown, and uses an adjacent named warning when autosave fails. Same-owner refresh keeps feedback and another owner cannot inherit it. Calendar arithmetic/collector/storage policy is unchanged; explicit ceil/year9999 pins were added. Company cadence is not supplied, and two-thirds/civil-date choices remain Unknown app policies.

Own072 focused source/frozen NightLog23/23, SweepDue37/37, Checklist37/37, registry14/14, names6/6; actual rendered NightLog107/SweepDue189 and8 cross-feature groups PASS. All21 guide practice-table cells, README copies, complete Functions TOC/46markers/anchors and20worker hashes match. Three Marked18.2 rerenders and both Python builders reproduce all610 tracked hashes and semantic guards, clean. Standalone `a765323807749debd2a035ad7929fe2aa5c2fad8ec42456f872b5d75f613c7d0`; PWA895c3d743a958543a5a5.

Full-result attribution stays exact: original52fac69070/1482 +374/340 historical; c6 realFAILED71/72,1592,480.3s (only stale inherited expected7 versus rendered8 tabs), separate554/346passed; one-line QA successor26f freshPASS72/1629,474.1s +554/346, all574hashes unchanged, historical on3cf. The fresh exact072 whole gate **PASSED74/74 suites,1760 checks,630.0s reported suite time** (command wall630.763s), started2026-11-12T00:16:02UTC and finished00:27:08UTC. Separate actual rendered layout554/smoke349 passed. Both builders and all five commands exited0; all610 tracked hashes (587source/23generated), HEAD/tree, semantic staged entries, README/lock and40 installed locked packages stayed unchanged/clean without restoration. Fresh raw/source equality, actual registered identities/count sum and all12 sealed manifest artifacts were independently verified by the root. Raw index stat-cache refresh is diagnostic, not a content change. Exact commands and compact/raw results are in codex-a3-validation.json and codex-sweep-due-nightlog-gate.md. Independent072 scoped delta **PASS**: own Due37/37, NightLog23/23, Checklist37frozen,14 integration groups and47 actual Chrome DevTools MCP checks. All610 tracked hashes and exact HEAD blobs/semantic guards stayed unchanged/clean. The initial reopened-original-ID assumption probe is preserved separately; expected import UUID remapping is not a product failure and its17 preliminary checks are not added to47. This reviewer ran no broad gate; LaneB final-head review/gate remains required. Prior failures stay immutable; the current full PASS is a separate execution on the new base.

Sources/commands/files/own timings: `handoff_docs/reviews/codex-sweep-due-nightlog-integration.md`, peer-fix/review and historical gate reports; focused machine proof `handoff_docs/lanes/codex-a3-nightlog-focused-validation.json`. Exact focused commands are the dedicated Node suites in source/frozen modes, the two rendered Python suites with NIGHTSWEEP_CHROMIUM=/usr/bin/chromium, existing three guide renders and both normal builders. No new formula or source verification claimed. Large-library synchronous typing, overlay chronology diagnostics and historical external-exploration reproducibility remain explicitly deferred. No device/emulator/WebView/Safari/native-provider/RF/field/APK/signing/deployment claim. LaneB same-final-head review/gate/merge remains; D2items10/13 andD3–D5 open. This A3 section supersedes stale A3 CURRENT26/43 or28/45 prose. Counts in preceding A1/A2 sections describe their historical source scopes; current combined runtime is29/46. Historical receipts remain source-attributed.
