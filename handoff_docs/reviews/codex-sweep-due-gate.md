# A3 final gate at 52fac6902d2f2872ec28ca42115589df814cf5a3

Workspace `/workspace/carpe-sweep-due`, branch `codex/sweep-due`. Started 2026-11-11T20:05:17.374055+00:00; finished 2026-11-11T20:13:52.996513+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.243 |
| `python3 build-pwa.py` | exit 0 | 0.102 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 70 suites / 1,482 checks; report passed | 488.003 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 11.099 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 15.204 |

No outer timeout; the wrapper ran detached. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 514.651 s.

Runtime: Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `cbbc097de5294821a972bb7b6aeb37626dc40744`. Tracked files: 553; source: 530; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `03f18fd71e4de7d8d0f915f20713c22b2cd9bb91fe55a657ad22984296ec0a4e`, `29a35a7a569122aee3540c62c517e233f07ad68943457f6df32678fc842c36ab`, `87011a40a84c4e3245581b2c381697aa42e7ac35369143bb1ebedbabe8351b6a`, `f4d77a84580c2bc649da46c611798dfa64b795cb358c22f61e8573b37853894b`.

App version `2.0 Alpha build 3`; PWA content version `7e4e4389e027a22e31a0`.

- Standalone SHA-256: `9ae7f1c393d6d1b1fbe9fc89e0b1a30010fbdae7ea80dcb77c7255577d894e01`
- PWA index SHA-256: `e3d33ce0530008b5b1385d84d4207e2e2cb1f6c1d6347129b9e449d0052edd77`
- Worker SHA-256: `6a08edcd84bc0485daaaea0b96d3e4ffd5a4a79ba50f739e5f17c3beb92dbfae`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a3-final-proof.json`. Raw gate: `/tmp/carpe-a3-final-gate.json`. Separate reports: `/tmp/carpe-a3-final-layout.json`, `/tmp/carpe-a3-final-smoke.json`. Stage logs: `/tmp/carpe-a3-final-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.

Post-completion direct rehash matched all 553 tracked files; all copied reports still match source bytes. No Git commands or child agents were used for this artifact check. No A2/A4 receipt namespace was written.

A3 coverage included inside the full gate: 33 calendar/saved-job reminder checks and 121 rendered sweep-due phone checks. The separate layout (374) and smoke (340) totals are reported separately above.
