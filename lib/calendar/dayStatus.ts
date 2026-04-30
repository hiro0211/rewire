import { format } from 'date-fns/format';
import { startOfDay } from 'date-fns/startOfDay';
import { parseISO } from 'date-fns/parseISO';
import type { DailyCheckin } from '@/types/models';

export type DayStatus =
  | 'clean'
  | 'relapse'
  | 'empty-no-data'
  | 'empty-pre-streak'
  | 'empty-future';

interface GetDayStatusParams {
  date: Date;
  checkin: DailyCheckin | undefined;
  streakStartDate: string | null;
  today: Date;
}

export function getDayStatus({
  date,
  checkin,
  streakStartDate,
  today,
}: GetDayStatusParams): DayStatus {
  if (checkin) {
    return checkin.watchedPorn ? 'relapse' : 'clean';
  }

  const dayStart = startOfDay(date).getTime();
  const todayStart = startOfDay(today).getTime();

  if (dayStart > todayStart) {
    return 'empty-future';
  }

  if (streakStartDate) {
    const streakStart = startOfDay(parseISO(streakStartDate)).getTime();
    if (dayStart < streakStart) {
      return 'empty-pre-streak';
    }
  }

  return 'empty-no-data';
}

export const dateToKey = (date: Date) => format(date, 'yyyy-MM-dd');
