/* Generated from public build inputs. This worker never reads or uploads jobs. */
'use strict';
const VERSION = "0435280d7ff18732da03";
const ASSETS = ["guide.html", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon.svg", "index.html", "manifest.webmanifest", "pwa.js"];
const HASHES = {"pwa.js": "788d49b13a183e275dd2caabfa0703de8327ccbc739ba204ca3bbe9735e6ccda", "manifest.webmanifest": "c58ea2634b82b0f8f9a2798a23a78fa6ea51691f83539ece5ebb9bd96f069eac", "icons/apple-touch-icon.png": "27009ef689427e5953667f189a00457b9f3f075796762177e6f015b3b819250f", "icons/icon-192.png": "5f76beb81c5cd4371c07a7d3e61efaeb7f39120e269ea27c289d9221c609fc2d", "icons/icon-512.png": "a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60", "icons/icon-maskable-512.png": "a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60", "icons/icon.svg": "c01a21b6e7dbb5e88dd4c64ccb2a082ae87c9e3f8f94e084cf8fe4a14d36f617", "ai/NOTICES.md": "b43c6d4454893cbcec5889ccc94edc46f9ace33ff9e681bd746370f3429ad830", "ai/engine.js": "9e3b08f7c3e9e14cf04dcb6ab1356e697a1fd93232aecb43990c71dafebb61bb", "ai/licenses/Apache-2.0.txt": "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30", "ai/licenses/ONNX-Runtime-MIT.txt": "2f07c72751aed99790b8a4869cf2311df85a860b22ded05fa22803587a48922c", "ai/licenses/ONNX-Runtime-ThirdPartyNotices.txt": "e9e90971a8e75a9a8ac0c6412e29c1202d079998389915aa485f46c816c3b4cc", "ai/licenses/PPU-OCR-MIT.txt": "0876ebaae29ef0721c14733d8e0a9a9cc4853142ed757edecb1e633fd99872a0", "ai/licenses/Transformers-JS-Apache-2.0.txt": "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30", "ai/model-manifest.json": "79d4f5d11fddf319f912da21fecae52770b0ac97de4e5d7957dfde0dbe1314cf", "ai/models/pp-ocrv6-tiny/PP-OCRv6_tiny_det.onnx": "193bab7a04fca699a6c82e6abb5b81bdb28177f0abd4062552b04908dafb19f8", "ai/models/pp-ocrv6-tiny/PP-OCRv6_tiny_rec.onnx": "9ef676d6ed3c88256a2d92c640c44f25b0c40947e111b14b8be8f594091563e6", "ai/models/pp-ocrv6-tiny/ppocrv6_tiny_dict.txt": "2f3717bbd530b681b6db3be35cc485e8a41a932b9558b833986bf0894eb21f2d", "ai/ort-wasm-simd-threaded.mjs": "30ed0b5cd1182ede931fea448afb567d4dc705ec957af09f108a2be5f770dac3", "ai/ort-wasm-simd-threaded.wasm": "4b884c203b0fa48d057be3332c65513ff85aa3c5bddd6946acc0fab7ecda001d", "ai/worker.js": "7a8cf42b25b4f747058a313b4a4255f7640c90ba2b5a171f994d9f39c1fa90d9", "guide.html": "1387c1e44a65c54f77b9511ef1ef1670cba74c39a63f0457c169d038ee9cc5e7", "index.html": "7fc489a56dc2e456c67c1b13c58d2efbb8e2a0a66dc719b26228d11031522e04"};
const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = 'nightsweep-shell-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const URLS = ASSETS.map(path => new URL(path, BASE).href);
const OPTIONAL_URLS = Object.keys(HASHES).filter(p=>p.startsWith('ai/')).map(p=>new URL(p,BASE).href);
const ALLOWED = new Set([...URLS,...OPTIONAL_URLS]);
const INDEX = new URL('index.html', BASE).href;
// The production static host redirects these HTML filenames to clean paths.
// Request the known clean path directly if the original request is rejected;
// never follow a redirect or accept an unverified redirected response.
const CANONICAL_HTML = Object.fromEntries(ASSETS.filter(asset=>asset.endsWith('.html')).map(asset=>[asset,asset==='index.html'?'./':asset.slice(0,-5)]));
const HTML_ALIASES = new Map(Object.entries(CANONICAL_HTML).map(([asset,path])=>[new URL(path,BASE).href,new URL(asset,BASE).href]));

async function fetchPublicAsset(url, asset) {
  const canonical = CANONICAL_HTML[asset];
  let response;
  try {
    response = await fetch(new Request(url, {cache:'reload',credentials:'same-origin',redirect:'error'}));
  } catch (error) {
    if (!canonical) throw error;
  }
  if (canonical && (!response || response.status === 404)) {
    const canonicalURL = new URL(canonical, BASE).href;
    response = await fetch(new Request(canonicalURL, {cache:'reload',credentials:'same-origin',redirect:'error'}));
    url = canonicalURL;
  }
  if (!response.ok || response.type === 'opaque' || response.redirected || (response.url && response.url !== url)) throw new Error('Offline asset unavailable');
  return response;
}

async function complete(cache) {
  for (const url of URLS) if (!(await cache.match(url))) return false;
  return true;
}
async function ready() {
  if (!(await caches.keys()).includes(CACHE_NAME)) return false;
  return complete(await caches.open(CACHE_NAME));
}
let copying = null;
async function saveOfflineCopy() {
  if (copying) return copying;
  copying = (async () => {
    // A repeated same-version install must not erase an already usable copy.
    if (await ready()) return;
    try {
      const responses = await Promise.all(URLS.map(async (url, i) => {
        const response = await fetchPublicAsset(url, ASSETS[i]);
        const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
        const extension = ASSETS[i].split('.').pop();
        const expected = {html:['text/html'],js:['application/javascript','text/javascript'],css:['text/css'],webmanifest:['application/manifest+json','application/json'],png:['image/png'],svg:['image/svg+xml'],txt:['text/plain'],json:['application/json']};
        if (expected[extension] && !expected[extension].includes(mime)) throw new Error('Unexpected offline asset type');
        const bytes = await response.clone().arrayBuffer();
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');
        if (hash !== HASHES[ASSETS[i]]) throw new Error('Offline asset does not match this release');
        return response;
      }));
      const cache = await caches.open(CACHE_NAME);
      for (let i = 0; i < URLS.length; i++) await cache.put(URLS[i], responses[i]);
      if (!(await complete(cache))) throw new Error('Offline copy incomplete');
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })();
  try {await copying;} finally {copying = null;}
}
self.addEventListener('install', event => {
  // No skipWaiting here. Updates are activated only after explicit consent.
  event.waitUntil(saveOfflineCopy());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (!(await ready())) throw new Error('Offline copy incomplete; previous cache preserved');
    await self.clients.claim();
    // Only our public shell caches are removed, after successful activation.
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    }
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'GET_OFFLINE_STATUS') {
    event.waitUntil((async () => {
      const status = {type:'OFFLINE_STATUS',version:VERSION,ready:await ready()};
      if (event.ports?.[0]) event.ports[0].postMessage(status);
      else event.source?.postMessage(status);
    })());
  }
  if (event.data?.type === 'ACTIVATE_UPDATE') {
    event.waitUntil((async () => {if (await ready()) await self.skipWaiting();})());
  }
  if (event.data?.type === 'REPAIR_OFFLINE') {
    event.waitUntil((async () => {
      let error = false;
      try {await saveOfflineCopy();} catch (_) {error = true;}
      const result = {type:'OFFLINE_REPAIRED',ready:await ready(),error};
      if (event.ports?.[0]) event.ports[0].postMessage(result);
      else event.source?.postMessage(result);
    })());
  }
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  // Only known static paths are handled. Queries never become cache keys.
  const clean = new URL(url.pathname, BASE.origin).href;
  const key = HTML_ALIASES.get(clean) || clean;
  if (!ALLOWED.has(key)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(CACHE_NAME)).match(key);
    if (cached) return cached;
    // This is a public asset fallback, not a dynamic/user-data cache.
    const response=await fetch(request);
    const asset=new URL(key).pathname.slice(BASE.pathname.length);
    if(asset.startsWith('ai/') && response.ok){
      const bytes=await response.clone().arrayBuffer();
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(hash!==HASHES[asset])throw Error('AI runtime asset hash mismatch');
      await(await caches.open(CACHE_NAME)).put(key,response.clone());
    }
    return response;
  })());
});
