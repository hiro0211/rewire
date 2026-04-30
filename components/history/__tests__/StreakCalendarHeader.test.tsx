import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.22)',
    },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'calendar.streakCalendarTitle': 'Streak Calendar',
        'calendar.edit': 'Edit',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  function IoniconsMock({ name }: any) {
    return <Text testID={`icon-${name}`}>{name}</Text>;
  }
  return IoniconsMock;
});

import { StreakCalendarHeader } from '../StreakCalendarHeader';

describe('StreakCalendarHeader', () => {
  it('Back / タイトル / Edit を表示し、それぞれのコールバックが呼ばれる', () => {
    const onBack = jest.fn();
    const onEdit = jest.fn();
    const { getByTestId, getByText } = render(
      <StreakCalendarHeader onBack={onBack} onEdit={onEdit} />
    );
    expect(getByText('Streak Calendar')).toBeTruthy();
    expect(getByText('Edit')).toBeTruthy();

    fireEvent.press(getByTestId('streak-calendar-back'));
    fireEvent.press(getByTestId('streak-calendar-edit'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
