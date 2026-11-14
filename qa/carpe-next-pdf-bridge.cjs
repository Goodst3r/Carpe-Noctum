#!/usr/bin/env node
'use strict';
/**
 * Calls frozen-page NightSweepMapPDF.plan and exportPDF.
 * PDFLib is evaluated from the same packed pdf-lib.js asset the page loads.
 * JSDOM cannot fetch blob: script URLs, so the asset is applied to the page
 * global the production writer already checks before it tries that URL.
 */
const fs = require('node:fs');
const path = require('node:path');
const {bootApp} = require('./build2-source-harness.cjs');

if (process.env.NIGHTSWEEP_RELEASE_TEST !== '1') {
  console.error('FAIL: NIGHTSWEEP_RELEASE_TEST=1 is required. Refusing a source-assembly pass.');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  console.error('FAIL: usage: carpe-next-pdf-bridge.cjs input.pdf output.pdf');
  process.exit(1);
}

// PDF.js 5.4.624 PageViewport constructor, copied from the pinned
// night-sweep/vendor/map/pdf.js expression `var ge=class`. viewBox is the
// CropBox, not the MediaBox. Rotation is the page /Rotate value.
function viewport(viewBox, rotation, userUnit = 1, scale = 1) {
  const t = viewBox;
  let s = scale * userUnit;
  const l = (t[2] + t[0]) / 2;
  const h = (t[3] + t[1]) / 2;
  let rot = rotation % 360;
  if (rot < 0) rot += 360;
  let c, d, u, f;
  if (rot === 180) [c, d, u, f] = [-1, 0, 0, 1];
  else if (rot === 90) [c, d, u, f] = [0, 1, 1, 0];
  else if (rot === 270) [c, d, u, f] = [0, -1, -1, 0];
  else if (rot === 0) [c, d, u, f] = [1, 0, 0, -1];
  else throw new Error('PageViewport: Invalid rotation, must be a multiple of 90 degrees.');
  let g, p, b, m;
  if (c === 0) {
    g = Math.abs(h - t[1]) * s;
    p = Math.abs(l - t[0]) * s;
    b = (t[3] - t[1]) * s;
    m = (t[2] - t[0]) * s;
  } else {
    g = Math.abs(l - t[0]) * s;
    p = Math.abs(h - t[1]) * s;
    b = (t[2] - t[0]) * s;
    m = (t[3] - t[1]) * s;
  }
  return {
    transform: [c * s, d * s, u * s, f * s, g - c * s * l - u * s * h, p - d * s * l - f * s * h],
    width: b,
    height: m,
    userUnit,
    rotation: rot,
    viewBox: t.slice()
  };
}

function inversePlacement(transform, height) {
  const [a, b, c, d, e, f] = transform;
  const det = a * d - b * c;
  const ia = d / det, ib = -b / det, ic = -c / det, id = a / det;
  const ie = (c * f - d * e) / det, iff = (b * e - a * f) / det;
  return [ia, ib, -ic, -id, ic * height + ie, id * height + iff];
}

function nearly(text, values) {
  const body = values.map(n => Number.isInteger(n) ? String(n) : String(n)).join(' ');
  return text.includes(body + ' cm');
}

(async () => {
  const bytes = fs.readFileSync(inputPath);
  const app = bootApp();
  let checks = 0;
  const eq = (actual, expected, message) => {
    if (actual !== expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
      if (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) <= 1e-6) {
        checks += 1;
        return;
      }
      throw new Error((message || 'assert') + ' expected ' + expected + ' got ' + actual);
    }
    checks += 1;
  };
  try {
    const w = app.w;
    if (w.eval('typeof NightSweepMapPDF') !== 'object' || w.eval('typeof NightSweepMapPDF.plan') !== 'function' || w.eval('typeof NightSweepMapPDF.exportPDF') !== 'function') {
      throw new Error('Frozen page is missing NightSweepMapPDF.plan/exportPDF.');
    }
    checks += 1;
    const assets = JSON.parse(w.document.getElementById('map-import-assets').textContent);
    if (!assets['pdf-lib.js']) throw new Error('Frozen page is missing the packed pdf-lib.js asset.');
    w.eval(Buffer.from(assets['pdf-lib.js'], 'base64').toString('utf8'));
    if (!w.PDFLib || !w.PDFLib.PDFDocument) throw new Error('Packed pdf-lib.js did not publish PDFLib.');
    checks += 1;

    const sourceDoc = await w.PDFLib.PDFDocument.load(bytes);
    const sourcePage = sourceDoc.getPage(0);
    const rotation = sourcePage.getRotation().angle;
    const crop = sourcePage.getCropBox();
    const media = sourcePage.getMediaBox();
    eq(rotation, 90, 'source /Rotate');
    const viewBox = [crop.x, crop.y, crop.x + crop.width, crop.y + crop.height];
    const mediaBox = [media.x, media.y, media.x + media.width, media.y + media.height];
    if (viewBox.join(',') === mediaBox.join(',')) throw new Error('CropBox is not distinct from MediaBox.');
    if (viewBox[0] === 0 && viewBox[1] === 0) throw new Error('CropBox origin is zero.');
    checks += 2;
    const view = viewport(viewBox, rotation, 1, 1);
    const hash = await w.crypto.subtle.digest('SHA-256', bytes);
    const sourceId = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
    const binding = (symbolId, kind, x, y, extra = {}) => ({
      sourceId,
      page: 1,
      symbolId,
      exactName: symbolId,
      tag: symbolId,
      kind,
      position: {x, y},
      positionConfirmed: true,
      modelConfirmed: kind !== 'terminal',
      status: 'installed',
      ...extra
    });
    const owner = {
      setup: {lowF: 54, highF: 860, lowLevel: 10, highLevel: 20, launchMode: 'linear', basis: 'nominal', temperature: 68},
      rows: [
        {
          id: 'r1', name: 'ACT1', parent: 'source', length: 0, cable: 'p3_625', device: 'active_gm_hgd',
          mapImport: binding('ACT1', 'active', 40, 220),
          workbench: {records: {main: {before: {low: {input: 12, output: 40}, high: {output: 48}}}, aux: {before: {low: {output: 22}, high: {output: 30}}}}}
        },
        {
          id: 'r2', name: 'EOL1', parent: 'r1::through', length: 10, cable: 'p3_625', device: 'none', terminal: true,
          mapImport: binding('EOL1', 'terminal', 40, 40, {modelConfirmed: false})
        },
        {
          id: 'r3', name: 'SKIP', parent: 'source', length: 1, cable: 'p3_625', device: 'none',
          mapImport: binding('SKIP', 'active', 80, 80, {positionConfirmed: false, modelConfirmed: false, status: 'proposed'})
        }
      ],
      mapImportSource: {
        id: sourceId,
        bytes: bytes.length,
        name: 'synthetic-rotated-cropped.pdf',
        type: 'application/pdf',
        pages: [{
          number: 1,
          width: view.width,
          height: view.height,
          pdf: {viewBox, rotation, userUnit: 1, viewportTransform: view.transform, width: view.width, height: view.height}
        }]
      }
    };
    w.__owner = owner;
    w.__bytes = new Uint8Array(bytes);
    const original = Buffer.from(bytes);
    const before = JSON.stringify(owner);
    const plan = w.NightSweepMapPDF.plan(owner);
    eq(plan.tombstones.length, 2, 'confirmed active and EOL only');
    eq(plan.skipped.length >= 1, true, 'unconfirmed symbol skipped');
    const active = plan.tombstones.find(t => t.symbolId === 'ACT1');
    const eol = plan.tombstones.find(t => t.symbolId === 'EOL1');
    if (!active || !eol) throw new Error('Missing active or EOL tombstone.');
    checks += 1;
    eq(active.page, 1, 'active page');
    eq(eol.page, 1, 'EOL page');
    const activeText = active.lines.join('\n');
    const eolText = eol.lines.join('\n');
    if (!activeText.includes('aux expected OUT') || !activeText.includes('main expected OUT')) throw new Error('Active tombstone did not group legs.');
    checks += 1;
    if (plan.tombstones.filter(t => t.symbolId === 'ACT1').length !== 1) throw new Error('Legs were not grouped into one tombstone.');
    checks += 1;
    if (!eolText.includes('End of line')) throw new Error('EOL tombstone missing.');
    checks += 1;
    if (eolText.includes('aux expected OUT')) throw new Error('EOL tombstone borrowed the active auxiliary leg.');
    checks += 1;
    const scale = Math.hypot(view.transform[0], view.transform[1]);
    for (const tomb of [active, eol]) {
      const width = tomb.width;
      const room = tomb.anchor.x + width + 18 * scale <= view.width;
      const beside = room ? tomb.anchor.x + 12 * scale : tomb.anchor.x - width - 12 * scale;
      eq(tomb.x, beside, tomb.symbolId + ' adjacent x');
      if (tomb.y < 0 || tomb.x < 0 || tomb.x + tomb.width > view.width + 1e-6 || tomb.y + tomb.height > view.height + 1e-6) {
        throw new Error(tomb.symbolId + ' tombstone is outside the rotated crop viewport.');
      }
      checks += 1;
    }
    const matrix = inversePlacement(view.transform, view.height);
    const out = await w.NightSweepMapPDF.exportPDF(w.__bytes, owner);
    const again = await w.NightSweepMapPDF.exportPDF(w.__bytes, owner);
    if (!Buffer.from(out).equals(Buffer.from(again))) throw new Error('Repeat export was not byte-identical.');
    checks += 1;
    if (!Buffer.from(w.__bytes).equals(original)) throw new Error('exportPDF mutated the original bytes.');
    checks += 1;
    eq(JSON.stringify(owner), before, 'job mutated');
    const reopened = await w.PDFLib.PDFDocument.load(out);
    eq(reopened.getPageCount(), 1, 'page count');
    const outPage = reopened.getPage(0);
    eq(outPage.getRotation().angle, 90, 'exported rotation');
    const outCrop = outPage.getCropBox();
    eq(outCrop.x, crop.x, 'crop x');
    eq(outCrop.y, crop.y, 'crop y');
    eq(outCrop.width, crop.width, 'crop width');
    eq(outCrop.height, crop.height, 'crop height');
    const annots = outPage.node.Annots();
    eq(annots && annots.size(), 1, 'original annotation preserved');
    const exportedAnnot = reopened.context.lookup(annots.get(0));
    const exportedContents = exportedAnnot.get(w.PDFLib.PDFName.of('Contents'));
    const exportedText = exportedContents && exportedContents.decodeText ? exportedContents.decodeText() : String(exportedContents || '');
    if (!String(exportedText).includes('Existing annotation')) throw new Error('Annotation text was flattened away: ' + exportedText);
    checks += 1;
    fs.writeFileSync(outputPath, Buffer.from(out));
    if (app.errors.length) throw new Error('Page errors: ' + app.errors.join(' | '));
    checks += 1;
    const report = {checks, matrix, marker: 'SYNTHETIC ORIGINAL MARKUP', annotation: 'Existing annotation'};
    // Keep matrix available even when the content stream is compressed.
    fs.writeFileSync(outputPath + '.matrix.json', JSON.stringify(report));
    console.log('PASS NightSweepMapPDF plan/export on frozen page (' + checks + ' bridge checks)');
    console.log(JSON.stringify(report));
  } finally {
    app.close();
  }
})().catch(error => {
  console.error('FAIL ' + (error && error.stack || error));
  process.exit(1);
});
