# A4 startup-correction gate at 9cad649d1a7fdc511609c2989af0d1043512748a

Workspace `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Started 2026-11-11T20:17:02.442977+00:00; finished 2026-11-11T20:25:36.206576+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.207 |
| `python3 build-pwa.py` | exit 0 | 0.072 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 72 suites / 1589 checks; report passed | 485.83 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 11.295 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 15.511 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 512.915 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `4f701a3a7ede9bbd5b791f1bf0e83c5e68d853a2`. Tracked files: 591; source: 568; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `64f90feeec983920baeeb8749599148126364135f0c5b1a301f6f7a632ee0114`, `819fa38dc20118b707980f31c91bd31bc28852bca2487abce8ab22ec8e7abf05`, `b82b74301faa3497bc5bf185c8dff5872a9f4b3a242761d18e8efb1cb4242e0f`, `eac0287c3b8525cd75b1af3ea9bb37c055c181b367c9663d7421e49030f4655a`.

App version `2.0 Alpha build 3`; PWA content version `33e25c3f3603233f1a58`.

- Standalone SHA-256: `6dd84415cad259d5194a04b057c605783ceddafd6be10eb4b6c5df784c850b55`
- PWA index SHA-256: `dee665096b4ce54dac77a18b3d701ed27418d3b3110459744a1dcada43e57241`
- Worker SHA-256: `89573cc44f2a5b677b47e353efda3b2a8488d06deb4985c93940263cc1c03b1f`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a4-startup-proof.json`. Raw gate: `/tmp/carpe-a4-startup-gate.json`. Separate reports: `/tmp/carpe-a4-startup-layout.json`, `/tmp/carpe-a4-startup-smoke.json`. Stage logs: `/tmp/carpe-a4-startup-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.

Independent final read at 2026-11-11T20:26:29.403171+00:00: all 591 tracked hashes match the initial snapshot. All72 suites passed, including Station22 and corrected grading UI52. Failed533 receipts remain present with their original failed outcome and original app hash; this successful successor does not relabel that failure. No source/metadata/index edits, restores, installs, GitHub mutations or private-file access occurred.
