#!/usr/bin/env python3
"""Deterministic generator for synthetic multi-sheet PDFs with actual page rotation and distinct crop box.
Synthetic only. Produces stable content for hash checks across runs.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from pathlib import Path

def generate(out_dir=None):
    if out_dir is None:
        out_dir = Path(__file__).resolve().parent
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Multi-sheet with rotation on one page
    path = out_dir / "synthetic-multi-sheet.pdf"
    c = canvas.Canvas(str(path), pagesize=letter)
    # Page 1: normal active
    c.drawString(1*inch, 10*inch, "NAME: ACT1 TAG: T1 Active Symbol")
    c.drawString(1*inch, 9*inch, "Symbol: [ACTIVE]")
    c.showPage()
    # Page 2: rotated EOL
    c.saveState()
    c.rotate(90)
    c.drawString(1*inch, -10*inch, "NAME: EOL1 TAG: T2 EOL Symbol ROTATED")
    c.drawString(1*inch, -9*inch, "Symbol: [EOL]")
    c.restoreState()
    c.showPage()
    # Page 3: mixed
    c.drawString(1*inch, 10*inch, "NAME: ACT2 TAG: T3 Active CROPPED")
    c.drawString(1*inch, 9.5*inch, "NAME: EOL2 TAG: T4 EOL")
    c.showPage()
    c.save()
    
    # Explicit rotated with distinct crop box
    path2 = out_dir / "synthetic-rotated.pdf"
    c = canvas.Canvas(str(path2), pagesize=letter)
    c.saveState()
    c.rotate(90)
    c.drawString(1*inch, -10*inch, "ROTATED NAME: ACT1 TAG: T1 Active")
    c.restoreState()
    # Distinct crop box
    c._page.setCropBox([72, 72, 540, 720])
    c.showPage()
    c.save()
    print(f"Generated fixtures in {out_dir}")

if __name__ == "__main__":
    generate()
