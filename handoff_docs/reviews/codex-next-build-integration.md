# Next-build production and QA interface handoff

Started 2026-11-14 UTC. This is the Codex integration record; Grok owns `grok-next-build-qa.md` and `qa/carpe-next-*`.

## Source pins and ownership

- Fetched build3 baseline: `248e77802f333a1a461563dfb1973315a2043d67`.
- Retained PR55 implementation: `18e7239d017882ee780864c5a2fe74e8d979ea7a`. No verified successor was listed at kickoff.
- PR59 workflow: `0501a6198ee0a672b4aaf5f238384e3d7aa3f571`, ordinary merge `0994b185bc271cd39934cbc4c04e9c71010641ad`. Conflict resolution retains the newer original-key instructions with the active workflow clearly taking precedence.
- Production branch: `codex/next-build-candidate`. First optimization commit: `d5c428a960ef5a2e59c262e8cd1ab58551c17960`.
- Codex owns production, runner registration, shared tests, guides and generated builds. Grok owns its QA branch/files; Claude reviews the finished batch. Spencer signs and performs phone acceptance off-repo.

## Public interfaces for Grok

Use `qa/build2-source-harness.cjs` (`bootApp`, `assembleHtml`) for development source tests. `NIGHTSWEEP_RELEASE_TEST=1` selects the frozen standalone in the release gate.

### RF and leg context

- `HFC.gainBudget(state, catalog, {rowId, legId})`: `main` maps to the existing `through` output; HGD `aux`/`third` and HGBT `output2`/`output3` use independent `row.workbench.legGain[legId]` gains, loss, targets and limits. Unsupported outputs refuse. Missing auxiliary targets never borrow main targets.
- `RouteWorkbench.measuredGain(reading, inputMHz, outputMHz)`: returns a finite gain or `null`. Require equal frequencies in 5–1800 MHz, known `inputPlane`/`outputPlane` (`port` or `tp`), explicit correction for each raw TP, matching `inputBasis`/`outputBasis` (`sc-qam` or `ofdm-plc`), equal positive `inputBandwidthMHz`/`outputBandwidthMHz`, and both `inputImpedanceOhms`/`outputImpedanceOhms` equal 75. Unknown context preserves raw/corrected readings but suppresses gain.
- `RouteWorkbench.balance(HFC, Alignment, state, catalog, row, stage, legId)`: existing sourced input pad/EQ solver, using explicit leg targets, output context and installed `workbench.pads`. Unsupported models or incomparable readings return `{ok:false,error}`. It never applies an adjustment or claims acceptance.
- Per-leg readings remain additive `workbench.records[leg][before|after][low|high]`; shared inputs remain `workbench.shared`. Old records stay readable without fabricated measurement context.

### ONX physical ports

- `PortSweeps.prepare(parsed, context)` validates one complete decoded sweep and creates a raw record.
- `PortSweeps.replace(owner, portId, parsed, context)` returns a new collection for `owner.portSweeps`. The caller assigns it only after successful verification. The function never mutates `owner`.
- `PortSweeps.validate(owner)` returns validation errors; absent legacy fields are accepted.
- `PortSweeps.sample(record, frequencyMHz)` returns the exact supplied sample or `value:null`; there is no interpolation, correction or acceptance.
- `PortSweeps.sourceIdentity(owner)` and `matchesSource(record, owner)` identify physical node/configuration independently of job naming/duplication. The immediately preceding identity format remains readable.
- `parsed` is the existing `EvidenceUI.verifiedParse(evidenceId).parse`: `{status:'parsed', series:{unit:'dBmV'|'dB',points:[[MHz,value],...]}}`.
- Context: `split:'42'|'204'`, `direction:'forward'|'reverse'`, `stage:'Before'|'After'|'Reference'`, `plane:'unknown'|'port'|'tp'`, `basis:'unknown'|'sc-qam'|'ofdm-plc'|'relative'`, optional positive `bandwidthMHz`, `evidenceId`, `sha256`, optional `stationIdentity`.
- The UI stores the original with the existing evidence system, verifies it again, then replaces only the selected port. Failed or stale imports retain the old sweep. Every point is preserved, with existing 10,000-point/5–1800 MHz guards and explicit split-direction boundaries.
- Portable import verifies the originals, checks the full point array against the reparsed original, and remaps each evidence reference. Existing file/count/backup limits remain in force.

### Native schedules and PDF updates

- `NightSweepMapImport.analyzeDocument(pages)` matches exact native schedule NAME/TAG cells to diagram occurrences across pages. Each candidate carries distinct `schedulePage`, diagram `page`, `exactName`, `symbolId`, `position`, and explicit confirmation state. Repeated matches require review; no cross-sheet RF connection is invented.
- `NightSweepMapPDF.plan(job)` returns `{sourceId,tombstones,skipped}`. One tombstone groups all legs for each confirmed active or EOL symbol. Absent/proposed/unconfirmed bindings are excluded; duplicate physical bindings refuse.
- `NightSweepMapPDF.exportPDF(originalBytes, job, {isCurrent?})` verifies original size/SHA-256 and returns `Promise<Uint8Array>`. `verifyOriginal` and `validate` are also public.
- `mapImportSource` adds `type:'application/pdf'` and compact `pages:[{number,width,height,pdf:{viewBox,rotation,userUnit,viewportTransform,width,height}}]`. Bindings add `symbolId`, `exactName`, `schedulePage`, and `positionConfirmed` to existing `mapImport`; launch retains its diagram position too.
- Repositioning is additive `mapTombstones[key]={sourceId,x,y}` where x/y are fractions of the displayed cropped/rotated page. The key is `sourceSHA:page:symbolId`. Out-of-page positions refuse.
- The original remains a separate immutable file, following PR55's external-original model and existing size limits. Re-select and verify it after reopening a job. Export/refresh do not replace the route, station identity, source, readings or attachments. Images remain supported draft inputs, but only PDFs can be updated.
- The writer is pinned offline `pdf-lib@1.17.1`, locally checksummed and licensed. It modifies loaded pages without flattening existing markup. The output is a newly serialized PDF; the source bytes remain unchanged.

## Optimization evidence

At PR55 cold startup: Home, then Tools, then Calculators (two navigation taps). At the candidate: Calculators immediately, no named-job creation, Route & sweep one bottom-bar tap. `qa/codex-next-navigation.test.cjs` first failed on `home != calculators`, then passed after the change. Field is removed from the bottom navigation and active group definitions. Retained meter/station/evidence/TDR and gain/readings shortcuts are checked explicitly. Guide/practice and whole-app retirement checks remain part of final integration.

## Sources, independent checks and tool limits

Wolfram independently reproduced the RF vector: input 26.5/32, output 45.5/56, gain margin 2.5/6 dB, input/output tilt 5.5/10.5 dB, high output exceeds its 55 dBmV limit by 1 dB. It also returned `10 log10(8/6) = 1.249387366 dB`; unequal bandwidth cannot be blindly compared. The reference was derived outside production helpers by the read-only RF auditor.

Firecrawl retrieved official PDF-lib API/exact v1.17.1 source; Context7 supplied PDF loading/content-preservation guidance. PDF.js viewport inversion follows the actual pinned 5.4.624 transform, including crop, rotation and UserUnit. Octen search found OEM sources; extraction returned 403 Payment method required. No purchase or overage was authorized or attempted.

Figma whoami succeeded (View seat); no existing design file was supplied. Hugging Face authentication and model metadata succeeded; model search was unavailable. A local synthetic OCR feasibility evaluation is separate from production and is not evidence of device suitability.

Read-only delegation: Astra/high for RF and PDF risk audits, Terra/high for navigation/source reconnaissance. Each received the branch and exact workflow integration SHA before work. Codex remains the production writer. Parent model/effort controls and billing usage are not exposed/reported by this host.

## Verification state

2026-11-14T19:17:39Z: seven focused tests passed across `codex-next-navigation`, `codex-next-port-sweeps`, `codex-next-rf-context`, `codex-next-map-schedules`, and `codex-next-map-pdf`; `git diff --check` passed. The map importer retained its 26 existing pure checks. These are development-source results, not the final combined gate.

Existing RF/UI suites exposed context-contract changes (older fixtures lack bandwidth/power basis/impedance). Their numeric predicates are retained with explicit synthetic comparable metadata and additional refusal checks.

## Integrated scope and model continuity

The user explicitly requested model switching for implementation as well as audits. At checkpoint `3f1b16df1f7f270d925c4281af148daa4936641b`, Codex assigned disjoint production work to Terra/high (navigation, training, guides and affected assertions) and Astra/high (RF, port/evidence context and focused tests). Root retained integration, map/PDF generation, vendor packaging and release ownership. These are actual configured model/effort delegations; no unsupported claim of changing the host's parent model is made.

- Terra's integration is `f358b4bda7237db09a1033fb7ae3660fa947e585`. Source results: navigation 6, UI names 7, training 21 node:test entries, power 4 groups/40 comparisons, Study 8 groups/274 independent comparisons, layout 1,023 rendered checks. These were source checks before the final artifact freeze, not the combined gate.
- Astra's RF/evidence integration is `ebdff3ee116e77b4a18f4901df92a80085a1feb2`. Focused source results included 15 test entries, route UI 97 checks, independent RF 58, independent RF UI 17, and the retained Wolfram 25 groups/39 numeric expectations. The additional actual UI and asynchronous port suites are registered.
- Map, source registry and production-suite integration is `5e066777c068f63dfea4a981ca100eec779267d8`. Actual offline PDF raster checks cover 0/90/180/270-degree pages, nonzero CropBox, UserUnit 2, grouped active/EOL overlays, original annotations, unchanged source/job bytes, and byte-identical repeat export: 44 development checks passed.
- A fresh Astra/high read-only review reproduced two P2 context defects. Correction `caed231faeb66f28c6bc7db5279b9443b21404be` preserves saved reading frequencies/model context in PDF tombstones and keeps physical-port identity stable through actual Save now, Duplicate and reopen. Focused correction checks passed; the full frozen gate remains a separate step.

Current navigation has 26 destinations, 48 practice feature choices, and exercise lengths 21/14/22/8/9/7/10. Leakage and retired daily entries are excluded from new-work navigation/practice/Study, while legacy storage and APIs remain. Voltage drop is retained as a standalone tool; its old notebook is hidden. Current guide Markdown and paired README are synchronized, with rendered HTML/PDF regenerated centrally.

## Grok QA integration and its limits

Integrated QA commit: `a23fab9f0350746d1b356c68d72faf6d4829d6bb`, following initial `9b60b3a171a6ae414e18e6736df2170eaa0c48e9` and PDF follow-up `ee310c039ae637d04e9a92bf40e0e1d63c6fd8c0`. All were ordinary merges; no Grok branch/file was rewritten.

Direct inspection does not support the handoff's claim of complete feature assertions: navigation reads source text and round-trips a hand-built object, RF compares literals (including `assert.equal(43,43)`), and PDF prints that the module exists without invoking plan/export. The PDF generator also does not substantiate its claimed page rotation/crop and temporary-output behavior. Those files are preserved but excluded from production gate counts. The five useful ONX parser/channel-kind checks are registered as such; their manual array replacement is not called proof of production replacement.

Codex-owned executable suites fill those gaps using the actual assembled app, engine, per-leg context, IndexedDB originals, atomic physical-port replacement, real backup/restore/remapping, asynchronous job/node changes, saved-job compatibility, native cross-sheet schedules, and actual PDF parsing/writing/rasterization. `qa/run-pwa.py` registers these suites. Python browser/PDF QA versions are pinned in `qa/requirements.txt` and installed by the hosted gate.

Final frozen source SHA, standalone HTML SHA-256, exact combined gate results, clean-checkout Grok script outcomes and evidence links are recorded in the single build3 candidate PR. Do not substitute the earlier scoped counts above for that gate. No APK, signing, deployment, merge, emulator or physical-phone acceptance is claimed. Spencer retains the original-key build and installed-phone upgrade test; Claude owns the final technical review of the exact candidate.
