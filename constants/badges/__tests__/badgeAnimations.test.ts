import { getOrbConfig } from '@/constants/orbConfig';
import { BADGE_ANIMATION_OVERRIDES, getBadgeAnimConfig } from '../badgeAnimations';

describe('BADGE_ANIMATION_OVERRIDES', () => {
  it('overrideを持たないバッジ（stardust）はundefinedである', () => {
    expect(BADGE_ANIMATION_OVERRIDES['stardust']).toBeUndefined();
  });

  it('cosmosはoverride定義を持つ', () => {
    expect(BADGE_ANIMATION_OVERRIDES['cosmos']).toBeDefined();
  });

  it('nebulaはpulsationのみのpartial override定義を持つ', () => {
    const override = BADGE_ANIMATION_OVERRIDES['nebula'];
    expect(override).toBeDefined();
    expect(override!.pulseDuration).toBeDefined();
    // particleCount は上書きされていない
    expect(override!.particleCount).toBeUndefined();
    // scaleMin/scaleMax も上書きされていない
    expect(override!.scaleMin).toBeUndefined();
    expect(override!.scaleMax).toBeUndefined();
  });
});

describe('getBadgeAnimConfig', () => {
  describe('override なし → chapterデフォルトにフォールバック', () => {
    it('stardustはbirthのデフォルトpulseDurationを返す', () => {
      const result = getBadgeAnimConfig('stardust', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.pulseDuration).toBe(chapterDefault.pulseDuration);
    });

    it('stardustはbirthのデフォルトparticleCountを返す', () => {
      const result = getBadgeAnimConfig('stardust', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.particleCount).toBe(chapterDefault.particleCount);
    });

    it('stardustはbirthのデフォルトscaleMin/Maxを返す', () => {
      const result = getBadgeAnimConfig('stardust', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.scaleMin).toBe(chapterDefault.scaleMin);
      expect(result.scaleMax).toBe(chapterDefault.scaleMax);
    });
  });

  describe('override あり → override値が反映される', () => {
    it('cosmosのpulseDurationはchapterデフォルト（1800ms）より短い', () => {
      const result = getBadgeAnimConfig('cosmos', 'cosmic');
      const chapterDefault = getOrbConfig('cosmic');
      expect(result.pulseDuration).toBeLessThan(chapterDefault.pulseDuration);
    });

    it('cosmosのpulseDurationは1500msである', () => {
      const result = getBadgeAnimConfig('cosmos', 'cosmic');
      expect(result.pulseDuration).toBe(1500);
    });
  });

  describe('Partial override — pulseDurationのみ上書き', () => {
    it('nebulaのpulseDurationはbirthデフォルト（4000ms）と異なる', () => {
      const result = getBadgeAnimConfig('nebula', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.pulseDuration).not.toBe(chapterDefault.pulseDuration);
    });

    it('nebulaのparticleCountはbirthデフォルトにフォールバックする', () => {
      const result = getBadgeAnimConfig('nebula', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.particleCount).toBe(chapterDefault.particleCount);
    });

    it('nebulaのscaleMinはbirthデフォルトにフォールバックする', () => {
      const result = getBadgeAnimConfig('nebula', 'birth');
      const chapterDefault = getOrbConfig('birth');
      expect(result.scaleMin).toBe(chapterDefault.scaleMin);
    });
  });

  describe('全18バッジで型安全にconfigが取得できる', () => {
    it('全バッジのpulseDurationが正の数値である', () => {
      const allBadges: Array<{ id: import('../BadgeId').BadgeId; chapter: import('../BadgeChapter').ChapterId }> = [
        { id: 'stardust', chapter: 'birth' },
        { id: 'nebula', chapter: 'birth' },
        { id: 'protostar', chapter: 'birth' },
        { id: 'moon', chapter: 'innerPlanets' },
        { id: 'mercury', chapter: 'innerPlanets' },
        { id: 'venus', chapter: 'innerPlanets' },
        { id: 'earth', chapter: 'terrestrial' },
        { id: 'mars', chapter: 'terrestrial' },
        { id: 'jupiter', chapter: 'terrestrial' },
        { id: 'saturn', chapter: 'outerPlanets' },
        { id: 'uranus', chapter: 'outerPlanets' },
        { id: 'neptune', chapter: 'outerPlanets' },
        { id: 'sun', chapter: 'stellar' },
        { id: 'whiteDwarf', chapter: 'stellar' },
        { id: 'stellarSystem', chapter: 'stellar' },
        { id: 'starCluster', chapter: 'cosmic' },
        { id: 'galaxy', chapter: 'cosmic' },
        { id: 'cosmos', chapter: 'cosmic' },
      ];

      for (const { id, chapter } of allBadges) {
        const config = getBadgeAnimConfig(id, chapter);
        expect(config.pulseDuration).toBeGreaterThan(0);
        expect(config.particleCount).toBeGreaterThan(0);
        expect(config.scaleMin).toBeGreaterThan(0);
        expect(config.scaleMax).toBeGreaterThan(0);
      }
    });
  });
});
