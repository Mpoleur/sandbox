import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSymbol } from '../core/catalog';
import { buildHome } from '../core/homeModel';
import { t } from '../core/i18n';
import { useData } from '../data/AppData';
import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { CardTile, cardCaption } from '../ui/CardTile';
import { HomeSections, categoryName } from '../ui/HomeSections';
import { colors, spacing, type } from '../ui/theme';

/** Reorder (Functional Analysis 8): the Home sections with up and down buttons; a card moves inside its own list. */
export default function Reorder() {
  const { cards, categories } = useData();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<CardRecord[]>([]);
  const [cats, setCats] = useState<CategoryRecord[]>([]);
  const reload = useCallback(async () => {
    setList(await cards.list());
    setCats(await categories.list());
  }, [cards, categories]);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const model = useMemo(
    () => buildHome(list, cats, '', { card: cardCaption, symbol: (id) => (getSymbol(id) ? t(`symbol.${id}.name`) : ''), category: categoryName }),
    [list, cats],
  );
  const groupOf = (c: CardRecord): CardRecord[] => (c.favourite ? model.favourites : (model.sections.find((s) => s.category.id === c.categoryId)?.cards ?? []));
  const move = async (c: CardRecord, dir: 'up' | 'down') => {
    await cards.move(c.id, dir);
    await reload();
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xl + insets.bottom }}>
      <Text style={styles.hint}>{t('ui.reorder.hint')}</Text>
      <HomeSections
        model={model}
        renderTile={(c) => {
          const g = groupOf(c);
          const i = g.findIndex((x) => x.id === c.id);
          return (
            <CardTile
              card={c}
              onPress={() => undefined}
              onLongPress={() => undefined}
              reorder={{ canUp: i > 0, canDown: i < g.length - 1, onUp: () => void move(c, 'up'), onDown: () => void move(c, 'down') }}
            />
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hint: { ...type.body, color: colors.onSurfaceMuted, padding: spacing.lg },
});
