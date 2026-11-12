# A4 ZIP integrity optimization

User requested a performance review while peer review was pending. Baseline edacc52e19aa0e57b3232b56f3a10312a02999fb; frozen source b86382186c3179bd1037cf20a63a722e777711dc.

The private CRC32 routine now creates one lazy 256-entry/1 KiB table and uses one lookup per byte instead of eight bit iterations. Every ZIP member still undergoes its original bounds, decompression, size and CRC checks. Original SHA verification, input caps, native schema/units/direction, raw samples, grading and state format are unchanged. No persistent result cache or runtime dependency was added.

Authored changes: evidence-archive.js, two native-pipeline characterization checks, deterministic Python fixture generation and forward-all-bytes.zip; generated standalone/PWA rebuilt. The old and new algorithms both passed the new characterization before/after; no functional RED or timing-gated unit test is claimed for a behavior-preserving change.

Final production-source benchmark, desktop Chromium 156, 21 alternating paired warm measurements, valid synthetic 10,000-sample JSON at the unchanged 2 MiB decoded cap: stored ZIP 78.2→15.3ms (5.11×); deflated 84.3→21.4ms (3.94×). Small ZIPs were below useful browser timer resolution; no typical-file or physical-phone speed claim. Node 31-round stored 70.382→11.799ms. The separately reviewed performance report distinguishes parsing from importing/rendering and simulated CPU throttle from physical hardware.

Fresh independent review found no introduced findings: native 69; 545 Python zlib vectors / 3,270 exact comparisons; 99 valid ZIP parses; 214 corrupt nonselected-member rejections;lazy/private allocation and generated-worker hash checks. These are distinct from the implementation agent's 273 vectors / 18 pipeline cases and 23 synthetic actual-file-picker/portable-restore checks.

The coordinator separately refreshed the private actual-input browser proof at b863821: both originals, every raw sample pair, byte-exact compressed containers after portable export/identity-remapped restore/re-export, no automatic grade, 390 px and all non-loopback requests blocked. Only sanitized booleans are recorded publicly; source files and real identifiers/readings/checksums remain private.

Full final gate/standalone hash are recorded in codex-a4-validation.json after the exact frozen run. Internal review does not replace Lane B review or authorize self-merge. Existing two native-parser Minor findings remain unchanged.

A separate audit found that 30 closed 10,000-sample preview cards still build 4.59 MB of markup (~142.9 ms desktop). Deferred preview rendering needs separate open-state/toggle/print review; it was not included in this narrowly verified CRC change. No emulator, phone, Safari/WebView, meter/RF or field claim; no APK/signing/version/deployment change.

Final exact-source full gate: **67 suites / 1,366 checks**, 331.1 s, all exits 0; separate layout 141 / smoke 331. All 120 pre/post hashes matched; worktree unchanged and clean, README pair identical. The implementation agent executed these commands; the coordinator separately executed the private-file proof and verified the raw receipt binding. See [current validation receipt](../lanes/codex-a4-validation.json), [independent scoped review](codex-crc-optimization-review.md) and [implementation/benchmark method](codex-crc-optimization-implementation.md). Standalone SHA-256: b2350678a22cbb3843fb515d26a4871f22893923fe9baf08d0962fab0677b393.
