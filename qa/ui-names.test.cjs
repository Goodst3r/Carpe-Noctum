'use strict';
// Training and guide text must name only tabs, buttons and menu items that exist in the app.
//
// The universe of real names comes from the built app: every visible label on all
// screens, the main tabs and the sub-tab list of each, plus the text nodes in the
// source templates (controls that only exist after a tap, such as "More").
// Text under test: the practice-job strings in night-sweep/training.js and the
// technician guides in docs/. Two kinds of reference are checked:
//   1. navigation paths such as "Job → Details → Save now": each step must be a real
//      main tab, a sub-tab of that tab, or a control that exists in the app;
//   2. names introduced by a control verb ("Tap Save now", "Open More"): they must exist.
// A short list of retired names (old screen and button labels) also fails with the
// current name to use. Wording the check cannot judge belongs in ALLOWED_PHRASES with a reason.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootApp, root } = require('./build2-source-harness.cjs');

const norm = s => String(s).replace(/[⌄▾▸]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

// Old names that were renamed. Each maps to what the app calls it now.
const RETIRED = [
  [/Save named job/i, '"Save now" (Route & sweep → Details → Named jobs on this device)'],
  [/Sun\s*\/\s*Night/i, 'the palette button in the header ("Switch to Sun palette" / "Switch to Night palette")'],
  [/Files\s*→\s*Save project/, '"Files → Back up project"'],
  [/Route\s*→\s*Equipment setup/, '"Route & sweep → Amp / node setup"'],
  [/Route\s*→\s*Equipment\b(?!\s*setup)/, '"Tools → Catalog"'],
  [/Test\s*→\s*Sweep setup/, '"Route & sweep → Meter setup"'],
  [/Test\s*→\s*Sweep\b(?!\s*setup)/, '"Route & sweep → Predicted levels"'],
  [/Job\s*→\s*Records/, '"Closeout → Acceptance"'],
];

// Phrases the extractors pick up that are not controls, with the reason. Keep this short.
const ALLOWED_PHRASES = new Map([
  ['android apk', 'the installer, not a control'],
  ['safari', 'a browser name'],
  ['analog', 'a measurement mode in prose'],
  ['home screen', 'the phone Home Screen, not an app tab'],
  ['json file', 'a file type'],
  ['apk', 'a file type'],
  ['nightsweep website', 'a web page name'],
  ['ofdm photo entries', 'a kind of record shown on the ONX files screen'],
  ['gainmaker station', 'a piece of equipment'],
  ['launch origin exercise', 'a named practice exercise'],
  ['gs7k', 'a model name'],
  ['qam / digital selection', 'describes an ONX setting, not an app control'],
  ['onx/evidence files', 'a kind of record the technician attaches under Files, not a control'],
  ['gainmaker hgd gaas', 'an equipment model chosen from the catalog list, not a control'],
]);

// Names that are real only in one document, with the reason: the installer file, and the Android and iPhone
// system prompts the installation guide describes. They are not allowed anywhere else.
const DOCUMENT_ALLOWED = new Map([
  ['night-sweep/README.md', new Map([
    ['gs7k/gainmaker gan baseline', 'the name of a practice job'],
    ['documented setup method offered', 'the label "Documented setup method" followed by prose'],
    ['gainmaker source/route station', 'a station of the practice job, described in prose'],
    ['sc-qam csv', 'an entry shown in Route & sweep → ONX files for the practice evidence file'],
    ['nightsweep-1', 'part of the installer file name NightSweep-1.8-preview.apk'],
    ['install', 'the Android installer prompt'],
  ])],
  ['docs/NightSweep_1.8_Alpha_Android_iOS_Installation.md', new Map([
    ['share button', 'the Safari toolbar button'],
    ['add', 'the iPhone Add to Home Screen confirmation'],
  ])],
]);

// Retired only as a screen name in the practice-job text, where the screen is "Amp / node setup".
const RETIRED_IN_TRAINING = [
  [/Equipment setup/i, '"Amp / node setup" (Route & sweep → Amp / node setup)'],
];

const GUIDES = [
  'night-sweep/README.md',
  'docs/NightSweep_1.8_Alpha_Functions_README.md',
  'docs/NightSweep_1.8_Alpha_Android_iOS_Installation.md',
  'docs/NightSweep_1.8_Training_Coverage.md',
  'docs/NightSweep_1.8_Equipment_Coverage.md',
];

const ROOT_TABS = ['Home', 'Route & sweep', 'Tools', 'Closeout'];
const PATH_START = new RegExp('\\b(?:' + [...ROOT_TABS, 'Files'].join('|') + ')\\s*→', 'g');
const SEGMENT = /\s*→\s*([^→.,;:()|\n]*?)(?=\s*→|[.,;:()|\n]|\s+(?:and|or|then|to|for|from|in|on|when|if|before|after|with|until|so|that|which|are|is|can|will|the|a)\s|$)/y;
const VERBS = 'Open|Tap|Press|Select|Choose|Click|Try|Practice|Expand|Return to|Go to';
// Verbs match in any letter case ("practice Save now", "TAP Save now"); the control name that follows must still start with a capital letter.
const anyCase = words => words.split('|').map(word => word.replace(/[A-Za-z]/g, c => '[' + c.toUpperCase() + c.toLowerCase() + ']')).join('|');
const VERB_NAME = new RegExp('\\b(?:' + anyCase(VERBS) + ')\\s+(?:the\\s+)?(?:(?:button|tab|screen|menu)\\s+)?[“"*]*(?!(?:For|If|When|While|In|On|At|The|A|An|Then|With|Without|And|Or|But)\\b)([A-Z][\\w&/ →\'’+-]{1,48}?)[”"*]*(?=[.,;:)]|\\s+(?:and|then|to|or|with|for|from|under|before|after|at|in|on|as|by|when|if|while|until|but)\\s|$)', 'g');

function stripMarkup(text) {
  return String(text).replace(/\*\*/g, '').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, ' ');
}

function collectStrings(value, out) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => collectStrings(v, out));
  return out;
}

async function appUniverse() {
  const h = bootApp({});
  try {
    await new Promise(r => setTimeout(r, 300));
    const universe = new Set();
    const addLabels = () => {
      for (const el of h.d.querySelectorAll('button, summary, h1, h2, h3, h4, label, legend, th, a, [role=tab], option, .eyebrow, b, strong')) {
        const t = norm(el.textContent || '');
        if (t && t.length <= 120) universe.add(t);
      }
      for (const el of h.d.querySelectorAll('[aria-label],[title],[placeholder]')) {
        for (const a of ['aria-label', 'title', 'placeholder']) {
          const v = el.getAttribute(a);
          if (v && v.length <= 120) universe.add(norm(v));
        }
      }
    };
    const subTabs = new Map();
    const screens = new Set();
    const tabsNow = () => [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => ({ id: b.dataset.task, label: norm(b.textContent) }));
    const mainTabs = [...h.d.querySelectorAll('[data-main-tab]')].map(b => ({ id: b.dataset.mainTab, label: norm(b.textContent) }));
    for (const main of mainTabs) {
      h.ev(`WorkflowUI.go(${JSON.stringify(main.id)})`);
      await new Promise(r => setTimeout(r, 80));
      const tabs = tabsNow();
      subTabs.set(main.label, new Set(tabs.map(t => t.label)));
      tabs.forEach(t => screens.add(t.id));
      screens.add(main.id);
    }
    screens.add('help');
    const walk = async () => {
      for (const id of screens) {
        h.ev(`WorkflowUI.go(${JSON.stringify(id)})`);
        await new Promise(r => setTimeout(r, 80));
        addLabels();
      }
    };
    // First as a fresh install, where the practice buttons read "Open ...", then with the complete
    // practice job loaded, so screens that need a route (station setup, gain, TDR) render their controls.
    await walk();
    await h.ev('TrainingJob.open()');
    await new Promise(r => setTimeout(r, 800));
    await walk();
    const training = h.json(`(()=>({steps:TrainingJob.steps,dsim:TrainingJob.dsimSteps,oem:TrainingJob.oemSteps,gs7k:TrainingJob.gs7kSteps,deep:TrainingJob.deepSteps,custom:TrainingJob.customSteps,manual:TrainingJob.manualSteps,exercises:TrainingJob.exercises,features:TrainingJob.features}))()`);
    // Source text: template text nodes, and short label-like string literals, for controls that only
    // exist after a tap or in a state the walk above does not reach (for example "More" or "Save/share file").
    // Literals that read as sentences (end with punctuation, or contain template code) are left out.
    const srcDir = path.join(root, 'night-sweep');
    // pwa/pwa.js holds the install, update and offline-setup controls ("Install update", "Reload app").
    const sources = fs.readdirSync(srcDir).filter(f => /\.(js|html)$/.test(f)).map(f => [f, path.join(srcDir, f)]).concat([['pwa.js', path.join(root, 'pwa', 'pwa.js')]]);
    for (const [file, full] of sources) {
      const code = fs.readFileSync(full, 'utf8');
      for (const m of code.matchAll(/>([^<>{}$`\n]{2,80})</g)) {
        const t = norm(m[1]);
        if (t) universe.add(t);
      }
      if (!file.endsWith('.js')) continue;
      for (const m of code.matchAll(/(['"])((?:\\.|(?!\1)[^\\\n]){2,60}?)\1/g)) {
        const literal = m[2];
        if (/^[A-Z0-9+][^.!?:]*$/.test(literal) && !/\$\{|\\/.test(literal)) universe.add(norm(literal));
      }
    }
    return { universe, subTabs, mainLabels: new Set(mainTabs.map(m => m.label)), training, errors: h.errors, screens };
  } finally {
    h.close();
  }
}

// A name is real when the app shows it exactly, shows a longer label that begins with it,
// or (inside a navigation path, where prose can follow the last name) the phrase begins
// with a label that is at least two words or six characters long.
function known(universe, name, { tail = false } = {}) {
  const n = norm(name);
  if (!n) return true;
  if (universe.has(n) || ALLOWED_PHRASES.has(n)) return true;
  for (const u of universe) {
    if (n.length >= 4 && (u.startsWith(n + ' ') || u.startsWith(n + ':') || u.startsWith(n + ' ('))) return true;
    if (tail && u.length >= 6 && n.startsWith(u + ' ')) return true;
  }
  return false;
}

// Route points are named by letter or by their TRAIN label, not by a control name.
const isRoutePoint = phrase => /^(?:[A-F]\d?\b|TRAIN\b|GaN A\d\b)/.test(phrase);

function pathsIn(text) {
  const found = [];
  PATH_START.lastIndex = 0;
  let start;
  while ((start = PATH_START.exec(text))) {
    const segments = [start[0].replace(/\s*→$/, '')];
    SEGMENT.lastIndex = start.index + start[0].length - 1;
    let m;
    while ((m = SEGMENT.exec(text)) && m[1].trim()) {
      if (/^[a-z]/.test(m[1].trim())) break; // lowercase after an arrow is prose, not a control name
      segments.push(m[1].trim());
      SEGMENT.lastIndex = m.index + m[0].length;
    }
    found.push({ segments, at: start.index });
    PATH_START.lastIndex = Math.max(PATH_START.lastIndex, SEGMENT.lastIndex || 0);
  }
  return found;
}

// "Back up project/Open project" lists two controls.
function knownPath(info, seg) {
  if (known(info.universe, seg, { tail: true })) return true;
  const parts = seg.split(/\s*\/\s*/);
  return parts.length > 1 && parts.every(part => known(info.universe, part, { tail: true }));
}

function checkPath(info, segments) {
  const problems = [];
  const first = norm(segments[0]);
  if (first !== 'files' && !info.mainLabels.has(first)) return ['"' + segments[0] + '" is not a main tab'];
  if (segments.length > 1) {
    const second = norm(segments[1]);
    const tabs = info.subTabs.get(first);
    if (first === 'files' || first === 'home' || !tabs || !tabs.size) {
      if (!knownPath(info, segments[1])) problems.push('"' + segments[1] + '" is not a control under ' + segments[0]);
    } else if (!tabs.has(second) && ![...tabs].some(t => second.startsWith(t + ' '))) {
      problems.push('"' + segments[1] + '" is not a tab under ' + segments[0] + ' (tabs: ' + [...tabs].join(', ') + ')');
    }
  }
  for (const seg of segments.slice(2)) {
    if (!knownPath(info, seg)) problems.push('"' + seg + '" does not exist in the app');
  }
  return problems;
}

// Only the navigation inventory is a screen list. Its header is
// "Main work area | Task screens | Purpose". A form table such as
// "| Field | What to enter |" is not one, even though Field is also a group name.
function screenLists(info, clean, label, failures) {
  const lines = clean.split('\n');
  let inventory = false;
  for (const line of lines) {
    if (/^\|\s*Main work area\s*\|\s*Task screens\s*\|\s*Purpose\s*\|/.test(line)) { inventory = true; continue; }
    if (!inventory) continue;
    if (!line.startsWith('|')) { inventory = false; continue; }
    if (/^\|\s*-+/.test(line)) continue;
    const row = line.match(/^\|\s*(Home|Route & sweep|Tools|Closeout)\s*\|\s*([^|]+?)\s*\|/);
    if (!row) continue;
    const tabs = info.subTabs.get(norm(row[1]));
    if (!tabs) { failures.push(`${label}: table row "${row[1]}" is not a main work area`); continue; }
    for (const screen of row[2].split(';').map(x => norm(x)).filter(Boolean)) {
      if (!tabs.has(screen)) failures.push(`${label}: table row "${row[1]}" lists "${screen}", which is not a ${row[1]} tab (tabs: ${[...tabs].join(', ')})`);
    }
  }
}

function check(label, info, text, failures, { verbs = true, allowed = new Map() } = {}) {
  const clean = stripMarkup(text);
  screenLists(info, clean, label, failures);
  for (const [pattern, current] of RETIRED) {
    const hit = clean.match(pattern);
    if (hit) failures.push(`${label}: retired name "${hit[0]}"; use ${current}`);
  }
  for (const { segments } of pathsIn(clean)) {
    for (const problem of checkPath(info, segments)) failures.push(`${label}: path "${segments.join(' → ')}": ${problem}`);
  }
  if (!verbs) return;
  VERB_NAME.lastIndex = 0;
  let m;
  while ((m = VERB_NAME.exec(clean))) {
    const phrase = m[1].trim();
    if (phrase.includes('→') || isRoutePoint(phrase)) continue; // paths are checked above; route points are not controls
    if (!known(info.universe, phrase) && !allowed.has(norm(phrase))) failures.push(`${label}: "${phrase}" is named as a control but does not exist in the app`);
  }
}

(async () => {
  const info = await appUniverse();
  const cases = [];
  let failed = 0;
  const run = (name, fn) => {
    try { fn(); cases.push(name); console.log('PASS ' + name); }
    catch (error) { failed++; console.log('FAIL ' + name + '\n' + String(error.message).split('\n').slice(0, 80).join('\n')); }
  };

  run('The app exposes the four main tabs and their sub-tabs the check relies on', () => {
    assert.deepEqual([...info.mainLabels].sort(), ['closeout', 'home', 'route & sweep', 'tools']);
    assert.deepEqual([...info.subTabs.get('route & sweep')], ['route & sweep', 'setup', 'amp / node setup', 'meter setup', 'tdr', 'onx files', 'predicted levels', 'details', 'station records', 'checklists', 'night log', 'sweep due', 'load & what-if', 'supply pm']);
    assert.deepEqual([...info.subTabs.get('home')], ['home', 'outage']);
    for (const [main, tab] of [['route & sweep', 'amp / node setup'], ['route & sweep', 'meter setup'], ['route & sweep', 'predicted levels'], ['closeout', 'acceptance'], ['tools', 'catalog']]) {
      assert(info.subTabs.get(main).has(tab), main + ' → ' + tab);
    }
    assert(info.universe.has('save now') && info.universe.has('back up project'));
    assert.deepEqual(info.errors, []);
  });

  run('The check recognizes a wrong tab, a wrong button and a retired name', () => {
    const failures = [];
    check('probe', info, 'Open Route → Equipment setup, tap Save named job, then press Sun / Night. Use Tools → Nonexistent screen. Tap Imaginary control.', failures);
    const text = failures.join('\n');
    assert(/Equipment setup/.test(text) && /Save named job/.test(text) && /Sun/.test(text), text);
    assert(/Nonexistent screen/.test(text) && /Imaginary control/.test(text), text);
    // Verbs are matched in any letter case. The training text really says "practice Save now and Duplicate" (lowercase p),
    // so a lowercase verb followed by an unknown control must fail exactly as the capitalized one does.
    for (const verb of ['practice', 'Practice', 'PRACTICE', 'tap', 'press', 'select', 'choose', 'open', 'try', 'expand', 'go to', 'return to']) {
      const bad = [];
      check('probe', info, `In Named jobs on this device, ${verb} Imaginary control and Duplicate.`, bad);
      assert(bad.some(f => /"Imaginary control" is named as a control/.test(f)), `${verb} did not flag an unknown control: ${bad.join('; ')}`);
    }
    const exact = [];
    check('probe', info, 'In Named jobs on this device, practice Imaginary control and Duplicate, then try the palette button in the header and Help & methods.', exact);
    assert.equal(exact.length, 1, exact.join('; '));
    // The real wording, and real names after lowercase verbs, stay accepted.
    const lowerGood = [];
    check('probe', info, 'In Named jobs on this device, practice Save now and Duplicate, then try the palette button in the header and Help & methods. You can tap Back up project.', lowerGood);
    assert.deepEqual(lowerGood, []);
    const good = [];
    check('probe', info, 'Use Route & sweep → Details → Save now, then Route & sweep → Amp / node setup, then Files → Back up project.', good);
    assert.deepEqual(good, []);
  });

  run('A navigation inventory rejects a missing screen and a screen in the wrong group', () => {
    const header = '| Main work area | Task screens | Purpose |\n| --- | --- | --- |\n';
    const missing = [];
    check('probe', info, header + '| Tools | Nonexistent screen | Synthetic |\n', missing);
    assert(missing.some(f => /nonexistent screen/.test(f)), missing.join('\n'));
    const wrong = [];
    check('probe', info, header + '| Tools | Meter setup | Synthetic |\n', wrong);
    assert(wrong.some(f => /meter setup/.test(f) && /not a Tools tab/.test(f)), wrong.join('\n'));
    const bogus = [];
    check('probe', info, header + '| Tools | Bogus | Synthetic |\n', bogus);
    assert(bogus.some(f => /bogus/.test(f)), bogus.join('\n'));
    const semi = [];
    check('probe', info, header + '| Route & sweep | Night log; Not a screen | Synthetic |\n', semi);
    assert(semi.some(f => /lists "not a screen"/.test(f)) && !semi.some(f => /lists "night log"/.test(f)), semi.join('\n'));
    const valid = [];
    check('probe', info, header + '| Route & sweep | Details; Amp / node setup; Load & what-if | ok |\n| Tools | DOCSIS health; Proof of performance | ok |\n| Route & sweep | Meter setup; Night log | ok |\n', valid);
    assert.deepEqual(valid, []);
    const form = [];
    check('probe', info, '| Field | What to enter |\n| --- | --- |\n| Source type | Node output, Amplifier / LE output, or Manual / other output |\n', form);
    assert.deepEqual(form, []);
    const outside = [];
    check('probe', info, '| Tools | Nonexistent screen | Synthetic |\n', outside);
    assert.deepEqual(outside.filter(f => /table row/.test(f)), []);
  });

  run('Practice-job text names only tabs and buttons that exist', () => {
    const failures = [];
    const strings = collectStrings(info.training, []);
    for (const s of strings) check('training: ' + s.slice(0, 40).replace(/\s+/g, ' ') + '…', info, s, failures);
    for (const [pattern, current] of RETIRED_IN_TRAINING) {
      for (const s of strings) if (pattern.test(s)) failures.push(`training: retired screen name in "${s.slice(0, 50).replace(/\s+/g, ' ')}…"; use ${current}`);
    }
    const source = fs.readFileSync(path.join(root, 'night-sweep/training.js'), 'utf8');
    for (const [pattern, current] of RETIRED) {
      if (pattern.test(source)) failures.push(`night-sweep/training.js: retired name matches ${pattern}; use ${current}`);
    }
    assert.deepEqual([...new Set(failures)], []);
  });

  run('Messages and help text inside the app name only tabs and buttons that exist', () => {
    const failures = [];
    const srcDir = path.join(root, 'night-sweep');
    for (const file of fs.readdirSync(srcDir).filter(f => /\.(js|html)$/.test(f) && f !== 'training.js')) {
      // Quote marks around a string end a path, so drop them before looking for "Tab → Screen" text.
      const text = fs.readFileSync(path.join(srcDir, file), 'utf8').replace(/\\?['"`]/g, ' ');
      check('night-sweep/' + file, info, text, failures, { verbs: false });
    }
    assert.deepEqual([...new Set(failures)], []);
  });

  run('Technician guides name only tabs and buttons that exist', () => {
    const failures = [];
    for (const file of GUIDES) {
      const text = fs.readFileSync(path.join(root, file), 'utf8');
      check(file, info, text, failures, { allowed: DOCUMENT_ALLOWED.get(file) });
    }
    assert.deepEqual([...new Set(failures)], []);
  });

  run('Rendered guide pages carry no retired name', () => {
    const failures = [];
    for (const file of fs.readdirSync(path.join(root, 'docs')).filter(f => /^NightSweep_1\.8_.*\.html$/.test(f))) {
      const text = stripMarkup(fs.readFileSync(path.join(root, 'docs', file), 'utf8'));
      for (const [pattern, current] of RETIRED) {
        const hit = text.match(pattern);
        if (hit) failures.push(`docs/${file}: retired name "${hit[0]}"; use ${current}`);
      }
    }
    assert.deepEqual([...new Set(failures)], []);
  });

  if (failed) { console.error(`UI names: ${failed} check(s) failed`); process.exitCode = 1; }
  else console.log(`UI names: ${cases.length} checks passed`);
})().catch(error => { console.error(error.message || error); process.exitCode = 1; });
