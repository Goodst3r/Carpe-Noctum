# NightSweep 1.8 Alpha calculation and catalog audit

Audit date: November 11, 2026. Inputs are the supplied Build 22 source, the local 1.8 changes, and synthetic references. No field measurements were uploaded to an external tool.

## Confirmed defect and repair

**Records could report `Within entered limits` for contradictory equipment criteria.** A measured forward record at 261/993 MHz, with design upper 1200 MHz and equipment upper 1002 MHz, passed the numeric check even though its coverage text warned that the design exceeded the hardware. The calculation checked the markers against the hardware but did not reject the contradictory profile itself.

`ProjectMath.evaluate` and its coverage explanation now share profile band validation. Forward hardware, design, live spectrum and floor must be within 5–1800 MHz; the design/live upper cannot exceed the hardware; the design/live upper cannot fall below the forward floor. Return ceiling and forward marker must be in range and correctly ordered, and an entered forward floor must not overlap the return band. Planning records remain planning; missing criteria remain incomplete. These changes do not edit or delete saved records.

`qa/alpha18-math.test.cjs` first reproduced the false positive, then passed after repair. It contains nine grouped checks for contradictory profiles, unsupported ranges, valid 42/54 and 1800 MHz boundaries, and retained planning/missing-data behavior. A separate overlap case also failed before the corresponding guard was added.

## Independent numerical references

The Wolfram plugin actually evaluated the ten synthetic cases retained in [math-wolfram.json](math-wolfram.json). [../../qa/alpha18-numeric.test.cjs](../../qa/alpha18-numeric.test.cjs) compares them with the app functions, and writes [math-data-audit.json](math-data-audit.json).

| Case | Independent result | Units |
| --- | ---: | --- |
| 31 at 54 / 43 at 860, square-root estimate at 57 | 31.1099490779957 | dBmV |
| Same square-root estimate at 753 | 41.9708041228738 | dBmV |
| Same linear-MHz estimate at 550 | 38.3846153846154 | dBmV |
| 400 ft plus 20 ft slack, P3 .625 at 750 MHz, 104°F | 7.745136 | dB |
| 2000 ft plus 100 ft slack, 1.1 Ω/kft loop at 68°F, 104°F and 0.004/°C | 2.4948 | Ω |
| −4 dBmV TP reading plus 20 dB remaining coupling | 16 | dBmV |
| 10 dBmV network injection plus 20 dB coupling plus 1.5 dB lead | 31.5 | dBmV physical output |
| 500 ft displayed TDR, VF 0.82 to 0.87, remove 25 ft lead | 505.487804878049 | ft |
| Stable high-voltage root, 90 V source / 2 Ω / 180 W at PF 1 | 85.8044115262063 | V |
| Current at that root | 2.09779423689683 | A |

All ten application comparisons passed their recorded tolerances (1e−8, or 1e−7 V for the iterative voltage solver). These values verify arithmetic under the stated assumptions. They do not establish actual carrier availability, an installed equalizer response, test-point compensation, approved injection, physical TDR continuity across an active, or RF acceptance.

## Catalog quality and runtime checks

The table grain is one cable/device/power-model identifier; each device has named output paths, with optional nominal/maximum curves. Runtime checks covered 516 device entries, 17 cables and 25 power equipment entries, including retained legacy and custom definitions. These are raw catalog counts, not counts of currently selectable equipment.

- Identifier uniqueness across each collection and output-path uniqueness per device.
- 1,324 finite, ordered curves with 14,126 nonnegative numeric rows.
- Every printed point (12,219), printed band endpoint (3,814), fractional band gap midpoint (713), and both out-of-table probes per curve (2,648).
- Qualified gaps use only their declared adjacent-maximum policy; unqualified gaps and out-of-table frequencies remain unavailable.
- Existing checks also verify DC inner-plus-outer loop resistance, blank input handling, tap versus through paths, active gain interpolation, temperature corrections, branching, unsupported tables, and overflow rejection.

These checks found no additional engine, frequency-checker or catalog arithmetic defect. They do not independently retype or authenticate all inherited manufacturer table values. Exact installed modules, firmware, measurement planes, equipment limits and current documentation qualifications remain as described by the project.

## Commands executed by this audit

All completed successfully after the Records repair:

| Command | Current result |
| --- | --- |
| `node qa/alpha18-math.test.cjs` | 9 grouped checks |
| `node qa/alpha18-numeric.test.cjs` | 11 grouped checks, including the catalog scan |
| `node qa/engine.test.js` | 41 checks, including 100 generated branch circuits |
| `node qa/projects.test.js` | 39 tests |
| `node qa/frequency-regression.cjs` | 16 assertions |
| `node qa/route14.test.cjs` | 34 checks |
| `node qa/alpha17-engine.test.cjs` | 8 checks |
| `node qa/wolfram-rf.test.cjs` | 25 grouped checks / 39 retained external expectations |
| `node qa/wolfram-power.test.cjs` | 30 grouped checks / 409 catalog endpoint and midpoint cases |
| `node qa/wolfram-records.test.cjs` | 9 checks |
| `node qa/catalog-audit.cjs` | PASS; 1,324 curves / 14,126 rows |

Counts above belong to these commands and overlap in scope; do not sum the catalog probes into the application's release-suite total. Root release verification records the complete build/test run separately. No physical Android, iPhone, installed instrument, or plant test was performed by this audit.

Tools used: Data quality skill for profiling/interpretation, Wolfram for the actual independent calculations, local Node/Python execution for comparisons and catalog checks, Superpowers debugging/TDD guidance for the reproduced Records defect. Wolfram context discovery returned no relevant engineering formula result; the explicit evaluator supplied the numeric evidence.
