import { useState, useCallback } from 'react';
import { surveyService } from '@/features/survey/surveyService';
import { t } from '@/locales/i18n';

export function useSurveySubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (answers: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await surveyService.submitSurvey(answers);
      setIsComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('surveyForm.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, isComplete, error };
}
