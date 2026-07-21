import {
  COSMIC_BADGE_IDS,
  getCosmicTexture,
  hasCosmicTexture,
} from '@/constants/cosmic/cosmicTextureMap';

const PLANET_IDS = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'moon',
  'sun',
] as const;

describe('cosmicTextureMap', () => {
  describe('COSMIC_BADGE_IDS', () => {
    it('非惑星の deep-sky バッジ 8 種を含む', () => {
      expect(COSMIC_BADGE_IDS).toEqual(
        expect.arrayContaining([
          'stardust',
          'nebula',
          'protostar',
          'whiteDwarf',
          'stellarSystem',
          'starCluster',
          'galaxy',
          'cosmos',
        ]),
      );
      expect(COSMIC_BADGE_IDS).toHaveLength(8);
    });
  });

  describe('hasCosmicTexture', () => {
    it.each([
      'stardust',
      'nebula',
      'protostar',
      'whiteDwarf',
      'stellarSystem',
      'starCluster',
      'galaxy',
      'cosmos',
    ] as const)('%s は true を返す', (id) => {
      expect(hasCosmicTexture(id)).toBe(true);
    });

    it.each(PLANET_IDS)('惑星バッジ %s は false を返す', (id) => {
      expect(hasCosmicTexture(id)).toBe(false);
    });

    it('undefined は false を返す', () => {
      expect(hasCosmicTexture(undefined)).toBe(false);
    });
  });

  describe('getCosmicTexture', () => {
    it.each([
      'stardust',
      'nebula',
      'protostar',
      'whiteDwarf',
      'stellarSystem',
      'starCluster',
      'galaxy',
      'cosmos',
    ] as const)('%s は truthy な asset を返す', (id) => {
      expect(getCosmicTexture(id)).toBeTruthy();
    });

    it('惑星バッジは null を返す', () => {
      expect(getCosmicTexture('earth')).toBeNull();
    });

    it('undefined は null を返す', () => {
      expect(getCosmicTexture(undefined)).toBeNull();
    });
  });
});
