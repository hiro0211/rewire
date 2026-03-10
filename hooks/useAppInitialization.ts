import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { logger } from '@/lib/logger';
import { useFonts } from 'expo-font';
import { useUserStore } from '@/stores/userStore';
import { useThemeStore } from '@/stores/themeStore';
import { trackingClient } from '@/lib/tracking/trackingClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { useScreenTracking } from '@/lib/tracking/useScreenTracking';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { Purchases } from '@/lib/subscription/purchasesModule';

export function useAppInitialization() {
  const { loadUser, hasHydrated, user } = useUserStore();
  const trackingRequested = useRef(false);

  useScreenTracking();

  useFonts({});

  useEffect(() => {
    loadUser();
    useThemeStore.getState().loadThemePreference();
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      loadUser();
    }
  }, [hasHydrated]);

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
        logger.error('RootLayout', 'subscription init failed:', e);
      }
      if (cancelled || !Purchases) return;
      const listener = (info: { entitlements: { active: Record<string, unknown> } }) => {
        const isPro = typeof info.entitlements.active['Rewire Pro'] !== 'undefined';
        const currentUser = useUserStore.getState().user;
        if (currentUser && currentUser.isPro !== isPro) {
          useUserStore.getState().updateUser({ isPro });
        }
      };
      Purchases.addCustomerInfoUpdateListener(listener);
    })();

    return () => { cancelled = true; };
  }, [hasHydrated]);

  return { hasHydrated };
}
