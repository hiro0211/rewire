import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: 42, goal: 90, progress: 0.47 }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      cyan: '#00D4FF',
      background: '#0A0A0F',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return { AuroraBackground: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

jest.mock('@/components/ui/StarryOverlay', () => {
  const { View } = require('react-native');
  return { StarryOverlay: () => <View testID="starry-overlay" /> };
});

jest.mock('@/components/ui/GradientCard', () => {
  const { View } = require('react-native');
  return {
    GradientCard: ({ children }: { children: React.ReactNode }) => <View testID="gradient-card">{children}</View>,
  };
});

jest.mock('@/components/history/HistoryCalendar', () => {
  const { View } = require('react-native');
  return { HistoryCalendar: () => <View testID="history-calendar" /> };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import StreakCalendarScreen from '../streak-calendar';

describe('StreakCalendarScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('画面がレンダリングされる', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByTestId('streak-calendar-screen')).toBeTruthy();
  });

  it('ヘッダータイトルを表示する', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByText('Streak Calendar')).toBeTruthy();
  });

  it('現在のストリーク日数を表示する', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('CURRENT STREAKラベルを表示する', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByText('CURRENT STREAK')).toBeTruthy();
  });

  it('DAYSラベルを表示する', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByText('DAYS')).toBeTruthy();
  });

  it('HistoryCalendarを表示する', () => {
    render(<StreakCalendarScreen />);
    expect(screen.getByTestId('history-calendar')).toBeTruthy();
  });

  it('戻るボタンタップでrouter.back()を呼ぶ', () => {
    render(<StreakCalendarScreen />);
    fireEvent.press(screen.getByTestId('back-button'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
