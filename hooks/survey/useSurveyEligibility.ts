import { useState, useEffect } from 'react';
import { surveyStorage } from '@/lib/storage/surveyStorage';
import { userStorage } from '@/lib/storage/userStorage';
import { surveyPromptStorage } from '@/lib/storage/surveyPromptStorage';
import { shouldShowSurveyPrompt } from '@/features/survey/surveyPromptEligibility';

export function useSurveyEligibility() {
  const [shouldShowSurvey, setShouldShowSurvey] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const [isCompleted, user, promptState] = await Promise.all([
        surveyStorage.isCompleted(),
        userStorage.get(),
        surveyPromptStorage.getState(),
      ]);

      const result = shouldShowSurveyPrompt({
        isCompleted,
        accountCreatedAt: user?.createdAt ?? null,
        lastPromptedAt: promptState.lastPromptedAt,
        dismissCount: promptState.dismissCount,
        now: new Date(),
      });

      if (!cancelled) setShouldShowSurvey(result);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { shouldShowSurvey };
}
