# NightSweep project status

**1.7 Alpha · Android Preview build 22 · November 10, 2026, America/Chicago**

NightSweep is the existing offline HFC field calculator and job notebook for maintenance technicians, team leaders and supervisors. Continue from the Site-bound repository; no separate GitHub repository was found or created.

## Current release

- Browser: https://nightsweep-field.goodst3r.chatgpt.site — Sites version **8**, release `432d998a9dffd87f392e`.
- Exact pushed source commit: `d4228cad024406b17feb5bde134f2c6f6a75d08e`.
- Successful deployment receipt: `appgdep_6af3be3847488191920c6e86d78b6bdb`, November 10, 2026 at 7:00 PM Central (November 11 01:00 UTC). Existing public audience preserved.
- Android: `NightSweep-1.7-preview-build22.apk`, package `com.spencerwilliams.nightsweep.preview`, version code **22**, label NightSweep 1.7 Preview. Original Preview signer retained.
- Standalone HTML SHA-256: `6c48254cb13d62ed0047621bdb4a96d88cabd5d350b6338a6ef544e82cf54899`.
- APK SHA-256: `5c387e61055e7c62d7e2f0b8a40327d2fa9d833f26d6b4bfef856ab5c4cd97fd`.
- Source ZIP SHA-256: `a333d2d9d3b7c46314cd9e08704d163af6d6cfd35399658929ddf99eb0f63193`.
- Deployment archive HTML was compared byte-for-byte by SHA-256 with the final tested web build. Publication is established by the successful Sites receipt; no independent public-origin HTTP byte fetch is claimed.

## Current files

- [Android APK](https://chatgpt.com/library?file_id=libfile_fde3_f-64379253b1d88191a05dd7ceff6dc4fd_f029fb1dd3f88191968938cb9e3282e5&account_id=personal): `NightSweep-1.7-preview-build22.apk`.
- [Coworker package](https://chatgpt.com/library?file_id=libfile_fde3_f-77f3d393095481918b7bd8ab496a8ea5_f029fb1dd3f88191968938cb9e3282e5&account_id=personal): `NightSweep_1.7_Alpha_Build22_Share_Package.zip`, 15 allowed technician files, including current four practice exports, APK, standalone app and guides.
- [Matching source](https://chatgpt.com/library?file_id=libfile_fde3_f-a753192a85748191bfa723b8e8583dea_f029fb1dd3f88191968938cb9e3282e5&account_id=personal): `/NightSweep Developer/Sources/NightSweep_1.7_Alpha_Build22_Source.zip`, archived from the exact pushed commit. Signing keys, installed dependencies, SDK binaries and APKs are excluded.
- [Browser verification image](https://chatgpt.com/library?file_id=libfile_fde3_f-cad19e79b8f481918164e26f81c02cea_f029fb1dd3f88191968938cb9e3282e5&account_id=personal): repaired References training controls visible.

## Binding deployed-plant requirements

| Item | Current instruction |
| --- | --- |
| High split | **Vecima nodes and AOI active gear only: 204/258 MHz** |
| Other active families | **42/54 MHz**, including GS7000/GS7K and GainMaker |
| Non-high-split forward design | **31 dBmV at 54 MHz / 43 dBmV at 860 MHz** |
| Non-high-split return TX | **38 dBmV**, separate from injection/receiver targets; exact transmitter, frequencies/service plan and measurement plane still require confirmation |
| Available forward setup carriers | Confirm actual centers. User examples **57/753** or **63/550 MHz** retain the original 54/860 design references |
| 42/54 workflow | Forward Sweepless Sweep and Return Sweepless Sweep |
| 204/258 workflow | Forward Sweepless Sweep and XPERTrak return sweep |

The fleet split rule is separate from manufacturer capability tables. Existing field jobs and older training copies are not silently reconfigured. Keep capability, operator targets, estimates, entered configuration, measured results and acceptance distinct.

Available-carrier calculations retain square-root-frequency and linear-MHz models, blank drafts, hardware/live-limit checks and no extrapolation outside 54–860 MHz. Previously verified examples remain 31.11/41.97 and 31.32/39.79 dBmV for square-root 57/753 and 63/550; corresponding linear values 31.04/41.41 and 31.13/38.38. No installed equalizer curve is inferred.

## Build 22 changes

- Complete training now launches from **Vecima EN9000**, feeding AOI HGD/LE on 204/258. It explicitly selects the 204 sweep profile; the previous complete exercise incorrectly used GS7K/high split and defaulted Sweep setup to 42.
- Complete practice has **21 steps** and six synthetic originals. OEM AGC, DSIM and conventional GS7K remain separate **8/9/10-step 42/54** exercises with zero supplied captures.
- Vecima hardware capability 1794 MHz, entered/planned upper 1218 MHz and entered available spectrum 993 MHz are separate. Exact installed RFAM/RPD commissioning remains unverified.
- EN9000 power is an explicit **synthetic entered 0.75 A**. No GS7000 curve or manufacturer typical load/minimum voltage is substituted.
- Open step now reveals References, actual Records sections/forms, the gain test-point helper and work-order fields. Practice errors appear beside the buttons and permit retry while retaining current work.
- An older/incompatible complete-training copy shows a persistent notice and hides its mismatched updated guide. Reset archives that copy before opening the new baseline. Its data, progress and originals remain unchanged until that explicit switch.
- Evidence cleanup validates all named-job attachment references before deleting unused originals. Corrupt references stop cleanup conservatively.
- Blocked database opens close abandoned late-success connections. Unexpected connection closure invalidates only its own cache, allowing import/export retry without discarding originals.
- README, setup guide, release notes, developer instructions, current examples, QA and matching release/source packages updated.

## Retained features and source qualifications

Separate GainMaker OEM AGC, ACI DSIM and manual/thermal paths remain. OEM applicable MAIN-output pad relationships, source-specific backoff frequencies, exact model/manual control provenance, and conventional GS7K module-discovery versus RF-alignment distinctions are preserved.

The historical ACI Rev A pilot table remains 86 literal rows, channels 52–94 and 100–142, with channel 100 copying blocked as a source anomaly. No codes are invented for 303 MHz, missing 95–99 or OFDM PLC. Lookup does not establish compatibility or pilot lock.

UBT remains excluded from new choices; five legacy definitions remain readable/calculable without silent replacement. The retained inventory is 556 current selections, 37 setup registry records, 1,324 curves and 14,126 numeric rows. This iteration did not retranscribe all equipment specifications.

Exact Quantum18 LE/BA, EN9000/RFAM/RPD, DSIM-A and installed GaN commissioning procedures remain documentation gaps. Manufacturer/operator confirmation is required; do not substitute another product's manual.

## Executed verification and tools

- Final `python3 qa/run-pwa.py`: **846 checks, 41 suites, all passed**, generated output unchanged. Includes **13 database-failure checks**, **5 grouped named-job corruption/capacity checks**, and **9 production-training-control checks**.
- Independent storage review checked retry-before-abandoned-success ordering. Independent training review found further hidden controls and legacy-guidance mismatch; five additional regressions failed before repair and passed afterward.
- Android build 22 compiled successfully: original certificate `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca`, v2/v3 signatures, ZIP alignment, correct package/version/label and byte-identical tested standalone HTML. Seven existing native API deprecation warnings, zero build errors.
- Desktop Cloud Chrome opened all four exercises and visibly confirmed the complete 204/258 workflow, GS7K 42/54 guidance and exposed References controls. The browser UI candidate used the same final training source; the subsequent abnormal-close change received final automated coverage.
- Existing-tab reload confirmation was rejected by automatic approval review for potential unsaved state. A readable synthetic backup was verified and a separate tab provided the safer updated-UI check. Do not claim that blocked reload executed.
- GitHub: accessible-repository search found no NightSweep repository; upstream fake-indexeddb documentation led to the reproduced abnormal-close regression. No dependency upgrade or competing repository was created.
- Hugging Face: model metadata inspection succeeded; documentation tools were unavailable, with official web fallback. OCR remains an unimplemented research candidate: single-line model inputs, accuracy/device/asset/licensing questions remain. No photos uploaded, inference performed, model downloaded or compute job started.
- Context7/MDN checked IndexedDB transaction completion/abort behavior. Wolfram supplied eight named synthetic training arithmetic references. Figma supplied the older mobile control reference, not an executed current-app test.
- Octen extraction returned 403/payment-method-required; native web retrieved the original VIAVI PDF. No purchase/upgrade. Original ONX screenshots remain private and are not an implemented decoder.

Detailed evidence is in `release/validation.json`, `release/android-validation.json`, `release/browser-validation.json`, `research/Build22_Validation.md`, `research/build22-wolfram.json` and `research/Build22_HuggingFace_Assessment.md` in the matching source.

## Outstanding

- Physical Android update/retention, SAF picker/save/share/print, Android/iPhone Safari/Home Screen offline cold-start, touch, rotation and storage eviction/quota testing.
- Actual installed modules, firmware, approved detector/pilot, measurement planes, service/sweep plans and equalizer-curve verification. Checklists do not establish RF acceptance.
- Representative native ONX exports for documented decoder support. Unsupported files remain originals; no OCR inference added.
- Full runtime every-function/branch coverage and actual print pagination are not claimed. Synthetic fault tests are not device quota exhaustion.
- Saved jobs on the user's phone were not deleted. No update-time wipe exists. Job deletion requires the intended device/job identities or the user operating Job → Details.
- Browser/APK storage is separate; preserve exports before updates or rollback. Build 21 and earlier packages are historical. Do not uninstall or clear storage to force a downgrade without backups.

