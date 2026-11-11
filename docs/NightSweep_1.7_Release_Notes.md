# NightSweep 1.7 Alpha — Release notes

Spencer Williams · Updated November 11, 2026

## Build 22 — training and retained evidence

- Fleet training now uses Vecima EN9000 with AOI at 204/258 MHz. GS7K, GainMaker OEM AGC and GainMaker/DSIM practice remain 42/54. The complete exercise starts in the 204 sweep workflow and contains 21 steps. Existing saved jobs are unchanged.
- Open step reveals its destination controls; training failures are shown beside the practice buttons. A storage or verification failure preserves the working job.
- Evidence cleanup validates named-job attachment references before deleting unused bytes. Damaged references stop cleanup, protecting originals.
- A blocked IndexedDB open that eventually succeeds closes its abandoned connection; unexpectedly closed connections are invalidated so import/export can retry. Writes continue to wait for transaction completion before attaching metadata.
- Added corruption/capacity, database-failure and production training-control regressions. Final executed totals and release hashes are in the release validation record; physical phone testing remains outstanding.


## Field workflow

- **Route → Setup** identifies the launch as a node, amplifier/LE output or other manual source. Choose exact hardware, split and RF leg, then enter actual job levels and only remaining test-point compensation. The source feeds the first span directly; selecting its identity preserves entered levels.
- **GS7000 / GS7K setup** is reached through **Route → Setup → Node output → exact model → Source setup & manual**, or by selecting the launch source under **Route → Equipment setup**. Standard 1 GHz and 1.2 GHz guides distinguish optical receiver padding, OIB/port pads, path EQs and return routing. LCM module discovery is separate from RF balancing.
- **Source setup & manual** opens **Route → Equipment setup** for that station. Continue through cable route, forward/return sweep, readings and evidence using contextual actions.
- GainMaker setup asks for **Installed gain control**: **OEM GainMaker AGC**, **ACI DSIM**, or **Manual / thermal control**. Choose the complete **Documented setup method** for the exact station before adjustments. OEM **Manual backoff → OEM AGC** and **Thermal setup → OEM AGC** remain separate alternatives.
- Applicable historical 1 GHz GaAs HGD/HGBT/LGD OEM AGC uses corrected MAIN-output pilot dBmV minus 34 dB; applicable 1 GHz AGC LE uses output-pilot minus 29 dB. Exact detector/pilot convention and measurement plane must match. No QAM detector offset was verified; a −6 dB distortion-loading convention is not an AGC correction. DSIM pad rules remain separate.
- Thermal-only methods distinguish amplifier-only and amplifier-plus-coax compensation. Manual LE has no Bode/S1 operating-mode choice. Exact installed GaN HGD setup remains a documentation hold.
- AOI HGD/HGBT guidance follows saved downstream profile → DS Auto → optional DS Manual → upstream alignment from the last amplifier → ALSC after both paths. It is not assigned to Quantum18 LE or BA.
- Reviewed steps and station notes are job records tied to their equipment/manual/control context. Checkmarks do not establish RF acceptance or change physical equipment.

## Four practice choices

| Home action | Exercise | Steps | Supplied original files |
| --- | --- | ---: | ---: |
| **Open complete training job** | AOI 204/258 MHz branched route, Vecima EN9000 launch, power, gain, TDR, readings, records and backup | 21 | 6 synthetic originals: 5 CSVs + 1 SVG diagram |
| **Open GainMaker OEM AGC practice** | Separate 42/54 MHz HGD launch and downstream LE; fitted OEM pilot/detector deliberately unspecified | 8 | 0 |
| **Open GainMaker / DSIM practice** | Separate 42/54 MHz HGD launch and downstream LE; historical pilot-code exercise, incomplete physical verification | 9 | 0 |
| **Open GS7K node practice** | Standard GS7000 1.2 GHz / 42/54 starter; levels and TP correction unverified, no RF route or captured traces | 10 | 0 |

GS7K practice guides exact-model selection, receiver/routing identification, standard forward pad/EQ setup, return handoff, sweep plan, records and backup. Current launch Equipment setup supports standard 1 GHz/1.2 GHz; SHO/Intelligent/Fiber Deep/RPD material remains variant-specific source references, not added setup selectors. No automatic physical RF alignment is performed.

Opening/resetting practice preserves the previous working copy in named jobs; export a full project for an external backup. Focused jobs contain no fabricated meter captures. All examples retain synthetic labels after editing/export. Practice measurements stay synthetic; explicitly labeled user-local design references remain separate from readings, manufacturer specifications and field acceptance.

## User-local lower-split design references

The user’s non-high-split forward references are **31 dBmV at 54 MHz** and **43 dBmV at 860 MHz**, with a separate **38 dBmV return TX reference**. Confirm actual signal/channel-power convention, transmitter and measurement plane. These are local operating references, not manufacturer limits, return injection or CMTS/receiver targets.

**38 dBmV denotes level, not MHz.** Return TX channels/frequencies and the service/sweep plan remain blank until a verified operator plan supplies them. Forward anchors, an approved installed-detector AGC pilot and manufacturer manual-backoff test frequency are distinct. No universal 711 MHz DSIM pilot or 303 MHz OEM pilot is assigned.

Setup-frequency guidance distinguishes local 54/860 anchors from OEM manual-backoff chart columns **445.25/547.25/870/1000 MHz**, DSIM-SG Rev H **547/750/870 MHz** backoff references, approved detector pilots and return-plan frequencies. It supplies no automatic 860→870 chart substitution. 54 MHz is outside LGD 65/86 and every catalog Quantum18 forward band.

The optional **Test → References → Your local non-high-split targets** action confirms changes to the selected eligible design profile and separate 42 MHz TX reference. Measured Route Setup frequencies/readings and existing records are preserved; criteria remain unapproved. Profiles with return ceiling ≥204 MHz or a downstream passband excluding 54 MHz are blocked. **42/54 Sweep setup** stores **Operator return TX reference (dBmV)** and **Return TX frequencies / service plan** separately and adds no return-generator calculation. Equipment setup’s read-only **Setup frequencies & job levels** card shows selected-profile anchors/levels, TX reference/plan and pilot context without treating them as measurements.

OEM/DSIM examples use synthetic raw **11 / 23 dBmV +20 dB once = 31 / 43 dBmV at 54 / 860 MHz**. GS7K design carries these local anchors and TX reference while actual source markers/readings/TP coupling stay blank. The complete AOI high-split example remains **261 / 993 MHz, 34 / 46 dBmV**, with all six synthetic originals.

### Available-carrier setup targets

**Test → References → Setup targets at available carriers** accepts **Available low/high carrier (MHz)** and a **Target curve**, with **57/753 MHz** and **63/550 MHz** as draft examples. It estimates levels from the unchanged **31 dBmV@54 MHz / 43 dBmV@860 MHz** anchors using square-root frequency by default or linear MHz when required by the local procedure. Endpoints/channel centers do not become new 31/43 anchors. The selected curve is a labeled estimate, not an operator-approved tilt shape.

| Confirmed setup-frequency example | Square-root estimate: low / high (dBmV) | Linear-MHz estimate: low / high (dBmV) |
| --- | ---: | ---: |
| 57 / 753 MHz | **31.11 / 41.97** | 31.04 / 41.41 |
| 63 / 550 MHz | **31.32 / 39.79** | 31.13 / 38.38 |

Fresh Wolfram references independently verified these interpolation values and the original 31/43 endpoints. These are calculated estimates, with no installed-equipment confirmation. Evidence is `night-sweep/research/alpha17-setup-frequency-wolfram.json`.

Equipment setup presents computed carrier targets separately from the profile base. Full backups retain the conversion draft; Run-sheet HTML/text/CSV exports include carrier frequencies, estimated levels, curve/base and a non-acceptance qualification. Measurements are never filled silently.

The converter requires **54 ≤ low < high ≤ 860 MHz**, a compatible non-high-split profile/hardware and compliance with any known entered live-spectrum upper limit. It never extrapolates; blank coverage remains unverified. The tool preserves base design, measured launch and records. Confirm actual carrier centers, power convention and measurement plane, then compare the frequency-specific target using only remaining TP correction once. Focused OEM/DSIM/GS7K guides include this conversion step; their step counts and the complete high-split example remain unchanged.

## ACI DSIM pilot lookup

The offline lookup uses the user-supplied **ACI iPhone/iPad Pilot Channel Code Guide, Rev A, pp2–5**: 86 literal rows, channels 52–94 and 100–142. Match channel, Analog/Digital type and MHz, then copy an eligible exact entry. Examples: digital channel 110/711 MHz `@@?<A`, channel 88/609 MHz `GG<A`, and channel 64/465 MHz `EC<A`.

No codes are fabricated for channels 95–99 or 303 MHz. Channel 100's printed 649.25/651 MHz and `HD<@`/`HD<A` values remain a source exception, with copying blocked until confirmed. Lookup/copying does not mark pilot lock or verification. Clipboard denial/unavailability retains a selectable-code fallback.

An eight-step SG Rev G/H physical-controller checklist now covers manual preparation, temperature adjustment, fallback selection, pilot alignment and final verification. ACI app Rev B attenuation controls are described separately; raw positions are not dB. Installed control and documented method travel with saved jobs and reports.

Historical SG Rev E uses 10 dB pad for LE and 6 dB for its applicable HGD; Rev H uses 0 dB. Match the full installed-revision procedure. Historical DSIM-A Rev T is not automatically assigned to the later 1218 MHz variant. Supply-voltage and exact compatibility gaps remain explicit. The code table is not a universal supervisor password or hardware/firmware approval.

## Equipment accuracy and documentation

- **556 current selection records:** 514 RF (23 active + 491 nonactive), 17 cables, 22 power and 3 nodes. Five UBT records remain only for legacy saved jobs; current pickers/workflows exclude them. HGBT and passive unbalanced three-way outputs remain current.
- All-entry structural/provenance checks cover the full retained inventory: 1,324 loss/current curves and 14,126 rows, plus eight companion watt tables. Every selection has a per-ID documentation inventory. This is not independent retranscription of every inherited manufacturer cell.
- Fresh exact-source checks matched 120 GS7000 current/watt cells and 72 archived Scientific-Atlanta mainline maximum-loss cells. Nonshared passive-band upper endpoints remain available; only 21 explicitly marked SA Multimedia curves use the qualified larger-adjacent bound across printed fractional gaps. Arbitrary missing data remains unavailable.
- Refreshed GS7000 guides distinguish standard, SHO/Fiber Deep and Intelligent setup. Conventional LCM Auto Set-Up is module discovery; Intelligent LCS Auto Setup adjusts forward OIB drive after saved targets/Port 1 enablement and does not align return.
- The newest public EN9000 family brief located is **September 2026**. ERM3-conditioned RF performance and separate ERM3/ERM4 capabilities require installed-module confirmation. Test-point coupling remains sourced to May 2024. The 180 W PSU output and 200 W thermal quantities do not define typical AC consumption.
- AOI's original SA guide URL returned HTTP 404. The labeled **V02102025 historical manufacturer-authored mirror** is used; latest-issued applicability still requires manufacturer confirmation. Exact Quantum18 LE/BA I&O and EN9000/RFAM/RPD commissioning manuals remain access gaps.

## Files and platforms

The release name remains **1.7 Alpha**; Android's launcher label is **NightSweep 1.7 Preview**, version code **22**, with the same Preview package identity. The APK is an Android sideload package; Android browser and iPhone Safari/Home Screen use the browser app. There is no native iOS installer.

The coworker package includes **NightSweep_1.7_Alpha_Training_Job.json**, **NightSweep_1.7_GainMaker_OEM_AGC_Practice.json**, **NightSweep_1.7_GainMaker_DSIM_Practice.json**, and **NightSweep_1.7_GS7K_Practice.json**. Older bundled examples are excluded; no automatic saved-job deletion is added. Standalone NightSweep.html, phone installation guides, saved jobs, imports, original evidence, reports and full project backups remain supported. APK, Chrome and Safari/Home Screen storage are separate; no automatic cloud sync is added. Export working jobs before updates and verify saved work and offline readiness afterward.

The 42/54 MHz workflow remains forward **Sweepless Sweep + Return Sweepless Sweep**. The 204/258 MHz workflow remains forward **Sweepless Sweep + XPERTrak return sweep**. Instrument support, firmware, licensing, references and local approved procedures must match. AOI's manual instrument sequence does not replace the local return-sweep method.

## Verification and limits

A fresh Wolfram evaluator run returned **15 named synthetic reference results**. **18 current-app numerical/rejection comparisons passed** within the recorded tolerance. Inputs, returned reference values and comparisons are retained in `night-sweep/research/alpha17-numerical-audit.md` and adjacent files. The earlier 1.6 mathematical audit remains historical supporting evidence.

Context7/MDN documentation was reviewed for clipboard user activation/fallback and storage quotas/eviction. This is a platform-documentation review, not physical Safari/WebView testing. Current integrated QA, browser, APK signature/package, alignment and release-packaging results must be read from the **actual release-validation record**; earlier build counts are not presented as current results.

No physical Android/iPhone or plant validation is claimed by this documentation. NightSweep does not connect to or configure ONX, DSIM, amplifiers, nodes or XPERTrak. Calculations and checklists do not establish equipment alignment, pilot lock or field acceptance. External original manuals need a connection; offline summaries are not full manuals. Exact module identity, firmware, measurement planes, operator targets and unresolved manual gaps require job-specific confirmation.
