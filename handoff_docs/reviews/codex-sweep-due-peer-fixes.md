# A3 Sweep due: Lane B review corrections

**Ending clean frozen head: `c6f742e4042529fa7fa254eb37b401b7f3bd6748`.** Starting corrected integration head: `91eea423ae563506e00933b0ca9ac6e00c3337b4`. Reviewed incoming base remains `3cfb9c2021eabe52644cffbe1515224b9d027cb2`; own branch/worktree `codex/sweep-due` / `/workspace/carpe-sweep-due`. Ordinary follow-up commit, no amend/rebase/push.

The full supplied Lane B first review was read at `/tmp/carpe-a3-laneb-first-review.md`. It incorrectly displays A4's07b3a91 SHA; its described Sweep due source is the A3 implementation formerly published at570baf and integrated/corrected at91eea4. This receipt addresses the reproduced A3 behavior; it does not claim Lane B reviewed this successor or that its other large test counts were executed here.

## Required correction and bounded recommendations

Historical event rows previously changed only the badge/status to neutral, then concatenated the classifier's current-service text. That let an unconfirmed or retired worksheet say both Reminder unavailable and Due / overdue, Reminder window or Before reminder window.

The historical branch now emits only its historical/read-only reason plus recorded/not-recorded and unknown-date facts. Date, completed age, done flag and validity stay unchanged. Warning/due remain unavailable and status remains neutral. Actual card text omits all three current-service classifier phrases. Both sweep and balance use this fact-only branch. No stored record, timestamp, work date, company interval or calculation is changed.

Two small recommendations are also corrected:

- The empty list says **The interval belongs to the open job** and warns that another job can show a different interval or Unknown. The optional per-job storage scope is unchanged.
- **Not saved. Autosave failed. Export a project backup before closing.** is directly after the interval, within the same grid and linked through `aria-describedby`, with the existing polite live-status role and warning style. An ephemeral owner/raw-interval save result keeps the warning on a same-owner Refresh and clears stale saved/failed feedback when another job or raw interval replaces it. No new durable field, retry policy, autosave call, debounce or collector cache.

The original math/parser/classifier prefix and entire collector/readView function region are byte-identical to91eea4. Registry, App, Jobs, Station, CSS, module/runner registrations and existing independent calendar/reference files are unchanged. All five Unknown/company reminder rows/defaults, target binding behavior, complete source counts, separate balance/sweep facts, source diagnostics and keyboard-pagination focus remain.

## RED evidence before implementation

- `node /tmp/carpe-a3-historical-red.cjs` exited1 on91eea4 with the intended card assertion. All six combinations reproduced: legacy-unconfirmed and retired UBT ×2024-01-01/2025-11-11/2026-08-01. Dates and ages34/12/3 were correct, while the card retained red/yellow/green classifier wording under a neutral badge. Baseline facts `/tmp/carpe-a3-historical-red.json`; raw log `...-red.log` retained.
- New committed Node regression initially exited1 on missing empty-state ownership text: `/tmp/carpe-a3-peer-node-red.log`.
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py` exited1 at the intended **320px legacy2024-01-01 historical card** assertion after the original first-width checks passed. `/tmp/carpe-a3-peer-native-red.log` retained. No harness failure is relabeled a product pass.

## Own fresh executed verification

| Exact command | Own outcome | Evidence |
| --- | --- | --- |
| `node --check night-sweep/sweep-due.js` | exit0 | Source syntax |
| `node qa/build3-sweep-due.test.cjs` | **37 checks passed**, exit0 | `/tmp/carpe-a3-peer-node-green.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` | **37 checks passed**, exit0 | `/tmp/carpe-a3-peer-node-frozen.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py` | **189 rendered checks passed**, exit0 | `/tmp/carpe-a3-peer-native-green.log` |
| `node qa/ui-names.test.cjs` | **6 checks passed**, exit0 | `/tmp/carpe-a3-peer-names.log` |
| `node /tmp/carpe-a3-peer-guide-audit.cjs` | All21 practice-table/runtime comparisons, all3 guide anchors/IDs, README identity and20 worker asset hashes passed | `/tmp/carpe-a3-peer-guide-audit.json`, `.log` |

The37 source/frozen counts each contain the original33 plus four new groups: distinguishing upward-rounding boundaries, final year9999 boundary, six historical card cases with no state/store writes, and save-feedback owner isolation. The existing empty-state/quota group assertions were strengthened, not counted again. Normal source/frozen suites also retain named duplicate/autosave/portable preference, date/calendar, current overlay, binding and pagination contracts.

The actual native189 suite runs desktop Chromium156 through Playwright at320/360/390/430px. At every width it executes all six old/window/recent historical card cases, checks exact date/age/done/validity/neutral unavailable dates and whole state/previous localStorage bytes, verifies the actual empty state, enters a raw interval under synthetic autosave fault injection, checks directly linked visible feedback after explicitly centering the field, confirms Refresh preserves it, and confirms a new job clears it. All earlier keyboard/tap-target/source-sheet/overflow/console checks reran. The189 are actual fresh total checks, not old121 plus an unexecuted forecast.

Synthetic browser storage failure deliberately throws for the autosave key; this does **not** claim actual quota exhaustion. Controlled centering is not a claim about automatic error scrolling, physical keyboard/tap behavior or a screen-reader session. No Chrome DevTools MCP run is claimed for this correction.

The new math pins use explicit known expected dates/statuses for intervals2 and5, including a yellow boundary that differs under Math.round, and the final valid9999-12-31 anniversary versus the next overflowing month. A read-only isolated-module probe killed both a Math.round mutant and an extra-year mutant; `/tmp/carpe-a3-peer-mutation-pins.json`. No source mutation, new RF formula, external calculation, large exploration count or independent reference replay is claimed.

## Guides, sources and deferred dispositions

Main README/mirror, Functions and current Training Coverage explain historical fact-only rows and adjacent autosave feedback. Current counts remain28 screens/45 features, seven exercise lengths22/15/14/8/9/7/10. The targeted guide audit verifies all21 practice rows, unique IDs/resolving fragments in all three rendered guides, the README byte mirror and20 offline asset hashes. It also verifies397 unchanged prior product/QA/reference paths; only the scoped JS, main README and two own QA files are excluded from that provenance comparison.

Sources remain the authorized A3 plan/BUILD_LIST, existing Station/Jobs contracts, prior explicit calendar policy and existing independent reference fixtures. No source/limit or Hranac attribution was newly verified; the interval and warning policy remain entered/Unknown as before.

Recorded in the new A3 section of `handoff_docs/KNOWN_GAPS.md`:

| Review recommendation | Disposition |
| --- | --- |
| Historical current-service wording | Corrected; actual-card Node/native regressions |
| Per-job interval ownership | Retained scope; explicit empty-state explanation |
| Distant autosave warning | Corrected; linked adjacent notice and owner isolation |
| Synchronous200-job×40-station input workload | Deferred; reviewer observation attributed to Lane B, not remeasured; no debounce/cache |
| Older-backup/current overlay chronology diagnostic | Deferred; saved snapshot is not deleted; existing unique-ID overlay policy unchanged |
| Shared A2/A3/A4 optional validation/content terms | Future keep-both integration remains required; other branches untouched |
| Rounding/year9999 test pins | Added with two read-only mutant checks; math unchanged |
| Large external exploration reproducibility | Deferred; committed14 fixed reference cases and new pins do not reproduce the historical40,746 count |
| Garbled status/update-log receipts | Parent owns feature receipt reconciliation and final D4/D5; no status/update-log edits here |

## Build, source integrity and frozen identity

All three guides rendered using existing Marked18.2 with `CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules` and the normal `docs/render_readme.cjs` commands. `python3 night-sweep/build.py` and `python3 build-pwa.py` exited0. A final normal rebuild reproduced every frozen tracked byte; **574 tracked hashes** and semantic staged entries remained exact through that rebuild and commit, with clean final worktree and expected single parent. No dependency install or restoration.

Standalone SHA256: **`94d8243bfb10deb0ce2f843e6a7512272c736627dc7ca7d66e5b0bca61e91b22`**.
PWA index SHA256: `39ccf5c7d3658b10f14ea5a1ee92f42a6f8fc0a057dc201907681d2ef4adc977`; content version`36420d81ffb705793350`.
Proof `/tmp/carpe-a3-peer-final-proof.json`; before manifest `/tmp/carpe-a3-peer-freeze-before.json`. Raw Git index bytes were not used as an equality claim; semantic entries and source/generated content were checked.

Changed paths and reasons: `sweep-due.js` fixes historical wording, empty ownership and scoped save notice; both A3 QA files add real contract/card regressions; main README/mirror/Functions/Coverage explain resulting behavior; Known Gaps records bounded dispositions; generated standalone/PWA/docs/release/worker come from normal builds. No other feature source or lane status changed.

```text
M	dist/functions-guide.html
M	dist/guide.html
M	dist/index.html
M	dist/release.json
R094	dist/sw.14cee5a52ef42e83b709.js	dist/sw.36420d81ffb705793350.js
M	dist/training-coverage.html
M	docs/NightSweep_1.8_Alpha_Functions_README.html
M	docs/NightSweep_1.8_Alpha_Functions_README.md
M	docs/NightSweep_1.8_Alpha_README.html
M	docs/NightSweep_1.8_Alpha_README.md
M	docs/NightSweep_1.8_Training_Coverage.html
M	docs/NightSweep_1.8_Training_Coverage.md
M	handoff_docs/KNOWN_GAPS.md
M	night-sweep/README.md
M	night-sweep/sweep-due.js
M	outputs/Night_Sweep.html
M	qa/build3-sweep-due-layout.test.py
M	qa/build3-sweep-due.test.cjs
```

Tools actually used: local Git/Node/Python, JSDOM/fake-indexeddb, Playwright/Chromium, existing Marked and Superpowers systematic-debugging/TDD/verification guidance. No source architecture/API or new library dependency changed; no new external-source verification or engineering formula required.

## Untested and next

No full runner or separate whole-app layout/smoke gate yet on this successor; parent owns the broad slot after independent review. No push/PR/status/update-log write, private attachment, real identifier, new backend/account, APK/signing/deployment, child agent, emulator, physical Android/iPhone, Safari/WebView, native provider save/share/print, meter/RF hardware, field or supervisor check. Earlier full-gate receipts remain historical to their own tested heads.

Next: independent scoped review of this exact clean head, then parent fresh full gate/layout/smoke, receipt/status/PR21 publication and Lane B final-head review/gate/merge. Lane A cannot self-merge. D2–D5 remain open.
