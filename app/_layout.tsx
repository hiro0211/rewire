import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import * as SplashScreen from 'expo-splash-screen';
import { FONT_WEIGHT } from '@/constants/theme';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hasHydrated } = useAppInitialization();
  const { colors, isDark } = useTheme();
  const { t } = useLocale();
  useNotificationDeepLink();

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
            headerTitleStyle: { color: colors.text, fontSize: 17, fontWeight: FONT_WEIGHT.semibold },
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
          <Stack.Screen name="panic/index" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="breathing/index" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="breathing/ask" options={{ headerShown: false }} />
          <Stack.Screen name="breathing/success" options={{ headerShown: false }} />
          <Stack.Screen name="recovery/index" options={{ headerShown: false }} />
          <Stack.Screen name="history/index" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: t('nav.settings') }} />
          <Stack.Screen name="achievements" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: true, title: t('nav.terms') }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: true, title: t('nav.privacyPolicy') }} />
          <Stack.Screen name="survey" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="safari-web-extension-setup" options={{ headerShown: false }} />
          <Stack.Screen name="post-purchase-onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
