import {
  STREAK_TIERS,
  TIER_CONFIGS,
  getSubTextKey,
  type StreakTierName,
  type StreakTierConfig,
} from '@/constants/streakCelebration';

/** Pure function: determine streak tier from streak count and goal status */
export const getStreakTier = (streak: number, goalReached: boolean): StreakTierConfig => {
  if (goalReached) {
    const config = TIER_CONFIGS.milestone;
    return { ...config, subText: getSubTextKey('milestone', streak, true) };
  }

  let tierName: StreakTierName = 'basic';
  for (const [name, range] of Object.entries(STREAK_TIERS) as [StreakTierName, { min: number; max: number }][]) {
    if (streak >= range.min && streak <= range.max) {
      tierName = name;
      break;
    }
  }

  const config = TIER_CONFIGS[tierName];
  return { ...config, subText: getSubTextKey(tierName, streak, false) };
};
