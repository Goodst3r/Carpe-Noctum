# Carpe Noctum fresh calculator rebuild

The binding specification is docs/rebuild/SPEC.md and the integration contracts are app/CONTRACT.md. The user explicitly requested a fresh application structure and storage, with no saved-job compatibility, migration adapter, or old job importer. The Q&A overrides historical launch anchors and workflow instructions.

## Architecture
- app/ contains authored fresh ES modules, equipment data, interface, and shell.
- node night-sweep/build.py is NOT a valid command: run python3 night-sweep/build.py, which calls pinned esbuild and embeds local checksummed assets.
- python3 build-pwa.py packages only the fresh app, current guide, icons and offline shell.
- night-sweep/vendor/map retains licensed local PDF/OCR assets. No runtime CDN. Optional model downloads fetch only pinned public weights, never user images.
- android-build/ retains the existing offline Android bridge/package and original signing requirement. Fresh storage is separate; historical job compatibility is not a goal.

## Roles and checks
Codex implements and tests using task-appropriate available models. Claude independently reviews the exact frozen candidate. No Grok role.

Run npm ci, npm test, npm run build, npm run test:browser and npm run test:ai-browser. Record actual commands/results. Never carry old test counts into fresh claims. Node, browser, native compilation, emulator and physical-device evidence are separate.

Keep private maps, ONX originals, signing keys and passwords outside Git. Test fixtures committed here must be synthetic. Never claim a source-only check proves a signed APK, phone behavior or field acceptance.

## Delivery and cleanup
One implementation branch and PR. Rebuild generated outputs; never hand-edit them. Obsolete source can be removed after equivalent fresh behavior checks. Remote branches require verified recovery tags, exact recorded heads, accounted-for unique work and immediate head recheck before deletion. Do not delete independent work or recovery tags. No deployment or merge is implied.
