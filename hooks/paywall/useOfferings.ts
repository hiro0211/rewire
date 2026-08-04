import { useState, useEffect, useCallback } from 'react';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { Purchases } from '@/lib/subscription/purchasesModule';

type PaywallState = 'loading' | 'ready' | 'unavailable';
type OfferingType = 'default' | 'discount' | 'trial';

/**
 * 実際に買える商品が1つでも入っているか。
 *
 * offering オブジェクトの有無だけで ready にすると、中身が空のときに
 * ペイウォールは正常表示されるのに購入ボタンで「プランの取得に失敗しました」
 * に落ちる。買えない画面を見せるくらいなら unavailable にして再試行を促す。
 * `availablePackages` が undefined で来る形状もあるため annual/monthly も見る。
 */
function hasPurchasablePackage(offering: any): boolean {
  if (offering.availablePackages?.length > 0) return true;
  return Boolean(offering.annual ?? offering.monthly);
}

export function useOfferings(offeringType: OfferingType) {
  const [paywallState, setPaywallState] = useState<PaywallState>('loading');
  const [currentOffering, setCurrentOffering] = useState<any>(null);
  const [trialOffering, setTrialOffering] = useState<any>(null);
  const [paywallKey, setPaywallKey] = useState(0);

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
          } catch {
            try { await subscriptionClient.initialize(); } catch {}
          }
        }
        if (!mounted || !subscriptionClient.isReady()) {
          if (mounted) setPaywallState('unavailable');
          return;
        }
        const offerings = await Purchases.getOfferings();
        if (!mounted || !offerings) {
          if (mounted) setPaywallState('unavailable');
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

        if (targetOffering && hasPurchasablePackage(targetOffering)) {
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


  const retry = useCallback(() => {
    setPaywallState('loading');
    setPaywallKey((k) => k + 1);
  }, []);

  return {
    paywallState,
    setPaywallState,
    currentOffering,
    trialOffering,
    retry,
  };
}
