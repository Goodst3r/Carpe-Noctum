/* Build 3 Study mode (build list item 19): original practice questions from the app's own calculators, tagged by the five BDS
   domains. Checks that every numeric answer equals an independent Python decimal recomputation from the question's parameters,
   that choice questions have exactly one right answer drawn from the app's own data, how an answer is checked (a blank or a
   lone minus sign is never an answer), the rendered screen, and that nothing is stored. */
'use strict';
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [];
let comparisons = 0;
const boot = () => require('./build2-source-harness.cjs').bootApp({ html });
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const SEEDS = Array.from({ length: 14 }, (_, i) => 1 + i * 37);

(async () => {
  const h = boot();
  await flush();
  const gens = h.json('StudyMode.GENERATORS.map(g=>({id:g.id,domain:g.domain,task:g.tool.task}))');

  await check('There are original questions in all five BDS domains, and every generator practices a screen that exists', async () => {
    const ids = h.json('StudyMode.DOMAINS.map(d=>d.id)');
    assert.deepEqual(ids, ['architectures', 'components', 'signals', 'troubleshooting', 'safety']);
    for (const d of ids) assert(gens.filter(g => g.domain === d).length >= 2, d + ' has at least two question types');
    assert.equal(gens.length, 19); assert.equal(new Set(gens.map(g => g.id)).size, 19);
    for (const g of gens) { await goto(h, 'projects'); await goto(h, g.task); assert.equal(h.ev('WorkflowUI.current()'), g.task, g.id + ' links to ' + g.task); comparisons++; }
  });

  await check('Every numeric answer equals the independent Python decimal recomputation from the question’s own parameters (140 questions)', () => {
    const numeric = [];
    for (const g of gens) for (const seed of SEEDS) {
      const q = h.json(`StudyMode.question(${JSON.stringify(g.domain)},${JSON.stringify(h.json('StudyMode.list(' + JSON.stringify(g.domain) + ').map(x=>x.id)').indexOf(g.id))},${seed})`);
      assert.equal(q.id, g.id, 'the generator asked for is the one used'); assert(q.prompt && q.working.length >= 1 && q.source, g.id);
      if (q.kind === 'number') numeric.push({ gen: g.id, seed, params: q.params, answer: q.answer, tol: q.tol, relative: !!q.relative });
    }
    assert(numeric.length >= 10 * SEEDS.length - 10, 'ten numeric generators: ' + numeric.length);
    const file = path.join(os.tmpdir(), 'cn-study-cases-' + process.pid + '.json');
    fs.writeFileSync(file, JSON.stringify(numeric));
    const run = spawnSync('python3', ['-I', 'research/build3/study-reference.py', file], { encoding: 'utf8' });
    fs.rmSync(file, { force: true });
    assert.equal(run.status, 0, run.stderr);
    const ref = JSON.parse(run.stdout);
    assert.equal(ref.length, numeric.length);
    numeric.forEach((c, i) => {
      assert.equal(ref[i].gen, c.gen);
      const diff = Math.abs(ref[i].answer - c.answer);
      assert(diff <= 1e-9 * Math.max(1, Math.abs(c.answer)), `${c.gen} seed ${c.seed}: app ${c.answer} vs reference ${ref[i].answer}`); comparisons++;
    });
  });

  await check('Choice questions have exactly one right answer, four different choices, and the right one comes from the app’s own data', () => {
    let seen = 0;
    for (const g of gens) for (const seed of SEEDS) {
      const q = h.json(`StudyMode.question(${JSON.stringify(g.domain)},${JSON.stringify(h.json('StudyMode.list(' + JSON.stringify(g.domain) + ').map(x=>x.id)').indexOf(g.id))},${seed})`);
      if (q.kind !== 'choice') continue;
      seen++;
      assert(q.choices.length >= 2 && q.choices.length <= 4, g.id); assert.equal(new Set(q.choices).size, q.choices.length, g.id + ' choices differ');
      assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.choices.length, g.id);
      comparisons++;
    }
    assert(seen >= 8 * SEEDS.length - 8, 'choice questions: ' + seen);
    // Cross-checks against the screens the questions come from.
    const fiber = h.json('StudyMode.question("components",2,5)'); assert.equal(fiber.id, 'fibercolor');
    assert.equal(fiber.choices[fiber.correct], h.json(`FiberTools.locate(${fiber.params.fiber})`).fiberColor);
    const aero = h.json('StudyMode.question("architectures",0,5)'); assert.equal(aero.id, 'aero');
    assert.equal(aero.choices[aero.correct].toLowerCase(), h.json(`HighSplit.aeroBandSide(HighSplit.PLANS.find(p=>p.id==="${aero.params.plan}"))`));
    const cnr = h.json('StudyMode.question("troubleshooting",4,9)'); assert.equal(cnr.id, 'popcnr');
    assert.match(h.json('Thresholds.get("fcc.pop.cnr")').rangeText.replace(/^n/, 'N'), /^Not less than 43 dB$/); assert.equal(cnr.choices[cnr.correct], 'Not less than 43 dB');
    const sec = h.json('StudyMode.question("safety",0,11)'); assert.equal(sec.id, 'safetysection');
    const item = h.json(`Safety.ITEMS.find(i=>i.id===${JSON.stringify(sec.params.item)})`); assert.equal(sec.choices[sec.correct], item.group);
    assert(sec.prompt.includes(item.text));
  });

  await check('Checking an answer: a blank, a lone minus sign, text or an exponent is never an answer; the tolerance edges are inclusive; a choice must be one of those shown', () => {
    const q = h.json('StudyMode.question("signals",0,1)'); assert.equal(q.kind, 'number');
    const ck = r => h.json(`StudyMode.check(${JSON.stringify(q)},${JSON.stringify(r)})`);
    for (const bad of ['', '   ', '-', '+', 'abc', '1e2', '0x10', '12.5.5', '1'.repeat(30), null, undefined]) { const r = ck(bad); assert.equal(r.ok, false, JSON.stringify(bad)); assert(r.error); comparisons++; }
    assert.equal(ck(String(q.answer)).right, true);
    assert.equal(ck(String(q.answer + q.tol)).right, true, 'the edge is inside'); assert.equal(ck(String(q.answer + q.tol + 0.01)).right, false);
    assert.equal(ck('0').ok, true, 'zero is an answer, not a blank');
    const rel = h.json('StudyMode.question("troubleshooting",0,1)'); assert.equal(rel.id, 'ripple'); assert(rel.relative);
    const ckr = r => h.json(`StudyMode.check(${JSON.stringify(rel)},${JSON.stringify(r)})`);
    assert.equal(ckr(String(rel.answer * 1.009)).right, true); assert.equal(ckr(String(rel.answer * 1.02)).right, false);
    const c = h.json('StudyMode.question("signals",3,1)'); assert.equal(c.kind, 'choice');
    const ckc = r => h.json(`StudyMode.check(${JSON.stringify(c)},${JSON.stringify(r)})`);
    assert.equal(ckc('').ok, false); assert.equal(ckc('9').ok, false); assert.equal(ckc('-1').ok, false); assert.equal(ckc('1.5').ok, false); assert.equal(ckc(String(c.correct)).right, true); assert.equal(ckc(String((c.correct + 1) % c.choices.length)).right, false);
  });

  await check('The screen is Test → Study after Proof of performance: a number question is checked, a wrong answer shows the right one with its working, a lone minus sign is refused, and the score is kept for the visit only', async () => {
    await goto(h, 'projects'); assert.equal(h.d.getElementById('studyPanel').hidden, true);
    await goto(h, 'study');
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(-3), ['Why cards', 'Proof of performance', 'Study']);
    assert.equal(h.d.getElementById('studyPanel').hidden, false);
    const text = () => words(h.d.getElementById('studyPanel'));
    assert.match(text(), /They are not SCTE or NCTI questions and not an exam/); assert.match(text(), /Nothing is saved, and a score here is not a test result/);
    // choose the signals domain: question 1 is the dBm conversion
    const sel = h.d.getElementById('studyDomain'); sel.value = 'signals'; sel.dispatchEvent(new h.w.Event('change', { bubbles: true }));
    assert.match(text(), /What is that level in dBm/);
    const q = h.json('StudyMode.question("signals",0,1)');
    const input = h.d.getElementById('studyNumber'); const click = id => h.d.getElementById(id).click();
    click('studyCheck'); assert.match(words(h.d.getElementById('studyFeedback')), /Type your answer first/);
    Object.defineProperty(input, 'validity', { value: { badInput: true }, configurable: true }); input.value = ''; click('studyCheck');
    assert.match(words(h.d.getElementById('studyFeedback')), /plain number/); assert.equal(h.d.querySelector('#studyScore').textContent.includes('right of'), false, 'a refused answer is not scored');
    Object.defineProperty(input, 'validity', { value: { badInput: false }, configurable: true });
    input.value = String(q.answer + 5); click('studyCheck');
    assert.match(words(h.d.getElementById('studyFeedback')), /Not quite/); assert.match(words(h.d.getElementById('studyFeedback')), new RegExp(String(Math.round(q.answer * 100) / 100).replace('.', '\\.')));
    assert.match(words(h.d.getElementById('studyFeedback')), /Working/); assert.match(h.d.getElementById('studyScore').textContent, /0 right of 1/);
    click('studyCheck'); assert.match(h.d.getElementById('studyScore').textContent, /0 right of 1/, 'checking the same question again does not count twice');
    input.value = String(q.answer); click('studyCheck'); assert.match(words(h.d.getElementById('studyFeedback')), /Right/);
    click('studyNext'); assert.match(text(), /Question 2/); click('studyNew'); assert.match(text(), /Question 2/);
    const go = h.d.querySelector('#studyPanel [data-study-go]'); assert.equal(go, null, 'the working link appears only after an answer');
  });

  await check('A choice question is answered with the keyboard-reachable radio buttons, and opening the screen and answering write nothing: the saved job and every storage key are unchanged', async () => {
    const x = boot(); await flush();
    const before = JSON.stringify(x.json('evidenceExportProject(state)')), values = JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)]));
    await goto(x, 'study');
    const sel = x.d.getElementById('studyDomain'); sel.value = 'architectures'; sel.dispatchEvent(new x.w.Event('change', { bubbles: true }));
    const q = x.json('StudyMode.question("architectures",0,1)'); assert.equal(q.kind, 'choice');
    const radios = x.d.querySelectorAll('#studyPanel input[name="studyAnswer"]'); assert.equal(radios.length, q.choices.length);
    for (const r of radios) assert.equal(r.labels.length, 1, 'each radio has one label');
    x.d.getElementById('studyCheck').click(); assert.match(words(x.d.getElementById('studyFeedback')), /Choose an answer first/);
    radios[q.correct].checked = true; x.d.getElementById('studyCheck').click();
    assert.match(words(x.d.getElementById('studyFeedback')), /Right/); assert.match(x.d.getElementById('studyScore').textContent, /1 right of 1/);
    x.d.querySelector('#studyPanel [data-study-go]').click(); await flush(); assert.equal(x.ev('WorkflowUI.current()'), q.tool.task);
    assert.equal(JSON.stringify(x.json('evidenceExportProject(state)')), before);
    assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)])), values);
    assert(!('study' in x.json('state')), 'no new job field'); assert.deepEqual(x.errors, []); x.close();
  });

  await check('The OFDM per-6 MHz question states its flat-power assumption in the prompt and the working (SCTE 293-10, SCTE 258), and every number question shows what counts as right beside the box', async () => {
    for (let seed = 1; seed <= 6; seed++) {
      const q = h.json(`StudyMode.question('signals', ${h.json("StudyMode.list('signals').findIndex(g=>g.id==='ofdm6')")}, ${seed})`);
      assert.match(q.prompt, /occupies \d+ MHz/); assert.match(q.prompt, /flat power spectral density/); assert.match(q.prompt, /average power per 6 MHz/);
      assert.match(q.working.join(' '), /spread evenly across the occupied bandwidth \(flat power spectral density\)/); assert.match(q.working.join(' '), /individual 6 MHz segments differ/);
      comparisons += 5;
    }
    await goto(h, 'study');
    let seen = 0;
    for (const dom of h.json('StudyMode.DOMAINS.map(d=>d.id)')) for (let i = 0; i < h.json(`StudyMode.list(${JSON.stringify(dom)}).length`); i++) {
      const q = h.json(`StudyMode.question(${JSON.stringify(dom)}, ${i}, 3)`); if (q.kind !== 'number') continue;
      const text = h.ev(`StudyMode.toleranceText(StudyMode.question(${JSON.stringify(dom)}, ${i}, 3))`);
      const want = q.relative ? new RegExp('within ' + String(Number((q.tol * 100).toFixed(2))).replace('.', '\\.') + ' percent') : q.tol === 0 ? /exact whole number/ : new RegExp('within ' + String(q.tol).replace('.', '\\.'));
      assert.match(text, want, q.prompt.slice(0, 40)); seen++; comparisons++;
    }
    assert(seen >= 10 && seen < 19, 'every number generator was checked (' + seen + ')'); assert.equal(seen, h.json("StudyMode.DOMAINS.reduce((n,d)=>n+StudyMode.list(d.id).filter((g,i)=>StudyMode.question(d.id,i,3).kind==='number').length,0)"));
    h.ev("StudyModeUI.render&&StudyModeUI.render()");
    const box = h.d.getElementById('studyNumber'); if (box) { assert.equal(box.getAttribute('aria-describedby'), 'studyTolerance'); assert.match(h.d.getElementById('studyTolerance').textContent, /Counts as right within|exact whole number/); }
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const StudyMode=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 study: ${cases.length} checks passed (${comparisons} comparisons with the independent reference)`);
  fs.writeFileSync('qa/build3-study-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'Numeric answers against the Python decimal recomputation in study-reference.py (kept in research/build3), choice questions against the app data they come from, the rendered screen and the saved-job format. Nothing stored.' }, null, 1) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
