# Grok next-build QA handoff

Tested SHA: 248e77802f333a1a461563dfb1973315a2043d67 (baseline build3)
HTML SHA-256: 844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137

## Benjamin (PDF/map)

- Fixtures: qa/fixtures/carpe-next/synthetic-multi-sheet.pdf, synthetic-rotated.pdf (synthetic only)
- Suite: qa/carpe-next-pdf.test.py
- Commands: python3 qa/carpe-next-pdf.test.py
- Expected on baseline: fixtures load, multi-sheet/rotated present, labels extractable; tombstone/Update PDF map feature not implemented (document as expected gap)
- Actual: tests pass on fixture presence and text; feature TBD
- Proposed: Codex implement Update PDF map with tombstone beside confirmed active/EOL on same page, support rotated/cropped, preserve original bytes and markup, make repeat export idempotent. Rerun suite on candidate.

No private maps, meter files, or signing material included.
