import { GROWTH_STAGES, type GrowthStageDefinition } from '@/constants/growthStages';

/** Pure function: determine growth stage from elapsed days */
export function getGrowthStage(days: number): GrowthStageDefinition {
  for (const stage of GROWTH_STAGES) {
    if (days >= stage.min && days <= stage.max) {
      return stage;
    }
  }
  return GROWTH_STAGES[0];
}
