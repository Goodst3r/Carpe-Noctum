# Grok gate record — `93acbac`

Own run. Not Lane A or Lane B. Not a second lane. Re-pin of `origin/build3` after pull request #28 merged. Docs-only parent of study head `f2641a2`. This file is a later commit on `claude/leak-detector-arcom`. It is not itself the gated head.

| Field | Value |
| --- | --- |
| Head | `93acbace3c0109f33b79ed8c80e9fbbb765c16d4` (`93acbac`, `build3`, merge of #28) |
| When | 2026-11-12T07:35:55Z to 2026-11-12T07:49:22Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Log | `/tmp/grok-gate-93acbac.log` |
| Results JSON | `/tmp/carpe-pin/qa/pwa-test-results.json` |
| Standalone SHA-256 | `9a9da29fba23308d9bd9cd724c6e14fc0d91bc09ce6da2671009bff192099081` |
| `git status --porcelain` after the run | empty (the log prints a blank status block) |
| Failing suites | none |

`npm ci` is not a line in that log. The log starts at `build.py`. The node suites in the same run exited 0, so `qa/runtime` was already installed in `/tmp/carpe-pin`.

## Commands and exit codes (from the log)

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `sha256sum outputs/Night_Sweep.html` | 0 |

## Counts (this run)

- Automated suites: **89 passed, 0 failed, 2,289 checks**, suite time **776.7 s**. `all_passed` true. `build_unchanged_during_tests` true. `worktree_unchanged_during_tests` true.
- Layout: `Build3 layout: 944 checks passed`.
- Smoke: `Chromium rendered checks: 367 passed`. The log also prints a `ConnectionResetError` from the smoke HTTP server while writing a response. The script still exited 0. Not a suite failure.

Hosted CI was still in progress when #28 was merged. This re-pin is the local gate of that merge commit. No failing suite, so there is no failing-suite tail.

## Recount on this commit (not a second gate)

- Bottom tabs from `night-sweep/workflow.js`: Home has no sub-tabs. Route 6, Test 15 (no Study), Power 2, Job 9. That is 32 sub-tabs. Counting the Home screen and Help (Help is not a bottom-tab sub-tab) gives 34 screens. Study is not on this commit.
- `training.js` `features`: **52** tuples. No `study` row.
- `Thresholds.rows` from executing `night-sweep/thresholds.js` in Node with `EvidenceArchive` undefined: **139** (company 64, unknown 20, spec 44, expert 11). `NightSweep_Project_Status.md` on this era claims three extra `EvidenceArchive.limits` guards (142). Those three are added only when `EvidenceArchive` is already loaded. Not re-counted in a full app boot.
