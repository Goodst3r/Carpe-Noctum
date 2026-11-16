"""Rule-based symbol classifier on pdfium path primitives.

Every result carries `basis`: 'geometry' (shape/colour/text rule seen on these maps) or
'standard' (symbol name from the generic CATV symbol list).  Nothing here is a verified legend.
"""
import math, re, collections
from . import prims

SIZE_MAX = 16
KEY_BASIS = "user-confirmed map key"
PORTS = {"circle": 2, "square": 4, "rotated_square": 4, "diamond": 4, "octagon": 8}


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


def find_triangles(P, tol=.35, lo=1.0, hi=14):
    """3-cycles of short unfilled segments; endpoints closer than `tol` are the same vertex."""
    segs = []
    for p in P:
        if p["fill"] or p["curves"] or len(p["pts"]) > 5:
            continue
        for a, b in zip(p["pts"], p["pts"][1:]):
            if lo <= math.dist(a, b) <= hi:
                segs.append((a, b))
    pts = [q for sg in segs for q in sg]
    parent = list(range(len(pts)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]; i = parent[i]
        return i
    grid = {}
    for i, q in enumerate(pts):
        grid.setdefault((int(q[0] // 1), int(q[1] // 1)), []).append(i)
    for i, q in enumerate(pts):
        gx, gy = int(q[0] // 1), int(q[1] // 1)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for j in grid.get((gx + dx, gy + dy), []):
                    if j > i and math.dist(q, pts[j]) <= tol:
                        parent[find(j)] = find(i)
    pos, adj = {}, {}
    for k, (a, b) in enumerate(segs):
        ra, rb = find(2 * k), find(2 * k + 1)
        if ra == rb:
            continue
        pos[ra], pos[rb] = a, b
        adj.setdefault(ra, set()).add(rb); adj.setdefault(rb, set()).add(ra)
    # contract degree-2 vertices whose two edges are (nearly) collinear: sides are often split in two
    changed = True
    while changed:
        changed = False
        for v in list(adj):
            if len(adj.get(v, ())) != 2:
                continue
            a, b = tuple(adj[v])
            u1 = (pos[a][0] - pos[v][0], pos[a][1] - pos[v][1]); u2 = (pos[b][0] - pos[v][0], pos[b][1] - pos[v][1])
            n1, n2 = math.hypot(*u1), math.hypot(*u2)
            if n1 and n2 and (u1[0] * u2[0] + u1[1] * u2[1]) / (n1 * n2) < -.96 and b not in adj[a]:
                adj[a].discard(v); adj[b].discard(v); adj[a].add(b); adj[b].add(a); del adj[v]; changed = True
    tris, seen = [], set()
    for a in adj:
        for b in adj[a]:
            if b <= a:
                continue
            for c in adj[b] & adj[a]:
                if c <= b:
                    continue
                size = max(math.dist(pos[a], pos[b]), math.dist(pos[b], pos[c]), math.dist(pos[c], pos[a]))
                area2 = abs((pos[b][0] - pos[a][0]) * (pos[c][1] - pos[a][1]) - (pos[c][0] - pos[a][0]) * (pos[b][1] - pos[a][1]))
                if size < 2 or size > hi or area2 < .35 * size * size * .5:
                    continue
                cen = ((pos[a][0] + pos[b][0] + pos[c][0]) / 3, (pos[a][1] + pos[b][1] + pos[c][1]) / 3)
                k = (round(cen[0]), round(cen[1]))
                if k in seen:
                    continue
                seen.add(k); tris.append({"c": cen, "size": size})
    return tris


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
        if not re.fullmatch(r"[A-Z]{2}\d{4}[A-Z]", w["text"]) or w["size"] > 1.3:
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
            ux = m["c"][0] - f["c"][0]; uy = m["c"][1] - f["c"][1]
            emit(f, "directional_coupler", "user-confirmed map key (half black/half white circle)",
                 coupling_db=int(tv.group(0)) if tv else None,
                 tap_leg_dir_deg=round(math.degrees(math.atan2(-uy, -ux)) % 360), through_leg_dir_deg=round(math.degrees(math.atan2(uy, ux)) % 360))
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
            if s["wh"][0] > 7:
                continue
            if near >= 3:
                emit(s, "node_symbol_candidate", "geometry (solid circle with >=3 leg arrows; node is A2 per the coax design)", legs=near)
            else:
                emit(s, "splitter_2way", KEY_BASIS, legs=near)
    # 4. taps: any outline shape with a number 5..35 inside
    for s in S:
        if id(s) in used or s["fill"]: continue
        toks = [x for x in s["inner"].split() if not (len(x) == 1 and x.isalpha())]   # drop street-name letters crossing the symbol
        label = [x for x in toks if re.fullmatch(r"[A-Z]{3,5}-[A-Z]{2,4}", x)]
        nums = [x for x in toks if re.fullmatch(r"\d{1,2}", x)]
        t = nums[0] if len(nums) == 1 and len(nums) + len(label) == len(toks) else s["inner"].strip()
        if re.fullmatch(r"\d{1,2}", t) and 5 <= int(t) <= 35 and s["kind"] in ("circle", "square", "rotated_square", "rect", "diamond", "hexagon", "pentagon", "octagon", "quad", "polygon"):
            emit(s, "tap", KEY_BASIS, tap_value=int(t), tap_shape=s["kind"], ports=PORTS.get(s["kind"]), ports_confirmed=s["kind"] in PORTS,
                 jumper_label=label[0] if label else None)
        elif t == "S":
            emit(s, "S_marker", "geometry (meaning not in any key found)")
    # 5. filled black polygons with a number are taps drawn solid; small filled triangles are leg arrows
    for s in filled:
        if id(s) in used: continue
        t = s["inner"].strip()
        if re.fullmatch(r"\d{1,2}", t) and 5 <= int(t) <= 35:
            emit(s, "tap", "geometry", tap_value=int(t), tap_shape=s["kind"] + "_solid", ports=None, ports_confirmed=False)
        elif s["kind"] in ("triangle", "quad") and s["wh"][0] < 6:
            emit(s, "leg_arrow", "geometry")
        elif s["kind"] == "circle" and 1.0 <= s["wh"][0] <= 7:
            emit(s, "splitter_2way", KEY_BASIS, confidence="normal" if s["wh"][0] >= 1.8 else "low (tiny dot, may be a vertex marker)")
    # 6. outline triangles, rebuilt from short line segments (they are drawn as separate 2-point strokes)
    legs_all = [o for o in out if o["class"] == "leg_arrow"]
    tris = find_triangles(P)
    for s in S:   # closed triangle paths (drawn as one path) not already found from segments
        if not s["fill"] and s["kind"] == "triangle" and 2 < s["wh"][0] < 16 and not any(math.dist(t["c"], s["c"]) < 3 for t in tris):
            tris.append({"c": s["c"], "size": max(s["wh"])})
    for tri in tris:
        n_in = sum(1 for l in legs_all if math.dist((l["cx"], l["cy"]), tri["c"]) < 6)
        out.append({"class": "amplifier" if n_in else "line_extender", "shape": "triangle", "filled": False, "cx": tri["c"][0], "cy": tri["c"][1],
                    "w": tri["size"], "h": tri["size"], "basis": KEY_BASIS + " (inner black triangles)", "inner_black_triangles": n_in})
    ded, keep = [], []
    for o in out:
        if o["class"] == "tap" and any(k["class"] == "tap" and k["tap_value"] == o["tap_value"] and math.hypot(k["cx"] - o["cx"], k["cy"] - o["cy"]) < 1.5 for k in keep):
            continue
        keep.append(o)
    return keep, len(P)
