/* Build 3 High split screen (build list item 17): the band-plan numbers against an independent reference, every statement's
   citation, the rendered screen, the registry rows and the saved job format. It is a reading aid: nothing is read from a node,
   meter or core, and nothing is stored. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const reference = JSON.parse(fs.readFileSync('research/build3/highsplit-reference.json', 'utf8'));
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

  await check('The band edges, gaps, widths and the side of 108–137 MHz equal the independent reference for every plan', () => {
    for (const [id, ref] of Object.entries(reference.plans)) {
      const p = h.json('HighSplit.PLANS').find(x => x.id === id);
      assert(p, id);
      eq([p.upper, p.dsLow, p.dsHigh], [ref.upper, ref.dsLow, ref.dsHigh], id + ' edges');
      const g = h.json('HighSplit.gaps()').find(x => x.id === id);
      eq([g.min, g.max], [ref.gapMin, ref.gapMax], id + ' gap');
      const w = h.json('HighSplit.widths()').find(x => x.id === id);
      eq(w ? w.width : null, ref.width, id + ' width');
      eq(h.json(`HighSplit.aeroBandSide(HighSplit.PLANS.find(x=>x.id==='${id}'))`), ref.aeroSide, id + ' side of the aeronautical band');
    }
    eq(h.json('HighSplit.ULTRA').map(u => ({ upper: u.upper, dsLow: u.dsLow })), reference.ultra, 'ultra-high splits');
    eq(h.json('HighSplit.ULTRA_TOP'), reference.ultraTop, 'ultra-high downstream top');
    eq(h.json('HighSplit.D31'), reference.d31, 'DOCSIS 3.1 edges');
    eq(h.json('HighSplit.AERO_BAND'), reference.aeroBand, 'aeronautical band');
    eq(h.json('HighSplit.PLANS').map(p => p.id), ['sub', 'mid', 'high'], 'plans stay separate and in order');
  });

  await check('Every statement cites a named document with its printed issue and a place in it; the one statement with no source says nothing was found', () => {
    assert.deepEqual(h.json('HighSplit.selfCheck()'), []);
    const sources = h.json('HighSplit.SOURCES');
    for (const [id, s] of Object.entries(sources)) { assert(s.title && s.title.length > 10, id + ' title'); assert(s.issue && s.issue.length > 8, id + ' issue'); }
    const items = h.json('[...HighSplit.AERO,...HighSplit.RULES,...HighSplit.RPHY_STEPS]');
    for (const i of items) {
      if (i.src === null) { assert.equal(i.id, 'gap'); assert.match(i.loc, /nothing found/i); continue; }
      assert(sources[i.src], i.id + ' source'); assert(i.loc && i.loc.length > 4, i.id + ' locator');
    }
    assert.equal(items.filter(i => i.src === null).length, 1);
    // The sources named in the registry rows are the sources named on screen.
    assert.match(sources.phy40.issue, /I08/); assert.match(sources.rphy.issue, /I22/); assert.match(sources.phy31.issue, /I20/);
    comparisons += items.length;
  });

  await check('The R-PHY bring-up steps are the eight verified ones, listed in the order each is first needed but never presented as one strict sequence (timing runs in parallel with configuration), name who does each, and the screen invents no setting, timer, pilot code or event number', async () => {
    eq(h.json('HighSplit.RPHY_STEPS.map(s=>s.id)').slice().sort(), ['address', 'auth', 'gcp', 'local', 'operational', 'time', 'timing', 'tunnels'], 'the eight steps');
    const timing = h.json("HighSplit.RPHY_STEPS.find(s=>s.id==='timing')");
    assert.match(timing.text, /in parallel with the configuration/); assert.match(timing.text, /sections 6\.9 and 6\.10\.1/); assert.match(timing.text, /before the core moves the RPD to operational/);
    for (const s of h.json('HighSplit.RPHY_STEPS')) { assert(s.who.length > 5 && s.text.length > 40, s.id); }
    await goto(h, 'highSplit');
    const text = words(h.d.getElementById('highSplitPanel'));
    for (const banned of [/pilot pattern/i, /\bIUC\b/, /\bFFT\b/, /66070\d{3}/, /\b\d+ ?s(econds)?\b.*timeout/i, /2000 times/i]) assert.doesNotMatch(text, banned, String(banned));
    // Vecima: stated as not public, nothing borrowed.
    assert.match(text, /Customer Portal, which needs a login/); assert.match(text, /does not describe one, and it does not borrow another maker’s steps or lights for a Vecima node/);
    for (const m of ['Cisco', 'Teleste', 'Harmonic']) assert.match(text, new RegExp(m));
    assert.match(text, /Their lights and steps are for their own hardware and do not carry over/);
    assert.match(text, /none of it is a check you can make with a meter at the node/);
    assert.match(text, /not one strict sequence/); assert.match(text, /synchronizes to its timing source in parallel with the configuration/);
    assert.doesNotMatch(text, /after power-up, in order/); assert.doesNotMatch(text, /read the eight steps in order/i);
    assert.match(text, /assumes a contiguous occupied downstream spectrum/); assert.match(text, /can leave a hole/);
  });

  await check('The screen is Test → High split after Fiber, shows only there, and its tables carry the plan numbers, the gaps and which direction 108–137 MHz is in', async () => {
    await goto(h, 'projects'); assert.equal(h.d.getElementById('highSplitPanel').hidden, true);
    await goto(h, 'highSplit');
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(7, 10), ['Fiber', 'High split', 'Why cards']);
    assert.equal(h.d.getElementById('highSplitPanel').hidden, false); assert.match(h.d.getElementById('screenTitle').textContent, /High split and Remote PHY/);
    const rows = [...h.d.querySelectorAll('#highSplitPanel table')].map(t => [...t.querySelectorAll('tbody tr')].map(r => [...r.children].map(c => c.textContent.trim().replace(/\s+/g, ' '))));
    assert.equal(rows.length, 3);
    eq(rows[0].slice(0, 3), [['Sub-split and extended sub-split', '5 to 42', '50 to 54', '1584 to 1590', 'node only'], ['Mid-split', '5 to 85', '108', '1644', 'node only'], ['High-split', '5 to 204', '258', '1794', 'node and cable modem']], 'band table');
    eq(rows[0].slice(3).map(r => r.slice(0, 4)), [['Ultra-high split, 300 MHz', '5 to 300', '300 to 372', '1794'], ['Ultra-high split, 396 MHz', '5 to 396', '396 to 492', '1794'], ['Ultra-high split, 492 MHz', '5 to 492', '492 to 606', '1794'], ['Ultra-high split, 684 MHz', '5 to 684', '684 to 834', '1794']], 'ultra-high rows');
    eq(rows[1], [['Sub-split', '8 to 12 MHz'], ['Mid-split', '23 MHz'], ['High-split', '54 MHz']], 'gap table');
    eq(rows[2], [['42/54 MHz plant (sub-split)', 'downstream'], ['85/108 MHz (mid-split)', 'downstream'], ['204/258 MHz plant (high-split)', 'upstream']], 'side table');
    const text = words(h.d.getElementById('highSplitPanel'));
    assert.match(text, /1536 MHz wide in both cases/); assert.match(text, /No document read gives 102 MHz as a mid-split downstream edge: the specification says 108\./);
    assert.match(text, /not guard bands/); assert.match(text, /Passing a sweep to 993 MHz does not certify a plant for 1\.8 GHz/);
    assert.match(text, /Ask your leakage group before putting any test signal in that band/);
    assert.match(text, /Official leakage results belong to your engineering group/);
    // 42/54 and 204/258 are named separately; nothing mixes them into one plan.
    assert.match(text, /42\/54 MHz and 204\/258 MHz plants are different plans and stay separate/);
  });

  await check('Every tag on the screen is one registry row; the new rows are labeled spec, expert and derived as they should be, and Limits shows one tag for every row', async () => {
    await goto(h, 'highSplit');
    const ids = new Set();
    for (const t of h.d.querySelectorAll('#highSplitPanel [data-threshold]')) { assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold); ids.add(t.dataset.threshold); }
    for (const id of ['band.docsis40.fdd', 'band.docsis31.edges', 'band.derived.gaps', 'aero.band.side', 'aero.fcc.76610.scope', 'aero.fcc.76616.exclusion', 'leak.cli.limit', 'leak.fcc.aero.repair']) assert(ids.has(id), 'tag for ' + id);
    const row = id => h.json(`Thresholds.get(${JSON.stringify(id)})`);
    for (const [id, label, verification] of [['band.docsis40.fdd', 'spec', 'primary'], ['band.docsis31.edges', 'spec', 'primary'], ['band.derived.gaps', 'expert', 'derived'], ['aero.band.side', 'expert', 'derived'], ['aero.fcc.76610.scope', 'spec', 'secondary'], ['aero.fcc.76616.exclusion', 'spec', 'primary']]) {
      const r = row(id); assert.equal(r.label, label, id); assert.equal(r.verification, verification, id); assert.equal(r.scope, 'all', id);
      for (const k of ['source', 'revision', 'locator', 'conditions', 'units']) assert(r[k] && r[k].length > 2, id + ' ' + k);
    }
    assert.match(row('band.docsis40.fdd').revision, /I08/); assert.match(row('band.docsis31.edges').revision, /I20/);
    assert.match(row('aero.fcc.76610.scope').rangeText, /100 µW.*75\.85 µW/);
    // The numbers in the rule sentences are the numbers in the rows they tag.
    const text = words(h.d.getElementById('highSplitPanel'));
    assert.match(text, /cumulative leakage index of 64 or less/); assert.match(h.json('Thresholds.get("leak.cli.limit")').rangeText, /64/);
    assert.match(text, /20 µV\/m or more at 3 m/); assert.match(h.json('Thresholds.get("leak.fcc.aero.repair")').rangeText, /20/);
    assert.match(text, /100 microwatts.*75\.85 microwatts/);
    await goto(h, 'limits');
    assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
    assert.match(words(h.d.getElementById('limitsList')), /Band plans and the aeronautical band/);
  });

  await check('Opening the screen reads nothing and writes nothing: the saved job and every storage key are unchanged', async () => {
    const x = boot(); await flush();
    const before = JSON.stringify(x.json('evidenceExportProject(state)')), values = JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)]));
    await goto(x, 'highSplit'); await goto(x, 'limits'); await goto(x, 'highSplit');
    assert.equal(JSON.stringify(x.json('evidenceExportProject(state)')), before);
    assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)])), values);
    assert.equal(x.d.querySelectorAll('#highSplitPanel input,#highSplitPanel textarea,#highSplitPanel select').length, 0, 'no input to type into');
    assert(!('highSplit' in x.json('state')), 'no new job field');
    assert.deepEqual(x.errors, []); x.close();
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const HighSplit=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 high split: ${cases.length} checks passed (${comparisons} comparisons with the independent reference)`);
  fs.writeFileSync('qa/build3-highsplit-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App data against the independent reference built by highsplit-reference.py in research/build3 (Python decimal), plus the rendered screen, the registry rows and the saved-job format. Synthetic nothing: no input, no storage.' }, null, 1) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
