import { useState, useCallback } from 'react';

export function useSurveyForm() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  return { answers, setAnswer };
}
