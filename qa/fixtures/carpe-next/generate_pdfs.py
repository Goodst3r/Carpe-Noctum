#!/usr/bin/env python3
"""Synthetic map PDFs for next-build QA. Public ReportLab only.

Canvas(..., invariant=1) fixes the document ID and the creation/mod dates so
two runs are byte-identical. setPageRotation writes a real /Rotate entry.
setCropBox writes a CropBox rectangle distinct from the MediaBox. Files are
written only to the directory the caller supplies.
"""
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen.canvas import Canvas

# Inside the rotated MediaBox [0, 0, 792, 612]. Origin is not zero and the
# rectangle is not the MediaBox, so a parser can see a real crop.
CROP = (36, 36, 760, 580)
MARKER = "SYNTHETIC ORIGINAL MARKUP"
ANNOTATION = "Existing annotation"


def generate(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "synthetic-rotated-cropped.pdf"
    canvas = Canvas(
        str(path),
        pagesize=letter,
        invariant=1,
        pdfVersion=(1, 4),
    )
    canvas.setTitle("synthetic-map")
    canvas.setAuthor("carpe-next-qa")
    canvas.setSubject("synthetic")
    canvas.setPageRotation(90)
    canvas.setCropBox(CROP)
    canvas.drawString(72, 500, MARKER)
    canvas.drawString(72, 480, "NAME: ACT1 TAG: T1")
    canvas.textAnnotation(ANNOTATION, Rect=(120, 120, 180, 160))
    canvas.showPage()
    canvas.save()
    return {"rotated_cropped": path, "crop": CROP, "rotation": 90, "marker": MARKER, "annotation": ANNOTATION}


if __name__ == "__main__":
    import tempfile
    destination = Path(tempfile.mkdtemp(prefix="carpe-next-pdf-"))
    made = generate(destination)
    print(made["rotated_cropped"])
