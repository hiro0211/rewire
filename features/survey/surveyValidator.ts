import { REQUIRED_SURVEY_QUESTIONS } from '@/constants/survey';

type ValidationResult = { ok: true } | { ok: false; error: string };

export const surveyValidator = {
  validate(answers: Record<string, string>): ValidationResult {
    const missing = REQUIRED_SURVEY_QUESTIONS.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ''
    );

    if (missing.length > 0) {
      const ids = missing.map((q) => q.id).join(', ');
      return { ok: false, error: `未回答の必須質問があります: ${ids}` };
    }

    return { ok: true };
  },
};
