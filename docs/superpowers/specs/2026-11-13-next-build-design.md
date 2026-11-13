# Carpe Noctum next-build design
Status: proposed scope, implementation not started. Owner: Spencer. Working build ID CN-NEXT-20261113. Product version to be recorded at freeze, not inferred from this ID.

Current task scope: update GitHub process, source information and handoff prompts only. Implementation, signing and further web deployment belong to a separately started build; this planning update does not begin them.

## Baseline and strategy changes
Inspected public `build3` at `248e77802f333a1a461563dfb1973315a2043d67`, later than fc7e9c8. PR #47 already provides hidden-chart, calculation reuse, catalog-map and named-job button fixes; do not repeat them.

- ChatGPT writes/integrates, Grok reviews spec/math/code, Claude does a small independent new-source/release check: this follows Spencer's remaining usage, with one implementation writer.
- One build branch and one implementation PR, incremental commits: avoids two-lane conflicts and duplicated handoffs. This planning PR is docs only.
- Use exact low-split anchors, not rounded AOI slope: they agree at displayed precision but are not mathematically identical.
- Separate numeric test tolerance, OEM typical loss and company pass/fail limits: precision cannot manufacture a field acceptance policy.
- Web publication is part of release, on the existing origin: Android and iPhone browser users need the same approved app.
- Original signing key only, including readiness APK: a replacement key defeats the update-preserves-jobs requirement.
- Keep model choices to models actually available in each code environment: do not make readiness depend on unverified model names or advertised quotas.

Accuracy first, cost second, speed third. Twenty-four hours is a measured target, never a deadline. Only Spencer can move scope. No performance rewrite or new UI framework. Main review plus focused fixes check; wrong values, unsupported outputs and data loss block, styling preferences wait.

## Proposed scope: three related packages
### P1: reduce wasted work on field screens (medium risk)
1. Lazy-build ONX chart/table previews only when opened. `night-sweep/evidence-ui.js` currently builds them inside closed details. A tech should not wait for every trace when opening one file at night.
2. Avoid rescanning saved jobs on every Sweep Due interval keystroke. `night-sweep/sweep-due.js` currently recollects snapshots during render; keep immediate draft persistence and validation. A tech should be able to change an interval without typing lag.

These are two concrete optimizations within one package. No broad dead-code purge. PR #47's work stays intact.
Acceptance: 30 files × 10,000 samples produce no chart paths/tables for closed previews; opening one gives the same result and original file hash. Across 200 synthetic jobs × 40 stations, input edits do not repeatedly recollect all snapshots; commit/refresh and job changes refresh correct counts. No stale counts shown as current. Compare before/after on the same device/browser; record p50/p95 and operation counts, not invented speed claims. Switching/locking/resuming retains drafts, readings and evidence.

### P2: company targets and clear context (medium/high risk)
Use one pure target evaluator and shared metadata, not copied constants in each screen. Keep company targets, manufacturer capabilities and measurements visibly separate. Use existing Plan job/profile and launch controls, Field Meter setup/Station/Readings, Tools Limits/References and Closeout exports. No new top-level navigation destination.

Low split 42/54: company node target `L(f)=32+11*(f-54)/699`, valid 54–753 MHz. Return operator reference 38 dBmV, company span 11–42 MHz; basis remains unconfirmed. The 5 MHz hardware edge is not changed to 11.
High split 204/258: company node target `H(f)=34+15*(f-261)/954`, valid 261–1215 MHz, from Spencer's stated AOI config values. These are not manufacturer output ratings and must not automatically become amplifier targets or targets for every GainMaker 204 device.

Reference cases, computed independently:
| Case/frequency MHz | Working | dBmV | Display |
|---|---|---:|---:|
| Low 105 | 32+11*51/699 | 32.802575107296 | 32.8 |
| Low 200 | 32+11*146/699 | 34.297567954220 | 34.3 |
| Low 300 | 32+11*246/699 | 35.871244635193 | 35.9 |
| Low 450 | 32+11*396/699 | 38.231759656652 | 38.2 |
| Low 550 | 32+11*496/699 | 39.805436337625 | 39.8 |
| Low 650 | 32+11*596/699 | 41.379113018598 | 41.4 |
| High marker 303 | 34+15*42/954 | 34.660377358491 | 34.7 |
| High marker 405 | 34+15*144/954 | 36.264150943396 | 36.3 |
| High marker 555 | 34+15*294/954 | 38.622641509434 | 38.6 |
| High marker 711 | 34+15*450/954 | 41.075471698113 | 41.1 |

All low cases: source Spencer's current node-anchor decision in this request, revision CN-NEXT-20261113; 42/54 split; node output plane; dBmV. All high cases: source label **Spencer, AOI config v15, 2026-04-23**, user-transcribed values; 204/258; node output plane by Spencer's instruction; dBmV. For both: proposed 75-ohm per-channel reading convention, actual channel bandwidth and per-channel/composite convention pending owner confirmation. Interpolation itself does not need channel bandwidth; absolute comparison does. Numerical tolerance 1e-9 dB; display 0.1 dB; field acceptance tolerance unknown. Preserve that distinction in fixtures.

Low slope = 1100/699 = **1.573676680973 dB/100 MHz**. AOI slope = 1500/954 = **1.572327044025**. AOI slope across 699 MHz gives 10.990566037736 dB; anchored at 43 gives 32.009433962264, displaying 32.0. Keep the explicitly selected 32/43 anchors authoritative.

### P3: source-backed GainMaker EQ library (medium/high risk)
Add the four requested families and exact part/value identification in [EQ evidence](../../../research/next-build/GAINMAKER_EQ_SOURCES.md). Show nominal value, actual losses at selected frequencies, actual tilt, source and whether a number is exact-table or estimated. Reuse the present alignment engine; do not create another competing calculator.

42 MHz standard return: OEM intermediate samples exist. 204 MHz standard return: only endpoints verified. Catalog/reference display can ship for all four, while unsupported frequency calculations remain unknown. A 1.2 GHz forward table must not silently replace a 1 GHz table. Add supported installed-model mappings only from matching OEM module data. Missing reverse balancing procedure/port/pad data prevents a full reverse part recommendation, not display of a known EQ's attenuation.

Acceptance uses F1–F3 and R1–R3 in EQ evidence, plus mismatch and unknown tests. Maintain existing calculation results for unchanged profiles.

## Hour-0 answers and owner decisions
1. Low and marker arithmetic is confirmed above; all six supplied low intermediates round correctly.
2. **TX38:** provisional interpretation is transmitter per-channel level, not integrated 31 MHz band power. Only Spencer can confirm transmitter/port, channel/bandwidth convention and tolerance. Show `38 dBmV · basis unconfirmed · company span 11–42 MHz`. Do not turn it into receiver target, return injection setting, PSD or composite power; do not draw a measured continuous spectrum from it.
3. **AOI:** show four marker pilots, flag 303/711 as ALSC main pilots, backups none. Markers do not prove a usable carrier or successful ALSC lock. Do not infer 303/711 target levels from their names. Formula above supplies intended values.
4. Firmware le/hgd/hgbt/ble/mb 2.22.3, transponder 2.2.1a and timers 3600/3600/1800 s belong in collapsible source/config details. Display supplied values; do not make compatibility/health pass/fail or reset/control hardware. Until exact keys are read, do not invent timer names or their operational meaning.
5. The name `Config 860/750 MHz ver 1.1` conflicts with supplied contents: retain as source metadata with a mismatch note; derive band/mode from documented fields, not filename/name.
6. **Public repo:** publish only selected values with the source label and provenance. Keep raw JSON private. Exact `AOI_ConfigFile_711_v15_042326.json` was not available here; a similarly named `_2.json` differs and is not a substitute. Independently verify original file before calling its transcription checked. Record its SHA-256 when available.
7. Confirm actual stock/module labels for the OEM families found; public catalog evidence cannot establish what is installed locally.
8. Confirm field tolerances, reading bandwidth/plane/power basis, installed Android package/version/certificate and phone-check window. Already decided: original key, low anchors, high stated targets. Do not ask those again.

Unknowns block only their dependent outputs. Useful independent target displays, documented EQ values and performance work proceed. No default green badge.

## Output dependency rules
- Level delta = corrected measurement minus company target, only when frequency, plane, impedance and power/bandwidth basis agree. One known pilot can have its own delta while another is blank.
- Tilt = high minus low; compare measured tilt to target tilt only with both valid pilots and compatible basis.
- Pass/fail needs a specifically approved limit; a target alone gives a delta, not acceptance. Do not overwrite unrelated manufacturer or company registry limits.
- Solver needs compatible installed model, sourced old/new EQ loss at both pilots, pads/procedure where relevant, readings and station targets. Node targets cannot fill a downstream amplifier target silently.
- Sweep absolute grading requires absolute samples at the correct plane and bandwidth. Relative traces stay relative. Preserve raw peak-to-valley; show any target-relative residual separately and grade it only with an approved limit. Do not relabel raw slope as ripple or interpolate missing measured pilots.
- Applying a new preset is explicit for the current job. Old 31@54/43@860 jobs remain readable and reproduce old results, without mutation on open. Do not rewrite saved jobs to the new anchors.

## Invariants and release blockers
No saved-job-format migration, renamed storage keys, package-ID changes, signing-key change, loss of original ONX bytes, or unrelated math changes. Preserve `hfc-route-v1`, `hfc-named-jobs-v1`, `nightsweep-*` and existing native identifiers. Resolve any required new persisted metadata within established backward-compatible fields, or bring a concrete schema proposal to Spencer before changing the agreed invariant.

Done requires original-signed APK updating the installed app in place with jobs intact; full backup/restore including original evidence; readings surviving switch/lock/resume; one offline route; and web refresh/update at the existing origin preserving browser jobs. A cloud browser or emulator does not substitute for Spencer's phone check.
