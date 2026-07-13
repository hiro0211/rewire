import { renderHook, act } from '@testing-library/react-native';
import { BREATHING_CONFIG } from '@/constants/breathing';
import { useBreathingGate } from '../useBreathingGate';

const CYCLE_MS =
  BREATHING_CONFIG.INHALE_DURATION +
  BREATHING_CONFIG.HOLD_DURATION +
  BREATHING_CONFIG.EXHALE_DURATION;

describe('useBreathingGate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('active=false の間は idle のまま', () => {
    const { result } = renderHook(() => useBreathingGate(false));
    expect(result.current.phase).toBe('idle');
    expect(result.current.done).toBe(false);
  });

  it('active=true で inhale から始まる', () => {
    const { result } = renderHook(() => useBreathingGate(true));
    expect(result.current.phase).toBe('inhale');
  });

  it('inhale→hold→exhale と進行する', () => {
    const { result } = renderHook(() => useBreathingGate(true));

    act(() => {
      jest.advanceTimersByTime(BREATHING_CONFIG.INHALE_DURATION);
    });
    expect(result.current.phase).toBe('hold');

    act(() => {
      jest.advanceTimersByTime(BREATHING_CONFIG.HOLD_DURATION);
    });
    expect(result.current.phase).toBe('exhale');
  });

  it('1サイクル完了で cycleCount が 1 になる', () => {
    const { result } = renderHook(() => useBreathingGate(true));

    act(() => {
      jest.advanceTimersByTime(CYCLE_MS);
    });

    expect(result.current.cycleCount).toBe(1);
    expect(result.current.done).toBe(false);
  });

  it('3サイクル完了で done=true / phase=complete になる', () => {
    const { result } = renderHook(() => useBreathingGate(true));

    act(() => {
      jest.advanceTimersByTime(CYCLE_MS * 3);
    });

    expect(result.current.cycleCount).toBe(3);
    expect(result.current.done).toBe(true);
    expect(result.current.phase).toBe('complete');
  });

  it('active が false に戻ると idle にリセットされる', () => {
    const { result, rerender } = renderHook(
      (props: { active: boolean }) => useBreathingGate(props.active),
      { initialProps: { active: true } },
    );

    act(() => {
      jest.advanceTimersByTime(CYCLE_MS * 3);
    });
    expect(result.current.done).toBe(true);

    rerender({ active: false });

    expect(result.current.phase).toBe('idle');
    expect(result.current.done).toBe(false);
    expect(result.current.cycleCount).toBe(0);
  });

  it('再度 active=true になると最初からやり直す', () => {
    const { result, rerender } = renderHook(
      (props: { active: boolean }) => useBreathingGate(props.active),
      { initialProps: { active: true } },
    );

    act(() => {
      jest.advanceTimersByTime(CYCLE_MS * 3);
    });
    rerender({ active: false });
    rerender({ active: true });

    expect(result.current.phase).toBe('inhale');
    expect(result.current.cycleCount).toBe(0);

    act(() => {
      jest.advanceTimersByTime(CYCLE_MS * 3);
    });
    expect(result.current.done).toBe(true);
  });

  it('アンマウント後にタイマーが発火してもクラッシュしない', () => {
    const { unmount } = renderHook(() => useBreathingGate(true));

    unmount();

    expect(() => {
      act(() => {
        jest.advanceTimersByTime(CYCLE_MS * 3);
      });
    }).not.toThrow();
  });
});
