#!/usr/bin/env python3
"""Test the QA gate itself: suite time limit, per-suite timing, evidence redirect, receipts message.

Uses throwaway scripts in a temp folder. Nothing in the repository is written.
"""
from pathlib import Path
import json
import os
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'qa'))
from suite_runner import DEFAULT_TIMEOUT, run_suite, suite_timeout  # noqa: E402
from evidence_path import SCRATCH, evidence_path, writes_tracked  # noqa: E402
from release_receipts import RECEIPT_FILES, missing_receipts, receipts_message  # noqa: E402

checks = []


def check(name, fn):
    fn()
    checks.append(name)
    print('PASS ' + name)


def require(value, message):
    if not value:
        raise AssertionError(message)


def raises(fn, text):
    try:
        fn()
    except ValueError as exc:
        require(text in str(exc), 'wrong error text: ' + str(exc))
        return
    raise AssertionError('expected ValueError')


def timeout_setting():
    require(DEFAULT_TIMEOUT == 150, 'default limit stays 150 s')
    require(suite_timeout({}) == 150, 'unset gives the default')
    require(suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': ''}) == 150, 'blank gives the default')
    require(suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': '3600'}) == 3600, 'whole seconds')
    require(suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': ' 900 '}) == 900, 'whitespace is trimmed')
    require(suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': '0.5'}) == 0.5, 'fractions allowed for tests')
    for bad in ['0', '-5', 'abc', 'nan', 'inf', '1e999']:
        raises(lambda bad=bad: suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': bad}), 'NIGHTSWEEP_SUITE_TIMEOUT')


def runner_cases():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / 'qa').mkdir()
        (tmp / 'qa' / 'fast.cjs').write_text("console.log('Fast suite: 7 checks passed');")
        (tmp / 'qa' / 'slow.cjs').write_text("setTimeout(()=>console.log('Slow suite: 1 checks passed'),20000);")
        (tmp / 'qa' / 'silent.cjs').write_text("console.log('no count here');")
        (tmp / 'qa' / 'failing.cjs').write_text("console.log('Failing suite: 4 checks passed');process.exit(1);")
        logs = tmp / 'logs'
        pattern = r'Fast suite: (\d+) checks passed'
        ok, _ = run_suite(tmp, 'Fast', 'fast.cjs', pattern, 30, logs)
        require(ok['passed'] and ok['checks'] == 7, 'fast suite passes with its count')
        require(isinstance(ok['seconds'], float) and 0 <= ok['seconds'] < 30, 'run time is recorded in seconds')
        require((logs / 'fast.cjs.txt').is_file(), 'log is written')
        slow, out = run_suite(tmp, 'Slow', 'slow.cjs', r'Slow suite: (\d+) checks passed', 1, logs)
        require(not slow['passed'] and slow['checks'] == 0, 'a suite past the limit fails')
        require('TIMEOUT after 1s' in out and 'NIGHTSWEEP_SUITE_TIMEOUT' in out, 'timeout message names the variable and the limit')
        require('count was missing' not in out, 'a timeout is not also reported as a missing count')
        require(1 <= slow['seconds'] < 15, 'timed-out run time is close to the limit, not the full sleep')
        quiet, out = run_suite(tmp, 'Silent', 'silent.cjs', r'Silent: (\d+) checks passed', 30, logs)
        require(not quiet['passed'] and 'count was missing' in out, 'a suite with no completion line fails')
        bad, _ = run_suite(tmp, 'Failing', 'failing.cjs', r'Failing suite: (\d+) checks passed', 30, logs)
        require(not bad['passed'] and bad['checks'] == 0, 'a nonzero exit fails even when a count printed')
        # The limit comes from the environment, so a longer setting lets the same slow script finish.
        (tmp / 'qa' / 'medium.cjs').write_text("setTimeout(()=>console.log('Medium suite: 2 checks passed'),2000);")
        short, _ = run_suite(tmp, 'Medium', 'medium.cjs', r'Medium suite: (\d+) checks passed', suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': '1'}), logs)
        longer, _ = run_suite(tmp, 'Medium', 'medium.cjs', r'Medium suite: (\d+) checks passed', suite_timeout({'NIGHTSWEEP_SUITE_TIMEOUT': '30'}), logs)
        require(not short['passed'] and longer['passed'] and longer['seconds'] >= 2, 'raising the limit lets a slow suite finish')


def evidence_python():
    require(not writes_tracked({}) and not writes_tracked({'NIGHTSWEEP_WRITE_EVIDENCE': '0'}), 'default is untracked')
    require(writes_tracked({'NIGHTSWEEP_WRITE_EVIDENCE': '1'}), 'opt-in writes tracked files')
    rel = 'research/build2/gate-test-evidence.json'
    default = evidence_path(rel, {})
    require(default == SCRATCH / rel and default.parent.is_dir(), 'default redirects under qa/evidence-out')
    require(ROOT / 'qa' / 'evidence-out' == SCRATCH, 'redirect folder location')
    tracked = evidence_path(rel, {'NIGHTSWEEP_WRITE_EVIDENCE': '1'})
    require(tracked == ROOT / rel, 'opt-in keeps the tracked path')
    raises(lambda: evidence_path('../outside.json', {}), 'inside the repository')
    raises(lambda: evidence_path('.', {}), 'inside the repository')


def evidence_node():
    code = ("const e=require('./qa/evidence-path.cjs');const path=require('path');"
            "const rel='release/gate-test-evidence.json';"
            "console.log(JSON.stringify({d:path.relative(e.root,e.evidencePath(rel,{})),"
            "t:path.relative(e.root,e.evidencePath(rel,{NIGHTSWEEP_WRITE_EVIDENCE:'1'})),"
            "w:e.writesTracked({}),w1:e.writesTracked({NIGHTSWEEP_WRITE_EVIDENCE:'1'}),"
            "bad:(()=>{try{e.evidencePath('../x.json',{});return 'no error'}catch(x){return x.message}})()}))")
    out = json.loads(subprocess.run(['node', '-e', code], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    require(out['d'] == 'qa/evidence-out/release/gate-test-evidence.json', 'node default redirect: ' + out['d'])
    require(out['t'] == 'release/gate-test-evidence.json', 'node opt-in tracked path')
    require(out['w'] is False and out['w1'] is True, 'node mode flags')
    require('inside the repository' in out['bad'], 'node rejects escaping paths')


def tracked_writers_use_the_redirect():
    # Every test that writes a file tracked by git must go through the redirect.
    tracked = set(subprocess.run(['git', 'ls-files'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines())
    offenders = []
    for test in sorted((ROOT / 'qa').glob('*.cjs')) + sorted((ROOT / 'qa').glob('*.js')) + sorted((ROOT / 'qa').glob('*.py')):
        text = test.read_text()
        for line_no, line in enumerate(text.splitlines(), 1):
            for path in tracked:
                if path.startswith(('release/', 'research/', 'night-sweep/research/')) and path in line \
                        and any(w in line for w in ('writeFileSync', 'write_text', 'write_bytes')) \
                        and 'evidencePath' not in line and 'evidence_path' not in line:
                    offenders.append(f'{test.name}:{line_no} writes {path} directly')
    require(not offenders, 'direct writes to tracked evidence: ' + '; '.join(offenders))


def receipts_message_text():
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        require(missing_receipts(out) == list(RECEIPT_FILES), 'empty folder lists every receipt')
        (out / 'build-info.json').write_text('{}')
        require(missing_receipts(out) == list(RECEIPT_FILES[1:]), 'present receipts are not listed')
        for name in RECEIPT_FILES:
            (out / name).write_text('x')
        require(missing_receipts(out) == [], 'complete folder lists nothing')
        text = receipts_message(out, ['build-info.json'])
        require('final_apk_built' in text and 'build-info.json' in text and 'not in this checkout' in text
                and 'FileNotFoundError' not in text, 'message explains the problem')


check('NIGHTSWEEP_SUITE_TIMEOUT defaults to 150 s and rejects invalid values', timeout_setting)
check('Suite runner records run time, enforces the limit and fails silent or failing suites', runner_cases)
check('Python evidence paths go to qa/evidence-out unless NIGHTSWEEP_WRITE_EVIDENCE=1', evidence_python)
check('Node evidence paths go to qa/evidence-out unless NIGHTSWEEP_WRITE_EVIDENCE=1', evidence_node)
check('No QA script writes a tracked evidence file without the redirect', tracked_writers_use_the_redirect)
check('Missing Android receipts produce a clear message', receipts_message_text)
print(f'Gate reliability: {len(checks)} checks passed')
