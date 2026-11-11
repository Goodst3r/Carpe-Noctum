# NightSweep 1.8 Alpha build 2 — frontend performance audit

Date: November 11, 2026. Work was confined to the build 2 workspace. The earlier 1.8 workspace remains frozen.

## Measured problem and changes

The prior route editor recalculated the complete sweep grid while that chart was hidden. A single refresh also recalculated the same low/high, meter and point-tool frequencies repeatedly. Nested full-render hooks repeatedly traversed the route to reapply the same task visibility. A 200-point cable-only stress route made 603 external RF run calls during one hidden-chart refresh.

`workflow.js` now reuses each frequency's result during one synchronous render/refresh, after the existing meter test-point correction wrapper. The cache is discarded in `finally`; it is not retained across input events, job imports or exceptions. Hidden sweep-grid redraws are deferred during other-task refreshes. Opening Sweep, explicit chart drawing and print preparation calculate the current data. Full-render visibility updates are applied after the nested render finishes. Disconnected-feed checking uses an incremental set of earlier outputs, preserving the existing rule that later/missing parents remain disconnected.

The mobile cascade's apparent blank area was a layout issue: branches outside the horizontal viewport determined the entire diagram's height. The complete example used about 691 pixels before the point editor, including much empty space on its visible left side. The diagram now has a 320-pixel mobile / 420-pixel larger-screen maximum height, while retaining horizontal and vertical scrolling. It is a labelled keyboard-focusable region, with a visible scrolling instruction and no print height constraint. Every complete-example point remains reachable by its diagram button.

`app.js` also now enforces the existing 20 MiB project-file limit at the shared text import entry, before parsing or changing state. This closes the public JSON API path that previously bypassed the picker-only file-size check. The bound measures UTF-8 bytes, accepts exactly 20 MiB and rejects non-text input clearly. Export filenames and the workflow's visible identity use `1.8 Alpha build 2`; schema version 1 is unchanged.

## Before/after observations

Chromium 156.0.8078.79, headless desktop engine, 390×844 mobile viewport. Five synchronous refresh samples per synthetic scenario; medians below. Instrumented call counts were collected separately from these timing samples.

| Synthetic scenario | Prior median refresh | Build 2 median refresh | Reduction | External RF run calls per refresh |
| --- | ---: | ---: | ---: | ---: |
| Complete GS7K/GaN example, 9 route points | 33.5 ms | 6.7 ms | 80.0% | 262 → 7 |
| 100-point cable route | 125.5 ms | 33.5 ms | 73.3% | 403 → 7 |
| 200-point cable route | 242.5 ms | 80.5 ms | 66.8% | 603 → 7 |

One full-render sample per scenario decreased from 88.8 to 41.3 ms, 382.0 to 148.4 ms and 815.6 to 508.7 ms respectively. These samples are reported separately rather than treated as a median. The complete-example cascade's rendered height decreased from 690.8 to 320 pixels; the full scrollable content remains available.

The benchmark replayed a frozen baseline HTML and replaced only `app.js`, `workflow.js` and `style.css` for the frontend comparison. Other agents' core/storage changes were intentionally held out of this comparison. Whole working-state and low/high RF/power result hashes matched exactly in all three scenarios. Raw samples, function timings, layout dimensions and hashes are in `performance-baseline.json`, `performance-candidate.json` and `performance-audit.json`. This is a local observation, not a physical-phone benchmark or a guaranteed speedup on every device. Visible Sweep still calculates its complete grid; no RF sample density or precision was reduced.

Reproduce without building public artifacts:

```sh
python3 research/build2/profile_frontend.py --phase baseline --sizes 9,100,200 --samples 5
python3 research/build2/profile_frontend.py --phase candidate --sizes 9,100,200 --samples 5
```

The first baseline is retained rather than overwritten by later source edits. Candidate HTML and screenshots are confined to `research/build2/`.

## Executed regression checks

- `node qa/build2-frontend.test.cjs`: **10 checks passed**. Covers lazy chart refresh, repeated-frequency reuse, actual gain edits, test-point correction, job replacement, Sweep navigation, print, interrupted calculations, disconnected feeds, oversized UTF-8 import rejection without data changes, exact-limit acceptance and non-text rejection. The initial pre-fix run failed because the hidden chart recalculated its grid; see `frontend-red.log` and `frontend-green.log`.
- `python3 qa/build2-layout.test.py`: **55 rendered Chromium checks passed** at 360/390/768/1280 px. Covers constrained diagram height, labelled focus, all nine route-point buttons, keyboard scrolling, page overflow, print constraints and uncaught errors. See `layout-validation.json` and `layout-green.log`.
- Existing UI suites run against current source in memory using `node --require ./research/build2/source-loader.cjs <suite>`: render stability 3, alpha 1.4 UI 36, workflow UI 22, DOM 38, field-flow 32, browser files 23, complete/focused training 41, training controls 10 and training library 11: **216 checks across nine suites passed**. This includes the seven exercises and feature-control navigation; historical fixtures were not changed.
- Syntax checks passed for changed JavaScript, the new JavaScript suite, the Python layout suite and profiling script.

The source-only loader substitutes current assembled source for reads of the stale standalone build in memory. It does not change `outputs/` or `dist/`. The root release workflow still runs the complete suite against the final generated artifacts after the shared source is frozen; these scoped results are not a replacement for that release evidence.

## References and limits

Context7 retrieved MDN documentation for constrained overflow/scroll containers, flex minimum sizes and MutationObserver subtree notifications. Actual outputs are retained in `frontend-context7.json`. The existing Figma field-control reference in `research/alpha18/figma-review.json` was reused: controls retain their existing size and arrangement; this repair adds no new screen or design system.

No private job/evidence data was used. No framework migration, dependency upgrade, telemetry, public deployment or upstream change was introduced. Physical Android/iPhone/Safari/WebView behavior, actual device storage exhaustion and print pagination remain separate checks. The Android team owns actual APK build/signing evidence.
