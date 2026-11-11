# Carpe Noctum 2.0 Alpha build 2 — Android Preview APK

*Formerly NightSweep.* Android Preview installer `CarpeNoctum-2.0-build2-preview.apk` · version code 26 · source commit `38e316f` (merged at `897c17c`).

This build renames the app from NightSweep to **Carpe Noctum**, and it includes the design pass from the 1.8 walkthrough. The RF and power math is unchanged, and so are your saved jobs. It updates NightSweep 1.8 Preview build 2 in place, and also 2.0 Alpha build 1 if you installed that.

> **This build has not been run on a real phone yet.** Back up your jobs before you install it, and try it on your own phone before anyone else does.

## Before you install

1. Open NightSweep 1.8 and back up every job you care about with **Files → Save project**. Save the files somewhere outside the app, like Downloads or Drive.
2. Keep 1.8 installed. **Do not uninstall it first.** Uninstalling deletes the jobs stored in the app.

## Install on Android

1. Copy the APK to your phone, or download it there.
2. Tap it. If Android asks, allow installs from that app (Files, Chrome or Drive).
3. Tap **Update**. It installs over NightSweep 1.8 Preview build 2 and keeps your jobs. It has the same package ID and signing key; only the name you see changed.
4. Open **Carpe Noctum**. The launcher name is **Carpe Noctum 2.0 Preview build 2**, and it replaces the NightSweep icon. Check that your saved jobs are still in **Job → Details**.

If Android says **App not installed**, stop there. Don't uninstall 1.8 to make it work.

There is no going back to 1.8 without uninstalling, and uninstalling deletes the jobs on the phone. That's why the backup in step 1 matters.

**iPhone:** iPhones need the web version hosted at an HTTPS link, and this repo doesn't publish one. The web build is in `dist/`.

## What changed

| Where | Change |
| --- | --- |
| Name | NightSweep is now **Carpe Noctum**: the header, launcher, web app name, Help and run sheets. Backups made in NightSweep still open, because the file format didn't change. |
| Home | The working job and seven task buttons come first, numbered in night order. Home is 2.9 phone screens long instead of 4.2. |
| New blank job | Asks **42/54** (GS7K, GainMaker) or **204/258** (Vecima, AOI) first. 42/54 starts at 31 dBmV at 54 MHz and 43 dBmV at 860 MHz. 204/258 starts at 261/993 MHz. Both are starting values; replace them with your measured launch. |
| Job list | A new job goes into the job list right away and saves itself as you work. **Files → Back up project** makes the file for moving a job. |
| Route points | **Part number or model** comes first: type the part on the faceplate and type, family and model fill in. |
| Route points | Each point shows a **Predicted** table at both launch frequencies, plus tap-port **tilt**. **+ Add point** copies the cable type from the span before it. |
| Power | **Start from route** builds the power plan from the amps on your route. Pick each amp's power model yourself. |
| Predicted levels | The chart comes first. Settings and fine print are folded under **Chart settings** and **About these numbers**. |
| Names | Equipment → **Catalog**, Equipment setup → **Amp / node setup**, Sweep setup → **Meter setup**, Sweep → **Predicted levels**, Records → **Acceptance**. |
| Catalog | Search by model or part number comes first; 4 screens long instead of 13. |
| Header | Day/night is a sun or moon icon. The version shows in Help. |

Not in this build: the one-screen-per-amp **station view** and the new field calculators.

## APK

- Package `com.spencerwilliams.nightsweep.preview`, version code 26, version name 2.0 Alpha build 2.
- Signed with the original Preview certificate, SHA-256 `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`.
- APK SHA-256 `2fd242112647c9b8f78006845b984bb1c11344eef81e2fcb7d779abca4a22f41` (287,260 bytes).

## Test status

- The build workspace reported 58 suites passing. A later run from the source package alone got **57 of 58**: the release-identity suite needs Android build receipts that aren't in the source package. Rendered Chromium checks passed in that run.
- **Not checked:** a real Android phone or iPhone, the update keeping jobs on a real device, native save/share/print, offline cold starts, field acceptance.
- Known gap: in-app training text still uses some pre-2.0 screen names (Save named job, Records, Equipment setup).
