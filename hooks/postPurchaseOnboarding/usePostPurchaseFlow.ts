import { useCallback, useEffect, useState } from 'react';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import { useUserStore } from '@/stores/userStore';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { logger } from '@/lib/logger';
import type { PostPurchaseStep } from '@/constants/postPurchaseOnboarding';
import { TOTAL_POST_PURCHASE_STEPS } from '@/constants/postPurchaseOnboarding';

interface UsePostPurchaseFlowResult {
  step: number;
  safariAlreadyEnabled: boolean;
  goToNext: () => void;
  goToStep: (index: number) => void;
  markCompleted: () => Promise<void>;
  logStepViewed: (name: PostPurchaseStep) => void;
  logEvent: (name: string, payload?: Record<string, unknown>) => void;
}

export function usePostPurchaseFlow(): UsePostPurchaseFlowResult {
  const [step, setStep] = useState(0);
  const [safariAlreadyEnabled, setSafariAlreadyEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    safariWebExtensionBridge
      .getExtensionStatus()
      .then((status) => {
        if (cancelled) return;
        if (status.isEnabled) {
          setSafariAlreadyEnabled(true);
        }
      })
      .catch((e) => logger.error('PostPurchaseFlow', 'getExtensionStatus failed', e));
    return () => {
      cancelled = true;
    };
  }, []);

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
    analyticsClient.logEvent('post_purchase_step_viewed', { step: name });
  }, []);

  const logEvent = useCallback((name: string, payload?: Record<string, unknown>) => {
    analyticsClient.logEvent(name, payload);
  }, []);

  return {
    step,
    safariAlreadyEnabled,
    goToNext,
    goToStep,
    markCompleted,
    logStepViewed,
    logEvent,
  };
}
