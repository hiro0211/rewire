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

function normalizeDate(date: string | null): string | null {
  if (!date) return null;
  if (date.includes('T')) return date;
  return `${date}T00:00:00.000Z`;
}

export function createWidgetPayload(input: WidgetDataInput): WidgetPayload {
  return {
    streakStartDate: normalizeDate(input.streakStartDate),
    goalDays: input.goalDays,
    relapseCount: input.relapseCount,
    updatedAt: new Date().toISOString(),
  };
}
