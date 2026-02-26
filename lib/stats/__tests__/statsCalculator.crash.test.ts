import {
  calculateStopwatchTime,
  formatStopwatchTime,
  calculateRelapseCount,
  computeDashboardStats,
} from '../statsCalculator';

describe('statsCalculator crash prevention', () => {
  describe('calculateStopwatchTime', () => {
    it('null startDate → ゼロを返す', () => {
      expect(calculateStopwatchTime(null)).toEqual({ days: 0, hours: 0, minutes: 0 });
    });

    it('空文字 startDate → クラッシュしない', () => {
      expect(() => calculateStopwatchTime('')).not.toThrow();
    });

    it('不正なISO文字列 → クラッシュしない', () => {
      expect(() => calculateStopwatchTime('not-a-date')).not.toThrow();
    });

    it('未来の日付 → ゼロを返す', () => {
      const result = calculateStopwatchTime('2099-12-31T00:00:00Z');
      expect(result).toEqual({ days: 0, hours: 0, minutes: 0 });
    });

    it('非常に古い日付 → クラッシュしない', () => {
      const result = calculateStopwatchTime('1900-01-01T00:00:00Z');
      expect(result.days).toBeGreaterThan(0);
    });

    it('ISO日時形式以外の日付形式 → クラッシュしない', () => {
      expect(() => calculateStopwatchTime('2026/02/17')).not.toThrow();
    });

    it('日付のみ（時間なし） → クラッシュしない', () => {
      expect(() => calculateStopwatchTime('2026-02-17')).not.toThrow();
    });
  });

  describe('formatStopwatchTime', () => {
    it('全てゼロ → 0分', () => {
      expect(formatStopwatchTime({ days: 0, hours: 0, minutes: 0 })).toBe('0分');
    });

    it('日のみ', () => {
      expect(formatStopwatchTime({ days: 5, hours: 0, minutes: 0 })).toBe('5日0分');
    });

    it('時間のみ', () => {
      expect(formatStopwatchTime({ days: 0, hours: 3, minutes: 0 })).toBe('3時間0分');
    });

    it('分のみ', () => {
      expect(formatStopwatchTime({ days: 0, hours: 0, minutes: 45 })).toBe('45分');
    });

    it('非常に大きな日数 → クラッシュしない', () => {
      expect(() => formatStopwatchTime({ days: 99999, hours: 23, minutes: 59 })).not.toThrow();
    });

    it('負の値 → クラッシュしない', () => {
      expect(() => formatStopwatchTime({ days: -1, hours: -1, minutes: -1 })).not.toThrow();
    });
  });

  describe('calculateRelapseCount', () => {
    it('空配列 → 0', () => {
      expect(calculateRelapseCount([])).toBe(0);
    });

    it('watchedPorn=false のみ → 0', () => {
      expect(calculateRelapseCount([
        { id: '1', userId: 'u', date: '2026-01-01', watchedPorn: false, urgeLevel: 1, stressLevel: 1, qualityOfLife: 3, createdAt: '' },
      ])).toBe(0);
    });

    it('watchedPorn=true → カウント', () => {
      expect(calculateRelapseCount([
        { id: '1', userId: 'u', date: '2026-01-01', watchedPorn: true, urgeLevel: 1, stressLevel: 1, qualityOfLife: 3, createdAt: '' },
        { id: '2', userId: 'u', date: '2026-01-02', watchedPorn: false, urgeLevel: 1, stressLevel: 1, qualityOfLife: 3, createdAt: '' },
        { id: '3', userId: 'u', date: '2026-01-03', watchedPorn: true, urgeLevel: 1, stressLevel: 1, qualityOfLife: 3, createdAt: '' },
      ])).toBe(2);
    });

    it('watchedPornがundefinedでもクラッシュしない', () => {
      expect(() => calculateRelapseCount([
        { id: '1', userId: 'u', date: '2026-01-01', urgeLevel: 1, stressLevel: 1, qualityOfLife: 3, createdAt: '' } as any,
      ])).not.toThrow();
    });
  });

  describe('computeDashboardStats', () => {
    it('全てnull/デフォルト値 → クラッシュしない', () => {
      const result = computeDashboardStats(null, 30, []);
      expect(result.stopwatch).toEqual({ days: 0, hours: 0, minutes: 0 });
      expect(result.relapseCount).toBe(0);
      expect(result.goalDays).toBe(30);
      expect(result.streakStartDate).toBeNull();
    });

    it('不正な startDate → クラッシュしない', () => {
      expect(() => computeDashboardStats('invalid', 30, [])).not.toThrow();
    });

    it('goalDays=0 → クラッシュしない', () => {
      expect(() => computeDashboardStats(null, 0, [])).not.toThrow();
    });

    it('負のgoalDays → クラッシュしない', () => {
      expect(() => computeDashboardStats(null, -10, [])).not.toThrow();
    });
  });
});
