# Grok gate record — `afba6cb`

Own run. Not Lane A or Lane B. Not a second lane.

| Field | Value |
| --- | --- |
| Head | `afba6cb21c79a5ce85ba4a344c813367a0723fa8` (`afba6cb`, `grok/b9-closeout`) |
| When | 2026-11-12T04:38:17Z to 2026-11-12T04:50:13Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Standalone SHA-256 | `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de` |
| `git status --porcelain` after the run | empty |
| Failing suites | none |

`qa/runtime/node_modules` was already installed (`npm ci --prefix qa/runtime --no-audit --no-fund` earlier this session, 40 packages). It was not reinstalled during this run.

## Commands and exit codes

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1254/chrome-linux64/chrome NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py` | 0 |
| `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1254/chrome-linux64/chrome NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/build3-layout.test.py` | 0 |
| `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1254/chrome-linux64/chrome NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 (no lines) |
| `sha256sum outputs/Night_Sweep.html` | 0 |

`qa/run-pwa.py` also rebuilds with those two Python builders before the suites. Its report says the generated build and the worktree were unchanged during the suites.

## Counts (this run)

- Automated suites: **82 passed, 0 failed, 2,174 checks**, suite time **689.3 s**. Log line: `Total suite time 689.3 s`.
- Layout: `Build3 layout: 554 checks passed`.
- Smoke: `Chromium rendered checks: 352 passed`.

The layout log printed a `ConnectionResetError` from Python's `http.server` while a client closed a socket. The suite still printed 554 passed and exited 0. I am not calling that a failure.

No suite failed, so there is no failing-suite tail.

This record describes `afba6cb` only. A later docs commit that adds this file is a different head.
