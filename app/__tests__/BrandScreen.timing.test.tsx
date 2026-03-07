import React from 'react';
import { render, act } from '@testing-library/react-native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children, ...props }: any) => (
      <View testID="starry-background" {...props}>{children}</View>
    ),
  };
});

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: null }),
}));

import * as Haptics from 'expo-haptics';
import { BrandScreen } from '../brand';
import {
  BRAND_CATCHPHRASES,
  BRAND_TIMING_CONFIG,
  calculateBrandTimings,
} from '@/constants/brandConfig';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASES.length);

describe('BrandScreen タイミング保証', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigate 前に全てのキャッチフレーズのハプティクスが発火している', () => {
    render(<BrandScreen />);

    // navigate の1ms前まで進める
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate - 1); });

    // ロゴ(1回) + 全キャッチフレーズ(2回) = 3回
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);

    // まだ遷移していない
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('navigate 時に画面遷移が発生する', () => {
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalled();
  });

  it('各行が正しい順序でハプティクスを発火する', () => {
    render(<BrandScreen />);

    // ロゴ表示 (300ms)
    act(() => { jest.advanceTimersByTime(TIMINGS.logo + 1); });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);

    // 1行目 (1000ms)
    act(() => { jest.advanceTimersByTime(TIMINGS.lines[0] - TIMINGS.logo); });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);

    // 2行目 (1800ms)
    act(() => { jest.advanceTimersByTime(TIMINGS.lines[1] - TIMINGS.lines[0]); });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
  });

  it('navigate が最終行よりも後に発生する（構造的バグ防止）', () => {
    const lastLine = TIMINGS.lines[TIMINGS.lines.length - 1];
    expect(TIMINGS.navigate).toBeGreaterThan(lastLine);
  });
});
