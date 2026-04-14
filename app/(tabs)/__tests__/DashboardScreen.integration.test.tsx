import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// --- Router mock ---
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useFocusEffect: (cb: any) => {
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, []);
  },
}));

// --- Store mocks (controllable per-test) ---
const mockLoadUser = jest.fn().mockResolvedValue(undefined);
const mockUpdateUser = jest.fn();
let mockUser: any = {
  nickname: 'TestUser',
  goalDays: 90,
  streakStartDate: '2026-03-20T00:00:00Z',
  isPro: true,
};

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    loadUser: mockLoadUser,
    updateUser: mockUpdateUser,
  }),
}));

const mockLoadCheckins = jest.fn().mockResolvedValue(undefined);
let mockTodayCheckin: any = null;
let mockCheckins: any[] = [
  { date: '2026-03-21', watchedPorn: false, urgeLevel: 3, stressLevel: 2, qualityOfLife: 4 },
  { date: '2026-03-22', watchedPorn: true, urgeLevel: 5, stressLevel: 4, qualityOfLife: 2 },
  { date: '2026-03-23', watchedPorn: false, urgeLevel: 2, stressLevel: 1, qualityOfLife: 5 },
];

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    loadCheckins: mockLoadCheckins,
    todayCheckin: mockTodayCheckin,
    checkins: mockCheckins,
  }),
}));

// --- Analytics mock ---
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

// --- Survey/Review mocks ---
let mockShouldShowSurvey = false;
jest.mock('@/hooks/survey/useSurveyEligibility', () => ({
  useSurveyEligibility: () => ({ shouldShowSurvey: mockShouldShowSurvey }),
}));
jest.mock('@/hooks/survey/useSurveyPromptActions', () => ({
  useSurveyPromptActions: (onClose: () => void) => ({
    handleAccept: jest.fn(() => onClose()),
    handleDismiss: jest.fn(() => onClose()),
  }),
}));
jest.mock('@/components/survey/SurveyPromptModal', () => {
  const { View, Text } = require('react-native');
  return {
    SurveyPromptModal: ({ visible }: any) =>
      visible ? <View testID="survey-modal"><Text>SurveyModal</Text></View> : null,
  };
});

let mockShouldShowReview = false;
jest.mock('@/hooks/review/useReviewEligibility', () => ({
  useReviewEligibility: () => ({ shouldShowReview: mockShouldShowReview }),
}));
jest.mock('@/hooks/review/useReviewPromptActions', () => ({
  useReviewPromptActions: (onClose: () => void) => ({
    selectedRating: 0,
    showFeedback: false,
    handleRate: jest.fn(),
    handleFeedbackTap: jest.fn(),
    handleDismiss: jest.fn(() => onClose()),
  }),
}));
jest.mock('@/components/review/ReviewPromptModal', () => {
  const { View, Text } = require('react-native');
  return {
    ReviewPromptModal: ({ visible }: any) =>
      visible ? <View testID="review-modal"><Text>ReviewModal</Text></View> : null,
  };
});

// --- Native module mocks ---
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: any) => <Text>{name}</Text> };
});

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

// Share mock
jest.mock('@/hooks/dashboard/useShareWidget', () => ({
  useShareWidget: () => ({
    viewShotRef: { current: null },
    share: jest.fn(),
  }),
}));

import DashboardScreen from '../index';

describe('DashboardScreen 結合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      nickname: 'TestUser',
      goalDays: 90,
      streakStartDate: '2026-03-20T00:00:00Z',
      isPro: true,
    };
    mockTodayCheckin = null;
    mockCheckins = [
      { date: '2026-03-21', watchedPorn: false, urgeLevel: 3, stressLevel: 2, qualityOfLife: 4 },
      { date: '2026-03-22', watchedPorn: true, urgeLevel: 5, stressLevel: 4, qualityOfLife: 2 },
      { date: '2026-03-23', watchedPorn: false, urgeLevel: 2, stressLevel: 1, qualityOfLife: 5 },
    ];
    mockShouldShowSurvey = false;
    mockShouldShowReview = false;
  });

  // --- マウント時のデータロード ---
  describe('マウント時のデータロード', () => {
    it('useFocusEffectでloadCheckinsとloadUserが呼ばれる', () => {
      render(<DashboardScreen />);
      expect(mockLoadCheckins).toHaveBeenCalledTimes(1);
      expect(mockLoadUser).toHaveBeenCalledTimes(1);
    });
  });

  // --- コンポーネント表示 ---
  describe('コンポーネント表示', () => {
    it('StatsRow、QuickActionRow、SOSButtonが表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('stats-row')).toBeTruthy();
      expect(getByTestId('quick-action-row')).toBeTruthy();
      expect(getByTestId('panic-button')).toBeTruthy();
    });

    it('AuroraBackgroundが表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      // Skia mock returns aurora-container
      expect(getByTestId('aurora-container')).toBeTruthy();
    });

    it('挨拶テキストは表示されない', () => {
      const { queryByText } = render(<DashboardScreen />);
      expect(queryByText('おかえりなさい')).toBeNull();
    });

    it('AnimatedOrbが表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('animated-orb')).toBeTruthy();
    });

    it('GradientCard(hero)内にインライン統計が表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('stat-stopwatch')).toBeTruthy();
      expect(getByTestId('stat-relapse')).toBeTruthy();
      expect(getByTestId('stat-goal')).toBeTruthy();
    });

    it('SOSボタンタップで/panicに遷移する', () => {
      const { getByTestId } = render(<DashboardScreen />);
      fireEvent.press(getByTestId('panic-button'));
      expect(mockPush).toHaveBeenCalledWith('/panic');
    });
  });

  // --- ヘッダー ---
  describe('ヘッダー', () => {
    it('ユーザーがnullでもクラッシュしない', () => {
      mockUser = null;
      expect(() => render(<DashboardScreen />)).not.toThrow();
    });
  });

  // --- Pull-to-refresh ---
  describe('Pull-to-refresh', () => {
    it('RefreshControlが存在する', () => {
      const { UNSAFE_getByType } = render(<DashboardScreen />);
      const { RefreshControl } = require('react-native');
      expect(UNSAFE_getByType(RefreshControl)).toBeTruthy();
    });
  });

  // --- サーベイモーダル表示 ---
  describe('サーベイモーダル', () => {
    it('shouldShowSurvey=trueのときサーベイモーダルが表示される', () => {
      mockShouldShowSurvey = true;
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('survey-modal')).toBeTruthy();
    });

    it('shouldShowSurvey=falseのときサーベイモーダルは表示されない', () => {
      mockShouldShowSurvey = false;
      const { queryByTestId } = render(<DashboardScreen />);
      expect(queryByTestId('survey-modal')).toBeNull();
    });
  });

  // --- レビューモーダル表示 ---
  describe('レビューモーダル', () => {
    it('shouldShowReview=trueのときレビューモーダルが表示される', () => {
      mockShouldShowReview = true;
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('review-modal')).toBeTruthy();
    });

    it('shouldShowReview=falseのときレビューモーダルは表示されない', () => {
      mockShouldShowReview = false;
      const { queryByTestId } = render(<DashboardScreen />);
      expect(queryByTestId('review-modal')).toBeNull();
    });

    it('サーベイが優先されレビューは表示されない', () => {
      mockShouldShowSurvey = true;
      mockShouldShowReview = true;
      const { getByTestId, queryByTestId } = render(<DashboardScreen />);
      expect(getByTestId('survey-modal')).toBeTruthy();
      expect(queryByTestId('review-modal')).toBeNull();
    });
  });
});
