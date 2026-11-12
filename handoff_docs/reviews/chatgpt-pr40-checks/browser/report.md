# Independent PR40 browser review — CHANGES NEEDED

Exact reviewed head: **1c1e5414a40424d6999fafb105d862a7cf939345**, `/workspace/Carpe-Noctum-pr40`.

Own final browser command:

```
python3 /workspace/scratch/pr40-independent-browser/review-browser.py
```

**Exit1:99 checks passed /10 checks failed (109 total), four actual browser downloads.** This is an intentionally red independent review: the ten failed assertions reproduce three distinct product issues below (eight failures across four widths and two separately labeled platform-fault cases). No application runtime errors. Detailed results: `results.json`; raw output: `review-browser.log`; script and all fixtures/downloads/screenshots remain in this scratch directory.

This worker did not edit, build, install, comment, commit, push, fetch or run a gate in the actual repository. Read current WORKFLOW and AGENTS. The root's gate was left untouched. All writes were scratch evidence or isolated browser-profile data. Final actual HEAD remains1c1e541; `git --no-optional-locks status --porcelain` is empty.

## Frozen artifact and browser scope

Copied the already generated `outputs/Night_Sweep.html` and verified it **byte-for-byte against the committed blob at1c1e541 before testing**. Size **2,238,495 bytes**, SHA-256 **99103c87c8693aaf9b386d543d5acc8c22f4265fc7a509bde20b50972f03a9c4**. Source snapshots and metadata are in `provenance.json`, `night-sweep/`, `AGENTS.md` and `handoff_docs/WORKFLOW.md` under this scratch directory. The actual artifact had the same hash at final read.

Used installed `/usr/bin/chromium` through Python Playwright, headless desktop Chromium at **320/360/390/430 ×844**, dark theme, mobile/touch viewport emulation. Navigation uses real bottom Plan/Tools controls and their Supply PM/Limits screen buttons. Export clicks actual `#powerPmExport`, captures the real Blob download event and saves it through Playwright's download API. Import clicks actual `#powerPmImport`, waits for the browser FileChooser and calls FileChooser.set_files with actual scratch files; no fake File object or direct import function replaces that path. Reload is an actual page reload.

No Android/native bridge was injected. Each context was offline; navigation HTML was fulfilled in memory for a reserved `.invalid` origin, and other requests were aborted. No HTTP server, external network call or data transfer occurred. The four actual downloaded files were961 bytes each, with expected filename **CarpeNoctum_Supply_PM_notebook.json**, valid kind/version/personal note and exact saved visit values; per-file hashes are in `results.json`.

The Blob-error and Web Share-cancel cases below are explicitly **platform-boundary fault injections** through the real app/BrowserFiles click path. They do not establish a physical OS picker/share cancellation or Android/iPhone result.

## Finding1 — P1: imported battery labels execute HTML/script when the supply is selected

Locations at1c1e541: `night-sweep/power-pm.js:172` (`escape`), `:123` (accepted battery slot), `:294–299` (visit-table innerHTML).

The helper named escape maps `&`, `<`, `>`, and the double quote to themselves. A valid imported slot within the existing40-character limit can therefore become live markup when painted into a visit row.

Actual FileChooser repro at all four widths:

1. Import a valid notebook JSON containing a visit battery reading with `slot` equal to **`<img src=x onerror=window.p=1>`**, volts13.2. The file otherwise uses normal valid date/chemistry/inverter/numeric values.
2. Select the newly imported **SYNTHETIC literal imported text** supply through `#powerPmSupplyPick`.
3. `#powerPmVisits` contains a live img element, and its onerror handler executes: **window.p becomes1**. The image request is aborted by the offline fixture, so this is a harmless script marker rather than an external transfer.

Observed HTML at320/360/390/430:

```
<tr><th scope="row">2026-11-11</th><td><img src="x" onerror="window.p=1"> 13.2 V</td><td>No earlier reading of the same string.</td></tr>
```

This helper existed before PR40; the new untrusted notebook import exposes the accepted file text to it. The demonstrated impact is execution in the app origin when reading an imported notebook, not merely an incorrectly displayed angle bracket. Correctly encode text or use DOM textContent, and add actual import/select regressions for HTML-looking text; do not silently normalize or discard legitimate raw labels.

Evidence: all four `*-literal-battery-text.json` files, `*-imported-battery-markup.png`, final log/results. The check `imported battery text remains literal without executing markup` fails at all four widths with imgCount1/executedFlag1. No error was added to the app's runtime-error list because the injected marker executed successfully.

## Finding2 — P2: an own saved/downloaded notebook is duplicated on reimport to the same device

Locations: `power-pm.js:157–163` (sameContent/merge), `:115–118` (imported visit field order), `:371` (local Save visit field order).

Actual UI repro at all four widths:

1. Through Supply PM controls, save one **SYNTHETIC browser supply** with two visits/battery readings.
2. Click Export notebook and capture the actual downloaded JSON file.
3. Use Import notebook's actual FileChooser to select that unchanged download, without removing the local supply.
4. Count changes **1→2**, and feedback says **Imported1 supply. Pick one from the list to see its visits.** Expected: existing supply skipped and notebook bytes unchanged.

The comparison strips IDs but JSON-stringifies the remaining visit objects. Local Save inserts date/chemistry/**inputVolts/outputVolts/loadAmps**/inverter/alarms; cleanVisit inserts date/chemistry/**inverter/alarms**/inputVolts/outputVolts/loadAmps. Equal values then differ by object key order. Imported canonical records dedupe against a repeated file correctly; that separate passing case does not cover local Save→Export→Import.

Compare content independently of object insertion order while retaining the intended same-name/different-visit policy. Add a regression using the actual local Save control followed by own export/reimport with the current notebook still present.

Evidence: four `*-downloaded-notebook.json`, `*-duplicate-after-own-export.png`; final log/results contain beforeCount1/afterCount2, status and both key orders. Four failed assertions are this finding, not four independent defects.

## Finding3 — P2: PM says Exported after BrowserFiles reports failure or cancellation

Locations: `power-pm.js:390–396`; `app.js:281`; `browser-files.js:42–51,62–65,76–79`.

At390px, clicked the real Export notebook control with no Android bridge. Two isolated boundary faults exercise real BrowserFiles handlers:

- Temporarily make URL.createObjectURL throw a synthetic NotAllowedError. BrowserFiles catches it and displays **Could not start the download. Retry or choose Save/share file if available.** PM nevertheless displays **Exported1 supply. Keep the file somewhere safe before you uninstall...**
- Provide Web Share capability with navigator.share rejecting a synthetic AbortError. BrowserFiles displays **Sharing cancelled. Your file is still ready; choose Save/share file or Download file.** PM still says **Exported1 supply...**

These are browser API fault/cancel simulations, not claims about an actual OS share sheet. They demonstrate the app status defect: global download returns BrowserFiles.prepare's Promise/result, but exportNotebook does not await/inspect it and sets success immediately. Its synchronous try/catch cannot catch the resolved error/cancel statuses. Both scenarios left notebook and unrelated storage unchanged.

Use preparation/handoff language and honor the asynchronous result. A requested download or completed handoff still does not prove a user saved the file; BrowserFiles already states that accurately. Relevant screenshot: `390-export-cancel-feedback.png`; final log/results contain both contradictory messages. Two failures represent this one feedback issue.

## Passing UI/retention/refusal evidence

The final run also verified, at all four widths:

- Actual Save controls create one supply/two visits and write only `nightsweep-power-pm-v1`; current job state and other device data stay unchanged by those PM actions.
- Actual JSON Blob downloads contain correct envelope/name/version and saved visits; Export itself writes no notebook/job/device data.
- After deleting through the UI, actual file chooser restore preserves all visit values with fresh supply/visit IDs; notebook remains byte-identical across page reload, and real supply selection renders both visits.
- Repeated import against an already imported canonical notebook skips without writes. Merge adds a new supply and skips canonical matching content; same name with a different visit remains separate with unique IDs.
- Malformed JSON, wrong version, a valid first supply followed by an invalid calendar-date supply, negative battery volts and41 supplies are refused whole with **Nothing was imported**, unchanged storage/job state and no storage writes.
- Actual files of2MiB+1 ASCII bytes and UTF-8 bytes over the cap despite fewer code units are refused. A valid file padded to **exactly2,097,152 bytes** is accepted, confirming the inclusive real File.size boundary.
- Empty FileChooser selection (`set_files([])`) leaves storage and prior status unchanged; this tests no selected file, not an interactive native OS cancel dialog. No false new import message is generated.
- Actual Tools→Limits source dialog shows **Unknown**, **2097152 bytes**, the application guard and whole-file refusal condition. Export/Import controls are at least44px high, and page width does not overflow at320–430px dark.
- Source/error/cancel actions preserve notebook data as applicable; direct PM import/export/source operations leave unrelated data unchanged. No app runtime errors.

Storage tracing wrapped native Storage.setItem solely to record keys and always called the original API. It did not replace persistence or create a mock store.

**Reload qualification:** normal startup load adds existing route row metadata `family`/`passiveType` to the three initial sample rows and rewrites `hfc-route-v1`; this is existing app loadState normalization, not a Supply PM write. Results record each reload's before/after rows and changed key under `reloadDiagnostics`. The notebook remains exact. Before and after each set of PM actions, unrelated-data baselines use the current loaded job; no claim is made that the app's general startup avoids its existing autosave. Initial PM Save/export/import checks before reload also passed exact unrelated-state comparisons.

## Executed commands, helper failures and raw evidence

Final own command above exited1 with99pass/10genuine observed failures. The script completed and wrote `results.json`; its final exit is intentionally red because the reviewed app failed assertions. The exact generated artifact was read/copied, not rebuilt. No installed package/dependency command ran.

The scratch review helper had the following initial problems, all preserved and separated from product findings:

1. One initial exec request failed before process creation with **exec-server transport disconnected**. A read-only pwd retry succeeded. This is a tool transport event, not an app/test result; no raw script process existed for it.
2. First script run, exit1 after five actual UI passes: Playwright wait_for_function received its arg positionally instead of keyword `arg=`. Fixed only the helper call. Raw `run1-helper-error.log`.
3. Second script run, exit1 after the four-width cases: the fault-injection evaluate expression returned the newly assigned throwing function, so Playwright evaluated it during setup rather than on export. Wrapped setup in a no-return block. That run also used an initial-before-reload comparison for later PM actions; it flagged existing startup row normalization. Recorded that normalization separately and compared later PM actions against the newly loaded job. Raw `run2-helper-and-reload-oracle.log`.
4. Third script completed, exit1,95pass/14fail: four extra oracle failures came from waiting on an `Imported1` status already displayed by the previous import. The next asynchronous File.text could still be pending, contaminating a snapshot. The helper now makes a real New supply selection before each import to establish a distinct starting status, then waits for the new operation's expected result. Existing content/state/refusal assertions were retained. Raw `run3-import-completion-race.log`, structured `results-run3-import-race.json`. The four extras disappeared in the final run; ten product assertions remained red.

There was no production fix, test skip, downgraded expected product result or actual repository edit. Final script is the reproducible corrected helper, with all109 assertions/results in the final files.

A delegated read-only source reviewer independently identified the key-order mismatch, async export-status issue and rendering risk before browser confirmation. Its source/fixture-sizing note is `static-contract-review.md`; it did not run browsers/tests/builds. Its large-own-export restore risk/fixture sizing is **static evidence only in this report**; the parent's separate source reviewer owns the dedicated own-export/restore and41-span probes, so I did not duplicate or claim those as my own executed checks.

## Unperformed

No author/reviewer full gate, build/install, generated PWA/cache consistency check, new app math verification, broader PM trend/span/evidence/project-backup matrix, hosted CI, GitHub review/comment/merge, native Android bridge, APK/signing, emulator, physical Android/iPhone, Safari/WebView, actual OS save/share dialogs/provider cancellation, touch/gloves/screen reader or field/company procedure acceptance. No remote network/research action or real customer/plant data. This independent red browser result must not overwrite or be described as the root's running gate.

Recommendation at exact1c1e541: **CHANGES NEEDED** for imported markup execution and local own-export dedupe; also correct asynchronous export feedback. Re-run actual browser/picker regression paths and the required exact-head gates after fixes.
