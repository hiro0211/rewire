import {
  TIER_CONFIGS,
  getSubTextKey,
  type StreakTierConfig,
} from '@/constants/streakCelebration';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';

/** Pure function: determine streak tier from streak count and goal status */
export const getStreakTier = (streak: number, goalReached: boolean): StreakTierConfig => {
  const badge = getBadgeByDay(streak);
  const config = TIER_CONFIGS[badge.chapter];
  return { ...config, subText: getSubTextKey(badge.chapter, streak, goalReached) };
};
