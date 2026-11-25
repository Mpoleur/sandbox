import type { CardItemData } from '../core/compose';

/** The three example cards (Functional Analysis 5.9). The key lets "Restore example cards" know which one is missing. */
export interface ExampleCard {
  key: 'peanut' | 'toilet' | 'dog';
  labelKey: string;
  categoryId: string;
  favourite: boolean;
  item: CardItemData;
}

export const EXAMPLES: ExampleCard[] = [
  { key: 'peanut', labelKey: 'example.peanut.label', categoryId: 'diet-allergies', favourite: true, item: { symbolId: 'DIE-01', badges: ['MOD-01', 'MOD-03'] } },
  { key: 'toilet', labelKey: 'example.toilet.label', categoryId: 'places-directions', favourite: false, item: { symbolId: 'BAS-01', badges: ['MOD-04'] } },
  { key: 'dog', labelKey: 'example.dog.label', categoryId: 'pets', favourite: false, item: { symbolId: 'PET-03', badges: [] } },
];
