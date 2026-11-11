# A2 addendum final gate at 35f25f0d8ad05111860135f1e55d0d6213c6bc2f

Workspace `/workspace/carpe-night-log`, branch `codex/night-log`. Started 2026-11-11T21:34:30.369816+00:00; finished 2026-11-11T21:43:08.230186+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.201 |
| `python3 build-pwa.py` | exit 0 | 0.061 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 70 suites / 1459 checks; report passed | 490.271 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 374 separate rendered checks; report passed | 11.62 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 340 separate rendered checks; report passed | 14.899 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 517.052 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `b495e6123131ca678a0d2e962e1fcfcd19976889`. Tracked files: 582; source: 559; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `106ee3f0dffeb1c577863d69e76ce948568cfe9c451d8b8d85645d4853867a1f`, `1f403b1e8a7e847d6b3c0d80ebe83c7f5e18683882139be9269a412d9bdcbb8a`, `42b6705c4f3664ac90edfaeba68f367535b113d49091f517ce7e4596c1593c5b`, `cbbadd6fa197a715513729e6043f9955d585b31aec0ce9ab5665491a0b925f39`.

App version `2.0 Alpha build 3`; PWA content version `d29a294385eb7b56c42c`.

- Standalone SHA-256: `76f85b020049906b9c4836664756ff410cfdcbdb0726da756b3035024364fa2a`
- PWA index SHA-256: `86aa16f1f77836536b3e4d294ef3b9b2b3165a25a15efc6de9f03e6b9105e13f`
- Worker SHA-256: `acd261dff45389b99bf9dc2e51082346dbe1212a9f7f6898cb5f17da0638ee49`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a2-addendum-final-proof.json`. Raw gate: `/tmp/carpe-a2-addendum-final-gate.json`. Separate reports: `/tmp/carpe-a2-addendum-final-layout.json`, `/tmp/carpe-a2-addendum-final-smoke.json`. Stage logs: `/tmp/carpe-a2-addendum-final-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
