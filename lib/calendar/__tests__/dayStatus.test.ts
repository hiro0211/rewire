import { getDayStatus } from '../dayStatus';
import type { DailyCheckin } from '@/types/models';

const today = new Date('2026-04-30T12:00:00');

const buildCheckin = (date: string, watchedPorn: boolean): DailyCheckin => ({
  id: `id-${date}`,
  userId: 'u',
  date,
  watchedPorn,
  urgeLevel: 0,
  stressLevel: 0,
  qualityOfLife: 3,
  memo: '',
  createdAt: '2026-04-30T00:00:00.000Z',
});

describe('getDayStatus', () => {
  it('記録ありで watchedPorn=false のとき clean を返す', () => {
    const date = new Date('2026-04-29T12:00:00');
    const checkin = buildCheckin('2026-04-29', false);
    expect(getDayStatus({ date, checkin, streakStartDate: '2026-04-01', today })).toBe('clean');
  });

  it('記録ありで watchedPorn=true のとき relapse を返す', () => {
    const date = new Date('2026-04-29T12:00:00');
    const checkin = buildCheckin('2026-04-29', true);
    expect(getDayStatus({ date, checkin, streakStartDate: '2026-04-01', today })).toBe('relapse');
  });

  it('記録なしでストリーク開始日以降のとき empty-no-data を返す', () => {
    const date = new Date('2026-04-29T12:00:00');
    expect(
      getDayStatus({ date, checkin: undefined, streakStartDate: '2026-04-01', today })
    ).toBe('empty-no-data');
  });

  it('記録なしでストリーク開始日より前のとき empty-pre-streak を返す', () => {
    const date = new Date('2026-03-15T12:00:00');
    expect(
      getDayStatus({ date, checkin: undefined, streakStartDate: '2026-04-01', today })
    ).toBe('empty-pre-streak');
  });

  it('今日より未来の日は記録なしのとき empty-future を返す', () => {
    const date = new Date('2026-05-10T12:00:00');
    expect(
      getDayStatus({ date, checkin: undefined, streakStartDate: '2026-04-01', today })
    ).toBe('empty-future');
  });

  it('streakStartDate が null のとき記録なしの過去日は empty-no-data を返す', () => {
    const date = new Date('2026-04-29T12:00:00');
    expect(
      getDayStatus({ date, checkin: undefined, streakStartDate: null, today })
    ).toBe('empty-no-data');
  });

  it('ストリーク開始日当日（記録なし）は empty-no-data を返す', () => {
    const date = new Date('2026-04-01T12:00:00');
    expect(
      getDayStatus({ date, checkin: undefined, streakStartDate: '2026-04-01', today })
    ).toBe('empty-no-data');
  });
});
