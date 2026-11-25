import { MAX_BADGES, NO_ID, canUseNo, getSymbol } from './catalog';

/** What a modifier chip in the editor looks like (App Style Sheet 5, Modifier chip). */
export type ChipState = 'selected' | 'available' | 'blocked' | 'no-unavailable';

/**
 * - selected: chosen (tap removes it)
 * - blocked: two are already chosen, so it cannot be added
 * - no-unavailable: "No" on a symbol that already carries its own sign (Functional Analysis 5.5): not offered
 */
export function chipState(badges: string[], badgeId: string, mainSymbolId: string | null): ChipState {
  if (badges.includes(badgeId)) return 'selected';
  if (badgeId === NO_ID && mainSymbolId && !canUseNo(mainSymbolId)) return 'no-unavailable';
  if (badges.length >= MAX_BADGES) return 'blocked';
  return 'available';
}

/** Tap on a chip: removes it if chosen, adds it if allowed, otherwise changes nothing. */
export function toggleBadge(badges: string[], badgeId: string, mainSymbolId: string | null): string[] {
  const state = chipState(badges, badgeId, mainSymbolId);
  if (state === 'selected') return badges.filter((b) => b !== badgeId);
  if (state === 'available') return [...badges, badgeId];
  return badges;
}

/**
 * Choosing another main symbol keeps the badges, except that "No" is removed when the new symbol is already crossed out.
 * `noRemoved` tells the editor to show its one-line note.
 */
export function chooseMainSymbol(badges: string[], newSymbolId: string): { badges: string[]; noRemoved: boolean } {
  if (badges.includes(NO_ID) && !canUseNo(newSymbolId)) return { badges: badges.filter((b) => b !== NO_ID), noRemoved: true };
  return { badges, noRemoved: false };
}

/** A new card is filed under the library group of its symbol (a modifier group is never a card category). */
export function defaultCategoryFor(symbolId: string | null, fallback: string): string {
  const s = symbolId ? getSymbol(symbolId) : undefined;
  return s && !s.isModifier ? s.category : fallback;
}
