import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '@/stores/userStore';
import { COLORS } from '@/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { trackingClient } from '@/lib/tracking/trackingClient';
import { adMobClient } from '@/lib/ads/adMobClient';
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
  const { loadUser, hasHydrated } = useUserStore();
  const trackingRequested = useRef(false);

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
    if (hasHydrated) {
      adMobClient.initialize();
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    subscriptionClient.initialize();
    if (!Purchases) return;
    const listener = (info: { entitlements: { active: Record<string, unknown> } }) => {
      const isPro = typeof info.entitlements.active['pro'] !== 'undefined';
      const currentUser = useUserStore.getState().user;
      if (currentUser && currentUser.isPro !== isPro) {
        useUserStore.getState().updateUser({ isPro });
      }
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
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
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/goal" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkin/index" options={{ headerShown: false }} />
        <Stack.Screen name="checkin/complete" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/index" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/ask" options={{ headerShown: false }} />
        <Stack.Screen name="breathing/success" options={{ headerShown: false }} />
        <Stack.Screen name="recovery/index" options={{ headerShown: false }} />
        <Stack.Screen name="history/index" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen name="content-blocker-setup" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
