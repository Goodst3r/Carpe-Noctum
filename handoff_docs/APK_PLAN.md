# APK plan (decided by Spencer, Nov 12, 2026): option 3, a new signing key

**Historical plan.** The [current workflow](PARALLEL_TASKS.md) assigns the off-repo build, original-key signing and in-place upgrade test to Spencer. The replacement-key, uninstall and assistant signing instructions below are superseded.

## What was decided
- The original signing key is not available to any assistant. Spencer chose **option 3: generate a new key, outside the repository, and build the build 3 APK with it.**
- Consequence, to be told to Spencer in plain words before he installs: **this APK will not update an installed build 2 (or older) app.** Android treats a different certificate as a different app. Spencer must first use **Back up project** (full project JSON) in the old app, uninstall it, install the new APK, then **Open project** to restore. Data not backed up is lost on uninstall.
- Package `com.spencerwilliams.nightsweep.preview`, version code 27 and version name "2.0 Alpha build 3" stay as they are. No storage key or job-format change.

## Who does what
- Only the **finishing session** (Claude, after Grok and ChatGPT have written their debug handoffs and the open PRs are merged or BLOCKED) builds and signs. Nobody else builds an APK.
- The key, its password and any `.p12`/`.jks`/password file **never enter the repository, a commit, a log, a PR or a report.** Keep them in a directory outside the clone (for example `~/carpe-signing-private/`). Spencer must keep a copy of that directory somewhere safe: **a lost key means no future update can install over this APK.**

## Steps
1. Freeze the final merged `build3`: full gate green, then record the SHA-256 of `outputs/Night_Sweep.html` in `android-build/build-readiness.json` and `handoff_docs/FINAL_HANDOFF.md`.
2. `python3 android-build/toolchain/download.py` (Java 21, Android SDK 35 r2, build-tools 35.0.0, Eclipse compiler 3.40.0; each artifact is checksum-verified).
3. Unsigned check: `python3 android-build/build.py <abs path>/outputs/Night_Sweep.html --preview --unsigned --expected-html-sha256 <sha>` then `python3 qa/android-preview.test.py`.
4. Create the key outside the repo (the build script reads `nightsweep-release.p12` and `keystore-password.txt` from the signing directory):
   ```
   mkdir -p ~/carpe-signing-private && cd ~/carpe-signing-private
   openssl rand -base64 24 | tr -d '\n' > keystore-password.txt
   keytool -genkeypair -alias nightsweep -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12 -keystore nightsweep-release.p12 -storepass "$(cat keystore-password.txt)" -dname "CN=Carpe Noctum, O=Spencer Williams"
   keytool -list -v -keystore nightsweep-release.p12 -storepass "$(cat keystore-password.txt)" | grep "SHA256:"
   ```
   Check `android-build/build.py` for the exact keystore alias it expects and use that. Record only the **certificate SHA-256 fingerprint** (public) in `android-build/build-readiness.json`.
5. Signed build, pinning the new certificate: `python3 android-build/build.py <html> --preview --signing-dir ~/carpe-signing-private --expected-html-sha256 <sha> --expected-certificate-sha256 <new fingerprint>`.
6. Verify with `apksigner verify --verbose --print-certs`: package, versionCode 27, certificate fingerprint, v2 and v3 signatures, `zipalign -c 4`, and that the embedded HTML hash equals the frozen hash. Record the APK SHA-256 in `build-readiness.json`.
7. Do not commit the APK into history. Attach it to a draft GitHub release (or upload it as a workflow artifact) and give Spencer the link.
8. Write Spencer's phone steps in `handoff_docs/APK_STEPS.md`: back up first, uninstall old, install, restore, then the real-phone checks in order, and how to go back to build 2.

## Not covered
No assistant can test on a phone. Say so in the report. Emulator checks, if any, are listed separately.
