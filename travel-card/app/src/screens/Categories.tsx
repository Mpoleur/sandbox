import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { tn, t } from '../core/i18n';
import { useData } from '../data/AppData';
import type { CategoryRecord } from '../data/categoriesRepo';
import { FilledButton, TonalButton } from '../ui/Buttons';
import { categoryName } from '../ui/HomeSections';
import { PromptDialog } from '../ui/PromptDialog';
import { colors, spacing, type } from '../ui/theme';

/**
 * Categories (Functional Analysis v0.6 5.4): default categories have a show/hide switch; custom ones can be created,
 * renamed and deleted, only when empty.
 */
export default function Categories() {
  const { categories } = useData();
  const [list, setList] = useState<CategoryRecord[]>([]);
  const [prompt, setPrompt] = useState<{ kind: 'new' } | { kind: 'rename'; cat: CategoryRecord } | null>(null);

  const reload = useCallback(async () => setList(await categories.list()), [categories]);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const remove = async (c: CategoryRecord) => {
    const r = await categories.delete(c.id);
    if (!r.ok && r.reason === 'not-empty') Alert.alert(tn('ui.categories.notEmpty', r.cardCount ?? 0));
    await reload();
  };
  const confirmRemove = (c: CategoryRecord) =>
    Alert.alert(t('ui.categories.deleteConfirm'), categoryName(c), [
      { text: t('ui.common.cancel'), style: 'cancel' },
      { text: t('ui.categories.delete'), style: 'destructive', onPress: () => void remove(c) },
    ]);

  const defaults = list.filter((c) => c.kind === 'default');
  const custom = list.filter((c) => c.kind === 'custom');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.section}>{t('ui.categories.defaults')}</Text>
      <Text style={styles.hint}>{t('ui.categories.hiddenHint')}</Text>
      {defaults.map((c) => (
        <View key={c.id} style={styles.row}>
          <Text style={styles.rowText}>{categoryName(c)}</Text>
          <Switch
            value={!c.hidden}
            onValueChange={(show) => void categories.setHidden(c.id, !show).then(reload)}
            trackColor={{ true: colors.primary, false: colors.outline }}
            accessibilityLabel={t('ui.categories.show', { name: categoryName(c) })}
          />
        </View>
      ))}
      <Text style={styles.section}>{t('ui.categories.custom')}</Text>
      {custom.length === 0 ? <Text style={styles.hint}>{t('ui.categories.none')}</Text> : null}
      {custom.map((c) => (
        <View key={c.id} style={styles.customRow}>
          <Text style={styles.rowText}>{categoryName(c)}</Text>
          <TonalButton label={t('ui.categories.rename')} onPress={() => setPrompt({ kind: 'rename', cat: c })} />
          <TonalButton label={t('ui.categories.delete')} onPress={() => confirmRemove(c)} />
        </View>
      ))}
      <FilledButton main label={t('ui.categories.new')} onPress={() => setPrompt({ kind: 'new' })} style={styles.newButton} />
      <PromptDialog
        visible={!!prompt}
        title={prompt?.kind === 'rename' ? t('ui.categories.rename') : t('ui.categories.new')}
        initial={prompt?.kind === 'rename' ? (prompt.cat.name ?? '') : ''}
        onCancel={() => setPrompt(null)}
        onSubmit={async (text) => {
          const p = prompt;
          setPrompt(null);
          if (p?.kind === 'new') await categories.create(text);
          else if (p?.kind === 'rename') await categories.rename(p.cat.id, text);
          await reload();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  section: { ...type.titleMedium, color: colors.onSurface, marginTop: spacing.lg },
  hint: { ...type.caption, color: colors.onSurfaceMuted },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  customRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  rowText: { ...type.body, color: colors.onSurface, flex: 1 },
  newButton: { marginTop: spacing.lg },
});
