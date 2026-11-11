# NightSweep 1.7 Alpha function and feature coverage audit

The existing frozen-build report records **38 passing suites and 819 checks**. This audit did not rerun or alter the product/build. Current standalone SHA-256: `26abddfcce351f0323e58dc50b7d1ee1ca2a888b7d248d10d122d5cfad6e6e4d`.

Inventoried **24 JavaScript source files**, **530 named function/arrow matches** (lower bound), and **144 explicitly exposed module methods**. All 22 application source texts match the tested standalone; two additional inventoried files are PWA client/worker sources. No JavaScript AST parser was installed; the attached JSON identifies regex matches, line numbers, public methods, qualified test-text mentions, source hashes and mapped suites. Text mentions identify inspection candidates, not execution coverage.

All major feature families have corresponding suites. This is a source/suite mapping plus focused manual review; it does **not** establish every function, callback, branch or configuration was tested.

## Feature-to-test map

| Feature | Principal test suites | Scope |
|---|---|---|
| Navigation, mobile task controls, focus and render stability | `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `training-job.test.cjs`, `dom-tests.cjs`, `alpha17-engine.test.cjs`, `launch-source.test.cjs` | Task navigation and controls are exercised in DOM; visual/touch/accessibility behavior needs rendered browser and device review. |
| RF route, cable/passive interpolation, temperature, active gain, branches, drops | `engine.test.js`, `route14.test.cjs`, `wolfram-rf.test.cjs`, `wolfram-power.test.cjs`, `alpha17-engine.test.cjs`, `../night-sweep/research/alpha17-fresh-reference-check.cjs`, `dom-tests.cjs`, `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `launch-source.test.cjs`, `training-job.test.cjs`, `alpha14-ui.test.cjs` | Independent RF references plus route/DOM integration; not every model/frequency/configuration combination. |
| TDR distance, velocity factor, boundary and active barriers | `engine.test.js`, `route14.test.cjs`, `wolfram-rf.test.cjs`, `wolfram-power.test.cjs`, `alpha17-engine.test.cjs`, `../night-sweep/research/alpha17-fresh-reference-check.cjs`, `dom-tests.cjs`, `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `launch-source.test.cjs`, `training-job.test.cjs` | Synthetic distance examples and active-boundary guards. |
| Power circuit, curves, voltage drop, nonlinear load and what-if | `engine.test.js`, `route14.test.cjs`, `wolfram-rf.test.cjs`, `wolfram-power.test.cjs`, `alpha17-engine.test.cjs`, `../night-sweep/research/alpha17-fresh-reference-check.cjs`, `alpha17-report.test.cjs`, `alpha012.test.cjs`, `browser-files.test.cjs`, `training-job.test.cjs` | Independent numeric and invalid/convergence edge cases; installed load/waveform not physically measured. |
| Frequency checker and exact overrides | `frequency-regression.cjs`, `dom-tests.cjs`, `training-job.test.cjs`, `wolfram-rf.test.cjs` | Frequency limits, units, overrides and unknown launch exercised. |
| Node identity, split limits, source selection and launch correction | `nodes.test.cjs`, `launch-source.test.cjs`, `node-setup-refresh.test.cjs`, `training-job.test.cjs`, `alpha17-report.test.cjs`, `wolfram-records.test.cjs` | Standard GS7000 1G/1.2G and EN9000 selectable; SHO/Intelligent/RPD procedures not selectable setup claims. |
| Equipment manuals, OEM AGC, DSIM and historical code lookup | `equipment-setup.test.cjs`, `equipment-control.test.cjs`, `node-setup-refresh.test.cjs`, `alpha17-report.test.cjs`, `training-job.test.cjs`, `dsim-pilot-codes.test.cjs` | Exact model/control bindings, procedure selection, stale-context guards, source pages and pilot code tests; no physical DSIM controller/app connection. |
| Local targets and available-carrier estimates | `local-operator-preset.test.cjs`, `alpha012.test.cjs`, `training-job.test.cjs` | Local 54/860 targets and 42 MHz TX reference separated from measured launch, pilot, injection and receive references; independent equations. |
| Forward/return setup and referenced measurements | `sweep-setup.test.cjs`, `local-operator-preset.test.cjs`, `training-job.test.cjs`, `wolfram-records.test.cjs`, `alpha17-report.test.cjs`, `launch-source.test.cjs`, `projects.test.js`, `upgrade01617.test.cjs`, `alpha011-integration.cjs` | 42 MHz forward/return sweepless distinct from 204/258 XPERTrak return; reference/compensation/acceptance guards; actual instrument capability and traces remain operator verification. |
| Jobs, named copies, migration, imports/exports and training | `alpha012.test.cjs`, `training-job.test.cjs`, `evidence-context.test.cjs`, `upgrade01617.test.cjs`, `dom-tests.cjs`, `alpha17-engine.test.cjs`, `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `launch-source.test.cjs`, `browser-files.test.cjs` | Working-job retention, cancellation, quota failures, portable recoveries and current/legacy migration fixtures. |
| Evidence originals, CSV decoder, storage, hashes and context | `evidence.test.cjs`, `evidence-ui.test.cjs`, `evidence-context.test.cjs`, `training-job.test.cjs`, `browser-files.test.cjs` | Original bytes preserved; native ONX/JSON/ZIP/PDF/XML/images are attachments, not a verified native schema decoder. |
| Reports, checklists, CSV/text/print/share | `alpha17-report.test.cjs`, `alpha012.test.cjs`, `browser-files.test.cjs`, `training-job.test.cjs` | Content/dispatch/print restoration tested; actual OS file persistence, print pages and pagination unverified. |
| Offline PWA installation, cache, update and retained work | `pwa-client.test.cjs`, `pwa-worker.test.cjs`, `browser-files.test.cjs` | Service-worker network/cache lifecycle and install prompt simulations; actual Android/iOS lifecycle/offline eviction not proven. |

## Module inventory

| Source | Named functions (lower bound) | Public methods | Matching suites |
|---|---:|---|---|
| `night-sweep/app.js` | 73 | Global functions / data; see JSON | `dom-tests.cjs`, `alpha17-engine.test.cjs`, `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `launch-source.test.cjs`, `training-job.test.cjs` |
| `night-sweep/browser-files.js` | 10 | prepare, share, download, dismiss | `browser-files.test.cjs` |
| `night-sweep/dsim-pilot-codes.js` | 2 | lookup | `dsim-pilot-codes.test.cjs`, `equipment-setup.test.cjs` |
| `night-sweep/engine.js` | 29 | number, curveValue, parseTable, launchAt, portsFor, selectedCurve, passiveAt, activeGainAt, spanLength, routeDistances, tdrLocate, cableAt, run, gainBudget, grid, dcSegment, dcRoute, powerRun | `engine.test.js`, `route14.test.cjs`, `wolfram-rf.test.cjs`, `wolfram-power.test.cjs`, `alpha17-engine.test.cjs`, `../night-sweep/research/alpha17-fresh-reference-check.cjs` |
| `night-sweep/equipment-setup.js` | 49 | init, render, validate, manualFor, reportSections | `equipment-setup.test.cjs`, `equipment-control.test.cjs`, `node-setup-refresh.test.cjs`, `alpha17-report.test.cjs`, `training-job.test.cjs` |
| `night-sweep/evidence-ui.js` | 34 | init, render, importFiles, exportProject, prepareImport, downloadOriginal, reloadPreviews, compactState, cleanupUnused, isBusy | `evidence-ui.test.cjs`, `evidence-context.test.cjs`, `training-job.test.cjs`, `browser-files.test.cjs` |
| `night-sweep/evidence.js` | 17 | parseText, validateEvidence, validateParse, bytesToBase64, base64ToBytes | `evidence.test.cjs`, `evidence-ui.test.cjs`, `evidence-context.test.cjs` |
| `night-sweep/field-reference.js` | 33 | init, validate, applyAnchors, applyTargets, applyLocalNonHighSplit, localNonHighSplitPreset, setupTargets, fillLocalMarkers, fillTargets, targetCalculation, targetCenters, cableLoss, publishedFaces, openTap, draft, render, refreshReadouts | `local-operator-preset.test.cjs`, `alpha012.test.cjs`, `training-job.test.cjs` |
| `night-sweep/field-report.js` | 37 | init, calculatePowerWhatIf, refreshTrial, sheetData, sheetText, csvRows, sheetCsv, renderSheet, openSheet, printSheet | `alpha17-report.test.cjs`, `alpha012.test.cjs`, `browser-files.test.cjs`, `training-job.test.cjs` |
| `night-sweep/field-work.js` | 22 | init, render, refresh, validate, normalize, convert, reportSections, reportRows | `alpha012.test.cjs`, `training-job.test.cjs` |
| `night-sweep/frequency.js` | 10 | Global functions / data; see JSON | `frequency-regression.cjs`, `dom-tests.cjs`, `training-job.test.cjs`, `wolfram-rf.test.cjs` |
| `night-sweep/jobs.js` | 39 | init, render, open, newJob, openTraining, saveNamed, duplicate, remove, beforeProjectOpen, snapshots, referencedEvidenceIds, theme, isBusy, metadata, workOrderWarnings, setJobField, projectMetaChanged | `alpha012.test.cjs`, `training-job.test.cjs`, `evidence-context.test.cjs`, `upgrade01617.test.cjs` |
| `night-sweep/launch-source.js` | 10 | init, render, status, validate, type, model, label, issues | `launch-source.test.cjs`, `alpha17-report.test.cjs`, `training-job.test.cjs` |
| `night-sweep/meter.js` | 15 | Global functions / data; see JSON | `wolfram-records.test.cjs`, `alpha17-report.test.cjs`, `launch-source.test.cjs`, `training-job.test.cjs` |
| `night-sweep/nodes.js` | 15 | defaults, number, profile, band, issues, choice, patch | `nodes.test.cjs`, `launch-source.test.cjs`, `node-setup-refresh.test.cjs`, `training-job.test.cjs` |
| `night-sweep/projects.js` | 24 | n, coverage, evaluate, generator | `projects.test.js`, `wolfram-records.test.cjs`, `upgrade01617.test.cjs`, `alpha011-integration.cjs` |
| `night-sweep/route-tools.js` | 18 | Global functions / data; see JSON | `alpha14-ui.test.cjs`, `route14.test.cjs`, `alpha15-ui.test.cjs`, `training-job.test.cjs` |
| `night-sweep/selfcheck.js` | 5 | Global functions / data; see JSON | `../night-sweep/selfcheck.js`, `equipment-reference.test.cjs` |
| `night-sweep/sweep-guide.js` | 1 | Global functions / data; see JSON | `sweep-setup.test.cjs`, `training-job.test.cjs` |
| `night-sweep/sweep-setup.js` | 34 | defaults, profileDefaults, validate, normalized, draft, number, frequencyStatus, comparison, generator, methodNote, render, refresh, init, reportText, exportText, exportNotes, saveSnapshot | `sweep-setup.test.cjs`, `local-operator-preset.test.cjs`, `training-job.test.cjs` |
| `night-sweep/training.js` | 18 | init, open, isTraining, makeState, makeDsimState, makeOemState, makeGs7kState | `training-job.test.cjs`, `upgrade01617.test.cjs` |
| `night-sweep/workflow.js` | 20 | init, go, current, selectPoint, apply | `alpha15-ui.test.cjs`, `alpha17-render.test.cjs`, `training-job.test.cjs` |
| `pwa/pwa.js` | 11 | Global functions / data; see JSON | `pwa-client.test.cjs`, `pwa-worker.test.cjs`, `browser-files.test.cjs` |
| `pwa/service-worker.js` | 4 | Global functions / data; see JSON | `pwa-worker.test.cjs`, `pwa-client.test.cjs` |

## Remaining gaps

- **Android APK / Android browser / iPhone Safari**: No physical Android SAF save/share/print callback, real iOS Files/share-sheet, native print pagination, real touch/night/sun layout, process-kill recovery, iOS storage eviction, offline launch/install/update evidence is established by these Node/DOM suites. Next: Device matrix for APK, Android Chrome and iPhone Safari with import/export originals, named-job retention and offline update.
- **Evidence IndexedDB failure lifecycle**: Inspected tests inject put/autosave/quota/owner failures, but no dedicated openDB blocked/open error/versionchange or getFile/cleanup transaction-abort injection was located. This is a branch-testing gap, not a confirmed defect or absent public-method coverage. Next: Bounded IDB failure-injection tests and real browser recovery checks.
- **Every-function claim**: No runtime V8/Istanbul branch/function coverage report or instrumented all-public-function invocation ledger is present. Passing 819 grouped checks does not prove every named function, callback, branch or equipment combination executed. Regex inventory misses anonymous callbacks, object method shorthand and secondary comma-bound arrows and can include text matches. Next: Instrumented coverage in a separate QA task; review critical uncovered branches from that evidence.
- **Hardware commissioning and acceptance**: Actual receiver/transmitter/RPD/firmware/service plan/pilot suitability, local targets and measurement planes still require installed configuration verification. EN9000 portal commissioning text is unavailable; public briefs are capability references. Next: Exact installed manuals/operator procedure plus physical measurements; never substitute generic or analog-return examples.

- **Named-job library validation limits**: Save/open/duplicate/delete/new/import/cancellation/quota/busy/reference-cleanup workflows are tested. No dedicated corrupt-library-entry or 1,000-job ceiling injection test was located. Add bounded validation tests; this is not a confirmed failing public method.

No actual defect was identified in this bounded audit. The most important unresolved verification is physical platform behavior and actual installed hardware/reference compatibility.
