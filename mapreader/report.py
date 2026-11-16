"""Human-readable report from a recognition.json dict."""

def write(res, path):
    L = [f"# Recognition report: {res['source']}", ""]
    t = res["tables"]
    ft = t.get("fiber_termination") or {}
    L += ["## Design tables", f"- Fiber termination: {ft.get('tag')} {ft.get('name')} ({ft.get('model')}, {ft.get('port_count')} ports)",
          f"- Frequency headers: {t['headers'].get('freqs')}", f"- Actives: {len(t['actives'])}  | EOL rows: {len(t['eol'])}"]
    fam = {}
    for a in t["actives"]:
        fam[a["model"]] = fam.get(a["model"], 0) + 1
    L += ["- Active models: " + ", ".join(f"{k} x{v}" for k, v in sorted(fam.items(), key=lambda x: -x[1])), ""]
    b = res["basemap"]
    L += ["## Base map (vector)", f"- Words {b['n_words']}, lines {b['n_lines']}, curves {b['n_curves']}",
          f"- Symbol classes: {b['symbol_classes']}", f"- Tap values found: {b['tap_values']}", f"- Tap shapes: {b.get('tap_shapes')}", f"- Tap port counts (circle=2, square=4, octagon=8 per confirmed key; None = shape not in key): {b.get('tap_ports')}"]
    ps = b.get("power_supplies") or []
    if ps:
        L.append("- Power-supply labels (name, model, rated V, rated A, load A): " + "; ".join(f"{p['name']} {p['model_code']} {p['volts_label']}V {p['rated_amps']}A load {p['load_amps']}" for p in ps))
        tbl = {}
        for a in t["actives"]:
            if a["power_supply"] and a["current"]:
                tbl[a["power_supply"]] = round(tbl.get(a["power_supply"], 0) + a["current"], 2)
        L.append(f"- Table current summed per supply (for cross-check vs label load): {tbl}")
    tl = res.get("tag_links")
    if tl:
        cf = [x for x in tl if x.get("conflict")]
        vis = {}
        for x in tl:
            if x["kind"] == "active":
                vis[x["device"]] = vis.get(x["device"], 0) + 1
        L.append(f"- Active symbols by key (amplifier = inner black triangles): {vis}")
        L.append(f"- Table-model vs symbol conflicts needing review: {[(x['tag'], x['conflict']) for x in cf]}")
        L.append(f"- Yellow tags linked: {sum(1 for x in tl if x['kind']=='active')} actives, {sum(1 for x in tl if x['kind']=='eol_point')} EOL points (table has {len(t['actives'])} / {len(t['eol'])}); "
                 f"{sum(1 for x in tl if x['table_row'])} matched to a table row")
    L.append("")
    cg = res.get("cable_graph")
    if cg:
        L += ["## Cable runs (proposed, geometric)", f"- {cg}", "- Lengths are in PDF points; no pt-to-feet scale is established. Over-linking is likely at junction clusters (colocated links flagged)."]
    w = res.get("walkout")
    if w:
        s = w["summary"]
        L += ["## Walkout redlines", f"- Title block: {w['title_block']}", f"- Annotations by type: {s['annotations_by_type']}",
              f"- Cable sizes: {s['cable_sizes']}; other cable types: {s.get('cable_type_other')}",
              f"- Cable labels (deduped): {w.get('cable_labels')}  (footage pairing is a candidate only; printed .412 is assumed MC2 .500 by the user, printed value kept)", f"- Tokens (meaning unverified, see glossary.json): {s['tokens']}",
              f"- Unique pole IDs: {s['pole_ids']}; pole highlights: {s['highlights']}",
              f"- Address-tagged (C=commercial, G=government, inferred): {s['address_tagged']}", f"- Photos: {s['photos']}",
              "", "### Free-text field notes"] + [f"- {n}" for n in s["notes"]]
        L += ["", "### Reconciliation vs title block",
              "Title block says POLES 398, GOV 9, COMMERCIAL 40. Detected: "
              f"{s['pole_ids']} unique pole IDs, {sum(s['highlights'].values())} pole highlights, "
              f"G-tags {s['address_tagged'].get('G', 0)}, C-tags {s['address_tagged'].get('C', 0)}. Differences need field review."]
    open(path, "w").write("\n".join(L) + "\n")
