export const GROWTH_STAGE_NAMES = ['spark', 'dawn', 'nebula', 'galaxy', 'cosmos'] as const;

export type GrowthStageName = (typeof GROWTH_STAGE_NAMES)[number];

export interface GrowthStageDefinition {
  name: GrowthStageName;
  min: number;
  max: number;
}

export const GROWTH_STAGES: readonly GrowthStageDefinition[] = [
  { name: 'spark', min: 0, max: 6 },
  { name: 'dawn', min: 7, max: 29 },
  { name: 'nebula', min: 30, max: 89 },
  { name: 'galaxy', min: 90, max: 364 },
  { name: 'cosmos', min: 365, max: Infinity },
];
