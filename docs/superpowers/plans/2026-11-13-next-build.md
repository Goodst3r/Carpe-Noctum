# Carpe Noctum next-build implementation plan

**Goal:** Make field screens more responsive, add Spencer's company targets without rewriting old jobs, and expose correctly sourced 42/204 MHz return and 1/1.2 GHz forward GainMaker EQ values.

**Architecture:** Existing plain JS/HTML/CSS offline app and Android wrapper. One pure company-target evaluator and one source-labelled EQ library feed existing screens; no new framework, service or cloud dependency.

**Tech stack:** Current Node/Python build and QA tools, current PWA worker, existing Android toolchain and original private signing key.

**Spec:** [Design and acceptance](../specs/2026-11-13-next-build-design.md). [EQ evidence](../../../research/next-build/GAINMAKER_EQ_SOURCES.md). [Role prompts](../../../handoff_docs/NEXT_BUILD_PROMPTS.md).

**Global constraints:** Accuracy > cost > speed; same keys/package/saved-job format; original signing key; no raw company config or paid standards text in this public repo. Every math case carries source/revision, plane, split, units, bandwidth/power basis, impedance and tolerance or an explicit not-applicable/unknown. One writer, one implementation branch and PR. Current planning baseline is build3 `248e77802f333a1a461563dfb1973315a2043d67`; fetch and record any newer base before implementation.

**Review focus:** Typical loss versus nominal EQ label; model/direction/split mismatches; correct old-minus-new attenuation sign; unknown-dependent outputs; legacy job preservation; PWA cache/origin and original certificate continuity.

## Roles and cost control
- **ChatGPT:** primary writer, source integration, local targeted tests, fixes, candidate evidence and release coordination; largest workload.
- **Grok:** independent spec/reference calculations before coding; one main code review and focused recheck; no parallel feature branch.
- **Claude:** narrowly scoped reopening of newly cited sources and final release/phone checklist audit. No full reimplementation or duplicate gate.
- **Spencer:** only owner of target conventions/limits and scope decisions; original key custody, installed-phone update and real-phone acceptance.

Do not hardcode unavailable model names. Use routine coding models for ordinary edits and the strongest available reasoning only for unresolved RF/storage issues. Record actual reported usage with its unit; otherwise `not reported`. Do not infer prices, token usage or capacity percentages.

## Task 0 — readiness and decisions (before implementation)
Files: `handoff_docs/BUILD_LOG.md` (create if absent, append only), this plan, `handoff_docs/APK_PLAN.md`, `android-build/build-readiness.json` (evidence only).
- [ ] ChatGPT fetches origin, records exact baseline, reads AGENTS and current workflow, confirms clean checkout and push ability. Grok needs read/review access; only the writer needs code-push access.
- [ ] Record baseline gate evidence. The inspected head had successful repository CI; that does not prove a signed APK or phone checks. Use a fresh baseline run if no trustworthy exact-head result exists.
- [ ] Spencer verifies an original-key-signed starting-commit APK updates the installed app in place with jobs intact; record installed package/version/certificate and book phone window. Missing key blocks signing, never creates a replacement.
- [ ] Resolve only essential hour-0 questions in the spec; keep unresolved fields explicitly unknown.
- [ ] Grok reopens EQ/AOI sources, computes independent vectors without importing production helpers, and reviews the spec before ChatGPT modifies calculators. ChatGPT recomputes and records agreement; resolve disagreements from the cited page.
- [ ] Open one draft implementation PR from a single branch based on the recorded build3 commit; do not merge the plan automatically. No concurrent app writers.

Log columns: UTC machine time, build ID, attempt, who/role, stage, event (`start/end/blocked/unblocked/paused/resumed/handoff/decision/correction`), code commit, reported usage with unit or `not reported`, evidence link, note. Gate rows add exit code, counts, app hash, tool versions. Append corrections; never back-fill missing times. Record idle/waiting/phone delays instead of charging them to coding. The planning work and current Build3 web refresh are not a completed next build.

## Task 1 — two measured field-screen optimizations (P1)
Files to edit: `night-sweep/evidence-ui.js`, `night-sweep/sweep-due.js`.
Tests to extend: `qa/evidence-ui.test.cjs`, `qa/evidence-context.test.cjs`, `qa/build3-sweep-due.test.cjs`, `qa/build3-perf-guards.test.cjs`; rendered checks `qa/build3-sweep-due-layout.test.py` and existing evidence tests.
- [ ] Capture baseline timings/operation counts on deterministic synthetic fixtures: 30 × 10,000-sample evidence files and 200 jobs × 40 stations. Record environment; do not use private field captures.
- [ ] Render evidence headings immediately; materialize chart/table on disclosure open. Invalidate by evidence/job identity and retain open state correctly. Printing/export must still contain the requested evidence.
- [ ] Keep Sweep Due text drafts saved on input; validate immediately; collect and grade snapshots on committed change/Enter/explicit refresh and relevant job changes. Mark pending results stale until refresh; do not show old counts as current.
- [ ] Verify closed previews create zero trace paths, open preview equals prior result, original bytes/hashes unchanged; changing jobs cannot show previous-job evidence.
- [ ] Verify typing 30 does not grade intermediate 3 as the committed new list, invalid/blank intervals do not become zero or a green status, and switching/locking/resuming retains entered data.
- [ ] Run relevant node test files above after rebuilding the app. Run rendered checks after visible changes. Compare p50/p95 plus operation counts; report what improved rather than imposing an unmeasured universal millisecond threshold.
- [ ] Commit P1 with concise evidence. Do not refactor named-job persistence or redo PR47 optimizations.

## Task 2 — company target model and legacy behavior (P2)
Create `night-sweep/company-targets.js` and `qa/company-targets.test.cjs`.
Edit `night-sweep/build.py`, `night-sweep/shell.html`, `night-sweep/field-reference.js`, `night-sweep/thresholds.js`, `night-sweep/launch-source.js`, `night-sweep/sweep-setup.js`, `night-sweep/station.js`, `night-sweep/projects.js`, and `night-sweep/sweep-grading.js` / `sweep-grading-ui.js` only for the specified consumers.
- [ ] Define pure `targetAt(profileId, frequencyMHz)` returning value/units/source/domain plus missing-basis metadata, never an implicit measurement or pass/fail. Reject blank/nonfinite frequency and out-of-domain values. No extrapolation.
- [ ] Add explicit new presets for the 54–753 and 261–1215 anchors; retain legacy anchors on previously saved jobs. A new catalog default must not mutate existing job state.
- [ ] Put target/profile choice beside existing Plan launch context; show source and missing basis in Field comparisons and Tools Limits/References. Do not auto-apply node launch levels to an amplifier station.
- [ ] Add four AOI marker rows, tag the two ALSC mains, no backup pilot. Firmware/timers remain source metadata. Keep raw config private; preserve its misleading name as metadata only.
- [ ] Keep TX38 as a labelled company transmitter reference until basis is confirmed; 11–42 is a selected company span, not the hardware cutoff or integrated-power bandwidth.
- [ ] Decouple per-pilot deltas from the full solver's both-pilot requirement. Enforce the spec dependency rules for absolute/relative traces, tilt, limits and missing values.
- [ ] Use independently computed spec vectors at 1e-9 dB tolerance, 0.1 dB display. Endpoint tests: low54=32,753=43; high261=34,1215=49.
- [ ] Refusal tests: low frequency860, high258/1218 outside company domain, reversed/equal pilots, Infinity/NaN/blank, wrong split/plane, unresolved bandwidth, missing tolerance. Valid target may display while only affected delta/grade is blank.
- [ ] Historical fixture with 31@54 and43@860 reopens/re-exports without changing saved anchors or results. Partial readings survive export/import and job switching. Unknown ancillary fields are preserved.
- [ ] Run new target suite plus `qa/build3-station.test.cjs`, `qa/build3-alignment.test.cjs`, `qa/node-setup-refresh.test.cjs`, `qa/complete-workflow-math.test.cjs`, `qa/named-jobs-storage.test.cjs` and affected sweep suites. Register new suite in `qa/run-pwa.py`.
- [ ] Commit P2. A missing source or owner convention blocks its dependent output, not P1 or verified target arithmetic.

## Task 3 — four EQ families with supported calculations (P3)
Create `night-sweep/gainmaker-eq.js`, `qa/gainmaker-eq.test.cjs`. Edit `night-sweep/alignment.js`, `field-reference.js`, `catalog.json`, `shell.html`, `build.py`, and relevant `station.js` / `sweep-setup.js` presentation.
- [ ] Transcribe all nominal parts and published point rows from the source register. Keep datasets separate by manufacturer/part/family/direction/rated band; carry source revision/page and exact-versus-estimated status next to values.
- [ ] Grok cross-checks complete transcriptions against source tables, especially 42 MHz 40/42 labels and the 1.2 GHz 1.5 dB row's two-decimal values. Do not add aftermarket-only parts as OEM parts.
- [ ] Extract existing 1 GHz data behind a stable interface without changing its outputs, including 1000/1002 provenance and gap policy. Add 1.2 GHz source points, standard42 points and204 endpoints.
- [ ] Expose `lookupLoss(partId, frequencyMHz)` returning known/estimated/unknown with source and reason. No extrapolation. Published typical values are not measured plant values.
- [ ] Retain current explicitly labelled piecewise-linear, bounded-gap estimate policy where justified; do not relax it globally. For42 at11, label estimate, not exact. For204 at11, unknown. Zero jumpers known as parts, not numeric curves.
- [ ] Match compatible model, direction, split and physical slot before part selection. Do not repurpose AOI ALSC or silently add204 capability to a42 module. Show parts in Tools Catalog/References and relevant existing Field screen.
- [ ] Allow forward solver expansion only with sourced installed-model compatibility/procedure/pads. Return catalog/loss comparison may work without a full return solver; no automatic reverse pad/EQ recommendation from endpoint-only data or unknown injection/reference planes.
- [ ] Test evidence cases F1–F3/R1–R3, family mismatch, unsupported frequencies, 0-jumper, separate thermal/linear/inverse parts. Test every transcribed row's numeric cells against reviewed fixtures, plus physical invariants and independent worked examples.
- [ ] Existing unchanged-profile tests must retain their previous results. Run `node qa/gainmaker-eq.test.cjs`, `node qa/build3-alignment.test.cjs`, affected math suites, and register the new suite.
- [ ] Update affected help/reference/field guide text and company/source labels. Do not copy vendor prose or claim manufacturer support for our interpolation policy.
- [ ] Commit P3 and hand off to Grok. No unrelated feature additions.

## Task 4 — one review, fixes and final candidate
Files: affected source/tests/docs, `handoff_docs/BUILD_LOG.md`, candidate handoff and PR description.
- [ ] Grok reviews spec-to-code, refusal behavior, old jobs, source coverage and diff; attaches exact commit and numbered blockers. Preferences are nonblocking.
- [ ] ChatGPT fixes blockers, runs impacted tests; Grok checks only fixes and consequences.
- [ ] Claude reopens newly cited source pages and records one-line transcription results with source revision/page. Review release evidence for missing signer/phone/web checks; do not repeat the complete gate.
- [ ] Build final standalone app/PWA, commit generated outputs, then run the full gate once on the frozen candidate: `python3 night-sweep/build.py`, `python3 build-pwa.py`, `python3 qa/run-pwa.py`, `python3 qa/build3-layout.test.py`, `python3 qa/browser-smoke.py`. Follow current `docs/DEVELOPER_BUILD.md` if gate commands change.
- [ ] Preserve actual exit codes, suite/test counts, full app SHA-256, code commit and tool versions in log and PR. CI may independently run its configured gate; do not pretend its counts are a new local run or disable it to save usage.
- [ ] If code changes after freeze, rerun affected checks and the final-candidate gate as needed; never attach old green evidence to a different app hash.

## Task 5 — original-key phone release and matching web release
- [ ] Follow corrected `handoff_docs/APK_PLAN.md`: original installed-app signer, package and valid version progression; no key generation or uninstall workaround.
- [ ] Compare signed APK certificate/package/version, verify signatures and alignment, embedded HTML hash and APK hash. Key/password remain outside repo and public artifacts.
- [ ] Spencer performs in-place update with jobs intact; full project backup/restore with evidence; app switch/lock/resume; an offline route. Check separate device-only notebook/settings backup coverage explicitly, not just project JSON.
- [ ] Publish the same reviewed app to existing `https://nightsweep-field.goodst3r.chatgpt.site/`, preserving origin, scope, storage and public audience. Use repo's existing Sites project; no replacement URL/site.
- [ ] Verify actual live content/version and asset identity, complete service-worker cache and offline guide assets; test an existing web job through update, refresh and offline reopen. Publish does not force-reload active field sessions. Do not tell users to clear browser storage.
- [ ] Update iPhone/Android web installation pages from the same build. Record hosting source commit separately from GitHub code commit, plus release version and asset hashes.
- [ ] Mark done only after recorded phone acceptance. Web publication alone is not APK/phone acceptance.

## Clock and scope decisions
Target: 0–2 decisions/spec;2–4 Grok source/math check;4–16 ChatGPT implementation;16–19 review;19–20 fixes/gate;20–24 original-key signing and Spencer phone check. Hour16 is a decision checkpoint; candidate at20 is a target. Source/phone waits are logged. Only Spencer decides whether to continue or move an item; no silent cuts to accuracy or scope.

Existing deferred Tonight/Exact Resume/temporary-repair work stays tracked in the old queue; it is not silently absorbed into this three-package build.
