var CarpeAI = (() => {
  var ti = Object.defineProperty;
  var xw = Object.getOwnPropertyDescriptor;
  var vw = Object.getOwnPropertyNames;
  var Ew = Object.prototype.hasOwnProperty;
  var Gt = /* @__PURE__ */ ((t) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(t, {
    get: (e, r) => (typeof require < "u" ? require : e)[r]
  }) : t)(function(t) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + t + '" is not supported');
  });
  var b = (t, e) => () => (t && (e = t(t = 0)), e);
  var br = (t, e) => {
    for (var r in e)
      ti(t, r, { get: e[r], enumerable: !0 });
  }, kw = (t, e, r, n) => {
    if (e && typeof e == "object" || typeof e == "function")
      for (let s of vw(e))
        !Ew.call(t, s) && s !== r && ti(t, s, { get: () => e[s], enumerable: !(n = xw(e, s)) || n.enumerable });
    return t;
  };
  var Aw = (t) => kw(ti({}, "__esModule", { value: !0 }), t);

  // app/ai-vision-models.mjs
  function Zu(t, e, r, n, s) {
    return Object.freeze({
      name: t.split("/").at(-1),
      path: t,
      bytes: e,
      sha256: r,
      repo: n,
      revision: s,
      url: `https://huggingface.co/${n}/resolve/${s}/${t}`
    });
  }
  var Tw, Sw, Cw, Iw, Ju, De, Mw, xr, ri = b(() => {
    Tw = "snowfluke/ppu-paddle-ocr-models", Sw = "3cbb26882389013ed863b66a78e52376b5ff0f0a", Cw = "onnx-community/Florence-2-base-ft", Iw = "e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f";
    Ju = (t, e, r) => Zu(t, e, r, Tw, Sw), De = (t, e, r) => Zu(t, e, r, Cw, Iw), Mw = [
      {
        id: "pp-doclayout-v3",
        label: "PP-DocLayoutV3",
        kind: "layout",
        license: "Apache-2.0",
        bundled: !1,
        source: "https://huggingface.co/PaddlePaddle/PP-DocLayoutV3",
        description: "Suggest document regions and reading order. Requires 129.9 MB of optional model weights; cannot identify cable topology or RF readings.",
        files: [
          Ju("layout/PP-DocLayoutV3.onnx", 129920689, "dc5670ebbb42e2ba4e41395fc55e8217b007134e8b9e35023d592a8fe040a288"),
          Ju("layout/PP-DocLayoutV3_labels.txt", 265, "a04c55c3bb398fe7c5ece52d279eb26a905f9645cd58c0c812fb9de3c4790f46")
        ]
      },
      {
        id: "florence2-base",
        label: "Florence-2 base fine-tuned",
        kind: "caption",
        license: "MIT",
        bundled: !1,
        source: "https://huggingface.co/onnx-community/Florence-2-base-ft",
        description: "Suggest a caption for a selected plan crop. Experimental and fallible; cannot establish electrical connections or RF values.",
        files: [
          De("onnx/vision_encoder_quantized.onnx", 93746540, "3b79d54f23f666f731549db23cb070c35a979ce19cbd9720e90e67a78dc9768c"),
          De("onnx/embed_tokens_quantized.onnx", 39390433, "6b2258db1c8ee9b160576ccde3cd3814d83a2edaed0dd1c6ca9ff3c38fa62214"),
          De("onnx/encoder_model_quantized.onnx", 43651493, "f4ad7a68f1fb875d3bcf735ea14a7021b7ba7e83baf7cf10289881b4ed6d9b85"),
          De("onnx/decoder_model_merged_quantized.onnx", 98177697, "f22f52f980c33df0efa15932c2f3db6d9d3595ce6387eca938b8cfe23dc4c641"),
          De("config.json", 5432, "d90c22ed72eb55291f183fcd9b98ebd3bd3d92bfcffb6c7f6e1606085e793525"),
          De("generation_config.json", 292, "7b8eb17bbd6cf8a07f619ad83ae03881eff05b6b9237bab89005b40e77783c29"),
          De("preprocessor_config.json", 2673, "c892857e34a7082284983a7717717d39c9bf7e574f1f41d80d4c918c97502efa"),
          De("special_tokens_map.json", 146627, "72ff172dc769bc1551b1b4211628ce3271643bc60379e4da45d85a9be9332c39"),
          De("tokenizer.json", 2297961, "d69dcdb2323e124ac4f800cb9863ddccea0d7bb11e16125e8df3bd60f2f8aeac"),
          De("tokenizer_config.json", 197658, "d8e64607233cb53b619fb46664f6cad08176c26e0e8735b2d30d888364f19600"),
          De("added_tokens.json", 22410, "ba67457c577895525996e7a42d7da60a05856506ea4fd25ff9a023a64662f74b"),
          De("merges.txt", 456318, "1ce1664773c50f3e0cc8842619a93edc4624525b728b188a9e0be33b7726adc5"),
          De("vocab.json", 1099884, "394fdc63c71aabe0a9b97117f5d62fb5fcc4d59b2b3ea929a3929e6a53217b3c")
        ]
      }
    ], xr = Object.freeze(Object.fromEntries(Mw.map((t) => [t.id, Object.freeze({
      ...t,
      files: Object.freeze(t.files),
      bytes: t.files.reduce((e, r) => e + r.bytes, 0),
      reviewRequired: !0
    })])));
  });

  // node_modules/onnxruntime-web/dist/ort.wasm.min.mjs
  var vt = {};
  br(vt, {
    InferenceSession: () => Ii,
    LoraAdapter: () => Mi,
    TRACE: () => ls,
    TRACE_EVENT_BEGIN: () => Zt,
    TRACE_EVENT_END: () => Qt,
    TRACE_FUNC_BEGIN: () => bt,
    TRACE_FUNC_END: () => xt,
    Tensor: () => nt,
    default: () => iy,
    env: () => ie,
    registerBackend: () => _n
  });
  var is, Ei, Rw, $w, Nw, Dw, re, ki, zw, _d, Er, yt, si, _n, oi, gd, wd, Ai, Bw, yd, Uw, ii, ke, bd, ie, Fw, ls, ai, bt, xt, Zt, Qt, Ti, Si, xd, Ed, kd, jw, ts, Ad, Td, Sd, Cd, Id, Ww, Jt, mn, li, Md, Vw, Od, Pd, Gw, Be, Ci, nt, Ld, Rd, qw, Ii, Hw, Mi, Yw, Xw, Kw, Jw, Zw, Nd, Pt, Oi, Dd, ci, ui, zd, Qw, di, Qu, ed, ze, Pi, rs, td, rd, fi, nd, hi, Bd, pi, Ud, Li, mi, ns, dn, _i, sd, od, id, Ri, oe, Sr, rt, cs, se, $i, Fd, ey, ad, ld, cd, qt, ud, jd, ty, Ar, as, Tr, Wd, Vd, Ni, Di, Gd, qd, ds, zi, dd, Bi, Ui, Ht, fd, gi, us, Fi, ji, fn, hd, Yt, Hd, Yd, wi, Wi, Vi, Gi, Xd, dt, Ye, kr, hn, pn, ss, yi, os, Xt, Kt, pd, Kd, Jd, Zd, Qd, ef, tf, rf, nf, sf, qi, Hi, of, bi, md, af, ry, lf, ny, cf, xi, vi, uf, sy, oy, iy, Cr = b(() => {
    is = {};
    Ei = Object.defineProperty, Rw = Object.getOwnPropertyDescriptor, $w = Object.getOwnPropertyNames, Nw = Object.prototype.hasOwnProperty, Dw = ((t) => typeof Gt < "u" ? Gt : typeof Proxy < "u" ? new Proxy(t, { get: (e, r) => (typeof Gt < "u" ? Gt : e)[r] }) : t)(function(t) {
      if (typeof Gt < "u") return Gt.apply(this, arguments);
      throw Error('Dynamic require of "' + t + '" is not supported');
    }), re = (t, e, r) => () => {
      if (r) throw r[0];
      try {
        return t && (e = t(t = 0)), e;
      } catch (n) {
        throw r = [n], n;
      }
    }, ki = (t, e) => {
      for (var r in e) Ei(t, r, { get: e[r], enumerable: !0 });
    }, zw = (t, e, r, n) => {
      if (e && typeof e == "object" || typeof e == "function") for (let s of $w(e)) !Nw.call(t, s) && s !== r && Ei(t, s, { get: () => e[s], enumerable: !(n = Rw(e, s)) || n.enumerable });
      return t;
    }, _d = (t) => zw(Ei({}, "__esModule", { value: !0 }), t), Ai = re(() => {
      "use strict";
      Er = /* @__PURE__ */ new Map(), yt = [], si = /* @__PURE__ */ new WeakMap(), _n = (t, e, r) => {
        if (e && typeof e.init == "function" && typeof e.createInferenceSessionHandler == "function") {
          let n = Er.get(t);
          if (n === void 0) Er.set(t, { backend: e, priority: r });
          else {
            if (n.priority > r) return;
            if (n.priority === r && n.backend !== e) throw new Error(`cannot register backend "${t}" using priority ${r}`);
          }
          if (r >= 0) {
            let s = yt.indexOf(t);
            s !== -1 && yt.splice(s, 1);
            for (let o = 0; o < yt.length; o++) if (Er.get(yt[o]).priority <= r) {
              yt.splice(o, 0, t);
              return;
            }
            yt.push(t);
          }
          return;
        }
        throw new TypeError("not a valid backend");
      }, oi = async (t) => {
        let e = Er.get(t);
        if (!e) return "backend not found.";
        if (e.initialized) return e.backend;
        if (e.aborted) return e.error;
        {
          let r = !!e.initPromise;
          try {
            if (!r) {
              let n = e.backend, s = si.get(n);
              e.initPromise = s ? s.then(async () => n.init(t), async () => n.init(t)) : n.init(t), si.set(n, e.initPromise);
            }
            return await e.initPromise, e.initialized = !0, e.backend;
          } catch (n) {
            return r || (e.error = `${n}`, e.aborted = !0), e.error;
          } finally {
            delete e.initPromise;
          }
        }
      }, gd = async (t) => {
        let e = t.executionProviders || [], r = e.map((l) => typeof l == "string" ? l : l.name), n = r.length === 0 ? yt : r, s, o = [], i = /* @__PURE__ */ new Set();
        for (let l of n) {
          let c = await oi(l);
          typeof c == "string" ? o.push({ name: l, err: c }) : (s || (s = c), s === c && i.add(l));
        }
        if (!s) throw new Error(`no available backend found. ERR: ${o.map((l) => `[${l.name}] ${l.err}`).join(", ")}`);
        for (let { name: l, err: c } of o) r.includes(l) && console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${c}`);
        let a = e.filter((l) => i.has(typeof l == "string" ? l : l.name));
        return [s, new Proxy(t, { get: (l, c) => c === "executionProviders" ? a : Reflect.get(l, c) })];
      }, wd = async () => {
        let t = [];
        for (let r of yt) {
          if (typeof Er.get(r).backend.createLoraAdapterHandler != "function") continue;
          let n = await oi(r);
          if (typeof n != "string") return n;
          t.push({ name: r, err: n });
        }
        let e = t.length === 0 ? "" : ` ERR: ${t.map((r) => `[${r.name}] ${r.err}`).join(", ")}`;
        throw new Error(`no available backend supports LoRA adapters.${e}`);
      };
    }), Bw = re(() => {
      "use strict";
      Ai();
    }), Uw = re(() => {
      "use strict";
      yd = "1.31.1";
    }), bd = re(() => {
      "use strict";
      Uw(), ii = "warning", ke = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: yd }, set logLevel(t) {
        if (t !== void 0) {
          if (typeof t != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(t) === -1) throw new Error(`Unsupported logging level: ${t}`);
          ii = t;
        }
      }, get logLevel() {
        return ii;
      } }, Object.defineProperty(ke, "logLevel", { enumerable: !0 });
    }), Fw = re(() => {
      "use strict";
      bd(), ie = ke;
    }), Ti = re(() => {
      "use strict";
      bd(), ls = (t, e) => {
        (typeof ke.trace > "u" ? !ke.wasm.trace : !ke.trace) || console.timeStamp(`${t}::ORT::${e}`);
      }, ai = (t, e) => {
        let r = new Error().stack?.split(/\r\n|\r|\n/g) || [], n = !1;
        for (let s = 0; s < r.length; s++) {
          if (n && !r[s].includes("TRACE_FUNC")) {
            let o = `FUNC_${t}::${r[s].trim().split(" ")[1]}`;
            e && (o += `::${e}`), ls("CPU", o);
            return;
          }
          r[s].includes("TRACE_FUNC") && (n = !0);
        }
      }, bt = (t) => {
        (typeof ke.trace > "u" ? !ke.wasm.trace : !ke.trace) || ai("BEGIN", t);
      }, xt = (t) => {
        (typeof ke.trace > "u" ? !ke.wasm.trace : !ke.trace) || ai("END", t);
      }, Zt = (t) => {
        (typeof ke.trace > "u" ? !ke.wasm.trace : !ke.trace) || console.time(`ORT::${t}`);
      }, Qt = (t) => {
        (typeof ke.trace > "u" ? !ke.wasm.trace : !ke.trace) || console.timeEnd(`ORT::${t}`);
      };
    }), xd = re(() => {
      "use strict";
      Ai(), Ti(), Si = class vd {
        constructor(e, r) {
          this.backend = e, this.handler = r;
        }
        static async create(e) {
          if (bt(), typeof e != "string" && !(e instanceof Uint8Array)) throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
          let r = await wd(), n = await r.createLoraAdapterHandler(e);
          return xt(), new vd(r, n);
        }
        async release() {
          return this.handler.dispose();
        }
      };
    }), jw = re(() => {
      "use strict";
      Ed = (t, e) => {
        let r = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
        r.width = t.dims[3], r.height = t.dims[2];
        let n = r.getContext("2d");
        if (n != null) {
          let s, o;
          e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC" ? (s = t.dims[2], o = t.dims[3]) : (s = t.dims[3], o = t.dims[2]);
          let i = e?.format !== void 0 ? e.format : "RGB", a = e?.norm, l, c;
          a === void 0 || a.mean === void 0 ? l = [255, 255, 255, 255] : typeof a.mean == "number" ? l = [a.mean, a.mean, a.mean, a.mean] : (l = [a.mean[0], a.mean[1], a.mean[2], 0], a.mean[3] !== void 0 && (l[3] = a.mean[3])), a === void 0 || a.bias === void 0 ? c = [0, 0, 0, 0] : typeof a.bias == "number" ? c = [a.bias, a.bias, a.bias, a.bias] : (c = [a.bias[0], a.bias[1], a.bias[2], 0], a.bias[3] !== void 0 && (c[3] = a.bias[3]));
          let u = o * s, d = 0, f = u, h = u * 2, p = -1;
          i === "RGBA" ? (d = 0, f = u, h = u * 2, p = u * 3) : i === "RGB" ? (d = 0, f = u, h = u * 2) : i === "RBG" && (d = 0, h = u, f = u * 2);
          for (let m = 0; m < o; m++) for (let _ = 0; _ < s; _++) {
            let g = (t.data[d++] - c[0]) * l[0], w = (t.data[f++] - c[1]) * l[1], y = (t.data[h++] - c[2]) * l[2], v = p === -1 ? 255 : (t.data[p++] - c[3]) * l[3];
            n.fillStyle = "rgba(" + g + "," + w + "," + y + "," + v + ")", n.fillRect(_, m, 1, 1);
          }
          if ("toDataURL" in r) return r.toDataURL();
          throw new Error("toDataURL is not supported");
        } else throw new Error("Can not access image data");
      }, kd = (t, e) => {
        let r = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), n;
        if (r != null) {
          let s, o, i;
          e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC" ? (s = t.dims[2], o = t.dims[1], i = t.dims[3]) : (s = t.dims[3], o = t.dims[2], i = t.dims[1]);
          let a = e !== void 0 && e.format !== void 0 ? e.format : "RGB", l = e?.norm, c, u;
          l === void 0 || l.mean === void 0 ? c = [255, 255, 255, 255] : typeof l.mean == "number" ? c = [l.mean, l.mean, l.mean, l.mean] : (c = [l.mean[0], l.mean[1], l.mean[2], 255], l.mean[3] !== void 0 && (c[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? u = [0, 0, 0, 0] : typeof l.bias == "number" ? u = [l.bias, l.bias, l.bias, l.bias] : (u = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (u[3] = l.bias[3]));
          let d = o * s;
          if (e !== void 0 && (e.format !== void 0 && i === 4 && e.format !== "RGBA" || i === 3 && e.format !== "RGB" && e.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
          let f = 4, h = 0, p = 1, m = 2, _ = 3, g = 0, w = d, y = d * 2, v = -1;
          a === "RGBA" ? (g = 0, w = d, y = d * 2, v = d * 3) : a === "RGB" ? (g = 0, w = d, y = d * 2) : a === "RBG" && (g = 0, y = d, w = d * 2), n = r.createImageData(s, o);
          for (let k = 0; k < o * s; h += f, p += f, m += f, _ += f, k++) n.data[h] = (t.data[g++] - u[0]) * c[0], n.data[p] = (t.data[w++] - u[1]) * c[1], n.data[m] = (t.data[y++] - u[2]) * c[2], n.data[_] = v === -1 ? 255 : (t.data[v++] - u[3]) * c[3];
        } else throw new Error("Can not access image data");
        return n;
      };
    }), Ww = re(() => {
      "use strict";
      Ci(), ts = (t, e) => {
        if (t === void 0) throw new Error("Image buffer must be defined");
        if (e.height === void 0 || e.width === void 0) throw new Error("Image height and width must be defined");
        if (e.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
        let { height: r, width: n } = e, s = e.norm ?? { mean: 255, bias: 0 }, o, i;
        typeof s.mean == "number" ? o = [s.mean, s.mean, s.mean, s.mean] : o = [s.mean[0], s.mean[1], s.mean[2], s.mean[3] ?? 255], typeof s.bias == "number" ? i = [s.bias, s.bias, s.bias, s.bias] : i = [s.bias[0], s.bias[1], s.bias[2], s.bias[3] ?? 0];
        let a = e.format !== void 0 ? e.format : "RGBA", l = e.tensorFormat !== void 0 && e.tensorFormat !== void 0 ? e.tensorFormat : "RGB", c = r * n, u = l === "RGBA" ? new Float32Array(c * 4) : new Float32Array(c * 3), d = 4, f = 0, h = 1, p = 2, m = 3, _ = 0, g = c, w = c * 2, y = -1;
        a === "RGB" && (d = 3, f = 0, h = 1, p = 2, m = -1), l === "RGBA" ? y = c * 3 : l === "RBG" ? (_ = 0, w = c, g = c * 2) : l === "BGR" && (w = 0, g = c, _ = c * 2);
        for (let v = 0; v < c; v++, f += d, p += d, h += d, m += d) u[_++] = (t[f] + i[0]) / o[0], u[g++] = (t[h] + i[1]) / o[1], u[w++] = (t[p] + i[2]) / o[2], y !== -1 && m !== -1 && (u[y++] = (t[m] + i[3]) / o[3]);
        return l === "RGBA" ? new Be("float32", u, [1, 4, r, n]) : new Be("float32", u, [1, 3, r, n]);
      }, Ad = async (t, e) => {
        let r = typeof HTMLImageElement < "u" && t instanceof HTMLImageElement, n = typeof ImageData < "u" && t instanceof ImageData, s = typeof ImageBitmap < "u" && t instanceof ImageBitmap, o = typeof t == "string", i, a = e ?? {}, l = () => {
          if (typeof document < "u") return document.createElement("canvas");
          if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
          throw new Error("Canvas is not supported");
        }, c = (u) => typeof HTMLCanvasElement < "u" && u instanceof HTMLCanvasElement || u instanceof OffscreenCanvas ? u.getContext("2d") : null;
        if (r) {
          let u = l();
          u.width = t.width, u.height = t.height;
          let d = c(u);
          if (d != null) {
            let f = t.height, h = t.width;
            if (e !== void 0 && e.resizedHeight !== void 0 && e.resizedWidth !== void 0 && (f = e.resizedHeight, h = e.resizedWidth), e !== void 0) {
              if (a = e, e.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
              a.tensorFormat = "RGBA", a.height = f, a.width = h;
            } else a.tensorFormat = "RGBA", a.height = f, a.width = h;
            d.drawImage(t, 0, 0), i = d.getImageData(0, 0, h, f).data;
          } else throw new Error("Can not access image data");
        } else if (n) {
          let u, d;
          if (e !== void 0 && e.resizedWidth !== void 0 && e.resizedHeight !== void 0 ? (u = e.resizedHeight, d = e.resizedWidth) : (u = t.height, d = t.width), e !== void 0 && (a = e), a.format = "RGBA", a.height = u, a.width = d, e !== void 0) {
            let f = l();
            f.width = d, f.height = u;
            let h = c(f);
            if (h != null) h.putImageData(t, 0, 0), i = h.getImageData(0, 0, d, u).data;
            else throw new Error("Can not access image data");
          } else i = t.data;
        } else if (s) {
          if (e === void 0) throw new Error("Please provide image config with format for Imagebitmap");
          let u = l();
          u.width = t.width, u.height = t.height;
          let d = c(u);
          if (d != null) {
            let f = t.height, h = t.width;
            return d.drawImage(t, 0, 0, h, f), i = d.getImageData(0, 0, h, f).data, a.height = f, a.width = h, ts(i, a);
          } else throw new Error("Can not access image data");
        } else {
          if (o) return new Promise((u, d) => {
            let f = l(), h = c(f);
            if (!t || !h) return d();
            let p = new Image();
            p.crossOrigin = "Anonymous", p.src = t, p.onload = () => {
              f.width = p.width, f.height = p.height, h.drawImage(p, 0, 0, f.width, f.height);
              let m = h.getImageData(0, 0, f.width, f.height);
              a.height = f.height, a.width = f.width, u(ts(m.data, a));
            };
          });
          throw new Error("Input data provided is not supported - aborted tensor creation");
        }
        if (i !== void 0) return ts(i, a);
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }, Td = (t, e) => {
        let { width: r, height: n, download: s, dispose: o } = e, i = [1, n, r, 4];
        return new Be({ location: "texture", type: "float32", texture: t, dims: i, download: s, dispose: o });
      }, Sd = (t, e) => {
        let { dataType: r, dims: n, download: s, dispose: o } = e;
        return new Be({ location: "gpu-buffer", type: r ?? "float32", gpuBuffer: t, dims: n, download: s, dispose: o });
      }, Cd = (t, e) => {
        let { dataType: r, dims: n, download: s, dispose: o } = e;
        return new Be({ location: "ml-tensor", type: r ?? "float32", mlTensor: t, dims: n, download: s, dispose: o });
      }, Id = (t, e, r) => new Be({ location: "cpu-pinned", type: t, data: e, dims: r ?? [e.length] });
    }), Vw = re(() => {
      "use strict";
      Jt = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), mn = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), li = !1, Md = () => {
        if (!li) {
          li = !0;
          let t = typeof BigInt64Array < "u" && BigInt64Array.from, e = typeof BigUint64Array < "u" && BigUint64Array.from, r = globalThis.Float16Array, n = typeof r < "u" && r.from;
          t && (Jt.set("int64", BigInt64Array), mn.set(BigInt64Array, "int64")), e && (Jt.set("uint64", BigUint64Array), mn.set(BigUint64Array, "uint64")), n ? (Jt.set("float16", r), mn.set(r, "float16")) : Jt.set("float16", Uint16Array);
        }
      };
    }), Gw = re(() => {
      "use strict";
      Ci(), Od = (t) => {
        let e = 1;
        for (let r = 0; r < t.length; r++) {
          let n = t[r];
          if (typeof n != "number" || !Number.isSafeInteger(n)) throw new TypeError(`dims[${r}] must be an integer, got: ${n}`);
          if (n < 0) throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${n}`);
          e *= n;
        }
        return e;
      }, Pd = (t, e) => {
        switch (t.location) {
          case "cpu":
            return new Be(t.type, t.data, e);
          case "cpu-pinned":
            return new Be({ location: "cpu-pinned", data: t.data, type: t.type, dims: e });
          case "texture":
            return new Be({ location: "texture", texture: t.texture, type: t.type, dims: e });
          case "gpu-buffer":
            return new Be({ location: "gpu-buffer", gpuBuffer: t.gpuBuffer, type: t.type, dims: e });
          case "ml-tensor":
            return new Be({ location: "ml-tensor", mlTensor: t.mlTensor, type: t.type, dims: e });
          default:
            throw new Error(`tensorReshape: tensor location ${t.location} is not supported`);
        }
      };
    }), Ci = re(() => {
      "use strict";
      jw(), Ww(), Vw(), Gw(), Be = class {
        constructor(t, e, r) {
          Md();
          let n, s;
          if (typeof t == "object" && "location" in t) switch (this.dataLocation = t.location, n = t.type, s = t.dims, t.location) {
            case "cpu-pinned": {
              let i = Jt.get(n);
              if (!i) throw new TypeError(`unsupported type "${n}" to create tensor from pinned buffer`);
              if (!(t.data instanceof i)) throw new TypeError(`buffer should be of type ${i.name}`);
              this.cpuData = t.data;
              break;
            }
            case "texture": {
              if (n !== "float32") throw new TypeError(`unsupported type "${n}" to create tensor from texture`);
              this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
              break;
            }
            case "gpu-buffer": {
              if (n !== "float32" && n !== "float16" && n !== "int32" && n !== "int64" && n !== "uint32" && n !== "uint8" && n !== "bool" && n !== "uint4" && n !== "int4") throw new TypeError(`unsupported type "${n}" to create tensor from gpu buffer`);
              this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
              break;
            }
            case "ml-tensor": {
              if (n !== "float32" && n !== "float16" && n !== "int32" && n !== "int64" && n !== "uint32" && n !== "uint64" && n !== "int8" && n !== "uint8" && n !== "bool" && n !== "uint4" && n !== "int4") throw new TypeError(`unsupported type "${n}" to create tensor from MLTensor`);
              this.mlTensorData = t.mlTensor, this.downloader = t.download, this.disposer = t.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
          else {
            let i, a;
            if (typeof t == "string") if (n = t, a = r, t === "string") {
              if (!Array.isArray(e)) throw new TypeError("A string tensor's data must be a string array.");
              i = e;
            } else {
              let l = Jt.get(t);
              if (l === void 0) throw new TypeError(`Unsupported tensor type: ${t}.`);
              if (Array.isArray(e)) {
                if (t === "float16" && l === Uint16Array || t === "uint4" || t === "int4") throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${l.name} as data.`);
                t === "uint64" || t === "int64" ? i = l.from(e, BigInt) : i = l.from(e);
              } else if (e instanceof l) i = e;
              else if (e instanceof Uint8ClampedArray) if (t === "uint8") i = Uint8Array.from(e);
              else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
              else if (t === "float16" && e instanceof Uint16Array && l !== Uint16Array) i = new globalThis.Float16Array(e.buffer, e.byteOffset, e.length);
              else throw new TypeError(`A ${n} tensor's data must be type of ${l}`);
            }
            else if (a = e, Array.isArray(t)) {
              if (t.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
              let l = typeof t[0];
              if (l === "string") n = "string", i = t;
              else if (l === "boolean") n = "bool", i = Uint8Array.from(t);
              else throw new TypeError(`Invalid element type of data array: ${l}.`);
            } else if (t instanceof Uint8ClampedArray) n = "uint8", i = Uint8Array.from(t);
            else {
              let l = mn.get(t.constructor);
              if (l === void 0) throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
              n = l, i = t;
            }
            if (a === void 0) a = [i.length];
            else if (!Array.isArray(a)) throw new TypeError("A tensor's dims must be a number array");
            s = a, this.cpuData = i, this.dataLocation = "cpu";
          }
          let o = Od(s);
          if (this.cpuData && o !== this.cpuData.length && !((n === "uint4" || n === "int4") && Math.ceil(o / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${o}) does not match data length(${this.cpuData.length}).`);
          this.type = n, this.dims = s, this.size = o;
        }
        static async fromImage(t, e) {
          return Ad(t, e);
        }
        static fromTexture(t, e) {
          return Td(t, e);
        }
        static fromGpuBuffer(t, e) {
          return Sd(t, e);
        }
        static fromMLTensor(t, e) {
          return Cd(t, e);
        }
        static fromPinnedBuffer(t, e, r) {
          return Id(t, e, r);
        }
        toDataURL(t) {
          return Ed(this, t);
        }
        toImageData(t) {
          return kd(this, t);
        }
        get data() {
          if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
          return this.cpuData;
        }
        get location() {
          return this.dataLocation;
        }
        get texture() {
          if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
          return this.gpuTextureData;
        }
        get gpuBuffer() {
          if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
          return this.gpuBufferData;
        }
        get mlTensor() {
          if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
          return this.mlTensorData;
        }
        async getData(t) {
          switch (this.ensureValid(), this.dataLocation) {
            case "cpu":
            case "cpu-pinned":
              return this.data;
            case "texture":
            case "gpu-buffer":
            case "ml-tensor": {
              if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
              if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
              try {
                this.isDownloading = !0;
                let e = await this.downloader();
                return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = e, t && this.disposer && (this.disposer(), this.disposer = void 0), e;
              } finally {
                this.isDownloading = !1;
              }
            }
            default:
              throw new Error(`cannot get data from location: ${this.dataLocation}`);
          }
        }
        dispose() {
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
        }
        ensureValid() {
          if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
        }
        reshape(t) {
          if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
          return Pd(this, t);
        }
      };
    }), Ld = re(() => {
      "use strict";
      Ci(), nt = Be;
    }), qw = re(() => {
      "use strict";
      Ai(), xd(), Ld(), Ti(), Rd = class $d {
        constructor(e, r) {
          this.handler = e, this.backend = r;
        }
        async run(e, r, n) {
          bt(), Zt("InferenceSession.run");
          let s = {}, o = {};
          if (typeof e != "object" || e === null || e instanceof nt || Array.isArray(e)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
          let i = !0;
          if (typeof r == "object") {
            if (r === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
            if (r instanceof nt) throw new TypeError("'fetches' cannot be a Tensor");
            if (Array.isArray(r)) {
              if (r.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
              i = !1;
              for (let u of r) {
                if (typeof u != "string") throw new TypeError("'fetches' must be a string array or an object.");
                if (this.outputNames.indexOf(u) === -1) throw new RangeError(`'fetches' contains invalid output name: ${u}.`);
                s[u] = null;
              }
              if (typeof n == "object" && n !== null) o = n;
              else if (typeof n < "u") throw new TypeError("'options' must be an object.");
            } else {
              let u = !1, d = Object.getOwnPropertyNames(r);
              for (let f of this.outputNames) if (d.indexOf(f) !== -1) {
                let h = r[f];
                (h === null || h instanceof nt) && (u = !0, i = !1, s[f] = h);
              }
              if (u) {
                if (typeof n == "object" && n !== null) o = n;
                else if (typeof n < "u") throw new TypeError("'options' must be an object.");
              } else o = r;
            }
          } else if (typeof r < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
          for (let u of this.inputNames) if (typeof e[u] > "u") throw new Error(`input '${u}' is missing in 'feeds'.`);
          if (i) for (let u of this.outputNames) s[u] = null;
          let a;
          if (o.activeLoraAdapters !== void 0) {
            if (!Array.isArray(o.activeLoraAdapters)) throw new TypeError("'activeLoraAdapters' must be an array.");
            a = o.activeLoraAdapters.map((u) => {
              if (!(u instanceof Si)) throw new TypeError("'activeLoraAdapters' must be an array of LoraAdapter objects.");
              if (u.backend !== this.backend) throw new Error("LoRA adapter was created by a different backend than the session.");
              return u.handler;
            });
          }
          let l = await this.handler.run(e, s, o, a), c = {};
          for (let u in l) if (Object.hasOwnProperty.call(l, u)) {
            let d = l[u];
            d instanceof nt ? c[u] = d : c[u] = new nt(d.type, d.data, d.dims);
          }
          return Qt("InferenceSession.run"), xt(), c;
        }
        async release() {
          return this.handler.dispose();
        }
        static async create(e, r, n, s) {
          bt(), Zt("InferenceSession.create");
          let o, i = {};
          if (typeof e == "string") {
            if (o = e, typeof r == "object" && r !== null) i = r;
            else if (typeof r < "u") throw new TypeError("'options' must be an object.");
          } else if (e instanceof Uint8Array) {
            if (o = e, typeof r == "object" && r !== null) i = r;
            else if (typeof r < "u") throw new TypeError("'options' must be an object.");
          } else if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) {
            let u = e, d = 0, f = e.byteLength;
            if (typeof r == "object" && r !== null) i = r;
            else if (typeof r == "number") {
              if (d = r, !Number.isSafeInteger(d)) throw new RangeError("'byteOffset' must be an integer.");
              if (d < 0 || d >= u.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${u.byteLength}).`);
              if (f = e.byteLength - d, typeof n == "number") {
                if (f = n, !Number.isSafeInteger(f)) throw new RangeError("'byteLength' must be an integer.");
                if (f <= 0 || d + f > u.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${u.byteLength - d}].`);
                if (typeof s == "object" && s !== null) i = s;
                else if (typeof s < "u") throw new TypeError("'options' must be an object.");
              } else if (typeof n < "u") throw new TypeError("'byteLength' must be a number.");
            } else if (typeof r < "u") throw new TypeError("'options' must be an object.");
            o = new Uint8Array(u, d, f);
          } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
          let [a, l] = await gd(i), c = await a.createInferenceSessionHandler(o, l);
          return Qt("InferenceSession.create"), xt(), new $d(c, a);
        }
        startProfiling() {
          this.handler.startProfiling();
        }
        endProfiling() {
          this.handler.endProfiling();
        }
        get inputNames() {
          return this.handler.inputNames;
        }
        get outputNames() {
          return this.handler.outputNames;
        }
        get inputMetadata() {
          return this.handler.inputMetadata;
        }
        get outputMetadata() {
          return this.handler.outputMetadata;
        }
      };
    }), Hw = re(() => {
      "use strict";
      qw(), Ii = Rd;
    }), Yw = re(() => {
      "use strict";
      xd(), Mi = Si;
    }), Xw = re(() => {
      "use strict";
    }), Kw = re(() => {
      "use strict";
    }), Jw = re(() => {
      "use strict";
    }), Zw = re(() => {
      "use strict";
    }), Nd = {};
    ki(Nd, { InferenceSession: () => Ii, LoraAdapter: () => Mi, TRACE: () => ls, TRACE_EVENT_BEGIN: () => Zt, TRACE_EVENT_END: () => Qt, TRACE_FUNC_BEGIN: () => bt, TRACE_FUNC_END: () => xt, Tensor: () => nt, env: () => ie, registerBackend: () => _n });
    Pt = re(() => {
      "use strict";
      Bw(), Fw(), Hw(), Yw(), Ld(), Xw(), Kw(), Ti(), Jw(), Zw();
    }), Oi = re(() => {
      "use strict";
    }), Dd = {};
    ki(Dd, { default: () => zd });
    Qw = re(() => {
      "use strict";
      Xd(), Sr(), Li(), ci = "ort-wasm-proxy-worker", ui = globalThis.self?.name === ci, ui && (self.onmessage = (t) => {
        let { type: e, in: r } = t.data;
        try {
          switch (e) {
            case "init-wasm":
              Ri(r.wasm).then(() => {
                Bi(r).then(() => {
                  postMessage({ type: e });
                }, (n) => {
                  postMessage({ type: e, err: n });
                });
              }, (n) => {
                postMessage({ type: e, err: n });
              });
              break;
            case "init-ep": {
              let { epName: n, env: s } = r;
              Ui(s, n).then(() => {
                postMessage({ type: e });
              }, (o) => {
                postMessage({ type: e, err: o });
              });
              break;
            }
            case "copy-from": {
              let { buffer: n } = r, s = us(n);
              postMessage({ type: e, out: s });
              break;
            }
            case "create": {
              let { model: n, options: s } = r;
              Fi(n, s).then((o) => {
                postMessage({ type: e, out: o });
              }, (o) => {
                postMessage({ type: e, err: o });
              });
              break;
            }
            case "release":
              ji(r), postMessage({ type: e });
              break;
            case "run": {
              let { sessionId: n, inputIndices: s, inputs: o, outputIndices: i, options: a } = r;
              Wi(n, s, o, i, new Array(i.length).fill(null), a).then((l) => {
                l.some((c) => c[3] !== "cpu") ? postMessage({ type: e, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: e, out: l }, Gi([...o, ...l]));
              }, (l) => {
                postMessage({ type: e, err: l });
              });
              break;
            }
            case "end-profiling":
              Vi(r), postMessage({ type: e });
              break;
            default:
          }
        } catch (n) {
          postMessage({ type: e, err: n });
        }
      }), zd = ui ? null : (t) => new Worker(t ?? ze, { type: "module", name: ci });
    }), Li = re(() => {
      "use strict";
      Oi(), di = typeof location > "u" ? void 0 : location.origin, Qu = is.url > "file:" && is.url < "file;", ed = () => {
        if (Qu) {
          let t = URL;
          return new URL(new t("ort.wasm.min.mjs", is.url).href, di).href;
        }
        return is.url;
      }, ze = ed(), Pi = () => {
        if (ze && !ze.startsWith("blob:")) return ze.substring(0, ze.lastIndexOf("/") + 1);
      }, rs = (t, e) => {
        try {
          let r = e ?? ze;
          return (r ? new URL(t, r) : new URL(t)).origin === di;
        } catch {
          return !1;
        }
      }, td = (t, e) => {
        let r = e ?? ze;
        try {
          return (r ? new URL(t, r) : new URL(t)).href;
        } catch {
          return;
        }
      }, rd = (t, e) => `${e ?? "./"}${t}`, fi = async (t) => {
        let e = await (await fetch(t, { credentials: "same-origin" })).blob();
        return URL.createObjectURL(e);
      }, nd = async (t) => (await import(
        /*webpackIgnore:true*/
        /*@vite-ignore*/
        t
      )).default, hi = (Qw(), _d(Dd)).default, Bd = async () => {
        if (!ze) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
        if (rs(ze)) return [void 0, hi()];
        let t = await fi(ze);
        return [t, hi(t)];
      }, pi = void 0, Ud = async (t, e, r, n) => {
        let s = pi && !(t || e);
        if (s) if (ze) s = rs(ze) || n && !r;
        else if (n && !r) s = !0;
        else throw new Error("cannot determine the script source URL.");
        if (s) return [void 0, pi];
        {
          let o = "ort-wasm-simd-threaded.mjs", i = t ?? td(o, e), a = r && i && !rs(i, e), l = a ? await fi(i) : i ?? rd(o, e);
          return [a ? l : void 0, await nd(l)];
        }
      };
    }), Sr = re(() => {
      "use strict";
      Li(), ns = !1, dn = !1, _i = !1, sd = () => {
        if (typeof SharedArrayBuffer > "u") return !1;
        try {
          return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
        } catch {
          return !1;
        }
      }, od = () => {
        try {
          return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
        } catch {
          return !1;
        }
      }, id = () => {
        try {
          return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
        } catch {
          return !1;
        }
      }, Ri = async (t) => {
        if (ns) return Promise.resolve();
        if (dn) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
        if (_i) throw new Error("previous call to 'initializeWebAssembly()' failed.");
        dn = !0;
        let e = t.initTimeout, r = t.numThreads;
        if (t.simd !== !1) {
          if (t.simd === "relaxed") {
            if (!id()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
          } else if (!od()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
        }
        let n = sd();
        r > 1 && !n && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + r + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), t.numThreads = r = 1);
        let s = t.wasmPaths, o = typeof s == "string" ? s : void 0, i = s?.mjs, a = i?.href ?? i, l = s?.wasm, c = l?.href ?? l, u = t.wasmBinary, [d, f] = await Ud(a, o, r > 1, !!u || !!c), h = !1, p = [];
        if (e > 0 && p.push(new Promise((m) => {
          setTimeout(() => {
            h = !0, m();
          }, e);
        })), p.push(new Promise((m, _) => {
          let g = { numThreads: r };
          if (u) g.wasmBinary = u, g.locateFile = (w) => w;
          else if (c || o) g.locateFile = (w) => c ?? o + w;
          else if (a && a.indexOf("blob:") !== 0) g.locateFile = (w) => new URL(w, a).href;
          else if (d) {
            let w = Pi();
            w && (g.locateFile = (y) => w + y);
          }
          f(g).then((w) => {
            dn = !1, ns = !0, mi = w, m(), d && URL.revokeObjectURL(d);
          }, (w) => {
            dn = !1, _i = !0, _(w);
          });
        })), await Promise.race(p), h) throw new Error(`WebAssembly backend initializing failed due to timeout: ${e}ms`);
      }, oe = () => {
        if (ns && mi) return mi;
        throw new Error("WebAssembly is not initialized yet.");
      };
    }), $i = re(() => {
      "use strict";
      Sr(), rt = (t, e) => {
        let r = oe(), n = r.lengthBytesUTF8(t) + 1, s = r._malloc(n);
        return r.stringToUTF8(t, s, n), e.push(s), s;
      }, cs = (t, e, r, n) => {
        if (typeof t == "object" && t !== null) {
          if (r.has(t)) throw new Error("Circular reference in options");
          r.add(t);
        }
        Object.entries(t).forEach(([s, o]) => {
          let i = e ? e + s : s;
          if (typeof o == "object") cs(o, i + ".", r, n);
          else if (typeof o == "string" || typeof o == "number") n(i, o.toString());
          else if (typeof o == "boolean") n(i, o ? "1" : "0");
          else throw new Error(`Can't handle extra config type: ${typeof o}`);
        });
      }, se = (t) => {
        let e = oe(), r = e.stackSave();
        try {
          let n = e.PTR_SIZE, s = e.stackAlloc(2 * n);
          e._OrtGetLastError(s, s + n);
          let o = Number(e.getValue(s, n === 4 ? "i32" : "i64")), i = e.getValue(s + n, "*"), a = i ? e.UTF8ToString(i) : "";
          throw new Error(`${t} ERROR_CODE: ${o}, ERROR_MESSAGE: ${a}`);
        } finally {
          e.stackRestore(r);
        }
      };
    }), ey = re(() => {
      "use strict";
      Sr(), $i(), Fd = (t, e) => {
        let r = oe(), n = 0, s = [], o = t || {};
        try {
          if (t?.logSeverityLevel === void 0) o.logSeverityLevel = 2;
          else if (typeof t.logSeverityLevel != "number" || !Number.isInteger(t.logSeverityLevel) || t.logSeverityLevel < 0 || t.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${t.logSeverityLevel}`);
          if (t?.logVerbosityLevel === void 0) o.logVerbosityLevel = 0;
          else if (typeof t.logVerbosityLevel != "number" || !Number.isInteger(t.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${t.logVerbosityLevel}`);
          t?.terminate === void 0 && (o.terminate = !1);
          let i = 0;
          t?.tag !== void 0 && (i = rt(t.tag, s)), n = r._OrtCreateRunOptions(o.logSeverityLevel, o.logVerbosityLevel, !!o.terminate, i), n === 0 && se("Can't create run options."), t?.extra !== void 0 && cs(t.extra, "", /* @__PURE__ */ new WeakSet(), (a, l) => {
            let c = rt(a, s), u = rt(l, s);
            r._OrtAddRunConfigEntry(n, c, u) !== 0 && se(`Can't set a run config entry: ${a} - ${l}.`);
          });
          for (let a of e) r._OrtRunOptionsAddActiveLoraAdapter(n, a) !== 0 && se("Can't add an active LoRA adapter.");
          return [n, s];
        } catch (i) {
          throw n !== 0 && r._OrtReleaseRunOptions(n), s.forEach((a) => r._free(a)), i;
        }
      };
    }), ty = re(() => {
      "use strict";
      Sr(), $i(), ad = (t) => {
        switch (t) {
          case "disabled":
            return 0;
          case "basic":
            return 1;
          case "extended":
            return 2;
          case "layout":
            return 3;
          case "all":
            return 99;
          default:
            throw new Error(`unsupported graph optimization level: ${t}`);
        }
      }, ld = (t) => {
        switch (t) {
          case "sequential":
            return 0;
          case "parallel":
            return 1;
          default:
            throw new Error(`unsupported execution mode: ${t}`);
        }
      }, cd = (t) => {
        t.extra || (t.extra = {}), t.extra.session || (t.extra.session = {});
        let e = t.extra.session;
        e.use_ort_model_bytes_directly || (e.use_ort_model_bytes_directly = "1"), t.executionProviders && t.executionProviders.some((r) => (typeof r == "string" ? r : r.name) === "webgpu") && (t.enableMemPattern = !1);
      }, qt = (t, e, r, n) => {
        let s = rt(e, n), o = rt(r, n);
        oe()._OrtAddSessionConfigEntry(t, s, o) !== 0 && se(`Can't set a session config entry: ${e} - ${r}.`);
      }, ud = async (t, e, r) => {
        let n = e.executionProviders;
        for (let s of n) {
          let o = typeof s == "string" ? s : s.name, i = [], a;
          switch (o) {
            case "webnn":
              if (o = "WEBNN", qt(t, "session.disable_quant_qdq", "1", r), qt(t, "session.disable_qdq_constant_folding", "1", r), typeof s != "string") {
                let f = s?.deviceType;
                f && qt(t, "deviceType", f, r);
              }
              break;
            case "webgpu":
              if (o = "JS", typeof s != "string") {
                let f = s;
                if (f?.preferredLayout) {
                  if (f.preferredLayout !== "NCHW" && f.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);
                  qt(t, "preferredLayout", f.preferredLayout, r);
                }
              }
              break;
            case "wasm":
            case "cpu":
              continue;
            default:
              throw new Error(`not supported execution provider: ${o}`);
          }
          let l = i.length, c = 0, u = 0;
          if (l > 0) {
            c = oe()._malloc(l * oe().PTR_SIZE), r.push(c), u = oe()._malloc(l * oe().PTR_SIZE), r.push(u);
            for (let f = 0; f < l; f++) oe().setValue(c + f * oe().PTR_SIZE, i[f][0], "*"), oe().setValue(u + f * oe().PTR_SIZE, i[f][1], "*");
          }
          let d;
          if (a !== void 0) {
            let f = oe()._malloc(oe().PTR_SIZE);
            r.push(f), oe().setValue(f, a[0], "*"), d = await oe()._OrtAppendExecutionProviderV2(t, f, 1, c, u, l);
          } else {
            let f = rt(o, r);
            d = await oe()._OrtAppendExecutionProvider(t, f, c, u, l);
          }
          d !== 0 && se(`Can't append execution provider: ${o}.`);
        }
      }, jd = async (t) => {
        let e = oe(), r = 0, n = [], s = t || {};
        cd(s);
        try {
          let o = ad(s.graphOptimizationLevel ?? "all"), i = ld(s.executionMode ?? "sequential"), a = typeof s.logId == "string" ? rt(s.logId, n) : 0, l = s.logSeverityLevel ?? 2;
          if (!Number.isInteger(l) || l < 0 || l > 4) throw new Error(`log severity level is not valid: ${l}`);
          let c = s.logVerbosityLevel ?? 0;
          if (!Number.isInteger(c) || c < 0 || c > 4) throw new Error(`log verbosity level is not valid: ${c}`);
          let u = typeof s.optimizedModelFilePath == "string" ? rt(s.optimizedModelFilePath, n) : 0;
          if (r = e._OrtCreateSessionOptions(o, !!s.enableCpuMemArena, !!s.enableMemPattern, i, !!s.enableProfiling, 0, a, l, c, u), r === 0 && se("Can't create session options."), s.executionProviders && await ud(r, s, n), s.enableGraphCapture !== void 0) {
            if (typeof s.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${s.enableGraphCapture}`);
            qt(r, "enableGraphCapture", s.enableGraphCapture.toString(), n);
          }
          if (s.freeDimensionOverrides) for (let [d, f] of Object.entries(s.freeDimensionOverrides)) {
            if (typeof d != "string") throw new Error(`free dimension override name must be a string: ${d}`);
            if (typeof f != "number" || !Number.isInteger(f) || f < 0) throw new Error(`free dimension override value must be a non-negative integer: ${f}`);
            let h = rt(d, n);
            e._OrtAddFreeDimensionOverride(r, h, f) !== 0 && se(`Can't set a free dimension override: ${d} - ${f}.`);
          }
          return s.extra !== void 0 && cs(s.extra, "", /* @__PURE__ */ new WeakSet(), (d, f) => {
            qt(r, d, f, n);
          }), [r, n];
        } catch (o) {
          throw r !== 0 && e._OrtReleaseSessionOptions(r) !== 0 && se("Can't release session options."), n.forEach((i) => e._free(i)), o;
        }
      };
    }), qd = re(() => {
      "use strict";
      Ar = (t) => {
        switch (t) {
          case "int8":
            return 3;
          case "uint8":
            return 2;
          case "bool":
            return 9;
          case "int16":
            return 5;
          case "uint16":
            return 4;
          case "int32":
            return 6;
          case "uint32":
            return 12;
          case "float16":
            return 10;
          case "float32":
            return 1;
          case "float64":
            return 11;
          case "string":
            return 8;
          case "int64":
            return 7;
          case "uint64":
            return 13;
          case "int4":
            return 22;
          case "uint4":
            return 21;
          default:
            throw new Error(`unsupported data type: ${t}`);
        }
      }, as = (t) => {
        switch (t) {
          case 3:
            return "int8";
          case 2:
            return "uint8";
          case 9:
            return "bool";
          case 5:
            return "int16";
          case 4:
            return "uint16";
          case 6:
            return "int32";
          case 12:
            return "uint32";
          case 10:
            return "float16";
          case 1:
            return "float32";
          case 11:
            return "float64";
          case 8:
            return "string";
          case 7:
            return "int64";
          case 13:
            return "uint64";
          case 22:
            return "int4";
          case 21:
            return "uint4";
          default:
            throw new Error(`unsupported data type: ${t}`);
        }
      }, Tr = (t, e) => {
        let r = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][t], n = typeof e == "number" ? e : e.reduce((s, o) => s * o, 1);
        return r > 0 ? Math.ceil(n * r) : void 0;
      }, Wd = (t) => {
        switch (t) {
          case "float16":
            return typeof Float16Array < "u" ? Float16Array : Uint16Array;
          case "float32":
            return Float32Array;
          case "uint8":
            return Uint8Array;
          case "int8":
            return Int8Array;
          case "uint16":
            return Uint16Array;
          case "int16":
            return Int16Array;
          case "int32":
            return Int32Array;
          case "bool":
            return Uint8Array;
          case "float64":
            return Float64Array;
          case "uint32":
            return Uint32Array;
          case "int64":
            return BigInt64Array;
          case "uint64":
            return BigUint64Array;
          default:
            throw new Error(`unsupported type: ${t}`);
        }
      }, Vd = (t) => {
        switch (t) {
          case "verbose":
            return 0;
          case "info":
            return 1;
          case "warning":
            return 2;
          case "error":
            return 3;
          case "fatal":
            return 4;
          default:
            throw new Error(`unsupported logging level: ${t}`);
        }
      }, Ni = (t) => t === "float32" || t === "float16" || t === "int32" || t === "int64" || t === "uint32" || t === "uint8" || t === "bool" || t === "uint4" || t === "int4", Di = (t) => t === "float32" || t === "float16" || t === "int32" || t === "int64" || t === "uint32" || t === "uint64" || t === "int8" || t === "uint8" || t === "bool" || t === "uint4" || t === "int4", Gd = (t) => {
        switch (t) {
          case "none":
            return 0;
          case "cpu":
            return 1;
          case "cpu-pinned":
            return 2;
          case "texture":
            return 3;
          case "gpu-buffer":
            return 4;
          case "ml-tensor":
            return 5;
          default:
            throw new Error(`unsupported data location: ${t}`);
        }
      };
    }), zi = re(() => {
      "use strict";
      Oi(), ds = async (t) => {
        if (typeof t == "string") {
          let e = await fetch(t);
          if (!e.ok) throw new Error(`failed to load external data file: ${t}`);
          let r = e.headers.get("Content-Length"), n = r ? parseInt(r, 10) : 0;
          if (n < 1073741824) return new Uint8Array(await e.arrayBuffer());
          {
            if (!e.body) throw new Error(`failed to load external data file: ${t}, no response body.`);
            let s = e.body.getReader(), o;
            try {
              o = new ArrayBuffer(n);
            } catch (a) {
              if (a instanceof RangeError) {
                let l = Math.ceil(n / 65536);
                o = new WebAssembly.Memory({ initial: l, maximum: l }).buffer;
              } else throw a;
            }
            let i = 0;
            for (; ; ) {
              let { done: a, value: l } = await s.read();
              if (a) break;
              let c = l.byteLength;
              new Uint8Array(o, i, c).set(l), i += c;
            }
            return new Uint8Array(o, 0, n);
          }
        } else return t instanceof Blob ? new Uint8Array(await t.arrayBuffer()) : t instanceof Uint8Array ? t : new Uint8Array(t);
      };
    }), Xd = re(() => {
      "use strict";
      Pt(), ey(), ty(), qd(), Sr(), $i(), zi(), dd = (t, e) => {
        oe()._OrtInit(t, e) !== 0 && se("Can't initialize onnxruntime.");
      }, Bi = async (t) => {
        dd(t.wasm.numThreads, Vd(t.logLevel));
      }, Ui = async (t, e) => {
        oe().asyncInit?.();
        let r = t.webgpu.adapter;
        if (e === "webgpu") {
          if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
          if (r) {
            if (typeof r.limits != "object" || typeof r.features != "object" || typeof r.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
          } else {
            let n = t.webgpu.powerPreference;
            if (n !== void 0 && n !== "low-power" && n !== "high-performance") throw new Error(`Invalid powerPreference setting: "${n}"`);
            let s = t.webgpu.forceFallbackAdapter;
            if (s !== void 0 && typeof s != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);
            if (r = await navigator.gpu.requestAdapter({ powerPreference: n, forceFallbackAdapter: s }), !r) throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.');
          }
        }
        if (e === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
      }, Ht = /* @__PURE__ */ new Map(), fd = (t) => {
        let e = oe(), r = e.stackSave();
        try {
          let n = e.PTR_SIZE, s = e.stackAlloc(2 * n);
          e._OrtGetInputOutputCount(t, s, s + n) !== 0 && se("Can't get session input/output count.");
          let o = n === 4 ? "i32" : "i64";
          return [Number(e.getValue(s, o)), Number(e.getValue(s + n, o))];
        } finally {
          e.stackRestore(r);
        }
      }, gi = (t, e) => {
        let r = oe(), n = r.stackSave(), s = 0;
        try {
          let o = r.PTR_SIZE, i = r.stackAlloc(2 * o);
          r._OrtGetInputOutputMetadata(t, e, i, i + o) !== 0 && se("Can't get session input/output metadata.");
          let a = Number(r.getValue(i, "*"));
          s = Number(r.getValue(i + o, "*"));
          let l = r.HEAP32[s / 4];
          if (l === 0) return [a, 0];
          let c = r.HEAPU32[s / 4 + 1], u = [];
          for (let d = 0; d < c; d++) {
            let f = Number(r.getValue(s + 8 + d * o, "*"));
            u.push(f !== 0 ? r.UTF8ToString(f) : Number(r.getValue(s + 8 + (d + c) * o, "*")));
          }
          return [a, l, u];
        } finally {
          r.stackRestore(n), s !== 0 && r._OrtFree(s);
        }
      }, us = (t) => {
        let e = oe(), r = e._malloc(t.byteLength);
        if (r === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${t.byteLength}.`);
        return e.HEAPU8.set(t, r), [r, t.byteLength];
      }, Fi = async (t, e) => {
        let r, n, s = oe();
        Array.isArray(t) ? [r, n] = t : t.buffer === s.HEAPU8.buffer ? [r, n] = [t.byteOffset, t.byteLength] : [r, n] = us(t);
        let o = 0, i = 0, a = 0, l = [], c = [], u = [];
        try {
          if ([i, l] = await jd(e), e?.externalData && s.mountExternalData) {
            let y = [];
            for (let v of e.externalData) {
              let k = typeof v == "string" ? v : v.path, C = typeof v == "string" ? v : v.data;
              y.push(ds(C).then((x) => {
                s.mountExternalData(k, x);
              }));
            }
            await Promise.all(y);
          }
          for (let y of e?.executionProviders ?? []) if ((typeof y == "string" ? y : y.name) === "webnn") {
            if (s.shouldTransferToMLTensor = !1, typeof y != "string") {
              let v = y, k = v?.context, C = v?.gpuDevice, x = v?.deviceType, E = v?.powerPreference;
              k ? s.currentContext = k : C ? s.currentContext = await s.webnnCreateMLContext(C) : s.currentContext = await s.webnnCreateMLContext({ deviceType: x, powerPreference: E });
            } else s.currentContext = await s.webnnCreateMLContext();
            break;
          }
          o = await s._OrtCreateSession(r, n, i), s.webgpuOnCreateSession?.(o), o === 0 && se("Can't create a session."), s.jsepOnCreateSession?.(), s.currentContext && (s.webnnRegisterMLContext(o, s.currentContext), s.currentContext = void 0, s.shouldTransferToMLTensor = !0);
          let [d, f] = fd(o), h = !!e?.enableGraphCapture, p = [], m = [], _ = [], g = [], w = [];
          for (let y = 0; y < d; y++) {
            let [v, k, C] = gi(o, y);
            v === 0 && se("Can't get an input name."), c.push(v);
            let x = s.UTF8ToString(v);
            p.push(x), _.push(k === 0 ? { name: x, isTensor: !1 } : { name: x, isTensor: !0, type: as(k), shape: C });
          }
          for (let y = 0; y < f; y++) {
            let [v, k, C] = gi(o, y + d);
            v === 0 && se("Can't get an output name."), u.push(v);
            let x = s.UTF8ToString(v);
            m.push(x), g.push(k === 0 ? { name: x, isTensor: !1 } : { name: x, isTensor: !0, type: as(k), shape: C });
          }
          return Ht.set(o, [o, c, u, null, h, !1]), [o, p, m, _, g];
        } catch (d) {
          throw c.forEach((f) => s._OrtFree(f)), u.forEach((f) => s._OrtFree(f)), a !== 0 && s._OrtReleaseBinding(a) !== 0 && se("Can't release IO binding."), o !== 0 && s._OrtReleaseSession(o) !== 0 && se("Can't release session."), d;
        } finally {
          s._free(r), i !== 0 && s._OrtReleaseSessionOptions(i) !== 0 && se("Can't release session options."), l.forEach((d) => s._free(d)), s.unmountExternalData?.();
        }
      }, ji = (t) => {
        let e = oe(), r = Ht.get(t);
        if (!r) throw new Error(`cannot release session. invalid session id: ${t}`);
        let [n, s, o, i, a] = r;
        i && (a && e._OrtClearBoundOutputs(i.handle) !== 0 && se("Can't clear bound outputs."), e._OrtReleaseBinding(i.handle) !== 0 && se("Can't release IO binding.")), e.jsepOnReleaseSession?.(t), e.webnnOnReleaseSession?.(t), e.webgpuOnReleaseSession?.(t), s.forEach((l) => e._OrtFree(l)), o.forEach((l) => e._OrtFree(l)), e._OrtReleaseSession(n) !== 0 && se("Can't release session."), Ht.delete(t);
      }, fn = /* @__PURE__ */ new Map(), hd = 1, Yt = /* @__PURE__ */ new Map(), Hd = (t) => {
        let e = oe(), r = e._malloc(t.byteLength);
        if (r === 0) throw new Error(`Can't create a LoRA adapter. failed to allocate a buffer of size ${t.byteLength}.`);
        try {
          e.HEAPU8.set(t, r);
          let n = e._OrtCreateLoraAdapter(r, t.byteLength);
          n === 0 && se("Can't create a LoRA adapter.");
          let s = hd++;
          return fn.set(s, n), s;
        } finally {
          e._free(r);
        }
      }, Yd = (t) => {
        let e = oe(), r = fn.get(t);
        if (r === void 0) throw new Error(`cannot release LoRA adapter. invalid adapter id: ${t}`);
        if (Yt.has(t)) throw new Error(`cannot release LoRA adapter. the adapter is used by a run in progress. adapter id: ${t}`);
        e._OrtReleaseLoraAdapter(r) !== 0 && se("Can't release LoRA adapter."), fn.delete(t);
      }, wi = async (t, e, r, n, s, o, i = !1) => {
        if (!t) {
          e.push(0);
          return;
        }
        let a = oe(), l = a.PTR_SIZE, c = t[0], u = t[1], d = t[3], f = d, h, p;
        if (c === "string" && (d === "gpu-buffer" || d === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
        if (i && d !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${o} when enableGraphCapture is true.`);
        if (d === "gpu-buffer") {
          let g = t[2].gpuBuffer;
          p = Tr(Ar(c), u);
          {
            let w = a.jsepRegisterBuffer;
            if (!w) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
            h = w(n, o, g, p);
          }
        } else if (d === "ml-tensor") {
          let g = t[2].mlTensor;
          p = Tr(Ar(c), u);
          let w = a.webnnRegisterMLTensor;
          if (!w) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
          h = w(n, g, Ar(c), u);
        } else {
          let g = t[2];
          if (Array.isArray(g)) {
            p = l * g.length, h = a._malloc(p), r.push(h);
            for (let w = 0; w < g.length; w++) {
              if (typeof g[w] != "string") throw new TypeError(`tensor data at index ${w} is not a string`);
              a.setValue(h + w * l, rt(g[w], r), "*");
            }
          } else {
            let w = a.webnnIsGraphInput, y = a.webnnIsGraphOutput;
            if (c !== "string" && w && y) {
              let v = a.UTF8ToString(s);
              if (w(n, v) || y(n, v)) {
                let k = Ar(c);
                p = Tr(k, u), f = "ml-tensor";
                let C = a.webnnCreateTemporaryTensor, x = a.webnnUploadTensor;
                if (!C || !x) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
                let E = await C(n, k, u);
                x(E, new Uint8Array(g.buffer, g.byteOffset, g.byteLength)), h = E;
              } else p = g.byteLength, h = a._malloc(p), r.push(h), a.HEAPU8.set(new Uint8Array(g.buffer, g.byteOffset, p), h);
            } else p = g.byteLength, h = a._malloc(p), r.push(h), a.HEAPU8.set(new Uint8Array(g.buffer, g.byteOffset, p), h);
          }
        }
        let m = a.stackSave(), _ = a.stackAlloc(4 * u.length);
        try {
          u.forEach((w, y) => a.setValue(_ + y * l, w, l === 4 ? "i32" : "i64"));
          let g = a._OrtCreateTensor(Ar(c), h, p, _, u.length, Gd(f));
          g === 0 && se(`Can't create tensor for input/output. session=${n}, index=${o}.`), e.push(g);
        } finally {
          a.stackRestore(m);
        }
      }, Wi = async (t, e, r, n, s, o, i = []) => {
        let a = oe(), l = a.PTR_SIZE, c = Ht.get(t);
        if (!c) throw new Error(`cannot run inference. invalid session id: ${t}`);
        let u = c[0], d = c[1], f = c[2], h = c[3], p = c[4], m = c[5], _ = [];
        if (i.length > 0) {
          if (h) throw new Error("LoRA adapters are not supported for a session that uses IO binding, e.g. when an output is preferred to be on GPU, or when the WebNN execution provider produces an output.");
          for (let I of i) {
            let S = fn.get(I);
            if (S === void 0) throw new Error(`cannot run inference. invalid LoRA adapter id: ${I}`);
            _.push(S);
          }
        }
        let g = e.length, w = n.length, y = 0, v = [], k = [], C = [], x = [], E = [], O = a.stackSave(), D = a.stackAlloc(g * l), z = a.stackAlloc(g * l), B = a.stackAlloc(w * l), P = a.stackAlloc(w * l);
        try {
          for (let $ of i) Yt.set($, (Yt.get($) ?? 0) + 1);
          [y, v] = Fd(o, _), Zt("wasm prepareInputOutputTensor");
          for (let $ = 0; $ < g; $++) await wi(r[$], k, x, t, d[e[$]], e[$], p);
          for (let $ = 0; $ < w; $++) await wi(s[$], C, x, t, f[n[$]], g + n[$], p);
          Qt("wasm prepareInputOutputTensor");
          for (let $ = 0; $ < g; $++) a.setValue(D + $ * l, k[$], "*"), a.setValue(z + $ * l, d[e[$]], "*");
          for (let $ = 0; $ < w; $++) a.setValue(B + $ * l, C[$], "*"), a.setValue(P + $ * l, f[n[$]], "*");
          a.jsepOnRunStart?.(u), a.webnnOnRunStart?.(u);
          let I;
          I = await a._OrtRun(u, z, D, g, P, w, B, y), I !== 0 && se("failed to call OrtRun().");
          let S = [], F = [];
          Zt("wasm ProcessOutputTensor");
          for (let $ = 0; $ < w; $++) {
            let Z = Number(a.getValue(B + $ * l, "*"));
            if (Z === C[$] || E.includes(C[$])) {
              S.push(s[$]), Z !== C[$] && a._OrtReleaseTensor(Z) !== 0 && se("Can't release tensor.");
              continue;
            }
            let K = a.stackSave(), A = a.stackAlloc(4 * l), M = !1, L, G = 0;
            try {
              a._OrtGetTensorData(Z, A, A + l, A + 2 * l, A + 3 * l) !== 0 && se(`Can't access output tensor data on index ${$}.`);
              let _e = l === 4 ? "i32" : "i64", Ce = Number(a.getValue(A, _e));
              G = a.getValue(A + l, "*");
              let qe = a.getValue(A + l * 2, "*"), xe = Number(a.getValue(A + l * 3, _e)), he = [];
              for (let ge = 0; ge < xe; ge++) he.push(Number(a.getValue(qe + ge * l, _e)));
              a._OrtFree(qe) !== 0 && se("Can't free memory for tensor dims.");
              let He = he.reduce((ge, de) => ge * de, 1);
              L = as(Ce);
              let tt = h?.outputPreferredLocations[n[$]];
              if (L === "string") {
                if (tt === "gpu-buffer" || tt === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
                let ge = [];
                for (let de = 0; de < He; de++) {
                  let Ne = a.getValue(G + de * l, "*"), cn = a.getValue(G + (de + 1) * l, "*"), un = de === He - 1 ? void 0 : cn - Ne;
                  ge.push(a.UTF8ToString(Ne, un));
                }
                S.push([L, he, ge, "cpu"]);
              } else if (tt === "gpu-buffer" && He > 0) {
                let ge = a.jsepGetBuffer;
                if (!ge) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                let de = ge(G), Ne = Tr(Ce, He);
                if (Ne === void 0 || !Ni(L)) throw new Error(`Unsupported data type: ${L}`);
                M = !0, S.push([L, he, { gpuBuffer: de, download: a.jsepCreateDownloader(de, Ne, L), dispose: () => {
                  a._OrtReleaseTensor(Z) !== 0 && se("Can't release tensor.");
                } }, "gpu-buffer"]);
              } else if (tt === "ml-tensor" && He > 0) {
                let ge = a.webnnEnsureTensor, de = a.webnnIsGraphInputOutputTypeSupported;
                if (!ge || !de) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
                if (Tr(Ce, He) === void 0 || !Di(L)) throw new Error(`Unsupported data type: ${L}`);
                if (!de(t, L, !1)) throw new Error(`preferredLocation "ml-tensor" for ${L} output is not supported by current WebNN Context.`);
                let Ne = await ge(t, G, Ce, he, !1);
                M = !0, S.push([L, he, { mlTensor: Ne, download: a.webnnCreateMLTensorDownloader(G, L), dispose: () => {
                  a.webnnReleaseTensorId(G), a._OrtReleaseTensor(Z);
                } }, "ml-tensor"]);
              } else if (tt === "ml-tensor-cpu-output" && He > 0) {
                let ge = a.webnnCreateMLTensorDownloader(G, L)(), de = S.length;
                M = !0, F.push((async () => {
                  let Ne = [de, await ge];
                  return a.webnnReleaseTensorId(G), a._OrtReleaseTensor(Z), Ne;
                })()), S.push([L, he, [], "cpu"]);
              } else {
                let ge = Wd(L), de = new ge(He);
                new Uint8Array(de.buffer, de.byteOffset, de.byteLength).set(a.HEAPU8.subarray(G, G + de.byteLength)), S.push([L, he, de, "cpu"]);
              }
            } finally {
              a.stackRestore(K), L === "string" && G && a._free(G), M || a._OrtReleaseTensor(Z);
            }
          }
          h && !p && (a._OrtClearBoundOutputs(h.handle) !== 0 && se("Can't clear bound outputs."), Ht.set(t, [u, d, f, h, p, !1]));
          for (let [$, Z] of await Promise.all(F)) S[$][2] = Z;
          return Qt("wasm ProcessOutputTensor"), S;
        } finally {
          a.webnnOnRunEnd?.(u), a.stackRestore(O), k.forEach((I) => a._OrtReleaseTensor(I)), C.forEach((I) => a._OrtReleaseTensor(I)), x.forEach((I) => a._free(I)), y !== 0 && a._OrtReleaseRunOptions(y), v.forEach((I) => a._free(I));
          for (let I of i) {
            let S = Yt.get(I) - 1;
            S === 0 ? Yt.delete(I) : Yt.set(I, S);
          }
        }
      }, Vi = (t) => {
        let e = oe(), r = Ht.get(t);
        if (!r) throw new Error("invalid session id");
        let n = r[0], s = e._OrtEndProfiling(n);
        s === 0 && se("Can't get an profile file name."), e._OrtFree(s);
      }, Gi = (t) => {
        let e = [];
        for (let r of t) {
          let n = r[2];
          !Array.isArray(n) && "buffer" in n && e.push(n.buffer);
        }
        return e;
      };
    }), qi = re(() => {
      "use strict";
      Pt(), Xd(), Sr(), Li(), zi(), dt = () => !!ie.wasm.proxy && typeof document < "u", kr = !1, hn = !1, pn = !1, os = /* @__PURE__ */ new Map(), Xt = (t, e) => {
        let r = os.get(t);
        r ? r.push(e) : os.set(t, [e]);
      }, Kt = () => {
        if (kr || !hn || pn || !Ye) throw new Error("worker not ready");
      }, pd = (t) => {
        switch (t.data.type) {
          case "init-wasm":
            kr = !1, t.data.err ? (pn = !0, yi[1](t.data.err)) : (hn = !0, yi[0]()), ss && (URL.revokeObjectURL(ss), ss = void 0);
            break;
          case "init-ep":
          case "copy-from":
          case "create":
          case "release":
          case "run":
          case "end-profiling": {
            let e = os.get(t.data.type);
            t.data.err ? e.shift()[1](t.data.err) : e.shift()[0](t.data.out);
            break;
          }
          default:
        }
      }, Kd = async () => {
        if (!hn) {
          if (kr) throw new Error("multiple calls to 'initWasm()' detected.");
          if (pn) throw new Error("previous call to 'initWasm()' failed.");
          if (kr = !0, dt()) return new Promise((t, e) => {
            Ye?.terminate(), Bd().then(([r, n]) => {
              try {
                Ye = n, Ye.onerror = (o) => e(o), Ye.onmessage = pd, yi = [t, e];
                let s = { type: "init-wasm", in: ie };
                if (!s.in.wasm.wasmPaths && r) {
                  let o = Pi();
                  o && (s.in.wasm.wasmPaths = o);
                }
                Ye.postMessage(s), ss = r;
              } catch (s) {
                e(s);
              }
            }, e);
          });
          try {
            await Ri(ie.wasm), await Bi(ie), hn = !0;
          } catch (t) {
            throw pn = !0, t;
          } finally {
            kr = !1;
          }
        }
      }, Jd = async (t) => {
        if (dt()) return Kt(), new Promise((e, r) => {
          Xt("init-ep", [e, r]);
          let n = { type: "init-ep", in: { epName: t, env: ie } };
          Ye.postMessage(n);
        });
        await Ui(ie, t);
      }, Zd = async (t) => dt() ? (Kt(), new Promise((e, r) => {
        Xt("copy-from", [e, r]);
        let n = { type: "copy-from", in: { buffer: t } };
        Ye.postMessage(n, [t.buffer]);
      })) : us(t), Qd = async (t, e) => {
        if (dt()) {
          if (e?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
          return Kt(), new Promise((r, n) => {
            Xt("create", [r, n]);
            let s = { type: "create", in: { model: t, options: { ...e } } }, o = [];
            t instanceof Uint8Array && o.push(t.buffer), Ye.postMessage(s, o);
          });
        } else return Fi(t, e);
      }, ef = async (t) => {
        if (dt()) return Kt(), new Promise((e, r) => {
          Xt("release", [e, r]);
          let n = { type: "release", in: t };
          Ye.postMessage(n);
        });
        ji(t);
      }, tf = async (t) => {
        if (dt()) throw new Error("LoRA adapter is not supported for proxy.");
        let e = typeof t == "string" ? await ds(t) : t;
        return Hd(e);
      }, rf = async (t) => {
        if (dt()) throw new Error("LoRA adapter is not supported for proxy.");
        Yd(t);
      }, nf = async (t, e, r, n, s, o, i) => {
        if (dt()) {
          if (i.length > 0) throw new Error("LoRA adapter is not supported for proxy.");
          if (r.some((a) => a[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
          if (s.some((a) => a)) throw new Error("pre-allocated output tensor is not supported for proxy.");
          return Kt(), new Promise((a, l) => {
            Xt("run", [a, l]);
            let c = r, u = { type: "run", in: { sessionId: t, inputIndices: e, inputs: c, outputIndices: n, options: o } };
            Ye.postMessage(u, Gi(c));
          });
        } else return Wi(t, e, r, n, s, o, i);
      }, sf = async (t) => {
        if (dt()) return Kt(), new Promise((e, r) => {
          Xt("end-profiling", [e, r]);
          let n = { type: "end-profiling", in: t };
          Ye.postMessage(n);
        });
        Vi(t);
      };
    }), of = re(() => {
      "use strict";
      Pt(), qi(), Hi = class {
        async loadAdapter(t) {
          bt(), this.adapterId = await tf(t), xt();
        }
        async dispose() {
          return rf(this.adapterId);
        }
      };
    }), ry = re(() => {
      "use strict";
      Pt(), of(), qi(), qd(), Oi(), zi(), bi = (t, e) => {
        switch (t.location) {
          case "cpu":
            return [t.type, t.dims, t.data, "cpu"];
          case "gpu-buffer":
            return [t.type, t.dims, { gpuBuffer: t.gpuBuffer }, "gpu-buffer"];
          case "ml-tensor":
            return [t.type, t.dims, { mlTensor: t.mlTensor }, "ml-tensor"];
          default:
            throw new Error(`invalid data location: ${t.location} for ${e()}`);
        }
      }, md = (t) => {
        switch (t[3]) {
          case "cpu":
            return new nt(t[0], t[2], t[1]);
          case "gpu-buffer": {
            let e = t[0];
            if (!Ni(e)) throw new Error(`not supported data type: ${e} for deserializing GPU tensor`);
            let { gpuBuffer: r, download: n, dispose: s } = t[2];
            return nt.fromGpuBuffer(r, { dataType: e, dims: t[1], download: n, dispose: s });
          }
          case "ml-tensor": {
            let e = t[0];
            if (!Di(e)) throw new Error(`not supported data type: ${e} for deserializing MLTensor tensor`);
            let { mlTensor: r, download: n, dispose: s } = t[2];
            return nt.fromMLTensor(r, { dataType: e, dims: t[1], download: n, dispose: s });
          }
          default:
            throw new Error(`invalid data location: ${t[3]}`);
        }
      }, af = class {
        async fetchModelAndCopyToWasmMemory(t) {
          return Zd(await ds(t));
        }
        async loadModel(t, e) {
          bt();
          let r;
          typeof t == "string" ? r = await this.fetchModelAndCopyToWasmMemory(t) : r = t, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await Qd(r, e), xt();
        }
        async dispose() {
          return ef(this.sessionId);
        }
        async run(t, e, r, n = []) {
          bt();
          let s = n.map((h) => {
            if (!(h instanceof Hi)) throw new Error("LoRA adapter was not created by the WebAssembly backend.");
            return h.adapterId;
          }), o = [], i = [];
          Object.entries(t).forEach((h) => {
            let p = h[0], m = h[1], _ = this.inputNames.indexOf(p);
            if (_ === -1) throw new Error(`invalid input '${p}'`);
            o.push(m), i.push(_);
          });
          let a = [], l = [];
          Object.entries(e).forEach((h) => {
            let p = h[0], m = h[1], _ = this.outputNames.indexOf(p);
            if (_ === -1) throw new Error(`invalid output '${p}'`);
            a.push(m), l.push(_);
          });
          let c = o.map((h, p) => bi(h, () => `input "${this.inputNames[i[p]]}"`)), u = a.map((h, p) => h ? bi(h, () => `output "${this.outputNames[l[p]]}"`) : null), d = await nf(this.sessionId, i, c, l, u, r, s), f = {};
          for (let h = 0; h < d.length; h++) f[this.outputNames[l[h]]] = a[h] ?? md(d[h]);
          return xt(), f;
        }
        startProfiling() {
        }
        endProfiling() {
          sf(this.sessionId);
        }
      };
    }), ny = re(() => {
      "use strict";
      lf = (t) => {
        if (t?.epContextDataRead) throw new Error('session option "epContextDataRead" is not supported by ONNX Runtime Web');
      };
    }), cf = {};
    ki(cf, { OnnxruntimeWebAssemblyBackend: () => vi, initializeFlags: () => xi, wasmBackend: () => uf });
    sy = re(() => {
      "use strict";
      Pt(), of(), qi(), ry(), ny(), xi = () => {
        (typeof ie.wasm.initTimeout != "number" || ie.wasm.initTimeout < 0) && (ie.wasm.initTimeout = 0);
        let t = ie.wasm.simd;
        if (typeof t != "boolean" && t !== void 0 && t !== "fixed" && t !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${t}". Reset it to \`false\` and ignore SIMD feature checking.`), ie.wasm.simd = !1), typeof ie.wasm.proxy != "boolean" && (ie.wasm.proxy = !1), typeof ie.wasm.trace != "boolean" && (ie.wasm.trace = !1), typeof ie.wasm.numThreads != "number" || !Number.isInteger(ie.wasm.numThreads) || ie.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) ie.wasm.numThreads = 1;
        else {
          let e = typeof navigator > "u" ? Dw("node:os").cpus().length : navigator.hardwareConcurrency;
          ie.wasm.numThreads = Math.min(4, Math.ceil((e || 1) / 2));
        }
      }, vi = class {
        async init(t) {
          xi(), await Kd(), await Jd(t);
        }
        async createInferenceSessionHandler(t, e) {
          lf(e);
          let r = new af();
          return await r.loadModel(t, e), r;
        }
        async createLoraAdapterHandler(t) {
          let e = new Hi();
          return await e.loadAdapter(t), e;
        }
      }, uf = new vi();
    });
    Pt();
    Pt();
    Pt();
    oy = "1.31.1", iy = Nd;
    {
      let t = (sy(), _d(cf)).wasmBackend;
      _n("cpu", t, 10), _n("wasm", t, 10);
    }
    Object.defineProperty(ie.versions, "web", { value: oy, enumerable: !0 });
  });

  // node_modules/ppu-paddle-ocr/model-catalogue.js
  function df(t) {
    let e = globalThis.process?.env?.PPU_PADDLE_OCR_MODEL_MIRROR;
    return !e || e === "0" || e === "false" || !t.startsWith(V) ? null : ay + t.slice(V.length);
  }
  var V, ce, fs, ay, Yi, Xi, hs, Ki, Ji, Zi, Qi, ea, ta, ra, na, sa, oa, ia, aa, la, ca, ua, da, fa, ha, pa, ma, _a, ga, Et, ff, gn = b(() => {
    V = "https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main", ce = "https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main", fs = `${V}/correction/UVDoc_grid.onnx`, ay = "https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/raw/main";
    Yi = { detection: `${V}/detection/ort/PP-OCRv6_small_det.ort`, recognition: `${V}/recognition/ort/PP-OCRv6_small_rec.ort`, charactersDictionary: `${ce}/recognition/ppocrv6_dict.txt` }, Xi = { detection: `${V}/detection/ort/PP-OCRv6_medium_det.ort`, recognition: `${V}/recognition/ort/PP-OCRv6_medium_rec.ort`, charactersDictionary: `${ce}/recognition/ppocrv6_dict.txt` }, hs = { detection: `${V}/detection/ort/PP-OCRv6_tiny_det.ort`, recognition: `${V}/recognition/ort/PP-OCRv6_tiny_rec.ort`, charactersDictionary: `${ce}/recognition/ppocrv6_tiny_dict.txt` }, Ki = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.ort`, recognition: `${V}/recognition/multi/en/v5/en_PP-OCRv5_mobile_rec_infer.ort`, charactersDictionary: `${ce}/recognition/multi/en/v5/ppocrv5_en_dict.txt` }, Ji = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.ort`, recognition: `${V}/recognition/multi/en/v5/en_PP-OCRv5_mobile_rec_infer_int8.ort`, charactersDictionary: `${ce}/recognition/multi/en/v5/ppocrv5_en_dict.txt` }, Zi = { detection: `${V}/detection/PP-OCRv5_server_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv5_server_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv5_dict.txt` }, Qi = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv5_dict.txt` }, ea = { detection: `${V}/detection/PP-OCRv5_server_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv5_server_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv5_dict.txt` }, ta = { detection: `${V}/detection/PP-OCRv4_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/en/v4/en_PP-OCRv4_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/en/v4/en_dict.txt` }, ra = { detection: `${V}/detection/PP-OCRv4_mobile_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv4_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv4_dict.txt` }, na = { detection: `${V}/detection/PP-OCRv4_server_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv4_server_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv4_dict.txt` }, sa = { detection: `${V}/detection/PP-OCRv4_server_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv4_server_rec_doc_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv4_doc_dict.txt` }, oa = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/PP-OCRv3_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/ppocrv3_dict.txt` }, ia = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/japan/v3/japan_PP-OCRv3_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/japan/v3/japan_dict.txt` }, aa = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/arabic/v5/arabic_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/arabic/v5/ppocrv5_arabic_dict.txt` }, la = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/cyrillic/v5/cyrillic_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/cyrillic/v5/ppocrv5_cyrillic_dict.txt` }, ca = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/devanagari/v5/devanagari_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/devanagari/v5/ppocrv5_devanagari_dict.txt` }, ua = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/el/v5/el_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/el/v5/ppocrv5_el_dict.txt` }, da = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/eslav/v5/eslav_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/eslav/v5/ppocrv5_eslav_dict.txt` }, fa = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/korean/v5/korean_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/korean/v5/ppocrv5_korean_dict.txt` }, ha = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/latin/v5/latin_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/latin/v5/ppocrv5_latin_dict.txt` }, pa = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/ta/v5/ta_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/ta/v5/ppocrv5_ta_dict.txt` }, ma = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/te/v5/te_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/te/v5/ppocrv5_te_dict.txt` }, _a = { detection: `${V}/detection/PP-OCRv5_mobile_det_infer.onnx`, recognition: `${V}/recognition/multi/th/v5/th_PP-OCRv5_mobile_rec_infer.onnx`, charactersDictionary: `${ce}/recognition/multi/th/v5/ppocrv5_th_dict.txt` }, ga = hs, Et = ga, ff = { "v6-small": Yi, "v6-medium": Xi, "v6-tiny": hs, "v5-en-mobile": Ki, "v5-en-mobile-int8": Ji, "v5-en-server": Zi, "v5-mobile": Qi, "v5-server": ea, "v5-arabic-mobile": aa, "v5-cyrillic-mobile": la, "v5-devanagari-mobile": ca, "v5-greek-mobile": ua, "v5-eslav-mobile": da, "v5-korean-mobile": fa, "v5-latin-mobile": ha, "v5-tamil-mobile": pa, "v5-telugu-mobile": ma, "v5-thai-mobile": _a, "v4-en-mobile": ta, "v4-mobile": ra, "v4-server": na, "v4-server-doc": sa, "v3-mobile": oa, "v3-japanese-mobile": ia };
  });

  // node_modules/ppu-paddle-ocr/constants.js
  var kt, wn, Ir, hf, ly, yn, wa, ya, Mr, er = b(() => {
    kt = { verbose: !1, debug: !1, debugFolder: "out" }, wn = { mean: [0.485, 0.456, 0.406], stdDeviation: [0.229, 0.224, 0.225], maxSideLength: "auto", minimumAreaThreshold: 20, paddingVertical: 0.4, paddingHorizontal: 0.6 }, Ir = { imageHeight: 48, strategy: "per-line", crossLineWidthFactor: 1, minimumConfidence: 0.5, charactersDictionary: [], maxCropSourceSideLength: 2e3, mainThreadYieldMs: 0, recBatchSize: 6, rotateVerticalCrops: !0, spaceRecovery: !1 }, hf = 10, ly = { executionProviders: ["cpu"], graphOptimizationLevel: "all", enableCpuMemArena: !0, enableMemPattern: !0, executionMode: "sequential", interOpNumThreads: 0, intraOpNumThreads: 0 }, yn = "opencv", wa = { engine: yn }, ya = { enabled: !1 }, Mr = { model: {}, detection: wn, recognition: Ir, debugging: kt, session: ly, processing: wa, unwarping: ya };
  });

  // node_modules/ppu-paddle-ocr/utils.js
  function ps(t, ...e) {
    if (!e.length) return t;
    let r = e.shift();
    if (ba(r)) {
      for (let n in r)
        if (Object.prototype.hasOwnProperty.call(r, n)) {
          if (n === "__proto__" || n === "constructor" || n === "prototype")
            continue;
          let s = r[n], o = t[n];
          ba(s) ? ((!o || !ba(o)) && (t[n] = {}), ps(t[n], s)) : s !== void 0 && (t[n] = s);
        }
    }
    return ps(t, ...e);
  }
  function cy(t, e) {
    if (!t) return null;
    let r = t.trim();
    if (r === "") return null;
    let n = Number(r);
    if (Number.isFinite(n))
      return n <= 0 ? 0 : Math.min(n * 1e3, pf);
    let s = Date.parse(r);
    return Number.isNaN(s) ? null : Math.min(Math.max(s - e, 0), pf);
  }
  function uy(t) {
    let e = 500 * 2 ** t;
    return e + Math.random() * e;
  }
  async function xa(t, e = {}) {
    let { timeoutMs: r = 3e5, retries: n = 2, fallbackUrl: s = df(t) } = e, o;
    for (let a = 0; a <= n; a++) {
      let l = null;
      try {
        let c = await fetch(t, { signal: AbortSignal.timeout(r), referrerPolicy: "no-referrer" });
        if (!c.ok)
          throw l = cy(c.headers.get("retry-after"), Date.now()), new Error(`HTTP ${c.status} ${c.statusText}`);
        return await c.arrayBuffer();
      } catch (c) {
        o = c, a < n && await new Promise((u) => setTimeout(u, l ?? uy(a)));
      }
    }
    let i = new Error(`Failed to fetch ${t} after ${n + 1} attempt(s): ${String(o)}`);
    if (!s) throw i;
    console.warn(`[ppu-paddle-ocr] ${i.message}
  retrying on ${s}`);
    try {
      return await xa(s, { timeoutMs: r, retries: n, fallbackUrl: null });
    } catch (a) {
      throw new Error(`${i.message}; mirror also failed: ${String(a)}`, { cause: i });
    }
  }
  function bn(t) {
    return (typeof t == "string" ? t : new TextDecoder("utf-8").decode(t)).split(/\r?\n/);
  }
  function ba(t) {
    return t !== null && typeof t == "object" && !Array.isArray(t) && !(t instanceof Date) && !(t instanceof RegExp) && !(t instanceof ArrayBuffer) && !ArrayBuffer.isView(t);
  }
  var pf, ms = b(() => {
    gn();
    pf = 6e4;
  });

  // node_modules/ppu-paddle-ocr/core/detection/box-geometry.js
  function mf(t, e) {
    return t !== "auto" ? t : Math.min(1920, Math.max(960, Math.round(e * 0.75 / 32) * 32));
  }
  function Or(t, e, r) {
    let n = t, s = e, o = 1;
    return Math.max(s, n) > r && (o = r / (s > n ? s : n), n = Math.round(n * o), s = Math.round(s * o)), { width: n, height: s, ratio: o };
  }
  function dy(t, e, r, n, s) {
    let o = Math.round(t.height * n), i = Math.round(t.height * s), a = t.x - i, l = t.y - o;
    a = Math.max(0, a), l = Math.max(0, l);
    let c = Math.min(e, t.x + t.width + i), u = Math.min(r, t.y + t.height + o), d = c - a, f = u - l;
    return { x: a, y: l, width: d, height: f };
  }
  function fy(t, e, r, n) {
    let s = t.x / e, o = t.y / e, i = t.width / e, a = t.height / e, l = Math.max(0, Math.round(s)), c = Math.max(0, Math.round(o)), u = Math.min(r - l, Math.round(i)), d = Math.min(n - c, Math.round(a));
    return { x: l, y: c, width: u, height: d };
  }
  function _f(t, e, r, n, s, o, i, a, l) {
    let c = [];
    return t.iterate((u) => {
      try {
        let d = t.getRect(u);
        if (d.width * d.height <= i)
          return;
        let f = dy(d, e, r, a, l), h = fy(f, n, s, o);
        h.width > 5 && h.height > 5 && c.push(h);
      } finally {
        u.delete();
      }
    }), c;
  }
  function gf(t, e, r) {
    let n = [];
    for (let s of t) {
      let { bbox: o } = s, i = { x: Math.max(0, o.x0), y: Math.max(0, o.y0), width: o.x1 - o.x0, height: o.y1 - o.y0 };
      i.x + i.width > e && (i.width = e - i.x), i.y + i.height > r && (i.height = r - i.y), i.width > 5 && i.height > 5 && n.push(i);
    }
    return n;
  }
  var _s = b(() => {
  });

  // node_modules/ppu-paddle-ocr/core/detection/image-tensor.js
  function wf(t, e, r, n, s) {
    let a = t.getContext("2d").getImageData(0, 0, e, r).data, l = r * e, c = new Float32Array(hy * l), u = n[0] ?? 0.485, d = n[1] ?? 0.456, f = n[2] ?? 0.406, h = s[0] ?? 0.229, p = s[1] ?? 0.224, m = s[2] ?? 0.225, _ = 1 / (255 * h), g = 1 / (255 * p), w = 1 / (255 * m), y = u / h, v = d / p, k = f / m, C = l, x = l * 2;
    for (let E = 0, O = 0; E < l; E++, O += 4) {
      let D = a[O], z = a[O + 1], B = a[O + 2];
      c[E] = D * _ - y, c[C + E] = z * g - v, c[x + E] = B * w - k;
    }
    return c;
  }
  function va(t, e, r, n) {
    let s = n(e, r), o = s.getContext("2d"), i = o.createImageData(e, r), a = i.data, l = e * r;
    for (let c = 0; c < l; c++) {
      let u = t[c] || 0, d = Math.round(u * 255), f = c * 4;
      a[f] = d, a[f + 1] = d, a[f + 2] = d, a[f + 3] = 255;
    }
    return o.putImageData(i, 0, 0), s;
  }
  var hy, yf = b(() => {
    hy = 3;
  });

  // node_modules/ppu-paddle-ocr/core/base-detection.service.js
  var Pr, Ea = b(() => {
    er();
    _s();
    yf();
    Pr = class {
      options;
      debugging;
      session;
      platform;
      engine;
      lastDetectionCanvas = null;
      constructor(e, r, n = {}, s = {}, o = "opencv") {
        this.platform = e, this.session = r, this.options = { ...wn, ...n }, this.debugging = { ...kt, ...s }, o === "opencv" && !this.platform.imageProcessor ? this.engine = "canvas-native" : this.engine = o;
      }
      log(e) {
        this.debugging.verbose && console.log(`[DetectionService] ${e}`);
      }
      async run(e) {
        this.log("Starting text detection process");
        try {
          let r;
          this.platform.isCanvas(e) ? r = e : this.engine === "opencv" && this.platform.imageProcessor ? r = await this.platform.imageProcessor.prepareCanvas(e) : r = await this.platform.canvas.prepareCanvas(e);
          let n = await this.preprocessDetection(r), s = await this.runInference(n.tensor, n.width, n.height);
          if (!s)
            return console.error("Text detection failed (output tensor is null)"), [];
          let o = this.postprocessDetection(s, n);
          if (this.debugging.debug && this.debugging.debugFolder && this.lastDetectionCanvas)
            try {
              await this.debugDetectionCanvas(this.lastDetectionCanvas, n.width, n.height), await this.debugDetectedBoxes(r, o);
            } catch (i) {
              this.log(`Debug dump failed: ${i instanceof Error ? i.message : String(i)}`);
            }
          return this.log(`Detected ${o.length} text boxes in image`), o;
        } catch (r) {
          return console.error("Error during text detection:", r instanceof Error ? r.message : String(r)), [];
        }
      }
      async preprocessDetection(e) {
        let { width: r, height: n } = e, s = mf(this.options.maxSideLength ?? "auto", Math.max(r, n)), { width: o, height: i, ratio: a } = Or(r, n, s), l = Math.ceil(o / 32) * 32, c = Math.ceil(i / 32) * 32, u = this.platform.createCanvas(l, c);
        u.getContext("2d").drawImage(e, 0, 0, r, n, 0, 0, o, i);
        let f = this.options.mean ?? [0.485, 0.456, 0.406], h = this.options.stdDeviation ?? [0.229, 0.224, 0.225], p = wf(u, l, c, f, h);
        return this.log(`Detection preprocessed: original(${r}x${n}), model_input(${l}x${c}), resize_ratio: ${a.toFixed(4)}, engine: ${this.engine}`), { tensor: p, width: l, height: c, resizeRatio: a, originalWidth: r, originalHeight: n };
      }
      async runInference(e, r, n) {
        let s;
        try {
          this.log("Running detection inference..."), s = new this.platform.ort.Tensor("float32", e, [1, 3, n, r]);
          let o = { x: s }, a = (await this.session.run(o))[this.session.outputNames[0] || "sigmoid_0.tmp_0"];
          return this.log("Detection inference complete!"), a ? a.data : (console.error(`Output tensor ${this.session.outputNames[0]} not found in detection results`), null);
        } catch (o) {
          throw console.error("Error during model inference:", o instanceof Error ? o.message : String(o)), o;
        } finally {
          s?.dispose();
        }
      }
      postprocessDetection(e, r, n = this.options.minimumAreaThreshold ?? 50, s = this.options.paddingVertical || 0.4, o = this.options.paddingHorizontal || 0.6) {
        this.log("Post-processing detection results...");
        let { width: i, height: a, resizeRatio: l, originalWidth: c, originalHeight: u } = r;
        if (this.engine === "opencv" && this.platform.imageProcessor)
          return this.lastDetectionCanvas = this.debugging.debug && this.debugging.debugFolder ? va(e, i, a, this.platform.createCanvas.bind(this.platform)) : null, this.postprocessWithOpenCV(e, i, a, l, c, u, n, s, o);
        let d = va(e, i, a, this.platform.createCanvas.bind(this.platform));
        return this.lastDetectionCanvas = d, this.postprocessWithCanvasNative(d, l, c, u, n, s, o);
      }
      postprocessWithOpenCV(e, r, n, s, o, i, a, l, c) {
        let u = this.platform.imageProcessor, d = new u.cv.Mat(n, r, u.cv.CV_8UC1), f = d.data, h = r * n;
        for (let m = 0; m < h; m++) {
          let _ = e[m] || 0;
          f[m] = Math.round(Math.min(Math.max(_, 0), 1) * 255);
        }
        let p = new u.ImageProcessor(d);
        try {
          let m = new u.Contours(p.toMat(), { mode: u.cv.RETR_LIST, method: u.cv.CHAIN_APPROX_SIMPLE });
          try {
            let _ = _f(m, r, n, s, o, i, a, l, c);
            return this.log(`Found ${_.length} potential text boxes (opencv)`), _;
          } finally {
            m.destroy();
          }
        } finally {
          p.destroy();
        }
      }
      postprocessWithCanvasNative(e, r, n, s, o, i, a) {
        let c = this.platform.canvas.createProcessor(e).grayscale().threshold({ thresh: 0 }).findRegions({ foreground: "light", minArea: o, thresh: 0, padding: { vertical: i, horizontal: a }, scale: 1 / r }), u = gf(c, n, s);
        return this.log(`Found ${u.length} potential text boxes (canvas-native)`), u;
      }
      async debugDetectionCanvas(e, r, n) {
        let s = this.debugging.debugFolder ?? "";
        await this.platform.saveDebugImage(e, "detection-debug", s), this.log(`Probability map visualized and saved to: ${s}`);
      }
      async debugDetectedBoxes(e, r) {
        let n = this.platform.isCanvas(e) ? e : await this.platform.canvas.prepareCanvas(e), s = this.platform.createCanvas(n.width, n.height), o = s.getContext("2d");
        o.drawImage(n, 0, 0);
        for (let a of r) {
          let { x: l, y: c, width: u, height: d } = a;
          this.platform.canvas.getToolkit().drawLine({ ctx: o, x: l, y: c, width: u, height: d });
        }
        let i = this.debugging.debugFolder ?? "";
        await this.platform.saveDebugImage(s, "boxes-debug", i), this.log(`Boxes visualized and saved to: ${i}`);
      }
    };
  });

  // node_modules/ppu-paddle-ocr/core/batch.js
  function bf(t) {
    return t.reason instanceof Error ? t.reason : new DOMException("The batch operation was aborted.", "AbortError");
  }
  function py(t) {
    if (Symbol.asyncIterator in t)
      return t[Symbol.asyncIterator]();
    let e = t[Symbol.iterator]();
    return { next: () => Promise.resolve(e.next()), return: (r) => Promise.resolve(e.return?.(r) ?? { done: !0, value: void 0 }) };
  }
  async function ka(t, e, r, n) {
    let { settle: s, signal: o } = e, i = Math.max(1, Math.floor(e.concurrency));
    if (o?.aborted) throw bf(o);
    let a = 0, l = 0, c = !1, u = !1, d, f = Array.isArray(t) ? t : null, h = f ? null : py(t), p = Promise.resolve(), m = async () => {
      let w = p, y;
      p = new Promise((v) => {
        y = v;
      }), await w;
      try {
        return await h.next();
      } finally {
        y();
      }
    }, _ = () => {
      c = !0;
    };
    o?.addEventListener("abort", _, { once: !0 });
    let g = async () => {
      for (; !c; ) {
        let w, y;
        if (f) {
          if (a >= f.length) return;
          y = a++, w = f[y];
        } else {
          let v = await m();
          if (v.done || c) return;
          y = a++, w = v.value;
        }
        try {
          let v = await r(w, y);
          if (c) return;
          n({ index: y, status: "fulfilled", value: v });
        } catch (v) {
          if (s)
            n({ index: y, status: "rejected", reason: v });
          else {
            c = !0, u = !0, d = v;
            return;
          }
        } finally {
          l++, e.onProgress?.(l, e.total);
        }
      }
    };
    try {
      await Promise.all(Array.from({ length: i }, () => g()));
    } finally {
      o?.removeEventListener("abort", _), await h?.return?.();
    }
    if (o?.aborted) throw bf(o);
    if (u) throw d;
  }
  function xf() {
    let t = [], e = null, r = !1, n = null, s = () => {
      let o = e;
      e = null, o?.();
    };
    return { push(o) {
      t.push(o), s();
    }, close() {
      r = !0, s();
    }, fail(o) {
      n = { error: o }, r = !0, s();
    }, async *drain() {
      for (; ; ) {
        for (; t.length > 0; )
          yield t.shift();
        if (n) throw n.error;
        if (r) return;
        await new Promise((o) => {
          e = o;
        });
      }
    } };
  }
  function Aa(t, e) {
    return typeof t == "number" && t > 0 ? Math.floor(t) : (e ?? []).some((n) => {
      let s = (typeof n == "string" ? n : n.name).toLowerCase();
      return s !== "cpu" && s !== "wasm";
    }) ? 1 : my;
  }
  var my, vf = b(() => {
    my = 4;
  });

  // node_modules/ppu-paddle-ocr/core/detection/crop-boxes.js
  async function Ef(t, e, r, n) {
    let s = t.canvas.getToolkit(), o = [];
    for (let [i, a] of r.entries()) {
      let l = s.crop({ bbox: { x0: a.x, y0: a.y, x1: a.x + a.width, y1: a.y + a.height }, canvas: e });
      if (n.saveCropsTo && t.saveImage) {
        let c = `crop_${String(i).padStart(3, "0")}.png`;
        await t.saveImage(l, [n.saveCropsTo, c].join(t.pathSeparator));
      }
      n.crop && o.push(await _y(l));
    }
    return o;
  }
  async function _y(t) {
    let e = t;
    if (typeof e.toBuffer == "function") {
      let r = e.toBuffer("image/png");
      return r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    if (typeof e.convertToBlob == "function")
      return (await e.convertToBlob({ type: "image/png" })).arrayBuffer();
    if (typeof e.toBlob == "function") {
      let r = e.toBlob.bind(e);
      return (await new Promise((s, o) => r((i) => i ? s(i) : o(new Error("Canvas toBlob() returned null")), "image/png"))).arrayBuffer();
    }
    throw new Error("Canvas cannot be encoded to a PNG buffer on this platform");
  }
  var kf = b(() => {
  });

  // node_modules/ppu-paddle-ocr/core/recognition/custom-dictionary.js
  async function Af(t, e) {
    let r = typeof e == "string" ? await t.loadResource(e, e) : e, n = bn(new TextDecoder("utf-8").decode(r));
    if (n.length === 0)
      throw new Error("Custom character dictionary is empty or could not be loaded.");
    return n;
  }
  var Tf = b(() => {
    ms();
  });

  // node_modules/ppu-paddle-ocr/core/recognition/line-grouping.js
  function Cf(t) {
    if (t.length === 0)
      return { text: "", results: [], confidence: 0 };
    let e = t.map((n) => n.text).join(" "), r = t.reduce((n, s) => n + s.confidence, 0) / t.length;
    return { text: e, results: t, confidence: r };
  }
  function If(t) {
    if (t.length === 0)
      return { text: "", lines: [], confidence: 0 };
    let e = [], r = [], n = t[0];
    if (!n) return { text: "", lines: [], confidence: 0 };
    let s = n.box.y, o = n.box.height;
    for (let c of t) {
      let { box: u } = c;
      Math.abs(u.y - s) < o / 2 ? (r.push(c), o = (o * (r.length - 1) + u.height) / r.length) : (r.sort((d, f) => d.box.x - f.box.x), e.push(r), r = [c], s = u.y, o = u.height);
    }
    r.length > 0 && (r.sort((c, u) => c.box.x - u.box.x), e.push(r));
    let i = e.map((c) => c.map((u) => u.text).join(" ")).join(`
`), a = e.reduce((c, u) => c + u.reduce((d, f) => d + f.confidence, 0), 0), l = e.reduce((c, u) => c + u.length, 0);
    return { text: i, lines: e, confidence: l > 0 ? a / l : 0 };
  }
  function Ta(t) {
    if (t.length === 0) return [];
    let e = [...t].sort((a, l) => a.box.y - l.box.y || a.box.x - l.box.x), r = [], n = e[0];
    if (!n) return [];
    let s = [n], o = n.box.height, i = n.box.height;
    for (let a = 1; a < e.length; a++) {
      let l = e[a], c = e[a - 1];
      if (!l || !c) continue;
      let u = Math.abs(l.box.y - c.box.y), d = i * 0.5;
      u <= d ? (s.push(l), o += l.box.height, i = o / s.length) : (s.sort((f, h) => f.box.x - h.box.x), r.push(s), s = [l], o = l.box.height, i = l.box.height);
    }
    return s.length > 0 && (s.sort((a, l) => a.box.x - l.box.x), r.push(s)), r;
  }
  function Sa(t, e, r, n) {
    let s = Math.min(...e.map((w) => w.box.x)), o = Math.min(...e.map((w) => w.box.y)), i = Math.max(...e.map((w) => w.box.x + w.box.width)), a = Math.max(...e.map((w) => w.box.y + w.box.height)), l = { x: s, y: o, width: i - s, height: a - o }, c = a - o, u = Math.max(1, Math.round(c * 0.4)), d = e.map(({ box: w }) => Math.max(1, Math.round(w.width * Math.min(c / w.height, gy)))), f = d.reduce((w, y) => w + y, 0) + u * (e.length - 1);
    if (f > Sf) {
      let w = Sf / f;
      d = d.map((y) => Math.max(1, Math.round(y * w))), u = Math.max(1, Math.floor(u * w));
    }
    let h = d.reduce((w, y) => w + y, 0) + u * (e.length - 1), p = r(h, c), m = p.getContext("2d");
    m.fillStyle = "white", m.fillRect(0, 0, h, c);
    let _ = 0, g = [];
    for (let w = 0; w < e.length; w++) {
      let y = e[w], v = d[w];
      if (!y || v === void 0) continue;
      let { box: k } = y, C = n.getToolkit().crop({ bbox: { x0: k.x, y0: k.y, x1: k.x + k.width, y1: k.y + k.height }, canvas: t });
      m.drawImage(C, 0, 0, k.width, k.height, _, 0, v, c);
      let x = w < e.length - 1 ? u : 0;
      g.push(v + x), _ += v + x;
    }
    return { mergedCanvas: p, mergedBox: l, cropWidths: g };
  }
  function Ca(t, e, r) {
    let n = [...t];
    if (e.length !== n.length || r.length === 0)
      return yy(t, r);
    let s = r.reduce((l, c) => l + c, 0), o = r.map(() => ""), i = 0, a = (r[0] ?? 0) / s;
    for (let l = 0; l < n.length; l++) {
      let c = e[l] ?? 0;
      for (; c >= a && i < r.length - 1; )
        i++, a += (r[i] ?? 0) / s;
      o[i] += n[l] ?? "";
    }
    return o;
  }
  function yy(t, e) {
    if (e.length === 1)
      return [t];
    let r = e.reduce((a, l) => a + l, 0), n = [...t], s = n.length > 0 ? r / n.length : 0, o = [], i = 0;
    for (let a = 0; a < e.length; a++) {
      if (a === e.length - 1) {
        o.push(n.slice(i).join(""));
        break;
      }
      let l = Math.min(i + Math.round((e[a] ?? 0) / s), n.length), c = l, u = !1;
      for (let d = 0; d <= wy && !u; d++)
        for (let f of [l - d, l + d]) {
          let h = n[f];
          if (f > i && f < n.length && h !== void 0 && /\s/.test(h)) {
            c = f, u = !0;
            break;
          }
        }
      o.push(n.slice(i, c).join("")), i = u ? c + 1 : c;
    }
    return o;
  }
  function Mf(t, e, r, n) {
    let s = [...t].sort((a, l) => e(l) - e(a)), o = [], i = [];
    for (let a of s) {
      let l = !1;
      for (let c = 0; c < o.length; c++) {
        let u = o[c], d = i[c];
        if (u === void 0 || d === void 0) continue;
        let f = n * u.length;
        if (d + f + e(a) <= r) {
          u.push(a), i[c] = d + e(a), l = !0;
          break;
        }
      }
      l || (o.push([a]), i.push(e(a)));
    }
    return o;
  }
  var gy, Sf, wy, Ia = b(() => {
    gy = 4, Sf = 16384;
    wy = 4;
  });

  // node_modules/ppu-paddle-ocr/core/image-cache.js
  function vn(t) {
    if (!t) return "none";
    let e = Of.get(t);
    return e === void 0 && (e = xy++, Of.set(t, e)), String(e);
  }
  function Oa(t) {
    return !!(t?.noCache || t?.dictionary || t?.strategy !== void 0 || t?.minimumConfidence !== void 0 || t?.spaceRecovery !== void 0 || t?.rotateVerticalCrops !== void 0 || t?.recBatchSize !== void 0);
  }
  var xn, by, Of, xy, Ma, Pf = b(() => {
    xn = class {
      cache = /* @__PURE__ */ new Map();
      maxSize;
      constructor(e = 10) {
        this.maxSize = e;
      }
      get(e) {
        let r = this.cache.get(e);
        if (r !== void 0)
          return this.cache.delete(e), this.cache.set(e, r), r;
      }
      set(e, r) {
        if (this.cache.has(e))
          this.cache.delete(e);
        else if (this.cache.size >= this.maxSize) {
          let n = this.cache.keys().next().value;
          n !== void 0 && this.cache.delete(n);
        }
        this.cache.set(e, r);
      }
      clear() {
        this.cache.clear();
      }
      static generateKey(e) {
        let r = new Uint8Array(e);
        if (r.length === 0) return "0_0";
        let n = Math.min(r.length, by), s = r.length - 1, o = 0;
        for (let i = 0; i < n; i++) {
          let a = n === 1 ? 0 : Math.round(i * s / (n - 1));
          o = (o << 5) - o + (r[a] ?? 0), o = o & o;
        }
        return `${o}_${r.length}`;
      }
    }, by = 4096, Of = /* @__PURE__ */ new WeakMap(), xy = 1;
    Ma = new xn();
  });

  // node_modules/ppu-paddle-ocr/core/image-source.js
  async function Lf(t, e) {
    if (!e.startsWith("http") && !e.startsWith("/"))
      throw new Error(vy);
    return t.loadResource(e, e);
  }
  async function Rf(t, e) {
    if (typeof e == "string") return Lf(t, e);
    if (e instanceof ArrayBuffer) return e;
    if (typeof e.toBuffer == "function") {
      let a = e.toBuffer("image/png");
      return a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength);
    }
    let r = e, o = r.getContext("2d", { willReadFrequently: !0 }).getImageData(0, 0, r.width, r.height).data;
    return o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength);
  }
  async function Pa(t, e) {
    return typeof e == "string" ? t.canvas.prepareCanvas(await Lf(t, e)) : e instanceof ArrayBuffer ? t.canvas.prepareCanvas(e) : e;
  }
  var vy, $f = b(() => {
    vy = "Invalid image string format. Must be an HTTP URL, an absolute path, ArrayBuffer, or Canvas";
  });

  // node_modules/ppu-paddle-ocr/core/unwarping/grid.js
  function zf(t, e) {
    let [r, n, s, o] = e;
    if (e.length !== 4 || r !== 1 || n !== 2 || s === void 0 || o === void 0 || s < 2 || o < 2)
      throw new Error(`Unwarping model returned shape [${e.join(", ")}], expected [1, 2, rows, columns]. The model must output the deformation grid, not a corrected image.`);
    let i = s * o, a = new Float32Array(i), l = new Float32Array(i);
    for (let c = 0; c < i; c++)
      a[c] = (t[c] + 1) / 2, l[c] = (t[i + c] + 1) / 2;
    return { columns: o, rows: s, x: a, y: l };
  }
  function La(t, e, r) {
    let { columns: n, rows: s, x: o, y: i } = t, a = e * (n - 1), l = r * (s - 1), c = Math.min(n - 2, Math.max(0, Math.floor(a))), u = Math.min(s - 2, Math.max(0, Math.floor(l))), d = a - c, f = l - u, h = u * n + c, p = h + n, m = (_) => (_[h] * (1 - d) + _[h + 1] * d) * (1 - f) + (_[p] * (1 - d) + _[p + 1] * d) * f;
    return { x: m(o), y: m(i) };
  }
  function Ra(t, e) {
    let { columns: r, rows: n, x: s, y: o } = t, i = e.width - 1, a = e.height - 1, l = new Float64Array(n);
    for (let u = 0; u < n; u++) {
      let d = 0;
      for (let f = 1; f < r; f++) {
        let h = u * r + f;
        d += Math.hypot((s[h] - s[h - 1]) * i, (o[h] - o[h - 1]) * a);
      }
      l[u] = d;
    }
    let c = new Float64Array(r);
    for (let u = 0; u < r; u++) {
      let d = 0;
      for (let f = 1; f < n; f++) {
        let h = f * r + u;
        d += Math.hypot((s[h] - s[h - r]) * i, (o[h] - o[h - r]) * a);
      }
      c[u] = d;
    }
    return { width: Math.max(1, Math.round(Df(l)) + 1), height: Math.max(1, Math.round(Df(c)) + 1) };
  }
  function $a(t) {
    return ky(t) ? "folded" : Ay(t) > Ey ? "out-of-frame" : null;
  }
  function Na(t, e) {
    let { columns: r, rows: n, x: s, y: o } = t, i = e.width - 1, a = e.height - 1, l = 0, c = 0;
    for (let u = 0; u < n; u++)
      for (let d = 0; d < r; d++) {
        let f = u * r + d;
        if (d > 0) {
          let h = Math.atan2((o[f] - o[f - 1]) * a, (s[f] - s[f - 1]) * i);
          l += h * h, c++;
        }
        if (u > 0) {
          let h = Math.atan2((s[f] - s[f - r]) * i, (o[f] - o[f - r]) * a);
          l += h * h, c++;
        }
      }
    return Math.sqrt(l / c) * 180 / Math.PI;
  }
  function Bf(t, e) {
    let r = e.x.length, n = new Float32Array(r), s = new Float32Array(r);
    for (let o = 0; o < r; o++) {
      let i = La(t, e.x[o], e.y[o]);
      n[o] = i.x, s[o] = i.y;
    }
    return { columns: e.columns, rows: e.rows, x: n, y: s };
  }
  function ky(t) {
    let { columns: e, rows: r, x: n, y: s } = t, o = (i, a, l) => (n[a] - n[i]) * (s[l] - s[i]) - (s[a] - s[i]) * (n[l] - n[i]);
    for (let i = 0; i < r - 1; i++)
      for (let a = 0; a < e - 1; a++) {
        let l = i * e + a, c = l + 1, u = l + e, d = u + 1;
        if (o(l, c, u) <= 0 || o(d, u, c) <= 0)
          return !0;
      }
    return !1;
  }
  function Ay(t) {
    let { x: e, y: r } = t, n = -Nf, s = 1 + Nf, o = 0;
    for (let i = 0; i < e.length; i++)
      (e[i] < n || e[i] > s || r[i] < n || r[i] > s) && o++;
    return o / e.length;
  }
  function Df(t) {
    let e = Float64Array.from(t).sort(), r = e.length >> 1;
    return e.length % 2 === 1 ? e[r] : (e[r - 1] + e[r]) / 2;
  }
  var Ey, Nf, Uf = b(() => {
    Ey = 0.2, Nf = 0.02;
  });

  // node_modules/ppu-paddle-ocr/core/unwarping/image-tensor.js
  function Da(t, e, r) {
    let n = tr * rr, s = new Float32Array(Ty * n), o = tr > 1 ? (e - 1) / (tr - 1) : 0, i = rr > 1 ? (r - 1) / (rr - 1) : 0, a = e - 1, l = r - 1, c = n, u = n * 2, d = 1 / 255;
    for (let f = 0, h = 0; f < rr; f++) {
      let p = f * i, m = Math.min(l, Math.floor(p)), _ = Math.min(l, m + 1), g = p - m, w = m * e * 4, y = _ * e * 4;
      for (let v = 0; v < tr; v++, h++) {
        let k = v * o, C = Math.min(a, Math.floor(k)), x = Math.min(a, C + 1), E = k - C, O = (1 - E) * (1 - g) * d, D = E * (1 - g) * d, z = (1 - E) * g * d, B = E * g * d, P = w + C * 4, I = w + x * 4, S = y + C * 4, F = y + x * 4;
        s[h] = t[P + 2] * O + t[I + 2] * D + t[S + 2] * z + t[F + 2] * B, s[c + h] = t[P + 1] * O + t[I + 1] * D + t[S + 1] * z + t[F + 1] * B, s[u + h] = t[P] * O + t[I] * D + t[S] * z + t[F] * B;
      }
    }
    return s;
  }
  var tr, rr, Ty, Ff = b(() => {
    tr = 488, rr = 712, Ty = 3;
  });

  // node_modules/ppu-paddle-ocr/core/unwarping/remap.js
  function jf(t, e, r) {
    let n = e.width - 1, s = e.height - 1, o = [], i = [], a = [];
    for (let c = 0; c < r.x.length; c++) {
      let u = Math.round(r.x[c] * n), d = Math.round(r.y[c] * s);
      if (u < 0 || d < 0 || u > n || d > s) continue;
      let f = (d * e.width + u) * 4;
      o.push(t[f]), i.push(t[f + 1]), a.push(t[f + 2]);
    }
    if (o.length === 0) return [255, 255, 255];
    let l = (c) => c.sort((u, d) => u - d)[c.length >> 1];
    return [l(o), l(i), l(a)];
  }
  function za(t, e, r, n, s) {
    let { columns: o, rows: i, x: a, y: l } = r, { width: c, height: u } = e, { width: d, height: f } = n, h = new Uint8ClampedArray(d * f * 4), p = new Uint32Array(h.buffer);
    h[0] = s[0], h[1] = s[1], h[2] = s[2], h[3] = 255;
    let m = p[0], _ = c - 1, g = u - 1, w = c * 4, y = new Float64Array(o), v = new Float64Array(o), k = new Int32Array(o), C = d > 1 ? (o - 1) / (d - 1) : 0;
    for (let E = 1; E < o; E++)
      k[E] = E === o - 1 || C === 0 ? d : Math.min(d, Math.ceil(E / C - 1e-9));
    let x = f > 1 ? (i - 1) / (f - 1) : 0;
    for (let E = 0; E < f; E++) {
      let O = E * x, D = Math.min(i - 2, Math.floor(O)), z = O - D, B = D * o, P = B + o;
      for (let S = 0; S < o; S++)
        y[S] = (a[B + S] * (1 - z) + a[P + S] * z) * _, v[S] = (l[B + S] * (1 - z) + l[P + S] * z) * g;
      let I = E * d;
      for (let S = 0; S < o - 1; S++) {
        let F = k[S], $ = k[S + 1];
        if (F >= $) continue;
        let Z = (y[S + 1] - y[S]) * C, K = (v[S + 1] - v[S]) * C, A = F * C - S, M = y[S] + (y[S + 1] - y[S]) * A, L = v[S] + (v[S + 1] - v[S]) * A;
        for (let G = F; G < $; G++, M += Z, L += K) {
          if (M < 0 || L < 0 || M > _ || L > g) {
            p[I + G] = m;
            continue;
          }
          let _e = M | 0, Ce = L | 0, qe = M - _e, xe = L - Ce, he = Ce * w + _e * 4, He = _e < _ ? he + 4 : he, tt = Ce < g ? he + w : he, ge = _e < _ ? tt + 4 : tt, de = (1 - qe) * (1 - xe), Ne = qe * (1 - xe), cn = (1 - qe) * xe, un = qe * xe, es = (I + G) * 4;
          h[es] = t[he] * de + t[He] * Ne + t[tt] * cn + t[ge] * un, h[es + 1] = t[he + 1] * de + t[He + 1] * Ne + t[tt + 1] * cn + t[ge + 1] * un, h[es + 2] = t[he + 2] * de + t[He + 2] * Ne + t[tt + 2] * cn + t[ge + 2] * un, h[es + 3] = 255;
        }
      }
    }
    return h;
  }
  var Wf = b(() => {
  });

  // node_modules/ppu-paddle-ocr/core/unwarping/unwarping.service.js
  var Ua, ws, Sy, Cy, gs, Ba, Iy, Vf = b(() => {
    er();
    _s();
    Uf();
    Ff();
    Wf();
    Ua = class {
      grid;
      page;
      source;
      constructor(e, r, n) {
        this.grid = e, this.page = r, this.source = n;
      }
      pointToSource(e, r) {
        let n = this.page.width > 1 ? e / (this.page.width - 1) : 0, s = this.page.height > 1 ? r / (this.page.height - 1) : 0, o = La(this.grid, n, s);
        return { x: o.x * (this.source.width - 1), y: o.y * (this.source.height - 1) };
      }
      itemsToSource(e) {
        return e.map((r) => ({ ...r, box: this.boxToSource(r.box) }));
      }
      boxToSource(e) {
        let r = Number.POSITIVE_INFINITY, n = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY, o = Number.NEGATIVE_INFINITY;
        for (let [l, c] of Iy) {
          let u = this.pointToSource(e.x + e.width * l, e.y + e.height * c);
          u.x < r && (r = u.x), u.x > s && (s = u.x), u.y < n && (n = u.y), u.y > o && (o = u.y);
        }
        let i = Math.max(0, Math.floor(r + gs)), a = Math.max(0, Math.floor(n + gs));
        return { x: i, y: a, width: Math.max(0, Math.min(this.source.width, Math.ceil(s - gs)) - i), height: Math.max(0, Math.min(this.source.height, Math.ceil(o - gs)) - a) };
      }
    }, ws = class {
      platform;
      session;
      debugging;
      constructor(e, r, n = {}) {
        this.platform = e, this.session = r, this.debugging = { ...kt, ...n };
      }
      log(e) {
        this.debugging.verbose && console.log(`[UnwarpingService] ${e}`);
      }
      async run(e, r) {
        let n = { width: e.width, height: e.height }, s = this.buildWorkCanvas(e, r), o = { width: s.width, height: s.height }, i = s.getContext("2d").getImageData(0, 0, s.width, s.height).data, a = await this.predictGrid(Da(i, o.width, o.height)), l = $a(a);
        if (l) return this.skipped(e, l);
        let c = Na(a, o);
        if (c < Sy) return this.skipped(e, "flat");
        let u = jf(i, o, a), d = za(i, o, a, Ba, u), f = await this.predictGrid(Da(d, Ba.width, Ba.height)), h = Na(f, Ra(a, o));
        if (this.log(`Distortion ${c.toFixed(2)} deg, ${h.toFixed(2)} deg after one step`), h > Cy * c) return this.skipped(e, "no-gain");
        let p = Bf(a, f), m = $a(p) === null ? p : a, _ = Ra(m, o), g = za(i, o, m, _, u), w = this.platform.createCanvas(_.width, _.height), y = w.getContext("2d"), v = y.createImageData(_.width, _.height);
        if (v.data.set(g), y.putImageData(v, 0, 0), this.log(`Unwarped ${n.width}x${n.height} photo to ${_.width}x${_.height} page`), this.debugging.debug && this.debugging.debugFolder)
          try {
            await this.platform.saveDebugImage(w, "unwarped-debug", this.debugging.debugFolder);
          } catch (k) {
            this.log(`Debug dump failed: ${k instanceof Error ? k.message : String(k)}`);
          }
        return { status: "unwarped", canvas: w, mapping: new Ua(m, _, n) };
      }
      skipped(e, r) {
        return this.log(`Skipped: ${r}`), { status: "skipped", reason: r, canvas: e };
      }
      buildWorkCanvas(e, r) {
        if (r === void 0) return e;
        let { width: n, height: s, ratio: o } = Or(e.width, e.height, r);
        if (o === 1) return e;
        let i = this.platform.createCanvas(n, s);
        return i.getContext("2d").drawImage(e, 0, 0, e.width, e.height, 0, 0, n, s), i;
      }
      async predictGrid(e) {
        let r = this.session.inputNames[0], n = this.session.outputNames[0];
        if (r === void 0 || n === void 0)
          throw new Error("Unwarping model declares no input or no output.");
        let s = new this.platform.ort.Tensor("float32", e, [1, 3, rr, tr]);
        try {
          let i = (await this.session.run({ [r]: s }))[n];
          if (!i || !(i.data instanceof Float32Array))
            throw new Error(`Unwarping model output "${n}" is missing or not float32.`);
          let a = zf(i.data, i.dims);
          return i.dispose(), a;
        } finally {
          s.dispose();
        }
      }
    }, Sy = 1, Cy = 0.95, gs = 1e-3, Ba = { width: tr, height: rr }, Iy = [[0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [0, 0.5]];
  });

  // node_modules/ppu-paddle-ocr/core/base-paddle-ocr.service.js
  var ys, Gf = b(() => {
    er();
    gn();
    ms();
    Ea();
    vf();
    kf();
    Tf();
    Ia();
    Pf();
    $f();
    Vf();
    ys = class {
      options = Mr;
      detectionSession = null;
      recognitionSession = null;
      detector = null;
      recognitor = null;
      unwarpingSession = null;
      unwarper = null;
      platform;
      constructor(e, r) {
        this.platform = e, this.options = ps({}, Mr, r), this.options.session = this.options.session || Mr.session;
      }
      log(e) {
        this.options.debugging?.verbose && console.log(`[PaddleOcrService:Base] ${e}`);
      }
      isInitialized() {
        return this.detectionSession !== null && this.recognitionSession !== null && (!this.options.unwarping?.enabled || this.unwarpingSession !== null);
      }
      async destroy() {
        await this.detectionSession?.release(), await this.recognitionSession?.release(), await this.unwarpingSession?.release(), this.detectionSession = null, this.recognitionSession = null, this.unwarpingSession = null, this.detector = null, this.recognitor = null, this.unwarper = null;
      }
      async initializeUnwarping(e, r) {
        if (!this.options.unwarping?.enabled) return;
        let n = await e(this.options.model?.unwarping, fs);
        this.unwarpingSession = await r(new Uint8Array(n)), this.unwarper = new ws(this.platform, this.unwarpingSession, this.options.debugging), this.log(`Unwarping ONNX model loaded successfully
	input: ${this.unwarpingSession.inputNames}
	output: ${this.unwarpingSession.outputNames}`);
      }
      async unwarp(e) {
        return this.requireUnwarper().run(await Pa(this.platform, e));
      }
      requireUnwarper() {
        if (!this.unwarper)
          throw new Error("Unwarping is not available on this service. Construct it with `unwarping: { enabled: true }` and call initialize().");
        return this.unwarper;
      }
      async runUnwarping(e, r) {
        return this.wantsUnwarping(r) ? this.requireUnwarper().run(e, this.options.recognition?.maxCropSourceSideLength) : null;
      }
      wantsUnwarping(e) {
        return e ?? this.options.unwarping?.enabled ?? !1;
      }
      cacheKeyFor(e, r) {
        return [xn.generateKey(e), vn(this.detectionSession), vn(this.recognitionSession), vn(this.options.recognition?.charactersDictionary), r ? vn(this.unwarpingSession) : "plain"].join("|");
      }
      async recognize(e, r) {
        (!this.detector || !this.recognitor) && await this.initSessions();
        try {
          let n = await Rf(this.platform, e), s = this.cacheKeyFor(n, this.wantsUnwarping(r?.unwarp));
          if (!Oa(r)) {
            let g = Ma.get(s);
            if (g)
              return this.log("Using cached OCR result"), r?.flatten ? { text: g.text, results: g.lines.flat(), confidence: g.confidence } : g;
          }
          let o = typeof e == "string" || e instanceof ArrayBuffer ? await this.platform.canvas.prepareCanvas(n) : e, i = await this.runUnwarping(o, r?.unwarp), a = i ? i.canvas : o, l = await this.detector.run(a);
          if (l.length === 0)
            return r?.flatten ? { text: "", results: [], confidence: 0 } : { text: "", lines: [], confidence: 0 };
          let c = r?.dictionary ? await Af(this.platform, r.dictionary) : this.options.recognition?.charactersDictionary, u = r?.strategy ?? this.options.recognition?.strategy ?? "per-line", d = await this.recognitor.run(a, l, c, u, r), f = i?.status === "unwarped" ? i.mapping : null, h = If(d), p = (g) => f ? f.itemsToSource(g) : g, m = { ...h, lines: h.lines.map(p) };
          if (Oa(r) || Ma.set(s, m), !r?.flatten) return m;
          let _ = Cf(d);
          return { ..._, results: p(_.results) };
        } catch (n) {
          if (this.options.debugging?.verbose) {
            let s = n instanceof Error ? n : new Error(String(n));
            console.error("recognize: error", s.message, s.stack);
          }
          throw n;
        }
      }
      async detect(e, r) {
        this.detector || await this.initSessions();
        let { crop: n, saveCropsTo: s, unwarp: o, ...i } = r ?? {}, a = Object.keys(i).length > 0 ? new Pr(this.platform, this.detectionSession, { ...this.options.detection, ...i }, this.options.debugging, this.options.processing?.engine ?? yn) : this.detector, l = await Pa(this.platform, e), c = await this.runUnwarping(l, o), u = c ? c.canvas : l, d = c?.status === "unwarped" ? c.mapping : null, f = (await a.run(u)).filter((m) => m.width > 0 && m.height > 0), h = d ? f.map((m) => d.boxToSource(m)) : f;
        if (!n && !s)
          return { boxes: h };
        let p = await Ef(this.platform, u, f, { crop: n, saveCropsTo: s });
        return n ? { boxes: h, crops: p } : { boxes: h };
      }
      async batchRecognize(e, r) {
        let n = r?.settle ?? !1, s = [];
        return await ka(e, { concurrency: Aa(r?.concurrency, this.options.session?.executionProviders), settle: n, signal: r?.signal, onProgress: r?.onProgress, total: Array.isArray(e) ? e.length : void 0 }, (o) => this.recognize(o, r), (o) => {
          s[o.index] = o;
        }), n ? s : s.map((o) => o.status === "fulfilled" ? o.value : void 0);
      }
      async *batchRecognizeStream(e, r) {
        let n = xf(), s = (async () => {
          try {
            await ka(e, { concurrency: Aa(r?.concurrency, this.options.session?.executionProviders), settle: r?.settle ?? !1, signal: r?.signal, onProgress: r?.onProgress, total: Array.isArray(e) ? e.length : void 0 }, (o) => this.recognize(o, r), (o) => n.push(o)), n.close();
          } catch (o) {
            n.fail(o);
          }
        })();
        yield* n.drain(), await s;
      }
    };
  });

  // node_modules/ppu-paddle-ocr/core/session-factory.js
  function My(t) {
    return typeof t == "string" ? t : t.name;
  }
  async function Hf(t, e, r, n, s) {
    let { onSessionFallback: o, ...i } = r ?? {};
    try {
      return await t.InferenceSession.create(e, i);
    } catch (a) {
      let c = (i.executionProviders ?? []).map(My);
      if (c.every((_) => qf.has(_)) || c.length === 0)
        throw a;
      let f = c.find((_) => qf.has(_)) ?? (c.includes("wasm") ? "wasm" : "cpu"), h = a instanceof Error ? a.message : String(a);
      n(`executionProviders=${JSON.stringify(c)} failed (${h}); falling back to ["${f}"].`);
      let p = { ...i, executionProviders: [f] };
      s?.({ ...p, onSessionFallback: o });
      let m = await t.InferenceSession.create(e, p);
      return o?.(a), m;
    }
  }
  var qf, Yf = b(() => {
    qf = /* @__PURE__ */ new Set(["cpu", "wasm"]);
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/canvas-factory.js
  function ja(t) {
    Fa = t;
  }
  function Pe() {
    if (!Fa)
      throw new Error('No canvas platform registered. Import "ppu-ocv" (Node), "ppu-ocv/web" (browser), "ppu-ocv/canvas" (Node canvas-only), "ppu-ocv/canvas-web" (browser canvas-only), or "ppu-ocv/canvas-mobile" (React Native / Skia) to auto-register.');
    return Fa;
  }
  function Xf(t) {
    return typeof t == "object" && t !== null && typeof t.getContext == "function" && typeof t.width == "number" && typeof t.height == "number";
  }
  var Fa, Lr = b(() => {
    Fa = null;
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/platform/web.js
  var bs, Wa = b(() => {
    bs = { createCanvas(t, e) {
      if (typeof OffscreenCanvas < "u")
        return new OffscreenCanvas(t, e);
      if (typeof document < "u") {
        let r = document.createElement("canvas");
        return r.width = t, r.height = e, r;
      }
      throw new Error("No canvas implementation available in this environment.");
    }, async loadImage(t) {
      let e;
      if (t instanceof ArrayBuffer)
        e = new Blob([t]);
      else if (typeof t == "string")
        e = await (await fetch(t)).blob();
      else
        throw new Error("loadImage: unsupported source type");
      let r = await createImageBitmap(e), n = bs.createCanvas(r.width, r.height);
      return n.getContext("2d").drawImage(r, 0, 0), r.close(), n;
    }, isCanvas(t) {
      return typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && t instanceof OffscreenCanvas;
    } };
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/canvas-toolkit.base.js
  var Rr, Kf = b(() => {
    Lr();
    Rr = class t {
      static _baseInstance = null;
      step = 0;
      constructor() {
      }
      static getInstance() {
        return t._baseInstance || (t._baseInstance = new t()), t._baseInstance;
      }
      crop(e) {
        let { bbox: r, canvas: n } = e, s = Pe().createCanvas(r.x1 - r.x0, r.y1 - r.y0);
        return s.getContext("2d").drawImage(n, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, 0, 0, s.width, s.height), s;
      }
      isDirty(e) {
        let { canvas: r, threshold: n = 127.5, majorColorThreshold: s = 0.97 } = e, o = 0, i = 0, a = this.crop({ bbox: { x0: r.width * 0.1, y0: r.height * 0.1, x1: r.width * 0.9, y1: r.height * 0.9 }, canvas: r }), c = a.getContext("2d").getImageData(0, 0, a.width, a.height).data;
        for (let d = 0; d < c.length; d += 4) {
          let f = c[d], h = c[d + 1], p = c[d + 2];
          f >= n && h >= n && p >= n ? o++ : i++;
        }
        return Math.max(o, i) / (i + o) < s;
      }
      drawLine(e) {
        let { ctx: r, x: n, y: s, width: o, height: i, lineWidth: a = 2, color: l = "blue" } = e;
        r.beginPath(), r.strokeStyle = l, r.lineWidth = a, r.strokeRect(n, s, o, i), r.closePath();
      }
      drawContour(e) {
        let { ctx: r, contour: n, strokeStyle: s = "red", lineWidth: o = 2 } = e, i = n.data32S;
        if (!(i.length < 4)) {
          r.strokeStyle = s, r.lineWidth = o, r.beginPath(), r.moveTo(i[0] ?? 0, i[1] ?? 0);
          for (let a = 2; a < i.length; a += 2)
            r.lineTo(i[a] ?? 0, i[a + 1] ?? 0);
          r.closePath(), r.stroke();
        }
      }
    };
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/canvas-io.js
  async function Jf(t) {
    return Xf(t) ? t : Pe().loadImage(t);
  }
  async function Zf(t) {
    if (t instanceof ArrayBuffer) return t;
    if (typeof t.toBuffer == "function") {
      let o = t.toBuffer("image/png"), i = new ArrayBuffer(o.byteLength);
      return new Uint8Array(i).set(new Uint8Array(o)), i;
    }
    let e = t.toBlob;
    if (typeof e == "function")
      return (await new Promise((i, a) => {
        e.call(t, (l) => l ? i(l) : a(new Error("toBlob returned null")), "image/png");
      })).arrayBuffer();
    if (typeof t.convertToBlob == "function")
      return (await t.convertToBlob({ type: "image/png" })).arrayBuffer();
    if (typeof t.toDataURL == "function") {
      let i = t.toDataURL("image/png").replace(/^data:image\/png;base64,/, ""), a = atob(i), l = new ArrayBuffer(a.length), c = new Uint8Array(l);
      for (let u = 0; u < a.length; u++)
        c[u] = a.charCodeAt(u);
      return l;
    }
    let n = t.getContext("2d").getImageData(0, 0, t.width, t.height), s = new ArrayBuffer(n.data.byteLength);
    return new Uint8Array(s).set(new Uint8Array(n.data.buffer, n.data.byteOffset, n.data.byteLength)), s;
  }
  var Qf = b(() => {
    Lr();
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/canvas-regions.js
  function eh(t, e, r, n = {}) {
    let { foreground: s = "light", thresh: o = 127, minArea: i = 1, maxArea: a = 1 / 0, padding: l, scale: c = 1 } = n, u = new Uint8Array(e * r), d = [], f = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]], h = (p) => {
      let m = t[p] ?? 0;
      return s === "light" ? m > o : m <= o;
    };
    for (let p = 0; p < r; p++)
      for (let m = 0; m < e; m++) {
        let _ = p * e + m;
        if (u[_] || (u[_] = 1, !h(_ * 4))) continue;
        let g = [_], w = m, y = m, v = p, k = p, C = 0;
        for (; g.length > 0; ) {
          let x = g.pop();
          if (x === void 0) break;
          C++;
          let E = x % e, O = (x - E) / e;
          E < w ? w = E : E > y && (y = E), O < v ? v = O : O > k && (k = O);
          for (let [D, z] of f) {
            let B = E + D, P = O + z;
            if (B < 0 || B >= e || P < 0 || P >= r) continue;
            let I = P * e + B;
            u[I] || (u[I] = 1, h(I * 4) && g.push(I));
          }
        }
        if (C >= i && C <= a) {
          let x = w, E = v, O = y + 1, D = k + 1;
          if (l) {
            let z = D - E, B = Math.round(z * (l.vertical ?? 0)), P = Math.round(z * (l.horizontal ?? 0));
            x = Math.max(0, x - P), E = Math.max(0, E - B), O = Math.min(e, O + P), D = Math.min(r, D + B);
          }
          c !== 1 && (x = Math.max(0, Math.round(x * c)), E = Math.max(0, Math.round(E * c)), O = Math.round(O * c), D = Math.round(D * c)), d.push({ bbox: { x0: x, y0: E, x1: O, y1: D }, area: C });
        }
      }
    return d;
  }
  var th = b(() => {
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/canvas-processor.js
  var $r, rh = b(() => {
    Lr();
    Qf();
    th();
    $r = class {
      _canvas;
      constructor(e) {
        this._canvas = e;
      }
      get width() {
        return this._canvas.width;
      }
      get height() {
        return this._canvas.height;
      }
      resize(e) {
        let { width: r, height: n } = e, s = Pe().createCanvas(r, n);
        return s.getContext("2d").drawImage(this._canvas, 0, 0, r, n), this._canvas = s, this;
      }
      grayscale() {
        let { width: e, height: r } = this._canvas, n = this._canvas.getContext("2d").getImageData(0, 0, e, r), s = n.data;
        for (let i = 0; i < s.length; i += 4) {
          let a = Math.round(0.299 * (s[i] ?? 0) + 0.587 * (s[i + 1] ?? 0) + 0.114 * (s[i + 2] ?? 0));
          s[i] = a, s[i + 1] = a, s[i + 2] = a;
        }
        let o = Pe().createCanvas(e, r);
        return o.getContext("2d").putImageData(n, 0, 0), this._canvas = o, this;
      }
      convert(e = {}) {
        let { alpha: r = 1, beta: n = 0 } = e;
        if (r === 1 && n === 0) return this;
        let { width: s, height: o } = this._canvas, i = this._canvas.getContext("2d").getImageData(0, 0, s, o), a = i.data;
        for (let c = 0; c < a.length; c += 4)
          a[c] = Math.round((a[c] ?? 0) * r + n), a[c + 1] = Math.round((a[c + 1] ?? 0) * r + n), a[c + 2] = Math.round((a[c + 2] ?? 0) * r + n);
        let l = Pe().createCanvas(s, o);
        return l.getContext("2d").putImageData(i, 0, 0), this._canvas = l, this;
      }
      invert() {
        let { width: e, height: r } = this._canvas, n = this._canvas.getContext("2d").getImageData(0, 0, e, r), s = n.data;
        for (let i = 0; i < s.length; i += 4)
          s[i] = 255 - (s[i] ?? 0), s[i + 1] = 255 - (s[i + 1] ?? 0), s[i + 2] = 255 - (s[i + 2] ?? 0);
        let o = Pe().createCanvas(e, r);
        return o.getContext("2d").putImageData(n, 0, 0), this._canvas = o, this;
      }
      threshold(e = {}) {
        let { thresh: r = 127, maxValue: n = 255 } = e, { width: s, height: o } = this._canvas, i = this._canvas.getContext("2d").getImageData(0, 0, s, o), a = i.data;
        for (let c = 0; c < a.length; c += 4) {
          let d = (a[c] === a[c + 1] && a[c + 1] === a[c + 2] ? a[c] ?? 0 : Math.round(0.299 * (a[c] ?? 0) + 0.587 * (a[c + 1] ?? 0) + 0.114 * (a[c + 2] ?? 0))) > r ? n : 0;
          a[c] = d, a[c + 1] = d, a[c + 2] = d;
        }
        let l = Pe().createCanvas(s, o);
        return l.getContext("2d").putImageData(i, 0, 0), this._canvas = l, this;
      }
      border(e = {}) {
        let { size: r = 10, color: n = "white" } = e, { width: s, height: o } = this._canvas, i = Pe().createCanvas(s + r * 2, o + r * 2), a = i.getContext("2d");
        return a.fillStyle = n, a.fillRect(0, 0, i.width, i.height), a.drawImage(this._canvas, r, r), this._canvas = i, this;
      }
      rotate(e) {
        let { angle: r, cx: n = this._canvas.width / 2, cy: s = this._canvas.height / 2 } = e;
        if (r === 0) return this;
        let { width: o, height: i } = this._canvas, a = Pe().createCanvas(o, i), l = a.getContext("2d");
        return l.save(), l.translate(n, s), l.rotate(-r * Math.PI / 180), l.drawImage(this._canvas, -n, -s), l.restore(), this._canvas = a, this;
      }
      findRegions(e = {}) {
        let { width: r, height: n } = this._canvas, s = this._canvas.getContext("2d").getImageData(0, 0, r, n).data;
        return eh(s, r, n, e);
      }
      toCanvas() {
        return this._canvas;
      }
      static async prepareCanvas(e) {
        return Jf(e);
      }
      static async prepareBuffer(e) {
        return Zf(e);
      }
    };
  });

  // node_modules/ppu-paddle-ocr/node_modules/ppu-ocv/index.canvas-web.js
  var nh = b(() => {
    Lr();
    Wa();
    Lr();
    Wa();
    Kf();
    rh();
    ja(bs);
  });

  // node_modules/ppu-paddle-ocr/web/platform.web.js
  function Oy() {
    return `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ie.versions.web ?? ie.versions.common}/dist/`;
  }
  function En() {
    return typeof globalThis.WorkerGlobalScope == "function";
  }
  function Py() {
    !(typeof window < "u" || En()) || ie.wasm.wasmPaths || (ie.wasm.wasmPaths = Oy());
  }
  async function Va() {
    if (typeof navigator > "u") return !1;
    let t = navigator;
    if (!t.gpu || typeof t.gpu.requestAdapter != "function") return !1;
    try {
      let e = await t.gpu.requestAdapter();
      return e != null;
    } catch {
      return !1;
    }
  }
  async function xs() {
    return await Va() ? ["webgpu", "wasm"] : ["wasm"];
  }
  var Lt, kn = b(() => {
    Cr();
    nh();
    Lt = class {
      pathSeparator = "/";
      ort = vt;
      createCanvas(e, r) {
        let n = Pe().createCanvas(e, r);
        return n.getContext.bind(n)("2d", { willReadFrequently: !0 }), n;
      }
      isCanvas(e) {
        return !!e && typeof e.getContext == "function";
      }
      async loadResource(e, r) {
        if (e instanceof ArrayBuffer)
          return e;
        let n = typeof e == "string" ? e : r, s = await fetch(n, { referrerPolicy: "no-referrer" });
        if (!s.ok)
          throw new Error(`Failed to fetch resource from ${n}`);
        return s.arrayBuffer();
      }
      async saveDebugImage(e, r, n) {
        return Promise.resolve();
      }
      canvas = { prepareCanvas: (e) => $r.prepareCanvas(e), createProcessor: (e) => new $r(e), getToolkit: () => Rr.getInstance() };
    };
    Py();
  });

  // node_modules/ppu-paddle-ocr/web/detection.service.web.js
  var nr, Ga = b(() => {
    Ea();
    kn();
    nr = class extends Pr {
      constructor(e, r = {}, n = {}) {
        super(new Lt(), e, r, n, "canvas-native");
      }
    };
  });

  // node_modules/ppu-paddle-ocr/core/recognition/ctc.js
  function sh(t) {
    return /\p{L}/u.test(t) ? 0 : /\p{N}/u.test(t) ? 1 : 2;
  }
  function Dy(t, e) {
    if (t.length < 4) return;
    let r = [];
    for (let i = 1; i < e.length; i++)
      r.push((e[i] ?? 0) - (e[i - 1] ?? 0));
    let n = [...r].sort((i, a) => i - a), s = n[Math.floor(n.length / 2)] ?? 0;
    if (s <= 0) return;
    let o = n.find((i) => i > 0) ?? 0;
    if (!(o <= 0))
      for (let i = t.length - 1; i >= 1; i--) {
        let a = e[i - 1] ?? 0, l = e[i] ?? 0, c = sh(t[i] ?? "") === sh(t[i - 1] ?? "") ? Ny : $y;
        l - a > s + c * o && t[i] !== " " && t[i - 1] !== " " && t[i] !== t[i - 1] && (t.splice(i, 0, " "), e.splice(i, 0, (a + l) / 2));
      }
  }
  function Uy(t, e) {
    for (let r = t.length - 1; r >= 1; r--)
      t[r] === " " && t[r - 1] === " " && (t.splice(r, 1), e.splice(r, 1));
    if (!By.test(t.join("")))
      for (let r = 0; r < t.length; r++) {
        let n = t[r]?.codePointAt(0) ?? 0;
        n >= 65281 && n <= 65374 ? t[r] = String.fromCodePoint(n - zy) : n === 12288 && (t[r] = " ");
      }
  }
  function oh(t, e, r, n, s = !1) {
    let o = n.length, i = o - 1, a = [], l = -1, c = 0, u = 0, d = [];
    for (let h = 0; h < e; h++) {
      let p = h * r, m = t[p], _ = 0;
      for (let g = 1; g < r; g++) {
        let w = t[p + g];
        w > m && (m = w, _ = g);
      }
      if (_ === Ly || _ === l) {
        l = _;
        continue;
      }
      if (_ >= 0 && _ < o) {
        s && _ !== i && (t[p + i] ?? 0) > 1e-3 && a[a.length - 1] !== " " && (a.push(" "), d.push((h + 0.5) / e));
        let g = n[_] ?? "";
        _ === i ? g !== Ry && (a.push(" "), c += m, u++, d.push((h + 0.5) / e)) : (a.push(g), c += m, u++, d.push((h + 0.5) / e));
      }
      l = _;
    }
    Dy(a, d), Uy(a, d);
    let f = u > 0 ? c / u : 0;
    return { text: a.join(""), confidence: f, positions: d };
  }
  function Fy(t) {
    let e = t.length;
    for (; e > 0 && t[e - 1] === ""; ) e--;
    return t.slice(0, e);
  }
  function ih(t, e) {
    if (t.length === e) return t;
    let r = Fy(t);
    if (r.length === e) return r;
    let n = ["", ...r[0] === "" ? r.slice(1) : r];
    return n.length === e - 1 && n.push(""), n;
  }
  function ah(t, e, r, n = !1, s = !1) {
    let o = t.data, i = t.dims, a = i[1], l = i[2] ?? r;
    if (!e)
      return { text: "", confidence: 0, positions: [] };
    let c = ih(e, l);
    return c.length !== l && n && console.warn(`Warning: Model output classes (${l}) does not match dictionary length (${e.length}).
 Consider using our model & dictionary catalogue at https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models.`), oh(o, a, l, c, s);
  }
  function lh(t, e, r, n, s = !1) {
    let o = ih(n, r);
    return oh(t, e, r, o, s);
  }
  var Ly, Ry, An, $y, Ny, zy, By, Tn = b(() => {
    Ly = 0, Ry = "<unk>", An = 8, $y = 1.5, Ny = 2.5;
    zy = 65248, By = /[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;
  });

  // node_modules/ppu-paddle-ocr/core/recognition/image-tensor.js
  async function vs(t, e, r, n) {
    let s = t.width, o = t.height;
    if (o === 0 || s === 0)
      throw new Error(`Crop dimensions are zero: ${s}x${o}`);
    let i = s / o, a = Math.max(An, Math.round(e * i));
    if (r) {
      let u = new r.ImageProcessor(t);
      try {
        u.resize({ width: a, height: e });
        let d = u.toMat();
        return d.isContinuous() && (d.channels() === 4 || d.channels() === 1) ? { imageTensor: Wy(d, a, e), tensorWidth: a, tensorHeight: e } : { imageTensor: ch(u.toCanvas(), a, e), tensorWidth: a, tensorHeight: e };
      } finally {
        u.destroy();
      }
    }
    let l = n(t).resize({ width: a, height: e });
    return { imageTensor: jy(l, a, e), tensorWidth: a, tensorHeight: e };
  }
  function jy(t, e, r) {
    let n = t.toCanvas();
    return ch(n, e, r);
  }
  function ch(t, e, r) {
    let o = t.getContext("2d").getImageData(0, 0, e, r).data, i = r * e, a = new Float32Array(3 * i), l = 1 / 127.5;
    for (let c = 0, u = 0; c < i; c++, u += 4)
      a[c] = (o[u] ?? 0) * l - 1;
    return a.copyWithin(i, 0, i), a.copyWithin(i * 2, 0, i), a;
  }
  function Wy(t, e, r) {
    let n = t.channels(), s = t.data, o = r * e, i = new Float32Array(3 * o), a = 1 / 127.5;
    for (let l = 0, c = 0; l < o; l++, c += n)
      i[l] = s[c] * a - 1;
    return i.copyWithin(o, 0, o), i.copyWithin(o * 2, 0, o), i;
  }
  var qa = b(() => {
    Tn();
  });

  // node_modules/ppu-paddle-ocr/core/recognition/batched.js
  async function Sn(t, e, r) {
    let n = e.options.imageHeight ?? 48, s = Math.max(1, e.options.recBatchSize ?? 6), o = r ?? e.options.charactersDictionary ?? [], i = e.options.spaceRecovery ?? !1, a = e.engine === "opencv" ? e.platform.imageProcessor : void 0, l = await Promise.all(t.map((d) => vs(d, n, a, e.platform.canvas.createProcessor.bind(e.platform.canvas)))), c = l.map((d, f) => f).sort((d, f) => {
      let h = l[d]?.tensorWidth ?? 0, p = l[f]?.tensorWidth ?? 0;
      return h - p;
    }), u = Array.from({ length: t.length });
    for (let d = 0; d < c.length; d += s) {
      let f = c.slice(d, d + s), h = Math.max(...f.map((g) => l[g]?.tensorWidth ?? 1)), p = n * h, m = new Float32Array(f.length * 3 * p);
      f.forEach((g, w) => {
        let y = l[g];
        if (!y) return;
        let v = w * 3 * p;
        for (let k = 0; k < 3; k++)
          for (let C = 0; C < n; C++) {
            let x = (k * n + C) * y.tensorWidth, E = v + (k * n + C) * h;
            m.set(y.imageTensor.subarray(x, x + y.tensorWidth), E);
            let O = y.imageTensor[x + y.tensorWidth - 1] ?? 0;
            m.fill(O, E + y.tensorWidth, E + h);
          }
      });
      let _;
      try {
        _ = new e.platform.ort.Tensor("float32", m, [f.length, 3, n, h]);
        let g = await e.runInference(_), [, w, y] = g.dims, v = g.data, k = (w ?? 0) * (y ?? 0);
        f.forEach((C, x) => {
          let E = (l[C]?.tensorWidth ?? h) / h, O = Math.max(1, Math.min(w ?? 0, Math.ceil((w ?? 0) * E)));
          u[C] = lh(v.subarray(x * k, x * k + O * (y ?? 0)), O, y ?? 0, o, i);
        });
      } finally {
        _?.dispose();
      }
    }
    return u;
  }
  function uh(t) {
    let r = t.inputMetadata?.[0]?.shape?.[0];
    return typeof r != "number" || r < 0;
  }
  var Ha = b(() => {
    Tn();
    qa();
  });

  // node_modules/ppu-paddle-ocr/core/recognition/strategies.js
  function ks(t, e) {
    if (!(e.options.rotateVerticalCrops ?? !0) || t.height / t.width < 1.5) return t;
    let r = e.platform.createCanvas(t.height, t.width), n = r.getContext("2d");
    return n.translate(0, t.width), n.rotate(-Math.PI / 2), n.drawImage(t, 0, 0), r;
  }
  function Cn(t, e, r) {
    return r.getToolkit().crop({ bbox: { x0: e.x, y0: e.y, x1: e.x + e.width, y1: e.y + e.height }, canvas: t });
  }
  async function Vy(t, e, r) {
    let n = e.options.imageHeight ?? 48, s = e.engine === "opencv" ? e.platform.imageProcessor : void 0, { imageTensor: o, tensorWidth: i, tensorHeight: a } = await vs(t, n, s, e.platform.canvas.createProcessor.bind(e.platform.canvas)), l;
    try {
      l = new e.platform.ort.Tensor("float32", o, [1, 3, a, i]);
      let c = await e.runInference(l), u = r ?? e.options.charactersDictionary ?? [];
      return ah(c, u, i, e.debugging.verbose);
    } finally {
      l?.dispose();
    }
  }
  function Es(t) {
    return [...t].sort((e, r) => Math.abs(e.box.y - r.box.y) < (e.box.height + r.box.height) / 4 ? e.box.x - r.box.x : e.box.y - r.box.y);
  }
  async function dh(t, e, r, n, s) {
    let o = r.debugging.debugFolder ? `${r.debugging.debugFolder}${r.platform.pathSeparator}crops` : "";
    if (r.debugging.debug && o) {
      let a = r.platform.canvas.getToolkit();
      "clearOutput" in a && typeof a.clearOutput == "function" && a.clearOutput(o);
    }
    if (!r.debugging.debug) {
      let a = e.map(({ box: u }) => ks(Cn(t, u, r.platform.canvas), r)), l = await Sn(a, r, s), c = e.map(({ box: u }, d) => ({ text: l[d]?.text ?? "", box: u, confidence: l[d]?.confidence ?? 0 }));
      return Es(c);
    }
    let i = [];
    for (let { box: a, index: l } of e) {
      let c = await n(t, a, l, e.length, o, s);
      c !== null && i.push(c);
    }
    return Es(i);
  }
  async function fh(t, e, r, n) {
    let s = Ta(e), o = [], i = [];
    for (let c of s) {
      let u = c[0];
      if (u)
        if (c.length === 1)
          i.push(ks(Cn(t, u.box, r.platform.canvas), r)), o.push({ lineBoxes: c, cropWidths: null });
        else {
          let { mergedCanvas: d, cropWidths: f } = Sa(t, c, r.platform.createCanvas.bind(r.platform), r.platform.canvas);
          i.push(d), o.push({ lineBoxes: c, cropWidths: f });
        }
    }
    let a = await Sn(i, r, n), l = [];
    return o.forEach((c, u) => {
      let d = a[u];
      if (d)
        if (c.cropWidths === null) {
          let f = c.lineBoxes[0];
          f && l.push({ text: d.text, box: f.box, confidence: d.confidence });
        } else {
          let f = Ca(d.text, d.positions, c.cropWidths);
          for (let h = 0; h < c.lineBoxes.length; h++) {
            let p = c.lineBoxes[h];
            p && l.push({ text: (f[h] ?? "").trim(), box: p.box, confidence: d.confidence });
          }
        }
    }), Es(l);
  }
  async function hh(t, e, r, n) {
    let s = Ta(e), o = r.options.imageHeight ?? 48, i = 20, a = [];
    for (let p of s)
      if (p.length === 1) {
        let m = p[0];
        if (!m) continue;
        let _ = Cn(t, m.box, r.platform.canvas);
        a.push({ canvas: _, boxes: p, cropWidths: [_.width] });
      } else {
        let { mergedCanvas: m, cropWidths: _ } = Sa(t, p, r.platform.createCanvas.bind(r.platform), r.platform.canvas);
        a.push({ canvas: m, boxes: p, cropWidths: _ });
      }
    let l = a.map(({ canvas: p, boxes: m, cropWidths: _ }, g) => {
      let w = p.width / p.height, y = Math.max(An, Math.round(o * w));
      return { canvas: p, boxes: m, cropWidths: _, resizedWidth: y, originalHeight: p.height, index: g };
    }), c = Math.max(...l.map((p) => p.resizedWidth)), u = r.options.crossLineWidthFactor ?? 1.5, d = Math.round(c * u), f = Mf(l, (p) => p.resizedWidth, d, i), h = [];
    for (let p of f) {
      let m = [...p].sort((P, I) => P.index - I.index), _ = Math.max(...m.map((P) => P.originalHeight)), g = m.map((P) => {
        if (P.originalHeight >= _) return P.resizedWidth;
        let I = _ / P.originalHeight;
        return Math.max(An, Math.round(P.resizedWidth * I));
      }), y = g.reduce((P, I) => P + I, 0) + i * (m.length - 1), v = r.platform.createCanvas(y, o), k = v.getContext("2d");
      k.fillStyle = "white", k.fillRect(0, 0, y, o);
      let C = 0;
      for (let P = 0; P < m.length; P++) {
        let I = m[P], S = g[P];
        I === void 0 || S === void 0 || (k.drawImage(I.canvas, 0, 0, I.canvas.width, I.canvas.height, C, 0, S, o), C += S, P < m.length - 1 && (C += i));
      }
      let { text: x, confidence: E, positions: O } = await Vy(v, r, n), D = [], z = [];
      for (let P = 0; P < m.length; P++) {
        let I = m[P], S = g[P];
        if (!I || S === void 0) continue;
        let F = S / I.canvas.width;
        for (let $ = 0; $ < I.boxes.length; $++) {
          let Z = I.boxes[$];
          if (!Z) continue;
          let K = (I.cropWidths[$] ?? 0) * F;
          $ === I.boxes.length - 1 && P < m.length - 1 && (K += i), D.push(K), z.push(Z);
        }
      }
      let B = Ca(x, O, D);
      for (let P = 0; P < z.length; P++) {
        let I = z[P];
        I && h.push({ text: (B[P] ?? "").trim(), box: I.box, confidence: E });
      }
    }
    return Es(h);
  }
  var ph = b(() => {
    Tn();
    Tn();
    qa();
    Ha();
    Ia();
  });

  // node_modules/ppu-paddle-ocr/core/base-recognition.service.js
  function _h(t, e) {
    return { x: Math.round(t.x * e), y: Math.round(t.y * e), width: Math.max(1, Math.round(t.width * e)), height: Math.max(1, Math.round(t.height * e)) };
  }
  var As, mh, Gy, qy, Hy, gh = b(() => {
    er();
    _s();
    Ha();
    ph();
    As = class {
      options;
      debugging;
      session;
      platform;
      engine;
      constructor(e, r, n = {}, s = {}, o = "opencv") {
        this.platform = e, this.session = r, this.options = { ...Ir, ...n }, this.debugging = { ...kt, ...s }, o === "opencv" && !this.platform.imageProcessor ? this.engine = "canvas-native" : this.engine = o;
      }
      log(e) {
        this.debugging.verbose && console.log(`[RecognitionService] ${e}`);
      }
      async run(e, r, n, s = "per-line", o) {
        this.log("Starting text recognition process");
        try {
          let i;
          this.platform.isCanvas(e) ? i = e : this.engine === "opencv" && this.platform.imageProcessor ? i = await this.platform.imageProcessor.prepareCanvas(e) : i = await this.platform.canvas.prepareCanvas(e);
          let a = this.filterValidBoxes(r);
          if (a.length === 0)
            return [];
          let { canvas: l, ratio: c } = this.buildCropCanvas(i), u = c === 1 ? a : a.map((p) => ({ ...p, box: _h(p.box, c) })), d = this.buildContext(o), f;
          switch (s) {
            case "cross-line":
              f = await hh(l, u, d, n);
              break;
            case "per-line":
              f = await fh(l, u, d, n);
              break;
            case "per-box":
            default:
              f = await dh(l, u, d, (p, m, _, g, w, y) => this.processBox(p, m, _, g, w, d, y), n);
          }
          c !== 1 && (f = f.map((p) => ({ ...p, box: _h(p.box, 1 / c) })));
          let h = o?.minimumConfidence ?? this.options.minimumConfidence ?? Ir.minimumConfidence ?? mh;
          return h > mh ? f.filter((p) => {
            let m = /[\p{L}\p{N}]/u.test(p.text) ? h : Math.min(Gy, h + Hy);
            return p.confidence >= m;
          }) : f;
        } catch (i) {
          return console.error("Error during text recognition:", i instanceof Error ? i.message : String(i)), [];
        }
      }
      buildContext(e) {
        let r = { ...this.options, ...e?.spaceRecovery !== void 0 ? { spaceRecovery: e.spaceRecovery } : {}, ...e?.rotateVerticalCrops !== void 0 ? { rotateVerticalCrops: e.rotateVerticalCrops } : {}, ...e?.recBatchSize !== void 0 ? { recBatchSize: e.recBatchSize } : {} };
        return { platform: this.platform, options: uh(this.session) ? r : { ...r, recBatchSize: qy }, debugging: this.debugging, engine: this.engine, runInference: (n) => this.runInference(n) };
      }
      filterValidBoxes(e) {
        return e.map((r, n) => ({ box: r, index: n })).filter(({ box: r, index: n }) => this.isValidBox(r, n));
      }
      buildCropCanvas(e) {
        let { width: r, height: n } = e, s = this.options.maxCropSourceSideLength ?? 2e3, { width: o, height: i, ratio: a } = Or(r, n, s);
        if (a === 1)
          return { canvas: e, ratio: 1 };
        let l = this.platform.createCanvas(o, i);
        return l.getContext("2d").drawImage(e, 0, 0, r, n, 0, 0, o, i), { canvas: l, ratio: a };
      }
      async processBox(e, r, n, s, o, i, a) {
        let l = Date.now();
        try {
          let c = ks(Cn(e, r, this.platform.canvas), i), [u] = await Sn([c], i, a), d = u?.text ?? "", f = u?.confidence ?? 0;
          if (this.debugging.debug && o) {
            await this.platform.saveDebugImage(c, `crop_${String(n).padStart(3, "0")}.png`, o);
            let h = Date.now() - l;
            this.log(`Box ${n + 1}/${s}: [x:${r.x}, y:${r.y}, w:${r.width}, h:${r.height}]
	 -> "${d}" (processed in ${h}ms)
`);
          }
          return { text: d, box: r, confidence: f };
        } catch (c) {
          let u = c instanceof Error ? c : new Error(String(c));
          return console.error(`Error processing box ${n + 1}: ${u.message}`, u.stack), null;
        }
      }
      isValidBox(e, r) {
        return e.width <= 0 || e.height <= 0 ? (console.warn(`Skipping invalid box ${r + 1}: w=${e.width}, h=${e.height}`), !1) : !0;
      }
      async runInference(e) {
        let r = this.options.mainThreadYieldMs ?? 0;
        r > 0 && await new Promise((a) => setTimeout(a, r));
        let n = { x: e }, s = await this.session.run(n), o = Object.keys(s)[0], i = o ? s[o] : void 0;
        if (!i)
          throw new Error(`Recognition output tensor '${o}' not found. Available keys: ${Object.keys(s)}`);
        return i;
      }
    }, mh = 0, Gy = 1, qy = 1, Hy = 0.3;
  });

  // node_modules/ppu-paddle-ocr/web/recognition.service.web.js
  function Yy(t, e = typeof window < "u" && !En()) {
    return e ? { mainThreadYieldMs: hf, ...t } : t;
  }
  var sr, Ya = b(() => {
    er();
    gh();
    kn();
    sr = class extends As {
      constructor(e, r = {}, n = {}) {
        super(new Lt(), e, Yy(r), n, "canvas-native");
      }
    };
  });

  // node_modules/ppu-paddle-ocr/web/paddle-ocr.service.web.js
  var Xy, or, Xa = b(() => {
    Cr();
    Gf();
    Yf();
    gn();
    ms();
    Ga();
    kn();
    Ya();
    Xy = { graphOptimizationLevel: "all" }, or = class extends ys {
      constructor(e) {
        super(new Lt(), e), (this.options.session === void 0 || Object.keys(this.options.session).length === 0) && (this.options.session = Xy);
      }
      async initSessions() {
        throw new Error("Initialization is handled proactively in PaddleOcrService. Call initialize() instead.");
      }
      async _loadResource(e, r) {
        if (e instanceof ArrayBuffer)
          return this.log("Loading resource from ArrayBuffer"), e;
        let n = typeof e == "string" ? e : r;
        return this.log(`Fetching resource from URL: ${n}`), xa(n);
      }
      async _resolveSessionExecutionProviders() {
        let e = this.options.session ?? {};
        if (e.executionProviders && e.executionProviders.length > 0) {
          this.log(`Using user-provided executionProviders: ${JSON.stringify(e.executionProviders)}`);
          return;
        }
        let r = await xs();
        this.options.session = { ...e, executionProviders: r }, this.log(`Resolved executionProviders: ${JSON.stringify(r)}`);
      }
      async _createSession(e) {
        return Hf(vt, e, this.options.session, (r) => console.warn(`[PaddleOcrService] ${r}`), (r) => this.options.session = r);
      }
      async initialize() {
        try {
          this.log("Initializing PaddleOcrService (Web)..."), await this._resolveSessionExecutionProviders();
          let [e, r, n] = await Promise.all([this._loadResource(this.options.model?.detection, Et.detection), this._loadResource(this.options.model?.recognition, Et.recognition), this._loadResource(this.options.model?.charactersDictionary, Et.charactersDictionary)]), [s, o] = await Promise.all([this._createSession(new Uint8Array(e)), this._createSession(new Uint8Array(r)), this.initializeUnwarping((a, l) => this._loadResource(a, l), (a) => this._createSession(a))]);
          this.detectionSession = s, this.recognitionSession = o, this.options.model && (this.options.model.detection = e), this.options.model && (this.options.model.recognition = r), this.log(`Detection ONNX model loaded successfully
	input: ${s.inputNames}
	output: ${s.outputNames}`), this.log(`Recognition ONNX model loaded successfully
	input: ${o.inputNames}
	output: ${o.outputNames}`);
          let i = bn(n);
          if (i.length === 0)
            throw new Error("Character dictionary is empty or could not be loaded.");
          this.options.model && (this.options.model.charactersDictionary = n), this.options.recognition && (this.options.recognition.charactersDictionary = i), this.log(`Character dictionary loaded with ${i.length} entries.`), this.detector = new nr(s, this.options.detection, this.options.debugging), this.recognitor = new sr(o, this.options.recognition, this.options.debugging), this.options.model && (this.options.model.detection = void 0), this.options.model && (this.options.model.recognition = void 0);
        } catch (e) {
          throw console.error("Failed to initialize PaddleOcrService Web:", e), e;
        }
      }
      async changeDetectionModel(e) {
        this.log("Changing detection model...");
        let r = await this._loadResource(e, Et.detection);
        await this.detectionSession?.release(), this.detectionSession = await this._createSession(new Uint8Array(r)), this.detector = new nr(this.detectionSession, this.options.detection, this.options.debugging), this.options.model && (this.options.model.detection = r), this.log("Detection model changed successfully.");
      }
      async changeRecognitionModel(e) {
        this.log("Changing recognition model...");
        let r = await this._loadResource(e, Et.recognition);
        await this.recognitionSession?.release(), this.recognitionSession = await this._createSession(new Uint8Array(r)), this.recognitor = new sr(this.recognitionSession, this.options.recognition, this.options.debugging), this.options.model && (this.options.model.recognition = r), this.log("Recognition model changed successfully.");
      }
      async changeTextDictionary(e) {
        this.log("Changing text dictionary...");
        let r = await this._loadResource(e, Et.charactersDictionary), n = bn(r);
        if (n.length === 0)
          throw new Error("Character dictionary is empty or could not be loaded.");
        this.options.model && (this.options.model.charactersDictionary = r), this.options.recognition && (this.options.recognition.charactersDictionary = n), this.log(`Character dictionary changed successfully with ${n.length} entries.`);
      }
      async recognize(e, r) {
        return super.recognize(e, r);
      }
    };
  });

  // node_modules/ppu-paddle-ocr/core/one-shot.js
  async function Ka(t, e) {
    let r = t();
    try {
      return await r.initialize(), await e(r);
    } finally {
      await r.destroy();
    }
  }
  function Ja(t) {
    if (!t)
      return { paddle: {}, perCall: {} };
    let { model: e, detection: r, recognition: n, debugging: s, session: o, processing: i, unwarping: a, ...l } = t;
    return { paddle: { model: e, detection: r, recognition: n, debugging: s, session: o, processing: i, unwarping: a }, perCall: l };
  }
  var wh = b(() => {
  });

  // node_modules/ppu-paddle-ocr/web/index.js
  var yh = {};
  br(yh, {
    DEFAULT_DEBUGGING_OPTIONS: () => kt,
    DEFAULT_DETECTION_OPTIONS: () => wn,
    DEFAULT_MODEL: () => ga,
    DEFAULT_MODEL_URLS: () => Et,
    DEFAULT_PADDLE_OPTIONS: () => Mr,
    DEFAULT_PROCESSING_ENGINE: () => yn,
    DEFAULT_PROCESSING_OPTIONS: () => wa,
    DEFAULT_RECOGNITION_OPTIONS: () => Ir,
    DEFAULT_UNWARPING_OPTIONS: () => ya,
    DICT_BASE_URL: () => ce,
    DetectionService: () => nr,
    MODEL_BASE_URL: () => V,
    MODEL_PRESETS: () => ff,
    PaddleOcrService: () => or,
    RecognitionService: () => sr,
    UNWARPING_MODEL_URL: () => fs,
    V3_JAPANESE_MOBILE_MODEL: () => ia,
    V3_MOBILE_MODEL: () => oa,
    V4_EN_MOBILE_MODEL: () => ta,
    V4_MOBILE_MODEL: () => ra,
    V4_SERVER_DOC_MODEL: () => sa,
    V4_SERVER_MODEL: () => na,
    V5_ARABIC_MOBILE_MODEL: () => aa,
    V5_CYRILLIC_MOBILE_MODEL: () => la,
    V5_DEVANAGARI_MOBILE_MODEL: () => ca,
    V5_EN_MOBILE_INT8_MODEL: () => Ji,
    V5_EN_MOBILE_MODEL: () => Ki,
    V5_EN_SERVER_MODEL: () => Zi,
    V5_ESLAV_MOBILE_MODEL: () => da,
    V5_GREEK_MOBILE_MODEL: () => ua,
    V5_KOREAN_MOBILE_MODEL: () => fa,
    V5_LATIN_MOBILE_MODEL: () => ha,
    V5_MOBILE_MODEL: () => Qi,
    V5_SERVER_MODEL: () => ea,
    V5_TAMIL_MOBILE_MODEL: () => pa,
    V5_TELUGU_MOBILE_MODEL: () => ma,
    V5_THAI_MOBILE_MODEL: () => _a,
    V6_MEDIUM_MODEL: () => Xi,
    V6_SMALL_MODEL: () => Yi,
    V6_TINY_MODEL: () => hs,
    detect: () => Jy,
    getDefaultWebExecutionProviders: () => xs,
    isWebGpuAvailable: () => Va,
    isWebWorker: () => En,
    ocr: () => Ky
  });
  function Ky(t, e) {
    let { paddle: r, perCall: n } = Ja(e);
    return Ka(() => new or(r), (s) => n.flatten ? s.recognize(t, { ...n, flatten: !0 }) : s.recognize(t, { ...n, flatten: !1 }));
  }
  function Jy(t, e) {
    let { paddle: r, perCall: n } = Ja(e);
    return Ka(() => new or(r), (s) => s.detect(t, n));
  }
  var bh = b(() => {
    gn();
    Xa();
    Ga();
    Ya();
    kn();
    er();
    wh();
    Xa();
  });

  // browser-node-stub:node:fs
  var Ae, In = b(() => {
    Ae = {};
  });

  // browser-node-stub:node:path
  var Xe, Za = b(() => {
    Xe = {};
  });

  // browser-node-stub:node:url
  var xh, vh = b(() => {
    xh = {};
  });

  // node_modules/@huggingface/transformers/src/env.js
  function Ch(t) {
    return Object.keys(t).length === 0;
  }
  var db, Zy, Qa, Nr, Ah, Ts, Qy, oA, Cs, Th, Sh, el, tl, eb, tb, rb, nb, sb, ob, ib, ab, q, rl, Ss, lb, Eh, cb, ub, Ue, kh, j, Ie = b(() => {
    In();
    Za();
    vh();
    db = {}, Zy = "4.3.2", Qa = typeof self < "u", Nr = !Ch(Ae), Ah = !Ch(Xe), Ts = Qa && "caches" in self, Qy = typeof globalThis.Deno < "u", oA = typeof globalThis.Bun < "u", Cs = Qy && Ts && !Nr, Th = typeof process < "u", Sh = Th && process?.release?.name === "node" && !Cs, el = typeof window < "u" && typeof window.document < "u", tl = Qa && ["DedicatedWorkerGlobalScope", "ServiceWorkerGlobalScope", "SharedWorkerGlobalScope"].includes(
      self.constructor?.name
    ), eb = el || tl || Cs, tb = Sh || typeof navigator < "u" && "gpu" in navigator, rb = typeof navigator < "u" && "ml" in navigator, nb = typeof crypto < "u" && typeof crypto.getRandomValues == "function", sb = // @ts-ignore - chrome may not exist in all environments
    typeof chrome < "u" && typeof chrome.runtime < "u" && typeof chrome.runtime.id == "string", ob = // @ts-ignore - ServiceWorkerGlobalScope may not exist in all environments
    typeof ServiceWorkerGlobalScope < "u" && Qa && self instanceof ServiceWorkerGlobalScope, ib = () => {
      if (typeof navigator > "u")
        return !1;
      let t = navigator.userAgent;
      if (!((navigator.vendor || "").indexOf("Apple") > -1 && !t.match(/CriOS|FxiOS|EdgiOS|OPiOS|mercury|brave/i) && !t.includes("Chrome") && !t.includes("Android")))
        return !1;
      let r = t.match(/Version\/(\d+)/);
      return r ? parseInt(r[1], 10) < 26 : !1;
    }, ab = ib(), q = Object.freeze({
      /** Whether we are running in a browser environment (and not a web worker) */
      IS_BROWSER_ENV: el,
      /** Whether we are running in a web worker environment */
      IS_WEBWORKER_ENV: tl,
      /** Whether we are running in a web-like environment (browser, web worker, or Deno web runtime) */
      IS_WEB_ENV: eb,
      /** Whether we are running in a service worker environment */
      IS_SERVICE_WORKER_ENV: ob,
      /** Whether we are running in Deno's web runtime (CDN imports, Cache API available, no filesystem) */
      IS_DENO_WEB_RUNTIME: Cs,
      /** Whether the Cache API is available */
      IS_WEB_CACHE_AVAILABLE: Ts,
      /** Whether the WebGPU API is available */
      IS_WEBGPU_AVAILABLE: tb,
      /** Whether the WebNN API is available */
      IS_WEBNN_AVAILABLE: rb,
      /** Whether we are running in a Safari browser older than version 26. */
      IS_SAFARI_BELOW_26: ab,
      /** Whether the Node.js process API is available */
      IS_PROCESS_AVAILABLE: Th,
      /** Whether we are running in a Node.js-like environment (node, deno, bun) */
      IS_NODE_ENV: Sh,
      /** Whether the filesystem API is available */
      IS_FS_AVAILABLE: Nr,
      /** Whether the path API is available */
      IS_PATH_AVAILABLE: Ah,
      /** Whether the crypto API is available */
      IS_CRYPTO_AVAILABLE: nb,
      /** Whether the Chrome runtime API is available */
      IS_CHROME_AVAILABLE: sb
    }), rl = Nr && Ah, Ss = "./";
    if (rl) {
      let t = db.url;
      t ? Ss = Xe.dirname(Xe.dirname(xh.fileURLToPath(t))) : typeof __dirname < "u" && (Ss = Xe.dirname(__dirname));
    }
    lb = rl ? Xe.join(Ss, "/.cache/") : null, Eh = "/models/", cb = rl ? Xe.join(Ss, Eh) : Eh, ub = typeof globalThis.fetch == "function" ? globalThis.fetch.bind(globalThis) : void 0, Ue = Object.freeze({
      /** All messages including debug output (value: 10) */
      DEBUG: 10,
      /** Errors, warnings, and info messages (value: 20) */
      INFO: 20,
      /** Errors and warnings (value: 30) */
      WARNING: 30,
      /** Only error messages (value: 40) */
      ERROR: 40,
      /** No logging output (value: 50) */
      NONE: 50
    }), kh = Ue.WARNING, j = {
      version: Zy,
      /////////////////// Backends settings ///////////////////
      // NOTE: These will be populated later by the backends themselves.
      backends: {
        // onnxruntime-web/onnxruntime-node
        onnx: {}
      },
      /////////////////// Logging settings ///////////////////
      get logLevel() {
        return kh;
      },
      set logLevel(t) {
        kh = t, j.backends.onnx?.setLogLevel?.(t);
      },
      /////////////////// Model settings ///////////////////
      allowRemoteModels: !0,
      remoteHost: "https://huggingface.co/",
      remotePathTemplate: "{model}/resolve/{revision}/",
      allowLocalModels: !(el || tl || Cs),
      // Default to true for non-web environments, false for web environments
      localModelPath: cb,
      useFS: Nr,
      /////////////////// Cache settings ///////////////////
      useBrowserCache: Ts,
      useFSCache: Nr,
      cacheDir: lb,
      useCustomCache: !1,
      customCache: null,
      useWasmCache: Ts || Nr,
      cacheKey: "transformers-cache",
      experimental_useCrossOriginStorage: !1,
      /////////////////// Custom fetch /////////////////////
      fetch: ub
      //////////////////////////////////////////////////////
    };
  });

  // node_modules/@huggingface/transformers/src/utils/generic.js
  var ye, ft = b(() => {
    ye = /** @type {any} */
    class {
      /**
       * Creates a new instance of the Callable class.
       */
      constructor() {
        let t = function(...e) {
          return t._call(...e);
        };
        return Object.setPrototypeOf(t, new.target.prototype);
      }
      /**
       * This method should be implemented in subclasses to provide the
       * functionality of the callable object.
       *
       * @param {any[]} args
       * @throws {Error} If the subclass does not implement the `_call` method.
       */
      _call(...t) {
        throw Error("Must implement _call method in subclass");
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/core.js
  function Rt(t, e) {
    t && t(e);
  }
  function Ih(t) {
    return Number.isInteger(t) || typeof t == "bigint";
  }
  function nl(t) {
    return t == null || t === -1;
  }
  function sl(t) {
    let e = [], r = t;
    for (; Array.isArray(r); )
      e.push(r.length), r = r[0];
    return e;
  }
  function ht(...t) {
    return Array.prototype.concat.apply([], t);
  }
  function ol(t, e) {
    return Math.abs((t + e) % (2 * e) - e);
  }
  function Le(t, e) {
    return Object.assign(
      {},
      ...e.map((r) => {
        if (t[r] !== void 0)
          return { [r]: t[r] };
      })
    );
  }
  var ir, st = b(() => {
    ft();
    ir = class extends ye {
      /**
       * @param {ProgressCallback} callback The original callback.
       * @param {FilesLoadingMap} files_loading Mutable map storing per-file progress.
       */
      constructor(e, r) {
        super(), this.callback = e, this.files_loading = r, this.loads = /* @__PURE__ */ new Map();
      }
      /**
       * @param {ProgressInfo} info
       */
      _call(e) {
        if (e.status === "progress") {
          this.files_loading[e.file] = {
            loaded: e.loaded,
            total: e.total
          };
          let r = Object.values(this.files_loading).reduce((o, i) => o + i.loaded, 0), n = Object.values(this.files_loading).reduce((o, i) => o + i.total, 0), s = n > 0 ? r / n * 100 : 0;
          this.callback({
            status: "progress_total",
            name: e.name,
            progress: s,
            loaded: r,
            total: n,
            files: structuredClone(this.files_loading)
          });
        }
        this.callback(e);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/hub/FileResponse.js
  var fb, $t, il = b(() => {
    In();
    fb = {
      txt: "text/plain",
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif"
    }, $t = class t {
      /**
       * Creates a new `FileResponse` object.
       * @param {string} filePath
       */
      constructor(e) {
        if (this.filePath = e, this.headers = new Headers(), this.exists = Ae.existsSync(e), this.exists) {
          this.status = 200, this.statusText = "OK";
          let r = Ae.statSync(e);
          this.headers.set("content-length", r.size.toString()), this.updateContentType();
          let n = Ae.createReadStream(e);
          this.body = new ReadableStream({
            start(s) {
              n.on("data", (o) => s.enqueue(o)), n.on("end", () => s.close()), n.on("error", (o) => s.error(o));
            },
            cancel() {
              n.destroy();
            }
          });
        } else
          this.status = 404, this.statusText = "Not Found", this.body = null;
      }
      /**
       * Updates the 'content-type' header property of the response based on the extension of
       * the file specified by the filePath property of the current object.
       * @returns {void}
       */
      updateContentType() {
        let e = this.filePath.toString().split(".").pop().toLowerCase();
        this.headers.set("content-type", fb[e] ?? "application/octet-stream");
      }
      /**
       * Clone the current FileResponse object.
       * @returns {FileResponse} A new FileResponse object with the same properties as the current object.
       */
      clone() {
        let e = new t(this.filePath);
        return e.exists = this.exists, e.status = this.status, e.statusText = this.statusText, e.headers = new Headers(this.headers), e;
      }
      /**
       * Reads the contents of the file specified by the filePath property and returns a Promise that
       * resolves with an ArrayBuffer containing the file's contents.
       * @returns {Promise<ArrayBuffer>} A Promise that resolves with an ArrayBuffer containing the file's contents.
       * @throws {Error} If the file cannot be read.
       */
      async arrayBuffer() {
        return (
          /** @type {ArrayBuffer} */
          (await Ae.promises.readFile(this.filePath)).buffer
        );
      }
      /**
       * Reads the contents of the file specified by the filePath property and returns a Promise that
       * resolves with a Blob containing the file's contents.
       * @returns {Promise<Blob>} A Promise that resolves with a Blob containing the file's contents.
       * @throws {Error} If the file cannot be read.
       */
      async blob() {
        let e = await Ae.promises.readFile(this.filePath);
        return new Blob([
          /** @type {any} */
          e
        ], { type: this.headers.get("content-type") });
      }
      /**
       * Reads the contents of the file specified by the filePath property and returns a Promise that
       * resolves with a string containing the file's contents.
       * @returns {Promise<string>} A Promise that resolves with a string containing the file's contents.
       * @throws {Error} If the file cannot be read.
       */
      async text() {
        return await Ae.promises.readFile(this.filePath, "utf8");
      }
      /**
       * Reads the contents of the file specified by the filePath property and returns a Promise that
       * resolves with a parsed JavaScript object containing the file's contents.
       *
       * @returns {Promise<Object>} A Promise that resolves with a parsed JavaScript object containing the file's contents.
       * @throws {Error} If the file cannot be read.
       */
      async json() {
        return JSON.parse(await this.text());
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/random.js
  function Mh(t, e) {
    let r = 0;
    for (let s = 0; s < e.length; ++s) r += e[s];
    let n = t() * r;
    for (let s = 0; s < e.length; ++s)
      if (n -= e[s], n < 0) return s;
    return e.length - 1;
  }
  var Dr, pt, Oh, Ph, Is = b(() => {
    Ie();
    Dr = class {
      constructor(e) {
        this._mt = new Uint32Array(624), this._idx = 625, this._gauss_next = null, this._random_fn = this.random.bind(this), this.seed(e);
      }
      /**
       * Seeds this instance's PRNG.
       *
       * When called with a number, initializes the state deterministically from that value.
       * When called with no arguments (or `undefined`/`null`), seeds from OS entropy
       * via `crypto.getRandomValues`, matching Python's `random.seed()` behavior.
       *
       * @param {number} [n] The seed value. Omit to seed from OS entropy.
       */
      seed(e) {
        if (e == null)
          if (q.IS_CRYPTO_AVAILABLE) {
            let a = new Uint32Array(1);
            crypto.getRandomValues(a), e = a[0];
          } else
            e = Date.now() >>> 0;
        Number.isSafeInteger(e) && (e = Math.abs(e));
        let r = this._mt, n = (a, l) => Math.imul(a, l) >>> 0, s = [];
        for (let a = e || 0; a > 0; a = Math.floor(a / 4294967296)) s.push(a & 4294967295);
        s.length || s.push(0), r[0] = 19650218;
        for (let a = 1; a < 624; ++a) r[a] = n(1812433253, r[a - 1] ^ r[a - 1] >>> 30) + a >>> 0;
        let o = 1, i = 0;
        for (let a = Math.max(624, s.length); a > 0; --a, ++o, ++i)
          o >= 624 && (r[0] = r[623], o = 1), i >= s.length && (i = 0), r[o] = (r[o] ^ n(r[o - 1] ^ r[o - 1] >>> 30, 1664525)) + s[i] + i >>> 0;
        for (let a = 623; a > 0; --a, ++o)
          o >= 624 && (r[0] = r[623], o = 1), r[o] = (r[o] ^ n(r[o - 1] ^ r[o - 1] >>> 30, 1566083941)) - o >>> 0;
        r[0] = 2147483648, this._idx = 624, this._gauss_next = null;
      }
      /**
       * Generates a random unsigned 32-bit integer.
       *
       * Performs the "twist" step when the state buffer is exhausted,
       * then applies the standard MT19937 tempering transform.
       *
       * @returns {number} A random integer in the range [0, 2^32 - 1].
       * @internal
       */
      _int32() {
        let e = this._mt;
        if (this._idx >= 624) {
          for (let n = 0; n < 624; ++n) {
            let s = e[n] & 2147483648 | e[(n + 1) % 624] & 2147483647;
            e[n] = (e[(n + 397) % 624] ^ s >>> 1 ^ (s & 1 ? 2567483615 : 0)) >>> 0;
          }
          this._idx = 0;
        }
        let r = e[this._idx++];
        return r ^= r >>> 11, r ^= r << 7 & 2636928640, r ^= r << 15 & 4022730752, r ^= r >>> 18, r >>> 0;
      }
      /**
       * Generates a random floating-point number in the half-open interval [0, 1).
       *
       * Combines two 32-bit integers (using 53 bits of precision) to produce
       * a uniformly distributed double, matching Python's `random.random()`.
       *
       * @returns {number} A random float in [0, 1).
       */
      random() {
        return ((this._int32() >>> 5) * 67108864 + (this._int32() >>> 6)) / 9007199254740992;
      }
      /**
       * Generates a random number from a Gaussian (normal) distribution.
       *
       * Uses the Box-Muller transform with a cached spare value,
       * matching Python's `random.gauss()` output for the same seed.
       *
       * @param {number} [mu=0] The mean of the distribution.
       * @param {number} [sigma=1] The standard deviation of the distribution.
       * @returns {number} A normally distributed random value.
       */
      gauss(e = 0, r = 1) {
        let n = this._gauss_next;
        if (this._gauss_next = null, n === null) {
          let s = this.random() * 2 * Math.PI, o = Math.sqrt(-2 * Math.log(1 - this.random()));
          n = Math.cos(s) * o, this._gauss_next = Math.sin(s) * o;
        }
        return e + n * r;
      }
      /**
       * Shuffles an array in-place using the Fisher-Yates algorithm.
       *
       * Uses rejection sampling via `getrandbits`-style bit masking to ensure
       * a uniform distribution, matching Python's `random.shuffle()`.
       *
       * @param {any[]} arr The array to shuffle in-place.
       */
      shuffle(e) {
        for (let r = e.length - 1; r > 0; --r) {
          let n = 32 - Math.clz32(r + 1), s = this._int32() >>> 32 - n;
          for (; s > r; ) s = this._int32() >>> 32 - n;
          let o = e[r];
          e[r] = e[s], e[s] = o;
        }
      }
      /**
       * Selects a single element from a weighted population.
       *
       * Matches Python's `random.choices(population, weights=weights, k=1)[0]`
       *
       * @param {any[]} population The array of items to choose from.
       * @param {number[]} weights An array of non-negative weights, one per population element.
       * @returns {*} A single randomly selected element from the population.
       */
      choices(e, r) {
        return e[Mh(this._random_fn, r)];
      }
    };
    pt = new Dr(), Oh = Object.freeze({
      Random: Dr,
      seed: pt.seed.bind(pt),
      random: pt.random.bind(pt),
      gauss: pt.gauss.bind(pt),
      shuffle: pt.shuffle.bind(pt),
      choices: pt.choices.bind(pt)
    }), Ph = (t) => Mh(Oh.random, t);
  });

  // node_modules/@huggingface/transformers/src/utils/cache/FileCache.js
  var hb, zr, al = b(() => {
    In();
    Za();
    il();
    Is();
    Ie();
    hb = new Dr(), zr = class {
      /**
       * Instantiate a `FileCache` object.
       * @param {string} path
       */
      constructor(e) {
        this.path = e;
      }
      /**
       * Checks whether the given request is in the cache.
       * @param {string} request
       * @returns {Promise<FileResponse | undefined>}
       */
      async match(e) {
        let r = Xe.join(this.path, e), n = new $t(r);
        if (n.exists)
          return n;
      }
      /**
       * Adds the given response to the cache.
       * @param {string} request
       * @param {Response} response
       * @param {(data: {progress: number, loaded: number, total: number}) => void} [progress_callback] Optional.
       * The function to call with progress updates
       * @returns {Promise<void>}
       */
      async put(e, r, n = void 0) {
        let s = Xe.join(this.path, e), o = q.IS_PROCESS_AVAILABLE ? process.pid : Date.now(), i = hb._int32().toString(36), a = s + `.tmp.${o}.${i}`;
        try {
          let l = r.headers.get("Content-Length"), c = parseInt(l ?? "0"), u = 0;
          await Ae.promises.mkdir(Xe.dirname(s), { recursive: !0 });
          let d = Ae.createWriteStream(a), f = r.body.getReader();
          for (; ; ) {
            let { done: h, value: p } = await f.read();
            if (h)
              break;
            await new Promise((_, g) => {
              d.write(p, (w) => {
                if (w) {
                  g(w);
                  return;
                }
                _();
              });
            }), u += p.length;
            let m = c ? u / c * 100 : 0;
            n?.({ progress: m, loaded: u, total: c });
          }
          await new Promise((h, p) => {
            d.close((m) => m ? p(m) : h());
          }), await Ae.promises.rename(a, s);
        } catch (l) {
          try {
            await Ae.promises.unlink(a);
          } catch {
          }
          throw l;
        }
      }
      /**
       * Deletes the cache entry for the given request.
       * @param {string} request
       * @returns {Promise<boolean>} A Promise that resolves to `true` if the cache entry was deleted, `false` otherwise.
       */
      async delete(e) {
        let r = Xe.join(this.path, e);
        try {
          return await Ae.promises.unlink(r), !0;
        } catch {
          return !1;
        }
      }
      // TODO add the rest?
      // addAll(requests: RequestInfo[]): Promise<void>;
      // keys(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>>;
      // match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined>;
      // matchAll(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Response>>;
    };
  });

  // node_modules/@huggingface/transformers/src/utils/hub/constants.js
  var Lh, Ms, Rh, ll = b(() => {
    Lh = {
      // 4xx errors (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses)
      400: "Bad request error occurred while trying to load file",
      401: "Unauthorized access to file",
      403: "Forbidden access to file",
      404: "Could not locate file",
      408: "Request timeout error occurred while trying to load file",
      // 5xx errors (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses)
      500: "Internal server error error occurred while trying to load file",
      502: "Bad gateway error occurred while trying to load file",
      503: "Service unavailable error occurred while trying to load file",
      504: "Gateway timeout error occurred while trying to load file"
    }, Ms = 100, Rh = /^(\b[\w\-.]+\b\/)?\b[\w\-.]{1,96}\b$/;
  });

  // node_modules/@huggingface/transformers/src/utils/logger.js
  var Q, Me = b(() => {
    Ie();
    Q = {
      /**
       * Log an error message. Only suppressed when logLevel is NONE.
       * @param  {...any} args - Arguments to log
       */
      error(...t) {
        j.logLevel <= Ue.ERROR && console.error(...t);
      },
      /**
       * Log a warning message. Shown when logLevel <= WARNING.
       * @param  {...any} args - Arguments to log
       */
      warn(...t) {
        j.logLevel <= Ue.WARNING && console.warn(...t);
      },
      /**
       * Log an info message. Shown when logLevel <= INFO.
       * @param  {...any} args - Arguments to log
       */
      info(...t) {
        j.logLevel <= Ue.INFO && console.log(...t);
      },
      /**
       * Log a debug message. Only shown when logLevel is DEBUG.
       * @param  {...any} args - Arguments to log
       */
      debug(...t) {
        j.logLevel <= Ue.DEBUG && console.log(...t);
      },
      /**
       * Log a message (alias for info). Shown when logLevel <= INFO.
       * @param  {...any} args - Arguments to log
       */
      log(...t) {
        this.info(...t);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/hub/utils.js
  function Mn(...t) {
    return t = t.map((e, r) => (r && (e = e.replace(new RegExp("^/"), "")), r !== t.length - 1 && (e = e.replace(new RegExp("/$"), "")), e)), t.join("/");
  }
  function At(t, e = null, r = null) {
    let n;
    try {
      n = new URL(t);
    } catch {
      return !1;
    }
    return !(e && !e.includes(n.protocol) || r && !r.includes(n.hostname));
  }
  function $h(t) {
    return !(!Rh.test(t) || t.includes("..") || t.includes("--") || t.endsWith(".git") || t.endsWith(".ipynb"));
  }
  function Ur(t, e = {}, ...r) {
    return JSON.stringify([
      t,
      e.revision ?? "main",
      e.cache_dir ?? null,
      e.local_files_only ?? !1,
      ...r
    ]);
  }
  function Os(t, e, r) {
    if (!r)
      return null;
    let s = `${Lh[t] ?? `Error (${t}) occurred while trying to load file`}: "${e}".`;
    throw pb.has(t) ? new Br(s, { status: t }) : Error(s);
  }
  async function Nh(t, e, r) {
    let n = t.headers.get("Content-Length"), s = n ? parseInt(n, 10) : r ?? 0;
    n === null && !r && Q.warn("Unable to determine content-length from response headers. Will expand buffer when needed.");
    let o = new Uint8Array(s), i = 0, a = t.body.getReader();
    async function l() {
      let { done: c, value: u } = await a.read();
      if (c) return;
      let d = i + u.length;
      if (d > s) {
        s = d;
        let h = new Uint8Array(s);
        h.set(o), o = h;
      }
      o.set(u, i), i = d;
      let f = i / s * 100;
      return e({ progress: f, loaded: i, total: s }), l();
    }
    return await l(), o;
  }
  function ul(t) {
    return At(t, ["blob:"]);
  }
  function On(t, { allowUnresolved: e = !1 } = {}) {
    let r;
    if (typeof location < "u" && location.href)
      r = location.href;
    else if (typeof cl < "u" && cl.url)
      r = cl.url;
    else
      return t;
    try {
      return new URL(t, r).href;
    } catch (n) {
      if (!e)
        throw n;
      return t;
    }
  }
  var cl, Br, pb, Pn = b(() => {
    ll();
    Me();
    cl = {};
    Br = class extends Error {
      /**
       * @param {string} message The error message.
       * @param {Object} [options] Additional error information.
       * @param {number|null} [options.status=null] The HTTP status code, when the failure came from a Hub response.
       */
      constructor(e, { status: r = null } = {}) {
        super(e), this.name = "ModelFileNotFoundError", this.status = r;
      }
    }, pb = /* @__PURE__ */ new Set([401, 403, 404]);
  });

  // node_modules/@huggingface/transformers/src/utils/cache/CrossOriginStorageCache.js
  var zh, mb, Dh, Ln, Bh = b(() => {
    zh = "SHA-256", mb = "experimental_transformers-hash-cache", Dh = (t) => ({ algorithm: zh, value: t }), Ln = class {
      /** @type {Promise<Cache> | null} */
      #t = null;
      /**
       * Returns (and lazily opens) the hash cache, reusing the same promise across concurrent callers.
       * @returns {Promise<Cache>}
       */
      _getHashCache = () => (this.#t ??= caches.open(mb), this.#t);
      /**
       * Returns whether the `navigator.crossOriginStorage` API is available in the current environment.
       * @returns {boolean}
       */
      static isAvailable = () => typeof navigator < "u" && "crossOriginStorage" in navigator;
      /**
       * Looks up a cached response for the given URL by resolving its SHA-256 hash and requesting
       * the corresponding file handle from cross-origin storage.
       *
       * Implements `CacheInterface.match`.
       *
       * @param {string} request The URL of the resource to look up.
       * @returns {Promise<Response|undefined>} The cached `Response`, or `undefined` if not found.
       */
      match = async (e) => {
        let r = await this._getFileHash(e);
        if (r)
          try {
            let s = await (await navigator.crossOriginStorage.requestFileHandle(Dh(r))).getFile();
            return new Response(s, {
              headers: {
                "Content-Length": String(s.size)
              }
            });
          } catch {
            return;
          }
      };
      /**
       * Stores a response in cross-origin storage, keyed by its SHA-256 hash.
       *
       * For LFS-backed URLs the hash is resolved cheaply via `_getFileHash` (which checks
       * `HASH_CACHE_NAME` first, then falls back to fetching the Git LFS pointer file)
       * without reading the response body a second time.
       *
       * For non-LFS resources the hash is unknown upfront.  In that case the body is consumed
       * in the background: the stream is read to compute the content hash, the file is written
       * into cross-origin storage, and the computed hash is persisted to `HASH_CACHE_NAME`
       * so that future `match` calls can resolve the file without a network round-trip.
       *
       * Implements `CacheInterface.put`.
       *
       * @param {string} request The URL of the resource (used as the hash-cache key).
       * @param {Response} response The response whose body will be written to the cache.
       * @returns {Promise<void>}
       */
      put = async (e, r) => {
        let n = await this._getFileHash(e);
        if (n) {
          let s = await r.blob();
          await this._storeBlobInCOS(s, n);
        } else
          this._processAndStore(e, r.body);
      };
      /**
       * Writes a blob into cross-origin storage using the given pre-computed hex hash string.
       *
       * @param {Blob} blob
       * @param {string} hashHex Hex-encoded SHA-256 hash of `blob`.
       * @returns {Promise<void>}
       */
      _storeBlobInCOS = async (e, r) => {
        let s = await (await navigator.crossOriginStorage.requestFileHandle(Dh(r), {
          create: !0,
          origins: "*"
        })).createWritable();
        await s.write(e), await s.close();
      };
      /**
       * Background task for non-LFS resources: consumes `stream`, computes the SHA-256 hash
       * of the resulting blob, stores it in cross-origin storage, and persists the computed
       * hash to `HASH_CACHE_NAME` keyed by `request` so future `match` calls can resolve the
       * file without a network round-trip.
       *
       * Called fire-and-forget from `put` — errors are swallowed so failures never surface to
       * the caller.
       *
       * @param {string} request The original resource URL.
       * @param {ReadableStream} stream The response body stream to consume.
       * @returns {Promise<void>}
       */
      _processAndStore = async (e, r) => {
        try {
          let n = [];
          for await (let i of r)
            n.push(i);
          let s = new Blob(n), o = await this._getBlobHash(s);
          await this._storeBlobInCOS(s, o);
          try {
            await (await this._getHashCache()).put(e, new Response(o));
          } catch {
          }
        } catch {
        }
      };
      /**
       * Deletes the cache entry for the given request.
       *
       * Removes the hash entry from `HASH_CACHE_NAME`. Note: cross-origin storage itself does not
       * expose a delete API, so only the local hash mapping is removed. For non-LFS URLs this
       * permanently prevents `match` from resolving the file. For LFS-backed URLs, `match` will
       * re-fetch the LFS pointer file on the next call and repopulate the hash cache automatically.
       *
       * Implements `CacheInterface.delete`.
       *
       * @param {string} request
       * @returns {Promise<boolean>} Resolves to `true` if the hash entry was deleted, `false` otherwise.
       */
      delete = async (e) => {
        try {
          return await (await this._getHashCache()).delete(e);
        } catch {
          return !1;
        }
      };
      /**
       * Resolves the SHA-256 hash for a given URL.
       *
       * Returns the cached hash immediately if one has been persisted to `HASH_CACHE_NAME`.
       * Otherwise falls back to `_getLfsFileHash` to retrieve the hash from the Hugging Face
       * LFS pointer file, persisting the result to `HASH_CACHE_NAME` for future lookups.
       *
       * Returns `null` if the hash cannot be determined (e.g. non-LFS URL with no cached entry).
       *
       * @param {string} url The resource URL to resolve a hash for.
       * @returns {Promise<string|null>} The hex-encoded SHA-256 hash, or `null` if unavailable.
       */
      _getFileHash = async (e) => {
        try {
          let r = await this._getHashCache(), n = await r.match(e);
          if (n)
            return n.text();
          let s = await this._getLfsFileHash(e);
          return s ? (await r.put(e, new Response(s)), s) : null;
        } catch {
          return null;
        }
      };
      /**
       * Attempts to retrieve the SHA-256 hash for a Hugging Face resource URL from its raw
       * Git LFS pointer file.
       *
       * Only applicable to URLs containing `/resolve/` (i.e. Hugging Face resolved file URLs).
       * The `/resolve/` segment is rewritten to `/raw/` to fetch the LFS pointer directly.
       * Returns `null` for non-LFS URLs or when the network request fails.
       *
       * @see https://huggingface.co/docs/hub/en/storage-backends#xet
       * @param {string} url The resolved Hugging Face URL of the resource.
       * @returns {Promise<string|null>} The hex-encoded SHA-256 hash, or `null` if unavailable.
       */
      _getLfsFileHash = async (e) => {
        if (!e.includes("/resolve/"))
          return null;
        let r = e.replace("/resolve/", "/raw/");
        try {
          let s = (await fetch(r).then((o) => o.text())).match(/^oid sha256:([0-9a-f]+)$/m);
          return s ? s[1] : null;
        } catch {
          return null;
        }
      };
      /**
       * Computes the SHA-256 hash of a `Blob`'s contents.
       *
       * @param {Blob} blob The blob to hash.
       * @returns {Promise<string>} The lowercase hex-encoded SHA-256 hash.
       */
      _getBlobHash = async (e) => {
        let r = await e.arrayBuffer(), n = await crypto.subtle.digest(zh, r);
        return Array.from(new Uint8Array(n)).map((o) => o.toString(16).padStart(2, "0")).join("");
      };
    };
  });

  // node_modules/@huggingface/transformers/src/utils/cache.js
  async function Fr(t = null) {
    let e = null;
    if (j.useCustomCache) {
      if (!j.customCache)
        throw Error("`env.useCustomCache=true`, but `env.customCache` is not defined.");
      if (!j.customCache.match || !j.customCache.put)
        throw new Error(
          "`env.customCache` must be an object which implements the `match` and `put` functions of the Web Cache API. For more information, see https://developer.mozilla.org/en-US/docs/Web/API/Cache"
        );
      e = j.customCache;
    }
    if (!e && j.experimental_useCrossOriginStorage && Ln.isAvailable() && (e = new Ln()), !e && j.useBrowserCache) {
      if (typeof caches > "u")
        throw Error("Browser cache is not available in this environment.");
      try {
        e = await caches.open(j.cacheKey);
      } catch (r) {
        Q.warn("An error occurred while opening the browser cache:", r);
      }
    }
    if (!e && j.useFSCache) {
      if (!q.IS_FS_AVAILABLE)
        throw Error("File System Cache is not available in this environment.");
      e = new zr(t ?? j.cacheDir);
    }
    return e;
  }
  async function Uh(t, ...e) {
    for (let r of e)
      try {
        let n = await t.match(r);
        if (n) return n;
      } catch {
        continue;
      }
  }
  var Ps = b(() => {
    Ie();
    al();
    Me();
    Bh();
  });

  // node_modules/@huggingface/transformers/src/utils/lru_cache.js
  var Ls, Fh = b(() => {
    Ls = class {
      /** @type {number} */
      #t;
      /** @type {Map<any, any>} */
      #e;
      /**
       * Creates an LRUCache instance.
       * @param {number} capacity The maximum number of items the cache can hold.
       */
      constructor(e) {
        this.#t = e, this.#e = /* @__PURE__ */ new Map();
      }
      /**
       * Retrieves the value associated with the given key and marks the key as recently used.
       * @param {any} key The key to retrieve.
       * @returns {any} The value associated with the key, or undefined if the key does not exist.
       */
      get(e) {
        if (!this.#e.has(e)) return;
        let r = this.#e.get(e);
        return this.#e.delete(e), this.#e.set(e, r), r;
      }
      /**
       * Inserts or updates the key-value pair in the cache.
       * If the key already exists, it is updated and marked as recently used.
       * If the cache exceeds its capacity, the least recently used item is evicted.
       * @param {any} key The key to add or update.
       * @param {any} value The value to associate with the key.
       */
      put(e, r) {
        this.#e.has(e) && this.#e.delete(e), this.#e.set(e, r), this.#e.size > this.#t && this.#e.delete(this.#e.keys().next().value);
      }
      /**
       * Removes the entry for the given key from the cache.
       * @param {any} key The key to delete.
       * @returns {boolean} `true` if the entry existed and was removed, `false` otherwise.
       */
      delete(e) {
        return this.#e.delete(e);
      }
      /**
       * Clears the cache.
       */
      clear() {
        this.#e.clear();
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/memoize_promise.js
  function Rs(t, e) {
    let r = dl.get(t);
    if (r !== void 0)
      return r;
    let n = e().then(
      (s) => s,
      (s) => (dl.delete(t), Promise.reject(s))
    );
    return dl.put(t, n), n;
  }
  var _b, dl, fl = b(() => {
    Fh();
    _b = 100, dl = new Ls(_b);
  });

  // node_modules/@huggingface/transformers/src/utils/model_registry/get_file_metadata.js
  async function gb(t) {
    if (!At(t, ["http:", "https:"]))
      return null;
    let e = hl(t);
    return e.set("Range", "bytes=0-0"), j.fetch(t, { method: "GET", headers: e, cache: "no-store" });
  }
  function jr(t, e, r = {}) {
    let n = Ur(t, r, e);
    return Rs(n, () => wb(t, e, r));
  }
  async function wb(t, e, r) {
    let n = await Fr(r?.cache_dir), { localPath: s, remoteURL: o, proposedCacheKey: i, validModelId: a } = pl(
      t,
      e,
      r,
      n
    ), l = await ml(n, s, i);
    if (l !== void 0 && typeof l != "string") {
      let c = l.headers.get("content-length"), u = l.headers.get("content-type");
      return {
        exists: !0,
        size: c ? parseInt(c, 10) : void 0,
        contentType: u || void 0,
        fromCache: !0
      };
    }
    if (j.allowLocalModels && !At(s, ["http:", "https:"]))
      try {
        let u = await Wr(s);
        if (typeof u != "string" && u.status !== 404) {
          let d = u.headers.get("content-length"), f = u.headers.get("content-type");
          return {
            exists: !0,
            size: d ? parseInt(d, 10) : void 0,
            contentType: f || void 0,
            fromCache: !1
          };
        }
      } catch {
      }
    if (j.allowRemoteModels && !r.local_files_only && a) {
      let c = await gb(o);
      if (c && c.status >= 200 && c.status < 300) {
        let u, d = c.headers.get("content-type");
        if (c.status === 206) {
          let f = c.headers.get("content-range");
          if (f) {
            let h = f.match(/bytes \d+-\d+\/(\d+)/);
            h && (u = parseInt(h[1], 10));
          }
        } else if (c.status === 200)
          try {
            await c.body?.cancel();
          } catch {
          }
        if (u === void 0) {
          let f = c.headers.get("content-length");
          u = f ? parseInt(f, 10) : void 0;
        }
        return {
          exists: !0,
          size: u,
          contentType: d || void 0,
          fromCache: !1
        };
      }
      c && c.status !== 404 && c.status !== 416 && Os(c.status, o, !0);
    }
    return { exists: !1, fromCache: !1 };
  }
  var $s = b(() => {
    Ie();
    Ps();
    mt();
    Pn();
    fl();
  });

  // node_modules/@huggingface/transformers/src/utils/hub.js
  async function Wr(t) {
    return j.useFS && !At(t, ["http:", "https:", "blob:"]) ? new $t(
      t instanceof URL ? t.protocol === "file:" ? t.pathname : t.toString() : t
    ) : j.fetch(t, {
      headers: hl(t)
    });
  }
  function hl(t) {
    let e = typeof process < "u" && process?.release?.name === "node", r = new Headers();
    if (e) {
      let n = !!process.env?.TESTING_REMOTELY, s = j.version;
      if (r.set("User-Agent", `transformers.js/${s}; is_ci/${n};`), At(t, ["http:", "https:"], ["huggingface.co", "hf.co"])) {
        let i = process.env?.HF_TOKEN ?? process.env?.HF_ACCESS_TOKEN;
        i && r.set("Authorization", `Bearer ${i}`);
      }
    }
    return r;
  }
  function pl(t, e, r = {}, n = null) {
    let s = r.revision ?? "main", o = Mn(t, e), i = $h(t), a = i ? Mn(j.localModelPath, o) : o, l = Mn(
      j.remoteHost,
      j.remotePathTemplate.replaceAll("{model}", t).replaceAll("{revision}", encodeURIComponent(s)),
      e
    ), c = n instanceof zr ? (
      // Choose cache key for filesystem cache
      // When using the main revision (default), we use the request URL as the cache key.
      // If a specific revision is requested, we account for this in the cache key.
      s === "main" ? o : Mn(t, s, e)
    ) : l;
    return {
      requestURL: o,
      localPath: a,
      remoteURL: l,
      proposedCacheKey: c,
      validModelId: i
    };
  }
  async function ml(t, e, r) {
    if (t)
      return await Uh(t, e, r);
  }
  async function yb(t, e, r, n, s, o, i = {}) {
    if (await r.match(n) === void 0 && !(typeof Cache < "u" && r instanceof Cache && !At(On(n, { allowUnresolved: !0 }), ["http:", "https:"])))
      if (o) {
        if (typeof s != "string") {
          let a = new Headers(s.headers);
          a.set("content-length", o.byteLength.toString()), await r.put(
            n,
            new Response(
              /** @type {any} */
              o,
              {
                headers: a
              }
            )
          ).catch((l) => {
            Q.warn(`Unable to add response to browser cache: ${l}.`);
          });
        }
      } else {
        let a = i.progress_callback ? (l) => Rt(i.progress_callback, {
          status: "progress",
          name: t,
          file: e,
          ...l
        }) : void 0;
        await r.put(
          n,
          /** @type {Response} */
          s,
          a
        );
      }
  }
  async function bb(t, e, r = !0, n = {}, s = !1, o = null) {
    let { requestURL: i, localPath: a, remoteURL: l, proposedCacheKey: c, validModelId: u } = pl(
      t,
      e,
      n,
      o
    ), d, f = !1, h;
    h = await ml(o, a, c);
    let p = h !== void 0;
    if (p)
      d = c;
    else {
      if (j.allowLocalModels)
        if (At(i, ["http:", "https:"])) {
          if (n.local_files_only)
            throw new Error(`\`local_files_only=true\`, but attempted to load a remote file from: ${i}.`);
          if (!j.allowRemoteModels)
            throw new Error(
              `\`env.allowRemoteModels=false\`, but attempted to load a remote file from: ${i}.`
            );
        } else try {
          h = await Wr(a), d = a;
        } catch (w) {
          Q.warn(`Unable to load from local path "${a}": "${w}"`);
        }
      if (h === void 0 || typeof h != "string" && h.status === 404) {
        if (n.local_files_only || !j.allowRemoteModels) {
          if (r)
            throw new Br(
              `\`local_files_only=true\` or \`env.allowRemoteModels=false\` and file was not found locally at "${a}".`
            );
          return null;
        }
        if (!u)
          throw new Br(
            `Local file missing at "${a}" and download aborted due to invalid model ID "${t}".`
          );
        if (h = await Wr(l), h.status !== 200)
          return Os(h.status, l, r);
        d = c;
      }
      f = o && // 1. A caching system is available
      typeof Response < "u" && // 2. `Response` is defined (i.e., we are in a browser-like environment)
      h instanceof Response && // 3. result is a `Response` object (i.e., not a `FileResponse`)
      h.status === 200;
    }
    Rt(n.progress_callback, {
      status: "download",
      name: t,
      file: e
    });
    let m;
    if (!(q.IS_NODE_ENV && s)) {
      let g;
      if (typeof h != "string")
        if (!n.progress_callback)
          g = new Uint8Array(await h.arrayBuffer());
        else if (p && // The item is being read from the cache
        typeof navigator < "u" && /firefox/i.test(navigator.userAgent))
          g = new Uint8Array(await h.arrayBuffer()), Rt(n.progress_callback, {
            status: "progress",
            name: t,
            file: e,
            progress: 100,
            loaded: g.length,
            total: g.length
          });
        else {
          let w, y = h.headers.get("content-length");
          if (y)
            w = parseInt(y, 10);
          else
            try {
              let v = await jr(t, e, n);
              v.size && (w = v.size);
            } catch {
            }
          g = await Nh(
            h,
            (v) => {
              Rt(n.progress_callback, {
                status: "progress",
                name: t,
                file: e,
                ...v
              });
            },
            w
          );
        }
      m = g;
    }
    if (
      // Only cache web responses
      // i.e., do not cache FileResponses (prevents duplication)
      f && d && typeof h != "string" && await yb(t, e, o, d, h, m, n), q.IS_NODE_ENV && s && n.progress_callback && typeof h != "string"
    ) {
      let g = parseInt(h.headers.get("content-length"), 10) || 0;
      Rt(n.progress_callback, {
        status: "progress",
        name: t,
        file: e,
        progress: 100,
        loaded: g,
        total: g
      });
    }
    if (Rt(n.progress_callback, {
      status: "done",
      name: t,
      file: e
    }), m) {
      if (!q.IS_NODE_ENV && s)
        throw new Error("Cannot return path in a browser environment.");
      return m;
    }
    if (h instanceof $t)
      return h.filePath;
    let _ = await o?.match(d);
    if (_ instanceof $t)
      return _.filePath;
    if (_ instanceof Response)
      return new Uint8Array(await _.arrayBuffer());
    if (typeof _ == "string")
      return _;
    throw new Error("Unable to get model file path or buffer.");
  }
  async function Rn(t, e, r = !0, n = {}, s = !1) {
    if (!j.allowLocalModels) {
      if (n.local_files_only)
        throw Error(
          "Invalid configuration detected: local models are disabled (`env.allowLocalModels=false`) but you have requested to only use local models (`local_files_only=true`)."
        );
      if (!j.allowRemoteModels)
        throw Error(
          "Invalid configuration detected: both local and remote models are disabled. Fix by setting `env.allowLocalModels` or `env.allowRemoteModels` to `true`."
        );
    }
    let o = Ur(t, n, e, r, s), { progress_callback: i } = n, a = i instanceof ir ? i.loads : _l, l = a.get(o);
    return l || (Rt(i, {
      status: "initiate",
      name: t,
      file: e
    }), l = Fr(n.cache_dir).then(
      (c) => bb(t, e, r, n, s, c)
    ), a === _l && (l = l.finally(() => _l.delete(o))), a.set(o, l)), await l;
  }
  async function gl(t, e, r = !0, n = {}) {
    let s = await Rn(t, e, r, n, !1);
    return s === null ? null : new TextDecoder("utf-8").decode(
      /** @type {Uint8Array} */
      s
    );
  }
  async function Ke(t, e, r = !0, n = {}) {
    let s = await gl(t, e, r, n);
    return s === null ? {} : JSON.parse(s);
  }
  var _l, mt = b(() => {
    Ie();
    st();
    il();
    al();
    Pn();
    Ps();
    $s();
    Me();
    ll();
    _l = /* @__PURE__ */ new Map();
  });

  // node_modules/@huggingface/transformers/src/utils/maths.js
  function jh(t, [e, r, n], [s, o], i = "bilinear", a = !1) {
    let l = o / n, c = s / r, u = new t.constructor(s * o * e), d = r * n, f = s * o;
    for (let h = 0; h < s; ++h)
      for (let p = 0; p < o; ++p) {
        let m = h * o + p, _ = (p + 0.5) / l - 0.5, g = (h + 0.5) / c - 0.5, w = Math.floor(_), y = Math.floor(g), v = Math.min(w + 1, n - 1), k = Math.min(y + 1, r - 1);
        w = Math.max(w, 0), y = Math.max(y, 0);
        let C = _ - w, x = g - y, E = (1 - C) * (1 - x), O = C * (1 - x), D = (1 - C) * x, z = C * x, B = y * n, P = k * n, I = B + w, S = B + v, F = P + w, $ = P + v;
        for (let Z = 0; Z < e; ++Z) {
          let K = Z * d;
          u[Z * f + m] = E * t[K + I] + O * t[K + S] + D * t[K + F] + z * t[K + $];
        }
      }
    return u;
  }
  function Wh(t, e, r) {
    let n = new Array(r.length), s = new Array(r.length);
    for (let a = r.length - 1, l = 1; a >= 0; --a)
      s[a] = l, n[a] = e[r[a]], l *= n[a];
    let o = r.map((a, l) => s[r.indexOf(l)]), i = new t.constructor(t.length);
    for (let a = 0; a < t.length; ++a) {
      let l = 0;
      for (let c = e.length - 1, u = a; c >= 0; --c)
        l += u % e[c] * o[c], u = Math.floor(u / e[c]);
      i[l] = t[a];
    }
    return [i, n];
  }
  function Vr(t) {
    let e = Fe(t)[0], r = t.map((o) => Math.exp(o - e)), n = r.reduce((o, i) => o + i, 0);
    return r.map((o) => o / n);
  }
  function $n(t) {
    if (t.length === 0) throw Error("Array must not be empty");
    let e = t[0], r = 0;
    for (let n = 1; n < t.length; ++n)
      t[n] < e && (e = t[n], r = n);
    return (
      /** @type {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} */
      [e, r]
    );
  }
  function Fe(t) {
    if (t.length === 0) throw Error("Array must not be empty");
    let e = t[0], r = 0;
    for (let n = 1; n < t.length; ++n)
      t[n] > e && (e = t[n], r = n);
    return (
      /** @type {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} */
      [e, r]
    );
  }
  function Nn(t, e) {
    let r = Math.pow(10, e);
    return Math.round(t * r) / r;
  }
  function Vh(t) {
    let e = Math.round(t);
    return Math.abs(t) % 1 === 0.5 ? e % 2 === 0 ? e : e - 1 : e;
  }
  var Gh, ar = b(() => {
    Gh = /* @__PURE__ */ (function() {
      let t = null;
      return function(e) {
        if (!t) {
          t = new Float32Array(65536);
          let o = new ArrayBuffer(4), i = new Uint32Array(o), a = new Float32Array(o);
          for (let l = 0; l < t.length; ++l) {
            let c = 0, u = (l & 32768) << 16, d = (l & 31744) >> 10, f = l & 1023;
            if (d === 31)
              c = u | 2139095040 | f << 13;
            else if (d === 0)
              if (f === 0)
                c = u;
              else {
                let h = 113;
                for (; (f & 1024) === 0; )
                  f <<= 1, --h;
                f &= -1025, c = u | h << 23 | f << 13;
              }
            else
              c = u | d + 112 << 23 | f << 13;
            i[0] = c, t[l] = a[0];
          }
        }
        let r = e.length, n = t, s = new Float32Array(r);
        for (let o = 0; o < r; ++o)
          s[o] = n[e[o]];
        return s;
      };
    })();
  });

  // browser-onnx-stub:onnx-node
  var qh, Hh = b(() => {
    qh = {};
  });

  // node_modules/@huggingface/transformers/src/backends/utils/cacheWasm.js
  async function Yh(t) {
    let e = t.split("/").pop(), r;
    try {
      if (r = await Fr(), r) {
        let s = await r.match(t);
        if (s)
          return s;
      }
    } catch (s) {
      Q.warn(`Failed to load ${e} from cache:`, s);
    }
    let n = await j.fetch(t);
    if (!n.ok)
      throw new Error(`Failed to fetch ${e}: ${n.status} ${n.statusText}`);
    if (r)
      try {
        await r.put(t, n.clone());
      } catch (s) {
        Q.warn(`Failed to cache ${e}:`, s);
      }
    return n;
  }
  async function Xh(t) {
    let e = await Yh(t);
    if (!e || typeof e == "string") return null;
    try {
      return await e.arrayBuffer();
    } catch (r) {
      return Q.warn("Failed to read WASM binary:", r), null;
    }
  }
  async function Kh(t) {
    if (q.IS_SERVICE_WORKER_ENV || q.IS_CHROME_AVAILABLE)
      return t;
    let e = await Yh(t);
    if (!e || typeof e == "string") return null;
    try {
      let r = await e.text();
      r = r.replaceAll("globalThis.process?.versions?.node", "false");
      let n = new Blob([r], { type: "text/javascript" });
      return URL.createObjectURL(n);
    } catch (r) {
      return Q.warn("Failed to read WASM factory:", r), null;
    }
  }
  var Jh = b(() => {
    Ie();
    Ps();
    Me();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/backend-impl.js
  var wl = b(() => {
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/backend.js
  var Zh = b(() => {
    wl();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/version.js
  var Qh, ep = b(() => {
    Qh = "1.31.0-dev.20260911-2a43ec07e";
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/env-impl.js
  var tp, yl, bl = b(() => {
    ep();
    tp = "warning", yl = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: Qh },
      set logLevel(t) {
        if (t !== void 0) {
          if (typeof t != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(t) === -1)
            throw new Error(`Unsupported logging level: ${t}`);
          tp = t;
        }
      },
      get logLevel() {
        return tp;
      }
    };
    Object.defineProperty(yl, "logLevel", { enumerable: !0 });
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/env.js
  var rp = b(() => {
    bl();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js
  var np, sp, op = b(() => {
    np = (t, e) => {
      let r = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      r.width = t.dims[3], r.height = t.dims[2];
      let n = r.getContext("2d");
      if (n != null) {
        let s, o;
        e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC" ? (s = t.dims[2], o = t.dims[3]) : (s = t.dims[3], o = t.dims[2]);
        let i = e?.format !== void 0 ? e.format : "RGB", a = e?.norm, l, c;
        a === void 0 || a.mean === void 0 ? l = [255, 255, 255, 255] : typeof a.mean == "number" ? l = [a.mean, a.mean, a.mean, a.mean] : (l = [a.mean[0], a.mean[1], a.mean[2], 0], a.mean[3] !== void 0 && (l[3] = a.mean[3])), a === void 0 || a.bias === void 0 ? c = [0, 0, 0, 0] : typeof a.bias == "number" ? c = [a.bias, a.bias, a.bias, a.bias] : (c = [a.bias[0], a.bias[1], a.bias[2], 0], a.bias[3] !== void 0 && (c[3] = a.bias[3]));
        let u = o * s, d = 0, f = u, h = u * 2, p = -1;
        i === "RGBA" ? (d = 0, f = u, h = u * 2, p = u * 3) : i === "RGB" ? (d = 0, f = u, h = u * 2) : i === "RBG" && (d = 0, h = u, f = u * 2);
        for (let m = 0; m < o; m++)
          for (let _ = 0; _ < s; _++) {
            let g = (t.data[d++] - c[0]) * l[0], w = (t.data[f++] - c[1]) * l[1], y = (t.data[h++] - c[2]) * l[2], v = p === -1 ? 255 : (t.data[p++] - c[3]) * l[3];
            n.fillStyle = "rgba(" + g + "," + w + "," + y + "," + v + ")", n.fillRect(_, m, 1, 1);
          }
        if ("toDataURL" in r)
          return r.toDataURL();
        throw new Error("toDataURL is not supported");
      } else
        throw new Error("Can not access image data");
    }, sp = (t, e) => {
      let r = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), n;
      if (r != null) {
        let s, o, i;
        e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC" ? (s = t.dims[2], o = t.dims[1], i = t.dims[3]) : (s = t.dims[3], o = t.dims[2], i = t.dims[1]);
        let a = e !== void 0 && e.format !== void 0 ? e.format : "RGB", l = e?.norm, c, u;
        l === void 0 || l.mean === void 0 ? c = [255, 255, 255, 255] : typeof l.mean == "number" ? c = [l.mean, l.mean, l.mean, l.mean] : (c = [l.mean[0], l.mean[1], l.mean[2], 255], l.mean[3] !== void 0 && (c[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? u = [0, 0, 0, 0] : typeof l.bias == "number" ? u = [l.bias, l.bias, l.bias, l.bias] : (u = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (u[3] = l.bias[3]));
        let d = o * s;
        if (e !== void 0 && (e.format !== void 0 && i === 4 && e.format !== "RGBA" || i === 3 && e.format !== "RGB" && e.format !== "BGR"))
          throw new Error("Tensor format doesn't match input tensor dims");
        let f = 4, h = 0, p = 1, m = 2, _ = 3, g = 0, w = d, y = d * 2, v = -1;
        a === "RGBA" ? (g = 0, w = d, y = d * 2, v = d * 3) : a === "RGB" ? (g = 0, w = d, y = d * 2) : a === "RBG" && (g = 0, y = d, w = d * 2), n = r.createImageData(s, o);
        for (let k = 0; k < o * s; h += f, p += f, m += f, _ += f, k++)
          n.data[h] = (t.data[g++] - u[0]) * c[0], n.data[p] = (t.data[w++] - u[1]) * c[1], n.data[m] = (t.data[y++] - u[2]) * c[2], n.data[_] = v === -1 ? 255 : (t.data[v++] - u[3]) * c[3];
      } else
        throw new Error("Can not access image data");
      return n;
    };
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js
  var xl, ip, ap, lp, cp, up, dp = b(() => {
    Ns();
    xl = (t, e) => {
      if (t === void 0)
        throw new Error("Image buffer must be defined");
      if (e.height === void 0 || e.width === void 0)
        throw new Error("Image height and width must be defined");
      if (e.tensorLayout === "NHWC")
        throw new Error("NHWC Tensor layout is not supported yet");
      let { height: r, width: n } = e, s = e.norm ?? { mean: 255, bias: 0 }, o, i;
      typeof s.mean == "number" ? o = [s.mean, s.mean, s.mean, s.mean] : o = [s.mean[0], s.mean[1], s.mean[2], s.mean[3] ?? 255], typeof s.bias == "number" ? i = [s.bias, s.bias, s.bias, s.bias] : i = [s.bias[0], s.bias[1], s.bias[2], s.bias[3] ?? 0];
      let a = e.format !== void 0 ? e.format : "RGBA", l = e.tensorFormat !== void 0 && e.tensorFormat !== void 0 ? e.tensorFormat : "RGB", c = r * n, u = l === "RGBA" ? new Float32Array(c * 4) : new Float32Array(c * 3), d = 4, f = 0, h = 1, p = 2, m = 3, _ = 0, g = c, w = c * 2, y = -1;
      a === "RGB" && (d = 3, f = 0, h = 1, p = 2, m = -1), l === "RGBA" ? y = c * 3 : l === "RBG" ? (_ = 0, w = c, g = c * 2) : l === "BGR" && (w = 0, g = c, _ = c * 2);
      for (let k = 0; k < c; k++, f += d, p += d, h += d, m += d)
        u[_++] = (t[f] + i[0]) / o[0], u[g++] = (t[h] + i[1]) / o[1], u[w++] = (t[p] + i[2]) / o[2], y !== -1 && m !== -1 && (u[y++] = (t[m] + i[3]) / o[3]);
      return l === "RGBA" ? new Te("float32", u, [1, 4, r, n]) : new Te("float32", u, [1, 3, r, n]);
    }, ip = async (t, e) => {
      let r = typeof HTMLImageElement < "u" && t instanceof HTMLImageElement, n = typeof ImageData < "u" && t instanceof ImageData, s = typeof ImageBitmap < "u" && t instanceof ImageBitmap, o = typeof t == "string", i, a = e ?? {}, l = () => {
        if (typeof document < "u")
          return document.createElement("canvas");
        if (typeof OffscreenCanvas < "u")
          return new OffscreenCanvas(1, 1);
        throw new Error("Canvas is not supported");
      }, c = (u) => typeof HTMLCanvasElement < "u" && u instanceof HTMLCanvasElement || u instanceof OffscreenCanvas ? u.getContext("2d") : null;
      if (r) {
        let u = l();
        u.width = t.width, u.height = t.height;
        let d = c(u);
        if (d != null) {
          let f = t.height, h = t.width;
          if (e !== void 0 && e.resizedHeight !== void 0 && e.resizedWidth !== void 0 && (f = e.resizedHeight, h = e.resizedWidth), e !== void 0) {
            if (a = e, e.tensorFormat !== void 0)
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            a.tensorFormat = "RGBA", a.height = f, a.width = h;
          } else
            a.tensorFormat = "RGBA", a.height = f, a.width = h;
          d.drawImage(t, 0, 0), i = d.getImageData(0, 0, h, f).data;
        } else
          throw new Error("Can not access image data");
      } else if (n) {
        let u, d;
        if (e !== void 0 && e.resizedWidth !== void 0 && e.resizedHeight !== void 0 ? (u = e.resizedHeight, d = e.resizedWidth) : (u = t.height, d = t.width), e !== void 0 && (a = e), a.format = "RGBA", a.height = u, a.width = d, e !== void 0) {
          let f = l();
          f.width = d, f.height = u;
          let h = c(f);
          if (h != null)
            h.putImageData(t, 0, 0), i = h.getImageData(0, 0, d, u).data;
          else
            throw new Error("Can not access image data");
        } else
          i = t.data;
      } else if (s) {
        if (e === void 0)
          throw new Error("Please provide image config with format for Imagebitmap");
        let u = l();
        u.width = t.width, u.height = t.height;
        let d = c(u);
        if (d != null) {
          let f = t.height, h = t.width;
          return d.drawImage(t, 0, 0, h, f), i = d.getImageData(0, 0, h, f).data, a.height = f, a.width = h, xl(i, a);
        } else
          throw new Error("Can not access image data");
      } else {
        if (o)
          return new Promise((u, d) => {
            let f = l(), h = c(f);
            if (!t || !h)
              return d();
            let p = new Image();
            p.crossOrigin = "Anonymous", p.src = t, p.onload = () => {
              f.width = p.width, f.height = p.height, h.drawImage(p, 0, 0, f.width, f.height);
              let m = h.getImageData(0, 0, f.width, f.height);
              a.height = f.height, a.width = f.width, u(xl(m.data, a));
            };
          });
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (i !== void 0)
        return xl(i, a);
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }, ap = (t, e) => {
      let { width: r, height: n, download: s, dispose: o } = e, i = [1, n, r, 4];
      return new Te({ location: "texture", type: "float32", texture: t, dims: i, download: s, dispose: o });
    }, lp = (t, e) => {
      let { dataType: r, dims: n, download: s, dispose: o } = e;
      return new Te({ location: "gpu-buffer", type: r ?? "float32", gpuBuffer: t, dims: n, download: s, dispose: o });
    }, cp = (t, e) => {
      let { dataType: r, dims: n, download: s, dispose: o } = e;
      return new Te({ location: "ml-tensor", type: r ?? "float32", mlTensor: t, dims: n, download: s, dispose: o });
    }, up = (t, e, r) => new Te({ location: "cpu-pinned", type: t, data: e, dims: r ?? [e.length] });
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js
  var lr, Dn, fp, hp, pp = b(() => {
    lr = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array],
      ["int4", Uint8Array],
      ["uint4", Uint8Array]
    ]), Dn = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]), fp = !1, hp = () => {
      if (!fp) {
        fp = !0;
        let t = typeof BigInt64Array < "u" && BigInt64Array.from, e = typeof BigUint64Array < "u" && BigUint64Array.from, r = globalThis.Float16Array, n = typeof r < "u" && r.from;
        t && (lr.set("int64", BigInt64Array), Dn.set(BigInt64Array, "int64")), e && (lr.set("uint64", BigUint64Array), Dn.set(BigUint64Array, "uint64")), n ? (lr.set("float16", r), Dn.set(r, "float16")) : lr.set("float16", Uint16Array);
      }
    };
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js
  var mp, _p, gp = b(() => {
    Ns();
    mp = (t) => {
      let e = 1;
      for (let r = 0; r < t.length; r++) {
        let n = t[r];
        if (typeof n != "number" || !Number.isSafeInteger(n))
          throw new TypeError(`dims[${r}] must be an integer, got: ${n}`);
        if (n < 0)
          throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${n}`);
        e *= n;
      }
      return e;
    }, _p = (t, e) => {
      switch (t.location) {
        case "cpu":
          return new Te(t.type, t.data, e);
        case "cpu-pinned":
          return new Te({
            location: "cpu-pinned",
            data: t.data,
            type: t.type,
            dims: e
          });
        case "texture":
          return new Te({
            location: "texture",
            texture: t.texture,
            type: t.type,
            dims: e
          });
        case "gpu-buffer":
          return new Te({
            location: "gpu-buffer",
            gpuBuffer: t.gpuBuffer,
            type: t.type,
            dims: e
          });
        case "ml-tensor":
          return new Te({
            location: "ml-tensor",
            mlTensor: t.mlTensor,
            type: t.type,
            dims: e
          });
        default:
          throw new Error(`tensorReshape: tensor location ${t.location} is not supported`);
      }
    };
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-impl.js
  var Te, Ns = b(() => {
    op();
    dp();
    pp();
    gp();
    Te = class {
      /**
       * implementation.
       */
      constructor(e, r, n) {
        hp();
        let s, o;
        if (typeof e == "object" && "location" in e)
          switch (this.dataLocation = e.location, s = e.type, o = e.dims, e.location) {
            case "cpu-pinned": {
              let a = lr.get(s);
              if (!a)
                throw new TypeError(`unsupported type "${s}" to create tensor from pinned buffer`);
              if (!(e.data instanceof a))
                throw new TypeError(`buffer should be of type ${a.name}`);
              this.cpuData = e.data;
              break;
            }
            case "texture": {
              if (s !== "float32")
                throw new TypeError(`unsupported type "${s}" to create tensor from texture`);
              this.gpuTextureData = e.texture, this.downloader = e.download, this.disposer = e.dispose;
              break;
            }
            case "gpu-buffer": {
              if (s !== "float32" && s !== "float16" && s !== "int32" && s !== "int64" && s !== "uint32" && s !== "uint8" && s !== "bool" && s !== "uint4" && s !== "int4")
                throw new TypeError(`unsupported type "${s}" to create tensor from gpu buffer`);
              this.gpuBufferData = e.gpuBuffer, this.downloader = e.download, this.disposer = e.dispose;
              break;
            }
            case "ml-tensor": {
              if (s !== "float32" && s !== "float16" && s !== "int32" && s !== "int64" && s !== "uint32" && s !== "uint64" && s !== "int8" && s !== "uint8" && s !== "bool" && s !== "uint4" && s !== "int4")
                throw new TypeError(`unsupported type "${s}" to create tensor from MLTensor`);
              this.mlTensorData = e.mlTensor, this.downloader = e.download, this.disposer = e.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        else {
          let a, l;
          if (typeof e == "string")
            if (s = e, l = n, e === "string") {
              if (!Array.isArray(r))
                throw new TypeError("A string tensor's data must be a string array.");
              a = r;
            } else {
              let c = lr.get(e);
              if (c === void 0)
                throw new TypeError(`Unsupported tensor type: ${e}.`);
              if (Array.isArray(r)) {
                if (e === "float16" && c === Uint16Array || e === "uint4" || e === "int4")
                  throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${c.name} as data.`);
                e === "uint64" || e === "int64" ? a = c.from(r, BigInt) : a = c.from(r);
              } else if (r instanceof c)
                a = r;
              else if (r instanceof Uint8ClampedArray)
                if (e === "uint8")
                  a = Uint8Array.from(r);
                else
                  throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
              else if (e === "float16" && r instanceof Uint16Array && c !== Uint16Array)
                a = new globalThis.Float16Array(r.buffer, r.byteOffset, r.length);
              else
                throw new TypeError(`A ${s} tensor's data must be type of ${c}`);
            }
          else if (l = r, Array.isArray(e)) {
            if (e.length === 0)
              throw new TypeError("Tensor type cannot be inferred from an empty array.");
            let c = typeof e[0];
            if (c === "string")
              s = "string", a = e;
            else if (c === "boolean")
              s = "bool", a = Uint8Array.from(e);
            else
              throw new TypeError(`Invalid element type of data array: ${c}.`);
          } else if (e instanceof Uint8ClampedArray)
            s = "uint8", a = Uint8Array.from(e);
          else {
            let c = Dn.get(e.constructor);
            if (c === void 0)
              throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);
            s = c, a = e;
          }
          if (l === void 0)
            l = [a.length];
          else if (!Array.isArray(l))
            throw new TypeError("A tensor's dims must be a number array");
          o = l, this.cpuData = a, this.dataLocation = "cpu";
        }
        let i = mp(o);
        if (this.cpuData && i !== this.cpuData.length && !((s === "uint4" || s === "int4") && Math.ceil(i / 2) === this.cpuData.length))
          throw new Error(`Tensor's size(${i}) does not match data length(${this.cpuData.length}).`);
        this.type = s, this.dims = o, this.size = i;
      }
      // #endregion
      // #region factory
      static async fromImage(e, r) {
        return ip(e, r);
      }
      static fromTexture(e, r) {
        return ap(e, r);
      }
      static fromGpuBuffer(e, r) {
        return lp(e, r);
      }
      static fromMLTensor(e, r) {
        return cp(e, r);
      }
      static fromPinnedBuffer(e, r, n) {
        return up(e, r, n);
      }
      // #endregion
      // #region conversions
      toDataURL(e) {
        return np(this, e);
      }
      toImageData(e) {
        return sp(this, e);
      }
      // #endregion
      // #region properties
      get data() {
        if (this.ensureValid(), !this.cpuData)
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        if (this.ensureValid(), !this.gpuTextureData)
          throw new Error("The data is not stored as a WebGL texture.");
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        if (this.ensureValid(), !this.gpuBufferData)
          throw new Error("The data is not stored as a WebGPU buffer.");
        return this.gpuBufferData;
      }
      get mlTensor() {
        if (this.ensureValid(), !this.mlTensorData)
          throw new Error("The data is not stored as a WebNN MLTensor.");
        return this.mlTensorData;
      }
      // #endregion
      // #region methods
      async getData(e) {
        switch (this.ensureValid(), this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer":
          case "ml-tensor": {
            if (!this.downloader)
              throw new Error("The current tensor is not created with a specified data downloader.");
            if (this.isDownloading)
              throw new Error("The current tensor is being downloaded.");
            try {
              this.isDownloading = !0;
              let r = await this.downloader();
              return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = r, e && this.disposer && (this.disposer(), this.disposer = void 0), r;
            } finally {
              this.isDownloading = !1;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading)
          throw new Error("The current tensor is being downloaded.");
        this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none")
          throw new Error("The tensor is disposed.");
      }
      reshape(e) {
        if (this.ensureValid(), this.downloader || this.disposer)
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        return _p(this, e);
      }
    };
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor.js
  var Ds, vl = b(() => {
    Ns();
    Ds = Te;
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/trace.js
  var El = b(() => {
    bl();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/inference-session-impl.js
  var wp = b(() => {
    wl();
    vl();
    El();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/inference-session.js
  var yp = b(() => {
    wp();
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-conversion.js
  var bp = b(() => {
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/tensor-factory.js
  var xp = b(() => {
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/onnx-model.js
  var vp = b(() => {
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/onnx-value.js
  var Ep = b(() => {
  });

  // node_modules/@huggingface/transformers/node_modules/onnxruntime-common/dist/esm/index.js
  var kp = b(() => {
    Zh();
    rp();
    yp();
    vl();
    bp();
    xp();
    El();
    vp();
    Ep();
  });

  // node_modules/@huggingface/transformers/src/backends/onnx.js
  function Cp(t) {
    return t <= Ue.DEBUG ? 0 : t <= Ue.INFO ? 2 : t <= Ue.WARNING || t <= Ue.ERROR ? 3 : 4;
  }
  function Eb() {
    return [...je];
  }
  function Ip(t = null) {
    if (!t) return kl;
    switch (t) {
      case "auto":
        return je;
      case "gpu":
        return je.filter((e) => ["webgpu", "cuda", "dml", "webnn-gpu"].includes(e));
    }
    if (je.includes(t))
      return [xb[t] ?? t];
    throw new Error(`Unsupported device: "${t}". Should be one of: ${je.join(", ")}.`);
  }
  async function Ab() {
    if (Gr)
      return Gr;
    if (!(j.useWasmCache && typeof ve?.wasm?.wasmPaths == "object" && ve?.wasm?.wasmPaths?.wasm && ve?.wasm?.wasmPaths?.mjs)) {
      if (q.IS_DENO_WEB_RUNTIME)
        throw new Error(
          "env.useWasmCache=false is not supported in Deno's web runtime. Remove the useWasmCache override."
        );
      return Gr = Promise.resolve(), Gr;
    }
    return Gr = (async () => {
      let e = (
        /** @type {{ wasm: string, mjs: string }} */
        ve.wasm.wasmPaths
      ), r = !1;
      await Promise.all([
        // Load and cache the WASM binary
        e.wasm && !ul(e.wasm) ? (async () => {
          try {
            let n = await Xh(On(e.wasm));
            n && (ve.wasm.wasmBinary = n, r = !0);
          } catch (n) {
            Q.warn("Failed to pre-load WASM binary:", n);
          }
        })() : Promise.resolve(),
        // Load and cache the WASM factory as a blob URL
        e.mjs && !ul(e.mjs) ? (async () => {
          try {
            let n = await Kh(On(e.mjs));
            n && (ve.wasm.wasmPaths.mjs = n);
          } catch (n) {
            Q.warn("Failed to pre-load WASM factory:", n);
          }
        })() : Promise.resolve()
      ]), r || (ve.wasm.wasmPaths.mjs = e.mjs);
    })(), Gr;
  }
  async function zs(t, e, r) {
    await Ab();
    let n = Cp(j.logLevel ?? Ue.WARNING), s = () => kb.create(t, {
      // Set default log severity level, but allow overriding through session options
      logSeverityLevel: n,
      ...e
    }), o = await (q.IS_WEB_ENV ? Tp = Tp.then(s) : s());
    return o.config = r, o;
  }
  async function Bs(t, e) {
    let r = () => t.run(e);
    return q.IS_WEB_ENV ? Sp = Sp.then(r) : r();
  }
  function Us(t) {
    return t instanceof qr.Tensor;
  }
  function zn() {
    return ve?.wasm?.proxy;
  }
  var xb, vb, je, kl, qr, Ap, kb, Tp, Gr, Sp, ve, Fs = b(() => {
    Ie();
    Hh();
    Cr();
    Jh();
    Pn();
    Me();
    kp();
    xb = Object.freeze({
      auto: null,
      // Auto-detect based on device and environment
      gpu: null,
      // Auto-detect GPU
      cpu: "cpu",
      // CPU
      wasm: "wasm",
      // WebAssembly
      webgpu: "webgpu",
      // WebGPU
      cuda: "cuda",
      // CUDA
      dml: "dml",
      // DirectML
      coreml: "coreml",
      // CoreML
      webnn: { name: "webnn", deviceType: "cpu" },
      // WebNN (default)
      "webnn-npu": { name: "webnn", deviceType: "npu" },
      // WebNN NPU
      "webnn-gpu": { name: "webnn", deviceType: "gpu" },
      // WebNN GPU
      "webnn-cpu": { name: "webnn", deviceType: "cpu" }
      // WebNN CPU
    });
    vb = {
      0: "verbose",
      1: "info",
      2: "warning",
      3: "error",
      4: "fatal"
    }, je = [], Ap = Symbol.for("onnxruntime");
    if (Ap in globalThis)
      qr = globalThis[Ap];
    else if (q.IS_NODE_ENV) {
      switch (qr = qh, process.platform) {
        case "win32":
          je.push("dml");
          break;
        case "linux":
          process.arch === "x64" && je.push("cuda");
          break;
        case "darwin":
          je.push("coreml");
          break;
      }
      je.push("webgpu"), je.push("cpu"), kl = ["cpu"];
    } else
      qr = vt, q.IS_WEBNN_AVAILABLE && je.push("webnn-npu", "webnn-gpu", "webnn-cpu", "webnn"), q.IS_WEBGPU_AVAILABLE && je.push("webgpu"), je.push("wasm"), kl = ["wasm"];
    kb = qr.InferenceSession;
    Tp = Promise.resolve(), Gr = null;
    Sp = Promise.resolve();
    ve = qr?.env;
    if (ve) {
      let t = function(e) {
        let r = Cp(e);
        ve.logLevel = vb[r];
      };
      if (ve.wasm) {
        if (
          // @ts-ignore Cannot find name 'ServiceWorkerGlobalScope'.ts(2304)
          !(typeof ServiceWorkerGlobalScope < "u" && self instanceof ServiceWorkerGlobalScope) && ve.versions?.web && !ve.wasm.wasmPaths
        ) {
          let e = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ve.versions.web}/dist/`, r = ".asyncify";
          q.IS_SAFARI_BELOW_26 && !q.IS_WEBGPU_AVAILABLE && (r = ""), ve.wasm.wasmPaths = {
            mjs: `${e}ort-wasm-simd-threaded${r}.mjs`,
            wasm: `${e}ort-wasm-simd-threaded${r}.wasm`
          };
        }
        ve.wasm.proxy = !1;
      }
      ve.webgpu && (ve.webgpu.powerPreference = "high-performance"), t(j.logLevel ?? Ue.WARNING), j.backends.onnx = {
        ...ve,
        setLogLevel: t,
        getSupportedDevices: Eb
      };
    }
  });

  // node_modules/@huggingface/transformers/src/ops/registry.js
  var Nt, Dt, Mp = b(() => {
    Fs();
    we();
    Nt = async (t, e, r) => {
      let n = await zs(new Uint8Array(t), e);
      return (
        /** @type {any} */
        (async (s) => {
          let o = zn(), i = Object.fromEntries(
            Object.entries(s).map(([l, c]) => [l, (o ? c.clone() : c).ort_tensor])
          ), a = await Bs(n, i);
          return Array.isArray(r) ? r.map((l) => new W(a[l])) : new W(a[
            /** @type {string} */
            r
          ]);
        })
      );
    }, Dt = class {
      static session_options = {
        // TODO: Allow for multiple execution providers
        // executionProviders: ['webgpu'],
      };
      static get nearest_interpolate_4d() {
        return this._nearest_interpolate_4d || (this._nearest_interpolate_4d = Nt(
          [
            8,
            10,
            18,
            0,
            58,
            129,
            1,
            10,
            41,
            10,
            1,
            120,
            10,
            0,
            10,
            0,
            10,
            1,
            115,
            18,
            1,
            121,
            34,
            6,
            82,
            101,
            115,
            105,
            122,
            101,
            42,
            18,
            10,
            4,
            109,
            111,
            100,
            101,
            34,
            7,
            110,
            101,
            97,
            114,
            101,
            115,
            116,
            160,
            1,
            3,
            18,
            1,
            114,
            90,
            31,
            10,
            1,
            120,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            90,
            15,
            10,
            1,
            115,
            18,
            10,
            10,
            8,
            8,
            7,
            18,
            4,
            10,
            2,
            8,
            4,
            98,
            31,
            10,
            1,
            121,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            66,
            2,
            16,
            21
          ],
          this.session_options,
          "y"
        )), this._nearest_interpolate_4d;
      }
      static get bilinear_interpolate_4d() {
        return this._bilinear_interpolate_4d || (this._bilinear_interpolate_4d = Nt(
          [
            8,
            9,
            18,
            0,
            58,
            128,
            1,
            10,
            40,
            10,
            1,
            120,
            10,
            0,
            10,
            0,
            10,
            1,
            115,
            18,
            1,
            121,
            34,
            6,
            82,
            101,
            115,
            105,
            122,
            101,
            42,
            17,
            10,
            4,
            109,
            111,
            100,
            101,
            34,
            6,
            108,
            105,
            110,
            101,
            97,
            114,
            160,
            1,
            3,
            18,
            1,
            114,
            90,
            31,
            10,
            1,
            120,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            90,
            15,
            10,
            1,
            115,
            18,
            10,
            10,
            8,
            8,
            7,
            18,
            4,
            10,
            2,
            8,
            4,
            98,
            31,
            10,
            1,
            121,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            66,
            2,
            16,
            20
          ],
          this.session_options,
          "y"
        )), this._bilinear_interpolate_4d;
      }
      static get bicubic_interpolate_4d() {
        return this._bicubic_interpolate_4d || (this._bicubic_interpolate_4d = Nt(
          [
            8,
            9,
            18,
            0,
            58,
            127,
            10,
            39,
            10,
            1,
            120,
            10,
            0,
            10,
            0,
            10,
            1,
            115,
            18,
            1,
            121,
            34,
            6,
            82,
            101,
            115,
            105,
            122,
            101,
            42,
            16,
            10,
            4,
            109,
            111,
            100,
            101,
            34,
            5,
            99,
            117,
            98,
            105,
            99,
            160,
            1,
            3,
            18,
            1,
            114,
            90,
            31,
            10,
            1,
            120,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            90,
            15,
            10,
            1,
            115,
            18,
            10,
            10,
            8,
            8,
            7,
            18,
            4,
            10,
            2,
            8,
            4,
            98,
            31,
            10,
            1,
            121,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            99,
            10,
            3,
            18,
            1,
            104,
            10,
            3,
            18,
            1,
            119,
            66,
            2,
            16,
            20
          ],
          this.session_options,
          "y"
        )), this._bicubic_interpolate_4d;
      }
      static get matmul() {
        return this._matmul || (this._matmul = Nt(
          [
            8,
            9,
            18,
            0,
            58,
            55,
            10,
            17,
            10,
            1,
            97,
            10,
            1,
            98,
            18,
            1,
            99,
            34,
            6,
            77,
            97,
            116,
            77,
            117,
            108,
            18,
            1,
            114,
            90,
            9,
            10,
            1,
            97,
            18,
            4,
            10,
            2,
            8,
            1,
            90,
            9,
            10,
            1,
            98,
            18,
            4,
            10,
            2,
            8,
            1,
            98,
            9,
            10,
            1,
            99,
            18,
            4,
            10,
            2,
            8,
            1,
            66,
            2,
            16,
            20
          ],
          this.session_options,
          "c"
        )), this._matmul;
      }
      static get stft() {
        return this._stft || (this._stft = Nt(
          [
            8,
            7,
            18,
            0,
            58,
            148,
            1,
            10,
            38,
            10,
            1,
            115,
            10,
            1,
            106,
            10,
            1,
            119,
            10,
            1,
            108,
            18,
            1,
            111,
            34,
            4,
            83,
            84,
            70,
            84,
            42,
            15,
            10,
            8,
            111,
            110,
            101,
            115,
            105,
            100,
            101,
            100,
            24,
            1,
            160,
            1,
            2,
            18,
            1,
            115,
            90,
            26,
            10,
            1,
            115,
            18,
            21,
            10,
            19,
            8,
            1,
            18,
            15,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            115,
            10,
            3,
            18,
            1,
            99,
            90,
            11,
            10,
            1,
            106,
            18,
            6,
            10,
            4,
            8,
            7,
            18,
            0,
            90,
            16,
            10,
            1,
            119,
            18,
            11,
            10,
            9,
            8,
            1,
            18,
            5,
            10,
            3,
            18,
            1,
            119,
            90,
            11,
            10,
            1,
            108,
            18,
            6,
            10,
            4,
            8,
            7,
            18,
            0,
            98,
            31,
            10,
            1,
            111,
            18,
            26,
            10,
            24,
            8,
            1,
            18,
            20,
            10,
            3,
            18,
            1,
            98,
            10,
            3,
            18,
            1,
            102,
            10,
            3,
            18,
            1,
            100,
            10,
            3,
            18,
            1,
            99,
            66,
            2,
            16,
            17
          ],
          this.session_options,
          "o"
        )), this._stft;
      }
      static get rfft() {
        return this._rfft || (this._rfft = Nt(
          [
            8,
            9,
            58,
            93,
            10,
            33,
            10,
            1,
            120,
            10,
            0,
            10,
            1,
            97,
            18,
            1,
            121,
            34,
            3,
            68,
            70,
            84,
            42,
            15,
            10,
            8,
            111,
            110,
            101,
            115,
            105,
            100,
            101,
            100,
            24,
            1,
            160,
            1,
            2,
            18,
            1,
            100,
            90,
            19,
            10,
            1,
            120,
            18,
            14,
            10,
            12,
            8,
            1,
            18,
            8,
            10,
            0,
            10,
            0,
            10,
            2,
            8,
            1,
            90,
            11,
            10,
            1,
            97,
            18,
            6,
            10,
            4,
            8,
            7,
            18,
            0,
            98,
            19,
            10,
            1,
            121,
            18,
            14,
            10,
            12,
            8,
            1,
            18,
            8,
            10,
            0,
            10,
            0,
            10,
            2,
            8,
            2,
            66,
            2,
            16,
            20
          ],
          this.session_options,
          "y"
        )), this._rfft;
      }
      static get top_k() {
        return this._top_k || (this._top_k = Nt(
          [
            8,
            10,
            18,
            0,
            58,
            73,
            10,
            18,
            10,
            1,
            120,
            10,
            1,
            107,
            18,
            1,
            118,
            18,
            1,
            105,
            34,
            4,
            84,
            111,
            112,
            75,
            18,
            1,
            116,
            90,
            9,
            10,
            1,
            120,
            18,
            4,
            10,
            2,
            8,
            1,
            90,
            15,
            10,
            1,
            107,
            18,
            10,
            10,
            8,
            8,
            7,
            18,
            4,
            10,
            2,
            8,
            1,
            98,
            9,
            10,
            1,
            118,
            18,
            4,
            10,
            2,
            8,
            1,
            98,
            9,
            10,
            1,
            105,
            18,
            4,
            10,
            2,
            8,
            7,
            66,
            2,
            16,
            21
          ],
          this.session_options,
          [
            /* Values */
            "v",
            /* Indices */
            "i"
          ]
        )), this._top_k;
      }
      static get slice() {
        return this._slice || (this._slice = Nt(
          [
            8,
            7,
            18,
            0,
            58,
            96,
            10,
            25,
            10,
            1,
            120,
            10,
            1,
            115,
            10,
            1,
            101,
            10,
            1,
            97,
            10,
            1,
            116,
            18,
            1,
            121,
            34,
            5,
            83,
            108,
            105,
            99,
            101,
            18,
            1,
            114,
            90,
            9,
            10,
            1,
            120,
            18,
            4,
            10,
            2,
            8,
            1,
            90,
            9,
            10,
            1,
            115,
            18,
            4,
            10,
            2,
            8,
            7,
            90,
            9,
            10,
            1,
            101,
            18,
            4,
            10,
            2,
            8,
            7,
            90,
            9,
            10,
            1,
            97,
            18,
            4,
            10,
            2,
            8,
            7,
            90,
            9,
            10,
            1,
            116,
            18,
            4,
            10,
            2,
            8,
            7,
            98,
            9,
            10,
            1,
            121,
            18,
            4,
            10,
            2,
            8,
            1,
            66,
            2,
            16,
            13
          ],
          this.session_options,
          "y"
        )), this._slice;
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/devices.js
  function js(t, e, { warn: r } = {}) {
    return t ? typeof t == "string" ? t : t.hasOwnProperty(e) ? t[e] : (r && r(`device not specified for "${e}". Using the default device (${Al}).`), Al) : Al;
  }
  var Op, Al, Ws = b(() => {
    Ie();
    Op = Object.freeze({
      auto: "auto",
      // Auto-detect based on device and environment
      gpu: "gpu",
      // Auto-detect GPU
      cpu: "cpu",
      // CPU
      wasm: "wasm",
      // WebAssembly
      webgpu: "webgpu",
      // WebGPU
      cuda: "cuda",
      // CUDA
      dml: "dml",
      // DirectML
      coreml: "coreml",
      // CoreML
      webnn: "webnn",
      // WebNN (default)
      "webnn-npu": "webnn-npu",
      // WebNN NPU
      "webnn-gpu": "webnn-gpu",
      // WebNN GPU
      "webnn-cpu": "webnn-cpu"
      // WebNN CPU
    }), Al = q.IS_NODE_ENV ? "cpu" : "wasm";
  });

  // node_modules/@huggingface/transformers/src/utils/dtypes.js
  function Vs(t, e, r, { configDtype: n = null, warn: s } = {}) {
    let o, i = !1;
    t && typeof t != "string" ? t.hasOwnProperty(e) ? o = t[e] : (o = null, i = !0) : o = /** @type {string|null|undefined} */
    t;
    let a;
    if (o === be.auto) {
      if (n) {
        let l = typeof n == "string" ? n : n?.[e];
        if (l && l !== be.auto && be.hasOwnProperty(l))
          return (
            /** @type {DataType} */
            l
          );
      }
      a = Lp[r] ?? Pp;
    } else o && be.hasOwnProperty(o) ? a = /** @type {DataType} */
    o : a = Lp[r] ?? Pp;
    return i && s && s(
      `dtype not specified for "${e}". Using the default dtype (${a}) for this device (${r}).`
    ), a;
  }
  var Rp, be, Pp, Lp, Bn, Un, Fn = b(() => {
    Ie();
    Ws();
    Rp = /* @__PURE__ */ (function() {
      let t;
      return async function() {
        if (t === void 0)
          if (!q.IS_WEBGPU_AVAILABLE)
            t = !1;
          else
            try {
              t = (await navigator.gpu.requestAdapter()).features.has("shader-f16");
            } catch {
              t = !1;
            }
        return t;
      };
    })(), be = Object.freeze({
      auto: "auto",
      // Auto-detect based on environment
      fp32: "fp32",
      fp16: "fp16",
      q8: "q8",
      int8: "int8",
      uint8: "uint8",
      q4: "q4",
      bnb4: "bnb4",
      q4f16: "q4f16",
      // fp16 model with 4-bit block weight quantization
      q2: "q2",
      q2f16: "q2f16",
      // fp16 model with 2-bit block weight quantization
      q1: "q1",
      q1f16: "q1f16"
      // fp16 model with 1-bit block weight quantization
    }), Pp = be.fp32, Lp = Object.freeze({
      // NOTE: If not specified, will default to fp32
      [Op.wasm]: be.q8
    }), Bn = Object.freeze({
      [be.fp32]: "",
      [be.fp16]: "_fp16",
      [be.int8]: "_int8",
      [be.uint8]: "_uint8",
      [be.q8]: "_quantized",
      [be.q4]: "_q4",
      [be.q2]: "_q2",
      [be.q1]: "_q1",
      [be.q4f16]: "_q4f16",
      [be.q2f16]: "_q2f16",
      [be.q1f16]: "_q1f16",
      [be.bnb4]: "_bnb4"
    });
    Un = Object.freeze({
      float32: Float32Array,
      // @ts-ignore ts(2552) Limited availability of Float16Array across browsers:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
      float16: typeof Float16Array < "u" ? Float16Array : Uint16Array,
      float64: Float64Array,
      string: Array,
      // string[]
      int8: Int8Array,
      uint8: Uint8Array,
      int16: Int16Array,
      uint16: Uint16Array,
      int32: Int32Array,
      uint32: Uint32Array,
      int64: BigInt64Array,
      uint64: BigUint64Array,
      bool: Uint8Array,
      uint4: Uint8Array,
      int4: Int8Array
    });
  });

  // node_modules/@huggingface/transformers/src/utils/tensor.js
  function Tb(t, e) {
    let r = t.length, n = e.length === 0 ? 1 : e.reduce((o, i) => o * i);
    if (r !== n)
      throw Error(`cannot reshape array of size ${r} into shape (${e})`);
    let s = t;
    for (let o = e.length - 1; o >= 0; o--)
      s = s.reduce(
        (i, a) => {
          let l = i[i.length - 1];
          return l.length < e[o] ? l.push(a) : i.push([a]), i;
        },
        [[]]
      );
    return s[0];
  }
  function Sb(t, e) {
    let [r, n] = Wh(t.data, t.dims, e);
    return new W(t.type, r, n);
  }
  function Sl(t, [e, r], n = "bilinear", s = !1) {
    let o = t.dims.at(-3) ?? 1, i = t.dims.at(-2), a = t.dims.at(-1), l = jh(
      /** @type {import('./maths.js').TypedArray}*/
      t.data,
      [o, i, a],
      [e, r],
      n,
      s
    );
    return new W(t.type, l, [o, e, r]);
  }
  async function Re(t, { size: e = null, mode: r = "bilinear" } = {}) {
    if (t.dims.length !== 4)
      throw new Error("`interpolate_4d` currently only supports 4D input.");
    if (!e)
      throw new Error("`interpolate_4d` requires a `size` argument.");
    let n;
    if (e.length === 2)
      n = [...t.dims.slice(0, 2), ...e];
    else if (e.length === 3)
      n = [t.dims[0], ...e];
    else if (e.length === 4)
      n = e;
    else
      throw new Error("`size` must be of length 2, 3, or 4.");
    let s;
    if (r === "nearest")
      s = await Dt.nearest_interpolate_4d;
    else if (r === "bilinear")
      s = await Dt.bilinear_interpolate_4d;
    else if (r === "bicubic")
      s = await Dt.bicubic_interpolate_4d;
    else
      throw new Error(`Unsupported mode: ${r}`);
    let o = new W("int64", new BigInt64Array(n.map(BigInt)), [n.length]);
    return await s({ x: t, s: o });
  }
  async function Cl(t, e) {
    let r = await Dt.top_k;
    return e == null ? e = t.dims.at(-1) : e = Math.min(e, t.dims.at(-1)), await r({
      x: t,
      k: new W("int64", [BigInt(e)], [1])
    });
  }
  async function Hs(t, e, r, n, s) {
    return await (await Dt.slice)({
      x: t,
      s: Gs(e),
      e: Gs(r),
      a: Gs(n),
      t: Gs(s ?? new Array(n.length).fill(1))
    });
  }
  function $p(t, e) {
    return t = t.slice(), e === null ? t = t.filter((r) => r !== 1) : typeof e == "number" ? t[e] === 1 && t.splice(e, 1) : Array.isArray(e) && (t = t.filter((r, n) => r !== 1 || !e.includes(n))), t;
  }
  function Np(t, e) {
    return e = Tt(e, t.length + 1), t = t.slice(), t.splice(e, 0, 1), t;
  }
  function Tt(t, e, r = null, n = !0) {
    if (t < -e || t >= e) {
      if (n)
        throw new Error(
          `IndexError: index ${t} is out of bounds for dimension${r === null ? "" : " " + r} with size ${e}`
        );
      return t < -e ? 0 : e;
    }
    return t < 0 && (t = (t % e + e) % e), t;
  }
  function le(t, e = 0) {
    e = Tt(e, t[0].dims.length);
    let r = t[0].dims.slice();
    r[e] = t.reduce((i, a) => i + a.dims[e], 0);
    let n = r.reduce((i, a) => i * a, 1), s = new t[0].data.constructor(n), o = t[0].type;
    if (e === 0) {
      let i = 0;
      for (let a of t) {
        let l = a.data;
        s.set(l, i), i += l.length;
      }
    } else {
      let i = 0;
      for (let a = 0; a < t.length; ++a) {
        let { data: l, dims: c } = t[a];
        for (let u = 0; u < l.length; ++u) {
          let d = 0;
          for (let f = c.length - 1, h = u, p = 1; f >= 0; --f) {
            let m = c[f], _ = h % m;
            f === e && (_ += i), d += _ * p, p *= r[f], h = Math.floor(h / m);
          }
          s[d] = l[u];
        }
        i += c[e];
      }
    }
    return new W(o, s, r);
  }
  function We(t, e = 0) {
    return le(
      t.map((r) => r.unsqueeze(e)),
      e
    );
  }
  function qs(t, e, r, n = !1, s = null) {
    let o = e.data, i = e.dims;
    r = Tt(r, i.length);
    let a = i.slice();
    a[r] = 1;
    let l = new o.constructor(o.length / i[r]);
    s !== null && l.fill(s);
    for (let c = 0; c < o.length; ++c) {
      let u = 0;
      for (let d = i.length - 1, f = c, h = 1; d >= 0; --d) {
        let p = i[d];
        if (d !== r) {
          let m = f % p;
          u += m * h, h *= a[d];
        }
        f = Math.floor(f / p);
      }
      l[u] = t(l[u], o[c], c, u);
    }
    return n || a.splice(r, 1), [e.type, l, a];
  }
  function Cb(t, e = null, r = !1) {
    let n = t.dims, s = (
      /** @type {Float32Array} */
      t.data
    );
    if (e === null) {
      let l = s.reduce((c, u) => c + u, 0);
      return new W(
        t.type,
        [l / s.length],
        [
          /* scalar */
        ]
      );
    }
    e = Tt(e, n.length);
    let [o, i, a] = qs((l, c) => l + c, t, e, r);
    if (n[e] !== 1)
      for (let l = 0; l < i.length; ++l)
        i[l] /= n[e];
    return new W(o, i, a);
  }
  function Tl(t) {
    let e = new Array(t.length);
    for (let r = t.length - 1, n = 1; r >= 0; --r)
      e[r] = n, n *= t[r];
    return e;
  }
  function Il(t, e, r, n) {
    let s = t.reduce((o, i) => o * i, 1);
    return new W(r, new n(s).fill(e), t);
  }
  function cr(t, e) {
    let r, n;
    if (typeof e == "number")
      r = "float32", n = Float32Array;
    else if (typeof e == "bigint")
      r = "int64", n = BigInt64Array;
    else if (typeof e == "boolean")
      r = "bool", n = Uint8Array;
    else
      throw new Error(`Unsupported data type: ${typeof e}`);
    return Il(t, e, r, n);
  }
  function Dp(t, e) {
    return cr(t.dims, e);
  }
  function ot(t) {
    return Il(t, 1n, "int64", BigInt64Array);
  }
  function zp(t) {
    return ot(t.dims);
  }
  function Ib(t) {
    return Il(t, 0n, "int64", BigInt64Array);
  }
  function Ml(t) {
    return Ib(t.dims);
  }
  var W, Gs, we = b(() => {
    ar();
    Fs();
    Mp();
    Fn();
    Is();
    W = class t {
      /**
       * Dimensions of the tensor.
       * @type {number[]}
       */
      get dims() {
        return this.ort_tensor.dims;
      }
      set dims(e) {
        this.ort_tensor.dims = e;
      }
      /**
       * Type of the tensor.
       * @type {DataType}
       */
      get type() {
        return this.ort_tensor.type;
      }
      /**
       * The data stored in the tensor.
       * @type {DataArray}
       */
      get data() {
        return this.ort_tensor.data;
      }
      /**
       * The number of elements in the tensor.
       * @type {number}
       */
      get size() {
        return this.ort_tensor.size;
      }
      /**
       * The location of the tensor data.
       * @type {string}
       */
      get location() {
        return this.ort_tensor.location;
      }
      ort_tensor;
      /**
       * Create a new Tensor, either from raw data or by wrapping an `onnxruntime` tensor:
       * - `new Tensor(dataType, data, dims)`, e.g. `new Tensor('float32', new Float32Array([1, 2, 3]), [3])`.
       * - `new Tensor(ortTensor)`.
       *
       * @param {[DataType, DataArray, number[]]|[ONNXTensor]} args
       */
      constructor(...e) {
        return Us(e[0]) ? this.ort_tensor = /** @type {ONNXTensor} */
        e[0] : this.ort_tensor = new Ds(
          /** @type {DataType} */
          e[0],
          // @ts-expect-error ts(2769) Type 'number' is not assignable to type 'bigint'.
          /** @type {Exclude<import('./maths.js').AnyTypedArray, Uint8ClampedArray>} */
          e[1],
          e[2]
        ), new Proxy(this, {
          get: (r, n) => {
            if (typeof n == "string") {
              let s = Number(n);
              if (Number.isInteger(s))
                return r._getitem(s);
            }
            return r[n];
          },
          set: (r, n, s) => r[n] = s
        });
      }
      /**
       * Releases the underlying ONNX Runtime tensor (e.g., GPU buffers). Do not use the tensor afterwards.
       */
      dispose() {
        this.ort_tensor.dispose();
      }
      /**
       * Returns an iterator object for iterating over the tensor data in row-major order.
       * If the tensor has more than one dimension, the iterator will yield subarrays.
       * @returns {Iterator<any>} An iterator object for iterating over the tensor data in row-major order.
       */
      *[Symbol.iterator]() {
        let [e, ...r] = this.dims;
        if (r.length > 0) {
          let n = r.reduce((s, o) => s * o);
          for (let s = 0; s < e; ++s)
            yield this._subarray(s, n, r);
        } else
          yield* this.data;
      }
      /**
       * Index into a Tensor object.
       * @param {number} index The index to access.
       * @returns {Tensor} The data at the specified index.
       * @private
       */
      _getitem(e) {
        let [r, ...n] = this.dims;
        if (e = Tt(e, r), n.length > 0) {
          let s = n.reduce((o, i) => o * i);
          return this._subarray(e, s, n);
        } else
          return new t(this.type, [this.data[e]], n);
      }
      /**
       * @param {number} index
       * @param {number} iterSize
       * @param {any} iterDims
       * @returns {Tensor}
       */
      _subarray(e, r, n) {
        let s = e * r, o = (e + 1) * r, i = "subarray" in this.data ? this.data.subarray(s, o) : this.data.slice(s, o);
        return new t(this.type, i, n);
      }
      /**
       * Returns the value of this tensor as a standard JavaScript Number. This only works
       * for tensors with one element. For other cases, see `Tensor.tolist()`.
       * @returns {number|bigint} The value of this tensor as a standard JavaScript Number.
       * @throws {Error} If the tensor has more than one element.
       */
      item() {
        let e = this.data;
        if (e.length !== 1)
          throw new Error(`a Tensor with ${e.length} elements cannot be converted to Scalar`);
        return e[0];
      }
      /**
       * Convert tensor data to a n-dimensional JS list
       * @returns {any[]}
       */
      tolist() {
        return Tb(this.data, this.dims);
      }
      /**
       * Return a new Tensor with the sigmoid function applied to each element.
       * @returns {Tensor} The tensor with the sigmoid function applied.
       */
      sigmoid() {
        return this.clone().sigmoid_();
      }
      /**
       * Applies the sigmoid function to the tensor in place.
       * @returns {Tensor} Returns `this`.
       */
      sigmoid_() {
        let e = this.data;
        for (let r = 0; r < e.length; ++r)
          e[r] = 1 / (1 + Math.exp(-e[r]));
        return this;
      }
      /**
       * Return a new Tensor with a callback function applied to each element.
       * @param {Function} callback - The function to apply to each element. It should take three arguments:
       *                              the current element, its index, and the tensor's data array.
       * @returns {Tensor} A new Tensor with the callback function applied to each element.
       */
      map(e) {
        return this.clone().map_(e);
      }
      /**
       * Apply a callback function to each element of the tensor in place.
       * @param {Function} callback - The function to apply to each element. It should take three arguments:
       *                              the current element, its index, and the tensor's data array.
       * @returns {Tensor} Returns `this`.
       */
      map_(e) {
        let r = this.data;
        for (let n = 0; n < r.length; ++n)
          r[n] = e(r[n], n, r);
        return this;
      }
      /**
       * Return a new Tensor with every element multiplied by a constant.
       * @param {number} val The value to multiply by.
       * @returns {Tensor} The new tensor.
       */
      mul(e) {
        return this.clone().mul_(e);
      }
      /**
       * Multiply the tensor by a constant in place.
       * @param {number} val The value to multiply by.
       * @returns {Tensor} Returns `this`.
       */
      mul_(e) {
        let r = this.data;
        for (let n = 0; n < r.length; ++n)
          r[n] *= e;
        return this;
      }
      /**
       * Return a new Tensor with every element divided by a constant.
       * @param {number} val The value to divide by.
       * @returns {Tensor} The new tensor.
       */
      div(e) {
        return this.clone().div_(e);
      }
      /**
       * Divide the tensor by a constant in place.
       * @param {number} val The value to divide by.
       * @returns {Tensor} Returns `this`.
       */
      div_(e) {
        let r = this.data;
        for (let n = 0; n < r.length; ++n)
          r[n] /= e;
        return this;
      }
      /**
       * Return a new Tensor with every element added by a constant.
       * @param {number} val The value to add by.
       * @returns {Tensor} The new tensor.
       */
      add(e) {
        return this.clone().add_(e);
      }
      /**
       * Add the tensor by a constant in place.
       * @param {number} val The value to add by.
       * @returns {Tensor} Returns `this`.
       */
      add_(e) {
        let r = this.data;
        for (let n = 0; n < r.length; ++n)
          r[n] += e;
        return this;
      }
      /**
       * Return a new Tensor with every element subtracted by a constant.
       * @param {number} val The value to subtract by.
       * @returns {Tensor} The new tensor.
       */
      sub(e) {
        return this.clone().sub_(e);
      }
      /**
       * Subtract the tensor by a constant in place.
       * @param {number} val The value to subtract by.
       * @returns {Tensor} Returns `this`.
       */
      sub_(e) {
        let r = this.data;
        for (let n = 0; n < r.length; ++n)
          r[n] -= e;
        return this;
      }
      /**
       * Return a new Tensor with the element-wise remainder of division by a constant.
       * Uses Python-style modulo signs (e.g. `-1 mod 2 = 1`) while preserving the tensor's dtype.
       * Negative divisors are unsupported for unsigned and boolean tensors.
       * This operation does not implement PyTorch's dtype promotion or scalar casting rules.
       * @param {number|bigint} val The divisor.
       * @returns {Tensor} The new tensor.
       */
      remainder(e) {
        return this.clone().remainder_(e);
      }
      /**
       * In-place version of @see {@link Tensor.remainder}
       * @param {number|bigint} val The divisor.
       * @returns {Tensor} Returns `this`.
       */
      remainder_(e) {
        let r = this.data, s = (
          /** @type {any} */
          r instanceof BigInt64Array || r instanceof BigUint64Array ? BigInt(e) : Number(e)
        );
        if ((s === 0 || s === 0n) && (this.type.includes("int") || this.type === "bool"))
          throw new RangeError("Division by zero");
        if (s < 0 && (this.type.startsWith("uint") || this.type === "bool"))
          throw new RangeError("Negative divisors are not supported for unsigned or boolean tensors");
        for (let o = 0; o < r.length; ++o) {
          let i = r[o] % s, a = i < 0 && s > 0 || i > 0 && s < 0;
          r[o] = a ? i + s : i;
        }
        return this;
      }
      /**
       * Creates a deep copy of the current Tensor.
       * @returns {Tensor} A new Tensor with the same type, data, and dimensions as the original.
       */
      clone() {
        return new t(this.type, this.data.slice(), this.dims.slice());
      }
      /**
       * Performs a slice operation on the Tensor along specified dimensions.
       *
       * Consider a Tensor that has a dimension of [4, 7]:
       * ```
       * [ 1,  2,  3,  4,  5,  6,  7]
       * [ 8,  9, 10, 11, 12, 13, 14]
       * [15, 16, 17, 18, 19, 20, 21]
       * [22, 23, 24, 25, 26, 27, 28]
       * ```
       * We can slice against the two dims of row and column, for instance in this
       * case we can start at the second element, and return to the second last,
       * like this:
       * ```
       * tensor.slice([1, -1], [1, -1]);
       * ```
       * which would return:
       * ```
       * [  9, 10, 11, 12, 13 ]
       * [ 16, 17, 18, 19, 20 ]
       * ```
       *
       * @param {...(number|number[]|null)} slices The slice specifications for each dimension.
       * - If a number is given, then a single element is selected.
       * - If an array of two numbers is given, then a range of elements [start, end (exclusive)] is selected.
       * - If null is given, then the entire dimension is selected.
       * @returns {Tensor} A new Tensor containing the selected elements.
       * @throws {Error} If the slice input is invalid.
       */
      slice(...e) {
        let r = [], n = [];
        for (let u = 0; u < this.dims.length; ++u) {
          let d = e[u];
          if (d == null)
            n.push([0, this.dims[u]]), r.push(this.dims[u]);
          else if (typeof d == "number")
            d = Tt(d, this.dims[u], u), n.push([d, d + 1]);
          else if (Array.isArray(d) && d.length === 2) {
            let [f, h] = d;
            if (f = f === null ? 0 : Tt(f, this.dims[u], u, !1), h = h === null ? this.dims[u] : Tt(h, this.dims[u], u, !1), f > h)
              throw new Error(`Invalid slice: ${d}`);
            let p = [Math.max(f, 0), Math.min(h, this.dims[u])];
            n.push(p), r.push(p[1] - p[0]);
          } else
            throw new Error(`Invalid slice: ${d}`);
        }
        let s = n.map(([u, d]) => d - u), o = s.reduce((u, d) => u * d), i = this.data, a = new i.constructor(o), l = this.stride(), c = !0;
        for (let u = 1; u < s.length; ++u)
          if (n[u][0] !== 0 || n[u][1] !== this.dims[u]) {
            c = !1;
            break;
          }
        if (c) {
          let u = n[0][0] * l[0], d = n[0][1] * l[0];
          if (ArrayBuffer.isView(i))
            a.set(i.subarray(u, d));
          else if (Array.isArray(i)) {
            let f = i.slice(u, d);
            for (let h = 0; h < f.length; ++h)
              a[h] = f[h];
          } else
            throw new Error("Unsupported data type for slicing");
        } else
          for (let u = 0; u < o; ++u) {
            let d = 0;
            for (let f = s.length - 1, h = u; f >= 0; --f) {
              let p = s[f];
              d += (h % p + n[f][0]) * l[f], h = Math.floor(h / p);
            }
            a[u] = i[d];
          }
        return new t(this.type, a, r);
      }
      /**
       * Return a permuted version of this Tensor, according to the provided dimensions.
       * @param  {...number} dims Dimensions to permute.
       * @returns {Tensor} The permuted tensor.
       */
      permute(...e) {
        return Sb(this, e);
      }
      // TODO: implement transpose. For now (backwards compatibility), it's just an alias for permute()
      /** @type {Tensor['permute']} */
      transpose(...e) {
        return this.permute(...e);
      }
      /**
       * Returns the sum of each row of the input tensor in the given dimension dim.
       *
       * @param {number|null} [dim=null] The dimension or dimensions to reduce. If `null`, all dimensions are reduced.
       * @param {boolean} keepdim Whether the output tensor has `dim` retained or not.
       * @returns The summed tensor
       */
      sum(e = null, r = !1) {
        return this.norm(1, e, r);
      }
      /**
       * Returns the matrix norm or vector norm of a given tensor.
       * @param {number|string} [p='fro'] The order of norm
       * @param {number|null} [dim=null] Specifies which dimension of the tensor to calculate the norm across.
       * If dim is None, the norm will be calculated across all dimensions of input.
       * @param {boolean} [keepdim=false] Whether the output tensors have dim retained or not.
       * @returns {Tensor} The norm of the tensor.
       */
      norm(e = "fro", r = null, n = !1) {
        if (e === "fro")
          e = 2;
        else if (typeof e == "string")
          throw Error(`Unsupported norm: ${e}`);
        let s = this.data, o = s instanceof BigInt64Array || s instanceof BigUint64Array;
        if (o && e !== 1)
          throw Error(`Expected a floating point tensor as input. Got ${this.type}`);
        let i, a;
        if (o ? (i = (d, f) => d + f, a = 0n) : (i = (d, f) => d + f ** e, a = 0), r === null) {
          let d = s.reduce(i, a);
          return e !== 1 && (d = d ** (1 / e)), new t(this.type, [d], []);
        }
        let [l, c, u] = qs(i, this, r, n);
        if (e !== 1)
          for (let d = 0; d < c.length; ++d)
            c[d] = c[d] ** (1 / e);
        return new t(l, c, u);
      }
      /**
       * Performs `L_p` normalization of inputs over specified dimension. Operates in place.
       * @param {number} [p=2] The exponent value in the norm formulation
       * @param {number} [dim=1] The dimension to reduce
       * @returns {Tensor} `this` for operation chaining.
       */
      normalize_(e = 2, r = 1) {
        r = Tt(r, this.dims.length);
        let n = this.norm(e, r, !0), s = this.data, o = n.data;
        for (let i = 0; i < s.length; ++i) {
          let a = 0;
          for (let l = this.dims.length - 1, c = i, u = 1; l >= 0; --l) {
            let d = this.dims[l];
            if (l !== r) {
              let f = c % d;
              a += f * u, u *= this.dims[l];
            }
            c = Math.floor(c / d);
          }
          s[i] /= o[a];
        }
        return this;
      }
      /**
       * Performs `L_p` normalization of inputs over specified dimension.
       * @param {number} [p=2] The exponent value in the norm formulation
       * @param {number} [dim=1] The dimension to reduce
       * @returns {Tensor} The normalized tensor.
       */
      normalize(e = 2, r = 1) {
        return this.clone().normalize_(e, r);
      }
      /**
       * Compute and return the stride of this tensor.
       * Stride is the jump necessary to go from one element to the next one in the specified dimension dim.
       * @returns {number[]} The stride of this tensor.
       */
      stride() {
        return Tl(this.dims);
      }
      /**
       * Returns a tensor with all specified dimensions of input of size 1 removed.
       *
       * NOTE: The returned tensor shares the storage with the input tensor, so changing the contents of one will change the contents of the other.
       * If you would like a copy, use `tensor.clone()` before squeezing.
       *
       * @param {number|number[]|null} [dim=null] If given, the input will be squeezed only in the specified dimensions.
       * @returns {Tensor} The squeezed tensor
       */
      squeeze(e = null) {
        return new t(this.type, this.data, $p(this.dims, e));
      }
      /**
       * In-place version of @see {@link Tensor.squeeze}
       * @param {number|number[]|null} [dim=null] If given, the input will be squeezed only in the specified dimensions.
       * @returns {Tensor} `this`, with the specified dimensions of size 1 removed.
       */
      squeeze_(e = null) {
        return this.dims = $p(this.dims, e), this;
      }
      /**
       * Returns a new tensor with a dimension of size one inserted at the specified position.
       *
       * NOTE: The returned tensor shares the same underlying data with this tensor.
       *
       * @param {number} dim The index at which to insert the singleton dimension
       * @returns {Tensor} The unsqueezed tensor
       */
      unsqueeze(e) {
        return new t(this.type, this.data, Np(this.dims, e));
      }
      /**
       * In-place version of @see {@link Tensor.unsqueeze}
       * @type {Tensor['unsqueeze']}
       */
      unsqueeze_(e) {
        return this.dims = Np(this.dims, e), this;
      }
      /**
       * In-place version of @see {@link Tensor.flatten}
       * @param {number} [start_dim=0] the first dim to flatten
       * @param {number} [end_dim=-1] the last dim to flatten
       * @returns {Tensor} `this`, flattened along the specified dimensions.
       */
      flatten_(e = 0, r = -1) {
        r = (r + this.dims.length) % this.dims.length;
        let n = this.dims.slice(0, e), s = this.dims.slice(e, r + 1), o = this.dims.slice(r + 1);
        return this.dims = [...n, s.reduce((i, a) => i * a, 1), ...o], this;
      }
      /**
       * Flattens input by reshaping it into a one-dimensional tensor.
       * If `start_dim` or `end_dim` are passed, only dimensions starting with `start_dim`
       * and ending with `end_dim` are flattened. The order of elements in input is unchanged.
       * @param {number} start_dim the first dim to flatten
       * @param {number} end_dim the last dim to flatten
       * @returns {Tensor} The flattened tensor.
       */
      flatten(e = 0, r = -1) {
        return this.clone().flatten_(e, r);
      }
      /**
       * Returns a new tensor with the same data as the `self` tensor but of a different `shape`.
       * @param  {...number} dims the desired size
       * @returns {Tensor} The tensor with the same data but different shape
       */
      view(...e) {
        let r = -1;
        for (let s = 0; s < e.length; ++s)
          if (e[s] === -1) {
            if (r !== -1)
              throw new Error("Only one dimension can be inferred");
            r = s;
          }
        let n = this.data;
        if (r !== -1) {
          let s = e.reduce((o, i, a) => a !== r ? o * i : o, 1);
          e[r] = n.length / s;
        }
        return new t(this.type, n, e);
      }
      /**
       * In-place version of @see {@link Tensor.neg}
       * @returns {Tensor} `this`, with every element negated.
       */
      neg_() {
        let e = this.data;
        for (let r = 0; r < e.length; ++r)
          e[r] = -e[r];
        return this;
      }
      /**
       * Returns a new tensor with the negative of the elements of this tensor.
       * @returns {Tensor} the output tensor.
       */
      neg() {
        return this.clone().neg_();
      }
      /**
       * Computes input > val element-wise.
       * @param {number} val The value to compare with.
       * @returns {Tensor} A boolean tensor that is `true` where input is greater than other and `false` elsewhere.
       */
      gt(e) {
        let r = new Uint8Array(this.data.length), n = this.data;
        for (let s = 0; s < n.length; ++s)
          r[s] = n[s] > e ? 1 : 0;
        return new t("bool", r, this.dims);
      }
      /**
       * Computes input < val element-wise.
       * @param {number} val The value to compare with.
       * @returns {Tensor} A boolean tensor that is `true` where input is less than other and `false` elsewhere.
       */
      lt(e) {
        let r = new Uint8Array(this.data.length), n = this.data;
        for (let s = 0; s < n.length; ++s)
          r[s] = n[s] < e ? 1 : 0;
        return new t("bool", r, this.dims);
      }
      /**
       * In-place version of @see {@link Tensor.clamp}
       * @type {Tensor['clamp']}
       */
      clamp_(e, r) {
        let n = this.data;
        for (let s = 0; s < n.length; ++s)
          n[s] = Math.min(Math.max(n[s], e), r);
        return this;
      }
      /**
       * Clamps all elements in input into the range [ min, max ]
       * @param {number} min lower-bound of the range to be clamped to
       * @param {number} max upper-bound of the range to be clamped to
       * @returns {Tensor} the output tensor.
       */
      clamp(e, r) {
        return this.clone().clamp_(e, r);
      }
      /**
       * In-place version of @see {@link Tensor.round}
       */
      round_() {
        let e = this.data;
        for (let r = 0; r < e.length; ++r)
          e[r] = Math.round(e[r]);
        return this;
      }
      /**
       * Rounds elements of input to the nearest integer.
       * @returns {Tensor} the output tensor.
       */
      round() {
        return this.clone().round_();
      }
      /**
       * Returns the mean value of each row of this tensor in the given dimension `dim`.
       * @param {number|null} [dim=null] the dimension to reduce. If `null`, the mean of all elements is computed.
       * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
       * @returns {Tensor} A new tensor with means taken along the specified dimension.
       */
      mean(e = null, r = !1) {
        return Cb(this, e, r);
      }
      /**
       * Returns the minimum value of each row of this tensor in the given dimension `dim`.
       * @param {number|null} [dim=null] the dimension to reduce. If `null`, the minimum of all elements is computed.
       * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
       * @returns {Tensor} A new tensor with minimum values taken along the specified dimension.
       */
      min(e = null, r = !1) {
        if (e === null) {
          let i = $n(this.data)[0];
          return new t(
            this.type,
            [i],
            [
              /* scalar */
            ]
          );
        }
        let [n, s, o] = qs((i, a) => Math.min(i, a), this, e, r, 1 / 0);
        return new t(n, s, o);
      }
      /**
       * Returns the maximum value of each row of this tensor in the given dimension `dim`.
       * @param {number|null} [dim=null] the dimension to reduce. If `null`, the maximum of all elements is computed.
       * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
       * @returns {Tensor} A new tensor with maximum values taken along the specified dimension.
       */
      max(e = null, r = !1) {
        if (e === null) {
          let i = Fe(this.data)[0];
          return new t(
            this.type,
            [i],
            [
              /* scalar */
            ]
          );
        }
        let [n, s, o] = qs((i, a) => Math.max(i, a), this, e, r, -1 / 0);
        return new t(n, s, o);
      }
      /**
       * Returns the index of the minimum value of all elements in this tensor.
       * @param {number|null} [dim=null] the dimension to reduce. Only `null` (reduce over all elements) is currently supported.
       * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
       * @returns {Tensor} An `int64` scalar tensor containing the index of the minimum value.
       * @throws {Error} If `dim` is not `null`.
       */
      argmin(e = null, r = !1) {
        if (e !== null)
          throw new Error("`dim !== null` not yet implemented.");
        let n = $n(this.data)[1];
        return new t("int64", [BigInt(n)], []);
      }
      /**
       * Returns the index of the maximum value of all elements in this tensor.
       * @param {number|null} [dim=null] the dimension to reduce. Only `null` (reduce over all elements) is currently supported.
       * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
       * @returns {Tensor} An `int64` scalar tensor containing the index of the maximum value.
       * @throws {Error} If `dim` is not `null`.
       */
      argmax(e = null, r = !1) {
        if (e !== null)
          throw new Error("`dim !== null` not yet implemented.");
        let n = Fe(this.data)[1];
        return new t("int64", [BigInt(n)], []);
      }
      /**
       * Repeats this tensor along the specified dimensions.
       * @param {...number} repeats The number of times to repeat this tensor along each dimension.
       * @returns {Tensor} The repeated tensor.
       * @throws {Error} If the number of repeats is less than the number of dimensions.
       */
      repeat(...e) {
        if (e.length < this.dims.length)
          throw new Error(
            `Number of dimensions of repeat dims (${e.length}) cannot be smaller than number of dimensions of tensor (${this.dims.length})`
          );
        if (e.every((u) => u === 1)) {
          if (e.length === this.dims.length)
            return this.clone();
          let u = e.length - this.dims.length, d = Array(u).fill(1).concat(this.dims);
          return new t(this.type, this.data.slice(), d);
        }
        let r = e.length - this.dims.length, n = Array(r).fill(1).concat(this.dims), s = n.map((u, d) => u * e[d]), o = s.reduce((u, d) => u * d, 1), i = this.data, a = new i.constructor(o), l = Tl(n), c = Tl(s);
        for (let u = 0; u < o; ++u) {
          let d = u, f = 0;
          for (let h = 0; h < s.length; ++h) {
            let p = Math.floor(d / c[h]);
            d = d % c[h];
            let m = p % n[h];
            f += m * l[h];
          }
          a[u] = i[f];
        }
        return new t(this.type, a, s);
      }
      /**
       * Constructs a tensor by repeating the elements of input. The dims argument specifies the number of repetitions in each dimension.
       * @param  {...number} dims The number of repetitions per dimension.
       * @returns {Tensor} The tiled tensor.
       */
      tile(...e) {
        if (e.length < this.dims.length) {
          let r = this.dims.length - e.length;
          e = Array(r).fill(1).concat(e);
        }
        return this.repeat(...e);
      }
      /**
       * Performs Tensor dtype conversion.
       * @param {DataType} type The desired data type.
       * @returns {Tensor} The converted tensor.
       */
      to(e) {
        if (this.type === e) return this;
        if (!Un.hasOwnProperty(e))
          throw new Error(`Unsupported type: ${e}`);
        let r, n = ["int64", "uint64"].includes(this.type), s = ["int64", "uint64"].includes(e);
        if (n && !s)
          r = Number;
        else if (!n && s)
          ["float16", "float32", "float64"].includes(this.type) ? r = (o) => BigInt(Math.floor(o)) : r = BigInt;
        else if (this.type === "float16" && e == "float32" && this.data instanceof Uint16Array)
          return new t(e, Gh(this.data), this.dims);
        return new t(
          e,
          // @ts-ignore - TypeScript can't verify .from() across union of TypedArray constructors
          Un[e].from(this.data, r),
          this.dims
        );
      }
    };
    Gs = (t) => new W("int64", t, [t.length]);
  });

  // browser-node-stub:node:stream
  var Bp, Up = b(() => {
    Bp = {};
  });

  // browser-node-stub:node:stream/promises
  var Fp, jp = b(() => {
    Fp = void 0;
  });

  // node_modules/@huggingface/transformers/src/utils/io.js
  async function Wp(t, e) {
    if (q.IS_BROWSER_ENV) {
      if (q.IS_WEBWORKER_ENV)
        throw new Error("Unable to save a file from a Web Worker.");
      let r = URL.createObjectURL(e), n = document.createElement("a");
      n.href = r, n.download = t, n.click(), n.remove(), URL.revokeObjectURL(r);
    } else if (q.IS_FS_AVAILABLE) {
      let r = e.stream(), n = Bp.fromWeb(r), s = Ae.createWriteStream(t);
      await Fp(n, s);
    } else
      throw new Error("Unable to save because filesystem is disabled in this environment.");
  }
  var Vp = b(() => {
    In();
    Up();
    jp();
    Ie();
  });

  // browser-sharp-stub:sharp
  var Ys, Gp = b(() => {
    Ys = void 0;
  });

  // node_modules/@huggingface/transformers/src/utils/image.js
  var ur, qp, zt, Mb, Ob, Bt, PS, Xs = b(() => {
    st();
    mt();
    Ie();
    we();
    Vp();
    Gp();
    Me();
    if (q.IS_WEB_ENV)
      ur = (t, e) => {
        if (!self.OffscreenCanvas)
          throw new Error("OffscreenCanvas not supported by this environment.");
        return new self.OffscreenCanvas(t, e);
      }, zt = self.createImageBitmap, qp = self.ImageData;
    else if (Ys)
      zt = async (t) => {
        let r = (await t.metadata()).channels, { data: n, info: s } = await t.rotate().raw().toBuffer({ resolveWithObject: !0 }), o = new Bt(new Uint8ClampedArray(n), s.width, s.height, s.channels);
        return r !== void 0 && r !== s.channels && o.convert(r), o;
      };
    else
      throw new Error("Unable to load image processing library.");
    Mb = {
      0: "nearest",
      1: "lanczos",
      2: "bilinear",
      3: "bicubic",
      4: "box",
      5: "hamming"
    }, Ob = /* @__PURE__ */ new Map([
      ["png", "image/png"],
      ["jpg", "image/jpeg"],
      ["jpeg", "image/jpeg"],
      ["gif", "image/gif"]
    ]), Bt = class t {
      /**
       * Create a new `RawImage` object.
       * @param {Uint8ClampedArray|Uint8Array} data The pixel data.
       * @param {number} width The width of the image.
       * @param {number} height The height of the image.
       * @param {1|2|3|4} channels The number of channels.
       */
      constructor(e, r, n, s) {
        this.data = e, this.width = r, this.height = n, this.channels = s;
      }
      /**
       * Returns the size of the image (width, height).
       * @returns {[number, number]} The size of the image (width, height).
       */
      get size() {
        return [this.width, this.height];
      }
      /**
       * Helper method for reading an image from a variety of input types.
       * @param {RawImage|string|URL|Blob|HTMLCanvasElement|OffscreenCanvas} input
       * @returns {Promise<RawImage>} The image object.
       *
       * **Example:** Read image from a URL.
       * ```javascript
       * let image = await RawImage.read('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/football-match.jpg');
       * // RawImage {
       * //   "data": Uint8ClampedArray [ 25, 25, 25, 19, 19, 19, ... ],
       * //   "width": 800,
       * //   "height": 533,
       * //   "channels": 3
       * // }
       * ```
       */
      static async read(e) {
        if (e instanceof t)
          return e;
        if (typeof e == "string" || e instanceof URL)
          return await this.fromURL(e);
        if (e instanceof Blob)
          return await this.fromBlob(e);
        if (typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas)
          return this.fromCanvas(e);
        throw new Error(`Unsupported input type: ${typeof e}`);
      }
      /**
       * Read an image from a canvas.
       * @param {HTMLCanvasElement|OffscreenCanvas} canvas The canvas to read the image from.
       * @returns {RawImage} The image object.
       */
      static fromCanvas(e) {
        if (!q.IS_WEB_ENV)
          throw new Error("fromCanvas() is only supported in browser environments.");
        let n = /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */ e.getContext("2d").getImageData(0, 0, e.width, e.height).data;
        return new t(n, e.width, e.height, 4);
      }
      /**
       * Read an image from a URL or file path.
       * @param {string|URL} url The URL or file path to read the image from.
       * @returns {Promise<RawImage>} The image object.
       */
      static async fromURL(e) {
        let r = await Wr(e);
        if (r.status !== 200)
          throw new Error(`Unable to read image from "${e}" (${r.status} ${r.statusText})`);
        let n = await r.blob();
        return this.fromBlob(n);
      }
      /**
       * Helper method to create a new Image from a blob.
       * @param {Blob} blob The blob to read the image from.
       * @returns {Promise<RawImage>} The image object.
       */
      static async fromBlob(e) {
        if (q.IS_WEB_ENV) {
          let r = await zt(e), n = ur(r.width, r.height).getContext("2d");
          return n.drawImage(r, 0, 0), new this(n.getImageData(0, 0, r.width, r.height).data, r.width, r.height, 4);
        } else {
          let r = Ys(await e.arrayBuffer());
          return await zt(r);
        }
      }
      /**
       * Helper method to create a new Image from a tensor
       * @param {Tensor} tensor The 3D tensor containing the image data. Must be of type `uint8`.
       * @param {'CHW'|'HWC'} [channel_format='CHW'] The dimension ordering of the tensor.
       * @returns {RawImage} The image created from the tensor.
       * @throws {Error} If the tensor does not have 3 dimensions, or the channel format,
       * tensor type, or number of channels is unsupported.
       */
      static fromTensor(e, r = "CHW") {
        if (e.dims.length !== 3)
          throw new Error(`Tensor should have 3 dimensions, but has ${e.dims.length} dimensions.`);
        if (r === "CHW")
          e = e.permute(1, 2, 0);
        else if (r !== "HWC")
          throw new Error(`Unsupported channel format: ${r}`);
        if (!(e.data instanceof Uint8ClampedArray || e.data instanceof Uint8Array))
          throw new Error(`Unsupported tensor type: ${e.type}`);
        switch (e.dims[2]) {
          case 1:
          case 2:
          case 3:
          case 4:
            return new t(e.data, e.dims[1], e.dims[0], e.dims[2]);
          default:
            throw new Error(`Unsupported number of channels: ${e.dims[2]}`);
        }
      }
      /**
       * Convert the image to grayscale format.
       * @returns {RawImage} `this` to support chaining.
       */
      grayscale() {
        if (this.channels === 1)
          return this;
        let e = new Uint8ClampedArray(this.width * this.height * 1);
        switch (this.channels) {
          case 3:
          // rgb to grayscale
          case 4:
            for (let r = 0, n = 0; r < this.data.length; r += this.channels) {
              let s = this.data[r], o = this.data[r + 1], i = this.data[r + 2];
              e[n++] = Math.round(0.2989 * s + 0.587 * o + 0.114 * i);
            }
            break;
          default:
            throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this._update(e, this.width, this.height, 1);
      }
      /**
       * Convert the image to RGB format.
       * @returns {RawImage} `this` to support chaining.
       */
      rgb() {
        if (this.channels === 3)
          return this;
        let e = new Uint8ClampedArray(this.width * this.height * 3);
        switch (this.channels) {
          case 1:
            for (let r = 0, n = 0; r < this.data.length; ++r)
              e[n++] = this.data[r], e[n++] = this.data[r], e[n++] = this.data[r];
            break;
          case 4:
            for (let r = 0, n = 0; r < this.data.length; r += 4)
              e[n++] = this.data[r], e[n++] = this.data[r + 1], e[n++] = this.data[r + 2];
            break;
          default:
            throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this._update(e, this.width, this.height, 3);
      }
      /**
       * Convert the image to RGBA format.
       * @returns {RawImage} `this` to support chaining.
       */
      rgba() {
        if (this.channels === 4)
          return this;
        let e = new Uint8ClampedArray(this.width * this.height * 4);
        switch (this.channels) {
          case 1:
            for (let r = 0, n = 0; r < this.data.length; ++r)
              e[n++] = this.data[r], e[n++] = this.data[r], e[n++] = this.data[r], e[n++] = 255;
            break;
          case 3:
            for (let r = 0, n = 0; r < this.data.length; r += 3)
              e[n++] = this.data[r], e[n++] = this.data[r + 1], e[n++] = this.data[r + 2], e[n++] = 255;
            break;
          default:
            throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this._update(e, this.width, this.height, 4);
      }
      /**
       * Apply an alpha mask to the image. Operates in place.
       * @param {RawImage} mask The mask to apply. It should have a single channel.
       * @returns {RawImage} The masked image.
       * @throws {Error} If the mask is not the same size as the image.
       * @throws {Error} If the image does not have 4 channels.
       * @throws {Error} If the mask is not a single channel.
       */
      putAlpha(e) {
        if (e.width !== this.width || e.height !== this.height)
          throw new Error(
            `Expected mask size to be ${this.width}x${this.height}, but got ${e.width}x${e.height}`
          );
        if (e.channels !== 1)
          throw new Error(`Expected mask to have 1 channel, but got ${e.channels}`);
        let r = this.data, n = e.data, s = this.width * this.height;
        if (this.channels === 3) {
          let o = new Uint8ClampedArray(s * 4);
          for (let i = 0, a = 0, l = 0; i < s; ++i)
            o[l++] = r[a++], o[l++] = r[a++], o[l++] = r[a++], o[l++] = n[i];
          return this._update(o, this.width, this.height, 4);
        } else if (this.channels === 4) {
          for (let o = 0; o < s; ++o)
            r[4 * o + 3] = n[o];
          return this;
        }
        throw new Error(`Expected image to have 3 or 4 channels, but got ${this.channels}`);
      }
      /**
       * Resize the image to the given dimensions. This method uses the canvas API to perform the resizing.
       * @param {number} width The width of the new image. `null` or `-1` will preserve the aspect ratio.
       * @param {number} height The height of the new image. `null` or `-1` will preserve the aspect ratio.
       * @param {Object} options Additional options for resizing.
       * @param {0|1|2|3|4|5|string} [options.resample] The resampling method to use.
       * @returns {Promise<RawImage>} `this` to support chaining.
       */
      async resize(e, r, { resample: n = 2 } = {}) {
        if (this.width === e && this.height === r)
          return this;
        let s = Mb[n] ?? n, o = nl(e), i = nl(r);
        if (o && i)
          return this;
        if (o ? e = r / this.height * this.width : i && (r = e / this.width * this.height), q.IS_WEB_ENV) {
          let a = this.channels, l = this.toCanvas(), c = ur(e, r).getContext("2d");
          return c.drawImage(l, 0, 0, e, r), new t(c.getImageData(0, 0, e, r).data, e, r, 4).convert(a);
        } else {
          let a = this.toSharp();
          switch (s) {
            case "box":
            case "hamming":
              (s === "box" || s === "hamming") && (Q.warn(
                `Resampling method ${s} is not yet supported. Using bilinear instead.`
              ), s = "bilinear");
            case "nearest":
            case "bilinear":
            case "bicubic":
              a = a.affine([e / this.width, 0, 0, r / this.height], {
                interpolator: s
              });
              break;
            case "lanczos":
              a = a.resize({
                width: e,
                height: r,
                fit: "fill",
                kernel: "lanczos3"
                // PIL Lanczos uses a kernel size of 3
              });
              break;
            default:
              throw new Error(`Resampling method ${s} is not supported.`);
          }
          return await zt(a);
        }
      }
      async pad([e, r, n, s]) {
        if (e = Math.max(e, 0), r = Math.max(r, 0), n = Math.max(n, 0), s = Math.max(s, 0), e === 0 && r === 0 && n === 0 && s === 0)
          return this;
        if (q.IS_WEB_ENV) {
          let o = this.channels, i = this.toCanvas(), a = this.width + e + r, l = this.height + n + s, c = ur(a, l).getContext("2d");
          return c.drawImage(i, 0, 0, this.width, this.height, e, n, this.width, this.height), new t(c.getImageData(0, 0, a, l).data, a, l, 4).convert(o);
        } else {
          let o = this.toSharp().extend({ left: e, right: r, top: n, bottom: s });
          return await zt(o);
        }
      }
      async crop([e, r, n, s]) {
        if (e = Math.max(e, 0), r = Math.max(r, 0), n = Math.min(n, this.width - 1), s = Math.min(s, this.height - 1), e === 0 && r === 0 && n === this.width - 1 && s === this.height - 1)
          return this;
        let o = n - e + 1, i = s - r + 1;
        if (q.IS_WEB_ENV) {
          let a = this.channels, l = this.toCanvas(), c = ur(o, i).getContext("2d");
          return c.drawImage(l, e, r, o, i, 0, 0, o, i), new t(
            c.getImageData(0, 0, o, i).data,
            o,
            i,
            4
          ).convert(a);
        } else {
          let a = this.toSharp().extract({
            left: e,
            top: r,
            width: o,
            height: i
          });
          return await zt(a);
        }
      }
      async center_crop(e, r) {
        if (this.width === e && this.height === r)
          return this;
        let n = (this.width - e) / 2, s = (this.height - r) / 2;
        if (q.IS_WEB_ENV) {
          let o = this.channels, i = this.toCanvas(), a = ur(e, r).getContext("2d"), l = 0, c = 0, u = 0, d = 0;
          return n >= 0 ? l = n : u = -n, s >= 0 ? c = s : d = -s, a.drawImage(i, l, c, e, r, u, d, e, r), new t(
            a.getImageData(0, 0, e, r).data,
            e,
            r,
            4
          ).convert(o);
        } else {
          let o = this.toSharp();
          if (n >= 0 && s >= 0)
            o = o.extract({
              left: Math.floor(n),
              top: Math.floor(s),
              width: e,
              height: r
            });
          else if (n <= 0 && s <= 0) {
            let i = Math.floor(-s), a = Math.floor(-n);
            o = o.extend({
              top: i,
              left: a,
              // Ensures the resulting image has the desired dimensions
              right: e - this.width - a,
              bottom: r - this.height - i
            });
          } else {
            let i = [0, 0], a = 0;
            s < 0 ? (i[0] = Math.floor(-s), i[1] = r - this.height - i[0]) : a = Math.floor(s);
            let l = [0, 0], c = 0;
            n < 0 ? (l[0] = Math.floor(-n), l[1] = e - this.width - l[0]) : c = Math.floor(n), o = o.extend({
              top: i[0],
              bottom: i[1],
              left: l[0],
              right: l[1]
            }).extract({
              left: c,
              top: a,
              width: e,
              height: r
            });
          }
          return await zt(o);
        }
      }
      async toBlob(e = "image/png", r = 1) {
        if (!q.IS_WEB_ENV)
          throw new Error("toBlob() is only supported in browser environments.");
        return await this.toCanvas().convertToBlob({ type: e, quality: r });
      }
      toTensor(e = "CHW") {
        let r = new W("uint8", new Uint8Array(this.data), [this.height, this.width, this.channels]);
        if (e !== "HWC")
          if (e === "CHW")
            r = r.permute(2, 0, 1);
          else
            throw new Error(`Unsupported channel format: ${e}`);
        return r;
      }
      toCanvas() {
        if (!q.IS_WEB_ENV)
          throw new Error("toCanvas() is only supported in browser environments.");
        let e = this.clone().rgba(), r = ur(e.width, e.height), n = new qp(e.data, e.width, e.height);
        return r.getContext("2d").putImageData(n, 0, 0), r;
      }
      /**
       * Split this image into individual bands. This method returns an array of individual image bands from an image.
       * For example, splitting an "RGB" image creates three new images each containing a copy of one of the original bands (red, green, blue).
       *
       * Inspired by PIL's `Image.split()` [function](https://pillow.readthedocs.io/en/latest/reference/Image.html#PIL.Image.Image.split).
       * @returns {RawImage[]} An array containing bands.
       */
      split() {
        let { data: e, width: r, height: n, channels: s } = this, o = (
          /** @type {any} */
          e.constructor
        ), i = e.length / s, a = Array.from({ length: s }, () => new o(i));
        for (let l = 0; l < i; ++l) {
          let c = s * l;
          for (let u = 0; u < s; ++u)
            a[u][l] = e[c + u];
        }
        return a.map((l) => new t(l, r, n, 1));
      }
      /**
       * Helper method to update the image data.
       * @param {Uint8ClampedArray} data The new image data.
       * @param {number} width The new width of the image.
       * @param {number} height The new height of the image.
       * @param {1|2|3|4|null} [channels] The new number of channels of the image.
       * @private
       */
      _update(e, r, n, s = null) {
        return this.data = e, this.width = r, this.height = n, s !== null && (this.channels = s), this;
      }
      /**
       * Clone the image
       * @returns {RawImage} The cloned image
       */
      clone() {
        return new t(this.data.slice(), this.width, this.height, this.channels);
      }
      /**
       * Helper method for converting image to have a certain number of channels
       * @param {number} numChannels The number of channels. Must be 1, 3, or 4.
       * @returns {RawImage} `this` to support chaining.
       */
      convert(e) {
        if (this.channels === e) return this;
        switch (e) {
          case 1:
            this.grayscale();
            break;
          case 3:
            this.rgb();
            break;
          case 4:
            this.rgba();
            break;
          default:
            throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this;
      }
      /**
       * Save the image to the given path.
       * @param {string} path The path to save the image to.
       * @returns {Promise<void>}
       */
      async save(e) {
        if (q.IS_WEB_ENV) {
          if (q.IS_WEBWORKER_ENV)
            throw new Error("Unable to save an image from a Web Worker.");
          let r = e.split(".").pop().toLowerCase(), n = Ob.get(r) ?? "image/png", s = await this.toBlob(n);
          return Wp(e, s);
        } else if (q.IS_FS_AVAILABLE)
          await this.toSharp().toFile(e);
        else
          throw new Error("Unable to save the image because filesystem is disabled in this environment.");
      }
      /**
       * Convert the image to a Sharp instance.
       * @returns {import('sharp').Sharp} The Sharp instance.
       */
      toSharp() {
        if (q.IS_WEB_ENV)
          throw new Error("toSharp() is only supported in server-side environments.");
        return Ys(this.data, {
          raw: {
            width: this.width,
            height: this.height,
            channels: this.channels
          }
        });
      }
    }, PS = Bt.read.bind(Bt);
  });

  // node_modules/@huggingface/transformers/src/utils/constants.js
  var Hr, Ks, Hp, Yp, Yr = b(() => {
    Hr = "https://github.com/huggingface/transformers.js/issues/new/choose", Ks = "preprocessor_config.json", Hp = "processor_config.json", Yp = "chat_template.jinja";
  });

  // node_modules/@huggingface/transformers/src/processing_utils.js
  var Js, Xp = b(() => {
    Yr();
    ft();
    mt();
    Js = class extends ye {
      static classes = ["image_processor_class", "tokenizer_class", "feature_extractor_class"];
      static uses_processor_config = !1;
      static uses_chat_template_file = !1;
      /**
       * Create a processor from parsed config and its component preprocessors.
       * @param {Object} config Processor configuration.
       * @param {Record<string, Object>} components Loaded tokenizer, image processor, and/or feature extractor.
       * @param {string|null} chat_template Optional chat template loaded from the model repo.
       */
      constructor(e, r, n) {
        super(), this.config = e, this.components = r, this.chat_template = n;
      }
      /**
       * The image processor used by this processor, if any.
       * @returns {import('./image_processors_utils.js').ImageProcessor|undefined} The image processor of the processor, if it exists.
       */
      get image_processor() {
        return this.components.image_processor;
      }
      /**
       * The tokenizer used by this processor, if any.
       * @returns {PreTrainedTokenizer|undefined} The tokenizer of the processor, if it exists.
       */
      get tokenizer() {
        return this.components.tokenizer;
      }
      /**
       * The feature extractor used by this processor, if any.
       * @returns {import('./feature_extraction_utils.js').FeatureExtractor|undefined} The feature extractor of the processor, if it exists.
       */
      get feature_extractor() {
        return this.components.feature_extractor;
      }
      /**
       * Delegates to the underlying tokenizer's `apply_chat_template`.
       * @param {Parameters<PreTrainedTokenizer['apply_chat_template']>[0]} messages
       * @param {Parameters<PreTrainedTokenizer['apply_chat_template']>[1]} options
       * @returns {ReturnType<PreTrainedTokenizer['apply_chat_template']>}
       */
      apply_chat_template(e, r = {}) {
        if (!this.tokenizer)
          throw new Error("Unable to apply chat template without a tokenizer.");
        return this.tokenizer.apply_chat_template(e, {
          tokenize: !1,
          // default to false
          chat_template: this.chat_template ?? void 0,
          ...r
        });
      }
      /**
       * Decode a batch of tokenized sequences via the underlying tokenizer.
       * @param {Parameters<PreTrainedTokenizer['batch_decode']>} args
       * @returns {ReturnType<PreTrainedTokenizer['batch_decode']>}
       */
      batch_decode(...e) {
        if (!this.tokenizer)
          throw new Error("Unable to decode without a tokenizer.");
        return this.tokenizer.batch_decode(...e);
      }
      /**
       * Decode a single tokenized sequence via the underlying tokenizer.
       * @param {Parameters<PreTrainedTokenizer['decode']>} args
       * @returns {ReturnType<PreTrainedTokenizer['decode']>}
       */
      decode(...e) {
        if (!this.tokenizer)
          throw new Error("Unable to decode without a tokenizer.");
        return this.tokenizer.decode(...e);
      }
      /**
       * Calls the feature_extractor function with the given input.
       * @param {any} input The input to extract features from.
       * @param {...any} args Additional arguments.
       * @returns {Promise<any>} A Promise that resolves with the extracted features.
       */
      async _call(e, ...r) {
        for (let n of [this.image_processor, this.feature_extractor, this.tokenizer])
          if (n)
            return n(e, ...r);
        throw new Error("No image processor, feature extractor, or tokenizer found.");
      }
      /**
       * Instantiate one of the processor classes of the library from a pretrained model.
       *
       * The processor class to instantiate is selected based on the `image_processor_type` (or `feature_extractor_type`; legacy)
       * property of the config object (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
       *
       * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
       * - A string, the *model ID* of a pretrained processor hosted inside a model repo on huggingface.co.
       *   Valid model IDs can be located at the root level, like `bert-base-uncased`, or namespaced under a
       *   user or organization name, like `dbmdz/bert-base-german-cased`.
       * - A path to a *directory* containing processor files, e.g., `./my_model_directory/`.
       * @param {PretrainedProcessorOptions} options Additional options for loading the processor.
       *
       * @returns {Promise<Processor>} A new processor instance.
       */
      static async from_pretrained(e, r = {}) {
        let [n, s, o] = await Promise.all([
          // TODO:
          this.uses_processor_config ? Ke(e, Hp, !0, r) : {},
          Promise.all(
            this.classes.filter((i) => i in this).map(async (i) => {
              let a = await this[i].from_pretrained(e, r);
              return [i.replace(/_class$/, ""), a];
            })
          ).then(Object.fromEntries),
          this.uses_chat_template_file ? gl(e, Yp, !0, r) : null
        ]);
        return new this(n, s, o);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/image_processors_utils.js
  function Kp(t, e, r = 0, n = null) {
    let s = t / e, o = Vh(s) * e;
    return n !== null && o > n && (o = Math.floor(s) * e), o < r && (o = Math.ceil(s) * e), o;
  }
  function Jp([t, e], r) {
    return [Math.max(Math.floor(t / r), 1) * r, Math.max(Math.floor(e / r), 1) * r];
  }
  function Pb([t, e, r, n]) {
    return [t - r / 2, e - n / 2, t + r / 2, e + n / 2];
  }
  function Ut(t, e = 0.5, r = null, n = !1) {
    let s = t.logits, o = t.pred_boxes, [i, a, l] = s.dims;
    if (r !== null && r.length !== i)
      throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
    let c = [];
    for (let u = 0; u < i; ++u) {
      let d = r !== null ? r[u] : null, f = {
        boxes: [],
        classes: [],
        scores: []
      }, h = s[u], p = o[u];
      for (let m = 0; m < a; ++m) {
        let _ = h[m], g = [], w;
        if (n) {
          w = _.sigmoid().data;
          for (let y = 0; y < w.length; ++y)
            w[y] > e && g.push(y);
        } else {
          let y = Fe(_.data)[1];
          if (y === l - 1 || (w = Vr(_.data), w[y] < e))
            continue;
          g.push(y);
        }
        for (let y of g) {
          let v = p[m].data;
          v = Pb(v), d !== null && (v = v.map((k, C) => k * d[(C + 1) % 2])), f.boxes.push(v), f.classes.push(y), f.scores.push(w[y]);
        }
      }
      c.push(f);
    }
    return c;
  }
  function Zs(t, e = null) {
    let r = t.logits, n = r.dims[0];
    if (e !== null && e.length !== n)
      throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
    let s = [];
    for (let o = 0; o < n; ++o) {
      let i = e !== null ? e[o] : null, a = r[o];
      i !== null && (a = Sl(a, i, "bilinear", !1));
      let [l, c] = i ?? a.dims.slice(-2), u = new W("int32", new Int32Array(l * c), [l, c]), d = a[0].data, f = u.data;
      for (let m = 1; m < a.dims[0]; ++m) {
        let _ = a[m].data;
        for (let g = 0; g < _.length; ++g)
          _[g] > d[g] && (d[g] = _[g], f[g] = m);
      }
      let h = new Array(a.dims[0]);
      for (let m = 0; m < f.length; ++m) {
        let _ = f[m];
        h[_] = _;
      }
      let p = h.filter((m) => m !== void 0);
      s.push({ segmentation: u, labels: p });
    }
    return s;
  }
  function Lb(t, e, r, n) {
    let s = [], o = [], i = [];
    for (let a = 0; a < t.dims[0]; ++a) {
      let l = t[a], c = e[a], u = Fe(l.data)[1];
      if (u === n)
        continue;
      let f = Vr(l.data)[u];
      f > r && (s.push(c), o.push(f), i.push(u));
    }
    return [s, o, i];
  }
  function Rb(t, e, r, n = 0.5, s = 0.8) {
    let o = [], i = 0, a = 0, l = e[r].data;
    for (let u = 0; u < t.length; ++u)
      t[u] === r && (o.push(u), ++i), l[u] >= n && ++a;
    let c = i > 0 && a > 0;
    return c && (c = i / a > s), [c, o];
  }
  function $b(t, e, r, n, s, o = null, i = null) {
    let [a, l] = i ?? t[0].dims, c = new W("int32", new Int32Array(a * l), [a, l]), u = [];
    if (i !== null)
      for (let m = 0; m < t.length; ++m)
        t[m] = Sl(t[m], i, "bilinear", !1);
    let d = new Int32Array(t[0].data.length), f = new Float32Array(t[0].data.length);
    for (let m = 0; m < t.length; ++m) {
      let _ = e[m], g = t[m].data;
      for (let w = 0; w < g.length; ++w)
        g[w] *= _, g[w] > f[w] && (d[w] = m, f[w] = g[w]);
    }
    let h = 0, p = c.data;
    for (let m = 0; m < r.length; ++m) {
      let _ = r[m], [g, w] = Rb(
        d,
        t,
        m,
        n,
        s
      );
      if (g) {
        ++h;
        for (let y of w)
          p[y] = h;
        u.push({
          id: h,
          label_id: _,
          // was_fused: should_fuse, TODO
          score: e[m]
        });
      }
    }
    return [c, u];
  }
  function Xr(t, e, r = 28, n = 3136, s = 784 * 1280, o = 1) {
    if (t < r || e < r) {
      let l = Math.max(r / t, r / e);
      t = Math.round(t * l), e = Math.round(e * l);
    }
    if (Math.max(t, e) / Math.min(t, e) > 200)
      throw new Error(
        `absolute aspect ratio must be smaller than 200, got ${Math.max(t, e) / Math.min(t, e)}`
      );
    let i = Math.round(t / r) * r, a = Math.round(e / r) * r;
    if (o * i * a > s) {
      let l = Math.sqrt(o * t * e / s);
      i = Math.max(r, Math.floor(t / l / r) * r), a = Math.max(r, Math.floor(e / l / r) * r);
    } else if (o * i * a < n) {
      let l = Math.sqrt(n / (o * t * e));
      i = Math.ceil(t * l / r) * r, a = Math.ceil(e * l / r) * r;
    }
    return [a, i];
  }
  function Qs(t, e = 0.5, r = 0.5, n = 0.8, s = null, o = null) {
    s === null && (Q.warn("`label_ids_to_fuse` unset. No instance will be fused."), s = /* @__PURE__ */ new Set());
    let i = t.class_queries_logits ?? t.logits, l = (t.masks_queries_logits ?? t.pred_masks).sigmoid(), [c, u, d] = i.dims;
    if (d -= 1, o !== null && o.length !== c)
      throw Error("Make sure that you pass in as many target sizes as the batch dimension of the logits");
    let f = [];
    for (let h = 0; h < c; ++h) {
      let p = o !== null ? o[h] : null, m = i[h], _ = l[h], [g, w, y] = Lb(
        m,
        _,
        e,
        d
      );
      if (y.length === 0) {
        let [C, x] = p ?? _.dims.slice(-2), E = new W("int32", new Int32Array(C * x).fill(-1), [C, x]);
        f.push({
          segmentation: E,
          segments_info: []
        });
        continue;
      }
      let [v, k] = $b(
        g,
        w,
        y,
        r,
        n,
        s,
        p
      );
      f.push({
        segmentation: v,
        segments_info: k
      });
    }
    return f;
  }
  function eo(t, e = 0.5, r = null) {
    throw new Error("`post_process_instance_segmentation` is not yet implemented.");
  }
  var N, J = b(() => {
    ft();
    we();
    ar();
    Xs();
    st();
    mt();
    Yr();
    Me();
    N = class extends ye {
      /**
       * Create an image processor from a parsed `preprocessor_config.json`.
       * @param {ImageProcessorConfig} config The configuration object.
       */
      constructor(e) {
        super(), this.image_mean = e.image_mean ?? e.mean, this.image_std = e.image_std ?? e.std, this.resample = e.resample ?? 2, this.do_rescale = e.do_rescale ?? !0, this.rescale_factor = e.rescale_factor ?? 1 / 255, this.do_normalize = e.do_normalize, this.do_thumbnail = e.do_thumbnail, this.size = e.size ?? e.image_size, this.do_resize = e.do_resize ?? this.size !== void 0, this.size_divisibility = e.size_divisibility ?? e.size_divisor, this.do_center_crop = e.do_center_crop, this.crop_size = e.crop_size, this.do_convert_rgb = e.do_convert_rgb ?? !0, this.do_crop_margin = e.do_crop_margin, this.pad_size = e.pad_size, this.do_pad = e.do_pad, this.min_pixels = e.min_pixels, this.max_pixels = e.max_pixels, this.do_pad && !this.pad_size && !this.size_divisibility && this.size && this.size.width !== void 0 && this.size.height !== void 0 && (this.pad_size = this.size), this.do_flip_channel_order = e.do_flip_channel_order ?? !1, this.config = e;
      }
      /**
       * Resize the image to make a thumbnail. The image is resized so that no dimension is larger than any
       * corresponding dimension of the specified size.
       * @param {RawImage} image The image to be resized.
       * @param {{height:number, width:number}} size The size `{"height": h, "width": w}` to resize the image to.
       * @param {string | 0 | 1 | 2 | 3 | 4 | 5} [resample=2] The resampling filter to use.
       * @returns {Promise<RawImage>} The resized image.
       */
      async thumbnail(e, r, n = 2) {
        let s = e.height, o = e.width, i = r.height, a = r.width, l = Math.min(s, i), c = Math.min(o, a);
        return l === s && c === o ? e : (s > o ? c = Math.floor(o * l / s) : o > s && (l = Math.floor(s * c / o)), await e.resize(c, l, { resample: n }));
      }
      /**
       * Crops the margin of the image. Gray pixels are considered margin (i.e., pixels with a value below the threshold).
       * @param {RawImage} image The image to be cropped.
       * @param {number} gray_threshold Value below which pixels are considered to be gray.
       * @returns {Promise<RawImage>} The cropped image.
       */
      async crop_margin(e, r = 200) {
        let n = e.clone().grayscale(), s = $n(n.data)[0], i = Fe(n.data)[0] - s;
        if (i === 0)
          return e;
        let a = r / 255, l = n.width, c = n.height, u = 0, d = 0, f = n.data;
        for (let h = 0; h < n.height; ++h) {
          let p = h * n.width;
          for (let m = 0; m < n.width; ++m)
            (f[p + m] - s) / i < a && (l = Math.min(l, m), c = Math.min(c, h), u = Math.max(u, m), d = Math.max(d, h));
        }
        return e = await e.crop([l, c, u, d]), e;
      }
      /**
       * Pad the image by a certain amount.
       * @param {Float32Array} pixelData The pixel data to pad.
       * @param {number[]} imgDims The dimensions of the image (height, width, channels).
       * @param {{width:number; height:number}|number|'square'} padSize The dimensions of the padded image.
       * @param {Object} options The options for padding.
       * @param {'constant'|'symmetric'} [options.mode='constant'] The type of padding to add.
       * @param {boolean} [options.center=false] Whether to center the image.
       * @param {number|number[]} [options.constant_values=0] The constant value to use for padding.
       * @returns {[Float32Array, number[]]} The padded pixel data and image dimensions.
       */
      pad_image(e, r, n, { mode: s = "constant", center: o = !1, constant_values: i = 0 } = {}) {
        let [a, l, c] = r, u, d;
        if (typeof n == "number" ? (u = n, d = n) : n === "square" ? u = d = Math.max(a, l) : (u = n.width, d = n.height), u !== l || d !== a) {
          let f = new Float32Array(u * d * c);
          if (Array.isArray(i))
            for (let m = 0; m < f.length; ++m)
              f[m] = i[m % c];
          else i !== 0 && f.fill(i);
          let [h, p] = o ? [Math.floor((u - l) / 2), Math.floor((d - a) / 2)] : [0, 0];
          for (let m = 0; m < a; ++m) {
            let _ = (m + p) * u, g = m * l;
            for (let w = 0; w < l; ++w) {
              let y = (_ + w + h) * c, v = (g + w) * c;
              for (let k = 0; k < c; ++k)
                f[y + k] = e[v + k];
            }
          }
          if (s === "symmetric") {
            if (o)
              throw new Error("`center` padding is not supported when `mode` is set to `symmetric`.");
            let m = a - 1, _ = l - 1;
            for (let g = 0; g < d; ++g) {
              let w = g * u, y = ol(g, m) * l;
              for (let v = 0; v < u; ++v) {
                if (g < a && v < l) continue;
                let k = (w + v) * c, C = (y + ol(v, _)) * c;
                for (let x = 0; x < c; ++x)
                  f[k + x] = e[C + x];
              }
            }
          }
          e = f, r = [d, u, c];
        }
        return [e, r];
      }
      /**
       * Rescale the image pixel values by `this.rescale_factor`.
       * @param {Float32Array} pixelData The pixel data to rescale.
       * @returns {void}
       */
      rescale(e) {
        for (let r = 0; r < e.length; ++r)
          e[r] = this.rescale_factor * e[r];
      }
      /**
       * Find the target (width, height) dimension of the output image after
       * resizing given the input image and the desired size.
       * @param {RawImage} image The image to resize.
       * @param {any} size The size to use for resizing the image.
       * @returns {[number, number]} The target (width, height) dimension of the output image after resizing.
       */
      get_resize_output_image_size(e, r) {
        let [n, s] = e.size, o, i;
        if (this.do_thumbnail) {
          let { height: a, width: l } = r;
          o = Math.min(a, l);
        } else Number.isInteger(r) ? (o = r, i = this.config.max_size ?? o) : r !== void 0 && (o = r.shortest_edge, i = r.longest_edge);
        if (o !== void 0 || i !== void 0) {
          let a = o === void 0 ? 1 : Math.max(o / n, o / s), l = n * a, c = s * a, u = i === void 0 ? 1 : Math.min(i / l, i / c), d = Math.floor(Number((l * u).toFixed(2))), f = Math.floor(Number((c * u).toFixed(2)));
          return this.size_divisibility !== void 0 && ([d, f] = Jp(
            [d, f],
            this.size_divisibility
          )), [d, f];
        } else if (r !== void 0 && r.width !== void 0 && r.height !== void 0) {
          let a = r.width, l = r.height;
          if (this.config.keep_aspect_ratio && this.config.ensure_multiple_of) {
            let c = l / s, u = a / n;
            Math.abs(1 - u) < Math.abs(1 - c) ? c = u : u = c, l = Kp(c * s, this.config.ensure_multiple_of), a = Kp(u * n, this.config.ensure_multiple_of);
          }
          return [a, l];
        } else {
          if (this.size_divisibility !== void 0)
            return Jp([n, s], this.size_divisibility);
          throw new Error(
            `Could not resize image due to unsupported \`this.size\` option in config: ${JSON.stringify(r)}`
          );
        }
      }
      /**
       * Resizes the image.
       * @param {RawImage} image The image to resize.
       * @returns {Promise<RawImage>} The resized image.
       */
      async resize(e) {
        let [r, n] = this.get_resize_output_image_size(e, this.size);
        return await e.resize(r, n, {
          // @ts-expect-error TS2322
          resample: this.resample
        });
      }
      /**
       * @typedef {Object} PreprocessedImage
       * @property {HeightWidth} original_size The original size of the image.
       * @property {HeightWidth} reshaped_input_size The reshaped input size of the image.
       * @property {Tensor} pixel_values The pixel values of the preprocessed image.
       */
      /**
       * Preprocesses the given image.
       *
       * @param {RawImage} image The image to preprocess.
       * @param {Object} overrides The overrides for the preprocessing options.
       * @returns {Promise<PreprocessedImage>} The preprocessed image.
       */
      async preprocess(e, {
        do_normalize: r = null,
        do_pad: n = null,
        do_convert_rgb: s = null,
        do_convert_grayscale: o = null,
        do_flip_channel_order: i = null
      } = {}) {
        this.do_crop_margin && (e = await this.crop_margin(e));
        let [a, l] = e.size;
        if (s ?? this.do_convert_rgb ? e = e.rgb() : o && (e = e.grayscale()), this.do_resize && (e = await this.resize(e)), this.do_thumbnail && (e = await this.thumbnail(e, this.size, this.resample)), this.do_center_crop) {
          let h, p;
          Number.isInteger(this.crop_size) ? (h = this.crop_size, p = this.crop_size) : (h = this.crop_size.width, p = this.crop_size.height), e = await e.center_crop(h, p);
        }
        let c = [e.height, e.width], u = Float32Array.from(e.data), d = [e.height, e.width, e.channels];
        if (this.do_rescale && this.rescale(u), r ?? this.do_normalize) {
          let h = this.image_mean;
          Array.isArray(this.image_mean) || (h = new Array(e.channels).fill(h));
          let p = this.image_std;
          if (Array.isArray(this.image_std) || (p = new Array(e.channels).fill(p)), h.length !== e.channels || p.length !== e.channels)
            throw new Error(
              `When set to arrays, the length of \`image_mean\` (${h.length}) and \`image_std\` (${p.length}) must match the number of channels in the image (${e.channels}).`
            );
          for (let m = 0; m < u.length; m += e.channels)
            for (let _ = 0; _ < e.channels; ++_)
              u[m + _] = (u[m + _] - h[_]) / p[_];
        }
        if (n ?? this.do_pad) {
          if (this.pad_size)
            [u, d] = this.pad_image(u, [e.height, e.width, e.channels], this.pad_size);
          else if (this.size_divisibility) {
            let h = Math.ceil(d[1] / this.size_divisibility) * this.size_divisibility, p = Math.ceil(d[0] / this.size_divisibility) * this.size_divisibility;
            [u, d] = this.pad_image(u, d, { width: h, height: p });
          }
        }
        if (i ?? this.do_flip_channel_order) {
          if (d[2] !== 3)
            throw new Error("Flipping channel order is only supported for RGB images.");
          for (let h = 0; h < u.length; h += 3) {
            let p = u[h];
            u[h] = u[h + 2], u[h + 2] = p;
          }
        }
        let f = new W("float32", u, d).permute(2, 0, 1);
        return {
          original_size: [l, a],
          reshaped_input_size: c,
          pixel_values: f
        };
      }
      /**
       * Preprocess one or more images and batch the result into `pixel_values`.
       * @param {RawImage|RawImage[]} images The image or images to preprocess.
       * @param {...any} args Additional arguments.
       * @returns {Promise<ImageProcessorResult>} An object containing the concatenated pixel values (and other metadata) of the preprocessed images.
       */
      async _call(e, ...r) {
        Array.isArray(e) || (e = [e]);
        let n = await Promise.all(e.map((o) => this.preprocess(o)));
        return {
          pixel_values: We(
            n.map((o) => o.pixel_values),
            0
          ),
          // Original sizes of images
          original_sizes: n.map((o) => o.original_size),
          // Reshaped sizes of images, before padding or cropping
          reshaped_input_sizes: n.map((o) => o.reshaped_input_size)
        };
      }
      /**
       * Instantiate one of the processor classes of the library from a pretrained model.
       *
       * The processor class to instantiate is selected based on the `image_processor_type` (or `feature_extractor_type`; legacy)
       * property of the config object (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
       *
       * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
       * - A string, the *model id* of a pretrained processor hosted inside a model repo on huggingface.co.
       *   Valid model ids can be located at the root-level, like `bert-base-uncased`, or namespaced under a
       *   user or organization name, like `dbmdz/bert-base-german-cased`.
       * - A path to a *directory* containing processor files, e.g., `./my_model_directory/`.
       * @param {import('./utils/hub.js').PretrainedOptions} options Additional options for loading the processor.
       *
       * @returns {Promise<ImageProcessor>} A new image processor instance.
       */
      static async from_pretrained(e, r = {}) {
        let n = await Ke(
          e,
          Ks,
          !0,
          r
        );
        return new this(n);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/beit/image_processing_beit.js
  var Ol, Zp = b(() => {
    J();
    Ol = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/bit/image_processing_bit.js
  var Pl, Qp = b(() => {
    J();
    Pl = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/chinese_clip/image_processing_chinese_clip.js
  var Ll, em = b(() => {
    J();
    Ll = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/chmv2/image_processing_chmv2.js
  var Rl, tm = b(() => {
    J();
    Rl = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/clip/image_processing_clip.js
  var to, $l, rm = b(() => {
    J();
    to = class extends N {
    }, $l = class extends to {
    };
  });

  // node_modules/@huggingface/transformers/src/models/convnext/image_processing_convnext.js
  var ro, Nl, nm = b(() => {
    J();
    ro = class extends N {
      constructor(e) {
        super(e), this.crop_pct = this.config.crop_pct ?? 224 / 256;
      }
      async resize(e) {
        let r = this.size?.shortest_edge;
        if (r === void 0)
          throw new Error("Size dictionary must contain 'shortest_edge' key.");
        if (r < 384) {
          let n = Math.floor(r / this.crop_pct), [s, o] = this.get_resize_output_image_size(e, {
            shortest_edge: n
          });
          e = await e.resize(s, o, {
            resample: this.resample
          }), e = await e.center_crop(r, r);
        } else
          e = await e.resize(r, r, {
            resample: this.resample
          });
        return e;
      }
    }, Nl = class extends ro {
    };
  });

  // node_modules/@huggingface/transformers/src/models/deit/image_processing_deit.js
  var no, Dl, sm = b(() => {
    J();
    no = class extends N {
    }, Dl = class extends no {
    };
  });

  // node_modules/@huggingface/transformers/src/models/detr/image_processing_detr.js
  var so, zl, om = b(() => {
    J();
    we();
    so = class extends N {
      /**
       * Calls the feature extraction process on an array of images, preprocesses
       * each image, and concatenates the resulting features into a single Tensor.
       * @param {import('../../utils/image.js').RawImage[]} images The image(s) to extract features from.
       * @returns {Promise<DetrFeatureExtractorResult>} An object containing the concatenated pixel values of the preprocessed images.
       */
      async _call(e) {
        let r = await super._call(e), n = [r.pixel_values.dims[0], 64, 64], s = cr(n, 1n);
        return { ...r, pixel_mask: s };
      }
      /** @type {typeof post_process_object_detection} */
      post_process_object_detection(...e) {
        return Ut(...e);
      }
      /** @type {typeof post_process_panoptic_segmentation} */
      post_process_panoptic_segmentation(...e) {
        return Qs(...e);
      }
      /** @type {typeof post_process_instance_segmentation} */
      post_process_instance_segmentation(...e) {
        return eo(...e);
      }
    }, zl = class extends so {
    };
  });

  // node_modules/@huggingface/transformers/src/models/dinov3_vit/image_processing_dinov3_vit.js
  var Bl, im = b(() => {
    J();
    Bl = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/donut/image_processing_donut.js
  var Kr, Ul, Fl = b(() => {
    J();
    Kr = class extends N {
      pad_image(e, r, n, s = {}) {
        let [o, i, a] = r, l = this.image_mean;
        Array.isArray(this.image_mean) || (l = new Array(a).fill(l));
        let c = this.image_std;
        Array.isArray(c) || (c = new Array(a).fill(l));
        let u = l.map((d, f) => -d / c[f]);
        return super.pad_image(e, r, n, {
          center: !0,
          // Since normalization is done after padding, we need to use certain constant values to ensure the same behaviour is observed.
          // For more information, see https://github.com/huggingface/transformers/blob/main/src/transformers/models/donut/image_processing_donut.py#L433-L451
          constant_values: u,
          ...s
        });
      }
    }, Ul = class extends Kr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/dpt/image_processing_dpt.js
  var oo, jl, am = b(() => {
    J();
    oo = class extends N {
    }, jl = class extends oo {
    };
  });

  // node_modules/@huggingface/transformers/src/models/efficientnet/image_processing_efficientnet.js
  var Wl, lm = b(() => {
    J();
    Wl = class extends N {
      constructor(e) {
        super(e), this.include_top = this.config.include_top ?? !0, this.include_top && (this.image_std = this.image_std.map((r) => r * r));
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/gemma3/image_processing_gemma3.js
  var Vl, cm = b(() => {
    J();
    Vl = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/gemma4/image_processing_gemma4.js
  function Nb(t, e, r, n, s) {
    let o = n * r ** 2, i = Math.sqrt(o / (t * e)), a = s * r, l = Math.floor(i * t / a) * a, c = Math.floor(i * e / a) * a;
    if (l === 0 && c === 0)
      throw new Error(
        `Attempting to resize to a 0 x 0 image. Resized height should be divisible by \`pooling_kernel_size * patch_size\`=${a}.`
      );
    let u = Math.floor(n / s ** 2) * a;
    return l === 0 ? (l = a, c = Math.min(Math.floor(e / t) * a, u)) : c === 0 && (c = a, l = Math.min(Math.floor(t / e) * a, u)), [l, c];
  }
  function Db(t, e, r, n, s, o, i) {
    let a = Math.floor(e / s), l = Math.floor(r / s), c = a * l, u = s * s * n, d = new Float32Array(o * u), f = 0;
    for (let m = 0; m < a; ++m)
      for (let _ = 0; _ < l; ++_)
        for (let g = 0; g < s; ++g) {
          let w = (m * s + g) * r * n + _ * s * n;
          for (let y = 0; y < s; ++y) {
            let v = w + y * n;
            for (let k = 0; k < n; ++k)
              d[f++] = t[v + k];
          }
        }
    let h = new BigInt64Array(o * 2).fill(-1n), p = 0;
    for (let m = 0; m < a; ++m)
      for (let _ = 0; _ < l; ++_)
        h[p++] = BigInt(_), h[p++] = BigInt(m);
    return {
      patches: new W("float32", d, [o, u]),
      positions: new W("int64", h, [o, 2]),
      num_soft_tokens: Math.floor(c / i ** 2)
    };
  }
  var Gl, um = b(() => {
    ft();
    we();
    Xs();
    Gl = class extends ye {
      /** @param {Record<string, any>} config */
      constructor(e) {
        super(), this.config = e, this.patch_size = e.patch_size ?? 16, this.max_soft_tokens = e.max_soft_tokens ?? 280, this.pooling_kernel_size = e.pooling_kernel_size ?? 3, this.resample = e.resample ?? 3, this.rescale_factor = e.rescale_factor ?? 1 / 255, this.do_rescale = e.do_rescale ?? !0, this.do_resize = e.do_resize ?? !0, this.do_convert_rgb = e.do_convert_rgb ?? !0;
      }
      /**
       * @param {RawImage|RawImage[]} images
       * @returns {Promise<{ pixel_values: Tensor, image_position_ids: Tensor, num_soft_tokens_per_image: number[] }>}
       */
      async _call(e) {
        Array.isArray(e) || (e = [e]);
        let { patch_size: r, pooling_kernel_size: n } = this, s = this.max_soft_tokens * n ** 2, o = [], i = [], a = [];
        for (let l of e) {
          if (this.do_convert_rgb && (l = l.rgb()), this.do_resize) {
            let [h, p] = Nb(
              l.height,
              l.width,
              r,
              s,
              n
            );
            (h !== l.height || p !== l.width) && (l = await l.resize(p, h, { resample: this.resample }));
          }
          let c = Float32Array.from(l.data);
          if (this.do_rescale)
            for (let h = 0; h < c.length; ++h)
              c[h] *= this.rescale_factor;
          let { patches: u, positions: d, num_soft_tokens: f } = Db(
            c,
            l.height,
            l.width,
            l.channels,
            r,
            s,
            n
          );
          o.push(u), i.push(d), a.push(f);
        }
        return {
          pixel_values: We(o, 0),
          image_position_ids: We(i, 0),
          num_soft_tokens_per_image: a
        };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/qwen2_vl/image_processing_qwen2_vl.js
  var dr, io = b(() => {
    J();
    we();
    dr = class extends N {
      constructor(e) {
        super(e), this.min_pixels = e.min_pixels ?? e.size?.shortest_edge, this.max_pixels = e.max_pixels ?? e.size?.longest_edge, this.patch_size = e.patch_size, this.merge_size = e.merge_size;
      }
      /** @type {ImageProcessor['get_resize_output_image_size']} */
      get_resize_output_image_size(e, r) {
        let n = this.patch_size * this.merge_size;
        return Xr(e.height, e.width, n, this.min_pixels, this.max_pixels);
      }
      async _call(e, ...r) {
        let { pixel_values: n, original_sizes: s, reshaped_input_sizes: o } = await super._call(e, ...r), i = n, { temporal_patch_size: a, merge_size: l, patch_size: c } = this.config;
        i.dims[0] === 1 && (i = le(
          Array.from({ length: a }, () => i),
          0
        ));
        let u = i.dims[0] / a, d = i.dims[1], f = Math.floor(i.dims[2] / c), h = Math.floor(i.dims[3] / c), p = i.view(
          u,
          a,
          d,
          Math.floor(f / l),
          l,
          c,
          Math.floor(h / l),
          l,
          c
        ).permute(0, 3, 6, 4, 7, 2, 1, 5, 8).view(u * f * h, d * a * c * c), m = new W("int64", [u, f, h], [1, 3]);
        return {
          pixel_values: p,
          image_grid_thw: m,
          original_sizes: s,
          reshaped_input_sizes: o
        };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/glm46v/image_processing_glm46v.js
  var ql, dm = b(() => {
    io();
    J();
    ql = class extends dr {
      /** @type {Qwen2VLImageProcessor['get_resize_output_image_size']} */
      get_resize_output_image_size(e, r) {
        let n = this.patch_size * this.merge_size, s = this.config.temporal_patch_size ?? 2;
        return Xr(e.height, e.width, n, this.min_pixels, this.max_pixels, s);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/glpn/image_processing_glpn.js
  var Hl, fm = b(() => {
    J();
    Hl = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/grounding_dino/image_processing_grounding_dino.js
  var Yl, hm = b(() => {
    J();
    we();
    Yl = class extends N {
      /**
       * Calls the feature extraction process on an array of images, preprocesses
       * each image, and concatenates the resulting features into a single Tensor.
       * @param {import('../../utils/image.js').RawImage[]} images The image(s) to extract features from.
       * @returns {Promise<GroundingDinoFeatureExtractorResult>} An object containing the concatenated pixel values of the preprocessed images.
       */
      async _call(e) {
        let r = await super._call(e), n = r.pixel_values.dims, s = ot([n[0], n[2], n[3]]);
        return { ...r, pixel_mask: s };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/idefics3/image_processing_idefics3.js
  var ao, Xl = b(() => {
    J();
    we();
    ao = class extends N {
      constructor(e) {
        super(e), this.do_image_splitting = e.do_image_splitting ?? !0, this.max_image_size = e.max_image_size;
      }
      /**
       * @typedef {import('../../utils/image.js').RawImage} RawImage
       * @typedef {import('../../utils/tensor.js').Tensor} Tensor
       */
      /**
       * Calculate size to resize images to, to be multiples of `vision_encoder_max_size` while preserving the aspect ratio.
       * @param {Tensor} pixel_values Tensor of the image to resize.
       * @param {number} vision_encoder_max_size Maximum size of the output image. If the image is larger than this size,
       * it will be split into patches of this size, and the original image will be concatenated with the patches, resized to max_size.
       */
      get_resize_for_vision_encoder(e, r) {
        let [n, s] = e.dims.slice(-2), o = s / n;
        return s >= n ? (s = Math.ceil(s / r) * r, n = Math.floor(s / o), n = Math.ceil(n / r) * r) : (n = Math.ceil(n / r) * r, s = Math.floor(n * o), s = Math.ceil(s / r) * r), { height: n, width: s };
      }
      /** @param {RawImage|RawImage[]|RawImage[][]} images */
      async _call(e, { do_image_splitting: r = null, return_row_col_info: n = !1 } = {}) {
        let s;
        if (!Array.isArray(e))
          s = [[e]];
        else {
          if (e.length === 0 || !e[0])
            throw new Error("No images provided.");
          Array.isArray(e[0]) ? s = /** @type {RawImage[][]} */
          e : s = [
            /** @type {RawImage[]} */
            e
          ];
        }
        let o = [], i = [], a = [], l = [], c = [];
        for (let g of s) {
          let w = await Promise.all(g.map((k) => this.preprocess(k)));
          l.push(...w.map((k) => k.original_size)), c.push(...w.map((k) => k.reshaped_input_size)), w.forEach((k) => k.pixel_values.unsqueeze_(0));
          let { longest_edge: y } = this.max_image_size, v;
          if (r ?? this.do_image_splitting) {
            let k = new Array(w.length), C = new Array(w.length);
            v = await Promise.all(
              w.map(async (x, E) => {
                let O = this.get_resize_for_vision_encoder(x.pixel_values, y), D = await Re(x.pixel_values, {
                  size: [O.height, O.width]
                }), { frames: z, num_splits_h: B, num_splits_w: P } = await this.split_image(
                  D,
                  this.max_image_size
                );
                return k[E] = B, C[E] = P, le(z, 0);
              })
            ), i.push(k), a.push(C);
          } else {
            let k = [y, y];
            v = await Promise.all(w.map((C) => Re(C.pixel_values, { size: k }))), i.push(new Array(w.length).fill(0)), a.push(new Array(w.length).fill(0));
          }
          o.push(le(v, 0));
        }
        let u = o.length, [d, f, h, p] = o[0].dims, m, _;
        if (u === 1)
          m = o[0].unsqueeze_(0), _ = cr([u, d, h, p], !0);
        else {
          let g = Math.max(...o.map((v) => v.dims.at(0)));
          _ = cr([u, g, h, p], !0);
          let w = _.data, y = g * h * p;
          for (let v = 0; v < u; ++v) {
            let k = o[v].dims[0];
            if (k < g) {
              o[v] = le(
                [o[v], cr([g - k, f, h, p], 0)],
                0
              );
              let C = v * y + k * h * p, x = (v + 1) * y;
              w.fill(!1, C, x);
            }
          }
          m = We(o, 0);
        }
        return {
          pixel_values: m,
          pixel_attention_mask: _,
          original_sizes: l,
          reshaped_input_sizes: c,
          ...n ? { rows: i, cols: a } : {}
        };
      }
      async split_image(e, { longest_edge: r }) {
        let n = r, s = r, o = [], [i, a] = e.dims.slice(-2), l = 0, c = 0;
        if (i > n || a > s) {
          l = Math.ceil(i / n), c = Math.ceil(a / s);
          let u = Math.ceil(i / l), d = Math.ceil(a / c);
          for (let p = 0; p < l; ++p)
            for (let m = 0; m < c; ++m) {
              let _, g, w, y;
              p === l - 1 ? (g = i - u, y = i) : (g = p * u, y = (p + 1) * u), m === c - 1 ? (_ = a - d, w = a) : (_ = m * d, w = (m + 1) * d);
              let C = await Hs(e, [g, _], [y, w], [2, 3]);
              o.push(C);
            }
          let f = n, h = s;
          (i !== f || a !== h) && (e = await Re(e, {
            size: [f, h]
          }));
        }
        return o.push(e), { frames: o, num_splits_h: l, num_splits_w: c };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/janus/image_processing_janus.js
  var Kl, pm = b(() => {
    J();
    Kl = class extends N {
      constructor(e) {
        super({
          do_pad: !0,
          pad_size: {
            width: e.image_size,
            height: e.image_size
          },
          ...e
        }), this.constant_values = this.config.background_color.map((r) => r * this.rescale_factor);
      }
      pad_image(e, r, n, s) {
        return super.pad_image(e, r, n, {
          constant_values: this.constant_values,
          center: !0,
          ...s
        });
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/jina_clip/image_processing_jina_clip.js
  var Jl, mm = b(() => {
    J();
    Jl = class extends N {
      constructor(e) {
        let { resize_mode: r, fill_color: n, interpolation: s, size: o, ...i } = e, a = r === "squash" ? { width: o, height: o } : r === "shortest" ? { shortest_edge: o } : { longest_edge: o }, l = s === "bicubic" ? 3 : 2;
        super({
          ...i,
          size: a,
          resample: l,
          do_center_crop: !0,
          crop_size: o,
          do_normalize: !0
        });
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/lfm2_vl/image_processing_lfm2_vl.js
  function _m(t, e) {
    return Math.round(t / e) * e;
  }
  function zb(t, e, r, n, s) {
    let o = 1 / 0, i = [1, 1], a = r * n;
    for (let l of e) {
      let c = Math.abs(t - l[0] / l[1]);
      c < o ? (o = c, i = l) : c === o && a > 0.5 * s * s * l[0] * l[1] && (i = l);
    }
    return i;
  }
  function Bb(t, e) {
    let r = [], n = /* @__PURE__ */ new Set();
    for (let s = t; s <= e; ++s)
      for (let o = 1; o <= s; ++o)
        for (let i = 1; i <= s; ++i) {
          let a = o * i;
          if (a >= t && a <= e) {
            let l = o << 16 | i;
            n.has(l) || (n.add(l), r.push([o, i]));
          }
        }
    return r.sort((s, o) => s[0] * s[1] - o[0] * o[1]);
  }
  function Ub(t, e) {
    let [r, n, s, o] = t.dims, i = Math.floor(s / e), a = Math.floor(o / e), l = e * e * n, c = (
      /** @type {Float32Array} */
      t.data
    ), u = new Float32Array(r * i * a * l), d = s * o;
    for (let f = 0; f < r; ++f) {
      let h = f * n * d, p = f * i * a * l;
      for (let m = 0; m < i; ++m)
        for (let _ = 0; _ < a; ++_) {
          let g = p + (m * a + _) * l;
          for (let w = 0; w < e; ++w) {
            let y = (m * e + w) * o + _ * e;
            for (let v = 0; v < e; ++v) {
              let k = y + v;
              for (let C = 0; C < n; ++C)
                u[g++] = c[h + C * d + k];
            }
          }
        }
    }
    return new W("float32", u, [r, i * a, l]);
  }
  function Fb(t, e) {
    let [, r, n] = t.dims, s = new BigInt64Array(e);
    s.fill(1n, 0, r);
    let o = t;
    if (r < e) {
      let i = new Float32Array(e * n);
      i.set(
        /** @type {Float32Array} */
        t.data
      ), o = new W("float32", i, [1, e, n]);
    }
    return { padded: o, mask: new W("int64", s, [e]) };
  }
  var Zl, gm = b(() => {
    J();
    we();
    Zl = class extends N {
      constructor(e) {
        super(e), this.downsample_factor = e.downsample_factor ?? 2, this.do_image_splitting = e.do_image_splitting ?? !0, this.min_tiles = e.min_tiles ?? 2, this.max_tiles = e.max_tiles ?? 10, this.use_thumbnail = e.use_thumbnail ?? !0, this.min_image_tokens = e.min_image_tokens ?? 64, this.max_image_tokens = e.max_image_tokens ?? 256, this.encoder_patch_size = e.encoder_patch_size ?? e.patch_size ?? 16, this.tile_size = e.tile_size ?? 512, this.max_pixels_tolerance = e.max_pixels_tolerance ?? 2, this.return_row_col_info = e.return_row_col_info ?? !1;
        let r = this.max_image_tokens * this.downsample_factor ** 2, n = this.do_image_splitting ? (this.tile_size / this.encoder_patch_size) ** 2 : 0;
        this.max_num_patches = Math.max(r, n);
      }
      /**
       * Check if the image is too large to be processed as a single tile.
       * @param {number} height
       * @param {number} width
       * @returns {boolean}
       */
      _is_image_too_large(e, r) {
        let n = this.encoder_patch_size * this.downsample_factor, s = Math.max(this.encoder_patch_size, _m(e, n)), o = Math.max(this.encoder_patch_size, _m(r, n));
        return s * o > this.max_image_tokens * (this.encoder_patch_size * this.downsample_factor) ** 2 * this.max_pixels_tolerance;
      }
      /**
       * Get the grid layout for tiling a large image.
       * @param {number} height
       * @param {number} width
       * @returns {{ grid_width: number, grid_height: number, target_width: number, target_height: number }}
       */
      _get_grid_layout(e, r) {
        let n = Bb(this.min_tiles, this.max_tiles), [s, o] = zb(
          r / e,
          n,
          r,
          e,
          this.tile_size
        );
        return {
          grid_width: s,
          grid_height: o,
          target_width: this.tile_size * s,
          target_height: this.tile_size * o
        };
      }
      /** @param {RawImage|RawImage[]|RawImage[][]} images */
      // @ts-expect-error
      async _call(e, { return_row_col_info: r = null } = {}) {
        let n;
        Array.isArray(e) ? Array.isArray(e[0]) ? n = /** @type {RawImage[][]} */
        e : n = [
          /** @type {RawImage[]} */
          e
        ] : n = [[e]];
        let s = [], o = [], i = [], a = [], l = [], c = [];
        for (let d of n) {
          let f = await Promise.all(d.map((h) => this.preprocess(h, { do_pad: !1 })));
          for (let { pixel_values: h } of f) {
            let [, p, m] = h.dims, _ = h.unsqueeze_(0), g = this.encoder_patch_size * this.downsample_factor, w = g ** 2, [y, v] = Xr(
              Math.max(g, p),
              Math.max(g, m),
              g,
              this.min_image_tokens * w,
              this.max_image_tokens * w
            ).map((D) => Math.max(g, D)), k, C = 1, x = 1, E = this._is_image_too_large(p, m), O = this.do_image_splitting && !(this.min_tiles === 1 && this.max_tiles === 1);
            if (E && O) {
              let { grid_width: D, grid_height: z, target_width: B, target_height: P } = this._get_grid_layout(
                p,
                m
              );
              C = z, x = D;
              let I = await Re(_, {
                size: [P, B]
              });
              k = [];
              for (let S = 0; S < z; ++S)
                for (let F = 0; F < D; ++F) {
                  let $ = S * this.tile_size, Z = F * this.tile_size;
                  k.push(I.slice(null, null, [$, $ + this.tile_size], [Z, Z + this.tile_size]));
                }
              this.use_thumbnail && D * z !== 1 && k.push(await Re(_, { size: [v, y] }));
            } else
              k = [await Re(_, { size: [v, y] })];
            for (let D of k) {
              let [, , z, B] = D.dims, P = Ub(D, this.encoder_patch_size), { padded: I, mask: S } = Fb(P, this.max_num_patches);
              s.push(I), o.push(S), i.push([
                Math.floor(z / this.encoder_patch_size),
                Math.floor(B / this.encoder_patch_size)
              ]);
            }
            a.push(C), l.push(x), c.push([v, y]);
          }
        }
        let u = {
          pixel_values: le(s, 0),
          pixel_attention_mask: We(o, 0),
          spatial_shapes: new W("int64", BigInt64Array.from(i.flat(), BigInt), [
            i.length,
            2
          ])
        };
        return (r ?? this.return_row_col_info) && (u.image_rows = a, u.image_cols = l, u.image_sizes = c), u;
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/lfm3_vl/image_processing_lfm3_vl.js
  var Ql, wm = b(() => {
    io();
    we();
    Ql = class extends dr {
      async _call(e, ...r) {
        Array.isArray(e) || (e = [e]);
        let n = await Promise.all(e.map((s) => super._call(s, ...r)));
        return {
          pixel_values: le(
            n.map((s) => s.pixel_values),
            0
          ),
          image_grid_thw: le(
            n.map((s) => s.image_grid_thw),
            0
          ),
          original_sizes: n.flatMap((s) => s.original_sizes),
          reshaped_input_sizes: n.flatMap((s) => s.reshaped_input_sizes)
        };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/llava_onevision/image_processing_llava_onevision.js
  var ec, ym = b(() => {
    J();
    ec = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/maskformer/image_processing_maskformer.js
  var Jr, tc, rc = b(() => {
    J();
    Jr = class extends N {
      /** @type {typeof post_process_panoptic_segmentation} */
      post_process_panoptic_segmentation(...e) {
        return Qs(...e);
      }
      /** @type {typeof post_process_instance_segmentation} */
      post_process_instance_segmentation(...e) {
        return eo(...e);
      }
    }, tc = class extends Jr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mask2former/image_processing_mask2former.js
  var nc, bm = b(() => {
    rc();
    nc = class extends Jr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilenet_v1/image_processing_mobilenet_v1.js
  var lo, sc, xm = b(() => {
    J();
    lo = class extends N {
    }, sc = class extends lo {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilenet_v2/image_processing_mobilenet_v2.js
  var co, oc, vm = b(() => {
    J();
    co = class extends N {
    }, oc = class extends co {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilenet_v3/image_processing_mobilenet_v3.js
  var uo, ic, Em = b(() => {
    J();
    uo = class extends N {
    }, ic = class extends uo {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilenet_v4/image_processing_mobilenet_v4.js
  var fo, ac, km = b(() => {
    J();
    fo = class extends N {
    }, ac = class extends fo {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilevit/image_processing_mobilevit.js
  var ho, lc, Am = b(() => {
    J();
    ho = class extends N {
    }, lc = class extends ho {
    };
  });

  // node_modules/@huggingface/transformers/src/models/nougat/image_processing_nougat.js
  var cc, Tm = b(() => {
    Fl();
    cc = class extends Kr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/owlvit/image_processing_owlvit.js
  var Zr, uc, dc = b(() => {
    J();
    Zr = class extends N {
      /** @type {typeof post_process_object_detection} */
      post_process_object_detection(...e) {
        return Ut(...e);
      }
    }, uc = class extends Zr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/owlv2/image_processing_owlv2.js
  var fc, Sm = b(() => {
    dc();
    fc = class extends Zr {
    };
  });

  // node_modules/@huggingface/transformers/src/models/phi3_v/image_processing_phi3_v.js
  var Ve, jb, hc, Qr, pc, mc, Cm = b(() => {
    J();
    we();
    Ve = 336, jb = [2, 3], { ceil: hc, floor: Qr, sqrt: pc } = Math, mc = class extends N {
      constructor(e) {
        super({
          ...e,
          do_normalize: !0,
          do_pad: !0,
          pad_size: "custom",
          do_convert_rgb: !0,
          do_resize: !0
          // Smart resizing "hd_transform"
        }), this._num_crops = e.num_crops;
      }
      calc_num_image_tokens_from_image_size(e, r) {
        let { num_img_tokens: n } = this.config;
        return Qr(
          (Qr(r / Ve) * Qr(e / Ve) + 1) * n + 1 + (Qr(r / Ve) + 1) * pc(n)
        );
      }
      /** @type {ImageProcessor['get_resize_output_image_size']} */
      get_resize_output_image_size(e, r) {
        let n = this._num_crops, [s, o] = e.size, i = s / o, a = 1;
        for (; a * Math.ceil(a / i) <= n; )
          a += 1;
        a -= 1;
        let l = Math.floor(a * 336), c = Math.floor(l / i);
        return [l, c];
      }
      /** @type {ImageProcessor['pad_image']} */
      pad_image(e, r, n, s = {}) {
        let [o, i] = r, a = Ve * hc(o / Ve), l = Ve * hc(i / Ve), c = [1, 1, 1].map((u, d) => (u - this.image_mean[d]) / this.image_std[d]);
        return super.pad_image(
          e,
          r,
          { width: l, height: a },
          {
            center: !0,
            constant_values: c,
            ...s
          }
        );
      }
      async _call(e, { num_crops: r = null } = {}) {
        if (this._num_crops = r ??= this.config.num_crops, r < 4 || pc(r) % 1 !== 0)
          throw new Error("num_crops must be a square number >= 4");
        Array.isArray(e) || (e = [e]);
        let n = e.length, s = await Promise.all(e.map((f) => this.preprocess(f))), o = s.map((f) => f.original_size), i = s.map((f) => f.reshaped_input_size), a = [];
        for (let { pixel_values: f } of s) {
          f.unsqueeze_(0);
          let [h, p] = f.dims.slice(-2), m = await Re(f, {
            size: [Ve, Ve],
            mode: "bicubic"
          });
          if (r > 0) {
            let _ = [], g = pc(r), w = Qr(p / g), y = Qr(h / g);
            for (let k = 0; k < g; ++k)
              for (let C = 0; C < g; ++C) {
                let x, E, O, D;
                k === g - 1 ? (E = h - y, D = h) : (E = k * y, D = (k + 1) * y), C === g - 1 ? (x = p - w, O = p) : (x = C * w, O = (C + 1) * w);
                let P = await Hs(f, [E, x], [D, O], jb);
                _.push(P);
              }
            let v = await Re(le(_, 0), {
              size: [Ve, Ve],
              mode: "bicubic"
            });
            a.push(le([m, v], 0));
          } else
            a.push(m);
        }
        let l = We(a, 0), c = i.map((f) => f.map((h) => Ve * hc(h / Ve))), u = new W("int64", c.flat(), [n, 2]), d = c.map(
          ([f, h]) => this.calc_num_image_tokens_from_image_size(h, f)
        );
        return { pixel_values: l, original_sizes: o, reshaped_input_sizes: i, image_sizes: u, num_img_tokens: d };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/pixtral/image_processing_pixtral.js
  var _c, Im = b(() => {
    J();
    _c = class extends N {
      /** @type {ImageProcessor['get_resize_output_image_size']} */
      get_resize_output_image_size(e, r) {
        let { longest_edge: n } = r;
        if (n === void 0)
          throw new Error("size must contain 'longest_edge'");
        let [s, o] = e.size, i = Math.max(s, o) / n, a = s, l = o;
        i > 1 && (a = Math.floor(s / i), l = Math.floor(o / i));
        let { patch_size: c, spatial_merge_size: u } = this.config;
        if (!u)
          throw new Error("config must contain 'spatial_merge_size'");
        let d = c * u, f = Math.floor((a - 1) / d) + 1, h = Math.floor((l - 1) / d) + 1;
        return [f * d, h * d];
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/pvt/image_processing_pvt.js
  var gc, Mm = b(() => {
    J();
    gc = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/rt_detr/image_processing_rt_detr.js
  var wc, Om = b(() => {
    J();
    wc = class extends N {
      /** @type {typeof post_process_object_detection} */
      post_process_object_detection(...e) {
        return Ut(...e);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/sam/image_processing_sam.js
  var jn, yc = b(() => {
    J();
    st();
    we();
    jn = class extends N {
      /**
       *
       * @param {any} input_points
       * @param {import("../../image_processors_utils.js").HeightWidth[]} original_sizes
       * @param {import("../../image_processors_utils.js").HeightWidth[]} reshaped_input_sizes
       * @returns {Tensor}
       */
      reshape_input_points(e, r, n, s = !1) {
        e = structuredClone(e);
        let o = sl(e);
        if (o.length === 3)
          s || (o = [1, ...o]), e = [e];
        else if (o.length !== 4)
          throw Error(
            "The input_points must be a 4D tensor of shape `batch_size`, `point_batch_size`, `nb_points_per_image`, `2`."
          );
        for (let i = 0; i < e.length; ++i) {
          let [a, l] = r[i], [c, u] = n[i], d = [u / l, c / a];
          for (let f = 0; f < e[i].length; ++f)
            for (let h = 0; h < e[i][f].length; ++h)
              for (let p = 0; p < e[i][f][h].length; ++p)
                e[i][f][h][p] *= d[p % 2];
        }
        return new W("float32", Float32Array.from(e.flat(1 / 0)), o);
      }
      /**
       *
       * @param {any} input_labels
       * @param {Tensor} input_points
       * @returns {Tensor}
       */
      add_input_labels(e, r) {
        let n = sl(e);
        if (n.length === 2)
          n = [1, ...n], e = [e];
        else if (n.length !== 3)
          throw Error(
            "The input_points must be a 4D tensor of shape `batch_size`, `point_batch_size`, `nb_points_per_image`, `2`."
          );
        if (n.some((s, o) => s !== r.dims[o]))
          throw Error(`The first ${n.length} dimensions of 'input_points' and 'input_labels' must be the same.`);
        return new W("int64", e.flat(1 / 0).map(BigInt), n);
      }
      /**
       * @param {any[]} images The URL(s) of the image(s) to extract features from.
       * @param {Object} [options] Additional options for the processor.
       * @param {any} [options.input_points=null] A 3D or 4D array, representing the input points provided by the user.
       * - 3D: `[point_batch_size, nb_points_per_image, 2]`. In this case, `batch_size` is assumed to be 1.
       * - 4D: `[batch_size, point_batch_size, nb_points_per_image, 2]`.
       * @param {any} [options.input_labels=null] A 2D or 3D array, representing the input labels for the points, used by the prompt encoder to encode the prompt.
       * - 2D: `[point_batch_size, nb_points_per_image]`. In this case, `batch_size` is assumed to be 1.
       * - 3D: `[batch_size, point_batch_size, nb_points_per_image]`.
       * @param {number[][][]} [options.input_boxes=null] A 3D array of shape `(batch_size, num_boxes, 4)`, representing the input boxes provided by the user.
       * This is used by the prompt encoder to encode the prompt. Generally yields to much better generated masks.
       * The processor will generate a tensor, with each dimension corresponding respectively to the image batch size,
       * the number of boxes per image and the coordinates of the top left and botton right point of the box.
       * In the order (`x1`, `y1`, `x2`, `y2`):
       * - `x1`: the x coordinate of the top left point of the input box
       * - `y1`: the y coordinate of the top left point of the input box
       * - `x2`: the x coordinate of the bottom right point of the input box
       * - `y2`: the y coordinate of the bottom right point of the input box
       * @returns {Promise<SamImageProcessorResult>}
       */
      async _call(e, { input_points: r = null, input_labels: n = null, input_boxes: s = null } = {}) {
        let o = await super._call(e);
        if (r && (o.input_points = this.reshape_input_points(
          r,
          o.original_sizes,
          o.reshaped_input_sizes
        )), n) {
          if (!o.input_points)
            throw Error("`input_points` must be provided if `input_labels` are provided.");
          o.input_labels = this.add_input_labels(n, o.input_points);
        }
        return s && (o.input_boxes = this.reshape_input_points(
          s,
          o.original_sizes,
          o.reshaped_input_sizes,
          !0
        )), o;
      }
      /**
       * Remove padding and upscale masks to the original image size.
       * @param {Tensor} masks Batched masks from the mask_decoder in (batch_size, num_channels, height, width) format.
       * @param {[number, number][]} original_sizes The original sizes of each image before it was resized to the model's expected input shape, in (height, width) format.
       * @param {[number, number][]} reshaped_input_sizes The size of each image as it is fed to the model, in (height, width) format. Used to remove padding.
       * @param {Object} options Optional parameters for post-processing.
       * @param {number} [options.mask_threshold] The threshold to use for binarizing the masks.
       * @param {boolean} [options.binarize] Whether to binarize the masks.
       * @param {Object} [options.pad_size] The target size the images were padded to before being passed to the model. If `null`, the target size is assumed to be the processor's `pad_size`.
       * @param {number} [options.pad_size.height] The height the images were padded to.
       * @param {number} [options.pad_size.width] The width the images were padded to.
       * @returns {Promise<Tensor[]>} Batched masks in batch_size, num_channels, height, width) format, where (height, width) is given by original_size.
       */
      async post_process_masks(e, r, n, { mask_threshold: s = 0, binarize: o = !0, pad_size: i = null } = {}) {
        let a = [];
        i = i ?? this.pad_size ?? this.size;
        let l = [i.height, i.width];
        for (let c = 0; c < r.length; ++c) {
          let u = r[c], d = n[c], f = await Re(e[c], { mode: "bilinear", size: l });
          if (f = f.slice(
            null,
            null,
            [0, d[0]],
            [0, d[1]]
          ), f = await Re(f, { mode: "bilinear", size: u }), o) {
            let h = f.data, p = new Uint8Array(h.length);
            for (let m = 0; m < h.length; ++m)
              h[m] > s && (p[m] = 1);
            f = new W("bool", p, f.dims);
          }
          a.push(f);
        }
        return a;
      }
      /**
       * Generates a list of crop boxes of different sizes. Each layer has (2**i)**2 boxes for the ith layer.
       * @param {import("../../utils/image.js").RawImage} image Input original image
       * @param {number} target_size Target size of the resized image
       * @param {Object} options Options for generating crop boxes
       * @param {number} [options.crop_n_layers] If >0, mask prediction will be run again on crops of the image.
       * Sets the number of layers to run, where each layer has 2**i_layer number of image crops.
       * @param {number} [options.overlap_ratio] Sets the degree to which crops overlap. In the first crop layer,
       * crops will overlap by this fraction of the image length. Later layers with more crops scale down this overlap.
       * @param {number} [options.points_per_crop] Number of points to sample from each crop.
       * @param {number} [options.crop_n_points_downscale_factor] The number of points-per-side sampled in layer n is
       * scaled down by crop_n_points_downscale_factor**n.
       * @returns {Object} An object containing the crop boxes, number of points per crop, cropped images, and input labels.
       */
      generate_crop_boxes(e, r, {
        crop_n_layers: n = 0,
        overlap_ratio: s = 512 / 1500,
        points_per_crop: o = 32,
        crop_n_points_downscale_factor: i = 1
      } = {}) {
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/sam2/image_processing_sam2.js
  var bc = b(() => {
    yc();
  });

  // node_modules/@huggingface/transformers/src/models/sam3/image_processing_sam3.js
  var Pm = b(() => {
    bc();
  });

  // node_modules/@huggingface/transformers/src/models/sapiens/image_processing_sapiens.js
  var po, xc, Lm = b(() => {
    J();
    po = class extends N {
      /** @type {typeof post_process_semantic_segmentation} */
      post_process_semantic_segmentation(...e) {
        return Zs(...e);
      }
    }, xc = class extends po {
    };
  });

  // node_modules/@huggingface/transformers/src/models/segformer/image_processing_segformer.js
  var mo, vc, Rm = b(() => {
    J();
    mo = class extends N {
      /** @type {typeof post_process_semantic_segmentation} */
      post_process_semantic_segmentation(...e) {
        return Zs(...e);
      }
    }, vc = class extends mo {
    };
  });

  // node_modules/@huggingface/transformers/src/models/siglip/image_processing_siglip.js
  var Ec, $m = b(() => {
    J();
    Ec = class extends N {
    };
  });

  // node_modules/@huggingface/transformers/src/models/smolvlm/image_processing_smolvlm.js
  var Nm = b(() => {
    Xl();
  });

  // node_modules/@huggingface/transformers/src/models/swin2sr/image_processing_swin2sr.js
  var kc, Dm = b(() => {
    J();
    kc = class extends N {
      pad_image(e, r, n, s = {}) {
        let [o, i, a] = r;
        return super.pad_image(
          e,
          r,
          {
            // NOTE: For Swin2SR models, the original python implementation adds padding even when the image's width/height is already
            // a multiple of `pad_size`. However, this is most likely a bug (PR: https://github.com/mv-lab/swin2sr/pull/19).
            // For this reason, we only add padding when the image's width/height is not a multiple of `pad_size`.
            width: i + (n - i % n) % n,
            height: o + (n - o % n) % n
          },
          {
            mode: "symmetric",
            center: !1,
            constant_values: -1,
            ...s
          }
        );
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/vit/image_processing_vit.js
  var _o, Ac, zm = b(() => {
    J();
    _o = class extends N {
    }, Ac = class extends _o {
    };
  });

  // node_modules/@huggingface/transformers/src/models/vitmatte/image_processing_vitmatte.js
  var Tc, Bm = b(() => {
    J();
    we();
    Tc = class extends N {
      /**
       * Calls the feature extraction process on an array of images, preprocesses
       * each image, and concatenates the resulting features into a single Tensor.
       * @param {import("../../utils/image.js").RawImage[]} images The image(s) to extract features from.
       * @param {import("../../utils/image.js").RawImage[]} trimaps The trimaps(s) to extract features from.
       * @returns {Promise<import("../../image_processors_utils.js").ImageProcessorResult>} An object containing the concatenated pixel values of the preprocessed images.
       */
      async _call(e, r) {
        Array.isArray(e) || (e = [e]), Array.isArray(r) || (r = [r]);
        let n = await Promise.all(e.map((i) => this.preprocess(i))), s = await Promise.all(
          r.map(
            (i) => this.preprocess(i, {
              do_normalize: !1,
              do_convert_rgb: !1,
              do_convert_grayscale: !0
            })
          )
        );
        return {
          pixel_values: We(
            n.map(
              // Concatenate images and trimaps
              (i, a) => le([i.pixel_values, s[a].pixel_values], 0)
            ),
            0
          ),
          // Original sizes of images
          original_sizes: n.map((i) => i.original_size),
          // Reshaped sizes of images, before padding or cropping
          reshaped_input_sizes: n.map((i) => i.reshaped_input_size)
        };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/vitpose/image_processing_vitpose.js
  var Sc, Um = b(() => {
    J();
    Sc = class extends N {
      /**
       * Transform the heatmaps into keypoint predictions and transform them back to the image.
       * NOTE: This is a naive implementation and does not include advanced post-processing techniques,
       * so the results may not be as accurate as the original implementation.
       * @param {import('../../utils/tensor.js').Tensor} outputs The model outputs.
       * @param {[number, number, number, number][][]} boxes List or array of bounding boxes for each image.
       * Each box should be a list of 4 floats representing the bounding box coordinates in COCO format (top_left_x, top_left_y, width, height).
       * @returns {{
       *   bbox: [number, number, number, number],
       *   scores: number[],
       *   labels: number[],
       *   keypoints: [number, number][]
       * }[][]} List of keypoints predictions for each image.
       */
      post_process_pose_estimation(e, r, {
        threshold: n = null
        // TODO:
        // kernel_size = 11,
        // target_sizes = null,
      } = {}) {
        let s = e.tolist(), [o, i, a, l] = e.dims, c = [];
        for (let u = 0; u < o; ++u) {
          let d = s[u], f = r[u], h = [];
          for (let p = 0; p < f.length; ++p) {
            let m = f[p], _ = [], g = [], w = [], y = m.at(-2) / l, v = m.at(-1) / a;
            for (let k = 0; k < d.length; ++k) {
              let [C, x] = [0, 0], E = 0, O = -1 / 0, D = d[k];
              for (let B = 0; B < D.length; ++B) {
                let P = D[B];
                for (let I = 0; I < P.length; ++I) {
                  let S = P[I];
                  E += S, O = Math.max(O, S), C += (I + 0.5) * S, x += B * S;
                }
              }
              if (n != null && O < n) continue;
              let z = [y * C / E, v * x / E];
              _.push(z), w.push(k), g.push(O);
            }
            h.push({
              bbox: m,
              scores: g,
              labels: w,
              keypoints: _
            });
          }
          c.push(h);
        }
        return c;
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/yolos/image_processing_yolos.js
  var go, Cc, Fm = b(() => {
    J();
    go = class extends N {
      /** @type {typeof post_process_object_detection} */
      post_process_object_detection(...e) {
        return Ut(...e);
      }
    }, Cc = class extends go {
    };
  });

  // node_modules/@huggingface/transformers/src/models/image_processors.js
  var Ic = {};
  br(Ic, {
    BeitFeatureExtractor: () => Ol,
    BitImageProcessor: () => Pl,
    CHMv2ImageProcessor: () => Rl,
    CLIPFeatureExtractor: () => $l,
    CLIPImageProcessor: () => to,
    ChineseCLIPFeatureExtractor: () => Ll,
    ConvNextFeatureExtractor: () => Nl,
    ConvNextImageProcessor: () => ro,
    DINOv3ViTImageProcessor: () => Bl,
    DPTFeatureExtractor: () => jl,
    DPTImageProcessor: () => oo,
    DeiTFeatureExtractor: () => Dl,
    DeiTImageProcessor: () => no,
    DetrFeatureExtractor: () => zl,
    DetrImageProcessor: () => so,
    DonutFeatureExtractor: () => Ul,
    DonutImageProcessor: () => Kr,
    EfficientNetImageProcessor: () => Wl,
    GLPNFeatureExtractor: () => Hl,
    Gemma3ImageProcessor: () => Vl,
    Gemma4ImageProcessor: () => Gl,
    Glm46VImageProcessor: () => ql,
    GroundingDinoImageProcessor: () => Yl,
    Idefics3ImageProcessor: () => ao,
    ImageFeatureExtractor: () => N,
    ImageProcessor: () => N,
    JinaCLIPImageProcessor: () => Jl,
    Lfm2VlImageProcessor: () => Zl,
    Lfm3VlImageProcessor: () => Ql,
    LlavaOnevisionImageProcessor: () => ec,
    Mask2FormerImageProcessor: () => nc,
    MaskFormerFeatureExtractor: () => tc,
    MaskFormerImageProcessor: () => Jr,
    MobileNetV1FeatureExtractor: () => sc,
    MobileNetV1ImageProcessor: () => lo,
    MobileNetV2FeatureExtractor: () => oc,
    MobileNetV2ImageProcessor: () => co,
    MobileNetV3FeatureExtractor: () => ic,
    MobileNetV3ImageProcessor: () => uo,
    MobileNetV4FeatureExtractor: () => ac,
    MobileNetV4ImageProcessor: () => fo,
    MobileViTFeatureExtractor: () => lc,
    MobileViTImageProcessor: () => ho,
    NougatImageProcessor: () => cc,
    OwlViTFeatureExtractor: () => uc,
    OwlViTImageProcessor: () => Zr,
    Owlv2ImageProcessor: () => fc,
    Phi3VImageProcessor: () => mc,
    PixtralImageProcessor: () => _c,
    PvtImageProcessor: () => gc,
    Qwen2VLImageProcessor: () => dr,
    RTDetrImageProcessor: () => wc,
    Sam2ImageProcessor: () => jn,
    Sam3ImageProcessor: () => jn,
    SamImageProcessor: () => jn,
    SapiensFeatureExtractor: () => xc,
    SapiensImageProcessor: () => po,
    SegformerFeatureExtractor: () => vc,
    SegformerImageProcessor: () => mo,
    SiglipImageProcessor: () => Ec,
    SmolVLMImageProcessor: () => ao,
    Swin2SRImageProcessor: () => kc,
    VLMImageProcessor: () => Kl,
    ViTFeatureExtractor: () => Ac,
    ViTImageProcessor: () => _o,
    VitMatteImageProcessor: () => Tc,
    VitPoseImageProcessor: () => Sc,
    YolosFeatureExtractor: () => Cc,
    YolosImageProcessor: () => go
  });
  var jm = b(() => {
    Zp();
    Qp();
    em();
    tm();
    rm();
    nm();
    sm();
    om();
    im();
    Fl();
    am();
    lm();
    cm();
    um();
    dm();
    fm();
    hm();
    Xl();
    pm();
    mm();
    gm();
    wm();
    ym();
    bm();
    rc();
    xm();
    vm();
    Em();
    km();
    Am();
    Tm();
    Sm();
    dc();
    Cm();
    Im();
    Mm();
    io();
    Om();
    yc();
    bc();
    Pm();
    Lm();
    Rm();
    $m();
    Nm();
    Dm();
    zm();
    Bm();
    Um();
    Fm();
    J();
  });

  // node_modules/@huggingface/transformers/src/models/auto/image_processing_auto.js
  var wo, Wm = b(() => {
    mt();
    J();
    jm();
    Yr();
    Me();
    wo = class {
      /** @type {typeof ImageProcessor.from_pretrained} */
      static async from_pretrained(e, r = {}) {
        let n = await Ke(
          e,
          Ks,
          !0,
          r
        ), s = n.image_processor_type ?? n.feature_extractor_type, o = Ic[s?.replace(/Fast$/, "")];
        return o || (s !== void 0 && Q.warn(
          `Image processor type '${s}' not found, assuming base ImageProcessor. Please report this at ${Hr}.`
        ), o = N), new o(n);
      }
    };
  });

  // node_modules/@huggingface/tokenizers/dist/tokenizers.mjs
  function V0(t) {
    if (t === null) return null;
    switch (t.type) {
      case "BertNormalizer":
        return new b0(t);
      case "Precompiled":
        return new v0(t);
      case "Sequence":
        return new k0(t);
      case "Replace":
        return new T0(t);
      case "NFC":
        return new I0(t);
      case "NFD":
        return new O0(t);
      case "NFKC":
        return new L0(t);
      case "NFKD":
        return new $0(t);
      case "Strip":
        return new D0(t);
      case "StripAccents":
        return new B0(t);
      case "Lowercase":
        return new F0(t);
      case "Prepend":
        return new W0(t);
      default:
        throw new Error(`Unknown Normalizer type: ${t.type}`);
    }
  }
  function _x(t) {
    if (t === null) return null;
    switch (t.type) {
      case "BertPreTokenizer":
        return new ax();
      case "Sequence":
        return new dx(t);
      case "Whitespace":
        return new J0();
      case "WhitespaceSplit":
        return new hx();
      case "Metaspace":
        return new Q0(t);
      case "ByteLevel":
        return new X0(t);
      case "Split":
        return new tx(t);
      case "Punctuation":
        return new nx(t);
      case "Digits":
        return new ox(t);
      case "Replace":
        return new cx(t);
      case "FixedLength":
        return new mx(t);
      default:
        throw new Error(`Unknown PreTokenizer type: ${t.type}`);
    }
  }
  function Ex(t) {
    if (t.length === 0) throw new Error("Array must not be empty");
    let e = t[0], r = 0;
    for (let n = 1; n < t.length; ++n)
      t[n] < e && (e = t[n], r = n);
    return [e, r];
  }
  function Px(t, e) {
    switch (t.type) {
      case "WordPiece":
        return new Km(t);
      case "Unigram":
        return new Zm(t, e.eos_token);
      case "BPE":
        return new Qm(t);
      default:
        if (t.vocab)
          return Array.isArray(t.vocab) ? new Zm(t, e.eos_token) : Object.hasOwn(t, "continuing_subword_prefix") && Object.hasOwn(t, "unk_token") ? Object.hasOwn(t, "merges") ? new Qm(t) : new Km(t) : new Ox(t, {
            target_lang: e.target_lang,
            bos_token: e.bos_token,
            eos_token: e.eos_token,
            pad_token: e.pad_token,
            unk_token: e.unk_token
          });
        throw new Error(
          `Unknown TokenizerModel type: ${t?.type}`
        );
    }
  }
  function Gx(t) {
    if (t === null) return null;
    switch (t.type) {
      case "TemplateProcessing":
        return new Nx(t);
      case "ByteLevel":
        return new zx(t);
      case "BertProcessing":
        return new Ux(t);
      case "RobertaProcessing":
        return new jx(t);
      case "Sequence":
        return new Vx(t);
      default:
        throw new Error(`Unknown PostProcessor type: ${t.type}`);
    }
  }
  function hv(t) {
    if (t === null) return null;
    switch (t.type) {
      case "ByteLevel":
        return new Yx(t);
      case "WordPiece":
        return new Kx(t);
      case "Metaspace":
        return new Zx(t);
      case "BPEDecoder":
        return new ev(t);
      case "CTC":
        return new rv(t);
      case "Sequence":
        return new sv(t);
      case "Replace":
        return new iv(t);
      case "Fuse":
        return new lv(t);
      case "Strip":
        return new uv(t);
      case "ByteFallback":
        return new fv(t);
      default:
        throw new Error(`Unknown Decoder type: ${t.type}`);
    }
  }
  var Wb, Vm, Vb, Gb, e_, Oc, vo, en, t_, _t, r_, qb, Hb, Yb, Xb, Wn, Kb, Jb, Zb, n_, Qb, s_, e0, o_, t0, r0, n0, s0, i_, a_, yo, Gm, o0, l_, qm, Hm, Pc, bo, Ft, i0, c_, Ym, a0, u_, l0, c0, u0, d0, f0, h0, p0, it, Lc, m0, d_, Xm, _0, g0, Vn, w0, St, y0, b0, x0, v0, E0, k0, A0, T0, S0, Eo, C0, I0, M0, O0, P0, L0, R0, $0, N0, D0, z0, B0, U0, F0, j0, W0, f_, G0, at, h_, q0, H0, xo, Y0, X0, K0, J0, Z0, Q0, ex, tx, rx, nx, sx, ox, ix, ax, lx, cx, ux, dx, fx, hx, px, mx, p_, gx, ko, wx, Km, Jm, yx, bx, Mc, xx, vx, kx, Zm, Ax, Tx, Sx, Cx, Ix, Qm, Mx, Ox, Lx, Rx, Gn, $x, Nx, Dx, zx, Bx, Ux, Fx, jx, Wx, Vx, g_, qx, Je, Hx, Yx, Xx, Kx, Jx, Zx, Qx, ev, tv, rv, nv, sv, ov, iv, av, lv, cv, uv, dv, fv, w_, pv, y_, Rc = b(() => {
    Wb = class {
      /**
       * @param dictionary The dictionary of words to use for splitting.
       */
      constructor(t) {
        this.trie = this._build_trie(t);
      }
      /**
       * Builds a trie from the given dictionary.
       * @param dictionary The dictionary of words to build the trie from.
       * @returns The root node of the trie.
       * @private
       */
      _build_trie(t) {
        let e = /* @__PURE__ */ Object.create(null);
        for (let r of t) {
          let n = e;
          for (let s = 0; s < r.length; ++s) {
            let o = r[s];
            n = n[o] ??= /* @__PURE__ */ Object.create(null);
          }
          n.end = r;
        }
        return e;
      }
      /**
       * Splits the input text into tokens based on the dictionary.
       * @param text The input text to split.
       * @returns An array of tokens.
       */
      split(t) {
        let e = [], r = t.length, n = 0, s = 0;
        for (; s < r; ) {
          let o = this.trie, i = null, a = s;
          for (; a < r && (o = o[t[a]]); )
            o.end && (i = o.end), ++a;
          i ? (s > n && e.push(t.slice(n, s)), e.push(i), s += i.length, n = s) : ++s;
        }
        return n < r && e.push(t.slice(n)), e;
      }
    }, Vm = Wb, Vb = class {
      /**
       * Creates a new instance of AddedToken.
       * @param config Added token configuration object.
       */
      constructor(t) {
        this.content = t.content, this.id = t.id, this.single_word = t.single_word ?? !1, this.lstrip = t.lstrip ?? !1, this.rstrip = t.rstrip ?? !1, this.special = t.special ?? !1, this.normalized = t.normalized ?? !this.special;
      }
    }, Gb = Vb, e_ = (t, e) => {
      try {
        return new RegExp(t, e);
      } catch (r) {
        if (!(r instanceof SyntaxError)) throw r;
        let n = /* @__PURE__ */ new Map(), s = t.replace(
          /(\\[pP])\{([^}=]+)\}/g,
          (o, i, a, l) => {
            let c = 0;
            for (let d = l - 1; d >= 0 && t[d] === "\\"; --d)
              ++c;
            if (c % 2 === 1) return o;
            let u = n.get(a);
            if (u === void 0) {
              try {
                new RegExp(`\\p{${a}}`, "u"), u = a;
              } catch {
                u = `Script=${a}`;
              }
              n.set(a, u);
            }
            return `${i}{${u}}`;
          }
        );
        if (s === t) throw r;
        try {
          return new RegExp(s, e);
        } catch {
          throw r;
        }
      }
    }, Oc = (t) => t.replace(/ \./g, ".").replace(/ \?/g, "?").replace(/ \!/g, "!").replace(/ ,/g, ",").replace(/ \' /g, "'").replace(/ n't/g, "n't").replace(/ 'm/g, "'m").replace(/ 's/g, "'s").replace(/ 've/g, "'ve").replace(/ 're/g, "'re"), vo = (t, e = !0) => {
      if (t.Regex !== void 0) {
        let r = l0(
          o0(t.Regex)
        );
        return e_(r, "gu");
      } else if (t.String !== void 0) {
        let r = c0(t.String);
        return new RegExp(e ? r : `(${r})`, "gu");
      } else
        return console.warn("Unknown pattern type:", t), null;
    }, en = "\\p{Alphabetic}\\p{M}\\p{Nd}\\p{Pc}", t_ = `${en}\\u00B2\\u00B3\\u00B9\\u00BC-\\u00BE`, _t = `[${t_}]`, r_ = `[^${t_}]`, qb = `(?:(?<!${_t})(?=${_t})|(?<=${_t})(?!${_t}))`, Hb = `(?:(?<!${_t})(?!${_t})|(?<=${_t})(?=${_t}))`, Yb = "(?:(?<![\\s\\S])|(?<=\\n))", Xb = "(?:(?=\\n)|(?![\\s\\S]))", Wn = "0-9A-Fa-f", Kb = /* @__PURE__ */ new Map([
      ["A", "(?<![\\s\\S])"],
      ["z", "(?![\\s\\S])"],
      ["Z", "(?=\\n?(?![\\s\\S]))"],
      // \Z permits a single optional final \n (not \r\n)
      ["h", `[${Wn}]`],
      ["H", `[^${Wn}]`],
      ["w", _t],
      ["W", r_],
      ["d", "\\p{Nd}"],
      ["D", "\\P{Nd}"],
      ["s", "\\p{White_Space}"],
      // JS \s wrongly adds U+FEFF and misses \x85
      ["S", "\\P{White_Space}"],
      ["b", qb],
      ["B", Hb],
      ["a", "\\x07"],
      ["e", "\\x1B"]
    ]), Jb = /* @__PURE__ */ new Map([
      ["h", Wn],
      ["w", en],
      ["d", "\\p{Nd}"],
      ["D", "\\P{Nd}"],
      ["s", "\\p{White_Space}"],
      ["S", "\\P{White_Space}"],
      ["a", "\\x07"],
      ["e", "\\x1B"]
    ]), Zb = /* @__PURE__ */ new Map([
      ["W", `[^${en}]`],
      ["H", `[^${Wn}]`]
    ]), n_ = /* @__PURE__ */ new Map([
      [`
`, "\\n"],
      ["\r", "\\r"],
      ["	", "\\t"],
      ["\f", "\\f"],
      ["\v", "\\v"]
    ]), Qb = /* @__PURE__ */ new Map([
      ["alpha", "\\p{Alphabetic}"],
      ["alnum", "\\p{Alphabetic}\\p{Nd}"],
      ["digit", "\\p{Nd}"],
      ["lower", "\\p{Lowercase}"],
      ["upper", "\\p{Uppercase}"],
      ["space", "\\p{White_Space}"],
      ["blank", "\\t\\p{Zs}"],
      ["punct", "\\p{P}\\p{S}"],
      ["cntrl", "\\p{Cc}"],
      ["word", en],
      ["xdigit", Wn]
    ]), s_ = "^$\\.*+?()[]{}|/", e0 = /^\(\?(?:<[=!]|<[A-Za-z_][A-Za-z0-9_]*>|[:=!>])/, o_ = /^\\([pPxu])\{([^}]*)\}/, t0 = /^\{(\d+(?:,\d*)?|,\d+)\}/, r0 = /^\[:(\^?)(\p{Alphabetic}+):\]/u, n0 = /^\[:\^:\]/, s0 = /^\[(?:\.[^\]]*\.\]|=[^\]]*=\])/, i_ = /^(?:\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|\\c[A-Za-z])/, a_ = (t) => t >= "A" && t <= "Z" || t >= "a" && t <= "z", yo = (t, e) => String.fromCodePoint(t.codePointAt(e)), Gm = (t) => {
      if (!/^[0-9A-Fa-f]{1,8}$/.test(t)) return null;
      let e = Number.parseInt(t, 16);
      if (e > 127) return null;
      let r = String.fromCharCode(e);
      return a_(r) ? `[${r.toLowerCase()}${r.toUpperCase()}]` : null;
    }, o0 = (t) => t.replace(/\[\^\(\\s\|\[([^\]]+)\]\)\]/g, "[^()|\\s$1]"), l_ = "[\\s\\S]", qm = 256, Hm = () => ({
      fragment: "",
      alternatives: [],
      tail: null,
      contains_complex_set: !1
    }), Pc = (t) => {
      throw new SyntaxError(
        `Unsupported range with a set-valued character-class operand at index ${t}`
      );
    }, bo = (t, e, r, n = !0) => {
      t.tail === "range" && Pc(r), t.alternatives.push(e), t.tail = "set", t.contains_complex_set = t.contains_complex_set || n;
    }, Ft = (t, e, r = !1, n = -1) => {
      if (r && t.tail === "range" && Pc(n), t.tail === "range") {
        t.fragment += e, t.tail = "complete_range";
        return;
      }
      t.fragment += e, t.tail = r ? "set" : "scalar", t.contains_complex_set = t.contains_complex_set || r;
    }, i0 = (t, e, r) => {
      let n = o_.exec(t.slice(e));
      if (n) {
        let [f, h, p] = n;
        if (h === "P" && p === "Word")
          bo(
            r,
            `[^${en}]`,
            e
          );
        else {
          let m = h === "x" ? `\\u{${p}}` : h === "p" && p === "Word" ? en : f;
          Ft(
            r,
            m,
            h === "p" || h === "P",
            e
          );
        }
        return e + f.length;
      }
      let s = i_.exec(t.slice(e));
      if (s)
        return Ft(r, s[0]), e + s[0].length;
      if (e + 1 >= t.length)
        throw new SyntaxError(
          `Unterminated escape in character class at index ${e}`
        );
      let o = yo(t, e + 1), i = e + 1 + o.length, a = n_.get(o);
      if (a !== void 0)
        return Ft(r, a), i;
      let l = Zb.get(o);
      if (l !== void 0)
        return bo(r, l, e), i;
      let c = Jb.get(o), u, d = !1;
      return c !== void 0 ? (u = c, d = o !== "a" && o !== "e") : /[A-Za-z0-9]/.test(o) ? u = `\\${o}` : s_.includes(o) || o === "-" ? u = `\\${o}` : u = o, Ft(r, u, d, e), i;
    }, c_ = (t) => t.length === 1 ? t[0] : `(?:(?=(?:${t.join("|")}))${l_})`, Ym = (t) => {
      let e = t.fragment.length === 0 ? t.alternatives : [`[${t.fragment}]`, ...t.alternatives];
      return c_(e);
    }, a0 = (t) => {
      let e = e_(`^(?:${t})$`, "u"), r = "";
      for (let n = 0; n < 26; ++n) {
        let s = String.fromCharCode(65 + n), o = String.fromCharCode(97 + n), i = e.test(s), a = e.test(o);
        i !== a && (r += i ? o : s);
      }
      return r;
    }, u_ = (t, e, r, n = !0, s = 1) => {
      if (s > qm)
        throw new SyntaxError(
          `Maximum character-class nesting depth of ${qm} exceeded at index ${e}`
        );
      let o = e + 1, i = t[o] === "^";
      i && ++o;
      let a = o, l = [Hm()], c = l[0], u = !1;
      for (; o < t.length; ) {
        let d = yo(t, o);
        if (d === "\\") {
          o = i0(t, o, c);
          continue;
        }
        if (d === "]") {
          if (o === a) {
            Ft(c, "\\]"), ++o;
            continue;
          }
          if (c.tail === null)
            throw l.length > 1 ? new SyntaxError(
              `Malformed character-class intersection with an empty operand at index ${o}`
            ) : new SyntaxError(`Empty character class at index ${e}`);
          let f = l.some(
            (w) => w.contains_complex_set
          );
          if (i && l.length > 1 && u)
            throw new SyntaxError(
              `Unsupported outer-negated character-class intersection with a nested negated class containing a Unicode property, POSIX class, or shorthand at index ${e}`
            );
          let h = Ym(l[0]), p = h;
          if (l.length > 1) {
            let w = "";
            for (let y = 1; y < l.length; ++y)
              w += `(?=${Ym(l[y])})`;
            p = `(?:${w}${h})`;
          }
          let m = l.length === 1 && c.alternatives.length === 0, _ = c.fragment;
          if (r && n) {
            let w = a0(p);
            w.length > 0 && (m ? (_ += w, p = `[${_}]`) : p = c_([
              p,
              `[${w}]`
            ]));
          }
          return {
            atom: i ? m ? `[^${_}]` : `(?:(?!${p})${l_})` : p,
            end: o + 1,
            negated: i,
            contains_complex_set: f,
            contains_nested_negated_complex_set: u
          };
        }
        if (t.startsWith("&&", o)) {
          if (c.tail === null)
            throw new SyntaxError(
              `Malformed character-class intersection with an empty operand at index ${o}`
            );
          c = Hm(), l.push(c), o += 2;
          continue;
        }
        if (d === "[") {
          let f = t.slice(o);
          if (n0.test(f))
            throw new SyntaxError(
              `Malformed empty negated POSIX character class at index ${o}`
            );
          let h = r0.exec(f);
          if (h) {
            let [, m, _] = h, g = Qb.get(_);
            if (g === void 0)
              throw new SyntaxError(
                `Unsupported POSIX character class "${_}" at index ${o}`
              );
            if (r && m && (_ === "lower" || _ === "upper"))
              throw new SyntaxError(
                `Unsupported negated POSIX ${_} class inside an inline case-insensitive group`
              );
            m ? bo(c, `[^${g}]`, o) : Ft(c, g, !0, o), o += h[0].length;
            continue;
          }
          if (s0.test(f))
            throw new SyntaxError(
              `Unsupported POSIX collating or equivalence bracket expression at index ${o}`
            );
          let p = u_(
            t,
            o,
            r,
            !1,
            s + 1
          );
          bo(
            c,
            p.atom,
            o,
            p.contains_complex_set
          ), u ||= p.contains_nested_negated_complex_set || p.negated && p.contains_complex_set, o = p.end;
          continue;
        }
        if (d === "-") {
          let f = t[o + 1] === "]" || t.startsWith("&&", o + 1);
          c.tail === "set" && !f && Pc(o), c.tail === null || c.tail === "range" || c.tail === "complete_range" || f ? Ft(c, "\\-") : (c.fragment += "-", c.tail = "range"), ++o;
          continue;
        }
        Ft(
          c,
          d === "^" && c.fragment.length === 0 ? "\\^" : d
        ), o += d.length;
      }
      throw new SyntaxError(
        `${l.length > 1 ? "Unterminated character-class intersection" : "Unterminated character class"} at index ${e}`
      );
    }, l0 = (t) => {
      let e = "", r = -1, n = !1, s = !1, o = [], i = (a) => {
        r = e.length, e += a, n = !1;
      };
      for (let a = 0; a < t.length; ) {
        let l = yo(t, a);
        if (l === "\\") {
          let c = o_.exec(t.slice(a));
          if (c) {
            let [m, _, g] = c, w = m;
            if (_ === "x") {
              let y = `\\u{${g}}`;
              w = s ? Gm(g) ?? y : y;
            } else g === "Word" && (w = _ === "p" ? _t : r_);
            i(w), a += m.length;
            continue;
          }
          let u = i_.exec(t.slice(a));
          if (u) {
            let m = u[0], _ = s && m[1] !== "c" ? Gm(m.slice(2)) ?? m : m;
            i(_), a += m.length;
            continue;
          }
          if (a + 1 >= t.length) {
            e += l;
            break;
          }
          let d = yo(t, a + 1);
          if (a += 1 + d.length, d === "G")
            continue;
          let f = n_.get(d);
          if (f !== void 0) {
            i(f);
            continue;
          }
          let h = Kb.get(d), p;
          h !== void 0 ? p = h : /[A-Za-z0-9]/.test(d) ? p = `\\${d}` : s_.includes(d) ? p = `\\${d}` : p = d, i(p);
          continue;
        }
        switch (l) {
          case "[": {
            let c = u_(t, a, s);
            i(c.atom), a = c.end;
            continue;
          }
          case "]":
            i("\\]"), ++a;
            continue;
          case ".":
            i("[^\\n]"), ++a;
            continue;
          case "^":
            i(Yb), ++a;
            continue;
          case "$":
            i(Xb), ++a;
            continue;
          case "(": {
            let c = t.startsWith("(?i:", a), u = c ? "(?i:" : e0.exec(t.slice(a))?.[0] ?? "(", d = c || u === "(?>" ? "(?:" : u;
            o.push([e.length, s]), c && (s = !0), e += d, n = !1, a += u.length;
            continue;
          }
          case ")":
            e += l, [r, s] = o.pop() ?? [-1, !1], n = !1, ++a;
            continue;
          case "|":
            e += l, r = -1, n = !1, ++a;
            continue;
          case "{": {
            let c = t0.exec(t.slice(a));
            if (!c || r < 0) {
              i("\\{"), ++a;
              continue;
            }
            let u = c[1].startsWith(",") ? `0${c[1]}` : c[1];
            a += c[0].length;
            let d = t[a];
            d === "+" || d === "*" ? (e = `${e.slice(0, r)}(?:${e.slice(r)}{${u}})${d}`, ++a) : e += `{${u}}`, n = !0;
            continue;
          }
          case "}":
            i("\\}"), ++a;
            continue;
          case "+":
            if (n) {
              ++a;
              continue;
            }
            e += l, n = !0, ++a;
            continue;
          case "*":
          case "?":
            e += l, n = !0, ++a;
            continue;
          default:
            i(
              s && a_(l) ? `[${l.toLowerCase()}${l.toUpperCase()}]` : l
            ), a += l.length;
            continue;
        }
      }
      return e;
    }, c0 = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), u0 = (t, e, r) => {
      let n = [], s = 0;
      for (; s < t.length; ) {
        if (n.push(t[s]), (e.get(t[s]) ?? r) !== r) {
          ++s;
          continue;
        }
        for (; ++s < t.length && (e.get(t[s]) ?? r) === r; )
          e.get(n.at(-1)) !== r && (n[n.length - 1] += t[s]);
      }
      return n;
    }, d0 = (t) => t >= 19968 && t <= 40959 || t >= 13312 && t <= 19903 || t >= 131072 && t <= 173791 || t >= 173824 && t <= 177983 || t >= 177984 && t <= 178207 || t >= 178208 && t <= 183983 || t >= 63744 && t <= 64255 || t >= 194560 && t <= 195103, f0 = (t) => Number.isInteger(t) || typeof t == "bigint", h0 = (t) => {
      let e = 0;
      for (let r of t) ++e;
      return e;
    }, p0 = (t) => d_(t.toLowerCase()), it = (...t) => Array.prototype.concat.apply([], t), Lc = (t) => new Map(Object.entries(t)), m0 = (t, e) => {
      let r = [], n = 0;
      for (let s of t.matchAll(e)) {
        let o = s[0];
        n < s.index && r.push(t.slice(n, s.index)), o.length > 0 && r.push(o), n = s.index + o.length;
      }
      return n < t.length && r.push(t.slice(n)), r;
    }, d_ = (t) => t.replace(/\p{M}/gu, ""), Xm = (t, e, r = []) => {
      if (!t || Array.isArray(t) || typeof t != "object")
        return `${e} must be a valid object`;
      for (let n of r)
        if (!(n in t))
          return `${e} must contain a "${n}" property`;
      return null;
    }, _0 = (t) => t.match(/\S+/g) || [], g0 = class {
      /**
       * Creates a new instance of the Callable class.
       */
      constructor() {
        let t = function(...e) {
          return t._call(...e);
        };
        return Object.setPrototypeOf(t, new.target.prototype);
      }
    }, Vn = g0, w0 = class extends Vn {
      /**
       * @param config The configuration object for the normalizer.
       */
      constructor(t) {
        super(), this.config = t;
      }
      /**
       * Alias for {@link Normalizer#normalize}.
       * @param text The text to normalize.
       * @returns The normalized text.
       */
      _call(t) {
        return this.normalize(t);
      }
    }, St = w0, y0 = class extends St {
      /**
       * Adds whitespace around any CJK (Chinese, Japanese, or Korean) character in the input text.
       *
       * @param text The input text to tokenize.
       * @returns The tokenized text with whitespace added around CJK characters.
       */
      tokenize_chinese_chars(t) {
        let e = [];
        for (let r = 0; r < t.length; ++r) {
          let n = t[r], s = n.charCodeAt(0);
          d0(s) ? (e.push(" "), e.push(n), e.push(" ")) : e.push(n);
        }
        return e.join("");
      }
      /**
       * Strips accents from the given text.
       * @param text The text to strip accents from.
       * @returns The text with accents removed.
       */
      strip_accents(t) {
        return t.normalize("NFD").replace(/\p{Mn}/gu, "");
      }
      /**
       * Checks whether `char` is a control character.
       * @param char The character to check.
       * @returns Whether `char` is a control character.
       */
      is_control(t) {
        switch (t) {
          case "	":
          case `
`:
          case "\r":
            return !1;
          default:
            return /^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(t);
        }
      }
      /**
       * Performs invalid character removal and whitespace cleanup on text.
       * @param text The text to clean.
       * @returns The cleaned text.
       */
      clean_text(t) {
        let e = [];
        for (let r of t) {
          let n = r.charCodeAt(0);
          n === 0 || n === 65533 || this.is_control(r) || (/^\s$/.test(r) ? e.push(" ") : e.push(r));
        }
        return e.join("");
      }
      /**
       * Normalizes the given text based on the configuration.
       * @param text The text to normalize.
       * @returns The normalized text.
       */
      normalize(t) {
        return this.config.clean_text && (t = this.clean_text(t)), this.config.handle_chinese_chars && (t = this.tokenize_chinese_chars(t)), this.config.lowercase ? (t = t.toLowerCase(), this.config.strip_accents !== !1 && (t = this.strip_accents(t))) : this.config.strip_accents && (t = this.strip_accents(t)), t;
      }
    }, b0 = y0, x0 = class extends St {
      /**
       * Create a new instance of Precompiled normalizer.
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.charsmap = t.precompiled_charsmap ?? null;
      }
      /**
       * Normalizes the given text by applying the precompiled charsmap.
       * @param text The text to normalize.
       * @returns The normalized text.
       */
      normalize(t) {
        return t = t.replace(
          /[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,
          ""
        ), t = t.replace(
          /[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm,
          " "
        ), t.includes("\uFF5E") ? t = t.split("\uFF5E").map((r) => r.normalize("NFKC")).join("\uFF5E") : t = t.normalize("NFKC"), t;
      }
    }, v0 = x0, E0 = class extends St {
      /**
       * Create a new instance of NormalizerSequence.
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.normalizers = (t.normalizers ?? []).map(
          (e) => f_(e)
        );
      }
      /**
       * Apply a sequence of Normalizers to the input text.
       * @param text The text to normalize.
       * @returns The normalized text.
       */
      normalize(t) {
        return this.normalizers.reduce((e, r) => r ? r.normalize(e) : e, t);
      }
    }, k0 = E0, A0 = class extends St {
      /**
       * @param config The configuration object for the normalizer.
       */
      constructor(t) {
        super(t), this.pattern = vo(this.config.pattern ?? {});
      }
      /**
       * Normalize the input text by replacing the pattern with the content.
       * @param text The input text to be normalized.
       * @returns The normalized text after replacing the pattern with the content.
       */
      normalize(t) {
        return this.pattern === null ? t : t.replaceAll(this.pattern, this.config.content ?? "");
      }
    }, T0 = A0, S0 = class extends St {
      constructor() {
        super(...arguments), this.form = "NFC";
      }
      /**
       * Normalize the input text by applying Unicode normalization.
       * @param text The input text to be normalized.
       * @returns The normalized text.
       */
      normalize(t) {
        return t = t.normalize(this.form), t;
      }
    }, Eo = S0, C0 = class extends Eo {
      constructor() {
        super(...arguments), this.form = "NFC";
      }
    }, I0 = C0, M0 = class extends Eo {
      constructor() {
        super(...arguments), this.form = "NFD";
      }
    }, O0 = M0, P0 = class extends Eo {
      constructor() {
        super(...arguments), this.form = "NFKC";
      }
    }, L0 = P0, R0 = class extends Eo {
      constructor() {
        super(...arguments), this.form = "NFKD";
      }
    }, $0 = R0, N0 = class extends St {
      /**
       * Strip leading and/or trailing whitespace from the input text.
       * @param text The input text.
       * @returns The normalized text.
       */
      normalize(t) {
        return this.config.strip_left && this.config.strip_right ? t = t.trim() : (this.config.strip_left && (t = t.trimStart()), this.config.strip_right && (t = t.trimEnd())), t;
      }
    }, D0 = N0, z0 = class extends St {
      /**
       * Remove all accents from the text.
       * @param text The input text.
       * @returns The normalized text without accents.
       */
      normalize(t) {
        return d_(t);
      }
    }, B0 = z0, U0 = class extends St {
      /**
       * Lowercases the input string.
       * @param {string} text The text to normalize.
       * @returns {string} The normalized text.
       */
      normalize(t) {
        return t.toLowerCase();
      }
    }, F0 = U0, j0 = class extends St {
      /**
       * Prepends the input string.
       * @param text The text to normalize.
       * @returns The normalized text.
       */
      normalize(t) {
        return t = this.config.prepend + t, t;
      }
    }, W0 = j0;
    f_ = V0, G0 = class extends Vn {
      /**
       * Tokenizes the given text into pre-tokens.
       * @param text The text or array of texts to pre-tokenize.
       * @param options Additional options for the pre-tokenization logic.
       * @returns An array of pre-tokens.
       */
      pre_tokenize(t, e) {
        return (Array.isArray(t) ? t.map((r) => this.pre_tokenize_text(r, e)) : this.pre_tokenize_text(t, e)).flat();
      }
      /**
       * Alias for {@link PreTokenizer#pre_tokenize}.
       * @param text The text or array of texts to pre-tokenize.
       * @param options Additional options for the pre-tokenization logic.
       * @returns An array of pre-tokens.
       */
      _call(t, e) {
        return this.pre_tokenize(t, e);
      }
    }, at = G0, h_ = (() => {
      let t = [
        ...Array.from(
          { length: 94 },
          (s, o) => o + 33
        ),
        ...Array.from(
          { length: 12 },
          (s, o) => o + 161
        ),
        ...Array.from(
          { length: 82 },
          (s, o) => o + 174
        )
      ], e = t.slice(), r = 0;
      for (let s = 0; s < 256; ++s)
        t.includes(s) || (t.push(s), e.push(256 + r), r += 1);
      let n = e.map((s) => String.fromCharCode(s));
      return Object.fromEntries(t.map((s, o) => [s, n[o]]));
    })(), q0 = (t) => Object.fromEntries(Object.entries(t).map(([e, r]) => [r, e])), H0 = q0(h_), xo = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E", Y0 = class extends at {
      /**
       * Creates a new instance of the `ByteLevelPreTokenizer` class.
       * @param config The configuration object.
       */
      constructor(t) {
        super(), this.config = t, this.add_prefix_space = this.config.add_prefix_space ?? !1, this.trim_offsets = this.config.trim_offsets ?? !1, this.use_regex = this.config.use_regex ?? !0, this.pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu, this.byte_encoder = h_, this.text_encoder = new TextEncoder();
      }
      /**
       * Tokenizes a single piece of text using byte-level tokenization.
       * @param text The text to tokenize.
       * @param options Additional options for the pre-tokenization logic.
       * @returns An array of tokens.
       */
      pre_tokenize_text(t, e) {
        return this.add_prefix_space && !t.startsWith(" ") && (t = " " + t), (this.use_regex ? t.match(this.pattern) || [] : [t]).map(
          (n) => Array.from(
            this.text_encoder.encode(n),
            (s) => this.byte_encoder[s]
          ).join("")
        );
      }
    }, X0 = Y0, K0 = class extends at {
      /**
       * Pre-tokenizes the input text by splitting it on word boundaries.
       * @param text The text to be pre-tokenized.
       * @param options Additional options for the pre-tokenization logic.
       * @returns An array of tokens produced by splitting the input text on whitespace.
       */
      pre_tokenize_text(t, e) {
        return t.match(/\w+|[^\w\s]+/g) || [];
      }
    }, J0 = K0, Z0 = class extends at {
      /**
       * @param config The configuration object for the MetaspacePreTokenizer.
       */
      constructor(t) {
        super(), this.replacement = t.replacement ?? "\u2581", this.str_rep = t.str_rep || this.replacement, this.prepend_scheme = t.prepend_scheme ?? "always";
      }
      /**
       * This method takes a string, replaces spaces with the replacement character,
       * adds a prefix space if requested, and returns a new list of tokens.
       * @param text The text to pre-tokenize.
       * @param options The options for the pre-tokenization.
       * @returns A new list of pre-tokenized tokens.
       */
      pre_tokenize_text(t, e) {
        let { section_index: r = void 0 } = e ?? {}, n = t.replaceAll(" ", this.str_rep);
        return (
          // We add a prefix space if:
          //  (1) The normalized token does not already start with the replacement character.
          !n.startsWith(this.replacement) && // and (2) either:
          //  (a) prepend_scheme is 'always'
          //  (b) prepend_scheme is 'first' and this is the first section
          (this.prepend_scheme === "always" || this.prepend_scheme === "first" && r === 0) && (n = this.str_rep + n), [n]
        );
      }
    }, Q0 = Z0, ex = class extends at {
      /**
       * @param config The configuration options for the pre-tokenizer.
       */
      constructor(t) {
        super(), this.config = t, this.pattern = vo(
          this.config.pattern ?? {},
          this.config.invert ?? !0
        );
      }
      /**
       * Tokenizes text by splitting it using the given pattern.
       * @param text The text to tokenize.
       * @returns An array of tokens.
       */
      pre_tokenize_text(t) {
        return this.pattern === null ? [] : this.config.invert ? (t.match(this.pattern) || []).filter((e) => e) : this.config.behavior?.toLowerCase() === "removed" ? t.split(this.pattern).filter((e) => e) : m0(t, this.pattern);
      }
    }, tx = ex, rx = class extends at {
      /**
       * @param config The configuration options for the pre-tokenizer.
       */
      constructor(t) {
        super(), this.config = t, this.pattern = new RegExp(
          `[^${xo}]+|[${xo}]+`,
          "gu"
        );
      }
      /**
       * Tokenizes text by splitting it using the given pattern.
       * @param text The text to tokenize.
       * @returns An array of tokens.
       */
      pre_tokenize_text(t) {
        return t.match(this.pattern) || [];
      }
    }, nx = rx, sx = class extends at {
      /**
       * @param config The configuration options for the pre-tokenizer.
       */
      constructor(t) {
        super(), this.config = t;
        let e = `[^\\d]+|\\d${this.config.individual_digits ? "" : "+"}`;
        this.pattern = new RegExp(e, "gu");
      }
      /**
       * Tokenizes text by splitting it using the given pattern.
       * @param text The text to tokenize.
       * @returns An array of tokens.
       */
      pre_tokenize_text(t) {
        return t.match(this.pattern) || [];
      }
    }, ox = sx, ix = class extends at {
      /**
       * A PreTokenizer that splits text into wordpieces using a basic tokenization scheme
       * similar to that used in the original implementation of BERT.
       */
      constructor() {
        super(), this.pattern = new RegExp(
          `[^\\s${xo}]+|[${xo}]`,
          "gu"
        );
      }
      /**
       * Tokenizes a single text using the BERT pre-tokenization scheme.
       *
       * @param text The text to tokenize.
       * @param options Additional options for the pre-tokenization logic.
       * @returns An array of tokens.
       */
      pre_tokenize_text(t, e) {
        return t.trim().match(this.pattern) || [];
      }
    }, ax = ix, lx = class extends at {
      /**
       * @param config The configuration options for the pre-tokenizer.
       */
      constructor(t) {
        super(), this.config = t, this.pattern = vo(this.config.pattern ?? {}), this.content = this.config.content ?? "";
      }
      /**
       * Pre-tokenizes the input text by replacing certain characters.
       * @param text The text to be pre-tokenized.
       * @returns An array of tokens produced by replacing certain characters.
       */
      pre_tokenize_text(t) {
        return this.pattern === null ? [t] : [t.replaceAll(this.pattern, this.config.content ?? "")];
      }
    }, cx = lx, ux = class extends at {
      /**
       * Creates an instance of PreTokenizerSequence.
       * @param config The configuration object for the pre-tokenizer sequence.
       */
      constructor(t) {
        super(), this.tokenizers = (t.pretokenizers ?? []).map(
          (e) => p_(e)
        );
      }
      /**
       * Applies each pre-tokenizer in the sequence to the input text in turn.
       * @param text The text to pre-tokenize.
       * @param options Additional options for the pre-tokenization logic.
       * @returns The pre-tokenized text.
       */
      pre_tokenize_text(t, e) {
        return this.tokenizers.reduce(
          (r, n) => n ? n.pre_tokenize(r, e) : r,
          [t]
        );
      }
    }, dx = ux, fx = class extends at {
      /**
       * Pre-tokenizes the input text by splitting it on whitespace characters.
       * @param text The text to be pre-tokenized.
       * @returns An array of tokens produced by splitting the input text on whitespace.
       */
      pre_tokenize_text(t) {
        return _0(t);
      }
    }, hx = fx, px = class extends at {
      /**
       * @param config The configuration options for the pre-tokenizer.
       */
      constructor(t) {
        super(), this.config = t, this._length = t.length;
      }
      /**
       * Pre-tokenizes the input text by splitting it into fixed-length tokens.
       * @param text The text to be pre-tokenized.
       * @returns An array of tokens produced by splitting the input text into fixed-length tokens.
       */
      pre_tokenize_text(t) {
        let e = [];
        for (let r = 0; r < t.length; r += this._length)
          e.push(t.slice(r, r + this._length));
        return e;
      }
    }, mx = px;
    p_ = _x, gx = class extends Vn {
      /**
       * Creates a new instance of TokenizerModel.
       * @param config The configuration object for the TokenizerModel.
       */
      constructor(t) {
        super(), this.config = t, this.vocab = [], this.tokens_to_ids = /* @__PURE__ */ new Map(), this.unk_token_id = void 0, this.unk_token = void 0, this.end_of_word_suffix = void 0, this.fuse_unk = this.config.fuse_unk ?? !1;
      }
      /**
       * Internal function to call the TokenizerModel instance.
       * @param tokens The tokens to encode.
       * @returns The encoded tokens.
       */
      _call(t) {
        let e = this.encode(t);
        return this.fuse_unk && (e = u0(e, this.tokens_to_ids, this.unk_token_id)), e;
      }
    }, ko = gx, wx = class extends ko {
      /**
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.max_input_chars_per_word = 100, this.tokens_to_ids = Lc(t.vocab), this.unk_token_id = this.tokens_to_ids.get(t.unk_token), this.unk_token = t.unk_token, this.max_input_chars_per_word = t.max_input_chars_per_word ?? 100, this.vocab = new Array(this.tokens_to_ids.size);
        for (let [e, r] of this.tokens_to_ids)
          this.vocab[r] = e;
      }
      /**
       * Encodes an array of tokens using WordPiece encoding.
       * @param tokens The tokens to encode.
       * @returns An array of encoded tokens.
       */
      encode(t) {
        let e = [];
        for (let r of t) {
          let n = [...r];
          if (n.length > this.max_input_chars_per_word) {
            e.push(this.unk_token);
            continue;
          }
          let s = !1, o = 0, i = [];
          for (; o < n.length; ) {
            let a = n.length, l = null;
            for (; o < a; ) {
              let c = n.slice(o, a).join("");
              if (o > 0 && (c = this.config.continuing_subword_prefix + c), this.tokens_to_ids.has(c)) {
                l = c;
                break;
              }
              --a;
            }
            if (l === null) {
              s = !0;
              break;
            }
            i.push(l), o = a;
          }
          s ? e.push(this.unk_token) : e.push(...i);
        }
        return e;
      }
    }, Km = wx, Jm = class m_ {
      /**
       * Create a new CharTrieNode.
       * @param is_leaf Whether the node is a leaf node or not.
       * @param children A map containing the node's children, where the key is a character and the value is a `CharTrieNode`.
       */
      constructor(e, r) {
        this.is_leaf = e, this.children = r;
      }
      /**
       * Returns a new `CharTrieNode` instance with default values.
       * @returns A new `CharTrieNode` instance with `is_leaf` set to `false` and an empty `children` map.
       */
      static default() {
        return new m_(!1, /* @__PURE__ */ new Map());
      }
    }, yx = class {
      constructor() {
        this.root = Jm.default();
      }
      /**
       * Adds one or more `texts` to the trie.
       * @param texts The strings to add to the trie.
       */
      extend(t) {
        for (let e of t)
          this.push(e);
      }
      /**
       * Adds text to the trie.
       * @param text The string to add to the trie.
       */
      push(t) {
        let e = this.root;
        for (let r of t) {
          let n = e.children.get(r);
          n === void 0 && (n = Jm.default(), e.children.set(r, n)), e = n;
        }
        e.is_leaf = !0;
      }
      /**
       * Searches the trie for stored strings that match `chars` starting at `start`.
       * @param chars The input characters to search.
       * @param start The index to start searching from.
       * @yields Each stored string that is a prefix of `chars` starting at `start`.
       */
      *common_prefix_search(t, e = 0) {
        let r = this.root;
        if (r === void 0) return;
        let n = "";
        for (let s = e; s < t.length; ++s) {
          let o = t[s];
          if (n += o, r = r.children.get(o), r === void 0) return;
          r.is_leaf && (yield n);
        }
      }
    }, bx = yx, Mc = class __ {
      /**
       * Represents a node in a token lattice for a given sentence.
       * @param token_id The ID of the token associated with this node.
       * @param node_id The ID of this node.
       * @param pos The starting position of the token in the sentence.
       * @param length The length of the token.
       * @param score The score associated with the token.
       */
      constructor(e, r, n, s, o) {
        this.token_id = e, this.node_id = r, this.pos = n, this.length = s, this.score = o, this.prev = null, this.backtrace_score = 0;
      }
      /**
       * Returns a clone of this node.
       * @returns A clone of this node.
       */
      clone() {
        let e = new __(
          this.token_id,
          this.node_id,
          this.pos,
          this.length,
          this.score
        );
        return e.prev = this.prev, e.backtrace_score = this.backtrace_score, e;
      }
    }, xx = class {
      /**
       * Creates a new TokenLattice instance.
       *
       * @param sentence The input sentence to be tokenized.
       * @param bos_token_id The beginning-of-sequence token ID.
       * @param eos_token_id The end-of-sequence token ID.
       */
      constructor(t, e, r) {
        this.chars = Array.from(t), this.len = this.chars.length, this.bos_token_id = e, this.eos_token_id = r, this.nodes = [], this.begin_nodes = Array.from(
          { length: this.len + 1 },
          () => []
        ), this.end_nodes = Array.from({ length: this.len + 1 }, () => []);
        let n = new Mc(this.bos_token_id ?? 0, 0, 0, 0, 0), s = new Mc(
          this.eos_token_id ?? 0,
          1,
          this.len,
          0,
          0
        );
        this.nodes.push(n.clone()), this.nodes.push(s.clone()), this.begin_nodes[this.len].push(s), this.end_nodes[0].push(n);
      }
      /**
       * Inserts a new token node into the token lattice.
       *
       * @param pos The starting position of the token.
       * @param length The length of the token.
       * @param score The score of the token.
       * @param token_id The token ID of the token.
       */
      insert(t, e, r, n) {
        let s = this.nodes.length, o = new Mc(n, s, t, e, r);
        this.begin_nodes[t].push(o), this.end_nodes[t + e].push(o), this.nodes.push(o);
      }
      /**
       * Implements the Viterbi algorithm to compute the most likely sequence of tokens.
       *
       * @returns The most likely sequence of tokens.
       */
      viterbi() {
        let t = this.len, e = 0;
        for (; e <= t; ) {
          if (this.begin_nodes[e].length == 0)
            return [];
          for (let i of this.begin_nodes[e]) {
            i.prev = null;
            let a = 0, l = null;
            for (let c of this.end_nodes[e]) {
              let u = c.backtrace_score + i.score;
              (l === null || u > a) && (l = c.clone(), a = u);
            }
            if (l !== null)
              i.prev = l, i.backtrace_score = a;
            else
              return [];
          }
          ++e;
        }
        let r = [], s = this.begin_nodes[t][0].prev;
        if (s === null)
          return [];
        let o = s.clone();
        for (; o.prev !== null; )
          r.push(o.clone()), o = o.clone().prev.clone();
        return r.reverse(), r;
      }
      /**
       * Get the text piece for a given node.
       * @param node The node to get the piece for.
       * @returns The array of nodes representing the most likely sequence of tokens.
       */
      piece(t) {
        return this.chars.slice(t.pos, t.pos + t.length).join("");
      }
      /**
       * @returns The most likely sequence of tokens.
       */
      tokens() {
        return this.viterbi().map((e) => this.piece(e));
      }
      /**
       * @returns The most likely sequence of token ids.
       */
      token_ids() {
        return this.viterbi().map((e) => e.token_id);
      }
    }, vx = xx;
    kx = class extends ko {
      /**
       * Create a new Unigram tokenizer model.
       * @param config The configuration object for the Unigram model.
       * @param eos_token
       */
      constructor(t, e) {
        super(t);
        let r = t.vocab.length;
        this.vocab = new Array(r), this.scores = new Array(r);
        for (let n = 0; n < r; ++n)
          [this.vocab[n], this.scores[n]] = t.vocab[n];
        this.unk_token_id = t.unk_id, this.unk_token = this.vocab[t.unk_id], this.tokens_to_ids = new Map(this.vocab.map((n, s) => [n, s])), this.bos_token = " ", this.bos_token_id = this.tokens_to_ids.get(this.bos_token), this.eos_token = e, this.eos_token_id = this.tokens_to_ids.get(this.eos_token), this.unk_token = this.vocab[this.unk_token_id], this.min_score = Ex(this.scores)[0], this.unk_score = this.min_score - 10, this.scores[this.unk_token_id] = this.unk_score, this.trie = new bx(), this.trie.extend(this.vocab), this.fuse_unk = !0;
      }
      /**
       * Populates lattice nodes.
       * @param lattice The token lattice to populate with nodes.
       */
      populate_nodes(t) {
        let e = t.chars, r = 1, n = 0;
        for (; n < e.length; ) {
          let s = !1, o = this.trie.common_prefix_search(e, n);
          for (let i of o) {
            let a = this.tokens_to_ids.get(i), l = this.scores[a], c = h0(i);
            t.insert(n, c, l, a), !s && c === r && (s = !0);
          }
          s || t.insert(n, r, this.unk_score, this.unk_token_id), n += r;
        }
      }
      /**
       * Encodes an array of tokens into an array of subtokens using the unigram model.
       *
       * @param normalized The normalized string.
       * @returns An array of subtokens obtained by encoding the input tokens using the unigram model.
       */
      tokenize(t) {
        let e = new vx(
          t,
          this.bos_token_id,
          this.eos_token_id
        );
        return this.populate_nodes(e), e.tokens();
      }
      /**
       * Encodes an array of tokens using Unigram encoding.
       * @param tokens The tokens to encode.
       * @returns An array of encoded tokens.
       */
      encode(t) {
        let e = [];
        for (let r of t) {
          let n = this.tokenize(r);
          e.push(...n);
        }
        return e;
      }
    }, Zm = kx, Ax = class {
      /**
       * Create a new PriorityQueue.
       * @param comparator Comparator function to determine priority. Defaults to a MaxHeap.
       * @param max_size Maximum size of the queue. Defaults to Infinity.
       */
      constructor(t = (r, n) => r > n, e = 1 / 0) {
        this._heap = [], this._comparator = t, this._max_size = e;
      }
      /**
       * The size of the queue
       */
      get size() {
        return this._heap.length;
      }
      /**
       * Check if the queue is empty.
       * @returns `true` if the queue is empty, `false` otherwise.
       */
      is_empty() {
        return this.size === 0;
      }
      /**
       * Return the element with the highest priority in the queue.
       * @returns The highest priority element in the queue.
       */
      peek() {
        return this._heap[0];
      }
      /**
       * Add one or more elements to the queue.
       * @param values The values to push into the queue.
       * @returns The new size of the queue.
       */
      push(...t) {
        return this.extend(t);
      }
      /**
       * Add multiple elements to the queue.
       * @param values The values to push into the queue.
       * @returns The new size of the queue.
       */
      extend(t) {
        for (let e of t)
          if (this.size < this._max_size)
            this._heap.push(e), this._sift_up();
          else {
            let r = this._smallest();
            this._comparator(e, this._heap[r]) && (this._heap[r] = e, this._sift_up_from(r));
          }
        return this.size;
      }
      /**
       * Remove and return the element with the highest priority in the queue.
       * @returns The element with the highest priority in the queue.
       */
      pop() {
        let t = this.peek(), e = this.size - 1;
        return e > 0 && this._swap(0, e), this._heap.pop(), this._sift_down(), t;
      }
      /**
       * Replace the element with the highest priority in the queue with a new value.
       * @param value The new value.
       * @returns The replaced value.
       */
      replace(t) {
        let e = this.peek();
        return this._heap[0] = t, this._sift_down(), e;
      }
      /**
       * Compute the index for the parent of the node at index `i`.
       * @param i The index of the node to get the parent of.
       * @returns The index of the parent node.
       * @private
       */
      _parent(t) {
        return (t + 1 >>> 1) - 1;
      }
      /**
       * Compute the index for the left child of the node at index `i`.
       * @param i The index of the node to get the left child of.
       * @returns The index of the left child.
       * @private
       */
      _left(t) {
        return (t << 1) + 1;
      }
      /**
       * Compute the index for the right child of the node at index `i`.
       * @param i The index of the node to get the right child of.
       * @returns The index of the right child.
       * @private
       */
      _right(t) {
        return t + 1 << 1;
      }
      /**
       * Check if the element at index `i` is greater than the element at index `j`.
       * @param i The index of the first element to compare.
       * @param j The index of the second element to compare.
       * @returns `true` if the element at index `i` is greater than the element at index `j`, `false` otherwise.
       * @private
       */
      _greater(t, e) {
        return this._comparator(this._heap[t], this._heap[e]);
      }
      /**
       * Swap the elements at indices `i` and `j`.
       * @param i The index of the first element to swap.
       * @param j The index of the second element to swap.
       * @private
       */
      _swap(t, e) {
        let r = this._heap[t];
        this._heap[t] = this._heap[e], this._heap[e] = r;
      }
      /**
       * Maintain the heap property by updating positions in the heap,
       * starting at the last element and moving up the heap.
       * @private
       */
      _sift_up() {
        this._sift_up_from(this.size - 1);
      }
      /**
       * Helper function to sift up from a given node.
       * @param node The index of the node to start sifting up from.
       */
      _sift_up_from(t) {
        for (; t > 0 && this._greater(t, this._parent(t)); )
          this._swap(t, this._parent(t)), t = this._parent(t);
      }
      /**
       * Maintain the heap property by updating positions in the heap,
       * starting at the first element and moving down the heap.
       * @private
       */
      _sift_down() {
        let t = 0;
        for (; this._left(t) < this.size && this._greater(this._left(t), t) || this._right(t) < this.size && this._greater(this._right(t), t); ) {
          let e = this._right(t) < this.size && this._greater(this._right(t), this._left(t)) ? this._right(t) : this._left(t);
          this._swap(t, e), t = e;
        }
      }
      /**
       * Get the index of the smallest element in the heap. Since we use an array-based heap,
       * the index can be computed without needing to traverse the heap.
       * @private
       */
      _smallest() {
        return 2 ** Math.floor(Math.log2(this.size)) - 1;
      }
    }, Tx = Ax, Sx = class {
      /**
       * Creates an LRUCache instance.
       * @param capacity The maximum number of items the cache can hold.
       */
      constructor(t) {
        this.capacity = t, this.cache = /* @__PURE__ */ new Map();
      }
      /**
       * Retrieves the value associated with the given key and marks the key as recently used.
       * @param key The key to retrieve.
       * @returns The value associated with the key, or undefined if the key does not exist.
       */
      get(t) {
        if (!this.cache.has(t)) return;
        let e = this.cache.get(t);
        return this.cache.delete(t), this.cache.set(t, e), e;
      }
      /**
       * Inserts or updates the key-value pair in the cache.
       * If the key already exists, it is updated and marked as recently used.
       * If the cache exceeds its capacity, the least recently used item is evicted.
       * @param key The key to add or update.
       * @param value The value to associate with the key.
       */
      put(t, e) {
        this.cache.has(t) && this.cache.delete(t), this.cache.set(t, e), this.cache.size > this.capacity && this.cache.delete(this.cache.keys().next().value);
      }
      /**
       * Clears the cache.
       */
      clear() {
        this.cache.clear();
      }
    }, Cx = Sx, Ix = class extends ko {
      /**
       * Create a BPE instance.
       * @param config The configuration object for BPE.
       */
      constructor(t) {
        super(t), this.tokens_to_ids = Lc(t.vocab), this.unk_token_id = this.tokens_to_ids.get(t.unk_token), this.unk_token = t.unk_token, this.vocab = new Array(this.tokens_to_ids.size);
        for (let [r, n] of this.tokens_to_ids)
          this.vocab[n] = r;
        let e = Array.isArray(t.merges[0]);
        this.merges = e ? t.merges : t.merges.map(
          (r) => r.split(" ", 2)
        ), this.bpe_ranks = new Map(this.merges.map((r, n) => [JSON.stringify(r), n])), this.end_of_word_suffix = t.end_of_word_suffix, this.continuing_subword_suffix = t.continuing_subword_suffix ?? null, this.byte_fallback = this.config.byte_fallback ?? !1, this.byte_fallback && (this.text_encoder = new TextEncoder()), this.ignore_merges = this.config.ignore_merges ?? !1, this.max_length_to_cache = 256, this.cache_capacity = 1e4, this.cache = new Cx(this.cache_capacity);
      }
      /**
       * Clears the cache.
       */
      clear_cache() {
        this.cache.clear();
      }
      /**
       * Apply Byte-Pair-Encoding (BPE) to a given token. Efficient heap-based priority
       * queue implementation adapted from https://github.com/belladoreai/llama-tokenizer-js.
       * @param token The token to encode.
       * @returns The BPE encoded tokens.
       */
      bpe(t) {
        if (t.length === 0)
          return [];
        let e = this.cache.get(t);
        if (e !== void 0)
          return e;
        let r = Array.from(t);
        this.end_of_word_suffix && (r[r.length - 1] += this.end_of_word_suffix);
        let n = [];
        if (r.length > 1) {
          let s = new Tx((a, l) => a.score < l.score), o = {
            token: r[0],
            bias: 0,
            prev: null,
            next: null
          }, i = o;
          for (let a = 1; a < r.length; ++a) {
            let l = {
              bias: a / r.length,
              // Add fractional component to break ties
              token: r[a],
              prev: i,
              next: null
            };
            i.next = l, this.add_node(s, i), i = l;
          }
          for (; !s.is_empty(); ) {
            let a = s.pop();
            if (a.deleted || !a.next || a.next.deleted) continue;
            if (a.deleted = !0, a.next.deleted = !0, a.prev) {
              let c = { ...a.prev };
              a.prev.deleted = !0, a.prev = c, c.prev ? c.prev.next = c : o = c;
            }
            let l = {
              token: a.token + a.next.token,
              bias: a.bias,
              prev: a.prev,
              next: a.next.next
            };
            l.prev ? (l.prev.next = l, this.add_node(s, l.prev)) : o = l, l.next && (l.next.prev = l, this.add_node(s, l));
          }
          for (let a = o; a !== null; a = a.next)
            n.push(a.token);
        } else
          n = r;
        if (this.continuing_subword_suffix)
          for (let s = 0; s < n.length - 1; ++s)
            n[s] += this.continuing_subword_suffix;
        return t.length < this.max_length_to_cache && this.cache.put(t, n), n;
      }
      /**
       * Helper function to add a node to the priority queue.
       * @param queue
       * @param node
       */
      add_node(t, e) {
        let r = this.bpe_ranks.get(
          JSON.stringify([e.token, e.next.token])
        );
        r !== void 0 && (e.score = r + e.bias, t.push(e));
      }
      /**
       * Encodes the input sequence of tokens using the BPE algorithm and returns the resulting subword tokens.
       * @param tokens The input sequence of tokens to encode.
       * @returns The resulting subword tokens after applying the BPE algorithm to the input sequence of tokens.
       */
      encode(t) {
        let e = [];
        for (let r of t) {
          if (this.ignore_merges && this.tokens_to_ids.has(r)) {
            e.push(r);
            continue;
          }
          let n = this.bpe(r);
          for (let s of n)
            if (this.tokens_to_ids.has(s))
              e.push(s);
            else if (this.byte_fallback) {
              let o = Array.from(this.text_encoder.encode(s)).map(
                (i) => `<0x${i.toString(16).toUpperCase().padStart(2, "0")}>`
              );
              o.every((i) => this.tokens_to_ids.has(i)) ? e.push(...o) : this.unk_token != null && e.push(this.unk_token);
            } else this.unk_token != null && e.push(this.unk_token);
        }
        return e;
      }
    }, Qm = Ix, Mx = class extends ko {
      /**
       * Create a Legacy tokenizer model instance.
       * @param config The configuration object for Legacy tokenizer model.
       * @param more_config Additional configuration object for the Legacy tokenizer model.
       */
      constructor(t, e) {
        super(t);
        let r = t.vocab;
        this.tokens_to_ids = Lc(
          e.target_lang ? r[e.target_lang] : r
        ), this.bos_token = e.bos_token, this.bos_token_id = this.tokens_to_ids.get(this.bos_token), this.eos_token = e.eos_token, this.eos_token_id = this.tokens_to_ids.get(this.eos_token), this.pad_token = e.pad_token, this.pad_token_id = this.tokens_to_ids.get(this.pad_token), this.unk_token = e.unk_token, this.unk_token_id = this.tokens_to_ids.get(this.unk_token), this.vocab = new Array(this.tokens_to_ids.size);
        for (let [n, s] of this.tokens_to_ids)
          this.vocab[s] = n;
      }
      encode(t) {
        return t;
      }
    }, Ox = Mx;
    Lx = Px, Rx = class extends Vn {
      /**
       * @param config The configuration for the post-processor.
       */
      constructor(t) {
        super(), this.config = t;
      }
      /**
       * Alias for {@link PostProcessor#post_process}.
       * @param tokens The text or array of texts to post-process.
       * @param args Additional arguments required by the post-processing logic.
       * @returns The post-processed tokens.
       */
      _call(t, ...e) {
        return this.post_process(t, ...e);
      }
    }, Gn = Rx, $x = class extends Gn {
      /**
       * Replaces special tokens in the template with actual tokens.
       * @param tokens The list of tokens for the first sequence.
       * @param tokens_pair The list of tokens for the second sequence (optional).
       * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
       * @returns An object containing the list of tokens with the special tokens replaced with actual tokens.
       */
      post_process(t, e = null, r = !0) {
        let n = e === null ? this.config.single : this.config.pair, s = [], o = [];
        for (let i of n)
          "SpecialToken" in i ? r && (s.push(i.SpecialToken.id), o.push(i.SpecialToken.type_id)) : "Sequence" in i && (i.Sequence.id === "A" ? (s = it(s, t), o = it(
            o,
            new Array(t.length).fill(i.Sequence.type_id)
          )) : i.Sequence.id === "B" && (s = it(s, e), o = it(
            o,
            new Array(e.length).fill(i.Sequence.type_id)
          )));
        return { tokens: s, token_type_ids: o };
      }
    }, Nx = $x, Dx = class extends Gn {
      /**
       * Post process the given tokens.
       * @param tokens The list of tokens for the first sequence.
       * @param tokens_pair The list of tokens for the second sequence (optional).
       * @returns An object containing the post-processed tokens.
       */
      post_process(t, e = null) {
        return { tokens: t, tokens_pair: e };
      }
    }, zx = Dx, Bx = class extends Gn {
      /**
       * @param config The configuration for the post-processor.
       * @param config.cls The special tokens to add to the beginning of the input.
       * @param config.sep The special tokens to add to the end of the input.
       */
      constructor(t) {
        super(t), this.sep = t.sep, this.cls = t.cls;
      }
      /**
       * Adds the special tokens to the beginning and end of the input.
       * @param tokens The input tokens.
       * @param tokens_pair An optional second set of input tokens.
       * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
       * @returns The post-processed tokens with the special tokens added to the beginning and end.
       */
      post_process(t, e = null, r = !0) {
        r && (t = it([this.cls[0]], t, [this.sep[0]]));
        let n = new Array(t.length).fill(0);
        if (e) {
          let s = [], o = r ? [this.sep[0]] : [];
          t = it(t, s, e, o), n = it(
            n,
            new Array(e.length + s.length + o.length).fill(1)
          );
        }
        return { tokens: t, token_type_ids: n };
      }
    }, Ux = Bx, Fx = class extends Gn {
      /**
       * @param config The configuration for the post-processor.
       * @param config.cls The special tokens to add to the beginning of the input.
       * @param config.sep The special tokens to add to the end of the input.
       */
      constructor(t) {
        super(t), this.sep = t.sep, this.cls = t.cls;
      }
      /**
       * Adds the special tokens to the beginning and end of the input.
       * @param tokens The input tokens.
       * @param tokens_pair An optional second set of input tokens.
       * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
       * @returns The post-processed tokens with the special tokens added to the beginning and end.
       */
      post_process(t, e, r = !0) {
        r && (t = it([this.cls[0]], t, [this.sep[0]]));
        let n = new Array(t.length).fill(0);
        if (e) {
          let s = r ? [this.sep[0]] : [], o = r ? [this.sep[0]] : [];
          t = it(t, s, e, o), n = it(
            n,
            new Array(e.length + s.length + o.length).fill(1)
          );
        }
        return { tokens: t, token_type_ids: n };
      }
    }, jx = Fx, Wx = class extends Gn {
      /**
       * Creates a new instance of Sequence post-processor.
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.processors = (t.processors ?? []).map((e) => g_(e));
      }
      /**
       * Post process the given tokens.
       * @param tokens The list of tokens for the first sequence.
       * @param tokens_pair The list of tokens for the second sequence (optional).
       * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
       * @returns An object containing the post-processed tokens.
       */
      post_process(t, e = null, r = !0) {
        let n = { tokens: t, tokens_pair: e };
        for (let s of this.processors)
          n = s.post_process(
            n.tokens,
            n.tokens_pair,
            r
          );
        return n;
      }
    }, Vx = Wx;
    g_ = Gx, qx = class extends Vn {
      /**
       * Creates an instance of `Decoder`.
       * @param config The configuration object.
       **/
      constructor(t) {
        super(), this.config = t, this.added_tokens = [], this.end_of_word_suffix = null, this.trim_offsets = "trim_offsets" in t ? t.trim_offsets : !1;
      }
      /**
       * Calls the `decode` method.
       *
       * @param tokens The list of tokens.
       * @returns The decoded string.
       */
      _call(t) {
        return this.decode(t);
      }
      /**
       * Decodes a list of tokens.
       * @param tokens The list of tokens.
       * @returns The decoded string.
       */
      decode(t) {
        return this.decode_chain(t).join("");
      }
    }, Je = qx, Hx = class extends Je {
      /**
       * Create a `ByteLevelDecoder` object.
       */
      constructor(t) {
        super(t), this.byte_decoder = H0, this.text_decoder = new TextDecoder("utf-8", {
          fatal: !1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ignoreBOM: !0
        }), this.end_of_word_suffix = null;
      }
      /**
       * Convert an array of tokens to string by decoding each byte.
       * @param tokens Array of tokens to be decoded.
       * @returns The decoded string.
       */
      convert_tokens_to_string(t) {
        let e = t.join(""), r = new Uint8Array(
          [...e].map((n) => this.byte_decoder[n])
        );
        return this.text_decoder.decode(r);
      }
      decode_chain(t) {
        let e = [], r = [];
        for (let n of t)
          this.added_tokens.find((s) => s.content === n) !== void 0 ? (r.length > 0 && (e.push(this.convert_tokens_to_string(r)), r = []), e.push(n)) : r.push(n);
        return r.length > 0 && e.push(this.convert_tokens_to_string(r)), e;
      }
    }, Yx = Hx, Xx = class extends Je {
      /**
       * Creates a new instance of WordPieceDecoder.
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.cleanup = t.cleanup;
      }
      decode_chain(t) {
        return t.map((e, r) => {
          if (r !== 0) {
            let n = this.config.prefix;
            n && e.startsWith(n) ? e = e.replace(n, "") : e = " " + e;
          }
          return this.cleanup && (e = Oc(e)), e;
        });
      }
    }, Kx = Xx, Jx = class extends Je {
      /**
       * Constructs a new MetaspaceDecoder object.
       * @param config The configuration object for the MetaspaceDecoder.
       */
      constructor(t) {
        super(t), this.replacement = t.replacement ?? "\u2581";
      }
      decode_chain(t) {
        let e = [];
        for (let r = 0; r < t.length; ++r) {
          let n = t[r].replaceAll(this.replacement, " ");
          r == 0 && n.startsWith(" ") && (n = n.substring(1)), e.push(n);
        }
        return e;
      }
    }, Zx = Jx, Qx = class extends Je {
      constructor(t) {
        super(t), this.suffix = t.suffix ?? "";
      }
      decode_chain(t) {
        return t.map((e, r) => e.replaceAll(this.suffix, r === t.length - 1 ? "" : " "));
      }
    }, ev = Qx, tv = class extends Je {
      constructor(t) {
        super(t), this.pad_token = t.pad_token ?? "", this.word_delimiter_token = t.word_delimiter_token ?? "", this.cleanup = t.cleanup;
      }
      /**
       * Converts a connectionist-temporal-classification (CTC) output tokens into a single string.
       * @param tokens Array of tokens to be decoded.
       * @returns The decoded string.
       */
      convert_tokens_to_string(t) {
        if (t.length === 0) return "";
        let e = [t[0]];
        for (let s = 1; s < t.length; ++s)
          t[s] !== e.at(-1) && e.push(t[s]);
        let n = e.filter(
          (s) => s !== this.pad_token
        ).join("");
        return this.cleanup && (n = Oc(n).replaceAll(this.word_delimiter_token, " ").trim()), n;
      }
      decode_chain(t) {
        return [this.convert_tokens_to_string(t)];
      }
    }, rv = tv, nv = class extends Je {
      /**
       * Creates a new instance of DecoderSequence.
       * @param config The configuration object.
       */
      constructor(t) {
        super(t), this.decoders = (t.decoders ?? []).map((e) => w_(e));
      }
      decode_chain(t) {
        return this.decoders.reduce((e, r) => r.decode_chain(e), t);
      }
    }, sv = nv, ov = class extends Je {
      /**
       * @param config The configuration object for the decoder.
       */
      constructor(t) {
        super(t), this.pattern = vo(this.config.pattern);
      }
      decode_chain(t) {
        let e = this.config.content ?? "", r = this.pattern;
        return r === null ? t : t.map((n) => n.replaceAll(r, e));
      }
    }, iv = ov, av = class extends Je {
      decode_chain(t) {
        return [t.join("")];
      }
    }, lv = av, cv = class extends Je {
      constructor(t) {
        super(t), this.content = t.content ?? "", this.start = t.start ?? 0, this.stop = t.stop ?? 0;
      }
      decode_chain(t) {
        return t.map((e) => {
          let r = 0;
          for (let s = 0; s < this.start && e[s] === this.content; ++s) {
            r = s + 1;
            continue;
          }
          let n = e.length;
          for (let s = 0; s < this.stop; ++s) {
            let o = e.length - s - 1;
            if (e[o] === this.content) {
              n = o;
              continue;
            } else
              break;
          }
          return e.slice(r, n);
        });
      }
    }, uv = cv, dv = class extends Je {
      constructor(t) {
        super(t), this.text_decoder = new TextDecoder();
      }
      decode_chain(t) {
        let e = [], r = [];
        for (let n of t) {
          let s = null;
          if (n.length === 6 && n.startsWith("<0x") && n.endsWith(">")) {
            let o = parseInt(n.slice(3, 5), 16);
            isNaN(o) || (s = o);
          }
          if (s !== null)
            r.push(s);
          else {
            if (r.length > 0) {
              let o = this.text_decoder.decode(
                Uint8Array.from(r)
              );
              e.push(o), r = [];
            }
            e.push(n);
          }
        }
        if (r.length > 0) {
          let n = this.text_decoder.decode(
            Uint8Array.from(r)
          );
          e.push(n), r = [];
        }
        return e;
      }
    }, fv = dv;
    w_ = hv, pv = class {
      constructor(t, e) {
        let r = Xm(t, "Tokenizer", [
          "model",
          "decoder",
          "post_processor",
          "pre_tokenizer",
          "normalizer"
        ]);
        if (r)
          throw new Error(r);
        let n = Xm(e, "Config");
        if (n)
          throw new Error(n);
        this.tokenizer = t, this.config = e, this.normalizer = f_(this.tokenizer.normalizer), this.pre_tokenizer = p_(this.tokenizer.pre_tokenizer), this.model = Lx(this.tokenizer.model, this.config), this.post_processor = g_(this.tokenizer.post_processor), this.decoder = w_(this.tokenizer.decoder), this.special_tokens = [], this.all_special_ids = [], this.added_tokens = [];
        let s = [], o = [];
        this.added_tokens_map = /* @__PURE__ */ new Map();
        for (let i of this.tokenizer.added_tokens) {
          let a = new Gb(i);
          if (this.added_tokens.push(a), this.model.tokens_to_ids.set(a.content, a.id), this.model.vocab[a.id] = a.content, a.special && (this.special_tokens.push(a.content), this.all_special_ids.push(a.id)), this.added_tokens_map.set(a.content, a), a.normalized && this.normalizer !== null) {
            let l = this.normalizer(a.content);
            o.push(l), this.added_tokens_map.set(l, a);
          } else
            s.push(a.content);
        }
        (this.config.additional_special_tokens ?? []).forEach((i) => {
          this.special_tokens.includes(i) || this.special_tokens.push(i);
        }), this.decoder && (this.decoder.added_tokens = this.added_tokens, this.decoder.end_of_word_suffix = this.model.end_of_word_suffix), this.splitter_unnormalized = new Vm(s), this.splitter_normalized = new Vm(o), this.remove_space = this.config.remove_space, this.clean_up_tokenization_spaces = this.config.clean_up_tokenization_spaces ?? !0, this.do_lowercase_and_remove_accent = this.config.do_lowercase_and_remove_accent ?? !1;
      }
      // Implementation
      encode(t, {
        text_pair: e = null,
        add_special_tokens: r = !0,
        return_token_type_ids: n = null
      } = {}) {
        let { tokens: s, token_type_ids: o } = this.tokenize_helper(t, {
          text_pair: e,
          add_special_tokens: r
        }), i = s.map(
          (l) => this.added_tokens_map.get(l)?.id ?? this.model.tokens_to_ids.get(l) ?? this.model.unk_token_id
        ), a = {
          ids: i,
          tokens: s,
          attention_mask: new Array(i.length).fill(1)
        };
        return n && o && (a.token_type_ids = o), a;
      }
      decode(t, e = {}) {
        if (!Array.isArray(t) || t.length === 0 || !f0(t[0]))
          throw Error("token_ids must be a non-empty array of integers.");
        let r = t.map(
          (s) => this.model.vocab[Number(s)] ?? this.model.unk_token
        );
        e.skip_special_tokens && (r = r.filter((s) => !this.special_tokens.includes(s)));
        let n = this.decoder ? this.decoder(r) : r.join(" ");
        return this.decoder && this.decoder.end_of_word_suffix && (n = n.replaceAll(this.decoder.end_of_word_suffix, " "), e.skip_special_tokens && (n = n.trim())), (e.clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) && (n = Oc(n)), n;
      }
      /**
       * Converts a string into a sequence of tokens.
       * @param text The sequence to be encoded.
       * @param options An optional object containing the following properties:
       * @returns The list of tokens.
       */
      tokenize(t, { text_pair: e = null, add_special_tokens: r = !1 } = {}) {
        return this.tokenize_helper(t, { text_pair: e, add_special_tokens: r }).tokens;
      }
      encode_text(t) {
        if (t === null)
          return null;
        let e = this.splitter_unnormalized.split(t);
        return e.forEach((r, n) => {
          let s = this.added_tokens_map.get(r);
          s && (s.lstrip && n > 0 && (e[n - 1] = e[n - 1].trimEnd()), s.rstrip && n < e.length - 1 && (e[n + 1] = e[n + 1].trimStart()));
        }), e.flatMap((r, n) => {
          if (r.length === 0)
            return [];
          if (this.added_tokens_map.has(r))
            return [r];
          if (this.remove_space === !0 && (r = r.trim().split(/\s+/).join(" ")), this.do_lowercase_and_remove_accent && (r = p0(r)), this.normalizer !== null && (r = this.normalizer(r)), r.length === 0)
            return [];
          let s = this.splitter_normalized.split(r);
          return s.forEach((o, i) => {
            let a = this.added_tokens_map.get(o);
            a && (a.lstrip && i > 0 && (s[i - 1] = s[i - 1].trimEnd()), a.rstrip && i < s.length - 1 && (s[i + 1] = s[i + 1].trimStart()));
          }), s.flatMap((o) => {
            if (o.length === 0)
              return [];
            if (this.added_tokens_map.has(o))
              return [o];
            let i = this.pre_tokenizer !== null ? this.pre_tokenizer(o, {
              section_index: n
            }) : [o];
            return this.model(i);
          });
        });
      }
      tokenize_helper(t, { text_pair: e = null, add_special_tokens: r = !0 }) {
        let n = this.encode_text(t), s = this.encode_text(e || null);
        return this.post_processor ? this.post_processor(n, s, r) : { tokens: it(n ?? [], s ?? []) };
      }
      /**
       * Converts a token string to its corresponding token ID.
       * @param token The token string to convert.
       * @returns The token ID, or undefined if the token is not in the vocabulary.
       */
      token_to_id(t) {
        return this.model.tokens_to_ids.get(t);
      }
      /**
       * Converts a token ID to its corresponding token string.
       * @param id The token ID to convert.
       * @returns The token string, or undefined if the ID is not in the vocabulary.
       */
      id_to_token(t) {
        return this.model.vocab[t];
      }
      /**
       * Returns a mapping of token IDs to AddedToken objects for all added tokens.
       * @returns A Map where keys are token IDs and values are AddedToken objects.
       */
      get_added_tokens_decoder() {
        let t = /* @__PURE__ */ new Map();
        for (let e of this.added_tokens)
          t.set(e.id, e);
        return t;
      }
      /**
       * Get the underlying vocabulary
       * @param with_added_tokens Whether to include the added tokens
       * @returns The vocabulary
       */
      get_vocab(t = !0) {
        let e = /* @__PURE__ */ new Map();
        for (let r = 0; r < this.model.vocab.length; ++r) {
          let n = this.model.vocab[r];
          (t || !this.added_tokens_map.has(n)) && e.set(n, r);
        }
        return e;
      }
    }, y_ = pv;
  });

  // node_modules/@huggingface/jinja/dist/index.js
  function b_(t) {
    return t >= 97 && t <= 122 || // a-z
    t >= 65 && t <= 90 || // A-Z
    t >= 48 && t <= 57 || // 0-9
    t === 95;
  }
  function fr(t) {
    return t >= 48 && t <= 57;
  }
  function Nc(t) {
    return t <= 32 ? t === 32 || t >= 9 && t <= 13 : t > 127 && (t === 160 || t === 5760 || t >= 8192 && t <= 8202 || t === 8232 || t === 8233 || t === 8239 || t === 8287 || t === 12288 || t === 65279);
  }
  function bv(t, e = {}) {
    t.endsWith(`
`) && (t = t.slice(0, -1)), e.lstrip_blocks && (t = t.replace(/^[ \t]*({[#%-])/gm, "$1")), e.trim_blocks && (t = t.replace(/([#%-]})\n/g, "$1"));
    let r = "", n = 0;
    for (let s of t.matchAll(/{%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs)) {
      let [o, i, a, l] = s, c = s.index;
      for (; i && c > n && Nc(t.charCodeAt(c - 1)); )
        --c;
      r += t.slice(n, c) + (a ? "" : l), n = s.index + o.length;
    }
    return r + t.slice(n);
  }
  function xv(t, e = {}) {
    let r = [], n = bv(t, e), s = n.length, o = 0, i = 0, a = /* @__PURE__ */ new Map(), l = (f) => {
      let h = o;
      for (; f(n.charCodeAt(o)); )
        if (++o >= s)
          throw new SyntaxError("Unexpected end of input");
      return n.slice(h, o);
    }, c = (f) => {
      let h = "", p = o;
      for (; ; ) {
        if (o >= s)
          throw new SyntaxError("Unexpected end of input");
        let m = n[o];
        if (m === f)
          break;
        if (++o, m !== "\\")
          continue;
        if (h += n.slice(p, o - 1), o >= s)
          throw new SyntaxError("Unexpected end of input");
        let _ = n[o++];
        if (_ === "x" || _ === "u") {
          let g = _ === "x" ? 2 : 4, w = n.slice(o, o + g);
          if (w.length !== g || /[^0-9a-f]/i.test(w))
            throw new SyntaxError(`Invalid hexadecimal escape sequence: \\${_}${w}`);
          h += String.fromCharCode(parseInt(w, 16)), o += g;
        } else {
          let g = yv.get(_);
          if (g === void 0)
            throw new SyntaxError(`Unexpected escaped character: ${_}`);
          h += g;
        }
        p = o;
      }
      return h + n.slice(p, o);
    }, u = () => {
      let f = r.at(-1);
      f && f.type === T.Text && (f.value = f.value.trimEnd(), f.value === "" && r.pop());
    }, d = () => {
      for (; o < s && Nc(n.charCodeAt(o)); )
        ++o;
    };
    e:
      for (; o < s; ) {
        let f = r.at(-1)?.type;
        if (f === void 0 || f === T.CloseStatement || f === T.CloseExpression || f === T.Comment) {
          let _ = o;
          for (; ; ) {
            if (_ = n.indexOf("{", _), _ === -1) {
              _ = s;
              break;
            }
            let g = n[_ + 1];
            if (g === "%" || g === "{" || g === "#")
              break;
            ++_;
          }
          if (_ > o) {
            r.push(new Ze(n.slice(o, _), T.Text)), o = _;
            continue;
          }
        }
        if (n[o] === "{") {
          let _ = n[o + 1];
          if (_ === "#") {
            o += 2;
            let g = n[o] === "-";
            g && ++o;
            let w = n.indexOf("#}", o);
            if (w === -1)
              throw new SyntaxError("Missing end of comment tag");
            let y = n.slice(o, w), v = y.endsWith("-");
            v && (y = y.slice(0, -1)), g && u(), r.push(new Ze(y, T.Comment)), o = w + 2, v && d();
            continue;
          }
          if (n[o + 2] === "-") {
            if (_ === "%") {
              u(), r.push(new Ze("{%", T.OpenStatement)), o += 3;
              continue;
            }
            if (_ === "{") {
              u(), r.push(new Ze("{{", T.OpenExpression)), i = 0, o += 3;
              continue;
            }
          }
        }
        l(Nc);
        let h = n[o];
        if (h === "-" && n[o + 2] === "}") {
          let _ = n[o + 1];
          if (_ === "%") {
            r.push(new Ze("%}", T.CloseStatement)), o += 3, d();
            continue;
          }
          if (_ === "}") {
            r.push(new Ze("}}", T.CloseExpression)), o += 3, d();
            continue;
          }
        }
        if (h === "-" || h === "+") {
          if (f === T.Text || f === void 0)
            throw new SyntaxError(`Unexpected character: ${h}`);
          switch (f) {
            case T.Identifier:
            case T.NumericLiteral:
            case T.StringLiteral:
            case T.CloseParen:
            case T.CloseSquareBracket:
              break;
            default: {
              ++o;
              let _ = l(fr);
              if (_.length > 0 && n[o] === "." && fr(n.charCodeAt(o + 1))) {
                ++o;
                let g = l(fr);
                _ = `${_}.${g}`;
              }
              r.push(
                new Ze(`${h}${_}`, _.length > 0 ? T.NumericLiteral : T.UnaryOperator)
              );
              continue;
            }
          }
        }
        let p = n.charCodeAt(o), m = $_[p];
        if (m !== void 0) {
          for (let [_, g] of m)
            if (!(_ === "}}" && i > 0) && n.startsWith(_, o)) {
              r.push(new Ze(_, g)), g === T.OpenExpression ? i = 0 : g === T.OpenCurlyBracket ? ++i : g === T.CloseCurlyBracket && --i, o += _.length;
              continue e;
            }
        }
        if (h === "'" || h === '"') {
          ++o;
          let _ = c(h);
          r.push(new Ze(_, T.StringLiteral)), ++o;
          continue;
        }
        if (fr(p)) {
          let _ = l(fr);
          if (f !== T.Dot && n[o] === "." && fr(n.charCodeAt(o + 1))) {
            ++o;
            let g = l(fr);
            _ = `${_}.${g}`;
          }
          r.push(new Ze(_, T.NumericLiteral));
          continue;
        }
        if (b_(p)) {
          let _ = l(b_), g = a.get(_);
          g === void 0 ? a.set(_, _) : _ = g, r.push(new Ze(_, T.Identifier));
          continue;
        }
        throw new SyntaxError(`Unexpected character: ${h}`);
      }
    return r;
  }
  function Vv(t) {
    let e = new vv([]), r = 0;
    function n(A, M) {
      let L = t[r++];
      if (!L || L.type !== A)
        throw new Error(`Parser Error: ${M}. ${L.type} !== ${A}.`);
      return L;
    }
    function s(A) {
      if (!l(A))
        throw new SyntaxError(`Expected ${A}`);
      ++r;
    }
    function o() {
      switch (t[r].type) {
        case T.Comment:
          return new Iv(t[r++].value);
        case T.Text:
          return c();
        case T.OpenStatement:
          return u();
        case T.OpenExpression:
          return d();
        default:
          throw new SyntaxError(`Unexpected token type: ${t[r].type}`);
      }
    }
    function i(...A) {
      return r + A.length <= t.length && A.every((M, L) => M === t[r + L].type);
    }
    function a(...A) {
      return t[r]?.type === T.OpenStatement && t[r + 1]?.type === T.Identifier && A.includes(t[r + 1]?.value);
    }
    function l(...A) {
      return r + A.length <= t.length && A.every((M, L) => t[r + L].type === "Identifier" && M === t[r + L].value);
    }
    function c() {
      return new v_(n(T.Text, "Expected text token").value);
    }
    function u() {
      if (n(T.OpenStatement, "Expected opening statement token"), t[r].type !== T.Identifier)
        throw new SyntaxError(`Unknown statement, got ${t[r].type}`);
      let A = t[r].value, M;
      switch (A) {
        case "set":
          ++r, M = f();
          break;
        case "if":
          ++r, M = h(), n(T.OpenStatement, "Expected {% token"), s("endif"), n(T.CloseStatement, "Expected %} token");
          break;
        case "macro":
          ++r, M = p(), n(T.OpenStatement, "Expected {% token"), s("endmacro"), n(T.CloseStatement, "Expected %} token");
          break;
        case "for":
          ++r, M = _(), n(T.OpenStatement, "Expected {% token"), s("endfor"), n(T.CloseStatement, "Expected %} token");
          break;
        case "call": {
          ++r;
          let L = null;
          i(T.OpenParen) && (L = D("parameters"));
          let G = K();
          if (G.type !== "Identifier")
            throw new SyntaxError("Expected identifier following call statement");
          let _e = D("call");
          n(T.CloseStatement, "Expected closing statement token");
          let Ce = [];
          for (; !a("endcall"); )
            Ce.push(o());
          n(T.OpenStatement, "Expected '{%'"), s("endcall"), n(T.CloseStatement, "Expected closing statement token");
          let qe = new x_(G, _e);
          M = new jv(qe, L, Ce);
          break;
        }
        case "break":
          ++r, n(T.CloseStatement, "Expected closing statement token"), M = new Av();
          break;
        case "continue":
          ++r, n(T.CloseStatement, "Expected closing statement token"), M = new Tv();
          break;
        case "filter": {
          ++r;
          let L = K();
          L instanceof jt && i(T.OpenParen) && (L = O(L)), n(T.CloseStatement, "Expected closing statement token");
          let G = [];
          for (; !a("endfilter"); )
            G.push(o());
          n(T.OpenStatement, "Expected '{%'"), s("endfilter"), n(T.CloseStatement, "Expected '%}'"), M = new Nv(L, G);
          break;
        }
        default:
          throw new SyntaxError(`Unknown statement type: ${A}`);
      }
      return M;
    }
    function d() {
      n(T.OpenExpression, "Expected opening expression token");
      let A = g();
      return n(T.CloseExpression, "Expected closing expression token"), A;
    }
    function f() {
      let A = m(), M = null, L = [];
      if (i(T.Equals))
        ++r, M = m();
      else {
        for (n(T.CloseStatement, "Expected %} token"); !a("endset"); )
          L.push(o());
        n(T.OpenStatement, "Expected {% token"), s("endset");
      }
      return n(T.CloseStatement, "Expected closing statement token"), new Sv(A, M, L);
    }
    function h() {
      let A = g();
      n(T.CloseStatement, "Expected closing statement token");
      let M = [], L = [];
      for (; !a("elif", "else", "endif"); )
        M.push(o());
      if (a("elif")) {
        ++r, ++r;
        let G = h();
        L.push(G);
      } else if (a("else"))
        for (++r, ++r, n(T.CloseStatement, "Expected closing statement token"); !a("endif"); )
          L.push(o());
      return new Ev(A, M, L);
    }
    function p() {
      let A = K();
      if (A.type !== "Identifier")
        throw new SyntaxError("Expected identifier following macro statement");
      let M = D("parameters");
      n(T.CloseStatement, "Expected closing statement token");
      let L = [];
      for (; !a("endmacro"); )
        L.push(o());
      return new Cv(A, M, L);
    }
    function m(A = !1) {
      let M = A ? K : g, L = [M()], G = i(T.Comma);
      for (; G && (++r, L.push(M()), !!i(T.Comma)); )
        ;
      return G ? new E_(L) : L[0];
    }
    function _() {
      let A = m(!0);
      if (!(A instanceof jt || A instanceof E_))
        throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${A.type} instead`);
      if (!l("in"))
        throw new SyntaxError("Expected `in` keyword following loop variable");
      ++r;
      let M = g();
      n(T.CloseStatement, "Expected closing statement token");
      let L = [];
      for (; !a("endfor", "else"); )
        L.push(o());
      let G = [];
      if (a("else"))
        for (++r, ++r, n(T.CloseStatement, "Expected closing statement token"); !a("endfor"); )
          G.push(o());
      return new kv(A, M, L, G);
    }
    function g() {
      return w();
    }
    function w() {
      let A = y();
      if (l("if")) {
        ++r;
        let M = y();
        if (l("else")) {
          ++r;
          let L = w();
          return new Wv(M, A, L);
        } else
          return new Dv(A, M);
      }
      return A;
    }
    function y() {
      let A = v();
      for (; l("or"); ) {
        let M = t[r];
        ++r;
        let L = v();
        A = new tn(M, A, L);
      }
      return A;
    }
    function v() {
      let A = k();
      for (; l("and"); ) {
        let M = t[r];
        ++r;
        let L = k();
        A = new tn(M, A, L);
      }
      return A;
    }
    function k() {
      let A;
      for (; l("not"); ) {
        let M = t[r];
        ++r;
        let L = k();
        A = new k_(M, L);
      }
      return A ?? C();
    }
    function C() {
      let A = x();
      for (; ; ) {
        let M;
        if (l("not", "in"))
          M = new Ze("not in", T.Identifier), r += 2;
        else if (l("in"))
          M = t[r++];
        else if (i(T.ComparisonBinaryOperator))
          M = t[r++];
        else
          break;
        let L = x();
        A = new tn(M, A, L);
      }
      return A;
    }
    function x() {
      let A = I();
      for (; i(T.AdditiveBinaryOperator); ) {
        let M = t[r];
        ++r;
        let L = I();
        A = new tn(M, A, L);
      }
      return A;
    }
    function E() {
      let A = P(K());
      return i(T.OpenParen) ? O(A) : A;
    }
    function O(A) {
      let M = new x_(A, D("call"));
      return M = P(M), i(T.OpenParen) && (M = O(M)), M;
    }
    function D(A) {
      n(T.OpenParen, "Expected opening parenthesis for arguments list");
      let M = z(A);
      return n(T.CloseParen, "Expected closing parenthesis for arguments list"), M;
    }
    function z(A) {
      let M = [], L = /* @__PURE__ */ new Set(), G = !1, _e = !1;
      for (; !i(T.CloseParen); ) {
        let Ce = i(T.ExponentiationBinaryOperator), qe = i(T.MultiplicativeBinaryOperator) && t[r].value === "*";
        if (A === "parameters" && (Ce || qe))
          throw new SyntaxError("Argument unpacking is not allowed in parameter declarations");
        if (Ce) {
          if (++r, M.push(new Fv(g())), i(T.Comma) && ++r, !i(T.CloseParen))
            throw new SyntaxError("Expected closing parenthesis: `**` must be applied to the final argument");
          break;
        }
        let xe;
        if (qe) {
          if (_e)
            throw new SyntaxError("Only one `*` argument unpacking is allowed");
          _e = !0, ++r;
          let he = g();
          xe = new Uv(he);
        } else {
          if (xe = g(), i(T.Equals)) {
            if (++r, !(xe instanceof jt))
              throw new SyntaxError(
                A === "parameters" ? "Expected identifier for parameter declaration" : "Expected identifier for keyword argument"
              );
            let he = g();
            xe = new $c(xe, he);
          }
          if (A === "parameters") {
            if (!(xe instanceof jt || xe instanceof $c))
              throw new SyntaxError("Expected identifier for parameter declaration");
            let he = xe instanceof jt ? xe.value : xe.key.value;
            if (L.has(he))
              throw new SyntaxError(`Duplicate parameter name: ${he}`);
            L.add(he);
          }
          if (xe instanceof $c)
            G = !0;
          else {
            if (G)
              throw new SyntaxError(
                A === "call" ? "Positional arguments must come before keyword arguments" : "Non-default argument follows default argument"
              );
            if (_e)
              throw new SyntaxError("Positional arguments must not follow `*` argument unpacking");
          }
        }
        M.push(xe), i(T.Comma) && ++r;
      }
      return M;
    }
    function B() {
      let A = [], M = !1;
      for (; !i(T.CloseSquareBracket); )
        i(T.Colon) ? (A.push(void 0), ++r, M = !0) : (A.push(g()), i(T.Colon) && (++r, M = !0));
      if (A.length === 0)
        throw new SyntaxError("Expected at least one argument for member/slice expression");
      if (M) {
        if (A.length > 3)
          throw new SyntaxError("Expected 0-3 arguments for slice expression");
        return new Bv(...A);
      }
      return A[0];
    }
    function P(A) {
      for (; i(T.Dot) || i(T.OpenSquareBracket); ) {
        let M = t[r];
        ++r;
        let L, G = M.type === T.OpenSquareBracket;
        if (G)
          L = B(), n(T.CloseSquareBracket, "Expected closing square bracket");
        else if (L = K(), L.type !== "Identifier" && L.type !== "IntegerLiteral")
          throw new SyntaxError("Expected identifier or integer following dot operator");
        A = new Mv(A, L, G);
      }
      return A;
    }
    function I() {
      let A = S();
      for (; i(T.MultiplicativeBinaryOperator); ) {
        let M = t[r++], L = S();
        A = new tn(M, A, L);
      }
      return A;
    }
    function S() {
      let A = F();
      for (; i(T.ExponentiationBinaryOperator); ) {
        let M = t[r++], L = F();
        A = new tn(M, A, L);
      }
      return A;
    }
    function F() {
      let A = $();
      for (; l("is"); ) {
        ++r;
        let M = l("not");
        M && ++r;
        let L = K();
        if (!(L instanceof jt))
          throw new SyntaxError("Expected identifier for the test");
        A = new zv(A, M, L);
      }
      return A;
    }
    function $() {
      let A = Z();
      for (; i(T.Pipe); ) {
        ++r;
        let M = K();
        if (!(M instanceof jt))
          throw new SyntaxError("Expected identifier for the filter");
        i(T.OpenParen) && (M = O(M)), A = new $v(A, M);
      }
      return A;
    }
    function Z() {
      let A = t[r];
      if (A && (A.type === T.UnaryOperator || A.type === T.AdditiveBinaryOperator) && (A.value === "-" || A.value === "+")) {
        let M = t[r++], L = Z();
        return new k_(M, L);
      }
      return E();
    }
    function K() {
      let A = t[r++];
      switch (A.type) {
        case T.NumericLiteral: {
          let M = A.value;
          return M.includes(".") ? new Pv(Number(M)) : new Ov(Number(M));
        }
        case T.StringLiteral: {
          let M = A.value;
          for (; i(T.StringLiteral); )
            M += t[r++].value;
          return new v_(M);
        }
        case T.Identifier:
          return new jt(A.value);
        case T.OpenParen: {
          let M = m();
          return n(T.CloseParen, "Expected closing parenthesis, got ${tokens[current].type} instead."), M;
        }
        case T.OpenSquareBracket: {
          let M = [];
          for (; !i(T.CloseSquareBracket); )
            M.push(g()), i(T.Comma) && ++r;
          return ++r, new Lv(M);
        }
        case T.OpenCurlyBracket: {
          let M = /* @__PURE__ */ new Map();
          for (; !i(T.CloseCurlyBracket); ) {
            let L = g();
            n(T.Colon, "Expected colon between key and value in object literal");
            let G = g();
            M.set(L, G), i(T.Comma) && ++r;
          }
          return ++r, new Rv(M);
        }
        default:
          throw new SyntaxError(`Unexpected token: ${A.type}`);
      }
    }
    for (; r < t.length; )
      e.body.push(o());
    return e;
  }
  function Gv(t, e, r = 1) {
    if (e === void 0 && (e = t, t = 0), r === 0)
      throw new Error("range() step must not be zero");
    let n = [];
    if (r > 0)
      for (let s = t; s < e; s += r)
        n.push(s);
    else
      for (let s = t; s > e; s += r)
        n.push(s);
    return n;
  }
  function A_(t, e, r, n = 1) {
    let s = Math.sign(n);
    s >= 0 ? (e = (e ??= 0) < 0 ? Math.max(t.length + e, 0) : Math.min(e, t.length), r = (r ??= t.length) < 0 ? Math.max(t.length + r, 0) : Math.min(r, t.length)) : (e = (e ??= t.length - 1) < 0 ? Math.max(t.length + e, -1) : Math.min(e, t.length - 1), r = (r ??= -1) < -1 ? Math.max(t.length + r, -1) : Math.min(r, t.length - 1));
    let o = [];
    for (let i = e; s * i < s * r; i += n)
      o.push(t[i]);
    return o;
  }
  function qv(t) {
    return t.replace(/\b\w/g, (e) => e.toUpperCase());
  }
  function Hv(t) {
    return Yv(/* @__PURE__ */ new Date(), t);
  }
  function Yv(t, e) {
    let r = new Intl.DateTimeFormat(void 0, { month: "long" }), n = new Intl.DateTimeFormat(void 0, { month: "short" }), s = (o) => o < 10 ? "0" + o : o.toString();
    return e.replace(/%[YmdbBHM%]/g, (o) => {
      switch (o) {
        case "%Y":
          return t.getFullYear().toString();
        case "%m":
          return s(t.getMonth() + 1);
        case "%d":
          return s(t.getDate());
        case "%b":
          return n.format(t);
        case "%B":
          return r.format(t);
        case "%H":
          return s(t.getHours());
        case "%M":
          return s(t.getMinutes());
        case "%%":
          return "%";
        default:
          return o;
      }
    });
  }
  function Xv(t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function Kv(t, e, r, n) {
    if (n === 0)
      return t;
    let s = n == null || n < 0 ? 1 / 0 : n, o = e.length === 0 ? new RegExp("(?=)", "gu") : new RegExp(Xv(e), "gu");
    return t.replaceAll(o, (i) => s > 0 ? (--s, r) : i);
  }
  function C_(t) {
    return t.replace(Zv, (e) => "\\u" + e.charCodeAt(0).toString(16).padStart(4, "0"));
  }
  function Wt(t, e = {}, r = 0, n = !0) {
    let { indent: s = null, ensureAscii: o = !1, separators: i = null, sortKeys: a = !1 } = e, l, c;
    switch (i ? [l, c] = i : s ? (l = ",", c = ": ") : (l = ", ", c = ": "), t.type) {
      case "NullValue":
        return "null";
      case "UndefinedValue":
        return n ? "null" : "undefined";
      case "IntegerValue":
      case "FloatValue":
      case "BooleanValue":
        return JSON.stringify(t.value);
      case "StringValue": {
        let u = JSON.stringify(t.value);
        return o && (u = C_(u)), u;
      }
      case "ArrayValue":
      case "NamespaceValue":
      case "ObjectValue": {
        let u = s ? " ".repeat(s) : "", d = `
` + u.repeat(r), f = d + u;
        if (t.type === "ArrayValue") {
          let h = t.value.map((p) => Wt(p, e, r + 1, n));
          return s && h.length > 0 ? `[${f}${h.join(`${l}${f}`)}${d}]` : `[${h.join(l)}]`;
        } else {
          let h = Array.from(t.value.entries());
          a && (h = h.sort(([m], [_]) => m.localeCompare(_)));
          let p = h.map(([m, _]) => {
            let g = JSON.stringify(m);
            o && (g = C_(g));
            let w = `${g}${c}${Wt(_, e, r + 1, n)}`;
            return s ? `${f}${w}` : w;
          });
          return s && p.length > 0 ? `{${p.join(l)}${d}}` : `{${p.join(l)}}`;
        }
      }
      default:
        throw new Error(`Cannot convert to JSON: ${t.type}`);
    }
  }
  function Qv(t) {
    let e;
    if (t instanceof te ? e = t.value : t instanceof U && (e = Array.from(t.value, (s) => new U(s))), !e || e.length !== 2)
      throw new Error("namespace expected an object or an iterable of [key, value] pairs");
    let [r, n] = e;
    if (!(r instanceof U))
      throw new Error("namespace keys must be strings");
    return [r, n];
  }
  function e1(t) {
    let e = t.slice(), r;
    if (e.at(-1) instanceof rn && (r = e.pop()), e.length > 1)
      throw new Error(`namespace expected at most 1 argument, got ${e.length}`);
    let n = /* @__PURE__ */ new Map();
    if (e.length === 1) {
      let s = e[0];
      if (s instanceof Oe)
        for (let [o, i] of s.value)
          n.set(o, i);
      else if (s instanceof te)
        for (let o of s.value) {
          let [i, a] = Qv(o);
          n.set(i.value, a);
        }
      else
        throw new Error(`'${s.type}' object is not iterable`);
    }
    if (r)
      for (let [s, o] of r.value)
        n.set(s, o);
    return new Bc(n);
  }
  function t1(t) {
    t.set("false", !1), t.set("true", !0), t.set("none", null), t.set("raise_exception", (e) => {
      throw new Error(e);
    }), t.set("range", Gv), t.set("strftime_now", Hv), t.set("True", !0), t.set("False", !1), t.set("None", null);
  }
  function Ao(t) {
    return t instanceof Oe || t instanceof Bc;
  }
  function So(t) {
    return t instanceof Y || t instanceof ne || t instanceof H;
  }
  function Co(t) {
    return t instanceof H ? Number(t.value) : t.value;
  }
  function O_(t, e) {
    let r = e.split("."), n = t;
    for (let s of r)
      if (Ao(n))
        n = n.value.get(s) ?? new ae();
      else if (n instanceof te) {
        let o = parseInt(s, 10);
        if (!isNaN(o) && o >= 0 && o < n.value.length)
          n = n.value[o];
        else
          return new ae();
      } else
        return new ae();
    return n;
  }
  function Dc(t, e, r = !1) {
    if (t instanceof ue && e instanceof ue)
      return 0;
    if (t instanceof ue || e instanceof ue)
      throw new Error(`Cannot compare ${t.type} with ${e.type}`);
    if (t instanceof ae && e instanceof ae)
      return 0;
    if (t instanceof ae || e instanceof ae)
      throw new Error(`Cannot compare ${t.type} with ${e.type}`);
    if (So(t) && So(e)) {
      let n = Co(t), s = Co(e);
      return n < s ? -1 : n > s ? 1 : 0;
    }
    if (t.type !== e.type)
      throw new Error(`Cannot compare different types: ${t.type} and ${e.type}`);
    switch (t.type) {
      case "StringValue": {
        let n = t.value, s = e.value;
        return r || (n = n.toLowerCase(), s = s.toLowerCase()), n < s ? -1 : n > s ? 1 : 0;
      }
      default:
        throw new Error(`Cannot compare type: ${t.type}`);
    }
  }
  function zc(t) {
    if (t.type === "Identifier")
      return { name: t.value };
    let e = t;
    return { name: e.key.value, defaultValue: e.value };
  }
  function P_(t) {
    return t === "caller" || t === "kwargs" || t === "varargs";
  }
  function r1(t, e) {
    let r = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), s = (u) => {
      P_(u) && r.add(u);
    }, o = (u) => {
      if (u.type === "Identifier")
        s(u.value);
      else if (u.type === "TupleLiteral")
        for (let d of u.value)
          o(d);
    }, i = (u) => {
      s(zc(u).name);
    }, a = (u) => {
      for (let d of u) {
        let f = zc(d);
        f.defaultValue && c(f.defaultValue);
      }
    }, l = (u) => {
      u.type === "CallExpression" && c(u.args);
    }, c = (u) => {
      if (Array.isArray(u)) {
        for (let d of u)
          c(d);
        return;
      }
      if (u instanceof Map) {
        for (let [d, f] of u)
          c(d), c(f);
        return;
      }
      if (u instanceof Qe)
        switch (u.type) {
          case "For": {
            let d = u;
            if (o(d.loopvar), d.iterable.type === "SelectExpression") {
              let f = d.iterable;
              c(f.lhs), c(d.body), c(d.defaultBlock), c(f.test);
              return;
            }
            c(d.iterable), c(d.body), c(d.defaultBlock);
            return;
          }
          case "Set": {
            let d = u;
            o(d.assignee), c(d.value), c(d.body);
            return;
          }
          case "Macro": {
            let d = u;
            for (let f of d.args)
              i(f);
            a(d.args), c(d.body);
            return;
          }
          case "CallStatement": {
            let d = u;
            c(d.call);
            for (let f of d.callerArgs ?? [])
              i(f);
            a(d.callerArgs ?? []), c(d.body);
            return;
          }
          case "FilterStatement": {
            let d = u;
            c(d.body), l(d.filter);
            return;
          }
          case "Identifier": {
            let d = u.value;
            P_(d) && !r.has(d) && n.add(d);
            return;
          }
          case "MemberExpression": {
            let d = u;
            c(d.object), d.computed && c(d.property);
            return;
          }
          case "FilterExpression": {
            let d = u;
            c(d.operand), l(d.filter);
            return;
          }
          case "TestExpression":
            c(u.operand);
            return;
          case "SelectExpression": {
            let d = u;
            c(d.test), c(d.lhs);
            return;
          }
          case "KeywordArgumentExpression":
            c(u.value);
            return;
          default:
            for (let d of Object.values(u))
              c(d);
        }
    };
    for (let u of t)
      i(u);
    return c(e), n;
  }
  function R_(t) {
    let e = L_.get(t);
    if (e === void 0) {
      let r = t.type === "Macro" ? t.args : t.callerArgs ?? [];
      e = r1(r, t.body), L_.set(t, e);
    }
    return e;
  }
  function To(t) {
    switch (typeof t) {
      case "number":
        return Number.isInteger(t) ? new Y(t) : new ne(t);
      case "string":
        return new U(t);
      case "boolean":
        return new H(t);
      case "undefined":
        return new ae();
      case "object":
        return t === null ? new ue() : Array.isArray(t) ? new te(t.map(To)) : new Oe(
          new Map(Object.entries(t).map(([e, r]) => [e, To(r)]))
        );
      case "function":
        return new fe((e, r) => {
          let n = t(...e.map((s) => s.value)) ?? null;
          return To(n);
        });
      default:
        throw new Error(`Cannot convert to runtime value: ${t}`);
    }
  }
  function z_(t) {
    switch (t.operator.type) {
      case "ExponentiationBinaryOperator":
        return me.EXPONENTIATION;
      case "MultiplicativeBinaryOperator":
        return me.MULTIPLICATIVE;
      case "AdditiveBinaryOperator":
        return me.ADDITIVE;
      case "ComparisonBinaryOperator":
        return me.COMPARISON;
      case "Identifier":
        return t.operator.value === "and" ? me.LOGICAL_AND : t.operator.value === "in" || t.operator.value === "not in" ? me.COMPARISON : me.LOGICAL_OR;
    }
    return me.LOGICAL_OR;
  }
  function B_(t) {
    switch (t.type) {
      case "SelectExpression":
      case "Ternary":
        return me.CONDITIONAL;
      case "BinaryExpression":
        return z_(t);
      case "UnaryExpression":
        return t.operator.value === "not" ? me.LOGICAL_NOT : me.UNARY_SIGN;
      case "TestExpression":
        return me.TEST;
      case "FilterExpression":
        return me.FILTER;
      default:
        return me.ATOM;
    }
  }
  function lt(t, e) {
    let r = pe(t);
    return B_(t) < e ? `(${r})` : r;
  }
  function i1(t, e = "	") {
    let r = typeof e == "number" ? " ".repeat(e) : e;
    return ct(t.body, 0, r).replace(/\n$/, "");
  }
  function Se(...t) {
    return s1 + t.join(" ") + o1;
  }
  function ct(t, e, r) {
    return t.map((n) => a1(n, e, r)).join(Ee);
  }
  function Io(t) {
    return t.map((e) => pe(e)).join(", ");
  }
  function a1(t, e, r) {
    let n = r.repeat(e);
    switch (t.type) {
      case "Program":
        return ct(t.body, e, r);
      case "If":
        return l1(t, e, r);
      case "For":
        return c1(t, e, r);
      case "Set":
        return u1(t, e, r);
      case "Macro":
        return d1(t, e, r);
      case "Break":
        return n + Se("break");
      case "Continue":
        return n + Se("continue");
      case "CallStatement":
        return f1(t, e, r);
      case "FilterStatement":
        return h1(t, e, r);
      case "Comment":
        return n + "{# " + t.value + " #}";
      default:
        return n + "{{- " + pe(t) + " -}}";
    }
  }
  function l1(t, e, r) {
    let n = r.repeat(e), s = [], o = t;
    for (; o && (s.push({ test: o.test, body: o.body }), o.alternate.length === 1 && o.alternate[0].type === "If"); )
      o = o.alternate[0];
    let i = n + Se("if", pe(s[0].test)) + Ee + ct(s[0].body, e + 1, r);
    for (let a = 1; a < s.length; ++a)
      i += Ee + n + Se("elif", pe(s[a].test)) + Ee + ct(s[a].body, e + 1, r);
    return o && o.alternate.length > 0 && (i += Ee + n + Se("else") + Ee + ct(o.alternate, e + 1, r)), i += Ee + n + Se("endif"), i;
  }
  function c1(t, e, r) {
    let n = r.repeat(e), s = "";
    if (t.iterable.type === "SelectExpression") {
      let i = t.iterable;
      s = `${pe(i.lhs)} if ${pe(i.test)}`;
    } else
      s = pe(t.iterable);
    let o = n + Se("for", pe(t.loopvar), "in", s) + Ee + ct(t.body, e + 1, r);
    return t.defaultBlock.length > 0 && (o += Ee + n + Se("else") + Ee + ct(t.defaultBlock, e + 1, r)), o += Ee + n + Se("endfor"), o;
  }
  function u1(t, e, r) {
    let n = r.repeat(e), s = pe(t.assignee), o = t.value ? pe(t.value) : "", i = n + Se("set", `${s}${t.value ? " = " + o : ""}`);
    return t.body.length === 0 ? i : i + Ee + ct(t.body, e + 1, r) + Ee + n + Se("endset");
  }
  function d1(t, e, r) {
    let n = r.repeat(e), s = Io(t.args);
    return n + Se("macro", `${t.name.value}(${s})`) + Ee + ct(t.body, e + 1, r) + Ee + n + Se("endmacro");
  }
  function f1(t, e, r) {
    let n = r.repeat(e), s = t.callerArgs && t.callerArgs.length > 0 ? `(${Io(t.callerArgs)})` : "", o = pe(t.call), i = n + Se(`call${s}`, o) + Ee;
    return i += ct(t.body, e + 1, r) + Ee, i += n + Se("endcall"), i;
  }
  function h1(t, e, r) {
    let n = r.repeat(e), s = t.filter.type === "Identifier" ? t.filter.value : pe(t.filter), o = n + Se("filter", s) + Ee;
    return o += ct(t.body, e + 1, r) + Ee, o += n + Se("endfilter"), o;
  }
  function pe(t) {
    switch (t.type) {
      case "SpreadExpression":
        return `*${pe(t.argument)}`;
      case "KeywordSpreadExpression":
        return `**${pe(t.argument)}`;
      case "Identifier":
        return t.value;
      case "IntegerLiteral":
        return `${t.value}`;
      case "FloatLiteral": {
        let e = t.value;
        return Object.is(e, -0) ? "-0.0" : e % 1 === 0 ? e.toFixed(1) : e.toString();
      }
      case "StringLiteral":
        return JSON.stringify(t.value);
      case "BinaryExpression": {
        let e = t, r = z_(e), n = lt(e.left, r), s = lt(e.right, r + 1);
        return `${n} ${e.operator.value} ${s}`;
      }
      case "UnaryExpression": {
        let e = t, r = e.argument.type === "UnaryExpression" ? B_(e) : me.ATOM;
        return e.operator.value + (e.operator.value === "not" ? " " : "") + lt(e.argument, r);
      }
      case "CallExpression": {
        let e = t, r = Io(e.args);
        return `${pe(e.callee)}(${r})`;
      }
      case "MemberExpression": {
        let e = t, r = lt(e.object, me.ATOM), n = pe(e.property);
        return !e.computed && e.property.type !== "Identifier" && e.property.type !== "IntegerLiteral" && (n = `(${n})`), e.computed ? `${r}[${n}]` : `${r}.${n}`;
      }
      case "FilterExpression": {
        let e = t, r = lt(e.operand, me.FILTER);
        return e.filter.type === "CallExpression" ? `${r} | ${pe(e.filter)}` : `${r} | ${e.filter.value}`;
      }
      case "SelectExpression": {
        let e = t;
        return `${lt(e.lhs, me.LOGICAL_OR)} if ${lt(e.test, me.LOGICAL_OR)}`;
      }
      case "TestExpression": {
        let e = t;
        return `${lt(e.operand, me.TEST)} is${e.negate ? " not" : ""} ${e.test.value}`;
      }
      case "ArrayLiteral":
      case "TupleLiteral": {
        let e = Io(t.value), r = t.type === "ArrayLiteral" ? "[]" : "()";
        return `${r[0]}${e}${r[1]}`;
      }
      case "ObjectLiteral":
        return `{${Array.from(t.value.entries()).map(
          ([r, n]) => `${pe(r)}: ${pe(n)}`
        ).join(", ")}}`;
      case "SliceExpression": {
        let e = t, r = e.start ? pe(e.start) : "", n = e.stop ? pe(e.stop) : "", s = e.step ? `:${pe(e.step)}` : "";
        return `${r}:${n}${s}`;
      }
      case "KeywordArgumentExpression": {
        let e = t;
        return `${e.key.value}=${pe(e.value)}`;
      }
      case "Ternary": {
        let e = t;
        return `${lt(e.trueExpr, me.LOGICAL_OR)} if ${lt(
          e.condition,
          me.LOGICAL_OR
        )} else ${lt(e.falseExpr, me.CONDITIONAL)}`;
      }
      default:
        throw new Error(`Unknown expression type: ${t.type}`);
    }
  }
  var mv, _v, gv, T, Ze, wv, $_, yv, Qe, vv, Ev, kv, Av, Tv, Sv, Cv, Iv, $e, Mv, x_, jt, nn, Ov, Pv, v_, Lv, E_, Rv, tn, $v, Nv, Dv, zv, k_, Bv, $c, Uv, Fv, jv, Wv, T_, S_, Jv, ut, Y, ne, U, H, Zv, Oe, N_, rn, Bc, te, I_, fe, ue, ae, M_, D_, Ct, L_, n1, Ee, s1, o1, me, U_, F_ = b(() => {
    mv = Object.defineProperty, _v = (t, e, r) => e in t ? mv(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, gv = (t, e, r) => (_v(t, typeof e != "symbol" ? e + "" : e, r), r), T = Object.freeze({
      Text: "Text",
      // The text between Jinja statements or expressions
      NumericLiteral: "NumericLiteral",
      // e.g., 123, 1.0
      StringLiteral: "StringLiteral",
      // 'string'
      Identifier: "Identifier",
      // Variables, functions, statements, booleans, etc.
      Equals: "Equals",
      // =
      OpenParen: "OpenParen",
      // (
      CloseParen: "CloseParen",
      // )
      OpenStatement: "OpenStatement",
      // {%
      CloseStatement: "CloseStatement",
      // %}
      OpenExpression: "OpenExpression",
      // {{
      CloseExpression: "CloseExpression",
      // }}
      OpenSquareBracket: "OpenSquareBracket",
      // [
      CloseSquareBracket: "CloseSquareBracket",
      // ]
      OpenCurlyBracket: "OpenCurlyBracket",
      // {
      CloseCurlyBracket: "CloseCurlyBracket",
      // }
      Comma: "Comma",
      // ,
      Dot: "Dot",
      // .
      Colon: "Colon",
      // :
      Pipe: "Pipe",
      // |
      CallOperator: "CallOperator",
      // ()
      AdditiveBinaryOperator: "AdditiveBinaryOperator",
      // + - ~
      MultiplicativeBinaryOperator: "MultiplicativeBinaryOperator",
      // * / // %
      ExponentiationBinaryOperator: "ExponentiationBinaryOperator",
      // **
      ComparisonBinaryOperator: "ComparisonBinaryOperator",
      // < > <= >= == !=
      UnaryOperator: "UnaryOperator",
      // ! - +
      Comment: "Comment"
      // {# ... #}
    }), Ze = class {
      /**
       * Constructs a new Token.
       * @param {string} value The raw value as seen inside the source code.
       * @param {TokenType} type The type of token.
       */
      constructor(t, e) {
        this.value = t, this.type = e;
      }
    };
    wv = [
      // Control sequences
      ["{%", T.OpenStatement],
      ["%}", T.CloseStatement],
      ["{{", T.OpenExpression],
      ["}}", T.CloseExpression],
      // Single character tokens
      ["(", T.OpenParen],
      [")", T.CloseParen],
      ["{", T.OpenCurlyBracket],
      ["}", T.CloseCurlyBracket],
      ["[", T.OpenSquareBracket],
      ["]", T.CloseSquareBracket],
      [",", T.Comma],
      [".", T.Dot],
      [":", T.Colon],
      ["|", T.Pipe],
      // Comparison operators
      ["<=", T.ComparisonBinaryOperator],
      [">=", T.ComparisonBinaryOperator],
      ["==", T.ComparisonBinaryOperator],
      ["!=", T.ComparisonBinaryOperator],
      ["<", T.ComparisonBinaryOperator],
      [">", T.ComparisonBinaryOperator],
      // Arithmetic operators
      ["+", T.AdditiveBinaryOperator],
      ["-", T.AdditiveBinaryOperator],
      ["~", T.AdditiveBinaryOperator],
      ["**", T.ExponentiationBinaryOperator],
      // NOTE: must come before "*" so that "**" is matched first
      ["*", T.MultiplicativeBinaryOperator],
      ["//", T.MultiplicativeBinaryOperator],
      // NOTE: must come before "/" so that "//" is matched first
      ["/", T.MultiplicativeBinaryOperator],
      ["%", T.MultiplicativeBinaryOperator],
      // Assignment operator
      ["=", T.Equals]
    ], $_ = [];
    for (let t of wv)
      ($_[t[0].charCodeAt(0)] ??= []).push(t);
    yv = /* @__PURE__ */ new Map([
      ["n", `
`],
      // New line
      ["t", "	"],
      // Horizontal tab
      ["r", "\r"],
      // Carriage return
      ["b", "\b"],
      // Backspace
      ["f", "\f"],
      // Form feed
      ["v", "\v"],
      // Vertical tab
      ["'", "'"],
      // Single quote
      ['"', '"'],
      // Double quote
      ["\\", "\\"]
      // Backslash
    ]);
    Qe = class {
      type = "Statement";
    }, vv = class extends Qe {
      constructor(t) {
        super(), this.body = t;
      }
      type = "Program";
    }, Ev = class extends Qe {
      constructor(t, e, r) {
        super(), this.test = t, this.body = e, this.alternate = r;
      }
      type = "If";
    }, kv = class extends Qe {
      constructor(t, e, r, n) {
        super(), this.loopvar = t, this.iterable = e, this.body = r, this.defaultBlock = n;
      }
      type = "For";
    }, Av = class extends Qe {
      type = "Break";
    }, Tv = class extends Qe {
      type = "Continue";
    }, Sv = class extends Qe {
      constructor(t, e, r) {
        super(), this.assignee = t, this.value = e, this.body = r;
      }
      type = "Set";
    }, Cv = class extends Qe {
      constructor(t, e, r) {
        super(), this.name = t, this.args = e, this.body = r;
      }
      type = "Macro";
    }, Iv = class extends Qe {
      constructor(t) {
        super(), this.value = t;
      }
      type = "Comment";
    }, $e = class extends Qe {
      type = "Expression";
    }, Mv = class extends $e {
      constructor(t, e, r) {
        super(), this.object = t, this.property = e, this.computed = r;
      }
      type = "MemberExpression";
    }, x_ = class extends $e {
      constructor(t, e) {
        super(), this.callee = t, this.args = e;
      }
      type = "CallExpression";
    }, jt = class extends $e {
      /**
       * @param {string} value The name of the identifier
       */
      constructor(t) {
        super(), this.value = t;
      }
      type = "Identifier";
    }, nn = class extends $e {
      constructor(t) {
        super(), this.value = t;
      }
      type = "Literal";
    }, Ov = class extends nn {
      type = "IntegerLiteral";
    }, Pv = class extends nn {
      type = "FloatLiteral";
    }, v_ = class extends nn {
      type = "StringLiteral";
    }, Lv = class extends nn {
      type = "ArrayLiteral";
    }, E_ = class extends nn {
      type = "TupleLiteral";
    }, Rv = class extends nn {
      type = "ObjectLiteral";
    }, tn = class extends $e {
      constructor(t, e, r) {
        super(), this.operator = t, this.left = e, this.right = r;
      }
      type = "BinaryExpression";
    }, $v = class extends $e {
      constructor(t, e) {
        super(), this.operand = t, this.filter = e;
      }
      type = "FilterExpression";
    }, Nv = class extends Qe {
      constructor(t, e) {
        super(), this.filter = t, this.body = e;
      }
      type = "FilterStatement";
    }, Dv = class extends $e {
      constructor(t, e) {
        super(), this.lhs = t, this.test = e;
      }
      type = "SelectExpression";
    }, zv = class extends $e {
      constructor(t, e, r) {
        super(), this.operand = t, this.negate = e, this.test = r;
      }
      type = "TestExpression";
    }, k_ = class extends $e {
      constructor(t, e) {
        super(), this.operator = t, this.argument = e;
      }
      type = "UnaryExpression";
    }, Bv = class extends $e {
      constructor(t = void 0, e = void 0, r = void 0) {
        super(), this.start = t, this.stop = e, this.step = r;
      }
      type = "SliceExpression";
    }, $c = class extends $e {
      constructor(t, e) {
        super(), this.key = t, this.value = e;
      }
      type = "KeywordArgumentExpression";
    }, Uv = class extends $e {
      constructor(t) {
        super(), this.argument = t;
      }
      type = "SpreadExpression";
    }, Fv = class extends $e {
      constructor(t) {
        super(), this.argument = t;
      }
      type = "KeywordSpreadExpression";
    }, jv = class extends Qe {
      constructor(t, e, r) {
        super(), this.call = t, this.callerArgs = e, this.body = r;
      }
      type = "CallStatement";
    }, Wv = class extends $e {
      constructor(t, e, r) {
        super(), this.condition = t, this.trueExpr = e, this.falseExpr = r;
      }
      type = "Ternary";
    };
    T_ = class extends Error {
    }, S_ = class extends Error {
    }, Jv = /* @__PURE__ */ new Map(), ut = class {
      /**
       * A collection of built-in functions for this type.
       */
      get builtins() {
        return Jv;
      }
      /**
       * Creates a new RuntimeValue.
       */
      constructor(t = void 0) {
        this.type = "RuntimeValue", this.value = t;
      }
      /**
       * Determines truthiness or falsiness of the runtime value.
       * This function should be overridden by subclasses if it has custom truthiness criteria.
       * @returns {BooleanValue} BooleanValue(true) if the value is truthy, BooleanValue(false) otherwise.
       */
      __bool__() {
        return new H(!!this.value);
      }
      toString() {
        return String(this.value);
      }
    }, Y = class extends ut {
      constructor(t) {
        super(t), this.type = "IntegerValue";
      }
    }, ne = class extends ut {
      constructor(t) {
        super(t), this.type = "FloatValue";
      }
      toString() {
        return Object.is(this.value, -0) ? "-0.0" : this.value % 1 === 0 ? this.value.toFixed(1) : this.value.toString();
      }
    }, U = class extends ut {
      _builtins;
      constructor(t) {
        super(t), this.type = "StringValue";
      }
      get builtins() {
        return this._builtins ??= /* @__PURE__ */ new Map([
          [
            "upper",
            new fe(() => new U(this.value.toUpperCase()))
          ],
          [
            "lower",
            new fe(() => new U(this.value.toLowerCase()))
          ],
          [
            "strip",
            new fe(() => new U(this.value.trim()))
          ],
          [
            "title",
            new fe(() => new U(qv(this.value)))
          ],
          [
            "capitalize",
            new fe(() => new U(this.value.charAt(0).toUpperCase() + this.value.slice(1)))
          ],
          ["length", new Y(this.value.length)],
          [
            "rstrip",
            new fe(() => new U(this.value.trimEnd()))
          ],
          [
            "lstrip",
            new fe(() => new U(this.value.trimStart()))
          ],
          [
            "startswith",
            new fe((t) => {
              if (t.length === 0)
                throw new Error("startswith() requires at least one argument");
              let e = t[0];
              if (e instanceof U)
                return new H(this.value.startsWith(e.value));
              if (e instanceof te) {
                for (let r of e.value) {
                  if (!(r instanceof U))
                    throw new Error("startswith() tuple elements must be strings");
                  if (this.value.startsWith(r.value))
                    return new H(!0);
                }
                return new H(!1);
              }
              throw new Error("startswith() argument must be a string or tuple of strings");
            })
          ],
          [
            "endswith",
            new fe((t) => {
              if (t.length === 0)
                throw new Error("endswith() requires at least one argument");
              let e = t[0];
              if (e instanceof U)
                return new H(this.value.endsWith(e.value));
              if (e instanceof te) {
                for (let r of e.value) {
                  if (!(r instanceof U))
                    throw new Error("endswith() tuple elements must be strings");
                  if (this.value.endsWith(r.value))
                    return new H(!0);
                }
                return new H(!1);
              }
              throw new Error("endswith() argument must be a string or tuple of strings");
            })
          ],
          [
            "split",
            // follows Python's `str.split(sep=None, maxsplit=-1)` function behavior
            // https://docs.python.org/3.13/library/stdtypes.html#str.split
            new fe((t) => {
              let e = t[0] ?? new ue();
              if (!(e instanceof U || e instanceof ue))
                throw new Error("sep argument must be a string or null");
              let r = t[1] ?? new Y(-1);
              if (!(r instanceof Y))
                throw new Error("maxsplit argument must be a number");
              let n = [];
              if (e instanceof ue) {
                let s = this.value.trimStart();
                for (let { 0: o, index: i } of s.matchAll(/\S+/g)) {
                  if (r.value >= 0 && n.length >= r.value && i !== void 0) {
                    n.push(o + s.slice(i + o.length));
                    break;
                  }
                  n.push(o);
                }
              } else {
                if (e.value === "")
                  throw new Error("empty separator");
                n = this.value.split(e.value), r.value >= 0 && n.length > r.value && n.push(n.splice(r.value).join(e.value));
              }
              return new te(n.map((s) => new U(s)));
            })
          ],
          [
            "replace",
            new fe((t) => {
              if (t.length < 2)
                throw new Error("replace() requires at least two arguments");
              let e = t[0], r = t[1];
              if (!(e instanceof U && r instanceof U))
                throw new Error("replace() arguments must be strings");
              let n;
              if (t.length > 2 ? t[2].type === "KeywordArgumentsValue" ? n = t[2].value.get("count") ?? new ue() : n = t[2] : n = new ue(), !(n instanceof Y || n instanceof ue))
                throw new Error("replace() count argument must be a number or null");
              return new U(Kv(this.value, e.value, r.value, n.value));
            })
          ]
        ]);
      }
    }, H = class extends ut {
      constructor(t) {
        super(t), this.type = "BooleanValue";
      }
    }, Zv = /[\x7f-\uffff]/g;
    Oe = class extends ut {
      _builtins;
      constructor(t) {
        super(t), this.type = "ObjectValue";
      }
      /**
       * NOTE: necessary to override since all JavaScript arrays are considered truthy,
       * while only non-empty Python arrays are consider truthy.
       *
       * e.g.,
       *  - JavaScript:  {} && 5 -> 5
       *  - Python:      {} and 5 -> {}
       */
      __bool__() {
        return new H(this.value.size > 0);
      }
      get builtins() {
        return this._builtins ??= /* @__PURE__ */ new Map([
          [
            "get",
            new fe(([t, e]) => {
              if (!(t instanceof U))
                throw new Error(`Object key must be a string: got ${t.type}`);
              return this.value.get(t.value) ?? e ?? new ue();
            })
          ],
          ["items", new fe(() => this.items())],
          ["keys", new fe(() => this.keys())],
          ["values", new fe(() => this.values())],
          [
            "dictsort",
            new fe((t) => {
              let e = /* @__PURE__ */ new Map(), r = t.filter((a) => a instanceof rn ? (e = a.value, !1) : !0), n = r.at(0) ?? e.get("case_sensitive") ?? new H(!1);
              if (!(n instanceof H))
                throw new Error("case_sensitive must be a boolean");
              let s = r.at(1) ?? e.get("by") ?? new U("key");
              if (!(s instanceof U))
                throw new Error("by must be a string");
              if (!["key", "value"].includes(s.value))
                throw new Error("by must be either 'key' or 'value'");
              let o = r.at(2) ?? e.get("reverse") ?? new H(!1);
              if (!(o instanceof H))
                throw new Error("reverse must be a boolean");
              let i = Array.from(this.value.entries()).map(([a, l]) => new te([new U(a), l])).sort((a, l) => {
                let c = s.value === "key" ? 0 : 1, u = a.value[c], d = l.value[c], f = Dc(u, d, n.value);
                return o.value ? -f : f;
              });
              return new te(i);
            })
          ]
        ]);
      }
      items() {
        return new te(
          Array.from(this.value.entries()).map(([t, e]) => new te([new U(t), e]))
        );
      }
      keys() {
        return new te(Array.from(this.value.keys()).map((t) => new U(t)));
      }
      values() {
        return new te(Array.from(this.value.values()));
      }
      toString() {
        return Wt(this, {}, 0, !1);
      }
    }, N_ = class extends Oe {
      constructor(t, e, r, n) {
        super(), this.iteration = t, this.length = e, this.previtem = r, this.nextitem = n;
      }
      createEntries() {
        let t = this.iteration, e = this.length;
        return /* @__PURE__ */ new Map([
          ["index", new Y(t + 1)],
          ["index0", new Y(t)],
          ["revindex", new Y(e - t)],
          ["revindex0", new Y(e - t - 1)],
          ["first", new H(t === 0)],
          ["last", new H(t === e - 1)],
          ["length", new Y(e)],
          ["previtem", this.previtem ?? new ae()],
          ["nextitem", this.nextitem ?? new ae()]
        ]);
      }
    };
    Object.defineProperty(N_.prototype, "value", {
      get() {
        return this.entries ??= this.createEntries();
      },
      set(t) {
        this.entries = t;
      },
      configurable: !0
    });
    rn = class extends Oe {
      constructor(t) {
        super(t), this.type = "KeywordArgumentsValue";
      }
    }, Bc = class extends ut {
      constructor(t) {
        super(t), this.type = "NamespaceValue";
      }
      toString() {
        return Wt(this, {}, 0, !1);
      }
    }, te = class extends ut {
      _builtins;
      constructor(t) {
        super(t), this.type = "ArrayValue";
      }
      get builtins() {
        return this._builtins ??= /* @__PURE__ */ new Map([["length", new Y(this.value.length)]]);
      }
      /**
       * NOTE: necessary to override since all JavaScript arrays are considered truthy,
       * while only non-empty Python arrays are consider truthy.
       *
       * e.g.,
       *  - JavaScript:  [] && 5 -> 5
       *  - Python:      [] and 5 -> []
       */
      __bool__() {
        return new H(this.value.length > 0);
      }
      toString() {
        return Wt(this, {}, 0, !1);
      }
    }, I_ = class extends te {
      constructor(t) {
        super(t), this.type = "TupleValue";
      }
    }, fe = class extends ut {
      constructor(t) {
        super(t), this.type = "FunctionValue";
      }
    }, ue = class extends ut {
      constructor(t) {
        super(t), this.type = "NullValue";
      }
    }, ae = class extends ut {
      constructor(t) {
        super(t), this.type = "UndefinedValue";
      }
    };
    M_ = Symbol("callBlockScope"), D_ = class {
      constructor(t) {
        this.parent = t;
      }
      /**
       * The variables declared in this environment.
       */
      variables = (/* @__PURE__ */ new Map()).set(
        "namespace",
        new fe(e1)
      );
      tests = D_.TESTS;
      /**
       * Set the value of a variable in the current environment.
       */
      set(t, e) {
        return this.declareVariable(t, To(e));
      }
      declareVariable(t, e) {
        if (this.variables.has(t))
          throw new SyntaxError(`Variable already declared: ${t}`);
        return this.variables.set(t, e), e;
      }
      // private assignVariable(name: string, value: AnyRuntimeValue): AnyRuntimeValue {
      // 	const env = this.resolve(name);
      // 	env.variables.set(name, value);
      // 	return value;
      // }
      /**
       * Set variable in the current scope.
       * See https://jinja.palletsprojects.com/en/3.0.x/templates/#assignments for more information.
       */
      setVariable(t, e) {
        return this.variables.set(t, e), e;
      }
      /**
       * Resolve the environment in which the variable is declared.
       * @param {string} name The name of the variable.
       * @returns {Environment | undefined} The environment containing the variable, if declared.
       */
      resolve(t) {
        if (this.variables.has(t))
          return this;
        if (this.parent)
          return this.parent.resolve(t);
      }
      lookupVariable(t) {
        try {
          return this.resolve(t)?.variables.get(t) ?? new ae();
        } catch {
          return new ae();
        }
      }
    }, Ct = D_;
    gv(Ct, "TESTS", /* @__PURE__ */ new Map([
      ["boolean", (t) => t.type === "BooleanValue"],
      ["callable", (t) => t instanceof fe],
      [
        "odd",
        (t) => {
          if (!(t instanceof Y))
            throw new Error(`cannot odd on ${t.type}`);
          return t.value % 2 !== 0;
        }
      ],
      [
        "even",
        (t) => {
          if (!(t instanceof Y))
            throw new Error(`cannot even on ${t.type}`);
          return t.value % 2 === 0;
        }
      ],
      ["false", (t) => t.type === "BooleanValue" && !t.value],
      ["true", (t) => t.type === "BooleanValue" && t.value],
      ["none", (t) => t.type === "NullValue"],
      ["string", (t) => t.type === "StringValue"],
      ["number", (t) => t instanceof Y || t instanceof ne],
      ["integer", (t) => t instanceof Y],
      ["iterable", (t) => t.type === "ArrayValue" || t.type === "StringValue"],
      ["mapping", (t) => t instanceof Oe],
      [
        "sequence",
        (t) => t instanceof te || t instanceof Oe || t instanceof U
      ],
      [
        "lower",
        (t) => {
          let e = t.value;
          return t.type === "StringValue" && e === e.toLowerCase();
        }
      ],
      [
        "upper",
        (t) => {
          let e = t.value;
          return t.type === "StringValue" && e === e.toUpperCase();
        }
      ],
      ["none", (t) => t.type === "NullValue"],
      ["defined", (t) => t.type !== "UndefinedValue"],
      ["undefined", (t) => t.type === "UndefinedValue"],
      ["equalto", (t, e) => t.value === e.value],
      ["eq", (t, e) => t.value === e.value]
    ]));
    L_ = /* @__PURE__ */ new WeakMap();
    n1 = class {
      global;
      constructor(t) {
        this.global = t ?? new Ct();
      }
      /**
       * Run the program.
       */
      run(t) {
        return this.evaluate(t, this.global);
      }
      /**
       * Evaluates expressions following the binary operation type.
       */
      evaluateBinaryExpression(t, e) {
        let r = t.operator.value, n = this.evaluate(t.left, e);
        switch (r) {
          case "and":
            return n.__bool__().value ? this.evaluate(t.right, e) : n;
          case "or":
            return n.__bool__().value ? n : this.evaluate(t.right, e);
        }
        let s = this.evaluate(t.right, e);
        switch (r) {
          case "==":
            return new H(n.value == s.value);
          case "!=":
            return new H(n.value != s.value);
        }
        if ((n instanceof Y || n instanceof ne) && (s instanceof Y || s instanceof ne) && // These two operators are handled (for all operand types) below
        r !== "~" && r !== "**") {
          let o = n.value, i = s.value;
          switch (r) {
            case "+":
            case "-":
            case "*": {
              let a = r === "+" ? o + i : r === "-" ? o - i : o * i;
              return n instanceof ne || s instanceof ne ? new ne(a) : new Y(a);
            }
            case "/":
              return new ne(o / i);
            case "//": {
              let a = Math.floor(o / i);
              return n instanceof ne || s instanceof ne ? new ne(a) : new Y(a);
            }
            case "%": {
              let a = o % i;
              return n instanceof ne || s instanceof ne ? new ne(a) : new Y(a);
            }
            case "<":
              return new H(o < i);
            case ">":
              return new H(o > i);
            case ">=":
              return new H(o >= i);
            case "<=":
              return new H(o <= i);
          }
        } else if (n instanceof ae || s instanceof ae) {
          if (s instanceof ae && ["in", "not in"].includes(r))
            return new H(r === "not in");
          if (r === "~" && !(n instanceof ue || s instanceof ue)) {
            let o = n instanceof ae ? "" : n.value.toString(), i = s instanceof ae ? "" : s.value.toString();
            return new U(o + i);
          }
          throw new Error(`Cannot perform operation ${r} on undefined values`);
        } else {
          if (n instanceof ue || s instanceof ue)
            throw new Error("Cannot perform operation on null values");
          if (r === "~")
            return new U(n.value.toString() + s.value.toString());
          if (r === "**" && So(n) && So(s)) {
            let o = Co(n), i = Co(s);
            if (o === 0 && i < 0)
              throw new Error("0.0 cannot be raised to a negative power");
            let a = o ** i;
            if (!Number.isFinite(a))
              throw new Error("Exponentiation result is not a finite real number");
            return n instanceof ne || s instanceof ne || i < 0 ? new ne(a) : new Y(a);
          } else if (n instanceof te && s instanceof te)
            switch (r) {
              case "+":
                return new te(n.value.concat(s.value));
            }
          else if (s instanceof te) {
            let o = s.value.find((i) => i.value === n.value) !== void 0;
            switch (r) {
              case "in":
                return new H(o);
              case "not in":
                return new H(!o);
            }
          }
        }
        if (n instanceof U || s instanceof U)
          switch (r) {
            case "+":
              return new U(n.value.toString() + s.value.toString());
          }
        if (n instanceof U && s instanceof U)
          switch (r) {
            case "in":
              return new H(s.value.includes(n.value));
            case "not in":
              return new H(!s.value.includes(n.value));
          }
        if (n instanceof U && s instanceof Oe)
          switch (r) {
            case "in":
              return new H(s.value.has(n.value));
            case "not in":
              return new H(!s.value.has(n.value));
          }
        throw new SyntaxError(`Unknown operator "${r}" between ${n.type} and ${s.type}`);
      }
      /**
       * Evaluates the arguments of a call in the calling convention of FunctionValue: the positional arguments,
       * followed by a single KeywordArgumentsValue with all keyword arguments (if there are any).
       */
      evaluateCallArguments(t, e) {
        for (let n of t) {
          let s = n.type;
          if (s === "KeywordArgumentExpression" || s === "SpreadExpression" || s === "KeywordSpreadExpression") {
            let [o, i] = this.evaluateArguments(t, e);
            return i.size > 0 && o.push(new rn(i)), o;
          }
        }
        let r = new Array(t.length);
        for (let n = 0; n < t.length; ++n)
          r[n] = this.evaluate(t[n], e);
        return r;
      }
      evaluateArguments(t, e) {
        let r = [], n = /* @__PURE__ */ new Map(), s = (o, i) => {
          if (n.has(o))
            throw new Error(`Got multiple values for keyword argument '${o}'`);
          n.set(o, i);
        };
        for (let o of t)
          if (o.type === "SpreadExpression") {
            let i = o, a = this.evaluate(i.argument, e);
            if (!(a instanceof te))
              throw new Error(`Cannot unpack non-iterable type: ${a.type}`);
            for (let l of a.value)
              r.push(l);
          } else o.type !== "KeywordArgumentExpression" && o.type !== "KeywordSpreadExpression" && r.push(this.evaluate(o, e));
        for (let o of t)
          if (o.type === "KeywordArgumentExpression") {
            let i = o;
            s(i.key.value, this.evaluate(i.value, e));
          } else if (o.type === "KeywordSpreadExpression") {
            let i = o, a = this.evaluate(i.argument, e);
            if (!(a instanceof Oe))
              throw new Error(`Argument after ** must be a mapping, not ${a.type}`);
            for (let [l, c] of a.value)
              s(l, c);
          }
        return [r, n];
      }
      applyFilter(t, e, r) {
        if (e.type === "Identifier") {
          let n = e;
          if (n.value === "safe")
            return t;
          if (n.value === "tojson")
            return new U(Wt(t, {}));
          if (t instanceof te)
            switch (n.value) {
              case "list":
                return t;
              case "first":
                return t.value[0];
              case "last":
                return t.value[t.value.length - 1];
              case "length":
                return new Y(t.value.length);
              case "reverse":
                return new te(t.value.slice().reverse());
              case "sort":
                return new te(t.value.slice().sort((s, o) => Dc(s, o, !1)));
              case "join":
                return new U(t.value.map((s) => s.value).join(""));
              case "string":
                return new U(Wt(t, {}, 0, !1));
              case "unique": {
                let s = /* @__PURE__ */ new Set(), o = [];
                for (let i of t.value)
                  s.has(i.value) || (s.add(i.value), o.push(i));
                return new te(o);
              }
              default:
                throw new Error(`Unknown ArrayValue filter: ${n.value}`);
            }
          else if (t instanceof U)
            switch (n.value) {
              case "length":
              case "upper":
              case "lower":
              case "title":
              case "capitalize": {
                let s = t.builtins.get(n.value);
                if (s instanceof fe)
                  return s.value(
                    /* no arguments */
                    [],
                    r
                  );
                if (s instanceof Y)
                  return s;
                throw new Error(`Unknown StringValue filter: ${n.value}`);
              }
              case "trim":
                return new U(t.value.trim());
              case "indent":
                return new U(
                  t.value.split(`
`).map(
                    (s, o) => (
                      // By default, don't indent the first line or empty lines
                      o === 0 || s.length === 0 ? s : "    " + s
                    )
                  ).join(`
`)
                );
              case "join":
              case "string":
                return t;
              case "int": {
                let s = parseInt(t.value, 10);
                return new Y(isNaN(s) ? 0 : s);
              }
              case "float": {
                let s = parseFloat(t.value);
                return new ne(isNaN(s) ? 0 : s);
              }
              default:
                throw new Error(`Unknown StringValue filter: ${n.value}`);
            }
          else if (t instanceof Y || t instanceof ne)
            switch (n.value) {
              case "abs":
                return t instanceof Y ? new Y(Math.abs(t.value)) : new ne(Math.abs(t.value));
              case "int":
                return new Y(Math.trunc(t.value) + 0);
              case "float":
                return new ne(t.value);
              case "string":
                return new U(t.toString());
              default:
                throw new Error(`Unknown NumericValue filter: ${n.value}`);
            }
          else if (t instanceof Oe)
            switch (n.value) {
              case "items":
                return new te(
                  Array.from(t.value.entries()).map(([s, o]) => new te([new U(s), o]))
                );
              case "length":
                return new Y(t.value.size);
              default: {
                let s = t.builtins.get(n.value);
                if (s)
                  return s instanceof fe ? s.value([], r) : s;
                throw new Error(`Unknown ObjectValue filter: ${n.value}`);
              }
            }
          else if (t instanceof H)
            switch (n.value) {
              case "bool":
                return new H(t.value);
              case "int":
                return new Y(t.value ? 1 : 0);
              case "float":
                return new ne(t.value ? 1 : 0);
              case "string":
                return new U(t.value ? "true" : "false");
              default:
                throw new Error(`Unknown BooleanValue filter: ${n.value}`);
            }
          throw new Error(`Cannot apply filter "${n.value}" to type: ${t.type}`);
        } else if (e.type === "CallExpression") {
          let n = e;
          if (n.callee.type !== "Identifier")
            throw new Error(`Unknown filter: ${n.callee.type}`);
          let s = n.callee.value;
          if (s === "tojson") {
            let [, o] = this.evaluateArguments(n.args, r), i = o.get("indent") ?? new ue();
            if (!(i instanceof Y || i instanceof ue))
              throw new Error("If set, indent must be a number");
            let a = o.get("ensure_ascii") ?? new H(!1);
            if (!(a instanceof H))
              throw new Error("If set, ensure_ascii must be a boolean");
            let l = o.get("sort_keys") ?? new H(!1);
            if (!(l instanceof H))
              throw new Error("If set, sort_keys must be a boolean");
            let c = o.get("separators") ?? new ue(), u = null;
            if (c instanceof te || c instanceof I_) {
              if (c.value.length !== 2)
                throw new Error("separators must be a tuple of two strings");
              let [d, f] = c.value;
              if (!(d instanceof U) || !(f instanceof U))
                throw new Error("separators must be a tuple of two strings");
              u = [d.value, f.value];
            } else if (!(c instanceof ue))
              throw new Error("If set, separators must be a tuple of two strings");
            return new U(
              Wt(t, {
                indent: i.value,
                ensureAscii: a.value,
                sortKeys: l.value,
                separators: u
              })
            );
          } else if (s === "join") {
            let o;
            if (t instanceof U)
              o = Array.from(t.value);
            else if (t instanceof te)
              o = t.value.map((c) => c.value);
            else
              throw new Error(`Cannot apply filter "${s}" to type: ${t.type}`);
            let [i, a] = this.evaluateArguments(n.args, r), l = i.at(0) ?? a.get("separator") ?? new U("");
            if (!(l instanceof U))
              throw new Error("separator must be a string");
            return new U(o.join(l.value));
          } else if (s === "int" || s === "float") {
            let [o, i] = this.evaluateArguments(n.args, r), a = o.at(0) ?? i.get("default") ?? (s === "int" ? new Y(0) : new ne(0));
            if (t instanceof U) {
              let l = s === "int" ? parseInt(t.value, 10) : parseFloat(t.value);
              return isNaN(l) ? a : s === "int" ? new Y(l) : new ne(l);
            } else {
              if (t instanceof Y || t instanceof ne)
                return s === "int" ? new Y(Math.trunc(t.value) + 0) : new ne(t.value);
              if (t instanceof H)
                return s === "int" ? new Y(t.value ? 1 : 0) : new ne(t.value ? 1 : 0);
              throw new Error(`Cannot apply filter "${s}" to type: ${t.type}`);
            }
          } else if (s === "default") {
            let [o, i] = this.evaluateArguments(n.args, r), a = o[0] ?? new U(""), l = o[1] ?? i.get("boolean") ?? new H(!1);
            if (!(l instanceof H))
              throw new Error("`default` filter flag must be a boolean");
            return t instanceof ae || l.value && !t.__bool__().value ? a : t;
          }
          if (t instanceof te) {
            switch (s) {
              case "sort": {
                let [o, i] = this.evaluateArguments(n.args, r), a = o.at(0) ?? i.get("reverse") ?? new H(!1);
                if (!(a instanceof H))
                  throw new Error("reverse must be a boolean");
                let l = o.at(1) ?? i.get("case_sensitive") ?? new H(!1);
                if (!(l instanceof H))
                  throw new Error("case_sensitive must be a boolean");
                let c = o.at(2) ?? i.get("attribute") ?? new ue();
                if (!(c instanceof U || c instanceof Y || c instanceof ue))
                  throw new Error("attribute must be a string, integer, or null");
                let u = (d) => {
                  if (c instanceof ue)
                    return d;
                  let f = c instanceof Y ? String(c.value) : c.value;
                  return O_(d, f);
                };
                return new te(
                  t.value.slice().sort((d, f) => {
                    let h = u(d), p = u(f), m = Dc(h, p, l.value);
                    return a.value ? -m : m;
                  })
                );
              }
              case "selectattr":
              case "rejectattr": {
                let o = s === "selectattr";
                if (t.value.some((d) => !Ao(d)))
                  throw new Error(`\`${s}\` can only be applied to array of objects`);
                if (n.args.some((d) => d.type !== "StringLiteral"))
                  throw new Error(`arguments of \`${s}\` must be strings`);
                let [i, a, l] = n.args.map((d) => this.evaluate(d, r)), c;
                if (a) {
                  let d = r.tests.get(a.value);
                  if (!d)
                    throw new Error(`Unknown test: ${a.value}`);
                  c = d;
                } else
                  c = (...d) => d[0].__bool__().value;
                let u = t.value.filter((d) => {
                  let f = d.value.get(i.value), h = f ? c(f, l) : !1;
                  return o ? h : !h;
                });
                return new te(u);
              }
              case "map": {
                let [, o] = this.evaluateArguments(n.args, r);
                if (o.has("attribute")) {
                  let i = o.get("attribute");
                  if (!(i instanceof U))
                    throw new Error("attribute must be a string");
                  let a = o.get("default"), l = t.value.map((c) => {
                    if (!Ao(c))
                      throw new Error("items in map must be an object");
                    let u = O_(c, i.value);
                    return u instanceof ae ? a ?? new ae() : u;
                  });
                  return new te(l);
                } else
                  throw new Error("`map` expressions without `attribute` set are not currently supported.");
              }
            }
            throw new Error(`Unknown ArrayValue filter: ${s}`);
          } else if (t instanceof U) {
            switch (s) {
              case "indent": {
                let [o, i] = this.evaluateArguments(n.args, r), a = o.at(0) ?? i.get("width") ?? new Y(4);
                if (!(a instanceof Y || a instanceof U))
                  throw new Error("width must be an integer or a string");
                let l = o.at(1) ?? i.get("first") ?? new H(!1), c = o.at(2) ?? i.get("blank") ?? new H(!1), u = t.value.split(`
`), d = a instanceof U ? a.value : " ".repeat(Math.max(0, a.value)), f = u.map(
                  (h, p) => !l.value && p === 0 || !c.value && h.length === 0 ? h : d + h
                );
                return new U(f.join(`
`));
              }
              case "replace": {
                let o = t.builtins.get("replace");
                if (!(o instanceof fe))
                  throw new Error("replace filter not available");
                let [i, a] = this.evaluateArguments(n.args, r);
                return o.value([...i, new rn(a)], r);
              }
            }
            throw new Error(`Unknown StringValue filter: ${s}`);
          } else if (t instanceof Oe) {
            let o = t.builtins.get(s);
            if (o && o instanceof fe)
              return o.value(this.evaluateCallArguments(n.args, r), r);
            throw new Error(`Unknown ObjectValue filter: ${s}`);
          } else
            throw new Error(`Cannot apply filter "${s}" to type: ${t.type}`);
        }
        throw new Error(`Unknown filter: ${e.type}`);
      }
      /**
       * Evaluates expressions following the filter operation type.
       */
      evaluateFilterExpression(t, e) {
        let r = this.evaluate(t.operand, e);
        return this.applyFilter(r, t.filter, e);
      }
      /**
       * Evaluates expressions following the test operation type.
       */
      evaluateTestExpression(t, e) {
        let r = this.evaluate(t.operand, e), n = e.tests.get(t.test.value);
        if (!n)
          throw new Error(`Unknown test: ${t.test.value}`);
        let s = n(r);
        return new H(t.negate ? !s : s);
      }
      /**
       * Evaluates expressions following the select operation type.
       */
      evaluateSelectExpression(t, e) {
        return this.evaluate(t.test, e).__bool__().value ? this.evaluate(t.lhs, e) : new ae();
      }
      /**
       * Evaluates expressions following the unary operation type.
       */
      evaluateUnaryExpression(t, e) {
        let r = this.evaluate(t.argument, e);
        switch (t.operator.value) {
          case "not":
            return new H(!r.__bool__().value);
          case "+":
          case "-": {
            let n = t.operator.value === "-" ? -1 : 1;
            if (r instanceof Y || r instanceof ne || r instanceof H) {
              let s = r instanceof H ? r.value ? 1 : 0 : r.value, o = n * s;
              return r instanceof ne ? new ne(o) : new Y(o);
            }
            throw new SyntaxError(`Unknown operator "${t.operator.value}" for ${r.type}`);
          }
          default:
            throw new SyntaxError(`Unknown operator: ${t.operator.value}`);
        }
      }
      evaluateTernaryExpression(t, e) {
        return this.evaluate(t.condition, e).__bool__().value ? this.evaluate(t.trueExpr, e) : this.evaluate(t.falseExpr, e);
      }
      evalProgram(t, e) {
        return this.evaluateBlock(t.body, e);
      }
      evaluateBlock(t, e) {
        return new U(this.renderBlock(t, e));
      }
      /**
       * Jinja templates always evaluate to a String, so we accumulate the result of each statement into a final string.
       */
      renderBlock(t, e) {
        let r = "";
        for (let n = 0; n < t.length; ++n) {
          let s = t[n];
          switch (s.type) {
            case "StringLiteral":
              r += s.value;
              break;
            case "If":
              r += this.renderIf(s, e);
              break;
            case "For":
              r += this.renderFor(s, e);
              break;
            case "Set":
              this.executeSet(s, e);
              break;
            case "Comment":
              break;
            default: {
              let o = this.evaluate(s, e);
              o.type !== "NullValue" && o.type !== "UndefinedValue" && (r += o.toString());
            }
          }
        }
        return r;
      }
      evaluateIdentifier(t, e) {
        return e.lookupVariable(t.value);
      }
      evaluateCallExpression(t, e) {
        let r = this.evaluateCallArguments(t.args, e), n = this.evaluate(t.callee, e);
        if (n.type !== "FunctionValue")
          throw new Error(`Cannot call something that is not a function: got ${n.type}`);
        return n.value(r, e);
      }
      evaluateSliceExpression(t, e, r) {
        if (!(t instanceof te || t instanceof U))
          throw new Error("Slice object must be an array or string");
        let n = this.evaluate(e.start, r), s = this.evaluate(e.stop, r), o = this.evaluate(e.step, r);
        if (!(n instanceof Y || n instanceof ae))
          throw new Error("Slice start must be numeric or undefined");
        if (!(s instanceof Y || s instanceof ae))
          throw new Error("Slice stop must be numeric or undefined");
        if (!(o instanceof Y || o instanceof ae))
          throw new Error("Slice step must be numeric or undefined");
        return t instanceof te ? new te(A_(t.value, n.value, s.value, o.value)) : new U(A_(Array.from(t.value), n.value, s.value, o.value).join(""));
      }
      evaluateMemberExpression(t, e) {
        let r = this.evaluate(t.object, e), n;
        if (t.computed) {
          if (t.property.type === "SliceExpression")
            return this.evaluateSliceExpression(r, t.property, e);
          n = this.evaluate(t.property, e);
        } else t.property.type === "IntegerLiteral" ? n = new Y(t.property.value) : n = new U(t.property.value);
        let s;
        if (Ao(r)) {
          if (!(n instanceof U))
            throw new Error(`Cannot access property with non-string: got ${n.type}`);
          s = r.value.get(n.value) ?? (r instanceof Oe ? r.builtins.get(n.value) : void 0);
        } else if (r instanceof te || r instanceof U)
          if (n instanceof Y)
            if (r instanceof U) {
              let o = r.value.at(n.value);
              s = o === void 0 ? void 0 : new U(o);
            } else
              s = r.value.at(n.value);
          else if (n instanceof U)
            s = r.builtins.get(n.value);
          else
            throw new Error(`Cannot access property with non-string/non-number: got ${n.type}`);
        else {
          if (!(n instanceof U))
            throw new Error(`Cannot access property with non-string: got ${n.type}`);
          s = r.builtins.get(n.value);
        }
        return s instanceof ut ? s : new ae();
      }
      executeSet(t, e) {
        let r = t.value ? this.evaluate(t.value, e) : this.evaluateBlock(t.body, e);
        if (t.assignee.type === "Identifier") {
          let n = t.assignee.value;
          e.setVariable(n, r);
        } else if (t.assignee.type === "TupleLiteral") {
          let n = t.assignee;
          if (!(r instanceof te))
            throw new Error(`Cannot unpack non-iterable type in set: ${r.type}`);
          let s = r.value;
          if (s.length !== n.value.length)
            throw new Error(`Too ${n.value.length > s.length ? "few" : "many"} items to unpack in set`);
          for (let o = 0; o < n.value.length; ++o) {
            let i = n.value[o];
            if (i.type !== "Identifier")
              throw new Error(`Cannot unpack to non-identifier in set: ${i.type}`);
            e.setVariable(i.value, s[o]);
          }
        } else if (t.assignee.type === "MemberExpression") {
          let n = t.assignee, s = this.evaluate(n.object, e);
          if (!(s instanceof Bc))
            throw new Error("cannot assign attribute on non-namespace object");
          if (n.property.type !== "Identifier")
            throw new Error("Cannot assign to member with non-identifier property");
          s.value.set(n.property.value, r);
        } else
          throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(t.assignee)}`);
      }
      renderIf(t, e) {
        let r = this.evaluate(t.test, e);
        return this.renderBlock(r.__bool__().value ? t.body : t.alternate, e);
      }
      /**
       * Assign the current item of a for loop to its loop variable(s).
       */
      bindLoopVariable(t, e, r) {
        if (t.type === "Identifier")
          r.setVariable(t.value, e);
        else {
          let n = t.value, s = e.value;
          for (let o = 0; o < n.length; ++o) {
            if (n[o].type !== "Identifier")
              throw new Error(`Cannot unpack non-identifier type: ${n[o].type}`);
            r.setVariable(n[o].value, s[o]);
          }
        }
      }
      renderFor(t, e) {
        let r = new Ct(e), n, s;
        if (t.iterable.type === "SelectExpression") {
          let u = t.iterable;
          s = this.evaluate(u.lhs, r), n = u.test;
        } else
          s = this.evaluate(t.iterable, r);
        if (!(s instanceof te || s instanceof Oe))
          throw new Error(`Expected iterable or object type in for loop: got ${s.type}`);
        s instanceof Oe && (s = s.keys());
        let o = t.loopvar, i = s.value, a;
        if (o.type === "Identifier" && !n)
          a = i.slice();
        else {
          a = [];
          for (let u = 0; u < i.length; ++u) {
            let d = i[u];
            if (o.type === "TupleLiteral") {
              if (d.type !== "ArrayValue")
                throw new Error(`Cannot unpack non-iterable type: ${d.type}`);
              let f = o.value.length, h = d.value.length;
              if (f !== h)
                throw new Error(`Too ${f > h ? "few" : "many"} items to unpack`);
            } else if (o.type !== "Identifier")
              throw new Error(`Invalid loop variable(s): ${o.type}`);
            if (n) {
              let f = new Ct(r);
              if (this.bindLoopVariable(o, d, f), !this.evaluate(n, f).__bool__().value)
                continue;
            }
            a.push(d);
          }
        }
        let l = "", c = !0;
        for (let u = 0; u < a.length; ++u) {
          r.setVariable(
            "loop",
            new N_(
              u,
              a.length,
              u > 0 ? a[u - 1] : void 0,
              u < a.length - 1 ? a[u + 1] : void 0
            )
          ), this.bindLoopVariable(o, a[u], r);
          try {
            l += this.renderBlock(t.body, r);
          } catch (d) {
            if (d instanceof S_)
              continue;
            if (d instanceof T_)
              break;
            throw d;
          }
          c = !1;
        }
        return c && (l += this.renderBlock(t.defaultBlock, r)), l;
      }
      /**
       * Bind every parameter name and special argument before evaluating defaults,
       * preventing unbound parameters from resolving in an outer scope.
       */
      bindMacroArguments(t, e, r, n, s) {
        let o = n.slice(), i = /* @__PURE__ */ new Map();
        o.at(-1) instanceof rn && (i = new Map(o.pop().value));
        let a = [];
        for (let l = 0; l < e.length; ++l) {
          let { name: c, defaultValue: u } = zc(e[l]), d = o[l];
          d === void 0 && i.has(c) && (d = i.get(c), i.delete(c)), d === void 0 && u !== void 0 && a.push([c, u]), s.setVariable(c, d ?? new ae());
        }
        if (r.has("kwargs"))
          s.setVariable("kwargs", new Oe(i));
        else if (i.size > 0)
          throw new Error(`macro ${t} takes no keyword argument '${i.keys().next().value}'`);
        if (r.has("varargs"))
          s.setVariable("varargs", new te(o.slice(e.length)));
        else if (o.length > e.length)
          throw new Error(`macro ${t} takes not more than ${e.length} argument(s)`);
        for (let [l, c] of a)
          s.setVariable(l, this.evaluate(c, s));
      }
      /**
       * See https://jinja.palletsprojects.com/en/3.1.x/templates/#macros for more information.
       */
      evaluateMacro(t, e) {
        let r = R_(t);
        return e.setVariable(
          t.name.value,
          new fe((n, s) => {
            let o = e;
            if (r.has("caller")) {
              let a = s[M_] ? s.variables.get("caller") : void 0;
              o = new Ct(e), o.setVariable("caller", a ?? new ae());
            }
            let i = new Ct(o);
            return this.bindMacroArguments(`'${t.name.value}'`, t.args, r, n, i), this.evaluateBlock(t.body, i);
          })
        ), new ue();
      }
      evaluateCallStatement(t, e) {
        let r = t.callerArgs ?? [], n = R_(t), s = new fe((c) => {
          let u = new Ct(e);
          return this.bindMacroArguments("None", r, n, c, u), this.evaluateBlock(t.body, u);
        }), [o, i] = this.evaluateArguments(t.call.args, e);
        o.push(new rn(i));
        let a = this.evaluate(t.call.callee, e);
        if (a.type !== "FunctionValue")
          throw new Error(`Cannot call something that is not a function: got ${a.type}`);
        let l = new Ct(e);
        return l[M_] = !0, l.setVariable("caller", s), a.value(o, l);
      }
      evaluateFilterStatement(t, e) {
        let r = this.evaluateBlock(t.body, e);
        return this.applyFilter(r, t.filter, e);
      }
      evaluate(t, e) {
        if (!t)
          return new ae();
        switch (t.type) {
          case "Identifier":
            return this.evaluateIdentifier(t, e);
          case "IntegerLiteral":
            return new Y(t.value);
          case "BinaryExpression":
            return this.evaluateBinaryExpression(t, e);
          case "StringLiteral":
            return new U(t.value);
          case "MemberExpression":
            return this.evaluateMemberExpression(t, e);
          case "CallExpression":
            return this.evaluateCallExpression(t, e);
          case "FilterExpression":
            return this.evaluateFilterExpression(t, e);
          case "TestExpression":
            return this.evaluateTestExpression(t, e);
          case "Ternary":
            return this.evaluateTernaryExpression(t, e);
          case "UnaryExpression":
            return this.evaluateUnaryExpression(t, e);
          case "FloatLiteral":
            return new ne(t.value);
          case "ArrayLiteral":
            return new te(t.value.map((r) => this.evaluate(r, e)));
          case "TupleLiteral":
            return new I_(t.value.map((r) => this.evaluate(r, e)));
          case "ObjectLiteral": {
            let r = /* @__PURE__ */ new Map();
            for (let [n, s] of t.value) {
              let o = this.evaluate(n, e);
              if (!(o instanceof U))
                throw new Error(`Object keys must be strings: got ${o.type}`);
              r.set(o.value, this.evaluate(s, e));
            }
            return new Oe(r);
          }
          case "SelectExpression":
            return this.evaluateSelectExpression(t, e);
          case "If":
            return new U(this.renderIf(t, e));
          case "Set":
            return this.executeSet(t, e), new ue();
          case "For":
            return new U(this.renderFor(t, e));
          case "Macro":
            return this.evaluateMacro(t, e);
          case "CallStatement":
            return this.evaluateCallStatement(t, e);
          case "FilterStatement":
            return this.evaluateFilterStatement(t, e);
          case "Comment":
            return new ue();
          case "Break":
            throw new T_();
          case "Continue":
            throw new S_();
          case "Program":
            return this.evalProgram(t, e);
          default:
            throw new SyntaxError(`Unknown node type: ${t.type}`);
        }
      }
    };
    Ee = `
`, s1 = "{%- ", o1 = " -%}", me = Object.freeze({
      CONDITIONAL: 0,
      // a if b else c
      LOGICAL_OR: 1,
      // or
      LOGICAL_AND: 2,
      // and
      LOGICAL_NOT: 3,
      // not a
      COMPARISON: 4,
      // == != < <= > >= in, not in
      ADDITIVE: 5,
      // + -
      MULTIPLICATIVE: 6,
      // * / // %
      EXPONENTIATION: 7,
      // **
      TEST: 8,
      // is
      FILTER: 9,
      // |
      UNARY_SIGN: 10,
      // -a +a
      ATOM: 11
      // literals, identifiers, calls, member accesses
    });
    U_ = class {
      parsed;
      /**
       * @param {string} template The template string
       */
      constructor(t) {
        let e = xv(t, {
          lstrip_blocks: !0,
          trim_blocks: !0
        });
        this.parsed = Vv(e);
      }
      render(t) {
        let e = new Ct();
        if (t1(e), t)
          for (let [s, o] of Object.entries(t))
            e.set(s, o);
        return new n1(e).run(this.parsed).value;
      }
      format(t) {
        return i1(this.parsed, t?.indent || "	");
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/model_registry/get_tokenizer_files.js
  async function j_(t) {
    if (!t)
      throw new Error("modelId is required for get_tokenizer_files");
    return (await jr(t, "tokenizer_config.json", {})).exists ? ["tokenizer.json", "tokenizer_config.json"] : [];
  }
  var W_ = b(() => {
    $s();
  });

  // node_modules/@huggingface/transformers/src/tokenization_utils.js
  async function Uc(t, e) {
    let r = await j_(t);
    return await Promise.all(
      r.map((n) => Ke(t, n, !0, e))
    );
  }
  function Fc(t) {
    let e = t.dims;
    switch (e.length) {
      case 1:
        return t.tolist();
      case 2:
        if (e[0] !== 1)
          throw new Error(
            "Unable to decode tensor with `batch size !== 1`. Use `tokenizer.batch_decode(...)` for batched inputs."
          );
        return t.tolist()[0];
      default:
        throw new Error(`Expected tensor to have 1-2 dimensions, got ${e.length}.`);
    }
  }
  function m1(t, e, r, n) {
    for (let s of Object.keys(t)) {
      let o = e - t[s].length, i = r(s), a = new Array(o).fill(i);
      t[s] = n === "right" ? ht(t[s], a) : ht(a, t[s]);
    }
  }
  function _1(t, e) {
    for (let r of Object.keys(t))
      t[r].length = e;
  }
  function hr(t, ...e) {
    for (let r of e) {
      if (!Object.hasOwn(t, r)) continue;
      let n = t[r];
      if (n)
        if (typeof n == "object") {
          if (n.__type === "AddedToken")
            return n.content;
          throw Error(`Unknown token: ${n}`);
        } else
          return n;
    }
    return null;
  }
  function g1(t) {
    let e = [];
    for (let r of t.get_added_tokens_decoder().values())
      r.special && e.push(r);
    return e;
  }
  function sn(t, e, r, n) {
    if (!("language_codes" in t) || !Array.isArray(t.language_codes))
      throw new Error(
        "Tokenizer must have `language_codes` attribute set and it should be an array of language ids."
      );
    if (!("languageRegex" in t) || !(t.languageRegex instanceof RegExp))
      throw new Error("Tokenizer must have `languageRegex` attribute set and it should be a regular expression.");
    if (!("lang_to_token" in t) || typeof t.lang_to_token != "function")
      throw new Error("Tokenizer must have `lang_to_token` attribute set and it should be a function.");
    let s = n.src_lang, o = n.tgt_lang;
    if (!t.language_codes.includes(o))
      throw new Error(
        `Target language code "${o}" is not valid. Must be one of: {${t.language_codes.join(", ")}}`
      );
    if (s !== void 0) {
      if (!t.language_codes.includes(s))
        throw new Error(
          `Source language code "${s}" is not valid. Must be one of: {${t.language_codes.join(", ")}}`
        );
      let i = t._tokenizer.post_processor?.config;
      if (i && "single" in i) {
        for (let a of i.single)
          if ("SpecialToken" in a && t.languageRegex.test(a.SpecialToken.id)) {
            a.SpecialToken.id = t.lang_to_token(s);
            break;
          }
      }
    }
    return n.forced_bos_token_id = t._tokenizer.token_to_id(t.lang_to_token(o)), t._call(e, r);
  }
  var p1, R, X = b(() => {
    Rc();
    F_();
    ft();
    st();
    mt();
    ar();
    we();
    Me();
    W_();
    p1 = [
      "bos_token",
      "eos_token",
      "unk_token",
      "sep_token",
      "pad_token",
      "cls_token",
      "mask_token"
      // additional_special_tokens (TODO)
    ];
    R = class extends /** @type {new (tokenizerJSON: Object, tokenizerConfig: Object) => PreTrainedTokenizerCallback} */
    ye {
      return_token_type_ids = !1;
      padding_side = "right";
      /**
       * Create a new PreTrainedTokenizer instance.
       * @param {Object} tokenizerJSON The JSON of the tokenizer.
       * @param {Object} tokenizerConfig The config of the tokenizer.
       */
      constructor(e, r) {
        if (super(), this._tokenizerJSON = e, this._tokenizerConfig = r, this._tokenizer = new y_(e, r), this.config = r, this.padding_side = r.padding_side ?? this.padding_side, this.mask_token = hr(r, "mask_token"), this.mask_token_id = this._tokenizer.token_to_id(this.mask_token), this.pad_token = hr(r, "pad_token", "eos_token"), this.pad_token_id = this._tokenizer.token_to_id(this.pad_token), this.sep_token = hr(r, "sep_token"), this.sep_token_id = this._tokenizer.token_to_id(this.sep_token), this.unk_token = hr(r, "unk_token"), this.unk_token_id = this._tokenizer.token_to_id(this.unk_token), this.bos_token = hr(r, "bos_token"), this.bos_token_id = this._tokenizer.token_to_id(this.bos_token), this.eos_token = hr(r, "eos_token"), this.eos_token_id = this._tokenizer.token_to_id(this.eos_token), this.chat_template = r.chat_template ?? null, Array.isArray(this.chat_template)) {
          let s = /* @__PURE__ */ Object.create(null);
          for (let { name: o, template: i } of this.chat_template) {
            if (typeof o != "string" || typeof i != "string")
              throw new Error('Chat template must be a list of objects with "name" and "template" properties');
            s[o] = i;
          }
          this.chat_template = s;
        }
        this._compiled_template_cache = /* @__PURE__ */ new Map();
        let n = g1(this._tokenizer);
        this.all_special_ids = n.map((s) => s.id), this.all_special_tokens = n.map((s) => s.content);
      }
      /**
       * Loads a pretrained tokenizer from the given `pretrained_model_name_or_path`.
       *
       * @param {string} pretrained_model_name_or_path The path to the pretrained tokenizer.
       * @param {PretrainedTokenizerOptions} options Additional options for loading the tokenizer.
       *
       * @throws {Error} Throws an error if the tokenizer.json or tokenizer_config.json files are not found in the `pretrained_model_name_or_path`.
       * @returns {Promise<PreTrainedTokenizer>} A new instance of the `PreTrainedTokenizer` class.
       */
      static async from_pretrained(e, { progress_callback: r = null, config: n = null, cache_dir: s = null, local_files_only: o = !1, revision: i = "main" } = {}) {
        let a = await Uc(e, {
          progress_callback: r,
          config: n,
          cache_dir: s,
          local_files_only: o,
          revision: i
        });
        return new this(...a);
      }
      get_vocab() {
        return this._tokenizer.get_vocab();
      }
      get model_max_length() {
        return this._tokenizerConfig.model_max_length ?? 1 / 0;
      }
      get add_eos_token() {
        return this._tokenizerConfig.add_eos_token;
      }
      get add_bos_token() {
        return this._tokenizerConfig.add_bos_token;
      }
      /**
       * Converts a token string (or a sequence of tokens) into a single integer id (or a sequence of ids), using the vocabulary.
       *
       * @template {string|string[]} T
       * @param {T} tokens One or several token(s) to convert to token id(s).
       * @returns {T extends string ? number : number[]} The token id or list of token ids.
       */
      convert_tokens_to_ids(e) {
        return typeof e == "string" ? (
          /** @type {any} */
          this._tokenizer.token_to_id(e)
        ) : (
          /** @type {any} */
          e.map((r) => this._tokenizer.token_to_id(r))
        );
      }
      /**
       * Encode/tokenize the given text(s).
       * @template {string|string[]} TText
       * @template {boolean} [TReturnTensor=true]
       * @param {TText} text The text to tokenize.
       * @param {TokenizerCallOptions<TText, TReturnTensor>} [options] Additional tokenization options.
       * @returns {BatchEncoding<BatchEncodingItem<TText, TReturnTensor>>} Object to be passed to the model.
       */
      _call(e, r = {}) {
        let { text_pair: n = null, add_special_tokens: s = !0, padding: o = !1, return_token_type_ids: i = null } = r, { truncation: a = null, max_length: l = null } = r, c = (
          /** @type {TReturnTensor} */
          r.return_tensor ?? !0
        ), u = Array.isArray(e), d;
        if (u) {
          if (e.length === 0)
            throw Error("text array must be non-empty");
          if (n !== null) {
            if (Array.isArray(n)) {
              if (e.length !== n.length)
                throw Error("text and text_pair must have the same length");
            } else throw Error("text_pair must also be an array");
            d = e.map(
              (h, p) => this._encode_plus(h, { text_pair: n[p], add_special_tokens: s, return_token_type_ids: i })
            );
          } else
            d = e.map((h) => this._encode_plus(h, { add_special_tokens: s, return_token_type_ids: i }));
        } else {
          if (e == null)
            throw Error("text may not be null or undefined");
          if (Array.isArray(n))
            throw Error(
              "When specifying `text_pair`, since `text` is a string, `text_pair` must also be a string (i.e., not an array)."
            );
          d = [this._encode_plus(e, { text_pair: n, add_special_tokens: s, return_token_type_ids: i })];
        }
        if (l === null ? l = this.model_max_length : a === null && (o === !0 ? (Q.warn(
          "`max_length` is ignored when `padding: true` and there is no truncation strategy. To pad to max length, use `padding: 'max_length'`."
        ), l = this.model_max_length) : o === !1 && (Q.warn(
          "Truncation was not explicitly activated but `max_length` is provided a specific value, please use `truncation: true` to explicitly truncate examples to max length."
        ), a = !0)), o === !0 && (l = Math.min(Fe(d.map((h) => h.input_ids.length))[0], l ?? 1 / 0)), l = Math.min(l, this.model_max_length ?? 1 / 0), o || a)
          for (let h = 0; h < d.length; ++h)
            d[h].input_ids.length !== l && (d[h].input_ids.length > l ? a && _1(d[h], l) : o && m1(
              d[h],
              l,
              (p) => p === "input_ids" ? this.pad_token_id : 0,
              this.padding_side
            ));
        let f = {};
        if (c) {
          if (!(o && a) && d.some((p) => {
            for (let m of Object.keys(p))
              if (p[m].length !== d[0][m]?.length)
                return !0;
            return !1;
          }))
            throw Error(
              "Unable to create tensor, you should probably activate truncation and/or padding with 'padding=true' and 'truncation=true' to have batched tensors with the same length."
            );
          let h = [d.length, d[0].input_ids.length];
          for (let p of Object.keys(d[0]))
            f[p] = new W(
              "int64",
              BigInt64Array.from(d.flatMap((m) => m[p]).map(BigInt)),
              h
            );
        } else {
          for (let h of Object.keys(d[0]))
            f[h] = d.map((p) => p[h]);
          if (!u)
            for (let h of Object.keys(f))
              f[h] = f[h][0];
        }
        return (
          /** @type {BatchEncoding<BatchEncodingItem<TText, TReturnTensor>>} */
          f
        );
      }
      /**
       * Encodes a single text using the preprocessor pipeline of the tokenizer.
       *
       * @param {string|null} text The text to encode.
       * @returns {string[]|null} The encoded tokens.
       */
      _encode_text(e) {
        return e === null ? null : this._tokenizer.encode(e).tokens;
      }
      /**
       * Encodes a single text or a pair of texts using the model's tokenizer.
       *
       * @param {string} text The text to encode.
       * @param {Object} options An optional object containing the following properties:
       * @param {string|null} [options.text_pair=null] The optional second text to encode.
       * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
       * @param {boolean|null} [options.return_token_type_ids=null] Whether to return token_type_ids.
       * @returns {{input_ids: number[], attention_mask: number[], token_type_ids?: number[]}} An object containing the encoded text.
       * @private
       */
      _encode_plus(e, { text_pair: r = null, add_special_tokens: n = !0, return_token_type_ids: s = null } = {}) {
        let { ids: o, attention_mask: i, token_type_ids: a } = this._tokenizer.encode(e, {
          text_pair: r,
          add_special_tokens: n,
          return_token_type_ids: s ?? this.return_token_type_ids
        });
        return {
          input_ids: o,
          attention_mask: i,
          ...a ? { token_type_ids: a } : {}
        };
      }
      /**
       * Converts a string into a sequence of tokens.
       * @param {string} text The sequence to be encoded.
       * @param {Object} options An optional object containing the following properties:
       * @param {string|null} [options.pair] A second sequence to be encoded with the first.
       * @param {boolean} [options.add_special_tokens=false] Whether or not to add the special tokens associated with the corresponding model.
       * @returns {string[]} The list of tokens.
       */
      tokenize(e, { pair: r = null, add_special_tokens: n = !1 } = {}) {
        return this._tokenizer.tokenize(e, { text_pair: r, add_special_tokens: n });
      }
      /**
       * Encodes a single text or a pair of texts using the model's tokenizer.
       *
       * @param {string} text The text to encode.
       * @param {Object} options An optional object containing the following properties:
       * @param {string|null} [options.text_pair=null] The optional second text to encode.
       * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
       * @param {boolean|null} [options.return_token_type_ids=null] Whether to return token_type_ids.
       * @returns {number[]} An array of token IDs representing the encoded text(s).
       */
      encode(e, { text_pair: r = null, add_special_tokens: n = !0, return_token_type_ids: s = null } = {}) {
        return this._tokenizer.encode(e, {
          text_pair: r,
          add_special_tokens: n,
          return_token_type_ids: s
        }).ids;
      }
      /**
       * Decode a batch of tokenized sequences.
       * @param {number[][]|Tensor} batch List/Tensor of tokenized input sequences.
       * @param {Object} decode_args (Optional) Object with decoding arguments.
       * @returns {string[]} List of decoded sequences.
       */
      batch_decode(e, r = {}) {
        return e instanceof W && (e = e.tolist()), e.map((n) => this.decode(n, r));
      }
      /**
       * Decodes a sequence of token IDs back to a string.
       *
       * @param {number[]|bigint[]|Tensor} token_ids List/Tensor of token IDs to decode.
       * @param {Object} [decode_args={}]
       * @param {boolean} [decode_args.skip_special_tokens=false] If true, special tokens are removed from the output string.
       * @param {boolean} [decode_args.clean_up_tokenization_spaces=true] If true, spaces before punctuation and abbreviated forms are removed.
       *
       * @returns {string} The decoded string.
       * @throws {Error} If `token_ids` is not a non-empty array of integers.
       */
      decode(e, r = {}) {
        if (e instanceof W && (e = Fc(e)), !Array.isArray(e) || e.length === 0 || !Ih(e[0]))
          throw Error("token_ids must be a non-empty array of integers.");
        return this.decode_single(e, r);
      }
      /**
       * Decode a single list of token ids to a string.
       * @param {number[]|bigint[]} token_ids List of token ids to decode
       * @param {Object} decode_args Optional arguments for decoding
       * @param {boolean} [decode_args.skip_special_tokens=false] Whether to skip special tokens during decoding
       * @param {boolean|null} [decode_args.clean_up_tokenization_spaces=null] Whether to clean up tokenization spaces during decoding.
       * If null, the value is set to `this.decoder.cleanup` if it exists, falling back to `this.clean_up_tokenization_spaces` if it exists, falling back to `true`.
       * @returns {string} The decoded string
       */
      decode_single(e, { skip_special_tokens: r = !1, clean_up_tokenization_spaces: n = null }) {
        return this._tokenizer.decode(e, {
          skip_special_tokens: r,
          clean_up_tokenization_spaces: n
        });
      }
      /**
       * Retrieve the chat template string used for tokenizing chat messages. This template is used
       * internally by the `apply_chat_template` method and can also be used externally to retrieve the model's chat
       * template for better generation tracking.
       *
       * @param {Object} options An optional object containing the following properties:
       * @param {string|null} [options.chat_template=null]
       * A Jinja template or the name of a template to use for this conversion.
       * It is usually not necessary to pass anything to this argument,
       * as the model's template will be used by default.
       * @param {Object[]} [options.tools=null]
       * A list of tools (callable functions) that will be accessible to the model. If the template does not
       * support function calling, this argument will have no effect. Each tool should be passed as a JSON Schema,
       * giving the name, description and argument types for the tool. See our
       * [chat templating guide](https://huggingface.co/docs/transformers/main/en/chat_templating#automated-function-conversion-for-tool-use)
       * for more information.
       * @returns {string} The chat template string.
       */
      get_chat_template({ chat_template: e = null, tools: r = null } = {}) {
        if (this.chat_template && typeof this.chat_template == "object") {
          let n = this.chat_template;
          if (e !== null && Object.hasOwn(n, e))
            e = n[e];
          else if (e === null)
            if (r !== null && "tool_use" in n)
              e = n.tool_use;
            else if ("default" in n)
              e = n.default;
            else
              throw Error(
                `This model has multiple chat templates with no default specified! Please either pass a chat template or the name of the template you wish to use to the 'chat_template' argument. Available template names are ${Object.keys(n).sort()}.`
              );
        } else if (e === null)
          if (this.chat_template)
            e = this.chat_template;
          else
            throw Error(
              "Cannot use apply_chat_template() because tokenizer.chat_template is not set and no template argument was passed! For information about writing templates and setting the tokenizer.chat_template attribute, please see the documentation at https://huggingface.co/docs/transformers/main/en/chat_templating"
            );
        return e;
      }
      /**
       * Converts a list of message objects with `"role"` and `"content"` keys to a list of token
       * ids. This method is intended for use with chat models, and will read the tokenizer's chat_template attribute to
       * determine the format and control tokens to use when converting.
       *
       * See the [chat templating guide](https://huggingface.co/docs/transformers/chat_templating) for more information.
       *
       * **Example:** Applying a chat template to a conversation.
       *
       * ```javascript
       * import { AutoTokenizer } from "@huggingface/transformers";
       *
       * const tokenizer = await AutoTokenizer.from_pretrained("Xenova/mistral-tokenizer-v1");
       *
       * const chat = [
       *   { "role": "user", "content": "Hello, how are you?" },
       *   { "role": "assistant", "content": "I'm doing great. How can I help you today?" },
       *   { "role": "user", "content": "I'd like to show off how chat templating works!" },
       * ]
       *
       * const text = tokenizer.apply_chat_template(chat, { tokenize: false });
       * // "<s>[INST] Hello, how are you? [/INST]I'm doing great. How can I help you today?</s> [INST] I'd like to show off how chat templating works! [/INST]"
       *
       * const input_ids = tokenizer.apply_chat_template(chat, { tokenize: true, return_tensor: false });
       * // [1, 733, 16289, 28793, 22557, 28725, 910, 460, 368, 28804, 733, 28748, 16289, 28793, 28737, 28742, 28719, 2548, 1598, 28723, 1602, 541, 315, 1316, 368, 3154, 28804, 2, 28705, 733, 16289, 28793, 315, 28742, 28715, 737, 298, 1347, 805, 910, 10706, 5752, 1077, 3791, 28808, 733, 28748, 16289, 28793]
       * ```
       *
       * @param {Message[]} conversation A list of message objects with `"role"` and `"content"` keys,
       * representing the chat history so far.
       * @template {boolean} [TTokenize=true]
       * @template {boolean} [TReturnTensor=true]
       * @template {boolean} [TReturnDict=true]
       * @param {ApplyChatTemplateOptions<TTokenize, TReturnTensor, TReturnDict>} [options] Options controlling
       * template rendering and tokenization.
       * @returns {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} The tokenized output.
       */
      apply_chat_template(e, r = (
        /** @type {ApplyChatTemplateOptions<TTokenize, TReturnTensor, TReturnDict>} */
        {}
      )) {
        let {
          tools: n = null,
          documents: s = null,
          chat_template: o = null,
          add_generation_prompt: i = !1,
          tokenize: a = (
            /** @type {TTokenize} */
            !0
          ),
          padding: l = !1,
          truncation: c = !1,
          max_length: u = null,
          return_tensor: d = (
            /** @type {TReturnTensor} */
            !0
          ),
          return_dict: f = (
            /** @type {TReturnDict} */
            !0
          ),
          tokenizer_kwargs: h = {},
          ...p
        } = r;
        if (o = this.get_chat_template({ chat_template: o, tools: n }), typeof o != "string")
          throw Error(`chat_template must be a string, but got ${typeof o}`);
        let m = this._compiled_template_cache.get(o);
        m === void 0 && (m = new U_(o), this._compiled_template_cache.set(o, m));
        let _ = /* @__PURE__ */ Object.create(null);
        for (let w of p1) {
          let y = hr(this.config, w);
          y && (_[w] = y);
        }
        let g = m.render({
          messages: e,
          add_generation_prompt: i,
          tools: n,
          documents: s,
          ..._,
          ...p
        });
        if (a) {
          let w = this._call(g, {
            add_special_tokens: !1,
            padding: l,
            truncation: c,
            max_length: u,
            return_tensor: d,
            ...h
          });
          return (
            /** @type {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} */
            f ? w : w.input_ids
          );
        }
        return (
          /** @type {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} */
          g
        );
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/albert/tokenization_albert.js
  var jc, V_ = b(() => {
    X();
    jc = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/bart/tokenization_bart.js
  var Wc, G_ = b(() => {
    X();
    Wc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/bert/tokenization_bert.js
  var Vc, q_ = b(() => {
    X();
    Vc = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/blenderbot_small/tokenization_blenderbot_small.js
  var Gc, H_ = b(() => {
    X();
    Gc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/blenderbot/tokenization_blenderbot.js
  var qc, Y_ = b(() => {
    X();
    qc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/bloom/tokenization_bloom.js
  var Hc, X_ = b(() => {
    X();
    Hc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/camembert/tokenization_camembert.js
  var Yc, K_ = b(() => {
    X();
    Yc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/clip/tokenization_clip.js
  var Xc, J_ = b(() => {
    X();
    Xc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/code_llama/tokenization_code_llama.js
  var Kc, Z_ = b(() => {
    X();
    Kc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/codegen/tokenization_codegen.js
  var Jc, Q_ = b(() => {
    X();
    Jc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/cohere/tokenization_cohere.js
  var Zc, eg = b(() => {
    X();
    Zc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/cohere_asr/tokenization_cohere_asr.js
  var Qc, tg = b(() => {
    X();
    Qc = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/convbert/tokenization_convbert.js
  var eu, rg = b(() => {
    X();
    eu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/deberta_v2/tokenization_deberta_v2.js
  var tu, ng = b(() => {
    X();
    tu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/deberta/tokenization_deberta.js
  var ru, sg = b(() => {
    X();
    ru = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/distilbert/tokenization_distilbert.js
  var nu, og = b(() => {
    X();
    nu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/electra/tokenization_electra.js
  var su, ig = b(() => {
    X();
    su = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/esm/tokenization_esm.js
  var ou, ag = b(() => {
    X();
    ou = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/falcon/tokenization_falcon.js
  var iu, lg = b(() => {
    X();
    iu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/gemma/tokenization_gemma.js
  var au, cg = b(() => {
    X();
    au = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/gpt_neox/tokenization_gpt_neox.js
  var lu, ug = b(() => {
    X();
    lu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/gpt2/tokenization_gpt2.js
  var cu, dg = b(() => {
    X();
    cu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/herbert/tokenization_herbert.js
  var uu, fg = b(() => {
    X();
    uu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/llama/tokenization_llama.js
  var du, hg = b(() => {
    X();
    du = class extends R {
      padding_side = "left";
    };
  });

  // node_modules/@huggingface/transformers/src/models/m2m_100/tokenization_m2m_100.js
  var fu, pg = b(() => {
    X();
    fu = class extends R {
      constructor(e, r) {
        super(e, r), this.languageRegex = /^__[a-z]{2,3}__$/, this.language_codes = this.all_special_tokens.filter((n) => this.languageRegex.test(n)).map((n) => n.slice(2, -2)), this.lang_to_token = (n) => `__${n}__`;
      }
      /**
       * Helper function to build translation inputs for an `M2M100Tokenizer`.
       * @param {string|string[]} raw_inputs The text to tokenize.
       * @param {Object} tokenizer_options Options to be sent to the tokenizer
       * @param {Object} generate_kwargs Generation options.
       * @returns {Object} Object to be passed to the model.
       */
      _build_translation_inputs(e, r, n) {
        return sn(this, e, r, n);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/marian/tokenization_marian.js
  var hu, mg = b(() => {
    X();
    st();
    Me();
    hu = class extends R {
      /**
       * Create a new MarianTokenizer instance.
       * @param {Object} tokenizerJSON The JSON of the tokenizer.
       * @param {Object} tokenizerConfig The config of the tokenizer.
       */
      constructor(e, r) {
        super(e, r), this.languageRegex = /^(>>\w+<<)\s*/g, this.supported_language_codes = Array.from(this.get_vocab().keys()).filter((n) => this.languageRegex.test(n)), Q.warn(
          'WARNING: `MarianTokenizer` is not yet supported by Hugging Face\'s "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.'
        );
      }
      /**
       * Encodes a single text. Overriding this method is necessary since the language codes
       * must be removed before encoding with sentencepiece model.
       * @see https://github.com/huggingface/transformers/blob/12d51db243a00726a548a43cc333390ebae731e3/src/transformers/models/marian/tokenization_marian.py#L204-L213
       *
       * @param {string|null} text The text to encode.
       * @returns {string[]|null} The encoded tokens.
       */
      _encode_text(e) {
        if (e === null) return null;
        let [r, ...n] = e.trim().split(this.languageRegex);
        if (n.length === 0)
          return super._encode_text(r);
        if (n.length === 2) {
          let [s, o] = n;
          return this.supported_language_codes.includes(s) || Q.warn(
            `Unsupported language code "${s}" detected, which may lead to unexpected behavior. Should be one of: ${JSON.stringify(this.supported_language_codes)}`
          ), ht([s], super._encode_text(o));
        }
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/mbart/tokenization_mbart.js
  var qn, pu = b(() => {
    X();
    qn = class extends R {
      constructor(e, r) {
        super(e, r), this.languageRegex = /^[a-z]{2}_[A-Z]{2}$/, this.language_codes = this.all_special_tokens.filter((n) => this.languageRegex.test(n)).map((n) => n), this.lang_to_token = (n) => n;
      }
      /**
       * Helper function to build translation inputs for an `MBartTokenizer`.
       * @param {string|string[]} raw_inputs The text to tokenize.
       * @param {Object} tokenizer_options Options to be sent to the tokenizer
       * @param {Object} generate_kwargs Generation options.
       * @returns {Object} Object to be passed to the model.
       */
      _build_translation_inputs(e, r, n) {
        return sn(this, e, r, n);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/mbart50/tokenization_mbart50.js
  var mu, _g = b(() => {
    pu();
    mu = class extends qn {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mgp_str/tokenization_mgp_str.js
  var _u, gg = b(() => {
    X();
    _u = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/mobilebert/tokenization_mobilebert.js
  var gu, wg = b(() => {
    X();
    gu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/mpnet/tokenization_mpnet.js
  var wu, yg = b(() => {
    X();
    wu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/nllb/tokenization_nllb.js
  var yu, bg = b(() => {
    X();
    yu = class extends R {
      constructor(e, r) {
        super(e, r), this.languageRegex = /^[a-z]{3}_[A-Z][a-z]{3}$/, this.language_codes = this.all_special_tokens.filter((n) => this.languageRegex.test(n)), this.lang_to_token = (n) => n;
      }
      /**
       * Helper function to build translation inputs for an `NllbTokenizer`.
       * @param {string|string[]} raw_inputs The text to tokenize.
       * @param {Object} tokenizer_options Options to be sent to the tokenizer
       * @param {Object} generate_kwargs Generation options.
       * @returns {Object} Object to be passed to the model.
       */
      _build_translation_inputs(e, r, n) {
        return sn(this, e, r, n);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/nougat/tokenization_nougat.js
  var bu, xg = b(() => {
    X();
    bu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/qwen2/tokenization_qwen2.js
  var xu, vg = b(() => {
    X();
    xu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/roberta/tokenization_roberta.js
  var vu, Eg = b(() => {
    X();
    vu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/roformer/tokenization_roformer.js
  var Eu, kg = b(() => {
    X();
    Eu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/siglip/tokenization_siglip.js
  var ku, Ag = b(() => {
    X();
    ku = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/speecht5/tokenization_speecht5.js
  var Au, Tg = b(() => {
    X();
    Au = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/squeezebert/tokenization_squeezebert.js
  var Tu, Sg = b(() => {
    X();
    Tu = class extends R {
      return_token_type_ids = !0;
    };
  });

  // node_modules/@huggingface/transformers/src/models/t5/tokenization_t5.js
  var Su, Cg = b(() => {
    X();
    Su = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/vits/tokenization_vits.js
  var Cu, Iu, Ig = b(() => {
    Rc();
    X();
    Cu = class extends Je {
      /** @type {Decoder['decode_chain']} */
      decode_chain(e) {
        let r = "";
        for (let n = 1; n < e.length; n += 2)
          r += e[n];
        return [r];
      }
    }, Iu = class extends R {
      constructor(e, r) {
        super(e, r), this._tokenizer.decoder = new Cu({ type: "VitsDecoder" });
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/wav2vec2/tokenization_wav2vec2.js
  var Mu, Mg = b(() => {
    X();
    Mu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/whisper/common_whisper.js
  var Og, Pg, KL, Lg = b(() => {
    Og = [
      ["en", "english"],
      ["zh", "chinese"],
      ["de", "german"],
      ["es", "spanish"],
      ["ru", "russian"],
      ["ko", "korean"],
      ["fr", "french"],
      ["ja", "japanese"],
      ["pt", "portuguese"],
      ["tr", "turkish"],
      ["pl", "polish"],
      ["ca", "catalan"],
      ["nl", "dutch"],
      ["ar", "arabic"],
      ["sv", "swedish"],
      ["it", "italian"],
      ["id", "indonesian"],
      ["hi", "hindi"],
      ["fi", "finnish"],
      ["vi", "vietnamese"],
      ["he", "hebrew"],
      ["uk", "ukrainian"],
      ["el", "greek"],
      ["ms", "malay"],
      ["cs", "czech"],
      ["ro", "romanian"],
      ["da", "danish"],
      ["hu", "hungarian"],
      ["ta", "tamil"],
      ["no", "norwegian"],
      ["th", "thai"],
      ["ur", "urdu"],
      ["hr", "croatian"],
      ["bg", "bulgarian"],
      ["lt", "lithuanian"],
      ["la", "latin"],
      ["mi", "maori"],
      ["ml", "malayalam"],
      ["cy", "welsh"],
      ["sk", "slovak"],
      ["te", "telugu"],
      ["fa", "persian"],
      ["lv", "latvian"],
      ["bn", "bengali"],
      ["sr", "serbian"],
      ["az", "azerbaijani"],
      ["sl", "slovenian"],
      ["kn", "kannada"],
      ["et", "estonian"],
      ["mk", "macedonian"],
      ["br", "breton"],
      ["eu", "basque"],
      ["is", "icelandic"],
      ["hy", "armenian"],
      ["ne", "nepali"],
      ["mn", "mongolian"],
      ["bs", "bosnian"],
      ["kk", "kazakh"],
      ["sq", "albanian"],
      ["sw", "swahili"],
      ["gl", "galician"],
      ["mr", "marathi"],
      ["pa", "punjabi"],
      ["si", "sinhala"],
      ["km", "khmer"],
      ["sn", "shona"],
      ["yo", "yoruba"],
      ["so", "somali"],
      ["af", "afrikaans"],
      ["oc", "occitan"],
      ["ka", "georgian"],
      ["be", "belarusian"],
      ["tg", "tajik"],
      ["sd", "sindhi"],
      ["gu", "gujarati"],
      ["am", "amharic"],
      ["yi", "yiddish"],
      ["lo", "lao"],
      ["uz", "uzbek"],
      ["fo", "faroese"],
      ["ht", "haitian creole"],
      ["ps", "pashto"],
      ["tk", "turkmen"],
      ["nn", "nynorsk"],
      ["mt", "maltese"],
      ["sa", "sanskrit"],
      ["lb", "luxembourgish"],
      ["my", "myanmar"],
      ["bo", "tibetan"],
      ["tl", "tagalog"],
      ["mg", "malagasy"],
      ["as", "assamese"],
      ["tt", "tatar"],
      ["haw", "hawaiian"],
      ["ln", "lingala"],
      ["ha", "hausa"],
      ["ba", "bashkir"],
      ["jw", "javanese"],
      ["su", "sundanese"]
    ], Pg = new Map(Og), KL = new Map([
      ...Og.map(([t, e]) => [e, t]),
      ["burmese", "my"],
      ["valencian", "ca"],
      ["flemish", "nl"],
      ["haitian", "ht"],
      ["letzeburgesch", "lb"],
      ["pushto", "ps"],
      ["panjabi", "pa"],
      ["moldavian", "ro"],
      ["moldovan", "ro"],
      ["sinhalese", "si"],
      ["castilian", "es"]
    ]);
  });

  // node_modules/@huggingface/transformers/src/models/whisper/tokenization_whisper.js
  var w1, Rg, y1, Ou, $g = b(() => {
    X();
    Lg();
    ar();
    we();
    st();
    w1 = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E", Rg = new RegExp(`^[${w1}]+$`, "gu"), y1 = 0.1, Ou = class extends R {
      get timestamp_begin() {
        return this._tokenizer.token_to_id("<|notimestamps|>") + 1;
      }
      /**
       * Decodes automatic speech recognition (ASR) sequences.
       * @param {Array<{tokens: bigint[], token_timestamps?: number[], stride: number[]}>} sequences The sequences to decode.
       * @param {Object} options The options to use for decoding.
       * @returns {Array<string|{chunks?: undefined|Array<{language: string|null, timestamp: Array<number|null>, text: string}>}>} The decoded sequences.
       */
      _decode_asr(e, { return_timestamps: r = !1, return_language: n = !1, time_precision: s = null, force_full_sequences: o = !0 } = {}) {
        if (s === null)
          throw Error("Must specify time_precision");
        let i = null, a = r === "word";
        function l() {
          return { language: i, timestamp: [null, null], text: "" };
        }
        let c = [], u = l(), d = 0, f = this.timestamp_begin, p = f + 1500, m = [], _ = [], g = !1, w = null, y = new Set(this.all_special_ids);
        for (let C of e) {
          let x = C.tokens, E = a ? C.token_timestamps : null, O = null, D = f;
          if ("stride" in C) {
            let [P, I, S] = C.stride;
            if (d -= I, w = P - S, I && (D = I / s + f), S)
              for (let F = x.length - 1; F >= 0; --F) {
                let $ = Number(x[F]);
                if ($ >= f) {
                  if (O !== null && ($ - f) * s < w)
                    break;
                  O = $;
                }
              }
          }
          let z = [], B = [];
          for (let P = 0; P < x.length; ++P) {
            let I = Number(x[P]);
            if (y.has(I)) {
              let S = this.decode([I]), F = Pg.get(S.slice(2, -2));
              if (F !== void 0) {
                if (i !== null && F !== i && !r) {
                  m.push(z);
                  let $ = this.findLongestCommonSequence(m)[0], Z = this.decode($);
                  u.text = Z, c.push(u), m = [], z = [], u = l();
                }
                i = u.language = F;
              }
            } else if (I >= f && I <= p) {
              let S = (I - f) * s + d, F = Nn(S, 2);
              if (O !== null && I >= O)
                g = !0;
              else if (g || m.length > 0 && I < D)
                g = !1;
              else if (u.timestamp[0] === null)
                u.timestamp[0] = F;
              else if (F !== u.timestamp[0]) {
                u.timestamp[1] = F, m.push(z), a && _.push(B);
                let [$, Z] = this.findLongestCommonSequence(
                  m,
                  _
                ), K = this.decode($);
                if (u.text = K, a && (u.words = this.collateWordTimestamps(
                  $,
                  Z,
                  i
                ), u.words.length > 0 && u.timestamp[1] !== null))
                  for (let A of u.words)
                    A.timestamp[1] > u.timestamp[1] && u.timestamp[1] >= A.timestamp[0] && (A.timestamp[1] = u.timestamp[1]);
                c.push(u), m = [], z = [], _ = [], B = [], u = l();
              }
            } else if (z.push(I), a) {
              let S = Nn(E[P] + d, 2), F;
              if (P + 1 < E.length) {
                F = Nn(E[P + 1] + d, 2);
                let $ = this.decode([I]);
                Rg.test($) && (F = Nn(Math.min(S + s, F), 2));
              } else
                F = null;
              B.push([S, F]);
            }
          }
          if ("stride" in C) {
            let [P, I, S] = C.stride;
            d += P - S;
          }
          z.length > 0 ? (m.push(z), a && _.push(B)) : m.every((P) => P.length === 0) && (u = l(), m = [], z = [], _ = [], B = []);
        }
        if (m.length > 0) {
          if (o && r)
            throw new Error(
              "Whisper did not predict an ending timestamp, which can happen if audio is cut off in the middle of a word. Also make sure WhisperTimeStampLogitsProcessor was used during generation."
            );
          let [C, x] = this.findLongestCommonSequence(
            m,
            _
          ), E = this.decode(C);
          u.text = E, a && (u.words = this.collateWordTimestamps(C, x, i)), c.push(u);
        }
        let v = /* @__PURE__ */ Object.create(null), k = c.map((C) => C.text).join("");
        if (r || n) {
          for (let C = 0; C < c.length; ++C) {
            let x = c[C];
            r || delete x.timestamp, n || delete x.language;
          }
          if (a) {
            let C = [];
            for (let x of c)
              for (let E of x.words)
                C.push(E);
            v = { chunks: C };
          } else
            v = { chunks: c };
        }
        return [k, v];
      }
      /**
       * Finds the longest common sequence among the provided sequences.
       * @param {number[][]} sequences An array of sequences of token ids to compare.
       * @returns {number[][]} The longest common sequence found.
       * @throws {Error} If there is a bug within the function.
       * @private
       */
      findLongestCommonSequence(e, r = null) {
        let n = e[0], s = n.length, o = [], i = Array.isArray(r) && r.length > 0, a = i ? [] : null, l = i ? r[0] : null;
        for (let c = 1; c < e.length; ++c) {
          let u = e[c], d = 0, f = [s, s, 0, 0], h = u.length;
          for (let v = 1; v < s + h; ++v) {
            let k = Math.max(0, s - v), C = Math.min(s, s + h - v), x = n.slice(k, C), E = Math.max(0, v - s), O = Math.min(h, v), D = u.slice(E, O);
            if (x.length !== D.length)
              throw new Error(
                "There is a bug within whisper `decode_asr` function, please report it. Dropping to prevent bad inference."
              );
            let z;
            i ? z = x.filter(
              (I, S) => I === D[S] && l[k + S][0] - y1 <= r[c][E + S][0]
            ).length : z = x.filter((I, S) => I === D[S]).length;
            let B = v / 1e4, P = z / v + B;
            z > 1 && P > d && (d = P, f = [k, C, E, O]);
          }
          let [p, m, _, g] = f, w = Math.floor((m + p) / 2), y = Math.floor((g + _) / 2);
          if (i && d === 0 && s > 0) {
            let v = l[s - 1][0], k = r[c].findIndex((C) => C[0] >= v);
            y = k === -1 ? u.length : k;
          }
          o.push(...n.slice(0, w)), n = u.slice(y), s = n.length, i && (a.push(...l.slice(0, w)), l = r[c].slice(y));
        }
        return o.push(...n), i ? (a.push(...l), [o, a]) : [o, []];
      }
      /** @private */
      collateWordTimestamps(e, r, n) {
        let [s, o, i] = this.combineTokensIntoWords(e, n), a = [];
        for (let l = 0; l < s.length; ++l) {
          let c = i[l];
          a.push({
            text: s[l],
            timestamp: [r[c.at(0)][0], r[c.at(-1)][1]]
          });
        }
        return a;
      }
      /**
       * Groups tokens by word. Returns a tuple containing a list of strings with the words,
       * and a list of `token_id` sequences with the tokens making up each word.
       * @param {number[]} tokens
       * @param {string} [language]
       * @param {string} prepend_punctionations
       * @param {string} append_punctuations
       *
       * @private
       */
      combineTokensIntoWords(e, r, n = `"'\u201C\xA1\xBF([{-`, s = `"'.\u3002,\uFF0C!\uFF01?\uFF1F:\uFF1A\u201D)]}\u3001`) {
        r = r ?? "english";
        let o, i, a;
        return ["chinese", "japanese", "thai", "lao", "myanmar"].includes(r) ? [o, i, a] = this.splitTokensOnUnicode(e) : [o, i, a] = this.splitTokensOnSpaces(e), this.mergePunctuations(o, i, a, n, s);
      }
      /** @type {PreTrainedTokenizer['decode']} */
      decode(e, r) {
        let n;
        return r?.decode_with_timestamps ? (e instanceof W && (e = Fc(e)), n = this.decodeWithTimestamps(e, r)) : n = super.decode(e, r), n;
      }
      /**
       * @param {number[]|bigint[]} token_ids List of token IDs to decode.
       * @param {Object} decode_args Optional arguments for decoding
       * @private
       */
      decodeWithTimestamps(e, r) {
        let n = r?.time_precision ?? 0.02, s = this.all_special_ids.at(-1) + 1, o = [[]];
        for (let i of e)
          if (i = Number(i), i >= s) {
            let a = ((i - s) * n).toFixed(2);
            o.push(`<|${a}|>`), o.push([]);
          } else
            o[o.length - 1].push(i);
        return o = o.map((i) => typeof i == "string" ? i : super.decode(i, r)), o.join("");
      }
      /**
       * Combine tokens into words by splitting at any position where the tokens are decoded as valid unicode points.
       * @param {number[]} tokens
       * @returns {*}
       * @private
       */
      splitTokensOnUnicode(e) {
        let r = this.decode(e, {
          // @ts-ignore
          decode_with_timestamps: !0
        }), n = "\uFFFD", s = [], o = [], i = [], a = [], l = [], c = 0;
        for (let u = 0; u < e.length; ++u) {
          let d = e[u];
          a.push(d), l.push(u);
          let f = this.decode(a, {
            // @ts-ignore
            decode_with_timestamps: !0
          });
          (!f.includes(n) || r[c + f.indexOf(n)] === n) && (s.push(f), o.push(a), i.push(l), a = [], l = [], c += f.length);
        }
        return [s, o, i];
      }
      /**
       * Combine tokens into words by splitting at whitespace and punctuation tokens.
       * @param {number[]} tokens
       * @private
       */
      splitTokensOnSpaces(e) {
        let [r, n, s] = this.splitTokensOnUnicode(e), o = [], i = [], a = [];
        for (let l = 0; l < r.length; ++l) {
          let c = r[l], u = n[l], d = s[l], f = u[0] >= this._tokenizer.token_to_id("<|endoftext|>"), h = c.startsWith(" "), p = c.trim(), m = Rg.test(p);
          if (f || h || m || o.length === 0)
            o.push(c), i.push(u), a.push(d);
          else {
            let _ = o.length - 1;
            o[_] += c, i[_].push(...u), a[_].push(...d);
          }
        }
        return [o, i, a];
      }
      /**
       * Merges punctuation tokens with neighboring words.
       * @param {string[]} words
       * @param {number[][]} tokens
       * @param {number[][]} indices
       * @param {string} prepended
       * @param {string} appended
       * @private
       */
      mergePunctuations(e, r, n, s, o) {
        let i = structuredClone(e), a = structuredClone(r), l = structuredClone(n), c = i.length - 2, u = i.length - 1;
        for (; c >= 0; )
          i[c].startsWith(" ") && s.includes(i[c].trim()) ? (i[u] = i[c] + i[u], a[u] = ht(a[c], a[u]), l[u] = ht(l[c], l[u]), i[c] = "", a[c] = [], l[c] = []) : u = c, --c;
        for (c = 0, u = 1; u < i.length; )
          !i[c].endsWith(" ") && o.includes(i[u]) ? (i[c] += i[u], a[c] = ht(a[c], a[u]), l[c] = ht(l[c], l[u]), i[u] = "", a[u] = [], l[u] = []) : c = u, ++u;
        return [
          i.filter((d) => d),
          a.filter((d) => d.length > 0),
          l.filter((d) => d.length > 0)
        ];
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/xlm_roberta/tokenization_xlm_roberta.js
  var Pu, Ng = b(() => {
    X();
    Pu = class extends R {
    };
  });

  // node_modules/@huggingface/transformers/src/models/xlm/tokenization_xlm.js
  var Lu, Dg = b(() => {
    X();
    Me();
    Lu = class extends R {
      return_token_type_ids = !0;
      constructor(e, r) {
        super(e, r), Q.warn(
          'WARNING: `XLMTokenizer` is not yet supported by Hugging Face\'s "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.'
        );
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/tokenizers.js
  var Ru = {};
  br(Ru, {
    AlbertTokenizer: () => jc,
    AutoTokenizer: () => Hn,
    BartTokenizer: () => Wc,
    BertTokenizer: () => Vc,
    BlenderbotSmallTokenizer: () => Gc,
    BlenderbotTokenizer: () => qc,
    BloomTokenizer: () => Hc,
    CLIPTokenizer: () => Xc,
    CamembertTokenizer: () => Yc,
    CodeGenTokenizer: () => Jc,
    CodeLlamaTokenizer: () => Kc,
    CohereAsrTokenizer: () => Qc,
    CohereTokenizer: () => Zc,
    ConvBertTokenizer: () => eu,
    DebertaTokenizer: () => ru,
    DebertaV2Tokenizer: () => tu,
    DistilBertTokenizer: () => nu,
    ElectraTokenizer: () => su,
    EsmTokenizer: () => ou,
    FalconTokenizer: () => iu,
    GPT2Tokenizer: () => cu,
    GPTNeoXTokenizer: () => lu,
    GemmaTokenizer: () => au,
    HerbertTokenizer: () => uu,
    LlamaTokenizer: () => du,
    M2M100Tokenizer: () => fu,
    MBart50Tokenizer: () => mu,
    MBartTokenizer: () => qn,
    MPNetTokenizer: () => wu,
    MarianTokenizer: () => hu,
    MgpstrTokenizer: () => _u,
    MobileBertTokenizer: () => gu,
    NllbTokenizer: () => yu,
    NougatTokenizer: () => bu,
    PreTrainedTokenizer: () => R,
    Qwen2Tokenizer: () => xu,
    RoFormerTokenizer: () => Eu,
    RobertaTokenizer: () => vu,
    SiglipTokenizer: () => ku,
    SpeechT5Tokenizer: () => Au,
    SqueezeBertTokenizer: () => Tu,
    T5Tokenizer: () => Su,
    TokenizersBackend: () => R,
    VitsTokenizer: () => Iu,
    Wav2Vec2CTCTokenizer: () => Mu,
    WhisperTokenizer: () => Ou,
    XLMRobertaTokenizer: () => Pu,
    XLMTokenizer: () => Lu
  });
  var zg = b(() => {
    V_();
    $u();
    G_();
    q_();
    H_();
    Y_();
    X_();
    K_();
    J_();
    Z_();
    Q_();
    eg();
    tg();
    rg();
    ng();
    sg();
    og();
    ig();
    ag();
    lg();
    cg();
    ug();
    dg();
    fg();
    hg();
    pg();
    mg();
    pu();
    _g();
    gg();
    wg();
    yg();
    bg();
    xg();
    vg();
    Eg();
    kg();
    Ag();
    Tg();
    Sg();
    Cg();
    Ig();
    Mg();
    $g();
    Ng();
    Dg();
    X();
  });

  // node_modules/@huggingface/transformers/src/models/auto/tokenization_auto.js
  var Hn, $u = b(() => {
    X();
    zg();
    Me();
    Hn = class {
      /**
       * Instantiate one of the tokenizer classes of the library from a pretrained model.
       *
       * The tokenizer class to instantiate is selected based on the `tokenizer_class` property of the config object
       * (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
       *
       * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
       * - A string, the *model id* of a pretrained tokenizer hosted inside a model repo on huggingface.co.
       *   Valid model ids can be located at the root-level, like `bert-base-uncased`, or namespaced under a
       *   user or organization name, like `dbmdz/bert-base-german-cased`.
       * - A path to a *directory* containing tokenizer files, e.g., `./my_model_directory/`.
       * @param {import('../../tokenization_utils.js').PretrainedTokenizerOptions} options Additional options for loading the tokenizer.
       *
       * @returns {Promise<PreTrainedTokenizer>} The loaded tokenizer.
       */
      static async from_pretrained(e, { progress_callback: r = null, config: n = null, cache_dir: s = null, local_files_only: o = !1, revision: i = "main" } = {}) {
        let [a, l] = await Uc(e, {
          progress_callback: r,
          config: n,
          cache_dir: s,
          local_files_only: o,
          revision: i
        }), c = l.tokenizer_class?.replace(/Fast$/, "") ?? "PreTrainedTokenizer", u = Ru[c];
        return u || (Q.warn(`Unknown tokenizer class "${c}", attempting to construct from base class.`), u = R), new u(a, l);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/florence2/processing_florence2.js
  var Yn, Bg = b(() => {
    Xp();
    Wm();
    $u();
    Yn = class extends Js {
      static tokenizer_class = Hn;
      static image_processor_class = wo;
      constructor(e, r, n) {
        super(e, r, n);
        let {
          // @ts-expect-error TS2339
          tasks_answer_post_processing_type: s,
          // @ts-expect-error TS2339
          task_prompts_without_inputs: o,
          // @ts-expect-error TS2339
          task_prompts_with_input: i
        } = this.image_processor.config;
        this.tasks_answer_post_processing_type = new Map(Object.entries(s ?? {})), this.task_prompts_without_inputs = new Map(Object.entries(o ?? {})), this.task_prompts_with_input = new Map(Object.entries(i ?? {})), this.regexes = {
          quad_boxes: /(.+?)<loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)>/gm,
          bboxes: /([^<]+)?<loc_(\d+)><loc_(\d+)><loc_(\d+)><loc_(\d+)>/gm
        }, this.size_per_bin = 1e3;
      }
      /**
       * Helper function to construct prompts from input texts
       * @param {string|string[]} text
       * @returns {string[]}
       */
      construct_prompts(e) {
        typeof e == "string" && (e = [e]);
        let r = [];
        for (let n of e)
          if (this.task_prompts_without_inputs.has(n))
            r.push(this.task_prompts_without_inputs.get(n));
          else {
            for (let [s, o] of this.task_prompts_with_input)
              if (n.includes(s)) {
                r.push(o.replaceAll("{input}", n).replaceAll(s, ""));
                break;
              }
            r.length !== e.length && r.push(n);
          }
        return r;
      }
      /**
       * Post-process the output of the model to each of the task outputs.
       * @param {string} text The text to post-process.
       * @param {string} task The task to post-process the text for.
       * @param {[number, number]} image_size The size of the image. height x width.
       */
      post_process_generation(e, r, n) {
        let s = this.tasks_answer_post_processing_type.get(r) ?? "pure_text";
        e = e.replaceAll("<s>", "").replaceAll("</s>", "");
        let o;
        switch (s) {
          case "pure_text":
            o = e;
            break;
          case "description_with_bboxes":
          case "bboxes":
          case "phrase_grounding":
          case "ocr":
            let i = s === "ocr" ? "quad_boxes" : "bboxes", a = e.matchAll(this.regexes[i]), l = [], c = [];
            for (let [u, d, ...f] of a)
              l.push(d ? d.trim() : l.at(-1) ?? ""), c.push(
                f.map(
                  (h, p) => (
                    // NOTE: Add 0.5 to use the center position of the bin as the coordinate.
                    (Number(h) + 0.5) / this.size_per_bin * n[p % 2]
                  )
                )
              );
            o = { labels: l, [i]: c };
            break;
          default:
            throw new Error(`Task "${r}" (of type "${s}") not yet implemented.`);
        }
        return { [r]: o };
      }
      // NOTE: images and text are switched from the python version
      // `images` is required, `text` is optional
      async _call(e, r = null, n = {}) {
        if (!e && !r)
          throw new Error("Either text or images must be provided");
        let s = await this.image_processor(e, n), o = r ? this.tokenizer(this.construct_prompts(r), n) : {};
        return {
          ...s,
          ...o
        };
      }
    };
  });

  // node_modules/@huggingface/transformers/src/configs.js
  async function b1(t, e) {
    return await Ke(t, "config.json", !0, e);
  }
  function on(t) {
    let e = {}, r = {};
    switch (t.model_type) {
      // Sub-configs
      case "llava":
      case "paligemma":
      case "gemma3":
      case "florence2":
      case "llava_onevision":
      case "idefics3":
      case "granite_speech":
      case "ultravox":
      case "voxtral":
      case "voxtral_realtime":
      case "smolvlm":
      case "gemma3n":
      case "gemma4":
      case "lfm2_vl":
      case "lfm3_vl":
      case "chatterbox":
      case "lighton_ocr":
      case "glm_ocr":
      case "mistral3":
      case "qwen2_5_vl":
      case "qwen3_vl":
      case "qwen3_vl_moe":
        r = on(t.text_config);
        break;
      case "moondream1":
        r = on(t.phi_config);
        break;
      case "musicgen":
        r = on(t.decoder);
        break;
      case "multi_modality":
        r = on(t.language_config);
        break;
      // Decoder-only models
      case "gpt2":
      case "gptj":
      case "jais":
      case "codegen":
      case "gpt_bigcode":
        e.num_heads = "n_head", e.num_layers = "n_layer", e.hidden_size = "n_embd";
        break;
      case "gpt_neox":
      case "stablelm":
      case "opt":
      case "falcon":
      case "modernbert-decoder":
        e.num_heads = "num_attention_heads", e.num_layers = "num_hidden_layers", e.hidden_size = "hidden_size";
        break;
      case "gpt_oss":
      case "llama":
      case "llama4_text":
      case "nanochat":
      case "apertus":
      case "arcee":
      case "afmoe":
      case "lfm2":
      case "lfm2_moe":
      case "lfm3":
      case "smollm3":
      case "olmo":
      case "olmo2":
      case "olmo3":
      case "mobilellm":
      case "granite":
      case "granitemoehybrid":
      case "cohere":
      case "cohere2":
      case "mistral":
      case "voxtral_realtime_text":
      case "voxtral_realtime_encoder":
      case "starcoder2":
      case "qwen2":
      case "qwen2_moe":
      case "qwen2_vl":
      case "qwen2_vl_text":
      case "qwen2_5_vl_text":
      case "qwen3_moe":
      case "qwen3_vl_text":
      case "qwen3_vl_moe_text":
      case "phi":
      case "phi3":
      case "phi3_v":
      case "llava_qwen2":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_hidden_layers", e.hidden_size = "hidden_size", e.num_attention_heads = "num_attention_heads", e.dim_kv = "head_dim";
        break;
      case "qwen3":
      case "solar_open":
      case "glm_ocr_text":
      case "gemma":
      case "gemma2":
      case "vaultgemma":
      case "gemma3_text":
      case "gemma3n_text":
      case "gemma4_text":
      case "glm":
      case "helium":
      case "ernie4_5":
      case "hunyuan_v1_dense":
      case "falcon_h1":
      case "nemotron_h":
      case "ministral":
      case "ministral3":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_hidden_layers", e.dim_kv = "head_dim";
        break;
      case "openelm":
        e.num_heads = "num_kv_heads", e.num_layers = "num_transformer_layers", e.dim_kv = "head_dim";
        break;
      case "gpt_neo":
      case "donut-swin":
        e.num_heads = "num_heads", e.num_layers = "num_layers", e.hidden_size = "hidden_size";
        break;
      case "bloom":
        e.num_heads = "n_head", e.num_layers = "n_layer", e.hidden_size = "hidden_size";
        break;
      case "mpt":
        e.num_heads = "n_heads", e.num_layers = "n_layers", e.hidden_size = "d_model";
        break;
      case "exaone":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_layers", e.dim_kv = "head_dim", e.num_attention_heads = "num_attention_heads";
        break;
      case "youtu":
      case "deepseek_v3":
      case "deepseek_v4":
      case "glm_moe_dsa":
      case "mistral4":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_hidden_layers", e.dim_kv = t.model_type === "deepseek_v4" ? "head_dim" : "qk_head_dim", e.num_attention_heads = "num_attention_heads";
        break;
      case "zaya":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_hidden_layers", e.hidden_size = "hidden_size", e.dim_kv = "head_dim", e.num_attention_heads = "num_attention_heads";
        break;
      case "hrm_text":
        e.num_heads = "num_key_value_heads", e.num_layers = "num_hidden_layers", e.hidden_size = "hidden_size", e.dim_kv = "head_dim", e.num_attention_heads = "num_attention_heads";
        break;
      // Encoder-decoder models
      case "t5":
      case "mt5":
      case "longt5":
        e.num_decoder_layers = "num_decoder_layers", e.num_decoder_heads = "num_heads", e.decoder_dim_kv = "d_kv", e.num_encoder_layers = "num_layers", e.num_encoder_heads = "num_heads", e.encoder_dim_kv = "d_kv";
        break;
      case "bart":
      case "mbart":
      case "marian":
      case "whisper":
      case "lite-whisper":
      case "m2m_100":
      case "blenderbot":
      case "blenderbot-small":
      case "florence2_language":
        e.num_decoder_layers = "decoder_layers", e.num_decoder_heads = "decoder_attention_heads", e.decoder_hidden_size = "d_model", e.num_encoder_layers = "encoder_layers", e.num_encoder_heads = "encoder_attention_heads", e.encoder_hidden_size = "d_model";
        break;
      case "speecht5":
        e.num_decoder_layers = "decoder_layers", e.num_decoder_heads = "decoder_attention_heads", e.decoder_hidden_size = "hidden_size", e.num_encoder_layers = "encoder_layers", e.num_encoder_heads = "encoder_attention_heads", e.encoder_hidden_size = "hidden_size";
        break;
      case "trocr":
        e.num_encoder_layers = e.num_decoder_layers = "decoder_layers", e.num_encoder_heads = e.num_decoder_heads = "decoder_attention_heads", e.encoder_hidden_size = e.decoder_hidden_size = "d_model";
        break;
      case "musicgen_decoder":
        e.num_encoder_layers = e.num_decoder_layers = "num_hidden_layers", e.num_encoder_heads = e.num_decoder_heads = "num_attention_heads", e.encoder_hidden_size = e.decoder_hidden_size = "hidden_size";
        break;
      case "moonshine":
        e.num_decoder_layers = "decoder_num_hidden_layers", e.num_decoder_heads = "decoder_num_key_value_heads", e.num_encoder_layers = "encoder_num_hidden_layers", e.num_encoder_heads = "encoder_num_key_value_heads", e.encoder_hidden_size = e.decoder_hidden_size = "hidden_size";
        break;
      case "cohere_asr":
        e.num_decoder_layers = "num_hidden_layers", e.num_decoder_heads = "num_key_value_heads", e.decoder_hidden_size = "hidden_size", e.decoder_dim_kv = "head_dim";
        let {
          num_hidden_layers: s,
          num_attention_heads: o,
          hidden_size: i
        } = (
          /** @type {any} */
          t.encoder_config
        );
        r = {
          num_encoder_layers: s,
          num_encoder_heads: o,
          encoder_hidden_size: i,
          // @ts-expect-error TS2339
          encoder_dim_kv: t.head_dim
        };
        break;
      case "vision-encoder-decoder":
        let a = on(t.decoder), l = "num_decoder_layers" in a, c = Le(t, ["model_type", "is_encoder_decoder"]);
        return l ? (c.num_decoder_layers = a.num_decoder_layers, c.num_decoder_heads = a.num_decoder_heads, c.decoder_hidden_size = a.decoder_hidden_size, c.num_encoder_layers = a.num_encoder_layers, c.num_encoder_heads = a.num_encoder_heads, c.encoder_hidden_size = a.encoder_hidden_size) : (c.num_layers = a.num_layers, c.num_heads = a.num_heads, c.hidden_size = a.hidden_size), c;
    }
    let n = {
      ...r,
      ...Le(t, ["model_type", "multi_query", "is_encoder_decoder"])
    };
    for (let s in e)
      n[s] = t[e[s]];
    return n;
  }
  function Kn(t, e) {
    t instanceof Xn || (t = new Xn(t));
    let r = e?.prefix ?? "past_key_values", n = r === "present" ? "present" : "past", s = /* @__PURE__ */ new Set();
    if (["lfm2", "lfm2_moe", "lfm3"].includes(t.model_type)) {
      let { layer_types: o } = (
        /** @type {any} */
        t
      );
      for (let i = 0; i < o.length; ++i)
        if (o[i] === "full_attention" || o[i] === "sliding_attention")
          s.add(`${r}.${i}.key`), s.add(`${r}.${i}.value`);
        else if (o[i] === "conv")
          s.add(`${n}_conv.${i}`);
        else
          throw new Error(`Unsupported layer type: ${o[i]}`);
      return s;
    } else if (["granitemoehybrid", "falcon_h1", "nemotron_h"].includes(t.model_type)) {
      let o = (
        /** @type {any} */
        t
      ), i = o.layer_types ?? o.layers_block_type, a = o.num_hidden_layers ?? i?.length;
      for (let l = 0; l < a; ++l)
        (!i || i[l] === "mamba") && (s.add(`${n}_conv.${l}`), s.add(`${n}_ssm.${l}`)), (!i || i[l] === "attention") && (s.add(`${r}.${l}.key`), s.add(`${r}.${l}.value`));
      return s;
    } else if (["qwen3_next", "qwen3_5_text", "qwen3_5_moe_text", "olmo_hybrid"].includes(t.model_type)) {
      let { layer_types: o } = (
        /** @type {any} */
        t
      );
      for (let i = 0; i < o.length; ++i)
        if (o[i] === "full_attention")
          s.add(`${r}.${i}.key`), s.add(`${r}.${i}.value`);
        else if (o[i] === "linear_attention")
          t.model_type === "olmo_hybrid" ? (s.add(`${n}_conv.${i}.key`), s.add(`${n}_conv.${i}.value`), s.add(`${n}_conv.${i}.query`)) : s.add(`${n}_conv.${i}`), s.add(`${n}_recurrent.${i}`);
        else
          throw new Error(`Unsupported layer type: ${o[i]}`);
      return s;
    } else if (["gemma4", "gemma4_text"].includes(t.model_type)) {
      let o = (
        /** @type {any} */
        t.model_type === "gemma4" ? (
          /** @type {any} */
          t.text_config
        ) : t
      ), i = o.num_hidden_layers, a = o.num_kv_shared_layers ?? 0, l = i - a;
      for (let c = 0; c < l; ++c)
        s.add(`${r}.${c}.key`), s.add(`${r}.${c}.value`);
      return s;
    } else if (t.model_type === "deepseek_v4") {
      let { layer_types: o, num_hidden_layers: i } = (
        /** @type {any} */
        t
      );
      for (let a = 0; a < i; ++a) {
        s.add(`${r}.${a}.key`), s.add(`${r}.${a}.value`);
        let l = o[a];
        if (l === "compressed_sparse_attention")
          s.add(`${n}_compressor.${a}.kv`), s.add(`${n}_compressor.${a}.gate`), s.add(`${n}_indexer.${a}.kv`), s.add(`${n}_indexer.${a}.gate`);
        else if (l === "heavily_compressed_attention")
          s.add(`${n}_compressor.${a}.kv`), s.add(`${n}_compressor.${a}.gate`);
        else if (l && l !== "sliding_attention")
          throw new Error(`Unsupported layer type: ${l}`);
      }
      return s;
    } else if (t.model_type === "zaya") {
      let { num_hidden_layers: o, cca_time1: i } = (
        /** @type {any} */
        t
      ), a = i ?? 1;
      for (let l = 0; l < o; l += a)
        s.add(`${r}.${l}.key`), s.add(`${r}.${l}.value`), s.add(`${r}.${l}.conv_state`), s.add(`${r}.${l}.shift_state`);
      return s;
    } else if (["lfm2_vl", "lfm3_vl", "qwen3_5", "qwen3_5_moe", "voxtral_realtime"].includes(t.model_type)) {
      let o;
      return t.model_type === "voxtral_realtime" && e?.session_name === "audio_encoder" ? o = /** @type {any} */
      t.audio_config : o = /** @type {any} */
      t.text_config, Kn(o, e);
    }
    return x1(t, { prefix: r });
  }
  function x1(t, { prefix: e = "past_key_values" } = {}) {
    let r = /* @__PURE__ */ new Set(), n = t.normalized_config;
    if (n.is_encoder_decoder && "num_encoder_heads" in n && "num_decoder_heads" in n)
      for (let s = 0; s < n.num_decoder_layers; ++s)
        r.add(`${e}.${s}.encoder.key`), r.add(`${e}.${s}.encoder.value`), r.add(`${e}.${s}.decoder.key`), r.add(`${e}.${s}.decoder.value`);
    else if (n.multi_query)
      for (let s = 0; s < n.num_layers; ++s)
        r.add(`${e}.${s}.key_value`);
    else
      for (let s = 0; s < n.num_layers; ++s)
        r.add(`${e}.${s}.key`), r.add(`${e}.${s}.value`);
    return r;
  }
  var Xn, pr, Mo = b(() => {
    st();
    mt();
    Xn = class t {
      // NOTE: Typo in original
      /** @type {string|null} */
      model_type = null;
      /** @type {boolean} */
      is_encoder_decoder = !1;
      /** @type {number} */
      max_position_embeddings;
      /** @type {TransformersJSConfig} */
      "transformers.js_config";
      /**
       * Create a new `PretrainedConfig` from a parsed `config.json` object.
       * @param {Object} configJSON The JSON of the config.
       */
      constructor(e) {
        Object.assign(this, e), this.normalized_config = on(this);
      }
      /**
       * Loads a pretrained config from the given `pretrained_model_name_or_path`.
       *
       * @param {string} pretrained_model_name_or_path The path to the pretrained config.
       * @param {PretrainedOptions} options Additional options for loading the config.
       * @throws {Error} Throws an error if the config.json is not found in the `pretrained_model_name_or_path`.
       *
       * @returns {Promise<PretrainedConfig>} A new instance of the `PretrainedConfig` class.
       */
      static async from_pretrained(e, { progress_callback: r = null, config: n = null, cache_dir: s = null, local_files_only: o = !1, revision: i = "main" } = {}) {
        n && !(n instanceof t) && (n = new t(n));
        let a = n ?? await b1(e, {
          progress_callback: r,
          config: n,
          cache_dir: s,
          local_files_only: o,
          revision: i
        });
        return new this(a);
      }
    }, pr = class {
      /** @type {typeof PretrainedConfig.from_pretrained} */
      static async from_pretrained(...e) {
        return Xn.from_pretrained(...e);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/model-loader.js
  function Nu(t, e, r) {
    return t ? typeof t == "object" && t !== null ? t.hasOwnProperty(e) ? +t[e] : t.hasOwnProperty(r) ? +t[r] : 0 : +t : 0;
  }
  function Du(t, e) {
    let r = [];
    for (let n = 0; n < e; ++n)
      r.push(`${t}_data${n === 0 ? "" : "_" + n}`);
    return r;
  }
  async function Ug(t, e, r, n) {
    let s = `${e}${n}.onnx`, o = `${r.subfolder ?? ""}/${s}`;
    return await Rn(t, o, !0, r, q.IS_NODE_ENV);
  }
  async function Fg(t, e, r, n, s, o = {}) {
    let i = `${e}${r}.onnx`, a = q.IS_NODE_ENV, l = [], c = Nu(s, i, e);
    if (c > 0) {
      if (c > Ms)
        throw new Error(
          `The number of external data chunks (${c}) exceeds the maximum allowed value (${Ms}).`
        );
      let u = Du(i, c);
      for (let d of u) {
        let f = `${n.subfolder ?? ""}/${d}`;
        l.push(
          Rn(t, f, !0, n, a).then(
            (h) => h instanceof Uint8Array ? { path: d, data: h } : d
          )
        );
      }
    } else o.externalData !== void 0 && (l = o.externalData.map(async (u) => {
      if (typeof u.data == "string") {
        let d = await Rn(t, u.data, !0, n);
        return { ...u, data: d };
      }
      return u;
    }));
    return Promise.all(l);
  }
  var zu = b(() => {
    mt();
    Ie();
  });

  // node_modules/@huggingface/transformers/src/models/session.js
  async function v1(t, e, r, n = !1, s = void 0) {
    let o = r.config?.["transformers.js_config"] ?? {}, i = (
      /** @type {import("../utils/devices.js").DeviceType} */
      js(r.device ?? o.device, e, {
        warn: (w) => Q.info(w)
      })
    ), a = Ip(i), l = o.device_config ?? {};
    l.hasOwnProperty(i) && (o = {
      ...o,
      ...l[i]
    });
    let c = (
      /** @type {import("../utils/dtypes.js").DataType} */
      Vs(r.dtype ?? o.dtype, e, i, {
        configDtype: o.dtype,
        warn: (w) => Q.info(w)
      })
    );
    if (Bn.hasOwnProperty(c)) {
      if (i === "webgpu" && // NOTE: Currently, we assume that the Native WebGPU EP always supports fp16. In future, we will add a check for this.
      !q.IS_NODE_ENV && c === be.fp16 && !await Rp())
        throw new Error(`The device (${i}) does not support fp16.`);
    } else throw new Error(`Invalid dtype: ${c}. Should be one of: ${Object.keys(be).join(", ")}`);
    let u = Bn[c], d = { ...r.session_options };
    d.executionProviders ??= a;
    let f = o.free_dimension_overrides;
    f ? d.freeDimensionOverrides ??= f : i.startsWith("webnn") && !d.freeDimensionOverrides && Q.warn(
      `WebNN does not currently support dynamic shapes and requires 'free_dimension_overrides' to be set in config.json, preferably as a field within config["transformers.js_config"]["device_config"]["${i}"]. When 'free_dimension_overrides' is not set, you may experience significant performance degradation.`
    );
    let h = Ug(t, e, r, u), p = r.use_external_data_format ?? o.use_external_data_format, m = await Fg(
      t,
      e,
      u,
      r,
      p,
      d
    );
    if (m.length > 0 && (!q.IS_NODE_ENV || m.some((w) => typeof w != "string")) && (d.externalData = m), n && i === "webgpu") {
      let w = Kn(r.config, {
        prefix: "present",
        session_name: s
      });
      if (w.size > 0 && !zn()) {
        let y = {};
        for (let v of w)
          y[v] = "gpu-buffer";
        d.preferredOutputLocation = y;
      }
    }
    return { buffer_or_path: await h, session_options: d, session_config: {
      dtype: c,
      device: i
    } };
  }
  async function jg(t, e, r, n = void 0) {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(e).map(async (s) => {
          let o = n?.[s] ?? !1, { buffer_or_path: i, session_options: a, session_config: l } = await v1(
            t,
            e[s],
            r,
            o,
            s
          ), c = await zs(i, a, l);
          return [s, c];
        })
      )
    );
  }
  function Wg(t) {
    for (let e in t)
      Us(t[e]) ? t[e] = new W(t[e]) : typeof t[e] == "object" && Wg(t[e]);
    return t;
  }
  async function Oo(t, e) {
    let r = E1(t, e);
    try {
      let n = Object.fromEntries(
        Object.entries(r).map(([o, i]) => {
          let a = (
            /** @type {any} */
            i.ort_tensor
          );
          return q.IS_NODE_ENV && typeof Float16Array < "u" && a.cpuData instanceof Float16Array && (a.cpuData = new Uint16Array(a.cpuData.buffer)), [o, a];
        })
      ), s = await Bs(t, n);
      return Wg(s);
    } catch (n) {
      let s = Object.fromEntries(
        Object.entries(r).map(([o, i]) => {
          let a = {
            type: i.type,
            dims: i.dims,
            location: i.location
          };
          return a.location !== "gpu-buffer" && (a.data = i.data), [o, a];
        })
      );
      throw Q.error(`An error occurred during model execution: "${n}".`), Q.error("Inputs given to model:", s), n;
    }
  }
  function E1(t, e) {
    let r = /* @__PURE__ */ Object.create(null), n = [];
    for (let i of t.inputNames) {
      let a = e[i];
      if (!(a instanceof W)) {
        n.push(i);
        continue;
      }
      r[i] = zn() ? a.clone() : a;
    }
    if (n.length > 0)
      throw new Error(
        `An error occurred during model execution: "Missing the following inputs: ${n.join(", ")}.`
      );
    let s = Object.keys(e).length, o = t.inputNames.length;
    if (s > o) {
      let i = Object.keys(e).filter((a) => !t.inputNames.includes(a));
      Q.warn(
        `WARNING: Too many inputs were provided (${s} > ${o}). The following inputs will be ignored: "${i.join(", ")}".`
      );
    }
    return r;
  }
  var Vg = b(() => {
    Fs();
    Mo();
    Fn();
    Ws();
    Ie();
    zu();
    we();
    Me();
  });

  // node_modules/@huggingface/transformers/src/models/modeling_outputs.js
  var Bu = b(() => {
  });

  // node_modules/@huggingface/transformers/src/generation/logits_process.js
  var et, Uu, Po, Lo, Ro, $o, No, Do, zo, Bo, Uo, Fo, jo, Wo, Gg = b(() => {
    ft();
    we();
    ar();
    et = class extends ye {
      /**
       * Apply the processor to the input logits.
       *
       * @abstract
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits to process.
       * @throws {Error} Throws an error if `_call` is not implemented in the subclass.
       */
      _call(e, r) {
        throw Error("`_call` should be implemented in a subclass");
      }
    }, Uu = class extends ye {
      /**
       * Apply the processor to the input logits.
       *
       * @abstract
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits to process.
       * @throws {Error} Throws an error if `_call` is not implemented in the subclass.
       */
      _call(e, r) {
        throw Error("`_call` should be implemented in a subclass");
      }
    }, Po = class extends ye {
      /**
       * Constructs a new instance of `LogitsProcessorList`.
       */
      constructor() {
        super(), this.processors = [];
      }
      /**
       * Adds a new logits processor to the list.
       *
       * @param {LogitsProcessor} item The logits processor function to add.
       */
      push(e) {
        this.processors.push(e);
      }
      /**
       * Adds multiple logits processors to the list.
       *
       * @param {LogitsProcessor[]} items The logits processor functions to add.
       */
      extend(e) {
        this.processors.push(...e);
      }
      /**
       * Applies all logits processors in the list to a batch of logits, modifying them in-place.
       *
       * @param {bigint[][]} input_ids The input IDs for the language model.
       * @param {Tensor} logits
       */
      _call(e, r) {
        let n = r;
        for (let s of this.processors)
          n = s(e, n);
        return n;
      }
      [Symbol.iterator]() {
        return this.processors.values();
      }
    }, Lo = class extends et {
      /**
       * Create a ForcedBOSTokenLogitsProcessor.
       * @param {number} bos_token_id The ID of the beginning-of-sequence token to be forced.
       */
      constructor(e) {
        super(), this.bos_token_id = e;
      }
      /**
       * Apply the BOS token forcing to the logits.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The logits with BOS token forcing.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n)
          if (e[n].length === 1) {
            let s = (
              /** @type {Float32Array} */
              r[n].data
            );
            s.fill(-1 / 0), s[this.bos_token_id] = 0;
          }
        return r;
      }
    }, Ro = class extends et {
      /**
       * Create a ForcedEOSTokenLogitsProcessor.
       * @param {number} max_length The maximum length of the sequence to be generated.
       * @param {number|number[]} eos_token_id The ID or IDs of the *end-of-sequence* token.
       */
      constructor(e, r) {
        super(), this.max_length = e, this.eos_token_id = Array.isArray(r) ? r : [r];
      }
      /**
       * Apply the processor to input_ids and logits.
       *
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits tensor.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n)
          if (e[n].length === this.max_length - 1) {
            let s = (
              /** @type {Float32Array} */
              r[n].data
            );
            s.fill(-1 / 0);
            for (let o of this.eos_token_id)
              s[o] = 0;
          }
        return r;
      }
    }, $o = class extends et {
      /**
       * Create a SuppressTokensLogitsProcessor.
       * @param {number[]} suppress_tokens The IDs of the tokens to suppress.
       */
      constructor(e) {
        super(), this.suppress_tokens = e;
      }
      /**
       * Suppress the specified tokens by setting their logits to -Infinity.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The modified logits.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n) {
          let s = (
            /** @type {Float32Array} */
            r[n].data
          );
          for (let o of this.suppress_tokens)
            s[o] = -1 / 0;
        }
        return r;
      }
    }, No = class extends et {
      /**
       * Create a SuppressTokensAtBeginLogitsProcessor.
       * @param {number[]} begin_suppress_tokens The IDs of the tokens to suppress.
       * @param {number} begin_index The number of tokens to generate before suppressing tokens.
       */
      constructor(e, r) {
        super(), this.begin_suppress_tokens = e, this.begin_index = r;
      }
      /**
       * Apply the BOS token forcing to the logits.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The logits with BOS token forcing.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n)
          if (e[n].length === this.begin_index) {
            let s = (
              /** @type {Float32Array} */
              r[n].data
            );
            for (let o of this.begin_suppress_tokens)
              s[o] = -1 / 0;
          }
        return r;
      }
    }, Do = class extends et {
      /**
       * Create a NoRepeatNGramLogitsProcessor.
       * @param {number} no_repeat_ngram_size The no-repeat n-gram size. All n-grams of this size can only occur once.
       */
      constructor(e) {
        super(), this.no_repeat_ngram_size = e;
      }
      /**
       * Generate n-grams from a sequence of token IDs.
       * @param {bigint[]} prevInputIds List of previous input IDs.
       * @returns {Map<string, number[]>} Map of generated n-grams
       */
      getNgrams(e) {
        let r = e.length, n = [];
        for (let o = 0; o < r + 1 - this.no_repeat_ngram_size; ++o) {
          let i = [];
          for (let a = 0; a < this.no_repeat_ngram_size; ++a)
            i.push(e[o + a]);
          n.push(i.map(Number));
        }
        let s = /* @__PURE__ */ new Map();
        for (let o of n) {
          let i = o.slice(0, o.length - 1), a = JSON.stringify(i), l = s.get(a) ?? [];
          l.push(o[o.length - 1]), s.set(a, l);
        }
        return s;
      }
      /**
       * Generate n-grams from a sequence of token IDs.
       * @param {Map<string, number[]>} bannedNgrams Map of banned n-grams
       * @param {bigint[]} prevInputIds List of previous input IDs.
       * @returns {number[]} Map of generated n-grams
       */
      getGeneratedNgrams(e, r) {
        let n = r.slice(r.length + 1 - this.no_repeat_ngram_size, r.length);
        return e.get(JSON.stringify(n.map(Number))) ?? [];
      }
      /**
       * Calculate banned n-gram tokens
       * @param {bigint[]} prevInputIds List of previous input IDs.
       * @returns {number[]} Map of generated n-grams
       */
      calcBannedNgramTokens(e) {
        let r = [];
        if (e.length + 1 < this.no_repeat_ngram_size)
          return r;
        {
          let n = this.getNgrams(e);
          return this.getGeneratedNgrams(n, e);
        }
      }
      /**
       * Apply the no-repeat n-gram processor to the logits.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The logits with no-repeat n-gram processing.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n) {
          let s = (
            /** @type {Float32Array} */
            r[n].data
          ), o = this.calcBannedNgramTokens(e[n]);
          for (let i of o)
            s[i] = -1 / 0;
        }
        return r;
      }
    }, zo = class extends et {
      /**
       * Create a RepetitionPenaltyLogitsProcessor.
       * @param {number} penalty Penalty applied to repeated tokens.
       * - 1.0 means no penalty. Above 1.0 penalizes previously generated tokens.
       * - Between 0.0 and 1.0 rewards previously generated tokens.
       */
      constructor(e) {
        super(), this.penalty = e;
      }
      /**
       * Apply the repetition penalty to the logits.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The logits with repetition penalty processing.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n) {
          let s = (
            /** @type {Float32Array} */
            r[n].data
          );
          for (let o of new Set(e[n])) {
            let i = Number(o);
            s[i] < 0 ? s[i] *= this.penalty : s[i] /= this.penalty;
          }
        }
        return r;
      }
    }, Bo = class extends et {
      /**
       * Create a MinLengthLogitsProcessor.
       * @param {number} min_length The minimum length below which the score of `eos_token_id` is set to negative infinity.
       * @param {number|number[]} eos_token_id The ID or IDs of the end-of-sequence token.
       */
      constructor(e, r) {
        super(), this.min_length = e, this.eos_token_id = Array.isArray(r) ? r : [r];
      }
      /**
       * Apply logit processor.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The processed logits.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n)
          if (e[n].length < this.min_length) {
            let s = (
              /** @type {Float32Array} */
              r[n].data
            );
            for (let o of this.eos_token_id)
              s[o] = -1 / 0;
          }
        return r;
      }
    }, Uo = class extends et {
      /**
       * Create a MinNewTokensLengthLogitsProcessor.
       * @param {number} prompt_length_to_skip The input tokens length.
       * @param {number} min_new_tokens The minimum *new* tokens length below which the score of `eos_token_id` is set to negative infinity.
       * @param {number|number[]} eos_token_id The ID or IDs of the end-of-sequence token.
       */
      constructor(e, r, n) {
        super(), this.prompt_length_to_skip = e, this.min_new_tokens = r, this.eos_token_id = Array.isArray(n) ? n : [n];
      }
      /**
       * Apply logit processor.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The processed logits.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n)
          if (e[n].length - this.prompt_length_to_skip < this.min_new_tokens) {
            let o = (
              /** @type {Float32Array} */
              r[n].data
            );
            for (let i of this.eos_token_id)
              o[i] = -1 / 0;
          }
        return r;
      }
    }, Fo = class extends et {
      /**
       * Create a `NoBadWordsLogitsProcessor`.
       * @param {number[][]} bad_words_ids List of token ID sequences that are not allowed to be generated.
       * @param {number|number[]} eos_token_id The ID of the *end-of-sequence* token. Optionally, use a list to set multiple *end-of-sequence* tokens.
       */
      constructor(e, r) {
        super(), this.bad_words_ids = e, this.eos_token_id = Array.isArray(r) ? r : [r];
      }
      /**
       * Apply logit processor.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The processed logits.
       */
      _call(e, r) {
        for (let n = 0; n < e.length; ++n) {
          let s = (
            /** @type {Float32Array} */
            r[n].data
          ), o = e[n];
          for (let i of this.bad_words_ids) {
            if (o.length < i.length - 1) continue;
            let a = !0;
            for (let l = 1; l <= i.length - 1; ++l)
              if (i.at(-l - 1) != o.at(-l)) {
                a = !1;
                break;
              }
            a && (s[i.at(-1)] = -1 / 0);
          }
        }
        return r;
      }
    }, jo = class extends et {
      /**
       * Create a `ClassifierFreeGuidanceLogitsProcessor`.
       * @param {number} guidance_scale The guidance scale for classifier-free guidance (CFG). CFG is enabled by setting `guidance_scale > 1`.
       * Higher guidance scale encourages the model to generate samples that are more closely tied to the input
       * prompt, usually at the expense of poorer quality.
       */
      constructor(e) {
        if (super(), e <= 1)
          throw new Error(
            `Require guidance scale >1 to use the classifier-free guidance processor, got guidance scale ${e}.`
          );
        this.guidance_scale = e;
      }
      /**
       * Apply logit processor.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The processed logits.
       */
      _call(e, r) {
        if (r.dims[0] !== 2 * e.length)
          throw new Error(
            `Logits should have twice the batch size of the input ids, the first half of batches corresponding to the conditional inputs, and the second half of batches corresponding to the unconditional inputs. Got batch size ${r.dims[0]} for the logits and ${e.length} for the input ids.`
          );
        let n = e.length, s = r.slice([0, n], null), o = r.slice([n, r.dims[0]], null);
        for (let i = 0; i < o.data.length; ++i)
          o.data[i] += (s.data[i] - o.data[i]) * this.guidance_scale;
        return o;
      }
    }, Wo = class extends Uu {
      /**
       * Create a `TemperatureLogitsWarper`.
       * @param {number} temperature Strictly positive float value used to modulate the logits distribution.
       * A value smaller than `1` decreases randomness (and vice versa), with `0` being equivalent to shifting
       * all probability mass to the most likely token.
       */
      constructor(e) {
        if (super(), typeof e != "number" || e <= 0) {
          let r = `\`temperature\` (=${e}) must be a strictly positive float, otherwise your next token scores will be invalid.`;
          e === 0 && (r += " If you're looking for greedy decoding strategies, set `do_sample=false`.");
        }
        this.temperature = e;
      }
      /**
       * Apply logit warper.
       * @param {bigint[][]} input_ids The input IDs.
       * @param {Tensor} logits The logits.
       * @returns {Tensor} The processed logits.
       */
      _call(e, r) {
        let n = (
          /** @type {Float32Array} */
          r.data
        );
        for (let s = 0; s < n.length; ++s)
          n[s] /= this.temperature;
        return r;
      }
    };
  });

  // node_modules/@huggingface/transformers/src/generation/configuration_utils.js
  var Vo, Fu = b(() => {
    st();
    Vo = class {
      // Parameters that control the length of the output
      /**
       * The maximum length the generated tokens can have.
       * Corresponds to the length of the input prompt + `max_new_tokens`.
       * Its effect is overridden by `max_new_tokens`, if also set.
       * @type {number}
       * @default 20
       */
      max_length = 20;
      /**
       * The maximum number of tokens to generate, ignoring the number of tokens in the prompt.
       * @type {number}
       * @default null
       */
      max_new_tokens = null;
      /**
       * The minimum length of the sequence to be generated.
       * Corresponds to the length of the input prompt + `min_new_tokens`.
       * Its effect is overridden by `min_new_tokens`, if also set.
       * @type {number}
       * @default 0
       */
      min_length = 0;
      /**
       * The minimum number of tokens to generate, ignoring the number of tokens in the prompt.
       * @type {number}
       * @default null
       */
      min_new_tokens = null;
      /**
       * Controls the stopping condition for beam-based methods, like beam-search. It accepts the following values:
       * - `true`, where the generation stops as soon as there are `num_beams` complete candidates;
       * - `false`, where a heuristic is applied and the generation stops when it is very unlikely to find better candidates;
       * - `"never"`, where the beam search procedure only stops when there cannot be better candidates (canonical beam search algorithm).
       * @type {boolean|"never"}
       * @default false
       */
      early_stopping = !1;
      /**
       * The maximum time, in seconds, allowed for generation.
       * Generation will still finish the current pass after the allocated time has passed.
       * @type {number}
       * @default null
       */
      max_time = null;
      // Parameters that control the generation strategy used
      /**
       * Whether to use sampling; use greedy decoding otherwise.
       * @type {boolean}
       * @default false
       */
      do_sample = !1;
      /**
       * Number of beams for beam search. 1 means no beam search.
       * @type {number}
       * @default 1
       */
      num_beams = 1;
      /**
       * Number of groups to divide `num_beams` into to encourage diversity among different groups of beams.
       * See [this paper](https://huggingface.co/papers/1610.02424) for more details.
       * @type {number}
       * @default 1
       */
      num_beam_groups = 1;
      /**
       * Balance model confidence against the degeneration penalty during contrastive search decoding.
       * @type {number}
       * @default null
       */
      penalty_alpha = null;
      /**
       * Whether the model should reuse past key/value states, when supported, to speed up decoding.
       * @type {boolean}
       * @default true
       */
      use_cache = !0;
      // Parameters for manipulation of the model output logits
      /**
       * The value used to modulate the next token probabilities.
       * @type {number}
       * @default 1.0
       */
      temperature = 1;
      /**
       * The number of highest-probability vocabulary tokens to keep for top-k filtering.
       * @type {number}
       * @default 50
       */
      top_k = 50;
      /**
       * If set to a float below 1, only the smallest set of most probable tokens with probabilities that add up to `top_p` or higher are kept for generation.
       * @type {number}
       * @default 1.0
       */
      top_p = 1;
      /**
       * Local typicality measures how similar the conditional probability of predicting a target token next is to the expected conditional probability of predicting a random token next, given the partial text already generated.
       * If set to a float below 1, the smallest set of the most locally typical tokens with probabilities that add up to `typical_p` or higher are kept for generation.
       * See [this paper](https://huggingface.co/papers/2202.00666) for more details.
       * @type {number}
       * @default 1.0
       */
      typical_p = 1;
      /**
       * If set to a float strictly between 0 and 1, only tokens with a conditional probability greater than `epsilon_cutoff` will be sampled.
       * In the paper, suggested values range from 3e-4 to 9e-4, depending on the size of the model.
       * See [Truncation Sampling as Language Model Desmoothing](https://huggingface.co/papers/2210.15191) for more details.
       * @type {number}
       * @default 0.0
       */
      epsilon_cutoff = 0;
      /**
       * Eta sampling is a hybrid of locally typical sampling and epsilon sampling.
       * If set to a float strictly between 0 and 1, a token is only considered if it is greater than either `eta_cutoff` or `sqrt(eta_cutoff) * exp(-entropy(softmax(next_token_logits)))`.
       * The latter term is intuitively the expected next token probability, scaled by `sqrt(eta_cutoff)`. In the paper, suggested values range from 3e-4 to 2e-3, depending on the size of the model.
       * See [Truncation Sampling as Language Model Desmoothing](https://huggingface.co/papers/2210.15191) for more details.
       * @type {number}
       * @default 0.0
       */
      eta_cutoff = 0;
      /**
       * This value is subtracted from a beam's score if it generates the same token as any beam from another group at a particular time.
       * Note that `diversity_penalty` is only effective if `group beam search` is enabled.
       * @type {number}
       * @default 0.0
       */
      diversity_penalty = 0;
      /**
       * Penalty applied to repeated tokens. 1.0 means no penalty.
       * See [this paper](https://huggingface.co/papers/1909.05858) for more details.
       * @type {number}
       * @default 1.0
       */
      repetition_penalty = 1;
      /**
       * Penalty applied to sequences that are not in the original input.
       * 1.0 means no penalty.
       * @type {number}
       * @default 1.0
       */
      encoder_repetition_penalty = 1;
      /**
       * Exponential penalty applied to sequence length during beam-based generation.
       * It is applied as an exponent to the sequence length, which in turn is used to divide the score of the sequence.
       * Since the score is the log likelihood of the sequence (i.e. negative), `length_penalty` > 0.0 promotes longer sequences, while `length_penalty` < 0.0 encourages shorter sequences.
       * @type {number}
       * @default 1.0
       */
      length_penalty = 1;
      /**
       * If set to an integer greater than 0, all n-grams of that size can only occur once.
       * @type {number}
       * @default 0
       */
      no_repeat_ngram_size = 0;
      /**
       * List of token IDs that are not allowed to be generated.
       * In order to get the token IDs of the words that should not appear in the generated text, use
       * `tokenizer(bad_words, { add_prefix_space: true, add_special_tokens: false }).input_ids`.
       * @type {number[][]}
       * @default null
       */
      bad_words_ids = null;
      /**
       * List of token IDs that must be generated.
       * If given a `number[][]`, this is treated as a simple list of words that must be included, the opposite of `bad_words_ids`.
       * If given `number[][][]`, this triggers a [disjunctive constraint](https://github.com/huggingface/transformers/issues/14081), which allows different forms of each word.
       * @type {number[][]|number[][][]}
       * @default null
       */
      force_words_ids = null;
      /**
       * Whether to renormalize the logits after applying all the logits processors or warpers (including the custom ones).
       * It's highly recommended to set this flag to `true` because search algorithms assume the score logits are normalized, but some logit processors or warpers break the normalization.
       * @type {boolean}
       * @default false
       */
      renormalize_logits = !1;
      /**
       * Custom constraints that guide generation to include certain tokens as defined by `Constraint` objects.
       * @type {Object[]}
       * @default null
       */
      constraints = null;
      /**
       * The ID of the token to force as the first generated token after the `decoder_start_token_id`.
       * Useful for multilingual models like mBART where the first generated token needs to be the target language token.
       * @type {number}
       * @default null
       */
      forced_bos_token_id = null;
      /**
       * The ID of the token to force as the last generated token when `max_length` is reached.
       * Optionally, use a list to set multiple *end-of-sequence* tokens.
       * @type {number|number[]}
       * @default null
       */
      forced_eos_token_id = null;
      /**
       * Whether to remove possible *nan* and *inf* outputs of the model to prevent the generation method from crashing. Note that using `remove_invalid_values` can slow down generation.
       * @type {boolean}
       */
      remove_invalid_values = !1;
      /**
       * This tuple adds an exponentially increasing length penalty after a certain number of tokens have been generated.
       * The tuple consists of: `(start_index, decay_factor)` where `start_index` indicates where the penalty starts and `decay_factor` represents the factor of exponential decay.
       * @type {[number, number]}
       * @default null
       */
      exponential_decay_length_penalty = null;
      /**
       * A list of tokens to suppress during generation.
       * The `SuppressTokens` logit processor sets their log probabilities to `-inf` so that they are not sampled.
       * @type {number[]}
       * @default null
       */
      suppress_tokens = null;
      /**
       * Streamer used to yield generated text incrementally.
       * @type {import('./streamers.js').TextStreamer}
       * @default null
       */
      streamer = null;
      /**
       * A list of tokens to suppress at the beginning of the generation.
       * The `SuppressBeginTokens` logit processor sets their log probabilities to `-inf` so that they are not sampled.
       * @type {number[]}
       * @default null
       */
      begin_suppress_tokens = null;
      /**
       * A list of integer pairs that maps generation indices to token indices that will be forced before sampling.
       * For example, `[[1, 123]]` means the second generated token will always be a token of index 123.
       * @type {[number, number][]}
       * @default null
       */
      forced_decoder_ids = null;
      /**
       * The guidance scale for classifier-free guidance (CFG). CFG is enabled by setting `guidance_scale > 1`.
       * Higher guidance scale encourages the model to generate samples that are more closely tied to the input
       * prompt, usually at the expense of poorer quality.
       * @type {number}
       * @default null
       */
      guidance_scale = null;
      // Parameters that define the output variables of `generate`
      /**
       * The number of independently computed returned sequences for each element in the batch.
       * @type {number}
       * @default 1
       */
      num_return_sequences = 1;
      /**
       * Whether to return attention tensors from all attention layers.
       * See `attentions` under returned tensors for more details.
       * @type {boolean}
       * @default false
       */
      output_attentions = !1;
      /**
       * Whether to return the hidden states of all layers.
       * See `hidden_states` under returned tensors for more details.
       * @type {boolean}
       * @default false
       */
      output_hidden_states = !1;
      /**
       * Whether to return the prediction scores.
       * See `scores` under returned tensors for more details.
       * @type {boolean}
       * @default false
       */
      output_scores = !1;
      /**
       * Whether to return a `ModelOutput` instead of a plain tuple.
       * @type {boolean}
       * @default false
       */
      return_dict_in_generate = !1;
      // Special tokens that can be used at generation time
      /**
       * The ID of the *padding* token.
       * @type {number}
       * @default null
       */
      pad_token_id = null;
      /**
       * The ID of the *beginning-of-sequence* token.
       * @type {number}
       * @default null
       */
      bos_token_id = null;
      /**
       * The ID of the *end-of-sequence* token.
       * Optionally, use a list to set multiple *end-of-sequence* tokens.
       * @type {number|number[]}
       * @default null
       */
      eos_token_id = null;
      // Generation parameters exclusive to encoder-decoder models
      /**
       * If set to an integer greater than 0, all n-grams of that size that occur in the `encoder_input_ids` cannot occur in the `decoder_input_ids`.
       * @type {number}
       * @default 0
       */
      encoder_no_repeat_ngram_size = 0;
      /**
       * If an encoder-decoder model starts decoding with a token other than *bos*, the ID of that token.
       * @type {number}
       * @default null
       */
      decoder_start_token_id = null;
      // Wild card
      /**
       * Additional generation kwargs forwarded to the model's `generate` function.
       * Kwargs that are not present in `generate`'s signature are used in the model forward pass.
       * @type {Object}
       * @default {}
       */
      generation_kwargs = {};
      /**
       *
       * @param {GenerationConfig|import('../configs.js').PretrainedConfig} config
       */
      constructor(e) {
        Object.assign(this, Le(e, Object.getOwnPropertyNames(this)));
      }
    };
  });

  // node_modules/@huggingface/transformers/src/generation/stopping_criteria.js
  var Jn, Go, qo, Ho, qg = b(() => {
    ft();
    Jn = class extends ye {
      /**
       *
       * @param {number[][]} input_ids (`number[][]` of shape `(batch_size, sequence_length)`):
       * Indices of input sequence tokens in the vocabulary.
       * @param {number[][]} scores (`number[][]` of shape `(batch_size, config.vocab_size)`):
       * Prediction scores of a language modeling head. These can be scores for each vocabulary token before SoftMax
       * or scores for each vocabulary token after SoftMax.
       * @returns {boolean[]} A list of booleans indicating whether each sequence should be stopped.
       */
      _call(e, r) {
        throw Error("StoppingCriteria needs to be subclassed");
      }
    }, Go = class t extends ye {
      /**
       * Constructs a new instance of `StoppingCriteriaList`.
       */
      constructor() {
        super(), this.criteria = [];
      }
      /**
       * Adds a new stopping criterion to the list.
       *
       * @param {StoppingCriteria} item The stopping criterion to add.
       */
      push(e) {
        this.criteria.push(e);
      }
      /**
       * Adds multiple stopping criteria to the list.
       *
       * @param {StoppingCriteria|StoppingCriteriaList|StoppingCriteria[]} items The stopping criteria to add.
       */
      extend(e) {
        e instanceof t ? e = e.criteria : e instanceof Jn && (e = [e]), this.criteria.push(...e);
      }
      _call(e, r) {
        let n = new Array(e.length).fill(!1);
        for (let s of this.criteria) {
          let o = s(e, r);
          for (let i = 0; i < n.length; ++i)
            n[i] ||= o[i];
        }
        return n;
      }
      [Symbol.iterator]() {
        return this.criteria.values();
      }
    }, qo = class extends Jn {
      /**
       *
       * @param {number} max_length The maximum length that the output sequence can have in number of tokens.
       * @param {number} [max_position_embeddings=null] The maximum model length, as defined by the model's `config.max_position_embeddings` attribute.
       */
      constructor(e, r = null) {
        super(), this.max_length = e, this.max_position_embeddings = r;
      }
      _call(e) {
        return e.map((r) => r.length >= this.max_length);
      }
    }, Ho = class extends Jn {
      /**
       *
       * @param {number|number[]} eos_token_id The ID of the *end-of-sequence* token.
       * Optionally, use a list to set multiple *end-of-sequence* tokens.
       */
      constructor(e) {
        super(), Array.isArray(e) || (e = [e]), this.eos_token_id = e;
      }
      /**
       *
       * @param {number[][]} input_ids
       * @param {number[][]} scores
       * @returns {boolean[]}
       */
      _call(e, r) {
        return e.map((n) => {
          let s = n.at(-1);
          return this.eos_token_id.some((o) => s == o);
        });
      }
    };
  });

  // node_modules/@huggingface/transformers/src/generation/logits_sampler.js
  var mr, ju, Wu, Vu, Hg = b(() => {
    ft();
    we();
    ar();
    Is();
    Fu();
    mr = class extends ye {
      /**
       * Creates a new Sampler object with the specified generation config.
       * @param {GenerationConfig} generation_config The generation config.
       */
      constructor(e) {
        super(), this.generation_config = e;
      }
      /**
       * Executes the sampler, using the specified logits.
       * @param {Tensor} logits
       * @returns {Promise<[bigint, number][]>}
       */
      async _call(e) {
        return this.sample(e);
      }
      /**
       * Abstract method for sampling the logits.
       * @param {Tensor} logits
       * @throws {Error} If not implemented in subclass.
       * @returns {Promise<[bigint, number][]>}
       */
      async sample(e) {
        throw Error("sample should be implemented in subclasses.");
      }
      /**
       * Returns the specified logits as an array, with temperature applied.
       * @param {Tensor} logits
       * @param {number} index
       * @returns {Float32Array}
       */
      getLogits(e, r) {
        let n = e.dims.at(-1), s = (
          /** @type {Float32Array} */
          e.data
        );
        if (r === -1)
          s = s.slice(-n);
        else {
          let o = r * n;
          s = s.slice(o, o + n);
        }
        return s;
      }
      /**
       * Selects an item randomly based on the specified probabilities.
       * @param {Float32Array} probabilities An array of probabilities to use for selection.
       * @returns {number} The index of the selected item.
       */
      randomSelect(e) {
        return Ph(e);
      }
      /**
       * Returns a Sampler object based on the specified options.
       * @param {GenerationConfig} generation_config An object containing options for the sampler.
       * @returns {LogitsSampler} A Sampler object.
       */
      static getSampler(e) {
        if (e.do_sample)
          return new Wu(e);
        if (e.num_beams > 1)
          return new Vu(e);
        if (e.num_return_sequences > 1)
          throw Error(
            `num_return_sequences has to be 1 when doing greedy search, but is ${e.num_return_sequences}.`
          );
        return new ju(e);
      }
    }, ju = class extends mr {
      /**
       * Sample the maximum probability of a given logits tensor.
       * @param {Tensor} logits
       * @returns {Promise<[bigint, number][]>} An array with a single tuple, containing the index of the maximum value and a meaningless score (since this is a greedy search).
       */
      async sample(e) {
        let r = Fe(e.data)[1];
        return [[BigInt(r), 0]];
      }
    }, Wu = class extends mr {
      /**
       * Sample from the logits.
       * @param {Tensor} logits
       * @returns {Promise<[bigint, number][]>}
       */
      async sample(e) {
        let r = e.dims.at(-1);
        this.generation_config.top_k > 0 && (r = Math.min(this.generation_config.top_k, r));
        let [n, s] = await Cl(e, r), o = Vr(
          /** @type {Float32Array} */
          n.data
        );
        return Array.from({ length: this.generation_config.num_beams }, () => {
          let i = this.randomSelect(o);
          return [
            s.data[i],
            // token id
            Math.log(o[i])
            // score
          ];
        });
      }
    }, Vu = class extends mr {
      /**
       * Sample from the logits.
       * @param {Tensor} logits
       * @returns {Promise<[bigint, number][]>}
       */
      async sample(e) {
        let r = e.dims.at(-1);
        this.generation_config.top_k > 0 && (r = Math.min(this.generation_config.top_k, r));
        let [n, s] = await Cl(e, r), o = Vr(
          /** @type {Float32Array} */
          n.data
        );
        return Array.from({ length: this.generation_config.num_beams }, (i, a) => [
          s.data[a],
          // token id
          Math.log(o[a])
          // score
        ]);
      }
    };
  });

  // node_modules/@huggingface/transformers/src/cache_utils.js
  var Gu, qu, Yg = b(() => {
    we();
    Gu = class {
      /**
       * Create a DynamicCache, optionally pre-populated with entries.
       * @param {Record<string, Tensor>} [entries] Initial name→Tensor mappings.
       */
      constructor(e) {
        if (e)
          for (let r in e) {
            if (r in this)
              throw new TypeError(`Key "${r}" conflicts with an existing property on DynamicCache`);
            let n = e[r];
            if (!(n instanceof W))
              throw new TypeError(`Expected a Tensor for key "${r}", got ${typeof n}`);
            this[r] = n;
          }
      }
      /**
       * Get the cached sequence length. This requires at least one attention cache entry to be present.
       * @returns {number} The past sequence length.
       */
      get_seq_length() {
        let e = (
          /** @type {any} */
          this
        );
        if (Object.keys(e).length === 0)
          return 0;
        for (let r in e)
          if (r.startsWith("past_key_values."))
            return e[r].dims.at(-2);
        throw new Error("Unable to determine sequence length from the cache.");
      }
      /**
       * Update the cache in-place with new entries, disposing replaced GPU tensors.
       * @param {Record<string, Tensor>} newEntries The new name → Tensor mappings.
       */
      update(e) {
        for (let r in e) {
          let n = this[r], s = e[r];
          n && n !== s && n.location === "gpu-buffer" && n.dispose(), this[r] = s;
        }
      }
      /**
       * Dispose all contained tensors whose data resides on the GPU.
       * Returns a promise that resolves when all disposals are complete.
       * @returns {Promise<void>} Promise that resolves when all GPU tensors are disposed.
       */
      async dispose() {
        let e = [];
        for (
          let r of
          /** @type {Tensor[]} */
          Object.values(this)
        )
          r.location === "gpu-buffer" && e.push(r.dispose());
        await Promise.all(e);
      }
    }, qu = /** @type {new (entries?: Record<string, Tensor>) => DynamicCache} */
    /** @type {unknown} */
    Gu;
  });

  // node_modules/@huggingface/transformers/src/models/session_config.js
  function Xg(t, e, r = {}) {
    let n = It[t] ?? It.default;
    return {
      sessions: n.sessions(e, r, r.textOnly ?? !1),
      cache_sessions: n.cache_sessions,
      optional_configs: n.optional_configs
    };
  }
  var ee, It, Zn = b(() => {
    ee = {
      EncoderOnly: 0,
      EncoderDecoder: 1,
      Seq2Seq: 2,
      Vision2Seq: 3,
      DecoderOnly: 4,
      DecoderOnlyWithoutHead: 5,
      MaskGeneration: 6,
      ImageTextToText: 7,
      Musicgen: 8,
      MultiModality: 9,
      Phi3V: 10,
      AudioTextToText: 11,
      AutoEncoder: 12,
      ImageAudioTextToText: 13,
      Supertonic: 14,
      Chatterbox: 15,
      VoxtralRealtime: 16,
      MultimodalEncoder: 17
    }, It = {
      [ee.DecoderOnly]: {
        sessions: (t, e) => ({ model: e.model_file_name ?? "model" }),
        cache_sessions: { model: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.DecoderOnlyWithoutHead]: {
        sessions: (t, e) => ({ model: e.model_file_name ?? "model" })
      },
      [ee.Seq2Seq]: {
        sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.Vision2Seq]: {
        sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.Musicgen]: {
        sessions: () => ({
          model: "text_encoder",
          decoder_model_merged: "decoder_model_merged",
          encodec_decode: "encodec_decode"
        }),
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.EncoderDecoder]: {
        sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
        cache_sessions: { decoder_model_merged: !0 }
      },
      [ee.MaskGeneration]: {
        sessions: () => ({ model: "vision_encoder", prompt_encoder_mask_decoder: "prompt_encoder_mask_decoder" })
      },
      [ee.ImageTextToText]: {
        text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
        sessions: (t, e, r) => {
          let n = { ...It[ee.ImageTextToText].text_only_sessions };
          return r || (n.vision_encoder = "vision_encoder"), t.is_encoder_decoder && (n.model = "encoder_model"), n;
        },
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.AudioTextToText]: {
        text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
        sessions: (t, e, r) => {
          let n = { ...It[ee.AudioTextToText].text_only_sessions };
          return r || (n.audio_encoder = "audio_encoder"), n;
        },
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.ImageAudioTextToText]: {
        text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
        sessions: (t, e, r) => {
          let n = { ...It[ee.ImageAudioTextToText].text_only_sessions };
          return r || (n.audio_encoder = "audio_encoder", n.vision_encoder = "vision_encoder"), n;
        },
        cache_sessions: { decoder_model_merged: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.Phi3V]: {
        sessions: () => ({
          prepare_inputs_embeds: "prepare_inputs_embeds",
          model: "model",
          vision_encoder: "vision_encoder"
        }),
        cache_sessions: { model: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.MultiModality]: {
        sessions: () => ({
          prepare_inputs_embeds: "prepare_inputs_embeds",
          model: "language_model",
          lm_head: "lm_head",
          gen_head: "gen_head",
          gen_img_embeds: "gen_img_embeds",
          image_decode: "image_decode"
        }),
        cache_sessions: { model: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.AutoEncoder]: {
        sessions: () => ({ encoder_model: "encoder_model", decoder_model: "decoder_model" })
      },
      [ee.Supertonic]: {
        sessions: () => ({
          text_encoder: "text_encoder",
          latent_denoiser: "latent_denoiser",
          voice_decoder: "voice_decoder"
        })
      },
      [ee.Chatterbox]: {
        sessions: () => ({
          embed_tokens: "embed_tokens",
          speech_encoder: "speech_encoder",
          model: "language_model",
          conditional_decoder: "conditional_decoder"
        }),
        cache_sessions: { model: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.VoxtralRealtime]: {
        text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
        sessions: (t, e, r) => {
          let n = { ...It[ee.VoxtralRealtime].text_only_sessions };
          return r || (n.audio_encoder = "audio_encoder"), n;
        },
        cache_sessions: { decoder_model_merged: !0, audio_encoder: !0 },
        optional_configs: { generation_config: "generation_config.json" }
      },
      [ee.MultimodalEncoder]: {
        // The vision and audio encoders are only loaded when the config has their `vision_config` / `audio_config`
        sessions: (t, e) => ({
          model: e.model_file_name ?? "model",
          ...t.vision_config && { vision_encoder: "vision_encoder" },
          ...t.audio_config && { audio_encoder: "audio_encoder" }
        })
      },
      default: {
        sessions: (t, e) => ({ model: e.model_file_name ?? "model" })
      }
    };
  });

  // node_modules/@huggingface/transformers/src/utils/model_registry/resolve_model_type.js
  function Kg(t, { warn: e = !0 } = {}) {
    let r = (
      /** @type {string[]} */
      t.architectures || []
    );
    for (let n of r) {
      let s = Vt.get(n);
      if (s !== void 0)
        return s;
    }
    if (t.model_type) {
      let n = Vt.get(t.model_type);
      if (n !== void 0)
        return n;
      for (let s of Object.values(_r))
        if (s.has(t.model_type)) {
          let o = Vt.get(s.get(t.model_type));
          if (o !== void 0)
            return o;
        }
    }
    if (e) {
      let n = r.length > 0 ? r.join(", ") : "(none)";
      Q.warn(
        `[resolve_model_type] Architecture(s) not found in MODEL_TYPE_MAPPING: [${n}] for model type '${t.model_type}'. Falling back to EncoderOnly (single model.onnx file). If you encounter issues, please report at: ${Hr}`
      );
    }
    return ee.EncoderOnly;
  }
  var Jg = b(() => {
    Yo();
    Zn();
    Yr();
    Me();
  });

  // node_modules/@huggingface/transformers/src/utils/model_registry/get_model_files.js
  function k1(t, { config: e = null, cache_dir: r = null, local_files_only: n = !1, revision: s = "main" } = {}) {
    if (e !== null)
      return pr.from_pretrained(t, { config: e, cache_dir: r, local_files_only: n, revision: s });
    let o = Ur(t, { cache_dir: r, local_files_only: n, revision: s });
    return Rs(
      o,
      () => pr.from_pretrained(t, { config: e, cache_dir: r, local_files_only: n, revision: s })
    );
  }
  async function Zg(t, { config: e = null, dtype: r = null, device: n = null, model_file_name: s = null } = {}) {
    e = await k1(t, { config: e });
    let o = [
      // Add config.json (always loaded)
      "config.json"
    ], i = e["transformers.js_config"] ?? {}, a = i.use_external_data_format, l = "onnx", c = n ?? i.device, u = r ?? i.dtype, d = Kg(e), f = (m, _ = null) => {
      _ = _ ?? m;
      let g = js(c, m), w = Vs(u, m, g), y = Bn[w] ?? "", v = `${_}${y}.onnx`, k = l ? `${l}/${v}` : v;
      o.push(k);
      let C = Nu(a, v, m);
      for (let x of Du(v, C)) {
        let E = l ? `${l}/${x}` : x;
        o.push(E);
      }
    }, { sessions: h, optional_configs: p } = Xg(d, e, { model_file_name: s });
    for (let [m, _] of Object.entries(h))
      f(m, _);
    if (p)
      for (let m of Object.values(p))
        o.push(m);
    return o;
  }
  var Qg = b(() => {
    Fn();
    Ws();
    zu();
    Zn();
    Mo();
    Pn();
    fl();
    Jg();
  });

  // node_modules/@huggingface/transformers/src/models/modeling_utils.js
  function nw(t) {
    _r = t;
  }
  function Hu(t) {
    if (t instanceof W)
      return t;
    if (t.length === 0)
      throw Error("items must be non-empty");
    if (Array.isArray(t[0])) {
      if (t.some((e) => e.length !== t[0].length))
        throw Error(
          "Unable to create tensor, you should probably activate truncation and/or padding with 'padding=True' and/or 'truncation=True' to have batched tensors with the same length."
        );
      return new W("int64", BigInt64Array.from(t.flat().map((e) => BigInt(e))), [
        t.length,
        t[0].length
      ]);
    } else
      return new W("int64", BigInt64Array.from(t.map((e) => BigInt(e))), [1, t.length]);
  }
  function A1(t) {
    return new W("bool", [t], [1]);
  }
  function tw(t, e) {
    let r = Vt.get(t), n = !1, s = e?.architectures?.[0];
    if (s && s !== t && t?.endsWith("ForCausalLM") && s.endsWith("ForConditionalGeneration")) {
      let a = Vt.get(s);
      a !== void 0 && (r = a, n = !0);
    }
    let o = ew[r] ?? ew.default, i = It[r] ?? It.default;
    return { typeConfig: { ...o, ...i }, textOnly: n, modelType: r };
  }
  async function Xo(t, e) {
    let { encoder_outputs: r, input_ids: n, decoder_input_ids: s, decoder_attention_mask: o, ...i } = e;
    if (!r) {
      let a = Le(e, t.sessions.model.inputNames);
      r = (await an(t, a)).last_hidden_state;
    }
    return i.input_ids = s, i.encoder_hidden_states = r, t.sessions.decoder_model_merged.inputNames.includes("encoder_attention_mask") && (i.encoder_attention_mask = e.attention_mask), o && !i.attention_mask && (i.attention_mask = o), await ln(t, i, !0);
  }
  async function an(t, e) {
    let r = t.sessions.model, n = Le(e, r.inputNames);
    if (r.inputNames.includes("inputs_embeds") && !n.inputs_embeds) {
      if (!e.input_ids)
        throw new Error("Both `input_ids` and `inputs_embeds` are missing in the model inputs.");
      n.inputs_embeds = await t.encode_text({ input_ids: e.input_ids });
    }
    if (r.inputNames.includes("token_type_ids") && !n.token_type_ids) {
      if (!n.input_ids)
        throw new Error("Both `input_ids` and `token_type_ids` are missing in the model inputs.");
      n.token_type_ids = Ml(n.input_ids);
    }
    if (r.inputNames.includes("pixel_mask") && !n.pixel_mask) {
      if (!n.pixel_values)
        throw new Error("Both `pixel_values` and `pixel_mask` are missing in the model inputs.");
      let s = n.pixel_values.dims;
      n.pixel_mask = ot([s[0], s[2], s[3]]);
    }
    return await Oo(r, n);
  }
  async function T1(t, e) {
    let r = await t.encode(e);
    return await t.decode(r);
  }
  function rw(t, e) {
    let r = /* @__PURE__ */ Object.create(null);
    for (let n in t)
      if (n.startsWith("present")) {
        let s = n.replace("present_ssm", "past_ssm").replace("present_conv", "past_conv").replace("present_recurrent", "past_recurrent").replace("present_compressor", "past_compressor").replace("present_indexer", "past_indexer").replace("present", "past_key_values");
        n.includes("encoder") && e ? r[s] = e[s] : r[s] = t[n];
      }
    return e ? (e.update(r), e) : new qu(r);
  }
  function S1(t) {
    let e = {};
    for (let r of ["cross_attentions", "encoder_attentions", "decoder_attentions"])
      for (let n in t)
        n.startsWith(r) && (r in e || (e[r] = []), e[r].push(t[n]));
    return e;
  }
  function C1(t, e) {
    return t.map((r) => typeof r == "number" ? r : e[r] ?? 0);
  }
  function I1(t, e, r) {
    if (r && Object.keys(r).length > 0)
      return Object.assign(e, r), r;
    let n = t.sessions.decoder_model_merged ?? t.sessions.model, s = (e[t.main_input_name] ?? e.attention_mask)?.dims?.[0] ?? 1, o = Kn(t.config), i = t.config?.normalized_config?.num_heads, a = { batch_size: s };
    typeof i == "number" && (a["batch_size x num_heads"] = s * i);
    let l = /* @__PURE__ */ Object.create(null);
    for (let c of n.inputMetadata) {
      if (!o.has(c.name)) continue;
      let u = C1(c.shape, a), d = u.reduce((p, m) => p * m, 1), f = Un[c.type], h = new W(c.type, new f(d), u);
      e[c.name] = h, l[c.name] = h;
    }
    return r ? (r.update(l), r) : new qu(l);
  }
  function Xu(t, e, r) {
    if (e.num_logits_to_keep) return;
    (t.sessions.decoder_model_merged ?? t.sessions.model)?.inputNames.includes("num_logits_to_keep") && (e.num_logits_to_keep = new W("int64", [r], []));
  }
  async function ln(t, e, r = !1) {
    let n = t.sessions[r ? "decoder_model_merged" : "model"], { past_key_values: s, ...o } = e;
    if (n.inputNames.includes("use_cache_branch") && (o.use_cache_branch = A1(
      s != null && Object.keys(s).length > 0
    )), n.inputNames.includes("position_ids") && o.attention_mask && !o.position_ids) {
      let a = ["paligemma", "gemma3_text", "gemma3"].includes(t.config.model_type) ? 1 : 0;
      o.position_ids = L1(o, s, a);
    }
    Xu(t, o, 0n), I1(t, o, s);
    let i = Le(o, n.inputNames);
    return await Oo(n, i);
  }
  async function ow(t, {
    // Generic parameters:
    encode_function: e,
    merge_function: r,
    modality_input_names: n,
    modality_output_name: s,
    // Produced by the tokenizer/processor:
    input_ids: o = null,
    attention_mask: i = null,
    // Used during generation:
    position_ids: a = null,
    inputs_embeds: l = null,
    past_key_values: c = null,
    // Generic generation parameters
    generation_config: u = null,
    logits_processor: d = null,
    num_logits_to_keep: f = null,
    // Additional parameters
    ...h
  }) {
    if (!l) {
      l = await t.encode_text({ input_ids: o, ...h });
      let m = Le(h, n);
      if (Object.keys(m).length > 0) {
        if (o.dims[1] !== 1) {
          let _ = await e({
            // Pass the modality values under its expected key.
            // The caller knows whether this is audio or image.
            ...m,
            ...h
          });
          ({ inputs_embeds: l, attention_mask: i } = r({
            [s]: _,
            inputs_embeds: l,
            input_ids: o,
            attention_mask: i
          }));
        } else if (c && o.dims[1] === 1) {
          let _ = o.dims[1], g = c.get_seq_length();
          i = le(
            [
              ot([o.dims[0], g]),
              i.slice(null, [i.dims[1] - _, i.dims[1]])
            ],
            1
          );
        }
      }
    }
    if (!a && // Handle special case for qwen vl models
    [
      "qwen2_vl",
      "qwen2_vl_text",
      "qwen2_5_vl",
      "qwen2_5_vl_text",
      "qwen3_vl",
      "qwen3_vl_text",
      "qwen3_vl_moe",
      "qwen3_vl_moe_text",
      "qwen3_5",
      "qwen3_5_text",
      "qwen3_5_moe",
      "qwen3_5_moe_text",
      "glm_ocr",
      "glm_ocr_text"
    ].includes(t.config.model_type)) {
      let { image_grid_thw: m, video_grid_thw: _ } = h;
      [a] = t.get_rope_index(o, m, _, i);
    }
    return await ln(
      t,
      {
        inputs_embeds: l,
        past_key_values: c,
        attention_mask: i,
        position_ids: a,
        generation_config: u,
        logits_processor: d,
        num_logits_to_keep: f
      },
      !0
    );
  }
  async function M1(t, e) {
    return await ow(t, {
      ...e,
      modality_input_names: ["audio_values", "input_features"],
      modality_output_name: "audio_features",
      encode_function: t.encode_audio.bind(t),
      merge_function: t._merge_input_ids_with_audio_features.bind(t)
    });
  }
  async function O1(t, e) {
    return await ow(t, {
      ...e,
      modality_input_names: ["pixel_values"],
      modality_output_name: "image_features",
      encode_function: t.encode_image.bind(t),
      merge_function: t._merge_input_ids_with_image_features.bind(t)
    });
  }
  function P1(t, e = 0) {
    let [r, n] = t.dims, s = t.data, o = new BigInt64Array(s.length);
    for (let i = 0; i < r; ++i) {
      let a = i * n, l = BigInt(e);
      for (let c = 0; c < n; ++c) {
        let u = a + c;
        s[u] === 0n ? o[u] = BigInt(1) : (o[u] = l, l += s[u]);
      }
    }
    return { data: o, dims: t.dims };
  }
  function L1(t, e = null, r = 0) {
    let { input_ids: n, inputs_embeds: s, attention_mask: o } = t, { data: i, dims: a } = P1(o, r), l = new W("int64", i, a);
    if (e) {
      let c = -(n ?? s).dims.at(1);
      l = l.slice(null, [c, null]);
    }
    return l;
  }
  function Jo(t, e, r, n) {
    let s = r.past_key_values ? r.past_key_values.get_seq_length() : 0;
    if (Xu(t, r, 1n), !r.attention_mask) {
      let o;
      for (let i of ["input_ids", "inputs_embeds", "position_ids"])
        if (r[i]) {
          o = r[i].dims;
          break;
        }
      if (!o)
        throw new Error("attention_mask is not provided, and unable to infer its shape from model inputs.");
      r.attention_mask = ot([o[0], s + o[1]]);
    }
    if (r.past_key_values) {
      let { input_ids: o, attention_mask: i } = r;
      i && i.dims[1] > o.dims[1] || s < o.dims[1] && (r.input_ids = o.slice(null, [s, null]));
    }
    return r;
  }
  function Yu(t, e, r, n) {
    return r.past_key_values && (e = e.map((s) => [s.at(-1)])), Xu(t, r, 1n), {
      ...r,
      decoder_input_ids: Hu(e)
    };
  }
  function Ko(t, ...e) {
    return t.config.is_encoder_decoder ? Yu(t, ...e) : Jo(t, ...e);
  }
  async function R1(t, e, r) {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(e).map(async (n) => {
          let s = await Ke(t, e[n], !1, r);
          return [n, s];
        })
      )
    );
  }
  var _r, ew, Vt, sw, Qn, Zo, Yo = b(() => {
    ft();
    Vg();
    Mo();
    we();
    Fn();
    Yr();
    mt();
    Bu();
    Gg();
    Fu();
    qg();
    Hg();
    st();
    Bu();
    Me();
    Yg();
    Qg();
    $s();
    Zn();
    Zn();
    _r = null;
    ew = {
      [ee.DecoderOnly]: {
        can_generate: !0,
        forward: ln,
        prepare_inputs: Jo
      },
      [ee.DecoderOnlyWithoutHead]: {
        can_generate: !1,
        forward: ln,
        prepare_inputs: Jo
      },
      [ee.Seq2Seq]: {
        can_generate: !0,
        forward: Xo,
        prepare_inputs: Yu
      },
      [ee.Vision2Seq]: {
        can_generate: !0,
        forward: Xo,
        prepare_inputs: Yu
      },
      [ee.Musicgen]: {
        can_generate: !0,
        forward: Xo
      },
      [ee.EncoderDecoder]: {
        can_generate: !1,
        forward: Xo
      },
      [ee.ImageTextToText]: {
        can_generate: !0,
        forward: O1,
        prepare_inputs: Ko
      },
      [ee.AudioTextToText]: {
        can_generate: !0,
        forward: M1,
        prepare_inputs: Ko
      },
      [ee.ImageAudioTextToText]: {
        can_generate: !0,
        prepare_inputs: Ko
      },
      [ee.Phi3V]: {
        can_generate: !0,
        prepare_inputs: Ko
      },
      [ee.MultiModality]: {
        can_generate: !0
      },
      [ee.AutoEncoder]: {
        can_generate: !1,
        forward: T1
      },
      [ee.Chatterbox]: {
        can_generate: !0,
        forward: an
      },
      [ee.VoxtralRealtime]: {
        can_generate: !0,
        prepare_inputs: Jo
      },
      default: {
        can_generate: !1,
        forward: an
      }
    };
    Vt = /* @__PURE__ */ new Map(), sw = /* @__PURE__ */ new Map(), Qn = /* @__PURE__ */ new Map(), Zo = class extends ye {
      main_input_name = "input_ids";
      forward_params = ["input_ids", "attention_mask"];
      _return_dict_in_generate_keys = null;
      /**
       * Create a model from configuration and inference sessions.
       * @param {import('../configs.js').PretrainedConfig} config The model configuration.
       * @param {Record<string, any>} sessions The inference sessions for the model.
       * @param {Record<string, Object>} configs Additional configuration files (e.g., generation_config.json).
       */
      constructor(e, r, n) {
        super(), this.config = e, this.sessions = r, this.configs = n;
        let s = Qn.get(this.constructor), { typeConfig: o } = tw(s, e);
        this.can_generate = o.can_generate, this._forward = o.forward, this._prepare_inputs_for_generation = o.prepare_inputs, this.can_generate && this.forward_params.push("past_key_values"), this.custom_config = this.config["transformers.js_config"] ?? {};
      }
      /**
       * Disposes of all the ONNX sessions that were created during inference.
       * @returns {Promise<void[]>} Resolves after each session has been released.
       * @todo Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
       */
      async dispose() {
        let e = [];
        for (let r of Object.values(this.sessions))
          e.push(r.release?.());
        return await Promise.all(e);
      }
      /**
       * Instantiate one of the model classes of the library from a pretrained model.
       *
       * The model class to instantiate is selected based on the `model_type` property of the config object
       * (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
       *
       * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
       * - A string, the *model ID* of a pretrained model hosted inside a model repo on huggingface.co.
       *   Valid model IDs can be located at the root level, like `bert-base-uncased`, or namespaced under a
       *   user or organization name, like `dbmdz/bert-base-german-cased`.
       * - A path to a *directory* containing model weights, e.g., `./my_model_directory/`.
       * @param {import('../utils/hub.js').PretrainedModelOptions} options Additional options for loading the model.
       *
       * @returns {Promise<PreTrainedModel>} A model instance with ready inference sessions.
       */
      static async from_pretrained(e, {
        progress_callback: r = null,
        config: n = null,
        cache_dir: s = null,
        local_files_only: o = !1,
        revision: i = "main",
        model_file_name: a = null,
        subfolder: l = "onnx",
        device: c = null,
        dtype: u = null,
        use_external_data_format: d = null,
        session_options: f = {}
      } = {}) {
        let h = {
          progress_callback: r,
          config: n,
          cache_dir: s,
          local_files_only: o,
          revision: i,
          model_file_name: a,
          subfolder: l,
          device: c,
          dtype: u,
          use_external_data_format: d,
          session_options: f
        }, p = Qn.get(this);
        n = h.config = await pr.from_pretrained(e, h);
        let { typeConfig: m, textOnly: _, modelType: g } = tw(p, n);
        if (g === void 0) {
          let k = p ?? n?.model_type;
          k !== "custom" && Q.warn(
            `Model type for '${k}' not found, assuming encoder-only architecture. Please report this at ${Hr}.`
          );
        }
        if (r && !(r instanceof ir)) {
          let k = {};
          try {
            let C = await Zg(e, {
              config: n,
              dtype: u,
              device: c,
              model_file_name: a
            });
            (await Promise.all(
              C.map((E) => jr(e, E, h))
            )).forEach((E, O) => {
              if (E.exists) {
                let D = C[O] === "config.json";
                k[C[O]] = {
                  loaded: D ? E.size ?? 0 : 0,
                  total: E.size ?? 0
                };
              }
            });
          } catch (C) {
            Q.warn(`Unable to fetch model file metadata for total progress tracking: ${C}`);
          }
          Object.keys(k).length > 0 && (h.progress_callback = new ir(r, k));
        }
        let w = m.sessions(n, h, _), y = [
          jg(e, w, h, m.cache_sessions)
        ];
        m.optional_configs && y.push(R1(e, m.optional_configs, h));
        let v = await Promise.all(y);
        return new this(n, ...v);
      }
      /**
       * Runs the model with the provided inputs.
       * @param {Object} model_inputs Object containing input tensors.
       * @returns {Promise<Object>} Object containing output tensors.
       */
      async _call(e) {
        return await this.forward(e);
      }
      /**
       * Run the model's forward pass.
       * @param {Object} model_inputs The input data to the model in the format specified in the ONNX model.
       * @returns {Promise<Object>} The output data from the model in the format specified in the ONNX model.
       */
      async forward(e) {
        return await this._forward(this, e);
      }
      /**
       * Get the model's generation config, if it exists.
       * @returns {GenerationConfig|null} The model's generation config if it exists, otherwise `null`.
       */
      get generation_config() {
        return this.configs?.generation_config ?? null;
      }
      /**
       * @param {GenerationConfig} generation_config
       * @param {number} input_ids_seq_length The starting sequence length for the input ids.
       * @returns {LogitsProcessorList}
       * @private
       */
      _get_logits_processor(e, r, n = null) {
        let s = new Po();
        if (e.repetition_penalty !== null && e.repetition_penalty !== 1 && s.push(new zo(e.repetition_penalty)), e.no_repeat_ngram_size !== null && e.no_repeat_ngram_size > 0 && s.push(new Do(e.no_repeat_ngram_size)), e.bad_words_ids !== null && s.push(
          new Fo(e.bad_words_ids, e.eos_token_id)
        ), e.min_length !== null && e.eos_token_id !== null && e.min_length > 0 && s.push(new Bo(e.min_length, e.eos_token_id)), e.min_new_tokens !== null && e.eos_token_id !== null && e.min_new_tokens > 0 && s.push(
          new Uo(
            r,
            e.min_new_tokens,
            e.eos_token_id
          )
        ), e.forced_bos_token_id !== null && s.push(new Lo(e.forced_bos_token_id)), e.forced_eos_token_id !== null && s.push(
          new Ro(e.max_length, e.forced_eos_token_id)
        ), e.suppress_tokens !== null && s.push(new $o(e.suppress_tokens)), e.begin_suppress_tokens !== null) {
          let o = r > 1 || e.forced_bos_token_id === null ? r : r + 1;
          s.push(
            new No(e.begin_suppress_tokens, o)
          );
        }
        return e.guidance_scale !== null && e.guidance_scale > 1 && s.push(new jo(e.guidance_scale)), e.temperature === 0 && e.do_sample && (Q.warn(
          "`do_sample` changed to false because `temperature: 0` implies greedy sampling (always selecting the most likely token), which is incompatible with `do_sample: true`."
        ), e.do_sample = !1), e.do_sample && e.temperature !== null && e.temperature !== 1 && s.push(new Wo(e.temperature)), n !== null && s.extend(n), s;
      }
      /**
       * This function merges multiple generation configs together to form a final generation config to be used by the model for text generation.
       * It first creates an empty `GenerationConfig` object, then it applies the model's own `generation_config` property to it. Finally, if a `generation_config` object was passed in the arguments, it overwrites the corresponding properties in the final config with those of the passed config object.
       * @param {GenerationConfig|null} generation_config A `GenerationConfig` object containing generation parameters.
       * @param {Object} kwargs Additional generation parameters to be used in place of those in the `generation_config` object.
       * @returns {GenerationConfig} The final generation config object to be used by the model for text generation.
       */
      _prepare_generation_config(e, r, n = Vo) {
        let s = { ...this.config };
        for (let i of ["decoder", "generator", "text_config"])
          i in s && Object.assign(s, s[i]);
        let o = new n(s);
        return Object.assign(o, this.generation_config ?? {}), e && Object.assign(o, e), r && Object.assign(o, Le(r, Object.getOwnPropertyNames(o))), o;
      }
      /**
       *
       * @param {GenerationConfig} generation_config
       * @param {import('../generation/stopping_criteria.js').StoppingCriteria|import('../generation/stopping_criteria.js').StoppingCriteria[]|StoppingCriteriaList} [stopping_criteria=null]
       */
      _get_stopping_criteria(e, r = null) {
        let n = new Go();
        return e.max_length !== null && n.push(
          new qo(e.max_length, this.config.max_position_embeddings ?? null)
        ), e.eos_token_id !== null && n.push(new Ho(e.eos_token_id)), r && n.extend(r), n;
      }
      /**
       * Confirms that the model class is compatible with generation.
       * If not, raises an exception that points to the right class to use.
       */
      _validate_model_class() {
        if (!this.can_generate) {
          let e = [
            _r.MODEL_FOR_CAUSAL_LM_MAPPING_NAMES,
            // MODEL_MAPPING_NAMES.MODEL_FOR_CAUSAL_IMAGE_MODELING_MAPPING, // TODO
            _r.MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES,
            _r.MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES,
            _r.MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES
          ].filter(Boolean), r = Qn.get(this.constructor), n = /* @__PURE__ */ new Set(), s = this.config.model_type;
          for (let i of e) {
            let a = i?.get(s);
            a && n.add(a);
          }
          let o = `The current model class (${r}) is not compatible with \`.generate()\`, as it doesn't have a language model head.`;
          throw n.size > 0 && (o += ` Please use the following class instead: ${[...n].join(", ")}`), Error(o);
        }
      }
      prepare_inputs_for_generation(...e) {
        if (!this._prepare_inputs_for_generation)
          throw new Error("prepare_inputs_for_generation is not implemented for this model.");
        return this._prepare_inputs_for_generation(this, ...e);
      }
      /**
       *
       * @param {Object} inputs
       * @param {bigint[][]} inputs.generated_input_ids
       * @param {Object} inputs.outputs
       * @param {Object} inputs.model_inputs
       * @param {boolean} inputs.is_encoder_decoder
       * @returns {Object} The updated model inputs for the next generation iteration.
       */
      _update_model_kwargs_for_generation({ generated_input_ids: e, outputs: r, model_inputs: n, is_encoder_decoder: s }) {
        return n.past_key_values = rw(r, n.past_key_values), n.input_ids = new W("int64", e.flat(), [e.length, 1]), s ? "decoder_attention_mask" in n && (n.decoder_attention_mask = le(
          [n.decoder_attention_mask, ot([n.decoder_attention_mask.dims[0], 1])],
          1
        )) : n.attention_mask = le(
          [n.attention_mask, ot([n.attention_mask.dims[0], 1])],
          1
        ), n.position_ids = null, n;
      }
      /**
       * This function extracts the model-specific `inputs` for generation.
       * @param {Object} params
       * @param {Tensor} [params.inputs=null]
       * @param {number} [params.bos_token_id=null]
       * @param {Record<string, Tensor|number[]>} [params.model_kwargs]
       * @returns {{inputs_tensor: Tensor, model_inputs: Record<string, Tensor> & {past_key_values?: DynamicCache}, model_input_name: string}} The model-specific inputs for generation.
       */
      _prepare_model_inputs({ inputs: e, bos_token_id: r, model_kwargs: n }) {
        let s = Le(n, this.forward_params), o = this.main_input_name;
        if (o in s) {
          if (e)
            throw new Error(
              "`inputs`: {inputs}` were passed alongside {input_name} which is not allowed. Make sure to either pass {inputs} or {input_name}=..."
            );
        } else
          s[o] = e;
        return { inputs_tensor: s[o], model_inputs: s, model_input_name: o };
      }
      async _prepare_encoder_decoder_kwargs_for_generation({
        inputs_tensor: e,
        model_inputs: r,
        model_input_name: n,
        generation_config: s
      }) {
        if (this.sessions.model.inputNames.includes("inputs_embeds") && !r.inputs_embeds && "_prepare_inputs_embeds" in this) {
          let { input_ids: i, pixel_values: a, attention_mask: l, ...c } = r, u = await this._prepare_inputs_embeds(r);
          r = {
            ...c,
            ...Le(u, ["inputs_embeds", "attention_mask"])
          };
        }
        let { last_hidden_state: o } = await an(this, r);
        if (s.guidance_scale !== null && s.guidance_scale > 1)
          o = le([o, Dp(o, 0)], 0), "attention_mask" in r && (r.attention_mask = le(
            [r.attention_mask, Ml(r.attention_mask)],
            0
          ));
        else if (r.decoder_input_ids) {
          let i = Hu(r.decoder_input_ids).dims[0];
          if (i !== o.dims[0]) {
            if (o.dims[0] !== 1)
              throw new Error(
                `The encoder outputs have a different batch size (${o.dims[0]}) than the decoder inputs (${i}).`
              );
            o = le(
              Array.from({ length: i }, () => o),
              0
            );
          }
        }
        return r.encoder_outputs = o, r;
      }
      /**
       * Prepares `decoder_input_ids` for generation with encoder-decoder models
       * @param {*} param0
       */
      _prepare_decoder_input_ids_for_generation({
        batch_size: e,
        model_input_name: r,
        model_kwargs: n,
        decoder_start_token_id: s,
        bos_token_id: o,
        generation_config: i
      }) {
        let { decoder_input_ids: a, ...l } = n;
        if (!(a instanceof W)) {
          if (a)
            Array.isArray(a[0]) || (a = Array.from(
              {
                length: e
              },
              () => a
            ));
          else if (s ??= o, this.config.model_type === "musicgen")
            a = Array.from(
              {
                // @ts-expect-error TS2339
                length: e * this.config.decoder.num_codebooks
              },
              () => [s]
            );
          else if (Array.isArray(s)) {
            if (s.length !== e)
              throw new Error(
                `\`decoder_start_token_id\` expected to have length ${e} but got ${s.length}`
              );
            a = s;
          } else
            a = Array.from(
              {
                length: e
              },
              () => [s]
            );
          a = Hu(a);
        }
        return l.decoder_attention_mask = zp(a), { input_ids: a, model_inputs: l };
      }
      /**
       * Generate token sequences with a language-modeling head.
       * @param {import('../generation/parameters.js').GenerationFunctionParameters} options
       * @returns {Promise<ModelOutput|Tensor>} The output of the model, which can contain the generated token ids, attentions, and scores.
       */
      async generate({
        inputs: e = null,
        generation_config: r = null,
        logits_processor: n = null,
        stopping_criteria: s = null,
        streamer: o = null,
        // inputs_attention_mask = null,
        ...i
      }) {
        this._validate_model_class(), r = this._prepare_generation_config(r, i);
        let { inputs_tensor: a, model_inputs: l, model_input_name: c } = this._prepare_model_inputs({
          inputs: e,
          model_kwargs: (
            /** @type {Record<string, Tensor|number[]>} */
            i
          )
        }), u = this.config.is_encoder_decoder;
        u && ("encoder_outputs" in l || (l = await this._prepare_encoder_decoder_kwargs_for_generation({
          inputs_tensor: a,
          model_inputs: l,
          model_input_name: c,
          generation_config: r
        })));
        let d;
        u ? { input_ids: d, model_inputs: l } = this._prepare_decoder_input_ids_for_generation({
          batch_size: l[c].dims.at(0),
          model_input_name: c,
          model_kwargs: l,
          decoder_start_token_id: r.decoder_start_token_id,
          bos_token_id: r.bos_token_id,
          generation_config: r
        }) : d = l[c];
        let f = d.dims.at(-1);
        r.max_new_tokens !== null && (r.max_length = f + r.max_new_tokens);
        let h = this._get_logits_processor(
          r,
          f,
          n
        ), p = this._get_stopping_criteria(r, s), m = l[c].dims.at(0), _ = mr.getSampler(r), g = new Array(m).fill(0), w = d.tolist();
        o && o.put(w);
        let y, v = {}, k = {};
        for (; ; ) {
          if (l = this.prepare_inputs_for_generation(w, l, r), y = await this.forward(l), r.return_dict_in_generate)
            if (r.output_attentions) {
              let I = S1(y);
              for (let S in I)
                S in v || (v[S] = []), v[S].push(I[S]);
            } else this._return_dict_in_generate_keys && Object.assign(k, Le(y, this._return_dict_in_generate_keys));
          let D = y.logits.slice(null, -1, null).to("float32"), z = h(w, D), B = [];
          for (let I = 0; I < z.dims.at(0); ++I) {
            let S = z[I], F = await _(S);
            for (let [$, Z] of F) {
              let K = BigInt($);
              g[I] += Z, w[I].push(K), B.push([K]);
              break;
            }
          }
          if (o && o.put(B), p(w).every((I) => I))
            break;
          l = this._update_model_kwargs_for_generation({
            generated_input_ids: B,
            outputs: y,
            model_inputs: l,
            is_encoder_decoder: u
          });
        }
        o && o.end();
        let C = new W("int64", w.flat(), [w.length, w[0].length]), x = rw(y, l.past_key_values), E = new Set(Object.values(x));
        for (let D of Object.values(y))
          D.location === "gpu-buffer" && !E.has(D) && D.dispose();
        return "past_key_values" in i || r.return_dict_in_generate || await x.dispose(), r.return_dict_in_generate ? {
          sequences: C,
          past_key_values: x,
          ...v,
          ...k
          // TODO:
          // scores,
          // logits,
        } : C;
      }
      /**
       * Helper function to select valid inputs and run through the appropriate encoder (vision, text, audio) based on the input type.
       * @param {string} sessionName
       * @param {Record<string, Tensor>} inputs
       * @param {string} outputName
       * @private
       */
      async _encode_input(e, r, n) {
        if (!Object.hasOwn(this.sessions, e))
          throw new Error(`Model does not have a ${e} session.`);
        let s = this.sessions[e];
        return (await Oo(s, Le(r, s.inputNames)))[n];
      }
      /**
       * Encode image inputs into features for multimodal generation.
       * @param {any} inputs Vision encoder inputs.
       * @returns {Promise<any>} Image features.
       * @internal
       */
      async encode_image(e) {
        return this._encode_input("vision_encoder", e, "image_features");
      }
      /**
       * Encode token ids into embeddings for multimodal generation.
       * @param {any} inputs Text encoder inputs.
       * @returns {Promise<any>} Text embeddings.
       * @internal
       */
      async encode_text(e) {
        return this._encode_input("embed_tokens", e, "inputs_embeds");
      }
      /**
       * Encode audio inputs into features for multimodal generation.
       * @param {any} inputs Audio encoder inputs.
       * @returns {Promise<any>} Audio features.
       * @internal
       */
      async encode_audio(e) {
        return this._encode_input("audio_encoder", e, "audio_features");
      }
    };
  });

  // node_modules/@huggingface/transformers/src/models/florence2/modeling_florence2.js
  var Ku, gr, iw = b(() => {
    Yo();
    we();
    Ku = class extends Zo {
      forward_params = [
        // Encoder inputs
        "input_ids",
        "inputs_embeds",
        "attention_mask",
        "pixel_values",
        // Decoder inputs
        "encoder_outputs",
        "decoder_input_ids",
        "decoder_inputs_embeds",
        "decoder_attention_mask",
        "past_key_values"
      ];
      main_input_name = "inputs_embeds";
    }, gr = class extends Ku {
      _merge_input_ids_with_image_features({ inputs_embeds: e, image_features: r, input_ids: n, attention_mask: s }) {
        return {
          inputs_embeds: le(
            [
              r,
              // image embeds
              e
              // task prefix embeds
            ],
            1
          ),
          attention_mask: le(
            [
              ot(r.dims.slice(0, 2)),
              // image attention mask
              s
              // task prefix attention mask
            ],
            1
          )
        };
      }
      async _prepare_inputs_embeds({ input_ids: e, pixel_values: r, inputs_embeds: n, attention_mask: s }) {
        if (!e && !r)
          throw new Error("Either `input_ids` or `pixel_values` should be provided.");
        let o, i;
        return e && (o = await this.encode_text({ input_ids: e })), r && (i = await this.encode_image({ pixel_values: r })), o && i ? { inputs_embeds: n, attention_mask: s } = this._merge_input_ids_with_image_features({
          inputs_embeds: o,
          image_features: i,
          input_ids: e,
          attention_mask: s
        }) : n = o || i, { inputs_embeds: n, attention_mask: s };
      }
      async forward({
        input_ids: e,
        pixel_values: r,
        attention_mask: n,
        decoder_input_ids: s,
        decoder_attention_mask: o,
        encoder_outputs: i,
        past_key_values: a,
        inputs_embeds: l,
        decoder_inputs_embeds: c,
        num_logits_to_keep: u = null
      }) {
        if (l || ({ inputs_embeds: l, attention_mask: n } = await this._prepare_inputs_embeds({
          input_ids: e,
          pixel_values: r,
          inputs_embeds: l,
          attention_mask: n
        })), !i) {
          let { last_hidden_state: f } = await an(this, { inputs_embeds: l, attention_mask: n });
          i = f;
        }
        if (!c) {
          if (!s)
            throw new Error("Either `decoder_input_ids` or `decoder_inputs_embeds` should be provided.");
          c = await this.encode_text({ input_ids: s });
        }
        return await ln(this, {
          inputs_embeds: c,
          attention_mask: o,
          encoder_attention_mask: n,
          encoder_hidden_states: i,
          past_key_values: a,
          num_logits_to_keep: u
        }, !0);
      }
    };
  });

  // app/ai-transformers.mjs
  var Qo, aw = b(() => {
    Ie();
    Xs();
    Bg();
    iw();
    Yo();
    Qo = "Florence2ForConditionalGeneration";
    Vt.set(Qo, ee.ImageTextToText);
    Qn.set(gr, Qo);
    sw.set(Qo, gr);
    nw({
      MODEL_FOR_IMAGE_TEXT_TO_TEXT_MAPPING_NAMES: /* @__PURE__ */ new Map([["florence2", Qo]]),
      MODEL_FOR_CAUSAL_LM_MAPPING_NAMES: /* @__PURE__ */ new Map(),
      MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES: /* @__PURE__ */ new Map(),
      MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES: /* @__PURE__ */ new Map(),
      MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES: /* @__PURE__ */ new Map()
    });
  });

  // app/ai-vision.mjs
  var pw = {};
  br(pw, {
    VISION_MODELS: () => xr,
    decodeDocLayoutOutput: () => fw,
    prepareDocLayoutInput: () => dw,
    runVisionModel: () => B1
  });
  function Mt(t) {
    if (t?.aborted) throw new DOMException("Model run cancelled", "AbortError");
  }
  function uw(t) {
    if (!Number.isSafeInteger(t?.width) || !Number.isSafeInteger(t?.height) || t.width <= 0 || t.height <= 0)
      throw new Error("Vision model needs a nonempty canvas");
    if (typeof t.getContext != "function") throw new Error("Vision model needs a readable canvas");
  }
  function $1(t) {
    let e = Math.abs(t), r = -0.75;
    return e <= 1 ? (r + 2) * e ** 3 - (r + 3) * e ** 2 + 1 : e < 2 ? r * e ** 3 - 5 * r * e ** 2 + 8 * r * e - 4 * r : 0;
  }
  function cw(t) {
    return Array.from({ length: Ge }, (e, r) => {
      let n = (r + 0.5) * t / Ge - 0.5, s = Math.floor(n) - 1;
      return Array.from({ length: 4 }, (o, i) => ({
        index: wr(s + i, 0, t - 1),
        weight: $1(n - s - i)
      }));
    });
  }
  function dw(t) {
    uw(t);
    let { width: e, height: r } = t, n = t.getContext("2d", { willReadFrequently: !0 })?.getImageData(0, 0, e, r)?.data;
    if (!n || n.length !== e * r * 4) throw new Error("Cannot read canvas pixels for DocLayout");
    let s = Ge * Ge, o = new Float32Array(s * 3), i = cw(e), a = cw(r);
    for (let l = 0; l < Ge; l++)
      for (let c = 0; c < Ge; c++) {
        let u = l * Ge + c;
        for (let d = 0; d < 3; d++) {
          let f = 0;
          for (let h of a[l]) for (let p of i[c])
            f += n[4 * (h.index * e + p.index) + d] * h.weight * p.weight;
          o[d * s + u] = wr(Math.round(f), 0, 255) / 255;
        }
      }
    return {
      data: o,
      dims: [1, 3, Ge, Ge],
      imShape: [Ge, Ge],
      scaleFactor: [Ge / r, Ge / e]
    };
  }
  function wr(t, e, r) {
    return Math.max(e, Math.min(r, t));
  }
  function fw(t, e, r) {
    let n = t?.fetch_name_0, s = t?.fetch_name_1, o = t?.fetch_name_2;
    if (!n || !s || !o || n.dims?.at(-1) !== 7 || s.dims?.length !== 1 || o.dims?.at(-1) !== 200)
      throw new Error("Unsupported PP-DocLayoutV3 ONNX output signature");
    let i = Number(s.data?.[0]);
    if (!Number.isInteger(i) || i < 0 || i > n.data.length / 7) throw new Error("Invalid PP-DocLayoutV3 box count");
    let a = [];
    for (let l = 0; l < i; l++) {
      let [c, u, d, f, h, p, m] = n.data.subarray(l * 7, l * 7 + 7);
      if (!Number.isInteger(c) || !lw[c] || !Number.isFinite(u) || u < 0.5 || ![d, f, h, p].every(Number.isFinite)) continue;
      let _ = wr(Math.min(d, h), 0, e), g = wr(Math.max(d, h), 0, e), w = wr(Math.min(f, p), 0, r), y = wr(Math.max(f, p), 0, r);
      if (g <= _ || y <= w) continue;
      let v = {
        kind: "region",
        label: lw[c],
        confidence: wr(u, 0, 1),
        bbox: { x0: _, y0: w, x1: g, y1: y },
        reviewRequired: !0
      };
      Number.isInteger(m) && m >= 0 && (v.readingOrder = m), a.push(v);
    }
    return a;
  }
  function N1(t, e) {
    if (!e || typeof e != "object") throw new Error("Missing verified local model files");
    for (let r of t.files) {
      let s = e[r.name]?.byteLength;
      if (!s) throw new Error(`Missing verified local model file: ${r.name}`);
      if (s !== r.bytes) throw new Error(`Local model file size mismatch: ${r.name}`);
    }
  }
  function hw(t) {
    if (t instanceof Uint8Array) return t;
    if (t instanceof ArrayBuffer) return new Uint8Array(t);
    throw new Error("Vision model files must be verified ArrayBuffers or Uint8Arrays");
  }
  async function D1(t, e) {
    let { files: r, signal: n, onProgress: s, assetBase: o } = e;
    if (typeof WebAssembly > "u") throw new Error("PP-DocLayoutV3 needs WebAssembly in this browser");
    Mt(n), s?.({ stage: "preprocessing", modelId: "pp-doclayout-v3" });
    let i = dw(t);
    Mt(n);
    let a = await Promise.resolve().then(() => (Cr(), vt));
    a.env.wasm.wasmPaths = new URL(o, globalThis.document?.baseURI ?? globalThis.location?.href ?? "http://localhost/").href, a.env.wasm.numThreads = 1, a.env.wasm.proxy = !1;
    let l;
    try {
      l = await a.InferenceSession.create(hw(r["PP-DocLayoutV3.onnx"]), { executionProviders: ["wasm"] });
      let c = [...l.inputNames].sort().join(",");
      if (c !== "im_shape,image,scale_factor") throw new Error(`Unsupported PP-DocLayoutV3 ONNX input signature: ${c}`);
      Mt(n), s?.({ stage: "inferencing", modelId: "pp-doclayout-v3" });
      let u = await l.run({
        image: new a.Tensor("float32", i.data, i.dims),
        im_shape: new a.Tensor("float32", Float32Array.from(i.imShape), [1, 2]),
        scale_factor: new a.Tensor("float32", Float32Array.from(i.scaleFactor), [1, 2])
      });
      Mt(n);
      let d = fw(u, t.width, t.height);
      return {
        modelId: "pp-doclayout-v3",
        kind: "layout",
        width: t.width,
        height: t.height,
        proposals: d,
        reviewRequired: !0
      };
    } finally {
      await l?.release();
    }
  }
  async function z1(t, e) {
    let { files: r, signal: n, onProgress: s, assetBase: o } = e;
    if (typeof WebAssembly > "u") throw new Error("Florence-2 needs WebAssembly in this browser");
    Mt(n);
    let i = xr["florence2-base"], a = new Map(i.files.map((p) => [p.path, hw(r[p.name])])), l = i.files[0].revision, c = i.files[0].repo, u = `https://huggingface.co/${c}/resolve/${l}/`, d = {
      async match(p) {
        let m = String(p), _ = m.startsWith(u) ? m.slice(u.length) : null;
        if (_ === null) {
          let w = `${j.localModelPath}${c}/`;
          m.startsWith(w) && (_ = m.slice(w.length));
        }
        let g = a.get(_);
        return g ? new Response(g.slice(), { headers: { "content-length": String(g.byteLength) } }) : void 0;
      },
      async put() {
        throw new Error("Florence model cache is read only");
      }
    }, f = {
      allowRemoteModels: j.allowRemoteModels,
      allowLocalModels: j.allowLocalModels,
      useCustomCache: j.useCustomCache,
      customCache: j.customCache,
      useBrowserCache: j.useBrowserCache,
      useFSCache: j.useFSCache,
      wasmPaths: j.backends.onnx?.wasm?.wasmPaths
    };
    j.allowRemoteModels = !1, j.allowLocalModels = !0, j.useCustomCache = !0, j.customCache = d, j.useBrowserCache = !1, j.useFSCache = !1, j.backends.onnx.wasm.wasmPaths = new URL(o, globalThis.document?.baseURI ?? globalThis.location?.href ?? "http://localhost/").href, j.backends.onnx.wasm.numThreads = 1, j.backends.onnx.wasm.proxy = !1;
    let h;
    try {
      let p = { revision: l, local_files_only: !0 };
      s?.({ stage: "loading", modelId: "florence2-base" });
      let m = await Yn.from_pretrained(c, p);
      Mt(n), h = await gr.from_pretrained(c, { ...p, dtype: "q8", device: "wasm" }), Mt(n);
      let _ = await Bt.read(t), g = "<MORE_DETAILED_CAPTION>", w = await m(_, m.construct_prompts(g));
      s?.({ stage: "inferencing", modelId: "florence2-base" });
      let y = await h.generate({ ...w, max_new_tokens: 100 });
      Mt(n);
      let v = m.batch_decode(y, { skip_special_tokens: !1 })[0], k = m.post_process_generation(v, g, _.size), C = String(k[g] ?? "").trim();
      return {
        modelId: "florence2-base",
        kind: "caption",
        width: t.width,
        height: t.height,
        proposals: C ? [{ kind: "text", text: C, confidence: null, bbox: null, reviewRequired: !0 }] : [],
        text: C,
        reviewRequired: !0
      };
    } finally {
      await h?.dispose(), Object.assign(j, {
        allowRemoteModels: f.allowRemoteModels,
        allowLocalModels: f.allowLocalModels,
        useCustomCache: f.useCustomCache,
        customCache: f.customCache,
        useBrowserCache: f.useBrowserCache,
        useFSCache: f.useFSCache
      }), f.wasmPaths !== void 0 && (j.backends.onnx.wasm.wasmPaths = f.wasmPaths);
    }
  }
  async function B1(t, e, { files: r, signal: n, onProgress: s, assetBase: o = "./ai/" } = {}) {
    let i = xr[t];
    if (!i) throw new Error(`Unknown vision model: ${t}`);
    return Mt(n), N1(i, r), uw(e), t === "pp-doclayout-v3" ? D1(e, { files: r, signal: n, onProgress: s, assetBase: o }) : z1(e, { files: r, signal: n, onProgress: s, assetBase: o });
  }
  var Ge, lw, mw = b(() => {
    ri();
    aw();
    Ge = 800, lw = "abstract algorithm aside_text chart content display_formula doc_title figure_title footer footer_image footnote formula_number header header_image image inline_formula number paragraph_title reference reference_content seal table text vertical_text vision_footnote".split(" ");
  });

  // app/ai-entry.mjs
  var J1 = {};
  br(J1, {
    clearModel: () => K1,
    createAIEngine: () => bw,
    createOCRWorker: () => Y1,
    decodeTableOutput: () => yw,
    downloadModel: () => V1,
    listModels: () => j1,
    loadLocalModelBytes: () => W1,
    modelStatus: () => X1,
    restoreModel: () => G1,
    runModel: () => q1,
    unloadModel: () => H1
  });

  // app/ai-models.mjs
  ri();
  var Ow = "snowfluke/ppu-paddle-ocr-models", Pw = "3cbb26882389013ed863b66a78e52376b5ff0f0a";
  function vr(t, e, r, n, s = Ow, o = Pw) {
    return Object.freeze({ name: t, path: e, bytes: r, sha256: n, repo: s, revision: o, url: `https://huggingface.co/${s}/resolve/${o}/${e}` });
  }
  var Lw = [
    {
      id: "pp-ocrv6-tiny",
      label: "PP-OCRv6 Tiny",
      kind: "ocr",
      license: "Apache-2.0",
      bundled: !0,
      description: "Read text and propose text boxes. Does not infer electrical connections.",
      files: [
        vr("PP-OCRv6_tiny_det.onnx", "detection/PP-OCRv6_tiny_det.onnx", 1780590, "193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8"),
        vr("PP-OCRv6_tiny_rec.onnx", "recognition/PP-OCRv6_tiny_rec.onnx", 4462639, "9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6"),
        vr("ppocrv6_tiny_dict.txt", "recognition/ppocrv6_tiny_dict.txt", 27157, "2f3717bbd530b681b6db3be35cc485e8a41a932b9558b833986bf0894eb21f2d")
      ]
    },
    {
      id: "pp-lcnet-orientation",
      label: "PP-LCNet page orientation",
      kind: "orientation",
      license: "Apache-2.0",
      bundled: !1,
      description: "Suggest a quarter-turn correction for a document photo.",
      files: [vr("PP-LCNet_x1_0_doc_ori.onnx", "correction/PP-LCNet_x1_0_doc_ori.onnx", 6715311, "d85b3185075afca1a83157f73eac2e52b598d72e9d47dd19cc4a2f3605e23e3f")]
    },
    {
      id: "uvdoc-unwarp",
      label: "UVDoc page unwarping",
      kind: "unwarp",
      license: "Apache-2.0",
      bundled: !1,
      dependencies: ["pp-ocrv6-tiny"],
      description: "Preview a flattened photographed page. The correction can crop edges; review before use.",
      files: [vr("UVDoc_grid.onnx", "correction/UVDoc_grid.onnx", 31587333, "5f7c399b3ecd8c9ba965cfa0a8ec5f5dd6e3ca6deef7b61a47b1b10dea54f168")]
    },
    {
      id: "table-transformer",
      label: "Table Transformer",
      kind: "table",
      license: "MIT",
      bundled: !1,
      description: "Propose rows, columns and spanning regions in a selected table crop. Does not read cell text.",
      files: [vr("model_quantized.onnx", "onnx/model_quantized.onnx", 30178496, "83841e84bedb3af591a07888cf518333c88055ae0ab7bbd936c9289c5d8da82b", "Xenova/table-transformer-structure-recognition-v1.1-all", "76c3afa174a0f36bafa9438934f57dcdb6e486a5")]
    }
  ], ni = Object.freeze([...Lw, ...Object.values(xr)].map((t) => Object.freeze({ ...t, files: Object.freeze(t.files), bytes: t.files.reduce((e, r) => e + r.bytes, 0), source: `https://huggingface.co/${t.files[0].repo}`, reviewRequired: !0 })));
  function wt(t) {
    let e = ni.find((r) => r.id === t);
    if (!e) throw new Error(`Unknown model: ${t}`);
    return e;
  }

  // app/ai-engine.mjs
  var gt = (t) => {
    if (t?.aborted) throw new DOMException("AI operation cancelled", "AbortError");
  }, yr = (t, e, r = {}) => t?.({ stage: e, ...r }), ei = (t, e, r) => Math.max(e, Math.min(r, t));
  function gw(t) {
    let e = Math.max(...t), r = Array.from(t, (s) => Math.exp(s - e)), n = r.reduce((s, o) => s + o, 0);
    return r.map((s) => s / n);
  }
  async function U1(t) {
    if (t instanceof ArrayBuffer) return t.slice(0);
    if (ArrayBuffer.isView(t)) return t.buffer.slice(t.byteOffset, t.byteOffset + t.byteLength);
    if (t?.arrayBuffer) return t.arrayBuffer();
    throw new TypeError("Provide model files as ArrayBuffer, typed array, or File.");
  }
  async function F1(t, e) {
    let r = await U1(e);
    if (r.byteLength !== t.bytes) throw new Error(`Model size mismatch: ${t.name}; expected ${t.bytes} bytes.`);
    if (!globalThis.crypto?.subtle) throw new Error("Model verification requires a secure context (HTTPS or localhost).");
    if (Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", r)), (s) => s.toString(16).padStart(2, "0")).join("") !== t.sha256) throw new Error(`Model checksum mismatch: ${t.name}.`);
    return r;
  }
  function ww(t, e) {
    if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(t, e);
    if (typeof document > "u") throw new Error("AI image processing requires browser canvas support.");
    let r = document.createElement("canvas");
    return r.width = t, r.height = e, r;
  }
  function _w(t, e, r, n) {
    let s = ww(e, r), o = s.getContext("2d", { willReadFrequently: !0 });
    o.fillStyle = "#fff", o.fillRect(0, 0, e, r), n ? o.drawImage(t, ...n, 0, 0, e, r) : o.drawImage(t, 0, 0, e, r);
    let i = o.getImageData(0, 0, e, r).data, a = new Float32Array(3 * e * r), l = [0.485, 0.456, 0.406], c = [0.229, 0.224, 0.225];
    for (let u = 0; u < e * r; u++) for (let d = 0; d < 3; d++) a[d * e * r + u] = (i[4 * u + d] / 255 - l[d]) / c[d];
    return a;
  }
  function yw(t, e, r, n = 0.5) {
    let s = t.logits, o = t.pred_boxes;
    if (!s || !o || s.dims.at(-1) !== 7 || o.dims.at(-1) !== 4) throw new Error("Unexpected Table Transformer output schema.");
    let i = ["table", "table column", "table row", "table column header", "table projected row header", "table spanning cell"], a = [];
    for (let l = 0; l < s.data.length / 7; l++) {
      let c = gw(s.data.slice(l * 7, (l + 1) * 7)), u = c.indexOf(Math.max(...c));
      if (u === 6 || c[u] < n) continue;
      let [d, f, h, p] = o.data.slice(l * 4, (l + 1) * 4), m = { x0: ei((d - h / 2) * e, 0, e), y0: ei((f - p / 2) * r, 0, r), x1: ei((d + h / 2) * e, 0, e), y1: ei((f + p / 2) * r, 0, r) };
      m.x1 > m.x0 && m.y1 > m.y0 && a.push({ kind: "region", label: i[u], confidence: c[u], bbox: m, reviewRequired: !0 });
    }
    return a;
  }
  function bw({ assetBase: t = "./ai/", fetchImpl: e = globalThis.fetch?.bind(globalThis), indexedDB: r = globalThis.indexedDB } = {}) {
    let n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), o, i, a = !1, l = () => new URL(t, globalThis.document?.baseURI || globalThis.location?.href || "http://localhost/").href;
    async function c() {
      return r ? (i || (i = new Promise((x, E) => {
        let O = r.open("carpe-noctum-ai-models-v1", 1);
        O.onupgradeneeded = () => O.result.createObjectStore("packs"), O.onsuccess = () => x(O.result), O.onerror = () => E(O.error);
      })), i) : null;
    }
    async function u(x, E) {
      let O = await c();
      return O ? new Promise((D, z) => {
        let B = O.transaction("packs", E === void 0 ? "readonly" : "readwrite"), P = B.objectStore("packs"), I = E === void 0 ? P.get(x) : E === null ? P.delete(x) : P.put(E, x), S;
        I.onsuccess = () => {
          S = I.result;
        }, B.oncomplete = () => D(S), B.onerror = () => z(B.error), B.onabort = () => z(B.error || new Error("Model cache transaction aborted."));
      }) : null;
    }
    async function d() {
      return o || (o = (async () => {
        let x = await Promise.resolve().then(() => (Cr(), vt));
        return x.env.wasm.wasmPaths = l(), x.env.wasm.numThreads = 1, x.env.wasm.proxy = !1, x;
      })()), o;
    }
    function f(x) {
      let E = n.get(x);
      if (!E) throw new Error(`Load the ${wt(x).label} model pack before running it.`);
      return E;
    }
    async function h(x) {
      let E = s.get(x);
      if (s.delete(x), E) {
        let O = await E;
        await (O.destroy?.() ?? O.release?.());
      }
    }
    async function p(x, E, { signal: O, onProgress: D, persist: z = !0 } = {}) {
      let B = wt(x);
      if (gt(O), a) throw new Error("Wait for the AI operation to finish before replacing a model.");
      let P = Array.isArray(E) || typeof FileList < "u" && E instanceof FileList ? Object.fromEntries(Array.from(E, (F) => [F.name, F])) : E, I = {};
      for (let F of B.files) {
        if (gt(O), !P?.[F.name]) throw new Error(`Missing model file: ${F.name}`);
        yr(D, "verifying", { file: F.name }), I[F.name] = await F1(F, P[F.name]);
      }
      gt(O), await h(x);
      let S = null;
      if (z)
        try {
          await u(x, I);
        } catch {
          S = "Model loaded for this session; persistent storage was unavailable.";
        }
      return n.set(x, I), yr(D, "ready", { modelId: x }), { ...B, loaded: !0, cacheWarning: S };
    }
    async function m(x, E = {}) {
      wt(x), gt(E.signal);
      let O = await u(x);
      return O ? (await p(x, O, { ...E, persist: !1 }), !0) : !1;
    }
    async function _(x, { signal: E, onProgress: O, source: D } = {}) {
      let z = wt(x);
      gt(E);
      let B = D || (z.bundled ? "bundled" : "remote");
      if (!["bundled", "remote"].includes(B)) throw new Error("Unknown model download source.");
      let P = {}, I = 0;
      for (let S of z.files) {
        gt(E);
        let F = B === "bundled" ? new URL(`models/${x}/${S.name}`, l()).href : S.url;
        yr(O, "downloading", { file: S.name, loaded: I, total: z.bytes });
        let $ = await e(F, { signal: E, credentials: "omit", referrerPolicy: "no-referrer" });
        if (!$?.ok) throw new Error(`Could not load ${S.name} (${$?.status ?? "no response"}).`);
        if ($.body?.getReader) {
          let Z = $.body.getReader(), K = [], A = 0;
          try {
            for (; ; ) {
              gt(E);
              let { done: G, value: _e } = await Z.read();
              if (G) break;
              if (A += _e.byteLength, A > S.bytes) throw new Error(`Model size mismatch: ${S.name}.`);
              K.push(_e), yr(O, "downloading", { file: S.name, loaded: I + A, total: z.bytes });
            }
          } catch (G) {
            throw await Z.cancel().catch(() => {
            }), G;
          } finally {
            Z.releaseLock();
          }
          let M = new Uint8Array(A), L = 0;
          for (let G of K)
            M.set(G, L), L += G.byteLength;
          P[S.name] = M.buffer;
        } else P[S.name] = await $.arrayBuffer();
        I += P[S.name].byteLength;
      }
      return p(x, P, { signal: E, onProgress: O });
    }
    async function g(x) {
      if (s.has(x)) return s.get(x);
      let E = f(x), O = (async () => {
        let D = await d();
        if (x === "pp-ocrv6-tiny" || x === "uvdoc-unwarp") {
          let z = f("pp-ocrv6-tiny"), { PaddleOcrService: B } = await Promise.resolve().then(() => (bh(), yh)), P = { detection: z["PP-OCRv6_tiny_det.onnx"], recognition: z["PP-OCRv6_tiny_rec.onnx"], charactersDictionary: z["ppocrv6_tiny_dict.txt"] };
          x === "uvdoc-unwarp" && (P.unwarping = E["UVDoc_grid.onnx"]);
          let I = new B({ model: P, session: { executionProviders: ["wasm"], graphOptimizationLevel: "all" }, processing: { engine: "canvas-native" }, unwarping: { enabled: x === "uvdoc-unwarp" }, detection: { maxSideLength: 1536 }, recognition: { minimumConfidence: 0.35 }, debugging: { debug: !1, verbose: !1 } });
          try {
            return await I.initialize(), I;
          } catch (S) {
            throw await I.destroy().catch(() => {
            }), S;
          }
        }
        return D.InferenceSession.create(E[wt(x).files[0].name], { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
      })();
      s.set(x, O);
      try {
        return await O;
      } catch (D) {
        throw s.delete(x), D;
      }
    }
    async function w(x, E, { signal: O, onProgress: D, threshold: z = 0.5 } = {}) {
      let B = wt(x);
      gt(O);
      for (let P of [x, ...B.dependencies || []])
        n.has(P) || await m(P, { signal: O, onProgress: D }), f(P);
      if (a) throw new Error("Another AI operation is running. Wait for it to finish.");
      if (!E || !Number.isFinite(E.width) || !Number.isFinite(E.height) || E.width < 1 || E.height < 1) throw new Error("Choose a valid page or image crop.");
      if (E.width * E.height > 24e6) throw new Error("Choose a smaller crop (maximum 24 megapixels).");
      a = !0;
      try {
        let P = { modelId: x, kind: B.kind, width: E.width, height: E.height, reviewRequired: !0 }, I;
        if (x === "pp-doclayout-v3" || x === "florence2-base") {
          let { runVisionModel: S } = await Promise.resolve().then(() => (mw(), pw));
          I = await S(x, E, { files: f(x), signal: O, onProgress: D, assetBase: l() });
        } else {
          yr(D, "initializing", { modelId: x });
          let S = await g(x);
          if (gt(O), yr(D, "running", { modelId: x }), x === "pp-ocrv6-tiny") {
            let F = await S.recognize(E, { flatten: !0, noCache: !0 });
            I = { ...P, text: F.text, confidence: F.confidence, proposals: F.results.map(($) => ({ kind: "text", text: $.text, confidence: $.confidence, bbox: { x0: $.box.x, y0: $.box.y, x1: $.box.x + $.box.width, y1: $.box.y + $.box.height }, reviewRequired: !0 })) };
          } else if (x === "uvdoc-unwarp") {
            let F = await S.unwarp(E), $ = F.canvas.convertToBlob ? await F.canvas.convertToBlob({ type: "image/png" }) : await new Promise((Z) => F.canvas.toBlob(Z, "image/png"));
            if (!$) throw new Error("Could not encode corrected image.");
            I = { ...P, status: F.status, reason: F.reason, correctedImage: new Uint8Array(await $.arrayBuffer()), correctedWidth: F.canvas.width, correctedHeight: F.canvas.height, proposals: F.status === "unwarped" ? [{ kind: "image-correction", label: "Flattened page preview", reviewRequired: !0 }] : [] };
          } else {
            let F = await d(), $;
            if (x === "pp-lcnet-orientation") {
              let K = 224 * Math.min(E.width, E.height) / 256, A = _w(E, 224, 224, [(E.width - K) / 2, (E.height - K) / 2, K, K]);
              $ = { [S.inputNames[0]]: new F.Tensor("float32", A, [1, 3, 224, 224]) };
            } else {
              let K = 800 / Math.max(E.width, E.height), A = Math.max(1, Math.round(E.width * K)), M = Math.max(1, Math.round(E.height * K));
              $ = { pixel_values: new F.Tensor("float32", _w(E, A, M), [1, 3, M, A]) }, S.inputNames.includes("pixel_mask") && ($.pixel_mask = new F.Tensor("int64", new BigInt64Array(A * M).fill(1n), [1, M, A]));
            }
            let Z;
            try {
              if (Z = await S.run($), x === "pp-lcnet-orientation") {
                let K = Array.from(Z[S.outputNames[0]].data);
                if (K.length !== 4) throw new Error("Unexpected orientation output schema.");
                let A = K.reduce((_e, Ce) => _e + Ce, 0), M = K.every((_e) => _e >= 0 && _e <= 1) && Math.abs(A - 1) < 1e-3 ? K : gw(K), L = M.indexOf(Math.max(...M)), G = L * 90;
                I = { ...P, orientation: G, scores: M, proposals: [{ kind: "rotation", orientation: G, rotateDegrees: (360 - G) % 360, confidence: M[L], reviewRequired: !0 }] };
              } else I = { ...P, proposals: yw(Z, E.width, E.height, z) };
            } finally {
              Object.values($).forEach((K) => K.dispose?.()), Z && Object.values(Z).forEach((K) => K.dispose?.());
            }
          }
        }
        for (let S of I.proposals || [])
          S.type = S.kind, S.bbox && (S.bounds = { x: S.bbox.x0 / E.width, y: S.bbox.y0 / E.height, width: (S.bbox.x1 - S.bbox.x0) / E.width, height: (S.bbox.y1 - S.bbox.y0) / E.height });
        return gt(O), yr(D, "complete", { modelId: x }), I;
      } finally {
        a = !1;
      }
    }
    async function y(x, { removeCached: E = !1 } = {}) {
      if (wt(x), a) throw new Error("Wait for the AI operation to finish.");
      await h(x), x === "pp-ocrv6-tiny" && await h("uvdoc-unwarp"), n.delete(x), E && await u(x, null);
    }
    async function v({ signal: x, onProgress: E } = {}) {
      return n.has("pp-ocrv6-tiny") || await m("pp-ocrv6-tiny", { signal: x, onProgress: E }) || await _("pp-ocrv6-tiny", { signal: x, onProgress: E, source: "bundled" }), { setParameters: async () => {
      }, recognize: async (O, D = {}) => {
        let z = O;
        if (typeof O == "string" || O instanceof Blob) {
          if (typeof O == "string" && !O.startsWith("data:") && !O.startsWith("blob:")) throw new Error("OCR accepts local image data only.");
          let P = typeof O == "string" ? await (await e(O)).blob() : O, I = await createImageBitmap(P);
          z = ww(I.width, I.height), z.getContext("2d").drawImage(I, 0, 0), I.close();
        }
        let B = await w("pp-ocrv6-tiny", z, { signal: D.signal || x, onProgress: E });
        return { data: { text: B.text, confidence: B.confidence * 100, words: B.proposals.map((P) => ({ text: P.text, confidence: P.confidence * 100, bbox: P.bbox })) } };
      }, terminate: async () => {
        await y("pp-ocrv6-tiny");
      } };
    }
    async function k(x) {
      let E = wt(x), O = n.has(x), D = O;
      if (!D)
        try {
          let z = await c();
          z && (D = await new Promise((B, P) => {
            let I = z.transaction("packs", "readonly").objectStore("packs").getKey(x);
            I.onsuccess = () => B(I.result !== void 0), I.onerror = () => P(I.error);
          }));
        } catch {
          D = !1;
        }
      return { id: x, installed: D, loaded: O, status: O ? "ready" : D ? "installed" : "missing", bytes: E.bytes };
    }
    return { modelStatus: k, clearModel: (x) => y(x, { removeCached: !0 }), listModels: () => ni.map((x) => ({ ...x, loaded: n.has(x.id) })), loadLocalModelBytes: p, downloadModel: _, restoreModel: m, runModel: w, unloadModel: y, createOCRWorker: v };
  }
  var Ot = bw(), j1 = (...t) => Ot.listModels(...t), W1 = (...t) => Ot.loadLocalModelBytes(...t), V1 = (...t) => Ot.downloadModel(...t), G1 = (...t) => Ot.restoreModel(...t), q1 = (...t) => Ot.runModel(...t), H1 = (...t) => Ot.unloadModel(...t), Y1 = (...t) => Ot.createOCRWorker(...t), X1 = (...t) => Ot.modelStatus(...t), K1 = (...t) => Ot.clearModel(...t);
  return Aw(J1);
})();
/*! Bundled license information:

onnxruntime-web/dist/ort.wasm.min.mjs:
  (*!
   * ONNX Runtime Web v1.31.1
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
