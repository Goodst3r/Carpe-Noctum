# APK plan — original signing key only
Current instruction from Spencer, 2026-11-13: **use the original signing key**. This supersedes the earlier replacement-key plan. Do not generate a new key, change the application ID, or ask Spencer to uninstall as an update workaround.

## Readiness and custody
Before the next build clock starts, verify that an APK built from the recorded baseline and signed with the original installed-app key updates Spencer's installed app in place with jobs intact. Match the actual installed package, version and certificate; do not assume every historical NightSweep APK used the same identity.

The private key and password remain outside the repository, public artifacts, logs and PRs. Record only the public certificate SHA-256 fingerprint. A missing or mismatched key blocks signing. Unsigned compilation may continue, but is not an installable release or a passed phone check.

## Candidate steps
1. Freeze reviewed source and full-gate evidence. Record code commit, actual counts and SHA-256 of `outputs/Night_Sweep.html`.
2. Prepare the existing Android toolchain using `python3 android-build/toolchain/download.py` and its checksum verification. Inspect the build script's expected signing filenames and alias.
3. Optional unsigned check: `python3 android-build/build.py <absolute-html-path> --preview --unsigned --expected-html-sha256 <frozen-html-sha256>`; run `python3 qa/android-preview.test.py`. Select the variant matching the installed package, not by guess.
4. Use the existing original signing backup outside the clone. Current script expects `nightsweep-release.p12`, `keystore-password.txt` and alias `nightsweep`. Do not regenerate a key to satisfy a filename/alias mismatch.
5. Sign using `--signing-dir <private-directory> --expected-html-sha256 <frozen-html-sha256> --expected-certificate-sha256 <verified-original-certificate-sha256>` with the correct variant. Package ID remains unchanged. Check that candidate versionCode is a valid update for the installed version; version27 is the inspected Build3 value, not a permanent next-build value.
6. Verify APK signatures, zip alignment, package/version, original certificate, embedded HTML hash and APK SHA-256. Record facts in `android-build/build-readiness.json` and the release handoff. Do not set tested-on-device before Spencer reports the result.
7. Attach the APK as an authorized release/workflow artifact rather than committing the binary to source history. Provide hash and phone steps.
8. Spencer backs up first, installs **over** the existing app, confirms jobs/readings/evidence intact, checks backup/restore, switches apps, locks/resumes and completes one offline route. Separately check backup coverage for device-only notebook/settings.
9. Record actual acceptance or failures. On a signature mismatch, stop; no uninstall or replacement-key workaround. Update `handoff_docs/APK_STEPS.md` to these instructions when preparing the release.

## Roles
For the next build, ChatGPT is the implementation writer and release coordinator; Grok reviews; Claude performs a narrow new-source/release check and signs only if assigned that finishing action. Spencer keeps the key and performs physical-phone acceptance. See `NEXT_BUILD_PROMPTS.md` and the next-build plan.

No signed APK or physical-phone acceptance is claimed by this documentation change.
