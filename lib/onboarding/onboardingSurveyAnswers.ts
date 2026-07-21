import { ONBOARDING_SURVEY_QUESTIONS } from '@/constants/survey';

/**
 * Extracts the onboarding survey answers out of the shared onboarding answers
 * record (which also holds assessment answers).
 *
 * Returns `{}` when the user skipped the survey or left a required question
 * unanswered — the caller treats that as "nothing to submit", so a skipping
 * user produces neither a Firestore document nor an analytics event.
 */
export function pickOnboardingSurveyAnswers(
  answers: Record<string, string>,
  skipped: boolean
): Record<string, string> {
  if (skipped) return {};

  const picked: Record<string, string> = {};
  for (const question of ONBOARDING_SURVEY_QUESTIONS) {
    const value = answers[question.id];
    if (question.required && (!value || value.trim() === '')) return {};
    if (value) picked[question.id] = value;
  }

  return picked;
}
