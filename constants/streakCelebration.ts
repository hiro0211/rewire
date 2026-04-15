import type { ChapterId } from './badges/BadgeChapter';

export type StreakTierName = ChapterId;

export interface StreakTierConfig {
  name: StreakTierName;
  subText: string;
  hapticStyle: 'light' | 'medium' | 'heavy';
  showParticles: boolean;
  showGlow: boolean;
  showConfetti: boolean;
}

export const TIER_CONFIGS: Record<ChapterId, Omit<StreakTierConfig, 'subText'>> = {
  chaos: {
    name: 'chaos',
    hapticStyle: 'light',
    showParticles: false,
    showGlow: false,
    showConfetti: false,
  },
  ignition: {
    name: 'ignition',
    hapticStyle: 'medium',
    showParticles: true,
    showGlow: false,
    showConfetti: false,
  },
  formation: {
    name: 'formation',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: false,
  },
  life: {
    name: 'life',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
  expansion: {
    name: 'expansion',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
  transcendence: {
    name: 'transcendence',
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

/** Get sub text key for a streak tier and day count */
export const getSubTextKey = (_tier: StreakTierName, _streak: number, goalReached: boolean): string => {
  if (goalReached) return 'streak.goalReached';
  return 'streak.daysAchieved';
};
