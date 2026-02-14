import { useEffect, useState, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { useUserStore } from '@/stores/userStore';

export function useRewardedAd(unitId: string) {
  const { user } = useUserStore();
  const [loaded, setLoaded] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [adInstance] = useState(() => RewardedAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: true,
  }));

  useEffect(() => {
    if (user?.isPro) return;

    const loadedUnsub = adInstance.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const earnedUnsub = adInstance.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => setRewarded(true));
    const closedUnsub = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      adInstance.load();
    });

    adInstance.load();

    return () => {
      loadedUnsub();
      earnedUnsub();
      closedUnsub();
    };
  }, [adInstance, user?.isPro]);

  const show = useCallback(async (): Promise<boolean> => {
    if (user?.isPro) return false;
    if (!loaded) return false;
    adInstance.show();
    return true;
  }, [loaded, adInstance, user?.isPro]);

  return { loaded, show, rewarded };
}
