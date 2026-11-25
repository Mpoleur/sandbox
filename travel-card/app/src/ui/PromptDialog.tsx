import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../core/i18n';
import { FilledButton, TonalButton } from './Buttons';
import { colors, radius, spacing, type } from './theme';

/** A small dialog with one text field (category name). Android has no built-in text prompt. */
export function PromptDialog({
  visible, title, initial = '', onCancel, onSubmit,
}: {
  visible: boolean;
  title: string;
  initial?: string;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    if (visible) setText(initial);
  }, [visible, initial]);
  const empty = text.trim().length === 0;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={t('ui.categories.name')}
            placeholderTextColor={colors.onSurfaceMuted}
            accessibilityLabel={t('ui.categories.name')}
            autoFocus
            maxLength={40}
          />
          <View style={styles.row}>
            <TonalButton label={t('ui.common.cancel')} onPress={onCancel} />
            <FilledButton label={t('ui.categories.save')} onPress={() => onSubmit(text.trim())} disabled={empty} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.tile, padding: spacing.xl, gap: spacing.md },
  title: { ...type.titleMedium, color: colors.onSurface },
  input: { ...type.body, minHeight: 56, borderRadius: radius.cell, borderWidth: 1.5, borderColor: colors.outline, paddingHorizontal: spacing.lg, color: colors.onSurface },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
});
