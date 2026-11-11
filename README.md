NightSweep 2.0 Alpha build 1
Android Preview installer: NightSweep-2.0-build1-preview.apk · version code 25 · November 10, 2026
This build is the design pass from the 1.8 walkthrough. The app is easier to start and quicker to read on a phone. The RF and power math is unchanged, and so are your saved jobs. It updates NightSweep 1.8 Preview build 2 in place.
This build has not been run on a real phone yet. Back up your jobs before you install it, and try it on your own phone before anyone else does.
Before you install
Open NightSweep 1.8 and back up every job you care about with Files → Save project. Save the files somewhere outside the app, like Downloads or Drive.
Keep 1.8 installed. Do not uninstall it first. Uninstalling deletes the jobs stored in the app.
Install on Android
Copy the APK to your phone, or download it there.
Tap it. If Android asks, allow installs from that app (Files, Chrome or Drive).
Tap Update. It installs over 1.8 Preview build 2 and keeps your jobs, because it has the same package name and signing key.
Open NightSweep. The launcher name is NightSweep 2.0 Preview build 1. Check that your saved jobs are still in Job → Details.
If Android says App not installed, stop there. Don't uninstall 1.8 to make it work. Send me the exact message instead.
There is no going back to 1.8 without uninstalling, and uninstalling deletes the jobs on the phone. That's why the backup in step 1 matters.
iPhone: iPhones need the web version hosted at an HTTPS link, and this package doesn't publish one. The 2.0 web build is in the source package (dist/), ready for Phase 2 of the roadmap.
What changed
Where
Change
Home
The working job and seven task buttons come first, numbered in night order. The practice library and the install and update panel moved below them. Home is 2.9 phone screens long instead of 4.2.
New blank job
Asks 42/54 (GS7K, GainMaker) or 204/258 (Vecima, AOI) first. 42/54 starts at 31 dBmV at 54 MHz and 43 dBmV at 860 MHz and picks the 42 MHz meter workflow. 204/258 starts at 261/993 MHz and picks the XPERTrak workflow. Both are starting values; replace them with your measured launch.
Job list
A new job goes into the job list right away and saves itself as you work. "Save named job" is now Save now. Files → Back up project makes the file for moving a job or keeping a safe copy.
Route points
Part number or model comes first: type the part on the faceplate (OTTZ-4-17, SAT MM 4-23) and type, family and model fill in. Each part number in the catalog is unique, so the right part is picked.
Route points
Each point shows a Predicted table at both launch frequencies: equipment input, through and tap port, plus tap-port tilt. The detailed math at one frequency is still below it.
Route points
+ Add point copies the cable type from the span before it.
Power
Start from route builds the power plan from the amps on your route: who feeds whom, cable feet between them and each span's cable. It assumes the supply feeds at the route start. Fix that if yours inserts elsewhere, then pick each amp's power model or enter its measured load.
Predicted levels
The chart comes first. Chart settings and the fine print are folded under Chart settings and About these numbers.
Setup, Frequency
Repeated warnings are in one About these numbers panel. When every Frequency row has the same status, it's said once above the table.
Names
Equipment → Catalog, Equipment setup → Amp / node setup, Sweep setup → Meter setup, Sweep → Predicted levels, Records → Acceptance.
Catalog
Search by model or part number comes first. It shows 12 parts until you search or pick a category, so it's 4 screens long instead of 13.
Header
Day/night is a sun or moon icon. The version shows in Help instead of on every screen.
Web version
Fixed a 1.8 bug where a phone's first visit wrongly said "An app update is ready."
Not in this build: the one-screen-per-amp station view and the new field calculators from the research. Those are next on the roadmap.
Try it tonight (about 10 minutes)
Open a saved 1.8 job. Check that the route, readings and meter files are all there.
Tap New blank job, pick your plant, and check the launch levels in Route → Setup.
Add two points. Type a real tap part number, and check the low/high numbers and tilt against what you'd expect.
On a route with amps, try Power → Start from route.
Back up the job with Files → Back up project, and open the file on another phone or in Chrome.
Use it in airplane mode for a few minutes.
Anything wrong, confusing or slow, note the screen and what you tapped.
How it was checked
Automated tests: 58 suites, 1,074 checks, all passing. That's the 57 suites from 1.8, updated for the new version and names, plus 8 new checks for this build's changes. The math tests are unchanged and still pass.
Phone-size browser: I went through all 19 task screens at Pixel 7 size in Chromium with no script errors.
APK, checked with Google's own tools:
Package com.spencerwilliams.nightsweep.preview, version code 25, version name 2.0 Alpha build 1.
Signed with your original Preview certificate, the same one as 1.8 build 2 (SHA-256 a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca), using signature schemes v2 and v3.
Aligned, and the app inside is exactly the tested build.
No signing files are inside the APK.
APK SHA-256: c6f88eda459111a39fb6a357febb8188707a854c7869f2310c178d760ce5c881 (287,260 bytes)
Not checked: a real Android phone or iPhone, the update keeping jobs on an actual device, native save, share and print, or offline cold starts on a phone. The 1.8 notes say the Android emulator's WebView crashed on both 1.7 and 1.8, so this needs a real phone.
Good to know
Practice jobs, the equipment catalog and the offline guides are unchanged. The guides inside the app still say 1.8.
Start from route leaves each amp's power model for you to choose. It doesn't guess AGC versus thermal, or the status-monitor options.
This APK was signed with the key in your 1.8 master ZIP. Keep that ZIP private, and don't share it with coworkers.
The source package has the full 2.0 code, tests and web build, with its change history. Keep it with your NightSweep files.
