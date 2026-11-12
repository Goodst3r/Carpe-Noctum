# Lane A required-feature integration inventory

Read-only preparation, 2026-11-11T20:47:34.502718+00:00. **No combined app was built, tested, committed or merged.** Lane B remains responsible for independent review and actual merges of Lane A pull requests.

## Exact inputs and method

- Current integration: `5588a49b10292bed422b7597ec227bce38173a2d`.
- A4 / PR14: `45eef1ccb304832576053cb385e88f710dc0def5`.
- A2 / PR17 pending correction publication: `cd79a84630ec7fec9f997f9631b5fb5b4a35a287`.
- A3 / PR21: `ea2e5deb6a458173bb23058b895542ed0450c73b`.
- Ran `GIT_OPTIONAL_LOCKS=0 git merge-tree --write-tree --messages --name-only <left> <right>` for the three pairs. Every pair's actual merge-base is exactly5588a49. Exit1 means expected conflicts; only unreferenced Git tree/blob objects were written. No checkout, index, branch, commit, ref, tracked-file or status edit.
- Read actual own-item source deltas for App, jobs, module list/shell, workflow, thresholds, training and runner, and actual conflict-marker blobs in the generated merge trees. Inspected affected authored guide rows.
- Extracted only literal training arrays and workflow screen maps from each committed source into isolated Node `vm` expressions. This is static data analysis, not app startup/tests. Module-token counts came from Python AST literal evaluation of `MODULES`, without executing the builder.

## Pairwise inventory

Counts are conflicted paths, with rename/rename service-worker conflicts listing all three paths; they are not a count of logical merge defects.

| Pair | Conflicted paths | Runtime source / QA conflicts |
| --- | ---: | --- |
| A4 + A2 |19| `jobs.js`, `thresholds.js`, `training.js`, `qa/run-pwa.py` |
| A4 + A3 |23| same four |
| A2 + A3 |27| those four plus `app.js`, `build.py`, `shell.html`, `workflow.js` |

The remaining conflicts are own status/update-log sections, lane status, authored guide Markdown/rendered HTML and generated outputs/dist, including hashed-worker rename conflicts. Main README pair conflicts occur in A4+A3 and A2+A3. A4+A2 main README merges automatically; still verify its combined counts. Full exact inventories and Git messages: `/tmp/carpe-integration-{A4-A2,A4-A3,A2-A3}-merge-tree.txt`. Raw source deltas: `/tmp/carpe-integration-{A4,A2,A3}-shared.diff`.

## Concrete keep-both resolutions

- **`jobs.js`:** `hasWorkingContent()` must retain all three independent terms `state.sweepGrading`, `state.nightLog`, `state.sweepDue`, plus every existing term. Taking one conflicting whole line strands another feature's data-only working job.
- **`app.js`:** keep independent optional `nightLog`, `sweepDue`, and `sweepGrading` import validations and A4's `example()` preservation of `savedGrading`. Preserve A2's existing `renderAll()` call to `NightLog.render()`. The first two validators conflict directly; A4's grading validator is in a different hunk and auto-merges, so inspect it anyway. Do not introduce defaults, key/schema changes or silent migration.
- **`build.py` / `shell.html`:** keep every A4 token (`EVIDENCEARCHIVE`, `SWEEPGRADING`, `SWEEPGRADINGUI`) plus both A2 (`NIGHTLOG`, `NIGHTLOGSTYLE`) and A3 (`SWEEPDUE`, `SWEEPDUESTYLE`). Each token exactly once. Preserve the existing A4 decoder/core/UI script order; keep NightLog/SweepDue scripts after Station and before APP, both style placeholders, both panel IDs, and both final `init()` calls. Do not move modules to solve conflicts. Static total for these exact inputs is38 module substitutions (base31 +A4 three +A2 two +A3 two, including CSS substitutions).
- **`workflow.js`:** append both Job tabs, both screen descriptions and visible-panel mappings without losing current base tabs. Crucially retain corrected **`NightLog.render(true)`** on Night log entry (partial-time cache restoration), alongside `SweepDue.render()` on its tab. Avoid resolving to older `NightLog.render()` from pre-fix source.
- **`thresholds.js`:** keep all generated A4 grading/archive/software-guard rows, A2 `nightLog.entries.max`, all five A3 interval/policy/calendar rows, and all base rows. The allowed-store union must include `grading` and `sweepDue`; retain both source-value resolvers and both edit-button routes. “This job’s targets” must include profile/sweep/grading/sweepDue; preserve the separate Night log application-guards group and every base DOCSIS/leakage group. The all-groups one-line definitions conflict even where row additions auto-merge.
- **`training.js`:** retain `nightLog` and `sweepDue` deep-step rows, `grading` custom-step row, all three feature rows and control mappings. All42 base feature tuples compare deeply equal across the exact three branches; preserve that prefix/order. Append incoming new feature rows after whichever feature has already merged. Recompute displayed exercise summaries from actual arrays; do not take A2's inherited `complete` summary21 when the actual array has22.
- **`qa/run-pwa.py`:** keep all eight added entries (four A4, two A2, two A3), each exactly once, after the existing Station entries. Preserve the below-list reliable runner/timeout logic.
- **Station/evidence:** `station.js` does not pairwise-conflict, but preserve A4's pure `boundRecords()` export and grading UI use. Do not replace it with computed `records()` during startup or drop the warm-reload fix. Evidence/archive/core and feature-specific UI/CSS files are otherwise distinct in these exact branches.
- **Metadata:** retain every feature's own status/update-log section and immutable original/failed receipts. Synthesize the latest factual Lane A status; taking an older whole status file can falsely reopen/close requests. Do not edit Lane B's status. Keep A4's explicitly disclosed A1/performance Known Gaps notes and all deferred limitations.

## Counts derived from exact committed data

These are **expected static unions**, requiring actual combined runtime/build verification later. They exclude every unmerged Lane B stretch/safety/outage feature and cease to be final totals if the base changes.

| Item | Base5588 | A4 | A2 | A3 | All three static union |
| --- | ---: | ---: | ---: | ---: | ---: |
| Workflow screen keys |25|25|26|26|**27**|
| Practice feature tuples |42|43|43|43|**45**|
| Complete steps |22|22|22|22|**22**|
| Six-active steps |14|14|15|15|**16**|
| Custom-curves steps |12|13|12|12|**13**|
| OEM / DSIM / manual / GS7K steps |8/9/7/10|same|same|same|**8/9/7/10**|

Actual additions are screen IDs `nightLog`, `sweepDue`; feature IDs `nightLog`, `sweepDue`, `sweep-grading`; deep-step IDs `nightLog`, `sweepDue` inserted after `station`; custom-step ID `grading`. Feature `sweep-grading` points to the existing evidence screen, so adds no screen. Source literal inventory: `/tmp/carpe-integration-static-literals.json`.

Each standalone incoming guide currently calls its new feature43. Preserve already-published base guide numbers Station40 / DOCSIS41 / Leakage42, then append43/44/45 according to actual merge order. For A2→A3→A4, the new guide rows become Night log43 / Sweep due44 / grading45; for A4→A2→A3, grading43 / Night log44 / Sweep due45. These are guide row numbers, not a claim that the source array puts Station at position40 (its existing array position is20). Keep stable feature IDs, not hardcoded duplicate43 labels. Read every new authored section and TOC/anchor/feature-marker table; add both six-active steps rather than choosing one15-step side.

## Verification required on the real merged successor

Render the authored main/Functions/Training guides with the existing Marked18.2 tool, ensure `night-sweep/README.md` and `docs/NightSweep_1.8_Alpha_README.md` are identical, then run `python3 night-sweep/build.py` and `python3 build-pwa.py`. Rebuild all outputs/dist on generated conflicts; never hand-merge HTML/worker/release bytes. Verify source module tokens/panels, all45 actual feature destinations and unique marker/anchor IDs, all actual exercise counts and merged registry stores/groups/labels.

Run each feature's focused source/frozen/rendered tests on the **actual combined source**, including partial-time blur/navigation restoration, independent sweep/balance dates and saved-job library purity, native original/portable remap/context-hash await invalidation, and warm saved-Station reload. Then required full gate/separate layout/smoke at the exact final head with source/generated/staged/README/lock cleanliness proof. Counts from individual branches must not be added and reported as a completed combined test run. Both lanes still owe D3 on finalbuild3; no emulator/device/field verification is implied.

## No-change proof and limits

Before/after HEAD, all refs, semantic staged-entry SHA256 and empty porcelain status matched exactly. Snapshots `/tmp/carpe-integration-inventory-{before,after}.json`. Main checkout remains build3 at5588a49. No build, app execution, whole/focused test suite, dependency installation, source/index/ref mutation, private-file read, GitHub write, child agent, APK or deployment occurred. The three merge-tree results are conflict inventories, not approved combined trees or source to commit. No merge recommendation replaces Lane B's required independent review.
