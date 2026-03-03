import { useState, useCallback, useMemo } from 'react';
import { STEPS } from '@/constants/onboarding';

export function useOnboardingNavigation() {
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];

  const isLastStep = step === STEPS.length - 1;

  const progress = STEPS.length > 1 ? step / (STEPS.length - 1) : 0;

  const goToNextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setStep(index);
  }, []);

  return {
    step,
    currentStep,
    isLastStep,
    progress,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
