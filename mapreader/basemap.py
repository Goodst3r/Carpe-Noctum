"""Recognize base-map elements from page vectors/text (works on coax-only and walkout)."""
import re, math, collections
import pdfplumber


def dedupe_chars(chars):
    seen, out = set(), []
    for c in chars:
        k = (round(c["x0"], 1), round(c["top"], 1), c["text"])
        if k in seen:
            continue
        seen.add(k); out.append(c)
    return out


def words(page):
    ch = dedupe_chars(page.chars)
    page2 = page.filter(lambda o: o.get("object_type") != "char")
    # rebuild words from deduped chars
    ws, cur = [], None
    for c in sorted(ch, key=lambda c: (round(c["top"] / max(c["size"], 1)), round(c["top"], 1), c["x0"])):
        if cur and abs(c["top"] - cur["top"]) < 1.0 and -c["size"] * .4 <= c["x0"] - cur["x1"] < max(c["size"] * .5, .3):
            cur["text"] += c["text"]; cur["x1"] = c["x1"]
        else:
            cur = {"text": c["text"], "x0": c["x0"], "x1": c["x1"], "top": c["top"], "bottom": c["bottom"], "size": c["size"],
                   "upright": c.get("upright", True)}
            ws.append(cur)
    return ws


def shape_kind(o):
    pts = o.get("pts") or []
    w, h = o["width"], o["height"]
    if w <= 0 or h <= 0 or w > 30 or h > 30:
        return None
    n = len(pts)
    if n >= 16:
        return "circle"
    ar = w / h if h else 9
    if n in (4, 5):
        # rectangle vs triangle vs diamond
        xs = sorted({round(p[0], 1) for p in pts}); ys = sorted({round(p[1], 1) for p in pts})
        if len(xs) == 2 and len(ys) == 2:
            return "square" if .7 < ar < 1.4 else "rect"
        if n == 4:
            return "triangle"
        mids = sum(1 for p in pts[:4] if abs(p[0] - (o["x0"] + o["x1"]) / 2) < w * .12 or abs(p[1] - (o["top"] + o["bottom"]) / 2) < h * .12)
        return "diamond" if mids >= 3 else "polygon4"
    if n in (6, 7):
        return "hexagon"
    if n == 3:
        return "triangle"
    return "polygon%d" % n


def detect_symbols(page, ws):
    """Closed small shapes + the tap value/text inside them."""
    objs = [o for o in page.curves + page.rects if o.get("object_type")]
    syms = []
    for o in objs:
        k = shape_kind(o)
        if not k or max(o["width"], o["height"]) < 1.2:
            continue
        fill = tuple(round(x, 2) for x in o["non_stroking_color"]) if o.get("fill") and o.get("non_stroking_color") and isinstance(o["non_stroking_color"], (tuple, list)) else None
        inner = [w["text"] for w in ws if o["x0"] - .5 <= (w["x0"] + w["x1"]) / 2 <= o["x1"] + .5 and o["top"] - .5 <= (w["top"] + w["bottom"]) / 2 <= o["bottom"] + .5]
        syms.append({"shape": k, "fill": fill, "cx": (o["x0"] + o["x1"]) / 2, "cy": (o["top"] + o["bottom"]) / 2,
                     "w": o["width"], "h": o["height"], "inner": "".join(inner)})
    return syms


def classify_symbol(s):
    t = s["inner"]
    fill = s["fill"]
    yellowish = fill and fill[0] > .9 and fill[1] > .6 and fill[2] < .5
    if t.isdigit() and 5 <= int(t) <= 29 and s["shape"] in ("circle", "square", "diamond", "hexagon"):
        return "tap", {"tap_value": int(t), "tap_shape": s["shape"]}
    if t.isdigit() and s["shape"] in ("circle", "square", "diamond", "hexagon", "polygon5", "polygon6"):
        return "tap_or_count", {"value": int(t)}
    if yellowish:
        return "yellow_marker(pole/amp/power)", {}
    if s["shape"] == "circle" and fill and sum(fill) < .3:
        return "filled_black_circle", {}
    if s["w"] > 8 and s["h"] > 8:
        return "large_symbol(node/cabinet/power?)", {}
    if s["shape"] == "triangle":
        return "triangle(amp/power inserter?)", {}
    return "unclassified_shape", {}


def span_footages(ws):
    return [{"text": w["text"], "cx": (w["x0"] + w["x1"]) / 2, "cy": (w["top"] + w["bottom"]) / 2}
            for w in ws if re.fullmatch(r"\d{2,4}", w["text"]) and not w["upright"] is False and w["size"] < 2.2]


def run(path, page_index=0):
    page = pdfplumber.open(path).pages[page_index]
    ws = words(page)
    syms = detect_symbols(page, ws)
    cls = collections.Counter(); taps = collections.Counter(); out = []
    for s in syms:
        c, extra = classify_symbol(s)
        s["class"] = c; s.update(extra); out.append(s); cls[c] += 1
        if c == "tap":
            taps[extra["tap_value"]] += 1
    street = collections.Counter(w["text"] for w in ws if re.search(r"(Street|Avenue|Road|Drive|Court|Lane|Way|Boulevard)", w["text"]))
    return {"page_size": (page.width, page.height), "n_words": len(ws), "symbols": out,
            "symbol_classes": dict(cls), "tap_values": dict(sorted(taps.items())),
            "street_labels": dict(street), "n_lines": len(page.lines), "n_curves": len(page.curves)}
