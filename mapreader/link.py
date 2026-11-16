"""Compose symbols: shapes + enclosed text; summarise redlines; reconcile with the title block."""
import collections, re

SHAPE_TYPES = {"Circle", "Square", "Polygon"}


def inside(txt, shp, pad=1.5):
    b = shp["bbox"]
    return b[0] - pad <= txt["cx"] <= b[2] + pad and b[1] - pad <= txt["cy"] <= b[3] + pad


def area(s):
    b = s["bbox"]
    return (b[2] - b[0]) * (b[3] - b[1])


def polygon_kind(m):
    return {"Circle": "circle", "Square": "square", "Polygon": "polygon"}[m["type"]]


def compose(markup):
    texts = [m for m in markup if m["type"] == "FreeText" and m["text"]]
    shapes = [m for m in markup if m["type"] in SHAPE_TYPES and m["subj"] != "Image" and area(m) < 900]
    symbols, used = [], set()
    for t in texts:
        if t["text_category"] not in ("small_number", "token", "cable_size", "address_number"):
            continue
        cands = [s for s in shapes if inside(t, s) and area(s) < 400]
        if not cands:
            continue
        s = min(cands, key=area)
        used.add(t["id"])
        kind = polygon_kind(s)
        role = None
        if t["text_category"] == "small_number":
            role = ("tap_value" if s["color"] == "blue" else "drop_or_port_count" if s["color"] == "red" else "number_in_shape")
        elif t["text_category"] == "token":
            role = "device_token:" + t["value"]
        symbols.append({"shape": kind, "color": s["color"], "text": t["text"], "role": role,
                        "cx": s["cx"], "cy": s["cy"], "shape_id": s["id"], "text_id": t["id"]})
    return symbols, used


def summarize(markup, symbols):
    c = collections.Counter
    texts = [m for m in markup if m["type"] == "FreeText"]
    sm = {
        "annotations_by_type": dict(c(m["type"] for m in markup)),
        "annotations_by_type_color": {f"{k[0]}|{k[1]}": v for k, v in c((m["type"], m["color"]) for m in markup).items()},
        "text_categories": dict(c(m["text_category"] for m in texts)),
        "tokens": dict(c(m["value"] for m in texts if m["text_category"] == "token")),
        "cable_sizes": dict(c(m["value"] for m in texts if m["text_category"] == "cable_size")),
        "symbol_roles": dict(c((s["shape"], s["color"], s["role"]) .__str__() for s in symbols)),
        "highlights": dict(c(m["color"] for m in markup if m["type"] == "Ink")),
        "photos": sum(1 for m in markup if m["subj"] == "Image"),
        "pole_ids": len({m["value"] for m in texts if m["text_category"] == "pole_id"}),
        "address_tagged": dict(c(m["value"][0] for m in texts if m["text_category"] == "address_tagged")),
        "notes": [m["text"] for m in texts if m["text_category"] == "note"],
        "authors": dict(c(m["author"] for m in markup)),
    }
    return sm


def title_block(markup):
    """Pull the walkout title block numbers (positions are right of the labels)."""
    t = [m for m in markup if m["type"] == "FreeText" and m["text"]]
    out = {}
    for m in t:
        if m["text"].startswith("FIELDER"):
            out["fielder"] = m["text"].split(":", 1)[1].strip()
        if m["text"].startswith("Node/map"):
            out["node"] = m["text"].split(":", 1)[1].strip()
        if m["text"].startswith("DATE") and "date" not in out:
            out["date"] = m["text"].split(":", 1)[1].strip()
    return out
