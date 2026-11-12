# A2 peer-time final gate at cd79a84630ec7fec9f997f9631b5fb5b4a35a287

Workspace `/workspace/carpe-night-log`, branch `codex/night-log`. Started 2026-11-11T20:40:59.630358+00:00; finished 2026-11-11T20:49:17.405730+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.205 |
| `python3 build-pwa.py` | exit 0 | 0.117 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 70 suites / 1444 checks; report passed | 468.314 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 12.308 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 15.957 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 496.901 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `4e9684eeb75cbaa1808b1803e7a413e1c0d5cab5`. Tracked files: 567; source: 544; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `16717f89e8aa2af366657c6fa9c489f3fc69a5090c11206e4f4a94a0e581c8a4`, `25474264584333ec39ad162a816ee22b104790ce35f2776181641468154d01d1`, `b35222cc74cc7de5a599561790e5852b688fef35f998c5ddf6870a4b3cbf377c`, `d9892e671eeb69d781374ff1c5b57c21e92f9ff1eae0b66fda65d6607d479542`.

App version `2.0 Alpha build 3`; PWA content version `3d81becc5561966f0263`.

- Standalone SHA-256: `40457922122c2d112919978691cb171ca6f3e816e2f00b93dfa3d0018c5bbe97`
- PWA index SHA-256: `3dd4f31d69e9afc42ab92c92aa52bfaa9b003e9efce72c08d92ac81d75af9534`
- Worker SHA-256: `110000fb2b377d062799f4769491c46b6913b37e1749ef32b7763cc7fb47529c`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a2-window-final-proof.json`. Raw gate: `/tmp/carpe-a2-window-final-gate.json`. Separate reports: `/tmp/carpe-a2-window-final-layout.json`, `/tmp/carpe-a2-window-final-smoke.json`. Stage logs: `/tmp/carpe-a2-peer-time-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
