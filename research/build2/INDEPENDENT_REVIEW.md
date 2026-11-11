# Build 2 independent review

Reviewed November 11, 2026 in `/workspace/NightSweep_1.8_Alpha_build_2`, against the separately retained prior 1.8 workspace. The older workspace was not edited. Application source was not edited by this reviewer.

**Verdict:** no additional material product defect was reproduced in the reviewed changes. The frozen release receipts report **1,066 passing checks across 57 suites** and **322 passing rendered Chromium checks**. The final signed APK passed independent signature, identity, alignment and exact-content verification. The private master candidate passed **53 independent archive checks**, including all file checksums, requested deliverables, signing-backup isolation and quiet verification of the packaged private-key alias/password. No unresolved delivery blocker was found. Root will repack this report and its public receipt, then rerun archive verification against the exact delivered ZIP; no outer ZIP hash is recorded inside itself.

## Changes independently reviewed

### Calculation batching, navigation and print

`workflow.js` limits its frequency cache to one synchronous calculation batch and keys results by the current state object and frequency. Nested render/refresh calls reuse that batch; `finally` releases it, including after a thrown calculation. It wraps the existing meter-corrected evaluator, preserving the remaining test-point correction. No persistent RF cache or schema migration was added.

Hidden sweep-grid work is skipped during refresh, while direct draw, Sweep navigation and print preparation obtain current results. Suppression does not apply to the next visible sweep or print. An independent source-assembled runtime probe changed inputs across the six populated RF examples and compared displayed table/visible-sweep results with a fresh core run using the effective corrected launch. It also checked zero remaining TP correction during print and restoration of the selected Readings task, branch point and project/power child visibility. **21 checks passed**; see [independent-runtime.log](independent-runtime.log). The seventh GS7K starter intentionally has no populated route or verified launch; its unknown state remains qualified in the mathematical replay.

The source feature map still has all **seven exercises, 37 explicit feature controls/guide targets and 20 screens**. Every feature references an existing exercise and a guide step for the same task. The frontend owner's complete-source UI regressions and root's final browser suite provide broader control coverage; this review does not label the map check as execution of every internal code branch.

The bounded cascade is a labelled, keyboard-focusable scroll region. Fresh Chromium checks at 360, 390, 768 and 1280 px reached all nine complete-route buttons, retained page width, exercised keyboard scrolling on mobile-sized viewports and removed the height constraint for print. **55 checks passed.** These are rendered desktop Chromium/emulated viewport checks, not physical-phone accessibility or print-pagination certification.

The performance counters needed an evidence qualification: a wrapper around public `HFC.run` does not count the engine's internal `run` closure calls from `gainBudget`. Independent in-memory body instrumentation observed complete-example refresh counts of **7 public / 11 total core calls**, and six-active counts of **6 public / 18 total core calls**. This was sent to the frontend/root agents. The measured end-to-end refresh timings remain valid; current documentation labels the counter as public calls through the app evaluator and excludes internal closure work. No production-code change was required for this reporting correction.

### Imports, named jobs and originals

The public JSON text entry point now rejects non-text and imports exceeding **20 MiB in UTF-8 bytes** before parsing or changing work. The existing picker-size guard is retained. The fresh focused suite accepted exactly 20 MiB, rejected an oversized multibyte string and rejected non-text without changing the working job, autosave or named library.

The active named-job duplicate now derives both original and copy from current edits and commits them in one library write. If capacity is insufficient, neither saved record changes and current edits remain available. The prior sample-to-plant guard is retained: duplicating the retained sample cannot silently overwrite it with an unconfirmed conversion. The render fingerprint covers displayed metadata, library identity/order/counts and busy state; unchanged list renders preserve action-button identity/focus. Status messages continue to update their live element directly.

Fresh reliability checks passed **10/10**, including quota failures, latest-edit duplication, focus, sample preservation, exact 8 MiB/12 MiB original limits, 30-file limits, busy-operation rejection/recovery, malformed portable originals and actual 1.6/1.7/prior-1.8 imports. Original identities may be remapped for import isolation; byte/hash preservation is the relevant guarantee. No evidence parser or storage schema rewrite was introduced by these fixes.

### TDR and records

The TDR barrier fix uses the selected path's row order as well as distance. A different zero-span active sharing the connection coordinate can no longer be crossed accidentally. The selected origin itself, zero travel, exact endpoint boundaries and unrelated co-located siblings retain their stated behavior. Fresh boundary checks passed **8/8**.

DSIM record dates now require exact UTC calendar components after parsing. Impossible month ends such as February 31 cannot normalize into a supposedly complete setup record. The entered date remains unchanged and readable. Fresh checks passed **8/8**, including leap/century years, month ends, malformed/missing values and legacy four-digit years. The result remains setup completeness for review, separate from RF acceptance.

The new RF/example/power backtest code was reviewed for independent expected-value construction. The analytic branched routes use separate source/cable/passive/gain functions; the example interpreter reads literal curve metadata without calling production cable/passive/gain helpers. Power operating points are independently constructed from target voltages/currents and ancestry paths. The retained [MATH_BACKTEST.md](MATH_BACKTEST.md), [POWER_BACKTEST.md](POWER_BACKTEST.md) and Wolfram response qualify the assumptions and overlapping counts. This reviewer did not rerun the external evaluator or independently authenticate every manufacturer table cell. Numeric probes are not additional grouped whole-release test counts.

### Native edge fixes and update identity

Long imported names are checked by UTF-8 byte length before using the existing bounded ASCII fallback. Short Unicode names stay readable; the copied bytes remain original. Deferred print checks both the queued Activity/WebView and the asynchronous JavaScript callback context before creating a print adapter. Fresh extracted-production-Java-body checks passed **12/12** with real Java/filesystem execution and platform stand-ins; they are not Android device tests.

Fresh build-orchestration checks passed **18/18**. They include signed/unsigned separation, alternate private signing-directory pinning, validation rejection, frozen-input hashes, complete-set publication/rollback and preservation of separate Preview output. For the later expressly authorized private master archive, its packaged key/password pair was passed to local `keytool` in a temporary directory; no secret value or secret hash was printed or sent to connected services.

The preliminary and final real APKs were independently checked with official tools. Final verification reran `apksigner`, `aapt2` and `zipalign` against the final native receipt and frozen standalone bytes; see [independent-final-apk.json](independent-final-apk.json). Final observations:

- Package `com.spencerwilliams.nightsweep.preview`, version code **24**, version name **1.8 Alpha build 2**.
- Provider authority `com.spencerwilliams.nightsweep.preview.pickerfiles`.
- Original public certificate SHA-256 `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`; v2/v3 signatures verified.
- Final APK SHA-256 `55660a8992ba7d498daaddb2db63f0664469823eecd080226a66d9cc697a6237`, size **283,164 bytes**. Its embedded HTML exactly matches frozen standalone SHA-256 `4ac7d91c9061a1787298191422d34a8470aac26b1dc6a84f5ef14e6230fdf758`; both match the final receipt. ZIP integrity/alignment passed and no private-key entries appeared in the APK.
- The actual retained Build 22 APK has the same package/certificate and code **22**, establishing the package/signing/version prerequisites for a preserving update. This does not prove a successful phone upgrade or storage retention.

The native document origin, package and storage identifiers remain unchanged. The separately signed historical standard/0.13 package remains distinct. Preliminary results are kept separate from the final hashes above; neither is a physical-device result.

The final emulator receipt records an accepted Build 22-to-24 preserving install, unchanged package UID and retention of a generic app-private fixture. Both versions then hit the same stock WebView renderer SIGTRAP in the software Android 15 guest. This supports the compatible-install claim within that emulator; it does not verify native screens, picker/save/share/print, actual saved-job/original-evidence retention or physical-phone behavior. `START_HERE.md`, the update log and the verification summary disclose this limit.

## Commands independently executed

| Command/check | Fresh observed result |
| --- | --- |
| Private source-assembled runtime probe | 21 passed; current tables, hidden/revealed grids and print restoration |
| Source feature/exercise/screen mapping | 7 exercises / 37 targets / 20 screens validated |
| `node qa/build2-frontend.test.cjs` | 10 passed |
| `python3 qa/build2-layout.test.py` | 55 passed, real desktop Chromium at four viewport widths |
| `node --test qa/build2-reliability.test.cjs` | 10 passed |
| `node qa/build2-tdr-boundaries.test.cjs` | 8 passed |
| `node qa/build2-dsim-dates.test.cjs` | 8 passed |
| `python3 qa/android-native-edge.test.py` | 12 passed, Java bodies/platform stand-ins |
| `python3 qa/android-preview.test.py` | 18 passed, mocked SDK orchestration |
| Official-tool checks of final new APK and retained Build 22 APK | Signatures, package/version/provider, alignment and exact frozen HTML/receipt hashes verified; matching old/new identity prerequisites |
| Independent private-master candidate inspection | 53 passed; all ZIP/source checksums, frozen artifacts/source, manuals, seven examples, six original attachments and authorized signing-pair isolation/alias/password |

The root's full QA runner was not duplicated. These scopes overlap other agents' suites; do not add them again to the release count.

## Delivery review

The source-review staging reminder was sent to root: the inherited `package_alpha18.py` targets the prior release, and its source walk would include newly downloaded SDK/emulator/runtime binaries if reused unchanged. Build 2 packaging retains source/download scripts while excluding downloaded tools, build/cache directories and signing material from Source and public Web/PWA. The working signer remains outside the project.

The owner's later explicit instruction authorizes the original key and password in this **private master ZIP**. This supersedes the earlier blanket delivery exclusion. The only permitted signing backup is `PRIVATE_SIGNING/nightsweep-release.p12` plus `PRIVATE_SIGNING/keystore-password.txt`; the accompanying `README_PRIVATE.txt` explains its private-owner purpose. The master README and update log clearly disclose that both secrets are included. No signing file or actual key/password bytes were found elsewhere in the archive, including Source and either public Web/PWA tree. The archive must remain private as the owner requested.

The new `package_build2.py` correctly excludes downloaded toolchains and private-key/dependency paths from Source, and permits only the owner's exact private pair in the separate private directory. A **P3 packaging finding, addressed before execution**, was sent to root: its initial source walk still included historical `release/build22/*.apk` and nested `.zip` archives despite the update log promising their exclusion. Root added the binary-archive exclusion and an explicit native-output allowlist. This reviewer executed the filter against real historical APK/archive paths, a retained HTML migration fixture, the toolchain download script/binary and current APK/receipt paths: historical binaries and downloaded tools were excluded, while the fixture, download script and current native files remained. The inspected candidate confirmed these exclusions; this was a pre-delivery finding, not a published artifact defect.

The inspected candidate contained **661 files, including 558 Source files** before this report/receipt and root's final source-only metadata were repackaged. ZIP integrity and safe unique paths passed; both checksum manifests covered exactly their file sets and every digest matched. Android/iOS standalone HTML and complete PWA directories matched the frozen outputs byte for byte; the packaged signed APK matched the independently verified final APK. Current Functions and Android/iOS installation guides in Markdown, HTML and PDF matched the reviewed document sources. All seven schema-1 synthetic exercises were present; all six portable original attachments in the complete workflow matched their declared lengths and SHA-256 values. The public receipt is [independent-review.json](../../release/build2/independent-review.json). Candidate counts describe this inspection, not the final repack's membership count.

The packaged password successfully opened alias `nightsweep` as a `PrivateKeyEntry`; its certificate matched the pinned original Preview certificate. This was a quiet local check of the requested backup, separate from the final APK signature checks. No password value, key bytes or their hashes are recorded in this report or public receipt. The ZIP checksum sidecar also matched the inspected archive. Root will refresh the sidecar and final membership check after the report is included.

The current Functions, Android/iOS installation and main technician guides, release notes and text update log were spot-reviewed before the public-document freeze. Their Build 2 identities, package paths, conditional final-APK acceptance, hosted-release distinction, no native iOS installer claim, source-only versus final verification counts, backup/storage scope and repaired behaviors align with the reviewed source. The 37-feature index remains intact. A nonblocking wording note was sent to root: the print fix ignores stale callbacks after teardown; it does not prolong a destroyed WebView's lifetime. No public guide was edited by this reviewer during frozen QA.

The final HTML/PWA and signed APK reconcile with their frozen QA/browser/native receipts. The current package distinguishes Android web/APK, iOS web, source, examples, documentation, verification and private signing backup. It does not claim that the hosted site was updated or supply a native iOS installer. Repacking only this report/receipt and source-only metadata requires final archive checksum/membership verification, not another application QA run.

## Limits and tool record

Local source/diff inspection, Node/jsdom/fake-indexeddb checks, Chromium/Playwright layout, Java-body execution, official APK inspection, archive checksum inspection and quiet local `keytool` backup verification were actually used. Cloud Environment readiness was inspected using its runtime guidance; no account permissions or network policy were changed. The explicitly requested signing pair was read only for local archive/alias checks and not displayed or transferred to connected services. Supplied originals checked here are synthetic, not private field evidence.

No physical Android/iPhone, Safari/Home Screen, live plant, native phone picker/share/print, actual device quota exhaustion or full internal branch coverage is claimed. Emulator status belongs to the native owner's final evidence. Performance figures in the owners' reports are observations on this executor, not phone guarantees. Existing manufacturer/manual gaps remain qualified.
