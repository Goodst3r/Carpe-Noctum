# Build 2 native verification

The final compatible Preview APK was compiled and signed using the authorized original signer. The certificate is `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`; package `com.spencerwilliams.nightsweep.preview`, version code **24**, version name **1.8 Alpha build 2**. No replacement signer or alternate application package was generated.

- APK: `android-build/dist/preview/NightSweep-1.8-build2-preview.apk`
- APK SHA-256: `55660a8992ba7d498daaddb2db63f0664469823eecd080226a66d9cc697a6237`
- Embedded/frozen standalone SHA-256: `4ac7d91c9061a1787298191422d34a8470aac26b1dc6a84f5ef14e6230fdf758`
- Real build: 4.534 seconds, zero compiler errors, seven retained Android API deprecation warnings. Package, label, provider authority, original signer, v2/v3 signatures, ZIP alignment, and exact embedded HTML passed verification. Final integrated Android receipt/hash readiness also passed.

`final-real-build.json` and sibling APK receipts record the real build. `preliminary-real-build.json` records an earlier separately frozen candidate and is historical evidence, not the final artifact identity.

## Executed checks and fixes

`python3 qa/android-preview.test.py` passed 18 orchestration checks using mocked SDK results. It covers standard/Preview staging, version identity, unsigned-candidate separation, secure signing-directory selection, pinning, and atomic promotion/rollback. These checks are separate from the actual signed APK build.

`python3 qa/android-native-edge.test.py` passed 12 checks that execute production Java bodies against filesystem and Activity/WebView stand-ins. Eight failed before the two native fixes: UTF-8 byte limits now keep long Unicode import names valid; deferred print entry/callbacks reject destroyed or replaced WebViews. The real compiler subsequently compiled those methods successfully.

Java 21.0.13, Android Platform 35 r2, Build-Tools 35.0.0, ECJ 3.40.0 and D8 8.6.2-dev were used. Official Google/Maven download checksums were independently compared with their published metadata. Context7 supplied official Android signing-order and lifecycle references; Cloud Environment supplied current runtime/network readiness. See `toolchain-and-signer-preflight.json`, `official-build-doc-review.json`, and `review/`.

## Emulator result: update passed; runtime blocked

An official API 35 x86_64 emulator (37.2.13, Android 15, stock WebView 124.0.6367.219) booted with software CPU/GPU because the host has no KVM/vmx/svm. Official documentation describes software CPU mode as unsupported and slow.

The actual historical Build 22 installed successfully. Direct `adb install -r` of the final signed Build 24 succeeded and preserved the package UID/data directory and an explicitly synthetic, generic app-private fixture file. No application data was cleared. This checks update acceptance and generic fixture retention; it does **not** prove saved-job or original-evidence retention.

Both historical Build 22 and final Build 24 then failed to render: the stock WebView renderer terminated with SIGTRAP inside `libwebviewchromium.so`, followed by the platform's unhandled-renderer host-app termination. The same guest also showed stock Quickstep ANR and repeated Bluetooth-service native crashes. No current-wrapper Java exception or app JavaScript exception was established, and no WebView isolation/security setting was weakened to force a pass.

Native UI, saved-job/evidence retention, picker/save/share/print and offline cold-start workflows remain unverified by this emulator. No physical Android or iPhone test is claimed. Exact failures, screenshots and update records are in `emulator-validation.json` and `emulator/`.

Private signing contents are absent from these public reports and app/source/Web files. The user's separately authorized private master packaging is managed by the root agent.
