"""Parse the design tables (fiber termination, actives, EOL) that follow the map page."""
import re
import pdfplumber

NUM = re.compile(r"^-?\d+(\.\d+)?$")


def _num(t):
    return float(t) if NUM.match(t) else (None if t == "N/A" else t)


def _rows(page, tol=8):
    ws = page.extract_words(x_tolerance=3, y_tolerance=3)
    ws.sort(key=lambda w: (w["top"], w["x0"]))
    rows = []
    for w in ws:
        if rows and abs(rows[-1][0] - w["top"]) <= tol:
            rows[-1][1].append(w)
        else:
            rows.append([w["top"], [w]])
    return [(t, sorted(r, key=lambda w: w["x0"])) for t, r in rows]


def parse_tables(path, first_table_page=1):
    pdf = pdfplumber.open(path)
    out = {"fiber_termination": None, "headers": {}, "actives": [], "eol": []}
    for pi in range(first_table_page, len(pdf.pages)):
        rows = _rows(pdf.pages[pi])
        for _, r in rows:
            txt = [w["text"] for w in r]
            if txt and re.fullmatch(r"FT\d+", txt[0]):
                out["fiber_termination"] = {"tag": txt[0], "name": " ".join(t for t, w in zip(txt[1:], r[1:]) if w["x0"] < 700),
                                            "mfg": next((t for t, w in zip(txt, r) if 700 <= w["x0"] < 1000), None),
                                            "model": next((t for t, w in zip(txt, r) if 1000 <= w["x0"] < 1500), None),
                                            "port_count": next((_num(t) for t, w in zip(txt, r) if 1500 <= w["x0"] < 2100), None)}
            if pi == first_table_page and "MHz" in txt and "MODEL" in txt:
                out["headers"]["freqs"] = [txt[i - 1] for i, t in enumerate(txt) if t == "MHz"]
            if txt and re.fullmatch(r"A\d+", txt[0]):
                out["actives"].append(_active(r))
            elif txt and re.fullmatch(r"E\d+", txt[0]) and len(txt) >= 3:
                out["eol"].append({"tag": txt[0], "d": _num(txt[1]), "a": _num(txt[2])})
    return out


def _active(r):
    f = lambda lo, hi: [w["text"] for w in r if lo <= w["x0"] < hi]
    model = (f(385, 700) or [None])[0]
    inp = [_num(t) for t in f(700, 1300)]
    outp = [_num(t) for t in f(1300, 1750)]
    pad_eq = [_num(t) if not re.match(r"^CS\d", t) else t for t in f(1750, 2350)]
    casc = [_num(t) for t in f(2350, 2520)]
    rest = f(2520, 4000)
    return {
        "tag": r[0]["text"], "name": (f(100, 380) or [None])[0], "model": model,
        "input_levels": inp, "output_levels": outp,
        "fwd_pad_eq_rtn_pad_eq": pad_eq, "cascade": casc,
        "dla": _num(rest[0]) if rest else None,
        "power_supply": rest[1] if len(rest) > 1 else None,
        "voltage": _num(rest[2]) if len(rest) > 2 else None,
        "current": _num(rest[3]) if len(rest) > 3 else None,
        "family": ("AOI/Vecima" if model and re.match(r"(AOI|VNS)", model) else "SA/other" if model else None),
    }
