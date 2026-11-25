import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tn, t } from '../core/i18n';
import type { HomeModel } from '../core/homeModel';
import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { colors, spacing, type } from './theme';

export function categoryName(c: CategoryRecord): string {
  return c.kind === 'custom' ? (c.name ?? '') : t(`category.${c.id}`);
}

function Header({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerCount}>{tn('ui.home.count', count)}</Text>
    </View>
  );
}

/** Favourites on top (one horizontal row), then the other cards grouped by category (App Style Sheet 5). */
export function HomeSections({ model, renderTile }: { model: HomeModel; renderTile: (c: CardRecord) => React.ReactNode }) {
  return (
    <View>
      {model.favourites.length ? (
        <View>
          <Header title={t('ui.home.favourites')} count={model.favourites.length} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favRow}>
            {model.favourites.map((c) => (
              <View key={c.id}>{renderTile(c)}</View>
            ))}
          </ScrollView>
        </View>
      ) : null}
      {model.sections.map((s) => (
        <View key={s.category.id}>
          <Header title={categoryName(s.category)} count={s.cards.length} />
          <View style={styles.grid}>
            {s.cards.map((c) => (
              <View key={c.id}>{renderTile(c)}</View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  headerTitle: { ...type.titleMedium, color: colors.onSurface },
  headerCount: { ...type.caption, color: colors.onSurfaceMuted },
  favRow: { paddingHorizontal: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm },
});
