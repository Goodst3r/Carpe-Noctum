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

## Build 3 A4 — Station integration for attached sweep grading (November 11, 2026)

PR #14 remains a draft for Lane B review. An ordinary merge from published A4 head `e0d43f9` integrates reviewed build3 `21ed711`, without rewriting history. Source/build/test freeze `5f7e2e673df08d1d4efa54c6b029b6481cd813fb` retains both optional saved sections and uses the actual Station v2 bindings. Station source/styles match merged build3; A4 parser, integrity/CRC, math and grading UI source match e0d43f9. Eight new combined cases exercise real Station edits, async grade invalidation, legacy/read-only context, named jobs and exact-original portable restore. Every committed input is synthetic; the owner's original exports remain private.

Four company plant/direction profiles start blank. Supported typed TestGroup/CDM2 JSON, gzip and single-JSON ZIP retain verified original bytes; unknown/ambiguous formats stay attached with a reason. Raw sampled PTV is not normalized ripple or official acceptance. No correction, native company-limit adoption, automatic balance/sweep date, meter-date inference or cloud service is added. Immutable grading history is preserved when current Station context changes.

Fresh focused integration checks at 5f7e2e passed: native **69**, core **93**, grading UI **43**, Station **22**, Station review **11**, registry **13**, training/library/control/name and storage/import suites; rendered Station **121** and grading **47**. Actual Chrome DevTools MCP at 390px also verified synthetic native import, v2 capture, pending hash rejection and exact compressed-byte restore with no console error or overflow. These focused results do not claim a completed full gate on the integrated head; its final gate and Lane B peer review are pending. Exact commands and limitations are in the integration handoff.

The current combined runtime has **24 task screens / 42 feature choices**; complete practice **22** steps, six-active **14**, custom-curves **12**. Main README copies are identical; main, Functions and Training Coverage guides cover both features. Other older paperwork remains for Lane B's D4 reconciliation. Existing Station and native-parser nonblocking limitations remain in `handoff_docs/KNOWN_GAPS.md`.

No emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane, RF hardware or field check is claimed. No APK/signing, version, package, storage-key or deployment change. A2 night log is being built from merged build3; A3 follows. D1–D5 remain incomplete.

### A4 latest reviewed-base integration

Source freeze `25d5bb32bf311630d7fe077933e4b62e1acbea1f` ordinary-merges reviewed DOCSIS/build3 `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e` into the earlier Station integration. A4 and Station modules remain unchanged; DOCSIS source matches its reviewed base. Registry stores/edit links and practice/guide registrations retain all three features. Fresh focused registry13, DOCSIS20/517, gradingUI43, training/library/control/name and design suites passed; actual synthetic Chrome DevTools MCP replay passed at390px. These are focused results; final combined full gate is pending. See `handoff_docs/reviews/codex-a4-docsis-integration.md`.

PR #7 was independently reviewed by Lane A at1f239b6 and merged tobc69bb4: own67/1296 in419.3s plus separate layout255/smoke334, all unchanged/clean. These are that PR's exact-head results, not a full A4 run. The original21ed baseline remains historical.

### A4 completed integrated gate

At exact2043d62 (source25d5bb3, reviewed basebc69bb4), Lane A's implementation-agent full run passed **71/71 suites and1,548 checks**,451.8s, plus separate layout255/smoke337. Every584 tracked hash, staged entry/tree, generated byte, README and lock matched; worktree clean without restoration. Raw index stat-cache bytes refreshed, as isolated reproduction documents; staged content did not change. Both actual private original exports again retained all raw samples and exact compressed bytes after portable identity remapping. This completes Lane A's gate; Lane B peer review/merge of PR14 remains required. Prior focused/pending statements above describe earlier phases. Exact commands, source hashes and qualifications: handoff_docs/lanes/codex-a4-validation.json and reviews/codex-a4-integrated-gate.md. No emulator, physical device, Safari/WebView, meter or field verification.


### A4 final peer-correction and startup gate — November 11, 2026

PR14 source/build freeze `9cad649d1a7fdc511609c2989af0d1043512748a` includes reviewed build3 `5588a49`. All six Lane B requests are corrected: bounded digest of exact bound/raw Station context; adjacent human range errors with visible/ARIA state; consistent restored values/flags; proper labels and separate44px source controls; seven Unknown application guards; and complete current guide counts/contents. Runtime25screens/43features/custom13/complete22/six14. Original-file verification, both async freshness windows, old history and independent balance/sweep facts remain unchanged.

A fresh full run passed **72/72 suites and1,589 checks (485.5s)**, plus separate rendered layout**374** and smoke**340**, all exit0. Both Python builders reproduced identical app output. Every591 tracked/568source/23generated hash, semantic staged entries/tree, README, QA lock and40 dependency versions matched; status clean without restoration. Raw index stat-cache refresh is disclosed and does not represent staged content change. Exact commands, source proof SHA and summaries: `handoff_docs/lanes/codex-a4-validation.json` and `handoff_docs/reviews/codex-sweep-grading-startup-gate.md`.

The predecessor533a862 run failed the warm-jsdom saved-worksheet reload (**71/72,1,566 counted**; separate374/340 passed); its false receipt and report are retained. The successor adds a pure bound/raw Station projection for grading context without evaluating RF before module initialization; exact canonical context and computed result bodies remain. Independent Station22/grading52, warm500/two-window and canonical-context probes, plus actual Chrome DevTools MCP cold reload passed. A precise VM binding-cache mechanism is not established; actual Chrome cold reload already passed before the fix.

Root privately verified both supplied owner originals at this same final app: all raw samples and compressed originals retained exactly through portable identity remapping; no automatic grade or external page request. Only safe booleans are published. Remaining parser/memory/history/UI gaps and existing A1/performance notes stay open and explicitly within the documented PR scope. Lane B must independently re-review/gate/merge the new published head; no author self-merge. D1 is complete; D2–D5 remain open. No emulator/device/Safari/WebView/RF hardware/field test, APK/signing, version/key/package change or deployment is claimed.


### Imported sweep grading — reviewed CI-only base integration (November 11, 2026)

Ordinary merge `45eef1ccb304832576053cb385e88f710dc0def5` → `8b28cb6f74acccbe1e9cc62362946b155b8bc8d5` adds reviewed build3 `14bfc06ff62e000dc624e46d57cf8d4beda98ce0`, whose tree equals CI head `e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8`. Only `.github/workflows/gate.yml` and `qa/ci_layout_diagnose.py` were added; every one of the 596 preexisting file hashes and staged entries stayed exact. Product, registered QA/runner, guides/references and generated app bytes are unchanged. No rebuild, full or focused feature test ran at the CI-only merge/publication head. The existing feature gate remains attributed to `9cad649d1a7fdc511609c2989af0d1043512748a`: 72 suites / 1,589 checks; separate layout374 / smoke340. These are historical executed feature results, not a new integrated-head run.

Incoming CI itself passed Lane A's fresh exact-e77 run68/1328 (459.2s), separate layout374/smoke337, all549 tracked hashes/semantic guards unchanged and clean. Optional record delivery is best effort; a green gate does not guarantee an artifact. Hosted successor remains observed queued, without a completed hosted claim; prior upload cause unknown. Sources: reviewed source/diff, exact Git parent/tree/file-hash proofs, original feature receipts and CI report. Commands for this integration were the ordinary Git merge and SHA256/staged/tree/status comparisons documented in `handoff_docs/reviews/codex-a4-ci-only-integration.md`; this metadata publication uses JSON/link/diff/hash checks only. Lane B owes fresh same-head review/gate/merge; Lane A cannot self-merge. D1 complete, D2–D5 open. Emulator/device/Safari/WebView, hardware/field and APK/signing/deployment remain untested/unperformed.
