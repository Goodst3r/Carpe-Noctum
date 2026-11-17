"""Link yellow A#/E# annotation tags (coax-only map) to nearby symbols and to design-table rows."""
import math, re


def link(markup, symbols, tables):
    legs = [x for x in symbols if x["class"] == "leg_arrow"]
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
        visual = conflict = None
        if m["text"][0] == "A":
            n_in = sum(1 for l in legs if math.hypot(l["cx"] - m["cx"], l["cy"] - m["cy"]) < 6)
            mod = (row or {}).get("model") or ""
            if "EN9000" in mod:
                visual = "node"
            elif n_in >= 1:
                visual = "amplifier"
            else:
                visual = "line_extender"
            if visual != "node" and "-LE_" in mod and visual != "line_extender":
                conflict = "table model is LE but symbol shows inner black triangles"
            elif visual == "line_extender" and ("HGD" in mod or "HGBT" in mod):
                conflict = "table model is amplifier-class but no inner black triangles found"
            elif "BOOSTER" in mod:
                visual, conflict = "booster(unsupported profile)", None
        out.append({"tag": m["text"], "kind": "active" if m["text"][0] == "A" else "eol_point", "x": m["cx"], "y": m["cy"],
                    "device": visual if m["text"][0] == "A" else "end-of-line test point", "conflict": conflict,
                    "adjacent_tap": {"value": s["tap_value"], "shape": s["tap_shape"], "dist_pt": round(d, 1)} if s else None,
                    "table_row": row})
    return out
