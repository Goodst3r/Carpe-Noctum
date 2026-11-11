# Equipment and AGC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver NightSweep 1.7 Alpha with exact equipment-document coverage, sourced setup steps, literal DSIM pilot lookup and intuitive training.

**Architecture:** Extend the existing standalone offline JavaScript application, manual JSON registry and training modules. Preserve project schema/storage and package the same HTML into all platform wrappers.

**Tech Stack:** JavaScript, HTML/CSS, Python builders, Node/JSDOM regression tests and existing Android WebView wrapper.

**Spec:** `docs/superpowers/specs/2026-11-10-equipment-agc-design.md`

## Global Constraints

- Version remains 1.7 Alpha; Android Preview uses build 21, existing package/signer/origin.
- Preserve saved jobs, meter originals, imports, exports and existing tools.
- Document exact model/variant/revision; keep manufacturer data, operator targets and measured values separate.
- No unsupported procedure, frequency/code extrapolation, automatic acceptance or purchase.
- Technician distribution excludes developer tooling and private signing material.

## Review Focus

- A station replacement must not inherit a prior device's DSIM verification in its current report.
- Unknown firmware or unavailable exact manual must not become a guessed AGC procedure.
- Pilot code punctuation and IRC/digital frequencies must remain literal, including source exceptions.
- A practice job must preserve or protect existing work and never mark training as plant acceptance.
- Clipboard/storage failures and offline updates must leave a usable fallback and protected backups.

### Task 1: Equipment documentation inventory

**Files:** `night-sweep/setup-manuals.json`; `night-sweep/research/alpha17-equipment-refresh/*`.

**Interfaces:** Inventory maps every catalog selection ID to source/model/revision/status. Manual records retain the existing `equipmentIds`, `steps`, `gaps` and source fields.

- [x] Audit active, passive, cable, node and power selections; fresh-check source revisions and material conflicts.
- [x] Add exact applicable AGC/level steps, page references and missing-manual limits; merge node patch proposals without losing active edits.
- [x] Run source-coverage and catalog/manual validation with no orphan IDs or invented values.

### Task 2: Pilot lookup and report provenance

**Files:** `dsim-pilot-codes.js`, `equipment-setup.js`, their QA suites.

**Interfaces:** `DsimPilotCodes.lookup(frequencyMHz,pilotType)` returns an exact literal row or null. Reports preserve historical backup data while qualifying current-device applicability.

- [x] Transcribe and independently compare 86 photographed rows; add exact-frequency/type lookup and copy fallback.
- [x] Reproduce and fix metadata carried from GainMaker to a replacement active; retain original saved data.
- [x] Verify punctuation, missing channels, unsupported pilot types, source exception, copy failures and verification invalidation.

### Task 3: Training and technician documentation

**Files:** `training.js`, training QA, 1.7 README/setup/coverage/release documents.

**Interfaces:** Main training retains the existing full example and six original synthetic attachments. Separate DSIM practice uses the existing guarded job-change/export pattern.

- [x] Add node/manual/setup handoffs and a separate compatible GainMaker DSIM practice flow.
- [x] Document exact controls, prerequisites, pilot lookup and post-alignment measurements beside the workflow.
- [x] Verify backup guards, training labels, navigation, source links and matching Markdown/HTML instructions.

### Task 4: Verification and release

**Files:** builders, QA results, release validation, source/coworker archives and project status.

**Interfaces:** Final QA, standalone HTML and signed APK hashes must match the frozen release; Sites uses the exact pushed source commit.

- [x] Run fresh independent numerical examples, full regression tests and final code review.
- [x] Check browser behavior and report actual platform limitations.
- [ ] Build/sign/verify Android, package coworker and source files, deploy the existing public site, and update project status with evidence and outstanding gaps.

## Execution record

### November 11 steering

- Keep current practice jobs only in the coworker package; do not silently delete field jobs on devices or wipe storage during updates.
- Include a separate ten-step conventional GS7000 1 GHz / 1.2 GHz practice job, with actual measurements and test-point corrections initially unknown. Intelligent/SHO/RPD variants require their exact procedures and are not newly selectable launch profiles.
- The user's local non-high-split forward design reference is **31 dBmV at 54 MHz / 43 dBmV at 860 MHz**. **38 dBmV return TX** is a separate operator reference, with transmitter, channels/service plan and plane to be verified; it is not an injected-sweep setting or node receive target.
- Add an explicit guarded local preset that changes design criteria only. Preserve saved measurements, current route launch inputs, high-split targets and original evidence.
- Calculate setup levels at actual available carriers, including the user's 57–753 and 63–550 MHz examples. Retain 54/860 as design anchors; show square-root-frequency versus linear-MHz models and label estimates. Independently verify against fresh Wolfram results; never infer a live carrier, an equipment band upgrade, an AGC pilot or an OEM backoff frequency.
- Save the matching source archive under NightSweep Developer/Sources, including documentation, builders, QA and current fixtures; exclude signing material and installed tooling.

The user has already authorized reversible implementation and ongoing publication. Continue through supported fixes without a new design-approval pause. Parallel specialists own separate source/research files; the root agent merges and verifies the final result. Interim build-21 checks are not the final release evidence after subsequent source or training edits.

Final review fixes: pilot frequency card refreshed on text input while preserving focus (direct regression RED → GREEN); overlapping return/forward bands reject the local preset and carrier estimates before confirmation or mutation (shared guard regression RED → GREEN). Final full generated-bundle run is required after these fixes.

Release preparation evidence: final generated-bundle QA passed 819 checks across 38 suites with unchanged build bytes; same-signer Android Preview build 21 compiled and verified with byte-identical HTML; 15-file coworker archive validated with four current practice jobs and no private tooling. Read-only Figma/Context7 and function-inventory reports found no further blocker. Publication, archive commit identity and persistent status are recorded in the authoritative project-status document after terminal deployment receipts.
