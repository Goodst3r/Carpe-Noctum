# Routes and Sweep implementation record

Scope authority: [PR54 scope](../NEXT_UPDATE_SWEEP_MAP_SCOPE.md), unchanged. Implementation began 2026-11-13 UTC.

## Baseline and ownership

- Current candidate: `334bf8442287dacefde8e592eb382674730c1b28`, open draft PR52, based on `build3` `248e77802f333a1a461563dfb1973315a2043d67`.
- Scope head: `cb6e21d941e01425bf37304e9464a9211d10a2a6`, open draft PR54. Its changes are the scope document and workflow exception only.
- Integration starts at ordinary merge `0e66db1597c09c8a8312a57c75668adcb52e9e06`; it retains the candidate and scope ancestry.
- Sol HIGH: integration, build and PWA packaging, suite registration, workflow/status and final evidence.
- Terra HIGH: existing UI and engine integration, separate route workbench, equipment choices, training and technician guides, route regression tests.
- Astra HIGH: new map modules, vendored local dependencies, synthetic fixtures and map tests, followed by independent RF review.
- Luna MEDIUM: read-only whole-app inventory and rendered phone/desktop audit. Actual edits remain with the assigned writer.

## Implementation sequence

1. Implement route-first expected levels, gain feasibility, inline readings and supported pad/EQ slots; preserve old records and every calculator.
2. Implement local PDF/image recognition, visible annotation handling and editable branching drafts; gate uncertain paths locally.
3. Integrate source with ordinary merges; generate standalone/PWA centrally and register new regression suites.
4. Address field-task audit and independent RF review findings, then run the full repository gate and rendered checks on the combined source.
5. Open reviewable draft implementation PRs with actual heads, commands, results and limitations. Leave upstream merging, signing and publication to the release process.

## Interfaces and safeguards

Importer rows use existing route fields `id`, `name`, `parent`, `length`, `cable`, `device`. Exact map NAME stays in `name`; TAG remains separate. Additive `mapImport` metadata holds `sourceId`, `page`, `tag`, `installedModel`, `modelConfirmed`, `connectionConfirmed`, `status`, `reasons`. Uncertain/proposed/absent equipment cannot establish RF acceptance.

No storage keys, package identifiers or job schema version changes are authorized. Original imported evidence and legacy equipment values stay intact. Signing material is outside this task and is not accessed.

## Evidence and remaining checks

- GitHub connector and CLI independently confirmed the two draft PR heads and bases.
- Filename-only search under `/workspace`, `/tmp`, `/mnt`, `/home` found no `HA0005` match. No private field replay has run; absence blocks that private acceptance check only.
- Wolfram Alpha evaluated `{43-10,31-(43-10)}` as `{33,-2}`. This checks the requested arithmetic, not the app or RF assumptions. Application-level both-marker and measurement-plane checks remain to run.
- A fresh baseline-only gate on `4b5f31ccd3f33d1a163f68177984f0c049daa9a3` passed 111 suites / 3,160 checks in 1,238.0 seconds, exit 0. Both generated-build and worktree checks were unchanged and `git status --porcelain` was empty. Standalone SHA-256: `0dab215949cad492db2df1d3b1ef7881f0892dcf88eba750415a3991a349a823`; PWA version `eb868a1d252d786b3fa2`. Command: `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py`. This is the pre-update baseline, not combined-update acceptance.
- No physical device, emulator, RF hardware, signing or deployment verification has run in this update.

This is the pre-gate source-freeze record. Exact combined gate commands, UTC times, counts, hashes, tested head and hosted run are recorded in the implementation draft PR body and CI artifacts after execution. The results below are scoped implementation/review evidence, not a claim that the combined release gate has already run.

## Reviewed implementation and walkthrough

- Final route/guidance/QA source head: `907b273ae461410491ea1c14f1d432c7934ff743`; importer code head: `da536cf3cdc1d47780d00079753a9ee5b48ceb82`; final independent-review report head: `a303a97dcb7795eda0139272bae3ce977b67aa15`. All are ordinarily integrated. Current build3, original candidate PR52 and scope PR54 refs were freshly checked and remain `248e778`, `334bf84` and `cb6e21d` respectively.
- Removed duplicate primary gain/readings navigation and combined What-if under Load. Legacy entry IDs remain aliases. Detailed traces, meter/return setup, Station records, acceptance records and every calculator remain available. Runtime metadata: 35 retained screen IDs, 31 grouped navigation entries plus Help (32 normal paths), 53 practice feature choices, 164 live threshold rows.
- Route scoped checks: 38 engine, 84 UI and 34 route-engine checks pass. Independent review approves the exact route head; 58 independent engine and 17 independent UI assertions are retained as portable repository tests. Initial findings about model reuse, source/route identity, span edits and invalid measurement frequencies were reproduced and fixed. See [RF review](../../research/next-build/ROUTE_RF_INDEPENDENT_REVIEW.md).
- Importer scoped checks: 26 unit and 60 actual file:// offline browser checks pass, including real marked PDF/raster decoding, visible annotations, colored raster geometry, malformed/resource limits, cancellation and picker/read/apply job-context changes. Zero HTTP(S) requests were observed during those tests. Local OCR ambiguity remains visible per affected row.
- Lead packaging: eight tests pass, including checksum/size/path/duplicate guards, binary round-trip, the actual shell's JSON block, and exact complete-asset parity between source-mode QA assembly and the frozen standalone. The nested-wrapper integration defect was reproduced, then fixed; it was not covered by the initial isolated importer tests.
- Combined rendered preflight: 1,244 layout checks and 370 browser smoke checks passed on their documented earlier combined checkpoints. The full gate must repeat these on the frozen final combined source.
- [Final read-only walkthrough](routes-sweep-combined-audit.md): actual PDF/image UI import, gain/readings/pads, separate Main/Aux and Before/After values, named-job reopen and export, cancellation, and browser widths 320/390/430/1280. The [captured synthetic project](../../research/next-build/synthetic-edited-route-project.json) is preserved byte-for-byte for review. Its SHA-256 is `66f0fb638be8e367417f013008d60c050aadd21a3e54c8289efcb75910d0dcd1`.
- A new map application reserves fresh route IDs across current and historical references, remaps parents and archives old route/source/setup data. Old Station/workbench records remain historical; old source identity, measured launch levels and TP associations cannot supply a different launch. A stale job context cannot apply a delayed import.
- Source handoffs: [route writer](routes-sweep-route-source-handoff.md), [importer writer](routes-sweep-map-source-handoff.md). These record their own exact commands and limits; their results are not copied into the combined gate count.

## First gate attempt and coverage-preserving QA corrections

The first combined attempt on `edb52fea3eb4dc252ba6a7eb9a4a46cec719dc94` was aborted after current-model/navigation assertions failed: alignment still required the dedicated GaN profile to be selectable, and leakage still required the removed Readings tab. It is **not a completed or passing gate**. Partial raw logs and `aborted.json` are retained under `/tmp/carpe-routes-final-gate-20261113T101832Z`; the recorder was deliberately terminated (exit 143). A nine-suite diagnostic run separately found outdated Station fixtures, panel expectations and guidance names; Night log and Wolfram power passed 30 checks each.

`a69fcbe` updates those intended expectations and actual displayed guidance while retaining every arithmetic case, negative name-validator probe and legacy-data check. Unconfigured auxiliary outputs are explicitly required to remain unknown. RF engine, workbench, Station and importer code are unchanged from the approved identity/context implementation. `907b273` fixes the source QA assembler's new asset token by invoking the production Python asset helper with structured arguments and a bounded output buffer. Source and frozen name validators pass seven checks each; source/frozen asset parity is durable in the eight-check packaging suite. Independent scoped delta review approves exact `907b273`.

Repeated parse5/JSDOM parsing of the 11,396,519-character inert asset JSON exhausted Node's default 4 GiB heap in the multi-instance training test. The final QA-only loader parses a small placeholder, restores the **entire original asset text before unchanged app scripts execute**, verifies exact text, tag serialization and SHA-256 for every instance, and removes the bootstrap/global. No assets or importer initialization are omitted; real file:// browser and PWA/hash suites still use the complete file. All 41 training cases pass without a heap flag. Terra observed about 718 MiB RSS; Astra's independent exact-frozen replay took 55.23 seconds with peak RSS 1,502,956 KiB. These are separate QA runs, not phone performance measurements.

The rebuilt post-correction standalone is `63e035d3eed586d587304e712ea0ec01bb64e1fbef8ac442d0639f9b6236d40d`, PWA `ec868ec9033b9b5abbc1`. The full exact-head gate must now restart; neither the aborted attempt nor these targeted checks substitutes for it.

## Remaining field and device checks

HA0005 was not locally available; no private field replay is claimed. OCR is limited to supported printed English schedules and readable geometry; handwriting, rotated/diagonal-only raster layouts, complex crossings, cross-page links and unsupported PDF codecs can remain unknown. Raw map files/previews are transient and originals are not attached to job JSON; retain them separately. The embedded runtime adds 8,547,259 asset bytes (about 11.4 MB base64); recognition loads lazily. Physical phone/WebView/Safari memory, picker and field behavior remain unverified, as do employer acceptance and release signing/publication.

## Delegation and tool record

Explicit user-selected execution roles: lead `gpt-6.1-sol` / high; route writer `gpt-6.1-terra` / high; map writer and independent RF reviewer `gpt-6-astra` / high; read-only auditor `gpt-6-luna` / medium. Delegates were started with those actual model/effort overrides and fresh context. Token usage and billing cost are not reported by this runtime.

Actual tools: GitHub connector and CLI for canonical refs/PR metadata; Firecrawl for the three standard manufacturer PDFs (the two excluded HO/GaN URLs redirected to the Cisco homepage); Wolfram for the numeric reference; Context7 and pinned package source for the importer; Figma read-only existing frame inspection in the route lane; local Git, Node, Python and Playwright for implementation and checks. Data quality guidance was applied to a local catalog profile: 516 device IDs and 17 cable IDs, no missing or duplicate IDs; catalog scalar gain references were distinguished from operating curves. No private field evidence was sent to these services.
