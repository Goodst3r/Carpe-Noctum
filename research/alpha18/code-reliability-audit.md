# NightSweep 1.8 Alpha reliability audit

Date: November 11, 2026. Scope: supplied Build 22 working tree, with root-agent integration into 1.8 Alpha. Synthetic data only.

## Confirmed and repaired

### Imported identifier overflow could produce a project that could not reopen

Route and power IDs previously accepted arbitrary digit strings. A suffix beyond JavaScript's safe integer range could round or become Infinity. Adding route/power rows or keeping a power what-if then generated duplicate or invalid IDs such as `rInfinity` and `pInfinity`.

`app.js` now rejects unsafe imported numeric ID suffixes before replacing the working state. Fresh IDs remain safe and unique at the largest accepted integer boundary. The fallback also reserves missing parent references, so allocating a new row cannot silently reconnect a disconnected branch. The power what-if path has the same safe fallback. Ordinary legacy IDs and the three-tap sample remain supported.

Reproduction and regression: `qa/import-id-boundaries.test.cjs` (6 grouped checks), `import-id-red.log`, and `import-id-green.log`. The red run failed because the former import validator accepted the unsafe ID. Context7/MDN documentation independently confirms the safe-integer boundary; tool output is retained in `import-id-context7.json`.

### Rejected Android build candidates appeared in the release directory

The original Android build wrote signed candidate APKs and partial verification receipts directly into `dist`. Compilation/manifest/provider/signature/embedded-HTML failures could leave a rejected candidate beside a previous success receipt.

`android-build/build.py` now stages APKs and receipts in a disposable candidate directory and copies them to the release directory only after all validations succeed. Failed candidates preserve any prior validated release. The restored `qa/android-preview.test.py` exercises standard/Preview source staging, release identity, hash rejection and compile/verification failures using synthetic SDK command results.

Evidence: `native-audit/build-failure-reproduction.json` and `native-audit/verification.json`. Thirteen negative subcases failed before repair; all 11 grouped Python checks pass afterward. These tests do not build or sign a real APK.

## Reviewed protections retained

- Evidence CSV decoding requires explicit units, complete finite numbers, valid frequency ranges, unique frequencies and consistent channel/series rows. Unknown native schemas remain original attachments.
- Evidence imports enforce byte/count/total limits, exact SHA-256 and byte counts, rebuild derived previews, assign collision-safe local attachment IDs and wait for IndexedDB transaction completion.
- Batch failures roll back originals before attachment metadata is published; missing/tampered originals block portable exports. Named-job corruption blocks cleanup conservatively.
- Named-job switches validate candidates before preservation/replacement. Full libraries reject additions without overwriting existing or working jobs.
- Browser file sharing distinguishes ready/shared/cancelled/download-requested states and retains bytes for retries. Unsafe filename markup renders as text.
- Native static review covered the private read-only picker provider, canonical URI paths, per-file/count/total limits, callback cleanup, bridge size limits, external-link gestures and offline-only WebView configuration. No new native behavior was needed.

## Executed targeted verification

| Command | Result | Scope |
| --- | --- | --- |
| `node qa/import-id-boundaries.test.cjs` | 6 checks passed | Current source assembled in jsdom |
| `node qa/named-jobs-storage.test.cjs` | 5 grouped checks passed | Current source, jsdom/fake-indexeddb |
| `node qa/evidence-ui.test.cjs` | 28 checks passed | Current source, synthetic evidence/storage |
| `node qa/evidence-storage-failures.test.cjs` | 13 tests passed | Current source, synthetic storage faults |
| `node qa/alpha17-report.test.cjs` | 11 checks passed | Current report module |
| `python3 qa/android-preview.test.py` | 11 grouped checks passed | Production Python orchestration, mocked SDK commands |
| `node --check` on changed JS and new import test | Passed | JavaScript syntax |

The browser export suite passed all 23 baseline checks before source changes. Its intermediate rerun encountered the expected 1.8 filename against the still-generated 1.7 HTML. The root release runner rebuilds the standalone/PWA artifacts and reruns the integrated suites; use its final report for release-wide counts.

## Limits

This audit establishes the reviewed source behavior and synthetic regressions. It does not claim every branch/function was executed, actual storage exhaustion, Android SDK compilation/signing, physical device installation/upgrade retention, OS picker/share/print behavior, Safari/Home Screen storage retention, or field RF acceptance. Signing keys were not present in the handoff and no replacement key was generated. No upstream publication or external job/evidence transfer occurred.
