# A4 grading core preparation record

Integration update, November 11, 2026: this document records the isolated core
preparation at `8d1a0ed`. The completed native parser/UI now has inspected input
structures, registered company criteria, original verification and saved history.
See [the integration handoff](../../handoff_docs/reviews/codex-sweep-grading.md)
and [native format scope](VIAVI_NATIVE_FORMATS.md) for the current implementation.
Statements below about pending adapters/tests describe the preparation stage.

Prepared against `4350abcf5a33dce911361a357df891abe6a386ad`, November 11, 2026.
This is an unregistered, format-independent calculation module. It does not
decode VIAVI JSON or claim native compatibility. The owner's invented structural
sample is pending; A1 job/station integration remains a separate dependency.

## Contract

`SweepGrading.evaluateSeries(series, profile)` is pure UMD (CommonJS or browser
global). No dependencies, storage, byte handling, file identity, or job changes.
It sorts copied points and never modifies either argument.

```js
series = {unit:'dBmV' /* or 'dB' */, points:[[frequencyMHz,value], ...], label:'optional'};
profile = {
  lowFrequencyMHz, highFrequencyMHz,
  ptvLimitDb,
  lowTargetDbmv, highTargetDbmv, maxLevelErrorDb,
  tiltTargetDb, maxTiltErrorDb
};
```

Only these own fields are supported. Measurements and entered criteria must be
numbers. Missing, `undefined`, `null`, empty and whitespace-only criteria remain
unknown; numeric strings are rejected rather than coerced. Literal zero is valid
for targets and magnitude limits. Negative signed targets are valid; magnitude
limits must be nonnegative. No company values or inferred tilt targets ship.

The existing parser API is documented in `/tmp/carpe-a4-prep.md` section 2 and
implemented in `night-sweep/evidence.js`. Its normalized `series` is accepted;
the sole parser interoperability test uses invented supported interchange CSV.
It does not establish a native CSV or JSON schema. The eventual adapter must
verify source kind, schema, trace selection, units, plane and original integrity
before providing a normalized sweep. Merely calling this function verifies none
of those facts.

## Math and output

Both entered marker frequencies must have exact measured samples, low below
high, with at least two points in the inclusive band. No interpolation,
extrapolation or assumed marker is used. PTV is the raw maximum minus minimum
inside that band, with no detrending, test-point/lead correction, normalization
or reference subtraction. Measured tilt is high minus low. Level and tilt errors
are measured minus explicitly entered target; comparison uses error magnitude.

The result contains numeric-or-null `metrics`, `checks`, `overall`, `reason`,
`qualification`, and `source`. Raw low/high values use `source.unit`; PTV, tilt
and errors are dB. Each check's `value` and `limit` use its `unit:'dB'`;
`targetUnit` separately distinguishes absolute dBmV targets from signed dB tilt.
`source` reports the caller-normalized unit, MHz frequency unit, validated raw
sample count/span, entered band, and actual in-band count/span. These describe
supplied samples, with explicit unverified-provenance qualification.

The four checks are `ptv`, `lowLevel`, `highLevel`, `tilt`, each
`pass|fail|unknown` with a reason. A missing target or tolerance is unknown even
when other metrics are numeric. Relative dB response cannot establish absolute
levels, so its level checks stay unknown. Overall is fail if any established
check fails; otherwise unknown if any check is unknown; otherwise pass. Every
result is a technician grading aid, never official acceptance. It does not set
balanced/swept status or register company thresholds. Later integration must
keep 42/54 and 204/258 profiles separate and initially blank.

## Bounds and numerical representation

These are software guards labeled **unknown**, not equipment specifications,
meter precision, company limits, or evidence of supported operating bands:

| Guard | Source and scope |
| --- | --- |
| 5–1800 MHz inclusive | Existing `EvidenceCore.parseText` and `validateParse` envelope |
| At most 10,000 samples | Existing `EvidenceCore.limits.samples`; two exact band markers are additionally required for grading |
| Input absolute magnitude ≤1,000,000 | Existing `EvidenceCore` scalar envelope, conservatively reused for entered numeric criteria; derived differences may be larger |
| Optional label ≤200 characters, no control characters | Existing normalized series label validation |
| Inclusive comparison allowance | `4 * Number.EPSILON * max(1, operand scale, abs(error or PTV), abs(limit))`; a representation guard only |

Numeric results retain JavaScript binary precision without display rounding.
The comparison allowance handles subtraction such as `0.4 - 0.3` and cancellation
near the existing scalar envelope. It is separate from the entered RF tolerance
and is not a new equipment-precision claim. The independent Decimal comparison
also permits that input-scale representation difference; its expected arithmetic
uses 50-digit Decimal values. Tests retain raw values and reject a 1e-8 excess
above an entered boundary, including near the scalar guard.

## Evidence and deferred work

`sweep-grading-reference.py` imports no app code and produces 12 synthetic Decimal
cases. The reference JSON includes the root's earlier WolframAlpha query URL and
clearly attributes that external result to root; this preparation did not invoke
Wolfram. The test file compares real module output against those references and
literal fixtures, including 1/2.5/4 dB at 3 dB, equality, signs, negative/zero
levels, missing criteria, duplicates, order, exact coverage, invalid units,
numeric bounds, precision, and both UMD entry points.

No module registration, parser change, UI, threshold registration, saved grading
record, source freshness binding, portable backup remapping, or native fixtures
are included. Those depend on the confirmed JSON structure and A1 context. No
app build/gate or rendered/device/field test was run for this isolated module;
unchanged existing app and generated files are checked by Git diff only.
