# Grok next-build QA handoff

QA follow-up on `grok/next-build-qa`. Codex owns runner registration. These suites are not in `qa/run-pwa.py`.

## Pins

| Item | Value |
| --- | --- |
| Tested production SHA | `22e43d196d132a4a3d89b34da7bbbdb9a9220370` |
| Candidate PR | https://github.com/Goodst3r/Carpe-Noctum/pull/60 |
| Frozen standalone | `outputs/Night_Sweep.html` |
| HTML SHA-256 before | `063abc77c877365be40de796ff6a6d23e4522cb4056c53054d6c96085ede6594` |
| HTML SHA-256 after | `063abc77c877365be40de796ff6a6d23e4522cb4056c53054d6c96085ede6594` |
| Previous integrated QA SHA | `a23fab9f0350746d1b356c68d72faf6d4829d6bb` |

The QA branch checkout still contains the older committed standalone (`844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137`). That file was not the test baseline. Suites ran from a detached worktree of `22e43d1` at `/tmp/carpe-candidate`, where `NIGHTSWEEP_RELEASE_TEST=1` makes `qa/build2-source-harness.cjs` load the frozen HTML. Each suite exits 1 if that variable is not `1`.

Candidate checkout after the four runs: HTML digest unchanged. No generated PDFs or matrix sidecars under `qa/fixtures/carpe-next/`. The only dirty paths were the QA files copied in for the run. Production sources, `outputs/Night_Sweep.html`, and `qa/run-pwa.py` were not edited.

## Commands and results

Worktree `/tmp/carpe-candidate`, `NODE_OPTIONS=--max-old-space-size=4096`, `NIGHTSWEEP_RELEASE_TEST=1`.

| Command | Exit | Reported checks |
| --- | --- | --- |
| `node qa/carpe-next-nav-legacy.test.cjs` | 0 | 45 |
| `node qa/carpe-next-rf.test.cjs` | 0 | 67 |
| `node qa/carpe-next-onx.test.cjs` | 0 | 34 |
| `python3 qa/carpe-next-pdf.test.py` | 0 | 18 Python, plus 32 inside the bridge |

Logs:

```
Grok nav-legacy: 45 checks
Harper RF: 67 checks
Lucas ONX suite: 34 checks
```

PDF stdout:

```
PASS invariant generator hashes match across directories
PASS page /Rotate is 90
PASS CropBox is distinct from MediaBox
PASS CropBox origin is nonzero
PASS CropBox upper corner is nonzero
PASS original markup text is on the page
PASS source has one text annotation
PASS annotation contents preserved on the source
PASS generator did not write PDFs into the checkout
PASS NightSweepMapPDF plan/export on frozen page (32 bridge checks)
{"checks":32,"matrix":[0,1,-1,0,760,36],"marker":"SYNTHETIC ORIGINAL MARKUP","annotation":"Existing annotation"}
PASS bridge executed frozen-page checks
PASS exported page keeps /Rotate 90
PASS exported page keeps the distinct nonzero CropBox
PASS export preserves original markup text
PASS export preserves the original annotation
PASS annotation text still present
PASS overlay uses the rotated/cropped inverse viewport matrix
PASS bridge left the original file bytes unchanged
PASS export left the checkout free of generated PDFs
Benjamin PDF suite: 18 python checks
```

No production defect. Nothing was skipped, noted, or weakened to pass.

## What each suite actually executes

### Navigation — production page, not source text

`qa/carpe-next-nav-legacy.test.cjs` boots the frozen page and asserts:

- `WorkflowUI.current()` is `calculators`, the calculator panel is visible, `state.job` has no id, and `hfc-named-jobs-v1` is empty.
- A Route & sweep control exists. There is no `[data-main-tab="field"]` and no `WorkflowUI.groups.field`.
- Visible main-tab and task-tab labels do not contain Field, Leakage, or daily, including after clicking home, plan, tools, and closeout. One click of `[data-main-tab="plan"]` sets the screen to `route`.
- `WorkflowUI.go('leakage')` returns `calculators`. `WorkflowUI.go('field')` returns `route` and does not create a Field tab.
- `#powerPmBookTitle` is present but inside a hidden section. Voltage drop stays under Tools.
- `openProjectText` loads `qa/fixtures/legacy-0.1-project.json` (job `SYNTHETIC-UPGRADE-011`). The `#save` click captured by the harness downloads a project JSON that keeps the job, frequencies, levels, rows, cable, and power rows. That export opens again.

Not asserted: disappearance of the sample three-tap example route, screenshot layout, or runner registration.

### RF — engine calls, numbers derived outside the app

`qa/carpe-next-rf.test.cjs` calls frozen `catalog`, `StationView.targets`, `HFC.gainBudget`, `RouteWorkbench.measuredGain`, the pad/EQ solver, and `CompanyTargets.targetAt` / `compare`. Expected values are in the file header. Results cross the JSDOM boundary with `app.json` so `node:assert` is not comparing a value to itself.

- GainMaker `active_gm_hgd`: forward 54–1002, return ceiling 42, published screening gain 43, station split `42`. AOI `active_aoi_hgd`: forward floor 258, return ceiling 204, published gain 49, station split `204`.
- 42/54 main budget, flat launch 10 dBmV, zero-length span, entered gain 31/31, loss 0, targets 43/43: input 10, predicted 41, required gain 33, margin −2, main limit null.
- Independent aux leg: gain 20, loss 1, targets 35, limit 40: predicted 29, margin −6, limit margin 11. Aux target 30 is not the main target 39.
- Blank amplifier target stays null and does not invent a margin. Company profile `company-42-20261113` does not fill that target and warns that the amplifier target is unknown. Entered 0 stays 0. A low-frequency target at 55 suppresses the 54 MHz target.
- AOI available gain at 54 is null. GainMaker available gain at 1218 is null. AOI at 258/1218 with gain 20 predicts 30.
- Blank measured input, blank bandwidth, and blank test-point correction are null, not zero.
- Pad/EQ context: port plane, SC-QAM, 6 MHz, 75 ohm. Cisco OL-31156-01 / SA 716336 Rev D, linear MHz interpolation, gap ratio 1.5. Installed pad 6 and EQ 9. Derived pick is EQ 4.5 and pad 7. After levels 38.98888888888889 and 48.93333333333334. AOI has no sourced profile and refuses. Mixed SC-QAM / OFDM PLC refuses.
- Company formulas: `L(f)=32+11*(f-54)/699` gives 32 at 54, 37.5 at 403.5, 43 at 753, null at 754. `H(f)=34+15*(f-261)/954` gives 34 at 261 and 49 at 1215. A split mismatch is not applicable and is not acceptance. A blank company measurement stays null.

### PDF — generator plus frozen `plan` / `exportPDF`

`qa/fixtures/carpe-next/generate_pdfs.py` uses public ReportLab only. `Canvas(..., invariant=1, pdfVersion=(1,4))`, `setPageRotation(90)`, and `setCropBox((36, 36, 760, 580))`. It writes only into a caller temp directory. `__main__` uses `tempfile` and does not leave a PDF in the checkout. Two directories hash equal. pypdf reads `/Rotate` 90, a CropBox distinct from the rotated MediaBox with a nonzero origin, the marker `SYNTHETIC ORIGINAL MARKUP`, and one annotation whose contents are `Existing annotation`.

`qa/carpe-next-pdf-bridge.cjs` then calls frozen `NightSweepMapPDF.plan` and `exportPDF` twice. Confirmed active `ACT1` and terminal `EOL1` are tombstones on page 1. Proposed unconfirmed `SKIP` is skipped. The active tombstone includes both main and aux lines; the EOL tombstone says End of line and does not include the aux line. Adjacent x is the anchor plus `12 * scale` when the box fits. For each of those tombstones, y is compared with the unclamped centering formula computed in the test from its own viewport, not copied from `tomb.y`:

`y = max(6*scale, min(view.height - tomb.height - 6*scale, tomb.anchor.y - tomb.height/2))`

`eq` already counts the check and accepts a numeric difference of at most `1e-6`, so the follow-up does not add a second `checks += 1`. That is why the bridge reports 32 checks, two more than the previous 30. Repeat export bytes match. Original `Uint8Array` and owner JSON are unchanged. Exported page keeps rotation 90, the same CropBox, and the annotation text. The content stream contains `0 1 -1 0 760 36 cm`, the inverse of the PDF.js 5.4.624 viewport copied from `night-sweep/vendor/map/pdf.js` for CropBox viewBox, rotation 90, userUnit 1, scale 1.

JSDOM has no `URL.createObjectURL`, so the bridge evals the page's packed `pdf-lib.js` onto `window.PDFLib`. Production `writer()` uses that global before it tries a blob URL. This is the packed asset, not a reimplementation of `plan` or `exportPDF`.

### ONX — parser checks are separate from the job path

Parser only: `EvidenceCore.parseText` on `onx-scqam-ofdm-distinction.csv` returns SC-QAM-CH1 35.5 at 57 MHz, OFDM-PLC 32.1 at 601.5 MHz, and OFDM-BLOCK 30.8 at 650 MHz as different rows.

Production path, not a hand-built array swap: `EvidenceUI.importFiles`, `verifiedParse`, `PortSweeps.replace` / `sample`, `saveLocal` / `loadState` (`hfc-route-v1`), `exportProject`, and `prepareImport`.

- Port A from `onx-valid-sweep-port1.json` keeps four points; sample at 54 is 35.2. Port B from `onx-valid-csv-port2.csv` keeps four points and its first level is 34.
- Replacing port A (35.2 → 36) leaves port B's JSON unchanged and keeps four points on each port.
- `onx-invalid-malformed.json` stays an attachment whose message matches malformed/JSON. `PortSweeps.replace` throws and the prior `portSweeps` JSON is unchanged. A blank point `[[54,'']]` throws `/blank is not zero/` and does not change the job.
- Port A basis stays `sc-qam`. A separate replace with basis `ofdm-plc` stays `ofdm-plc`. Basis `ofdm-block` is rejected.
- Autosave strips the cached OneCheck preview back to an attachment. `verifiedParse` rebuilds the three channel rows. Portable import keeps every replaced point, the other port's frequencies, and the original checksum.

JSDOM 26 `Blob` has no `arrayBuffer`. The suite patches `Blob.prototype.arrayBuffer` from the jsdom buffer, then calls the production importer. Returned arrays are JSON-round-tripped before `node:assert` because JSDOM arrays fail `deepEqual` across realms.

## Vertical placement follow-up

Claude's review showed the bounds check still passed after shifting tombstone `y` by +30. The bridge now asserts the production centering formula from `night-sweep/map-pdf.js` (no saved position).

Mutation, scratch copy of `outputs/Night_Sweep.html` only, then restored:

- Replaced the one `tombstones.push({...,x,y,` with `x,y:y+30,`.
- `python3 qa/carpe-next-pdf.test.py` exit **1**.
- Failure: `ACT1 vertically centered on symbol (clamped) expected 76 got 106`.

HTML SHA-256 before the mutation, after restore, and after the four unmutated suites: `063abc77c877365be40de796ff6a6d23e4522cb4056c53054d6c96085ede6594`. Unmutated exits on that restored file: nav 0 (45), RF 0 (67), ONX 0 (34), PDF 0 (18 Python + 32 bridge). No PDFs left under `qa/fixtures/carpe-next/`. `qa/fixtures/carpe-next/README.md` does not state check counts, so it was not edited. Production sources were not changed.

## Defects

None on `22e43d196d132a4a3d89b34da7bbbdb9a9220370`. The earlier `test_generator_stable` hash mismatch was the generator (`Canvas` without `invariant=1`). It is fixed in this QA commit and is not an app defect.
