# NightSweep 1.6 Alpha — power and node mathematics review

Reviewed 2026-11-10. This is a bounded mathematical and software review of the implemented planning model. It is not a field certification, a new manufacturer-data audit, or proof of actual quasi-square-wave CATV operation.

## Independent computation

Two Wolfram Language evaluator calls independently solved 13 numerical cases or parameter groups. Literal code and tool responses are retained in `wolfram-power-1.6.json`. The queries used Ohm's law, Kirchhoff current balance, line heating, closed-form constant-power roots, and simultaneous nonlinear equations rather than executing the application's functions. The application's results are compared with the retained numerical outputs in `qa/wolfram-power.test.cjs`.

Examples:

| Case | Independent result |
| --- | --- |
| 90 V source, 2 A load, 3 Ω loop | 84 V at equipment; 12 W cable heating |
| Shared 1 Ω trunk, loads 0.4/1.2/0.8 A, branches 2/3 Ω | 2.4 A source; 87.6/85.2/85.2 V nodes; 10.56 W line heating |
| 180 W load, PF 1, 2 Ω, 90 V source | High stable root 85.8044115262 V; 2.09779423690 A |
| 90 W load, PF 0.75, 1 Ω, 90 V source | Scalar-model 88.6463056856 V; 1.35369431441 A |
| Shared 1 Ω trunk with 0.5 A local, 60 VA/2 Ω and 120 VA/3 Ω branches | 87.3565758487/85.9605872470/83.0202862977 V; 2.64342415125 A source |
| Piecewise table 45 V→2 A, 85 V→1 A, source 90 V, 10 Ω | 78.3333333333 V; 1.16666666667 A |
| AOI HGD retained curve at 90 V source through 5 Ω | 86.6836734694 V; 0.663265306122 A |
| AOI HGD retained curve at 75 V source through 5 Ω | 71.1458333333 V; 0.770833333333 A |
| P3 .625 nominal 1.1 Ω/1,000 ft at 104°F, α=0.004/°C | Factor 1.08; resistance 1.188 Ω/1,000 ft |
| Same cable at −40°F | Factor 0.76; resistance 0.836 Ω/1,000 ft |
| Add 300 ft/.75 A to a 1,000 ft/1 A P3 .625 trunk | Existing-point voltage 88.075 V; trial end 87.8275 V; source 1.75 A |
| 2,000 W through 2 Ω from 90 V | Quadratic discriminant −7,900: no real DC/scalar equilibrium |
| Critical load for 90 V, 2 Ω | 1,012.5 W; bounded solver does not claim stable convergence at this marginal point |

## Function and behavior coverage

| Function/area | Review and checks |
| --- | --- |
| `HFC.dcSegment` | Loop Ω/1,000 ft scaling, slack, Fahrenheit-to-Celsius temperature difference, coefficient range, actual-temperature custom override, zero length, unknown cable rate, numeric overflow. Temperature applies only to built-in cable resistance, not user-entered contacts. |
| `HFC.dcRoute` | Legacy path selection, branch exclusion, valid parent/port sequence, summed loop resistance, I·R and I²·R, invalid route and arithmetic overflow. This historical helper uses its documented default 68°F basis. |
| `HFC.powerRun` graph | Earlier-parent tree order, unique IDs, root/branch current sums, shared-trunk drops, branch voltages, 200-point limit and invalid topology handling. |
| Constant-current mode | Exact source current, node voltage, source VA and cable heating. Zero load remains valid. |
| Constant-watts/VA modes | I=P/(V·PF), I=VA/V, high-voltage solution, nonlinear branched solution, collapse and bounded nonconvergence behavior. |
| Manufacturer curve mode | Linear interpolation, exact endpoints, strict lookup domain, missing/manual-only table rejection, malformed table rejection, different curve segments and cable drop. All 409 endpoint/midpoint combinations of the retained tables passed. This confirms table use, not the correctness of every original manufacturer value. |
| Summary outputs | Supply current, apparent source VA, I²R heating, loading percentage, current headroom, minimum equipment voltage, undervoltage/overvoltage and supply-overload warnings. Blank ratings remain unknown. |
| `FieldReport.calculatePowerWhatIf` | Independent Wolfram shared-trunk example; recalculation of all affected voltages; trial input validation; custom loop resistance; optional minimum-voltage headroom; baseline object remains unchanged. No edit to this function was needed. |
| `NodeTools.number` | Finite scalar parsing; reject blank, booleans, structured values and infinity. |
| `NodeTools.profile`, `band`, `choice`, `issues`, `patch` | Every retained node split; forward floor and equipment upper boundaries; no fractional band index; EN9000 default operating upper remains separate from 1.8 GHz hardware capability; copying band limits marks criteria unapproved. These are selection/boundary checks, not electrical simulation. |

## Corrections made

1. **A valid in-range load could be rejected during initial seeding.** Previously every device began at the supply voltage. A table ending at 85 V was rejected immediately on a 90 V source even when cable drop produced a valid 78.333 V equipment solution. Tabulated loads now start within their table bounds. Every subsequent lookup and final result is still bounded; no manufacturer table extrapolation is performed.
2. **Extreme finite inputs could produce a successful result containing nonfinite derived values.** Derived power outputs now require finite numbers. Overflow returns an unavailable calculation with a corrective message. Legacy DC outputs similarly avoid returning infinity.
3. **Malformed table rows could throw rather than return an invalid-table result.** Table and point shapes are now checked before numeric validation.
4. **The node parser accepted structured numeric coercions.** It now accepts only finite number/string scalars, consistent with the main engine parser.

## Verification result and limits

`node qa/wolfram-power.test.cjs`: **30 checks passed**, including **409 manufacturer-table endpoint/midpoint cases**. `node qa/engine.test.js`: **41 existing checks passed**, including the existing 100 deterministic fixed-current branch circuits.

The model is a scalar RMS/DC-equivalent calculation. It sums current magnitudes and uses resistive loop drop; it does not solve phase angles, harmonic current, quasi-square-wave crest factor, transformer impedance, regulation, fuse coordination, standby batteries or utility-side input current. For PF below one, `sourceVA` is apparent power; it must not be described as utility watts. Manufacturer curves remain limited to their recorded hardware configurations and voltage ranges. Cable temperature is an estimate based on the chosen coefficient; equipment current temperature behavior is not modeled. Near voltage collapse, the bounded damped iteration can report nonconvergence rather than a result. A passing mathematical case does not establish RF acceptance or field accuracy.
