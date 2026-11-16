import os, glob, pytest
from mapreader import tables, markup

UP = "/root/.claude/uploads/50c66368-df32-5623-a31d-37102e8587d6"
W = glob.glob(UP + "/*WALKOUT.pdf"); C = glob.glob(UP + "/*coax_only.pdf")


def test_classify():
    gl = markup.load_glossary()
    assert markup.classify_text("4-211604", gl)[0] == "pole_id"
    assert markup.classify_text("412", gl)[0] == "cable_size"
    assert markup.classify_text("192'", gl) == ("span_footage", 192)
    assert markup.classify_text("CSC", gl)[0] == "token"


@pytest.mark.skipif(not W, reason="sample missing")
def test_walkout():
    t = tables.parse_tables(W[0])
    assert len(t["actives"]) == 50 and len(t["eol"]) == 78
    assert t["actives"][1]["output_levels"] == [43.0, 31.0, 18.5, 18.5]
    mk, _ = markup.load_markup(W[0]); assert len(mk) == 5464


@pytest.mark.skipif(not C, reason="sample missing")
def test_coax():
    t = tables.parse_tables(C[0])
    assert len(t["actives"]) == 76 and t["headers"]["freqs"][0] == "1002"


@pytest.mark.skipif(not C, reason="sample missing")
def test_coax_symbols_and_tags():
    import pdfplumber
    from mapreader import symbols, basemap, tags
    ws = basemap.words(pdfplumber.open(C[0]).pages[0])
    sy, _ = symbols.run(C[0], ws)
    taps = [s for s in sy if s["class"] == "tap"]
    assert 150 < len(taps) < 260 and {11, 14, 17, 20, 23} <= {t["tap_value"] for t in taps}
    assert sum(s["class"] == "power_supply_label" for s in sy) >= 5
    mk, _ = markup.load_markup(C[0])
    tl = tags.link(mk, sy, tables.parse_tables(C[0]))
    assert len(tl) == 160 and all(x["table_row"] for x in tl)
