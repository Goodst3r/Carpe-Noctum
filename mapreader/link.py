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
        "cable_type_other": dict(c(m["value"] for m in texts if m["text_category"] == "cable_type_other")),
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


def cable_labels(markup):
    """Printed cable-type labels (deduplicated). Footage is a STRAND span length (user-confirmed), so it is never paired with cable here."""
    out, seen = [], set()
    for m in markup:
        if m["text_category"] not in ("cable_size", "cable_type_other"):
            continue
        k = (m["text"], round(m["cx"]), round(m["cy"]))
        if k in seen:
            continue                      # identical label stacked on the same spot
        seen.add(k)
        rec = {"printed": m["text"].strip(), "family": "hardline_size" if m["text_category"] == "cable_size" else "other_coax",
               "x": m["cx"], "y": m["cy"], "color": m["color"], "id": m["id"]}
        if m["text"].strip() == "412":
            rec["catalog_assumption"] = "mc2_500 (user-stated assumption; printed .412 kept)"
        out.append(rec)
    return out


def strand_layer(markup, P):
    """Poles (walkout highlights) and strand spans (pole to pole). Footage labels are strand span lengths; pairing is a candidate only."""
    import math
    from . import strand
    from .graph import _pt_seg
    poles = [{"x": m["cx"], "y": m["cy"], "color": m["color"]} for m in markup if m["type"] == "Ink"]
    sp, pn = strand.spans(P, [(p["x"], p["y"]) for p in poles])
    foot = [m for m in markup if m["text_category"] == "span_footage"]
    spans = []
    for (i, j), v in sp.items():
        cands = [f for f in foot if len(v["path"]) > 1 and min(_pt_seg((f["cx"], f["cy"]), a, b)[0] for a, b in zip(v["path"], v["path"][1:])) <= 10]
        spans.append({"pole_a": i, "pole_b": j, "length_pt": round(v["length_pt"], 1),
                      "footage_candidates": [{"feet": f["value"], "confirmed": False} for f in cands[:3]]})
    # footage sits BETWEEN two adjacent poles: candidate pole pairs with no other pole on the span
    import statistics
    pp = [(q["x"], q["y"]) for q in poles]

    def adjacent(a, b):
        return not any(p not in (a, b) and .1 < _pt_seg(p, a, b)[1] < .9 and _pt_seg(p, a, b)[0] < 6 for p in pp)
    between, ratios = [], []
    for f in foot:
        c = (f["cx"], f["cy"]); near = sorted(pp, key=lambda p: math.dist(p, c))[:8]
        cands = []
        for i, a in enumerate(near):
            for b in near[i + 1:]:
                L = math.dist(a, b)
                if 8 < L < 300:
                    d, t, _ = _pt_seg(c, a, b)
                    if d < 10 and .15 < t < .85 and adjacent(a, b):
                        cands.append((d, L, a, b))
        cands.sort()
        if cands:
            between.append({"feet": f["value"], "candidate_pole_pairs": len(cands), "unique": len(cands) == 1,
                            "best_pair_length_pt": round(cands[0][1], 1), "confirmed": False})
            if len(cands) == 1:
                ratios.append(f["value"] / cands[0][1])
    est = None
    if len(ratios) >= 10:
        q = statistics.quantiles(ratios, n=4)
        est = {"ft_per_pt_walkout_sheet_median": round(statistics.median(ratios), 2), "q1": round(q[0], 2), "q3": round(q[2], 2),
               "n_unique": len(ratios), "note": "spread is wide; estimate only, not used for any conversion"}
    return {"between_poles": {"labels_with_adjacent_pole_pair": len(between), "unique_pair": sum(1 for b in between if b["unique"]), "scale_estimate": est},
            "poles": poles, "spans": spans, "poles_on_strand": len(pn),
            "footage_total_ft_red_labels": sum(f["value"] for f in foot), "footage_labels": len(foot),
            "meaning": "printed footage = strand span length (pole to pole), user-confirmed; not cable length"}
