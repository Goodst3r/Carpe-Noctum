# A3 nightlog full gate at 072eb0ec193e7cd621e9f76c4024ecd02de1288d

Workspace `/workspace/carpe-sweep-due`, branch `codex/sweep-due`. Started 2026-11-12T00:16:02.136002+00:00; finished 2026-11-12T00:27:08.135851+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.624 |
| `python3 build-pwa.py` | exit 0 | 0.221 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 74 suites / 1760 checks; report passed | 630.763 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 14.625 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 349 separate rendered checks; report passed | 17.894 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 664.127 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `2d02fe78dec52d58dcd492c9513cf0b97b53b7dc`. Tracked files: 610; source: 587; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `267d8c233f19561cf8ae9873427383721e46c53621d52e81b4b9a257a95547cf`, `61c2fd522a7296a43fd846cc7b3fd9dfc73a39c186063f77f74c8d67cfdd1a18`, `8f98da133884a048b2cfaf7d4b87d5d606087cfc23f5d51b5b04599dd88a9c9b`, `bca544062fd9f5c11fe54dae49ec7fe991458bdfab5c05e6cfda8e48e0972620`, `f28c1f04c46882fa5154ee4acfebf4171c09a61dc760849b316cb92360ce93be`.

App version `2.0 Alpha build 3`; PWA content version `895c3d743a958543a5a5`.

- Standalone SHA-256: `a765323807749debd2a035ad7929fe2aa5c2fad8ec42456f872b5d75f613c7d0`
- PWA index SHA-256: `45ddd2c6497812ff9a49f410034a38acb96883bf52e215f1039583f24b8e0972`
- Worker SHA-256: `cdadd2773bf563b64800821062bf827a1b1fd44a3085ec8dac0ea008e9e39e32`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a3-nightlog-full-proof.json`. Raw gate: `/tmp/carpe-a3-nightlog-full-gate.json`. Separate reports: `/tmp/carpe-a3-nightlog-full-layout.json`, `/tmp/carpe-a3-nightlog-full-smoke.json`. Stage logs: `/tmp/carpe-a3-nightlog-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
