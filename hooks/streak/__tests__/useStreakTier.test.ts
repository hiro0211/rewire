import { getStreakTier } from '../useStreakTier';

describe('getStreakTier', () => {
  describe('6章ベースのティア判定（goalReached=false）', () => {
    it('streak=0 のとき birth を返す', () => {
      expect(getStreakTier(0, false).name).toBe('birth');
    });

    it('streak=6 のとき birth を返す', () => {
      expect(getStreakTier(6, false).name).toBe('birth');
    });

    it('streak=7 のとき innerPlanets を返す', () => {
      expect(getStreakTier(7, false).name).toBe('innerPlanets');
    });

    it('streak=29 のとき innerPlanets を返す', () => {
      expect(getStreakTier(29, false).name).toBe('innerPlanets');
    });

    it('streak=30 のとき terrestrial を返す', () => {
      expect(getStreakTier(30, false).name).toBe('terrestrial');
    });

    it('streak=89 のとき terrestrial を返す', () => {
      expect(getStreakTier(89, false).name).toBe('terrestrial');
    });

    it('streak=90 のとき outerPlanets を返す', () => {
      expect(getStreakTier(90, false).name).toBe('outerPlanets');
    });

    it('streak=269 のとき outerPlanets を返す', () => {
      expect(getStreakTier(269, false).name).toBe('outerPlanets');
    });

    it('streak=270 のとき stellar を返す', () => {
      expect(getStreakTier(270, false).name).toBe('stellar');
    });

    it('streak=729 のとき stellar を返す', () => {
      expect(getStreakTier(729, false).name).toBe('stellar');
    });

    it('streak=730 のとき cosmic を返す', () => {
      expect(getStreakTier(730, false).name).toBe('cosmic');
    });

    it('streak=1000 のとき cosmic を返す', () => {
      expect(getStreakTier(1000, false).name).toBe('cosmic');
    });
  });

  describe('goalReached=true のとき対応チャプターの設定を返す', () => {
    it('streak=7, goalReached=true → innerPlanets + goalReached', () => {
      const result = getStreakTier(7, true);
      expect(result.name).toBe('innerPlanets');
      expect(result.subText).toBe('streak.goalReached');
    });

    it('streak=1, goalReached=true → birth + goalReached', () => {
      const result = getStreakTier(1, true);
      expect(result.name).toBe('birth');
      expect(result.subText).toBe('streak.goalReached');
    });
  });

  describe('サブテキスト', () => {
    it('goalReached=false は streak.daysAchieved を返す', () => {
      expect(getStreakTier(3, false).subText).toBe('streak.daysAchieved');
    });

    it('goalReached=true は streak.goalReached を返す', () => {
      expect(getStreakTier(5, true).subText).toBe('streak.goalReached');
    });
  });

  describe('エフェクト設定', () => {
    it('birth はエフェクトなし、lightハプティクス', () => {
      const result = getStreakTier(3, false);
      expect(result.showParticles).toBe(false);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('light');
    });

    it('innerPlanets はパーティクルのみ、mediumハプティクス', () => {
      const result = getStreakTier(7, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('medium');
    });

    it('terrestrial はパーティクル+グロー、heavyハプティクス', () => {
      const result = getStreakTier(30, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('outerPlanets は全エフェクト', () => {
      const result = getStreakTier(90, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('stellar は全エフェクト', () => {
      const result = getStreakTier(270, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('cosmic は全エフェクト', () => {
      const result = getStreakTier(730, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });
  });
});
