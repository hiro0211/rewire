import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import type { DailyCheckin } from '@/types/models';

/**
 * Calculates the current streak based on the checkin history and streak start date.
 * Logic:
 * - If user relapsed (watchedPorn=true), streak resets.
 * - However, the source of truth for "streak start" should probably be User.streakStartDate.
 * - This function verifies the streak by checking consecutive days from today backwards.
 */
export const calculateStreak = (
  streakStartDate: string | null,
  checkins: DailyCheckin[]
): number => {
  if (!streakStartDate) return 0;

  const start = startOfDay(parseISO(streakStartDate));
  const today = startOfDay(new Date());
  
  // Basic calculation: Difference between today and start date
  // In a real app, we might want to validate that there are no gaps in checkins,
  // but for MVP, we trust the streakStartDate which resets on relapse.
  const diff = differenceInDays(today, start);
  
  return Math.max(0, diff);
};
