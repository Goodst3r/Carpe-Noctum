# Independent A1 native-input fix review

Verdict: **PASS for the scoped Station native-input correction. No unresolved review finding.** This is an independent focused review, not a full release gate or permission to self-merge.

## Frozen source and review boundary

- Reviewed head: `bc58b0f376f30b18f87fbac184065265094faf1b` (`codex/station-input-retention`).
- Starting comparison/base: `ccf2f5e05582c89317ef174640f73ed31bdfad16` (current reviewed build3 Safety base), ordinarily merged into the implementation checkpoint `ae7b8a8007cb27c761cd335091446a1cd5a891e2`.
- Independent detached worktree: `/workspace/carpe-a1-native-fix-review`; author's `/workspace/carpe-station-input` was not modified.
- Standalone SHA256: `317c4dbd7f102542136c85e1b719e078c954eafb704a688cde16c99181f962a2`.
- PWA index SHA256: `65f0350ef6ff878ee471c462cc073871b428d44325e832ca8dbd9681cbc4ede4`; content version `e9ef3c6a60822d948342`.
- Station source SHA256: `07f1686ce274344c5b650feec50a72cfd026f1c7144205bbedeb854bb3c5d64a`.

Read the complete `ccf2f5e..bc58b0f` diff (18 files), the author receipt `/tmp/carpe-a1-native-input-fix.md`, and the original independent `/tmp/carpe-a1-native-input-repro.md`. The original receipt contains 32 diagnostic assertions plus a fresh seven-assertion date follow-up against the bad baseline; those diagnosed data loss and are not acceptance counts for this head.

## Specification and code assessment

The fix rejects native `badInput` before persistence, retaining committed raw data while a number or date control contains an incomplete entry. Transient drafts are tied to the owning job, current Station target, source binding, and edit stage; stale events cannot reconcile a draft into another record. Reconciliation runs before a cached Station render returns. Explicit Station navigation forces reconciliation before reusing rendered controls.

Both Balance and Sweep dates preserve their independent `done` facts and recorded dates during partial native edits. Touched-date focusout handles Chromium's complete date clear when the last part disappears without a final input/change event. Untouched hidden invalid imported raw values are outside this draft path and are retained exactly.

Named adjacent feedback supplies `aria-invalid`, an associated error description, a polite live status, and visible noncolor marking. The transient global message is cleared when its owner/context changes. Last-committed restoration reads the current saved slot rather than assuming the value at first rejection is still current.

The scope stays narrow: no persisted draft keys, storage schema, numeric range policy, plant limits, thresholds, math, equipment policy, package/version, or job-format changes. The StationMath prefix is byte-identical to the base. Core `app.js`, `jobs.js`, `engine.js`, `alignment.js`, `thresholds.js`, `catalog.json`, `evidence.js`, and `evidence-ui.js` have no diff from the base. Completed out-of-range raw numbers remain stored according to existing policy, with the existing math-unavailable reasons.

Files changed by the author: `station.js` implements the guarded draft lifecycle; `station.css` adds associated feedback styling; `workflow.js` reconciles on explicit Station navigation; `training.js` and the main/functions guides explain incomplete input and intentional clearing. Focused QA and runner registrations cover the behavior. Standalone/PWA/generated guides and service-worker metadata reflect the build. No reviewer source or tracked-file edits were made.

## Independently executed automated checks

Commands below ran from the detached review worktree using the existing shared dependency installation through an ignored link. No dependency install was performed. Every command exited zero.

| Command | Own result | Receipt |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` | 13 source groups passed | `/tmp/carpe-a1-native-fix-scoped-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` | 13 frozen groups passed | `/tmp/carpe-a1-native-fix-scoped-frozen.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs` | 22 retained Station checks passed | `/tmp/carpe-a1-native-fix-scoped-station.log` |
| `node qa/ui-names.test.cjs` | 6 checks passed | `/tmp/carpe-a1-native-fix-scoped-names.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a1-native-fix-scoped-independent.cjs` | 8 independent adversarial groups passed, including all 16 numeric slots | `/tmp/carpe-a1-native-fix-scoped-independent.log` |

The eight independent adversarial groups verified:

1. All 16 native numeric input slots refuse incomplete input/change/blur, retain the entire job and autosave, and restore the exact committed raw value.
2. Invalid first number or either date creates no initial worksheet or autosave, including deliberate completion to empty when originally unknown.
3. Restoration reads the latest committed raw slot if it changed while the rejected draft existed.
4. A stale attached control cannot save into an equal-shaped replacement job owner; the old global error clears.
5. Detached stale valid events cannot cross a stage or target switch into a different slot.
6. Untouched imported raw `+19`, ` 19`, `19.`, `0x10`, `1e309`, invalid Balance `2026-02-30`, and invalid Sweep `bad date` survive focus/blur/navigation/export exactly.
7. Legacy-unconfirmed and UBT refuse forged input events even after the test removes the DOM disabled flag.
8. Existing completed range-error and signed-number policy is preserved: measured 201 and insertion loss −1 retain raw data with existing math-unavailable reasons; return EQ −2.5 remains accepted; explicit zero survives a subsequent incomplete draft.

The Node native-input checks supply jsdom's missing native `validity.badInput` signal. Actual Chromium behavior was tested separately below, rather than inferred from those simulated validity bits.

## Independently executed rendered Chromium checks

`python3 /tmp/carpe-a1-native-fix-scoped-mcp.py` passed **51/51** focused assertions through actual Chrome DevTools MCP 1.13.0 and sandboxed Chromium, with synthetic local-only fixtures, at 320 and 390 CSS-pixel phone widths (844 high, mobile/touch emulation). Stats/CrUX was disabled. Receipts: `/tmp/carpe-a1-native-fix-scoped-mcp.log` and `.json`.

Critical native paths used explicit focus and trusted keys:

- A lone minus preserved the complete committed job, autosave, awaited project export, results, and timestamps. Blur restored the recorded reading.
- Zero committed and survived a subsequent rejected prefix and restoration.
- Valid intermediate keys committed 1 then 12; an incomplete exponent was refused. Home-to-Station navigation restored the same cached input before reuse without changing committed state.
- A deliberate complete number clear committed blank.
- **Both dates began with `done=true` and separate dates.** Clearing the month produced empty/badInput but preserved all committed state; blur restored the recorded date. Clearing day and year completed an intentional blank with **no final input/change event**. Actual focus departure committed only the intended blank and retained both done flags and the other date.
- Untouched imported hidden invalid raw survived focus/blur/navigation. No Chromium console errors or phone viewport overflow were found.

`python3 /tmp/carpe-a1-native-fix-scoped-visual.py` passed **2 additional grouped rendered/ARIA assertions** at 390 px. It checked the named Low reading (dBmV) feedback, linked error/description IDs, polite live status, one associated label with no source button inside it, and rendered geometry after explicitly centering the field: 6 px field-to-feedback gap, feedback bottom 574.53 within the 844 px viewport, 50 px control height, double border and solid outline. Receipts: `/tmp/carpe-a1-native-fix-scoped-visual.log` and `.json`. Screenshot and accessibility snapshot were captured at `/workspace/.tools/chrome-devtools/checks/a1-native-fix-error-390.png` and `a1-native-fix-error-390-ax.txt`; this review's visual conclusions above rely on rendered geometry and accessibility properties, not physical-device testing.

These 51+2 checks are this reviewer's own new counts. The author's 89 native Chromium checks at four widths, 121 retained layout checks, review11 and repeated build reproducibility are documented in the author receipt and are not claimed as this reviewer's runs.

## Source-retention proof and limits

`/tmp/carpe-a1-native-fix-scoped-proof.json` records all **556 tracked files** unchanged from the before manifest `/tmp/carpe-a1-native-fix-scoped-before.json`, the exact expected HEAD, a clean working tree, clean staged diff, and the standalone/PWA/source hashes above. `git diff --exit-code`, `git diff --cached --exit-code`, and `git diff --check` passed. The main README pair is byte-identical. No restore operation was needed.

No full runner, rebuild, whole-app layout/smoke, install, physical phone, emulator, Android WebView, Safari, screen-reader session, meter/field exercise, private attachment, APK, GitHub write, commit, or merge was performed by this reviewer. Controlled focus/centering in MCP does not certify automatic scroll or physical tap/keyboard ergonomics. No new formula was introduced. No further critical scoped probe remains; no unresolved finding was identified.

Next: root owns the full gate, draft PR/status evidence, peer review, and integration under the Lane A/B plan. This reviewer remains read-only.
