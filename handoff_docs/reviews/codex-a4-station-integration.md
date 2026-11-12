# A4 integration into reviewed Station base — frozen local source

- Repository: `/workspace/carpe-sweep`, branch `codex/sweep-grading` (same PR #14 branch).
- Starting own head: `e0d43f9a28cf1d79a344c84d599f592a559b386a` (tested CRC source `b863821`).
- Integrated reviewed base: `21ed711cacbc03359e1418f79b9af6f76888ede5` via an ordinary two-parent merge, without rewriting published history.
- Frozen merge/source/test/build commit: **`5f7e2e673df08d1d4efa54c6b029b6481cd813fb`**. Parents are the two hashes above.
- `git status --porcelain` is empty; index clean; `git diff --check` and cached check passed. Nothing pushed, published, deployed, signed or merged into build3.
- Standalone SHA-256: `e64d949f625b88533fe948a1a4131227adffe9f9d79d5906157414c42d3b52a1`.
- PWA index SHA-256: `edc3a1b762a84e63f7280f2fe7108e7e4eedfc446b41ae4c22f8239d8bd6144a`; PWA build ID `67fe66b4557e838ddfb3`.

## Integration decisions

Kept both `StationView.validate` and `SweepGradingUI.validate`, both source-only retention guards in JobsUI, Station plus grading threshold rows/store handlers, both module/placeholder registrations, Station navigation and grading evidence text, and both practice/guide feature additions. Source conflict resolutions were additive in `night-sweep/jobs.js`, `night-sweep/thresholds.js`, `night-sweep/training.js` and `qa/run-pwa.py`. Generated conflicts in standalone/PWA and Functions HTML were resolved only by the real build/Markdown-render commands.

Station `station.js`/`station.css` remain byte-identical to origin/build3 21ed711. A4 `evidence.js`, `evidence-archive.js`, `sweep-grading.js` and `sweep-grading-ui.js` remain byte-identical to original own head e0d43f9. No math, parser, CRC/integrity, caps, package, version, storage keys or schema/format semantics were changed. Existing `.stations` capture correctly consumes the actual merged bindingVersion2 map; no speculative adapter change was needed.

Added eight combined integration cases to the existing grading UI suite (35→43). They use the actual merged Station controls and native synthetic ZIP, covering Before/After readings, stages, independent dates and done states, immutable current/history demotion, actual WebCrypto await with stage/date/done changed away and back, named-job save/duplicate/open, portable original-ID remapping and exact native bytes, both additive import validators, and legacy-unconfirmed/UBT read-only behavior. Imports, profile editing, Station editing and restore never grade automatically or mark acceptance/sweep work. A scratch negative control substitutes the historically wrong `.records` saved slot: the new actual-binding snapshot case fails with `null` versus the actual v2 map. Production source was not changed for that control.

Measured from the actual built runtime: **23 task screens, 41 feature choices; complete22, six-active14, custom-curves11, OEM8, DSIM9, manual7, GS7K10**. Main README copies are byte-identical. Functions now documents all 41 feature IDs, including Station and grading; main, Functions and Training Coverage guides carry the applicable current counts and both features. Rendered guides have unique IDs and valid local fragments.

## Metadata deliberately left for root

The only metadata conflicts were trailing competing feature appends:

- `NightSweep_Project_Status.md`: own `### A4: attached sweep grading aid (draft integration)` versus base `## Build 3 A1 — station worksheet (November 11, 2026)`.
- `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt`: own `A4 — ATTACHED SWEEP GRADING AID (DRAFT INTEGRATION)` versus base `A1 STATION WORKSHEET — NOVEMBER 11, 2026`.

Both are the exact existing own A4 versions as instructed. Root must reconcile the A1+A4 sections and stale draft/base language before the final gate. No new status/receipt/KNOWN_GAPS prose was authored; A1's existing committed evidence/review files enter through the base merge. Lane status and KNOWN_GAPS had no merge conflict. Historical/nonblocking source gaps remain open.

## Executed focused verification

All Node suites below ran with `NIGHTSWEEP_RELEASE_TEST=1`, loading the frozen standalone where the suite supports it. Native/core modules also execute their actual direct production sources. The 43-case UI suite additionally passed once in source-assembled mode. These are fresh focused results, not a full-gate claim.

| Suite under qa/ | Checks | Seconds | Exit |
| --- | ---: | ---: | ---: |
| `build3-native-evidence.test.cjs` | 69 | 0.13 | 0 |
| `build3-sweep-grading-core.test.cjs` | 93 | 0.09 | 0 |
| `sweep-grading-ui.test.cjs` | 43 | 29.46 | 0 |
| `build3-station.test.cjs` | 22 | 29.74 | 0 |
| `build3-station-review.test.cjs` | 11 | 27.20 | 0 |
| `build3-registry.test.cjs` | 13 | 4.17 | 0 |
| `training-library.test.cjs` | 11 | 77.24 | 0 |
| `training-controls.test.cjs` | 10 | 32.78 | 0 |
| `ui-names.test.cjs` | 6 | 17.29 | 0 |
| `named-jobs-storage.test.cjs` | 5 | 9.31 | 0 |
| `evidence-storage-failures.test.cjs` | 13 | 1.08 | 0 |
| `evidence-context.test.cjs` | 8 | 0.55 | 0 |
| `import-id-boundaries.test.cjs` | 6 | 1.51 | 0 |
| `build3-station-layout.test.py` | 121 | 14.38 | 0 |
| `sweep-grading-layout.test.py` | 47 | 10.10 | 0 |

Rendered commands used `NIGHTSWEEP_RELEASE_TEST=1 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/<suite>`. No broader existing layout/smoke/full gate was started, per coordinator instruction.

Executed builds: `python3 night-sweep/build.py`, `python3 build-pwa.py`. Markdown rendering used `CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs` for main, Functions and Training Coverage; installed Marked is exactly18.2.0. Final repeated real builds reproduced all bytes. A 272-file tracked source/QA/guide/build manifest remained unchanged through the remaining focused tests and final rebuild; stored in `frozen-manifest.json` below. No tracked evidence restoration was needed.

## Chrome DevTools MCP evidence

Used the real local MCP server through the existing standard stdio Client in `/workspace/.tools/chrome-devtools/checks/probe.py`, with headless isolated `/usr/bin/chromium`, no usage statistics, no CrUX and no periodic update checks. The advertised artifact root remained only the checks directory. Actual MCP tools: `new_page`, `emulate`, `evaluate_script`, `take_snapshot`, `take_screenshot`, `list_console_messages`.

At390px dark/mobile/touch emulation, actual synthetic native ZIP import and real Station edits captured bindingVersion2, gave raw PTV2.5 with unentered checks unknown, kept Station/acceptance unchanged, rejected pending actual-hash away/back edits, preserved immutable grading history and separate balance/sweep states, and exported/restored exact compressed bytes with remapped grading source identity. Both optional sections survived. Browser returned no overflow and no error console messages. Screenshots were visually inspected. All served data were the default/synthetic committed app/fixtures; no private originals were read or used.

Artifacts:

- `/tmp/carpe-a4-base21ed-checks/results.json`, `render-results.json` and each suite log.
- `/tmp/carpe-a4-base21ed-checks/frozen-manifest.json`.
- `/tmp/carpe-a4-combined-ui.log` (source-mode43).
- `/tmp/carpe-a4-actual-map-negative.log` (expected negative-control failure).
- `/workspace/.tools/chrome-devtools/checks/a4_integrated_smoke.py` (reproducer).
- `/workspace/.tools/chrome-devtools/checks/a4-merged-results.json`.
- `/workspace/.tools/chrome-devtools/checks/a4-merged-grading-390.png`.
- `/workspace/.tools/chrome-devtools/checks/a4-merged-station-390.png`.
- `/workspace/.tools/chrome-devtools/checks/a4-merged-station-snapshot.txt`.

## Hold point

Ready for root's fresh review and metadata reconciliation, then same-head full gate and authorized PR14 publication. This agent ran no full gate or GitHub mutation. No emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane, RF hardware or field check; no APK/signing/deployment. Legacy-unconfirmed does not imply confirmed work, and no existing nonblocking correctness/performance gap is closed by this integration.

Tools used: GitHub connector read of PR14; local Git fetch/merge/source/diff/commit; Superpowers debugging/testing/verification guidance; Node/Python builds and executed QA; actual Chrome DevTools MCP plus the two existing Playwright/Chromium focused suites. No unavailable tool is claimed as executed.
