export interface WidgetPayload {
  streakStartDate: string | null;
  goalDays: number;
  relapseCount: number;
  updatedAt: string;
}

export interface WidgetDataInput {
  streakStartDate: string | null;
  goalDays: number;
  relapseCount: number;
}

export function createWidgetPayload(input: WidgetDataInput): WidgetPayload {
  return {
    streakStartDate: input.streakStartDate,
    goalDays: input.goalDays,
    relapseCount: input.relapseCount,
    updatedAt: new Date().toISOString(),
  };
}
