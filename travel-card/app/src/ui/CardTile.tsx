import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getSymbol } from '../core/catalog';
import { t } from '../core/i18n';
import type { CardRecord } from '../data/cardsRepo';
import { thumbUri } from '../platform/photoStore';
import { CardView } from './CardView';
import { ArrowIcon, StarIcon } from './Icons';
import { colors, radius, spacing, type } from './theme';

export const TILE_WIDTH = 158;

/** The caption of a card: its label, else its symbol's name, else "Photo". */
export function cardCaption(card: CardRecord): string {
  if (card.label) return card.label;
  if (card.item && getSymbol(card.item.symbolId)) return t(`symbol.${card.item.symbolId}.name`);
  return t('ui.card.untitledPhoto');
}

/** The home tile (App Style Sheet 5): the card as in display mode at about 84 dp, a small photo, and the caption. */
export function CardTile({
  card, onPress, onLongPress, reorder,
}: {
  card: CardRecord;
  onPress: () => void;
  onLongPress: () => void;
  /** Reorder screen: up and down buttons (48 dp) under the tile. */
  reorder?: { canUp: boolean; canDown: boolean; onUp: () => void; onDown: () => void };
}) {
  const caption = cardCaption(card);
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={caption}
      accessibilityHint={t('ui.card.menu.title')}
    >
      <View style={styles.thumbArea}>
        {card.thumbFile ? <Image source={{ uri: thumbUri(card.thumbFile) }} style={styles.photo} resizeMode="cover" /> : null}
        {card.item ? (
          <CardView item={card.item} size={84} />
        ) : card.thumbFile ? (
          <Image source={{ uri: thumbUri(card.thumbFile) }} style={styles.photoOnly} resizeMode="contain" />
        ) : null}
      </View>
      {card.favourite ? <View style={styles.star}><StarIcon size={28} /></View> : null}
      <Text style={styles.label} numberOfLines={2}>{caption}</Text>
      {reorder ? (
        <View style={styles.reorder}>
          <Pressable onPress={reorder.onUp} disabled={!reorder.canUp} accessibilityRole="button" accessibilityLabel={`${t('ui.reorder.up')}: ${caption}`} style={[styles.arrow, !reorder.canUp && styles.arrowOff]}>
            <ArrowIcon />
          </Pressable>
          <Pressable onPress={reorder.onDown} disabled={!reorder.canDown} accessibilityRole="button" accessibilityLabel={`${t('ui.reorder.down')}: ${caption}`} style={[styles.arrow, !reorder.canDown && styles.arrowOff]}>
            <ArrowIcon down />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingBottom: spacing.sm,
    margin: spacing.xs,
  },
  pressed: { backgroundColor: colors.primaryContainer },
  thumbArea: { height: 104, alignItems: 'center', justifyContent: 'center' },
  photo: { position: 'absolute', left: spacing.sm, top: spacing.sm, width: 44, height: 34, borderRadius: radius.small, backgroundColor: colors.surfaceVariant },
  photoOnly: { width: 120, height: 90, borderRadius: radius.small, backgroundColor: colors.surfaceVariant },
  star: { position: 'absolute', right: spacing.sm, top: spacing.sm },
  reorder: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primaryContainer },
  arrowOff: { opacity: 0.35 },
  label: { ...type.label, color: colors.onSurface, paddingHorizontal: spacing.md, minHeight: 40 },
});
