# Build 2 power calculation backtest

`node qa/build2-power.test.cjs` passed **15 grouped checks, 16,286 numeric comparisons** in the current Build 2 workspace. It writes inspectable per-case results and input hashes to [power-backtest-results.json](power-backtest-results.json). The suite reads source modules directly; the release owner's full frozen QA is a separate check.

The audit found no power arithmetic defect in the supported typed-input workflows and made **no production power-code changes**.

## Independent cases and invariants

- Wolfram actually evaluated the synthetic 95 V / 1.75 Ω / 250 W / PF 0.8 high-voltage solution and an independent mixed amps/VA/watts branch. The exact evaluator code and response are retained in [power-wolfram.json](power-wolfram.json).
- 100 deterministic 25-point mixed-mode circuits and two 200-point circuits (serial and balanced branching) use independently constructed operating currents/voltages. An ancestry-membership calculation checks section currents and complete-path voltage drops, independently of the engine's reverse accumulation. Constant-current synthetic tables exercise curve mode alongside watts/PF, VA and amps.
- All current catalog manufacturer-curve segments were tested at 10%, 50% and 90% interior points, with 0, 0.25, 1 and 5 Ω series resistance: **2,340 cases**. Each test chooses a target voltage/current from the literal line segment, independently derives the needed source voltage `Vsource = Vequipment + R × I`, then verifies the solver returns that operating point. Every case preserves the actual bounded current-table domain.
- Every generated circuit checks scalar current conservation, voltage drops and apparent-source-power accounting against equipment `V × I` plus wire `I²R`. These verify the app's documented scalar-RMS approximation; they are not phasor or true utility-power assertions.
- Fahrenheit temperature boundaries −40°F and 185°F, slack, actual-temperature overrides, extra contact resistance, zero loads, missing ratings, signed overload/undervoltage warnings, voltage collapse, invalid numeric values, parent cycles/order/duplicates and the 200-point cap are exercised.
- Legacy DC selected-endpoint checks exclude sibling branches. The actual `FieldReport.calculatePowerWhatIf` recalculates a copy, preserves the baseline and enforces the point cap.

Fresh Wolfram reference examples: the 95 V case gives **88.84458852135307 V**, **3.517377987798246 A**, **21.65090884083337 W** cable heating and **334.15090884083337 VA** source estimate. The constructed mixed branch returns **89.91 / 89.85 / 89.79 V** and **0.147 W** cable heating.

## Additional executed regression

`node qa/wolfram-power.test.cjs` passed its existing **30 grouped checks**, including 409 catalog endpoint/midpoint cases and retained independent golden values. Its scope overlaps this new suite; do not add embedded table probes to the grouped release check count.

## Performance and limits

The result JSON records core-call timings for the 102 generated circuits, including both 200-point cases. These are measurements from this execution environment, not performance guarantees or browser rendering timings. No gratuitous power optimization was justified: source inspection and executed cases found the current bounded loops practical at the app's 200-point limit.

One qualified API-contract observation remains: calling the low-level legacy `HFC.dcRoute` directly with a non-string/missing `row.parent` can throw at `startsWith`. Normal `loadState` rejects those row shapes before replacing app state, and all supported string-parent invalid-reference cases return unavailable results. This is recorded as a malformed direct-call limitation, not a user-reachable power arithmetic defect; no production change or failing acceptance test was introduced for it.

No physical Android/iPhone, installed supply, equipment current, power passing, mains measurement or live-plant acceptance test is claimed. Catalog source transcription and equipment assumptions remain independently qualified by the existing documentation.
