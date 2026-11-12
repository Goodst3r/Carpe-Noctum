# A1 native recovery full gate at 0da7e6a50ab26e0a774074a6943250833d60752f

Workspace `/workspace/carpe-station-input`, branch `codex/station-input-retention`. Started 2026-11-11T22:58:38.676154+00:00; finished 2026-11-11T23:07:29.108668+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.19 |
| `python3 build-pwa.py` | exit 0 | 0.072 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 72 suites / 1505 checks; report passed | 502.336 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 11.982 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 343 separate rendered checks; report passed | 15.022 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 529.602 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `15340fdf8a5e1eb11d484c8fc842f24b216b6093`. Tracked files: 558; source: 535; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `0d628f32015e0d6134875f5ff3221f63729a3cec6047cb3d32d00eb4feb58bdd`, `204f954107d2959b01e23fbf4bfbf67fe2e27fd4b862f4b7a8b4b17e1f7ed182`, `40ad61bd5b81a42dfedf4d9068ac49e773d08e4924348ac588668832db55a4c2`, `d226ba92cb0fc53e10adddd2489936286560d639eef18a2ec7d85a254c439e69`.

App version `2.0 Alpha build 3`; PWA content version `06114beeff5a74524661`.

- Standalone SHA-256: `5e0f9ee5b0b94135314cc6d80df4ea53fc7aa70f68abc2ab2ad34d9f1019d126`
- PWA index SHA-256: `02d817d67774d59c7d63bd2cbc0b334974db65011b861f2b9f928a32311ac661`
- Worker SHA-256: `52b82cc7f2f63f7937e6656886276c445a7c86bbcfca4740c9c599908e45064a`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a1-native-recovery-full-proof.json`. Raw gate: `/tmp/carpe-a1-native-recovery-full-gate.json`. Separate reports: `/tmp/carpe-a1-native-recovery-full-layout.json`, `/tmp/carpe-a1-native-recovery-full-smoke.json`. Stage logs: `/tmp/carpe-a1-native-recovery-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
