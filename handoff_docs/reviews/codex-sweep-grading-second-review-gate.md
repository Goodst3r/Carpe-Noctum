# A4 second-review full gate at fe245887d30da3b8fa3e01fa721e31a47a3bba9c

Workspace `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Started 2026-11-11T23:37:34.788050+00:00; finished 2026-11-11T23:46:50.465569+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.183 |
| `python3 build-pwa.py` | exit 0 | 0.076 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 74 suites / 1701 checks; report passed | 526.904 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 12.29 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 346 separate rendered checks; report passed | 15.408 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 554.861 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `94f970b178374ba61c23aabb950f1fc928840eb6`. Tracked files: 611; source: 588; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `0265495e1c3beb6f53ca51a7b1da913516efddafd984627372d17138db31b005`, `7509d608ff7d04274f44041ccb535d439ede6d55fb197ff84cfce07117b13ef8`, `bbe41dc49eff57088476afd1d5c726a65c15ae5fcdfa676bb16e62ec65513841`, `eb7bf6a5fe1a0184b29f8fb5b593f2a2cdd693a99d528fbbd61627d1b03f4a82`.

App version `2.0 Alpha build 3`; PWA content version `3da00816890b0298d787`.

- Standalone SHA-256: `0b62d34b2ae7a24fa2127c2eb102c4949aca570f85d23866fe8f40cec691b9ab`
- PWA index SHA-256: `538c0545475efbec41a6b51e5320d9e64cd0c9463ba5e86a0741fd6fc50b8e60`
- Worker SHA-256: `b91ccefa911933a570e3b460789e237eb7dda0dd114dfd63f0ebc841619571a8`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a4-second-review-full-proof.json`. Raw gate: `/tmp/carpe-a4-second-review-full-gate.json`. Separate reports: `/tmp/carpe-a4-second-review-full-layout.json`, `/tmp/carpe-a4-second-review-full-smoke.json`. Stage logs: `/tmp/carpe-a4-second-review-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
