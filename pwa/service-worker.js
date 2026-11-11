/* Generated from public build inputs. This worker never reads or uploads jobs. */
'use strict';
const VERSION = __VERSION__;
const ASSETS = __ASSETS__;
const HASHES = __HASHES__;
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
