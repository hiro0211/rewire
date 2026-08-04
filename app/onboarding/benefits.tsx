import React, { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PrePaywallBenefits } from '@/components/paywall/PrePaywallBenefits';
import { useUserStore } from '@/stores/userStore';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { PAYWALL_SOURCE, toPaywallSource } from '@/constants/analytics/paywallSource';

export default function BenefitsScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { nickname, goalDays, source } = useLocalSearchParams<{
    nickname: string;
    goalDays: string;
    source: string;
  }>();

  // ストアを最優先にする。ペイウォールを閉じてこの画面に戻ると params が失われ、
  // 以前は「User さん / 30日」に化けていた（goal.tsx で setUser 済みなので
  // ストアが真実源。params は初回遷移時の先回り表示用のフォールバック）。
  const resolvedNickname =
    user?.nickname || (Array.isArray(nickname) ? nickname[0] : nickname) || 'User';
  const resolvedGoalDays =
    user?.goalDays || Number(Array.isArray(goalDays) ? goalDays[0] : goalDays) || 30;

  useEffect(() => {
    trackEvent('benefits_screen_viewed', { source: toPaywallSource(source) });
  }, []);

  const handleContinue = () => {
    analyticsClient.logEvent('benefits_cta_tapped');
    InteractionManager.runAfterInteractions(() => {
      router.replace({
        pathname: '/paywall',
        params: { source: PAYWALL_SOURCE.ONBOARDING },
      });
    });
  };

  return (
    <PrePaywallBenefits
      nickname={resolvedNickname}
      goalDays={resolvedGoalDays}
      onContinue={handleContinue}
    />
  );
}
