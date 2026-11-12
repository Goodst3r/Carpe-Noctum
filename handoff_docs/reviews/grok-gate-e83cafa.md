# Gate record · e83cafa

Exact head: `e83cafa30abf8c40800c228d7e47eb17f6343ab9` (`grok/a5-power-pm`, pull request #30). Parents `023653f` and `6414668`.

Local run 2026-11-12T09:12:14Z–09:25:56Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Log `/tmp/grok-gate-e83cafa.log`. This record is on the next branch so that head did not move.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 |

- Suites **91**, checks **2302**, total suite time **788.9 s**. `all_passed` true. Generated build unchanged during the tests. Worktree snapshot unchanged during the tests.
- Layout: **1054** checks passed.
- Smoke: **373** Chromium rendered checks passed. The log printed a `ConnectionResetError` from `http.server` after a client closed a socket. The suite still exited 0.
- Standalone SHA-256 `ac987a33f4008a62f8195599b0755219a6e5f7b46f44680ff1622b69461e3a8b`
- `git status --porcelain` afterwards: only `?? qa/runtime/node_modules`. Not committed.

Hosted CI on this exact SHA: [QA gate run 43189377721](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43189377721), pass. AUDIT: https://github.com/Goodst3r/Carpe-Noctum/pull/30#issuecomment-6819856393 — clean, ready to merge, not a second lane. Pull request #30 merged as `61069f4d6b714e75772325819e0d3710e808d94f`.

No failing suite.
