import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { logger } from '@/lib/logger';
import { ROUTES } from '@/lib/routing/routes';
import { useOfferings } from './useOfferings';
import { usePaywallDismiss } from './usePaywallDismiss';

type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallOrchestrationOptions {
  source?: string;
}

export function usePaywallOrchestration({ source }: UsePaywallOrchestrationOptions) {
  const router = useRouter();
  const { updateUser } = useUserStore();
  const isFromOnboarding = source === 'onboarding';

  const [offeringType, setOfferingType] = useState<OfferingType>('default');
  const [showTrialSheet, setShowTrialSheet] = useState(false);
  const [discountRemainingSeconds, setDiscountRemainingSeconds] = useState<number>(0);

  const { paywallState, setPaywallState, currentOffering, trialOffering, retry } =
    useOfferings(offeringType);

  useEffect(() => {
    analyticsClient.logEvent('paywall_viewed', { source: source || 'unknown', offering: offeringType });
  }, [offeringType]);

  const { handleDismiss, handleTrialSheetDismiss } = usePaywallDismiss({
    isFromOnboarding,
    offeringType,
    setOfferingType,
    setDiscountRemainingSeconds,
    setShowTrialSheet,
    onOfferingChange: () => {
      setPaywallState('loading');
      retry();
    },
  });

  const handlePurchaseCompleted = useCallback(async () => {
    try {
      analyticsClient.logEvent('pro_purchase_completed', { offering: offeringType });
      await updateUser({ isPro: true });
    } catch (e) {
      logger.error('Paywall', 'updateUser failed after purchase:', e);
    }
    router.replace(ROUTES.tabs);
  }, [offeringType, updateUser, router]);

  const handleRestoreCompleted = useCallback(async () => {
    try {
      await updateUser({ isPro: true });
    } catch (e) {
      logger.error('Paywall', 'updateUser failed after restore:', e);
    }
    router.replace(ROUTES.tabs);
  }, [updateUser, router]);

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
    handleRetry: retry,
  };
}
