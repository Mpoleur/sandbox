import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { RootStackParamList } from '../App';
import { computeDisplayLayout } from '../core/displayLayout';
import { t } from '../core/i18n';
import type { CardRecord } from '../data/cardsRepo';
import { useData } from '../data/AppData';
import { BRIGHTNESS_SETTING } from './Settings';
import { photoUri } from '../platform/photoStore';
import { CardView } from '../ui/CardView';
import { colors, radius, type } from '../ui/theme';

const KEEP_AWAKE_TAG = 'display-card';

/**
 * Display mode (Technical Analysis 10): always white, no interface, the card as large as the window allows, the screen
 * stays on, the Android bars are hidden while it is open. A tap anywhere (or the Android back button) closes it.
 */
export default function DisplayCard({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'DisplayCard'>) {
  const { cards, settings } = useData();
  const { width, height } = useWindowDimensions();
  const [card, setCard] = useState<CardRecord | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void cards.get(route.params.cardId).then((c) => alive && setCard(c));
    return () => {
      alive = false;
    };
  }, [cards, route.params.cardId]);

  useEffect(() => {
    // The documentation lists an error if the screen closed meanwhile; it is harmless, so it is swallowed.
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    };
  }, []);

  // Brightness (Could have, on by default): this window only, no special permission. Handed back to the system on close.
  useEffect(() => {
    void settings.get(BRIGHTNESS_SETTING).then(async (v) => {
      if (v === '0') return;
      try {
        await Brightness.setBrightnessAsync(1);
      } catch {
        // If the system refuses, the card is still shown.
      }
    });
    // Handing control back is harmless when nothing was raised.
    return () => {
      void Brightness.restoreSystemBrightnessAsync().catch(() => undefined);
    };
  }, [settings]);

  const close = () => navigation.goBack();

  const hasSymbol = !!card?.item;
  const hasPhoto = !!card?.photoFile;
  const layout = card ? computeDisplayLayout({ width, height, hasSymbol, hasPhoto, showLabel: card.showLabel && card.label.length > 0 }) : null;

  return (
    <Pressable style={styles.screen} onPress={close} accessibilityRole="button" accessibilityLabel={t('ui.display.close')}>
      <StatusBar hidden />
      <NavigationBar hidden />
      {card === null ? <Text style={styles.missing}>{t('ui.display.notFound')}</Text> : null}
      {card && layout ? (
        <>
          {layout.card && card.item ? (
            <View style={{ position: 'absolute', left: layout.card.x, top: layout.card.y }}>
              <CardView item={card.item} size={layout.card.w} />
            </View>
          ) : null}
          {layout.label ? (
            <Text style={[styles.label, { position: 'absolute', left: layout.label.x, top: layout.label.y, width: layout.label.w, height: layout.label.h }]} numberOfLines={1}>
              {card.label}
            </Text>
          ) : null}
          {layout.photo && card.photoFile ? (
            <View
              style={[
                styles.photoBox,
                { left: layout.photo.x, top: layout.photo.y, width: layout.photo.w, height: layout.photo.h },
                layout.kind === 'both' ? styles.photoBoxBoth : null,
              ]}
            >
              <Image source={{ uri: photoUri(card.photoFile) }} style={StyleSheet.absoluteFill} resizeMode="contain" />
            </View>
          ) : null}
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.displayBackground },
  missing: { ...type.body, color: colors.onSurfaceMuted, textAlign: 'center', marginTop: 120 },
  label: { ...type.titleLarge, color: colors.onSurface, textAlign: 'center' },
  photoBox: { position: 'absolute', overflow: 'hidden' },
  photoBoxBoth: { backgroundColor: colors.surfaceVariant, borderRadius: radius.tile },
});
