# Local ONX archive import Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development task by task.

**Goal:** Unpack ZIP, gzip CDM JSON and JSON measurement exports locally and autofill measured information for a confirmed station/physical port.

**Architecture:** Inspect bytes into a normalized report before mutation. Forward absolute sweeps retain the established TP correction flow; reverse-relative and OneCheck diagnostics become separate station evidence. The UI previews metadata, series and tables and explicitly confirms the destination.

**Tech Stack:** Existing ES modules, fflate, node:test, Chromium/Playwright. No runtime network or added dependency.

**Spec:** This document, user request, docs/rebuild/SPEC.md and app/CONTRACT.md.

## Global Constraints

- Private originals and extracted content remain outside Git and public build folders. Only synthetic test data is committed. No external upload, source HTML execution, iframe, eval or DOM insertion.
- Keep 20 MiB input and 10 MiB JSON limits; bound HTML, actual decompressed output and archive record counts. Reject malformed, ambiguous or unsafe archives. Never extract archive paths to disk.
- Preserve raw readings and metadata/provenance. Unknowns remain unknown. Meter model never becomes plant equipment model; filename c# never selects a physical port.
- Only forward Absolute MHz/dBmV sweeps may enter readings/portSweeps. Reverse relative dB, DOCSIS transmit levels, channel-plan levels and OneCheck diagnostics remain separate evidence.
- Preserve existing TP correction exactly once and explicit nonzero-compensation declaration. Relative curves receive no physical-loss offset.
- Review/cancel/job change/new import must never partially mutate state. Imported originals are local IndexedDB content addressed and included in local backups.
- Existing build6 branch/PR62, no merge/deployment/signing. Claude unavailable; identify actual reviewers.

## Review Focus

1. ZIP containing report HTML plus channel_plan.json: recognize measured report, never nominal plan values as measurements (task1/3).
2. Reverse-relative MHz/dB curve or OneCheck upstream Tx: never replace forward RF (task1/2/3).
3. Gzip bomb, multiple measurement documents, duplicate/traversal entry names and malformed JSON: bounded explicit failures (task1).
4. Import cancelled or superseded during decompression, compensation declaration or original persistence: no late station writes (task3).
5. Local backup/restore preserves evidence metadata and matching original bytes without collecting public artifacts (task2).

### Task 1: Bounded archive inspection and normalization

Files: new app/onx-report.mjs (and archive helper if useful), app/io.mjs, synthetic tests/onx-report.test.mjs and tests/io.test.mjs.

Interfaces:
- inspectONX(bytes,{filename}={}) -> Promise<report>.
- Report {kind:'forward-sweep'|'reverse-relative'|'onecheck'|'channel-plan',direction:'forward'|'reverse'|'mixed'|'none',metadata:object,series:array,tables:array,warnings:string[]}.
- Series {id,label,direction,frequencyUnit,levelUnit,samples:[[number,number]],...source annotations}. Tables {id,label,columns:[string],rows:[[{value:string|number|boolean|null,status?:string}]]}.
- metadata includes filename,memberName,sourceFormat,testName,testTime,status,meter/workOrder/testPoint/reference/configured compensation when available; old infoGroup/setupGroups/test IDs remain available for forward compatibility.
- correctONXSweep(report,options) -> prior parseONX return {samples,rawSamples,metadata,correction}; refuses all non-forward-sweep reports and requires exactly one Absolute MHz/dBmV source.
- parseONX(bytes,options) stays compatible as inspect+correct entry point. replaceSweep rejects reports marked non-forward; manual untyped samples remain supported.
- [ ] Add synthetic regressions and observe failure: gzip CDM reverse, CDM OneCheck, HTML+channel plan ZIP, two forward native ZIPs, configured-vs-measured distinction, malicious HTML inertness, malformed/oversized/ambiguous archives.
- [ ] Implement magic detection, bounded decompression and schema-specific normalization. HTML uses pure text parsing, never executes or loads resources. Native forward samples maintain exact current correction semantics. Preserve OneCheck table categories and all useful reported diagnostic tables; plot closures must not become RF.
- [ ] Run focused tests and private in-memory replay of all five uploads (summaries only, no private fixtures in Git); commit authored parser/tests only.

### Task 2: Separate evidence persistence

Files: app/measurements.mjs, app/store.mjs, tests/measurements.test.mjs, tests/store.test.mjs.

Interfaces:
- saveMeasurementReport(job,nodeId,port,report,{id,stage,originalHash}) -> cloned job. Adds/replaces node.measurementReports record {id,port,stage,originalHash,report}. Does not touch readings/portSweeps. Validate destination known physical port, report kind/series/table shape and bounds.
- Store validation and original hash collection include measurementReports and survive local backup/import.
- [ ] Prove reverse/OneCheck evidence leaves RF state unchanged, valid report persists, invalid report fails atomically, backup original roundtrip retained.
- [ ] Implement helper/shared validation, storage traversal and focused tests; commit authored files only.

### Task 3: Preview/autofill integration

Files: app/ui.mjs, new app/onx-import-ui.mjs if useful, app/style.css, tests/ui.test.mjs, tests/browser.cjs or separate synthetic built-browser helper.

- [ ] Replace onx browser-confirm chain with in-app review showing detected type, filename/source label, date, meter, configured TPC, sample range, available series/tables and warnings. File picker accepts .gz/.cdm.json.gz in addition to existing types.
- [ ] Destination station and known physical port are explicit, default to import origin. Filename is advisory only. No equipment model/tag or physical port silently overwritten.
- [ ] Forward import asks direct vs verified TP loss, before/after and nonzero compensation declaration; saves corrected sweep and report atomically. Reverse/OneCheck/channel-plan save typed evidence only with explanatory copy.
- [ ] Show imported reports on station details with populated metadata, separately labeled curves/tables/units, no raw HTML. Permit viewing prior report after reload. One trace at a time remains.
- [ ] Guard context with generation plus job and station snapshot checks, including after putOriginal. Cancel/supersede must not save. Add synthetic UI/browser cancellation and success coverage; commit authored files only.

### Task 4: Review and acceptance

- [ ] Independent task-scoped and Astra final review; resolve Important findings with focused regression coverage.
- [ ] Run npm ci, npm test, npm run build, npm run test:browser and npm run test:ai-browser; private browser import all five examples without external requests. Record actual counts.
- [ ] Confirm private filenames/identities/content absent from tracked changes/public artifacts, update docs and existing draft PR62.

## Rulings and ledger

- Implementation proceeds under the user's explicit request to add unpack/autofill, keeping their existing import workflow and adding a reversible review. OneCheck is evidence-only because exported channel/OFDM/DOCSIS contexts differ from a calibrated forward sweep; cost: no automatic forward-target change from diagnostic reports.
- Multiple forward candidates or measurement documents fail with an explicit ambiguity message rather than choosing the first. Originals remain available for future expanded support.
- Metadata is autofilled into the imported report; plant equipment identity and installed settings require separate confirmation and are not inferred from meter metadata.
