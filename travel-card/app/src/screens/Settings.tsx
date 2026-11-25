import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { RootStackParamList } from '../App';
import { tn, t } from '../core/i18n';
import { useData } from '../data/AppData';
import { restoreExamples } from '../data/examplesService';
import { colors, MIN_TARGET, spacing, type } from '../ui/theme';

export const BRIGHTNESS_SETTING = 'brightnessOnDisplay';

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

/** Settings (Functional Analysis v0.6 6): Categories, Restore example cards, Safety notice, About, brightness switch. */
export default function Settings({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const { cards, settings } = useData();
  const [brightness, setBrightness] = useState(true);

  useEffect(() => {
    void settings.get(BRIGHTNESS_SETTING).then((v) => setBrightness(v !== '0')); // absent means on
  }, [settings]);

  const restore = async () => {
    const n = await restoreExamples(cards);
    Alert.alert(n > 0 ? tn('ui.settings.restored', n) : t('ui.settings.restore.none'));
  };

  return (
    <ScrollView style={styles.screen}>
      <Row label={t('ui.settings.categories')} onPress={() => navigation.navigate('Categories')} />
      <Row label={t('ui.settings.restore')} onPress={() => void restore()} />
      <Row label={t('ui.settings.safety')} onPress={() => navigation.navigate('Safety', { firstRun: false })} />
      <Row label={t('ui.settings.about')} onPress={() => navigation.navigate('About')} />
      <View style={styles.row}>
        <Text style={styles.rowText}>{t('ui.settings.brightness')}</Text>
        <Switch
          value={brightness}
          onValueChange={(v) => {
            setBrightness(v);
            void settings.set(BRIGHTNESS_SETTING, v ? '1' : '0');
          }}
          trackColor={{ true: colors.primary, false: colors.outline }}
          accessibilityLabel={t('ui.settings.brightness')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { minHeight: 56, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineSubtle, gap: spacing.md },
  pressed: { backgroundColor: colors.primaryContainer },
  rowText: { ...type.body, color: colors.onSurface, flex: 1, minHeight: MIN_TARGET / 2 },
});
