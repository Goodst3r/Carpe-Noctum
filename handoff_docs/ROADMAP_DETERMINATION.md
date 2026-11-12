# Roadmap determination: Carpe Noctum after build 3

November 12, 2026 · written by Claude for Spencer, Grok and ChatGPT · docs only, no app change **Nov 12 night note:** who does what and the work queue are now in `handoff_docs/WORKFLOW.md`. Spencer moved the calculators (P0-4, P0-5 conversion/composite margin, cascade) ahead of NAV-1 for tonight; ChatGPT now builds headroom as well as checking math; the order below resumes afterwards.

This is the final call on `Carpe_Noctum_Roadmap.pdf` (Grok's synthesis, pinned to `f467e52`). It says what to keep, change or defer, in what order, and what has to be checked first. The starting prompts are in `handoff_docs/PROMPTS.md`.

## Revision 2: after ChatGPT's critique (Nov 12)

ChatGPT's critique (`handoff_docs/reviews/chatgpt-roadmap-critique.md`, branch `chatgpt/roadmap-critique`, commit `69c2c62`, read against `build3` `b4cb832`) found real errors in revision 1. I spot-checked the main ones on `b4cb832` myself (Test tab count, the existing headroom card, `hfc-named-jobs-v1`, the bonding entry, the ripple-width label) and they hold. The rest is ChatGPT's reading, not re-verified by me. Changes, folded into the sections below:

1. **Re-pin:** `build3` is now `b4cb832` (Fiber #15 and High split #16 merged). 32 screens, 50 features, 127 registry rows; Test has 13 tabs (ChatGPT's counts).
2. **There is already an upstream transmit headroom card** in DOCSIS health (`docsis-health.js` around line 86). Revision 1 missed it. Its number is composite margin to Pmax, not per-channel headroom. Fixing its wording is now the first P0 item.
3. **The 1.6 to 6.4 MHz conversion already exists** in the OFDM power calculator. No new converter.
4. **Storage list was incomplete:** add the named-job library `hfc-named-jobs-v1`. The evidence store `nightsweep-evidence-v1` is an IndexedDB database, not a localStorage value.
5. **A project backup is the working job only.** The other named jobs and device settings (DOCSIS windows, leak notebook, Safety, Outage) are outside it; the open job's original attachments are included. The phone check now starts with backing up every job and writing down device settings.
6. **Help (`help`) was missing from the screen map.** It stays in the header.
7. **Checklists is not a repair tracker.** It has five fixed maintenance entries with done and notes. A grounding/bonding check already exists there.
8. **No backup or export time is stored.** A "last backup" line must never claim a file was saved just because an export started.
9. **P0 order changed** to follow the evidence: record reliability first, calculators later.
10. **New defect:** the standing-wave search width (±10%) in `thresholds.js` is labeled Expert but is the app's own choice, so it should be Unknown.
11. **#18 and #19 hosted CI were failing** on their last checked heads.

The original `Carpe_Noctum_Roadmap.pdf` is now in `handoff_docs/` so ChatGPT can check it.

This file was written in a claude.ai session running Fable 5.2, not Sonnet 5.5 at medium effort as the working agreement asks. Spencer picks the model when he starts a session; an assistant cannot switch itself.

## Who does what

| Assistant | Job | Writes app code? |
| --- | --- | --- |
| Grok | Holds the pinned `build3` commit and the verified facts, enforces the rules, turns decisions into one plain direction. Heavy lifter. | Yes. One writer per branch. |
| ChatGPT (GPT-6.1 Sol Ultra) | Evidence and technical critique: factual conflicts, calculator math, ranking against public evidence, real-phone check list. | No. Does not change navigation. |
| Claude | Final determination (this file), then debugging and review. Sonnet 5.5 medium first; Opus 5.5 if an issue spans files or keeps failing; Fable 5.2 only if both miss it. | Only fixes for a reported defect, on its own branch. |

"Grok writes the feature branches" is my reading of "heavy lifter". Spencer, say so if you want a different writer.

## What I checked, and against which commit

*Revision 1 history.* This table describes `build3` at `e7313cf`. Current facts are in the Revision 2 list above: `b4cb832`, 13 Test tabs, #15 and #16 merged.

Read-only, on `origin/build3` = `e7313cf6dd5702a7263160d4f56ab2ba373fbaf4` (fetched Nov 12). I read `night-sweep/workflow.js`, the header and bottom bar in `night-sweep/shell.html`, the storage keys, `handoff_docs/FINAL_HANDOFF.md`, `KNOWN_GAPS.md`, `lanes/grok-status.md` and the open pull request list. I ran no tests for this file.

| Roadmap or pinned fact | Live repository at `e7313cf` | Result |
| --- | --- | --- |
| Pinned to `f467e52` | `build3` has moved: close-out #24 and Impairments #13 are merged | **Stale pin. Re-pin before any branch work.** |
| 29 screens, 47 features | Counted by Grok at `f467e52`. Impairments has merged since. | Not re-verified. Recount. |
| Test has 10 tabs | 11: Meter setup, TDR, Predicted levels, Frequency, Readings, References, Calculators, Limits, DOCSIS health, Leakage, Impairments | 10 was right at `f467e52`. Now 11. |
| Files and Help already in the header | Files is a header menu. Help is the "Help & methods" button inside that menu. | Confirmed, with that detail. |
| Power has two screens | Load and What-if | Confirmed. |
| Station and Readings hold different measurements | Station: balance and sweep at an installed active. Readings: a meter reading at a route point against the predicted level. | Confirmed from the screen definitions. I did not read both modules' data models. |
| Stretch pull requests open | #15 Fiber, #16 High split, #18 Why cards, #19 Proof of performance, #20 Study (base is `claude/b20-pop`, not `build3`). All draft. All add a Test tab. | Confirmed. Test would reach 16 tabs. |
| (not in the roadmap) | The bottom bar already has five tabs: Home, Route, Test, Power, Job. Route has 6 sub-screens, Job has 9. | The change is a regroup, not a cut from seven tabs to five. |
| (not in the roadmap) | The working job is stored under `hfc-route-v1` and the named-job library under `hfc-named-jobs-v1`. Device-local keys: `nightsweep-docsis-windows-v1`, `-leakage-v1`, `-outage-v1`, `-safety-v1`, `-theme-v1`, plus recovery side keys. Evidence is the IndexedDB database `nightsweep-evidence-v1`. | These names must not change. (Named-job key and IndexedDB detail added in revision 2.) |
| (not in the roadmap) | #25 (draft) names the Arcom Digital QS-NAVPLUS-OUDP as the only leak detector. | Spencer's instruction, Nov 11. |
| P0 list | The roadmap PDF has six P0 items. "Evidence handoff" was in Spencer's message, not in the PDF. | Undefined item. See P0-7. |

Two things in my own Nov 11 layout review were wrong and are withdrawn: moving Files and Help to a menu (they are already there), and folding Readings into Station (they hold different measurements).

## Rules that every item below must meet

Offline only. No customer names, addresses, account numbers or modem MACs. Company targets, tolerances and pilot codes start Unknown and stay editable; blank is never zero. 42/54 and 204/258 stay separate. Existing storage keys and the job file format do not change; saved-job changes are additive only and old jobs and backups must open and round-trip. Every new limit or formula gets a label, a source and a registry row in `night-sweep/thresholds.js`. Every new formula gets an independent reference calculation. No version change, no APK, no signing.

## Order of work

1. **Before any branch work:** the checks in "Re-check first" below, and Spencer's acceptance of build 3 (D3 is one Grok run, not two lanes).
2. **Finish the stretch stack that is already in review** (#18, #19, #20; #15 and #16 merged as of revision 2) and #25 separately, one at a time, each with its own gate. Do not start A5 to A7 (items 14, 16, 12) yet.
3. **NAV-1: the navigation regroup.** One writer, one pull request, no features.
4. **P0 items**, in the order given under "P0 determination".
5. A5 to A7 and the medium-term items, placed in the new groups.

Why the stretch stack goes before navigation: Grok is already merging it, each pull request is small, and rebasing five reviewed pull requests onto a new tab layout costs more than moving five extra screen ids once. The cost is that Test grows to 16 tabs for a short time. Nobody outside Spencer uses the build in that window.

## Navigation determination

| Item | Call | Detail |
| --- | --- | --- |
| Five bottom tabs: Home, Plan, Field, Tools, Closeout | **Keep** | It is a regroup of today's five tabs. Keep the name Home; do not rename it Tonight. |
| Split Test into Field and Tools | **Keep** | This is the main point of the change. |
| Tools as one searchable list | **Keep** | No sub-tab row on Tools. Groups: Calculators, Limits and sources, Cards, Learn. |
| Fold Power into Plan | **Keep, changed** | Both screens move: Load and What-if. |
| Fold Readings into Station | **Drop** | Different measurements. Both stay, side by side in Field. |
| Move Files and Help to a menu | **Drop** | Already done. Leave the header alone. |
| Persistent context strip | **Keep, changed** | One strip, not a strip plus a separate plant banner. See P0-3. |
| Exact resume | **Keep, changed** | NAV-1 does not include it. See P0-8. |
| Safety first, Outage one tap from Home | **Keep** | Both become Home's sub-screens. Home has no sub-screens today, so check that `WorkflowUI` supports it. Not re-verified. |

Where each existing screen goes. Screen ids stay exactly as they are; only the group and the visible labels change.

| Group | Screens (id) |
| --- | --- |
| Home | Home (`home`), Safety (`safety`), Outage (`outage`) |
| Plan | Details (`projects`), Setup (`setup`), Cable route (`route`), Amp gain (`gain`), Amp / node setup (`equipmentSetup`), Predicted levels (`sweep`), Load (`power`), What-if (`trial`), Sweep due (`sweepDue`) |
| Field | Meter setup (`sweepSetup`), Station (`station`), Readings (`readings`), TDR (`tdr`), ONX files (`evidence`), Leakage (`leakage`), Checklists (`checklists`), Night log (`nightLog`) |
| Tools | Calculators (`calculators`), Limits (`limits`), References (`references`), Frequency (`frequency`), Catalog (`parts`), DOCSIS health (`docsisHealth`), Impairments (`impairments`), Fiber (`fiber`), High split (`highSplit`), and each remaining stretch screen as it merges (Why cards, Proof of performance, Study; record their real ids when they merge) |
| Closeout | Acceptance (`records`), Run sheet (`runsheet`) |
| Header (unchanged) | Help (`help`), inside the Files menu |

Plan has nine screens and Field has eight. That is still a long sub-tab row on a phone. NAV-1 must show how those two rows behave at 320 px, and if they wrap badly, Plan and Field get the same list treatment as Tools. Decide that from a rendered check and then a real phone, not from this table.

NAV-1 exit criteria, replacing the roadmap's list:

- No storage key, screen id or job-format change. Old jobs, 1.6 to 1.8 backups and build 3 jobs open with identical numbers.
- Every screen is reachable, and the practice steps, guides, `qa/ui-names.test.cjs`, the feature index and the screen and feature counts all use the new group names in the same pull request.
- Rendered layout at 320 to 430 px in the dark theme, and the full gate, by the writer and by one reviewer on the same head.
- No new feature, calculator, card or stored value in the same pull request.

## P0 determination

**Revision 2 build order** (replaces the order of the table below; the table's details still apply except where noted):

1. **Headroom wording fix (new, small).** Relabel the existing DOCSIS health headroom result as composite margin to the entered Pmax, for that reading. The label only fits when the entered reading is a real simultaneous total at the modem's F-connector; a per-channel status-page number does not become a total by renaming the result. Keep the 3.0 compatibility-mode caveat. Say what it cannot tell you (per-channel room, DRW, channel count and width). Say that a blank Pmax uses 65 dBmV, the specification's lowest allowed value in 3.1 operation; the blank field does not show the modem's real capability. No new math.
2. **Night log fixes, then the intermittent-ingress entry (P0-6).** Add Remove/Undo and stop blank entries using a slot first.
3. **Temporary-repair follow-up (P0-2)**, as structured entries next to the Checklists maintenance notes, with open or closed status.
4. **Tonight list (P0-1).** Show "Unknown: no recorded backup time" and "Unknown: no recorded handoff export time". No time is stored today, and that does not prove no backup happened.
5. **Context strip (P0-3).**
6. **Exact resume (P0-8)**, after the phone interruption checks.
7. **Power-sum calculator (P0-4)**, using ChatGPT's section 2 formulas, worked cases and refusal rules. No correlated add.
8. **Bandwidth conversion (P0-5):** no new feature. At most, also offer 6.4 MHz as a measured-in width so the reverse step is reachable.
9. **Leakage-method pointer (P0-3b):** High split has merged, but the Arcom manual and the company method are still missing. Stays deferred.
10. **Per-channel headroom tool:** deferred. It needs the transmit channel set, widths, DRW state and Pmax provenance (ChatGPT section 3). A company ceiling alone does not fix it.

Evidence handoff (P0-7) stays deferred until Spencer defines it.

Revision 1 table, in its original order:

| # | Item | Call | Detail |
| --- | --- | --- | --- |
| P0-3 | Plant banner | **Keep, changed.** First after NAV-1. | It becomes the context strip: job name, plant (42/54 GS7K/GainMaker or 204/258 Vecima/AOI), and the selected active or point. Show the measurement plane only on screens that already have a plane field (Station). Read-only, no stored value, not shown on Tools. |
| P0-3b | Leakage-method reminder | **Defer the method text.** | The only detector the app names is the Arcom Digital QS-NAVPLUS-OUDP (#25). The company's leakage method and tag settings start Unknown. Do not write OUDP or legacy-tag steps until the Arcom manual and the High split registry rows (#16) are in. A one-line pointer to Test → High split is fine once #16 merges. |
| P0-1 | Tonight open-items list | **Keep.** | Version 1 reads only what is already stored: Station stages not marked balanced or swept, and Sweep due. Add open temporary repairs when P0-2 lands. "Unexported night log" and "last backup" need a timestamp the app may not store today (not re-verified); if so, that is a new device-local key, never a job-format change. |
| P0-4 | Power-sum and composite-power calculator | **Keep.** | Three sums: uncorrelated add, N equal carriers, and signal-plus-noise minus noise. It must refuse a total that is not above the noise, and say why. Correlated (voltage) addition is left out of version 1. ChatGPT checks the formulas and edge cases before Grok builds. Registry rows and an independent reference are required. |
| P0-5 | Upstream headroom card | **Split.** Conversion now, headroom deferred. | The 1.6 to 6.4 MHz step is 10·log10(4) = 6.02 dB and belongs with the existing OFDM power calculator; do not build a second converter. The "headroom to a ceiling" part waits for two things: ChatGPT's check of the maximum transmit rules in the DOCSIS 3.1 PHY specification (they depend on channel count and width; rev. 2: open question 3 is a separate downstream question and is not a prerequisite here), and a company ceiling from Spencer's supervisor. |
| P0-6 | Intermittent-ingress record | **Keep, changed.** | An entry type in Job → Night log (conditions, time, what was tried, weather typed by hand), not a new screen or store. First fix the two Night log gaps in `KNOWN_GAPS.md`: no Remove or Undo for an entry, and a blank Add using one of the 200 slots. |
| P0-2 | Temporary-repair tracker | **Keep, changed.** | Read `night-sweep/field-work.js` first: Job → Checklists already holds repair notes (not re-verified what it stores). Extend that instead of building a second repair list. Station or span names only, no address field, additive job field. Spencer should tell his supervisor it is a personal reminder list, not the record. |
| P0-8 | Exact resume | **Keep, reduced.** | Return to the last screen and the selected active for the working job, from a new device-local key. Restoring scroll position and half-typed fields waits for the real-phone check; Station already retains typed input (#23). |
| P0-7 | Evidence handoff | **Defer until defined.** | It is not in the roadmap PDF. My working definition, for Spencer to confirm or replace: the shift handoff note lists which evidence exists for the job (file name, SHA-256, Station stage), and never includes file contents. Real meter files can carry identifiers and leave the phone only when the tech backs up or shares the job himself. |

## Medium-term and hold

| Item | Call | Detail |
| --- | --- | --- |
| Map symbol legend | Keep | The tech fills it in. Nothing copied from SCTE. The company legend may be internal. |
| Spectrum analyzer setup card | Keep, gated | Only from VIAVI ONX documentation that somebody has actually opened. Not re-verified. |
| Cascade noise and distortion calculator | Keep, narrowed (rev. 2) | Thermal noise / CNR only, with ChatGPT's section 4 assumptions. No CTB/CSO "plant health" number; the 10·log(N) CSO approximation is not generally reliable for short identical cascades (its source qualifies N under 10). |
| Bonding and grounding reminder | Already exists (rev. 2) | Checklists has a grounding/bonding check. Add context to it when item 16 is built; it is not a new feature. |
| Ripple search width label (new, rev. 2) | Fix | `thresholds.js` labels the ±10% standing-wave search width Expert. It is the app's own choice: label it Unknown. Small Grok fix with a test. |
| Generator pre-start checklist | Keep | Supervisor review, like the Outage card. |
| Photo attachments, battery runtime estimator, transponder alarm cards | Hold | As the roadmap says. |
| Anything needing a company target | Hold | Until Spencer supplies the value. |

## Conflicts to watch

- **Stretch pull requests and navigation** both edit the tab list in `workflow.js`, `shell.html`, `training.js`, the guides and `qa/run-pwa.py`. Hence the order above.
- **#20 (Study)** is based on `claude/b20-pop`, not `build3`. It needs retargeting after #19 merges, or it gets no hosted CI.
- **#25 (Arcom detector)** touches `leakage.js`, `outputs/` and `dist/`. Its generated files will conflict with every other merge; rebuild, never hand-merge.
- **A5 to A7** would add three more screens. They wait for NAV-1 so they are written once, in the right group.
- **Storage.** P0-1, P0-2 and P0-8 are the items that may need a new stored value. Each one must say in its pull request which key or additive job field it uses and prove an old job and backup still round-trip.
- **Pull requests #1 and #2** (old roadmap and build list into `main`) are still open. This file replaces the roadmap in #1 for planning purposes. Spencer decides whether to close them.

## Re-check first

On the live repository, by Grok, before any branch is cut:

1. Fetch and re-pin `origin/build3`. Record the commit, the standalone SHA-256 and your own gate counts.
2. Recount screens, features and registry rows on that commit, and the sub-screens per tab.
3. Confirm that screen ids are not stored in jobs or backups, so regrouping cannot break an old job. Not re-verified.
4. Confirm `WorkflowUI` can give Home sub-screens, and what `visibleIds` and the End-key navigation test assume about the last tab (`KNOWN_GAPS.md` mentions that test).
5. Read `field-work.js` and `night-log.js` and state exactly what each stores and where, before P0-2 and P0-6.
6. Check whether a backup time and a night-log export time are stored anywhere, before P0-1.
7. List the state of #15, #16, #18, #19, #20 and #25, and the hosted CI result for each head.

On a real phone, by Spencer. Nobody has run any 2.0 build on a phone, so everything here is still untested. **Revision 2:** use the 11-step list in section 6 of ChatGPT's critique instead of the list below. Its first step matters most: "Back up project" saves only the working job, so export every job you need one at a time, reopen each export to prove it works, and write down your device settings (DOCSIS windows, leak notebook and settings, Safety, Outage) before installing anything. Revision 1's list, kept for reference:

1. Take a full backup. Install the build 3 web version (or an APK Spencer builds and signs himself) over the existing install and confirm the jobs are still there.
2. Airplane mode: cold start, open a job, save, back up, restore.
3. Count how the Test sub-tab row behaves at phone width with 11 tabs, one-handed. This is the evidence for NAV-1.
4. Station: type forward and return readings with gloves, at night, then lock the phone or switch apps mid-entry and come back.
5. Leakage, Night log and Outage: number entry (the decimal keypad has no minus key on iPhone), long cards, and the Files menu in the header.
6. iPhone Safari from the Home Screen, if an HTTPS link exists. Otherwise mark it untested.

## Not re-verified

This is Claude's own verification scope. ChatGPT's critique has since closed the PDF, the data-model reads and some Reddit material; see its sections 1 and 7.


The screen and feature counts after `f467e52`; the data models behind Station, Readings, Checklists and Night log; whether a backup or export timestamp exists; whether `WorkflowUI` supports sub-screens under Home; the DOCSIS maximum-transmit rules; anything about the Arcom unit beyond the maker and model on its label; every phone, emulator and field behavior. The pain-point evidence in the Nov 11 research still has no Reddit or Facebook material in it.
