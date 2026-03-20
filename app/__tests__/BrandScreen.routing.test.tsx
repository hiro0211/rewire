import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children, ...props }: any) => (
      <View testID="starry-background" {...props}>{children}</View>
    ),
  };
});

let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser }),
}));

import { BrandScreen } from '../brand';
import { BRAND_CATCHPHRASE_KEYS, BRAND_TIMING_CONFIG, calculateBrandTimings } from '@/constants/brandConfig';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);

describe('BrandScreen routing', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUser = null;
    (global as any).__DEV__ = false;
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).__DEV__ = originalDev;
  });

  it('user=nullの場合/onboardingに遷移する', () => {
    mockUser = null;
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nickname=nullの場合/onboardingに遷移する', () => {
    mockUser = { nickname: null, isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nickname未設定(空)の場合/onboardingに遷移する', () => {
    mockUser = { nickname: '', isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameあり+isPro=falseの場合/paywall?source=returningに遷移する', () => {
    mockUser = { nickname: 'TestUser', isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/paywall', params: { source: 'returning' } });
  });

  it('nicknameあり+isPro=trueの場合/streakに遷移する', () => {
    mockUser = { nickname: 'TestUser', isPro: true };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith('/streak');
  });

  it('2800ms前には遷移しない', () => {
    mockUser = null;
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate - 1); });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
