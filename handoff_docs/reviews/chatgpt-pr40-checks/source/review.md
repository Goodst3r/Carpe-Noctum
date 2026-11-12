# PR40 independent source and storage review

**CHANGES NEEDED on `1c1e5414a40424d6999fafb105d862a7cf939345`.** Review was read-only against `/workspace/Carpe-Noctum-pr40`; root ran the full gate separately. Beginning/final pin is unchanged and tracked status is empty. No build, install, checkout, index/source write, network, PR action, commit or physical-device test was performed. All probe files and reports are under this scratch directory.

Read WORKFLOW and AGENTS through `git show origin/build3:<path>`; local `origin/build3` is `f9a2060ee51899c073f121408be79d15cb05ca35`. Scope is Supply PM notebook export/import and identity/storage behavior, with existing notebook math preserved. This report does not supersede root's separately reproduced injection finding or certify the whole app.

## Reproduced findings

1. **Medium — importing a freshly saved notebook's own file duplicates the supply.** `night-sweep/power-pm.js:157` compares visits with order-sensitive `JSON.stringify` after removing IDs. `saveVisit():370` writes fields in the order date/chemistry/inputVolts/outputVolts/loadAmps/inverter/alarms/batteries/spans; `cleanVisit():115–117` writes date/chemistry/inverter/alarms/inputVolts/outputVolts/loadAmps/batteries/spans. Actual Save this visit → Export notebook → Import notebook, leaving the local record in place, changes one supply into two identical-value supplies and says “Imported 1 supply.” The author test misses this: its saved-local roundtrip removes the key before importing, while repeated-import coverage starts from already-canonical imported data. Evidence: `quick-dedupe.json`; asserting final `storage-probes.json` → own-file-dedupe. At40 supplies this also makes a redundant import look like a capacity overflow.

2. **High — an actual UI-saved41-span visit exports but cannot be restored.** `addSpan():324–333` and `saveVisit():370` permit41 spans; new import validation at`:128–131` refuses anything over40. Using real controls,41 zero-loss spans were added and saved. Export notebook produced a20,976-byte app file. Removing the device notebook and importing that file produces “Supply1: too many spans in one visit. Nothing was imported.” The key remains absent. A40-span actual UI export restores correctly. The export/import feature must account for histories the existing app can already save; otherwise the pre-uninstall backup path can strand those histories. Evidence: `storage-probes.json` → own41span-roundtrip; positive40-span control in `boundary-probes.json`.

3. **High — an export within all record-count limits can exceed the import file limit.** `exportText():154–155` / `exportNotebook():390–395` offer the entire notebook without ensuring it can pass the new2MiB import limit at`:401`. A synthetic notebook was expanded from an actual UI-saved40-span visit to2 supplies ×80 visits ×40 spans, using only existing saved fields and distinct legacy-format IDs. It stored successfully in the test browser's localStorage; the actual Export notebook handler offered a3,237,465-byte file. After clearing the notebook, the actual Import handler refused that file as larger than2MiB and restored nothing. No supply/visit/span/text count bound was exceeded. Evidence: `boundary-probes.json` → count-valid-large-export. The restore contract must align the exporter and importer for legitimately saved content before the uninstall workflow relies on it.

4. **Medium — the new export status ignores failed/cancelled/not-yet-saved outcomes.** `exportNotebook():392–395` ignores the Promise/status returned by `download()` or `BrowserFiles.prepare()` and immediately says “Exported1 supply ... before you uninstall.” The shared browser file contract at `browser-files.js:42–65` can resolve `ready`, `cancelled` or `error`; even a successful download request does not confirm an external file exists. Exercising the actual Export notebook click handler with each controlled, documented file-API outcome still displays that Exported message. These were controlled API outcomes, not OS/phone save results. Evidence: `boundary-probes.json` → async-export-status. Preparing/offering a file must remain distinct from a confirmed backup, and failures/cancellation must not be described as an export completed before uninstall.

## Additional source observations

- `mergeImport():162` compares each incoming supply only with the original existing array, so identical copies within one incoming file can all be appended. This is source-only; the two main dedupe fixtures above use the actual exported shape and do not depend on this separate case.
- New span guards at`:95/99/101/129` introduce24 fields,40-character field names,400-character values and40 spans. The new file-limit registry row does not describe all those structural caps. The41-span restore failure is a concrete compatibility issue, beyond the source-label observation.
- Functions guide lines551–557 and training.js:99 still teach Save/Delete only, with no export/import recovery rehearsal. The on-screen reminder is useful, but current guide/practice steps are an explicit workflow review item. Existing statements that Supply PM is outside project backups remain correct.
- New IDs use timestamp/sequence/random at`:197`. Actual legacy IDs created by the f9 UI were retained byte-for-byte across current initialization; a new supply after reload got distinct IDs while the old supply remained exact; another initialization retained all bytes. These checks demonstrate the tested normal path, not a mathematical uniqueness guarantee under repeated randomness/clock state.

## Passing storage and boundary evidence

`storage-probes.cjs` uses the exact frozen app in JSDOM and real UI event handlers. Valid seed notebooks are created by actual Save/Export controls; malformed imports are mutations of that real export, rather than an invented schema. All persistence is isolated test-browser storage.

- **23 malformed-file cases** refuse atomically with all local key/value bytes unchanged: malformed JSON, kind/version/list errors, a bad last supply after a valid prefix, name/date/enums/alarms/numeric errors, battery errors, nested/prototype/oversized span structures and supply/visit/count caps.
- Read-file failure and actual byte-size precheck preserve all local bytes. Storage-read failure refuses without changing old bytes. A forced quota failure at the notebook write retains the exact old notebook and job storage.
- Legacy f9 UI-generated IDs/data survive current initialization; new-save/reload checks preserve the legacy record and generate distinct new IDs in the tested path.
- Positive40-span actual export/import retains all recorded values. Separate inclusive count/text boundaries (name80, alarms160, batteries8/slot40, visits80, supplies40) pass the real parser.
- Exact2MiB actual UI import succeeds; one byte over is rejected with the old bytes unchanged. An additional supply at an already40-supply device cap is rejected atomically.
- No runtime errors were recorded by either final probe suite.

## Math and scope

Fresh independent source identity checks exited0 with **7 assertions**: the original PowerPM constants/math/date/self-check prefix before the new import/export additions is byte-identical to f9; jobs.js, engine.js, field-calcs.js, training.js and both locked QA package files are also byte-identical. Receipt: `source-identity.json`. No formula, plant distinction, package/version, job field, screen ID, storage key or Safety implementation changed. KEY and SIDE remain `nightsweep-power-pm-v1` / its existing unreadable side key.

No independent new arithmetic derivation or math gate is claimed because this PR changes no existing math. Root's full gate and the author's results are separate from these checks.

## Commands, actual exits and counts

| Command | Observed result |
| --- | --- |
| `node /workspace/scratch/pr40-independent-source/quick-dedupe.cjs` | exit0 diagnostic capture showing one actual saved supply becomes two; no runtime errors. This command captures behavior rather than asserting the desired behavior. |
| `node /workspace/scratch/pr40-independent-source/storage-probes.cjs` | final exit1: **30 meaningful checks passed,2 desired-behavior assertions failed**,0 runtime errors; exact pin/clean status. Failures are own-file dedupe and own41-span restore. |
| `node /workspace/scratch/pr40-independent-source/boundary-probes.cjs` | final exit1: **4 checks passed,4 assertions failed**,0 runtime errors; exact pin/clean status. Failures are the count-valid large export restore and three erroneous export-status cases. |
| Python/Git source identity probe | exit0,7 source assertions passed. |
| Local Gitshow/diff/status and source reads | exit0; no network or mutation. |

Failed receipts are retained. `storage-probes-attempt1.*` recorded31 passes/2 real failures; one pass was an incomplete draft40-span check with no assertion. It was removed before the final30-pass/2-failure run and is not counted as evidence. `boundary-probes-attempt1.*` recorded4 passes/4 failures; its direct-parser boundary fixture initialized the ID callback counter after its first call. That harness setup was corrected before the final complete rerun; final counts/findings remain4/4. Neither draft issue altered app source or relaxed an assertion.

The initial parent update misstated the41-span file's size as8,264 bytes; the immediate correction and saved receipt identify the actual20,976 bytes. Large-export size is separately3,237,465 bytes.

**Limit:** JSDOM real-function/UI storage probes and source inspection only. No rendered Chromium, emulator, physical phone, native file dialog, APK/uninstall or actual field test was run by this reviewer. Root owns final review comments, approval/merge decisions and the full exact-head gate.
