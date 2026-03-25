import { renderHook } from '@testing-library/react-native';
import { format, subDays } from 'date-fns';

// Mock checkinStore
const mockCheckins: any[] = [];
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({ checkins: mockCheckins }),
}));

import { useCheckinTrends } from '../useCheckinTrends';

const TODAY = new Date('2026-03-23T12:00:00Z');

describe('useCheckinTrends', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
    mockCheckins.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('デフォルトで7日分のデータを返す', () => {
    const { result } = renderHook(() => useCheckinTrends());
    expect(result.current.urgeLevel).toHaveLength(7);
    expect(result.current.stressLevel).toHaveLength(7);
    expect(result.current.qualityOfLife).toHaveLength(7);
  });

  it('days=3 のとき3日分のデータを返す', () => {
    const { result } = renderHook(() => useCheckinTrends(3));
    expect(result.current.urgeLevel).toHaveLength(3);
    expect(result.current.stressLevel).toHaveLength(3);
    expect(result.current.qualityOfLife).toHaveLength(3);
  });

  it('チェックインがない日は urgeLevel=0, stressLevel=0, qualityOfLife=1 をデフォルトにする', () => {
    const { result } = renderHook(() => useCheckinTrends());
    expect(result.current.urgeLevel).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result.current.stressLevel).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(result.current.qualityOfLife).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it('今日のチェックインがある場合、最後の要素に反映される', () => {
    const today = format(TODAY, 'yyyy-MM-dd');
    mockCheckins.push({
      date: today,
      urgeLevel: 3,
      stressLevel: 2,
      qualityOfLife: 4,
      watchedPorn: false,
    });
    const { result } = renderHook(() => useCheckinTrends());
    expect(result.current.urgeLevel[6]).toBe(3);
    expect(result.current.stressLevel[6]).toBe(2);
    expect(result.current.qualityOfLife[6]).toBe(4);
  });

  it('3日前のチェックインがある場合、対応する位置に反映される', () => {
    const threeDaysAgo = format(subDays(TODAY, 3), 'yyyy-MM-dd');
    mockCheckins.push({
      date: threeDaysAgo,
      urgeLevel: 1,
      stressLevel: 4,
      qualityOfLife: 2,
      watchedPorn: false,
    });
    const { result } = renderHook(() => useCheckinTrends());
    // index 3 from start (days-1-3 = days-4) → 7-day array, 3 days ago is index 3
    expect(result.current.urgeLevel[3]).toBe(1);
    expect(result.current.stressLevel[3]).toBe(4);
    expect(result.current.qualityOfLife[3]).toBe(2);
    // 他の日はデフォルト
    expect(result.current.urgeLevel[0]).toBe(0);
    expect(result.current.urgeLevel[6]).toBe(0);
  });

  it('複数日のチェックインがある場合、それぞれ正しく反映される', () => {
    const today = format(TODAY, 'yyyy-MM-dd');
    const yesterday = format(subDays(TODAY, 1), 'yyyy-MM-dd');
    mockCheckins.push(
      { date: today, urgeLevel: 4, stressLevel: 3, qualityOfLife: 5, watchedPorn: false },
      { date: yesterday, urgeLevel: 2, stressLevel: 1, qualityOfLife: 3, watchedPorn: false },
    );
    const { result } = renderHook(() => useCheckinTrends());
    expect(result.current.urgeLevel[6]).toBe(4); // today
    expect(result.current.urgeLevel[5]).toBe(2); // yesterday
  });

  it('days=14 のとき14日分のデータを返す', () => {
    const { result } = renderHook(() => useCheckinTrends(14));
    expect(result.current.urgeLevel).toHaveLength(14);
  });
});
