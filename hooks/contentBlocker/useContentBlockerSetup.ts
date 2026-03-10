import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useContentBlockerStatus } from '@/hooks/useContentBlockerStatus';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';

export function useContentBlockerSetup() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useContentBlockerStatus(step, () => {
    setStep(4);
  });

  const handleNext = useCallback(async () => {
    if (step === 4) {
      setIsLoading(true);
      try {
        await contentBlockerBridge.reloadBlockerRules();
      } finally {
        setIsLoading(false);
        router.back();
      }
    } else {
      setStep(step + 1);
    }
  }, [step, router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openURL('App-Prefs:SAFARI');
  }, []);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    step,
    isLoading,
    handleNext,
    handlePrev,
    handleBack,
    handleOpenSettings,
  };
}
