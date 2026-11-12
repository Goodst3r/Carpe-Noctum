# Lane A integration inventory — current example-retention addendum

Read-only preparation, 2026-11-11T21:36:30.037868+00:00. **No combined app was built, tested, committed or merged.** Earlier `/tmp/carpe-lane-a-integration-notes.md` remains unchanged at its original identities; this addendum supersedes only the input commits and conflict/count inventory for the following source.

## Exact inputs and observed changes

| Input | Exact commit |
| --- | --- |
| Current common integration base | `14bfc06ff62e000dc624e46d57cf8d4beda98ce0` |
| A2 example-retention successor | `35f25f0d8ad05111860135f1e55d0d6213c6bc2f` |
| A3 current publication | `570bafaf51614f7496f4882515a6a8d1df21f054` |
| A4 current publication | `07b3a91df01651b8bead04793973897d019a00a1` |

Every pair's actual `git merge-base` is exactly14bfc06. `GIT_OPTIONAL_LOCKS=0 git merge-tree --write-tree --messages --name-only <left> <right>` wrote only unreferenced conflict-tree/blob objects. No working-tree merge, checkout, index/ref/branch/commit change or source edit occurred.

The new A2 source adds `savedNightLog` to `App.example()`'s optional keep-list. That now directly conflicts with A4's `savedGrading` addition. A2 also corrects the Home complete-exercise summary to22; this changes a formerly stale label, not the actual step array. The prior report's assumption that A4+A2 App/example automatically merges is no longer valid.

## Current pairwise conflict inventory

Counts list conflicted paths; a worker rename/rename lists three paths for one logical conflict.

| Pair | Paths | Runtime source / QA conflicts |
| --- | ---: | --- |
| A4 + A2 |23| `app.js`, `jobs.js`, `thresholds.js`, `training.js`, `qa/run-pwa.py` |
| A4 + A3 |22| `jobs.js`, `thresholds.js`, `training.js`, `qa/run-pwa.py` |
| A2 + A3 |26| `app.js`, `build.py`, `jobs.js`, `shell.html`, `thresholds.js`, `training.js`, `workflow.js`, `qa/run-pwa.py` |

Other conflicts are the own feature sections in project status/update log, main README pair, authored/rendered guides and outputs/dist/worker renames. Unlike the earlier identities, Lane A status is not a conflicted path in these pairwise results; inspect its auto-merge for chronological accuracy anyway. Full results: `/tmp/carpe-integration-addendum-{A4-A2,A4-A3,A2-A3}-merge-tree.txt`. Their conflict-tree roots are `be0d683309ec45bfb03ec809bee33813ae7c8dfc`, `431bca09cbf82ca06ced61d092ed68970191badf`, and `eecf97c9ea684cd50f50002849b27a455ad3fcd8` respectively; these are inspection objects, not combined source approved for commit.

## Required example keep-list resolution

Read both exact `App.example()` implementations and the actual A4+A2 conflict. Preserve **both** optional variables and **both** matching spreads while retaining every existing saved field and the source's fresh route construction:

```js
// Additional variables alongside the unchanged saved fields:
savedNightLog = state?.nightLog,
savedGrading = state?.sweepGrading

// Both spreads in the replacement state, alongside existing saved fields:
...(savedNightLog ? {nightLog: savedNightLog} : {}),
...(savedGrading ? {sweepGrading: savedGrading} : {})
```

This is a resolution guide, not a runnable replacement function. Taking either whole conflicting line drops the other feature's history. Keep existing conditional absence for jobs without the optional sections: do not create blank history, migrate it, recalculate snapshots or filter saved grade records. Preserve exact NightLog captured Before/After raw/results and exact immutable grading-history records/criteria/original identities.

The example changes the current route/context. Live “historical/stale/unknown” classification or wrapper guidance may therefore change legitimately after the example; do **not** demand byte identity of all dynamically classified output as proof of history retention. Compare the actual saved NightLog/grading sections and original bytes/checksums through the intended backup paths separately from current-context warnings. The A3 source adds no `savedSweepDue` example keep-list term; this inventory does not silently introduce one or redefine its example behavior.

## Remaining keep-both source checks

The same shared-source requirements were rechecked against these current commits:

- `App.validateImport`: preserve all three independent optional validators: `NightLog.validate(s.nightLog)`, `SweepDue.validate(s.sweepDue)` and `SweepGradingUI.validate(s.sweepGrading)`, preserving existing module-availability guards where present. A2+A3 conflicts directly in the first two; A4's grading validation is in a different hunk and must still survive. A2 `renderAll()`'s NightLog refresh remains.
- `JobsUI.hasWorkingContent`: preserve **all three** leading terms `state.nightLog`, `state.sweepDue`, `state.sweepGrading` plus every base term; every pair conflicts on this line.
- Registry: retain the grading and sweepDue allowed stores/resolvers/edit buttons, all32 company grading rows/seven grading application guards/three archive guards, the NightLog cap row, and all five SweepDue rows. “This job’s targets” must include profile/sweep/grading/sweepDue, and the separate NightLog guard group must remain. Preserve every base Station/DOCSIS/leakage row and group. No company default or invented criterion.
- Build/shell: retain A4 archive/core/UI tokens and script order; both NightLog and SweepDue module/style tokens/panels/final initializers. Preserve scripts after Station and before APP as authored. Tokens exactly once; do not move modules to mask startup ordering. Preserve A4's pure `StationView.boundRecords()` and grading UI consumption even though Station is not a conflicting file.
- Workflow: retain both Job tabs, screen/visible-panel entries, **`NightLog.render(true)`** on entry and `SweepDue.render()` on its entry. The forced NightLog path is part of the reviewed partial-time/cache fix.
- Training/runner: retain both deep-step rows, grading custom-step row, all three appended feature/control entries, and all eight extra runner registrations (A4four, A2two, A3two), each exactly once. All existing below-list reliable-runner code remains.

## Re-derived static counts and guide order

Literal arrays/maps were freshly extracted from these exact committed sources and evaluated only as isolated data expressions; `MODULES` was counted with Python AST literal evaluation, without running the builder. Inventory: `/tmp/carpe-integration-addendum-static-literals.json`. All42 base feature tuples compare deeply equal as a prefix in every branch.

| Static property | Base14bfc06 | A2 | A3 | A4 | All-three union |
| --- | ---: | ---: | ---: | ---: | ---: |
| Workflow screen keys |25|26|26|25|**27**|
| Feature tuples |42|43|43|43|**45**|
| Complete steps |22|22|22|22|**22**|
| Six-active steps |14|15|15|14|**16**|
| Custom-curves steps |12|12|12|13|**13**|
| OEM / DSIM / manual / GS7K |8/9/7/10|same|same|same|**8/9/7/10**|
| Module substitutions, including CSS |31|33|33|34|**38**|

These are projections from actual source data, **not executed combined-runtime totals**. New screen IDs are `nightLog`/`sweepDue`; new feature IDs are `nightLog`/`sweepDue`/`sweep-grading`. Grading uses the existing evidence screen. New deep-step IDs `nightLog`/`sweepDue` share the insertion point after `station` and both must survive; grading adds only custom-step `grading`. All current incoming complete-card summaries now say22; do not regress to the base's stale21 label.

Each standalone incoming guide still gives its own new feature43. Preserve published base guide rows Station40/DOCSIS41/Leakage42, then append43/44/45 in the actual accepted merge order. A2→A3→A4 means NightLog43/SweepDue44/grading45; A4→A2→A3 means grading43/NightLog44/SweepDue45. These are guide numbers, not the source array position of Station, which remains20. Preserve stable feature IDs, all contents entries/anchors, and exactly one feature marker per actual runtime feature. Reconcile every guide/current-count paragraph and retain the README pair byte identity. Other merged Lane B modules would change these totals; recompute on the real future base.

## Real successor verification still required

After actual reviewed source merges, render main/Functions/Training guides using the existing Marked18.2 setup, rebuild standalone/PWA, and verify current source/docs/runtime counts and IDs. Never hand-merge outputs/dist/worker/release bytes or rendered guide HTML. Ensure all optional sections survive named job/duplicate/autosave/portable backups together, and that basic example preserves NightLog and grading history exactly while allowing correct current-context classification changes. Also retain partial-time restoration, keyboard pagination, strict interval/calendar/source identity, both grading await guards/original integrity and warm saved-Station reload.

Run focused source/frozen/rendered regressions and the full runner plus separate layout/smoke on the actual combined head with fresh source/generated/staged/tree/README/lock cleanliness proof. Do not add individual branch counts and call that a combined pass. Both lanes still owe final-build3 D3. No emulator/device/WebView/field result or merge approval is supplied by this inventory.

## No-change proof

The earlier inventory report SHA256 remains `c06a78e9f08c9afcf5b6d4b81b0f4e34f8e4182d3628a617209b698632e80d34`. Before/after HEAD, all refs, semantic staged-entry SHA256, empty porcelain status and original-report SHA256 all matched exactly. Proof is in `/tmp/carpe-integration-addendum-{before,after}.json`; explicit current-source presence observations are in `/tmp/carpe-integration-addendum-source-presence.json`. No builds, app startup, runtime/focused/broad tests, dependency installation, checkout/index/ref/branch/source/tracked metadata edit, private-file read, GitHub write, APK, deployment or child agent. Only /tmp analysis files and unreferenced merge-tree objects were written. Lane B retains responsibility for actual independent review/merges; Lane A cannot merge its own PRs.
