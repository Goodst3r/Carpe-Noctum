# Claude review handoff

Review only. Codex owns implementation. Grok is excluded. Use an efficient model for routine checks and a stronger model for RF/coordinate or data-integrity questions. Do not modify or merge the branch during this check.

Fetch `codex/fresh-calculator-rebuild` from https://github.com/Goodst3r/Carpe-Noctum and record the exact full HEAD SHA in your review. Read AGENTS.md, docs/rebuild/SPEC.md, app/CONTRACT.md, VERIFICATION.md, MATH_CHECK.md and EQUIPMENT_SOURCES.md. Do not apply historical workflow/compatibility plans. Fresh storage and no old-job imports are intentional.

Check actual code and reproduce material concerns:

1. Each measured node port defines its own full sampled unity target. Replacement removes missing frequencies; no source interpolation/extrapolation. Downstream measured output changes only its branch. Best supported outputs propagate through shortage.
2. GainMaker modes and physical slot references; shared HGD pad/EQ minimax over all bins/legs; director loss once; fixed interstage EQ; AGC HGD−34/LE−29; unknown curves/headroom remain visible. Verify sourced Digicomm/Cisco/SA tables and quarantined anomalous row.
3. Graph tracing from selected physical ports, editable spans/equipment, destination pruning and upstream-node lookup. Cycles, unresolved ports and multiple feeds must stay unknown.
4. PDF TAG/NAME/DLA/power-supply-only schedules, EOL IDs only; native and scanned evidence; no inferred crossings or silently confirmed symbols. Export tombstones adjacent on original same page, all legs grouped, rotations/crops handled, drag position retained, repeated export avoids duplicates.
5. Manual parsing, ONX offsets/replacement, persistence atomicity and compact geometry, no missing numeric values coerced to zero. Test cancellation and immutable original hash.
6. Local image tools: pinned model size/hash checks, explicit downloads/imports, worker cancellation, offline assets, no external image upload, proposals cannot mutate RF/topology. Heavy adapters are declared unverified.
7. Browser/Android source parity, same-origin native assets, file bounds, offline PWA update rules. Unsigned build is not phone acceptance.

Run npm ci, npm test, npm run build, npm run test:browser and npm run test:ai-browser. Private example files and optional model caches are not in Git; state any unrun checks. Report severity, file/line, a minimal reproduction, expected/observed behavior and whether it blocks release. Distinguish intentional fresh-format decisions from defects. Return a concise verdict with exact tested SHA and commands; do not claim phone/field validation without evidence.

## Build6 follow-up

Read REVIEW_RESPONSE.md first. The prior reviewed baseline is4b660c493010fa9f3a1eb64e6979aace863a4bfb. Review only its diff to the new PR61 HEAD and rerun the affected checks. Private originals are supplied separately in Claude-private-review-inputs.zip; keep them outside Git. Confirm H1 with the full98-point original ONX and a confirmed active, not a few-point fixture. Confirm newest BEFORE replacement, feet/metres/cancel behavior and nonzero compensation declaration. M3 phone/emulator acceptance remains separate from Java callback/SDK compilation. Report the exact SHA and data/tool prerequisites actually present.
