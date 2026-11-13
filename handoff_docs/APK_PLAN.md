# APK plan (revised Nov 12, 2026): the original signing key

## What changed
- Earlier on Nov 12 Spencer chose to generate a new key, because the original key was not available to any assistant. **Later the same day Spencer supplied the original key** to the finishing session. That supersedes the new-key plan. **Do not generate a new key.**
- The original key's public certificate SHA-256 is `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`. It equals `ORIGINAL_CERTIFICATE_SHA256` in `android-build/build.py`, which the build pins by default. The finishing session checked the supplied file against it before use.
- Consequence for Spencer: the build 3 APK keeps the package `com.spencerwilliams.nightsweep.preview` and signer of build 2 and has a higher version code (**27**; build 2 is 26). **It installs as an update over build 2. No uninstall is needed and the app's data stays on the phone**, including jobs, projects and the Supply PM notebook (`nightsweep-power-pm-v1`). Back up first anyway, in case the update has to be rolled back.
- Package, version name "2.0 Alpha build 3", version code 27, storage keys and job format are unchanged by this plan.

## Who does what
- Only the **finishing session** (Claude, after both lanes' final gates on the same `build3` head and both handoffs) builds and signs. Nobody else builds an APK.
- The key, its password and the `.p12` and password files **never enter the repository, a commit, a log, a PR or a report.** They stay in a private directory outside the clone (the finishing session used `/root/nightsweep-signing`, mode 700, files 600). Only the public certificate fingerprint and the APK's SHA-256 are recorded.
- Spencer keeps the master copy of the key. **A lost key means no future update can install over this app.**

## Steps
1. Freeze the final merged `build3`: full gate green, then record the SHA-256 of `outputs/Night_Sweep.html` in `android-build/build-readiness.json` and `handoff_docs/FINAL_HANDOFF.md`.
2. `python3 android-build/toolchain/download.py` (Java 21, Android SDK 35 r2, build-tools 35.0.0, Eclipse compiler 3.40.0; each artifact is checksum-verified).
3. Unsigned check: `python3 android-build/build.py <abs path>/outputs/Night_Sweep.html --preview --unsigned --expected-html-sha256 <sha>`, then `python3 qa/android-preview.test.py`.
4. Signed build with the original key, certificate pinned (default): `python3 android-build/build.py <abs path>/outputs/Night_Sweep.html --preview --signing-dir <private dir> --expected-html-sha256 <sha>`.
5. Verify with `apksigner verify --verbose --print-certs`: package, versionCode 27, certificate fingerprint equal to the one above, v2 and v3 signatures, `zipalign -c 4`, and the embedded HTML hash equal to the frozen hash. Record the APK SHA-256 in `build-readiness.json`.
6. Do not commit the APK. `android-build/dist/`, `build/`, `toolchain/` and `signing-private/` are gitignored. Attach the APK to a draft GitHub release (or a workflow artifact) and give Spencer the link.
7. Write Spencer's phone steps in `handoff_docs/APK_STEPS.md`: back up first (project backup and Supply PM Export notebook), install over build 2 without uninstalling, the real-phone checks in order, and how to go back to build 2.

## Not covered
No assistant can test on a phone. Say so in the report. Emulator checks, if any, are listed separately.

## Result (Nov 13, 2026)
Done as above from `build3` `248e778`. APK SHA-256 `0aca97bb4070bebceb55d297ec98ecc91d2c10e674cf796e3f7c36c2eb2b6977`, certificate as stated, versionCode 27, embedded HTML `844c53b0…1137`. Delivered to Spencer outside git. Phone steps: `handoff_docs/APK_STEPS.md`. No device test was run.
