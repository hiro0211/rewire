import { useMemo } from 'react';
import { DEBUG_UNLOCK_DAYS } from '@/constants/debug';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useDebugUnlockAll } from '@/hooks/debug/useDebugUnlockAll';
import {
  computeAchievements,
  getUnlockedBadges,
  getNextBadge,
  getNextBadgeProgress,
  getAchievementSummary,
} from '@/features/achievements/achievementCalculator';

export function useAchievements() {
  const { streak } = useStreak();
  const debugUnlockAll = useDebugUnlockAll();

  // デバッグ全解放時はストリークを最大扱いにして全バッジをアンロック表示する。
  const effectiveStreak = debugUnlockAll ? DEBUG_UNLOCK_DAYS : streak;

  const achievements = useMemo(() => computeAchievements(effectiveStreak), [effectiveStreak]);
  const unlocked = useMemo(() => getUnlockedBadges(effectiveStreak), [effectiveStreak]);
  const nextBadge = useMemo(() => getNextBadge(effectiveStreak), [effectiveStreak]);
  const nextBadgeProgress = useMemo(() => getNextBadgeProgress(effectiveStreak), [effectiveStreak]);
  const summary = useMemo(() => getAchievementSummary(effectiveStreak), [effectiveStreak]);

  return {
    achievements,
    unlocked,
    nextBadge,
    nextBadgeProgress,
    summary,
    streak: effectiveStreak,
  };
}
