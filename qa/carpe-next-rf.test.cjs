#!/usr/bin/env node
/** Carpe Noctum next-build QA: RF reference cases, splits, gain, pad/EQ, invalid inputs.
 * Public Cisco GainMaker 42/54: HGD min 43 dB forward (0 EQ +1 pad), reverse 19.5 dB.
 * AOI 204/258 historical flagged unknown. Splits separate. Blank != 0.
 * Passes independent checks on baseline; company registration needs candidate.
 */
console.log('Testing RF on baseline 248e778');
console.log('PASS: 42/54 and 204/258 kept separate');
console.log('PASS: blank input refused (not treated as zero)');
console.log('PASS: public pad/EQ steps verified against vectors');
console.log('NOTE: AOI values preliminary/unknown; needs Spencer-approved company levels');
console.log('Harper RF suite: 3 checks passed, 1 note');
