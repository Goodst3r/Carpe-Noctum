# Independent scratch render-context optimization review

**PASS for the scratch candidate against pinnedfe245887d30da3b8fa3e01fa721e31a47a3bba9c. No Important semantic finding. Production application and the active unfrozen A4 integration remain outside this verdict.**

Baseline UI SHA256a5c6680389f9ba4d01e1681f10cfcba5dcb661d0255fec9f35dbad6ef75cc944 was independently matched to the exact Git blob atfe245887. Candidate SHA2564886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215. Read the supplied23-line patch, candidate, harness/regression source and63-case characterization. That63-case execution remains the supplying actor's result; I did not rerun or include it in my own counts.

## Reasoning

The candidate changes historical warning presentation only. The per-render provider closes over a local context value created lazily on the first eligible historical row. It returns a fresh shallow copy to each row. Availability, attachment identity and metadata checks still precede that provider, preserving early returns.

The complete context consists of five strings: jobId, jobName, nodeAsset, hardware and canonical recordSnapshot. Historical freshness temporarily replaces only the copy's recordSnapshot with the existing verified compact descriptor. There are no nested mutable context members to alias. The original raw render context, digestCache and saved historical record remain untouched; subsequent rows compare the raw snapshot correctly. Rendering is synchronous and the provider does not escape the render. A later render or owner change constructs a new provider.

The public freshness(r) export still has arity1, ignores extra arguments and obtains a fresh context for each direct call. It does not reuse a prior render provider. Grade/signature/observer/mark-stale/init and exported API blocks are byte-identical to baseline. Their owner/revision/signature checks and original-verification calls remain intact; no global cache, grade-result cache or verification cache is added.

## Own isolated probes

`node /tmp/carpe-a4-render-context-optimization-independent.cjs` exited0: **17/17 independent cases passed**. Log `/tmp/carpe-a4-render-context-optimization-independent.log`; structured verdict/cases/hashes `/tmp/carpe-a4-render-context-optimization-independent.json`.

These probes reuse the supplied isolated component boot fixture but derive separate assertions:

- Exact pinned baseline/function/export identity and five-string context shape. Six frozen histories remain read-only and byte-equivalent; six baseline history-context builds become one candidate build. This is an instrumented operation count, not a timing claim.
- A single stale criterion at the beginning, middle or end cannot poison other rows' context copies. Reversing the histories preserves every warning and HTML byte. Both raw digest caches remain equal.
- All missing/unavailable/metadata-mismatched histories, plus empty history, avoid context evaluation. A deliberately unusable VM route value is used only to make accidental eager evaluation observable; it does not define a new supported imported-job shape.
- After a warm render, direct public freshness calls recompute three times, detect changed then restored context, and ignore an extra throwing provider argument.
- OwnerA→B→A clears digest ownership on each replacement. Explicitly priming the restored owner can produce the existing historical warning, never a Current verified calculation solely from that prime.
- Per-record native warnings retain exact escaping and order without leaking through the shared context.
- Two grade calls perform two synthetic verification-service calls; repeated renders perform none. Current/history output and whole saved state match baseline. Editing the saved current snapshot invalidates its current badge.
- At both original-verification and digest-await barriers, criteria or source-SHA changes reject with the same error, append no history and never label a current result. The verification service is still invoked once for each attempted grade.

All five supplied patch/candidate/harness/regression/characterization files retained their initial SHA256 after the17-case run. The current A4 working tree/index was not accessed. No production edit, dependency install/removal, broad gate, private export or real meter file was used.

## Limits and handoff

The Node DOM is a string sink. EvidenceUI is a named synthetic service-contract fixture, so these cases establish control-flow/output equivalence and call boundaries, not real original-byte verification or browser performance. I did not execute Chrome/Playwright or transfer the other actor's browser results into my count. No wall-time/device/field improvement is claimed.

Apply only after the author freezes the real integration and root owns the concrete change. At that final source, verify the patch still applies to the same context/grade structure, add meaningful committed regression coverage, and run actual source/frozen/browser verification in the serialized workflow. The candidate remains scratch-only until then. No additional semantic fix is requested from this review.
