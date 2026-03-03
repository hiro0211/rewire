import { startOfWeek, startOfDay, addDays, differenceInDays, isSameDay, isBefore } from 'date-fns';

export type DayStatusType = 'completed' | 'today' | 'future';

export interface DayStatus {
  dayLabel: string;
  status: DayStatusType;
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'] as const;

/**
 * Pure function: calculate weekly progress for the 7-day tracker.
 * Week starts on Monday. Days before today within streak are "completed",
 * today is "today", future days are "future".
 */
export const getWeeklyProgress = (streak: number, today: Date): DayStatus[] => {
  const normalizedToday = startOfDay(today);
  const weekStart = startOfWeek(normalizedToday, { weekStartsOn: 1 }); // Monday

  return DAY_LABELS.map((label, i) => {
    const day = addDays(weekStart, i);

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
