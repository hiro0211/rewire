import { surveyValidator } from '../surveyValidator';
import {
  ONBOARDING_SURVEY_QUESTIONS,
  FEEDBACK_SURVEY_QUESTIONS,
} from '@/constants/survey';

jest.mock('@/locales/i18n', () => ({
  // Mirrors i18n interpolation so the {{ids}} payload stays assertable.
  t: (key: string, options?: Record<string, string>) =>
    options ? `${key}: ${Object.values(options).join('|')}` : key,
}));

describe('surveyValidator', () => {
  describe('validate（オンボーディング質問セット）', () => {
    const validAnswers: Record<string, string> = {
      age_range: '25-34',
      discovery_channel: 'tiktok',
      motivation: 'self_control',
    };

    it('オンボーディング必須質問に全回答済みならOKを返す', () => {
      expect(
        surveyValidator.validate(validAnswers, ONBOARDING_SURVEY_QUESTIONS),
      ).toEqual({ ok: true });
    });

    it('フィードバック質問が未回答でもOKを返す（対象セット外のため）', () => {
      const result = surveyValidator.validate(validAnswers, ONBOARDING_SURVEY_QUESTIONS);
      expect(result).toEqual({ ok: true });
    });

    it('必須質問が1つ未回答ならエラーを返す', () => {
      const { motivation, ...rest } = validAnswers;
      const result = surveyValidator.validate(rest, ONBOARDING_SURVEY_QUESTIONS);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('motivation');
      }
    });

    it('空文字列の回答は未回答とみなす', () => {
      const result = surveyValidator.validate(
        { ...validAnswers, age_range: '' },
        ONBOARDING_SURVEY_QUESTIONS,
      );
      expect(result.ok).toBe(false);
    });

    it('全必須質問が未回答ならエラーを返す', () => {
      expect(surveyValidator.validate({}, ONBOARDING_SURVEY_QUESTIONS).ok).toBe(false);
    });

    it('既存の i18n キー survey.validationError を使う', () => {
      const result = surveyValidator.validate({}, ONBOARDING_SURVEY_QUESTIONS);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('survey.validationError');
      }
    });
  });

  describe('validate（フィードバック質問セット）', () => {
    it('perceived_change のみで OK を返す（オンボ質問は要求しない）', () => {
      const result = surveyValidator.validate(
        { perceived_change: 'slight' },
        FEEDBACK_SURVEY_QUESTIONS,
      );
      expect(result).toEqual({ ok: true });
    });

    it('任意質問(free_text)が未回答でもOKを返す', () => {
      const result = surveyValidator.validate(
        { perceived_change: 'slight' },
        FEEDBACK_SURVEY_QUESTIONS,
      );
      expect(result).toEqual({ ok: true });
    });

    it('perceived_change が未回答ならエラーを返す', () => {
      const result = surveyValidator.validate({ free_text: 'メモ' }, FEEDBACK_SURVEY_QUESTIONS);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('perceived_change');
      }
    });
  });
});
