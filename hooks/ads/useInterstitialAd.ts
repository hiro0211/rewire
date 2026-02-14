import { useEffect, useState, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { useUserStore } from '@/stores/userStore';

export function useInterstitialAd(unitId: string) {
  const { user } = useUserStore();
  const [loaded, setLoaded] = useState(false);
  const [adInstance] = useState(() => InterstitialAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: true,
  }));

  useEffect(() => {
    if (user?.isPro) return; // Pro ユーザーはロードしない

    const loadedUnsub = adInstance.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const closedUnsub = adInstance.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      adInstance.load(); // 次の広告をプリロード
    });

    adInstance.load();

    return () => {
      loadedUnsub();
      closedUnsub();
    };
  }, [adInstance, user?.isPro]);

  const show = useCallback(async (): Promise<boolean> => {
    if (user?.isPro) return false;
    if (!loaded) return false;
    adInstance.show();
    return true;
  }, [loaded, adInstance, user?.isPro]);

  return { loaded, show };
}
