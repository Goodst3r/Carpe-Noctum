# PR38 focused rereview of b34b1db

This exact-head focused receipt is preserved on the reviewer evidence branch. Portable replay commands and the copied pass receipts are in [the check bundle](chatgpt-pr38-b34-checks/README.md). Absolute workspace paths below record the commands originally executed. The broader backup/storage harness remains scratch-only; no source HTML, embedded evidence payloads or large diagnostic captures are copied into this bundle.

**The five earlier focused findings are closed on `b34b1db60571e758947ca5b592e14aeaf7f38d73`. No new source finding identified in `8a6d99b..b34b1db`.** This is a focused rereview, not a full-gate receipt or final approval. Root's independent exact-head full gate is running separately; root owns PR actions and merge.

## Pin and limits

- Worktree `/workspace/Carpe-Noctum-pr38`, pinned before/after at `b34b1db60571e758947ca5b592e14aeaf7f38d73`, clean tracked status throughout the completed probes.
- Read-only source/artifact/test review. No checkout, build, install, package change, tracked/ignored worktree output, network request, PR action or upstream action from this reviewer. Fresh receipts are named `pr38-b34-*` in scratch. Author's keyboard suite creates/removes its temporary serving directory outside the worktree.
- Earlier `4ccd22a` failures/reports remain historical and were not overwritten or reclassified as green. The original independent scripts for12 entry checks and the four-width Tools reproduction were rerun unchanged with new receipts. Old broad navigation/layout results remain specific to their old head.
- No emulator, physical phone, native keyboard, APK or field testing claimed.

## Closure checklist

| Earlier finding | Current exact-head evidence | Disposition |
| --- | --- | --- |
| Search hides the current tab and leaves no keyboard entry | `workflow.js:69–73` gives a visible result a tab stop; `:229–237` supports search-field Enter/Up/Down focus without selecting a screen. Unchanged independent12-case Tab→Enter probe passed in Plan/Field/Tools at320/360/390/430 dark. Original four-width Tools repro now reaches Fiber, which has tabindex0. Author46-case Chromium suite independently rerun and passed. | Closed |
| Main guide still lists Home/Route/Test/Power/Job | Main Markdown and its identical README copy, rendered docs HTML and dist guide now list Home/Plan/Field/Tools/Closeout. | Closed |
| Functions PDF still gives old paths | Actual regenerated PDF text has no retired Route/Test/Power/Job screen paths and contains current Home/Plan/Field/Tools/Closeout paths; see document subreceipt. | Closed |
| Installation PDF still gives old paths/Save named job | Actual regenerated PDF now contains Plan→Details, Field→ONX files and Save now; no retired paths found. | Closed |
| UI-name table guard bypasses invalid single multiword screens/missing inventory | Actual current `screenLists()` is extracted and tested against an independent expected map. Ten desired-behavior assertions pass, including Nonexistent screen, Meter setup under Tools, missing inventory, valid multiword names, semicolon members and the unrelated Field/What to enter form header. Arbitrary multiword bypass removed; inventory context identified by its header. Existing UI-name suite7 checks also passed. | Closed |

Document evidence is archived in [the documentation rereview](chatgpt-pr38-b34-checks/docs-rereview.md); no new PDF format or guide was requested. Only the two existing Functions/Installation PDF pairs are relevant.

The document subreview passed27 independent assertions and12 final byte comparisons to HEAD. Both `pdftotext -layout` commands exited0, with zero retired-path/old-tab-sequence/Save named job/removed-Safety-feature matches. Functions PDF contains current group arrows Home4/Plan16/Field19/Tools23/Closeout3; Installation Home3/Plan2/Field3. All three docs/dist HTML mirrors exactly match the documented href-only/noindex transformation. Generic safety prose and explicitly historical edition references were distinguished from current UI instructions.

## Source and regression preservation

- Latest app-code delta is the small navigation entry/focus helper and keyboard handler. The group/screen definitions and visible-panel mapping are unchanged. No screen ID, group order, logical Supply PM placement or header Help destination was changed by the fix.
- Fifteen fresh source checks passed: group/screen definitions, panel/point mapping, and byte identity for app.js, jobs.js, field-calcs.js, docsis-health.js, thresholds.js, engine.js, shell.html, style.css, both locked QA package files, and all three B2 suites. B2 physical-context/formula behavior and rows therefore remain intact.
- No feature, formula, storage key, job field, package identity/version, Safety restoration, exact resume or deferred per-channel feature was introduced. The latest diff includes the expected source fix, additional regressions/runner entry, current guide/PDF/generated-output updates and status/checksum records.
- Existing NAV CJS checks are retained with one added focus-entry case. Existing name checks are retained with added synthetic strict-validation cases; the old arbitrary skips are replaced by the explicit inventory-table distinction. The added author Chromium test exercises real Tab and Enter at all four dark widths.

## Fresh data preservation

`pr38-b34-data-diagnostics.py` imported both committed1.7/1.8 complete backups through the real `openProjectText`, exported/reimported/exported original evidence, and captured base8c/current results. It completed with exit0. This is fresh b34 execution, not reuse of the old4ccd captures.

`pr38-b34-final-storage.py` then passed all three assertions groups:

1. 1.7 backup: identical RF at54/261/860/993MHz, power results, job content and original base64 bytes across base/current and real export roundtrip after normalizing only the existing linked evidence-ID remapping.
2. 1.8 backup: the same exact comparison and original-byte retention.
3. Current b34 Chromium: seed the retired `nightsweep-safety-v1` key before startup, instrument Storage after initialization, visit all35 destinations. Exact state/key-value bytes unchanged, zero setItem/removeItem calls, retired key retained.

No tolerance was widened. Existing evidence-ID remapping and deliberate compact export/rebuilt preview behavior are handled exactly as in the corrected historical harness. This focused runtime proof complements source identity; it does not claim a new broad four-width layout review.

## Commands and own counts

All listed completed checks exited0. The exact logs/JSON are in scratch; none overwrites an old failure receipt.

| Command | Own result |
| --- | --- |
| `python3 /workspace/scratch/pr38-filter-entry-check.py /workspace/Carpe-Noctum-pr38 --receipt /workspace/scratch/pr38-b34-filter-entry.json` |12 real-keyboard checks passed;0 failed;0 runtime errors; before/after exactb34 and clean status. Log `pr38-b34-filter-entry.log`. |
| `python3 /workspace/scratch/pr38-keyboard-repro.py /workspace/Carpe-Noctum-pr38` | Original four-width Tools reproduction passes; Fiber tabindex0 and reachable by Tab/Down. Log `pr38-b34-original-tools-repro.log`. |
| `node /workspace/scratch/pr38-b34-screenlists-desired-probe.cjs /workspace/Carpe-Noctum-pr38` |10 desired-behavior assertions passed against actual extracted function. JSON/log `pr38-b34-screenlists-desired.*`. |
| `node qa/ui-names.test.cjs` |7 checks passed. Log `pr38-b34-ui-names.log`. |
| `node qa/build3-nav1.test.cjs` |5 checks passed. Log `pr38-b34-nav1.log`. |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-nav1-keyboard.test.py` |46 Chromium checks passed. Log `pr38-b34-author-keyboard.log`. |
| Python/Git latest-source preservation probe |15 source/mapping checks passed. Receipt `pr38-b34-preservation.json`. |
| `python3 /workspace/scratch/pr38-b34-data-diagnostics.py` | exit0, fresh two-backup base/current import/export captures. JSON/log `pr38-b34-data-diagnostics.*`. |
| `python3 /workspace/scratch/pr38-b34-final-storage.py` |3 groups passed;0 failures; exactb34/clean. JSON/log `pr38-b34-final-storage.*`. |
| Document subreview: `python3 /workspace/scratch/pr38-b34-docs-check.py` |27 assertions passed; both actual PDF extractions exit0; separate12/12 assigned-file comparisons match HEAD. Commands/extractions/hashes in `pr38-b34-docs-rereview.md`. |

SHA256 of the unchanged independent entry script: `8a7155512336ceb09c3a6237a55c97dbaeb080173e44ab7f0dbc3559b267f29e`. Original Tools repro: `c4aff579926165880cde799a5becbe7b040cd420313d455eea3c90661f3f49ed`.

Two initial read commands used the ambiguous shorthand `8a` and exited128; they were rerun using resolved `8a6d99b`. A later attempted read of the still-pending document subreport exited2. The document subreview's initial scratch mirror expectation also exited1 after replacing a visible filename label; correcting the expectation to the real href-only transformation made the complete27-assertion rerun pass. These are command/path or diagnostic-expectation errors, not app/test failures. No failed new application assertion was observed.

**Review boundary:** hosted success and author full-gate counts were supplied by root and are not claimed as this reviewer's execution. Root's own full gate and final approval/merge decision remain separate.

## Evidence-branch archival check

The archived CLI variants were replayed read-only against the same pinned app after replacing workspace-specific root/output paths: name validation10/10 and document27/27 passed, both exit0. The copied `pr38-b34-archived-*` logs/JSON preserve that portability check separately from the original executions. No app build or gate was repeated. The broader data/backup harness remains scratch-only, with only its compact final receipt archived.
