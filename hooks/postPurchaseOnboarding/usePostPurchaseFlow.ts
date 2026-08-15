import { useCallback, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { trackEvent } from '@/lib/tracking/trackEvent';
import { logger } from '@/lib/logger';
import type { PostPurchaseStep } from '@/constants/postPurchaseOnboarding';
import { TOTAL_POST_PURCHASE_STEPS } from '@/constants/postPurchaseOnboarding';

interface UsePostPurchaseFlowResult {
  step: number;
  goToNext: () => void;
  goToStep: (index: number) => void;
  markCompleted: () => Promise<void>;
  logStepViewed: (name: PostPurchaseStep) => void;
}

export function usePostPurchaseFlow(): UsePostPurchaseFlowResult {
  const [step, setStep] = useState(0);

  const goToNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_POST_PURCHASE_STEPS - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    setStep(Math.max(0, Math.min(index, TOTAL_POST_PURCHASE_STEPS - 1)));
  }, []);

  const markCompleted = useCallback(async () => {
    try {
      await useUserStore.getState().updateUser({ hasCompletedPostPurchaseOnboarding: true });
    } catch (e) {
      logger.error('PostPurchaseFlow', 'markCompleted failed', e);
    }
  }, []);

  const logStepViewed = useCallback((name: PostPurchaseStep) => {
    trackEvent('post_purchase_step_viewed', { step: name });
  }, []);

  // 汎用の logEvent は意図的に公開しない。イベント名と params が型で守られない
  // 抜け道になり、実際に `fromStep` という camelCase をここから素通しさせていた。
  // 画面固有のイベントは呼び出し側で `trackEvent` を直接使うこと。
  return {
    step,
    goToNext,
    goToStep,
    markCompleted,
    logStepViewed,
  };
}
