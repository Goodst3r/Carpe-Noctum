# Known gaps

Updated November 11, 2026 by Lane B (task B3). Everything here is something that is **not done, not verified, or not yet sourced**. Each row names where the claim comes from so it can be re-checked. When a gap is closed, delete its row in the pull request that closes it; do not let this file become a log. Lane B rewrites it from both status files for the final handoff (task B9).

## Never verified on a device

| Gap | Where it is recorded |
| --- | --- |
| No emulator, phone or field test has been done for any 2.0 build, including all build 3 screens. Rendered checks are desktop Chromium at phone sizes. | `NightSweep_Project_Status.md` |
| No build 3 APK exists. It has to be built and signed with the original key outside this repository from a frozen `outputs/Night_Sweep.html` whose hash is pinned after the final gate; package, code 27, label, certificate, v2/v3 signatures, alignment and embedded HTML then need checking. | `android-build/build-readiness.json`, `NightSweep_Project_Status.md` |
| Build 2's Android 15 software emulator accepted the compatible update, then both the old and new builds hit the same stock WebView renderer crash. Native screens, file picker/save/share/print and job and original-evidence retention across an update are unverified on a device. | `NightSweep_Project_Status.md` (previous baseline record) |
| Safari/WebView offline cold starts, storage eviction, touch and rotation on a real iPhone or Android phone. | `NightSweep_Project_Status.md` |

## Math and data not yet sourced or registered

| Gap | Where it is recorded |
| --- | --- |
| Most hardline catalog cables (P3, QR, MC2 .500 to .750) list no velocity of propagation. Add datasheet VP with provenance before relying on catalog VP for them. | `NightSweep_Project_Status.md` |
| Quantum18 HGD, HGBT and LE pad and EQ values are not public (AOI's English data sheets are behind a request form), so the solver offers none. The BA's 0/2/4/6 dB pad list comes from a preliminary data sheet. | `research/build3/PAD_EQ_SOURCES.md` |
| Two existing app approximations are labeled Unknown in the registry: the 0.1 %/°F cable-loss temperature correction (traced only to an indexed copy of CommScope MX0398) and the 0.004/°C resistance default (no recorded source). | `night-sweep/thresholds.js`, `research/build3/SOURCE_VERIFICATION.md` |
| Older screens' example targets are not in the registry: Test → References workbook 32/43 dBmV and sample 34/46 dBmV targets, anchor pairs, plant-picker starting levels. | `NightSweep_Project_Status.md` |
| Exact GaN, Quantum18 LE/BA, EN9000-RFAM-RPD and DSIM-A commissioning procedures remain documentation gaps. Native ONX proprietary decoding and OCR are not added. | `NightSweep_Project_Status.md` |
| Cisco GainMaker line extender, data sheet and reverse EQ items in the station-view research are marked "not re-verified" because research credits ran out. The reverse pad values and EQ loss charts were confirmed earlier. | `research/build3/STATION_VIEW_SOURCES.md`, `station-view-research.json` |
| SCTE 297 2025r1: the PDF release history lists no r1 row, while CableLabs and the catalog label it 2025r1. Its section 6 procedure was not read. | `research/build3/station-view-research.json` |

## Planned features whose sources are not yet confirmed

| Item | Gap | Where |
| --- | --- | --- |
| 5 DOCSIS health card | Downstream ±15 dBmV per 6 MHz, OFDM −9 to +21 dBmV per 24 MHz and the total-input limit come from secondary sources and the older PHY issue I08. Confirm against CM-SP-PHYv3.1-I20-230419 before shipping; anything unconfirmed stays tagged secondary. | `docs/BUILD_LIST.md`, `research/build3/SOURCE_VERIFICATION.md` |
| 7 Leak log and CLI | 47 CFR 76.611 (CLI) and 76.1706 (logs) were not checked yet. The company repair threshold is unknown. | `NightSweep_Project_Status.md`, `docs/BUILD_LIST.md` |
| 10 Sweep-due tracker | The 18-month interval attributed to Hranac was not re-verified. It may be shown only as unverified guidance. | `docs/BUILD_LIST.md` |
| 12 Return path toolkit | Noise-funneling math is standard practice but not checked against an SCTE primary source (293-11, 293-13, 270). | `docs/BUILD_LIST.md` |
| 13 Imported sweep grading | The SCTE operational practice behind n/10 + x peak-to-valley grading was not re-verified; it appears only as labeled historical guidance. | `docs/BUILD_LIST.md` |
| General | NCTI's own pages disagree on System Technician seat hours (26 versus 42). | `docs/BUILD_LIST.md` |

## Company targets and decisions that need a person

Every company target and tolerance starts **unknown** and must never be filled in by an assistant: forward levels at both pilots, return injection and receiver levels, return tolerance, tilt, sweep peak-to-valley, leak repair threshold and sweep interval. The open questions for the supervisor are at the end of `docs/BUILD_LIST.md`. Items 7 (leak), 8 (outage) and 9 (safety) need a supervisor's review against the local procedure before coworkers use them. Sharing the app with coworkers, using the leak log as anything but a personal notebook, and producing CLI or proof-of-performance numbers for filings all need a supervisor first.

## Project paperwork and process

| Gap | Where it is recorded |
| --- | --- |
| Training text and the 1.8-named guides still use old screen names ("Save named job", "Sun / Night", "Equipment setup" and others; 16 hits in the first count). No test fails when training names a tab or button that does not exist. Task B4 fixes both. | `handoff_docs/CHATGPT_HANDOFF.md`, `handoff_docs/PARALLEL_TASKS.md` |
| Until task B1 lands, a full gate run rewrites tracked evidence files under `release/` and `research/` (run `git checkout -- release research` before committing), the per-suite limit is a fixed 150 s, and `qa/alpha18-release.test.py` fails with a traceback instead of a clear message when `build-readiness.json` says an APK was built but its receipts are not in the checkout. | `handoff_docs/PARALLEL_TASKS.md` |
| `docs/ROADMAP.md` and `docs/BUILD_LIST.md` are also open as pull requests #1 and #2 against `main`. They merge cleanly with the copies on `build3`, but the owner has not decided them. | `handoff_docs/PARALLEL_TASKS.md` |
| Release-time packaging scripts (`release/package_build2.py` and relatives) still describe build 2. Build 3 has no delivery package. | `docs/DEVELOPER_BUILD.md` |
