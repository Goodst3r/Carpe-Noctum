# Build 4 Android Preview: review, gate and original-key signing record

Dated record, 2026-11-13 UTC. It supersedes the pre-signing build 4 status lines for the **current** candidate only. Earlier snapshots (`android-build/build-readiness.json`, `FINAL_CANDIDATE_HANDOFF.md`, `FINAL_CANDIDATE_ASSET_HASHES.json`, `routes-sweep-combined-audit.md`) remain unchanged historical records; their standalone hashes `0dab2159…`, `539985c5…` and PWA `eb868a1d…` belong to earlier checkpoints, not this APK.

No PR was merged, no web app was published, no public GitHub release or app-store submission was made. Physical-phone acceptance is **not** claimed.

## Candidate identity

| Item | Value |
| --- | --- |
| Reviewed combined source (PR55 head, unchanged) | `18e7239d017882ee780864c5a2fe74e8d979ea7a`, tree `d80c528c4c7ea70622f33f26236851e56c822622`; PR55 merge `afed0244…` has the same tree |
| Release source (APK input) | `57dcde8649bfe4d5906ad734fc9fa852688a6efd`, tree `eaf594b5410d9b886ac03e48e36deb95d4557291` = `18e7239` + one reviewed Android wrapper fix (below) |
| Standalone `outputs/Night_Sweep.html` | 13,778,430 bytes, SHA-256 `8c9073e3a233a37925906714e42f6ed8eb096abbae69ea586b149f1e0f76ab21` (unchanged by the fix) |
| PWA version | `23955d1a71837624babf` (unchanged) |
| Version | 2.0 Alpha build 4 · Android versionCode 28 |

## Review verdict: approved for Preview phone acceptance

### RF behavior (lead, independent probe against production `engine.js` + `route-workbench.js`)

38 of 38 separately authored checks pass: 10 dBmV in / 43 dBmV target requires 33 dB at both 54 and 860 MHz; 31 dB available gives −2 dB and **Short on gain**; a high-only shortfall is labelled and limited at 860 MHz; sufficient gain with no or one output limit stays **Gain available · output limit unknown**; both limits within gives **Can make gain**; predicted output above an entered limit is `above_limit`; margin under the 3 dB reserve is `marginal`; catalog `publishedGain` alone yields no available gain and **Needs input** (screening reference only); draft, proposed, absent, unconfirmed-model, unresolved-reason and unconfirmed-launch map rows block, including downstream of a proposed booster or an unverified upstream model; a missing upstream, an incomplete span, a marker above available spectrum and a gain curve not covering a marker block without extrapolation; a replaced model (`workbench.modelId` ≠ device) reuses no gain; output loss is counted once; test-point correction is applied exactly once and only on the `tp` plane, mismatched frequencies or missing planes give no measured gain. Operating gain comes only from entered row values (`activeGainAt`, anchors/flat/table), never the catalog.

The final evaluation-reuse fix (`664aed3`) was read: `refreshWorkbench`/`refreshRoutePointSummaries` call `evaluate()`, which `meter.js:85` wraps with `effectiveLaunchSetup()` (the same corrected launch `gainBudgetSetup()` returns) and `workflow.js:214` caches per state/frequency within one calculation batch, so one evaluation per marker is preserved. Non-main legs use only their own `legGain` entries (`workbenchState`).

Display note (not a defect, within scope): with sufficient gain the headline stays **Can make gain** while the row's separate line shows `Reserve: low` or `Output limit: exceeded`, as PR54 specifies ("surface low reserve and output-limit results separately").

### Map import (Sonnet delegate, read-only probes, synthetic fixtures)

A–E pass: exact NAME verbatim and separate from TAG and installed model (no model inferred from TAG); ambiguous rows keep reasons and stay editable through save, named-job reopen; cancellation and job changes before/while reading or before Build discard stale drafts and `onDraft` with a stale context returns false; imported rows receive fresh IDs that avoid current, historical, station-setup and route-tool references, with parents remapped and no old station/workbench evidence attached; a real Chromium `file://` import of a synthetic PDF and PNG made zero http(s) requests (blob: and the preview data: only). OCR misreads remain visible as review items. Repeated spaces inside a PDF cell collapse to one (tokens are joined with single spaces).

### Findings

| # | Finding | Severity | Resolution |
| --- | --- | --- | --- |
| 1 | Android only: `MainActivity.shouldInterceptRequest` answered every intercepted request with an empty body. Android's `WebViewClient` reference states the callback "is invoked for a variety of URL schemes (e.g., http(s):, data:, file:, etc.)… This is not called for javascript: URLs, blob: URLs…". The importer's original-markings preview is a canvas `data:` JPEG (`map-import.js:894,933`), so it would render blank in the APK. Recognition itself uses blob:/in-memory loads and was unaffected. | Blocking for the APK | Fixed in `57dcde8`: `loadsInline(scheme)` returns `null` for `data:` only (case-insensitive); every other intercepted request is still answered empty; `setBlockNetworkLoads(true)`, file-access settings and the navigation block unchanged. Written by Sonnet, reviewed and approved by the lead. Native edge checks 12 → 16. Web outputs unchanged. Device rendering still requires the phone check. |
| 2 | Pre-existing (identical in `build3`): `freshRow` avoids only current row IDs, so a manually added row after a deletion/import can reuse a historical ID and show old Equipment-setup notes keyed by that ID. Imported rows themselves are correct. | Should-fix, not a regression | Not changed in this release (it would alter saved-job identity semantics). Recommended follow-up for Spencer to schedule. Repro kept in the session scratch only. |
| 3 | `dist/functions-guide.html:9` intro still says "2.0 Alpha build 3 (in development)"; `docs/DEVELOPER_BUILD.md:1` heading says build 3; calculator description `workflow.js:32` omits three of eight cards. | Should-fix (web guide/docs) | Not in the APK (APK embeds only the standalone, whose title, about line, exports, share and print say build 4). Deferred to the next web update to avoid changing the gated PWA. |
| 4 | Older handoff files carry earlier-checkpoint hashes without "superseded" labels. | Note | This record identifies them as historical; they were not rewritten. |
| 5 | Test fixtures reuse the string `HA0005` as a synthetic node name (`qa/upgrade01314.test.cjs`, `qa/upgrade01415.test.cjs`). No private HA0005 content is tracked or in the APK. | Note | No change. |

Existing reviews: the PR55 independent approvals (comment 6851412491) were checked against the current workflow and remain applicable to `18e7239`; they do not cover finding 1, which this record reviews. No Grok approval exists for this delta; none is claimed. Internal model delegation is not an external review.

## Gate on the release source `57dcde8`

| Run | Result |
| --- | --- |
| Local attempt 1, 2026-11-13T12:40:52Z | **Failed / stopped**: `sweep-setup.test.cjs` Node heap out of memory at the container's default 2,096 MiB heap after all of its printed assertions passed; 82 suites passed, 1 failed when stopped. QA-environment limit, not an app assertion. Preserved. |
| Local attempt 2, 13:02:44–13:29:07Z, `NODE_OPTIONS=--max-old-space-size=4096` (resources only; no assertion change) | All exits 0: `npm ci`, standalone and PWA rebuild unchanged, `git diff --exit-code`, `qa/run-pwa.py` **118 suites / 3,469 checks** in 1,538.3 s, `build3-layout` **1,244**, `browser-smoke` **372**, `git diff --check`, clean status. Node 22.23.4, Python 3.13.18, Playwright 1.65.1, Chromium 153.0.8010.12. Log SHA-256 `9a83528d…5119`. |
| Hosted [run 43427283627](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43427283627) (workflow_dispatch on `ccr-5336ed33-oaatna` = `57dcde8`), 12:41:43–13:14:11Z, stock heap | Success: 118 suites passed (summed **3,469** checks), 1,866.6 s, layout **1,244**, smoke **372**, clean tree. Node 22.23.4, Python 3.12.16, Chromium 158.0.8127.18. Log ZIP SHA-256 `efce30cc…e76d`. |
| Earlier lead gate on `18e7239`, 12:22:28Z | Interrupted by the lead after 61 suites passed, 0 failed, to re-gate the final revision. Preserved, not a pass. |

Previous records verified, not re-run by the lead: PR55 local gate 118 / 3,465 / 1,244 / 372 and hosted run 43416560764 (success on `18e7239`, PR merge tree equal). The evidence ZIP `/workspace/carpe-routes-evidence-20261113T114836Z.zip` was not present in this environment and was not inspected.

Android source checks on `57dcde8`: `qa/android-preview.test.py` 18 passed, `qa/android-native-edge.test.py` 16 passed (mocked SDK / Java stand-ins).

## Signed APK

Toolchain: `android-build/toolchain/download.py` (platform-35_r02, build-tools 35.0.0, ECJ 3.40.0, SHA-1 verified; two ECJ attempts first returned HTTP 429). Java 21.

Command (2026-11-13T13:29:31Z–13:29:35Z, exit 0):

```
python3 android-build/build.py <abs>/outputs/Night_Sweep.html --preview \
  --signing-dir <private directory outside the repository> \
  --expected-html-sha256 8c9073e3a233a37925906714e42f6ed8eb096abbae69ea586b149f1e0f76ab21 \
  --expected-certificate-sha256 a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca
```

| Fact | Verified value (actual Android tools) |
| --- | --- |
| File | `CarpeNoctum-2.0-build4-preview.apk`, 6,259,228 bytes |
| APK SHA-256 | `d24f71544ec4e2bd0a106d5d4d1bc1049ff9722de068d9e7ee62bc7c7748a1a2` |
| Package / version | `com.spencerwilliams.nightsweep.preview`, versionCode 28, versionName `2.0 Alpha build 4` (aapt2) |
| Launcher label | `Carpe Noctum 2.0 Preview build 4` |
| SDK | min 26, target 35 |
| Provider authority | `com.spencerwilliams.nightsweep.preview.pickerfiles` (identical to the trusted build 2 Preview), not exported |
| Permissions | none (no INTERNET), same as build 2; `allowBackup=false`, `usesCleartextTraffic=false` |
| Fixed origin | `https://appassets.androidplatform.net/` present in dex |
| Signatures | apksigner: Verifies, v2 true, v3 true, one signer, RSA 3072 |
| Certificate SHA-256 | `a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca` (original; also matches the private key and the trusted build 2 Preview APK) |
| ZIP alignment | `zipalign -c -P 16 4` and `zipalign -c 4` exit 0 |
| Embedded HTML | `assets/index.html` byte-identical to the frozen standalone (`cmp`), SHA-256 `8c9073e3…6ab21` |
| Fix compiled | `loadsInline` present in `classes.dex` |
| Secrets / private files | APK entries: manifest, icon, resources, `assets/index.html`, `classes.dex`, `META-INF` signature files. No password match, 0 of 27 private-key byte probes found, no HA0005/private-key markers |
| Builder receipt | `signed: true`, `installable: true`, `matches_original_signing_identity: true`, `tested_on_device: false` |

Promotion/rollback behavior of `build.py` was unchanged and its mocked rollback checks pass. The binary is delivered privately to Spencer outside Git; it is not committed.

## Android runtime verification limits

- No emulator: the container has no `/dev/kvm`; no Android WebView runtime check ran. Desktop Chromium results do not establish WebView or phone behavior.
- Static WebView review: recognition libraries load as blob: scripts; the OCR worker is a blob: worker with Tesseract core and WASM inlined (instantiated from bytes) and language data served from memory by a patched worker `fetch`; pdf.js runs with `useWasm:false`, `useWorkerFetch:false`. Optional pdf.js JPEG2000/JBIG2/ICC/standard-font loads would also fail offline in a browser; such PDFs can remain unknown.
- The standalone is 13.8 MB (build 3: 2.27 MB). The wrapper reads it into a Java string for `loadDataWithBaseURL`; cold-start time and memory on the phone are unverified.

## Remaining checks (not passed)

1. Spencer's physical-phone acceptance: update over code 27 without uninstalling, jobs/readings/originals intact, map import with visible original-markings preview, offline cold start, app switching, lock/resume, pickers and exports ([steps](../APK_STEPS.md)).
2. Private HA0005 field replay.
3. iPhone/Safari and PWA deployment checks; no publication was performed.
4. Follow-ups: findings 2 and 3 above.

## Models and tools

- Lead: `claude-opus-5-5`; the session reported effort **medium**, not the requested High (no in-session control was used to change it).
- Read-only audit: Agent model `haiku`, effort `medium` requested; the exact served model ID was not exposed to the lead. 238,400 subagent tokens reported.
- Map-import probes and the native fix: Agent model `sonnet`, effort `high` requested; served model ID not exposed. 226,706 and 114,338 subagent tokens reported.
- One documentation fetch helper (default model). Lead token usage and billing cost were not reported.
- No Opus specialist was delegated. Tools: local Git, Node, Python, Playwright/Chromium, Java/ECJ, Android build-tools (aapt2, apksigner, zipalign), GitHub connector (PRs, comments, workflow runs/logs, workflow dispatch), the Android developer reference. No private data was sent to external services.
