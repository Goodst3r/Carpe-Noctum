# A4 render-local context scratch characterization

Base: `fe245887d30da3b8fa3e01fa721e31a47a3bba9c`; only the pinned grading UI is altered in scratch. Candidate SHA-256: `4886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215`. Patch applies cleanly to the pinned source in a temporary directory and yields that exact candidate. No active repository file/index/HEAD change.

Executed:
```sh
node /tmp/carpe-a4-render-context-optimization-regression.cjs
python3 /tmp/carpe-a4-render-context-optimization-browser.py
node /tmp/carpe-a4-render-context-optimization-timings.cjs
git -C /tmp/carpe-a4-render-context-apply apply --check /tmp/carpe-a4-render-context-optimization.patch
git -C /tmp/carpe-a4-render-context-apply apply /tmp/carpe-a4-render-context-optimization.patch
cmp -s /tmp/carpe-a4-render-context-apply/night-sweep/sweep-grading-ui.js /tmp/carpe-a4-render-context-optimization-candidate.js
```

**63 Node cases passed**, using exact component functions with scratch-only helpers and explicit synthetic EvidenceUI service fixture. No functional grade/original-byte verification claim is taken from that fixture. Cases cover immutable HTML/state/cache, exact call counts, all requested mutation/restoration/API/current/legacy states and both async guard barriers. The complete case list is in `...-characterization.json`.

**22 actual browser cases passed** (11 scenarios × 320/390 px). This uses full pinned standalone HTML, real input/file/SHA/Grade flow, deterministic clock/IDs, and a public boundRecords spy without production exports. Matching HTML/state plus no source-state changes/overflow/runtime/external requests were independently asserted. Raw per-case hashes/counts are in `...-browser.json`. This is desktop Chromium, not physical Safari/WebView/phone verification.

The production grade/signature/observer/init/export blocks are compared byte-for-byte in the Node script. Threshold/core/evidence/archive/Station source files are unmodified copies of pinned blobs. Shared raw context is render-local and each historical helper receives a shallow copy; public freshness remains one-argument and recomputes directly. Missing/unavailable sources preserve early return/laziness, missing digest stays unknown, and source history is never rewritten.

Proposed repository regression: `/tmp/carpe-a4-render-context-optimization-public-regression.cjs`, to insert into the existing UI suite after readable-CSV setup. It uses only the existing real public app APIs/fixtures and public StationView.boundRecords spy, no timing assertions. It is an integration suggestion, not yet an executed repository test. Expected baseline failure is the exact 100-vs-1 bound-call assertion; concrete browser comparisons have directly observed those counts on the old/new sources.

Timing uses one warmup/five alternating paired Node VM render-string calls. New concrete medians: one-history control 0.642 → 0.740 ms (no claimed gain); 50 rows per route/forward/return + 100 histories 215.296 → 5.753 ms; 200 per route/log + 100 histories 870.146 → 14.493 ms. Raw contexts are 27,002 / 126,834 / 502,411 bytes. These exclude browser DOM parse/layout, may include concurrent root-gate load and support no phone latency guarantee. No timing assertion gates correctness.

Full audit, already-implemented optimization provenance, retained caps/invalidation requirements and deferred eager-preview findings: `/tmp/carpe-required-core-optimization-followup.md`. Root authorization, author integration, new scoped independent review and final full gate remain pending.
