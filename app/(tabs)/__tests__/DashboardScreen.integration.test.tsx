import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

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

// --- Time-based layout mock (controllable) ---
let mockSections: string[] = ['streak', 'checkin', 'sos'];
let mockTimeOfDay = 'afternoon';
jest.mock('@/hooks/dashboard/useTimeBasedLayout', () => ({
  useTimeBasedLayout: () => ({
    sections: mockSections,
    timeOfDay: mockTimeOfDay,
  }),
}));

// --- Native module mocks ---
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: any) => <Text>{name}</Text> };
});

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return { SafeAreaWrapper: ({ children, style }: any) => <View style={style}>{children}</View> };
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
    mockSections = ['streak', 'checkin', 'sos'];
    mockTimeOfDay = 'afternoon';
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

  // --- 時間帯によるセクション順序 ---
  describe('時間帯によるセクション順序', () => {
    it('午前中はcheckinセクションが最初に表示される', () => {
      mockSections = ['checkin', 'streak', 'sos'];
      mockTimeOfDay = 'morning';
      const { getByText } = render(<DashboardScreen />);
      // checkin section: 「今日の振り返り」が表示される
      expect(getByText('今日の振り返り')).toBeTruthy();
      // stats-row (streak section) も表示される
      expect(getByText('現在の記録')).toBeTruthy();
    });

    it('深夜はSOSとストリークのみ表示される', () => {
      mockSections = ['sos', 'streak'];
      mockTimeOfDay = 'night';
      const { getByTestId, queryByText } = render(<DashboardScreen />);
      // SOS button is present
      expect(getByTestId('panic-button')).toBeTruthy();
      // streak section is present
      expect(getByTestId('stats-row')).toBeTruthy();
      // checkin section is not rendered
      expect(queryByText('今日の振り返り')).toBeNull();
    });
  });

  // --- StatsRow + SOSButton 連携 ---
  describe('コンポーネント連携表示', () => {
    it('全セクションが連携して表示される', () => {
      mockSections = ['streak', 'checkin', 'sos'];
      const { getByTestId, getByText } = render(<DashboardScreen />);
      // StatsRow (streak)
      expect(getByTestId('stats-row')).toBeTruthy();
      expect(getByTestId('stat-stopwatch')).toBeTruthy();
      // SOSButton
      expect(getByTestId('panic-button')).toBeTruthy();
      // Checkin section
      expect(getByText('今日の振り返り')).toBeTruthy();
    });

    it('StatsRowにリラプス回数が表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      const relapseView = getByTestId('stat-relapse');
      // mockCheckins has 1 relapse (watchedPorn: true)
      expect(relapseView).toBeTruthy();
    });

    it('StatsRowにゴール日数が表示される', () => {
      const { getByTestId } = render(<DashboardScreen />);
      expect(getByTestId('stat-goal')).toBeTruthy();
    });

    it('SOSボタンタップで/breathingに遷移する', () => {
      const { getByTestId } = render(<DashboardScreen />);
      fireEvent.press(getByTestId('panic-button'));
      expect(mockPush).toHaveBeenCalledWith('/breathing');
    });
  });

  // --- チェックイン未完了フロー ---
  describe('チェックイン未完了フロー', () => {
    it('「今日の結果を入力」ボタンが表示される', () => {
      mockTodayCheckin = null;
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('今日の結果を入力')).toBeTruthy();
    });

    it('「今日の結果を入力」タップで/checkinに遷移する', () => {
      mockTodayCheckin = null;
      const { getByText } = render(<DashboardScreen />);
      fireEvent.press(getByText('今日の結果を入力'));
      expect(mockPush).toHaveBeenCalledWith('/checkin');
    });
  });

  // --- チェックイン完了フロー ---
  describe('チェックイン完了フロー', () => {
    beforeEach(() => {
      mockTodayCheckin = {
        id: '1',
        userId: 'u1',
        date: '2026-03-25',
        watchedPorn: false,
        urgeLevel: 2,
        stressLevel: 2,
        qualityOfLife: 4,
        memo: '',
        createdAt: '2026-03-25T08:00:00Z',
      };
    });

    it('完了テキストが表示される', () => {
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('完了済み')).toBeTruthy();
    });

    it('「やり直す」ボタンが表示される', () => {
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('やり直す')).toBeTruthy();
    });

    it('「やり直す」タップで/checkinに遷移する', () => {
      const { getByText } = render(<DashboardScreen />);
      fireEvent.press(getByText('やり直す'));
      expect(mockPush).toHaveBeenCalledWith('/checkin');
    });

    it('「今日の結果を入力」ボタンは表示されない', () => {
      const { queryByText } = render(<DashboardScreen />);
      expect(queryByText('今日の結果を入力')).toBeNull();
    });
  });

  // --- ヘッダー表示 ---
  describe('ヘッダー表示', () => {
    it('挨拶テキストとニックネームが表示される', () => {
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('おかえりなさい')).toBeTruthy();
      expect(getByText('TestUser')).toBeTruthy();
    });

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
