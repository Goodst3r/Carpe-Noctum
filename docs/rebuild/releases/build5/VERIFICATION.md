# Fresh candidate verification — 2026-11-15

This is the current verification record. Earlier snapshots in tool-checks.md are historical and are superseded by this record.

## Frozen artifacts

- App: 2.0 Alpha build 5; PWA `0435280d7ff18732da03`.
- Standalone HTML SHA-256: `998b5354a8c11a6d13a55bdd299973bb09418d80ee7dcedf8ade724fd75ecb26`.
- Unsigned Preview APK SHA-256: `cce71e9abaf7575963720e69d0bdeb1f060a53c0055c3f907c1b28e9475e8346` (76,221,250 bytes).
- APK package `com.spencerwilliams.nightsweep.preview`, version code29, min26/target35.
- Embedded HTML equals the frozen standalone; all5 ONNX graphs in the4 included packs matched manifest SHA-256 hashes.

## Executed checks

| Command/check | Result |
|---|---|
| npm test |130 total;127 passed;3 opt-in data/model tests skipped;0 failed |
| Private supplied-PDF replay, maps suite with local environment paths |13/13 passed |
| CARPE_AI_MODEL_DIR=verified-cache node --test tests/ai-engine.test.mjs |9/9 passed, including actual OCR/orientation/unwarp/table graphs |
| npm run build |Standalone and26-file PWA built |
| npm run test:browser |33/33 assertions passed |
| npm run test:ai-browser |13/13 assertions passed; actual worker OCR, offline reload/inference, no external image/inference requests |
| Java/ECJ production policy helper tests |2/2 passed in npm test |
| Real Android SDK35 / ECJ / D8 / aapt2 compile |Passed, zip alignment and package/version/provider authority verified |
| Wolfram evaluator reference vectors |Matched test-point correction, midpoint, gain/shortfall, AGC and synthetic minimax arithmetic; see MATH_CHECK.md |

Private PDFs and ONX were read locally and are excluded from Git. The supplied ONX ZIP has98 absolute samples57–753 MHz. Its0 dB recorded compensation plus the user's physical20 dB test-point offset gives31.4/43.3 dBmV. The node-port replacement path was exercised with that input. Tests use synthetic equivalents by default.

Updated-map import finds76 active and84 EOL identities; walkout finds50/78 schedule identities. The walkout's individual symbol identities are not reliably legible, so128 remain for manual placement/binding. Geometry and ports are provisional until confirmed. Full private-map export experiments confirmed same-page placement, source preservation and no repeated-label duplication; synthetic executable coverage additionally checks rotations/crop/UserUnit coordinates and grouping.

## Independent review and remaining limits

Codex models Sol, Astra, Terra, GPT6Sol and Luna were used for bounded implementation/review/check tasks. An independent final Codex review found a blank sample becoming zero; the shared strict parser and executable UI regressions now reject it. A final map-OCR cleanup check also verifies worker termination releases pending inference. Claude has not reviewed this candidate; CLAUDE_REVIEW.md is the review handoff. Grok was excluded.

The exact math app tagged by the user reported not installed. The connected Wolfram evaluator supplied the independent results instead. Firecrawl and original manufacturer references, Octen, Hugging Face metadata/public model cards and Context7 were used where available. Plugin availability is not accuracy validation.

This APK is unsigned, non-installable and not tested on a phone or emulator. No original signing key was accessed or replaced. Android WebView interception and picker UX need device testing. Desktop browser checks do not establish iOS Safari support or RF field acceptance. Amplifier gain shaping remains a labeled estimate where only gain/tilt specifications exist; maximum output headroom is unknown. Out-of-band or missing measurements remain blank. Digicomm's anomalous16.5 dB EQ row is quarantined.

Tiny OCR, orientation, UVDoc and table structure ran on synthetic desktop fixtures. PP-DocLayoutV3 and Florence adapters are experimental; large weights and real inference were not tested. No model has been accepted for unattended HFC topology or meter-level interpretation. AI outputs require review and cannot change numerical route state.

The final AI bundle uses a Florence-only pinned SDK entry, omitting the unused global model registry. This removed a confirmed GitHub scanner false positive on an unused32-character model class name; no push-protection bypass was requested. The minimal Florence session-selection regression passes, but full heavy-model inference remains unverified.
