"""Trace cable runs on the coax-only sheet and connect devices along them.

Cable linework = unfilled strokes in the medium width class on this sheet family (hairlines are parcels/leaders).
Devices (taps, couplers, splitters, amplifiers, line extenders...) are attached where cable endpoints fall inside the symbol or the
cable passes through it. Everything is a PROPOSAL: edges are geometric adjacency, not verified RF connectivity.
"""
import math, collections, heapq

DEVICE_CLASSES = ("tap", "splitter_2way", "directional_coupler", "amplifier", "line_extender", "node_symbol_candidate")


def cable_segments(P, wmin=.004, wmax=.03, min_len=.3):
    segs = []
    for p in P:
        if p["fill"] or p["curves"] or not p["stroke"] or not (wmin <= p["width"] < wmax):
            continue
        for a, b in zip(p["pts"], p["pts"][1:]):
            if math.dist(a, b) >= min_len:
                segs.append((a, b))
    return segs


def _pt_seg(p, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = 0 if L2 == 0 else max(0, min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / L2))
    q = (ax + t * dx, ay + t * dy)
    return math.dist(p, q), t, q


def hairline_segments(P, wmax=.004, min_len=.3, max_len=120):
    out = []
    for p in P:
        if p["fill"] or p["curves"] or not p["stroke"] or p["width"] >= wmax or len(p["pts"]) > 400:
            continue
        for a, b in zip(p["pts"], p["pts"][1:]):
            if min_len <= math.dist(a, b) <= max_len:
                out.append((a, b))
    return out


def bridge(segs, hair, devices, tol=.8, rounds=4):
    """Add hairline segments that join two known cable nodes (cable vertices or device symbols). Parcel lines rarely do."""
    grid = {}
    def put(pt, r=tol):
        grid.setdefault((int(pt[0] // 4), int(pt[1] // 4)), []).append((pt, r))
    for a, b in segs:
        put(a); put(b)
    for d in devices:
        put((d["cx"], d["cy"]), max(d["w"], d["h"]) / 2 + 1.0)
    def near(pt):
        gx, gy = int(pt[0] // 4), int(pt[1] // 4)
        return any(math.dist(pt, q) <= r for dx in (-1, 0, 1) for dy in (-1, 0, 1) for q, r in grid.get((gx + dx, gy + dy), []))
    added, rest = [], list(hair)
    for _ in range(rounds):
        keep, new = [], []
        for a, b in rest:
            (new if near(a) and near(b) else keep).append((a, b))
        if not new:
            break
        for a, b in new:
            put(a); put(b)
        added += new; rest = keep
    return added


def build(P, devices, snap=.4, min_component_len=25):
    segs = cable_segments(P)
    segs = segs + bridge(segs, hairline_segments(P), devices)
    # --- vertices with snapping
    vid, vpos = {}, []
    def vkey(p):
        return (round(p[0] / snap), round(p[1] / snap))
    def vert(p):
        k = vkey(p)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                j = vid.get((k[0] + dx, k[1] + dy))
                if j is not None and math.dist(vpos[j], p) <= snap:
                    return j
        vid[k] = len(vpos); vpos.append(p); return vid[k]
    edges = []
    for a, b in segs:
        u, v = vert(a), vert(b)
        if u != v:
            edges.append((u, v))
    # --- keep long connected components only
    adj = collections.defaultdict(set)
    for u, v in edges:
        adj[u].add(v); adj[v].add(u)
    comp, seen = {}, set()
    for s in list(adj):
        if s in seen:
            continue
        stack, members = [s], []
        seen.add(s)
        while stack:
            x = stack.pop(); members.append(x)
            for y in adj[x]:
                if y not in seen:
                    seen.add(y); stack.append(y)
        L = sum(math.dist(vpos[u], vpos[v]) for u, v in edges if u in set(members[:1]) or False) if False else None
        total = sum(math.dist(vpos[x], vpos[y]) for x in members for y in adj[x] if x < y)
        if total >= min_component_len:
            for x in members:
                comp[x] = len(set(comp.values()))
    keep = {x for x in comp}
    edges = [(u, v) for u, v in edges if u in keep]
    # --- device nodes: connect to cable endpoints inside radius, or split a passing segment
    dev_nodes = []
    segs_idx = collections.defaultdict(list)
    G = 8
    for i, (u, v) in enumerate(edges):
        a, b = vpos[u], vpos[v]
        for gx in range(int(min(a[0], b[0]) // G), int(max(a[0], b[0]) // G) + 1):
            for gy in range(int(min(a[1], b[1]) // G), int(max(a[1], b[1]) // G) + 1):
                segs_idx[(gx, gy)].append(i)
    g_adj = collections.defaultdict(dict)   # node -> {node: length}
    for u, v in edges:
        d = math.dist(vpos[u], vpos[v]); g_adj[u][v] = d; g_adj[v][u] = d
    next_id = len(vpos)
    node_pos = dict(enumerate(vpos))
    for k, dv in enumerate(devices):
        r = max(dv["w"], dv["h"]) / 2 + 3.0
        cx, cy = dv["cx"], dv["cy"]
        did = ("dev", k)
        node_pos[did] = (cx, cy); g_adj[did] = {}
        cand = set()
        for gx in range(int((cx - r) // G), int((cx + r) // G) + 1):
            for gy in range(int((cy - r) // G), int((cy + r) // G) + 1):
                cand.update(segs_idx.get((gx, gy), []))
        hooked = False
        for i in cand:
            u, v = edges[i]
            for e in (u, v):
                if math.dist(vpos[e], (cx, cy)) <= r:
                    d = math.dist(vpos[e], (cx, cy)); g_adj[did][e] = d; g_adj[e][did] = d; hooked = True
            if not hooked:
                dist, t, q = _pt_seg((cx, cy), vpos[u], vpos[v])
                if dist <= r * .9 and 0 < t < 1:
                    for e in (u, v):
                        d = math.dist(vpos[e], (cx, cy)); g_adj[did][e] = d; g_adj[e][did] = d
                    g_adj[u].pop(v, None); g_adj[v].pop(u, None); hooked = True
        dev_nodes.append(did)
    return {"adj": g_adj, "pos": node_pos, "devices": dev_nodes, "n_vertices": len(vpos), "n_edges": len(edges)}


def device_links(G, devices, max_len=700):
    """Dijkstra from each device through plain cable vertices until another device is reached (stop there)."""
    links = {}
    devset = set(G["devices"])
    for src in G["devices"]:
        dist = {src: 0}; heap = [(0, src)]; prev = {}
        while heap:
            d, x = heapq.heappop(heap)
            if d > dist.get(x, 1e18) or d > max_len:
                continue
            if x in devset and x != src:
                continue            # do not walk through another device
            for y, w in G["adj"][x].items():
                nd = d + w
                if nd < dist.get(y, 1e18):
                    dist[y] = nd; prev[y] = x; heapq.heappush(heap, (nd, y))
        for y in dist:
            if y in devset and y != src and src[1] < y[1]:
                path, x = [], y
                while x != src:
                    path.append(G["pos"][x]); x = prev[x]
                path.append(G["pos"][src]); path.reverse()
                links[(src[1], y[1])] = {"length_pt": dist[y], "path": path}
    return links
