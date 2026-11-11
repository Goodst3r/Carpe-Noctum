# NightSweep 1.8 Alpha build 2 — Android and iOS installation

Installation, offline use, updates and project backups for Android phones/tablets, iPhone and iPad. Prepared November 11, 2026.

## Read this before choosing an installation

The single delivery is **NightSweep 1.8 Alpha build 2.zip**. Extract its one folder, **NightSweep 1.8 Alpha build 2/**, before opening files. It separates Android web, Android APK, iOS web, documentation, examples, source and verification records.

| Option | Where in the package | How to use it |
| --- | --- | --- |
| Android Preview installer | `Android/APK/NightSweep-1.8-build2-preview.apk` | Check its accompanying build/signature receipts, then follow section 7. Expected version **1.8 Alpha build 2**, code **24**, launcher **NightSweep 1.8 Preview build 2** |
| Android web | `Android/Web/NightSweep.html` and `Android/Web/PWA/` | Standalone HTML or complete static PWA; supported browser installation requires an appropriately hosted copy |
| iPhone/iPad web | `iOS/Web/NightSweep.html` and `iOS/Web/PWA/` | Same shared app; local Files previews are separate from Safari Home Screen installation |
| Readable guides | `Documentation/` | Save/read the Markdown, standalone HTML or printable PDF files locally |
| Practice backups | `Examples/` | Seven synthetic JSON exports load with Files → Open project |
| Source and checks | `Source/` and `Verification/` | Source plus public verification evidence; private signing material and toolchains are excluded |

An APK is accepted into the release only after real compilation and manifest, original-certificate, v2/v3 signature, alignment and exact embedded-HTML checks. Read the final package receipts for what actually passed. Those checks are separate from installation, data retention, picker/share/print and offline reopening on your own phone.

**This local build does not publish a hosted update.** The known site is **https://nightsweep-field.goodst3r.chatgpt.site/**. Check the version displayed by the app served there. Opening that URL or adding its icon does not automatically deliver build 2. The bundled **PWA/** directories are complete hosting inputs, not a Safari/Chrome install action by themselves.

**An iPhone or iPad cannot install an Android APK.** Opening local HTML in Files does not install a Home Screen web app. For that installation, use an approved HTTPS-hosted copy in Safari. There is no iOS IPA or App Store installer in this package.

## 1. Back up existing work first

Do this in the app, browser or icon that currently contains your work, before an update, phone change, browser change or transfer. Keep one NightSweep window open while editing a job.

1. Open the job you need. Under **Job → Details**, check its name and route. Review records and **Job → ONX files** for its original attachments.
2. Choose **Files → Save project**. In the build 2 interface, **Home → Export project backup** opens the same backup action. Export each important job separately; the current-job export is not an archive of every named job.
3. If **Your file is ready** appears, tap **Save/share file** and finish the phone's save action. On iPhone/iPad, choose **Save to Files** when offered. Alternatively use **Download file** and locate the browser download. On an APK, finish Android's document-save picker.
4. Find the resulting `.json` file outside NightSweep, in Files/My Files, Downloads or your selected folder. A build 2 export normally starts as `NightSweep_1.8_Alpha_build_2_Project.json`; older versions use their own filename. Give each job/date copy a recognizable name. A prepared file or sharing message alone does not prove that the file was saved.
5. Keep that external file until you have verified a successful restore at the destination. If you store it in a cloud drive, download a copy to the phone before relying on it offline. Follow your employer's rules for moving job records and evidence.

A **full project JSON includes the current job and its available original evidence bytes**, within the export limits. Autosave, a named job, a report CSV/PDF, a screenshot, a trace filename or a saved web page is not that portable backup. If export reports missing or failed original-file verification, keep the current app intact and recover/reattach the original before relying on the backup.

### Storage boundaries

The Android APK and web app keep separate jobs. Different phones, browsers and browser profiles also keep separate storage. Safari and a Home Screen web app may have separate storage; do not assume adding an icon transfers a Safari job. A local HTML copy has its own storage behavior and cannot read the APK's jobs.

NightSweep does not automatically synchronize jobs or keep a server backup of them. Browser/device storage management can remove local work. **Protect local storage**, when offered on Home, is a browser-controlled request and does not replace exported backups.

## 2. Android — use Chrome or install a Home Screen icon

1. Connect to the internet and open the hosted app address in a regular **Chrome** tab. If a text/email link opens inside another app, open its address in Chrome. Avoid Incognito for saved jobs.
2. Check the displayed NightSweep version. On **Home**, keep the app online until **Ready for offline use** appears. Merely seeing a calculator or adding an icon does not confirm that offline setup finished.
3. To add an icon, use **Install app** on Home when offered. Otherwise open Chrome's **⋮ / More → Install and create shortcut → Install**. Some versions instead show **Add to Home screen**, followed by an installation/shortcut choice. Follow the phone's prompts.
4. Install from the actual app page, not an installation-guide page. A browser shortcut may open a normal tab; an installed web app may open its own window.
5. Open the new **NightSweep** icon while online. Check the version and wait for **Ready for offline use** there. If your job is missing, restore its project JSON using section 4.
6. Perform the offline reopening check in section 5 before field use.

You may also continue using a bookmarked Chrome tab. Use the same browser/profile consistently. Phone policies can restrict web-app installation; follow your organization's approved process.

## 3. iPhone or iPad — add the Safari Home Screen app

1. Connect to the internet and open the hosted app address in a regular **Safari** tab. Open the address in Safari if it first appears inside another app. Check the version shown by NightSweep.
2. Export existing Safari jobs before switching to the new icon, using section 1.
3. On **iPhone**, open Safari's **Page Menu → Share**, or tap the **Share** button if it is directly on the toolbar. Scroll to **Add to Home Screen**. If that action is absent, check **Edit Actions** at the bottom of the share sheet.
4. On **iPad**, open **Share**; use **View More** if shown, then choose **Add to Home Screen**.
5. Turn on **Open as Web App** when that option is available, keep a recognizable name such as **NightSweep**, then tap **Add**. Safari layout and menu placement vary by iOS/iPadOS version.
6. Return to the Home Screen and open the new icon while online. Check the displayed version. Stay on Home until **Ready for offline use** appears.
7. Restore your project JSON inside this icon app if needed, then perform section 5's offline check.

The icon is added on that device; it does not automatically copy jobs to another phone or iPad. Use the installed icon consistently for continuing work. If device management hides installation actions, ask the device administrator for the approved method.

## 4. Open, restore or transfer a project

1. Export the destination app's current work first. Keep the original app and external backup available during the transfer.
2. Put the full project `.json` on the destination phone using an approved transfer method. Make the file locally available if its folder is cloud-backed.
3. Open the destination NightSweep app/browser/icon and choose **Files → Open project**. In build 2, **Home → Open project backup** reaches the same picker. Select the JSON file and review any replacement confirmation.
4. Verify the job name, route, readings, records and notes. Under **Job → ONX files**, confirm the expected original attachments. Use **Verify saved files**, then **Save original** on an attachment to check that original bytes remain available. A filename typed in a record alone does not attach its original file.
5. Save the restored job under **Job → Details → Save named job**. Keep the external full project backup as a separate recovery copy.

**Open project** restores a NightSweep project JSON. To add meter files or photographs to an existing job, use **Job → ONX files → Add meter files or photos** instead. In build 2, limits are 8 MiB per attachment, 12 MiB of originals and 30 attachments per job, with a 20 MiB project-file limit. If a limit blocks an operation, retain the originals and export manageable jobs separately.

Sharing/download cancellation does not save a backup. Return to the prepared-file panel and retry **Save/share file** or **Download file**; check the destination file yourself.

## 5. Verify offline use on your own device

1. Back up real work. For a practice check, use **Home → Practice library → Open complete training job** in build 2. If that example is already open, its button reads **Reset complete training job**; resetting keeps the current practice copy in named jobs. Training stays clearly synthetic; it is not field evidence.
2. In the browser or icon you will actually use, wait for **Ready for offline use**.
3. Enable **Airplane Mode** and make sure Wi-Fi is also off.
4. Close and reopen NightSweep through that same installed icon, or reopen its saved address in the same browser/profile. This checks a fresh launch, not just a page left open in memory.
5. Open a calculator and enter a practice value. Open a saved job and verify an original attachment is available. Reconnect afterward.

The prepared app, its bundled guides and locally saved jobs/evidence are intended to work offline. Initial setup, hosted updates, manufacturer links and files still waiting to download from a cloud drive need a connection. A package's separate PDF/HTML documents are available offline only when you have saved those documents locally.

If the app will not reopen offline, reconnect through the same icon/browser, choose **Retry offline setup** when offered, wait for readiness and repeat the check. Preserve your working data while investigating.

## 6. Update the hosted browser/Home Screen app

These controls update the release served by the website. They do not update an APK or replace a downloaded standalone HTML file. The local build 2 package does not become a hosted update until it is published.

1. Export each important job and verify its external JSON backup. Finish current file operations and close other NightSweep windows.
2. Connect to the internet. On **Home**, choose **Check for updates**.
3. When an update is offered, choose **Install update** and review the backup reminder.
4. When offered, choose **Reload app**. This is a separate action; an open job is not deliberately reloaded without your choice.
5. Check the displayed version, restored/saved work, original attachments and **Ready for offline use**. Repeat the offline reopening check before field use.

If the website still serves an older release or offers no update, keep your backups and verify availability with the maintainer. Do not erase storage or remove the icon to force a version change. A failed update is intended to retain the prior verified offline copy; confirm readiness on the device before relying on it.

## 7. Android Preview APK installation and compatible update

Use **Android/APK/NightSweep-1.8-build2-preview.apk** only with its matching verification records. The expected identity is:

| Item | Build 2 expectation |
| --- | --- |
| Application ID | `com.spencerwilliams.nightsweep.preview` |
| Version name / code | `1.8 Alpha build 2` / **24** |
| Launcher label | **NightSweep 1.8 Preview build 2** |
| Android minimum | Android 8 / API 26 |
| Update identity | Original Preview certificate and continuing private document origin/provider identity |

1. Export and verify every important project from the existing app. Keep the old installed app and backups available.
2. Read the package's verification summary and check the intended installer filename/version. The build/signature checks must match this APK, not an older receipt.
3. Open the APK from Files/My Files and follow Android's installer prompts and your organization's sideloading policy. Allow only the intended installer source when required by device policy.
4. For an existing compatible Preview, install as an **update**. A compatible update requires the same package and signer plus a higher code; build 2 uses 24. Do not uninstall the working app or clear data to force installation.
5. Open the updated **NightSweep 1.8 Preview build 2**, check its displayed release, named jobs, working route and original attachments. Verify an exported original and full project backup. Reopen offline and check native picker/share/print behavior on the actual phone.
6. If Android reports a signature/package conflict, stop and check the current installed identity with the maintainer while preserving its data.

The older standard 0.13 installer has a different signing identity from the original Preview key. A Preview APK can coexist as a separate app/store; transfer needed jobs using full JSON exports. Do not assume it can update the different standard package in place.

No technician needs a private signing key or backup to install the accepted APK. Private material stays out of the delivery. The website's **Check for updates → Install update → Reload app** controls update the hosted web app, not an APK. APK/browser transfers still require full-project export/import.

## 8. Common problems and safe next steps

| Problem | What to do |
| --- | --- |
| The website displays 1.7 | The local build 2 update has not been published by this work. Check the served version with the maintainer. Keep your jobs and backups. |
| **Install app** or **Add to Home Screen** is missing | Open the actual hosted app in regular Chrome/Safari, check the platform menu above, and check organization restrictions. Android can continue in Chrome. |
| Jobs are missing after adding an icon or changing browsers | Return to the app/browser that contains them, export full JSON backups, then import and verify at the destination. A blank list does not establish that the original data was deleted. |
| A prepared export is not in Files | Complete **Save/share file** or **Download file**; check Downloads and the selected folder. Retry the export if necessary and confirm the saved file exists. |
| A cloud JSON/evidence file will not open offline | Download it to the phone while connected, then retry the picker. Cloud listings alone do not guarantee local bytes. |
| The app opens but is not ready offline | Keep it connected and open; use **Retry offline setup** if offered. Check available device storage without deleting NightSweep data. |
| An original attachment fails verification | Keep the current app and backups. Recover/reattach the original and retry. Do not treat a preview or screenshot as a substitute for missing original bytes. |
| A local HTML file shows a preview or blocked controls | The file viewer may limit executable HTML or storage. Use the hosted app for the phone's installed offline workflow when the required release is available. |
| An update appears stuck or an APK conflicts | Preserve/export work, finish pending file actions, close other NightSweep windows and contact the maintainer if it persists. Avoid clearing website/app storage, resetting browser data or uninstalling as a first remedy. |

## References and verification scope

Platform menus were checked against Google's [Use web apps — Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en) and Apple's [Turn a website into an app on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios) and [on iPad](https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados), retrieved November 11, 2026. Menu wording can differ on older versions.

App control labels and release status follow the current local source and validation record. Verification includes desktop Chromium and automated checks; physical Android/iPhone/iPad installation, Safari/WebView storage retention and phone picker/share/print behavior are still device checks. This guide does not claim that the hosted site or any phone has been updated to build 2.

For the task-by-task application guide, see [NightSweep_1.8_Alpha_Functions_README.md](NightSweep_1.8_Alpha_Functions_README.md).
