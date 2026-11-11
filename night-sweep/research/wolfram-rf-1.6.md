# NightSweep 1.6 Alpha — RF, distance and display arithmetic audit

Checked 2026-11-10 against the connected Wolfram Language evaluator. This is a source and numerical audit of the formula families below, not certification of a live HFC plant, an exhaustive proof for every possible input, or verification of the underlying manufacturer specifications.

Reproduce: `node qa/wolfram-rf.test.cjs` from the repository root. It consumes 39 fixed numeric results computed by Wolfram, exercises every result, and currently passes 25 grouped checks. Existing engine (41 groups, including 100 generated branch circuits), route/active/TDR (34 groups), and frequency (16 assertions) regressions also passed after these changes.

The literal main query and unmodified tool response are in `wolfram-rf-main-response-1.6.json`; the machine-readable expected numbers and the same query are in `wolfram-rf-1.6.json`. The literal supplementary query and response are in `wolfram-rf-extra-1.6.json`. The supplementary response is parsed directly by the test. Main expected numbers were transcribed from the successful evaluator output and checked against the repeat response. Normal numeric comparison tolerance is 1e-9; generated SVG coordinates use 0.006 pixel tolerance because the app rounds coordinates to two places, and axis labels use 0.051 because they are rounded to one place.

## Coverage matrix

| Source / function family | Formula or decision reviewed | Independent / regression coverage |
|---|---|---|
| `engine.js number`, `parseTable`, `curveValue`, `selectedCurve`, `portsFor` | Complete finite numbers; unique increasing frequencies; nonnegative passive loss; linear interpolation; half-open bands with closed final endpoint; no extrapolation | Wolfram `passive711`; invalid values, duplicate frequencies, explicit band boundaries; existing complete catalog curve validation |
| `launchAt` | Linear or square-root-frequency two-point interpolation; signed levels; table interpolation; optional slope extension | Wolfram `sqrtLaunch576`, `sqrtLaunch711`, `linearLaunch402`; no-extrapolation and overflow checks; existing table and mode tests |
| `activeGainAt` | Measured/configured gain interpolation, anchors, flat stated band and table; installed hardware passband bounds | Wolfram `linearGain711`; negative signed gain and band-limit existing tests; scalar published gain remains a reference |
| `spanLength`, `cableAt` | Main length + slack once; cable interpolation in square-root frequency; loss per 100 ft; catalog RF temperature factor 1 + 0.001(T°F−68); actual-temperature custom values not corrected again | Wolfram `customCable576`, `cableHot`, `cableCold`; cold and hot factors; zero length; unsupported bands and overflow |
| `run` | Incoming level minus cable loss; passive loss subtraction; active gain addition minus selected-output loss; cumulative signed net loss along selected parent chain | Wolfram `legacyLowCable`, `legacyHighCable`, `legacyLowOutput`, `legacyHighOutput`, `legacyTilt`; existing active cascades and orphan suppression |
| `gainBudget` | Required gain = target + output loss − input; margin = configured gain − required gain; predicted output = input + gain − output loss; reserve and separate output ceilings | Wolfram `gainRequired`, `gainMargin`, `gainPredicted`; existing shortfall, boundary reserve, missing limit and out-of-band reference tests |
| `routeDistances`, `tdrLocate` | Path-specific cumulative distance; displayed one-way distance × actual VF / meter VF, then subtract known physical lead; reverse subtraction; active boundaries | Wolfram `tdrVF`, `tdrPath`, `tdrOffset`, `tdrReverse`, `tdrPreciseVF`; branching, exact boundaries, invalid paths, zero spans and active crossing tests |
| `frequency.js frequencyCalculation`, route summary | Per-100-ft rate × length / 100; passive path loss × integer quantity; receive level = launch − total; actual-temperature overrides; return/transition/forward classifications | Wolfram `freqLoss`, `freqReceive`; independent legacy regression covers empty launch, negative overrides, zero quantities, 204/258 boundaries and transition band |
| `meter.js meterCoupling`, `effectiveLaunchSetup`, `meterProfileTarget`, `meterComparison` | Remaining uncompensated coupling added once; corrected meter − prediction; comparison only at exact profile marker and common tolerance | Wolfram `meterConverted`, `meterError`; blank means true output; invalid/overflow conversion suppressed; table corrections reviewed |
| `app.js measuredGain`, table tilt, `drawChart` | Corrected output minus corrected input; output high−low; cumulative loss; normalized path response = loss at reference − loss at current frequency, removing launch shape | Wolfram `measuredGain`, `chartLoss`, `chartNormalized` (output H−L), `chartTiltComp` (actual normalized plot callback); actual function exercised with source extraction; root-owned nonfinite guards tested |
| `route-tools.js facePrediction`, next-face selection, `dropCalculation` | Candidate tap input − path loss; nearest lower published face; RG-6 custom loss and chosen splitter output; copied span includes slack | Wolfram `dropReceive`; copied slack regression; drop no-data handling and table range code review |
| `field-reference.js targetCalculation`, target centers, cable reference | Range midpoint and common half-width; reject unequal widths; reference loss delegates to `cableAt` | Wolfram `targetCenter`, `targetTolerance`; asymmetric-width and finite-bound guards reviewed |
| `field-work.js convert` | dBµV to dBmV: subtract 20 log10(1000) = 60; reverse adds 60; same reference plane | Wolfram `dbuvToDbmv`, `dbmvToDbuv`; empty/unknown units rejected |
| `evidence.js`, `evidence-ui.js chart` | Raw explicit MHz/dBmV or relative dB CSV; no implicit correction; sorted distinct frequencies; chart extrema, 8% padding and affine plot scales | CSV preserves negative values and units; rejects guessed units/nonfinite readings. Wolfram `evidenceMin`, `evidenceMax`, `evidenceX42`, `evidenceYMin`, `evidenceYMax` against actual chart code; scalar bound ±1,000,000 limits display range |
| `grid` and display formatting | 121 grid samples plus exact frequencies, numeric normalization and duplicate removal; finite-only display rounding | Numeric-string duplicate and nonfinite checks; physical calculations use unrounded values |
| `projects.js` | Corrected levels, tilt, target error, estimated return pad, generator and acceptance math | Primary Wolfram numeric coverage is in the root's project/sweep audit. This suite additionally tests root's fail-closed handling of overflow in corrected levels, tilt and level errors |
| `field-report.js` | Copies route results and meter comparison to field sheet; derives difference; power what-if calls engine | Root/QA cover field-sheet finite guards; power auditor covers power what-if. No separate RF propagation formula here |
| `nodes.js`, power portions of `engine.js`, new `sweep-setup.js` | Separate assigned audits | Power auditor owns NodeTools/DC/power; root owns new sweep setup and record formula audit. This report must be read alongside those results |

`jobs.js`, `training.js`, browser/file/manifest code, evidence file byte budgets and catalog UI perform state management, metadata, counting, IDs or formatting, not additional RF engineering calculations. Evidence does not extract equations or upstream data from the supplied photos. The photos remain downstream observations.

## Defects corrected in this audit

1. Finite inputs could overflow intermediate RF arithmetic into Infinity/NaN. A subnormal meter VF with zero displayed TDR distance could return `ok:true` with a NaN location. Finite-result guards now suppress unusable RF/active/loss/meter/frequency results and reject unusable route/TDR distances. Gain budget output-limit status stays unknown when a derived margin is unavailable.
2. Same span, next tap copied cable length but omitted slack. Copied spans now preserve slack, so distance and RF loss use the same physical span as the prior point.
3. Frequency grid extras accepted numeric strings without normalization, allowing duplicate numeric frequencies. They now normalize through the finite-number parser and deduplicate.
4. Frequency export filename still said 1.5 Alpha; it now says 1.6 Alpha.

The root audit separately corrected project acceptance, measured gain, normalized plot and field-sheet nonfinite handling. Relevant pure regression checks are included here; the DOM test suite covers display behavior.

## Practical limits

- Wolfram verifies the stated arithmetic, not manufacturer tables, field calibration, measurement-plane choice, channel-power bandwidth or the validity of an operator's targets.
- RF cable temperature scaling is the app's declared engineering estimate. Custom cable tables are assumed to be at actual temperature. No extrapolated cable loss is invented.
- TDR VF correction assumes one effective velocity factor. A lead or mixed cable sections with different VF need calibration; the displayed distance is already one-way and is never divided by two.
- Graph normalization represents modeled path loss, not a measured sweep, ripple diagnosis or acceptance across unmeasured spectrum.
- The finite-result guards intentionally report unavailable values for extreme arithmetic outside JavaScript's representable range, even where arbitrary-precision mathematics could compute a finite answer.
