# NightSweep 1.7 Alpha

**Technician guide and README**  
**Spencer Williams · Updated November 11, 2026**

NightSweep is an offline field calculator and job notebook for HFC maintenance technicians, team leaders, and supervisors. Use it to follow cable and equipment losses, check amplifier gain, locate a TDR distance along a route, estimate power loading, and keep measurements, notes, and meter files together.

Use the Android APK, open the full web app in Chrome on Android, or add the web app to an iPhone Home Screen through Safari. The web app must finish its first online setup before you rely on it offline. Every version uses the same task layout; jobs stay in the app or browser where you create them until you export and transfer them.

Version 1.7 brings the launch source and equipment setup into the field sequence. Choose a **Node output**, **Amplifier / LE output**, or **Manual / other output** in **Route → Setup**, then open the matching **Source setup & manual**. Review applicable manual steps under **Route → Equipment setup**, continue through your cable route and sweep setup, and save readings and evidence with the job. A source choice does not add an artificial gain block, set launch levels from a rating, or apply test-point correction automatically.

The five main tabs remain **Home, Route, Test, Power, and Job**. Equipment setup notes and reviewed steps are job records; RF predictions, measured readings and acceptance remain separate. The 42/54 MHz forward and Return Sweepless Sweep workflow stays distinct from the 204/258 MHz forward Sweepless Sweep and XPERTrak return sweep workflow.

**Your deployed equipment split:** Vecima nodes and AOI active equipment use **204/258 MHz high split**. GS7000/GS7K, GainMaker and all other node/amplifier families in your fleet use **42/54 MHz**. Training follows this rule. Manufacturer capability tables may describe other variants; they do not change your installed split. Existing saved jobs are preserved for review rather than silently rewritten.

**Start with the task, then enter only its required information.** You do not need to complete the advanced record forms to calculate a span or locate a TDR event.

## Quick start

For a new field job:

1. Open **Job → Details** and choose **+ New blank job**. Enter a useful name and node or asset. Save a named job when you want it in the local job list.
2. Open **Route → Setup**. Choose **Node output**, **Amplifier / LE output**, or **Manual / other output**. For a node, select its model, installed split, RF port and operating upper frequency. For an amplifier or LE, select the exact configuration and output port.
3. Enter the actual low/high frequencies, launch levels and cable temperature. If using a test point, enter only the coupling the meter has not already added. Changing the source identity preserves your entered levels; review them for the new physical connection.
4. Choose **Source setup & manual**, or **Route → Equipment setup**. Select the source or a route active, read its applicable manual and record the steps actually reviewed. If the exact manual is unavailable, obtain it before applying equipment-specific adjustments.
5. Continue to **Cable route**. Add spans and ending equipment in feed order, starting directly from the selected source output. Use **Amp gain**, **TDR** or **Readings** when those tasks are needed.
6. Follow **Test → Sweep setup** for the actual plant split and approved method. Attach original meter files under **Job → ONX files**, then review **Job → Run sheet**.
7. Use **Files → Save project**, finish the phone's save action, and confirm the portable backup exists outside NightSweep.

Home offers **Open complete training job**, **Open GainMaker OEM AGC practice**, **Open GainMaker / DSIM practice**, and **Open GS7K node practice**. Choose the complete example for every tool, or a focused node/amplifier exercise for its exact setup path. Follow the [guided training walkthrough](#practice-every-tool-with-the-training-job). The initial three-tap sample and **3-tap route example** in **Route → Cable route** remain a smaller RF-route example; they are separate from the complete training job. Practice readings are synthetic. Explicit user-supplied local design references are labeled separately and require the matching plant, frequency, signal-power convention and measurement plane.

## Find the right tool

| What you want to do | Where to go | What you need first |
| --- | --- | --- |
| Find a task or learn the basic flow | **Home** | Nothing |
| Choose node / amp / LE launch and enter levels | **Route → Setup** | Exact source output, frequencies, levels and measurement plane |
| Follow the installed equipment manual | **Route → Equipment setup** | Exact module, split, firmware and applicable guide |
| Build cable and passive spans | **Route → Cable route** | Lengths, cable, equipment, actual feeds |
| Check whether an amp or LE has enough gain | **Route → Amp gain** | Active route point, gain at both markers, output targets |
| Look up cable/passive/active equipment | **Route → Equipment** | Manufacturer, model, or part type |
| Turn a TDR reading into a span location | **Test → TDR** | Route distances and measurement origin |
| Follow the measured forward/return setup process | **Test → Sweep setup** | Split, actual test method, matching reference and approved criteria |
| See predicted RF levels across frequency | **Test → Sweep** | Launch and route |
| Check a single cable/passive combination | **Test → Frequency** | Cable length, passive path, frequency |
| Compare a meter reading with a prediction | **Test → Readings** | Route point, frequency, reading, remaining TP coupling |
| Look up cable loss, tap faces, or frequency references | **Test → References** | Matching equipment or route tap as needed |
| Estimate supply draw and equipment voltage | **Power → Load** | Actual power circuit and equipment loads |
| Try an additional cable/load before keeping it | **Power → What-if** | Existing power plan |
| Save/open named jobs and record node details | **Job → Details** | Job and installed equipment information |
| Attach Sweep, Ingress, or OneCheck files | **Job → ONX files** | Files already available on your phone |
| Record inspection and repair work | **Job → Checklists** | Work actually performed |
| Maintain measurement and acceptance records | **Job → Records** | Approved procedure, criteria, readings, and traces |
| Review, print, or share the field summary | **Job → Run sheet** | Current job data |
| Read the calculation methods | **Help** from the header or Home | Nothing |

Main tabs choose the work area. The smaller task tabs choose a function within that area. The point selector chooses which route location you are editing. Use **Previous** and **Next** when working down the route instead of scrolling past every point.

## Install and update

Choose the instructions for your phone:

| Phone | What to open | Installation method |
| --- | --- | --- |
| Android — no APK needed | **[Open the web app](https://nightsweep-field.goodst3r.chatgpt.site/)** in Chrome | Use the browser, or optionally add a Home Screen icon; [Android instructions](https://nightsweep-field.goodst3r.chatgpt.site/android) |
| Android 8 or later — APK option | **NightSweep-1.7-preview.apk** from the coworker package | Install the APK with Android's installer |
| iPhone | **https://nightsweep-field.goodst3r.chatgpt.site** in Safari | Add the website to the Home Screen as a web app |

The Android launcher label is **NightSweep 1.7 Preview**; the release version is **1.7 Alpha**. An APK is an Android installer and cannot be installed on an iPhone. The iPhone version uses Safari and a Home Screen icon; there is no IPA or App Store installer in this package.

### Android web app — no APK installation

The [Android page](https://nightsweep-field.goodst3r.chatgpt.site/android) has the same instructions as **ANDROID_INSTALL.html** in the coworker package.

1. Open **[NightSweep](https://nightsweep-field.goodst3r.chatgpt.site/)** in a regular Chrome tab. If a text or email opened the page inside another app, open the address in Chrome.
2. On **Home**, wait for **Ready for offline use**. Keep using this browser tab if you do not want an installed icon. Bookmark the app address.
3. For an optional Home Screen icon, tap **Install app** on Home when offered. You can also use Chrome's **⋮ → Install and create shortcut → Install**, or **Add to Home screen → Install**, depending on the version. Install from the app page rather than this guide.
4. Open the new **NightSweep** icon while online and check its offline-ready message. The browser controls prompt availability; a shortcut may open a browser tab.
5. Export real work, then try the included training job with Airplane Mode on and Wi-Fi off. Close and reopen the same tab or icon and verify that calculations and a saved attachment work.

**The APK and web app have separate storage.** To transfer a job, export it from the APK using **Files → Save project**, complete Android's save dialog, then use **Files → Open project** in the web app. Check the route, notes and original attachments before continuing. Repeat for each job. Chrome, another browser, another profile and another phone do not automatically share jobs. Use one NightSweep window at a time.

When a browser export shows **Your file is ready**, choose **Save/share file** or **Download file** and complete the phone's action. Confirm the JSON file in **My Files / Files → Downloads** or your chosen location. Browser-managed storage and optional **Protect local storage** do not replace backups.

The coworker package also includes **NightSweep.html**, a runnable single-file calculator. A browser that permits local HTML and JavaScript can open it directly. Android file viewers may limit scripts, file importing and storage, so the hosted web app is the normal phone option. The local file has no verified web-app offline installer or automatic update flow; retain separate project exports. This is the requested runnable HTML app, not the developer source archive.

Google's [Android web-app installation guide](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en) describes the current Chrome menu. Device management can restrict web-app installation, while browser use may remain available under your employer's policy.

### First APK installation on an Android phone

If 1.4, 1.5, 1.6 or 1.7 Preview is already installed, follow **Updating an existing Preview** below. Otherwise:

1. **Download the coworker share ZIP** to your phone. If you downloaded the APK by itself, skip the extraction step.
2. **Open your file manager.** On a Samsung phone, open **My Files → Downloads**. Other phones may call it **Files**, **Files by Google**, or **Downloads**.
3. **Extract the ZIP.** Tap the downloaded ZIP and choose **Extract** or the equivalent action. Open the extracted folder. The ZIP is a package of files; Android installs the `.apk` file inside it.
4. **Read START_HERE.txt**, then tap **NightSweep-1.7-preview.apk**. Do not open the source archive or try to install the ZIP.
5. **Allow this installer source if Android asks.** Android may show **Settings**, **Install unknown apps**, or **Allow from this source** for the file manager/browser opening the APK. Review the prompt, enable that source if appropriate, then return to the installation screen. Names vary by Android version and phone.
6. **Tap Install.** Wait for the completion message. You may then tap **Open**, or find **NightSweep 1.7 Preview** in the app drawer.
7. **Check the version and first screen.** Confirm **1.7 Alpha** is displayed and that **Home** opens. A sample route may be present; use a new blank job for real plant work.
8. **Optional:** Return to Android's **Install unknown apps** settings and turn off the permission for that source after installation. NightSweep does not need that permission to run.

If a phone security policy or employer management policy blocks the installation, use the approved installation process or contact the device administrator. This guide does not require disabling phone protections. Android's print service and external manufacturer links may need their own available apps or connectivity; the calculations themselves work offline.

### Updating an existing Preview

1. In the installed Preview app, open each job you want to protect and use **Files → Save project**. A separate exported file is the backup.
2. Open the 1.7 preview APK on the phone and follow Android's installation prompts. If Android asks, allow installation for the app opening the APK.
3. The 1.7 Preview release uses version code **21** and is intended to update compatible 1.4, 1.5, 1.6 and earlier 1.7 Preview installations, including build 20. Keep your exported jobs and verify the updated app before continuing work. An installation conflict must be resolved without clearing the old app's data.
4. Open 1.7 and check your job list, one saved route, and its attachments. Keep the exported backups.

Physical-phone installation and data retention still need to be checked on your device. If Android reports a signing conflict or refuses the update, keep the installed app and export its jobs before considering any removal. Do not clear app storage as a first troubleshooting step.

### Moving from 0.13

The supplied 0.13 APK uses a different signing key. The preview app uses a separate package and can remain alongside it.

1. In 0.13, open a job and choose **Files → Save project**.
2. In 1.7 Preview, choose **Files → Open project** and select that JSON file.
3. Check route points, notes, measurements, and original attachments. Use **Save named job** under **Job → Details** if needed.
4. Repeat for every job you need. Keep 0.13 while checking the imports.

The apps do not automatically share storage. A run-sheet CSV, screenshot, or printed report is not a full project backup.

### First installation on an iPhone

The coworker package includes **IPHONE_INSTALL.html**, a short install guide, and **IPHONE_QR.png**, a QR code for the app address. You can also type or open the address directly; you do not need to extract the Android APK on the iPhone.

1. **Connect to the internet.** Open **Safari** and go to **[nightsweep-field.goodst3r.chatgpt.site](https://nightsweep-field.goodst3r.chatgpt.site)**. If a text or email opens the link inside another app, open that address in Safari to install it.
2. **Open Safari's Share menu.** Find **Add to Home Screen**; it may be farther down the share sheet. On Safari versions that show it, turn on **Open as Web App**. Menu placement and wording can vary by iOS version.
3. **Tap Add.** Keep a recognizable NightSweep name for the icon.
4. **Open the new Home Screen icon while still online.** Confirm that **1.7 Alpha** and the **Home** tab appear. Wait for **Ready for offline use**. A page merely being visible does not confirm that the offline copy has finished installing.
5. **Check offline operation before the first field job.** With a disposable example job, enable Airplane Mode and ensure Wi-Fi is off. Close and reopen NightSweep from its Home Screen icon. Open a tool, enter a test value, and confirm that the page and calculator still work. Reconnect when finished. If the app will not reopen offline, reopen it online and wait for the ready status before trying again.
6. **Create or import your working job from the Home Screen app.** Use **Job → Details → + New blank job**, or **Files → Open project** for an exported NightSweep project.
7. **Make a backup.** Choose **Files → Save project** or **Export backup** on Home. If **Your file is ready** appears, choose **Save/share file**, then **Save to Files** where offered, or choose **Download file**. Complete the iPhone save action. Find **NightSweep_1.7_Alpha_Project.json** in the Files app or the location you selected, and confirm that it exists outside NightSweep. Repeated downloads may receive a numbered name.

Use the Home Screen icon consistently for field work. A Safari tab and the installed Home Screen app may have separate storage. A job created in Safari may not automatically appear in the icon app. If that happens, return to the place where the job exists, export its project, then import that file in the app you intend to use.

**Use one NightSweep window at a time.** Close other NightSweep browser tabs before continuing a job. Concurrent windows can hold different copies of the same local state and overwrite later edits. Home's **Protect local storage** action can request that the browser retain the app's storage; approval and retention depend on the browser and do not replace backups.

### Updating the Android/iPhone web app or moving between phones

Before an update, export each job you need and close other NightSweep windows. Open the Home Screen app with a connection and choose **Check for updates** on Home. When a new version is offered, choose **Install update**, then **Reload app** when that action becomes available. Verify the version, a saved job, and **Ready for offline use** afterward. Do not delete the icon or clear website data to force an update while unexported work remains.

To move a job from Android to iPhone, between iPhones, or back to Android:

1. On the original device, open the job and use **Files → Save project**.
2. Transfer the exported `.json` file using an approved file-sharing method. Include the full project export, not just a report or screenshot.
3. On the destination device, open NightSweep in the app you plan to use and choose **Files → Open project**. Select the transferred file through its file picker.
4. Check route points, notes, readings, and evidence. Save a named job and export a new backup from the destination.

There is **no automatic cloud sync** between phones, Android and iPhone, or Safari and the Home Screen app. The hosted app address provides the software; it does not provide a server backup of your jobs. Original evidence files also remain local until you export or share them. Browser storage can be cleared or removed, including through device settings or storage management, so retain project files outside NightSweep.

### Offline use and sharing

The Android APK includes the app files. The Android/iPhone web app caches them after its initial online setup and shows **Ready for offline use** when the installed copy is ready. Calculations and available local jobs can then work without a connection. Manufacturer links need internet access. Imported files must be available to the phone; a file stored only in a cloud drive may need to be downloaded before you go offline.

The new coworker package includes only the four current 1.7 practice project exports: **NightSweep_1.7_Alpha_Training_Job.json**, **NightSweep_1.7_GainMaker_OEM_AGC_Practice.json**, **NightSweep_1.7_GainMaker_DSIM_Practice.json**, and **NightSweep_1.7_GS7K_Practice.json**. Use **Files → Open project** to open one. Older example exports are excluded from the new package; installing an update does not delete saved jobs on a phone.

The APK is an alpha for sideload testing, not a Google Play release. The coworker share package contains the Android APK, runnable NightSweep.html, START_HERE instructions, this HTML guide, separate Android/iPhone installation guides, and the app QR image. Developer source files, build scripts and test reports remain separate. Private signing material is not included in either package. The QR opens the same app address on Android or iPhone.

## Home and everyday navigation

Home provides task buttons and a short getting-started sequence. Choose the task that matches your question: building a route, checking an amplifier, locating a TDR distance, comparing readings, checking power, or managing a job.

The app opens on Home. The current job is shared across the app's task views. Moving between tabs does not create a different route or erase your work. **RF and power are separate circuits inside the job**, because the power feed can differ from the RF feed.

The Sun/Night control changes the display palette. It does not change data or calculations. Use the theme that is easiest to read at your work location.

A dash (**—**) means a result is unavailable. It is not zero. Read the nearby message before changing several inputs at once.

## Practice every tool with the training job

Home provides four separate practice choices in the APK and Android/iPhone web app. Every exercise remains labeled **SYNTHETIC TRAINING JOB** after editing, saving and export. Practice readings are teaching inputs, not evidence of physical AGC operation. The focused lower-split jobs separately identify the user-supplied local design references below; those are not manufacturer specifications or universal targets.

| Home choice | Plant and equipment | Guided steps | Original evidence supplied |
| --- | --- | ---: | --- |
| **Open complete training job** | Cedar Lane: Vecima EN9000 launch, AOI Quantum18 HGD/LE, branched 204/258 MHz route, power and records | 21 | Six synthetic files: five interchange CSVs and one original-only SVG diagram |
| **Open GainMaker OEM AGC practice** | Separate 42/54 MHz GainMaker HGD launch and downstream AGC LE | 8 | None; attach clearly labeled practice files yourself |
| **Open GainMaker / DSIM practice** | Separate 42/54 MHz GainMaker HGD launch and downstream LE with ACI DSIM practice notes | 9 | None; no fabricated meter captures or verified pilot lock |
| **Open GS7K node practice** | Standard GS7000 1.2 GHz launch, starting at 42/54 MHz; separate node-only setup exercise | 10 | None; launch/TP correction unverified, no RF route or captured traces |

The complete example uses AOI profile/Auto/Manual/ALSC guidance. GainMaker OEM AGC and ACI DSIM have their own exercises and pad rules. In the complete job, the retained legacy DSIM form is explicitly a separate form example, not control guidance for the AOI route.

### Start without losing your working job

1. If a real job is open, use **Files → Save project** and verify that its JSON file exists outside the app. Save its named entry as well if you want to reopen it from the local list.
2. Open Home and choose the complete, OEM AGC, DSIM or GS7K node practice job. Confirm the change-of-job prompt. The app keeps the current working job and its evidence in named jobs on this device before opening training; that local copy is still not an external backup. If preservation or evidence preparation fails, address the message rather than clearing storage.
3. Confirm the job name begins with **TRAINING**. Home shows **Guided practice** with 21 steps for the complete example, eight for OEM AGC, nine for DSIM, or ten for GS7K. Choose **Open step** to reveal the destination controls, try them, then mark **Reviewed**. The **Practice guide** button in the training banner returns you to the checklist.
4. Keep practice edits in the training job. Use a new blank job for real work; do not rename the training data and treat it as measured plant information.

While a training job is open, its matching Home button changes to **Reset complete training job**, **Reset GainMaker OEM AGC practice**, **Reset GainMaker / DSIM practice**, or **Reset GS7K node practice**. It preserves the current practice copy in named jobs before restoring the baseline exercise. Use it when you have changed several inputs; review the prompt before continuing. Progress checkmarks belong to the current training copy.

The training content is bundled with the app. After the Android/iPhone web app reports **Ready for offline use**, its training job can be used without a connection. External manufacturer pages still need internet access.

If a practice button cannot open a job, read the message directly below the practice buttons. Storage failures and full or unreadable named-job lists stop the switch to protect the current job; do not clear storage as a workaround. The complete exercise also needs secure file verification: use the installed APK or the HTTPS website rather than a restricted file viewer. Existing older training copies remain unchanged. If their hardware does not match the corrected exercise, reset the complete training job to open the Vecima/AOI baseline after preserving that copy.

### Focused GainMaker practice

For **OEM AGC**, begin with the HGD launch and its installed OEM detector/pilot, then choose the documented manual-backoff or thermal setup branch in Equipment setup. Review the downstream LE separately and finish with forward/Return Sweepless Sweep, records and backup. Pilot frequency/type and module compatibility deliberately start unspecified. There is no DSIM record or preselected DSIM code in this exercise.

For **ACI DSIM**, identify the HGD and downstream LE, their DSIM variant, firmware and complete applicable procedure before physical changes. The historical lookup exercise uses channel 110 digital, 711 MHz, `@@?<A`; lookup or copying does not change key verification or establish pilot lock. Procedure-specific pad, switch and backoff values start blank. The records remain incomplete until actual work and evidence are entered.

The focused **OEM AGC and DSIM** exercises use the user’s local non-high-split design anchors: **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**. Their synthetic raw readings are **11 / 23 dBmV**, with one explicit **+20 dB** remaining test-point addback, yielding **31 / 43 dBmV**. The **38 dBmV return TX reference** is recorded separately; confirm the transmitter, signal-power convention and measurement plane. It is not forward launch, return injection or CMTS/receiver level. The complete high-split exercise remains **261 / 993 MHz at 34 / 46 dBmV**.

Each focused example opens with zero evidence files. Attach your own labeled practice originals under **Job → ONX files** when rehearsing evidence handling. Opening or resetting another example preserves the previous working copy in named jobs; export it for an external backup.

### Focused GS7K node practice

Choose **Home → Open GS7K node practice** for a ten-step standard-node exercise. It starts with a **GS7000 1.2 GHz / 42/54 MHz** launch. Launch levels and test-point correction are deliberately unverified; there are no RF route rows, attached evidence files or saved traces. Confirm actual readings and remaining compensation before using predictions. The GS7K design profile carries the user-local **54 / 860 MHz, 31 / 43 dBmV** anchors and separate **38 dBmV return TX reference**. Actual source markers, readings and remaining TP coupling stay blank/unverified; design values are not copied into measured launch. The starter is not a pre-aligned node.

Follow the guide through identity, **Route → Setup → Node output → exact model**, **Source setup & manual**, receiver/routing checks, standard forward pad/EQ setup, return handoff, the applicable sweep workflow, records and backup. The guide explains where standard 1 GHz selection changes the source/manual context. Reviewed steps remain practice records.

Current Equipment setup launch choices cover **standard GS7000 1 GHz and standard 1.2 GHz**. SHO/Fiber Deep, Intelligent and retrofit-RPD documents are variant references requiring exact installed-module confirmation; they are not additional selectable launch/setup profiles here. Conventional LCM Auto Set-Up discovers modules and does not balance RF. This practice job provides no physical alignment or measured acceptance.

### Know the complete practice route

The source is a **TRAIN-NODE-01 Vecima EN9000** example with a **204/258 MHz** split, feeding AOI Quantum18 HGD and LE equipment. Installed RF modules and commissioning procedure remain unverified; a product-family choice is not an exact module confirmation. The planned and entered operating upper limits are 1218 MHz, while the entered available spectrum is 993 MHz. The selected hardware band reaches 1794 MHz. Higher capability or planning entries do not establish measured spectrum. The node power row uses an explicitly **synthetic entered 0.75 A load**, not a manufacturer typical-load figure or a GS7000 current curve. The complete exercise starts with the **204/258** forward Sweepless Sweep / XPERTrak return workflow; the separate GS7K and GainMaker exercises start at **42/54**.

Each length below is the complete incoming span, including any prefilled slack. Do not add that slack again.

| Route point | Incoming cable | Complete span | Fed from |
| --- | --- | ---: | --- |
| HGD | P3 .750 | 820 ft | Source |
| Tap A | P3 .625 | 260 ft | HGD output |
| LE | QR .715 | 620 ft | Tap A through output |
| Unbalanced Split S1 | P3 .625 | 110 ft | LE output |
| Main Tap B | P3 .500 | 310 ft | Splitter low-loss output |
| EOL Tap C | P3 .500 | 260 ft | Main Tap B through output |
| Branch Tap D | P3 .625 | 210 ft | Splitter high-loss output |
| Custom inline-loss example | P3 .625 | 100 ft | Branch Tap D through output |
| Cable-only example | P3 .500 | 100 ft | Custom inline-loss through output |

The main endpoint is **2380 ft from the source**; the branch's cable-only endpoint is **2220 ft from the source**. They are separate feed paths. Do not add the branch cable distance to the main route. The node, active models, passives, cables, and all learning values remain editable so you can see how a change affects a prediction.

### 1. Set the launch and inspect the node

Open **Route → Setup**. The markers are **261 and 993 MHz**. Displayed TP readings of **14 and 26 dBmV**, with **20 dB remaining coupling**, give corrected launch levels of **34 and 46 dBmV**. Cable temperature is **86°F**. Change only one launch reading by 1 dB, then inspect the corresponding prediction. Restore the value before continuing.

Open **Job → Details** and find the node information. Compare the installed hardware/band entry with the stated operating and live-spectrum limits. Record fields describe the example asset; they do not create measured acceptance.

Open **Route → Equipment setup** for the source, then select **TRAIN HGD A1**. The AOI HGD/HGBT path is: identify the interface/device/firmware and diplex mode; save the downstream profile; run downstream Auto; use optional downstream Manual only afterward; complete upstream alignment from the last amplifier toward the source as directed; enable ALSC after downstream and upstream setup. Review the result and save configuration. The exact Quantum18 LE I&O remains a gap; the SA sequence is not its substitute. The AOI manual's upstream Manual instrument procedure does not replace the separate local XPERTrak return-sweep workflow.

Try the **Sun/Night** palette control, then open **Help** to find a task or method explanation. These controls change how you view or learn the app; they do not change the route calculation.

### 2. Build a route, follow a branch, and inspect a drop

Open **Route → Cable route**. Use the point selector or **Previous/Next** to move from HGD through the main route. At each point, identify the incoming span and its ending equipment.

At the unbalanced Technetix **XGS1800-33** splitter, compare the low-loss feed to Main Tap B with the high-loss feed to Branch Tap D. Follow each selected output in the route cascade. The two branches do not receive the same passive loss simply because they begin at the same splitter.

Open **More at this point** on the relevant practice tap:

- Compare a published tap face and its through/tap-port losses.
- Read the as-built/map-variance note and add a clearly labeled practice observation.
- Expand the arithmetic to see cable rate, distance, temperature adjustment, and equipment loss.
- Inspect the EOL's **75 ft RG-6 drop** and premises two-way splitter. At 261 MHz, the entered **3.2 dB/100 ft** gives **2.4 dB** cable loss; adding **4.0 dB** splitter loss gives **6.4 dB** total drop loss. Its explicit custom cable table is example data; it is not a built-in verified RG-6 specification.

Continue down the branch to inspect the custom inline-loss and cable-only points. This shows how to represent a component with explicit loss data and a cable span without a passive. Try **+ Add point** only in the training job, check its actual parent output, and see why changing a parent changes both route distance and RF prediction. Reload the training job when you need its original route again.

### 3. Check both amplifiers

Open **Route → Amp gain** and select HGD, then LE. The selector contains active route points. HGD uses **9 dB at 261 MHz and 18 dB at 993 MHz**. LE uses a gain table: **261 MHz/8 dB, 711 MHz/12 dB, and 993 MHz/15 dB**. Both have **34/46 dBmV** targets and **3 dB** requested reserve. Their **42/54 dBmV** output limits are synthetic learning inputs. For each active, identify predicted input, desired output, entered gain, margin, reserve, and output capability status.

With the original training values, HGD's low/high margins are about **2.09/3.54 dB** and LE's are about **1.76/1.11 dB**. Both reach their targets, but each has a marker below the **3 dB** requested reserve. Their outputs stay within the entered teaching limits. The reserve warnings are intentional exercises; sufficient output and sufficient reserve are different checks.

Lower the entered high-frequency gain enough to produce a shortage. Notice that a successful low-frequency result cannot make up for insufficient high-frequency gain. Restore the original value afterward. Open **Calculate gain from test-point readings**. The HGD example is **7.1 dBmV input + 20 dB**, and **16.1 dBmV output + 20 dB**, at 261 MHz. The corrected levels are **27.1 and 36.1 dBmV**, a **9 dB** net gain. Account for only the remaining test-point corrections. Applying a paired reading changes the selected gain marker; it does not automatically align the real amplifier.

Use **Route → Equipment** to inspect the exact active configuration and its reference conditions. Compare the applicable scalar reference with the frequency-specific gain entered in the calculation. If you change a route active to a different model, its previous gain data is cleared; enter matching data instead of treating the resulting blank as zero gain.

### 4. Locate a TDR event

Open **Test → TDR**. Check the selected main-path endpoint, connection point, direction, meter distance, lead subtraction, and velocity factors before interpreting the result. The main route includes active equipment, so the connection point must be on the correct cable side of an active.

The valid example starts at the **LE output**, which is at 1700 ft along the main route. The displayed distance is **295 ft**; subtracting the **25 ft test lead** gives **270 ft into the tested cable path**. The velocity factors are both **0.87**, so their ratio makes no change. The resulting route coordinate is **1970 ft**, which is **160 ft into Main Tap B's 310 ft incoming span**, leaving **150 ft to its end**.

For the active-boundary exercise, select **Launch** as the origin and enter **1995 ft** with the same 25 ft lead. That route would cross an amplifier, so the locator blocks it. Restore the LE origin and 295 ft for the valid local test. The locator is relating a distance to the entered route; it has not found or classified a physical fault.

### 5. Compare sweep views and frequency calculations

Open **Test → Sweep**. View the source, active outputs, and relevant tap ports. Switch among **Signal level**, **Normalized path response**, and **Total path loss**. Identify the live-spectrum limit and any missing coverage. Calculated curves are not the synthetic meter CSVs attached to this job.

Open **Test → Frequency**. At **993 MHz**, the exact overrides are **2.2 dB/100 ft** for **200 ft** of cable and **1.4 dB** for one through-path passive. Total loss is **5.8 dB**; a **46 dBmV** launch predicts **40.2 dBmV** receive level. These overrides are synthetic and already at the stated conditions. Change the frequency and compare data coverage and results; an override entered for 993 MHz is not a verified loss at every other frequency. If you clear launch, receive level becomes unavailable even when loss can still be calculated. Check the full-route summary separately; it uses the complete selected route path.

Open **Test → References**. Try the launch-anchor, target-range, tap-face, and cable-loss reference tools. Read each action before applying it: an anchor changes the frequency choices, while a target-range example supplies an editable draft and keeps criteria unapproved. Reopen a fresh training copy if these exercises change the inputs needed by a later step.

### 6. Compare entered meter readings with predictions

Open **Test → Readings**. HGD has a synthetic **16.1 dBmV** reading at **261 MHz** with **20 dB** remaining coupling, giving **36.1 dBmV** corrected. Tap C has a direct-output **7.5 dBmV** example at **261 MHz**, with **zero** coupling. Identify the prediction and signed difference for each. These examples illustrate different measurement planes; they are not a claim that every point in the job has been measured. A negative difference means the entered measurement is below the model.

Expected rounded comparisons are **36.10 measured / 36.09 predicted / +0.01 dB error** at HGD and **47.00 / 47.11 / −0.11 dB** at LE. Tap C deliberately differs more: **7.50 / 3.01 / +4.49 dB**; Branch Tap D is **14.00 / 5.99 / +8.01 dB**. These synthetic discrepancies teach you to investigate the input data and measurement plane. They are not evidence of a real defect or a software instruction to approve the job.

Change a displayed reading by 1 dB and confirm that its corrected reading and error move by 1 dB. Restore it. Then inspect the impact of TP correction without confusing a field already compensated by the meter with one that still needs addback. The prefilled values are synthetic practice readings, even when the interface uses measurement labels for the calculation.

### 7. Follow the power circuit and try an added load

Open **Power → Load**. The training plan has a **90 V, 15 A supply**, catalog load-curve examples for the node, HGD and LE, and a junction/branch with a custom load. Follow the power parents independently of the RF route. Inspect total supply current, loading/headroom, branch current, voltage drop, and equipment voltage.

The unchanged example calculates about **2.918 A** at the supply, **19.45%** loading, and a lowest equipment voltage of **88.66 V**. These are model-check answers for the supplied learning values, not measured readings. If your values differ after earlier exercises, reset the training job before comparing them.

Open **Power → What-if**. The prefilled candidate adds **300 ft of cable and a 0.75 A load**. The unchanged trial predicts about **3.673 A** supply current and **87.19 V** at the new endpoint. Compare the current plan with the trial before applying it. Try a different power parent to see which shared sections carry the added current. Keep changes only when you intend to modify this practice plan, then reload the training job for a clean comparison.

These settings are a learning case. The displayed supply output current is not utility mains current, and a numerical result does not verify real power-passing ratings or an equipment undervoltage limit.

### 8. Open the synthetic meter files

Open **Job → ONX files**. The training evidence includes five clearly labeled synthetic CSV files—Sweep Before/After, Ingress Before/After, and OneCheck After—plus a synthetic SVG route diagram. The diagram is an original-only attachment, not a parsed measurement preview.

Open the available previews and compare the two stages. At **993 MHz**, the synthetic relative sweep changes from **−2.0 dB Before** to **+0.2 dB After**. The ingress example at **30 MHz** changes from **−23 dBmV** to **−40 dBmV**. Those values demonstrate a preview comparison, not an operator pass/fail rule. The CSVs use the app's supported columns, so they can exercise the actual parser and preview. They are not native ONX captures, instrument exports from a field job, or values extracted from the supplied screen photographs.

Export one original, then confirm the file exists outside the app. A filename reference in a record does not itself contain that file. Imported photographs remain evidence attachments; their displayed readings are not automatically entered into calculations.

### 9. Complete notes and review records

Open **Job → Checklists**. Practice adding an ingress/leakage observation, a maintenance finding, an action, and a retest note. Check only the items you are practicing. A checked work item is separate from numerical acceptance. Try the prefilled dBµV/dBmV converter with **72 dBµV → 12 dBmV**; the conversion adds no test-point correction.

Open **Job → Records**. Review the unapproved profile and the planning-only forward/return examples. Identify the target, tolerance, measurement plane, correction, trace reference, and reviewer information. Keep the practice entries labeled as planning; do not turn fictional values into measured field evidence.

Inspect the return-injection helper: **40 dBmV desired + 20 dB coupling + 1 dB lead loss = 61 dBmV generator setting**. These are planning inputs, not a measured injection. Then inspect the open punch-list item. Record a practice repair and identify which closeout/retest fields remain necessary. The separate legacy DSIM practice row teaches that record form only: it is **not the control procedure for the AOI equipment in this route**. Match real setup procedures to installed equipment.

### 10. Finish the job and restore its backup

1. Open **Job → Run sheet**. Review predictions, comparisons, route notes, and field records. Confirm that the job still has its training identity.
2. Practice the available report, print/share, and CSV actions. Complete the phone's save/share step and check the resulting file. Reports are for review; they do not replace a full project backup.
3. Use **Save named job** under **Job → Details** to keep a practice copy on this device. Use a name that retains **TRAINING**. Try **Duplicate** on that saved entry, then open the copy to learn how to maintain a separate practice version. Both are local entries; neither replaces an exported backup.
4. Use **Files → Save project**, finish the save action, and verify the project JSON outside the app. This backup includes the original synthetic evidence within the app's limits.
5. Use **Files → Open project** to reopen that exported training file. Confirm the route, power plan, records, and six original evidence files. This is a useful rehearsal of the recovery workflow.
6. When finished, open your saved real job or use **+ New blank job**. Check the current name before entering any real readings. Reopen the training job whenever you want to repeat an exercise.

A lesson checkmark records your progress through the guide. It does not certify technical competence or approve a job. Use the detailed tool sections below whenever you need the input definitions, equations, or limits behind an exercise.

## Route Setup

Choose the physical source output, then enter the signal at the beginning of the RF route. Downstream readings are entered at their own route points.

| Field | What to enter |
| --- | --- |
| Source type | Node output, Amplifier / LE output, or Manual / other output |
| Installed source and port | Exact node/active, installed split and output leg; these identify the reference plane |
| Low and high frequencies | The actual two markers used for this calculation, in MHz |
| Low and high launch levels | Source levels at those frequencies, in dBmV |
| Cable temperature | Estimated cable temperature in °F; use a defensible value for the span |
| Available spectrum end | The upper frequency actually available for the job; it does not establish hardware capability |
| Passive loss basis | Nominal/typical planning values or published maximum values |
| Launch curve | The two-point interpolation method, or your entered frequency/level table |

**Example only:** 261 MHz at 34 dBmV and 993 MHz at 46 dBmV gives a 12 dB rise between those markers. Use your node or amplifier's actual levels instead of adopting the example.

### Test-point readings

Corrected level equals the displayed reading plus **remaining** coupling. If the meter already applies the test-point compensation, the remaining correction is zero.

For example, a 14 dBmV reading with 20 dB still to add represents 34 dBmV at the selected mainline plane. Adding another 20 dB when the meter has already compensated would make every downstream prediction wrong.

The node TP choice is offered at the launch after choosing **Node output** and matching node equipment. Check the installed test point and any displayed tolerance. Do not assume that every point is a 20 dB test point.

### Set the launch at the node

1. Choose **Source type → Node output**.
2. Select the installed node and split, then identify its RF port/leg and installed RF or RPD module. Check the operating upper frequency against the hardware and live spectrum.
3. Enter measured or approved job-design launch levels at your actual markers. A node's maximum composite rating is not a per-channel level.
4. Use **Source setup & manual** for the applicable guide or its explicit availability gap, then **Next: cable route**.

The first span feeds directly from that output. A node selected as source adds no gain or cable distance. A launch amplifier or LE works the same way: the route begins at its output. To calculate a downstream amplifier's input/output gain, add that active at the end of its incoming span instead.

Changing source type or equipment does not silently replace launch levels or insert test-point compensation. Confirm the retained readings, reference plane and corrections before using predictions.

### Advanced launch options

- A two-point curve estimates levels between entered anchors. The square-root-of-frequency and linear options produce different intermediate values.
- **My level table** uses your frequency/level pairs. Use equivalent measurement bandwidths and the same measurement plane throughout.
- Table interpolation stops at the first and last entries. The optional two-point slope extension is an estimate outside the anchors, not a measurement.
- Frequency markers, live spectrum, planned bandwidth, and hardware ratings describe different things. Setting one does not verify the others.

## Equipment setup and manuals

Open **Route → Equipment setup**, or choose **Source setup & manual** from Launch. Select the launch source or an active point already on the route. The screen brings its model, band, source document, revision or section, applicable steps and missing information together. The read-only **Setup frequencies & job levels** card shows the selected job design profile’s forward anchors/targets, the separate 42 MHz TX reference and return frequencies/service plan, and the recorded pilot context. The card also shows calculated available-carrier targets separately from the base design when a valid conversion draft exists. Confirm these references apply to the selected station and output; they are not meter readings or automatic hardware settings. Use the continuation buttons to return to Launch/Cable route or proceed to Forward/return sweep, Readings and Evidence.

For GainMaker stations, first choose **Installed gain control → OEM GainMaker AGC**, **ACI DSIM**, or **Manual / thermal control**. Then choose the **Documented setup method** offered for that exact model. This distinguishes the physical fitted control from the method used to prepare it. A catalog label or previous DSIM note does not prove the currently installed control.

Review the source's stated applicability before checking a step. Historical manufacturer-authored copies are labeled separately from current manufacturer links. A datasheet is identified as a reference, not a setup manual. Download original manuals while connected if you need them in the field; NightSweep's summarized notes are available offline, while external links require a connection.

Reviewed steps and station notes remain with the job and portable project backup. Checks are tied to the exact model, band and manual context so an equipment change does not imply that the new configuration has been reviewed. Checkmarks do not establish RF acceptance. Enter actual measured results and approved local limits in the appropriate records.

Exact public commissioning guides remain unavailable for **Vecima EN9000/RFAM/RPD**, **Quantum18 LE**, and **Quantum18 BA**. Those stations show the manual gap and manufacturer support route. Do not apply HGD/HGBT directions to LE or BA, or a standard GS7000 guide to an Intelligent/SHO/RPD configuration without confirming the correct manual.

### Set up a GS7000 / GS7K launch node

1. Open **Route → Setup → Node output** and choose the installed **GS7000 1 GHz** or **GS7000 1.2 GHz** model. Confirm its split, asset, RF port, launch/receiver/transmitter modules, routing and actual operating/live limits. Enter approved launch targets or measured levels; the node choice does not set them.
2. Choose **Source setup & manual**, or open **Route → Equipment setup** and select the launch source. Read the exact standard-node guide. The selectable launch setup covers standard 1 GHz and standard 1.2 GHz. SHO/Fiber Deep, Intelligent and retrofit-RPD manuals remain variant references; those are not extra launch/setup choices here, and their procedures are not interchangeable.
3. Following the approved service procedure, verify optical input and the installed receiver’s attenuation table. Record optical receiver type, segmentation and measurement planes; optical work can interrupt service.
4. For a standard node, set the applicable **OIB receiver pad** for the highest required output in a segment, lower other shared outputs with their individual **FWD PORT OUT pads**, and select the matching path equalizers for design tilt. Recheck both markers and every affected port. The 1 GHz and 1.2 GHz receiver/pad/EQ tables differ.
5. Apply only test-point coupling the meter has not already added. Keep source launch readings, receiver readings and other RF points distinct. **Conventional LCM Auto Set-Up discovers modules; it does not perform RF level/tilt alignment.** Intelligent LCS Auto Setup is a separate forward OIB procedure and does not align return.
6. Complete return setup for the actual transmitter/EDR/RPD and approved reference. Your deployed GS7K plant uses **42/54 MHz forward and Return Sweepless Sweep**. The **204/258 MHz forward Sweepless Sweep and XPERTrak return sweep** procedure belongs to your separate Vecima/AOI plant. Record final settings/readings, attach actual evidence and export the job. Reviewed manual steps alone are not acceptance.

### GainMaker OEM AGC and manual/thermal methods

For the applicable historical 1 GHz GainMaker guides, OEM AGC has two complete alternatives: **Manual backoff → OEM AGC** and **Thermal setup → OEM AGC**. Match the installed compensator and locally approved method before following the checklist; do not combine their preparation steps.

- **Manual-backoff branch:** use S1 = 2, set backoff from the exact station's temperature/reference-frequency chart before pad/EQ adjustment, then keep that backoff setting. The system amplifier and LE charts differ.
- **Thermal-setup branch:** use S1 = 1 and its matching thermal procedure; do not add the manual-backoff chart.
- At the documented pilot reference, the applicable 1 GHz **GaAs HGD, HGBT and LGD** use corrected **MAIN-output pilot level minus 34 dB** for the OEM AGC pad. The applicable **1 GHz AGC LE** uses corrected **output-pilot level minus 29 dB**. These are model-specific OEM relationships, not DSIM settings, GaN instructions or universal QAM offsets.
- Follow the selected procedure through S1 = 3, matching AGC GAIN to the setup reading and verifying output after settling between switch changes. The cited OEM procedure supplies no universal settling timer. Add a raw −20 dB test-point's coupling once only when the meter has not already compensated it.

The conventional OEM guides describe an analog video pilot. Confirm the actual installed detector and its frequency/type/level convention. No exact OEM QAM detector-offset bulletin was recovered; a −6 dB distortion-loading convention is not used as an AGC correction.

**Thermal-only** methods distinguish amplifier-only compensation (S1 = 1) from amplifier-plus-coax compensation (S1 = 3), using the applicable warm procedure. The separate cold-equipment procedure is not a blanket −1 dB operating target. A **manual LE** has no Bode network; S1 does not select its operating mode. The exact installed **GaN HGD** setup procedure remains a documentation hold; the generic historical system guide is not proof of its control instructions.

### Optional ACI DSIM on GainMaker

Choose the GainMaker station, then identify **DSIM-SG**, **DSIM-A**, or the actual installed module. Record controller/module firmware and the approved pilot. Match the exact RF module, control hardware, manual revision and local procedure before following setup steps. Conventional GainMaker AGC and ACI DSIM are separate control methods.

#### Follow the matching DSIM interface procedure

The applicable **SG Rev G/H physical-controller setup** is presented as eight ordered steps in Equipment setup: identify hardware/targets; prepare manual backoff; select S1 = 3 and the documented 0 dB pad; connect and confirm solid-blue MGC; complete temperature preparation; select the applicable thermal-fallback cable factor; align the intended pilot; then verify mode, lock, output and slope. Use the full matching procedure and measurement planes. The historical SG Rev E pad rule below is a different procedure.

Physical-controller temperature preparation uses the recorded highest-frequency output, the following adjustment, then input-pad restoration of that recorded output:

| Source temperature range | Controller RF output adjustment |
| --- | ---: |
| Below 20°F | −2 dB |
| 20–40°F | −1 dB |
| 40–80°F | 0 dB |
| 80–100°F | +1 dB |
| Above 100°F | +2 dB |

The source ranges share endpoints; confirm exactly 20, 40, 80 and 100°F with the applicable procedure. The app does not silently choose those boundaries. The 9/18/27 dB upfront cable factors are procedure-specific thermal fallback choices, not launch targets; the guide cautions against thermal control for pedestal/underground stations.

The **ACI mobile app Rev B** has a separate DSIM-DONGLE-02, Working Mode/MGC and AGC Prep path. Minus decreases attenuation for cold preparation; plus increases it for hot preparation. Raw attenuation-position counts are not dB. Do not transfer physical-controller button counts or adjustment signs into the app interface.

#### Look up the pilot code

The offline lookup includes **86 literal rows** transcribed from the **user-supplied ACI iPhone/iPad Pilot Channel Code Guide, Revision A, pp 2–5**: channels **52–94** and **100–142**. These are historical source-table entries, not a universal supervisor password. Inclusion does not establish compatibility with a particular ACI app version, controller firmware or installed module, and no hardware validation is claimed.

1. Open **Route → Equipment setup**, choose the GainMaker source/route station and its DSIM variant, then open the pilot-code lookup.
2. Choose **Analog** or **Digital** to match the source's signal type. Select the exact channel, or enter its source-listed frequency in **MHz**. Confirm the channel, type and frequency together before using the result.
3. Read the displayed source/revision and any exception. Use **Copy** for an eligible exact match, then paste the code into the appropriate ACI controller/app field. Preserve every character, including `@`, `?`, `<` and the final letter. Do not calculate a code from an adjacent row.
4. Confirm the intended live pilot and applicable setup procedure on the real equipment, and record the actual result. A copied table entry is not proof of alignment or acceptance.

Examples from the supplied table:

| Signal type | Channel | Frequency | Literal source code |
| --- | ---: | ---: | --- |
| Digital | 110 | 711 MHz | `@@?<A` |
| Digital | 88 | 609 MHz | `GG<A` |
| Digital | 64 | 465 MHz | `EC<A` |

There are **no supplied rows for channels 95–99** and no **303 MHz** entry in this table. NightSweep does not fabricate those codes or silently choose the nearest channel. Analog and digital frequencies are different reference values; an OFDM PLC reading does not establish support by the DSIM QAM detector.

**Channel 100 source exception:** the supplied row prints **649.25 MHz / `HD<@`** for analog and **651 MHz / `HD<A`** for digital. It is flagged for source confirmation, with copying blocked while unresolved. Confirm the original row, intended channel/frequency and applicable ACI setup before using it; no replacement value is invented.

#### Match the setup revision

Historical **DSIM-SG Rev E (October 3, 2015), pp 2 and 10**, specifies a **10 dB AGC pad for LE** and **6 dB for the applicable HGD**. **Rev H (April 8, 2021)** specifies **0 dB**. These are different published procedures. Select the exact applicable procedure for the installed revision; do not combine its switch, backoff, temperature or pad settings with another revision.

The [historical DSIM-A Rev T guide](https://acicomms.com/wp-content/uploads/PDF/01.-DSIM-A-TechManual-Rev-T-171214.pdf), December 14, 2017, is an additional reference. It does **not** establish applicability to the later **1218 MHz DSIM-A-MDL-1201** variant. That variant's exact setup remains to be confirmed; do not assign the older guide or DSIM-SG procedure automatically.

The SG manual and later DSIM datasheet conflict on SG supply-voltage values. The app flags that conflict; confirm the installed module label or ACI guidance before using a threshold. Pilot-code availability does not resolve this conflict. NightSweep does not connect to or configure DSIM hardware. Keep actual operator passwords and private credentials out of notes and project exports.

## Cable route

Each route point consists of **the incoming cable span followed by the equipment at its far end**. A zero-length span connects equipment directly to its parent output.

### Add and edit a point

1. Choose **+ Add point**.
2. Give the point a recognizable label such as a pole, tap, amplifier, or station ID.
3. Check **Fed from**. Select the exact upstream output that actually feeds this span.
4. Enter **Span cable (ft)** and any additional **Slack / risers (ft)**.
5. Select cable type, equipment type, manufacturer/family, and model/configuration.
6. Read span distance, cumulative distance, cable loss, and predicted levels.

Use the point picker or Previous/Next to work on one point at a time. The route cascade helps locate points and shows their feeds. The point's basic data stays together; optional functions are under **More at this point**.

**Do not count slack twice.** If a measured cable length already includes loops and risers, enter that total as span cable and use zero additional slack. Both fields contribute to RF loss and TDR distance.

### Passives and branches

A tap's through loss and tap-port loss are different. The next trunk span normally follows the through output. A drop follows the tap output. A splitter or directional coupler must feed the route from its actual selected port.

Example at one frequency, using illustrative losses:

- Upstream level: 46.0 dBmV.
- Cable loss: 2.5 dB → equipment input: **43.5 dBmV**.
- Through loss: 1.0 dB → downstream trunk output: **42.5 dBmV**.
- Tap loss: 17.0 dB → tap output: **26.5 dBmV**.

A span fed from the trunk starts from 42.5 dBmV in that example. It does not start from 26.5 dBmV.

Branch distances follow the selected upstream path. They are not added to unrelated branches. If a parent is deleted or becomes invalid, the app shows an unresolved feed instead of silently connecting the child somewhere else.

### More at this point

- **Published faces:** Compare available faces within the matching catalog family and port count. Selecting a face changes the actual catalog device used in the calculation.
- **RG-6 drop:** Choose the tap port, drop feet, optional splitter, and verified RG-6 loss table. This is a drop prediction, not a power-passing mainline route. No built-in RG-6 curve is assumed.
- **As-built / map variance:** Record actual cable, lengths, equipment, or defects that differ from the print.
- **Show the arithmetic:** Review the cable rate, length, temperature factor, and equipment calculation.
- **Apply length to following spans:** Use only when the following spans really share that length. Review the confirmation before applying it.

**Same span, next tap** copies the prior span settings and chooses the next lower published face when available. Verify each added point rather than treating it as a measured span.

### Custom data

Use custom cable or passive tables only with values that match the actual frequency, cable, part, and temperature. Custom cable values are dB per 100 ft. A custom passive uses loss in dB for its defined paths. Custom tables are used as entered; the app does not apply a second temperature correction.

## Amp gain

Use **Route → Amp gain** to answer: **Can this amplifier restore the desired output after the preceding route losses?** First add the amplifier in Cable route as **Active amplifier**. Then select that active point in Amp gain.

The catalog includes GainMaker 1 GHz GaAs HGD, GaN HGD, manual LE, thermal LE, AGC LE, and AOI Quantum18 HGD and LE configurations. Match the actual module, split, control mode, and output path.

### Required inputs

1. Enter desired true output levels at the low and high route frequencies. Defaults follow the corrected launch at those frequencies; they remain your planning targets.
2. Enter gain at the two marker frequencies, or a frequency/gain table covering them.
3. Enter an additional output loss only if it is not already included in the gain.
4. Set the gain reserve. The starting 3 dB reserve is an editable planning value, not an operator standard.
5. If known, enter output limits appropriate to the installed equipment, channel loading, tilt, and configuration.

At each marker:

**Required gain = desired output + additional output loss − predicted active input**  
**Margin = entered gain − required gain**  
**Predicted output = predicted input + entered gain − additional output loss**

### Worked gain example

This example uses zero additional output loss:

| Item | Low marker | High marker |
| --- | ---: | ---: |
| Predicted active input | 12 dBmV | 14 dBmV |
| Desired output | 34 dBmV | 46 dBmV |
| Required gain | 22 dB | 32 dB |
| Entered available gain | 25 dB | 35 dB |
| Margin | 3 dB | 3 dB |
| Output predicted using that entered gain | 37 dBmV | 49 dBmV |

Both markers cover a 3 dB reserve, but the output prediction uses all the entered gain. In the field, the installed settings still need to produce the intended 34/46 dBmV. This screen does not automatically choose pads/EQs or align the amplifier. An entered high-frequency output limit of 48 dBmV would flag the 49 dBmV prediction independently of the gain result.

If available high-frequency gain were 31 dB, the high marker would be **1 dB short**, even if the low marker passed.

### Read the result

| Result | Meaning |
| --- | --- |
| Gain data needed | A valid input, target, or gain is missing at a required frequency |
| Not enough entered gain | At least one marker has a negative margin |
| Reaches target, below reserve | Both markers reach their targets, but the smallest margin is below the requested reserve |
| Covers route with reserve | Both entered gains cover the targets and reserve |
| Output limit exceeded | The requested or predicted output exceeds an entered limit |
| Output capability not checked | Gain may be sufficient, but applicable output limits were not entered |

A measured operating gain describes the current settings. It does not automatically establish maximum available gain or adjustment range. For equipment sizing, use verified available gain for the actual configuration and frequency.

### Measure gain correctly

In **Calculate gain from test-point readings**, use paired input and output readings at the same frequency and equivalent measurement bandwidth:

**Gain = output reading + remaining output TP correction − input reading − remaining input TP correction.**

For example: input 10 dBmV + 20 dB = 30 dBmV; output 20 dBmV + 30 dB = 50 dBmV; measured net gain = **20 dB**. Use the low/high point button for the frequency measured, then repeat at the other marker.

If the output measurement is already after the selected splitter, director, or pad, that loss is already included. Keep additional output loss at zero for that component. Only enter a separate loss after the output measurement plane.

### Published gain references

Manufacturer operational gain is retained as a labeled reference. A scalar published figure is not treated as a flat gain curve across every frequency. The GainMaker profiles reference documented 42/54 MHz configurations; they do not establish an upgraded high-split module's response. AOI numerical references are historically sourced and qualified in the catalog/source notes. Read the displayed conditions and use the actual installed gain for predictions.

The photos of an ONX output screen alone cannot establish amplifier gain. Gain requires matching input and output readings.

## TDR distance locator

Open **Test → TDR** after entering the cable route. The locator relates an already measured one-way TDR distance to that route. It does not interpret a TDR waveform or identify the defect type.

1. Select **Path ends at** to choose the branch being tested.
2. Select **TDR connected at**. Automatic uses the route start for forward testing or the chosen endpoint for reverse testing.
3. Choose the testing direction.
4. Enter the meter distance in feet.
5. Enter physical test-lead length only if it still needs subtraction. Use zero when the TDR is already zeroed at the cable.
6. Read the span, distance into it, and distance remaining to its end.

### Two-span example

| Span | Length | Cumulative end |
| --- | ---: | ---: |
| First span | 132 ft | 132 ft |
| Second span | 118 ft | 250 ft |

A **180 ft** reading from the start lands **48 ft into the second span**, leaving **70 ft to its far end**. A reverse reading of **70 ft** from the 250 ft endpoint reaches the same location.

A reading exactly on a point is reported as a boundary. Inspect the connection and adjacent cable rather than treating the displayed point as a proven fault.

### Velocity factor and path limits

Displayed TDR distance is already one-way. **Do not halve it.** Optional correction uses displayed distance × actual VF ÷ meter VF, followed by lead subtraction. Enter VF as a fraction, such as 0.87.

Use that correction only for a path with one applicable, known velocity factor. Mixed cable, uncertain map lengths, loops, passives, or multiple reflections need field interpretation. The locator stops when an active lies between the selected origin and event; reconnect on the appropriate cable side and test that section.

## Guided sweep setup — new in 1.7

Open **Test → Sweep setup**. Choose the plant split independently of the downstream equipment bandwidth:

| Plant profile | Forward test | Return test |
| --- | --- | --- |
| **42/54 MHz** | Forward sweepless sweep | Return sweepless sweep |
| **204/258 MHz** | Forward sweepless sweep | Return sweep using XPERTrak |

Read the detailed [setup guide](https://nightsweep-field.goodst3r.chatgpt.site/setup-guide), also included as **NightSweep_1.7_Setup_Guide.html** in the coworker package. The in-app steps are available offline in both the APK and web app after the web app reports readiness.

Each split keeps its own setup entries, reference details, step notes and completion marks. Record the actual station/leg, installed equipment, test plan, reference identity, measurement plane and compensation. Switch profiles without reusing a different split's targets. Site-specific levels and limits start blank; the previously discussed 31 dBmV and −8 dBmV are not applied as universal defaults.

For **42 MHz return sweepless**, use the meter's matching service plan, reference-bandwidth setting and saved reference. Return sweepless derives its response using DOCSIS operation; it is not an injected reverse sweep and does not qualify vacant spectrum. Keep absolute and referenced displays, their units, and the measurement method with the record.

For **204 MHz XPERTrak return sweep**, follow the configured node/port, sweep plan and telemetry arrangement. Record only compensation not already applied. The generator helper is a calculation for an applicable injection setup, not an instruction to enter that total into every ONX field. Confirm the meter mode, capabilities and plan before using it.

The comparison helper reports level and tilt differences from the values entered. It does not choose an approved operating target, certify a band, control the ONX or XPERTrak, or change amplifier settings. A completed step means only that the technician marked that step; final RF acceptance requires measured evidence and review.

Use the workflow export for a readable setup record, and **Files → Save project** for the full portable job backup. Attach the original Before/After/Reference meter files under **Job → ONX files**. A workflow text export does not replace that backup or its original evidence.

## Sweep predictions

Open **Test → Sweep** to see the route over frequency and the output-level table. Select only the traces you need; fewer traces are easier to compare.

| Graph mode | Use it for |
| --- | --- |
| Signal level, dBmV | Expected level at a route input/output, including source tilt |
| Normalized path response, dB | The modeled path response after removing launch response and zeroing at the reference frequency |
| Total path loss, dB | Accumulated net path loss, including entered active gain where present |

Set the viewing range and normalization reference to the job. Tap or move over the graph for numerical readouts. The level table can be restricted to tap ports.

Solid/dashed styling distinguishes frequencies within and above the stated available spectrum. A gap can mean missing/unsupported loss data, missing gain, or a launch curve that stops at its anchors. No curve is silently continued through an unsupported range. These are calculated traces, not an imported measured sweep or a MER prediction.

## Frequency checker

**Test → Frequency** is a quick calculation for one cable segment plus one passive output path. It does not require rebuilding the full RF route.

1. Select cable, feet, passive, actual output path, and quantity.
2. Check return, forward, equipment, planned, and live-frequency limits.
3. Select the frequency you want to examine.
4. Enter exact cable loss per 100 ft or passive loss per device when you have better data.
5. Enter launch at that frequency to calculate receive level. Without a launch value, total loss can still be useful.

**Example:** 200 ft at an entered 2 dB/100 ft, plus one passive with an entered 1 dB loss, gives **5 dB total loss**. A 40 dBmV launch predicts **35 dBmV receive level**. This example uses exact values; it does not claim a particular cable or passive has those losses.

Temperature and passive basis are shared with Route Setup. Exact overrides are at actual conditions and are not temperature-corrected again. A custom/unsupported item needs appropriate exact values. Actives belong in Amp gain; this checker does not substitute a published scalar amplifier gain.

The complete-route summary selects an existing route output and shows its total path distance, net low/high loss, predicted levels, and tilt. That summary uses the full selected feed path, unlike the single-segment checker above it.

## Meter readings

Open **Test → Readings**, select the route point, and choose the relevant output. Enter measurement frequency, displayed level, and any remaining test-point coupling.

The comparison shows:

- **Prediction:** The route calculation at that frequency.
- **Measurement:** Your entered reading, with selected remaining TP correction applied.
- **Error:** Measurement minus prediction.

Example: prediction 30.0 dBmV, displayed meter reading 9.0 dBmV, remaining TP coupling 20 dB → corrected measurement 29.0 dBmV → error **−1.0 dB**.

A positive error means the meter is higher than the model; a negative error means it is lower. Investigate cable length/type, actual output path, equipment selection, temperature, pads/EQs, and compensation before deciding the plant is faulty.

A zero reading is a valid number; a blank means no measurement was entered. A field comparison is not automatically copied into acceptance records or ONX attachments. Use Job Records and ONX files when you need those separate records.

## References

**Test → References** groups optional shortcuts:

- **Launch anchor pairs:** Apply an offered frequency pair when it matches the plant. Levels and actual available spectrum still need your input. Table-mode launch keeps its own frequency entries.
- **Target ranges:** Fill an editable draft from a selected profile or a clearly labeled example. Applying ranges uses their centers and one common tolerance; both ranges must have equal width. It marks the profile criteria unapproved.
- **Published tap faces:** Look up the matching catalog faces for an existing route tap and return to its face picker.
- **Cable loss quick look:** See catalog loss per 100 ft at a chosen frequency and the shared RF temperature.

These helpers distinguish manufacturer information, user-local design references and illustrative examples. Applying a reference does not approve field acceptance.

### User-local non-high-split design references

| Reference | User-supplied value | Reference plane and scope |
| --- | ---: | --- |
| Forward low anchor | **31 dBmV at 54 MHz** | Local design reference; confirm actual downstream carrier/channel-power convention and station output plane |
| Forward high anchor | **43 dBmV at 860 MHz** | Same local design and measurement basis; not a universal hardware limit |
| Return TX | **38 dBmV** | Separate transmitter-level reference; verify the intended transmitter, signal-power convention and measurement plane |

**38 dBmV is a level, not a return frequency.** Actual return TX channels/frequencies and the service/sweep plan have not been supplied. Enter the verified plan and its required frequencies before return setup; the 42 MHz split does not select those channels for you.

| Setup purpose | Frequency to use |
| --- | --- |
| User-local forward design anchors | **54 and 860 MHz**, only where both belong to the installed forward passband and actual plan |
| OEM AGC pilot | Approved frequency/type for the physically installed detector; no universal pilot frequency is supplied |
| ACI DSIM pilot | Approved compatible pilot for the installed DSIM/firmware; **711 MHz** is the historical lookup practice example, not a global pilot setting |
| OEM manual-backoff reference | Printed **445.25 / 547.25 / 870 / 1000 MHz** columns. System amplifier [OL-31156-01 p53](https://manualzz.com/doc/59690642/cisco-870-mhz-gainmaker-amplifiers-guide) and LE [OL-31155-01 pp49–50](https://studylib.net/doc/18909323/1-ghz-gainmaker-broadband-amplifier-platform-line) have different values. **860 MHz is not a printed column**; no automatic rounding to 870 or interpolation is supplied |
| DSIM-SG Rev H manual-backoff reference | Printed **3.2 dB at 547 MHz, 4.1 dB at 750 MHz, 4.6 dB at 870 MHz**, [Rev H pp2/10](https://acicomms.com/wp-content/uploads/2021/04/04.-DSIM-SG-TechManual-Rev-H-210408b.pdf). These are not pilot selections or OEM GainMaker chart values |
| DSIM temperature preparation | The actual highest operating frequency specified by the matching procedure, separate from its backoff test frequency and selected pilot |
| Quantum18 HGD/HGBT profile | Job-specific frequencies/power entered under the matching downstream Auto configuration. ALSC/Auto Align Marker Pilots are information, not a universal 54/860 or 711 MHz setup prescription |
| Return TX channels / service plan | Verified operator plan; currently unspecified. The **38 dBmV** reference supplies no channel or MHz value |

**54 MHz is below the forward passband of the LGD 65/86 configuration and every catalog Quantum18 split.** Use an approved in-band job marker for those stations; never copy the lower-split 54 MHz anchor silently. The OEM thermal-setup branch does not use a manual-backoff test frequency. The actual OEM detector part number and approved live pilot carrier must be identified; a DSIM factory preset (for example CH88 digital 609 MHz) is not approval to use it on your plant.

Choose **Test → References → Your local non-high-split targets → Local non-high-split: 31 @ 54 / 43 @ 860 · TX 38** only for a selected non-high-split design profile whose downstream passband actually includes **54 and 860 MHz**. After confirmation it updates that profile’s forward design frequencies/levels and the separate 42 MHz TX reference to 38 dBmV. Measured Route Setup frequencies/readings, existing forward/return records, tolerances, receiver targets, injection settings, hardware capability and available spectrum remain unchanged. Profile criteria remain unapproved. A return ceiling of **204 MHz or above**, or a downstream band that excludes 54 MHz, blocks applying this preset. A lower return split alone does not establish that 54 MHz is usable.

Under **Test → Sweep setup → 42 / 54 MHz**, **Operator return TX reference (dBmV)** records the separate **38 dBmV** reference. Fill **Return TX frequencies / service plan** from the verified operator plan; this text is deliberately not inferred from the level or split. It does not set desired network-plane injection, raw generator output, received/CMTS level or relative-return targets. The 42 MHz Return Sweepless Sweep workflow gains no generator calculation from this reference. Confirm the actual measurement plane and channel-power convention before applying any local value.

The complete AOI high-split training job keeps its separate synthetic **261 / 993 MHz, 34 / 46 dBmV** setup. The local lower-split preset does not overwrite it.

### Convert local targets to available carrier frequencies

The base local design remains **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**. If the usable carriers are, for example, **57–753 MHz** or **63–550 MHz**, calculate the target at each confirmed setup frequency from those original anchors. The available endpoints do not become new 31/43 dBmV anchors. A spectrum edge is not automatically a channel center; confirm the intended carrier, channel-power convention and measurement plane.

Open **Test → References → Setup targets at available carriers**. Enter **Available low carrier (MHz)** and **Available high carrier (MHz)**, then select **Target curve → Square-root frequency · cable law** or **Linear MHz** as required by the local procedure. Inputs start blank; **Fill example 57 / 753 MHz** and **Fill example 63 / 550 MHz** fill only that calculator draft. Read the resulting calculated targets. Square-root frequency is the initial estimate. Selecting either does not prove that its tilt shape is operator approved or matches the installed node/EQ response. Range examples fill the calculator draft only; they do not change the base profile, measured Route Setup or existing records.

The original anchors span **12 dB**. The estimated rise over a shorter available range is different:

| Confirmed setup-frequency example | Square-root estimate: low / high (dBmV) | Linear-MHz estimate: low / high (dBmV) |
| --- | ---: | ---: |
| 57 / 753 MHz | **31.11 / 41.97** | 31.04 / 41.41 |
| 63 / 550 MHz | **31.32 / 39.79** | 31.13 / 38.38 |

The square-root rises are **10.86 dB** over 57–753 MHz and **8.47 dB** over 63–550 MHz. These rounded values were independently evaluated for the stated formulas in Wolfram; the source record is `night-sweep/research/alpha17-setup-frequency-wolfram.json`. This checks arithmetic, not an installed equalizer or approved operator curve.

The converter requires **54 ≤ low < high ≤ 860 MHz** and a compatible recorded non-high-split profile with hardware covering both base anchors. It does not extrapolate. It rejects an entered high carrier above a known available-spectrum upper limit; a blank live limit remains unverified and does not establish carrier presence.

Keep calculated estimates separate from actual meter readings. For the 57/753 MHz square-root example, output-plane targets are 31.11/41.97 dBmV; if exactly 20 dB remains uncompensated at the test point, corresponding raw readings would be **11.11/21.97 dBmV**. If the meter already compensates the coupling, do not subtract/add it again. At a test point, use only remaining uncompensated coupling once when comparing the carrier-specific target and reading. Record actual setup frequencies and the curve/approved procedure you followed before physical adjustment.

The conversion draft is retained in the job and full project backup. **Job → Run sheet** and its HTML/text/CSV exports include the entered carrier frequencies, calculated levels, selected curve and original base anchors, clearly labeled as estimates rather than acceptance. Equipment setup’s **Setup frequencies & job levels** card presents these calculated targets separately from the base profile; it never silently writes them into measured launch or records.

Changing the carrier-conversion draft does not choose an AGC pilot. If actual live spectrum ends at **550 MHz**, the **711 MHz** practice pilot is outside that spectrum; identify an approved compatible live pilot from the exact detector/module procedure. No replacement pilot is guessed.

The focused OEM/DSIM and GS7K guides include an available-carrier/target-conversion step. Their supplied base design values remain unchanged. The complete high-split example retains its own 261/993 MHz anchors and does not inherit the lower-split conversion.

## Power Load and What-if

The power circuit is entered separately from the RF route. RF direction, power direction, power-passing ports, and supply boundaries are not always the same.

### Build the load plan

1. Open **Power → Load**. Replace example supply voltage and current rating with actual operating voltage and nameplate rating.
2. Add each powered device once, with its cable, feet, and real **Fed from** connection.
3. Add a zero-load junction where one trunk supplies separate branches.
4. Select the exact equipment configuration or enter a known load.
5. Check supply draw/loading/headroom, minimum equipment voltage, and section losses.

Load choices include a supported current-versus-voltage curve, known current, input watts with power factor, or VA. Use a matching configuration; a maximum rating is not automatically the equipment's normal draw. EN9000 loading requires an installed or measured value when no matching consumption curve is provided.

At each cable section, current includes all downstream loads. The model recalculates loads that depend on voltage. Its results are **CATV coax supply-output values**, not utility mains amperage.

### Simple power example

For a 90 V supply, 1 A constant load, and 1 Ω total loop resistance at the modeled temperature:

- Voltage drop = 1 A × 1 Ω = **1 V**.
- Predicted load voltage = **89 V**.
- Cable loss = 1² × 1 Ω = **1 W**.

If another 1 A load shares that upstream section, its section current becomes 2 A: the section drop becomes 2 V and its loss becomes 4 W. Real branched circuits need all shared and individual sections entered.

### Try an addition

Under **Power → What-if**, choose the feed point, added cable, length, constant current load, and minimum equipment voltage. The app tests the addition on a copy of the current power plan and shows predicted end voltage/headroom. Choose **Keep in power circuit** only when you want the trial to become a real planning row.

RF cable temperature and power cable temperature are separate inputs. Built-in loop resistance uses the entered power temperature and coefficient; custom resistance is already at actual temperature. The scalar RMS model does not simulate the complete quasi-square-wave waveform or verify every passive's current rating. Check actual power-passing arrangements and equipment undervoltage settings.

## Job Details and named jobs

Use **Job → Details** for job identity, locally saved named jobs, node equipment, and work-order notes.

Name the job so another technician can recognize it. Record the ticket, location, symptom, start/end times, weather, parts, and resolution as useful. Work-order, node, and lead fields are linked to their matching record metadata; notes remain separate from numerical acceptance.

Named-job controls:

| Control | Effect |
| --- | --- |
| New blank job | Starts a separate working job after the app's change-of-job prompt |
| Save named job | Adds or updates the current local job snapshot |
| Open | Switches to a saved job |
| Duplicate | Makes a separate named copy |
| Delete | Removes a named entry; export anything you need first |

Normal changes autosave on this device. A named job is convenient storage, not a backup outside the app. Storage errors must be addressed by exporting accessible work; do not assume a successful screen edit means an external file was saved.

On iPhone, use the same Home Screen app for ongoing work. Safari and the Home Screen app may keep different local job lists. An empty list in one does not establish that a job was deleted from the other. Check the original app/browser and your exported files before changing storage settings.

### Node equipment

Choose the installed Vecima EN9000 GAP or GS7000/GS7K 1 GHz/1.2 GHz model and matching band/configuration. Record asset, port/leg, module, operating upper frequency, and notes.

Copying hardware limits into a selected profile updates its hardware fields and marks criteria unapproved. It does not establish that the full band is active or measured. Actual operating spectrum and acceptance criteria still require their own entries.

## ONX files

Open **Job → ONX files**. To add evidence to your current job, choose **Sweep**, **Ingress**, or **OneCheck**, then choose **Before**, **After**, or **Reference**. Enter the asset or station and any relevant notes. Tap **Add meter files or photos**. The original 1.7 Alpha APK labels this button **Upload meter files**.

Original file bytes are stored offline and checked with a checksum. Supported explicit CSV columns can generate a trace/table preview. Native JSON, ZIP, XML, PDF, HTML, images, and unknown meter formats remain attachments when their measurement schema is not decoded.

A photograph of a meter screen is useful job evidence. Attaching it does not read its numbers into the calculators or decode the ONX measurement format. Enter measured values deliberately and keep their frequency, units, and test-point correction with the record. On iPhone, original attachments stay in that app/browser's local storage; they are not uploaded to the hosting website as a job backup.

### Open the ONX-630 downstream reference job

If you received a separate NightSweep reference job, save your current work with **Files → Save project** before opening it.

1. Choose **Job → ONX files → Open project backup**, then select the supplied project JSON. In the original 1.7 Alpha APK, use **Files → Open project**.
2. In **Job → ONX files**, expand the SC-QAM CSV and tap **View decoded CSV measurements**. Each dot is one supplied channel reading. Spaces between dots have no supplied readings.
3. Open the OFDM photo entries to review the PLC and block metrics. Tap **Save original** to retrieve an attached image. Use **Job → Details → Save named job** to keep the reference job on that device.

A manually transcribed downstream channel table can use **OneCheck / Reference** to enable the channel-table preview. Record the asset, measurement point, plant split, and any applied test-point correction with the reading. Keep SC-QAM channel levels separate from OFDM PLC and block metrics. Use confirmed readings at the required endpoints for a full-band tilt measurement and the applicable local procedure for acceptance.

[VIAVI OneExpert CATV data sheet](https://www.viavisolutions.com/en-uk/literature/oneexpert-catv-data-sheets-en.pdf)

Examples of supported interchange columns:

```csv
frequency_mhz,level_dbmv
261,34
993,46
```

For a relative trace, use `response_db` instead of `level_dbmv`. For a channel table, use `channel,frequency_mhz,level_dbmv,mer_db`. Supply the units and measurement plane correctly; previewing a CSV does not apply TP correction or establish acceptance.

| Limit | Maximum |
| --- | ---: |
| One original attachment | 8 MiB |
| Original attachments in one job | 12 MiB total |
| Attachments per job | 30 |
| Text decoded for preview | 2 MiB and 10,000 samples per file |
| Portable project JSON | 20 MiB |

A trace filename typed into a record is only a reference. Attach the actual file here if it must travel with the backup. Wait for an import/export operation to finish before switching jobs. Export originals or a complete project before removing evidence you need.

## Checklists and field notes

**Job → Checklists** keeps leakage/ingress checks and preventive-maintenance/end-of-line notes together. Record work actually completed, including connectors, shielding, terminations, affected drops, repairs, retests, supply condition, bonding, end-of-line points, and amplifier unity-gain observations.

A checked item means the technician marked the work complete. It does not automatically mark RF acceptance as passed.

The voltage reference converts **dBµV ↔ dBmV** at the same reference plane:

- dBmV = dBµV − 60.
- dBµV = dBmV + 60.

For example, 83.1 dBµV is 23.1 dBmV. This is not a field-strength µV/m conversion and adds no TP correction.

## Records and supervisor review

**Job → Records** contains the more detailed measurement and review workflow. Use it when the job requires a formal log rather than a quick prediction.

### Profiles and measurements

Select the actual plant profile and enter hardware/planned/live limits, frequencies, targets, tolerances, ripple/MER requirements, and relevant return criteria. Example profile labels do not make their values approved standards. Criteria start unapproved.

Forward and return logs keep Before/After records, raw readings, remaining corrections, targets, measurement planes, trace references, and reviewers. Mark a record **Measured** only when it contains actual field data. The app does not turn route predictions into measurements.

Status messages distinguish incomplete data, planning entries, unapproved criteria, band issues, and comparisons with entered limits. A complete marker check still requires review of the saved trace and the rest of the relevant band.

### Return generator helper

Generator setting equals desired network-plane injection + remaining injection coupling loss + remaining lead loss.

Example: desired 31 dBmV, remaining coupling 20 dB, lead loss 1 dB → **52 dBmV at the generator output**. Use losses at the test frequency and account for any compensation already applied. The helper does not prove the final network injection; verify it with the approved method.

### Repairs and DSIM

The punch list tracks findings, action, owner, due/repair dates, retest, status, and reviewer. A closed item without required closeout information remains incomplete.

The DSIM record stores installed model/revision, cable route, control modes, pilot/lock, fallback, pads/settings, final verification, and technician confirmation. Its prompts reflect the included reference workflow; match them to the installed revision and approved procedure. A completed DSIM record remains separate from RF acceptance.

## Run sheet, export, and backup

**Job → Run sheet** combines current job identity and notes with predicted route values, meter comparisons, as-built notes, and recorded field work. Choose the reporting frequency that matches your task. Predictions and measurements retain their different labels.

Use its print, share, and CSV controls for the field summary. The RF, frequency, power, and record tools also have their relevant CSV exports. Printing depends on the phone/browser print service; choose a PDF destination when available. Android and iPhone show different download, share, and print interfaces, so complete the phone's final save action.

### Which save should you use?

| Action | Best use | Includes everything needed to restore the job? |
| --- | --- | --- |
| Local autosave | Continue work in the same app on the same device | Not an external backup |
| Save named job | Switch between jobs on this device | Not an external backup |
| Files → Save project | Move or restore the full working job, including original evidence | Yes, within the export limits |
| Run-sheet text/CSV/PDF or RF/power CSV | Report, review, or share selected results | No |

**End-of-shift routine:** review the job, save its named entry, export a project JSON, verify the file exists outside the app, then share the report as needed. Repeat the project export for each job you must protect. Keep a known-good backup before installing another alpha.

Keep only one NightSweep window open while working. Multiple browser tabs can overwrite locally saved job state with an older copy. Close the extra tabs before continuing, then review the current job before exporting it.

On iPhone, the prepared-file panel offers **Save/share file** when native sharing is supported and **Download file** as a fallback. For the share action, choose **Save to Files** or the intended destination in the phone's sheet. After exporting, look in **Files**. The download folder depends on Safari and device settings and may be in **On My iPhone** or **iCloud Drive**. A local file is a separate backup from app storage; an iCloud destination only syncs according to your own account and connection. NightSweep does not perform that sync. Keep distinct names or folders for different jobs and dates so a later download does not obscure which job you saved.

## Troubleshooting

| Symptom | Check first |
| --- | --- |
| A result shows — | Missing input, unsupported frequency, gain coverage, or invalid upstream feed; read the status message |
| Route levels are unexpectedly low/high | Launch plane and TP compensation, cable type/length/slack, selected passive output, gain/pad/director losses |
| Correct gain at one marker but no result at the other | Both markers must be covered by entered gain data and the hardware band |
| Amp looks adequate by published gain but budget is incomplete | Published scalar gain is reference only; enter applicable gain at both frequencies |
| New amplifier has no usable saved gain | A configuration change clears prior gain data so it is not silently reused for a different active |
| TDR event is outside the route | Endpoint/branch, origin, direction, length/slack, lead subtraction, and velocity factor |
| TDR stops at an amplifier | Test from the relevant cable side of that active; the model does not trace through it |
| Meter error seems off by about 20 or 30 dB | TP correction may be absent or applied twice |
| Sweep trace has gaps | Data or launch coverage ends there; a gap is not zero signal |
| Frequency checker has total loss but no receive level | Enter launch for that frequency |
| Power result is unavailable | Complete load/resistance data, valid parent, source curve voltage range, and supply/voltage inputs |
| Native ONX file has no plotted preview | It may be retained as an attachment without a decoded measurement schema |
| Job-changing controls are blocked | Let the current evidence operation finish |
| Criteria unapproved / record incomplete | Complete the required measured fields, trace/reviewer information, band limits, and approved criteria |
| Tapping the ZIP does not install the app | Extract it, open the extracted folder, then tap NightSweep-1.7-preview.apk |
| Android asks for installer-source permission | Review the prompt for the file manager/browser opening the APK, then return to Install; managed phones may prohibit it |
| App not installed / package conflict | Check whether the installed app is 1.4/1.5/1.6/1.7 Preview or 0.13, and keep its data. Do not uninstall it as a first fix |
| Package cannot be parsed / download is incomplete | Download a fresh copy of the APK, check available storage, and confirm Android 8 or later |
| Installation is blocked by device policy | Use the employer-approved process or contact the device administrator |
| Update will not install | Check existing app/package/signing compatibility; export before any removal |
| iPhone will not open the APK | Open the NightSweep website in Safari and follow the Home Screen instructions; APK files are for Android |
| Android Install app is missing | Keep using the site in Chrome; check its menu for Install and create shortcut or Add to Home screen. Open the actual app in a regular tab |
| iPhone Add to Home Screen is missing | Open the actual address in Safari, review the Share menu, and check whether device management restricts web app installation |
| The iPhone icon will not open offline | Reconnect, open that Home Screen icon, wait for Ready for offline use, then repeat the offline check |
| A Safari job is missing in the Home Screen app | Return to Safari, export the job there, then use Files → Open project in the Home Screen app |
| Export says prepared but no backup is visible | Choose Save/share file or Download file if offered, complete the phone's save action, and check Files/Downloads or the destination; prepared is not confirmation of a saved file |
| A cloud-drive attachment will not import offline | Download the original file onto the phone while connected, then retry the import |
| A job or attachment appears missing | Check the correct app/browser and named job; 0.13, Preview, and iPhone browser/app storage are separate; use a known-good project export |

## Limits and practical checks

NightSweep predicts from the entered model. It does not communicate directly with the ONX, control an amplifier, perform auto alignment, measure ingress/MER, decode every native meter format, or determine whether a physical defect is safe to leave in service.

The RF model interpolates catalog cable loss in square-root frequency and applies the catalog temperature correction to built-in cable data. Passive tables use their defined points/bands. Custom losses are used at their entered conditions. Unsupported data is not extrapolated.

Gain tables are configuration- and frequency-specific. Extra margin is not proof of low distortion or available maximum output. Power uses a scalar RMS approximation rather than a full waveform simulation. TDR distance assumes that the modeled path and lengths match the tested cable.

Numerical, migration, and web-app checks are described in the separate release validation report. Physical Android and iPhone installation, picker, print, rotation, storage behavior, and field performance remain unverified unless separately reported. Automated checks do not establish successful installation on your particular phone or provide a field backtest against paired measured amplifier input/output traces. Complete the offline and backup checks on the phone you will use.

## Historical mathematical audit — 1.6

The earlier [1.6 math audit](https://nightsweep-field.goodst3r.chatgpt.site/math-audit) is included as **NightSweep_1.6_Math_Audit.html** in the coworker package. It describes independent Wolfram reference calculations, app comparisons, corrections and test boundaries. The source package retains the calculation inputs, returned reference results and regression checks.

This supporting report remains historical. A separate **fresh 1.7 numerical review** called Wolfram's evaluator for 15 named synthetic reference results and compared the current application in 18 numerical/rejection checks, all passing within the recorded tolerance. Cases include launch/cable interpolation, temperature and test-point correction, gain, TDR, branched power, unit conversion, injection and relative-return arithmetic. The developer record is `night-sweep/research/alpha17-numerical-audit.md`, with returned results and comparison files alongside it.

Neither audit certifies manufacturer cells, actual measurement planes, firmware, installed plant or field acceptance. The fresh arithmetic review is separate from final release QA and physical Android/iPhone testing. Read its assumptions and the in-app status messages alongside any calculated value.

Context7's MDN platform references were also reviewed for clipboard activation/fallback, storage quotas and eviction. If **Copy** is unavailable, select the literal code and copy manually; finish project exports and keep them outside browser storage. Documentation review does not prove physical Safari or Android WebView behavior.

## Technical references

Equipment entries include source links and configuration notes. The gain references distinguish applicable manufacturer documents from qualified historical references. Read the conditions for the exact model and use measured or verified frequency-specific values for your installed configuration.

Operator design criteria and approved field procedures must be supplied for the actual job. Example frequencies, levels, tolerances, power settings, and checklists in NightSweep are not universal operator standards.

**Release:** NightSweep 1.7 Alpha · Android app label: NightSweep 1.7 Preview · Android web: Chrome/browser or Home Screen · iPhone: Safari/Home Screen web app.


## Historical equipment expansion — build 17

The earlier build 17 expansion added **33 RF equipment selections** (18 active configurations and 15 ATX SGP passives), **four cable selections**, and two measured-load power selections. The equipment browser now includes nodes and power models as well as route equipment and cable.

- **GainMaker:** HGBT and LGD 65/86 remain current. UBT main/auxiliary RF and three UBT power records are retired from new selection at the team’s direction; they remain readable only in legacy saved jobs. HGBT and passive unbalanced three-way splitters remain available.
- **AOI Quantum18:** HGBT and BA, plus explicit 85/105, 204/258, 396/492, 492/606 and 684/834 configurations for HGD/HGBT/LE. A model selection is not proof that those modules are installed.
- **ATX GigaXtend SGP:** standard and AC-continuity directional couplers, two-way, balanced/unbalanced three-way splitters, conditioned coupler and RF path of the power inserter. Installed conditioning plug-ins require their own loss information.
- **Cable:** legacy MC2 .440 and 1.000; CommScope Series 6 and Series 11 drop cable. These historical guide values stop at their published frequency endpoints. Drop cable has no assumed coax-power resistance. The optional RG6 drop tool still takes an entered cable table; adding catalog cable does not silently change saved drop assumptions.

**Find equipment:** Route → Equipment → choose a category, then family/model. For launch selection use Route → Setup; the node metadata also remains in Job → Details. Power models link to Power → Load. Node optical output is a route launch, not an RF gain block inserted midspan.

**Power corrections:** the previous GaN HGD current table has an unverifiable source/configuration link. It is now measured-load only. A saved job that used its old curve reports missing current data until you choose a documented manual load. The AOI HGD table now covers only the unambiguous 45–90 VAC columns; below 45 VAC no result is extrapolated. This table boundary is not the station’s undervoltage limit. HGBT and BA have separate measured-load entries; neither borrows HGD or LE current.

**Gain qualifications:** manufacturer reference gains do not automatically become operating gain at your route frequencies. Enter available gain for the installed configuration. AOI reverse 27 dB is specific to the 204 MHz split. The BA reverse reference is specified at 684 MHz and is not substituted at 204 MHz. Output-only meter photographs cannot establish amplifier gain. No manufacturer reference-output table is used as a universal output limit.

### Working equipment references

- [AOI HGD datasheet — Spanish](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGD-SA-Datasheet_ES.pdf)
- [AOI HGBT datasheet — Spanish](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGBT-SA-Datasheet_ES.pdf)
- [AOI LE datasheet — Spanish](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-LE-Datasheet_ES.pdf)
- [AOI BA datasheet — Spanish](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-BA-Datasheet_ES.pdf)
- [AOI current English product overview](https://ao-inc.com/products/hfc-networking/hfc-amplifiers/)
- [GainMaker HGBT 1 GHz 42/54 datasheet](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3574.pdf)
- [ATX SGP manufacturer loss tables](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgp-1-2ghz-passives/)
- [Vecima EN9000 current product brief](https://vecima.com/wp-content/uploads/2026/09/Vecima-Product-Brief-EN9000-Sep2026.pdf)

The earlier build 17 links were checked on November 10, 2026. The 1.7 equipment review has its own coverage and availability notes. Working product pages are labeled separately from specification documents. Known dead/unrelated links are not clickable in the app. Archived manufacturer documents and links whose access could not be confirmed are labeled. Some legacy cable documents are currently unavailable; their retained tables are historical references, not newly certified data.

**Historical build 17 audit scope:** all 56 original catalog source URLs were checked, and all passive curves underwent numeric, ordering and range checks. Newly added ATX SGP tables and active gain configurations were reviewed against cited manufacturer material. Existing Antronix, Regal and selected cable tables were spot-checked. Every inherited table cell has not been independently re-transcribed or field-certified. Physical Android/iPhone installation and field performance still need device testing.

## 1.7 equipment review and verification scope

There are **556 currently selectable records**: **514 RF selections** (23 active and 491 nonactive), **17 cables**, **22 power selections** and **3 node profiles**. Five retired UBT compatibility records bring the retained inventory to 561. Structural/provenance checks cover all entries and **1,324 curves / 14,126 rows**, including retained legacy curves. Targeted source review includes all 120 GS7000 current/watt cells and a fresh archived Scientific-Atlanta mainline comparison of 72 maximum-loss cells. This is not fresh independent transcription of every inherited cell.

The newest public **EN9000 family brief located is September 2026**. Its ERM3-conditioned RF table and separate ERM3/ERM4 documents do not establish the installed RPD's capability. The −20 ±1 dB test-point reference remains sourced to May 2024. The 180 W PSU output and 200 W thermal quantities are not typical AC consumption; the actual load must be entered. Exact commissioning documentation remains a customer-access gap.

The AOI SA original PDF returned HTTP 404 during fresh review. Equipment setup uses the labeled V02102025 historical manufacturer-authored mirror; the latest issued revision still requires manufacturer confirmation. Exact Quantum18 LE/BA I&O remains unavailable.

A printed-band endpoint defect was identified for banded passives. Nonshared published upper endpoints now remain available. Only explicitly marked Scientific-Atlanta Multimedia curves use the documented larger-adjacent-bound estimate across printed fractional gaps; arbitrary missing data stays unavailable. This estimate does not become a manufacturer measurement.

See **NightSweep_1.7_Equipment_Coverage.md** and **NightSweep_1.7_Release_Notes.md** in the release documentation for corrections, manual coverage and limitations. Current integrated QA, browser, APK and packaging results belong to the actual release-validation record. Earlier build 20 and 1.6 results remain historical; the fresh 1.7 arithmetic review above has its own evidence. Physical Android and iPhone testing remains separately required.
