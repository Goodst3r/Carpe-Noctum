# Grok next-build QA handoff

Tested SHA: 248e77802f333a1a461563dfb1973315a2043d67 (baseline build3)
HTML SHA-256: 844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137
Branch: grok/next-build-qa

## Summary of baseline results (clean checkout expected)

| Suite | Owner | Passes on 248e778 | Needs combined candidate |
|-------|-------|-------------------|--------------------------|
| carpe-next-nav-legacy.test.cjs | Grok | nav present, legacy preserved | Field/Leakage removal |
| carpe-next-rf.test.cjs | Harper | splits separate, blank refused, public vectors | company levels registration |
| carpe-next-pdf.test.py | Benjamin | fixtures/labels, generator | tombstone placement, rotated support, idempotent export |
| carpe-next-onx.test.cjs | Lucas | failed-import isolation, port replacement, SC-QAM/OFDM/PLC distinction, round-trips | full ONX integration |

## Benjamin details

- Deterministic generator: qa/fixtures/carpe-next/generate_pdfs.py (reportlab)
- Suite: qa/carpe-next-pdf.test.py
- Proposed guide text: After matching confirmed active and EOL symbols by exact NAME and TAG from the imported map schedule, use Update PDF map. This places a single tombstone next to each confirmed symbol on the exported PDF, on the same diagram page. Multiple legs are grouped. Existing markup and the original PDF source bytes are preserved. Tombstones can be repositioned before export. The tool supports rotated or cropped sheets when symbol matching succeeds. Refresh uses a verified original diagram.

Synthetic only. No private data.

Rerun all suites on Codex combined candidate SHA. Attach results for Claude.
