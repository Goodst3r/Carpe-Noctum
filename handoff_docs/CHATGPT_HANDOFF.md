# Handoff to ChatGPT/Codex: Carpe Noctum 2.0 Alpha build 3

November 11, 2026 · written by Claude for ChatGPT/Codex · docs only, no app change

> **Update, later the same day:** who works on what is now in [`PARALLEL_TASKS.md`](PARALLEL_TASKS.md). It replaces "What we're asking ChatGPT/Codex to do" and "Proposed next tasks" below. The rest of this file is still the record of what build 3 contains.

A Claude Code session started **2.0 Alpha build 3** on branch `ccr-7abea525-rljsni` and delivered build list items 1, 4 and 2: a threshold and source registry, a field calculator bundle, and a tilt/EQ/pad solver. No build 3 APK exists. Nobody has reviewed this work outside Claude yet. Please review it before anything else is built on top of it.

## Start here

| Item | Value |
| --- | --- |
| Repository | `Goodst3r/Carpe-Noctum` |
| Branch with the work | `ccr-7abea525-rljsni` |
| **Revision to review** | `c0732cc41a44e813b0f00247a012b535d9820ac5` |
| Based on | `main` = `4bdd4fe7897c922d7e249aa6717b54b88cb54f56` (2.0 Alpha build 2, Android code 26) |
| Size | 6 commits, 75 files, +6,884 / −238 lines, Nov 11 07:36–09:58 UTC |
| Pull request | None yet for this branch |
| This file | `handoff_docs/CHATGPT_HANDOFF.md` on branch `claude/chatgpt-handoff`, one docs-only commit on top of `c0732cc` |

Not on this branch, so don't expect to find them:

- `docs/BUILD_LIST.md`, the build order this work follows: pull request #2, branch `claude/build-list` at `271a3f6`.
- `docs/ROADMAP.md`: pull request #1, branch `claude/add-roadmap` at `2b1ce40`.
- `CLAUDE.md`, `handoff_docs/KNOWN_GAPS.md`, `handoff_docs/TOOLS_AND_SETUP.md`: not in the repository at all.

## What the session did, commit by commit

1. **`4fbade7` Open build 3.** Labels, export filenames and PWA identity read 2.0 Alpha build 3; `package.json` is `2.0.0-alpha.3`; Android source identity is version code 27. `android-build/build-readiness.json` says no build 3 APK exists and keeps the build 2 receipt under `previous_release`. Package ID, provider/origin and storage keys are unchanged, so jobs carry over. `qa/build2-layout.test.py` now honors `NIGHTSWEEP_CHROMIUM`.
2. **`677b83e` Registry and calculators (items 1 and 4).**
   - `night-sweep/thresholds.js`, **Test → Limits**: every limit, target and formula the new tools use (27 rows per the status file), each labeled Spec, Expert, Company or Unknown, with source, revision, page or section, units, conditions, plant and checked date. Tapping a tag opens a source sheet.
   - `night-sweep/field-calcs.js`, **Test → Calculators**: dB converter (75/50 Ω), ripple to distance, pre-EQ tap distance, OFDM power per 6/24/1.6 MHz and occupied band, echo delay. Invalid input gives a reason, never a number.
   - Practice: custom-curves exercise gains two guide steps; feature index entries 38 and 39.
3. **`c6e35dd` Records.** `research/build3/SOURCE_VERIFICATION.md` and `source-verification.json` (36 citation findings: 33 primary, 1 secondary, 2 wrong assumptions corrected), `field-calcs-reference.py/.json` (independent 50-digit decimal arithmetic), status file, update log, README note.
4. **`ff038e9` Review fixes.** A multi-reviewer pass (math, provenance, UI, regressions, each re-checked) found five defects, all fixed: a 204/258 return TX reference row the app forbids; the 750 MHz example profile's 32/43 dBmV called user-entered; the pre-EQ result not saying it's the spacing between two mismatches; the Limits list not refreshing after a job change; the source sheet closing on a tap in its own padding. Also: bounded calculator outputs, no "-0.00", calculators and registry left out of the printed report.
5. **`28df7dc` Tilt/EQ/pad solver (item 2).** `night-sweep/alignment.js`, **Test → Calculators → Pad / EQ balance**. Two pilot readings plus targets give level error at each pilot and tilt error. For GainMaker 1 GHz (HGD, GaN HGD, HGBT, LGD 65/86, LE manual/thermal/AGC) it picks the input EQ for tilt, then the input pad for level at the high pilot, and predicts the result.
6. **`c0732cc` Research only.** Sources for item 3, the station view and return unity-gain worksheet (`research/build3/STATION_VIEW_SOURCES.md`), and a re-check confirming no public Quantum18 pad/EQ list exists.

## Engineering decisions to check

- **Company values are read, not stored.** They come from the job's project profile, the 42/54 meter-setup TX reference, or the built-in local preset (31 dBmV at 54 MHz, 43 dBmV at 860 MHz, separate 38 dBmV return TX). The 204/258 workflow has no TX reference row. Blank shows "Unknown – not entered"; an entered 0 stays 0. No new storage, and opening the registry never writes the job.
- **Two existing approximations are now labeled Unknown:** the 0.1 %/°F cable-loss temperature correction (traced only to an indexed copy of CommScope MX0398) and the 0.004/°C resistance default (no source recorded).
- **Ripple to distance** uses 491.79 × VP ÷ ripple spacing (the published constant is 492).
- **Pre-EQ tap distance** is the spacing between two mismatches, not a distance from the modem or node. DOCSIS 2.0/3.0 SC-QAM upstream only, 24 taps, 1.28/2.56/5.12 Msym/s, ± half a tap. Labeled Expert, derived: no document states it as one formula.
- **OFDM power** assumes flat power across the band.
- **Solver part values** come only from Cisco OL-31156-01 / OL-31155-01 and S-A data sheet 716336 Rev D: pads 0–20.5 dB in 0.5 dB steps, 1 GHz forward cable EQs 1.5–30 dB with their loss chart at 52–1000/1002 MHz. It never offers a value outside that list, never interpolates across the chart's 86–550 MHz gap, refuses pilots outside the model's forward band, and reports against the procedure's ±0.5 dB window. It uses the chart's ~1.2 dB tilt per EQ step, not the guide's "about 1 dB" rule of thumb.
- **Left out on purpose:** the 0 dB EQ jumper, inverse EQs (the two charts disagree), 870 MHz EQs, factory interstage parts.
- **Quantum18:** HGD and HGBT align electronically in AOI's QuantumLink Local app, so they get a note, not parts. The LE has no public procedure or value list and gets its own note. The BA gets pad direction in its 0/2/4/6 dB steps from a preliminary data sheet.

## Evidence files

| File | What it holds |
| --- | --- |
| `research/build3/SOURCE_VERIFICATION.md`, `source-verification.json` | Registry citations and how each was re-checked |
| `research/build3/field-calcs-reference.py`, `.json` | Independent decimal arithmetic for every calculator case |
| `research/build3/PAD_EQ_SOURCES.md`, `pad-eq-research.json` | GainMaker pad/EQ values and the Quantum18 gap |
| `research/build3/alignment-cases.json`, `alignment-spreadsheet.py`, `.xlsx`, `alignment-spreadsheet-results.json` | Six synthetic solver cases checked by spreadsheet formulas recalculated in LibreOffice |
| `research/build3/STATION_VIEW_SOURCES.md`, `station-view-research.json` | Sources for item 3 (not built) |
| `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt`, `NightSweep_Project_Status.md` | The session's own change log and status |

Firecrawl credits ran out during the GainMaker re-check for the station view, so its line extender, data sheet and reverse EQ items are marked "not re-verified" in `station-view-research.json`.

## Verification reported by that session

**These are the session's own numbers from its container. They have not been reproduced by a second run.** I tried to rerun them on `c0732cc` while writing this handoff, but running repository code was blocked in my session. Please rerun them.

| Check | Command | Reported result |
| --- | --- | --- |
| Automated suites | `NIGHTSWEEP_CHROMIUM=<chromium> python3 qa/run-pwa.py` | 1,109 checks across 61 suites passed; generated build unchanged |
| Registry | `qa/build3-registry.test.cjs` (in the suite) | 13 checks |
| Calculators | `qa/build3-field-calcs.test.cjs` (in the suite) | 10 checks, 123 comparisons with the decimal references |
| Solver | `qa/build3-alignment.test.cjs` (in the suite) | 12 checks against the spreadsheet |
| Rendered layout | `python3 qa/build3-layout.test.py` | 141 rendered Chromium checks, 320–1280 px, both palettes, print |
| Rendered smoke | `python3 qa/browser-smoke.py` | 328 rendered Chromium checks |

Reported standalone `outputs/Night_Sweep.html` SHA-256: `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`.

Rendered checks are desktop Chromium at phone sizes, not Safari, Android WebView or a phone. No emulator, physical Android, iPhone or field test was done for build 3.

## What I checked while writing this (read-only)

- Branch tip, base and file list with `git ls-remote`, `git log` and `git diff`.
- **The release test change only bumps identity.** `qa/alpha18-release.test.py` moves 2.0 Alpha build 2 / code 26 to build 3 / code 27 and changes nothing else. It passes from a clean checkout now because `build-readiness.json` says `final_apk_built: false`, so the receipt branch isn't exercised. When a build 3 APK is built, the old problem returns unless the non-secret receipts are committed or the test says plainly that they're missing.
- **Training still uses old screen names.** `night-sweep/training.js` lines 6, 33 and 85 still say "Save named job", "Equipment setup" and "Sun / Night". There are 16 old-name hits across `training.js` and the guides. This was finding 1 of the build 2 baseline check and is still open.
- **Stale paperwork.** `AGENTS.md` line 3 still says 2.0 Alpha build 2, code 26. `START_HERE_CODEX.md` still describes 1.8 build 2.

## Open items (from the session's status file, plus the above)

- Build and sign the build 3 Preview APK with the original key, outside the repo; verify package, code 27, label, certificate, v2/v3 signatures, alignment and embedded HTML.
- Physical Android and iPhone checks are still undone for every 2.0 build.
- Most hardline catalog cables (P3, QR, MC2 .500–.750) have no VP yet; add datasheet VP with provenance before relying on catalog VP for them.
- No public Quantum18 HGD/HGBT/LE pad or EQ values. The BA's pad list is from a preliminary data sheet.
- Older screens' example targets aren't registered yet: Test → References workbook 32/43 and sample 34/46 dBmV, anchor pairs, plant-picker starting levels.
- Items 5 and 7 are source-checked but not built. 47 CFR 76.611 and 76.1706 weren't checked.
- Pull requests #1 and #2 are still open; this branch doesn't include their files.

## What we're asking ChatGPT/Codex to do

Review only. Please don't push to `ccr-7abea525-rljsni`; that's the Claude writer's branch. Work on your own branch or leave comments.

1. **Rerun** on `c0732cc`: `npm ci --prefix qa/runtime --no-audit --no-fund`, `python3 night-sweep/build.py`, `python3 build-pwa.py`, `python3 qa/run-pwa.py`, `python3 qa/build3-layout.test.py`, `python3 qa/browser-smoke.py`. Report your counts, not the ones above. Check that `git status` is clean afterward apart from known test evidence files, and hash `outputs/Night_Sweep.html`.
2. **Math.** Check `field-calcs.js` against your own derivation, not just against `field-calcs-reference.py`: dB conversions at 75 and 50 Ω, ripple to distance, echo delay, pre-EQ tap spacing per symbol rate, OFDM power scaling. Test signs, units and edge inputs.
3. **Solver data.** Spot-check `alignment.js` pads and the EQ loss chart against Cisco OL-31156-01 Appendix A and S-A 716336 Rev D. Confirm the 86–550 MHz gap is never interpolated and pilots outside the forward band are refused.
4. **Registry labels.** Check each Spec/Expert/Company/Unknown label in `thresholds.js` against its cited source, and that 42/54 and 204/258 values stay separate.
5. **Phone layout.** Look at Test → Limits and Test → Calculators at phone width in the dark theme.

Report back with: the revision you reviewed, exact commands and results, and each finding with file, line, severity and evidence. Put it in a pull request review, or in `handoff_docs/CHATGPT_REVIEW.md` on your own branch.

## Proposed next tasks (one writer each)

1. **ChatGPT/Codex:** review build 3 at `c0732cc` (above).
2. **Claude:** fix confirmed review findings; then sync training and guide text to the 2.0 screen names, with a regression test that fails when training names a tab or button that doesn't exist.
3. **Spencer:** decide on pull requests #1 and #2; build and sign the build 3 APK off-repo; try it on your own phone.
4. **Next feature:** build list item 3, the station view, from `research/build3/STATION_VIEW_SOURCES.md`.
