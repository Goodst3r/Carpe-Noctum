# A1 Station native-input retention fix — frozen implementation handoff

Author lane: Lane A implementer. November 11, 2026. This is a focused implementation receipt; root owns independent review, broad gates, GitHub publication and peer merge.

## Exact revisions and artifacts

- Initial base: `14bfc06ff62e000dc624e46d57cf8d4beda98ce0`.
- Clean implementation checkpoint: `ae7b8a8007cb27c761cd335091446a1cd5a891e2`.
- Latest reviewed build3 integrated by ordinary merge: `ccf2f5e05582c89317ef174640f73ed31bdfad16` (Safety/checklist integration, authored by Lane B).
- Frozen final source/merge head: **`bc58b0f376f30b18f87fbac184065265094faf1b`**.
- Branch `codex/station-input-retention`; worktree `/workspace/carpe-station-input`.
- Standalone `outputs/Night_Sweep.html` SHA256: `317c4dbd7f102542136c85e1b719e078c954eafb704a688cde16c99181f962a2`.
- PWA index SHA256: `65f0350ef6ff878ee471c462cc073871b428d44325e832ca8dbd9681cbc4ede4`.
- PWA content version: `e9ef3c6a60822d948342`.
- Station source SHA256: `07f1686ce274344c5b650feec50a72cfd026f1c7144205bbedeb854bb3c5d64a`.
- Station CSS SHA256: `9c4f35e0ae5e66cf051e098701f67ef6db2c0a350f0c3e730d20812a211385b0`.
- Local proof `/tmp/carpe-a1-native-final-proof.json` records all 556 tracked file hashes before/after the final normal rebuild, exact staged entries unchanged, current head/base, clean working tree and identical mirrored README files.

## Defect, correction and retained contracts

Native number and date controls can expose an empty `.value` while `validity.badInput` reports an incomplete edit. The old Station handler immediately persisted that blank. It erased the previously recorded reading/date, changed autosave/export and could turn a forward result unknown while saying it was saved.

The shared editor now refuses only native `badInput`, before persistence and before the existing date change-only filter. It retains the last successfully committed raw entry, stage timestamp, independent balance/sweep flags and dates, autosave and portable export. Invalid first entry does not create a worksheet or binding. Each numeric/date field has a nearby named live error, `aria-invalid`/`aria-errormessage`, and a double border, so the error does not rely on color.

A touched native draft is transient and tied to the actual owner, target key, saved binding identity/context, stage and element/field. On actual focusout or explicit Station navigation, an incomplete value restores the current recorded raw entry; context changes discard the draft without writing it elsewhere. Explicit navigation reconciles before the unchanged render-signature early return. Error/restoration messages do not leak into a replacement owner/target/binding. Valid numeric edits retain immediate saves; dates retain change semantics. A touched date that has been completely cleared is reconciled on focusout because native segmented controls can finish clearing without emitting another input/change event. Untouched imported invalid raw text can render as blank and is never rewritten merely by focus/blur or navigation.

Intentional complete numeric/date clears still store blank unknown. Zero remains zero (`??` is used), latest valid intermediate values win, and syntactically valid range errors retain their existing raw storage and math reasons. No generic `validity.valid` check was added. Strict math, parsers, company defaults, measurement planes, saved schema/keys/version/package identity and separate 42/54 vs 204/258 workflows are unchanged. No new RF formula, limit or guard was introduced.

## Changed files relative to current build3 ccf2f5e

- `night-sweep/station.js`: narrow shared native guard, transient context/touched state, reconciliation, named accessible feedback. No StationMath change.
- `night-sweep/station.css`: Station-scoped wrapping and noncolor invalid border only.
- `night-sweep/workflow.js`: calls `StationView.render(true)` on explicit Station entry so an unchanged cached panel reconciles drafts.
- `qa/build3-station-native.test.cjs`: 13 behavioral groups for actual handlers/state/autosave/export. jsdom supplies only the missing platform `badInput` bit; browser keys are exercised separately.
- `qa/build3-station-native-layout.test.py`: real Chromium keyboard editing at 320, 360, 390 and 430 px, including date-segment clearing/focus departure.
- `qa/run-pwa.py`: registers both new focused suites, retaining the new Safety/checklist suites.
- `night-sweep/training.js`: only the two existing Station step descriptions gain an incomplete-entry/intentional-clear practice instruction; no new steps or count changes from this fix.
- `night-sweep/README.md`, `docs/NightSweep_1.8_Alpha_README.md`, `docs/NightSweep_1.8_Alpha_Functions_README.md`: scoped Station behavior paragraph only. Mirrored main READMEs remain identical.
- Corresponding main/functions guide HTML, `outputs/Night_Sweep.html`, `dist/guide.html`, `dist/functions-guide.html`, `dist/index.html`, `dist/release.json`, and renamed hashed worker: regenerated using normal tools. The Safety merge's other files are inherited unchanged; no new Lane B source fix was authored.

The ordinary merge conflicted only in generated index/release/worker entries; generated output was rebuilt rather than hand-merged. Automatic source merges preserve Safety modules, application-guard registry, source tags, workflow tabs, training and runner registration. Net diff from current build3 is confined to the Station files above and their generated artifacts. The earlier base lacks the later A2 Known Gaps note, so no nonexistent gap was removed. Root will reconcile status/gap metadata at publication.

## RED and GREEN evidence, including unsuccessful attempts

- Sibling independent baseline report `/tmp/carpe-a1-native-input-repro.md` records actual Chrome DevTools MCP numeric32/date7 assertions at baseline14bfc06/e960 app. Those are sibling baseline observations, not this author's corrected-head acceptance results.
- Own source RED `/tmp/carpe-a1-native-source-red.log`: exit1; original saved reading36.4 was replaced by blank. Repeated done=true fixture RED `/tmp/carpe-a1-native-source-red-done.log` also failed the expected state comparison. Both preceded production correction.
- Own real browser RED `/tmp/carpe-a1-native-browser-red.log`: exit1 at the actual320px minus preservation check, after confirming native badInput.
- Initial GREEN attempt `/tmp/carpe-a1-native-source-green.log`: first4 groups passed, then zero/intermediate test failed because the fake jsdom validity property did not automatically reset on a valid assignment. The test helper was corrected to delete that temporary own property when simulating a valid edit; production logic was not changed to satisfy this harness artifact.
- Then pre-base source11 groups and browser89 passed. Later added target/binding groups yielded13 source/frozen, existing22/review11/names6/native89/layout121 on the pre-Safety-merge source; these are historical pre-merge results, not carried forward.
- Final transient-message assertion RED `/tmp/carpe-a1-native-message-red.log`: exit1 after8 groups; owner replacement correctly retained data but displayed the previous owner's error. The narrow transient-message flag corrected this; `/tmp/carpe-a1-native-message-green.log` then passed13 groups before the clean checkpoint.
- Final merged-head results below are fresh executions at bc58b0f, including that message correction and current Safety base.

## Exact final commands and own results at bc58b0f

| Command | Result | Raw log |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` | exit0, 13 behavioral groups | `/tmp/carpe-a1-native-ccf-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` | exit0, 13 behavioral groups against frozen standalone output | `/tmp/carpe-a1-native-ccf-frozen.log` |
| `node qa/build3-station.test.cjs` | exit0, 22 checks | `/tmp/carpe-a1-native-ccf-station.log` |
| `node qa/build3-station-review.test.cjs` | exit0, 11 tests, zero failures | `/tmp/carpe-a1-native-ccf-station-review.log` |
| `node qa/ui-names.test.cjs` | exit0, 6 checks | `/tmp/carpe-a1-native-ccf-names.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-station-native-layout.test.py` | exit0, 89 checks, 320/360/390/430 | `/tmp/carpe-a1-native-ccf-browser.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-station-layout.test.py` | exit0, 121 checks, 320/360/390/430 | `/tmp/carpe-a1-native-ccf-old-layout.log` |

Node and rendered queues each used `set -e` and returned exit0. New state invariance fixtures explicitly have BOTH balance.done and sweep.done true and separate exact dates. They assert both unchanged on incomplete edits, intentional date clear keeps both flags and the other date, numeric '0', latest committed intermediate numeric value, all-empty intentional clear, first-entry absence, untouched imported hidden invalid data, owner/target/source binding/stage changes, and legacy UBT forged-event refusal. Tests use synthetic data only.

Guide render commands used existing Marked18.2 scratch runtime, with no dependency installation:

```
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_README.md NightSweep_1.8_Alpha_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exited0. The final normal rebuild repeated the last two commands and reproduced every tracked byte and PWA version; `/tmp/carpe-a1-native-rebuild.log` and the proof JSON retain that result. `git diff --check origin/build3...HEAD`, `node --check night-sweep/station.js`, `node --check qa/build3-station-native.test.cjs`, and `python3 -m py_compile qa/build3-station-native-layout.test.py` each exited0. Working tree is clean; no test churn needed restoration.

## Sources and tool use

- Authorized A1 plan, AGENTS, automatic/development policies, build notes, exact source/editor contracts and `research/build3/STATION_VIEW_SOURCES.md`.
- Latest own status read directly at9b77213; source checkout's B status also read. Status contains historical results only, not counted here.
- Context7 actually resolved MDN Web Docs `/mdn/content` and queried native badInput and focusout behavior. Official references: https://developer.mozilla.org/en-US/docs/Web/API/ValidityState/badInput and https://developer.mozilla.org/en-US/docs/Web/API/Element/focusout_event . badInput means a user-supplied value cannot be converted; focusout bubbles, enabling the existing delegated editor.
- Superpowers TDD/systematic debugging/test guidance/verification-before-completion; local Git, Node, Python, actual Playwright Chromium. No corrected-head Chrome DevTools MCP claim by this author; the sibling used it for the baseline.
- Existing locked QA dependencies were reused by an ignored local symlink; no install, lock edit or dependency upgrade. No private meter file was read, copied or committed for this A1 task.

## Untested and next

No full qa/run-pwa.py, whole build3-layout, browser-smoke, emulator, physical phone, Safari, Android WebView, screen reader, real mobile keyboard/touch/rotation, RF hardware or field validation by this implementer. Desktop Chromium uses controlled focus/scroll and en-US segmented dates;89 checks do not certify device behavior or every locale. No benchmark/performance improvement claim; duplicate editor context lookup was avoided without caching measurements/results.

Next: root independently review frozen bc58b0f, run the broad gates at the same source head, publish the draft PR and source/status/review receipt, then obtain Lane B review/merge. Do not self-merge. Future A2/A3/A4 merges must preserve Station render(true) and the existing A4 boundRecords API together; this branch was intentionally built on current build3 and does not copy unmerged modules.
