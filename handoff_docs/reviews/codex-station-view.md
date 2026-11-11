# A1 station worksheet — independent review and verification

Draft [PR #8](https://github.com/Goodst3r/Carpe-Noctum/pull/8) targets `build3`. Lane B must independently review the current PR head and merge it; Lane A does not merge its own PRs.

Starting revision: `53b839e47700fc1dd8257c78f99198fab2a20bbf`. Initial feature reviewed: `f45ae53bd2d960d8a033bf8f462db16388019aff`. Correction: `10b4105`; scoped re-review: `51df6d4e059549bd5808b4a466ca4b77db7dde18`. Historical base-refresh source tested: `3d610f413ca88522048c8481482a93bdd4c1b5ce`, after integrating reviewed B1/B4 base `79b0735`. Earlier source `fadcdfc` remains a historical passing receipt. Later receipt/status edits change documentation only.

## Findings addressed

| Important finding | Correction and regression |
| --- | --- |
| Changing launch asset, port or module retained the old physical source's readings and done state | Source type, actual asset/port/module now participate in binding; prior observations remain archived. Tests change actual node/active controls. |
| Imported numbers accepted by `Number()` could calculate while HTML number controls appeared blank | A consistent decimal lexical contract rejects unsupported forms, with rendered import checks for `+19`, whitespace, hexadecimal/binary and related forms; accepted equivalent part values display consistently. Raw imports are not rewritten on opening. |
| Recorded electronic return EQ/tilt was incorrectly constrained like nonnegative insertion loss | Signed recorded settings are supported with a qualified application guard; physical pad/loss remains nonnegative. |
| Three existing navigation/training expectations failed after adding Station | Route-tab, keyboard End and complete-practice contracts now include the new screen/step; tests still exercise controlled panels, keyboard navigation and actual Station selection. |

Each correction had an observed failing regression followed by passing coverage. The stronger backup case contains valid forward solver inputs, actual/required injection, receiver/reference levels, distinct stages, done dates and named-job duplication. Independent Decimal arithmetic, generated-app Chromium probes, retained UBT, duplicate isolation and escaping were checked. The scoped reviewer found all four Important findings addressed, with no new Critical or Important issue.

## Lane B review corrections and current evidence

Lane B's review 5861415148 at 895503b requested seven corrections. Frozen source **a9b64289e1d276416967da7a095fce20364165f1** addresses signed input hints, external accessible labels/44px source controls, complete unchanged-solver warnings, catalog-independent saved bindings, independent reference provenance, plant/model-specific reminders and guide counts. No new RF formula is introduced.

Optional bindingVersion 2 uses saved choices. Records without a binding version remain visible/read-only and are not migrated on open/restore. Explicit confirmation creates a new bound identity and preserves the original map entry exactly. A2/A3 must honor legacy-unconfirmed status rather than treating historical dates as confirmed current-equipment work. UBT remains read-only.

The [scoped internal review](codex-station-laneb-fixes-review.md) independently passed 8 exact-frozen regression tests plus 16 real Chromium checks, including distinct Before/After and dated sweep backup/restore, catalog correction, actual band change and legacy copy/archive. All seven requests were addressed with no new Critical/Important finding. This is internal evidence; Lane B still must re-review the actual published head and merge.

The Lane A implementation agent's current exact-source gate at 6030607 passed **66/66 suites / 1,276 checks** in **361.7 seconds**, exit0. Station 22, review 11 and rendered 121 are included. Separate existing layout 141 and smoke 331 also passed. Build/worktree stayed unchanged and clean; no evidence restoration concealed churn. Exact commands, per-suite results, source binding and artifact hashes are in [the receipt](../lanes/codex-a1-validation.json):

    NIGHTSWEEP_CHROMIUM=/usr/bin/chromium NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py
    NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py
    NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py

Standalone SHA-256: 28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15. Source/build/public guides/tests remain frozen; later handoff metadata does not change their bytes.

Historical evidence stays separate: source 3d610f4 passed 65/1221; the first f45ae53 gate failed three outdated navigation/training contracts (60/63 suites and 1105 counted checks). Neither is used as the final a9b6428 result.

## Deferred Minor limitations

1. The source sheet's location wording can follow the saved selection after a picker-only station change, while the numeric value follows the current selection.
2. The visible last-edit paragraph refreshes on a full station render; persisted stage timestamps update on every edit.
3. Very long heavily escaped source labels can exceed the encoded-context guard. An edge probe using 500 quotation marks in each permitted asset/port/module field produces a 3,043-character context against a 2,500-character guard and prevents a new worksheet edit. Existing records remain retained. Normal short labels are unaffected.

These remain visible review items for the final whole-branch review; they are not silently resolved.

## Scope and decisions

Conditional arithmetic is allowed before optional plane/reference text is filled; blank provenance is unknown, and a numerical comparison does not establish a physical plane match or acceptance. The same-plane instructions remain visible. Making free-text provenance mandatory is not inferred from the worksheet requirement.

Archived/unbound observations are preserved in job JSON; A1 does not promise a history browser. Existing station-source qualifications and manufacturer gaps remain explicit; no new universal receiver level, return tolerance or commissioning procedure is inferred. New company targets start unknown and plant methods remain separate.

Tools used: local Git/Node/Python/Playwright and actual Chromium rendering, independent Python Decimal and Wolfram arithmetic, scoped Data guidance and independent code review. A Figma account was reachable, but no project file was configured for design review; the implemented mobile screen was inspected directly. No APK, signing, deployment, emulator, physical phone/Safari/WebView, RF hardware or field check was performed.


## Remaining Lane B nonblocking list

The full grouped list is in handoff_docs/KNOWN_GAPS.md under A1: floating-point/absolute formatting; nonnegative-only net loss; lenient registry resolution; archived-context browsing, Load example retention, imported identity validation and rejected-edit handling; stage/focus/native-select/contrast/result/sign/timestamp/empty-button polish; old text spacing; dynamic keyboard test oracle. The three earlier internal Minor items above remain recorded. Read-only legacy stage browsing and honoring its binding status in future consumers are explicit follow-ups. No incidental CSS improvement is represented as closure of every phone concern.


## Measured local-lookup follow-up

The later user-requested performance pass freezes source 6030607, after all seven Lane B corrections. A local first-wins catalog Map replaces repeated device scans without changing data, math or binding. [Performance scope](codex-a1-optimization.md), [fresh scoped review](codex-station-optimization-review.md) and [implementation/benchmark method](codex-station-optimization-implementation.md) document the 36–43% median input reduction on the synthetic 200-active-row workload and 0–0.2ms extra median cost in its nine-row test. No universal/phone gain is claimed. Reviewer 11-source/11-frozen/Station 22 checks plus 22 complete old/new browser output comparisons passed; this is separate from the current 66/1276 gate. Prior a9b6428 seven-fix review stays historical; its 1273 checks are not the current run. Lane B must review the updated published head.
