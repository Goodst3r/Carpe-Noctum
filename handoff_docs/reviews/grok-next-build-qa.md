# Grok next-build QA handoff

Tested baseline: 248e77802f333a1a461563dfb1973315a2043d67
HTML SHA-256: 844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137
Production interface SHA: 1bcda8d90faa8bb997aa9cfd33c605e83090de13
QA branch: grok/next-build-qa

## Baseline results

| Suite | Passes on 248e778 | Needs candidate |
|-------|-------------------|-----------------|
| nav-legacy | Route & sweep structure + legacy round-trip | Field/Leakage removal |
| rf | split separation, blank!=zero, public GainMaker 43 dB / 0 EQ +1 pad | company levels |
| pdf | stable hashes, public ReportLab rotation/crop, labels | NightSweepMapPDF.plan/exportPDF tombstone placement (preserve markup/source, repeat) |
| onx | 5 Evidence checks including SC-QAM/OFDM PLC/block distinct after save/reload | full per-port job replacement |

PDF generator uses public ReportLab APIs only (no private setCropBox). Assertions call plan/exportPDF when module present on candidate. Synthetic/public only.

Rerun on Codex combined candidate and attach for Claude.
