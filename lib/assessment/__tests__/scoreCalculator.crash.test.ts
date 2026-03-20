import { calculateScore, getScoreLevel } from '../scoreCalculator';

describe('scoreCalculator crash prevention', () => {
  describe('calculateScore', () => {
    it('空のanswers → 0', () => {
      expect(calculateScore({})).toBe(0);
    });

    it('存在しないquestionIdの回答 → クラッシュしない', () => {
      expect(() => calculateScore({ nonexistent: 'value' })).not.toThrow();
    });

    it('不正な値の回答 → クラッシュしない', () => {
      expect(() => calculateScore({ startAge: 'nonexistent_option' })).not.toThrow();
    });

    it('全質問に「最大スコア」回答', () => {
      const answers = {
        startAge: 'under12',
        currentAge: '15',
        frequency: 'multiple_daily',
        escalation: 'yes',
        increasing: 'yes',
        stressCoping: 'yes',
        boredomCoping: 'yes',
        failedControl: 'yes',
        dailyImpact: 'yes',
      };
      const score = calculateScore(answers);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(29);
    });

    it('choice質問にyes/noを入れても クラッシュしない', () => {
      expect(() => calculateScore({ startAge: 'yes' })).not.toThrow();
    });

    it('yesno質問にchoice値を入れても クラッシュしない', () => {
      expect(() => calculateScore({ escalation: 'under12' })).not.toThrow();
      expect(calculateScore({ escalation: 'under12' })).toBe(0);
    });

    it('picker質問の回答はスコアに影響しない', () => {
      expect(calculateScore({ currentAge: '25' })).toBe(0);
    });

    it('null/undefinedを含むanswersオブジェクト → クラッシュしない', () => {
      expect(() => calculateScore({ startAge: undefined as any })).not.toThrow();
      expect(() => calculateScore({ startAge: null as any })).not.toThrow();
    });
  });

  describe('getScoreLevel', () => {
    it('スコア0 → 最低レベル', () => {
      const level = getScoreLevel(0);
      expect(level.labelKey).toBe('assessment.score.low.label');
    });

    it('スコア29 → 最高レベル', () => {
      const level = getScoreLevel(29);
      expect(level.labelKey).toBe('assessment.score.severe.label');
    });

    it('スコア7 → 境界値テスト', () => {
      expect(getScoreLevel(7).labelKey).toBe('assessment.score.low.label');
      expect(getScoreLevel(8).labelKey).toBe('assessment.score.moderate.label');
    });

    it('スコア14 → 境界値テスト', () => {
      expect(getScoreLevel(14).labelKey).toBe('assessment.score.moderate.label');
      expect(getScoreLevel(15).labelKey).toBe('assessment.score.high.label');
    });

    it('スコア21 → 境界値テスト', () => {
      expect(getScoreLevel(21).labelKey).toBe('assessment.score.high.label');
      expect(getScoreLevel(22).labelKey).toBe('assessment.score.severe.label');
    });

    it('負のスコア → クラッシュしない', () => {
      expect(() => getScoreLevel(-1)).not.toThrow();
    });

    it('巨大スコア → 最高レベルを返す', () => {
      const level = getScoreLevel(9999);
      expect(level.labelKey).toBe('assessment.score.severe.label');
    });
  });
});
