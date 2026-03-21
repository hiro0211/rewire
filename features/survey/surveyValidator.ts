import { REQUIRED_SURVEY_QUESTIONS } from '@/constants/survey';
import { t } from '@/locales/i18n';

type ValidationResult = { ok: true } | { ok: false; error: string };

export const surveyValidator = {
  validate(answers: Record<string, string>): ValidationResult {
    const missing = REQUIRED_SURVEY_QUESTIONS.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ''
    );

    if (missing.length > 0) {
      const ids = missing.map((q) => q.id).join(', ');
      return { ok: false, error: t('survey.validationError', { ids }) };
    }

    return { ok: true };
  },
};
