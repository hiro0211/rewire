import { useEffect, useRef } from 'react';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { useUserStore } from '@/stores/userStore';
import { logger } from '@/lib/logger';

interface UsePaywallSubscriptionGuardOptions {
  onActive: () => void;
}

/**
 * ペイウォール表示中に「実は契約済み」を検知して自動離脱させる二重ガード。
 *
 * Why: 起動直後のレース条件や listener の false 上書きで誤って paywall に
 * 到達しても、ここで getSubscriptionStatus を再取得し直し、さらに
 * userStore.user.isPro の変化も監視して確実に離脱できるようにする。
 */
export function usePaywallSubscriptionGuard({ onActive }: UsePaywallSubscriptionGuardOptions): void {
  const hasFiredRef = useRef(false);
  const isPro = useUserStore((s) => s.user?.isPro ?? false);
  const updateUser = useUserStore((s) => s.updateUser);

  useEffect(() => {
    if (isPro && !hasFiredRef.current) {
      hasFiredRef.current = true;
      onActive();
    }
  }, [isPro, onActive]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await subscriptionClient.getSubscriptionStatus();
        if (cancelled) return;
        if (status.isActive) {
          await updateUser({ isPro: true });
          if (!hasFiredRef.current) {
            hasFiredRef.current = true;
            onActive();
          }
        }
      } catch (e) {
        logger.error('PaywallGuard', 'getSubscriptionStatus failed:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
