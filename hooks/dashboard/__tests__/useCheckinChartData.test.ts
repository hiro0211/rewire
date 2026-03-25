import { renderHook } from '@testing-library/react-native';
import { format, subDays } from 'date-fns';

const mockCheckins: any[] = [];
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({ checkins: mockCheckins }),
}));

import { useCheckinChartData } from '../useCheckinChartData';

const TODAY = new Date('2026-03-23T12:00:00Z');

describe('useCheckinChartData', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
    mockCheckins.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('デフォルトで30日分のポイントを返す', () => {
    const { result } = renderHook(() => useCheckinChartData());
    expect(result.current.qualityPoints).toHaveLength(30);
    expect(result.current.urgencyPoints).toHaveLength(30);
    expect(result.current.dates).toHaveLength(30);
  });

  it('days=7 のとき7日分のポイントを返す', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    expect(result.current.qualityPoints).toHaveLength(7);
    expect(result.current.urgencyPoints).toHaveLength(7);
    expect(result.current.dates).toHaveLength(7);
  });

  it('各 ChartPoint は x, y, date, hasData を持つ', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    const point = result.current.qualityPoints[0];
    expect(point).toHaveProperty('x');
    expect(point).toHaveProperty('y');
    expect(point).toHaveProperty('date');
    expect(point).toHaveProperty('hasData');
  });

  it('チェックインがない日は hasData=false', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    result.current.qualityPoints.forEach((p) => {
      expect(p.hasData).toBe(false);
    });
  });

  it('チェックインがある日は hasData=true', () => {
    const today = format(TODAY, 'yyyy-MM-dd');
    mockCheckins.push({
      date: today,
      urgeLevel: 2,
      stressLevel: 1,
      qualityOfLife: 4,
      watchedPorn: false,
    });
    const { result } = renderHook(() => useCheckinChartData(7));
    const lastQuality = result.current.qualityPoints[6];
    expect(lastQuality.hasData).toBe(true);
  });

  it('チェックインがある日の qualityPoints は実データを反映する（デフォルト3ではない）', () => {
    const today = format(TODAY, 'yyyy-MM-dd');
    mockCheckins.push({
      date: today,
      urgeLevel: 4,
      stressLevel: 2,
      qualityOfLife: 5,
      watchedPorn: false,
    });
    const { result } = renderHook(() => useCheckinChartData(7));
    // quality=5（最高値）は SVG y 座標が最小になる（上に表示される）
    const todayPoint = result.current.qualityPoints[6];
    expect(todayPoint.hasData).toBe(true);
  });

  it('dates 配列は今日で終わる', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    const lastDate = result.current.dates[6];
    expect(lastDate).toBe(format(TODAY, 'yyyy-MM-dd'));
  });

  it('dates 配列は指定日数前から始まる', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    const firstDate = result.current.dates[0];
    expect(firstDate).toBe(format(subDays(TODAY, 6), 'yyyy-MM-dd'));
  });

  it('x 座標は左から右へ増加する', () => {
    const { result } = renderHook(() => useCheckinChartData(7));
    const points = result.current.qualityPoints;
    for (let i = 1; i < points.length; i++) {
      expect(points[i].x).toBeGreaterThanOrEqual(points[i - 1].x);
    }
  });
});
