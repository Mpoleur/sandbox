import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { badgeSymbols } from '../core/catalog';
import { chipNumber } from '../core/compose';
import { chipState, toggleBadge } from '../core/editorModel';
import { t } from '../core/i18n';
import { SymbolArt } from './SymbolArt';
import { colors, MIN_TARGET, radius, spacing, type } from './theme';

/** The 15 modifier chips (App Style Sheet 5). At most 2 chosen; No shows no number; blocked ones are faded. */
export function ModifierChips({
  badges,
  mainSymbolId,
  onChange,
  showUnreviewed,
}: {
  badges: string[];
  mainSymbolId: string | null;
  onChange: (next: string[]) => void;
  showUnreviewed: boolean;
}) {
  return (
    <View>
      <Text style={styles.count}>{t('ui.editor.modifiersCount', { count: badges.length })}</Text>
      <View style={styles.wrap}>
        {badgeSymbols(showUnreviewed).map((s) => {
          const state = chipState(badges, s.id, mainSymbolId);
          if (state === 'no-unavailable') return null; // "No" is not offered on the six crossed-out symbols
          const number = chipNumber(badges, s.id);
          const on = state === 'selected';
          const blocked = state === 'blocked';
          return (
            <Pressable
              key={s.id}
              onPress={() => onChange(toggleBadge(badges, s.id, mainSymbolId))}
              disabled={blocked}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: blocked }}
              accessibilityLabel={t(`symbol.${s.id}.name`)}
              style={[styles.chip, on && styles.chipOn, blocked && styles.chipBlocked]}
            >
              <View style={blocked ? styles.faded : undefined}>
                <SymbolArt id={s.id} size={32} />
              </View>
              <Text style={[styles.chipText, on && styles.chipTextOn, blocked && styles.chipTextBlocked]}>{t(`symbol.${s.id}.short`)}</Text>
              {on && number ? <Text style={styles.number}>{number}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  count: { ...type.caption, color: colors.onSurfaceMuted, paddingBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: MIN_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderWidth: 2 },
  chipBlocked: { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineSubtle },
  faded: { opacity: 0.4 },
  chipText: { ...type.label, color: colors.onSurface },
  chipTextOn: { color: colors.onPrimaryContainer },
  chipTextBlocked: { color: colors.disabledText },
  number: { ...type.caption, color: colors.onPrimary, backgroundColor: colors.primary, minWidth: 18, textAlign: 'center', borderRadius: 9, overflow: 'hidden' },
});
