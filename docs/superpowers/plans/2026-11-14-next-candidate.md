# Carpe Noctum combined candidate implementation plan

> Execution: Codex is the sole production writer and integration owner. Grok authors QA on its own branch. Claude reviews the finished candidate. The user has authorized execution of this agreed scope; do not restart design approval.

**Goal:** Deliver the approved calculator-first, route/sweep, ONX and PDF-map scope as one unmerged build3 candidate.

**Architecture:** Retain PR55's plain JavaScript modules and additive schema-one job fields. Keep raw files in the existing verified IndexedDB evidence store. Bundle a pinned offline PDF writer alongside the existing map renderer; always derive updated PDFs from verified originals.

**Spec:** `handoff_docs/PARALLEL_TASKS.md` from PR59, with the user's current request and `handoff_docs/NEXT_UPDATE_SWEEP_MAP_SCOPE.md`.

**Pins:** build3 `248e77802f333a1a461563dfb1973315a2043d67`; retained implementation `18e7239d017882ee780864c5a2fe74e8d979ea7a`; workflow integration `0994b185bc271cd39934cbc4c04e9c71010641ad`.

## Constraints and review focus

- Same package, version, storage keys and additive job fields; no signing, deployment or merge.
- Separate 42/54 and 204/258. Approved Company references remain source-labelled; no inferred amplifier target, bandwidth, tolerance or pilot code.
- Missing/invalid values suppress dependent arithmetic. Distinguish expected, measured, target and specification.
- Readings require matching frequencies, power basis and bandwidth before measured gain. SC-QAM and OFDM PLC are distinct.
- Failed or stale imports leave existing port data and source attachments intact. Retain all validated sweep points.
- Map schedule identity, diagram symbol identity, page rotation/crop and original digest must agree. Never place tombstones against an unconfirmed symbol.
- Repeated PDF exports start from the same verified original; original markup/content and source bytes remain intact.

## 1. Organization and optimization

Files: `workflow.js`, `shell.html`, `training.js`, current guides and affected existing navigation assertions.

- [x] Record cold-start calculator and route access. Start on Calculators; expose Route & sweep directly; remove Field bottom tab.
- [x] Move retained station/meter/evidence/TDR entry IDs to existing groups. Remove Leakage and daily-workflow entries from active navigation/practice, preserve legacy payloads and useful shortcuts.
- [x] Verify standalone calculation without a named job, keyboard search, route aliases and legacy round-trip. Record operation/workflow differences rather than invented timing claims.

## 2. RF and per-port ONX

Files: `route-workbench.js`, `engine.js` as needed, new `port-sweeps.js`, evidence integration and route source card.

- [x] Pin public `PortSweeps.replace(owner, portId, parsed, context)` returning a new port collection after complete validation, and `PortSweeps.validate` for job imports. `owner.portSweeps` is additive. Failed validation must not mutate owner.
- [x] Add file/verified-evidence selection by physical node port. Keep all points and original evidence ID/hash. Never apply an observed ONX level as a Company target.
- [x] Require comparable measurement basis/bandwidth in `RouteWorkbench.measuredGain`; record context independently for input/output and Before/After per leg.
- [x] Keep leg gains/output limits/part records independent and explicitly show missing values. Run independent math vectors and affected legacy/route/evidence suites.

## 3. PDF map update

Files: `map-import.js`, new `map-pdf.js`, `evidence-ui.js`, `route-workbench.js`, vendor manifest and build registration.

- [x] Match native NAME/TAG schedules across sheets while retaining ambiguous matches for review. Persist source and diagram geometry with imported rows.
- [x] Public `NightSweepMapPDF.plan(owner)` returns one grouped tombstone per confirmed active/EOL symbol; `NightSweepMapPDF.exportPDF(originalBytes, owner)` verifies source digest and produces PDF bytes without mutating state or originals.
- [x] Expose explicit symbol confirmation and reposition controls. Keep the original map as a separate immutable file under PR55’s external-original model; portable backups retain verified ONX evidence and remap its references. Refresh always verifies the original digest.
- [x] Test rotated/cropped multi-page PDFs, original annotation retention, duplicate identity refusal, repeat export, job/source switching and incomplete records.

## 4. Combined candidate and release gate

- [x] Integrate Grok's exact QA SHA or complete patch; register eligible suites in `qa/run-pwa.py`. Integrate guide/practice drafts.
- [x] Rebuild standalone, guides and PWA; commit generated outputs centrally. Freeze exact source SHA and HTML SHA-256.
- [ ] Run the existing full automated gate plus both rendered suites once on the combined candidate, or use qualifying hosted evidence. Fix genuine failures and gate changed app bytes again.
- [ ] Open one build3 candidate PR recording pins, Grok QA SHA, exact candidate, HTML hash, executed results and outstanding physical-phone checks. Keep unmerged; hand off to Claude.
