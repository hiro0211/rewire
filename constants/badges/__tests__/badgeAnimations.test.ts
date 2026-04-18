import { getOrbConfig } from '@/constants/orbConfig';
import { BADGE_ANIMATION_OVERRIDES, getBadgeAnimConfig } from '../badgeAnimations';

describe('BADGE_ANIMATION_OVERRIDES', () => {
  it('overrideを持たないバッジ（Stardust）はundefinedである', () => {
    expect(BADGE_ANIMATION_OVERRIDES['Stardust']).toBeUndefined();
  });

  it('Cosmosはoverride定義を持つ', () => {
    expect(BADGE_ANIMATION_OVERRIDES['Cosmos']).toBeDefined();
  });

  it('Nebulaはpulsationのみのpartial override定義を持つ', () => {
    const override = BADGE_ANIMATION_OVERRIDES['Nebula'];
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
    it('StardustはchaosのデフォルトpulseDurationを返す', () => {
      const result = getBadgeAnimConfig('Stardust', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.pulseDuration).toBe(chapterDefault.pulseDuration);
    });

    it('StardustはchaosのデフォルトparticleCountを返す', () => {
      const result = getBadgeAnimConfig('Stardust', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.particleCount).toBe(chapterDefault.particleCount);
    });

    it('StardustはchaosのデフォルトscaleMin/Maxを返す', () => {
      const result = getBadgeAnimConfig('Stardust', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.scaleMin).toBe(chapterDefault.scaleMin);
      expect(result.scaleMax).toBe(chapterDefault.scaleMax);
    });
  });

  describe('override あり → override値が反映される', () => {
    it('CosmosのpulseDurationはchapterデフォルト（1800ms）より短い', () => {
      const result = getBadgeAnimConfig('Cosmos', 'transcendence');
      const chapterDefault = getOrbConfig('transcendence');
      expect(result.pulseDuration).toBeLessThan(chapterDefault.pulseDuration);
    });

    it('CosmosのpulseDurationは1500msである', () => {
      const result = getBadgeAnimConfig('Cosmos', 'transcendence');
      expect(result.pulseDuration).toBe(1500);
    });
  });

  describe('Partial override — pulseDurationのみ上書き', () => {
    it('NebulaのpulseDurationはchaosデフォルト（4000ms）と異なる', () => {
      const result = getBadgeAnimConfig('Nebula', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.pulseDuration).not.toBe(chapterDefault.pulseDuration);
    });

    it('NebulaのparticleCountはchaosデフォルトにフォールバックする', () => {
      const result = getBadgeAnimConfig('Nebula', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.particleCount).toBe(chapterDefault.particleCount);
    });

    it('NebulaのscaleMinはchaosデフォルトにフォールバックする', () => {
      const result = getBadgeAnimConfig('Nebula', 'chaos');
      const chapterDefault = getOrbConfig('chaos');
      expect(result.scaleMin).toBe(chapterDefault.scaleMin);
    });
  });

  describe('全18バッジで型安全にconfigが取得できる', () => {
    it('全バッジのpulseDurationが正の数値である', () => {
      const allBadges: Array<{ id: import('../BadgeId').BadgeId; chapter: import('../BadgeChapter').ChapterId }> = [
        { id: 'Stardust', chapter: 'chaos' },
        { id: 'Nebula', chapter: 'chaos' },
        { id: 'Protostar', chapter: 'chaos' },
        { id: 'Ignition', chapter: 'ignition' },
        { id: 'MainSequence', chapter: 'ignition' },
        { id: 'Radiance', chapter: 'ignition' },
        { id: 'AccretionDisk', chapter: 'formation' },
        { id: 'Planetesimal', chapter: 'formation' },
        { id: 'PlanetaryBirth', chapter: 'formation' },
        { id: 'HabitableWorld', chapter: 'life' },
        { id: 'Biogenesis', chapter: 'life' },
        { id: 'Civilization', chapter: 'life' },
        { id: 'SolarSystem', chapter: 'expansion' },
        { id: 'BinaryStars', chapter: 'expansion' },
        { id: 'StarCluster', chapter: 'expansion' },
        { id: 'Galaxy', chapter: 'transcendence' },
        { id: 'GalaxyCluster', chapter: 'transcendence' },
        { id: 'Cosmos', chapter: 'transcendence' },
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
