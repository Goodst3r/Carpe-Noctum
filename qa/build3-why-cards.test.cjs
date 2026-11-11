/* Build 3 Why cards (build list item 18): the fourteen SCTE 293 "What is …?" cards. Checks the titles and years against the
   SCTE catalog list typed into research/build3/why-cards-reference.json, that every card links only to screens that exist, that
   the cards hold no figure that is not registered, that none repeats SCTE's own definitions, the rendered screen, the registry
   row and that nothing is stored. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const reference = JSON.parse(fs.readFileSync('research/build3/why-cards-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [];
let comparisons = 0;
const boot = () => require('./build2-source-harness.cjs').bootApp({ html });
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const eq = (a, b, label) => { assert.deepEqual(a, b, label); comparisons++; };

(async () => {
  const h = boot();
  await flush();

  await check('The fourteen cards are SCTE 293-1 to 293-14 with the titles and years the SCTE catalog prints', () => {
    const topics = h.json('WhyCards.TOPICS');
    eq(topics.map(t => ({ n: t.n, year: t.year, title: t.title })), reference.topics, 'catalog rows');
    eq(h.json('WhyCards.TOPICS.map(t=>WhyCards.cite(t))'), reference.topics.map(t => `SCTE 293-${t.n} ${t.year}`), 'citations');
    assert.equal(h.ev('WhyCards.SERIES'), 'SCTE 293');
  });

  await check('Every card says what and why in its own words, links only to screens that exist, and none repeats an SCTE definition', async () => {
    assert.deepEqual(h.json('WhyCards.selfCheck()'), []);
    for (const t of h.json('WhyCards.TOPICS')) {
      for (const tool of t.tools) { await goto(h, 'projects'); await goto(h, tool.task); assert.equal(h.ev('WorkflowUI.current()'), tool.task, `card ${t.n} links to ${tool.task}`); comparisons++; }
    }
    const all = h.json('WhyCards.TOPICS').map(t => t.what + ' ' + t.why).join(' ');
    // Phrases from SCTE's own definitions and text (read November 11, 2026): the cards must not repeat them.
    for (const phrase of ['logarithmic-based expression', 'ratio, in decibels, of the power incident', 'speed at which an electromagnetic wave propagates', 'unit of RF power expressed in terms of voltage', 'is one in a series of technical monographs', 'high-level overview', 'for those who may have forgotten', 'a decrease in the power of a signal', 'depth at which the current density']) assert(!all.toLowerCase().includes(phrase), 'repeats: ' + phrase);
    // No figure on a card except the definitions and the registered ones: the base of the logarithm (10), the 1 millivolt reference, a distance of 3 m, per 6 MHz and 75 ohms.
    const figures = new Set((all.match(/\d+(?:\.\d+)?/g) || []));
    assert.deepEqual([...figures].sort(), ['1', '10', '3', '6', '75']);
    comparisons += 4;
  });

  await check('The screen is Test → Why cards after High split and shows only there; all fourteen cards are listed with their citation, and the tool buttons open their screens', async () => {
    await goto(h, 'projects'); assert.equal(h.d.getElementById('whyPanel').hidden, true);
    await goto(h, 'why');
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(-3), ['Fiber', 'High split', 'Why cards']);
    assert.equal(h.d.getElementById('whyPanel').hidden, false); assert.match(h.d.getElementById('screenTitle').textContent, /Why cards: the basics in plain words/);
    const cards = [...h.d.querySelectorAll('#whyPanel details.why-card')]; assert.equal(cards.length, 14);
    cards.forEach((c, i) => { const n = reference.topics[i]; assert.match(c.querySelector('summary').textContent, new RegExp(`SCTE 293-${n.n} ${n.year}`)); assert(c.querySelector('.why-source').textContent.includes(n.title), 'source line names the title ' + n.n); });
    for (const n of [8, 11, 13]) assert.match(words(h.d.querySelector(`[data-why="${n}"]`)), /The app has no screen for this topic yet/);
    assert.equal(h.d.querySelectorAll('#whyPanel .why-go').length, h.json('WhyCards.TOPICS.reduce((a,t)=>a+t.tools.length,0)'));
    const unity = h.d.querySelector('[data-why="5"] [data-why-go="station"]'); assert(unity); unity.click(); await flush(); assert.equal(h.ev('WorkflowUI.current()'), 'station');
    await goto(h, 'why');
    const text = words(h.d.getElementById('whyPanel'));
    assert.match(text, /They are a summary, not a copy/); assert.match(text, /free to download/);
    assert.match(text, /A bare dB is only ever a ratio/); assert.match(text, /It has nothing to do with the loss of the return \(upstream\) path/);
  });

  await check('Every tag is one registry row, the impedance row is a labeled secondary spec value, and Limits shows one tag for every row', async () => {
    await goto(h, 'why');
    const ids = new Set();
    for (const t of h.d.querySelectorAll('#whyPanel [data-threshold]')) { assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold); ids.add(t.dataset.threshold); }
    for (const id of ['calc.db.dbm', 'calc.db.dbuv', 'calc.ofdm.bandwidth', 'calc.ripple.distance', 'const.speedOfLight', 'calc.alignment.balance', 'leak.normalize.distance', 'const.coax.impedance']) assert(ids.has(id), 'tag for ' + id);
    const r = h.json('Thresholds.get("const.coax.impedance")');
    assert.equal(r.label, 'spec'); assert.equal(r.value, 75); assert.equal(r.units, 'Ω'); assert.equal(r.verification, 'secondary'); assert.equal(r.scope, 'all'); assert.match(r.source, /SCTE 293-14 2026/); assert.match(r.revision, /not/);
    await goto(h, 'limits');
    assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
  });

  await check('Opening the screen reads nothing and writes nothing: the saved job and every storage key are unchanged', async () => {
    const x = boot(); await flush();
    const before = JSON.stringify(x.json('evidenceExportProject(state)')), values = JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)]));
    await goto(x, 'why'); x.d.querySelector('[data-why="1"] summary').click(); await goto(x, 'why');
    assert.equal(JSON.stringify(x.json('evidenceExportProject(state)')), before);
    assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)])), values);
    assert.equal(x.d.querySelectorAll('#whyPanel input,#whyPanel textarea,#whyPanel select').length, 0, 'no input to type into');
    assert(!('why' in x.json('state')), 'no new job field');
    assert.deepEqual(x.errors, []); x.close();
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const WhyCards=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 why cards: ${cases.length} checks passed (${comparisons} comparisons with the catalog list)`);
  fs.writeFileSync('qa/build3-why-cards-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App cards against the SCTE catalog list typed into why-cards-reference.json (kept in research/build3), plus the rendered screen, the registry row and the saved-job format. No input, no storage.' }, null, 1) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
