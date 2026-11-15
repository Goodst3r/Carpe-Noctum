const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const dist = path.resolve(__dirname, '..', 'dist');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end(); return; }
    if (pathname === '/') pathname = '/index.html';
    const file = path.resolve(dist, `.${pathname}`);
    if (!file.startsWith(`${dist}${path.sep}`) && file !== path.join(dist, 'index.html')) {
      res.writeHead(403).end(); return;
    }
    fs.readFile(file, (error, body) => {
      if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500).end(); return; }
      res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(body);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/` })));
}

async function syntheticImage() {
  return Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 300;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000'; ctx.textBaseline = 'middle'; ctx.font = 'bold 110px Arial'; ctx.fillText('CARPE', 48, 100);
    ctx.font = 'bold 84px Arial'; ctx.fillText('57 MHz', 48, 225);
    return canvas.toDataURL('image/png').split(',')[1];
  }), 'base64');
}

let page;
async function main() {
  if (!fs.existsSync(path.join(dist, 'index.html')) || !fs.existsSync(path.join(dist, 'ai', 'worker.js')))
    throw new Error(`Built PWA/AI files missing under ${dist}; root must build the app first`);
  const executable = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const { server, url } = await startServer();
  let browser;
  const failures = [];
  const check = (name, condition, detail='') => {
    if (condition) console.log(`PASS ${name}`);
    else { const failure = `${name}${detail ? `: ${detail}` : ''}`; failures.push(failure); console.error(`FAIL ${failure}`); }
  };
  try {
    browser = await chromium.launch({ headless: true, ...(executable ? { executablePath: executable } : {}), args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const pageErrors = [], requests = [];
    page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => requests.push(request.url()));

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('[data-tab="tools"]').click();
    const aiPanel = page.locator('[data-ai-panel]');
    await aiPanel.locator('summary').click();
    await page.waitForFunction(() => document.querySelector('[data-ai-status]')?.textContent.includes('Not installed'));
    check('Tools exposes the bundled PP-OCRv6 Tiny model in the optional local image panel', await page.locator('[data-ai-model]').inputValue() === 'pp-ocrv6-tiny');

    await page.locator('[data-ai="bundled"]').click();
    await page.waitForFunction(() => document.querySelector('[data-ai-message]')?.textContent.includes('Finished.'), null, { timeout: 120000 });
    check('included OCR pack downloads from the same-origin PWA bundle and verifies locally', await page.locator('[data-ai-status]').innerText().then(t => t.includes('Available on this device.')));
    const modelRequests = requests.filter(u => new URL(u).pathname.startsWith('/ai/'));
    const runtimeAssets = await page.evaluate(async () => Promise.all(['/ai/ort-wasm-simd-threaded.wasm','/ai/ort-wasm-simd-threaded.mjs'].map(async path => { const r=await fetch(path); return {path,ok:r.ok,type:r.headers.get('content-type')}; })));
    check('AI worker and model files load from the same-origin PWA; bundled runtime assets are served locally', modelRequests.some(u => u.includes('/ai/worker.js')) && modelRequests.some(u => u.includes('/ai/models/pp-ocrv6-tiny/')) && runtimeAssets.every(x => x.ok), JSON.stringify({modelRequests,runtimeAssets}));
    check('bundled model installation made no external network request', requests.every(u => new URL(u).origin === new URL(url).origin), requests.filter(u => new URL(u).origin !== new URL(url).origin).join('\n'));

    const image = await syntheticImage();
    await page.locator('[data-ai-image]').setInputFiles({ name:'synthetic-labels.png', mimeType:'image/png', buffer:image });
    check('synthetic OCR image is selected for local review', await page.locator('[data-ai-message]').innerText().then(t => t.includes('Image ready for local review.')));
    await page.locator('[data-ai="run"]').click();
    await page.waitForFunction(() => document.querySelector('[data-ai-message]')?.textContent.includes('Finished.'), null, { timeout: 120000 });
    const output = await page.locator('[data-ai-panel] pre').innerText();
    check('bundled model performs real on-device OCR for synthetic labels', /CARPE/i.test(output) && /57/i.test(output), output);
    check('OCR results are marked for review and are presented as proposals', /"reviewRequired": true/.test(output) && /"kind": "text"/.test(output), output.slice(0, 1200));
    check('OCR leaves route/job state untouched', await page.locator('[data-tab="route"]').count() === 1 && await page.locator('.station-row').count() === 0);

    await page.waitForFunction(() => document.querySelector('.offline-controls [role="status"]')?.textContent.includes('Offline copy ready'), null, { timeout: 30000 });
    await context.setOffline(true);
    await page.reload({ waitUntil:'domcontentloaded' });
    await page.locator('[data-tab="tools"]').click();
    await page.locator('[data-ai-panel] summary').click();
    await page.waitForFunction(() => document.querySelector('[data-ai-status]')?.textContent.includes('Available on this device.'), null, { timeout: 30000 });
    check('bundled model remains installed after offline app reload', await page.locator('[data-ai-status]').innerText().then(t => t.includes('Available on this device.')));
    await page.locator('[data-ai-image]').setInputFiles({ name:'synthetic-labels.png', mimeType:'image/png', buffer:image });
    await page.locator('[data-ai="run"]').click();
    await page.waitForFunction(() => document.querySelector('[data-ai-message]')?.textContent.includes('Finished.'), null, { timeout: 120000 });
    const offlineOutput = await page.locator('[data-ai-panel] pre').innerText();
    check('cached AI model runs while browser is offline without network inference requests', /CARPE/i.test(offlineOutput) && /57/i.test(offlineOutput), offlineOutput);
    const offlineProbe = await page.evaluate(async () => { try { const r=await fetch('/uncached-ai-offline-probe.txt',{cache:'no-store'}); return {ok:r.ok,status:r.status}; } catch(e) { return {ok:false,error:e.name}; } });
    check('uncached request fails offline after successful inference', !offlineProbe.ok, JSON.stringify(offlineProbe));
    check('offline OCR made no external request', requests.every(u => new URL(u).origin === new URL(url).origin), requests.filter(u => new URL(u).origin !== new URL(url).origin).join('\n'));
    check('AI worker and UI report no uncaught browser errors', pageErrors.length === 0, pageErrors.join(' | '));

    await context.setOffline(false);
    await context.close();
    await browser.close(); browser = null;
    if (failures.length) throw new Error(`${failures.length} browser AI assertion(s) failed:\n${failures.join('\n')}`);
  } catch (error) {
    console.error('BROWSER_AI_FLOW_ERROR', error.stack || error);
    if (browser) await browser.close().catch(() => {});
    server.close();
    process.exitCode = 1;
    return;
  }
  server.close();
}

main();
