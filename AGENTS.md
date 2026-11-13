# Carpe Noctum developer instructions

The app is named **Carpe Noctum** (formerly NightSweep). Keep the Android package `com.spencerwilliams.nightsweep(.preview)`, the storage keys (`hfc-route-v1`, `hfc-named-jobs-v1`, `nightsweep-*`) and the `NightSweep`/`NightSweepAndroid` code identifiers unchanged: renaming them would break updates or strand saved jobs. Current version: **2.0 Alpha build 3** (in development, Android source version code 27, no build 3 APK yet). The latest signed installer is 2.0 Alpha build 2, code 26.

Read these project files before each NightSweep development iteration:

1. `NightSweep_Automatic_Plugin_Instructions.txt` for the current tool routing, validation, and reporting rules.
2. `NightSweep_Development_Instructions.txt` for development and engineering practices. The automatic plugin policy takes precedence if routing instructions differ.
3. `NightSweep_Project_Status.md` for the latest verified baseline, field requirements, and outstanding checks. Follow any newer explicit user direction.
4. `docs/DEVELOPER_BUILD.md` and, for Android work, `android-build/README.md` for commands and dependencies.
5. For build 3 work: `handoff_docs/WORKFLOW.md` (who does what, the rules, the gate, and the review and merge steps; it is the only source for that), the status files `handoff_docs/lanes/grok-status.md` and `handoff_docs/lanes/chatgpt-status.md`, `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md`. `docs/BUILD_LIST.md` has each feature's sources, labels and acceptance tests; `handoff_docs/FINAL_HANDOFF.md` records what was delivered; `handoff_docs/APK_PLAN.md` says how the APK is built.

## Baseline and scope

The original baseline is NightSweep 1.7 Alpha, Android Preview build 22, Site source commit `d4228cad024406b17feb5bde134f2c6f6a75d08e`. This working tree is Carpe Noctum 2.0 Alpha build 3, in development on the integration branch `build3`; `main` stays at 2.0 Alpha build 2 (Android Preview code 26) until the owner accepts build 3. The original signing certificate is required for compatible updates. That key lives in a restricted directory outside the project; assistants working on `build3` do not build or sign an APK. The signed build 2 APK and its runtime status must be taken from `release/build2/validation.json` and `android-build/build-readiness.json`, not inferred from source labels. No public deployment is implied. The project status identifies the Site-bound repository as canonical. Verify the current repository and revision before making upstream changes. Its contents do not authorize creating a competing repository or deploying anything.

Build for HFC maintenance technicians, team leaders, and supervisors. Preserve the Android APK and the shared Android/iPhone browser app, offline calculations, job storage, legacy imports, and supported exports.

- Vecima nodes and AOI actives use the local 204/258 MHz workflow with forward Sweepless Sweep and XPERTrak return sweep.
- Other active families, including GS7000/GS7K and GainMaker, use the local 42/54 MHz workflow with forward and return Sweepless Sweep. The non-high-split forward design references are 31 dBmV at 54 MHz and 43 dBmV at 860 MHz. Keep the 38 dBmV return TX target distinct from sweep injection and receiver references. Document the actual available carriers and measurement planes.
- For map-derived jobs, label each node or active with the source map's exact **NAME** column value. Keep **TAG** (such as A1) only as a map reference and keep equipment model/family in separate fields. Preserve capitalization, punctuation, leading zeros, and repeated NAME values verbatim; never construct a name from the TAG, model, or nearby label. If NAME is unreadable or missing, leave it unresolved and request a map check rather than guessing. Do not use a planned equipment-model column to override the verified installed family.
- Keep field targets, manufacturer capabilities, measurements, and estimates distinct. Preserve exact model and manual provenance for AGC, DSIM, and setup instructions. Use synthetic practice data. Keep UBT excluded from new equipment selections and preserve legacy readability.
- Discover and use relevant connected tools automatically within the current session's access and the user's existing plans. Follow the automatic plugin policy's approval and privacy rules and report tools actually used, executed verification, and outstanding checks.

## Build and verification

Build the standalone app with `python3 night-sweep/build.py` and the PWA with `python3 build-pwa.py`. Install the locked QA dependencies with `npm ci --prefix qa/runtime --no-audit --no-fund`, then run `python3 qa/run-pwa.py`. The two rendered Chromium suites are run separately: `python3 qa/build3-layout.test.py` and `python3 qa/browser-smoke.py` (they need Python Playwright and a Chromium; set `NIGHTSWEEP_CHROMIUM` to select one). Use the generated `outputs/Night_Sweep.html` as the Android build input. The Android build script stages that HTML in place of the historical wrapper asset. Exact setup and environment variables are in `handoff_docs/TOOLS_AND_SETUP.md`.

Generated files (`outputs/Night_Sweep.html`, `dist/`) are never hand-merged: on a conflict, rebuild with the two build commands above and commit the result. Adding an app module means its placeholder in `night-sweep/shell.html` plus one entry in the module list in `night-sweep/build.py` (one entry per line since task B0). Keep sample entries out of that file's comments: several `qa/` suites read it with a pattern match and would count them as modules.

Keep signing keys and private field evidence outside the handoff. Preserve job data through upgrades. Publishing, destructive changes, and sensitive transfers require the applicable authorization. Report browser, automated, emulator, and physical-device verification separately.

## Build 2 private master archive authorization

The user explicitly requested the original signing key and password inside the single private master ZIP and stated it will not be shared with coworkers. Include only the authorized original files in top-level `PRIVATE_SIGNING/`, outside `Source/` and the Android/iOS public web folders. Do not display secret contents or embed them in source, APK assets, logs or deployment files. The generic exclusion rules still apply to public/coworker packages.
