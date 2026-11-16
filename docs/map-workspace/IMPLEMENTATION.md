# Build 6 map workspace

Baseline: c70feee0f98bbcbf2f4cbe33d833257d9f878321, origin/codex/fresh-calculator-rebuild. main is historical build 2. Work stays on codex/build6-map-workspace.

Approved scope: map-first launch; full-page PDF workspace; stable pan/pinch/zoom and fit controls; explicit editing and selected-station sheet; bounded undo/redo; confirmed project symbol key; Scientific Atlanta Surge-Gap exact-part data; optional masked online scan with independent OpenAI/Gemini readings and cross-check, human-reviewed suggestions and connections.

Preserve build 6 fresh storage, native PDF parsing, local OCR, physical port confirmation, original PDF export and corrected RF/ONX math. No migration from old jobs. Public NCTI/SCTE descriptions inform terminology; enrolled course lessons were not accessed.

Implementation is split across available models at the user's explicit request. Terra: viewport. Sol 6.1: scan protocol/backend. Astra: privacy UI. Sol 6: narrow native transport. Luna: exact passive data. Primary agent: integration and verification.

Cleanup: after final checks, archive unique obsolete local work outside active workspace and remove old local worktrees/build directories. Keep Git history and published releases. Remote branch deletion has additional repository recovery requirements and is outside this local cleanup.

Verification ledger is appended with actual commands/results. No live provider calls, signed APK or physical-phone verification may be inferred from source/browser tests.

## Verification before independent review

- npm ci: passed. Bundled model download via Node fetch could not reach Hugging Face through this environment's network; downloaded the exact pinned public weights through the environment proxy with Python urllib, then the normal build verified byte counts and SHA-256. No private data was involved.
- Baseline npm test: 152 passed, 6 skipped, 0 failed (before all feature tests landed).
- Updated npm test: 172 passed, 6 skipped, 0 failed (178 total). Includes protocol/provider adapter tests, stale privacy result rejection, opaque mask preparation, geometry/pointer gestures, undo/redo, and Java source-launcher policy checks.
- npm run build: passed; built fresh app/PWA with checksummed local PDF/OCR/AI assets.
- Browser integration: map-first flow, focused editor, viewport zoom, privacy review gate, confirmed map placement, physical connection draft/cancel, tombstone movement, PDF round trip, responsive layout, saved originals and offline reload passed. Final rerun follows review fixes if needed.
- npm run test:ai-browser: actual bundled OCR on synthetic text and cached offline inference passed; no external inference requests.
- Private replay: both supplied examples imported as five-page PDFs at 390×844; masked preview contained opaque covers; no uncaught errors, external requests or horizontal overflow. Each map viewport had 415 px available after compacting mobile controls. Originals/screenshots remained outside Git.
- Native policy executes in Java source launcher. Full Android compilation, APK signing and physical device checks were not performed.

Decisions: use the latest source branch rather than historical main. Keep inherited SA reference values confined to their explicit 750 MHz point and mark manufacturer revalidation pending; do not infer curves or substitute Cisco parts. The publicly described NCTI/SCTE courses were not enrolled/accessed. Claude is unavailable in the exposed models/tools; a fresh Astra review is requested and must not be represented as a Claude review. Do not merge/deploy on the strength of source/browser checks.

## Independent review and correction pass

Astra reviewed 150e7b3 against c70feee (not Claude), independently ran 33 targeted checks and reproduced two browser defects. All five important findings were addressed with regressions:

- Earlier PDF reads superseding later choices: two asynchronous picker/staging tests failed before generation guards and now pass.
- Mobile header actions clipped at 320/360 px: built browser action-bound assertions failed before mobile action-row fix; rerun passed at 320/360/390 px.
- Native first completion preceding busy cleanup: actual bridge code runs against JVM Android/HTTPS fixtures; regression failed [false,false] before cleanup-before-callback and passes afterwards. This fixture is not an Android device test.
- Provider errors displayed as empty success: explicit status tests failed before provider-stage reporting and now pass.
- Hidden connection proposals: explicit provenance/endpoints/port-role test failed before review details and now passes. Physical confirmation remains manual.

The stale native-permission statement in README was corrected.

Subsequent user clarifications added four explicit node leg aliases (A/B top, C/D bottom), optional reviewed internal-director evidence, and selective removal of highlighted A# labels when confirmed active tombstones are generated. Annotation names were discovered to be absent from native text extraction, so default privacy masks now include all remaining annotation rectangles too. Incomplete annotation coverage forces manual review. Original uploaded bytes remain immutable. FreeText A# annotations supply provisional positions, and the matching original annotation reference is preserved for selective cleanup. A source-binding action preserves physical source measurements and marks remapped edges provisional.
