import type { StreakTierName } from './streakCelebration';

export interface OrbTierConfig {
  colors: readonly [string, string, string];
  pulseDuration: number;
  scaleMin: number;
  scaleMax: number;
}

export const ORB_TIERS: Record<StreakTierName, OrbTierConfig> = {
  basic: {
    colors: ['#4A90D9', '#5B7FD6', '#3A6BC5'],
    pulseDuration: 4000,
    scaleMin: 0.95,
    scaleMax: 1.05,
  },
  weekly: {
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    pulseDuration: 3500,
    scaleMin: 0.94,
    scaleMax: 1.06,
  },
  monthly: {
    colors: ['#00D4FF', '#8B5CF6', '#6D28D9'],
    pulseDuration: 3000,
    scaleMin: 0.93,
    scaleMax: 1.07,
  },
  milestone: {
    colors: ['#3DD68C', '#00D4FF', '#8B5CF6'],
    pulseDuration: 2500,
    scaleMin: 0.92,
    scaleMax: 1.08,
  },
};

export const getOrbConfig = (tierName: StreakTierName): OrbTierConfig =>
  ORB_TIERS[tierName];
