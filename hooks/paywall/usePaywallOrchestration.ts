import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { usePaywallStore } from '@/stores/paywallStore';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { logger } from '@/lib/logger';
import { PAYWALL_SOURCE, toPaywallSource } from '@/constants/analytics/paywallSource';
import { DEBUG_MENU_ENABLED } from '@/constants/debug';
import { resolveDebugPaywallVariant } from '@/lib/paywall/debugPaywallVariant';
import { resolvePaywallVariant } from '@/lib/paywall/resolvePaywallVariant';
import { ROUTES } from '@/lib/routing/routes';
import { useOfferings } from './useOfferings';
import { usePaywallDismiss } from './usePaywallDismiss';
import { usePaywallSubscriptionGuard } from './usePaywallSubscriptionGuard';

type OfferingType = 'default' | 'discount' | 'trial';

interface UsePaywallOrchestrationOptions {
  source?: string;
  /** 設定画面のデバッグメニューから渡す、割当を上書きするバリアント名 */
  debugVariant?: string | string[];
}

export function usePaywallOrchestration({
  source,
  debugVariant,
}: UsePaywallOrchestrationOptions) {
  const router = useRouter();
  const { updateUser, user, hasHydrated } = useUserStore();
  // 生のルートパラメータを語彙に丸めてから、表示・離脱・購入の3イベントで共有する
  const paywallSource = toPaywallSource(source);
  const isFromOnboarding = paywallSource === PAYWALL_SOURCE.ONBOARDING;

  // 同期・純関数なので描画中にそのまま呼べる。await も再レンダリングも挟まないため
  // 「default を一瞬見せてから A案に差し替わる」チラつきが起きない。
  // ただし user.id は AsyncStorage 復元待ちなので、確定したかどうかは別に持つ。
  // デバッグメニューからの強制指定。割当はハッシュで決まるので、指定できないと
  // 開発者は片方のペイウォールを一生目視確認できない。
  const debugOverride = resolveDebugPaywallVariant(debugVariant, DEBUG_MENU_ENABLED);
  const variant = debugOverride ?? resolvePaywallVariant(user?.id);
  // 上書き中は user.id を待つ必要がない（ハッシュを使わないため）
  const isVariantResolved = debugOverride !== null || hasHydrated;

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

  // 起動時ペイウォールのクールダウンは「最後に見せた時刻」起点。オンボーディング
  // 経由の表示も数えることで、入った直後にもう一度出すのを防ぐ。
  // ⚠️ バリアント確定のゲート内に入れてはならない。記録されないまま画面を閉じると
  //    launchPaywallCooldown が「未記録＝表示する」に倒れ、毎起動で出るようになる。
  useEffect(() => {
    usePaywallStore.getState().markLaunchPaywallShown();
  }, [offeringType]);

  // 表示イベントだけはバリアント確定を待つ。未確定のまま fallback の 'default' で
  // 送ると、実際は cosmicJourney のユーザーが default 側の母数に入り A/B が壊れる。
  //
  // ⚠️ デバッグ指定で開いた回数は送らない。開発者の確認が A/B の母数に混ざると、
  //    その端末が本来の割当と違うアームに計上され、比較そのものが歪む。
  useEffect(() => {
    if (!isVariantResolved || debugOverride !== null) return;
    trackEvent('paywall_viewed', {
      source: paywallSource,
      offering: offeringType,
      paywall_variant: variant,
    });
  }, [offeringType, isVariantResolved, variant, debugOverride]);

  const { handleDismiss, handleTrialSheetDismiss } = usePaywallDismiss({
    source: paywallSource,
    variant,
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
      trackEvent('pro_purchase_completed', {
        source: paywallSource,
        plan,
        offering: offeringType,
        paywall_variant: variant,
      });
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
  }, [offeringType, paywallSource, variant, updateUser, router]);

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
    variant,
    isVariantResolved,
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
