import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../App';
import { buildHome } from '../core/homeModel';
import { t } from '../core/i18n';
import { getSymbol } from '../core/catalog';
import { useData } from '../data/AppData';
import type { CardRecord } from '../data/cardsRepo';
import type { CategoryRecord } from '../data/categoriesRepo';
import { copyPhotoFiles, deletePhotoFiles } from '../platform/photoStore';
import { FilledButton } from '../ui/Buttons';
import { cardCaption } from '../ui/CardTile';
import { categoryName } from '../ui/HomeSections';
import { HomeRoute } from '../ui/HomeRoute';
import { StampLayer } from '../ui/StampLayer';
import { HOME_GROUND, Ticket } from '../ui/Ticket';
import { MoreIcon, PlusIcon, SearchIcon } from '../ui/Icons';
import { Sheet } from '../ui/Sheet';
import { colors, MIN_TARGET, radius, spacing, type } from '../ui/theme';

/**
 * Home (Functional Analysis v0.6 6): search, Favourites on top, then cards grouped by category, a New card button,
 * and a three-dot menu with Reorder and Settings. Tap a card to show it; press and hold for its menu.
 */
export default function Home({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { cards, categories, settings } = useData();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<CardRecord[] | null>(null);
  const [cats, setCats] = useState<CategoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [menuFor, setMenuFor] = useState<CardRecord | null>(null);
  const [mainMenu, setMainMenu] = useState(false);
  const [reminder, setReminder] = useState(false);

  const reload = useCallback(async () => {
    setList(await cards.list());
    setCats(await categories.list());
  }, [cards, categories]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // The safety notice is shown once, at first launch, before the app is used (Functional Analysis 5.8).
  useEffect(() => {
    void settings.get('safetyNoticeSeen').then((v) => {
      if (v !== '1') navigation.navigate('Safety', { firstRun: true });
    });
  }, [settings, navigation]);

  useEffect(() => {
    if (route.params?.reminder) {
      setReminder(true);
      navigation.setParams({ reminder: undefined });
    }
  }, [route.params?.reminder, navigation]);

  const model = useMemo(
    () => buildHome(list ?? [], cats, query, {
      card: cardCaption,
      symbol: (id) => (getSymbol(id) ? t(`symbol.${id}.name`) : ''),
      category: categoryName,
    }),
    [list, cats, query],
  );

  const confirmDelete = (c: CardRecord) =>
    Alert.alert(t('ui.card.delete.title'), t('ui.card.delete.body'), [
      { text: t('ui.common.cancel'), style: 'cancel' },
      {
        text: t('ui.common.delete'),
        style: 'destructive',
        onPress: async () => {
          const freed = await cards.delete(c.id);
          deletePhotoFiles(freed.photoFile, freed.thumbFile);
          await reload();
        },
      },
    ]);

  const duplicate = async (c: CardRecord) => {
    try {
      await cards.duplicate(c.id, { labelFor: (l) => t('ui.card.copySuffix', { label: l }), copyPhoto: copyPhotoFiles });
      await reload();
    } catch {
      Alert.alert(t('ui.editor.saveFailed'));
    }
  };

  const empty = list !== null && list.length === 0;
  const noMatch = list !== null && list.length > 0 && model.favourites.length === 0 && model.sections.length === 0;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <StampLayer />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }} keyboardShouldPersistTaps="handled" stickyHeaderIndices={[]}>
        <View style={[styles.top, { paddingTop: insets.top }]}>
          <View style={styles.titleRow}>
            <Image source={require('../../assets/icon/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
            <Text style={styles.title} accessibilityRole="header">{t('ui.home.title')}</Text>
            <Pressable onPress={() => setMainMenu(true)} accessibilityRole="button" accessibilityLabel={t('ui.home.menu')} style={styles.menuButton}>
              <MoreIcon color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.search}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t('ui.home.search')}
              placeholderTextColor={colors.onSurfaceMuted}
              accessibilityLabel={t('ui.home.search')}
              returnKeyType="search"
            />
          </View>
        </View>
        {reminder ? (
          <View style={styles.reminder}>
            <Text style={styles.reminderText}>{t('ui.reminder.text')}</Text>
            <Pressable onPress={() => setReminder(false)} accessibilityRole="button" style={styles.reminderButton}>
              <Text style={styles.reminderDismiss}>{t('ui.reminder.dismiss')}</Text>
            </Pressable>
          </View>
        ) : null}
        {empty ? <Text style={styles.empty}>{t('ui.home.empty')}</Text> : null}
        {noMatch ? <Text style={styles.empty}>{t('ui.home.noMatch')}</Text> : null}
        <HomeRoute
          model={model}
          categories={cats}
          renderTicket={(c, cat) => (
            <Ticket card={c} category={cat} onPress={() => navigation.navigate('DisplayCard', { cardId: c.id })} onLongPress={() => setMenuFor(c)} />
          )}
        />
      </ScrollView>
      <View style={[styles.fab, { bottom: spacing.lg + insets.bottom }]}>
        <FilledButton main label={t('ui.home.newCard')} onPress={() => navigation.navigate('CardEditor', {})} style={styles.fabButton} />
        <View pointerEvents="none" style={styles.fabIcon}>
          <PlusIcon />
        </View>
      </View>
      <Sheet
        visible={!!menuFor}
        title={menuFor ? cardCaption(menuFor) : undefined}
        onClose={() => setMenuFor(null)}
        options={
          menuFor
            ? [
                { label: t('ui.common.edit'), onPress: () => navigation.navigate('CardEditor', { cardId: menuFor.id }) },
                {
                  label: menuFor.favourite ? t('ui.card.favourite.remove') : t('ui.card.favourite.add'),
                  onPress: () => void cards.setFavourite(menuFor.id, !menuFor.favourite).then(reload),
                },
                { label: t('ui.common.duplicate'), onPress: () => void duplicate(menuFor) },
                { label: t('ui.common.delete'), onPress: () => confirmDelete(menuFor), destructive: true },
              ]
            : []
        }
      />
      <Sheet
        visible={mainMenu}
        onClose={() => setMainMenu(false)}
        options={[
          { label: t('ui.home.menu.reorder'), onPress: () => navigation.navigate('Reorder') },
          { label: t('ui.home.menu.settings'), onPress: () => navigation.navigate('Settings') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: HOME_GROUND },
  top: { backgroundColor: '#0B3D7A', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingLeft: spacing.lg, paddingRight: 4 },
  logo: { width: 44, height: 44, borderRadius: 11 },
  title: { ...type.titleLarge, color: '#FFFFFF', flex: 1 },
  menuButton: { width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: 26,
    backgroundColor: colors.surface,
  },
  searchInput: { ...type.body, flex: 1, color: colors.onSurface, minHeight: 48 },
  reminder: { marginHorizontal: spacing.lg, marginTop: 10, padding: spacing.md, borderRadius: radius.cell, backgroundColor: colors.warningContainer, borderLeftWidth: 6, borderLeftColor: colors.warning },
  reminderText: { ...type.label, fontWeight: '400', color: colors.onWarningContainer },
  reminderButton: { minHeight: MIN_TARGET, justifyContent: 'center', alignSelf: 'flex-end' },
  reminderDismiss: { ...type.label, color: colors.primary },
  empty: { ...type.body, color: colors.onSurfaceMuted, padding: spacing.lg },
  fab: { position: 'absolute', right: spacing.lg },
  fabButton: { paddingLeft: 52, borderRadius: radius.tile, elevation: 3 },
  fabIcon: { position: 'absolute', left: 16, top: 16 },
});
