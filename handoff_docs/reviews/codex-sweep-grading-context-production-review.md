# Independent production render-context optimization review

**Scoped specification and quality verdict: PASS at `41c4db2ea7c6fd550069b5e1c6a88217c1876f61`. No unresolved Important or blocking optimization finding.** This report covers the actual production follow-up, not the earlier scratch candidate,60d integration gate or a later base merge. Root retains full-gate/publication/peer-merge responsibility.

## Frozen source and inspected delta

- Ordinary parent/start: `60d5eeb4aea8e3ae20964401113777e364b16154`.
- Reviewed end: **`41c4db2ea7c6fd550069b5e1c6a88217c1876f61`**.
- Independent detached checkout: `/workspace/carpe-a4-render-context-production-review`; author source/index untouched.
- Grading UI SHA256: `4886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215`, exact previously reviewed candidate bytes.
- Standalone SHA256: `e38d95972d8473cccda1d3422054ebd52b0159cfe9c513d0358298c6ab885c6d`.
- PWA index SHA256: `a8410e3c4b6f99afe279423115a9eb2101757e071e30c88dd14d5c2da2b1d4c7`; content version `9b576dc55089f5dbe8f5`.

Read the complete `/tmp/carpe-a4-render-context-implementation.md`, exact patch/production diff, new committed public regression and earlier characterization/independent scratch reports. No test ran against the active author source before the frozen commit was supplied.

The six-entry committed delta consists of grading UI, one additional QA case and normal standalone/PWA/release/worker artifacts. The new private historical helper preserves all early-return checks and accepts a context provider. The render-local provider lazily creates one context and gives each eligible row a fresh shallow copy. Its lifetime ends with the synchronous render; it is neither stored nor exported. The context has five string members, so its only compact-snapshot substitution cannot mutate the shared raw context through a nested alias. The public one-argument `freshness(r)` still obtains fresh context and ignores extra arguments.

`/tmp/carpe-a4-render-context-production-provenance.json` proves the schema/context prefix, entire grade/signature/context-observer/init/public-export blocks and **twelve critical source/style/registry/training files** exact60d bytes. The complete historical decision/early-return body is also byte-identical after normalizing only the private name/provider substitution. This includes original parsing/archive/SHA logic, core math, Station, Night Log, both App example keepers/validators and Jobs content terms. All prior55 case names/order remain, plus the new public spy case. No persistent cache, verification/result cache, job key/schema/format, source/default/limit, RF formula, decision allowance, version or package change is introduced. Guides/practice/counts are unchanged by this follow-up.

## Own fresh production executions

Every final command below exited zero on exact41c. Existing locked dependencies were accessed through an ignored link; no install or source edit occurred.

| Command | Own result | Receipt |
| --- | --- | --- |
| `node qa/sweep-grading-ui.test.cjs` |**56 source checks passed** | `/tmp/carpe-a4-render-context-production-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` |**56 frozen checks passed** | `/tmp/carpe-a4-render-context-production-frozen.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a4-render-context-production-adversarial.cjs` |**11 independent real-app groups passed** | `/tmp/carpe-a4-render-context-production-adversarial.log` and `.json` |
| `python3 /tmp/carpe-a4-render-context-production-mcp.py` |**23/23 actual Chromium assertions passed** | `/tmp/carpe-a4-render-context-production-mcp.log` and `.json` |

These are new production-head results. The earlier60d22-MCP result, scratch17 independent cases, supplied63 component cases and author's22 browser comparisons are not included in these counts. Author56/56/native69/core93/interop3/3/render88 and rebuild receipts remain separately attributed in the implementation report; root's full runner is separate.

## Independent real-app adversarial coverage

The11 groups boot the real frozen app in jsdom with existing fake IndexedDB, import an invented CSV through real EvidenceUI and grade through real WebCrypto. They do not use the earlier string-sink DOM or synthetic verification-service stub.

-100 validated synthetic historical records render with **one** public `StationView.boundRecords` call; whole job, every record and autosave stay byte-identical. No row is labeled Current by historical warning presentation.
- A stale criterion at the first, middle or last record and reversed history order preserve every other row's correct warning. Expected warnings are independently obtained through fresh public calls. This detects failure to copy the raw context before replacing its compact descriptor.
- Empty history, unavailable originals, missing originals and all-mismatched metadata each perform **zero** historical context builds, preserve the appropriate warning and change no saved data.
- Public `freshness.length` remains1, no private helper is exported and an extra throwing provider argument is ignored. Three calls across raw route change/restoration make three context reads and detect/restore the warning correctly.
- A later render observes direct raw Station changes and restoration; no previous-render context hides them. Owner replacement clears digest ownership; restoring the old owner also requires verification and never promotes history merely by rendering.
- Two real grades make two real `EvidenceUI.verifiedParse` calls and retain the independently computed original SHA/PTV. Ten subsequent renders make no such verification calls and change neither saved data nor histories.
- At **both actual WebCrypto digest windows** (original-byte hash and additional context hash), real Station-handler edits away and back and direct owner replacement reject the pending grade. All four attempts append nothing and leave no Current badge. Their real hash operation resumes after the gate; no hash result or verification step is mocked away. The successful/rejected attempts account for six measured verifiedParse calls in this phase.

The permanent56 suites additionally retain all original save/refusal/formatting, integrity, raw-context, legacy/UBT, optional identity-remap, warm startup and async-guard cases. The new public100-history regression restores all five draft controls through real handlers after its intentional owner reset; the following old cases still execute.

## New actual Chromium verification

Used actual Chrome DevTools MCP1.13.0, isolated sandboxed Chromium, loopback frozen standalone, dark touch/mobile emulation at **320 and390×844**, statistics/CrUX disabled. Every fixture and original byte was invented locally. The100 rows were valid synthetic histories expanded from a real verified grade and persisted through the ordinary save boundary, not100 manual grade operations.

At each width the new23-assertion run established:

- An actual Grade button activation verifies the original CSV and gives raw PTV2.5/pass. One render of100 persisted historical rows calls boundRecords once; every matching row remains correctly historical, with exact whole-job/autosave/history data. Public freshness still performs three independent reads across mutation/restoration and ignores a supplied fake provider.
- Later renders detect raw mutations and restoration. All missing originals preserve lazy zero-call behavior. New-owner rendering clears digest trust, stays Unknown/historical and uses one context on the subsequent steady render. Phone pages do not overflow horizontally.
- A new actual Grade ignores an intentionally tampered cached preview, re-verifies the real original, appends the correct result and leaves99 prior histories exact. Portable original bytes match the independent Python SHA/byte array and exported results remain exact.
- Altering the actual IndexedDB original to same-size different CSV bytes makes a real Grade fail original verification with no append/Current promotion. Restoring the original and explicitly re-verifying/pressing Grade recovers the correct result. Repeated rendering performs no verifiedParse and preserves exact state/store. Each width measures three real verifiedParse calls across this regrade/refusal/recovery sequence.

No Chromium console errors were returned from the retained page. This is new actual-browser evidence for production41c, not transferred scratch evidence. It remains controlled desktop Chromium, not physical-phone/WebView/Safari or native-provider validation.

## Performance conclusion and boundaries

The independently measured improvement is an **operation-count reduction**,100 eligible historical context builds to1 for a steady all-historical render, with matching warnings and unchanged saved data. Lazy early-return histories remain0. A valid Current signature and first owner synchronization retain their own separate context reads; this report does not claim that every possible render performs exactly one total call. Public direct calls remain uncached.

No timing benchmark was run by this reviewer and no universal latency or phone-speed percentage is claimed. The supplied Node string-render medians exclude DOM layout and retain their original attribution. The proposed gain does not justify omitting original verification, weakening context/owner guards or retaining a cache across renders; those boundaries remain intact.

## Preserved reviewer harness failures

The first real-app adversarial attempt passed eight groups, then expected only the grading layer's `changed during verification` wording for owner replacement at the original-byte hash. Real EvidenceUI correctly rejected earlier with `The working project changed…`. The initial failure remains `...-adversarial-owner-error-oracle-failure.{cjs,log}`. The final oracle accepts that earlier owner guard or the later grading guard while still requiring unchanged histories/no Current promotion; final11 pass. No production fix was made for this reviewer expectation.

The first MCP attempt used a descendant `p:first-of-type` selector, accidentally treating nested metric paragraphs as history-warning paragraphs. It passed the initial operation/copy/API checks then failed the warning-text oracle while call counts/state were already correct. The retained `...-mcp-descendant-selector-harness-failure.{py,json,log}` documents that attempt. The corrected oracle reads the first paragraph **of each card**; final23 pass. Neither failed attempt is counted as a passing full run or hidden as a product correction.

The author's separate intentional old100-versus1 RED and temporary draft-cleanup failure remain attributed/preserved in the implementation report. The60d multi-JSDOM diagnostic limitation and unproven exact V8 mechanism remain documented; this optimization is not claimed to fix that behavior.

## Strict final proof and next

`python3 /tmp/carpe-a4-render-context-production-proof.py` exited zero. `/tmp/carpe-a4-render-context-production-proof.json` proves all **653 tracked files** unchanged from the before SHA256 manifest and equal to the exact41c HEAD blobs. HEAD/worktree/staged contents are clean; unstaged/cached diffs and diff-check pass. No test-churn restoration was required.

No broad runner, whole layout/smoke, build, new reference arithmetic/CRC mutant campaign, private original, author source/index edit, commit/GitHub write/push, dependency install, child agent, APK/signing, emulator, physical phone, Safari/WebView, screen reader, meter/RF/reference-plane, supervisor or field test was performed. No manual pixel/screenshot review is claimed. Existing Known Gaps remain outside this bounded change.

Next: root combines this exact41c scoped PASS with its separate final-current-base full gate and any separately reviewed later integration, then publishes accurate receipts/status for Lane B's same-head peer disposition/merge. None of this evidence automatically approves another source head.
