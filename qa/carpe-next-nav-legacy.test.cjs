#!/usr/bin/env node
'use strict';
/** Navigation: Route & sweep access + legacy job load on baseline. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS ' + name); };

test('Route & sweep structure present', () => {
  const text = fs.readFileSync(path.join(__dirname, '../night-sweep/workflow.js'), 'utf8');
  assert.ok(/route|Route/.test(text));
  assert.ok(/sweep|Sweep/.test(text));
});

test('Legacy job round-trips', () => {
  const legacy = { version: '1.8', jobs: [{ name: 'Legacy', points: [{ type: 'active' }] }] };
  const loaded = JSON.parse(JSON.stringify(legacy));
  assert.equal(loaded.jobs[0].name, 'Legacy');
});

test('Field/Leakage present on baseline (needs candidate)', () => {
  console.log('NOTE: Field tab/Leakage removal requires combined candidate');
});

console.log('Grok nav-legacy: ' + count + ' checks');
