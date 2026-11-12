# Grok log book

Only Grok writes this file. Newest entry on top.

## November 12, 2026 · item 14 merge gate green; build3 moved again

Head `023653f` (merge of `a467418` and `304cb77`) local gate 2026-11-12T08:56:26Z–09:10:10Z was green: build 0, PWA 0, `qa/run-pwa.py` 0 (91 suites, 2302 checks, 791.5 s, all_passed true, build and worktree unchanged), layout 0 (1054), smoke 0 (373). Standalone `ac987a33f4008a62f8195599b0755219a6e5f7b46f44680ff1622b69461e3a8b`. Porcelain afterwards only `?? qa/runtime/node_modules`. Hosted CI [run 43187078965](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43187078965) passed. Record: `handoff_docs/reviews/grok-gate-023653f.md`.

Not merged. `origin/build3` moved to `6414668` during that run (pull request #26, roadmap docs, no app source). This commit merges that. The gate on this merge is not run yet.

The chat for this session still says A5, then A6, then A7. `handoff_docs/ROADMAP_PROMPTS.md` says not to start A5 to A7. This session follows the chat.

## November 12, 2026 · item 14 layout fix gated; build3 moved

Head `a467418` local gate 2026-11-12T08:40:23Z–08:54:09Z was green: build 0, PWA 0, `qa/run-pwa.py` 0 (91 suites, 2301 checks, 792.3 s, all_passed true, build and worktree unchanged), layout 0 (1054), smoke 0 (373). Standalone `96d6dde661d84da592f93766ecce077704289021590edcfc6b8bb933bdae9083`. Porcelain afterwards only `?? qa/runtime/node_modules`. Log `/tmp/grok-gate-a467418.log`. That head does not contain `origin/build3` `304cb77`, so it is not merged.

`origin/build3` moved to `304cb77` (pull request #25, Arcom detector name). This commit merges it. Generated HTML and the service worker are rebuilt from the merged source, not hand-merged. The gate on this merge is not run yet.

## November 12, 2026 · item 14 layout failed; first fix

Head `3c9d3a4` is not green. Local gate 2026-11-12T08:18:15Z–08:32:01Z: build 0, PWA 0, `qa/run-pwa.py` 0 (91 suites, 2301 checks, 807.7 s, all_passed true), layout 1, smoke 0 (373). Standalone `c48d3b7650f2dc1b456330e374ee3850e092a1e661bbf8ac74ef934fdc96dc00`. Porcelain afterwards only `?? qa/runtime/node_modules`. The wrapper shell exited 0; that does not make the gate green. Record: `handoff_docs/reviews/grok-gate-3c9d3a4.md`. Hosted CI [run 43181842081](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43181842081) failed on the same check.

The failing check was `night 320px Supply PM keeps the added span inside a focusable region`. A probe showed the chain text `5.5 V drop`, `tabIndex` 0 and `role` `region`, with the region `scrollWidth` 300 and `clientWidth` 240 because `.hs-table` has `min-width:300px`. This commit sets `#powerPmPanel .hs-table` to `min-width:0` and `table-layout:fixed`. A probe after the rebuild, not a full gate, fit both Supply PM regions at 320, 360 and 390 px. This is the first fix. The gate on this head is not run yet.

## November 12, 2026 · item 19 merged; item 14 started

Pull request #20 merged at 2026-11-12T08:00:06Z. Merge commit `7107f27481c6479e5ee2de087f008060bdbbd03d`. Head that was gated and reviewed: `f2641a2`. Local gate 90/2,297, 802.7 s, layout 1004, smoke 370, standalone `d4b05c39…a9d6`. Hosted CI [run 43176666435](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43176666435). AUDIT says clean, ready to merge, and that it is not a second lane. Record of that gate: `handoff_docs/reviews/grok-gate-f2641a2.md`, added on this branch after the merge so `f2641a2` did not move.

This branch is `grok/a5-power-pm`. Item 14 adds Power → Supply PM. Span drop is current times the catalog loop resistance, with the same temperature factor as Power → Load. The coefficient is typed; 0.004 is not filled in. The comparison uses the active’s published minimum from the catalog. No company minimum, battery window or inverter limit is invented. The notebook uses a new storage key, `nightsweep-power-pm-v1`, and is not in the job. SCTE 238 was not read. Guide totals intended here: 36 screens, 54 features, custom curves 22. The gate on this head is not run yet.

The merged prompts file says the next work after #20 is #25, then #26, then NAV-1. The chat for this session says A5, then A6, then A7, and to ignore #25. This session follows the chat.

## November 12, 2026 · item 20 merged; item 19 merge started

Pull request #19 merged at 2026-11-12T07:27:18Z. Merge commit `6d684b681985b4c64053db7bd34ea8a81469bc25`. Head that was gated and reviewed: `b78868b`. Local gate 89/2,289, 787.4 s, layout 944, smoke 367, standalone `9a9da29f…9081`. Hosted CI [run 43173621524](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43173621524). AUDIT says clean, ready to merge, and that it is not a second lane. Record of that gate: `handoff_docs/reviews/grok-gate-b78868b.md`, added on this branch after the merge so `b78868b` did not move.

This commit merges `origin/build3` into `claude/b19-study`. Guide totals intended here: 35 screens, 53 features, custom curves 21. Counted from the built app: 35 screens, 53 features, custom curves 21, 142 registry rows (study mode adds none), 47 module splice lines. Focused checks before the commit, all exit 0: `qa/sweep-grading-ui.test.cjs` 56, `qa/build3-study.test.cjs` 8 / 336 comparisons, `qa/ui-names.test.cjs` 6, `qa/build3-pop.test.cjs` 6 / 145. The gate on this head is not run yet. Pull request #20's base is still `claude/b20-pop` until it is retargeted to `build3`.

## November 12, 2026 · item 18 merged; item 20 merge started

Pull request #18 merged at 2026-11-12T07:09:47Z. Merge commit `cb3c3b20dd90dcaedd9294eceaf77c8b1f844781`. Head that was gated and reviewed: `7d18b9a`. Local gate 88/2,283, 781.8 s, layout 854, smoke 364, standalone `544a87e4…afc2`. Hosted CI [run 43171499570](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43171499570). AUDIT says clean, ready to merge, and that it is not a second lane. Record of that gate: `handoff_docs/reviews/grok-gate-7d18b9a.md`, added on this branch after the merge so `7d18b9a` did not move.

This commit merges `origin/build3` into `claude/b20-pop`. Guide totals intended here: 34 screens, 52 features, custom curves 20. Lane A's remaining Minor on `research/build3/POP_SOURCES.md` (review 5867867045): the amplifier and NCTA provisions are attributed to the source dialog and registry, not the main card. The constant-noise condition stays on the card and the registry row. The gate on this head is not run yet.

## November 12, 2026 · item 17 merged; item 18 merge started

Pull request #16 merged at 2026-11-12T06:47:18Z. Merge commit `b4cb832d2bdcf18a81d855f1a7acae6699ac8015`. Head that was gated and reviewed: `0436e9a`. Local gate 87/2,276, 745.4 s, layout 784, smoke 361, standalone `0bd53b6a…e725`. Hosted CI [run 43168983876](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43168983876). AUDIT says clean, ready to merge, and that it is not a second lane. Record of that gate: `handoff_docs/reviews/grok-gate-0436e9a.md`, added on this branch after the merge so `0436e9a` did not move.

This commit merges `origin/build3` into `claude/b18-why-cards`. Guide totals intended here: 33 screens, 51 features, custom curves 19. Counted from the built app before this commit: 33 screens, 51 features, custom curves 19, 128 registry rows in the running app (125 in `thresholds.js` alone plus 3 evidence-archive guards), 45 module splice lines plus the DSIM insertion. Focused checks before the commit, all exit 0: `qa/sweep-grading-ui.test.cjs` 56, `qa/build3-why-cards.test.cjs` 7 / 22 comparisons, `qa/ui-names.test.cjs` 6, `qa/build3-highsplit.test.cjs` 7 / 41, `qa/build3-registry.test.cjs` 14. The gate on this head is not run yet.

## November 12, 2026 · item 15 merged; item 17 merge started

Pull request #15 merged at 2026-11-12T06:28:56Z. Merge commit `9df485720d0e13192364be4cf8e3255b36b4bbbf`. Head that was gated and reviewed: `b2d6f91`. Local gate 86/2,269, 739.4 s, layout 714, smoke 358, standalone `44801b66…fa62`. Hosted CI [run 43166448499](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43166448499). AUDIT says clean, ready to merge, and that it is not a second lane. Record of that gate: `handoff_docs/reviews/grok-gate-b2d6f91.md`, added on this branch after the merge so `b2d6f91` did not move.

This commit merges `origin/build3` into `claude/b17-highsplit`. Guide totals intended here: 32 screens, 50 features, custom curves 18. The gate on this head is not run yet.

## November 12, 2026 · own gate on fiber record `e9e0473` is green


Docs-only child of `5b33079`. Same Chromium and `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Clock 2026-11-12T05:58:26Z–06:11:03Z. Log `/tmp/grok-gate-e9e0473.log`.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0; only `?? qa/runtime/node_modules` |

**86/2,269, 729.7 s, layout 714, smoke 358.** Standalone SHA-256 still `44801b66e935fedd578e692fd4072f33fbc16c9f5c278a64d03925141b33fa62`. Record: `handoff_docs/reviews/grok-gate-e9e0473.md`. Hosted CI on `e9e0473` was in progress at the time of this commit: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43164896007.

Also written into `KNOWN_GAPS.md`: the fiber real-browser check compares the box-plus-message span with the viewport height. Lane A review 5867997446 already called that nonblocking. No product change.

This commit adds that record and the gap line. It is not the gated head. AUDIT and the merge wait until this new head is gated and hosted CI on it is green.

## November 12, 2026 · own gate on fiber `5b33079` is green


Merged `origin/build3` (`e7313cf`, which already contains merged #24 and merged #13) into `claude/b15-fiber`. No source conflict. Guide conflicts were resolved by keeping item 15 on top of item 11: **31 screens, 49 features, custom curves 17**. Counted from source before the commit: `thresholds.js` 118 rows alone, 121 with the three evidence-archive guards, six of them `fiber.*`; `build.py` 43 module lines. Rendered the main README, Functions, Training Coverage and the installation guide with `marked` 18.2.0, then `python3 night-sweep/build.py` and `python3 build-pwa.py`. Merge commit `5b33079981bac37e793c38b7abbb070a7d960e39`. PWA content id `ebe9b831091a7c85b587`.

Focused checks before the gate, all exit 0: `qa/sweep-grading-ui.test.cjs` 56, `qa/build3-fiber.test.cjs` 9 / 132 comparisons, `qa/build3-impairments.test.cjs` 14 / 1940, `qa/ui-names.test.cjs` 6, `qa/build3-registry.test.cjs` 14.

Full gate on that exact head, 2026-11-12T05:44:27Z–05:57:12Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Log `/tmp/grok-gate-5b33079.log`.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 0 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0; only `?? qa/runtime/node_modules` |

**86/2,269, 736.7 s, layout 714, smoke 358.** Standalone SHA-256 `44801b66e935fedd578e692fd4072f33fbc16c9f5c278a64d03925141b33fa62`. Record: `handoff_docs/reviews/grok-gate-5b33079.md`. Hosted CI on `5b33079`: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43163371615. The smoke log printed a `ConnectionResetError` after a client closed a socket. The suite still exited 0 with 358 passed.

This commit adds that record. It is not the gated head. AUDIT and the merge wait until this new head is gated and hosted CI on it is green.

Not run: an APK, an emulator, a phone, Safari, WebView, a screen reader, a meter, or a field check.

## November 12, 2026 · close-out merged


Pull request #24 merged at 2026-11-12T05:19:08Z. Merge commit `6a28951122e2197211d569150b6d9f721df31f43`. Head that was gated and reviewed: `aadb612`. Local gate 82/2,174, 698.1 s, layout 554, smoke 352, clean, standalone `b1591b4d…e4de`. Hosted CI [run 43159076654](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43159076654). AUDIT comment says clean, ready to merge, and that it is not a second lane. **D3: one run (Grok).**

Merged `origin/build3` into `claude/b11-impairments` after that (merge commit on this branch). No conflict. The item 11 guide fix was already committed locally as `40ff2c5`.
