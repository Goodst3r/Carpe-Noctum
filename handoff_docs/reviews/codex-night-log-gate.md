# A2 final gate at d6f8bb685024519f70f8d7e30352bdba4c2e3cd9

Workspace `/workspace/carpe-night-log`, branch `codex/night-log`. Started 2026-11-11T19:02:14.008600+00:00; finished 2026-11-11T19:10:34.399161+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.178 |
| `python3 build-pwa.py` | exit 0 | 0.076 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 69 suites / 1377 checks; report passed | 473.752 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 255 separate rendered checks; report passed | 9.325 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 337 separate rendered checks; report passed | 16.187 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 499.518 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `e305a3074de5c771b49d11fc6922828ad3b4239f`. Tracked files: 552; source: 529; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `7cb3368b35005af961479b6bbca595efe1dc065d111aa74a1a53acd68a230051`, `a39d6ef7bcef2f50ab449cba068ccf2347eb6ae2c0ea7620d4c2d8eed8aa00f6`, `d66acd056f99eef396ac1575b4fb4aa83ba6d3131e1429b631e72d18a566dd47`, `ee0da2decb0de35b93f637ba39e124d272679bc55ac142f2d2246166a73aac6a`.

App version `2.0 Alpha build 3`; PWA content version `4230c53ffc782bb051c9`.

- Standalone SHA-256: `531e9aeb442585c5594a297ab131e249f875dc8af2eb05730fca591059357be1`
- PWA index SHA-256: `067d3114b2d58918073aae611d0f59ed53e8254a4b3ce27ab2c6f69504961acb`
- Worker SHA-256: `e6e3d6530672ff0b473a92cf06e84e2f789d8568461aed1083cf78fa4144ab9f`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a2-final-proof.json`. Raw gate: `/tmp/carpe-a2-final-gate.json`. Separate reports: `/tmp/carpe-a2-final-layout.json`, `/tmp/carpe-a2-final-smoke.json`. Stage logs: `/tmp/carpe-a2-final-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
