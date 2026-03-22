import { useState, useCallback } from 'react';
import { surveyService } from '@/features/survey/surveyService';
import { useUserStore } from '@/stores/userStore';
import { t } from '@/locales/i18n';

interface UseSurveySubmitOptions {
  promoCode?: string;
  promoSource?: string;
}

export function useSurveySubmit(options?: UseSurveySubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useUserStore();

  const isPromo = !!(options?.promoCode && options?.promoSource);

  const submit = useCallback(async (answers: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isPromo) {
        await surveyService.submitSurveyWithPromo(
          answers,
          options!.promoCode!,
          options!.promoSource!,
        );
        await updateUser({
          isPro: true,
          promoCode: options!.promoCode!,
          promoRedeemedAt: new Date().toISOString(),
        });
      } else {
        await surveyService.submitSurvey(answers);
      }
      setIsComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('surveyForm.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [isPromo, options?.promoCode, options?.promoSource, updateUser]);

  return { submit, isSubmitting, isComplete, error, isPromo };
}
