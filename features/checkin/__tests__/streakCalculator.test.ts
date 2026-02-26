import { calculateStreak } from '../streakCalculator';
import type { DailyCheckin } from '@/types/models';

const makeCheckin = (date: string, watchedPorn = false): DailyCheckin => ({
  id: `id-${date}`,
  userId: 'user-1',
  date,
  watchedPorn,
  urgeLevel: 2,
  stressLevel: 2,
  qualityOfLife: 3,
  memo: '',
  createdAt: `${date}T12:00:00.000Z`,
});

describe('calculateStreak', () => {
  it('streakStartDateがnullの場合0を返す', () => {
    expect(calculateStreak(null, [])).toBe(0);
  });

  it('streakStartDateが今日の場合0を返す', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateStreak(today, [])).toBe(0);
  });

  it('streakStartDateが昨日の場合1を返す', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(calculateStreak(yesterday, [])).toBe(1);
  });

  it('streakStartDateが7日前の場合7を返す', () => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    expect(calculateStreak(weekAgo, [])).toBe(7);
  });

  it('streakStartDateが30日前の場合30を返す', () => {
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    expect(calculateStreak(monthAgo, [])).toBe(30);
  });

  it('未来のstreakStartDateの場合0を返す（負の差分はMax(0)で保護）', () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    expect(calculateStreak(futureDate, [])).toBe(0);
  });

  it('ISO形式のdatetime文字列も正しくパースする', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(calculateStreak(yesterday, [])).toBe(1);
  });

  it('checkinsパラメータは現在無視されるが、渡してもエラーにならない', () => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const checkins = [makeCheckin('2025-01-01'), makeCheckin('2025-01-02')];
    expect(calculateStreak(weekAgo, checkins)).toBe(7);
  });

  it('空文字列のstreakStartDateの場合0以上を返す（parseISOは安全）', () => {
    // date-fns parseISO on empty string returns Invalid Date → differenceInDays returns NaN
    // Math.max(0, NaN) returns 0
    const result = calculateStreak('', []);
    expect(result).toBe(0);
  });

  it('非常に古い日付でも大きな数値を返す', () => {
    const result = calculateStreak('2020-01-01', []);
    expect(result).toBeGreaterThan(365);
  });
});
