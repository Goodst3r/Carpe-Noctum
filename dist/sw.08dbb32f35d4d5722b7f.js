/* Generated from public build inputs. This worker never reads or uploads jobs. */
'use strict';
const VERSION = "08dbb32f35d4d5722b7f";
const ASSETS = ["android.html","equipment-coverage.html","functions-guide.html","guide.html","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/icon.svg","index.html","install.html","iphone.html","manifest.webmanifest","math-audit.html","phone-installation.html","pwa.css","pwa.js","robots.txt","setup-guide.html","training-coverage.html"];
const HASHES = {"android.html":"b2f8b3e56c024ea780d294b63dc5b3baadcccaea6f0d88ddb863cffa1feb3ac1","equipment-coverage.html":"786d9e42a626c380e503807743696a0941999026b6d9a7419c72674ce861cd25","functions-guide.html":"35cd55f7638358f0bf8e1f1dcaed7085cbca8c9566e0ac5f6336beabaceb3f72","guide.html":"b99bb54062143d938432c3fb08701ad132ff55ead158a3ee22eaf3c9974c1051","icons/apple-touch-icon.png":"27009ef689427e5953667f189a00457b9f3f075796762177e6f015b3b819250f","icons/icon-192.png":"5f76beb81c5cd4371c07a7d3e61efaeb7f39120e269ea27c289d9221c609fc2d","icons/icon-512.png":"a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60","icons/icon-maskable-512.png":"a988db12801eb0b426361d1c6d9477e7e3a7a1c0fa765dbc644432a904031f60","icons/icon.svg":"c01a21b6e7dbb5e88dd4c64ccb2a082ae87c9e3f8f94e084cf8fe4a14d36f617","index.html":"9a1f1730b8849f0c731fd1ff3c740b02849a550c483295dd616745cda0d891a2","install.html":"c951b9be2490e54196c07e974d5b3709bbbfd63bf5063dfe656d7c247b751b17","iphone.html":"53ccb19e452e1675a327495e598632192bfdad2b2cc203e9760136f067de7292","manifest.webmanifest":"aad67645a15d2ca426b35542d17e1c0135b0902128e1f7212fcb034d86802a9d","math-audit.html":"48c5b135e8ae7d54f69a2bd9d5921eeb56a702ecec350bf2f2911f5ee18501a0","phone-installation.html":"8015f752e67621aac229ba719faf38b694412ba9b7d82c7ed5e5d149983831f8","pwa.css":"c611fd2db30de63ec4bc57cc1c479a33c745aed3d113044720eb64467d3ecc64","pwa.js":"647f67eb1c6db49832d25bd059510cacf6e3314bc173853b1a40cf46c5dc7b00","robots.txt":"331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1","setup-guide.html":"f3f4868b0bc0a4ec4e7a517b08e8f826dcd941485c48185f5882e3b88f7b6942","training-coverage.html":"781055b22962834fd3be02e8cb54b82f962aed5851ee6f8fab81cb9ce4334758"};
const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = 'nightsweep-shell-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const URLS = ASSETS.map(path => new URL(path, BASE).href);
const ALLOWED = new Set(URLS);
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
    return fetch(request);
  })());
});
