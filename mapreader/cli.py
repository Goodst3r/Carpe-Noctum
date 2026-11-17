"""python3 -m mapreader.cli <pdf> --out DIR  : full recognition run."""
import argparse, json, math, os, subprocess, sys
from PIL import Image, ImageDraw
from . import tables, markup, link, basemap, report, symbols, tags

COL = {"red": (220, 0, 0), "blue": (0, 60, 255), "green": (0, 170, 0), "magenta": (230, 0, 230),
       "yellow": (230, 180, 0)}


def overlay(pdf, out, syms, mk, scale=0.6):
    base = os.path.join(out, "_page")
    subprocess.run(["pdftoppm", "-r", str(72 * scale), "-f", "1", "-l", "1", "-png", "-singlefile", pdf, base], check=True)
    im = Image.open(base + ".png").convert("RGB"); d = ImageDraw.Draw(im)
    for s in syms:
        c = {"tap": (0, 150, 0), "amplifier": (255, 120, 0), "line_extender": (200, 160, 0), "directional_coupler": (200, 0, 200),
             "splitter_2way": (0, 0, 255), "node_symbol_candidate": (0, 0, 120), "leg_arrow": (190, 190, 190)}.get(s["class"], (120, 120, 120))
        r = max(s["w"], 3) * scale
        x, y = s["cx"] * scale, s["cy"] * scale
        d.rectangle([x - r, y - r, x + r, y + r], outline=c, width=1)
    for m in mk or []:
        if m.get("text_category") in ("pole_id", "span_footage"):
            continue
        b = [v * scale for v in m["bbox"]]
        d.rectangle(b, outline=COL.get(m["color"], (90, 90, 90)), width=1)
    im.save(os.path.join(out, "overlay.png")); os.remove(base + ".png")


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("pdf"); ap.add_argument("--out", required=True)
    ap.add_argument("--no-overlay", action="store_true")
    a = ap.parse_args(argv); os.makedirs(a.out, exist_ok=True)
    res = {"source": os.path.basename(a.pdf)}
    res["tables"] = tables.parse_tables(a.pdf)
    mk, H = markup.load_markup(a.pdf)
    res["markup_count"] = len(mk)
    bm = basemap.run(a.pdf)
    import pdfplumber
    sy, _ = symbols.run(a.pdf, basemap.words(pdfplumber.open(a.pdf).pages[0]))
    bm["symbols"] = sy
    bm["symbol_classes"] = dict(__import__("collections").Counter(x["class"] for x in sy))
    bm["tap_values"] = dict(sorted(__import__("collections").Counter(x["tap_value"] for x in sy if x["class"] == "tap").items()))
    bm["tap_ports"] = dict(__import__("collections").Counter(str(x.get("ports")) for x in sy if x["class"] == "tap"))
    bm["tap_shapes"] = dict(__import__("collections").Counter(x["tap_shape"] for x in sy if x["class"] == "tap"))
    bm["power_supplies"] = [x for x in sy if x["class"] == "power_supply_label"]
    res["tag_links"] = tags.link(mk, sy, res["tables"])
    import math
    for tl in res["tag_links"]:
        if tl["kind"] == "active" and tl["device"] in ("amplifier", "line_extender") and not any(
                x["class"] in ("amplifier", "line_extender") and math.hypot(x["cx"] - tl["x"], x["cy"] - tl["y"]) < 5 for x in sy):
            sy.append({"class": tl["device"], "shape": "triangle", "filled": False, "cx": tl["x"], "cy": tl["y"], "w": 5, "h": 5,
                       "basis": "A# tag (triangle outline not isolated in vectors)", "tag": tl["tag"]})
    bm["symbol_classes"] = dict(__import__("collections").Counter(x["class"] for x in sy))
    res["basemap"] = {k: v for k, v in bm.items() if k != "symbols"}
    if mk and any(m["type"] != "FreeText" for m in mk):
        syms, _ = link.compose(mk)
        res["walkout"] = {"title_block": link.title_block(mk), "summary": link.summarize(mk, syms)}
        json.dump(mk, open(os.path.join(a.out, "markup.json"), "w"))
        json.dump(syms, open(os.path.join(a.out, "walkout_symbols.json"), "w"))
        cl = link.cable_labels(mk)
        res["walkout"]["cable_labels"] = {"total": len(cl), "by_printed": dict(__import__("collections").Counter(x["printed"] for x in cl))}
        json.dump(cl, open(os.path.join(a.out, "cable_labels.json"), "w"))
        from . import prims as _pr
        sl = link.strand_layer(mk, _pr.paths(a.pdf))
        json.dump(sl, open(os.path.join(a.out, "strand.json"), "w"))
        res["walkout"]["strand"] = {k: (len(v) if isinstance(v, list) else v) for k, v in sl.items()}
        res["walkout"]["cable_labels"].pop("with_footage_candidate", None)
    json.dump(bm["symbols"], open(os.path.join(a.out, "basemap_symbols.json"), "w"))
    if not any(m["type"] != "FreeText" for m in mk):      # coax-only sheet: trace cable runs
        from . import graph, prims
        P = prims.paths(a.pdf)
        dev = [x for x in sy if x["class"] in graph.DEVICE_CLASSES]
        G = graph.build(P, dev)
        L = graph.device_links(G, dev)
        stn = {}
        for tl in res["tag_links"]:
            k = min(range(len(dev)), key=lambda i: math.hypot(dev[i]["cx"] - tl["x"], dev[i]["cy"] - tl["y"]), default=None)
            if k is not None and math.hypot(dev[k]["cx"] - tl["x"], dev[k]["cy"] - tl["y"]) < 6:
                stn.setdefault(k, []).append(tl["tag"])
        gj = {"units": "PDF points (no scale to feet established)", "status": "PROPOSED geometric adjacency, not verified RF connectivity",
              "devices": [{"i": i, "class": d["class"], "x": d["cx"], "y": d["cy"], "station_tags": stn.get(i, []), "on_cable": bool(G["adj"][("dev", i)])} for i, d in enumerate(dev)],
              "links": [{"a": k[0], "b": k[1], "length_pt": round(v["length_pt"], 1), "colocated": v["length_pt"] < 4,
                         "path": [[round(x, 1), round(y, 1)] for x, y in v["path"]]} for k, v in L.items()]}
        json.dump(gj, open(os.path.join(a.out, "cable_graph.json"), "w"))
        res["cable_graph"] = {"devices": len(dev), "devices_on_cable": sum(1 for d in gj["devices"] if d["on_cable"]), "links": len(L),
                              "links_colocated": sum(1 for l in gj["links"] if l["colocated"]),
                              "stations_with_links": sum(1 for i, t in stn.items() if any(l["a"] == i or l["b"] == i for l in gj["links"]))}
    json.dump(res, open(os.path.join(a.out, "recognition.json"), "w"), indent=1, default=str)
    report.write(res, os.path.join(a.out, 'report.md'))
    if not a.no_overlay:
        overlay(a.pdf, a.out, bm["symbols"], mk)
    print(json.dumps({k: res[k] for k in ("basemap",) }, default=str)[:1500])


if __name__ == "__main__":
    main()
