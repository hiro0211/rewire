import { getStreakTier } from '../useStreakTier';

describe('getStreakTier', () => {
  describe('基本ティア判定（goalReached=false）', () => {
    it('streak=0 のとき spark を返す', () => {
      const result = getStreakTier(0, false);
      expect(result.name).toBe('spark');
    });

    it('streak=6 のとき spark を返す', () => {
      const result = getStreakTier(6, false);
      expect(result.name).toBe('spark');
    });

    it('streak=7 のとき dawn を返す', () => {
      const result = getStreakTier(7, false);
      expect(result.name).toBe('dawn');
    });

    it('streak=29 のとき dawn を返す', () => {
      const result = getStreakTier(29, false);
      expect(result.name).toBe('dawn');
    });

    it('streak=30 のとき nebula を返す', () => {
      const result = getStreakTier(30, false);
      expect(result.name).toBe('nebula');
    });

    it('streak=89 のとき nebula を返す', () => {
      const result = getStreakTier(89, false);
      expect(result.name).toBe('nebula');
    });

    it('streak=90 のとき galaxy を返す', () => {
      const result = getStreakTier(90, false);
      expect(result.name).toBe('galaxy');
    });

    it('streak=364 のとき galaxy を返す', () => {
      const result = getStreakTier(364, false);
      expect(result.name).toBe('galaxy');
    });

    it('streak=365 のとき cosmos を返す', () => {
      const result = getStreakTier(365, false);
      expect(result.name).toBe('cosmos');
    });

    it('streak=1000 のとき cosmos を返す', () => {
      const result = getStreakTier(1000, false);
      expect(result.name).toBe('cosmos');
    });
  });

  describe('goalReached=true のとき対応ステージの設定を返す', () => {
    it('streak=7, goalReached=true → dawn', () => {
      const result = getStreakTier(7, true);
      expect(result.name).toBe('dawn');
      expect(result.subText).toBe('streak.goalReached');
    });

    it('streak=1, goalReached=true → spark', () => {
      const result = getStreakTier(1, true);
      expect(result.name).toBe('spark');
      expect(result.subText).toBe('streak.goalReached');
    });
  });

  describe('サブテキスト（翻訳キーを返す）', () => {
    it('spark tier は streak.daysAchieved キーを返す', () => {
      const result = getStreakTier(3, false);
      expect(result.subText).toBe('streak.daysAchieved');
    });

    it('streak=0 は streak.daysAchieved キーを返す', () => {
      const result = getStreakTier(0, false);
      expect(result.subText).toBe('streak.daysAchieved');
    });

    it('dawn tier は streak.daysAchieved キーを返す', () => {
      const result = getStreakTier(7, false);
      expect(result.subText).toBe('streak.daysAchieved');
    });

    it('nebula tier は streak.daysAchieved キーを返す', () => {
      const result = getStreakTier(30, false);
      expect(result.subText).toBe('streak.daysAchieved');
    });

    it('galaxy tier は streak.daysAchieved キーを返す', () => {
      const result = getStreakTier(90, false);
      expect(result.subText).toBe('streak.daysAchieved');
    });

    it('goalReached=true のとき streak.goalReached キーを返す', () => {
      const result = getStreakTier(5, true);
      expect(result.subText).toBe('streak.goalReached');
    });
  });

  describe('エフェクト設定', () => {
    it('spark tier はエフェクトなし', () => {
      const result = getStreakTier(3, false);
      expect(result.showParticles).toBe(false);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('light');
    });

    it('dawn tier はパーティクルのみ', () => {
      const result = getStreakTier(7, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('medium');
    });

    it('nebula tier はパーティクル+グロー', () => {
      const result = getStreakTier(30, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('galaxy tier は全エフェクト', () => {
      const result = getStreakTier(90, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('cosmos tier は全エフェクト', () => {
      const result = getStreakTier(365, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });
  });
});
