# Preserved independent B2 coauthor checks

These are the public synthetic checks behind `../chatgpt-b2-coauthor-review.md`.
They supplement the author and do **not** replace Grok's required independent
derivation/review, a full author gate, hosted QA or physical-device acceptance.

From any directory, point the runner at an existing app checkout. For the
reviewed corrected head:

```sh
python3 /path/to/report-checkout/handoff_docs/reviews/chatgpt-b2-checks/run.py \
  /path/to/app-checkout \
  --expected-head f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab \
  --chromium /usr/bin/chromium
```

Use an existing Python Playwright, Node, Chromium and the app's locked QA
dependencies (`qa/runtime/node_modules/jsdom`). The runner installs nothing and
does not build, reset, commit, write app evidence or invoke a generic gate.
`NIGHTSWEEP_CHROMIUM` or a Chromium on PATH may be used instead of `--chromium`.

By default all scripts and data are copied to a fresh system temporary directory.
References, result JSON, logs, the optional screenshot and `run-receipt.json` stay
there; its path is printed. To select the destination, use `--output-dir` with an
empty directory **outside both app and report worktrees**. The runner verifies
before/after heads and worktree status. It refuses a dirty app checkout or raw
H/HX/HR inputs that differ from the frozen reviewed cases. It does not make a
future head approved merely because `--expected-head` is omitted.

The same assertions and numerical bounds from the scratch review are preserved:

| Check | Count | Scope |
| --- | ---: | --- |
| `validate_results.py` | 660 | All 34 H/HX/HR IDs and 16 existing reviewer probes against real source, standalone and PWA functions; strict decimal-reference comparisons for shared cases, semantic refusals, bounds, aliases and sign |
| `native_ui.py` | 153 | Actual standalone/PWA Chromium at 320/430 px, keyboard badInput, six-figure text, Unknown/context behavior, tags, downstream/Safety and genuine Study caller |
| `length_boundary.cjs` | 84 | 50/51/128-character converter level/both widths, existing upstream50/51 behavior, retained parsing/context/numeric guards and actual Unknown source dialog in all three artifacts |

The two additional `65±1e-10` cancellation probes retain the original documented
binary-input presentation scope; this does not relax the shared H/HX references
or unrounded bounds. The original 58fffd3 finding and corrected f54d5c2 closure
remain in the report. The new wrapper changes only root/output/dependency-path
plumbing; numerical assertions, raw cases and independent expected values are
unchanged. `provenance.json` records the frozen data hashes and expected counts.

`independent_reference.py` reads only the preserved raw inputs, uses 200-digit
Decimal arithmetic and regenerates the exact frozen references. `real_functions.cjs`
forwards those inputs to the actual selected app functions. It does not implement
a physical validator or replace the app's formulas. The runner checks that the
regenerated reference hash is identical before accepting the run.

Historical scratch runs and the later portable verification are identified
separately in the report. No source-freshness, complete-gate, emulator, APK,
phone, Safari/WebView, modem or field claim is supplied by these checks.
