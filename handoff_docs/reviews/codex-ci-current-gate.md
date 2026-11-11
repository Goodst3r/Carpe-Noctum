# PR11 current CI gate at 0e17d9097ddf1e8b40475f7eea74768d74e3c256

Workspace `/workspace/carpe-pr11-current`, branch ``. Started 2026-11-11T20:29:39.090156+00:00; finished 2026-11-11T20:37:23.683846+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.211 |
| `python3 build-pwa.py` | exit 0 | 0.064 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 68 suites / 1328 checks; report passed | 434.579 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 12.566 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 337 separate rendered checks; report passed | 16.118 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 463.538 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `4c3cb384cca826fbd16b08a435f9c146230e722e`. Tracked files: 549; source: 526; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `78bdd47a3faca47d3e28196ec12209d89b4221172ecb6c5ccd8507dd3053b057`, `9b1ed5300c3ff0b4d9267c138656d345f90e20c323da9babe5c952035dc6ad5d`, `b41daa5435c140ab348f8e41086abb82ff646f3681e44c29a0ef98444a95499f`, `e2db4c8a6daad375bedc86cb09fb758f5506a2152014903f4284c06fe6f53169`.

App version `2.0 Alpha build 3`; PWA content version `fbd9c6126b4024308562`.

- Standalone SHA-256: `e960c2a7be00aa7f4dc2ffdf0f674e54c4f4b617d9dcc128e1ab831ae79c4add`
- PWA index SHA-256: `463a1fc85844bb743f78159f9306c1d6885f4b523f0e61e1fd06763e9d99e8e0`
- Worker SHA-256: `76563562c857e3710f54c71d85c46248248a36a5e3b5662e928dcde2c28c04ec`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-pr11-current-proof.json`. Raw gate: `/tmp/carpe-pr11-current-gate.json`. Separate reports: `/tmp/carpe-pr11-current-layout.json`, `/tmp/carpe-pr11-current-smoke.json`. Stage logs: `/tmp/carpe-pr11-current-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
