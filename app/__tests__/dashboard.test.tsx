import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react');
    useEffect(() => { cb(); }, []);
  },
}));

const mockLoadUser = jest.fn().mockResolvedValue(undefined);
let mockUser: any = {
  nickname: 'TestUser',
  goalDays: 30,
  streakStartDate: '2025-01-01',
  isPro: true,
  notifyEnabled: true,
  notifyTime: '22:00',
};

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    loadUser: mockLoadUser,
    updateUser: jest.fn(),
  }),
}));

const mockLoadCheckins = jest.fn().mockResolvedValue(undefined);
let mockTodayCheckin: any = null;
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    loadCheckins: mockLoadCheckins,
    todayCheckin: mockTodayCheckin,
    checkins: [],
  }),
}));

jest.mock('@/components/dashboard/StatsRow', () => {
  const { View, Text } = require('react-native');
  return { StatsRow: () => <View><Text>StatsRow</Text></View> };
});

jest.mock('@/components/dashboard/SOSButton', () => {
  const { View, Text } = require('react-native');
  return { SOSButton: () => <View><Text>SOSButton</Text></View> };
});

jest.mock('@/components/dashboard/QuickActionGrid', () => {
  const { View, Text } = require('react-native');
  return { QuickActionGrid: () => <View testID="quick-action-grid"><Text>QuickActionGrid</Text></View> };
});

jest.mock('@/components/dashboard/SegmentedStreakCard', () => {
  const { View, Text } = require('react-native');
  return { SegmentedStreakCard: () => <View><Text>SegmentedStreakCard</Text></View> };
});

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/hooks/dashboard/useShareWidget', () => ({
  useShareWidget: () => ({
    viewShotRef: { current: null },
    share: jest.fn(),
  }),
}));

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 0,
    stopwatch: { days: 7, hours: 0, minutes: 0, formatted: '7日0分' },
    goalDays: 30,
    streakStartDate: '2025-01-01',
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: any) => <Text>{name}</Text> };
});

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

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ja' }],
}));

import DashboardScreen from '../../app/(tabs)/index';

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      nickname: 'TestUser',
      goalDays: 30,
      streakStartDate: '2025-01-01',
      isPro: true,
      notifyEnabled: true,
      notifyTime: '22:00',
    };
    mockTodayCheckin = null;
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('挨拶テキストは表示されない（削除済み）', () => {
    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('おかえりなさい')).toBeNull();
  });

  it('StatsRowが表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('StatsRow')).toBeTruthy();
  });

  it('QuickActionGridが表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('QuickActionGrid')).toBeTruthy();
  });

  it('useFocusEffectでloadCheckinsとloadUserが呼ばれる', () => {
    render(<DashboardScreen />);
    expect(mockLoadCheckins).toHaveBeenCalled();
    expect(mockLoadUser).toHaveBeenCalled();
  });

  it('ユーザーがnullでもクラッシュしない', () => {
    mockUser = null;
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('ニックネームがundefinedでもクラッシュしない', () => {
    mockUser = { ...mockUser, nickname: undefined };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });
});
