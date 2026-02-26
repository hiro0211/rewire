import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-picker" />,
  };
});

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: jest.fn(),
  },
}));

import DashboardScreen from '../index';

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('挨拶テキスト "おかえりなさい" が表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('おかえりなさい')).toBeTruthy();
  });

  it('StatsRow が表示される', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('stats-row')).toBeTruthy();
  });

  it('クイックアクション行が表示されない', () => {
    const { queryByTestId } = render(<DashboardScreen />);
    expect(queryByTestId('quick-actions-row')).toBeNull();
  });

  it('"今日の振り返り" セクションが表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('今日の振り返り')).toBeTruthy();
  });

  it('testID="motivational-quote" が存在する', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('motivational-quote')).toBeTruthy();
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

  it('"今日の結果を入力" ボタンで /checkin に遷移する', () => {
    const { getByText } = render(<DashboardScreen />);
    fireEvent.press(getByText('今日の結果を入力'));
    expect(mockPush).toHaveBeenCalledWith('/checkin');
  });

  it('ユーザーのnicknameが表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('TestUser')).toBeTruthy();
  });
});
