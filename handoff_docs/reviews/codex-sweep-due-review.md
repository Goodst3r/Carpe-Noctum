# A3 Sweep due — current independent review

**Current reviewed clean head: `52fac6902d2f2872ec28ca42115589df814cf5a3`.** Detached review worktree `/workspace/carpe-a3-review`; author worktree `/workspace/carpe-sweep-due`. Current standalone SHA-256 **`9ae7f1c393d6d1b1fbe9fc89e0b1a30010fbdae7ea80dcb77c7255577d894e01`**. PWA content version `7e4e4389e027a22e31a0`, 20 offline assets / 22 generated files.

**Current spec verdict: PASS. Current quality verdict: APPROVE. Open findings: NONE. The keyboard-pagination P3 is CLOSED.** Required full final-head automated gate and whole-app layout/smoke remain with root, as do integration, metadata and publication. This scoped review is not a substitute for those checks or a release/device claim.

The substantive review below remains explicitly attributed to **1020e773 / d0fd54…4966e**: its **40,746 independent calendar comparisons, 14 reviewer-owned frozen behavior groups, omitted-today/guide checks and original MCP receipts were not blindly rerun or relabeled as new-head execution**. Source diff confirms the calendar, collection, interval parsing, persistence, registry, training and authored docs are unchanged in this successor.

## Narrow successor assessment and own evidence

Read the updated `/tmp/carpe-a3-implementation.md` addendum before finalizing. Examined the entire `1020e773..52fac690` diff: only the focusable page/range `h3`, its text/visibility and focus/scroll destination, the focused keyboard QA regression, generated standalone/PWA index/release and hashed worker changed. No guide/status/lane/registry or unrelated source delta. Author's reported source33/frozen33/layout121 and 139-hash rebuild were read as author evidence; they are not presented as my executed totals.

The correction at `night-sweep/sweep-due.js:87`, `:97`, and `:112` adds persistent `h3#sweepDuePageSummary` before the new cards, with `tabindex=-1`. Pagination updates the page/range, then focuses that contextual heading with `preventScroll` and scrolls it to the start. This removes the prior BODY-focus gap without changing data or interval edit behavior. The regression uses actual browser Enter events across both navigation directions and checks boundaries, visibility, focus and storage equality.

Own command:

```sh
python3 /tmp/carpe-a3-focus-review.py > /tmp/carpe-a3-focus-review.log 2>&1
```

**PASS:** actual Chrome DevTools MCP **1.13.0** at **320/360/390/430 px**, using its actual **fill** and **press_key Enter/Tab** actions. Own synthetic fixture has 19 distinct saved sources plus distinct current work, each with three real Station targets: **60 stations / three pages**. At every width:

- Actual interval fill `0018` leaves the interval focused and raw text intact.
- Enter on Next moves to page 2; Tab reaches Previous, then Next; Enter moves to last/page 3. Tab reaches enabled Previous; Enter returns to page 2; Tab/Enter returns to first/page 1; Tab reaches enabled Next, skipping disabled Previous.
- All **16 transitions** across the four widths focus the visible `sweepDuePageSummary` heading before the cards, with the correct page/range. The heading is inside the viewport, never BODY. Bounds are **25/25/10** rows for my 60-station fixture; first/last direction disabled states are correct. Complete counts remain 60.
- Full state, current Station record, Station read records and both existing storage keys remain byte-identical to the pre-navigation snapshot; every transition records **zero Storage.setItem calls**. The interval remains `0018` and no horizontal overflow appears.

No console errors. Browser/server were closed. Tools actually called: new_page, list_pages, emulate, evaluate_script, take_snapshot, **fill**, **press_key**, take_screenshot and list_console_messages. Full receipt `/workspace/.tools/chrome-devtools/checks/a3-focus-review-results.json`; log `/tmp/carpe-a3-focus-review.log`. Visually inspected `/workspace/.tools/chrome-devtools/checks/a3-focus-review-page1-390.png`, showing focused visible page/range context followed by labeled synthetic Station cards. Accessibility snapshot `/workspace/.tools/chrome-devtools/checks/a3-focus-review-page1-390.txt`.

Own build-delta command:

```sh
python3 /tmp/carpe-a3-focus-build.py
```

**PASS:** a read-only Python assembly matching `night-sweep/build.py` exactly reproduces the current frozen standalone bytes/hash; in-memory execution of `build-pwa.py` up to its filesystem-write section exactly reproduces **all 22 current generated files**, content version and 20-asset set. This verified the generated delta without changing any source or generated artifact. Receipt `/tmp/carpe-a3-focus-build-results.json`.

`git diff --check` passed. Both author/review heads were checked at the named successor, and review porcelain status is empty after the probes. No source/GitHub/full gate/private-file/child-agent write or run. Prior automated/math scope and physical-device/native/Safari/WebView/hardware/field limitations remain as recorded below. Root may proceed to its required final-head gate; there is no remaining reviewer finding.

---

# Historical substantive review at 1020e773

Reviewed November 11, 2026 at **1020e7731b518a9b43c24043c11ee2e7ffe00952**, detached worktree `/workspace/carpe-a3-review`, against reviewed build3 base **5588a49b10292bed422b7597ec227bce38173a2d**. Frozen standalone SHA-256 **d0fd54c6869ab86ea11fa5048898b0156e2b6db0990d5a9febee7ff793b4966e**. Author source `/workspace/carpe-sweep-due` was at the same clean head when checked. Review worktree remained clean; its sole setup addition is the ignored symlink to the existing locked QA dependencies. No source, metadata, GitHub, private-file or integration-branch write; no child agents, dependency install, full gate, whole-app layout or smoke.

**Historical 1020 verdict: spec PASS; quality APPROVE WITH ONE NONBLOCKING P3 (closed in the current successor review above).** No blocking math, data identity, persistence, import atomicity or current-work labeling defect found. The required broad final-head gate and cross-lane integration remain coordinator responsibilities; this is not a merge/release approval or a replacement for that gate. Root assigned the P3 correction to the author; the narrow successor review above closes it while preserving this substantive evidence.

Read `/tmp/carpe-a3-scope.md` first, then the supplied calendar reference, supplied diff, final implementation report `/tmp/carpe-a3-implementation.md`, AGENTS, ordered project instructions/status/build notes, parallel plan/rules, both lane statuses, known gaps/tools, item 10, and affected app/Jobs/Station/registry/navigation/training/QA/docs source. The implementation report was read before this verdict. Superpowers verification guidance was used; skill invocation is workflow guidance, not a test. Local Node/Python/Git and actual Chrome DevTools MCP were the execution tools. No external maintenance-source verification or Figma file was claimed.

## Historical finding — closed at 52fac690

**P3 — preserve contextual keyboard focus when changing pages.** `night-sweep/sweep-due.js:97` replaces the focused pagination button through `innerHTML`; `:111` scrolls the list without assigning focus to the newly displayed page.

Concrete independent reproduction on the frozen 1020 app using actual Chrome DevTools MCP 1.13.0 at 390 × 844:

1. Seed invented complete-practice Station records: three installed stations per job; provide 19 distinct synthetic snapshot jobs plus distinct current work, for **60 stations / three pages**.
2. Focus `[data-sweep-due-page="next"]`, then send MCP **press_key Enter**.
3. The page correctly becomes **Page 2 of 3 · entries 26–50 of 60**, but `document.activeElement.tagName` becomes **BODY**.
4. Send MCP **press_key Tab**. Focus lands on the new **Previous** button at the bottom and scrolls to **scrollY 14600**, so the newly displayed page start loses keyboard reading/focus context.

Data/counts/pages remain correct and reachable, so this is nonblocking. Preserve focus on a useful contextual page heading/summary, expose the new page/range, and test real Enter/Tab navigation for Next and Previous, including the final page. This was communicated directly to `/root/implement_a3_sweep_due` with the exact reproduction. Evidence: `/tmp/carpe-a3-review-devtools.log` and `/workspace/.tools/chrome-devtools/checks/a3-review-independent-results.json` (final two evaluations). No correction is included in this 1020 verdict.

## Substantive source assessment

- Uses real `StationView.targets()` and cloned `records()`, matching holder identity, point, equipment and installed context. It displays the launch station and missing worksheets; removed/replaced targets do not borrow archived observations. Current data overlays only a unique matching nonempty saved job ID. Repeated/missing IDs retain separate index-scoped sources with diagnostics; separate copied jobs retain separate history even with shared Station IDs.
- Sweep and balance events stay independent. Current colors require current/writable binding, checked sweep and a valid nonfuture civil date. Legacy-unconfirmed/retired UBT/read-only, unchecked, blank recorded date, invalid, future and overflow cases remain neutral. Metadata, calculator results and captured history are not event substitutes.
- Only actual interval input edits create the optional raw-string setting. Strict digits-only 1–1200 parsing is shared with the registry; unknown remains blank, invalid raw text remains visible, and the import guard rejects malformed optional shapes before replacing state. Preference-only work is retained by the existing working-job guard. Existing keys/schema/version and durable paths remain intact.
- The company interval has no default. Warning/range/calendar/older-18-month rows are Unknown/unverified; UI/source sheets make the app policy and older Hranac attribution limits clear. The 18-month example is synthetic practice, not a verified company cadence or RF acceptance. Counts clearly separate practice/sample from work.
- `collect` requires explicit civil today; `readView` is the local-device-date adapter. Source reads/rendering do not open jobs, alter dates or selected Station, or autosave. Refresh/resume paths reread the actual sources. The optional preference applies to this view of all jobs and is labeled as saved with the current working job.
- DOM output is bounded to 25 entries while full source/station/status counts remain visible and all pages are traversable. New controls have separate source buttons and readable labels. The current guide/feature coverage includes Leakage 42, Sweep due 43, 26 screens, 43 feature choices, six-active 15 and custom 12 steps. Existing unrelated status/D4 text remains root/Lane B reconciliation scope.

## Reviewer-owned independent calendar evidence

Command:

```sh
NIGHTSWEEP_RELEASE_TEST=1 python3 /tmp/carpe-a3-independent-math.py
```

**PASS: 40,746 independently generated classifications compared against the complete frozen app**, checking status, completed-month age, warning date and due date. Reference logic was written for this review with Python stdlib `datetime.date` and `calendar.monthrange`; it did not import the author's reference or application math. It separately computes month-index anniversaries from the original date, clamps days, uses integer ceiling `(2*N+2)//3`, and checks age against the original-date anniversary. Receipt: `/tmp/carpe-a3-independent-math-results.json`.

Coverage includes original month-end dates, before/on/after warning and due boundaries, intervals 1/2/4/5/7/18/1199/1200 plus 1,500 deterministic random dates/intervals; years 1/4/99/100/400/1899/1900/1999/2000/2023/2024/2099/2100/2400/9998/9999; February/century/leap rules; future dates; completed clamped anniversaries; overflow beyond year 9999. All matched. An earlier direct-module replay of the same 40,746 cases also matched; these are not extra distinct cases.

Separate module subprocess checks rejected **14 malformed/impossible civil dates**, including 1900/2100/2025 February 29, April 31, month/day zero/overflow, year zero/10000, unpadded/whitespace/datetime text. Four timezone runs (UTC, Kiritimati, Los Angeles, Lord Howe) produced identical explicit civil-date classifications, including US DST-transition calendar dates. At `2026-11-11T00:30Z`, deviceToday was Nov 11 in UTC/Kiritimati and Nov 10 in Los Angeles; the explicit Nov 10/11 warning boundary was green/yellow. These timezone subprocesses execute the authored pure module, not separate browser instances. Calendar source inspection confirmed no elapsed-day/millisecond or 30-day-month arithmetic.

## Reviewer-owned focused automated evidence

Command:

```sh
NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a3-independent-behavior.cjs
```

**PASS: 14 reviewer-owned frozen-app scenario groups**, with no jsdom errors. Log `/tmp/carpe-a3-independent-behavior.log`; receipt `/tmp/carpe-a3-independent-behavior-results.json`. These intentionally differ from the author's whole suite:

- Real 42/54 complete-practice launch and route events; balance age independent from a 20-month sweep.
- Explicit-date collection with an unusable clock when metadata has its own date; unique current overlay; independent copied history; repeated/missing IDs and null source preserved visibly.
- Changed launch active context cannot borrow the former source date; one invalid Station owner is isolated with a visible reason while another owner remains readable.
- Balance-only/unchecked/blank/invalid/future and binding-unconfirmed events remain neutral with preserved text.
- Old job with absent optional setting: screen entry and Refresh cause **zero Storage.setItem calls** and do not create the setting.
- Actual unreadable named-job storage: corruption remains byte-for-byte, a visible saved-source error appears, readable current work remains, and state/autosave are unchanged.
- Actual save/duplicate APIs: raw `00018` survives; distinct job copies sharing Station IDs retain independent dates; state, Station records/current selection, named-library bytes and working-autosave bytes remain identical around tracker reads/entry/refresh.
- Actual asynchronous `openProjectText` rejects null/array/numeric/unknown-property/overlong optional preferences before changing current state, library or autosave.
- Full JSON export and fresh-boot autosave restore preserve raw preference, synthetic provenance, **exact Station map and normalized Station read records**.
- All three pages of 60 stations are traversable; complete counts remain visible and job headers appear on continued groups; runtime registry/feature counts/maps match the scoped requirements.

An additional direct frozen-app omitted-today probe confirmed all seven installed stations return neutral/unavailable reminders with blank collector today and no due date. The source default was inspected at `sweep-due.js:49`.

Command:

```sh
NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a3-review-guide.cjs
```

**PASS:** exactly one of every 43 runtime feature markers; Leakage 42 and Sweep due 43 in runtime/current guide; 26 screens; every current rendered H2 listed in the TOC; unique rendered IDs and resolving local fragments; identical main README copies. Receipt `/tmp/carpe-a3-review-guide.log`.

Read-only Python builder-equivalent assembly (same module order, Python JSON serialization and DSIM replacement as `build.py`) exactly matched committed frozen bytes/hash. `git diff --check` passed; both pinned worktree heads and empty porcelain status were checked. A first JS-harness byte comparison differed only because JS serializes catalog `4.0` as `4`; it was replaced with the correct Python builder-equivalent comparison, not reported as a generated-app defect. A first guide audit assumed all preexisting marker order was identical to runtime order; the correct coverage/explicit-number requirements above passed after correcting that reviewer-only assumption.

## Reviewer-owned actual rendered evidence

Command:

```sh
python3 /tmp/carpe-a3-review-devtools.py > /tmp/carpe-a3-review-devtools.log
```

Actual installed **Chrome DevTools MCP 1.13.0**, JSON-RPC stdio through the supplied bridge, isolated headless `/usr/bin/chromium`, temporary loopback server, synthetic data only. Tools invoked: new_page, list_pages, emulate, evaluate_script, take_snapshot, take_screenshot, list_console_messages and **press_key**. Browser/server were closed.

Own measurements at **320/360/390/430 px**: no horizontal page overflow, all visible new controls at least 44 × 44 px, one clean interval label, zero source buttons inside labels. Rendered cards distinguish launch/source and route points, separate sweep/balance dates and ages, Due/overdue versus unchecked/future unavailable rows, and synthetic totals. `18x` remained visible/focused, showed the nearby invalid message and yielded zero colored reminders. The opened warning-policy sheet showed Unknown, unverified conditions/formula and no cadence claim. No console errors. Actual keyboard pagination exposed the P3 above.

Visually inspected own 390 px screenshots:

- `/workspace/.tools/chrome-devtools/checks/a3-review-390.png`
- `/workspace/.tools/chrome-devtools/checks/a3-review-card-390.png`
- `/workspace/.tools/chrome-devtools/checks/a3-review-invalid-390.png`
- `/workspace/.tools/chrome-devtools/checks/a3-review-page2-390.png`

Snapshot `/workspace/.tools/chrome-devtools/checks/a3-review-snapshot.txt`; complete MCP receipt `/workspace/.tools/chrome-devtools/checks/a3-review-independent-results.json`. An initial reviewer harness seeded before mobile emulation, which reloads the page; reseeding after emulation fixed the harness. No app defect or pass claim was inferred from that setup failure.

## Limits

Did not rerun the author's 33 source/frozen groups, 73 rendered checks or retained suites as my own totals. They were read in the implementation report and are not counted as independent results here. No full automated gate/whole-app rendered layout/smoke, dependency installation, APK, emulator, physical Android/iPhone, Safari/WebView, actual quota exhaustion, maximum-library performance benchmark, meter/hardware, private evidence or field test. No speed claim or external maintenance-policy validation. Root retains full-gate, metadata, fixes and publication ownership. The substantive verdict is pinned to 1020; any successor must be reviewed for its actual delta before claiming closure of P3.
