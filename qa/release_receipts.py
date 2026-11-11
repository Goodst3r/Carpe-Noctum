"""Check that the non-secret Android build receipts are present when readiness says an APK exists.

android-build/build-readiness.json can say final_apk_built is true. The APK and its
receipts are built outside git (android-build/dist/ is disposable), so a fresh
checkout may not have them. That must fail with a plain explanation, not with a
FileNotFoundError traceback from the middle of a check.
"""
from pathlib import Path

RECEIPT_FILES = (
    'build-info.json',
    'apk-signature-verification.txt',
    'apk-manifest-verification.txt',
    'apk-manifest-tree.txt',
)


def missing_receipts(output):
    """Names of the expected receipt files that are not in the output folder."""
    output = Path(output)
    return [name for name in RECEIPT_FILES if not (output / name).is_file()]


def receipts_message(output, missing):
    """The error text for a checkout that claims an APK but lacks its receipts."""
    return (
        'build-readiness.json says final_apk_built is true, but these build receipts are not in this '
        'checkout: ' + ', '.join(missing) + ' (looked in ' + str(output) + '). The APK and its receipts '
        'are built outside git, so a fresh clone does not have them. Either run this check on the '
        'machine that built the APK, commit the non-secret receipts, or set final_apk_built to false '
        'if no APK is current.'
    )
