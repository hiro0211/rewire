import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { discountExpiry } from '@/lib/paywall/discountExpiry';
import { ROUTES, routeWithParams } from '@/lib/routing/routes';

type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallDismissOptions {
  isFromOnboarding: boolean;
  offeringType: OfferingType;
  setOfferingType: (type: OfferingType) => void;
  setDiscountRemainingSeconds: (seconds: number) => void;
  setShowTrialSheet: (show: boolean) => void;
  onOfferingChange: () => void;
}

export function usePaywallDismiss({
  isFromOnboarding,
  offeringType,
  setOfferingType,
  setDiscountRemainingSeconds,
  setShowTrialSheet,
  onOfferingChange,
}: UsePaywallDismissOptions) {
  const router = useRouter();
  const { user } = useUserStore();

  const handleDismiss = useCallback(async () => {
    if (isFromOnboarding) {
      // paywall を閉じたらベネフィット画面へ戻す
      router.replace(ROUTES.onboardingBenefits);
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
  }, [isFromOnboarding, router]);

  // --- Trial sheet disabled for Guideline 5.6 ---
  const handleTrialSheetDismiss = useCallback(() => {
    setShowTrialSheet(false);
    router.replace(ROUTES.tabs);
  }, [router]);

  return { handleDismiss, handleTrialSheetDismiss };
}
