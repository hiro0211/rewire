import { act, renderHook } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Heavy: 'Heavy', Medium: 'Medium', Soft: 'Soft' },
  NotificationFeedbackType: { Success: 'Success' },
}));

import { BREATHING_CONFIG } from '@/constants/breathing';
import { useBreathingEngine } from '../useBreathingEngine';

describe('useBreathingEngine with hold phase', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('sessionStart すると inhale フェーズになる', () => {
    const { result } = renderHook(() => useBreathingEngine());
    act(() => {
      result.current.startSession();
    });
    expect(result.current.phase).toBe('inhale');
  });

  it('INHALE_DURATION 経過後に hold フェーズに遷移する', () => {
    const { result } = renderHook(() => useBreathingEngine());
    act(() => {
      result.current.startSession();
    });
    act(() => {
      jest.advanceTimersByTime(BREATHING_CONFIG.INHALE_DURATION);
    });
    expect(result.current.phase).toBe('hold');
  });

  it('hold フェーズの後に exhale フェーズに遷移する', () => {
    const { result } = renderHook(() => useBreathingEngine());
    act(() => {
      result.current.startSession();
    });
    act(() => {
      jest.advanceTimersByTime(BREATHING_CONFIG.INHALE_DURATION);
    });
    act(() => {
      jest.advanceTimersByTime(BREATHING_CONFIG.HOLD_DURATION);
    });
    expect(result.current.phase).toBe('exhale');
  });

  it('1サイクル完了後に cycleCount が増える', () => {
    const { result } = renderHook(() => useBreathingEngine());
    act(() => {
      result.current.startSession();
    });
    // inhale → hold → exhale → next cycle (inhale again)
    act(() => {
      jest.advanceTimersByTime(
        BREATHING_CONFIG.INHALE_DURATION +
          BREATHING_CONFIG.HOLD_DURATION +
          BREATHING_CONFIG.EXHALE_DURATION,
      );
    });
    expect(result.current.cycleCount).toBe(1);
  });

  it('CYCLES_PER_SESSION 完了後に complete フェーズになる', () => {
    const { result } = renderHook(() => useBreathingEngine());
    act(() => {
      result.current.startSession();
    });
    const oneCycle =
      BREATHING_CONFIG.INHALE_DURATION +
      BREATHING_CONFIG.HOLD_DURATION +
      BREATHING_CONFIG.EXHALE_DURATION;
    act(() => {
      jest.advanceTimersByTime(oneCycle * BREATHING_CONFIG.CYCLES_PER_SESSION);
    });
    expect(result.current.phase).toBe('complete');
  });
});
