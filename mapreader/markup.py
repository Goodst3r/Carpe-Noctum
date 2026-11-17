"""Read PDF markup annotations (Bluebeam-style walkout redlines) and classify them."""
import re, json, os
import pypdf

COLORS = {(1, 0, 0): "red", (0, 0, 1): "blue", (0, 1, 0): "green", (1, 0, 1): "magenta",
          (1, 1, 0): "yellow", (1, 1, 1): "white", (0, 0, 0): "black"}
HERE = os.path.dirname(__file__)


def color_name(c):
    if not c:
        return "none"
    k = tuple(round(float(x)) if abs(float(x) - round(float(x))) < .05 else round(float(x), 1) for x in c)
    if k == (1, .5, 1):
        return "magenta"
    return COLORS.get(k, str(k))


def _s(v):
    try:
        return str(v.get_object()) if v is not None else None
    except Exception:
        return None


def load_glossary():
    with open(os.path.join(HERE, "glossary.json")) as f:
        return json.load(f)


def classify_text(t, gl):
    t = (t or "").strip()
    if not t:
        return "empty", None
    if re.fullmatch(r"\d-\d{6}", t):
        return "pole_id", t
    if re.fullmatch(r"\d{2,4}'", t):
        return "span_footage", int(t[:-1])
    if re.fullmatch(r"\d+", t) and int(t) in gl["cable_sizes"]:
        return "cable_size", int(t)
    if re.fullmatch(r"RG-?\d{1,2}", t, re.I):
        return "cable_type_other", t.upper().replace("-", "")
    if re.fullmatch(r"[A-Z]-\d+[A-Z]?(-\d)?", t):
        return "address_tagged", t
    if re.fullmatch(r"\d{1,2}", t):
        return "small_number", int(t)   # tap value or drop count; disambiguated by enclosing shape
    if t in gl["tokens"]:
        return "token", t
    if re.fullmatch(r"\d+[A-Za-z]?\}\d+(\r.*)?", t, re.S):
        return "mdu_unit_range", t.replace("\r", " | ")
    if re.fullmatch(r"\d{3,5}", t):
        return "address_number", int(t)
    if "\r" in t or len(t) > 12:
        return "note", t.replace("\r", " / ")
    return "other", t


def load_markup(path, page_index=0):
    r = pypdf.PdfReader(path)
    p = r.pages[page_index]
    H = float(p.mediabox.height)
    gl = load_glossary()
    out = []
    for a in (p.get("/Annots") or []):
        a = a.get_object()
        st = str(a.get("/Subtype"))
        if st == "/Popup":
            continue
        x0, y0, x1, y1 = [float(v) for v in a["/Rect"]]
        text = a.get("/Contents")
        text = str(text) if text is not None else None
        cat, val = classify_text(text, gl) if st == "/FreeText" else (None, None)
        d = {"id": str(a.get("/NM")), "type": st[1:], "subj": _s(a.get("/Subj")),
             "color": color_name(a.get("/C")), "author": _s(a.get("/T")),
             "bbox": [x0, H - y1, x1, H - y0], "cx": (x0 + x1) / 2, "cy": H - (y0 + y1) / 2,
             "text": text, "text_category": cat, "value": val, "rotation": float(a.get("/Rotation", 0) or 0)}
        out.append(d)
    return out, H
