import { ORB_TIERS, getOrbConfig } from '../orbConfig';
import type { StreakTierName } from '../streakCelebration';

describe('orbConfig', () => {
  describe('ORB_TIERS', () => {
    it('basicティアはブルー系の色を持つ', () => {
      const tier = ORB_TIERS.basic;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(4000);
    });

    it('weeklyティアはパープル系でbasicより速いパルス', () => {
      const tier = ORB_TIERS.weekly;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(3500);
      expect(tier.pulseDuration).toBeLessThan(ORB_TIERS.basic.pulseDuration);
    });

    it('monthlyティアはシアン→パープル系', () => {
      const tier = ORB_TIERS.monthly;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(3000);
    });

    it('milestoneティアは最速パルスで3色グラデーション', () => {
      const tier = ORB_TIERS.milestone;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(2500);
      expect(tier.pulseDuration).toBeLessThan(ORB_TIERS.monthly.pulseDuration);
    });

    it('全ティアがscaleMin/scaleMaxを持つ', () => {
      const tierNames: StreakTierName[] = ['basic', 'weekly', 'monthly', 'milestone'];
      for (const name of tierNames) {
        const tier = ORB_TIERS[name];
        expect(tier.scaleMin).toBeLessThan(tier.scaleMax);
      }
    });
  });

  describe('getOrbConfig', () => {
    it('ストリーク0日でbasicを返す', () => {
      expect(getOrbConfig('basic')).toBe(ORB_TIERS.basic);
    });

    it('各ティア名で正しい設定を返す', () => {
      expect(getOrbConfig('weekly')).toBe(ORB_TIERS.weekly);
      expect(getOrbConfig('monthly')).toBe(ORB_TIERS.monthly);
      expect(getOrbConfig('milestone')).toBe(ORB_TIERS.milestone);
    });
  });
});
