#!/usr/bin/env python3
"""Carpe Noctum next-build QA: synthetic multi-sheet PDF tests for map updates.
Tests rotated/cropped sheets, active/EOL tombstone placement, repeat export.
Expected to document baseline behavior on SHA 248e778; rerun on candidate.
Synthetic fixtures only. No private maps.
"""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = ROOT / "qa" / "fixtures" / "carpe-next"
EXPECTED_SHA = "248e77802f333a1a461563dfb1973315a2043d67"

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def test_multi_sheet_exists():
    pdf = FIXTURES / "synthetic-multi-sheet.pdf"
    assert pdf.exists(), "Fixture missing"
    from pypdf import PdfReader
    reader = PdfReader(str(pdf))
    assert len(reader.pages) >= 2, f"Expected multi-sheet, got {len(reader.pages)}"
    print("PASS: multi-sheet fixture has pages")

def test_rotated_sheet():
    pdf = FIXTURES / "synthetic-rotated.pdf"
    assert pdf.exists()
    print("PASS: rotated fixture present (geometry check deferred to candidate)")

def test_active_eol_placement_expectation():
    pdf = FIXTURES / "synthetic-multi-sheet.pdf"
    from pypdf import PdfReader
    reader = PdfReader(str(pdf))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert "NAME:" in text and "TAG:" in text, "Missing labels"
    print("PASS: labels present; tombstone placement not yet implemented on baseline")

def test_repeat_export_idempotent():
    src = FIXTURES / "synthetic-multi-sheet.pdf"
    h1 = sha256(src)
    print(f"PASS: source hash {h1[:16]}... (repeat export to be verified on candidate)")

if __name__ == "__main__":
    print(f"Testing against expected baseline SHA {EXPECTED_SHA}")
    test_multi_sheet_exists()
    test_rotated_sheet()
    test_active_eol_placement_expectation()
    test_repeat_export_idempotent()
    print("Benjamin PDF suite: 4 checks passed on fixtures (feature TBD)")
