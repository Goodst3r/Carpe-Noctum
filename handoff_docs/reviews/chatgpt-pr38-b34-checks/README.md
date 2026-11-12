# PR38 b34 focused-review check bundle

Reviewed app head: `b34b1db60571e758947ca5b592e14aeaf7f38d73`.

[Focused rereview](../chatgpt-pr38-b34-rereview.md) closes the five findings from the earlier4ccd review. [Document rereview](docs-rereview.md) records the regenerated PDFs and guide mirrors. Root's independent full gate is pending separately when this bundle is committed; this bundle is not approval or a merge action.

All copied pass logs/receipts identify their own scope. `receipts-manifest.json` records the original small receipt bytes. Earlier failures remain in [the historical review](../chatgpt-pr38-review.md) and [its check bundle](../chatgpt-pr38-checks/README.md).

## Portable read-only replays

Run from this evidence checkout, with a separate app checkout pinned at the reviewed head. The scripts read the app and write a receipt only when an explicit output path is supplied. Do not build or switch the app checkout while its independent gate is running.

```sh
B34_APP_ROOT=/path/to/pinned-app-checkout
node handoff_docs/reviews/chatgpt-pr38-b34-checks/screenlists-desired-probe.cjs "$B34_APP_ROOT" /tmp/pr38-b34-screenlists.json
python3 handoff_docs/reviews/chatgpt-pr38-b34-checks/docs-check.py "$B34_APP_ROOT" --receipt /tmp/pr38-b34-docs.json
```

- `screenlists-desired-probe.cjs`:10 desired-behavior assertions against the actual committed name-validation function, using an independent screen map. Requires Node and Git, with no npm dependency. Rejects missing/misgrouped multiword screen names and missing inventories; accepts the unrelated Field form header. CLI root/output-path plumbing is adapted from the executed scratch probe; test logic is retained.
- `docs-check.py`:27 assertions covering the main tab names, independent guide inventory, actual PDF text and exact docs/dist HTML mirrors. Requires Python3, Git and `pdftotext` on PATH. CLI root/output-path plumbing and explicit UTF-8 replace workspace-specific paths; assertion logic is retained. Use normal Python execution without `-O`, which disables Python assertions.
- Both replays intentionally require the exact reviewed head. A later head needs a new review; changing the pin constant does not transfer this receipt.

The unchanged12-check real-keyboard script is already preserved at [pr38-filter-entry-check.py](../chatgpt-pr38-checks/pr38-filter-entry-check.py), so it is not duplicated here:

```sh
python3 handoff_docs/reviews/chatgpt-pr38-checks/pr38-filter-entry-check.py "$B34_APP_ROOT" --receipt /tmp/pr38-b34-entry.json
python3 handoff_docs/reviews/chatgpt-pr38-checks/pr38-keyboard-repro.py "$B34_APP_ROOT"
```

Those browser replays require Python Playwright and Chromium. The12-check script accepts `--chromium`; the older four-width Tools script uses `/usr/bin/chromium`. Their original4ccd failures and currentb34 pass logs remain distinct.

## Copied results and limits

- Independent real-keyboard entry:12 passed,0 runtime errors; original four-width Tools reproduction now passes.
- Actual name-validation function:10 desired-behavior checks passed.
- Existing UI names:7 passed; NAV CJS:5 passed; author Chromium keyboard suite rerun independently:46 passed.
- Latest source/mapping preservation:15 checks passed; receipt lists the unchanged files, including B2 logic/suites and locked QA packages.
- Fresh backup/navigation storage check:3 groups passed onb34. The compact final log/JSON are included. The broader diagnostic/storage harness remains scratch-only because it relies on a separate base8c HTML snapshot, local serving setup and full synthetic evidence captures. Its source HTML, large JSON and embedded original-byte payloads are not included. The report states its exact normalization and execution limits; a compact pass log is not a portable full-backup replay.
- Documentation:27 assertions and12 final comparisons to HEAD passed; PDF hashes and concrete current paths are recorded in the document rereview.

No physical-device, emulator, native-keyboard, APK or field result is claimed. No broader old-head result is silently transferred to b34.

The archived CLI variants were also replayed against b34 to verify their path changes:10/10 name-validation and27/27 document checks, both exit0. Their separate `pr38-b34-archived-*` logs and JSON are included.
