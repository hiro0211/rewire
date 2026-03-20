import {
  isAssessmentStep,
  isEducationStep,
  EDUCATION_START_INDEX,
  FEATURES_STEP_INDEX,
  STEPS,
} from '@/constants/onboarding';

describe('isAssessmentStep', () => {
  it('assessment_choice のとき true になる', () => {
    expect(isAssessmentStep({ type: 'assessment_choice', questionId: 'q1' })).toBe(true);
  });

  it('assessment_picker のとき true になる', () => {
    expect(isAssessmentStep({ type: 'assessment_picker', questionId: 'q1' })).toBe(true);
  });

  it('assessment_yesno のとき true になる', () => {
    expect(isAssessmentStep({ type: 'assessment_yesno', questionId: 'q1' })).toBe(true);
  });

  it('welcome のとき false になる', () => {
    expect(isAssessmentStep({ type: 'welcome' })).toBe(false);
  });

  it('education のとき false になる', () => {
    expect(isAssessmentStep({ type: 'education', slideIndex: 0 })).toBe(false);
  });

  it('features のとき false になる', () => {
    expect(isAssessmentStep({ type: 'features' })).toBe(false);
  });
});

describe('EDUCATION_START_INDEX', () => {
  it('最初の education ステップのインデックスを指す', () => {
    expect(STEPS[EDUCATION_START_INDEX].type).toBe('education');
  });

  it('FEATURES_STEP_INDEX より前にある', () => {
    expect(EDUCATION_START_INDEX).toBeLessThan(FEATURES_STEP_INDEX);
  });

  it('その前のステップは education ではない', () => {
    expect(STEPS[EDUCATION_START_INDEX - 1].type).not.toBe('education');
  });
});
