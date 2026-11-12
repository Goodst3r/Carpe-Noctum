# A4 sweepdue full gate at 61c4d4add20b47cd8fb96e9a9fafc392e10c9ffe

Workspace `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Started 2026-11-12T01:15:59.126328+00:00; finished 2026-11-12T01:27:49.253684+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.223 |
| `python3 build-pwa.py` | exit 0 | 0.084 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 80 suites / 2072 checks; report passed | 679.268 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 13.278 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 352 separate rendered checks; report passed | 16.336 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 709.189 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `f3f0c52df8a9e787bb9d21f1162f60d0ba72aa87`. Tracked files: 680; source: 657; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `6f1283f4651a88192db41fadd01d49243e09d181149c82828c9ee429fd257e5b`, `b03b109cea26d49ba9fd094bf2eb07fc93a41952fbea2639f60b7db70b5140d2`, `c13c2aace3349afa757de56060d1fd5c332904afedd8edfcd044a3de97974b35`, `d22b547a6967e918a7e2e5c7776e24afcb8578c994287fc6b30043a3d0c6a641`.

App version `2.0 Alpha build 3`; PWA content version `b354fda83dc6f8c89109`.

- Standalone SHA-256: `8caf8ff1e9ccccc701a3f8e27e88c46f8331bdf9747946ccc97d1e05bdc9cb24`
- PWA index SHA-256: `9cb8ed05b8ffec98bd115f76360195bb07bc3e0bc94b3247cb517072bd0db943`
- Worker SHA-256: `ba7c3a6360db8d4f1127c36e6544a1de9e88c85d2b9b6de77f08a0abf15ab568`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a4-sweepdue-full-proof.json`. Raw gate: `/tmp/carpe-a4-sweepdue-full-gate.json`. Separate reports: `/tmp/carpe-a4-sweepdue-full-layout.json`, `/tmp/carpe-a4-sweepdue-full-smoke.json`. Stage logs: `/tmp/carpe-a4-sweepdue-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
