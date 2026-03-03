import { getStreakTier } from '../useStreakTier';

describe('getStreakTier', () => {
  describe('基本ティア判定（goalReached=false）', () => {
    it('streak=0 のとき basic を返す', () => {
      const result = getStreakTier(0, false);
      expect(result.name).toBe('basic');
    });

    it('streak=6 のとき basic を返す', () => {
      const result = getStreakTier(6, false);
      expect(result.name).toBe('basic');
    });

    it('streak=7 のとき weekly を返す', () => {
      const result = getStreakTier(7, false);
      expect(result.name).toBe('weekly');
    });

    it('streak=29 のとき weekly を返す', () => {
      const result = getStreakTier(29, false);
      expect(result.name).toBe('weekly');
    });

    it('streak=30 のとき monthly を返す', () => {
      const result = getStreakTier(30, false);
      expect(result.name).toBe('monthly');
    });

    it('streak=89 のとき monthly を返す', () => {
      const result = getStreakTier(89, false);
      expect(result.name).toBe('monthly');
    });

    it('streak=90 のとき milestone を返す', () => {
      const result = getStreakTier(90, false);
      expect(result.name).toBe('milestone');
    });

    it('streak=365 のとき milestone を返す', () => {
      const result = getStreakTier(365, false);
      expect(result.name).toBe('milestone');
    });
  });

  describe('goalReached=true のとき milestone を返す', () => {
    it('streak=7, goalReached=true → milestone', () => {
      const result = getStreakTier(7, true);
      expect(result.name).toBe('milestone');
    });

    it('streak=1, goalReached=true → milestone', () => {
      const result = getStreakTier(1, true);
      expect(result.name).toBe('milestone');
    });
  });

  describe('サブテキスト', () => {
    it('basic tier は "N日達成！" を返す', () => {
      const result = getStreakTier(3, false);
      expect(result.subText).toBe('3日達成！');
    });

    it('streak=0 は "0日達成！" を返す', () => {
      const result = getStreakTier(0, false);
      expect(result.subText).toBe('0日達成！');
    });

    it('weekly tier は "N日達成！" を返す', () => {
      const result = getStreakTier(7, false);
      expect(result.subText).toBe('7日達成！');
    });

    it('monthly tier は "N日達成！" を返す', () => {
      const result = getStreakTier(30, false);
      expect(result.subText).toBe('30日達成！');
    });

    it('milestone tier は "N日達成！" を返す', () => {
      const result = getStreakTier(90, false);
      expect(result.subText).toBe('90日達成！');
    });

    it('goalReached=true のとき "目標達成！" を返す', () => {
      const result = getStreakTier(5, true);
      expect(result.subText).toBe('目標達成！');
    });
  });

  describe('エフェクト設定', () => {
    it('basic tier はエフェクトなし', () => {
      const result = getStreakTier(3, false);
      expect(result.showParticles).toBe(false);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('light');
    });

    it('weekly tier はパーティクルのみ', () => {
      const result = getStreakTier(7, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('medium');
    });

    it('monthly tier はパーティクル+グロー', () => {
      const result = getStreakTier(30, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('milestone tier は全エフェクト', () => {
      const result = getStreakTier(90, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });
  });
});
