"""python3 -m mapreader.merge <coax.pdf> <walkout.pdf> --out DIR

Coax-only map = authority for station names (A#/E#, table rows). Walkout = source of cable types, footages, poles, notes.
The walkout page is registered onto the coax page (align.py); walkout items are projected and listed per coax station as
CANDIDATES (never confirmed associations).
"""
import argparse, json, math, os, collections
import pdfplumber
from . import symbols, basemap, markup, tables, tags, link, align, graph, prims, length


def _taps(pdf):
    sy, _ = symbols.run(pdf, basemap.words(pdfplumber.open(pdf).pages[0]))
    return sy, [s for s in sy if s["class"] == "tap"]


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("coax"); ap.add_argument("walkout"); ap.add_argument("--out", required=True)
    ap.add_argument("--radius", type=float, default=25.0); ap.add_argument("--iters", type=int, default=4000)
    ap.add_argument("--include-ambiguous", action="store_true", help="also use footage labels whose best pole pair is not unique")
    a = ap.parse_args(argv); os.makedirs(a.out, exist_ok=True)
    csy, ctaps = _taps(a.coax); _, wtaps = _taps(a.walkout)
    reg = align.register(wtaps, ctaps, iters=a.iters)
    if not reg:
        raise SystemExit("registration failed: not enough matching taps")
    T, inl, rms = reg
    cw = pdfplumber.open(a.coax).pages[0]
    cm, _ = markup.load_markup(a.coax); tb = tables.parse_tables(a.coax)
    stations = tags.link(cm, csy, tb)
    wm, _ = markup.load_markup(a.walkout)

    def proj(m):
        x, y = align.apply(T, [(m["cx"], m["cy"])])[0]
        return x, y

    items = []
    for m in wm:
        if m["type"] != "FreeText" or m["text_category"] not in ("cable_size", "cable_type_other", "span_footage", "pole_id", "note"):
            continue
        x, y = proj(m)
        items.append({"kind": m["text_category"], "text": m["text"], "x": x, "y": y, "in_coax_extent": 0 <= x <= cw.width and 0 <= y <= cw.height,
                      "color": m["color"]})
    # ---- cable (NOT strand): attach cable-size labels to traced cable links. Strand runs pole to pole and is walkout-only;
    # the coax-only sheet draws cable only, and cable passes in/out of passives and actives.
    dev = [x for x in csy if x["class"] in graph.DEVICE_CLASSES]
    G = graph.build(prims.paths(a.coax), dev)
    LK = graph.device_links(G, dev)
    keys = list(LK)

    def seg_d(p, q, r):
        dx, dy = r[0] - q[0], r[1] - q[1]; L2 = dx * dx + dy * dy
        t = 0 if L2 == 0 else max(0, min(1, ((p[0] - q[0]) * dx + (p[1] - q[1]) * dy) / L2))
        return math.hypot(p[0] - q[0] - t * dx, p[1] - q[1] - t * dy)

    def link_dist(pt, path):
        return min(seg_d(pt, u, v) for u, v in zip(path, path[1:])) if len(path) > 1 else 1e9
    segs = graph.cable_segments(prims.paths(a.coax))
    sgrid = {}
    for q, r in segs:
        for gx in range(int(min(q[0], r[0]) // 20) - 1, int(max(q[0], r[0]) // 20) + 2):
            for gy in range(int(min(q[1], r[1]) // 20) - 1, int(max(q[1], r[1]) // 20) + 2):
                sgrid.setdefault((gx, gy), []).append((q, r))

    def cable_d(pt):
        return min((seg_d(pt, q, r) for q, r in sgrid.get((int(pt[0] // 20), int(pt[1] // 20)), [])), default=1e9)
    label_links, dists, sdists = [], [], []
    for i in items:
        if i["kind"] not in ("cable_size", "cable_type_other") or not i["in_coax_extent"]:
            continue
        ranked = sorted(((link_dist((i["x"], i["y"]), LK[k]["path"]), k) for k in keys))[:2]
        dists.append(ranked[0][0]); sdists.append(cable_d((i["x"], i["y"])))
        label_links.append({"printed": i["text"].strip(), "x": round(i["x"], 1), "y": round(i["y"], 1), "dist_to_any_cable_pt": round(sdists[-1], 1),
                            "candidates": [{"link": list(k), "dist_pt": round(d, 1), "confirmed": False} for d, k in ranked if d <= 15]})
    poles = [{"x": round(x, 1), "y": round(y, 1)} for x, y in align.apply(T, [(m["cx"], m["cy"]) for m in wm if m["type"] == "Ink"])]
    # ---- cable length from strand footage (footage = strand length between two adjacent poles)
    sl = link.strand_layer(wm, prims.paths(a.walkout))
    pid = {}
    for m in wm:
        if m["text_category"] == "pole_id":
            pid.setdefault(m["value"], (m["cx"], m["cy"]))
    pole_pts = [(m["cx"], m["cy"]) for m in wm if m["type"] == "Ink"]

    def pole_pos(label_xy):                       # nearest highlighted pole within 20 pt of the ID label, else the label itself
        best = min(pole_pts, key=lambda q: math.dist(q, label_xy), default=None)
        return best if best and math.dist(best, label_xy) <= 20 else label_xy
    spans_c = []
    for k, pr in enumerate(sl["between_poles"]["pairs"]):
        if not pr["unique"] and not a.include_ambiguous:
            continue
        A, B = pid.get(pr["pole_id_pair"][0]), pid.get(pr["pole_id_pair"][1])
        if not A or not B:
            continue
        pa, pb = align.apply(T, [pole_pos(A), pole_pos(B)])
        spans_c.append({"a": pa, "b": pb, "feet": pr["feet"], "id": f"{pr['pole_id_pair'][0]}~{pr['pole_id_pair'][1]}"})
    est = []
    for k in keys:
        r = length.link_length(LK[k]["path"], spans_c)
        est.append({"link": list(k), "length_pt": round(LK[k]["length_pt"], 1), **r})
    cov = [e for e in est if e["coverage"] >= .5]
    tot_ft, n_sp = length.plant_total(est)
    rep_len = {"unique_cable_feet_along_footaged_spans": tot_ft, "spans_with_cable": n_sp, "links": len(est), "links_with_coverage_ge_50pct": len(cov), "estimated_feet_in_those_links": round(sum(e["est_ft"] for e in cov)),
               "unique_spans_used": len(spans_c),
               "note": "ESTIMATE: strand footage apportioned by fraction of each span the cable link follows; excludes slack, risers, underground, drops and spans without footage"}
    out = []
    for st in stations:
        near = sorted((i for i in items if math.hypot(i["x"] - st["x"], i["y"] - st["y"]) <= a.radius),
                      key=lambda i: math.hypot(i["x"] - st["x"], i["y"] - st["y"]))
        out.append({"tag": st["tag"], "kind": st["kind"], "name": (st["table_row"] or {}).get("name"), "device": st["device"],
                    "model": (st["table_row"] or {}).get("model"),
                    "walkout_candidates": [{**{k: i[k] for k in ("kind", "text")}, "dist_pt": round(math.hypot(i["x"] - st["x"], i["y"] - st["y"]), 1), "confirmed": False} for i in near[:12]]})
    rep = {"transform": {"scale": abs(T[0]), "rotation_deg": math.degrees(math.atan2(T[0].imag, T[0].real)), "inliers": len(inl), "rms_pt": rms,
                         "walkout_taps": len(wtaps), "coax_taps": len(ctaps)},
           "walkout_items": collections.Counter(i["kind"] for i in items), "inside_coax_extent": collections.Counter(i["kind"] for i in items if i["in_coax_extent"]),
           "stations_with_candidates": sum(1 for s in out if s["walkout_candidates"]), "stations": len(out)}
    rep["cable_labels_on_links"] = {"labels": len(label_links), "within_6pt_of_a_cable_link": sum(1 for d in dists if d <= 6),
                                     "within_15pt": sum(1 for d in dists if d <= 15), "cable_links": len(keys),
                                     "within_6pt_of_any_cable_segment": sum(1 for d in sdists if d <= 6), "within_10pt_of_any_cable_segment": sum(1 for d in sdists if d <= 10)}
    rep["strand_note"] = "Poles/strand are walkout-only and are NOT used to build cable links. footage labels are left unattached (pole span vs cable length unresolved)."
    rep["cable_length"] = rep_len
    json.dump({"summary": rep, "stations": out, "cable_label_candidates": label_links, "poles_projected": poles, "cable_length_estimates": est}, open(os.path.join(a.out, "merged.json"), "w"), indent=1, default=dict)
    print(json.dumps(rep, default=dict, indent=1))


if __name__ == "__main__":
    main()
