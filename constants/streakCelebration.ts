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
  birth: {
    name: 'birth',
    hapticStyle: 'light',
    showParticles: false,
    showGlow: false,
    showConfetti: false,
  },
  innerPlanets: {
    name: 'innerPlanets',
    hapticStyle: 'medium',
    showParticles: true,
    showGlow: false,
    showConfetti: false,
  },
  terrestrial: {
    name: 'terrestrial',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: false,
  },
  outerPlanets: {
    name: 'outerPlanets',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
  stellar: {
    name: 'stellar',
    hapticStyle: 'heavy',
    showParticles: true,
    showGlow: true,
    showConfetti: true,
  },
  cosmic: {
    name: 'cosmic',
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
  singleStepDuration: 700,
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
