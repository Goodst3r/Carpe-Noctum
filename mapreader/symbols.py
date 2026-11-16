"""Rule-based symbol classifier on pdfium path primitives.

Every result carries `basis`: 'geometry' (shape/colour/text rule seen on these maps) or
'standard' (symbol name from the generic CATV symbol list).  Nothing here is a verified legend.
"""
import math, re, collections
from . import prims

SIZE_MAX = 16


def _c(p):
    b = p["bbox"]; return ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)


def _wh(p):
    b = p["bbox"]; return (b[2] - b[0], b[3] - b[1])


def shape_kind(p):
    w, h = _wh(p)
    pts = p["pts"]
    if p["curves"] >= 4 or len(pts) >= 16:
        return "circle"
    xs = {round(x, 1) for x, _ in pts}; ys = {round(y, 1) for _, y in pts}
    n = len({(round(x, 1), round(y, 1)) for x, y in pts})
    if n in (3, 4) and not (len(xs) == 2 and len(ys) == 2):
        if n == 3 or (n == 4 and pts[0] != pts[-1] and not p["closed"]):
            return "triangle"
    if len(xs) == 2 and len(ys) == 2:
        return "square" if .75 < w / max(h, 1e-6) < 1.33 else "rect"
    if n == 3 or (len(pts) == 4 and n == 3):
        return "triangle"
    if n == 4:
        u = []
        for q in pts:
            if all(math.dist(q, r) > .05 for r in u):
                u.append(q)
        u = u[:4]
        if len(u) == 4:
            sides = [math.dist(u[i], u[(i + 1) % 4]) for i in range(4)]
            if max(sides) < 1.25 * min(sides) + .05:
                ang = math.degrees(math.atan2(u[1][1] - u[0][1], u[1][0] - u[0][0])) % 90
                ang = min(ang, 90 - ang)
                return "square" if ang < 12 else "diamond" if ang > 33 else "rotated_square"
        return "quad"
    if n == 5:
        return "pentagon"
    if n == 6:
        return "hexagon"
    if n >= 7:
        return "octagon" if n <= 9 else "polygon"
    return "other"


def _inside(c, b, pad=.6):
    return b[0] - pad <= c[0] <= b[2] + pad and b[1] - pad <= c[1] <= b[3] + pad


def run(pdf_path, words, page_index=0):
    P = prims.paths(pdf_path, page_index)
    seen, S = set(), []
    for p in P:
        w, h = _wh(p)
        if not (p["closed"] or p["fill"] or (len(p["pts"]) >= 4 and math.dist(p["pts"][0], p["pts"][-1]) < .05)) or not (1.2 < max(w, h) < 60) or p["curves"] == 0 and len(p["pts"]) < 3:
            continue
        key = (round(p["bbox"][0], 1), round(p["bbox"][1], 1), round(w, 1), round(h, 1), bool(p["fill"]))
        if key in seen:
            continue
        seen.add(key)
        p["kind"] = shape_kind(p); p["c"] = _c(p); p["wh"] = (w, h)
        S.append(p)
    for s in S:
        s["inner"] = " ".join(wd["text"] for wd in words if _inside(((wd["x0"] + wd["x1"]) / 2, (wd["top"] + wd["bottom"]) / 2), s["bbox"]))
    out, used = [], set()

    def emit(s, cls, basis, **kw):
        used.add(id(s)); out.append({"class": cls, "shape": s["kind"], "filled": bool(s["fill"]), "cx": s["c"][0], "cy": s["c"][1],
                                     "w": s["wh"][0], "h": s["wh"][1], "basis": basis, **kw})

    filled = [s for s in S if s["fill"]]
    # 1. power-supply labels (text cluster around an HA####X name): model, rated V, rated A, load A
    for w in words:
        if not re.fullmatch(r"HA\d{4}[A-Z]", w["text"]) or w["size"] > 1.3:
            continue
        near = [v for v in words if math.hypot(v["x0"] - w["x0"], v["top"] - w["top"]) < 14 and v is not w]
        model = next((v["text"] for v in near if re.fullmatch(r"[A-Z]{2,4}_[A-Z0-9_]+", v["text"])), None)
        volts = next((int(m.group(1)) for v in near for m in [re.fullmatch(r"(\d{2,3})\s*V", v["text"])] if m), None)
        rated = next((float(m.group(1)) for v in near for m in [re.fullmatch(r"(\d+(?:\.\d+)?)A", v["text"])] if m), None)
        load = next((float(v["text"]) for v in near if re.fullmatch(r"\d+\.\d+", v["text"])), None)
        out.append({"class": "power_supply_label", "shape": "label", "filled": False, "cx": w["x0"], "cy": w["top"], "w": 8, "h": 8,
                    "basis": "text cluster", "name": w["text"], "model_code": model, "volts_label": volts, "rated_amps": rated, "load_amps": load})
    # 2. power-supply symbol: circle drawn as a filled half-disc + an unfilled half-disc sharing a tiny number
    halves_f = [s for s in S if s["fill"] and s["curves"] == 6 and s["wh"][1] < .85 * s["wh"][0] + .3]
    halves_u = [s for s in S if not s["fill"] and s["curves"] == 6]
    for f in halves_f:
        m = min((u for u in halves_u if math.dist(u["c"], f["c"]) < f["wh"][0] * .9 and abs(u["wh"][0] - f["wh"][0]) < .5 * f["wh"][0] + .3),
                key=lambda u: math.dist(u["c"], f["c"]), default=None)
        if m:
            tv = re.fullmatch(r"\d{1,2}", (f["inner"] + " " + m["inner"]).strip()) or re.search(r"\d{1,2}", f["inner"] + m["inner"])
            emit(f, "power_supply_symbol", "standard(power supply / AC power block) + geometry", label_number=int(tv.group(0)) if tv else None)
            used.add(id(m))
            for o in S:
                if math.dist(o["c"], f["c"]) < 1.5 and o["curves"] == 6:
                    used.add(id(o))
    # 3. node: large filled circle (>=6pt) ; leg arrows: small filled triangles/quads near it
    legs = [s for s in filled if id(s) not in used and s["kind"] in ("triangle", "quad") and s["wh"][0] < 6]
    for s in filled:
        if id(s) in used: continue
        if s["kind"] == "circle" and s["wh"][0] >= 6:
            near = sum(1 for l in legs if math.dist(l["c"], s["c"]) < 8)
            emit(s, "node_or_hub_dot", "geometry", legs=near)
    # 4. taps: any outline shape with a number 5..35 inside
    for s in S:
        if id(s) in used or s["fill"]: continue
        t = s["inner"].strip()
        if re.fullmatch(r"\d{1,2}", t) and 5 <= int(t) <= 35 and s["kind"] in ("circle", "square", "rect", "diamond", "hexagon", "pentagon", "octagon", "quad", "polygon"):
            emit(s, "tap", "standard(tap symbol shows value) + geometry", tap_value=int(t), tap_shape=s["kind"])
        elif t == "S":
            emit(s, "S_marker", "geometry (meaning not in any key found)")
    # 5. filled black polygons with a number are taps drawn solid; small filled triangles are leg arrows
    for s in filled:
        if id(s) in used: continue
        t = s["inner"].strip()
        if re.fullmatch(r"\d{1,2}", t) and 5 <= int(t) <= 35:
            emit(s, "tap", "geometry", tap_value=int(t), tap_shape=s["kind"] + "_solid")
        elif s["kind"] in ("triangle", "quad") and s["wh"][0] < 6:
            emit(s, "leg_arrow", "geometry")
        elif s["kind"] == "circle":
            emit(s, "filled_dot", "geometry")
    # 6. amplifier triangles (outline), medium size
    for s in S:
        if id(s) in used or s["fill"]: continue
        if s["kind"] == "triangle" and 2 < s["wh"][0] < 16:
            emit(s, "amplifier_triangle", "standard(amplifier symbol is a triangle) + geometry")
    ded, keep = [], []
    for o in out:
        if o["class"] == "tap" and any(k["class"] == "tap" and k["tap_value"] == o["tap_value"] and math.hypot(k["cx"] - o["cx"], k["cy"] - o["cy"]) < 1.5 for k in keep):
            continue
        keep.append(o)
    return keep, len(P)
