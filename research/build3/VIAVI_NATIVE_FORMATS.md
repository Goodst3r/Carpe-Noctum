# Bounded native sweep preview

This adapter supports two inspected VIAVI JSON layouts. It is a narrow offline
preview of explicit samples, not a general vendor-file decoder or an acceptance
procedure. Source identifiers and operational metadata are not part of its output.
All committed fixtures are generated from invented values by
`qa/fixtures/viavi-synthetic/generate.py`; it never reads a meter export.

## Supported technical structures

### Test-group layout (`viavi-testgroup`)

The JSON root has `testGroup.tests[]`. The adapter enumerates a test with
`id = sweeplessSweep`, its `resultGroups[]` entry with `id = sweep`, and its
`resultSeries[]` entry with `id = Levels`.

- `independent` declares `label = Frequency`, `type = set`, `units = MHz`, and
  an explicit numeric `values[]` vector.
- Each `dependent[]` declares `type = set`. `label = Absolute` requires `dBmV`;
  `label = Referenced` requires `dB`. Nonempty vectors must match the frequency
  vector exactly in length.
- An empty Referenced vector is skipped with an explicit warning. It supplies no
  response, zero, reference correction, or flatness pass.
- Exactly one nonempty supported trace is required. Multiple traces attach with
  an ambiguity reason. The adapter never picks one arbitrarily.
- The observed typed fields do not establish direction. Direction remains
  `unknown`; the file's name and a Sweepless Sweep test ID do not determine it.

### CDM version 2.0 (`viavi-cdm2`)

The JSON root declares `cdmVersion = 2.0` and `tests[]`; a sweep test declares
`type = sweepmode_app`. The adapter enumerates objects in `results.data`:

- A chart declares `eType = resultSeries`, `type = line`,
  `xAxisLabel = MHz`, and `yAxisLabel = dBmV`.
- Its supported child declares `eType = series`, `name = Unreferenced`,
  `dimensions = 2`, `units = [MHz, dBmV]`, and explicit numeric `[x, y]` pairs
  in `data[]`.
- Every pair's explicit x is preserved, including irregular spacing. Display
  axis bounds never reconstruct missing samples or extend trace coverage.
- A chart label containing `Sweep` and exactly one of `Forward` / `Reverse`
  establishes direction. Missing or conflicting words give `unknown`.
- The typed Unreferenced trace establishes raw absolute-level samples. A
  recognized reference-name/date table conflicting with the `NONE` / `---`
  sentinels makes reference state `unknown` with a warning. It does not change
  samples. Unknown trace names or inconsistent units are unsupported.

Neither layout uses TPC, limits, source pass/fail status, test-point settings,
marker tables, reference labels, bandwidth labels, or company defaults as a
correction or acceptance rule. Those fields remain in the retained source bytes.
Unknown metadata is not copied into the normalized result. Marker tables are not
normalized by this implementation; downstream markers use the explicit samples.

## API and validation

`EvidenceCore.parseText(text, filename, kind)` retains existing CSV support and
recognizes `.json` for the layouts above only when `kind = Sweep`. Unrecognized
JSON, including application-backup JSON, is an inert attachment; no state-loading
function is called. One explicit point can preview; the grading core separately
requires sufficient point coverage.

The normalized series is unchanged: `{unit, label, points}`. Only sorted copies
of pairs are emitted. Both source x and y must be finite JSON numbers, with no
null, boolean, string-number, or missing-value coercion. Frequencies must be
unique and within the existing inclusive 5–1800 MHz range; the existing finite
scalar envelope and 10,000-point cap apply.

The optional `parse.native` descriptor has a strict allowlist:

| Field | Values |
| --- | --- |
| `format` | `viavi-testgroup`, `viavi-cdm2` |
| `direction` | `forward`, `reverse`, `unknown` |
| `referenceState` | `unreferenced`, `referenced`, `unknown` |
| `warnings` | Optional array, at most eight nonempty technical strings of at most 200 characters, no control characters |

The parser itself emits static technical warnings only. It never copies source
labels, IDs, comments, dates, coordinates, device information, or work orders to
this descriptor. Old parse records remain valid. Persisted descriptors require
the Sweep attachment category.

`EvidenceArchive.parseBytes(Uint8Array | ArrayBuffer, filename, kind)` returns a
Promise of an EvidenceCore-compatible result. It never mutates the input bytes.
Original-byte hashing, retention, and backup remain the evidence UI's responsibility;
they occur on the original bytes, rather than on decoded/re-encoded text.

## Offline archive envelope

There are no new runtime dependencies. Plain JSON and existing CSV decode with
fatal UTF-8. `.gz` (including `.json-1.gz`) decodes one bounded gzip payload as
native JSON. ZIP supports exactly one JSON candidate and safe ancillary entries,
with stored or deflate compression. The platform `DecompressionStream` supplies
`gzip` / `deflate-raw`; missing browser features yield an attachment with a clear
reason. Stored ZIP can decode without a decompression feature.

- Original input cap: 8 MiB. Decoded UTF-8 / aggregate ZIP payload cap: 2 MiB.
  ZIP cap: 32 entries. Output chunks are counted before retention; an over-limit
  decompression reader is canceled.
- ZIP central/local headers, entry names, sizes, offsets, nonoverlapping record
  ranges, CRC32 for every member, and signed/unsigned data descriptors are checked.
  Central sizes are authoritative when descriptor mode leaves local sizes zero.
- Encryption, ZIP64, multiple disks, unsupported methods/flags/versions, traversal,
  absolute/backslash paths, duplicate names, ambiguous JSON members, malformed
  headers, truncated data, mismatched sizes/CRC, and unsupported record gaps fail
  closed as attachment-only evidence. No filesystem extraction occurs.
- Archives are not recursively opened. ZIPs containing only nested archives are
  unsupported. Compressed output never dispatches a project backup loader.

This deliberately excludes other VIAVI versions/layouts, generic arrays, XML,
PDF/OCR, encryption, ZIP64, and inferred reference response. A browser lacking
`deflate-raw` can still retain and export the original ZIP for later use.

## Independent reference and executed scope

The fixture generator uses Python's standard-library `zipfile` writer and
`gzip.compress`, including a nonseekable writer for data-descriptor ZIPs. Python
creates the member CRC and size declarations independently of the JavaScript
parser. An ancillary `123456789` payload also exercises the standard CRC32 check
vector (`0xcbf43926`). These bytes and samples are invented, deterministic test
assets, not private source bytes.

The dedicated Node suite covers both typed layouts, empty/ambiguous traces,
explicit irregular x, metadata conflicts, units and numeric validity, archive
integrity/limits, platform-feature fallback, unchanged input bytes, and browser
UMD exports. Existing CSV/evidence and grading suites remain separate regression
checks. Rendered UI, full application gate, Android, Safari/WebView, and physical
phone checks belong to integration/device verification and are not claimed by
this module change.

Documentation consulted: WHATWG Streams reader/cancellation guidance via Context7
(`/whatwg/streams`); platform behavior was verified by executing the real Node
`DecompressionStream` implementations, rather than substituting a decompressor.
