CHANGES NEEDED — exact head `d7c0775997d50ba96c9117e982f7ef4b41389b30`.

**Medium — `night-sweep/power-pm.js:85,130`: own-file restore still rejects app-saveable notebooks.** Raising the import-only span cap from 40 to 1000 moves the earlier defect. At 390 px I selected a catalog cable, entered valid zero-length/zero-current spans at 90 V / 68°F / coefficient 0, clicked the real Add this span button 1001 times, and clicked Save this visit. Storage contained all 1001 spans. The actual Export button downloaded a valid 496,965-byte notebook. After clearing only the notebook key to simulate uninstall, choosing that own file through the actual browser FileChooser produced `Supply 1: too many spans in one visit. Nothing was imported.` Storage remained empty. No internal draft mutation or invalid file fabrication was used. Align import with already saveable records; do not discard recorded spans. A UI-only future cap cannot restore notebooks already saved by existing versions.

Status of the prior findings on this new head:

- Dedupe: fixed in the targeted suite and actual 320/430 px own-file imports; storage stays at one supply.
- Imported markup execution: fixed. Actual FileChooser imports preserve `<img src=x onerror=window.p=1>` literally in the table, create no image and execute no handler at both widths.
- 41-span and >2MiB cases: new 10-check suite restores the larger notebook with identical retained content. The underlying uncapped-span compatibility issue remains above.
- Async export error/cancel: fixed in actual BrowserFiles boundary probes at 320/430 px. Explicitly simulated Blob URL denial and Web Share `AbortError` propagate to PM as `Nothing was exported`; BrowserFiles shows its own error/cancel message. These are simulated API outcomes, not an OS share-sheet test.
- Guide/practice: updated Functions guide line 560 and existing practice step `training.js:99` now teach export, checking Files/downloads and restore rehearsal, with device-only scope and current Plan → Supply PM naming.

Fresh final-head commands/results (no full gate):

| Command | Exit | Result |
| --- | --- | --- |
| `node qa/build3-power-pm-export.test.cjs` | 0 | 10 checks / 66 comparisons |
| `node qa/build3-power-pm.test.cjs` | 0 | 4 checks / 40 comparisons |
| `node qa/build3-safety-removal.test.cjs` | 0 | 5 checks; legacy jobs/backup round trip and unchanged RF results |
| `python3 /tmp/review40-new-browser.py` | 0 | 12 focused assertions at 320/430 px; two real JSON downloads saved and parsed, actual FileChooser imports, dedupe/literal text, actual BrowserFiles error/cancel propagation |
| `python3 /tmp/review40-spans.py` | 0 | reproduced the remaining 1001-span own-file refusal using real controls at 390 px |
| `git diff --check` | 0 | clean |
| `git status --porcelain` | 0 | empty |
| `git rev-parse HEAD` | 0 | SHA above |

Scratch probe disclosure: first async-boundary extension exited 1 because Playwright evaluated an assigned function as a callable; wrapping the setup in a function block corrected the scratch harness. The final probe passed unchanged app assertions. Locked dependencies were installed earlier in this same detached worktree with `npm ci --prefix qa/runtime --no-audit --no-fund` (exit 0, 40 packages). No source edits, full local gate, merge, physical phone, Android picker, Safari, emulator, field test or APK build. Hosted QA gate for this SHA is in progress: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43255454845 .

CHANGES NEEDED — `d7c0775997d50ba96c9117e982f7ef4b41389b30`.
