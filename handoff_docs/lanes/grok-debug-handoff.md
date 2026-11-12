# Grok debug handoff

Written after the local gate. The gate and the hosted run below are on `2cf59203d685a7760b27cacdbfb94698c8c661b2`. This file is a later commit. It does not change the app. A5, A6 and B5 were not started. No APK, phone, emulator, Safari, WebView or meter check was run.

## Final build3 head that was gated

`2cf59203d685a7760b27cacdbfb94698c8c661b2` — `Rebuild and recount after the batch`.

Standalone `outputs/Night_Sweep.html` SHA-256: `4d28d00ab167fe6d47749550e840c6c5fb6d81edd7bb4d721e8b3db6029e3652`.

PWA release `f3fbf2fb048c46ee5364` (`dist/sw.f3fbf2fb048c46ee5364.js`).

Product counts from that standalone in JSDOM (`qa/build2-source-harness.cjs`), not from the gate: 35 task screens, 53 feature choices, practice steps 22/16/21/8/9/7/10, 159 registry rows (`Thresholds.rows.length`). Loading `thresholds.js` with `EvidenceArchive` undefined is 156. `EvidenceArchive.limits` adds 3. Versus `02b9ca4`, the three added row ids are `nightLog.ingress.conditions.max`, `nightLog.ingress.observedAt.max` and `nightLog.ingress.weather.max`. #42 adds no row.

## What landed on build3

| PR | Merge commit | PR head | State |
| --- | --- | --- | --- |
| [#39](https://github.com/Goodst3r/Carpe-Noctum/pull/39) thermal CNR | `02b9ca4ec79c371dbc1543e0058f2c9a54ca64ff` | `223867e3d495a1375c4374c4ba4b008c0ef29112` | already merged before this pass |
| [#43](https://github.com/Goodst3r/Carpe-Noctum/pull/43) batch workflow | `e5ae1093e1d8570cdd7476c5752072db0b244f5d` | docs only | already merged |
| [#36](https://github.com/Goodst3r/Carpe-Noctum/pull/36) Night log | `0878cfbe89b261d61c0b38bb05eba6bf1a64aac0` | `92be1e7964aac11843f85e035738f0952403034f` | merged by the push of that merge commit. Parents `02b9ca4` and `92be1e7` |
| [#42](https://github.com/Goodst3r/Carpe-Noctum/pull/42) ripple width label | `a755fde9dd1878ea2f66cf31b52fb54f7e737c83` | `2cbd38f8ee5b67c3662c1a92ca0dba9a679704fb` | merged the same way. It was still a draft. Parents `0878cfb` and `2cbd38f` |

No local gate was run between `0878cfb` and `a755fde`. Generated files were not hand-merged. Against `02b9ca4` the conflicts were generated files. Merging #42 onto the #36 result also conflicted in the update log, project status, functions PDF, `SHA256SUMS.txt` and `chatgpt-status.md`. Both product notes were kept. The PDF and checksum stayed on the post-#36 side. `python3 night-sweep/build.py && python3 build-pwa.py` then replaced `dist/`. A second run of those two commands produced no diff.

## Not in this head

- [#40](https://github.com/Goodst3r/Carpe-Noctum/pull/40) is open. When this note was written its head was `d7c0775997d50ba96c9117e982f7ef4b41389b30` (`Merge build3 into Supply PM fixes and regenerate batch outputs` by Spencer Williams, parent `d6cf2c7` `Supply PM export and import: fix the five review findings`). Not reviewed here. Not merged.
- [#41](https://github.com/Goodst3r/Carpe-Noctum/pull/41) is open. The Station strip fix is `cb29dbe8a10c039b39eb164101e0cce373789cf5` on `grok/a4-context`. Comment: https://github.com/Goodst3r/Carpe-Noctum/pull/41#issuecomment-6828609625. After that push, Spencer Williams added `cd433a2ed32ea478fc5f2d3bc16aa4648fa056fd` (`Merge build3 into context-strip fix and regenerate batch outputs`). That later commit was not made here. Hosted QA on it was still in progress: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43253569219 (`cd433a2`). Not merged.
- A5 tonight list, A6 exact resume and B5 temporary repairs were not started. Items 16 and 12 stay blocked. Draft #32 was not touched.

After #40 and #41 are merged, they still need the same merge-then-one-rebuild treatment. This gate does not cover them.

## Local gate on `2cf5920`

Chromium: `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. Started `2026-11-12T15:53:48Z`. Ended `2026-11-12T16:09:26Z`.

| Command | Exit |
| --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 |
| `python3 night-sweep/build.py && python3 build-pwa.py` | 0 |
| `git diff --check` before the suites | 0 |
| `NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git diff --check` after | 0 |
| `git status --porcelain` | empty |

`qa/run-pwa.py`: 102 suites, 2830 checks, 896.8 s. Layout: `Build3 layout: 1252 checks passed`. Smoke: `Chromium rendered checks: 370 passed`.

The local HTTP server logged `ConnectionResetError` 26 times during layout and smoke. Each suite still printed its pass line and the processes exited 0. No suite failed, so there is no failure transcript.

## Hosted QA

`QA gate` does not run on a push to `build3`. It was started with `workflow_dispatch` on this SHA.

https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43253443016 — success, head `2cf59203d685a7760b27cacdbfb94698c8c661b2`, about 16m51s. The job reported the committed generated files match a fresh build, the automated suites, build 3 layout, browser smoke, and a clean tree.

## #41 fix that was pushed

On Station, the strip used the route point from `chosen()` and the plane from `StationView.currentStage`. Those can be different stations. `StationView.currentTarget` now returns the worksheet's installed station (`key`, `id`, `label` only). The point line uses that label. The plane line uses `currentStage` of that same target, including Before/After. Off Station, the strip still shows the route point and hides the plane. Nothing new is stored.

`node qa/build3-context-strip.test.cjs` on `cb29dbe` after `python3 night-sweep/build.py && python3 build-pwa.py`: `Build3 context strip: 23 checks passed`. Exit 0. That run is not the build3 gate above.

## Doubts

- The project-status table on `02b9ca4` said 153 live registry rows. Loading that commit's `thresholds.js` with the three archive limits produced 156. This recount is the running app on `2cf5920` (159). Screens and features stayed 35 and 53.
- The functions PDF in the #42 merge is the post-#36 blob, not the #42 reprint. `SHA256SUMS.txt` matches that blob (`41fb08dcaad3f2a2ee2a89054e59102e7523338ad580a214f00a4fd6619a9413`). The functions markdown on this head does contain the app-chosen wording. The PDF was not reprinted here.
- #40's new supply-PM commits and #41's `cd433a2` merge were not reviewed or gated here.
