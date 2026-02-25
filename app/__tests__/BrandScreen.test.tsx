import React from 'react';
import { render, act } from '@testing-library/react-native';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} />,
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
import { BrandScreen, BRAND_CATCHPHRASES } from '../brand';

describe('BrandScreen（ブランド起動画面）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('表示要素', () => {
    it('"Rewire" ロゴテキストが表示される', () => {
      const { getByText } = render(<BrandScreen />);
      expect(getByText('Rewire')).toBeTruthy();
    });

    it('3行のキャッチフレーズテキストが存在する', () => {
      const { getByText } = render(<BrandScreen />);
      BRAND_CATCHPHRASES.forEach((phrase) => {
        expect(getByText(phrase)).toBeTruthy();
      });
    });

    it('キャッチフレーズが3行ある', () => {
      expect(BRAND_CATCHPHRASES).toHaveLength(3);
    });
  });

  describe('ハプティクスフィードバック', () => {
    it('ロゴ表示時にMedium振動が発生する', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(350); });
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('各キャッチフレーズ表示時に振動が発生する', () => {
      render(<BrandScreen />);
      // ロゴ (300ms) + 3行のキャッチフレーズ (900, 1500, 2100ms)
      act(() => { jest.advanceTimersByTime(2200); });
      // ロゴ1回 + キャッチフレーズ3回 = 合計4回
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(4);
    });
  });

  describe('ルーティング', () => {
    it('アニメーション完了後にルーティングが呼ばれる', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(3000); });
      expect(mockReplace).toHaveBeenCalled();
    });

    it('ユーザーが未登録の場合、/onboardingに遷移する', () => {
      render(<BrandScreen />);
      act(() => { jest.advanceTimersByTime(3000); });
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });
});
