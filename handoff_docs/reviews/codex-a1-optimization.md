# A1 Station lookup optimization

User requested a performance review while peer review was pending. Baseline 4aab13616e9c7ba08cc4f14987cff093c6dcf129; frozen source 603060788493df1752da37a396507e430cacde40.

StationView.targets() now builds a local first-wins catalog-ID Map for that call and reuses it for source-active/route lookups. The Map is discarded after the call: catalog edits/replacement, restores and owner changes are read afresh. Duplicate active/inactive/retired IDs retain the previous first-match semantics. Math, targets, references, bindings, state shape, selection and layout are unchanged. No persistent cache was added.

Authored changes: station.js plus three public-API review regressions; standalone/PWA rebuilt. The deterministic work-budget regression failed before production editing: 100/200 valid rows read 48,379 / 96,279 catalog IDs against budgets 2,468 / 2,868. The optimized public calls read 1,133 / 1,233, while preserving the full target key/model sequence. No timing assertion or source-text test is used.

Final production-build timing, desktop Chromium 156 at 390×844, seven alternating paired rounds / 217 samples per action: 200-active-row input medians 6.7→4.3ms forward, 6.7→4.0ms return, 6.8→3.9ms return text (36–43% reduction). The nine-row run measured 0–0.2ms extra input cost (1.2→1.2,1.0→1.1/1.2); no universal or physical-device speedup is claimed. Deterministic ID-read savings 97.7–98.7% are not elapsed-time percentages.

Fresh scoped review found no introduced findings. Own reviewer source/frozen 11-test runs, Station 22 and 22 complete browser output comparisons passed with no normalized fields or page errors. Saved Before/After, independent done dates, first-match behavior, catalog replacement, physical binding changes, 100/200 rows and raw saved owner data remain equal. The original seven Lane B requested corrections remain intact; its nonblocking list remains recorded.

Full final gate/hash are recorded in codex-a1-validation.json after the exact frozen run. Internal approval does not replace Lane B peer review or permit self-merge. No emulator, physical phone, Safari/WebView, RF hardware or field check; no APK/signing/version/storage/schema/deployment change.

Final exact-source gate: **66 suites / 1,276 checks**, 361.7 seconds, all exits 0; separate layout 141 / smoke 331. Source/build manifests and index/worktree stayed unchanged and clean, with identical main READMEs. The implementation agent ran the full gate; independent scoped review is separately attributed. [Exact receipt](../lanes/codex-a1-validation.json), [scoped review](codex-station-optimization-review.md), [full benchmark method](codex-station-optimization-implementation.md). Standalone SHA-256: 28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15.
