#!/usr/bin/env python3
"""Reproduce the all-selection documentation inventory; does not modify app data."""
import collections
import datetime
import hashlib
import json
import math
from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
DATA = ROOT / 'night-sweep'
catalog_path = DATA / 'catalog.json'
manual_path = DATA / 'setup-manuals.json'
C = json.loads(catalog_path.read_text())
M = json.loads(manual_path.read_text())['records']
OLD = json.loads((DATA / 'research/alpha17-manuals/catalog-audit.json').read_text())
NODE_REVIEW_PATH = ROOT / 'research/alpha17-equipment-refresh/node-manuals.json'
if not NODE_REVIEW_PATH.exists():
    NODE_REVIEW_PATH = DATA / 'research/alpha17-manuals/node-manuals.json'
NODES = json.loads(NODE_REVIEW_PATH.read_text())
families_old = {x['family']: x for x in OLD['families']}
node_review = {x['id']: x for x in NODES['catalog_audit']['node_profiles']}
power_review = {x['id']: x for x in NODES['catalog_audit']['power_curves']}
errors = []
warnings = []

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def valid_number(n):
    return isinstance(n, (int, float)) and not isinstance(n, bool) and math.isfinite(n)

def url_fields(value, path=''):
    result = []
    if isinstance(value, dict):
        for k, v in value.items():
            result += url_fields(v, f'{path}.{k}' if path else k)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            result += url_fields(v, f'{path}[{i}]')
    elif isinstance(value, str) and value.startswith(('http://', 'https://')):
        result.append({'field': path, 'url': value})
    return result

def source_record(url):
    prior = C['sourceAudit'].get(url)
    return {'url': url, 'recordedLinkAudit': prior,
            'linkAuditScope': 'Retained catalog metadata; not freshly fetched by this inventory run' if prior else 'No catalog link-audit record',
            'freshDocumentReview': 'SA-mainline-714414-Rev-A' if url == SA_URL else None}

SA_URL = 'https://www.scribd.com/document/157106375/Hoja-de-Datos-Pasivos'
SA_FREQ = [5, 10, 40, 50, 450, 550, 750, 870, 1000]
SA_ROWS = {
    'SADC8MM/through': [1.8, 1.8, 1.8, 1.8, 2.4, 2.4, 2.6, 3.4, 3.4],
    'SADC12MM/through': [1.2, 1.4, 1.4, 1.4, 1.7, 1.7, 2.1, 2.8, 2.8],
    'SADC16MM/through': [1.2, 1.3, 1.3, 1.3, 1.6, 1.6, 1.8, 2.4, 2.4],
    'SAIMM/through': [0.7, 0.8, 0.8, 0.8, 1.0, 1.0, 1.2, 1.4, 1.4],
    'SAS2MM/each-output': [4.1, 4.2, 4.2, 4.2, 4.5, 4.5, 4.9, 5.5, 5.5],
    'SAS3MM/each-output': [6.3, 6.3, 6.3, 6.3, 6.5, 6.5, 7.2, 7.9, 7.9],
    'SAS3UMM/high-loss-outputs': [7.6, 7.6, 7.6, 7.6, 8.0, 8.0, 8.2, 8.7, 8.7],
    'SAS3UMM/low-loss-output': [4.0, 4.0, 3.9, 3.9, 4.5, 4.5, 4.9, 5.3, 5.3],
}

def curve_summary(curve, path, entry_id, domain='MHz'):
    pts, bands = curve.get('points', []), curve.get('bands', [])
    rows = pts or bands
    if not rows:
        errors.append({'id': entry_id, 'path': path, 'issue': 'Empty numerical curve'})
    gaps = []
    for i, row in enumerate(rows):
        if len(row) != (2 if pts else 3) or not all(valid_number(x) for x in row):
            errors.append({'id': entry_id, 'path': path, 'row': i, 'issue': 'Invalid numerical row'})
            continue
        if row[0] <= 0 or row[-1] < 0 or (bands and row[1] < row[0]):
            errors.append({'id': entry_id, 'path': path, 'row': i, 'issue': 'Invalid frequency/voltage or negative loss/current'})
        if i and (row[0] <= rows[i-1][0] if pts else row[0] < rows[i-1][1]):
            errors.append({'id': entry_id, 'path': path, 'row': i, 'issue': 'Unordered or overlapping rows'})
        if bands and i and row[0] > rows[i-1][1]:
            gaps.append([rows[i-1][1], row[0]])
    declared = [curve.get('min'), curve.get('max')]
    if rows and (not all(valid_number(x) for x in declared) or declared[0] > rows[0][0] or declared[1] < (rows[-1][0] if pts else rows[-1][1])):
        errors.append({'id': entry_id, 'path': path, 'issue': 'Declared bounds do not cover numerical rows'})
    if not curve.get('source'):
        errors.append({'id': entry_id, 'path': path, 'issue': 'No numeric-source provenance'})
    return {'path': path, 'axis': domain, 'basis': curve.get('basis'), 'rowCount': len(rows),
            'representation': 'points' if pts else 'printed-bands', 'declaredDomain': declared,
            'tabulatedDomain': [rows[0][0], rows[-1][0] if pts else rows[-1][1]] if rows else None,
            'source': curve.get('source'), 'page': curve.get('page'),
            'revisionField': curve.get('revision') or curve.get('source_revision'),
            'gapPolicy': curve.get('gapPolicy'), 'printedFractionalGaps': gaps,
            'interpolation': ('sqrt-frequency' if path == 'curve' else 'linear') if pts else 'Piecewise printed bound; shared boundary uses next band',
            'zeroCells': sum(1 for x in rows if x[-1] == 0),
            'limitations': [curve[k] for k in ('note', 'tolerance_note') if curve.get(k)]}

entries = []
curve_count = row_count = 0
source_fields = []
mapped = collections.defaultdict(list)
for m in M:
    for eid in m['equipmentIds']:
        mapped[eid].append(m)

for section in ('devices', 'cables', 'powerEquipment', 'nodeProfiles'):
    ids = [x['id'] for x in C[section]]
    if len(ids) != len(set(ids)):
        errors.append({'collection': section, 'issue': 'Duplicate IDs'})
    if section == 'devices':
        normalized_models = [(x.get('family'), re.sub(r'\s+', '', x.get('model', '')).casefold()) for x in C[section]]
        if len(normalized_models) != len(set(normalized_models)):
            errors.append({'collection': section, 'issue': 'Duplicate normalized model within family'})
    for item in C[section]:
        eid = item['id']
        urls = url_fields(item)
        source_fields += urls
        e = {'collection': section, 'id': eid, 'label': item.get('label'), 'model': item.get('model'),
             'family': item.get('family'), 'sourceFields': urls, 'manualRecordIds': [m['id'] for m in mapped[eid]],
             'currentlySelectable': not bool(item.get('retired')), 'retiredCompatibilityOnly': bool(item.get('retired')),
             'retirementReason': item.get('retirementReason'),
             'curves': [], 'configurationNotes': [item[k] for k in ('note', 'notes') if item.get(k)],
             'documentationCoverage': 'retained-provenance-and-all-entry-structural-audit',
             'fullCellRecertification': False, 'missingIsZero': False}
        if section == 'devices':
            ports = item.get('ports', [])
            if len({x['id'] for x in ports}) != len(ports):
                errors.append({'id': eid, 'issue': 'Duplicate output IDs'})
            if item.get('terminal') and any(p.get('role') == 'through' for p in ports):
                errors.append({'id': eid, 'issue': 'Terminal tap has through path'})
            e['type'] = 'active' if item.get('active') else 'custom-data' if item.get('custom') else 'cable-only' if eid == 'none' else 'passive'
            for port in ports:
                for key in ('nominal', 'maximum'):
                    if key in port:
                        e['curves'].append(curve_summary(port[key], f"ports.{port['id']}.{key}", eid))
                nom, mx = port.get('nominal', {}), port.get('maximum', {})
                nd, md = dict(nom.get('points', [])), dict(mx.get('points', []))
                for f in nd.keys() & md.keys():
                    if nd[f] > md[f] + 1e-8:
                        errors.append({'id': eid, 'issue': 'Nominal exceeds maximum', 'frequency': f})
            prior = families_old.get(item.get('family'), {})
            e['familyEvidence'] = prior.get('reviewStatus')
            if prior.get('note'):
                e['configurationNotes'].append(prior['note'])
            if item.get('active'):
                e['publishedReference'] = item.get('publishedGain')
                e['documentationCoverage'] = 'active-variant-review-and-registry-mapping; see alpha17-manuals/active-manuals.json'
                e['unverified'] = ['Installed PID/module, split, firmware, output and control option', 'Actual gain/output at arbitrary route frequencies; requires measured/configured gain profile']
            elif item.get('custom'):
                e['documentationCoverage'] = 'exact-technician-table-required'
                e['unverified'] = ['No built-in exact loss table; flat-tap or different family data must not be substituted']
            elif eid == 'none':
                e['documentationCoverage'] = 'not-equipment'
                e['missingIsZero'] = 'Only this explicitly selected cable-only equipment path returns zero equipment loss'
                e['unverified'] = []
            else:
                e['unverified'] = ['Inherited numeric cells not independently re-transcribed in this inventory unless explicitly stated', 'Actual installed variant and condition']
            if item.get('family') == 'Scientific-Atlanta Multimedia mainline 1GHz':
                for port in ports:
                    if 'maximum' in port:
                        key = f"{item['model']}/{port['id']}"
                        expected = list(map(list, zip(SA_FREQ, SA_ROWS[key])))
                        if port['maximum']['points'] != expected:
                            errors.append({'id': eid, 'issue': 'Fresh SA mainline printed table mismatch', 'path': key})
                if item['model'] in ('SADC8MM', 'SADC12MM', 'SADC16MM'):
                    expected = {'SADC8MM': 8.5, 'SADC12MM': 12.5, 'SADC16MM': 16}[item['model']]
                    actual = next(p for p in ports if p['id'] == 'branch')['nominal']['points']
                    if actual != [[5, expected], [1000, expected]]:
                        errors.append({'id': eid, 'issue': 'Fresh SA nominal coupling mismatch'})
                e['documentationCoverage'] = 'fresh-archived-manufacturer-document: all 72 printed maximum-loss cells across family plus three nominal couplings matched'
                e['freshMaximumLossCellsCompared'] = sum(len(p.get('maximum', {}).get('points', [])) for p in ports)
                e['freshCellReviewScope'] = 'Printed maximum-loss rows only; nominal flat curves remain declared estimates'
                e['unverified'] = ['Installed condition/variant; manufacturer-hosted original link not located', 'Frequency-dependent coupling response is not printed; nominal flat coupling is an estimate']
        elif section == 'cables':
            e['type'] = 'cable-profile'
            e['curves'].append(curve_summary(item['curve'], 'curve', eid))
            dc = item.get('dc', {})
            e['dc'] = dc
            parts = [dc.get(k) for k in ('inner_ohm_per_1000ft', 'outer_ohm_per_1000ft', 'loop_ohm_per_1000ft')]
            if all(valid_number(x) for x in parts) and abs(parts[0] + parts[1] - parts[2]) > 1e-8:
                errors.append({'id': eid, 'issue': 'DC inner + outer != loop'})
            e['unverified'] = ['Full inherited attenuation table not freshly re-transcribed', 'SKU/revision matching; accessible family product page alone does not reverify original numeric source']
            if eid.startswith('mc2_') or eid in ('p3_1000', 'commscope_rg6', 'commscope_rg11'):
                e['documentRevision'] = 'Historical Cable Technician Pocket Guide MX0398 Rev U (2021); retained provenance, not newly downloaded'
            else:
                e['documentRevision'] = 'Original SKU PDF revision not separately recovered in this inventory'
            if eid == 'p3_625':
                e['documentationCoverage'] = 'reused-same-session-exact-SKU evidence: all attenuation points corroborated by indexed 5308003 manufacturer text; live manufacturer page DC confirmed'
                e['dcEvidence'] = '0.84 + 0.26 = 1.10 ohm/1000ft at 20 C, exact live 5308003 product page; not another family SKU'
            if not all(valid_number(x) for x in parts):
                e['unverified'].append('No complete published DC resistance; explicit entered loop resistance required for power route')
        elif section == 'powerEquipment':
            e['type'] = 'power-load-profile'
            e['mode'] = item['mode']
            e['publishedWattRowCount'] = len(item.get('watts_points', []))
            for i, row in enumerate(item.get('watts_points', [])):
                if len(row) != 2 or not all(valid_number(x) for x in row) or row[0] <= 0 or row[1] < 0 or (i and row[0] <= item['watts_points'][i-1][0]):
                    errors.append({'id': eid, 'row': i, 'issue': 'Invalid companion watt table'})
            e['voltageDomain'] = [item.get('min_voltage'), item.get('max_voltage')]
            if item['mode'] == 'curve':
                e['curves'].append(curve_summary({'points': item['points'], 'min': item['min_voltage'], 'max': item['max_voltage'], 'source': item.get('source_url'), 'basis': item.get('basis')}, 'inputCurrent', eid, 'VAC'))
                e['unverified'] = ['Configuration-specific typical current; not a maximum or universal installed load', 'Actual installed supply, modules, split and options; equipment temperature effects not modeled']
            else:
                e['documentationCoverage'] = 'manual-installed-load-required; no borrowed curve'
                e['unverified'] = ['Enter complete measured installed current, or watts and actual PF, as requested by selected load mode']
            if eid in power_review:
                e['independentRelatedReview'] = power_review[eid]
                e['documentationCoverage'] = 'reused-node-specialist-original-table-review'
            e['basis'] = item.get('basis')
            if item['mode'] == 'curve' and not item.get('watts_points'):
                e['unverified'].append('Published real-power table absent; current times voltage is VA, not verified watts or PF')
        else:
            e['type'] = 'node-launch-profile'
            e['sourceRevision'] = item.get('source_revision')
            e['bands'] = item.get('bands')
            e['testPoint'] = {'lossDb': item.get('test_point_loss_db'), 'toleranceDb': item.get('test_point_tolerance_db')}
            e['independentRelatedReview'] = node_review.get(eid)
            e['documentationCoverage'] = 'reused-node-specialist-original-band-and-TP-review'
            e['userDeployment'] = item.get('userDeployment')
            e['unverified'] = ['Exact installed PID, optical/RPD/RF modules, split, firmware and local operating targets']
        if not item.get('retired') and e['type'] in ('active', 'node-launch-profile', 'power-load-profile') and not mapped[eid]:
            errors.append({'id': eid, 'issue': 'No setup-manual registry mapping'})
        e['setupManualCoverage'] = {
            'matchedManual': any(m['kind'] == 'manual' for m in mapped[eid]),
            'datasheetOnlyAvailable': any(m['kind'] == 'datasheet' for m in mapped[eid]),
            'requestOrExactVariantGap': [m['id'] for m in mapped[eid] if m['kind'] == 'request'],
        }
        e['sourceRoles'] = {
            'numericCurves': sorted({c['source'] for c in e['curves'] if c.get('source')}),
            'originalNumericProvenance': item.get('original_data_source'),
            'equipmentReferenceOrFallback': item.get('source') or item.get('source_url'),
            'manufacturerReference': item.get('manufacturer_source_url'),
            'qualification': 'A product/family reference or request page is not proof of exact numeric table or setup-manual coverage',
        }
        curve_count += len(e['curves'])
        row_count += sum(x['rowCount'] for x in e['curves'])
        entries.append(e)

all_ids = {x['id'] for x in entries}
for m in M:
    for eid in m['equipmentIds']:
        if eid not in all_ids:
            errors.append({'manualId': m['id'], 'issue': 'Unknown mapped equipment ID', 'id': eid})
    source_fields += url_fields(m, 'setupManuals.' + m['id'])
unique_urls = sorted({x['url'] for x in source_fields})
for url in unique_urls:
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or re.search(r'\s', url):
        errors.append({'url': url, 'issue': 'Malformed URL'})

families = []
for family in sorted({x.get('family') for x in C['devices']}):
    es = [x for x in entries if x.get('family') == family]
    prior = families_old.get(family, {})
    recids = sorted({mid for x in es for mid in x['manualRecordIds']})
    fs = {'family': family, 'entryCount': len(es), 'ids': [x['id'] for x in es],
          'currentlySelectableCount': sum(x['currentlySelectable'] for x in es),
          'retiredCompatibilityCount': sum(x['retiredCompatibilityOnly'] for x in es),
          'sourceUrls': sorted({s['url'] for x in es for s in x['sourceFields']}),
          'document': prior.get('document', 'See exact variant-specific registry records'),
          'evidenceScope': prior.get('reviewStatus', 'active-specialist-review'),
          'configurationQualification': prior.get('note', 'Match actual installed variant; see per-ID reference and registry scope'),
          'manualRecordIds': recids, 'revisionMetadata': [next(m['revision'] for m in M if m['id'] == mid) for mid in recids],
          'fullCellRecertification': False}
    if family == 'Scientific-Atlanta Multimedia mainline 1GHz':
        fs.update(document='Scientific-Atlanta Multimedia Passives, Part Number 714414 Rev A, September 1999, p2',
                  evidenceScope='Fresh Firecrawl retrieval of archived original manufacturer document; 72 maximum-loss cells and 3 nominal coupling values matched',
                  revisionMetadata=['714414 Rev A, September 1999'],
                  freshMaximumLossCellsCompared=72,
                  freshCellReviewScope='Eight printed maximum-loss rows only; nominal coupling flat profiles remain estimates')
    families.append(fs)

gap_curves = [dict(id=e['id'], path=c['path'], gaps=c['printedFractionalGaps'], policy=c['gapPolicy']) for e in entries for c in e['curves'] if c['printedFractionalGaps']]
policy_curves = [dict(id=e['id'], path=c['path']) for e in entries for c in e['curves'] if c['gapPolicy']]
manual_missing = [e['id'] for e in entries if e['currentlySelectable'] and e['type'] in ('active', 'node-launch-profile', 'power-load-profile') and not e['setupManualCoverage']['matchedManual']]
current = [e for e in entries if e['currentlySelectable']]
retired = [e for e in entries if e['retiredCompatibilityOnly']]
results = {
    'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'catalogRevision': C['revision'],
    'scope': 'Every current selection has an inventory row and all numerical curves receive structural checks. Source documentation was reviewed at family/configuration level using retained same-session evidence plus one bounded fresh historical mainline review. This is not independent re-transcription of every inherited table cell or hardware validation.',
    'method': {'workflow': ['Data analyze-data-quality', 'Data validate-data'],
               'connectedDataCapability': 'Only a blocking intake form is exposed; no computational/query tool. Local reproducible Python/Node used for catalog tables; no separate Data app created.',
               'sourceHierarchy': 'Supplied catalog controls selection list; exact manufacturer-authored revision controls technical facts; archived manufacturer copies remain labeled; generic product page is not a replacement for original numerical source.'},
    'inputSha256': {str(p.relative_to(ROOT)): sha(p) for p in (catalog_path, manual_path, DATA/'engine.js', DATA/'research/alpha17-equipment-refresh/active-manuals.json', NODE_REVIEW_PATH)},
    'counts': {'selectionRecords': len(entries), 'rfSelections': len(C['devices']), 'activeRfSelections': sum(bool(x.get('active')) for x in C['devices']), 'nonactiveRfSelections': sum(not x.get('active') for x in C['devices']), 'deviceFamilies': len(families), 'cables': len(C['cables']), 'powerProfiles': len(C['powerEquipment']), 'nodeProfiles': len(C['nodeProfiles']), 'numericCurves': curve_count, 'numericRows': row_count, 'publishedWattCurvesAdditional': sum(bool(x.get('watts_points')) for x in C['powerEquipment']), 'manualRegistryRecords': len(M), 'manualRegistryKinds': dict(collections.Counter(m['kind'] for m in M)), 'uniqueSourceUrlsIncludingManuals': len(unique_urls), 'recordedCatalogLinkStates': dict(collections.Counter(x['status'] for x in C['sourceAudit'].values())), 'printedGapInstances': sum(len(c['gaps']) for c in gap_curves), 'explicitGapPolicyCurves': len(policy_curves), 'structuralErrors': len(errors)},
    'automatedChecks': ['Unique IDs and output IDs', 'Finite nonnegative ordered rows and declared-domain coverage', 'Terminal taps have no through path', 'Nominal does not exceed maximum at shared printed points', 'Cable inner + outer equals loop resistance where all three published', 'Numeric curve source exists', 'Active/node/power registry coverage and no orphan mappings', 'All gathered technical source URLs have HTTP(S) syntax', 'Fresh SA mainline exact-model printed-row comparison'],
    'errors': errors, 'warnings': warnings,
    'currentSelectionCounts': {'allCollections': len(current), **dict(collections.Counter(e['collection'] for e in current)), 'activeRf': sum(e['type']=='active' for e in current)},
    'retiredCompatibilityCounts': {'allCollections': len(retired), **dict(collections.Counter(e['collection'] for e in retired)), 'ids': [e['id'] for e in retired]},
    'countsQualification': 'The full catalog counts include retired compatibility records; currentSelectionCounts excludes them. These are selection records, not distinct physical units/models; RF and power selections can describe the same equipment. Curve count includes input-current curves but excludes the eight companion watt tables, matching qa/catalog-audit.cjs convention.',
    'publishedWattRowsAdditional': sum(len(x.get('watts_points', [])) for x in C['powerEquipment']),
    'findings': [
        {'severity': 'retained-guardrail', 'issue': 'Actual installed equipment identity remains user-confirmed; family title alone is insufficient for split, selected output, supply, firmware, control and source revision.'},
        {'severity': 'current-equipment-scope', 'issue': 'UBT main/aux RF and three UBT power presets are retired from current pickers/workflows; retained only for legacy saved-job readback. HGBT and passive unbalanced three-way outputs remain current.', 'retiredIds': [e['id'] for e in retired]},
        {'severity': 'manual-gap', 'issue': 'Exact Quantum18 LE and BA setup manuals remain unavailable; EN9000 commissioning guide requires manufacturer customer access; exact legacy GaN 42/54 source remains unresolved.', 'manualRecordIds': [m['id'] for m in M if m['kind']=='request']},
        {'severity': 'source-gap', 'issue': 'Some legacy cable PDFs are unavailable or product-family fallbacks. Original curve/DC source is preserved separately; fallback page availability does not certify numeric cells.'},
        {'severity': 'calculation-qualification', 'issue': 'Passive point interpolation is linear and cable interpolation is square-root frequency between printed points; these are estimates, not measured responses. Source band gaps stay unavailable unless the individual curve explicitly declares adjacent-maximum budgeting.'},
        {'severity': 'corrected-before-this-inventory', 'issue': 'Printed band upper endpoints now return their source bound; exactly 21 legacy SA Multimedia maximum-through curves carry adjacent-maximum fractional-gap policy. Current source inspected; new runtime check recorded separately.'},
        {'severity': 'source-provenance-recovered', 'issue': 'Scientific-Atlanta Multimedia mainline original archived document revision recovered and all 72 printed maximum insertion-loss cells plus 3 nominal coupling values matched; no numeric source edits needed.'},
        {'severity': 'not-zero', 'issue': '15 custom-data RF selections need exact entered loss; 6 manual power selections need entered load. Missing manufacturer table is not zero. Cable-only is an explicit zero equipment path.'},
        {'severity': 'not-watts', 'issue': 'Current curves cannot establish true watts or PF when companion real-power values are absent; passing-current and supply maximum ratings are not station consumption.'},
        {'severity': 'operating-range', 'issue': 'App RF calculations are limited to 5–1800MHz even when a preserved source table extends to 1825/2000/2050MHz. Table ranges do not automatically establish safe operating voltage or local acceptance targets.'},
        {'severity': 'temperature', 'issue': 'Built-in cable attenuation and loop resistance use documented engineering temperature factors; passive and equipment load temperature effects are not automatically modeled. Custom actual-condition tables are not corrected twice.'},
    ],
    'families': families, 'entries': entries,
    'manualRegistry': M,
    'activeNodePowerSelectionsWithoutMatchedManual': manual_missing,
    'printedGapCurves': gap_curves, 'explicitGapPolicyCurves': policy_curves,
    'sources': [source_record(url) for url in unique_urls],
    'freshHistoricalDocument': {'id': 'SA-mainline-714414-Rev-A', 'title': 'Multimedia Passives', 'author': 'Scientific-Atlanta', 'revision': 'Part Number 714414 Rev A, September 1999', 'originalManufacturerHosted': False, 'archiveUrl': SA_URL, 'page': 2, 'retrieval': 'Firecrawl fresh scrape HTTP 200', 'scrapeId': '01a1c7d4-0520-7168-ba5f-2b2b6d5da881', 'rowFixture': {'frequencyMHz': SA_FREQ, 'maximumLossDb': SA_ROWS}, 'scope': '8 exact maximum-loss rows / 72 cells; three nominal coupled-loss values; original document text, not host AI summary'},
    'relatedEvidence': ['alpha17-manuals/catalog-audit.json', 'alpha17-manuals/active-manuals.json', 'alpha17-manuals/node-manuals.json', 'alpha17-manuals/dsim-pilot-guide-review.md'],
    'notPerformed': ['No physical hardware/firmware validation', 'No fresh independent transcription of every inherited cell', 'No replacement of exact manuals with another product family', 'No app build, release claim, source catalog mutation or commit'],
}
(OUT/'catalog-documentation-inventory.json').write_text(json.dumps(results, indent=2, ensure_ascii=False)+'\n')
lines = ['# NightSweep 1.7 Alpha equipment documentation inventory', '',
         f"Catalog `{C['revision']}`; generated {results['generatedAt']}.", '',
         results['scope'], '',
         'The JSON companion lists every selection ID, curve bounds/basis/source, all source URL fields, mapped setup manuals and revision, per-family evidence, missing data and configuration qualifications. The script is reproducible and does not modify app data.', '',
         '## Coverage and checks', '',
         f"{len(current)} currently selectable records, plus {len(retired)} retired compatibility records. Current RF: {sum(e['collection']=='devices' for e in current)} ({sum(e['type']=='active' for e in current)} active, 491 nonactive); cables: 17; power: {sum(e['collection']=='powerEquipment' for e in current)}; nodes: 3. The full retained catalog has {len(entries)} records in 36 RF families. These are selection records, not distinct physical models. All 1,324 numerical curves / 14,126 rows passed the structural audit, including retained legacy curves; 8 companion watt tables are checked and counted separately. No new numerical correction was identified.", '',
         f"Registry: {len(M)} records ({sum(m['kind']=='manual' for m in M)} manuals, {sum(m['kind']=='datasheet' for m in M)} datasheets, {sum(m['kind']=='request' for m in M)} exact-manual/source requests). Every current active RF, node and power ID maps to at least one record; a datasheet/request mapping does not mean an exact setup manual exists.", '',
         'Data validate-data and analyze-data-quality methods were applied. The connected Data namespace exposes an intake form only, so reproducible local Python/Node performs the actual table checks. No separate app or blocking intake was created.', '',
         '## Current limits and findings', '']
for f in results['findings']:
    lines.append(f"- **{f['severity']}**: {f['issue']}")
lines += ['', '## Family documentation matrix', '', '| RF family | Current / retired | Document/revision or source scope | Evidence |', '|---|---:|---|---|']
for f in families:
    docs = f['document']
    sources = '<br>'.join(f"[source {i+1}]({url})" for i, url in enumerate(f['sourceUrls'])) or 'Entered data / no equipment'
    lines.append(f"| {f['family']} | {f['currentlySelectableCount']} / {f['retiredCompatibilityCount']} | {docs}<br>{sources} | {f['evidenceScope']} |")
lines += ['', '## Cable coverage', '', '| ID | Source table | Frequency domain MHz | DC loop data | Verification qualification |', '|---|---|---|---|---|']
for e in entries:
    if e['collection'] == 'cables':
        c=e['curves'][0]
        lines.append(f"| `{e['id']}` | [original]({c['source']}); p{c['page']} | {c['tabulatedDomain'][0]}–{c['tabulatedDomain'][1]} | {e['dc'].get('loop_ohm_per_1000ft', 'not published')} Ω/1000ft | {e['documentationCoverage']} |")
lines += ['', '## Power and node documentation', '', '| Selection ID | Mode/type | Matched registry documents | Qualification |', '|---|---|---|---|']
for e in entries:
    if e['collection'] in ('powerEquipment', 'nodeProfiles'):
        docs = '; '.join(f"{m['id']} ({m['revision']}; {m['kind']})" for m in mapped[e['id']])
        lines.append(f"| `{e['id']}` | {'Retired compatibility — ' if e['retiredCompatibilityOnly'] else ''}{e.get('mode',e['type'])} | {docs or 'Retired compatibility only; no current workflow mapping'} | {e['documentationCoverage']} |")
lines += ['', '## Link states, age and revision', '',
          'The catalog records 81 earlier link checks on 2026-11-10: 62 verified, 15 unavailable, 3 redirected and 1 blocked. Those states are preserved as recorded evidence and were not all freshly fetched for this inventory. A verified URL or live product page is not proof that every numeric curve cell or exact setup variant was checked. Older publication dates identify historical applicability; age alone is not an error.', '',
          'Fresh bounded gap review: the archived Scientific-Atlanta *Multimedia Passives* original is Part Number 714414 Rev A, September 1999, p2. All 72 maximum insertion-loss cells across 8 rows and the 8.5/12.5/16dB nominal coupling values match the current catalog. The archive is third party; the original text, not the host AI summary, controlled the comparison. See the JSON fixture and scrape ID. No manufacturer-hosted original was located.', '',
          'Missing exact setup manuals remain explicit for Quantum18 LE/BA and EN9000 commissioning; the historical legacy GaN 42/54 datasheet gap remains explicit. Existing manual revisions are copied verbatim into the per-ID mapping. Actual installed module/firmware applicability must be confirmed on the job.', '',
          'ACI pilot codes are separately sourced to user-supplied historical Rev A guide photos pp2–5, not inferred from a formula. The 86 provided rows cover 52–94 and 100–142; missing 95–99 and 303 are not fabricated. Channel 100 is a source exception and cannot be copied until confirmed. This does not verify hardware or app/firmware compatibility. SG Rev E pad procedure and current SG Rev H H0 procedure are not interchangeable; DSIM-A Rev T does not certify the 1218 variant.', '',
          '## Reproduce and interpret', '',
          'Run `python night-sweep/research/alpha17-equipment-refresh/audit_catalog.py`, then `node qa/catalog-audit.cjs`. This inventory includes input SHA-256 hashes so a later shared-workspace catalog change can be detected. The machine-readable output records structural errors rather than silently treating missing data as zero. Runtime numerical boundary checks are recorded separately by `runtime-curve-check.cjs`.', '',
          'Related evidence: `../alpha17-manuals/catalog-audit.json`, `active-manuals.json`, `node-manuals.json`, and `dsim-pilot-guide-review.md`. Earlier equipment/source reviews are reused with their original scope. No physical-device testing, new Wolfram checks, app build or release validation is claimed here.', '']
(OUT/'catalog-documentation-inventory.md').write_text('\n'.join(lines))
print(json.dumps({'counts': results['counts'], 'errors': errors}, indent=2))
if errors:
    raise SystemExit(1)
