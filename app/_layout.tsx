import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '@/stores/userStore';
import { COLORS } from '@/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { trackingClient } from '@/lib/tracking/trackingClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { useScreenTracking } from '@/lib/tracking/useScreenTracking';

import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { isExpoGo } from '@/lib/nativeGuard';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {
    // Native module not available
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadUser, hasHydrated, user } = useUserStore();
  const trackingRequested = useRef(false);

  useScreenTracking();

  // Load fonts if custom fonts are added later
  const [loaded] = useFonts({
    // 'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (hasHydrated && !trackingRequested.current) {
      trackingRequested.current = true;
      trackingClient.requestPermissions();
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (hasHydrated && user) {
      analyticsClient.setUserProperty('goal_days', String(user.goalDays));
      analyticsClient.setUserProperty('is_pro', String(user.isPro));
    }
  }, [hasHydrated, user?.goalDays, user?.isPro]);

  useEffect(() => {
    if (!hasHydrated) return;
    let cancelled = false;

    (async () => {
      try {
        await subscriptionClient.initialize();
      } catch (e) {
        console.error('[RootLayout] subscription init failed:', e);
      }
      if (cancelled || !Purchases) return;
      const listener = (info: { entitlements: { active: Record<string, unknown> } }) => {
        const isPro = typeof info.entitlements.active['pro'] !== 'undefined';
        const currentUser = useUserStore.getState().user;
        if (currentUser && currentUser.isPro !== isPro) {
          useUserStore.getState().updateUser({ isPro });
        }
      };
      Purchases.addCustomerInfoUpdateListener(listener);
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { color: COLORS.text, fontSize: 17, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade', headerBackTitle: '戻る' }} />
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="brand" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/goal" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkin/index" options={{ headerShown: true, title: '今日の振り返り', headerBackTitle: 'ホーム' }} />
        <Stack.Screen name="checkin/complete" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/index" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/ask" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/success" options={{ headerShown: false }} />
        <Stack.Screen name="recovery/index" options={{ headerShown: false }} />
        <Stack.Screen name="history/index" options={{ headerShown: true, title: '履歴', headerBackTitle: '戻る' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: '設定' }} />
        <Stack.Screen name="achievements" options={{ headerShown: true, title: 'Achievements', headerBackTitle: '戻る' }} />
        <Stack.Screen name="terms" options={{ headerShown: true, title: '利用規約' }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: true, title: 'プライバシーポリシー' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
