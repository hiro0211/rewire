import {
  ONBOARDING_SURVEY_QUESTIONS,
  FEEDBACK_SURVEY_QUESTIONS,
  SURVEY_QUESTIONS,
} from '@/constants/survey';
import { ja } from '@/locales/ja';
import { en } from '@/locales/en';

describe('ONBOARDING_SURVEY_QUESTIONS', () => {
  it('オンボーディング冒頭で答えられる3問だけを含む', () => {
    expect(ONBOARDING_SURVEY_QUESTIONS.map((q) => q.id)).toEqual([
      'age_range',
      'discovery_channel',
      'motivation',
    ]);
  });

  it('全問が必須である', () => {
    expect(ONBOARDING_SURVEY_QUESTIONS.every((q) => q.required)).toBe(true);
  });

  it('全問が choice 形式である（自由記述を含まない）', () => {
    expect(ONBOARDING_SURVEY_QUESTIONS.every((q) => q.type === 'choice')).toBe(true);
  });
});

describe('FEEDBACK_SURVEY_QUESTIONS', () => {
  it('利用実績がないと答えられない2問だけを含む', () => {
    expect(FEEDBACK_SURVEY_QUESTIONS.map((q) => q.id)).toEqual([
      'perceived_change',
      'free_text',
    ]);
  });

  it('free_text は任意回答である', () => {
    const freeText = FEEDBACK_SURVEY_QUESTIONS.find((q) => q.id === 'free_text')!;
    expect(freeText.required).toBe(false);
  });
});

describe('SURVEY_QUESTIONS', () => {
  it('後方互換のため2セットの連結と等しい', () => {
    expect(SURVEY_QUESTIONS).toEqual([
      ...ONBOARDING_SURVEY_QUESTIONS,
      ...FEEDBACK_SURVEY_QUESTIONS,
    ]);
  });
});

describe('discovery_channel の選択肢', () => {
  const question = ONBOARDING_SURVEY_QUESTIONS.find((q) => q.id === 'discovery_channel')!;

  it('SNS がプラットフォーム別に分割されている', () => {
    expect(question.options?.map((o) => o.value)).toEqual([
      'app_store',
      'tiktok',
      'instagram',
      'youtube',
      'x',
      'referral',
      'web_search',
      'other',
    ]);
  });

  it('まとめ選択肢の sns は選択肢から削除されている', () => {
    expect(question.options?.some((o) => o.value === 'sns')).toBe(false);
  });

  it('全選択肢のラベルが ja/en 両方に存在する', () => {
    const resolve = (dict: any, key: string) =>
      key.split('.').reduce((acc, part) => acc?.[part], dict);

    question.options?.forEach((option) => {
      expect(typeof resolve(ja, option.labelKey)).toBe('string');
      expect(typeof resolve(en, option.labelKey)).toBe('string');
    });
  });

  it('過去の回答値 sns のラベルキーは locale に残されている', () => {
    expect(typeof (ja as any).survey.discoveryChannel.sns).toBe('string');
    expect(typeof (en as any).survey.discoveryChannel.sns).toBe('string');
  });
});
