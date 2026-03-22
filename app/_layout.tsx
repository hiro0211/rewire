import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hasHydrated } = useAppInitialization();
  const { colors, isDark } = useTheme();
  const { t } = useLocale();

  if (!hasHydrated) {
    return null;
  }

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontSize: 17, fontWeight: '600' },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            headerBackButtonDisplayMode: 'minimal' as const,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen name="brand" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="streak" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/goal" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/benefits" options={{ headerShown: false }} />
          <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkin/index" options={{ headerShown: true, title: t('nav.checkin') }} />
          <Stack.Screen name="checkin/complete" options={{ headerShown: false }} />
          <Stack.Screen name="breathing/index" options={{ headerShown: false }} />
          <Stack.Screen name="breathing/ask" options={{ headerShown: false }} />
          <Stack.Screen name="breathing/success" options={{ headerShown: false }} />
          <Stack.Screen name="recovery/index" options={{ headerShown: false }} />
          <Stack.Screen name="history/index" options={{ headerShown: true, title: t('nav.history') }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: t('nav.settings') }} />
          <Stack.Screen name="achievements" options={{ headerShown: true, title: 'Achievements' }} />
          <Stack.Screen name="terms" options={{ headerShown: true, title: t('nav.terms') }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: true, title: t('nav.privacyPolicy') }} />
          <Stack.Screen name="survey" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="promo" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
