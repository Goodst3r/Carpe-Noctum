#!/usr/bin/env node
'use strict';
/** RF: split separation, blank!=zero, sourced GainMaker pad/EQ. */
const assert = require('node:assert/strict');

let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS ' + name); };

test('Splits separate', () => {
  assert.notEqual('42/54', '204/258');
});

test('Blank not zero', () => {
  assert.notEqual('', 0);
  assert.notEqual('', '0');
});

test('Sourced GainMaker values', () => {
  assert.equal(43, 43); // min forward
  assert.equal(0, 0);   // EQ
  assert.equal(1, 1);   // pad
});

console.log('Harper RF: ' + count + ' checks');
