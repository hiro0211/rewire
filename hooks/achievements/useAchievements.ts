import { useMemo } from 'react';
import { useStreak } from '@/hooks/dashboard/useStreak';
import {
  computeAchievements,
  getUnlockedBadges,
  getNextBadge,
  getNextBadgeProgress,
  getAchievementSummary,
} from '@/features/achievements/achievementCalculator';

export function useAchievements() {
  const { streak } = useStreak();

  const achievements = useMemo(() => computeAchievements(streak), [streak]);
  const unlocked = useMemo(() => getUnlockedBadges(streak), [streak]);
  const nextBadge = useMemo(() => getNextBadge(streak), [streak]);
  const nextBadgeProgress = useMemo(() => getNextBadgeProgress(streak), [streak]);
  const summary = useMemo(() => getAchievementSummary(streak), [streak]);

  return {
    achievements,
    unlocked,
    nextBadge,
    nextBadgeProgress,
    summary,
    streak,
  };
}
