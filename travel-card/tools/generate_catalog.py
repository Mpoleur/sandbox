# One-time generator: Symbol List (xlsx) -> app/src/catalog/symbols.json and en.json.
# After the first run the JSON files are the source of truth for the app (Technical Analysis 6.1).
# The Status and Emoji columns of the Symbol List are NOT read. Refuses to overwrite without --force.
import json, os, sys, openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'app', 'src', 'catalog')
XLSX = os.path.join(ROOT, 'docs', 'support', 'Travel Cards - Symbol List.xlsx')

# Library groups in the order of Functional Analysis v0.6 section 5.4. Modifiers is a library group only.
GROUPS = [
    ('basics', 'Basics'), ('food-beverage', 'Food & beverage'), ('diet-allergies', 'Diet & allergies'),
    ('transport', 'Transport'), ('places-directions', 'Places & directions'), ('accommodation', 'Accommodation'),
    ('health-emergency', 'Health & emergency'), ('money-shopping', 'Money & shopping'), ('time-numbers', 'Time & numbers'),
    ('communication-tech', 'Communication & tech'), ('activities', 'Activities'), ('religion-customs', 'Religion & customs'),
    ('pets', 'Pets'), ('modifiers', 'Modifiers'),
]
KEY = {name: key for key, name in GROUPS}
NEEDS_CHECK = {'REL-01', 'REL-02', 'REL-03', 'REL-07', 'REL-08', 'REL-09', 'REL-10', 'REL-11', 'REL-12', 'REL-13'}
ALREADY_CROSSED = {'DIE-13', 'MON-08', 'REL-01', 'REL-04', 'REL-05', 'REL-06'}
SHORT = {'MOD-01': 'No', 'MOD-02': 'Without', 'MOD-03': 'Allergy', 'MOD-04': 'Question', 'MOD-05': 'Please',
         'MOD-06': 'How much?', 'MOD-07': 'Yes', 'MOD-08': 'Urgent', 'MOD-09': 'More', 'MOD-10': 'Small',
         'MOD-11': 'Hot', 'MOD-12': 'Less', 'MOD-13': 'Medium', 'MOD-14': 'Big', 'MOD-15': 'Cold'}

# Interface texts for milestone 1; later milestones add their own keys directly in en.json.
UI = {
    'ui.app.name': 'Travel Card',
    'ui.home.title': 'Travel Card',
    'ui.home.milestone': 'Milestone 1 build: symbols and one card',
    'ui.home.exampleCard': "No peanuts, I'm allergic",
    'ui.home.openContactSheet': 'Check all symbols',
    'ui.sheet.title': 'All symbols',
    'ui.sheet.count': '{count} symbols shown',
    'ui.sheet.needsCheck': 'needs check',
    'ui.common.back': 'Back',
}


def main():
    force = '--force' in sys.argv
    for f in ('symbols.json', 'en.json'):
        if os.path.exists(os.path.join(OUT, f)) and not force:
            sys.exit(f'{f} exists. The JSON is now the source of truth. Use --force only to regenerate on purpose.')
    wb = openpyxl.load_workbook(XLSX, read_only=True)
    rows = [r for r in list(wb['Symbols'].iter_rows(values_only=True))[1:] if r[0]]
    by_group = {k: [] for k, _ in GROUPS}
    for r in rows:
        sid, cat, name, meaning, _emoji, _src, prio = r[0], r[1], r[2], r[3], r[4], r[5], r[6]
        by_group[KEY[cat]].append((sid, name, meaning, prio))
    symbols, en = [], {}
    for key, name in GROUPS:
        en[f'category.{key}'] = name
        for sid, nm, meaning, prio in by_group[key]:
            symbols.append({
                'id': sid, 'category': key, 'isModifier': key == 'modifiers', 'priority': prio,
                'review': 'needs-check' if sid in NEEDS_CHECK else 'ok',
                'alreadyCrossed': sid in ALREADY_CROSSED,
            })
            en[f'symbol.{sid}.name'] = nm
            en[f'symbol.{sid}.meaning'] = meaning
            if key == 'modifiers':
                en[f'symbol.{sid}.short'] = SHORT[sid]
    en.update(UI)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'symbols.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'formatVersion': 1, 'categories': [k for k, _ in GROUPS], 'symbols': symbols}, f, indent=1, ensure_ascii=False)
        f.write('\n')
    with open(os.path.join(OUT, 'en.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(en, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(f'{len(symbols)} symbols, {sum(s["isModifier"] for s in symbols)} modifiers, '
          f'{sum(s["review"] == "needs-check" for s in symbols)} needs-check, {len(en)} text keys')


if __name__ == '__main__':
    main()
