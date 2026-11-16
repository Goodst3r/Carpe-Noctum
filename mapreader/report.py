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
          f"- Symbol classes: {b['symbol_classes']}", f"- Tap values found: {b['tap_values']}", ""]
    w = res.get("walkout")
    if w:
        s = w["summary"]
        L += ["## Walkout redlines", f"- Title block: {w['title_block']}", f"- Annotations by type: {s['annotations_by_type']}",
              f"- Cable sizes: {s['cable_sizes']}", f"- Tokens (meaning unverified, see glossary.json): {s['tokens']}",
              f"- Unique pole IDs: {s['pole_ids']}; pole highlights: {s['highlights']}",
              f"- Address-tagged (C=commercial, G=government, inferred): {s['address_tagged']}", f"- Photos: {s['photos']}",
              "", "### Free-text field notes"] + [f"- {n}" for n in s["notes"]]
        L += ["", "### Reconciliation vs title block",
              "Title block says POLES 398, GOV 9, COMMERCIAL 40. Detected: "
              f"{s['pole_ids']} unique pole IDs, {sum(s['highlights'].values())} pole highlights, "
              f"G-tags {s['address_tagged'].get('G', 0)}, C-tags {s['address_tagged'].get('C', 0)}. Differences need field review."]
    open(path, "w").write("\n".join(L) + "\n")
