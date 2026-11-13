/* Execute the built worker with isolated browser cache/network/lifecycle contracts. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),base='https://nightsweep.test/';
const workerFiles=fs.readdirSync(dist).filter(name=>/^sw\.[a-f0-9]+\.js$/.test(name));assert.equal(workerFiles.length,1,'one release worker in this build');
const source=fs.readFileSync(path.join(dist,workerFiles[0]),'utf8'),cases=[];
// Observed production-host routes; independent of the worker's generated mapping.
const hostHTML={'index.html':'./','install.html':'install','guide.html':'guide','android.html':'android','iphone.html':'iphone','setup-guide.html':'setup-guide','math-audit.html':'math-audit','equipment-coverage.html':'equipment-coverage','functions-guide.html':'functions-guide','phone-installation.html':'phone-installation','training-coverage.html':'training-coverage'};
const hostPages=Object.fromEntries(Object.entries(hostHTML).map(([asset,route])=>[route==='./'?'':route,asset]));
function key(input){return new URL(typeof input==='string'?input:input.url,base).href;}
class CacheStorage {
 constructor(){this.data=new Map();this.failPut=null;this.deleted=[];}
 async open(name){if(!this.data.has(name))this.data.set(name,new Map());const data=this.data.get(name),owner=this;return {
  async match(input){return data.get(key(input))?.clone();},
  async put(input,response){if(owner.failPut?.(input))throw new Error('QuotaExceededError');data.set(key(input),response.clone());},
  async keys(){return [...data.keys()].map(url=>new Request(url));},
  async delete(input){return data.delete(key(input));},
  async addAll(inputs){for(const input of inputs){const response=await owner.network(input);if(!response.ok)throw new Error('Precache request failed');await this.put(input,response);}}
 };}
 async match(input){for(const data of this.data.values()){if(data.has(key(input)))return data.get(key(input)).clone();}}
 async keys(){return [...this.data.keys()];}
 async delete(name){this.deleted.push(name);return this.data.delete(name);}
}
function boot({caches=new CacheStorage(),offline=false,failPath=null,failStatus=503,scope=base,corruptPath=null,wrongMime=null,wrongMimeValue='text/html',redirectPath=null,canonicalHTML=false,redirects={}}={}){
 const handlers={},requests=[],messages=[],life={skip:0,claim:0},context={offline,failPath,corruptPath,wrongMime,wrongMimeValue,redirectPath,canonicalHTML,redirects};
 const network=async(input)=>{const url=new URL(key(input));requests.push(url.href);if(context.offline)throw new TypeError('Network unavailable');if(context.failPath&&url.pathname.endsWith(context.failPath))return new Response('unavailable',{status:failStatus});
  const relative=decodeURIComponent(url.pathname).replace(new URL(scope).pathname,''),asset=hostPages[relative]||relative,file=path.join(dist,asset);if(!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response('not found',{status:404});
  const redirectMap={...(context.canonicalHTML?hostHTML:{}),...context.redirects};
  const isRedirect=Object.prototype.hasOwnProperty.call(redirectMap,relative),finalUrl=isRedirect?new URL(redirectMap[relative],scope).href:url.href;
  if(isRedirect&&input.redirect==='error')throw new TypeError('Redirect prohibited by request');
  if(isRedirect&&input.redirect==='manual')return new Response(null,{status:302,headers:{location:finalUrl}});
  const mime={'.html':'text/html','.webmanifest':'application/manifest+json','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.txt':'text/plain'}[path.extname(file)]||'application/octet-stream';
  const response=new Response(asset.endsWith(context.corruptPath||'never-match')?'modified release bytes':fs.readFileSync(file),{status:200,headers:{'content-type':asset.endsWith(context.wrongMime||'never-match')?context.wrongMimeValue:mime}});
  Object.defineProperty(response,'url',{value:asset.endsWith(context.redirectPath||'never-match')?base+'login.html':finalUrl});Object.defineProperty(response,'redirected',{value:isRedirect});return response;};
 caches.network=network;
 const self={location:new URL(workerFiles[0],scope),registration:{scope},addEventListener(type,fn){handlers[type]=fn;},skipWaiting(){life.skip++;return Promise.resolve();},clients:{claim(){life.claim++;return Promise.resolve();},async matchAll(){return [{postMessage(m){messages.push(m);}}];}}};
 vm.runInNewContext(source,{self,caches,fetch:network,URL,Request,Response,Headers,Promise,console,Set,Map,Date,crypto:webcrypto},{filename:'dist/'+workerFiles[0]});
 async function emit(type,event={}){const pending=[];let response;const evt={...event,waitUntil(p){pending.push(Promise.resolve(p));},respondWith(p){response=Promise.resolve(p);}};assert(handlers[type],type+' handler');handlers[type](evt);await Promise.all(pending);return response;}
 return {caches,requests,messages,life,context,handlers,emit,async status(){let reply;await emit('message',{data:{type:'GET_OFFLINE_STATUS'},ports:[{postMessage(m){reply=m;}}]});return reply;},async get(url,extra={}){return emit('fetch',{request:{url:new URL(url,scope).href,method:'GET',mode:'cors',...extra}});}};
}
async function check(name,fn){await fn();cases.push(name);console.log('PASS '+name);}
async function seed(caches,name,url,text){await(await caches.open(name)).put(url,new Response(text));}
function htmlResponse(r){assert(r,'worker must respond');assert.equal(r.status,200);return r.text();}

(async()=>{
 const app=boot(),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 await check('Published manifest and icons describe a standalone app and local install assets',()=>{
  const manifestHref=html.match(/<link[^>]+rel=["']manifest["'][^>]+href=["']([^"']+)["']/i)?.[1]||html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']manifest["']/i)?.[1];assert(manifestHref,'manifest link');
  const manifest=JSON.parse(fs.readFileSync(path.join(dist,manifestHref),'utf8'));assert.equal(manifest.display,'standalone');assert.match(manifest.name,/Carpe Noctum/);assert(manifest.start_url);assert(manifest.scope);
  assert(manifest.icons.some(x=>x.sizes==='192x192'));assert(manifest.icons.some(x=>x.sizes==='512x512'));for(const icon of manifest.icons)assert(fs.existsSync(path.join(dist,icon.src)),icon.src);
  assert.match(html,/apple-touch-icon/);assert.match(html,/name=["']viewport["']/);assert(!/<script\b[^>]+src=["']https?:/i.test(html),'no network script dependency');
 });
 await check('Offline readiness is false before a successful installation',async()=>{const status=await app.status();assert.equal(status.type,'OFFLINE_STATUS');assert.equal(status.ready,false);assert.equal(typeof status.version,'string');});
 await check('Installation caches a complete release without taking over or reloading the working page',async()=>{
  await app.emit('install');const status=await app.status();assert.equal(status.ready,true);assert.equal(app.life.skip,0);assert.equal(app.life.claim,0);assert.deepEqual(app.messages,[]);assert(app.requests.some(x=>x.endsWith('/index.html')));assert(app.requests.some(x=>x.endsWith('.webmanifest')));assert(app.requests.some(x=>/192/.test(x)));assert(app.requests.some(x=>/512/.test(x)));
  for(const url of app.requests){const cached=await app.caches.match(url);assert(cached,'missing precache '+url);assert.equal(cached.status,200);}
 });
 await check('Offline launch and index navigation return the complete cached app even with query parameters',async()=>{
  app.context.offline=true;for(const url of ['./','./?source=home','./index.html?job=example'])assert.equal(await htmlResponse(await app.get(url,{mode:'navigate'})),html);
 });
 await check('Every cached application resource can load offline without a network call',async()=>{
  const urls=[...new Set(app.requests)];app.requests.length=0;for(const url of urls){const response=await app.get(url);assert(response,url);assert.equal(response.status,200,url);assert((await response.arrayBuffer()).byteLength>0,url);}assert.equal(app.requests.length,0);
 });
 await check('Cross-origin traffic is never intercepted or added to app storage',async()=>{assert.equal(await app.get('https://files.example.test/customer-evidence.csv'),undefined);assert.equal(await app.get('https://files.example.test/',{mode:'navigate'}),undefined);assert.equal(app.requests.length,0);});
 await check('POST and unrelated same-origin documents bypass the static cache',async()=>{assert.equal(await app.get('./index.html',{method:'POST'}),undefined);for(const url of ['private-job.json','customer-photo.png','release.json'])assert.equal(await app.get(url),undefined);assert.equal(await app.get('./unrelated/',{mode:'navigate'}),undefined);assert.equal(app.requests.length,0);});
 await check('Cache readiness becomes false if even one required resource is missing',async()=>{
  const names=await app.caches.keys(),cache=await app.caches.open(names[0]),urls=await cache.keys();assert(urls.length>1);const missing=urls.find(x=>!x.url.endsWith('/index.html'));const saved=await cache.match(missing);await cache.delete(missing);assert.equal((await app.status()).ready,false);await cache.put(missing,saved);assert.equal((await app.status()).ready,true);
 });
 await check('A failed precache rejects installation and retains the previous release',async()=>{
  const caches=new CacheStorage();await seed(caches,'nightsweep-previous-release','./index.html','previous release');const broken=boot({caches,failPath:'index.html'});await assert.rejects(broken.emit('install'));assert.equal(await(await caches.match('./index.html')).text(),'previous release');assert.deepEqual(await caches.keys(),['nightsweep-previous-release']);assert.equal(broken.life.skip,0);assert.equal((await broken.status()).ready,false);
 });
 await check('Network loss during installation cannot produce a false offline-ready state',async()=>{
  const broken=boot({offline:true});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.equal((await broken.caches.keys()).length,0);assert.equal(broken.life.skip,0);
 });
 await check('A mixed or corrupted release is rejected even when every asset returns HTTP 200',async()=>{
  const broken=boot({corruptPath:'index.html'});await assert.rejects(broken.emit('install'),/match this release/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('An HTML fallback served as JavaScript cannot become an offline-ready copy',async()=>{
  const broken=boot({wrongMime:'pwa.js'});await assert.rejects(broken.emit('install'),/asset type/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('A redirect to a login or other page cannot be accepted as a public app asset',async()=>{
  const broken=boot({redirectPath:'index.html'});await assert.rejects(broken.emit('install'),/asset unavailable/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 const canonical=boot({canonicalHTML:true});
 await check('The published host HTML redirects trigger verified direct requests to the known canonical URLs',async()=>{
  await canonical.emit('install');assert.equal((await canonical.status()).ready,true);for(const name of ['index.html','install.html','guide.html','android.html','iphone.html','setup-guide.html'])assert.equal(await(await canonical.caches.match(new URL(name,base).href)).text(),fs.readFileSync(path.join(dist,name),'utf8'));for(const alias of ['./','install','guide','android','iphone','setup-guide'])assert(canonical.requests.includes(new URL(alias,base).href));assert.equal(canonical.life.skip,0);
 });
 await check('Both clean guide URLs and their original HTML links remain available offline without network requests',async()=>{
  canonical.context.offline=true;canonical.requests.length=0;for(const [url,name] of [['./','index.html'],['index.html','index.html'],['install','install.html'],['install.html','install.html'],['guide','guide.html'],['guide.html','guide.html'],['install?source=home','install.html'],['guide?section=training','guide.html'],['setup-guide','setup-guide.html'],['setup-guide.html','setup-guide.html'],['setup-guide?split=42','setup-guide.html']])assert.equal(await htmlResponse(await canonical.get(url,{mode:'navigate'})),fs.readFileSync(path.join(dist,name),'utf8'),url);assert.equal(canonical.requests.length,0);
 });
 await check('Every production guide alias serves verified cached bytes offline, including the four newer guides',async()=>{
  for(const [asset,route] of Object.entries(hostHTML))for(const url of [asset,route,route+'?from=home'])assert.equal(await htmlResponse(await canonical.get(url,{mode:'navigate'})),fs.readFileSync(path.join(dist,asset),'utf8'),url);
  assert.equal(canonical.requests.length,0);
 });
 await check('A canonical fallback that redirects to another origin or protocol is rejected without following it',async()=>{
  for(const destination of ['https://other.example.test/','http://nightsweep.test/']){const broken=boot({redirects:{'index.html':destination,'':destination}});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);assert(!broken.requests.includes(destination));}
 });
 await check('Canonical fallback URLs cannot redirect to a different page or append query parameters',async()=>{
  for(const redirects of [{'index.html':'guide','':'guide'},{'install.html':'guide','install':'guide'},{'guide.html':'login','guide':'login'},{'guide.html':'guide?login=1','guide':'guide?login=1'}]){const broken=boot({redirects});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);}
 });
 await check('An untrusted original redirect is never followed and can only recover through the fixed verified canonical page',async()=>{
  const destination='https://untrusted.example.test/job-upload';const safe=boot({redirects:{'index.html':destination}});await safe.emit('install');assert.equal((await safe.status()).ready,true);assert(safe.requests.includes(base));assert(!safe.requests.includes(destination));assert.equal(await(await safe.caches.match(base+'index.html')).text(),html);
 });
 await check('A host that omits HTML filenames can install through its known canonical pages',async()=>{
  const fallback=boot({failPath:'index.html',failStatus:404});await fallback.emit('install');assert.equal((await fallback.status()).ready,true);assert(fallback.requests.includes(base));
 });
 await check('An incorrect final URL from a canonical response cannot pass even if its bytes and MIME match',async()=>{
  const broken=boot({canonicalHTML:true,redirectPath:'index.html'});await assert.rejects(broken.emit('install'),/asset unavailable/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('JavaScript, styles, manifests and icons cannot redirect even back to the same asset URL',async()=>{
  for(const asset of ['pwa.js','pwa.css','manifest.webmanifest','icons/icon-192.png']){const broken=boot({redirects:{[asset]:asset}});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);}
 });
 await check('An allowed canonical destination still rejects modified HTML bytes',async()=>{
  const broken=boot({canonicalHTML:true,corruptPath:'index.html'});await assert.rejects(broken.emit('install'),/match this release/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('An allowed canonical destination still rejects an incorrect HTML content type',async()=>{
  const broken=boot({canonicalHTML:true,wrongMime:'install.html',wrongMimeValue:'text/plain'});await assert.rejects(broken.emit('install'),/asset type/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('A stale setup guide cannot be accepted into a new offline release',async()=>{
  const broken=boot({canonicalHTML:true,corruptPath:'setup-guide.html'});await assert.rejects(broken.emit('install'),/match this release/);assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('A repeated same-release install keeps an existing good copy while offline',async()=>{
  const before=await app.caches.keys();await app.emit('install');assert.deepEqual(await app.caches.keys(),before);assert.equal((await app.status()).ready,true);assert.equal(await htmlResponse(await app.get('./',{mode:'navigate'})),html);
 });
 await check('Incomplete candidates cannot activate or remove the previous release',async()=>{
  const caches=new CacheStorage();await seed(caches,'nightsweep-shell-previous','./index.html','previous release');const broken=boot({caches});await assert.rejects(broken.emit('activate'));assert.equal(broken.life.claim,0);assert.deepEqual(await caches.keys(),['nightsweep-shell-previous']);await broken.emit('message',{data:{type:'ACTIVATE_UPDATE'}});assert.equal(broken.life.skip,0);
 });
 await check('Storage quota failure removes the incomplete candidate and preserves unrelated caches',async()=>{
  const caches=new CacheStorage();await seed(caches,'other-field-app','./other.html','foreign cache');caches.failPut=()=>true;const broken=boot({caches});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.deepEqual(await caches.keys(),['other-field-app']);assert.equal(await(await caches.match('./other.html')).text(),'foreign cache');
 });
 await check('Only explicit update activation invokes skipWaiting',async()=>{
  await app.emit('message',{data:{type:'UNKNOWN_MESSAGE'}});await app.status();assert.equal(app.life.skip,0);await app.emit('message',{data:{type:'ACTIVATE_UPDATE'}});assert.equal(app.life.skip,1);
 });
 await check('Activation preserves the current release and unrelated application caches',async()=>{
  const current=(await app.caches.keys())[0];await seed(app.caches,current+'-previous','./old.html','old app shell');await seed(app.caches,'other-field-app','./other.html','foreign cache');await seed(app.caches,'nightsweep-shell-%2Fother%2F-previous','./other/index.html','other NightSweep deployment');await app.emit('activate');
  assert((await app.caches.keys()).includes(current));assert(!(await app.caches.keys()).includes(current+'-previous'));assert((await app.caches.keys()).includes('other-field-app'));assert((await app.caches.keys()).includes('nightsweep-shell-%2Fother%2F-previous'));assert.equal((await app.status()).ready,true);assert.equal(app.life.claim,1);
 });
 await check('Explicit repair recovers an evicted active copy using verified release assets',async()=>{
  const current=(await app.caches.keys())[0],cache=await app.caches.open(current);await cache.delete('./index.html');assert.equal((await app.status()).ready,false);app.context.offline=false;let reply;
  await app.emit('message',{data:{type:'REPAIR_OFFLINE'},ports:[{postMessage(m){reply=m;}}]});assert.equal(reply.type,'OFFLINE_REPAIRED');assert.equal(reply.ready,true);assert.equal((await app.status()).ready,true);app.context.offline=true;assert.equal(await htmlResponse(await app.get('./',{mode:'navigate'})),html);
 });
 await check('Failed repair reports incomplete readiness and does not remove another saved release',async()=>{
  const caches=new CacheStorage();await seed(caches,'nightsweep-shell-%2F-previous','./index.html','previous release');const broken=boot({caches,offline:true});let reply;await broken.emit('message',{data:{type:'REPAIR_OFFLINE'},ports:[{postMessage(m){reply=m;}}]});assert.equal(reply.type,'OFFLINE_REPAIRED');assert.equal(reply.ready,false);assert.equal((await broken.status()).ready,false);assert.equal(await(await caches.match('./index.html')).text(),'previous release');
 });
 await check('A scoped deployment caches its own app and does not intercept sibling navigation',async()=>{
  const scoped=boot({scope:base+'mobile/'});await scoped.emit('install');scoped.context.offline=true;assert.equal(await htmlResponse(await scoped.get('./?job=42',{mode:'navigate'})),html);assert.equal(await scoped.get('/unrelated/',{mode:'navigate'}),undefined);
 });
 await check('Canonical HTML aliases stay inside a nested deployment scope',async()=>{
  const scoped=boot({scope:base+'mobile/',canonicalHTML:true});await scoped.emit('install');scoped.context.offline=true;assert.equal(await htmlResponse(await scoped.get('install',{mode:'navigate'})),fs.readFileSync(path.join(dist,'install.html'),'utf8'));assert.equal(await htmlResponse(await scoped.get('guide',{mode:'navigate'})),fs.readFileSync(path.join(dist,'guide.html'),'utf8'));for(const url of ['/guide','/install','/unrelated/guide'])assert.equal(await scoped.get(url,{mode:'navigate'}),undefined);
 });
 await check('Android and iPhone instruction links remain available offline at clean and HTML paths',async()=>{
  for(const [clean,asset] of [['android','android.html'],['iphone','iphone.html']]){
   for(const url of [clean,asset,clean+'?from=home'])assert.equal(await htmlResponse(await canonical.get(url,{mode:'navigate'})),fs.readFileSync(path.join(dist,asset),'utf8'));
  }
  assert.equal(canonical.requests.length,0);
 });
 await check('A missing Android instruction page cannot produce a complete offline release',async()=>{
  const broken=boot({failPath:'android.html'});await assert.rejects(broken.emit('install'));assert.equal((await broken.status()).ready,false);assert.deepEqual(await broken.caches.keys(),[]);
 });
 await check('Android install instructions open the existing app origin and preserve its manifest identity',()=>{
  const doc=fs.readFileSync(path.join(dist,'android.html'),'utf8'),install=fs.readFileSync(path.join(dist,'install.html'),'utf8'),manifest=JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));
  assert.match(doc,/https:\/\/nightsweep-field\.goodst3r\.chatgpt\.site\/">Open Carpe Noctum/);
  assert.match(doc,/APK and web app keep separate data/);assert.match(doc,/Install and create shortcut/);assert.match(doc,/Files → Back up project/);
  assert.equal(manifest.id,'./');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.match(install,/href="android.html"/);assert.match(install,/href="iphone.html"/);
  assert(!/<script\b/i.test(doc),'guide does not create another application or storage origin');
 });
 fs.writeFileSync(path.join(__dirname,'pwa-worker-results.json'),JSON.stringify({count:cases.length,cases,scope:'VM worker lifecycle and CacheStorage/fetch simulation, not browser or device offline certification.'},null,2)+'\n');
 console.log('PWA worker: '+cases.length+' checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
