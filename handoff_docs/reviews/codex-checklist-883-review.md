# PR10 corrected checklist engine — independent scoped review

November 11, 2026. **The two original Important data-preservation/time findings are corrected. Specification verdict: changes required for one remaining application-guard registry requirement. Quality verdict for the corrected paths: PASS, with Minor count paperwork still open.** Do not start the full gate or merge this head until the registered-guard finding is addressed and the new head/base is confirmed. Supervisor review remains a separate release requirement.

## Exact revision and scope

- Repository/PR: Goodst3r/Carpe-Noctum, https://github.com/Goodst3r/Carpe-Noctum/pull/10.
- Starting rejected integrated head: `2cf77ad0f07a4668c1e89929bb95f64a45fc310c`.
- Corrected implementation: `425d9830bee860a879e95f35da330ecdc6c6017a`; reviewed final head **`883eb11377cf259dd5b6df035b0a9e6559f317bf`**, which removes the accidentally tracked dependency symlink. No dependency installation was performed here.
- Current integration/merge base at review: `5588a49b10292bed422b7597ec227bce38173a2d`, an ancestor. Reconfirm it before the later real gate/merge.
- Detached independent checkout: `/workspace/carpe-pr10-883-review`; author checkout untouched.
- Standalone SHA256 **`67993947110aa76c4c223a34742d0e16769bdf18201f051eaab6a6219cdb9f1c`**; PWA index **`33d8c2982f9a771c233c818c8c6ba08cd3979f81d8f33cbe2efcaada6397753d`**.
- Shared engine Git blob **`0611820d9dec8de2e9b3b37830b183ecbf27e863`**. Exact authored engine bytes occur in both committed standalone and PWA.
- GitHub read-only metadata reconfirmed both PR10 and PR12 exact heads at the end. A direct `git ls-remote` attempt lacked a usable credential in this child process; the available GitHub plugin provided the successful live-head fallback. No push was attempted.

Read the full engine and Safety module, actual corrected engine/UI/CSS deltas and new regression groups/real-browser suite, runner changes, applicable AGENTS/plan/rules/review checklist, automatic/development instructions, developer-build/setup material, build-list items8/9 and supervisor boundary, current/historical project-status sections, Safety source note, both available lane statuses and relevant known gaps. Read the actual PR10 body/timeline and Lane B's fix comment6806601404, prior independent PR10/PR12 reports, the actual local MCP setup and bridge. The older lane-status rows remain stale relative to this ordinary correction; the actual commit/PR timeline is used for the fix state.

No full new audit of inherited DOCSIS/leakage/Station code or of every historical safety source is claimed. No external safety standard or company procedure was newly read. The source note's NCTI headings/general-practice provenance and unverified local wording remain as stated; they are not upgraded by this code review.

## Original Important findings closed in this scoped review

1. **Unreadable-data replacement after failed copy — closed.** `checklist.js:84–118` now allows replacement only after an exact copy of the current raw main value is verified on the device. Failure, no-op/wrong-byte side writes, or a different earlier side copy hold the original unchanged. New edits remain in memory and replay with the next successful write. UI feedback says Not saved and does not claim a missing copy exists. Actual Chromium's original-fits/copy-does-not-fit quota case preserved all3,145,729 synthetic characters through the edit and an actual reload. A separate selective real-Storage failure recovered without changing the original, retaining both the held role and a new tick.
2. **Partial native time erases prior time — closed.** `checklist.js:254–265,289–297` checks the actual event target's `validity.badInput` before saving, preserves saved14:30 during partial edits, leaves the same input in place, and explains the refusal immediately below it with linked ARIA/alert and a visible border. Input and focusout handle native cases that emit no change. Finishing the hour saved15:30; deliberately clearing all segments and actually leaving the native input saved blank; hour-only input from unknown stayed unknown with its explanation. Trusted native events were observed, not simulated validity substituted for the real-browser result.

The direct independent engine regression fails on rejected2cf77ad at its first old data-loss assertion (`saved:true` instead of required `false`) and passes nine groups on883eb11. This establishes the old/new behavior without editing a tracked source file.

## Remaining findings

### Important — application guards are still unregistered/unlabeled

Locations: `night-sweep/checklist.js:8,33,162,267,274`; no checklist application-guard entries exist in `night-sweep/thresholds.js`.

The engine exposes **“You can add up to40 items”** and limits item wording to160 characters and note inputs to a maximum120 characters, with lower configured effective caps (Safety Who80 and policy120, for example). These are software bounds, not numerical safety requirements, and they predate the two corrections. Nevertheless plan rule8 requires limits to have a label and source registration; A2's200-entry and A4's software guards follow that same rule.

Root independently adjudicated this as an **Important acceptance mismatch before merge**, rather than a new safety-number error or a regression in either corrected data path. Register the applicable guards as **Unknown / Application guard**, with units, source/locator and accurate conditions including lower per-field limits, and make their label/source accessible beside the relevant controls without placing a source button inside the input's label. Do not manufacture an RF/safety-spec provenance or register unrelated random/ID implementation constants merely because they contain numbers.

The card's assertion that its safety reminders have no numeric safety limits remains valid; it does not exempt application caps from registration. The two original Important closures above remain valid independently of this remaining project-rule issue.

### Minor — remaining33 versus34 paperwork

`Safety.ITEMS.length` is33 in eight sections. `NightSweep_Project_Status.md:33` is corrected to thirty-three, but **`CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt:170` still says “thirty-four items”** and the live PR body still says34. Lane B's comment says nothing else carried34; the tracked update-log line disproves that narrow claim. Correct the count text; do not add a reminder simply to make the older count true.

## Own executed verification

All runs used existing locked QA dependencies through an ignored symlink to the shared QA runtime. No install, removal, upgrade or restoration command.

| Command | Actual own result |
| --- | --- |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-checklist.test.cjs` | **30 source checks passed**, exit0; `/tmp/carpe-pr10-883-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-checklist.test.cjs` | **30 frozen checks passed**, exit0, observed complete tool output |
| `node qa/build3-checklist.test.cjs` | An additional default frozen30 passed. This suite defaults to committed output; it is **not** a source run and is not added to the distinct30 coverage count. |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-checklist-real.test.py` | **26 real Chromium checks passed**, exit0: native keyboard partial/complete/clear/hour-only at360/390, actual quota hold/recovery |
| `node /tmp/carpe-pr10-883-independent.cjs` | **9 independent adversarial engine groups passed** |
| `node /tmp/carpe-pr10-883-independent.cjs --baseline` | Expected exit1 on rejected2cf77ad, actual old saved-true/data-loss behavior; not a failing test of883 |
| `python3 /tmp/carpe-pr10-883-mcp.py` | Final exit0, **40/40 actual MCP checks**, described below |
| `git diff --check`, final tracked/staged/HEAD-tree/hash/status comparison | Exit0; all552 tracked hashes and semantic staged entries unchanged, tree/head unchanged, status clean |

The nine independent groups cover failed exact-copy hold/replay; different earlier copy; existing identical copy; silent side-write no-op; wrong-byte copy; main-write failure after safe copy; newer-version refusal; blocked read/write recovery atop a second tab's current data; and failed/successful explicit clear with pending-state handling. The script uses the production engine in an independent VM and synthetic in-memory Storage; it is not a new field/multi-process atomicity guarantee. Logs `/tmp/carpe-pr10-883-independent{,-baseline}.log`.

### Actual Chrome DevTools MCP

Used the installed **chrome-devtools-mcp1.13.0** through the standard stdio JSON-RPC client with isolated sandboxed `/usr/bin/chromium`, statistics/CrUX disabled, fresh synthetic contexts and loopback-only app serving. Actual tools: initialize, new_page, emulate, evaluate_script, type_text, take_snapshot, click, press_key, navigate_page, list_console_messages and take_screenshot. No private profile or attachment.

Final40 checks include real native quota precondition, exact original preservation/no main-write attempt/Not saved alert/memory retention/project-and-unrelated-key invariance/reload; a separate selective native Storage failure and recovery; and eight groups at **320/360/390/430** for trusted partial native time, saved/memory/input identity preservation, adjacent linked error/visible border, job/key invariance/no overflow, finishing the time, deliberate full clearing, hour-only unknown handling, and no console errors.

Evidence: `/tmp/carpe-pr10-883-mcp-results.json`, `...-mcp.log`; final screenshot `/workspace/.tools/chrome-devtools/checks/pr10-883-partial-390.png` was visually inspected and shows the incomplete-time explanation immediately below the outlined native control. These are desktop Chromium phone-width checks, not device or physical-keyboard certification.

**Preserved harness failure and diagnosis:** the first independent MCP run assumed three Tab presses left a native time input. That browser also exposes a fourth Show time picker stop. After Hours/Minutes/AM-PM were cleared, badInput was false but no new input event occurred because the serialized value was already empty; focus was still inside the control. The actual fourth Tab emitted focusout and production correctly saved blank/removed the error. Final tests wait for actual focus departure, rather than assuming a fixed tab count. The failed first-attempt JSON/log and `/tmp/carpe-pr10-883-clear-debug.log` and `...-clear-debug-results.json` native AX/event trace are retained; their partial checks are not counted as a passing final run. No source fix, synthetic validity forgery or product defect was inferred from this harness assumption.

## PR12 inheritance — narrower than whole-PR approval

Exact current outage head **`2c86e354b085c771fa93f2420c53ddd6f361d888`** contains the identical fixed engine blob0611820d. Its committed standalone and PWA contain the exact authored engine bytes. Outage standalone SHA256 `213ce6912ab176dc3bf4878b3476a53e60761e7166c33941dec7a73344c061fd`. Evidence `/tmp/carpe-pr10-883-outage-inheritance.json`.

`outage.js` itself is unchanged from3af2712 and was read here for all five time-field declarations (arrived/found/told/restored/damagetime) and shared mount/storage options. The runner change replaces a duplicate shared-checklist entry with the new real-browser suite; it does not remove checklist coverage. The old whole-outage scoped report found no additional outage-specific Important defect but did not approve the inherited engine. The old data-loss/time findings can therefore be closed at their now-shared corrected source, while the remaining guard registry issue is also inherited. **No new full outage browser suite or full same-head outage gate ran here**, and no whole-stack, source-procedure or release approval is claimed.

## Scope, limits and next

The correction changes the shared engine/UI, two scoped CSS rules, checklist QA/new real-browser QA, runner registration, count/provenance guide text and normally rebuilt app. It adds no storage key, job field/schema/version, RF formula, company value, package/Android or release behavior. Existing safety prompts still open with Follow company policy and explicitly say a supervisor/safety officer has not reviewed them. Existing outage wording still requires supervisor review against the operator's procedure before coworker use. Technical development merge and software tests do not satisfy either release condition.

Tools used: GitHub read metadata/timeline; local Git/Node/Python; actual Chrome DevTools MCP; Superpowers verification and systematic-debugging guidance. No source/author-branch/GitHub writes, dependency changes, private-file access, child agents, APK/signing or deployment.

Prepared **but not started** `/tmp/carpe-pr10-883-full-gate-run.py`, AST/static identity checked. Unique full prefix `/tmp/carpe-pr10-883-full-{gate.json,proof.json,gate.md,layout.json,smoke.json}` avoids the narrow proof namespace. Expected detached checkout and app hash are pinned. It preserves the coordinator's proven3600-second per-suite/no-outer-timeout, no-install/no-restore, tracked/source/generated/semantic-staged/HEAD-tree/README/lock/dependency/clean/fresh-report/raw-index-diagnostic guards. Root instructed **no full B7 gate until the guard finding closes on a new current-base head**. Reconfigure/review the wrapper for that actual successor before START.

Current narrow proof `/tmp/carpe-pr10-883-scoped-proof.json`; initial inventory `/tmp/carpe-pr10-883-before.json`. No full runner, whole layout/smoke, build/regeneration, emulator, physical Android/iPhone, Safari/WebView, RF meter/plant, field or supervisor validation was performed. Parent/root owns formal review, severity adjudication, publication and later exact-head gate/merge.
