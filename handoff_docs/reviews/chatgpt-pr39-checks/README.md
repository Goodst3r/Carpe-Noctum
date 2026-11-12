# PR39 independent real-function math and context review

Historical pin:59ddf48986f9498b574fc1cb67081f3eb0df7dee. The frozen Decimal220 oracle/raw cases were prepared before the author implementation was inspected. No app formula is implemented in the forwarding adapter.

Run with Node and the app checkout's locked QA/JSDOM dependencies installed:

```sh
python3 run.py /path/to/Carpe-Noctum --expected-head 59ddf48986f9498b574fc1cb67081f3eb0df7dee
```

Optional `--output /tmp/your-new-receipt-directory` keeps all generated outputs there; otherwise the wrapper creates a new `/tmp/cn-pr39-math-*` directory. It never writes inside the target app or review bundle. It refuses a mismatched pin or dirty app checkout. After a corrected head, supply its complete actual SHA explicitly and inspect changed code/contexts before interpreting any results.

The wrapper runs actual source/standalone/PWA functions, explicit semantic annotations for five reviewer-extra refusal wordings, the frozen numerical comparator, then the unchanged desired-behavior context-guard regression. On historical59 the first three commands pass (162 real calls;1246 comparison checks/0failures), and the guard step deliberately exposes the product bug with exit1 (18pass/21fail/39 contexts). Overall exit1 is the required failing regression outcome on that head, not a successful app review. After a proper guard fix the same regression should pass. No tolerance or raw vector is changed to obtain a pass.

The real API is `FieldCalc.cascade(raw_inputs)`. Canonical output aliases are explicitly documented in the adapter. It preserves raw results, and all refused results must have only `ok,error`. The source loader stops at the actual `const FieldCalcs=` UI wrapper boundary. Standalone and PWA are the committed bytes, never rebuilt by this bundle.

Numeric comparison is not a DOM display claim. Parent's separate UI review must collect actual six-significant-figure text and can pass that evidence into the comparator; `validate_future_results.py --require-ui` rejects missing shared numeric UI fields for standalone/PWA. Refusal-wording annotations are explicit literals plus independent categories/rationales, not an automatic blanket approval. No software-bound exception was used in the historical successful numeric run.

Frozen-reference files: `cascade_oracle.py`, `cascade-raw-cases.json`, `cascade-reference.json`, `cascade-reference-receipt.json`, `validate_future_results.py`. Shared vector SHA256`fa87017273e9915ded87e09f1e49af50d76b1c755daa7893660a0bd5113314b2`; reference SHA256`c0976014c88b2d9f527365b1d3682e588caa3e54538b7388df23656027726750`. Oracle reference generation is optional and should target a separate output directory; do not overwrite the frozen reference to fit new app results.

Historical setup errors are retained as `adapter-initial.log` and `adapter-second.log` (wrong guessed source extraction boundary; no app calls); completed direct-run logs are `adapter-third.log`, `numeric-validation.log`, `author-cascade.log`, and the failing `guard-regression.log`. `portable-wrapper.log` records the temp-only verified wrapper run. Large raw actual outputs are working evidence rather than required committed artifacts; the scripts reproduce them from the pinned app.

No production edit, full gate, fresh external-source retrieval, physical-device/emulator/Safari/WebView/meter/field/APK check is supplied here. Root owns the required committed report, current-head readiness checks, PR comments and ordinary merge.
