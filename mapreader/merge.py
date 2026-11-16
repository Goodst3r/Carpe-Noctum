"""python3 -m mapreader.merge <coax.pdf> <walkout.pdf> --out DIR

Coax-only map = authority for station names (A#/E#, table rows). Walkout = source of cable types, footages, poles, notes.
The walkout page is registered onto the coax page (align.py); walkout items are projected and listed per coax station as
CANDIDATES (never confirmed associations).
"""
import argparse, json, math, os, collections
import pdfplumber
from . import symbols, basemap, markup, tables, tags, link, align


def _taps(pdf):
    sy, _ = symbols.run(pdf, basemap.words(pdfplumber.open(pdf).pages[0]))
    return sy, [s for s in sy if s["class"] == "tap"]


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("coax"); ap.add_argument("walkout"); ap.add_argument("--out", required=True)
    ap.add_argument("--radius", type=float, default=25.0); ap.add_argument("--iters", type=int, default=4000)
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
    json.dump({"summary": rep, "stations": out}, open(os.path.join(a.out, "merged.json"), "w"), indent=1, default=dict)
    print(json.dumps(rep, default=dict, indent=1))


if __name__ == "__main__":
    main()
