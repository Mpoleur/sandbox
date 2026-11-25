import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { normalizeForSearch } from './i18n';

export interface HomeSection {
  category: CategoryRecord;
  cards: CardRecord[];
}

export interface HomeModel {
  favourites: CardRecord[];
  sections: HomeSection[];
}

export interface Names {
  card: (c: CardRecord) => string;
  symbol: (symbolId: string) => string;
  category: (c: CategoryRecord) => string;
}

/**
 * What Home shows (Functional Analysis v0.6 5.4 and 6): a Favourites section on top, then the other cards grouped by
 * category. A favourite appears only in Favourites. A category with no non-favourite card is not shown. A hidden default
 * category that still holds cards is shown. The search covers card labels, symbol names and category names.
 */
export function buildHome(cards: CardRecord[], categories: CategoryRecord[], query: string, names: Names): HomeModel {
  const q = normalizeForSearch(query.trim());
  const byId = new Map(categories.map((c) => [c.id, c]));
  const matches = (c: CardRecord): boolean => {
    if (!q) return true;
    const cat = byId.get(c.categoryId);
    const hay = [c.label, c.item ? names.symbol(c.item.symbolId) : '', cat ? names.category(cat) : '']
      .map(normalizeForSearch)
      .join(' ');
    return hay.includes(q);
  };
  const shown = cards.filter(matches);
  const favourites = shown.filter((c) => c.favourite).sort((a, b) => (a.favouriteOrder ?? 0) - (b.favouriteOrder ?? 0));
  const sections: HomeSection[] = [];
  for (const category of [...categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const inCat = shown.filter((c) => !c.favourite && c.categoryId === category.id).sort((a, b) => a.sortOrder - b.sortOrder);
    if (inCat.length) sections.push({ category, cards: inCat });
  }
  return { favourites, sections };
}

/** Categories offered in the card editor: the shown ones, plus the card's own category even if hidden. */
export function editorCategories(categories: CategoryRecord[], currentId: string | null): CategoryRecord[] {
  return categories.filter((c) => !c.hidden || c.id === currentId).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The short safety reminder appears when a card with the Allergy badge, or in Health & emergency, is saved. */
export function needsSafetyReminder(badges: string[], categoryId: string): boolean {
  return badges.includes('MOD-03') || categoryId === 'health-emergency';
}
