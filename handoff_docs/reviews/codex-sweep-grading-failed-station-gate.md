# A4 peer-correction gate at 533a8621a394f11e2b1e36aa75f2889de8c4ce1e

Workspace `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Started 2026-11-11T19:52:48.396504+00:00; finished 2026-11-11T20:01:37.221812+00:00. Status: **NOT PASSED**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.188 |
| `python3 build-pwa.py` | exit 0 | 0.089 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 1; 72 suites / 1566 checks; report not passed | 496.871 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 13.602 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 17.086 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 527.836 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `8be7e1a5d4ea81daf6202fbb25104c29e856d62b`. Tracked files: 591; source: 568; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `19d3b962954b1eeaadf67bdc75620e8665b63542e1815c0c5dac3d7fb2cca5fa`, `315dfafa7f1dd3bb79c7f1a1e1dd9ee1b65c7add1df9c61d0c7d9042343b23fa`, `8c27156079c6891e5ff1a117d1de52abc1c5df071850865772bd258ad3327536`, `9439d899c15f4a9bc0d449034217dc982b16247f75ae995f5b66f4bc27ace0e7`.

App version `2.0 Alpha build 3`; PWA content version `46306d876e8e7fbd158e`.

- Standalone SHA-256: `c0dbbaa44087dea52a78e4100f061d663e1ec5ccf0b4c0f9489381a3f6cfe6be`
- PWA index SHA-256: `1e63ae2ac73636b29a18ad1a365e03079cbe18974fd723324979920e0f57cf17`
- Worker SHA-256: `ee5b46817e590643020cd1e51bf6bf6519c2adfb6674aa3d236bea976f470ad5`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a4-peer-proof.json`. Raw gate: `/tmp/carpe-a4-peer-gate.json`. Separate reports: `/tmp/carpe-a4-peer-layout.json`, `/tmp/carpe-a4-peer-smoke.json`. Stage logs: `/tmp/carpe-a4-peer-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.

Sole failing full-gate suite: `qa/build3-station.test.cjs`. It logged its first17 cases as PASS, then the autosave-reload case at lines105–108 failed with `ReferenceError: Alignment is not defined` when reading `StationView.results()` from the reloaded test app. The suite completion line was absent, so the gate correctly counted0 checks for that failed suite. No root cause, product fix or successful rerun is claimed. Preserved failure log: `/tmp/carpe-a4-peer-station-failure-533a862.log`.

Independent final read of all 591 tracked files matched the pre-run hashes. No tracked edit, restore, dependency reinstall, GitHub mutation or private-file access was performed. The final result remains NOT PASSED despite passing separate layout/smoke.
