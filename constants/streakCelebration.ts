import type { GrowthStageName } from './growthStages';

export { type GrowthStageName } from './growthStages';

export const STREAK_TIERS = {
  spark: { min: 0, max: 6 },
  dawn: { min: 7, max: 29 },
  nebula: { min: 30, max: 89 },
  galaxy: { min: 90, max: 364 },
  cosmos: { min: 365, max: Infinity },
} as const;

export type StreakTierName = GrowthStageName;

export interface StreakTierConfig {
  name: StreakTierName;
  subText: string;
  hapticStyle: 'light' | 'medium' | 'heavy';
  showParticles: boolean;
  showGlow: boolean;
  showConfetti: boolean;
}

export const TIER_CONFIGS: Record<StreakTierName, Omit<StreakTierConfig, 'subText'>> = {
  spark: {
    name: 'spark',
    hapticStyle: 'light',
    showParticles: false,
    showGlow: false,
    showConfetti: false,
  },
  dawn: {
    name: 'dawn',
    hapticStyle: 'medium',
    showParticles: true,
    showGlow: false,
    showConfetti: false,
  },
  nebula: {
    name: 'nebula',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: false,
  },
  galaxy: {
    name: 'galaxy',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
  cosmos: {
    name: 'cosmos',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
};

export const COUNT_UP_ANIMATION = {
  baseDuration: 800,
  perStreakIncrement: 15,
  maxDuration: 1500,
  bounceTo: 1.15,
  bounceBack: 1.0,
} as const;

/** Calculate count-up animation duration based on streak value */
export const getCountUpDuration = (streak: number): number =>
  Math.min(
    COUNT_UP_ANIMATION.baseDuration + streak * COUNT_UP_ANIMATION.perStreakIncrement,
    COUNT_UP_ANIMATION.maxDuration,
  );

/** Get sub text key and params for a streak tier and day count */
export const getSubTextKey = (_tier: StreakTierName, _streak: number, goalReached: boolean): string => {
  if (goalReached) return 'streak.goalReached';
  return 'streak.daysAchieved';
};
