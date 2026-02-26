import { BADGES, type BadgeDefinition } from '@/constants/badges';

export interface AchievementStatus {
  badge: BadgeDefinition;
  isUnlocked: boolean;
}

export function computeAchievements(streak: number): AchievementStatus[] {
  return BADGES.map((badge) => ({
    badge,
    isUnlocked: streak >= badge.requiredDays,
  }));
}

export function getUnlockedBadges(streak: number): BadgeDefinition[] {
  return BADGES.filter((badge) => streak >= badge.requiredDays);
}

export function getNextBadge(streak: number): BadgeDefinition | null {
  return BADGES.find((badge) => badge.requiredDays > streak) ?? null;
}

export function getNextBadgeProgress(streak: number): number {
  const next = getNextBadge(streak);
  if (!next) return 1;

  const prevIndex = BADGES.indexOf(next) - 1;
  const prevDays = prevIndex >= 0 ? BADGES[prevIndex].requiredDays : 0;
  const range = next.requiredDays - prevDays;
  if (range === 0) return 1;

  return (streak - prevDays) / range;
}

export function getAchievementSummary(streak: number) {
  const unlocked = getUnlockedBadges(streak).length;
  const total = BADGES.length;
  return {
    total,
    unlocked,
    percentage: Math.round((unlocked / total) * 100),
  };
}
