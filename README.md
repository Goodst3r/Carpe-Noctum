# Carpe Noctum — fresh calculator rebuild

Offline RF calculators, editable physical-port routes, measurement-driven sweep predictions and PDF map tombstones. This build follows the approved questions and answers in [the specification](docs/rebuild/SPEC.md).

## Use and build

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run test:ai-browser
npm run dev
```

Open `http://localhost:4173` after starting the development server. `outputs/Night_Sweep.html` is the self-contained app; `dist/` is the installable offline browser application. Use Tools without a job, or open Route & Sweep and select Low/High split.

Node sweeps start blank. Corrected per-port ONX measurements drive downstream unity targets. The route groups each station's levels, gain feasibility and supported pad/EQ recommendations. The map is editable; PDF updates are new copies with adjacent active/EOL tombstones.

This is a fresh storage format. Historical NightSweep job compatibility and migration are intentionally excluded. Save and back up new routes using the new library. Keep original PDFs and meter files separately. Private examples and signing material are never committed.

Optional image tools run locally in a separate worker. Tiny OCR is included in the web/APK assets and installed on demand; orientation, page unwarping, table structure, layout and image description use explicit verified model packs. Downloads fetch public weights, never your images. Native builds have no network permission: use included packs or import model files. Larger layout and Florence adapters are experimental and have not run on a phone. Suggestions require review and never alter RF values or connect map branches automatically. The standalone HTML keeps all core calculators; its optional image tools require the hosted web version or APK.

The build downloads the pinned Tiny OCR weights if they are absent from `.cache/ai-models`. Set `CARPE_AI_MODEL_DIR` to reuse a verified external model cache. Native preview packaging includes any complete verified optional packs in that cache. Models and runtime licenses are published under `dist/ai/`.

## Source and evidence

- `app/`: fresh application, numerical engine, equipment data, importer and interface.
- `tests/`: executable fresh behavior checks.
- `night-sweep/vendor/map/`: pinned local PDF/OCR libraries and licenses.
- `night-sweep/build.py`, `build-pwa.py`: deterministic standalone and PWA packaging.
- `android-build/`: offline Android wrapper; original certificate required for signed releases.
- `docs/rebuild/`: current specification, execution record, sources and verification.

Codex implements and tests. Claude independently reviews the exact candidate. Grok is excluded. Read the current verification record for what actually ran; browser checks do not establish phone or RF acceptance. No publication or merge is implied by this source branch.
