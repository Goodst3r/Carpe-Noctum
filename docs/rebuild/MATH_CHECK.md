# Independent math check

The connected Wolfram Language evaluator independently evaluated the following exact-rational vectors on 2026-11-15. The specifically tagged app `app-69fe0bf66c8481919c513d799406436e` reported `not_installed`; these results came from the available Wolfram connection instead.

| Calculation | Wolfram result |
|---|---|
| Test-point readings 11.4 / 23.3 plus 20 dB | 31.4 / 43.3 dBmV |
| Corrected levels minus 3.5 dB director | 27.9 / 39.8 dBmV |
| Low-split linear design at 405 MHz | 37 dBmV |
| High-split linear design at 1028 MHz | 41.5 dBmV |
| Gain required: target 43.3 minus input 10 | 33.3 dB |
| Input 10 plus available gain 31 | 41 dBmV |
| Remaining shortfall | 2.3 dB |
| HGD pilot 43.3 minus 34 | 9.3 dB raw AGC pad |
| LE pilot 43.3 minus 29 | 14.3 dB raw AGC pad |
| Synthetic minimax search: pre-control 37/41/45, target 31/38/43, EQ losses 4/2/1 or 7/3/1, pad 0 or 1 | EQ 4/2/1, pad 1, output 32/38/43, worst error 1, SSE 1 |

The app's 0.5 dB catalog rounds raw AGC requirements to 9.5 and 14.5 dB. Executable reference comparisons are in `tests/wolfram-math.test.mjs`; the test-point vector is in `tests/io.test.mjs`. The production solver additionally uses actual manufacturer curve fixtures tested in `tests/rf.test.mjs`.

This checks arithmetic and selected solver cases. It does not establish unmeasured amplifier transfer curves, maximum output capability, exact field part compatibility, or complete real-world RF accuracy. Those gaps remain visible in the route cards. AI suggestions do not participate in RF arithmetic.

## Source-table optimizer cross-check

A second Wolfram evaluation searched all21 supported1GHz cable EQ candidates and42 half-dB input pads (882 setups) over six source-table frequencies52/70/550/750/870/1002MHz. For the independently synthesized40dB reference-transfer fixture, it selected `forward-cable-1g/12` with4.5dB input pad and outputs31/32/39/43/44/46dBmV, worst error0 and SSE0. This exactly matches the production solver result in the source-cell synthesis test in `tests/rf.test.mjs`. The kernel performed its own exhaustive search; it did not call the app solver.
