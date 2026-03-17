import { renderHook, act } from '@testing-library/react-native';
import { useAnalyzingProgress } from '../useAnalyzingProgress';

jest.useFakeTimers();

describe('useAnalyzingProgress', () => {
  const onComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で progress が 0、completedCount が 0', () => {
    const { result } = renderHook(() => useAnalyzingProgress(onComplete));
    expect(result.current.progress).toBe(0);
    expect(result.current.completedCount).toBe(0);
  });

  it('itemFades が4つの Animated.Value を持つ', () => {
    const { result } = renderHook(() => useAnalyzingProgress(onComplete));
    expect(result.current.itemFades).toHaveLength(4);
  });

  it('checkFades が4つの Animated.Value を持つ', () => {
    const { result } = renderHook(() => useAnalyzingProgress(onComplete));
    expect(result.current.checkFades).toHaveLength(4);
  });

  it('全アイテム完了後に onComplete が呼ばれる', () => {
    renderHook(() => useAnalyzingProgress(onComplete));

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('途中の時間では onComplete が呼ばれない', () => {
    renderHook(() => useAnalyzingProgress(onComplete));

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
