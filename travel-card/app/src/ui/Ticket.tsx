import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { categoryColor } from '../core/categoryColors';
import { t } from '../core/i18n';
import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { thumbUri } from '../platform/photoStore';
import { CardView } from './CardView';
import { StarIcon } from './Icons';
import { cardCaption } from './CardTile';
import { colors, radius } from './theme';

export const HOME_GROUND = '#F3F6FB';
export const TICKET_HEIGHT = 84;

/**
 * A card as a boarding-pass ticket (Home design D4): 84 dp high, 3 dp border in the category colour, no fill, an 80 dp
 * stub with the card and a dashed perforation, two notches, the label and a small source line. A favourite has a star.
 */
export function Ticket({
  card, category, onPress, onLongPress,
}: {
  card: CardRecord;
  category: CategoryRecord | undefined;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const color = category ? categoryColor(category.id, category.kind) : categoryColor('', 'custom');
  const caption = cardCaption(card);
  const source = card.thumbFile ? (card.item ? t('ui.ticket.withPhoto') : t('ui.ticket.photoCard')) : t('ui.ticket.symbolCard');
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={caption}
      accessibilityHint={t('ui.card.menu.title')}
      style={({ pressed }) => [styles.ticket, { borderColor: color }, pressed && styles.pressed]}
    >
      <View style={styles.stub}>
        <Svg width={2} height={TICKET_HEIGHT - 6} style={styles.perforation} pointerEvents="none">
          <Line x1={1} y1={0} x2={1} y2={TICKET_HEIGHT - 6} stroke={color} strokeWidth={2} strokeDasharray="5 4" />
        </Svg>
        {card.item ? (
          <CardView item={card.item} size={56} />
        ) : card.thumbFile ? (
          <Image source={{ uri: thumbUri(card.thumbFile) }} style={styles.photoOnly} resizeMode="contain" />
        ) : null}
        {card.item && card.thumbFile ? <Image source={{ uri: thumbUri(card.thumbFile) }} style={styles.photo} resizeMode="cover" /> : null}
        <View style={[styles.notch, styles.notchTop, { borderColor: color }]} />
        <View style={[styles.notch, styles.notchBottom, { borderColor: color }]} />
      </View>
      <View style={styles.label}>
        <Text style={styles.title} numberOfLines={2}>{caption}</Text>
        <Text style={styles.source}>{source}</Text>
      </View>
      {card.favourite ? (
        <View style={styles.star}>
          <StarIcon size={22} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ticket: { height: TICKET_HEIGHT, flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 3 },
  pressed: { backgroundColor: colors.primaryContainer },
  stub: { width: 80, alignItems: 'center', justifyContent: 'center' },
  perforation: { position: 'absolute', right: 0, top: 0 },
  notch: { position: 'absolute', right: -9, width: 16, height: 16, borderRadius: 8, borderWidth: 3, backgroundColor: HOME_GROUND },
  notchTop: { top: -11 },
  notchBottom: { bottom: -11 },
  photo: { position: 'absolute', left: 4, bottom: 4, width: 34, height: 26, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#D9E2EA' },
  photoOnly: { width: 64, height: 52, borderRadius: radius.small },
  label: { flex: 1, paddingLeft: 12, paddingRight: 10, justifyContent: 'center' },
  title: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.onSurface },
  source: { fontSize: 12, lineHeight: 16, fontWeight: '400', color: colors.onSurfaceMuted },
  star: { position: 'absolute', right: 4, top: 4 },
});
