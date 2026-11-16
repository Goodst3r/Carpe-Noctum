"""Link yellow A#/E# annotation tags (coax-only map) to nearby symbols and to design-table rows."""
import math, re


def link(markup, symbols, tables):
    act = {a["tag"]: a for a in tables["actives"]}
    eol = {e["tag"]: e for e in tables["eol"]}
    out = []
    for m in markup:
        if m["type"] != "FreeText" or not m["text"] or not re.fullmatch(r"[AE]\d+", m["text"]):
            continue
        taps = [t for t in symbols if t["class"] == "tap" and math.hypot(t["cx"] - m["cx"], t["cy"] - m["cy"]) < 8]
        s = min(taps, key=lambda t: math.hypot(t["cx"] - m["cx"], t["cy"] - m["cy"]), default=None)
        d = math.hypot(s["cx"] - m["cx"], s["cy"] - m["cy"]) if s else None
        row = (act if m["text"][0] == "A" else eol).get(m["text"])
        out.append({"tag": m["text"], "kind": "active" if m["text"][0] == "A" else "eol_point", "x": m["cx"], "y": m["cy"],
                    "device": "amplifier (triangle under yellow tag; checked visually on 8 samples)" if m["text"][0] == "A" else "end-of-line test point",
                    "adjacent_tap": {"value": s["tap_value"], "shape": s["tap_shape"], "dist_pt": round(d, 1)} if s else None,
                    "table_row": row})
    return out
