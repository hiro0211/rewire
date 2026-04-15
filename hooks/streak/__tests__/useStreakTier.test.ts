import { getStreakTier } from '../useStreakTier';

describe('getStreakTier', () => {
  describe('6章ベースのティア判定（goalReached=false）', () => {
    it('streak=0 のとき chaos を返す', () => {
      expect(getStreakTier(0, false).name).toBe('chaos');
    });

    it('streak=6 のとき chaos を返す', () => {
      expect(getStreakTier(6, false).name).toBe('chaos');
    });

    it('streak=7 のとき ignition を返す', () => {
      expect(getStreakTier(7, false).name).toBe('ignition');
    });

    it('streak=29 のとき ignition を返す', () => {
      expect(getStreakTier(29, false).name).toBe('ignition');
    });

    it('streak=30 のとき formation を返す', () => {
      expect(getStreakTier(30, false).name).toBe('formation');
    });

    it('streak=89 のとき formation を返す', () => {
      expect(getStreakTier(89, false).name).toBe('formation');
    });

    it('streak=90 のとき life を返す', () => {
      expect(getStreakTier(90, false).name).toBe('life');
    });

    it('streak=269 のとき life を返す', () => {
      expect(getStreakTier(269, false).name).toBe('life');
    });

    it('streak=270 のとき expansion を返す', () => {
      expect(getStreakTier(270, false).name).toBe('expansion');
    });

    it('streak=729 のとき expansion を返す', () => {
      expect(getStreakTier(729, false).name).toBe('expansion');
    });

    it('streak=730 のとき transcendence を返す', () => {
      expect(getStreakTier(730, false).name).toBe('transcendence');
    });

    it('streak=1000 のとき transcendence を返す', () => {
      expect(getStreakTier(1000, false).name).toBe('transcendence');
    });
  });

  describe('goalReached=true のとき対応チャプターの設定を返す', () => {
    it('streak=7, goalReached=true → ignition + goalReached', () => {
      const result = getStreakTier(7, true);
      expect(result.name).toBe('ignition');
      expect(result.subText).toBe('streak.goalReached');
    });

    it('streak=1, goalReached=true → chaos + goalReached', () => {
      const result = getStreakTier(1, true);
      expect(result.name).toBe('chaos');
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
    it('chaos はエフェクトなし、lightハプティクス', () => {
      const result = getStreakTier(3, false);
      expect(result.showParticles).toBe(false);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('light');
    });

    it('ignition はパーティクルのみ、mediumハプティクス', () => {
      const result = getStreakTier(7, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(false);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('medium');
    });

    it('formation はパーティクル+グロー、heavyハプティクス', () => {
      const result = getStreakTier(30, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(false);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('life は全エフェクト', () => {
      const result = getStreakTier(90, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('expansion は全エフェクト', () => {
      const result = getStreakTier(270, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });

    it('transcendence は全エフェクト', () => {
      const result = getStreakTier(730, false);
      expect(result.showParticles).toBe(true);
      expect(result.showGlow).toBe(true);
      expect(result.showConfetti).toBe(true);
      expect(result.hapticStyle).toBe('heavy');
    });
  });
});
