# NightSweep 1.7 Field Workflow Implementation Plan

**Goal:** Make source-to-route-to-equipment setup usable from a field phone with sourced configuration guidance.
**Architecture:** Incremental modules on the existing single-file offline build; schema-one optional fields preserve old backups. Manufacturer source records remain separate from job settings.
**Tech Stack:** Vanilla JavaScript, Python static build, native Android WebView wrapper, jsdom regression suites.
**Spec:** docs/superpowers/specs/2026-11-10-field-flow-design.md

## Constraints and review focus
- Version 1.7 Alpha; keep preview Android package and signing identity.
- Node is a launch reference. Never infer gain, targets, live spectrum or coupling from model selection.
- Preserve saved jobs/evidence and distinguish SC-QAM, OFDM and pilot conventions.
- Exact model/split changes must not carry completed setup steps across hardware variants.
- Unavailable manufacturer manuals and encrypted supervisor pilot keys must remain explicit gaps.

## Tasks
- [x] Add launch-source module and import validation; test node/active/manual source, labels, measurements and schema-one round trips.
- [x] Add exact equipment setup/manual selection and DSIM guidance; test checklist isolation, missing manuals, keys absent from saved state, and invalid imports.
- [x] Audit all source modules and catalog entries; correct demonstrated band-endpoint and graph-view validation defects with failing regressions first.
- [x] Integrate contextual workflow navigation, scope node TP reference to launch and reset evidence draft across jobs.
- [x] Update version, synthetic training, technician instructions and source/manual coverage records.
- [x] Build; run complete automated runner and mobile browser checks. Build/sign APK if available. Package source and coworker artifacts; record actual outcomes and gaps.
