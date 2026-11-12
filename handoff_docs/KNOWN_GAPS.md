# Known gaps

Updated November 12, 2026 by Grok for the D4/D5 close-out. Everything here is something that is **not done, not verified, or not yet sourced**. Each row names where the claim comes from so it can be re-checked. When a gap is closed, delete its row in the pull request that closes it. Lane sections below are kept. Their open items are still open. This file is not a log of closed work.

Grok counted the merged core in jsdom on the `f467e52` standalone: 29 screens, 47 features, 114 registry rows, practice steps 22/16/15/8/9/7/10. That count is not a device test.

## Never verified on a device

| Gap | Where it is recorded |
| --- | --- |
| No emulator, phone or field test has been done for any 2.0 build, including all build 3 screens. Rendered checks are desktop Chromium at phone sizes. | `NightSweep_Project_Status.md` |
| No build 3 APK exists. It has to be built and signed with the original key outside this repository from a frozen `outputs/Night_Sweep.html` whose hash is pinned after the final gate; package, code 27, label, certificate, v2/v3 signatures, alignment and embedded HTML then need checking. | `android-build/build-readiness.json`, `NightSweep_Project_Status.md` |
| Build 2's Android 15 software emulator accepted the compatible update, then both the old and new builds hit the same stock WebView renderer crash. Native screens, file picker/save/share/print and job and original-evidence retention across an update are unverified on a device. | `NightSweep_Project_Status.md` (previous baseline record) |
| Safari/WebView offline cold starts, storage eviction, touch and rotation on a real iPhone or Android phone. | `NightSweep_Project_Status.md` |

## Math and data not yet sourced or registered

| Gap | Where it is recorded |
| --- | --- |
| Most hardline catalog cables (P3, QR, MC2 .500 to .750) list no velocity of propagation. Add datasheet VP with provenance before relying on catalog VP for them. | `NightSweep_Project_Status.md` |
| Quantum18 HGD, HGBT and LE pad and EQ values are not public (AOI's English data sheets are behind a request form), so the solver offers none. The BA's 0/2/4/6 dB pad list comes from a preliminary data sheet. | `research/build3/PAD_EQ_SOURCES.md` |
| Two existing app approximations are labeled Unknown in the registry: the 0.1 %/°F cable-loss temperature correction (traced only to an indexed copy of CommScope MX0398) and the 0.004/°C resistance default (no recorded source). | `night-sweep/thresholds.js`, `research/build3/SOURCE_VERIFICATION.md` |
| Older screens' example targets are not in the registry: Test → References workbook 32/43 dBmV and sample 34/46 dBmV targets, anchor pairs, plant-picker starting levels. | `NightSweep_Project_Status.md` |
| Exact GaN, Quantum18 LE/BA, EN9000-RFAM-RPD and DSIM-A commissioning procedures remain documentation gaps. Other proprietary ONX decoding and OCR are not added; A4 only supports the two inspected typed JSON layouts described below. | `NightSweep_Project_Status.md` |
| Cisco GainMaker line extender, data sheet and reverse EQ items in the station-view research are marked "not re-verified" because research credits ran out. The reverse pad values and EQ loss charts were confirmed earlier. | `research/build3/STATION_VIEW_SOURCES.md`, `station-view-research.json` |
| SCTE 297 2025r1: the PDF release history lists no r1 row, while CableLabs and the catalog label it 2025r1. Its section 6 procedure was not read. | `research/build3/station-view-research.json` |

## Source limits that remain after the cards were built

| Item | Gap | Where |
| --- | --- | --- |
| 5 DOCSIS health card | The card is on the branch. I20 Table 45, the 3.0 total-power row and the Pmax text were read (see `DOCSIS_HEALTH_SOURCES.md`). Still open: the section 6.4.2 pointer and some page numbers were not re-read; whether a newer issue than I20 exists was not repeated; a 3.1 modem receiving only SC-QAM may be 33 or 40 dBmV total input and the spec does not say which. Company windows start unknown. | `research/build3/DOCSIS_HEALTH_SOURCES.md` |
| 7 Leak log and CLI | The card is on the branch. 47 CFR 76.605(c), 76.611 and 76.1706 were read (see `LEAKAGE_SOURCES.md`). Still open: SCTE 289 and SCTE 293-12 bodies were not read, so the detector check and the normalizer's validity limit stay secondary. The company repair threshold starts unknown. | `research/build3/LEAKAGE_SOURCES.md` |
| 10 Sweep-due tracker | The card is on the branch. The interval starts unknown. The 18-month interval attributed to Hranac was not re-verified. It may be shown only as unverified guidance. | `docs/BUILD_LIST.md`, `night-sweep/thresholds.js` |
| 12 Return path toolkit | Not built. Noise-funneling math is standard practice but not checked against an SCTE primary source (293-11, 293-13, 270). | `docs/BUILD_LIST.md` |
| 13 Imported sweep grading | The aid is on the branch. The SCTE operational practice behind n/10 + x peak-to-valley grading was not re-verified; it appears only as labeled historical guidance. Native schema beyond the two inspected layouts is not supported. | `docs/BUILD_LIST.md`, the A4 section below |
| 15 Fiber color and budget | On this branch. TIA-598 itself was not read; the color order is a secondary summary. The real-browser check that an unfinished number's message sits with its box compares the combined span with the viewport height (`qa/build3-fiber-real.test.py`). It does not prove both rectangles are inside the viewport. Lane A review 5867997446 called that wording nonblocking. The message is still the box's description, directly under the box. | `research/build3/FIBER_SOURCES.md`, `qa/build3-fiber-real.test.py` |
| General | NCTI's own pages disagree on System Technician seat hours (26 versus 42). | `docs/BUILD_LIST.md` |

## Company targets and decisions that need a person

Every company target and tolerance starts **unknown** and must never be filled in by an assistant: forward levels at both pilots, return injection and receiver levels, return tolerance, tilt, sweep peak-to-valley, leak repair threshold and sweep interval. The open questions for the supervisor are at the end of `docs/BUILD_LIST.md`. Items 7 (leak), 8 (outage) and 9 (safety) need a supervisor's review against the local procedure before coworkers use them. Sharing the app with coworkers, using the leak log as anything but a personal notebook, and producing CLI or proof-of-performance numbers for filings all need a supervisor first.

## Carried from the lane log books (November 12, 2026)

Not closed. Grok did not re-test these.

- Station (PR #23 review): the same message is announced from the field paragraph and the worksheet status line. Toggling `hidden` on a live region is not announced reliably everywhere. No screen-reader test was done.
- A2: no Remove or Undo for a captured night-log entry. A blank Add uses one of the 200 slots. A notes-only log on the sample state can be labeled synthetic. Multiline TXT does not indent continuation lines.
- A3: the interval input reads the library on every keystroke. An older backup can overlay a newer saved view without a chronology warning. The 40,746-case calendar exploration was not reproduced in the repository.
- A4: focus can drop after a select change and after Grade. An internal field id such as `lowTargetDbmv` can appear in a reason. A very long node or asset id can fail grading with "Invalid sweep grading text." ZIP-descriptor, empty-chart wording and eager chart preview items remain in the A4 section below.
- Lane B cited some R-PHY I22 sections 6.9 and 6.10.1, and some SCTE 280 / 293 sections, from Lane A's reading rather than Lane B's own reading. Treat those citations as not re-verified by Lane B.
- No Vecima installation checklist is in the app. Do not invent steps. Question 0 asks which guide the company holds.

## Project paperwork and process

| Gap | Where it is recorded |
| --- | --- |
| `docs/ROADMAP.md` and `docs/BUILD_LIST.md` are on `build3` and are also open as pull requests #1 and #2 against `main`. The owner has not decided them. Do not merge them from a close-out. | GitHub, November 12, 2026 (Grok listed the open pull requests) |
| Release-time packaging scripts (`release/package_build2.py` and relatives) still describe the 1.8 build 2 ZIP. Build 3 has no delivery package and no APK. | `docs/DEVELOPER_BUILD.md` |
| Hosted CI once failed `build3-layout` at 768 px (Lane B, workflow run 2). Lane B could not reproduce it. Not re-run by Grok as a targeted repro. | `handoff_docs/lanes/claude-logbook.md` |
| Stretch pull requests #13, #15, #16, #18, #19 and #20 are open drafts and are not part of this close-out. #13 has an open review (rendered main guide and stale sentences on that branch). #15 to #19 were red in hosted CI on the pinned grading totals. #20 has no hosted CI while its base is not `build3`. | GitHub, November 12, 2026 |


## A4 native import and grading scope (Lane A, Nov 11)

- Only the two inspected typed JSON structures are supported, including bounded gzip/single-JSON ZIP. Other versions/layouts, multiple nonempty candidate traces or unavailable browser decompression remain attachment-only with a reason. Raw unreferenced sampled PTV is not normalized continuous-band ripple or official acceptance; measurement plane/reference and all company criteria remain explicit/unknown.
- A valid unsigned ZIP descriptor whose CRC equals optional signature 0x08074b50 is safely rejected. The original still attaches and survives portable export/restore exactly; no grade is produced. Nonblocking compatibility follow-up.
- A skipped empty opposing chart can contribute misleading unknown-direction warning wording despite the selected nonempty chart's correct direction. Samples and opposite-direction grading guard remain correct. Nonblocking wording follow-up.
- The optional Station saved-slot mismatch was corrected at 04bb5ae, with real-handler scoped review and a new full gate. Original private files remain excluded; committed fixtures are invented. Physical meter/reference-plane and device verification remain unperformed.
- Lane B's nonblocking parser observations remain: the decoder feeds 64 KiB compressed slices before checking decoded output, so the 2 MiB retained-preview cap is not a peak renderer-memory cap; unrecognized sweep-like container IDs can be skipped while a supported trace reports decoded points; some streamed ZIP64 files can report malformed central-directory bounds before the ZIP64 diagnostic; a Finder `__MACOSX/._name.json` shadow entry counts as another JSON candidate. These paths were checked against unchanged parser source in this correction; the review's memory figures were not re-benchmarked. Originals remain attachments on rejection. No parser, slicing, CRC, cap or performance change is included.
- Historical grading intentionally goes stale on job identity/name changes (including first named save) and Station Before/After stage changes. Canonical source-context keys now avoid key-order-only changes there; criteria/profile key ordering can still conservatively mark history stale. Earlier raw-context snapshots round-trip unchanged and are conservatively historical. The import validator still accepts shape-only histories and arbitrarily long blank criterion strings. The 100-record history cap still has no discard control; each re-grade consumes a record.
- Grading phone polish remains: focus can drop after select/Grade panel rebuilds; disabled criterion fields have no dedicated disabled styling or adjacent explanation; an entirely blank profile can save an all-unknown snapshot without a prompt. Practice still requires a hand-made CSV and leaves its plant/direction to the technician. Source previews retain the pre-existing 200-row display cap; missing-marker feedback gives no particular marker or nearest-frequency suggestions. The 32 `company.grading.*` registry rows (eight fields × four profiles) retain internal profile IDs in their names. These are source-checked remaining observations, not claims of physical phone behavior.

The six Lane B blocking corrections are separate from those observations: new grades use a bounded digest of actual bound Station records, preserve exact in-memory change detection and original-byte verification, and leave archived Station history in backups. A normal panel refresh restores the last valid in-session criterion and resets invalid text/flags together; Grade refusals preserve invalid drafts and their reasons. Each field has an adjacent human rule and a proper label beside its source button. Failed criterion autosaves now retain a named adjacent warning until a successful whole-job save. The current Station fixture and actual-handler regressions use binding v2. The reviewed Safety/Outage integration at4701026 has27 screens,45 features and15 custom-curves steps; guide counts retain that actual combined scope. This scoped note preserves the existing A1 and performance sections below; it does not close their deferred work or the unrelated B9 reconciliation rows.

The second A4 peer review still defers select/successful-Grade focus restoration, internal criterion keys in some unknown-check reasons and internal profile IDs in registry names. An unusually long node/asset context can refuse grading with the generic “Invalid sweep grading text” message; identify the field in a later change. These recommendations remain open. Older present-tense counts in the project status and update log still require the parent publication/D4 reconciliation; this correction does not claim those files fixed. The separate A1 native-input correction is not imported here.

Evidence: handoff_docs/reviews/codex-sweep-grading.md, its historical whole-feature/scoped-review reports and handoff_docs/lanes/codex-a4-validation.json on PR #14. This section does not close the unrelated older B9 reconciliation rows above.

## A1 Station nonblocking review follow-ups (Lane A, Nov 11)

The seven blocking requests from Lane B review 5861415148 were corrected and independently re-reviewed. The following nonblocking observations from that review remain deferred unless a later change explicitly closes them. Their original context is published source 895503b; incidental layout changes are not claimed as full closure.

- Format tiny floating-point deltas without signed zero; distinguish absolute-level formatting from signed errors. The read API can expose binary precision tails that future night-log formatting must handle.
- The worksheet permits nonnegative insertion loss only, although the cited net-loss relation is signed. Explain the restriction or add explicitly checked negative net-loss support.
- Threshold resolution outside Station's strict input parser still uses lenient Number conversion for station strings.
- Archived context history lacks a dedicated browser. A second edited equipment context can replace the active identity pointer while retaining the older map record. Load example replaces the working Station section; import validation of row stationIdentity and rejected-edit error feedback also need follow-up.
- Phone polish: stage labels near fields, focus retention across panel rebuilds, native EQ/pad select text, dark placeholder contrast, result placement, sign explanations, timestamp presentation and empty-state button spacing. Source labels/44px buttons were fixed; no physical iPhone keypad or Safari/WebView behavior was verified.
- Reconcile old status/update-log spacing, unrelated guide counts and the navigation End-key test's dynamic last-tab oracle during D4.
- A legacy-unconfirmed worksheet preserves both stages and done dates in the read API/backup, but the read-only panel cannot switch to the other stage before confirmation. Passive legacy browsing is a follow-up. A2/A3 must honor bindingStatus=legacy-unconfirmed/readOnly and must not treat its historical dates as confirmed current-equipment work.
- Earlier internal Minor observations remain recorded: source-tag location can follow the saved picker rather than a transient picker; edit-time text can refresh late; extreme escaped context strings can exceed the encoded-context guard.

Legacy confirmation is an explicit new binding choice, not RF acceptance or new balance/sweep work. Opening/restoring alone does not migrate the original. The confirmed copy uses a new identity and the original record stays byte-for-byte in the map. No local procedure, company target, manufacturer revision, physical phone/emulator or field test is implied by technical review.

Evidence: PR #8, the original Lane B review, handoff_docs/reviews/codex-station-laneb-fixes-review.md, handoff_docs/reviews/codex-station-view.md and handoff_docs/lanes/codex-a1-validation.json on that branch.


## Performance scope (Lane A, Nov 11)

- Station lookup optimization 6030607 reduces catalog work at long routes while keeping first-match/fresh-owner/catalog semantics. Its nine-row desktop benchmark had 0–0.2ms extra median input cost; its 200-active-row input improvement was 36–43%. No general or phone gain is claimed.
- CRC optimization b863821 keeps every original integrity check and speeds only the ZIP checksum/parse work. Synthetic near-cap 2 MiB JSON measured 78.2→15.3ms stored/84.3→21.4ms deflated in desktop Chromium; tiny files were below useful resolution. Original private input/backup byte equality was verified locally.
- A separate audit found closed evidence previews still build all charts (legal 30 × 10,000-sample workload: 142.9ms/~4.59MB markup). Lazy rendering remains a separate follow-up requiring open/toggle/print review. It is not included in this CRC change.
- No earlier correctness/nonblocking gap is implicitly closed by performance changes. Current source, methods, independent scoped reviews and final gate receipts are on PR #8 and PR #14.

## A2 Night log peer-addendum dispositions (Lane A, Nov 11)

Lane B's addendum to the review at de5459d required three corrections. Adjacent partial-time feedback/restoration and stale-preview invalidation were corrected at cd79a846. The follow-up reconciles the main README copies/Home complete-exercise summary with the actual guide arrays (22 complete, 15 six-active, 12 custom, 8 OEM, 9 DSIM, 7 manual and 10 GS7K); no exercise array is changed. It also fixes recommended item 5: the actual **3-tap route example** keep-list now retains an existing optional Night log exactly. Jobs without a log still have no log field. Replacing the route can still change the live historical warnings around retained captures and its example/synthetic classification; that is not a recalculation or alteration of stored capture history.

The following recommended observations remain open, separately from those fixes:

- **Item 4 — entry lifecycle and blank adds:** there is no Remove/Undo for a captured entry, and an all-blank general Add can consume one of the 200 slots. Entry note fields remain editable; a wrong captured worksheet is permanent within that log. The capacity message's “start another window” wording does not name an implemented window/reset control. Back up the job and use a separate new blank job when needed; no destructive history control or altered cap was added in this follow-up.
- **Item 6 — synthetic classification:** the banner/TXT/CSV marker still follows `state.example` or the job's sample/training marker. A notes-only log on the initial sample state can therefore be labeled synthetic and archived as “Sample route”; the route-example action intentionally sets the sample flag even when a retained log originated elsewhere. This follow-up preserves data without changing the global job/provenance policy. Start real work through a new blank job and review provenance before sharing; deciding a finer capture/job-level classification remains a follow-up.
- **Item 7 — multiline TXT:** Actions and the ROC/Fuel/Mileage/As-built text retain entered newlines in TXT without indentation of continuation lines. A continuation can visually resemble another entry or field. Review the generated note before sharing; CSV quotes multiline cells and full project JSON retains the exact strings. TXT continuation layout remains deferred.
- **Item 8 — upstream Station badInput:** Lane B reported that a native number input's lone minus can be saved as blank by the existing Station edit path, then copied as blank by Night log. This A2 correction does not edit A1's Station module or recover input text the upstream module already discarded. The report remains an A1 follow-up; no new claim of an independent real-keyboard reproduction or closure is made here.

The readonly 14px handoff preview was accepted in the review and is unchanged. No physical phone, screen reader, Safari/WebView, hardware or field verification is implied by these source/browser dispositions.



## A3 Sweep due: Lane B review dispositions (Lane A, Nov 11)

The review's displayed 07b3a91 hash names A4; its Sweep due findings apply to the A3 implementation formerly published at 570baf and integrated at 91eea4. The historical-row wording is corrected in the A3 successor: legacy-unconfirmed and retired UBT rows retain recorded dates, ages, done/validity and a historical reason without current-service reminder language. The interval remains an optional per-working-job preference; empty-state ownership is explicit. Linked Not saved feedback now sits directly below the field and does not follow another job. Focused regression pins cover upward two-thirds rounding and the final year9999 boundary; no formula or company cadence changed.

Deferred recommendations, not closed by those corrections:

- Every interval input still synchronously reads the library. Lane B reported visible stalls at 200 jobs × 40 stations under CPU slowdown; this worker did not remeasure those timings. Debounce/collect-on-change and collector caches require a separate performance/context review. No timing or phone-speed claim is made.
- A unique matching working job overlays its saved snapshot without diagnosing whether an opened older backup replaced a newer saved view. The separate stored snapshot is not deleted, but a chronology diagnostic remains a follow-up.
- Older large exploratory calendar scripts/receipts ran outside the repository; the committed 14 fixed reference cases and new explicit rounding/year-boundary pins reproduce their stated cases only. They are not a reproduction of the earlier 40,746 exploration count. Publishing a self-contained larger independent replay remains a documentation/QA follow-up.
- A2/A3/A4 share import validators and working-content guards; future integration must retain every optional section. Source/guide/status/update-log count and spacing reconciliation belongs to the actual final combined head; Lane B owns D4/D5.

These are software checks and retained observations, not physical-device, employer-procedure or field validation.
