# NightSweep 1.8 Alpha build 2 · Source handoff

Read `AGENTS.md`, both NightSweep instruction files, `NightSweep_Project_Status.md` and `docs/DEVELOPER_BUILD.md` before changing the project. Work in this build 2 folder; the earlier `/workspace/NightSweep_1.8_Alpha` delivery remains frozen.

This source extends the tested local 1.8 Alpha application. Original provenance remains the supplied 1.7 Alpha/build 22 export and Site source commit `d4228cad024406b17feb5bde134f2c6f6a75d08e`. Keep the existing Site repository authoritative; this local delivery does not authorize a competing repository or deployment.

## Current paths

| Path | Purpose |
| --- | --- |
| `README.md` | Current source and one-ZIP delivery map |
| `night-sweep/`, `pwa/`, `android-build/` | Authored shared app and native wrapper |
| `docs/NightSweep_1.8_*` | Current guides; filenames stay stable while titles identify build 2 |
| `docs/history/` and named 1.6/1.7 editions | Historical supporting records, not current build receipts |
| `qa/`, `research/build2/` | Current checks, synthetic replays and audit/tool evidence |
| `outputs/Night_Sweep.html`, `dist/` | Generated standalone HTML and complete PWA |
| `NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt` | Plain-text update/verification log |

Build/check with `npm ci --prefix qa/runtime --no-audit --no-fund` and `python3 qa/run-pwa.py`. Read current results, not the prior build's totals. Use the frozen `outputs/Night_Sweep.html` and its SHA-256 as Android input. Native source identity is **1.8 Alpha build 2**, Preview version code **24**, launcher **NightSweep 1.8 Preview build 2**.

The original authorized signer and official toolchain were used for the real build. The verified APK preserves the Preview package and original certificate at version code 24; manifest/provider/origin, v2/v3 signatures, alignment and embedded-HTML checks passed. Working signing files remain outside this source tree. At the owner's explicit request, the single private master ZIP includes the original key and password only in its top-level `PRIVATE_SIGNING/` folder. Neither Source nor the public Web/PWA folders contains those files.

The single delivery is assembled by `release/package_build2.py`; it includes separate Android/iOS web access folders, the verified Preview APK, source, current guides, practice backups, public verification receipts, update log, checksums and the requested private signing backup. Downloaded dependencies/toolchains and historical binary archives are excluded. Treat the master ZIP as private.

The final frozen build passed 1,066 automated checks across 57 suites and 322 rendered Chromium checks. Android emulator update installation and a generic app-private fixture retention check passed. Both Build 22 and Build 24 then hit the same stock WebView renderer crash in the software emulator, leaving native screens, file/print flows and actual job/evidence retention unverified. No physical-device checks were performed. See `release/build2/validation.json` for exact hashes and scope.

Preserve schema-one storage identities, legacy imports, original evidence and the seven synthetic exercises. An update does not intentionally wipe saved jobs. Export and verify full project backups before updates, rollback or transfers. Record automated, rendered-browser, native-build and physical-device verification separately.
