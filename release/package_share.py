#!/usr/bin/env python3
"""Create a technician-only Android + iPhone share package after publication."""
import argparse, hashlib, json, shutil, zipfile
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--apk', required=True, type=Path)
parser.add_argument('--build-info', required=True, type=Path)
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--url', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
expected_url = 'https://nightsweep-field.goodst3r.chatgpt.site'
assert args.url.rstrip('/') == expected_url
build = json.loads(args.build_info.read_text())
assert build['version'] == '1.7 Alpha' and build['version_code'] == 22
assert build['package'] == 'com.spencerwilliams.nightsweep.preview'
assert build['can_update_14_preview'] and build['can_update_prior_15_preview']
assert build['sweep_setup_included']
assert hashlib.sha256((root / 'outputs/Night_Sweep.html').read_bytes()).hexdigest() == build['html_sha256'], 'HTML changed after APK build; rebuild the APK before packaging.'
validation = json.loads((root / 'qa/pwa-test-results.json').read_text())
assert validation['all_passed'] and validation['version'] == '1.7 Alpha'
assert validation['standalone_sha256'] == build['html_sha256'], 'QA tested a different standalone HTML build.'
apk_digest = build['sha256']
assert hashlib.sha256(args.apk.read_bytes()).hexdigest() == apk_digest
out = args.output.resolve()
out.mkdir(parents=True, exist_ok=True)
folder = out / 'Coworker_Package'
folder.mkdir(exist_ok=True)
names = {
    'NightSweep-1.7-preview.apk', 'START_HERE.txt', 'NightSweep_1.7_Alpha_Training_Job.json', 'NightSweep_1.7_Release_Notes.md', 'NightSweep_1.7_Equipment_Coverage.html',
    'NightSweep_1.7_Alpha_README.html', 'NightSweep_1.7_GainMaker_DSIM_Practice.json', 'NightSweep_1.7_GainMaker_OEM_AGC_Practice.json', 'NightSweep_1.7_GS7K_Practice.json', 'NightSweep_1.7_Setup_Guide.html', 'NightSweep_1.6_Math_Audit.html', 'ANDROID_INSTALL.html', 'IPHONE_INSTALL.html', 'IPHONE_QR.png', 'NightSweep.html'
}
for path in folder.iterdir():
    if path.is_file() and path.name not in names:
        raise RuntimeError('Unexpected file in coworker folder: ' + path.name)
shutil.copyfile(args.apk, folder / 'NightSweep-1.7-preview.apk')
shutil.copyfile(root/'release/NightSweep_1.7_Alpha_Training_Job.json',folder/'NightSweep_1.7_Alpha_Training_Job.json')
for practice in ['NightSweep_1.7_GainMaker_DSIM_Practice.json','NightSweep_1.7_GainMaker_OEM_AGC_Practice.json','NightSweep_1.7_GS7K_Practice.json']:
    shutil.copyfile(root/'release'/practice,folder/practice)
shutil.copyfile(root/'docs/NightSweep_1.7_Release_Notes.md',folder/'NightSweep_1.7_Release_Notes.md')
shutil.copyfile(root/'docs/NightSweep_1.7_Equipment_Coverage.html',folder/'NightSweep_1.7_Equipment_Coverage.html')
shutil.copyfile(root / 'outputs/Night_Sweep.html', folder / 'NightSweep.html')
shutil.copyfile(root / 'docs/Android_Install.html', folder / 'ANDROID_INSTALL.html')
shutil.copyfile(root / 'docs/NightSweep_1.7_Alpha_README.html', folder / 'NightSweep_1.7_Alpha_README.html')
shutil.copyfile(root / 'docs/NightSweep_1.7_Setup_Guide.html', folder / 'NightSweep_1.7_Setup_Guide.html')
shutil.copyfile(root / 'docs/NightSweep_1.6_Math_Audit.html', folder / 'NightSweep_1.6_Math_Audit.html')
shutil.copyfile(root / 'docs/iPhone_Install.html', folder / 'IPHONE_INSTALL.html')
shutil.copyfile(root / 'docs/assets/IPHONE_QR.png', folder / 'IPHONE_QR.png')
(folder / 'START_HERE.txt').write_text('''NIGHTSWEEP 1.7 ALPHA — ANDROID + IPHONE
Spencer Williams

ANDROID WEB — NO APK NEEDED
1. Open Chrome and visit:
   https://nightsweep-field.goodst3r.chatgpt.site/
   The same QR image works on Android and iPhone.
2. Wait on Home for Ready for offline use.
3. Use the browser tab, or optionally choose Install app on Home.
   Chrome's menu may say Install and create shortcut > Install or
   Add to Home screen > Install. Menu wording varies by version.
4. If installed, open the new NightSweep icon online and check readiness.
5. Test with Airplane Mode and Wi-Fi off before field work.
Read ANDROID_INSTALL.html or visit:
   https://nightsweep-field.goodst3r.chatgpt.site/android

The APK and website store jobs separately. Export each needed job from
the APK through Files > Save project, then open that JSON in the web app.

OPTIONAL SINGLE-FILE APP
NightSweep.html is the runnable calculator for browsers that permit local
HTML/JavaScript. Android file viewers can restrict imports and storage.
Use the hosted website for installed browser operation and offline caching.
The included standalone HTML and APK contain the ONX refresh. The hosted
site will show these changes after the matching web deployment is published.
Keep exported project backups. This file has no automatic web update flow.

ANDROID APK OPTION
1. Download and extract this ZIP in Files / My Files.
2. Open NightSweep-1.7-preview.apk.
3. If Android asks, allow installation for the app opening the APK, then
   return and tap Install. Follow your employer's managed-phone policy.
4. Open NightSweep 1.7 Preview. The app version is 1.7 Alpha.

Android Preview build 22 includes repaired training navigation, visible training
errors and corrected Vecima/AOI high-split practice. It includes node/active launch selection, exact-model setup
manuals, reviewed station checklists and the user-supplied ACI DSIM historical
pilot-code lookup. Channel/type/frequency select the printed IRC or digital code;
the guide revision and compatibility limits remain visible. The guided
42/54 and 204/258 MHz sweep methods remain distinct. It can update earlier Preview builds with the same signer.
Export each important job first.
Keep an existing 0.13 app; export/import jobs because Preview has separate
storage. Android 8 or later is required.

IPHONE / IPAD
1. Open Safari and visit:
   https://nightsweep-field.goodst3r.chatgpt.site
   You can also scan IPHONE_QR.png with the camera on another device.
2. Use Safari's Share menu > Add to Home Screen. Keep Open as Web App on
   if that option is shown, then tap Add.
3. Open NightSweep from its new Home Screen icon while online.
4. Wait for Home to say Ready for offline use. Do this in the installed
   icon, even if you already opened the app in Safari.
5. Test with Airplane Mode before taking it into the field.

Read IPHONE_INSTALL.html for the complete walkthrough. This is a hosted
Home Screen web app. The Android APK and a ZIP are not iPhone installers.

JOBS AND BACKUPS
Jobs and meter attachments stay on the device/browser. There is no cloud
job sync. Safari, the installed icon, Android, and other devices may use
separate storage. Use Files > Save project, then Open project on the
destination. Complete the save/share prompt and verify the file in Files.
Use one NightSweep window at a time. Keep external project backups before
updates, clearing website data, removing the icon, or changing devices.

READ THE FULL GUIDE
NightSweep_1.7_Alpha_README.html covers every tool, installation, updates,
worked examples, ONX attachments, backups and troubleshooting.
NightSweep_1.7_Setup_Guide.html provides the detailed forward/return process.
In the app, open Test > Sweep setup and choose the actual split/method.
NightSweep_1.6_Math_Audit.html is the HISTORICAL 1.6 reference audit. It describes
fixes, tested limits and remaining device/field verification.

PRACTICE FIRST
All wrappers include a guided synthetic training job. The separate
NightSweep_1.7_Alpha_Training_Job.json also opens using Files > Open project.
New flow: Route > Setup selects source; Source setup & manual opens the
exact equipment guidance. Return to Cable route, forward/return setup,
readings and evidence from contextual actions.

All versions include four guided practice choices on Home: complete Vecima/AOI
204/258, GainMaker OEM AGC 42/54, GainMaker/DSIM 42/54, and GS7K node 42/54.
In this user's fleet only Vecima nodes and AOI actives use high split;
all other node/amplifier families use 42/54. This is a deployed-plant rule,
separate from manufacturer capability. Existing saved jobs are not rewritten.
Follow the walkthrough in the app and README. The focused GainMaker and GS7K
practice JSON files are also included for Files > Open project; they start
with no meter files. GS7K practice covers standard GS7000 1 GHz / 1.2 GHz
manual selection and setup review, with operating targets left unverified.
Example routes, readings and evidence are synthetic practice data, not
actual plant measurements or acceptance limits.
Keep a project backup of real work before switching jobs.

SHARING
This folder contains the Android installer, runnable HTML app and user
instructions. Developer source files, build files, tests and signing
material are not included. The same app link works for Android and iPhone
and can be forwarded to coworkers. Entered jobs are not
uploaded to that site. Physical iPhone installation and field performance
still need device testing; automated checks are not a field certification.
''')
assert {p.name for p in folder.iterdir()} == names
archive = out / 'NightSweep_1.7_Alpha_Share_Package.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name in sorted(names):
        z.write(folder / name, name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None and set(z.namelist()) == names
    assert hashlib.sha256(z.read('NightSweep-1.7-preview.apk')).hexdigest() == apk_digest
shutil.copyfile(folder / 'NightSweep_1.7_Alpha_README.html', out / 'NightSweep_1.7_Alpha_README.html')
shutil.copyfile(folder / 'NightSweep_1.7_Setup_Guide.html', out / 'NightSweep_1.7_Setup_Guide.html')
shutil.copyfile(folder / 'NightSweep_1.6_Math_Audit.html', out / 'NightSweep_1.6_Math_Audit.html')
shutil.copyfile(args.apk, out / args.apk.name)
print(json.dumps({'url': args.url, 'archive': str(archive), 'files': sorted(names),
                  'apk_sha256': apk_digest, 'android_build': build['version_code'], 'automated_checks': validation['checks'],
                  'source_included': False, 'runnable_html_included': True, 'android_web_url': args.url.rstrip('/') + '/android'}, indent=2))
