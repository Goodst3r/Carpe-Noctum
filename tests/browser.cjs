const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');
const { PDFDocument, StandardFonts, PDFString, moveTo, lineTo, closePath, stroke, setLineWidth } = require('pdf-lib');
const { zipSync, gzipSync, strToU8 } = require('fflate');

const dist = path.resolve(__dirname, '..', 'dist');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.ico': 'image/x-icon',
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

async function syntheticOnxZip() {
  const frequencies=Array.from({length:98},(_,i)=>57+696*i/97);
  const levels=frequencies.map((_,i)=>11.4+11.9*i/97);
  const data = {
    testGroup: { id: 'synthetic', tests: [{ id: 'synthetic-test',
      setupGroups: [{ id: 'testPointTemplate', configs: [{ id: 'forwardTestPointCompensation', value: 0, units: 'dB' }] }],
      resultGroups: [{ id: 'synthetic-result', resultSeries: [{ id: 'levels',
        independent: { label: 'Frequency', units: 'MHz', values: frequencies },
        dependent: [{ label: 'Absolute', units: 'dBmV', values: levels }],
      }] }],
    }] },
  };
  return zipSync({ 'synthetic.onx.json': strToU8(JSON.stringify(data)) });
}

async function syntheticMapPdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([612, 792]);
  page.drawText('Synthetic practice map', { x: 40, y: 740, size: 16, font });
  for (const [tag, x] of [['A1', 170], ['E1', 430]]) {
    page.drawCircle({ x, y: 500, size: 18, borderWidth: 1.5 });
    page.drawText(tag, { x: x - 8, y: 495, size: 11, font });
  }
  page.drawLine({ start: { x: 188, y: 500 }, end: { x: 412, y: 500 }, thickness: 1 });
  return Buffer.from(await pdf.save());
}

async function verifyAnonymousEndFlow(browser,url,check) {
  const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica),map=pdf.addPage([400,400]);
  map.pushOperators(setLineWidth(.07),moveTo(47,197),lineTo(53,200),lineTo(47,203),closePath(),stroke());
  map.node.addAnnot(pdf.context.register(pdf.context.obj({Type:'Annot',Subtype:'FreeText',Rect:[48,198,51,202],Contents:PDFString.of('A1'),DA:PDFString.of('/Helv 10 Tf 0 g')})));
  map.pushOperators(setLineWidth(.01),moveTo(53,200),lineTo(250,200),stroke());
  const active=pdf.addPage([1000,800]);for(const [text,x,y]of [['ACTIVES - 1',10,760],['TAG',10,720],['NAME',120,720],['A1',10,680],['Synthetic amplifier',110,680]])active.drawText(text,{x,y,size:12,font});
  const eol=pdf.addPage([1000,800]);for(const [text,x,y]of [['EOL - 1',10,760],['TAG',10,720],['E1',10,680]])eol.drawText(text,{x,y,size:12,font});
  const context=await browser.newContext();try {const page=await context.newPage();await page.goto(url);await page.locator('[data-split=low]').click();const [pick]=await Promise.all([page.waitForEvent('filechooser'),page.locator('[data-action=map-import]').first().click()]);await pick.setFiles({name:'synthetic-unlabeled-end.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});await page.waitForSelector('#map-review-title');await page.locator('[data-action=review-import]').click();await page.waitForFunction(()=>document.querySelector('#map-canvas')?.dataset.ready);
  check('native anonymous terminal and unplaced schedule entry both reach the review queue',/\(2\)/.test(await page.locator('.unplaced-queue summary').innerText()));
  await page.locator('.unplaced-queue summary').click();await page.locator('.unplaced-list [data-select]').click();const id=await page.locator('#eol-identity option').filter({hasText:'E1'}).getAttribute('value');await page.locator('#eol-identity').selectOption(id);await page.locator('[data-action=assign-eol-identity]').click();
  check('explicit end matching keeps the E1 identity and leaves position unconfirmed',await page.locator('#station-form [name=tag]').inputValue()==='E1'&&!await page.locator('#station-form [name=confirmed]').isChecked());
  check('matched anonymous candidate is removed from the queue',/\(0\)/.test(await page.locator('.unplaced-queue summary').innerText()));
  }finally{await context.close();}
}

async function main() {
  assert.ok(fs.existsSync(path.join(dist, 'index.html')), `Built PWA missing at ${dist}/index.html; run npm run build first`);
  const executable = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(executable ? { executablePath: executable } : {}), args: ['--no-sandbox'] });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const dialogAnswers = [];
    page.on('dialog', async dialog => {
      const answer = dialogAnswers.length ? dialogAnswers.shift() : true;
      if (dialog.type() === 'prompt') await dialog.accept(String(answer));
      else if (answer === false) await dialog.dismiss();
      else await dialog.accept();
    });
    const failures = [];
    const check = (name, condition, detail='') => {
      if (condition) console.log(`PASS ${name}`);
      else { const failure = `${name}${detail ? `: ${detail}` : ''}`; failures.push(failure); console.error(`FAIL ${failure}`); }
    };
    const openRoute = async split => {
      await page.locator('[data-tab="route"]').click();
      await page.locator(`[data-split="${split}"]`).click();
      await page.waitForSelector('#station-form');
    };

    await verifyAnonymousEndFlow(browser,url,check);
    await page.goto(url, { waitUntil: 'networkidle' });
    check('map upload is the launch action',await page.locator('[data-action="start-map"]').count()===1);
    await page.locator('[data-tab="tools"]').click();
    await page.locator('#calc [name="loss"]').fill('2');
    await page.locator('#calc [name="length"]').fill('250');
    const wholeDbValid = await page.locator('#calc').evaluate(form => form.checkValidity());
    check('calculator accepts a whole-number loss input', wholeDbValid, 'loss=2 dB/100 ft');
    await page.locator('#calc [name="loss"]').fill('2.5');
    await page.locator('#calc button[type="submit"]').click();
    const calcText = await page.locator('#result').innerText();
    check('Tools calculator returns a numeric result', calcText.includes('6.3 dB loss'), calcText);

    await page.locator('[data-tab="route"]').click();
    check('Route requires explicit split before job creation', await page.locator('[data-split="low"]').count() === 1 && await page.locator('#station-form').count() === 0);
    await page.locator('[data-split="low"]').click();
    await page.locator('#station-settings summary').click();
    const blankNode = await page.evaluate(() => {
      const h = document.querySelector('.station-detail h2')?.textContent;
      return { title:h, settingsOpen:document.querySelector('#station-settings')?.open,
        manualOpen:document.querySelector('#manual-reading')?.open };
    });
    check('low split creates a blank GS7K node with manual entry collapsed', blankNode.title === 'GS7K Node' && blankNode.settingsOpen && !blankNode.manualOpen && await page.locator('#manual-reading [name="samples"]').inputValue() === '');

    await page.locator('#station-form [name="modelId"]').selectOption('gs7k');
    await page.locator('#station-form [name="kind"]').selectOption('node');
    await page.locator('#station-form button.primary').click();
    await page.waitForTimeout(80);
    check('station model can be selected and saved', await page.locator('.station-detail').innerText().then(t => t.includes('GS7K')));

    dialogAnswers.push('Amplifier A', 'active');
    await page.locator('[data-action="add-node"]').click();
    await page.waitForSelector('#station-form');
    check('manual station can be added', await page.locator('.station-row').count() === 2 && (await page.locator('.station-list').innerText()).includes('Amplifier A'));

    await page.locator('[data-action="connect"]').click();
    await page.locator('#edge-form [name=from]').selectOption({label:'GS7K Node'});
    await page.locator('#edge-form [name=to]').selectOption({label:'Amplifier A'});
    await page.locator('#edge-form [name=port]').selectOption('1');
    await page.locator('#edge-form [name=cableId]').selectOption('commscope_rg6');
    await page.locator('#edge-form [name=length]').fill('125');
    await page.locator('#edge-form [name=confirmed]').check();
    await page.locator('#edge-form button[type=submit]').click();
    const edgeCount = await page.locator('.edge-row').count();
    check('manual physical edge can be created', edgeCount === 1);
    const edgeLine = edgeCount ? await page.locator('.edge-row').innerText() : await page.locator('.notice').innerText();
    check('manual edge stores physical port and length', edgeLine.includes('/ 1') && edgeLine.includes('125 ft'), edgeLine);

    await page.locator('#trace-mode').selectOption('destinations');
    check('route exposes selected destination trace mode', await page.locator('#trace-mode').inputValue() === 'destinations' && await page.locator('#destination-search').count() === 1);
    check('station trace selector offers one selected trace at a time', (await page.locator('#sweep-select option').allTextContents()).join('|') === 'Target|Predicted|Measured');

    const onx = await syntheticOnxZip();
    const onxChooser = page.waitForEvent('filechooser');
    await page.locator('.station-row').filter({ hasText:'GS7K Node' }).click();
    await page.locator('[data-import-port="1"]').click();
    await (await onxChooser).setFiles({ name: 'synthetic.onx', mimeType: 'application/zip', buffer: Buffer.from(onx) });
    await page.waitForSelector('#onx-review-title');
    check('ONX review uses explicit origin station and physical port despite filename', await page.locator('#onx-station').inputValue()==='node' && await page.locator('#onx-port').inputValue()==='1');
    await page.locator('#onx-connection').selectOption('tp');
    await page.locator('#onx-loss').fill('20');
    await page.locator('#onx-review-form button[type=submit]').click();
    await page.waitForSelector('#onx-review-title',{state:'detached'});
    const onxStatus = await page.locator('.notice').count() ? await page.locator('.notice').innerText() : '(no status message)';
    check('synthetic ONX ZIP import confirms and stores corrected node port 1 samples', /Saved after sweep for GS7K Node, port 1/i.test(onxStatus), onxStatus);

    const getStoredNode = () => page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('carpe-noctum:jobs:v1')))[0].nodes.find(n=>n.id==='node'));
    const beforeEvidence = await getStoredNode();
    check('forward ONX saves corrected target and normalized report together', beforeEvidence.readings['1'].samples[0][1]===31.4 && beforeEvidence.measurementReports.length===1);
    const diagnostic = kind => gzipSync(strToU8(JSON.stringify({cdmVersion:'2.0',tests:[{type:kind==='reverse'?'sweepmode_app':'onecheckexpert',label:kind==='reverse'?'Sweep - Reverse Sweepless':'OneCheck',results:{data:{chart:{Referenced:{units:['MHz',kind==='reverse'?'dB':'dBmV'],data:[[10,1],[20,2]]}},table:{label:'Diagnostic <img src=x onerror="globalThis.onxUnsafe=1">',tableColumnHeaders:['Status'],tableData:[[{value:'<script>globalThis.onxUnsafe=1</script>',status:'PASS'}]]}}}}]})));
    for(const kind of ['reverse','onecheck']) {
      const chooser=page.waitForEvent('filechooser');await page.locator('[data-import-port="1"]').click();
      await (await chooser).setFiles({name:'advisory-c6.cdm.json.gz',mimeType:'application/gzip',buffer:Buffer.from(diagnostic(kind))});
      await page.waitForSelector('#onx-review-title');
      check(kind+' review offers evidence only with no correction',await page.locator('#onx-connection').count()===0 && await page.locator('#onx-review-form').innerText().then(t=>t.includes('evidence only')));
      await page.locator('#onx-review-form button[type=submit]').click();await page.waitForSelector('#onx-review-title',{state:'detached'});
      const after=await getStoredNode();
      check(kind+' report leaves forward RF intact',JSON.stringify(after.readings)===JSON.stringify(beforeEvidence.readings));
      check(kind+' diagnostic markup remains inert', await page.locator('.measurement-reports script,.measurement-reports img').count()===0 && await page.evaluate(()=>!globalThis.onxUnsafe));
    }
    check('reports display metadata, series units and diagnostic table text',await page.locator('.measurement-reports').innerText().then(t=>t.includes('Imported measurement reports')));
    const reportsBeforeCancel=(await getStoredNode()).measurementReports.length;
    const cancelChooser=page.waitForEvent('filechooser');await page.locator('[data-import-port="1"]').click();
    await (await cancelChooser).setFiles({name:'cancel-synthetic.onx',mimeType:'application/zip',buffer:Buffer.from(onx)});await page.waitForSelector('#onx-review-title');await page.locator('[data-action=onx-cancel]').click();
    check('cancel ONX review preserves existing measurements and report count',(await getStoredNode()).measurementReports.length===reportsBeforeCancel && await page.locator('#onx-review-title').count()===0);

    await page.locator('.station-row').filter({ hasText:'Amplifier A' }).click();
    await page.locator('#station-form [name="name"]').fill('Amplifier A');
    await page.locator('#station-form [name="tag"]').fill('A1');
    await page.locator('#station-form [name="kind"]').selectOption('active');
    await page.locator('#station-form [name="modelId"]').selectOption('gm-hgd-42');
    await page.locator('#station-form [name="mode"]').selectOption('agc');
    await page.locator('#station-form [name="pilotMHz"]').fill('753');
    await page.locator('#station-form [name="director"]').selectOption('splitter');
    await page.locator('#station-form button.primary').click();
    const hgdCards = await page.locator('.port-card').evaluateAll(cards => cards.map(card => ({ port:card.querySelector(':scope > span')?.textContent, text:card.innerText })));
    const mainCard = hgdCards.find(card => card.port === 'MAIN')?.text || '';
    const aux1Card = hgdCards.find(card => card.port === 'AUX1')?.text || '';
    const aux2Card = hgdCards.find(card => card.port === 'AUX2')?.text || '';
    const recommendation = await page.locator('.parts-summary').innerText();
    check('measured node port 1 feeds HGD main and auxiliary targets', mainCard.includes('31.4 @ 57.0 MHz → 43.3 @ 753.0 MHz') && aux1Card.includes('27.9 @ 57.0 MHz → 39.8 @ 753.0 MHz') && aux2Card.includes('27.9 @ 57.0 MHz → 39.8 @ 753.0 MHz'), JSON.stringify({ mainCard,aux1Card,aux2Card }));
    check('HGD part recommendation includes the actual EQ part number and AGC pilot pad', /EQ 4007239/.test(recommendation) && /AGC pad 9\.5 dB/.test(recommendation), recommendation);
    await page.locator('#sweep-select').selectOption('target');
    const traceGraph = await page.locator('.trace-summary').evaluate(el => ({ label:el.querySelector('span')?.textContent, charts:el.querySelectorAll('svg.sweep-chart').length, polylines:el.querySelectorAll('svg.sweep-chart polyline').length, points:el.querySelector('svg.sweep-chart polyline')?.getAttribute('points')?.trim().split(/\s+/).length }));
    check('HGD target graph displays one selected physical-port trace', traceGraph.label?.includes('TARGET SWEEP') && traceGraph.charts === 1 && traceGraph.polylines === 1 && traceGraph.points === 98, JSON.stringify(traceGraph));

    await page.locator('[data-action="save"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('Job saved on this device'));
    await page.locator('[data-action="new"]').click();
    await page.waitForSelector('[data-split="low"]');
    await page.locator('summary').filter({ hasText: 'Job library' }).click();
    await page.locator('[data-open]').first().click();
    await page.waitForFunction(() => document.body.innerText.includes('Job opened'));
    await page.locator('.station-row').filter({ hasText:'GS7K Node' }).click();
    check('saved route and node measurement reopen from the job library', await page.locator('.edge-row').count() === 1 && await page.locator('#reading-stage option').count() >= 1);

    const map = await syntheticMapPdf();
    // Import the map only, retaining this configured HGD for explicit physical placement.
    const mapStart=Date.now();
    const mapChooser = page.waitForEvent('filechooser');
    await page.locator('[data-action="map-import"]').first().click();
    await (await mapChooser).setFiles({ name: 'synthetic-practice.pdf', mimeType: 'application/pdf', buffer: map });
    await page.waitForSelector('#map-review-title');
    await page.locator('[data-action="review-map-only"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('Map imported'));
    check('synthetic PDF map is read and imported after confirmation', await page.locator('.map-toolbar').count() === 1);
    await page.waitForFunction(() => document.querySelector('#map-canvas')?.width > 0);
    check('imported PDF map renders a page canvas', await page.locator('#map-canvas').evaluate(c => c.width > 0 && c.height > 0));
    check('synthetic map renders in bounded time', Date.now()-mapStart < 30000, `${Date.now()-mapStart} ms`);
    check('embedded PDFLib UMD writer is available in the built PWA', await page.evaluate(() => typeof window.PDFLib?.PDFDocument?.load === 'function'));
    check('map opens as full-page workspace',await page.locator('.map-focus').count()===1);
    for(const width of [320,360,390]) { await page.setViewportSize({width,height:844});const bounds=await page.locator('.map-focus .map-panel>.section-head button').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return {text:b.textContent,left:r.left,right:r.right};}));check(`all map header actions accessible at ${width}px`,bounds.every(b=>b.left>=0&&b.right<=width),JSON.stringify(bounds)); }
    await page.setViewportSize({width:1280,height:900});

    await page.waitForFunction(()=>!!document.querySelector('#map-canvas')?.dataset.ready);
    const beforeZoom=await page.locator('[data-zoom-label]').innerText();
    await page.locator('[data-action="zoom-in"]').click();
    check('zoom updates the viewport without replacing the canvas',await page.locator('[data-zoom-label]').innerText()!==beforeZoom);
    await page.locator('[data-action="fit-map"]').click();
    await page.locator('[data-action="scan-open"]').click();
    await page.waitForSelector('.map-scan-panel canvas');
    check('online scan requires reviewing the flattened preview',await page.locator('[data-action="review-send"]').isDisabled());
    await page.locator('.map-scan-panel [data-action="close"]').click();
    await page.locator('[data-action="map-focus"]').click();
    await page.locator('[data-action="map-edit"]').click();
    await page.locator('.station-row').filter({ hasText:'Amplifier A' }).click();
    await page.locator('[data-action="assign-map"]').click();
    const mapOverlay = page.locator('.map-overlay');
    const mapScroll=page.locator('.map-scroll');
    const a1Y=1-500/792;
    await mapScroll.evaluate((el,f)=>{el.scrollTop=Math.max(0,el.scrollHeight*f-el.clientHeight*.5);},a1Y);
    const overlayBox = await mapOverlay.boundingBox();
    assert.ok(overlayBox, 'PDF page overlay must render before confirming HGD map position');
    await mapOverlay.click({position:{x:overlayBox.width*(170/612),y:overlayBox.height*a1Y}});
    await page.waitForFunction(() => document.body.innerText.includes('Station position assigned'));
    check('HGD station position is confirmed on the same page as source map label A1', await page.locator('.screen-marker.selected').count() === 1 && await page.locator('.tombstone.selected').count() === 1 && await page.locator('.map-toolbar').innerText().then(t => /Page 1 \/ 1/.test(t)));
    // Bind the source too, then verify that two map taps open an editable draft and cancel leaves the route unchanged.
    await page.locator('.station-row').filter({hasText:'GS7K Node'}).click();
    await page.locator('[data-action="assign-map"]').click();
    await mapScroll.evaluate((el,f)=>{el.scrollTop=Math.max(0,el.scrollHeight*f-el.clientHeight*.5);},a1Y);
    const sourceOverlay=await mapOverlay.boundingBox();
    await mapOverlay.click({position:{x:sourceOverlay.width*.1,y:sourceOverlay.height*a1Y}});
    const priorEdges=await page.locator('.edge-row').count();
    await page.locator('[data-action="map-connect"]').first().click();
    for(const station of ['GS7K Node','Amplifier A']) {
      const direct=page.locator('.screen-marker[aria-label="'+station+'"]');
      if(await direct.count())await direct.click();
      else {await page.locator('.screen-marker.cluster').first().click();await page.locator('.marker-chooser button').filter({hasText:station}).click();}
    }
    check('two map endpoint taps open connection editor',await page.locator('#edge-form').isVisible());
    await page.locator('[data-action="cancel-edge"]').click();
    check('cancelling map connection leaves route unchanged',await page.locator('.edge-row').count()===priorEdges);
    await page.locator('.station-row').filter({hasText:'Amplifier A'}).click();
    const tombstone = page.locator('.tombstone.selected');
    const beforePosition = await tombstone.getAttribute('style');
    await page.locator('[data-action="place"]').click();
    await page.waitForFunction(()=>!!document.querySelector('#map-canvas')?.dataset.ready);
    await page.locator('[data-action="fit-map"]').click();
    await mapScroll.scrollIntoViewIfNeeded();
    await page.evaluate(() => { window.__tombstonePointerLog=[]; for(const type of ['pointerdown','pointermove','pointerup']) document.addEventListener(type,e=>window.__tombstonePointerLog.push({type,target:e.target?.closest?.('[data-drag-marker]')?.dataset?.dragMarker||e.target?.className||e.target?.tagName,x:e.clientX,y:e.clientY}),true); });
    await page.locator('.map-scroll').evaluate((el,f)=>{el.scrollTop=Math.max(0,el.scrollHeight*f-el.clientHeight*.5);},a1Y);
    await page.waitForTimeout(80);
    const dragBox = await tombstone.boundingBox(), overlayDragBox = await mapOverlay.boundingBox();
    assert.ok(dragBox && overlayDragBox, 'confirmed HGD tombstone and map overlay must have rendered bounds');
    const scrollBox=await page.locator('.map-scroll').boundingBox();
    assert.ok(scrollBox, 'map scroll viewport must be visible before tombstone drag');
    const dragStart={x:dragBox.x+Math.min(dragBox.width/2,20),y:Math.max(dragBox.y+4,scrollBox.y+4)};
    assert.ok(dragStart.y<Math.min(dragBox.y+dragBox.height,scrollBox.y+scrollBox.height),'tombstone must intersect the visible PDF viewport');
    await page.mouse.move(dragStart.x,dragStart.y);
    await page.mouse.down();
    await page.mouse.move(overlayDragBox.x + overlayDragBox.width * .72, overlayDragBox.y + overlayDragBox.height * .5, { steps:8 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterPosition = await page.locator('.tombstone.selected').getAttribute('style');
    const dragStatus = await page.locator('.notice').count() ? await page.locator('.notice').innerText() : '(no placement notice)';
    const pointerLog=await page.evaluate(()=>window.__tombstonePointerLog);
    const placeLabel=await page.locator('[data-action="place"]').innerText();
    check('HGD tombstone drag moves it while retaining page 1 placement', beforePosition !== afterPosition && /Tombstone position updated/.test(dragStatus) && await page.locator('.map-toolbar').innerText().then(t => /Page 1 \/ 1/.test(t)), `${beforePosition} -> ${afterPosition}; ${dragStatus}; ${placeLabel}; ${JSON.stringify(pointerLog)}`);
    await page.locator('[data-action="save"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('Job saved on this device'));
    fs.mkdirSync(path.resolve(__dirname, '..', 'artifacts'), { recursive:true });
    await page.screenshot({ path:path.resolve(__dirname, '..', 'artifacts', 'browser.png'), fullPage:true });

    const downloadEvent = page.waitForEvent('download');
    await page.locator('[data-action="map-export"]').click();
    const download = await downloadEvent;
    check('map PDF download is produced', download.suggestedFilename().endsWith('.pdf'), download.suggestedFilename());
    const exportedBytes = fs.readFileSync(await download.path());
    const pdfSummary = await page.evaluate(async base64 => {
      const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
      const native=await window.PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
      const pdf=await window.pdfjsLib.getDocument({data:bytes,verbosity:0,isEvalSupported:false}).promise;
      const pages=[];
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i),content=await page.getTextContent();
        pages.push({text:content.items.map(item=>item.str).join(' '),items:content.items.map(item=>({text:item.str,x:item.transform[4],y:item.transform[5]}))});
      }
      return {nativePages:native.getPageCount(),readerPages:pdf.numPages,pages};
    },exportedBytes.toString('base64'));
    const pdfText=pdfSummary.pages[0]?.text||'';
    check('UMD PDF writer and reader parse the exported HGD map', pdfSummary.nativePages>=2&&pdfSummary.readerPages===pdfSummary.nativePages, JSON.stringify({nativePages:pdfSummary.nativePages,readerPages:pdfSummary.readerPages}));
    check('exported same-page PDF contains exactly one confirmed HGD tombstone', (pdfText.match(/Carpe Noctum \| A1/g)||[]).length===1&&/gm-hgd-42/.test(pdfText)&&/57 MHz: 31\.4/.test(pdfSummary.pages.map(p=>p.text).join(' '))&&/753 MHz: 43\.3/.test(pdfSummary.pages.map(p=>p.text).join(' ')), pdfText);
    const symbolItem=pdfSummary.pages[0]?.items.find(item=>item.text==='A1');
    const tombstoneItem=pdfSummary.pages[0]?.items.find(item=>item.text.includes('Carpe Noctum | A1'));
    check('exported HGD tombstone is displaced from its symbol after drag', !!symbolItem&&!!tombstoneItem&&Math.hypot(symbolItem.x-tombstoneItem.x,symbolItem.y-tombstoneItem.y)>40, JSON.stringify({symbolItem,tombstoneItem}));

    check('retired navigation names are absent', !/Home|Plan|Field|Closeout|Safety|Practice|Night log/i.test(await page.locator('nav').innerText()));
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(80);
      const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      check(`no horizontal document overflow at ${width}px`, overflow.scroll <= overflow.client + 1, JSON.stringify(overflow));
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForFunction(() => document.querySelector('.offline-controls [role="status"]')?.textContent.includes('Offline copy ready'), { timeout: 30000 });
    check('service worker reports offline copy ready', true);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-tab="route"]');
    check('app reloads with network offline', await page.locator('nav').innerText().then(t => t.includes('Route & Sweep')));
    const offlineFetch = await page.evaluate(async () => {
      try { const response = await fetch('/uncached-offline-probe.txt', { cache: 'no-store' }); return { ok: response.ok, status: response.status }; }
      catch (error) { return { ok: false, error: error.name }; }
    });
    check('uncached request fails while browser is offline', !offlineFetch.ok, JSON.stringify(offlineFetch));
    await page.locator('[data-tab="route"]').click();
    await page.locator('[data-split="high"]').click();
    await page.locator('[data-action="save"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('Job saved on this device'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-tab="route"]').click();
    await page.locator('summary').filter({ hasText: 'Job library' }).click();
    check('new job persists across offline reload', await page.locator('[data-open]').count() >= 2);

    check('no uncaught browser page errors', pageErrors.length === 0, pageErrors.join(' | '));
    await context.setOffline(false);
    await context.close();
    await browser.close();
    browser = null;
    if (failures.length) throw new Error(`${failures.length} browser assertion(s) failed:\n${failures.join('\n')}`);
  } catch (error) {
    console.error('BROWSER_FLOW_ERROR', error.stack || error);
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
