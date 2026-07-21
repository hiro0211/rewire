import { useState, useCallback } from 'react';
import { FEEDBACK_SURVEY_QUESTIONS } from '@/constants/survey';

export function useSurveyNavigation() {
  const [step, setStep] = useState(0);

  const currentQuestion = FEEDBACK_SURVEY_QUESTIONS[step];

  const isLastStep = step === FEEDBACK_SURVEY_QUESTIONS.length - 1;

  const progress =
    FEEDBACK_SURVEY_QUESTIONS.length > 1 ? step / (FEEDBACK_SURVEY_QUESTIONS.length - 1) : 0;

  const goToNextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, FEEDBACK_SURVEY_QUESTIONS.length - 1));
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
