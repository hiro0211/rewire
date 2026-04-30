import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      streakActive: '#8B5CF6',
      error: '#EF4444',
      borderGlass: 'rgba(255,255,255,0.22)',
      contrastText: '#FFFFFF',
      text: '#E8E8ED',
      textSecondary: '#9CA0B5',
    },
  }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  function IoniconsMock({ name, testID }: any) {
    return <Text testID={testID ?? `icon-${name}`}>{name}</Text>;
  }
  return IoniconsMock;
});

import { CalendarDayCell } from '../CalendarDayCell';

const baseDate = new Date('2026-04-15T12:00:00');

describe('CalendarDayCell', () => {
  it('clean 状態で紫の背景と checkmark アイコンを表示', () => {
    const { getByTestId } = render(
      <CalendarDayCell date={baseDate} status="clean" isToday={false} />
    );
    const cell = getByTestId('calendar-day-cell-clean');
    expect(cell).toBeTruthy();
    expect(getByTestId('icon-checkmark')).toBeTruthy();
  });

  it('relapse 状態で赤の背景と close アイコンを表示', () => {
    const { getByTestId } = render(
      <CalendarDayCell date={baseDate} status="relapse" isToday={false} />
    );
    expect(getByTestId('calendar-day-cell-relapse')).toBeTruthy();
    expect(getByTestId('icon-close')).toBeTruthy();
  });

  it('empty-no-data 状態で日付テキストを表示しアイコンなし', () => {
    const { getByTestId, queryByTestId } = render(
      <CalendarDayCell date={baseDate} status="empty-no-data" isToday={false} />
    );
    expect(getByTestId('calendar-day-cell-empty-no-data')).toBeTruthy();
    expect(queryByTestId('icon-checkmark')).toBeNull();
    expect(queryByTestId('icon-close')).toBeNull();
  });

  it('empty-pre-streak 状態でボーダーなし円とテキストを表示', () => {
    const { getByTestId, queryByTestId } = render(
      <CalendarDayCell date={baseDate} status="empty-pre-streak" isToday={false} />
    );
    expect(getByTestId('calendar-day-cell-empty-pre-streak')).toBeTruthy();
    expect(queryByTestId('icon-checkmark')).toBeNull();
  });

  it('empty-future 状態でテキストを薄く表示', () => {
    const { getByTestId } = render(
      <CalendarDayCell date={baseDate} status="empty-future" isToday={false} />
    );
    expect(getByTestId('calendar-day-cell-empty-future')).toBeTruthy();
  });

  it('isToday=true で本日リング testID を持つ', () => {
    const { getByTestId } = render(
      <CalendarDayCell date={baseDate} status="clean" isToday={true} />
    );
    expect(getByTestId('calendar-day-cell-today-ring')).toBeTruthy();
  });
});
