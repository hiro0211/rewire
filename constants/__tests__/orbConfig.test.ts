import { ORB_TIERS, getOrbConfig } from '../orbConfig';
import type { GrowthStageName } from '../growthStages';

describe('orbConfig', () => {
  describe('ORB_TIERS', () => {
    it('sparkティアはブルー系の色を持つ', () => {
      const tier = ORB_TIERS.spark;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(4000);
    });

    it('dawnティアはパープル系でsparkより速いパルス', () => {
      const tier = ORB_TIERS.dawn;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(3500);
      expect(tier.pulseDuration).toBeLessThan(ORB_TIERS.spark.pulseDuration);
    });

    it('nebulaティアはシアン→パープル系', () => {
      const tier = ORB_TIERS.nebula;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(3000);
    });

    it('galaxyティアはnebulaより速いパルスで3色グラデーション', () => {
      const tier = ORB_TIERS.galaxy;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(2500);
      expect(tier.pulseDuration).toBeLessThan(ORB_TIERS.nebula.pulseDuration);
    });

    it('cosmosティアは最速パルスで3色グラデーション', () => {
      const tier = ORB_TIERS.cosmos;
      expect(tier.colors).toHaveLength(3);
      expect(tier.pulseDuration).toBe(2000);
      expect(tier.pulseDuration).toBeLessThan(ORB_TIERS.galaxy.pulseDuration);
    });

    it('全ティアがscaleMin/scaleMaxを持つ', () => {
      const tierNames: GrowthStageName[] = ['spark', 'dawn', 'nebula', 'galaxy', 'cosmos'];
      for (const name of tierNames) {
        const tier = ORB_TIERS[name];
        expect(tier.scaleMin).toBeLessThan(tier.scaleMax);
      }
    });
  });

  describe('getOrbConfig', () => {
    it('sparkで正しい設定を返す', () => {
      expect(getOrbConfig('spark')).toBe(ORB_TIERS.spark);
    });

    it('各ティア名で正しい設定を返す', () => {
      expect(getOrbConfig('dawn')).toBe(ORB_TIERS.dawn);
      expect(getOrbConfig('nebula')).toBe(ORB_TIERS.nebula);
      expect(getOrbConfig('galaxy')).toBe(ORB_TIERS.galaxy);
      expect(getOrbConfig('cosmos')).toBe(ORB_TIERS.cosmos);
    });
  });
});
