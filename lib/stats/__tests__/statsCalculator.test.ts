import {
  calculateStopwatchTime,
  formatStopwatchTime,
  calculateRelapseCount,
  computeDashboardStats,
} from '../statsCalculator';
import type { DailyCheckin } from '@/types/models';

describe('calculateStopwatchTime', () => {
  it('nullの場合はゼロを返す', () => {
    expect(calculateStopwatchTime(null)).toEqual({ days: 0, hours: 0, minutes: 0 });
  });

  it('未来日の場合はゼロを返す', () => {
    const now = new Date('2026-02-26T10:00:00Z');
    expect(calculateStopwatchTime('2026-03-01T00:00:00Z', now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });

  it('同日同時刻の場合はゼロを返す', () => {
    const now = new Date('2026-02-26T10:00:00Z');
    expect(calculateStopwatchTime('2026-02-26T10:00:00Z', now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });

  it('経過時間を正確に計算する', () => {
    const now = new Date('2026-02-26T10:31:00Z');
    const result = calculateStopwatchTime('2026-02-24T19:00:00Z', now);
    expect(result).toEqual({ days: 1, hours: 15, minutes: 31 });
  });

  it('日付のみの文字列はローカルT00:00:00として扱われる', () => {
    // parseISO('2026-02-26') → local midnight
    const localMidnight = new Date(2026, 1, 26, 0, 0, 0);
    const now = new Date(2026, 1, 26, 12, 30, 0);
    const result = calculateStopwatchTime('2026-02-26', now);
    expect(result).toEqual({ days: 0, hours: 12, minutes: 30 });
  });

  it('数日経過した場合の日数を正確に計算する', () => {
    const now = new Date('2026-03-01T00:00:00Z');
    const result = calculateStopwatchTime('2026-02-26T00:00:00Z', now);
    expect(result).toEqual({ days: 3, hours: 0, minutes: 0 });
  });
});

describe('formatStopwatchTime', () => {
  it('ゼロの場合は"0分"を返す', () => {
    expect(formatStopwatchTime({ days: 0, hours: 0, minutes: 0 })).toBe('0分');
  });

  it('日と時間と分を連結する', () => {
    expect(formatStopwatchTime({ days: 2, hours: 15, minutes: 31 })).toBe('2日15時間31分');
  });

  it('日がゼロの場合は省略する', () => {
    expect(formatStopwatchTime({ days: 0, hours: 3, minutes: 5 })).toBe('3時間5分');
  });

  it('時間がゼロの場合は省略する', () => {
    expect(formatStopwatchTime({ days: 1, hours: 0, minutes: 30 })).toBe('1日30分');
  });

  it('分のみの場合', () => {
    expect(formatStopwatchTime({ days: 0, hours: 0, minutes: 45 })).toBe('45分');
  });
});

describe('calculateRelapseCount', () => {
  it('空配列は0を返す', () => {
    expect(calculateRelapseCount([])).toBe(0);
  });

  it('watchedPorn=trueのチェックインをカウントする', () => {
    const checkins = [
      { watchedPorn: true },
      { watchedPorn: false },
      { watchedPorn: true },
      { watchedPorn: false },
    ] as DailyCheckin[];
    expect(calculateRelapseCount(checkins)).toBe(2);
  });

  it('全てfalseなら0を返す', () => {
    const checkins = [
      { watchedPorn: false },
      { watchedPorn: false },
    ] as DailyCheckin[];
    expect(calculateRelapseCount(checkins)).toBe(0);
  });
});

describe('computeDashboardStats', () => {
  it('全stats一括取得', () => {
    const now = new Date('2026-02-26T10:31:00Z');
    const checkins = [
      { watchedPorn: true },
      { watchedPorn: false },
    ] as DailyCheckin[];

    const result = computeDashboardStats('2026-02-24T19:00:00Z', 90, checkins, now);
    expect(result).toEqual({
      stopwatch: { days: 1, hours: 15, minutes: 31 },
      formatted: '1日15時間31分',
      relapseCount: 1,
      goalDays: 90,
      streakStartDate: '2026-02-24T19:00:00Z',
    });
  });
});
