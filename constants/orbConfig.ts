import type { ChapterId } from './badges/BadgeChapter';

export interface OrbTierConfig {
  colors: readonly [string, string, string];
  glowColor: string;
  pulseDuration: number;
  scaleMin: number;
  scaleMax: number;
}

export const ORB_CHAPTERS: Record<ChapterId, OrbTierConfig> = {
  chaos: {
    colors: ['#C9CBE0', '#F5F6FA', '#9E8CC4'],
    glowColor: 'rgba(201, 203, 224, 0.3)',
    pulseDuration: 4000,
    scaleMin: 0.96,
    scaleMax: 1.04,
  },
  ignition: {
    colors: ['#FFB547', '#FFE4A0', '#FF7847'],
    glowColor: 'rgba(255, 181, 71, 0.3)',
    pulseDuration: 3500,
    scaleMin: 0.95,
    scaleMax: 1.05,
  },
  formation: {
    colors: ['#D17842', '#F4C58A', '#8B3A0F'],
    glowColor: 'rgba(209, 120, 66, 0.3)',
    pulseDuration: 3000,
    scaleMin: 0.94,
    scaleMax: 1.06,
  },
  life: {
    colors: ['#4A90E2', '#A8D8F0', '#2B5F9E'],
    glowColor: 'rgba(74, 144, 226, 0.3)',
    pulseDuration: 2600,
    scaleMin: 0.93,
    scaleMax: 1.07,
  },
  expansion: {
    colors: ['#5CE1E6', '#B8F5F7', '#1E6B7F'],
    glowColor: 'rgba(92, 225, 230, 0.3)',
    pulseDuration: 2200,
    scaleMin: 0.92,
    scaleMax: 1.08,
  },
  transcendence: {
    colors: ['#EC4899', '#FBCFE8', '#831843'],
    glowColor: 'rgba(236, 72, 153, 0.3)',
    pulseDuration: 1800,
    scaleMin: 0.91,
    scaleMax: 1.09,
  },
};

export const getOrbConfig = (chapterId: ChapterId): OrbTierConfig =>
  ORB_CHAPTERS[chapterId];
