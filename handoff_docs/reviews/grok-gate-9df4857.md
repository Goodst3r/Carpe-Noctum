# Grok gate record — `9df4857`

Own run on `origin/build3`. Not Lane A or Lane B. Not a second lane.

| Field | Value |
| --- | --- |
| Head | `9df485720d0e13192364be4cf8e3255b36b4bbbf` (merge of #15) |
| Tree | `784dc505c9cbdf697854afa3a3b42e84ee90f6b9`, same tree as fiber head `b2d6f91` |
| When | 2026-11-12T06:46:21Z to 2026-11-12T06:59:01Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` (Chrome for Testing 158.0.8127.18) |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Node | 22.23.3. Python 3.10.22. `npm ci --prefix qa/runtime --no-audit --no-fund` (40 packages) |
| Standalone SHA-256 | `44801b66e935fedd578e692fd4072f33fbc16c9f5c278a64d03925141b33fa62` |
| `git status --porcelain` after the run | empty |
| Failing suites | none |

## Commands and exit codes

| Command | Exit | Result |
| --- | --- | --- |
| `python3 qa/run-pwa.py` | 0 | 86 suites, 0 failed, 2,269 checks, suite time 732.0 s, wall 733 s |
| `python3 qa/build3-layout.test.py` | 0 | `Build3 layout: 714 checks passed`, wall 11 s |
| `python3 qa/browser-smoke.py` | 0 | `Chromium rendered checks: 358 passed`, wall 16 s |
| `python3 night-sweep/build.py` | 0 | after the gate. SHA-256 unchanged |
| `python3 build-pwa.py` | 0 | after the gate. Printed content id `ebe9b831091a7c85b587`. `git status --porcelain` still empty |
| `sha256sum outputs/Night_Sweep.html` | 0 | hash above |

The layout and smoke logs printed `ConnectionResetError` from `http.server` when a client closed a socket. Both commands still exited 0. I am not calling those traces failed checks.

An earlier `qa/run-pwa.py` on the same commit used headless shell 1248 and is not this count. Two rendered suites failed there (checklist focus at 360 px, station native date `badInput`). I stopped that run and did not use it.

No emulator, phone, or field run.

Hosted CI on the identical tree is the fiber head `b2d6f91`, [run 43166448499](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43166448499), success. That is not this run.
