# NightSweep developer instructions

Read these project files before each NightSweep development iteration:

1. `NightSweep_Automatic_Plugin_Instructions.txt` for the current tool routing, validation, and reporting rules.
2. `NightSweep_Development_Instructions.txt` for development and engineering practices. The automatic plugin policy takes precedence if routing instructions differ.
3. `NightSweep_Project_Status.md` for the latest verified baseline, field requirements, and outstanding checks. Follow any newer explicit user direction.
4. `docs/DEVELOPER_BUILD.md` and, for Android work, `android-build/README.md` for commands and dependencies.

## Baseline and scope

The original baseline is NightSweep 1.7 Alpha, Android Preview build 22, Site source commit `d4228cad024406b17feb5bde134f2c6f6a75d08e`. This working tree is NightSweep 1.8 Alpha build 2, with Android Preview version code 24. The original signing certificate is required for compatible updates; this iteration uses the user-supplied original key from a restricted directory outside the project. Final signed APK and runtime status must be taken from release/build2/validation.json, not inferred from source labels. No public deployment is implied. The project status identifies the Site-bound repository as canonical. Verify the current repository and revision before making upstream changes. Its contents do not authorize creating a competing repository or deploying anything.

Build for HFC maintenance technicians, team leaders, and supervisors. Preserve the Android APK and the shared Android/iPhone browser app, offline calculations, job storage, legacy imports, and supported exports.

- Vecima nodes and AOI actives use the local 204/258 MHz workflow with forward Sweepless Sweep and XPERTrak return sweep.
- Other active families, including GS7000/GS7K and GainMaker, use the local 42/54 MHz workflow with forward and return Sweepless Sweep. The non-high-split forward design references are 31 dBmV at 54 MHz and 43 dBmV at 860 MHz. Keep the 38 dBmV return TX target distinct from sweep injection and receiver references. Document the actual available carriers and measurement planes.
- Keep field targets, manufacturer capabilities, measurements, and estimates distinct. Preserve exact model and manual provenance for AGC, DSIM, and setup instructions. Use synthetic practice data. Keep UBT excluded from new equipment selections and preserve legacy readability.
- Discover and use relevant connected tools automatically within the current session's access and the user's existing plans. Follow the automatic plugin policy's approval and privacy rules and report tools actually used, executed verification, and outstanding checks.

## Build and verification

Build the standalone app with `python3 night-sweep/build.py` and the PWA with `python3 build-pwa.py`. Install the locked QA dependencies with `npm ci --prefix qa/runtime --no-audit --no-fund`, then run `python3 qa/run-pwa.py`. Use the generated `outputs/Night_Sweep.html` as the Android build input. The Android build script stages that HTML in place of the historical wrapper asset.

Keep signing keys and private field evidence outside the handoff. Preserve job data through upgrades. Publishing, destructive changes, and sensitive transfers require the applicable authorization. Report browser, automated, emulator, and physical-device verification separately.

## Build 2 private master archive authorization

The user explicitly requested the original signing key and password inside the single private master ZIP and stated it will not be shared with coworkers. Include only the authorized original files in top-level `PRIVATE_SIGNING/`, outside `Source/` and the Android/iOS public web folders. Do not display secret contents or embed them in source, APK assets, logs or deployment files. The generic exclusion rules still apply to public/coworker packages.
