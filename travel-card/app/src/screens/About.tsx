import Constants from 'expo-constants';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { t } from '../core/i18n';
import { colors, spacing, type } from '../ui/theme';

export default function About() {
  const version = Constants.expoConfig?.version ?? '';
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{t('ui.app.name')}</Text>
      <Text style={styles.muted}>{t('ui.about.version', { version })}</Text>
      <Text style={styles.body}>{t('ui.about.storage')}</Text>
      <Text style={styles.body}>{t('ui.about.privacy')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  name: { ...type.titleLarge, color: colors.onSurface },
  muted: { ...type.body, color: colors.onSurfaceMuted },
  body: { ...type.body, color: colors.onSurface },
});
