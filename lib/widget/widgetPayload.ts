import type { SupportedLocale } from '@/types/i18n';

export interface WidgetPayload {
  streakStartDate: string | null;
  goalDays: number;
  relapseCount: number;
  locale: SupportedLocale;
  updatedAt: string;
}

export interface WidgetDataInput {
  streakStartDate: string | null;
  goalDays: number;
  relapseCount: number;
}

export interface WidgetPayloadInput extends WidgetDataInput {
  locale: SupportedLocale;
}

function normalizeDate(date: string | null): string | null {
  if (!date) return null;
  if (date.includes('T')) return date;
  const d = new Date(`${date}T00:00:00`);
  return d.toISOString();
}

export function createWidgetPayload(input: WidgetPayloadInput): WidgetPayload {
  return {
    streakStartDate: normalizeDate(input.streakStartDate),
    goalDays: input.goalDays,
    relapseCount: input.relapseCount,
    locale: input.locale,
    updatedAt: new Date().toISOString(),
  };
}
