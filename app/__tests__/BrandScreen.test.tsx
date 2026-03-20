import React from 'react';
import { render, act } from '@testing-library/react-native';

// Mock expo-haptics
// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock expo-linear-gradient
// Mock StarryBackground
jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children, ...props }: any) => (
      <View testID="starry-background" {...props}>{children}</View>
    ),
  };
});

// Mock userStore
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: null,
    hasHydrated: true,
  }),
}));

import * as Haptics from 'expo-haptics';
import { BrandScreen } from '../brand';
import { BRAND_CATCHPHRASE_KEYS, BRAND_TIMING_CONFIG, calculateBrandTimings } from '@/constants/brandConfig';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);

describe('BrandScreen（ブランド起動画面）', () => {
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

  describe('表示要素', () => {
    it('"Rewire" ロゴテキストが表示される', () => {
      const { getByText } = render(<BrandScreen />);
      expect(getByText('Rewire')).toBeTruthy();
    });

    it('アプリアイコン画像が表示される', () => {
      const { getByTestId } = render(<BrandScreen />);
      expect(getByTestId('brand-logo-image')).toBeTruthy();
    });

    it('キャッチフレーズの各行がtestIDで存在する', () => {
      const { getByTestId } = render(<BrandScreen />);
      BRAND_CATCHPHRASE_KEYS.forEach((_, index) => {
        expect(getByTestId(`catchphrase-line-${index}`)).toBeTruthy();
      });
    });

    it('キャッチフレーズが2行ある', () => {
      expect(BRAND_CATCHPHRASE_KEYS).toHaveLength(2);
    });
  });

  describe('ハプティクスフィードバック', () => {
    it('ロゴ表示時にMedium振動が発生する', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.logo + 50); });
      expect(Haptics.impactAsync).toHaveBeenCalledWith('Medium');
    });

    it('各キャッチフレーズ表示時に振動が発生する', () => {
      render(<BrandScreen />);
      // navigate 直前まで進める → ロゴ1回 + キャッチフレーズ2回 = 合計3回
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate - 1); });
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('ルーティング', () => {
    it('アニメーション完了後にルーティングが呼ばれる', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).toHaveBeenCalled();
    });

    it('ユーザーが未登録の場合、/onboardingに遷移する', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(TIMINGS.navigate); });
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });
});
