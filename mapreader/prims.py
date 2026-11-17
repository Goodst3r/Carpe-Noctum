"""Path primitives via pdfium: bbox, fill/stroke colour, transformed vertices."""
import ctypes
import pypdfium2 as pdfium
import pypdfium2.raw as raw


def _col(fn, o):
    r, g, b, a = (ctypes.c_uint() for _ in range(4))
    ok = fn(o, r, g, b, a)
    return (r.value, g.value, b.value) if ok else None


def paths(pdf_path, page_index=0):
    pg = pdfium.PdfDocument(pdf_path)[page_index]
    H = pg.get_height()
    out = []
    for o in pg.get_objects():
        if o.type != raw.FPDF_PAGEOBJ_PATH:
            continue
        m = raw.FS_MATRIX()
        raw.FPDFPageObj_GetMatrix(o, m)
        mode, stroke = ctypes.c_int(), ctypes.c_int()
        raw.FPDFPath_GetDrawMode(o, mode, stroke)
        n = raw.FPDFPath_CountSegments(o)
        pts, curve, closed = [], 0, False
        for i in range(n):
            s = raw.FPDFPath_GetPathSegment(o, i)
            x, y = ctypes.c_float(), ctypes.c_float()
            raw.FPDFPathSegment_GetPoint(s, x, y)
            if raw.FPDFPathSegment_GetType(s) == raw.FPDF_SEGMENT_BEZIERTO:
                curve += 1
            if raw.FPDFPathSegment_GetClose(s):
                closed = True
            pts.append((m.a * x.value + m.c * y.value + m.e, H - (m.b * x.value + m.d * y.value + m.f)))
        sw = ctypes.c_float()
        raw.FPDFPageObj_GetStrokeWidth(o, sw)
        l, b, r, t = o.get_bounds()
        out.append({"bbox": (l, H - t, r, H - b), "fill": _col(raw.FPDFPageObj_GetFillColor, o) if mode.value else None,
                    "stroke": _col(raw.FPDFPageObj_GetStrokeColor, o) if stroke.value else None,
                    "width": sw.value * (abs(m.a) + abs(m.d)) / 2, "pts": pts, "curves": curve, "closed": closed})
    return out
