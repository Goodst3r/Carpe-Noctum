# Carpe Noctum 2.0 Alpha build 2 (formerly NightSweep)

> The app was renamed from NightSweep to Carpe Noctum in 2.0 Alpha build 2. The Android package ID, storage names and job file format keep their NightSweep-era identifiers so saved jobs and updates carry over. Sections below describe the 1.8 baseline unless they say otherwise.

Offline HFC field calculations, exact-model setup references, synthetic training and local job/evidence records for maintenance technicians, team leaders and supervisors.

This source belongs to the single **NightSweep 1.8 Alpha build 2.zip** delivery. Android and iOS share the same tested web application; the Android Preview installer uses the existing package/origin identity with version code **24**. The package's verification receipts identify the accepted final artifacts. No hosted deployment, physical phone installation or field RF acceptance is implied.

## Start here

- [All-functions README](docs/NightSweep_1.8_Alpha_Functions_README.md): all 20 task screens, 37 feature choices and seven loadable exercises.
- [Android/iOS installation guide](docs/NightSweep_1.8_Alpha_Android_iOS_Installation.md): APK or browser options, compatible updates, offline checks and job transfers.
- [Technician guide](docs/NightSweep_1.8_Alpha_README.html): workflow, calculation inputs, examples and limits.
- [Training coverage](docs/NightSweep_1.8_Training_Coverage.md): feature-to-example map.
- [Release notes](docs/NightSweep_1.8_Release_Notes.md) and [text update log](NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt): build 2 changes and executed-verification record.
- [Developer build guide](docs/DEVELOPER_BUILD.md) and [project status](NightSweep_Project_Status.md): source/build context, receipts and remaining checks.

## One organized delivery

The ZIP has one top-level folder, `NightSweep 1.8 Alpha build 2/`:

| Path in the delivery | Purpose |
| --- | --- |
| `START_HERE.md` | First steps and final artifact/verification summary |
| `Android/Web/NightSweep.html` and `Android/Web/PWA/` | Standalone HTML and complete static PWA for Android browsers |
| `Android/APK/NightSweep-1.8-build2-preview.apk` | Preview installer, accepted only with matching build/signature receipts |
| `iOS/Web/NightSweep.html` and `iOS/Web/PWA/` | Matching shared web app with iPhone/iPad instructions |
| `Documentation/` | Current Markdown, standalone HTML and printable PDF guides |
| `Examples/` | Seven build 2 synthetic JSON practice backups |
| `Source/` | First-party source, tests and public audit records; no installed dependencies, SDKs or private signing material |
| `Verification/` | Current test/build/package evidence and practical scope |
| `PRIVATE_SIGNING/` | Owner-requested original signing key/password; keep the complete master ZIP private |
| `NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt` | Plain-text changes and test log |
| `SHA256SUMS.txt` | Final file-integrity checksums |

Opening a local HTML file is separate from installing a Safari/Chrome Home Screen app. The bundled PWA requires appropriate hosting for a phone's supported installed-offline workflow. The known public NightSweep site is a separate published release and has not been updated by this local build.

## Source layout and checks

| Source directory | Responsibility |
| --- | --- |
| `night-sweep/` | Authored application, catalog, training and numerical engine |
| `pwa/` | Browser wrapper, installation controls, worker and icons |
| `android-build/` | Native wrapper and reproducible build/signature checks |
| `docs/` | Current guides plus clearly named historical editions |
| `qa/` | Regression suites, recorded synthetic cases and locked development dependencies |
| `research/build2/` | Current build 2 audit/tool evidence; earlier `research/alpha18/` remains baseline evidence |
| `outputs/`, `dist/` | Generated standalone HTML and complete public PWA files |

From the source root:

```sh
npm ci --prefix qa/runtime --no-audit --no-fund
python3 qa/run-pwa.py
```

The application itself has no runtime dependency on these QA packages. Build 2 validation includes synthetic replay/reference checks, import/export/storage regressions, rendered-browser/offline checks and native build/signature validation as recorded in the final receipts. These categories are not interchangeable with physical phone or plant tests.

Final results: **1,066 automated checks across 57 suites** and **322 rendered Chromium checks passed**. The original-key signed APK passed artifact verification and emulator update installation. Both Build 22 and Build 24 hit the same stock WebView renderer crash in that software emulator; native UI, file/print flows and actual job/evidence retention remain unverified. No physical Android or iPhone was tested. See [verification](release/build2/VERIFICATION_SUMMARY.md).

## Field and data rules

Complete field workflow uses GS7K, two GainMaker GaN HGD actives and Scientific Atlanta/GigaXtend/Technetix passives on **42/54 MHz**. Anchors remain **31 dBmV at 54 MHz / 43 dBmV at 860 MHz**, with the separate **38 dBmV return TX reference**. The independent six-active Vecima/AOI exercise remains **204/258 MHz**.

Synthetic values, predictions, measurements, manufacturer capabilities and acceptance remain separate. Jobs/original evidence stay local until exported. Keep one editing window open, preserve external full-project JSON backups and verify restored originals before changing app/browser/device. Private keys, passwords and field evidence do not belong in the share ZIP.

## Private master package

At the owner's explicit request, the build 2 master ZIP includes the original signing key and password in top-level `PRIVATE_SIGNING/`. It is a private backup archive, not a coworker share package. The source and public Android/iOS web folders contain no signing secrets. Use only the intended PWA folder for web deployment.
