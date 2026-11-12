# A1 PR23: reviewed Night Log integration receipt

November12,2026. Lane A focused integration author. Root owns independent review, broad gates, publication/status metadata and peer integration; no author self-merge.

## Frozen revisions and hashes

- Previous public PR23 metadata head: `2d837f9810d918ebd5e4aff2376316bc84051083` (product source `0da7e6a50ab26e0a774074a6943250833d60752f`). Its72/1505 +554/343 full results remain historical and are not transferred to the new source.
- Reviewed Night Log integration base: `f50a7445a8c5254b0db4db5d9e4309569345c12c`. Root attributes its72/1534 +554/346 gate and exact reviewed3c3a25f tree to Lane B; those are not this author's executions.
- Frozen clean ordinary merge: **`889ae2c3e56b2d1a9f71539931ae551817c792c1`**, parents2d837f9 +f50a744. No rebase or history rewrite.
- Branch `codex/station-input-retention`, owned worktree `/workspace/carpe-station-input`.
- Standalone `outputs/Night_Sweep.html` SHA256: **`8e46562f2afa2dc322d79e09e835c7e1e6616add072016deb75a046ba55faf04`**.
- PWA index SHA256: `c1f9ba8e7426f86a8bd0c2fb3c7eeb712da58a2edbe05afc9f01b9df24e4704a`.
- PWA content version: **`db0f8c44256e418427c5`**; app user version remains2.0 Alpha build3.
- Final remote read `git -c credential.helper='!gh auth git-credential' ls-remote origin refs/heads/build3` still returned exactf50a744. No newer base was observed.

## Resolution and exact source provenance

This commit integrates reviewed Night Log history/capture into the existing A1 native fix. It authors no additional product behavior. The guard still refuses only native badInput, preserves last-committed raw input, both work flags/dates, timestamps/autosave/exports, handles complete date clears on touched focusout, and ignores untouched imported hidden invalid text. Drafts remain tied to owner/binding/target/stage/field. Competing draft PR22 was not imported; Station/native bytes remain the already independently reviewed0da source.

`/tmp/carpe-a1-nightlog-byte-provenance.json` and its executed audit `/tmp/carpe-a1-nightlog-audit.py` establish:

- Station JS/CSS and both native QA files are exact0da bytes. JS SHA256 remains `07f1686ce274344c5b650feec50a72cfd026f1c7144205bbedeb854bb3c5d64a`.
- Workflow is exactf50a plus one substitution: `StationView.render()` becomes `StationView.render(true)`. The reviewed **NightLog.render(true)** remains exact.
- Training is exactf50a plus the exact two previously reviewed A1 Station description strings. All45 base feature tuples, Night Log/Safety/Outage steps, feature order, controls and count summaries remain intact.
- Runner is exactf50a plus the exact two prior native Station suite entries. Night Log, Checklist and registry registration remains exact.
- Each main README is exactf50a plus the unchanged A1 incomplete-input paragraph. Functions Markdown is exactf50a plus that same paragraph, retaining the corrected15-step six-active value, Night Log section and45-feature table.
-28 inherited files are base-exact, including Night Log JS/CSS, App.example keep-list, Jobs content/optional validation, Night Log suites/fixture, checklist/registry/naming tests, all Safety/Outage/shared modules, thresholds, build/shell/style, source research, training coverage and the conflicted public metadata files.

Conflicts occurred in shared workflow/training/runner/functions Markdown, generated guides/output, and three public metadata files. Source was resolved as the exact reviewed base plus the prior A1 changes. **Own status, ProjectStatus and update log were taken byte-for-byte from f50a**, as reported to root; no new status text was authored. Earlier A1 receipt/review/gate files remain inherited in history/tree. Root will write successor A1 status and resolve historical gap attribution after its full gate.

Generated HTML/PWA conflicts were rebuilt with Marked18.2 and both normal Python builders, never hand-merged. No dependency installation, lock change, storage/schema/key/package/version change, math/parser/default/threshold change, or private attachment access.

## Fresh focused automated results at889ae2c

Both sequential Node queues used `set -e` and returned exit0. Results below were executed on this exact merged source, not copied from either parent.

| Command | Own result | Raw log |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` |13 groups passed | `/tmp/carpe-a1-nightlog-native-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` |13 frozen groups passed | `/tmp/carpe-a1-nightlog-native-frozen.log` |
| `node qa/build3-night-log.test.cjs` |23 checks passed | `/tmp/carpe-a1-nightlog-log-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs` |23 frozen checks passed | `/tmp/carpe-a1-nightlog-log-frozen.log` |
| `node qa/build3-checklist.test.cjs` |37 checks passed | `/tmp/carpe-a1-nightlog-checklist-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-checklist.test.cjs` |37 frozen checks passed | `/tmp/carpe-a1-nightlog-checklist-frozen.log` |
| `node qa/build3-registry.test.cjs` |14 checks passed | `/tmp/carpe-a1-nightlog-registry-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-registry.test.cjs` |14 frozen checks passed | `/tmp/carpe-a1-nightlog-registry-frozen.log` |
| `node qa/ui-names.test.cjs` |6 checks passed | `/tmp/carpe-a1-nightlog-names.log` |

These cover the actual optional Night Log validators/content terms, App.example history retention, immutable Before/After capture/export, local-time handling, both standalone cards and source registry. Existing tests retain their stated scope; source/frozen results are automated jsdom checks, not device runs.

## Actual Chromium cross-feature capture

`python3 /tmp/carpe-a1-nightlog-cross.py` returned **exit0,69 checks** at320/390px. Log `/tmp/carpe-a1-nightlog-cross.log`; enumerated results `/tmp/carpe-a1-nightlog-cross-results.json`.

- Synthetic Station fixture has separate Before/After readings and both balance.done/sweep.done true, with dates2026-11-10/2026-11-11.
- Actual native keyboard minus and partial exponent (including saved zero) produce badInput. Adding via the real NightLog API while that draft remains active copies the last committed raw stages/results and preserves Station state; a subsequent actual UI **Add entry** agrees.
- Actual incomplete Balance and Sweep date segments preserve exact independent work facts and both checked flags. A deliberate complete Balance-date clear becomes natively valid without a final change event; actual focus departure commits blank and the following log captures it, retaining Sweep date and both done flags.
- Full portable export preserves original Station data and both immutable captured histories exactly. Returning to Station displays its recorded readings/dates.
- The same combined app preserves saved Night Log window text after an invalid partial edit and explicit Station/Night Log return, exercising both retained forced-render calls. No uncaught browser error.

The initial cross-feature harness reused a detached stage selector after an actual stage render; it left the fixture on After while the final display assertion expected Before. The earlier raw capture, immutable UI capture and export checks passed. Diagnostic reproduced stage After/reading38 with exact dates (`/tmp/carpe-a1-nightlog-cross-diagnostic.log`); the fixture now reacquires the actual stage element before returning to Before. No product source was changed. Original failure retained `/tmp/carpe-a1-nightlog-cross-stale-stage.log` and script. An initial temporary diagnostic script had a Python quoting SyntaxError; the diagnostic was corrected before obtaining the stage evidence. Neither failed harness attempt is counted as acceptance.

This is desktop Chromium using controlled focus/scroll and en-US segmented dates, not physical phone/WebView/Safari certification.

## Runtime counts, guides and frozen-byte proof

- `node /tmp/carpe-a1-nightlog-counts.cjs`: exit0. It boots the exact reviewed f50a standalone and current source independently and requires complete equality of screen/group definitions, all45 feature tuples, and every exercise count and summary. Actual **28 screens,45 features**; all seven exercises **complete22, six-active15, custom14, OEM8, DSIM9, manual7, GS7K10**. Complete/Six summaries are now correctly22/15 from the reviewed A2 base. All45 guide feature markers uniquely cover the runtime IDs. `/tmp/carpe-a1-nightlog-runtime-counts.json`, `/tmp/carpe-a1-nightlog-counts.log`.
- `python3 /tmp/carpe-a1-nightlog-audit.py`: exit0. Three rendered guides have unique IDs, no missing local fragments, and auto TOC entries exactly follow H2 order. Main30 TOC/33 fragments; Functions34/124; Training7/9. Byte provenance above is asserted, not inferred.
- `/tmp/carpe-a1-nightlog-final-proof.json`: all **605 tracked files** SHA256-compared to exact frozen HEAD blob contents after all focused runs; equal. Semantic staged contents equal HEAD and working tree clean. No test churn restoration.
- `git diff --check f50a7445...HEAD`: exit0.

## Build commands executed

```
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_README.md NightSweep_1.8_Alpha_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exit0. Existing locked QA dependencies reused through ignored symlink. Broader deterministic rebuild/gate proof belongs to root's upcoming full wrapper; this author claims normal builds plus exact committed-byte equality after focused runs.

## Untested and next

No new full qa/run-pwa, whole build3-layout, browser-smoke, emulator, physical phone/Safari/WebView/screen reader/mobile keyboard/touch/rotation/RF/field test. No Chrome DevTools MCP execution claimed by this author on889; actual browser checks used Playwright. No APK/signing/deployment, push, PR write, authored status or other branch changes.

Sources remain the authorized reviewed f50a Night Log and prior reviewed0da Station contracts, repository plan/build policies and original Station MDN evidence. No new formula or engineering threshold; no competing PR22 source.

Next: root independent exact-head review, fresh broad gate, public metadata/PR update and Lane B review/merge. **889ae2c is frozen clean.**
