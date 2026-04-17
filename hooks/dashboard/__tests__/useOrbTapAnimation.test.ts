jest.mock('react-native-reanimated', () => ({
  useSharedValue: (v: number) => ({ value: v }),
  withTiming: jest.fn((v: number) => v),
  withSpring: jest.fn((v: number) => v),
  Easing: {
    out: (f: unknown) => f,
    inOut: (f: unknown) => f,
    cubic: (v: number) => v,
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useOrbTapAnimation } from '../useOrbTapAnimation';
import * as Haptics from 'expo-haptics';

describe('useOrbTapAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期値が正しい（tapScale=1, glowIntensity=0, rippleTrigger=0）', () => {
    const { result } = renderHook(() => useOrbTapAnimation());
    expect(result.current.tapScale.value).toBe(1);
    expect(result.current.glowIntensity.value).toBe(0);
    expect(result.current.rippleTrigger.value).toBe(0);
  });

  it('handlePressIn と handlePressOut が関数として返される', () => {
    const { result } = renderHook(() => useOrbTapAnimation());
    expect(typeof result.current.handlePressIn).toBe('function');
    expect(typeof result.current.handlePressOut).toBe('function');
  });

  it('handlePressIn で触覚フィードバックが発火する', () => {
    const { result } = renderHook(() => useOrbTapAnimation());
    act(() => {
      result.current.handlePressIn();
    });
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('handlePressOut で rippleTrigger がインクリメントされる', () => {
    const { result } = renderHook(() => useOrbTapAnimation());
    act(() => {
      result.current.handlePressOut();
    });
    // Mock useSharedValue returns plain object, so direct mutation
    expect(result.current.rippleTrigger.value).toBe(1);
  });
});
