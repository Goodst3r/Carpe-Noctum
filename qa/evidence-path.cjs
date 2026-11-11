'use strict';
// Where a QA suite writes evidence files that are also tracked in the repository.
//
// Default: an untracked folder (qa/evidence-out/, ignored by git), so a full gate
// run leaves `git status` clean. Set NIGHTSWEEP_WRITE_EVIDENCE=1 to write the
// tracked paths on purpose, for example when refreshing committed evidence.
//
// evidencePath('research/build2/power-backtest-results.json') takes a path
// relative to the repository root, creates the parent folder and returns the
// absolute path to write.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scratch = path.join(root, 'qa', 'evidence-out');

function writesTracked(env = process.env) {
  return env.NIGHTSWEEP_WRITE_EVIDENCE === '1';
}

function evidencePath(relative, env = process.env) {
  const absolute = path.resolve(root, relative);
  const inside = path.relative(root, absolute);
  if (!inside || inside.startsWith('..') || path.isAbsolute(inside)) {
    throw new Error('Evidence path must stay inside the repository: ' + relative);
  }
  const target = writesTracked(env) ? absolute : path.join(scratch, inside);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  return target;
}

module.exports = { evidencePath, writesTracked, scratch, root };
