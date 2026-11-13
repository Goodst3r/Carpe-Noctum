# NightSweep 1.8 Alpha build 2 — Release notes

November 11, 2026 · Local optimization, debugging, synthetic replay/property validation and one-package release preparation from the previous 1.8 Alpha source.

## What changed

- **Less repeated rendering:** hidden Sweep charts defer expensive drawing until opened or printed. Same-frequency RF results are reused only within one synchronous refresh; later edits/imports still recalculate. Workflow updates are coalesced, and unchanged named-job lists preserve existing controls and keyboard focus.
- **More compact phone route view:** the route cascade scrolls vertically/horizontally and remains keyboard-accessible. All complete-example points remain reachable.
- **TDR boundary repair:** chain position, rather than distance alone, detects another active at the same coordinate across a zero-length span. Forward/reverse barriers are enforced while valid chosen-origin, exact-arrival, zero-travel and sibling-branch cases remain supported.
- **Consistent project imports:** Files, Home, ONX shortcut and public JSON-text entry use the common 20 MiB UTF-8 limit before parse or working-state replacement. Exact-limit valid text remains supported; oversized/non-text input is rejected.
- **Reliable active-job duplication:** Duplicate uses the latest working state and writes the updated original plus copy in one atomic named-job-library operation. A failed write cannot leave a partial copy or overwrite with a stale saved snapshot.
- **Calendar-correct DSIM dates:** impossible imported dates such as 2026-02-31 remain invalid instead of being silently normalized into a setup-complete result. Valid leap/century dates and missing-as-incomplete behavior are preserved.
- **Native edge handling:** Android filenames respect UTF-8 byte bounds and deferred print callbacks retain a valid WebView lifecycle until safe teardown. Native-build/signature validation is recorded separately from source/platform-stand-in tests.
- **One organized delivery:** Android web/APK, iOS web, source/tests, current Markdown/HTML/PDF guides, seven practice JSONs, public receipts, checksums and a plain-text update log are separated inside one named ZIP.

## Local performance evidence

The render comparison used desktop Chromium at a 390 px viewport, five samples per scenario, on the same execution environment. These are local measurements, not a physical-phone speed guarantee.

| Synthetic scenario | Baseline median | Build 2 candidate median |
| --- | ---: | ---: |
| Complete example, route refresh | 33.5 ms | 6.7 ms |
| 100 route points | 125.5 ms | 33.5 ms |
| 200 route points | 242.5 ms | 80.5 ms |

State and numerical hashes agreed in the comparison. A separate synthetic 1000-job JSDOM review reduced three unchanged renders from three full list replacements / 698.48 ms total to zero replacements / 1.28 ms total. Final current evidence and source hashes are under `research/build2/`; these comparisons do not imply measured phone battery, frame-rate or storage performance.

## Calculation and functional validation

Established RF/power formulas and the seven exercise answers remain unchanged. New checks replay synthetic plans and exercise ordering, boundaries, unavailable values, RF properties, manufacturer power-curve cases and complete-example recovery. Independent Wolfram references remain representative arithmetic evidence, not equipment certification.

The final validation record distinguishes grouped automated checks, numerical assertions/comparisons, rendered-browser/offline checks, native source tests, real SDK/signature checks and archive/document checks. Historical 1.8 totals are baseline evidence. Read current receipts for executed final counts/hashes; synthetic backtesting is not a field backtest against measured plant or proof of every runtime branch.

## Preserved training and plant rules

Complete field workflow remains **GS7K + two GainMaker HGD** actives with **Scientific Atlanta SAT MM 4-23**, GigaXtend and Technetix passives on **42/54 MHz**. Design anchors remain **31 dBmV at 54 MHz / 43 dBmV at 860 MHz**, with a separate **38 dBmV return TX** reference. The source's 1218 MHz hardware capability is distinct from entered path operating/planning 1000 MHz and live 860 MHz.

The separate six-active Vecima/AOI exercise remains **204/258 MHz** and 261/993 MHz markers. Seven examples and 37 feature choices retain their guided steps, synthetic labels, unapproved records and portable original evidence. Existing field jobs and older practice copies are not silently reconfigured.

Complete power references remain **2.047 A / 13.65% / 88.83 V minimum**. The 300 ft/ 0.75 A trial gives **2.798 A / 18.65% / 87.37 V at the new load**, for the unchanged synthetic topology. No undocumented GaN current curve is substituted.

## Artifact identity and release boundaries

- Exact application version: **1.8 Alpha build 2**; export prefix `NightSweep_1.8_Alpha_build_2_`.
- Android Preview: version code **24**, launcher **NightSweep 1.8 Preview build 2**, continuing Preview package/origin/provider identity.
- Accepted installer filename: `NightSweep-1.8-build2-preview.apk`. It is included only with successful real build, original-certificate, manifest, v2/v3 signature, alignment and exact embedded-HTML receipts.
- The original authorized signer and official toolchain are available in the build environment. Private material, dependencies/SDKs and historical binary archives are excluded from the single delivery.
- No public deployment, upstream repository change, native iOS installer, physical-device install or field acceptance is claimed.

## Outstanding checks

Physical Android compatible-update retention, native pickers/share/print, Safari/Home Screen offline cold starts, touch/rotation and storage eviction/quota exhaustion still require actual device checks. Exact installed GaN, Quantum18 LE/BA, EN9000/RFAM/RPD and DSIM-A commissioning procedures remain source gaps. Proprietary ONX decoding/OCR is not added; unsupported files remain originals.

See the [all-functions README](NightSweep_1.8_Alpha_Functions_README.md), [Android/iOS installation guide](NightSweep_1.8_Alpha_Android_iOS_Installation.md) and `NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt` for practical use, update precautions and the plain-text build record.
