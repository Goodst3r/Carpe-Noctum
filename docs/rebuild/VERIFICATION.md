# Build 6 review-fix verification — 2026-11-15

Reviewed baseline:4b660c493010fa9f3a1eb64e6979aace863a4bfb (Claude's blocked review). This record supersedes the build5 verification, retained under releases/build5/.

## Frozen artifacts

- App2.0 Alpha build6; PWA `db40433f7669e922a0a9`.
- Standalone SHA-256 `bad9f83ca6180dc8f34d67291572e940493abc0f452fb9cfb3bf6a587910088e`.
- Unsigned Preview APK SHA-256 `62feb5654f57ef3a05fb642883036fcbde0588343b3a5be1d3c7fdc41d96d5ab` (76,225,940 bytes).
- Package `com.spencerwilliams.nightsweep.preview`, code30, min26/target35.
- Embedded HTML byte parity and all5 ONNX graph hashes verified.

## Checks executed on revised source

| Check | Result |
|---|---|
| npm test |152 total;149 passed;3 opt-in data/model skips;0 failed |
| npm run build |Standalone and26-file PWA generated |
| npm run test:browser |36/36 passed, including98-point ONX, map layout/export, two-endpoint connection dialog/cancel, widths360/768/1280 and offline persistence |
| npm run test:ai-browser |13/13 passed, actual Tiny worker inference/offline reload, no external inference/image request |
| Supplied-PDF replay suite, environment paths only |14/14 passed |
| Actual supplied98-point ONX + supplied updated map, controlled test connection |76active/84EOL identities;2tombstones; max18rows; layout7.63ms; two original-source exports79.64ms; duplicate-free/source unchanged |
| Real Android SDK35/ECJ/D8/aapt2 compile |Passed, alignment/package/code30/provider authority checked |
| Native production policy/callback checks within npm test |3/3 Java/ECJ tests passed |

H1 was reproduced before changes:98-point layout exceeded55seconds and was terminated. The equivalent fixed synthetic case took6.35ms (18rows);1,000points took1.22ms in the focused probe. Performance assertions use a generous2second bound and cap text size; these desktop timings are observations, not phone guarantees. The private-map integrated probe uses controlled synthetic connections, not an assertion of real plant topology.

## Test-count reconciliation (L6)

Build5 local run:130total/127pass/3skip. Claude:130total/125pass/5skip. The additional2skips were native helper tests requiring the separately provisioned ECJ/Java toolchain. No test failed. Build6 has3native checks, so an environment without ECJ may report6skips instead of3. All environments must report their own counts. Set CARPE_ECJ/JAVA or JAVA_HOME to use a private external toolchain; private PDF/model checks remain explicitly opt-in.

## Review disposition and limits

REVIEW_RESPONSE.md maps H1, M1–M3 and L1–L6 to changes and evidence. Claude has not re-reviewed the revised source; approval is not claimed. The initial external review remains blocked until the reviewer accepts the fixes.

The APK is unsigned and non-installable. No signing key was accessed/replaced. Native prompt callback tests and compilation do not establish Android keyboard/dialog/lifecycle/picker UX. A signed original-key phone/emulator pass is requested in DEVICE_CHECK.md. iOS Safari and field RF acceptance remain unverified.

Manufacturer gain/tilt estimates, unavailable1GHz inverse loss curves and unknown output headroom remain declared. Meter compensation export semantics are operator-declared when the setting is nonzero; the VIAVI FAQ confirms template settings but does not define exported Absolute-array compensation. Missing/out-of-band values stay unknown. Heavy AI adapters remain experimental and unexecuted; this patch does not change their models.

Private supplied files are packaged locally under ignored artifacts/private-review/ for handoff, not committed/published. The original model-engine four-pack9/9 inference evidence remains in the build5 record; the revised worker/UI integration ran13checks above.
