import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { boot, type BootResult, type Recovery } from './boot';
import { t } from './core/i18n';
import { AppDataProvider } from './data/AppData';
import { DatabaseTooNewError } from './data/migrations/runner';
import CardEditor from './screens/CardEditor';
import About from './screens/About';
import Categories from './screens/Categories';
import Reorder from './screens/Reorder';
import Safety from './screens/Safety';
import Settings from './screens/Settings';
import DisplayCard from './screens/DisplayCard';
import Home from './screens/Home';
import { colors, spacing, type } from './ui/theme';

export type RootStackParamList = {
  Home: { reminder?: boolean } | undefined;
  Reorder: undefined;
  Settings: undefined;
  Categories: undefined;
  About: undefined;
  Safety: { firstRun?: boolean } | undefined;
  CardEditor: { cardId?: string; recovery?: Recovery } | undefined;
  DisplayCard: { cardId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navRef = createNavigationContainerRef<RootStackParamList>();

// Navigation: React Navigation, the fallback of decision DR-06. expo-router pulled in gesture-handler and
// reanimated, whose C++ build breaks the Windows 260-character path limit on this PC (check C1, section 15).
export default function App() {
  const [state, setState] = useState<{ kind: 'loading' } | { kind: 'ready'; result: BootResult } | { kind: 'error'; message: string; tooNew: boolean }>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    boot()
      .then((result) => alive && setState({ kind: 'ready', result }))
      .catch((e: unknown) => alive && setState({ kind: 'error', message: e instanceof Error ? e.message : String(e), tooNew: e instanceof DatabaseTooNewError }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.kind === 'loading') return <View style={styles.center} />;
  if (state.kind === 'error') {
    // Nothing was deleted. The cards are not opened, never guessed at (Technical Analysis 7.3).
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>{t('ui.db.error.title')}</Text>
        <Text style={styles.errorBody}>{state.tooNew ? t('ui.db.tooNew.body') : t('ui.db.error.body', { message: state.message })}</Text>
      </View>
    );
  }
  const { result } = state;
  const recovery = result.recovery;

  return (
    <SafeAreaProvider>
      <AppDataProvider data={result.data}>
        <NavigationContainer
          ref={navRef}
          onReady={() => {
            // A photo picked while Android had closed the app: reopen the editor with the draft and the photo.
            if (recovery) navRef.navigate('CardEditor', { cardId: recovery.draft.cardId === 'new' ? undefined : recovery.draft.cardId, recovery });
          }}
        >
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.onSurface,
              headerTitleStyle: { ...type.titleLarge },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="CardEditor" component={CardEditor} options={{ title: t('ui.editor.title.new') }} />
            <Stack.Screen name="DisplayCard" component={DisplayCard} options={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.displayBackground } }} />
            <Stack.Screen name="Reorder" component={Reorder} options={{ title: t('ui.reorder.title') }} />
            <Stack.Screen name="Settings" component={Settings} options={{ title: t('ui.settings.title') }} />
            <Stack.Screen name="Categories" component={Categories} options={{ title: t('ui.categories.title') }} />
            <Stack.Screen name="About" component={About} options={{ title: t('ui.about.title') }} />
            <Stack.Screen name="Safety" component={Safety} options={{ title: t('ui.safety.title') }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  errorTitle: { ...type.titleLarge, color: colors.onSurface, textAlign: 'center' },
  errorBody: { ...type.body, color: colors.onSurfaceMuted, textAlign: 'center' },
});
