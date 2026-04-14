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

jest.mock('@/hooks/dashboard/useTimeBasedLayout', () => ({
  useTimeBasedLayout: () => ({
    sections: ['streak', 'quickActions', 'sos'],
    timeOfDay: 'morning',
  }),
}));

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

  it('QuickActionRowが表示される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('quick-action-row')).toBeTruthy();
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

  it('AuroraBackgroundが使用される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    // aurora-container or aurora-fallback (depends on Skia availability)
    const aurora = getByTestId('aurora-container') ?? getByTestId('aurora-fallback');
    expect(aurora).toBeTruthy();
  });
});
