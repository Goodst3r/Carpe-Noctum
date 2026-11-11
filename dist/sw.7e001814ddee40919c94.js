/* Generated from public build inputs. This worker never reads or uploads jobs. */
'use strict';
const VERSION = "7e001814ddee40919c94";
const ASSETS = ["android.html","equipment-coverage.html","functions-guide.html","guide.html","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/icon.svg","index.html","install.html","iphone.html","manifest.webmanifest","math-audit.html","phone-installation.html","pwa.css","pwa.js","robots.txt","setup-guide.html","training-coverage.html"];
const HASHES = {"android.html":"d052ddb22d2fc2bd5ce92fb65d685cf135d8a19daa9e714e2d63150c12e73a16","equipment-coverage.html":"21e44c36c185fce89f02b1819b4681897f2109442eba5cb8da1b98041862d66b","functions-guide.html":"a60d2e5b884d73fe2fa45a4a45de438791ca57e1ca3842cdc38d07e4bd8e0c9b","guide.html":"9bdb8a573e20196c0318abebccf5bea39737c95686f0175e90bb21fcd654ae2a","icons/apple-touch-icon.png":"27009ef689427e5953667f189a00457b9f3f075796762177e6f015b3b819250f","icons/icon-192.png":"5f76beb81c5cd4371c07a7d3e61efaeb7f39120e269ea27c289d9221c609fc2d","icons/icon-512.png":"a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60","icons/icon-maskable-512.png":"a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60","icons/icon.svg":"c01a21b6e7dbb5e88dd4c64ccb2a082ae87c9e3f8f94e084cf8fe4a14d36f617","index.html":"e31474a50e1de6365242cbb54af8ec0a7feb582d8b2a726f9a2aa2a22a447ffc","install.html":"faa8c86c6ad0388482752a64c52feb50801ec8865452dca1eea8fe3a64fca394","iphone.html":"171a0bcc042265de610f67bb2676918ca1e3905a656150e917a4c0dc803986e6","manifest.webmanifest":"2a35e13223851d31f60234a81674a1151b94376c3bb2e773911bf670f03ec4da","math-audit.html":"fb49083c3f2f18194a9aa3a040489ddd8ffc196a0d71c77f561b7f2c51c2e46d","phone-installation.html":"07d65b51004005a87fad7d8d67a800c3b5987c0c2dd8e7e007e4266401203f0a","pwa.css":"c611fd2db30de63ec4bc57cc1c479a33c745aed3d113044720eb64467d3ecc64","pwa.js":"647f67eb1c6db49832d25bd059510cacf6e3314bc173853b1a40cf46c5dc7b00","robots.txt":"331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1","setup-guide.html":"9ffe5c2b3b6992190fcca4b4c7cbe71034d5319fe47b260785cf470c5b2ab64c","training-coverage.html":"d21f92a4c3d47d0d8542a7c1a661ad42921bc7e1c2321689ff1cad4779456ab0"};
const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = 'nightsweep-shell-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const URLS = ASSETS.map(path => new URL(path, BASE).href);
const ALLOWED = new Set(URLS);
const INDEX = new URL('index.html', BASE).href;
// The production static host redirects these HTML filenames to clean paths.
// Request the known clean path directly if the original request is rejected;
// never follow a redirect or accept an unverified redirected response.
const CANONICAL_HTML = {'index.html':'./','guide.html':'guide','setup-guide.html':'setup-guide','math-audit.html':'math-audit','install.html':'install','android.html':'android','iphone.html':'iphone'};
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
    return fetch(request);
  })());
});
