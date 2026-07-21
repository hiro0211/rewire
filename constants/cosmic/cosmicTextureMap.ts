import type { BadgeId } from '@/constants/badges/BadgeId';

/**
 * 惑星ではない deep-sky バッジ（星雲・星団・銀河・ディープフィールド等）。
 * 球体ではないため惑星の球面マッピングではなく CosmicFieldRenderer で
 * 平面クロップ + ソフト放射状マスクの「発光する雲」として描画する。
 */
export const COSMIC_BADGE_IDS = [
  'stardust',
  'nebula',
  'protostar',
  'whiteDwarf',
  'stellarSystem',
  'starCluster',
  'galaxy',
  'cosmos',
] as const;

export type CosmicBadgeId = (typeof COSMIC_BADGE_IDS)[number];

const COSMIC_ID_SET = new Set<string>(COSMIC_BADGE_IDS);

export function hasCosmicTexture(badgeId: BadgeId | undefined): boolean {
  if (!badgeId) return false;
  return COSMIC_ID_SET.has(badgeId);
}

// require() は Metro が静的解析するため switch で展開する必要がある。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCosmicTexture(badgeId: BadgeId | undefined): any {
  switch (badgeId) {
    case 'stardust':
      return require('@/assets/images/cosmic/stardust-field.webp');
    case 'nebula':
      return require('@/assets/images/cosmic/nebula-field.webp');
    case 'protostar':
      return require('@/assets/images/cosmic/protostar-field.webp');
    case 'whiteDwarf':
      return require('@/assets/images/cosmic/whiteDwarf-field.webp');
    case 'stellarSystem':
      return require('@/assets/images/cosmic/stellarSystem-field.webp');
    case 'starCluster':
      return require('@/assets/images/cosmic/starCluster-field.webp');
    case 'galaxy':
      return require('@/assets/images/cosmic/galaxy-field.webp');
    case 'cosmos':
      return require('@/assets/images/cosmic/cosmos-field.webp');
    default:
      return null;
  }
}
