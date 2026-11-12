# A1 PR23 final core-base integration with reviewed grading

November12,2026. Lane A focused author receipt. Root owns independent exact-head review, the next serialized full gate, public metadata/PR and Lane B peer integration. No self-merge.

## Frozen identity and base

- Previous A1 source: `807e710ee9ba475e06c5653b926df0c19097738d`.
- Actual reviewed build3 merged ordinarily: **`0e67660c530047d292b7838d892b1ae74862affb`**. Root verified its complete tree equals A4 publicationd95f08b184b9cc3cc33150e58736ecc03d9d42b8 and read Lane B final review5867946559 / own80/2072 +554/352 in702s. Those are Lane B's results, not this author's execution.
- Frozen merge commit: **`2d95e04e908eba822c2789787e0fa9ec9285f269`**, parents807 +actual0e676.
- HEAD tree: `a2aa261349a84481c2060e959d3f16129258dc97`.
- Owned worktree `/workspace/carpe-station-input`, branch `codex/station-input-retention`.
- Standalone SHA256: **`b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`**.
- PWA index SHA256: `06f6e62bc062ae4744708faede1e8eb4881b504baac94ee5ab20bf4f1b31fddb`.
- PWA content version: **`dc6d93410e547078005a`**; app identity remains2.0 Alpha build3.
- Final actual remote `git -c credential.helper='!gh auth git-credential' ls-remote origin refs/heads/build3` still returned exact0e676. No later base advance observed.

**No author broad gate at2d95.** Root will run it after reading this receipt while the independent delta review proceeds. Earlier public PR23 remains2d837f9/source0da with historical72/1505 +554/343.807/889 focused receipts retain their own source attribution.

## Source resolution and exact provenance

Plan and both current lane status blobs were reread before the merge. Own status was read from current d95 grading publication; current Lane B status came from fetched2cd06fdc. Both contain historical queue text; actual root/Git peer merge0e676 takes precedence. No stretch source was imported.

The only product-source conflict requiring a real union was `night-sweep/station.js`. Its result is **exact807 native code plus the exact incoming pure boundRecords helper and export**. The helper reads actual bound raw records with ownership/read-only/legacy status and JSON clones; it does not normalize values or evaluate StationMath/RF while autosave boots. `records()` still supplies computed snapshots for Night Log. This preserves the cold-start boundary and all native draft/last-commit/owner/target/binding/stage/touched-field protections together.

Executed `/tmp/carpe-a1-grading-audit.py`, proof `/tmp/carpe-a1-grading-byte-provenance.json`, asserts:

- Removing only the exact incoming boundRecords block/export from current Station reproduces807 JS byte-for-byte. Station CSS and both native suites remain807-exact. StationMath, numerical/date parsers, targets/defaults/ranges and original persist format are unchanged.
- Every other JS/CSS module in night-sweep is exact incoming0e676, except the previously scoped workflow/training edits. This includes grading core/UI/archive/native parsing, SHA/identity/remapping, render-local context optimization, Night Log/Due, App/Jobs optional validators/content terms, all original keepers and shared cards/registry.
- Workflow equals incoming base plus StationView.render()→StationView.render(true). Incoming NightLog.render(true), SweepDue.render(), routes/groups/descriptions and all nine Job tabs remain.
- Training equals incoming base plus the two unchanged A1 Station explanation strings. All47 base feature tuples and seven exercise arrays/summaries retain exact values/order; A1 adds no feature/step.
- Runner equals incoming base plus the two native Station suite registrations. The actual AST lists **82 unique suites**, retaining all80 base suites once/in order. This is registration evidence, not a full-pass count.
- The two main README Markdown files and Functions Markdown are incoming-exact plus the one prior A1 incomplete-input paragraph. All current incoming practice/count corrections remain; Training Coverage is base-exact.
- Public own status, ProjectStatus and update log are incoming0e676-exact. No successor metadata prose was authored. Normal guide/standalone/PWA regeneration resolved generated conflicts; no hand-merge of generated HTML/worker.

All three optional contracts are present: NightLog, SweepDue and SweepGrading validators/content tests. App.example retains **both savedNightLog and savedGrading declarations/spreads** and every earlier keeper. The reviewed Due interval-drop behavior is retained, with no invented keeper. Immutable captured results/dates/grades never refresh automatically. No limit/default/formula/key/schema/version/package/dependency or privacy-scope change.

## Fresh focused executions at2d95

Three Node queues used `set -e`, GIT_OPTIONAL_LOCKS=0 and unset RELEASE/BUILD2_SOURCE/WRITE_EVIDENCE flags before mode-specific calls; all returned exit0. Native, grading UI, Night Log, Due and interop suites use bootApp, whose assembled/frozen selector is NIGHTSWEEP_RELEASE_TEST. Registry uses its distinct NIGHTSWEEP_BUILD2_SOURCE_TEST selector.

| Exact command / mode | Own result | Raw log |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` / assembled |13 groups | `/tmp/carpe-a1-grading-native-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` / frozen |13 groups | `/tmp/carpe-a1-grading-native-frozen.log` |
| `node qa/sweep-grading-ui.test.cjs` / assembled |56 checks | `/tmp/carpe-a1-grading-ui-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` / frozen |56 checks | `/tmp/carpe-a1-grading-ui-frozen.log` |
| `node qa/build3-night-log.test.cjs` / assembled |23 checks | `/tmp/carpe-a1-grading-night-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs` / frozen |23 checks | `/tmp/carpe-a1-grading-night-frozen.log` |
| `node qa/build3-sweep-due.test.cjs` / assembled |37 checks | `/tmp/carpe-a1-grading-due-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` / frozen |37 checks | `/tmp/carpe-a1-grading-due-frozen.log` |
| `node qa/build3-night-log-grading.test.cjs` / assembled |3 groups | `/tmp/carpe-a1-grading-pair-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log-grading.test.cjs` / frozen |3 groups | `/tmp/carpe-a1-grading-pair-frozen.log` |
| `node qa/build3-sweep-due-grading.test.cjs` / assembled |3 groups | `/tmp/carpe-a1-grading-triple-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due-grading.test.cjs` / frozen |3 groups | `/tmp/carpe-a1-grading-triple-frozen.log` |
| `node qa/build3-sweep-grading-core.test.cjs` / module core |93 tests,0 fail | `/tmp/carpe-a1-grading-core.log` |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` / assembled |14 checks | `/tmp/carpe-a1-grading-registry-source.log` |
| `node qa/build3-registry.test.cjs` / built HTML, source selector unset |14 checks | `/tmp/carpe-a1-grading-registry-frozen.log` |
| `node qa/ui-names.test.cjs` |6 checks | `/tmp/carpe-a1-grading-names.log` |

The three-feature tests verify cold/warm startup without early RF calls, all optional sections, named duplicate/portable remapping, original bytes, malformed-import atomicity, immutable histories and actual Example retention/drop behavior. Those checks ran fresh on2d95 rather than copying the base counts.

Earlier889 Checklist/registry default/explicit-release runs remain built-HTML invocations with the published erratum; their later separately authorized889 source37/14 and correct807 runs retain their own attribution. See `/tmp/carpe-a1-nightlog-publication-draft/mode-attribution-erratum.md`. No historical report was silently rewritten.

## Actual combined browser evidence

`python3 /tmp/carpe-a1-grading-cross-v2.py` returned **exit0,35 checks** at320/390px, using actual Chromium, trusted native keyboard editing and synthetic original file contents. Raw `/tmp/carpe-a1-grading-cross-v2.log`; enumerated `/tmp/carpe-a1-grading-cross-v2-results.json`.

- Imported a synthetic CSV through real EvidenceUI/SHA/storage, entered synthetic42/forward frequencies54/860 and peak-to-valley3dB criterion. The actual grade has2.5dB peak-to-valley/pass for that criterion and unknown overall, with other criteria unknown; no acceptance default was supplied.
- A trusted lone-minus edit remains native badInput and leaves complete Station state unchanged. Pure boundRecords and grading freshness context remain identical to their committed state. NightLog.addEntry while the draft is active copies36.4, not empty DOM text; the grading history stays exact.
- Navigation through Evidence/NightLog/Due/Station restores the recorded native value and preserves older captures/grade. Deliberate complete numeric clear changes a later capture only; older captured raw values and grade remain immutable.
- Actual partial Sweep date retains2026-11-11, its known2027-11-11 due date under a synthetic12-month interval, both work flags and separate Balance date. A capture while date is invalid retains both dates. Clearing every segment becomes natively valid; actual focus departure records unknown. Due becomes unknown without altering prior dated log or frozen grading. A later capture has blank Sweep, exact Balance and both done flags.
- Portable export retains all three optional sections and the exact original CSV base64. An explicitly asserted actual partial-date badInput precondition precedes owner replacement; the new owner gets no old work/grade, and return restores exact old optional sections.
- Untouched imported +19 and invalid calendar text2026-02-30 remain exact in complete state and bound raw context after actual focus departure and all four feature transitions. Empty native displays do not normalize stored raw text. No overflow at either viewport and no browser error.

The original `/tmp/carpe-a1-grading-cross.py` and `.log` are preserved: its first Page.evaluate failed with JavaScript SyntaxError because a normal Python triple literal expanded CSV newline escapes into literal newlines in a JS quoted string. It failed before grading/capture assertions. V2 uses a raw Python JS literal in a fresh namespace and adds the explicit owner-switch badInput precondition. No product source change was made for that harness failure. It is not counted as acceptance. No corrected-head Chrome DevTools MCP claim by this author; the independent reviewer owns that separate campaign.

## Runtime, guides and strict final proof

`node /tmp/carpe-a1-grading-counts.cjs` exited0 after booting both exact0e676 standalone and current source. Full screen/group definitions, all47 feature tuples, every count/summary and nine Job tabs are incoming-identical. Actual **29 screens,47 features;22/16/15/8/9/7/10**. All47 Functions markers uniquely cover runtime IDs. Evidence `/tmp/carpe-a1-grading-runtime-counts.json`, raw `/tmp/carpe-a1-grading-counts.log`.

The source/guide audit exited0. Main31 TOC entries/34 local fragments; Functions36/132; Training8/10. All heading IDs unique; every local fragment resolves and TOCs follow H2 order. Main README mirrors remain exact. No older native-only guide count was imposed on the merged source.

`/tmp/carpe-a1-grading-final-proof.json` records **all703 tracked files** SHA256-equal to exact frozen HEAD blobs, matching HEAD/tree, semantic staged contents equal HEAD, clean status and final PWA identity after all focused/browser runs. `git diff --check 0e67660c...HEAD` exited0. No restore/test-churn cleanup was needed.82 suite identities are static and the full-gate flag is explicitly false.

## Normal build commands actually run

```
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_README.md NightSweep_1.8_Alpha_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exit0. Existing Marked18.2 scratch runtime and locked ignored QA dependencies reused. No installs, locks or broad gate. Root's next full wrapper owns repeat-build/content/freshness/dependency proofs for the final publication source.

## Limits and next

No author qa/run-pwa, whole build3-layout, browser-smoke, phone/emulator, Safari/WebView, screen reader, native provider/mobile keyboard/touch/rotation, RF/field acceptance, private owner replay, APK/signing/deployment, push/PR/status/API writes. Physical/performance claims are not inferred from desktop tests. Original0da recovery72/1505 +554/343 remains historical; its earlier environment loss after50 diagnostic PASS lines has no completed total/outcome and is not combined with recovery.

Actual A2/A3/A4 peer merges now satisfy the core D2 feature scope, while this important native fix still needs exact-source full validation and peer integration. D3 final combined verification, D4 reconciliation and D5 handoff remain open. Root may now run the serialized full gate at frozen2d95 while independent scoped review runs read-only, then publish exact metadata-only successor and obtain Lane B same-head gate/review/merge. No author self-merge. Source has not changed since freeze.
