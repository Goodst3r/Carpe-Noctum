# Local ONX import verification

Verified2026-11-16 on the existing build6 implementation branch. Source scope begins4d066c4; final functional corrections are9a29e62 andd8413f6. Documentation-only completion follows. Generated artifacts were rebuilt locally, not committed.

| Check | Result |
| --- | --- |
| npm ci | Succeeded;130 packages installed |
| npm test |271 tests:265 passed,6 optional fixture skips,0 failed |
| npm run build |Succeeded; PWA232b877485123780804d |
| npm run test:browser |56 checks passed, including new typed imports, cancellation, persistence and offline operation |
| npm run test:ai-browser |13 checks passed; local model/offline behavior retained |
| Private five-file browser replay |5 reports saved/reopened;2 forward ports; no390px overflow;0 page errors;0 external requests |
| Private original/backup replay |All5 original byte sequences restored by verified hash; diagnostic reports did not replace forward sweeps |
| Alternate OneCheck representations |All10 numeric series, units and OFDM boundary indices match exactly |
| Public-artifact audit |No example filenames or complete private sample series found in either generated web artifact |
| git diff --check |Passed |

Forward native reports retain98 Absolute and98 Referenced samples each. The reverse report retains1,028 relative samples and3 tables. OneCheck CDM retains10 series and20 populated tables; the HTML bundle retains10 series and25 populated tables. Source representations differ in table layout and empty sections; no artificial data was added. Explicitly empty native reference arrays remain unavailable, not zero.

The five-file phone-sized Chromium replay preserved original bytes, saved reports across reload and took306–656ms per import on this environment. This is local test evidence, not a device performance guarantee. Source HTML was parsed only as inert strings/strict numeric literals; external images/scripts were not fetched.

Implementation and review used Terra, Sol6.1, Sol6, Luna and Astra. Scoped reviews found and corrected missing chart/metadata retention, unknown-model physical-port validation, and destination changes retaining another measurement plane's port/loss. Regressions failed before the corresponding fixes and passed afterwards. Astra's final whole-feature review found no remaining Critical or Important findings and independently replayed all five originals. Claude was unavailable; no Claude review is claimed.

Report series are expandable data tables, separate from the existing single active RF trace. Reverse-relative and OneCheck evidence does not automatically fill forward RF targets or installed equipment settings. Unknown equipment requires a supported model before physical-port association. Extreme valid reports can create a large DOM; the supplied examples passed the browser replay. Cancelling after original persistence may leave an unreferenced local content-addressed original but does not mutate the station.

No supplied originals, extracted private HTML/JSON, private screenshots or raw private fixture data are committed or served from the web build. Private QA artifacts remain outside the repository. No merge, deployment, live online-provider call, signed APK or physical-device/field acceptance is claimed.
