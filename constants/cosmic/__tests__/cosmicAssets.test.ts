import { existsSync, statSync } from 'fs';
import path from 'path';

/**
 * 宇宙フィールド（deep-sky）テクスチャのアセット予算ガード。
 * textureMap に依存しない純粋な fs テストとして、バンドル肥大の回帰を防ぐ。
 */

const COSMIC_DIR = path.resolve(__dirname, '../../../assets/images/cosmic');
const PLANETS_DIR = path.resolve(__dirname, '../../../assets/images/planets');

const COSMIC_TEXTURE_NAMES = [
  'stardust',
  'nebula',
  'protostar',
  'whiteDwarf',
  'stellarSystem',
  'starCluster',
  'galaxy',
  'cosmos',
] as const;

const PLANET_TEXTURE_NAMES = [
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

const KB = 1024;
const PER_FILE_MAX = 60 * KB;
const COSMIC_TOTAL_MAX = 400 * KB;
const IMAGE_ASSET_TOTAL_MAX = 890 * KB;

function cosmicPath(name: string): string {
  return path.join(COSMIC_DIR, `${name}-field.webp`);
}

function planetPath(name: string): string {
  return path.join(PLANETS_DIR, `${name}-equirect.webp`);
}

describe('cosmic テクスチャアセット予算', () => {
  it.each(COSMIC_TEXTURE_NAMES)(
    '%s-field.webp が assets/images/cosmic/ に存在する',
    (name) => {
      expect(existsSync(cosmicPath(name))).toBe(true);
    },
  );

  it.each(COSMIC_TEXTURE_NAMES)('%s-field.webp は 60KB 未満', (name) => {
    expect(statSync(cosmicPath(name)).size).toBeLessThan(PER_FILE_MAX);
  });

  it('cosmic 8 枚の合計が 400KB 未満', () => {
    const total = COSMIC_TEXTURE_NAMES.reduce(
      (sum, name) => sum + statSync(cosmicPath(name)).size,
      0,
    );
    expect(total).toBeLessThan(COSMIC_TOTAL_MAX);
  });

  it('planets + cosmic の画像アセット総計が 890KB 未満（回帰ガード）', () => {
    const planetsTotal = PLANET_TEXTURE_NAMES.reduce(
      (sum, name) => sum + statSync(planetPath(name)).size,
      0,
    );
    const cosmicTotal = COSMIC_TEXTURE_NAMES.reduce(
      (sum, name) => sum + statSync(cosmicPath(name)).size,
      0,
    );
    expect(planetsTotal + cosmicTotal).toBeLessThan(IMAGE_ASSET_TOTAL_MAX);
  });
});
