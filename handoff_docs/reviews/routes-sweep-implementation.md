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

Implementation and verification are in progress. Exact final commands, UTC times, counts and hashes will be recorded here after execution.

## Delegation and tool record

Explicit user-selected execution roles: lead `gpt-6.1-sol` / high; route writer `gpt-6.1-terra` / high; map writer and independent RF reviewer `gpt-6-astra` / high; read-only auditor `gpt-6-luna` / medium. Delegates were started with those actual model/effort overrides and fresh context. Token usage and billing cost are not reported by this runtime.

Actual tools: GitHub connector and CLI for canonical refs/PR metadata; Firecrawl for the three standard manufacturer PDFs (the two excluded HO/GaN URLs redirected to the Cisco homepage); Wolfram for the numeric reference; Context7 and pinned package source for the importer; Figma read-only existing frame inspection in the route lane; local Git, Node, Python and Playwright for implementation and checks. Data quality guidance was applied to a local catalog profile: 516 device IDs and 17 cable IDs, no missing or duplicate IDs; catalog scalar gain references were distinguished from operating curves. No private field evidence was sent to these services.
