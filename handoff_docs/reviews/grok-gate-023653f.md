# Gate record · 023653f

Exact head: `023653f66e345936a48e55c917775fed8fdd6faf` (`grok/a5-power-pm`, pull request #30). Parents `a467418` and `304cb77`.

Local run 2026-11-12T08:56:26Z–09:10:10Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Log `/tmp/grok-gate-023653f.log`.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 |

- Suites **91**, checks **2302**, total suite time **791.5 s**. `all_passed` true. Generated build unchanged during the tests. Worktree snapshot unchanged during the tests.
- Layout: **1054** checks passed.
- Smoke: **373** Chromium rendered checks passed. The log printed a `ConnectionResetError` from `http.server` after a client closed a socket. The suite still exited 0.
- Standalone SHA-256 `ac987a33f4008a62f8195599b0755219a6e5f7b46f44680ff1622b69461e3a8b`
- `git status --porcelain` afterwards: only `?? qa/runtime/node_modules`. Not committed.

Hosted CI on this exact SHA: [QA gate run 43187078965](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43187078965), pass.

Not merged. During the run, `origin/build3` moved from `304cb77` to `6414668` (pull request #26, docs only). This head does not contain `6414668`.

No failing suite.
