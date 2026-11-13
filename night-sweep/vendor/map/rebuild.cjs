/* Run npm ci in this directory, then node rebuild.cjs. Never commit node_modules. */
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const root = __dirname;
const nm =
  process.env.MAP_VENDOR_NODE_MODULES || path.join(root, "node_modules");
const esbuild = require(path.join(nm, "esbuild"));
for (const [input, globalName, output] of [
  ["pdf.mjs", "pdfjsLib", "pdf.js"],
  ["pdf.worker.mjs", "pdfjsWorker", "pdf-worker.js"],
])
  esbuild.buildSync({
    entryPoints: [path.join(nm, "pdfjs-dist/build", input)],
    bundle: true,
    format: "iife",
    globalName,
    target: "es2022",
    minify: true,
    legalComments: "inline",
    outfile: path.join(root, output),
  });
fs.copyFileSync(
  path.join(nm, "tesseract.js/dist/tesseract.min.js"),
  path.join(root, "ocr.js"),
);
// Scalar LSTM is the portable deterministic offline baseline; core's wasm.js contains its WASM.
fs.writeFileSync(
  path.join(root, "ocr-worker.js"),
  fs.readFileSync(
    path.join(nm, "tesseract.js-core/tesseract-core-lstm.wasm.js"),
    "utf8",
  ) +
    "\n" +
    fs.readFileSync(path.join(nm, "tesseract.js/dist/worker.min.js"), "utf8"),
);
fs.copyFileSync(
  path.join(nm, "@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"),
  path.join(root, "eng.traineddata.gz"),
);
for (const [src, out] of [
  ["pdfjs-dist/LICENSE", "LICENSE-pdfjs.txt"],
  ["tesseract.js/LICENSE.md", "LICENSE-tesseract.txt"],
  ["tesseract.js-core/LICENSE", "LICENSE-tesseract-core.txt"],
  ["tesseract.js/dist/tesseract.min.js.LICENSE.txt", "LICENSE-ocr-bundle.txt"],
  ["tesseract.js/dist/worker.min.js.LICENSE.txt", "LICENSE-worker-bundle.txt"],
])
  fs.copyFileSync(path.join(nm, src), path.join(root, out));
const notices = [
  "Offline map recognition: PDF.js 5.4.624; Tesseract.js/core 7.0.0; English data 1.0.0. Source URLs and checksums are in the source distribution.\n",
  ...fs
    .readdirSync(root)
    .filter((n) => n.startsWith("LICENSE-"))
    .sort()
    .map(
      (n) => "\n\n" + n + "\n" + fs.readFileSync(path.join(root, n), "utf8"),
    ),
].join("\n");
fs.writeFileSync(path.join(root, "NOTICE.txt"), notices);
const files = [
  "NOTICE.txt",
  "pdf.js",
  "pdf-worker.js",
  "ocr.js",
  "ocr-worker.js",
  "eng.traineddata.gz",
].map((name) => {
  const b = fs.readFileSync(path.join(root, name));
  return {
    name,
    bytes: b.length,
    sha256: crypto.createHash("sha256").update(b).digest("hex"),
  };
});
fs.writeFileSync(
  path.join(root, "manifest.json"),
  JSON.stringify({ schema: 1, files }, null, 2) + "\n",
);
