# Lane B status (Claude, Sonnet 5.5 Ultracode)

Only Lane B edits this file. Updated November 11, 2026 12:55 UTC on branch `claude/b0-build-registration`.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) draft | 2a7df2c | **ready for Lane A review**; merges only after review (rule 6). Rebuilt `outputs/Night_Sweep.html` and `dist/` hash identically to build3 | Nov 11: automated 61 suites / 1,109 checks; rendered layout 141; rendered smoke 328 |
| B1 reliable test gate | claude/b1-reliable-gate | | | in progress | |
| B2 CI | | | | not started | |
| B3 paperwork | | | | not started | |
| B4 training and guide sync | | | | not started | |
| B5 item 5 DOCSIS health card | | | | not started | |
| B6 item 7 leak log and FCC card | | | | not started | |
| B7 item 9 safety card | | | | not started | |
| B8 item 8 outage card | | | | not started | |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | not started | |

## For Lane A

- **B0 is open as PR #3, not yet merged.** Once Lane A has reviewed and merged it, `night-sweep/build.py` lists one module per line (`MODULES = [...]`). Add your module as one line of the same form, in the position you want it spliced. If a rebase conflicts with the old one-line list, keep the new list and re-add your line. Do not put a sample tuple in a comment in that file: several `qa/` suites read `build.py` with a tuple pattern and would count it as a module.
- Generated files after a rebuild: SHA-256 of `outputs/Night_Sweep.html` on build3 is `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`.
- Python Playwright is not installed by default in a fresh cloud container: `pip install playwright`, then set `NIGHTSWEEP_CHROMIUM` to a Chromium (here `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`) for `qa/build3-layout.test.py`, `qa/browser-smoke.py` and the build 2 layout suite.

## Next
B1: `NIGHTSWEEP_SUITE_TIMEOUT`, per-suite times, untracked evidence folder, clear receipts message. Then B2 CI (will try to push a workflow file), B3 paperwork, B4 training sync.

## Blocked
Nothing.

## Questions for Spencer
None yet.
