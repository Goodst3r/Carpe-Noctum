# Next-build P1 evidence and review handoff

This is an intermediate performance candidate, not the completed next release. The implementation starts from `6cc964bb3759021cf74905820833a265459bbcb5`, which includes the PR 51 offline-guide repair. The original build3 baseline was `248e77802f333a1a461563dfb1973315a2043d67`; its exact-head [CI run](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43362549486/job/131679245998) passed. The repair's [CI run](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43371053509) passed. An interrupted local baseline run is not treated as evidence.

## Changes and review points

- Evidence headings render without creating closed preview charts or tables. Opening a preview materializes the current job's data; an open preview survives a redraw, while a job change does not carry it over. Print preparation materializes previews. Original evidence bytes and saved-job format are unchanged by this work.
- Sweep Due saves text on input and immediately validates it; the old list and counts are hidden and marked stale until change, Enter, refresh, or resume commits the draft. A committed draft does not get redundantly committed on blur, which preserves keyboard pagination focus. Invalid and blank intervals do not become green reminders.
- No calculator, storage-format, storage-key, Android package, or signing-key changes are included. P2/P3 remain blocked pending Grok's independent source and math review. No deployment, signed APK, or physical-phone acceptance is claimed.

## Synthetic benchmark

Run `node qa/next-build-p1-benchmark.cjs` from the source tree. The same script was copied to an archived `6cc964b` source tree and run there first, then against the candidate, sequentially without concurrent test runs. The baseline versions of both edited source files were checked against `git show 6cc964b` by SHA-256. Fixtures are synthetic: 30 evidence files of 10,000 points each and 200 jobs / 8,000 stations. Ten samples per measurement; p50 is the median and p95 is nearest-rank (therefore the maximum of ten). These are jsdom timings, not phone latency guarantees.

| Measurement | Baseline p50 / p95 | Candidate p50 / p95 | Operation counts |
|---|---:|---:|---|
| Closed evidence render | 739.424 / 1097.466 ms | 13.307 / 32.752 ms | 30 / 30 trace paths and tables → 0 / 0 |
| Sweep Due per input | 33.209 / 49.561 ms | 0.806 / 7.495 ms | 10 typing snapshot scans → 0; candidate change commit scans once |

Environment: Linux 6.18.57 x86_64, Node 24.22.1, jsdom 26.1.0, Python 3.12.14, Chromium 156.0.8078.79. Benchmark script SHA-256 `df9116c9a0c6796f462fc795f3d59530897f0f148467b2f11e46deb0a1bc70cd`.

## Candidate verification

Built with `python3 night-sweep/build.py` and `python3 build-pwa.py` (both exit 0). Standalone HTML SHA-256 `f1ca2b4e74fd68d0b478a7d73832def6ec940a3e4f674b230c3e99d394cfc7f1`; generated PWA version `f4f56e89fb7e723992e0`.

- Affected Node suites all exited 0: evidence UI 30, evidence context 8, Sweep Due 39, performance guards 6 checks / 34 comparisons, evidence core 52, evidence storage failures 13, native evidence 69, and Sweep Due/grading integration 3. Native ONX decoding is not validated by the synthetic evidence core fixtures.
- Chromium phone-width suites exited 0: Sweep Due 205 and evidence/grading 100 checks at 320, 360, 390 and 430 px, with no reported page errors. They cover invalid input, Enter, saved drafts, resume, keyboard pagination, preview opening and original-byte export.
- The pagination regression test failed before the fix because a blur caused an extra snapshot scan and replaced the target button; it passes afterward. Existing new P1 tests were observed failing against the baseline by the previous writer: closed preview 1 path versus 0 and typing 3 scans versus 1. No final next-release gate has been run on a frozen whole release.

The independent internal reference preparation used Python Fraction/Decimal and a Wolfram evaluator to reproduce ten target values within `4.34e-13 dB`; it was Sol High, did not reopen OEM sources, and is not the required Grok review. High-minus-low output EQ tilt is loss-low minus loss-high, opposite attenuation tilt; old output plus old loss minus new loss. Source, basis and tolerance unknowns remain explicit.
