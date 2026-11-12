# Required-core optimization follow-up

Pinned A4 source: `fe245887d30da3b8fa3e01fa721e31a47a3bba9c`. Sources were obtained only with `git show <pinned-head>:<path>` into `/tmp/carpe-required-core-optimization-followup/`; no active integration worktree was compared, edited or checked out. Root gates continued independently. The following candidate remains SCRATCH ONLY pending root authorization, author integration, fresh independent review and final same-source validation.

## Already implemented; no new speedup claimed here

- Station catalog indexing: `603060788493df1752da37a396507e430cacde40` is an ancestor of the pin. `station.js:56–75` already builds a first-match-preserving ID map once per `targets()` pass. It does not need to be implemented again.
- ZIP CRC: `b86382186c3179bd1037cf20a63a722e777711dc` is an ancestor of the pin. `evidence-archive.js` retains the exact already-reviewed SHA-256 `8e08b058f3443f977b4a1c58025f020608775ff8d7f9058ba0a4c6f514a1dd2a`, private lazy 256-entry table and every original member/bounds/size/CRC check. Old CRC timings and prior full-gate counts are historical evidence, not new execution in this audit.

## New measured finding: one global context rebuilt for each historical row

`sweep-grading-ui.js:37–41` canonicalizes the current job/source/node/route-meter/forward/return context and calls actual `StationView.boundRecords()`. `freshness()` at line 51 repeats that same operation for every eligible historical row rendered by line 110. `StationView.boundRecords()` at `station.js:98–99` calls the already-indexed `targets()` and clones each bound raw record. Thus the earlier catalog optimization remains useful, but a 100-row history still repeats catalog-map construction, bound-record cloning and deep canonicalization 100 times in one synchronous render.

The concrete scratch patch retains public `freshness(r)` as a one-argument wrapper, adds an unexported helper, and gives only the render map a lazy local context getter. Each helper call receives a fresh shallow copy because the existing comparison substitutes the compact `recordSnapshot`. Context properties are currently strings. There is no cross-render or persistent result cache. Empty/unavailable-only histories still avoid context construction; direct public freshness calls continue recomputing context.

Exact concrete-candidate measurements below use Node 24.22.1, one warmup and five alternating paired runs. They measure the real pinned renderer’s string construction with a DOM string sink, including actual Station/context/core code; they exclude browser HTML parsing/layout. Synthetic catalog has 516 invented devices, matching only the pinned catalog count. Relevant component validators passed, rows/log counts stay within 200, bound Station records within 1,000, and history within 100. Root gates may contribute machine-load variability. These are not browser/phone or ordinary-small-job guarantees.

| Route rows / each forward+return log / bound Stations | Histories | Raw canonical bytes | Baseline median | Concrete scratch median |
|---|---:|---:|---:|---:|
| 10 / 10 / 11 | 1 | 27,002 | 0.642 ms | 0.740 ms |
| 50 / 50 / 51 | 100 | 126,834 | 215.296 ms | 5.753 ms |
| 200 / 200 / 201 | 100 | 502,411 | 870.146 ms | 14.493 ms |

The one-history control shows no improvement; the material result is removal of repeated work in larger saved histories. An earlier scratch prototype also measured nine size/history combinations (7 alternating measurements); those are separately retained in `/tmp/carpe-required-core-optimization-followup/results.json` and are not substituted for the exact concrete-candidate figures above.

## Fresh characterization and concrete handoff

- **63 deterministic Node component cases passed.** They compare byte-exact HTML and unchanged state/cache across 0/1/100 historical rows; available/missing/changed source fields; digest/context/profile changes; direct owner/route/raw Station mutations and restorations; mixed/reversed history; legacy contexts; legitimate Current calculations with 0/1/99 prior histories; and rejected route/owner/away-and-back mutations at both async verification boundaries. Node’s EvidenceUI service is an explicit synthetic contract fixture, so these cases do not claim real original-byte verification. No timing assertion is used.
- **22 actual desktop Chromium 156.0.8078.79 cases passed at 320/390 px.** Original and candidate pinned standalone HTML ran with actual file-picker import, native SHA code and a real Grade click on invented CSV. A public `StationView.boundRecords` spy observed **100 → 1** calls for steady 100-row histories and **101 → 2** during first owner synchronization; the next owner render returned to 100 → 1. Grading HTML and state were byte-exact between variants for every scenario, render state stayed unchanged, 100 records were retained, viewports fit, and there were no runtime errors or non-loopback requests. Test clock/identifier generation was deterministic; native SHA was not replaced. No private production test exports were used in this browser proof.
- A delegated read-only static reviewer found no blocker: public freshness semantics/exports, metadata guards, grade/signature/observers/save boundary, caps and both post-await checks are byte-unchanged except the private helper extraction/render call. This is static review, not an independent runtime gate.
- `git apply --check` and actual apply ran only in a temporary plain directory; the applied scratch file exactly matches the concrete candidate. Nothing was applied to a repository.

Files ready for root/author review:
- `/tmp/carpe-a4-render-context-optimization.patch`
- `/tmp/carpe-a4-render-context-optimization-candidate.js`
- `/tmp/carpe-a4-render-context-optimization-regression.cjs` and `-harness.cjs`
- `/tmp/carpe-a4-render-context-optimization-characterization.json` and `.md`
- `/tmp/carpe-a4-render-context-optimization-browser.py` and `.json`
- `/tmp/carpe-a4-render-context-optimization-public-regression.cjs`: commit-ready suggested addition to the existing grading UI suite, using its real app/SHA/IndexedDB helpers plus the public boundRecords spy. It asserts one call for 100 valid historical rows, direct route/raw Station mutations/restoration and a replaced owner on later renders. The integrating author must place and execute it; this snippet itself is not claimed as an executed repository test.

## Guards that must stay exact

- Four plant/direction company profiles remain independent and blank by default. Registered grading guards stay Unknown application provenance: 5–1800 MHz, absolute samples/entries ≤1,000,000, magnitude limits ≥0, 1–10,000 supplied samples, 100 saved grades. Saved context text validation remains 16,000 characters; compact history is not expanded or migrated.
- Evidence guards remain 8 MiB/file, 12 MiB/job, 30 attachments, 2 MiB decoded preview, 32 ZIP entries. All original byte-length/SHA-256 reads, archive checks, explicit units/direction, ambiguity handling and raw sample arrays remain untouched.
- Reuse belongs only to one synchronous render. Preserve separate `signature()` and owner/revision guards before and after each await; `observeContext()`/saveLocal must still detect away-and-back edits. Do not reuse a prior render context, promote a digest-cache miss or legacy snapshot to Current, include unbound archived Station records, or mutate history/raw digestCache.
- A Current row still runs its own signature context check, and a changed owner still takes its own synchronization snapshot. Those additional checks intentionally remain; a universal “one context call per every render” assertion would be wrong.
- The shallow copy is safe because today’s context fields are strings and only `recordSnapshot` is replaced. If context later gains mutable nested fields, reevaluate this assumption. Keep the helper private and public freshness direct-call semantics unchanged.

## Retained eager Evidence preview gap and deferrals

`evidence-ui.js:251` still calls `preview(m)` for every card; `preview:234` calls `chart()` even for closed details, and chart line 222 formats all samples. Its SHA-256 is byte-identical to the earlier audit: `180135e0ffd278a7e2cd18b5fb332de8c4ea66261147a300139be2c4f540dcdd`. The prior 30 closed 10,000-sample-card result (~142.9 ms / 4.59 MB markup) is historical from `/tmp/carpe-evidence-optimization-audit.md`; it was NOT rerun or counted as new here. Lazy previews need separate open/toggle/focus/print/current-sample review and remain deferred. Existing native descriptor/empty-chart-warning follow-ups also remain outside this work.

No production implementation is authorized by this handoff. Do not interrupt the active integrations. After root selects/author applies a frozen candidate, integrate the public regression, run scoped actual-handler checks, obtain fresh independent review and execute the final same-source full gate. No broad gate, dependency installation/update, private attachment, publishing or repository write occurred in this audit.

Pinned source SHA-256: `a5c6680389f9ba4d01e1681f10cfcba5dcb661d0255fec9f35dbad6ef75cc944`. Concrete candidate SHA-256: `4886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215`. Patch SHA-256: `c653c585f4a93ecd7571d7b39f72299bbae57f45610dea80fe92cc98f2633fbe`. Full source manifest and exact scripts/results are in `/tmp/carpe-required-core-optimization-followup/` and the concrete artifact paths above.
