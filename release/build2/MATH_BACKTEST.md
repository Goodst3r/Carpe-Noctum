# NightSweep 1.8 Alpha build 2 math and backtest record

This work was performed only in the separate Build 2 workspace. The earlier 1.8 release and its frozen artifacts were not edited. Synthetic examples and independently constructed inputs were used; no private field measurements were sent to an external service.

## Confirmed repairs

**TDR could cross a different active sharing the origin's route coordinate.** Two active rows with a zero-length incoming span on the second active can have the same distance coordinate. The old coordinate-only barrier predicate excluded both actives at that coordinate. Forward testing after the first active incorrectly crossed the second; reverse testing from the second incorrectly crossed the first. Both cases returned a usable location before repair.

The barrier check now uses the active's position in the selected ancestor chain as well as the event distance. A different active in the test direction blocks the path even when it shares the origin coordinate. The selected origin, exact arrival boundary, zero travel and unrelated sibling branches keep their established behavior. No TDR distance, lead or velocity-factor formula changed. [tdr-boundary-regression.json](tdr-boundary-regression.json) retains the exact before/after cases and failed-then-passing test evidence.

**An impossible imported DSIM date could report setup complete.** `Date.parse('2026-02-31')` normalizes to a real date. An otherwise complete imported setup record therefore passed the previous finite-date check. The status check now compares the parsed UTC year, month and day with the exact entered components. It does not rewrite the saved date or approve the record. Leap/century rules, valid month ends, previously accepted four-digit years and missing-as-incomplete behavior are covered. The imported February 31 regression failed before repair and passed afterward.

The only other `projects.js` changes update the current record title and CSV filename prefix to Build 2 identity. Historical fixtures and storage identities remain unchanged.

## Executed new checks

| Command | Current local result | Evidence |
| --- | --- | --- |
| `node qa/build2-tdr-boundaries.test.cjs` | 8 grouped checks | Same-coordinate barriers, both directions, boundaries and sibling paths |
| `node qa/build2-dsim-dates.test.cjs` | 8 grouped checks | Actual imported-record reproduction and Gregorian calendar boundaries |
| `node qa/build2-rf-properties.test.cjs` | 13 grouped checks / 49,619 numeric comparisons | [rf-property-results.json](rf-property-results.json) |
| `node qa/build2-example-math.test.cjs` | 10 grouped checks / 6,096 numeric and 3,634 unavailable comparisons | [example-math-backtest.json](example-math-backtest.json) |
| `node qa/build2-power.test.cjs` | 15 grouped checks / 16,286 numeric comparisons | [POWER_BACKTEST.md](POWER_BACKTEST.md), [power-backtest-results.json](power-backtest-results.json) |

All five new suites passed in the current source checks. Their **54 grouped checks** are the count for release-runner registration; the embedded numeric probes must not be added again to the grouped release total. Root release verification supplies the final frozen full-suite result separately.

### RF, routes and records

The deterministic RF generator uses seeds 180200–180223 and constructs 24 branched routes containing 1,136 total rows, with route sizes from 1 to the supported 200 points. Expected source, cable, gain and passive values come from separate analytic functions: cable loss is affine in square-root frequency, passive and entered active profiles are affine in MHz, and parent-path bookkeeping is independent of the app's helpers. Both signed levels and net path losses are compared at 5, 54, 204, 258, 550, 860, 1000, 1218 and 1800 MHz.

Additional properties check gain requirements/reserve, physical slack, cable-length composition, temperature extremes, custom actual-condition loss, missing/nonfinite input, signed gains, terminal tap ports, duplicate/cyclic/future/invalid parents, 200-point forward/reverse TDR path inversion, sibling branch separation, record plane/error invariance, return-pad direction, injection checks, ingress criteria and inclusive tolerance boundaries.

The seven current practice factories were replayed over **329 frequency frames**. These include standard frequencies, unsupported 4/1801 MHz probes, and exact/near boundaries of the selected passive source tables. A separate reference interpreter uses literal curve metadata and interpolation algebra; it does not call the production cable/passive/gain helpers. Unavailable results are checked explicitly rather than converted to zero. The GS7K starter correctly retains unknown launch values. Relative versus absolute return planes and dBµV/dBmV round trips are independently checked too.

`qa/build2-source-harness.cjs` assembles the current sources with the normal builder token list and injected setup-manual data, without changing `outputs/` or `dist/`. These development checks establish source behavior. They do not replace the release owner's final unmodified generated-artifact checks.

### Power and fresh independent references

The independent power audit constructed 100 mixed-mode 25-point circuits plus serial and branched 200-point circuits. It checked ancestry currents, full-path voltage drops, scalar apparent-power accounting and wire heating. Each current-table segment was also tested at 10%, 50% and 90% interior points with four independently derived supply/resistance conditions: **2,340 manufacturer-curve operating cases**. Invalid values, missing ratings, temperature bounds, actual-temperature overrides, contact resistance, collapse, zero loads, selected DC branches and the actual what-if helper are included.

Wolfram actually evaluated fresh synthetic constant-watts/PF and mixed-branch references; its exact code and response are retained in [power-wolfram.json](power-wolfram.json). The 95 V / 1.75 Ω / 250 W / PF 0.8 high-voltage case gives 88.84458852135307 V and 3.517377987798246 A. Existing golden RF/power cases are retained. Neither repair changes the established complete-example RF, drop, baseline-power or trial-power answers.

## Core-function coverage map

This maps meaningful checks to the core functions; it is not a claim of complete JavaScript branch coverage.

| Function family | Executed coverage |
| --- | --- |
| `number`, `parseTable`, `curveValue`, `launchAt` | Retained engine/Wolfram tests; new analytic RF cases; all seven example curves and boundary frames |
| `portsFor`, `selectedCurve`, `passiveAt`, `activeGainAt`, `cableAt`, `spanLength`, `run` | Retained catalog/golden tests; analytic branched-route, missing-value, tap/through, temperature and example replay checks |
| `routeDistances`, `tdrLocate` | Retained 34 route tests, new 8 topology regressions and 200-point inversion/branch properties |
| `gainBudget`, `grid` | Retained gain/grid boundaries and independent new gain-margin comparisons |
| `dcSegment`, `dcRoute`, `powerRun` | New power operating-point/circuit cases plus retained 30 Wolfram-power groups and engine tests |
| `ProjectMath` parsing/coverage/evaluation/generator | Retained 39 Projects tests, 9 profile-guard groups and new record invariants; actual DSIM import/calendar status checks |
| Meter/launch correction, frequency checker and drop math | Retained 17-group complete-workflow golden test and 16-assertion frequency regression; independently corrected launch in seven-example replay |
| Return sweep helper and voltage-unit converter | Retained record/sweep tests plus new relative/absolute plane and signed round-trip probes |

The retained engine 41, Projects 39, route 34, Wolfram RF 25, Wolfram power 30 and prior profile-guard suites were executed during this audit. Root runs the complete project suite after integration; these overlapping counts are not additional release totals.

## Performance and practical limits

[core-performance-baseline.json](core-performance-baseline.json) records warmed local timings on a synthetic 200-active route. Median core timings were approximately 1.64 ms for one RF frequency, 1.11 ms for route distances, 1.70 ms for TDR, and 123.64 ms for a complete 121-frequency RF grid. These are measurements on this execution environment, not phone guarantees. The pure power loops were practical at 200 points. No unrelated engine cache or algorithm rewrite was introduced; the frontend owner separately addresses repeated evaluations during a refresh.

One qualified direct-call limit remains: a malformed low-level `dcRoute` argument with a non-string/missing parent can throw. Normal import/state validation rejects that shape before replacing state; supported invalid string references return unavailable results. This is not reported as a demonstrated user-workflow arithmetic failure.

Data-quality guidance supported the unit/domain/missing-value checks, Wolfram supplied actual new numeric references, and local execution supplied the regression and backtest evidence. Arithmetic agreement does not authenticate every inherited source-table transcription or establish actual installed equipment settings. No physical phone, instrument, power-passing or live-plant acceptance test is claimed. Full app every-function/every-branch runtime coverage is not established by these focused mathematical suites.
