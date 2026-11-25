import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../App';
import { t } from '../core/i18n';
import { useData } from '../data/AppData';
import { FilledButton } from '../ui/Buttons';
import { colors, radius, spacing, type } from '../ui/theme';

/** The safety notice (Functional Analysis 5.8). At first launch only the button leaves it; from Settings it can be closed. */
export default function Safety({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Safety'>) {
  const { settings } = useData();
  const firstRun = route.params?.firstRun === true;

  useEffect(() => {
    if (!firstRun) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [firstRun]);

  useEffect(() => {
    navigation.setOptions({ headerBackVisible: !firstRun, gestureEnabled: !firstRun });
  }, [navigation, firstRun]);

  const accept = async () => {
    await settings.set('safetyNoticeSeen', '1');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.notice}>
        <Text style={styles.title}>{t('ui.safety.title')}</Text>
        <Text style={styles.body}>{t('ui.safety.body')}</Text>
      </View>
      <FilledButton main label={t('ui.safety.ok')} onPress={accept} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  notice: { backgroundColor: colors.warningContainer, borderLeftWidth: 6, borderLeftColor: colors.warning, borderRadius: radius.cell, padding: spacing.lg, gap: spacing.sm },
  title: { ...type.body, fontWeight: '500', color: colors.onWarningContainer },
  body: { ...type.label, fontWeight: '400', color: colors.onWarningContainer },
});
