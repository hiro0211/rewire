import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { isExpoGo } from '@/lib/nativeGuard';

let InterstitialAd: any = null;
let AdEventType: any = {};
if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    InterstitialAd = ads.InterstitialAd;
    AdEventType = ads.AdEventType;
  } catch {
    // Native module not available
  }
}

export function useInterstitialAd(unitId: string) {
  const { user } = useUserStore();
  const [loaded, setLoaded] = useState(false);
  const [adInstance] = useState(() => {
    if (!InterstitialAd) return null;
    return InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });
  });

  useEffect(() => {
    if (!adInstance || user?.isPro) return;

    const loadedUnsub = adInstance.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const closedUnsub = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      adInstance.load();
    });

    adInstance.load();

    return () => {
      loadedUnsub();
      closedUnsub();
    };
  }, [adInstance, user?.isPro]);

  const show = useCallback(async (): Promise<boolean> => {
    if (!adInstance || user?.isPro || !loaded) return false;
    adInstance.show();
    return true;
  }, [loaded, adInstance, user?.isPro]);

  return { loaded, show };
}
