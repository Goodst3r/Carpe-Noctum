# A4 reviewed Safety/Outage base integration

- Starting published A4 head: `07b3a91df01651b8bead04793973897d019a00a1` (PR14, `codex/sweep-grading`).
- Ending clean local freeze: **`47010261ea93cd7ee78a0436ed1a480d8769840a`**.
- Incoming reviewed build3: `3cfb9c2021eabe52644cffbe1515224b9d027cb2`; this is the merge of Outage PR12, with tree identical to reviewed77b9c2ba.
- Ordinary merge parents: `07b3a91df01651b8bead04793973897d019a00a1` and `3cfb9c2021eabe52644cffbe1515224b9d027cb2`. No rebase or history rewriting.
- Worktree: `/workspace/carpe-sweep`. Nothing pushed; no PR/status/receipt metadata edits.

## Integration and provenance

Imported the reviewed Safety/Outage engine, modules, provenance and registered QA unchanged. Combined shared build tokens, shell initialization, Job navigation/panels, registry groups and practice registrations. All44 incoming feature tuples and ordering are retained exactly; attached grading appends as45. Existing grading profile resolver/store grouping remains present. No formula, parser/API, storage/schema/key, company default, version or package identity changes.

`evidence.js`, `evidence-ui.js`, `evidence-archive.js`, `sweep-grading.js`, `sweep-grading-ui.js`, `station.js` (including `StationView.boundRecords`), `app.js` (including optional grading keep-list), `jobs.js` and parser/core suites are byte-identical to starting A4. Shared `checklist.js`, `safety.js`, `outage.js`, combined checklist suite, native checklist suite and whole layout suite are byte-identical to incoming reviewed base. Exact hashes are in `/tmp/carpe-a4-outage-audit.json`. A4 provenance files and all synthetic fixtures remain unchanged. No private original was opened.

Guide merge retained the unchanged full grading section plus Safety and Outage sections. Main README mirrors now both show custom15; Functions and Coverage reflect measured27screens/45features. Complete and six-active remain22/14; custom15, OEM8, DSIM9, manual7, GS7K10. The Functions guide has45 unique feature markers,34 H2 sections including contents,33 complete TOC entries and41 unique IDs, with all fragment links resolving. Both source and frozen runtime facts independently agree. All20 worker asset hashes match. Runner registration derives74 suites by AST; **no74-suite full gate has run here**.

Generated conflicts were resolved by selecting a temporary side, rendering authored Markdown with existing Marked18.2 and running both Python builders. No generated HTML/worker was hand-merged. `NightSweep_Project_Status.md`, update log and Lane B status received only ordinary incoming merge additions; no authored reporting edits. Parent owns current reporting reconciliation.

## Actual commands and own results

All checks below ran from this worktree using the existing ignored shared locked QA dependency link. No installation, removal or upgrade. Commands inherited `GIT_OPTIONAL_LOCKS=0` in the focused runner.

Preparation and source checks (all exit0 except expected merge-conflict stop):

```sh
git merge --no-ff --no-commit 3cfb9c2021eabe52644cffbe1515224b9d027cb2
node --check night-sweep/training.js
node --check night-sweep/thresholds.js
node --check night-sweep/workflow.js
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
node /tmp/carpe-a4-outage-audit.cjs
```

| Exact focused command | Own result | Seconds | Log |
| --- | --- | ---: | --- |
| `node qa/build3-native-evidence.test.cjs` | 69 passed; exit0 | 0.266 | `/tmp/carpe-a4-outage-native-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-native-evidence.test.cjs` | 69 passed; exit0 | 0.198 | `/tmp/carpe-a4-outage-native-frozen.log` |
| `node qa/build3-sweep-grading-core.test.cjs` | 93 tests passed; exit0 | 0.111 | `/tmp/carpe-a4-outage-core-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-grading-core.test.cjs` | 93 tests passed; exit0 | 0.098 | `/tmp/carpe-a4-outage-core-frozen.log` |
| `node qa/sweep-grading-ui.test.cjs` | 52 checks passed; exit0 | 58.061 | `/tmp/carpe-a4-outage-ui-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` | 52 checks passed; exit0 | 68.777 | `/tmp/carpe-a4-outage-ui-frozen.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs` | 22 checks passed; exit0 | 39.758 | `/tmp/carpe-a4-outage-station-frozen.log` |
| `node qa/build3-registry.test.cjs` | 13 checks passed; exit0 | 4.801 | `/tmp/carpe-a4-outage-registry-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-registry.test.cjs` | 13 checks passed; exit0 | 5.045 | `/tmp/carpe-a4-outage-registry-frozen.log` |
| `node qa/ui-names.test.cjs` | 6 checks passed; exit0 | 21.602 | `/tmp/carpe-a4-outage-names.log` |
| `node qa/training-library.test.cjs` | 11 tests passed; exit0 | 88.657 | `/tmp/carpe-a4-outage-training.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py` | 47 rendered checks passed; exit0 | 9.569 | `/tmp/carpe-a4-outage-rendered-grading.log` |

Source/frozen UI52 each includes the real warm500 saved-worksheet startup regression, unchanged raw bound-context projection, both original/context digest-await invalidation guards, actual Station edits, optional-section persistence/remapping, integrity rejection and legacy/UBT behavior. Existing source registry/checklist groups remain visible. These are this integration's actual new runs; older9cad broad counts are historical and are not relabeled.

The real browser suite uses desktop Chromium at320/360/390/430px with mobile/touch contexts, not an emulator or physical phone. It exercises actual incomplete numeric input, valid2.5dB PTV grading, stale-result marking, raw native gzip preview/grade and exact portable original bytes, visible44px controls, widths, criterion labels and screenshots; no runtime errors. Screenshots are captured by the existing suite; no manual pixel review is claimed. No actual Chrome DevTools MCP run by this worker; parent's earlier MCP/private-original results retain their original attribution.

### Integration corrections and preserved RED evidence

The first source UI run failed its retained old scope assertion `27 !== 25` after two checks. `/tmp/carpe-a4-outage-ui-integration-red.log` is retained. Updated only existing exact combined scope/guide count assertions to27screens/45features/custom15/grading45; no test was removed or weakened. Both final52-check modes pass. The first independent guide audit found that choosing incoming base prose had omitted Station from the explicit TOC. Restored that existing A4 entry; the final complete33-entry audit passes. The audit log path now contains the final run; the initial failure is recorded here and in tool history. These were integration/expectation corrections, not changed parser/math behavior.

## Freeze and hashes

After focused checks, all611 tracked file bytes matched the fixed-source manifest; semantic staged entries matched. `git diff --cached --check`, `git diff --check`, `git diff --exit-code` exited0. Committed ordinary merge with `git commit -m 'Merge reviewed Safety and Outage base into sweep grading'`. Final HEAD/parents, clean status and every tracked byte/staged entry were checked again without restoration. Current proof: `/tmp/carpe-a4-outage-integration-proof.json`; fixed manifests and full per-command results are under the same `/tmp/carpe-a4-outage-` namespace.

- Standalone SHA256: `c7f6bebff9924c8d485fd3cf6939ab5dc530f43e2600b3737c32f42cf76dc921`.
- PWA index SHA256: `ec74c77ad663692a7bc6f32998fe3f77a881f67614962bc04297a12832b1c9b2`.
- Content version: `389381594407679b9bfb`.
- Worker SHA256: `f4d219b083e98a5b8812b0aeae01d97eac08ed5477e2862ccc4d4868b2259e47`.

Exact remote read before freeze:

```sh
git -c credential.helper='!gh auth git-credential' ls-remote origin refs/heads/build3 refs/heads/codex/sweep-grading
```

Returned build3`3cfb9c2021eabe52644cffbe1515224b9d027cb2` and published A4`07b3a91df01651b8bead04793973897d019a00a1`. GitHub connector metadata read confirmed draft PR14's published head. No global credential changes or token output.

## Changed files and why

- Incoming Safety/Outage module files, source references and tests: exact reviewed base additions.
- `build.py`, `shell.html`, `workflow.js`, `style.css`, `thresholds.js`, `training.js`, runner: keep both feature sets and initialization/navigation/registry/QA wiring.
- Main README mirrors, Functions/Coverage Markdown and renderer output: measured actual combined scope/counts, complete TOC and feature IDs.
- `qa/sweep-grading-ui.test.cjs`: existing scope expectations track actual combined runtime; all other assertions remain.
- Standalone/PWA/docs/release metadata/hashed worker: normal rebuild outputs.
- Project/update log/Lane B status: incoming merge additions only; no authored status/reporting work.

```text
M	CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt
M	NightSweep_Project_Status.md
M	dist/functions-guide.html
M	dist/guide.html
M	dist/index.html
M	dist/release.json
R094	dist/sw.33e25c3f3603233f1a58.js	dist/sw.389381594407679b9bfb.js
M	dist/training-coverage.html
M	docs/NightSweep_1.8_Alpha_Functions_README.html
M	docs/NightSweep_1.8_Alpha_Functions_README.md
M	docs/NightSweep_1.8_Alpha_README.html
M	docs/NightSweep_1.8_Alpha_README.md
M	docs/NightSweep_1.8_Training_Coverage.html
M	docs/NightSweep_1.8_Training_Coverage.md
M	handoff_docs/lanes/claude-status.md
M	night-sweep/README.md
M	night-sweep/build.py
A	night-sweep/checklist.js
A	night-sweep/outage.js
A	night-sweep/safety.js
M	night-sweep/shell.html
M	night-sweep/style.css
M	night-sweep/thresholds.js
M	night-sweep/training.js
M	night-sweep/workflow.js
M	outputs/Night_Sweep.html
A	qa/build3-checklist-real.test.py
A	qa/build3-checklist.test.cjs
M	qa/build3-layout.test.py
M	qa/run-pwa.py
M	qa/sweep-grading-ui.test.cjs
A	research/build3/OUTAGE_SOURCES.md
A	research/build3/SAFETY_SOURCES.md
```

## Sources, limits and next

Sources are the authorized plan/build list, exact reviewed build3 sources and existing `VIAVI_NATIVE_FORMATS.md` / `SWEEP_GRADING_CORE_NOTES.md` provenance; these source bytes and grading math did not change. No fresh external engineering calculation or vendor-schema claim is needed or made for a source-preserving integration. Existing parser/transient-memory/ZIP/history/UI limitations and existing A1/performance notes remain open in Known Gaps. The unmerged A1 native-input fix was not imported; A2/A3 were not imported.

No full runner, separate whole layout/smoke, fresh private owner-original proof, independent peer approval, push/PR/GitHub mutation, Android build/signing, dependency installation, emulator, physical phone, native provider save, Safari/WebView, RF/meter/reference-plane, supervisor or field validation. Existing Safety/Outage supervisor-before-coworker-release conditions remain.

Next: parent independently reviews this exact source delta, runs a fresh complete gate on the final current-base head, updates parent-owned receipts/status/PR14 and publishes for Lane B's final-head review/gate/merge. Author must not self-merge.

Tools actually used: GitHub read metadata; local Git, Python, Node, JSDOM and Playwright/Chromium; Superpowers execution/TDD/verification guidance. No child agents or private files.
