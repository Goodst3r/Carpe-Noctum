# Roadmap determination: Carpe Noctum after build 3

November 12, 2026 · written by Claude for Spencer, Grok and ChatGPT · docs only, no app change

This is the final call on `Carpe_Noctum_Roadmap.pdf` (Grok's synthesis, pinned to `f467e52`). It says what to keep, change or defer, in what order, and what has to be checked first. The three starting prompts are in `handoff_docs/ROADMAP_PROMPTS.md`.

This file was written in a claude.ai session running Fable 5.2, not Sonnet 5.5 at medium effort as the working agreement asks. Spencer picks the model when he starts a session; an assistant cannot switch itself.

## Who does what

| Assistant | Job | Writes app code? |
| --- | --- | --- |
| Grok | Holds the pinned `build3` commit and the verified facts, enforces the rules, turns decisions into one plain direction. Heavy lifter. | Yes. One writer per branch. |
| ChatGPT (GPT-6.1 Sol Ultra) | Evidence and technical critique: factual conflicts, calculator math, ranking against public evidence, real-phone check list. | No. Does not change navigation. |
| Claude | Final determination (this file), then debugging and review. Sonnet 5.5 medium first; Opus 5.5 if an issue spans files or keeps failing; Fable 5.2 only if both miss it. | Only fixes for a reported defect, on its own branch. |

"Grok writes the feature branches" is my reading of "heavy lifter". Spencer, say so if you want a different writer.

## What I checked, and against which commit

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
| (not in the roadmap) | The working job is stored under `hfc-route-v1`. Device-local keys: `nightsweep-docsis-windows-v1`, `-evidence-v1`, `-leakage-v1`, `-outage-v1`, `-safety-v1`, `-theme-v1`. | These names must not change. |
| (not in the roadmap) | #25 (draft) names the Arcom Digital QS-NAVPLUS-OUDP as the only leak detector. | Spencer's instruction, Nov 11. |
| P0 list | The roadmap PDF has six P0 items. "Evidence handoff" was in Spencer's message, not in the PDF. | Undefined item. See P0-7. |

Two things in my own Nov 11 layout review were wrong and are withdrawn: moving Files and Help to a menu (they are already there), and folding Readings into Station (they hold different measurements).

## Rules that every item below must meet

Offline only. No customer names, addresses, account numbers or modem MACs. Company targets, tolerances and pilot codes start Unknown and stay editable; blank is never zero. 42/54 and 204/258 stay separate. Existing storage keys and the job file format do not change; saved-job changes are additive only and old jobs and backups must open and round-trip. Every new limit or formula gets a label, a source and a registry row in `night-sweep/thresholds.js`. Every new formula gets an independent reference calculation. No version change, no APK, no signing.

## Order of work

1. **Before any branch work:** the checks in "Re-check first" below, and Spencer's acceptance of build 3 (D3 is one Grok run, not two lanes).
2. **Finish the stretch stack that is already in review** (#15, #16, #18, #19, #20) and #25, one at a time, each with its own gate. Do not start A5 to A7 (items 14, 16, 12) yet.
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
| Tools | Calculators (`calculators`), Limits (`limits`), References (`references`), Frequency (`frequency`), Catalog (`parts`), DOCSIS health (`docsisHealth`), Impairments (`impairments`), and each stretch screen as it merges (Fiber, High split, Why cards, Proof of performance, Study) |
| Closeout | Acceptance (`records`), Run sheet (`runsheet`) |

Plan has nine screens and Field has eight. That is still a long sub-tab row on a phone. NAV-1 must show how those two rows behave at 320 px, and if they wrap badly, Plan and Field get the same list treatment as Tools. Decide that from a rendered check and then a real phone, not from this table.

NAV-1 exit criteria, replacing the roadmap's list:

- No storage key, screen id or job-format change. Old jobs, 1.6 to 1.8 backups and build 3 jobs open with identical numbers.
- Every screen is reachable, and the practice steps, guides, `qa/ui-names.test.cjs`, the feature index and the screen and feature counts all use the new group names in the same pull request.
- Rendered layout at 320 to 430 px in the dark theme, and the full gate, by the writer and by one reviewer on the same head.
- No new feature, calculator, card or stored value in the same pull request.

## P0 determination

In build order.

| # | Item | Call | Detail |
| --- | --- | --- | --- |
| P0-3 | Plant banner | **Keep, changed.** First after NAV-1. | It becomes the context strip: job name, plant (42/54 GS7K/GainMaker or 204/258 Vecima/AOI), and the selected active or point. Show the measurement plane only on screens that already have a plane field (Station). Read-only, no stored value, not shown on Tools. |
| P0-3b | Leakage-method reminder | **Defer the method text.** | The only detector the app names is the Arcom Digital QS-NAVPLUS-OUDP (#25). The company's leakage method and tag settings start Unknown. Do not write OUDP or legacy-tag steps until the Arcom manual and the High split registry rows (#16) are in. A one-line pointer to Test → High split is fine once #16 merges. |
| P0-1 | Tonight open-items list | **Keep.** | Version 1 reads only what is already stored: Station stages not marked balanced or swept, and Sweep due. Add open temporary repairs when P0-2 lands. "Unexported night log" and "last backup" need a timestamp the app may not store today (not re-verified); if so, that is a new device-local key, never a job-format change. |
| P0-4 | Power-sum and composite-power calculator | **Keep.** | Three sums: uncorrelated add, N equal carriers, and signal-plus-noise minus noise. It must refuse a total that is not above the noise, and say why. Correlated (voltage) addition is left out of version 1. ChatGPT checks the formulas and edge cases before Grok builds. Registry rows and an independent reference are required. |
| P0-5 | Upstream headroom card | **Split.** Conversion now, headroom deferred. | The 1.6 to 6.4 MHz step is 10·log10(4) = 6.02 dB and belongs with the existing OFDM power calculator; do not build a second converter. The "headroom to a ceiling" part waits for two things: ChatGPT's check of the maximum transmit rules in the DOCSIS 3.1 PHY specification (they depend on channel count and width, and open question 3 on the DOCSIS card is unresolved), and a company ceiling from Spencer's supervisor. |
| P0-6 | Intermittent-ingress record | **Keep, changed.** | An entry type in Job → Night log (conditions, time, what was tried, weather typed by hand), not a new screen or store. First fix the two Night log gaps in `KNOWN_GAPS.md`: no Remove or Undo for an entry, and a blank Add using one of the 200 slots. |
| P0-2 | Temporary-repair tracker | **Keep, changed.** | Read `night-sweep/field-work.js` first: Job → Checklists already holds repair notes (not re-verified what it stores). Extend that instead of building a second repair list. Station or span names only, no address field, additive job field. Spencer should tell his supervisor it is a personal reminder list, not the record. |
| P0-8 | Exact resume | **Keep, reduced.** | Return to the last screen and the selected active for the working job, from a new device-local key. Restoring scroll position and half-typed fields waits for the real-phone check; Station already retains typed input (#23). |
| P0-7 | Evidence handoff | **Defer until defined.** | It is not in the roadmap PDF. My working definition, for Spencer to confirm or replace: the shift handoff note lists which evidence exists for the job (file name, SHA-256, Station stage), and never includes file contents. Real meter files can carry identifiers and leave the phone only when the tech backs up or shares the job himself. |

## Medium-term and hold

| Item | Call | Detail |
| --- | --- | --- |
| Map symbol legend | Keep | The tech fills it in. Nothing copied from SCTE. The company legend may be internal. |
| Spectrum analyzer setup card | Keep, gated | Only from VIAVI ONX documentation that somebody has actually opened. Not re-verified. |
| Cascade noise and distortion calculator | Keep, gated | ChatGPT checks each formula against a primary source first, and says whether CTB and CSO figures still mean anything on an all-digital plant. |
| Bonding and grounding reminder | Keep | Put it in the construction and connector checklist (item 16, not built yet). |
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

On a real phone, by Spencer. Nobody has run any 2.0 build on a phone, so everything here is still untested:

1. Take a full backup. Install the build 3 web version (or an APK Spencer builds and signs himself) over the existing install and confirm the jobs are still there.
2. Airplane mode: cold start, open a job, save, back up, restore.
3. Count how the Test sub-tab row behaves at phone width with 11 tabs, one-handed. This is the evidence for NAV-1.
4. Station: type forward and return readings with gloves, at night, then lock the phone or switch apps mid-entry and come back.
5. Leakage, Night log and Outage: number entry (the decimal keypad has no minus key on iPhone), long cards, and the Files menu in the header.
6. iPhone Safari from the Home Screen, if an HTTPS link exists. Otherwise mark it untested.

## Not re-verified

The screen and feature counts after `f467e52`; the data models behind Station, Readings, Checklists and Night log; whether a backup or export timestamp exists; whether `WorkflowUI` supports sub-screens under Home; the DOCSIS maximum-transmit rules; anything about the Arcom unit beyond the maker and model on its label; every phone, emulator and field behavior. The pain-point evidence in the Nov 11 research still has no Reddit or Facebook material in it.
