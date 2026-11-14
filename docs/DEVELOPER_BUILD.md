# Carpe Noctum 2.0 Alpha build 3 — Developer build notes

This is the **2.0 Alpha build 4** pre-signing source candidate (Android code 28). The retained repository APK is build 2 code 26. Spencer reported that a separately signed starting-commit build 3 code 27 updated his phone with jobs, readings and originals intact; build 4 has not yet been signed, accepted on a phone or deployed. The Android section below records the historical 1.8 package (code 24).

Current filenames under `docs/NightSweep_1.8_*` stay stable; their titles still say 1.8 where that was the original guide name. A third assistant (Grok) updated the build 3 orientation on November 12, 2026. Preserve schema-one storage and historical migration fixtures.

## Responsibilities and generated files

| Path | Responsibility |
| --- | --- |
| `night-sweep/` | Authored application, engine, equipment data and seven training exercises |
| `pwa/` | Hosted browser controls, service-worker template and icons |
| `android-build/` | Native wrapper, disposable build staging and verification |
| `docs/` | Current technician/developer guides and explicitly historical editions |
| `qa/` | Numerical, state/storage/import/export, DOM/browser/PWA and native regression checks |
| `research/build2/` | Current tool, numerical replay/property, reliability, render and native evidence |
| `outputs/Night_Sweep.html` | Generated standalone app; frozen Android input |
| `dist/` | Generated complete public PWA; regenerate instead of hand-editing |

The complete 21-step job is GS7K + two GainMaker HGD actives, mixed Scientific Atlanta **SAT MM 4-23**, GigaXtend and Technetix passives on 42/54 MHz. Preserve 31@54 / 43@860 and the separate 38 dBmV return TX reference. The separate 13-step Vecima/AOI job remains six serial actives on 204/258. The other five exercises cover custom curves/reverse TDR, OEM AGC, DSIM, manual/thermal and conventional GS7K setup.

## Reproduce app and browser checks

From the source root:

```sh
npm ci --prefix qa/runtime --no-audit --no-fund
python3 night-sweep/build.py
python3 build-pwa.py
python3 qa/run-pwa.py
python3 qa/browser-smoke.py
```

`qa/run-pwa.py` builds the current standalone/PWA and writes `qa/pwa-test-results.json` and suite logs. Read failures, scope and generated-artifact consistency, not just the count. Browser smoke needs Playwright and Chromium; `NIGHTSWEEP_CHROMIUM` selects another executable. Browser results are rendered desktop Chromium with mobile viewport emulation and offline contexts, not physical Safari/WebView results.

Build 2 current checks include topology-aware zero-span TDR boundaries, synthetic replay/property/reference math, direct/picker JSON size guards, active named-job duplication faults, retained storage/evidence round trips, hidden-chart/current-data rendering and native filename/print-lifecycle regressions. Root's final receipts record exact commands, counts and source/artifact hashes. Previous 1.8 totals are baseline evidence, not new build 2 results.

## Public offline documentation

`build-pwa.py` copies current guides into one offline release. In addition to the technician, setup, equipment and math pages, build 2 includes:

| Public page | Authored guide |
| --- | --- |
| `functions-guide.html` | `docs/NightSweep_1.8_Alpha_Functions_README.html` |
| `phone-installation.html` | `docs/NightSweep_1.8_Alpha_Android_iOS_Installation.html` |
| `training-coverage.html` | `docs/NightSweep_1.8_Training_Coverage.html` |

Keep `night-sweep/README.md` and `docs/NightSweep_1.8_Alpha_README.md` byte-identical. Render the current Markdown editions with `docs/render_readme.cjs`, then rebuild the PWA because guide bytes participate in its content version and cache hashes. PDF generation is a separate documentation artifact step; the app does not require a PDF renderer.

```sh
node docs/render_readme.cjs
node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
node docs/render_readme.cjs NightSweep_1.8_Alpha_Android_iOS_Installation.md NightSweep_1.8_Alpha_Android_iOS_Installation.html
node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
node docs/render_readme.cjs NightSweep_1.8_Equipment_Coverage.md NightSweep_1.8_Equipment_Coverage.html
```

The existing development runtime supplies `marked` 18.2.0 for these renders; output HTML has no internet/runtime dependency on it. Grok rendered with `marked` 18.2.0 from a local install that is not committed (`NODE_PATH` pointed at that install). Check unique IDs, local fragment links, relative asset links, phone overflow and printable content. Preserve historical 1.6/1.7 guides and audit records as historical material.

## Android build 2 (historical package, not the current source identity)

The notes in this section describe **1.8 Alpha build 2**, version code **24**, Preview launcher **NightSweep 1.8 Preview build 2**, package `com.spencerwilliams.nightsweep.preview`. They are not the 2.0 Alpha build 3 source identity (code 27, no APK) and they are not the signed 2.0 Alpha build 2 installer (code 26). Nobody working on `build3` builds or signs an APK. The private document origin/provider identity stays compatible with prior Preview. The original authorized signer stays outside source and all delivery files.

Freeze `outputs/Night_Sweep.html` after app checks and pin its SHA-256 before the real Preview build. `android-build/build.py` stages the supplied standalone in disposable sources; the old canonical embedded HTML is historical input, not the final app. Read `android-build/README.md` for exact toolchain, external signer arguments and commands. Never generate a replacement key to bypass identity failure.

The accepted installer name is `NightSweep-1.8-build2-preview.apk`. Success requires real compile plus expected package/version/label/provider, original certificate, v2/v3 signatures, ZIP alignment and byte-identical embedded HTML checks. Candidate APKs/receipts remain disposable until validated promotion succeeds. Mocked orchestration or extracted-Java tests are supplementary and cannot establish a real APK or phone installation.

Run native source regressions from the source root when relevant:

```sh
python3 qa/android-preview.test.py
python3 qa/android-native-edge.test.py
```

Physical installer/update retention, WebView, picker/share/print and offline reopening remain device checks even after signing/build validation.

## Single delivery archive

After final app/browser/native/document checks, root assembles the delivery with `release/package_build2.py`. The one ZIP and its top-level folder are named **NightSweep 1.8 Alpha build 2**. Its layout separates Android/Web, Android/APK, iOS/Web, Documentation, Examples, Source and Verification, with the requested plain-text update log and checksums.

The two PWA copies derive from the same frozen shared web build. Their platform instructions differ; they do not synchronize jobs. Source includes first-party code/tests/public audit evidence while excluding dependencies, SDKs, private keys/passwords, private field evidence and historical binary archives. Publish only when explicitly requested; no deployment is part of this local delivery.

## Data and interpretation

Preserve original evidence bytes, SHA-256 verification, optional schema-one fields, unapproved criteria and synthetic markers through save/duplicate/import/export. Project JSON entry points share the 20 MiB UTF-8 guard. RF refresh reuse is bounded to one synchronous pass; no cross-edit/import numeric cache is introduced. TDR barriers follow topology/chain order, including equal-coordinate zero-length spans.

Job data remains local. Do not clear jobs/evidence during a service-worker update. Keep user guidance to export important jobs, verify external JSON and original files, use one editing window, and distinguish predictions/reviewed notes from measurements/acceptance. Backtests here are recorded synthetic replays/properties/reference cases, not a field backtest against measured plant.
