# NAV-1 focused review reproductions

Historical pin: `4ccd22a28c66ca8739425fdabe79ea505aafea89`; base `8c0fc17860c5a63bfc2bb4203601dbc9438e6253`. These desktop Chromium checks read committed artifacts. They do not build the app or replace the required full gate. Do not treat results as applying to a later head.

Run against an isolated checkout of the historical pin with Python Playwright and Chromium available:

```sh
python3 pr38-filter-entry-check.py /path/to/app --receipt /tmp/nav-entry.json
python3 pr38-keyboard-repro.py /path/to/app
node pr38-screenlists-real-probe.cjs /path/to/app
```

The first check is an independent keyboard regression (12 failures/exit1 on the historical pin); it can be rerun unchanged on the fixed head. The second reproduces the original Tools Tab/Enter/ArrowDown failure at four widths (exit1 on that pin). The third extracts the actual committed name-check function and asserts the two historical detection gaps plus three controls (exit0/five diagnostic assertions on that pin). It is a reproduction diagnostic, not a desired-behavior regression; its success means the historical gaps were reproduced. Raw original logs are included. All scripts write only an explicitly requested temporary receipt or stdout, never app source.

The broader navigation/storage probes and their harness corrections are documented in the companion review; their raw scratch artifacts are separate and are not claimed as portable by this bundle. No emulator, physical-device, meter or APK check.
