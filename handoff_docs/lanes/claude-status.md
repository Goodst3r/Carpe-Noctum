# Lane B status (Claude, Sonnet 5.5 Ultracode)

Only Lane B edits this file. Updated November 11, 2026 14:10 UTC on branch `claude/b5-docsis-health`. This file is rewritten whole in each Lane B pull request, so if merging two of them conflicts here, take the version from the pull request with the higher number. Lane A has pushed no branch or pull request yet, so there is nothing for Lane B to review.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) draft | 320854c | **waiting for Lane A review and merge.** Rebuilt `outputs/Night_Sweep.html` and `dist/` hash identically to build3 | Nov 11 on 2a7df2c: automated 61 suites / 1,109 checks; rendered layout 141; rendered smoke 328 |
| B1 reliable test gate | claude/b1-reliable-gate | [#4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) draft | 38adfd3 | **waiting for Lane A review and merge** | Nov 11 on 85aa348: automated 62 suites / 1,115 checks, tree clean, 366 s; rendered layout 141; rendered smoke 328 |
| B2 CI | claude/b2-ci | not opened | | workflow file written and pushed (workflow pushes are allowed); the pull request opens after B1 merges because the clean-tree step depends on it | not run in Actions yet |
| B3 paperwork | claude/b3-paperwork | [#5](https://github.com/Goodst3r/Carpe-Noctum/pull/5) draft | 5544651 | **waiting for Lane A review and merge** | docs only; the paths named in the files checked against the tree |
| B4 training and guide sync | claude/b4-training-sync | [#6](https://github.com/Goodst3r/Carpe-Noctum/pull/6) draft | 5a775ba | **waiting for Lane A review and merge**; new suite `qa/ui-names.test.cjs`; also fixes four old names in app messages | Nov 11 on 9e403dc: automated 62 suites / 1,115 checks; rendered layout 141; rendered smoke 328 |
| B5 item 5 DOCSIS health card | claude/b5-docsis-health (stacked on B4) | opening now | see PR | built, independently reviewed (3 lenses plus skeptics; all confirmed defects fixed) | Nov 11: automated 63 suites / 1,132 checks; rendered layout 241; rendered smoke 331 |
| B6 item 7 leakage tools | claude/b6-leakage (stacked on B5) | | | built locally in a worktree, tests passing; review and PR next | |
| B7 item 9 safety card | | | | not started | |
| B8 item 8 outage card | | | | not started | |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | not started | |

## For Lane A

- **Review order I'd suggest: #3 (B0), #4 (B1), #5 (B3), #6 (B4), then B5.** B5 is stacked on B4 (it adds a training step and guide text that the B4 test checks), and B6 on B5, so merge in that order; B2 (CI) waits for #4. Each pull request shows the earlier ones' commits until they merge.
- **B0 (#3) is not merged yet.** After it merges, `night-sweep/build.py` lists one module per line (`MODULES = [...]`); add yours as one line of the same form. If a rebase conflicts with the old one-line list, keep the new list and re-add your line. Do not put a sample entry in a comment in that file: several `qa/` suites read it with a tuple pattern and would count it as a module (this broke my first B0 commit).
- **B1 (#4) lets your slow sandbox finish the gate:** `NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py`. It also stops the tracked-file churn, so the end of a gate run is a clean `git status`.
- **B4 renames screens and buttons in text.** Use the 2.0 names when you write training steps and guide text: tabs are Home, Route (Setup, Cable route, Amp gain, Amp / node setup, Catalog), Test (Meter setup, TDR, Predicted levels, Frequency, Readings, References, Calculators, Limits), Power (Load, What-if), Job (Details, ONX files, Checklists, Acceptance, Run sheet); the Files menu has Back up project, Open project, Export RF levels, Print report, Help & methods; job saving is "Save now" under Job → Details. The new suite `qa/ui-names.test.cjs` fails on a path like `Route → Equipment setup` or a button name that does not exist. When you add a new screen or button, the suite reads the built app, so nothing needs registering.
- SHA-256 of `outputs/Night_Sweep.html` on build3 is `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`; B0, B1 and B3 rebuild to the same hash. B4 changes four app strings and the training text, so its hash is `d803a56a09d68db1b1c02a93079cc0bd69ecae674718e2ae9a586bf81ecb957c` at 9e403dc.
- Python Playwright is not installed in a fresh cloud container: `pip install playwright`, then set `NIGHTSWEEP_CHROMIUM` (here `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`) for `qa/build3-layout.test.py`, `qa/browser-smoke.py` and the build 2 layout suite. Without it, `qa/run-pwa.py` fails 2 of its 61 suites with `ModuleNotFoundError`.
- Guide HTML is rendered with `marked` 18.2.0 (not installed in the repo's `qa/runtime`): `npm install marked` in a scratch folder and set `CODEX_PRIMARY_RUNTIME_NODE_MODULES` to its `node_modules`. That version reproduces the committed HTML byte for byte for four of the five guides; the installation guide differs only in one `&amp;` in a link, which I kept as committed.
- Merge note: I merged `origin/build3` into B1 instead of rebasing because the branch was already pushed and force-pushes are off limits.

## Next
Open the B5 pull request, then finish and review B6 (item 7), then B7 (safety card) and B8 (outage card), and B2's pull request once B1 has merged. After #5 merges, add to `KNOWN_GAPS.md`: the Functions and installation PDFs under `docs/` still carry the old screen names (PDF generation is a separate step).

## Blocked
Nothing blocks the work. Lane A has pushed no branch yet, so B0, B1 and B3 are waiting for a review (rule 6: I may not merge my own pull requests). Firecrawl is out of credits until about 23:09 UTC on Nov 11; research continues with Exa and web search, and anything only Firecrawl could verify is marked "not re-verified".

## Questions for Spencer
None yet.
