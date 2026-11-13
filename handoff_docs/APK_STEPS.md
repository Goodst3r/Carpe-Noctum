# Installing Carpe Noctum 2.0 Alpha build 3 on your phone

For Spencer. Written Nov 13, 2026 by the finishing session. **No assistant has run this APK on a phone or an emulator.** You are the first real-device test.

## The file

| | |
| --- | --- |
| File | `CarpeNoctum-2.0-build3-preview.apk` (471,580 bytes). Sent to you outside the repository; it is not committed. |
| APK SHA-256 | `0aca97bb4070bebceb55d297ec98ecc91d2c10e674cf796e3f7c36c2eb2b6977` |
| App | Carpe Noctum 2.0 Alpha build 3, label "Carpe Noctum 2.0 Preview build 3" |
| Package / version code | `com.spencerwilliams.nightsweep.preview`, code **27** (build 2 is 26) |
| Signed with | your **original** key. Certificate SHA-256 `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`, the same as build 2 |
| App inside | `build3` `248e778`; standalone SHA-256 `844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137` |

Because the package and the signing certificate match build 2 and the version code is higher, **Android installs this as an update. Do not uninstall build 2 first.** Uninstalling deletes everything the app has stored on the phone.

## 1. Back up first (10 minutes, do not skip)

The update keeps your data, but take copies in case you need to go back.

1. Open the app (build 2). For **each job you care about**: open it, go to **Home → Back up project**, and finish the save or share step. Check that each backup file exists in your Files or Downloads, outside the app.
2. If you can, open one of those backups on another device or in a browser copy of the app to prove it opens (**Home → Open project backup**).
3. Build 2 has no Supply PM notebook, so there is nothing to export there. (From build 3 on, use **Plan → Supply PM → Export notebook** before any future reinstall.)

## 2. Install the update

1. Get `CarpeNoctum-2.0-build3-preview.apk` onto the phone, for example in Downloads.
2. Optional check: if you have a file-hash app, the SHA-256 must be `0aca97bb…6b2977`. If it differs, stop.
3. Tap the file. If Android asks, allow your Files app or browser to install unknown apps.
4. Android should say it is **an update to an existing app**. Tap **Update**. If it instead offers a fresh install, or says the app conflicts with an existing package, **stop**: do not uninstall anything. Note the exact message and tell Claude.

## 3. Phone checks, in this order

Write down anything that looks wrong, with the step number.

1. **It opened as build 3.** The launcher label reads "Carpe Noctum 2.0 Preview build 3", and the header says 2.0 Alpha build 3.
2. **Your data survived.** Plan → Details → Named jobs lists your jobs. Open two of them and spot-check a few route points, readings and notes.
3. **Attached files survived.** In a job with attached meter files, Field → ONX files says the saved originals were verified.
4. **The Named jobs fix.** Close the app fully (swipe it away), reopen it with a job that has attached files, go to Plan → Details: **New blank job, Save now, Open, Duplicate and Delete must all be tappable** (build 3 fixed them staying greyed out).
5. **New navigation.** The bottom tabs are Home, Plan, Field, Tools and Closeout. The Safety screen is gone, as you asked.
6. **New tools open and calculate.** Tools → Calculators: power sum and the cascade thermal CNR. Tools → DOCSIS health shows headroom. Field → Night log opens. The context strip shows the job, plant and point.
7. **Supply PM.** Plan → Supply PM: save a practice visit, tap **Export notebook**, confirm the file appears in Downloads or Files, delete the practice supply, then **Import notebook** to bring it back, and delete it again.
8. **Files out and in.** Home → Back up project saves through Android's picker or share sheet. Print or share a run sheet once.
9. **Offline.** Turn on Airplane mode with Wi-Fi off, close the app fully, reopen it, and run one practice calculation.
10. **Speed.** Start-up to Home and typing a meter reading on your longest route should feel at least as quick as build 2.

## 4. If you need to go back to build 2

Android does not allow installing an older version code over a newer one, so going back means an uninstall. **Uninstalling deletes the app's stored data.**

1. In build 3, back up every job you changed (Home → Back up project) and export the Supply PM notebook (Plan → Supply PM → Export notebook). Check the files exist outside the app.
2. Uninstall build 3. Install the build 2 APK in the repository: `apk/CarpeNoctum-2.0-build2-preview.apk`.
3. Restore jobs with **Home → Open project backup**: your step 1 backups from build 2 always work. Backups made by build 3 into build 2 were **not tested** by any assistant.
4. Build 2 has no Supply PM screen; keep the exported notebook file for when you return to build 3.

## What was and was not checked

- **Checked by the finishing session, on this exact APK:**
  - `apksigner verify` passes with v2 and v3 signatures, one signer, the certificate above.
  - `zipalign -c 4` passes.
  - `aapt2 badging` reports the package and code 27.
  - The embedded `assets/index.html` equals the frozen standalone hash.
  - The manifest matches build 2's apart from version and label: package, file-provider authority, activities, `allowBackup=false`, min SDK 26, target SDK 35.
  - The Android wrapper code differs from build 2 only in label and version strings.
  - The password does not appear in the build log.
- **Tests on the app code:** the frozen `build3` head passed the full automated gate (desktop Chromium at phone sizes plus jsdom). Grok and ChatGPT each gated the pre-#47 head `fc7e9c8`, with identical results.
- **Not checked by anyone:** a physical phone, an emulator, the Android installer's update path, the share sheet and file picker on a real device, real meters and field use.
