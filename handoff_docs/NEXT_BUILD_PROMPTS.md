# Start prompts for the next build
These prompts are for separately started code-environment sessions. The current task updates GitHub documentation only; it does not start implementation, signing or further web deployment.

Use the same plan revision and exact base commit. The planning branch is `chatgpt/next-build-plan-gainmaker`; the plan is `docs/superpowers/plans/2026-11-13-next-build.md`. Read its linked spec and EQ evidence. The old two-writer lane plan is historical for the completed build3 batch, not the next build.

Start Grok's spec check and ChatGPT's readiness work together. ChatGPT waits for source/math agreement before changing calculators, but can inspect and measure P1. Claude runs the small final check when the candidate exists.

## ChatGPT — primary writer and integrator
```text
Work in Goodst3r/Carpe-Noctum. Fetch build3 and the chatgpt/next-build-plan-gainmaker planning branch. Read AGENTS.md, the current next-build override in handoff_docs/WORKFLOW.md, docs/superpowers/plans/2026-11-13-next-build.md, its design spec and research/next-build/GAINMAKER_EQ_SOURCES.md. Record exact base; inspected baseline was 248e77802f333a1a461563dfb1973315a2043d67.
You are the only implementation writer. Carry the three planned packages: P1 lazy ONX previews and Sweep Due refresh; P2 company targets preserving old jobs; P3 distinct 42/204 return and 1/1.2 GHz forward cable EQ families. Complete readiness and measure P1 while Grok independently reviews spec/sources/math; wait for agreement before calculator edits. Use one implementation branch and draft PR.
Original signing key ONLY. Preserve package, storage keys, saved-job format and unrelated math. No raw AOI config or SCTE/NCTI text in public history. Unknowns block only dependent outputs. Record real UTC events, usage or not reported, tests and evidence. Targeted suites after changes, one full final-candidate gate, main Grok review plus focused fixes check, Claude's narrow source/release check. Include matching web publication at the existing site and Spencer's phone acceptance; do not claim either without evidence. Accuracy first; only Spencer cuts scope. Proceed through independent work and report concrete blockers.
```

## Grok — independent reviewer
```text
Review Goodst3r/Carpe-Noctum; no feature implementation branch. Fetch build3 and chatgpt/next-build-plan-gainmaker. Read AGENTS.md and the next-build plan/spec/EQ evidence. First review spec and sources before code. Reopen ATX ANW1513 Rev02/2021 pp. 2, 4, 5 and Cisco OL-31156-01 p. 98 / OL-31155-01 p. 100. Independently compute company target vectors and actual EQ insertion-loss differences without importing the writer's implementation.
Check 42 MHz nominal 40 versus 42 MHz labels, all 1.2 GHz table cells, unknown 204 MHz intermediate response, 0 jumper dashes, interpolation labels, model/slot/split compatibility, node-versus-amp planes, power bandwidth and field tolerances. Exact original AOI JSON is still required for file-transcription verification; do not substitute the different _2.json.
Return pass/block findings tied to case IDs and sources. After ChatGPT implements, perform one main code review and focused fixes check. Wrong math, missing support or data loss block; preferences wait. Do not duplicate a trustworthy full gate without a specific discrepancy. Never merge your own changes; no new signing key. Put review evidence on the single implementation PR.
```

## Claude — limited source and release check
```text
Use Goodst3r/Carpe-Noctum. Fetch the next-build plan from chatgpt/next-build-plan-gainmaker, then the exact candidate from ChatGPT's implementation PR. You are the small final independent check, not a second feature writer.
Read the plan/spec/EQ evidence and Grok's review. Reopen only newly cited OEM/AOI sources, verify transcription and revisions, and record one concise result per source; flag the exact original AOI file as unverified if unavailable. Do not treat company targets as OEM capabilities, nominal EQ as actual tilt, or 204 MHz endpoint data as a full curve.
Audit final commit/hash/count evidence, unknown-value behavior, original signing certificate/package continuity, existing-origin web deployment/offline readiness and Spencer's phone-check record. Do not rerun the whole gate or rewrite code without an identified issue. Original key only; no generation and no uninstall workaround. If signing is assigned to this session, follow corrected APK_PLAN.md using the existing private key outside the repo, otherwise report readiness without claiming a signed APK. Give only concrete blockers and a short handoff.
```
