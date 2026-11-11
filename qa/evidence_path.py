"""Where a QA suite writes evidence files that are also tracked in the repository.

Default: an untracked folder (qa/evidence-out/, ignored by git), so a full gate
run leaves `git status` clean. Set NIGHTSWEEP_WRITE_EVIDENCE=1 to write the
tracked paths on purpose, for example when refreshing committed evidence.

evidence_path('research/build2/layout-validation.json') takes a path relative
to the repository root, creates the parent folder and returns the Path to write.
"""
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent.parent
SCRATCH = ROOT / 'qa' / 'evidence-out'


def writes_tracked(env=None):
    return (os.environ if env is None else env).get('NIGHTSWEEP_WRITE_EVIDENCE') == '1'


def evidence_path(relative, env=None):
    absolute = (ROOT / relative).resolve()
    try:
        inside = absolute.relative_to(ROOT)
    except ValueError:
        raise ValueError('Evidence path must stay inside the repository: ' + str(relative))
    if str(inside) in ('', '.'):
        raise ValueError('Evidence path must stay inside the repository and name a file: ' + str(relative))
    target = absolute if writes_tracked(env) else SCRATCH / inside
    target.parent.mkdir(parents=True, exist_ok=True)
    return target
