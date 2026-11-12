# Independent A4 / reviewed Sweep Due integration delta review

**Scoped PASS; no new Important or unresolved finding in this integration.** Frozen source **61c4d4add20b47cd8fb96e9a9fafc392e10c9ffe**, exact ordinary merge parents **41c4db2ea7c6fd550069b5e1c6a88217c1876f61** (reviewed production A4) and **394179c7ac15ad57d19b654a4427e3b9fa2f54c0** (reviewed Sweep Due base). Reviewed and tested only the separate detached worktree `/workspace/carpe-a4-sweepdue-delta-review`. No author/original checkout content or index was changed.

Standalone SHA-256 **8caf8ff1e9ccccc701a3f8e27e88c46f8331bdf9747946ccc97d1e05bdc9cb24**; PWA content ID **b354fda83dc6f8c89109**; PWA index SHA-256 **9cb8ed05b8ffec98bd115f76360195bb07bc3e0bc94b3247cb517072bd0db943**. All680 tracked files remained identical to my pre-test manifest and to their actual frozen HEAD blobs. Worktree, staged contents, `git diff --check` and Git status are clean.

This approves the specified integration delta. It does not claim the whole80-suite gate, current-head Lane B approval, publication, deployment or D1–D5 completion. Those remain root/coordinator responsibilities. No result from the older41c full gate or my older60d/41c reviews is counted as a new result below.

## Source and specification review

Read the complete author integration report `/tmp/carpe-a4-sweepdue-integration.md`, the complete new triple-feature QA suite and the source/current-guide integration deltas. Compared both parent blobs and delivered artifacts independently. My unique provenance script and receipt are `/tmp/carpe-a4-sweepdue-delta-provenance.py` and `.json`.

- Twelve protected A4 implementation/style/QA files are byte-exact41c, including EvidenceCore, EvidenceUI, archive adapter, grading core/UI, Station, shared style, original NightLog/grading interop and native/core/layout QA. Grading UI SHA remains **4886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215**. Therefore the previous six fixes, four UI corrections, display formatting and render-local optimization are retained; this review does not relabel their old comprehensive test counts as new.
- Thirteen incoming NightLog/SweepDue/Safety/Outage/base-QA/calendar-reference files are exact394. No date, RF, grade, parser, archive or context formula/policy was changed here. Existing company grading profiles remain default-free/Unknown and plant profiles remain distinct.
- **Station's intentional exception is verified in both directions:** whole Station is exact41c; removing only the existing pure `boundRecords` function/comments/export gives exact394 Station. No new A1 native-input fix was imported. All existing handlers and StationMath remain reviewed-base bytes. The pure accessor remains available during early autosave boot.
- Removing only the existing grading keeper/validator/content additions from current app/jobs/workflow reconstructs exact394. Both `savedNightLog` and `savedGrading` declarations/spreads survive. All three optional validators and working-content terms survive. `NightLog.render(true)`, SweepDue refresh and all nine base Job tabs survive. Route example's dropping of the interval preference remains deliberate reviewed-base behavior; no new keeper/schema was invented.
- All38 base module splice tuples are an exact ordered prefix, followed by the existing three A4 additions. All40 noncatalog module byte strings are present in both standalone and PWA. The74 base suite identities remain once and in order; existing five A4 suites plus the one new separate triple-feature process give80 unique registered suites. The grading suite retains all56 case names/order; only current-count oracles changed. Existing interop3 is exact41c.

Independent runtime tuple audit `/tmp/carpe-a4-sweepdue-delta-tuples.cjs` passed **six audit groups**: exact72-base-row prefix +42 retained A4 rows =114 unique entries; exact46 base feature tuples + grading47;29 screens; exact9 Job tabs; actual exercise lengths **22/16/15/8/9/7/10** matching all visible summaries;47 unique feature markers; default-free grading/company interval and unchanged Unknown policy labels. Complete facts are in `-tuples.json`.

## Own focused automated results

These fresh commands used default Node flags at exact61c, separate processes, no skips and no `--jitless`. `/tmp/carpe-a4-sweepdue-delta-run.py` and `-results.json` record the actual commands, exit0 results, wall times and logs.

| Command | Own result | Wall | Log |
| --- | --- | --- | --- |
| `node qa/sweep-grading-ui.test.cjs` | 56 passed | 54.350 s | `/tmp/carpe-a4-sweepdue-delta-grading-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` | 56 passed | 55.253 s | `/tmp/carpe-a4-sweepdue-delta-grading-frozen.log` |
| `node qa/build3-sweep-due-grading.test.cjs` | 3 groups passed | 23.890 s | `/tmp/carpe-a4-sweepdue-delta-triple-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due-grading.test.cjs` | 3 groups passed | 25.138 s | `/tmp/carpe-a4-sweepdue-delta-triple-frozen.log` |

The56-case runs exercise retained grading UI/import/async/owner guards and current guide/runtime consistency, including the public100-history render-local spy. New triple groups independently exercise actual date handlers, immutable captures/grades, early-boot/warm500 guard, all three optional states, named duplicate, exact-original portable remapping, atomic import refusal and example policy. This is a fresh verification of the registered suite; it is not a fresh independent derivation of unchanged formulas or a replay of every prior independent adversarial group.

`node /tmp/carpe-a4-sweepdue-delta-tuples.cjs`, `python3 /tmp/carpe-a4-sweepdue-delta-provenance.py`, and `python3 /tmp/carpe-a4-sweepdue-delta-guides.py` each exited0. Guides audit passed **six audit groups**: all three authored/published HTML pairs have unique IDs, complete ordered automatic TOCs, resolving fragment links and identical article text; the explicit35-link Functions contents exactly matches all non-contents H2s; all21 current exercise-table cells match the actual seven arrays; current29/47 references, main README mirrors and all20 worker asset hashes agree. Functions contains36 H2s including contents and47 feature markers. Detailed guide facts are in `-guides.json`. Historical Build2 statements remain historical.

## Own actual Chromium / MCP results

`python3 /tmp/carpe-a4-sweepdue-delta-mcp.py` exited0 with **38 independent checks passed**, using actual Chrome DevTools MCP **1.13.0**, isolated desktop `/usr/bin/chromium`, dark mode at **320 and390px** and a loopback server serving the frozen standalone. No private exports or existing browser profile was used. Exact checks/tool counts and SHA are in `/tmp/carpe-a4-sweepdue-delta-mcp.json`; log `-mcp.log`.

At each width a fresh synthetic five-station fixture was captured again using trusted Enter on the actual Add button. Swept2025-11-11 and balanced2026-10-31 stayed separate in that fixed sixth capture. Trusted interval keystrokes entered18, producing the yellow reminder with due2027-05-11 at explicit as-of2026-11-11. A synthetic original CSV was imported and trusted Enter on Grade verified the original and produced Current PTV2.5/pass with other criteria Unknown.

At both widths interval18→24 left both persisted histories exact and the verified grade Current. **The script then explicitly restored18 before either Station date edit** (original script line55); the due2028-05-11 below is therefore an18-month result. The original24-step assertion checked histories/Current only and did not explicitly assert the saved interval or24-month due date; the separate targeted addendum below closes that oracle gap. Live balance-only date2026-11-10 did not reset sweep date/reminder; it demoted Current for the changed Station context while leaving saved grade data exact. Live sweep date2026-11-11 then made only the live reminder green with due2028-05-11. Captured dates/stages/log JSON and complete saved grading JSON remained byte-identical. Whole reminder cards fit without horizontal overflow. Complete Station dates were set through their real controls and dispatched change handlers; these are real-browser integration checks, **not claims about trusted segmented partial-date/native badInput behavior**.

Both widths performed500 Station calculations, a real page reload and real original re-verification readiness. All three optional sections and raw Station restored exactly, with no unreadable-autosave quarantine. The Station editor remained populated and its reminder still read current dates. Retained documents reported no Chromium console errors.

At390 the browser additionally proved full optional-state/Station backup restore with correct new evidence-ID mapping, unchanged captured grading content apart from the mapped source ID, exact original base64 bytes and SHA independently calculated in Python, restored-owner usability, and atomic refusal for each malformed NightLog/SweepDue/SweepGrading section. Trusted Enter on the actual visible Route example retained both histories and every prior keeper while dropping the interval in state/autosave as reviewed. An old empty owner plus example invented none of the three optional sections.

The browser inputs/CSV were synthetic. Desktop Chromium at phone widths is distinct from emulator, physical phone, Android WebView, Safari, screen reader or field verification.

## Integrity and remaining work

`python3 /tmp/carpe-a4-sweepdue-delta-proof.py` exited0 after all checks. `/tmp/carpe-a4-sweepdue-delta-proof.json` proves exact head, all680 unchanged tracked hashes and equality to every frozen HEAD blob, clean unstaged/staged contents/status, and the app/index/Station source hashes. Pre-test manifest: `-before.json`. The only checkout setup was an ignored symlink to existing locked QA dependencies; there was no installation, builder, source edit, restoration, GitHub/API write, push or APK work. The actor's27 browser checks and19 focused commands remain actor results and are not added to mine.

No new open finding in this delta. Independent scope is complete. Root should finish the serialized full gate at this exact source, preserve attribution to the new head, arrange same-head Lane B review, then handle the original A4 branch/publication/status under the plan. Existing product unknowns, unmerged A1 native-input follow-up, whole-app/device/field limitations and D1–D5 paperwork are not closed by this scoped review.

## Explicit interval24 oracle clarification

Root correctly identified that the first narrative omitted the restore18 step. Original `/tmp/carpe-a4-sweepdue-delta-mcp.py` line53 types24; line54 checks histories/Current; line55 explicitly types18 before balance/sweep changes. The original raw38-check receipt has `data:null` for the24-step check, so it does **not** independently prove stored24 or its due date. The original script, raw JSON and log remain byte-identical; their preserved SHA256s are in `/tmp/carpe-a4-sweepdue-delta-interval24-old-receipts.json`. The raw38-check count remains38.

To close that narrow oracle gap, `python3 /tmp/carpe-a4-sweepdue-delta-interval24-mcp.py` passed **14 separate targeted actual-MCP checks**, seven at320px and seven at390px, on the same exact frozen61c and standalone SHA. Its fresh contexts independently capture a synthetic log entry and establish a verified Current grade. At each width the raw receipt explicitly records/asserts:

- Baseline interval18 and sweep2025-11-11 give due2027-05-11.
- Trusted interval keystrokes24 give **`state.sweepDue.intervalMonths === "24"`**, the same autosaved string, `readView().interval === "24"`, unchanged sweep2025-11-11 and **due2027-11-11**; the reminder is green at the explicit2026-11-11 reference date. Both complete saved histories remain exact and the verified grade remains Current.
- Trusted restore18 is then explicitly asserted in state/autosave before any Station date edit, with due2027-05-11/yellow. Both histories stay exact and the grade stays Current.
- Only after that restore does a live sweep-date change to2026-11-11 yield **due2028-05-11** at18 months, with the independent balance date2026-11-10, no history rewrite and Current demoted.

New targeted evidence is `/tmp/carpe-a4-sweepdue-delta-interval24-mcp.{py,json,log}`. It is a separate14-check run, **not an inflation or rewrite of the original38**. No failed targeted probe occurred. No production defect/change was needed; the problem was omitted sequencing in my report and an incomplete original24-month assertion. Strict post-addendum proof `/tmp/carpe-a4-sweepdue-delta-interval24-proof.json` verifies the old raw receipts unchanged and all680 tracked files still unchanged/equal frozen HEAD blobs, with clean staged/unstaged/status. Scoped PASS is unchanged.
