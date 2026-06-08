import type { BadgeId } from '@/constants/badges/BadgeId';

export const PLANET_BADGE_IDS = [
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

export type PlanetBadgeId = (typeof PLANET_BADGE_IDS)[number];

const PLANET_ID_SET = new Set<string>(PLANET_BADGE_IDS);

export function hasPlanetTexture(badgeId: BadgeId | undefined): boolean {
  if (!badgeId) return false;
  return PLANET_ID_SET.has(badgeId);
}

// require() は Metro が静的解析するため switch で展開する必要がある。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPlanetTexture(badgeId: BadgeId | undefined): any {
  switch (badgeId) {
    case 'mercury':
      return require('@/assets/images/planets/mercury-equirect.webp');
    case 'venus':
      return require('@/assets/images/planets/venus-equirect.webp');
    case 'earth':
      return require('@/assets/images/planets/earth-equirect.webp');
    case 'mars':
      return require('@/assets/images/planets/mars-equirect.webp');
    case 'jupiter':
      return require('@/assets/images/planets/jupiter-equirect.webp');
    case 'saturn':
      return require('@/assets/images/planets/saturn-equirect.webp');
    case 'uranus':
      return require('@/assets/images/planets/uranus-equirect.webp');
    case 'neptune':
      return require('@/assets/images/planets/neptune-equirect.webp');
    case 'moon':
      return require('@/assets/images/planets/moon-equirect.webp');
    case 'sun':
      return require('@/assets/images/planets/sun-equirect.webp');
    default:
      return null;
  }
}
