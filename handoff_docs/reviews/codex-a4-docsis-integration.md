# A4 integration of reviewed DOCSIS base — local source freeze

Prepared 2026-11-11T18:42:32.514707+00:00.

- Repository `/workspace/carpe-sweep`; existing published branch `codex/sweep-grading` / PR14.
- Ordinary merge commit **`25d5bb32bf311630d7fe077933e4b62e1acbea1f`** has parents root metadata freeze `c61b130afdeb6d69d7fcea10a9622a29c7878488` and reviewed new build3 `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e` (PR7).
- Clean worktree/index. Nothing pushed; no history rewrite, full gate, broad layout/smoke, install, APK, signing or publishing.
- Standalone SHA256 **`6610884a1b4e5a94c4453cef41ee719b86cbeb2e4342fbfbdf1bb41765912adc`**.
- PWA index SHA256 `c5bec837cf815846803c0f903683a92b9e7461f6b0f24b861285bb12541bd94f`; build ID `4bd3638473e61589a137`.

## Shared integration

Resolved authored conflicts additively in `night-sweep/thresholds.js`, `night-sweep/training.js`, Functions Markdown and Training Coverage Markdown. All Station and grading rows/stores/groups/edit routes coexist with DOCSIS rows, `docsis` store and both DOCSIS groups. The allowed store union is profile/sweep/grading/station/docsis. Both grading and DOCSIS custom-curve steps/features/control selectors remain. Existing module, placeholder, navigation and QA auto-merges keep all three features; DOCSIS source and source tests come from reviewed base.

A4 parser/archive/grading core/UI and Station JS/CSS remain byte-identical to c61b130; `docsis-health.js` remains byte-identical to reviewed bc69bb4. No further math, parsing, CRC/integrity, input cap or storage/schema semantics changed. Root's A1+A4 project status/update-log text auto-merged with the DOCSIS sections without conflicts. No new metadata prose, Lane A status, KNOWN_GAPS or receipt edits were authored; the base's Lane B status enters through the merge. Root still owns final current status/receipts.

Actual booted runtime: **24 task screens,42 feature choices; complete22, six-active14, custom-curves12, OEM8, DSIM9, manual7, GS7K10**. Functions documents all42 distinct runtime feature IDs, retaining both Station/grading sections and DOCSIS health. Main README copies are exact. Functions and Training Coverage custom counts are12 and feature counts42; main custom row/description also has12 and mentions DOCSIS. Guide HTML has unique IDs and valid fragments.

Authored guide files changed: `night-sweep/README.md`, `docs/NightSweep_1.8_Alpha_README.md`, `docs/NightSweep_1.8_Alpha_Functions_README.md`, `docs/NightSweep_1.8_Training_Coverage.md`; corresponding current HTML and PWA pages rebuilt. Marked18.2.0 scratch runtime was reused; no installs.

## Focused checks on changed shared surfaces

All below ran freshly against frozen generated standalone (`NIGHTSWEEP_RELEASE_TEST=1 node qa/<suite>`); no earlier counts are reused here.

| Suite | Actual checks | Seconds | Exit |
| --- | ---: | ---: | ---: |
| `build3-registry.test.cjs` | 13 | 3.81 | 0 |
| `build3-docsis-health.test.cjs` | 20 | 19.05 | 0 |
| `sweep-grading-ui.test.cjs` | 43 | 32.94 | 0 |
| `training-library.test.cjs` | 11 | 67.10 | 0 |
| `training-controls.test.cjs` | 10 | 29.71 | 0 |
| `ui-names.test.cjs` | 6 | 15.35 | 0 |
| `v20-design.test.cjs` | 8 | 5.52 | 0 |

DOCSIS suite additionally reports517 independent-reference comparisons. The unchanged43 grading cases include eight actual Station/binding-v2, immutable history, Before/After/done/date, await-away/back, library and portable original-ID-remap integration cases. No full-gate or broader source-suite count is inferred.

Fresh Chrome DevTools MCP (isolated headless desktop Chromium390px, dark/touch/mobile, no statistics/CrUX) replayed actual synthetic native ZIP→Station binding-v2 snapshot→raw PTV2.5/unknown unentered checks→actual-hash away/back rejection→portable exact-byte remap. Additional actual DOCSIS input plus both DOCSIS/grading registry edit buttons reached their correct screens, kept the job byte-identical and never graded automatically. No overflow or error console messages. Artifacts bind the exact standalone hash above. No private original/data was accessed.

Builds `python3 night-sweep/build.py` and `python3 build-pwa.py` succeeded and repeated byte-identically. All579 tracked hashes stayed unchanged through the focused checks and final rebuild, with no evidence restore. Main README equality, unique rendered IDs, valid fragments and all42 feature markers were independently checked. `git diff --check`, cached diff check, unstaged diff check and unmerged-path check passed before merge commit.

## Artifacts and hold

- `/tmp/carpe-a4-basebc69-checks/results.json`, suite logs and `pre-manifest.json`.
- `/workspace/.tools/chrome-devtools/checks/a4_docsis_integrated_smoke.py` reproducer.
- `/workspace/.tools/chrome-devtools/checks/a4-docsis-merged-results.json`.
- `/workspace/.tools/chrome-devtools/checks/a4-docsis-merged-grading-390.png` and `a4-docsis-merged-station-390.png`.
- `/workspace/.tools/chrome-devtools/checks/a4-docsis-merged-station-snapshot.txt`.

Full-gate wrapper/launcher remain **unstarted**. They will be refreshed to this new frozen head in prepare-only mode and require root's explicit start signal; if root adds metadata, exact-head binding must be refreshed again before the run. Root fresh review and any metadata freeze precede a full gate, then separate existing layout/smoke. Existing correctness/nonblocking gaps and physical Android/iPhone, Safari/WebView, emulator, meter/reference-plane and field limitations remain.
