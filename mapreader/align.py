"""Register the walkout page onto the coax-only page (same map, different sheet size/notation).

Similarity transform (scale, rotation, translation) fitted by RANSAC on tap symbols that share a printed value.
"""
import math, random
import numpy as np


def fit(src, dst):
    """Least-squares similarity src->dst, complex form: z' = a*z + b."""
    s = np.array([complex(x, y) for x, y in src]); d = np.array([complex(x, y) for x, y in dst])
    sm, dm = s.mean(), d.mean()
    a = np.sum((d - dm) * np.conj(s - sm)) / np.sum(np.abs(s - sm) ** 2)
    return a, dm - a * sm


def apply(t, pts):
    a, b = t
    return [((a * complex(x, y) + b).real, (a * complex(x, y) + b).imag) for x, y in pts]


def register(walk_taps, coax_taps, tol=3.0, iters=20000, seed=1):
    """taps: list of dicts with cx, cy, tap_value. Returns (transform, inliers, rms) or None."""
    rnd = random.Random(seed)
    by_v = {}
    for c in coax_taps:
        by_v.setdefault(c["tap_value"], []).append(c)
    w = [t for t in walk_taps if t["tap_value"] in by_v]
    if len(w) < 6:
        return None
    best = (None, [])
    cpts = np.array([[c["cx"], c["cy"]] for c in coax_taps]); cvals = np.array([c["tap_value"] for c in coax_taps])
    for _ in range(iters):
        a1, a2 = rnd.sample(w, 2)
        if math.dist((a1["cx"], a1["cy"]), (a2["cx"], a2["cy"])) < 150:
            continue
        for b1 in by_v[a1["tap_value"]]:
            if rnd.random() > .08:
                continue
            for b2 in by_v[a2["tap_value"]]:
                if rnd.random() > .08:
                    continue
                dw = complex(a2["cx"] - a1["cx"], a2["cy"] - a1["cy"]); dc = complex(b2["cx"] - b1["cx"], b2["cy"] - b1["cy"])
                if abs(dw) < 1e-6 or not (.5 < abs(dc) / abs(dw) < 2):
                    continue
                a = dc / dw; b = complex(b1["cx"], b1["cy"]) - a * complex(a1["cx"], a1["cy"])
                inl = []
                for t in w:
                    z = a * complex(t["cx"], t["cy"]) + b
                    m = np.hypot(cpts[:, 0] - z.real, cpts[:, 1] - z.imag)
                    j = int(m.argmin())
                    if m[j] < tol and cvals[j] == t["tap_value"]:
                        inl.append((t, coax_taps[j]))
                if len(inl) > len(best[1]):
                    best = ((a, b), inl)
    if not best[0] or len(best[1]) < 8:
        return None
    t = fit([(x["cx"], x["cy"]) for x, _ in best[1]], [(y["cx"], y["cy"]) for _, y in best[1]])
    res = [abs(t[0] * complex(x["cx"], x["cy"]) + t[1] - complex(y["cx"], y["cy"])) for x, y in best[1]]
    return t, best[1], float(np.sqrt(np.mean(np.square(res))))
