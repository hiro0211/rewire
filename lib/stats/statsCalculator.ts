import { parseISO, differenceInMilliseconds } from 'date-fns';
import type { DailyCheckin } from '@/types/models';

export interface StopwatchTime {
  days: number;
  hours: number;
  minutes: number;
}

export function calculateStopwatchTime(
  startDate: string | null,
  now: Date = new Date()
): StopwatchTime {
  if (!startDate) return { days: 0, hours: 0, minutes: 0 };

  const start = parseISO(startDate);
  if (start > now) return { days: 0, hours: 0, minutes: 0 };

  const diffMs = differenceInMilliseconds(now, start);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function formatStopwatchTime(time: StopwatchTime): string {
  if (time.days === 0 && time.hours === 0 && time.minutes === 0) {
    return '0分';
  }

  const parts: string[] = [];
  if (time.days > 0) parts.push(`${time.days}日`);
  if (time.hours > 0) parts.push(`${time.hours}時間`);
  parts.push(`${time.minutes}分`);

  return parts.join('');
}

export function calculateRelapseCount(checkins: DailyCheckin[]): number {
  return checkins.filter((c) => c.watchedPorn === true).length;
}

export interface DashboardStats {
  stopwatch: StopwatchTime;
  formatted: string;
  relapseCount: number;
  goalDays: number;
  streakStartDate: string | null;
}

export function computeDashboardStats(
  startDate: string | null,
  goalDays: number,
  checkins: DailyCheckin[],
  now: Date = new Date()
): DashboardStats {
  const stopwatch = calculateStopwatchTime(startDate, now);
  return {
    stopwatch,
    formatted: formatStopwatchTime(stopwatch),
    relapseCount: calculateRelapseCount(checkins),
    goalDays,
    streakStartDate: startDate,
  };
}
