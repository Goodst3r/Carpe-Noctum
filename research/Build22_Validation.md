# NightSweep 1.7 Alpha build 22 validation

Spencer Williams · November 10, 2026, America/Chicago

## Baseline and scope

Recovered the canonical Site-bound source commit `a625de75a812592d4766f6475f143cd72c2d1bee` rather than modifying supplied historical 0.1 files. The previous published web version was 7 / `80618aeb086aedb956b1`, Android Preview build 21. Initial local verification reran 819 checks in 38 suites successfully.

The user's deployed fleet rule is **Vecima nodes and AOI actives at 204/258; all other node/amplifier families at 42/54**. This is an operator deployment rule, separate from manufacturer capability. No field job, installed equipment or saved practice copy is automatically reconfigured.

## Demonstrated issues

| Issue | Evidence and change |
| --- | --- |
| Wrong complete-training source and sweep default | Old complete exercise used GS7000/204 and omitted its sweep setup, defaulting the guide to 42. New exercise uses Vecima EN9000/AOI and explicitly selects 204. |
| Training navigation appears inactive | Browser reproduction reached References with its controls collapsed. Regression checks verify destination controls are revealed. Independent review also checked Records, gain and work-order destinations. |
| Invisible failure context | A production-button test without secure file verification previously had no adjacent error. A visible live-status message now explains failure and permits retry while retaining the working job. |
| Closed or abandoned IndexedDB connection | Blocked open rejected, but later success left a live uncached connection. The late connection now closes. A GitHub-informed abnormal-close regression also reproduced InvalidStateError until reload; guarded cache invalidation now permits import/export retry with original bytes retained. |
| Cleanup could delete originals belonging to corrupt named jobs | Removing a saved evidence ID made its original appear unused. Cleanup now validates all saved evidence lists before collecting references or deleting bytes. |

New complete-training EN9000 power is a **synthetic entered 0.75 A**, with no assumed manufacturer typical-load/current curve or unverified minimum voltage. High-split launch remains synthetic 34/46 at 261/993. Lower-split design references remain 31/43 at 54/860 and separate TX reference 38 dBmV.

## Tools actually invoked

- **GitHub:** searched accessible installations for NightSweep (no matching repository); read the upstream fake-indexeddb README and its abnormal-close test API. The installed test version remains 6.2.4. This led to a reproduced same-runtime closed-connection defect and an additional regression, not a library upgrade. Source: https://github.com/dumbmatter/fakeIndexedDB/blob/master/README.md.
- **Hugging Face:** model metadata inspection succeeded; documentation tools were unavailable and official pages supplied the fallback. `Build22_HuggingFace_Assessment.md` records limitations and evaluation criteria. No OCR inference, photos uploaded, model downloaded or AI feature added.
- **Sites:** identified the existing public app and recovered the exact source through its source helper. No competing repository or site was created.
- **Context7:** resolved MDN and retrieved IndexedDB completion/abort semantics. Transactions must commit before attached-file success is published; existing writes already used this boundary, and failure coverage was expanded.
- **Wolfram:** evaluated eight named synthetic arithmetic references; request and response are retained in `build22-wolfram.json`. Direct application comparisons cover entered EN9000 current, corrected launch and existing frequency arithmetic. This is no equipment certification or complete numerical proof.
- **Figma:** inspected the existing 390-unit Equipment setup reference (`4:2572`) in file `C1zOM5qj4LF3YOd5NMCN8G`. It is an older control/style reference, not a current training screen or executed app test. No redesign or assets were substituted.
- **Octen / native web:** focused discovery found VIAVI's power-level tech tip. Octen extraction returned 403, “Payment method required”; native web retrieved the original VIAVI PDF. No purchase was attempted. OFDM and SC-QAM power references remain distinct; no screenshot decoder was added.
- **Local execution and independent review:** Node/jsdom/fake-indexeddb, Python builders, actual Cloud Chrome interaction, and separate storage/training reviewers. The Data validation workflow guided checks of missing values, duplicate photo views, selected frequency references and synthetic load provenance.

Manufacturer reference: https://www.viavisolutions.com/en-us/literature/quick-tech-tip-testing-power-levels-docsis-31-quick-references-en.pdf, pages 1–2. It documents OFDM power relative to 6 MHz; the precise ONX tile semantics still depend on the applicable meter/software documentation.

## Verification boundaries

The first combined build passed **840 checks in 41 suites**, with generated output unchanged during testing. Independent review subsequently identified additional hidden teaching controls and incompatible guidance on retained older practice copies. Final results are recorded in `release/validation.json` after the subsequent regression/frozen-build run.

Synthetic database errors exercise failure handling; they do not reproduce actual phone quota exhaustion. Browser interaction verifies the tested desktop Chrome flow, not physical Android or iPhone Safari. Physical update/retention, SAF picker/save/share/print, touch/rotation, storage eviction and offline cold-start remain outstanding. Real ONX native-export decoding, installed RFAM/RPD commissioning procedures and field acceptance remain unverified.

Private meter photos, customer/plant data, credentials, signing keys and SDK binaries are excluded from release/source packages. Current saved jobs are preserved; no update-time wipe is added.

## Final executed result

Final `python3 qa/run-pwa.py`: **846 checks in 41 suites, all passed**, with generated output unchanged. This includes 13 database-failure checks, 5 grouped corrupt/capacity checks and 9 production-training-control checks. Android build 22 compiled and verified with the original Preview signer, v2/v3 signatures, ZIP alignment and byte-identical tested standalone HTML. No physical-phone result is claimed. Browser details and the scoped update/reload limitation are recorded in `release/browser-validation.json`.
