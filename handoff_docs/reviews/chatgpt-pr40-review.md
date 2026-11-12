# PR40 independent stored-data review

**CHANGES NEEDED — `1c1e5414a40424d6999fafb105d862a7cf939345`.** The same-head full reviewer gate passes, but the additional real import/export regressions below fail. A green gate does not close those defects. No approval or merge was performed.

Pinned read-only worktree: `/workspace/Carpe-Noctum-pr40`; base `f9a2060ee51899c073f121408be79d15cb05ca35`. This is Claude's external A4b contribution, not ChatGPT's implementation. All reproduction data is synthetic. Existing math, keys, package, screen IDs and job format are unchanged.

## Findings on this head

| Severity | Location in power-pm.js | Reproduction and required correction |
| --- | --- | --- |
| High | 123,172,294–299 | Import a valid battery slot literal `<img src=x onerror=window.p=1>`, then select that supply. The visit table creates a live image and the harmless handler sets `window.p=1`. Confirmed with real file-chooser imports at all four widths. The request was blocked offline; no external transfer occurred. Correct text encoding/rendering and prove imported labels remain literal text without losing their raw values. The defective helper predates this PR; the new import exposes file text to it. |
| Medium | 157–162 | Save a nonempty notebook locally, export and immediately import the same file. One supply becomes two because comparison depends on JSON object property order. Compare content independently of insertion order, while retaining meaningful record order and same-name/different-content behavior. |
| Medium | 128–131,324–333,370 | The existing actual UI saves41 spans; its20,976-byte exported file cannot be restored to an empty notebook because the new importer caps40. Account for already-saved app-generated records without truncation. The positive40-span control passes. |
| Medium | 154–155,390–401 | A count-valid synthetic2-supply×80-visit×40-span notebook exports3,237,465bytes and is refused by its own2MiB importer after clearing the device notebook. Align the whole-notebook export/restore contract before relying on uninstall migration. |
| Medium | 392–395 | Actual BrowserFiles Blob-URL-denial and simulated WebShare AbortError paths report failure/cancel, while PM still immediately says Exported before uninstall. Honor asynchronous outcomes and distinguish offering/requesting a file from verifying an external backup. These two boundary cases simulate browser API outcomes; no physical OS share sheet was tested. |

Functions still describes Save/Delete only; the existing Supply PM practice step has no export/restore rehearsal. Update those existing sections and describe/register the new structural software guards. Source-only observations about incoming-file duplicates and byte-vs-code-unit checks remain qualified in the adjacent source report; they are not extra reproduced findings here.

Review comments: readiness6826913514; initial defects6827129697; imported-markup execution6827214321; completed size/status/guide review6827400168. Severity here retains the root's Medium classification for the restore defects; the coauthor report uses High because of the uninstall scenario. Both describe the same evidence.

## Own full reviewer gate

Exact beginning/ending SHA is1c1e541 above. Run **2026-11-12T14:50:30.394783Z–15:11:10.468375Z**. `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium`, `NIGHTSWEEP_SUITE_TIMEOUT=3600` were set for the runner and rendered commands.

| Command | Own exit/result |
| --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0;100suites/2648checks,1185.8s |
| `python3 qa/build3-layout.test.py` | 0;1252checks |
| `python3 qa/browser-smoke.py` | 0;370checks |
| `git diff --check` | 0 |
| `git status --porcelain` | 0;empty |

Head, built artifacts and worktree remained unchanged. Standalone SHA256 `99103c87c8693aaf9b386d543d5acc8c22f4265fc7a509bde20b50972f03a9c4`. Hosted QA run43237744999 is independently reported green on the same head. The author's body instead records the tree that became6ce4840, skips npmci and lacks an empty ending status for current1c1e541; the author needs a complete locked gate receipt on the corrected final head. This own reviewer gate cannot substitute for it.

The root also personally reran the real-handler own-file diagnostic: command exit0 captures one supply becoming two, with no runtime error. It is a diagnostic capture, not a passing desired-behavior assertion.

## Independent coauthor executions

These are separate from the root's full gate and are not added to its counts:

- Frozen-app real-handler storage probe: **exit1,30 meaningful checks passed/2failed**, no runtime errors.23 malformed variants, read/quota atomicity and legacy-ID/reload behavior passed; own-file dedupe and41-span restore failed.
- Real-handler boundary probe: **exit1,4passed/4failed**, no runtime errors. Exact2MiB acceptance, +1-byte atomic refusal, positive40-span restore and capacity controls passed; large own-file restore and three controlled ready/cancel/error success-message assertions failed.
- Offline desktop Chromium at320/360/390/430dark: **exit1,99passed/10failed**, four actual961-byte JSON Blob downloads and real FileChooser imports, no application runtime errors. Four failures each reproduce dedupe and imported-markup execution; two cover simulated BrowserFiles error/cancel feedback. Normal restore/reload/canonical merge, malformed/byte-boundary atomicity, source-sheet metadata and44px controls passed.
- Seven source identity assertions passed: original PM math/constants/date/self-check prefix, jobs, engine, calculators, training and locked QA dependencies are unchanged.

The original reports, tested scripts, final JSON/logs, actual root gate receipt and last60 lines of each gate log are preserved in [chatgpt-pr40-checks](chatgpt-pr40-checks/README.md). Manifest hashes identify exact raw evidence. Preserve the reported scratch-harness failures separately: initial browser wait signature, stale success-message wait oracle, an incomplete draft no-op check, boundary callback-counter setup, and startup legacy-row normalization. None was an app fix or a relaxed regression assertion.

No emulator, physical Android/iPhone, Safari/WebView, screen reader, actual OS picker/share destination, uninstall, meter, field, APK or signing result is claimed. Desktop browser viewports and controlled API faults remain separately identified. Re-review corrected source/affected probes and required exact-head gates before approval.
