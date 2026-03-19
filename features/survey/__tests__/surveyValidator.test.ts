import { surveyValidator } from '../surveyValidator';
import { SURVEY_QUESTIONS } from '@/constants/survey';

describe('surveyValidator', () => {
  describe('validate', () => {
    it('全必須質問に回答済みならOKを返す', () => {
      const answers: Record<string, string> = {
        age_range: '25-34',
        discovery_channel: 'sns',
        motivation: 'self_control',
        perceived_change: 'slight',
      };
      const result = surveyValidator.validate(answers);
      expect(result).toEqual({ ok: true });
    });

    it('任意質問(free_text)が未回答でもOKを返す', () => {
      const answers: Record<string, string> = {
        age_range: '25-34',
        discovery_channel: 'sns',
        motivation: 'self_control',
        perceived_change: 'slight',
      };
      const result = surveyValidator.validate(answers);
      expect(result).toEqual({ ok: true });
    });

    it('必須質問が1つ未回答ならエラーを返す', () => {
      const answers: Record<string, string> = {
        age_range: '25-34',
        discovery_channel: 'sns',
        motivation: 'self_control',
        // perceived_change が欠落
      };
      const result = surveyValidator.validate(answers);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('perceived_change');
      }
    });

    it('全必須質問が未回答ならエラーを返す', () => {
      const result = surveyValidator.validate({});
      expect(result.ok).toBe(false);
    });

    it('空文字列の回答は未回答とみなす', () => {
      const answers: Record<string, string> = {
        age_range: '',
        discovery_channel: 'sns',
        motivation: 'self_control',
        perceived_change: 'slight',
      };
      const result = surveyValidator.validate(answers);
      expect(result.ok).toBe(false);
    });
  });
});
