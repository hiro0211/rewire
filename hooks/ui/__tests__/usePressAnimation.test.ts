import { renderHook, act } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { out: (f: any) => f, quad: (v: number) => v },
  };
});

import { usePressAnimation } from '../usePressAnimation';

describe('usePressAnimation', () => {
  it('onPressIn, onPressOut, animatedStyle を返す', () => {
    const { result } = renderHook(() => usePressAnimation());
    expect(typeof result.current.onPressIn).toBe('function');
    expect(typeof result.current.onPressOut).toBe('function');
    expect(typeof result.current.animatedStyle).toBe('object');
  });

  it('animatedStyle は transform[scale] を含む', () => {
    const { result } = renderHook(() => usePressAnimation());
    expect(result.current.animatedStyle).toHaveProperty('transform');
    const transform = result.current.animatedStyle.transform as Array<{ scale: number }>;
    expect(transform[0]).toHaveProperty('scale');
  });

  it('初期スケールは 1.0', () => {
    const { result } = renderHook(() => usePressAnimation());
    const transform = result.current.animatedStyle.transform as Array<{ scale: number }>;
    expect(transform[0].scale).toBe(1);
  });

  it('onPressIn を呼んでもクラッシュしない', () => {
    const { result } = renderHook(() => usePressAnimation());
    expect(() => act(() => result.current.onPressIn())).not.toThrow();
  });

  it('onPressOut を呼んでもクラッシュしない', () => {
    const { result } = renderHook(() => usePressAnimation());
    expect(() => act(() => result.current.onPressOut())).not.toThrow();
  });

  it('onPressIn → onPressOut の連続呼び出しでクラッシュしない', () => {
    const { result } = renderHook(() => usePressAnimation());
    expect(() => {
      act(() => {
        result.current.onPressIn();
        result.current.onPressOut();
      });
    }).not.toThrow();
  });
});
