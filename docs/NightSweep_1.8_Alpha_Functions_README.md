# NightSweep 1.8 Alpha build 2 — All Functions Reference

**Technician README · Updated November 11, 2026**

This reference explains the working functions in NightSweep 1.8 Alpha build 2: where to find them, what to enter, how to interpret the result, and which bundled example lets you practice. It covers all 20 task screens and the 37 entries in the Practice library's feature index. The 2.0 Alpha build 3 additions below bring that to 24 screens and 41 entries.

**2.0 Alpha build 3 (Carpe Noctum, in development)** adds four Test screens, [Field calculators](#field-calculators), [Limits and sources](#limits-and-sources), the [DOCSIS health card](#docsis-health-card) and [Leakage](#leakage). The custom-curves exercise gains four guide steps for them, and the feature index gains entries 38 to 41.

For installation, use the separate [Android and iOS installation guide](NightSweep_1.8_Alpha_Android_iOS_Installation.md). This reference applies to the shared Android/browser application. Browser-only offline and update controls appear on Home; Android's native save/share/print dialogs appear when using the APK.

## Guide contents

1. [Working rules and navigation](#working-rules-and-navigation)
2. [Header and Home controls](#header-and-home-controls)
3. [Practice library and example selection](#practice-library-and-example-selection)
4. [Job details and named jobs](#job-details-and-named-jobs)
5. [RF setup and launch source](#rf-setup-and-launch-source)
6. [Cable route, branches and point tools](#cable-route-branches-and-point-tools)
7. [Amplifier gain and test-point helper](#amplifier-gain-and-test-point-helper)
8. [Installed equipment, manuals and control paths](#installed-equipment-manuals-and-control-paths)
9. [Equipment catalog](#equipment-catalog)
10. [TDR distance locator](#tdr-distance-locator)
11. [Forward and return sweep setup](#forward-and-return-sweep-setup)
12. [Predicted sweep and output table](#predicted-sweep-and-output-table)
13. [Single-path frequency checker](#single-path-frequency-checker)
14. [Meter readings and prediction error](#meter-readings-and-prediction-error)
15. [Field references and target conversions](#field-references-and-target-conversions)
16. [Field calculators](#field-calculators)
17. [Limits and sources](#limits-and-sources)
18. [DOCSIS health card](#docsis-health-card)
19. [Leakage](#leakage)
20. [Power-supply load](#power-supply-load)
21. [Power what-if](#power-what-if)
22. [ONX files, original evidence and comparisons](#onx-files-original-evidence-and-comparisons)
23. [Field checklists and unit conversion](#field-checklists-and-unit-conversion)
24. [Project records and closeout](#project-records-and-closeout)
25. [Run sheet, exports and full backups](#run-sheet-exports-and-full-backups)
26. [Offline use, updates and Help](#offline-use-updates-and-help)
27. [Checked example answers](#checked-example-answers)
28. [41-feature coverage index](#41-feature-coverage-index)
29. [Known limits and unresolved information](#known-limits-and-unresolved-information)

## Working rules and navigation

Start a real job with **Job → Details → + New blank job**. Identify the actual source output, enter launch readings, build the route, then use the calculations, setup guides and records you need. A single-span calculation does not require completion of the advanced acceptance forms.

| Main work area | Task screens | Purpose |
| --- | --- | --- |
| Home | Home | Current job, task shortcuts, practice, backup and browser offline status |
| Route | Setup; Cable route; Amp gain; Amp / node setup; Catalog | Starting signal, RF topology, active gain and exact-model references |
| Test | Meter setup; TDR; Predicted levels; Frequency; Readings; References; Calculators; Limits; DOCSIS health; Leakage | Guided test records, predicted response, distance and measurement comparisons, quick calculations and the source of every limit |
| Power | Load; What-if | Independently entered power circuit and an added-load trial |
| Job | Details; ONX files; Checklists; Acceptance; Run sheet | Local jobs, original evidence, work notes, acceptance records and reports |
| Header / Home | Help & methods | Task help, methods, limits and build self-check |

The small task tabs choose a function within the main area. The point selector and **Previous/Next** choose the route location; they do not change its feed parent. **More at this point** exposes tap faces, drop, map notes and arithmetic.

Keep these distinctions while using every tool:

- **Prediction** is calculated from entered data. A meter reading is a separate entry; neither automatically becomes acceptance.
- **Manufacturer capability**, local design target, installed configuration and available spectrum are separate fields.
- A dash or blank result means unavailable, missing, invalid or outside supported data. It is not zero. A deliberately entered zero is different.
- Use the same frequency, measurement plane and signal-power convention when comparing readings. Apply only test-point correction the meter has not already applied.
- **Vecima nodes / AOI actives:** local 204/258 MHz workflow, forward Sweepless Sweep and XPERTrak return sweep. **GS7K, GainMaker and the other fleet families:** local 42/54 MHz workflow, forward and Return Sweepless Sweep.
- Non-high-split design anchors are **31 dBmV at 54 MHz / 43 dBmV at 860 MHz**. The separate **38 dBmV return TX reference** does not specify a receiver target, injection setting, channel or measurement plane.

## Header and Home controls

**Where:** the header and Home. **Practice:** Complete field workflow; Custom curves for Help and methods.

| Function | Enter or do | Result and limit |
| --- | --- | --- |
| Main and task tabs | Choose a work area, then its task | Opens the relevant controls while preserving the current job |
| Files → Back up project | Export the working project and finish the device's save action | Portable JSON with supported job data and original evidence; verify the file outside the app |
| Files → Open project | Choose a NightSweep project JSON | Validates the incoming project before loading; export important current work before replacement |
| Files → Export RF levels | Export the current route table | Predictions and context in CSV; unavailable results remain blank |
| Files → Print report | Open the native or browser print dialog | Printing/PDF depends on the device and print service; use Run sheet for a focused field summary |
| Help & methods | Open help from the header or Home | Task guidance, calculation definitions and limits |
| Palette button (header: Switch to Sun palette or Switch to Night palette) | Select the display palette | Changes presentation, without changing inputs or calculations |
| Working-job card | Read the job name, asset and sample/training warning | Helps prevent entering real readings into a sample job |
| Task shortcuts | Choose route, TDR, gain, readings, power, sweep setup or run sheet | Opens that live task using the current job |
| Home statistics | Review farthest route distance and active count | Summarizes the entered RF topology; an active count alone does not prove a serial cascade |
| New-user quick start | Expand the short workflow | Opens existing task controls; it does not complete them automatically |
| Home backup / project opener | Use the Save/Open project shortcuts | Same full-project workflow as Files; not automatic cloud synchronization |
| Status and warning messages | Read the nearby message after an action fails | Identifies missing inputs, storage/file errors or a blocked operation; preserve backups before repairing storage |

Browser Home also provides **Install app**, **Check for updates**, **Install update**, **Reload app**, **Retry offline setup** and **Protect local storage** when supported. Their behavior is explained under [Offline use, updates and Help](#offline-use-updates-and-help).

## Practice library and example selection

**Where:** Home → Practice library. Choose an exercise, or choose a feature to load its seeded example and open the matching guided step. These examples are bundled; no manufacturer website is needed to load them.

| Exercise name | What is loaded | Guide / supplied evidence |
| --- | --- | --- |
| **Complete field workflow** | GS7K source, two GainMaker GaN HGD actives, Scientific Atlanta / GigaXtend / Technetix passives, branched 42/54 route, power, readings and records | 21 steps; five synthetic CSV originals and one original-only SVG diagram |
| **Six active devices in series** | Vecima EN9000 source and six serial AOI actives on 204/258 | 13 steps; no supplied meter captures |
| **Custom curves and reverse TDR** | Manual launch table, custom cable/passive tables, exact-frequency entries, reverse TDR, field calculators and limit sources | 12 steps; no supplied meter captures |
| **GainMaker OEM AGC** | Separate 42/54 conventional OEM detector/pilot path | 8 steps; no supplied meter captures |
| **GainMaker / DSIM** | Separate 42/54 fitted DSIM identification, historical code lookup and incomplete verification | 9 steps; no supplied meter captures |
| **GainMaker manual / thermal** | Separate 42/54 manual/thermal installed-control path | 7 steps; no supplied meter captures |
| **GS7K conventional node** | Standard GS7000 1.2 GHz / 42/54 setup starter; actual launch/readings/correction unverified | 10 steps; no RF route or supplied meter captures |

Opening or resetting training preserves the working job locally before switching. A full or unreadable named-job list, an evidence operation in progress, or a preservation failure stops the switch. Read the message and keep the existing job; do not clear storage to force it. A local retained copy is not an external backup.

Use **Open step** to reveal the relevant controls, try them, then mark **Reviewed**. **Practice guide** in the training banner returns to the guide. Progress is saved with that practice copy; it does not mark field inspections or acceptance complete. Reset preserves the edited copy before restoring the exercise baseline.

Older practice copies remain readable. If their equipment no longer matches the current complete exercise, the app hides mismatched guidance and offers an explicit reset. Renaming, editing, saving or exporting a practice job does not remove its synthetic identity.

The complete workflow uses GS7K/GainMaker GaN, not the AOI six-active path. Its GS7K hardware capability is 1218 MHz, but the entered operating/planning upper is **1000 MHz** and live spectrum **860 MHz**. The selected GaN active covers 54–1002 MHz and the Scientific Atlanta route passive stops at 1000 MHz. Do not infer end-to-end 1218 MHz operation from the source model.

## Job details and named jobs

**Where:** Job → Details. **Practice:** Complete → Job details; any exercise's backup step.

| Function | Inputs and use | Output and limit |
| --- | --- | --- |
| Job identity | Name, node/asset, date and lead technician | Current-job context used in reports and exports |
| Work-order fields | Ticket, address/location note, symptom, start/end times, weather note, resolution and parts used | Stored with the job; a time-order warning preserves the entered text and does not change calculations |
| Linked metadata | Edit work-order number, node or lead in Details or Records | Keeps those shared identity fields consistent; other record fields remain their own entries |
| Node details | Identify model, installed band, asset, RF port/leg, modules, operating upper and notes | Describes source identity; model selection does not supply measured launch levels |
| + New blank job | Start a clean field job after protecting current work | Removes sample inputs from the new working job; check its name before field entry |
| Save now | Save the desired working version to the device's job library | Local named copy; save/export important revisions deliberately |
| Open | Select a stored job | Restores that job's data and attachment references; storage failure blocks unsafe switching |
| Duplicate | Make a separately named copy | Uses the latest working state when duplicating the active named job; updated original and new copy are written together. A failed write leaves the library unchanged; training stays synthetic |
| Delete | Remove the intended named entry after exporting anything needed | Not a recovery workflow; check the job identity before confirming |

Autosave and named jobs use this app/browser's storage. APK, Chrome, another browser/profile, another phone and a Home Screen web app may use different stores. No account or automatic job synchronization is provided. Use one NightSweep window at a time and transfer jobs with verified full-project exports.

## RF setup and launch source

**Where:** Route → Setup. **Practice:** Complete → Launch; GS7K conventional node → Identity; Custom curves → Launch.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Launch-source choice | Select **Node output**, **Amplifier / LE output**, or **Manual / other output** | Identifies the physical starting output; it does not add an artificial gain block or fill levels from a rating |
| Node / active identity and output | Match exact model, installed split/module and selected RF port; use the job node ID shortcut where appropriate | Makes the source/manual context explicit; source changes preserve readings for review rather than making them valid for the new connection |
| Source setup & manual | Open the selected equipment's reference | Requires the matching installed variant and revision; external originals need internet |
| Low/high launch markers | Enter two frequencies and corresponding levels at the same source plane | Defines the two-point source curve; ordered, valid in-band markers are required |
| Launch test point | Mark raw TP readings and enter only remaining coupling | Adds the stated correction once; use zero/off when the meter already supplies mainline-equivalent levels |
| Launch curve | Choose square-root frequency, linear MHz or **My level table** | Uses the selected interpolation model; it is not a measured EQ response |
| My level table | Enter one `MHz, dBmV` pair per line | Uses actual entered source points; stops outside the first/last supported point |
| Extend two-point launch slope | Enable only for an intentional estimate outside the two anchors | Extends the two-point launch estimate; it does not extend cable/passive table coverage or establish live carriers |
| Available spectrum ends | Enter the known live-spectrum upper limit | Distinguishes live from planning predictions; hardware capability is separate |
| Passive loss basis | Choose **Nominal / typical** or **Maximum** | Nominal can use a labelled maximum fallback when no nominal curve exists; read the stated basis |
| Cable temperature | Enter RF cable temperature in °F | Adjusts supported built-in attenuation references; custom cable values are already at actual temperature |
| Next: cable route | Continue to the route editor | Starts at the chosen source output without inventing another station |

In Complete, **11/23 dBmV +20 dB** at **54/860 MHz** produces **31/43 dBmV** launch. This is synthetic arithmetic, not proof those physical carriers or readings are present. The six-active AOI example instead uses 261/993 MHz and 34/46 dBmV.

## Cable route, branches and point tools

**Where:** Route → Cable route. **Practice:** Complete → Route / Drop; Custom curves → Custom / Arithmetic; Six actives → Route.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Add, select and remove points | Add a cable span ending at equipment; select it with the point selector or Previous/Next | One point includes its incoming cable. Review child feeds after changing/removing a point; maximum 200 route points |
| + Append after last tap | Use when the final route entry is a tap with a through output and a lower published face available | Appends through that tap, copying cable, incoming length, slack and custom cable data while choosing the next lower published face. It does not choose an arbitrary earlier branch or work after an ineligible final point |
| Point name and incoming feed | Name the location and choose the actual parent **output** | Builds the topology. A branch feeds from its selected splitter/tap port, not merely the same housing |
| Cable, length and slack | Select cable, enter mapped feet and additional slack | Adds both to attenuation/distance; do not add prefilled slack again |
| Apply this length to following spans | Confirm copying the selected point's incoming length | Applies to later entries in the route list, including later branches; not only the chosen electrical path. Review affected points and their separate slack |
| Equipment selection | Choose the exact family, type, part/face and terminal configuration | Uses the selected port curves; active, passive, cable-only and custom points have different behavior |
| Parent outputs and branch ports | Choose through, low-loss, high-loss, tap or other actual output | Preserves unequal splitter paths. Per-F-port tap output is not the through level |
| Cable-only point | Select no ending passive | Retains the cable span without adding invented equipment loss |
| Custom cable | Enter `MHz, dB per 100 ft` rows | Uses entered attenuation at actual temperature; no extra built-in temperature factor or out-of-range extrapolation |
| Custom passive | Enter `MHz, through dB, tap/branch dB` rows | Keeps the two output losses separate; missing data remains unavailable |
| Published faces | Compare same-family / same-port-count tap faces at the chosen frequency; choose a face to swap the part | Changes the catalog part and prediction; read through and tap loss separately |
| RG-6 drop off a tap port | Plan a drop from a selected tap output; enter feet, a custom cable table, then no splitter, a supported splitter or explicit custom loss | Calculates drop-end outputs independently of the mainline route; this is not a power-passing model |
| Remove drop | Remove the optional drop plan | Does not remove the mainline tap |
| As-built / map variance | Record a location-specific note | Saved with the point and shown in relevant reports; it is not a calculated cable measurement |
| Show the arithmetic | Expand the selected point's detailed calculation | Shows source/input, cable rate/temperature/feet, equipment loss or gain and output; unavailable steps stay visible as unavailable |
| Route cascade / distance summary | Follow the selected feed path and branch totals; scroll within the compact cascade in either direction, or focus its controls by keyboard | Shows separate path coordinates; all points remain reachable without making the phone page excessively tall. Branch footage is not added to the main endpoint |
| 3-tap route example | Load the small RF-route sample after protecting work | A separate, simpler example; it is not the complete training job or the six-active run |

Complete uses Scientific Atlanta **SAT MM 4-23**, GigaXtend **XSC-2-959** and **GTSG-TAP-4-20-STD**, and Technetix **OTTZ-4-17**. Its drop uses a **75 ft synthetic RG-6 table plus explicit custom 4 dB loss**, not an asserted premises-splitter model. Its main endpoint is 2380 ft from source; the branch cable-only endpoint is 2220 ft.

## Amplifier gain and test-point helper

**Where:** Route → Amp gain. **Practice:** Complete → Gain; Six actives → Gain / Gain table.

| Function | Inputs and use | Output and limit |
| --- | --- | --- |
| Active-point selector | Choose an active already in the RF route | Edits that station; source identity alone does not create a route amplifier |
| Two measured/configured gain points | Enter the two frequencies and available operating gain at each | Calculates frequency-specific gain; match the installed configuration and measurement planes |
| My frequency/gain table | Enter `MHz, operating gain dB` rows | Uses the entered response within its supported domain |
| Additional selected-output loss | Enter only loss after the gain's measured output plane | Subtracts that extra loss; leave zero when the splitter/pad is already included in the measured net gain |
| Desired low/high output | Enter the station's required targets, or review defaults from corrected launch | Determines gain needed after the preceding cable/passives; a target is not measured output |
| Desired gain reserve | Enter the requested reserve in dB | Separates meeting a target from retaining adequate margin |
| Optional installed output limits | Enter verified limits for model, channel loading, tilt and output path | Checks requested/predicted output against those entries; blank means capability unchecked |
| Gain budget | Review required gain, entered gain, low/high margins and reserve status | Can show missing, invalid, shortage or marginal reserve. One good marker does not compensate for another bad marker |
| Manufacturer gain reference | Read the source, frequency/configuration and qualification | Screening reference only; a scalar rating does not become a flat gain curve or prove maximum available gain |
| Calculate gain from test-point readings | Enter input/output readings at the same frequency plus their separate remaining corrections | Corrected output minus corrected input; no gain is inferred from an output-only photo |
| Use as low / high gain point | Apply the helper result to the chosen gain marker | Updates the calculation input; does not align physical hardware |

Complete's helper uses **7.1/16.1 dBmV +20 dB each** at 54 MHz: corrected 27.1/36.1 dBmV gives **9 dB gain**. A1's entered anchors are 9/18 dB at 54/860 MHz; A2's table is 54 MHz/8 dB, 550 MHz/12 dB, 860 MHz/15 dB. These are synthetic net gains, not GainMaker GaN control settings.

## Installed equipment, manuals and control paths

**Where:** Route → Amp / node setup; also **Source setup & manual** from Setup. **Practice:** Complete; OEM AGC; DSIM; Manual/thermal; GS7K node; Six actives.

| Function | Inputs and use | Output and limit |
| --- | --- | --- |
| Equipment to set up | Select the launch node/active or a route active | Opens that exact station's saved draft and applicable reference context |
| Identity and manual review | Match model/module, split, port, firmware, manual revision and measurement plane | Displays source-qualified steps and references; a product brief is not a commissioning procedure |
| Setup frequencies & job levels | Read selected-profile base anchors, actual-carrier draft and measurement-plane reminders | Keeps design targets, estimated carrier targets, approved pilot and procedure backoff frequencies separate |
| Installed gain control | Select **OEM GainMaker AGC**, **ACI DSIM**, or **Manual / thermal control** where applicable | Selects the matching guide; changing hardware/control/pilot context can invalidate prior reviewed steps |
| Documented setup method | Choose the exact station's applicable manual-backoff or thermal branch | Supplies source-specific guidance. Never combine branches/revisions because a setting looks familiar |
| Reviewed steps and station notes | Record what was reviewed and unresolved | Persists with that station; not proof of work, pilot lock or RF acceptance |
| External source links | Open the original or explicitly labelled historical reference | Needs connectivity; verify exact installed applicability and document revision |

**Conventional GS7K:** the node guide distinguishes receiver/FCM/RCM/routing, selected-port pads/EQs and the actual reverse transmitter/EDR/RPD. Conventional LCM Auto Set-Up discovers modules; it does not balance RF. Intelligent, SHO/Fiber Deep and retrofit-RPD references require their own hardware/procedure and are not interchangeable conventional-node profiles.

**Complete's GainMaker GaN HGD:** exact installed GaN commissioning/control instructions remain unresolved. The app keeps this gap visible. Conventional GaAs OEM pad/backoff formulas, ACI DSIM instructions and AOI alignment sequences do not establish GaN settings.

**Focused OEM AGC:** match the detector, approved pilot and manual. The displayed manual-backoff and thermal preparation branches are alternatives. Conventional GaAs system-amplifier and LE references use different pad relationships and different backoff tables; the station/manual must match. No universal OEM QAM detector offset or settling timer is supplied.

**Focused manual / thermal:** identify the installed control path and follow its own applicable method. Do not infer OEM AGC pilot-pad values or DSIM codes from that selection.

**ACI DSIM functions:**

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Module / firmware / approved pilot | Identify DSIM variant, controller/module revision, pilot MHz/type and approved operating context | Keeps the setup bound to the installed equipment; DSIM-SG and later DSIM-A variants are not assumed equivalent |
| Physical-controller/app guidance | Read the exact cited interface/procedure and temperature preparation | Source-specific review only; physical RF adjustments and raw knob counts are not generic app dB settings |
| Historical pilot lookup | Choose channel or exact frequency and Analog/Digital type | Returns the literal ACI Rev A code when available. Channel 110 digital is 711 MHz, `@@?<A` |
| Copy code / manual fallback | Copy from a supported user action, or select the code for manual copying | No device is programmed; copying does not verify compatibility, a supervisor key or pilot lock |
| Missing/anomalous lookup rows | Read the unavailable/anomaly message | No codes are invented for 95–99, 303 MHz or OFDM PLC; channel 100 copying is blocked as a source anomaly |
| Key/review status | Record the review flag supported by the form | Do not enter or share an actual supervisor key; a flag is not credential verification |

The historical Rev A table contains 86 literal rows: channels 52–94 and 100–142. DSIM-SG Rev E's pad instructions differ from Rev H; the app preserves that conflict rather than mixing settings. Match the full installed procedure before physical use.

**AOI in the separate six-active example:** HGD/HGBT guidance covers saved downstream profile → downstream Auto → optional downstream Manual → applicable upstream sequence → ALSC after both paths. The cited historical SA procedure is not a substitute for missing exact Quantum18 LE/BA I&O. Its instrument instructions remain separate from the local XPERTrak return workflow.

## Equipment catalog

**Where:** Route → Catalog. **Practice:** Complete → Equipment references.

Choose category/family and search the exact model. The list includes RF equipment, cables, node profiles and power models. Search can widen beyond a family when that filter has no matching entry; read the displayed count/filter message and narrow a long list.

Expand **View published loss data**, **View operating gain & conditions**, **View bands & test points**, or **View power data & conditions**. Read units, frequency/voltage domains, source, configuration, nominal/maximum basis and source qualifications before using a value. Node and power entries link to their working setup/load screens.

Custom entries require actual input tables. Published references do not automatically fill installed operating gain. Unavailable curves do not become zero or extrapolate. UBT remains unavailable for new selections; older saved UBT definitions remain readable without silently replacing them. A legacy power row with unsupported current data needs an applicable entered load.

## TDR distance locator

**Where:** Test → TDR. **Practice:** Complete → TDR; Custom curves → reverse TDR; Six actives → reconnect after A6.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Route endpoint/path | Select the actual endpoint whose feed path is tested | Excludes unrelated sibling branches |
| Connection point | Select Launch or the correct cable side after a route point | Changes the origin; route coordinates remain measured from the source |
| Direction | Choose toward endpoint or toward source | Supports forward and reverse testing along the selected path |
| Displayed distance and lead | Enter the meter's one-way displayed distance and physical test lead | Corrects the path distance; do not enter a round-trip time as feet |
| VF correction | Enter meter-set and actual velocity factors, enabling correction when needed | Scales displayed distance by actual VF / meter VF, then accounts for the physical lead |
| Locate result | Review corrected path distance, route coordinate, span and offsets | Places an entered distance on entered geometry; does not classify or detect a physical fault |
| Active boundary / invalid input message | Read the first barrier or missing/invalid condition | Uses the actual parent-chain order, including distinct active points sharing one route coordinate. A TDR path cannot cross another amplifier; reconnect on the correct cable side |

Complete: after GaN A2 at **1700 ft**, **295 − 25 = 270 ft** of cable path locates **1970 ft**, **160 ft** into Main Tap B's 310 ft span. Both VFs are 0.87. Launch-origin testing beyond the active is blocked.

Custom curves: reverse from the 200 ft endpoint; **100 × 0.88/0.80 − 25 = 85 ft** toward the source places the hit at **115 ft**, 15 ft into the second span. These VFs and distances are teaching inputs.

## Forward and return sweep setup

**Where:** Test → Meter setup. **Practice:** Complete for 42/54; Six actives for 204/258; focused equipment exercises for their matching procedures.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Split/workflow selection | Select 42/54 or 204/258 for the actual fleet/configuration | Retains separate setup drafts; changing a tab does not reconfigure hardware |
| Plant, equipment and reference | Record station/leg, equipment, instrument/firmware/options, service/sweep plan, reference, available band and measurement planes | Makes the comparison reproducible; instrument capability and compatible references still require verification |
| Guided setup | Use Previous/Next step and reviewed checkboxes; record actual settings/findings | Saved guidance/progress, not remote control or acceptance |
| 42 MHz return sweepless | Use the approved DOCSIS-derived referenced response, actual service and matching saved reference | Comparison is in dB; no absolute physical receiver level or generator setting is inferred |
| Operator return TX reference | Record 38 dBmV separately, plus actual TX frequencies/service plan and transmitter/plane | A local level reference supplies no missing channel, return-injection or receiver target |
| Compare return markers | Enter actual low/high frequencies, readings, targets and tolerances in matching units | Reports differences and tilt against entered references; check the rest of the trace separately |
| 204 MHz comparison basis | Choose referenced response (dB) or a verified absolute receive plane (dBmV) | Relative and absolute values are not interchangeable |
| Return sweep injection budget | For the 204 workflow, enter desired network-plane injection, total physical coupling/lead losses and applicable generator maximum | Estimates physical connector output and checks the entered limit; it is not automatically the ONX Injection field setting |
| Closeout notes and sources | Record findings, gaps and trace references; review original source links | No ONX/XPERTrak connection or equipment programming is performed |
| Save station snapshot | Save the station draft before editing another station | Adds a labelled snapshot to history, up to 100; preserves notes/readings, not acceptance |
| Saved station snapshots | Review history with station, split, time, leg/reference and training identity | Export includes snapshots and both current split drafts; it is not an external backup by itself |
| Export setup notes | Finish the text-file save/share action | Exports the entered setup, guidance and history; keep originals/full project separately |

For physical-output budgeting, full physical losses remain losses even if instrument compensation is enabled. Do not enter the summed physical-output estimate as ONX network-plane Injection while also applying the same TPC. The Records injection helper instead uses **remaining uncompensated** losses for its manual-setting estimate. Neither establishes an approved meter mode or measured injection. Return Sweepless Sweep does not use this generator calculation.

## Predicted sweep and output table

**Where:** Test → Predicted levels. **Practice:** Complete → Predicted sweep; Six actives → six restored marker outputs.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Trace selection | Select source and relevant route outputs | Shows the selected paths; compare through and tap ports separately |
| Signal level | Choose absolute dBmV mode | Predicted output versus frequency, dependent on valid source and component data |
| Normalized path response | Choose dB mode and reference MHz | Removes the launch shape and zeros the supported path response at that reference |
| Total path loss | Choose loss mode | Net path loss, including active effects where supported; not a measured sweep trace |
| View range and reference | Enter view start/end and supported normalization frequency | Changes the chart view/reference; does not change equipment capability or available spectrum |
| Pointer/touch readout and legend | Tap/move over the chart and read trace labels | Frequency/level readout for calculated data |
| Live/planning display | Review shading, solid/dashed presentation, gaps and chart notes | Above-live values are planning predictions. Gaps may be missing tables or launch support; never treat them as zero |
| Signal at each tap/output | Review the tabulated frequencies, ports and tilt/context | Tap results are at the F-port before the optional drop; fixed table markers can be unavailable on this route |

Launch slope extension, when enabled, remains an estimate. Cable/passive coverage is not extended. Build 2 defers expensive chart redraw while this screen is hidden and draws current data when it is shown or printed. Frequency results are reused only within one synchronous refresh, not across later edits or imports. The model does not reproduce narrowband ripple, ingress, micro-reflections or a measured fault signature. A 993 MHz result cannot establish 1.2/1.8 GHz plant performance.

## Single-path frequency checker

**Where:** Test → Frequency. **Practice:** Complete → Frequency; Custom curves → exact overrides.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Cable/passive combination | Select cable, feet, passive, actual path and quantity | A separate combination; does not add route points or alter RF topology |
| Exact frequency input | Enter a supported frequency from 5–1800 MHz | Returns the calculation and band/coverage flags at that point |
| Exact cable/passive overrides | Supply known dB/100 ft and loss-per-device at that frequency | Uses entered values already at stated conditions; clearing them falls back only to available reference data |
| Optional launch at that frequency | Enter a level at the matching plane | Computes receive budget after total loss; blank launch leaves receive level unavailable |
| Equipment/spectrum/passband limits | Enter installed, planned/live upper limits and split | Shows conflicting/out-of-band conditions; broad software range is not equipment support |
| Frequency table | Inspect low/high and other listed markers | Shows cable rate/loss, passive each/total, total loss, launch, receive and basis/status |
| Complete route / span summary | Select an existing route output | Summarizes that whole feed path and distance; different from the single combination above |
| Export frequency results | Export CSV and finish saving | Includes inputs, units, flags and unavailable values |

Complete at **860 MHz**: **200 ft ×2.2 dB/100 ft + 1.4 dB =5.8 dB** total; **43 − 5.8 = 37.2 dBmV** receive. Custom curves at 261 MHz: 100 ft ×1 dB/100 ft +1 dB =2 dB, leaving 32 dBmV from 34 dBmV. These are exact-frequency teaching inputs.

## Meter readings and prediction error

**Where:** Test → Readings. **Practice:** Complete → Meter readings; Six actives → A6 comparison.

Choose a route point and actual output, then enter frequency, reading, test-point status and remaining coupling. The comparison shows raw reading, corrected reading, prediction and **measurement minus prediction**. A negative error means the entered measurement is below the model.

Use zero/off for remaining correction when the meter already reports mainline-equivalent level. A reading at another frequency is not a valid comparison with the chosen marker. Missing predictions/readings remain unavailable. This task does not automatically fill the official forward/return records or approve their criteria.

Complete includes intentional mismatches. For example, A1's entered **16.1 + 20 = 36.1 dBmV** at 54 MHz is compared with about **36.94 dBmV** predicted. Tap C's direct **7.50 dBmV** compares with about **14.01 dBmV**. Investigate inputs and measurement planes; synthetic disagreement is not evidence of a physical defect.

## Field references and target conversions

**Where:** Test → References. **Practice:** Complete → References; DSIM/OEM/GS7K → available carriers.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Your local non-high-split targets | Apply the labelled 31 @ 54 / 43 @ 860 · TX 38 preset to a compatible selected profile after confirmation | Updates its stated design/reference fields; does not write measured launch, approve criteria or supply missing measurements |
| Preset compatibility checks | Match hardware and forward passband containing both base anchors | Blocks high-split/incompatible use; a low return ceiling alone does not prove 54 MHz is usable |
| Setup targets at available carriers | Enter actual low/high channel centers and choose square-root frequency or linear MHz | Estimates targets from the original 54/860 anchors; range must satisfy 54≤low<high≤860 and known live/hardware limits |
| Fill 57/753 or 63/550 example | Fill only the converter draft | Does not replace base design anchors, measured launch or approved pilot |
| Common launch anchor pairs | Review/apply the labelled frequency preset | Changes its stated fields only; an example is not a live carrier survey |
| Editable node/launch target ranges | Use the selected profile or labelled workbook/sample draft; edit min/max/tolerance | Creates draft targets. **Apply ranges to selected profile** changes that selected profile, keeping approval separate |
| Published tap faces quick look | Select the route tap and frequency; open its face picker | Compares compatible published parts; choosing a face changes that route part |
| Cable loss quick look | Choose cable and frequency | Reference loss with source/domain qualifications; not an entered span measurement |

Square-root examples from 31/43 dBmV at 54/860 MHz: **57/753 → 31.11/41.97 dBmV**; **63/550 → 31.32/39.79 dBmV**. The corresponding linear-MHz estimates are **31.04/41.41** and **31.13/38.38**. Curve choice requires the applicable local procedure; these are not a measured installed equalizer curve.

The available-carrier draft survives project backup and is reported separately in equipment setup/run sheet. It does not choose an AGC pilot. If actual live spectrum stops below the practice pilot, identify a compatible approved live pilot; the app does not invent one. The six-active Vecima/AOI profile keeps its separate in-band 261/993 MHz setup.

## Field calculators

**Where:** Test → Calculators. **Added in:** 2.0 Alpha build 3 (in development). **Practice:** Custom curves → Quick calculations with source tags.

Each calculator shows its formula's source tag. Tap the tag for the source, revision, page or section, units, conditions and the date it was checked. A message instead of a number means an input is missing or out of range; it is never a zero.

| Calculator | Enter | Result and limit | Source tag |
| --- | --- | --- | --- |
| dB converter | A level, its unit (dBmV, dBm, dBµV, mV or mW) and 75 Ω or 50 Ω | All five units. dBm = dBmV − 48.75 dB at 75 Ω or − 46.99 dB at 50 Ω; dBµV = dBmV + 60. RMS voltage across a matched load | Spec · decibel and SI unit definitions, re-derived |
| Ripple to distance | Spacing between ripple peaks (MHz) and the cable's VP | Echo path length between two mismatches: 491.79 × VP ÷ spacing (the published 492 is rounded). One mismatch may be the device you test at | Expert · Hranac, *Communications Technology*, Aug. 2005; SCTE 280 2022 section 9.7 |
| Pre-EQ tap to distance | Echo tap, main tap (8 is typical; the CMTS sets it), symbol rate 5.12, 2.56 or 1.28 Msym/s, and VP | Spacing between two mismatches (not the distance from the modem or node), the ±½-tap range and feet per tap. Taps after the main tap only. DOCSIS 2.0/3.0 single-carrier upstream; not DOCSIS 3.1 OFDMA | Expert · CableLabs PNM Best Practices V03 sections 5.5, 6.6.2 and 6.8.1.1, on PHYv3.0 section 6.2.16 tap spacing |
| OFDM power | Measured power, the bandwidth it was measured in (6, 24 or 1.6 MHz) and the occupied bandwidth | Total power and power per 6, 24 and 1.6 MHz. Assumes flat power; a tilted output needs the total composite power method in SCTE 270 section 30.14 | Spec · CableLabs PHYv3.1-I20 section 7.5.9.1; SCTE 258 2026 |
| Pad / EQ balance | Amplifier model, low and high pilot (MHz), your readings and the station's targets at both, and the installed input pad and EQ | Level error at each pilot and the tilt error, with the direction to move the input EQ and pad. For GainMaker 1 GHz models it picks the input EQ for tilt, then the input pad for level at the high pilot, from Cisco's published values, and predicts the levels after the change. Quantum18 HGD and HGBT show that they align electronically in AOI's QuantumLink Local app; the LE shows that no public procedure or pad/EQ list was found; the BA gives pad direction in its 2 dB steps | Expert · Hranac, Broadband Library, Feb. 2022; GainMaker guide OL-31156-01 procedure order |
| Echo delay | Cable length between two mismatches and VP | Round-trip delay in ns and µs, and in 5.12 Msym/s symbol periods | Expert · Hranac, *Communications Technology*, Nov. 2009; speed of light from SCTE 293-2 2024 section 4.1 |

Checked worked numbers (the balance example above was also checked against a LibreOffice-recalculated spreadsheet): ripple 6 MHz apart at VP 0.87 → **71.3 ft**; tap 9 with main tap 8 at 5.12 Msym/s and VP 0.87 → mismatches **83.6 ft** apart (41.8–125.3 ft), or **167.1 ft** at 2.56 Msym/s; 42 dBmV per 6 MHz over 192 MHz → **57.05 dBmV** total; 100 ft at VP 0.87 → **233.7 ns**.

**Pad / EQ balance:** the readings and targets must be at the same two pilots and the same measurement plane. Put the station in the manual or backoff state its procedure requires before changing parts; an active AGC or ALSC loop can hide the change. GainMaker values come from Cisco OL-31156-01 (system amplifiers) and OL-31155-01 (line extenders) with S-A data sheet 716336 Rev D: input pads 0–20.5 dB in 0.5 dB steps and 1 GHz forward cable EQs 1.5–30 dB in 1.5 dB steps, with each EQ's published loss at 52–1000 MHz (the top column is headed 1002 MHz in data sheet 716336, so a 1002 MHz pilot is accepted). Loss between published frequencies is interpolated linearly in MHz, never across the chart's 86–550 MHz gap, so a pilot in that gap gets no pick. Pilots must be inside the model's forward band. The advice says whether to keep or change each part, gives the high-pilot level predicted after the EQ change, and says whether the result lands inside the procedure's ±0.5 dB window for tilt and level. The 0 dB EQ jumper has no published loss chart, inverse EQs have conflicting charts, and 870 MHz EQs are for 870 MHz designs, so none of these are offered. Worked example: GainMaker HGD at 54 / 860 MHz, readings 36.4 / 49.6 dBmV, targets 39 / 49 dBmV, installed pad 6 dB and EQ 9 dB → EQ **4.5 dB** and pad **7 dB**, predicted **39.0 / 48.9 dBmV**. Balancing on two pilots does not replace a sweep.

**VP:** pick a catalog cable that lists a nominal VP (MC2 .440, MC2 1.000, Series 6 and Series 11 drop), or type the VP from the cable's datasheet as a fraction from 0.50 to 1.00. Most hardline catalog entries do not list a VP yet. For DOCSIS 3.1 downstream, occupied bandwidth is a whole number of 6 MHz channels, at least 24 MHz, and includes the edge taper.

The calculators do not save their inputs, change the job or read a modem, CMTS or meter. Results are calculations, not measurements.

## Limits and sources

**Where:** Test → Limits, and the tag beside each formula. **Added in:** 2.0 Alpha build 3 (in development). **Practice:** Custom curves → Check a limit and its source.

The limits, targets and formulas behind the field calculators and this job's criteria, with where each came from. Each entry carries one of four labels:

| Label | Meaning |
| --- | --- |
| Spec | A published rule, standard or definition: FCC rule, CableLabs specification, SCTE standard or SI definition |
| Expert | Published expert guidance; good practice, not a standard |
| Company | A local target entered by you or your company. It starts unknown until someone enters it |
| Unknown | The source is not verified; treat it as unconfirmed guidance |

Tap a tag to open its source sheet: the value or formula, units, when it applies, which plant, the source, revision, page or section, the date it was checked and how it was checked, and what uses it. Filter the list by label with the buttons at the top.

What the list holds:

- The calculator formulas and the speed of light they use.
- Your built-in local preset: **31 dBmV at 54 MHz**, **43 dBmV at 860 MHz** and the separate **38 dBmV return TX reference** (42/54 plant).
- This job's project-profile criteria (design launch, level and tilt tolerances, ripple, MER, receiver and injection targets) and the meter-setup TX reference of the 42/54 workflow. The 204/258 workflow has no TX reference. Blank entries show **Unknown — not entered**; an entered 0 stays 0. New jobs start blank, except the 750 MHz example profile's labeled 32 / 43 dBmV launch levels. A company sheet links to the screen where you edit the value.
- Two built-in approximations labeled **Unknown** because their sources are not verified: the 0.1 % per °F cable-loss temperature correction, traced only to an indexed copy of CommScope's MX0398 pocket guide, and the 0.004 per °C default power-cable resistance coefficient, which has no recorded source.

The list describes values; it does not approve criteria or change the job. Example targets on older screens, such as the workbook and sample targets in Test → References, are not listed yet, and older screens do not show tags; later build-list tools add them where their values appear.

## DOCSIS health card

**Where:** Test → DOCSIS health. **Added in:** 2.0 Alpha build 3 (in development). **Practice:** Custom curves → Check modem levels against the spec.

Compare a reading you already have, from a meter or a modem's status page, with what the DOCSIS specifications require a cable modem to accept or transmit, and with your own window. Nothing is read from a modem, CMTS or meter, and nothing is saved in the job.

**The spec range is a capability limit, not a target.** It is the range of levels a modem must be able to handle. A reading inside it does not mean the link is healthy: error rate, MER and the other checks are separate. A message instead of a result means an input is missing or out of range; it is never a zero.

| Card | Enter | Spec comparison | Source tag |
| --- | --- | --- | --- |
| Downstream SC-QAM channel | The level of one 6 MHz digital channel at the modem input (dBmV) | −15 to +15 dBmV per 6 MHz channel; a reading exactly on an edge counts as inside | Spec · CableLabs PHYv3.0 C01 section 6.3.2, Table 6–22 (PHYv3.1 section 6.4.2 applies it to 3.1 modems) |
| Downstream OFDM channel | The OFDM power (dBmV) and what it was measured over, which you must choose from what your meter or modem page says: each 6 MHz, 24 MHz, or another occupied bandwidth (a whole number of 6 MHz channels, 24 to 192 MHz) | −15 to +15 dBmV per 6 MHz and −9 to +21 dBmV per 24 MHz, as printed. For another width the 24 MHz row moves by 10·log10(occupied ÷ 24), which is derived, shown to 0.01 dB and rounded inward so the range on screen is the range used. The card calls it a derived range and tags it Expert, not Spec, because the specification prints only the 6 and 24 MHz rows | Spec · CableLabs PHYv3.1 I20 section 7.5.11, Table 45 |
| Total downstream input power | The power of all downstream signals together (dBmV) and whether the modem is DOCSIS 3.1 or 3.0 only, which you must choose because the limits differ | Strictly below 40 dBmV for a 3.1 modem (54 to 1794 MHz) or 33 dBmV for a 3.0-only modem (40 MHz and up). Exactly 40 is not below 40. The 3.1 specification also points a 3.1 modem to the 3.0 SC-QAM table (33 dBmV total) and does not say which governs for SC-QAM-only reception, so confirm a 33 to 40 dBmV total on a 3.1 modem | Spec · PHYv3.1 I20 Table 45; PHYv3.0 C01 Table 6–22 |
| Upstream transmit headroom | How the modem is working (a DOCSIS 3.1 modem on a 3.1 CMTS, or anything else), the modem's total transmit power (dBmV) and its Pmax | For a 3.1 modem on a 3.1 CMTS: headroom = Pmax − total, with Pmax 65 dBmV unless the modem reports more; 65 is the lowest the specification allows. It is a minimum capability, not a limit on what the modem sends. For a 3.0 modem, or a 3.1 modem on a 3.0 CMTS, the 3.0 per-channel limits apply instead; the card has no figure for them, so you type in the modem's own maximum from its documentation and the result is not a spec comparison | Spec · PHYv3.1 I20 sections 7.4.12.2 and 7.4.12.3.1 |

Each result says in words how far inside or outside the range the reading is, so it does not rely on color. The printed 6 MHz and 24 MHz OFDM figures differ by 0.02 dB (10·log10 of 4 is 6.02 dB, not 6); the card uses each as printed.

**Company window.** Every card has a **Company window** box for the lowest and highest level your company wants. Leave a side blank for no limit on that side: blank is unknown, never zero. The OFDM window is in dBmV per 6 MHz, and the card restates your reading per 6 MHz to compare. Windows start unknown and are saved on this device only, in the browser's storage, so they are **not** part of a job or its full backup; **Clear company windows** removes them for both plants. If the browser will not store them, the card says so and keeps them until the page closes. Company windows are kept **separately for each plant**: the box follows the plant chosen in **Test → Meter setup** for the job, so a window typed for the 42/54 plant is never applied to the 204/258 plant, which stays unknown until you enter one (no plant chosen: the boxes stay locked until you choose). They are shared by every job on that plant, and they also appear in **Test → Limits** under their own heading, one entry for each plant. A box holding text that is not a number (a lone minus sign, for example) is refused with a reason and never clears or replaces a saved window; for the upstream card it is refused instead of being read as a blank Pmax.

**Total upstream power, not one channel.** Enter the modem's total transmit power. In DOCSIS 3.1 operation the specification reports per-channel power normalized to 1.6 MHz, so a 6.4 MHz channel's actual power is about 6 dB above the number reported; your modem page or meter may use a different convention, so check which one it uses before adding channels up.

Checked worked numbers: 16 dBmV on an SC-QAM channel is **1.0 dB above** the range, and 3.2 dBmV is inside, **11.8 dB** from the upper edge; −8 dBmV over 24 MHz is inside, **1.0 dB** from the lower edge; 40 dBmV total on a 3.1 modem is **at** the limit, not below it; 52 dBmV total transmit power on a 3.1 modem with the 65 dBmV default Pmax leaves **13.0 dB** of headroom.

What this card leaves out on purpose: MER and SNR, per-channel upstream power, the limit on level differences between channels, DOCSIS 4.0, and the EuroDOCSIS 8 MHz ranges, which differ from the North American ones used here.

## Leakage

**Where:** Test → Leakage. **Added in:** 2.0 Alpha build 3 (in development). **Practice:** Custom curves → Check and log signal leakage.

Five tools for signal leakage on one screen. **This is your own notebook and calculator, not the company's official leak record, and none of its results is a filing.** Nothing is sent anywhere. The leak log, saved detector checks and company settings are kept in the browser on this device only, under their own storage key. They are **not** part of a job or its full backup, and only the log can be exported (CSV); the saved checks and company settings cannot.

| Tool | Enter | What it does | Source tag |
| --- | --- | --- | --- |
| FCC leakage limit check | Test frequency (MHz), analog or digital, the field strength (µV/m) and the distance from the leak | Picks the limit for the band and compares your reading with it at the rule's distance. The limits as the rule prints them: analog 15 µV/m and digital 13.1 µV/m at 30 m at 54 MHz and below and over 216 MHz; analog 20 µV/m and digital 17.4 µV/m at 3 m over 54 MHz up to and including 216 MHz. A reading exactly at the limit is within it. A reading restated from another distance gets a neutral mark and the word approximate, not a green check. It also says when your distance is inside the near field at that frequency | Spec · 47 CFR 76.605(c), Table 1; a separate row records the § 76.614 expectation for the aeronautical bands |
| Distance to 3 m | Field strength and distance in metres or feet | Restates the reading at 3 m and at 30 m: E at 3 m ≈ E measured × distance ÷ 3 m. In the far field the field strength falls in proportion to distance. Close to the leak it does not, and how close depends on the frequency: a common rule of thumb puts the edge of the near field at the wavelength ÷ 2π, about 0.4 m at 121 MHz and 4.8 m at 10 MHz. The card warns inside 3 m; the limit check, which knows the frequency, warns inside that edge. A restated reading is approximate | Expert · far-field relation; SCTE 221 2020 (R2026) for the far-field definition (secondary: read by a review agent). SCTE 293-12 2025 was identified from its catalog summary only |
| Cumulative leakage index (CLI) | The field strength of each leak at 3 m, separated by spaces, new lines or semicolons (a comma followed by a space also works), and the fraction of the plant examined (or strand miles tested and total, not both) | 10·log10 of (1 ÷ fraction examined) × the sum of each leak's field strength squared, counting only leaks of 50 µV/m or more at 3 m, compared with the printed value of 64. If no leak counts the card says so instead of showing zero. The fraction runs from 0.001 to 1. Under 75% examined the result is marked as an estimate only, with no green check, because the rule asks for at least 75% of the strand. A comma with no space after it, as in 1,500 or 120,5, is refused: it could be a decimal comma or a thousands separator. Strengths must already be on the 108–137 MHz basis: the FCC's frequency correlation is not done here | Spec · 47 CFR 76.611(a)(1) and (b)(1) |
| Detector check | The check method (a directly connected source, or a calibrated leak with a half-wave dipole), the expected and read values (µV/m) and the date (the box starts as today; a blank date is refused, never replaced by today) | The difference in dB and per cent, and whether it is within your company tolerance, which starts unknown. A saved check keeps the tolerance that was in force when it was saved, so changing the tolerance later does not change an old record | Expert · SCTE 289 2024r1 (secondary: only the SCTE catalog summary was read) |
| Leak log | Date found, where (pole, tap or cross street), probable cause, date repaired (blank while open), and optionally field strength, distance, frequency and notes | A list of leaks with open ones marked, the 3 m equivalent and whether it counts in the CLI, a **Mark repaired** action (the date box starts as today and can be changed; if you clear it, Mark repaired is refused and the leak stays open), **Reopen** to undo a mistaken Mark repaired, **Delete** and an **Export log (CSV)**. A leak counts in the CLI only if it is at least 50 µV/m at 3 m with the test frequency in the 108–137 MHz band; otherwise the row says what is missing. A leak logged with a field strength but no distance says it was not restated, compared with your repair threshold or checked for the CLI. The fields follow 47 CFR 76.1706 (date and location found, date repaired, probable cause; operators keep the log for two years, and for five years in some systems under 1,000 subscribers, § 76.601(d)) | Spec · 47 CFR 76.1706 |

**Company settings** (a box at the bottom): your repair threshold in µV/m at 3 m, which flags open leaks in the log at or above it, and your detector tolerance in ± dB. Both start unknown; blank is never zero, and editing one never changes the other. They are one set for the whole device and appear in **Test → Limits** under their own heading. A box holding text that is not a number (a lone minus sign, for example) is refused with a reason and never clears a saved setting; the same goes for the number boxes of the log and the other cards, where a malformed entry is never read as "not given". The FCC limits are limits on the field a system may produce. For aeronautical-band leaks, § 76.614 separately expects an operator carrying signals there to note and repair, within a reasonable period, any leak of 20 µV/m or more at 3 m. The repair threshold is your company's own and starts unknown.

**Keep the log free of customer information.** Describe a place by pole, tap or cross street. Do not enter customer names, addresses or account numbers: the place and notes text go into the exported CSV. **Clear everything on this device** asks first and clears the log, the saved detector checks and the company settings; only the log can be exported before that.

**If this browser will not save.** A change this browser would not store stays on the screen until the page closes and is written with the next change that does save. If the saved notebook cannot be read, a copy of it is kept on this device and the screen says so before the next change replaces it. If a newer version of the app saved it, this version will not overwrite it.

Checked worked numbers: 25 µV/m analog at 3 m and 121.2625 MHz is **5 µV/m over** the 20 µV/m limit; leaks of 100, 60 and 50 µV/m with 0.8 of the plant examined give a sum of squares of **16,100**, an index of 16,100 ÷ 0.8 = 20,125, which is **43.04 dB**, 21.0 dB at or below 64; leaks of 120, 85, 60, 250 and 50 µV/m at 0.8 give **50.52 dB**; 40 µV/m at 10 m is **133.3 µV/m** at 3 m.

What this screen leaves out on purpose: the airspace measurement alternative, the correction for a test frequency outside 108–137 MHz, tracking of the quarterly aeronautical-band monitoring, the half-wave dipole voltage to field-strength conversion, per-job leak logs and live detector or GPS data.

## Power-supply load

**Where:** Power → Load. **Practice:** Complete → Power; Six actives → explicit power topology.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Supply voltage/rating | Enter coax output V RMS and A RMS rating | Defines the supply-side calculation and loading/headroom; not utility-mains current |
| Add equipment / junction | Enter each powered device once; use a zero-load junction for branches | Builds the actual power circuit independently of RF route parents |
| Power parent | Choose supply or the actual upstream power point | Shared sections carry downstream branch currents; RF direction alone does not establish this |
| Cable and resistance | Enter feet, supported cable or custom loop resistance and extra/contact resistance | Calculates section voltage drop and resistive loss. Custom resistance is used as entered at actual temperature |
| Power-cable temperature/coefficient | Enter the power temperature and applicable resistance coefficient | Adjusts supported nominal loop resistance; separate from RF cable temperature |
| Manufacturer current curve | Select the exact supported configuration | Interpolates current within its documented voltage domain; no borrowed curve or out-of-domain extrapolation |
| Entered amps | Enter known/measured current | Uses that load directly; synthetic examples are not manufacturer specifications |
| Entered input watts / PF | Enter watts and valid power factor | Estimates current from equipment voltage and PF; unsuitable/inconsistent inputs prevent a trustworthy result |
| Entered input VA | Enter apparent power in VA | Estimates current as VA divided by equipment voltage; power factor is not applied a second time |
| Minimum equipment voltage | Enter the applicable installed limit if known | Supports voltage warnings; a curve's table boundary is not automatically an undervoltage cutoff |
| Supply summary | Read total output current, loading %, headroom, wire loss and minimum equipment voltage | Scalar RMS planning result, not a measured quasi-square-wave waveform |
| Per-section table | Read equipment V, device A, section A, section drop V and loss W | Distinguishes a device's current from all current carried through its incoming section |
| Remove / edit row | Change only the intended circuit point and inspect child feeds | Verify actual power passing, supply boundaries and connector ratings independently |
| Export power load | Save the power CSV | Includes circuit inputs, configuration/source and warnings; not a full-project backup |

Complete uses a **90 V / 15 A** supply; synthetic entered **0.75 A GS7K**, **0.60/0.45 A GaN** loads and a **20 W / PF 0.9** branch. Its independent reference result is **2.047 A**, **13.65%** loading and **88.83 V** minimum at GaN A2. The GaN selection has no verified current curve; no AOI curve is substituted.

## Power what-if

**Where:** Power → What-if. **Practice:** Complete → Power what-if.

Choose the proposed power parent, cable, added length, current and minimum voltage. Read the trial's displayed **Predicted end voltage**, **Predicted voltage headroom** and status before applying it. The preview recalculates the copied circuit internally; it does not display total trial supply current. This calculation uses a copied circuit until you choose **Keep in power circuit**.

Keep adds the proposed point to the working power plan. Open **Power → Load** to review the revised total supply current/loading and all section results, then export the revised job. Resetting the training exercise restores its baseline after preserving the edited copy; for real work, maintain a deliberately saved/exported baseline before keeping trials.

Complete's trial adds **300 ft P3 .625 and 0.75 A after GaN A2**. The independent reference answer is **2.798 A** supply current, **18.65%** loading and **87.37 V** at the new load. These are planning estimates for this topology, not a general cable/device allowance.

## ONX files, original evidence and comparisons

**Where:** Job → ONX files. **Practice:** Complete → Synthetic meter files; backup step.

| Function | Inputs and use | Result and limit |
| --- | --- | --- |
| Open project backup | Select a full NightSweep project JSON | Opens an entire saved job. To add evidence to the current job, use the file-attachment action instead |
| Evidence classification | Choose Sweep, Ingress, OneCheck or supported attachment context; stage Before, After or Reference; asset/station and notes | Labels the original file and makes before/after comparisons interpretable |
| Add meter files or photos | Choose available files and wait for completion | Stores original bytes with the job; does not control a meter or read an image's numbers automatically |
| Supported CSV preview | Supply explicit frequency and level/response/channel columns | Decodes supported interchange data; proprietary ONX JSON/XML/ZIP/PDF and other native schemas remain originals unless supported |
| View decoded CSV measurements | Expand the parsed trace/channel table | Inspect values, units and source context; previewing applies no silent TP correction |
| Sweep / ingress before-after | Match compatible asset, kind, units and frequencies/stages | Compares entered file data; does not invent values or operator acceptance thresholds |
| OneCheck/channel table | Review supported channel, frequency, level and MER columns | Preserves discrete channel data; SC-QAM and OFDM PLC/block quantities are not interchangeable |
| Original-only attachments | Retain unsupported formats or photos | Preserves evidence without pretending it has measurement decoding or OCR |
| Save original | Export the exact stored original | Finish the device save action and verify the destination file |
| Verify saved files | Check current-job originals for missing/tampered bytes | Verifies stored file integrity, not a separate external backup or physical measurement |
| Remove from job | Remove the intended attachment reference | Protect/export evidence before removing it; removal is not a backup |
| Clear unused stored files | Clean originals no longer referenced by working/named jobs | Validates references first and stops conservatively on corrupt named-job data; do not use storage clearing as fault recovery |

Supported interchange examples:

```csv
frequency_mhz,level_dbmv
54,31
860,43
```

Use `response_db` for relative dB response; a channel table can use `channel,frequency_mhz,level_dbmv,mer_db`. Provide complete finite values, explicit units and valid unique frequency/channel rows. A filename in a record is only a reference; attach the bytes if the original must travel with the backup.

| Evidence/project limit | Maximum |
| --- | ---: |
| One original attachment | 8 MiB |
| Total original evidence in one job | 12 MiB |
| Attachments in one job | 30 |
| Text decoded for a preview | 2 MiB |
| CSV data rows for decoding | 10,000 |
| Full project JSON import/export | 20 MiB |

An oversized/unsupported preview can remain an original attachment within the original-file limits. Every project-opening route applies the common **20 MiB UTF-8 text limit before parsing or changing the working job**. Oversized or non-text input is rejected. A missing or tampered original blocks a portable export rather than silently dropping evidence. Wait for imports/exports to finish before switching jobs.

## Field checklists and unit conversion

**Where:** Job → Checklists. **Practice:** Complete → Field checklists.

| Function | Inputs and use | Output and limit |
| --- | --- | --- |
| Leakage / ingress quick reference | Review shielding, fittings, unused ports, drops/premises and retest guidance | Definitions and inspection prompts, not leakage thresholds or automatic fault classification |
| Leakage repair checklist | Mark fittings, shielding/housings, terminations, affected drop/premises and retest items actually reviewed/performed | Saved work checklist; not RF acceptance |
| Leakage/ingress notes | Enter location, findings, repair, retest and trace references | Included with the job and relevant reports |
| Preventive maintenance / EOL | Record supply inspection, bonding, EOL points, amplifier/unity-gain and patrol notes | Individual checkmarks plus findings; route predictions are not copied into measured notes |
| dBµV ↔ dBmV | Enter the voltage level and starting unit | dBmV = dBµV − 60; reverse adds 60. Same reference plane; no TP addback or µV/m field-strength conversion |

Practice **72 dBµV =12 dBmV**. This is a voltage-reference conversion, not dBm power, leakage field strength or proof of a measured level.

## Project records and closeout

**Where:** Job → Acceptance. **Practice:** Complete → Records; DSIM → findings; focused equipment guides.

### Identity, profiles and acceptance criteria

Record ticket/node/design revision, lead, meter/calibration, reference ID, reviewer, acceptance date, disposition and notes. Job ticket/node/lead are linked with the corresponding Details fields.

Select the actual profile and enter **installed equipment upper**, **planned upper**, **available spectrum**, return ceiling/forward floor, forward/return marker frequencies, design or receiver targets, level/tilt/ripple tolerances, minimum MER, network injection targets/tolerance, control/procedure and marker basis. Mark approval only when the operator's criteria are genuinely approved.

A profile's name/container is not proof of its entered operating limit. For Complete, the profile container is labelled 1002 while the actual entered hardware/planning upper is **1000 MHz** and live upper **860 MHz**. Forward comparisons check their hardware, planned/live limits and valid ordered markers. Return comparisons also reject overlapping return/forward passbands. Resolve the reported band issue before interpreting a within-limits result.

### Forward measurements

Use **Add** for a separate station/port/stage record. Enter date, node/station, profile, Before/After stage, **Planning or Measured** basis, measurement plane, actual low/high markers, raw readings, remaining addbacks, targets, ripple, trace/reference, trace-saved status, reviewer and notes. Forward rows also record model, MER, input pad/EQ, interstage trim and control system.

Read corrected low/high levels, tilt, target errors, tilt error, coverage and status. Planning data or unapproved/incomplete criteria cannot establish acceptance. A few passing markers do not certify the full trace, all frequencies or physical alignment.

### Return measurements and injection setting

Return rows are for an **injected return test with a verified absolute receiver plane**. Enter the common station/stage/plane data plus injected low/high network levels, existing pad, ingress check, EQ and injection source. Referenced DOCSIS return sweepless belongs in Sweep setup, in matching dB units; do not disguise it as an absolute receiver record.

The estimated pad follows the entered receiver error and existing pad. A negative estimate calls for gain/path review; it is not silently changed to zero. Keep the separate **38 dBmV return TX reference** distinct from the chosen receiver targets and network injection levels.

The Records **Return injection setting** helper uses desired network-plane injection plus **remaining uncompensated coupling and lead** for a manual-setting estimate. Practice **40 + 20 + 1 = 61 dBmV** as form arithmetic only. This does not establish an ONX limit, physical output with compensation enabled, or a setting for the 42 MHz Return Sweepless Sweep method. The 204 Sweep setup physical-output budget uses total physical losses and has a different purpose.

### Repairs, DSIM and record management

| Function | Inputs and use | Output and limit |
| --- | --- | --- |
| Repairs / punch list | Item, station/port, category, finding, action, owner, due/repair dates, retest, status and reviewer | Closed without required repair/retest/reviewer information remains incomplete |
| GainMaker / ACI DSIM record | Exact station/module/revision, plant/route, modes, pilot/type/lock, fallback, temperature, S1/pad/backoff/TGC, final verification and technician confirmation | Checks completeness/consistency and actual calendar dates for the supported DSIM-SG review; impossible imported dates remain invalid without rewriting the saved value. This is not a universal GaN/AOI/DSIM-A setup procedure |
| Add / remove record | Add a row or remove the intended record using the controls shown | Enter and review the actual identity, stage and measurement plane for each row |
| Suggest trace filename | Use the button on a forward/return row to generate a suggested name | Fills the trace reference and sets trace-saved status to **No**. It does not create, save or attach a meter file |
| Export section CSV | Export forward, return, punch or DSIM rows with their computed/status fields | Section report only, not the full project or original evidence |
| Summary and disposition | Read total records, After rows within entered limits and open/incomplete repairs | Reviewer disposition remains an explicit decision; no software calculation certifies the plant |

The synthetic DSIM form in Complete is a separate form exercise. Use the dedicated DSIM job for its matching setup path and preserve the exact revision conflict. A completed setup record remains separate from forward/return acceptance.

## Run sheet, exports and full backups

**Where:** Job → Run sheet; Files menu; relevant calculator/record task. **Practice:** Complete → Run sheet and exports / Backup.

Run sheet combines job/work-order context, selected frequency, source/model/split/limits, RF predictions, entered meter comparisons, as-built notes, field work, equipment/sweep setup and available-carrier estimates. Review its synthetic/sample warnings and missing values before sharing.

| Output/function | Where and use | What it preserves |
| --- | --- | --- |
| Print run sheet | Run sheet → Print | Printable field summary/PDF via device print service; actual pagination is device-dependent |
| Share | Run sheet → Share | Text through Android/browser share where supported, or the available prepared-file/download fallback; choose a recipient/app yourself |
| Export sheet CSV | Run sheet | Reviewable summary with context; not a full backup |
| Export RF levels | Files | Route predictions at listed frequencies; unavailable results blank |
| Export frequency results | Test → Frequency | Single-path inputs, frequencies, units, flags and results |
| Export power load | Power → Load | Power topology, loads, per-section results and qualifications |
| Record CSVs | Job → Acceptance | The selected section's entered rows and computed review fields |
| Export setup notes | Test → Meter setup | Setup drafts, guide/context and saved station snapshots |
| Save original | Job → ONX files | Exact original attachment bytes |
| Back up project | Files or Home | Full supported route, power, job, records, field/setup drafts, training state and original evidence |
| Open project / recover backup | Files, Home or ONX project shortcut | Validates and restores the entire supported project; verify route and originals after opening |

**Your file is ready** means bytes are prepared. Choose **Save/share file** or **Download file** when offered, complete the phone's final save action, then confirm the result in Files/Downloads or the chosen destination. Cancellation is not a completed export. A PDF, screenshot, CSV, named job or prepared-file message is not a full external backup.

For a recovery rehearsal: export Complete, verify the JSON exists outside NightSweep, reopen it, confirm the job, route, power, records, practice progress and all six originals, then return to the protected real job. Keep independent backups before updates, uninstalling, clearing storage or moving among app/browser stores.

## Offline use, updates and Help

**Where:** browser Home → NightSweep on this device; header/Home → Help. **Practice:** Complete for backup; Custom curves → Help; any loaded exercise for an offline calculation check.

| Function | Use | Result and limit |
| --- | --- | --- |
| Ready for offline use | Wait for the installed browser shell to report readiness | Confirms required cached shell availability; a visible online page alone is insufficient |
| Install app | Use the browser's offered prompt where supported | Optional Home Screen installation; full phone-specific steps are in the separate installation guide |
| Retry offline setup | Retry the reported failed shell preparation while online | Does not require clearing job storage |
| Check for updates | Look for a newer hosted release | Does not automatically replace the running app |
| Install update → Reload app | Export current work, apply the offered update, then reload when ready | User-controlled update sequence; check version and saved jobs afterward |
| Protect local storage | Request persistence where supported | Best effort, not a backup or protection from device/browser clearing/uninstall |
| Keep your work safe | Review local storage guidance/status | Helps identify the active store; no cloud sync or cross-browser sharing is added |
| Help task shortcuts | Choose the matching task from Help | Opens the existing live screen |
| Methods and limits | Read equations, assumptions, terminology and unavailable-data behavior | Explains interpretation; source links need connectivity |
| Run build self-check | Run bundled reference cases and read status | Checks those build cases; a pass is not physical device or plant certification. A failure warns against trusting results |

Once ready, the installed browser app can reopen its cached shell and use bundled calculations/training offline. External manuals still need internet. The standalone HTML and native wrapper have different delivery/storage behavior; opening a local HTML file does not establish browser PWA installation or reliable local-file storage.

Detailed Android/iOS installation, compatible Preview update precautions and APK verification are documented in the separate [installation guide](NightSweep_1.8_Alpha_Android_iOS_Installation.md).

## Checked example answers

These are reference answers for the unchanged **synthetic** examples. Restore a baseline before comparing. They do not establish field acceptance or manufacturer settings.

| Exercise/function | Inputs | Checked answer |
| --- | --- | --- |
| Complete launch | 54/860 MHz, raw 11/23 dBmV, remaining TP 20 dB | 31/43 dBmV |
| Gain helper | 54 MHz, input 7.1/output 16.1 dBmV, +20 dB each | Corrected 27.1/36.1 dBmV; net gain 9 dB |
| Complete A1 output | Entered route and 9/18 dB gain anchors | About 36.94/47.61 dBmV at 54/860 MHz |
| Complete A2 output | Entered route and 54/550/860 MHz gain table | About 40.55/45.62 dBmV at 54/860 MHz |
| Complete EOL Tap C | Entered mixed-brand route | About 14.01/4.94 dBmV at 54/860 MHz |
| Complete drop loss | 75 ft custom RG-6, rates 1.8/6.2 dB per 100 ft plus custom 4 dB | Cable 1.35/4.65 dB; total 5.35/8.65 dB at 54/860 MHz |
| Complete TDR | A2 origin 1700 ft; displayed 295 ft; lead 25 ft; equal VF 0.87 | Path 270 ft; coordinate 1970 ft; 160 ft into r5's 310 ft span |
| Complete frequency checker | 860 MHz; 200 ft × 2.2 dB/100 ft + 1.4 dB; 43 dBmV launch | Loss 5.8 dB; receive 37.2 dBmV |
| Complete power | 90 V / 15 A; synthetic 0.75/0.60/0.45 A loads; 20 W / PF 0.9 branch | 2.047 A; 13.65% loading; minimum 88.83 V at A2 |
| Complete power trial | Add 300 ft P3 .625 and 0.75 A after A2 | 2.798 A; 18.65%; 87.37 V at new load |
| Six serial AOI actives | Each incoming 300 ft custom span loses 3/9 dB; each entered net gain restores 3/9 dB | All six marker outputs 34/46 dBmV at 261/993 MHz; source node excluded from six-active count |
| Custom reverse TDR | 100 ft displayed, actual VF 0.88/meter VF 0.80, lead 25 ft; reverse from 200 ft | Path 85 ft; route coordinate 115 ft |
| Voltage unit converter | 72 dBµV | 12 dBmV, same plane |
| Separate Records injection arithmetic | Desired 40 + remaining coupling 20 + remaining lead 1 | 61 dBmV manual-setting estimate; not automatically ONX Injection |

The fresh independent complete-workflow audit compares actual application values with Wolfram references, including baseline/trial power and the explicit custom drop. Retained evidence lives with the release under `research/alpha18/`. Arithmetic agreement checks the supplied assumptions and inputs; it does not verify installed equipment, waveform, actual losses or phone behavior.

## 41-feature coverage index

This index follows the feature choices in the app. Choose the same label in Home's feature index to load the matching seeded practice. Sections above also cover controls that share one indexed feature, such as export buttons and station history.

| # | Feature choice | Reference section | Loadable exercise |
| ---: | --- | --- | --- |
| 1 | Home, practice and backup <!-- feature:home --> | [Header and Home](#header-and-home-controls) | Complete |
| 2 | Help, methods and build self-check <!-- feature:help --> | [Offline and Help](#offline-use-updates-and-help) | Custom curves |
| 3 | Launch, source, correction and temperature <!-- feature:setup --> | [RF setup](#rf-setup-and-launch-source) | Complete |
| 4 | Route, branches and distances <!-- feature:route --> | [Cable route](#cable-route-branches-and-point-tools) | Complete |
| 5 | Amplifier gain and reserve <!-- feature:gain --> | [Gain](#amplifier-gain-and-test-point-helper) | Complete |
| 6 | Installed equipment and exact manuals <!-- feature:equipmentSetup --> | [Equipment setup](#installed-equipment-manuals-and-control-paths) | Complete |
| 7 | Equipment catalog and source references <!-- feature:parts --> | [Catalog](#equipment-catalog) | Complete |
| 8 | Forward and return setup <!-- feature:sweepSetup --> | [Sweep setup](#forward-and-return-sweep-setup) | Complete |
| 9 | Forward TDR and active boundaries <!-- feature:tdr --> | [TDR](#tdr-distance-locator) | Complete |
| 10 | Absolute, normalized and loss charts <!-- feature:sweep --> | [Predicted sweep](#predicted-sweep-and-output-table) | Complete |
| 11 | Single-path frequency calculator <!-- feature:frequency --> | [Frequency](#single-path-frequency-checker) | Complete |
| 12 | Meter readings and prediction error <!-- feature:readings --> | [Readings](#meter-readings-and-prediction-error) | Complete |
| 13 | Cable, tap and target references <!-- feature:references --> | [References](#field-references-and-target-conversions) | Complete |
| 14 | Power load, voltage and branches <!-- feature:power --> | [Power](#power-supply-load) | Complete |
| 15 | Power what-if and Keep <!-- feature:trial --> | [What-if](#power-what-if) | Complete |
| 16 | Named jobs and work-order details <!-- feature:projects --> | [Job details](#job-details-and-named-jobs) | Complete |
| 17 | Original files and supported CSV <!-- feature:evidence --> | [Evidence](#onx-files-original-evidence-and-comparisons) | Complete |
| 18 | Leakage, maintenance and conversion <!-- feature:checklists --> | [Checklists](#field-checklists-and-unit-conversion) | Complete |
| 19 | Forward, return, punch and review <!-- feature:records --> | [Records](#project-records-and-closeout) | Complete |
| 20 | Run sheet, share, print and CSV exports <!-- feature:runsheet --> | [Exports](#run-sheet-exports-and-full-backups) | Complete |
| 21 | Six serial active devices <!-- feature:six-active-cascade --> | [Practice library](#practice-library-and-example-selection), [checked answers](#checked-example-answers) | Six actives |
| 22 | Entered amplifier gain table <!-- feature:gain-table --> | [Gain](#amplifier-gain-and-test-point-helper) | Six actives |
| 23 | Derive gain from two corrected readings <!-- feature:gain-test-points --> | [Gain helper](#amplifier-gain-and-test-point-helper) | Complete |
| 24 | Tap faces and RG-6 drop splitter <!-- feature:tap-drop --> | [Point tools](#cable-route-branches-and-point-tools) | Complete; explicit custom loss |
| 25 | Map note and step-by-step arithmetic <!-- feature:map-arithmetic --> | [Point tools](#cable-route-branches-and-point-tools) | Custom curves |
| 26 | Custom cable and passive loss tables <!-- feature:custom-tables --> | [Cable route](#cable-route-branches-and-point-tools) | Custom curves |
| 27 | Manual source and launch table <!-- feature:launch-table --> | [RF setup](#rf-setup-and-launch-source) | Custom curves |
| 28 | Reverse TDR and velocity correction <!-- feature:reverse-tdr --> | [TDR](#tdr-distance-locator) | Custom curves |
| 29 | Available carriers and local targets <!-- feature:available-carriers --> | [References](#field-references-and-target-conversions) | DSIM |
| 30 | OEM AGC installed control path <!-- feature:oem-agc --> | [Equipment controls](#installed-equipment-manuals-and-control-paths) | OEM AGC |
| 31 | DSIM and historical pilot-code lookup <!-- feature:dsim-pilot --> | [Equipment controls](#installed-equipment-manuals-and-control-paths) | DSIM |
| 32 | Manual / thermal installed control path <!-- feature:manual-thermal --> | [Equipment controls](#installed-equipment-manuals-and-control-paths) | Manual / thermal |
| 33 | Conventional GS7K procedure <!-- feature:gs7k-setup --> | [Equipment controls](#installed-equipment-manuals-and-control-paths) | GS7K node |
| 34 | dBµV ↔ dBmV conversion <!-- feature:db-units --> | [Unit conversion](#field-checklists-and-unit-conversion) | Complete |
| 35 | Return injection and receiver records <!-- feature:return-injection --> | [Records](#project-records-and-closeout), [sweep setup](#forward-and-return-sweep-setup) | Complete |
| 36 | Before / after evidence comparison <!-- feature:evidence-comparison --> | [Evidence](#onx-files-original-evidence-and-comparisons) | Complete |
| 37 | Portable backup and recovery <!-- feature:backup-roundtrip --> | [Full backups](#run-sheet-exports-and-full-backups) | Complete |
| 38 | Field calculators and source tags <!-- feature:calculators --> | [Field calculators](#field-calculators) | Custom curves (2.0 Alpha build 3) |
| 39 | Limits, labels and sources <!-- feature:limits --> | [Limits and sources](#limits-and-sources) | Custom curves (2.0 Alpha build 3) |
| 40 | DOCSIS health card <!-- feature:docsisHealth --> | [DOCSIS health card](#docsis-health-card) | Custom curves (2.0 Alpha build 3) |
| 41 | Leakage limits, CLI and leak log <!-- feature:leakage --> | [Leakage](#leakage) | Custom curves (2.0 Alpha build 3) |

## Known limits and unresolved information

Exact installed **GainMaker GaN control/commissioning**, **Quantum18 LE/BA I&O**, **EN9000/RFAM/RPD commissioning**, and some **DSIM-A/module-specific** procedures remain documentation gaps. Preserve them as unresolved; another model's manual is not a substitute. Original manuals, actual firmware/options, approved pilots, physical measurement planes, actual available carriers and operator criteria require job-specific confirmation.

NightSweep does not connect to, program or configure ONX, nodes, amplifiers, DSIM or XPERTrak. Unsupported meter formats remain originals; no OCR or automatic reading extraction is added. No source table, synthetic file, checklist, software status or reference calculation establishes installed RF acceptance.

Automated checks, independent arithmetic and desktop mobile-viewport testing do not establish physical Android/iPhone installation, WebView/Safari retention, native save/share/print behavior, touch/rotation, storage eviction or actual quota exhaustion. Preserve external backups and separately verify the phone and plant used for field work.
