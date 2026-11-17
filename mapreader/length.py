"""Estimate cable length per traced cable link from strand footages.

Printed footage = strand length between two adjacent poles (user-confirmed). Cable runs along strand, so a cable link that follows a
span uses a fraction of that span's footage: footage x (fraction of the drawn span covered by the link). The drawing is not to scale
along strand, so only within-span proportions are used, never a global feet-per-point scale.
ESTIMATE ONLY: slack, risers, underground, drops and spans without footage are not included; coverage says how much of the link was explained.
"""
import math
from .graph import _pt_seg


def _param(p, a, b):
    d, t, _ = _pt_seg(p, a, b)
    return d, t


def link_length(path, spans, near=8.0, step=1.0):
    """path: polyline (coax coords). spans: [{a:(x,y), b:(x,y), feet, id}] in the same coords."""
    pts = []
    for u, v in zip(path, path[1:]):
        L = math.dist(u, v); n = max(1, int(L / step))
        pts += [(u[0] + (v[0] - u[0]) * k / n, u[1] + (v[1] - u[1]) * k / n) for k in range(n)]
    pts.append(path[-1])
    total_pt = sum(math.dist(u, v) for u, v in zip(path, path[1:]))
    if not pts or total_pt == 0:
        return {"est_ft": 0.0, "coverage": 0.0, "spans": []}
    used, covered = {}, 0
    for p in pts:
        best = None
        for s in spans:
            d, t = _param(p, s["a"], s["b"])
            if d <= near and (best is None or d < best[0]):
                best = (d, t, s)
        if best:
            covered += 1
            used.setdefault(best[2]["id"], [best[2], best[1], best[1]])
            u = used[best[2]["id"]]; u[1] = min(u[1], best[1]); u[2] = max(u[2], best[1])
    est = sum(s["feet"] * (t1 - t0) for s, t0, t1 in used.values())
    return {"est_ft": round(est, 1), "coverage": round(covered / len(pts), 2),
            "spans": [{"id": s["id"], "feet": s["feet"], "fraction": round(t1 - t0, 2), "t0": round(t0, 3), "t1": round(t1, 3)} for s, t0, t1 in used.values()]}


def plant_total(estimates):
    """Union of covered intervals per span across all links (links share cable at junctions, so summing links double counts)."""
    iv, feet = {}, {}
    for e in estimates:
        for sp in e["spans"]:
            if sp["t1"] - sp["t0"] > 0.02:
                iv.setdefault(sp["id"], []).append((sp["t0"], sp["t1"])); feet[sp["id"]] = sp["feet"]
    total = 0.0
    for k, L in iv.items():
        L.sort(); cur = [L[0][0], L[0][1]]; u = 0.0
        for a, b in L[1:]:
            if a <= cur[1]:
                cur[1] = max(cur[1], b)
            else:
                u += cur[1] - cur[0]; cur = [a, b]
        u += cur[1] - cur[0]
        total += feet[k] * min(u, 1.0)
    return round(total), len(iv)
