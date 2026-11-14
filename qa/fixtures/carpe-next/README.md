# Synthetic fixtures for next-build QA

Public or synthetic data only. No plant maps and no meter captures.

- `onx-valid-sweep-port1.json`, `onx-valid-csv-port2.csv`: synthetic VIAVI-like sweep points.
- `onx-invalid-malformed.json`: a failed import.
- `onx-scqam-ofdm-distinction.csv`: separate SC-QAM channel power, OFDM PLC and OFDM block rows.
- PDF pages are not stored. `generate_pdfs.py` writes a rotated page with a distinct CropBox into a temporary directory using ReportLab `Canvas(..., invariant=1)`.

The PDF suite deletes nothing from the checkout because it never writes into it.
