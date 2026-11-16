"""python3 -m mapreader.cli <pdf> --out DIR  : full recognition run."""
import argparse, json, os, subprocess, sys
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
    res["basemap"] = {k: v for k, v in bm.items() if k != "symbols"}
    if mk and any(m["type"] != "FreeText" for m in mk):
        syms, _ = link.compose(mk)
        res["walkout"] = {"title_block": link.title_block(mk), "summary": link.summarize(mk, syms)}
        json.dump(mk, open(os.path.join(a.out, "markup.json"), "w"))
        json.dump(syms, open(os.path.join(a.out, "walkout_symbols.json"), "w"))
    json.dump(bm["symbols"], open(os.path.join(a.out, "basemap_symbols.json"), "w"))
    json.dump(res, open(os.path.join(a.out, "recognition.json"), "w"), indent=1, default=str)
    report.write(res, os.path.join(a.out, 'report.md'))
    if not a.no_overlay:
        overlay(a.pdf, a.out, bm["symbols"], mk)
    print(json.dumps({k: res[k] for k in ("basemap",) }, default=str)[:1500])


if __name__ == "__main__":
    main()
