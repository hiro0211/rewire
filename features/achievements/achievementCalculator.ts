import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';

export { getNextBadge } from '@/lib/badges/getNextBadge';
export { getBadgeProgress as getNextBadgeProgress } from '@/lib/badges/getBadgeProgress';

export interface AchievementStatus {
  badge: NeuralBadgeDefinition;
  isUnlocked: boolean;
}

export function computeAchievements(streak: number): AchievementStatus[] {
  return BADGE_DEFINITIONS.map((badge) => ({
    badge,
    isUnlocked: streak >= badge.day,
  }));
}

export function getUnlockedBadges(streak: number): NeuralBadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((badge) => streak >= badge.day);
}

export function getAchievementSummary(streak: number) {
  const unlocked = getUnlockedBadges(streak).length;
  const total = BADGE_DEFINITIONS.length;
  return {
    total,
    unlocked,
    percentage: Math.round((unlocked / total) * 100),
  };
}
