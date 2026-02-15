import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';

let RewardedAd: any = null;
let RewardedAdEventType: any = {};
let AdEventType: any = {};
if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    RewardedAd = ads.RewardedAd;
    RewardedAdEventType = ads.RewardedAdEventType;
    AdEventType = ads.AdEventType;
  } catch {
    // Native module not available
  }
}

export function useRewardedAd(unitId: string) {
  const { user } = useUserStore();
  const [loaded, setLoaded] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [adInstance] = useState(() => {
    if (!RewardedAd) return null;
    return RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });
  });

  useEffect(() => {
    if (!adInstance || user?.isPro) return;

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
    if (!adInstance || user?.isPro || !loaded) return false;
    adInstance.show();
    return true;
  }, [loaded, adInstance, user?.isPro]);

  return { loaded, show, rewarded };
}
