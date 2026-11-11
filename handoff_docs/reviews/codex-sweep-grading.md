# A4: native sweep import and technician grading aid

Lane A, November 11, 2026. Draft review handoff into `build3`.

Preparation started at `4350abcf5a33dce911361a357df891abe6a386ad`; the independently checked core was frozen at `8d1a0edc3b1a5ea5101d5e17cd315de809be64b1`. The feature integrates published build3 `79b0735c6face341d1a78a098a2303f4bdf6fc96`. Final tested application/source is **`16634625836a7d4f9f4e908df323d2c9b5a239f7`**. Subsequent handoff commits change only review/status/receipt metadata. The exact ending handoff commit is the PR head; this avoids inventing a self-referential commit hash inside its own content.

## Behavior and files

- `night-sweep/evidence.js`, new `evidence-archive.js`, and `evidence-ui.js`: recognize the two inspected typed JSON sweep layouts, plain/gzip/single-JSON ZIP input, bounded decompression and CRC validation. Retain and checksum the exact original; unsupported or ambiguous content stays attached with a reason. No backup JSON is executed as state through this path. Original verification/reparse, optional native metadata and exact old-ID-to-new-ID portable restore mapping are additive.
- New `sweep-grading.js` and `sweep-grading-ui.js`: Job → ONX files → Sweep grading aid uses exact sampled endpoints, raw max-minus-min PTV, explicit level targets and signed tilt. Four independent plant/direction company profiles start blank. Relative dB cannot establish absolute level. Missing criteria stay unknown; an established failure is not hidden by another unknown check. No reference subtraction, detrending, automatic acceptance, balance/sweep date or company default is introduced.
- `app.js`, `jobs.js`, `thresholds.js`: validate and retain optional immutable history, observe meaningful saved-context changes during asynchronous original verification, and register 32 company entries plus three software resource guards. Saved snapshots remain historical after import or context/profile/file changes; only explicit fresh verification can establish Current. Existing storage keys, version and job contract remain unchanged apart from optional additive fields.
- `build.py`, `shell.html`, `workflow.js`: register the modules and phone UI. `training.js`, main README copies, Functions guide, feature status/update-log entries and rebuilt `outputs/`/`dist/` cover the feature. No Station module was copied from PR #8; existing job/hardware/record context works independently.
- Four new QA suites and invented JSON/archive fixtures cover arithmetic, typed formats, archive limits, stale-result races, exact original retention, backup identity remap and 320–430 px rendering. Python Decimal references, fixture generator and source notes are under `research/build3/` and `qa/fixtures/viavi-synthetic/`.

## Sources and interpretation

The owner's two supplied formats were inspected locally to verify technical fields/units, not inferred from filename or generic vendor conventions. No original export, identifier, real measurement value or original checksum is committed. All fixtures are generated from invented data. [VIAVI format scope](../../research/build3/VIAVI_NATIVE_FORMATS.md) identifies the accepted technical structures and conservative unknowns. Both supplied traces are raw unreferenced absolute dBmV; an empty referenced trace is never a zero or pass. Direction remains unknown unless the typed chart establishes it. User selection is an explicit assertion, not a recovered vendor fact. Native limits, TPC, status and axis bounds do not become company acceptance or correction rules.

[Core calculation notes](../../research/build3/SWEEP_GRADING_CORE_NOTES.md) and the independent Python Decimal reference document units, signs, exact coverage and numeric representation. The external arithmetic cross-check is separately attributed in the reference JSON. No new plant tolerance or measurement plane is invented. Browser stream behavior and Python-generated ZIP/CRC structures were checked independently of the JS decoder.

## Actual verification and attribution

The Lane A implementation agent ran these exact final commands at frozen source `1663462`; these are local execution results, separate from the independent review and the coordinator's private-file proof:

```sh
NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py
```

- Full gate: **67/67 suites, 1,359 checks**, 344.1 seconds, exit 0. Build and worktree unchanged; clean without restoring evidence. Grading UI **30** and configured-phone grading **47** checks are included in 1,359.
- Separate existing rendered Chromium checks: layout **141**, smoke **331**, both exit 0. These are desktop browser viewport checks.
- `python3 night-sweep/build.py`, `python3 build-pwa.py`, `git diff --check`, main README-copy comparison and guide rendering passed before the freeze. Final standalone SHA-256: `9d459ee512f963b6c56d7de9a392efc5dff8c16d696c78d36554104608ef50a6`.
- Coordinator separately used the actual file picker in incognito Chromium at 390 px, blocked every non-loopback page request, independently decoded both local originals and compared **every raw sample pair**. Actual compressed bytes survived portable export, evidence-ID-remapped restore and re-export exactly; no automatic grade or criteria appeared. Only sanitized booleans enter [the validation receipt](../lanes/codex-a4-validation.json); no private source content is published.
- Independent core/native/UI reviews closed the identified Important defects. A fresh whole-branch reviewer ran five synthetic cross-module probes and read-only assembly/hash checks at the frozen head; [full independent report](codex-sweep-grading-final-review.md) approves scope/quality with the two Minor findings below. This is internal technical review, not Lane B approval or permission to self-merge.

Earlier broad green runs were superseded by narrow red/green fixes for failed-original freshness, away-and-back context edits, actual Add/Remove mutations, saved-criteria overflow and large valid contexts. Their counts are not substituted for the final receipt. Immutable history, original SHA failure, duplicate-SHA identity remap, all blank profiles, exact markers and raw 1/2.5/4 dB PTV at an entered 3 dB limit have direct regressions.

## Remaining limitations

1. **Minor, archive compatibility:** an unsigned ZIP data descriptor whose CRC equals the optional signature `0x08074b50` is safely rejected. Independent Python `zipfile` confirms the synthetic archive is valid. The app retains/exports/restores its original bytes exactly and blocks grading; no wrong grade or data loss results.
2. **Minor, warning wording:** a skipped empty chart with conflicting direction can contribute an unknown-direction warning even when the selected nonempty chart has correct direction. Samples and actual direction enforcement remain correct; an opposite direction cannot be graded.

Other unsupported schemas, multiple nonempty candidate traces or missing platform decompression remain attachment-only with a reason. Raw sampled PTV is not continuous-band normalized ripple or official acceptance. Measurement plane/reference, meter operation, physical Android/iPhone/Safari/WebView, emulator, hardware/field acceptance and native device export/share are untested. No APK, signing, version change or deployment occurred.

## Next

Lane B reviews this exact draft head and runs its own gate before merging. Lane A cannot merge this PR. PR #8 Station fixes and its peer merge remain the dependency for A2 night log, A3 sweep-due and later queued station-based items. D1–D5 remain open.
