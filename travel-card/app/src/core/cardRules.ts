import { checkItem, type BadgeProblem, type CardItemData } from './compose';

/** What the editor hands to the card service. */
export interface CardInput {
  label: string;
  showLabel: boolean;
  categoryId: string;
  favourite: boolean;
  photoFile: string | null;
  thumbFile: string | null;
  /** V1: at most one item (MAX_ITEMS). A photo-only card has none. */
  item: CardItemData | null;
}

export type CardProblem = 'empty' | 'photo-incomplete' | BadgeProblem;

/** A card needs a symbol, a photo, or both (Functional Analysis 5.5); the symbol must obey the badge rules. */
export function validateCard(input: CardInput): CardProblem[] {
  const problems: CardProblem[] = [];
  if (!input.item && !input.photoFile) problems.push('empty');
  if ((input.photoFile && !input.thumbFile) || (!input.photoFile && input.thumbFile)) problems.push('photo-incomplete');
  if (input.item) problems.push(...checkItem(input.item));
  return problems;
}
