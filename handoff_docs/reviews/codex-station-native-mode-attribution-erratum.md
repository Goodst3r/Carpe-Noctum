# Mode-attribution correction for the existing 889 author receipt

Read-only publication preparation found an author reporting error; no product source failure is implied. The old `/tmp/carpe-a1-nightlog-integration.md` labeled Checklist37/37 and registry14/14 as source/frozen pairs. The actual commands were the default invocation and a second invocation with `NIGHTSWEEP_RELEASE_TEST=1`.

At exact889, both suites contain this selector:

```
process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1'
 ? require('./build2-source-harness.cjs').assembleHtml()
 : fs.readFileSync('outputs/Night_Sweep.html', 'utf8')
```

Neither of the author's commands explicitly enabled that actual source selector. Under the documented default/unset flags both executions use built standalone HTML. Preserve the executed37+37 and14+14 counts and command identities, but do not claim their first runs establish assembled-source coverage. This draft package labels them default/explicit-release invocations. The source/frozen native13/13 and NightLog23/23 modes are correct because those suites use the separate harness controlled by NIGHTSWEEP_RELEASE_TEST.

The source/runtime byte-provenance and independent source/native/NightLog checks retain their original scope. After the erratum was reported, root explicitly authorized two new assembled-source commands; their fresh results are recorded below and do not relabel either older execution.

The existing temporary integration receipt was not edited in this prep. Root must carry this erratum into its final canonical publication or correct that author mode wording when copying the receipt. Historical public0da full results are unaffected. Full889 remains NOT RUN.

## Newly authorized source-mode execution at unchanged889

Root separately authorized the two missing source-mode executions after this reporting error was found. Both commands ran with release/evidence flags unset and GIT_OPTIONAL_LOCKS=0:

| Exact command | Own result |
| --- | --- |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-checklist.test.cjs` | exit0,37 checks,13.972s wall |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` | exit0,14 checks,4.936s wall |

Before and after, all605 tracked file SHA256 values matched exact889 HEAD blobs; HEAD/tree and semantic staged contents were identical and status clean. Proof:`fresh-source-mode-proof.json`; logs:`fresh-source-checklist.log`, `fresh-source-registry.log`. No builders, installs, source/index/metadata edits, push or API writes. These are new assembled-source results, not relabeling of the earlier default/explicit-release37+37 and14+14. Native13/13 and NightLog23/23 source/frozen attribution is independently confirmed by their exact bootApp harness contract. Full889 remains NOT RUN.
