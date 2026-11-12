CHANGES NEEDED — head `1c1e5414a40424d6999fafb105d862a7cf939345`.

Fresh targeted batch review in a separate detached worktree; no full gate or merge. The existing same-head findings remain unresolved. Independently reproduced:

- **High**, `night-sweep/power-pm.js:172` and `:294`: import accepts the synthetic battery slot `<img src=x onerror=window.p=1>`; selecting the imported supply creates an image and executes its handler (`window.p === 1`). Confirmed through actual Chromium FileChooser imports at 320 and 430 px. The request was only to localhost `/x` (404); no external data transfer. Render imported strings as literal text.
- **Medium**, `night-sweep/power-pm.js:157`: save one visit through the real controls, Export notebook, then import its actual downloaded JSON beside the original. Both widths produce two identical supplies rather than skipping the existing copy. `sameContent` compares serialized property ordering, while `cleanVisit` and `saveVisit` construct fields in different orders.

Fresh commands/results (own runs):

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 | 40 packages installed |
| `node qa/build3-power-pm-export.test.cjs` | 0 | 6 checks, 46 comparisons |
| `node qa/build3-power-pm.test.cjs` | 0 | 4 checks, 40 comparisons |
| `node qa/build3-safety-removal.test.cjs` | 0 | 5 checks, including actual old-job/project-backup round trip and unchanged RF results |
| `python3 /tmp/review40-browser.py` (scratch Playwright probe, Chromium `/usr/bin/chromium`, localhost serving exact committed standalone) | 0 | 8 assertions: four positive file-control assertions, four defect reproductions at 320/430 px |
| `git diff --check` | 0 | clean |
| `git status --porcelain` | 0 | empty |
| `git rev-parse HEAD` | 0 | exact head above |

The browser probe saved two actual `CarpeNoctum_Supply_PM_notebook.json` downloads to disk, parsed their contents, and opened two real browser FileChooser controls; the files were imported through the chooser. These positive file-control results do not resolve the dedupe or markup defects. Initial scratch attempts: file-URL navigation exited 1 due to Chromium administrator policy (switched to localhost HTTP); the next scratch run exited 1 because the wait predicate dereferenced storage before async import completed (corrected to wait on optional storage). Final probe exited 0 without weakening application assertions.

Hosted QA gate is SUCCESS on this exact SHA: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43237744999 . The other existing same-head findings (41-span restore, >2MiB own export refusal, async export outcome, guide/practice gaps) were read and remain open; this focused pass does not claim fresh reproduction of all of them. No physical phone, Safari, Android OS picker/share-sheet, emulator, field test or APK build was performed. Tools used: Git/gh, npm/Node, Playwright Chromium; verification skill supplied review guidance.

CHANGES NEEDED — `1c1e5414a40424d6999fafb105d862a7cf939345`.
