import { startOfWeek, startOfDay, addDays, differenceInDays, isSameDay, isBefore } from 'date-fns';
import { t } from '@/locales/i18n';

export type DayStatusType = 'completed' | 'today' | 'future';

export interface DayStatus {
  dayLabel: string;
  status: DayStatusType;
}

const DAY_LABEL_KEYS = [
  'weekDaysShort.mon', 'weekDaysShort.tue', 'weekDaysShort.wed',
  'weekDaysShort.thu', 'weekDaysShort.fri', 'weekDaysShort.sat', 'weekDaysShort.sun',
] as const;

/**
 * Pure function: calculate weekly progress for the 7-day tracker.
 * Week starts on Monday. Days before today within streak are "completed",
 * today is "today", future days are "future".
 */
export const getWeeklyProgress = (streak: number, today: Date): DayStatus[] => {
  const normalizedToday = startOfDay(today);
  const weekStart = startOfWeek(normalizedToday, { weekStartsOn: 1 }); // Monday

  return DAY_LABEL_KEYS.map((key, i) => {
    const day = addDays(weekStart, i);
    const label = t(key);

    if (isSameDay(day, normalizedToday)) {
      return { dayLabel: label, status: 'today' as const };
    }

    if (isBefore(day, normalizedToday)) {
      const daysAgo = differenceInDays(normalizedToday, day);
      if (daysAgo <= streak) {
        return { dayLabel: label, status: 'completed' as const };
      }
    }

    return { dayLabel: label, status: 'future' as const };
  });
};
