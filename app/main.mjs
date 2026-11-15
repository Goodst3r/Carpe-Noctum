import { mountApp } from './ui.mjs';

// These pinned libraries are embedded; no runtime CDN or module fetch is used.
const assetElement = document.getElementById('map-import-assets');
const assets = JSON.parse(assetElement?.textContent || '{}');
for (const name of ['pdf.js', 'pdf-worker.js', 'pdf-lib.js', 'ocr.js']) {
  if (assets[name]) (0, eval)(atob(assets[name]));
}
mountApp(document.getElementById('app'));
