# A4 optional Station context correction — scoped review

Review date: 2026-11-11 UTC.

Reviewed frozen head **`04bb5ae6ef3568990076bd2e1789e8351ad92337`**, against published metadata head `1cc142281d027f23ef6e4e36c518394677fb0166`, in `/workspace/carpe-grading-ui`. The worktree was clean and remained at that head. This is a scoped review of the subsequently identified optional Station saved-shape defect; the earlier `1663462` whole-branch review is historical and missed that field mismatch.

## Verdict

**Original Station-context finding: ADDRESSED. Scoped specification verdict: APPROVE. Scoped quality verdict: APPROVE. No new Critical, Important or Minor finding in this correction.**

The frozen fix is suitable for the coordinator's next exact-head full gate. This review does not claim that gate has run or authorize merging PR #14. The existing two nonblocking native-parser Minor findings and other previously documented scope/device limitations are unchanged.

## Correction and actual schema

The only production-source change is `night-sweep/sweep-grading-ui.js:36–37`: the compact context now snapshots `state.stationView?.stations || null`, with a comment distinguishing saved data from the computed `StationView.records()` API. The persisted snapshot key remains `stationRecords`; no job version, storage key, record migration, arithmetic or parser change is introduced.

I read exact PR #8 source at `895503be5342dc4a713455cd7098aa5cdd08bb68:night-sweep/station.js`. Its `validate()` accepts the optional `{selected, stations}` object, `data()` reads that shape, `stored()` binds a record through `holder.stationIdentity`, and `persist()` replaces `owner.stationView` with a new object before calling the existing global `saveLocal()`. `records()` computes output from saved records; it is not a stored property. The corrected read therefore captures the actual optional data without registering, copying or calling StationView in production A4.

The existing `saveLocal()` observation boundary compares serialized meaningful context and advances the monotonic revision. It now sees the real Station map changing, whether a caller mutates an existing record or PR #8 replaces the entire saved object. Consequently current grades are demoted immediately and pending grades cannot survive a change followed by a return to the previous values. The existing unchanged-autosave case remains covered by the passing grading suite.

## Independent execution and behavior

1. **`node qa/sweep-grading-ui.test.cjs` — exit 0, 35 checks passed.** I read the five new regression cases as well as executing the suite. They cover snapshot equality/no Station side effects; seven Before/After/stage/balanced/swept edits through the real save boundary; five WebCrypto-gated changes restored before verification completes; oversized optional Station maps; legacy absence; and immutable saved history. Existing owner/file/profile/hardware/button races and original-verification regressions also passed. This is my fresh focused suite execution, not the author's prior green count.

2. **`node /tmp/carpe-a4-station-context-probe.cjs` — exit 0.** This independent probe reads the exact old and fixed built standalone HTML and injects the unchanged exact PR #8 Station source only into its scratch JSDOM runtime. It executes the real `StationView.validate()`, verifies the invented fixture's actual target equipment context, and proves `currentRecord()` binds the saved fixture. It registers the real Station edit handler and supplies a minimal synthetic input under `#stationPanel`; it does not register PR #8 in A4 or claim full combined Station-panel/UI testing.

   The probe dispatched Before reading edits through that unchanged handler and observed the real `persist()` replacing the saved Station object and calling the existing save boundary. It then gated actual WebCrypto digest, dispatched an edit and return through the same handler, and released verification:

   | Built app | Current after real saved Station edit | Pending grade after edit and return | Prior grading history |
   | --- | --- | --- | --- |
   | Historical `1cc1422` | Incorrectly remained Current | Incorrectly saved | Unchanged |
   | Fixed `04bb5ae` | Historical / Current removed | Rejected with context-changed reason; no append | Unchanged |

   The fixed snapshot contains the exact invented `.stations` map, and grading does not change any Station Before/After/done data. A third compatibility scenario loads an actual old-build grading record whose captured `stationRecords` is null into the fixed app with optional Station data, saves/renders it, and verifies the entire old record remains unchanged and never claims Current.

   Initial scratch attempts stopped during harness setup: Node's default `git show` output buffer was too small for the old standalone, and full PR #8 panel rendering requested source tags intentionally absent from A4. I corrected the scratch output limit and registered its real edit handler with a minimal synthetic field. Those setup failures occurred before the behavior assertions and were not application regressions. The final probe completed all scenarios without app runtime errors.

3. **Read-only generated/source verification — succeeded.** The source, standalone and PWA diffs carry the same optional-slot correction and comment. PWA changes otherwise comprise the generated release/worker version and index hash. A read-only assembly using the actual builder module list matched `outputs/Night_Sweep.html` exactly; standalone SHA-256 is `b19547787e277e6abf5f5c06a80baf85b91f8ef0636349e60ce5bdd4bb4f057a`.

4. **Read-only scope and cleanliness checks — succeeded.** `git diff --exit-code 1cc1422 04bb5ae -- night-sweep/sweep-grading.js night-sweep/evidence.js night-sweep/evidence-ui.js night-sweep/evidence-archive.js` found no change. `git diff --check 1cc1422 04bb5ae` exited 0. Final status was clean and HEAD unchanged.

## Limits and declined findings

- The saved Station collection is captured as raw optional context, not adopted as grading criteria, corrected measurements or acceptance. The regression confirms Station targets never replace the explicit grading profile.
- Existing records with null Station context are retained as recorded. They need no migration; new optional context makes a mismatched historical record stale, and only explicit regrading can create a Current calculation.
- The unchanged 16,000-character compact-context cap can now apply to a large real Station map. The new regression demonstrates readable historical/stale rendering, rejected oversized new grading and unchanged history. This is intentional bounded behavior, not a new unhandled rendering failure.
- A Station display selection alone does not alter the snapshotted collection or bind A4 to the currently displayed station. A4 grades an explicitly selected attachment against its explicit plant/direction profile and captures the collection as job context; no new selected-station semantics or StationView runtime dependency is inferred.
- Legacy jobs without Station data retain no `stationView` property and capture null. The correction does not create Station records on open, grading or autosave.
- Author-reported 47 rendered grading and 6 UI-name checks were read as author evidence and not rerun here. No full gate, private-file probe, RF math/archive expansion, GitHub action, APK/device/field test or combined PR #8 UI gate was performed. Only committed invented fixture data and local source were used; no private original or external call was accessed. Source/index/HEAD/GitHub were not mutated; scratch probes and this report are under `/tmp/`.
