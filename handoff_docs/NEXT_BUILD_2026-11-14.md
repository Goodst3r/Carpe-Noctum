# Next build implementation and evidence

Owner: Codex, sole app-code writer. Batch started 2026-11-14T18:11Z.

Baseline fetched and pinned: `248e77802f333a1a461563dfb1973315a2043d67` (`origin/build3`). Baseline HTML SHA-256: `844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137`.

PR #59 is open/draft. Its `chatgpt/single-writer-workflow` head `215cdc971f881409dfbd67dfedb5ebf62fb7a803` supplies the active workflow (`handoff_docs/PARALLEL_TASKS.md`), read without merging that branch. Historical roles, self-merging and APK instructions do not apply. Read AGENTS, automatic plugin policy, development instructions, project status, developer build, known gaps, setup, lane status, build list and roadmap determination.

## Plan and branch ownership

1. `codex/next-carry-forward`: preserve the existing implementation from PR #55 head `18e7239d017882ee780864c5a2fe74e8d979ea7a`, PR #59 workflow and latest PR #54 scope using ordinary local merges. The existing P1 optimization already defers closed ONX previews and Sweep Due rescans; verify it rather than reimplementing. Existing P1 tests, practice and guide changes travel with the candidate.
2. `codex/next-optimization-organization`, separate branch from a freshly fetched/pinned build3, incorporating item 1 by ordinary merge: calculator-first cold launch, direct Route & sweep access, remove Field navigation and Leakage, keep useful screen IDs/shortcuts and opaque historical data. Sync actual navigation, practice, guides and affected QA. The next-build spec was found in PR #54; its daily-workflow removal list remains unspecified, so requested clarification before removing other workflows.
3. Company levels item, separate branch: enter only approved public values with registry provenance, split, frequency, plane and power/bandwidth basis. Check existing 31@54 / 43@860 forward references and separate 38 return TX context. Never infer targets from screenshots. Missing approvals/conditions and pilot codes stay blank. Requested authoritative next-build spec and approval source.
4. Carry-forward queue: per-leg route input/output, losses, gain/output limits and compatible pad/EQ; per-physical-port ONX replacement with atomic refusal; native map NAME/TAG matching and PDF-only tombstones beside confirmed actives/EOLs, grouping legs and preserving original markup/bytes; local OCR/line-recognition evaluation. These need scoped acceptance cases before claiming completion. Codex owns implementation; Spencer supplies missing company/map acceptance inputs.
5. Freeze an ordinary-merge candidate, rebuild HTML/PWA and record SHA/hash. Use one qualifying hosted full gate, or run locally once if none exists. Reuse passing evidence only for identical HTML and check changed PWA/docs/tests. Hand Claude one exact finished candidate with evidence and open checks. Never self-merge. Spencer signs with original key and tests in-place update/jobs/attachments/offline on the real phone off-repo.

## Model and tool record

- Narrow access probes: selected Luna medium using model-selected helper `/root/plugin_access`; read-only, no app edits. Scope/source audit: Luna high, read-only. Harness accepted both selections; no independent runtime model identity endpoint is exposed.
- Primary Sol high CLI probe at 2026-11-14T18:13:26Z: `codex exec --ignore-user-config --ephemeral -m gpt-6.1-sol -c model_reasoning_effort='"high"' -s read-only --json ...` failed exit 1 (401/auth token refresh). No model execution or switch claimed. Primary writer continues in the existing Codex session; its runtime does not expose an in-place model/effort control. Client selection if desired: GPT-6.1 Sol, High. Preserve branch, SHA, tests and next action across any switch.
- Actual connector checks 2026-11-14T18:12:37Z: Wolfram context + Alpha arithmetic returned 4; Hugging Face identity succeeded (read scopes available, non-Pro); Figma identity succeeded (View seat, editing unverified); Firecrawl public homepage scrape succeeded (credit balance unverified); Octen pulse returned results (some unrelated, relevance must be checked). No private inputs uploaded or resources provisioned. OCR accuracy/offline-device performance remains untested.
- GitHub connector confirmed PR #59 open; gh authenticated; clone/fetch succeeded. Local Python Playwright and `/usr/bin/chromium` available. Locked QA install succeeded.

## Evidence ledger

- Baseline `node qa/build3-nav1.test.cjs`: exit 0, 5 checks; confirms current five-tab layout before organization work. Baseline SHA/hash above; no full gate repeated.
- Discovery: existing PR #52/#55 already implements P1. A temporary baseline probe failed as expected at one closed chart / 200 rows / 32,465 markup characters for 1,000 synthetic points. Same probe against the carried-forward candidate showed zero charts / zero rows / 10,218 characters. An additional memory-release assertion was outside the agreed lazy-build contract and was discarded; no production code was changed to meet it. Existing P1 suites are the acceptance authority.
- Carried forward PR #55 by ordinary merge `747cdfaafc2f066528fdaa836f88ec33376121ff`. Merged PR #59 documentation, resolving two historical-workflow conflicts in favor of its active instructions. Merged PR #54 November 14 scope. No remote PR merged and no app source newly authored at this checkpoint.
- Authoritative requirements now available at `handoff_docs/NEXT_UPDATE_SWEEP_MAP_SCOPE.md` and `docs/superpowers/specs/2026-11-13-next-build-design.md`, subject to the current user and PARALLEL_TASKS workflow. Earlier roles/signing directions are superseded. Existing source implements approved public target profiles; unknown basis/tolerance and original AOI transcription verification remain open.
- 2026-11-14 focused inherited verification: `node qa/next-build-p1-integration.test.cjs` exit 0 / 4 tests; `node qa/evidence-ui.test.cjs` exit 0 / 30 checks. Candidate benchmark (`node qa/next-build-p1-benchmark.cjs`) exit 0: 30 × 10,000-point files created zero closed chart paths/tables; 200 jobs / 8,000 stations produced zero typing snapshot scans and one commit scan. Raw logs under `/tmp/carpe-p1-*.log`; earlier before/after benchmark and practice/guide changes are in NEXT_BUILD_P1_EVIDENCE.md.
- Carried candidate HTML is byte-identical to PR #55: `8c9073e3a233a37925906714e42f6ed8eb096abbae69ea586b149f1e0f76ab21`. Prior full gate is hosted run 43416560764, 118 suites / 3,465 checks, layout 1,244, smoke 372, attributed to that prior run, not rerun here. This docs-only carry-forward checkpoint reuses its evidence. New app bytes will require a replacement candidate gate.
- Git ancestry confirmed packaging head `4b06242991e501baacf059e6ca3a4707b832f8eb` is already an ancestor of preserved combined head `18e7239d017882ee780864c5a2fe74e8d979ea7a`. No duplicate packaging merge needed.
- Next action: start organization on its owned branch after a fresh build3 pin. Terra high read-only browser work found one tap to calculators and one to route on the inherited Home screen; the intended cold launch will remove the calculator tap.

## Review and release status

Not a finished batch or release. No Claude decision, merge, APK, emulator, physical phone or field acceptance claimed.
