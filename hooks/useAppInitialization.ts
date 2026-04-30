import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { logger } from '@/lib/logger';
import { useUserStore } from '@/stores/userStore';
import { useThemeStore } from '@/stores/themeStore';
import { useLocaleStore } from '@/stores/localeStore';
import { useReflectionStore } from '@/stores/reflectionStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { useScreenTracking } from '@/lib/tracking/useScreenTracking';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { Purchases } from '@/lib/subscription/purchasesModule';

export function useAppInitialization() {
  const { loadUser, hasHydrated, user } = useUserStore();

  useScreenTracking();

  useEffect(() => {
    loadUser();
    useThemeStore.getState().loadThemePreference();
    useLocaleStore.getState().loadLocalePreference();
    useReflectionStore.getState().loadReflectionState();
    // Why: configure は userStore 復元に依存しないので並列に先行させる。
    // hydration 後の同期 useEffect で再度呼ばれるが subscriptionClient が Promise で集約するため安全。
    subscriptionClient.initialize().catch((e) => {
      logger.error('RootLayout', 'early subscription init failed:', e);
    });
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
      if (cancelled) return;
      if (!Purchases) {
        useSubscriptionStore.getState().markSynced();
        return;
      }

      // Do not call collectDeviceIdentifiers — we do not collect IDFA.

      try {
        const status = await subscriptionClient.getSubscriptionStatus();
        if (!cancelled) {
          const currentUser = useUserStore.getState().user;
          if (currentUser && currentUser.isPro !== status.isActive) {
            useUserStore.getState().updateUser({ isPro: status.isActive });
          }
        }
      } catch (e) {
        logger.error('RootLayout', 'initial subscription sync failed:', e);
      } finally {
        if (!cancelled) useSubscriptionStore.getState().markSynced();
      }

      if (cancelled) return;
      const listener = (info: { entitlements: { active: Record<string, unknown> } }) => {
        const isPro = typeof info.entitlements.active['Rewire Pro'] !== 'undefined';
        const currentUser = useUserStore.getState().user;
        if (!currentUser) return;
        if (currentUser.isPro === isPro) return;
        // Why: 空 active は「一時的に取れなかった」可能性が高い（Sandbox/オフライン/起動直後）。
        // isPro=true → false の上書きは明示的な失効検出（getSubscriptionStatus 経由）に任せ、
        // listener は isPro=true の昇格のみ即時反映する。
        if (!isPro) return;
        useUserStore.getState().updateUser({ isPro });
      };
      Purchases.addCustomerInfoUpdateListener(listener);
    })();

    return () => { cancelled = true; };
  }, [hasHydrated]);

  // Why: バックグラウンド 25h 後は RevenueCat キャッシュが切れ、getCustomerInfo が一時的に空を
  // 返すことがある。foreground 復帰時に明示再取得してキャッシュ切れ起因の誤表示を防ぐ。
  useEffect(() => {
    const handler = (state: string) => {
      if (state !== 'active') return;
      if (!Purchases) return;
      subscriptionClient.getSubscriptionStatus()
        .then((status) => {
          const currentUser = useUserStore.getState().user;
          if (currentUser && status.isActive && !currentUser.isPro) {
            useUserStore.getState().updateUser({ isPro: true });
          }
          useSubscriptionStore.getState().markSynced();
        })
        .catch((e) => {
          logger.error('RootLayout', 'appstate subscription sync failed:', e);
        });
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  return { hasHydrated };
}
