# Station native retention + reviewed Outage integration

November 11, 2026. Focused integration by Lane A implementer; root owns independent delta review, full gate, PR/status publication and Lane B peer merge.

## Frozen revisions and output

- Previous independently reviewed Station head: `bc58b0f376f30b18f87fbac184065265094faf1b`.
- Reviewed current build3 merged ordinarily: `3cfb9c2021eabe52644cffbe1515224b9d027cb2` (root reports its whole tree equals reviewed Outage77b9c2ba; no new B8 review claim by this author).
- Clean frozen merge commit: **`0da7e6a50ab26e0a774074a6943250833d60752f`**, parents bc58b0f + 3cfb9c2.
- Owned branch `codex/station-input-retention`, worktree `/workspace/carpe-station-input`.
- Standalone SHA256: **`5e0f9ee5b0b94135314cc6d80df4ea53fc7aa70f68abc2ab2ad34d9f1019d126`**.
- PWA index SHA256: `02d817d67774d59c7d63bd2cbc0b334974db65011b861f2b9f928a32311ac661`.
- PWA content version **`06114beeff5a74524661`**; user version remains2.0 Alpha build3.

## Exact delta and byte provenance

No new product source fix was authored in this integration. Net diff against current build3 remains the same18 Station change entries documented in `/tmp/carpe-a1-native-input-fix.md`: Station source/CSS, two native regression suites, two runner entries, forced Station navigation reconciliation, two existing Station practice descriptions, scoped Station guide paragraphs, and their rendered/build artifacts.

`/tmp/carpe-a1-outage-byte-provenance.json` proves:

- Station JS/CSS, both native tests, mirrored main README Markdown and main rendered guide are byte-identical to independently reviewed bc58b0f. Station JS SHA256 remains `07f1686ce274344c5b650feec50a72cfd026f1c7144205bbedeb854bb3c5d64a`.
- Workflow equals exact3cfb9c2 plus the single preserved `StationView.render(true)` call.
- Training equals exact3cfb9c2 plus the exact two previously reviewed Station step descriptions. Outage/Safety steps, feature controls/order and arrays remain intact.
- Runner equals exact3cfb9c2 plus the exact two native Station suite entries.
- Functions Markdown equals exact3cfb9c2 plus the exact prior Station input paragraph.
-17 inherited files are exact3cfb9c2 bytes: outage/safety/checklist modules, thresholds, shell/style/build, checklist source/real suites, build3 layout suite, both source research notes, training coverage MD/HTML, project status, update log and Lane B status. No keys, parser/math, guard, limits, package, version, saved job schema or new module was changed by this integration.

Only generated index/release/hashed-worker entries conflicted. Main/functions/training guides were rendered with existing Marked18.2 runtime; standalone and PWA rebuilt normally. No generated file was hand-merged. No dependency install or lock edit; existing ignored QA dependency link reused.

## Fresh focused verification at0da7e6a

Both test queues completed with exit0; Node queue used `set -e`.

| Executed command | Own result | Raw evidence |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` |13 behavioral groups passed | `/tmp/carpe-a1-outage-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` |13 frozen standalone groups passed | `/tmp/carpe-a1-outage-frozen.log` |
| `node qa/build3-station.test.cjs` |22 checks passed | `/tmp/carpe-a1-outage-station.log` |
| `node qa/ui-names.test.cjs` |6 checks passed | `/tmp/carpe-a1-outage-names.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-station-native-layout.test.py` |89 actual Chromium checks at320/360/390/430 passed, no browser error | `/tmp/carpe-a1-outage-browser.log` |

The existing native browser suite was reused unchanged on the combined app. It exercises actual minus/exponent keys, last-committed zero/value retention, exact both-done=true date preservation, partial segmented date blur, no-final-event complete date clears, explicit cached navigation restoration, untouched imported invalid text, visible adjacent live feedback and overflow. It remains desktop Chromium with controlled focus/scroll and en-US date segments; no device certification.

Additional executed audits:

- `python3 /tmp/carpe-a1-outage-audit.py`: exit0; exact byte unions above, all three rendered guide IDs unique, every local fragment resolves, and auto TOC order equals H2 order. Main guide29 TOC entries/32 fragment links, Functions33/119, Training coverage7/9. No missing anchors.
- `node /tmp/carpe-a1-outage-counts.cjs`: exit0; actual runtime **27 screens,44 unique features**, all44 feature IDs represented exactly once in the Functions coverage table. All seven guide arrays: **complete22, six-active14, custom14, OEM8, DSIM9, manual7, GS7K10**. Functions introduction matches27/44. Evidence `/tmp/carpe-a1-outage-runtime-counts.json`, log `/tmp/carpe-a1-outage-counts.log`.
- Final proof `/tmp/carpe-a1-outage-final-proof.json`: all **558 tracked files** were SHA256-compared with the frozen HEAD blob contents after the focused tests; all equal. Semantic staged contents equal HEAD; clean working tree. No test churn restoration needed.
- `git diff --check 3cfb9c2...HEAD`: exit0.

Audit harness corrections are retained rather than hidden: the first Python training-line selector also selected the feature mapping and failed its expected two-line assertion; narrowed to the actual Station step signature, with no source edit. The first Node audit assumed runtime feature order equals guide table row order and failed because Station appears among route features in runtime but is appended as historical row40 in the guide. Corrected the audit to require exact unique44-ID set coverage; the order-assumption failure remains `/tmp/carpe-a1-outage-counts-order-assumption.log`. No production change was made for either audit mistake.

## Build commands actually run

```
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_README.md NightSweep_1.8_Alpha_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exit0. Generated PWA06114beeff5a74524661 is committed. Broad deterministic rebuild/gate proof belongs to root's next run; this author claims the normal builds and exact committed-byte equality after focused tests, not a new full gate.

## Scope, inherited limitations and next

Inherited Home exercise summaries still say21/13 while actual Complete/Six arrays are22/14; parent confirms A2 already corrects them. This integration preserves those inherited bytes and does not duplicate A2 scope. No D4 completion claim. Parent handles final source/status metadata after the full gate. Main/Functions guide Station paragraphs remain exact; guides' prior historical count snapshots are not globally rewritten here.

Prior Station independent review/MCP results remain attributed tobc58, not counted as new0da executions. No broad qa/run-pwa, whole build3-layout, browser-smoke, repeated Station review11, or old layout121 was run by this implementer on0da. No phone/emulator/Safari/WebView/screen reader/physical keyboard/touch/RF/field test, private attachment access, APK/signing/deployment, push/PR/status metadata, or other branch mutation.

Sources: authorized exact reviewed build3 merge, prior independently reviewed Station implementation, existing source/build/renderer contracts and plan. No new formula, engineering target, vendor schema or sourced threshold.

Next: root independent delta auditor and full wrapper on exact0da7e6a; then root publication and Lane B review/merge. Source is frozen and clean; no further edits are planned.
