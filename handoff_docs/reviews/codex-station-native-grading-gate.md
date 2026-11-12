# A1 native integrated with reviewed grading gate at 2d95e04e908eba822c2789787e0fa9ec9285f269

Workspace `/workspace/carpe-station-input`, branch `codex/station-input-retention`. Started 2026-11-12T02:29:04.688782+00:00; finished 2026-11-12T02:40:59.439362+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.214 |
| `python3 build-pwa.py` | exit 0 | 0.102 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 82 suites / 2174 checks; report passed | 683.973 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 13.125 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 352 separate rendered checks; report passed | 16.394 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 713.808 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `a2aa261349a84481c2060e959d3f16129258dc97`. Tracked files: 703; source: 680; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `26b38dc97a443b95c071310975d841ba6d2ca7d2c1fd906b64b626097a50fb5d`, `45ae32be822c49f1ac32739073b38c358d72f55b8b345a69e3f48db3d781b3a8`, `4bc14b0c5b148f98229396a14409aac15693fcde5f0fdb96add448e3af66d5cb`, `7a232a31ef8b120d8fd068ee6cd7a1e3fdfbc48c87d0a4c145380b5e7cbd256c`.

App version `2.0 Alpha build 3`; PWA content version `dc6d93410e547078005a`.

- Standalone SHA-256: `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`
- PWA index SHA-256: `06f6e62bc062ae4744708faede1e8eb4881b504baac94ee5ab20bf4f1b31fddb`
- Worker SHA-256: `e9f34287045a667c7b88d71dc9cc588e3785335919c62c6d3f6f8fc1ca159ec2`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a1-grading-full-proof.json`. Raw gate: `/tmp/carpe-a1-grading-full-gate.json`. Separate reports: `/tmp/carpe-a1-grading-full-layout.json`, `/tmp/carpe-a1-grading-full-smoke.json`. Stage logs: `/tmp/carpe-a1-grading-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
