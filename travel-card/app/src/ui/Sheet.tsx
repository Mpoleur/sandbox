import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../core/i18n';
import { colors, MIN_TARGET, radius, spacing, type } from './theme';

export interface SheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

/** A simple bottom sheet with large options (used for the card menu and the photo choices). */
export function Sheet({ visible, title, options, onClose }: { visible: boolean; title?: string; options: SheetOption[]; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('ui.common.close')}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {options.map((o) => (
            <Pressable
              key={o.label}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                o.onPress();
              }}
            >
              <Text style={[styles.optionText, o.destructive && styles.destructive]}>{o.label}</Text>
            </Pressable>
          ))}
          <Pressable style={({ pressed }) => [styles.option, pressed && styles.pressed]} accessibilityRole="button" onPress={onClose}>
            <Text style={styles.optionText}>{t('ui.common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.tile, borderTopRightRadius: radius.tile, padding: spacing.lg, gap: spacing.xs },
  title: { ...type.titleMedium, color: colors.onSurface, paddingBottom: spacing.sm },
  option: { minHeight: MIN_TARGET, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.small },
  pressed: { backgroundColor: colors.primaryContainer },
  optionText: { ...type.body, color: colors.onSurface },
  destructive: { color: colors.danger },
});
