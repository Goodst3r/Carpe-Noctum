# A2 outage full gate at 2690a46e51b8e20cd9841d11a1850a8de92c170c

Workspace `/workspace/carpe-night-log`, branch `codex/night-log`. Started 2026-11-11T23:11:46.053858+00:00; finished 2026-11-11T23:21:01.804932+00:00. Status: **PASS**.

| Command | Own outcome | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0 | 0.259 |
| `python3 build-pwa.py` | exit 0 | 0.068 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; 72 suites / 1534 checks; report passed | 525.27 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; 554 separate rendered checks; report passed | 12.15 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; 346 separate rendered checks; report passed | 17.024 |

No outer timeout; detached execution is supported. Each gate suite has a 3600 s limit. Evidence-writing/development switches unset. GIT_OPTIONAL_LOCKS=0 used for all child processes. Combined command runtime: 554.771 s.

Runtime: Python Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium Chromium 156.0.8078.79 built on Debian GNU/Linux 13 (trixie); Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4.

Reused installed locked QA dependencies; no npm install/ci/removal. 40 package versions checked before and after; unchanged: True.

Initial tree: `b08846c193678d4a54b740fca7630a6433faff7d`. Tracked files: 593; source: 570; generated: 23. Final comparison: `{"branch_same": true, "changed_generated_files": [], "changed_tracked_files": [], "clean": true, "generated_hashes_same": true, "head_same": true, "head_tree_same": true, "lock_hash_same": true, "lock_matches_head": true, "readme_hashes_same": true, "source_hashes_same": true, "staged_entries_digest_same": true, "staged_entries_same": true, "technician_readmes_identical": true, "tracked_hashes_same": true}`.

No restoration commands are used. Initial, stage-end and final source/build/HEAD-tree/semantic-staged-entry/README/lock hashes and status are recorded; any source or semantic-index churn remains visible and fails verification. Fresh report source timestamps, raw/source equality, current completion logs and exit codes are in the proof.

Raw index diagnostic: Raw index bytes changed while staged entries, HEAD/tree, source/generated, README/lock and clean-status guards matched. This is consistent with the benign Git stat-cache refresh reproduced during A4; raw index byte identity is not claimed and is not a pass criterion.
Observed raw index SHA-256 values: `15eb423096b49c28c96b674ec125c92bae37d48b1d17328e65c46b5b796d17dd`, `4da4695895001b4e96a2cbdd094e49fd5733c222259f9d27dcf03ff5db594b82`, `622198791b2c98655573265a62eed4e621372fc2641cb3eeb858b43b28b45caf`, `eb07af4f7fa12739ac546d2c1f273c002278b1d168a61fee3db5f29bec25485c`.

App version `2.0 Alpha build 3`; PWA content version `7ec73c8a1fa09c798d4d`.

- Standalone SHA-256: `899e6da766e0a315aff97ecb8e1d24183b031452ba68b9b840fe6dea4f326883`
- PWA index SHA-256: `39187d729af6dbc437d278f0ea6fe664efe91af9b1a6a0ebb164b3e7b969aba2`
- Worker SHA-256: `9c259d1cf85279317e338c97be66b8fce359beb245a7ef766336bc0052d7eb20`

QA lock SHA-256: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`. Full proof: `/tmp/carpe-a2-outage-full-proof.json`. Raw gate: `/tmp/carpe-a2-outage-full-gate.json`. Separate reports: `/tmp/carpe-a2-outage-full-layout.json`, `/tmp/carpe-a2-outage-full-smoke.json`. Stage logs: `/tmp/carpe-a2-outage-full-{standalone_build,pwa_build,gate,layout,smoke}.log`.

Tools used: local Git, Python, Node and Playwright/Chromium, with verification skill guidance. Synthetic automated and rendered desktop Chromium checks are distinguished above. No source/docs/QA/metadata edits, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification.
