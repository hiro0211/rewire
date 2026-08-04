import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { usePaywallStore } from '@/stores/paywallStore';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { logger } from '@/lib/logger';
import { PAYWALL_SOURCE, toPaywallSource } from '@/constants/analytics/paywallSource';
import { ROUTES } from '@/lib/routing/routes';
import { useOfferings } from './useOfferings';
import { usePaywallDismiss } from './usePaywallDismiss';
import { usePaywallSubscriptionGuard } from './usePaywallSubscriptionGuard';

type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallOrchestrationOptions {
  source?: string;
}

export function usePaywallOrchestration({ source }: UsePaywallOrchestrationOptions) {
  const router = useRouter();
  const { updateUser } = useUserStore();
  // 生のルートパラメータを語彙に丸めてから、表示・離脱・購入の3イベントで共有する
  const paywallSource = toPaywallSource(source);
  const isFromOnboarding = paywallSource === PAYWALL_SOURCE.ONBOARDING;

  // Guideline 5.6対応: offeringType は常に 'default' のまま（discount/trial は無効化）
  const [offeringType, setOfferingType] = useState<OfferingType>('default');
  const [showTrialSheet, setShowTrialSheet] = useState(false);
  const [discountRemainingSeconds, setDiscountRemainingSeconds] = useState<number>(0);

  const { paywallState, setPaywallState, currentOffering, trialOffering, retry } =
    useOfferings(offeringType);

  usePaywallSubscriptionGuard({
    onActive: () => {
      router.replace(ROUTES.tabs);
    },
  });

  useEffect(() => {
    trackEvent('paywall_viewed', { source: paywallSource, offering: offeringType });
    // 起動時ペイウォールのクールダウンは「最後に見せた時刻」起点。オンボーディング
    // 経由の表示も数えることで、入った直後にもう一度出すのを防ぐ。
    usePaywallStore.getState().markLaunchPaywallShown();
  }, [offeringType]);

  const { handleDismiss, handleTrialSheetDismiss } = usePaywallDismiss({
    source: paywallSource,
    offeringType,
    setOfferingType,
    setDiscountRemainingSeconds,
    setShowTrialSheet,
    onOfferingChange: () => {
      setPaywallState('loading');
      retry();
    },
  });

  const handlePurchaseCompleted = useCallback(async (plan: string) => {
    try {
      trackEvent('pro_purchase_completed', { source: paywallSource, plan, offering: offeringType });
      await updateUser({ isPro: true });
    } catch (e) {
      logger.error('Paywall', 'updateUser failed after purchase:', e);
    }
    const hasCompleted = useUserStore.getState().user?.hasCompletedPostPurchaseOnboarding ?? false;
    if (Platform.OS === 'ios' && !hasCompleted) {
      router.replace(ROUTES.postPurchaseOnboarding);
    } else {
      router.replace(ROUTES.tabs);
    }
  }, [offeringType, paywallSource, updateUser, router]);

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
