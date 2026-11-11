# NightSweep 1.7 Alpha numerical review

Checked November 10, 2026. This note records actual source review and checks from this request. It does not certify equipment specifications, installed plant behavior, physical phones or every possible input.

## Scope reviewed

The numerical paths reviewed were:

- `engine.js`: finite-number handling, curve/table interpolation and range limits, launch interpolation, passive paths, entered active gain, span/slack distance, branched route continuity, TDR location and velocity factor, RF temperature correction, gain reserve/output-limit separation, chart grid, DC resistance and the scalar RMS power solver.
- `meter.js` and `app.js`: explicit test-point addbacks, launch-table corrections, corrected output minus corrected input, measured/predicted difference, launch frequency/level validation, and chart loss/normalization arithmetic.
- `projects.js`: corrected readings, target/tilt errors, tolerance boundaries, return pad estimate sign, coverage qualifications, criteria approval and generator addback.
- `frequency.js`, `route-tools.js`, `field-reference.js`, `field-work.js`, `field-report.js`, and `sweep-setup.js`: exact loss overrides/quantity, separate tap-through/drop paths, target range centers and equal half-widths, dBµV/dBmV reference conversion, power what-if, relative versus absolute return arithmetic and physical injection budget.
- `nodes.js` and equipment setup: selected hardware bands remain separate from live spectrum and local targets. DSIM lookup is a literal historical reference, not a calculated code generator or RF acceptance test.

The retired `dcRoute` helper is not a currently exposed field calculator. The exposed power tool uses `powerRun` with its own explicit circuit and temperature. No removed DC-loop screen was reintroduced.

## Fresh independent reference computation

Wolfram's evaluator was actually called in this request. It returned 15 named synthetic reference results, including vector results. The app comparison script exercised **18 numerical/rejection checks**, all passing at an absolute tolerance of `1e-8` for finite scalar comparisons.

Evidence and reproducible checks:

- `alpha17-math-audit-fresh-wolfram.json`: original returned evaluator content and independent expected values.
- `alpha17-fresh-reference-check.cjs`: comparisons against the current app modules.
- `alpha17-fresh-reference-results.json`: actual app values, expected values and tolerances from the current run.

Run from the repository root:

```sh
node night-sweep/research/alpha17-fresh-reference-check.cjs
```

| Synthetic case and explicit assumptions | Independent result | App result |
| --- | --- | --- |
| Square-root launch: 34 dBmV at 256 MHz, 46 dBmV at 1024 MHz; evaluate 576 MHz | 40 dBmV | Matched |
| Square-root cable interpolation: 1 dB/100 ft at 100 MHz and 3 at 1600 MHz; evaluate 625 MHz | 2 dB/100 ft | Matched |
| 300 ft at 2.5 dB/100 ft, cable 104°F; modeled factor `1 + 0.001 × (104 − 68)` | 7.77 dB | Matched |
| Input 7.1, output 16.1 dBmV; equal 20 dB remaining corrections | 9 dB gain | Matched |
| TDR displayed 200 ft, meter VF 0.80, actual VF 0.88, physical lead 20 ft | 200 ft into modeled route | Matched; no extra divide-by-two |
| Loop resistance 1.1 Ω at 68°F, 104°F cable, coefficient 0.004/°C | 1.188 Ω | Matched |
| Constant 180 W, unity PF, 90 V source, 2 Ω series; high-voltage steady solution | 85.80441152620633 V; 2.097794236896835 A | Matched |
| Constant 2000 W, unity PF, 90 V source, 2 Ω series | Quadratic discriminant −7900; no real steady solution | App rejected the unusable solution |
| Shared trunk 1 Ω with downstream fixed loads 1 A through 2 Ω and 2 A through 3 Ω | 87 / 85 / 81 V; 23 W wire loss | Matched |
| Same-plane voltage reference conversion: 72 dBµV | 12 dBmV | Matched |
| Desired network-plane injection 31 dBmV plus 20 dB physical coupling and 1 dB physical lead | 52 dBmV physical generator output | Matched; does not specify ONX compensated-field entry |
| Raw receive −14 / −12 dBmV plus 20 dB remaining receive addbacks | 6 / 8 dBmV | Matched |
| Relative return readings −0.2 / +0.4 dB versus 0 / 0 dB relative targets | +0.6 dB tilt error | Matched; no physical receiver level inferred |

Agreement validates the supplied arithmetic relationships and these specific values. It does not validate the assumed cable temperature coefficient, actual measurement plane, instrument compensation, power factor or manufacturer table for a field installation.

## Existing source/reference suites rerun

These seven numerical suites were run directly against current source; none invoked an app build. Each command exited zero. Full logs are retained in `alpha17-numerical-audit-logs/`.

| Command | Actual result |
| --- | --- |
| `node qa/engine.test.js` | 41 grouped engine checks; includes 100 generated branch-circuit cases |
| `node qa/route14.test.cjs` | 34 route, active-gain and TDR checks |
| `node qa/projects.test.js` | 39 project-record checks |
| `node qa/frequency-regression.cjs` | 16 frequency assertions |
| `node qa/wolfram-rf.test.cjs` | 25 grouped checks against 39 retained external numeric expectations |
| `node qa/wolfram-power.test.cjs` | 30 grouped checks, including 409 catalog endpoint/midpoint cases |
| `node qa/wolfram-records.test.cjs` | 9 record/return-reference checks |

These are audit-run results, not a claim that the final integrated release runner, PWA, APK or a physical phone passed. Root owns the final build, integrated runner and device-test statements.

## Boundary and assumption review

- Blank, structured, nonfinite, negative-length/slack and overflowing inputs are rejected or leave values unavailable. No unavailable loss/current value is substituted with zero.
- Launch/gain/cable/passive curves remain within their applicable data bounds. Signed gain and measured levels are allowed where meaningful; passive losses remain nonnegative.
- Non-shared printed band upper endpoints are included. Shared endpoints use the next band. Fractional printed gaps are filled only for explicitly qualified `adjacent-maximum` curves; other gaps and all extrapolation remain unavailable.
- Invalid hidden graph bounds no longer invalidate a valid RF route. The graph grid still rejects its own invalid view range.
- Test-point addback signs remain explicit. Equal input/output addbacks cancel in gain; meter compensation must not be added again. Node TP shortcuts are scoped to source launch rather than arbitrary downstream equipment.
- Tap coupling and trunk through loss remain different paths. Branch distances and power currents follow their own topology, not the sum of unrelated spans.
- Gain headroom is distinct from output/distortion capability. Missing output limits remain unknown. Published reference gain does not become an assumed flat installed response.
- Custom cable/exact overrides use entered conditions without a second temperature adjustment. Built-in RF and DC cable temperature calculations preserve their separate stated coefficients and reference conditions.
- Power calculations are scalar RMS planning estimates. They reject out-of-table current lookups, nonconvergence and unusable voltages. The audit is not a waveform/phase simulation or utility-input-current calculation.
- TDR values are treated as instrument-displayed one-way distance. VF correction occurs once, followed by removal of physical lead length. An intervening active blocks inferred cable continuity.
- 42 MHz return sweepless remains relative/reference-based. The 204 MHz workflow keeps absolute receive addbacks separate from physical injection coupling. Mismatched bandwidth, sweep view and reference plans remain blocked where required.
- DSIM code copying does not mark verification or reviewed setup. Equipment replacement, firmware/pilot changes and unbound legacy DSIM context require current-equipment confirmation; original historical data remain in backups.

No unresolved numerical mismatch was found in the cases exercised. Remaining material limits are manufacturer-data applicability, exact installed revisions/parts, field measurement and compensation conventions, scalar power-model assumptions, and physical Android/iPhone behavior. A matching number is not RF acceptance.
