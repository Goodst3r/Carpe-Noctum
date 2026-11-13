# Independent Astra RF review

**Verdict: APPROVE for the scoped RF/workbench review and reviewed map-host follow-ups through `907b273ae461410491ea1c14f1d432c7934ff743`.**

Original complete RF review source: `962d23a8c34c61963cb413502989006ee2d6d9f9`.
That executed verification completed 2026-11-13T09:58:04Z with a clean worktree.
It includes RF fixes from 8764fee and the successful-project-open navigation
follow-up. The later exact-head cancellation review is recorded below; the
original RF evidence remains attributed to 962d23a. This is not a
full combined release gate, physical device, private field, or signing approval.

## Independent evidence

Every original RF-campaign command below exited 0 at 962d23a:

| Command | Actual checks |
|---|---:|
| `node qa/route-rf-independent.test.cjs` | 58 independently authored assertions |
| `node qa/route-rf-independent-ui.test.cjs` | 17 independently authored DOM assertions |
| `node qa/route-workbench.test.cjs` | 38 |
| `node qa/route-workbench-ui.test.cjs` | 56 |
| `node qa/route14.test.cjs` | 34 |

The independent DOM script assembles the actual source in the repository's
JSDOM harness, dispatches actual input/change handlers, and inspects resulting
engine/state/display values. It is not physical browser/WebView evidence.
The two independent test files above retain the reviewed assertions and derive
repository paths from `__dirname`; no machine-specific checkout is required.
The UI suite supports `NIGHTSWEEP_RELEASE_TEST=1` to test the frozen standalone.
No production files were edited by this reviewer. Existing raw data/jobs/signing/private configuration were untouched.

Wolfram Context and the Wolfram Language evaluator were actually invoked using
synthetic values only. The Context natural-language query interpreted logarithmic
unit subtraction as a voltage-difference operation and was unsuitable; its result
was not used. The explicit independently specified evaluator calculation was:

```
20 Log[10, 10^(43/20) / 10^(10/20)] = 33
{31-(43-10), 31-(43-10)} = {-2,-2}
10 + 20 = 30
40 - (10 + 20) = 10
{43 + 2 - 10, 31 - (43 + 2 - 10), 10 + 31 - 2} = {35,-4,39}
```

This confirms the arithmetic at matching planes, not manufacturer capabilities
or field applicability.

## Verified behavior

- At both 54 and 860 MHz, input 10/target 43/available net gain 31 requires
  33 dB and gives -2 dB margin; both outputs are 41 dBmV. A 2 dB additional
  output loss enters once: required 35, margin -4, predicted output 39.
- Sufficient gain with unknown output capability is **Gain available · output
  limit unknown**. Low reserve remains distinct. Known target-limit and
  configured-output-limit exceedances are both retained as output-limit results.
  Gain feasibility is separate from output capability; no full RF acceptance
  is inferred from the gain label.
- Published catalog gain alone leaves actual gain unavailable, with reference
  screening identified separately. No catalog scalar becomes a flat curve.
- Main, auxiliary and optional-output configured gains/losses drive their own
  downstream ports. A missing auxiliary curve leaves only that branch unknown.
- Missing length/slack, unavailable cable construction/curve, unverified active
  or passive model, proposed/absent equipment, draft connections, unverified
  launch and unavailable high marker all block the affected path. Specific
  path reasons propagate downstream while a separate confirmed sibling works.
- Raw TP input 10 with explicit +20 correction remains raw 10, corrected 30;
  direct output 40 gives measured gain 10. A correction attached to a direct
  port is not reapplied. Missing correction/plane, mismatched frequencies and
  out-of-domain frequencies return unknown. Saved frequency remains separate
  from the displayed current marker; stale readings cannot produce a comparison.
- Source UI checks cover common input across legs, per-leg records, Before/After,
  pad values, incomplete-record save/reopen, exact selected station/leg context,
  and legacy GaN equipment/export retention. Catalog diff retains numeric source
  data and IDs, changes standard field labels, and retires dedicated GaN from
  new selections without deleting saved equipment.

## Findings found, corrected and independently rechecked

1. **High — stale model evidence reused after replacement.** At 980545a,
   HGD→manual LE retained the HGD auxiliary 35/35 gains and 50/50 limits. The LE
   displayed **Can make gain**, output 45/45 and limits within range despite no
   LE gain evidence. Now the prior model's workbench and operating configuration
   are archived, the new model's working values are blank, and the result is
   **Needs input**. Raw prior records remain in history. Unsupported stored legs
   are rejected. Main output limits and additional loss are also cleared/archived;
   entering new gain leaves output capability unknown until independently entered.
   Model-binding mismatches also block engine main/aux outputs and descendants.
2. **High — map confirmation survived input edits until blur.** At 980545a,
   typing length 100 kept connection/review confirmation true and produced
   9.55418394145835 dBmV input before blur. Now the same input event immediately
   clears confirmation and review resolution and returns null prediction.
3. **Medium — invalid frequency comparison.** Matching -1 MHz readings formerly
   returned measured gain 30. Final helper rejects outside 5–1800 MHz, including
   independently checked -1 and 1801 MHz.
4. **Specific-reason gap.** Empty span and missing cable formerly produced only a
   generic input-unavailable message. Final output distinguishes missing/invalid
   span/slack from unavailable cable construction/loss curve and propagates it.

No remaining blocking finding was found in this scoped final review. Broader
whole-app/rendered checks and the exact combined gate belong to the lead. Private
HA0005, physical phones, and employer acceptance remain untested here.

## Reproduce the independent evidence

After integrating the reviewed source and these tests:

```sh
npm ci --prefix qa/runtime --no-audit --no-fund
node qa/route-rf-independent.test.cjs
node qa/route-rf-independent-ui.test.cjs
NIGHTSWEEP_RELEASE_TEST=1 node qa/route-rf-independent-ui.test.cjs
```

The last command requires the normal standalone build first. The source UI
assembly supplies empty map-library asset JSON because these assertions exercise
RF and editing, not file recognition; dedicated map browser tests cover the
actual embedded libraries. Completion lines are `Independent route RF: 58 checks
passed` and `Independent route RF UI: 17 checks passed`. Assertions were preserved
from the independent review; only paths, diagnostics, formatting and guaranteed
JSDOM cleanup changed during promotion.

Promotion verification: a disposable checkout of combined source
`b046d646bd15c78b56316b7a943673d4a27691d3`, with freshly installed locked QA
dependencies, ran both promoted suites successfully: 58 engine checks and 17
DOM checks. The same 17 DOM assertions also passed with
`NIGHTSWEEP_RELEASE_TEST=1` against the combined standalone supplied by the lead.
No checkout-specific path or temporary helper is required by either test.

## Exact-head cancellation follow-up

Reviewed `962d23a..d62946b7b36f553489ba00ede530c8367aed0a74` independently.
Only the map host callback and its regression test changed: declining replacement
returns false, while successful application returns true. The RF engine and app
files are byte-identical across these heads (`git diff --quiet` exit 0); the
route-workbench code before `initMapWorkbench` is also byte-identical by an
executed comparison. No RF formula, measurement, model, or capability logic
changed. The final host delta's `node qa/route-workbench-ui.test.cjs` passed
**60 checks**, exit 0, at d62946b. Scoped approval therefore extends to this exact
head without representing the original 58/17 RF assertions as a new d62946b run.

The companion importer change was tested independently with an actual synthetic
PDF file-picker upload and launch/destination selection. The new test first
failed on the misleading success message after the host returned false; after
the fix it displays cancellation and leaves the host's existing route alone.
The full map browser suite passed **51 checks**, zero HTTP(S) requests. This is
separate importer evidence; combined release/physical-device acceptance is not
claimed.

Frozen standalone used for promoted-test release-mode verification:
`2388d07e8f80574535172a4102b29dd557b35b27d3ca5e6db7d499d082578510`.

## Exact-head context and historical-record follow-up

The subsequent `d62946b..67f25d82abfeaf8902a7930425436b804d4897a4` delta was
read and tested independently. RF engine/app files remain byte-identical; an
executed byte comparison also confirms the assessment, measurement, selected-leg
and editor helpers before `routePointSummary` are unchanged. Changes add strict
job-state context validation to the map host, fresh route IDs with remapped
parents, preservation/display of previous routes and station records, and
clearing of old launch identity/levels/corrections for a newly imported source.
The executed `node qa/route-workbench-ui.test.cjs` passed **84 checks**, exit 0,
at 67f25d8, including stale-context refusal, preserved historical station/source
records, parent remapping and portable round-trip. No original 962d23a RF counts
are represented as a newly executed full campaign at this head.

Companion importer checks now pass **26 unit + 60 real offline browser checks**.
The actual PDF-picker cases include cancellation, custom context matching with
the captured token passed to the host, switching jobs during asynchronous
recognition, switching jobs before apply, and switching jobs while the picker
is open. Both new cancellation/context behaviors were observed failing before
their fixes. The stale context removes the draft controls and requests a fresh
read; no callback or added-points claim is made for a different job. Final
combined release, physical device and private field acceptance remain separate.


## Navigation and QA hydration delta review

Scoped verdict: **APPROVE `907b273ae461410491ea1c14f1d432c7934ff743`**,
including `67f25d8..a69fcbed` navigation/documentation/QA updates and the subsequent
source-assembler fix. Review and targeted execution completed 2026-11-13T10:35:18Z.

The engine, route workbench and station sources are byte-identical to 67f25d8.
The three app.js edits change navigation prose only. Other runtime edits replace
retired navigation labels with Route & sweep, Load & what-if and Station records;
no formulas, event flow, saved state or importer behavior changed. The map importer
is owned by the separate map branch and is not changed by these Terra commits.

QA retains all 41 training cases and all seven UI-name cases. Existing numerical
power/RF, portable originals, legacy practice, storage failure and cancellation
assertions remain. Updated active non-main outputs explicitly require null and a
missing-gain reason rather than assuming main-leg gain. The wrong-tab, wrong-button,
retired-name, missing-screen and wrong-group negative validator checks remain and
passed. Other navigation assertions now check the already-reviewed merged route
and power screens; catalog tests retain the legacy GaN profile and explicitly test
current nonretired HGD/HGBT/LE models.

The JSDOM training change replaces only the inert asset block while parsing, then
synchronously restores its complete text before unchanged application scripts run.
Every instance checks exact text, original outerHTML and SHA-256; the bootstrap
removes its temporary global and script. No importer initialization or runtime
library is disabled. The source harness calls the production Python asset helper,
which validates and emits the full bundle. The real browser/file:// decoder and
worker/hash integrity suites are unchanged by the delta.

Independent execution used disposable checkouts, leaving owner worktrees untouched:

- `node qa/training-job.test.cjs`: **41 cases passed**, exit 0, default Node heap,
  55.23 seconds and observed peak RSS 1,502,956 KiB.
- `NIGHTSWEEP_RELEASE_TEST=1 node qa/ui-names.test.cjs`: **7 cases passed**, exit 0.
- `node qa/ui-names.test.cjs` with the updated source harness: **7 cases passed**,
  exit 0.
- `node qa/build3-source-assets.test.cjs`: **6 assertions passed**, exit 0,
  comparing complete source/frozen asset payload SHA-256. This was the owner's
  disposable review regression. The lead retains the equivalent durable check in
  the existing `qa/map-assets.test.py` suite; no duplicate QA suite is required.

Frozen replay used the actual integration standalone from local merge `da8e1a9`,
SHA-256 `63e035d3eed586d587304e712ea0ec01bb64e1fbef8ac442d0639f9b6236d40d`.
The earlier 58/17 independent RF evidence remains attributed to 962d23a; it was not
represented as rerun at this QA-only head. This verdict covers the reviewed delta,
not the final combined gate, physical device testing or unavailable private maps.
