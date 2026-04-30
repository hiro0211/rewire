import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockUseStreak = jest.fn(() => ({ streakStartDate: '2026-04-01' }));
jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => mockUseStreak(),
}));

const mockCheckins: any[] = [];
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: (selector?: any) => {
    const state = { checkins: mockCheckins };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/components/history/CalendarHeader', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    CalendarHeader: ({ month, onPrev, onNext }: any) => (
      <View testID="calendar-header">
        <Text testID="month-label">{month.getFullYear()}-{month.getMonth() + 1}</Text>
        <Pressable testID="header-prev" onPress={onPrev} />
        <Pressable testID="header-next" onPress={onNext} />
      </View>
    ),
  };
});

jest.mock('@/components/history/CalendarWeekDays', () => {
  const { View } = require('react-native');
  return { CalendarWeekDays: () => <View testID="weekdays" /> };
});

jest.mock('@/components/history/CalendarDayCell', () => {
  const { View } = require('react-native');
  return {
    CalendarDayCell: ({ status, isToday }: any) => (
      <View testID={`day-cell-${status}${isToday ? '-today' : ''}`} />
    ),
  };
});

import { HistoryCalendar } from '../HistoryCalendar';

describe('HistoryCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-15T12:00:00'));
    mockCheckins.length = 0;
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('当月のセルをレンダリングする', () => {
    const { getAllByTestId, getByTestId } = render(<HistoryCalendar />);
    expect(getByTestId('weekdays')).toBeTruthy();
    // 4月は30日 + 月初までの空セル + 月末以降の空セル
    const allCells = getAllByTestId(/day-cell-/);
    expect(allCells.length).toBeGreaterThanOrEqual(30);
  });

  it('前月ボタンで月が戻る', () => {
    const { getByTestId } = render(<HistoryCalendar />);
    fireEvent.press(getByTestId('header-prev'));
    expect(getByTestId('month-label').props.children).toEqual([2026, '-', 3]);
  });

  it('次月ボタンで月が進む', () => {
    const { getByTestId } = render(<HistoryCalendar />);
    fireEvent.press(getByTestId('header-next'));
    expect(getByTestId('month-label').props.children).toEqual([2026, '-', 5]);
  });

  it('本日のセルに today マークが付く', () => {
    const { getByTestId } = render(<HistoryCalendar />);
    expect(getByTestId('day-cell-empty-no-data-today')).toBeTruthy();
  });
});
