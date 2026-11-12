# Lane A status — required core and native retention merged

**D1, D2 and the native Station follow-up are complete on build3.** Lane B actually merged PR23 at03:11:28UTC on November12 into `f467e5261295449f94dd232ab3995c8a00be25ee`; its entire tree equals reviewed publication `2c040da5dff805e2a5cda235a75a56203dbe8da3`. **D3 final same-head gates by both lanes, D4 reconciliation/regeneration and D5 Lane B handoff remain pending.** No new application run atf467 or this status checkpoint is claimed.

This one-file checkpoint starts from actualf467 on `codex/core-closeout-status`. It changes only Lane A's status so Lane B can merge this branch into its B9 closeout work; it creates no feature PR and changes no product, QA, guide, generated artifact or KnownGaps file. The plan and both lane records were reread, including Lane B status `b1bd4bab6976389d4797a50375dae9b4b630ffeb`. That older queue snapshot does not override actual Git merges and later formal reviews.

| Item / original branch / PR | Tested source, publication and actual merge | State |
| --- | --- | --- |
| A1 Station / codex/station-view /8 | Source603/publicatione83f, merged21ed | Complete; [historical receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/e83f51615fd980155441f8861a9e474b30ad6d65/handoff_docs/lanes/codex-a1-validation.json). |
| A2 NightLog / codex/night-log /17 | Tested2690/publication3c3a, mergedf50 | Complete; [historical72/1534+554/346](https://github.com/Goodst3r/Carpe-Noctum/blob/3c3a25f57654d3597112d8c60d130ae5707dada3/handoff_docs/lanes/codex-a2-validation.json). |
| A3 SweepDue / codex/sweep-due /21 | Tested072/publication0e930, merged394 | Complete; [historical74/1760+554/349](https://github.com/Goodst3r/Carpe-Noctum/blob/0e930d13f1954191ac5b0a5498e6e1ad93c74d0d/handoff_docs/lanes/codex-a3-validation.json). |
| A4 grading / codex/sweep-grading /14 | Tested61/base394, publishedd95, actually merged0e676 | Complete. Lane A80/2072,679.0s +554/352; Lane B separate reported702s/48touch, review5867946559. [Receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/d95f08b184b9cc3cc33150e58736ecc03d9d42b8/handoff_docs/lanes/codex-a4-validation.json). |
| Native A1 / codex/station-input-retention /23 | Start807, tested2d95 on0e676, published2c040, actually mergedf467 | Complete. Lane A82/2174,683.7s +554/352; separate Lane B82/2174+554/352 and69 real-keyboard desktop probes, review5868370766. No Lane B duration was supplied. |
| A5/A6/A7 stretch | No new implementation or run | After required-core D3–D5 closeout. |

## Native evidence and source boundaries

Current Lane A evidence is at exact `2d95e04e908eba822c2789787e0fa9ec9285f269`; publication2c040 was metadata only. Source703tracked(680source/23generated),40locked dependencies and12sealed artifacts stayed unchanged/clean, with all5commands0/fresh/raw-source-equal, no restoration and complete raw/full command dictionaries including integer nanoseconds preserved. Suite time683.7s, gate wall683.973s, allcommands713.808s; raw index stat-cache bytes are diagnostic only. Exact historical commands for that execution:

```sh
python3 night-sweep/build.py
python3 build-pwa.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py
```

The separate author scoped campaign passed native13/13, UI56/56, Log23/23, Due37/37, paired/triple3/3 each, core93singlemodule, correct-source/built-HTML registry14/14 and names6, plus desktop Chromium35. Independent scoped native13/13, triple3/3, frozenLog23, audits6+6 and MCP82(41each320/390) remain distinct from author35 and static82registrations. Station is exact807 plus the incoming pure boundRecords/export; native committed-value/draft guards and all3 optional/history/original contracts survive. Sources remain the authorized A1 plan, Station/export contracts/STATION_VIEW_SOURCES and MDN badInput/focusout; no new math, range, target, key or schema.

Lane B's final [review5868370766](https://github.com/Goodst3r/Carpe-Noctum/pull/23#pullrequestreview-5868370766) supplies its own82/2174+554/352 rerun and69 real-keyboard probes, without a duration. Its first attempt lacked the local node_modules link and failed in the environment setup; that attempt stays separate from the successful rerun. Hosted native CI run57 was green per [comment6813055348](https://github.com/Goodst3r/Carpe-Noctum/pull/23#issuecomment-6813055348); hosted status is separate from either lane's gate and does not close D3. Duplicate PR22 is closed unmerged; only the coordinated native fix landed.

Immutable current [receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/lanes/codex-station-native-validation.json), [integration](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-integration.md), [independent review](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-review.md) and [full gate](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-gate.md) retain exact commands/results and source attribution. Old0da recovery72/1505+554/343/unfinished environment attempt,889mode erratum/separate-source correction and proper807reports remain historical. No counts are transferred to a new final-main run. Last owner-private replay9cad remains historical only.

Merged source identity is standalone `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`, PWA `dc6d93410e547078005a`, version2.0 Alpha build3/sourcecode27. Source/guides29screens/47features/114registry rows and practice22/16/15/8/9/7/10 describe the current merged core. These are not final D3/handoff artifact identities after D4 regeneration.

## Next

Lane B merges this one-file status branch into B9, reconciles global docs/guides/practice/known gaps using the [readiness audit](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-d4-readiness-audit.md), and regenerates normal artifacts. Then both lanes execute and report their own full/rendered gates on the same finalbuild3 head with unchanged output/clean status. Lane B writes FINAL_HANDOFF from both statuses with actual final hashes, per-item results, every untested item, supervisor questions and next steps. [Coordination6813278649](https://github.com/Goodst3r/Carpe-Noctum/pull/23#issuecomment-6813278649) records the core-closeout handoff. No Lane A self-merge or new feature PR is authorized by this checkpoint.

## Blocked and peer record

No hard block. D3–D5 remain unfinished, with no new test/build run for this status-only change. PR13 at53cdf904 has an Important documentation finding(review5868289766);9e6721cc is a partial correction under review, not closure. Other stretch base/inheritance/gate dispositions retain their own heads; no stretch full merge before core D3–D5. The current Lane B status contains historical queue text and requires its owner's B9 reconciliation.

## Questions and untested work

Lane B's native review noted dual live-status announcements as nonblocking feedback; hidden-region/screen-reader announcement reliability remains untested. Carry that finding into B9 KnownGaps and any later targeted accessibility work; this checkpoint does not modify KnownGaps or claim closure.

Existing Unknown company targets/tolerances/cadence, supervisor/local-procedure/coworker approval, permitted OEM/Vecima/AOI source titles/revisions/access and device/field questions remain in BuildList/KnownGaps. No company decision, backend or purchase is invented. No fresh private-owner replay, physical phone/emulator/Safari/WebView/mobile locale/input/touch/rotation/screen-reader/native-provider/RF/reference-plane/field acceptance, APK/signing or deployment. Real-keyboard/phone-width desktop probes are separate from physical-device verification.
