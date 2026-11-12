# A3 historical wording and interval-feedback peer-fix review

**Scoped verdict: PASS at `c6f742e4042529fa7fa254eb37b401b7f3bd6748`. No unresolved Important finding in this correction's scope.** This closes the reproduced historical-row wording issue and verifies the two bounded UI recommendations. A fresh full gate and Lane B's final-head review/merge remain required. This is not permission to self-merge.

## Exact source and independent reproduction

Starting reviewed integration:91eea423ae563506e00933b0ca9ac6e00c3337b4; ending ordinary child:c6f742e4042529fa7fa254eb37b401b7f3bd6748. Incoming reviewed base remains3cfb9c2021eabe52644cffbe1515224b9d027cb2. Independent detached worktree:`/workspace/carpe-a3-outage-delta-review`; author branch/worktree untouched.

Read the supplied full Lane B first review, actual complete source/QA/guide/Known Gaps delta and `/tmp/carpe-a3-peer-review-fixes.md`. Lane B's displayed07b3a91 names A4; this review independently checks the described A3 behavior rather than assuming that SHA identifies A3.

Before correction, `node /tmp/carpe-a3-historical-wording-probe.cjs` diagnosed the issue at91ee in **18 groups**:12 actual source/frozen DOM cards, covering legacy-unconfirmed and retired UBT across old/window/recent sweep dates, plus six currently bound control cases. Every historical card had neutral status/unavailable due and warning dates but still printed one of Due / overdue, Reminder window, Before reminder window. Exact dates/ages/done facts and job/storage remained unchanged. Its exit0 means the diagnostic assertions reproduced the unwanted behavior; it is not a passing acceptance run. Baseline log/JSON:`/tmp/carpe-a3-historical-wording-repro.{log,json}`.

The same independent script in `fixed` mode now rejects those words and passes atc6. Historical text preserves the historical reason and recorded/not-recorded/unknown-date facts. Original date, age, validity and done flags survive; colors/due/warning remain neutral/unavailable. Current records retain their normal green/yellow/red words. Additional source/frozen historical invalid/future/unknown/unchecked cases preserve distinct validity/done/date facts.

## Code and scope assessment

The changed `event()` historical branch replaces classifier wording with fact-only wording. Date/parser/policy/classifier code before `event()` is byte-identical to91ee. The entire job-identity/collector/readView region is also byte-identical. No collector cache, debounce, changed overlay rule, new math/cadence/default or date write is introduced.

The save notice is now the interval's immediate next sibling, within its existing setting grid and named in `aria-describedby`. Its polite live status and warning presentation say Not saved and explain exporting a backup. The transient result is tied to actual owner-object identity plus raw interval text. Same-owner refresh/resume/navigation preserves failed feedback; successful later typing replaces it with accurate saved feedback; an equal-shaped replacement owner with the same raw interval receives neither old success nor failure feedback. These transient fields are not persisted. Empty-state wording explains that the interval belongs to the open job and may differ or become unknown on another job.

All397 unrelated product/QA/reference paths remain exact from91ee, excluding only the scoped SweepDue JS, README and two dedicated QA paths. Registry, App, Jobs, Station, CSS, builder, workflow, shell, training arrays and previous independent references are unchanged. Review deferrals in Known Gaps correctly retain synchronous large-library cost, older-backup overlay chronology, optional-field keep-both integration, large exploratory-script reproducibility and final status/log reconciliation. Their reported timings/large counts remain attributed to Lane B or earlier receipts.

## Own executed automated verification

All commands ran atc6 using the existing locked QA installation via an ignored link; no install or restoration. Scoped runs used `GIT_OPTIONAL_LOCKS=0`.

| Command | Own result | Seconds / evidence |
| --- | --- | --- |
| `node qa/build3-sweep-due.test.cjs` |37 checks passed; exit0 |19.52; `/tmp/carpe-a3-peer-independent-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` |37 checks passed; exit0 |21.92; `...-frozen.log` |
| `node /tmp/carpe-a3-historical-wording-probe.cjs /workspace/carpe-a3-outage-delta-review fixed` |18 independent GREEN groups;12 historical source/frozen cards inspected; exit0 |10.27; `...-historical-green.log`, `/tmp/carpe-a3-historical-wording-fixed.json` |
| `node /tmp/carpe-a3-peer-independent-edge.cjs` |2 source/frozen groups;16 historical invalid/future/unknown/unchecked rows; exit0 |`...-edge.log` |
| Independent Python `math.ceil`/`datetime`/`calendar.monthrange` expectations compared with actual isolated SweepDue API through Node `vm` |18 boundary cases passed |`/tmp/carpe-a3-peer-independent-policy.json` |
| `node /tmp/carpe-a3-peer-independent-html.cjs` |3 generated guides' IDs/fragments/complete rendered TOCs passed |`...-html.json` |

The18 independently derived policy cases use intervals2/5/8/11 at warning/due boundaries, including distinguishing ceil versus round cases, then final valid9999-12-31 and the next overflowing due date. Source math is unchanged; these check the existing explicitly Unknown app policy, not an externally sourced maintenance rule. The author's mutant runs and earlier40,746 exploration are not claimed as this reviewer's execution.

Freshly evaluated current TrainingJob arrays match all21 current exercise-table values across Functions/main README/Coverage:22/15/14/8/9/7/10;28 screens/45 features remain unchanged from the verified integration. README mirrors remain byte-identical. All20 current worker asset hashes match. These comparisons are recorded in the final proof.

## Own actual Chrome DevTools MCP checks

`python3 /tmp/carpe-a3-peer-independent-mcp-centered.py` passed **26/26 checks**, exit0, using actual chrome-devtools-mcp1.13.0 and isolated sandboxed desktop Chromium at **320 and390 CSS pixels**,844 high/mobile/touch emulation. Only loopback synthetic data was served; usage/CrUX disabled. Raw calls/cases:`/tmp/carpe-a3-peer-independent-mcp-centered.json`; log:`...-centered.log`.

-12 historical cards (both history types ×three dates ×two widths) preserve exact dates/ages/done facts, neutral/unavailable outputs, historical reasons and no job/localStorage writes, with none of the three current-service phrases.
- Both actual empty states explain the per-job preference without creating it.
- Trusted keyboard input25 under controlled autosave failure retains the raw preference and prior autosave bytes. The Not saved notice is the immediate next sibling, linked through ARIA, politely live, warning-styled and fully visible; both measured field-to-notice gaps are16px and bottoms about568.6px within844px. No document overflow.
- Same-owner refresh/pageshow/Home→SweepDue retains failure feedback. A successful typed26 retry saves26 and replaces the warning. A replacement owner with equal interval26 does not inherit the old saved notice. No console errors.

Both `/workspace/.tools/chrome-devtools/checks/a3-peer-save-warning-{320,390}.png` screenshots were visually inspected. Controlled storage failure throws for the autosave key; this does not claim actual native quota exhaustion. The input was explicitly centered and verified focused before trusted typing. This is not automatic-error-scroll, physical-tap/keyboard, screen-reader, WebView or physical-phone certification.

Preserved first MCP attempt:`/tmp/carpe-a3-peer-independent-mcp.{log,json}`. After seven historical/empty-state checks, the tool reported click/type success but the interval preference was still absent when the harness read it. That attempt had not verified actual focus, so no feedback pass or product cause was inferred. A separate event/focus diagnostic (`...-mcp-diagnostic.{log,json}`) confirmed trusted input works. The uniquely named final script explicitly centers and checks actual focus; all four typing sequences targeted the correct input and both widths recorded trusted input events. Product source stayedc6 throughout. Failed harness evidence was not overwritten or counted among the26 passes.

## Integrity, limits and next

Final `/tmp/carpe-a3-peer-independent-proof.json` records exact HEAD/tree/parent, all574 tracked hashes unchanged, semantic staged entries unchanged, clean working tree, retained397-path provenance, helper-region equality, actual command results, independent guide comparisons and worker hashes. `git diff --exit-code`, `git diff --cached --exit-code` and `git diff --check` are clean. No raw index-byte identity is claimed.

- Standalone SHA256:`94d8243bfb10deb0ce2f843e6a7512272c736627dc7ca7d66e5b0bca61e91b22`.
- PWA index SHA256:`39ccf5c7d3658b10f14ea5a1ee92f42a6f8fc0a057dc201907681d2ef4adc977`.
- PWA content version:`36420d81ffb705793350`.

Tools used: local Git/Node/Python, JSDOM, existing harness, actual Chrome DevTools MCP/Chromium and Superpowers verification guidance. The earlier integration receipt's GitHub read is separate; no GitHub write here. No source/author-index edit, broad runner, rebuild, dependency install, private file, APK/signing/deployment, emulator/device/Safari/WebView, meter/field or supervisor validation. The author's189 native checks, names6, builds and mutation runs remain author-attributed.

Next: root fresh full gate/layout/smoke, current receipt/status/PR21 publication and Lane B same-head review/gate/merge. Full marathon D2–D5 and combined optional-field integration remain open.
