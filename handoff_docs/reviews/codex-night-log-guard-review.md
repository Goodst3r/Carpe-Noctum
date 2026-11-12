# Independent A2 application-guard and Leakage-integration review

Reviewer: `/root/review_a2_night_log`, November 11, 2026 UTC. Read-only review; synthetic data only.

**Specification verdict: PASS for this scoped follow-up at `b0d1643b9d423756ea5e9e14d321bdcb9523ba1b`.** The existing 200-entry bound now has the requested Unknown application-guard registry/source presentation, without changing the cap, persisted log, capture, exports or import semantics. The ordinary merge retains reviewed Leakage registration and published feature 42, with Night log appended as feature 43. No open Critical, Important or Minor finding was identified in this delta.

**Code-quality verdict: PASS for this scope.** The cap row is additive, bounded and explicitly a software guard; the source button uses the existing registry mechanism outside labels. All reviewed merged-base threshold rows remain unchanged. Shared registration, source groups/stores, navigation, training controls and guide anchors remain consistent. No new dependency, RF formula, company target, package/version/storage identity or saved-data format is introduced by the cap follow-up.

This clears the scoped delta review for the parent to schedule its serial final gate. It does not replace that gate or authorize publication/merge.

## Exact scope and source

- Starting published A2 source: `c385bb0bea05b20e99b500f762d20f9116e87eac`; cap checkpoint: `cd6d9091a2a89b58b807cc0e6ae113685cc8eb2a`.
- Final reviewed source: `b0d1643b9d423756ea5e9e14d321bdcb9523ba1b`, including ordinary merge `2eae39ab438f40eb3a6a57bec800edbd32c770e8` of exact reviewed build3 `5588a49b10292bed422b7597ec227bce38173a2d` and the append/order correction.
- Detached review worktree: `/workspace/carpe-a2-review`. The author worktree was read only. Both were at final `b0d1643` and clean in the final status checks.
- Final standalone SHA-256: `348ea3647bbdb9497b7dc5e1827eb054c4f460319321af2c7040f54cade509d1`.
- PWA index SHA-256: `b24fd4ae2a311fe2297616d9c859545869f26c87eed79ebf56d5aa0c56733605`; content version `8c13bff1348b74b7a6ab`.

Read `/tmp/carpe-a2-guard-followup.md`, `/tmp/carpe-a2-guard-final.json` and `/tmp/carpe-a2-guard-devtools.json` first. Reviewed `c385bb0..b0d1643`, isolated `c385bb0..cd6d909` guard changes, the shared `cd6d909..b0d1643` integration and `5588a49..b0d1643` registry delta. Applicable project instructions are unchanged from the earlier review. No author source/metadata, GitHub, private-file, dependency-install or child-agent action was taken.

## Evidence and findings

No actionable finding remains. Concrete evidence:

- `night-sweep/thresholds.js:56` adds `nightLog.entries.max`, label `unknown`, verification `unverified`, value 200, units `entries/job`, with application source, build-3 revision, validate/Add locators, checked date and explicit non-RF/non-company conditions. It has no persistence store. `:251` adds the Night log application guards group while retaining Station, DOCSIS and Leakage groups/stores. Independent runtime comparison proved that removing this new row leaves every registry row exactly equal to reviewed `5588a49`.
- `night-sweep/night-log.js:98` is the only module behavior-source difference from published `c385bb0`: it places `Thresholds.tag('nightLog.entries.max')` beside Recorded entries in a section header, outside every input label. Validation/Add count checks remain at their previous 200 boundaries. The final module is byte-identical to cap checkpoint `cd6d909`; capture, frozen history, formats and persistence functions did not change.
- Own actual Chromium 390×844 probe measured the source button **83.3125×44 px**, outside labels. It opened the correct Unknown/200 entries/job sheet with software-only conditions, returned focus on close, created no optional log, made **zero storage writes**, preserved the complete owner and existing storage, and produced no horizontal overflow or console errors.
- Own boundary check added exactly 200 entries to a separate synthetic owner and validated a 200-entry imported log. Add 201 and full `loadState` import 201 both rejected with count errors; the external owner, working owner and storage stayed unchanged after rejection.
- Shared shell/build/init/visibility registrations retain Station, DOCSIS, Leakage and Night log. The incoming `leakage.js` is byte-identical to reviewed `5588a49`. Own runtime checks found **26 screens / 43 features / AOI 15 steps / custom 12 steps**, preserved all 42 merged-base feature choices in their exact order, kept Leakage at 42 and appended Night log at 43. Both practice choices opened their actual registered controls.
- `docs/NightSweep_1.8_Alpha_Functions_README.md:706`/`:707` retain Leakage 42 and Night log 43, with exactly 43 unique feature markers matching source IDs. Its header/TOC/counts and affected Training Coverage/main guide prose agree. Main Markdown copies remain byte-identical. All six affected authored/public rendered guide pages have unique IDs and valid internal fragment links.
- A read-only reconstruction using the exact Python builder serialization matched the frozen standalone byte for byte. The current worker's hashes match all **20** bundled asset files. `git diff --check c385bb0 b0d1643` passed; review and author worktrees remained clean.

## Own executed checks

These are this reviewer's new results, distinct from the author's receipts:

| Command | Result |
| --- | --- |
| `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a2-guard-review.cjs` | **5 independent runtime delta groups passed**, exit 0: additive registry identity, pure source/list behavior, exact Add/import boundaries, merged ordering/counts/module identities, actual feature control opening. Receipt `/tmp/carpe-a2-guard-review-runtime.json`. |
| `python3 /tmp/carpe-a2-guard-review-docs.py` | **6 independent guide/build groups passed**, exit 0: feature markers/order/counts, affected guide copy/cap language, all six rendered TOCs, exact frozen reconstruction, all 20 cache hashes, final clean source. Receipt `/tmp/carpe-a2-guard-review-docs.json`. |
| `python3 /tmp/carpe-a2-guard-review-devtools.py` | **1 focused actual Chrome DevTools MCP group passed**, exit 0, at 390×844. Receipt `/tmp/carpe-a2-guard-review-devtools.json`; exact hash above. New isolated local Chromium, no existing browser profile. Tools invoked: new_page, list_pages, emulate, evaluate_script, list_console_messages. Browser/server closed. |
| `git diff --check c385bb0 b0d1643`; main README `cmp`; final head/status/hash reads | Passed/clean; no generated file was rewritten. |

Two initial scratch-harness assertions were corrected to use the existing `WorkflowUI.current()` function and the sheet's existing Unknown/Not verified wording. The final commands above exited 0; neither harness mismatch was an application finding.

The author's final 14/14/6/6/6 suite results and eight width/palette DevTools groups were read as supporting receipts, not claimed as this reviewer's execution. I also opened and visually inspected the author's final synthetic source-sheet screenshot at `/workspace/.tools/chrome-devtools/checks/night-log-guard-390.png`; my separate actual probe independently confirmed the important button/sheet/purity behavior.

## Preserved evidence and limits

The previous full feature/capture/history/CSV/original-byte/browser review remains in `/tmp/carpe-a2-review.md`, with its original `57bea9d` behavior evidence and `3372403` documentation-only correction attribution. Those results were **not rerun or relabeled as current execution**. This follow-up changes only the cap presentation in Night-log source and integrates already-reviewed Leakage; unrelated Leakage math/domain behavior was not re-reviewed here.

No broad `qa/run-pwa.py`, whole layout/smoke run, complete Night-log/Leakage behavioral suite, build-writing command, private input, APK/signing, emulator, physical Android/iPhone, Safari/WebView, native file dialog, meter/reference-plane or field verification was performed. The parent owns the first serial same-head broad gate and publication. This report claims only the scoped source/registry/integration/doc and desktop Chromium checks actually executed above.
