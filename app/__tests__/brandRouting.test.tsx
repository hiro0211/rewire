import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children }: any) => (
      <View testID="starry-container">{children}</View>
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

import { BrandScreen, BRAND_HARD_TIMEOUT_MS } from '../brand';
import { BRAND_CATCHPHRASE_KEYS, BRAND_TIMING_CONFIG, calculateBrandTimings } from '@/constants/brandConfig';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);

describe('BrandScreen ルーティング分岐', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global as any).__DEV__ = false;
    // デフォルトで subscriptionSynced=true にして既存テストの期待値を維持
    useSubscriptionStore.getState().markSynced();
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).__DEV__ = originalDev;
    useSubscriptionStore.getState().reset();
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

  it('isPro=true → /(tabs)（ダッシュボードへ直接遷移）', () => {
    mockUser = { nickname: 'Test', isPro: true };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('レンダー後にisPro=trueに更新された場合、/(tabs)へ遷移する', () => {
    mockUser = { nickname: 'Test', isPro: false };
    render(<BrandScreen />);
    // サブスクリプション同期がタイマー発火前に完了したシミュレーション
    mockUser = { nickname: 'Test', isPro: true };
    act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  describe('subscriptionSynced 待機ロジック', () => {
    it('未 synced で isPro=false の場合、アニメーション終了時点では遷移しない', () => {
      useSubscriptionStore.getState().reset();
      mockUser = { nickname: 'Test', isPro: false };
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('未 synced で isPro=true の場合、アニメーション終了で即 /(tabs) へ遷移する', () => {
      useSubscriptionStore.getState().reset();
      mockUser = { nickname: 'Test', isPro: true };
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('未 synced で nickname なしの場合、アニメーション終了で /onboarding に遷移する', () => {
      useSubscriptionStore.getState().reset();
      mockUser = null;
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });

    it('アニメーション終了後、subscriptionSynced=true に切り替わったら /paywall に遷移する', () => {
      useSubscriptionStore.getState().reset();
      mockUser = { nickname: 'Test', isPro: false };
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).not.toHaveBeenCalled();
      act(() => { useSubscriptionStore.getState().markSynced(); });
      expect(mockReplace).toHaveBeenCalledWith({ pathname: '/paywall', params: { source: 'returning' } });
    });

    it('subscriptionSynced=true 前に isPro=true に更新されたら /paywall ではなく /(tabs) に遷移する', () => {
      useSubscriptionStore.getState().reset();
      mockUser = { nickname: 'Test', isPro: false };
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      mockUser = { nickname: 'Test', isPro: true };
      act(() => { useSubscriptionStore.getState().markSynced(); });
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('ハードタイムアウトまでに synced にならない場合、/(tabs) にフォールバックする（ペイウォールではない）', () => {
      useSubscriptionStore.getState().reset();
      mockUser = { nickname: 'Test', isPro: false };
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(BRAND_HARD_TIMEOUT_MS); });
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
      expect(mockReplace).not.toHaveBeenCalledWith({ pathname: '/paywall', params: { source: 'returning' } });
    });

    it('ハードタイムアウト後に nickname なしなら /onboarding にフォールバック', () => {
      useSubscriptionStore.getState().reset();
      mockUser = null;
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(BRAND_HARD_TIMEOUT_MS); });
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });
});
