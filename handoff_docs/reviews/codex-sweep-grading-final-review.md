# Final A4 native import and grading review

Reviewed on 2026-11-11 UTC in `/workspace/carpe-grading-ui`.

- Frozen head: `16634625836a7d4f9f4e908df323d2c9b5a239f7`.
- Published build3 comparison base: `79b0735c6face341d1a78a098a2303f4bdf6fc96`.
- Scope: whole-branch A4 integration, with fresh attention to cross-module contracts and remaining effects. The unchanged arithmetic and closed earlier findings use their prior review evidence rather than another identical broad review.

## Verdict

**Specification verdict: APPROVE in the authorized A4 scope, with the two nonblocking Minor findings below. Quality verdict: APPROVE with the same Minor findings. No Critical or Important finding remains from this review. No final fix wave is required by these findings.**

This is source/integration review approval, not a claim that this reviewer executed the final full gate. The author's exact-head full gate and the coordinator's separately reported private-file browser proof are distinct evidence. Neither is represented below as my own execution. The coordinator owns their final gate/publishing decision.

## Findings and deferred-case triage

### Minor M1 — A valid unsigned ZIP descriptor is rejected when its CRC equals the optional descriptor signature

Location: `night-sweep/evidence-archive.js:102–104`.

The parser treats any first descriptor word equal to `0x08074b50` as an optional signature. A valid **unsigned** descriptor whose actual member CRC is that value consequently gets shifted by four bytes and fails validation.

Fresh reproduction used only the committed invented forward JSON plus a newly constructed four-byte ancillary payload with CRC `0x08074b50`. I built signed and unsigned stored ZIP variants in `/tmp/`. Python standard-library `zipfile` read both entries and verified all CRCs in both variants. The application's signed counterpart parsed; the valid unsigned variant returned attachment-only with `ZIP data descriptor sizes or CRC do not match.`

I then imported the unsigned archive through the real built app's EvidenceUI/IndexedDB path. It stayed attached, did not create grading state automatically, and an explicit grade attempt was rejected without adding a record. Its exact archive bytes survived portable export, prepareImport ID remapping and re-export.

**Severity ruling: Minor, nonblocking compatibility limitation.** It denies a preview for a valid archive, but fails closed: it cannot create an incorrect grade or lose/re-encode the retained original. This is not an integrity bypass and does not invalidate the successful supported-file proof.

Suggested follow-up: when the first word is ambiguous, validate the bounded unsigned and signed descriptor layouts against the central CRC/sizes and record boundaries, accepting the consistent layout. Add an invented CRC/signature-collision regression alongside malformed-descriptor rejection cases. Repro assets: `/tmp/carpe-a4-crc-unsigned.zip` and `/tmp/carpe-a4-crc-signed.zip`.

### Minor M2 — A skipped empty chart can contribute a direction warning that contradicts the selected chart

Location: `night-sweep/evidence.js:123–134`, especially the warning at `:127` before the empty-series skip at `:134`.

Fresh invented reproduction:

1. Start from committed `qa/fixtures/viavi-synthetic/reverse.json`.
2. Set its enclosing test label to `Forward Sweep`.
3. Leave its original chart labeled `Reverse Sweep`, but empty that chart's `Unreferenced.data`.
4. Add a second chart with the original nonempty invented samples and label `Forward Sweep`.

The result correctly selects the only nonempty trace and sets `native.direction = forward`, but also emits `Sweep direction metadata conflicts between the test and chart; direction is unknown.` That warning came from the skipped chart and contradicts the selected direction.

The fresh built-app probe confirmed all selected raw pairs remain exact. Forward grading produced the unchanged raw 2 dB PTV, with blank comparisons unknown; selecting Reverse still hit the native-direction conflict guard and could not append another grade.

**Severity ruling: Minor, nonblocking warning/descriptor consistency defect.** It confuses provenance wording, including the saved warning, but does not choose the wrong trace, change samples or weaken direction enforcement.

Suggested follow-up: retain the conflict flag per chart and emit that chart's warning only when a supported nonempty candidate is added. An empty opposing chart plus a selected agreeing chart should have no unknown-direction conflict warning. Keep the existing nonempty conflict tests.

## Integration and requirement assessment

| Requirement | Evidence and ruling |
| --- | --- |
| Exact originals and SHA | `evidence-ui.js:84–94` hashes/stores the original byte array; `:103–121` re-reads size/SHA before parsing; `:124–164` bundles exact bytes and restores by old evidence ID. Fresh CRC-archive export/restore checks preserve its exact original even when preview is rejected. Compressed private-input proof is coordinator evidence only. |
| Typed JSON/gzip/single-JSON ZIP; conservative interpretation | `evidence.js:58–146` selects only the two typed layouts, rejects mixed envelopes/multiple nonempty traces, requires explicit units/numeric pairs and preserves unknown direction/reference state. `evidence-archive.js:44–137` bounds bytes/entries/output and verifies ZIP structure and all member CRCs. No OCR, source-status acceptance, native-limit defaults, correction or filename-derived direction enters grading. M1/M2 are the remaining bounded defects. |
| Real unchanged math and exact markers | `sweep-grading-ui.js:49–56` feeds freshly verified series to the real core. The arithmetic/core/reference files are byte-unchanged from reviewed `8d1a0ed`; local Git comparison produced no diff. `sweep-grading.js:63–92` requires exact endpoint samples, retains raw sampled extrema and signs, and distinguishes dBmV from dB. The prior independent arithmetic review applies; no fresh formula or physical acceptance claim is added. |
| Four independent blank company profiles | `sweep-grading-ui.js:3–4,30–34,97–100` has four profiles with empty objects, explicit choices and per-profile edits. `thresholds.js:38–44,132` registers/resolves the 32 company entries separately from resource guards and existing local presets. Initial rendering/selection does not call `data()` or persist new grading state. Existing tests cover zero versus blank and profile isolation. |
| Async ownership/profile/file/context safety | `sweep-grading-ui.js:45–57,86–100` captures owner/signature and uses a monotonic revision. Meaningful context is observed at the existing saveLocal boundary; actual field and Add/Remove button mutations cannot disappear by returning to the old value. Unchanged saves remain harmless. Reviewed the real call paths and the actual hash-gated regression source. The prior scoped fix2 review closes this issue; no new bypass was established. |
| Immutable history and honest Current status | `sweep-grading-ui.js:43,57,65,69–89` keeps saved snapshots separate from ephemeral verification/freshness. Missing/size/SHA/parse observations demote Current, recovery requires explicit grading, and record-fingerprint mismatch demotes it. Fresh altered-result import probe confirms that even a valid-shape imported metric of 999 is displayed only as Historical after remapping/state replacement. No untrusted imported result becomes Current automatically. |
| Additive state, backup identities and legacy jobs | `app.js:316,325` validates the optional additive section before replacement and preserves it through existing spread-based loading. `jobs.js:89–95` retains grade-only work. `evidence-ui.js:148–163` builds an exact old-ID→new-ID map; `sweep-grading-ui.js:60` applies that identity map, not a SHA join. Existing duplicate-SHA regression exercises distinct attachments; fresh remap checks also passed. No storage key, schema/version or Android package changes appear in the feature diff. |
| Mobile saved criteria and large contexts | The committed rendered suite now checks configured 320/360/390/430 widths, inner/document widths, all eight saved criterion rows and PNG width, rather than comparing two potentially expanded browser widths. Large valid route contexts remain renderable as historical/stale while new oversized snapshots reject. Prior fixes and author rendered evidence cover this; no physical-phone assertion is made here. |
| B1/B4, help, training and A1 separation | The final source retains the gate infrastructure and real UI-name route integration from the published baseline. Four A4 suites are registered. New modules precede app initialization and source registry creation. Main guide copies are byte-identical. Help/training explain raw PTV, no automatic acceptance/corrections, explicit illustrative entries and original backup. Context capture uses optional data snapshots only and has no StationView API/module dependency. A1 remains a separate draft. |

## Earlier findings and declined judgment cases

The prior core review, native fix1 review and UI fix1/fix2 reviews were read along with their implementation receipts. The mixed-envelope selection defect, opposing test/chart direction defect, failed-original Current badge, field/button away-and-back epoch gaps, saved-criteria mobile overflow, large-context rendering exception and preflight feedback are addressed at this head. The optional direct-JavaScript result-fingerprint and wording improvements are also present. I did not reopen these closed issues merely to repeat unchanged suites.

The following are not new findings:

- Unknown native direction remains unknown; an explicit user direction is an assertion. The adapter does not infer it from the filename or fill it from an unrelated/enclosing label.
- An explicit typed Unreferenced dBmV series with conflicting reference metadata retains raw numbers and an unknown reference state. No reference subtraction or normalized-ripple claim is made. Raw unit-based comparisons plus visible qualifications are the authorized behavior; I found no basis to invent a new automatic reference-correction or acceptance rule.
- Unsupported/ambiguous formats and unavailable browser decompression produce an attached original with a reason. This is intentional conservative behavior; M1 specifically concerns a documented supported descriptor form that is valid yet unnecessarily rejected.
- Imported historical result consistency is not an authentication guarantee. The relevant requirement is to prevent imported/changed results claiming Current verified; the fresh import probe confirms that behavior.
- Stored history is immutable through app actions, not an executable-JavaScript tamper-proof data structure. Direct metaprogramming, hostile accessors/proxies and arbitrary global replacement are outside the JSON-file/UI contract.
- Exact sample markers and sampled PTV do not establish continuous-band ripple, meter correction, measurement plane, physical balance, sweep dates or official acceptance. Those qualifications remain visible.
- No judgment of A1 readiness, physical Android/iPhone/Safari/WebView behavior, native save/share/print, plant acceptance, APK/signing or deployment is implied.

## Checks actually executed by this reviewer

1. Read-only Git/source/diff inspection at the stated head and published base, including instructions/plan, changed adapters/UI/state/registry/build/training/help integration, regression sources, prior reviews and receipts. `git diff --check BASE HEAD` exited 0.
2. A local Python constructor made the two invented CRC/signature-collision ZIP variants in `/tmp/`. Python `zipfile` independently read both members and verified CRCs in both variants; both checks succeeded.
3. `node /tmp/carpe-a4-final-focused-probes.cjs` exited 0: **5 focused checks passed**, no app runtime errors. It covers both deferred-case downstream effects, exact original retention/portable identity remap and altered imported results remaining Historical. It boots the exact frozen `outputs/Night_Sweep.html`, uses the real EvidenceUI/core/SHA/IndexedDB paths and only invented data. These are focused integration checks, not another broad suite or a physical browser/device test.
4. A read-only Python assembly using the actual `build.py` module list matched `outputs/Night_Sweep.html` exactly: 30 registered modules, standalone SHA-256 `9d459ee512f963b6c56d7de9a392efc5dff8c16d696c78d36554104608ef50a6`. It also confirmed the two main Markdown guide copies are byte-identical. No build command or tracked output write was performed.
5. `git diff 8d1a0ed HEAD --` the core and independent reference files produced no diff. Final `git status --porcelain=v1` was empty and HEAD remained `16634625836a7d4f9f4e908df323d2c9b5a239f7`.

The author's identical 67-suite gate and focused suites were not rerun or counted as my tests. The final exact-head gate remains separately owned. Tools used here were local shell/Git, Node/JSDOM/fake IndexedDB/WebCrypto, Python standard library and scoped verification/Data-quality skill guidance. No private attachment, user original or private probe artifact was read; no external call, source/index/HEAD/GitHub mutation or subagent delegation occurred. All review artifacts are under `/tmp/`.
