# Known gaps

Updated November 11, 2026 by Lane B (task B3). Everything here is something that is **not done, not verified, or not yet sourced**. Each row names where the claim comes from so it can be re-checked. When a gap is closed, delete its row in the pull request that closes it; do not let this file become a log. Lane B rewrites it from both status files for the final handoff (task B9).

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

## Planned features whose sources are not yet confirmed

| Item | Gap | Where |
| --- | --- | --- |
| 5 DOCSIS health card | Downstream ±15 dBmV per 6 MHz, OFDM −9 to +21 dBmV per 24 MHz and the total-input limit come from secondary sources and the older PHY issue I08. Confirm against CM-SP-PHYv3.1-I20-230419 before shipping; anything unconfirmed stays tagged secondary. | `docs/BUILD_LIST.md`, `research/build3/SOURCE_VERIFICATION.md` |
| 7 Leak log and CLI | 47 CFR 76.611 (CLI) and 76.1706 (logs) were not checked yet. The company repair threshold is unknown. | `NightSweep_Project_Status.md`, `docs/BUILD_LIST.md` |
| 10 Sweep-due tracker | The 18-month interval attributed to Hranac was not re-verified. It may be shown only as unverified guidance. | `docs/BUILD_LIST.md` |
| 12 Return path toolkit | Noise-funneling math is standard practice but not checked against an SCTE primary source (293-11, 293-13, 270). | `docs/BUILD_LIST.md` |
| 13 Imported sweep grading | The SCTE operational practice behind n/10 + x peak-to-valley grading was not re-verified; it appears only as labeled historical guidance. | `docs/BUILD_LIST.md` |
| General | NCTI's own pages disagree on System Technician seat hours (26 versus 42). | `docs/BUILD_LIST.md` |

## Company targets and decisions that need a person

Every company target and tolerance starts **unknown** and must never be filled in by an assistant: forward levels at both pilots, return injection and receiver levels, return tolerance, tilt, sweep peak-to-valley, leak repair threshold and sweep interval. The open questions for the supervisor are at the end of `docs/BUILD_LIST.md`. Items 7 (leak), 8 (outage) and 9 (safety) need a supervisor's review against the local procedure before coworkers use them. Sharing the app with coworkers, using the leak log as anything but a personal notebook, and producing CLI or proof-of-performance numbers for filings all need a supervisor first.

## Project paperwork and process

| Gap | Where it is recorded |
| --- | --- |
| Training text and the 1.8-named guides still use old screen names ("Save named job", "Sun / Night", "Equipment setup" and others; 16 hits in the first count). No test fails when training names a tab or button that does not exist. Task B4 fixes both. | `handoff_docs/CHATGPT_HANDOFF.md`, `handoff_docs/PARALLEL_TASKS.md` |
| Until task B1 lands, a full gate run rewrites tracked evidence files under `release/` and `research/` (run `git checkout -- release research` before committing), the per-suite limit is a fixed 150 s, and `qa/alpha18-release.test.py` fails with a traceback instead of a clear message when `build-readiness.json` says an APK was built but its receipts are not in the checkout. | `handoff_docs/PARALLEL_TASKS.md` |
| `docs/ROADMAP.md` and `docs/BUILD_LIST.md` are also open as pull requests #1 and #2 against `main`. They merge cleanly with the copies on `build3`, but the owner has not decided them. | `handoff_docs/PARALLEL_TASKS.md` |
| Release-time packaging scripts (`release/package_build2.py` and relatives) still describe build 2. Build 3 has no delivery package. | `docs/DEVELOPER_BUILD.md` |


## A4 native import and grading scope (Lane A, Nov 11)

- Only the two inspected typed JSON structures are supported, including bounded gzip/single-JSON ZIP. Other versions/layouts, multiple nonempty candidate traces or unavailable browser decompression remain attachment-only with a reason. Raw unreferenced sampled PTV is not normalized continuous-band ripple or official acceptance; measurement plane/reference and all company criteria remain explicit/unknown.
- A valid unsigned ZIP descriptor whose CRC equals optional signature 0x08074b50 is safely rejected. The original still attaches and survives portable export/restore exactly; no grade is produced. Nonblocking compatibility follow-up.
- A skipped empty opposing chart can contribute misleading unknown-direction warning wording despite the selected nonempty chart's correct direction. Samples and opposite-direction grading guard remain correct. Nonblocking wording follow-up.
- The optional Station saved-slot mismatch was corrected at 04bb5ae, with real-handler scoped review and a new full gate. Original private files remain excluded; committed fixtures are invented. Physical meter/reference-plane and device verification remain unperformed.
- Lane B's nonblocking parser observations remain: the decoder feeds 64 KiB compressed slices before checking decoded output, so the 2 MiB retained-preview cap is not a peak renderer-memory cap; unrecognized sweep-like container IDs can be skipped while a supported trace reports decoded points; some streamed ZIP64 files can report malformed central-directory bounds before the ZIP64 diagnostic; a Finder `__MACOSX/._name.json` shadow entry counts as another JSON candidate. These paths were checked against unchanged parser source in this correction; the review's memory figures were not re-benchmarked. Originals remain attachments on rejection. No parser, slicing, CRC, cap or performance change is included.
- Historical grading intentionally goes stale on job identity/name changes (including first named save) and Station Before/After stage changes. Canonical source-context keys now avoid key-order-only changes there; criteria/profile key ordering can still conservatively mark history stale. Earlier raw-context snapshots round-trip unchanged and are conservatively historical. The import validator still accepts shape-only histories and arbitrarily long blank criterion strings. The 100-record history cap still has no discard control; each re-grade consumes a record.
- Grading phone polish remains: focus can drop after select/Grade panel rebuilds; disabled criterion fields have no dedicated disabled styling or adjacent explanation; an entirely blank profile can save an all-unknown snapshot without a prompt. Practice still requires a hand-made CSV and leaves its plant/direction to the technician. Source previews retain the pre-existing 200-row display cap; missing-marker feedback gives no particular marker or nearest-frequency suggestions. The 32 `company.grading.*` registry rows (eight fields × four profiles) retain internal profile IDs in their names. These are source-checked remaining observations, not claims of physical phone behavior.

The six Lane B blocking corrections are separate from those observations: new grades use a bounded digest of actual bound Station records, preserve exact in-memory change detection and original-byte verification, and leave archived Station history in backups. Invalid-field text and flags now reset together when saved criteria are re-rendered; each field has an adjacent human rule and a proper label beside its source button. The current Station fixture and actual-handler regressions use binding v2. Current guides/counts are 24 screens, 42 features and 12 custom-curves steps. This scoped note preserves the existing A1 and performance sections below; it does not close their deferred work or the unrelated B9 reconciliation rows.

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
