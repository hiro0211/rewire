import { useState, useCallback } from 'react';
import { SURVEY_QUESTIONS } from '@/constants/survey';

export function useSurveyNavigation() {
  const [step, setStep] = useState(0);

  const currentQuestion = SURVEY_QUESTIONS[step];

  const isLastStep = step === SURVEY_QUESTIONS.length - 1;

  const progress =
    SURVEY_QUESTIONS.length > 1 ? step / (SURVEY_QUESTIONS.length - 1) : 0;

  const goToNextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, SURVEY_QUESTIONS.length - 1));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    step,
    currentQuestion,
    isLastStep,
    progress,
    goToNextStep,
    goToPreviousStep,
  };
}
