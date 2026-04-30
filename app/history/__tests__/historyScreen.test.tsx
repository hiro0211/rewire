import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  Stack: { Screen: () => null },
}));

const mockLoadCheckins = jest.fn();
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: (selector?: any) => {
    const state = { loadCheckins: mockLoadCheckins, checkins: [] };
    return selector ? selector(state) : state;
  },
}));

const mockUpdateStreakStart = jest.fn();
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { streakStartDate: '2026-04-01' },
    updateStreakStart: mockUpdateStreakStart,
  }),
}));

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return { SafeAreaWrapper: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/components/ui/GlassCard', () => {
  const { View } = require('react-native');
  return { GlassCard: ({ children }: any) => <View testID="glass-card">{children}</View> };
});

jest.mock('@/components/history/HistoryCalendar', () => {
  const { View } = require('react-native');
  return { HistoryCalendar: () => <View testID="history-calendar" /> };
});

jest.mock('@/components/history/CalendarLegend', () => {
  const { View } = require('react-native');
  return { CalendarLegend: () => <View testID="calendar-legend" /> };
});

jest.mock('@/components/history/StreakCalendarHeader', () => {
  const { View, Pressable } = require('react-native');
  return {
    StreakCalendarHeader: ({ onBack, onEdit }: any) => (
      <View testID="streak-calendar-header">
        <Pressable testID="header-back" onPress={onBack} />
        <Pressable testID="header-edit" onPress={onEdit} />
      </View>
    ),
  };
});

jest.mock('@/components/dashboard/StreakEditModal', () => {
  const { View, Text } = require('react-native');
  return {
    StreakEditModal: ({ visible }: any) =>
      visible ? <View testID="streak-edit-modal"><Text>edit-modal</Text></View> : null,
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { background: '#000' } }),
}));

import HistoryScreen from '../index';

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('カレンダーと凡例が表示される', () => {
    const { getByTestId } = render(<HistoryScreen />);
    expect(getByTestId('history-calendar')).toBeTruthy();
    expect(getByTestId('calendar-legend')).toBeTruthy();
  });

  it('マウント時に loadCheckins が呼ばれる', () => {
    render(<HistoryScreen />);
    expect(mockLoadCheckins).toHaveBeenCalled();
  });

  it('Back タップで router.back() が呼ばれる', () => {
    const { getByTestId } = render(<HistoryScreen />);
    fireEvent.press(getByTestId('header-back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('Edit タップで StreakEditModal が開く', () => {
    const { getByTestId, queryByTestId } = render(<HistoryScreen />);
    expect(queryByTestId('streak-edit-modal')).toBeNull();
    fireEvent.press(getByTestId('header-edit'));
    expect(getByTestId('streak-edit-modal')).toBeTruthy();
  });
});
