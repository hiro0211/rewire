import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { discountExpiry } from '@/lib/paywall/discountExpiry';
import { routeWithParams } from '@/lib/routing/routes';

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
      if (offeringType === 'default') {
        const remaining = await discountExpiry.getRemainingSeconds();
        if (remaining <= 0) {
          setOfferingType('trial');
        } else {
          setDiscountRemainingSeconds(remaining);
          setOfferingType('discount');
        }
        onOfferingChange();
      } else if (offeringType === 'discount') {
        setShowTrialSheet(true);
      } else if (offeringType === 'trial') {
        router.replace(routeWithParams('/onboarding/benefits', {
          nickname: user?.nickname || '',
          goalDays: String(user?.goalDays || 30),
        }));
      }
    } else {
      router.dismiss();
    }
  }, [isFromOnboarding, offeringType, router, user]);

  const handleTrialSheetDismiss = useCallback(() => {
    setShowTrialSheet(false);
    router.replace(routeWithParams('/onboarding/benefits', {
      nickname: user?.nickname || '',
      goalDays: String(user?.goalDays || 30),
    }));
  }, [router, user]);

  return { handleDismiss, handleTrialSheetDismiss };
}
