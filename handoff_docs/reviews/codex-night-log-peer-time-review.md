# A2 independent peer-time correction review

November 11, 2026. **Specification verdict: PASS. Quality verdict: PASS for this narrow successor; no open Important finding.** The original partial-time display/persistence mismatch and the nonblocking stale-preview finding are corrected. This is a scoped review, not the required full gate or Lane B merge approval.

## Identity and scope

- Starting published PR17 head: `de5459d3f55da16e64405fc24f12769b4d5f0cfb`.
- Reviewed exact frozen successor: **`cd79a84630ec7fec9f997f9631b5fb5b4a35a287`**. Reviewed build3 `5588a49b10292bed422b7597ec227bce38173a2d` remains an ancestor.
- Independent detached worktree: `/workspace/carpe-a2-peer-time-review`; author tree untouched.
- Standalone SHA256: **`40457922122c2d112919978691cb171ca6f3e816e2f00b93dfa3d0018c5bbe97`**.
- End-of-review **567 tracked hashes unchanged**, HEAD unchanged, `git status --short` empty, both working/staged diff checks and `git diff --check` exit0. No restore command or install used. Proof `/tmp/carpe-a2-peer-time-review-proof-cd79a846.json`, initial manifest `/tmp/carpe-a2-peer-time-final-before-hashes.json`.

Read the actual Lane B review `/tmp/carpe-a2-laneb-review-de5459d.md`, full source delta and author handoff `/tmp/carpe-a2-peer-time-fix.md`, affected focused QA and guide changes. Read applicable AGENTS, automatic/development instructions, developer build notes, plan/rules/A2 requirements, known-gap/setup material, current Lane A status from PR21 and Lane B Study status, plus relevant current/historical project-status sections. The checkout's stale status prose was not treated as the latest implementation. GitHub PR metadata was actually consulted read-only; published head was still de5459d when review started. Used Superpowers verification-before-completion guidance and the actual local Chrome DevTools MCP setup.

Artifact provenance correction: the full-gate wrapper selected the original narrow-proof path and refused its first preflight before tests. The coordinator preserved this review proof verbatim at the distinct path above before starting the product gate. I independently reconstructed and byte-compared the original narrow proof; backup SHA256 is `034540b30372fad4e24e945439303daefa9866cb89dc400a8df112a9baa2f245`. Review data and findings are unchanged. The original report bytes remain in `/tmp/carpe-a2-peer-time-review-before-proof-link.md`; the full gate has a separate execution scope and is not claimed here.

## Reproduction and source assessment

I independently executed the old frozen de5459d app using actual Chrome DevTools MCP at360px. Real End/Backspace produced `2026-11-11T21:3` while state/export retained `2026-11-11T21:30`; no adjacent invalid state existed. Direct Station → Night log navigation retained the differing DOM text. Both defect reproductions plus the no-console-error check passed: **3 baseline checks**, `/tmp/carpe-a2-peer-time-mcp-baseline.json`. This independently confirms the symptom, rather than trusting the author's RED receipt.

The successor retains optional strict text local times and the existing validator. The UI now places a field-specific `Error:` message with `YYYY-MM-DDTHH:mm` immediately after the input, linked by `aria-describedby`, with live status and `aria-invalid=true`. A double border supplies a non-color cue. Invalid input cannot replace the previous valid state or storage. Blur restores the saved exact text or unknown blank and explains that locally. Explicit Night log navigation invokes `render(true)`, which restores invalid controls **before** the signature-cache return. It does not need to rebuild unchanged controls or discard unrelated unsaved draft text. Valid replacement and intentional full clear remain supported.

The preview correction clears an existing generated report after a validated persisted-log edit and asks for Generate handoff again. Invalid unsaved time and unrelated entry drafts leave the accurate preview intact. Regenerating is read-only and exactly matches current handoff text. Existing TXT/CSV capture/export paths remain unchanged.

Source delta is limited to NightLog UI/save feedback, scoped CSS, the NightLog-only workflow call, focused regressions, own guide text and normally rebuilt output. Independent byte comparisons confirmed **six unchanged spans**: calendar parser, snapshot validator, log validator, capture projection, handoff serialization and CSV rows. RF engine/Alignment/Station/threshold/App/jobs source matches de5459d. No new RF formula, company value, date interpretation, capacity, schema/storage key, snapshot/result recalculation, package/version or release behavior was introduced.

Both main Markdown README copies remain byte-identical. The four relevant authored/PWA rendered guides contain the restoration/preview behavior. No unrelated guide count was changed in this successor. New tests exercise actual input handlers and saved/export state; they explicitly synchronize the cached signature before invalid navigation and use real keyboard input in Chromium.

## Own fresh automated execution at cd79a846

```sh
node qa/build3-night-log.test.cjs
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs
```

Both exit0: **20 source checks and 20 frozen checks**, separately executed from the final committed test file. Logs `/tmp/carpe-a2-peer-time-source.log` and `/tmp/carpe-a2-peer-time-frozen.log`. These cover original Station captures/results, independent work dates, raw/unknown values, safe exports, legacy/read-only warnings, named job/duplicate/backup, six synthetic originals retained through portable restore, quota behavior and exact200-entry bounds, plus the two new time/preview groups. These counts are this reviewer's runs; the author's earlier full/partial frozen distinctions are not substituted.

The independent retention script passed the six unchanged spans, identical main README pair, four rendered-guide presence checks and unchanged RF/storage source paths. Evidence `/tmp/carpe-a2-peer-time-retention.json`. Existing locked QA dependencies were reused through an ignored symlink; no dependency install/removal or version change.

## Own actual Chrome DevTools MCP execution

Used installed MCP server **1.13.0** via the existing standard stdio JSON-RPC client, isolated `/usr/bin/chromium`, synthetic/default frozen app served over loopback. Actual tools included new_page/list_pages/emulate/evaluate_script/take_snapshot/fill/press_key/take_screenshot/list_console_messages; a coordinate-click diagnostic was also attempted as described below. No private attachments/profile were accessed.

- `python3 /tmp/carpe-a2-peer-time-mcp.py final` — exit0, **67/67 explicit checks**. Both Window start and Window end at320/360/390/430: real partial typing/End/Backspace, unchanged entire state/storage on invalid input, adjacent named format feedback/ARIA/double border, single label, at least44px field, no document overflow, real Tab blur restoration, direct navigation restoration, intentional full clear by actual Ctrl+A/Backspace, unknown previous-value retention, invalid nonleap and valid leap-date behavior. Additional preview invalidation/draft preservation/read-only regeneration and no console errors passed.
- `python3 /tmp/carpe-a2-peer-time-cache-mcp.py final` — exit0, **4 additional grouped checks**. For each field, explicitly synchronized the stored signature then retained references to the input and unrelated draft. Invalid typing plus direct Station → Night log return restored the stored text **in the same input element**, preserved the same draft element/text and exact state/storage. This directly proves the unchanged-signature branch, independent of a full rerender. An accurate generated preview and export remained unchanged during invalid unsaved time. No console errors.
- Final records `/tmp/carpe-a2-peer-time-mcp-final.json` and `/tmp/carpe-a2-peer-time-cache-mcp.json`; logs with matching names. Screenshot/AX `/workspace/.tools/chrome-devtools/checks/a2-peer-time-final.png` and `a2-peer-time-final-ax.txt`. I viewed the final screenshot: dark phone layout and generated synthetic note are readable within the panel; it is not an invalid-state screenshot.

**Geometry/control qualification:** the visibility assertions explicitly center the focused field before checking the adjacent error. No automatic error scrolling is claimed. Initial uncentered320px probe placed the field at795–846px and its adjacent10px-gap error at856–934px below the844px viewport. The border/ARIA and adjacency were correct; the input itself was already partly below the viewport. Root reviewed this edge and accepted it as ordinary scrolling, not the former500px distant-message defect. The user may still need to scroll when editing at a viewport edge; no perpetual on-screen feedback or physical-keyboard/tap certification is claimed.

**Preserved harness attempts:** the initial uncentered visibility assertion failed as above (`...mcp-uncentered.json/.log`). A separate MCP `fill(value='')` attempt changed DOM text but emitted **zero input events**; a direct instrumented comparison proved real Ctrl+A/Backspace emits input and correctly clears the saved value (`/tmp/carpe-a2-peer-clear-probe.log`, `...mcp-empty-fill.json/.log`). A later key attempt lacked the intended focus after a coordinate click/layout change; its controls were collapsed, so it did not establish a product clearing defect (`...mcp-unfocused-keys.*`, `...mcp-click-target.*`). Final clearing checks explicitly focus the input/open details and then use trusted real keys. These failed harness attempts are not counted as passing checks or hidden as source fixes.

## Limits and next

No full `qa/run-pwa.py`, whole-app build3 layout, browser smoke, rebuild, install, source/tracked metadata edit, push, GitHub write, child agent, private-file access, APK/signing or deployment by this reviewer. Root serialized that gate behind CI. No emulator, physical Android/iPhone, Safari/WebView, screen-reader certification, native provider/save dialog, RF hardware or field operation verified. No new math means no new external engineering calculation was required.

No new blocking finding remains in this scoped correction. The original readonly14px preview observation remains accepted, and the viewport/focus qualifications above stay explicit. Coordinator should run the fresh full gate on cd79a846, publish ordinary PR17 successor metadata, and request Lane B's independent same-head re-review/gate/merge. Lane A must not merge its own PR.
