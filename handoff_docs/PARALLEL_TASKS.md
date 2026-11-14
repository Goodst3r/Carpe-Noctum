# Carpe Noctum single-writer workflow

This is the active workflow for the next build. It supersedes earlier lane assignments, queues, review and merge instructions, and APK ownership, including those in any attached build plan. [Starting prompts](PROMPTS.md) use this workflow. Prior technical decisions and project rules still apply where Spencer has not superseded them.

## Baseline and priorities

Fetched `origin/build3` on 2026-11-14 17:42 UTC. The pinned baseline is `248e77802f333a1a461563dfb1973315a2043d67`. Its committed `outputs/Night_Sweep.html` SHA-256 is `844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137`.

The pin records this handoff. Before every new item, fetch `origin`, resolve `origin/build3` independently, and log the full SHA before branching. A prior pin or open PR is evidence to inspect. Use the current integration base for new work.

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
| ChatGPT / Codex, GPT-6.1 Sol | Sole app-code writer. Use medium effort for routine work and high effort for difficult RF, import or PDF work. Owns optimization, verified company-level entry, map/PDF and route/ONX implementation in the agreed batch. Ships affected tests, a practice step and guide text per item. Integrates review fixes and prepares the web candidate. |
| Claude | Reviews the finished batch once and makes the final technical call. Starts on Sonnet 5.5 at medium effort, escalates to Opus 5.5 when a defect spans files or keeps failing, and uses Fable 5.2 only if both miss. Debugs reported defects on its own branch with a reproduction, regression evidence and a proposed fix. Codex owns any app-code correction. |
| Grok | Participation is open. If Spencer retains Grok, it may check standing rules and take separable chores such as comparing approved guide text against the UI and returning suggested wording. Grok works read-only in the repository. It has no signing key or real meter files, and does not review the batch for approval or write code. |
| Spencer | Makes product and release decisions, confirms company levels, builds and signs the APK off-repo with the original key, and runs the real-phone test. Records whether the in-place upgrade retained saved jobs and attachments. |

**Question for Spencer.** Keep Grok for rule checks and narrowly scoped guide-text assistance, or leave Grok off the project? The writer and reviewer can proceed while that decision is open.

## From item branch to phone release

1. **Start an item.** Fetch `origin` and pin the latest `origin/build3`. Codex creates one owned branch per item, with a small scope and pass/fail examples. Invite independent math evidence for new formulas before relying on an implementation result. Track the baseline, owner, model and effort in the item handoff.
2. **Build and verify the item.** Run affected suites, refusal cases and any relevant render or legacy import/backup checks as changes are made. Include the item-specific practice step and guide text. Record commands, exits, evidence and unavailable checks. Measure before/after when optimizing. Draft item PRs can hold evidence and changes while the batch is assembled. They do not require separate Claude reviews.
3. **Freeze and gate the batch.** Assemble the intended merge candidate from the item branches and the current `build3` using ordinary merges. Record the exact candidate SHA and SHA-256 of the built `outputs/Night_Sweep.html`. Run the full gate once on the candidate that will merge. If a passing full gate already covers byte-identical app output, carry forward its run and hash instead of rerunning it. Run affected checks for changed tests, PWA assets or docs even when the HTML hash matches. Record the prior tested SHA and the new candidate SHA when reusing evidence. If a fix or base change produces different app bytes, gate the replacement candidate before merge. Keep required hosted checks green. Existing GitHub Actions triggers can still start the gate automatically and are documented in [gate.yml](../.github/workflows/gate.yml). Do not manually duplicate a qualifying hosted run.
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
