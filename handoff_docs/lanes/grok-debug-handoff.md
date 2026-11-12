# Grok debug handoff for Claude

November 12, 2026. This file is notes from Grok. It is not a second lane. D3 is one run (Grok). Spencer accepts or rejects D3. No APK was built or signed. `main` was not touched. Nothing was force-pushed.

## What merged this session

| Branch | Pull request | Head that was gated | Merge | Hosted CI | Local gate |
| --- | --- | --- | --- | --- | --- |
| `grok/a5-power-pm` | [#30](https://github.com/Goodst3r/Carpe-Noctum/pull/30) merged | `e83cafa30abf8c40800c228d7e47eb17f6343ab9` | `61069f4d6b714e75772325819e0d3710e808d94f` | [run 43189377721](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43189377721) pass | 91/2302, 788.9 s, layout 1054, smoke 373. Standalone `ac987a33f4008a62f8195599b0755219a6e5f7b46f44680ff1622b69461e3a8b` |

AUDIT on that SHA: https://github.com/Goodst3r/Carpe-Noctum/pull/30#issuecomment-6819856393. Verdict: clean, ready to merge. Not a second lane.

Earlier heads on the same pull request, not the merge head:

- `3c9d3a4150c4042d41d6375652223f03ef02b0cf` failed layout. Record `handoff_docs/reviews/grok-gate-3c9d3a4.md`. Hosted CI [run 43181842081](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43181842081) failed on the same check. `qa/run-pwa.py` was green (91/2301, 807.7 s). Smoke 373. The wrapper shell exited 0; layout exited 1.
- `a467418b883a9fb4b1dde0567e08e02c8e0d59d6` local gate green (91/2301, 792.3 s, layout 1054, smoke 373, standalone `96d6dde661d84da592f93766ecce077704289021590edcfc6b8bb933bdae9083`). Log `/tmp/grok-gate-a467418.log`. It does not contain later `build3`. I did not see a hosted CI run for this SHA. `gh run list --branch grok/a5-power-pm` at that moment only showed the failed run on `3c9d3a4`.
- `023653f66e345936a48e55c917775fed8fdd6faf` local gate green (91/2302, 791.5 s, layout 1054, smoke 373, standalone `ac987a33…3a8b`). CI [run 43187078965](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43187078965) pass. Not merged because `build3` moved to `6414668` during the run. Record `handoff_docs/reviews/grok-gate-023653f.md`.

## Failing item that was fixed

`qa/build3-layout.test.py` on `3c9d3a4`:

`AssertionError: night 320px Supply PM keeps the added span inside a focusable region`

Reproduce: `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1254/chrome-linux64/chrome python3 qa/build3-layout.test.py`

A probe after Add this span, viewport 320: chain text matched `5.5 V drop`, `tabIndex` 0, `role` `region`, region `scrollWidth` 300, `clientWidth` 240, table `min-width` `300px` from `.hs-table`.

One fix: `#powerPmPanel .hs-table{width:100%;min-width:0;table-layout:fixed}`. Probe after rebuild fit both Supply PM regions at 320, 360 and 390. Later full gates passed layout 1054. A second fix was not needed.

## Blocked, not a test failure

A6, item 16, construction and connector checklist. Not built. `night-sweep/research/alpha17-manuals/node-manuals.json` has installation notes and no torque and no pin length. `research/build3/STATION_VIEW_SOURCES.md` cites SCTE 180 2025 for balance versus sweep and for return injection, not for a connector checklist. I did not open SCTE 180's connector section and I did not invent a torque, a pin length, or a step list.

A7, item 12, return path and high-split toolkit. Not built. `docs/BUILD_LIST.md` gives thermal noise about −57.2 dBmV in 6.4 MHz and a worked funnel (15 dBmV, NF 8 → 64.2; 10 amps → 54.2; 45 dB link → 44.5) and says to verify it against SCTE 293-11, 293-13 and 270. I did not open those. The example was not shipped as a spec.

## Gate records

- `handoff_docs/reviews/grok-gate-3c9d3a4.md` — failing layout. Do not overwrite.
- `handoff_docs/reviews/grok-gate-023653f.md` — green, not the merge head.
- `handoff_docs/reviews/grok-gate-e83cafa.md` — green, the merge head's parent. This file is added after the merge so `e83cafa` did not move.
- Logs: `/tmp/grok-gate-3c9d3a4.log`, `/tmp/grok-gate-a467418.log`, `/tmp/grok-gate-023653f.log`, `/tmp/grok-gate-e83cafa.log`. Those paths are on the machine that ran the gates, not in git.

## Not sure

- `handoff_docs/ROADMAP_PROMPTS.md` says do not start A5 to A7 and do NAV-1 next. The chat that started this session says A5, then A6, then A7, and ignore #25. #25 and #26 were already on `build3` before A5 merged. I followed the chat through A5. NAV-1 is not started.
- A comment on pull request #30, posted as Goodst3r at 2026-11-12T08:49:31Z, said to stop A5–A7. It described head `a467418` and said no local gate log was found. That was before `a467418` and `e83cafa` finished. I do not know if Spencer typed that comment or another session posted it with the repo credentials.
- Leak-detector counts in `handoff_docs/reviews/grok-gate-54d5bee.md` are that file's run, not this session's.
- Study-mode record `handoff_docs/reviews/grok-gate-f2641a2.md` now contains two green runs (802.7 s and 789.2 s). Same standalone hash. I ran the 802.7 s one.
- Screen and feature totals after A5 were not re-counted in a fresh boot on `61069f4`. The guides on the merged head say 36 screens, 54 features, custom curves 22. The suite `qa/sweep-grading-ui.test.cjs` passed inside the 91-suite run.

## Next command

Do not invent A6 numbers. If a catalog manual is added that publishes a torque or a pin length, show that value with the manual's title and revision and no other number. For A7, open SCTE 293-11, 293-13 and 270 before any funneling formula is registered.
