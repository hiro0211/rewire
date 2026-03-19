import { useState, useEffect } from 'react';
import { surveyStorage } from '@/lib/storage/surveyStorage';

export function useSurveyCompleted() {
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const completed = await surveyStorage.isCompleted();
      if (!cancelled) setIsSurveyCompleted(completed);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isSurveyCompleted };
}
