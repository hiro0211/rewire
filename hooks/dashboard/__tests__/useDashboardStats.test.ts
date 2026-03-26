import { renderHook } from '@testing-library/react-native';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useDashboardStats } from '../useDashboardStats';

jest.mock('@/stores/userStore');
jest.mock('@/stores/checkinStore');

const mockUseUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;
const mockUseCheckinStore = useCheckinStore as jest.MockedFunction<typeof useCheckinStore>;

describe('useDashboardStats', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-25T10:00:00Z'));

    mockUseUserStore.mockReturnValue({
      user: {
        streakStartDate: '2026-03-20T00:00:00Z',
        goalDays: 90,
      },
      loadUser: jest.fn(),
      updateUser: jest.fn(),
      resetUser: jest.fn(),
    } as any);

    mockUseCheckinStore.mockReturnValue({
      checkins: [
        { date: '2026-03-21', watchedPorn: false, urgeLevel: 2, qualityOfLife: 4 },
        { date: '2026-03-22', watchedPorn: true, urgeLevel: 4, qualityOfLife: 2 },
        { date: '2026-03-23', watchedPorn: false, urgeLevel: 1, qualityOfLife: 5 },
      ],
      loadCheckins: jest.fn(),
      todayCheckin: null,
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ストリーク開始日をユーザーストアから取得する', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.streakStartDate).toBe('2026-03-20T00:00:00Z');
  });

  it('ゴール日数をユーザーストアから取得する', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.goalDays).toBe(90);
  });

  it('リラプス回数を正しく計算する', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.relapseCount).toBe(1);
  });

  it('ストップウォッチが経過日数を返す', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.stopwatch.days).toBe(5);
  });

  it('ストップウォッチにformatted文字列がある', () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.stopwatch.formatted).toContain('5日');
  });

  it('ユーザーがnullのときデフォルト値を返す', () => {
    mockUseUserStore.mockReturnValue({
      user: null,
      loadUser: jest.fn(),
      updateUser: jest.fn(),
      resetUser: jest.fn(),
    } as any);

    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.streakStartDate).toBeNull();
    expect(result.current.goalDays).toBe(30);
    expect(result.current.stopwatch.days).toBe(0);
  });

  it('チェックインが空のときリラプス0を返す', () => {
    mockUseCheckinStore.mockReturnValue({
      checkins: [],
      loadCheckins: jest.fn(),
      todayCheckin: null,
    } as any);

    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.relapseCount).toBe(0);
  });

  it('全チェックインがリラプスの場合その数を返す', () => {
    mockUseCheckinStore.mockReturnValue({
      checkins: [
        { date: '2026-03-21', watchedPorn: true, urgeLevel: 4, qualityOfLife: 1 },
        { date: '2026-03-22', watchedPorn: true, urgeLevel: 3, qualityOfLife: 2 },
      ],
      loadCheckins: jest.fn(),
      todayCheckin: null,
    } as any);

    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.relapseCount).toBe(2);
  });
});
