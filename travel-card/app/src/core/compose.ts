import { MAX_BADGES, NO_ID, canUseNo, getSymbol } from './catalog';

/** 2x3 affine matrix [a, b, c, d, e, f] in symbol units (the symbol canvas is 64 x 64). */
export type Matrix = [number, number, number, number, number, number];

export const CANVAS = 64;
/** Symbol under "No": scale 0.6 about the centre = translate(12.8 12.8) scale(0.6) (Artwork Guideline 6). */
export const NO_SCALE = 0.6;
export const NO_SYMBOL_MATRIX: Matrix = [NO_SCALE, 0, 0, NO_SCALE, (CANVAS * (1 - NO_SCALE)) / 2, (CANVAS * (1 - NO_SCALE)) / 2];
export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
/** Badges are drawn at 40 % in a corner slot: A bottom right, B top right (Artwork Guideline 6). */
export const BADGE_SCALE = 0.4;
export const SLOT_MATRIX = {
  A: [BADGE_SCALE, 0, 0, BADGE_SCALE, 38.4, 38.4] as Matrix,
  B: [BADGE_SCALE, 0, 0, BADGE_SCALE, 38.4, 0] as Matrix,
};

export interface CardItemData {
  symbolId: string;
  /** Up to MAX_BADGES modifier IDs in the order chosen. MOD-01 (No) counts but takes no slot. */
  badges: string[];
}

export interface PlacedBadge {
  id: string;
  slot: 'A' | 'B';
  /** The number shown on the editor chip: 1 for slot A, 2 for slot B. */
  number: 1 | 2;
  matrix: Matrix;
}

export interface ItemLayout {
  symbolId: string;
  symbolMatrix: Matrix;
  noSign: boolean;
  badges: PlacedBadge[];
}

export type BadgeProblem = 'too-many' | 'duplicate' | 'not-a-modifier' | 'main-is-modifier' | 'unknown-symbol' | 'no-on-crossed';

/** Rules of Functional Analysis v0.6 5.2 and 5.5. An empty list means the combination is valid. */
export function checkItem(item: CardItemData): BadgeProblem[] {
  const problems: BadgeProblem[] = [];
  const main = getSymbol(item.symbolId);
  if (!main) problems.push('unknown-symbol');
  else if (main.isModifier) problems.push('main-is-modifier');
  if (item.badges.length > MAX_BADGES) problems.push('too-many');
  if (new Set(item.badges).size !== item.badges.length) problems.push('duplicate');
  for (const b of item.badges) {
    const info = getSymbol(b);
    if (!info || !info.isModifier) problems.push('not-a-modifier');
  }
  if (item.badges.includes(NO_ID) && main && !main.isModifier && !canUseNo(item.symbolId)) problems.push('no-on-crossed');
  return problems;
}

/** Where everything goes. "No" takes no slot; the other badges take slot A, then slot B, in the order chosen. */
export function layoutItem(item: CardItemData): ItemLayout {
  const noSign = item.badges.includes(NO_ID) && canUseNo(item.symbolId);
  const ordinary = item.badges.filter((b) => b !== NO_ID).slice(0, MAX_BADGES);
  const badges: PlacedBadge[] = ordinary.map((id, i) => ({
    id,
    slot: i === 0 ? 'A' : 'B',
    number: (i === 0 ? 1 : 2) as 1 | 2,
    matrix: i === 0 ? SLOT_MATRIX.A : SLOT_MATRIX.B,
  }));
  return { symbolId: item.symbolId, symbolMatrix: noSign ? NO_SYMBOL_MATRIX : IDENTITY, noSign, badges };
}

/** Chip number for a modifier in the editor: undefined for "No" and for modifiers not chosen. */
export function chipNumber(badges: string[], id: string): 1 | 2 | undefined {
  if (id === NO_ID) return undefined;
  const i = badges.filter((b) => b !== NO_ID).indexOf(id);
  return i === 0 ? 1 : i === 1 ? 2 : undefined;
}
