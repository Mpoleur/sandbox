import data from '../catalog/symbols.json';

export type ReviewState = 'ok' | 'needs-check';

export interface SymbolInfo {
  id: string;
  category: string;
  isModifier: boolean;
  priority: 'P1' | 'P2';
  review: ReviewState;
  alreadyCrossed: boolean;
}

/** The "No / not allowed" modifier: drawn over the symbol, takes no badge slot, counts toward MAX_BADGES. */
export const NO_ID = 'MOD-01';
export const MAX_BADGES = 2;
/** A card is a list of items; V1 allows exactly one (Functional Analysis 5.5). */
export const MAX_ITEMS = 1;
export const MODIFIERS_GROUP = 'modifiers';

/** The 14 library groups in display order (Modifiers last). */
export const GROUP_KEYS: readonly string[] = data.categories;
/** The 13 groups a card can be filed under (Modifiers is a library group only). */
export const CARD_CATEGORY_KEYS: readonly string[] = GROUP_KEYS.filter((k) => k !== MODIFIERS_GROUP);

export const ALL_SYMBOLS: readonly SymbolInfo[] = data.symbols as SymbolInfo[];

const BY_ID = new Map<string, SymbolInfo>(ALL_SYMBOLS.map((s) => [s.id, s]));

export function getSymbol(id: string): SymbolInfo | undefined {
  return BY_ID.get(id);
}

/** Symbols the app offers. The public build hides the symbols that still need a cultural check. */
export function visibleSymbols(showUnreviewed: boolean): SymbolInfo[] {
  return ALL_SYMBOLS.filter((s) => showUnreviewed || s.review === 'ok');
}

/** Symbols that can be chosen as a card's main symbol: never a modifier. */
export function mainSymbols(showUnreviewed: boolean): SymbolInfo[] {
  return visibleSymbols(showUnreviewed).filter((s) => !s.isModifier);
}

/** Symbols that can be chosen as a badge: the modifiers only. */
export function badgeSymbols(showUnreviewed: boolean): SymbolInfo[] {
  return visibleSymbols(showUnreviewed).filter((s) => s.isModifier);
}

export function symbolsInGroup(group: string, showUnreviewed: boolean): SymbolInfo[] {
  return visibleSymbols(showUnreviewed).filter((s) => s.category === group);
}

/** True unless the symbol is already drawn crossed out (then "No" would double the sign). */
export function canUseNo(symbolId: string): boolean {
  const s = BY_ID.get(symbolId);
  return !!s && !s.isModifier && !s.alreadyCrossed;
}
