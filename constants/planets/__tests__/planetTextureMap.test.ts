import { existsSync } from 'fs';
import path from 'path';

import {
  PLANET_BADGE_IDS,
  getPlanetTexture,
  hasPlanetTexture,
} from '@/constants/planets/planetTextureMap';

const ASSETS_DIR = path.resolve(__dirname, '../../../assets/images/planets');

describe('planetTextureMap', () => {
  describe('PLANET_BADGE_IDS', () => {
    it('物理天体 10 種を含む（mercury〜sun + earth + moon）', () => {
      expect(PLANET_BADGE_IDS).toEqual(
        expect.arrayContaining([
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
        ]),
      );
      expect(PLANET_BADGE_IDS).toHaveLength(10);
    });
  });

  describe('hasPlanetTexture', () => {
    it.each([
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
    ] as const)('%s は true を返す', (id) => {
      expect(hasPlanetTexture(id)).toBe(true);
    });

    it.each([
      'stardust',
      'nebula',
      'protostar',
      'whiteDwarf',
      'stellarSystem',
      'starCluster',
      'galaxy',
      'cosmos',
    ] as const)('抽象バッジ %s は false を返す', (id) => {
      expect(hasPlanetTexture(id)).toBe(false);
    });

    it('undefined は false を返す', () => {
      expect(hasPlanetTexture(undefined)).toBe(false);
    });
  });

  describe('getPlanetTexture', () => {
    it.each(['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'sun'] as const)(
      '%s は truthy な asset を返す',
      (id) => {
        expect(getPlanetTexture(id)).toBeTruthy();
      },
    );

    it('抽象バッジは null を返す', () => {
      expect(getPlanetTexture('galaxy')).toBeNull();
    });
  });

  describe('テクスチャアセット', () => {
    it.each([
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
    ] as const)('%s-equirect.webp が assets/images/planets/ に存在する', (name) => {
      expect(existsSync(path.join(ASSETS_DIR, `${name}-equirect.webp`))).toBe(true);
    });

    it('旧 assets/images/earth-equirect.webp は削除済み（planets/ サブフォルダに集約）', () => {
      expect(existsSync(path.resolve(ASSETS_DIR, '../earth-equirect.webp'))).toBe(false);
    });
  });
});
