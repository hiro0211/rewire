import { STEPS } from '@/constants/onboarding';
import { isDateInFuture } from '@/lib/date/datePickerUtils';

export interface OnboardingFormState {
  nickname: string;
  privacyAgreed: boolean;
  dataAgreed: boolean;
  answers: Record<string, string>;
  lastViewedYear: number;
  lastViewedMonth: number;
  lastViewedDay: number;
}

export function canAdvanceStep(stepIndex: number, state: OnboardingFormState): boolean {
  const cs = STEPS[stepIndex];
  switch (cs.type) {
    case 'assessment_choice':
    case 'assessment_yesno':
    case 'assessment_picker':
      return !!state.answers[cs.questionId];
    case 'nickname':
      return !!state.nickname.trim();
    case 'consent':
      return state.privacyAgreed && state.dataAgreed;
    case 'last_viewed_date':
      return !isDateInFuture(state.lastViewedYear, state.lastViewedMonth, state.lastViewedDay);
    default:
      return true;
  }
}
