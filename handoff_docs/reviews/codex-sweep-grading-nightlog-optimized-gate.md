# A4 nightlog optimized full gate at 41c4db2ea7c6fd550069b5e1c6a88217c1876f61

Workspace `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Started 2026-11-12T00:48:13.305784+00:00; finished 2026-11-12T00:59:03.588913+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.237 |
| `python3 build-pwa.py` | exit 0 | 0.071 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 77 suites / 1843 checks; report passed | 610.915 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 18.22 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 349 separate rendered checks; report passed | 19.879 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 649.322 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `b9d75366db62a1b94088b615334d9b1c32645d21`. Tracked files: 653; source: 630; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `0c8ab230b28611e4b525d74335b3e841a0ec76d72890f96c26f3952119b7b4f2`, `825d447e6dc7b5344826b3d2601ce32decb86776393b6c9811ec1f5ddcd3456c`, `975c6ba3fd15a44afb7769a5caca965ccf7635d0253f1f0b0d24a2ab358b2670`, `a286a207172afc443eb57c64a8678adbd9d36500937a60a60c70e96c9aa0c957`, `c46804697bcc7c860dee6ec51febd6777cd9a34fcfabb1a456e6fb59d491c6b9`.

App version `2.0 Alpha build 3`; PWA content version `9b576dc55089f5dbe8f5`.

- Standalone SHA-256: `e38d95972d8473cccda1d3422054ebd52b0159cfe9c513d0358298c6ab885c6d`
- PWA index SHA-256: `a8410e3c4b6f99afe279423115a9eb2101757e071e30c88dd14d5c2da2b1d4c7`
- Worker SHA-256: `26c29c140d22301defd47086c3fce73bca0d48c4723c32186560eb8baea6c3b2`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a4-nightlog-optimized-full-proof.json`. Raw gate: `/tmp/carpe-a4-nightlog-optimized-full-gate.json`. Separate reports: `/tmp/carpe-a4-nightlog-optimized-full-layout.json`, `/tmp/carpe-a4-nightlog-optimized-full-smoke.json`. Stage logs: `/tmp/carpe-a4-nightlog-optimized-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
