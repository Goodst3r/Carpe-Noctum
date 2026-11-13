# Carpe Noctum 2.0 Alpha build 4 — Android wrapper

Preview identity: `com.spencerwilliams.nightsweep.preview` · Version code **28** · Version name **2.0 Alpha build 4** · Launcher label **Carpe Noctum 2.0 Preview build 4**.

`build-readiness.json` is a dated pre-signing source snapshot; the build 4 APK and matching `dist/preview/build-info.json` do not exist yet at that snapshot. Later candidate receipts and phone acceptance are separate dated evidence. A separately signed starting-commit code 27 Preview was reported to update in place with jobs, readings and original attachments intact. Signing material stays outside the project and is excluded from every source and coworker package. The retained build 22 APK is a historical **1.7** installer; it does not contain these changes.

The standard package remains `com.spencerwilliams.nightsweep`; `--preview` selects the established Preview package. Keep the existing package, private document-provider authority and fixed HTTPS document origin when producing an update. A separately signed or renamed package cannot establish an in-place update.

## Build from the tested shared app

From the project root, first build and check the browser application:

```sh
npm ci --prefix qa/runtime --no-audit --no-fund
python3 qa/run-pwa.py
```

Freeze `outputs/Night_Sweep.html` after the final application checks, record its SHA-256 and use it as the Android input. The historical `app/src/main/assets/index.html` is not the release input; the builder stages the supplied HTML in disposable sources. Canonical native source/assets stay unchanged by staging.

Toolchain requirements: Python 3, Java 21, Android SDK Platform 35 r2, Build-Tools 35.0.0 and Eclipse compiler 3.40.0. `toolchain/download.py` downloads official Google/Maven artifacts and verifies their published checksums. Signing requires the original private backup; the builder refuses to generate a replacement key. The default private directory is `signing-private/`, with `nightsweep-release.p12` (PKCS#12, alias `nightsweep`) and `keystore-password.txt`. Keep these files in a secure location outside source packages; `--signing-dir` selects that location. The password is read directly from its file.

From `android-build/` after restoring the authorized toolchain and private signer:

```sh
python3 toolchain/download.py
python3 build.py /absolute/path/to/outputs/Night_Sweep.html --preview --signing-dir /absolute/path/to/private-signing --expected-html-sha256 <frozen-html-sha256>
```

The default pinned certificate is `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`. Output is `dist/preview/CarpeNoctum-2.0-build4-preview.apk`; the optional standard variant uses `dist/CarpeNoctum-2.0-build4-alpha.apk`. The build checks package/version/label, provider authority, expected signer, v2/v3 signatures, ZIP alignment and exact embedded HTML. Only a completely verified APK and matching receipts are promoted together; failed compilation, validation, copy or promotion preserves the previous validated output.

For development compilation without a signer, add `--unsigned`. Those candidates go to `dist/unsigned-preview/` (or `dist/unsigned-standard/`) with `signed: false` and `installable: false`; they cannot replace the signed installer or establish update compatibility.

From the project root, `python3 qa/android-preview.test.py` checks disposable staging, release identity, private-directory selection, unsigned-candidate separation and failed-build rollback with mocked SDK results. `python3 qa/android-native-edge.test.py` executes production Java filename/print bodies against filesystem and lifecycle stand-ins. These checks do not replace real APK compilation/signature verification or physical-device tests. Current execution records are under `research/build2/native/`; the supplied older build 20 record remains under `docs/history/`.

## Compatible update and data preservation

A build 4 Preview candidate signed with the original Preview certificate and code 28 is intended to update a matching earlier Preview package. The separately verified baseline code 27 update does not establish build 4 acceptance. Export and verify each important project first. Complete the install/update without uninstalling the existing app or clearing its data, then check named jobs, a saved route and original attachments. Physical-phone update behavior requires a separate device check.

The supplied historical 0.13 installer uses a different certificate: `7998433ff49dc46b1157f69c917fb9b7e93936a5845140f054f9488ad7519e5b`. The available original Preview key cannot update that installer in place. Preview can coexist with it using separate storage; move jobs using verified project exports. A preserving standard-package update requires the private key that actually signed 0.13 and an explicit matching `--expected-certificate-sha256`.

An APK is an Android installer. It is not an iPhone installer or an App Store/Google Play submission bundle. Minimum Android API is 26 (Android 8); target API is 35. Android unknown-source prompts belong to the installer/file manager. Follow approved device policy; do not disable phone protections.

## Native integrations

The WebView bundles all app resources and has no INTERNET permission, account, tracking SDK or remote service. External manufacturer links open the user's browser and require a connection.

- `NightSweepAndroid.saveFile(name, text, mime)` opens Android's save document picker for JSON, CSV and text, up to 20 MiB.
- `saveBinary(name, base64, mime)` exports original evidence bytes, up to 8 MiB, using the save picker. Unknown types use `application/octet-stream`; HTML/XML attachments do not execute through this bridge.
- File inputs use Android's document picker with accepted types and multiple selection. Unknown proprietary extensions permit file selection as originals. Selected files are copied to a private cache and exposed through a private read-only provider. Limits are 30 files, 20 MiB each and 24 MiB total; cancellation completes the pending callback. Cache names honor UTF-8 byte limits so long Unicode filenames can be imported.
- `shareText(title, text)` opens Android's chooser without sending automatically.
- `printReport()` opens the print dialog, including Save as PDF when the device supports it. Deferred work checks the Activity/WebView lifecycle before preparation and printing.
- Alert/confirm dialogs use Android dialogs.
- The fixed `https://appassets.androidplatform.net/` origin preserves localStorage/IndexedDB identity across compatible updates. The wrapper denies remote-resource requests and file-URL access. Self-contained `data:` resources (such as map page previews) load inline; every other intercepted request is answered empty.

Android, Chrome and Safari/Home Screen jobs are separate stores. Android backups are disabled; complete project exports are the external backup. A run-sheet CSV/PDF is not a full backup with original evidence.

## Verification limits and source packaging

Staging tests check source isolation and prepared identity. Compilation, APK structure and signer checks require an actual build; installation, WebView behavior, local job retention, native picker/save/share/print, rotation, back navigation and offline cold starts require physical-device checks. None is implied by a browser mockup or automated DOM test.

Include `app/src/main/`, `build.py`, `toolchain/download.py`, `build-readiness.json` and this README in source packages. Exclude `signing-private/`, `build/`, `dist/`, SDK archives/extracted tools and placeholder assets. Keep private keys, passwords and signing backups out of Git, browser deployment and coworker packages.

Official references:

- https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
- https://developer.android.com/reference/android/webkit/WebChromeClient.FileChooserParams
- https://developer.android.com/training/data-storage/shared/documents-files
- https://dl.google.com/android/repository/repository2-1.xml
- https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.40.0/
