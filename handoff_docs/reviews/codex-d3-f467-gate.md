# D3 merged core before documentation reconciliation gate at f467e5261295449f94dd232ab3995c8a00be25ee

Workspace `/workspace/Carpe-Noctum`, branch `build3`. Started 2026-11-12T03:28:33.584535+00:00; finished 2026-11-12T03:40:29.979577+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.2 |
| `python3 build-pwa.py` | exit 0 | 0.089 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 82 suites / 2174 checks; report passed | 685.093 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 13.258 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 352 separate rendered checks; report passed | 16.756 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 715.396 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `d6c4b32f9662d1baaa85ad93ddbb0592c54730a4`. Tracked files: 715; source: 692; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `74b5be636be5ba46c13c60c1fd4b6ea4c8dcccefde3f65fe56a5a0703f794c87`, `a0f4b8649eb73ea5360549bdb15882848e5a1028c86deec2354dfc58f9589e9d`, `b8c5f4098c034c736d6e487f2d7934a57c049a4f6b12546fe5070b81930c0ace`, `d383c937fc422e7f5b791e5df0eb02cf042372d49a60ad73dddaf946676e067f`.

App version `2.0 Alpha build 3`; PWA content version `dc6d93410e547078005a`.

- Standalone SHA-256: `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`
- PWA index SHA-256: `06f6e62bc062ae4744708faede1e8eb4881b504baac94ee5ab20bf4f1b31fddb`
- Worker SHA-256: `e9f34287045a667c7b88d71dc9cc588e3785335919c62c6d3f6f8fc1ca159ec2`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-d3-core-merged-full-proof.json`. Raw gate: `/tmp/carpe-d3-core-merged-full-gate.json`. Separate reports: `/tmp/carpe-d3-core-merged-full-layout.json`, `/tmp/carpe-d3-core-merged-full-smoke.json`. Stage logs: `/tmp/carpe-d3-core-merged-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
