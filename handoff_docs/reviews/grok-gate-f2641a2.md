# Gate record · f2641a2

Exact head: `f2641a2c21d2614fa809a6b6ccd4d8109f13210d` (`claude/b19-study`, pull request #20). Two own runs, both green. Not a second lane. Neither run is deleted.

## Run A (this session)

Local run 2026-11-12T07:45:14Z–07:59:09Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Log `/tmp/grok-gate-f2641a2.log`. Recorded on the next branch so that head did not move.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 |

- Suites **90**, checks **2297**, total suite time **802.7 s**. `all_passed` true. Generated build unchanged during the tests. Worktree snapshot unchanged during the tests.
- Layout: **1004** checks passed.
- Smoke: **370** Chromium rendered checks passed. The log printed a `ConnectionResetError` from `http.server` after a client closed a socket. The suite still exited 0.
- Standalone SHA-256 `d4b05c39f4f68f7c2d0245d686bccb666b2831caf6f80a576e155c9ca551a9d6`
- `git status --porcelain` afterwards: only `?? qa/runtime/node_modules`. Not committed.

Hosted CI on this exact SHA: [QA gate run 43176666435](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43176666435), success. Pull request #20 merged 2026-11-12T08:00:06Z as `7107f27481c6479e5ee2de087f008060bdbbd03d`.

No failing suite.

## Run B (recorded on the leak-detector branch)

Own run. Not Lane A or Lane B. Study-mode head that contains `build3` `93acbac`. The original file was a later commit on `claude/leak-detector-arcom`. It is not itself the gated head.

| Field | Value |
| --- | --- |
| When | 2026-11-12T07:49:57Z to 2026-11-12T08:03:38Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Log | `/tmp/grok-gate-f2641a2.log` |
| Results JSON | `/tmp/carpe-study/qa/pwa-test-results.json` |
| Standalone SHA-256 | `d4b05c39f4f68f7c2d0245d686bccb666b2831caf6f80a576e155c9ca551a9d6` |
| `git status --porcelain` after the run | empty (that log prints a blank status block) |
| Failing suites | none |
| AUDIT | Review comment on #20 at this SHA, labelled not a second lane, no open Important finding |

`npm ci` is not a line in that log. The log starts at `build.py`. The node suites in the same run exited 0, so `qa/runtime` was already installed in `/tmp/carpe-study`.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| build-match (second build compared with the first) | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `sha256sum outputs/Night_Sweep.html` | 0 |

- Automated suites: **90 passed, 0 failed, 2,297 checks**, suite time **789.2 s**. `all_passed` true. `build_unchanged_during_tests` true. `worktree_unchanged_during_tests` true.
- Layout: `Build3 layout: 1004 checks passed`.
- Smoke: `Chromium rendered checks: 370 passed`.

Recount written with that record, not a second gate:

- Bottom tabs from `night-sweep/workflow.js`: Home has no sub-tabs. Route 6, Test 16 (Study is the last Test tab), Power 2, Job 9. That is 33 sub-tabs. Counting the Home screen and Help gives 35 screens.
- `training.js` `features`: **53** tuples. The extra row versus `93acbac` is `study`.
- `Thresholds.rows` from executing `night-sweep/thresholds.js` in Node with `EvidenceArchive` undefined: **139** (company 64, unknown 20, spec 44, expert 11). The three `EvidenceArchive.limits` guards are not in that count. Not re-counted in a full app boot.
