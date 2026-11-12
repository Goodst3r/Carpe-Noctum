# A2 rebased gate at b0d1643b9d423756ea5e9e14d321bdcb9523ba1b

Workspace `/workspace/carpe-night-log`, branch `codex/night-log`. Started 2026-11-11T19:42:37.727476+00:00; finished 2026-11-11T19:51:37.513988+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.203 |
| `python3 build-pwa.py` | exit 0 | 0.062 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 70 suites / 1,410 checks; report passed | 509.442 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 11.788 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 17.209 |

No outer timeout; the wrapper ran detached. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 538.704 s.

Runtime: Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `5e95401239a33a2f0f298d45b64136657c8352a1`. Tracked files: 559; source: 536; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `4fe98d5ad1c14b9a08ffff478c743cc96c320a3380b8325bfa81e3929f3af0fd`, `53175babd0d8fea5e86d058447a10b7280f7dd9c4f1196b4ea1b1bb70897e6ed`, `cdca11fbe3c7f3d78a31690f6d888e15c7c1248719d4f699318e21f702aa0c89`, `de1ad82151c90c44f66d15fa68481e97d3a21f374d4a68675eb705154c4c76f2`.

App version `2.0 Alpha build 3`; PWA content version `8c13bff1348b74b7a6ab`.

- Standalone SHA-256: `348ea3647bbdb9497b7dc5e1827eb054c4f460319321af2c7040f54cade509d1`
- PWA index SHA-256: `b24fd4ae2a311fe2297616d9c859545869f26c87eed79ebf56d5aa0c56733605`
- Worker SHA-256: `86d366ff281822410ace00675489238e7d746934842886f63715f573ec8eefbe`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a2-rebased-proof.json`. Raw gate: `/tmp/carpe-a2-rebased-gate.json`. Separate reports: `/tmp/carpe-a2-rebased-layout.json`, `/tmp/carpe-a2-rebased-smoke.json`. Stage logs: `/tmp/carpe-a2-rebased-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.

Post-completion direct rehash matched all 559 tracked files; all copied reports still match source bytes. No Git commands or child agents were used for this artifact check. All three earlier d6f8bb6 receipt files retain their original SHA-256 values.
