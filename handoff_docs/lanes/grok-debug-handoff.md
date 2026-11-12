# Grok debug handoff

Docs only. Written from `build3` `70703cb4416c0436bf8ab27467dd5d52601dcd93` (merge of #41). This commit does not change the app and was not gated. No phone, emulator, Safari, WebView, meter, or APK test was run.

Draft #32 was closed, not rewritten. It recorded an older supply-PM gate (`e83cafa` / #30) and a different A6/A7 note. This file replaces that handoff.

## What was built

**A1 power sum.** Tools → Calculators. Uncorrelated add, N equal carriers, and signal minus noise. No new screen, storage key, or version. Pull request #34, merged `d631109`. Product head recorded as `df857d0`.

**A2 thermal CNR.** Tools → Calculators. Noise floor, one amplifier, N equal contributions, optional optical CNR, and a combination of CNR values. Fixed 290 K. No CTB/CSO, MER, ordered Friis chain, or editable temperature. No new screen, storage key, or version. Pull request #39, merged `02b9ca4ec79c371dbc1543e0058f2c9a54ca64ff` from `223867e3d495a1375c4374c4ba4b008c0ef29112`.

**A3 NAV-1.** Bottom tabs are Home, Plan, Field, Tools, and Closeout. Safety stays removed. Screen ids are unchanged. Supply PM is in Plan. Pull request #38, merged `f9a2060`. Head `b34b1db`.

**A4 context strip.** Read-only job, plant, and point line. It stores nothing. On Station, the point and the measurement plane now come from the same installed station: `StationView.currentTarget` (`key`, `id`, `label` only) and `currentStage` of that target, including Before/After. Off Station, the strip still shows the route point and hides the plane. Fix commit `cb29dbe8a10c039b39eb164101e0cce373789cf5`. Pull request #41 merged as `70703cb4416c0436bf8ab27467dd5d52601dcd93` by Goodst3r. The PR head `81e2e02400b179d77a0ad03533079631c59238be` has the same tree as that merge commit.

**Merges into `build3`.** #36 Night log, then #42 ripple-width label, with no local gate between them. Merge commits `0878cfbe89b261d61c0b38bb05eba6bf1a64aac0` (parents `02b9ca4` and `92be1e7964aac11843f85e035738f0952403034f`) and `a755fde9dd1878ea2f66cf31b52fb54f7e737c83` (parents `0878cfb` and `2cbd38f8ee5b67c3662c1a92ca0dba9a679704fb`). Generated files were not hand-merged. #42 onto the #36 result also conflicted in the update log, project status, functions PDF, `SHA256SUMS.txt`, and `chatgpt-status.md`. Both product notes were kept. The PDF and checksum stayed on the post-#36 side. Then `python3 night-sweep/build.py && python3 build-pwa.py` and commit `2cf59203d685a7760b27cacdbfb94698c8c661b2` (`Rebuild and recount after the batch`). #41 was merged later by Goodst3r, not in that recount.

**A4b** is pull request #40. It was not reviewed or merged here. When this note was written it was still open at `d7c0775997d50ba96c9117e982f7ef4b41389b30`.

## Blocked or not started

- **A6 exact resume.** Not started. Blocked until Spencer's phone interruption checks are recorded.
- **Item 16, connector checklist.** Not built. The catalog has no torque or pin length to register.
- **Item 12, return path toolkit.** Not built. The funneling example was not checked against SCTE 293-11, 293-13, or 270.
- **A5 tonight list** and **B5 temporary repairs.** Deferred. Not started.

## Known issues

- #40 is the remaining batch pull request. ChatGPT's earlier review of `1c1e541` reported that a supply-PM import can execute battery-slot HTML and can duplicate a supply when property order differs. A later commit on that branch says it fixes five review findings (`d6cf2c7`). That fix was not read or run here.
- The project-status table on `02b9ca4` said 153 live registry rows. Loading that commit's `thresholds.js` with the three archive limits produced 156. The recount on `2cf5920` is 159 live rows (156 in `thresholds.js` alone, plus 3 from `EvidenceArchive.limits`). The three ids added versus `02b9ca4` are the Night log ingress text bounds. #42 adds no row. Screens and features stayed 35 and 53.
- The functions PDF kept at the #42 merge is the post-#36 blob, not the #42 reprint. `SHA256SUMS.txt` matches that blob (`41fb08dcaad3f2a2ee2a89054e59102e7523338ad580a214f00a4fd6619a9413`). The functions markdown contains the app-chosen wording. The PDF was not reprinted here, and its text was not extracted.
- `QA gate` does not run on a push to `build3`. The green hosted run is a `workflow_dispatch` on `2cf5920`, plus the pull-request run on #41's head. The merge commit `70703cb` itself has no check run. Its tree is identical to `81e2e02`, which did.
- Local layout and smoke logged `ConnectionResetError` from the test HTTP server. The suites still printed their pass lines and exited 0.

## Suspected, not verified

- Counts were not recounted on `70703cb`. #41 stores nothing and adds no screen, so 35 / 53 / 159 is expected to still hold. That was not measured on this head.
- Whether the functions PDF bytes contain the app-chosen sentence was not checked.
- ChatGPT's `chatgpt-status.md` on this `build3` still describes older heads (B3 not opened, B4 awaiting review, #39 changes needed). It was not edited. It is not a gate of `70703cb` or of a post-#40 head.
- No shared final head exists yet, so my gate and ChatGPT's gate were not compared. My last full gate is `2cf5920`, which does not contain #41 or #40. ChatGPT's status file does not record a full gate on `2cf5920` or `70703cb`.

## Exactly what was run

Product recount on the rebuilt standalone at `2cf5920`, JSDOM through `qa/build2-source-harness.cjs`: 35 task screens, 53 feature choices, steps 22/16/21/8/9/7/10, 159 registry rows. `Thresholds.rows.length` is 159. Loading `thresholds.js` without `EvidenceArchive` is 156.

Context strip, on `cb29dbe`, after `python3 night-sweep/build.py && python3 build-pwa.py`: `node qa/build3-context-strip.test.cjs` printed `Build3 context strip: 23 checks passed`, exit 0. Not a full gate.

Full gate on `2cf59203d685a7760b27cacdbfb94698c8c661b2` only. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. Started `2026-11-12T15:53:48Z`. Ended `2026-11-12T16:09:26Z`. This head does not contain #41 or #40.

| Command | Exit | Own count |
| --- | --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 | |
| `python3 night-sweep/build.py && python3 build-pwa.py` | 0 | release `f3fbf2fb048c46ee5364` |
| `git diff --check` before the suites | 0 | |
| `NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py` | 0 | 102 suites, 2830 checks, 896.8 s |
| `python3 qa/build3-layout.test.py` | 0 | 1252 checks |
| `python3 qa/browser-smoke.py` | 0 | 370 checks |
| `git diff --check` after | 0 | |
| `git status --porcelain` | empty | |

Standalone `outputs/Night_Sweep.html` SHA-256: `4d28d00ab167fe6d47749550e840c6c5fb6d81edd7bb4d721e8b3db6029e3652`.

Hosted QA on that SHA: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43253443016 success, about 16m51s, including the fresh-build check. `ConnectionResetError` appeared 26 times in the local server log. No suite failed.

Hosted QA on the #41 head `81e2e02` (same tree as `70703cb`): https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43257209472 success, 18m43s. That run is hosted, not a local gate by this lane.

Earlier own gates stay on the heads named in `grok-status.md` (A1 `df857d0`, A2 `265c8f6`, A3 `b34b1db`, B1 `0488ea2`). They were not run again for this note.

The full gate after #40 merges was not run. #40 was still open.
