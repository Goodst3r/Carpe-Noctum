# Lane B status (Claude, Sonnet 5.5 Ultracode)

Only Lane B edits this file. Updated November 11, 2026 13:10 UTC on branch `claude/b3-paperwork`. Lane A has pushed no branch or pull request yet, so there is nothing for Lane B to review.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) draft | 320854c | **waiting for Lane A review and merge.** Rebuilt `outputs/Night_Sweep.html` and `dist/` hash identically to build3 | Nov 11 on 2a7df2c: automated 61 suites / 1,109 checks; rendered layout 141; rendered smoke 328 |
| B1 reliable test gate | claude/b1-reliable-gate | [#4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) draft | 38adfd3 | **waiting for Lane A review and merge** | Nov 11 on 85aa348: automated 62 suites / 1,115 checks, tree clean, 366 s; rendered layout 141; rendered smoke 328 |
| B2 CI | claude/b2-ci | not opened | | workflow file written and pushed (workflow pushes are allowed); the pull request opens after B1 merges because the clean-tree step depends on it | not run in Actions yet |
| B3 paperwork | claude/b3-paperwork | opening now | | AGENTS.md, START_HERE_CODEX.md, CLAUDE.md, KNOWN_GAPS.md, TOOLS_AND_SETUP.md written | docs only; no gate needed beyond `git status` |
| B4 training and guide sync | | | | next | |
| B5 item 5 DOCSIS health card | | | | not started | |
| B6 item 7 leak log and FCC card | | | | not started | |
| B7 item 9 safety card | | | | not started | |
| B8 item 8 outage card | | | | not started | |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | not started | |

## For Lane A

- **B0 (#3) is not merged yet.** After it merges, `night-sweep/build.py` lists one module per line (`MODULES = [...]`); add yours as one line of the same form. If a rebase conflicts with the old one-line list, keep the new list and re-add your line. Do not put a sample entry in a comment in that file: several `qa/` suites read it with a tuple pattern and would count it as a module (this broke my first B0 commit).
- **B1 (#4) lets your slow sandbox finish the gate:** `NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py`. It also stops the tracked-file churn, so the end of a gate run is a clean `git status`. Review order I'd suggest: B0, then B1.
- SHA-256 of `outputs/Night_Sweep.html` on build3 is `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`; all three branches above rebuild to the same hash.
- Python Playwright is not installed in a fresh cloud container: `pip install playwright`, then set `NIGHTSWEEP_CHROMIUM` (here `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`) for `qa/build3-layout.test.py`, `qa/browser-smoke.py` and the build 2 layout suite. Without it, `qa/run-pwa.py` fails 2 of its 61 suites with `ModuleNotFoundError`.
- Merge note: I merged `origin/build3` into B1 instead of rebasing because the branch was already pushed and force-pushes are off limits.

## Next
Open the B3 pull request, then B4 (training and guide sync with a test that fails on a nonexistent tab or button name), then B2's pull request once B1 has merged.

## Blocked
Nothing. Lane A and the reviewer are not responding yet, so B0 and B1 are waiting (rule 6: I may not merge my own pull requests).

## Questions for Spencer
None yet.
