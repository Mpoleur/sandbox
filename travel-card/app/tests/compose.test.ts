import { chipNumber, checkItem, layoutItem, IDENTITY, NO_SYMBOL_MATRIX, SLOT_MATRIX } from '../src/core/compose';

describe('card composition (Artwork Guideline 6, FA v0.6 5.2 and 5.5)', () => {
  test('symbol under No is scaled to 60 % about the centre: translate(12.8 12.8) scale(0.6)', () => {
    expect(NO_SYMBOL_MATRIX).toEqual([0.6, 0, 0, 0.6, 12.8, 12.8]);
    // the canvas centre stays in place
    const [a, , , d, e, f] = NO_SYMBOL_MATRIX;
    expect(a * 32 + e).toBeCloseTo(32);
    expect(d * 32 + f).toBeCloseTo(32);
  });
  test('badge slots are 40 %, A bottom right (38.4, 38.4) and B top right (38.4, 0), and do not overlap', () => {
    expect(SLOT_MATRIX.A).toEqual([0.4, 0, 0, 0.4, 38.4, 38.4]);
    expect(SLOT_MATRIX.B).toEqual([0.4, 0, 0, 0.4, 38.4, 0]);
    const bBottom = 0 + 64 * 0.4;
    expect(bBottom).toBeLessThanOrEqual(38.4);
  });
  test('peanut with No then Allergy: No sign, peanut at 60 %, Allergy badge 1 in slot A', () => {
    const l = layoutItem({ symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] });
    expect(l.noSign).toBe(true);
    expect(l.symbolMatrix).toEqual(NO_SYMBOL_MATRIX);
    expect(l.badges).toHaveLength(1);
    expect(l.badges[0]).toMatchObject({ id: 'MOD-03', slot: 'A', number: 1 });
  });
  test('No chosen second gives the same layout: No never takes a slot', () => {
    const l = layoutItem({ symbolId: 'DIE-01', badges: ['MOD-03', 'MOD-01'] });
    expect(l.badges.map((b) => [b.id, b.slot, b.number])).toEqual([['MOD-03', 'A', 1]]);
  });
  test('two ordinary badges: first in slot A, second in slot B, symbol at 100 %', () => {
    const l = layoutItem({ symbolId: 'BAS-01', badges: ['MOD-04', 'MOD-08'] });
    expect(l.noSign).toBe(false);
    expect(l.symbolMatrix).toEqual(IDENTITY);
    expect(l.badges.map((b) => [b.id, b.slot, b.number])).toEqual([['MOD-04', 'A', 1], ['MOD-08', 'B', 2]]);
  });
  test('a symbol already crossed out is never scaled again and shows no extra No sign', () => {
    const l = layoutItem({ symbolId: 'DIE-13', badges: ['MOD-01'] });
    expect(l.noSign).toBe(false);
    expect(l.symbolMatrix).toEqual(IDENTITY);
    expect(checkItem({ symbolId: 'DIE-13', badges: ['MOD-01'] })).toContain('no-on-crossed');
  });
  test('rules: at most 2 badges including No, no duplicates, badges are modifiers, a modifier is not a main symbol', () => {
    expect(checkItem({ symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] })).toEqual([]);
    expect(checkItem({ symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03', 'MOD-04'] })).toContain('too-many');
    expect(checkItem({ symbolId: 'DIE-01', badges: ['MOD-03', 'MOD-03'] })).toContain('duplicate');
    expect(checkItem({ symbolId: 'DIE-01', badges: ['FOO-01'] })).toContain('not-a-modifier');
    expect(checkItem({ symbolId: 'MOD-03', badges: [] })).toContain('main-is-modifier');
    expect(checkItem({ symbolId: 'NOPE-99', badges: [] })).toContain('unknown-symbol');
  });
  test('chip numbers: No has none, the other badge reads 1', () => {
    expect(chipNumber(['MOD-01', 'MOD-03'], 'MOD-01')).toBeUndefined();
    expect(chipNumber(['MOD-01', 'MOD-03'], 'MOD-03')).toBe(1);
    expect(chipNumber(['MOD-03', 'MOD-04'], 'MOD-04')).toBe(2);
    expect(chipNumber(['MOD-03'], 'MOD-04')).toBeUndefined();
  });
});
