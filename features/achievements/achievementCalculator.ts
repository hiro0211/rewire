import {
  BADGE_DEFINITIONS,
  type NeuralBadgeDefinition,
} from '@/constants/badges/BADGE_DEFINITIONS';

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

export function getNextBadge(streak: number): NeuralBadgeDefinition | null {
  return BADGE_DEFINITIONS.find((badge) => badge.day > streak) ?? null;
}

export function getNextBadgeProgress(streak: number): number {
  const next = getNextBadge(streak);
  if (!next) return 1;

  const prevIndex = BADGE_DEFINITIONS.indexOf(next) - 1;
  const prevDays = prevIndex >= 0 ? BADGE_DEFINITIONS[prevIndex].day : 0;
  const range = next.day - prevDays;
  if (range === 0) return 1;

  return (streak - prevDays) / range;
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
