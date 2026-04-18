import type { ChapterId } from './badges/BadgeChapter';

export interface OrbTierConfig {
  pulseDuration: number;
  scaleMin: number;
  scaleMax: number;
  particleCount: number;
}

export const ORB_CHAPTERS: Record<ChapterId, OrbTierConfig> = {
  chaos: {
    pulseDuration: 4000,
    scaleMin: 0.96,
    scaleMax: 1.04,
    particleCount: 4,
  },
  ignition: {
    pulseDuration: 3500,
    scaleMin: 0.95,
    scaleMax: 1.05,
    particleCount: 6,
  },
  formation: {
    pulseDuration: 3000,
    scaleMin: 0.94,
    scaleMax: 1.06,
    particleCount: 7,
  },
  life: {
    pulseDuration: 2600,
    scaleMin: 0.93,
    scaleMax: 1.07,
    particleCount: 8,
  },
  expansion: {
    pulseDuration: 2200,
    scaleMin: 0.92,
    scaleMax: 1.08,
    particleCount: 9,
  },
  transcendence: {
    pulseDuration: 1800,
    scaleMin: 0.91,
    scaleMax: 1.09,
    particleCount: 10,
  },
};

export const getOrbConfig = (chapterId: ChapterId): OrbTierConfig =>
  ORB_CHAPTERS[chapterId];
