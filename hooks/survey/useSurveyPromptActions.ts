import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { surveyPromptStorage } from '@/lib/storage/surveyPromptStorage';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { ROUTES } from '@/lib/routing/routes';

export function useSurveyPromptActions(onHide: () => void) {
  const router = useRouter();

  const handleAccept = useCallback(async () => {
    await surveyPromptStorage.recordPromptShown();
    await analyticsClient.logEvent('survey_prompt_accepted');
    onHide();
    router.push(ROUTES.survey);
  }, [onHide, router]);

  const handleDismiss = useCallback(async () => {
    await surveyPromptStorage.recordDismissal();
    await analyticsClient.logEvent('survey_prompt_dismissed');
    onHide();
  }, [onHide]);

  return { handleAccept, handleDismiss };
}
