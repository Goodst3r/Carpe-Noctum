# Carpe Noctum 2.0 Alpha build 4 — technician guide (formerly NightSweep 1.8)

The guide retains its historical `NightSweep_1.8_Alpha_README` filename for existing links.

**Technician guide and README**  
**Spencer Williams · Updated November 13, 2026**

Carpe Noctum (formerly NightSweep) is an offline field calculator and job notebook for HFC maintenance technicians, team leaders, and supervisors. Use it to follow cable and equipment losses, check amplifier gain, locate a TDR distance along a route, estimate power loading, and keep measurements, notes, and meter files together.

Use the Android APK, open the full web app in Chrome on Android, or add the web app to an iPhone Home Screen through Safari. The web app must finish its first online setup before you rely on it offline. Every version uses the same task layout; jobs stay in the app or browser where you create them until you export and transfer them.

Build 2 retains the organized practice library, six-active serial cascade and custom-curve exercise, and improves render work, TDR boundary handling, project-import limits and named-job reliability. Existing launch and equipment setup stay in the same field sequence. Choose a **Node output**, **Amplifier / LE output**, or **Manual / other output** in **Route & sweep → Setup**, then open the matching **Source setup & manual**. Review applicable manual steps under **Route & sweep → Amp / node setup**, continue through your cable route and sweep setup, and save readings and evidence with the job. A source choice does not add an artificial gain block, set launch levels from a rating, or apply test-point correction automatically.

The app opens directly on **Tools → Calculators**, with no job required. The four main tabs are **Home, Route & sweep, Tools, and Closeout**. Route & sweep always opens the route in one tap. Meter setup, Station records, TDR and ONX files are in its searchable list. The dedicated Leakage workflow is retired; existing job data and the old device notebook are retained without modification. Equipment setup notes and reviewed steps are job records; RF predictions, measured readings and acceptance remain separate. The 42/54 MHz forward and Return Sweepless Sweep workflow stays distinct from the 204/258 MHz forward Sweepless Sweep and XPERTrak return sweep workflow.

**Practice navigation:** start the app and run a dB conversion without creating a job. Tap **Route & sweep** to open the route. Expand **Browse Route & sweep screens** and choose **ONX files**, then tap **Tools** to return to calculations. Open **Home** for the practice library and backup controls. A touch selection closes the screen picker; keyboard users can press Escape to return focus to the active tool. The old Field shortcut opens Meter setup; retired Leakage shortcuts return to Calculators.

**Your deployed equipment split:** Vecima nodes and AOI active equipment use **204/258 MHz high split**. GS7000/GS7K, GainMaker and all other node/amplifier families in your fleet use **42/54 MHz**. Training follows this rule. Manufacturer capability tables may describe other variants; they do not change your installed split. Existing saved jobs are preserved for review rather than silently rewritten.

**Start with the task, then enter only its required information.** You do not need to complete the advanced record forms to calculate a span or locate a TDR event.

## Quick start

For a new field job:

1. Open **Route & sweep → Details** and choose **+ New blank job**. Enter a useful name and node or asset. Save a named job when you want it in the local job list.
2. Open **Route & sweep → Setup**. Choose **Node output**, **Amplifier / LE output**, or **Manual / other output**. For a node, select its model, installed split, RF port and operating upper frequency. For an amplifier or LE, select the exact configuration and output port.
3. Enter the actual low/high frequencies, launch levels and cable temperature. If using a test point, enter only the coupling the meter has not already added. Changing the source identity preserves your entered levels; review them for the new physical connection.
4. Choose **Source setup & manual**, or **Route & sweep → Amp / node setup**. Select the source or a route active, read its applicable manual and record the steps actually reviewed. If the exact manual is unavailable, obtain it before applying equipment-specific adjustments.
5. Continue to **Cable route**. Add spans and ending equipment in feed order, starting directly from the selected source output. Use **Route & sweep** for station work and **TDR** for distance checks.
6. Follow **Route & sweep → Meter setup** for the actual plant split and approved method. Attach original meter files under **Route & sweep → ONX files**, then review **Closeout → Run sheet**.
7. Use **Files → Back up project**, finish the phone's save action, and confirm the portable backup exists outside NightSweep.

Home offers an organized **Practice library** with the complete training job, GainMaker OEM AGC, GainMaker / DSIM, GainMaker manual / thermal, GS7K node, six-active AOI cascade and custom-curve exercises. Use the complete example for the route, gain, TDR, readings, power and records tools. Use **Custom curves and reverse TDR** for Tools → Calculators, Tools → Limits, Tools → DOCSIS health, Home → Outage and the sweep grading aid. Use **Six active devices in series** for Route & sweep → Night log and Route & sweep → Sweep due. Use a focused node or amplifier exercise for its exact setup path. Follow the [guided training walkthrough](#practice-every-tool-with-the-training-job). The initial three-tap sample and **3-tap route example** in **Route & sweep → Route & sweep** remain a smaller RF-route example; they are separate from the complete training job. Practice readings are synthetic. Explicit user-supplied local design references are labeled separately and require the matching plant, frequency, signal-power convention and measurement plane.

A read-only strip under the screen title shows the job name, the plant (42/54 GS7K / GainMaker or 204/258 Vecima / AOI) and the selected point. Route & sweep → Station records also shows that worksheet's measurement plane. The strip is hidden on Tools. It stores nothing.

## Find the right tool

| What you want to do | Where to go | What you need first |
| --- | --- | --- |
| Find a task or learn the basic flow | **Home** | Nothing |
| Choose node / amp / LE launch and enter levels | **Route & sweep → Setup** | Exact source output, frequencies, levels and measurement plane |
| Follow the installed equipment manual | **Route & sweep → Amp / node setup** | Exact module, split, firmware and applicable guide |
| Build cable and passive spans | **Route & sweep → Route & sweep** | Lengths, cable, equipment, actual feeds |
| Check whether an amp or LE has enough gain | **Route & sweep → Route & sweep** | Active route point, gain at both markers, output targets |
| Keep personal night notes and prepare a shift handoff | **Route & sweep → Night log** | Meaningful notes, saved Station captures, Remove/Undo and manual intermittent-ingress observations; no customer identifiers |
| Record station balance and separate sweep dates | **Route & sweep → Station records** | Installed station, actual pilots/readings, approved targets and measurement planes |
| Look up cable/passive/active equipment | **Tools → Catalog** | Manufacturer, model, or part type |
| Turn a TDR reading into a span location | **Route & sweep → TDR** | Route distances and measurement origin |
| Follow the measured forward/return setup process | **Route & sweep → Meter setup** | Split, actual test method, matching reference and approved criteria |
| See predicted RF levels across frequency | **Route & sweep → Predicted levels** | Launch and route |
| Check a single cable/passive combination | **Tools → Frequency** | Cable length, passive path, frequency |
| Compare a meter reading with a prediction | **Route & sweep → Route & sweep** | Route point, frequency, reading, remaining TP coupling |
| Look up cable loss, tap faces, or frequency references | **Tools → References** | Matching equipment or route tap as needed |
| Run a quick dB, ripple, OFDM, power-sum, thermal CNR, echo or pad/EQ calculation | **Tools → Calculators** | The frequencies and levels that formula asks for. Nothing on this screen is saved with the job |
| Check a limit and where it came from | **Tools → Limits** | Nothing first. Company values stay unknown until someone enters them |
| Compare a modem or meter reading with a DOCSIS range | **Tools → DOCSIS health** | The reading you type. The card does not talk to a modem |
| Estimate supply draw and equipment voltage | **Route & sweep → Load & what-if** | Actual power circuit and equipment loads |
| Try an additional cable/load before keeping it | **Route & sweep → Load & what-if** | Existing power plan |
| Save/open named jobs and record node details | **Route & sweep → Details** | Job and installed equipment information |
| Attach Sweep, Ingress, or OneCheck files | **Route & sweep → ONX files** | Files already available on your phone |
| Record inspection and repair work | **Route & sweep → Checklists** | Work actually performed |
| Walk through outage first-response prompts | **Home → Outage** | Follow the local outage procedure first. No customer names. A supervisor should review the card before coworkers use it |
| Maintain measurement and acceptance records | **Closeout → Acceptance** | Approved procedure, criteria, readings, and traces |
| Review personal sweep reminders across device jobs | **Route & sweep → Sweep due** | Actual Station work dates and your entered interval, initially unknown |
| Review, print, or share the field summary | **Closeout → Run sheet** | Current job data |
| Read the calculation methods | **Help** from the header or Home | Nothing |

Main tabs choose the work area. The smaller task tabs choose a function within that area. The point selector chooses which route location you are editing. Use **Previous** and **Next** when working down the route instead of scrolling past every point.

## Install and update

Use the separate [Android/iOS installation guide](NightSweep_1.8_Alpha_Android_iOS_Installation.md) for the phone steps written for the 1.8 package. The table in this section describes that **historical** delivery, **NightSweep 1.8 Alpha build 2.zip** (Preview APK **1.8 Alpha build 2**, code **24**). It is not the current installer.

The retained installer in this repository is **2.0 Alpha build 2**, Android code **26** (`apk/CarpeNoctum-2.0-build2-preview.apk`). A separately built starting-commit build 3 Preview, code **27**, was reported by Spencer to update his existing app with jobs, readings and originals intact. **2.0 Alpha build 4**, source code **28**, is a pre-signing candidate: its APK, final phone acceptance and web deployment are not yet verified. Build and sign it outside the repository with the original key after review and the full gate.

The historical 1.8 ZIP is one folder containing Android web, iOS web, the Preview APK option, documentation, examples, source and verification records.

| Option | File or route | Important distinction |
| --- | --- | --- |
| Android Preview APK | `Android/APK/NightSweep-1.8-build2-preview.apk` | Verify the supplied build/signature receipts. Expected version is **1.8 Alpha build 2**, code **24**, label **NightSweep 1.8 Preview build 2** |
| Android web | `Android/Web/NightSweep.html` or the complete `Android/Web/PWA/` | A local HTML file is separate from the browser's installed offline web app |
| iPhone/iPad web | `iOS/Web/NightSweep.html` or the complete `iOS/Web/PWA/` | Uses the same shared web app; Safari Home Screen installation needs an appropriately hosted PWA |
| Hosted app | Existing NightSweep website | This local package does not publish an update. Check the version actually served before relying on it |

A compatible Preview APK keeps the existing package/origin and requires the original Preview signer with a higher code. Export jobs first, install the update without uninstalling or clearing data, then verify jobs/originals and offline reopening on your own phone. An installer conflict is a reason to stop and check identity; deleting the working app is not a recovery step. The older standard 0.13 signing identity is separate.

The known site address is **https://nightsweep-field.goodst3r.chatgpt.site/**. It has not been deployed by this local build. Local copies under Android/Web and iOS/Web do not silently update that site or transfer its jobs. An iPhone/iPad cannot install an Android APK; no IPA or App Store submission is provided.

### Protect work and verify offline use

1. Open each important job and choose **Files → Back up project**. Finish the save/share picker and confirm its JSON exists outside NightSweep. Exports from this 2.0 Alpha build 4 source use the **CarpeNoctum_2.0_Alpha_build_4_** filename prefix. Older 1.8 build 2 files used **NightSweep_1.8_Alpha_build_2_**.
2. Use **Files → Open project** at the destination, then verify route, notes, readings, records and original evidence. Save a named copy and retain the external backup.
3. In a supported hosted browser/Home Screen app, wait for **Ready for offline use**. Use one editing window, enable Airplane Mode with Wi-Fi off, close/reopen the same app/icon and check a practice calculation plus a saved original.
4. For a hosted update, export first, then choose **Check for updates → Install update → Reload app**. Check the actual displayed version, jobs and offline readiness afterward.

The APK and browser, different browser profiles, Safari and a Home Screen app can use separate stores. No automatic cloud sync is added. Autosave, named jobs, report CSV/PDF and screenshots do not replace a full external project backup. **Protect local storage** is a best-effort browser request.

All seven synthetic exercises are bundled. External manufacturer links and cloud-only files need a connection. Source, tests and public audit records are organized under **Source/** in the one ZIP; private signing material, installed dependencies and toolchain binaries are excluded. Native-build and signature verification are separate from physical-device validation; read the final package receipts for executed results.

## Home and everyday navigation

Home provides task buttons and a short getting-started sequence. Choose the task that matches your question: building a route, checking an amplifier, locating a TDR distance, comparing readings, checking power, or managing a job.

The app opens on Home. The current job is shared across the app's task views. Moving between tabs does not create a different route or erase your work. **RF and power are separate circuits inside the job**, because the power feed can differ from the RF feed.

The palette button in the header (**Switch to Sun palette** or **Switch to Night palette**) changes the display palette. It does not change data or calculations. Use the theme that is easiest to read at your work location.

A dash (**—**) means a result is unavailable. It is not zero. Read the nearby message before changing several inputs at once.

## Practice every tool with the training job

Home provides seven separate practice exercises and a feature index that loads the matching seeded exercise and opens its guided step. Every exercise remains labeled **SYNTHETIC TRAINING JOB** after editing, saving and export. Practice readings are teaching inputs, not evidence of physical AGC operation. The focused lower-split jobs separately identify the user-supplied local design references below; those are not manufacturer specifications or universal targets.

| Home choice | Plant and equipment | Guided steps | Original evidence supplied |
| --- | --- | ---: | --- |
| **Open complete training job** | Cedar Lane: GS7K launch, GainMaker HGD actives, mixed Scientific Atlanta / GigaXtend / Technetix passives, branched 42/54 MHz route, power and records | 22 | Six synthetic files: five interchange CSVs and one original-only SVG diagram |
| **Open GainMaker OEM AGC practice** | Separate 42/54 MHz GainMaker HGD launch and downstream AGC LE | 8 | None; attach clearly labeled practice files yourself |
| **Open GainMaker / DSIM practice** | Separate 42/54 MHz GainMaker HGD launch and downstream LE with ACI DSIM practice notes | 9 | None; no fabricated meter captures or verified pilot lock |
| **GainMaker manual / thermal** | Separate 42/54 MHz manual/thermal control path | 7 | None; installed settings unverified |
| **Open GS7K node practice** | Standard GS7000 1.2 GHz launch, starting at 42/54 MHz; separate node-only setup exercise | 10 | None; launch/TP correction unverified, no RF route or captured traces |
| **Six active devices in series** | Vecima source followed by six serial AOI route actives on 204/258 MHz; Night log and Sweep due practice (2.0 Alpha build 3) | 16 | Synthetic teaching data; no physical acceptance |
| **Custom curves and reverse TDR** | Manual source and custom cable/passive tables; field calculators, limit sources, attached sweep grading, DOCSIS health, Outage, Impairments, Fiber, High split, Why cards, Proof of performance, Study mode and Supply PM (2.0 Alpha build 3) | 21 | Synthetic table and calculator inputs; no field captures |

The complete workflow uses the GS7K/GainMaker HGD 42/54 MHz plant. Confirm the exact installed HGD module and its applicable setup procedure. GainMaker OEM AGC and ACI DSIM retain their own focused exercises. Vecima/AOI 204/258 MHz belongs to the separate six-active example.

### Start without losing your working job

1. If a real job is open, use **Files → Back up project** and verify that its JSON file exists outside the app. Save its named entry as well if you want to reopen it from the local list.
2. Open Home and choose a practice exercise or a feature in the Practice library. Confirm the change-of-job prompt. The app keeps the current working job and its evidence in named jobs on this device before opening training; that local copy is still not an external backup. If preservation or evidence preparation fails, address the message rather than clearing storage.
3. Confirm the job name begins with **TRAINING**. Home shows **Guided practice** for the selected exercise: the complete example has 22 steps, OEM AGC eight, DSIM nine and GS7K ten. The six-active example has 16 steps, custom curves 20 and manual/thermal 7. Choose **Open step** to reveal the destination controls, try them, then mark **Reviewed**. The **Practice guide** button in the training banner returns you to the checklist.
4. Keep practice edits in the training job. Use a new blank job for real work; do not rename the training data and treat it as measured plant information.

While a training job is open, its matching Home action offers a reset of that exercise. It preserves the current practice copy in named jobs before restoring the baseline exercise. Use it when you have changed several inputs; review the prompt before continuing. Progress checkmarks belong to the current training copy.

The training content is bundled with the app. After the Android/iPhone web app reports **Ready for offline use**, its training job can be used without a connection. External manufacturer pages still need internet access.

If a practice button cannot open a job, read the message directly below the practice buttons. Storage failures and full or unreadable named-job lists stop the switch to protect the current job; do not clear storage as a workaround. The complete exercise also needs secure file verification: use the installed APK or the HTTPS website rather than a restricted file viewer. Existing older training copies remain unchanged. If their hardware does not match the corrected exercise, reset the complete training job to open the current GS7K and GainMaker HGD practice after preserving that copy.

### Focused GainMaker practice

For **OEM AGC**, begin with the HGD launch and its installed OEM detector/pilot, then choose the documented manual-backoff or thermal setup branch in Equipment setup. Review the downstream LE separately and finish with forward/Return Sweepless Sweep, records and backup. Pilot frequency/type and module compatibility deliberately start unspecified. There is no DSIM record or preselected DSIM code in this exercise.

For **ACI DSIM**, identify the HGD and downstream LE, their DSIM variant, firmware and complete applicable procedure before physical changes. The historical lookup exercise uses channel 110 digital, 711 MHz, `@@?<A`; lookup or copying does not change key verification or establish pilot lock. Procedure-specific pad, switch and backoff values start blank. The records remain incomplete until actual work and evidence are entered.

The focused **OEM AGC and DSIM** exercises use the user’s local non-high-split design anchors: **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**. Their synthetic raw readings are **11 / 23 dBmV**, with one explicit **+20 dB** remaining test-point addback, yielding **31 / 43 dBmV**. The **38 dBmV return TX reference** is recorded separately; confirm the transmitter, signal-power convention and measurement plane. It is not forward launch, return injection or CMTS/receiver level. The complete GS7K/GainMaker HGD workflow uses the same local **54 / 860 MHz at 31 / 43 dBmV** anchors; the separate Vecima/AOI six-active exercise uses **261 / 993 MHz at 34 / 46 dBmV**.

The focused OEM AGC, DSIM, manual/thermal and GS7K examples open with zero evidence files. Attach your own labeled practice originals under **Route & sweep → ONX files** when rehearsing evidence handling. Opening or resetting another example preserves the previous working copy in named jobs; export it for an external backup.

### Focused GS7K node practice

Choose **Home → Open GS7K node practice** for a ten-step standard-node exercise. It starts with a **GS7000 1.2 GHz / 42/54 MHz** launch. Launch levels and test-point correction are deliberately unverified; there are no RF route rows, attached evidence files or saved traces. Confirm actual readings and remaining compensation before using predictions. The GS7K design profile carries the user-local **54 / 860 MHz, 31 / 43 dBmV** anchors and separate **38 dBmV return TX reference**. Actual source markers, readings and remaining TP coupling stay blank/unverified; design values are not copied into measured launch. The starter is not a pre-aligned node.

Follow the guide through identity, **Route & sweep → Setup → Node output → exact model**, **Source setup & manual**, receiver/routing checks, standard forward pad/EQ setup, return handoff, the applicable sweep workflow, records and backup. The guide explains where standard 1 GHz selection changes the source/manual context. Reviewed steps remain practice records.

Current Equipment setup launch choices cover **standard GS7000 1 GHz and standard 1.2 GHz**. SHO/Fiber Deep, Intelligent and retrofit-RPD documents are variant references requiring exact installed-module confirmation; they are not additional selectable launch/setup profiles here. Conventional LCM Auto Set-Up discovers modules and does not balance RF. This practice job provides no physical alignment or measured acceptance.

### Six actives in one serial route

Choose **Six active devices in series** in the Practice library. It starts at a Vecima EN9000 source and follows six AOI active devices along one feed path, using the local 204/258 MHz workflow. The source node and any sibling branches do not count toward the six. The guide walks down the actual active chain so you can compare cumulative cable loss, configured gain, both marker predictions, reserve and output limits.

These are synthetic entered gains and cable values. They demonstrate a route calculation, not an approved cascade design, installed alignment, or measured RF acceptance. TDR cannot propagate through an amplifier; choose the cable-side origin for each active section. Reset or reload the exercise to restore its teaching baseline.

### Manual source and custom curves

Choose **Custom curves and reverse TDR** to load a manual launch, a frequency-dependent launch table and custom cable/passive tables. Use **Show the arithmetic** and the Frequency checker to compare the supplied points, interpolation and unavailable values outside the documented table range. Missing points are not zero and passive/cable curves do not extrapolate. The guide keeps measured inputs, sourced limits and teaching values separate.

Its **Tools → Calculators → OFDM power** step uses **Conversion basis → Confirmed basis below** only after confirming flat PSD, both widths in MHz and bandwidth restatement only. With synthetic inputs, 48 dBmV measured in 1.6 MHz restates to **54.0206 dBmV over 6.4 MHz**, a **+6.02060 dB** change. Set **Measured in (MHz)** to **6.4 MHz** and restate 54 dBmV over 1.6 MHz for the reverse: **47.9794 dBmV**, a **−6.02060 dB** change. This restatement does not establish instantaneous OFDMA total or available transmit headroom.

In **Tools → DOCSIS health → Upstream composite margin to Pmax**, use **Total and reference basis → Confirmed basis below** only for a genuine simultaneous total at the CM F-connector and a known applicable comparable total reference. Set **How the modem is working** to **DOCSIS 3.1 CM + CMTS, MTC enabled**, type a synthetic total of 52 dBmV and leave Pmax blank: **+13.0000 dB**, below the explicitly assumed **65 dBmV Spec minimum/default reference**. Actual modem capability remains **Unknown**. A total of 65 gives exactly **0.00000 dB**, neutral; 66 gives **−1.00000 dB**, over the reference. Normalized/per-channel status readings cannot stand in for a total. Another declared mode supports only a generic entered-reference comparison; it does not certify DOCSIS 3.0/compatibility per-channel compliance. Available per-channel/DRW headroom, channel count, channel width and future full-grant capability remain **Unknown**. Company windows still start Unknown and remain separate for 42/54 and 204/258 MHz.

### Know the complete practice route

The complete Cedar Lane workflow starts at a **GS7000/GS7K node** and feeds **two GainMaker HGD actives** on the local **42/54 MHz** plant. Its passive route mixes **Scientific Atlanta, GigaXtend and Technetix** equipment. Forward design anchors remain **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**. The **38 dBmV return-transmitter reference** is separate from forward launch, generator injection and receiver levels.

Node hardware capability is not an end-to-end route rating. A node profile can describe **1218 MHz** hardware while the selected HGD active covers **54–1002 MHz** and the Scientific Atlanta passive covers **5–1000 MHz**. Follow the entered route/planning/live limits and matching model tables; do not infer 1218 MHz operation through the whole route. Exact installed GaN setup instructions remain a documentation hold; a conventional GaAs manual, OEM pad formula or DSIM procedure is not a substitute.

All cable spans include their prefilled slack. Main and branch feed paths remain separate. Gain, cable and power values are synthetic teaching inputs, not manufacturer settings or measurements.

| Route point | Exact selected equipment | Incoming cable / complete span | Feed |
| --- | --- | --- | --- |
| HGD A1 | GainMaker HGD, 1 GHz 42/54 | P3 .750 / 820 ft | Source |
| Tap A | Scientific Atlanta SAT MM 4-23 | P3 .625 / 260 ft | HGD A1 through |
| HGD A2 | GainMaker HGD, 1 GHz 42/54 | QR .715 / 620 ft | Tap A through |
| Split S1 | GigaXtend XSC-2-959 | P3 .625 / 110 ft | HGD A2 through |
| Main Tap B | GigaXtend GTSG-TAP-4-20-STD | P3 .500 / 310 ft | Splitter low-loss output |
| EOL Tap C | Technetix OTTZ-4-17 | P3 .500 / 260 ft | Main Tap B through |
| Branch Tap D | Scientific Atlanta SAT MM 4-23 | P3 .625 / 210 ft | Splitter high-loss outputs |
| Custom inline loss | Entered custom-passive table | P3 .625 / 100 ft | Branch Tap D through |
| Cable-only end | No passive | P3 .500 / 100 ft | Custom through |

The main endpoint is 2380 ft from the source; the branch cable-only endpoint is 2220 ft. The GS7K source has 1218 MHz hardware capability, but this exercise enters 1000 MHz operating/planning capability and 860 MHz live spectrum. The profile container's label does not override those fields.

### 1. Inspect launch and equipment identity

Open **Route & sweep → Setup**. Confirm the GS7K source, 42/54 split, selected output, **54/860 MHz** markers and measurement plane. Synthetic **11/23 dBmV** test-point readings with one remaining **+20 dB** correction give **31/43 dBmV** launch. A meter that already compensates its test point needs no second addback. RF cable temperature and power-cable temperature are separate inputs.

Open **Source setup & manual**, then select each route HGD under **Route & sweep → Amp / node setup**. Identify exact modules, firmware, control hardware and the applicable procedure. Keep unavailable model-specific instructions unresolved. The focused OEM AGC, DSIM and manual/thermal exercises teach their own matching control paths; they do not approve applying those instructions to this GaN module.

Try the header's palette button (**Switch to Sun palette** or **Switch to Night palette**) and **Help & methods**. Display controls do not change route calculations.

### 2. Follow branches, passives and the drop

Open **Route & sweep → Route & sweep** and use the point selector or **Previous/Next** to follow the incoming cable and ending device. Identify Scientific Atlanta, GigaXtend and Technetix by the selected exact model and port.

At Split S1, follow the low-loss output to Main Tap B and the high-loss output to Branch Tap D. Open **More at this point** to compare tap faces, inspect the **75 ft custom RG-6 drop** and premises splitter, read map notes and expand **Show the arithmetic**. Custom cable tables are already at actual temperature; do not apply the published-cable temperature factor again.

Follow the branch's custom inline-loss and cable-only points. Try adding a point in this training job and observe how its parent output changes distance and prediction. Reset when you need the baseline.

### 3. Check both HGD amplifiers

Open **Route & sweep → Route & sweep** and review the stations named HGD A1 and HGD A2. Compare input, desired output, entered frequency-specific gain, margin, reserve and output limits. The second active provides a gain-table exercise. A manufacturer's scalar operational-gain reference is not a flat response or proof of installed available gain.

Change one marker's gain, review its prediction and restore it. A satisfactory low-frequency result cannot compensate for a high-frequency shortage. In **Calculate gain from test-point readings**, the synthetic 54 MHz pair 7.1/16.1 dBmV with equal +20 dB addbacks gives 27.1/36.1 dBmV, or **9 dB** net gain. Compare corrected output minus corrected input at the same frequency, applying only remaining coupling once. This changes an arithmetic input; it does not align a physical station.

### 4. Locate a TDR distance after the correct active

Open **Route & sweep → TDR**. Select the cable side after **HGD A2** and review endpoint, direction, displayed distance, lead and velocity factors. The example uses 295 ft displayed − 25 ft lead = 270 ft from HGD A2 at route coordinate 1700 ft. The event is at 1970 ft: 160 ft into Main Tap B's 310 ft incoming span, 150 ft before its end. Both VFs are 0.87. This locates an entered distance; it has not detected a physical fault.

Try the **Launch** origin exercise. A route from the source beyond an amplifier crosses an active boundary and is blocked. Restore the cable-side origin. Route coordinate and distance from the chosen origin are different quantities.

### 5. Compare sweep views, frequency and references

Open **Route & sweep → Predicted levels**. Compare **Signal level**, **Normalized path response** and **Total path loss** for the source, actives and tap ports. Read live/planning limits and unavailable coverage. These calculated curves are separate from the attached synthetic CSVs.

Open **Tools → Frequency**. At **860 MHz**, 200 ft × 2.2 dB/ 100 ft + 1.4 dB through loss = **5.8 dB**, so 43 dBmV launch gives **37.2 dBmV** receive level. These are synthetic exact-frequency entries already at temperature. This is a separate single-path checker; the full-route summary follows the selected route output. An override does not establish loss at every frequency, and clearing launch leaves receive level unavailable even if loss is calculable.

Use **Route & sweep → Meter setup → 42/54 MHz** for forward **Sweepless Sweep** and **Return Sweepless Sweep**. Keep the **38 dBmV return TX** reference separate from receiver and injection settings. The **204/258 MHz XPERTrak return** path belongs to the separate Vecima/AOI six-active example.

Open **Tools → References** for available-carrier target estimates, anchors, cable loss, tap faces and draft targets. Preserve the original **54/860 MHz** design when estimating at confirmed carriers. Applying a reference changes only its stated fields and never approves criteria.

### 6. Compare synthetic readings

Open **Route & sweep → Route & sweep**. Inspect HGD test-point and direct tap-output examples. Identify raw value, remaining coupling, corrected reading, prediction and signed difference. Intentional discrepancies teach input/frequency/measurement-plane review; they do not establish a defect or acceptance.

Change one reading by 1 dB and confirm corrected reading/error move by 1 dB, then restore it. Do not add coupling twice to a meter-compensated reading.

### 7. Follow the separate power circuit

Open **Route & sweep → Load & what-if**. The **90 V, 15 A** teaching supply feeds an independently entered topology. The GS7K node is entered as **0.75 A** and HGD A1/A2 as **0.60/0.45 A**, all explicitly synthetic. The custom branch is **20 W at PF 0.9**. The GaN preset has no verified current curve; no AOI load curve is substituted. Replace teaching loads with installed or measured data for real work.

Review supply current, loading/headroom, branch current, voltage drop and equipment voltage. With unchanged synthetic inputs, the independent reference answer is **2.047 A** supply current, **13.65%** loading and **88.83 V** minimum equipment voltage at HGD A2. RF branches do not define power passing.

Open **Route & sweep → Load & what-if** for the additional **300 ft / 0.75 A** candidate after HGD A2. The independent trial answer is **2.798 A** supply current, **18.65%** loading and **87.37 V** at the new load. Compare before keeping it, then reset to recover the baseline. These are planning estimates, not measured draw, verified power-passing ratings or equipment undervoltage limits. The source inputs and independent Wolfram results are retained in `research/alpha18/complete-workflow-wolfram.json`.

### 8. Inspect synthetic meter files

Open **Route & sweep → ONX files** and compare the five interchange CSVs: Sweep Before/After, Ingress Before/After and OneCheck After. The sixth file is an original-only synthetic SVG diagram. None is a native ONX capture, measured field trace or data extracted from the user's photographs.

Preview the stages, export an original and confirm it exists outside the app. A filename typed in a record does not contain original bytes. Unsupported photos/files remain attachments and do not automatically populate readings.

### Build 3: grade an attached sweep

In **Route & sweep → ONX files → Grading aid**, select an attached **Sweep**, then explicitly choose **42 / 54** or **204 / 258 MHz** and **Forward** or **Reverse**. Each of the four company profiles starts entirely unknown. Selecting a profile does not edit an old job. Enter measured marker frequencies, a PTV limit, absolute level targets and tolerance, and a signed tilt target and tolerance as needed. Zero is an entered value; blank stays unknown. Both markers must exist exactly in the supplied samples; inspect the original preview for available frequencies. No interpolation or extrapolation occurs.

Supported native previews cover the inspected VIAVI **TestGroup** and **CDM2** sweep JSON layouts, directly or inside gzip (including `.json-1.gz`) or a ZIP with one eligible JSON. Only one unambiguous explicit trace is decoded; unsupported or ambiguous files stay attached with a reason. These narrow adapters are not a general VIAVI decoder. Native direction and reference state are shown separately: unknown direction remains unknown, even when you explicitly select a grading direction. A known native direction conflict blocks grading. Native limits never become company criteria. The included interchange CSV practice traces are invented and are not native ONX captures.

**Grade selected sweep** reads the saved original again and checks its size and SHA-256 before parsing. The result shows raw PTV (maximum minus minimum), low/high values, signed high-minus-low tilt, and each comparison's pass/fail/unknown reason. Raw absolute measurements use **dBmV**; differences, PTV and tilt use **dB**. Relative dB response cannot establish absolute dBmV levels. An empty referenced trace does not become a zero line or a flatness pass. Unreferenced absolute PTV is not normalized ripple.

A criterion that cannot be saved stays in this session with **Not saved** beside the named field and an autosave-failure status. Use **Back up project** to keep these changes outside the app; the warning clears after a successful whole-job autosave. Invalid text keeps its named error and is refused by **Grade selected sweep**, including repeated taps. Correct it or deliberately clear it for unknown. If the panel refreshes, it restores the last valid in-session criterion and clears the invalid draft; an unsaved-value warning remains until saving succeeds.

Read-only numbers use up to 12 significant digits for readability. **≈0** identifies a computed difference within the existing machine-roundoff allowance; it adds no measurement tolerance. Editable criteria, stored raw numbers, exported history and pass/fail decisions are unchanged by display formatting. Very small entered targets and limits remain nonzero, using scientific notation when needed.

No TPC/test-point addback, lead correction, reference subtraction, normalization or detrending is applied. Verify that the selected targets and original share the same measurement plane. Application entry/decoding bounds are software resource guards, not OEM specifications. A grading result is your technician aid, never official acceptance; it does not set balanced/swept status or a sweep date.

Each compact historical snapshot saves its criteria, plant/direction, original evidence identity and SHA, job/source/record context and calculation time. New context snapshots store a SHA-256 digest of bound Station records, including both Before/After worksheets and independent work dates; archived bindings remain in the job backup. Earlier raw-context grading history opens unchanged and requires re-grading to establish current context. Measurement time stays unknown unless you enter a verified time; calculation time is not the meter's measurement time. Changes make the current display stale/unknown. Old snapshots keep their original labels and values. Removing an attachment preserves its grading history with an unavailable-original message. A full **Back up project** includes the unchanged compressed/archive original and grading snapshots; restore remaps each evidence identity, including duplicate-byte attachments. Browser autosave and named-job duplication also preserve history. Keep external backups before clearing app data.

The **Custom curves and reverse TDR** exercise adds an explicit grading step and a feature-index link. It supplies instructions for a three-point invented interchange CSV (270/390/510 MHz, 0/2.5/0 dBmV). Enter the illustrative 3 dB PTV limit yourself: PTV is 2.5 dB and the other blank criteria stay unknown. These practice values are not shipped company defaults.

### 9. Review checklists and records

Open **Route & sweep → Checklists** for inspection, maintenance, repair and retest notes. Try **72 dBµV → 12 dBmV**; this adds no test-point correction. Checkmarks record practice, not acceptance.

Open **Closeout → Acceptance**. Review planning-only rows, unapproved criteria, frequencies, measurement planes, corrections, trace references and reviewer fields. The **38 dBmV return TX reference** is not a receiver target or generator setting. Injection-budget arithmetic is a separate form exercise, not the 42 MHz Return Sweepless Sweep method or an instrument limit.

Keep the DSIM form exercise separate from the installed HGD procedure. Reviewed steps cannot establish pilot lock, module compatibility, physical alignment or measured acceptance. Inspect the open punch item and required closeout/retest fields.

### 10. Export and recover the job

1. Review **Closeout → Run sheet**, including synthetic label, equipment, frequencies, predictions and notes.
2. Try report, print/share and CSV actions; complete the phone's save/share step and verify the result. Reports are not full backups.
3. Try **Route & sweep → Details → Save now** and **Duplicate**. Retain TRAINING in practice names.
4. Use **Files → Back up project** and confirm the JSON exists outside the app.
5. Reopen it with **Files → Open project** and verify route, power, records, progress and all six original files.
6. Return to the preserved real job or **+ New blank job**. Check its name before entering real readings.

Learning checkmarks describe guide progress; they do not certify competence or approve a field job. The detailed sections below explain each tool's equations and limits.

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

Open **Route & sweep → Amp / node setup**, or choose **Source setup & manual** from Launch. Select the launch source or an active point already on the route. The screen brings its model, band, source document, revision or section, applicable steps and missing information together. The read-only **Setup frequencies & job levels** card shows the selected job design profile’s forward anchors/targets, the separate 42 MHz TX reference and return frequencies/service plan, and the recorded pilot context. The card also shows calculated available-carrier targets separately from the base design when a valid conversion draft exists. Confirm these references apply to the selected station and output; they are not meter readings or automatic hardware settings. Use the continuation buttons to return to Launch settings or Cable route, or to continue to Forward / return sweep, Record readings or Attach evidence / backup.

For GainMaker stations, first choose **Installed gain control → OEM GainMaker AGC**, **ACI DSIM**, or **Manual / thermal control**. Then choose the **Documented setup method** offered for that exact model. This distinguishes the physical fitted control from the method used to prepare it. A catalog label or previous DSIM note does not prove the currently installed control.

Review the source's stated applicability before checking a step. Historical manufacturer-authored copies are labeled separately from current manufacturer links. A datasheet is identified as a reference, not a setup manual. Download original manuals while connected if you need them in the field; NightSweep's summarized notes are available offline, while external links require a connection.

Reviewed steps and station notes remain with the job and portable project backup. Checks are tied to the exact model, band and manual context so an equipment change does not imply that the new configuration has been reviewed. Checkmarks do not establish RF acceptance. Enter actual measured results and approved local limits in the appropriate records.

Exact public commissioning guides remain unavailable for **Vecima EN9000/RFAM/RPD**, **Quantum18 LE**, and **Quantum18 BA**. Those stations show the manual gap and manufacturer support route. Do not apply HGD/HGBT directions to LE or BA, or a standard GS7000 guide to an Intelligent/SHO/RPD configuration without confirming the correct manual.

### Set up a GS7000 / GS7K launch node

1. Open **Route & sweep → Setup → Node output** and choose the installed **GS7000 1 GHz** or **GS7000 1.2 GHz** model. Confirm its split, asset, RF port, launch/receiver/transmitter modules, routing and actual operating/live limits. Enter approved launch targets or measured levels; the node choice does not set them.
2. Choose **Source setup & manual**, or open **Route & sweep → Amp / node setup** and select the launch source. Read the exact standard-node guide. The selectable launch setup covers standard 1 GHz and standard 1.2 GHz. SHO/Fiber Deep, Intelligent and retrofit-RPD manuals remain variant references; those are not extra launch/setup choices here, and their procedures are not interchangeable.
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

1. Open **Route & sweep → Amp / node setup**, choose the GainMaker source/route station and its DSIM variant, then open the pilot-code lookup.
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

Use **Route & sweep → Route & sweep** to answer: **Can this amplifier restore the desired output after the preceding route losses?** First add the amplifier in Cable route as **Active amplifier**. Then open that active row in Route & sweep.

The catalog offers standard GainMaker 1 GHz HGD, HGBT, manual LE, thermal LE, AGC LE, and AOI Quantum18 HGD and LE configurations. Match the actual module, split, control mode, and output path.

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

Open **Route & sweep → TDR** after entering the cable route. The locator relates an already measured one-way TDR distance to that route. It does not interpret a TDR waveform or identify the defect type.

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

## Guided sweep setup

Open **Route & sweep → Meter setup**. Choose the plant split independently of the downstream equipment bandwidth:

| Plant profile | Forward test | Return test |
| --- | --- | --- |
| **42/54 MHz** | Forward sweepless sweep | Return sweepless sweep |
| **204/258 MHz** | Forward sweepless sweep | Return sweep using XPERTrak |

Read the detailed [setup guide](https://nightsweep-field.goodst3r.chatgpt.site/setup-guide), also included as **NightSweep_1.8_Setup_Guide.html** in the coworker package. The in-app steps are available offline in both the APK and web app after the web app reports readiness.

Each split keeps its own setup entries, reference details, step notes and completion marks. Record the actual station/leg, installed equipment, test plan, reference identity, measurement plane and compensation. Switch profiles without reusing a different split's targets. Site-specific levels and limits start blank; the previously discussed 31 dBmV and −8 dBmV are not applied as universal defaults.

For **42 MHz return sweepless**, use the meter's matching service plan, reference-bandwidth setting and saved reference. Return sweepless derives its response using DOCSIS operation; it is not an injected reverse sweep and does not qualify vacant spectrum. Keep absolute and referenced displays, their units, and the measurement method with the record.

For **204 MHz XPERTrak return sweep**, follow the configured node/port, sweep plan and telemetry arrangement. Record only compensation not already applied. The generator helper is a calculation for an applicable injection setup, not an instruction to enter that total into every ONX field. Confirm the meter mode, capabilities and plan before using it.

The comparison helper reports level and tilt differences from the values entered. It does not choose an approved operating target, certify a band, control the ONX or XPERTrak, or change amplifier settings. A completed step means only that the technician marked that step; final RF acceptance requires measured evidence and review.

Use the workflow export for a readable setup record, and **Files → Back up project** for the full portable job backup. Attach the original Before/After/Reference meter files under **Route & sweep → ONX files**. A workflow text export does not replace that backup or its original evidence.

## Sweep predictions

Open **Route & sweep → Predicted levels** to see the route over frequency and the output-level table. Select only the traces you need; fewer traces are easier to compare.

| Graph mode | Use it for |
| --- | --- |
| Signal level, dBmV | Expected level at a route input/output, including source tilt |
| Normalized path response, dB | The modeled path response after removing launch response and zeroing at the reference frequency |
| Total path loss, dB | Accumulated net path loss, including entered active gain where present |

Set the viewing range and normalization reference to the job. Tap or move over the graph for numerical readouts. The level table can be restricted to tap ports.

Solid/dashed styling distinguishes frequencies within and above the stated available spectrum. A gap can mean missing/unsupported loss data, missing gain, or a launch curve that stops at its anchors. No curve is silently continued through an unsupported range. These are calculated traces, not an imported measured sweep or a MER prediction.

## Frequency checker

**Tools → Frequency** is a quick calculation for one cable segment plus one passive output path. It does not require rebuilding the full RF route.

1. Select cable, feet, passive, actual output path, and quantity.
2. Check return, forward, equipment, planned, and live-frequency limits.
3. Select the frequency you want to examine.
4. Enter exact cable loss per 100 ft or passive loss per device when you have better data.
5. Enter launch at that frequency to calculate receive level. Without a launch value, total loss can still be useful.

**Example:** 200 ft at an entered 2 dB/ 100 ft, plus one passive with an entered 1 dB loss, gives **5 dB total loss**. A 40 dBmV launch predicts **35 dBmV receive level**. This example uses exact values; it does not claim a particular cable or passive has those losses.

Temperature and passive basis are shared with Route Setup. Exact overrides are at actual conditions and are not temperature-corrected again. A custom/unsupported item needs appropriate exact values. Actives belong in Amp gain; this checker does not substitute a published scalar amplifier gain.

The complete-route summary selects an existing route output and shows its total path distance, net low/high loss, predicted levels, and tilt. That summary uses the full selected feed path, unlike the single-segment checker above it.

## Meter readings

Open **Route & sweep → Route & sweep**, select the route point, and choose the relevant output. Enter measurement frequency, displayed level, and any remaining test-point coupling.

The comparison shows:

- **Prediction:** The route calculation at that frequency.
- **Measurement:** Your entered reading, with selected remaining TP correction applied.
- **Error:** Measurement minus prediction.

Example: prediction 30.0 dBmV, displayed meter reading 9.0 dBmV, remaining TP coupling 20 dB → corrected measurement 29.0 dBmV → error **−1.0 dB**.

A positive error means the meter is higher than the model; a negative error means it is lower. Investigate cable length/type, actual output path, equipment selection, temperature, pads/EQs, and compensation before deciding the plant is faulty.

A zero reading is a valid number; a blank means no measurement was entered. A field comparison is not automatically copied into acceptance records or ONX attachments. Use Job Records and ONX files when you need those separate records.

## References

**Tools → References** groups optional shortcuts:

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
| Return TX channels / service plan | Actual channels / approved service plan remain unspecified. The separate company span **11–42 MHz** is a reference span with unconfirmed basis; it identifies no usable carrier and changes no hardware edge |

**54 MHz is below the forward passband of the LGD 65/86 configuration and every catalog Quantum18 split.** Use an approved in-band job marker for those stations; never copy the lower-split 54 MHz anchor silently. The OEM thermal-setup branch does not use a manual-backoff test frequency. The actual OEM detector part number and approved live pilot carrier must be identified; a DSIM factory preset (for example CH88 digital 609 MHz) is not approval to use it on your plant.

New company node references are available in **Route & sweep → Setup → Company node-output design reference**. Explicit Apply selects **32 @ 54 / 43 @ 753 MHz** for 42/54 plant or **34 @ 261 / 49 @ 1215 MHz** for 204/258 plant, with linear MHz interpolation only inside the respective domain. It requires a matching node split/hardware band, replaces launch design inputs and disables extrapolation/test-point addback. It does not overwrite Station measurements, amplifier targets or hardware/spectrum limits. Existing saved jobs retain their legacy anchors until an explicit apply action. These are intended node-output company targets; absolute comparison and acceptance remain unavailable while bandwidth, power convention, plane agreement, impedance and field tolerance are unknown. AOI values remain user-transcribed from Spencer’s v15 reference; the original file is unverified. **38 dBmV · basis unconfirmed · company span 11–42 MHz** remains separate from injection and receiver targets. See the Functions guide for marker and source/config details.

**GainMaker cable EQ references:** Tools → Catalog and Tools → References include all 68 nominal choices across four separate families: forward cable 1 GHz / 1002 MHz, forward cable 1.2 GHz / 1218 MHz, standard return 42 MHz, and standard return 204 MHz. References shows exact part identifiers, nominal versus actual typical insertion loss, source/revision/page/conditions, and known/estimated/unknown status. Choose two frequencies to compare flat-input output tilt, or an optional new part to calculate EQ-only output changes as old loss minus new loss. These transient controls do not install parts or change saved work.

Published points come from ATX **ANW1513 Rev.02/2021** pp.2/4/5, with Cisco **OL-31156-01** p.98 for standard 42 MHz intermediate points and Scientific Atlanta **716336 Rev D** for legacy references. The existing 1 GHz forward solver keeps its exact model-specific input-EQ/input-pad procedure, old labels, 1000/1002 MHz provenance and gap policy. No installed 1.2 GHz module procedure is added: Cisco's 1.2 GHz LE has both input and output EQs. Standard 204 MHz has known losses only at 5 and 204 MHz; 11 MHz stays unknown while the 204 MHz endpoint remains visible. Standard 42 order 6 is nominal 6.1 at 42 MHz, but actual 5–42 MHz tilt is 4.0 dB; its 11 MHz loss is an explicitly labelled 3.96 dB linear estimate (display 4.0). The application allows linear MHz estimates only between adjacent points with frequency ratio ≤1.5; it does not bridge 5–10 MHz or the 1 GHz 86–550 MHz gap. Zero jumpers have dash losses, never assumed zero curves. Return thermal and forward linear/inverse/interstage/870 MHz parts are separate and excluded. Match the installed manufacturer/module, split, direction and physical slot; AOI electronic controls remain separate. Station displays installed 1 GHz EQ losses per pilot independently; Meter setup links the same reference without choosing return parts or injection/receiver settings.

Choose **Tools → References → Legacy local non-high-split targets → Local non-high-split: 31 @ 54 / 43 @ 860 · TX 38** only for a selected non-high-split design profile whose downstream passband actually includes **54 and 860 MHz**. After confirmation it updates that profile’s forward design frequencies/levels and the separate 42 MHz TX reference to 38 dBmV. Measured Route Setup frequencies/readings, existing forward/return records, tolerances, receiver targets, injection settings, hardware capability and available spectrum remain unchanged. Profile criteria remain unapproved. A return ceiling of **204 MHz or above**, or a downstream band that excludes 54 MHz, blocks applying this preset. A lower return split alone does not establish that 54 MHz is usable.

Under **Route & sweep → Meter setup → 42 / 54 MHz**, **Operator return TX reference (dBmV)** records the separate **38 dBmV** reference. Fill **Return TX frequencies / service plan** from the verified operator plan; this text is deliberately not inferred from the level or split. It does not set desired network-plane injection, raw generator output, received/CMTS level or relative-return targets. The 42 MHz Return Sweepless Sweep workflow gains no generator calculation from this reference. Confirm the actual measurement plane and channel-power convention before applying any local value.

The complete GS7K/GainMaker HGD training job uses the local **54 / 860 MHz, 31 / 43 dBmV** design and separate **38 dBmV return TX** reference. The separate Vecima/AOI six-active job keeps its synthetic **261 / 993 MHz, 34 / 46 dBmV** setup; the lower-split preset cannot overwrite that high-split profile.

### Convert local targets to available carrier frequencies

The base local design remains **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**. If the usable carriers are, for example, **57–753 MHz** or **63–550 MHz**, calculate the target at each confirmed setup frequency from those original anchors. The available endpoints do not become new 31/43 dBmV anchors. A spectrum edge is not automatically a channel center; confirm the intended carrier, channel-power convention and measurement plane.

Open **Tools → References → Setup targets at available carriers**. Enter **Available low carrier (MHz)** and **Available high carrier (MHz)**, then select **Target curve → Square-root frequency · cable law** or **Linear MHz** as required by the local procedure. Inputs start blank; **Fill example 57 / 753 MHz** and **Fill example 63 / 550 MHz** fill only that calculator draft. Read the resulting calculated targets. Square-root frequency is the initial estimate. Selecting either does not prove that its tilt shape is operator approved or matches the installed node/EQ response. Range examples fill the calculator draft only; they do not change the base profile, measured Route Setup or existing records.

The original anchors span **12 dB**. The estimated rise over a shorter available range is different:

| Confirmed setup-frequency example | Square-root estimate: low / high (dBmV) | Linear-MHz estimate: low / high (dBmV) |
| --- | ---: | ---: |
| 57 / 753 MHz | **31.11 / 41.97** | 31.04 / 41.41 |
| 63 / 550 MHz | **31.32 / 39.79** | 31.13 / 38.38 |

The square-root rises are **10.86 dB** over 57–753 MHz and **8.47 dB** over 63–550 MHz. These rounded values were independently evaluated for the stated formulas in Wolfram; the source record is `night-sweep/research/alpha17-setup-frequency-wolfram.json`. This checks arithmetic, not an installed equalizer or approved operator curve.

The converter requires **54 ≤ low < high ≤ 860 MHz** and a compatible recorded non-high-split profile with hardware covering both base anchors. It does not extrapolate. It rejects an entered high carrier above a known available-spectrum upper limit; a blank live limit remains unverified and does not establish carrier presence.

Keep calculated estimates separate from actual meter readings. For the 57/753 MHz square-root example, output-plane targets are 31.11/41.97 dBmV; if exactly 20 dB remains uncompensated at the test point, corresponding raw readings would be **11.11/21.97 dBmV**. If the meter already compensates the coupling, do not subtract/add it again. At a test point, use only remaining uncompensated coupling once when comparing the carrier-specific target and reading. Record actual setup frequencies and the curve/approved procedure you followed before physical adjustment.

The conversion draft is retained in the job and full project backup. **Closeout → Run sheet** and its HTML/text/CSV exports include the entered carrier frequencies, calculated levels, selected curve and original base anchors, clearly labeled as estimates rather than acceptance. Equipment setup’s **Setup frequencies & job levels** card presents these calculated targets separately from the base profile; it never silently writes them into measured launch or records.

Changing the carrier-conversion draft does not choose an AGC pilot. If actual live spectrum ends at **550 MHz**, the **711 MHz** practice pilot is outside that spectrum; identify an approved compatible live pilot from the exact detector/module procedure. No replacement pilot is guessed.

The focused OEM/DSIM and GS7K guides include an available-carrier/target-conversion step. Their supplied base design values remain unchanged. The complete GS7K/GainMaker HGD example includes the same lower-split design/available-carrier context. The separate Vecima/AOI six-active example retains its own 261/993 MHz anchors and does not inherit the lower-split conversion.

## Power Load and What-if

The power circuit is entered separately from the RF route. RF direction, power direction, power-passing ports, and supply boundaries are not always the same.

### Build the load plan

1. Open **Route & sweep → Load & what-if**. Replace example supply voltage and current rating with actual operating voltage and nameplate rating.
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

Under **Route & sweep → Load & what-if**, choose the feed point, added cable, length, constant current load, and minimum equipment voltage. The app tests the addition on a copy of the current power plan and shows predicted end voltage/headroom. Choose **Keep in power circuit** only when you want the trial to become a real planning row.

RF cable temperature and power cable temperature are separate inputs. Built-in loop resistance uses the entered power temperature and coefficient; custom resistance is already at actual temperature. The scalar RMS model does not simulate the complete quasi-square-wave waveform or verify every passive's current rating. Check actual power-passing arrangements and equipment undervoltage settings.

## Job Details and named jobs

Use **Route & sweep → Details** for job identity, locally saved named jobs, node equipment, and work-order notes.

Name the job so another technician can recognize it. Record the ticket, location, symptom, start/end times, weather, parts, and resolution as useful. Work-order, node, and lead fields are linked to their matching record metadata; notes remain separate from numerical acceptance.

Named-job controls:

| Control | Effect |
| --- | --- |
| New blank job | Starts a separate working job after the app's change-of-job prompt |
| Save now | Adds or updates the current local job snapshot |
| Open | Switches to a saved job |
| Duplicate | Makes a separate named copy |
| Delete | Removes a named entry; export anything you need first |

Normal changes autosave on this device. A named job is convenient storage, not a backup outside the app. Storage errors must be addressed by exporting accessible work; do not assume a successful screen edit means an external file was saved.

On iPhone, use the same Home Screen app for ongoing work. Safari and the Home Screen app may keep different local job lists. An empty list in one does not establish that a job was deleted from the other. Check the original app/browser and your exported files before changing storage settings.

### Node equipment

Choose the installed Vecima EN9000 GAP or GS7000/GS7K 1 GHz/1.2 GHz model and matching band/configuration. Record asset, port/leg, module, operating upper frequency, and notes.

Copying hardware limits into a selected profile updates its hardware fields and marks criteria unapproved. It does not establish that the full band is active or measured. Actual operating spectrum and acceptance criteria still require their own entries.

## ONX files

Open **Route & sweep → ONX files**. To add evidence to your current job, choose **Sweep**, **Ingress**, or **OneCheck**, then choose **Before**, **After**, or **Reference**. Enter the asset or station and any relevant notes. Tap **Add meter files or photos**. The original 1.7 Alpha APK labels this button **Upload meter files**.

Original file bytes are stored offline and checked with a checksum. Supported explicit CSV columns can generate a trace/table preview. Native JSON, ZIP, XML, PDF, HTML, images, and unknown meter formats remain attachments when their measurement schema is not decoded.

A photograph of a meter screen is useful job evidence. Attaching it does not read its numbers into the calculators or decode the ONX measurement format. Enter measured values deliberately and keep their frequency, units, and test-point correction with the record. On iPhone, original attachments stay in that app/browser's local storage; they are not uploaded to the hosting website as a job backup.

### Open the ONX-630 downstream reference job

If you received a separate NightSweep reference job, save your current work with **Files → Back up project** before opening it.

1. Choose **Route & sweep → ONX files → Open project backup**, then select the supplied project JSON. In the original 1.7 Alpha APK, use **Files → Open project**.
2. In **Route & sweep → ONX files**, expand the SC-QAM CSV and tap **View decoded measurements**. Each dot is one supplied channel reading. Spaces between dots have no supplied readings.
3. Open the OFDM photo entries to review the PLC and block metrics. Tap **Save original** to retrieve an attached image. Use **Route & sweep → Details → Save now** to keep the reference job on that device.

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

**Route & sweep → Checklists** keeps leakage/ingress checks and preventive-maintenance/end-of-line notes together. Record work actually completed, including connectors, shielding, terminations, affected drops, repairs, retests, supply condition, bonding, end-of-line points, and amplifier unity-gain observations.

A checked item means the technician marked the work complete. It does not automatically mark RF acceptance as passed.

The voltage reference converts **dBµV ↔ dBmV** at the same reference plane:

- dBmV = dBµV − 60.
- dBµV = dBmV + 60.

For example, 83.1 dBµV is 23.1 dBmV. This is not a field-strength µV/m conversion and adds no TP correction.

## Records and supervisor review

**Closeout → Acceptance** contains the more detailed measurement and review workflow. Use it when the job requires a formal log rather than a quick prediction.

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

**Closeout → Run sheet** combines current job identity and notes with predicted route values, meter comparisons, as-built notes, and recorded field work. Choose the reporting frequency that matches your task. Predictions and measurements retain their different labels.

Use its print, share, and CSV controls for the field summary. The RF, frequency, power, and record tools also have their relevant CSV exports. Printing depends on the phone/browser print service; choose a PDF destination when available. Android and iPhone show different download, share, and print interfaces, so complete the phone's final save action.

### Which save should you use?

| Action | Best use | Includes everything needed to restore the job? |
| --- | --- | --- |
| Local autosave | Continue work in the same app on the same device | Not an external backup |
| Save now (Route & sweep → Details) | Switch between jobs on this device | Not an external backup |
| Files → Back up project | Move or restore the full working job, including original evidence | Yes, within the export limits |
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
| Tapping the ZIP does not install the app | Extract it, open the extracted folder, then tap NightSweep-1.8-preview.apk |
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

This supporting report remains historical. The historical **1.7 numerical review** called Wolfram's evaluator for 15 named synthetic reference results and compared the current application in 18 numerical/rejection checks, all passing within the recorded tolerance. Cases include launch/cable interpolation, temperature and test-point correction, gain, TDR, branched power, unit conversion, injection and relative-return arithmetic. The developer record is `night-sweep/research/alpha17-numerical-audit.md`, with returned results and comparison files alongside it.

Neither audit certifies manufacturer cells, actual measurement planes, firmware, installed plant or field acceptance. The fresh arithmetic review is separate from final release QA and physical Android/iPhone testing. Read its assumptions and the in-app status messages alongside any calculated value.

Context7's MDN platform references were also reviewed for clipboard activation/fallback, storage quotas and eviction. If **Copy** is unavailable, select the literal code and copy manually; finish project exports and keep them outside browser storage. Documentation review does not prove physical Safari or Android WebView behavior.

## Technical references

Equipment entries include source links and configuration notes. The gain references distinguish applicable manufacturer documents from qualified historical references. Read the conditions for the exact model and use measured or verified frequency-specific values for your installed configuration.

Operator design criteria and approved field procedures must be supplied for the actual job. Example frequencies, levels, tolerances, power settings, and checklists in NightSweep are not universal operator standards.

**Release:** NightSweep 1.8 Alpha build 2 · Android app label: NightSweep 1.8 Preview build 2 · Android web: Chrome/browser or Home Screen · iPhone: Safari/Home Screen web app.


## Historical equipment expansion — build 17

The earlier build 17 expansion added **33 RF equipment selections** (18 active configurations and 15 ATX SGP passives), **four cable selections**, and two measured-load power selections. The equipment browser now includes nodes and power models as well as route equipment and cable.

- **GainMaker:** HGBT and LGD 65/86 remain current. UBT main/auxiliary RF and three UBT power records are retired from new selection at the team’s direction; they remain readable only in legacy saved jobs. HGBT and passive unbalanced three-way splitters remain available.
- **AOI Quantum18:** HGBT and BA, plus explicit 85/105, 204/258, 396/492, 492/606 and 684/834 configurations for HGD/HGBT/LE. A model selection is not proof that those modules are installed.
- **ATX GigaXtend SGP:** standard and AC-continuity directional couplers, two-way, balanced/unbalanced three-way splitters, conditioned coupler and RF path of the power inserter. Installed conditioning plug-ins require their own loss information.
- **Cable:** legacy MC2 .440 and 1.000; CommScope Series 6 and Series 11 drop cable. These historical guide values stop at their published frequency endpoints. Drop cable has no assumed coax-power resistance. The optional RG6 drop tool still takes an entered cable table; adding catalog cable does not silently change saved drop assumptions.

**Find equipment:** Tools → Catalog → choose a category, then family/model. For launch selection use Route & sweep → Setup; the node metadata also remains in Route & sweep → Details. Power models link to Route & sweep → Load & what-if. Node optical output is a route launch, not an RF gain block inserted midspan.

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

## Equipment review and verification scope

There are **556 currently selectable records**: **514 RF selections** (23 active and 491 nonactive), **17 cables**, **22 power selections** and **3 node profiles**. Five retired UBT compatibility records bring the retained inventory to 561. Structural/provenance checks cover all entries and **1,324 curves / 14,126 rows**, including retained legacy curves. Targeted source review includes all 120 GS7000 current/watt cells and a fresh archived Scientific-Atlanta mainline comparison of 72 maximum-loss cells. This is not fresh independent transcription of every inherited cell.

The newest public **EN9000 family brief located is September 2026**. Its ERM3-conditioned RF table and separate ERM3/ERM4 documents do not establish the installed RPD's capability. The −20 ±1 dB test-point reference remains sourced to May 2024. The 180 W PSU output and 200 W thermal quantities are not typical AC consumption; the actual load must be entered. Exact commissioning documentation remains a customer-access gap.

The AOI SA original PDF returned HTTP 404 during fresh review. Equipment setup uses the labeled V02102025 historical manufacturer-authored mirror; the latest issued revision still requires manufacturer confirmation. Exact Quantum18 LE/BA I&O remains unavailable.

A printed-band endpoint defect was identified for banded passives. Nonshared published upper endpoints now remain available. Only explicitly marked Scientific-Atlanta Multimedia curves use the documented larger-adjacent-bound estimate across printed fractional gaps; arbitrary missing data stays unavailable. This estimate does not become a manufacturer measurement.

See **NightSweep_1.8_Training_Coverage.md**, **NightSweep_1.8_Equipment_Coverage.md** and **NightSweep_1.8_Release_Notes.md** in the release documentation for corrections, manual coverage and limitations. Current integrated QA, browser, APK and packaging results belong to the actual release-validation record. Earlier build 20 and 1.6 results remain historical; the historical 1.7 arithmetic review above has its own evidence. Physical Android and iPhone testing remains separately required.

## Build 2 audit and validation record

Build 2 rechecks the existing 20 screens, 37 feature choices and seven examples with regression, synthetic replay, property/reference and browser checks. It fixes same-coordinate active-boundary TDR handling without changing the established RF/power formulas. Current calculations retain the independently checked references, and Records rejects inconsistent frequency limits before evaluating acceptance. Read `research/build2/MATH_BACKTEST.md` and the final validation receipts for the exact current scope/results. Exact executed checks and artifact hashes are in the current release-validation record and `research/alpha18/`; historical results above do not imply a new APK, public deployment, physical phone or installed-plant test. See `NightSweep_1.8_Release_Notes.md` for current behavior and outstanding checks.

## Station worksheet: Route & sweep → Station records

Choose the installed launch node, launch amplifier or a route amplifier. The banner uses that equipment’s actual split: **42/54 MHz** uses forward and return Sweepless Sweep; **204/258 MHz** uses forward Sweepless Sweep and return XPERTrak. Other or unidentified splits require confirmation of their procedure. This screen records measured work separately from route predictions.

Choose **Before adjustments** or **After adjustments**. Each stage keeps its own pilots, targets, readings, installed settings and last edit time. Enter forward readings and targets at the same output port, measurement plane and channel-power convention; apply any test-point correction once before typing readings. All new station company targets and optional tolerances start blank, meaning unknown. An entered zero remains zero. The existing pad/EQ solver reports low/high level error, tilt error and sourced GainMaker input-part changes when the installed parts and pilots are covered. Quantum18 shows its electronic procedure and offers no plug-in part picks. OEM AGC, ACI DSIM and manual/thermal setup still require their separate exact equipment procedures.

The return worksheet uses **required physical injection = reference-point target + net insertion loss to that point** (SCTE 180 2025 §13.2.2.2). Include applicable test point, lead, path and EQ losses once. Actual injection is a separate reading; its delta is actual minus required. Receiver delta is the reading minus the saved reference at the same identified receiver plane and power convention. Record that plane and reference ID. Referenced dB response from Return Sweepless Sweep cannot fill absolute dBmV receiver fields. This physical budget does not program an ONX setting or add compensated losses again. Return pad/attenuation and EQ/tilt are recorded settings, without automatic return-part selection. No universal return tolerance is supplied.

On **42/54 MHz**, the reminder shows this job’s editable operator return TX entry; it starts unknown in a fresh job. A local 38 dBmV value applies only when entered and approved at its transmitter plane. On an exact **204/258 MHz Quantum18 HGD**, the separately tagged preliminary sheet’s 9 dBmV per 6.4 MHz input recommendation is shown; it is not transferred to other models or splits. Receiver reference details separately identify the SCU-1800 recommendation and configurable CMTS receive set point. Their source tags disclose each document and any unverified issued revision. None pre-fills injection or receiver targets.

Record **Balanced** and **Swept** separately with their own dates. Neither matching two pilots nor checking Balanced records a sweep. These are technician records, not automatic RF acceptance. Legacy UBT stations remain readable with disabled worksheet controls. Removed or replaced stations retain their history in JSON backups; a new station starts blank even when a route point ID is reused. Changing the launch asset, output port or installed node module also starts a blank worksheet and retains prior observations. Imported numeric text that the number fields cannot show produces no result; its original text stays in the backup. Named-job switching and project backups retain both measurement stages and the separate dates. Correcting catalog band information keeps saved observations available. Older saved worksheets with incomplete station-binding information remain visible and read-only with a notice. Confirm the actual selected model, installed split, asset, port and module before using **Confirm saved worksheet belongs to this station**; it creates a bound copy and preserves the original worksheet in the job backup.

Incomplete numeric or date edits are marked beside the field and do not replace the recorded entry. Finish the entry, or deliberately clear every part to record unknown. Leaving an incomplete field or returning to Route & sweep → Station records restores its recorded value; a completely cleared native date is committed when focus leaves the control. Viewing an imported invalid value does not erase its stored text. Balance and sweep remain separate records.

For practice, open the complete GS7K/GainMaker exercise’s **Station balance and separate sweep record** step. Synthetic 54/860 MHz pilots, targets 39/49, readings 36.4/49.6 dBmV, installed pad 6 and EQ 9 dB give an input EQ pick of 4.5 dB and pad 7 dB. A return reference-point target of 19 dBmV plus 20 dB net insertion loss gives 39 dBmV required injection; receiver −1.25 minus reference −3.5 dBmV gives +2.25 dB. Back up, restore and compare the station worksheet. The six-active Vecima/AOI exercise has a separate electronic-alignment station step. Practice values never establish real operating targets.


## Night log: Route & sweep → Night log

The **Unknown** source tag beside **Recorded entries** documents the existing **200 entries/job** application guard. General notes, Station captures and intermittent-ingress entries share that count. The manual-ingress text bounds are also labeled **Unknown**: conditions up to **2,000**, technician-observed time up to **200**, and weather up to **500 UTF-16 code units**. Their source sheets are available beside the fields and in **Tools → Limits** under **Night log application guards**. These are software storage/display bounds, not RF limits, equipment capabilities or company acceptance criteria; device storage can fill sooner.

Keep a personal running window record: ticket/change number, node/amp label, actions, ROC/dispatch updates, gas/fuel, mileage, as-built discrepancies and next-shift/open issues. Keep customer names, addresses and account numbers out. Fuel and mileage are recorded text: include the amount, reading/distance and units yourself; there are no totals or assumed reimbursement units. Window dates are optional device-local wall times with no recorded zone. **Added** is the device timestamp when you press **Add entry**, not a claim about when the work occurred. Blank times stay unknown.

Type window times as `YYYY-MM-DDTHH:mm`. Incomplete or invalid text has a named format message beside the field and never replaces its saved value. Leaving the field or returning to Night log restores the saved value and explains the restoration there. Enter a complete valid time to replace it, or clear the entire field deliberately to record unknown. Editing saved log content clears an existing handoff preview; generate it again before copying. Exports always use the current saved log.

**Entry type** starts at **General update / Station capture**. Leave **Saved Station worksheet** at **General update / no Station snapshot** for a note without readings. **Add entry** needs a meaningful note or an explicitly chosen saved Station worksheet; blank or whitespace-only drafts and an entry type alone use no slot. To capture measurements, choose a saved worksheet from **Route & sweep → Station records** and add the entry. Both real Before and After stages, raw inputs, recorded planes, frozen results and separate balance/sweep records are copied once. Entry notes remain editable. Later Station changes never refresh a capture; add another entry to capture again. Removed/replaced equipment is labeled **Historical snapshot — station changed or no longer installed**. Read-only and unconfirmed legacy bindings remain historical; their old dates never confirm current equipment work. No new RF target, acceptance limit, test-point correction or RF calculation is added.

**Remove entry** frees its slot. **Undo last removal** restores the latest removed entry, including its original ID, Added time, captured stages and position; unadded draft notes stay in the editor. Undo is temporary: another removal replaces it, and switching jobs or reloading ends it. If a new entry fills the log back to 200, Undo refuses to restore another entry. Removing something else replaces that pending Undo; it is not a way to retry the earlier restoration. Back up the job before removing history. For a separate record, back up and use a new blank job; no new-window/reset control is added.

Choose **Intermittent ingress** to record manual conditions, **Technician-observed time** and weather. Include a date, time and zone when known, or an honest approximation such as “about 01:30; date and zone unknown.” Use **Actions / attempted work** for what was tried. The observed-time text is not parsed or verified and is separate from the device **Added** timestamp. Type weather by hand; no forecast or automatic collection is used. Blank manual fields remain **Unknown**. A Station snapshot is optional, and the same frozen-capture rules apply.

**Generate handoff** prepares a selectable plain-text preview above the entry editors. **Export TXT** and **Export CSV** use the ordinary offline save/share path. A prepared file still needs the save/share dialog completed and the external file checked. CSV has one rectangular header and one Before/After row per captured entry (one blank-stage row for a note without a Station snapshot), with raw inputs, planes, context, reason/status columns and separate balance/sweep dates. General-only TXT/CSV keep their existing format. When any intermittent-ingress entry is present, CSV adds the same eight entry-type/manual-observation/status columns to every row; manual text and Unknown status remain distinct. TXT names the manual conditions, observed time, attempted work and weather. Levels and derived values show two decimals; pilot MHz show up to three; positive dB deltas have a plus sign, absolute dBmV levels do not. Rounding does not change captured results or comparison decisions. Formula-like text gets the existing spreadsheet-safe apostrophe prefix in CSV. **Files → Back up project** remains the portable full-fidelity record, including exact text, unrounded results and original attachments; handoff exports contain no attachments or legacy address/lead fields.

For practice, use the existing six-active Vecima/AOI **Five-station night handoff** step. Check that an empty **Add entry** uses no slot, manually enter and capture the invented A1–A5 Station readings, then Remove and Undo one capture and compare its two stages. Add a synthetic intermittent-ingress observation with manually noted conditions, approximate observed time and attempted work; leave weather blank to check **Unknown**, then enter synthetic weather by hand. Reopen TXT/CSV and a project JSON backup to compare the notes and frozen stages. The defined short five-station fixture fits the 390×844 preview; arbitrary long notes or 200 entries can scroll normally and are never truncated. All exercise exports retain the synthetic marker. Personal notes and recorded work do not establish RF acceptance.


## Sweep due: Route & sweep → Sweep due

Personal sweep reminders read installed launch nodes/actives and route amplifiers from this device's named jobs and current working job. Each card shows separate last recorded sweep and balance dates, validity, completed calendar-month age and the chosen sweep due date. Missing worksheets remain visible as unknown. Current work overlays only a uniquely matching saved job ID; copies keep separate job histories even when Station IDs match. Repeated or missing job IDs remain separate with a diagnostic. Unreadable saved jobs show a warning while readable current work remains available.

**Sweep reminder interval (whole calendar months)** starts unknown. Enter your approved interval; it is a personal reminder setting. **Saved with the current working job; used for this view of all jobs.** Loading another job can change it. Raw invalid entries stay visible and give no reminder color or due date. Empty is unknown; enter digits only from 1 to 1200, an app input guard.

Green means **Before reminder window**, yellow **Reminder window**, and red **Due / overdue**. Yellow begins at `ceil(2 × interval / 3)` calendar months, an **Unknown / unverified app reminder policy** implementing the build-list example. An older plan mentions 18 months; its attribution to Hranac remains unverified. Confirm your company's interval. Colors never establish RF acceptance. Balance does not reset sweep age or have an invented maintenance cadence.

Anniversaries add months to the original civil date and clamp its day to the target month's last day. Age counts completed anniversaries. Dates must be exact `YYYY-MM-DD`, Gregorian years 0001–9999; future/invalid dates and derived dates beyond year 9999 remain unavailable. A recorded checkbox without a date, an unchecked record with a date, and an unknown date are distinct. Historical binding-unconfirmed and read-only UBT worksheets show recorded dates, completed ages, validity and done facts with their historical reason; they do not use current-service reminder colors or wording. SYNTHETIC TRAINING and SAMPLE badges stay visible, with practice counts separate from work reminders.

The interval belongs to the open job; the empty state says so explicitly. If autosave fails, **Not saved** appears directly below its field and stays visible for that same job/interval until a later edit succeeds. Export a project backup before closing. Opening another job clears the old field feedback.

Use **Refresh list** after changing Station dates or named jobs; entering/resuming the visible tab also reads the device date. The screen displays **As of YYYY-MM-DD (device date)**. It never edits work dates or opens a saved job. Complete counts and page controls accompany lists longer than 25 entries. Visit **Route & sweep → Station records** to record actual work and **Route & sweep → Details** to manage jobs. Export a project backup if autosave fails.

The six-active practice now has **16 steps**; its **Personal sweep reminders** step asks you to enter **18** for a synthetic demonstration and then clear it to restore unknown. The current source has **34 task screens** and **52 feature choices**. The focused QA fixture creates three named synthetic jobs dated 0, 12 and 19 completed calendar months before an explicit 2026-11-11 reference date, producing green, yellow and red at the entered 18-month setting. This fixed QA example is not a live plant schedule.
