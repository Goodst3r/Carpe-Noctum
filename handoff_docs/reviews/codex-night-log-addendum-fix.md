# A2 peer-addendum correction — frozen source

November 11, 2026. Ready for independent scoped review and coordinator's final full gate. No push, GitHub write, merge or broad gate by this author.

**Starting head:** `30d465c86d26ab781f3cd66a8d45104e2c76ce89`, `/workspace/carpe-night-log`, branch `codex/night-log`.

**Ending clean commit:** `35f25f0d8ad05111860135f1e55d0d6213c6bc2f` (ordinary successor). Reviewed build3 `14bfc06ff62e000dc624e46d57cf8d4beda98ce0` remains an ancestor.

- Standalone SHA256: `76f85b020049906b9c4836664756ff410cfdcbdb0726da756b3035024364fa2a`.
- PWA index SHA256: `86aa16f1f77836536b3e4d294ef3b9b2b3165a25a15efc6de9f03e6b9105e13f`.
- PWA content version: `d29a294385eb7b56c42c`; product identity remains 2.0 Alpha build 3.

## Required review dispositions

Read the actual wider Lane B addendum `/tmp/carpe-a2-laneb-addendum-de5459d.md` first, current AGENTS/plan/rules, lane statuses, affected actual source/guides/tests and previous scoped correction. Applied the already-read Superpowers receiving-review, TDD and verification guidance. No claim of a new primary engineering-source review is needed: this is existing-data preservation and count reconciliation, with no new formula or sourced limit.

1. **Window-time feedback/restoration:** already corrected at cd79a846; preserved byte-for-byte. This follow-up does not change `night-log.js`, `night-log.css` or `workflow.js`. Existing focused tests continue to cover adjacent named format/ARIA/double-border feedback, invalid-text nonreplacement, blur/return restoration and intentional blank unknown. Geometry tests explicitly center the field; automatic error scrolling, physical keyboard and screen-reader behavior remain unverified.
2. **Stale preview:** already corrected at cd79a846; preserved byte-for-byte. Generated previews clear after validated saved edits; exports read current validated log. Existing behavior tests still pass.
3. **README counts:** corrected the main README table and prose from six-active14/custom10 or8 to actual **15/12**, keeping both Markdown copies exact. Corrected Home's complete-exercise descriptor21→**22**. Runtime-derived counts for all seven exercises are complete22, six-active15, custom12, OEM8, DSIM9, manual7, GS7K10. Added an explicit current count summary to Training Coverage, whose table and existing A2 section already had correct15/12. Functions guide already correctly states26screens/43features and22/15/12; no unnecessary Functions edit. All seven step arrays are unchanged, and merged Leakage42 / Night log43 remain unchanged.

## Five recommended dispositions

- **4 — deferred and recorded:** no Remove/Undo, all-blank general Add consumes a slot, and the capacity message's “start another window” does not name an implemented control. No destructive history UI or cap change. Guidance in own-feature Known Gaps is to back up and use a separate new blank job.
- **5 — fixed:** actual `app.js` `example()` now retains an existing optional `nightLog` with the same keep-list pattern as other retained sections. Real `#example` click tests cover notes on an empty route (no confirmation), captured Station raw inputs/results, independent balance/sweep dates, immediate autosave, named save/duplicate/reopen and portable backup/reopen. An old job without a log remains without the optional field. No new schema/key/format or RF recalculation.
- **6 — deferred and recorded:** existing `state.example`/sample/training classification is unchanged. Initial sample-state notes may be labeled synthetic/“Sample route”; explicit route-example replacement still sets `example=true`. Preserved captures may acquire current-context historical warnings, and TXT/CSV derived warning/classification fields may change as designed after replacing the route. Stored optional log, capture raw/results/dates and portable JSON remain exact. This is data retention, not a finer provenance-policy change; use a new blank job for real work and review labels.
- **7 — deferred and recorded:** multiline Actions/TXT continuation text can visually resemble another entry/field because continuation indentation is absent. CSV quotes multiline cells; full JSON keeps exact strings. No text-format change.
- **8 — upstream A1 and recorded:** Lane B's native lone-minus Station input report remains open; this A2 follow-up does not alter Station or claim a new real-keyboard reproduction/closure. Night log cannot recover text discarded before its capture API.

All five dispositions are in a scoped A2 addendum section in `handoff_docs/KNOWN_GAPS.md`. Existing A1/performance sections remain intact. The accepted readonly14px preview is unchanged.

## Files changed and why

Sixteen tracked paths, including the generated worker rename:

- `night-sweep/app.js`: only an optional savedNightLog variable/spread in existing route-example keep-list.
- `night-sweep/training.js`: only complete Home descriptor21→22; no steps/features/control arrays changed.
- `night-sweep/README.md`, identical `docs/NightSweep_1.8_Alpha_README.md` and rendered main HTML: accurate current step counts.
- `docs/NightSweep_1.8_Training_Coverage.{md,html}`: explicit current runtime summary.
- `handoff_docs/KNOWN_GAPS.md`: truthful per-addendum dispositions.
- `qa/build3-night-log.test.cjs`: three new meaningful groups (empty-route preservation/absence; actual captured history+named/portable round-trip; summary counts versus real steps).
- `qa/build3-night-log-layout.test.py`: actual route-example clicks at320/360/390/430, exact autosaved capture bytes, empty-route notes and all seven descriptor counts.
- Normal generated `outputs/Night_Sweep.html`, `dist/{index.html,guide.html,training-coverage.html,release.json}` and hashed worker rename; no hand-edited generated bytes.

No status-file/project-status/update-log edit, other lane branch, version/package/storage-key change, new RF formula/limit/default, dependency change, private-original access or APK work.

## Executed RED evidence

- `node qa/build3-night-log.test.cjs` before the product fix: `/tmp/carpe-a2-addendum-source-red-final.log`, exit1, **false != true** for “Route example must retain the optional night log.” Opening purity passed first. Initial version of this new assertion attempted to JSON-decode missing `undefined`; that harness error is retained in `/tmp/carpe-a2-addendum-source-red.log` and was corrected to an explicit presence assertion before any product edit.
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-night-log-layout.test.py`: `/tmp/carpe-a2-addendum-browser-red.log`, exit1, actual320px route-example button loses captured log bytes. Existing time/preview checks passed before the new retention assertion failed.
- Separate actual-source summary assertion: `/tmp/carpe-a2-addendum-summary-red.log`, exit1, complete Home summary **21 !=22** actual steps.

## Own GREEN results

Commands actually executed after changes:

```sh
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
node qa/build3-night-log.test.cjs
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-night-log-layout.test.py
node qa/ui-names.test.cjs
node qa/training-library.test.cjs
node --check night-sweep/app.js
node --check night-sweep/training.js
git diff --check
git diff --cached --check
```

- **Source23 checks**, exit0: `/tmp/carpe-a2-addendum-source-final.log`.
- **Frozen23 checks**, exit0: `/tmp/carpe-a2-addendum-frozen-final.log`.
- **Rendered107 checks**, exit0: `/tmp/carpe-a2-addendum-browser-green.log`. Actual Playwright/desktop Chromium, four phone viewports, no page errors. Includes existing required1/2 regressions and twelve added retention/descriptor checks. This is not a new Chrome DevTools MCP run or physical-device test.
- **UI names6**, exit0: `/tmp/carpe-a2-addendum-names.log`.
- **Training library11**, zero failed, exit0: `/tmp/carpe-a2-addendum-library.log` (60.88s). Existing feature-opening/cancellation/training/portable tests remain intact.
- Both JavaScript syntax commands and diff checks exit0.

One intermediate source/frozen attempt failed the new captured-date fixture because it dispatched `input` to Station's native date control, whose real handler accepts `change`. Corrected the test event to `change` and reran both full focused suites to23/23. This was a fixture error, not a product date regression or changed Station behavior. Intermediate logs `/tmp/carpe-a2-addendum-source-green.log` and `...-frozen-green.log` are preserved and are not passing totals.

Repeated normal builders after the final guide render: **583 tracked/new-worker path hashes unchanged**, unchanged dirty-status inventory, exact main README copies, previous partial-time/preview source unchanged, training diff only the summary literal. Proof `/tmp/carpe-a2-addendum-build-proof.json` includes the before/after semantics and final app hashes. That manifest includes the old tracked worker's deliberate absence plus the new worker; it is a build-reproducibility check, not a claimed clean full-gate receipt. Commit then completed with `git status --short` empty. No tracked release/research churn or restoration command.

Used existing locked QA dependencies via ignored symlink and Marked18.2 scratch runtime; no install/removal. Tool record: local Git/Node/Python, actual Playwright/Chromium and Superpowers guidance. No new connected-source provenance or MCP execution is claimed by this author.

## Remaining / next

Coordinator owns independent scoped review, new same-head full runner/layout/smoke gate, metadata publication and Lane B final review/merge. Earlier cd79/CI-only head gate totals are historical, not this run. No emulator/physical Android/iPhone, Safari/WebView, screen reader/physical keyboard, provider-save dialog, RF meter/hardware or field verification. No source edits after this freeze pending reviewer feedback.
