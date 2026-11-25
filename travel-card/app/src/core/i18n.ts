import en from '../catalog/en.json';

type Texts = Record<string, string>;

// One bundled file per language. V1 has English only; a second language is one new file and one list entry.
const LANGUAGES: Record<string, Texts> = { en: en as Texts };
let active = 'en';

export function setLanguage(code: string): void {
  if (LANGUAGES[code]) active = code;
}

export function hasKey(key: string): boolean {
  return key in LANGUAGES.en;
}

/** t('ui.home.title'), with {name} placeholders. Missing key: English, then the key itself (a test catches it). */
export function t(key: string, values?: Record<string, string | number>): string {
  const text = LANGUAGES[active]?.[key] ?? LANGUAGES.en[key] ?? key;
  if (!values) return text;
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in values ? String(values[name]) : m));
}

/** Text compared without case or accents, for search (Technical Analysis 12). */
export function normalizeForSearch(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Count-aware text: t.one / t.other keys, e.g. tn('ui.home.count', 3). The rule is the active language's plural rule. */
export function tn(key: string, count: number, values?: Record<string, string | number>): string {
  let form = count === 1 ? 'one' : 'other';
  try {
    form = new Intl.PluralRules(active).select(count);
  } catch {
    // keep the simple rule
  }
  const k = hasKey(`${key}.${form}`) ? `${key}.${form}` : `${key}.other`;
  return t(k, { count, ...values });
}
