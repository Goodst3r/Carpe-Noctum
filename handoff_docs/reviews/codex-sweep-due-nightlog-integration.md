# A3 Sweep due integration of reviewed Night log base

Frozen head **`072eb0ec193e7cd621e9f76c4024ecd02de1288d`**, clean ordinary merge. Starting A3 head `26f279f18a3dd2ea4fb1c23dcffdd4eea099b666`; exact incoming build3 `f50a7445a8c5254b0db4db5d9e4309569345c12c`. Parent order is A3 then incoming base. Tree `2d02fe78dec52d58dcd492c9513cf0b97b53b7dc`. No rebase, amendment, force push, GitHub write or full-gate run in this task.

Incoming tree `2e7b91683b097d33526f5d2ea737a16deb8fe13a` exactly equals reviewed Night-log head `3c3a25f57654d3597112d8c60d130ae5707dada3`. Helper fetch immediately before freeze still resolved origin/build3 to the authorized f50 base; no newer base was integrated. All source changes are the shared wiring necessary to keep the two already reviewed implementations together. Source provenance is the two Git input trees and existing checked-in references, not a newly invented engineering source.

## Preservation and integration

- Incoming `night-log.js`, `night-log.css`, Night-log fixture and both Night-log suites are byte-exact f50. Station, shared stylesheet, Checklist/Safety/Outage implementation bytes are also exact incoming base. The separate unmerged A1 native-input correction was not imported.
- `sweep-due.js`, its stylesheet, both suites and the independent calendar cases/reference remain byte-exact 26f. Parse/classify arithmetic, Gregorian boundaries, unknown defaults, read-only historical wording, independent balance/sweep dates, collector overlay/ambiguity rules, pagination/focus and failed-save notice were not edited.
- App import validation is exactly incoming app plus the existing SweepDue optional validator. Jobs content recognition is exactly incoming predicate plus `state.sweepDue`. Both `state.nightLog` and `state.sweepDue` optional sections survive import, named duplication and portable backup/reopen together. The incoming `savedNightLog` example keeper variable and spread are intact. Neither input had `savedSweepDue` or `savedGrading` keepers, so none was invented. The reviewed Route-example action still retains NightLog exactly and drops the interval according to existing A3 behavior; this was explicitly exercised, not described as preserving the interval.
- All **45 incoming base feature objects** (including their controls) remain the exact prefix; SweepDue appends as **46**. All **36 base splice entries** remain the exact prefix, followed by the existing A3 JS/CSS entries: **38 splice entries**, not a claim of38 JS modules. All **72 base registered suites** remain once in the same relative order; A3 adds two, giving **74 registered suites**. This is a static registration count, not a74-suite PASS.
- The exact eight base Job tabs remain the ordered prefix and Sweep due is ninth: Details, ONX files, Checklists, Safety, Outage, Acceptance, Run sheet, Night log, Sweep due. The exact ordered assertion is present in both inherited Checklist QA and naming QA. Neither assertion was weakened. `NightLog.render(true)` and the existing `SweepDue.render()` dispatches both survive.
- All67 incoming registry row objects are unchanged; the existing five A3 rows yield72. The incoming Night-log application-guard group survives, and the SweepDue resolver/editor/target grouping survives. Company values remain unknown until entered; the interval is optional, starts unknown, and the civil-date/two-thirds policies remain labeled Unknown/unverified.
- Runtime source and frozen app both have **29 task screens,46 feature choices**. The seven actual practice lengths in runtime order are **22/16/14/8/9/7/10**: complete, six-active, custom curves, OEM, DSIM, manual/thermal, GS7K. Every base step remains unchanged after removing the one A3 reminder step from six-active. All seven summary counts agree.
- All **21 current practice-table rows** across main README, Functions and Coverage match runtime. Current screen/feature totals match all three; the main README copies are byte-identical. Functions has34 explicit contents entries covering all current sections except the contents heading itself,46 unique feature markers, unique rendered heading IDs and resolving local anchors. All three rendered guides have unique IDs and resolving fragment links. The Route navigation table now includes its actual Station screen. Historical Build2 descriptions and historical validation receipts were not rewritten.

## Changed paths and why

The complete exact65-path change list from the starting A3 head is appended below; many files are incoming A2 implementation/provenance/receipt files, not new A3 authorship. The smaller exact delta against incoming f50 is also appended.

- `night-sweep/app.js`, `jobs.js`: union optional validator and content terms while retaining the incoming example keeper.
- `night-sweep/build.py`, `shell.html`, `workflow.js`: retain NightLog splice/style/panel/init/routes and append the existing A3 wiring.
- `night-sweep/thresholds.js`, `training.js`: retain both sets of registry/features/steps, order base features before A3, and derive actual summaries.
- `qa/run-pwa.py`: union all suites once; `qa/build3-checklist.test.cjs` and `qa/ui-names.test.cjs`: exact nine-label expectations. Incoming NightLog QA and its registry assertion are retained.
- `night-sweep/README.md`, mirrored main docs, Functions and Coverage Markdown/HTML: retain both feature guides and reconcile current totals, practice rows, navigation and TOC/markers.
- `outputs/Night_Sweep.html`, `dist/index.html`, release/worker and three dist guide copies: regenerated normally; no generated conflict was hand-merged.
- Incoming NightLog module/CSS, fixture/suites and `research/build3/NIGHT_LOG_SOURCES.md`: imported unchanged from reviewed f50.
- Incoming handoff receipts/reviews are imported verbatim. `handoff_docs/lanes/codex-status.md` is exactly the incoming f50 file. Project Status/update log and Known Gaps keep the incoming and existing A3 historical sections verbatim; **no new status/update-log receipt or current-count reconciliation was authored**. Parent owns their publication/reconciliation. Their older historical totals are not current runtime totals.

## Own focused results

All commands below executed in `/workspace/carpe-sweep-due`. The external runner `/tmp/carpe-a3-nightlog-focused.py` clears inherited source/release/evidence switches before each command, uses the existing shared locked QA dependencies and directs logs outside the repository. Source/frozen results are separate runs; counts are parsed from their actual logs.

| Exact command | Own result | Seconds | Raw log |
| --- | --- | --- | --- |
| `node qa/build3-night-log.test.cjs` | 23 PASS | 36.58 | `/tmp/carpe-a3-nightlog-nightlog-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs` | 23 PASS | 34.87 | `/tmp/carpe-a3-nightlog-nightlog-frozen.log` |
| `node qa/build3-sweep-due.test.cjs` | 37 PASS | 17.53 | `/tmp/carpe-a3-nightlog-due-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` | 37 PASS | 18.93 | `/tmp/carpe-a3-nightlog-due-frozen.log` |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-checklist.test.cjs` | 37 PASS | 12.37 | `/tmp/carpe-a3-nightlog-checklist-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-checklist.test.cjs` | 37 PASS | 11.11 | `/tmp/carpe-a3-nightlog-checklist-frozen.log` |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` | 14 PASS | 4.27 | `/tmp/carpe-a3-nightlog-registry-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-registry.test.cjs` | 14 PASS | 3.96 | `/tmp/carpe-a3-nightlog-registry-frozen.log` |
| `node qa/ui-names.test.cjs` | 6 PASS | 17.04 | `/tmp/carpe-a3-nightlog-names-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/ui-names.test.cjs` | 6 PASS | 15.65 | `/tmp/carpe-a3-nightlog-names-frozen.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-night-log-layout.test.py` | 107 PASS | 8.54 | `/tmp/carpe-a3-nightlog-nightlog-native.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py` | 189 PASS | 8.3 | `/tmp/carpe-a3-nightlog-due-native.log` |

`node /tmp/carpe-a3-nightlog-integration-audit.cjs` exited0: **8 focused integration groups**. The script and `/tmp/carpe-a3-nightlog-integration-audit.json` preserve its exact assertions. It checked both source and frozen feature/registry semantics, guide rows/totals/markers/anchors and all20 worker asset hashes, exact implementation provenance, and actual cross-feature DOM behavior. A five-station synthetic NightLog capture stayed immutable while actual Station controls set separate balance/sweep dates; entered18 and explicit2026-11-11 produced the expected twelve-month yellow reminder without manufacturing a sweep date from the capture timestamp. Reading/navigation preserved the entire job and both existing storage keys byte-for-byte. Malformed optional sections were rejected atomically; named duplication and portable export/reopen retained both optional sections and Station data. Example keeper behavior was verified explicitly.

The two rendered suites use actual local Chromium through Playwright at320/360/390/430px; they are rendered desktop-browser phone-width checks, **not** emulator, physical phone or Android WebView results. The unchanged focused A3 tests include historical legacy/UBT neutral wording, year/date boundaries, pagination/focus and adjacent failed-save notices. No new mathematical formula was added; existing independent reference attribution remains unchanged. No physical phone/iPhone/Safari, screen reader, hardware/RF/field, native provider dialogs, APK/signing or deployment was tested/performed.

## Builds, exact bytes and clean seal

Existing Marked18.2 was reused with `CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules` for:

```text
node docs/render_readme.cjs
node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

Initial renders/builds resolved generated conflicts normally. The final explicit rebuild via `python3 /tmp/carpe-a3-nightlog-seal.py` exited0 and reproduced **all610 present tracked file hashes**, semantic staged entries and the staged tree exactly. No output/release/research churn was restored or hidden. Build raw output: `/tmp/carpe-a3-nightlog-rebuild.log`. Main/Functions/Coverage renders report31/35/8 sections. Existing dependency symlink and lockfiles were unchanged; no dependency install ran.

`node --check` exited0 for app, jobs, training, workflow, thresholds, NightLog, SweepDue and both changed exact-tab QA files. Python AST inspection confirmed exact base module prefix and the unique suite union. `git diff --cached --check` passed. `git commit -m 'Merge reviewed Night log base into Sweep due'` made the ordinary two-parent commit above. Post-commit verification confirmed clean tracked/untracked status, expected parents/tree and all610 hashes unchanged.

- Standalone HTML SHA-256: `a765323807749debd2a035ad7929fe2aa5c2fad8ec42456f872b5d75f613c7d0`
- PWA index SHA-256: `45ddd2c6497812ff9a49f410034a38acb96883bf52e215f1039583f24b8e0972`
- Worker SHA-256: `cdadd2773bf563b64800821062bf827a1b1fd44a3085ec8dac0ea008e9e39e32`
- PWA content version: `895c3d743a958543a5a5`; worker `sw.895c3d743a958543a5a5.js`; app identity unchanged `2.0 Alpha build 3`.
- Full proof: `/tmp/carpe-a3-nightlog-integration-proof.json`, SHA-256 `1175f9921eccaca5b9c45defcab5f5dc24572f131fae18b39cab3a62bbd1823d`.

Only focused checks ran at this integration. Parent still owes the fresh whole gate/separate whole-app layout/smoke at this exact new source head plus independent review/publication. The preceding26f whole-gate result72/1629 plus separate554/346 is **historical parent evidence**, not this merge's run. The older c6 failure remains a real failed gate71/72,raw1592,480.3s with its sealed `/tmp/carpe-a3-peer-full-recovery2-*` logs/receipt; it was never relabeled green or overwritten. The exact-list QA correction at26f remains intact and is extended here to include the incoming NightLog tab.

Sources/tools: exact local Git objects and reviewed base equivalence; existing A3/NightLog source/reference/QA; local Node/Python/JSDOM and existing Playwright/Chromium; existing Marked18.2; verification-before-completion skill guidance. No private attachment was opened. No full gate, broad suite, push, PR, GitHub write or child agent was started.

## Exact changed paths from starting26f

```text
M	CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt
M	NightSweep_Project_Status.md
M	dist/functions-guide.html
M	dist/guide.html
M	dist/index.html
M	dist/release.json
R094	dist/sw.36420d81ffb705793350.js	dist/sw.895c3d743a958543a5a5.js
M	dist/training-coverage.html
M	docs/NightSweep_1.8_Alpha_Functions_README.html
M	docs/NightSweep_1.8_Alpha_Functions_README.md
M	docs/NightSweep_1.8_Alpha_README.html
M	docs/NightSweep_1.8_Alpha_README.md
M	docs/NightSweep_1.8_Training_Coverage.html
M	docs/NightSweep_1.8_Training_Coverage.md
M	handoff_docs/KNOWN_GAPS.md
A	handoff_docs/lanes/codex-a2-focused-validation.json
A	handoff_docs/lanes/codex-a2-guard-devtools.json
A	handoff_docs/lanes/codex-a2-guard-focused.json
A	handoff_docs/lanes/codex-a2-guide-correction.json
A	handoff_docs/lanes/codex-a2-validation.json
A	handoff_docs/lanes/codex-ci-current-validation.json
M	handoff_docs/lanes/codex-status.md
A	handoff_docs/reviews/codex-a2-ci-only-integration.md
A	handoff_docs/reviews/codex-ci-current-gate.md
A	handoff_docs/reviews/codex-ci-current-review.md
A	handoff_docs/reviews/codex-highsplit-review.md
A	handoff_docs/reviews/codex-leakage-review.md
A	handoff_docs/reviews/codex-night-log-addendum-fix.md
A	handoff_docs/reviews/codex-night-log-addendum-gate.md
A	handoff_docs/reviews/codex-night-log-addendum-review.md
A	handoff_docs/reviews/codex-night-log-gate.md
A	handoff_docs/reviews/codex-night-log-guard-followup.md
A	handoff_docs/reviews/codex-night-log-guard-review.md
A	handoff_docs/reviews/codex-night-log-outage-gate.md
A	handoff_docs/reviews/codex-night-log-outage-integration.md
A	handoff_docs/reviews/codex-night-log-outage-review.md
A	handoff_docs/reviews/codex-night-log-peer-time-fix.md
A	handoff_docs/reviews/codex-night-log-peer-time-gate.md
A	handoff_docs/reviews/codex-night-log-peer-time-review.md
A	handoff_docs/reviews/codex-night-log-rebased-gate.md
A	handoff_docs/reviews/codex-night-log-review.md
A	handoff_docs/reviews/codex-night-log-safety-integration.md
A	handoff_docs/reviews/codex-night-log.md
A	handoff_docs/reviews/codex-required-integration-addendum.md
A	handoff_docs/reviews/codex-required-integration-notes.md
A	handoff_docs/reviews/codex-why-cards-review.md
M	night-sweep/README.md
M	night-sweep/app.js
M	night-sweep/build.py
M	night-sweep/jobs.js
A	night-sweep/night-log.css
A	night-sweep/night-log.js
M	night-sweep/shell.html
M	night-sweep/thresholds.js
M	night-sweep/training.js
M	night-sweep/workflow.js
M	outputs/Night_Sweep.html
M	qa/build3-checklist.test.cjs
A	qa/build3-night-log-layout.test.py
A	qa/build3-night-log.test.cjs
M	qa/build3-registry.test.cjs
A	qa/night-log-fixture.js
M	qa/run-pwa.py
M	qa/ui-names.test.cjs
A	research/build3/NIGHT_LOG_SOURCES.md
```

## Exact A3 integration delta against incomingf50

```text
M	CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt
M	NightSweep_Project_Status.md
M	dist/functions-guide.html
M	dist/guide.html
M	dist/index.html
M	dist/release.json
R094	dist/sw.7ec73c8a1fa09c798d4d.js	dist/sw.895c3d743a958543a5a5.js
M	dist/training-coverage.html
M	docs/NightSweep_1.8_Alpha_Functions_README.html
M	docs/NightSweep_1.8_Alpha_Functions_README.md
M	docs/NightSweep_1.8_Alpha_README.html
M	docs/NightSweep_1.8_Alpha_README.md
M	docs/NightSweep_1.8_Training_Coverage.html
M	docs/NightSweep_1.8_Training_Coverage.md
M	handoff_docs/KNOWN_GAPS.md
A	handoff_docs/lanes/codex-a3-validation.json
A	handoff_docs/reviews/codex-a3-ci-only-integration.md
A	handoff_docs/reviews/codex-pop-review.md
A	handoff_docs/reviews/codex-study-review.md
A	handoff_docs/reviews/codex-sweep-due-gate.md
A	handoff_docs/reviews/codex-sweep-due-review.md
A	handoff_docs/reviews/codex-sweep-due.md
M	night-sweep/README.md
M	night-sweep/app.js
M	night-sweep/build.py
M	night-sweep/jobs.js
M	night-sweep/shell.html
A	night-sweep/sweep-due.css
A	night-sweep/sweep-due.js
M	night-sweep/thresholds.js
M	night-sweep/training.js
M	night-sweep/workflow.js
M	outputs/Night_Sweep.html
M	qa/build3-checklist.test.cjs
A	qa/build3-sweep-due-layout.test.py
A	qa/build3-sweep-due.test.cjs
M	qa/run-pwa.py
M	qa/ui-names.test.cjs
A	research/build3/sweep-due-calendar-cases.json
A	research/build3/sweep-due-calendar-reference.py
```
