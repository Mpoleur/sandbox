import fs from 'fs';
import path from 'path';
import {
  ALL_SYMBOLS, CARD_CATEGORY_KEYS, GROUP_KEYS, badgeSymbols, canUseNo, getSymbol, mainSymbols, symbolsInGroup, visibleSymbols,
} from '../src/core/catalog';

const SVG_DIR = path.join(__dirname, '..', '..', 'assets', 'symbols');
const NEEDS_CHECK = ['REL-01', 'REL-02', 'REL-03', 'REL-07', 'REL-08', 'REL-09', 'REL-10', 'REL-11', 'REL-12', 'REL-13'];
const CROSSED = ['DIE-13', 'MON-08', 'REL-01', 'REL-04', 'REL-05', 'REL-06'];

describe('symbol catalogue counts (Technical Analysis 6.3)', () => {
  const files = fs.readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();

  test('168 symbols, and the IDs equal the 168 SVG files', () => {
    expect(ALL_SYMBOLS).toHaveLength(168);
    expect(files).toHaveLength(168);
    expect(ALL_SYMBOLS.map((s) => s.id).sort()).toEqual(files);
    expect(new Set(ALL_SYMBOLS.map((s) => s.id)).size).toBe(168);
  });
  test('15 modifiers, exactly MOD-01 to MOD-15', () => {
    const mods = ALL_SYMBOLS.filter((s) => s.isModifier).map((s) => s.id);
    expect(mods).toHaveLength(15);
    expect(mods).toEqual(Array.from({ length: 15 }, (_, i) => `MOD-${String(i + 1).padStart(2, '0')}`));
  });
  test('10 symbols need a cultural check, exactly the ten named', () => {
    const hidden = ALL_SYMBOLS.filter((s) => s.review === 'needs-check').map((s) => s.id);
    expect(hidden).toHaveLength(10);
    expect(hidden.sort()).toEqual([...NEEDS_CHECK].sort());
  });
  test('158 visible in the public build, 168 in the review build', () => {
    expect(visibleSymbols(false)).toHaveLength(158);
    expect(visibleSymbols(true)).toHaveLength(168);
  });
  test('143 visible ordinary symbols as main symbol, 15 visible modifiers as badges', () => {
    expect(mainSymbols(false)).toHaveLength(143);
    expect(badgeSymbols(false)).toHaveLength(15);
    expect(mainSymbols(false).some((s) => s.isModifier)).toBe(false);
    expect(mainSymbols(true)).toHaveLength(153);
  });
  test('6 symbols already crossed out, exactly the six named', () => {
    const crossed = ALL_SYMBOLS.filter((s) => s.alreadyCrossed).map((s) => s.id);
    expect(crossed.sort()).toEqual([...CROSSED].sort());
    for (const id of CROSSED) expect(canUseNo(id)).toBe(false);
    expect(canUseNo('DIE-01')).toBe(true);
    expect(canUseNo('MOD-03')).toBe(false); // a modifier is never a main symbol
  });
  test('13 card categories out of 14 library groups, Modifiers is not a card category', () => {
    expect(GROUP_KEYS).toHaveLength(14);
    expect(CARD_CATEGORY_KEYS).toHaveLength(13);
    expect(CARD_CATEGORY_KEYS).not.toContain('modifiers');
    expect(GROUP_KEYS[GROUP_KEYS.length - 1]).toBe('modifiers');
  });
  test('visible symbols per group in the public build', () => {
    const expected: Record<string, number> = {
      basics: 10, 'food-beverage': 22, 'diet-allergies': 11, transport: 21, 'places-directions': 12, accommodation: 11,
      'health-emergency': 13, 'money-shopping': 9, 'time-numbers': 6, 'communication-tech': 5, activities: 12,
      'religion-customs': 3, pets: 8, modifiers: 15,
    };
    for (const g of GROUP_KEYS) expect(symbolsInGroup(g, false)).toHaveLength(expected[g]);
    expect(Object.values(expected).reduce((a, b) => a + b, 0)).toBe(158);
  });
  test('HEA-05 Police is not hidden, and the example card symbols are visible', () => {
    expect(getSymbol('HEA-05')?.review).toBe('ok');
    for (const id of ['DIE-01', 'BAS-01', 'PET-03', 'TRA-03']) expect(getSymbol(id)?.review).toBe('ok');
  });
});
