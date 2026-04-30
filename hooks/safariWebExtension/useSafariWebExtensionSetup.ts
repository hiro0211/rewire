import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import { setSetupCompletedAt } from '@/lib/safariWebExtension/setupCompletion';

/**
 * 5-step Setup flow:
 *   0: Intro
 *   1: Open iOS Settings → Apps → Safari
 *   2: Tap "Extensions"
 *   3: Enable Rewire Safari Extension + Allow All Websites
 *   4: Completion
 *
 * When the user returns to the app after enabling the extension
 * and the extension actually fires (by visiting a blocked domain),
 * `lastActiveAt` is updated and we advance to step 4.
 */
export function useSafariWebExtensionSetup() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      if (stepRef.current < 1) return;
      const status = await safariWebExtensionBridge.getExtensionStatus();
      if (status.isEnabled) {
        setStep(4);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (step === 4) {
      setSetupCompletedAt(Date.now() / 1000);
    }
  }, [step]);

  const handleNext = useCallback(() => {
    if (step >= 4) {
      router.back();
      return;
    }
    setStep(step + 1);
  }, [step, router]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openURL('App-Prefs:SAFARI');
  }, []);

  return {
    step,
    handleNext,
    handlePrev,
    handleBack,
    handleOpenSettings,
  };
}
