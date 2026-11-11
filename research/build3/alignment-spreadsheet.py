#!/usr/bin/env python3
"""Spreadsheet check for the build 3 tilt / EQ / pad solver (build list item 2).

Builds research/build3/alignment-spreadsheet.xlsx in which spreadsheet formulas, not the
app, interpolate the published EQ losses, pick the EQ for tilt and the pad for level, and
compute the predicted levels. LibreOffice recalculates the workbook headlessly; the values
are written to alignment-spreadsheet-results.json, which qa/build3-alignment.test.cjs
compares with the app. Inputs: research/build3/alignment-cases.json (synthetic cases) and the
sourced profiles in night-sweep/alignment.js. The spreadsheet does not implement the app's
no-interpolation-across-wide-gaps rule; every case uses pilots inside dense table spans.
Usage: python3 research/build3/alignment-spreadsheet.py (needs openpyxl, LibreOffice, node).
"""
from pathlib import Path
import json, shutil, subprocess, tempfile
import openpyxl
from openpyxl.utils import get_column_letter as col

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
cases = json.loads((HERE / 'alignment-cases.json').read_text())['cases']
profiles = json.loads(subprocess.run(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1]).PROFILES))", str(ROOT / 'night-sweep/alignment.js')], capture_output=True, text=True, check=True).stdout)
profiles = {p['id']: p for p in profiles}

wb = openpyxl.Workbook()
out = wb.active; out.title = 'Cases'
heads = ['Case', 'Kind', 'Profile', 'Low MHz', 'High MHz', 'Reading low', 'Reading high', 'Target low', 'Target high', 'Installed pad', 'Installed EQ',
         'Tilt now', 'Target tilt', 'EQ loss now @low', 'EQ loss now @high', 'Picked EQ', 'EQ change @low', 'EQ change @high', 'Ideal pad', 'Picked pad',
         'After low', 'After high', 'After tilt', 'Left low', 'Left high', 'Left tilt']
out.append(heads)
used = sorted({c['profile'] for c in cases})
sheets = {}
for pid in used:
    p = profiles[pid]
    freqs = [pt[0] for pt in p['eqs']['items'][0]['points']]
    assert all([pt[0] for pt in e['points']] == freqs for e in p['eqs']['items']), 'one frequency grid per profile'
    ws = wb.create_sheet(('EQ ' + pid)[:31]); ws.append(['EQ dB'] + freqs)
    for e in p['eqs']['items']:
        ws.append([e['value']] + [pt[1] for pt in e['points']])
    pads = wb.create_sheet(('Pads ' + pid)[:31])
    for v in p['pads']['values']:
        pads.append([v])
    sheets[pid] = (ws.title, len(freqs), len(p['eqs']['items']), len(p['pads']['values']))
work = wb.create_sheet('Work')

def loss_formula(eq_sheet, nf, row, fcell):
    hdr = f"'{eq_sheet}'!$B$1:${col(nf + 1)}$1"
    rng = f"'{eq_sheet}'!$B${row}:${col(nf + 1)}${row}"
    k = f"MATCH({fcell},{hdr},1)"
    return (f"=IF({fcell}=INDEX({hdr},{k}),INDEX({rng},{k}),INDEX({rng},{k})+(INDEX({rng},{k}+1)-INDEX({rng},{k}))"
            f"*({fcell}-INDEX({hdr},{k}))/(INDEX({hdr},{k}+1)-INDEX({hdr},{k})))")

for i, c in enumerate(cases):
    r = i + 2
    eq_sheet, nf, neq, npad = sheets[c['profile']]
    pad_sheet = ('Pads ' + c['profile'])[:31]
    out.append([c['id'], c['kind'], c['profile'], c['lowMHz'], c['highMHz'], c['measuredLow'], c['measuredHigh'], c['targetLow'], c['targetHigh'], c['pad'], c['eq']])
    base = i * 4 + 1
    lo, hi, sc, pd = (col(base + k) for k in range(4))
    work.cell(1, base, f"{c['id']} loss@low"); work.cell(1, base + 1, 'loss@high'); work.cell(1, base + 2, 'tilt score'); work.cell(1, base + 3, 'pad distance')
    for j in range(neq):
        wr = j + 2
        work[f'{lo}{wr}'] = loss_formula(eq_sheet, nf, j + 2, f'Cases!$D${r}')
        work[f'{hi}{wr}'] = loss_formula(eq_sheet, nf, j + 2, f'Cases!$E${r}')
        work[f'{sc}{wr}'] = f'=ABS(Cases!$L${r}-(({hi}{wr}-Cases!$O${r})-({lo}{wr}-Cases!$N${r}))-Cases!$M${r})'
    for j in range(npad):
        work[f'{pd}{j + 2}'] = f"=ABS('{pad_sheet}'!$A${j + 1}-Cases!$S${r})"
    eqs = f"'{eq_sheet}'!$A$2:$A${neq + 1}"
    loR, hiR, scR = (f'Work!${x}$2:${x}${neq + 1}' for x in (lo, hi, sc))
    pdR = f'Work!${pd}$2:${pd}${npad + 1}'
    f = {
        'L': f'=G{r}-F{r}', 'M': f'=I{r}-H{r}',
        'N': f'=INDEX({loR},MATCH(K{r},{eqs},0))', 'O': f'=INDEX({hiR},MATCH(K{r},{eqs},0))',
        'P': f'=INDEX({eqs},MATCH(MIN({scR}),{scR},0))',
        'Q': f'=INDEX({loR},MATCH(P{r},{eqs},0))-N{r}', 'R': f'=INDEX({hiR},MATCH(P{r},{eqs},0))-O{r}',
        'S': f'=J{r}+(G{r}-R{r})-I{r}',
        'T': f"=INDEX('{pad_sheet}'!$A$1:$A${npad},MATCH(MIN({pdR}),{pdR},0))",
        'U': f'=F{r}-Q{r}-(T{r}-J{r})', 'V': f'=G{r}-R{r}-(T{r}-J{r})', 'W': f'=V{r}-U{r}',
        'X': f'=U{r}-H{r}', 'Y': f'=V{r}-I{r}', 'Z': f'=W{r}-M{r}',
    }
    for k, v in f.items():
        out[f'{k}{r}'] = v

target = HERE / 'alignment-spreadsheet.xlsx'
with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / 'alignment-formulas.xlsx'; wb.save(src)
    subprocess.run(['soffice', '--headless', '--calc', '--convert-to', 'xlsx:Calc MS Excel 2007 XML', '--outdir', str(Path(tmp) / 'calc'), str(src)], check=True, capture_output=True, timeout=180)
    calc = Path(tmp) / 'calc' / 'alignment-formulas.xlsx'
    shutil.copyfile(calc, target)
values = openpyxl.load_workbook(target, data_only=True)['Cases']
formulas = openpyxl.load_workbook(target)['Cases']
keys = ['tiltMeasured', 'tiltTarget', 'eqLossNowLow', 'eqLossNowHigh', 'eq', 'eqChangeLow', 'eqChangeHigh', 'idealPad', 'pad', 'afterLow', 'afterHigh', 'afterTilt', 'leftLow', 'leftHigh', 'leftTilt']
results = []
for i, c in enumerate(cases):
    row = [values.cell(i + 2, k).value for k in range(12, 27)]
    assert all(isinstance(v, (int, float)) for v in row), (c['id'], row)
    assert str(formulas.cell(i + 2, 16).value).startswith('='), 'pick cell is a spreadsheet formula'
    results.append({'id': c['id'], **dict(zip(keys, row))})
(HERE / 'alignment-spreadsheet-results.json').write_text(json.dumps({
    'generator': 'research/build3/alignment-spreadsheet.py', 'workbook': 'research/build3/alignment-spreadsheet.xlsx', 'recalculated_by': 'LibreOffice Calc (headless)',
    'scope': 'Spreadsheet formulas interpolate the published EQ losses linearly in MHz, pick the EQ for tilt and the nearest pad for level. Synthetic cases; not a field alignment.',
    'results': results}, indent=1) + '\n')
print(f'Spreadsheet cases: {len(results)} recalculated by LibreOffice -> {target.name}')
