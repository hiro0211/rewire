jest.mock('react-native-reanimated', () => ({
  useSharedValue: (v: number) => ({ value: v }),
  useAnimatedStyle: (fn: () => object) => fn(),
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
  useFrameCallback: jest.fn(),
  useAnimatedReaction: jest.fn(),
  withRepeat: jest.fn((v: unknown) => v),
  withTiming: jest.fn((v: unknown) => v),
  Easing: {
    inOut: (f: unknown) => f,
    sin: (v: number) => v,
  },
}));

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

import { renderHook } from '@testing-library/react-native';
import { useOrbBreathing } from '../useOrbBreathing';

const mockConfig = {
  scaleMin: 0.97,
  scaleMax: 1.03,
  pulseDuration: 3000,
};

describe('useOrbBreathing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('time, breathingScale, pulseStyle を返す', () => {
    const { result } = renderHook(() => useOrbBreathing(mockConfig));
    expect(result.current.time).toBeDefined();
    expect(result.current.breathingScale).toBeDefined();
    expect(result.current.pulseStyle).toBeDefined();
  });

  it('time の初期値は 0', () => {
    const { result } = renderHook(() => useOrbBreathing(mockConfig));
    expect(result.current.time.value).toBe(0);
  });

  it('breathingScale が SharedValue として存在する', () => {
    const { result } = renderHook(() => useOrbBreathing(mockConfig));
    // モックではwithTimingが即時解決するため scaleMax になるが、SharedValueとして存在することを確認
    expect(result.current.breathingScale).toHaveProperty('value');
  });

  it('AppState リスナーを登録する', () => {
    const { AppState } = require('react-native');
    renderHook(() => useOrbBreathing(mockConfig));
    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('アンマウント時に AppState リスナーを解除する', () => {
    const removeMock = jest.fn();
    const { AppState } = require('react-native');
    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: removeMock });
    const { unmount } = renderHook(() => useOrbBreathing(mockConfig));
    unmount();
    expect(removeMock).toHaveBeenCalled();
  });

  it('useFrameCallback を登録する', () => {
    const { useFrameCallback } = require('react-native-reanimated');
    renderHook(() => useOrbBreathing(mockConfig));
    expect(useFrameCallback).toHaveBeenCalled();
  });

  it('pulseStyle に transform が含まれる', () => {
    const { result } = renderHook(() => useOrbBreathing(mockConfig));
    expect(result.current.pulseStyle).toHaveProperty('transform');
  });
});
