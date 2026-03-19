import { shouldShowSurveyPrompt } from '../surveyPromptEligibility';

describe('shouldShowSurveyPrompt', () => {
  const now = new Date('2026-03-18T12:00:00Z');

  describe('アンケート完了済み → 永久非表示', () => {
    it('completed=true → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: true,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: null,
          dismissCount: 0,
          now,
        })
      ).toBe(false);
    });
  });

  describe('アカウント作成から3日未満 → 非表示', () => {
    it('作成1日前 → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-03-17T12:00:00Z',
          lastPromptedAt: null,
          dismissCount: 0,
          now,
        })
      ).toBe(false);
    });

    it('作成ちょうど3日前 → true', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-03-15T12:00:00Z',
          lastPromptedAt: null,
          dismissCount: 0,
          now,
        })
      ).toBe(true);
    });
  });

  describe('dismiss 3回以上 → 永久非表示', () => {
    it('dismissCount=3 → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: '2026-01-01T00:00:00Z',
          dismissCount: 3,
          now,
        })
      ).toBe(false);
    });
  });

  describe('初回（未プロンプト） → 表示', () => {
    it('lastPromptedAt=null, dismissCount=0 → true', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: null,
          dismissCount: 0,
          now,
        })
      ).toBe(true);
    });
  });

  describe('dismiss後 → 7日間クールダウン', () => {
    it('dismiss後5日 → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: '2026-03-13T12:00:00Z',
          dismissCount: 1,
          now,
        })
      ).toBe(false);
    });

    it('dismiss後7日 → true', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: '2026-03-11T12:00:00Z',
          dismissCount: 1,
          now,
        })
      ).toBe(true);
    });
  });

  describe('dismiss 0回で前回表示から30日未満 → 非表示', () => {
    it('表示から15日後 → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: '2026-03-03T12:00:00Z',
          dismissCount: 0,
          now,
        })
      ).toBe(false);
    });

    it('表示から30日後 → true', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: '2026-01-01T00:00:00Z',
          lastPromptedAt: '2026-02-16T12:00:00Z',
          dismissCount: 0,
          now,
        })
      ).toBe(true);
    });
  });

  describe('accountCreatedAtがnull → 非表示', () => {
    it('accountCreatedAt=null → false', () => {
      expect(
        shouldShowSurveyPrompt({
          isCompleted: false,
          accountCreatedAt: null,
          lastPromptedAt: null,
          dismissCount: 0,
          now,
        })
      ).toBe(false);
    });
  });
});
