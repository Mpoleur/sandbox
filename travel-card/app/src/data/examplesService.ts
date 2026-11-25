import { t } from '../core/i18n';
import type { CardsRepo } from './cardsRepo';
import { EXAMPLES } from './examples';

/**
 * "Restore example cards" (Functional Analysis 5.9): adds back only the examples that are missing. An edited example is
 * never duplicated, and nothing comes back by itself. Returns how many were added.
 */
export async function restoreExamples(cards: CardsRepo): Promise<number> {
  let added = 0;
  for (const ex of EXAMPLES) {
    if (await cards.hasExample(ex.key)) continue;
    await cards.create(
      { label: t(ex.labelKey), showLabel: false, categoryId: ex.categoryId, favourite: ex.favourite, photoFile: null, thumbFile: null, item: ex.item },
      { exampleKey: ex.key },
    );
    added++;
  }
  return added;
}
