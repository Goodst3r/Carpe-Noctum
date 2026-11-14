# Company-level verification item

Timestamp: 2026-11-14T18:35:12+00:00. Owner: Codex, sole app-code writer. Branch: `codex/next-company-levels`.

Freshly fetched `origin/build3`: `248e77802f333a1a461563dfb1973315a2043d67`. Organization item: `db25346dd1906b819dcdd8fcbe624215830e43d5`; ordinary merge checkpoint `fc924fd842beda2ed97daf75909794a723d548a6`. Existing PR55/P2 company implementation is preserved; it was not reimplemented or automatically applied to jobs.

Standalone SHA-256: `18463d3c3a2087eb6bd5afea4110527a64b60d18a58a2398ed6ff2daf5785686` (identical to the organization checkpoint). This is an item checkpoint, not the finished merge candidate. Its combined full gate and Claude review remain pending.

## Public references retained

| Reference | Basis and provenance |
| --- | --- |
| Low 42/54 node: 32@54  / 43@753 dBmV | `32+11*(f-54)/699`, inclusive 54–753 MHz. Spencer's selected node-anchor decision, revision CN-NEXT-20261113. Node output reference; no automatic amplifier target. |
| High 204/258 node:34@261  / 49@1215 dBmV | `34+15*(f-261)/954`, inclusive 261–1215 MHz. Spencer, AOI config v15,2026-04-23; user-transcribed. Original file unavailable; `fileVerified:false`, no fabricated hash. |
| Legacy31@54  / 43@860 | Preserved separate local design reference and old-job values; not rewritten to the new profile. |
| ReturnTX38 | Separate low-split transmitter reference, company span 11–42 MHz, basis unconfirmed. Not injection, receiver, PSD or composite-power target. Hardware lower edge remains 5 MHz. |

Registry provenance, units, conditions and source labels remain in `night-sweep/thresholds.js`; the pure evaluator is `night-sweep/company-targets.js`. No new numerical default, tolerance, pilot code, field, key, formula or automatic profile selection is added by this verification item. Unknown impedance, power/bandwidth basis, plane agreement and acceptance tolerance continue to block only their dependent comparisons. No default pass badge.

## Independent numerical evidence

Astra high was selected for the bounded read-only RF audit. The harness accepted the selection; no runtime model-identity introspection endpoint is exposed. Wolfram context returned a backend error on this follow-up, while the Wolfram Language evaluator succeeded. Python Fraction and 60-digit Decimal provided a second computation. Only public synthetic anchors were sent externally; no AOI file or private measurement was uploaded.

| f MHz | Exact target dBmV | Display |
| --- | --- | --- |
|105|7643/233|32.8|
|200|23974/699|34.3|
|300|8358/233|35.9|
|450|8908/233|38.2|
|550|27824/699|39.8|
|650|28924/699|41.4|
|303 high|1837/53|34.7|
|405 high|1922/53|36.3|
|555 high|2047/53|38.6|
|711 high|2177/53|41.1|

All ten literal cases agree within 1e-9 dB and the 0.1 dB display. Endpoints are exact 32/43 and 34/49, tilts 11/15 dB. The independent legacy linear target at753 MHz is16687/403, distinct from new 43. Six endpoint and twelve outside-domain mathematical classifications were also checked. These calculations verify the supplied formulas, not the original AOI transcription or measurement assumptions.

Fresh source-mode tests from the read-only audit: company-targets 17/17; registry 14/14; Wolfram RF 25 grouped checks  / 39 historical expectations, all exit 0. `NIGHTSWEEP_RELEASE_TEST=1 node qa/company-targets.test.cjs` subsequently passed all 17 tests on the exact standalone hash above (2026-11-14T18:35Z). These are affected checks, not a full gate or physical acceptance.

## Practice and guide

Use the existing Company node-output design reference in Route & sweep → Setup, explicitly choose the matching plant and Apply for a synthetic job. Compare the listed markers, then clear an independent amplifier target and confirm its margin remains unknown. Export/reopen and confirm old launch values are unchanged in a separate legacy fixture. Public guidance and this practice are in the current README company-target section, Functions guide and existing `NEXT_BUILD_P2_EVIDENCE.md`; no private raw config is included.

## Next

Wait for the requested Grok OEM/numeric evidence before the new shared physical-leg item. Keep the pending daily-retirement decision visible. Freeze the intended combined scope before one full gate and Claude's consolidated review. Spencer owns the original-key off-repo APK and real-phone test. No APK, emulator, phone, field acceptance or publication was performed.
