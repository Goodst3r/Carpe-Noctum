"""Strand (support wire) spans: pole to pole only. Never mixed with cable.

On the walkout sheet strand is the 0.02-0.03 width stroke class (93% of those segments touch a pole).
Poles come from the walkout's pole highlights. Printed footages are STRAND span lengths (user-confirmed).
"""
import math, heapq, collections
from .graph import _pt_seg


def strand_segments(P, wmin=.02, wmax=.03):
    return [(a, b) for p in P if p["stroke"] and not p["fill"] and not p["curves"] and wmin <= p["width"] < wmax
            for a, b in zip(p["pts"], p["pts"][1:]) if math.dist(a, b) >= .3]


def spans(P, poles, snap=.5, pole_tol=4.0, max_len=900):
    segs = strand_segments(P)
    vid, vpos = {}, []

    def vert(p):
        k = (round(p[0] / snap), round(p[1] / snap))
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                j = vid.get((k[0] + dx, k[1] + dy))
                if j is not None and math.dist(vpos[j], p) <= snap:
                    return j
        vid[k] = len(vpos); vpos.append(p); return vid[k]
    adj = collections.defaultdict(dict)
    for a, b in segs:
        u, v = vert(a), vert(b)
        if u != v:
            d = math.dist(a, b); adj[u][v] = d; adj[v][u] = d
    # attach poles to the nearest strand vertex/segment point
    pnode = {}
    for i, q in enumerate(poles):
        best = min(((math.dist(q, vpos[v]), v) for v in adj), default=(1e9, None))
        if best[0] <= pole_tol:
            pnode[i] = best[1]
    byv = collections.defaultdict(list)
    for i, v in pnode.items():
        byv[v].append(i)
    out = {}
    for i, v in pnode.items():
        dist = {v: 0}; prev = {}; heap = [(0, v)]
        while heap:
            d, x = heapq.heappop(heap)
            if d > dist[x] or d > max_len:
                continue
            if x != v and x in byv:
                continue                       # stop at the next pole
            for y, w in adj[x].items():
                if d + w < dist.get(y, 1e18):
                    dist[y] = d + w; prev[y] = x; heapq.heappush(heap, (d + w, y))
        for x, d in dist.items():
            if x != v and x in byv:
                for j in byv[x]:
                    if i < j:
                        path, y = [], x
                        while y != v:
                            path.append(vpos[y]); y = prev[y]
                        path.append(vpos[v]); path.reverse()
                        out[(i, j)] = {"length_pt": d, "path": path}
    return out, pnode
