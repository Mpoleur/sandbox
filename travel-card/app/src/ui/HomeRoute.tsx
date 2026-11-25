import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { categoryColor } from '../core/categoryColors';
import type { HomeModel } from '../core/homeModel';
import { tn, t } from '../core/i18n';
import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { categoryName } from './HomeSections';
import { StarIcon } from './Icons';
import { colors, spacing } from './theme';

export const ROUTE_COLOR = '#78909C';
/** Space at the end of the list so the New card button never covers the last ticket (Home design D4). */
export const END_SPACER = 88;

function Stop({ title, count, ring, star }: { title: string; count: number; ring?: string; star?: boolean }) {
  return (
    <View style={styles.stop} accessibilityRole="header">
      {star ? (
        <View style={styles.starStop}>
          <StarIcon size={20} />
        </View>
      ) : (
        <View style={[styles.ring, { borderColor: ring }]} />
      )}
      <Text style={styles.stopTitle}>{title}</Text>
      <Text style={styles.stopCount}>{tn('ui.home.count', count)}</Text>
    </View>
  );
}

/** The dashed route line (2 dp, #78909C) beside a group of tickets. Drawn as a vector so the dashes are exact. */
function Rail({ children }: { children: React.ReactNode }) {
  const [h, setH] = useState(0);
  return (
    <View style={styles.rail} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      {h > 0 ? (
        <Svg width={2} height={h} style={styles.line} pointerEvents="none">
          <Line x1={1} y1={0} x2={1} y2={h} stroke={ROUTE_COLOR} strokeWidth={2} strokeDasharray="5 4" />
        </Svg>
      ) : null}
      <View style={styles.tickets}>{children}</View>
    </View>
  );
}

/**
 * Favourites first (a blue star as its stop), then one stop per category, each with its tickets along the dashed route
 * (Home design D4). The category colour appears only on the ring of its stop and on the ticket borders.
 */
export function HomeRoute({
  model, categories, renderTicket,
}: {
  model: HomeModel;
  categories: CategoryRecord[];
  renderTicket: (card: CardRecord, category: CategoryRecord | undefined) => React.ReactNode;
}) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return (
    <View>
      {model.favourites.length ? (
        <View>
          <Stop title={t('ui.home.favourites')} count={model.favourites.length} star />
          <Rail>
            {model.favourites.map((c) => (
              <View key={c.id}>{renderTicket(c, byId.get(c.categoryId))}</View>
            ))}
          </Rail>
        </View>
      ) : null}
      {model.sections.map((s) => (
        <View key={s.category.id}>
          <Stop title={categoryName(s.category)} count={s.cards.length} ring={categoryColor(s.category.id, s.category.kind)} />
          <Rail>
            {s.cards.map((c) => (
              <View key={c.id}>{renderTicket(c, s.category)}</View>
            ))}
          </Rail>
        </View>
      ))}
      <View style={{ height: END_SPACER }} />
    </View>
  );
}

const styles = StyleSheet.create({
  stop: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: spacing.lg, marginTop: 4 },
  ring: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, backgroundColor: colors.surface },
  starStop: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginLeft: -2, marginRight: 2 },
  stopTitle: { flex: 1, fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.onSurface },
  stopCount: { fontSize: 12, lineHeight: 16, color: colors.onSurfaceMuted },
  rail: { marginLeft: 23, paddingLeft: 17, paddingRight: 16, paddingTop: 2, paddingBottom: 6 },
  line: { position: 'absolute', left: 0, top: 0 },
  tickets: { gap: 10 },
});
