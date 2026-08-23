import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { discountExpiry } from '@/lib/paywall/discountExpiry';
import { ROUTES, routeWithParams } from '@/lib/routing/routes';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { PAYWALL_SOURCE, type PaywallSource } from '@/constants/analytics/paywallSource';
import type { PaywallVariant } from '@/constants/paywall/paywallExperiment';

type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallDismissOptions {
  /** 表示元の導線。`paywall_viewed` と同じ値を受け取り、同じ語彙で計測する。 */
  source: PaywallSource;
  /** 表示中の A/B アーム。`paywall_viewed` と同じ値を渡し、離脱率を割れるようにする。 */
  variant: PaywallVariant;
  offeringType: OfferingType;
  setOfferingType: (type: OfferingType) => void;
  setDiscountRemainingSeconds: (seconds: number) => void;
  setShowTrialSheet: (show: boolean) => void;
  onOfferingChange: () => void;
}

export function usePaywallDismiss({
  source,
  variant,
  offeringType,
  setOfferingType,
  setDiscountRemainingSeconds,
  setShowTrialSheet,
  onOfferingChange,
}: UsePaywallDismissOptions) {
  const router = useRouter();
  const isFromOnboarding = source === PAYWALL_SOURCE.ONBOARDING;

  const handleDismiss = useCallback(async () => {
    trackEvent('paywall_dismissed', { source, paywall_variant: variant });
    if (isFromOnboarding) {
      // paywall を閉じたらベネフィット画面へ戻す。
      // source を明示しないと戻り先で `benefits_screen_viewed { source: 'unknown' }`
      // になり、オンボーディング中の往復が計測から消える。
      router.replace(
        routeWithParams(ROUTES.onboardingBenefits, { source: PAYWALL_SOURCE.ONBOARDING }),
      );
      // --- Discount/Trial cascade disabled for Guideline 5.6 ---
      // if (offeringType === 'default') {
      //   const remaining = await discountExpiry.getRemainingSeconds();
      //   if (remaining <= 0) {
      //     setOfferingType('trial');
      //   } else {
      //     setDiscountRemainingSeconds(remaining);
      //     setOfferingType('discount');
      //   }
      //   onOfferingChange();
      // } else if (offeringType === 'discount') {
      //   setShowTrialSheet(true);
      // } else if (offeringType === 'trial') {
      //   router.replace(ROUTES.tabs);
      // }
    } else {
      router.replace(ROUTES.tabs);
    }
  }, [isFromOnboarding, source, variant, router]);

  // --- Trial sheet disabled for Guideline 5.6 ---
  const handleTrialSheetDismiss = useCallback(() => {
    setShowTrialSheet(false);
    router.replace(ROUTES.tabs);
  }, [router]);

  return { handleDismiss, handleTrialSheetDismiss };
}
