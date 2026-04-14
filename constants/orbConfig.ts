import type { GrowthStageName } from './growthStages';

export interface OrbTierConfig {
  colors: readonly [string, string, string];
  pulseDuration: number;
  scaleMin: number;
  scaleMax: number;
}

export const ORB_TIERS: Record<GrowthStageName, OrbTierConfig> = {
  spark: {
    colors: ['#4A90D9', '#5B7FD6', '#3A6BC5'],
    pulseDuration: 4000,
    scaleMin: 0.95,
    scaleMax: 1.05,
  },
  dawn: {
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    pulseDuration: 3500,
    scaleMin: 0.94,
    scaleMax: 1.06,
  },
  nebula: {
    colors: ['#00D4FF', '#8B5CF6', '#6D28D9'],
    pulseDuration: 3000,
    scaleMin: 0.93,
    scaleMax: 1.07,
  },
  galaxy: {
    colors: ['#3DD68C', '#00D4FF', '#8B5CF6'],
    pulseDuration: 2500,
    scaleMin: 0.92,
    scaleMax: 1.08,
  },
  cosmos: {
    colors: ['#FFD700', '#3DD68C', '#00D4FF'],
    pulseDuration: 2000,
    scaleMin: 0.91,
    scaleMax: 1.09,
  },
};

export const getOrbConfig = (tierName: GrowthStageName): OrbTierConfig =>
  ORB_TIERS[tierName];
