# A4 second-review corrections

November11,2026. **Locally corrected and focused-verified; independent re-review/full gate remain pending.**

- Starting integrated A4 source: `47010261ea93cd7ee78a0436ed1a480d8769840a`.
- Ending clean local commit: **`fe245887d30da3b8fa3e01fa721e31a47a3bba9c`**, an ordinary one-parent successor.
- Reviewed build3 base remains `3cfb9c2021eabe52644cffbe1515224b9d027cb2` (Safety/Outage).
- Branch/worktree: `codex/sweep-grading`, `/workspace/carpe-sweep`. No push or GitHub mutation.
- Input review: `/tmp/carpe-a4-laneb-second-review.md`, read in full. Its named570baf SHA is A3, not A4; the actual A4 source paths and behaviors were reproduced against4701026. Its old screen/count statements are not used as current facts.

## Corrected behaviors

1. Valid criterion edits honor `saveLocal()===false`. A named **Not saved** warning appears in the field's associated live paragraph and status; numeric validity remains false only for an actually invalid number, not a storage failure. The new numeric criterion remains in memory and the previous stored job remains unchanged. Warnings are ephemeral and keyed by profile/field, survive normal panel refreshes, cannot leak into another profile and clear after an actual successful whole-job save. No new stored key/field. Back up project is the recovery action.
2. The actual Grade button's preflight refusal preserves invalid controls, text/native badInput, named errors and flags. Repeated clicks cannot grade against the older valid criterion. Correcting or intentionally clearing the field works; a normal panel refresh still restores the last valid in-session criterion and resets invalid text/flags together. Other error paths retain their existing re-render behavior. The invalid rule says “Previous valid criterion retained,” avoiding a false saved claim.
3. Expanded rendered QA pins actual linked/visible/DOM-adjacent named errors, double border plus outline, emphasized error text and all eight separate≥44px source tags. No arbitrary60px cutoff: the error must be next to its field in the same parent, below it and wholly visible after explicitly centering the field wrapper. Three actual scratch CSS-deletion mutants each fail the intended dedicated assertion. This does not certify automatic scrolling or physical ergonomics.
4. Read-only result metrics, check values/targets/limits, saved criteria and measured-span numbers use deterministic up-to12-significant-digit presentation. Signed zero displays0. Computed differences inside the existing4×EPS machine-roundoff scale display **≈0**, explicitly qualified in the card and guides. Exact user-entered tiny targets/limits remain meaningful nonzero scientific notation, and editable controls retain the exact saved number text. Stored criteria/results/decisions are never rounded. No formula or acceptance tolerance changes.

The entire validation/canonical-context/context-digest/grade pipeline is byte-identical to4701026. Parser/archive/core, original verification, context SHA/away-and-back await guards, optional records, boundRecords startup API, Station/app/jobs and all stored formats stay unchanged. Proof `/tmp/carpe-a4-second-review-preserved-pipeline.json` stores exact unchanged segment hashes. This is display/error feedback code, not new RF math.

## Reproduction before production changes

`node /tmp/carpe-a4-second-review-probe.cjs` at4701026 ran three independent fresh-app cases and exited1: missing adjacent failed-storage warning; actual Grade click replaced the invalid input node/draft; and binary tilt tails remained visible. Actual raw result was0.20000000000000107 and tilt error1.0547118733938987e-15 with pass. These are expected RED diagnoses, not passing acceptance counts. Log `/tmp/carpe-a4-second-review-red.log`.

Permanent new assertions were added before production changes. `node qa/sweep-grading-ui.test.cjs` failed the new adjacent-unsaved state assertion at4701026; `/tmp/carpe-a4-second-review-permanent-red.log`. Expanded `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py` against the old frozen470 app also failed: the original catch replaced the refusal, so the expected refusal status never arrived (standard30s timeout); `/tmp/carpe-a4-second-review-rendered-red.log`. No raised limit or swallowed failure.

After the initial patch the three independent probes passed (`...-green-probe.log`), and an interim source UI55 run passed. A final small catch adjustment retained normal re-render behavior for non-invalid errors; the permanent click regression was strengthened with an actual eligible original so a silent second click really could grade on the bad baseline, and a signed-zero preservation assertion was added. The final source/frozen55 runs below include those final changes. Interim results are not added to the final counts.

## Own final automated checks

Existing ignored locked dependency installation was reused; no install/update/removal. The focused wrapper `/tmp/carpe-a4-second-review-focused-run.py` executed the commands below with `GIT_OPTIONAL_LOCKS=0`, saving all exits/timings in `/tmp/carpe-a4-second-review-final-results.json`.

| Exact command | Own result | Seconds | Log |
| --- | --- | ---: | --- |
| `node qa/sweep-grading-ui.test.cjs` | 55 checks, PASS /exit0 | 45.505 | `/tmp/carpe-a4-second-review-final-ui-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` | 55 checks, PASS /exit0 | 41.579 | `/tmp/carpe-a4-second-review-final-ui-frozen.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-native-evidence.test.cjs` | 69 synthetic parser checks, PASS /exit0 | 0.114 | `/tmp/carpe-a4-second-review-final-native.log` |
| `node qa/build3-sweep-grading-core.test.cjs` | 93 core tests, PASS /exit0 | 0.075 | `/tmp/carpe-a4-second-review-final-core.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs` | 22 checks, PASS /exit0 | 27.403 | `/tmp/carpe-a4-second-review-final-station.log` |
| `node qa/ui-names.test.cjs` | 6 checks, PASS /exit0 | 16.953 | `/tmp/carpe-a4-second-review-final-names.log` |

The three new UI groups cover actual failing `Storage.prototype.setItem` for the existing working-job key, memory/stored isolation, adjacent named ARIA feedback, profile switching, refresh and successful global retry; two actual invalid Grade clicks with a real attached original and unchanged complete job; correction/intentional blank/refresh; and real float-case grading/export with exact raw results, unchanged history, signed-zero raw preservation, tiny entered targets/limits and exact editable text. The retained52 groups still cover source hash/original integrity, async context guards, native gzip, large/orphaned jobs, legacy/UBT, named jobs/portable identity remapping and warm500 startup.

`node /tmp/carpe-a4-second-review-audit.cjs` also passed both source and frozen runtime:27screens/45features; all44 reviewed base feature tuples retained, grading45; steps22/14/15/8/9/7/10;45 unique guide markers,33 complete TOC entries,34 H2 sections/41 unique IDs; README byte identity and20 worker asset hashes. `/tmp/carpe-a4-second-review-audit.json`. No practice feature/count changed in this correction.

### Exact numbers before/after

Before patching, two independent Node golden raw-result/decision vectors were recorded in `/tmp/carpe-a4-second-review-before-results.json`. Final core byte SHA and every vector value/status remain identical; `/tmp/carpe-a4-second-review-exact-results-proof.json`. Direct independent subtraction10.3−10.1 and subtracting0.2 match the stored binary values above; their ideal decimal difference is0.2 and the ideal tilt error0, explaining display cleanup without rewriting the record. Another vector retains a true1e-12 trace difference. The actual UI test compares the complete stored/exported result with the unchanged Node core, checks exact raw numbers and pass, and separately checks1e-15 user criteria plus negative-zero object values survive read-only rendering. No new RF calculation, source interpretation or comparison allowance is introduced.

## Own rendered Chromium checks

`NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py`: **81 checks passed**, exit0, at320/360/390/430px with mobile/touch contexts; `/tmp/carpe-a4-second-review-rendered-green.log`. This run uses the final product code/frozen app above. It includes the existing47 checks with the one previous incomplete-click check replaced by two repeat-click checks, plus explicit visible linked adjacent error/non-colour/44px tag assertions; real setItem failure and successful retry; and390px formatted float display with exact raw result/pass. No console/runtime errors. The script captures screenshots; no manual pixel review is claimed.

This is desktop Playwright/Chromium, not physical-phone, emulator, Safari/WebView or actual quota exhaustion. Storage failure is a controlled thrown setItem error, distinct from the earlier independent checklist actual-quota test. The parent's actual Chrome DevTools MCP RED findings were technical input; no fresh MCP execution or parent count is claimed by this worker. Independent post-fix MCP remains the reviewer's work.

CSS mutant command: a local Python harness created three scratch-only copies under `/tmp/carpe-a4-second-review-css-mutants/`, removed exactly one relevant CSS rule each, and executed the actual expanded rendered suite. Each exited1 at its intended320px assertion:

- Removed invalid double-border rule → non-colour border/outline assertion.
- Removed `.grading-field-error` style → emphasized text assertion.
- Removed grading44px source-tag rule → all-eight target-size assertion.

Receipts `/tmp/carpe-a4-second-review-css-mutants.json` and `...-css-mutant-{border,error-text,tags}.log`. These are intentional failing mutants, not product failures or additional passing check counts. The real tracked styles were never removed or edited.

## Rebuild, commit and retention proof

Actual commands, all exit0:

```sh
node --check night-sweep/sweep-grading-ui.js
python3 -m py_compile qa/sweep-grading-layout.test.py
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
python3 night-sweep/build.py
python3 build-pwa.py
git diff --cached --check
git diff --exit-code
git commit -m 'Keep grading refusal drafts and expose criterion save failures'
```

Both Python builders were repeated after final checks and reproduced the same bytes. All611 tracked hashes and semantic staged entries matched the fixed-source manifest through final checks and rebuild. Final HEAD/parent/tree, every tracked byte and clean status were checked after committing without restoration. Proof `/tmp/carpe-a4-second-review-final-proof.json`; manifest `/tmp/carpe-a4-second-review-precommit-manifest.json`.

- Standalone SHA256: `0b62d34b2ae7a24fa2127c2eb102c4949aca570f85d23866fe8f40cec691b9ab`.
- PWA index SHA256: `538c0545475efbec41a6b51e5320d9e64cd0c9463ba5e86a0741fd6fc50b8e60`.
- PWA content version: `3da00816890b0298d787`.
- Worker SHA256: `b91ccefa911933a570e3b460789e237eb7dda0dd114dfd63f0ebc841619571a8`.

## Files changed and why

- `night-sweep/sweep-grading-ui.js`: transient save warnings/retry, invalid Grade-click retention, display-only number formatting.
- Existing UI and rendered grading suites: three regression groups and actual visual/storage/refusal/formatting assertions. No suite or assertion removed/weakened.
- Main README mirrors and Functions Markdown/rendered HTML: how refusal, in-session failed saves, refresh and display formatting behave.
- `handoff_docs/KNOWN_GAPS.md`: correct actual A4 scope and keep the recommended focus/internal-ID/long-context-message work explicit. The old project status/update-log count prose was **not** edited or claimed fixed; parent publication owns it.
- Standalone/PWA/guides/release/worker: normal rebuilds, never hand-merged.

```text
M	dist/functions-guide.html
M	dist/guide.html
M	dist/index.html
M	dist/release.json
R095	dist/sw.389381594407679b9bfb.js	dist/sw.3da00816890b0298d787.js
M	docs/NightSweep_1.8_Alpha_Functions_README.html
M	docs/NightSweep_1.8_Alpha_Functions_README.md
M	docs/NightSweep_1.8_Alpha_README.html
M	docs/NightSweep_1.8_Alpha_README.md
M	handoff_docs/KNOWN_GAPS.md
M	night-sweep/README.md
M	night-sweep/sweep-grading-ui.js
M	outputs/Night_Sweep.html
M	qa/sweep-grading-layout.test.py
M	qa/sweep-grading-ui.test.cjs
```

## Remaining scope / next

The four required corrections have local regression coverage; independent final-head approval and complete gate remain pending. Recommended select/successful-Grade focus preservation, internal reason/profile IDs and generic long-node/asset context errors remain explicit Known Gaps. Existing parser/memory/ZIP/history/performance gaps remain unchanged. Project/update-log count reconciliation is pending parent publication. The separate A1 native-input fix and A2/A3 integrations were not imported.

Sources: the actual reviewed code, full second-review text, plan/BUILD_LIST, existing `VIAVI_NATIVE_FORMATS.md` and `SWEEP_GRADING_CORE_NOTES.md`; all source provenance and engineering formulas remain unchanged. Superpowers receiving-review, TDD and verification guidance informed execution. Tools actually used: local Git/Node/Python/JSDOM and Playwright/Chromium; existing Marked18.2 documentation renderer; GitHub read metadata in the preceding integration. No new external source or library/API dependency was needed.

No full runner/whole layout/smoke, private owner-original rerun, dependency installation, children, push/PR/GitHub writes, emulator, physical phone, native provider save, Safari/WebView, RF/meter/reference-plane, supervisor/field checks, APK/signing or deployment. No new formula/target/limit/key/version/package/schema change.

Parent next: independent exact-fe245887 re-review, fresh full gate on the final reviewed/current-base source, publication of receipts/status/PR14 and Lane B same-head review/merge. Author must not self-merge.
