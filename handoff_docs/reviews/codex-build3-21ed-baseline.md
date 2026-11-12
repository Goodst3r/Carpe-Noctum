# Fresh Lane A baseline at build3 21ed711

Executed November 11, 2026 UTC against `/workspace/Carpe-Noctum`, branch `build3`, HEAD/origin `21ed711cacbc03359e1418f79b9af6f76888ede5`, tree `00f97647b8cd2b713336d5a02a2b40417031972e`. This is a fresh run; earlier baseline counts are not reused. The tree matches prior `e83f516`, recorded only as source context.

| Command | Own result | Wall seconds |
| --- | --- | ---: |
| `python3 night-sweep/build.py` | exit 0; exact committed bytes | 0.258 |
| `python3 build-pwa.py` | exit 0; exact committed bytes | 0.068 |
| `NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | exit 0; **66 suites / 1,276 checks**, all passed | 405.314 |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | exit 0; **141 checks** | 9.388 |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | exit 0; **331 checks**, no page errors | 20.528 |

Gate suite runtime: 405.0 s. Combined command runtime: 435.556 s. Detached background wrapper ran serially, with a 3600 s per-suite limit and no outer timeout. Start 2026-11-11T18:17:13.716843+00:00; finish 2026-11-11T18:24:30.260623+00:00. Evidence-writing/development switches were unset.

Runtime: Python 3.12.14; Node v24.22.1; npm 11.9.0; Chromium 156.0.8078.79; Python Playwright 1.62.0; jsdom 26.1.0; fake-indexeddb 6.2.4. Reused installed QA dependencies: all 40 installed package versions match lock before and after. No npm install/ci, dependency removal or reinstallation.

App version: `2.0 Alpha build 3`; PWA content version `cb2407bf15d56f787117`. SHA-256:

- Standalone: `28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15`
- PWA index: `4ca83bbd3450d8f0e893fe874a2a48046bfa52645e29cd83655b9daa5cbb3c42`
- Service worker: `f5472cd823404bb4825c4883bf63c6ddf4cf191e38995a0741d4b64bc7bd0e41`
- QA lock: `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`

Before/after snapshots cover all 537 tracked files (514 other tracked files and 23 generated files), Git index/tree/status, all README copies and lock. Every stage and final verification matched initial hashes; the initial, stage-end and final statuses were clean. Both technician README copies stayed byte-identical. Gate reports build/worktree unchanged. No checkout/reset/restore or evidence restoration was used to hide churn. Final tracked manifest SHA-256: `d8f94c86b1b1bc190b1a0bc78d389660c1e1d1fc50d387f81f8bd67eacc26259`.

Raw gate: `/tmp/carpe-baseline-21ed-gate.json`; layout: `/tmp/carpe-baseline-21ed-layout.json`; smoke: `/tmp/carpe-baseline-21ed-smoke.json`. Full proof: `/tmp/carpe-baseline-21ed-proof.json`. Command logs: `/tmp/carpe-baseline-21ed-{standalone_build,pwa_build,gate,layout,smoke}.log`; wrapper: `/tmp/carpe-baseline-21ed-run.py`. All three copied reports match source bytes; source modification timestamps fall inside their execution stages, current logs contain completion counts and exits are zero. An independent read-only proof audit found no Important issue.

Tools actually used: local Git, Python, Node, Playwright/Chromium and verification skill guidance; independent read-only agent proof review. No source/metadata edit, branch switch, push, deployment, private attachment access or transfer. No APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/reference-plane or field verification. These are synthetic automated and rendered desktop Chromium results.
