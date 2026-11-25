import fs from 'fs';
import path from 'path';
import en from '../src/catalog/en.json';
import { ALL_SYMBOLS, GROUP_KEYS } from '../src/core/catalog';
import { hasKey, normalizeForSearch, t } from '../src/core/i18n';

const texts = en as Record<string, string>;

describe('text catalogue', () => {
  test('every symbol has a name and a meaning, every modifier a short name', () => {
    for (const s of ALL_SYMBOLS) {
      expect(texts[`symbol.${s.id}.name`]).toBeTruthy();
      expect(texts[`symbol.${s.id}.meaning`]).toBeTruthy();
      if (s.isModifier) expect(texts[`symbol.${s.id}.short`]).toBeTruthy();
    }
  });
  test('every group has a name', () => {
    for (const g of GROUP_KEYS) expect(texts[`category.${g}`]).toBeTruthy();
  });
  test('every t("...") key written in src exists in en.json', () => {
    const missing: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name)) {
          for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bt\(\s*'([^']+)'/g)) if (!hasKey(m[1])) missing.push(`${m[1]} in ${e.name}`);
        }
      }
    };
    walk(path.join(__dirname, '..', 'src'));
    expect(missing).toEqual([]);
  });
});

describe('t() and search text', () => {
  test('inserts values and falls back to the key', () => {
    expect(t('ui.sheet.count', { count: 168 })).toBe('168 symbols shown');
    expect(t('ui.does.not.exist')).toBe('ui.does.not.exist');
  });
  test('search ignores case and accents', () => {
    expect(normalizeForSearch('Café Crème')).toBe('cafe creme');
  });
});

