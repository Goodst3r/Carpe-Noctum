# Carpe Noctum single-writer workflow

This is the active workflow for the next build. It supersedes earlier lane assignments, queues, review and merge instructions, and APK ownership, including those in any attached build plan. [Starting prompts](PROMPTS.md) use this workflow. Prior technical decisions and project rules still apply where Spencer has not superseded them.

## Baseline and priorities

Fetched `origin/build3` on 2026-11-14 17:42 UTC. The pinned baseline is `248e77802f333a1a461563dfb1973315a2043d67`. Its committed `outputs/Night_Sweep.html` SHA-256 is `844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137`.

The pin records this handoff. Before every new item, fetch `origin`, resolve `origin/build3` independently, and log the full SHA before branching. Inspect [PR #55](https://github.com/Goodst3r/Carpe-Noctum/pull/55) at integrated head `18e7239d017882ee780864c5a2fe74e8d979ea7a` or its verified successor. It contains implementation work for route, sweep and maps. Reuse verified work on the candidate and implement the gaps. Record which commits or equivalent changes were carried forward. Use the current `build3` integration base. Treat [PR #58](https://github.com/Goodst3r/Carpe-Noctum/pull/58) as an older packaging checkpoint.

1. **App optimization and organization.** Keep this an offline calculator-first app. Keep standalone calculators usable without a job and make **Route & sweep** easy to reach. Remove the Field tab, Leakage and retired daily workflows as specified in the next-build scope. Keep related inputs and results together, move live RF entry points into route cards and preserve legacy jobs and valid shortcuts. Capture a before/after measure or reproducible workflow check for each optimization.
2. **Enter company levels.** Enter only Spencer-approved values that may be used in the public project. Label them **Company** and register the source reference, revision, section, units and conditions in `night-sweep/thresholds.js`. Record split, frequency, measurement plane and bandwidth or power basis where applicable. Keep unconfirmed values and pilot codes Unknown. Use synthetic cases for validation. ONX screenshots show observed downstream measurements, so company targets need separate confirmation.

### Previously agreed next-build scope

Keep these requirements in the queue when sizing the two priorities. Report any work carried to a later batch with a reason and owner.

- Route & sweep computes expected input and output, cable and passive loss, tilt, gain margin, output limits and compatible pad/EQ by physical leg. Show measured, expected and target values separately. Keep standard GainMaker 1 GHz HGD/LE on the 42/54 workflow and applicable AOI/Vecima equipment on the separate 204/258 workflow.
- Retain every valid ONX sweep point per physical node port. A valid replacement updates only that port. A failed import leaves the previous sweep intact. Derive measured gain only from comparable paired readings. Keep the distinction between SC-QAM channel power and OFDM PLC.
- Import native map schedules and match exact NAME and TAG to confirmed symbols across sheets. **Update PDF map** creates one tombstone beside each confirmed active and EOL symbol on the same diagram page, with multiple legs grouped. Allow repositioning and refresh from a verified original. Preserve existing markup, source bytes and RF/job data.
- Check actual Codex access to Wolfram, Hugging Face, Figma, Firecrawl and Octen with appropriate read-only probes. Record failed connections and useful fallbacks. Evaluate Hugging Face OCR for meter photos/scanned labels and line recognition for maps locally. Include a model only if accuracy, size and offline browser/device results justify it. Use synthetic or public inputs with external tools.
- Verify the standalone HTML and offline Android/iPhone PWA. Preserve the original-key in-place Android upgrade path for Spencer to sign and test off-repo.

## Roles

| Owner | Responsibility |
| --- | --- |
| ChatGPT / Codex | Sole app-code writer. Owns optimization, verified company-level entry, map/PDF and route/ONX implementation in the agreed batch. Ships affected tests, a practice step and guide text per item. Integrates review fixes and prepares the web candidate. |
| Claude | Reviews the finished batch once and makes the final technical call. Debugs reported defects on its own branch with a reproduction, regression evidence and a proposed fix. Codex owns any app-code correction. |
| Grok 4.7 Heavy | Owns parallel QA implementation on its own `grok/next-build-qa` branch. Writes executable regression tests, synthetic fixtures, and evidence and guide drafts. Reproduces defects and can propose fixes. Codex integrates the QA code and owns runtime fixes. Claude owns the technical review and approval. |
| Spencer | Makes product and release decisions, confirms company levels, builds and signs the APK off-repo with the original key, and runs the real-phone test. Records whether the in-place upgrade retained saved jobs and attachments. |

### Grok's QA deliverables

Use the existing repository tooling and the candidate's public interfaces. Put new synthetic fixtures under `qa/fixtures/carpe-next/`, suites at `qa/carpe-next-*.test.cjs` or `qa/carpe-next-*.test.py`, and the handoff record at `handoff_docs/reviews/grok-next-build-qa.md`. Grok owns this file set. Codex owns runtime files, shared QA registration such as `qa/run-pwa.py`, shared fixtures, generated app/PWA artifacts and production guides. Put guide and practice draft text in the handoff for Codex to integrate with each item. Use public and synthetic material throughout the Grok work. Keep signing material, real meter captures and private plant maps out of the Grok session and branch.

| Grok role | Deliverable |
| --- | --- |
| Grok | Own the QA branch and handoff. Confirm the exact base or candidate SHA, coordinate disjoint test ownership, run focused tests, and write an executable legacy-job or navigation regression. Group reproducible failures and any suggested fixes for Codex. |
| Harper | Derive public OEM-backed reference vectors and write RF tests for 42/54 and 204/258 separation, per-leg gain and pad/EQ, blank or invalid inputs, and measurement plane/bandwidth mismatches. Keep unknown company values blank. |
| Benjamin | Build synthetic multi-sheet PDFs and executable tests for NAME/TAG and terminal matching, rotated and cropped pages, adjacent active/EOL tombstones, repeat exports, and original and markup preservation. |
| Lucas | Build synthetic ONX fixtures and executable tests for same-port replacement, failed imports, other-port isolation and legacy job and attachment round-trips. Add a focused offline smoke case where supported and draft the corresponding practice steps. |

Start with the agreed baseline and an explicit expected result for each case. A test that depends on upcoming behavior can show the expected failure on the baseline. Record that result and rerun the case on Codex's integrated candidate. Log the exact tested SHA, inputs, commands, expected and actual results, and unverified checks. Push one QA branch and hand Codex its commit SHA and changed files. If GitHub write access is unavailable, send a complete patch and the test evidence through Spencer for immediate integration. Keep the branch and handoff separate from the single finished-batch review.

## Model selection and switching

Codex and Claude can use any model and reasoning effort available in their own current client, account and approved usage. Pick for the task, tool access, accuracy and expected rework. Among models that meet the accuracy requirement, prefer the one that finishes the work with less usage and time. Use the model's supported default effort as a starting point. Increase effort when the current model needs to check more evidence, or switch models when the task or capability changes. A difficult RF, PDF geometry or saved-job issue can start on a stronger model immediately.

| Work | Codex examples | Claude Code examples |
| --- | --- | --- |
| Narrow extraction, log triage and repeatable checks | GPT-6 Luna | Haiku 5.5 |
| Rendered layout, screenshots and browser interaction | GPT-6.1 Terra | An available vision-capable model, such as Sonnet 5.5 |
| Routine implementation, integration and review | GPT-6.1 Sol for implementation | Sonnet 5.5 for routine review and focused reproductions |
| High-risk or ambiguous RF, PDF or saved-job work | GPT-6.1 Sol with higher effort or GPT-6 Astra | Opus 5.5 or Fable 5.2 when the evidence warrants it |

These are starting points, and the actual model picker governs availability. In Codex use `/model` in the CLI, the client model picker or `codex -m MODEL` at launch. In Claude Code use `/model` and `/effort` or `claude --model MODEL` at launch. If the host exposes a supported control, apply the switch through that control. If it requires Spencer's input, state the model and effort to select or continue with a suitable available model. Before switching, keep the current branch and SHA, commands, results and remaining work. Verify the active model and log the change and reason. Model switches preserve writer/reviewer roles and verification requirements. Use existing plans and approved credits.

Provider task guidance and controls, checked November 14, 2026 using Octen discovery and Firecrawl retrieval. [OpenAI model guidance](https://learn.chatgpt.com/docs/models) · [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview) · [Claude Code configuration](https://code.claude.com/docs/en/model-config)

## From item branch to phone release

Run the Codex kickoff first to pin `build3` and report the agreed starting SHA and interface for Grok. Start Grok on its QA branch as soon as it has that handoff while Codex implements. Give Claude the combined candidate SHA, QA commit and evidence for the single batch review. After Claude's final call and any corrections, Spencer signs and tests the APK off-repo.

1. **Start an item.** Fetch `origin` and pin the latest `origin/build3`. Codex creates one owned branch per item, with a small scope and pass/fail examples. Invite independent math evidence for new formulas before relying on an implementation result. Track the baseline, owner, model and effort in the item handoff.
2. **Build and verify the item.** Run affected suites, refusal cases and any relevant render or legacy import/backup checks as changes are made. Include the item-specific practice step and guide text. Record commands, exits, evidence and unavailable checks. Measure before/after when optimizing. Grok can develop its cases and reproduce failures in parallel. Codex takes its QA commits or complete patch, registers eligible suites, and reruns them on the combined candidate. Draft item PRs can hold evidence and changes while the batch is assembled. Review the finished batch together.
3. **Freeze and gate the batch.** Assemble the intended merge candidate from the item and QA branches and the current `build3`. Designate one `build3` PR for the complete candidate and give Claude its link. Record the exact candidate SHA and SHA-256 of the built `outputs/Night_Sweep.html`. Run the full gate once on the candidate that will merge. If a passing full gate already covers byte-identical app output, carry forward its run and hash instead of rerunning it. Run affected checks for changed tests, PWA assets or docs even when the HTML hash matches. Record the prior tested SHA and the new candidate SHA when reusing evidence. If a fix or base change produces different app bytes, gate the replacement candidate before merge. Keep required hosted checks green. Existing GitHub Actions triggers can still start the gate automatically and are documented in [gate.yml](../.github/workflows/gate.yml). Do not manually duplicate a qualifying hosted run.
4. **Review the finished batch.** Claude reviews the exact candidate once and gives **APPROVE** or **CHANGES NEEDED**. Each finding must show a reproducible failure or a broken rule, with file/line or source, command or steps, expected and actual result, and severity. Put preferences on a later list. Claude reproduces reported defects on its own branch. Codex applies app fixes, and Claude checks the focused corrections on the stated SHA. Use one consolidated review and correction handoff. Claude or Spencer can merge the approved candidate with permission. No one merges their own pull request. Recheck the intended base and candidate before merge.
5. **Hand off the web build and phone test.** Record the frozen standalone HTML and PWA verification, plus the SHA-256 that Spencer should use for his private APK build. Assistants never build or sign the APK. Spencer signs off-repo using the original key and tests an in-place update on the real phone. Record browser, emulator and physical-phone evidence separately. Close the phone-release milestone when Spencer verifies the working release, including offline launch and retained jobs and attachments.

### Gate commands and evidence

Use the existing gate, including clean builds and all three suites. It may run in hosted CI or in a configured shell as appropriate. [Tools and setup](TOOLS_AND_SETUP.md) covers dependencies and Chromium.

```bash
npm ci --prefix qa/runtime --no-audit --no-fund
python3 night-sweep/build.py
python3 build-pwa.py
sha256sum outputs/Night_Sweep.html
python3 qa/run-pwa.py
python3 qa/build3-layout.test.py
python3 qa/browser-smoke.py
git diff --check
git status --porcelain
```

Save a timestamped UTC record in the batch PR or its linked handoff. Record baseline fetched, each item started and verified, candidate frozen, gate run or reused, Claude's decision, merge, Spencer's signed install, and defects reported after release. Include item/branch, SHA, HTML hash, evidence links and owner/model as applicable. The build metric is elapsed time from the batch start to the confirmed working phone release, plus defects found afterward. Test and PR counts are evidence only. Prioritize cost and accuracy, then speed. A 24-hour turnaround is a goal.

## Standing engineering rules

- Offline only. Keep 42/54 and 204/258 separate. Keep company targets, measured values, estimates and specifications distinguishable. Every limit is labeled **Spec**, **Expert**, **Company** or **Unknown** and registered in `night-sweep/thresholds.js` with its source, revision, section, units and conditions. Blank never means zero. Never invent a pilot code.
- Independently derive new formulas outside the app and test the app's real functions, including boundary and refusal cases. Use the existing [calculator vectors](reviews/chatgpt-calculator-test-vectors.json) where applicable. Preserve documented numeric bounds and compare rendered values as well as unrounded results.
- Preserve package IDs, version and storage keys, and existing screen IDs and job-format compatibility. Saved-job changes are additive only. Old jobs, backups and existing values must open and round-trip. Use phone-first dark UI and the existing plain JavaScript/HTML/CSS conventions. Use synthetic practice data, omit private job/customer identifiers, keep UBT excluded from new selections, and paraphrase and cite SCTE/NCTI material by number and year.
- Preserve prior technical decisions and unresolved product/source gates in the [historical workflow](WORKFLOW.md) and [roadmap determination](ROADMAP_DETERMINATION.md), subject to newer Spencer decisions. Safety remains removed, Vecima setup stays plug-and-play, and the existing DOCSIS limit distinctions remain. Keep deferred or source-blocked work out of the batch until resolved. The new direction removes Leakage.
- Never touch `main`, another assistant's branches, tags or repository settings. Never force-push or rebase. Use ordinary merges and authorized PRs into `build3`. Do not stage QA dependencies or incidental evidence churn. Rebuild generated files rather than hand-merging them. Keep module list entries one per line and new limit rows together. Keep the guide, training and screen names in sync and render guides when changed. Preserve the existing README parity and app/QA integration conventions.
- No assistant builds or signs an APK. Keep signing material and real meter files out of Git, hosted tools and handoffs. Continue with existing plans and credits. Report actual commands and results. Keep blocked checks visible, record two genuine attempts if a fix remains blocked, and continue independent work without weakening a test. Put decisions that require Spencer in the handoff.
