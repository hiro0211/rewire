import { useEffect } from 'react';

import { STEPS } from '@/constants/onboarding';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

/**
 * Fires an `onboarding_step_viewed` event whenever the onboarding step changes.
 *
 * Onboarding is a single Expo Router route (`/onboarding`) driving 27 internal
 * steps, so GA4's automatic screen_view can't see per-step drop-off — every
 * step looks like the same `/onboarding` screen. This makes each step a
 * distinct, countable funnel stage (step_index + step_type) so the leak inside
 * the flow becomes visible in GA4.
 */
export function useOnboardingStepTracking(step: number): void {
  useEffect(() => {
    const current = STEPS[step];
    if (!current) return;

    analyticsClient.logEvent('onboarding_step_viewed', {
      step_index: step,
      step_type: current.type,
    });
  }, [step]);
}
