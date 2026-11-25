import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GROUP_KEYS, MODIFIERS_GROUP, mainSymbols, symbolsInGroup, type SymbolInfo } from '../core/catalog';
import { normalizeForSearch, t } from '../core/i18n';
import { SymbolArt } from './SymbolArt';
import { colors, MIN_TARGET, radius, spacing, type } from './theme';

/**
 * The symbol picker, which is also the symbol library (Functional Analysis 5.10): groups as chips, search by symbol name,
 * a long press shows a symbol large with its name and meaning. Modifiers are never offered here (they are badges).
 */
export function SymbolPicker({
  selectedId,
  onSelect,
  showUnreviewed,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  showUnreviewed: boolean;
}) {
  const groups = useMemo(() => GROUP_KEYS.filter((g) => g !== MODIFIERS_GROUP && symbolsInGroup(g, showUnreviewed).length > 0), [showUnreviewed]);
  const [group, setGroup] = useState<string>(groups[0]);
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<SymbolInfo | null>(null);

  const q = normalizeForSearch(query.trim());
  const shown = useMemo(() => {
    if (!q) return symbolsInGroup(group, showUnreviewed);
    return mainSymbols(showUnreviewed).filter((s) => normalizeForSearch(t(`symbol.${s.id}.name`)).includes(q));
  }, [group, q, showUnreviewed]);

  return (
    <View>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder={t('ui.editor.search')}
        placeholderTextColor={colors.onSurfaceMuted}
        accessibilityLabel={t('ui.editor.search')}
        returnKeyType="search"
      />
      {q ? null : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {groups.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGroup(g)}
              style={[styles.chip, g === group && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: g === group }}
            >
              <Text style={[styles.chipText, g === group && styles.chipTextOn]}>{t(`category.${g}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {shown.length === 0 ? (
        <Text style={styles.empty}>{t('ui.editor.noResults')}</Text>
      ) : (
        <View style={styles.grid}>
          {shown.map((s) => {
            const on = s.id === selectedId;
            return (
              <Pressable
                key={s.id}
                onPress={() => onSelect(s.id)}
                onLongPress={() => setPreview(s)}
                style={[styles.cell, on && styles.cellOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t(`symbol.${s.id}.name`)}
              >
                <SymbolArt id={s.id} size={52} />
                <Text style={[styles.cellText, on && styles.cellTextOn]} numberOfLines={2}>{t(`symbol.${s.id}.name`)}</Text>
                {s.review === 'needs-check' ? <Text style={styles.needsCheck}>{t('ui.sheet.needsCheck')}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      )}
      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPreview(null)} accessibilityLabel={t('ui.common.close')}>
          {preview ? (
            <View style={styles.previewCard}>
              <SymbolArt id={preview.id} size={240} />
              <Text style={styles.previewName}>{t(`symbol.${preview.id}.name`)}</Text>
              <Text style={styles.previewMeaning}>{t(`symbol.${preview.id}.meaning`)}</Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    ...type.body,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.onSurface,
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.md },
  chip: { minHeight: 36, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderWidth: 2 },
  chipText: { ...type.label, color: colors.onSurface },
  chipTextOn: { color: colors.onPrimaryContainer },
  empty: { ...type.body, color: colors.onSurfaceMuted, padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingTop: spacing.sm },
  cell: {
    width: 80,
    minHeight: 92,
    borderRadius: radius.cell,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  cellOn: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderWidth: 2 },
  cellText: { ...type.caption, color: colors.onSurface, textAlign: 'center' },
  cellTextOn: { fontWeight: '500' },
  needsCheck: { ...type.caption, color: colors.danger },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  previewCard: { backgroundColor: colors.surface, borderRadius: radius.tile, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, maxWidth: 320 },
  previewName: { ...type.titleMedium, color: colors.onSurface, textAlign: 'center' },
  previewMeaning: { ...type.body, color: colors.onSurfaceMuted, textAlign: 'center', minHeight: MIN_TARGET / 2 },
});
