import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';
import {
  COSMIC_BADGE_IDS,
  hasCosmicTexture,
} from '@/constants/cosmic/cosmicTextureMap';
import {
  PLANET_BADGE_IDS,
  hasPlanetTexture,
} from '@/constants/planets/planetTextureMap';

/**
 * 不変条件: すべてのバッジが「惑星テクスチャ」か「宇宙フィールドテクスチャ」の
 * どちらか一方を必ず持つ。新規バッジ追加時のテクスチャ付け忘れを検知する。
 */
describe('バッジ テクスチャ網羅性', () => {
  it('全 18 バッジが planet か cosmic のどちらかのテクスチャを持つ', () => {
    for (const badge of BADGE_DEFINITIONS) {
      const covered =
        hasPlanetTexture(badge.id) || hasCosmicTexture(badge.id);
      expect({ id: badge.id, covered }).toEqual({ id: badge.id, covered: true });
    }
  });

  it('planet と cosmic は排他（両方を持つバッジは存在しない）', () => {
    for (const badge of BADGE_DEFINITIONS) {
      const both =
        hasPlanetTexture(badge.id) && hasCosmicTexture(badge.id);
      expect({ id: badge.id, both }).toEqual({ id: badge.id, both: false });
    }
  });

  it('planet 10 + cosmic 8 = 全バッジ数 18', () => {
    expect(PLANET_BADGE_IDS.length + COSMIC_BADGE_IDS.length).toBe(
      BADGE_DEFINITIONS.length,
    );
    expect(BADGE_DEFINITIONS.length).toBe(18);
  });

  it('BadgeId のすべてのメンバーがどちらかの配列に含まれる', () => {
    const allTextureIds = new Set<string>([
      ...PLANET_BADGE_IDS,
      ...COSMIC_BADGE_IDS,
    ]);
    for (const badge of BADGE_DEFINITIONS) {
      expect(allTextureIds.has(badge.id)).toBe(true);
    }
    expect(allTextureIds.size).toBe(18);
  });
});
