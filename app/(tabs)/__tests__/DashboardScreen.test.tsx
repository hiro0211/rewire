import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { nickname: 'TestUser', goalDays: 30, streakStartDate: '2026-02-17T00:00:00Z' },
    loadUser: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    loadCheckins: jest.fn(),
    todayCheckin: null,
    checkins: [],
  }),
}));

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 0,
    stopwatch: { days: 7, hours: 0, minutes: 0, formatted: '7日0分' },
    goalDays: 30,
    streakStartDate: '2026-02-17T00:00:00Z',
  }),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: jest.fn(),
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja' }],
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/hooks/dashboard/useShareWidget', () => ({
  useShareWidget: () => ({
    viewShotRef: { current: null },
    share: jest.fn(),
  }),
}));

jest.mock('@/hooks/survey/useSurveyEligibility', () => ({
  useSurveyEligibility: () => ({ shouldShowSurvey: false }),
}));
jest.mock('@/hooks/survey/useSurveyPromptActions', () => ({
  useSurveyPromptActions: () => ({
    handleAccept: jest.fn(),
    handleDismiss: jest.fn(),
  }),
}));
jest.mock('@/components/survey/SurveyPromptModal', () => {
  const { View } = require('react-native');
  return { SurveyPromptModal: () => <View /> };
});
jest.mock('@/hooks/review/useReviewEligibility', () => ({
  useReviewEligibility: () => ({ shouldShowReview: false }),
}));
jest.mock('@/hooks/review/useReviewPromptActions', () => ({
  useReviewPromptActions: () => ({
    selectedRating: 0,
    showFeedback: false,
    handleRate: jest.fn(),
    handleFeedbackTap: jest.fn(),
    handleDismiss: jest.fn(),
  }),
}));
jest.mock('@/components/review/ReviewPromptModal', () => {
  const { View } = require('react-native');
  return { ReviewPromptModal: () => <View /> };
});

import DashboardScreen from '../index';

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('挨拶テキストは表示されない（削除済み）', () => {
    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('おかえりなさい')).toBeNull();
  });

  it('StatsRow が表示される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('stats-row')).toBeTruthy();
  });

  it('QuickActionGridが表示される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('quick-action-grid')).toBeTruthy();
  });

  it('testID="panic-button" が存在する', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('panic-button')).toBeTruthy();
  });

  it('RefreshControlが存在する', () => {
    const { UNSAFE_getByType } = render(<DashboardScreen />);
    const { RefreshControl } = require('react-native');
    expect(UNSAFE_getByType(RefreshControl)).toBeTruthy();
  });

  it('SafeAreaWrapperが背景として使用される', () => {
    const { queryByTestId } = render(<DashboardScreen />);
    // AuroraBackground は使用されない
    expect(queryByTestId('aurora-container')).toBeNull();
    expect(queryByTestId('aurora-fallback')).toBeNull();
    // StarryOverlay も使用されない
    expect(queryByTestId('starry-overlay')).toBeNull();
  });

  it('SegmentedStreakCardが表示される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('segmented-streak-card')).toBeTruthy();
  });

  it('BrainRewiringBarは表示されない（削除済み）', () => {
    const { queryByTestId } = render(<DashboardScreen />);
    expect(queryByTestId('brain-rewiring-bar')).toBeNull();
  });

  it('シェアボタンは非表示（コメントアウト済み）', () => {
    const { queryByTestId } = render(<DashboardScreen />);
    expect(queryByTestId('share-button')).toBeNull();
  });

  it('share-capture-area が存在する', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('share-capture-area')).toBeTruthy();
  });
});
