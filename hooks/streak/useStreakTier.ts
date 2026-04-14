import {
  TIER_CONFIGS,
  getSubTextKey,
  type StreakTierConfig,
} from '@/constants/streakCelebration';
import { getGrowthStage } from '@/lib/streak/growthStage';

/** Pure function: determine streak tier from streak count and goal status */
export const getStreakTier = (streak: number, goalReached: boolean): StreakTierConfig => {
  if (goalReached) {
    const stage = getGrowthStage(streak);
    const config = TIER_CONFIGS[stage.name];
    return { ...config, subText: getSubTextKey(stage.name, streak, true) };
  }

  const stage = getGrowthStage(streak);
  const config = TIER_CONFIGS[stage.name];
  return { ...config, subText: getSubTextKey(stage.name, streak, false) };
};
