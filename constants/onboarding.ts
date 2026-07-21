import { ASSESSMENT_QUESTIONS } from '@/constants/assessment';
import { EDUCATION_SLIDES, DAMAGE_SLIDES, RECOVERY_SLIDES } from '@/constants/education';
import { ONBOARDING_SURVEY_QUESTIONS } from '@/constants/survey';

export const FEATURES = [
  {
    icon: 'shield-checkmark-outline' as const,
    titleKey: 'onboarding.features.blocker',
    descriptionKey: 'onboarding.features.blockerDesc',
  },
  {
    icon: 'analytics-outline' as const,
    titleKey: 'onboarding.features.dailyReview',
    descriptionKey: 'onboarding.features.dailyReviewDesc',
  },
  {
    icon: 'fitness-outline' as const,
    titleKey: 'onboarding.features.breathingExercise',
    descriptionKey: 'onboarding.features.breathingExerciseDesc',
  },
];

export type OnboardingStep =
  | { type: 'welcome' }
  | { type: 'onboarding_survey_choice'; questionId: string }
  | { type: 'assessment_choice'; questionId: string }
  | { type: 'assessment_picker'; questionId: string }
  | { type: 'assessment_yesno'; questionId: string }
  | { type: 'analyzing' }
  | { type: 'score_result' }
  | { type: 'symptom_select' }
  | { type: 'education'; slideIndex: number }
  | { type: 'damage'; slideIndex: number }
  | { type: 'recovery'; slideIndex: number }
  | { type: 'damage_intro' }
  | { type: 'features' }
  | { type: 'nickname' }
  | { type: 'consent' }
  | { type: 'notification' }
  | { type: 'last_viewed_date' };

export const STEPS: OnboardingStep[] = [
  { type: 'welcome' },
  ...ONBOARDING_SURVEY_QUESTIONS.map(
    (q): OnboardingStep => ({ type: 'onboarding_survey_choice' as const, questionId: q.id })
  ),
  ...ASSESSMENT_QUESTIONS.map((q): OnboardingStep => {
    if (q.type === 'choice') return { type: 'assessment_choice' as const, questionId: q.id };
    if (q.type === 'picker') return { type: 'assessment_picker' as const, questionId: q.id };
    return { type: 'assessment_yesno' as const, questionId: q.id };
  }),
  { type: 'analyzing' },
  { type: 'score_result' },
  { type: 'symptom_select' },
  ...EDUCATION_SLIDES.map((_, i): OnboardingStep => ({ type: 'education' as const, slideIndex: i })),
  { type: 'damage_intro' },
  ...DAMAGE_SLIDES.map((_, i): OnboardingStep => ({ type: 'damage' as const, slideIndex: i })),
  ...RECOVERY_SLIDES.map((_, i): OnboardingStep => ({ type: 'recovery' as const, slideIndex: i })),
  { type: 'features' },
  { type: 'nickname' },
  { type: 'consent' },
  { type: 'notification' },
  { type: 'last_viewed_date' },
];

export const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length;

/** Steps that don't show the default footer button */
export const NO_FOOTER_TYPES = new Set([
  'welcome',
  'onboarding_survey_choice',
  'assessment_choice',
  'assessment_yesno',
  'analyzing',
]);

/** Non-countable step types (excluded from step counter) */
export const NON_COUNTABLE_TYPES = new Set([
  // The onboarding survey is optional/skippable, so it must not inflate the
  // "n/m" counter shown on the required steps.
  'onboarding_survey_choice',
  'education',
  'damage_intro',
  'damage',
  'recovery',
  'analyzing',
  'score_result',
  'symptom_select',
]);

/** Find the index of the features step (skip target) */
export const FEATURES_STEP_INDEX = STEPS.findIndex((s) => s.type === 'features');

/** Step counter map: only count interactive steps */
export const STEP_COUNTER_MAP = STEPS.reduce<number[]>((acc, s) => {
  const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
  acc.push(NON_COUNTABLE_TYPES.has(s.type) ? prev : prev + 1);
  return acc;
}, []);

export const TOTAL_COUNTABLE_STEPS = STEP_COUNTER_MAP[STEP_COUNTER_MAP.length - 1];

/** Granular back-navigation control */
export function canGoBack(stepIndex: number): boolean {
  if (stepIndex <= 0) return false;
  const cs = STEPS[stepIndex];
  switch (cs.type) {
    case 'welcome':
    case 'analyzing':
    case 'score_result':
    case 'features':
    case 'nickname':
    case 'consent':
    case 'notification':
    case 'damage_intro':
      return false;
    case 'education':
      return cs.slideIndex > 0;
    case 'damage':
      return cs.slideIndex > 0;
    case 'recovery':
      return true;
    default:
      return true;
  }
}

/** Check if current step is in the education section (for skip button) */
export function isEducationStep(cs: OnboardingStep): boolean {
  return cs.type === 'education' || cs.type === 'damage_intro' || cs.type === 'damage' || cs.type === 'recovery';
}

/** Check if current step is an assessment question (for skip button) */
export function isAssessmentStep(cs: OnboardingStep): boolean {
  return cs.type === 'assessment_choice' || cs.type === 'assessment_picker' || cs.type === 'assessment_yesno';
}

/** Check if current step is an onboarding survey question (for skip button) */
export function isOnboardingSurveyStep(cs: OnboardingStep): boolean {
  return cs.type === 'onboarding_survey_choice';
}

/** Find the index of the first education slide (assessment skip target) */
export const EDUCATION_START_INDEX = STEPS.findIndex((s) => s.type === 'education');

/** Find the index of the first assessment question */
export const ASSESSMENT_START_INDEX = STEPS.findIndex((s) => isAssessmentStep(s));

/**
 * Step right after the last onboarding survey question (survey skip target).
 * Derived from the survey steps themselves so skipping always lands just past
 * the survey, whatever follows it.
 */
export const SURVEY_SKIP_TARGET_INDEX =
  STEPS.reduce((last, s, i) => (isOnboardingSurveyStep(s) ? i : last), -1) + 1;
