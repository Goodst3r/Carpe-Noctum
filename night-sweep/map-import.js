/* Local-only map reading. No RF formulas, storage keys, or automatic confirmations. */
(function (root) {
  "use strict";
  const LIMITS = Object.freeze({
    bytes: 20 * 1024 * 1024,
    pages: 8,
    pixels: 16000000,
    candidates: 200,
    segments: 4000,
  });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const unique = (a) => Array.from(new Set(a));
  const point = (s, end) => ({
    x: s[end ? "x2" : "x1"],
    y: s[end ? "y2" : "y1"],
  });
  function projection(p, s) {
    const dx = s.x2 - s.x1,
      dy = s.y2 - s.y1,
      n = dx * dx + dy * dy;
    const t = n
      ? Math.max(0, Math.min(1, ((p.x - s.x1) * dx + (p.y - s.y1) * dy) / n))
      : 0;
    return { x: s.x1 + t * dx, y: s.y1 + t * dy, t };
  }
  function intersection(a, b) {
    const ax = a.x2 - a.x1,
      ay = a.y2 - a.y1,
      bx = b.x2 - b.x1,
      by = b.y2 - b.y1,
      d = ax * by - ay * bx;
    if (Math.abs(d) < 1e-8) return null;
    const x = b.x1 - a.x1,
      y = b.y1 - a.y1,
      t = (x * by - y * bx) / d,
      u = (x * ay - y * ax) / d;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1
      ? {
          x: a.x1 + t * ax,
          y: a.y1 + t * ay,
          crossing: t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98,
        }
      : null;
  }
  function boundedSegments(segments) {
    if (segments.length > LIMITS.segments)
      throw Error(
        "Map contains more than 4000 cable segments. Split it into smaller sections.",
      );
    return segments;
  }
  function geometry(page, candidates) {
    const segments = boundedSegments(page.segments).filter(
      (s) => distance(point(s), point(s, true)) > 5,
    );
    const cuts = segments.map((s) => [point(s), point(s, true)]),
      nodes = [],
      edges = [],
      candidateNodes = new Map();
    const node = (p) => {
      let i = nodes.findIndex((n) => distance(n, p) < 50);
      if (i < 0) {
        i = nodes.length;
        nodes.push({ ...p });
        edges.push([]);
      } else {
        if (p.crossing) nodes[i].crossing = true;
        if (distance(nodes[i], p) > 3) nodes[i].snapped = true;
      }
      return i;
    };
    for (let i = 0; i < segments.length; i++)
      for (let j = i + 1; j < segments.length; j++) {
        const p = intersection(segments[i], segments[j]);
        if (p) {
          cuts[i].push(p);
          cuts[j].push(p);
        }
      }
    for (const c of candidates) {
      if (c.positionReadable === false) continue;
      let best = -1,
        gap = Infinity,
        p;
      segments.forEach((s, i) => {
        const q = projection(c, s),
          d = distance(c, q);
        if (d < gap) {
          best = i;
          gap = d;
          p = q;
        }
      });
      if (best >= 0 && gap < 110) {
        cuts[best].push(p);
        candidateNodes.set(c.id, node(p));
      }
    }
    segments.forEach((s, i) => {
      cuts[i].sort((a, b) => projection(a, s).t - projection(b, s).t);
      for (let j = 1; j < cuts[i].length; j++) {
        const a = node(cuts[i][j - 1]),
          b = node(cuts[i][j]);
        if (a !== b) {
          const cost = distance(nodes[a], nodes[b]);
          edges[a].push({ to: b, cost, segment: i });
          edges[b].push({ to: a, cost, segment: i });
        }
      }
    });
    return { segments, nodes, edges, candidateNodes };
  }
  function buildDraft(document, selection) {
    const candidates = document.candidates || [],
      launch = candidates.find((c) => c.id === selection.launchId);
    if (!launch) throw Error("Choose a recognized launch.");
    if (launch.kind === "passive")
      throw Error("Choose a node or active as the launch, not a passive.");
    if (launch.status === "absent")
      throw Error("An absent station cannot be the launch.");
    if (launch.status === "proposed")
      throw Error(
        "A proposed station cannot be the launch until its installed status is reviewed.",
      );
    if (!String(selection.port || "").trim())
      throw Error("Choose the launch output port.");
    const destinations = (selection.destinationIds || [])
      .map((id) => candidates.find((c) => c.id === id))
      .filter(Boolean);
    if (!destinations.length) throw Error("Choose at least one destination.");
    if (destinations.some((c) => c.status === "absent"))
      throw Error("An absent station cannot be a destination.");
    const page = document.pages.find((p) => p.number === launch.page),
      local = candidates.filter((c) => c.page === launch.page),
      g = geometry(page, local);
    const start = g.candidateNodes.get(launch.id),
      costs = g.nodes.map(() => Infinity),
      prev = new Map(),
      todo = new Set(g.nodes.map((_, i) => i));
    if (start !== undefined) costs[start] = 0;
    while (todo.size) {
      let at = -1;
      for (const i of todo) if (at < 0 || costs[i] < costs[at]) at = i;
      if (!Number.isFinite(costs[at])) break;
      todo.delete(at);
      for (const e of g.edges[at])
        if (costs[at] + e.cost < costs[e.to]) {
          costs[e.to] = costs[at] + e.cost;
          prev.set(e.to, { from: at, segment: e.segment });
        }
    }
    const required = new Set(),
      paths = new Map(),
      unreachable = [];
    for (const c of destinations) {
      let n = g.candidateNodes.get(c.id);
      if (
        c.page !== launch.page ||
        n === undefined ||
        !Number.isFinite(costs[n])
      ) {
        unreachable.push(c);
        continue;
      }
      const path = [];
      while (n !== start) {
        path.unshift(n);
        const p = prev.get(n);
        if (!p) break;
        n = p.from;
      }
      path.unshift(start);
      paths.set(c.id, path);
      path.forEach((i) => required.add(i));
    }
    const included = local
      .filter(
        (c) =>
          c.id !== launch.id &&
          c.status !== "absent" &&
          required.has(g.candidateNodes.get(c.id)),
      )
      .sort(
        (a, b) =>
          costs[g.candidateNodes.get(a.id)] - costs[g.candidateNodes.get(b.id)],
      );
    unreachable.forEach((c) => {
      if (!included.includes(c)) included.push(c);
    });
    const idByCandidate = new Map(
        included.map((c, i) => [c.id, "r" + (i + 1)]),
      ),
      candidateByNode = new Map(
        included.map((c) => [g.candidateNodes.get(c.id), c]),
      );
    const labels = page.cableLabels || [],
      labelSegments = new Map();
    for (const label of labels) {
      let best = -1,
        min = Infinity,
        position;
      g.segments.forEach((s, i) => {
        const points = [
          label,
          { x: label.left ?? label.x, y: label.y },
          { x: label.right ?? label.x, y: label.y },
        ];
        for (const p of points) {
          const q = projection(p, s),
            d = distance(p, q);
          if (d < min) {
            min = d;
            best = i;
            position = q;
          }
        }
      });
      if (min < 110) labelSegments.set(label, { segment: best, position });
    }
    const rows = included.map((c) => {
      const reasons = [];
      if (c.textSource === "ocr")
        reasons.push(
          "OCR text: verify NAME, TAG and model against the original.",
        );
      if (c.positionReason) reasons.push(c.positionReason);
      const n0 = g.candidateNodes.get(c.id),
        segmentIds = new Set(),
        traversed = [];
      let n = n0,
        parent = null,
        unclear = false;
      if (unreachable.includes(c)) {
        reasons.push(
          c.page !== launch.page
            ? "Cross-page continuation is unconfirmed."
            : "No readable connected cable path to this destination.",
        );
      } else
        while (n !== start) {
          if (g.nodes[n]?.crossing) unclear = true;
          if (g.nodes[n]?.snapped)
            reasons.push(
              "Nearby cable ends were joined geometrically: confirm this connection.",
            );
          const p = prev.get(n);
          if (!p) break;
          segmentIds.add(p.segment);
          traversed.push({
            segment: p.segment,
            x1: g.nodes[n].x,
            y1: g.nodes[n].y,
            x2: g.nodes[p.from].x,
            y2: g.nodes[p.from].y,
          });
          n = p.from;
          const found = candidateByNode.get(n);
          if (found && found.id !== c.id) {
            parent = found;
            break;
          }
        }
      const spanLabels = labels.filter((l) => {
          const link = labelSegments.get(l);
          return (
            link &&
            traversed.some(
              (edge) =>
                edge.segment === link.segment &&
                (() => {
                  const s = g.segments[edge.segment],
                    t = projection(link.position, s).t,
                    a = projection(point(edge), s).t,
                    b = projection(point(edge, true), s).t;
                  return (
                    t >= Math.min(a, b) - 1e-6 && t <= Math.max(a, b) + 1e-6
                  );
                })(),
            )
          );
        }),
        lengths = spanLabels.map((l) => l.length).filter(Number.isFinite),
        sizes = unique(spanLabels.map((l) => l.size).filter(Boolean)),
        constructions = unique(
          spanLabels.map((l) => l.construction).filter(Boolean),
        );
      let length = lengths.length ? lengths.reduce((a, b) => a + b, 0) : "",
        cable = "";
      if (length === "") reasons.push("Cable length is unreadable.");
      if (sizes.length !== 1)
        reasons.push(
          sizes.length
            ? "Cable size transition: review each span."
            : "Cable size is unreadable.",
        );
      if (
        constructions.length !== 1 ||
        !spanLabels.length ||
        spanLabels.some((l) => !l.construction)
      )
        reasons.push("Cable construction is unverified.");
      else if (sizes.length === 1 && /^P3$/i.test(constructions[0]))
        cable = "p3_" + sizes[0].replace(/^\./, "");
      if (unclear)
        reasons.push("Cable crossing: confirm whether lines connect.");
      if (!c.device && c.kind === "active")
        reasons.push("Installed active model is unverified.");
      if (parent?.kind === "passive")
        reasons.push("Confirm the passive output port for this branch.");
      reasons.unshift("Confirm this draft connection against installed plant.");
      return {
        id: idByCandidate.get(c.id),
        name: c.name,
        parent: parent ? idByCandidate.get(parent.id) + "::through" : "source",
        length,
        cable,
        device: c.device || "none",
        customLoss: "",
        customCable: "",
        terminal: false,
        mapImport: {
          sourceId: document.source.id,
          page: c.page,
          tag: c.tag || "",
          kind: c.kind,
          installedModel: c.installedModel || "",
          modelConfirmed: false,
          connectionConfirmed: false,
          status: c.status === "proposed" ? "proposed" : "draft",
          reasons: unique(reasons),
          cableSize: sizes.join(" → "),
          cableConstruction: constructions.join(" → "),
          cableLabels: spanLabels.map((l) => l.text),
          spanEvidence: spanLabels.map((l) => ({ ...l })),
          pathGeometry: traversed,
          ports: c.ports || [],
          position: { x: c.x, y: c.y },
          unreachable: unreachable.includes(c),
        },
      };
    });
    return {
      rows,
      launch: {
        name: launch.name,
        tag: launch.tag || "",
        installedModel: launch.installedModel || "",
        port: selection.port,
        status: launch.status || "draft",
        confirmed: false,
        sourceId: document.source.id,
      },
      source: document.source,
      reviewItems: rows.map((r) => ({
        id: r.id,
        reasons: r.mapImport.reasons,
      })),
    };
  }
  let assetsPromise;
  function bytes64(text) {
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  }
  function script(code) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(
          new Blob([code], { type: "text/javascript" }),
        ),
        s = document.createElement("script");
      s.src = url;
      s.onload = () => {
        URL.revokeObjectURL(url);
        s.remove();
        resolve();
      };
      s.onerror = () => {
        URL.revokeObjectURL(url);
        s.remove();
        reject(Error("The local recognition library could not load."));
      };
      document.head.appendChild(s);
    });
  }
  async function libraries() {
    if (!assetsPromise)
      assetsPromise = (async () => {
        const el = document.getElementById("map-import-assets");
        if (!el)
          throw Error("This app build is missing its offline map libraries.");
        const assets = JSON.parse(el.textContent);
        for (const name of ["pdf-worker.js", "pdf.js", "ocr.js"]) {
          if (!assets[name]) throw Error("Missing local map asset: " + name);
          await script(bytes64(assets[name]));
        }
        return assets;
      })().catch((e) => {
        assetsPromise = null;
        throw e;
      });
    return assetsPromise;
  }
  async function ocrWorker(assets, onProgress) {
    const language = assets["eng.traineddata.gz"];
    const offlineFetch =
      'const mapPostMessage=self.postMessage.bind(self);self.postMessage=function(message,transfer){mapPostMessage(message,transfer);if(message.status==="reject")self.close();};self.fetch=async function(url){if(String(url)!=="blob:map-language/eng.traineddata.gz")throw Error("Network access disabled in local map OCR.");return new Response(Uint8Array.from(atob(' +
      JSON.stringify(language) +
      "),c=>c.charCodeAt(0)));};\n";
    const url = URL.createObjectURL(
      new Blob([offlineFetch, bytes64(assets["ocr-worker.js"])], {
        type: "text/javascript",
      }),
    );
    let rejectInitialization;
    const failed = new Promise((_, reject) => {
      rejectInitialization = reject;
    });
    try {
      const worker = await Promise.race([
        failed,
        root.Tesseract.createWorker("eng", 1, {
          workerPath: url,
          workerBlobURL: false,
          corePath: "offline-core.js",
          langPath: "blob:map-language",
          cacheMethod: "none",
          gzip: true,
          errorHandler: () =>
            rejectInitialization(
              Error(
                "Local OCR initialization failed. Reopen the map and try again.",
              ),
            ),
          logger: (m) =>
            onProgress?.(
              "Reading map: " +
                m.status +
                " " +
                Math.round((m.progress || 0) * 100) +
                "%",
            ),
        }),
      ]);
      await worker.setParameters({
        tessedit_pageseg_mode: "3",
        user_defined_dpi: "300",
      });
      return { worker, url };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }
  function lineGroups(tokens) {
    const lines = [];
    for (const t of [...tokens].sort((a, b) => a.y - b.y || a.x - b.x)) {
      let line = lines.find(
        (l) =>
          Math.abs(l.y + l.h / 2 - t.y - (t.h || 12) / 2) <
          Math.max(6, Math.max(l.h, t.h || 12) * 0.55),
      );
      if (!line) {
        line = { y: t.y, h: t.h || 12, tokens: [] };
        lines.push(line);
      }
      line.tokens.push(t);
    }
    return lines.map((l) => ({
      ...l,
      tokens: l.tokens.sort((a, b) => a.x - b.x),
      text: l.tokens
        .sort((a, b) => a.x - b.x)
        .map((t) => t.text)
        .join(" "),
    }));
  }
  function model(text) {
    if (/\bHGD\b/i.test(text) && !/(?:GAN|HIGH OUTPUT|\bHO\b)/i.test(text))
      return "active_gm_hgd";
    if (/\bHGBT\b/i.test(text)) return "active_gm_hgbt";
    return "";
  }
  function analyze(page) {
    const nativeLines = lineGroups(page.nativeTokens || []),
      ocrLines = lineGroups(page.ocrTokens || []),
      lines = nativeLines.length ? nativeLines : ocrLines;
    const header = lines.find(
      (l) =>
        l.tokens.some((t) => /^NAME$/i.test(t.text)) &&
        l.tokens.some((t) => /^TAG$/i.test(t.text)),
    );
    const candidates = [],
      allLines = [...lines, ...(nativeLines.length ? ocrLines : [])];
    let scheduleEnd = 0;
    if (header) {
      const nx = header.tokens.find((t) => /^NAME$/i.test(t.text)).x,
        tx = header.tokens.find((t) => /^TAG$/i.test(t.text)).x,
        mx = header.tokens.find((t) => /^MODEL$/i.test(t.text))?.x ?? Infinity;
      let previous = header.y;
      for (const l of lines
        .filter((l) => l.y > header.y)
        .sort((a, b) => a.y - b.y)) {
        if (l.y - previous > Math.max(65, header.h * 3.5)) break;
        previous = l.y;
        const cell = (a, b) =>
          l.tokens
            .filter((t) => t.x >= a - 5 && t.x < b - 5)
            .map((t) => t.text)
            .join(" ");
        const name = cell(nx, tx),
          tag = cell(tx, mx),
          installedModel = cell(mx, Infinity);
        if (!name || !tag) continue;
        scheduleEnd = l.y + header.h;
        candidates.push({
          id: "p" + page.number + "c" + candidates.length,
          name,
          tag,
          installedModel,
          device: model(installedModel),
          kind: /SPLIT|TAP|COUPLER|PASSIVE|\d-WAY/i.test(
            installedModel + " " + name,
          )
            ? "passive"
            : "active",
          textSource: nativeLines.length ? "pdf-text" : "ocr",
          status: /PROPOSED|PLANNED/i.test(installedModel)
            ? "proposed"
            : "draft",
          page: page.number,
          ports: [],
        });
      }
    }
    const usedTokens = new Set();
    for (const c of candidates) {
      const found = allLines.find(
        (l) => l.y > scheduleEnd + 10 && l.tokens.some((t) => t.text === c.tag),
      );
      let tok = found?.tokens.find((t) => t.text === c.tag);
      if (!tok && !nativeLines.length) {
        const fuzzy = allLines
          .filter((l) => l.y > scheduleEnd + 10)
          .flatMap((l) => l.tokens)
          .filter(
            (t) =>
              !usedTokens.has(t) &&
              t.text.length <= c.tag.length &&
              t.text[0] === c.tag[0] &&
              Math.abs(t.text.length - c.tag.length) <= 1 &&
              t.text !== c.name,
          );
        if (fuzzy.length === 1) {
          tok = fuzzy[0];
          c.positionReason =
            "Diagram tag is uncertain: " +
            tok.text +
            " may refer to " +
            c.tag +
            ".";
        }
      }
      if (tok) usedTokens.add(tok);
      if (tok) {
        const p = { x: tok.x + tok.w / 2, y: tok.y + (tok.h || 15) / 2 };
        let best = p,
          min = Infinity;
        for (const s of page.segments.filter(
          (s) => distance(point(s), point(s, true)) > 80,
        )) {
          const q = projection(p, s),
            d = distance(p, q);
          if (d < min) {
            min = d;
            best = q;
          }
        }
        const ends = page.segments
          .filter((s) => distance(point(s), point(s, true)) > 80)
          .flatMap((s) => [point(s), point(s, true)])
          .filter((q) => distance(q, best) < 100 && distance(q, p) < 145)
          .sort((a, b) => distance(a, p) - distance(b, p));
        if (ends.length) best = ends[0];
        c.x = best.x;
        c.y = best.y;
        c.positionReadable = min < 110;
      } else {
        c.x = 0;
        c.y = 0;
        c.positionReadable = false;
      }
      const absence = new RegExp(
        "(?:^|\\s)" +
          c.tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "\\s*[:=-]?\\s*(?:ABSENT|NOT INSTALLED|REMOVE[D]?|NOT BUILT)\\b",
        "i",
      );
      if (
        allLines.some((l) => absence.test(l.text)) ||
        page.annotations.some((a) => absence.test(a.text || ""))
      )
        c.status = "absent";
      c.ports = unique(
        allLines
          .filter(
            (l) =>
              l.y > scheduleEnd &&
              distance({ x: l.tokens[0]?.x || 0, y: l.y }, c) < 180,
          )
          .flatMap((l) =>
            Array.from(l.text.matchAll(/PORT\s*([\w-]+)/gi), (m) => m[1]),
          ),
      ).filter((v) => v.toUpperCase() !== "PORT");
    }
    const cableLabels = [],
      chunks = [];
    for (const line of lines.filter((l) => l.y > scheduleEnd)) {
      let chunk = [];
      for (const t of line.tokens) {
        const last = chunk.at(-1);
        if (last && t.x - last.x - last.w > Math.max(35, t.h * 2)) {
          chunks.push({
            y: line.y,
            tokens: chunk,
            text: chunk.map((t) => t.text).join(" "),
          });
          chunk = [];
        }
        chunk.push(t);
      }
      if (chunk.length)
        chunks.push({
          y: line.y,
          tokens: chunk,
          text: chunk.map((t) => t.text).join(" "),
        });
    }
    for (const l of chunks) {
      const match = l.text.match(
        /(\d+(?:\.\d+)?)\s*(?:ft|feet|')\s*(?:(P3|QR|MC2)\s*)?([.]\d{3}|\d{3})(?:\b|$)/i,
      );
      if (match) {
        const t = l.tokens[0];
        cableLabels.push({
          left: t.x,
          right: l.tokens.at(-1).x + l.tokens.at(-1).w,
          x: t.x + (l.tokens.at(-1).x + l.tokens.at(-1).w - t.x) / 2,
          y: l.y + (t.h || 15) / 2,
          length: Number(match[1]),
          size: match[3].startsWith(".") ? match[3] : "." + match[3],
          construction: match[2] || "",
          text: match[0],
        });
      }
    }
    page.cableLabels = cableLabels;
    page.text = lines.map((l) => l.text).join("\n");
    return candidates;
  }
  function rasterSegments(canvas, tokens) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true }),
      w = canvas.width,
      h = canvas.height,
      pixels = ctx.getImageData(0, 0, w, h).data,
      mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++)
      mask[i] =
        Math.min(pixels[4 * i], pixels[4 * i + 1], pixels[4 * i + 2]) < 150
          ? 1
          : 0;
    for (const t of tokens) {
      for (
        let y = Math.max(0, Math.floor(t.y - 2));
        y < Math.min(h, t.y + t.h + 2);
        y++
      )
        mask.fill(
          0,
          y * w + Math.max(0, Math.floor(t.x - 2)),
          y * w + Math.min(w, Math.ceil(t.x + t.w + 2)),
        );
    }
    const out = [];
    function scan(vertical) {
      const outer = vertical ? w : h,
        inner = vertical ? h : w;
      for (let a = 0; a < outer; a += 2) {
        let start = -1,
          last = -1;
        for (let b = 0; b <= inner; b++) {
          const ink = b < inner && mask[vertical ? b * w + a : a * w + b];
          if (ink) {
            if (start < 0) start = b;
            last = b;
          } else if (start >= 0 && b - last > 4) {
            if (last - start >= 55) {
              const s = vertical
                ? { x1: a, y1: start, x2: a, y2: last }
                : { x1: start, y1: a, x2: last, y2: a };
              if (
                !out.some(
                  (q) =>
                    Math.abs(q.x1 - s.x1) < 6 &&
                    Math.abs(q.y1 - s.y1) < 6 &&
                    Math.abs(q.x2 - s.x2) < 6 &&
                    Math.abs(q.y2 - s.y2) < 6,
                )
              )
                out.push(s);
            }
            start = -1;
          }
        }
      }
    }
    scan(false);
    scan(true);
    return boundedSegments(out);
  }
  function vectorSegments(ops, viewport, lib) {
    const out = [],
      stack = [];
    let matrix = viewport.transform.slice();
    const mul = (a, b) => [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5],
    ];
    const xy = (x, y) => ({
      x: matrix[0] * x + matrix[2] * y + matrix[4],
      y: matrix[1] * x + matrix[3] * y + matrix[5],
    });
    ops.fnArray.forEach((fn, i) => {
      const a = ops.argsArray[i];
      if (fn === lib.OPS.save) stack.push(matrix.slice());
      else if (fn === lib.OPS.restore)
        matrix = stack.pop() || viewport.transform.slice();
      else if (fn === lib.OPS.transform) matrix = mul(matrix, a);
      else if (fn === lib.OPS.constructPath) {
        const data = a[1]?.[0];
        if (!data || typeof data.length !== "number") return;
        let at = null,
          start = null;
        for (let j = 0; j < data.length; ) {
          const op = data[j++];
          if (op === 0) {
            at = xy(data[j++], data[j++]);
            start = at;
          } else if (op === 1) {
            const to = xy(data[j++], data[j++]);
            if (at && distance(at, to) > 65)
              out.push({ x1: at.x, y1: at.y, x2: to.x, y2: to.y });
            at = to;
          } else if (op === 2) {
            j += 4;
            at = xy(data[j++], data[j++]);
          } else if (op === 3) {
            j += 2;
            at = xy(data[j++], data[j++]);
          } else if (op === 4) at = start;
          else break;
        }
      }
    });
    return boundedSegments(out);
  }
  async function recognize(canvas, worker) {
    const { data } = await worker.recognize(
      canvas,
      {},
      { text: true, blocks: true },
    );
    return (data.blocks || []).flatMap((b) =>
      (b.paragraphs || []).flatMap((p) =>
        (p.lines || []).flatMap((l) =>
          (l.words || []).map((w) => ({
            text: w.text,
            x: w.bbox.x0,
            y: w.bbox.y0,
            w: w.bbox.x1 - w.bbox.x0,
            h: w.bbox.y1 - w.bbox.y0,
            confidence: w.confidence,
          })),
        ),
      ),
    );
  }
  async function read(file, options = {}) {
    if (!file || typeof file.arrayBuffer !== "function")
      throw Error("Choose a local PDF, PNG, JPEG, or WebP map.");
    if (file.size > LIMITS.bytes)
      throw Error(
        "Map exceeds the 20 MiB local import limit. Split it into smaller files.",
      );
    if (!file.size) throw Error("The map file is empty.");
    const ext = String(file.name || "")
      .split(".")
      .pop()
      .toLowerCase();
    if (!["pdf", "png", "jpg", "jpeg", "webp"].includes(ext))
      throw Error("Choose a PDF, PNG, JPEG, or WebP map.");
    const assets = await libraries(),
      raw = await file.arrayBuffer(),
      digest = await crypto.subtle.digest("SHA-256", raw),
      source = {
        id: Array.from(new Uint8Array(digest), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join(""),
        name: file.name,
        bytes: file.size,
        method: "local PDF.js + Tesseract",
        review: "Unconfirmed map interpretation",
      };
    let ocr, pdf;
    const pages = [];
    try {
      ocr = await ocrWorker(assets, options.onProgress);
      if (ext === "pdf") {
        const lib = root.pdfjsLib,
          task = lib.getDocument({
            data: new Uint8Array(raw),
            isEvalSupported: false,
            useWasm: false,
            enableXfa: false,
            useWorkerFetch: false,
            disableAutoFetch: true,
            disableStream: true,
            isOffscreenCanvasSupported: false,
            maxImageSize: LIMITS.pixels,
            verbosity: 0,
          });
        task.onPassword = () => task.destroy();
        pdf = await task.promise;
        if (pdf.numPages > LIMITS.pages)
          throw Error(
            "Map exceeds the 8-page local recognition limit. Split the PDF first.",
          );
        for (let number = 1; number <= pdf.numPages; number++) {
          options.onProgress?.(
            "Reading PDF page " + number + " of " + pdf.numPages,
          );
          const p = await pdf.getPage(number),
            base = p.getViewport({ scale: 1 }),
            scale = Math.min(2, 2400 / Math.max(base.width, base.height)),
            viewport = p.getViewport({ scale });
          if (viewport.width * viewport.height > LIMITS.pixels)
            throw Error(
              "Map page exceeds the 16-million-pixel recognition limit.",
            );
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const content = await p.getTextContent(),
            nativeTokens = content.items
              .filter((t) => t.str?.trim())
              .map((t) => {
                const m = lib.Util.transform(viewport.transform, t.transform),
                  height = Math.hypot(m[2], m[3]);
                return {
                  text: t.str,
                  x: m[4],
                  y: m[5] - height,
                  w: t.width * scale,
                  h: height,
                };
              });
          const annotations = (
              await p.getAnnotations({ intent: "display" })
            ).map((a) => ({
              type: a.subtype,
              text: a.contentsObj?.str || a.contents || "",
              rect: a.rect,
            })),
            ops = await p.getOperatorList(),
            segments = vectorSegments(ops, viewport, lib);
          await p.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
            annotationMode: lib.AnnotationMode.ENABLE,
          }).promise;
          const ocrTokens = await recognize(canvas, ocr.worker);
          pages.push({
            number,
            width: canvas.width,
            height: canvas.height,
            nativeTokens,
            ocrTokens,
            annotations,
            segments: segments.length
              ? segments
              : rasterSegments(canvas, ocrTokens),
            preview: canvas.toDataURL("image/jpeg", 0.65),
          });
          p.cleanup();
          canvas.width = canvas.height = 1;
        }
      } else {
        let bitmap;
        try {
          bitmap = await createImageBitmap(
            new Blob([raw], { type: file.type || "image/" + ext }),
          );
        } catch (e) {
          throw Error(
            "The local image could not be decoded. Choose a valid PNG, JPEG, or WebP.",
          );
        }
        if (bitmap.width * bitmap.height > LIMITS.pixels) {
          bitmap.close();
          throw Error(
            "Image exceeds the 16-million-pixel recognition limit. Resize the image first.",
          );
        }
        const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height)),
          canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
          .getContext("2d")
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const ocrTokens = await recognize(canvas, ocr.worker);
        pages.push({
          number: 1,
          width: canvas.width,
          height: canvas.height,
          nativeTokens: [],
          ocrTokens,
          annotations: [],
          segments: rasterSegments(canvas, ocrTokens),
          preview: canvas.toDataURL("image/jpeg", 0.65),
        });
        canvas.width = canvas.height = 1;
      }
      const candidates = pages.flatMap(analyze);
      if (candidates.length > LIMITS.candidates)
        throw Error(
          "Map has more than 200 recognized points. Split it into smaller sections.",
        );
      return {
        source,
        pages,
        candidates,
        originalFile: file,
        warnings: candidates.length
          ? []
          : [
              "No readable NAME / TAG schedule found. Recognition text and page previews remain available for review.",
            ],
      };
    } catch (error) {
      if (error?.name === "InvalidPDFException")
        throw Error("The local PDF could not be decoded. Choose a valid PDF.");
      throw error;
    } finally {
      if (ocr) {
        await ocr.worker.terminate();
        URL.revokeObjectURL(ocr.url);
      }
      if (pdf) await pdf.destroy();
    }
  }
  function mount(container, { onDraft, onError } = {}) {
    const el = (tag, text, attrs = {}) => {
      const e = document.createElement(tag);
      if (text) e.textContent = text;
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      return e;
    };
    container.classList.add("map-import");
    container.replaceChildren();
    const title = el("h3", "Import a local map"),
      note = el(
        "p",
        "PDF or image · read on this device. Choose the launch, its output port and destinations, then review the draft against installed plant.",
      ),
      input = el("input", "", {
        type: "file",
        accept: ".pdf,.png,.jpg,.jpeg,.webp",
        "aria-label": "Choose a local map",
      }),
      status = el("p", "", { role: "status" }),
      content = el("div");
    const licenses = el("details"),
      licenseSummary = el(
        "summary",
        "Local recognition components and licenses",
      ),
      licenseText = el("pre");
    licenses.append(licenseSummary, licenseText);
    licenses.addEventListener("toggle", () => {
      if (licenses.open && !licenseText.textContent) {
        const data = document.getElementById("map-import-assets");
        if (data) {
          const assets = JSON.parse(data.textContent);
          licenseText.textContent = assets["NOTICE.txt"]
            ? new TextDecoder().decode(bytes64(assets["NOTICE.txt"]))
            : "License notices unavailable in this build.";
        }
      }
    });
    container.append(title, note, input, status, content, licenses);
    let current = null,
      disposed = false;
    input.addEventListener("change", async () => {
      if (!input.files[0]) return;
      input.disabled = true;
      content.replaceChildren();
      try {
        current = await read(input.files[0], {
          onProgress: (t) => {
            if (!disposed) status.textContent = t;
          },
        });
        if (disposed) return;
        status.textContent =
          current.candidates.length +
          " map points recognized. Every imported connection needs review.";
        for (const page of current.pages) {
          const details = el("details"),
            summary = el(
              "summary",
              "Page " +
                page.number +
                " · view original markings and recognized text",
            ),
            img = el("img", "", {
              src: page.preview,
              alt: "Local map page " + page.number,
            }),
            pre = el("pre", page.text);
          details.append(summary, img, pre);
          content.append(details);
        }
        if (!current.candidates.length) {
          status.textContent = current.warnings.join(" ");
          return;
        }
        const launch = el("select", "", {
            "aria-label": "Launch node or active",
          }),
          port = el("input", "", {
            placeholder: "Output port, e.g. Main",
            "aria-label": "Launch output port",
          }),
          destinations = el("fieldset"),
          legend = el("legend", "Destinations"),
          button = el("button", "Build editable route draft", {
            type: "button",
          });
        destinations.append(legend);
        for (const c of current.candidates) {
          if (c.status === "absent") continue;
          if (c.kind !== "passive" && c.status !== "proposed")
            launch.append(
              el("option", c.name + " · " + c.tag, { value: c.id }),
            );
          const label = el("label"),
            check = el("input", "", { type: "checkbox", value: c.id });
          label.append(
            check,
            document.createTextNode(
              c.name +
                " · " +
                c.tag +
                (c.status === "proposed" ? " · proposed" : ""),
            ),
          );
          destinations.append(label);
        }
        const absent = current.candidates.filter((c) => c.status === "absent");
        if (absent.length)
          content.append(
            el(
              "p",
              "Excluded as marked absent: " +
                absent.map((c) => c.name).join(", "),
            ),
          );
        content.append(
          el("label", "Launch node or active"),
          launch,
          el("label", "Output port"),
          port,
          destinations,
          button,
        );
        button.addEventListener("click", () => {
          try {
            const draft = buildDraft(current, {
              launchId: launch.value,
              port: port.value,
              destinationIds: Array.from(
                destinations.querySelectorAll("input:checked"),
              ).map((e) => e.value),
            });
            draft.originalFile = current.originalFile;
            onDraft?.(draft);
            status.textContent =
              draft.rows.length +
              " editable draft points added. Confirm each connection, cable and installed model.";
          } catch (e) {
            status.textContent = e.message;
            onError?.(e);
          }
        });
      } catch (e) {
        status.textContent = e.message || "Local map recognition failed.";
        onError?.(e);
      } finally {
        input.disabled = false;
      }
    });
    return {
      dispose() {
        disposed = true;
        current = null;
        container.replaceChildren();
      },
    };
  }
  root.NightSweepMapImport = Object.freeze({
    read,
    buildDraft,
    mount,
    limits: LIMITS,
  });
})(typeof window !== "undefined" ? window : globalThis);
