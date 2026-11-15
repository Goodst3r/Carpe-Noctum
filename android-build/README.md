# Fresh Carpe Noctum Android wrapper

Build 5 uses Android version code29, the existing `com.spencerwilliams.nightsweep.preview` Preview package, and the fixed offline document origin. This preserves the installer identity, not historical job compatibility: the new app intentionally uses fresh storage.

## Build

From the source root run `npm ci`, `npm test`, `npm run build` and `npm run test:browser`. Freeze the SHA-256 of `outputs/Night_Sweep.html`.

The SDK installer `toolchain/download.py` downloads checksum-pinned platform35, build tools35 and ECJ. Downloaded tools stay outside Git. Set `CARPE_ANDROID_TOOLCHAIN` to that external folder if not using the default `android-build/toolchain` layout. Java21 was used in the local compilation. `tests/native.test.mjs` compiles policy and callback helpers with Java and ECJ; set `JAVA` (or `JAVA_HOME`) and `CARPE_ECJ` when they are outside `PATH` and the standard repository/toolchain locations. Without both tools, these tests are reported as skipped.

```sh
python3 android-build/build.py outputs/Night_Sweep.html --preview --unsigned --expected-html-sha256 FROZEN_HTML_SHA256
```

An unsigned candidate proves compilation/artifact assembly, not installation or signing. Actual release requires the private original `nightsweep-release.p12`, password file, `--signing-dir`, and the matching expected original certificate. Never generate a replacement key. Keys/passwords stay outside Git and web assets.

## Native interface

`NightSweepAndroid.saveFile(name,text,mime)` opens the save picker for text/JSON up to20MiB. `saveBinary(name,base64,mime)` saves PDFs/original files up to8MiB; the app rejects larger native exports explicitly. File inputs use the system document picker. `printReport()` opens native printing. Local data/blob resources are permitted; remote resources remain blocked and no INTERNET permission is requested.

JavaScript `prompt()` uses a native editable dialog prefilled with the supplied default value. **OK** returns the entered string, including an empty string; **Cancel**, Back, outside dismissal, dialog failure, or activity teardown cancels the JavaScript prompt once. This callback contract is unit-checked from the production helper, but native dialog layout, keyboard behavior, and lifecycle handling still need phone verification.

Optional AI models run in a same-origin Web Worker and keep inference on device. The native wrapper serves only validated `/ai/...` paths from packaged APK assets, including the worker, engine, WASM runtime, and any packaged models. Build staging copies `artifacts/ai`; it can also copy checksum-matched optional packs from `CARPE_AI_MODEL_DIR` (default `../.cache/ai-models`). The bundled PP-OCRv6 Tiny model can be installed without network access. Remote model download is unavailable in this offline wrapper; choose **Import model files** and use the model's listed source files when a pack is not bundled. The app verifies file names, sizes, and SHA-256 before storing a model locally.

Android document-picker selections are copied into private app cache before WebView receives them. The picker accepts at most 30 files per selection, up to 128 MiB per file and 512 MiB total; stale transfer copies are pruned after 24 hours. The AI model UI may impose a smaller pack-specific total. Picker imports do not grant the WebView a direct filesystem path or unrestricted provider access.

Official tools check package/version, embedded HTML byte identity and alignment. Original-key signing, install, WebView touch/picker/share/print behavior, JavaScript dialog behavior, emulator and physical-device acceptance are separate evidence. See `docs/rebuild/VERIFICATION.md` for the final candidate results.
