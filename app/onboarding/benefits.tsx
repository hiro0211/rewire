import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PrePaywallBenefits } from '@/components/paywall/PrePaywallBenefits';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export default function BenefitsScreen() {
  const router = useRouter();
  const { nickname, goalDays, source } = useLocalSearchParams<{
    nickname: string;
    goalDays: string;
    source: string;
  }>();

  const resolvedNickname = Array.isArray(nickname) ? nickname[0] : nickname || 'User';
  const resolvedGoalDays = Number(Array.isArray(goalDays) ? goalDays[0] : goalDays) || 30;

  useEffect(() => {
    analyticsClient.logEvent('benefits_screen_viewed', {
      source: source || 'unknown',
    });
  }, []);

  const handleContinue = () => {
    analyticsClient.logEvent('benefits_cta_tapped');
    router.replace({
      pathname: '/paywall',
      params: { source: 'onboarding' },
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
