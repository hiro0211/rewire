import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/components/ui/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children }: any) => (
      <View testID="starry-container">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/ShootingStars', () => {
  const { View } = require('react-native');
  return {
    ShootingStars: () => <View testID="shooting-stars-mock" />,
  };
});

let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: Object.assign(
    () => ({ user: mockUser }),
    { getState: () => ({ user: mockUser }) },
  ),
}));

jest.mock('@/stores/localeStore', () => {
  const state = { hasHydrated: true, localePreference: 'system' as const };
  return {
    useLocaleStore: Object.assign(
      (selector?: (s: typeof state) => unknown) =>
        selector ? selector(state) : state,
      { getState: () => ({ ...state, loadLocalePreference: jest.fn() }) },
    ),
  };
});

import { BrandScreen } from '../brand';
import { BRAND_CATCHPHRASE_KEYS, BRAND_TIMING_CONFIG, calculateBrandTimings } from '@/constants/brandConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePaywallStore } from '@/stores/paywallStore';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);

describe('BrandScreen routing', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUser = null;
    (global as any).__DEV__ = false;
    // 既存テストは「サブスク同期済み」の前提で paywall/tabs を期待している
    useSubscriptionStore.getState().markSynced();
    // 起動時ペイウォールのクールダウン未記録（＝表示する）を既定にする
    usePaywallStore.setState({ lastShownAt: null, hasHydrated: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).__DEV__ = originalDev;
    useSubscriptionStore.getState().reset();
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

  it('nicknameあり+isPro=trueの場合/(tabs)に遷移する', () => {
    mockUser = { nickname: 'TestUser', isPro: true };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('2800ms前には遷移しない', () => {
    mockUser = null;
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(TIMINGS.navigate - 1); });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
