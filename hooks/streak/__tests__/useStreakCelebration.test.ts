import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockGetLastCelebratedStreak = jest.fn();
const mockSetLastCelebratedStreak = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/celebrationStorage', () => ({
  getLastCelebratedStreak: () => mockGetLastCelebratedStreak(),
  setLastCelebratedStreak: (n: number) => mockSetLastCelebratedStreak(n),
}));

let mockStreak = 0;
jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: mockStreak, goal: 30, progress: 0, streakStartDate: null }),
}));

import { useStreakCelebration } from '../useStreakCelebration';

describe('useStreakCelebration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStreak = 0;
  });

  it('hydration 完了前は celebratingStreak が null', async () => {
    let resolveGet: (v: number | null) => void = () => {};
    mockGetLastCelebratedStreak.mockReturnValue(
      new Promise<number | null>((resolve) => {
        resolveGet = resolve;
      }),
    );
    mockStreak = 10;

    const { result } = renderHook(() => useStreakCelebration());
    expect(result.current.celebratingStreak).toBeNull();

    await act(async () => {
      resolveGet(9);
    });
  });

  it('初回マイグレーション: lastCelebrated=null なら currentStreak を保存して何も表示しない', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(null);
    mockStreak = 15;

    const { result } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(mockSetLastCelebratedStreak).toHaveBeenCalledWith(15);
    });
    expect(result.current.celebratingStreak).toBeNull();
  });

  it('currentStreak > lastCelebrated なら自動でセレブレーション', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(9);
    mockStreak = 10;

    const { result } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(result.current.celebratingStreak).toBe(10);
    });
    expect(result.current.fromStreak).toBe(9);
  });

  it('currentStreak === lastCelebrated なら表示しない', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(10);
    mockStreak = 10;

    const { result } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(mockGetLastCelebratedStreak).toHaveBeenCalled();
    });
    expect(result.current.celebratingStreak).toBeNull();
  });

  it('relapse 検知: currentStreak < lastCelebrated なら lastCelebrated をクランプ保存', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(30);
    mockStreak = 0;

    const { result } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(mockSetLastCelebratedStreak).toHaveBeenCalledWith(0);
    });
    expect(result.current.celebratingStreak).toBeNull();
  });

  it('dismiss() 後は celebratingStreak が null に戻り lastCelebrated が currentStreak に保存される', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(9);
    mockStreak = 10;

    const { result } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(result.current.celebratingStreak).toBe(10);
    });

    await act(async () => {
      result.current.dismiss();
    });

    expect(result.current.celebratingStreak).toBeNull();
    expect(mockSetLastCelebratedStreak).toHaveBeenCalledWith(10);
  });

  it('trigger(targetStreak) で明示的にセレブレーションを開始できる', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(9);
    mockStreak = 10;

    const { result } = renderHook(() => useStreakCelebration());

    // hydration 待ち
    await waitFor(() => {
      expect(result.current.celebratingStreak).toBe(10);
    });

    // dismiss してから明示 trigger
    await act(async () => {
      result.current.dismiss();
    });

    expect(result.current.celebratingStreak).toBeNull();

    await act(async () => {
      result.current.trigger(10);
    });

    expect(result.current.celebratingStreak).toBe(10);
  });

  it('表示中（celebratingStreak !== null）は再 trigger しない（二重発火防止）', async () => {
    mockGetLastCelebratedStreak.mockResolvedValue(9);
    mockStreak = 10;

    const { result, rerender } = renderHook(() => useStreakCelebration());

    await waitFor(() => {
      expect(result.current.celebratingStreak).toBe(10);
    });

    // currentStreak がさらに更新されても、表示中は state を上書きしない
    mockStreak = 11;
    rerender({});

    expect(result.current.celebratingStreak).toBe(10);
  });
});
