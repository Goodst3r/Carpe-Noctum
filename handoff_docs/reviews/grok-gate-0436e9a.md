# Grok gate record — `0436e9a`

Own run. Not Lane A or Lane B. Not a second lane. Merge of `origin/build3` (`9df4857`) into `claude/b17-highsplit`. Pull request #16 merged this head.

| Field | Value |
| --- | --- |
| Head | `0436e9a1a94df2fcc78c1713b34f3a1cda5e7eed` (`0436e9a`, `claude/b17-highsplit`) |
| Parents | `c639ea8` and `9df4857` |
| When | 2026-11-12T06:33:41Z to 2026-11-12T06:46:35Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Log | `/tmp/grok-gate-0436e9a.log` |
| Standalone SHA-256 | `0bd53b6a4411cf4677066d49b529ca505a33b95e54b215224df19002a03ee725` |
| `git status --porcelain` after the run | only `?? qa/runtime/node_modules` (local install symlink, not created by the suites, not committed) |
| Failing suites | none |

## Commands and exit codes

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 (the command); one untracked line, above |
| `sha256sum outputs/Night_Sweep.html` | 0 |

## Counts (this run)

- Automated suites: **87 passed, 0 failed, 2,276 checks**, suite time **745.4 s**. `all_passed` true. Generated build unchanged during tests. Worktree snapshot unchanged during tests.
- Layout: `Build3 layout: 784 checks passed`.
- Smoke: `Chromium rendered checks: 361 passed`. The smoke log printed a `ConnectionResetError` from `http.server` after a client closed a socket. The suite still exited 0.

Hosted CI on this exact head: [run 43168983876](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43168983876), success. AUDIT on pull request #16 at this SHA. Merged as `b4cb832d2bdcf18a81d855f1a7acae6699ac8015` at 2026-11-12T06:47:18Z.

This file was committed on the next stretch branch, after that merge, so the merged head did not move.

No failing suite, so there is no failing-suite tail.
