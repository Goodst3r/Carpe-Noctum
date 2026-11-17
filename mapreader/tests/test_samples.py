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


@pytest.mark.skipif(not C, reason="sample missing")
def test_five_reviewed_actives_are_line_extenders():
    import pdfplumber
    from mapreader import symbols, basemap, tags
    sy, _ = symbols.run(C[0], basemap.words(pdfplumber.open(C[0]).pages[0]))
    mk, _ = markup.load_markup(C[0])
    dev = {x["tag"]: x["device"] for x in tags.link(mk, sy, tables.parse_tables(C[0]))}
    for k in ("A5", "A23", "A25", "A68", "A70"):
        assert dev[k] == "line_extender"   # empty triangle beside a directional coupler; no inner black triangles


@pytest.mark.skipif(not C, reason="sample missing")
def test_symbol_level_line_extenders_and_rotated_taps():
    import pdfplumber
    from mapreader import symbols, basemap
    sy, _ = symbols.run(C[0], basemap.words(pdfplumber.open(C[0]).pages[0]))
    assert sum(s["class"] == "line_extender" for s in sy) >= 44      # outline triangles rebuilt from split segments
    four = [s for s in sy if s["class"] == "tap" and s.get("ports") == 4]
    assert len(four) >= 95 and any(s["tap_shape"] == "rotated_square" for s in four)


def test_rg11_is_cable_type():
    gl = markup.load_glossary()
    assert markup.classify_text("RG11", gl) == ("cable_type_other", "RG11")


@pytest.mark.skipif(not W, reason="sample missing")
def test_walkout_cable_labels():
    from mapreader import link
    mk, _ = markup.load_markup(W[0])
    cl = link.cable_labels(mk)
    assert 380 <= len(cl) <= 390 and sum(x["printed"] == "RG11" for x in cl) == 8
    assert all("nearest_footage_candidate" not in x for x in cl)    # footage is strand length, never paired with cable


@pytest.mark.skipif(not (W and C), reason="samples missing")
def test_walkout_registers_onto_coax_page():
    import json, os, tempfile
    from mapreader import merge
    d = tempfile.mkdtemp()
    merge.main([C[0], W[0], "--out", d])
    s = json.load(open(os.path.join(d, "merged.json")))["summary"]
    assert s["transform"]["rms_pt"] < 2 and abs(s["transform"]["rotation_deg"]) < 1
    assert s["walkout_items"]["span_footage"] - s["inside_coax_extent"]["span_footage"] == 2   # two footages fall off the coax sheet
    c = s["cable_labels_on_links"]    # cable-size labels sit by the CABLE (not strand): most are within 6 pt of traced cable
    assert c["within_6pt_of_any_cable_segment"] >= 300


@pytest.mark.skipif(not C, reason="sample missing")
def test_cable_graph_v1():
    import pdfplumber
    from mapreader import symbols, basemap, graph, prims
    sy, _ = symbols.run(C[0], basemap.words(pdfplumber.open(C[0]).pages[0]))
    dev = [s for s in sy if s["class"] in graph.DEVICE_CLASSES]
    G = graph.build(prims.paths(C[0]), dev)
    L = graph.device_links(G, dev)
    assert sum(1 for d in G["devices"] if G["adj"][d]) >= 280 and 300 < len(L) < 700
