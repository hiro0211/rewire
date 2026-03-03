import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { discountExpiry } from '@/lib/paywall/discountExpiry';

let Purchases: any = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {}
}

type PaywallState = 'loading' | 'ready' | 'unavailable';
type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallOrchestrationOptions {
  source?: string;
}

export function usePaywallOrchestration({ source }: UsePaywallOrchestrationOptions) {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const isFromOnboarding = source === 'onboarding';

  const [paywallState, setPaywallState] = useState<PaywallState>('loading');
  const [currentOffering, setCurrentOffering] = useState<any>(null);
  const [offeringType, setOfferingType] = useState<OfferingType>('default');
  const [paywallKey, setPaywallKey] = useState(0);
  const [showTrialSheet, setShowTrialSheet] = useState(false);
  const [trialOffering, setTrialOffering] = useState<any>(null);
  const [discountRemainingSeconds, setDiscountRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    analyticsClient.logEvent('paywall_viewed', { source: source || 'unknown', offering: offeringType });
  }, [offeringType]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!Purchases) {
          if (mounted) setPaywallState('unavailable');
          return;
        }
        if (!subscriptionClient.isReady()) {
          try {
            await subscriptionClient.initialize();
          } catch {}
        }
        if (!mounted) return;
        if (!subscriptionClient.isReady()) {
          setPaywallState('unavailable');
          return;
        }
        const offerings = await Purchases.getOfferings();
        if (!mounted) return;
        if (!offerings) {
          setPaywallState('unavailable');
          return;
        }

        let targetOffering;
        if (offeringType === 'trial') {
          targetOffering = offerings.all?.['trial'] ?? offerings.all?.['discount plan'] ?? offerings.current;
        } else if (offeringType === 'discount') {
          targetOffering = offerings.all?.['discount plan'] ?? offerings.current;
          const trialOff = offerings.all?.['trial'] ?? offerings.all?.['discount plan'] ?? offerings.current;
          setTrialOffering(trialOff);
        } else {
          targetOffering = offerings.current;
        }

        if (targetOffering) {
          setCurrentOffering(targetOffering);
          setPaywallState('ready');
        } else {
          setPaywallState('unavailable');
        }
      } catch {
        if (mounted) setPaywallState('unavailable');
      }
    })();
    return () => { mounted = false; };
  }, [offeringType, paywallKey]);

  const handleDismiss = useCallback(async () => {
    if (isFromOnboarding) {
      if (offeringType === 'default') {
        const remaining = await discountExpiry.getRemainingSeconds();
        if (remaining <= 0) {
          setOfferingType('trial');
        } else {
          setDiscountRemainingSeconds(remaining);
          setOfferingType('discount');
        }
        setPaywallState('loading');
        setPaywallKey((k) => k + 1);
      } else if (offeringType === 'discount') {
        setShowTrialSheet(true);
      } else if (offeringType === 'trial') {
        router.replace({
          pathname: '/onboarding/benefits',
          params: {
            nickname: user?.nickname || '',
            goalDays: String(user?.goalDays || 30),
          },
        } as any);
      }
    } else {
      router.dismiss();
    }
  }, [isFromOnboarding, offeringType, router]);

  const handleTrialSheetDismiss = useCallback(() => {
    setShowTrialSheet(false);
    router.replace({
      pathname: '/onboarding/benefits',
      params: {
        nickname: user?.nickname || '',
        goalDays: String(user?.goalDays || 30),
      },
    } as any);
  }, [router, user]);

  const handlePurchaseCompleted = useCallback(async () => {
    try {
      analyticsClient.logEvent('pro_purchase_completed', { offering: offeringType });
      await updateUser({ isPro: true });
    } catch (e) {
      console.error('[Paywall] updateUser failed after purchase:', e);
    }
    router.replace('/(tabs)');
  }, [offeringType, updateUser, router]);

  const handleRestoreCompleted = useCallback(async () => {
    try {
      await updateUser({ isPro: true });
    } catch (e) {
      console.error('[Paywall] updateUser failed after restore:', e);
    }
    router.replace('/(tabs)');
  }, [updateUser, router]);

  const handleRetry = useCallback(() => {
    setPaywallState('loading');
    setPaywallKey((k) => k + 1);
  }, []);

  return {
    paywallState,
    setPaywallState,
    currentOffering,
    offeringType,
    showTrialSheet,
    trialOffering,
    discountRemainingSeconds,
    isFromOnboarding,
    handleDismiss,
    handleTrialSheetDismiss,
    handlePurchaseCompleted,
    handleRestoreCompleted,
    handleRetry,
  };
}
