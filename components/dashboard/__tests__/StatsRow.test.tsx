import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StatsRow } from '../StatsRow';

const mockUpdateUser = jest.fn();

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 2,
    stopwatch: { days: 2, hours: 15, minutes: 31, formatted: '2日15時間31分' },
    goalDays: 90,
    streakStartDate: '2026-02-24T19:00:00Z',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    updateUser: mockUpdateUser,
  }),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="date-picker"
        {...props}
        onChange={(e: any) =>
          props.onChange?.(e, props.value || new Date('2026-02-24'))
        }
      />
    ),
  };
});

describe('StatsRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ヒーローカードとインライン統計が表示される', () => {
    const { getByTestId } = render(<StatsRow />);
    expect(getByTestId('stat-stopwatch')).toBeTruthy();
    expect(getByTestId('stat-relapse')).toBeTruthy();
    expect(getByTestId('stat-goal')).toBeTruthy();
  });

  it('ヒーローカードに現在の記録とストップウォッチが表示される', () => {
    const { getByText } = render(<StatsRow />);
    expect(getByText('現在の記録')).toBeTruthy();
    expect(getByText('2日15時間31分')).toBeTruthy();
  });

  it('ヒーローカードに開始日が表示される', () => {
    const { getByText } = render(<StatsRow />);
    expect(getByText(/から$/)).toBeTruthy();
  });

  it('リセット回数が表示される', () => {
    const { getByText } = render(<StatsRow />);
    expect(getByText('リセット回数')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    const { getByText } = render(<StatsRow />);
    expect(getByText('目標日数')).toBeTruthy();
    expect(getByText('90日')).toBeTruthy();
  });

  it('GlowDivider が表示される', () => {
    const { getByTestId } = render(<StatsRow />);
    expect(getByTestId('glow-divider')).toBeTruthy();
  });

  it('ヒーローカード長押しでStreakEditModalが表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow />);
    fireEvent(getByTestId('hero-card-touch'), 'onLongPress');
    expect(getByText('開始日を編集')).toBeTruthy();
  });
});
