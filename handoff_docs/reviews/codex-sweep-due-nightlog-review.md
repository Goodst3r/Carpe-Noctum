# Independent SweepDue / NightLog integration delta review

**Scoped PASS at072eb0ec193e7cd621e9f76c4024ecd02de1288d. No new Important integration finding. This reviewer ran focused checks only; no broad gate.**

## Exact revision and preservation

Detached checkout `/tmp/carpe-a3-nightlog-delta-review` is exact072eb0ec193e7cd621e9f76c4024ecd02de1288d, tree2d02fe78dec52d58dcd492c9513cf0b97b53b7dc, ordinary parents26f279f18a3dd2ea4fb1c23dcffdd4eea099b666 and reviewed NightLog basef50a7445a8c5254b0db4db5d9e4309569345c12c. Standalone SHA256 **a765323807749debd2a035ad7929fe2aa5c2fad8ec42456f872b5d75f613c7d0**, PWA895c3d743a958543a5a5. Final actual remote build3 remainedf50a7445 at2026-11-12T00:25:02Z; it is an ancestor.

Re-read the current plan/review rules and lane-status context. The status files retain historical publication/gate states; the exact frozen source and new author receipt `/tmp/carpe-a3-nightlog-integration.md` establish this task's source. That receipt's counts and earlier26f/c6/full runs are not this reviewer's new executions. The frozen author worktree was left alone while its separately sequenced full run started.

`node /tmp/carpe-a3-nightlog-delta-audit.cjs` passed **14 independent integration groups**, with source and frozen boots:

- SweepDue JS/CSS, both suites and the independent Gregorian calendar reference/cases are byte-identical to26f. Parse/classify arithmetic, rounding, Gregorian clamping, overlay/ambiguity, pagination/focus and unknown/failed-save behavior did not change. No new formula is introduced by this merge; existing independent references are re-exercised by the37-check suites.
- NightLog JS/CSS, Station/alignment/shared math, evidence/storage, Safety/Outage/checklist implementation, NightLog fixture/suites and source research are byte-identical tof50. The separate unmerged A1 native-input fix is not imported. Its inherited native incomplete-input gap remains tracked by PR23; this review tests valid completed date changes and committed history, not closure of that separate gap.
- App is exactlyf50 plus the optional SweepDue validator. Jobs is exactlyf50 plus state.sweepDue in content recognition. Both NightLog and SweepDue optional validation/content terms survive. App.example's savedNightLog variable/spread remain exact base bytes.
- Existing Checklist and naming tests retain every assertion and add only the exact ninth Sweep due tab after Night log. Source/frozen both expose all nine Job tabs in that order. NightLog.render(true) and SweepDue.render dispatches remain present.
- All45 base feature tuples remain an identical ordered prefix; SweepDue appends as46. All base exercise arrays remain deeply identical after removing the single added SweepDue step. Source/frozen both have29 task screens,46 features and current seven practice counts **22/16/14/8/9/7/10**, with truthful Home summaries.
- All67 base registry rows remain deeply identical in order, with the five unchanged A3 rows yielding72. The company interval resolves unknown initially;18 is never installed as a default. Company/Unknown labels, both guard groups, source units/conditions and existing registry routing survive. NightLog's200 cap stays Unknown.
- Current main/Functions/Coverage table claims all match measured runtime, in Markdown, authored HTML and PWA guides. README mirrors are identical. Functions has46 unique markers with the45 base-marker prefix intact; TOC entries cover actual headings, IDs are unique and all fragment links resolve. Current totals are29/46 rather than stale single-feature totals. Historical receipts remain historical.
- Current index/release/worker metadata agree and all20 actual offline asset hashes match. Shared integration paths are App/Jobs, build/shell/workflow, threshold/training registrations, exact navigation QA and guides/generated derivatives; feature implementation/math remains the proven parent content.

No storage-key, package/user-version, RF target/default or saved-job schema replacement was introduced. Existing optional sections remain additive. This is source/contract preservation evidence, not a new claim of RF acceptance or validated18-month company cadence.

## Own fresh checks

All commands below exited0 in the detached072 checkout, reusing existing locked QA dependencies through an ignored symlink:

| Command | Own result |
| --- | --- |
| `node qa/build3-sweep-due.test.cjs` |37 source checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` |37 frozen checks passed |
| `node qa/build3-night-log.test.cjs` |23 source checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs` |23 frozen checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-checklist.test.cjs` |37 frozen checks passed |
| `node /tmp/carpe-a3-nightlog-delta-audit.cjs` |14 grouped integration checks passed |
| `python3 /tmp/carpe-a3-nightlog-delta-mcp.py` |47/47 actual Chromium checks passed |

Focused logs `/tmp/carpe-a3-nightlog-delta-{due-source,due-frozen,night-source,night-frozen,checklist-frozen,audit,mcp}.log`. Machine-readable audit/MCP reports use the same prefixes. The14 audit groups include exact preservation of base exercise arrays; source/frozen counts are not copied from the author or summed into a fabricated full-gate count.

## Actual cross-feature browser evidence

Actual Chrome DevTools MCP1.13.0, fresh isolated sandboxed Chromium, local frozen072 app, mobile/touch viewports320/390×844. Invented Station data and one tiny synthetic CSV original only; no private export was accessed.

- At both widths, actual AX clicks on all nine Job tabs reached the expected route and retained fixed history. The interval initially remained absent/blank. Entering synthetic18 allowed an old2025-01-31 sweep to classify overdue while a recent2026-11-11 balance remained independent.
- Actual native date-segment keyboard edits changed Balance to2026-11-12 without changing any sweep reminder field. Completing Sweep as2026-10-31 changed the live reminder to before-window, due2028-04-30. Both dates come from current Station data. Fixed NightLog stage/raw/date data, generated preview and the attached original bytes remained exact throughout.
- Read-only SweepDue refresh/navigation left the whole portable project unchanged. Named duplication and portable backup retained both optional sections and fixed history. Portable reopen restored cadence18, both current dates, byte-identical NightLog history and identical synthetic original bytes/name/SHA256. Original storage IDs are remapped on import; data preservation is checked independently of those IDs.
- Both malformed optional validators reject before replacing the current owner. These calls exercise the actual validateImport union; no permissive replacement or new schema was introduced.
- The existing Route-example handler retains exact NightLog and original evidence. **It resets SweepDue interval to unknown**, matching existing A3/App.example baseline behavior; this is explicitly tested and is not described as preserving the interval. The new route does not reuse fixed captured NightLog dates as live Station work dates.
- Both phone widths have no page overflow and visible SweepDue buttons/inputs/summaries≥44px. No Chromium console errors. Screenshot `/workspace/.tools/chrome-devtools/checks/a3-nightlog-delta-390.png` was visually inspected: nine tabs, one retained original, reminder description and blank Company interval fit the viewport.

Date and tab input uses actual MCP interactions; synthetic fixture setup and backup/duplicate/Route-example/validation APIs are invoked programmatically through existing handlers. This is desktop Chromium behavior, not physical taps/provider saves or hardware/field testing.

One early browser compound assertion incorrectly required reopened original-file IDs to remain byte-identical. Its preserved script/log/raw JSON are `/tmp/carpe-a3-nightlog-delta-mcp-reopen-assumption.{py,log,json}`. Decomposition at both widths shows exact restored cadence/history and identical original bytes/name/SHA, with expected newly assigned import identities from unchanged base import code. The final47 explicitly checks those content properties and stores both before/after identities. The preliminary attempt completed17 passing assertions before its eighteenth assertion failed; those counts are not added to the final47 or relabeled as a product failure. No product change was made in response.

## Strict proof and limits

`/tmp/carpe-a3-nightlog-delta-proof.json` proves all **610 tracked files** retain their initial SHA256 and exact HEAD Git blob identity; HEAD/tree/semantic staged entries remain unchanged and status clean. It records exact head/base/app/PWA, current remote, fresh own counts and artifact hashes including the preserved early probe. No source/index/author-worktree/GitHub writes, dependency install, restore operation, private files, APK/signing or child agents.

No broad gate/separate full layout/smoke was run by this reviewer, and no pending actor execution is claimed as mine. No emulator, Android/iPhone/WebView/Safari, physical provider save, installed-PWA cache session, screen reader, RF meter/reference-plane or field verification. Root owns combining this scoped result with its separate same-head full gate, metadata/publication and Lane B review/merge. Lane A cannot merge its own pull request. No further scoped Important correction is requested.
