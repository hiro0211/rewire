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
  useUserStore: Object.assign(
    () => ({ user: mockUser }),
    { getState: () => ({ user: mockUser }) },
  ),
}));

import { BrandScreen } from '../brand';
import { BRAND_CATCHPHRASE_KEYS, BRAND_TIMING_CONFIG, calculateBrandTimings } from '@/constants/brandConfig';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);

describe('BrandScreen ルーティング分岐', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global as any).__DEV__ = false;
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).__DEV__ = originalDev;
  });

  it('ユーザーがnull → /onboarding', () => {
    mockUser = null;
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameが空文字 → /onboarding', () => {
    mockUser = { nickname: '' };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameがnull → /onboarding', () => {
    mockUser = { nickname: null };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('isPro=false → /paywall?source=returning', () => {
    mockUser = { nickname: 'Test', isPro: false };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/paywall', params: { source: 'returning' } });
  });

  it('isPro=undefined → /paywall?source=returning（falsy扱い）', () => {
    mockUser = { nickname: 'Test' };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/paywall', params: { source: 'returning' } });
  });

  it('isPro=true → /streak', () => {
    mockUser = { nickname: 'Test', isPro: true };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/streak');
  });

  it('レンダー後にisPro=trueに更新された場合、/streakへ遷移する', () => {
    mockUser = { nickname: 'Test', isPro: false };
    render(<BrandScreen />);
    // サブスクリプション同期がタイマー発火前に完了したシミュレーション
    mockUser = { nickname: 'Test', isPro: true };
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/streak');
  });
});
