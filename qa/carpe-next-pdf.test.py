#!/usr/bin/env python3
"""PDF QA against the frozen candidate.

Generates synthetic pages in a temporary directory. Asserts real /Rotate and a
CropBox that is not the MediaBox, then calls NightSweepMapPDF.plan/exportPDF.
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader
from pypdf.generic import ContentStream

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / "qa" / "fixtures" / "carpe-next" / "generate_pdfs.py"
BRIDGE = ROOT / "qa" / "carpe-next-pdf-bridge.cjs"
FIXTURES = ROOT / "qa" / "fixtures" / "carpe-next"

checks = 0


def check(condition, message):
    global checks
    if not condition:
        raise AssertionError(message)
    checks += 1
    print("PASS " + message)


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def boxes(page):
    return [float(v) for v in page.mediabox], [float(v) for v in page.cropbox]


def test_stable_rotation_and_crop():
    sys.path.insert(0, str(GEN.parent))
    from generate_pdfs import generate
    with tempfile.TemporaryDirectory(prefix="carpe-pdf-a-") as first, tempfile.TemporaryDirectory(prefix="carpe-pdf-b-") as second:
        made = generate(first)
        again = generate(second)
        left, right = made["rotated_cropped"], again["rotated_cropped"]
        check(sha256(left) == sha256(right), "invariant generator hashes match across directories")
        reader = PdfReader(str(left))
        page = reader.pages[0]
        media, crop = boxes(page)
        check(page.rotation == 90, "page /Rotate is 90")
        check(crop != media, "CropBox is distinct from MediaBox")
        check(crop[0] != 0 and crop[1] != 0, "CropBox origin is nonzero")
        check(all(v > 0 for v in crop[2:]), "CropBox upper corner is nonzero")
        text = page.extract_text() or ""
        check("SYNTHETIC ORIGINAL MARKUP" in text, "original markup text is on the page")
        annots = page.annotations or []
        check(len(annots) == 1, "source has one text annotation")
        contents = str(annots[0].get_object().get("/Contents"))
        check("Existing annotation" in contents, "annotation contents preserved on the source")
        stored = list(FIXTURES.glob("*.pdf"))
        check(stored == [], "generator did not write PDFs into the checkout")
        return left.read_bytes()


def content_text(page):
    raw = page.get_contents()
    if raw is None:
        return ""
    data = raw.get_data() if hasattr(raw, "get_data") else ContentStream(raw, page.pdf).get_data()
    return data.decode("latin1", errors="replace")


def test_plan_and_export(source_bytes):
    if os.environ.get("NIGHTSWEEP_RELEASE_TEST") != "1":
        raise AssertionError("NIGHTSWEEP_RELEASE_TEST=1 is required. Refusing a source-assembly pass.")
    with tempfile.TemporaryDirectory(prefix="carpe-pdf-out-") as folder:
        folder = Path(folder)
        source = folder / "source.pdf"
        output = folder / "updated.pdf"
        source.write_bytes(source_bytes)
        env = os.environ.copy()
        env["NIGHTSWEEP_RELEASE_TEST"] = "1"
        completed = subprocess.run(
            ["node", str(BRIDGE), str(source), str(output)],
            cwd=str(ROOT),
            env=env,
            text=True,
            capture_output=True,
        )
        if completed.returncode != 0:
            raise AssertionError(completed.stdout + "\n" + completed.stderr)
        print(completed.stdout.strip())
        report = json.loads((str(output) + ".matrix.json") and Path(str(output) + ".matrix.json").read_text())
        check(report["checks"] > 0, "bridge executed frozen-page checks")
        updated = PdfReader(str(output))
        page = updated.pages[0]
        media, crop = boxes(page)
        check(page.rotation == 90, "exported page keeps /Rotate 90")
        check(crop != media and crop[0] != 0, "exported page keeps the distinct nonzero CropBox")
        text = page.extract_text() or ""
        check("SYNTHETIC ORIGINAL MARKUP" in text, "export preserves original markup text")
        annots = page.annotations or []
        check(len(annots) == 1, "export preserves the original annotation")
        check("Existing annotation" in str(annots[0].get_object().get("/Contents")), "annotation text still present")
        stream = content_text(page)
        needle = " ".join(("%d" % n) if float(n).is_integer() else ("%g" % n) for n in report["matrix"]) + " cm"
        if needle not in stream:
            operators = [line for line in stream.splitlines() if line.endswith(" cm") or " cm" in line]
            raise AssertionError("overlay matrix %s not in content. cm operators: %s" % (needle, operators[:8]))
        check(True, "overlay uses the rotated/cropped inverse viewport matrix")
        check(sha256(source) == hashlib.sha256(source_bytes).hexdigest(), "bridge left the original file bytes unchanged")
        check(list(FIXTURES.glob("*.pdf")) == [], "export left the checkout free of generated PDFs")


def main():
    source = test_stable_rotation_and_crop()
    test_plan_and_export(source)
    print("Benjamin PDF suite: %d python checks" % checks)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("FAIL " + str(error))
        sys.exit(1)
