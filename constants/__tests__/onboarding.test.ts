import {
  isAssessmentStep,
  isEducationStep,
  isOnboardingSurveyStep,
  EDUCATION_START_INDEX,
  FEATURES_STEP_INDEX,
  ASSESSMENT_START_INDEX,
  SURVEY_SKIP_TARGET_INDEX,
  NO_FOOTER_TYPES,
  NON_COUNTABLE_TYPES,
  STEP_COUNTER_MAP,
  STEPS,
  canGoBack,
} from '@/constants/onboarding';
import { ONBOARDING_SURVEY_QUESTIONS } from '@/constants/survey';

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


describe('オンボーディング調査ステップ', () => {
  const surveyIndices = STEPS.reduce<number[]>((acc, s, i) => {
    if (s.type === 'onboarding_survey_choice') acc.push(i);
    return acc;
  }, []);

  it('welcome の直後に3問が並ぶ', () => {
    const welcomeIndex = STEPS.findIndex((s) => s.type === 'welcome');
    expect(surveyIndices).toEqual([welcomeIndex + 1, welcomeIndex + 2, welcomeIndex + 3]);
  });

  it('constants/survey.ts のオンボーディング設問と同じ順序・同じidを持つ', () => {
    const ids = surveyIndices.map((i) => {
      const step = STEPS[i];
      if (step.type !== 'onboarding_survey_choice') throw new Error('unexpected');
      return step.questionId;
    });
    expect(ids).toEqual(ONBOARDING_SURVEY_QUESTIONS.map((q) => q.id));
  });

  it('assessment 質問より前に置かれる', () => {
    expect(Math.max(...surveyIndices)).toBeLessThan(ASSESSMENT_START_INDEX);
  });

  it('選択で自動送りするためフッターボタンを出さない', () => {
    expect(NO_FOOTER_TYPES.has('onboarding_survey_choice')).toBe(true);
  });

  it('任意回答なのでステップカウンターを増やさない', () => {
    expect(NON_COUNTABLE_TYPES.has('onboarding_survey_choice')).toBe(true);
    surveyIndices.forEach((i) => {
      expect(STEP_COUNTER_MAP[i]).toBe(STEP_COUNTER_MAP[i - 1]);
    });
  });

  it('2問目以降は前の設問に戻れる', () => {
    expect(canGoBack(surveyIndices[1])).toBe(true);
    expect(canGoBack(surveyIndices[2])).toBe(true);
  });
});

describe('SURVEY_SKIP_TARGET_INDEX', () => {
  it('最後の調査ステップの次を指す（調査を丸ごと飛ばせる）', () => {
    const lastSurveyIndex = STEPS.reduce(
      (last, s, i) => (isOnboardingSurveyStep(s) ? i : last),
      -1,
    );
    expect(SURVEY_SKIP_TARGET_INDEX).toBe(lastSurveyIndex + 1);
  });

  it('スキップ先自体は調査ステップではない', () => {
    expect(isOnboardingSurveyStep(STEPS[SURVEY_SKIP_TARGET_INDEX])).toBe(false);
  });

  it('実際のSTEPSでは assessment 1問目と一致する', () => {
    expect(SURVEY_SKIP_TARGET_INDEX).toBe(ASSESSMENT_START_INDEX);
  });
});

describe('isOnboardingSurveyStep', () => {
  it('onboarding_survey_choice のとき true になる', () => {
    expect(
      isOnboardingSurveyStep({ type: 'onboarding_survey_choice', questionId: 'age_range' })
    ).toBe(true);
  });

  it('assessment_choice のとき false になる', () => {
    expect(isOnboardingSurveyStep({ type: 'assessment_choice', questionId: 'q1' })).toBe(false);
  });

  it('welcome のとき false になる', () => {
    expect(isOnboardingSurveyStep({ type: 'welcome' })).toBe(false);
  });
});

describe('ASSESSMENT_START_INDEX', () => {
  it('最初の assessment ステップのインデックスを指す', () => {
    expect(isAssessmentStep(STEPS[ASSESSMENT_START_INDEX])).toBe(true);
  });

  it('その前のステップは assessment ではない（調査スキップ先として使える）', () => {
    expect(isAssessmentStep(STEPS[ASSESSMENT_START_INDEX - 1])).toBe(false);
  });

  it('EDUCATION_START_INDEX より前にある', () => {
    expect(ASSESSMENT_START_INDEX).toBeLessThan(EDUCATION_START_INDEX);
  });
});
