import { ASSESSMENT_QUESTIONS } from '@/constants/assessment';
import { EDUCATION_SLIDES, DAMAGE_SLIDES, RECOVERY_SLIDES } from '@/constants/education';

export const FEATURES = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Safariポルノブロッカー',
    description: 'アダルトサイトへのアクセスを自動ブロック',
  },
  {
    icon: 'analytics-outline' as const,
    title: '毎日の振り返り',
    description: '衝動やストレスを記録して自分を客観視',
  },
  {
    icon: 'fitness-outline' as const,
    title: '呼吸エクササイズ',
    description: '衝動が来たとき、呼吸で乗り越える',
  },
];

export type OnboardingStep =
  | { type: 'welcome' }
  | { type: 'assessment_choice'; questionId: string }
  | { type: 'assessment_picker'; questionId: string }
  | { type: 'assessment_yesno'; questionId: string }
  | { type: 'analyzing' }
  | { type: 'score_result' }
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
  ...ASSESSMENT_QUESTIONS.map((q): OnboardingStep => {
    if (q.type === 'choice') return { type: 'assessment_choice' as const, questionId: q.id };
    if (q.type === 'picker') return { type: 'assessment_picker' as const, questionId: q.id };
    return { type: 'assessment_yesno' as const, questionId: q.id };
  }),
  { type: 'analyzing' },
  { type: 'score_result' },
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
  'assessment_choice',
  'assessment_yesno',
  'analyzing',
]);

/** Non-countable step types (excluded from step counter) */
export const NON_COUNTABLE_TYPES = new Set([
  'education',
  'damage_intro',
  'damage',
  'recovery',
  'analyzing',
  'score_result',
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
