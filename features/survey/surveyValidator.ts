import { t } from '@/locales/i18n';
import type { SurveyQuestion } from '@/types/survey';

type ValidationResult = { ok: true } | { ok: false; error: string };

export const surveyValidator = {
  /**
   * Validates `answers` against the required questions of the given question
   * set, so the onboarding submission is not blocked by feedback questions
   * (and vice versa).
   */
  validate(
    answers: Record<string, string>,
    questions: SurveyQuestion[]
  ): ValidationResult {
    const missing = questions.filter(
      (q) => q.required && (!answers[q.id] || answers[q.id].trim() === '')
    );

    if (missing.length > 0) {
      const ids = missing.map((q) => q.id).join(', ');
      return { ok: false, error: t('survey.validationError', { ids }) };
    }

    return { ok: true };
  },
};
