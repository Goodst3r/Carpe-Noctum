# Build 3 Night log and shift handoff (A2)

This is a personal offline notebook and captured technician record, not an official handoff form or RF acceptance. No new RF formula, numerical RF limit, company target, tolerance, fuel conversion or worked-hours calculation is introduced.

## Product scope and authority

- `handoff_docs/PARALLEL_TASKS.md`, Lane A A2 / build-list item 6: use Station Before and After readings, plain-text handoff and CSV; exclude customer identifiers.
- `docs/BUILD_LIST.md`, item 6: running window ticket, node/amp, actions, ROC/dispatch updates, gas, mileage, as-built and next shift. The item mentions Spectrum MT postings, but its original posting URL/revision is not supplied in this research. These are product requirements, not a verified industry procedure.
- `research/build3/STATION_VIEW_SOURCES.md`: distinct forward, injection and receiver measurement planes; unknown company targets/tolerances; separate balance and sweep work. A2 only preserves the existing worksheet's data and frozen result projection. No test-point correction, conversion or part recommendation runs in Night log.
- The approved A2 implementation brief (reviewed against integrated A1 at `21ed711cacbc03359e1418f79b9af6f76888ede5`) supplies the bounded optional contract, explicit capture choice, history labels, text quantities, local window convention, formatting and defined five-station screen fixture. There is no sourced universal official handoff template, timezone or reimbursement unit.

## Executable source interfaces

`night-sweep/night-log.js` calls `StationView.records(owner)` at the actual Add click and allowlists identity, equipment ID/label/context, binding/read-only/split state, both raw stages, dates and the finite result values/errors needed for reports. Raw text and unrounded result values remain in JSON. No hidden refresh or future-catalog recalculation changes the captured payload. History compares the current read API's identity and equipment context; neither route-ID reuse nor replacement transfers a snapshot.

The projection intentionally omits Alignment's catalog advice/part-pick prose and arbitrary injected keys. It retains all eleven forward numeric result fields (or explicit error) and the three independent return result objects. This is a report projection of the existing result, not new RF math. Formatting uses two decimal places for levels/deltas and up to three for pilot MHz, with signed zero normalized after rounding. Pad/EQ/tolerance text remains raw.

`validateImport` validates the optional top-level `nightLog` before state replacement. No schema/version/package/storage key is changed. Existing compact autosave, named snapshots, duplication and the full portable evidence backup preserve it. The original Station and route calculations are never written by Night log. The bounds (200 entries and field lengths) protect storage; they are not RF criteria.

TXT/CSV use the existing `download` path and build-3 filenames. Every CSV cell uses `csvCell`, including the documented spreadsheet-safe apostrophe representation for formula-like text. One rectangular header covers a row per stage, or one blank-stage general row. Exports omit legacy address/lead/project-note fields and attachments. File preparation is not proof of physical save; BrowserFiles cancellation/error messages are retained.

## Practice and verification scope

The six-active Vecima/AOI practice guide teaches manual entry into A1–A5 Station worksheets, followed by explicit captures. It does not seed company targets into real jobs. `qa/night-log-fixture.js` is a defined invented short-label fixture using actual UI handlers. Its full five-station preview is tested at 390×844; arbitrary long notes or 200 entries may scroll and are not truncated.

Focused contracts are in `qa/build3-night-log.test.cjs`; rendered phone-width checks are in `qa/build3-night-log-layout.test.py`. Execution receipts and exact source/artifact hashes belong to the implementation report and lane validation record, not inferred from this source note. Desktop Chromium, emulated widths and native bridge mocks do not establish Android/iPhone/Safari/WebView, meter/reference-plane or field verification. No APK is built or signed by A2.
