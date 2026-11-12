# Grok gate record — `54d5bee`

Own run. Not Lane A or Lane B. Not a second lane. Leak-detector head that contains `build3` `7107f27`. This file is a later commit on `claude/roadmap-determination`. It is not itself the gated head.

| Field | Value |
| --- | --- |
| Head | `54d5beeafc0444d9a1c2fc27987b1c675320bc24` (`54d5bee`, `claude/leak-detector-arcom`) |
| When | 2026-11-12T08:20:19Z to 2026-11-12T08:35:26Z |
| Chromium | `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome` |
| `NIGHTSWEEP_SUITE_TIMEOUT` | 3600 |
| Log | `/tmp/grok-gate-54d5bee.log` |
| Results JSON | `/tmp/carpe-leak/qa/pwa-test-results.json` |
| Standalone SHA-256 | `8dcd277ebcf691b462eeb5822ad4ba8d9f7074a99029a61b134e57eab9fa4035` |
| `git status --porcelain` after the run | empty |
| Failing suites | none |
| Pull request | [#25](https://github.com/Goodst3r/Carpe-Noctum/pull/25) merged `304cb77c83d0ea7d3e4125f26094a5ca437ccbb2` at 2026-11-12T08:36:24Z |
| Hosted CI | SUCCESS on this exact head (QA gate), seen before the merge |
| AUDIT | Review comment on #25 at this SHA, labelled not a second lane, no open Important finding |

## Commands and exit codes

| Command | Exit |
| --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `sha256sum outputs/Night_Sweep.html` | 0 |

## Counts (this run)

- Automated suites: **90 passed, 0 failed, 2,298 checks**, suite time **872.5 s**. `all_passed` true. `build_unchanged_during_tests` true. `worktree_unchanged_during_tests` true.
- Layout: `Build3 layout: 1004 checks passed`.
- Smoke: `Chromium rendered checks: 370 passed`. The log also prints a `ConnectionResetError` from the smoke HTTP server. The script still exited 0.

No failing suite, so there is no failing-suite tail.

The app change on this head is display text only: the leakage screen names the Arcom Digital QS-NAVPLUS-OUDP. `nightsweep-leakage-v1` is unchanged. No new formula.
