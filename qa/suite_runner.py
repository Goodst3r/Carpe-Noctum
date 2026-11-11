"""Run one QA suite with a configurable time limit and a measured run time.

qa/run-pwa.py calls run_suite() for every entry in its suite list. The limit is
NIGHTSWEEP_SUITE_TIMEOUT seconds (default 150). Slow machines raise it; a suite
that exceeds it fails with a message that names the variable.
"""
from pathlib import Path
import os
import re
import subprocess
import time

DEFAULT_TIMEOUT = 150


def suite_timeout(env=None):
    """Seconds allowed per suite from NIGHTSWEEP_SUITE_TIMEOUT, else 150.

    A set but invalid value (not a positive number) raises ValueError instead of
    silently falling back, so a typo cannot hide behind the default.
    """
    raw = (os.environ if env is None else env).get('NIGHTSWEEP_SUITE_TIMEOUT')
    if raw is None or raw.strip() == '':
        return DEFAULT_TIMEOUT
    try:
        value = float(raw)
    except ValueError:
        raise ValueError('NIGHTSWEEP_SUITE_TIMEOUT must be a positive number of seconds, got ' + repr(raw))
    if not value > 0 or value == float('inf'):
        raise ValueError('NIGHTSWEEP_SUITE_TIMEOUT must be a positive number of seconds, got ' + repr(raw))
    return int(value) if value == int(value) else value


def run_suite(root, name, script, pattern, timeout, logs, env=None):
    """Run one suite. Returns {'name','script','passed','checks','seconds'} and writes its log."""
    root, logs = Path(root), Path(logs)
    command = ['python3' if script.endswith('.py') else 'node', 'qa/' + script]
    started = time.monotonic()
    timed_out = False
    try:
        proc = subprocess.run(command, cwd=root, text=True, capture_output=True, timeout=timeout,
                              env={**(os.environ if env is None else env), 'NIGHTSWEEP_RELEASE_TEST': '1'})
        output = proc.stdout + proc.stderr
        passed = proc.returncode == 0
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        shown = str(int(timeout)) if timeout == int(timeout) else str(timeout)
        output = ('TIMEOUT after ' + shown + 's. Raise the limit with NIGHTSWEEP_SUITE_TIMEOUT=<seconds> '
                  'on a slow machine.\n' + _text(exc.stdout) + _text(exc.stderr))
        passed = False
    seconds = round(time.monotonic() - started, 1)
    match = re.search(pattern, output) if pattern else None
    if pattern and not match:
        passed = False
        if not timed_out:
            output += '\nExpected suite completion/check count was missing.'
    count = int(match.group(1)) if match and passed else 0
    if pattern and passed and count < 1:
        passed = False
        output += '\nSuite ran no checks.'
    if script == '../night-sweep/selfcheck.js' and passed:
        count = len(re.findall(r'^PASS ', output, re.M))
    logs.mkdir(parents=True, exist_ok=True)
    (logs / (Path(script).name + '.txt')).write_text(output)
    return {'name': name, 'script': script, 'passed': passed, 'checks': count, 'seconds': seconds}, output


def _text(value):
    if value is None:
        return ''
    return value.decode(errors='replace') if isinstance(value, bytes) else str(value)
